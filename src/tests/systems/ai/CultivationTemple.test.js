/**
 * CultivationTemple.test.js - 修真神殿系统测试
 * V714 Iteration 7/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTemple } from '../../../systems/ai/CultivationTemple.js';

describe('CultivationTemple', () => {
    let system;
    beforeEach(() => { system = new CultivationTemple(); });

    describe('recruitTemple', () => {
        it('should recruit', () => {
            const { temple } = system.recruitTemple({ masterId: 'm1' });
            expect(temple.masterId).toBe('m1');
        });

        it('should default name to Unnamed Temple', () => {
            const { temple } = system.recruitTemple({ masterId: 'm1' });
            expect(temple.name).toBe('Unnamed Temple');
        });

        it('should default type to divine', () => {
            const { temple } = system.recruitTemple({ masterId: 'm1' });
            expect(temple.type).toBe('divine');
        });

        it('should default sanctity to baseSanctity', () => {
            const { temple } = system.recruitTemple({ masterId: 'm1' });
            expect(temple.sanctity).toBe(20);
        });

        it('should init altars to empty array', () => {
            const { temple } = system.recruitTemple({ masterId: 'm1' });
            expect(temple.altars).toEqual([]);
        });

        it('should default level to 1', () => {
            const { temple } = system.recruitTemple({ masterId: 'm1' });
            expect(temple.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { temple } = system.recruitTemple({ masterId: 'm1' });
            expect(temple.status).toBe('novice');
        });

        it('should accept custom fields', () => {
            const { temple } = system.recruitTemple({ templeId: 't1', masterId: 'm1', name: 'Jade Temple', type: 'celestial', sanctity: 99, level: 3, status: 'veteran' });
            expect(temple.templeId).toBe('t1');
            expect(temple.name).toBe('Jade Temple');
            expect(temple.type).toBe('celestial');
            expect(temple.sanctity).toBe(99);
            expect(temple.level).toBe(3);
            expect(temple.status).toBe('veteran');
        });

        it('should trigger templeRecruited hook', () => {
            let called = false;
            system.registerHook('templeRecruited', () => { called = true; });
            system.recruitTemple({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseSanctity', () => {
            const customSys = new CultivationTemple({ baseSanctity: 50 });
            const { temple } = customSys.recruitTemple({});
            expect(temple.sanctity).toBe(50);
        });
    });

    describe('getTemple', () => {
        it('should return', () => {
            const { temple } = system.recruitTemple({});
            expect(system.getTemple(temple.templeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTemple('ghost')).toBeNull(); });
    });

    describe('listTemples', () => {
        it('should list all', () => {
            system.recruitTemple({});
            system.recruitTemple({});
            expect(system.listTemples().length).toBe(2);
        });
        it('should return empty array when none', () => {
            expect(system.listTemples()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitTemple({ masterId: 'm1' });
            system.recruitTemple({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            system.recruitTemple({ masterId: 'm1' });
            expect(system.listByMaster('unknown')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const a = system.recruitTemple({ masterId: 'm1' });
            const b = system.recruitTemple({ masterId: 'm1' });
            system.legendTemple(b.temple.templeId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addAltar', () => {
        it('should add altar', () => {
            const { temple } = system.recruitTemple({});
            const result = system.addAltar(temple.templeId, { name: 'Main Altar' });
            expect(result.success).toBe(true);
            expect(result.temple.altars.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addAltar('ghost', { name: 'X' });
            expect(result.error).toBe('TEMPLE_NOT_FOUND');
        });

        it('should trigger altarAdded hook', () => {
            const { temple } = system.recruitTemple({});
            let called = false;
            system.registerHook('altarAdded', () => { called = true; });
            system.addAltar(temple.templeId, { name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('raiseSanctity', () => {
        it('should raise', () => {
            const { temple } = system.recruitTemple({});
            system.raiseSanctity(temple.templeId, 10);
            expect(temple.sanctity).toBe(30);
        });

        it('should default amount to 5', () => {
            const { temple } = system.recruitTemple({});
            system.raiseSanctity(temple.templeId);
            expect(temple.sanctity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseSanctity('ghost', 10);
            expect(result.error).toBe('TEMPLE_NOT_FOUND');
        });

        it('should trigger sanctityRaised hook', () => {
            const { temple } = system.recruitTemple({});
            let called = false;
            system.registerHook('sanctityRaised', () => { called = true; });
            system.raiseSanctity(temple.templeId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTemple', () => {
        it('should level up', () => {
            const { temple } = system.recruitTemple({});
            system.levelUpTemple(temple.templeId);
            expect(temple.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpTemple('ghost');
            expect(result.error).toBe('TEMPLE_NOT_FOUND');
        });

        it('should trigger templeLeveledUp hook', () => {
            const { temple } = system.recruitTemple({});
            let called = false;
            system.registerHook('templeLeveledUp', () => { called = true; });
            system.levelUpTemple(temple.templeId);
            expect(called).toBe(true);
        });
    });

    describe('legendTemple', () => {
        it('should set status to legendary', () => {
            const { temple } = system.recruitTemple({});
            system.legendTemple(temple.templeId);
            expect(temple.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendTemple('ghost');
            expect(result.error).toBe('TEMPLE_NOT_FOUND');
        });

        it('should trigger templeLegendized hook', () => {
            const { temple } = system.recruitTemple({});
            let called = false;
            system.registerHook('templeLegendized', () => { called = true; });
            system.legendTemple(temple.templeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTempleValue', () => {
        it('should calculate value', () => {
            const { temple } = system.recruitTemple({});
            system.addAltar(temple.templeId, { name: 'A1' });
            system.addAltar(temple.templeId, { name: 'A2' });
            // level=1, sanctity=20, altars=2 => 1*100 + 20*2 + 2*30 = 100 + 40 + 60 = 200
            expect(system.calculateTempleValue(temple.templeId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTempleValue('ghost')).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitTemple({ type: 'divine' });
            system.recruitTemple({ type: 'celestial' });
            system.recruitTemple({ type: 'celestial' });
            expect(system.listByType('celestial').length).toBe(2);
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

        it('should execute default getTemple', () => {
            const result = system.executeTool('getTemple', { templeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('templeRecruited', () => count++);
            unregister();
            system.recruitTemple({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('templeRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTemple({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTemples = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTemples = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTemple({});
            const json = system.toJSON();
            expect(json.temples.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTemple({});
            const json = system.toJSON();
            const newSys = new CultivationTemple();
            newSys.fromJSON(json);
            expect(newSys.temples.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.templeCount).toBe(0);
        });
    });
});
