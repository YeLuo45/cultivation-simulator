// CI build script: extracts inline JS from index.html and creates dist/
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const indexPath = 'index.html';
const distDir = 'dist';

// Find JS start marker and </script> end marker
const html = readFileSync(indexPath, 'utf8');
const lines = html.split('\n');

const jsStartIdx = lines.findIndex(l => l.includes('// Auto-generated from modules'));
const jsEndIdx = lines.findIndex((l, i) => i > jsStartIdx && l.trim() === '</script>');

if (jsStartIdx === -1 || jsEndIdx === -1) {
    console.error('ERROR: Cannot find JS boundaries in index.html');
    console.error('jsStartIdx:', jsStartIdx, 'jsEndIdx:', jsEndIdx);
    process.exit(1);
}

// Extract JS content (lines between start+1 and end-1)
const jsLines = lines.slice(jsStartIdx + 1, jsEndIdx);
let jsContent = jsLines.join('\n');

// Fix: replace block-level 'const tth = gameState.thirtyThreeHeavens;' with 'tth = ...'
// to avoid duplicate declaration errors when concatenated
jsContent = jsContent.replace(/const tth = gameState\.thirtyThreeHeavens;/g, 'tth = gameState.thirtyThreeHeavens;');

mkdirSync(distDir, { recursive: true });

// Write dist/game.js
writeFileSync(`${distDir}/game.js`, jsContent);
console.log('Bundle size:', jsContent.length, 'bytes');

// Write dist/index.html (HTML wrapper + script tag)
const header = lines.slice(0, jsStartIdx).join('\n') + '\n    <script src="./game.js"></script>\n';
const footer = lines.slice(jsEndIdx + 1).join('\n');
writeFileSync(`${distDir}/index.html`, header + footer);
console.log('Generated dist/index.html with bundled JS');
console.log('CONFIG found:', jsContent.includes('const CONFIG = {'));
console.log('init() found:', jsContent.includes('function init()'));
