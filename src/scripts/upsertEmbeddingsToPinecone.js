import { pinecone } from '../config/pineconeClient.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from '../models/content.js'; // your model
dotenv.config();

async function run() {
  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI);

  // 2. Init Pinecone index
  const index = pinecone.Index('mosdac-helpbot'); // your index name

  // 3. Fetch content with embeddings
  const documents = await Content.find({ embedding: { $exists: true, $ne: [] } }).lean();

  // 4. Format as Pinecone vectors
  const vectors = documents.map(doc => ({
    id: doc._id.toString(),
    values: doc.embedding,
    metadata: {
      content: doc.content,
      url: doc.url || '',
      title: doc.title || '',
    },
  }));

  // 5. Batch upload (max 100 vectors per upsert call)
  const chunkSize = 100;
  for (let i = 0; i < vectors.length; i += chunkSize) {
    const batch = vectors.slice(i, i + chunkSize);
    await index.upsert(batch);
    console.log(`✅ Upserted batch ${i / chunkSize + 1}`);
  }

  console.log('🚀 All vectors uploaded to Pinecone');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error in upserting to Pinecone:', err);
  process.exit(1);
});
