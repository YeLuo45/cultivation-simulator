/**
 * CultivationNecromancer.test.js - 修真死灵师系统测试
 * V606 Iteration 9/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationNecromancer } from '../../../systems/ai/CultivationNecromancer.js';

describe('CultivationNecromancer', () => {
    let system;
    beforeEach(() => { system = new CultivationNecromancer(); });

    describe('recruitNecromancer', () => {
        it('should recruit', () => {
            const { necromancer } = system.recruitNecromancer({ patronId: 'p1', name: 'Mordak' });
            expect(necromancer.patronId).toBe('p1');
            expect(necromancer.name).toBe('Mordak');
        });

        it('should use default type and corruption', () => {
            const { necromancer } = system.recruitNecromancer({});
            expect(necromancer.type).toBe('undead');
            expect(necromancer.corruption).toBe(10);
        });

        it('should accept custom type', () => {
            const { necromancer } = system.recruitNecromancer({ type: 'ghost' });
            expect(necromancer.type).toBe('ghost');
        });

        it('should reject when max reached', () => {
            const small = new CultivationNecromancer({ maxNecromancers: 1 });
            small.recruitNecromancer({});
            const result = small.recruitNecromancer({});
            expect(result.error).toBe('MAX_NECROMANCERS_REACHED');
        });

        it('should trigger necromancerRecruited hook', () => {
            let called = false;
            system.registerHook('necromancerRecruited', () => { called = true; });
            system.recruitNecromancer({});
            expect(called).toBe(true);
        });
    });

    describe('getNecromancer', () => {
        it('should return', () => {
            const { necromancer } = system.recruitNecromancer({});
            expect(system.getNecromancer(necromancer.necroId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getNecromancer('ghost')).toBeNull(); });
    });

    describe('listNecromancers', () => {
        it('should list all', () => {
            system.recruitNecromancer({});
            system.recruitNecromancer({});
            expect(system.listNecromancers().length).toBe(2);
        });
    });

    describe('listByPatron', () => {
        it('should filter', () => {
            system.recruitNecromancer({ patronId: 'p1' });
            system.recruitNecromancer({ patronId: 'p2' });
            expect(system.listByPatron('p1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { necromancer: n1 } = system.recruitNecromancer({});
            const { necromancer: n2 } = system.recruitNecromancer({});
            system.legendNecromancer(n1.necroId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].necroId).toBe(n1.necroId);
        });
    });

    describe('addMinion', () => {
        it('should add minion', () => {
            const { necromancer } = system.recruitNecromancer({});
            system.addMinion(necromancer.necroId, { name: 'Skeleton1' });
            expect(necromancer.minions.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addMinion('ghost', {});
            expect(result.error).toBe('NECROMANCER_NOT_FOUND');
        });

        it('should trigger minionAdded hook', () => {
            const { necromancer } = system.recruitNecromancer({});
            let called = false;
            system.registerHook('minionAdded', () => { called = true; });
            system.addMinion(necromancer.necroId, { name: 'Skeleton' });
            expect(called).toBe(true);
        });
    });

    describe('embraceCorruption', () => {
        it('should embrace', () => {
            const { necromancer } = system.recruitNecromancer({});
            system.embraceCorruption(necromancer.necroId, 10);
            expect(necromancer.corruption).toBe(20);
        });

        it('should use default amount', () => {
            const { necromancer } = system.recruitNecromancer({});
            system.embraceCorruption(necromancer.necroId);
            expect(necromancer.corruption).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.embraceCorruption('ghost', 5);
            expect(result.error).toBe('NECROMANCER_NOT_FOUND');
        });

        it('should trigger corruptionEmbraced hook', () => {
            const { necromancer } = system.recruitNecromancer({});
            let called = false;
            system.registerHook('corruptionEmbraced', () => { called = true; });
            system.embraceCorruption(necromancer.necroId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpNecromancer', () => {
        it('should level up', () => {
            const { necromancer } = system.recruitNecromancer({});
            system.levelUpNecromancer(necromancer.necroId);
            expect(necromancer.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpNecromancer('ghost');
            expect(result.error).toBe('NECROMANCER_NOT_FOUND');
        });

        it('should trigger necromancerLeveledUp hook', () => {
            const { necromancer } = system.recruitNecromancer({});
            let called = false;
            system.registerHook('necromancerLeveledUp', () => { called = true; });
            system.levelUpNecromancer(necromancer.necroId);
            expect(called).toBe(true);
        });
    });

    describe('legendNecromancer', () => {
        it('should legendize', () => {
            const { necromancer } = system.recruitNecromancer({});
            system.legendNecromancer(necromancer.necroId);
            expect(necromancer.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendNecromancer('ghost');
            expect(result.error).toBe('NECROMANCER_NOT_FOUND');
        });

        it('should trigger necromancerLegendized hook', () => {
            const { necromancer } = system.recruitNecromancer({});
            let called = false;
            system.registerHook('necromancerLegendized', () => { called = true; });
            system.legendNecromancer(necromancer.necroId);
            expect(called).toBe(true);
        });
    });

    describe('calculateNecromancerValue', () => {
        it('should calculate', () => {
            const { necromancer } = system.recruitNecromancer({});
            system.levelUpNecromancer(necromancer.necroId);
            system.embraceCorruption(necromancer.necroId, 5);
            system.addMinion(necromancer.necroId, { name: 'minion' });
            const value = system.calculateNecromancerValue(necromancer.necroId);
            expect(value).toBe(2 * 100 + 15 * 2 + 1 * 30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateNecromancerValue('ghost')).toBe(0);
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

        it('should execute default getNecromancer', () => {
            const result = system.executeTool('getNecromancer', { necroId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('necromancerRecruited', () => count++);
            unregister();
            system.recruitNecromancer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('necromancerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitNecromancer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalNecromancers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalNecromancers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitNecromancer({});
            const json = system.toJSON();
            expect(json.necromancers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitNecromancer({});
            const json = system.toJSON();
            const newSys = new CultivationNecromancer();
            newSys.fromJSON(json);
            expect(newSys.necromancers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.necromancerCount).toBe(0);
        });
    });
});
