import { GoogleGenerativeAI } from '@google/generative-ai';
import { semanticSearch } from './semanticSearch.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const generateAnswer = async (query) => {
    const topDocs = await semanticSearch(query, 3);

    if (!topDocs.length) {
        return "Sorry, I couldn't find anything relevant.";
    }

    const context = topDocs
        .map((doc, i) => `Document ${i + 1}:\n${doc.content}`)
        .join('\n\n');

    const prompt = `
You are an expert assistant helping users find precise and accurate information related to satellite data, meteorology, and space applications.

User Question:
"${query}"

Relevant Documents:
${context}

Instructions:
- Do not include information that is not in the sources.
- Summarize and combine insights from multiple documents if needed.
- Provide a clear and concise response, written in a helpful tone.
- If the answer cannot be found in the documents, politely respond that no relevant information was found.
- Do not mention "Document 1" or "Document 2" — just answer naturally.
- Mention satellite names, instruments, regions, or years if present in context.
- Avoid repetition and filler words.

Answer:
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};
