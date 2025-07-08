import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export const getEmbedding = async (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') return [];

  try {
    if (text.length > 8192) {
      console.warn('⚠️ Text input truncated to 8192 characters');
      text = text.slice(0, 8192);
    }

    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(text);
    const geminiEmbedding = result.embedding.values;

    const paddedEmbedding = new Array(1536).fill(0);
    for (let i = 0; i < Math.min(geminiEmbedding.length, 1536); i++) {
      paddedEmbedding[i] = geminiEmbedding[i];
    }

    return paddedEmbedding;
  } catch (error) {
    console.error(
      '❌ Failed to get embedding from Gemini:',
      error.response?.status,
      error.response?.data || error.message
    );
    return [];
  }
};
