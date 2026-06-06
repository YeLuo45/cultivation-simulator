/**
 * CultivationDusk.test.js - 修真暮系统测试
 * V584 Iteration 7/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDusk } from '../../../systems/ai/CultivationDusk.js';

describe('CultivationDusk', () => {
    let system;
    beforeEach(() => { system = new CultivationDusk(); });

    describe('openDusk', () => {
        it('should open', () => {
            const { dusk } = system.openDusk({ observerId: 'o1', name: 'Twilight' });
            expect(dusk.observerId).toBe('o1');
            expect(dusk.name).toBe('Twilight');
        });

        it('should default name to Unnamed Dusk', () => {
            const { dusk } = system.openDusk({});
            expect(dusk.name).toBe('Unnamed Dusk');
        });

        it('should default type to golden', () => {
            const { dusk } = system.openDusk({});
            expect(dusk.type).toBe('golden');
        });

        it('should initialize level 1', () => {
            const { dusk } = system.openDusk({});
            expect(dusk.level).toBe(1);
        });

        it('should initialize status approaching', () => {
            const { dusk } = system.openDusk({});
            expect(dusk.status).toBe('approaching');
        });

        it('should trigger duskOpened hook', () => {
            let called = false;
            system.registerHook('duskOpened', () => { called = true; });
            system.openDusk({});
            expect(called).toBe(true);
        });
    });

    describe('getDusk', () => {
        it('should return', () => {
            const { dusk } = system.openDusk({});
            expect(system.getDusk(dusk.duskId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDusk('ghost')).toBeNull(); });
    });

    describe('listDusks', () => {
        it('should list all', () => {
            system.openDusk({});
            expect(system.listDusks().length).toBe(1);
        });

        it('should be empty initially', () => {
            expect(system.listDusks().length).toBe(0);
        });
    });

    describe('listByObserver', () => {
        it('should filter', () => {
            system.openDusk({ observerId: 'o1' });
            system.openDusk({ observerId: 'o2' });
            expect(system.listByObserver('o1').length).toBe(1);
        });

        it('should return empty for unknown observer', () => {
            system.openDusk({ observerId: 'o1' });
            expect(system.listByObserver('unknown').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should list active/eternal dusks', () => {
            const { dusk: d1 } = system.openDusk({});
            const { dusk: d2 } = system.openDusk({});
            const { dusk: d3 } = system.openDusk({});
            d1.status = 'active';
            d3.status = 'eternal';
            expect(system.listActive().length).toBe(2);
        });

        it('should return empty when no active', () => {
            system.openDusk({});
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('addVision', () => {
        it('should add vision', () => {
            const { dusk } = system.openDusk({});
            system.addVision(dusk.duskId, 'prophecy-1');
            expect(dusk.visions).toContain('prophecy-1');
        });

        it('should reject missing', () => {
            const result = system.addVision('ghost', 'v');
            expect(result.error).toBe('DUSK_NOT_FOUND');
        });

        it('should trigger visionAdded hook', () => {
            const { dusk } = system.openDusk({});
            let called = false;
            system.registerHook('visionAdded', () => { called = true; });
            system.addVision(dusk.duskId, 'omen');
            expect(called).toBe(true);
        });
    });

    describe('deepenShadow', () => {
        it('should deepen shadow by 5 default', () => {
            const { dusk } = system.openDusk({});
            system.deepenShadow(dusk.duskId);
            expect(dusk.shadow).toBe(25);
        });

        it('should deepen by custom amount', () => {
            const { dusk } = system.openDusk({});
            system.deepenShadow(dusk.duskId, 30);
            expect(dusk.shadow).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.deepenShadow('ghost', 10);
            expect(result.error).toBe('DUSK_NOT_FOUND');
        });

        it('should trigger shadowDeepened hook', () => {
            const { dusk } = system.openDusk({});
            let called = false;
            system.registerHook('shadowDeepened', () => { called = true; });
            system.deepenShadow(dusk.duskId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDusk', () => {
        it('should level up', () => {
            const { dusk } = system.openDusk({});
            system.levelUpDusk(dusk.duskId);
            expect(dusk.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDusk('ghost');
            expect(result.error).toBe('DUSK_NOT_FOUND');
        });

        it('should trigger duskLeveledUp hook', () => {
            const { dusk } = system.openDusk({});
            let called = false;
            system.registerHook('duskLeveledUp', () => { called = true; });
            system.levelUpDusk(dusk.duskId);
            expect(called).toBe(true);
        });
    });

    describe('eternalizeDusk', () => {
        it('should set status eternal', () => {
            const { dusk } = system.openDusk({});
            system.eternalizeDusk(dusk.duskId);
            expect(dusk.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternalizeDusk('ghost');
            expect(result.error).toBe('DUSK_NOT_FOUND');
        });

        it('should trigger duskEternalized hook', () => {
            const { dusk } = system.openDusk({});
            let called = false;
            system.registerHook('duskEternalized', () => { called = true; });
            system.eternalizeDusk(dusk.duskId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDuskValue', () => {
        it('should calculate', () => {
            const { dusk } = system.openDusk({});
            system.levelUpDusk(dusk.duskId);
            system.addVision(dusk.duskId, 'a');
            system.addVision(dusk.duskId, 'b');
            // level=2 => 200, shadow=20 => 40, visions=2 => 60, total=300
            expect(system.calculateDuskValue(dusk.duskId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDuskValue('ghost')).toBe(0);
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

        it('should execute default getDusk', () => {
            const result = system.executeTool('getDusk', { duskId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default openDusk', () => {
            const result = system.executeTool('openDusk', { observerId: 'oX' });
            expect(result.success).toBe(true);
            expect(result.result.dusk.observerId).toBe('oX');
        });

        it('should execute tool with undefined context', () => {
            system.registerTool('nocontext', () => 'no-ctx');
            const result = system.executeTool('nocontext');
            expect(result.result).toBe('no-ctx');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('duskOpened', () => count++);
            unregister();
            system.openDusk({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('duskOpened', () => { throw new Error('x'); });
            expect(() => system.openDusk({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDusks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(system.config.maxDusks).toBe(60);
        });
        it('should not double evolve', () => {
            system.stats.totalDusks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openDusk({});
            const json = system.toJSON();
            expect(json.dusks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openDusk({});
            const json = system.toJSON();
            const newSys = new CultivationDusk();
            newSys.fromJSON(json);
            expect(newSys.dusks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.duskCount).toBe(0);
            expect(stats.totalDusks).toBe(0);
        });
    });
});
