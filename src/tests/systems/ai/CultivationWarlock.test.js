/**
 * CultivationWarlock.test.js - 修真术师系统测试
 * V626 Iteration 9/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWarlock } from '../../../systems/ai/CultivationWarlock.js';

describe('CultivationWarlock', () => {
    let system;
    beforeEach(() => { system = new CultivationWarlock(); });

    describe('recruitWarlock', () => {
        it('should recruit', () => {
            const { warlock } = system.recruitWarlock({ patronId: 'p1', name: 'Valdris' });
            expect(warlock.patronId).toBe('p1');
            expect(warlock.name).toBe('Valdris');
        });

        it('should use default type and pact', () => {
            const { warlock } = system.recruitWarlock({});
            expect(warlock.type).toBe('pact');
            expect(warlock.pact).toBe(20);
        });

        it('should accept custom type', () => {
            const { warlock } = system.recruitWarlock({ type: 'chaos' });
            expect(warlock.type).toBe('chaos');
        });

        it('should accept order type', () => {
            const { warlock } = system.recruitWarlock({ type: 'order' });
            expect(warlock.type).toBe('order');
        });

        it('should reject when max reached', () => {
            const small = new CultivationWarlock({ maxWarlocks: 1 });
            small.recruitWarlock({});
            const result = small.recruitWarlock({});
            expect(result.error).toBe('MAX_WARLOCKS_REACHED');
        });

        it('should trigger warlockRecruited hook', () => {
            let called = false;
            system.registerHook('warlockRecruited', () => { called = true; });
            system.recruitWarlock({});
            expect(called).toBe(true);
        });

        it('should set initial status to novice', () => {
            const { warlock } = system.recruitWarlock({});
            expect(warlock.status).toBe('novice');
            expect(warlock.level).toBe(1);
        });

        it('should accept custom pact including 0', () => {
            const { warlock } = system.recruitWarlock({ pact: 0 });
            expect(warlock.pact).toBe(0);
        });

        it('should accept custom patron and minions', () => {
            const { warlock } = system.recruitWarlock({ patronId: 'patron42', minions: [{ name: 'init' }] });
            expect(warlock.patronId).toBe('patron42');
            expect(warlock.minions.length).toBe(1);
        });
    });

    describe('getWarlock', () => {
        it('should return', () => {
            const { warlock } = system.recruitWarlock({});
            expect(system.getWarlock(warlock.warlockId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWarlock('ghost')).toBeNull(); });
        it('should return a copy not the original reference', () => {
            const { warlock } = system.recruitWarlock({});
            const fetched = system.getWarlock(warlock.warlockId);
            expect(fetched).not.toBe(warlock);
        });
    });

    describe('listWarlocks', () => {
        it('should list all', () => {
            system.recruitWarlock({});
            system.recruitWarlock({});
            expect(system.listWarlocks().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listWarlocks().length).toBe(0);
        });
    });

    describe('listByPatron', () => {
        it('should filter', () => {
            system.recruitWarlock({ patronId: 'p1' });
            system.recruitWarlock({ patronId: 'p2' });
            expect(system.listByPatron('p1').length).toBe(1);
        });
        it('should return empty for unknown patron', () => {
            system.recruitWarlock({ patronId: 'p1' });
            expect(system.listByPatron('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { warlock: w1 } = system.recruitWarlock({});
            const { warlock: w2 } = system.recruitWarlock({});
            system.legendWarlock(w1.warlockId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].warlockId).toBe(w1.warlockId);
        });
    });

    describe('addMinion', () => {
        it('should add minion', () => {
            const { warlock } = system.recruitWarlock({});
            system.addMinion(warlock.warlockId, { name: 'Imp1' });
            expect(warlock.minions.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addMinion('ghost', {});
            expect(result.error).toBe('WARLOCK_NOT_FOUND');
        });

        it('should trigger minionAdded hook', () => {
            const { warlock } = system.recruitWarlock({});
            let called = false;
            system.registerHook('minionAdded', () => { called = true; });
            system.addMinion(warlock.warlockId, { name: 'Imp' });
            expect(called).toBe(true);
        });
    });

    describe('strengthenPact', () => {
        it('should strengthen', () => {
            const { warlock } = system.recruitWarlock({});
            system.strengthenPact(warlock.warlockId, 10);
            expect(warlock.pact).toBe(30);
        });

        it('should use default amount', () => {
            const { warlock } = system.recruitWarlock({});
            system.strengthenPact(warlock.warlockId);
            expect(warlock.pact).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.strengthenPact('ghost', 5);
            expect(result.error).toBe('WARLOCK_NOT_FOUND');
        });

        it('should trigger pactStrengthened hook', () => {
            const { warlock } = system.recruitWarlock({});
            let called = false;
            system.registerHook('pactStrengthened', () => { called = true; });
            system.strengthenPact(warlock.warlockId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWarlock', () => {
        it('should level up', () => {
            const { warlock } = system.recruitWarlock({});
            system.levelUpWarlock(warlock.warlockId);
            expect(warlock.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpWarlock('ghost');
            expect(result.error).toBe('WARLOCK_NOT_FOUND');
        });

        it('should trigger warlockLeveledUp hook', () => {
            const { warlock } = system.recruitWarlock({});
            let called = false;
            system.registerHook('warlockLeveledUp', () => { called = true; });
            system.levelUpWarlock(warlock.warlockId);
            expect(called).toBe(true);
        });
    });

    describe('legendWarlock', () => {
        it('should legendize', () => {
            const { warlock } = system.recruitWarlock({});
            system.legendWarlock(warlock.warlockId);
            expect(warlock.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendWarlock('ghost');
            expect(result.error).toBe('WARLOCK_NOT_FOUND');
        });

        it('should trigger warlockLegendized hook', () => {
            const { warlock } = system.recruitWarlock({});
            let called = false;
            system.registerHook('warlockLegendized', () => { called = true; });
            system.legendWarlock(warlock.warlockId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWarlockValue', () => {
        it('should calculate', () => {
            const { warlock } = system.recruitWarlock({});
            system.levelUpWarlock(warlock.warlockId);
            system.strengthenPact(warlock.warlockId, 5);
            system.addMinion(warlock.warlockId, { name: 'minion' });
            const value = system.calculateWarlockValue(warlock.warlockId);
            expect(value).toBe(2 * 100 + 25 * 2 + 1 * 30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWarlockValue('ghost')).toBe(0);
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

        it('should execute default getWarlock', () => {
            const result = system.executeTool('getWarlock', { warlockId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitWarlock via tool', () => {
            const result = system.executeTool('recruitWarlock', { name: 'ToolRecruited' });
            expect(result.result.success).toBe(true);
            expect(result.result.warlock.name).toBe('ToolRecruited');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('warlockRecruited', () => count++);
            unregister();
            system.recruitWarlock({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('warlockRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitWarlock({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWarlocks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWarlocks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitWarlock({});
            const json = system.toJSON();
            expect(json.warlocks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitWarlock({});
            const json = system.toJSON();
            const newSys = new CultivationWarlock();
            newSys.fromJSON(json);
            expect(newSys.warlocks.size).toBe(1);
        });
        it('should deserialize empty data', () => {
            const newSys = new CultivationWarlock();
            const result = newSys.fromJSON({});
            expect(result.success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.warlockCount).toBe(0);
        });
    });
});
