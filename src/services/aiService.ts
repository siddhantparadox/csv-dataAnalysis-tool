import axios from "axios";

const API_URL = "http://localhost:3001/api/ai-insights";

export const getDataInsights = async (data: any[], analysisResults: string) => {
  try {
    const response = await axios.post(API_URL, {
      model: "claude-3-haiku-20240307",
      messages: [
        {
          role: "user",
          content: `As a data analyst, provide insights on the following dataset and analysis results. 
          Dataset sample (first 5 rows): ${JSON.stringify(data.slice(0, 5))}. 
          Analysis results: ${analysisResults}. 
          Please provide the following:
          1. 3-5 key insights about this data
          2. Potential correlations between variables
          3. Any anomalies or outliers you notice
          4. Interesting patterns or trends
          5. Suggestions for additional analyses that might be valuable
          6. Potential business implications of these findings
          7. Data quality assessment
          8. Recommendations for data visualization
          9. Suggestions for feature engineering or new calculated columns
          10. Potential hypotheses to test with this data
          Please format your response in markdown for easy readability.`,
        },
      ],
      max_tokens: 2000,
    });

    return response.data.content[0].text;
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return "Error fetching AI insights. Please try again later.";
  }
};

export const getCustomAnalysis = async (data: any[], question: string) => {
  try {
    const response = await axios.post(API_URL, {
      model: "claude-3-haiku-20240307",
      messages: [
        {
          role: "user",
          content: `As a data analyst, answer the following question about this dataset. 
          Dataset sample (first 5 rows): ${JSON.stringify(data.slice(0, 5))}. 
          Question: ${question}
          Please provide a detailed analysis and answer, including any relevant calculations or statistical tests. Format your response in markdown.`,
        },
      ],
      max_tokens: 1500,
    });

    return response.data.content[0].text;
  } catch (error) {
    console.error("Error fetching custom analysis:", error);
    return "Error performing custom analysis. Please try again later.";
  }
};
