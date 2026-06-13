// V197 Test runner
window = global;
load = () => {};
d3 = { select: () => ({ attr: () => {}, text: () => {}, on: () => {}, style: () => {}, html: () => {} }) };

const fs = require('fs');
const code = fs.readFileSync('game.js', 'utf8');
eval(code);

console.log('MCP_TOOLS_V197 defined:', typeof MCP_TOOLS_V197 === 'object');
console.log('Has 6 tools:', Object.keys(MCP_TOOLS_V197).length === 6);
console.log('Tools:', Object.keys(MCP_TOOLS_V197));
console.log('\nTest results:');
console.log('v197Results:', typeof v197Results);