/**
 * ElementalCultivation.test.js - 元素修炼测试
 * V361 Iteration 4/9 Round 9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElementalCultivation } from '../../../systems/ai/ElementalCultivation.js';

describe('ElementalCultivation', () => {
    let system;
    beforeEach(() => { system = new ElementalCultivation(); });

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

    describe('startSession', () => {
        it('should start', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.startSession(cultivator.cultivatorId, 'fire');
            expect(result.success).toBe(true);
        });

        it('should reject missing cultivator', () => {
            const result = system.startSession('ghost', 'fire');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject invalid element', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.startSession(cultivator.cultivatorId, 'ghost');
            expect(result.error).toBe('INVALID_ELEMENT');
        });

        it('should trigger sessionStarted hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('sessionStarted', () => { called = true; });
            system.startSession(cultivator.cultivatorId, 'fire');
            expect(called).toBe(true);
        });
    });

    describe('advanceSession', () => {
        it('should advance', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'fire');
            const result = system.advanceSession(session.sessionId, 20);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.advanceSession('ghost', 20);
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'fire');
            session.status = 'completed';
            const result = system.advanceSession(session.sessionId, 20);
            expect(result.error).toBe('SESSION_INACTIVE');
        });
    });

    describe('completeSession', () => {
        it('should complete', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'fire');
            session.progress = 100;
            const result = system.completeSession(session.sessionId);
            expect(result.success).toBe(true);
        });

        it('should grant exp', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'fire');
            session.progress = 100;
            system.completeSession(session.sessionId);
            expect(cultivator.exp).toBeGreaterThan(0);
        });

        it('should set element', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'fire');
            session.progress = 100;
            system.completeSession(session.sessionId);
            expect(cultivator.element).toBe('fire');
        });

        it('should trigger sessionCompleted hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'fire');
            session.progress = 100;
            let called = false;
            system.registerHook('sessionCompleted', () => { called = true; });
            system.completeSession(session.sessionId);
            expect(called).toBe(true);
        });

        it('should trigger levelUp', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'fire');
            session.progress = 100;
            cultivator.exp = 100;
            let called = false;
            system.registerHook('levelUp', () => { called = true; });
            system.completeSession(session.sessionId);
            expect(called).toBe(true);
        });
    });

    describe('interruptSession', () => {
        it('should interrupt', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'fire');
            const result = system.interruptSession(session.sessionId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.interruptSession('ghost');
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should trigger sessionInterrupted hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startSession(cultivator.cultivatorId, 'fire');
            let called = false;
            system.registerHook('sessionInterrupted', () => { called = true; });
            system.interruptSession(session.sessionId);
            expect(called).toBe(true);
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            c1.element = 'fire';
            c2.element = 'water';
            expect(system.listByElement('fire').length).toBe(1);
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
            system.startSession(cultivator.cultivatorId, 'fire');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sessionStarted', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.startSession(cultivator.cultivatorId, 'fire')).not.toThrow();
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
            const newSys = new ElementalCultivation();
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