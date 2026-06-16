/**
 * CultivationBody.test.js - 道身系统测试
 * V525 Iteration 7/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBody } from '../../../systems/ai/CultivationBody.js';

describe('CultivationBody', () => {
    let system;
    beforeEach(() => { system = new CultivationBody(); });

    describe('forgeBody', () => {
        it('should forge body', () => {
            const { body } = system.forgeBody({ cultivatorId: 'c1', name: 'Immortal Body' });
            expect(body.cultivatorId).toBe('c1');
            expect(body.name).toBe('Immortal Body');
        });

        it('should default to mortal status', () => {
            const { body } = system.forgeBody({});
            expect(body.status).toBe('mortal');
        });

        it('should default type to immortal', () => {
            const { body } = system.forgeBody({});
            expect(body.type).toBe('immortal');
        });

        it('should default strength to baseStrength', () => {
            const { body } = system.forgeBody({});
            expect(body.strength).toBe(30);
        });

        it('should start at level 1', () => {
            const { body } = system.forgeBody({});
            expect(body.level).toBe(1);
        });

        it('should start with empty bones', () => {
            const { body } = system.forgeBody({});
            expect(body.bones).toEqual([]);
        });

        it('should trigger bodyForged hook', () => {
            let called = false;
            system.registerHook('bodyForged', () => { called = true; });
            system.forgeBody({});
            expect(called).toBe(true);
        });
    });

    describe('getBody', () => {
        it('should return', () => {
            const { body } = system.forgeBody({});
            expect(system.getBody(body.bodyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBody('ghost')).toBeNull(); });
    });

    describe('listBodies', () => {
        it('should list all', () => {
            system.forgeBody({});
            system.forgeBody({});
            expect(system.listBodies().length).toBe(2);
        });

        it('should return empty when no bodies', () => {
            expect(system.listBodies().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.forgeBody({ cultivatorId: 'c1' });
            system.forgeBody({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listEnlightened', () => {
        it('should filter enlightened only', () => {
            const { body: b1 } = system.forgeBody({});
            const { body: b2 } = system.forgeBody({});
            // Note: status goes from mortal to ascended, so we manually mark enlightened for filter
            b1.status = 'enlightened';
            const enlightened = system.listEnlightened();
            expect(enlightened.length).toBe(1);
            expect(enlightened[0].bodyId).toBe(b1.bodyId);
            expect(b2.status).toBe('mortal');
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.forgeBody({ type: 'immortal' });
            system.forgeBody({ type: 'celestial' });
            system.forgeBody({ type: 'dharma' });
            expect(system.listByType('immortal').length).toBe(1);
            expect(system.listByType('celestial').length).toBe(1);
        });
    });

    describe('addBone', () => {
        it('should add bone', () => {
            const { body } = system.forgeBody({});
            system.addBone(body.bodyId, 'titan-bone');
            expect(body.bones).toContain('titan-bone');
        });

        it('should reject missing', () => {
            const result = system.addBone('ghost', 'bone');
            expect(result.error).toBe('BODY_NOT_FOUND');
        });

        it('should trigger boneAdded hook', () => {
            const { body } = system.forgeBody({});
            let called = false;
            system.registerHook('boneAdded', () => { called = true; });
            system.addBone(body.bodyId, 'bone');
            expect(called).toBe(true);
        });
    });

    describe('increaseStrength', () => {
        it('should increase strength by default', () => {
            const { body } = system.forgeBody({});
            system.increaseStrength(body.bodyId);
            expect(body.strength).toBe(35);
        });

        it('should increase strength by custom amount', () => {
            const { body } = system.forgeBody({});
            system.increaseStrength(body.bodyId, 50);
            expect(body.strength).toBe(80);
        });

        it('should reject missing', () => {
            const result = system.increaseStrength('ghost');
            expect(result.error).toBe('BODY_NOT_FOUND');
        });

        it('should trigger strengthIncreased hook', () => {
            const { body } = system.forgeBody({});
            let called = false;
            system.registerHook('strengthIncreased', () => { called = true; });
            system.increaseStrength(body.bodyId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBody', () => {
        it('should level up', () => {
            const { body } = system.forgeBody({});
            system.levelUpBody(body.bodyId);
            expect(body.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpBody('ghost');
            expect(result.error).toBe('BODY_NOT_FOUND');
        });

        it('should trigger bodyLeveledUp hook', () => {
            const { body } = system.forgeBody({});
            let called = false;
            system.registerHook('bodyLeveledUp', () => { called = true; });
            system.levelUpBody(body.bodyId);
            expect(called).toBe(true);
        });
    });

    describe('ascendBody', () => {
        it('should ascend body', () => {
            const { body } = system.forgeBody({});
            system.ascendBody(body.bodyId);
            expect(body.status).toBe('ascended');
        });

        it('should reject missing', () => {
            const result = system.ascendBody('ghost');
            expect(result.error).toBe('BODY_NOT_FOUND');
        });

        it('should trigger bodyAscended hook', () => {
            const { body } = system.forgeBody({});
            let called = false;
            system.registerHook('bodyAscended', () => { called = true; });
            system.ascendBody(body.bodyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBodyPower', () => {
        it('should calculate', () => {
            const { body } = system.forgeBody({});
            // level=1, strength=30, bones=0 -> 1*100 + 30*2 + 0*30 = 160
            expect(system.calculateBodyPower(body.bodyId)).toBe(160);
        });

        it('should include bones in power', () => {
            const { body } = system.forgeBody({});
            system.addBone(body.bodyId, 'b1');
            system.addBone(body.bodyId, 'b2');
            // level=1, strength=30, bones=2 -> 1*100 + 30*2 + 2*30 = 220
            expect(system.calculateBodyPower(body.bodyId)).toBe(220);
        });

        it('should scale with level', () => {
            const { body } = system.forgeBody({});
            system.levelUpBody(body.bodyId);
            system.levelUpBody(body.bodyId);
            // level=3, strength=30, bones=0 -> 3*100 + 30*2 + 0*30 = 360
            expect(system.calculateBodyPower(body.bodyId)).toBe(360);
        });

        it('should scale with strength', () => {
            const { body } = system.forgeBody({});
            system.increaseStrength(body.bodyId, 50);
            // level=1, strength=80, bones=0 -> 1*100 + 80*2 + 0*30 = 260
            expect(system.calculateBodyPower(body.bodyId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBodyPower('ghost')).toBe(0);
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

        it('should execute default forgeBody', () => {
            const result = system.executeTool('forgeBody', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bodyForged', () => count++);
            unregister();
            system.forgeBody({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bodyForged', () => { throw new Error('x'); });
            expect(() => system.forgeBody({})).not.toThrow();
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
            system.forgeBody({});
            const json = system.toJSON();
            expect(json.bodies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.forgeBody({});
            const json = system.toJSON();
            const newSys = new CultivationBody();
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
