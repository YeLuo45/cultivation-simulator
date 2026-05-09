const { chromium } = require('playwright');

const GAME_URL = 'https://yeluo45.github.io/cultivation-simulator/';

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const allLogs = [];
  page.on('console', msg => allLogs.push(`[${msg.type()}] ${msg.text().substring(0, 200)}`));
  page.on('pageerror', err => allLogs.push(`[pageerror] ${err.message.substring(0, 200)}`));

  await page.goto(GAME_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check raw window properties
  const check1 = await page.evaluate(() => {
    const keys = Object.keys(window).filter(k => /^(start|show|init|config|game)/i.test(k));
    return { keys, configType: typeof CONFIG, startType: typeof startNewGame };
  });
  console.log('Window keys matching start/show/init:', JSON.stringify(check1));

  // Check document head
  const headInfo = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.map(s => ({ src: s.src, len: s.innerHTML.length, start: s.innerHTML.substring(0, 50) }));
  });
  console.log('Scripts:', JSON.stringify(headInfo));

  // Try calling via window
  const callResult = await page.evaluate(() => {
    try {
      if (typeof window.startNewGame === 'function') {
        window.startNewGame();
        return 'called successfully';
      }
      // Check if it's defined somewhere
      const tryFn = eval('typeof startNewGame');
      return `typeof startNewGame = ${tryFn}, typeof window.startNewGame = ${typeof window.startNewGame}`;
    } catch(e) { return `error: ${e.message}`; }
  });
  console.log('Call result:', callResult);

  // Print console logs
  console.log('\nAll console messages:');
  allLogs.slice(0, 20).forEach(l => console.log(l));

  await browser.close();
}

run().catch(console.error);
