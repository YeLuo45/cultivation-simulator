/**
 * CultivationSpirit.test.js - 道灵系统测试
 * V527 Iteration 9/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSpirit } from '../../../systems/ai/CultivationSpirit.js';

describe('CultivationSpirit', () => {
    let system;
    beforeEach(() => { system = new CultivationSpirit(); });

    describe('awakenSpirit', () => {
        it('should awaken', () => {
            const { spirit } = system.awakenSpirit({ cultivatorId: 'c1', name: 'Aria' });
            expect(spirit.cultivatorId).toBe('c1');
            expect(spirit.name).toBe('Aria');
        });

        it('should default to ancestral type', () => {
            const { spirit } = system.awakenSpirit({});
            expect(spirit.type).toBe('ancestral');
        });

        it('should default name to Spirit', () => {
            const { spirit } = system.awakenSpirit({});
            expect(spirit.name).toBe('Spirit');
        });

        it('should set status to awakened', () => {
            const { spirit } = system.awakenSpirit({});
            expect(spirit.status).toBe('awakened');
        });

        it('should accept custom id', () => {
            const { spirit } = system.awakenSpirit({ id: 'spirit_99' });
            expect(spirit.spiritId).toBe('spirit_99');
        });

        it('should trigger spiritAwakened hook', () => {
            let called = false;
            system.registerHook('spiritAwakened', () => { called = true; });
            system.awakenSpirit({});
            expect(called).toBe(true);
        });
    });

    describe('getSpirit', () => {
        it('should return', () => {
            const { spirit } = system.awakenSpirit({});
            expect(system.getSpirit(spirit.spiritId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSpirit('ghost')).toBeNull(); });
    });

    describe('listSpirits', () => {
        it('should list all', () => {
            system.awakenSpirit({});
            system.awakenSpirit({});
            expect(system.listSpirits().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listSpirits().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.awakenSpirit({ cultivatorId: 'c1' });
            system.awakenSpirit({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });

        it('should return empty for missing cultivator', () => {
            system.awakenSpirit({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listTranscendent', () => {
        it('should filter transcendent', () => {
            const { spirit: a } = system.awakenSpirit({});
            const { spirit: b } = system.awakenSpirit({});
            system.transcendSpirit(a.spiritId);
            expect(system.listTranscendent().length).toBe(1);
        });

        it('should return empty when none transcendent', () => {
            system.awakenSpirit({});
            expect(system.listTranscendent().length).toBe(0);
        });
    });

    describe('addChannel', () => {
        it('should add', () => {
            const { spirit } = system.awakenSpirit({});
            system.addChannel(spirit.spiritId, 'throat');
            expect(spirit.channels.length).toBe(1);
        });

        it('should not duplicate', () => {
            const { spirit } = system.awakenSpirit({});
            system.addChannel(spirit.spiritId, 'throat');
            system.addChannel(spirit.spiritId, 'throat');
            expect(spirit.channels.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addChannel('ghost', 'throat');
            expect(result.error).toBe('SPIRIT_NOT_FOUND');
        });

        it('should trigger channelAdded hook', () => {
            const { spirit } = system.awakenSpirit({});
            let called = false;
            system.registerHook('channelAdded', () => { called = true; });
            system.addChannel(spirit.spiritId, 'throat');
            expect(called).toBe(true);
        });
    });

    describe('increaseQi', () => {
        it('should increase', () => {
            const { spirit } = system.awakenSpirit({});
            system.increaseQi(spirit.spiritId, 10);
            expect(spirit.qi).toBe(40);
        });

        it('should default amount to 5', () => {
            const { spirit } = system.awakenSpirit({});
            system.increaseQi(spirit.spiritId);
            expect(spirit.qi).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.increaseQi('ghost', 10);
            expect(result.error).toBe('SPIRIT_NOT_FOUND');
        });

        it('should trigger qiIncreased hook', () => {
            const { spirit } = system.awakenSpirit({});
            let called = false;
            system.registerHook('qiIncreased', () => { called = true; });
            system.increaseQi(spirit.spiritId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSpirit', () => {
        it('should level up', () => {
            const { spirit } = system.awakenSpirit({});
            system.levelUpSpirit(spirit.spiritId);
            expect(spirit.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSpirit('ghost');
            expect(result.error).toBe('SPIRIT_NOT_FOUND');
        });

        it('should trigger spiritLeveledUp hook', () => {
            const { spirit } = system.awakenSpirit({});
            let called = false;
            system.registerHook('spiritLeveledUp', () => { called = true; });
            system.levelUpSpirit(spirit.spiritId);
            expect(called).toBe(true);
        });
    });

    describe('transcendSpirit', () => {
        it('should transcend', () => {
            const { spirit } = system.awakenSpirit({});
            system.transcendSpirit(spirit.spiritId);
            expect(spirit.status).toBe('transcendent');
        });

        it('should reject missing', () => {
            const result = system.transcendSpirit('ghost');
            expect(result.error).toBe('SPIRIT_NOT_FOUND');
        });

        it('should trigger spiritTranscended hook', () => {
            const { spirit } = system.awakenSpirit({});
            let called = false;
            system.registerHook('spiritTranscended', () => { called = true; });
            system.transcendSpirit(spirit.spiritId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSpiritPower', () => {
        it('should calculate', () => {
            const { spirit } = system.awakenSpirit({});
            // level 1 * 100 + qi 30 * 2 + 0 channels * 30 = 160
            expect(system.calculateSpiritPower(spirit.spiritId)).toBe(160);
        });

        it('should include channel bonuses', () => {
            const { spirit } = system.awakenSpirit({});
            system.addChannel(spirit.spiritId, 'throat');
            system.addChannel(spirit.spiritId, 'heart');
            // level 1 * 100 + qi 30 * 2 + 2 * 30 = 220
            expect(system.calculateSpiritPower(spirit.spiritId)).toBe(220);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSpiritPower('ghost')).toBe(0);
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

        it('should execute default getSpirit', () => {
            const result = system.executeTool('getSpirit', { spiritId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default awakenSpirit', () => {
            const result = system.executeTool('awakenSpirit', { cultivatorId: 'c1', name: 'Sage' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('spiritAwakened', () => count++);
            unregister();
            system.awakenSpirit({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('spiritAwakened', () => { throw new Error('x'); });
            expect(() => system.awakenSpirit({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSpirits = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSpirits = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.awakenSpirit({});
            const json = system.toJSON();
            expect(json.spirits.length).toBe(1);
        });
        it('should deserialize', () => {
            system.awakenSpirit({});
            const json = system.toJSON();
            const newSys = new CultivationSpirit();
            newSys.fromJSON(json);
            expect(newSys.spirits.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.spiritCount).toBe(0);
        });
    });

    describe('Config', () => {
        it('should accept custom config', () => {
            const s = new CultivationSpirit({ maxSpirits: 100, baseQi: 50 });
            expect(s.config.maxSpirits).toBe(100);
            expect(s.config.baseQi).toBe(50);
        });

        it('should use baseQi default in awaken', () => {
            const { spirit } = system.awakenSpirit({});
            expect(spirit.qi).toBe(30);
        });
    });
});
