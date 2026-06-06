/**
 * CultivationSage.test.js - 修真智者测试
 * V648 Iteration 1/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSage } from '../../../systems/ai/CultivationSage.js';

describe('CultivationSage', () => {
    let system;
    beforeEach(() => { system = new CultivationSage(); });

    describe('recruitSage', () => {
        it('should recruit a sage', () => {
            const { sage } = system.recruitSage({ masterId: 'm1', name: 'Sage Lao', type: 'daoist' });
            expect(sage.masterId).toBe('m1');
            expect(sage.name).toBe('Sage Lao');
            expect(sage.type).toBe('daoist');
            expect(sage.status).toBe('novice');
            expect(sage.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { sage } = system.recruitSage({});
            expect(sage.name).toBe('Unnamed Sage');
            expect(sage.type).toBe('wisdom');
            expect(sage.wisdom).toBe(20);
            expect(sage.scrolls).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { sage } = system.recruitSage({});
            expect(sage.sageId).toBeTruthy();
            expect(typeof sage.sageId).toBe('string');
        });

        it('should use provided sageId', () => {
            const { sage } = system.recruitSage({ sageId: 'custom-sage-1' });
            expect(sage.sageId).toBe('custom-sage-1');
        });

        it('should trigger sageRecruited hook', () => {
            let called = false;
            system.registerHook('sageRecruited', () => { called = true; });
            system.recruitSage({});
            expect(called).toBe(true);
        });

        it('should increment totalSages stat', () => {
            expect(system.stats.totalSages).toBe(0);
            system.recruitSage({});
            expect(system.stats.totalSages).toBe(1);
            system.recruitSage({});
            expect(system.stats.totalSages).toBe(2);
        });
    });

    describe('getSage', () => {
        it('should return a sage', () => {
            const { sage } = system.recruitSage({});
            expect(system.getSage(sage.sageId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getSage('ghost')).toBeNull();
        });
    });

    describe('listSages', () => {
        it('should list all', () => {
            system.recruitSage({});
            system.recruitSage({});
            expect(system.listSages().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listSages().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSage({ masterId: 'm1' });
            system.recruitSage({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitSage({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { sage: s1 } = system.recruitSage({});
            system.recruitSage({});
            system.legendSage(s1.sageId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitSage({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addScroll', () => {
        it('should add scroll', () => {
            const { sage } = system.recruitSage({});
            system.addScroll(sage.sageId, 'yin-yang-scroll');
            expect(sage.scrolls.length).toBe(1);
            expect(sage.scrolls[0]).toBe('yin-yang-scroll');
        });

        it('should reject missing', () => {
            const result = system.addScroll('ghost', 'x');
            expect(result.error).toBe('SAGE_NOT_FOUND');
        });

        it('should trigger scrollAdded hook', () => {
            const { sage } = system.recruitSage({});
            let called = false;
            system.registerHook('scrollAdded', () => { called = true; });
            system.addScroll(sage.sageId, 'fire-scroll');
            expect(called).toBe(true);
        });
    });

    describe('deepenWisdom', () => {
        it('should deepen wisdom', () => {
            const { sage } = system.recruitSage({});
            system.deepenWisdom(sage.sageId, 10);
            expect(sage.wisdom).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { sage } = system.recruitSage({});
            system.deepenWisdom(sage.sageId);
            expect(sage.wisdom).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenWisdom('ghost', 5);
            expect(result.error).toBe('SAGE_NOT_FOUND');
        });

        it('should trigger wisdomDeepened hook', () => {
            const { sage } = system.recruitSage({});
            let called = false;
            system.registerHook('wisdomDeepened', () => { called = true; });
            system.deepenWisdom(sage.sageId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSage', () => {
        it('should level up', () => {
            const { sage } = system.recruitSage({});
            system.levelUpSage(sage.sageId);
            expect(sage.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSage('ghost');
            expect(result.error).toBe('SAGE_NOT_FOUND');
        });

        it('should trigger sageLeveledUp hook', () => {
            const { sage } = system.recruitSage({});
            let called = false;
            system.registerHook('sageLeveledUp', () => { called = true; });
            system.levelUpSage(sage.sageId);
            expect(called).toBe(true);
        });
    });

    describe('legendSage', () => {
        it('should set status to legendary', () => {
            const { sage } = system.recruitSage({});
            system.legendSage(sage.sageId);
            expect(sage.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSage('ghost');
            expect(result.error).toBe('SAGE_NOT_FOUND');
        });

        it('should trigger sageLegendized hook', () => {
            const { sage } = system.recruitSage({});
            let called = false;
            system.registerHook('sageLegendized', () => { called = true; });
            system.legendSage(sage.sageId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSageValue', () => {
        it('should calculate value', () => {
            const { sage } = system.recruitSage({});
            system.addScroll(sage.sageId, 'scroll-1');
            // level=1, wisdom=20 (default baseWisdom), scrolls=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateSageValue(sage.sageId)).toBe(170);
        });

        it('should reflect level and wisdom changes', () => {
            const { sage } = system.recruitSage({});
            system.levelUpSage(sage.sageId);
            system.deepenWisdom(sage.sageId, 10);
            // level=2, wisdom=30, scrolls=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateSageValue(sage.sageId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSageValue('ghost')).toBe(0);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getSage', () => {
            const result = system.executeTool('getSage', { sageId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitSage', () => {
            const result = system.executeTool('recruitSage', { name: 'ToolSage' });
            expect(result.success).toBe(true);
            expect(result.result.sage.name).toBe('ToolSage');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sageRecruited', () => count++);
            unregister();
            system.recruitSage({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sageRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSage({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSages = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalSages = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSage({});
            const json = system.toJSON();
            expect(json.sages.length).toBe(1);
            expect(json.stats.totalSages).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSage({});
            const json = system.toJSON();
            const newSys = new CultivationSage();
            newSys.fromJSON(json);
            expect(newSys.sages.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sageCount).toBe(0);
            expect(stats.totalSages).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
