/**
 * CultivationWarrior.test.js - 修真战士测试
 * V598 Iteration 1/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWarrior } from '../../../systems/ai/CultivationWarrior.js';

describe('CultivationWarrior', () => {
    let system;
    beforeEach(() => { system = new CultivationWarrior(); });

    describe('recruitWarrior', () => {
        it('should recruit', () => {
            const { warrior } = system.recruitWarrior({ mentorId: 'm1', name: 'Li', type: 'sword' });
            expect(warrior.mentorId).toBe('m1');
            expect(warrior.name).toBe('Li');
            expect(warrior.type).toBe('sword');
            expect(warrior.strength).toBe(20);
            expect(warrior.level).toBe(1);
            expect(warrior.status).toBe('novice');
            expect(warrior.weapons).toEqual([]);
        });

        it('should trigger warriorRecruited hook', () => {
            let called = false;
            system.registerHook('warriorRecruited', () => { called = true; });
            system.recruitWarrior({});
            expect(called).toBe(true);
        });
    });

    describe('getWarrior', () => {
        it('should return', () => {
            const { warrior } = system.recruitWarrior({});
            expect(system.getWarrior(warrior.warriorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWarrior('ghost')).toBeNull(); });
    });

    describe('listWarriors', () => {
        it('should list all', () => {
            system.recruitWarrior({});
            system.recruitWarrior({});
            expect(system.listWarriors().length).toBe(2);
        });
    });

    describe('listByMentor', () => {
        it('should filter', () => {
            system.recruitWarrior({ mentorId: 'm1' });
            system.recruitWarrior({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { warrior } = system.recruitWarrior({});
            system.legendWarrior(warrior.warriorId);
            system.recruitWarrior({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addWeapon', () => {
        it('should add weapon', () => {
            const { warrior } = system.recruitWarrior({});
            system.addWeapon(warrior.warriorId, 'Dragon Slayer');
            expect(warrior.weapons).toContain('Dragon Slayer');
            expect(warrior.weapons.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addWeapon('ghost', 'Spear');
            expect(result.error).toBe('WARRIOR_NOT_FOUND');
        });

        it('should trigger weaponAdded hook', () => {
            const { warrior } = system.recruitWarrior({});
            let called = false;
            system.registerHook('weaponAdded', () => { called = true; });
            system.addWeapon(warrior.warriorId, 'Axe');
            expect(called).toBe(true);
        });
    });

    describe('trainStrength', () => {
        it('should train with amount', () => {
            const { warrior } = system.recruitWarrior({});
            system.trainStrength(warrior.warriorId, 10);
            expect(warrior.strength).toBe(30);
        });

        it('should train with default', () => {
            const { warrior } = system.recruitWarrior({});
            system.trainStrength(warrior.warriorId);
            expect(warrior.strength).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.trainStrength('ghost', 10);
            expect(result.error).toBe('WARRIOR_NOT_FOUND');
        });

        it('should trigger strengthTrained hook', () => {
            const { warrior } = system.recruitWarrior({});
            let called = false;
            system.registerHook('strengthTrained', () => { called = true; });
            system.trainStrength(warrior.warriorId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWarrior', () => {
        it('should level up', () => {
            const { warrior } = system.recruitWarrior({});
            system.levelUpWarrior(warrior.warriorId);
            expect(warrior.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { warrior } = system.recruitWarrior({});
            for (let i = 0; i < 4; i++) system.levelUpWarrior(warrior.warriorId);
            expect(warrior.level).toBe(5);
            expect(warrior.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpWarrior('ghost');
            expect(result.error).toBe('WARRIOR_NOT_FOUND');
        });

        it('should trigger warriorLeveledUp hook', () => {
            const { warrior } = system.recruitWarrior({});
            let called = false;
            system.registerHook('warriorLeveledUp', () => { called = true; });
            system.levelUpWarrior(warrior.warriorId);
            expect(called).toBe(true);
        });
    });

    describe('legendWarrior', () => {
        it('should legendize', () => {
            const { warrior } = system.recruitWarrior({});
            system.legendWarrior(warrior.warriorId);
            expect(warrior.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendWarrior('ghost');
            expect(result.error).toBe('WARRIOR_NOT_FOUND');
        });

        it('should trigger warriorLegendized hook', () => {
            const { warrior } = system.recruitWarrior({});
            let called = false;
            system.registerHook('warriorLegendized', () => { called = true; });
            system.legendWarrior(warrior.warriorId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWarriorValue', () => {
        it('should calculate', () => {
            const { warrior } = system.recruitWarrior({});
            system.levelUpWarrior(warrior.warriorId);
            system.trainStrength(warrior.warriorId, 5);
            system.addWeapon(warrior.warriorId, 'Axe');
            // level=2, strength=25, weapons.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateWarriorValue(warrior.warriorId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWarriorValue('ghost')).toBe(0);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { warrior } = system.recruitWarrior({});
            for (let i = 0; i < 4; i++) system.levelUpWarrior(warrior.warriorId);
            system.recruitWarrior({});
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

        it('should execute default getWarrior', () => {
            const result = system.executeTool('getWarrior', { warriorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('warriorRecruited', () => count++);
            unregister();
            system.recruitWarrior({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('warriorRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitWarrior({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWarriors = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWarriors = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitWarrior({});
            const json = system.toJSON();
            expect(json.warriors.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitWarrior({});
            const json = system.toJSON();
            const newSys = new CultivationWarrior();
            newSys.fromJSON(json);
            expect(newSys.warriors.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.warriorCount).toBe(0);
        });
    });
});
