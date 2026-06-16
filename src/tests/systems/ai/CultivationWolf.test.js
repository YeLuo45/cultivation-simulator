/**
 * CultivationWolf.test.js - 修真狼系统测试
 * V718 Iteration 11/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWolf } from '../../../systems/ai/CultivationWolf.js';

describe('CultivationWolf', () => {
    let system;
    beforeEach(() => { system = new CultivationWolf(); });

    describe('recruitWolf', () => {
        it('should recruit', () => {
            const { wolf } = system.recruitWolf({ masterId: 'm1', name: 'Frostfang', type: 'white' });
            expect(wolf.masterId).toBe('m1');
            expect(wolf.name).toBe('Frostfang');
            expect(wolf.type).toBe('white');
        });

        it('should default to gray type and novice status', () => {
            const { wolf } = system.recruitWolf({});
            expect(wolf.type).toBe('gray');
            expect(wolf.status).toBe('novice');
            expect(wolf.ferocity).toBe(20);
        });

        it('should trigger wolfRecruited hook', () => {
            let called = false;
            system.registerHook('wolfRecruited', () => { called = true; });
            system.recruitWolf({});
            expect(called).toBe(true);
        });
    });

    describe('getWolf', () => {
        it('should return', () => {
            const { wolf } = system.recruitWolf({});
            expect(system.getWolf(wolf.wolfId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWolf('ghost')).toBeNull(); });
    });

    describe('listWolves', () => {
        it('should list all', () => {
            system.recruitWolf({});
            system.recruitWolf({});
            expect(system.listWolves().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitWolf({ masterId: 'm1' });
            system.recruitWolf({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { wolf } = system.recruitWolf({});
            system.recruitWolf({});
            system.legendWolf(wolf.wolfId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addPackMember', () => {
        it('should add member', () => {
            const { wolf } = system.recruitWolf({});
            system.addPackMember(wolf.wolfId, 'pup1');
            expect(wolf.pack.length).toBe(1);
            expect(wolf.pack[0]).toBe('pup1');
        });

        it('should reject missing wolf', () => {
            const result = system.addPackMember('ghost', 'pup1');
            expect(result.error).toBe('WOLF_NOT_FOUND');
        });

        it('should trigger packAdded hook', () => {
            const { wolf } = system.recruitWolf({});
            let called = false;
            system.registerHook('packAdded', () => { called = true; });
            system.addPackMember(wolf.wolfId, 'pup1');
            expect(called).toBe(true);
        });
    });

    describe('raiseFerocity', () => {
        it('should raise by default 5', () => {
            const { wolf } = system.recruitWolf({});
            system.raiseFerocity(wolf.wolfId);
            expect(wolf.ferocity).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { wolf } = system.recruitWolf({});
            system.raiseFerocity(wolf.wolfId, 10);
            expect(wolf.ferocity).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseFerocity('ghost', 5);
            expect(result.error).toBe('WOLF_NOT_FOUND');
        });

        it('should trigger ferocityRaised hook', () => {
            const { wolf } = system.recruitWolf({});
            let called = false;
            system.registerHook('ferocityRaised', () => { called = true; });
            system.raiseFerocity(wolf.wolfId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWolf', () => {
        it('should level up', () => {
            const { wolf } = system.recruitWolf({});
            system.levelUpWolf(wolf.wolfId);
            expect(wolf.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpWolf('ghost');
            expect(result.error).toBe('WOLF_NOT_FOUND');
        });

        it('should trigger wolfLeveledUp hook', () => {
            const { wolf } = system.recruitWolf({});
            let called = false;
            system.registerHook('wolfLeveledUp', () => { called = true; });
            system.levelUpWolf(wolf.wolfId);
            expect(called).toBe(true);
        });
    });

    describe('legendWolf', () => {
        it('should set legendary', () => {
            const { wolf } = system.recruitWolf({});
            system.legendWolf(wolf.wolfId);
            expect(wolf.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendWolf('ghost');
            expect(result.error).toBe('WOLF_NOT_FOUND');
        });

        it('should trigger wolfLegendized hook', () => {
            const { wolf } = system.recruitWolf({});
            let called = false;
            system.registerHook('wolfLegendized', () => { called = true; });
            system.legendWolf(wolf.wolfId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWolfValue', () => {
        it('should calculate', () => {
            const { wolf } = system.recruitWolf({});
            // level 1 * 100 + ferocity 20 * 2 + pack 0 * 30 = 140
            expect(system.calculateWolfValue(wolf.wolfId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWolfValue('ghost')).toBe(0);
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

        it('should execute default getWolf', () => {
            const result = system.executeTool('getWolf', { wolfId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('wolfRecruited', () => count++);
            unregister();
            system.recruitWolf({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('wolfRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitWolf({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWolves = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWolves = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitWolf({});
            const json = system.toJSON();
            expect(json.wolves.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitWolf({});
            const json = system.toJSON();
            const newSys = new CultivationWolf();
            newSys.fromJSON(json);
            expect(newSys.wolves.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.wolfCount).toBe(0);
        });
    });
});
