import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from '../models/content.js';
import { extractEntities } from '../utils/extractEntities.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

async function processAllContent() {
    const docs = await Content.find({});

    console.log(docs.length);

    for (const doc of docs) {
        const text = doc.content;
        if (!text) continue;

        console.log(`Processing document: ${doc._id}`);

        console.log("Text for NER:", text.slice(0, 300));

        const entities = await extractEntities(text);
        console.log(entities);        

        doc.namedEntities = entities;
        await doc.save();
    }

    console.log("✅ All documents processed and entities stored.");
    process.exit(0);
}

processAllContent();
