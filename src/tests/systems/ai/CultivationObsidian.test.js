/**
 * CultivationObsidian.test.js - 修真黑曜石系统测试
 * V839 Iteration 12/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationObsidian } from '../../../systems/ai/CultivationObsidian.js';

describe('CultivationObsidian', () => {
    let system;
    beforeEach(() => { system = new CultivationObsidian(); });

    describe('recruitObsidian', () => {
        it('should recruit with defaults', () => {
            const { obsidian } = system.recruitObsidian({});
            expect(obsidian.masterId).toBe('unknown_master');
            expect(obsidian.name).toBe('unnamed_obsidian');
            expect(obsidian.type).toBe('black');
            expect(obsidian.sharpness).toBe(20);
            expect(obsidian.edges).toEqual([]);
            expect(obsidian.level).toBe(1);
            expect(obsidian.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { obsidian } = system.recruitObsidian({
                masterId: 'm1',
                name: 'ShadowObsidian',
                type: 'snowflake',
                sharpness: 80,
                edges: ['razor'],
                level: 3,
                status: 'veteran'
            });
            expect(obsidian.masterId).toBe('m1');
            expect(obsidian.name).toBe('ShadowObsidian');
            expect(obsidian.type).toBe('snowflake');
            expect(obsidian.sharpness).toBe(80);
            expect(obsidian.edges).toEqual(['razor']);
            expect(obsidian.level).toBe(3);
            expect(obsidian.status).toBe('veteran');
        });

        it('should increment totalObsidians', () => {
            system.recruitObsidian({});
            system.recruitObsidian({});
            expect(system.stats.totalObsidians).toBe(2);
        });

        it('should trigger obsidianRecruited hook', () => {
            let called = false;
            system.registerHook('obsidianRecruited', () => { called = true; });
            system.recruitObsidian({});
            expect(called).toBe(true);
        });
    });

    describe('getObsidian', () => {
        it('should return obsidian', () => {
            const { obsidian } = system.recruitObsidian({});
            const got = system.getObsidian(obsidian.obsidianId);
            expect(got).not.toBeNull();
            expect(got.obsidianId).toBe(obsidian.obsidianId);
        });
        it('should return null for missing', () => { expect(system.getObsidian('ghost')).toBeNull(); });
    });

    describe('listObsidians', () => {
        it('should list all', () => {
            system.recruitObsidian({});
            system.recruitObsidian({});
            system.recruitObsidian({});
            expect(system.listObsidians().length).toBe(3);
        });

        it('should return empty list when no obsidians', () => {
            expect(system.listObsidians().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitObsidian({ masterId: 'm1' });
            system.recruitObsidian({ masterId: 'm1' });
            system.recruitObsidian({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary obsidians', () => {
            const { obsidian: o1 } = system.recruitObsidian({});
            const { obsidian: o2 } = system.recruitObsidian({});
            system.legendObsidian(o1.obsidianId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].obsidianId).toBe(o1.obsidianId);
        });

        it('should return empty when none legendary', () => {
            system.recruitObsidian({});
            system.recruitObsidian({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addEdge', () => {
        it('should add edge', () => {
            const { obsidian } = system.recruitObsidian({});
            system.addEdge(obsidian.obsidianId, 'razor');
            expect(obsidian.edges).toContain('razor');
            expect(obsidian.edges.length).toBe(1);
        });

        it('should add multiple edges', () => {
            const { obsidian } = system.recruitObsidian({});
            system.addEdge(obsidian.obsidianId, 'razor');
            system.addEdge(obsidian.obsidianId, 'serrated');
            expect(obsidian.edges).toEqual(['razor', 'serrated']);
        });

        it('should set status to veteran when 5+ edges', () => {
            const { obsidian } = system.recruitObsidian({});
            system.addEdge(obsidian.obsidianId, 'a');
            system.addEdge(obsidian.obsidianId, 'b');
            system.addEdge(obsidian.obsidianId, 'c');
            system.addEdge(obsidian.obsidianId, 'd');
            expect(obsidian.status).toBe('novice');
            system.addEdge(obsidian.obsidianId, 'e');
            expect(obsidian.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addEdge('ghost', 'razor');
            expect(result.error).toBe('OBSIDIAN_NOT_FOUND');
        });

        it('should trigger edgeAdded hook', () => {
            const { obsidian } = system.recruitObsidian({});
            let called = false;
            system.registerHook('edgeAdded', () => { called = true; });
            system.addEdge(obsidian.obsidianId, 'razor');
            expect(called).toBe(true);
        });
    });

    describe('raiseSharpness', () => {
        it('should raise by default amount', () => {
            const { obsidian } = system.recruitObsidian({});
            system.raiseSharpness(obsidian.obsidianId);
            expect(obsidian.sharpness).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { obsidian } = system.recruitObsidian({});
            system.raiseSharpness(obsidian.obsidianId, 30);
            expect(obsidian.sharpness).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseSharpness('ghost', 5);
            expect(result.error).toBe('OBSIDIAN_NOT_FOUND');
        });

        it('should trigger sharpnessRaised hook', () => {
            const { obsidian } = system.recruitObsidian({});
            let called = false;
            system.registerHook('sharpnessRaised', () => { called = true; });
            system.raiseSharpness(obsidian.obsidianId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpObsidian', () => {
        it('should level up', () => {
            const { obsidian } = system.recruitObsidian({});
            system.levelUpObsidian(obsidian.obsidianId);
            expect(obsidian.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { obsidian } = system.recruitObsidian({});
            system.levelUpObsidian(obsidian.obsidianId);
            system.levelUpObsidian(obsidian.obsidianId);
            expect(obsidian.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpObsidian('ghost');
            expect(result.error).toBe('OBSIDIAN_NOT_FOUND');
        });

        it('should trigger obsidianLeveledUp hook', () => {
            const { obsidian } = system.recruitObsidian({});
            let called = false;
            system.registerHook('obsidianLeveledUp', () => { called = true; });
            system.levelUpObsidian(obsidian.obsidianId);
            expect(called).toBe(true);
        });
    });

    describe('legendObsidian', () => {
        it('should set status to legendary', () => {
            const { obsidian } = system.recruitObsidian({});
            system.legendObsidian(obsidian.obsidianId);
            expect(obsidian.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendObsidian('ghost');
            expect(result.error).toBe('OBSIDIAN_NOT_FOUND');
        });

        it('should trigger obsidianLegendized hook', () => {
            const { obsidian } = system.recruitObsidian({});
            let called = false;
            system.registerHook('obsidianLegendized', () => { called = true; });
            system.legendObsidian(obsidian.obsidianId);
            expect(called).toBe(true);
        });
    });

    describe('calculateObsidianValue', () => {
        it('should calculate default value', () => {
            const { obsidian } = system.recruitObsidian({});
            // level=1 * 100 + sharpness=20 * 2 + 0 * 30 = 140
            expect(system.calculateObsidianValue(obsidian.obsidianId)).toBe(140);
        });

        it('should add 30 per edge', () => {
            const { obsidian } = system.recruitObsidian({});
            system.addEdge(obsidian.obsidianId, 'razor');
            system.addEdge(obsidian.obsidianId, 'serrated');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateObsidianValue(obsidian.obsidianId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { obsidian } = system.recruitObsidian({});
            system.levelUpObsidian(obsidian.obsidianId);
            system.levelUpObsidian(obsidian.obsidianId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateObsidianValue(obsidian.obsidianId)).toBe(340);
        });

        it('should reflect sharpness in formula', () => {
            const { obsidian } = system.recruitObsidian({});
            system.raiseSharpness(obsidian.obsidianId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateObsidianValue(obsidian.obsidianId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateObsidianValue('ghost')).toBe(0);
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

        it('should execute default getObsidian', () => {
            const result = system.executeTool('getObsidian', { obsidianId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('obsidianRecruited', () => count++);
            unregister();
            system.recruitObsidian({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('obsidianRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitObsidian({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalObsidians = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalObsidians = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitObsidian({});
            const json = system.toJSON();
            expect(json.obsidians.length).toBe(1);
            expect(json.stats.totalObsidians).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitObsidian({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationObsidian();
            newSys.fromJSON(json);
            expect(newSys.obsidians.size).toBe(1);
            expect(newSys.stats.totalObsidians).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.obsidianCount).toBe(0);
            expect(stats.totalObsidians).toBe(0);
            system.recruitObsidian({});
            expect(system.getStats().obsidianCount).toBe(1);
        });
    });
});