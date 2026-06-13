/**
 * CultivationMidnight.test.js - 修真子夜测试
 * V818 Iteration 21/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMidnight } from '../../../systems/ai/CultivationMidnight.js';

describe('CultivationMidnight', () => {
    let system;
    beforeEach(() => { system = new CultivationMidnight(); });

    describe('recruitMidnight', () => {
        it('should recruit', () => {
            const { midnight } = system.recruitMidnight({ masterId: 'm1', name: 'Watcher' });
            expect(midnight.name).toBe('Watcher');
            expect(midnight.masterId).toBe('m1');
        });

        it('should default type and status', () => {
            const { midnight } = system.recruitMidnight({});
            expect(midnight.type).toBe('dark');
            expect(midnight.status).toBe('novice');
            expect(midnight.stillness).toBe(20);
        });

        it('should accept custom type and status', () => {
            const { midnight } = system.recruitMidnight({ type: 'witching', status: 'veteran' });
            expect(midnight.type).toBe('witching');
            expect(midnight.status).toBe('veteran');
        });

        it('should preserve provided secrets array', () => {
            const { midnight } = system.recruitMidnight({ secrets: ['s1', 's2'] });
            expect(midnight.secrets).toEqual(['s1', 's2']);
        });

        it('should use provided midnightId if given', () => {
            const { midnight } = system.recruitMidnight({ midnightId: 'custom_id' });
            expect(midnight.midnightId).toBe('custom_id');
        });

        it('should increment stats', () => {
            system.recruitMidnight({});
            expect(system.stats.totalMidnights).toBe(1);
        });

        it('should trigger midnightRecruited hook', () => {
            let called = false;
            system.registerHook('midnightRecruited', () => { called = true; });
            system.recruitMidnight({});
            expect(called).toBe(true);
        });
    });

    describe('getMidnight', () => {
        it('should return midnight', () => {
            const { midnight } = system.recruitMidnight({ name: 'N1' });
            const fetched = system.getMidnight(midnight.midnightId);
            expect(fetched.name).toBe('N1');
        });

        it('should return a copy with cloned secrets', () => {
            const { midnight } = system.recruitMidnight({ secrets: ['s1'] });
            const fetched = system.getMidnight(midnight.midnightId);
            fetched.secrets.push('s2');
            expect(midnight.secrets.length).toBe(1);
        });

        it('should return null for missing', () => { expect(system.getMidnight('ghost')).toBeNull(); });
    });

    describe('listMidnights', () => {
        it('should list all', () => {
            system.recruitMidnight({});
            system.recruitMidnight({});
            expect(system.listMidnights().length).toBe(2);
        });

        it('should return cloned secrets', () => {
            const { midnight } = system.recruitMidnight({ secrets: ['a'] });
            const list = system.listMidnights();
            list[0].secrets.push('b');
            expect(midnight.secrets.length).toBe(1);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitMidnight({ masterId: 'm1' });
            system.recruitMidnight({ masterId: 'm2' });
            system.recruitMidnight({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for no match', () => {
            system.recruitMidnight({ masterId: 'm1' });
            expect(system.listByMaster('m2').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { midnight: a } = system.recruitMidnight({});
            const { midnight: b } = system.recruitMidnight({});
            system.legendMidnight(b.midnightId);
            const leg = system.listLegendary();
            expect(leg.length).toBe(1);
            expect(leg[0].midnightId).toBe(b.midnightId);
            expect(leg[0].status).toBe('legendary');
        });
    });

    describe('addSecret', () => {
        it('should add secret', () => {
            const { midnight } = system.recruitMidnight({});
            system.addSecret(midnight.midnightId, 'dark_truth');
            expect(midnight.secrets).toContain('dark_truth');
        });

        it('should reject missing', () => {
            const result = system.addSecret('ghost', 'x');
            expect(result.error).toBe('MIDNIGHT_NOT_FOUND');
        });

        it('should trigger secretAdded hook', () => {
            const { midnight } = system.recruitMidnight({});
            let payload = null;
            system.registerHook('secretAdded', (d) => { payload = d; });
            system.addSecret(midnight.midnightId, 'arcane');
            expect(payload.secret).toBe('arcane');
        });
    });

    describe('raiseStillness', () => {
        it('should raise with default amount', () => {
            const { midnight } = system.recruitMidnight({});
            system.raiseStillness(midnight.midnightId);
            expect(midnight.stillness).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { midnight } = system.recruitMidnight({});
            system.raiseStillness(midnight.midnightId, 12);
            expect(midnight.stillness).toBe(32);
        });

        it('should reject missing', () => {
            const result = system.raiseStillness('ghost', 5);
            expect(result.error).toBe('MIDNIGHT_NOT_FOUND');
        });

        it('should trigger stillnessRaised hook', () => {
            const { midnight } = system.recruitMidnight({});
            let called = false;
            system.registerHook('stillnessRaised', () => { called = true; });
            system.raiseStillness(midnight.midnightId, 7);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMidnight', () => {
        it('should level up', () => {
            const { midnight } = system.recruitMidnight({});
            system.levelUpMidnight(midnight.midnightId);
            expect(midnight.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpMidnight('ghost');
            expect(result.error).toBe('MIDNIGHT_NOT_FOUND');
        });

        it('should trigger midnightLeveledUp hook', () => {
            const { midnight } = system.recruitMidnight({});
            let level = null;
            system.registerHook('midnightLeveledUp', (d) => { level = d.newLevel; });
            system.levelUpMidnight(midnight.midnightId);
            expect(level).toBe(2);
        });
    });

    describe('legendMidnight', () => {
        it('should legendize', () => {
            const { midnight } = system.recruitMidnight({});
            system.legendMidnight(midnight.midnightId);
            expect(midnight.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMidnight('ghost');
            expect(result.error).toBe('MIDNIGHT_NOT_FOUND');
        });

        it('should trigger midnightLegendized hook', () => {
            const { midnight } = system.recruitMidnight({});
            let called = false;
            system.registerHook('midnightLegendized', () => { called = true; });
            system.legendMidnight(midnight.midnightId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMidnightValue', () => {
        it('should calculate', () => {
            const { midnight } = system.recruitMidnight({ level: 2, stillness: 30, secrets: ['s1', 's2'] });
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateMidnightValue(midnight.midnightId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMidnightValue('ghost')).toBe(0);
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

        it('should execute default recruitMidnight tool', () => {
            const result = system.executeTool('recruitMidnight', { masterId: 'm1' });
            expect(result.success).toBe(true);
            expect(result.result.midnight.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('midnightRecruited', () => count++);
            unregister();
            system.recruitMidnight({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('midnightRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMidnight({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when threshold met', () => {
            system.stats.totalMidnights = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxMidnights).toBe(30);
        });

        it('should not double evolve', () => {
            system.stats.totalMidnights = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMidnight({});
            const json = system.toJSON();
            expect(json.midnights.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitMidnight({});
            const json = system.toJSON();
            const newSys = new CultivationMidnight();
            newSys.fromJSON(json);
            expect(newSys.midnights.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.midnightCount).toBe(0);
            expect(stats.totalMidnights).toBe(0);
        });
    });
});
