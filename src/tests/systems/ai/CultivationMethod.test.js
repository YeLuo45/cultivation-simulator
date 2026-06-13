/**
 * CultivationMethod.test.js - 道法系统测试
 * V530 Iteration 12/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMethod } from '../../../systems/ai/CultivationMethod.js';

describe('CultivationMethod', () => {
    let system;
    beforeEach(() => { system = new CultivationMethod(); });

    describe('learnMethod', () => {
        it('should learn method', () => {
            const { method } = system.learnMethod({ cultivatorId: 'c1', name: 'Nine Yang Manual' });
            expect(method.cultivatorId).toBe('c1');
            expect(method.name).toBe('Nine Yang Manual');
        });

        it('should default to learning status', () => {
            const { method } = system.learnMethod({});
            expect(method.status).toBe('learning');
        });

        it('should default type to qi', () => {
            const { method } = system.learnMethod({});
            expect(method.type).toBe('qi');
        });

        it('should default efficacy to baseEfficacy', () => {
            const { method } = system.learnMethod({});
            expect(method.efficacy).toBe(20);
        });

        it('should start at level 1', () => {
            const { method } = system.learnMethod({});
            expect(method.level).toBe(1);
        });

        it('should start with empty mantras', () => {
            const { method } = system.learnMethod({});
            expect(method.mantras).toEqual([]);
        });

        it('should generate methodId', () => {
            const { method } = system.learnMethod({});
            expect(method.methodId).toBeDefined();
            expect(typeof method.methodId).toBe('string');
        });

        it('should accept custom methodId', () => {
            const { method } = system.learnMethod({ methodId: 'my-method' });
            expect(method.methodId).toBe('my-method');
        });

        it('should trigger methodLearned hook', () => {
            let called = false;
            system.registerHook('methodLearned', () => { called = true; });
            system.learnMethod({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { method: m1 } = system.learnMethod({ type: 'qi' });
            const { method: m2 } = system.learnMethod({ type: 'spirit' });
            const { method: m3 } = system.learnMethod({ type: 'soul' });
            expect(m1.type).toBe('qi');
            expect(m2.type).toBe('spirit');
            expect(m3.type).toBe('soul');
        });
    });

    describe('getMethod', () => {
        it('should return method', () => {
            const { method } = system.learnMethod({});
            expect(system.getMethod(method.methodId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMethod('ghost')).toBeNull(); });
    });

    describe('listMethods', () => {
        it('should list all', () => {
            system.learnMethod({});
            system.learnMethod({});
            expect(system.listMethods().length).toBe(2);
        });

        it('should return empty when no methods', () => {
            expect(system.listMethods().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.learnMethod({ cultivatorId: 'c1' });
            system.learnMethod({ cultivatorId: 'c2' });
            system.learnMethod({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c1').length).toBe(2);
        });

        it('should return empty for unknown cultivator', () => {
            system.learnMethod({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should filter mastered only', () => {
            const { method: m1 } = system.learnMethod({});
            const { method: m2 } = system.learnMethod({});
            system.masterMethod(m1.methodId);
            const mastered = system.listMastered();
            expect(mastered.length).toBe(1);
            expect(mastered[0].methodId).toBe(m1.methodId);
            expect(m2.status).toBe('learning');
        });

        it('should return empty when none mastered', () => {
            system.learnMethod({});
            expect(system.listMastered().length).toBe(0);
        });
    });

    describe('addMantra', () => {
        it('should add mantra', () => {
            const { method } = system.learnMethod({});
            system.addMantra(method.methodId, 'om-mani-padme-hum');
            expect(method.mantras).toContain('om-mani-padme-hum');
        });

        it('should accumulate mantras', () => {
            const { method } = system.learnMethod({});
            system.addMantra(method.methodId, 'm1');
            system.addMantra(method.methodId, 'm2');
            system.addMantra(method.methodId, 'm3');
            expect(method.mantras.length).toBe(3);
        });

        it('should reject missing method', () => {
            const result = system.addMantra('ghost', 'm');
            expect(result.error).toBe('METHOD_NOT_FOUND');
        });

        it('should trigger mantraAdded hook', () => {
            const { method } = system.learnMethod({});
            let called = false;
            system.registerHook('mantraAdded', () => { called = true; });
            system.addMantra(method.methodId, 'm');
            expect(called).toBe(true);
        });
    });

    describe('increaseEfficacy', () => {
        it('should increase efficacy by default', () => {
            const { method } = system.learnMethod({});
            system.increaseEfficacy(method.methodId);
            expect(method.efficacy).toBe(25);
        });

        it('should increase efficacy by custom amount', () => {
            const { method } = system.learnMethod({});
            system.increaseEfficacy(method.methodId, 100);
            expect(method.efficacy).toBe(120);
        });

        it('should reject missing method', () => {
            const result = system.increaseEfficacy('ghost');
            expect(result.error).toBe('METHOD_NOT_FOUND');
        });

        it('should trigger efficacyIncreased hook', () => {
            const { method } = system.learnMethod({});
            let called = false;
            system.registerHook('efficacyIncreased', () => { called = true; });
            system.increaseEfficacy(method.methodId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMethod', () => {
        it('should level up', () => {
            const { method } = system.learnMethod({});
            system.levelUpMethod(method.methodId);
            expect(method.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { method } = system.learnMethod({});
            system.levelUpMethod(method.methodId);
            system.levelUpMethod(method.methodId);
            system.levelUpMethod(method.methodId);
            expect(method.level).toBe(4);
        });

        it('should reject missing method', () => {
            const result = system.levelUpMethod('ghost');
            expect(result.error).toBe('METHOD_NOT_FOUND');
        });

        it('should trigger methodLeveledUp hook', () => {
            const { method } = system.learnMethod({});
            let called = false;
            system.registerHook('methodLeveledUp', () => { called = true; });
            system.levelUpMethod(method.methodId);
            expect(called).toBe(true);
        });
    });

    describe('masterMethod', () => {
        it('should master method', () => {
            const { method } = system.learnMethod({});
            system.masterMethod(method.methodId);
            expect(method.status).toBe('mastered');
        });

        it('should reject missing method', () => {
            const result = system.masterMethod('ghost');
            expect(result.error).toBe('METHOD_NOT_FOUND');
        });

        it('should trigger methodMastered hook', () => {
            const { method } = system.learnMethod({});
            let called = false;
            system.registerHook('methodMastered', () => { called = true; });
            system.masterMethod(method.methodId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMethodPower', () => {
        it('should calculate base power', () => {
            const { method } = system.learnMethod({});
            // level=1, efficacy=20, mantras=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateMethodPower(method.methodId)).toBe(140);
        });

        it('should include mantras in power', () => {
            const { method } = system.learnMethod({});
            system.addMantra(method.methodId, 'm1');
            system.addMantra(method.methodId, 'm2');
            // level=1, efficacy=20, mantras=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateMethodPower(method.methodId)).toBe(200);
        });

        it('should scale with level', () => {
            const { method } = system.learnMethod({});
            system.levelUpMethod(method.methodId);
            system.levelUpMethod(method.methodId);
            // level=3, efficacy=20, mantras=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateMethodPower(method.methodId)).toBe(340);
        });

        it('should scale with efficacy', () => {
            const { method } = system.learnMethod({});
            system.increaseEfficacy(method.methodId, 100);
            // level=1, efficacy=120, mantras=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateMethodPower(method.methodId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMethodPower('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
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

        it('should execute default getMethod', () => {
            const result = system.executeTool('getMethod', { methodId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default learnMethod', () => {
            const result = system.executeTool('learnMethod', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('methodLearned', () => count++);
            unregister();
            system.learnMethod({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('methodLearned', () => { throw new Error('x'); });
            expect(() => system.learnMethod({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMethods = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMethods = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.learnMethod({});
            const json = system.toJSON();
            expect(json.methods.length).toBe(1);
        });
        it('should deserialize', () => {
            system.learnMethod({});
            const json = system.toJSON();
            const newSys = new CultivationMethod();
            newSys.fromJSON(json);
            expect(newSys.methods.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.methodCount).toBe(0);
        });
    });
});
