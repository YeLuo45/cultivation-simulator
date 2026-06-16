/**
 * CultivationDusk.test.js - 修真黄昏系统测试
 * V816 Iteration 19/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDusk } from '../../../systems/ai/CultivationDusk.js';

describe('CultivationDusk', () => {
    let system;
    beforeEach(() => { system = new CultivationDusk(); });

    describe('recruitDusk', () => {
        it('should recruit', () => {
            const { dusk } = system.recruitDusk({ masterId: 'm1', name: 'Twilight' });
            expect(dusk.masterId).toBe('m1');
            expect(dusk.name).toBe('Twilight');
        });

        it('should default name to Unnamed Dusk', () => {
            const { dusk } = system.recruitDusk({});
            expect(dusk.name).toBe('Unnamed Dusk');
        });

        it('should default type to early', () => {
            const { dusk } = system.recruitDusk({});
            expect(dusk.type).toBe('early');
        });

        it('should initialize level 1', () => {
            const { dusk } = system.recruitDusk({});
            expect(dusk.level).toBe(1);
        });

        it('should initialize status novice', () => {
            const { dusk } = system.recruitDusk({});
            expect(dusk.status).toBe('novice');
        });

        it('should default shadow to baseShadow 20', () => {
            const { dusk } = system.recruitDusk({});
            expect(dusk.shadow).toBe(20);
        });

        it('should initialize empty afterglows', () => {
            const { dusk } = system.recruitDusk({});
            expect(dusk.afterglows).toEqual([]);
        });

        it('should trigger duskRecruited hook', () => {
            let called = false;
            system.registerHook('duskRecruited', () => { called = true; });
            system.recruitDusk({});
            expect(called).toBe(true);
        });

        it('should generate duskId if not provided', () => {
            const { dusk } = system.recruitDusk({});
            expect(dusk.duskId).toBeTruthy();
            expect(typeof dusk.duskId).toBe('string');
        });

        it('should accept custom duskId', () => {
            const { dusk } = system.recruitDusk({ duskId: 'custom123' });
            expect(dusk.duskId).toBe('custom123');
        });

        it('should accept custom shadow value', () => {
            const { dusk } = system.recruitDusk({ shadow: 50 });
            expect(dusk.shadow).toBe(50);
        });
    });

    describe('getDusk', () => {
        it('should return', () => {
            const { dusk } = system.recruitDusk({});
            expect(system.getDusk(dusk.duskId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDusk('ghost')).toBeNull(); });
    });

    describe('listDusks', () => {
        it('should list all', () => {
            system.recruitDusk({});
            expect(system.listDusks().length).toBe(1);
        });

        it('should be empty initially', () => {
            expect(system.listDusks().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitDusk({ masterId: 'm1' });
            system.recruitDusk({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitDusk({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list legendary dusks', () => {
            const { dusk: s1 } = system.recruitDusk({});
            const { dusk: s2 } = system.recruitDusk({});
            system.legendDusk(s1.duskId);
            system.legendDusk(s2.duskId);
            expect(system.listLegendary().length).toBe(2);
        });

        it('should return empty when no legendary', () => {
            system.recruitDusk({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addAfterglow', () => {
        it('should add afterglow', () => {
            const { dusk } = system.recruitDusk({});
            system.addAfterglow(dusk.duskId, 'crimson');
            expect(dusk.afterglows).toContain('crimson');
        });

        it('should reject missing', () => {
            const result = system.addAfterglow('ghost', 'red');
            expect(result.error).toBe('DUSK_NOT_FOUND');
        });

        it('should trigger afterglowAdded hook', () => {
            const { dusk } = system.recruitDusk({});
            let called = false;
            system.registerHook('afterglowAdded', () => { called = true; });
            system.addAfterglow(dusk.duskId, 'amber');
            expect(called).toBe(true);
        });
    });

    describe('raiseShadow', () => {
        it('should raise shadow by 5 default', () => {
            const { dusk } = system.recruitDusk({});
            system.raiseShadow(dusk.duskId);
            expect(dusk.shadow).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { dusk } = system.recruitDusk({});
            system.raiseShadow(dusk.duskId, 30);
            expect(dusk.shadow).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseShadow('ghost', 10);
            expect(result.error).toBe('DUSK_NOT_FOUND');
        });

        it('should trigger shadowRaised hook', () => {
            const { dusk } = system.recruitDusk({});
            let called = false;
            system.registerHook('shadowRaised', () => { called = true; });
            system.raiseShadow(dusk.duskId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDusk', () => {
        it('should level up', () => {
            const { dusk } = system.recruitDusk({});
            system.levelUpDusk(dusk.duskId);
            expect(dusk.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDusk('ghost');
            expect(result.error).toBe('DUSK_NOT_FOUND');
        });

        it('should trigger duskLeveledUp hook', () => {
            const { dusk } = system.recruitDusk({});
            let called = false;
            system.registerHook('duskLeveledUp', () => { called = true; });
            system.levelUpDusk(dusk.duskId);
            expect(called).toBe(true);
        });
    });

    describe('legendDusk', () => {
        it('should set status legendary', () => {
            const { dusk } = system.recruitDusk({});
            system.legendDusk(dusk.duskId);
            expect(dusk.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDusk('ghost');
            expect(result.error).toBe('DUSK_NOT_FOUND');
        });

        it('should trigger duskLegendized hook', () => {
            const { dusk } = system.recruitDusk({});
            let called = false;
            system.registerHook('duskLegendized', () => { called = true; });
            system.legendDusk(dusk.duskId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDuskValue', () => {
        it('should calculate', () => {
            const { dusk } = system.recruitDusk({});
            system.levelUpDusk(dusk.duskId);
            system.addAfterglow(dusk.duskId, 'crimson');
            system.addAfterglow(dusk.duskId, 'amber');
            // level=2 => 200, shadow=20 => 40, afterglows=2 => 60, total=300
            expect(system.calculateDuskValue(dusk.duskId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDuskValue('ghost')).toBe(0);
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

        it('should execute default getDusk', () => {
            const result = system.executeTool('getDusk', { duskId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitDusk', () => {
            const result = system.executeTool('recruitDusk', { masterId: 'mX' });
            expect(result.success).toBe(true);
            expect(result.result.dusk.masterId).toBe('mX');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('duskRecruited', () => count++);
            unregister();
            system.recruitDusk({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('duskRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDusk({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDusks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(system.config.maxDusks).toBe(50);
        });
        it('should not double evolve', () => {
            system.stats.totalDusks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDusk({});
            const json = system.toJSON();
            expect(json.dusks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDusk({});
            const json = system.toJSON();
            const newSys = new CultivationDusk();
            newSys.fromJSON(json);
            expect(newSys.dusks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.duskCount).toBe(0);
            expect(stats.totalDusks).toBe(0);
        });
    });
});
