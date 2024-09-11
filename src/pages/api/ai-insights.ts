import { NextApiRequest, NextApiResponse } from 'next';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEmbedding = async (text: string) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Limit input to 8000 characters
  });
  return response.data[0].embedding;
};

const extractJSONFromMarkdown = (markdown: string): string => {
  const jsonMatch = markdown.match(/```json\n([\s\S]*?)\n```/);
  return jsonMatch ? jsonMatch[1] : markdown;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { action, dataSummary, chunkData, chunkIndex, totalChunks, totalRows, processedRows, question, questionEmbedding, model } = body;

  try {
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    console.log("Received action:", action); // Log the action

    switch (action) {
      case 'generateEmbedding':
        const embedding = await generateEmbedding(body.text);
        res.status(200).json({ embedding });
        break;

      case 'storeChunk':
        const chunkEmbedding = await generateEmbedding(JSON.stringify(chunkData));
        const metadata = {
          chunkIndex,
          totalChunks,
          chunkDataSummary: JSON.stringify(summarizeChunkData(chunkData))
        };
        await index.upsert([{
          id: `chunk_${chunkIndex}`,
          values: chunkEmbedding,
          metadata
        }]);
        console.log(`Stored chunk ${chunkIndex} of ${totalChunks}`);
        res.status(200).json({ message: "Chunk stored successfully" });
        break;

      case 'queryAndGenerateInsights':
        console.log("Generating insights for question:", question);
        const queryResponse = await index.query({
          vector: questionEmbedding,
          topK: 5,
          includeMetadata: true,
        });

        console.log("Query response:", JSON.stringify(queryResponse, null, 2));

        const relevantChunks = queryResponse.matches
          .filter(match => match.metadata && match.metadata.chunkDataSummary)
          .map(match => {
            try {
              // Add a null check for match.metadata
              return match.metadata ? JSON.parse(match.metadata.chunkDataSummary as string) : null;
            } catch (error) {
              console.error("Error parsing chunkDataSummary:", error);
              return null;
            }
          })
          .filter(chunk => chunk !== null);

        console.log("Relevant chunks:", JSON.stringify(relevantChunks, null, 2));

        if (relevantChunks.length === 0) {
          console.warn("No relevant chunks found");
          res.status(200).json({ insights: JSON.stringify({
            answer: "I'm sorry, but I couldn't find any relevant information to answer your question based on the available data.",
            methodology: "No analysis performed due to lack of relevant data.",
            confidenceLevel: 0,
            dataQualityIssues: ["No relevant data found for the given question."],
            suggestedQuestions: [],
            anomalies: [],
            keyMetrics: {},
            trendAnalysis: "",
            actionItems: [],
            dataSourceBreakdown: {}
          })});
          return;
        }

        const promptContent = `
          Analyze the following data to answer the user's question comprehensively.
          Focus on providing accurate and valuable insights that directly address the question.

          User's Question: ${question}

          Total rows in entire dataset: ${totalRows}
          Rows processed for analysis: ${processedRows}

          Data Summary:
          ${JSON.stringify(dataSummary, null, 2)}

          Relevant Data Chunks:
          ${JSON.stringify(relevantChunks, null, 2)}

          Provide a focused and detailed answer to the user's question based on the available data.
          Include the following in your response:

          1. Executive Summary: A comprehensive overview of the key findings (4-5 sentences). This should include:
             - A direct answer to the user's question
             - The most significant insights derived from the data
             - Any notable trends or patterns observed
             - Potential implications of these findings

          2. Key Metrics: Identify and explain 3-4 crucial metrics related to the question. For each metric, provide:
             - The metric name
             - Its numerical value
             - A brief explanation of its significance in the context of the question

          3. Main Insights: Provide 3-4 primary insights that directly answer the question. Each insight should:
             - Be supported by specific data points
             - Explain its relevance to the user's question
             - Highlight any unexpected or particularly interesting aspects

          4. Action Items: Suggest 3-4 specific, data-driven recommendations. Each action item should:
             - Be directly tied to the insights or metrics presented
             - Be actionable and specific
             - Explain the potential impact of implementing the recommendation

          5. Limitations: Briefly mention any major limitations or caveats (2-3 points). This may include:
             - Data quality issues
             - Sampling limitations
             - Potential biases in the analysis
             - Areas where more data or research might be needed

          Format your response as a JSON object with the following structure:
          {
            "executiveSummary": "Detailed overview of key findings",
            "keyMetrics": {
              "Metric 1": { "value": "Value 1", "description": "Explanation of significance" },
              "Metric 2": { "value": "Value 2", "description": "Explanation of significance" },
              "Metric 3": { "value": "Value 3", "description": "Explanation of significance" }
            },
            "mainInsights": [
              "Detailed primary insight 1",
              "Detailed primary insight 2",
              "Detailed primary insight 3",
              "Detailed primary insight 4"
            ],
            "actionItems": [
              "Specific recommendation 1",
              "Specific recommendation 2",
              "Specific recommendation 3",
              "Specific recommendation 4"
            ],
            "limitations": [
              "Major limitation or caveat 1",
              "Major limitation or caveat 2",
              "Major limitation or caveat 3"
            ]
          }

          Ensure your response is comprehensive, data-driven, and directly addresses the user's question.
          If certain parts of the question cannot be answered with the available data, clearly state that and explain why.
        `;

        const completion = await openai.chat.completions.create({
          model: model || 'gpt-4o-2024-08-06',
          messages: [
            { role: "system", content: "You are a data analysis assistant. Provide comprehensive insights based on the given data to answer the user's question. Format your response as specified in the prompt, ensuring it's valid JSON without any markdown formatting." },
            { role: "user", content: promptContent },
          ],
          max_tokens: 16000, // Increased from 4000 to 16000
        });
        
        const generatedInsights = completion.choices[0].message.content;
        console.log("Generated insights:", generatedInsights);
        
        // Extract JSON from markdown if present, then attempt to parse
        const extractedJSON = extractJSONFromMarkdown(generatedInsights);
        console.log("Extracted JSON:", extractedJSON);

        try {
          const parsedInsights = JSON.parse(extractedJSON);
          res.status(200).json({ insights: JSON.stringify(parsedInsights) });
        } catch (parseError) {
          console.error("Error parsing AI response as JSON:", parseError);
          // If parsing fails, format the response manually
          const formattedResponse = {
            questionAnalysis: "Unable to parse response",
            executiveSummary: "Unable to parse response",
            detailedAnswer: extractedJSON, // Use the extracted content even if it's not valid JSON
            methodology: "N/A",
            keyMetrics: {},
            trendAnalysis: "Unable to parse response",
            dataQualityAssessment: ["Unable to parse response"],
            anomaliesAndOutliers: ["Unable to parse response"],
            comparativeAnalysis: "Unable to parse response",
            actionableInsights: ["Unable to parse response"],
            dataSourceBreakdown: {},
            limitationsAndCaveats: ["Unable to parse response"],
            furtherAnalysisSuggestions: ["Unable to parse response"],
            confidenceAssessment: { level: 0, explanation: "Unable to parse response" },
            visualRepresentationSuggestions: ["Unable to parse response"]
          };
          res.status(200).json({ insights: JSON.stringify(formattedResponse) });
        }
        break;

      default:
        res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Error in AI insights API:", error);
    res.status(500).json({ error: "An error occurred while processing the request" });
  }
}

function summarizeChunkData(chunkData: any[]): any {
  // Implement a function to create a summary of the chunk data
  // This could include things like the number of rows, column names, and basic statistics
  // The exact implementation will depend on your data structure and requirements
  return {
    rowCount: chunkData.length,
    columns: Object.keys(chunkData[0]),
    // Add other summary information as needed
  };
}