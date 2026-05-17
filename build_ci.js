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
    // External JS mode: check if dist/game.js exists and is valid
    const distGame = `${distDir}/game.js`;
    if (existsSync(distGame)) {
        const content = readFileSync(distGame, 'utf8');
        if (content.includes('function init()') && content.includes('const CONFIG = {')) {
            console.log('Using existing dist/game.js:', content.length, 'bytes');
            // Build dist/index.html from source index.html
            writeFileSync(`${distDir}/index.html`, html);
            console.log('Generated dist/index.html with external game.js');
        } else {
            console.error('ERROR: dist/game.js exists but is invalid');
            process.exit(1);
        }
    } else {
        console.error('ERROR: No inline JS found in index.html and no dist/game.js');
        process.exit(1);
    }
}

const finalJs = readFileSync(`${distDir}/game.js`, 'utf8');
console.log('CONFIG found:', finalJs.includes('const CONFIG = {'));
console.log('init() found:', finalJs.includes('function init()'));
console.log('sect.js found:', finalJs.includes('openTribulationRequest'));