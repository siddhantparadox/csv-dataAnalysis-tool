import axios from "axios";

const API_URL = "/api/ai-insights"; // Change this to a relative URL
const MAX_TOKENS = 8000; // Adjusted to match the model's limit
const CHUNK_SIZE = 100; // Reduced chunk size
const EMBEDDING_CHUNK_SIZE = 100; // Reduced embedding chunk size
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const CHUNK_PROCESSING_DELAY = 60000; // 1 minute delay between chunks
const MAX_CHUNKS = 50; // Limit the number of chunks to process

const summarizeData = (data: any[]) => {
  const summary: any = {};
  const columns = Object.keys(data[0]);

  columns.forEach(column => {
    const values = data.map(row => row[column]);
    const numericValues = values.filter(v => typeof v === 'number');

    summary[column] = {
      type: typeof values[0],
      uniqueValues: new Set(values).size,
      sampleValues: values.slice(0, 5),
      ...(numericValues.length > 0 && {
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
      })
    };
  });

  return summary;
};

const getRandomSample = (data: any[], sampleSize: number) => {
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
};

const chunkData = (data: any[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn: () => Promise<any>, retries: number = MAX_RETRIES, delay: number = INITIAL_RETRY_DELAY) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

const truncateJSON = (obj: any, maxDepth: number = 2, currentDepth: number = 0): any => {
  if (currentDepth >= maxDepth) return typeof obj === 'object' ? '[Object]' : obj;
  if (Array.isArray(obj)) {
    return obj.slice(0, 10).map(item => truncateJSON(item, maxDepth, currentDepth + 1));
  }
  if (typeof obj === 'object' && obj !== null) {
    const truncated: any = {};
    for (const [key, value] of Object.entries(obj)) {
      truncated[key] = truncateJSON(value, maxDepth, currentDepth + 1);
    }
    return truncated;
  }
  return obj;
};

const chunkDataForEmbedding = (data: any[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(JSON.stringify(data.slice(i, i + chunkSize)));
  }
  return chunks;
};

const truncateData = (data: any[]) => {
  return data.slice(0, CHUNK_SIZE * MAX_CHUNKS);
};

const truncateChunkData = (chunkData: any[], maxSize: number = 40000) => {
  const stringified = JSON.stringify(chunkData);
  if (stringified.length <= maxSize) return chunkData;
  
  const truncatedChunk = [];
  let currentSize = 0;
  for (const item of chunkData) {
    const itemString = JSON.stringify(item);
    if (currentSize + itemString.length > maxSize) break;
    truncatedChunk.push(item);
    currentSize += itemString.length;
  }
  return truncatedChunk;
};

export const getDataInsights = async (data: any[], analysisResults: string) => {
  try {
    const truncatedData = truncateData(data);
    const response = await axios.post(API_URL, {
      action: 'getDataInsights',
      data: truncatedData,
      analysisResults,
      model: 'gpt-4o-2024-08-06', // Use the specified model
    });

    return response.data.insights;
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return "Error fetching AI insights. Please try again later.";
  }
};

export const getCustomAnalysis = async (data: any[], question: string) => {
  try {
    const truncatedData = truncateData(data);
    const response = await axios.post(API_URL, {
      action: 'getCustomAnalysis',
      data: truncatedData,
      question,
      model: 'gpt-4o-2024-08-06', // Use the specified model
    });

    return response.data.analysis;
  } catch (error) {
    console.error("Error fetching custom analysis:", error);
    return "Error performing custom analysis. Please try again later.";
  }
};

export const getSimilarInsights = async (data: any[]) => {
  try {
    const truncatedData = truncateData(data);
    const response = await axios.post(API_URL, {
      action: 'getSimilarInsights',
      data: truncatedData,
      model: 'gpt-4o-2024-08-06', // Use the specified model
    });

    return response.data.similarInsights;
  } catch (error) {
    console.error("Error fetching similar insights:", error);
    return [];
  }
};

export async function* getAIInsights(data: any[], question: string) {
  try {
    const truncatedData = truncateData(data);
    const dataSummary = summarizeData(truncatedData);
    const chunks = chunkData(truncatedData, CHUNK_SIZE);
    
    let allInsights = "";
    
    // Generate embeddings for the question
    const questionEmbeddingResponse = await axios.post(API_URL, {
      action: 'generateEmbedding',
      text: question,
    });
    const questionEmbedding = questionEmbeddingResponse.data.embedding;

    // Store chunks in Pinecone
    for (let i = 0; i < chunks.length; i++) {
      const truncatedChunk = truncateChunkData(chunks[i]);
      await axios.post(API_URL, {
        action: 'storeChunk',
        chunkData: truncatedChunk,
        chunkIndex: i,
        totalChunks: chunks.length,
      });
      const progress = Math.round(((i + 1) / chunks.length) * 50); // First 50% for storing
      yield `PROGRESS:${progress}`;
    }

    // Query Pinecone and generate insights
    const insights = await axios.post(API_URL, {
      action: 'queryAndGenerateInsights',
      questionEmbedding,
      question,
      dataSummary: truncateJSON(dataSummary),
      totalRows: data.length,
      processedRows: truncatedData.length,
      model: 'gpt-4o-2024-08-06',
    });

    yield `PROGRESS:100`;
    yield insights.data.insights;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    yield "Error generating AI insights. Please try again later.";
  }
};
