import fs from 'fs';
const content = fs.readFileSync('game.js', 'utf8');

const lines = content.split('\n');
const defs = [];
const regs = [];

lines.forEach((line, i) => {
  const defMatch = line.match(/^        const MCP_TOOLS_V(\d+) = \{/);
  const regMatch = line.match(/\/\/ V(\d+): Register/);
  if (defMatch) defs.push({ v: defMatch[1], line: i + 1 });
  if (regMatch) regs.push({ v: regMatch[1], line: i + 1 });
});

console.log('Definitions:');
defs.forEach(d => console.log(`  V${d.v}: line ${d.line}`));
console.log('\nRegistrations:');
regs.forEach(r => console.log(`  V${r.v}: line ${r.line}`));