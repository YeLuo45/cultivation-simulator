const fs = require('fs');
const vm = require('vm');

// Create a context with window = global
const context = { window: global };
context.global = context;
context.console = console;

const code = fs.readFileSync('game.js', 'utf8');
const script = new vm.Script(code);
script.runInNewContext(context);

// Run tests
const r = context.runV212Tests();
console.log('V212 Tests:', r.passed + '/' + r.total, '(' + (r.passRate * 100) + '%)');
console.log('All passed:', r.passed === r.total);
if (r.passed < r.total) {
    console.log('Failed tests:');
    r.results.filter(x => !x.pass).forEach(x => console.log('  -', x.name));
}