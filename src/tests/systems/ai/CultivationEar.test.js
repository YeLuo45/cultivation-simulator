/**
 * CultivationEar.test.js - 道耳系统测试
 * V522 Iteration 4/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEar } from '../../../systems/ai/CultivationEar.js';

describe('CultivationEar', () => {
    let system;
    beforeEach(() => { system = new CultivationEar(); });

    describe('openEar', () => {
        it('should open ear', () => {
            const { ear } = system.openEar({ cultivatorId: 'c1', name: 'Heavenly Ear' });
            expect(ear.cultivatorId).toBe('c1');
            expect(ear.name).toBe('Heavenly Ear');
        });

        it('should default to open status', () => {
            const { ear } = system.openEar({});
            expect(ear.status).toBe('open');
        });

        it('should default type to heavenly', () => {
            const { ear } = system.openEar({});
            expect(ear.type).toBe('heavenly');
        });

        it('should default sensitivity to baseSensitivity', () => {
            const { ear } = system.openEar({});
            expect(ear.sensitivity).toBe(20);
        });

        it('should start at level 1', () => {
            const { ear } = system.openEar({});
            expect(ear.level).toBe(1);
        });

        it('should start with empty sounds', () => {
            const { ear } = system.openEar({});
            expect(ear.sounds).toEqual([]);
        });

        it('should allow custom sensitivity', () => {
            const { ear } = system.openEar({ sensitivity: 75 });
            expect(ear.sensitivity).toBe(75);
        });

        it('should generate earId when not provided', () => {
            const { ear } = system.openEar({});
            expect(ear.earId).toBeTruthy();
        });

        it('should use provided earId', () => {
            const { ear } = system.openEar({ earId: 'custom-ear-1' });
            expect(ear.earId).toBe('custom-ear-1');
        });

        it('should trigger earOpened hook', () => {
            let called = false;
            system.registerHook('earOpened', () => { called = true; });
            system.openEar({});
            expect(called).toBe(true);
        });

        it('should increment totalEars stat', () => {
            system.openEar({});
            system.openEar({});
            expect(system.stats.totalEars).toBe(2);
        });
    });

    describe('getEar', () => {
        it('should return', () => {
            const { ear } = system.openEar({});
            expect(system.getEar(ear.earId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEar('ghost')).toBeNull(); });
    });

    describe('listEars', () => {
        it('should list all', () => {
            system.openEar({});
            system.openEar({});
            expect(system.listEars().length).toBe(2);
        });

        it('should return empty when no ears', () => {
            expect(system.listEars().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.openEar({ cultivatorId: 'c1' });
            system.openEar({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });

        it('should return empty for unknown cultivator', () => {
            system.openEar({ cultivatorId: 'c1' });
            expect(system.listByCultivator('unknown').length).toBe(0);
        });
    });

    describe('listAwakened', () => {
        it('should filter awakened only', () => {
            const { ear: e1 } = system.openEar({});
            const { ear: e2 } = system.openEar({});
            system.awakenEar(e1.earId);
            const awakened = system.listAwakened();
            expect(awakened.length).toBe(1);
            expect(awakened[0].earId).toBe(e1.earId);
            expect(e2.status).toBe('open');
        });

        it('should return empty when no awakened', () => {
            system.openEar({});
            expect(system.listAwakened().length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.openEar({ type: 'heavenly' });
            system.openEar({ type: 'demonic' });
            system.openEar({ type: 'spirit' });
            expect(system.listByType('heavenly').length).toBe(1);
            expect(system.listByType('demonic').length).toBe(1);
            expect(system.listByType('spirit').length).toBe(1);
        });
    });

    describe('addSound', () => {
        it('should add sound', () => {
            const { ear } = system.openEar({});
            system.addSound(ear.earId, 'a distant bell');
            expect(ear.sounds).toContain('a distant bell');
        });

        it('should add multiple sounds', () => {
            const { ear } = system.openEar({});
            system.addSound(ear.earId, 's1');
            system.addSound(ear.earId, 's2');
            expect(ear.sounds.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSound('ghost', 'v');
            expect(result.error).toBe('EAR_NOT_FOUND');
        });

        it('should trigger soundAdded hook', () => {
            const { ear } = system.openEar({});
            let called = false;
            system.registerHook('soundAdded', () => { called = true; });
            system.addSound(ear.earId, 'v');
            expect(called).toBe(true);
        });
    });

    describe('increaseSensitivity', () => {
        it('should increase sensitivity by default', () => {
            const { ear } = system.openEar({});
            system.increaseSensitivity(ear.earId);
            expect(ear.sensitivity).toBe(25);
        });

        it('should increase sensitivity by custom amount', () => {
            const { ear } = system.openEar({});
            system.increaseSensitivity(ear.earId, 50);
            expect(ear.sensitivity).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.increaseSensitivity('ghost');
            expect(result.error).toBe('EAR_NOT_FOUND');
        });

        it('should trigger sensitivityIncreased hook', () => {
            const { ear } = system.openEar({});
            let called = false;
            system.registerHook('sensitivityIncreased', () => { called = true; });
            system.increaseSensitivity(ear.earId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEar', () => {
        it('should level up', () => {
            const { ear } = system.openEar({});
            system.levelUpEar(ear.earId);
            expect(ear.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpEar('ghost');
            expect(result.error).toBe('EAR_NOT_FOUND');
        });

        it('should trigger earLeveledUp hook', () => {
            const { ear } = system.openEar({});
            let called = false;
            system.registerHook('earLeveledUp', () => { called = true; });
            system.levelUpEar(ear.earId);
            expect(called).toBe(true);
        });
    });

    describe('awakenEar', () => {
        it('should awaken ear', () => {
            const { ear } = system.openEar({});
            system.awakenEar(ear.earId);
            expect(ear.status).toBe('awakened');
        });

        it('should reject missing', () => {
            const result = system.awakenEar('ghost');
            expect(result.error).toBe('EAR_NOT_FOUND');
        });

        it('should trigger earAwakened hook', () => {
            const { ear } = system.openEar({});
            let called = false;
            system.registerHook('earAwakened', () => { called = true; });
            system.awakenEar(ear.earId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEarPower', () => {
        it('should calculate', () => {
            const { ear } = system.openEar({});
            // level=1, sensitivity=20, sounds=0 -> 1*50 + 20 + 0 = 70
            expect(system.calculateEarPower(ear.earId)).toBe(70);
        });

        it('should include sounds in power', () => {
            const { ear } = system.openEar({});
            system.addSound(ear.earId, 's1');
            system.addSound(ear.earId, 's2');
            // level=1, sensitivity=20, sounds=2 -> 1*50 + 20 + 2*15 = 100
            expect(system.calculateEarPower(ear.earId)).toBe(100);
        });

        it('should scale with level', () => {
            const { ear } = system.openEar({});
            system.levelUpEar(ear.earId);
            system.levelUpEar(ear.earId);
            // level=3, sensitivity=20, sounds=0 -> 3*50 + 20 + 0 = 170
            expect(system.calculateEarPower(ear.earId)).toBe(170);
        });

        it('should scale with sensitivity', () => {
            const { ear } = system.openEar({});
            system.increaseSensitivity(ear.earId, 30);
            // level=1, sensitivity=50, sounds=0 -> 1*50 + 50 + 0 = 100
            expect(system.calculateEarPower(ear.earId)).toBe(100);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEarPower('ghost')).toBe(0);
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

        it('should execute default getEar', () => {
            const result = system.executeTool('getEar', { earId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('earOpened', () => count++);
            unregister();
            system.openEar({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('earOpened', () => { throw new Error('x'); });
            expect(() => system.openEar({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEars = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEars = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openEar({});
            const json = system.toJSON();
            expect(json.ears.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openEar({});
            const json = system.toJSON();
            const newSys = new CultivationEar();
            newSys.fromJSON(json);
            expect(newSys.ears.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.earCount).toBe(0);
        });
    });

    describe('config', () => {
        it('should accept custom config', () => {
            const custom = new CultivationEar({ maxEars: 200, baseSensitivity: 50 });
            expect(custom.config.maxEars).toBe(200);
            expect(custom.config.baseSensitivity).toBe(50);
        });
    });
});
