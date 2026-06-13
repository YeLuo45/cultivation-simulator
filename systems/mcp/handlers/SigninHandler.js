// ============================================================
// SigninHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 30649-31766
// Auto-generated - Do not edit manually
// ============================================================

            // V118: _initAnnounceState - 初始化仙界公告系统状态
            _initAnnounceState() {
                const gs = window.gameState;
                if (!gs.announce) {
                    gs.announce = {
                        announcements: JSON.parse(JSON.stringify(ANNOUNCE_POOL)),
                        readIds: [],
                        nextId: ANNOUNCE_POOL.length + 1
                    };
                }
                return gs.announce;
            }

            // V118: _initMailState - 初始化仙界邮件系统状态
            _initMailState() {
                const gs = window.gameState;
                if (!gs.mail) {
                    gs.mail = {
                        mails: JSON.parse(JSON.stringify(MAIL_POOL)),
                        unreadCount: MAIL_POOL.filter(m => !m.read).length,
                        nextId: MAIL_POOL.length + 1
                    };
                }
                return gs.mail;
            }

            // V118: mcpAnnounceList - 获取公告列表
            mcpAnnounceList(page = 1, pageSize = 10) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const announce = this._initAnnounceState();
                    const published = announce.announcements.filter(a => a.published);
                    const total = published.length;
                    const start = (page - 1) * pageSize;
                    const end = start + pageSize;
                    const list = published.slice(start, end).map(a => ({
                        id: a.id,
                        title: a.title,
                        type: a.type,
                        priority: a.priority,
                        date: a.date,
                        isRead: announce.readIds.includes(a.id),
                        hasReward: !!a.reward
                    }));
                    return {
                        success: true,
                        page,
                        pageSize,
                        total,
                        totalPages: Math.ceil(total / pageSize),
                        announcements: list
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V118: mcpAnnounceDetail - 查看公告详情
            mcpAnnounceDetail(announceId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!announceId) return { error: '公告ID不能为空' };
                    const announce = this._initAnnounceState();
                    const a = announce.announcements.find(x => x.id === announceId);
                    if (!a) return { error: '公告不存在' };
                    return {
                        success: true,
                        id: a.id,
                        title: a.title,
                        content: a.content,
                        type: a.type,
                        priority: a.priority,
                        date: a.date,
                        isRead: announce.readIds.includes(a.id),
                        reward: a.reward
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V118: mcpAnnounceRead - 标记公告为已读
            mcpAnnounceRead(announceId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!announceId) return { error: '公告ID不能为空' };
                    const announce = this._initAnnounceState();
                    const a = announce.announcements.find(x => x.id === announceId);
                    if (!a) return { error: '公告不存在' };
                    if (!announce.readIds.includes(announceId)) {
                        announce.readIds.push(announceId);
                    }
                    return { success: true, message: '已标记公告为已读', announceId };
                } catch (e) { return { error: e.message }; }
            }

            // V118: mcpMailList - 获取邮件列表
            mcpMailList(filter = 'all') {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mail = this._initMailState();
                    let mails = mail.mails;
                    switch (filter) {
                        case 'unread':
                            mails = mails.filter(m => !m.read);
                            break;
                        case 'attachment':
                            mails = mails.filter(m => m.hasAttachment && !m.claimed);
                            break;
                        default:
                            // 'all' - return all
                    }
                    return {
                        success: true,
                        filter,
                        total: mails.length,
                        unreadCount: mail.unreadCount,
                        mails: mails.map(m => ({
                            id: m.id,
                            from: m.from,
                            title: m.title,
                            date: m.date,
                            hasAttachment: m.hasAttachment,
                            isRead: m.read,
                            isClaimed: m.claimed
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V118: mcpMailRead - 读取邮件
            mcpMailRead(mailId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mailId) return { error: '邮件ID不能为空' };
                    const mail = this._initMailState();
                    const m = mail.mails.find(x => x.id === mailId);
                    if (!m) return { error: '邮件不存在' };
                    // Mark as read and decrement unread count
                    if (!m.read) {
                        m.read = true;
                        mail.unreadCount = Math.max(0, mail.unreadCount - 1);
                    }
                    return {
                        success: true,
                        id: m.id,
                        from: m.from,
                        title: m.title,
                        content: m.content,
                        date: m.date,
                        hasAttachment: m.hasAttachment,
                        attachment: m.hasAttachment && !m.claimed ? m.attachment : null
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V118: mcpMailAttachment - 领取邮件附件
            mcpMailAttachment(mailId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mailId) return { error: '邮件ID不能为空' };
                    const mail = this._initMailState();
                    const m = mail.mails.find(x => x.id === mailId);
                    if (!m) return { error: '邮件不存在' };
                    if (!m.hasAttachment) return { error: '该邮件无附件' };
                    if (m.claimed) return { error: '附件已领取' };
                    // Award the attachment
                    m.claimed = true;
                    if (m.attachment) {
                        if (m.attachment.spiritStones) {
                            gs.spiritStones = (gs.spiritStones || 0) + m.attachment.spiritStones;
                        }
                        if (m.attachment.reputation) {
                            gs.reputation = (gs.reputation || 0) + m.attachment.reputation;
                        }
                    }
                    return {
                        success: true,
                        message: '附件领取成功',
                        mailId,
                        reward: m.attachment
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V119: _initSevenShopState - 初始化七日特惠状态
            _initSevenShopState() {
                const gs = window.gameState;
                if (!gs.sevenShop) {
                    gs.sevenShop = {
                        days: SEVEN_SHOP_CONFIG.days.map(d => ({
                            day: d.day,
                            name: d.name,
                            price: d.price,
                            reward: d.reward,
                            bought: false
                        })),
                        startDate: Date.now(),
                        purchasedDays: []
                    };
                }
                return gs.sevenShop;
            }

            // V119: _initLimitedShopState - 初始化限时商店状态
            _initLimitedShopState() {
                const gs = window.gameState;
                if (!gs.limitedShop) {
                    // Randomly select 6 items for the limited shop
                    const shuffled = [...LIMITED_SHOP_ITEMS].sort(() => Math.random() - 0.5);
                    gs.limitedShop = {
                        items: shuffled.slice(0, 6).map(item => ({
                            ...item,
                            stock: 1,
                            sold: false
                        })),
                        nextRefreshTime: Date.now() + (6 * 60 * 60 * 1000), // 6 hours from now
                        refreshCost: 200
                    };
                }
                return gs.limitedShop;
            }

            // V119: mcpSevenshopQuery - 查询七日特惠商品
            mcpSevenshopQuery() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const shop = this._initSevenShopState();
                    return {
                        success: true,
                        days: shop.days,
                        purchasedDays: shop.purchasedDays,
                        startDate: shop.startDate
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V119: mcpSevenshopBuy - 购买特惠商品
            mcpSevenshopBuy(day) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!day || day < 1 || day > 7) return { error: '天数必须为1-7' };
                    const shop = this._initSevenShopState();
                    const dayData = shop.days.find(d => d.day === day);
                    if (!dayData) return { error: '该天不存在' };
                    if (dayData.bought) return { error: '该天已购买' };
                    if ((gs.spiritStones || 0) < dayData.price) return { error: '灵石不足' };
                    gs.spiritStones -= dayData.price;
                    dayData.bought = true;
                    shop.purchasedDays.push(day);
                    // Award reward
                    if (dayData.reward && dayData.reward.spiritStones) {
                        gs.spiritStones += dayData.reward.spiritStones;
                    }
                    return {
                        success: true,
                        message: `购买第${day}天礼包成功`,
                        day,
                        price: dayData.price,
                        reward: dayData.reward,
                        balance: gs.spiritStones
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V119: mcpSevenshopReset - 重置特惠进度
            mcpSevenshopReset() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const resetCost = SEVEN_SHOP_CONFIG.resetCost;
                    if ((gs.spiritStones || 0) < resetCost) return { error: `重置需要${resetCost}灵石，余额不足` };
                    gs.spiritStones -= resetCost;
                    gs.sevenShop = {
                        days: SEVEN_SHOP_CONFIG.days.map(d => ({
                            day: d.day,
                            name: d.name,
                            price: d.price,
                            reward: d.reward,
                            bought: false
                        })),
                        startDate: Date.now(),
                        purchasedDays: []
                    };
                    return {
                        success: true,
                        message: '七日特惠已重置',
                        cost: resetCost,
                        balance: gs.spiritStones
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V119: mcpLimitedshopList - 获取限时商店商品
            mcpLimitedshopList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const shop = this._initLimitedShopState();
                    return {
                        success: true,
                        items: shop.items,
                        nextRefreshTime: shop.nextRefreshTime,
                        refreshCost: shop.refreshCost
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V119: mcpLimitedshopRefresh - 刷新商店商品
            mcpLimitedshopRefresh() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const shop = this._initLimitedShopState();
                    if ((gs.spiritStones || 0) < shop.refreshCost) {
                        return { error: `刷新需要${shop.refreshCost}灵石，余额不足` };
                    }
                    gs.spiritStones -= shop.refreshCost;
                    // Randomly select 6 new items
                    const shuffled = [...LIMITED_SHOP_ITEMS].sort(() => Math.random() - 0.5);
                    shop.items = shuffled.slice(0, 6).map(item => ({
                        ...item,
                        stock: 1,
                        sold: false
                    }));
                    shop.nextRefreshTime = Date.now() + (6 * 60 * 60 * 1000);
                    return {
                        success: true,
                        message: '商店刷新成功',
                        items: shop.items,
                        cost: shop.refreshCost,
                        nextRefreshTime: shop.nextRefreshTime,
                        balance: gs.spiritStones
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V119: mcpLimitedshopBuy - 购买限时商品
            mcpLimitedshopBuy(itemId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!itemId) return { error: '商品ID不能为空' };
                    const shop = this._initLimitedShopState();
                    const item = shop.items.find(i => i.id === itemId);
                    if (!item) return { error: '商品不存在' };
                    if (item.sold) return { error: '商品已售出' };
                    if ((gs.spiritStones || 0) < item.price) return { error: '灵石不足' };
                    gs.spiritStones -= item.price;
                    item.sold = true;
                    item.stock = 0;
                    return {
                        success: true,
                        message: `购买${item.name}成功`,
                        itemId,
                        item: { id: item.id, name: item.name, price: item.price },
                        balance: gs.spiritStones
                    };
                } catch (e) { return { error: e.message }; }
            }

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
            _initPetExploreState() {
                const gs = window.gameState;
                if (!gs.petExplore) {
                    gs.petExplore = { activeExpeditions: [], completedCount: 0 };
                }
                return gs.petExplore;
            }
            _initDispatchState() {
                const gs = window.gameState;
                if (!gs.dispatch) {
                    gs.dispatch = {
                        tasks: [
                            { id: 'dispatch_1', name: '采集灵草', cost: 100, duration: 1800000, reward: { spiritStones: 300, reputation: 10 }, status: 'available' },
                            { id: 'dispatch_2', name: '护送商队', cost: 300, duration: 3600000, reward: { spiritStones: 800, reputation: 30 }, status: 'available' },
                            { id: 'dispatch_3', name: '探索遗迹', cost: 500, duration: 7200000, reward: { spiritStones: 2000, reputation: 80 }, status: 'available' },
                        ],
                        nextTaskRefresh: null
                    };
                }
                return gs.dispatch;
            }
            mcpPetexploreList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const explore = this._initPetExploreState();
                    return { success: true, active: explore.activeExpeditions, completedCount: explore.completedCount };
                } catch (e) { return { error: e.message }; }
            }
            mcpPetexploreStart(petId, exploreId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!petId || !exploreId) return { error: 'petId和exploreId不能为空' };
                    const explore = this._initPetExploreState();
                    const EXPLORE_CONFIG = {
                        explore_a: { name: '普通探险', duration: 1800000, rewardMin: 100, rewardMax: 300 },
                        explore_b: { name: '稀有探险', duration: 3600000, rewardMin: 500, rewardMax: 1000 },
                        explore_c: { name: '传说探险', duration: 7200000, rewardMin: 2000, rewardMax: 5000 }
                    };
                    const config = EXPLORE_CONFIG[exploreId];
                    if (!config) return { error: '无效的exploreId' };
                    const activeCount = explore.activeExpeditions.filter(e => e.petId === petId).length;
                    if (activeCount > 0) return { error: '该宠物已在探险中' };
                    if (explore.activeExpeditions.length >= 3) return { error: '最多同时3个探险' };
                    const startTime = Date.now();
                    explore.activeExpeditions.push({ petId, exploreId, startTime, duration: config.duration });
                    return { success: true, message: '探险开始', petId, exploreId, startTime, endTime: startTime + config.duration };
                } catch (e) { return { error: e.message }; }
            }
            mcpPetexploreHarvest(exploreId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const explore = this._initPetExploreState();
                    const idx = explore.activeExpeditions.findIndex(e => e.exploreId === exploreId);
                    if (idx === -1) return { error: '探险不存在' };
                    const exp = explore.activeExpeditions[idx];
                    const elapsed = Date.now() - exp.startTime;
                    if (elapsed < exp.duration) return { error: '探险尚未完成，还需' + Math.ceil((exp.duration - elapsed) / 60000) + '分钟' };
                    const EXPLORE_CONFIG = {
                        explore_a: { name: '普通探险', rewardMin: 100, rewardMax: 300 },
                        explore_b: { name: '稀有探险', rewardMin: 500, rewardMax: 1000 },
                        explore_c: { name: '传说探险', rewardMin: 2000, rewardMax: 5000 }
                    };
                    const config = EXPLORE_CONFIG[exp.exploreId];
                    const reward = Math.floor(Math.random() * (config.rewardMax - config.rewardMin + 1)) + config.rewardMin;
                    gs.spiritStones = (gs.spiritStones || 0) + reward;
                    explore.activeExpeditions.splice(idx, 1);
                    explore.completedCount++;
                    return { success: true, message: '收获探险奖励', reward: { spiritStones: reward }, balance: gs.spiritStones };
                } catch (e) { return { error: e.message }; }
            }
            mcpDispatchList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const dispatch = this._initDispatchState();
                    return { success: true, tasks: dispatch.tasks.filter(t => t.status !== 'completed') };
                } catch (e) { return { error: e.message }; }
            }
            mcpDispatchExecute(taskId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const dispatch = this._initDispatchState();
                    const task = dispatch.tasks.find(t => t.id === taskId);
                    if (!task) return { error: '任务不存在' };
                    if (task.status !== 'available') return { error: '任务不可执行' };
                    if ((gs.spiritStones || 0) < task.cost) return { error: '灵石不足' };
                    gs.spiritStones -= task.cost;
                    task.status = 'running';
                    task.startTime = Date.now();
                    return { success: true, message: '派遣开始', taskId, cost: task.cost, balance: gs.spiritStones, endTime: task.startTime + task.duration };
                } catch (e) { return { error: e.message }; }
            }
            mcpDispatchComplete(taskId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const dispatch = this._initDispatchState();
                    const task = dispatch.tasks.find(t => t.id === taskId);
                    if (!task) return { error: '任务不存在' };
                    if (task.status !== 'running') return { error: '任务未在执行中' };
                    const elapsed = Date.now() - task.startTime;
                    if (elapsed < task.duration) return { error: '任务尚未完成，还需' + Math.ceil((task.duration - elapsed) / 60000) + '分钟' };
                    gs.spiritStones = (gs.spiritStones || 0) + task.reward.spiritStones;
                    gs.reputation = (gs.reputation || 0) + task.reward.reputation;
                    task.status = 'completed';
                    return { success: true, message: '任务完成', reward: task.reward, balance: gs.spiritStones, reputation: gs.reputation };
                } catch (e) { return { error: e.message }; }
            }

            // V122: 红包+社交系统 - 状态初始化
            _initRedpackState() {
                const gs = window.gameState;
                if (!gs.redpack) {
                    gs.redpack = {
                        redpacks: [],
                        nextRefresh: null
                    };
                }
                return gs.redpack;
            }
            _initFriendState() {
                const gs = window.gameState;
                if (!gs.friend) {
                    gs.friend = {
                        friends: [],
                        applications: [],
                        blocked: []
                    };
                }
                return gs.friend;
            }

            // V122: mcpRedpackList - 获取红包列表
            mcpRedpackList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const rp = this._initRedpackState();
                    // Filter out expired (older than 24h) and fully grabbed
                    const now = Date.now();
                    const active = rp.redpacks.filter(r => {
                        if (r.grabList && r.grabList.length >= r.totalCount) return false;
                        if (r.expireTime && r.expireTime < now) return false;
                        return true;
                    });
                    return { success: true, redpacks: active };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpRedpackSend - 发送红包
            mcpRedpackSend(amount, type) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!amount || amount <= 0) return { error: '红包金额必须大于0' };
                    if (type !== 'regular' && type !== 'lucky') return { error: '红包类型无效，需要 regular 或 lucky' };
                    if ((gs.spiritStones || 0) < amount) return { error: '灵石不足' };
                    const rp = this._initRedpackState();
                    gs.spiritStones -= amount;
                    const redpack = {
                        id: 'rp_' + Date.now(),
                        sender: gs.playerName || '道友',
                        amount,
                        type,
                        remaining: amount,
                        totalCount: type === 'regular' ? Math.min(Math.floor(amount / 10), 20) : Math.min(Math.floor(amount / 20), 10),
                        grabList: [],
                        expireTime: Date.now() + 24 * 3600 * 1000,
                        createdAt: Date.now()
                    };
                    rp.redpacks.push(redpack);
                    return { success: true, message: '红包已发出', redpackId: redpack.id, balance: gs.spiritStones };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpRedpackGrab - 领取红包
            mcpRedpackGrab(redpackId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!redpackId) return { error: 'redpackId不能为空' };
                    const rp = this._initRedpackState();
                    const idx = rp.redpacks.findIndex(r => r.id === redpackId);
                    if (idx === -1) return { error: '红包不存在' };
                    const rp_item = rp.redpacks[idx];
                    // Check expiration
                    if (rp_item.expireTime && rp_item.expireTime < Date.now()) {
                        return { error: '红包已过期' };
                    }
                    // Check if already grabbed by this player
                    const playerId = gs.playerName || 'anonymous';
                    if (rp_item.grabList && rp_item.grabList.some(g => g.player === playerId)) {
                        return { error: '您已领取过该红包' };
                    }
                    // Check if fully grabbed
                    if (rp_item.grabList && rp_item.grabList.length >= rp_item.totalCount) {
                        return { error: '红包已被抢完' };
                    }
                    // Compute grab amount
                    let grabAmount;
                    if (rp_item.type === 'lucky') {
                        const maxGrab = Math.floor(rp_item.amount * 0.3);
                        grabAmount = Math.floor(Math.random() * maxGrab) + 1;
                    } else {
                        // regular: equal split
                        const remaining = rp_item.remaining;
                        const remainingSlots = rp_item.totalCount - (rp_item.grabList ? rp_item.grabList.length : 0);
                        grabAmount = Math.floor(remaining / remainingSlots);
                    }
                    grabAmount = Math.max(grabAmount, 1);
                    gs.spiritStones = (gs.spiritStones || 0) + grabAmount;
                    if (!rp_item.grabList) rp_item.grabList = [];
                    rp_item.grabList.push({ player: playerId, amount: grabAmount, time: Date.now() });
                    rp_item.remaining -= grabAmount;
                    return { success: true, message: '领取成功', amount: grabAmount, balance: gs.spiritStones };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpFriendList - 获取好友列表
            mcpFriendList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const friend = this._initFriendState();
                    return { success: true, friends: friend.friends, applications: friend.applications };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpFriendApply - 发送好友申请
            mcpFriendApply(playerName) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!playerName) return { error: '玩家名称不能为空' };
                    const friend = this._initFriendState();
                    // Check if already friends
                    if (friend.friends.some(f => f.name === playerName)) {
                        return { error: '已是好友' };
                    }
                    // Check if already applied
                    if (friend.applications.some(a => a.from === playerName)) {
                        return { error: '已发送过申请' };
                    }
                    const apply = {
                        id: 'apply_' + Date.now(),
                        from: playerName,
                        time: Date.now()
                    };
                    friend.applications.push(apply);
                    return { success: true, message: '好友申请已发送', applyId: apply.id };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpFriendAccept - 通过好友申请
            mcpFriendAccept(applyId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!applyId) return { error: 'applyId不能为空' };
                    const friend = this._initFriendState();
                    const idx = friend.applications.findIndex(a => a.id === applyId);
                    if (idx === -1) return { error: '好友申请不存在' };
                    const apply = friend.applications[idx];
                    friend.applications.splice(idx, 1);
                    friend.friends.push({ id: 'friend_' + Date.now(), name: apply.from, since: Date.now() });
                    return { success: true, message: '已添加好友 ' + apply.from };
                } catch (e) { return { error: e.message }; }
            }

            // V123: 投票+问卷系统
            _initVoteState() {
                const gs = window.gameState;
                if (!gs.vote) {
                    gs.vote = { votes: [], nextVoteId: 1 };
                }
                return gs.vote;
            }
            _initSurveyState() {
                const gs = window.gameState;
                if (!gs.survey) {
                    gs.survey = {
                        surveys: [
                            { id: 'survey_1', title: '修仙境界问卷', questions: [{ q: '你最向往哪个境界?', options: ['筑基', '金丹', '元婴', '化神'] }], reward: { spiritStones: 200 }, status: 'available', answers: null },
                            { id: 'survey_2', title: '功法偏好调查', questions: [{ q: '你喜欢哪种功法?', options: ['剑修', '体修', '法修', '杂修'] }], reward: { spiritStones: 150 }, status: 'available', answers: null }
                        ],
                        nextSurveyId: 3
                    };
                }
                return gs.survey;
            }
            mcpVoteList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const vote = this._initVoteState();
                    return { success: true, votes: vote.votes.filter(v => Date.now() < v.endTime) };
                } catch (e) { return { error: e.message }; }
            }
            mcpVoteCreate(title, options, duration) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!title || !options || options.length < 2) return { error: '标题和至少2个选项不能为空' };
                    const vote = this._initVoteState();
                    const voteId = 'vote_' + (vote.nextVoteId++);
                    vote.votes.push({ id: voteId, title, options: options.map((text, i) => ({ text, count: 0 })), creator: gs.playerName || '玩家', endTime: Date.now() + (duration || 3600000), participants: [] });
                    return { success: true, voteId, endTime: Date.now() + (duration || 3600000) };
                } catch (e) { return { error: e.message }; }
            }
            mcpVoteJoin(voteId, optionIndex) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const vote = this._initVoteState();
                    const v = vote.votes.find(v => v.id === voteId);
                    if (!v) return { error: '投票不存在' };
                    if (Date.now() >= v.endTime) return { error: '投票已结束' };
                    if (v.participants.includes(gs.playerName || '玩家')) return { error: '已投过票' };
                    if (optionIndex < 0 || optionIndex >= v.options.length) return { error: '无效的选项索引' };
                    v.options[optionIndex].count++;
                    v.participants.push(gs.playerName || '玩家');
                    return { success: true, message: '投票成功', option: v.options[optionIndex].text };
                } catch (e) { return { error: e.message }; }
            }
            mcpSurveyList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const survey = this._initSurveyState();
                    return { success: true, surveys: survey.surveys.filter(s => s.status === 'available') };
                } catch (e) { return { error: e.message }; }
            }
            mcpSurveyAnswer(surveyId, answers) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const survey = this._initSurveyState();
                    const s = survey.surveys.find(s => s.id === surveyId);
                    if (!s) return { error: '问卷不存在' };
                    if (s.status !== 'available') return { error: '问卷不可作答' };
                    s.answers = answers;
                    return { success: true, message: '答案已提交' };
                } catch (e) { return { error: e.message }; }
            }
            mcpSurveyComplete(surveyId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const survey = this._initSurveyState();
                    const s = survey.surveys.find(s => s.id === surveyId);
                    if (!s) return { error: '问卷不存在' };
                    if (!s.answers) return { error: '请先提交答案' };
                    if (s.status !== 'available') return { error: '问卷已完成' };
                    s.status = 'completed';
                    gs.spiritStones = (gs.spiritStones || 0) + s.reward.spiritStones;
                    return { success: true, message: '问卷完成', reward: s.reward, balance: gs.spiritStones };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpCheckinQuery - 查询签到状态
            mcpCheckinQuery() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const checkin = this._initCheckinState();
                    return {
                        success: true,
                        signedToday: checkin.signedToday,
                        currentStreak: checkin.currentStreak,
                        lastSignDate: checkin.lastSignDate,
                        totalDays: checkin.totalDays,
                        streakRewards: checkin.streakRewards
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpCheckinSign - 执行签到
            mcpCheckinSign() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const checkin = this._initCheckinState();

                    if (checkin.signedToday) {
                        return { error: '今日已签到，请明天再来' };
                    }

                    // Update streak and last sign date
                    const now = new Date();
                    if (checkin.lastSignDate) {
                        const last = new Date(checkin.lastSignDate);
                        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                        if (diffDays === 1) {
                            checkin.currentStreak += 1;
                        } else if (diffDays > 1) {
                            checkin.currentStreak = 1;
                        }
                    } else {
                        checkin.currentStreak = 1;
                    }

                    checkin.lastSignDate = now.toISOString();
                    checkin.signedToday = true;
                    checkin.totalDays += 1;

                    // Base reward for signing in
                    const baseReward = 100 + checkin.currentStreak * 10;
                    gs.spiritStones = (gs.spiritStones || 0) + baseReward;

                    return {
                        success: true,
                        message: '签到成功，连续签到' + checkin.currentStreak + '天',
                        streak: checkin.currentStreak,
                        totalDays: checkin.totalDays,
                        reward: { spiritStones: baseReward }
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpCheckinReward - 领取连续签到奖励
            mcpCheckinReward(day) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!day) return { error: '连续签到天数不能为空' };

                    const dayKey = 'day' + day;
                    if (!CHECKIN_STREAK_REWARDS[dayKey]) {
                        return { error: '无效的连续签到天数: ' + day + '，可选: 3, 7, 30' };
                    }

                    const checkin = this._initCheckinState();
                    const streakData = checkin.streakRewards[dayKey];

                    if (!streakData) return { error: '连续签到奖励数据不存在' };
                    if (streakData.claimed) return { error: '该奖励已领取' };
                    if (checkin.currentStreak < day) {
                        return { error: '连续签到天数不足，需要连续签到' + day + '天，当前连续' + checkin.currentStreak + '天' };
                    }

                    streakData.claimed = true;
                    gs.spiritStones = (gs.spiritStones || 0) + streakData.reward.spiritStones;

                    return {
                        success: true,
                        message: '领取连续签到' + day + '天奖励成功',
                        reward: streakData.reward
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpWelfareQuery - 查询可领取福利
            mcpWelfareQuery() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const welfare = this._initWelfareState();

                    return {
                        success: true,
                        daily: {
                            available: !welfare.dailyClaimed,
                            claimed: welfare.dailyClaimed,
                            reward: welfare.rewards.daily.reward
                        },
                        weekly: {
                            available: !welfare.weeklyClaimed,
                            claimed: welfare.weeklyClaimed,
                            reward: welfare.rewards.weekly.reward
                        },
                        monthly: {
                            available: !welfare.monthlyClaimed,
                            claimed: welfare.monthlyClaimed,
                            reward: welfare.rewards.monthly.reward
                        }
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpWelfareClaim - 领取福利
            mcpWelfareClaim(welfareId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!welfareId) return { error: '福利ID不能为空' };

                    const validIds = ['daily', 'weekly', 'monthly'];
                    if (!validIds.includes(welfareId)) {
                        return { error: '无效的福利ID: ' + welfareId + '，可选: daily, weekly, monthly' };
                    }

                    const welfare = this._initWelfareState();
                    const welfareData = welfare.rewards[welfareId];

                    if (!welfareData) return { error: '福利数据不存在' };

                    const claimMap = {
                        daily: 'dailyClaimed',
                        weekly: 'weeklyClaimed',
                        monthly: 'monthlyClaimed'
                    };
                    const claimedFlag = claimMap[welfareId];

                    if (welfare[claimedFlag]) {
                        return { error: welfareId + '福利已领取，请下次再来' };
                    }

                    welfare[claimedFlag] = true;
                    welfare.lastClaimDate = new Date().toISOString();
                    gs.spiritStones = (gs.spiritStones || 0) + welfareData.reward.spiritStones;

                    return {
                        success: true,
                        message: '领取' + welfareId + '福利成功',
                        welfareId,
                        reward: welfareData.reward
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpWelfareStatus - 查询福利状态
            mcpWelfareStatus() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const welfare = this._initWelfareState();

                    return {
                        success: true,
                        dailyClaimed: welfare.dailyClaimed,
                        weeklyClaimed: welfare.weeklyClaimed,
                        monthlyClaimed: welfare.monthlyClaimed,
                        lastClaimDate: welfare.lastClaimDate
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpQuestList - 获取可接任务列表