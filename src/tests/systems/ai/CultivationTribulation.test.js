/**
 * CultivationTribulation.test.js - 渡劫系统测试
 * V519 Iteration 1/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTribulation } from '../../../systems/ai/CultivationTribulation.js';

describe('CultivationTribulation', () => {
    let system;
    beforeEach(() => { system = new CultivationTribulation(); });

    describe('invokeTribulation', () => {
        it('should invoke', () => {
            const { tribulation } = system.invokeTribulation({ cultivatorId: 'c1', name: 'Tribulation of Fire' });
            expect(tribulation.cultivatorId).toBe('c1');
            expect(tribulation.name).toBe('Tribulation of Fire');
        });

        it('should default type to heartlight', () => {
            const { tribulation } = system.invokeTribulation({ cultivatorId: 'c1' });
            expect(tribulation.type).toBe('heartlight');
        });

        it('should accept all types', () => {
            const a = system.invokeTribulation({ cultivatorId: 'c1', type: 'heartlight' });
            const b = system.invokeTribulation({ cultivatorId: 'c2', type: 'buddha' });
            const c = system.invokeTribulation({ cultivatorId: 'c3', type: 'demon' });
            expect(a.tribulation.type).toBe('heartlight');
            expect(b.tribulation.type).toBe('buddha');
            expect(c.tribulation.type).toBe('demon');
        });

        it('should default lightning to baseLightning=50', () => {
            const { tribulation } = system.invokeTribulation({ cultivatorId: 'c1' });
            expect(tribulation.lightning).toBe(50);
        });

        it('should accept custom lightning and karma', () => {
            const { tribulation } = system.invokeTribulation({ cultivatorId: 'c1', lightning: 200, karma: 30 });
            expect(tribulation.lightning).toBe(200);
            expect(tribulation.karma).toBe(30);
        });

        it('should set status to imminent and level 1', () => {
            const { tribulation } = system.invokeTribulation({ cultivatorId: 'c1' });
            expect(tribulation.status).toBe('imminent');
            expect(tribulation.level).toBe(1);
        });

        it('should trigger tribulationInvoked hook', () => {
            let called = false;
            system.registerHook('tribulationInvoked', () => { called = true; });
            system.invokeTribulation({});
            expect(called).toBe(true);
        });
    });

    describe('getTribulation', () => {
        it('should return', () => {
            const { tribulation } = system.invokeTribulation({});
            expect(system.getTribulation(tribulation.tribulationId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTribulation('ghost')).toBeNull(); });
    });

    describe('listTribulations', () => {
        it('should list all', () => {
            system.invokeTribulation({});
            expect(system.listTribulations().length).toBe(1);
        });
        it('should return empty initially', () => {
            expect(system.listTribulations().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.invokeTribulation({ cultivatorId: 'c1' });
            system.invokeTribulation({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should list active and imminent', () => {
            const { tribulation: t1 } = system.invokeTribulation({});
            t1.status = 'active';
            system.invokeTribulation({});
            expect(system.listActive().length).toBe(2);
        });
        it('should not list survived', () => {
            const { tribulation: t1 } = system.invokeTribulation({});
            system.surviveTribulation(t1.tribulationId);
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('addLightning', () => {
        it('should add with default amount 10', () => {
            const { tribulation } = system.invokeTribulation({});
            system.addLightning(tribulation.tribulationId);
            expect(tribulation.lightning).toBe(60);
        });
        it('should add with custom amount', () => {
            const { tribulation } = system.invokeTribulation({});
            system.addLightning(tribulation.tribulationId, 25);
            expect(tribulation.lightning).toBe(75);
        });
        it('should promote imminent to active', () => {
            const { tribulation } = system.invokeTribulation({});
            system.addLightning(tribulation.tribulationId);
            expect(tribulation.status).toBe('active');
        });
        it('should reject missing', () => {
            const result = system.addLightning('ghost', 10);
            expect(result.error).toBe('TRIBULATION_NOT_FOUND');
        });
        it('should trigger lightningAdded hook', () => {
            const { tribulation } = system.invokeTribulation({});
            let called = false;
            system.registerHook('lightningAdded', () => { called = true; });
            system.addLightning(tribulation.tribulationId, 10);
            expect(called).toBe(true);
        });
    });

    describe('reduceKarma', () => {
        it('should reduce with default 5', () => {
            const { tribulation } = system.invokeTribulation({ karma: 20 });
            system.reduceKarma(tribulation.tribulationId);
            expect(tribulation.karma).toBe(15);
        });
        it('should reduce with custom amount', () => {
            const { tribulation } = system.invokeTribulation({ karma: 30 });
            system.reduceKarma(tribulation.tribulationId, 10);
            expect(tribulation.karma).toBe(20);
        });
        it('should not go below 0', () => {
            const { tribulation } = system.invokeTribulation({ karma: 3 });
            system.reduceKarma(tribulation.tribulationId, 10);
            expect(tribulation.karma).toBe(0);
        });
        it('should reject missing', () => {
            const result = system.reduceKarma('ghost', 5);
            expect(result.error).toBe('TRIBULATION_NOT_FOUND');
        });
        it('should trigger karmaReduced hook', () => {
            const { tribulation } = system.invokeTribulation({ karma: 20 });
            let called = false;
            system.registerHook('karmaReduced', () => { called = true; });
            system.reduceKarma(tribulation.tribulationId, 5);
            expect(called).toBe(true);
        });
    });

    describe('increaseLevel', () => {
        it('should increase level', () => {
            const { tribulation } = system.invokeTribulation({});
            system.increaseLevel(tribulation.tribulationId);
            expect(tribulation.level).toBe(2);
        });
        it('should increase twice', () => {
            const { tribulation } = system.invokeTribulation({});
            system.increaseLevel(tribulation.tribulationId);
            system.increaseLevel(tribulation.tribulationId);
            expect(tribulation.level).toBe(3);
        });
        it('should reject missing', () => {
            const result = system.increaseLevel('ghost');
            expect(result.error).toBe('TRIBULATION_NOT_FOUND');
        });
    });

    describe('surviveTribulation', () => {
        it('should survive', () => {
            const { tribulation } = system.invokeTribulation({});
            system.surviveTribulation(tribulation.tribulationId);
            expect(tribulation.status).toBe('survived');
        });
        it('should reject missing', () => {
            const result = system.surviveTribulation('ghost');
            expect(result.error).toBe('TRIBULATION_NOT_FOUND');
        });
        it('should trigger tribulationSurvived hook', () => {
            const { tribulation } = system.invokeTribulation({});
            let called = false;
            system.registerHook('tribulationSurvived', () => { called = true; });
            system.surviveTribulation(tribulation.tribulationId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTribulationPower', () => {
        it('should calculate power: level*100 + lightning*2 - karma', () => {
            const { tribulation } = system.invokeTribulation({ lightning: 50, karma: 10 });
            // 1*100 + 50*2 - 10 = 190
            expect(system.calculateTribulationPower(tribulation.tribulationId)).toBe(190);
        });
        it('should reflect level changes', () => {
            const { tribulation } = system.invokeTribulation({ karma: 0 });
            // level 1, lightning 50 (default), karma 0 -> 1*100 + 50*2 - 0 = 200
            expect(system.calculateTribulationPower(tribulation.tribulationId)).toBe(200);
            system.increaseLevel(tribulation.tribulationId);
            system.increaseLevel(tribulation.tribulationId);
            // 3*100 + 50*2 - 0 = 400
            expect(system.calculateTribulationPower(tribulation.tribulationId)).toBe(400);
        });
        it('should return 0 for missing', () => {
            expect(system.calculateTribulationPower('ghost')).toBe(0);
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

        it('should execute default getTribulation and invokeTribulation', () => {
            const r1 = system.executeTool('getTribulation', { tribulationId: 'ghost' });
            expect(r1.result).toBeNull();
            const r2 = system.executeTool('invokeTribulation', { cultivatorId: 'cx' });
            expect(r2.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tribulationInvoked', () => count++);
            unregister();
            system.invokeTribulation({});
            expect(count).toBe(0);
        });
        it('should handle errors silently', () => {
            system.registerHook('tribulationInvoked', () => { throw new Error('x'); });
            expect(() => system.invokeTribulation({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTribulations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTribulations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.invokeTribulation({});
            const json = system.toJSON();
            expect(json.tribulations.length).toBe(1);
        });
        it('should deserialize', () => {
            system.invokeTribulation({});
            const json = system.toJSON();
            const newSys = new CultivationTribulation();
            newSys.fromJSON(json);
            expect(newSys.tribulations.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tribulationCount).toBe(0);
        });
    });
});
