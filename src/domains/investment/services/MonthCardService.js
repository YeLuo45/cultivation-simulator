/**
 * MonthCardService - 月卡服务 (V199/V207)
 * 处理月卡的购买和每日奖励领取
 */
import { MonthCard, MonthCardTier } from '../entities/MonthCard.js';

// 月卡配置 (V207)
export const MONTHCARD_CONFIG = {
    tiers: {
        monthly: { cost: 300, dailyReward: 100, durationDays: 30, name: '月卡', benefitMultiplier: 1.0 },
        quarterly: { cost: 800, dailyReward: 300, durationDays: 90, name: '季卡', benefitMultiplier: 1.1 },
        annual: { cost: 2000, dailyReward: 1000, durationDays: 365, name: '年卡', benefitMultiplier: 1.3 }
    }
};

export class MonthCardService {
    constructor(gameStateAccessor) {
        this.getGameState = gameStateAccessor;
    }

    /**
     * 初始化月卡状态
     */
    _initMonthcardState() {
        const gs = this.getGameState();
        if (!gs.monthcard) {
            gs.monthcard = {
                cards: [],
                activeCards: []
            };
        }
        return gs.monthcard;
    }

    /**
     * 获取月卡状态
     */
    status() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const mc = this._initMonthcardState();
            if (mc.cards.length === 0) {
                return { success: true, active: false, cards: [], message: '月卡未激活，请购买', availableTiers: Object.keys(MONTHCARD_CONFIG.tiers) };
            }
            const now = Date.now();
            const activeCards = mc.cards.filter(c => new Date(c.expireDate).getTime() > now);
            mc.activeCards = activeCards;
            return {
                success: true,
                active: activeCards.length > 0,
                cards: activeCards.map(c => {
                    const tierInfo = MONTHCARD_CONFIG.tiers[c.type];
                    const daysRemaining = Math.ceil((new Date(c.expireDate).getTime() - now) / (24 * 60 * 60 * 1000));
                    return {
                        type: c.type,
                        name: tierInfo ? tierInfo.name : c.type,
                        purchaseDate: c.purchaseDate,
                        expireDate: c.expireDate,
                        daysRemaining: Math.max(0, daysRemaining),
                        dailyReward: tierInfo ? tierInfo.dailyReward : 0,
                        benefitMultiplier: tierInfo ? tierInfo.benefitMultiplier : 1.0
                    };
                }),
                message: '共有' + activeCards.length + '种活跃月卡'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 购买月卡
     * @param {string} monthcardType - 月卡类型：monthly/quarterly/annual
     */
    buy(monthcardType) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const type = monthcardType || 'monthly';
            const tierInfo = MONTHCARD_CONFIG.tiers[type];
            if (!tierInfo) {
                return { success: false, error: '无效的月卡类型: ' + type + '，可用类型: ' + Object.keys(MONTHCARD_CONFIG.tiers).join('/') };
            }
            const mc = this._initMonthcardState();
            if ((gs.spiritStones || 0) < tierInfo.cost) {
                return { success: false, error: '灵石不足，购买' + tierInfo.name + '需要' + tierInfo.cost + '灵石' };
            }
            gs.spiritStones -= tierInfo.cost;
            const now = Date.now();
            const card = {
                id: 'mc_' + type + '_' + Date.now(),
                type,
                name: tierInfo.name,
                purchaseDate: new Date(now).toISOString(),
                expireDate: new Date(now + tierInfo.durationDays * 24 * 60 * 60 * 1000).toISOString(),
                dailyReward: tierInfo.dailyReward,
                benefitMultiplier: tierInfo.benefitMultiplier,
                totalClaimed: 0
            };
            mc.cards.push(card);
            return {
                success: true,
                cost: tierInfo.cost,
                type,
                tierName: tierInfo.name,
                expireDate: card.expireDate,
                dailyReward: tierInfo.dailyReward,
                benefitMultiplier: tierInfo.benefitMultiplier,
                remainingSpiritStones: gs.spiritStones,
                message: tierInfo.name + '购买成功！' + tierInfo.durationDays + '天有效期，每日可领取' + tierInfo.dailyReward + '灵石，权益倍数' + tierInfo.benefitMultiplier
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 领取每日月卡奖励
     */
    claimDaily() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const mc = this._initMonthcardState();
            const now = Date.now();
            const activeCards = mc.cards.filter(c => new Date(c.expireDate).getTime() > now);
            if (activeCards.length === 0) {
                return { success: false, error: '没有活跃的月卡' };
            }
            let totalReward = 0;
            const rewards = [];
            for (const card of activeCards) {
                const tierInfo = MONTHCARD_CONFIG.tiers[card.type];
                if (!tierInfo) continue;
                const dailyReward = Math.floor(tierInfo.dailyReward * card.benefitMultiplier);
                totalReward += dailyReward;
                card.totalClaimed = (card.totalClaimed || 0) + dailyReward;
                rewards.push({
                    type: card.type,
                    name: tierInfo.name,
                    reward: dailyReward
                });
            }
            gs.spiritStones = (gs.spiritStones || 0) + totalReward;
            return {
                success: true,
                totalReward,
                rewards,
                totalSpiritStones: gs.spiritStones,
                message: '领取成功！共获得' + totalReward + '灵石'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取所有月卡类型
     */
    listTiers() {
        return {
            success: true,
            tiers: Object.entries(MONTHCARD_CONFIG.tiers).map(([type, info]) => ({
                type,
                name: info.name,
                cost: info.cost,
                dailyReward: info.dailyReward,
                durationDays: info.durationDays,
                benefitMultiplier: info.benefitMultiplier,
                totalReward: info.dailyReward * info.durationDays
            }))
        };
    }
}