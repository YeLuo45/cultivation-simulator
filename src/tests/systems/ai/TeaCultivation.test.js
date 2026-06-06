/**
 * TeaCultivation.test.js - 茶道系统测试
 * V442 Iteration 4/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TeaCultivation } from '../../../systems/ai/TeaCultivation.js';

describe('TeaCultivation', () => {
    let system;
    beforeEach(() => { system = new TeaCultivation(); });

    describe('brewTea', () => {
        it('should brew', () => {
            const { tea } = system.brewTea({ cultivatorId: 'c1', name: 'Dragon Well', type: 'green' });
            expect(tea.cultivatorId).toBe('c1');
            expect(tea.name).toBe('Dragon Well');
            expect(tea.type).toBe('green');
            expect(tea.status).toBe('brewed');
        });

        it('should default type and name', () => {
            const { tea } = system.brewTea({});
            expect(tea.type).toBe('green');
            expect(tea.name).toBe('Cloud Mist');
        });

        it('should default aroma to baseAroma', () => {
            const { tea } = system.brewTea({});
            expect(tea.aroma).toBe(20);
        });

        it('should accept custom aroma and flavor', () => {
            const { tea } = system.brewTea({ aroma: 50, flavor: 'smoky' });
            expect(tea.aroma).toBe(50);
            expect(tea.flavor).toBe('smoky');
        });

        it('should initialize infusions to 0', () => {
            const { tea } = system.brewTea({});
            expect(tea.infusions).toBe(0);
        });

        it('should set brewedAt timestamp', () => {
            const { tea } = system.brewTea({});
            expect(typeof tea.brewedAt).toBe('number');
        });

        it('should generate unique ids', () => {
            const { tea: t1 } = system.brewTea({});
            const { tea: t2 } = system.brewTea({});
            expect(t1.teaId).not.toBe(t2.teaId);
        });

        it('should accept custom id', () => {
            const { tea } = system.brewTea({ id: 'my-tea' });
            expect(tea.teaId).toBe('my-tea');
        });

        it('should return success result', () => {
            const result = system.brewTea({});
            expect(result.success).toBe(true);
        });

        it('should increment totalTeas', () => {
            system.brewTea({});
            system.brewTea({});
            expect(system.stats.totalTeas).toBe(2);
        });

        it('should trigger teaBrewed hook', () => {
            let called = false;
            system.registerHook('teaBrewed', () => { called = true; });
            system.brewTea({});
            expect(called).toBe(true);
        });
    });

    describe('getTea', () => {
        it('should return', () => {
            const { tea } = system.brewTea({});
            expect(system.getTea(tea.teaId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTea('ghost')).toBeNull(); });
        it('should return a copy', () => {
            const { tea } = system.brewTea({ name: 'A' });
            const got = system.getTea(tea.teaId);
            got.name = 'B';
            expect(system.getTea(tea.teaId).name).toBe('A');
        });
    });

    describe('listTeas', () => {
        it('should list all', () => {
            system.brewTea({});
            system.brewTea({});
            expect(system.listTeas().length).toBe(2);
        });
        it('should return empty list when none', () => {
            expect(system.listTeas().length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.brewTea({ type: 'green' });
            system.brewTea({ type: 'black' });
            system.brewTea({ type: 'green' });
            expect(system.listByType('green').length).toBe(2);
            expect(system.listByType('black').length).toBe(1);
            expect(system.listByType('oolong').length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.brewTea({ cultivatorId: 'c1' });
            system.brewTea({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
        it('should return empty for unknown', () => {
            system.brewTea({ cultivatorId: 'c1' });
            expect(system.listByCultivator('unknown').length).toBe(0);
        });
    });

    describe('listByAroma', () => {
        it('should filter by min aroma', () => {
            system.brewTea({ aroma: 10 });
            system.brewTea({ aroma: 100 });
            expect(system.listByAroma(50).length).toBe(1);
        });
    });

    describe('listAromatic', () => {
        it('should filter aromatic', () => {
            system.brewTea({ aroma: 10 });
            system.brewTea({ aroma: 100 });
            expect(system.listAromatic().length).toBe(1);
        });
    });

    describe('steepTea', () => {
        it('should steep', () => {
            const { tea } = system.brewTea({});
            system.steepTea(tea.teaId, 10);
            expect(tea.infusions).toBe(10);
        });

        it('should default amount to 5', () => {
            const { tea } = system.brewTea({});
            system.steepTea(tea.teaId);
            expect(tea.infusions).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.steepTea('ghost', 10);
            expect(result.error).toBe('TEA_NOT_FOUND');
            expect(result.success).toBe(false);
        });

        it('should trigger teaSteeped hook', () => {
            const { tea } = system.brewTea({});
            let called = false;
            system.registerHook('teaSteeped', () => { called = true; });
            system.steepTea(tea.teaId, 10);
            expect(called).toBe(true);
        });

        it('should accumulate infusions over multiple steeps', () => {
            const { tea } = system.brewTea({});
            system.steepTea(tea.teaId, 3);
            system.steepTea(tea.teaId, 7);
            expect(tea.infusions).toBe(10);
        });
    });

    describe('tasteTea', () => {
        it('should change status to sipped', () => {
            const { tea } = system.brewTea({});
            system.tasteTea(tea.teaId);
            expect(tea.status).toBe('sipped');
        });

        it('should reject missing', () => {
            const result = system.tasteTea('ghost');
            expect(result.error).toBe('TEA_NOT_FOUND');
        });

        it('should trigger teaTasted hook', () => {
            const { tea } = system.brewTea({});
            let called = false;
            system.registerHook('teaTasted', () => { called = true; });
            system.tasteTea(tea.teaId);
            expect(called).toBe(true);
        });
    });

    describe('finishTea', () => {
        it('should change status to finished', () => {
            const { tea } = system.brewTea({});
            system.finishTea(tea.teaId);
            expect(tea.status).toBe('finished');
        });

        it('should reject missing', () => {
            const result = system.finishTea('ghost');
            expect(result.error).toBe('TEA_NOT_FOUND');
        });

        it('should trigger teaFinished hook', () => {
            const { tea } = system.brewTea({});
            let called = false;
            system.registerHook('teaFinished', () => { called = true; });
            system.finishTea(tea.teaId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTeaAroma', () => {
        it('should calculate with no infusions', () => {
            const { tea } = system.brewTea({ aroma: 20, flavor: 'fresh' });
            // 20 * (1 + 0/10) + 'fresh'.length = 20 + 5 = 25
            expect(system.calculateTeaAroma(tea.teaId)).toBe(25);
        });

        it('should increase with infusions', () => {
            const { tea } = system.brewTea({ aroma: 20, flavor: 'fresh' });
            system.steepTea(tea.teaId, 10);
            // 20 * (1 + 10/10) + 5 = 20*2 + 5 = 45
            expect(system.calculateTeaAroma(tea.teaId)).toBe(45);
        });

        it('should add flavor length', () => {
            const { tea } = system.brewTea({ aroma: 20, flavor: 'smoky-roasted' });
            // 20 * 1 + 13 = 33
            expect(system.calculateTeaAroma(tea.teaId)).toBe(33);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTeaAroma('ghost')).toBe(0);
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
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
            expect(result.success).toBe(false);
        });

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getTea', () => {
            const result = system.executeTool('getTea', { teaId: 'ghost' });
            expect(result.success).toBe(true);
            expect(result.result).toBeNull();
        });

        it('should execute default brewTea tool', () => {
            const result = system.executeTool('brewTea', { cultivatorId: 'c1', name: 'T' });
            expect(result.success).toBe(true);
            expect(result.result.success).toBe(true);
            expect(system.stats.totalTeas).toBe(1);
        });

        it('should default context to {}', () => {
            system.registerTool('noop', (ctx) => typeof ctx);
            const result = system.executeTool('noop');
            expect(result.result).toBe('object');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('teaBrewed', () => count++);
            unregister();
            system.brewTea({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('teaBrewed', () => { throw new Error('x'); });
            expect(() => system.brewTea({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient teas', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalTeas = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalTeas = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.brewTea({ name: 'A' });
            const json = system.toJSON();
            expect(json.teas.length).toBe(1);
            expect(json.stats.totalTeas).toBe(1);
        });
        it('should deserialize', () => {
            system.brewTea({ name: 'A' });
            const json = system.toJSON();
            const newSys = new TeaCultivation();
            newSys.fromJSON(json);
            expect(newSys.teas.size).toBe(1);
            expect(newSys.stats.totalTeas).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.brewTea({});
            const stats = system.getStats();
            expect(stats.teaCount).toBe(1);
            expect(stats.totalTeas).toBe(1);
        });
    });
});
