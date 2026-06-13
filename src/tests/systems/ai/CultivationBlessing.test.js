/**
 * CultivationBlessing.test.js - 修真祝福系统测试
 * V704 Iteration 27/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBlessing } from '../../../systems/ai/CultivationBlessing.js';

describe('CultivationBlessing', () => {
    let system;
    beforeEach(() => { system = new CultivationBlessing(); });

    describe('recruitBlessing', () => {
        it('should recruit', () => {
            const { blessing } = system.recruitBlessing({ masterId: 'm1', name: 'Holy Blessing', type: 'holy' });
            expect(blessing.masterId).toBe('m1');
            expect(blessing.name).toBe('Holy Blessing');
            expect(blessing.type).toBe('holy');
        });

        it('should default type to divine', () => {
            const { blessing } = system.recruitBlessing({});
            expect(blessing.type).toBe('divine');
        });

        it('should default status to novice', () => {
            const { blessing } = system.recruitBlessing({});
            expect(blessing.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { blessing } = system.recruitBlessing({});
            expect(blessing.level).toBe(1);
        });

        it('should default sanctities to empty array', () => {
            const { blessing } = system.recruitBlessing({});
            expect(blessing.sanctities).toEqual([]);
        });

        it('should assign auto id when missing', () => {
            const { blessing } = system.recruitBlessing({});
            expect(blessing.blessingId).toMatch(/^bls_/);
        });

        it('should use provided blessingId', () => {
            const { blessing } = system.recruitBlessing({ blessingId: 'b_explicit' });
            expect(blessing.blessingId).toBe('b_explicit');
        });

        it('should default grace to baseGrace', () => {
            const { blessing } = system.recruitBlessing({});
            expect(blessing.grace).toBe(20);
        });

        it('should use provided grace', () => {
            const { blessing } = system.recruitBlessing({ grace: 50 });
            expect(blessing.grace).toBe(50);
        });

        it('should trigger blessingRecruited hook', () => {
            let called = false;
            system.registerHook('blessingRecruited', () => { called = true; });
            system.recruitBlessing({});
            expect(called).toBe(true);
        });

        it('should support sacred type', () => {
            const { blessing } = system.recruitBlessing({ type: 'sacred' });
            expect(blessing.type).toBe('sacred');
        });
    });

    describe('getBlessing', () => {
        it('should return', () => {
            const { blessing } = system.recruitBlessing({});
            expect(system.getBlessing(blessing.blessingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBlessing('ghost')).toBeNull(); });
        it('should return a copy', () => {
            const { blessing } = system.recruitBlessing({});
            const fetched = system.getBlessing(blessing.blessingId);
            fetched.name = 'mutated';
            expect(system.getBlessing(blessing.blessingId).name).toBe('Divine Blessing');
        });
    });

    describe('listBlessings', () => {
        it('should list all', () => {
            system.recruitBlessing({});
            system.recruitBlessing({});
            expect(system.listBlessings().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listBlessings().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitBlessing({ masterId: 'm1' });
            system.recruitBlessing({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitBlessing({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });

        it('should filter by master multiple', () => {
            system.recruitBlessing({ masterId: 'm1' });
            system.recruitBlessing({ masterId: 'm1' });
            system.recruitBlessing({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { blessing: a } = system.recruitBlessing({});
            const { blessing: b } = system.recruitBlessing({});
            system.legendBlessing(a.blessingId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.blessingId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitBlessing({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should return multiple legendary', () => {
            const { blessing: a } = system.recruitBlessing({});
            const { blessing: b } = system.recruitBlessing({});
            system.legendBlessing(a.blessingId);
            system.legendBlessing(b.blessingId);
            expect(system.listLegendary().length).toBe(2);
        });
    });

    describe('addSanctity', () => {
        it('should add sanctity', () => {
            const { blessing } = system.recruitBlessing({});
            system.addSanctity(blessing.blessingId, 'purify_light');
            expect(blessing.sanctities).toContain('purify_light');
        });

        it('should add multiple sanctities', () => {
            const { blessing } = system.recruitBlessing({});
            system.addSanctity(blessing.blessingId, 'purify_light');
            system.addSanctity(blessing.blessingId, 'sacred_ward');
            expect(blessing.sanctities.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSanctity('ghost', 'purify_light');
            expect(result.error).toBe('BLESSING_NOT_FOUND');
        });

        it('should trigger sanctityAdded hook', () => {
            const { blessing } = system.recruitBlessing({});
            let called = false;
            system.registerHook('sanctityAdded', () => { called = true; });
            system.addSanctity(blessing.blessingId, 'purify_light');
            expect(called).toBe(true);
        });
    });

    describe('raiseGrace', () => {
        it('should raise grace', () => {
            const { blessing } = system.recruitBlessing({});
            system.raiseGrace(blessing.blessingId, 10);
            expect(blessing.grace).toBe(30);
        });

        it('should default amount to 5', () => {
            const { blessing } = system.recruitBlessing({});
            system.raiseGrace(blessing.blessingId);
            expect(blessing.grace).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseGrace('ghost', 10);
            expect(result.error).toBe('BLESSING_NOT_FOUND');
        });

        it('should trigger graceRaised hook', () => {
            const { blessing } = system.recruitBlessing({});
            let called = false;
            system.registerHook('graceRaised', () => { called = true; });
            system.raiseGrace(blessing.blessingId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBlessing', () => {
        it('should increment level', () => {
            const { blessing } = system.recruitBlessing({});
            system.levelUpBlessing(blessing.blessingId);
            expect(blessing.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { blessing } = system.recruitBlessing({});
            system.levelUpBlessing(blessing.blessingId);
            system.levelUpBlessing(blessing.blessingId);
            system.levelUpBlessing(blessing.blessingId);
            expect(blessing.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpBlessing('ghost');
            expect(result.error).toBe('BLESSING_NOT_FOUND');
        });
    });

    describe('legendBlessing', () => {
        it('should set status to legendary', () => {
            const { blessing } = system.recruitBlessing({});
            system.legendBlessing(blessing.blessingId);
            expect(blessing.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBlessing('ghost');
            expect(result.error).toBe('BLESSING_NOT_FOUND');
        });

        it('should trigger blessingLegendized hook', () => {
            const { blessing } = system.recruitBlessing({});
            let called = false;
            system.registerHook('blessingLegendized', () => { called = true; });
            system.legendBlessing(blessing.blessingId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBlessingValue', () => {
        it('should calculate', () => {
            const { blessing } = system.recruitBlessing({});
            system.addSanctity(blessing.blessingId, 'purify_light');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateBlessingValue(blessing.blessingId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { blessing } = system.recruitBlessing({});
            system.levelUpBlessing(blessing.blessingId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateBlessingValue(blessing.blessingId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after grace raise', () => {
            const { blessing } = system.recruitBlessing({});
            system.raiseGrace(blessing.blessingId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateBlessingValue(blessing.blessingId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBlessingValue('ghost')).toBe(0);
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

        it('should execute default getBlessing', () => {
            const result = system.executeTool('getBlessing', { blessingId: 'ghost' });
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
            const unregister = system.registerHook('blessingRecruited', () => count++);
            unregister();
            system.recruitBlessing({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('blessingRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBlessing({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBlessings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBlessings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBlessing({});
            const json = system.toJSON();
            expect(json.blessings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBlessing({});
            const json = system.toJSON();
            const newSys = new CultivationBlessing();
            newSys.fromJSON(json);
            expect(newSys.blessings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitBlessing({});
            const stats = system.getStats();
            expect(stats.blessingCount).toBe(1);
        });
    });
});
