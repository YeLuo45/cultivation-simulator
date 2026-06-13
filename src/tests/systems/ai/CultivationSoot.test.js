/**
 * CultivationSoot.test.js - 修真煤烟系统测试
 * V852 Iteration 25/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSoot } from '../../../systems/ai/CultivationSoot.js';

describe('CultivationSoot', () => {
    let system;
    beforeEach(() => { system = new CultivationSoot(); });

    describe('recruitSoot', () => {
        it('should recruit with defaults', () => {
            const { soot } = system.recruitSoot({});
            expect(soot.masterId).toBe('unknown_master');
            expect(soot.name).toBe('unnamed_soot');
            expect(soot.type).toBe('chimney');
            expect(soot.darkness).toBe(20);
            expect(soot.stains).toEqual([]);
            expect(soot.level).toBe(1);
            expect(soot.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { soot } = system.recruitSoot({
                masterId: 'm1',
                name: 'MidnightSoot',
                type: 'divine',
                darkness: 80,
                stains: ['tar'],
                level: 3,
                status: 'veteran'
            });
            expect(soot.masterId).toBe('m1');
            expect(soot.name).toBe('MidnightSoot');
            expect(soot.type).toBe('divine');
            expect(soot.darkness).toBe(80);
            expect(soot.stains).toEqual(['tar']);
            expect(soot.level).toBe(3);
            expect(soot.status).toBe('veteran');
        });

        it('should increment totalSoots', () => {
            system.recruitSoot({});
            system.recruitSoot({});
            expect(system.stats.totalSoots).toBe(2);
        });

        it('should trigger sootRecruited hook', () => {
            let called = false;
            system.registerHook('sootRecruited', () => { called = true; });
            system.recruitSoot({});
            expect(called).toBe(true);
        });
    });

    describe('getSoot', () => {
        it('should return soot', () => {
            const { soot } = system.recruitSoot({});
            const got = system.getSoot(soot.sootId);
            expect(got).not.toBeNull();
            expect(got.sootId).toBe(soot.sootId);
        });
        it('should return null for missing', () => { expect(system.getSoot('ghost')).toBeNull(); });
    });

    describe('listSoots', () => {
        it('should list all', () => {
            system.recruitSoot({});
            system.recruitSoot({});
            system.recruitSoot({});
            expect(system.listSoots().length).toBe(3);
        });

        it('should return empty list when no soots', () => {
            expect(system.listSoots().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSoot({ masterId: 'm1' });
            system.recruitSoot({ masterId: 'm1' });
            system.recruitSoot({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary soots', () => {
            const { soot: s1 } = system.recruitSoot({});
            const { soot: s2 } = system.recruitSoot({});
            system.legendSoot(s1.sootId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].sootId).toBe(s1.sootId);
        });

        it('should return empty when none legendary', () => {
            system.recruitSoot({});
            system.recruitSoot({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addStain', () => {
        it('should add stain', () => {
            const { soot } = system.recruitSoot({});
            system.addStain(soot.sootId, 'tar');
            expect(soot.stains).toContain('tar');
            expect(soot.stains.length).toBe(1);
        });

        it('should add multiple stains', () => {
            const { soot } = system.recruitSoot({});
            system.addStain(soot.sootId, 'tar');
            system.addStain(soot.sootId, 'smoke');
            expect(soot.stains).toEqual(['tar', 'smoke']);
        });

        it('should set status to veteran when 5+ stains', () => {
            const { soot } = system.recruitSoot({});
            system.addStain(soot.sootId, 'a');
            system.addStain(soot.sootId, 'b');
            system.addStain(soot.sootId, 'c');
            system.addStain(soot.sootId, 'd');
            expect(soot.status).toBe('novice');
            system.addStain(soot.sootId, 'e');
            expect(soot.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addStain('ghost', 'tar');
            expect(result.error).toBe('SOOT_NOT_FOUND');
        });

        it('should trigger stainAdded hook', () => {
            const { soot } = system.recruitSoot({});
            let called = false;
            system.registerHook('stainAdded', () => { called = true; });
            system.addStain(soot.sootId, 'tar');
            expect(called).toBe(true);
        });
    });

    describe('raiseDarkness', () => {
        it('should raise by default amount', () => {
            const { soot } = system.recruitSoot({});
            system.raiseDarkness(soot.sootId);
            expect(soot.darkness).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { soot } = system.recruitSoot({});
            system.raiseDarkness(soot.sootId, 30);
            expect(soot.darkness).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseDarkness('ghost', 5);
            expect(result.error).toBe('SOOT_NOT_FOUND');
        });

        it('should trigger darknessRaised hook', () => {
            const { soot } = system.recruitSoot({});
            let called = false;
            system.registerHook('darknessRaised', () => { called = true; });
            system.raiseDarkness(soot.sootId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSoot', () => {
        it('should level up', () => {
            const { soot } = system.recruitSoot({});
            system.levelUpSoot(soot.sootId);
            expect(soot.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { soot } = system.recruitSoot({});
            system.levelUpSoot(soot.sootId);
            system.levelUpSoot(soot.sootId);
            expect(soot.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpSoot('ghost');
            expect(result.error).toBe('SOOT_NOT_FOUND');
        });

        it('should trigger sootLeveledUp hook', () => {
            const { soot } = system.recruitSoot({});
            let called = false;
            system.registerHook('sootLeveledUp', () => { called = true; });
            system.levelUpSoot(soot.sootId);
            expect(called).toBe(true);
        });
    });

    describe('legendSoot', () => {
        it('should set status to legendary', () => {
            const { soot } = system.recruitSoot({});
            system.legendSoot(soot.sootId);
            expect(soot.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSoot('ghost');
            expect(result.error).toBe('SOOT_NOT_FOUND');
        });

        it('should trigger sootLegendized hook', () => {
            const { soot } = system.recruitSoot({});
            let called = false;
            system.registerHook('sootLegendized', () => { called = true; });
            system.legendSoot(soot.sootId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSootValue', () => {
        it('should calculate default value', () => {
            const { soot } = system.recruitSoot({});
            // level=1 * 100 + darkness=20 * 2 + 0 * 30 = 140
            expect(system.calculateSootValue(soot.sootId)).toBe(140);
        });

        it('should add 30 per stain', () => {
            const { soot } = system.recruitSoot({});
            system.addStain(soot.sootId, 'tar');
            system.addStain(soot.sootId, 'smoke');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateSootValue(soot.sootId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { soot } = system.recruitSoot({});
            system.levelUpSoot(soot.sootId);
            system.levelUpSoot(soot.sootId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateSootValue(soot.sootId)).toBe(340);
        });

        it('should reflect darkness in formula', () => {
            const { soot } = system.recruitSoot({});
            system.raiseDarkness(soot.sootId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateSootValue(soot.sootId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSootValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getSoot', () => {
            const result = system.executeTool('getSoot', { sootId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sootRecruited', () => count++);
            unregister();
            system.recruitSoot({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sootRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSoot({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSoots = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalSoots = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSoot({});
            const json = system.toJSON();
            expect(json.soots.length).toBe(1);
            expect(json.stats.totalSoots).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSoot({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationSoot();
            newSys.fromJSON(json);
            expect(newSys.soots.size).toBe(1);
            expect(newSys.stats.totalSoots).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sootCount).toBe(0);
            expect(stats.totalSoots).toBe(0);
            system.recruitSoot({});
            expect(system.getStats().sootCount).toBe(1);
        });
    });
});
