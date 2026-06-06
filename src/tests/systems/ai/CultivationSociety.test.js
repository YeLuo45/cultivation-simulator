/**
 * CultivationSociety.test.js - 修真会测试
 * V553 Iteration 16/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSociety } from '../../../systems/ai/CultivationSociety.js';

describe('CultivationSociety', () => {
    let system;
    beforeEach(() => { system = new CultivationSociety(); });

    describe('openSociety', () => {
        it('should open', () => {
            const { society } = system.openSociety({ founderId: 'f1', name: '青莲学社' });
            expect(society.founderId).toBe('f1');
            expect(society.name).toBe('青莲学社');
        });

        it('should default name', () => {
            const { society } = system.openSociety({});
            expect(society.name).toBe('无名修真会');
        });

        it('should default type learner', () => {
            const { society } = system.openSociety({});
            expect(society.type).toBe('learner');
        });

        it('should accept research type', () => {
            const { society } = system.openSociety({ type: 'research' });
            expect(society.type).toBe('research');
        });

        it('should accept compassion type', () => {
            const { society } = system.openSociety({ type: 'compassion' });
            expect(society.type).toBe('compassion');
        });

        it('should default prestige', () => {
            const { society } = system.openSociety({});
            expect(society.prestige).toBe(20);
        });

        it('should accept custom prestige', () => {
            const { society } = system.openSociety({ prestige: 100 });
            expect(society.prestige).toBe(100);
        });

        it('should initialize scholars empty', () => {
            const { society } = system.openSociety({});
            expect(society.scholars).toEqual([]);
        });

        it('should accept scholars array', () => {
            const { society } = system.openSociety({ scholars: [{ id: 's1' }] });
            expect(society.scholars.length).toBe(1);
        });

        it('should initialize level 1', () => {
            const { society } = system.openSociety({});
            expect(society.level).toBe(1);
        });

        it('should default status forming', () => {
            const { society } = system.openSociety({});
            expect(society.status).toBe('forming');
        });

        it('should trigger societyOpened hook', () => {
            let called = false;
            system.registerHook('societyOpened', () => { called = true; });
            system.openSociety({});
            expect(called).toBe(true);
        });
    });

    describe('getSociety', () => {
        it('should return', () => {
            const { society } = system.openSociety({});
            expect(system.getSociety(society.societyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSociety('ghost')).toBeNull(); });
    });

    describe('listSocieties', () => {
        it('should list all', () => {
            system.openSociety({});
            system.openSociety({});
            expect(system.listSocieties().length).toBe(2);
        });

        it('should return empty', () => {
            expect(system.listSocieties().length).toBe(0);
        });
    });

    describe('listByFounder', () => {
        it('should filter', () => {
            system.openSociety({ founderId: 'f1' });
            system.openSociety({ founderId: 'f2' });
            expect(system.listByFounder('f1').length).toBe(1);
        });

        it('should return empty for missing founder', () => {
            system.openSociety({ founderId: 'f1' });
            expect(system.listByFounder('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter active', () => {
            const { society: s1 } = system.openSociety({});
            const { society: s2 } = system.openSociety({});
            s1.status = 'active';
            expect(system.listActive().length).toBe(1);
        });

        it('should include renowned', () => {
            const { society: s1 } = system.openSociety({});
            const { society: s2 } = system.openSociety({});
            s1.status = 'renowned';
            s2.status = 'forming';
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('addScholar', () => {
        it('should add', () => {
            const { society } = system.openSociety({});
            const result = system.addScholar(society.societyId, { id: 's1', name: 'Scholar1' });
            expect(result.success).toBe(true);
            expect(society.scholars.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addScholar('ghost', { id: 's1' });
            expect(result.error).toBe('SOCIETY_NOT_FOUND');
        });

        it('should trigger scholarAdded hook', () => {
            const { society } = system.openSociety({});
            let called = false;
            system.registerHook('scholarAdded', () => { called = true; });
            system.addScholar(society.societyId, { id: 's1' });
            expect(called).toBe(true);
        });
    });

    describe('increasePrestige', () => {
        it('should increase by default', () => {
            const { society } = system.openSociety({});
            system.increasePrestige(society.societyId);
            expect(society.prestige).toBe(25);
        });

        it('should increase custom amount', () => {
            const { society } = system.openSociety({});
            system.increasePrestige(society.societyId, 30);
            expect(society.prestige).toBe(50);
        });

        it('should promote forming to active at 50', () => {
            const { society } = system.openSociety({ prestige: 30 });
            system.increasePrestige(society.societyId, 30);
            expect(society.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.increasePrestige('ghost', 10);
            expect(result.error).toBe('SOCIETY_NOT_FOUND');
        });

        it('should trigger prestigeIncreased hook', () => {
            const { society } = system.openSociety({});
            let called = false;
            system.registerHook('prestigeIncreased', () => { called = true; });
            system.increasePrestige(society.societyId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSociety', () => {
        it('should level up', () => {
            const { society } = system.openSociety({});
            system.levelUpSociety(society.societyId);
            expect(society.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { society } = system.openSociety({});
            system.levelUpSociety(society.societyId);
            system.levelUpSociety(society.societyId);
            expect(society.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpSociety('ghost');
            expect(result.error).toBe('SOCIETY_NOT_FOUND');
        });

        it('should trigger societyLeveledUp hook', () => {
            const { society } = system.openSociety({});
            let called = false;
            system.registerHook('societyLeveledUp', () => { called = true; });
            system.levelUpSociety(society.societyId);
            expect(called).toBe(true);
        });
    });

    describe('renownedSociety', () => {
        it('should set renowned', () => {
            const { society } = system.openSociety({});
            system.renownedSociety(society.societyId);
            expect(society.status).toBe('renowned');
        });

        it('should reject missing', () => {
            const result = system.renownedSociety('ghost');
            expect(result.error).toBe('SOCIETY_NOT_FOUND');
        });

        it('should trigger societyRenowned hook', () => {
            const { society } = system.openSociety({});
            let called = false;
            system.registerHook('societyRenowned', () => { called = true; });
            system.renownedSociety(society.societyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSocietyPower', () => {
        it('should calculate', () => {
            const { society } = system.openSociety({ scholars: [{ id: 's1' }, { id: 's2' }] });
            const power = system.calculateSocietyPower(society.societyId);
            expect(power).toBe(1 * 100 + 20 * 2 + 2 * 30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSocietyPower('ghost')).toBe(0);
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

        it('should execute default getSociety', () => {
            const result = system.executeTool('getSociety', { societyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('societyOpened', () => count++);
            unregister();
            system.openSociety({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('societyOpened', () => { throw new Error('x'); });
            expect(() => system.openSociety({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSocieties = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSocieties = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openSociety({});
            const json = system.toJSON();
            expect(json.societies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openSociety({});
            const json = system.toJSON();
            const newSys = new CultivationSociety();
            newSys.fromJSON(json);
            expect(newSys.societies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.societyCount).toBe(0);
        });
    });
});
