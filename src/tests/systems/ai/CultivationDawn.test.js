/**
 * CultivationDawn.test.js - 修真晨系统测试
 * V583 Iteration 6/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDawn } from '../../../systems/ai/CultivationDawn.js';

describe('CultivationDawn', () => {
    let system;
    beforeEach(() => { system = new CultivationDawn(); });

    describe('openDawn', () => {
        it('should open', () => {
            const { dawn } = system.openDawn({ witnessId: 'w1', name: 'Sunrise' });
            expect(dawn.witnessId).toBe('w1');
            expect(dawn.name).toBe('Sunrise');
        });

        it('should default name to Unnamed Dawn', () => {
            const { dawn } = system.openDawn({});
            expect(dawn.name).toBe('Unnamed Dawn');
        });

        it('should default type to radiant', () => {
            const { dawn } = system.openDawn({});
            expect(dawn.type).toBe('radiant');
        });

        it('should initialize level 1', () => {
            const { dawn } = system.openDawn({});
            expect(dawn.level).toBe(1);
        });

        it('should initialize status preparing', () => {
            const { dawn } = system.openDawn({});
            expect(dawn.status).toBe('preparing');
        });

        it('should trigger dawnOpened hook', () => {
            let called = false;
            system.registerHook('dawnOpened', () => { called = true; });
            system.openDawn({});
            expect(called).toBe(true);
        });
    });

    describe('getDawn', () => {
        it('should return', () => {
            const { dawn } = system.openDawn({});
            expect(system.getDawn(dawn.dawnId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDawn('ghost')).toBeNull(); });
    });

    describe('listDawns', () => {
        it('should list all', () => {
            system.openDawn({});
            expect(system.listDawns().length).toBe(1);
        });

        it('should be empty initially', () => {
            expect(system.listDawns().length).toBe(0);
        });
    });

    describe('listByWitness', () => {
        it('should filter', () => {
            system.openDawn({ witnessId: 'w1' });
            system.openDawn({ witnessId: 'w2' });
            expect(system.listByWitness('w1').length).toBe(1);
        });

        it('should return empty for unknown witness', () => {
            system.openDawn({ witnessId: 'w1' });
            expect(system.listByWitness('unknown').length).toBe(0);
        });
    });

    describe('listRising', () => {
        it('should list rising/eternal dawns', () => {
            const { dawn: d1 } = system.openDawn({});
            const { dawn: d2 } = system.openDawn({});
            const { dawn: d3 } = system.openDawn({});
            d1.status = 'rising';
            d3.status = 'eternal';
            expect(system.listRising().length).toBe(2);
        });

        it('should return empty when no rising', () => {
            system.openDawn({});
            expect(system.listRising().length).toBe(0);
        });
    });

    describe('addSong', () => {
        it('should add song', () => {
            const { dawn } = system.openDawn({});
            system.addSong(dawn.dawnId, 'chord-1');
            expect(dawn.songs).toContain('chord-1');
        });

        it('should reject missing', () => {
            const result = system.addSong('ghost', 's');
            expect(result.error).toBe('DAWN_NOT_FOUND');
        });

        it('should trigger songAdded hook', () => {
            const { dawn } = system.openDawn({});
            let called = false;
            system.registerHook('songAdded', () => { called = true; });
            system.addSong(dawn.dawnId, 'note');
            expect(called).toBe(true);
        });
    });

    describe('increaseLight', () => {
        it('should increase light by 5 default', () => {
            const { dawn } = system.openDawn({});
            system.increaseLight(dawn.dawnId);
            expect(dawn.light).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { dawn } = system.openDawn({});
            system.increaseLight(dawn.dawnId, 30);
            expect(dawn.light).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.increaseLight('ghost', 10);
            expect(result.error).toBe('DAWN_NOT_FOUND');
        });

        it('should trigger lightIncreased hook', () => {
            const { dawn } = system.openDawn({});
            let called = false;
            system.registerHook('lightIncreased', () => { called = true; });
            system.increaseLight(dawn.dawnId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDawn', () => {
        it('should level up', () => {
            const { dawn } = system.openDawn({});
            system.levelUpDawn(dawn.dawnId);
            expect(dawn.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDawn('ghost');
            expect(result.error).toBe('DAWN_NOT_FOUND');
        });

        it('should trigger dawnLeveledUp hook', () => {
            const { dawn } = system.openDawn({});
            let called = false;
            system.registerHook('dawnLeveledUp', () => { called = true; });
            system.levelUpDawn(dawn.dawnId);
            expect(called).toBe(true);
        });
    });

    describe('eternalizeDawn', () => {
        it('should set status eternal', () => {
            const { dawn } = system.openDawn({});
            system.eternalizeDawn(dawn.dawnId);
            expect(dawn.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternalizeDawn('ghost');
            expect(result.error).toBe('DAWN_NOT_FOUND');
        });

        it('should trigger dawnEternalized hook', () => {
            const { dawn } = system.openDawn({});
            let called = false;
            system.registerHook('dawnEternalized', () => { called = true; });
            system.eternalizeDawn(dawn.dawnId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDawnValue', () => {
        it('should calculate', () => {
            const { dawn } = system.openDawn({});
            system.levelUpDawn(dawn.dawnId);
            system.addSong(dawn.dawnId, 'a');
            system.addSong(dawn.dawnId, 'b');
            // level=2 => 200, light=20 => 40, songs=2 => 60, total=300
            expect(system.calculateDawnValue(dawn.dawnId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDawnValue('ghost')).toBe(0);
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

        it('should execute default getDawn', () => {
            const result = system.executeTool('getDawn', { dawnId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default openDawn', () => {
            const result = system.executeTool('openDawn', { witnessId: 'wX' });
            expect(result.success).toBe(true);
            expect(result.result.dawn.witnessId).toBe('wX');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dawnOpened', () => count++);
            unregister();
            system.openDawn({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dawnOpened', () => { throw new Error('x'); });
            expect(() => system.openDawn({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDawns = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(system.config.maxDawns).toBe(60);
        });
        it('should not double evolve', () => {
            system.stats.totalDawns = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openDawn({});
            const json = system.toJSON();
            expect(json.dawns.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openDawn({});
            const json = system.toJSON();
            const newSys = new CultivationDawn();
            newSys.fromJSON(json);
            expect(newSys.dawns.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dawnCount).toBe(0);
            expect(stats.totalDawns).toBe(0);
        });
    });
});
