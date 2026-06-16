/**
 * CultivationChampion.test.js - 修真冠军测试
 * V660 Iteration 13/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationChampion } from '../../../systems/ai/CultivationChampion.js';

describe('CultivationChampion', () => {
    let system;
    beforeEach(() => { system = new CultivationChampion(); });

    describe('recruitChampion', () => {
        it('should recruit', () => {
            const { champion } = system.recruitChampion({ masterId: 'm1', name: 'Li', type: 'arena' });
            expect(champion.masterId).toBe('m1');
            expect(champion.name).toBe('Li');
            expect(champion.type).toBe('arena');
            expect(champion.glory).toBe(20);
            expect(champion.level).toBe(1);
            expect(champion.status).toBe('novice');
            expect(champion.trophies).toEqual([]);
        });

        it('should default name to Anonymous Champion', () => {
            const { champion } = system.recruitChampion({});
            expect(champion.name).toBe('Anonymous Champion');
        });

        it('should default type to arena', () => {
            const { champion } = system.recruitChampion({});
            expect(champion.type).toBe('arena');
        });

        it('should default glory to baseGlory=20', () => {
            const { champion } = system.recruitChampion({});
            expect(champion.glory).toBe(20);
        });

        it('should generate id if not provided', () => {
            const { champion } = system.recruitChampion({});
            expect(champion.championId).toBeDefined();
            expect(champion.championId.length).toBeGreaterThan(0);
        });

        it('should increment totalChampions stat', () => {
            system.recruitChampion({});
            system.recruitChampion({});
            expect(system.stats.totalChampions).toBe(2);
        });

        it('should trigger championRecruited hook', () => {
            let called = false;
            system.registerHook('championRecruited', () => { called = true; });
            system.recruitChampion({});
            expect(called).toBe(true);
        });
    });

    describe('getChampion', () => {
        it('should return', () => {
            const { champion } = system.recruitChampion({});
            expect(system.getChampion(champion.championId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getChampion('ghost')).toBeNull(); });
    });

    describe('listChampions', () => {
        it('should list all', () => {
            system.recruitChampion({});
            system.recruitChampion({});
            expect(system.listChampions().length).toBe(2);
        });

        it('should return empty array when no champions', () => {
            expect(system.listChampions().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitChampion({ masterId: 'm1' });
            system.recruitChampion({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitChampion({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { champion } = system.recruitChampion({});
            system.legendChampion(champion.championId);
            system.recruitChampion({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitChampion({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTrophy', () => {
        it('should add trophy', () => {
            const { champion } = system.recruitChampion({});
            system.addTrophy(champion.championId, 'Golden Cup');
            expect(champion.trophies).toContain('Golden Cup');
            expect(champion.trophies.length).toBe(1);
        });

        it('should add multiple trophies', () => {
            const { champion } = system.recruitChampion({});
            system.addTrophy(champion.championId, 'Cup1');
            system.addTrophy(champion.championId, 'Cup2');
            expect(champion.trophies.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addTrophy('ghost', 'Cup');
            expect(result.error).toBe('CHAMPION_NOT_FOUND');
        });

        it('should trigger trophyAdded hook', () => {
            const { champion } = system.recruitChampion({});
            let called = false;
            system.registerHook('trophyAdded', () => { called = true; });
            system.addTrophy(champion.championId, 'Axe');
            expect(called).toBe(true);
        });
    });

    describe('gainGlory', () => {
        it('should gain glory with amount', () => {
            const { champion } = system.recruitChampion({});
            system.gainGlory(champion.championId, 10);
            expect(champion.glory).toBe(30);
        });

        it('should gain glory with default', () => {
            const { champion } = system.recruitChampion({});
            system.gainGlory(champion.championId);
            expect(champion.glory).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.gainGlory('ghost', 10);
            expect(result.error).toBe('CHAMPION_NOT_FOUND');
        });

        it('should trigger gloryGained hook', () => {
            const { champion } = system.recruitChampion({});
            let called = false;
            system.registerHook('gloryGained', () => { called = true; });
            system.gainGlory(champion.championId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpChampion', () => {
        it('should level up', () => {
            const { champion } = system.recruitChampion({});
            system.levelUpChampion(champion.championId);
            expect(champion.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { champion } = system.recruitChampion({});
            system.levelUpChampion(champion.championId);
            system.levelUpChampion(champion.championId);
            system.levelUpChampion(champion.championId);
            expect(champion.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpChampion('ghost');
            expect(result.error).toBe('CHAMPION_NOT_FOUND');
        });

        it('should trigger championLeveledUp hook', () => {
            const { champion } = system.recruitChampion({});
            let called = false;
            system.registerHook('championLeveledUp', () => { called = true; });
            system.levelUpChampion(champion.championId);
            expect(called).toBe(true);
        });
    });

    describe('legendChampion', () => {
        it('should legendize', () => {
            const { champion } = system.recruitChampion({});
            system.legendChampion(champion.championId);
            expect(champion.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendChampion('ghost');
            expect(result.error).toBe('CHAMPION_NOT_FOUND');
        });

        it('should trigger championLegendized hook', () => {
            const { champion } = system.recruitChampion({});
            let called = false;
            system.registerHook('championLegendized', () => { called = true; });
            system.legendChampion(champion.championId);
            expect(called).toBe(true);
        });
    });

    describe('calculateChampionValue', () => {
        it('should calculate', () => {
            const { champion } = system.recruitChampion({});
            system.levelUpChampion(champion.championId);
            system.gainGlory(champion.championId, 5);
            system.addTrophy(champion.championId, 'Cup');
            // level=2, glory=25, trophies.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateChampionValue(champion.championId)).toBe(280);
        });

        it('should calculate base value', () => {
            const { champion } = system.recruitChampion({});
            // level=1, glory=20, trophies=0 => 1*100 + 20*2 + 0*30 = 100+40+0 = 140
            expect(system.calculateChampionValue(champion.championId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateChampionValue('ghost')).toBe(0);
        });
    });

    describe('listVeterans', () => {
        it('should return empty when no veterans', () => {
            system.recruitChampion({});
            expect(system.listVeterans().length).toBe(0);
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

        it('should execute default getChampion', () => {
            const result = system.executeTool('getChampion', { championId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('championRecruited', () => count++);
            unregister();
            system.recruitChampion({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('championRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitChampion({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalChampions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalChampions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitChampion({});
            const json = system.toJSON();
            expect(json.champions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitChampion({});
            const json = system.toJSON();
            const newSys = new CultivationChampion();
            newSys.fromJSON(json);
            expect(newSys.champions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.championCount).toBe(0);
        });
    });
});
