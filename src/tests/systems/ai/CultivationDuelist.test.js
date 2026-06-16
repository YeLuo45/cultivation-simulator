/**
 * CultivationDuelist.test.js - 修真剑客测试
 * V659 Iteration 12/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDuelist } from '../../../systems/ai/CultivationDuelist.js';

describe('CultivationDuelist', () => {
    let system;
    beforeEach(() => { system = new CultivationDuelist(); });

    describe('recruitDuelist', () => {
        it('should recruit', () => {
            const { duelist } = system.recruitDuelist({ name: 'Duel1' });
            expect(duelist.name).toBe('Duel1');
        });

        it('should default type to rapier', () => {
            const { duelist } = system.recruitDuelist({});
            expect(duelist.type).toBe('rapier');
        });

        it('should default elegance to baseElegance', () => {
            const { duelist } = system.recruitDuelist({});
            expect(duelist.elegance).toBe(20);
        });

        it('should default status to novice', () => {
            const { duelist } = system.recruitDuelist({});
            expect(duelist.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { duelist } = system.recruitDuelist({});
            expect(duelist.level).toBe(1);
        });

        it('should default swords to []', () => {
            const { duelist } = system.recruitDuelist({});
            expect(duelist.swords).toEqual([]);
        });

        it('should preserve masterId', () => {
            const { duelist } = system.recruitDuelist({ masterId: 'm1' });
            expect(duelist.masterId).toBe('m1');
        });

        it('should increment stats', () => {
            system.recruitDuelist({});
            expect(system.stats.totalDuelists).toBe(1);
        });

        it('should trigger duelistRecruited hook', () => {
            let called = false;
            system.registerHook('duelistRecruited', () => { called = true; });
            system.recruitDuelist({});
            expect(called).toBe(true);
        });
    });

    describe('getDuelist', () => {
        it('should return', () => {
            const { duelist } = system.recruitDuelist({});
            expect(system.getDuelist(duelist.duelistId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDuelist('ghost')).toBeNull(); });
    });

    describe('listDuelists', () => {
        it('should list all', () => {
            system.recruitDuelist({});
            system.recruitDuelist({});
            expect(system.listDuelists().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listDuelists().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitDuelist({ masterId: 'm1' });
            system.recruitDuelist({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitDuelist({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { duelist: a1 } = system.recruitDuelist({});
            const { duelist: a2 } = system.recruitDuelist({});
            a2.status = 'legendary';
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none', () => {
            system.recruitDuelist({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addSword', () => {
        it('should add a sword', () => {
            const { duelist } = system.recruitDuelist({});
            const result = system.addSword(duelist.duelistId, 'Razor');
            expect(result.success).toBe(true);
            expect(duelist.swords.length).toBe(1);
        });

        it('should accept string sword name', () => {
            const { duelist } = system.recruitDuelist({});
            system.addSword(duelist.duelistId, 'Sabre');
            expect(duelist.swords[0].name).toBe('Sabre');
        });

        it('should accept object sword', () => {
            const { duelist } = system.recruitDuelist({});
            system.addSword(duelist.duelistId, { name: 'Scimitar' });
            expect(duelist.swords[0].name).toBe('Scimitar');
        });

        it('should default name for nameless sword object', () => {
            const { duelist } = system.recruitDuelist({});
            system.addSword(duelist.duelistId, {});
            expect(duelist.swords[0].name).toBe('sword');
        });

        it('should reject missing', () => {
            const result = system.addSword('ghost', 'Razor');
            expect(result.error).toBe('DUELIST_NOT_FOUND');
        });

        it('should trigger swordAdded hook', () => {
            const { duelist } = system.recruitDuelist({});
            let called = false;
            system.registerHook('swordAdded', () => { called = true; });
            system.addSword(duelist.duelistId, 'Razor');
            expect(called).toBe(true);
        });
    });

    describe('raiseElegance', () => {
        it('should raise elegance with default amount', () => {
            const { duelist } = system.recruitDuelist({});
            system.raiseElegance(duelist.duelistId);
            expect(duelist.elegance).toBe(25);
        });

        it('should raise elegance with custom amount', () => {
            const { duelist } = system.recruitDuelist({});
            system.raiseElegance(duelist.duelistId, 10);
            expect(duelist.elegance).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseElegance('ghost', 5);
            expect(result.error).toBe('DUELIST_NOT_FOUND');
        });

        it('should trigger eleganceRaised hook', () => {
            const { duelist } = system.recruitDuelist({});
            let called = false;
            system.registerHook('eleganceRaised', () => { called = true; });
            system.raiseElegance(duelist.duelistId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDuelist', () => {
        it('should level up', () => {
            const { duelist } = system.recruitDuelist({});
            system.levelUpDuelist(duelist.duelistId);
            expect(duelist.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDuelist('ghost');
            expect(result.error).toBe('DUELIST_NOT_FOUND');
        });
    });

    describe('legendDuelist', () => {
        it('should set status to legendary', () => {
            const { duelist } = system.recruitDuelist({});
            system.legendDuelist(duelist.duelistId);
            expect(duelist.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDuelist('ghost');
            expect(result.error).toBe('DUELIST_NOT_FOUND');
        });

        it('should trigger duelistLegendized hook', () => {
            const { duelist } = system.recruitDuelist({});
            let called = false;
            system.registerHook('duelistLegendized', () => { called = true; });
            system.legendDuelist(duelist.duelistId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDuelistValue', () => {
        it('should calculate base value', () => {
            const { duelist } = system.recruitDuelist({});
            // level 1 * 100 + elegance 20 * 2 + 0 swords * 30 = 140
            expect(system.calculateDuelistValue(duelist.duelistId)).toBe(140);
        });

        it('should include sword bonus', () => {
            const { duelist } = system.recruitDuelist({});
            system.addSword(duelist.duelistId, 'Razor');
            system.addSword(duelist.duelistId, 'Sabre');
            // level 1 * 100 + elegance 20 * 2 + 2 * 30 = 200
            expect(system.calculateDuelistValue(duelist.duelistId)).toBe(200);
        });

        it('should include level bonus', () => {
            const { duelist } = system.recruitDuelist({});
            system.levelUpDuelist(duelist.duelistId);
            // level 2 * 100 + elegance 20 * 2 + 0 * 30 = 240
            expect(system.calculateDuelistValue(duelist.duelistId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDuelistValue('ghost')).toBe(0);
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

        it('should execute default getDuelist', () => {
            const result = system.executeTool('getDuelist', { duelistId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('duelistRecruited', () => count++);
            unregister();
            system.recruitDuelist({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('duelistRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDuelist({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDuelists = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDuelists = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDuelist({});
            const json = system.toJSON();
            expect(json.duelists.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDuelist({});
            const json = system.toJSON();
            const newSys = new CultivationDuelist();
            newSys.fromJSON(json);
            expect(newSys.duelists.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.duelistCount).toBe(0);
        });
    });
});
