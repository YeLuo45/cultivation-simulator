// V177 Test Runner
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('./game.js', 'utf8');
const sandbox = {
    window: {},
    console: console,
    module: module,
    exports: exports,
    require: require,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Math: Math,
    Date: Date,
    JSON: JSON,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Map: Map,
    Set: Set
};

vm.createContext(sandbox);

try {
    vm.runInContext(code, sandbox);
    
    // Find test results in global scope
    if (sandbox.v177Results) {
        console.log('V177 Results:', sandbox.v177Results.passed + '/' + sandbox.v177Results.total, '(' + (parseFloat(sandbox.v177Results.passRate) * 100).toFixed(1) + '%)');
    } else {
        console.log('V177 tests not executed');
    }
    
    if (sandbox.v176Results) {
        console.log('V176 Results:', sandbox.v176Results.passed + '/' + sandbox.v176Results.total, '(' + (parseFloat(sandbox.v176Results.passRate) * 100).toFixed(1) + '%)');
    }
    
    if (sandbox.v175Results) {
        console.log('V175 Results:', sandbox.v175Results.passed + '/' + sandbox.v175Results.total, '(' + (parseFloat(sandbox.v175Results.passRate) * 100).toFixed(1) + '%)');
    }
} catch(e) {
    console.error('Error:', e.message);
}