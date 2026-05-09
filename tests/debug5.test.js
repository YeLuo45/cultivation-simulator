const { chromium } = require('playwright');

const GAME_URL = 'https://yeluo45.github.io/cultivation-simulator/';

async function run() {
  const browser = await chromium.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });
  const page = await browser.newPage();
  
  // Print all requests
  page.on('request', req => console.log(`[req] ${req.url().substring(0, 100)}`));
  page.on('response', res => {
    if (res.url().includes('yeluo45')) console.log(`[res] ${res.url().substring(0, 100)} - ${res.status()}`);
  });
  page.on('console', msg => console.log(`[${msg.type()}] ${msg.text().substring(0, 300)}`));
  page.on('pageerror', err => console.log(`[pageerror] ${err.message.substring(0, 300)}`));

  await page.goto(GAME_URL, { timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const result = await page.evaluate(() => ({
    scriptCount: document.querySelectorAll('script').length,
    configType: typeof CONFIG,
    startType: typeof startNewGame,
    bodyLen: document.body.innerHTML.length,
    bodyStart: document.body.innerHTML.substring(0, 200)
  }));
  console.log('Result:', JSON.stringify(result, null, 2));
  
  await browser.close();
}

run().catch(console.error);
