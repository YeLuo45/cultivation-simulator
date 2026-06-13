/**
 * CultivationHex.test.js - 修真邪术系统测试
 * V705 Iteration 10/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHex } from '../../../systems/ai/CultivationHex.js';

describe('CultivationHex', () => {
    let system;
    beforeEach(() => { system = new CultivationHex(); });

    describe('recruitHex', () => {
        it('should recruit', () => {
            const { hex } = system.recruitHex({ masterId: 'm1', name: 'Blood Curse' });
            expect(hex.masterId).toBe('m1');
            expect(hex.name).toBe('Blood Curse');
        });

        it('should use default type and corruption', () => {
            const { hex } = system.recruitHex({});
            expect(hex.type).toBe('blood');
            expect(hex.corruption).toBe(20);
        });

        it('should accept shadow type', () => {
            const { hex } = system.recruitHex({ type: 'shadow' });
            expect(hex.type).toBe('shadow');
        });

        it('should accept poison type', () => {
            const { hex } = system.recruitHex({ type: 'poison' });
            expect(hex.type).toBe('poison');
        });

        it('should reject when max reached', () => {
            const small = new CultivationHex({ maxHexes: 1 });
            small.recruitHex({});
            const result = small.recruitHex({});
            expect(result.error).toBe('MAX_HEXES_REACHED');
        });

        it('should trigger hexRecruited hook', () => {
            let called = false;
            system.registerHook('hexRecruited', () => { called = true; });
            system.recruitHex({});
            expect(called).toBe(true);
        });

        it('should set initial status to novice and level 1', () => {
            const { hex } = system.recruitHex({});
            expect(hex.status).toBe('novice');
            expect(hex.level).toBe(1);
        });

        it('should accept custom corruption including 0', () => {
            const { hex } = system.recruitHex({ corruption: 0 });
            expect(hex.corruption).toBe(0);
        });

        it('should accept custom master and victims', () => {
            const { hex } = system.recruitHex({ masterId: 'master42', victims: [{ name: 'init' }] });
            expect(hex.masterId).toBe('master42');
            expect(hex.victims.length).toBe(1);
        });

        it('should generate a unique hexId when not provided', () => {
            const a = system.recruitHex({});
            const b = system.recruitHex({});
            expect(a.hex.hexId).not.toBe(b.hex.hexId);
        });
    });

    describe('getHex', () => {
        it('should return', () => {
            const { hex } = system.recruitHex({});
            expect(system.getHex(hex.hexId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHex('ghost')).toBeNull(); });
        it('should return a copy not the original reference', () => {
            const { hex } = system.recruitHex({});
            const fetched = system.getHex(hex.hexId);
            expect(fetched).not.toBe(hex);
        });
    });

    describe('listHexes', () => {
        it('should list all', () => {
            system.recruitHex({});
            system.recruitHex({});
            expect(system.listHexes().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listHexes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitHex({ masterId: 'm1' });
            system.recruitHex({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            system.recruitHex({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { hex: h1 } = system.recruitHex({});
            const { hex: h2 } = system.recruitHex({});
            system.legendHex(h1.hexId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].hexId).toBe(h1.hexId);
        });
        it('should return empty when none legendary', () => {
            system.recruitHex({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addVictim', () => {
        it('should add victim', () => {
            const { hex } = system.recruitHex({});
            system.addVictim(hex.hexId, { name: 'Cult1' });
            expect(hex.victims.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addVictim('ghost', {});
            expect(result.error).toBe('HEX_NOT_FOUND');
        });

        it('should trigger victimAdded hook', () => {
            const { hex } = system.recruitHex({});
            let called = false;
            system.registerHook('victimAdded', () => { called = true; });
            system.addVictim(hex.hexId, { name: 'Cult' });
            expect(called).toBe(true);
        });
    });

    describe('raiseCorruption', () => {
        it('should raise corruption', () => {
            const { hex } = system.recruitHex({});
            system.raiseCorruption(hex.hexId, 10);
            expect(hex.corruption).toBe(30);
        });

        it('should use default amount', () => {
            const { hex } = system.recruitHex({});
            system.raiseCorruption(hex.hexId);
            expect(hex.corruption).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseCorruption('ghost', 5);
            expect(result.error).toBe('HEX_NOT_FOUND');
        });

        it('should trigger corruptionRaised hook', () => {
            const { hex } = system.recruitHex({});
            let called = false;
            system.registerHook('corruptionRaised', () => { called = true; });
            system.raiseCorruption(hex.hexId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHex', () => {
        it('should level up', () => {
            const { hex } = system.recruitHex({});
            system.levelUpHex(hex.hexId);
            expect(hex.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpHex('ghost');
            expect(result.error).toBe('HEX_NOT_FOUND');
        });

        it('should trigger hexLeveledUp hook', () => {
            const { hex } = system.recruitHex({});
            let called = false;
            system.registerHook('hexLeveledUp', () => { called = true; });
            system.levelUpHex(hex.hexId);
            expect(called).toBe(true);
        });
    });

    describe('legendHex', () => {
        it('should legendize', () => {
            const { hex } = system.recruitHex({});
            system.legendHex(hex.hexId);
            expect(hex.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHex('ghost');
            expect(result.error).toBe('HEX_NOT_FOUND');
        });

        it('should trigger hexLegendized hook', () => {
            const { hex } = system.recruitHex({});
            let called = false;
            system.registerHook('hexLegendized', () => { called = true; });
            system.legendHex(hex.hexId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHexValue', () => {
        it('should calculate', () => {
            const { hex } = system.recruitHex({});
            system.levelUpHex(hex.hexId);
            system.raiseCorruption(hex.hexId, 5);
            system.addVictim(hex.hexId, { name: 'victim' });
            const value = system.calculateHexValue(hex.hexId);
            expect(value).toBe(2 * 100 + 25 * 2 + 1 * 30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHexValue('ghost')).toBe(0);
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

        it('should execute tool with undefined context', () => {
            system.registerTool('nocontext', (ctx) => ctx);
            const result = system.executeTool('nocontext');
            expect(result.success).toBe(true);
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

        it('should execute default getHex', () => {
            const result = system.executeTool('getHex', { hexId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitHex via tool', () => {
            const result = system.executeTool('recruitHex', { name: 'ToolRecruited' });
            expect(result.result.success).toBe(true);
            expect(result.result.hex.name).toBe('ToolRecruited');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('hexRecruited', () => count++);
            unregister();
            system.recruitHex({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('hexRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHex({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHexes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHexes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHex({});
            const json = system.toJSON();
            expect(json.hexes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHex({});
            const json = system.toJSON();
            const newSys = new CultivationHex();
            newSys.fromJSON(json);
            expect(newSys.hexes.size).toBe(1);
        });
        it('should deserialize empty data', () => {
            const newSys = new CultivationHex();
            const result = newSys.fromJSON({});
            expect(result.success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.hexCount).toBe(0);
        });
    });
});
