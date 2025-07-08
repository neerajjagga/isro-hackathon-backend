import { pinecone } from '../config/pineconeClient.js';
import { getEmbedding } from '../utils/getEmbedding.js';

export const semanticSearch = async (queryText, topK = 5) => {
    if (!queryText) return [];

    const embedding = await getEmbedding(queryText);
    if (!embedding.length) return [];

    const index = pinecone.Index('mosdac-helpbot');
    const queryResult = await index.query({
        topK,
        vector: embedding,
        includeMetadata: true,
    });

    return queryResult.matches.map(match => ({
        score: match.score,
        content: match.metadata.content,
        url: match.metadata.url,
        title: match.metadata.title,
        id: match.id,
    }));
};
