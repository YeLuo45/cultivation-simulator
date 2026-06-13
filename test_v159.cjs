const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('game.js', 'utf8');
const sandbox = {
    window: { gameState: {} },
    console: {
        log: (...args) => console.log('[LOG]', ...args),
        error: (...args) => console.error('[ERR]', ...args)
    },
    document: {},
    setTimeout: () => {},
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    fetch: () => {},
    Promise: Promise,
    Map: Map,
    Set: Set,
    JSON: JSON,
    Date: Date,
    Math: Math,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    Boolean: Boolean,
    RegExp: RegExp,
    Error: Error,
    TypeError: TypeError,
    RangeError: RangeError,
    SyntaxError: SyntaxError,
    ReferenceError: ReferenceError
};
vm.createContext(sandbox);

try {
    vm.runInContext(code, sandbox);
    const result = sandbox.v159Results;
    if (result) {
        console.log('V159 Tests:', result.passed + '/' + result.total + ' (' + (result.passRate * 100).toFixed(1) + '%)');
        if (result.passed < result.total) {
            const failed = result.results.filter(r => !r.pass);
            console.log('Failed tests:');
            failed.forEach(r => console.log('  -', r.name));
        }
    } else {
        console.log('v159Results not found');
    }
} catch (e) {
    console.error('Error:', e.message);
}