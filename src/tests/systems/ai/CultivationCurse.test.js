/**
 * CultivationCurse.test.js - 修真诅咒系统测试
 * V703 Iteration 26/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCurse } from '../../../systems/ai/CultivationCurse.js';

describe('CultivationCurse', () => {
    let system;
    beforeEach(() => { system = new CultivationCurse(); });

    describe('recruitCurse', () => {
        it('should recruit', () => {
            const { curse } = system.recruitCurse({ masterId: 'm1', name: 'VenomC', type: 'venom' });
            expect(curse.masterId).toBe('m1');
            expect(curse.name).toBe('VenomC');
            expect(curse.type).toBe('venom');
        });

        it('should default type to venom', () => {
            const { curse } = system.recruitCurse({});
            expect(curse.type).toBe('venom');
        });

        it('should default severity to base', () => {
            const { curse } = system.recruitCurse({});
            expect(curse.severity).toBe(20);
        });

        it('should default level to 1', () => {
            const { curse } = system.recruitCurse({});
            expect(curse.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { curse } = system.recruitCurse({});
            expect(curse.status).toBe('novice');
        });

        it('should trigger curseRecruited hook', () => {
            let called = false;
            system.registerHook('curseRecruited', () => { called = true; });
            system.recruitCurse({});
            expect(called).toBe(true);
        });
    });

    describe('getCurse', () => {
        it('should return', () => {
            const { curse } = system.recruitCurse({});
            expect(system.getCurse(curse.curseId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCurse('ghost')).toBeNull(); });
    });

    describe('listCurses', () => {
        it('should list all', () => {
            system.recruitCurse({});
            system.recruitCurse({});
            expect(system.listCurses().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitCurse({ masterId: 'm1' });
            system.recruitCurse({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitCurse({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { curse: c1 } = system.recruitCurse({});
            const { curse: c2 } = system.recruitCurse({});
            system.legendCurse(c2.curseId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].curseId).toBe(c2.curseId);
        });

        it('should return empty when none legendary', () => {
            system.recruitCurse({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addMark', () => {
        it('should add mark', () => {
            const { curse } = system.recruitCurse({});
            system.addMark(curse.curseId, 'mark1');
            expect(curse.marks).toContain('mark1');
        });

        it('should reject missing', () => {
            const result = system.addMark('ghost', 'm1');
            expect(result.error).toBe('CURSE_NOT_FOUND');
        });

        it('should trigger markAdded hook', () => {
            const { curse } = system.recruitCurse({});
            let called = false;
            system.registerHook('markAdded', () => { called = true; });
            system.addMark(curse.curseId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('raiseSeverity', () => {
        it('should raise severity by default amount', () => {
            const { curse } = system.recruitCurse({});
            system.raiseSeverity(curse.curseId);
            expect(curse.severity).toBe(25);
        });

        it('should raise severity by custom amount', () => {
            const { curse } = system.recruitCurse({});
            system.raiseSeverity(curse.curseId, 10);
            expect(curse.severity).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseSeverity('ghost', 5);
            expect(result.error).toBe('CURSE_NOT_FOUND');
        });

        it('should trigger severityRaised hook', () => {
            const { curse } = system.recruitCurse({});
            let called = false;
            system.registerHook('severityRaised', () => { called = true; });
            system.raiseSeverity(curse.curseId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCurse', () => {
        it('should level up', () => {
            const { curse } = system.recruitCurse({});
            system.levelUpCurse(curse.curseId);
            expect(curse.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpCurse('ghost');
            expect(result.error).toBe('CURSE_NOT_FOUND');
        });

        it('should trigger curseLeveledUp hook', () => {
            const { curse } = system.recruitCurse({});
            let called = false;
            system.registerHook('curseLeveledUp', () => { called = true; });
            system.levelUpCurse(curse.curseId);
            expect(called).toBe(true);
        });
    });

    describe('legendCurse', () => {
        it('should legendize', () => {
            const { curse } = system.recruitCurse({});
            system.legendCurse(curse.curseId);
            expect(curse.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCurse('ghost');
            expect(result.error).toBe('CURSE_NOT_FOUND');
        });

        it('should trigger curseLegendized hook', () => {
            const { curse } = system.recruitCurse({});
            let called = false;
            system.registerHook('curseLegendized', () => { called = true; });
            system.legendCurse(curse.curseId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCurseValue', () => {
        it('should calculate', () => {
            const { curse } = system.recruitCurse({ level: 3, severity: 40, marks: ['a', 'b'] });
            // 3 * 100 + 40 * 2 + 2 * 30 = 300 + 80 + 60 = 440
            expect(system.calculateCurseValue(curse.curseId)).toBe(440);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCurseValue('ghost')).toBe(0);
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
            const unregister = system.registerHook('curseRecruited', () => count++);
            unregister();
            system.recruitCurse({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('curseRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCurse({})).not.toThrow();
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
            system.recruitCurse({});
            const json = system.toJSON();
            expect(json.curses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCurse({});
            const json = system.toJSON();
            const newSys = new CultivationCurse();
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
