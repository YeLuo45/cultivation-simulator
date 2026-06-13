/**
 * CultivationHero.test.js - 修真英雄测试
 * V661 Iteration 14/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHero } from '../../../systems/ai/CultivationHero.js';

describe('CultivationHero', () => {
    let system;
    beforeEach(() => { system = new CultivationHero(); });

    describe('recruitHero', () => {
        it('should recruit with full data', () => {
            const { hero } = system.recruitHero({ masterId: 'm1', name: 'Li', type: 'guardian' });
            expect(hero.masterId).toBe('m1');
            expect(hero.name).toBe('Li');
            expect(hero.type).toBe('guardian');
            expect(hero.courage).toBe(20);
            expect(hero.level).toBe(1);
            expect(hero.status).toBe('novice');
            expect(hero.quests).toEqual([]);
        });

        it('should generate id when missing', () => {
            const { hero } = system.recruitHero({});
            expect(hero.heroId).toMatch(/^hro_/);
        });

        it('should respect provided id', () => {
            const { hero } = system.recruitHero({ heroId: 'custom_1' });
            expect(hero.heroId).toBe('custom_1');
        });

        it('should default name', () => {
            const { hero } = system.recruitHero({});
            expect(hero.name).toBe('Anonymous Hero');
        });

        it('should default type to warrior', () => {
            const { hero } = system.recruitHero({});
            expect(hero.type).toBe('warrior');
        });

        it('should accept avenger type', () => {
            const { hero } = system.recruitHero({ type: 'avenger' });
            expect(hero.type).toBe('avenger');
        });

        it('should use provided courage', () => {
            const { hero } = system.recruitHero({ courage: 99 });
            expect(hero.courage).toBe(99);
        });

        it('should use provided quests', () => {
            const { hero } = system.recruitHero({ quests: ['q1', 'q2'] });
            expect(hero.quests).toEqual(['q1', 'q2']);
        });

        it('should respect custom config', () => {
            const sys = new CultivationHero({ maxHeroes: 50, baseCourage: 30 });
            expect(sys.config.maxHeroes).toBe(50);
            expect(sys.config.baseCourage).toBe(30);
        });

        it('should increment stats', () => {
            expect(system.stats.totalHeroes).toBe(0);
            system.recruitHero({});
            expect(system.stats.totalHeroes).toBe(1);
        });

        it('should trigger heroRecruited hook', () => {
            let called = false;
            system.registerHook('heroRecruited', () => { called = true; });
            system.recruitHero({});
            expect(called).toBe(true);
        });
    });

    describe('getHero', () => {
        it('should return hero', () => {
            const { hero } = system.recruitHero({});
            expect(system.getHero(hero.heroId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHero('ghost')).toBeNull(); });
        it('should return a copy', () => {
            const { hero } = system.recruitHero({});
            const fetched = system.getHero(hero.heroId);
            expect(fetched).not.toBe(hero);
            expect(fetched.heroId).toBe(hero.heroId);
        });
    });

    describe('listHeroes', () => {
        it('should list all', () => {
            system.recruitHero({});
            system.recruitHero({});
            expect(system.listHeroes().length).toBe(2);
        });
        it('should be empty initially', () => {
            expect(system.listHeroes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitHero({ masterId: 'm1' });
            system.recruitHero({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            system.recruitHero({ masterId: 'm1' });
            expect(system.listByMaster('zzz').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { hero } = system.recruitHero({});
            system.legendHero(hero.heroId);
            system.recruitHero({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addQuest', () => {
        it('should add quest', () => {
            const { hero } = system.recruitHero({});
            system.addQuest(hero.heroId, 'Slay Dragon');
            expect(hero.quests).toContain('Slay Dragon');
            expect(hero.quests.length).toBe(1);
        });

        it('should add multiple quests', () => {
            const { hero } = system.recruitHero({});
            system.addQuest(hero.heroId, 'Q1');
            system.addQuest(hero.heroId, 'Q2');
            expect(hero.quests.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addQuest('ghost', 'Q');
            expect(result.error).toBe('HERO_NOT_FOUND');
        });

        it('should trigger questAdded hook', () => {
            const { hero } = system.recruitHero({});
            let called = false;
            system.registerHook('questAdded', () => { called = true; });
            system.addQuest(hero.heroId, 'Q');
            expect(called).toBe(true);
        });
    });

    describe('raiseCourage', () => {
        it('should raise with amount', () => {
            const { hero } = system.recruitHero({});
            system.raiseCourage(hero.heroId, 10);
            expect(hero.courage).toBe(30);
        });

        it('should raise with default amount', () => {
            const { hero } = system.recruitHero({});
            system.raiseCourage(hero.heroId);
            expect(hero.courage).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseCourage('ghost', 10);
            expect(result.error).toBe('HERO_NOT_FOUND');
        });

        it('should trigger courageRaised hook', () => {
            const { hero } = system.recruitHero({});
            let called = false;
            system.registerHook('courageRaised', () => { called = true; });
            system.raiseCourage(hero.heroId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHero', () => {
        it('should level up', () => {
            const { hero } = system.recruitHero({});
            system.levelUpHero(hero.heroId);
            expect(hero.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { hero } = system.recruitHero({});
            for (let i = 0; i < 4; i++) system.levelUpHero(hero.heroId);
            expect(hero.level).toBe(5);
            expect(hero.status).toBe('veteran');
        });

        it('should not promote past veteran', () => {
            const { hero } = system.recruitHero({});
            for (let i = 0; i < 5; i++) system.levelUpHero(hero.heroId);
            expect(hero.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpHero('ghost');
            expect(result.error).toBe('HERO_NOT_FOUND');
        });

        it('should trigger heroLeveledUp hook', () => {
            const { hero } = system.recruitHero({});
            let called = false;
            system.registerHook('heroLeveledUp', () => { called = true; });
            system.levelUpHero(hero.heroId);
            expect(called).toBe(true);
        });
    });

    describe('legendHero', () => {
        it('should legendize', () => {
            const { hero } = system.recruitHero({});
            system.legendHero(hero.heroId);
            expect(hero.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHero('ghost');
            expect(result.error).toBe('HERO_NOT_FOUND');
        });

        it('should trigger heroLegendized hook', () => {
            const { hero } = system.recruitHero({});
            let called = false;
            system.registerHook('heroLegendized', () => { called = true; });
            system.legendHero(hero.heroId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHeroValue', () => {
        it('should calculate', () => {
            const { hero } = system.recruitHero({});
            system.levelUpHero(hero.heroId);
            system.raiseCourage(hero.heroId, 5);
            system.addQuest(hero.heroId, 'Q1');
            // level=2, courage=25, quests.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateHeroValue(hero.heroId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHeroValue('ghost')).toBe(0);
        });

        it('should calculate with multiple quests', () => {
            const { hero } = system.recruitHero({});
            system.addQuest(hero.heroId, 'Q1');
            system.addQuest(hero.heroId, 'Q2');
            system.addQuest(hero.heroId, 'Q3');
            // level=1, courage=20, quests=3 => 1*100 + 20*2 + 3*30 = 100+40+90 = 230
            expect(system.calculateHeroValue(hero.heroId)).toBe(230);
        });
    });

    describe('listVeterans', () => {
        it('should filter veterans', () => {
            const { hero } = system.recruitHero({});
            for (let i = 0; i < 4; i++) system.levelUpHero(hero.heroId);
            system.recruitHero({});
            expect(system.listVeterans().length).toBe(1);
        });
        it('should be empty when none', () => {
            system.recruitHero({});
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

        it('should execute default getHero', () => {
            const result = system.executeTool('getHero', { heroId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitHero tool', () => {
            const result = system.executeTool('recruitHero', { name: 'Tester' });
            expect(result.success).toBe(true);
            expect(result.result.hero.name).toBe('Tester');
        });

        it('should handle missing context', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('heroRecruited', () => count++);
            unregister();
            system.recruitHero({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('heroRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHero({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHeroes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxHeroes).toBe(35);
        });
        it('should not double evolve', () => {
            system.stats.totalHeroes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHero({});
            const json = system.toJSON();
            expect(json.heroes.length).toBe(1);
            expect(json.stats.totalHeroes).toBe(1);
            expect(json.config.maxHeroes).toBe(20);
        });
        it('should deserialize', () => {
            system.recruitHero({});
            const json = system.toJSON();
            const newSys = new CultivationHero();
            newSys.fromJSON(json);
            expect(newSys.heroes.size).toBe(1);
            expect(newSys.stats.totalHeroes).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.heroCount).toBe(0);
            expect(stats.totalHeroes).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
        it('should reflect current state', () => {
            system.recruitHero({});
            const stats = system.getStats();
            expect(stats.heroCount).toBe(1);
        });
    });
});
