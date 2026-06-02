const { chromium } = require('playwright');
const path = require('path');

const INDEX = path.join(__dirname, '..', 'index.html');
const GAME_URL = process.env.GAME_URL || `file://${INDEX}`;

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const before = await page.evaluate(() => ({
    windowStartNewGame: typeof window.startNewGame,
    renderLog: typeof window.renderLog,
    startScreenHidden: document.getElementById('startScreen')?.classList.contains('hidden'),
    gameStatsHidden: document.getElementById('gameStats')?.classList.contains('hidden'),
  }));
  console.log('Before click:', JSON.stringify(before, null, 2));

  await page.getByRole('button', { name: /开始新游戏/ }).click();
  await page.waitForTimeout(1500);

  const after = await page.evaluate(() => ({
    startScreenHidden: document.getElementById('startScreen')?.classList.contains('hidden'),
    gameStatsHidden: document.getElementById('gameStats')?.classList.contains('hidden'),
    realmDisplay: document.getElementById('realmDisplay')?.textContent,
    qiDisplay: document.getElementById('qiDisplay')?.textContent,
    logEntriesHtml: document.getElementById('logEntries')?.innerHTML?.length || 0,
  }));
  console.log('After click:', JSON.stringify(after, null, 2));
  console.log('Errors:', errors.slice(0, 10));

  const criticalErrors = errors.filter(
    (e) =>
      !e.includes('favicon') &&
      !e.includes('net::') &&
      !e.includes('before initialization')
  );

  const ok =
    before.windowStartNewGame === 'function' &&
    after.startScreenHidden === true &&
    after.gameStatsHidden === false &&
    (after.realmDisplay || '').includes('炼气') &&
    (after.qiDisplay || '').includes('20') &&
    after.logEntriesHtml > 0;

  await browser.close();
  if (!ok) {
    console.error('FAIL: 开始新游戏验证未通过');
    console.error('criticalErrors:', criticalErrors);
    process.exit(1);
  }
  if (errors.length > 0) {
    console.warn('非阻断页面告警（已忽略）:', errors.slice(0, 5));
  }
  console.log('PASS: 开始新游戏按钮可用，游戏界面已显示');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
