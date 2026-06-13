/**
 * CultivationSymbol.test.js - 修真符号系统测试
 * V763 Iteration 26/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSymbol } from '../../../systems/ai/CultivationSymbol.js';

describe('CultivationSymbol', () => {
    let system;
    beforeEach(() => { system = new CultivationSymbol(); });

    describe('recruitSymbol', () => {
        it('should recruit symbol', () => {
            const { symbol } = system.recruitSymbol({ masterId: 'm1', name: 'Heaven Symbol', type: 'celestial' });
            expect(symbol.masterId).toBe('m1');
            expect(symbol.name).toBe('Heaven Symbol');
            expect(symbol.type).toBe('celestial');
        });

        it('should default type to geometric', () => {
            const { symbol } = system.recruitSymbol({});
            expect(symbol.type).toBe('geometric');
        });

        it('should default name to Unnamed Symbol', () => {
            const { symbol } = system.recruitSymbol({});
            expect(symbol.name).toBe('Unnamed Symbol');
        });

        it('should default clarity to baseClarity', () => {
            const { symbol } = system.recruitSymbol({});
            expect(symbol.clarity).toBe(20);
        });

        it('should start at level 1', () => {
            const { symbol } = system.recruitSymbol({});
            expect(symbol.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { symbol } = system.recruitSymbol({});
            expect(symbol.status).toBe('novice');
        });

        it('should start with empty lines', () => {
            const { symbol } = system.recruitSymbol({});
            expect(symbol.lines).toEqual([]);
        });

        it('should generate symbolId', () => {
            const { symbol } = system.recruitSymbol({});
            expect(symbol.symbolId).toBeDefined();
            expect(typeof symbol.symbolId).toBe('string');
        });

        it('should accept custom symbolId', () => {
            const { symbol } = system.recruitSymbol({ symbolId: 'my-symbol' });
            expect(symbol.symbolId).toBe('my-symbol');
        });

        it('should support all types', () => {
            const { symbol: s1 } = system.recruitSymbol({ type: 'geometric' });
            const { symbol: s2 } = system.recruitSymbol({ type: 'celestial' });
            const { symbol: s3 } = system.recruitSymbol({ type: 'sacred' });
            expect(s1.type).toBe('geometric');
            expect(s2.type).toBe('celestial');
            expect(s3.type).toBe('sacred');
        });

        it('should trigger symbolRecruited hook', () => {
            let called = false;
            system.registerHook('symbolRecruited', () => { called = true; });
            system.recruitSymbol({});
            expect(called).toBe(true);
        });
    });

    describe('getSymbol', () => {
        it('should return symbol', () => {
            const { symbol } = system.recruitSymbol({});
            expect(system.getSymbol(symbol.symbolId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSymbol('ghost')).toBeNull(); });
    });

    describe('listSymbols', () => {
        it('should list all', () => {
            system.recruitSymbol({});
            system.recruitSymbol({});
            expect(system.listSymbols().length).toBe(2);
        });

        it('should return empty when no symbols', () => {
            expect(system.listSymbols().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSymbol({ masterId: 'm1' });
            system.recruitSymbol({ masterId: 'm2' });
            system.recruitSymbol({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitSymbol({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { symbol: s1 } = system.recruitSymbol({});
            const { symbol: s2 } = system.recruitSymbol({});
            system.legendSymbol(s1.symbolId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].symbolId).toBe(s1.symbolId);
        });

        it('should return empty when none legendary', () => {
            system.recruitSymbol({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addLine', () => {
        it('should add line', () => {
            const { symbol } = system.recruitSymbol({});
            system.addLine(symbol.symbolId, 'dragon-line');
            expect(symbol.lines).toContain('dragon-line');
            expect(symbol.lines.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addLine('ghost', 'line');
            expect(result.error).toBe('SYMBOL_NOT_FOUND');
        });

        it('should trigger lineAdded hook', () => {
            const { symbol } = system.recruitSymbol({});
            let called = false;
            system.registerHook('lineAdded', () => { called = true; });
            system.addLine(symbol.symbolId, 'line');
            expect(called).toBe(true);
        });

        it('should add multiple lines', () => {
            const { symbol } = system.recruitSymbol({});
            system.addLine(symbol.symbolId, 'line1');
            system.addLine(symbol.symbolId, 'line2');
            expect(symbol.lines.length).toBe(2);
        });
    });

    describe('raiseClarity', () => {
        it('should raise clarity', () => {
            const { symbol } = system.recruitSymbol({});
            system.raiseClarity(symbol.symbolId, 10);
            expect(symbol.clarity).toBe(30);
        });

        it('should default amount to 5', () => {
            const { symbol } = system.recruitSymbol({});
            system.raiseClarity(symbol.symbolId);
            expect(symbol.clarity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseClarity('ghost', 10);
            expect(result.error).toBe('SYMBOL_NOT_FOUND');
        });

        it('should trigger clarityRaised hook', () => {
            const { symbol } = system.recruitSymbol({});
            let called = false;
            system.registerHook('clarityRaised', () => { called = true; });
            system.raiseClarity(symbol.symbolId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSymbol', () => {
        it('should level up', () => {
            const { symbol } = system.recruitSymbol({});
            system.levelUpSymbol(symbol.symbolId);
            expect(symbol.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSymbol('ghost');
            expect(result.error).toBe('SYMBOL_NOT_FOUND');
        });

        it('should trigger symbolLeveledUp hook', () => {
            const { symbol } = system.recruitSymbol({});
            let called = false;
            system.registerHook('symbolLeveledUp', () => { called = true; });
            system.levelUpSymbol(symbol.symbolId);
            expect(called).toBe(true);
        });
    });

    describe('legendSymbol', () => {
        it('should set status to legendary', () => {
            const { symbol } = system.recruitSymbol({});
            system.legendSymbol(symbol.symbolId);
            expect(symbol.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSymbol('ghost');
            expect(result.error).toBe('SYMBOL_NOT_FOUND');
        });

        it('should trigger symbolLegendized hook', () => {
            const { symbol } = system.recruitSymbol({});
            let called = false;
            system.registerHook('symbolLegendized', () => { called = true; });
            system.legendSymbol(symbol.symbolId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitSymbol({ type: 'geometric' });
            system.recruitSymbol({ type: 'celestial' });
            system.recruitSymbol({ type: 'sacred' });
            expect(system.listByType('celestial').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitSymbol({ type: 'geometric' });
            expect(system.listByType('shadow').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran symbols', () => {
            system.recruitSymbol({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateSymbolValue', () => {
        it('should calculate for default symbol', () => {
            const { symbol } = system.recruitSymbol({});
            // level 1 * 100 + clarity 20 * 2 + 0 lines * 30 = 100 + 40 + 0 = 140
            expect(system.calculateSymbolValue(symbol.symbolId)).toBe(140);
        });

        it('should incorporate level, clarity, and lines', () => {
            const { symbol } = system.recruitSymbol({});
            system.levelUpSymbol(symbol.symbolId); // level 2
            system.raiseClarity(symbol.symbolId, 10); // clarity 30
            system.addLine(symbol.symbolId, 'line1'); // 1 line
            system.addLine(symbol.symbolId, 'line2'); // 2 lines
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateSymbolValue(symbol.symbolId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSymbolValue('ghost')).toBe(0);
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

        it('should execute default getSymbol', () => {
            const result = system.executeTool('getSymbol', { symbolId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('symbolRecruited', () => count++);
            unregister();
            system.recruitSymbol({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('symbolRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSymbol({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSymbols = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSymbols = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSymbol({});
            const json = system.toJSON();
            expect(json.symbols.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSymbol({});
            const json = system.toJSON();
            const newSys = new CultivationSymbol();
            newSys.fromJSON(json);
            expect(newSys.symbols.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.symbolCount).toBe(0);
        });
    });
});
