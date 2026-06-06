/**
 * CultivationHeart.test.js - 道心系统测试
 * V520 Iteration 2/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHeart } from '../../../systems/ai/CultivationHeart.js';

describe('CultivationHeart', () => {
    let system;
    beforeEach(() => { system = new CultivationHeart(); });

    describe('awakenHeart', () => {
        it('should awaken', () => {
            const { heart } = system.awakenHeart({ cultivatorId: 'c1' });
            expect(heart.cultivatorId).toBe('c1');
        });

        it('should default status to awakened', () => {
            const { heart } = system.awakenHeart({});
            expect(heart.status).toBe('awakened');
        });

        it('should default purity to basePurity', () => {
            const { heart } = system.awakenHeart({});
            expect(heart.purity).toBe(30);
        });

        it('should default level to 1', () => {
            const { heart } = system.awakenHeart({});
            expect(heart.level).toBe(1);
        });

        it('should trigger heartAwakened hook', () => {
            let called = false;
            system.registerHook('heartAwakened', () => { called = true; });
            system.awakenHeart({});
            expect(called).toBe(true);
        });
    });

    describe('getHeart', () => {
        it('should return', () => {
            const { heart } = system.awakenHeart({});
            expect(system.getHeart(heart.heartId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHeart('ghost')).toBeNull(); });
    });

    describe('listHearts', () => {
        it('should list all', () => {
            system.awakenHeart({});
            expect(system.listHearts().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.awakenHeart({ cultivatorId: 'c1' });
            system.awakenHeart({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listAwakened', () => {
        it('should filter awakened/transcendent', () => {
            const { heart: h1 } = system.awakenHeart({});
            const { heart: h2 } = system.awakenHeart({});
            h2.status = 'unstable';
            system.listAwakened();
            expect(system.listAwakened().length).toBe(1);
            system.transcendHeart(h1.heartId);
            expect(system.listAwakened().length).toBe(1);
        });
    });

    describe('addDao', () => {
        it('should add dao', () => {
            const { heart } = system.awakenHeart({});
            system.addDao(heart.heartId, '剑道');
            expect(heart.dao).toContain('剑道');
        });

        it('should not add duplicate', () => {
            const { heart } = system.awakenHeart({});
            system.addDao(heart.heartId, '剑道');
            system.addDao(heart.heartId, '剑道');
            expect(heart.dao.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addDao('ghost', '剑道');
            expect(result.error).toBe('HEART_NOT_FOUND');
        });

        it('should trigger daoAdded hook', () => {
            const { heart } = system.awakenHeart({});
            let called = false;
            system.registerHook('daoAdded', () => { called = true; });
            system.addDao(heart.heartId, '剑道');
            expect(called).toBe(true);
        });
    });

    describe('increasePurity', () => {
        it('should increase purity', () => {
            const { heart } = system.awakenHeart({});
            system.increasePurity(heart.heartId, 10);
            expect(heart.purity).toBe(40);
        });

        it('should default amount to 5', () => {
            const { heart } = system.awakenHeart({});
            system.increasePurity(heart.heartId);
            expect(heart.purity).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.increasePurity('ghost', 10);
            expect(result.error).toBe('HEART_NOT_FOUND');
        });

        it('should trigger purityIncreased hook', () => {
            const { heart } = system.awakenHeart({});
            let called = false;
            system.registerHook('purityIncreased', () => { called = true; });
            system.increasePurity(heart.heartId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHeart', () => {
        it('should level up', () => {
            const { heart } = system.awakenHeart({});
            system.levelUpHeart(heart.heartId);
            expect(heart.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpHeart('ghost');
            expect(result.error).toBe('HEART_NOT_FOUND');
        });

        it('should trigger heartLeveledUp hook', () => {
            const { heart } = system.awakenHeart({});
            let called = false;
            system.registerHook('heartLeveledUp', () => { called = true; });
            system.levelUpHeart(heart.heartId);
            expect(called).toBe(true);
        });
    });

    describe('transcendHeart', () => {
        it('should set status to transcendent', () => {
            const { heart } = system.awakenHeart({});
            system.transcendHeart(heart.heartId);
            expect(heart.status).toBe('transcendent');
        });

        it('should reject missing', () => {
            const result = system.transcendHeart('ghost');
            expect(result.error).toBe('HEART_NOT_FOUND');
        });

        it('should trigger heartTranscended hook', () => {
            const { heart } = system.awakenHeart({});
            let called = false;
            system.registerHook('heartTranscended', () => { called = true; });
            system.transcendHeart(heart.heartId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHeartPower', () => {
        it('should calculate', () => {
            const { heart } = system.awakenHeart({});
            system.addDao(heart.heartId, '剑道');
            // level=1, purity=30, dao.length=1 => 1*100 + 30*2 + 1*50 = 210
            expect(system.calculateHeartPower(heart.heartId)).toBe(210);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHeartPower('ghost')).toBe(0);
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

        it('should execute default getHeart', () => {
            const result = system.executeTool('getHeart', { heartId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default awakenHeart', () => {
            const result = system.executeTool('awakenHeart', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });

        it('should handle undefined context', () => {
            system.registerTool('test', () => 'ok');
            const result = system.executeTool('test');
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('heartAwakened', () => count++);
            unregister();
            system.awakenHeart({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('heartAwakened', () => { throw new Error('x'); });
            expect(() => system.awakenHeart({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHearts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHearts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.awakenHeart({});
            const json = system.toJSON();
            expect(json.hearts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.awakenHeart({});
            const json = system.toJSON();
            const newSys = new CultivationHeart();
            newSys.fromJSON(json);
            expect(newSys.hearts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.heartCount).toBe(0);
        });
    });
});
