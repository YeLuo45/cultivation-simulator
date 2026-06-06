/**
 * CultivationSoul.test.js - 道魂系统测试
 * V526 Iteration 8/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSoul } from '../../../systems/ai/CultivationSoul.js';

describe('CultivationSoul', () => {
    let system;
    beforeEach(() => { system = new CultivationSoul(); });

    describe('birthSoul', () => {
        it('should birth soul', () => {
            const { soul } = system.birthSoul({ cultivatorId: 'c1', name: 'True Soul' });
            expect(soul.cultivatorId).toBe('c1');
            expect(soul.name).toBe('True Soul');
        });

        it('should default to weak status', () => {
            const { soul } = system.birthSoul({});
            expect(soul.status).toBe('weak');
        });

        it('should default type to true', () => {
            const { soul } = system.birthSoul({});
            expect(soul.type).toBe('true');
        });

        it('should default essence to baseEssence', () => {
            const { soul } = system.birthSoul({});
            expect(soul.essence).toBe(30);
        });

        it('should start at level 1', () => {
            const { soul } = system.birthSoul({});
            expect(soul.level).toBe(1);
        });

        it('should start with empty fragments', () => {
            const { soul } = system.birthSoul({});
            expect(soul.fragments).toEqual([]);
        });

        it('should generate soulId', () => {
            const { soul } = system.birthSoul({});
            expect(soul.soulId).toBeDefined();
            expect(typeof soul.soulId).toBe('string');
        });

        it('should accept custom soulId', () => {
            const { soul } = system.birthSoul({ soulId: 'my-soul' });
            expect(soul.soulId).toBe('my-soul');
        });

        it('should trigger soulBirth hook', () => {
            let called = false;
            system.registerHook('soulBirth', () => { called = true; });
            system.birthSoul({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { soul: s1 } = system.birthSoul({ type: 'true' });
            const { soul: s2 } = system.birthSoul({ type: 'primordial' });
            const { soul: s3 } = system.birthSoul({ type: 'heavenly' });
            expect(s1.type).toBe('true');
            expect(s2.type).toBe('primordial');
            expect(s3.type).toBe('heavenly');
        });
    });

    describe('getSoul', () => {
        it('should return soul', () => {
            const { soul } = system.birthSoul({});
            expect(system.getSoul(soul.soulId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSoul('ghost')).toBeNull(); });
    });

    describe('listSouls', () => {
        it('should list all', () => {
            system.birthSoul({});
            system.birthSoul({});
            expect(system.listSouls().length).toBe(2);
        });

        it('should return empty when no souls', () => {
            expect(system.listSouls().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.birthSoul({ cultivatorId: 'c1' });
            system.birthSoul({ cultivatorId: 'c2' });
            system.birthSoul({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c1').length).toBe(2);
        });

        it('should return empty for unknown cultivator', () => {
            system.birthSoul({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listEternal', () => {
        it('should filter eternal only', () => {
            const { soul: s1 } = system.birthSoul({});
            const { soul: s2 } = system.birthSoul({});
            system.eternizeSoul(s1.soulId);
            const eternal = system.listEternal();
            expect(eternal.length).toBe(1);
            expect(eternal[0].soulId).toBe(s1.soulId);
            expect(s2.status).toBe('weak');
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.birthSoul({ type: 'true' });
            system.birthSoul({ type: 'primordial' });
            system.birthSoul({ type: 'heavenly' });
            expect(system.listByType('true').length).toBe(1);
            expect(system.listByType('primordial').length).toBe(1);
            expect(system.listByType('heavenly').length).toBe(1);
        });
    });

    describe('addFragment', () => {
        it('should add fragment', () => {
            const { soul } = system.birthSoul({});
            system.addFragment(soul.soulId, 'memory-fragment-1');
            expect(soul.fragments).toContain('memory-fragment-1');
        });

        it('should accumulate fragments', () => {
            const { soul } = system.birthSoul({});
            system.addFragment(soul.soulId, 'f1');
            system.addFragment(soul.soulId, 'f2');
            system.addFragment(soul.soulId, 'f3');
            expect(soul.fragments.length).toBe(3);
        });

        it('should reject missing soul', () => {
            const result = system.addFragment('ghost', 'f');
            expect(result.error).toBe('SOUL_NOT_FOUND');
        });

        it('should trigger fragmentAdded hook', () => {
            const { soul } = system.birthSoul({});
            let called = false;
            system.registerHook('fragmentAdded', () => { called = true; });
            system.addFragment(soul.soulId, 'f');
            expect(called).toBe(true);
        });
    });

    describe('increaseEssence', () => {
        it('should increase essence by default', () => {
            const { soul } = system.birthSoul({});
            system.increaseEssence(soul.soulId);
            expect(soul.essence).toBe(35);
        });

        it('should increase essence by custom amount', () => {
            const { soul } = system.birthSoul({});
            system.increaseEssence(soul.soulId, 100);
            expect(soul.essence).toBe(130);
        });

        it('should reject missing soul', () => {
            const result = system.increaseEssence('ghost');
            expect(result.error).toBe('SOUL_NOT_FOUND');
        });

        it('should trigger essenceIncreased hook', () => {
            const { soul } = system.birthSoul({});
            let called = false;
            system.registerHook('essenceIncreased', () => { called = true; });
            system.increaseEssence(soul.soulId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSoul', () => {
        it('should level up', () => {
            const { soul } = system.birthSoul({});
            system.levelUpSoul(soul.soulId);
            expect(soul.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { soul } = system.birthSoul({});
            system.levelUpSoul(soul.soulId);
            system.levelUpSoul(soul.soulId);
            system.levelUpSoul(soul.soulId);
            expect(soul.level).toBe(4);
        });

        it('should reject missing soul', () => {
            const result = system.levelUpSoul('ghost');
            expect(result.error).toBe('SOUL_NOT_FOUND');
        });

        it('should trigger soulLeveledUp hook', () => {
            const { soul } = system.birthSoul({});
            let called = false;
            system.registerHook('soulLeveledUp', () => { called = true; });
            system.levelUpSoul(soul.soulId);
            expect(called).toBe(true);
        });
    });

    describe('eternizeSoul', () => {
        it('should eternize soul', () => {
            const { soul } = system.birthSoul({});
            system.eternizeSoul(soul.soulId);
            expect(soul.status).toBe('eternal');
        });

        it('should reject missing soul', () => {
            const result = system.eternizeSoul('ghost');
            expect(result.error).toBe('SOUL_NOT_FOUND');
        });

        it('should trigger soulEternalized hook', () => {
            const { soul } = system.birthSoul({});
            let called = false;
            system.registerHook('soulEternalized', () => { called = true; });
            system.eternizeSoul(soul.soulId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSoulPower', () => {
        it('should calculate base power', () => {
            const { soul } = system.birthSoul({});
            // level=1, essence=30, fragments=0 -> 1*100 + 30*2 + 0 = 160
            expect(system.calculateSoulPower(soul.soulId)).toBe(160);
        });

        it('should include fragments in power', () => {
            const { soul } = system.birthSoul({});
            system.addFragment(soul.soulId, 'f1');
            system.addFragment(soul.soulId, 'f2');
            // level=1, essence=30, fragments=2 -> 1*100 + 30*2 + 2*30 = 220
            expect(system.calculateSoulPower(soul.soulId)).toBe(220);
        });

        it('should scale with level', () => {
            const { soul } = system.birthSoul({});
            system.levelUpSoul(soul.soulId);
            system.levelUpSoul(soul.soulId);
            // level=3, essence=30, fragments=0 -> 3*100 + 30*2 + 0 = 360
            expect(system.calculateSoulPower(soul.soulId)).toBe(360);
        });

        it('should scale with essence', () => {
            const { soul } = system.birthSoul({});
            system.increaseEssence(soul.soulId, 100);
            // level=1, essence=130, fragments=0 -> 1*100 + 130*2 + 0 = 360
            expect(system.calculateSoulPower(soul.soulId)).toBe(360);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSoulPower('ghost')).toBe(0);
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

        it('should execute default getSoul', () => {
            const result = system.executeTool('getSoul', { soulId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default birthSoul', () => {
            const result = system.executeTool('birthSoul', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('soulBirth', () => count++);
            unregister();
            system.birthSoul({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('soulBirth', () => { throw new Error('x'); });
            expect(() => system.birthSoul({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSouls = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSouls = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.birthSoul({});
            const json = system.toJSON();
            expect(json.souls.length).toBe(1);
        });
        it('should deserialize', () => {
            system.birthSoul({});
            const json = system.toJSON();
            const newSys = new CultivationSoul();
            newSys.fromJSON(json);
            expect(newSys.souls.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.soulCount).toBe(0);
        });
    });
});
