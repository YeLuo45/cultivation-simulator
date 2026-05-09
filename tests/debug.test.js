const { chromium } = require('playwright');

const GAME_URL = 'https://yeluo45.github.io/cultivation-simulator/';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text().substring(0, 300)));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message.substring(0, 300)));

  await page.goto(GAME_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 检查全局函数
  const funcs = await page.evaluate(() => ({
    startNewGame: typeof startNewGame,
    showGameUI: typeof showGameUI,
    CONFIG: typeof CONFIG,
    gameState: typeof gameState,
    hasStartBtn: document.body.innerHTML.includes('startNewGame'),
  }));
  console.log('Functions:', JSON.stringify(funcs, null, 2));

  // 尝试直接调用
  if (funcs.startNewGame === 'function') {
    console.log('\nCalling startNewGame()...');
    await page.evaluate(() => startNewGame());
    await page.waitForTimeout(2000);
    const html = await page.content();
    const bodyText = await page.textContent('body');
    console.log('Body length after call:', bodyText.length);
    console.log('Has modal?:', html.includes('modal') || html.includes('game-content'));
  }

  await browser.close();
}

run().catch(console.error);
