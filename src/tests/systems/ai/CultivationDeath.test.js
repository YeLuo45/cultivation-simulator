/**
 * CultivationDeath.test.js - 修真死亡系统测试
 * V596 Iteration 19/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDeath } from '../../../systems/ai/CultivationDeath.js';

describe('CultivationDeath', () => {
    let system;
    beforeEach(() => { system = new CultivationDeath(); });

    describe('recordDeath', () => {
        it('should record death', () => {
            const { death } = system.recordDeath({ escortId: 'e1', name: 'Falling Leaf' });
            expect(death.escortId).toBe('e1');
            expect(death.name).toBe('Falling Leaf');
        });

        it('should default type to natural', () => {
            const { death } = system.recordDeath({});
            expect(death.type).toBe('natural');
        });

        it('should default karma to baseKarma', () => {
            const { death } = system.recordDeath({});
            expect(death.karma).toBe(20);
        });

        it('should start at level 1', () => {
            const { death } = system.recordDeath({});
            expect(death.level).toBe(1);
        });

        it('should start with departed status', () => {
            const { death } = system.recordDeath({});
            expect(death.status).toBe('departed');
        });

        it('should start with empty regrets', () => {
            const { death } = system.recordDeath({});
            expect(death.regrets).toEqual([]);
        });

        it('should generate deathId', () => {
            const { death } = system.recordDeath({});
            expect(death.deathId).toBeDefined();
            expect(typeof death.deathId).toBe('string');
        });

        it('should accept custom deathId', () => {
            const { death } = system.recordDeath({ deathId: 'my-death' });
            expect(death.deathId).toBe('my-death');
        });

        it('should support all types', () => {
            const { death: d1 } = system.recordDeath({ type: 'natural' });
            const { death: d2 } = system.recordDeath({ type: 'combat' });
            const { death: d3 } = system.recordDeath({ type: 'tragic' });
            expect(d1.type).toBe('natural');
            expect(d2.type).toBe('combat');
            expect(d3.type).toBe('tragic');
        });

        it('should trigger deathRecorded hook', () => {
            let called = false;
            system.registerHook('deathRecorded', () => { called = true; });
            system.recordDeath({});
            expect(called).toBe(true);
        });
    });

    describe('getDeath', () => {
        it('should return death', () => {
            const { death } = system.recordDeath({});
            expect(system.getDeath(death.deathId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDeath('ghost')).toBeNull(); });
    });

    describe('listDeaths', () => {
        it('should list all', () => {
            system.recordDeath({});
            system.recordDeath({});
            expect(system.listDeaths().length).toBe(2);
        });

        it('should return empty when no deaths', () => {
            expect(system.listDeaths().length).toBe(0);
        });
    });

    describe('listByEscort', () => {
        it('should filter by escort', () => {
            system.recordDeath({ escortId: 'e1' });
            system.recordDeath({ escortId: 'e2' });
            system.recordDeath({ escortId: 'e1' });
            expect(system.listByEscort('e1').length).toBe(2);
        });

        it('should return empty for unknown escort', () => {
            system.recordDeath({ escortId: 'e1' });
            expect(system.listByEscort('ghost').length).toBe(0);
        });
    });

    describe('listEternal', () => {
        it('should filter eternal only', () => {
            const { death: d1 } = system.recordDeath({});
            const { death: d2 } = system.recordDeath({});
            system.eternalizeDeath(d1.deathId);
            const eternal = system.listEternal();
            expect(eternal.length).toBe(1);
            expect(eternal[0].deathId).toBe(d1.deathId);
            expect(d2.status).toBe('departed');
        });

        it('should return empty when none eternal', () => {
            system.recordDeath({});
            expect(system.listEternal().length).toBe(0);
        });
    });

    describe('addRegret', () => {
        it('should add regret', () => {
            const { death } = system.recordDeath({});
            system.addRegret(death.deathId, 'wasted-youth');
            expect(death.regrets).toContain('wasted-youth');
        });

        it('should accumulate regrets', () => {
            const { death } = system.recordDeath({});
            system.addRegret(death.deathId, 'r1');
            system.addRegret(death.deathId, 'r2');
            system.addRegret(death.deathId, 'r3');
            expect(death.regrets.length).toBe(3);
        });

        it('should reject missing death', () => {
            const result = system.addRegret('ghost', 'r');
            expect(result.error).toBe('DEATH_NOT_FOUND');
        });

        it('should trigger regretAdded hook', () => {
            const { death } = system.recordDeath({});
            let called = false;
            system.registerHook('regretAdded', () => { called = true; });
            system.addRegret(death.deathId, 'r');
            expect(called).toBe(true);
        });
    });

    describe('settleKarma', () => {
        it('should settle karma by default', () => {
            const { death } = system.recordDeath({});
            system.settleKarma(death.deathId);
            expect(death.karma).toBe(25);
        });

        it('should settle karma by custom amount', () => {
            const { death } = system.recordDeath({});
            system.settleKarma(death.deathId, 100);
            expect(death.karma).toBe(120);
        });

        it('should reject missing death', () => {
            const result = system.settleKarma('ghost', 10);
            expect(result.error).toBe('DEATH_NOT_FOUND');
        });

        it('should trigger karmaSettled hook', () => {
            const { death } = system.recordDeath({});
            let called = false;
            system.registerHook('karmaSettled', () => { called = true; });
            system.settleKarma(death.deathId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDeath', () => {
        it('should level up', () => {
            const { death } = system.recordDeath({});
            system.levelUpDeath(death.deathId);
            expect(death.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { death } = system.recordDeath({});
            system.levelUpDeath(death.deathId);
            system.levelUpDeath(death.deathId);
            system.levelUpDeath(death.deathId);
            expect(death.level).toBe(4);
        });

        it('should reject missing death', () => {
            const result = system.levelUpDeath('ghost');
            expect(result.error).toBe('DEATH_NOT_FOUND');
        });

        it('should trigger deathLeveledUp hook', () => {
            const { death } = system.recordDeath({});
            let called = false;
            system.registerHook('deathLeveledUp', () => { called = true; });
            system.levelUpDeath(death.deathId);
            expect(called).toBe(true);
        });
    });

    describe('eternalizeDeath', () => {
        it('should eternalize death', () => {
            const { death } = system.recordDeath({});
            system.eternalizeDeath(death.deathId);
            expect(death.status).toBe('eternal');
        });

        it('should reject missing death', () => {
            const result = system.eternalizeDeath('ghost');
            expect(result.error).toBe('DEATH_NOT_FOUND');
        });

        it('should trigger deathEternalized hook', () => {
            const { death } = system.recordDeath({});
            let called = false;
            system.registerHook('deathEternalized', () => { called = true; });
            system.eternalizeDeath(death.deathId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDeathValue', () => {
        it('should calculate base value', () => {
            const { death } = system.recordDeath({});
            // level=1, karma=20, regrets=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateDeathValue(death.deathId)).toBe(140);
        });

        it('should include karma in value', () => {
            const { death } = system.recordDeath({});
            system.settleKarma(death.deathId, 100);
            // level=1, karma=120, regrets=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateDeathValue(death.deathId)).toBe(340);
        });

        it('should include regrets in value', () => {
            const { death } = system.recordDeath({});
            system.addRegret(death.deathId, 'r1');
            system.addRegret(death.deathId, 'r2');
            // level=1, karma=20, regrets=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateDeathValue(death.deathId)).toBe(200);
        });

        it('should scale with level', () => {
            const { death } = system.recordDeath({});
            system.levelUpDeath(death.deathId);
            system.levelUpDeath(death.deathId);
            // level=3, karma=20, regrets=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateDeathValue(death.deathId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDeathValue('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
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

        it('should execute default getDeath', () => {
            const result = system.executeTool('getDeath', { deathId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recordDeath', () => {
            const result = system.executeTool('recordDeath', { escortId: 'e1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('deathRecorded', () => count++);
            unregister();
            system.recordDeath({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('deathRecorded', () => { throw new Error('x'); });
            expect(() => system.recordDeath({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDeaths = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDeaths = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recordDeath({});
            const json = system.toJSON();
            expect(json.deaths.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recordDeath({});
            const json = system.toJSON();
            const newSys = new CultivationDeath();
            newSys.fromJSON(json);
            expect(newSys.deaths.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.deathCount).toBe(0);
        });
    });
});
