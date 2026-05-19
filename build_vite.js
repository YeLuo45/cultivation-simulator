// build_vite.js - Robust CI build: constant module concatenation + syntax check
// 
// DDD Phase 1: Extract constants to domains/shared/constants/*.js
// During build: extracted constants are prepended to game.js
// Original game.js is NOT modified on disk
//
// Build order: constants stripped from game.js FIRST, then constants prepended

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const constantsDir = path.join(__dirname, 'domains/shared/constants');

mkdirSync(distDir, { recursive: true });

// Constants to remove from game.js (they're now in the extracted modules)
const CONSTANTS_TO_REMOVE = [
    'CONFIG', 'REALM_REQUIREMENTS', 'CONTINENTS', 'THIRTY_THREE_HEAVENS',
    'MAIN_PLOT', 'REGIONS', 'SECRET_REALMS', 'SERENDIPITY_EVENTS', 
    'SERENDIPITY_TALISMANS', 'SPIRIT_ROOT_QUALITIES', 'FIVE_ELEMENT_TECHNIQUES',
    'CONSTITUTIONS', 'DEFAULT_MINIMAX_CONFIG',
    'TECHNIQUE_BONUS', 'TECHNIQUE_COLORS', 'TECHNIQUES',
    'FIXED_OPPONENTS', 'MAX_ENERGY', 'SECT_CONFIG', 'PALACE_CONFIG', 'SECT_TECHNIQUES', 'TECHNIQUE_UPGRADE_MATERIALS',
    'TECHNIQUE_UPGRADE_EFFECTS', 'PET_TYPES', 'PET_QUALITY_MULTIPLIERS',
    'PET_FOOD_COST', 'PET_SUMMON_COST', 'PET_MAX_LEVEL', 'PET_EXP_NEEDED_PER_LEVEL',
    'PET_LOYALTY_DECAY_RATE', 'PET_HUNGER_DECAY_RATE', 'PET_MAX_LOYALTY',
    'PET_MAX_HUNGER', 'PET_BREEDING_COST', 'PET_BREEDING_MIN_LOYALTY',
    'PET_BREEDING_COOLDOWN', 'PET_INCUBATION_DAYS_BASE', 'PET_INCUBATION_DAYS_VAR',
    'PET_MAX_EGGS', 'PET_EGG_TYPES', 'PET_EGG_ICONS', 'PET_ADVANCEMENT_COSTS',
    'PET_ADVANCEMENT_BONUS_PER_LEVEL', 'PET_MAX_ADVANCEMENT', 'PET_TRANSFORMATION_STAGES',
    'PET_TRANSFORMATION_COSTS', 'PET_AWAKENING_SKILLS', 'PET_AWAKENING_COST',
    'PET_AWAKENING_EXP_COST', 'PET_MAX_AWAKENED_SKILLS', 'PET_FUSION_COST',
    'PET_FUSION_MIN_LOYALTY', 'PET_FUSION_COOLDOWN', 'PET_MUTATION_COST',
    'PET_MUTATION_COOLDOWN', 'PET_MUTATION_BASE_CHANCE', 'PET_GENE_TYPES',
    'PET_MUTATION_EFFECTS', 'PET_FUSION_COMBINATIONS', 'PILLS', 'TREASURES',
    'HEAVENLY_DAO_EQUIPMENTS', 'HEAVENLY_DAO_SET_BONUSES', 'COMBAT_TREASURES',
    'COMBAT_PILLS', 'ENHANCE_CONFIG', 'FURNACES', 'ANVILS', 'ALCHEMY_RECIPES',
    'FORGE_RECIPES', 'MATERIALS', 'ADVANCED_FORGE_RECIPES', 'CELESTIAL_ITEMS',
    'EXCHANGE_TIERS', 'CELESTIAL_REPUTATION_LEVELS', 'TRIBULATIONS',
    'ULTIMATE_SKILLS', 'SET_BONUSES', 'RANK_CONFIG', 'AI_OPPONENTS',
    'ACHIEVEMENTS', 'ACHIEVEMENT_ID_MAP'
];

/**
 * Remove a constant declaration from game.js content
 * Handles objects {}, arrays [], and simple values
 */
function removeConstant(content, constName) {
    const constDecl = `const ${constName} =`;
    const startPos = content.indexOf(constDecl);
    if (startPos === -1) {
        return content;
    }
    
    // Find the start of the line (including optional comment)
    // Comment format: "        // --- NAME ---" followed by newline, then const line
    // We need to include the comment line if it exists
    let lineStart = content.lastIndexOf('\n', startPos - 1) + 1;
    const beforeLineStart = content.lastIndexOf('\n', lineStart - 2) + 1;
    const prevLine = content.substring(beforeLineStart, lineStart - 1);
    if (prevLine.trim().startsWith('//')) {
        lineStart = beforeLineStart;
    }
    
    // Find the end of the declaration
    let endPos = startPos + constDecl.length;
    let braceCount = 0;
    let bracketCount = 0;
    let parenCount = 0;
    let inString = false;
    let stringChar = '';
    let started = false;
    
    for (let i = endPos; i < content.length; i++) {
        const c = content[i];
        const prevC = i > 0 ? content[i-1] : '';
        
        if (inString) {
            if (c === stringChar && prevC !== '\\') {
                inString = false;
            }
        } else {
            if (c === '"' || c === "'" || c === '`') {
                inString = true;
                stringChar = c;
            } else if (c === '{') {
                braceCount++;
                started = true;
            } else if (c === '}') {
                braceCount--;
                if (started && braceCount === 0 && bracketCount === 0 && parenCount === 0) {
                    endPos = i + 1;
                    break;
                }
            } else if (c === '[') {
                bracketCount++;
                started = true;
            } else if (c === ']') {
                bracketCount--;
                if (started && braceCount === 0 && bracketCount === 0 && parenCount === 0) {
                    endPos = i + 1;
                    break;
                }
            } else if (c === '(') {
                parenCount++;
            } else if (c === ')') {
                parenCount--;
            } else if (c === ';' && braceCount === 0 && bracketCount === 0 && parenCount === 0) {
                endPos = i + 1;
                break;
            }
        }
    }
    
    const replacement = `// [DDD Phase 1] ${constName} moved to domains/shared/constants/`;
    return content.substring(0, lineStart) + replacement + content.substring(endPos);
}

// --- Step 1: Load game.js and remove duplicated constants FIRST ---
const gamePath = path.join(__dirname, 'game.js');
let game = readFileSync(gamePath, 'utf8');
const originalLength = game.length;

for (const constName of CONSTANTS_TO_REMOVE) {
    game = removeConstant(game, constName);
}

const processedLength = game.length;
console.log(`Stripped constants from game.js: ${originalLength} -> ${processedLength} bytes (removed ${originalLength - processedLength})`);

// --- Step 2: Load and concatenate constant modules ---
const constantFiles = [
    'cultivation.js',
    'world.js',
    'pet.js',
    'inventory.js',
    'combat.js',
    'achievement.js'
];

let concatenatedConstants = '';
for (const filename of constantFiles) {
    const filePath = path.join(constantsDir, filename);
    try {
        let content = readFileSync(filePath, 'utf8');
        // Remove 'export' keyword since dist/game.js is a non-ESM script
        content = content.replace(/^\s*export\s+/gm, '');
        concatenatedConstants += '// ===== ' + filename + ' =====\n' + content + '\n\n';
        console.log(`Added constants: ${filename}`);
    } catch (e) {
        console.error(`Warning: Could not read ${filename}: ${e.message}`);
    }
}

// --- Step 3: Combine constants + processed game.js ---
const distGamePath = path.join(distDir, 'game.js');
const combinedGame = concatenatedConstants + game;
writeFileSync(distGamePath, combinedGame);
console.log(`Built game.js: ${processedLength} bytes (processed) + ${concatenatedConstants.length} bytes (constants) = ${combinedGame.length} bytes total`);

// --- Step 4: Copy index.html ---
const indexSrc = path.join(__dirname, 'index.html');
const indexDist = path.join(distDir, 'index.html');
let html = readFileSync(indexSrc, 'utf8');
html = html.replace(
  /<script\s+src=["']\.\/game\.js["']\s*>\s*<\/script>/g,
  `<script src="./game.js"></script>`
);
writeFileSync(indexDist, html);
console.log('Generated dist/index.html');

// --- Step 5: Validate content ---
const checks = [
  ['CONFIG object', 'const CONFIG = {'],
  ['init function', 'function init('],
  ['gameState object', 'let gameState = {'],
  ['startNewGame function', 'function startNewGame('],
  ['updateDisplay function', 'function updateDisplay('],
];

for (const [name, pattern] of checks) {
  const ok = combinedGame.includes(pattern);
  console.log(`  ${ok ? '✓' : '✗'} ${name}`);
}

// --- Step 6: Syntax check via node ---
try {
  execSync(`node --check "${distGamePath}"`, { stdio: 'pipe' });
  console.log('✓ Syntax check passed (node --check)');
} catch (e) {
  const err = e.stderr?.toString() || e.message;
  console.error('✗ Syntax check FAILED:', err.substring(0, 500));
  process.exit(1);
}

console.log('\nBuild complete!');
console.log(`  dist/game.js    — ${combinedGame.length} bytes (with constants)`);
console.log(`  dist/index.html — ${html.length} bytes`);
console.log('\nNote: Original game.js is unchanged on disk.');
