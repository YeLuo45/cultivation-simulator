/**
 * AlchemyCauldron.test.js - 炼丹炉测试
 * V412 Iteration 4/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AlchemyCauldron } from '../../../systems/ai/AlchemyCauldron.js';

describe('AlchemyCauldron', () => {
    let system;
    beforeEach(() => { system = new AlchemyCauldron(); });

    describe('forgeCauldron', () => {
        it('should forge', () => {
            const { cauldron } = system.forgeCauldron({ grade: 'rare' });
            expect(cauldron.grade).toBe('rare');
        });

        it('should trigger cauldronForged hook', () => {
            let called = false;
            system.registerHook('cauldronForged', () => { called = true; });
            system.forgeCauldron({});
            expect(called).toBe(true);
        });
    });

    describe('getCauldron', () => {
        it('should return', () => {
            const { cauldron } = system.forgeCauldron({});
            expect(system.getCauldron(cauldron.cauldronId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCauldron('ghost')).toBeNull(); });
    });

    describe('listCauldrons', () => {
        it('should list all', () => {
            system.forgeCauldron({});
            expect(system.listCauldrons().length).toBe(1);
        });
    });

    describe('listByGrade', () => {
        it('should filter', () => {
            system.forgeCauldron({ grade: 'common' });
            system.forgeCauldron({ grade: 'rare' });
            expect(system.listByGrade('rare').length).toBe(1);
        });
    });

    describe('heat', () => {
        it('should heat', () => {
            const { cauldron } = system.forgeCauldron({});
            system.heat(cauldron.cauldronId, 200);
            expect(cauldron.temperature).toBe(200);
        });

        it('should reject missing', () => {
            const result = system.heat('ghost', 100);
            expect(result.error).toBe('CAULDRON_NOT_FOUND');
        });

        it('should trigger cauldronHeated hook', () => {
            const { cauldron } = system.forgeCauldron({});
            let called = false;
            system.registerHook('cauldronHeated', () => { called = true; });
            system.heat(cauldron.cauldronId, 100);
            expect(called).toBe(true);
        });
    });

    describe('refine', () => {
        it('should refine', () => {
            const { cauldron } = system.forgeCauldron({});
            const result = system.refine(cauldron.cauldronId, 'qi_pill', 'normal');
            expect(result.success).toBe(true);
        });

        it('should reduce durability', () => {
            const { cauldron } = system.forgeCauldron({});
            system.refine(cauldron.cauldronId, 'qi_pill');
            expect(cauldron.durability).toBe(95);
        });

        it('should reject missing', () => {
            const result = system.refine('ghost', 'qi_pill');
            expect(result.error).toBe('CAULDRON_NOT_FOUND');
        });

        it('should trigger pillRefined hook', () => {
            const { cauldron } = system.forgeCauldron({});
            let called = false;
            system.registerHook('pillRefined', () => { called = true; });
            system.refine(cauldron.cauldronId, 'qi_pill');
            expect(called).toBe(true);
        });
    });

    describe('repair', () => {
        it('should repair', () => {
            const { cauldron } = system.forgeCauldron({});
            system.repair(cauldron.cauldronId, 30);
            expect(cauldron.durability).toBe(100);
        });

        it('should cap at 100', () => {
            const { cauldron } = system.forgeCauldron({});
            system.repair(cauldron.cauldronId, 50);
            expect(cauldron.durability).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.repair('ghost');
            expect(result.error).toBe('CAULDRON_NOT_FOUND');
        });

        it('should trigger cauldronRepaired hook', () => {
            const { cauldron } = system.forgeCauldron({});
            let called = false;
            system.registerHook('cauldronRepaired', () => { called = true; });
            system.repair(cauldron.cauldronId);
            expect(called).toBe(true);
        });
    });

    describe('getPill', () => {
        it('should return', () => {
            const { cauldron } = system.forgeCauldron({});
            const { pill } = system.refine(cauldron.cauldronId, 'qi_pill');
            expect(system.getPill(pill.pillId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPill('ghost')).toBeNull(); });
    });

    describe('listPills', () => {
        it('should list all', () => {
            const { cauldron } = system.forgeCauldron({});
            system.refine(cauldron.cauldronId, 'qi_pill');
            expect(system.listPills().length).toBe(1);
        });
    });

    describe('listPillsByCauldron', () => {
        it('should filter', () => {
            const { cauldron: c1 } = system.forgeCauldron({});
            const { cauldron: c2 } = system.forgeCauldron({});
            system.refine(c1.cauldronId, 'qi_pill');
            system.refine(c2.cauldronId, 'qi_pill');
            expect(system.listPillsByCauldron(c1.cauldronId).length).toBe(1);
        });
    });

    describe('listPillsByQuality', () => {
        it('should filter', () => {
            const { cauldron } = system.forgeCauldron({});
            system.refine(cauldron.cauldronId, 'qi_pill', 'rare');
            system.refine(cauldron.cauldronId, 'qi_pill', 'common');
            expect(system.listPillsByQuality('rare').length).toBe(1);
        });
    });

    describe('listDamaged', () => {
        it('should filter', () => {
            const { cauldron } = system.forgeCauldron({});
            cauldron.durability = 10;
            system.forgeCauldron({});
            expect(system.listDamaged(30).length).toBe(1);
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

        it('should execute default getCauldron', () => {
            const result = system.executeTool('getCauldron', { cauldronId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cauldronForged', () => count++);
            unregister();
            system.forgeCauldron({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cauldronForged', () => { throw new Error('x'); });
            expect(() => system.forgeCauldron({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCauldrons = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCauldrons = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.forgeCauldron({});
            const json = system.toJSON();
            expect(json.cauldrons.length).toBe(1);
        });
        it('should deserialize', () => {
            system.forgeCauldron({});
            const json = system.toJSON();
            const newSys = new AlchemyCauldron();
            newSys.fromJSON(json);
            expect(newSys.cauldrons.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cauldronCount).toBe(0);
        });
    });
});