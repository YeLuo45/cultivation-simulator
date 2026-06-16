/**
 * ArmorUpgrade.test.js - 护甲升级系统测试
 * V509 Iteration 11/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ArmorUpgrade } from '../../../systems/ai/ArmorUpgrade.js';

describe('ArmorUpgrade', () => {
    let system;
    beforeEach(() => { system = new ArmorUpgrade(); });

    describe('planUpgrade', () => {
        it('should create upgrade', () => {
            const { upgrade } = system.planUpgrade({ smithId: 's1', armorName: 'plate' });
            expect(upgrade.smithId).toBe('s1');
            expect(upgrade.armorName).toBe('plate');
            expect(upgrade.status).toBe('planned');
        });

        it('should default level=1 and defense=baseDefense', () => {
            const { upgrade } = system.planUpgrade({ smithId: 's1' });
            expect(upgrade.level).toBe(1);
            expect(upgrade.defense).toBe(20);
        });

        it('should accept custom level and defense', () => {
            const { upgrade } = system.planUpgrade({ smithId: 's1', level: 3, defense: 50 });
            expect(upgrade.level).toBe(3);
            expect(upgrade.defense).toBe(50);
        });

        it('should trigger upgradePlanned hook', () => {
            let called = false;
            system.registerHook('upgradePlanned', () => { called = true; });
            system.planUpgrade({});
            expect(called).toBe(true);
        });
    });

    describe('getUpgrade', () => {
        it('should return', () => {
            const { upgrade } = system.planUpgrade({});
            expect(system.getUpgrade(upgrade.upgradeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getUpgrade('ghost')).toBeNull(); });
    });

    describe('listUpgrades', () => {
        it('should list all', () => {
            system.planUpgrade({});
            system.planUpgrade({});
            expect(system.listUpgrades().length).toBe(2);
        });
        it('should be empty initially', () => {
            expect(system.listUpgrades().length).toBe(0);
        });
    });

    describe('listBySmith', () => {
        it('should filter', () => {
            system.planUpgrade({ smithId: 's1' });
            system.planUpgrade({ smithId: 's2' });
            expect(system.listBySmith('s1').length).toBe(1);
        });
    });

    describe('listFinished', () => {
        it('should filter finished', () => {
            const { upgrade } = system.planUpgrade({});
            system.finishUpgrade(upgrade.upgradeId);
            expect(system.listFinished().length).toBe(1);
        });
        it('should be empty when none finished', () => {
            system.planUpgrade({});
            expect(system.listFinished().length).toBe(0);
        });
    });

    describe('addEnhancement', () => {
        it('should add enhancement', () => {
            const { upgrade } = system.planUpgrade({});
            system.addEnhancement(upgrade.upgradeId, 'sharpness');
            expect(upgrade.enhancements).toContain('sharpness');
        });

        it('should reject missing', () => {
            const result = system.addEnhancement('ghost', 'x');
            expect(result.error).toBe('UPGRADE_NOT_FOUND');
        });

        it('should trigger enhancementAdded hook', () => {
            const { upgrade } = system.planUpgrade({});
            let called = false;
            system.registerHook('enhancementAdded', () => { called = true; });
            system.addEnhancement(upgrade.upgradeId, 'fire');
            expect(called).toBe(true);
        });
    });

    describe('increaseDefense', () => {
        it('should increase defense by default 5', () => {
            const { upgrade } = system.planUpgrade({});
            system.increaseDefense(upgrade.upgradeId);
            expect(upgrade.defense).toBe(25);
        });

        it('should increase defense by custom amount', () => {
            const { upgrade } = system.planUpgrade({});
            system.increaseDefense(upgrade.upgradeId, 10);
            expect(upgrade.defense).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.increaseDefense('ghost', 5);
            expect(result.error).toBe('UPGRADE_NOT_FOUND');
        });

        it('should trigger defenseIncreased hook', () => {
            const { upgrade } = system.planUpgrade({});
            let called = false;
            system.registerHook('defenseIncreased', () => { called = true; });
            system.increaseDefense(upgrade.upgradeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUp', () => {
        it('should level up', () => {
            const { upgrade } = system.planUpgrade({});
            system.levelUp(upgrade.upgradeId);
            expect(upgrade.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUp('ghost');
            expect(result.error).toBe('UPGRADE_NOT_FOUND');
        });

        it('should trigger upgradeLeveledUp hook', () => {
            const { upgrade } = system.planUpgrade({});
            let called = false;
            system.registerHook('upgradeLeveledUp', () => { called = true; });
            system.levelUp(upgrade.upgradeId);
            expect(called).toBe(true);
        });
    });

    describe('finishUpgrade', () => {
        it('should finish', () => {
            const { upgrade } = system.planUpgrade({});
            system.finishUpgrade(upgrade.upgradeId);
            expect(upgrade.status).toBe('finished');
        });

        it('should reject missing', () => {
            const result = system.finishUpgrade('ghost');
            expect(result.error).toBe('UPGRADE_NOT_FOUND');
        });

        it('should trigger upgradeFinished hook', () => {
            const { upgrade } = system.planUpgrade({});
            let called = false;
            system.registerHook('upgradeFinished', () => { called = true; });
            system.finishUpgrade(upgrade.upgradeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateUpgradeValue', () => {
        it('should calculate basic value', () => {
            const { upgrade } = system.planUpgrade({});
            // level=1, defense=20, enhancements=0 => 1*100 + 20 + 0*20 = 120
            expect(system.calculateUpgradeValue(upgrade.upgradeId)).toBe(120);
        });

        it('should include enhancements', () => {
            const { upgrade } = system.planUpgrade({});
            system.addEnhancement(upgrade.upgradeId, 'a');
            system.addEnhancement(upgrade.upgradeId, 'b');
            // level=1, defense=20, enhancements=2 => 100 + 20 + 40 = 160
            expect(system.calculateUpgradeValue(upgrade.upgradeId)).toBe(160);
        });

        it('should scale with level', () => {
            const { upgrade } = system.planUpgrade({ level: 3 });
            // level=3, defense=20, enhancements=0 => 300 + 20 + 0 = 320
            expect(system.calculateUpgradeValue(upgrade.upgradeId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateUpgradeValue('ghost')).toBe(0);
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

        it('should execute default getUpgrade', () => {
            const result = system.executeTool('getUpgrade', { upgradeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('upgradePlanned', () => count++);
            unregister();
            system.planUpgrade({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('upgradePlanned', () => { throw new Error('x'); });
            expect(() => system.planUpgrade({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalUpgrades = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalUpgrades = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.planUpgrade({});
            const json = system.toJSON();
            expect(json.upgrades.length).toBe(1);
        });
        it('should deserialize', () => {
            system.planUpgrade({});
            const json = system.toJSON();
            const newSys = new ArmorUpgrade();
            newSys.fromJSON(json);
            expect(newSys.upgrades.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.upgradeCount).toBe(0);
        });
    });
});
