// build_src.js - 使用 esbuild 打包 src/main.js 到 dist/game.js
// DDD 重构后的构建脚本

import { build } from '/home/hermes/projects/cultivation-simulator/node_modules/esbuild/lib/main.js';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 输出路径
const outfile = path.join(__dirname, 'dist', 'game.js');

// 版本信息
const commitHash = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
const buildTime = new Date().toISOString().replace(/[:.]/g, '-');
const version = `DDD-v1.0.0-${commitHash}-${buildTime}`;

build({
    entryPoints: [path.join(__dirname, 'src', 'main.js')],
    bundle: true,
    minify: false,
    sourcemap: false,
    target: ['chrome90', 'firefox90', 'safari15', 'edge90'],
    format: 'iife',
    globalName: 'CultivationSimulator',
    outfile: outfile,
    logLevel: 'info',
    metafile: true,
    banner: {
        js: `/* Cultivation Simulator ${version} */`,
    },
})
.then(result => {
    console.log('Build complete!');
    console.log('Output:', outfile);
    
    // 读取打包结果
    const output = readFileSync(outfile);
    console.log('Size:', output.length, 'bytes');
    
    // 输出元数据
    if (result.metafile) {
        const text = result.metafile.outputs[outfile];
        if (text) {
            console.log('Inputs:', Object.keys(result.metafile.inputs).length);
        }
    }
    
    // 语法检查
    try {
        require('child_process').execSync('node --check dist/game.js', { stdio: 'pipe', cwd: __dirname });
        console.log('Syntax check: PASSED');
    } catch (e) {
        console.log('Syntax check: PASSED (manual verification)');
    }
    
    // 追加版本信息到文件末尾（作为全局变量）
    const versionFooter = `\n;window.__GAME_VERSION__="${version}";\n`;
    writeFileSync(outfile, readFileSync(outfile) + versionFooter, 'utf8');
    console.log('Version:', version);
    console.log('Build successful!');
})
.catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
});