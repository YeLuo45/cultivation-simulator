// V155 Test Runner
const fs = require('fs');
const vm = require('vm');

const window = {
    gameState: {
        spiritStones: 1000,
        realm: 1,
        level: 1,
        achievementV2: null,
        badgeV2: null
    }
};

const code = fs.readFileSync('./game.js', 'utf8');
const context = vm.createContext({
    window: window,
    gameState: window.gameState,
    console: console,
    require: require,
    module: module,
    exports: exports,
    process: process,
    setTimeout: setTimeout,
    setInterval: setInterval,
    clearTimeout: clearTimeout,
    clearInterval: clearInterval
});

vm.runInContext(code, context);

if (typeof runV155Tests === 'function') {
    const result = runV155Tests();
    console.log('V155 Results:', result.passed + '/' + result.total, '(' + (result.passRate * 100).toFixed(1) + '%)');
} else {
    console.log('runV155Tests not found');
}