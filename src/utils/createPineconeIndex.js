import { pinecone } from '../config/pineconeClient.js';

async function createIndex() {
    const indexName = 'mosdac-helpbot';

    const existingIndexes = await pinecone.listIndexes();
    console.log(existingIndexes);

    if (!existingIndexes.indexes.includes(indexName)) {
        await pinecone.createIndex({
            name: indexName,
            dimension: 1536,
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',      
                    region: 'us-east-1', 
                },
            },
            waitUntilReady: true,
        });
        console.log(`✅ Index "${indexName}" created.`);
    } else {
        console.log(`ℹ️ Index "${indexName}" already exists.`);
    }
}

createIndex();
