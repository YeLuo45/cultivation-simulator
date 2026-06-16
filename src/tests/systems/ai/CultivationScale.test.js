/**
 * CultivationScale.test.js - 修真音阶系统测试
 * V792 Iteration 25/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationScale } from '../../../systems/ai/CultivationScale.js';

describe('CultivationScale', () => {
    let system;
    beforeEach(() => { system = new CultivationScale(); });

    describe('recruitScale', () => {
        it('should recruit with masterId', () => {
            const { scale } = system.recruitScale({ masterId: 'm1', name: 'Cmajor' });
            expect(scale.masterId).toBe('m1');
            expect(scale.name).toBe('Cmajor');
        });

        it('should default type to major', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            expect(scale.type).toBe('major');
        });

        it('should support minor', () => {
            const { scale } = system.recruitScale({ masterId: 'm1', type: 'minor' });
            expect(scale.type).toBe('minor');
        });

        it('should support pentatonic', () => {
            const { scale } = system.recruitScale({ masterId: 'm1', type: 'pentatonic' });
            expect(scale.type).toBe('pentatonic');
        });

        it('should default purity to basePurity', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            expect(scale.purity).toBe(20);
        });

        it('should accept custom purity', () => {
            const { scale } = system.recruitScale({ masterId: 'm1', purity: 60 });
            expect(scale.purity).toBe(60);
        });

        it('should default status to novice', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            expect(scale.status).toBe('novice');
        });

        it('should default degrees to []', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            expect(scale.degrees).toEqual([]);
        });

        it('should default level to 1', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            expect(scale.level).toBe(1);
        });

        it('should accept custom level', () => {
            const { scale } = system.recruitScale({ masterId: 'm1', level: 5 });
            expect(scale.level).toBe(5);
        });

        it('should accept custom status', () => {
            const { scale } = system.recruitScale({ masterId: 'm1', status: 'veteran' });
            expect(scale.status).toBe('veteran');
        });

        it('should accept custom degrees', () => {
            const { scale } = system.recruitScale({ masterId: 'm1', degrees: ['I', 'IV', 'V'] });
            expect(scale.degrees).toEqual(['I', 'IV', 'V']);
        });

        it('should accept custom scaleId', () => {
            const { scale } = system.recruitScale({ masterId: 'm1', scaleId: 'myScale' });
            expect(scale.scaleId).toBe('myScale');
        });

        it('should trigger scaleRecruited hook', () => {
            let called = false;
            system.registerHook('scaleRecruited', () => { called = true; });
            system.recruitScale({ masterId: 'm1' });
            expect(called).toBe(true);
        });

        it('should reject when maxScales reached', () => {
            const sys = new CultivationScale({ maxScales: 1 });
            sys.recruitScale({ masterId: 'm1' });
            const result = sys.recruitScale({ masterId: 'm2' });
            expect(result.error).toBe('MAX_SCALES_REACHED');
        });
    });

    describe('getScale', () => {
        it('should return', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            expect(system.getScale(scale.scaleId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getScale('ghost')).toBeNull(); });
    });

    describe('listScales', () => {
        it('should list all', () => {
            system.recruitScale({ masterId: 'm1' });
            system.recruitScale({ masterId: 'm2' });
            expect(system.listScales().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listScales()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitScale({ masterId: 'm1' });
            system.recruitScale({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitScale({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should return empty when no legendary', () => {
            system.recruitScale({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });

        it('should filter legendary', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            system.legendScale(scale.scaleId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addDegree', () => {
        it('should add degree', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            system.addDegree(scale.scaleId, 'I');
            expect(scale.degrees).toContain('I');
        });

        it('should reject missing', () => {
            const result = system.addDegree('ghost', 'I');
            expect(result.error).toBe('SCALE_NOT_FOUND');
        });

        it('should trigger degreeAdded hook', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            let called = false;
            system.registerHook('degreeAdded', () => { called = true; });
            system.addDegree(scale.scaleId, 'IV');
            expect(called).toBe(true);
        });
    });

    describe('raisePurity', () => {
        it('should raise with default amount', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            system.raisePurity(scale.scaleId);
            expect(scale.purity).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            system.raisePurity(scale.scaleId, 10);
            expect(scale.purity).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raisePurity('ghost', 5);
            expect(result.error).toBe('SCALE_NOT_FOUND');
        });

        it('should trigger purityRaised hook', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            let called = false;
            system.registerHook('purityRaised', () => { called = true; });
            system.raisePurity(scale.scaleId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpScale', () => {
        it('should level up', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            system.levelUpScale(scale.scaleId);
            expect(scale.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpScale('ghost');
            expect(result.error).toBe('SCALE_NOT_FOUND');
        });

        it('should trigger scaleLeveledUp hook', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            let called = false;
            system.registerHook('scaleLeveledUp', () => { called = true; });
            system.levelUpScale(scale.scaleId);
            expect(called).toBe(true);
        });
    });

    describe('legendScale', () => {
        it('should set legendary', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            system.legendScale(scale.scaleId);
            expect(scale.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendScale('ghost');
            expect(result.error).toBe('SCALE_NOT_FOUND');
        });

        it('should trigger scaleLegendized hook', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            let called = false;
            system.registerHook('scaleLegendized', () => { called = true; });
            system.legendScale(scale.scaleId);
            expect(called).toBe(true);
        });
    });

    describe('calculateScaleValue', () => {
        it('should calculate base value', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            // level 1 * 100 + purity 20 * 2 + degrees 0 * 30 = 140
            expect(system.calculateScaleValue(scale.scaleId)).toBe(140);
        });

        it('should include degrees in value', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            system.addDegree(scale.scaleId, 'I');
            system.addDegree(scale.scaleId, 'IV');
            // 100 + 40 + 60 = 200
            expect(system.calculateScaleValue(scale.scaleId)).toBe(200);
        });

        it('should include level in value', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            system.levelUpScale(scale.scaleId);
            system.levelUpScale(scale.scaleId);
            // 300 + 40 + 0 = 340
            expect(system.calculateScaleValue(scale.scaleId)).toBe(340);
        });

        it('should include purity in value', () => {
            const { scale } = system.recruitScale({ masterId: 'm1' });
            system.raisePurity(scale.scaleId, 10);
            // 100 + 60 + 0 = 160
            expect(system.calculateScaleValue(scale.scaleId)).toBe(160);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateScaleValue('ghost')).toBe(0);
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

        it('should execute default getScale', () => {
            const result = system.executeTool('getScale', { scaleId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitScale', () => {
            const result = system.executeTool('recruitScale', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('scaleRecruited', () => count++);
            unregister();
            system.recruitScale({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('scaleRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitScale({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient scales', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when enough scales', () => {
            system.stats.totalScales = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalScales = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitScale({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.scales.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitScale({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationScale();
            newSys.fromJSON(json);
            expect(newSys.scales.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.scaleCount).toBe(0);
        });
    });
});
