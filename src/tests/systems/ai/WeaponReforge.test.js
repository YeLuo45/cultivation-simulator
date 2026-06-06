/**
 * WeaponReforge.test.js - 武器重铸系统测试
 * V508 Iteration 10/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WeaponReforge } from '../../../systems/ai/WeaponReforge.js';

describe('WeaponReforge', () => {
    let system;
    beforeEach(() => { system = new WeaponReforge(); });

    describe('startReforge', () => {
        it('should create reforge', () => {
            const { reforge } = system.startReforge({ smithId: 's1', weaponName: 'Iron Sword' });
            expect(reforge.smithId).toBe('s1');
            expect(reforge.weaponName).toBe('Iron Sword');
        });

        it('should set defaults', () => {
            const { reforge } = system.startReforge({});
            expect(reforge.status).toBe('broken');
            expect(reforge.materials).toEqual([]);
            expect(reforge.level).toBe(1);
            expect(reforge.originalPower).toBe(50);
        });

        it('should trigger reforgeStarted hook', () => {
            let called = false;
            system.registerHook('reforgeStarted', () => { called = true; });
            system.startReforge({});
            expect(called).toBe(true);
        });
    });

    describe('getReforge', () => {
        it('should return reforge', () => {
            const { reforge } = system.startReforge({});
            expect(system.getReforge(reforge.reforgeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getReforge('ghost')).toBeNull(); });
    });

    describe('listReforges', () => {
        it('should list all', () => {
            system.startReforge({});
            system.startReforge({});
            expect(system.listReforges().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listReforges().length).toBe(0);
        });
    });

    describe('listBySmith', () => {
        it('should filter by smith', () => {
            system.startReforge({ smithId: 's1' });
            system.startReforge({ smithId: 's2' });
            expect(system.listBySmith('s1').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should exclude cooled', () => {
            const { reforge } = system.startReforge({});
            system.coolWeapon(reforge.reforgeId);
            expect(system.listActive().length).toBe(0);
        });

        it('should include non-cooled', () => {
            system.startReforge({});
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('addMaterial', () => {
        it('should add material', () => {
            const { reforge } = system.startReforge({});
            system.addMaterial(reforge.reforgeId, 'iron');
            expect(reforge.materials.length).toBe(1);
            expect(reforge.materials[0]).toBe('iron');
        });

        it('should reject missing', () => {
            const result = system.addMaterial('ghost', 'iron');
            expect(result.error).toBe('REFORGE_NOT_FOUND');
        });

        it('should trigger materialAdded hook', () => {
            const { reforge } = system.startReforge({});
            let called = false;
            system.registerHook('materialAdded', () => { called = true; });
            system.addMaterial(reforge.reforgeId, 'iron');
            expect(called).toBe(true);
        });
    });

    describe('increaseLevel', () => {
        it('should increase by default 5', () => {
            const { reforge } = system.startReforge({});
            system.increaseLevel(reforge.reforgeId);
            expect(reforge.level).toBe(6);
        });

        it('should increase by custom amount', () => {
            const { reforge } = system.startReforge({});
            system.increaseLevel(reforge.reforgeId, 10);
            expect(reforge.level).toBe(11);
        });

        it('should reject missing', () => {
            const result = system.increaseLevel('ghost', 5);
            expect(result.error).toBe('REFORGE_NOT_FOUND');
        });
    });

    describe('meltWeapon', () => {
        it('should set status to melting', () => {
            const { reforge } = system.startReforge({});
            system.meltWeapon(reforge.reforgeId);
            expect(reforge.status).toBe('melting');
        });

        it('should reject missing', () => {
            const result = system.meltWeapon('ghost');
            expect(result.error).toBe('REFORGE_NOT_FOUND');
        });

        it('should trigger weaponMelted hook', () => {
            const { reforge } = system.startReforge({});
            let called = false;
            system.registerHook('weaponMelted', () => { called = true; });
            system.meltWeapon(reforge.reforgeId);
            expect(called).toBe(true);
        });
    });

    describe('coolWeapon', () => {
        it('should set status to cooled', () => {
            const { reforge } = system.startReforge({});
            system.coolWeapon(reforge.reforgeId);
            expect(reforge.status).toBe('cooled');
        });

        it('should reject missing', () => {
            const result = system.coolWeapon('ghost');
            expect(result.error).toBe('REFORGE_NOT_FOUND');
        });

        it('should trigger weaponCooled hook', () => {
            const { reforge } = system.startReforge({});
            let called = false;
            system.registerHook('weaponCooled', () => { called = true; });
            system.coolWeapon(reforge.reforgeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateReforgePower', () => {
        it('should calculate power', () => {
            const { reforge } = system.startReforge({ originalPower: 100 });
            system.increaseLevel(reforge.reforgeId, 2);
            system.addMaterial(reforge.reforgeId, 'iron');
            system.addMaterial(reforge.reforgeId, 'jade');
            // 100 + (1+2)*10 + 2*5 = 100 + 30 + 10 = 140
            expect(system.calculateReforgePower(reforge.reforgeId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateReforgePower('ghost')).toBe(0);
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

        it('should execute default getReforge', () => {
            const result = system.executeTool('getReforge', { reforgeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('reforgeStarted', () => count++);
            unregister();
            system.startReforge({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('reforgeStarted', () => { throw new Error('x'); });
            expect(() => system.startReforge({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalReforges = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalReforges = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startReforge({});
            const json = system.toJSON();
            expect(json.reforges.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startReforge({});
            const json = system.toJSON();
            const newSys = new WeaponReforge();
            newSys.fromJSON(json);
            expect(newSys.reforges.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.reforgeCount).toBe(0);
        });
    });
});
