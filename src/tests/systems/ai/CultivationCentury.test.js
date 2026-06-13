/**
 * CultivationCentury.test.js - 修真世纪系统测试
 * V826 Iteration 29/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCentury } from '../../../systems/ai/CultivationCentury.js';

describe('CultivationCentury', () => {
    let system;
    beforeEach(() => { system = new CultivationCentury(); });

    describe('recruitCentury', () => {
        it('should recruit', () => {
            const { century } = system.recruitCentury({ masterId: 'm1', name: 'Stone Age', type: 'ancient' });
            expect(century.masterId).toBe('m1');
            expect(century.name).toBe('Stone Age');
            expect(century.type).toBe('ancient');
        });

        it('should default to ancient type', () => {
            const { century } = system.recruitCentury({ masterId: 'm1' });
            expect(century.type).toBe('ancient');
        });

        it('should set base depth from config', () => {
            const { century } = system.recruitCentury({ masterId: 'm1' });
            expect(century.depth).toBe(20);
        });

        it('should initialize as novice', () => {
            const { century } = system.recruitCentury({ masterId: 'm1' });
            expect(century.status).toBe('novice');
        });

        it('should trigger centuryRecruited hook', () => {
            let called = false;
            system.registerHook('centuryRecruited', () => { called = true; });
            system.recruitCentury({});
            expect(called).toBe(true);
        });
    });

    describe('getCentury', () => {
        it('should return', () => {
            const { century } = system.recruitCentury({});
            expect(system.getCentury(century.centuryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCentury('ghost')).toBeNull(); });
    });

    describe('listCenturies', () => {
        it('should list all', () => {
            system.recruitCentury({});
            system.recruitCentury({});
            expect(system.listCenturies().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitCentury({ masterId: 'm1' });
            system.recruitCentury({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const a = system.recruitCentury({}).century;
            const b = system.recruitCentury({}).century;
            system.legendCentury(a.centuryId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.status).toBe('novice');
        });
    });

    describe('addDecade', () => {
        it('should add decade', () => {
            const { century } = system.recruitCentury({});
            system.addDecade(century.centuryId, { name: '1820s' });
            expect(century.decades.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addDecade('ghost', {});
            expect(result.error).toBe('CENTURY_NOT_FOUND');
        });

        it('should trigger decadeAdded hook', () => {
            const { century } = system.recruitCentury({});
            let called = false;
            system.registerHook('decadeAdded', () => { called = true; });
            system.addDecade(century.centuryId, {});
            expect(called).toBe(true);
        });
    });

    describe('raiseDepth', () => {
        it('should raise depth', () => {
            const { century } = system.recruitCentury({});
            system.raiseDepth(century.centuryId, 10);
            expect(century.depth).toBe(30);
        });

        it('should default amount to 5', () => {
            const { century } = system.recruitCentury({});
            system.raiseDepth(century.centuryId);
            expect(century.depth).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDepth('ghost', 5);
            expect(result.error).toBe('CENTURY_NOT_FOUND');
        });

        it('should trigger depthRaised hook', () => {
            const { century } = system.recruitCentury({});
            let called = false;
            system.registerHook('depthRaised', () => { called = true; });
            system.raiseDepth(century.centuryId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCentury', () => {
        it('should level up', () => {
            const { century } = system.recruitCentury({});
            system.levelUpCentury(century.centuryId);
            expect(century.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpCentury('ghost');
            expect(result.error).toBe('CENTURY_NOT_FOUND');
        });

        it('should trigger centuryLeveledUp hook', () => {
            const { century } = system.recruitCentury({});
            let called = false;
            system.registerHook('centuryLeveledUp', () => { called = true; });
            system.levelUpCentury(century.centuryId);
            expect(called).toBe(true);
        });
    });

    describe('legendCentury', () => {
        it('should legendize', () => {
            const { century } = system.recruitCentury({});
            system.legendCentury(century.centuryId);
            expect(century.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCentury('ghost');
            expect(result.error).toBe('CENTURY_NOT_FOUND');
        });

        it('should trigger centuryLegendized hook', () => {
            const { century } = system.recruitCentury({});
            let called = false;
            system.registerHook('centuryLegendized', () => { called = true; });
            system.legendCentury(century.centuryId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCenturyValue', () => {
        it('should calculate', () => {
            const { century } = system.recruitCentury({});
            system.addDecade(century.centuryId, {});
            system.addDecade(century.centuryId, {});
            // level=1*100 + depth=20*2 + decades=2*30 = 100 + 40 + 60 = 200
            expect(system.calculateCenturyValue(century.centuryId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCenturyValue('ghost')).toBe(0);
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

        it('should execute default getCentury', () => {
            const result = system.executeTool('getCentury', { centuryId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('centuryRecruited', () => count++);
            unregister();
            system.recruitCentury({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('centuryRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCentury({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCenturies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCenturies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCentury({});
            const json = system.toJSON();
            expect(json.centuries.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCentury({});
            const json = system.toJSON();
            const newSys = new CultivationCentury();
            newSys.fromJSON(json);
            expect(newSys.centuries.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.centuryCount).toBe(0);
        });
    });
});
