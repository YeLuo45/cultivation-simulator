import fs from 'fs';
const code = fs.readFileSync('game.js', 'utf8');

// Find V162 test function
const v162Match = code.match(/function runV162Tests\(\) \{[\s\S]*?const v162Results = runV162Tests\(\)/);
if (!v162Match) {
  console.log('runV162Tests function not found');
  process.exit(1);
}

const v162Code = v162Match[0];
const assertCount = (v162Code.match(/v162Assert\(/g) || []).length;
const lines = v162Code.split('\n');
const testLines = lines.filter(l => l.trim().startsWith('// Test'));
console.log('Test comment lines:', testLines.length);
console.log('v162Assert calls in function:', assertCount);

// Count test results array pushes via v162Assert
const actualAsserts = assertCount - 1; // subtract 1 for the v162Assert definition itself
console.log('Actual test assertions:', actualAsserts);