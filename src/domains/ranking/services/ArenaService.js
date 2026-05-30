/**
 * ArenaService - 竞技场服务 (V204)
 * 处理竞技场挑战、排名和奖励
 */
import { Arena, ArenaRewardTier } from '../entities/Arena.js';

export class ArenaService {
    constructor(gameStateAccessor) {
        this.getGameState = gameStateAccessor;
    }

    /**
     * 初始化竞技场状态
     */
    _initArenaState() {
        const gs = this.getGameState();
        if (!gs.arena) {
            gs.arena = {
                currentRank: 0,
                seasonEndAt: null,
                challenges: [],
                dailyChallenge: 0,
                maxDailyChallenge: 10,
                rewards: [],
                lastChallengeAt: null,
                challengeCooldown: 30000
            };
        }
        return gs.arena;
    }

    /**
     * 获取竞技场状态
     */
    status() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const arena = this._initArenaState();
            const now = Date.now();
            const canChallenge = !arena.lastChallengeAt || (now - arena.lastChallengeAt) >= arena.challengeCooldown;
            const remainingDaily = arena.maxDailyChallenge - arena.dailyChallenge;
            const currentPlayerRank = arena.currentRank || 0;
            return {
                success: true,
                currentRank: currentPlayerRank,
                seasonEndAt: arena.seasonEndAt,
                dailyChallenge: arena.dailyChallenge,
                maxDailyChallenge: arena.maxDailyChallenge,
                remainingDaily: remainingDaily,
                canChallenge: canChallenge,
                challengeCooldown: arena.challengeCooldown,
                lastChallengeAt: arena.lastChallengeAt,
                rewards: arena.rewards,
                message: '竞技场状态: 排名' + currentPlayerRank + '，剩余挑战次数' + remainingDaily
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 执行竞技场挑战
     * @param {string} targetId - 目标玩家ID
     */
    challenge(targetId) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!targetId) return { error: '请指定目标玩家ID' };
            const arena = this._initArenaState();
            if (arena.dailyChallenge >= arena.maxDailyChallenge) {
                return { error: '今日挑战次数已用完' };
            }
            const now = Date.now();
            if (arena.lastChallengeAt && (now - arena.lastChallengeAt) < arena.challengeCooldown) {
                const remaining = arena.challengeCooldown - (now - arena.lastChallengeAt);
                return { error: '挑战冷却中，请等待' + Math.ceil(remaining / 1000) + '秒' };
            }
            const playerPower = gs.combatPower || 5000;
            const targetPower = 5000;
            const win = playerPower > targetPower;
            const challenge = {
                targetId: targetId,
                result: win ? 'win' : 'lose',
                reward: win ? 50 : -20,
                timestamp: new Date().toISOString()
            };
            arena.challenges.push(challenge);
            arena.dailyChallenge++;
            arena.lastChallengeAt = now;
            if (win) {
                gs.spiritStones = (gs.spiritStones || 0) + 50;
                arena.currentRank = Math.max(0, arena.currentRank - 1);
            } else {
                gs.spiritStones = Math.max(0, (gs.spiritStones || 0) - 20);
                arena.currentRank = arena.currentRank + 1;
            }
            return {
                success: true,
                result: challenge.result,
                reward: challenge.reward,
                currentRank: arena.currentRank,
                message: win ? '挑战胜利！排名上升，获得50灵石' : '挑战失败，排名下降，扣除20灵石'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 领取竞技场奖励
     */
    reward() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const arena = this._initArenaState();
            const rank = arena.currentRank || 0;
            const tier = ArenaRewardTier.find(t => rank >= t.minRank && rank <= t.maxRank);
            if (!tier) {
                return { error: '排名未达到奖励要求' };
            }
            const existingReward = arena.rewards.find(r => r.seasonEndAt === arena.seasonEndAt);
            if (existingReward) {
                return { error: '本期奖励已领取' };
            }
            gs.spiritStones = (gs.spiritStones || 0) + tier.amount;
            const reward = {
                seasonEndAt: arena.seasonEndAt,
                rank: rank,
                type: tier.type,
                amount: tier.amount,
                claimedAt: new Date().toISOString()
            };
            arena.rewards.push(reward);
            return {
                success: true,
                reward: reward,
                message: '领取成功！获得' + tier.amount + '灵石（' + tier.type + '级奖励）'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取挑战历史
     * @param {number} limit - 返回记录数量
     */
    history(limit = 10) {
        try {
            const arena = this._initArenaState();
            const challenges = arena.challenges.slice(-limit).reverse();
            return {
                success: true,
                challenges: challenges,
                total: arena.challenges.length,
                message: '共' + arena.challenges.length + '条挑战记录'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 重置每日挑战次数
     */
    resetDaily() {
        const arena = this._initArenaState();
        arena.dailyChallenge = 0;
        return this;
    }
}