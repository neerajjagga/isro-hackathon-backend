import fs from 'fs';
import pdf from 'pdf-parse';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from '../models/Content.js';
import { cleanText } from '../utils/cleanText.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const files = ['path/to/file1.pdf', 'path/to/file2.pdf'];

const parsePDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    await Content.create({
        source: filePath,
        content: cleanText(data.text),
        type: 'pdf',
        tags: [],
    });

    console.log(`Parsed PDF: ${filePath}`);
};

for (const file of files) {
    await parsePDF(file);
}

mongoose.disconnect();
