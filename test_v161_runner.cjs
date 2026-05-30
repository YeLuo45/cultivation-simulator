// V161 Test Runner
const fs = require('fs');
const vm = require('vm');

// Create mock window object
const window = {
    gameState: {
        spiritStones: 50000,
        energy: 100,
        level: 15,
        name: 'TestPlayer'
    },
    CONFIG: {
        realms: ['炼气', '筑基', '金丹', '元婴', '化神', '炼虚', '合体', '大乘', '渡劫', '真仙', '金仙', '太乙', '大罗']
    }
};

// Load and execute game.js
const code = fs.readFileSync('./game.js', 'utf8');
const script = new vm.Script(code, { filename: 'game.js' });
const context = vm.createContext({
    window: window,
    console: console,
    module: { exports: {} },
    exports: {}
});
script.runInContext(context);

// Run V161 tests
if (typeof runV161Tests === 'function') {
    const results = runV161Tests();
    console.log('\n=== V161 Test Summary ===');
    console.log(`Version: ${results.version}`);
    console.log(`Passed: ${results.passed}/${results.total}`);
    console.log(`Pass Rate: ${(results.passRate * 100).toFixed(1)}%`);
    process.exit(results.passed === results.total ? 0 : 1);
} else {
    console.log('runV161Tests not found');
    process.exit(1);
}