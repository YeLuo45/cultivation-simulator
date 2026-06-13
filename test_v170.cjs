window = global;
gameState = { playerName: '测试道友', spiritStones: 10000, realm: '筑基', level: 10 };

// Load the game code
const fs = require('fs');
const code = fs.readFileSync('game.js', 'utf8');
eval(code);

// Run V170 tests
const passed = v170Results.passed;
const total = v170Results.total;
console.log('V170 Test Results:', passed + '/' + total);
if (v170Results.results) {
    let failed = v170Results.results.filter(r => !r.pass);
    if (failed.length > 0) {
        console.log('Failed tests:');
        failed.forEach(r => console.log('  FAIL:', r.name));
    } else {
        console.log('All tests passed!');
    }
}