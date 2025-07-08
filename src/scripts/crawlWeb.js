import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Content from '../models/content.js';
import { cleanText } from '../utils/cleanText.js';
import { extractFAQs } from '../utils/extractFAQs.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const BASE_DOMAIN = 'https://www.mosdac.gov.in';
const visited = new Set();
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Remove duplicate lines & filter trash
function cleanAndFilterText(text) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 25 && !/^(\d+\.)|^[A-Z]{2,}$/.test(l));

  const seen = new Set();
  const filtered = lines.filter((line) => {
    const lower = line.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  return filtered.join('\n');
}

// Try with Cheerio
function getTextWithCheerio(html) {
  const $ = cheerio.load(html);
  return (
    $('main').text() ||
    $('#block-mosdac-content').text() ||
    $('#content, article, .view-content, .content-area, .node-content').text() ||
    $('body').text()
  );
}

// Fallback using Puppeteer
async function getTextWithPuppeteer(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const content = await page.evaluate(() => {
      const tagsToRemove = ['script', 'style', 'noscript', 'iframe', 'footer', 'nav', 'header'];
      tagsToRemove.forEach(tag =>
        document.querySelectorAll(tag).forEach(el => el.remove())
      );
      return document.body?.innerText?.trim() || '';
    });

    return content;
  } catch (err) {
    console.error(`❌ Puppeteer failed for ${url}:`, err.message);
    return '';
  } finally {
    await browser.close();
  }
}

// Main crawl function
const crawl = async (url) => {
  // Skip auth, reset, dynamic garbage links
  if (
    url.includes('/auth/') ||
    url.includes('reset-credentials') ||
    url.includes('login-actions') ||
    url.includes('tab_id=') ||
    url.includes('execution=') ||
    url.includes('kc_locale=')
  ) {
    console.log(`⛔ Skipping auth-related or dynamic URL: ${url}`);
    return;
  }

  if (visited.has(url) || !url.startsWith(BASE_DOMAIN)) return;
  visited.add(url);
  console.log(`🌐 Crawling: ${url}`);

  // Skip non-HTML files
  const ext = path.extname(url).toLowerCase();
  if (ext.match(/\.(pdf|doc|docx|xls|xlsx)$/)) {
    console.log(`📎 Skipping unsupported file type: ${url}`);
    return;
  }

  let raw = '';
  let html = '';

  try {
    const { data } = await axios.get(url);
    html = data;
    raw = getTextWithCheerio(html);
  } catch (err) {
    console.warn(`⚠️ Axios failed for ${url}:`, err.message);
  }

  // If raw is weak, use Puppeteer
  if (!raw || raw.length < 500) {
    console.log(`🔄 Using Puppeteer for: ${url}`);
    raw = await getTextWithPuppeteer(url);
  }

  const cleaned = cleanAndFilterText(raw);

  try {
    const faqs = extractFAQs(cleaned);

    if (faqs.length > 0) {
      for (const { question, answer } of faqs) {
        await Content.create({
          source: url,
          content: `${question} ${answer}`,
          type: 'faq',
          tags: [],
        });
      }
      console.log(`📘 Extracted & stored ${faqs.length} FAQs from: ${url}`);
    }

    // Save full page if not just faqs or too short
    if (cleaned.length > 300 && faqs.length < 10) {
      await Content.create({
        source: url,
        content: cleaned,
        type: 'webpage',
        tags: [],
      });
      console.log(`✅ Stored webpage content from: ${url}`);
    }
  } catch (err) {
    console.error(`❌ Error saving content from ${url}:`, err.message);
  }

  // Recursively crawl internal links
  if (html) {
    const $ = cheerio.load(html);
    const links = $('a[href]')
      .map((_, el) => $(el).attr('href'))
      .get()
      .filter((href) => href && !href.startsWith('#'));

    for (let link of links) {
      if (link.startsWith('/')) link = BASE_DOMAIN + link;
      if (link.startsWith(BASE_DOMAIN)) {
        await delay(1000);
        await crawl(link);
      }
    }
  }
};

// Start crawling
const urlsToStart = [
  `${BASE_DOMAIN}/`,
  `${BASE_DOMAIN}/faq-page`,
  `${BASE_DOMAIN}/catalog/satellite.php`,
];

for (const url of urlsToStart) {
  await crawl(url);
}

console.log('✅ Full crawl complete.');
await mongoose.disconnect();
