import { pinecone } from '../config/pineconeClient.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from '../models/content.js';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const index = pinecone.Index('mosdac-helpbot');

  // Fetch content with embeddings
  const documents = await Content.find({ embedding: { $exists: true, $ne: [] } }).lean();

  // Format as Pinecone vectors
  const vectors = documents.map(doc => ({
    id: doc._id.toString(),
    values: doc.embedding,
    metadata: {
      content: doc.content,
      url: doc.url || '',
      title: doc.title || '',
    },
  }));

  // Batch upload (max 100 vectors per upsert call)
  const chunkSize = 100;
  for (let i = 0; i < vectors.length; i += chunkSize) {
    const batch = vectors.slice(i, i + chunkSize);
    await index.upsert(batch);
    console.log(`Upserted batch ${i / chunkSize + 1}`);
  }

  console.log('All vectors uploaded to Pinecone');
  process.exit(0);
}

run().catch(err => {
  console.error('Error in upserting to Pinecone:', err);
  process.exit(1);
});
