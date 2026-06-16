/**
 * CultivationHuman.test.js - 修真人类测试
 * V673 Iteration 26/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHuman } from '../../../systems/ai/CultivationHuman.js';

describe('CultivationHuman', () => {
    let system;
    beforeEach(() => { system = new CultivationHuman(); });

    describe('recruitHuman', () => {
        it('should recruit', () => {
            const { human } = system.recruitHuman({ parentId: 'p1', name: 'Zhang', type: 'noble' });
            expect(human.parentId).toBe('p1');
            expect(human.name).toBe('Zhang');
            expect(human.type).toBe('noble');
            expect(human.adaptability).toBe(20);
            expect(human.level).toBe(1);
            expect(human.status).toBe('novice');
            expect(human.skills).toEqual([]);
        });

        it('should trigger humanRecruited hook', () => {
            let called = false;
            system.registerHook('humanRecruited', () => { called = true; });
            system.recruitHuman({});
            expect(called).toBe(true);
        });
    });

    describe('getHuman', () => {
        it('should return', () => {
            const { human } = system.recruitHuman({});
            expect(system.getHuman(human.humanId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHuman('ghost')).toBeNull(); });
    });

    describe('listHumans', () => {
        it('should list all', () => {
            system.recruitHuman({});
            system.recruitHuman({});
            expect(system.listHumans().length).toBe(2);
        });
    });

    describe('listByParent', () => {
        it('should filter', () => {
            system.recruitHuman({ parentId: 'p1' });
            system.recruitHuman({ parentId: 'p2' });
            expect(system.listByParent('p1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { human } = system.recruitHuman({});
            system.legendHuman(human.humanId);
            system.recruitHuman({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addSkill', () => {
        it('should add skill', () => {
            const { human } = system.recruitHuman({});
            system.addSkill(human.humanId, 'Swordsmanship');
            expect(human.skills).toContain('Swordsmanship');
            expect(human.skills.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addSkill('ghost', 'Alchemy');
            expect(result.error).toBe('HUMAN_NOT_FOUND');
        });

        it('should trigger skillAdded hook', () => {
            const { human } = system.recruitHuman({});
            let called = false;
            system.registerHook('skillAdded', () => { called = true; });
            system.addSkill(human.humanId, 'Tactics');
            expect(called).toBe(true);
        });
    });

    describe('raiseAdaptability', () => {
        it('should raise with amount', () => {
            const { human } = system.recruitHuman({});
            system.raiseAdaptability(human.humanId, 10);
            expect(human.adaptability).toBe(30);
        });

        it('should raise with default', () => {
            const { human } = system.recruitHuman({});
            system.raiseAdaptability(human.humanId);
            expect(human.adaptability).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseAdaptability('ghost', 10);
            expect(result.error).toBe('HUMAN_NOT_FOUND');
        });

        it('should trigger adaptabilityRaised hook', () => {
            const { human } = system.recruitHuman({});
            let called = false;
            system.registerHook('adaptabilityRaised', () => { called = true; });
            system.raiseAdaptability(human.humanId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHuman', () => {
        it('should level up', () => {
            const { human } = system.recruitHuman({});
            system.levelUpHuman(human.humanId);
            expect(human.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpHuman('ghost');
            expect(result.error).toBe('HUMAN_NOT_FOUND');
        });

        it('should trigger humanLeveledUp hook', () => {
            const { human } = system.recruitHuman({});
            let called = false;
            system.registerHook('humanLeveledUp', () => { called = true; });
            system.levelUpHuman(human.humanId);
            expect(called).toBe(true);
        });
    });

    describe('legendHuman', () => {
        it('should legendize', () => {
            const { human } = system.recruitHuman({});
            system.legendHuman(human.humanId);
            expect(human.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHuman('ghost');
            expect(result.error).toBe('HUMAN_NOT_FOUND');
        });

        it('should trigger humanLegendized hook', () => {
            const { human } = system.recruitHuman({});
            let called = false;
            system.registerHook('humanLegendized', () => { called = true; });
            system.legendHuman(human.humanId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHumanValue', () => {
        it('should calculate', () => {
            const { human } = system.recruitHuman({});
            system.levelUpHuman(human.humanId);
            system.raiseAdaptability(human.humanId, 5);
            system.addSkill(human.humanId, 'Alchemy');
            // level=2, adaptability=25, skills.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateHumanValue(human.humanId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHumanValue('ghost')).toBe(0);
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

        it('should execute default getHuman', () => {
            const result = system.executeTool('getHuman', { humanId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('humanRecruited', () => count++);
            unregister();
            system.recruitHuman({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('humanRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHuman({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHumans = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHumans = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHuman({});
            const json = system.toJSON();
            expect(json.humans.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHuman({});
            const json = system.toJSON();
            const newSys = new CultivationHuman();
            newSys.fromJSON(json);
            expect(newSys.humans.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.humanCount).toBe(0);
        });
    });
});
