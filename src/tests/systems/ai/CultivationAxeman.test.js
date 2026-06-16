/**
 * CultivationAxeman.test.js - 修真斧手测试
 * V620 Iteration 3/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAxeman } from '../../../systems/ai/CultivationAxeman.js';

describe('CultivationAxeman', () => {
    let system;
    beforeEach(() => { system = new CultivationAxeman(); });

    describe('recruitAxeman', () => {
        it('should recruit', () => {
            const { axeman } = system.recruitAxeman({ trainerId: 't1', name: 'Wang', type: 'great' });
            expect(axeman.trainerId).toBe('t1');
            expect(axeman.name).toBe('Wang');
            expect(axeman.type).toBe('great');
            expect(axeman.strength).toBe(20);
            expect(axeman.level).toBe(1);
            expect(axeman.status).toBe('novice');
            expect(axeman.axes).toEqual([]);
        });

        it('should generate id when missing', () => {
            const { axeman } = system.recruitAxeman({});
            expect(axeman.axemanId).toBeDefined();
            expect(axeman.axemanId.length).toBeGreaterThan(0);
        });

        it('should use provided axemanId', () => {
            const { axeman } = system.recruitAxeman({ axemanId: 'custom-1' });
            expect(axeman.axemanId).toBe('custom-1');
        });

        it('should use default name', () => {
            const { axeman } = system.recruitAxeman({});
            expect(axeman.name).toBe('Anonymous Axeman');
        });

        it('should use provided axes', () => {
            const { axeman } = system.recruitAxeman({ axes: ['BattleAxe'] });
            expect(axeman.axes).toEqual(['BattleAxe']);
        });

        it('should use provided strength', () => {
            const { axeman } = system.recruitAxeman({ strength: 50 });
            expect(axeman.strength).toBe(50);
        });

        it('should trigger axemanRecruited hook', () => {
            let called = false;
            system.registerHook('axemanRecruited', () => { called = true; });
            system.recruitAxeman({});
            expect(called).toBe(true);
        });

        it('should increment totalAxemen stats', () => {
            system.recruitAxeman({});
            system.recruitAxeman({});
            expect(system.stats.totalAxemen).toBe(2);
        });
    });

    describe('getAxeman', () => {
        it('should return', () => {
            const { axeman } = system.recruitAxeman({});
            expect(system.getAxeman(axeman.axemanId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAxeman('ghost')).toBeNull(); });
        it('should return a copy', () => {
            const { axeman } = system.recruitAxeman({});
            const fetched = system.getAxeman(axeman.axemanId);
            fetched.name = 'Modified';
            const refetched = system.getAxeman(axeman.axemanId);
            expect(refetched.name).toBe(axeman.name);
        });
    });

    describe('listAxemen', () => {
        it('should list all', () => {
            system.recruitAxeman({});
            system.recruitAxeman({});
            expect(system.listAxemen().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listAxemen().length).toBe(0);
        });
    });

    describe('listByTrainer', () => {
        it('should filter', () => {
            system.recruitAxeman({ trainerId: 't1' });
            system.recruitAxeman({ trainerId: 't2' });
            expect(system.listByTrainer('t1').length).toBe(1);
        });
        it('should return empty when no match', () => {
            system.recruitAxeman({ trainerId: 't1' });
            expect(system.listByTrainer('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { axeman } = system.recruitAxeman({});
            system.legendAxeman(axeman.axemanId);
            system.recruitAxeman({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addAxe', () => {
        it('should add axe', () => {
            const { axeman } = system.recruitAxeman({});
            system.addAxe(axeman.axemanId, 'Dragon Cleaver');
            expect(axeman.axes).toContain('Dragon Cleaver');
            expect(axeman.axes.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addAxe('ghost', 'Spear');
            expect(result.error).toBe('AXEMAN_NOT_FOUND');
        });

        it('should trigger axeAdded hook', () => {
            const { axeman } = system.recruitAxeman({});
            let called = false;
            system.registerHook('axeAdded', () => { called = true; });
            system.addAxe(axeman.axemanId, 'Axe');
            expect(called).toBe(true);
        });

        it('should accumulate multiple axes', () => {
            const { axeman } = system.recruitAxeman({});
            system.addAxe(axeman.axemanId, 'Axe1');
            system.addAxe(axeman.axemanId, 'Axe2');
            expect(axeman.axes.length).toBe(2);
        });
    });

    describe('buildStrength', () => {
        it('should build with amount', () => {
            const { axeman } = system.recruitAxeman({});
            system.buildStrength(axeman.axemanId, 10);
            expect(axeman.strength).toBe(30);
        });

        it('should build with default', () => {
            const { axeman } = system.recruitAxeman({});
            system.buildStrength(axeman.axemanId);
            expect(axeman.strength).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.buildStrength('ghost', 10);
            expect(result.error).toBe('AXEMAN_NOT_FOUND');
        });

        it('should trigger strengthBuilt hook', () => {
            const { axeman } = system.recruitAxeman({});
            let called = false;
            system.registerHook('strengthBuilt', () => { called = true; });
            system.buildStrength(axeman.axemanId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAxeman', () => {
        it('should level up', () => {
            const { axeman } = system.recruitAxeman({});
            system.levelUpAxeman(axeman.axemanId);
            expect(axeman.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { axeman } = system.recruitAxeman({});
            for (let i = 0; i < 4; i++) system.levelUpAxeman(axeman.axemanId);
            expect(axeman.level).toBe(5);
            expect(axeman.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpAxeman('ghost');
            expect(result.error).toBe('AXEMAN_NOT_FOUND');
        });

        it('should trigger axemanLeveledUp hook', () => {
            const { axeman } = system.recruitAxeman({});
            let called = false;
            system.registerHook('axemanLeveledUp', () => { called = true; });
            system.levelUpAxeman(axeman.axemanId);
            expect(called).toBe(true);
        });
    });

    describe('legendAxeman', () => {
        it('should legendize', () => {
            const { axeman } = system.recruitAxeman({});
            system.legendAxeman(axeman.axemanId);
            expect(axeman.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendAxeman('ghost');
            expect(result.error).toBe('AXEMAN_NOT_FOUND');
        });

        it('should trigger axemanLegendized hook', () => {
            const { axeman } = system.recruitAxeman({});
            let called = false;
            system.registerHook('axemanLegendized', () => { called = true; });
            system.legendAxeman(axeman.axemanId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAxemanValue', () => {
        it('should calculate', () => {
            const { axeman } = system.recruitAxeman({});
            system.levelUpAxeman(axeman.axemanId);
            system.buildStrength(axeman.axemanId, 5);
            system.addAxe(axeman.axemanId, 'Axe');
            // level=2, strength=25, axes.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateAxemanValue(axeman.axemanId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAxemanValue('ghost')).toBe(0);
        });

        it('should reflect multiple axes in value', () => {
            const { axeman } = system.recruitAxeman({});
            system.addAxe(axeman.axemanId, 'A');
            system.addAxe(axeman.axemanId, 'B');
            // level=1, strength=20, axes.length=2 => 100 + 40 + 60 = 200
            expect(system.calculateAxemanValue(axeman.axemanId)).toBe(200);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { axeman } = system.recruitAxeman({});
            for (let i = 0; i < 4; i++) system.levelUpAxeman(axeman.axemanId);
            system.recruitAxeman({});
            expect(system.listVeterans().length).toBe(1);
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

        it('should execute default getAxeman', () => {
            const result = system.executeTool('getAxeman', { axemanId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitAxeman tool', () => {
            const result = system.executeTool('recruitAxeman', { name: 'ToolCreated' });
            expect(result.result.success).toBe(true);
            expect(result.result.axeman.name).toBe('ToolCreated');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('axemanRecruited', () => count++);
            unregister();
            system.recruitAxeman({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('axemanRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAxeman({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAxemen = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalAxemen = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAxeman({});
            const json = system.toJSON();
            expect(json.axemen.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAxeman({});
            const json = system.toJSON();
            const newSys = new CultivationAxeman();
            newSys.fromJSON(json);
            expect(newSys.axemen.size).toBe(1);
        });
        it('should preserve stats and config on serialize', () => {
            const json = system.toJSON();
            expect(json.stats).toBeDefined();
            expect(json.config).toBeDefined();
            expect(json.config.maxAxemen).toBe(50);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.axemanCount).toBe(0);
        });
        it('should reflect axemanCount after recruit', () => {
            system.recruitAxeman({});
            system.recruitAxeman({});
            expect(system.getStats().axemanCount).toBe(2);
        });
    });
});
