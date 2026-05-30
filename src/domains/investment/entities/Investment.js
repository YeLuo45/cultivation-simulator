/**
 * Investment Entity - 投资实体 (V199/V207)
 * 代表玩家的投资项目
 */
export class Investment {
    constructor({
        id,
        name,
        shares,
        amount,
        dailyReturn,
        duration,
        category,
        riskLevel,
        purchasedAt,
        lastClaimedAt = null,
        redeemedAt = null
    }) {
        this.id = id;
        this.name = name;
        this.shares = shares;
        this.amount = amount;
        this.dailyReturn = dailyReturn;
        this.duration = duration;
        this.category = category;
        this.riskLevel = riskLevel;
        this.purchasedAt = purchasedAt || new Date().toISOString();
        this.lastClaimedAt = lastClaimedAt;
        this.redeemedAt = redeemedAt;
    }

    /**
     * 是否已赎回
     */
    isRedeemed() {
        return this.redeemedAt !== null;
    }

    /**
     * 是否可领取收益
     */
    canClaim() {
        if (this.isRedeemed()) return false;
        if (!this.lastClaimedAt) return true;
        const lastClaimed = new Date(this.lastClaimedAt).getTime();
        const daysSinceLastClaim = Math.floor((Date.now() - lastClaimed) / (24 * 60 * 60 * 1000));
        return daysSinceLastClaim >= 1;
    }

    /**
     * 计算已过天数
     */
    getDaysPassed() {
        const purchased = new Date(this.purchasedAt).getTime();
        return Math.floor((Date.now() - purchased) / (24 * 60 * 60 * 1000));
    }

    /**
     * 领取收益
     */
    claim() {
        if (!this.canClaim()) return { success: false, error: '今日已领取过收益' };
        const earnedProfit = this.dailyReturn;
        this.lastClaimedAt = new Date().toISOString();
        return { success: true, earnedProfit, dailyReturn: this.dailyReturn };
    }

    /**
     * 赎回投资
     */
    redeem() {
        if (this.isRedeemed()) return { success: false, error: '已赎回' };
        const daysPassed = this.getDaysPassed();
        const earnedProfit = Math.min(daysPassed, this.duration) * this.dailyReturn;
        const penalty = daysPassed < this.duration ? Math.floor(earnedProfit * 0.2) : 0;
        const redeemValue = this.amount + earnedProfit - penalty;
        this.redeemedAt = new Date().toISOString();
        return {
            success: true,
            originalAmount: this.amount,
            earnedProfit,
            penalty,
            redeemValue,
            message: penalty > 0 ? '提前赎回！扣除惩罚' + penalty + '灵石' : '赎回成功'
        };
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            shares: this.shares,
            amount: this.amount,
            dailyReturn: this.dailyReturn,
            duration: this.duration,
            category: this.category,
            riskLevel: this.riskLevel,
            purchasedAt: this.purchasedAt,
            lastClaimedAt: this.lastClaimedAt,
            redeemedAt: this.redeemedAt
        };
    }

    static fromGameState(data) {
        return new Investment({
            id: data.id,
            name: data.name,
            shares: data.shares,
            amount: data.amount,
            dailyReturn: data.dailyReturn,
            duration: data.duration,
            category: data.category,
            riskLevel: data.riskLevel,
            purchasedAt: data.purchasedAt,
            lastClaimedAt: data.lastClaimedAt,
            redeemedAt: data.redeemedAt
        });
    }
}

/**
 * InvestmentProduct - 投资产品配置
 */
export class InvestmentProduct {
    constructor({
        id,
        name,
        category,
        description,
        cost,
        dailyReturn,
        duration,
        dailyLimit,
        riskLevel,
        minAmount,
        maxAmount,
        totalShares,
        soldShares = 0,
        investors = []
    }) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.cost = cost;
        this.dailyReturn = dailyReturn;
        this.duration = duration;
        this.dailyLimit = dailyLimit;
        this.riskLevel = riskLevel;
        this.minAmount = minAmount;
        this.maxAmount = maxAmount;
        this.totalShares = totalShares;
        this.soldShares = soldShares;
        this.investors = investors;
    }

    /**
     * 获取可用份额
     */
    getAvailableShares() {
        return this.totalShares - this.soldShares;
    }

    /**
     * 是否还有可用份额
     */
    hasAvailableShares() {
        return this.getAvailableShares() > 0;
    }

    /**
     * 计算预期总收益
     */
    getExpectedTotalReturn() {
        return this.dailyReturn * this.duration;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            description: this.description,
            cost: this.cost,
            dailyReturn: this.dailyReturn,
            duration: this.duration,
            dailyLimit: this.dailyLimit,
            riskLevel: this.riskLevel,
            minAmount: this.minAmount,
            maxAmount: this.maxAmount,
            totalShares: this.totalShares,
            soldShares: this.soldShares,
            investors: this.investors
        };
    }
}