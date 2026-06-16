/**
 * SectInfluence.test.js - 宗门影响力系统测试
 * V494 Iteration 11/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectInfluence } from '../../../systems/ai/SectInfluence.js';

describe('SectInfluence', () => {
    let system;
    beforeEach(() => { system = new SectInfluence(); });

    describe('spreadInfluence', () => {
        it('should spread influence', () => {
            const { influence } = system.spreadInfluence({ sectId: 's1', name: 'NorthGate', region: 'north' });
            expect(influence.sectId).toBe('s1');
            expect(influence.name).toBe('NorthGate');
            expect(influence.region).toBe('north');
        });

        it('should default status to expanding', () => {
            const { influence } = system.spreadInfluence({});
            expect(influence.status).toBe('expanding');
        });

        it('should accept custom status', () => {
            const { influence } = system.spreadInfluence({ status: 'dominant' });
            expect(influence.status).toBe('dominant');
        });

        it('should default power to basePower', () => {
            const { influence } = system.spreadInfluence({});
            expect(influence.power).toBe(10);
        });

        it('should accept custom power', () => {
            const { influence } = system.spreadInfluence({ power: 50 });
            expect(influence.power).toBe(50);
        });

        it('should default subjects to empty array', () => {
            const { influence } = system.spreadInfluence({});
            expect(influence.subjects).toEqual([]);
        });

        it('should accept subjects as array', () => {
            const { influence } = system.spreadInfluence({ subjects: ['town_a', 'town_b'] });
            expect(influence.subjects).toEqual(['town_a', 'town_b']);
        });

        it('should accept custom influenceId', () => {
            const { influence } = system.spreadInfluence({ influenceId: 'inf_custom_1' });
            expect(influence.influenceId).toBe('inf_custom_1');
        });

        it('should accept custom id', () => {
            const { influence } = system.spreadInfluence({ id: 'inf_custom_2' });
            expect(influence.influenceId).toBe('inf_custom_2');
        });

        it('should trigger influenceSpread hook', () => {
            let called = false;
            system.registerHook('influenceSpread', () => { called = true; });
            system.spreadInfluence({});
            expect(called).toBe(true);
        });

        it('should increment totalInfluences', () => {
            system.spreadInfluence({});
            system.spreadInfluence({});
            expect(system.stats.totalInfluences).toBe(2);
        });

        it('should return success', () => {
            const result = system.spreadInfluence({});
            expect(result.success).toBe(true);
        });
    });

    describe('getInfluence', () => {
        it('should return influence', () => {
            const { influence } = system.spreadInfluence({});
            expect(system.getInfluence(influence.influenceId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getInfluence('ghost')).toBeNull();
        });

        it('should return a copy of subjects array', () => {
            const { influence } = system.spreadInfluence({ subjects: ['a'] });
            const result = system.getInfluence(influence.influenceId);
            result.subjects.push('mutated');
            const fresh = system.getInfluence(influence.influenceId);
            expect(fresh.subjects).toEqual(['a']);
        });
    });

    describe('listInfluences', () => {
        it('should list all', () => {
            system.spreadInfluence({});
            system.spreadInfluence({});
            expect(system.listInfluences().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listInfluences().length).toBe(0);
        });

        it('should return copies of subjects arrays', () => {
            system.spreadInfluence({ subjects: ['a'] });
            const list = system.listInfluences();
            list[0].subjects.push('mutated');
            const fresh = system.listInfluences();
            expect(fresh[0].subjects).toEqual(['a']);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.spreadInfluence({ sectId: 's1' });
            system.spreadInfluence({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty for unknown sect', () => {
            system.spreadInfluence({});
            expect(system.listBySect('ghost').length).toBe(0);
        });

        it('should return multiple matches for same sect', () => {
            system.spreadInfluence({ sectId: 's1' });
            system.spreadInfluence({ sectId: 's1' });
            system.spreadInfluence({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(2);
        });
    });

    describe('listDominant', () => {
        it('should filter dominant only', () => {
            const { influence: a } = system.spreadInfluence({ status: 'dominant' });
            system.spreadInfluence({ status: 'expanding' });
            system.spreadInfluence({ status: 'weakening' });
            expect(system.listDominant().length).toBe(1);
        });

        it('should return empty when none dominant', () => {
            system.spreadInfluence({});
            system.spreadInfluence({ status: 'weakening' });
            expect(system.listDominant().length).toBe(0);
        });

        it('should include dominants after weaken', () => {
            // After weakenInfluence status becomes 'weakening', so listDominant excludes it
            const { influence: a } = system.spreadInfluence({ status: 'dominant' });
            system.weakenInfluence(a.influenceId);
            expect(system.listDominant().length).toBe(0);
        });
    });

    describe('increasePower', () => {
        it('should increase power by default amount', () => {
            const { influence } = system.spreadInfluence({ power: 20 });
            system.increasePower(influence.influenceId);
            expect(influence.power).toBe(30);
        });

        it('should increase power by custom amount', () => {
            const { influence } = system.spreadInfluence({ power: 20 });
            system.increasePower(influence.influenceId, 25);
            expect(influence.power).toBe(45);
        });

        it('should reject missing', () => {
            const result = system.increasePower('ghost', 10);
            expect(result.error).toBe('INFLUENCE_NOT_FOUND');
        });

        it('should trigger powerIncreased hook', () => {
            const { influence } = system.spreadInfluence({});
            let called = false;
            system.registerHook('powerIncreased', () => { called = true; });
            system.increasePower(influence.influenceId, 10);
            expect(called).toBe(true);
        });

        it('should return success on valid', () => {
            const { influence } = system.spreadInfluence({});
            const result = system.increasePower(influence.influenceId, 5);
            expect(result.success).toBe(true);
        });
    });

    describe('addSubject', () => {
        it('should add subject to existing array', () => {
            const { influence } = system.spreadInfluence({ subjects: ['a'] });
            system.addSubject(influence.influenceId, 'b');
            expect(influence.subjects).toEqual(['a', 'b']);
        });

        it('should add to empty array', () => {
            const { influence } = system.spreadInfluence({});
            system.addSubject(influence.influenceId, 'first');
            expect(influence.subjects).toEqual(['first']);
        });

        it('should reject missing', () => {
            const result = system.addSubject('ghost', 'whatever');
            expect(result.error).toBe('INFLUENCE_NOT_FOUND');
        });

        it('should trigger subjectAdded hook', () => {
            const { influence } = system.spreadInfluence({});
            let called = false;
            system.registerHook('subjectAdded', () => { called = true; });
            system.addSubject(influence.influenceId, 'new');
            expect(called).toBe(true);
        });

        it('should return success on valid', () => {
            const { influence } = system.spreadInfluence({});
            const result = system.addSubject(influence.influenceId, 'new');
            expect(result.success).toBe(true);
        });
    });

    describe('weakenInfluence', () => {
        it('should set status to weakening', () => {
            const { influence } = system.spreadInfluence({});
            system.weakenInfluence(influence.influenceId);
            expect(influence.status).toBe('weakening');
        });

        it('should reject missing', () => {
            const result = system.weakenInfluence('ghost');
            expect(result.error).toBe('INFLUENCE_NOT_FOUND');
        });

        it('should trigger influenceWeakened hook', () => {
            const { influence } = system.spreadInfluence({});
            let called = false;
            system.registerHook('influenceWeakened', () => { called = true; });
            system.weakenInfluence(influence.influenceId);
            expect(called).toBe(true);
        });

        it('should return success on valid', () => {
            const { influence } = system.spreadInfluence({});
            const result = system.weakenInfluence(influence.influenceId);
            expect(result.success).toBe(true);
        });
    });

    describe('calculateInfluenceValue', () => {
        it('should calculate value for default influence', () => {
            const { influence } = system.spreadInfluence({});
            // power=10 * 2 + 0 subjects * 5 = 20
            expect(system.calculateInfluenceValue(influence.influenceId)).toBe(20);
        });

        it('should factor in subjects length', () => {
            const { influence } = system.spreadInfluence({ power: 10, subjects: ['a', 'b', 'c'] });
            // 10 * 2 + 3 * 5 = 20 + 15 = 35
            expect(system.calculateInfluenceValue(influence.influenceId)).toBe(35);
        });

        it('should increase with added subjects', () => {
            const { influence } = system.spreadInfluence({ power: 10 });
            system.addSubject(influence.influenceId, 'town_a');
            system.addSubject(influence.influenceId, 'town_b');
            // 20 + 2 * 5 = 30
            expect(system.calculateInfluenceValue(influence.influenceId)).toBe(30);
        });

        it('should increase with power increase', () => {
            const { influence } = system.spreadInfluence({ power: 10 });
            system.increasePower(influence.influenceId, 15);
            // 25 * 2 + 0 = 50
            expect(system.calculateInfluenceValue(influence.influenceId)).toBe(50);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateInfluenceValue('ghost')).toBe(0);
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

        it('should execute default getInfluence', () => {
            const result = system.executeTool('getInfluence', { influenceId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default spreadInfluence tool', () => {
            const result = system.executeTool('spreadInfluence', { sectId: 's1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('influenceSpread', () => count++);
            unregister();
            system.spreadInfluence({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('influenceSpread', () => { throw new Error('x'); });
            expect(() => system.spreadInfluence({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalInfluences = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalInfluences = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.spreadInfluence({});
            const json = system.toJSON();
            expect(json.influences.length).toBe(1);
        });

        it('should deserialize', () => {
            system.spreadInfluence({});
            const json = system.toJSON();
            const newSys = new SectInfluence();
            newSys.fromJSON(json);
            expect(newSys.influences.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.influenceCount).toBe(0);
        });

        it('should include influenceCount after spread', () => {
            system.spreadInfluence({});
            const stats = system.getStats();
            expect(stats.influenceCount).toBe(1);
        });
    });
});
