/**
 * CultivationDreamKarmicEcho.test.js - 修真因果回响测试
 * V870 Iteration 4/30 Round 34 - 测试覆盖率目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDreamKarmicEcho, KARMIC_ACTIONS, ECHO_STRENGTH_LEVELS, AMPLIFICATION_RATES } from '../../../systems/ai/CultivationDreamKarmicEcho.js';

describe('CultivationDreamKarmicEcho', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamKarmicEcho(); });

    describe('exports', () => {
        it('should export constants', () => {
            expect(KARMIC_ACTIONS.length).toBe(4);
            expect(ECHO_STRENGTH_LEVELS.length).toBe(5);
            expect(AMPLIFICATION_RATES.length).toBe(5);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const s = new CultivationDreamKarmicEcho({ maxKarma: 10, baseEcho: 0.2, maxAmplify: 3 });
            expect(s.config.maxKarma).toBe(10);
        });
    });

    describe('recordKarma', () => {
        it('should record', () => {
            const { karma } = system.recordKarma('d1', 'mercy');
            expect(karma.dreamId).toBe('d1');
            expect(karma.karmicAction).toBe('mercy');
            expect(karma.rippleCount).toBe(1);
        });
        it('should reject invalid action', () => {
            expect(system.recordKarma('d', 'invalid').error).toBe('INVALID_ACTION');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('karmaRecorded', () => { called = true; });
            system.recordKarma('d', 'greed');
            expect(called).toBe(true);
        });
        it('should support all actions', () => {
            for (const a of KARMIC_ACTIONS) {
                expect(system.recordKarma('d', a).success).toBe(true);
            }
        });
    });

    describe('traceEcho', () => {
        it('should trace', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            const r = system.traceEcho(karma.id);
            expect(r.trace.action).toBe('mercy');
            expect(r.trace.ripples.length).toBeGreaterThan(0);
        });
        it('should reject missing', () => {
            expect(system.traceEcho('ghost').error).toBe('KARMA_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            let called = false;
            system.registerHook('echoTraced', () => { called = true; });
            system.traceEcho(karma.id);
            expect(called).toBe(true);
        });
    });

    describe('amplifyEcho', () => {
        it('should amplify', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            const r = system.amplifyEcho(karma.id, 1);
            expect(r.echoStrength).toBeGreaterThan(0.1);
        });
        it('should reject missing', () => {
            expect(system.amplifyEcho('ghost', 1).error).toBe('KARMA_NOT_FOUND');
        });
        it('should clamp intensity', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            system.amplifyEcho(karma.id, 100);
            expect(karma.amplified).toBe(true);
        });
        it('should trigger hook', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            let called = false;
            system.registerHook('echoAmplified', () => { called = true; });
            system.amplifyEcho(karma.id, 1);
            expect(called).toBe(true);
        });
        it('should cap strength', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            for (let i = 0; i < 50; i++) system.amplifyEcho(karma.id, 5);
            expect(karma.echoStrength).toBe(1);
        });
    });

    describe('list methods', () => {
        it('listKarma', () => {
            system.recordKarma('d', 'mercy');
            expect(system.listKarma().length).toBe(1);
        });
        it('listByAction', () => {
            system.recordKarma('d', 'mercy');
            system.recordKarma('d', 'greed');
            expect(system.listByAction('mercy').length).toBe(1);
        });
        it('listByDream', () => {
            system.recordKarma('d1', 'mercy');
            expect(system.listByDream('d1').length).toBe(1);
        });
        it('listAmplified', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            system.amplifyEcho(karma.id, 1);
            expect(system.listAmplified().length).toBe(1);
        });
    });

    describe('getStrengthLevel', () => {
        it('should map', () => {
            expect(system.getStrengthLevel(0.1)).toBe(ECHO_STRENGTH_LEVELS[0]);
            expect(system.getStrengthLevel(0.9)).toBe(ECHO_STRENGTH_LEVELS[ECHO_STRENGTH_LEVELS.length - 1]);
        });
        it('should handle non-number', () => {
            expect(system.getStrengthLevel(null)).toBe(ECHO_STRENGTH_LEVELS[0]);
        });
    });

    describe('addRipple', () => {
        it('should add', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            const r = system.addRipple(karma.id, 3);
            expect(r.rippleCount).toBe(4);
        });
        it('should reject missing', () => {
            expect(system.addRipple('ghost').error).toBe('KARMA_NOT_FOUND');
        });
        it('should not go below 1', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            system.addRipple(karma.id, -10);
            expect(karma.rippleCount).toBe(1);
        });
    });

    describe('deleteKarma', () => {
        it('should delete', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            expect(system.deleteKarma(karma.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteKarma('ghost').error).toBe('KARMA_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            let called = false;
            system.registerHook('karmaDeleted', () => { called = true; });
            system.deleteKarma(karma.id);
            expect(called).toBe(true);
        });
    });

    describe('tools and hooks', () => {
        it('should execute default tool', () => {
            const { karma } = system.recordKarma('d', 'mercy');
            const r = system.executeTool('getKarma', { karmaId: karma.id });
            expect(r.success).toBe(true);
        });
        it('should handle missing tool', () => {
            expect(system.executeTool('ghost').error).toBe('TOOL_NOT_FOUND');
        });
        it('should handle exception', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            expect(system.executeTool('bad').error).toBe('x');
        });
        it('should handle missing context for default tool', () => {
            const r = system.executeTool('getKarma');
            expect(r.success).toBe(true);
            expect(r.result).toBeNull();
        });
        it('should list tools', () => {
            expect(system.listTools().length).toBe(2);
        });
        it('should unregister hook', () => {
            let count = 0;
            const off = system.registerHook('karmaRecorded', () => { count++; });
            system.recordKarma('d', 'mercy');
            off();
            system.recordKarma('d', 'mercy');
            expect(count).toBe(1);
        });
        it('should catch handler errors', () => {
            system.registerHook('karmaRecorded', () => { throw new Error('x'); });
            expect(() => system.recordKarma('d', 'mercy')).not.toThrow();
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should round trip', () => {
            system.recordKarma('d', 'mercy');
            const json = system.toJSON();
            const s2 = new CultivationDreamKarmicEcho();
            expect(s2.fromJSON(json).success).toBe(true);
        });
        it('should handle empty fromJSON', () => {
            const s2 = new CultivationDreamKarmicEcho();
            expect(s2.fromJSON({}).success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recordKarma('d', 'mercy');
            const stats = system.getStats();
            expect(stats.totalRecorded).toBe(1);
            expect(stats.karmaCount).toBe(1);
        });
    });
});
