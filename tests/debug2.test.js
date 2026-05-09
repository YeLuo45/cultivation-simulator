const { chromium } = require('playwright');

const GAME_URL = 'https://yeluo45.github.io/cultivation-simulator/';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text().substring(0, 300)));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message.substring(0, 300)));

  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check if script tag exists
  const scriptInfo = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    return Array.from(scripts).map(s => ({
      src: s.src,
      inline: !s.src && s.innerHTML.length,
      innerHTML_start: s.innerHTML.substring(0, 100)
    }));
  });
  console.log('Scripts found:', JSON.stringify(scriptInfo, null, 2));

  // Try to get CONFIG directly
  const configCheck = await page.evaluate(() => {
    try {
      return { 
        type: typeof CONFIG,
        windowKeys: Object.keys(window).filter(k => k.length < 20).sort().join(', ')
      };
    } catch(e) { return { error: e.message }; }
  });
  console.log('CONFIG check:', JSON.stringify(configCheck));

  await browser.close();
}

run().catch(console.error);
