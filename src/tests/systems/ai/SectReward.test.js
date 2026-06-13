/**
 * SectReward.test.js - 宗门奖励系统测试
 * V482 Iteration 14/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectReward } from '../../../systems/ai/SectReward.js';

describe('SectReward', () => {
    let system;
    beforeEach(() => { system = new SectReward(); });

    describe('announceReward', () => {
        it('should announce', () => {
            const { reward } = system.announceReward({ sectId: 's1', name: 'Lotus Sword' });
            expect(reward.name).toBe('Lotus Sword');
            expect(reward.sectId).toBe('s1');
        });

        it('should default type to technique', () => {
            const { reward } = system.announceReward({});
            expect(reward.type).toBe('technique');
        });

        it('should default merit to baseMerit', () => {
            const { reward } = system.announceReward({});
            expect(reward.merit).toBe(10);
        });

        it('should set status to announced', () => {
            const { reward } = system.announceReward({});
            expect(reward.status).toBe('announced');
        });

        it('should trigger rewardAnnounced hook', () => {
            let called = false;
            system.registerHook('rewardAnnounced', () => { called = true; });
            system.announceReward({});
            expect(called).toBe(true);
        });
    });

    describe('getReward', () => {
        it('should return', () => {
            const { reward } = system.announceReward({});
            expect(system.getReward(reward.rewardId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getReward('ghost')).toBeNull(); });
    });

    describe('listRewards', () => {
        it('should list all', () => {
            system.announceReward({});
            expect(system.listRewards().length).toBe(1);
        });
        it('should return empty initially', () => {
            expect(system.listRewards().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.announceReward({ sectId: 's1' });
            system.announceReward({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty for unknown sect', () => {
            system.announceReward({ sectId: 's1' });
            expect(system.listBySect('ghost').length).toBe(0);
        });
    });

    describe('listClaimed', () => {
        it('should filter claimed', () => {
            const { reward: r1 } = system.announceReward({});
            const { reward: r2 } = system.announceReward({});
            system.claimReward(r1.rewardId);
            expect(system.listClaimed().length).toBe(1);
        });

        it('should return empty when none claimed', () => {
            system.announceReward({});
            expect(system.listClaimed().length).toBe(0);
        });
    });

    describe('addRecipient', () => {
        it('should add recipient', () => {
            const { reward } = system.announceReward({});
            system.addRecipient(reward.rewardId, 'm1');
            expect(reward.recipients.length).toBe(1);
        });

        it('should add multiple recipients', () => {
            const { reward } = system.announceReward({});
            system.addRecipient(reward.rewardId, 'm1');
            system.addRecipient(reward.rewardId, 'm2');
            expect(reward.recipients.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addRecipient('ghost', 'm1');
            expect(result.error).toBe('REWARD_NOT_FOUND');
        });

        it('should trigger recipientAdded hook', () => {
            const { reward } = system.announceReward({});
            let called = false;
            system.registerHook('recipientAdded', () => { called = true; });
            system.addRecipient(reward.rewardId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('increaseMerit', () => {
        it('should increase by default', () => {
            const { reward } = system.announceReward({});
            system.increaseMerit(reward.rewardId);
            expect(reward.merit).toBe(20);
        });

        it('should increase by amount', () => {
            const { reward } = system.announceReward({});
            system.increaseMerit(reward.rewardId, 50);
            expect(reward.merit).toBe(60);
        });

        it('should reject missing', () => {
            const result = system.increaseMerit('ghost', 10);
            expect(result.error).toBe('REWARD_NOT_FOUND');
        });

        it('should trigger meritIncreased hook', () => {
            const { reward } = system.announceReward({});
            let called = false;
            system.registerHook('meritIncreased', () => { called = true; });
            system.increaseMerit(reward.rewardId, 5);
            expect(called).toBe(true);
        });
    });

    describe('claimReward', () => {
        it('should claim', () => {
            const { reward } = system.announceReward({});
            system.claimReward(reward.rewardId);
            expect(reward.status).toBe('claimed');
        });

        it('should reject missing', () => {
            const result = system.claimReward('ghost');
            expect(result.error).toBe('REWARD_NOT_FOUND');
        });

        it('should trigger rewardClaimed hook', () => {
            const { reward } = system.announceReward({});
            let called = false;
            system.registerHook('rewardClaimed', () => { called = true; });
            system.claimReward(reward.rewardId);
            expect(called).toBe(true);
        });
    });

    describe('expireReward', () => {
        it('should expire', () => {
            const { reward } = system.announceReward({});
            system.expireReward(reward.rewardId);
            expect(reward.status).toBe('expired');
        });

        it('should reject missing', () => {
            const result = system.expireReward('ghost');
            expect(result.error).toBe('REWARD_NOT_FOUND');
        });

        it('should trigger rewardExpired hook', () => {
            const { reward } = system.announceReward({});
            let called = false;
            system.registerHook('rewardExpired', () => { called = true; });
            system.expireReward(reward.rewardId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRewardValue', () => {
        it('should calculate', () => {
            const { reward } = system.announceReward({ merit: 20 });
            system.addRecipient(reward.rewardId, 'm1');
            system.addRecipient(reward.rewardId, 'm2');
            expect(system.calculateRewardValue(reward.rewardId)).toBe(20 * 10 + 2 * 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRewardValue('ghost')).toBe(0);
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

        it('should execute default getReward', () => {
            const result = system.executeTool('getReward', { rewardId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('rewardAnnounced', () => count++);
            unregister();
            system.announceReward({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('rewardAnnounced', () => { throw new Error('x'); });
            expect(() => system.announceReward({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRewards = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRewards = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.announceReward({});
            const json = system.toJSON();
            expect(json.rewards.length).toBe(1);
        });
        it('should deserialize', () => {
            system.announceReward({});
            const json = system.toJSON();
            const newSys = new SectReward();
            newSys.fromJSON(json);
            expect(newSys.rewards.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.rewardCount).toBe(0);
        });
    });
});
