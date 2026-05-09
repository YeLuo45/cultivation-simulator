const { chromium } = require('playwright');
const https = require('https');

const GAME_URL = 'https://yeluo45.github.io/cultivation-simulator/';

async function run() {
  // 1. Verify raw HTML content via fetch
  const html = await new Promise((resolve, reject) => {
    https.get(GAME_URL, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
  
  console.log('=== HTML 验证 ===');
  console.log('HTML 大小:', html.length, '字节');
  
  // Check script tag
  const hasScriptOpen = html.includes('<script>');
  const hasScriptClose = html.includes('</script>');
  const hasCONFIG = html.includes('const CONFIG = {');
  const hasStartNewGame = html.includes('function startNewGame');
  const scriptMatch = html.match(/<script>([\s\S]{50,})<\/script>/);
  
  console.log('<script> 存在:', hasScriptOpen);
  console.log('</script> 存在:', hasScriptClose);
  console.log('const CONFIG 存在:', hasCONFIG);
  console.log('function startNewGame 存在:', hasStartNewGame);
  if (scriptMatch) {
    console.log('Script 内容长度:', scriptMatch[1].length);
    console.log('Script 前100字符:', scriptMatch[1].substring(0, 100).replace(/\n/g, ' '));
  }
  
  // 2. Browser test
  console.log('\n=== 浏览器测试 ===');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.substring(0, 200)));
  
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  const check = await page.evaluate(() => ({
    typeof_CONFIG: typeof CONFIG,
    typeof_startNewGame: typeof startNewGame,
    bodyLen: document.body.innerHTML.length,
    title: document.title,
  }));
  
  console.log('CONFIG 类型:', check.typeof_CONFIG);
  console.log('startNewGame 类型:', check.typeof_startNewGame);
  console.log('body 长度:', check.bodyLen);
  console.log('页面标题:', check.title);
  console.log('JS 错误:', errors.length === 0 ? '无' : errors.join('; '));
  
  // 3. Summary
  console.log('\n=== 结论 ===');
  if (check.typeof_CONFIG === 'object' && check.typeof_startNewGame === 'function') {
    console.log('✅ 游戏 JS 加载正常');
  } else if (hasCONFIG && hasScriptOpen) {
    console.log('⚠️ HTML 包含 JS 但浏览器未执行（可能是 CSP 或浏览器限制）');
    console.log('   请手动访问 https://yeluo45.github.io/cultivation-simulator/ 验证');
  } else {
    console.log('❌ HTML 中缺少 JS 内容，请检查 gh-pages 分支');
  }
  
  await browser.close();
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
