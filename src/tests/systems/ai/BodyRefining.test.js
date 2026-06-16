/**
 * BodyRefining.test.js - 炼体系统测试
 * V396 Iteration 3/15 Round 13 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BodyRefining } from '../../../systems/ai/BodyRefining.js';

describe('BodyRefining', () => {
    let system;
    beforeEach(() => { system = new BodyRefining(); });

    describe('createBody', () => {
        it('should create', () => {
            const { body } = system.createBody({ cultivatorId: 'c1' });
            expect(body.cultivatorId).toBe('c1');
        });

        it('should trigger bodyCreated hook', () => {
            let called = false;
            system.registerHook('bodyCreated', () => { called = true; });
            system.createBody({});
            expect(called).toBe(true);
        });
    });

    describe('getBody', () => {
        it('should return', () => {
            const { body } = system.createBody({});
            expect(system.getBody(body.bodyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBody('ghost')).toBeNull(); });
    });

    describe('listBodies', () => {
        it('should list all', () => {
            system.createBody({});
            expect(system.listBodies().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.createBody({ cultivatorId: 'c1' });
            system.createBody({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByStrength', () => {
        it('should filter', () => {
            system.createBody({ strength: 50 });
            system.createBody({ strength: 200 });
            expect(system.listByStrength(100).length).toBe(1);
        });
    });

    describe('train', () => {
        it('should train', () => {
            const { body } = system.createBody({});
            system.train(body.bodyId, 10);
            expect(body.strength).toBe(20);
        });

        it('should reject missing', () => {
            const result = system.train('ghost', 10);
            expect(result.error).toBe('BODY_NOT_FOUND');
        });

        it('should trigger bodyTrained hook', () => {
            const { body } = system.createBody({});
            let called = false;
            system.registerHook('bodyTrained', () => { called = true; });
            system.train(body.bodyId, 10);
            expect(called).toBe(true);
        });
    });

    describe('temper', () => {
        it('should temper', () => {
            const { body } = system.createBody({});
            system.temper(body.bodyId, 5);
            expect(body.defense).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.temper('ghost', 5);
            expect(result.error).toBe('BODY_NOT_FOUND');
        });

        it('should trigger bodyTempered hook', () => {
            const { body } = system.createBody({});
            let called = false;
            system.registerHook('bodyTempered', () => { called = true; });
            system.temper(body.bodyId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUp', () => {
        it('should level up', () => {
            const { body } = system.createBody({});
            system.levelUp(body.bodyId);
            expect(body.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUp('ghost');
            expect(result.error).toBe('BODY_NOT_FOUND');
        });

        it('should trigger bodyLeveledUp hook', () => {
            const { body } = system.createBody({});
            let called = false;
            system.registerHook('bodyLeveledUp', () => { called = true; });
            system.levelUp(body.bodyId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePower', () => {
        it('should calculate', () => {
            const { body } = system.createBody({});
            expect(system.calculatePower(body.bodyId)).toBeCloseTo(55, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePower('ghost')).toBe(0);
        });
    });

    describe('listStrong', () => {
        it('should filter', () => {
            system.createBody({ strength: 50 });
            system.createBody({ strength: 200 });
            expect(system.listStrong().length).toBe(1);
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

        it('should execute default getBody', () => {
            const result = system.executeTool('getBody', { bodyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bodyCreated', () => count++);
            unregister();
            system.createBody({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bodyCreated', () => { throw new Error('x'); });
            expect(() => system.createBody({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBodies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBodies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createBody({});
            const json = system.toJSON();
            expect(json.bodies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createBody({});
            const json = system.toJSON();
            const newSys = new BodyRefining();
            newSys.fromJSON(json);
            expect(newSys.bodies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bodyCount).toBe(0);
        });
    });
});