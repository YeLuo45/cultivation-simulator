const { chromium } = require('playwright');

const GAME_URL = 'https://yeluo45.github.io/cultivation-simulator/';

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[${msg.type()}] ${msg.text().substring(0, 300)}`));
  page.on('pageerror', err => console.log(`[pageerror] ${err.message.substring(0, 300)}`));
  page.on('requestfailed', req => console.log(`[reqfail] ${req.url().substring(0, 200)} - ${req.failure()?.errorText}`));

  console.log('Going to page...');
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Page loaded, waiting 5s...');
  await page.waitForTimeout(5000);
  
  // Check for script elements in DOM
  const scriptCount = await page.evaluate(() => document.querySelectorAll('script').length);
  console.log('Script tags in DOM:', scriptCount);
  
  // Get script contents
  const scriptInfo = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.map(s => ({ src: s.src || '(inline)', len: s.innerHTML.length, first50: s.innerHTML.substring(0, 50) }));
  });
  console.log('Script info:', JSON.stringify(scriptInfo, null, 2));
  
  await browser.close();
}

run().catch(console.error);
