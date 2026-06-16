/**
 * CultivationSonata.test.js - 修真奏鸣系统测试
 * V795 Iteration 28/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSonata } from '../../../systems/ai/CultivationSonata.js';

describe('CultivationSonata', () => {
    let system;
    beforeEach(() => { system = new CultivationSonata(); });

    describe('recruitSonata', () => {
        it('should recruit', () => {
            const { sonata } = system.recruitSonata({ masterId: 'm1', name: 'Celestial Sonata', type: 'duet' });
            expect(sonata.masterId).toBe('m1');
            expect(sonata.name).toBe('Celestial Sonata');
            expect(sonata.type).toBe('duet');
        });

        it('should default type to solo', () => {
            const { sonata } = system.recruitSonata({});
            expect(sonata.type).toBe('solo');
        });

        it('should default status to novice', () => {
            const { sonata } = system.recruitSonata({});
            expect(sonata.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { sonata } = system.recruitSonata({});
            expect(sonata.level).toBe(1);
        });

        it('should default themes to empty array', () => {
            const { sonata } = system.recruitSonata({});
            expect(sonata.themes).toEqual([]);
        });

        it('should default eloquence to baseEloquence', () => {
            const { sonata } = system.recruitSonata({});
            expect(sonata.eloquence).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { sonata } = system.recruitSonata({});
            expect(sonata.sonataId).toMatch(/^snt_/);
        });

        it('should use provided sonataId', () => {
            const { sonata } = system.recruitSonata({ sonataId: 's_explicit' });
            expect(sonata.sonataId).toBe('s_explicit');
        });

        it('should trigger sonataRecruited hook', () => {
            let called = false;
            system.registerHook('sonataRecruited', () => { called = true; });
            system.recruitSonata({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseEloquence', () => {
            const customSystem = new CultivationSonata({ baseEloquence: 50 });
            const { sonata } = customSystem.recruitSonata({});
            expect(sonata.eloquence).toBe(50);
        });

        it('should support trio type', () => {
            const { sonata } = system.recruitSonata({ type: 'trio' });
            expect(sonata.type).toBe('trio');
        });
    });

    describe('getSonata', () => {
        it('should return', () => {
            const { sonata } = system.recruitSonata({});
            expect(system.getSonata(sonata.sonataId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSonata('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { sonata } = system.recruitSonata({ name: 'Original' });
            const fetched = system.getSonata(sonata.sonataId);
            fetched.name = 'Mutated';
            const refetched = system.getSonata(sonata.sonataId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listSonatas', () => {
        it('should list all', () => {
            system.recruitSonata({});
            system.recruitSonata({});
            expect(system.listSonatas().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listSonatas().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitSonata({ masterId: 'm1' });
            system.recruitSonata({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitSonata({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { sonata: a } = system.recruitSonata({});
            const { sonata: b } = system.recruitSonata({});
            system.legendSonata(a.sonataId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.sonataId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitSonata({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTheme', () => {
        it('should add theme', () => {
            const { sonata } = system.recruitSonata({});
            system.addTheme(sonata.sonataId, 'dawn');
            expect(sonata.themes).toContain('dawn');
        });

        it('should add multiple themes', () => {
            const { sonata } = system.recruitSonata({});
            system.addTheme(sonata.sonataId, 'dawn');
            system.addTheme(sonata.sonataId, 'dusk');
            expect(sonata.themes.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addTheme('ghost', 'dawn');
            expect(result.error).toBe('SONATA_NOT_FOUND');
        });

        it('should trigger themeAdded hook', () => {
            const { sonata } = system.recruitSonata({});
            let called = false;
            system.registerHook('themeAdded', () => { called = true; });
            system.addTheme(sonata.sonataId, 'dawn');
            expect(called).toBe(true);
        });
    });

    describe('raiseEloquence', () => {
        it('should raise eloquence', () => {
            const { sonata } = system.recruitSonata({});
            system.raiseEloquence(sonata.sonataId, 10);
            expect(sonata.eloquence).toBe(30);
        });

        it('should default amount to 5', () => {
            const { sonata } = system.recruitSonata({});
            system.raiseEloquence(sonata.sonataId);
            expect(sonata.eloquence).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseEloquence('ghost', 10);
            expect(result.error).toBe('SONATA_NOT_FOUND');
        });

        it('should trigger eloquenceRaised hook', () => {
            const { sonata } = system.recruitSonata({});
            let called = false;
            system.registerHook('eloquenceRaised', () => { called = true; });
            system.raiseEloquence(sonata.sonataId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSonata', () => {
        it('should increment level', () => {
            const { sonata } = system.recruitSonata({});
            system.levelUpSonata(sonata.sonataId);
            expect(sonata.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { sonata } = system.recruitSonata({});
            system.levelUpSonata(sonata.sonataId);
            system.levelUpSonata(sonata.sonataId);
            system.levelUpSonata(sonata.sonataId);
            expect(sonata.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpSonata('ghost');
            expect(result.error).toBe('SONATA_NOT_FOUND');
        });
    });

    describe('legendSonata', () => {
        it('should set status to legendary', () => {
            const { sonata } = system.recruitSonata({});
            system.legendSonata(sonata.sonataId);
            expect(sonata.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSonata('ghost');
            expect(result.error).toBe('SONATA_NOT_FOUND');
        });

        it('should trigger sonataLegendized hook', () => {
            const { sonata } = system.recruitSonata({});
            let called = false;
            system.registerHook('sonataLegendized', () => { called = true; });
            system.legendSonata(sonata.sonataId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSonataValue', () => {
        it('should calculate', () => {
            const { sonata } = system.recruitSonata({});
            system.addTheme(sonata.sonataId, 'dawn');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateSonataValue(sonata.sonataId)).toBe(170);
        });

        it('should recalculate after level up', () => {
            const { sonata } = system.recruitSonata({});
            system.levelUpSonata(sonata.sonataId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateSonataValue(sonata.sonataId)).toBe(240);
        });

        it('should recalculate after eloquence raise', () => {
            const { sonata } = system.recruitSonata({});
            system.raiseEloquence(sonata.sonataId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateSonataValue(sonata.sonataId)).toBe(150);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSonataValue('ghost')).toBe(0);
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

        it('should execute default getSonata', () => {
            const result = system.executeTool('getSonata', { sonataId: 'ghost' });
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
            const unregister = system.registerHook('sonataRecruited', () => count++);
            unregister();
            system.recruitSonata({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sonataRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSonata({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSonatas = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSonatas = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSonata({});
            const json = system.toJSON();
            expect(json.sonatas.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSonata({});
            const json = system.toJSON();
            const newSys = new CultivationSonata();
            newSys.fromJSON(json);
            expect(newSys.sonatas.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitSonata({});
            const stats = system.getStats();
            expect(stats.sonataCount).toBe(1);
        });
    });
});
