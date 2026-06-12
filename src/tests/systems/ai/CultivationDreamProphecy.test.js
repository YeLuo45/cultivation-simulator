/**
 * CultivationDreamProphecy.test.js - 修真梦境预言测试
 * V868 Iteration 2/30 Round 34 - 测试覆盖率目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDreamProphecy, PROPHECY_EVENTS, SYMBOL_LIBRARY, ACCURACY_THRESHOLDS } from '../../../systems/ai/CultivationDreamProphecy.js';

describe('CultivationDreamProphecy', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamProphecy(); });

    describe('exports', () => {
        it('should export constants', () => {
            expect(PROPHECY_EVENTS.length).toBe(4);
            expect(SYMBOL_LIBRARY.length).toBe(20);
            expect(ACCURACY_THRESHOLDS.medium).toBe(0.6);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const s = new CultivationDreamProphecy({ maxProphecies: 5, baseAccuracy: 0.7, symbolCount: 5 });
            expect(s.config.symbolCount).toBe(5);
        });
    });

    describe('generateProphecy', () => {
        it('should generate', () => {
            const { prophecy } = system.generateProphecy('d1', 'tribulation');
            expect(prophecy.dreamId).toBe('d1');
            expect(prophecy.eventType).toBe('tribulation');
            expect(prophecy.symbols.length).toBe(3);
        });
        it('should reject invalid event', () => {
            expect(system.generateProphecy('d', 'invalid').error).toBe('INVALID_EVENT');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('prophecyGenerated', () => { called = true; });
            system.generateProphecy('d', 'death');
            expect(called).toBe(true);
        });
        it('should support all events', () => {
            for (const e of PROPHECY_EVENTS) {
                const r = system.generateProphecy('d', e);
                expect(r.success).toBe(true);
            }
        });
        it('should generate unique symbols', () => {
            const { prophecy } = system.generateProphecy('d', 'ascension');
            const unique = new Set(prophecy.symbols);
            expect(unique.size).toBe(prophecy.symbols.length);
        });
    });

    describe('getProphecy', () => {
        it('should return', () => {
            const { prophecy } = system.generateProphecy('d', 'opportunity');
            expect(system.getProphecy(prophecy.id).id).toBe(prophecy.id);
        });
        it('should return null for missing', () => {
            expect(system.getProphecy('ghost')).toBeNull();
        });
    });

    describe('list methods', () => {
        it('listProphecies', () => {
            system.generateProphecy('d', 'tribulation');
            expect(system.listProphecies().length).toBe(1);
        });
        it('listByEvent', () => {
            system.generateProphecy('d', 'tribulation');
            system.generateProphecy('d', 'death');
            expect(system.listByEvent('death').length).toBe(1);
        });
        it('listByDream', () => {
            system.generateProphecy('d1', 'tribulation');
            system.generateProphecy('d2', 'death');
            expect(system.listByDream('d1').length).toBe(1);
        });
        it('listManifested', () => {
            const { prophecy } = system.generateProphecy('d', 'tribulation');
            system.manifestProphecy(prophecy.id);
            expect(system.listManifested().length).toBe(1);
        });
    });

    describe('decodeProphecy', () => {
        it('should decode high accuracy', () => {
            const { prophecy } = system.generateProphecy('d', 'tribulation');
            prophecy.accuracy = 0.9;
            const r = system.decodeProphecy(prophecy.id);
            expect(r.threshold).toBe('high');
        });
        it('should decode medium', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            prophecy.accuracy = 0.7;
            const r = system.decodeProphecy(prophecy.id);
            expect(r.threshold).toBe('medium');
        });
        it('should decode low', () => {
            const { prophecy } = system.generateProphecy('d', 'opportunity');
            prophecy.accuracy = 0.1;
            const r = system.decodeProphecy(prophecy.id);
            expect(r.threshold).toBe('low');
        });
        it('should reject missing', () => {
            expect(system.decodeProphecy('ghost').error).toBe('PROPHECY_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { prophecy } = system.generateProphecy('d', 'tribulation');
            let called = false;
            system.registerHook('prophecyDecoded', () => { called = true; });
            system.decodeProphecy(prophecy.id);
            expect(called).toBe(true);
        });
    });

    describe('manifestProphecy', () => {
        it('should manifest', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            const r = system.manifestProphecy(prophecy.id);
            expect(r.success).toBe(true);
            expect(prophecy.manifested).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.manifestProphecy('ghost').error).toBe('PROPHECY_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            let called = false;
            system.registerHook('prophecyManifested', () => { called = true; });
            system.manifestProphecy(prophecy.id);
            expect(called).toBe(true);
        });
    });

    describe('boostAccuracy', () => {
        it('should boost', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            const before = prophecy.accuracy;
            system.boostAccuracy(prophecy.id, 0.2);
            expect(prophecy.accuracy).toBeGreaterThanOrEqual(before);
        });
        it('should cap at 1', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            system.boostAccuracy(prophecy.id, 5);
            expect(prophecy.accuracy).toBe(1);
        });
        it('should reject missing', () => {
            expect(system.boostAccuracy('ghost').error).toBe('PROPHECY_NOT_FOUND');
        });
    });

    describe('addSymbol', () => {
        it('should add', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            const r = system.addSymbol(prophecy.id, 'dragon');
            expect(r.success).toBe(true);
        });
        it('should not duplicate', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            prophecy.symbols = ['dragon'];
            system.addSymbol(prophecy.id, 'dragon');
            expect(prophecy.symbols.filter(s => s === 'dragon').length).toBe(1);
        });
        it('should reject missing', () => {
            expect(system.addSymbol('ghost', 'dragon').error).toBe('PROPHECY_NOT_FOUND');
        });
        it('should reject invalid', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            expect(system.addSymbol(prophecy.id, 'unicorn').error).toBe('INVALID_SYMBOL');
        });
    });

    describe('deleteProphecy', () => {
        it('should delete', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            expect(system.deleteProphecy(prophecy.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteProphecy('ghost').error).toBe('PROPHECY_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            let called = false;
            system.registerHook('prophecyDeleted', () => { called = true; });
            system.deleteProphecy(prophecy.id);
            expect(called).toBe(true);
        });
    });

    describe('tools and hooks', () => {
        it('should execute default tool', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            const r = system.executeTool('getProphecy', { prophecyId: prophecy.id });
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
            const r = system.executeTool('getProphecy');
            expect(r.success).toBe(true);
            expect(r.result).toBeNull();
        });
        it('should list tools', () => {
            expect(system.listTools().length).toBe(2);
        });
        it('should unregister hook', () => {
            let count = 0;
            const off = system.registerHook('prophecyGenerated', () => { count++; });
            system.generateProphecy('d', 'death');
            off();
            system.generateProphecy('d', 'death');
            expect(count).toBe(1);
        });
        it('should catch handler errors', () => {
            system.registerHook('prophecyGenerated', () => { throw new Error('x'); });
            expect(() => system.generateProphecy('d', 'death')).not.toThrow();
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should round trip', () => {
            system.generateProphecy('d', 'death');
            const json = system.toJSON();
            const s2 = new CultivationDreamProphecy();
            expect(s2.fromJSON(json).success).toBe(true);
        });
        it('should handle empty fromJSON', () => {
            const s2 = new CultivationDreamProphecy();
            expect(s2.fromJSON({}).success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const { prophecy } = system.generateProphecy('d', 'death');
            system.manifestProphecy(prophecy.id);
            const stats = system.getStats();
            expect(stats.totalManifested).toBe(1);
            expect(stats.prophecyCount).toBe(1);
        });
    });
});
