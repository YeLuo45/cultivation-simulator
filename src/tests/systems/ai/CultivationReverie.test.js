/**
 * CultivationReverie.test.js - 修真遐想测试
 * V797 Iteration 30/30 FINAL Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationReverie } from '../../../systems/ai/CultivationReverie.js';

describe('CultivationReverie', () => {
    let system;
    beforeEach(() => { system = new CultivationReverie(); });

    describe('driftReverie', () => {
        it('should drift', () => {
            const { reverie } = system.driftReverie({ name: 'Drifter' });
            expect(reverie.name).toBe('Drifter');
        });
        it('should initialize empty visions', () => {
            const { reverie } = system.driftReverie({});
            expect(reverie.visions).toEqual([]);
        });
        it('should trigger reverieDrifted hook', () => {
            let called = false;
            system.registerHook('reverieDrifted', () => { called = true; });
            system.driftReverie({});
            expect(called).toBe(true);
        });
    });

    describe('getReverie', () => {
        it('should return', () => {
            const { reverie } = system.driftReverie({});
            expect(system.getReverie(reverie.reverieId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getReverie('ghost')).toBeNull(); });
    });

    describe('listReveries', () => {
        it('should list all', () => {
            system.driftReverie({});
            expect(system.listReveries().length).toBe(1);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.driftReverie({ masterId: 'm1' });
            system.driftReverie({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByMood', () => {
        it('should filter', () => {
            system.driftReverie({ mood: 'serene' });
            system.driftReverie({ mood: 'stormy' });
            expect(system.listByMood('serene').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.driftReverie({ type: 'waking' });
            system.driftReverie({ type: 'sleeping' });
            expect(system.listByType('waking').length).toBe(1);
        });
    });

    describe('listVeteran', () => {
        it('should list veteran+', () => {
            system.driftReverie({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.driftReverie({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.driftReverie({});
            expect(system.listTop(2).length).toBe(1);
        });
    });

    describe('addVision', () => {
        it('should add', () => {
            const { reverie } = system.driftReverie({});
            system.addVision(reverie.reverieId, 'golden-mountain');
            expect(reverie.visions.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addVision('ghost', 'vision');
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger visionAdded hook', () => {
            const { reverie } = system.driftReverie({});
            let called = false;
            system.registerHook('visionAdded', () => { called = true; });
            system.addVision(reverie.reverieId, 'vision');
            expect(called).toBe(true);
        });
    });

    describe('raiseImagination', () => {
        it('should raise', () => {
            const { reverie } = system.driftReverie({});
            system.raiseImagination(reverie.reverieId, 5);
            expect(reverie.imagination).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseImagination('ghost', 5);
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger imaginationRaised hook', () => {
            const { reverie } = system.driftReverie({});
            let called = false;
            system.registerHook('imaginationRaised', () => { called = true; });
            system.raiseImagination(reverie.reverieId, 5);
            expect(called).toBe(true);
        });
    });

    describe('promoteReverie', () => {
        it('should promote', () => {
            const { reverie } = system.driftReverie({});
            system.promoteReverie(reverie.reverieId);
            expect(reverie.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteReverie('ghost');
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger reveriePromoted hook', () => {
            const { reverie } = system.driftReverie({});
            let called = false;
            system.registerHook('reveriePromoted', () => { called = true; });
            system.promoteReverie(reverie.reverieId);
            expect(called).toBe(true);
        });
    });

    describe('veteranizeReverie', () => {
        it('should veteranize', () => {
            const { reverie } = system.driftReverie({});
            system.veteranizeReverie(reverie.reverieId);
            expect(reverie.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.veteranizeReverie('ghost');
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger reverieVeteranized hook', () => {
            const { reverie } = system.driftReverie({});
            let called = false;
            system.registerHook('reverieVeteranized', () => { called = true; });
            system.veteranizeReverie(reverie.reverieId);
            expect(called).toBe(true);
        });
    });

    describe('legendizeReverie', () => {
        it('should legendize', () => {
            const { reverie } = system.driftReverie({});
            system.legendizeReverie(reverie.reverieId);
            expect(reverie.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendizeReverie('ghost');
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger reverieLegendized hook', () => {
            const { reverie } = system.driftReverie({});
            let called = false;
            system.registerHook('reverieLegendized', () => { called = true; });
            system.legendizeReverie(reverie.reverieId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change', () => {
            const { reverie } = system.driftReverie({});
            system.changeType(reverie.reverieId, 'sleeping');
            expect(reverie.type).toBe('sleeping');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'sleeping');
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger typeChanged hook', () => {
            const { reverie } = system.driftReverie({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(reverie.reverieId, 'sleeping');
            expect(called).toBe(true);
        });
    });

    describe('changeMood', () => {
        it('should change', () => {
            const { reverie } = system.driftReverie({});
            system.changeMood(reverie.reverieId, 'stormy');
            expect(reverie.mood).toBe('stormy');
        });

        it('should reject missing', () => {
            const result = system.changeMood('ghost', 'stormy');
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger moodChanged hook', () => {
            const { reverie } = system.driftReverie({});
            let called = false;
            system.registerHook('moodChanged', () => { called = true; });
            system.changeMood(reverie.reverieId, 'stormy');
            expect(called).toBe(true);
        });
    });

    describe('wakeReverie', () => {
        it('should wake', () => {
            const { reverie } = system.driftReverie({});
            system.wakeReverie(reverie.reverieId);
            expect(reverie.lastDrift).toBeGreaterThan(0);
        });

        it('should reject missing', () => {
            const result = system.wakeReverie('ghost');
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger reverieWoken hook', () => {
            const { reverie } = system.driftReverie({});
            let called = false;
            system.registerHook('reverieWoken', () => { called = true; });
            system.wakeReverie(reverie.reverieId);
            expect(called).toBe(true);
        });
    });

    describe('calculateReverieValue', () => {
        it('should calculate', () => {
            const { reverie } = system.driftReverie({});
            expect(system.calculateReverieValue(reverie.reverieId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateReverieValue('ghost')).toBe(0);
        });
    });

    describe('mergeReveries', () => {
        it('should merge', () => {
            const a = system.driftReverie({}).reverie;
            const b = system.driftReverie({}).reverie;
            const result = system.mergeReveries(a.reverieId, b.reverieId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.mergeReveries('ghost', 'ghost2');
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger reveriesMerged hook', () => {
            const a = system.driftReverie({}).reverie;
            const b = system.driftReverie({}).reverie;
            let called = false;
            system.registerHook('reveriesMerged', () => { called = true; });
            system.mergeReveries(a.reverieId, b.reverieId);
            expect(called).toBe(true);
        });
    });

    describe('deleteReverie', () => {
        it('should delete', () => {
            const { reverie } = system.driftReverie({});
            const result = system.deleteReverie(reverie.reverieId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteReverie('ghost');
            expect(result.error).toBe('REVERIE_NOT_FOUND');
        });

        it('should trigger reverieDeleted hook', () => {
            const { reverie } = system.driftReverie({});
            let called = false;
            system.registerHook('reverieDeleted', () => { called = true; });
            system.deleteReverie(reverie.reverieId);
            expect(called).toBe(true);
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

        it('should execute default listByMood', () => {
            system.driftReverie({ mood: 'serene' });
            const result = system.executeTool('listByMood', { mood: 'serene' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('reverieDrifted', () => count++);
            unregister();
            system.driftReverie({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('reverieDrifted', () => { throw new Error('x'); });
            expect(() => system.driftReverie({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDrifted = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDrifted = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.driftReverie({});
            const json = system.toJSON();
            expect(json.reveries.length).toBe(1);
        });
        it('should deserialize', () => {
            system.driftReverie({});
            const json = system.toJSON();
            const newSys = new CultivationReverie();
            newSys.fromJSON(json);
            expect(newSys.reveries.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.reverieCount).toBe(0);
        });
    });
});