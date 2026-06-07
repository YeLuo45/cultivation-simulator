/**
 * CultivationSlate.test.js - 修真板岩系统测试
 * V842 Iteration 15/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSlate } from '../../../systems/ai/CultivationSlate.js';

describe('CultivationSlate', () => {
    let system;
    beforeEach(() => { system = new CultivationSlate(); });

    describe('recruitSlate', () => {
        it('should create', () => {
            const { slate } = system.recruitSlate({ masterId: 'm1', name: 'Azure', type: 'purple' });
            expect(slate.masterId).toBe('m1');
            expect(slate.name).toBe('Azure');
            expect(slate.type).toBe('purple');
        });

        it('should default type to gray and use baseFlatness', () => {
            const { slate } = system.recruitSlate({});
            expect(slate.type).toBe('gray');
            expect(slate.flatness).toBe(20);
            expect(slate.status).toBe('novice');
            expect(slate.level).toBe(1);
            expect(slate.layers).toEqual([]);
        });

        it('should accept custom flatness and layers', () => {
            const { slate } = system.recruitSlate({ flatness: 50, layers: ['a', 'b'] });
            expect(slate.flatness).toBe(50);
            expect(slate.layers.length).toBe(2);
        });

        it('should trigger slateRecruited hook', () => {
            let called = false;
            system.registerHook('slateRecruited', () => { called = true; });
            system.recruitSlate({});
            expect(called).toBe(true);
        });

        it('should reject when at maxSlates', () => {
            const small = new CultivationSlate({ maxSlates: 1 });
            small.recruitSlate({});
            const result = small.recruitSlate({});
            expect(result.error).toBe('MAX_Slates_REACHED');
        });
    });

    describe('getSlate', () => {
        it('should return', () => {
            const { slate } = system.recruitSlate({});
            expect(system.getSlate(slate.slateId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSlate('ghost')).toBeNull(); });
    });

    describe('listSlates', () => {
        it('should list all', () => {
            system.recruitSlate({});
            system.recruitSlate({});
            expect(system.listSlates().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitSlate({ masterId: 'm1' });
            system.recruitSlate({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { slate: a } = system.recruitSlate({});
            const { slate: b } = system.recruitSlate({});
            system.legendSlate(a.slateId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addLayer', () => {
        it('should add', () => {
            const { slate } = system.recruitSlate({});
            system.addLayer(slate.slateId, 'mica');
            expect(slate.layers.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addLayer('ghost', 'x');
            expect(result.error).toBe('SLATE_NOT_FOUND');
        });

        it('should trigger layerAdded hook', () => {
            const { slate } = system.recruitSlate({});
            let called = false;
            system.registerHook('layerAdded', () => { called = true; });
            system.addLayer(slate.slateId, 'quartz');
            expect(called).toBe(true);
        });
    });

    describe('raiseFlatness', () => {
        it('should raise with custom amount', () => {
            const { slate } = system.recruitSlate({});
            system.raiseFlatness(slate.slateId, 10);
            expect(slate.flatness).toBe(30);
        });

        it('should default amount to 5', () => {
            const { slate } = system.recruitSlate({});
            system.raiseFlatness(slate.slateId);
            expect(slate.flatness).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseFlatness('ghost', 5);
            expect(result.error).toBe('SLATE_NOT_FOUND');
        });

        it('should trigger flatnessRaised hook', () => {
            const { slate } = system.recruitSlate({});
            let called = false;
            system.registerHook('flatnessRaised', () => { called = true; });
            system.raiseFlatness(slate.slateId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSlate', () => {
        it('should level up', () => {
            const { slate } = system.recruitSlate({});
            system.levelUpSlate(slate.slateId);
            expect(slate.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSlate('ghost');
            expect(result.error).toBe('SLATE_NOT_FOUND');
        });

        it('should trigger slateLeveledUp hook', () => {
            const { slate } = system.recruitSlate({});
            let called = false;
            system.registerHook('slateLeveledUp', () => { called = true; });
            system.levelUpSlate(slate.slateId);
            expect(called).toBe(true);
        });
    });

    describe('legendSlate', () => {
        it('should legendize', () => {
            const { slate } = system.recruitSlate({});
            system.legendSlate(slate.slateId);
            expect(slate.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSlate('ghost');
            expect(result.error).toBe('SLATE_NOT_FOUND');
        });

        it('should trigger slateLegendized hook', () => {
            const { slate } = system.recruitSlate({});
            let called = false;
            system.registerHook('slateLegendized', () => { called = true; });
            system.legendSlate(slate.slateId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSlateValue', () => {
        it('should calculate', () => {
            const { slate } = system.recruitSlate({ level: 2, flatness: 30 });
            system.addLayer(slate.slateId, 'a');
            system.addLayer(slate.slateId, 'b');
            // level*100 + flatness*2 + layers*30 = 200 + 60 + 60 = 320
            expect(system.calculateSlateValue(slate.slateId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSlateValue('ghost')).toBe(0);
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

        it('should execute default getSlate', () => {
            const result = system.executeTool('getSlate', { slateId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('slateRecruited', () => count++);
            unregister();
            system.recruitSlate({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('slateRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSlate({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSlates = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSlates = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSlate({});
            const json = system.toJSON();
            expect(json.slates.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSlate({});
            const json = system.toJSON();
            const newSys = new CultivationSlate();
            newSys.fromJSON(json);
            expect(newSys.slates.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.slateCount).toBe(0);
        });
    });
});
