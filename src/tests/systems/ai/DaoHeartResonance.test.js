/**
 * DaoHeartResonance.test.js - 道心共鸣系统测试
 * V311 Iteration 8/9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DaoHeartResonance } from '../../../systems/ai/DaoHeartResonance.js';

describe('DaoHeartResonance', () => {
    let system;

    beforeEach(() => { system = new DaoHeartResonance(); });

    describe('registerDaoHeart', () => {
        it('should register heart', () => {
            const { heart } = system.registerDaoHeart({ ownerId: 'c1' });
            expect(heart.ownerId).toBe('c1');
        });

        it('should default purity to 0.5', () => {
            const { heart } = system.registerDaoHeart({});
            expect(heart.purity).toBe(0.5);
        });

        it('should generate id', () => {
            const { heart } = system.registerDaoHeart({});
            expect(heart.id).toBeDefined();
        });
    });

    describe('getDaoHeart', () => {
        it('should return heart', () => {
            const { heart } = system.registerDaoHeart({});
            expect(system.getDaoHeart(heart.id)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getDaoHeart('ghost')).toBeNull();
        });
    });

    describe('listDaoHearts', () => {
        it('should list all', () => {
            system.registerDaoHeart({});
            system.registerDaoHeart({});
            expect(system.listDaoHearts().length).toBe(2);
        });
    });

    describe('cultivateHeart', () => {
        it('should cultivate', () => {
            const { heart } = system.registerDaoHeart({});
            const result = system.cultivateHeart(heart.id, 'purity', 0.1);
            expect(heart.purity).toBe(0.6);
        });

        it('should reject missing', () => {
            const result = system.cultivateHeart('ghost', 'purity', 0.1);
            expect(result.error).toBe('HEART_NOT_FOUND');
        });

        it('should reject invalid attribute', () => {
            const { heart } = system.registerDaoHeart({});
            const result = system.cultivateHeart(heart.id, 'invalid', 0.1);
            expect(result.error).toBe('INVALID_ATTRIBUTE');
        });

        it('should clamp to 1', () => {
            const { heart } = system.registerDaoHeart({});
            system.cultivateHeart(heart.id, 'purity', 10);
            expect(heart.purity).toBe(1);
        });

        it('should clamp to 0', () => {
            const { heart } = system.registerDaoHeart({});
            system.cultivateHeart(heart.id, 'purity', -10);
            expect(heart.purity).toBe(0);
        });

        it('should record history', () => {
            const { heart } = system.registerDaoHeart({});
            system.cultivateHeart(heart.id, 'purity', 0.1);
            expect(heart.history.length).toBe(1);
        });

        it('should trigger heartCultivated hook', () => {
            const { heart } = system.registerDaoHeart({});
            let called = false;
            system.registerHook('heartCultivated', () => { called = true; });
            system.cultivateHeart(heart.id, 'purity', 0.1);
            expect(called).toBe(true);
        });
    });

    describe('calculateResonance', () => {
        it('should compute', () => {
            const { heart: a } = system.registerDaoHeart({});
            const { heart: b } = system.registerDaoHeart({});
            const result = system.calculateResonance(a.id, b.id);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const { heart: a } = system.registerDaoHeart({});
            const result = system.calculateResonance(a.id, 'ghost');
            expect(result.error).toBe('HEART_NOT_FOUND');
        });

        it('should be higher with same path', () => {
            const { heart: a } = system.registerDaoHeart({ daoPath: 'sword' });
            const { heart: b1 } = system.registerDaoHeart({ daoPath: 'sword' });
            const { heart: b2 } = system.registerDaoHeart({ daoPath: 'fire' });
            const r1 = system.calculateResonance(a.id, b1.id);
            const r2 = system.calculateResonance(a.id, b2.id);
            expect(r1.resonance).toBeGreaterThan(r2.resonance);
        });
    });

    describe('induceResonance', () => {
        it('should induce', () => {
            const { heart: a } = system.registerDaoHeart({});
            const { heart: b } = system.registerDaoHeart({});
            const result = system.induceResonance(a.id, b.id);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.induceResonance('ghost', 'b');
            expect(result.error).toBe('HEART_NOT_FOUND');
        });

        it('should increment totalResonances', () => {
            const { heart: a } = system.registerDaoHeart({});
            const { heart: b } = system.registerDaoHeart({});
            system.induceResonance(a.id, b.id);
            expect(system.stats.totalResonances).toBe(1);
        });

        it('should detect harmony at high level', () => {
            const sys = new DaoHeartResonance({ harmonyThreshold: 30 });
            const { heart: a } = sys.registerDaoHeart({ purity: 1, steadfastness: 1, wisdom: 1, compassion: 1, daoPath: 'sword' });
            const { heart: b } = sys.registerDaoHeart({ purity: 1, steadfastness: 1, wisdom: 1, compassion: 1, daoPath: 'sword' });
            sys.induceResonance(a.id, b.id);
            expect(sys.stats.totalHarmonies).toBe(1);
        });

        it('should trigger harmonyAchieved hook', () => {
            const sys = new DaoHeartResonance({ harmonyThreshold: 30 });
            const { heart: a } = sys.registerDaoHeart({ purity: 1, steadfastness: 1, wisdom: 1, compassion: 1, daoPath: 'sword' });
            const { heart: b } = sys.registerDaoHeart({ purity: 1, steadfastness: 1, wisdom: 1, compassion: 1, daoPath: 'sword' });
            let called = false;
            sys.registerHook('harmonyAchieved', () => { called = true; });
            sys.induceResonance(a.id, b.id);
            expect(called).toBe(true);
        });

        it('should trigger resonanceInduced hook', () => {
            const { heart: a } = system.registerDaoHeart({});
            const { heart: b } = system.registerDaoHeart({});
            let called = false;
            system.registerHook('resonanceInduced', () => { called = true; });
            system.induceResonance(a.id, b.id);
            expect(called).toBe(true);
        });
    });

    describe('getResonanceEvent', () => {
        it('should return event', () => {
            const { heart: a } = system.registerDaoHeart({});
            const { heart: b } = system.registerDaoHeart({});
            const { event } = system.induceResonance(a.id, b.id);
            expect(system.getResonanceEvent(event.id)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getResonanceEvent('ghost')).toBeNull();
        });
    });

    describe('listResonanceEvents', () => {
        it('should list all', () => {
            const { heart: a } = system.registerDaoHeart({});
            const { heart: b } = system.registerDaoHeart({});
            system.induceResonance(a.id, b.id);
            expect(system.listResonanceEvents().length).toBe(1);
        });

        it('should filter by min level', () => {
            const { heart: a } = system.registerDaoHeart({});
            const { heart: b } = system.registerDaoHeart({});
            system.induceResonance(a.id, b.id);
            expect(system.listResonanceEvents({ minLevel: 100 }).length).toBe(0);
        });
    });

    describe('getResonanceHistory', () => {
        it('should return history', () => {
            const { heart: a } = system.registerDaoHeart({});
            const { heart: b } = system.registerDaoHeart({});
            system.induceResonance(a.id, b.id);
            expect(system.getResonanceHistory().length).toBe(1);
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

        it('should execute default getDaoHeart', () => {
            const result = system.executeTool('getDaoHeart', { cultivatorId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default calculateResonance', () => {
            const result = system.executeTool('calculateResonance', { cultivatorA: 'x', cultivatorB: 'y' });
            expect(result.result.success).toBe(false);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('heartCultivated', () => count++);
            unregister();
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('heartCultivated', () => { throw new Error('x'); });
            const { heart } = system.registerDaoHeart({});
            expect(() => system.cultivateHeart(heart.id, 'purity', 0.1)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalResonances = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalResonances = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerDaoHeart({});
            const json = system.toJSON();
            expect(json.daoHearts.length).toBe(1);
        });

        it('should deserialize', () => {
            system.registerDaoHeart({});
            const json = system.toJSON();
            const newSys = new DaoHeartResonance();
            newSys.fromJSON(json);
            expect(newSys.daoHearts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.heartCount).toBe(0);
        });
    });
});