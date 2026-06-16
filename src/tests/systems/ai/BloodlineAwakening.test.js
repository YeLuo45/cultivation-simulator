/**
 * BloodlineAwakening.test.js - 血脉觉醒测试
 * V397 Iteration 4/15 Round 13 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BloodlineAwakening } from '../../../systems/ai/BloodlineAwakening.js';

describe('BloodlineAwakening', () => {
    let system;
    beforeEach(() => { system = new BloodlineAwakening(); });

    describe('awakenBloodline', () => {
        it('should awaken', () => {
            const { bloodline } = system.awakenBloodline({ cultivatorId: 'c1' });
            expect(bloodline.cultivatorId).toBe('c1');
        });

        it('should trigger bloodlineAwakened hook', () => {
            let called = false;
            system.registerHook('bloodlineAwakened', () => { called = true; });
            system.awakenBloodline({});
            expect(called).toBe(true);
        });
    });

    describe('getBloodline', () => {
        it('should return', () => {
            const { bloodline } = system.awakenBloodline({});
            expect(system.getBloodline(bloodline.bloodlineId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBloodline('ghost')).toBeNull(); });
    });

    describe('listBloodlines', () => {
        it('should list all', () => {
            system.awakenBloodline({});
            expect(system.listBloodlines().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.awakenBloodline({ cultivatorId: 'c1' });
            system.awakenBloodline({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByPurity', () => {
        it('should filter', () => {
            system.awakenBloodline({ purity: 10 });
            system.awakenBloodline({ purity: 80 });
            expect(system.listByPurity(50).length).toBe(1);
        });
    });

    describe('purify', () => {
        it('should purify', () => {
            const { bloodline } = system.awakenBloodline({});
            system.purify(bloodline.bloodlineId, 5);
            expect(bloodline.purity).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.purify('ghost', 5);
            expect(result.error).toBe('BLOODLINE_NOT_FOUND');
        });

        it('should trigger bloodlinePurified hook', () => {
            const { bloodline } = system.awakenBloodline({});
            let called = false;
            system.registerHook('bloodlinePurified', () => { called = true; });
            system.purify(bloodline.bloodlineId, 5);
            expect(called).toBe(true);
        });
    });

    describe('unlockAbility', () => {
        it('should unlock', () => {
            const { bloodline } = system.awakenBloodline({});
            system.unlockAbility(bloodline.bloodlineId, 'dragon_breath');
            expect(bloodline.awakenedAbilities).toContain('dragon_breath');
        });

        it('should not duplicate', () => {
            const { bloodline } = system.awakenBloodline({});
            system.unlockAbility(bloodline.bloodlineId, 'dragon_breath');
            system.unlockAbility(bloodline.bloodlineId, 'dragon_breath');
            expect(bloodline.awakenedAbilities.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.unlockAbility('ghost', 'fire');
            expect(result.error).toBe('BLOODLINE_NOT_FOUND');
        });

        it('should trigger abilityUnlocked hook', () => {
            const { bloodline } = system.awakenBloodline({});
            let called = false;
            system.registerHook('abilityUnlocked', () => { called = true; });
            system.unlockAbility(bloodline.bloodlineId, 'fire');
            expect(called).toBe(true);
        });
    });

    describe('levelUp', () => {
        it('should level up', () => {
            const { bloodline } = system.awakenBloodline({});
            system.levelUp(bloodline.bloodlineId);
            expect(bloodline.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUp('ghost');
            expect(result.error).toBe('BLOODLINE_NOT_FOUND');
        });

        it('should trigger bloodlineLeveledUp hook', () => {
            const { bloodline } = system.awakenBloodline({});
            let called = false;
            system.registerHook('bloodlineLeveledUp', () => { called = true; });
            system.levelUp(bloodline.bloodlineId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePower', () => {
        it('should calculate', () => {
            const { bloodline } = system.awakenBloodline({});
            expect(system.calculatePower(bloodline.bloodlineId)).toBe(10);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePower('ghost')).toBe(0);
        });
    });

    describe('listPure', () => {
        it('should filter', () => {
            system.awakenBloodline({ purity: 10 });
            system.awakenBloodline({ purity: 80 });
            expect(system.listPure().length).toBe(1);
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

        it('should execute default getBloodline', () => {
            const result = system.executeTool('getBloodline', { bloodlineId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bloodlineAwakened', () => count++);
            unregister();
            system.awakenBloodline({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bloodlineAwakened', () => { throw new Error('x'); });
            expect(() => system.awakenBloodline({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBloodlines = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBloodlines = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.awakenBloodline({});
            const json = system.toJSON();
            expect(json.bloodlines.length).toBe(1);
        });
        it('should deserialize', () => {
            system.awakenBloodline({});
            const json = system.toJSON();
            const newSys = new BloodlineAwakening();
            newSys.fromJSON(json);
            expect(newSys.bloodlines.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bloodlineCount).toBe(0);
        });
    });
});