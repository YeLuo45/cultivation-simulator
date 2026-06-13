/**
 * CatastropheEngine.test.js - 灾难引擎测试
 * V386 Iteration 2/9 Round 12 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CatastropheEngine } from '../../../systems/ai/CatastropheEngine.js';

describe('CatastropheEngine', () => {
    let system;
    beforeEach(() => { system = new CatastropheEngine(); });

    describe('triggerCatastrophe', () => {
        it('should trigger', () => {
            const { catastrophe } = system.triggerCatastrophe({ name: 'C1' });
            expect(catastrophe.name).toBe('C1');
        });

        it('should trigger catastropheTriggered hook', () => {
            let called = false;
            system.registerHook('catastropheTriggered', () => { called = true; });
            system.triggerCatastrophe({});
            expect(called).toBe(true);
        });
    });

    describe('getCatastrophe', () => {
        it('should return', () => {
            const { catastrophe } = system.triggerCatastrophe({});
            expect(system.getCatastrophe(catastrophe.catastropheId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCatastrophe('ghost')).toBeNull(); });
    });

    describe('listCatastrophes', () => {
        it('should list all', () => {
            system.triggerCatastrophe({});
            expect(system.listCatastrophes().length).toBe(1);
        });
    });

    describe('listOngoing', () => {
        it('should filter', () => {
            const { catastrophe } = system.triggerCatastrophe({});
            catastrophe.status = 'ended';
            system.triggerCatastrophe({});
            expect(system.listOngoing().length).toBe(1);
        });
    });

    describe('listByKind', () => {
        it('should filter', () => {
            system.triggerCatastrophe({ kind: 'flood' });
            system.triggerCatastrophe({ kind: 'fire' });
            expect(system.listByKind('flood').length).toBe(1);
        });
    });

    describe('recordCasualties', () => {
        it('should record', () => {
            const { catastrophe } = system.triggerCatastrophe({});
            system.recordCasualties(catastrophe.catastropheId, 100);
            expect(catastrophe.casualties).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.recordCasualties('ghost', 1);
            expect(result.error).toBe('CATASTROPHE_NOT_FOUND');
        });

        it('should trigger casualtiesRecorded hook', () => {
            const { catastrophe } = system.triggerCatastrophe({});
            let called = false;
            system.registerHook('casualtiesRecorded', () => { called = true; });
            system.recordCasualties(catastrophe.catastropheId, 1);
            expect(called).toBe(true);
        });
    });

    describe('mitigate', () => {
        it('should reduce', () => {
            const { catastrophe } = system.triggerCatastrophe({ destructivePower: 100 });
            system.mitigate(catastrophe.catastropheId, 30);
            expect(catastrophe.destructivePower).toBe(70);
        });

        it('should cap at 0', () => {
            const { catastrophe } = system.triggerCatastrophe({ destructivePower: 50 });
            system.mitigate(catastrophe.catastropheId, 100);
            expect(catastrophe.destructivePower).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.mitigate('ghost', 10);
            expect(result.error).toBe('CATASTROPHE_NOT_FOUND');
        });

        it('should trigger catastropheMitigated hook', () => {
            const { catastrophe } = system.triggerCatastrophe({});
            let called = false;
            system.registerHook('catastropheMitigated', () => { called = true; });
            system.mitigate(catastrophe.catastropheId, 10);
            expect(called).toBe(true);
        });
    });

    describe('endCatastrophe', () => {
        it('should end', () => {
            const { catastrophe } = system.triggerCatastrophe({});
            system.endCatastrophe(catastrophe.catastropheId);
            expect(catastrophe.status).toBe('ended');
        });

        it('should reject missing', () => {
            const result = system.endCatastrophe('ghost');
            expect(result.error).toBe('CATASTROPHE_NOT_FOUND');
        });

        it('should trigger catastropheEnded hook', () => {
            const { catastrophe } = system.triggerCatastrophe({});
            let called = false;
            system.registerHook('catastropheEnded', () => { called = true; });
            system.endCatastrophe(catastrophe.catastropheId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTotalDestructivePower', () => {
        it('should calculate', () => {
            system.triggerCatastrophe({ destructivePower: 100 });
            system.triggerCatastrophe({ destructivePower: 200 });
            expect(system.calculateTotalDestructivePower()).toBe(300);
        });
    });

    describe('calculateTotalCasualties', () => {
        it('should calculate', () => {
            const { catastrophe: c1 } = system.triggerCatastrophe({});
            const { catastrophe: c2 } = system.triggerCatastrophe({});
            system.recordCasualties(c1.catastropheId, 10);
            system.recordCasualties(c2.catastropheId, 20);
            expect(system.calculateTotalCasualties()).toBe(30);
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

        it('should execute default getCatastrophe', () => {
            const result = system.executeTool('getCatastrophe', { catastropheId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('catastropheTriggered', () => count++);
            unregister();
            system.triggerCatastrophe({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('catastropheTriggered', () => { throw new Error('x'); });
            expect(() => system.triggerCatastrophe({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCatastrophes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCatastrophes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.triggerCatastrophe({});
            const json = system.toJSON();
            expect(json.catastrophes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.triggerCatastrophe({});
            const json = system.toJSON();
            const newSys = new CatastropheEngine();
            newSys.fromJSON(json);
            expect(newSys.catastrophes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.catastropheCount).toBe(0);
        });
    });
});