/**
 * CultivationLegalist.test.js - 修真法家测试
 * V641 Iteration 24/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLegalist } from '../../../systems/ai/CultivationLegalist.js';

describe('CultivationLegalist', () => {
    let system;
    beforeEach(() => { system = new CultivationLegalist(); });

    describe('recruitLegalist', () => {
        it('should recruit', () => {
            const { legalist } = system.recruitLegalist({ magistrateId: 'mag1' });
            expect(legalist.magistrateId).toBe('mag1');
        });

        it('should default name', () => {
            const { legalist } = system.recruitLegalist({});
            expect(legalist.name).toBe('Unnamed Legalist');
        });

        it('should default type to strict', () => {
            const { legalist } = system.recruitLegalist({});
            expect(legalist.type).toBe('strict');
        });

        it('should default law to baseLaw', () => {
            const { legalist } = system.recruitLegalist({});
            expect(legalist.law).toBe(20);
        });

        it('should default level to 1', () => {
            const { legalist } = system.recruitLegalist({});
            expect(legalist.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { legalist } = system.recruitLegalist({});
            expect(legalist.status).toBe('novice');
        });

        it('should accept custom type rewarding', () => {
            const { legalist } = system.recruitLegalist({ type: 'rewarding' });
            expect(legalist.type).toBe('rewarding');
        });

        it('should accept custom type punishing', () => {
            const { legalist } = system.recruitLegalist({ type: 'punishing' });
            expect(legalist.type).toBe('punishing');
        });

        it('should accept custom name', () => {
            const { legalist } = system.recruitLegalist({ name: 'Lord Shang' });
            expect(legalist.name).toBe('Lord Shang');
        });

        it('should accept custom law', () => {
            const { legalist } = system.recruitLegalist({ law: 50 });
            expect(legalist.law).toBe(50);
        });

        it('should start with empty statutes', () => {
            const { legalist } = system.recruitLegalist({});
            expect(legalist.statutes).toEqual([]);
        });

        it('should trigger legalistRecruited hook', () => {
            let called = false;
            system.registerHook('legalistRecruited', () => { called = true; });
            system.recruitLegalist({});
            expect(called).toBe(true);
        });
    });

    describe('getLegalist', () => {
        it('should return', () => {
            const { legalist } = system.recruitLegalist({});
            expect(system.getLegalist(legalist.legalistId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLegalist('ghost')).toBeNull(); });
    });

    describe('listLegalists', () => {
        it('should list all', () => {
            system.recruitLegalist({});
            system.recruitLegalist({});
            expect(system.listLegalists().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listLegalists().length).toBe(0);
        });
    });

    describe('listByMagistrate', () => {
        it('should filter by magistrate', () => {
            system.recruitLegalist({ magistrateId: 'mag1' });
            system.recruitLegalist({ magistrateId: 'mag2' });
            expect(system.listByMagistrate('mag1').length).toBe(1);
        });

        it('should return multiple for same magistrate', () => {
            system.recruitLegalist({ magistrateId: 'mag1' });
            system.recruitLegalist({ magistrateId: 'mag1' });
            expect(system.listByMagistrate('mag1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { legalist } = system.recruitLegalist({});
            system.recruitLegalist({});
            system.legendLegalist(legalist.legalistId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitLegalist({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addStatute', () => {
        it('should add statute', () => {
            const { legalist } = system.recruitLegalist({});
            system.addStatute(legalist.legalistId, 'Statute-001');
            expect(legalist.statutes).toContain('Statute-001');
        });

        it('should add multiple statutes', () => {
            const { legalist } = system.recruitLegalist({});
            system.addStatute(legalist.legalistId, 'Statute-001');
            system.addStatute(legalist.legalistId, 'Statute-002');
            expect(legalist.statutes.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addStatute('ghost', 'Statute-001');
            expect(result.error).toBe('LEGALIST_NOT_FOUND');
        });

        it('should trigger statuteAdded hook', () => {
            const { legalist } = system.recruitLegalist({});
            let called = false;
            system.registerHook('statuteAdded', () => { called = true; });
            system.addStatute(legalist.legalistId, 'Statute-001');
            expect(called).toBe(true);
        });
    });

    describe('enforceLaw', () => {
        it('should enforce law', () => {
            const { legalist } = system.recruitLegalist({});
            system.enforceLaw(legalist.legalistId, 10);
            expect(legalist.law).toBe(30);
        });

        it('should default amount to 5', () => {
            const { legalist } = system.recruitLegalist({});
            system.enforceLaw(legalist.legalistId);
            expect(legalist.law).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.enforceLaw('ghost', 5);
            expect(result.error).toBe('LEGALIST_NOT_FOUND');
        });

        it('should trigger lawEnforced hook', () => {
            const { legalist } = system.recruitLegalist({});
            let called = false;
            system.registerHook('lawEnforced', () => { called = true; });
            system.enforceLaw(legalist.legalistId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpLegalist', () => {
        it('should level up', () => {
            const { legalist } = system.recruitLegalist({});
            system.levelUpLegalist(legalist.legalistId);
            expect(legalist.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { legalist } = system.recruitLegalist({});
            system.levelUpLegalist(legalist.legalistId);
            system.levelUpLegalist(legalist.legalistId);
            system.levelUpLegalist(legalist.legalistId);
            expect(legalist.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpLegalist('ghost');
            expect(result.error).toBe('LEGALIST_NOT_FOUND');
        });
    });

    describe('legendLegalist', () => {
        it('should legendize', () => {
            const { legalist } = system.recruitLegalist({});
            system.legendLegalist(legalist.legalistId);
            expect(legalist.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendLegalist('ghost');
            expect(result.error).toBe('LEGALIST_NOT_FOUND');
        });

        it('should trigger legalistLegendized hook', () => {
            const { legalist } = system.recruitLegalist({});
            let called = false;
            system.registerHook('legalistLegendized', () => { called = true; });
            system.legendLegalist(legalist.legalistId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLegalistValue', () => {
        it('should calculate with default values', () => {
            const { legalist } = system.recruitLegalist({});
            // level=1, law=20, statutes=[] => 1*100 + 20*2 + 0 = 140
            expect(system.calculateLegalistValue(legalist.legalistId)).toBe(140);
        });

        it('should calculate with level up', () => {
            const { legalist } = system.recruitLegalist({});
            system.levelUpLegalist(legalist.legalistId);
            // level=2, law=20, statutes=[] => 2*100 + 20*2 + 0 = 240
            expect(system.calculateLegalistValue(legalist.legalistId)).toBe(240);
        });

        it('should calculate with law enforced', () => {
            const { legalist } = system.recruitLegalist({});
            system.enforceLaw(legalist.legalistId, 10);
            // level=1, law=30, statutes=[] => 1*100 + 30*2 + 0 = 160
            expect(system.calculateLegalistValue(legalist.legalistId)).toBe(160);
        });

        it('should calculate with statutes', () => {
            const { legalist } = system.recruitLegalist({});
            system.addStatute(legalist.legalistId, 'S1');
            system.addStatute(legalist.legalistId, 'S2');
            // level=1, law=20, statutes=2 => 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateLegalistValue(legalist.legalistId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLegalistValue('ghost')).toBe(0);
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

        it('should execute default getLegalist', () => {
            const result = system.executeTool('getLegalist', { legalistId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitLegalist', () => {
            const result = system.executeTool('recruitLegalist', { magistrateId: 'mag1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('legalistRecruited', () => count++);
            unregister();
            system.recruitLegalist({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('legalistRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitLegalist({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLegalists = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLegalists = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitLegalist({});
            const json = system.toJSON();
            expect(json.legalists.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitLegalist({});
            const json = system.toJSON();
            const newSys = new CultivationLegalist();
            newSys.fromJSON(json);
            expect(newSys.legalists.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.legalistCount).toBe(0);
        });
    });
});
