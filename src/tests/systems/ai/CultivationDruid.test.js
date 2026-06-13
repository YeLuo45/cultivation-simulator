/**
 * CultivationDruid.test.js - 修真德鲁伊系统测试
 * V610 Iteration 13/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDruid } from '../../../systems/ai/CultivationDruid.js';

describe('CultivationDruid', () => {
    let system;
    beforeEach(() => { system = new CultivationDruid(); });

    describe('recruitDruid', () => {
        it('should recruit', () => {
            const { druid } = system.recruitDruid({ mentorId: 'mnt1', name: 'Forest Sage', type: 'mountain' });
            expect(druid.mentorId).toBe('mnt1');
            expect(druid.name).toBe('Forest Sage');
            expect(druid.type).toBe('mountain');
        });

        it('should default type to forest', () => {
            const { druid } = system.recruitDruid({});
            expect(druid.type).toBe('forest');
        });

        it('should default status to novice', () => {
            const { druid } = system.recruitDruid({});
            expect(druid.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { druid } = system.recruitDruid({});
            expect(druid.level).toBe(1);
        });

        it('should default shapes to empty array', () => {
            const { druid } = system.recruitDruid({});
            expect(druid.shapes).toEqual([]);
        });

        it('should default nature to baseNature', () => {
            const { druid } = system.recruitDruid({});
            expect(druid.nature).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { druid } = system.recruitDruid({});
            expect(druid.druidId).toMatch(/^dru_/);
        });

        it('should use provided druidId', () => {
            const { druid } = system.recruitDruid({ druidId: 'd_explicit' });
            expect(druid.druidId).toBe('d_explicit');
        });

        it('should trigger druidRecruited hook', () => {
            let called = false;
            system.registerHook('druidRecruited', () => { called = true; });
            system.recruitDruid({});
            expect(called).toBe(true);
        });

        it('should support ocean type', () => {
            const { druid } = system.recruitDruid({ type: 'ocean' });
            expect(druid.type).toBe('ocean');
        });
    });

    describe('getDruid', () => {
        it('should return', () => {
            const { druid } = system.recruitDruid({});
            expect(system.getDruid(druid.druidId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDruid('ghost')).toBeNull(); });
    });

    describe('listDruids', () => {
        it('should list all', () => {
            system.recruitDruid({});
            system.recruitDruid({});
            expect(system.listDruids().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listDruids().length).toBe(0);
        });
    });

    describe('listByMentor', () => {
        it('should filter', () => {
            system.recruitDruid({ mentorId: 'm1' });
            system.recruitDruid({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(1);
        });

        it('should return empty for unknown mentor', () => {
            system.recruitDruid({ mentorId: 'm1' });
            expect(system.listByMentor('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { druid: a } = system.recruitDruid({});
            const { druid: b } = system.recruitDruid({});
            system.legendDruid(a.druidId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.druidId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitDruid({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addShape', () => {
        it('should add shape', () => {
            const { druid } = system.recruitDruid({});
            system.addShape(druid.druidId, 'wolf');
            expect(druid.shapes).toContain('wolf');
        });

        it('should add multiple shapes', () => {
            const { druid } = system.recruitDruid({});
            system.addShape(druid.druidId, 'wolf');
            system.addShape(druid.druidId, 'bear');
            expect(druid.shapes.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addShape('ghost', 'wolf');
            expect(result.error).toBe('DRUID_NOT_FOUND');
        });

        it('should trigger shapeAdded hook', () => {
            const { druid } = system.recruitDruid({});
            let called = false;
            system.registerHook('shapeAdded', () => { called = true; });
            system.addShape(druid.druidId, 'wolf');
            expect(called).toBe(true);
        });
    });

    describe('deepenNature', () => {
        it('should deepen nature', () => {
            const { druid } = system.recruitDruid({});
            system.deepenNature(druid.druidId, 10);
            expect(druid.nature).toBe(30);
        });

        it('should default amount to 5', () => {
            const { druid } = system.recruitDruid({});
            system.deepenNature(druid.druidId);
            expect(druid.nature).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenNature('ghost', 10);
            expect(result.error).toBe('DRUID_NOT_FOUND');
        });

        it('should trigger natureDeepened hook', () => {
            const { druid } = system.recruitDruid({});
            let called = false;
            system.registerHook('natureDeepened', () => { called = true; });
            system.deepenNature(druid.druidId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDruid', () => {
        it('should increment level', () => {
            const { druid } = system.recruitDruid({});
            system.levelUpDruid(druid.druidId);
            expect(druid.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { druid } = system.recruitDruid({});
            system.levelUpDruid(druid.druidId);
            system.levelUpDruid(druid.druidId);
            system.levelUpDruid(druid.druidId);
            expect(druid.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpDruid('ghost');
            expect(result.error).toBe('DRUID_NOT_FOUND');
        });
    });

    describe('legendDruid', () => {
        it('should set status to legendary', () => {
            const { druid } = system.recruitDruid({});
            system.legendDruid(druid.druidId);
            expect(druid.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDruid('ghost');
            expect(result.error).toBe('DRUID_NOT_FOUND');
        });

        it('should trigger druidLegendized hook', () => {
            const { druid } = system.recruitDruid({});
            let called = false;
            system.registerHook('druidLegendized', () => { called = true; });
            system.legendDruid(druid.druidId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDruidValue', () => {
        it('should calculate', () => {
            const { druid } = system.recruitDruid({});
            system.addShape(druid.druidId, 'wolf');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateDruidValue(druid.druidId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { druid } = system.recruitDruid({});
            system.levelUpDruid(druid.druidId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateDruidValue(druid.druidId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after nature deepen', () => {
            const { druid } = system.recruitDruid({});
            system.deepenNature(druid.druidId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateDruidValue(druid.druidId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDruidValue('ghost')).toBe(0);
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

        it('should execute default getDruid', () => {
            const result = system.executeTool('getDruid', { druidId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context with default', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('druidRecruited', () => count++);
            unregister();
            system.recruitDruid({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('druidRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDruid({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDruids = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDruids = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDruid({});
            const json = system.toJSON();
            expect(json.druids.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDruid({});
            const json = system.toJSON();
            const newSys = new CultivationDruid();
            newSys.fromJSON(json);
            expect(newSys.druids.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitDruid({});
            const stats = system.getStats();
            expect(stats.druidCount).toBe(1);
        });
    });
});
