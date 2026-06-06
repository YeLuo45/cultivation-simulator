/**
 * CurseBreaking.test.js - 破咒系统测试
 * V457 Iteration 4/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CurseBreaking } from '../../../systems/ai/CurseBreaking.js';

describe('CurseBreaking', () => {
    let system;
    beforeEach(() => { system = new CurseBreaking(); });

    describe('detectCurse', () => {
        it('should detect', () => {
            const { curse } = system.detectCurse({ breakerId: 'b1', name: 'BloodC', type: 'blood' });
            expect(curse.breakerId).toBe('b1');
            expect(curse.name).toBe('BloodC');
            expect(curse.type).toBe('blood');
        });

        it('should default type to blood', () => {
            const { curse } = system.detectCurse({});
            expect(curse.type).toBe('blood');
        });

        it('should trigger curseDetected hook', () => {
            let called = false;
            system.registerHook('curseDetected', () => { called = true; });
            system.detectCurse({});
            expect(called).toBe(true);
        });
    });

    describe('getCurse', () => {
        it('should return', () => {
            const { curse } = system.detectCurse({});
            expect(system.getCurse(curse.curseId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCurse('ghost')).toBeNull(); });
    });

    describe('listCurses', () => {
        it('should list all', () => {
            system.detectCurse({});
            system.detectCurse({});
            expect(system.listCurses().length).toBe(2);
        });
    });

    describe('listByBreaker', () => {
        it('should filter', () => {
            system.detectCurse({ breakerId: 'b1' });
            system.detectCurse({ breakerId: 'b2' });
            expect(system.listByBreaker('b1').length).toBe(1);
        });

        it('should return empty for unknown breaker', () => {
            system.detectCurse({ breakerId: 'b1' });
            expect(system.listByBreaker('ghost').length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter blood', () => {
            system.detectCurse({ type: 'blood' });
            system.detectCurse({ type: 'death' });
            expect(system.listByType('blood').length).toBe(1);
        });

        it('should filter death', () => {
            system.detectCurse({ type: 'blood' });
            system.detectCurse({ type: 'death' });
            expect(system.listByType('death').length).toBe(1);
        });
    });

    describe('weakenCurse', () => {
        it('should weaken', () => {
            const { curse } = system.detectCurse({ intensity: 50 });
            system.weakenCurse(curse.curseId, 10);
            expect(curse.intensity).toBe(40);
            expect(curse.status).toBe('weakened');
        });

        it('should reject missing', () => {
            const result = system.weakenCurse('ghost', 10);
            expect(result.error).toBe('CURSE_NOT_FOUND');
        });

        it('should trigger curseWeakened hook', () => {
            const { curse } = system.detectCurse({});
            let called = false;
            system.registerHook('curseWeakened', () => { called = true; });
            system.weakenCurse(curse.curseId, 5);
            expect(called).toBe(true);
        });
    });

    describe('shortenCurse', () => {
        it('should shorten', () => {
            const { curse } = system.detectCurse({ duration: 100 });
            system.shortenCurse(curse.curseId, 30);
            expect(curse.duration).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.shortenCurse('ghost', 10);
            expect(result.error).toBe('CURSE_NOT_FOUND');
        });

        it('should trigger curseShortened hook', () => {
            const { curse } = system.detectCurse({});
            let called = false;
            system.registerHook('curseShortened', () => { called = true; });
            system.shortenCurse(curse.curseId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addVictim', () => {
        it('should add victim', () => {
            const { curse } = system.detectCurse({});
            system.addVictim(curse.curseId, 'v1');
            expect(curse.victims).toContain('v1');
        });

        it('should reject missing', () => {
            const result = system.addVictim('ghost', 'v1');
            expect(result.error).toBe('CURSE_NOT_FOUND');
        });
    });

    describe('removeCurse', () => {
        it('should remove', () => {
            const { curse } = system.detectCurse({});
            system.removeCurse(curse.curseId);
            expect(curse.status).toBe('removed');
        });

        it('should reject missing', () => {
            const result = system.removeCurse('ghost');
            expect(result.error).toBe('CURSE_NOT_FOUND');
        });

        it('should trigger curseRemoved hook', () => {
            const { curse } = system.detectCurse({});
            let called = false;
            system.registerHook('curseRemoved', () => { called = true; });
            system.removeCurse(curse.curseId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCurseSeverity', () => {
        it('should calculate', () => {
            const { curse } = system.detectCurse({ intensity: 50, duration: 100, victims: ['a', 'b'] });
            // 50 * (1 + 100/100) + 2 * 5 = 100 + 10 = 110
            expect(system.calculateCurseSeverity(curse.curseId)).toBe(110);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCurseSeverity('ghost')).toBe(0);
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

        it('should execute default getCurse', () => {
            const result = system.executeTool('getCurse', { curseId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('curseDetected', () => count++);
            unregister();
            system.detectCurse({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('curseDetected', () => { throw new Error('x'); });
            expect(() => system.detectCurse({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCurses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCurses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.detectCurse({});
            const json = system.toJSON();
            expect(json.curses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.detectCurse({});
            const json = system.toJSON();
            const newSys = new CurseBreaking();
            newSys.fromJSON(json);
            expect(newSys.curses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.curseCount).toBe(0);
        });
    });
});
