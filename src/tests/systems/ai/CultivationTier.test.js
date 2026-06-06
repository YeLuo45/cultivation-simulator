/**
 * CultivationTier.test.js - 修真境界系统测试
 * V550 Iteration 13/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTier } from '../../../systems/ai/CultivationTier.js';

describe('CultivationTier', () => {
    let system;
    beforeEach(() => { system = new CultivationTier(); });

    describe('openTier', () => {
        it('should open tier', () => {
            const { tier } = system.openTier({ cultivatorId: 'c1', name: 'Foundation Mortal' });
            expect(tier.cultivatorId).toBe('c1');
            expect(tier.name).toBe('Foundation Mortal');
        });

        it('should default type to mortal', () => {
            const { tier } = system.openTier({});
            expect(tier.type).toBe('mortal');
        });

        it('should default name to Unnamed Tier', () => {
            const { tier } = system.openTier({});
            expect(tier.name).toBe('Unnamed Tier');
        });

        it('should default power to basePower (20)', () => {
            const { tier } = system.openTier({});
            expect(tier.power).toBe(20);
        });

        it('should default level to 1', () => {
            const { tier } = system.openTier({});
            expect(tier.level).toBe(1);
        });

        it('should default status to forming', () => {
            const { tier } = system.openTier({});
            expect(tier.status).toBe('forming');
        });

        it('should start with empty breakthroughs', () => {
            const { tier } = system.openTier({});
            expect(tier.breakthroughs).toEqual([]);
        });

        it('should auto-generate tierId', () => {
            const { tier } = system.openTier({});
            expect(tier.tierId).toBeTruthy();
            expect(typeof tier.tierId).toBe('string');
        });

        it('should respect provided tierId', () => {
            const { tier } = system.openTier({ tierId: 'myTier' });
            expect(tier.tierId).toBe('myTier');
        });

        it('should support immortal type', () => {
            const { tier } = system.openTier({ type: 'immortal' });
            expect(tier.type).toBe('immortal');
        });

        it('should support divine type', () => {
            const { tier } = system.openTier({ type: 'divine' });
            expect(tier.type).toBe('divine');
        });

        it('should support provided power', () => {
            const { tier } = system.openTier({ power: 50 });
            expect(tier.power).toBe(50);
        });

        it('should trigger tierOpened hook', () => {
            let called = false;
            system.registerHook('tierOpened', () => { called = true; });
            system.openTier({});
            expect(called).toBe(true);
        });

        it('should return success', () => {
            const result = system.openTier({});
            expect(result.success).toBe(true);
        });
    });

    describe('getTier', () => {
        it('should return tier', () => {
            const { tier } = system.openTier({});
            expect(system.getTier(tier.tierId)).not.toBeNull();
            expect(system.getTier(tier.tierId).tierId).toBe(tier.tierId);
        });
        it('should return null for missing', () => {
            expect(system.getTier('ghost')).toBeNull();
        });
    });

    describe('listTiers', () => {
        it('should list all', () => {
            system.openTier({});
            system.openTier({});
            expect(system.listTiers().length).toBe(2);
        });

        it('should return empty when no tiers', () => {
            expect(system.listTiers().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.openTier({ cultivatorId: 'c1' });
            system.openTier({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });

        it('should return empty for unknown', () => {
            system.openTier({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listPeak', () => {
        it('should filter peak only', () => {
            const { tier: t1 } = system.openTier({});
            const { tier: t2 } = system.openTier({});
            system.peakTier(t1.tierId);
            const peak = system.listPeak();
            expect(peak.length).toBe(1);
            expect(peak[0].tierId).toBe(t1.tierId);
            expect(t2.status).toBe('forming');
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.openTier({ type: 'mortal' });
            system.openTier({ type: 'immortal' });
            system.openTier({ type: 'divine' });
            expect(system.listByType('mortal').length).toBe(1);
            expect(system.listByType('immortal').length).toBe(1);
            expect(system.listByType('divine').length).toBe(1);
        });
    });

    describe('addBreakthrough', () => {
        it('should add breakthrough', () => {
            const { tier } = system.openTier({});
            system.addBreakthrough(tier.tierId, 'qi-condensation');
            expect(tier.breakthroughs).toContain('qi-condensation');
        });

        it('should support multiple breakthroughs', () => {
            const { tier } = system.openTier({});
            system.addBreakthrough(tier.tierId, 'b1');
            system.addBreakthrough(tier.tierId, 'b2');
            expect(tier.breakthroughs.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addBreakthrough('ghost', 'b');
            expect(result.error).toBe('TIER_NOT_FOUND');
        });

        it('should trigger breakthroughAdded hook', () => {
            const { tier } = system.openTier({});
            let called = false;
            system.registerHook('breakthroughAdded', () => { called = true; });
            system.addBreakthrough(tier.tierId, 'b');
            expect(called).toBe(true);
        });
    });

    describe('increasePower', () => {
        it('should increase power by default 5', () => {
            const { tier } = system.openTier({});
            system.increasePower(tier.tierId);
            expect(tier.power).toBe(25);
        });

        it('should increase custom amount', () => {
            const { tier } = system.openTier({});
            system.increasePower(tier.tierId, 50);
            expect(tier.power).toBe(70);
        });

        it('should accumulate power', () => {
            const { tier } = system.openTier({});
            system.increasePower(tier.tierId, 10);
            system.increasePower(tier.tierId, 20);
            expect(tier.power).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.increasePower('ghost', 10);
            expect(result.error).toBe('TIER_NOT_FOUND');
        });

        it('should trigger powerIncreased hook', () => {
            const { tier } = system.openTier({});
            let called = false;
            system.registerHook('powerIncreased', () => { called = true; });
            system.increasePower(tier.tierId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTier', () => {
        it('should level up', () => {
            const { tier } = system.openTier({});
            system.levelUpTier(tier.tierId);
            expect(tier.level).toBe(2);
        });

        it('should accumulate level', () => {
            const { tier } = system.openTier({});
            system.levelUpTier(tier.tierId);
            system.levelUpTier(tier.tierId);
            system.levelUpTier(tier.tierId);
            expect(tier.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpTier('ghost');
            expect(result.error).toBe('TIER_NOT_FOUND');
        });

        it('should trigger tierLeveledUp hook', () => {
            const { tier } = system.openTier({});
            let called = false;
            system.registerHook('tierLeveledUp', () => { called = true; });
            system.levelUpTier(tier.tierId);
            expect(called).toBe(true);
        });
    });

    describe('peakTier', () => {
        it('should peak tier', () => {
            const { tier } = system.openTier({});
            system.peakTier(tier.tierId);
            expect(tier.status).toBe('peak');
        });

        it('should reject missing', () => {
            const result = system.peakTier('ghost');
            expect(result.error).toBe('TIER_NOT_FOUND');
        });

        it('should trigger tierPeak hook', () => {
            const { tier } = system.openTier({});
            let called = false;
            system.registerHook('tierPeak', () => { called = true; });
            system.peakTier(tier.tierId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTierPower', () => {
        it('should calculate basic', () => {
            const { tier } = system.openTier({});
            // level=1, power=20, breakthroughs=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateTierPower(tier.tierId)).toBe(140);
        });

        it('should include level', () => {
            const { tier } = system.openTier({});
            system.levelUpTier(tier.tierId);
            system.levelUpTier(tier.tierId);
            // level=3, power=20, breakthroughs=0 -> 3*100 + 20*2 + 0*30 = 340
            expect(system.calculateTierPower(tier.tierId)).toBe(340);
        });

        it('should include power', () => {
            const { tier } = system.openTier({});
            system.increasePower(tier.tierId, 30);
            // level=1, power=50, breakthroughs=0 -> 1*100 + 50*2 + 0*30 = 200
            expect(system.calculateTierPower(tier.tierId)).toBe(200);
        });

        it('should include breakthroughs', () => {
            const { tier } = system.openTier({});
            system.addBreakthrough(tier.tierId, 'b1');
            system.addBreakthrough(tier.tierId, 'b2');
            // level=1, power=20, breakthroughs=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateTierPower(tier.tierId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTierPower('ghost')).toBe(0);
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

        it('should handle null context', () => {
            system.registerTool('test', () => 'ok');
            const result = system.executeTool('test', null);
            expect(result.result).toBe('ok');
        });

        it('should handle undefined context', () => {
            system.registerTool('test', () => 'ok');
            const result = system.executeTool('test', undefined);
            expect(result.result).toBe('ok');
        });

        it('should execute default getTier', () => {
            const result = system.executeTool('getTier', { tierId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default openTier', () => {
            const result = system.executeTool('openTier', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tierOpened', () => count++);
            unregister();
            system.openTier({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tierOpened', () => { throw new Error('x'); });
            expect(() => system.openTier({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTiers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTiers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openTier({});
            const json = system.toJSON();
            expect(json.tiers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openTier({});
            const json = system.toJSON();
            const newSys = new CultivationTier();
            newSys.fromJSON(json);
            expect(newSys.tiers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tierCount).toBe(0);
        });

        it('should reflect added tiers', () => {
            system.openTier({});
            system.openTier({});
            const stats = system.getStats();
            expect(stats.tierCount).toBe(2);
        });
    });
});
