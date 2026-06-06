/**
 * CultivationHunter.test.js - 修真猎人测试
 * V611 Iteration 14/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHunter } from '../../../systems/ai/CultivationHunter.js';

describe('CultivationHunter', () => {
    let system;
    beforeEach(() => { system = new CultivationHunter(); });

    describe('recruitHunter', () => {
        it('should recruit', () => {
            const { hunter } = system.recruitHunter({ rangerId: 'r1', name: 'Viggo' });
            expect(hunter.rangerId).toBe('r1');
            expect(hunter.name).toBe('Viggo');
        });

        it('should default type to beast', () => {
            const { hunter } = system.recruitHunter({});
            expect(hunter.type).toBe('beast');
        });

        it('should default tracking to baseTracking', () => {
            const { hunter } = system.recruitHunter({});
            expect(hunter.tracking).toBe(20);
        });

        it('should initialize with novice status and level 1', () => {
            const { hunter } = system.recruitHunter({});
            expect(hunter.status).toBe('novice');
            expect(hunter.level).toBe(1);
        });

        it('should initialize with empty trophies array', () => {
            const { hunter } = system.recruitHunter({});
            expect(hunter.trophies).toEqual([]);
        });

        it('should trigger hunterRecruited hook', () => {
            let called = false;
            system.registerHook('hunterRecruited', () => { called = true; });
            system.recruitHunter({});
            expect(called).toBe(true);
        });

        it('should accept custom trophy input', () => {
            const { hunter } = system.recruitHunter({ trophies: ['wolf-pelt', 'bear-claw'] });
            expect(hunter.trophies).toEqual(['wolf-pelt', 'bear-claw']);
        });

        it('should accept custom type', () => {
            const { hunter } = system.recruitHunter({ type: 'elemental' });
            expect(hunter.type).toBe('elemental');
        });
    });

    describe('getHunter', () => {
        it('should return', () => {
            const { hunter } = system.recruitHunter({});
            expect(system.getHunter(hunter.hunterId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHunter('ghost')).toBeNull(); });
    });

    describe('listHunters', () => {
        it('should list all', () => {
            system.recruitHunter({});
            system.recruitHunter({});
            expect(system.listHunters().length).toBe(2);
        });

        it('should return empty array when no hunters', () => {
            expect(system.listHunters().length).toBe(0);
        });
    });

    describe('listByRanger', () => {
        it('should filter', () => {
            system.recruitHunter({ rangerId: 'r1' });
            system.recruitHunter({ rangerId: 'r2' });
            expect(system.listByRanger('r1').length).toBe(1);
        });

        it('should return empty for unknown ranger', () => {
            system.recruitHunter({ rangerId: 'r1' });
            expect(system.listByRanger('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary hunters', () => {
            const { hunter: h1 } = system.recruitHunter({});
            system.recruitHunter({});
            system.legendHunter(h1.hunterId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendaries', () => {
            system.recruitHunter({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTrophy', () => {
        it('should add trophy', () => {
            const { hunter } = system.recruitHunter({});
            system.addTrophy(hunter.hunterId, 'wolf-pelt');
            expect(hunter.trophies).toContain('wolf-pelt');
        });

        it('should add multiple trophies', () => {
            const { hunter } = system.recruitHunter({});
            system.addTrophy(hunter.hunterId, 'wolf-pelt');
            system.addTrophy(hunter.hunterId, 'bear-claw');
            expect(hunter.trophies.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addTrophy('ghost', 'wolf-pelt');
            expect(result.error).toBe('HUNTER_NOT_FOUND');
        });

        it('should trigger trophyAdded hook', () => {
            const { hunter } = system.recruitHunter({});
            let called = false;
            system.registerHook('trophyAdded', () => { called = true; });
            system.addTrophy(hunter.hunterId, 'wolf-pelt');
            expect(called).toBe(true);
        });
    });

    describe('sharpenTracking', () => {
        it('should sharpen tracking with default amount', () => {
            const { hunter } = system.recruitHunter({});
            system.sharpenTracking(hunter.hunterId);
            expect(hunter.tracking).toBe(25);
        });

        it('should sharpen tracking with custom amount', () => {
            const { hunter } = system.recruitHunter({});
            system.sharpenTracking(hunter.hunterId, 10);
            expect(hunter.tracking).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.sharpenTracking('ghost', 10);
            expect(result.error).toBe('HUNTER_NOT_FOUND');
        });

        it('should trigger trackingSharpened hook', () => {
            const { hunter } = system.recruitHunter({});
            let called = false;
            system.registerHook('trackingSharpened', () => { called = true; });
            system.sharpenTracking(hunter.hunterId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHunter', () => {
        it('should level up', () => {
            const { hunter } = system.recruitHunter({});
            system.levelUpHunter(hunter.hunterId);
            expect(hunter.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { hunter } = system.recruitHunter({});
            system.levelUpHunter(hunter.hunterId);
            system.levelUpHunter(hunter.hunterId);
            expect(hunter.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpHunter('ghost');
            expect(result.error).toBe('HUNTER_NOT_FOUND');
        });

        it('should trigger hunterLeveledUp hook', () => {
            const { hunter } = system.recruitHunter({});
            let called = false;
            system.registerHook('hunterLeveledUp', () => { called = true; });
            system.levelUpHunter(hunter.hunterId);
            expect(called).toBe(true);
        });
    });

    describe('legendHunter', () => {
        it('should set status to legendary', () => {
            const { hunter } = system.recruitHunter({});
            system.legendHunter(hunter.hunterId);
            expect(hunter.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHunter('ghost');
            expect(result.error).toBe('HUNTER_NOT_FOUND');
        });

        it('should trigger hunterLegendized hook', () => {
            const { hunter } = system.recruitHunter({});
            let called = false;
            system.registerHook('hunterLegendized', () => { called = true; });
            system.legendHunter(hunter.hunterId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHunterValue', () => {
        it('should calculate base value', () => {
            const { hunter } = system.recruitHunter({});
            // level(1)*100 + tracking(20)*2 + trophies(0)*30 = 100 + 40 + 0 = 140
            expect(system.calculateHunterValue(hunter.hunterId)).toBe(140);
        });

        it('should include trophy value', () => {
            const { hunter } = system.recruitHunter({ trophies: ['a', 'b', 'c'] });
            // level(1)*100 + tracking(20)*2 + trophies(3)*30 = 100 + 40 + 90 = 230
            expect(system.calculateHunterValue(hunter.hunterId)).toBe(230);
        });

        it('should include level in value', () => {
            const { hunter } = system.recruitHunter({});
            system.levelUpHunter(hunter.hunterId);
            // level(2)*100 + tracking(20)*2 + trophies(0)*30 = 200 + 40 + 0 = 240
            expect(system.calculateHunterValue(hunter.hunterId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHunterValue('ghost')).toBe(0);
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

        it('should execute default getHunter', () => {
            const result = system.executeTool('getHunter', { hunterId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitHunter', () => {
            const result = system.executeTool('recruitHunter', { name: 'Test' });
            expect(result.success).toBe(true);
            expect(result.result.hunter.name).toBe('Test');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('hunterRecruited', () => count++);
            unregister();
            system.recruitHunter({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('hunterRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHunter({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHunters = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHunters = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHunter({});
            const json = system.toJSON();
            expect(json.hunters.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHunter({});
            const json = system.toJSON();
            const newSys = new CultivationHunter();
            newSys.fromJSON(json);
            expect(newSys.hunters.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.hunterCount).toBe(0);
        });

        it('should reflect added hunters', () => {
            system.recruitHunter({});
            const stats = system.getStats();
            expect(stats.hunterCount).toBe(1);
        });
    });
});
