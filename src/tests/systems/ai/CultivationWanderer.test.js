/**
 * CultivationWanderer.test.js - 修真游侠测试
 * V654 Iteration 7/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWanderer } from '../../../systems/ai/CultivationWanderer.js';

describe('CultivationWanderer', () => {
    let system;
    beforeEach(() => { system = new CultivationWanderer(); });

    describe('recruitWanderer', () => {
        it('should recruit with masterId', () => {
            const { wanderer } = system.recruitWanderer({ masterId: 'm1' });
            expect(wanderer.masterId).toBe('m1');
        });

        it('should default type to nomad', () => {
            const { wanderer } = system.recruitWanderer({ masterId: 'm1' });
            expect(wanderer.type).toBe('nomad');
        });

        it('should default freedom to baseFreedom (20)', () => {
            const { wanderer } = system.recruitWanderer({ masterId: 'm1' });
            expect(wanderer.freedom).toBe(20);
        });

        it('should set initial level to 1', () => {
            const { wanderer } = system.recruitWanderer({ masterId: 'm1' });
            expect(wanderer.level).toBe(1);
        });

        it('should set initial status to novice', () => {
            const { wanderer } = system.recruitWanderer({ masterId: 'm1' });
            expect(wanderer.status).toBe('novice');
        });

        it('should trigger wandererRecruited hook', () => {
            let called = false;
            system.registerHook('wandererRecruited', () => { called = true; });
            system.recruitWanderer({});
            expect(called).toBe(true);
        });
    });

    describe('getWanderer', () => {
        it('should return', () => {
            const { wanderer } = system.recruitWanderer({});
            expect(system.getWanderer(wanderer.wandererId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWanderer('ghost')).toBeNull(); });
    });

    describe('listWanderers', () => {
        it('should list all', () => {
            system.recruitWanderer({});
            system.recruitWanderer({});
            expect(system.listWanderers().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitWanderer({ masterId: 'm1' });
            system.recruitWanderer({ masterId: 'm2' });
            system.recruitWanderer({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitWanderer({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter by legendary status', () => {
            const { wanderer: w1 } = system.recruitWanderer({});
            const { wanderer: w2 } = system.recruitWanderer({});
            system.legendWanderer(w1.wandererId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addPath', () => {
        it('should add path', () => {
            const { wanderer } = system.recruitWanderer({});
            const result = system.addPath(wanderer.wandererId, 'mountain');
            expect(wanderer.paths).toContain('mountain');
        });

        it('should reject missing wanderer', () => {
            const result = system.addPath('ghost', 'mountain');
            expect(result.error).toBe('WANDERER_NOT_FOUND');
        });

        it('should reject duplicate path', () => {
            const { wanderer } = system.recruitWanderer({});
            system.addPath(wanderer.wandererId, 'mountain');
            const result = system.addPath(wanderer.wandererId, 'mountain');
            expect(result.error).toBe('PATH_ALREADY_ADDED');
        });

        it('should trigger pathAdded hook', () => {
            const { wanderer } = system.recruitWanderer({});
            let called = false;
            system.registerHook('pathAdded', () => { called = true; });
            system.addPath(wanderer.wandererId, 'forest');
            expect(called).toBe(true);
        });
    });

    describe('expandFreedom', () => {
        it('should expand by default amount (5)', () => {
            const { wanderer } = system.recruitWanderer({});
            const result = system.expandFreedom(wanderer.wandererId);
            expect(wanderer.freedom).toBe(25);
        });

        it('should expand by custom amount', () => {
            const { wanderer } = system.recruitWanderer({});
            system.expandFreedom(wanderer.wandererId, 30);
            expect(wanderer.freedom).toBe(50);
        });

        it('should reject missing wanderer', () => {
            const result = system.expandFreedom('ghost', 10);
            expect(result.error).toBe('WANDERER_NOT_FOUND');
        });

        it('should trigger freedomExpanded hook', () => {
            const { wanderer } = system.recruitWanderer({});
            let called = false;
            system.registerHook('freedomExpanded', () => { called = true; });
            system.expandFreedom(wanderer.wandererId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWanderer', () => {
        it('should level up', () => {
            const { wanderer } = system.recruitWanderer({});
            system.levelUpWanderer(wanderer.wandererId);
            expect(wanderer.level).toBe(2);
        });

        it('should reject missing wanderer', () => {
            const result = system.levelUpWanderer('ghost');
            expect(result.error).toBe('WANDERER_NOT_FOUND');
        });

        it('should trigger wandererLeveledUp hook', () => {
            const { wanderer } = system.recruitWanderer({});
            let called = false;
            system.registerHook('wandererLeveledUp', () => { called = true; });
            system.levelUpWanderer(wanderer.wandererId);
            expect(called).toBe(true);
        });
    });

    describe('legendWanderer', () => {
        it('should set status to legendary', () => {
            const { wanderer } = system.recruitWanderer({});
            system.legendWanderer(wanderer.wandererId);
            expect(wanderer.status).toBe('legendary');
        });

        it('should reject missing wanderer', () => {
            const result = system.legendWanderer('ghost');
            expect(result.error).toBe('WANDERER_NOT_FOUND');
        });

        it('should trigger wandererLegendized hook', () => {
            const { wanderer } = system.recruitWanderer({});
            let called = false;
            system.registerHook('wandererLegendized', () => { called = true; });
            system.legendWanderer(wanderer.wandererId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWandererValue', () => {
        it('should calculate value', () => {
            const { wanderer } = system.recruitWanderer({});
            system.addPath(wanderer.wandererId, 'p1');
            system.addPath(wanderer.wandererId, 'p2');
            // level 1 * 100 + freedom 20 * 2 + paths 2 * 30 = 100 + 40 + 60 = 200
            expect(system.calculateWandererValue(wanderer.wandererId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWandererValue('ghost')).toBe(0);
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

        it('should execute default recruitWanderer tool', () => {
            const result = system.executeTool('recruitWanderer', { masterId: 'm1' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('wandererRecruited', () => count++);
            unregister();
            system.recruitWanderer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('wandererRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitWanderer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWanderers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWanderers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitWanderer({});
            const json = system.toJSON();
            expect(json.wanderers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitWanderer({});
            const json = system.toJSON();
            const newSys = new CultivationWanderer();
            newSys.fromJSON(json);
            expect(newSys.wanderers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.wandererCount).toBe(0);
        });
    });
});
