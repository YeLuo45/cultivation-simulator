/**
 * CultivationManeuver.test.js - 修真身法测试
 * V696 Iteration 19/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationManeuver } from '../../../systems/ai/CultivationManeuver.js';

describe('CultivationManeuver', () => {
    let system;
    beforeEach(() => { system = new CultivationManeuver(); });

    describe('recruitManeuver', () => {
        it('should recruit', () => {
            const { maneuver } = system.recruitManeuver({ masterId: 'm1', name: 'shadow-step', type: 'evade' });
            expect(maneuver.masterId).toBe('m1');
            expect(maneuver.name).toBe('shadow-step');
            expect(maneuver.type).toBe('evade');
        });

        it('should default type to evade', () => {
            const { maneuver } = system.recruitManeuver({ masterId: 'm1' });
            expect(maneuver.type).toBe('evade');
        });

        it('should set default agility from config', () => {
            const { maneuver } = system.recruitManeuver({ masterId: 'm1' });
            expect(maneuver.agility).toBe(20);
        });

        it('should initialize level 1 and status novice', () => {
            const { maneuver } = system.recruitManeuver({ masterId: 'm1' });
            expect(maneuver.level).toBe(1);
            expect(maneuver.status).toBe('novice');
        });

        it('should respect custom agility and dodges', () => {
            const { maneuver } = system.recruitManeuver({ masterId: 'm1', agility: 50, dodges: ['d1', 'd2'] });
            expect(maneuver.agility).toBe(50);
            expect(maneuver.dodges.length).toBe(2);
        });

        it('should trigger maneuverRecruited hook', () => {
            let called = false;
            system.registerHook('maneuverRecruited', () => { called = true; });
            system.recruitManeuver({});
            expect(called).toBe(true);
        });
    });

    describe('getManeuver', () => {
        it('should return maneuver', () => {
            const { maneuver } = system.recruitManeuver({});
            expect(system.getManeuver(maneuver.maneuverId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getManeuver('ghost')).toBeNull(); });
    });

    describe('listManeuvers', () => {
        it('should list all', () => {
            system.recruitManeuver({});
            system.recruitManeuver({});
            expect(system.listManeuvers().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitManeuver({ masterId: 'm1' });
            system.recruitManeuver({ masterId: 'm2' });
            system.recruitManeuver({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary maneuvers', () => {
            const { maneuver: a } = system.recruitManeuver({});
            const { maneuver: b } = system.recruitManeuver({});
            system.legendManeuver(b.maneuverId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addDodge', () => {
        it('should add dodge', () => {
            const { maneuver } = system.recruitManeuver({});
            system.addDodge(maneuver.maneuverId, 'sidestep');
            expect(maneuver.dodges.length).toBe(1);
            expect(maneuver.dodges[0]).toBe('sidestep');
        });

        it('should reject missing', () => {
            const result = system.addDodge('ghost', 'x');
            expect(result.error).toBe('MANEUVER_NOT_FOUND');
        });

        it('should trigger dodgeAdded hook', () => {
            const { maneuver } = system.recruitManeuver({});
            let payload = null;
            system.registerHook('dodgeAdded', (d) => { payload = d; });
            system.addDodge(maneuver.maneuverId, 'roll');
            expect(payload.dodge).toBe('roll');
        });
    });

    describe('raiseAgility', () => {
        it('should raise with default amount', () => {
            const { maneuver } = system.recruitManeuver({});
            system.raiseAgility(maneuver.maneuverId);
            expect(maneuver.agility).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { maneuver } = system.recruitManeuver({});
            system.raiseAgility(maneuver.maneuverId, 10);
            expect(maneuver.agility).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseAgility('ghost', 5);
            expect(result.error).toBe('MANEUVER_NOT_FOUND');
        });

        it('should trigger agilityRaised hook', () => {
            const { maneuver } = system.recruitManeuver({});
            let called = false;
            system.registerHook('agilityRaised', () => { called = true; });
            system.raiseAgility(maneuver.maneuverId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpManeuver', () => {
        it('should level up', () => {
            const { maneuver } = system.recruitManeuver({});
            system.levelUpManeuver(maneuver.maneuverId);
            expect(maneuver.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { maneuver } = system.recruitManeuver({});
            for (let i = 0; i < 4; i++) system.levelUpManeuver(maneuver.maneuverId);
            expect(maneuver.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpManeuver('ghost');
            expect(result.error).toBe('MANEUVER_NOT_FOUND');
        });

        it('should trigger maneuverLeveledUp hook', () => {
            const { maneuver } = system.recruitManeuver({});
            let called = false;
            system.registerHook('maneuverLeveledUp', () => { called = true; });
            system.levelUpManeuver(maneuver.maneuverId);
            expect(called).toBe(true);
        });
    });

    describe('legendManeuver', () => {
        it('should mark legendary', () => {
            const { maneuver } = system.recruitManeuver({});
            system.legendManeuver(maneuver.maneuverId);
            expect(maneuver.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendManeuver('ghost');
            expect(result.error).toBe('MANEUVER_NOT_FOUND');
        });

        it('should trigger maneuverLegendized hook', () => {
            const { maneuver } = system.recruitManeuver({});
            let called = false;
            system.registerHook('maneuverLegendized', () => { called = true; });
            system.legendManeuver(maneuver.maneuverId);
            expect(called).toBe(true);
        });
    });

    describe('calculateManeuverValue', () => {
        it('should calculate', () => {
            const { maneuver } = system.recruitManeuver({});
            // level=1*100 + agility=20*2 + dodges=0*30 = 140
            expect(system.calculateManeuverValue(maneuver.maneuverId)).toBe(140);
        });

        it('should incorporate level, agility, dodges', () => {
            const { maneuver } = system.recruitManeuver({});
            system.levelUpManeuver(maneuver.maneuverId); // level 2
            system.raiseAgility(maneuver.maneuverId, 5); // agility 25
            system.addDodge(maneuver.maneuverId, 'a');
            system.addDodge(maneuver.maneuverId, 'b');
            // 2*100 + 25*2 + 2*30 = 200 + 50 + 60 = 310
            expect(system.calculateManeuverValue(maneuver.maneuverId)).toBe(310);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateManeuverValue('ghost')).toBe(0);
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

        it('should execute default getManeuver and recruitManeuver tools', () => {
            const recruit = system.executeTool('recruitManeuver', { masterId: 'm1' });
            expect(recruit.result.success).toBe(true);
            const get = system.executeTool('getManeuver', { maneuverId: recruit.result.maneuver.maneuverId });
            expect(get.result).not.toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('maneuverRecruited', () => count++);
            unregister();
            system.recruitManeuver({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('maneuverRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitManeuver({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalManeuvers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalManeuvers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitManeuver({});
            const json = system.toJSON();
            expect(json.maneuvers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitManeuver({});
            const json = system.toJSON();
            const newSys = new CultivationManeuver();
            newSys.fromJSON(json);
            expect(newSys.maneuvers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.maneuverCount).toBe(0);
        });
    });
});
