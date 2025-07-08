import fs from 'fs';
import mammoth from 'mammoth';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from '../models/Content.js';
import { cleanText } from '../utils/cleanText.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const files = ['path/to/file1.docx'];

const parseDocx = async (filePath) => {
    const { value } = await mammoth.extractRawText({ path: filePath });

    await Content.create({
        source: filePath,
        content: cleanText(value),
        type: 'docx',
        tags: [],
    });

    console.log(`✅ Parsed DOCX: ${filePath}`);
};

for (const file of files) {
    await parseDocx(file);
}

mongoose.disconnect();
