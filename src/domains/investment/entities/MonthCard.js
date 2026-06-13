/**
 * MonthCard Entity - 月卡实体 (V199/V207)
 * 代表玩家的月卡订阅
 */
export class MonthCard {
    constructor({
        id,
        type,
        name,
        purchaseDate,
        expireDate,
        dailyReward,
        benefitMultiplier = 1.0,
        totalClaimed = 0
    }) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.purchaseDate = purchaseDate || new Date().toISOString();
        this.expireDate = expireDate;
        this.dailyReward = dailyReward;
        this.benefitMultiplier = benefitMultiplier;
        this.totalClaimed = totalClaimed;
    }

    /**
     * 是否已过期
     */
    isExpired() {
        return new Date(this.expireDate).getTime() < Date.now();
    }

    /**
     * 获取剩余天数
     */
    getDaysRemaining() {
        const now = Date.now();
        const expire = new Date(this.expireDate).getTime();
        return Math.max(0, Math.ceil((expire - now) / (24 * 60 * 60 * 1000)));
    }

    /**
     * 是否可领取每日奖励
     */
    canClaimDaily() {
        if (this.isExpired()) return false;
        return this.getDaysRemaining() > 0;
    }

    /**
     * 计算实际奖励金额
     */
    calculateReward() {
        return Math.floor(this.dailyReward * this.benefitMultiplier);
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            purchaseDate: this.purchaseDate,
            expireDate: this.expireDate,
            dailyReward: this.dailyReward,
            benefitMultiplier: this.benefitMultiplier,
            totalClaimed: this.totalClaimed
        };
    }

    static fromGameState(data) {
        return new MonthCard({
            id: data.id,
            type: data.type,
            name: data.name,
            purchaseDate: data.purchaseDate,
            expireDate: data.expireDate,
            dailyReward: data.dailyReward,
            benefitMultiplier: data.benefitMultiplier || 1.0,
            totalClaimed: data.totalClaimed || 0
        });
    }
}

/**
 * MonthCardTier - 月卡等级配置
 */
export class MonthCardTier {
    constructor({ type, cost, dailyReward, durationDays, name, benefitMultiplier = 1.0 }) {
        this.type = type;
        this.cost = cost;
        this.dailyReward = dailyReward;
        this.durationDays = durationDays;
        this.name = name;
        this.benefitMultiplier = benefitMultiplier;
    }

    /**
     * 计算每天的实际收益
     */
    getActualDailyReward() {
        return Math.floor(this.dailyReward * this.benefitMultiplier);
    }

    /**
     * 计算总收益
     */
    getTotalReward() {
        return this.dailyReward * this.durationDays;
    }
}