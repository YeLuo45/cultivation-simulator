/**
 * ConsciousnessWave.test.js - 意识海测试
 * V395 Iteration 2/15 Round 13 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConsciousnessWave } from '../../../systems/ai/ConsciousnessWave.js';

describe('ConsciousnessWave', () => {
    let system;
    beforeEach(() => { system = new ConsciousnessWave(); });

    describe('createWave', () => {
        it('should create', () => {
            const { wave } = system.createWave({ cultivatorId: 'c1' });
            expect(wave.cultivatorId).toBe('c1');
        });

        it('should trigger waveCreated hook', () => {
            let called = false;
            system.registerHook('waveCreated', () => { called = true; });
            system.createWave({});
            expect(called).toBe(true);
        });
    });

    describe('getWave', () => {
        it('should return', () => {
            const { wave } = system.createWave({});
            expect(system.getWave(wave.waveId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWave('ghost')).toBeNull(); });
    });

    describe('listWaves', () => {
        it('should list all', () => {
            system.createWave({});
            expect(system.listWaves().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.createWave({ cultivatorId: 'c1' });
            system.createWave({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByDepth', () => {
        it('should filter', () => {
            system.createWave({ depth: 5 });
            system.createWave({ depth: 50 });
            expect(system.listByDepth(20).length).toBe(1);
        });
    });

    describe('expand', () => {
        it('should expand', () => {
            const { wave } = system.createWave({});
            system.expand(wave.waveId, 5);
            expect(wave.depth).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.expand('ghost', 5);
            expect(result.error).toBe('WAVE_NOT_FOUND');
        });

        it('should trigger waveExpanded hook', () => {
            const { wave } = system.createWave({});
            let called = false;
            system.registerHook('waveExpanded', () => { called = true; });
            system.expand(wave.waveId, 5);
            expect(called).toBe(true);
        });
    });

    describe('sharpen', () => {
        it('should sharpen', () => {
            const { wave } = system.createWave({});
            system.sharpen(wave.waveId, 5);
            expect(wave.sharpness).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.sharpen('ghost', 5);
            expect(result.error).toBe('WAVE_NOT_FOUND');
        });

        it('should trigger waveSharpened hook', () => {
            const { wave } = system.createWave({});
            let called = false;
            system.registerHook('waveSharpened', () => { called = true; });
            system.sharpen(wave.waveId, 5);
            expect(called).toBe(true);
        });
    });

    describe('releaseWave', () => {
        it('should release', () => {
            const { wave } = system.createWave({});
            system.releaseWave(wave.waveId);
            expect(wave.status).toBe('released');
        });

        it('should reject missing', () => {
            const result = system.releaseWave('ghost');
            expect(result.error).toBe('WAVE_NOT_FOUND');
        });

        it('should trigger waveReleased hook', () => {
            const { wave } = system.createWave({});
            let called = false;
            system.registerHook('waveReleased', () => { called = true; });
            system.releaseWave(wave.waveId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePower', () => {
        it('should calculate', () => {
            const { wave } = system.createWave({});
            expect(system.calculatePower(wave.waveId)).toBe(115);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePower('ghost')).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter', () => {
            const { wave } = system.createWave({});
            wave.status = 'released';
            system.createWave({});
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getWave', () => {
            const result = system.executeTool('getWave', { waveId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('waveCreated', () => count++);
            unregister();
            system.createWave({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('waveCreated', () => { throw new Error('x'); });
            expect(() => system.createWave({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWaves = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWaves = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createWave({});
            const json = system.toJSON();
            expect(json.waves.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createWave({});
            const json = system.toJSON();
            const newSys = new ConsciousnessWave();
            newSys.fromJSON(json);
            expect(newSys.waves.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.waveCount).toBe(0);
        });
    });
});