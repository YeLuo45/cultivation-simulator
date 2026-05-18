// CI build script: creates dist/ from index.html + modules
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const indexPath = 'index.html';
const distDir = 'dist';

const html = readFileSync(indexPath, 'utf8');
const lines = html.split('\n');

// Check if this is an inline-JS build (has Auto-generated marker)
const jsStartIdx = lines.findIndex(l => l.includes('// Auto-generated from modules'));
const jsEndIdx = lines.findIndex((l, i) => i > jsStartIdx && l.trim() === '</script>');

mkdirSync(distDir, { recursive: true });

if (jsStartIdx !== -1 && jsEndIdx !== -1) {
    // Inline JS mode: extract and bundle
    const jsLines = lines.slice(jsStartIdx + 1, jsEndIdx);
    let jsContent = jsLines.join('\n');
    jsContent = jsContent.replace(/const tth = gameState\.thirtyThreeHeavens;/g, 'tth = gameState.thirtyThreeHeavens;');
    writeFileSync(`${distDir}/game.js`, jsContent);
    console.log('Bundle size:', jsContent.length, 'bytes');

    const header = lines.slice(0, jsStartIdx).join('\n') + '\n    <script src="./game.js"></script>\n';
    const footer = lines.slice(jsEndIdx + 1).join('\n');
    writeFileSync(`${distDir}/index.html`, header + footer);
    console.log('Generated dist/index.html with bundled JS (inline mode)');
} else {
    // External JS mode: always copy source game.js to dist, then build index.html
    const srcGame = 'game.js';
    const distGame = `${distDir}/game.js`;
    if (!existsSync(srcGame)) {
        console.error('ERROR: game.js not found in project root');
        process.exit(1);
    }
    // Always refresh dist/game.js from source
    const gameContent = readFileSync(srcGame, 'utf8');
    if (!gameContent.includes('function init()') || !gameContent.includes('const CONFIG = {')) {
        console.error('ERROR: source game.js is invalid (missing init() or CONFIG)');
        process.exit(1);
    }
    writeFileSync(distGame, gameContent);
    console.log('Copied game.js to dist:', gameContent.length, 'bytes');
    // Build dist/index.html from source index.html
    writeFileSync(`${distDir}/index.html`, html);
    console.log('Generated dist/index.html with external game.js');
}

const finalJs = readFileSync(`${distDir}/game.js`, 'utf8');
console.log('CONFIG found:', finalJs.includes('const CONFIG = {'));
console.log('init() found:', finalJs.includes('function init()'));
console.log('sect.js found:', finalJs.includes('openTribulationRequest'));