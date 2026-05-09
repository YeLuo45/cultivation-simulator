const { chromium } = require('playwright');

const GAME_URL = 'https://yeluo45.github.io/cultivation-simulator/';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('Test 1: 游戏页面加载...');
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const title = await page.title();
  console.log('  标题:', title, title.includes('修仙') ? '✓' : '✗');

  console.log('\nTest 2: 控制台错误检查...');
  const criticalErrors = errors.filter(e => 
    !e.includes('favicon') && !e.includes('net::') && !e.includes('Failed to load')
  );
  console.log('  错误数:', criticalErrors.length, criticalErrors.length === 0 ? '✓' : '✗');
  if (criticalErrors.length > 0) {
    criticalErrors.forEach(e => console.log('  -', e.substring(0, 200)));
  }

  console.log('\nTest 3: 游戏内容检查...');
  const body = await page.textContent('body');
  const hasGameContent = body.includes('境界') || body.includes('灵气') || body.includes('修仙') || body.includes('开始');
  console.log('  内容长度:', body.length);
  console.log('  包含游戏元素:', hasGameContent ? '✓' : '✗');

  console.log('\nTest 4: 调用 startNewGame()...');
  try {
    await page.evaluate(() => { if (typeof startNewGame === 'function') startNewGame(); });
    await page.waitForTimeout(1500);
    const newBody = await page.textContent('body');
    const changed = newBody !== body;
    console.log('  内容变化:', changed ? '✓' : '✗');
    console.log('  新长度:', newBody.length);
    // 检查游戏界面元素
    const hasGameUI = newBody.includes('灵气') && (newBody.includes('境界') || newBody.includes('境界'));
    console.log('  游戏界面元素:', hasGameUI ? '✓' : '✗');
  } catch (e) {
    console.log('  异常:', e.message.substring(0, 100));
  }

  console.log('\nTest 5: 核心数据验证...');
  const hasRealm = body.includes('炼气') || body.includes('筑基') || body.includes('金丹');
  console.log('  境界数据:', hasRealm ? '✓' : '✗');
  
  const hasConfig = await page.evaluate(() => typeof CONFIG !== 'undefined' && CONFIG.realms.length > 0);
  console.log('  CONFIG 数据:', hasConfig ? '✓' : '✗');

  await browser.close();
  console.log('\n=== 测试完成 ===');
}

runTests().catch(console.error);
