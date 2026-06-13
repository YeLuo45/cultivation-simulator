// ============================================================
// InvestmentHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 31014-31224
// Auto-generated - Do not edit manually
// ============================================================

            // V120: _initInvestmentState - 初始化仙界投资状态
            _initInvestmentState() {
                const gs = window.gameState;
                if (!gs.investment) {
                    gs.investment = {
                        purchased: [], // Array of investment product IDs that have been purchased
                        products: INVESTMENT_PRODUCTS.map(p => ({
                            ...p,
                            claimedDays: 0,
                            startDate: null,
                            active: false
                        }))
                    };
                }
                return gs.investment;
            }

            // V120: _initMonthcardState - 初始化月卡状态
            _initMonthcardState() {
                const gs = window.gameState;
                if (!gs.monthcard) {
                    gs.monthcard = {
                        active: false,
                        purchaseDate: null,
                        lastClaimDate: null,
                        dailyReward: MONTHCARD_CONFIG.dailyReward,
                        durationDays: MONTHCARD_CONFIG.durationDays
                    };
                }
                return gs.monthcard;
            }

            // V120: mcpInvestmentQuery - 查询投资状态
            mcpInvestmentQuery() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const inv = this._initInvestmentState();
                    return {
                        success: true,
                        products: inv.products,
                        purchased: inv.purchased,
                        availableProducts: INVESTMENT_PRODUCTS
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V120: mcpInvestmentBuy - 购买投资产品
            mcpInvestmentBuy(investmentId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!investmentId) return { error: '投资产品ID不能为空' };
                    const inv = this._initInvestmentState();
                    const product = inv.products.find(p => p.id === investmentId);
                    if (!product) return { error: '投资产品不存在' };
                    if (inv.purchased.includes(investmentId)) return { error: '该投资产品已购买' };
                    if ((gs.spiritStones || 0) < product.cost) return { error: '灵石不足' };
                    gs.spiritStones -= product.cost;
                    inv.purchased.push(investmentId);
                    product.active = true;
                    product.startDate = Date.now();
                    product.claimedDays = 0;
                    return {
                        success: true,
                        message: `购买${product.name}成功`,
                        investmentId,
                        product: { id: product.id, name: product.name, cost: product.cost, dailyReturn: product.dailyReturn, totalDays: product.totalDays },
                        balance: gs.spiritStones
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V120: mcpInvestmentClaim - 领取投资收益
            mcpInvestmentClaim(investmentId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!investmentId) return { error: '投资产品ID不能为空' };
                    const inv = this._initInvestmentState();
                    const product = inv.products.find(p => p.id === investmentId);
                    if (!product) return { error: '投资产品不存在' };
                    if (!inv.purchased.includes(investmentId)) return { error: '该投资产品尚未购买' };
                    if (!product.active) return { error: '该投资产品已过期' };
                    if (product.claimedDays >= product.totalDays) return { error: '该投资产品收益已全部领取完' };
                    // Check if 24 hours have passed since last claim or start
                    const now = Date.now();
                    const lastClaim = product.lastClaimDate || product.startDate;
                    const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
                    if (hoursSinceLastClaim < 24) {
                        return { error: '距离下次领取还需' + Math.ceil(24 - hoursSinceLastClaim) + '小时' };
                    }
                    // Claim the daily return
                    product.claimedDays += 1;
                    product.lastClaimDate = now;
                    gs.spiritStones = (gs.spiritStones || 0) + product.dailyReturn;
                    if (product.claimedDays >= product.totalDays) {
                        product.active = false;
                    }
                    return {
                        success: true,
                        message: `领取${product.name}第${product.claimedDays}天收益成功`,
                        investmentId,
                        claimedDays: product.claimedDays,
                        dailyReturn: product.dailyReturn,
                        balance: gs.spiritStones,
                        isCompleted: product.claimedDays >= product.totalDays
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V120: mcpMonthcardQuery - 查询月卡状态
            mcpMonthcardQuery() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mc = this._initMonthcardState();
                    const now = Date.now();
                    let isExpired = false;
                    let remainingDays = 0;
                    if (mc.active && mc.purchaseDate) {
                        const expireTime = mc.purchaseDate + (MONTHCARD_CONFIG.durationDays * 24 * 60 * 60 * 1000);
                        if (now >= expireTime) {
                            isExpired = true;
                            mc.active = false;
                        } else {
                            remainingDays = Math.ceil((expireTime - now) / (24 * 60 * 60 * 1000));
                        }
                    }
                    return {
                        success: true,
                        active: mc.active && !isExpired,
                        purchaseDate: mc.purchaseDate,
                        lastClaimDate: mc.lastClaimDate,
                        dailyReward: mc.dailyReward,
                        remainingDays,
                        isExpired,
                        config: {
                            cost: MONTHCARD_CONFIG.cost,
                            dailyReward: MONTHCARD_CONFIG.dailyReward,
                            durationDays: MONTHCARD_CONFIG.durationDays,
                            claimCooldownHours: MONTHCARD_CONFIG.claimCooldownHours
                        }
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V120: mcpMonthcardBuy - 购买月卡
            mcpMonthcardBuy() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mc = this._initMonthcardState();
                    if (mc.active) {
                        const now = Date.now();
                        const expireTime = mc.purchaseDate + (MONTHCARD_CONFIG.durationDays * 24 * 60 * 60 * 1000);
                        if (now < expireTime) {
                            return { error: '月卡已激活，无需重复购买' };
                        }
                    }
                    if ((gs.spiritStones || 0) < MONTHCARD_CONFIG.cost) return { error: '灵石不足' };
                    gs.spiritStones -= MONTHCARD_CONFIG.cost;
                    mc.active = true;
                    mc.purchaseDate = Date.now();
                    mc.lastClaimDate = null;
                    return {
                        success: true,
                        message: '购买月卡成功，有效期30天',
                        cost: MONTHCARD_CONFIG.cost,
                        dailyReward: MONTHCARD_CONFIG.dailyReward,
                        durationDays: MONTHCARD_CONFIG.durationDays,
                        balance: gs.spiritStones
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V120: mcpMonthcardClaim - 每日领取月卡奖励
            mcpMonthcardClaim() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mc = this._initMonthcardState();
                    if (!mc.active) return { error: '月卡未激活，请先购买月卡' };
                    const now = Date.now();
                    // Check if expired
                    const expireTime = mc.purchaseDate + (MONTHCARD_CONFIG.durationDays * 24 * 60 * 60 * 1000);
                    if (now >= expireTime) {
                        mc.active = false;
                        return { error: '月卡已过期' };
                    }
                    // Check cooldown
                    if (mc.lastClaimDate) {
                        const hoursSinceLastClaim = (now - mc.lastClaimDate) / (1000 * 60 * 60);
                        if (hoursSinceLastClaim < MONTHCARD_CONFIG.claimCooldownHours) {
                            return { error: '距离下次领取还需' + Math.ceil(MONTHCARD_CONFIG.claimCooldownHours - hoursSinceLastClaim) + '小时' };
                        }
                    }
                    mc.lastClaimDate = now;
                    gs.spiritStones = (gs.spiritStones || 0) + MONTHCARD_CONFIG.dailyReward;
                    const remainingDays = Math.ceil((expireTime - now) / (24 * 60 * 60 * 1000));
                    return {
                        success: true,
                        message: '领取月卡每日奖励成功',
                        reward: { spiritStones: MONTHCARD_CONFIG.dailyReward },
                        balance: gs.spiritStones,
                        remainingDays
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V121: 宠物探险+派遣系统