import xlsx from 'xlsx';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from '../models/Content.js';
import { cleanText } from '../utils/cleanText.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const files = ['path/to/file1.xlsx'];

const parseExcel = async (filePath) => {
    const wb = xlsx.readFile(filePath);
    let fullText = '';

    wb.SheetNames.forEach((sheetName) => {
        const sheet = wb.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        fullText += data.flat().join(' ') + ' ';
    });

    await Content.create({
        source: filePath,
        content: cleanText(fullText),
        type: 'xlsx',
        tags: [],
    });

    console.log(`✅ Parsed XLSX: ${filePath}`);
};

for (const file of files) {
    await parseExcel(file);
}

mongoose.disconnect();
