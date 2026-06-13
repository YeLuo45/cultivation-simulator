/**
 * CultivationDaoist.test.js - 修真道士测试
 * V638 Iteration 21/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDaoist } from '../../../systems/ai/CultivationDaoist.js';

describe('CultivationDaoist', () => {
    let system;
    beforeEach(() => { system = new CultivationDaoist(); });

    describe('recruitDaoist', () => {
        it('should recruit a daoist', () => {
            const { daoist } = system.recruitDaoist({ abbotId: 'a1', name: 'Daoist Ming' });
            expect(daoist.abbotId).toBe('a1');
            expect(daoist.name).toBe('Daoist Ming');
            expect(daoist.status).toBe('novice');
            expect(daoist.level).toBe(1);
        });

        it('should trigger daoistRecruited hook', () => {
            let called = false;
            system.registerHook('daoistRecruited', () => { called = true; });
            system.recruitDaoist({});
            expect(called).toBe(true);
        });
    });

    describe('getDaoist', () => {
        it('should return a daoist', () => {
            const { daoist } = system.recruitDaoist({});
            expect(system.getDaoist(daoist.daoistId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getDaoist('ghost')).toBeNull();
        });
    });

    describe('listDaoists', () => {
        it('should list all', () => {
            system.recruitDaoist({});
            system.recruitDaoist({});
            expect(system.listDaoists().length).toBe(2);
        });
    });

    describe('listByAbbot', () => {
        it('should filter by abbot', () => {
            system.recruitDaoist({ abbotId: 'a1' });
            system.recruitDaoist({ abbotId: 'a2' });
            expect(system.listByAbbot('a1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { daoist: d1 } = system.recruitDaoist({});
            system.recruitDaoist({});
            system.legendDaoist(d1.daoistId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addTalisman', () => {
        it('should add talisman', () => {
            const { daoist } = system.recruitDaoist({});
            system.addTalisman(daoist.daoistId, 'fire-talisman');
            expect(daoist.talismans.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addTalisman('ghost', 'x');
            expect(result.error).toBe('DAOIST_NOT_FOUND');
        });

        it('should trigger talismanAdded hook', () => {
            const { daoist } = system.recruitDaoist({});
            let called = false;
            system.registerHook('talismanAdded', () => { called = true; });
            system.addTalisman(daoist.daoistId, 'fire-talisman');
            expect(called).toBe(true);
        });
    });

    describe('raisePurity', () => {
        it('should raise purity', () => {
            const { daoist } = system.recruitDaoist({});
            system.raisePurity(daoist.daoistId, 10);
            expect(daoist.purity).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raisePurity('ghost', 5);
            expect(result.error).toBe('DAOIST_NOT_FOUND');
        });

        it('should trigger purityRaised hook', () => {
            const { daoist } = system.recruitDaoist({});
            let called = false;
            system.registerHook('purityRaised', () => { called = true; });
            system.raisePurity(daoist.daoistId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDaoist', () => {
        it('should level up', () => {
            const { daoist } = system.recruitDaoist({});
            system.levelUpDaoist(daoist.daoistId);
            expect(daoist.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDaoist('ghost');
            expect(result.error).toBe('DAOIST_NOT_FOUND');
        });

        it('should trigger daoistLeveledUp hook', () => {
            const { daoist } = system.recruitDaoist({});
            let called = false;
            system.registerHook('daoistLeveledUp', () => { called = true; });
            system.levelUpDaoist(daoist.daoistId);
            expect(called).toBe(true);
        });
    });

    describe('legendDaoist', () => {
        it('should set status to legendary', () => {
            const { daoist } = system.recruitDaoist({});
            system.legendDaoist(daoist.daoistId);
            expect(daoist.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDaoist('ghost');
            expect(result.error).toBe('DAOIST_NOT_FOUND');
        });

        it('should trigger daoistLegendized hook', () => {
            const { daoist } = system.recruitDaoist({});
            let called = false;
            system.registerHook('daoistLegendized', () => { called = true; });
            system.legendDaoist(daoist.daoistId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDaoistValue', () => {
        it('should calculate value', () => {
            const { daoist } = system.recruitDaoist({});
            system.addTalisman(daoist.daoistId, 't1');
            // level=1, purity=20 (default basePurity), talismans=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateDaoistValue(daoist.daoistId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDaoistValue('ghost')).toBe(0);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getDaoist', () => {
            const result = system.executeTool('getDaoist', { daoistId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('daoistRecruited', () => count++);
            unregister();
            system.recruitDaoist({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('daoistRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDaoist({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDaoists = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDaoists = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDaoist({});
            const json = system.toJSON();
            expect(json.daoists.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDaoist({});
            const json = system.toJSON();
            const newSys = new CultivationDaoist();
            newSys.fromJSON(json);
            expect(newSys.daoists.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.daoistCount).toBe(0);
        });
    });
});
