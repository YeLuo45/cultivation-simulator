/**
 * CultivationQi.test.js - 修真气系统测试
 * V723 Iteration 16/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationQi } from '../../../systems/ai/CultivationQi.js';

describe('CultivationQi', () => {
    let system;
    beforeEach(() => { system = new CultivationQi(); });

    describe('recruitQi', () => {
        it('should recruit', () => {
            const { qi } = system.recruitQi({ masterId: 'm1', name: 'Azure Dragon Qi' });
            expect(qi.masterId).toBe('m1');
            expect(qi.name).toBe('Azure Dragon Qi');
        });

        it('should default type to mixed', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            expect(qi.type).toBe('mixed');
        });

        it('should support yang type', () => {
            const { qi } = system.recruitQi({ masterId: 'm1', type: 'yang' });
            expect(qi.type).toBe('yang');
        });

        it('should support yin type', () => {
            const { qi } = system.recruitQi({ masterId: 'm1', type: 'yin' });
            expect(qi.type).toBe('yin');
        });

        it('should use provided qiId', () => {
            const { qi } = system.recruitQi({ qiId: 'custom_qi_1', masterId: 'm1' });
            expect(qi.qiId).toBe('custom_qi_1');
        });

        it('should trigger qiRecruited hook', () => {
            let called = false;
            system.registerHook('qiRecruited', () => { called = true; });
            system.recruitQi({ masterId: 'm1' });
            expect(called).toBe(true);
        });

        it('should default potency to basePotency', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            expect(qi.potency).toBe(20);
        });

        it('should respect custom potency', () => {
            const { qi } = system.recruitQi({ masterId: 'm1', potency: 100 });
            expect(qi.potency).toBe(100);
        });

        it('should start as novice', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            expect(qi.status).toBe('novice');
        });
    });

    describe('getQi', () => {
        it('should return', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            expect(system.getQi(qi.qiId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getQi('ghost')).toBeNull(); });
    });

    describe('listQis', () => {
        it('should list all', () => {
            system.recruitQi({ masterId: 'm1' });
            expect(system.listQis().length).toBe(1);
        });

        it('should return empty when none', () => {
            expect(system.listQis().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitQi({ masterId: 'm1' });
            system.recruitQi({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitQi({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { qi: q1 } = system.recruitQi({ masterId: 'm1' });
            system.recruitQi({ masterId: 'm1' });
            system.legendQi(q1.qiId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitQi({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addChannel', () => {
        it('should add channel', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            system.addChannel(qi.qiId, 'governor');
            expect(qi.channels).toContain('governor');
        });

        it('should add multiple channels', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            system.addChannel(qi.qiId, 'governor');
            system.addChannel(qi.qiId, 'conception');
            expect(qi.channels.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addChannel('ghost', 'governor');
            expect(result.error).toBe('QI_NOT_FOUND');
        });

        it('should trigger channelAdded hook', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            let called = false;
            system.registerHook('channelAdded', () => { called = true; });
            system.addChannel(qi.qiId, 'governor');
            expect(called).toBe(true);
        });
    });

    describe('raisePotency', () => {
        it('should raise with default amount', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            system.raisePotency(qi.qiId);
            expect(qi.potency).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            system.raisePotency(qi.qiId, 50);
            expect(qi.potency).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.raisePotency('ghost', 10);
            expect(result.error).toBe('QI_NOT_FOUND');
        });

        it('should trigger potencyRaised hook', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            let called = false;
            system.registerHook('potencyRaised', () => { called = true; });
            system.raisePotency(qi.qiId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpQi', () => {
        it('should level up', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            system.levelUpQi(qi.qiId);
            expect(qi.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            system.levelUpQi(qi.qiId);
            system.levelUpQi(qi.qiId);
            system.levelUpQi(qi.qiId);
            expect(qi.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpQi('ghost');
            expect(result.error).toBe('QI_NOT_FOUND');
        });

        it('should trigger qiLeveledUp hook', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            let called = false;
            system.registerHook('qiLeveledUp', () => { called = true; });
            system.levelUpQi(qi.qiId);
            expect(called).toBe(true);
        });
    });

    describe('legendQi', () => {
        it('should change status to legendary', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            system.legendQi(qi.qiId);
            expect(qi.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendQi('ghost');
            expect(result.error).toBe('QI_NOT_FOUND');
        });

        it('should trigger qiLegendized hook', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            let called = false;
            system.registerHook('qiLegendized', () => { called = true; });
            system.legendQi(qi.qiId);
            expect(called).toBe(true);
        });
    });

    describe('calculateQiValue', () => {
        it('should calculate base value', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            // level 1 * 100 + potency 20 * 2 + 0 channels * 30 = 100 + 40 + 0 = 140
            expect(system.calculateQiValue(qi.qiId)).toBe(140);
        });

        it('should include channels', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            system.addChannel(qi.qiId, 'governor');
            system.addChannel(qi.qiId, 'conception');
            // 100 + 40 + 60 = 200
            expect(system.calculateQiValue(qi.qiId)).toBe(200);
        });

        it('should include level', () => {
            const { qi } = system.recruitQi({ masterId: 'm1' });
            system.levelUpQi(qi.qiId);
            system.levelUpQi(qi.qiId);
            // 3 * 100 + 40 + 0 = 340
            expect(system.calculateQiValue(qi.qiId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateQiValue('ghost')).toBe(0);
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

        it('should execute default recruitQi', () => {
            const result = system.executeTool('recruitQi', { masterId: 'm1' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('qiRecruited', () => count++);
            unregister();
            system.recruitQi({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('qiRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitQi({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalQis = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalQis = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitQi({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.qis.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitQi({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationQi();
            newSys.fromJSON(json);
            expect(newSys.qis.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.qiCount).toBe(0);
        });

        it('should reflect recruited qis', () => {
            system.recruitQi({ masterId: 'm1' });
            const stats = system.getStats();
            expect(stats.qiCount).toBe(1);
            expect(stats.totalQis).toBe(1);
        });
    });
});
