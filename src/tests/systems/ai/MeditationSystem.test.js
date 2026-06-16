/**
 * MeditationSystem.test.js - 冥想系统测试
 * V347 Iteration 8/9 Round 7 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MeditationSystem } from '../../../systems/ai/MeditationSystem.js';

describe('MeditationSystem', () => {
    let system;
    beforeEach(() => { system = new MeditationSystem(); });

    describe('Default Postures', () => {
        it('should have postures', () => { expect(system.postures.size).toBe(3); });
        it('should contain lotus', () => { expect(system.getPosture('lotus')).not.toBeNull(); });
    });

    describe('getPosture', () => {
        it('should return', () => { expect(system.getPosture('lotus')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getPosture('ghost')).toBeNull(); });
    });

    describe('listPostures', () => {
        it('should list all', () => { expect(system.listPostures().length).toBe(3); });
    });

    describe('registerCultivator', () => {
        it('should register', () => {
            const { cultivator } = system.registerCultivator({ name: 'C1' });
            expect(cultivator.name).toBe('C1');
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

    describe('startSession', () => {
        it('should start', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.startSession(cultivator.cultivatorId, 'lotus');
            expect(result.success).toBe(true);
        });

        it('should reject missing cultivator', () => {
            const result = system.startSession('ghost', 'lotus');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject missing posture', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.startSession(cultivator.cultivatorId, 'ghost');
            expect(result.error).toBe('POSTURE_NOT_FOUND');
        });

        it('should trigger sessionStarted hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('sessionStarted', () => { called = true; });
            system.startSession(cultivator.cultivatorId, 'lotus');
            expect(called).toBe(true);
        });
    });

    describe('advanceSession', () => {
        it('should advance', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'lotus');
            const result = system.advanceSession(session.sessionId, 20);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.advanceSession('ghost', 20);
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'lotus');
            session.status = 'completed';
            const result = system.advanceSession(session.sessionId, 20);
            expect(result.error).toBe('SESSION_INACTIVE');
        });
    });

    describe('completeSession', () => {
        it('should complete', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'lotus');
            session.progress = 100;
            const result = system.completeSession(session.sessionId);
            expect(result.success).toBe(true);
        });

        it('should grant exp', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'lotus');
            session.progress = 100;
            system.completeSession(session.sessionId);
            expect(cultivator.exp).toBeGreaterThan(0);
        });

        it('should trigger sessionCompleted hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'lotus');
            session.progress = 100;
            let called = false;
            system.registerHook('sessionCompleted', () => { called = true; });
            system.completeSession(session.sessionId);
            expect(called).toBe(true);
        });

        it('should trigger levelUp on level threshold', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'lotus');
            session.progress = 100;
            let called = false;
            system.registerHook('levelUp', () => { called = true; });
            cultivator.exp = 100;
            system.completeSession(session.sessionId);
            expect(called).toBe(true);
        });
    });

    describe('interruptSession', () => {
        it('should interrupt', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'lotus');
            const result = system.interruptSession(session.sessionId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.interruptSession('ghost');
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should trigger sessionInterrupted hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'lotus');
            let called = false;
            system.registerHook('sessionInterrupted', () => { called = true; });
            system.interruptSession(session.sessionId);
            expect(called).toBe(true);
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

        it('should execute default getCultivator', () => {
            const result = system.executeTool('getCultivator', { cultivatorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sessionStarted', () => count++);
            unregister();
            const { cultivator } = system.registerCultivator({});
            system.startSession(cultivator.cultivatorId, 'lotus');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sessionStarted', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.startSession(cultivator.cultivatorId, 'lotus')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSessions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSessions = 10;
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
            const newSys = new MeditationSystem();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultivatorCount).toBe(0);
        });
    });
});