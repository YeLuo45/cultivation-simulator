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

test('startNewGame 函数存在且可调用', async ({ page }) => {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 验证 startNewGame 函数存在
  const startNewGameType = await page.evaluate(() => typeof startNewGame);
  expect(startNewGameType).toBe('function');

  // 调用 startNewGame
  await page.evaluate(() => startNewGame());
  await page.waitForTimeout(1000);

  // 验证 gameState 已初始化
  const gameStateExists = await page.evaluate(() => typeof gameState === 'object' && gameState !== null);
  expect(gameStateExists).toBe(true);
});

test('新游戏初始化后 gameState 字段完整（含 rankingPVP）', async ({ page }) => {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 调用 startNewGame 初始化游戏
  await page.evaluate(() => startNewGame());
  await page.waitForTimeout(1000);

  // 验证 gameState 核心字段存在
  const requiredFields = await page.evaluate(() => {
    return {
      realm: typeof gameState.realm === 'number',
      stage: typeof gameState.stage === 'number',
      qi: typeof gameState.qi === 'number',
      maxQi: typeof gameState.maxQi === 'number',
      spiritStones: typeof gameState.spiritStones === 'number',
      mindset: typeof gameState.mindset === 'number',
      days: typeof gameState.days === 'number',
      inventory: Array.isArray(gameState.inventory),
      rankingPVP: typeof gameState.rankingPVP === 'object' && gameState.rankingPVP !== null,
      combat: typeof gameState.combat === 'object',
      sect: typeof gameState.sect === 'object',
      tribulation: typeof gameState.tribulation === 'object'
    };
  });

  expect(requiredFields.realm).toBe(true);
  expect(requiredFields.stage).toBe(true);
  expect(requiredFields.qi).toBe(true);
  expect(requiredFields.maxQi).toBe(true);
  expect(requiredFields.spiritStones).toBe(true);
  expect(requiredFields.mindset).toBe(true);
  expect(requiredFields.days).toBe(true);
  expect(requiredFields.inventory).toBe(true);
  expect(requiredFields.rankingPVP).toBe(true);

  // 验证 rankingPVP 字段结构完整
  const rankingPVPFields = await page.evaluate(() => {
    const pvp = gameState.rankingPVP;
    return {
      enabled: typeof pvp.enabled === 'boolean',
      rating: typeof pvp.rating === 'number',
      rank: typeof pvp.rank === 'string',
      rankLevel: typeof pvp.rankLevel === 'number',
      wins: typeof pvp.wins === 'number',
      losses: typeof pvp.losses === 'number',
      realmDivision: typeof pvp.realmDivision === 'string'
    };
  });

  expect(rankingPVPFields.enabled).toBe(true);
  expect(rankingPVPFields.rating).toBe(1000);
  expect(rankingPVPFields.rank).toBe('凡人');
  expect(rankingPVPFields.rankLevel).toBe(0);
  expect(rankingPVPFields.wins).toBe(0);
  expect(rankingPVPFields.losses).toBe(0);
  expect(rankingPVPFields.realmDivision).toBe('human');
});

test('设置面板可以打开和关闭', async ({ page }) => {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 点击开始游戏
  const startBtn = page.locator('button:has-text("开始"), button:has-text("新游戏"), button:has-text("开始游戏")').first();
  await expect(startBtn).toBeVisible({ timeout: 5000 });
  await startBtn.click();
  await page.waitForTimeout(1000);

  // 验证设置按钮存在
  const settingsBtn = page.locator('button:has-text("设置"), button:has-text("⚙")').first();
  await expect(settingsBtn).toBeVisible({ timeout: 5000 });

  // 打开设置面板
  await settingsBtn.click();
  await page.waitForTimeout(500);

  // 验证设置面板已打开 (settingsModal 有 active 类)
  const settingsModalActive = await page.evaluate(() => {
    const modal = document.getElementById('settingsModal');
    return modal && modal.classList.contains('active');
  });
  expect(settingsModalActive).toBe(true);

  // 关闭设置面板
  const closeBtn = page.locator('#settingsModal .close-btn, #settingsModal button:has-text("关闭")').first();
  await closeBtn.click();
  await page.waitForTimeout(500);

  // 验证设置面板已关闭
  const settingsModalClosed = await page.evaluate(() => {
    const modal = document.getElementById('settingsModal');
    return modal && !modal.classList.contains('active');
  });
  expect(settingsModalClosed).toBe(true);
});

test('存档保存/读取功能', async ({ page }) => {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 开始新游戏
  await page.evaluate(() => startNewGame());
  await page.waitForTimeout(1000);

  // 修改游戏状态
  const originalSpiritStones = await page.evaluate(() => gameState.spiritStones);
  await page.evaluate(() => {
    gameState.spiritStones = 999;
    gameState.days = 100;
  });

  // 手动调用保存
  await page.evaluate(() => saveGame());
  await page.waitForTimeout(500);

  // 验证存档已保存到 localStorage
  const savedData = await page.evaluate(() => {
    const saved = localStorage.getItem('cultivationSave');
    return saved ? JSON.parse(saved) : null;
  });
  expect(savedData).not.toBeNull();
  expect(savedData.spiritStones).toBe(999);
  expect(savedData.days).toBe(100);

  // 再次开始新游戏重置状态
  await page.evaluate(() => {
    gameState.spiritStones = 50;
    gameState.days = 1;
  });

  // 调用加载存档
  await page.evaluate(() => loadGame());
  await page.waitForTimeout(500);

  // 验证状态已恢复
  const restoredSpiritStones = await page.evaluate(() => gameState.spiritStones);
  const restoredDays = await page.evaluate(() => gameState.days);
  expect(restoredSpiritStones).toBe(999);
  expect(restoredDays).toBe(100);
});

test('游戏主界面元素验证（境界、灵气等）', async ({ page }) => {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 开始新游戏
  await page.evaluate(() => startNewGame());
  await page.waitForTimeout(1000);

  // 验证主界面元素存在
  const uiElements = await page.evaluate(() => {
    const results = {
      qiDisplay: false,
      stonesDisplay: false,
      mindsetDisplay: false,
      daysDisplay: false,
      realmDisplay: false,
      stageDisplay: false
    };

    const qiEl = document.getElementById('qiDisplay');
    const stonesEl = document.getElementById('stonesDisplay');
    const mindsetEl = document.getElementById('mindsetDisplay');
    const daysEl = document.getElementById('daysDisplay');
    const realmEl = document.getElementById('realmDisplay');
    const stageEl = document.getElementById('stageDisplay');

    results.qiDisplay = qiEl && qiEl.textContent.length > 0;
    results.stonesDisplay = stonesEl && stonesEl.textContent.length > 0;
    results.mindsetDisplay = mindsetEl && mindsetEl.textContent.length > 0;
    results.daysDisplay = daysEl && daysEl.textContent.length > 0;
    results.realmDisplay = realmEl && realmEl.textContent.length > 0;
    results.stageDisplay = stageEl && stageEl.textContent.length > 0;

    return results;
  });

  expect(uiElements.qiDisplay).toBe(true);
  expect(uiElements.stonesDisplay).toBe(true);
  expect(uiElements.mindsetDisplay).toBe(true);
  expect(uiElements.daysDisplay).toBe(true);
  expect(uiElements.realmDisplay).toBe(true);
  expect(uiElements.stageDisplay).toBe(true);

  // 验证境界显示正确（初始应为炼气期）
  const realmText = await page.evaluate(() => {
    const realmEl = document.getElementById('realmDisplay');
    return realmEl ? realmEl.textContent : '';
  });
  expect(realmText).toContain('炼气');

  // 验证灵气值格式正确
  const qiText = await page.evaluate(() => {
    const qiEl = document.getElementById('qiDisplay');
    return qiEl ? qiEl.textContent : '';
  });
  expect(qiText).toMatch(/\d+\/\d+/);
});
