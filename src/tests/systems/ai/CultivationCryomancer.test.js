/**
 * CultivationCryomancer.test.js - 修真冰霜师测试
 * V629 Iteration 12/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCryomancer } from '../../../systems/ai/CultivationCryomancer.js';

describe('CultivationCryomancer', () => {
    let system;
    beforeEach(() => { system = new CultivationCryomancer(); });

    describe('recruitCryomancer', () => {
        it('should recruit with default values', () => {
            const { cryomancer } = system.recruitCryomancer({ name: 'Frost One' });
            expect(cryomancer.name).toBe('Frost One');
            expect(cryomancer.type).toBe('ice');
            expect(cryomancer.cold).toBe(20);
            expect(cryomancer.level).toBe(1);
            expect(cryomancer.status).toBe('novice');
        });

        it('should support different types', () => {
            const { cryomancer: c1 } = system.recruitCryomancer({ type: 'frost' });
            const { cryomancer: c2 } = system.recruitCryomancer({ type: 'snow' });
            expect(c1.type).toBe('frost');
            expect(c2.type).toBe('snow');
        });

        it('should default to ice for invalid type', () => {
            const { cryomancer } = system.recruitCryomancer({ type: 'lava' });
            expect(cryomancer.type).toBe('ice');
        });

        it('should support mentor assignment', () => {
            const { cryomancer } = system.recruitCryomancer({ mentorId: 'mentor_x' });
            expect(cryomancer.mentorId).toBe('mentor_x');
        });

        it('should reject when max reached', () => {
            const sys = new CultivationCryomancer({ maxCryomancers: 2 });
            sys.recruitCryomancer({});
            sys.recruitCryomancer({});
            const result = sys.recruitCryomancer({});
            expect(result.error).toBe('MAX_CRYOMANCERS_REACHED');
        });

        it('should trigger cryomancerRecruited hook', () => {
            let called = false;
            system.registerHook('cryomancerRecruited', () => { called = true; });
            system.recruitCryomancer({});
            expect(called).toBe(true);
        });
    });

    describe('getCryomancer', () => {
        it('should return cryomancer', () => {
            const { cryomancer } = system.recruitCryomancer({});
            expect(system.getCryomancer(cryomancer.cryomancerId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getCryomancer('ghost')).toBeNull();
        });
    });

    describe('listCryomancers', () => {
        it('should list all', () => {
            system.recruitCryomancer({});
            system.recruitCryomancer({});
            expect(system.listCryomancers().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listCryomancers()).toEqual([]);
        });
    });

    describe('listByMentor', () => {
        it('should filter by mentor', () => {
            system.recruitCryomancer({ mentorId: 'm1' });
            system.recruitCryomancer({ mentorId: 'm1' });
            system.recruitCryomancer({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { cryomancer } = system.recruitCryomancer({});
            system.legendCryomancer(cryomancer.cryomancerId);
            system.recruitCryomancer({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addBlizzard', () => {
        it('should add a blizzard', () => {
            const { cryomancer } = system.recruitCryomancer({});
            const result = system.addBlizzard(cryomancer.cryomancerId, { power: 25 });
            expect(result.success).toBe(true);
            expect(cryomancer.blizzards.length).toBe(1);
        });

        it('should support multiple blizzards', () => {
            const { cryomancer } = system.recruitCryomancer({});
            system.addBlizzard(cryomancer.cryomancerId, { power: 10 });
            system.addBlizzard(cryomancer.cryomancerId, { power: 20 });
            expect(cryomancer.blizzards.length).toBe(2);
        });

        it('should reject missing cryomancer', () => {
            const result = system.addBlizzard('ghost', {});
            expect(result.error).toBe('CRYOMANCER_NOT_FOUND');
        });

        it('should trigger blizzardAdded hook', () => {
            const { cryomancer } = system.recruitCryomancer({});
            let called = false;
            system.registerHook('blizzardAdded', () => { called = true; });
            system.addBlizzard(cryomancer.cryomancerId, {});
            expect(called).toBe(true);
        });
    });

    describe('deepenCold', () => {
        it('should deepen cold by default amount', () => {
            const { cryomancer } = system.recruitCryomancer({});
            system.deepenCold(cryomancer.cryomancerId);
            expect(cryomancer.cold).toBe(25);
        });

        it('should accept custom amount', () => {
            const { cryomancer } = system.recruitCryomancer({});
            system.deepenCold(cryomancer.cryomancerId, 15);
            expect(cryomancer.cold).toBe(35);
        });

        it('should reject missing cryomancer', () => {
            const result = system.deepenCold('ghost');
            expect(result.error).toBe('CRYOMANCER_NOT_FOUND');
        });

        it('should trigger coldDeepened hook', () => {
            const { cryomancer } = system.recruitCryomancer({});
            let called = false;
            system.registerHook('coldDeepened', () => { called = true; });
            system.deepenCold(cryomancer.cryomancerId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCryomancer', () => {
        it('should increment level', () => {
            const { cryomancer } = system.recruitCryomancer({});
            system.levelUpCryomancer(cryomancer.cryomancerId);
            expect(cryomancer.level).toBe(2);
        });

        it('should set veteran at level 10', () => {
            const { cryomancer } = system.recruitCryomancer({});
            for (let i = 0; i < 9; i++) system.levelUpCryomancer(cryomancer.cryomancerId);
            expect(cryomancer.status).toBe('veteran');
        });

        it('should reject missing cryomancer', () => {
            const result = system.levelUpCryomancer('ghost');
            expect(result.error).toBe('CRYOMANCER_NOT_FOUND');
        });
    });

    describe('legendCryomancer', () => {
        it('should set legendary', () => {
            const { cryomancer } = system.recruitCryomancer({});
            system.legendCryomancer(cryomancer.cryomancerId);
            expect(cryomancer.status).toBe('legendary');
        });

        it('should reject missing cryomancer', () => {
            const result = system.legendCryomancer('ghost');
            expect(result.error).toBe('CRYOMANCER_NOT_FOUND');
        });

        it('should trigger cryomancerLegendized hook', () => {
            const { cryomancer } = system.recruitCryomancer({});
            let called = false;
            system.registerHook('cryomancerLegendized', () => { called = true; });
            system.legendCryomancer(cryomancer.cryomancerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCryomancerValue', () => {
        it('should calculate value', () => {
            const { cryomancer } = system.recruitCryomancer({});
            system.addBlizzard(cryomancer.cryomancerId, {});
            const value = system.calculateCryomancerValue(cryomancer.cryomancerId);
            // level 1 * 100 + cold 20 * 2 + 1 blizzard * 30 = 100 + 40 + 30 = 170
            expect(value).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCryomancerValue('ghost')).toBe(0);
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

        it('should execute default getCryomancer', () => {
            const result = system.executeTool('getCryomancer', { cryomancerId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cryomancerRecruited', () => count++);
            unregister();
            system.recruitCryomancer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cryomancerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCryomancer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient recruits', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.recruitCryomancer({});
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.recruitCryomancer({});
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCryomancer({});
            const json = system.toJSON();
            expect(json.cryomancers.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitCryomancer({});
            const json = system.toJSON();
            const newSys = new CultivationCryomancer();
            newSys.fromJSON(json);
            expect(newSys.cryomancers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with counts', () => {
            const { cryomancer } = system.recruitCryomancer({});
            system.legendCryomancer(cryomancer.cryomancerId);
            const stats = system.getStats();
            expect(stats.cryomancerCount).toBe(1);
            expect(stats.legendaryCount).toBe(1);
            expect(stats.totalRecruited).toBe(1);
        });
    });
});
