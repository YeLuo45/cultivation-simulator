/**
 * CultivationMortal.test.js - 修真凡人测试
 * V668 Iteration 21/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMortal } from '../../../systems/ai/CultivationMortal.js';

describe('CultivationMortal', () => {
    let system;
    beforeEach(() => { system = new CultivationMortal(); });

    describe('recruitMortal', () => {
        it('should recruit', () => {
            const { mortal } = system.recruitMortal({ parentId: 'p1', name: 'Wang', type: 'noble' });
            expect(mortal.parentId).toBe('p1');
            expect(mortal.name).toBe('Wang');
            expect(mortal.type).toBe('noble');
            expect(mortal.health).toBe(20);
            expect(mortal.level).toBe(1);
            expect(mortal.status).toBe('novice');
            expect(mortal.lifespans).toEqual([]);
        });

        it('should use default name and type', () => {
            const { mortal } = system.recruitMortal({});
            expect(mortal.name).toBe('Anonymous Mortal');
            expect(mortal.type).toBe('common');
        });

        it('should generate mortalId if not provided', () => {
            const { mortal } = system.recruitMortal({});
            expect(mortal.mortalId).toBeTruthy();
            expect(typeof mortal.mortalId).toBe('string');
        });

        it('should trigger mortalRecruited hook', () => {
            let called = false;
            system.registerHook('mortalRecruited', () => { called = true; });
            system.recruitMortal({});
            expect(called).toBe(true);
        });
    });

    describe('getMortal', () => {
        it('should return', () => {
            const { mortal } = system.recruitMortal({});
            expect(system.getMortal(mortal.mortalId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMortal('ghost')).toBeNull(); });
    });

    describe('listMortals', () => {
        it('should list all', () => {
            system.recruitMortal({});
            system.recruitMortal({});
            expect(system.listMortals().length).toBe(2);
        });
        it('should return empty array initially', () => {
            expect(system.listMortals()).toEqual([]);
        });
    });

    describe('listByParent', () => {
        it('should filter', () => {
            system.recruitMortal({ parentId: 'p1' });
            system.recruitMortal({ parentId: 'p2' });
            expect(system.listByParent('p1').length).toBe(1);
        });
        it('should return empty for unknown parent', () => {
            system.recruitMortal({ parentId: 'p1' });
            expect(system.listByParent('unknown')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { mortal } = system.recruitMortal({});
            system.legendMortal(mortal.mortalId);
            system.recruitMortal({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addLifespan', () => {
        it('should add lifespan', () => {
            const { mortal } = system.recruitMortal({});
            system.addLifespan(mortal.mortalId, 'Spring-1');
            expect(mortal.lifespans).toContain('Spring-1');
            expect(mortal.lifespans.length).toBe(1);
        });

        it('should add multiple lifespans', () => {
            const { mortal } = system.recruitMortal({});
            system.addLifespan(mortal.mortalId, 'Spring-1');
            system.addLifespan(mortal.mortalId, 'Summer-2');
            expect(mortal.lifespans.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addLifespan('ghost', 'Autumn-3');
            expect(result.error).toBe('MORTAL_NOT_FOUND');
        });

        it('should trigger lifespanAdded hook', () => {
            const { mortal } = system.recruitMortal({});
            let called = false;
            system.registerHook('lifespanAdded', () => { called = true; });
            system.addLifespan(mortal.mortalId, 'Winter-4');
            expect(called).toBe(true);
        });
    });

    describe('improveHealth', () => {
        it('should improve with amount', () => {
            const { mortal } = system.recruitMortal({});
            system.improveHealth(mortal.mortalId, 10);
            expect(mortal.health).toBe(30);
        });

        it('should improve with default', () => {
            const { mortal } = system.recruitMortal({});
            system.improveHealth(mortal.mortalId);
            expect(mortal.health).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.improveHealth('ghost', 10);
            expect(result.error).toBe('MORTAL_NOT_FOUND');
        });

        it('should trigger healthImproved hook', () => {
            const { mortal } = system.recruitMortal({});
            let called = false;
            system.registerHook('healthImproved', () => { called = true; });
            system.improveHealth(mortal.mortalId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMortal', () => {
        it('should level up', () => {
            const { mortal } = system.recruitMortal({});
            system.levelUpMortal(mortal.mortalId);
            expect(mortal.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { mortal } = system.recruitMortal({});
            for (let i = 0; i < 4; i++) system.levelUpMortal(mortal.mortalId);
            expect(mortal.level).toBe(5);
            expect(mortal.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpMortal('ghost');
            expect(result.error).toBe('MORTAL_NOT_FOUND');
        });

        it('should trigger mortalLeveledUp hook', () => {
            const { mortal } = system.recruitMortal({});
            let called = false;
            system.registerHook('mortalLeveledUp', () => { called = true; });
            system.levelUpMortal(mortal.mortalId);
            expect(called).toBe(true);
        });
    });

    describe('legendMortal', () => {
        it('should legendize', () => {
            const { mortal } = system.recruitMortal({});
            system.legendMortal(mortal.mortalId);
            expect(mortal.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMortal('ghost');
            expect(result.error).toBe('MORTAL_NOT_FOUND');
        });

        it('should trigger mortalLegendized hook', () => {
            const { mortal } = system.recruitMortal({});
            let called = false;
            system.registerHook('mortalLegendized', () => { called = true; });
            system.legendMortal(mortal.mortalId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMortalValue', () => {
        it('should calculate', () => {
            const { mortal } = system.recruitMortal({});
            system.levelUpMortal(mortal.mortalId);
            system.improveHealth(mortal.mortalId, 5);
            system.addLifespan(mortal.mortalId, 'Spring-1');
            // level=2, health=25, lifespans.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateMortalValue(mortal.mortalId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMortalValue('ghost')).toBe(0);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { mortal } = system.recruitMortal({});
            for (let i = 0; i < 4; i++) system.levelUpMortal(mortal.mortalId);
            system.recruitMortal({});
            expect(system.listVeterans().length).toBe(1);
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

        it('should execute default getMortal', () => {
            const result = system.executeTool('getMortal', { mortalId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mortalRecruited', () => count++);
            unregister();
            system.recruitMortal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mortalRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMortal({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMortals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMortals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMortal({});
            const json = system.toJSON();
            expect(json.mortals.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMortal({});
            const json = system.toJSON();
            const newSys = new CultivationMortal();
            newSys.fromJSON(json);
            expect(newSys.mortals.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mortalCount).toBe(0);
        });
    });
});
