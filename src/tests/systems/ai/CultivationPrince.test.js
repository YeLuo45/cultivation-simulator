/**
 * CultivationPrince.test.js - 修真王子系统测试
 * V732 Iteration 25/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPrince } from '../../../systems/ai/CultivationPrince.js';

describe('CultivationPrince', () => {
    let system;
    beforeEach(() => { system = new CultivationPrince(); });

    describe('recruitPrince', () => {
        it('should recruit a prince', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'Crown Prince', type: 'crown' });
            expect(prince.parentId).toBe('p1');
            expect(prince.name).toBe('Crown Prince');
            expect(prince.type).toBe('crown');
        });

        it('should default type to noble', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            expect(prince.type).toBe('noble');
        });

        it('should default lineage to baseLineage', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            expect(prince.lineage).toBe(20);
        });

        it('should start with novice status and level 1', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            expect(prince.status).toBe('novice');
            expect(prince.level).toBe(1);
        });

        it('should start with empty virtues', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            expect(prince.virtues).toEqual([]);
        });

        it('should support custom lineage and virtues', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P', lineage: 99, virtues: ['courage'] });
            expect(prince.lineage).toBe(99);
            expect(prince.virtues).toEqual(['courage']);
        });

        it('should trigger princeRecruited hook', () => {
            let called = false;
            system.registerHook('princeRecruited', () => { called = true; });
            system.recruitPrince({ parentId: 'p1', name: 'P' });
            expect(called).toBe(true);
        });
    });

    describe('getPrince', () => {
        it('should return prince', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            const found = system.getPrince(prince.princeId);
            expect(found).not.toBeNull();
            expect(found.princeId).toBe(prince.princeId);
        });

        it('should return null for missing', () => {
            expect(system.getPrince('ghost')).toBeNull();
        });
    });

    describe('listPrinces', () => {
        it('should list all', () => {
            system.recruitPrince({ parentId: 'p1', name: 'A' });
            system.recruitPrince({ parentId: 'p2', name: 'B' });
            expect(system.listPrinces().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listPrinces()).toEqual([]);
        });
    });

    describe('listByParent', () => {
        it('should filter by parent', () => {
            system.recruitPrince({ parentId: 'p1', name: 'A' });
            system.recruitPrince({ parentId: 'p2', name: 'B' });
            system.recruitPrince({ parentId: 'p1', name: 'C' });
            expect(system.listByParent('p1').length).toBe(2);
        });

        it('should return empty for unknown parent', () => {
            system.recruitPrince({ parentId: 'p1', name: 'A' });
            expect(system.listByParent('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { prince: a } = system.recruitPrince({ parentId: 'p1', name: 'A' });
            system.recruitPrince({ parentId: 'p1', name: 'B' });
            system.legendPrince(a.princeId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addVirtue', () => {
        it('should add virtue', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            system.addVirtue(prince.princeId, 'courage');
            expect(prince.virtues).toContain('courage');
        });

        it('should reject missing prince', () => {
            const result = system.addVirtue('ghost', 'wisdom');
            expect(result.error).toBe('PRINCE_NOT_FOUND');
        });

        it('should trigger virtueAdded hook', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            let called = false;
            system.registerHook('virtueAdded', () => { called = true; });
            system.addVirtue(prince.princeId, 'honor');
            expect(called).toBe(true);
        });
    });

    describe('raiseLineage', () => {
        it('should raise by default 5', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            system.raiseLineage(prince.princeId);
            expect(prince.lineage).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            system.raiseLineage(prince.princeId, 50);
            expect(prince.lineage).toBe(70);
        });

        it('should reject missing prince', () => {
            const result = system.raiseLineage('ghost', 10);
            expect(result.error).toBe('PRINCE_NOT_FOUND');
        });

        it('should trigger lineageRaised hook', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            let called = false;
            system.registerHook('lineageRaised', () => { called = true; });
            system.raiseLineage(prince.princeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPrince', () => {
        it('should increment level', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            system.levelUpPrince(prince.princeId);
            expect(prince.level).toBe(2);
        });

        it('should reject missing prince', () => {
            const result = system.levelUpPrince('ghost');
            expect(result.error).toBe('PRINCE_NOT_FOUND');
        });
    });

    describe('legendPrince', () => {
        it('should set status to legendary', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            system.legendPrince(prince.princeId);
            expect(prince.status).toBe('legendary');
        });

        it('should reject missing prince', () => {
            const result = system.legendPrince('ghost');
            expect(result.error).toBe('PRINCE_NOT_FOUND');
        });

        it('should trigger princeLegendized hook', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            let called = false;
            system.registerHook('princeLegendized', () => { called = true; });
            system.legendPrince(prince.princeId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePrinceValue', () => {
        it('should calculate base value', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            // level=1 * 100 + lineage=20 * 2 + virtues=0 * 30 = 140
            expect(system.calculatePrinceValue(prince.princeId)).toBe(140);
        });

        it('should account for level and virtues', () => {
            const { prince } = system.recruitPrince({ parentId: 'p1', name: 'P' });
            system.levelUpPrince(prince.princeId); // 2
            system.levelUpPrince(prince.princeId); // 3
            system.addVirtue(prince.princeId, 'courage');
            system.addVirtue(prince.princeId, 'wisdom');
            system.raiseLineage(prince.princeId, 10); // 30
            // level=3 * 100 + lineage=30 * 2 + virtues=2 * 30 = 300+60+60=420
            expect(system.calculatePrinceValue(prince.princeId)).toBe(420);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePrinceValue('ghost')).toBe(0);
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

        it('should execute default getPrince', () => {
            const result = system.executeTool('getPrince', { princeId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo', undefined);
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('princeRecruited', () => count++);
            unregister();
            system.recruitPrince({ parentId: 'p1', name: 'P' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('princeRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPrince({ parentId: 'p1', name: 'P' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPrinces = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPrinces = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPrince({ parentId: 'p1', name: 'P' });
            const json = system.toJSON();
            expect(json.princes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPrince({ parentId: 'p1', name: 'P' });
            const json = system.toJSON();
            const newSys = new CultivationPrince();
            newSys.fromJSON(json);
            expect(newSys.princes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.princeCount).toBe(0);
        });
    });
});
