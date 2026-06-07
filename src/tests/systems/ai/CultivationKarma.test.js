/**
 * CultivationKarma.test.js - 修真因果测试
 * V739 Iteration 2/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationKarma } from '../../../systems/ai/CultivationKarma.js';

describe('CultivationKarma', () => {
    let system;
    beforeEach(() => { system = new CultivationKarma(); });

    describe('recruitKarma', () => {
        it('should recruit', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'Mercy', type: 'good' });
            expect(karma.masterId).toBe('m1');
            expect(karma.name).toBe('Mercy');
            expect(karma.type).toBe('good');
        });

        it('should default to neutral type and novice status', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'Balance' });
            expect(karma.type).toBe('neutral');
            expect(karma.status).toBe('novice');
            expect(karma.balance).toBe(20);
            expect(karma.level).toBe(1);
        });

        it('should accept custom balance and actions', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'Wrath', type: 'evil', balance: 50, actions: ['kill', 'spare'] });
            expect(karma.balance).toBe(50);
            expect(karma.actions.length).toBe(2);
        });

        it('should trigger karmaRecruited hook', () => {
            let called = false;
            system.registerHook('karmaRecruited', () => { called = true; });
            system.recruitKarma({ masterId: 'm1', name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('getKarma', () => {
        it('should return', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'X' });
            expect(system.getKarma(karma.karmaId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getKarma('ghost')).toBeNull(); });
    });

    describe('listKarmas', () => {
        it('should list all', () => {
            system.recruitKarma({ masterId: 'm1', name: 'A' });
            system.recruitKarma({ masterId: 'm2', name: 'B' });
            expect(system.listKarmas().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitKarma({ masterId: 'm1', name: 'A' });
            system.recruitKarma({ masterId: 'm2', name: 'B' });
            system.recruitKarma({ masterId: 'm1', name: 'C' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter by legendary status', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            system.recruitKarma({ masterId: 'm2', name: 'B' });
            system.legendKarma(karma.karmaId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addAction', () => {
        it('should add action', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            system.addAction(karma.karmaId, 'helped the elder');
            expect(karma.actions.length).toBe(1);
            expect(karma.actions[0]).toBe('helped the elder');
        });

        it('should reject missing', () => {
            const result = system.addAction('ghost', 'a');
            expect(result.error).toBe('KARMA_NOT_FOUND');
        });

        it('should trigger actionAdded hook', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('actionAdded', () => { called = true; });
            system.addAction(karma.karmaId, 'saved a life');
            expect(called).toBe(true);
        });
    });

    describe('raiseBalance', () => {
        it('should raise by amount', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            system.raiseBalance(karma.karmaId, 15);
            expect(karma.balance).toBe(35);
        });

        it('should use default amount of 5', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            system.raiseBalance(karma.karmaId);
            expect(karma.balance).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseBalance('ghost', 100);
            expect(result.error).toBe('KARMA_NOT_FOUND');
        });

        it('should trigger balanceRaised hook', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('balanceRaised', () => { called = true; });
            system.raiseBalance(karma.karmaId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpKarma', () => {
        it('should level up', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            system.levelUpKarma(karma.karmaId);
            expect(karma.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpKarma('ghost');
            expect(result.error).toBe('KARMA_NOT_FOUND');
        });

        it('should trigger karmaLeveledUp hook', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('karmaLeveledUp', () => { called = true; });
            system.levelUpKarma(karma.karmaId);
            expect(called).toBe(true);
        });
    });

    describe('legendKarma', () => {
        it('should set status to legendary', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            system.legendKarma(karma.karmaId);
            expect(karma.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendKarma('ghost');
            expect(result.error).toBe('KARMA_NOT_FOUND');
        });

        it('should trigger karmaLegendized hook', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('karmaLegendized', () => { called = true; });
            system.legendKarma(karma.karmaId);
            expect(called).toBe(true);
        });
    });

    describe('calculateKarmaValue', () => {
        it('should calculate value', () => {
            const { karma } = system.recruitKarma({ masterId: 'm1', name: 'A' });
            system.levelUpKarma(karma.karmaId);
            system.levelUpKarma(karma.karmaId);
            system.raiseBalance(karma.karmaId, 5);
            system.addAction(karma.karmaId, 'a1');
            system.addAction(karma.karmaId, 'a2');
            system.addAction(karma.karmaId, 'a3');
            // level=3, balance=25, actions.length=3 => 3*100 + 25*2 + 3*30 = 300 + 50 + 90 = 440
            expect(system.calculateKarmaValue(karma.karmaId)).toBe(440);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateKarmaValue('ghost')).toBe(0);
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

        it('should execute default getKarma', () => {
            const result = system.executeTool('getKarma', { karmaId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should default context to empty object when undefined', () => {
            system.registerTool('test', () => 'ok');
            const result = system.executeTool('test');
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('karmaRecruited', () => count++);
            unregister();
            system.recruitKarma({ masterId: 'm1', name: 'X' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('karmaRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitKarma({ masterId: 'm1', name: 'X' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalKarmas = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalKarmas = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitKarma({ masterId: 'm1', name: 'A' });
            const json = system.toJSON();
            expect(json.karmas.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitKarma({ masterId: 'm1', name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationKarma();
            newSys.fromJSON(json);
            expect(newSys.karmas.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.karmaCount).toBe(0);
        });
    });
});
