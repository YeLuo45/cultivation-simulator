// build_vite.js - Robust CI build: Python concat + node syntax check
// Concatenates game.js directly (no shim needed for concatenation)
// node --check validates syntax

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');

mkdirSync(distDir, { recursive: true });

// --- Step 1: Copy game.js directly to dist ---
const gamePath = path.join(__dirname, 'game.js');
const distGamePath = path.join(distDir, 'game.js');

const game = readFileSync(gamePath, 'utf8');
writeFileSync(distGamePath, game);
console.log(`Copied game.js: ${game.length} bytes`);

// --- Step 2: Copy index.html ---
const indexSrc = path.join(__dirname, 'index.html');
const indexDist = path.join(distDir, 'index.html');
let html = readFileSync(indexSrc, 'utf8');
// Ensure correct game.js reference
html = html.replace(
  /<script\s+src=["']\.\/game\.js["']\s*>\s*<\/script>/g,
  `<script src="./game.js"></script>`
);
writeFileSync(indexDist, html);
console.log('Generated dist/index.html');

// --- Step 3: Validate content ---
const checks = [
  ['CONFIG object', 'const CONFIG = {'],
  ['init function', 'function init('],
  ['gameState object', 'let gameState = {'],
  ['startNewGame function', 'function startNewGame('],
  ['updateDisplay function', 'function updateDisplay('],
];

for (const [name, pattern] of checks) {
  const ok = game.includes(pattern);
  console.log(`  ${ok ? '✓' : '✗'} ${name}`);
}

// --- Step 4: Syntax check via node ---
try {
  execSync(`node --check "${distGamePath}"`, { stdio: 'pipe' });
  console.log('✓ Syntax check passed (node --check)');
} catch (e) {
  const err = e.stderr?.toString() || e.message;
  console.error('✗ Syntax check FAILED:', err.substring(0, 500));
  process.exit(1);
}

console.log('\nBuild complete!');
console.log(`  dist/game.js    — ${game.length} bytes`);
console.log(`  dist/index.html — ${html.length} bytes`);
