// Minimal test for V156 functions
const fs = require('fs');
const code = fs.readFileSync('game.js', 'utf8');

// Create mock context
global.window = {
    gameState: {
        realm: 0,
        combatPower: 1000,
        energy: 100,
        spiritStones: 0
    }
};
global.document = {
    getElementById: () => ({ textContent: '', value: '', innerHTML: '', style: {} }),
    querySelector: () => ({ addEventListener: () => {} }),
    createElement: () => ({ appendChild: () => {} }),
    body: { appendChild: () => {} }
};
global.console = console;
global.setTimeout = () => {};
global.setInterval = () => {};

// Execute code
eval(code);

// Check if V156 results exist
if (global.v156Results) {
    console.log('V156 Tests:', global.v156Results.passed + '/' + global.v156Results.total);
} else {
    console.log('V156 tests not found');
}