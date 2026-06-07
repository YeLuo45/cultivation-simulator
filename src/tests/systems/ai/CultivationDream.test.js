/**
 * CultivationDream.test.js - 修真梦系统测试
 * V768 Iteration 1/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDream } from '../../../systems/ai/CultivationDream.js';

describe('CultivationDream', () => {
    let system;
    beforeEach(() => { system = new CultivationDream(); });

    describe('recruitDream', () => {
        it('should recruit', () => {
            const { dream } = system.recruitDream({ masterId: 'm1', name: 'Lotus Dream' });
            expect(dream.masterId).toBe('m1');
            expect(dream.name).toBe('Lotus Dream');
        });

        it('should set default type lucid', () => {
            const { dream } = system.recruitDream({ masterId: 'm1' });
            expect(dream.type).toBe('lucid');
        });

        it('should set status novice', () => {
            const { dream } = system.recruitDream({ masterId: 'm1' });
            expect(dream.status).toBe('novice');
        });

        it('should trigger dreamRecruited hook', () => {
            let called = false;
            system.registerHook('dreamRecruited', () => { called = true; });
            system.recruitDream({});
            expect(called).toBe(true);
        });
    });

    describe('getDream', () => {
        it('should return', () => {
            const { dream } = system.recruitDream({});
            expect(system.getDream(dream.dreamId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDream('ghost')).toBeNull(); });
    });

    describe('listDreams', () => {
        it('should list all', () => {
            system.recruitDream({});
            system.recruitDream({});
            expect(system.listDreams().length).toBe(2);
        });
        it('should return empty', () => {
            expect(system.listDreams().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitDream({ masterId: 'm1' });
            system.recruitDream({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { dream: d1 } = system.recruitDream({ masterId: 'm1' });
            const { dream: d2 } = system.recruitDream({ masterId: 'm2' });
            system.legendDream(d2.dreamId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].dreamId).toBe(d2.dreamId);
        });
    });

    describe('addVision', () => {
        it('should add', () => {
            const { dream } = system.recruitDream({});
            system.addVision(dream.dreamId, 'see future');
            expect(dream.visions.length).toBe(1);
            expect(dream.visions[0]).toBe('see future');
        });

        it('should reject missing', () => {
            const result = system.addVision('ghost', 'v');
            expect(result.error).toBe('DREAM_NOT_FOUND');
        });

        it('should trigger visionAdded hook', () => {
            const { dream } = system.recruitDream({});
            let called = false;
            system.registerHook('visionAdded', () => { called = true; });
            system.addVision(dream.dreamId, 'v');
            expect(called).toBe(true);
        });
    });

    describe('raiseVividness', () => {
        it('should raise', () => {
            const { dream } = system.recruitDream({});
            system.raiseVividness(dream.dreamId, 10);
            expect(dream.vividness).toBe(30);
        });

        it('should use default amount', () => {
            const { dream } = system.recruitDream({});
            system.raiseVividness(dream.dreamId);
            expect(dream.vividness).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseVividness('ghost', 5);
            expect(result.error).toBe('DREAM_NOT_FOUND');
        });

        it('should trigger vividnessRaised hook', () => {
            const { dream } = system.recruitDream({});
            let called = false;
            system.registerHook('vividnessRaised', () => { called = true; });
            system.raiseVividness(dream.dreamId, 5);
            expect(called).toBe(true);
        });

        it('should set status veteran when vividness >= 100', () => {
            const { dream } = system.recruitDream({});
            system.raiseVividness(dream.dreamId, 100);
            expect(dream.status).toBe('veteran');
        });
    });

    describe('levelUpDream', () => {
        it('should level up', () => {
            const { dream } = system.recruitDream({});
            system.levelUpDream(dream.dreamId);
            expect(dream.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDream('ghost');
            expect(result.error).toBe('DREAM_NOT_FOUND');
        });
    });

    describe('legendDream', () => {
        it('should legendize', () => {
            const { dream } = system.recruitDream({});
            system.legendDream(dream.dreamId);
            expect(dream.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDream('ghost');
            expect(result.error).toBe('DREAM_NOT_FOUND');
        });

        it('should trigger dreamLegendized hook', () => {
            const { dream } = system.recruitDream({});
            let called = false;
            system.registerHook('dreamLegendized', () => { called = true; });
            system.legendDream(dream.dreamId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDreamValue', () => {
        it('should calculate', () => {
            const { dream } = system.recruitDream({});
            system.levelUpDream(dream.dreamId);
            system.addVision(dream.dreamId, 'v1');
            system.raiseVividness(dream.dreamId, 5);
            // level 2 * 100 + (20+5) * 2 + 1 * 30 = 200 + 50 + 30 = 280
            expect(system.calculateDreamValue(dream.dreamId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDreamValue('ghost')).toBe(0);
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

        it('should execute default getDream', () => {
            const result = system.executeTool('getDream', { dreamId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle null context', () => {
            system.registerTool('test', (ctx) => ctx && ctx.value ? ctx.value : 'no-value');
            const result = system.executeTool('test', null);
            expect(result.result).toBe('no-value');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dreamRecruited', () => count++);
            unregister();
            system.recruitDream({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dreamRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDream({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDreams = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDreams = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDream({});
            const json = system.toJSON();
            expect(json.dreams.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDream({});
            const json = system.toJSON();
            const newSys = new CultivationDream();
            newSys.fromJSON(json);
            expect(newSys.dreams.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dreamCount).toBe(0);
        });
    });
});
