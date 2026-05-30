/**
 * Arena Entity - 竞技场实体 (V204)
 * 代表玩家的竞技场状态和挑战记录
 */
export class Arena {
    constructor({
        currentRank = 0,
        seasonEndAt = null,
        challenges = [],
        dailyChallenge = 0,
        maxDailyChallenge = 10,
        rewards = [],
        lastChallengeAt = null,
        challengeCooldown = 30000
    }) {
        this.currentRank = currentRank;
        this.seasonEndAt = seasonEndAt;
        this.challenges = challenges;
        this.dailyChallenge = dailyChallenge;
        this.maxDailyChallenge = maxDailyChallenge;
        this.rewards = rewards;
        this.lastChallengeAt = lastChallengeAt;
        this.challengeCooldown = challengeCooldown;
    }

    /**
     * 是否可挑战
     */
    canChallenge() {
        if (this.dailyChallenge >= this.maxDailyChallenge) return false;
        if (this.lastChallengeAt) {
            const now = Date.now();
            if (now - this.lastChallengeAt < this.challengeCooldown) return false;
        }
        return true;
    }

    /**
     * 获取剩余挑战次数
     */
    getRemainingChallenges() {
        return this.maxDailyChallenge - this.dailyChallenge;
    }

    /**
     * 获取冷却剩余时间(毫秒)
     */
    getCooldownRemaining() {
        if (!this.lastChallengeAt) return 0;
        const elapsed = Date.now() - this.lastChallengeAt;
        if (elapsed >= this.challengeCooldown) return 0;
        return this.challengeCooldown - elapsed;
    }

    /**
     * 添加挑战记录
     */
    addChallenge(targetId, result, reward) {
        this.challenges.push({
            targetId,
            result,
            reward,
            timestamp: new Date().toISOString()
        });
        this.dailyChallenge++;
        this.lastChallengeAt = Date.now();
    }

    toJSON() {
        return {
            currentRank: this.currentRank,
            seasonEndAt: this.seasonEndAt,
            challenges: this.challenges,
            dailyChallenge: this.dailyChallenge,
            maxDailyChallenge: this.maxDailyChallenge,
            rewards: this.rewards,
            lastChallengeAt: this.lastChallengeAt,
            challengeCooldown: this.challengeCooldown
        };
    }

    static fromGameState(data) {
        return new Arena({
            currentRank: data.currentRank || 0,
            seasonEndAt: data.seasonEndAt,
            challenges: data.challenges || [],
            dailyChallenge: data.dailyChallenge || 0,
            maxDailyChallenge: data.maxDailyChallenge || 10,
            rewards: data.rewards || [],
            lastChallengeAt: data.lastChallengeAt,
            challengeCooldown: data.challengeCooldown || 30000
        });
    }
}

/**
 * ArenaChallenge - 竞技场挑战记录
 */
export class ArenaChallenge {
    constructor({ targetId, result, reward, timestamp = Date.now() }) {
        this.targetId = targetId;
        this.result = result; // 'win' | 'lose'
        this.reward = reward;
        this.timestamp = timestamp;
    }

    isWin() {
        return this.result === 'win';
    }
}

/**
 * ArenaRewardTier - 竞技场奖励等级
 */
export const ArenaRewardTier = [
    { minRank: 1, maxRank: 10, type: 'legendary', amount: 5000 },
    { minRank: 11, maxRank: 50, type: 'epic', amount: 2000 },
    { minRank: 51, maxRank: 100, type: 'rare', amount: 1000 },
    { minRank: 101, maxRank: 500, type: 'common', amount: 500 }
];