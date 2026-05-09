const { chromium } = require('playwright');
const fs = require('fs');

const GAME_URL = 'https://yeluo45.github.io/cultivation-simulator/';

async function run() {
  // Fetch the HTML content directly
  const https = require('https');
  const html = await new Promise((resolve, reject) => {
    https.get(GAME_URL, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
  
  console.log('Fetched HTML size:', html.length);
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  console.log('Script tag found:', !!scriptMatch);
  if (scriptMatch) {
    console.log('Script content length:', scriptMatch[1].length);
    console.log('Script starts with:', scriptMatch[1].substring(0, 100));
  }
  
  // Now try loading it via setContent
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() !== 'log') console.log(`[${msg.type()}] ${msg.text().substring(0, 200)}`);
  });
  page.on('pageerror', err => console.log(`[pageerror] ${err.message.substring(0, 300)}`));
  
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const result = await page.evaluate(() => ({
    configType: typeof CONFIG,
    startType: typeof startNewGame,
    scriptCount: document.querySelectorAll('script').length,
  }));
  console.log('setContent result:', JSON.stringify(result));
  
  await browser.close();
}

run().catch(console.error);
