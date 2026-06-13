/**
 * InvestmentService - 投资服务 (V199/V207)
 * 处理投资产品的购买、收益领取和赎回
 */
import { Investment, InvestmentProduct } from '../entities/Investment.js';

// 投资产品配置 (V207)
export const INVESTMENT_PRODUCTS = [
    { id: 'inv_spirit_quick', name: '灵石速赢', category: 'spiritStones', description: '短期投资，7天期限，日收益率2.5%', cost: 1000, dailyReturn: 25, duration: 7, dailyLimit: 50, totalShares: 100, soldShares: 0, investors: [] },
    { id: 'inv_spirit_stable', name: '稳健理财', category: 'spiritStones', description: '中期投资，30天期限，日收益率3%', cost: 5000, dailyReturn: 150, duration: 30, dailyLimit: 30, totalShares: 50, soldShares: 0, investors: [] },
    { id: 'inv_spirit_long', name: '长期增长', category: 'spiritStones', description: '长期投资，90天期限，日收益率3.5%', cost: 20000, dailyReturn: 700, duration: 90, dailyLimit: 10, totalShares: 20, soldShares: 0, investors: [] },
    { id: 'inv_technique', name: '功法传承', category: 'technique', description: '功法投资，60天期限，日收益率3.2%', cost: 10000, dailyReturn: 320, duration: 60, dailyLimit: 20, totalShares: 30, soldShares: 0, investors: [] },
    { id: 'inv_artifact', name: '法宝增值', category: 'artifact', description: '法宝投资，120天期限，日收益率4%', cost: 50000, dailyReturn: 2000, duration: 120, dailyLimit: 5, totalShares: 10, soldShares: 0, investors: [] }
];

export class InvestmentService {
    constructor(gameStateAccessor) {
        this.getGameState = gameStateAccessor;
    }

    /**
     * 初始化投资状态
     */
    _initInvestmentState() {
        const gs = this.getGameState();
        if (!gs.investment) {
            gs.investment = {
                investments: [],
                playerInvestments: [],
                totalInvestments: 0
            };
        }
        return gs.investment;
    }

    /**
     * 获取投资产品列表
     * @param {number} riskLevel - 风险等级筛选(可选)
     */
    list(riskLevel) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const inv = this._initInvestmentState();
            const categories = ['spiritStones', 'technique', 'artifact'];
            const result = {};
            for (const cat of categories) {
                let products = INVESTMENT_PRODUCTS.filter(p => p.category === cat);
                if (riskLevel !== undefined && riskLevel !== null) {
                    products = products.filter(p => p.riskLevel === riskLevel);
                }
                result[cat] = products.map(p => {
                    const owned = inv.investments.find(i => i.id === p.id && !i.redeemedAt);
                    const playerInv = inv.playerInvestments.find(pi => pi.investmentId === p.id);
                    return {
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        cost: p.cost,
                        dailyReturn: p.dailyReturn,
                        duration: p.duration,
                        dailyLimit: p.dailyLimit,
                        category: p.category,
                        soldShares: p.soldShares,
                        totalShares: p.totalShares,
                        purchased: !!owned,
                        playerShares: playerInv ? playerInv.shares : 0,
                        playerAccumulatedProfit: playerInv ? playerInv.accumulatedProfit : 0
                    };
                });
            }
            return {
                success: true,
                categories,
                products: result,
                totalInvestments: inv.totalInvestments,
                message: '共有' + INVESTMENT_PRODUCTS.length + '种投资产品，分' + categories.length + '类'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 购买投资份额
     * @param {string} investmentId - 投资产品ID
     * @param {number} shares - 购买份额数
     */
    buy(investmentId, shares) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!investmentId) return { error: '请指定投资产品ID' };
            const inv = this._initInvestmentState();
            const product = INVESTMENT_PRODUCTS.find(p => p.id === investmentId);
            if (!product) return { error: '投资产品不存在: ' + investmentId };
            const actualShares = shares || 1;
            const actualAmount = product.cost * actualShares;
            if (actualAmount < product.cost) {
                return { success: false, error: '投资金额低于最低要求: ' + product.cost + '灵石' };
            }
            if ((gs.spiritStones || 0) < actualAmount) {
                return { success: false, error: '灵石不足，投资需要' + actualAmount + '灵石' };
            }
            const availableShares = product.totalShares - product.soldShares;
            if (actualShares > availableShares) {
                return { success: false, error: '份额不足，剩余' + availableShares + '份' };
            }
            gs.spiritStones -= actualAmount;
            product.soldShares += actualShares;
            if (!product.investors.includes(gs.playerId)) {
                product.investors.push(gs.playerId);
            }
            const existingPlayerInv = inv.playerInvestments.find(pi => pi.investmentId === investmentId);
            if (existingPlayerInv) {
                existingPlayerInv.shares += actualShares;
                existingPlayerInv.startDate = new Date().toISOString();
            } else {
                inv.playerInvestments.push({
                    investmentId: investmentId,
                    shares: actualShares,
                    startDate: new Date().toISOString(),
                    accumulatedProfit: 0
                });
            }
            const investment = {
                id: investmentId,
                name: product.name,
                shares: actualShares,
                amount: actualAmount,
                dailyReturn: product.dailyReturn * actualShares,
                duration: product.duration,
                category: product.category,
                purchasedAt: new Date().toISOString(),
                lastClaimedAt: null,
                redeemedAt: null
            };
            inv.investments.push(investment);
            inv.totalInvestments += actualAmount;
            return {
                success: true,
                investmentId,
                name: product.name,
                category: product.category,
                shares: actualShares,
                amount: actualAmount,
                dailyReturn: product.dailyReturn * actualShares,
                duration: product.duration,
                totalReturn: product.dailyReturn * product.duration * actualShares,
                remainingSpiritStones: gs.spiritStones,
                message: '购买成功！投资' + actualAmount + '灵石于' + product.name + '，每日收益' + (product.dailyReturn * actualShares) + '灵石，期限' + product.duration + '天'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 领取投资收益
     * @param {string} investmentId - 投资产品ID
     */
    profit(investmentId) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!investmentId) return { error: '请指定投资产品ID' };
            const inv = this._initInvestmentState();
            const investment = inv.investments.find(i => i.id === investmentId && !i.redeemedAt);
            if (!investment) return { success: false, error: '未购买该投资产品或已赎回' };
            const now = Date.now();
            const purchasedAt = new Date(investment.purchasedAt).getTime();
            const lastClaimed = investment.lastClaimedAt ? new Date(investment.lastClaimedAt).getTime() : purchasedAt;
            const daysSinceLastClaim = Math.floor((now - lastClaimed) / (24 * 60 * 60 * 1000));
            if (daysSinceLastClaim < 1) {
                return { success: false, error: '今日已领取过收益，明日再来吧' };
            }
            const earnedProfit = Math.min(daysSinceLastClaim, investment.duration) * investment.dailyReturn;
            gs.spiritStones = (gs.spiritStones || 0) + earnedProfit;
            inv.totalInvestments += earnedProfit;
            investment.lastClaimedAt = new Date().toISOString();
            const playerInv = inv.playerInvestments.find(pi => pi.investmentId === investmentId);
            if (playerInv) {
                playerInv.accumulatedProfit += earnedProfit;
            }
            return {
                success: true,
                investmentId,
                name: investment.name,
                daysClaimed: daysSinceLastClaim,
                earnedProfit,
                totalSpiritStones: gs.spiritStones,
                message: '领取成功！获得' + earnedProfit + '灵石收益'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 赎回投资本金
     * @param {string} investmentId - 投资产品ID
     */
    redeem(investmentId) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!investmentId) return { error: '请指定投资产品ID' };
            const inv = this._initInvestmentState();
            const investment = inv.investments.find(i => i.id === investmentId && !i.redeemedAt);
            if (!investment) return { success: false, error: '未购买该投资产品或已赎回' };
            const product = INVESTMENT_PRODUCTS.find(p => p.id === investmentId);
            const now = Date.now();
            const purchasedAt = new Date(investment.purchasedAt).getTime();
            const daysPassed = Math.floor((now - purchasedAt) / (24 * 60 * 60 * 1000));
            const annualReturn = (investment.dailyReturn / investment.amount) * 365 * 100;
            const earnedProfit = Math.min(daysPassed, investment.duration) * investment.dailyReturn;
            const penalty = daysPassed < investment.duration ? Math.floor(earnedProfit * 0.2) : 0;
            const redeemValue = investment.amount + earnedProfit - penalty;
            gs.spiritStones = (gs.spiritStones || 0) + redeemValue;
            if (product) {
                product.soldShares -= investment.shares;
            }
            investment.redeemedAt = new Date().toISOString();
            return {
                success: true,
                investmentId,
                name: investment.name,
                originalAmount: investment.amount,
                earnedProfit,
                penalty,
                redeemValue,
                annualReturn: annualReturn.toFixed(2) + '%',
                totalSpiritStones: gs.spiritStones,
                message: penalty > 0 ? '提前赎回！扣除惩罚' + penalty + '灵石，实际返回' + redeemValue + '灵石' : '赎回成功！返回本金' + investment.amount + '灵石 + 收益' + earnedProfit + '灵石 = ' + redeemValue + '灵石'
            };
        } catch (e) { return { error: e.message }; }
    }
}