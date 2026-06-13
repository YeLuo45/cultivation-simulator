/**
 * CultivationSapphire.test.js - 修真蓝宝石系统测试
 * V834 Iteration 7/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSapphire } from '../../../systems/ai/CultivationSapphire.js';

describe('CultivationSapphire', () => {
    let system;
    beforeEach(() => { system = new CultivationSapphire(); });

    describe('recruitSapphire', () => {
        it('should recruit', () => {
            const { sapphire } = system.recruitSapphire({ masterId: 'm1', name: 'Sacred Sapphire', type: 'star' });
            expect(sapphire.masterId).toBe('m1');
            expect(sapphire.name).toBe('Sacred Sapphire');
            expect(sapphire.type).toBe('star');
        });

        it('should default type to divine', () => {
            const { sapphire } = system.recruitSapphire({});
            expect(sapphire.type).toBe('divine');
        });

        it('should default status to novice', () => {
            const { sapphire } = system.recruitSapphire({});
            expect(sapphire.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { sapphire } = system.recruitSapphire({});
            expect(sapphire.level).toBe(1);
        });

        it('should default inclusions to empty array', () => {
            const { sapphire } = system.recruitSapphire({});
            expect(sapphire.inclusions).toEqual([]);
        });

        it('should default depth to baseDepth', () => {
            const { sapphire } = system.recruitSapphire({});
            expect(sapphire.depth).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { sapphire } = system.recruitSapphire({});
            expect(sapphire.sapphireId).toMatch(/^sapphire_/);
        });

        it('should use provided sapphireId', () => {
            const { sapphire } = system.recruitSapphire({ sapphireId: 's_explicit' });
            expect(sapphire.sapphireId).toBe('s_explicit');
        });

        it('should trigger sapphireRecruited hook', () => {
            let called = false;
            system.registerHook('sapphireRecruited', () => { called = true; });
            system.recruitSapphire({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseDepth', () => {
            const customSystem = new CultivationSapphire({ baseDepth: 50 });
            const { sapphire } = customSystem.recruitSapphire({});
            expect(sapphire.depth).toBe(50);
        });

        it('should increment totalSapphires stat', () => {
            system.recruitSapphire({});
            system.recruitSapphire({});
            expect(system.stats.totalSapphires).toBe(2);
        });

        it('should support all three types', () => {
            const { sapphire: a } = system.recruitSapphire({ type: 'star' });
            const { sapphire: b } = system.recruitSapphire({ type: 'royal' });
            const { sapphire: c } = system.recruitSapphire({ type: 'divine' });
            expect(a.type).toBe('star');
            expect(b.type).toBe('royal');
            expect(c.type).toBe('divine');
        });
    });

    describe('getSapphire', () => {
        it('should return', () => {
            const { sapphire } = system.recruitSapphire({});
            expect(system.getSapphire(sapphire.sapphireId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSapphire('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { sapphire } = system.recruitSapphire({ name: 'Original' });
            const fetched = system.getSapphire(sapphire.sapphireId);
            fetched.name = 'Mutated';
            const refetched = system.getSapphire(sapphire.sapphireId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listSapphires', () => {
        it('should list all', () => {
            system.recruitSapphire({});
            system.recruitSapphire({});
            expect(system.listSapphires().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listSapphires().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitSapphire({ masterId: 'm1' });
            system.recruitSapphire({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitSapphire({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });

        it('should return multiple for same master', () => {
            system.recruitSapphire({ masterId: 'm1' });
            system.recruitSapphire({ masterId: 'm1' });
            system.recruitSapphire({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { sapphire: a } = system.recruitSapphire({});
            const { sapphire: b } = system.recruitSapphire({});
            system.legendSapphire(a.sapphireId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.sapphireId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitSapphire({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addInclusion', () => {
        it('should add inclusion', () => {
            const { sapphire } = system.recruitSapphire({});
            system.addInclusion(sapphire.sapphireId, 'rutile_silk');
            expect(sapphire.inclusions).toContain('rutile_silk');
        });

        it('should add multiple inclusions', () => {
            const { sapphire } = system.recruitSapphire({});
            system.addInclusion(sapphire.sapphireId, 'rutile_silk');
            system.addInclusion(sapphire.sapphireId, 'silk_band');
            expect(sapphire.inclusions.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addInclusion('ghost', 'rutile_silk');
            expect(result.error).toBe('SAPPHIRE_NOT_FOUND');
        });

        it('should trigger inclusionAdded hook', () => {
            const { sapphire } = system.recruitSapphire({});
            let called = false;
            system.registerHook('inclusionAdded', () => { called = true; });
            system.addInclusion(sapphire.sapphireId, 'rutile_silk');
            expect(called).toBe(true);
        });
    });

    describe('raiseDepth', () => {
        it('should raise depth', () => {
            const { sapphire } = system.recruitSapphire({});
            system.raiseDepth(sapphire.sapphireId, 10);
            expect(sapphire.depth).toBe(30);
        });

        it('should default amount to 5', () => {
            const { sapphire } = system.recruitSapphire({});
            system.raiseDepth(sapphire.sapphireId);
            expect(sapphire.depth).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDepth('ghost', 10);
            expect(result.error).toBe('SAPPHIRE_NOT_FOUND');
        });

        it('should trigger depthRaised hook', () => {
            const { sapphire } = system.recruitSapphire({});
            let called = false;
            system.registerHook('depthRaised', () => { called = true; });
            system.raiseDepth(sapphire.sapphireId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSapphire', () => {
        it('should increment level', () => {
            const { sapphire } = system.recruitSapphire({});
            system.levelUpSapphire(sapphire.sapphireId);
            expect(sapphire.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { sapphire } = system.recruitSapphire({});
            system.levelUpSapphire(sapphire.sapphireId);
            system.levelUpSapphire(sapphire.sapphireId);
            system.levelUpSapphire(sapphire.sapphireId);
            expect(sapphire.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpSapphire('ghost');
            expect(result.error).toBe('SAPPHIRE_NOT_FOUND');
        });
    });

    describe('legendSapphire', () => {
        it('should set status to legendary', () => {
            const { sapphire } = system.recruitSapphire({});
            system.legendSapphire(sapphire.sapphireId);
            expect(sapphire.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSapphire('ghost');
            expect(result.error).toBe('SAPPHIRE_NOT_FOUND');
        });

        it('should trigger sapphireLegendized hook', () => {
            const { sapphire } = system.recruitSapphire({});
            let called = false;
            system.registerHook('sapphireLegendized', () => { called = true; });
            system.legendSapphire(sapphire.sapphireId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSapphireValue', () => {
        it('should calculate', () => {
            const { sapphire } = system.recruitSapphire({});
            system.addInclusion(sapphire.sapphireId, 'rutile_silk');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateSapphireValue(sapphire.sapphireId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { sapphire } = system.recruitSapphire({});
            system.levelUpSapphire(sapphire.sapphireId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateSapphireValue(sapphire.sapphireId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after depth raise', () => {
            const { sapphire } = system.recruitSapphire({});
            system.raiseDepth(sapphire.sapphireId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateSapphireValue(sapphire.sapphireId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSapphireValue('ghost')).toBe(0);
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

        it('should execute default getSapphire', () => {
            const result = system.executeTool('getSapphire', { sapphireId: 'ghost' });
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
            const unregister = system.registerHook('sapphireRecruited', () => count++);
            unregister();
            system.recruitSapphire({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sapphireRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSapphire({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSapphires = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSapphires = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSapphire({});
            const json = system.toJSON();
            expect(json.sapphires.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSapphire({});
            const json = system.toJSON();
            const newSys = new CultivationSapphire();
            newSys.fromJSON(json);
            expect(newSys.sapphires.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitSapphire({});
            const stats = system.getStats();
            expect(stats.sapphireCount).toBe(1);
        });
    });
});
