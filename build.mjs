import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const modules = [
  'config.js', 'state.js', 'ui.js',
  'achievements.js', 'cultivation.js', 'combat.js',
  'core.js', 'crafting.js', 'data.js',
  'sect.js', 'serendipity.js', 'worldmap.js', 'init.js',
  // V11 飞升系统模块
  'immortal.js', 'mount.js', 'immortalSkill.js', 'immortalEquip.js', 'ascension.js'
];

mkdirSync('dist', { recursive: true });

// Concatenate all modules (strip header comments)
let bundle = '';
for (const mod of modules) {
  const content = readFileSync(`js/${mod}`, 'utf8');
  const lines = content.split('\n');
  // Remove first 2 lines (header comment + 'use strict')
  const stripped = lines.slice(2).join('\n');
  bundle += `// ===== ${mod} =====\n` + stripped + '\n';
}
bundle = bundle.replace(/'use strict';\n/g, '');

writeFileSync('dist/game.js', bundle);
console.log('Bundle size:', bundle.length, 'bytes');

// Create dist/index.html from source, with script tag replaced
let html = readFileSync('index.html', 'utf8');

// index.html has inline JS: lines 2829-11300 contain the game code.
// Find the boundary between HTML header and JS, and JS and footer.
const lines = html.split('\n');
const jsStartLine = lines.findIndex(l => l.includes('// Auto-generated from modules'));
if (jsStartLine === -1) { console.error('No JS start marker found'); process.exit(1); }

// JS starts at jsStartLine+1 (first // ===== config.js =====)
// Find </script> from the end
const jsEndLine = lines.findIndex((l, i) => i > jsStartLine && l === '</script>');
if (jsEndLine === -1) { console.error('No </script> found'); process.exit(1); }

const header = lines.slice(0, jsStartLine).join('\n') + '\n    <script src="./game.js"></script>\n';
const footer = lines.slice(jsEndLine + 1).join('\n');

writeFileSync('dist/index.html', header + footer);
console.log('Generated dist/index.html with bundled JS');
console.log('CONFIG found:', bundle.includes('const CONFIG = {'));
console.log('init() found:', bundle.includes('function init()'));
