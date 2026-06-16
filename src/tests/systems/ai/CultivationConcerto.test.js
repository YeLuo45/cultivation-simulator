/**
 * CultivationConcerto.test.js - 修真协奏系统测试
 * V796 Iteration 29/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationConcerto } from '../../../systems/ai/CultivationConcerto.js';

describe('CultivationConcerto', () => {
    let system;
    beforeEach(() => { system = new CultivationConcerto(); });

    describe('recruitConcerto', () => {
        it('should recruit', () => {
            const { concerto } = system.recruitConcerto({ masterId: 'm1', name: 'Grand Concerto', type: 'cosmic' });
            expect(concerto.masterId).toBe('m1');
            expect(concerto.name).toBe('Grand Concerto');
            expect(concerto.type).toBe('cosmic');
        });

        it('should default type to grand', () => {
            const { concerto } = system.recruitConcerto({});
            expect(concerto.type).toBe('grand');
        });

        it('should default status to novice', () => {
            const { concerto } = system.recruitConcerto({});
            expect(concerto.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { concerto } = system.recruitConcerto({});
            expect(concerto.level).toBe(1);
        });

        it('should default solos to empty array', () => {
            const { concerto } = system.recruitConcerto({});
            expect(concerto.solos).toEqual([]);
        });

        it('should default brilliance to baseBrilliance', () => {
            const { concerto } = system.recruitConcerto({});
            expect(concerto.brilliance).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { concerto } = system.recruitConcerto({});
            expect(concerto.concertoId).toMatch(/^concerto_/);
        });

        it('should use provided concertoId', () => {
            const { concerto } = system.recruitConcerto({ concertoId: 'c_explicit' });
            expect(concerto.concertoId).toBe('c_explicit');
        });

        it('should trigger concertoRecruited hook', () => {
            let called = false;
            system.registerHook('concertoRecruited', () => { called = true; });
            system.recruitConcerto({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseBrilliance', () => {
            const customSystem = new CultivationConcerto({ baseBrilliance: 50 });
            const { concerto } = customSystem.recruitConcerto({});
            expect(concerto.brilliance).toBe(50);
        });
    });

    describe('getConcerto', () => {
        it('should return', () => {
            const { concerto } = system.recruitConcerto({});
            expect(system.getConcerto(concerto.concertoId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getConcerto('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { concerto } = system.recruitConcerto({ name: 'Original' });
            const fetched = system.getConcerto(concerto.concertoId);
            fetched.name = 'Mutated';
            const refetched = system.getConcerto(concerto.concertoId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listConcertos', () => {
        it('should list all', () => {
            system.recruitConcerto({});
            system.recruitConcerto({});
            expect(system.listConcertos().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listConcertos().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitConcerto({ masterId: 'm1' });
            system.recruitConcerto({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitConcerto({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { concerto: a } = system.recruitConcerto({});
            const { concerto: b } = system.recruitConcerto({});
            system.legendConcerto(a.concertoId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.concertoId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitConcerto({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addSolo', () => {
        it('should add solo', () => {
            const { concerto } = system.recruitConcerto({});
            system.addSolo(concerto.concertoId, 'overture');
            expect(concerto.solos).toContain('overture');
        });

        it('should add multiple solos', () => {
            const { concerto } = system.recruitConcerto({});
            system.addSolo(concerto.concertoId, 'overture');
            system.addSolo(concerto.concertoId, 'crescendo');
            expect(concerto.solos.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSolo('ghost', 'overture');
            expect(result.error).toBe('CONCERTO_NOT_FOUND');
        });

        it('should trigger soloAdded hook', () => {
            const { concerto } = system.recruitConcerto({});
            let called = false;
            system.registerHook('soloAdded', () => { called = true; });
            system.addSolo(concerto.concertoId, 'overture');
            expect(called).toBe(true);
        });
    });

    describe('raiseBrilliance', () => {
        it('should raise brilliance', () => {
            const { concerto } = system.recruitConcerto({});
            system.raiseBrilliance(concerto.concertoId, 10);
            expect(concerto.brilliance).toBe(30);
        });

        it('should default amount to 5', () => {
            const { concerto } = system.recruitConcerto({});
            system.raiseBrilliance(concerto.concertoId);
            expect(concerto.brilliance).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseBrilliance('ghost', 10);
            expect(result.error).toBe('CONCERTO_NOT_FOUND');
        });

        it('should trigger brillianceRaised hook', () => {
            const { concerto } = system.recruitConcerto({});
            let called = false;
            system.registerHook('brillianceRaised', () => { called = true; });
            system.raiseBrilliance(concerto.concertoId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpConcerto', () => {
        it('should increment level', () => {
            const { concerto } = system.recruitConcerto({});
            system.levelUpConcerto(concerto.concertoId);
            expect(concerto.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { concerto } = system.recruitConcerto({});
            system.levelUpConcerto(concerto.concertoId);
            system.levelUpConcerto(concerto.concertoId);
            system.levelUpConcerto(concerto.concertoId);
            expect(concerto.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpConcerto('ghost');
            expect(result.error).toBe('CONCERTO_NOT_FOUND');
        });
    });

    describe('legendConcerto', () => {
        it('should set status to legendary', () => {
            const { concerto } = system.recruitConcerto({});
            system.legendConcerto(concerto.concertoId);
            expect(concerto.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendConcerto('ghost');
            expect(result.error).toBe('CONCERTO_NOT_FOUND');
        });

        it('should trigger concertoLegendized hook', () => {
            const { concerto } = system.recruitConcerto({});
            let called = false;
            system.registerHook('concertoLegendized', () => { called = true; });
            system.legendConcerto(concerto.concertoId);
            expect(called).toBe(true);
        });
    });

    describe('calculateConcertoValue', () => {
        it('should calculate', () => {
            const { concerto } = system.recruitConcerto({});
            system.addSolo(concerto.concertoId, 'overture');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateConcertoValue(concerto.concertoId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { concerto } = system.recruitConcerto({});
            system.levelUpConcerto(concerto.concertoId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateConcertoValue(concerto.concertoId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after brilliance raise', () => {
            const { concerto } = system.recruitConcerto({});
            system.raiseBrilliance(concerto.concertoId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateConcertoValue(concerto.concertoId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateConcertoValue('ghost')).toBe(0);
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

        it('should execute default getConcerto', () => {
            const result = system.executeTool('getConcerto', { concertoId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context with default', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('concertoRecruited', () => count++);
            unregister();
            system.recruitConcerto({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('concertoRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitConcerto({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalConcertos = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalConcertos = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitConcerto({});
            const json = system.toJSON();
            expect(json.concertos.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitConcerto({});
            const json = system.toJSON();
            const newSys = new CultivationConcerto();
            newSys.fromJSON(json);
            expect(newSys.concertos.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitConcerto({});
            const stats = system.getStats();
            expect(stats.concertoCount).toBe(1);
        });
    });
});
