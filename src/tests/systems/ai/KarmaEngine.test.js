/**
 * KarmaEngine.test.js - 因果业力引擎测试
 * V340 Iteration 1/9 Round 7 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { KarmaEngine } from '../../../systems/ai/KarmaEngine.js';

describe('KarmaEngine', () => {
    let system;
    beforeEach(() => { system = new KarmaEngine(); });

    describe('Default Actions', () => {
        it('should have defaults', () => { expect(system.actions.size).toBe(5); });
        it('should contain good', () => { expect(system.getAction('good')).not.toBeNull(); });
    });

    describe('getAction', () => {
        it('should return', () => { expect(system.getAction('good')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getAction('ghost')).toBeNull(); });
    });

    describe('listActions', () => {
        it('should list all', () => { expect(system.listActions().length).toBe(5); });
    });

    describe('registerCultivator', () => {
        it('should register', () => {
            const { cultivator } = system.registerCultivator({ name: 'C1' });
            expect(cultivator.name).toBe('C1');
        });

        it('should start at base karma', () => {
            const { cultivator } = system.registerCultivator({});
            expect(cultivator.karma).toBe(0);
        });

        it('should default alignment to balanced', () => {
            const { cultivator } = system.registerCultivator({});
            expect(cultivator.alignment).toBe('balanced');
        });
    });

    describe('getCultivator', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getCultivator(cultivator.cultivatorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCultivator('ghost')).toBeNull(); });
    });

    describe('listCultivators', () => {
        it('should list all', () => {
            system.registerCultivator({});
            expect(system.listCultivators().length).toBe(1);
        });
    });

    describe('recordAction', () => {
        it('should record good', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.recordAction(cultivator.cultivatorId, 'good');
            expect(result.success).toBe(true);
        });

        it('should reject missing cultivator', () => {
            const result = system.recordAction('ghost', 'good');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject missing action', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.recordAction(cultivator.cultivatorId, 'ghost');
            expect(result.error).toBe('ACTION_NOT_FOUND');
        });

        it('should increase karma for good', () => {
            const { cultivator } = system.registerCultivator({});
            system.recordAction(cultivator.cultivatorId, 'good');
            expect(cultivator.karma).toBe(10);
        });

        it('should decrease karma for evil', () => {
            const { cultivator } = system.registerCultivator({});
            system.recordAction(cultivator.cultivatorId, 'evil');
            expect(cultivator.karma).toBe(-15);
        });

        it('should cap at maxKarma', () => {
            const { cultivator } = system.registerCultivator({ karma: 999 });
            system.recordAction(cultivator.cultivatorId, 'sacrifice');
            expect(cultivator.karma).toBe(1000);
        });

        it('should cap at -maxKarma', () => {
            const sys = new KarmaEngine({ maxKarma: 50 });
            const { cultivator } = sys.registerCultivator({ karma: -49 });
            sys.recordAction(cultivator.cultivatorId, 'evil');
            expect(cultivator.karma).toBe(-50);
        });

        it('should set alignment to light for positive karma', () => {
            const { cultivator } = system.registerCultivator({});
            system.recordAction(cultivator.cultivatorId, 'good');
            expect(cultivator.alignment).toBe('light');
        });

        it('should set alignment to dark for negative karma', () => {
            const { cultivator } = system.registerCultivator({});
            system.recordAction(cultivator.cultivatorId, 'evil');
            expect(cultivator.alignment).toBe('dark');
        });

        it('should increment actionCount', () => {
            const { cultivator } = system.registerCultivator({});
            system.recordAction(cultivator.cultivatorId, 'good');
            expect(cultivator.actionCount).toBe(1);
        });

        it('should increment totalActions', () => {
            const { cultivator } = system.registerCultivator({});
            system.recordAction(cultivator.cultivatorId, 'good');
            expect(system.stats.totalActions).toBe(1);
        });

        it('should trigger actionRecorded hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('actionRecorded', () => { called = true; });
            system.recordAction(cultivator.cultivatorId, 'good');
            expect(called).toBe(true);
        });
    });

    describe('getKarmaLog', () => {
        it('should return log', () => {
            const { cultivator } = system.registerCultivator({});
            system.recordAction(cultivator.cultivatorId, 'good');
            expect(system.getKarmaLog(cultivator.cultivatorId).length).toBe(1);
        });
    });

    describe('getCultivatorKarma', () => {
        it('should return karma', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getCultivatorKarma(cultivator.cultivatorId)).toBe(0);
        });

        it('should return null for missing', () => {
            expect(system.getCultivatorKarma('ghost')).toBeNull();
        });
    });

    describe('applyDecay', () => {
        it('should apply', () => {
            const { cultivator } = system.registerCultivator({ karma: 100 });
            const result = system.applyDecay(cultivator.cultivatorId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.applyDecay('ghost');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reduce karma', () => {
            const { cultivator } = system.registerCultivator({ karma: 100 });
            const before = cultivator.karma;
            system.applyDecay(cultivator.cultivatorId);
            expect(cultivator.karma).toBeLessThan(before);
        });

        it('should trigger karmaDecayed hook', () => {
            const { cultivator } = system.registerCultivator({ karma: 100 });
            let called = false;
            system.registerHook('karmaDecayed', () => { called = true; });
            system.applyDecay(cultivator.cultivatorId);
            expect(called).toBe(true);
        });
    });

    describe('getFateLine', () => {
        it('should create fate line', () => {
            const { cultivator } = system.registerCultivator({ karma: 50 });
            const fate = system.getFateLine(cultivator.cultivatorId);
            expect(fate).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getFateLine('ghost')).toBeNull();
        });

        it('should calculate saint_path for very positive karma', () => {
            const { cultivator } = system.registerCultivator({ karma: 200 });
            const fate = system.getFateLine(cultivator.cultivatorId);
            expect(fate.destiny).toBe('saint_path');
        });

        it('should calculate fallen_path for very negative karma', () => {
            const { cultivator } = system.registerCultivator({ karma: -200 });
            const fate = system.getFateLine(cultivator.cultivatorId);
            expect(fate.destiny).toBe('fallen_path');
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

        it('should execute default getKarma', () => {
            const result = system.executeTool('getKarma', { cultivatorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('actionRecorded', () => count++);
            unregister();
            const { cultivator } = system.registerCultivator({});
            system.recordAction(cultivator.cultivatorId, 'good');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('actionRecorded', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.recordAction(cultivator.cultivatorId, 'good')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalActions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalActions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            expect(json.cultivators.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            const newSys = new KarmaEngine();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.actionTypeCount).toBe(5);
        });
    });
});