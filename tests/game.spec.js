const { test, expect } = require('@playwright/test');

const GAME_URL = 'https://yeluo45.github.io/cultivation-simulator/';

test('游戏页面加载无崩溃', async ({ page }) => {
  // 捕获控制台错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 页面标题正确
  await expect(page).toHaveTitle(/修仙模拟器/);

  // 无 JS 崩溃错误（过滤掉网络资源加载失败）
  const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('net::'));
  console.log('Console errors:', criticalErrors);
  expect(criticalErrors).toHaveLength(0);
});

test('开始游戏功能正常', async ({ page }) => {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 查找"开始游戏"或"新游戏"按钮
  const startBtn = page.locator('button:has-text("开始"), button:has-text("新游戏"), button:has-text("开始游戏")').first();
  await expect(startBtn).toBeVisible({ timeout: 5000 });
  await startBtn.click();
  await page.waitForTimeout(1000);

  // 点击后游戏界面元素出现（灵气、境界等）
  const body = await page.textContent('body');
  expect(body.length).toBeGreaterThan(100);
});

test('游戏核心UI元素存在', async ({ page }) => {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 检查页面包含游戏相关文本
  const body = await page.textContent('body');
  const hasGameContent = body.includes('境界') || body.includes('灵气') || body.includes('修仙') || body.includes('开始');
  expect(hasGameContent).toBe(true);
});
