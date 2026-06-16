/**
 * CultivationDance.test.js - 修真舞测试
 * V561 Iteration 4/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDance } from '../../../systems/ai/CultivationDance.js';

describe('CultivationDance', () => {
    let system;
    beforeEach(() => { system = new CultivationDance(); });

    describe('learnDance', () => {
        it('should learn', () => {
            const { dance } = system.learnDance({ dancerId: 'd1', name: 'Azure Petals', type: 'fan' });
            expect(dance.dancerId).toBe('d1');
            expect(dance.name).toBe('Azure Petals');
            expect(dance.type).toBe('fan');
        });

        it('should trigger danceLearned hook', () => {
            let called = false;
            system.registerHook('danceLearned', () => { called = true; });
            system.learnDance({});
            expect(called).toBe(true);
        });

        it('should set default status to learning', () => {
            const { dance } = system.learnDance({});
            expect(dance.status).toBe('learning');
        });

        it('should set default grace to baseGrace', () => {
            const { dance } = system.learnDance({});
            expect(dance.grace).toBe(20);
        });

        it('should set default type to sword', () => {
            const { dance } = system.learnDance({});
            expect(dance.type).toBe('sword');
        });

        it('should set default moves to empty array', () => {
            const { dance } = system.learnDance({});
            expect(dance.moves).toEqual([]);
        });
    });

    describe('getDance', () => {
        it('should return', () => {
            const { dance } = system.learnDance({});
            expect(system.getDance(dance.danceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDance('ghost')).toBeNull(); });
    });

    describe('listDances', () => {
        it('should list all', () => {
            system.learnDance({});
            system.learnDance({});
            expect(system.listDances().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listDances().length).toBe(0);
        });
    });

    describe('listByDancer', () => {
        it('should filter', () => {
            system.learnDance({ dancerId: 'd1' });
            system.learnDance({ dancerId: 'd2' });
            expect(system.listByDancer('d1').length).toBe(1);
        });
    });

    describe('listDivine', () => {
        it('should filter divine', () => {
            const { dance } = system.learnDance({});
            system.divineDance(dance.danceId);
            system.learnDance({});
            expect(system.listDivine().length).toBe(1);
        });

        it('should return empty when none divine', () => {
            system.learnDance({});
            expect(system.listDivine().length).toBe(0);
        });
    });

    describe('addMove', () => {
        it('should add move', () => {
            const { dance } = system.learnDance({});
            system.addMove(dance.danceId, 'spinning-leap');
            expect(dance.moves.length).toBe(1);
            expect(dance.moves[0]).toBe('spinning-leap');
        });

        it('should add multiple moves', () => {
            const { dance } = system.learnDance({});
            system.addMove(dance.danceId, 'spinning-leap');
            system.addMove(dance.danceId, 'ribbon-flick');
            expect(dance.moves.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addMove('ghost', 'spinning-leap');
            expect(result.error).toBe('DANCE_NOT_FOUND');
        });

        it('should trigger moveAdded hook', () => {
            const { dance } = system.learnDance({});
            let called = false;
            system.registerHook('moveAdded', () => { called = true; });
            system.addMove(dance.danceId, 'spinning-leap');
            expect(called).toBe(true);
        });
    });

    describe('increaseGrace', () => {
        it('should increase grace by default', () => {
            const { dance } = system.learnDance({});
            system.increaseGrace(dance.danceId);
            expect(dance.grace).toBe(25);
        });

        it('should increase grace by amount', () => {
            const { dance } = system.learnDance({});
            system.increaseGrace(dance.danceId, 10);
            expect(dance.grace).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.increaseGrace('ghost', 10);
            expect(result.error).toBe('DANCE_NOT_FOUND');
        });

        it('should trigger graceIncreased hook', () => {
            const { dance } = system.learnDance({});
            let called = false;
            system.registerHook('graceIncreased', () => { called = true; });
            system.increaseGrace(dance.danceId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDance', () => {
        it('should level up', () => {
            const { dance } = system.learnDance({});
            system.levelUpDance(dance.danceId);
            expect(dance.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDance('ghost');
            expect(result.error).toBe('DANCE_NOT_FOUND');
        });

        it('should trigger danceLeveledUp hook', () => {
            const { dance } = system.learnDance({});
            let called = false;
            system.registerHook('danceLeveledUp', () => { called = true; });
            system.levelUpDance(dance.danceId);
            expect(called).toBe(true);
        });
    });

    describe('divineDance', () => {
        it('should mark as divine', () => {
            const { dance } = system.learnDance({});
            system.divineDance(dance.danceId);
            expect(dance.status).toBe('divine');
        });

        it('should reject missing', () => {
            const result = system.divineDance('ghost');
            expect(result.error).toBe('DANCE_NOT_FOUND');
        });

        it('should trigger danceDivinified hook', () => {
            const { dance } = system.learnDance({});
            let called = false;
            system.registerHook('danceDivinified', () => { called = true; });
            system.divineDance(dance.danceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDanceValue', () => {
        it('should calculate', () => {
            const { dance } = system.learnDance({});
            // level=1, grace=20, moves=0: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateDanceValue(dance.danceId)).toBe(140);
        });

        it('should calculate with moves', () => {
            const { dance } = system.learnDance({});
            system.addMove(dance.danceId, 'spinning-leap');
            system.addMove(dance.danceId, 'ribbon-flick');
            // level=1, grace=20, moves=2: 100 + 40 + 60 = 200
            expect(system.calculateDanceValue(dance.danceId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDanceValue('ghost')).toBe(0);
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

        it('should execute default getDance', () => {
            const result = system.executeTool('getDance', { danceId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('danceLearned', () => count++);
            unregister();
            system.learnDance({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('danceLearned', () => { throw new Error('x'); });
            expect(() => system.learnDance({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDances = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDances = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.learnDance({});
            const json = system.toJSON();
            expect(json.dances.length).toBe(1);
        });
        it('should deserialize', () => {
            system.learnDance({});
            const json = system.toJSON();
            const newSys = new CultivationDance();
            newSys.fromJSON(json);
            expect(newSys.dances.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.danceCount).toBe(0);
        });
    });
});
