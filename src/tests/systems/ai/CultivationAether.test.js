/**
 * CultivationAether.test.js - 修真以太测试
 * V725 Iteration 18/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAether } from '../../../systems/ai/CultivationAether.js';

describe('CultivationAether', () => {
    let system;
    beforeEach(() => { system = new CultivationAether(); });

    describe('recruitAether', () => {
        it('should create an aether', () => {
            const { aether } = system.recruitAether({ masterId: 'm1', name: 'Stellar Veil', type: 'cosmic' });
            expect(aether.masterId).toBe('m1');
            expect(aether.name).toBe('Stellar Veil');
            expect(aether.type).toBe('cosmic');
        });

        it('should default name to Cultivation Aether', () => {
            const { aether } = system.recruitAether({});
            expect(aether.name).toBe('Cultivation Aether');
        });

        it('should default type to celestial', () => {
            const { aether } = system.recruitAether({});
            expect(aether.type).toBe('celestial');
        });

        it('should default essence to baseEssence (20)', () => {
            const { aether } = system.recruitAether({});
            expect(aether.essence).toBe(20);
        });

        it('should default currents to empty array', () => {
            const { aether } = system.recruitAether({});
            expect(aether.currents).toEqual([]);
        });

        it('should default level to 1', () => {
            const { aether } = system.recruitAether({});
            expect(aether.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { aether } = system.recruitAether({});
            expect(aether.status).toBe('novice');
        });

        it('should accept void type', () => {
            const { aether } = system.recruitAether({ type: 'void' });
            expect(aether.type).toBe('void');
        });

        it('should accept veteran status', () => {
            const { aether } = system.recruitAether({ status: 'veteran' });
            expect(aether.status).toBe('veteran');
        });

        it('should use provided id', () => {
            const { aether } = system.recruitAether({ id: 'my_id' });
            expect(aether.aetherId).toBe('my_id');
        });

        it('should accept custom currents', () => {
            const currents = [{ id: 'c1' }, { id: 'c2' }];
            const { aether } = system.recruitAether({ currents });
            expect(aether.currents).toEqual(currents);
        });

        it('should accept custom essence', () => {
            const { aether } = system.recruitAether({ essence: 100 });
            expect(aether.essence).toBe(100);
        });

        it('should accept essence=0 (falsy check)', () => {
            const { aether } = system.recruitAether({ essence: 0 });
            expect(aether.essence).toBe(0);
        });

        it('should trigger aetherRecruited hook', () => {
            let called = false;
            system.registerHook('aetherRecruited', () => { called = true; });
            system.recruitAether({});
            expect(called).toBe(true);
        });
    });

    describe('getAether', () => {
        it('should return aether', () => {
            const { aether } = system.recruitAether({});
            expect(system.getAether(aether.aetherId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAether('ghost')).toBeNull(); });
    });

    describe('listAethers', () => {
        it('should list all', () => {
            system.recruitAether({});
            expect(system.listAethers().length).toBe(1);
        });

        it('should return empty list when no aethers', () => {
            expect(system.listAethers().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitAether({ masterId: 'm1' });
            system.recruitAether({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitAether({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary status', () => {
            system.recruitAether({});
            system.recruitAether({ status: 'legendary' });
            system.recruitAether({ status: 'legendary' });
            expect(system.listLegendary().length).toBe(2);
        });

        it('should return empty when no legendary', () => {
            system.recruitAether({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addCurrent', () => {
        it('should add a current', () => {
            const { aether } = system.recruitAether({});
            system.addCurrent(aether.aetherId, { id: 'c1', flow: 'swift' });
            expect(aether.currents.length).toBe(1);
            expect(aether.currents[0].id).toBe('c1');
        });

        it('should accumulate currents', () => {
            const { aether } = system.recruitAether({});
            system.addCurrent(aether.aetherId, { id: 'c1' });
            system.addCurrent(aether.aetherId, { id: 'c2' });
            system.addCurrent(aether.aetherId, { id: 'c3' });
            expect(aether.currents.length).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.addCurrent('ghost', { id: 'c1' });
            expect(result.error).toBe('AETHER_NOT_FOUND');
        });

        it('should trigger currentAdded hook', () => {
            const { aether } = system.recruitAether({});
            let called = false;
            system.registerHook('currentAdded', () => { called = true; });
            system.addCurrent(aether.aetherId, { id: 'c1' });
            expect(called).toBe(true);
        });
    });

    describe('raiseEssence', () => {
        it('should raise essence', () => {
            const { aether } = system.recruitAether({});
            system.raiseEssence(aether.aetherId, 10);
            expect(aether.essence).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { aether } = system.recruitAether({});
            system.raiseEssence(aether.aetherId);
            expect(aether.essence).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseEssence('ghost', 10);
            expect(result.error).toBe('AETHER_NOT_FOUND');
        });

        it('should trigger essenceRaised hook', () => {
            const { aether } = system.recruitAether({});
            let called = false;
            system.registerHook('essenceRaised', () => { called = true; });
            system.raiseEssence(aether.aetherId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAether', () => {
        it('should level up', () => {
            const { aether } = system.recruitAether({});
            system.levelUpAether(aether.aetherId);
            expect(aether.level).toBe(2);
        });

        it('should accumulate level', () => {
            const { aether } = system.recruitAether({});
            system.levelUpAether(aether.aetherId);
            system.levelUpAether(aether.aetherId);
            system.levelUpAether(aether.aetherId);
            expect(aether.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpAether('ghost');
            expect(result.error).toBe('AETHER_NOT_FOUND');
        });

        it('should trigger aetherLeveledUp hook', () => {
            const { aether } = system.recruitAether({});
            let called = false;
            system.registerHook('aetherLeveledUp', () => { called = true; });
            system.levelUpAether(aether.aetherId);
            expect(called).toBe(true);
        });
    });

    describe('legendAether', () => {
        it('should set status to legendary', () => {
            const { aether } = system.recruitAether({});
            system.legendAether(aether.aetherId);
            expect(aether.status).toBe('legendary');
        });

        it('should override veteran status', () => {
            const { aether } = system.recruitAether({ status: 'veteran' });
            system.legendAether(aether.aetherId);
            expect(aether.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendAether('ghost');
            expect(result.error).toBe('AETHER_NOT_FOUND');
        });

        it('should trigger aetherLegendized hook', () => {
            const { aether } = system.recruitAether({});
            let called = false;
            system.registerHook('aetherLegendized', () => { called = true; });
            system.legendAether(aether.aetherId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAetherValue', () => {
        it('should calculate with default values', () => {
            const { aether } = system.recruitAether({});
            // level=1, essence=20, currents=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateAetherValue(aether.aetherId)).toBe(140);
        });

        it('should reflect level changes', () => {
            const { aether } = system.recruitAether({});
            system.levelUpAether(aether.aetherId);
            system.levelUpAether(aether.aetherId);
            // level=3, essence=20, currents=0 -> 3*100 + 20*2 + 0*30 = 340
            expect(system.calculateAetherValue(aether.aetherId)).toBe(340);
        });

        it('should reflect essence changes', () => {
            const { aether } = system.recruitAether({});
            system.raiseEssence(aether.aetherId, 30);
            // level=1, essence=50, currents=0 -> 1*100 + 50*2 + 0*30 = 200
            expect(system.calculateAetherValue(aether.aetherId)).toBe(200);
        });

        it('should reflect currents changes', () => {
            const { aether } = system.recruitAether({});
            system.addCurrent(aether.aetherId, { id: 'c1' });
            system.addCurrent(aether.aetherId, { id: 'c2' });
            // level=1, essence=20, currents=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateAetherValue(aether.aetherId)).toBe(200);
        });

        it('should reflect all changes combined', () => {
            const { aether } = system.recruitAether({});
            system.levelUpAether(aether.aetherId);
            system.raiseEssence(aether.aetherId, 10);
            system.addCurrent(aether.aetherId, { id: 'c1' });
            // level=2, essence=30, currents=1 -> 2*100 + 30*2 + 1*30 = 290
            expect(system.calculateAetherValue(aether.aetherId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAetherValue('ghost')).toBe(0);
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

        it('should execute default getAether', () => {
            const result = system.executeTool('getAether', { aetherId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitAether', () => {
            const result = system.executeTool('recruitAether', { masterId: 'm1' });
            expect(result.success).toBe(true);
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('aetherRecruited', () => count++);
            unregister();
            system.recruitAether({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('aetherRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAether({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAethers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAethers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAether({});
            const json = system.toJSON();
            expect(json.aethers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAether({});
            const json = system.toJSON();
            const newSys = new CultivationAether();
            newSys.fromJSON(json);
            expect(newSys.aethers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.aetherCount).toBe(0);
        });

        it('should include aetherCount after recruit', () => {
            system.recruitAether({});
            const stats = system.getStats();
            expect(stats.aetherCount).toBe(1);
            expect(stats.totalAethers).toBe(1);
        });
    });
});
