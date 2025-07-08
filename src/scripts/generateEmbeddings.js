import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Content from '../models/content.js';
import { getEmbedding } from '../utils/getEmbedding.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const BATCH_SIZE = 20;

const generateEmbeddings = async () => {
    const docs = await Content.find({
        embedding: { $type: "array", $size: 0 },
        content: { $ne: "" }
    }).limit(BATCH_SIZE);

    for (const doc of docs) {
        try {
            const embedding = await getEmbedding(doc.content.slice(0, 512));
            console.log(embedding);

            doc.embedding = embedding;
            await doc.save();
            console.log(`✅ Embedded: ${doc._id}`);
        } catch (err) {
            console.error(`❌ Failed for ${doc._id}:`, err.message);
        }
    }

    console.log('🚀 Embedding complete');
    process.exit(0);
};

generateEmbeddings();