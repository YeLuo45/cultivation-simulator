// ============================================================
// RankingHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 30348-34510
// Auto-generated - Do not edit manually
// ============================================================

            // V116: _initRankState - 初始化仙界排行榜系统状态
            _initRankState() {
                const gs = window.gameState;
                if (!gs.rank) {
                    gs.rank = {
                        leaderboards: {
                            spiritStones: [],
                            realm: [],
                            reputation: [],
                            pvp: []
                        },
                        lastRefresh: 0
                    };
                }
                // Ensure player is always on the list
                this._refreshLeaderboard('spiritStones');
                this._refreshLeaderboard('realm');
                this._refreshLeaderboard('reputation');
                this._refreshLeaderboard('pvp');
                return gs.rank;
            }

            // V116: _refreshLeaderboard - 刷新单个排行榜
            _refreshLeaderboard(type) {
                const gs = window.gameState;
                const lb = gs.rank.leaderboards[type];
                
                // Generate NPC data based on player stats
                const playerRealm = gs.realm || 0;
                const playerStones = gs.spiritStones || 0;
                const playerRep = gs.reputation || 0;
                const playerPvp = gs.pvpRating || 1200;
                
                // Create NPC entries
                const npcs = NPC_NAMES.map((name, i) => {
                    let value;
                    switch(type) {
                        case 'spiritStones': value = Math.floor(playerStones * (0.3 + Math.random() * 1.4) * (1 - i * 0.03)); break;
                        case 'realm': value = Math.max(0, Math.min(5, playerRealm + Math.floor(Math.random() * 7 - 3))); break;
                        case 'reputation': value = Math.floor(playerRep * (0.3 + Math.random() * 1.4) * (1 - i * 0.03)); break;
                        case 'pvp': value = Math.floor(playerPvp * (0.85 + Math.random() * 0.3) - i * 15); break;
                    }
                    return { id: 'npc_' + i, name, value };
                });
                
                // Add player as position 1, then sort NPCs above and below
                const playerEntry = { id: 'player', name: '你', value: type === 'realm' ? playerRealm : 
                    (type === 'spiritStones' ? playerStones : 
                    (type === 'reputation' ? playerRep : playerPvp)) };
                
                // Build final list with player always at position 1
                lb.length = 0;
                lb.push(playerEntry);
                // Sort NPCs by value descending
                npcs.sort((a, b) => b.value - a.value);
                // Insert NPCs around player's "real" position
                const playerRank = this._calculatePlayerRank(type, playerEntry.value, npcs);
                const insertPos = Math.min(Math.max(1, playerRank), npcs.length + 1);
                npcs.forEach((npc, i) => {
                    if (i === insertPos - 1) lb.push(npc);
                    else if (i < insertPos - 1) lb.splice(i + 1, 0, npc);
                    else lb.push(npc);
                });
                
                gs.rank.lastRefresh = Date.now();
            }

            // V116: _calculatePlayerRank - 计算玩家在排行榜中的真实位置
            _calculatePlayerRank(type, playerValue, npcs) {
                let rank = 1;
                for (const npc of npcs) {
                    if (npc.value > playerValue) rank++;
                }
                return rank;
            }

            // V116: _initGloryState - 初始化荣耀系统状态
            _initGloryState() {
                const gs = window.gameState;
                if (!gs.glory) {
                    gs.glory = {
                        points: 0,
                        level: 'bronze',
                        levelRewards: JSON.parse(JSON.stringify(GLORY_LEVEL_REWARDS))
                    };
                }
                // Update glory level based on points
                const pts = gs.glory.points || 0;
                if (pts >= 20000) gs.glory.level = 'diamond';
                else if (pts >= 5000) gs.glory.level = 'gold';
                else if (pts >= 1000) gs.glory.level = 'silver';
                else gs.glory.level = 'bronze';
                return gs.glory;
            }

            // V116: mcpRankQuery - 查询排行榜
            mcpRankQuery(type = 'spiritStones', page = 1, pageSize = 10) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!['spiritStones', 'realm', 'reputation', 'pvp'].includes(type)) {
                        return { error: '无效的排行榜类型: ' + type };
                    }
                    const rank = this._initRankState();
                    const lb = rank.leaderboards[type] || [];
                    
                    // Pagination
                    const start = (page - 1) * pageSize;
                    const end = start + pageSize;
                    const entries = lb.slice(start, end).map((e, i) => ({
                        rank: start + i + 1,
                        id: e.id,
                        name: e.name,
                        value: e.value,
                        isPlayer: e.id === 'player'
                    }));
                    
                    return {
                        success: true,
                        type,
                        page,
                        pageSize,
                        total: lb.length,
                        entries
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V116: mcpRankRefresh - 刷新排行数据
            mcpRankRefresh(type) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!['spiritStones', 'realm', 'reputation', 'pvp'].includes(type)) {
                        return { error: '无效的排行榜类型: ' + type };
                    }
                    this._initRankState();
                    this._refreshLeaderboard(type);
                    return {
                        success: true,
                        message: type + '排行榜已刷新',
                        lastRefresh: gs.rank.lastRefresh
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V116: mcpRankDetail - 查看玩家排行详情
            mcpRankDetail(playerId = 'player') {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const rank = this._initRankState();
                    
                    const results = [];
                    for (const type of ['spiritStones', 'realm', 'reputation', 'pvp']) {
                        const lb = rank.leaderboards[type] || [];
                        const idx = lb.findIndex(e => e.id === (playerId || 'player'));
                        results.push({
                            type,
                            rank: idx >= 0 ? idx + 1 : -1,
                            value: idx >= 0 ? lb[idx].value : null
                        });
                    }
                    
                    return {
                        success: true,
                        playerId: playerId || 'player',
                        rankings: results
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V116: mcpGloryQuery - 查询玩家荣耀值
            mcpGloryQuery() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const glory = this._initGloryState();
                    return {
                        success: true,
                        points: glory.points || 0,
                        level: glory.level || 'bronze'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V116: mcpGloryLevel - 查询荣耀等级信息
            mcpGloryLevel() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const glory = this._initGloryState();
                    const levels = ['bronze', 'silver', 'gold', 'diamond'];
                    const currentIdx = levels.indexOf(glory.level || 'bronze');
                    
                    const nextLevel = currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null;
                    const nextNeed = nextLevel ? GLORY_LEVEL_REWARDS[nextLevel].need : null;
                    
                    return {
                        success: true,
                        currentLevel: glory.level || 'bronze',
                        points: glory.points || 0,
                        nextLevel,
                        nextNeed,
                        progress: nextNeed ? Math.min(100, Math.floor((glory.points || 0) / nextNeed * 100)) : 100
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V116: mcpGloryClaim - 领取荣耀等级奖励
            mcpGloryClaim(levelId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!levelId) return { error: '等级ID不能为空' };
                    if (!GLORY_LEVEL_REWARDS[levelId]) return { error: '荣耀等级不存在: ' + levelId };
                    
                    const glory = this._initGloryState();
                    const tierData = glory.levelRewards[levelId];
                    
                    if (!tierData) return { error: '荣耀等级数据不存在' };
                    if (tierData.claimed) return { error: '该等级奖励已领取' };
                    
                    if ((glory.points || 0) < tierData.need) {
                        return { error: '荣耀值不足，需要' + tierData.need + '点，当前' + glory.points + '点' };
                    }
                    
                    tierData.claimed = true;
                    gs.spiritStones = (gs.spiritStones || 0) + tierData.reward.spiritStones;
                    gs.exp = (gs.exp || 0) + tierData.reward.exp;
                    
                    return {
                        success: true,
                        message: '领取' + levelId + '荣耀奖励成功',
                        reward: tierData.reward
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: _initCheckinState - 初始化签到系统状态
            _initCheckinState() {
                const gs = window.gameState;
                if (!gs.checkin) {
                    gs.checkin = {
                        signedToday: false,
                        currentStreak: 0,
                        lastSignDate: null,
                        totalDays: 0,
                        streakRewards: JSON.parse(JSON.stringify(CHECKIN_STREAK_REWARDS))
                    };
                }
                // Check if it's a new day and reset signedToday if needed
                if (gs.checkin.lastSignDate) {
                    const last = new Date(gs.checkin.lastSignDate);
                    const now = new Date();
                    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                    if (diffDays > 1) {
                        // Streak broken if missed more than 1 day
                        gs.checkin.currentStreak = 0;
                    }
                    if (diffDays >= 1) {
                        gs.checkin.signedToday = false;
                    }
                }
                return gs.checkin;
            }

            // V117: _initWelfareState - 初始化福利系统状态
            _initWelfareState() {
                const gs = window.gameState;
                if (!gs.welfare) {
                    gs.welfare = {
                        dailyClaimed: false,
                        weeklyClaimed: false,
                        monthlyClaimed: false,
                        lastClaimDate: null,
                        rewards: JSON.parse(JSON.stringify(WELFARE_REWARDS))
                    };
                }
                // Check if it's a new day and reset daily claim if needed
                if (gs.welfare.lastClaimDate) {
                    const last = new Date(gs.welfare.lastClaimDate);
                    const now = new Date();
                    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                    if (diffDays >= 1) {
                        gs.welfare.dailyClaimed = false;
                    }
                    // Reset weekly at start of week (Monday)
                    const lastWeek = Math.floor(last.getTime() / (7 * 24 * 60 * 60 * 1000));
                    const nowWeek = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
                    if (nowWeek > lastWeek) {
                        gs.welfare.weeklyClaimed = false;
                    }
                    // Reset monthly at start of month
                    if (last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear()) {
                        gs.welfare.monthlyClaimed = false;
                    }
                }
                return gs.welfare;
            }

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
            mcpQuestList(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const quest = this._initQuestState();
                    const { filter = 'available' } = args || {};
                    let quests = [];
                    switch (filter) {
                        case 'available':
                            quests = quest.available || [];
                            break;
                        case 'active':
                            quests = quest.active || [];
                            break;
                        case 'completed':
                            quests = quest.completed || [];
                            break;
                        case 'all':
                            quests = [...(quest.available || []), ...(quest.active || []), ...(quest.completed || [])];
                            break;
                        default:
                            quests = quest.available || [];
                    }
                    return {
                        success: true,
                        filter,
                        total: quests.length,
                        quests: quests.map(q => ({
                            id: q.id,
                            name: q.name,
                            description: q.description,
                            type: q.type,
                            difficulty: q.difficulty,
                            realmRequired: q.realmRequired,
                            reward: q.reward
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpQuestAccept - 接受任务
            mcpQuestAccept(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const { questId } = args || {};
                    if (!questId) return { error: '任务ID不能为空' };
                    const quest = this._initQuestState();
                    // Check if active quest limit reached (max 5)
                    if (quest.active.length >= 5) {
                        return { error: '进行中的任务已达上限(5)' };
                    }
                    // Find quest in available pool
                    const questIndex = quest.available.findIndex(q => q.id === questId);
                    if (questIndex === -1) {
                        return { error: '任务不存在或已不可接取: ' + questId };
                    }
                    const questData = quest.available[questIndex];
                    // Check realm requirement
                    if (questData.realmRequired && (gs.realm || 0) < questData.realmRequired) {
                        return { error: '境界不足，需要炼气' + (questData.realmRequired + 1) + '期' };
                    }
                    // Move from available to active
                    quest.available.splice(questIndex, 1);
                    quest.active.push({
                        id: questData.id,
                        name: questData.name,
                        progress: 0,
                        startTime: Date.now()
                    });
                    return {
                        success: true,
                        questId,
                        message: '任务已接受: ' + questData.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpQuestSubmit - 提交已完成任务
            mcpQuestSubmit(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const { questId } = args || {};
                    if (!questId) return { error: '任务ID不能为空' };
                    const quest = this._initQuestState();
                    // Find quest in active
                    const activeIndex = quest.active.findIndex(q => q.id === questId);
                    if (activeIndex === -1) {
                        return { error: '任务不在进行中: ' + questId };
                    }
                    const activeQuest = quest.active[activeIndex];
                    // Find quest reward from pool
                    const questPoolData = QUEST_POOL.find(q => q.id === questId) || {};
                    const reward = questPoolData.reward || { spiritStones: 100, exp: 10 };
                    // Move from active to completed
                    quest.active.splice(activeIndex, 1);
                    quest.completed.push({
                        id: activeQuest.id,
                        name: activeQuest.name,
                        completedAt: Date.now()
                    });
                    // Give reward
                    gs.spiritStones = (gs.spiritStones || 0) + (reward.spiritStones || 0);
                    gs.totalQuestCompleted = (gs.totalQuestCompleted || 0) + 1;
                    return {
                        success: true,
                        questId,
                        reward,
                        message: '任务已完成: ' + activeQuest.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpAchievementQuery - 查询玩家成就
            mcpAchievementQuery(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const achievement = this._initAchievementState();
                    const { filter = 'all' } = args || {};
                    const allAchievements = ACHIEVEMENT_POOL;
                    let achievements = [];
                    switch (filter) {
                        case 'all':
                            achievements = allAchievements;
                            break;
                        case 'unlocked':
                            achievements = allAchievements.filter(a => achievement.unlocked.includes(a.id));
                            break;
                        case 'locked':
                            achievements = allAchievements.filter(a => !achievement.unlocked.includes(a.id));
                            break;
                        default:
                            achievements = allAchievements;
                    }
                    return {
                        success: true,
                        filter,
                        total: achievements.length,
                        achievements: achievements.map(a => ({
                            id: a.id,
                            name: a.name,
                            description: a.description,
                            unlocked: achievement.unlocked.includes(a.id),
                            rewardClaimed: achievement.rewardsClaimed.includes(a.id)
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: _checkAchievementCondition - 检查成就条件是否满足
            _checkAchievementCondition(condition) {
                const gs = window.gameState;
                if (!condition || !condition.type) return false;
                switch (condition.type) {
                    case 'questCompleted':
                        return (gs.totalQuestCompleted || 0) >= condition.amount;
                    case 'totalStone':
                        return (gs.totalStone || 0) >= condition.amount;
                    case 'realm':
                        return (gs.realm || 0) >= condition.level;
                    case 'rank':
                        return (gs.rank || 999999) <= condition.position;
                    case 'pillCrafted':
                        return (gs.pillCrafted || 0) >= condition.amount;
                    case 'skillLearned':
                        return (gs.skillLearned || 0) >= condition.amount;
                    case 'equipmentEnhanced':
                        return (gs.equipmentEnhanced || 0) >= condition.amount;
                    case 'serendipity':
                        return (gs.serendipity || 0) >= condition.amount;
                    case 'inSect':
                        return gs.sect && gs.sect.name;
                    case 'sectContribution':
                        return (gs.sect?.contribution || 0) >= condition.amount;
                    default:
                        return false;
                }
            }

            // V114: mcpAchievementUnlock - 解锁成就
            mcpAchievementUnlock(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const { achievementId } = args || {};
                    if (!achievementId) return { error: '成就ID不能为空' };
                    const achievement = this._initAchievementState();
                    // Find achievement in pool
                    const achData = ACHIEVEMENT_POOL.find(a => a.id === achievementId);
                    if (!achData) {
                        return { error: '成就不存在: ' + achievementId };
                    }
                    // Check if already unlocked
                    if (achievement.unlocked.includes(achievementId)) {
                        return { success: true, message: '成就已解锁: ' + achData.name };
                    }
                    // Check condition
                    if (!this._checkAchievementCondition(achData.condition)) {
                        return { error: '成就条件未满足: ' + achData.name };
                    }
                    // Unlock
                    achievement.unlocked.push(achievementId);
                    return {
                        success: true,
                        achievementId,
                        message: '成就已解锁: ' + achData.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpAchievementReward - 领取成就奖励
            mcpAchievementReward(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const { achievementId } = args || {};
                    if (!achievementId) return { error: '成就ID不能为空' };
                    const achievement = this._initAchievementState();
                    // Find achievement in pool
                    const achData = ACHIEVEMENT_POOL.find(a => a.id === achievementId);
                    if (!achData) {
                        return { error: '成就不存在: ' + achievementId };
                    }
                    // Check if unlocked
                    if (!achievement.unlocked.includes(achievementId)) {
                        return { error: '成就未解锁: ' + achData.name };
                    }
                    // Check if already claimed
                    if (achievement.rewardsClaimed.includes(achievementId)) {
                        return { error: '奖励已领取: ' + achData.name };
                    }
                    // Claim reward
                    achievement.rewardsClaimed.push(achievementId);
                    const reward = achData.reward || { spiritStones: 100, exp: 10 };
                    gs.spiritStones = (gs.spiritStones || 0) + (reward.spiritStones || 0);
                    return {
                        success: true,
                        achievementId,
                        reward,
                        message: '奖励已领取: ' + achData.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V124: _initTitleState - 初始化称号系统状态
            _initTitleState() {
                const gs = window.gameState;
                if (!gs.title) {
                    gs.title = {
                        titles: TITLE_POOL.map(t => ({ ...t })),
                        activeTitle: null
                    };
                }
                return gs.title;
            }

            // V124: mcpAchievementList - 获取成就列表
            mcpAchievementList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const achievement = this._initAchievementState();
                    const allAchievements = ACHIEVEMENT_POOL;
                    return {
                        success: true,
                        total: allAchievements.length,
                        achievements: allAchievements.map(a => ({
                            id: a.id,
                            name: a.name,
                            description: a.description,
                            progress: this._getAchievementProgress(a),
                            target: this._getAchievementTarget(a),
                            reward: a.reward,
                            claimed: achievement.rewardsClaimed.includes(a.id)
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V124: _getAchievementProgress - 获取成就当前进度
            _getAchievementProgress(achData) {
                const gs = window.gameState;
                const cond = achData.condition;
                switch (cond.type) {
                    case 'questCompleted': return gs.totalQuestCompleted || 0;
                    case 'totalStone': return gs.totalStone || 0;
                    case 'realm': return gs.realm || 0;
                    case 'rank': return gs.rank || 999999;
                    case 'pillCrafted': return gs.pillCrafted || 0;
                    case 'skillLearned': return gs.skillLearned || 0;
                    case 'equipmentEnhanced': return gs.equipmentEnhanced || 0;
                    case 'serendipity': return gs.serendipity || 0;
                    case 'inSect': return gs.sect && gs.sect.name ? 1 : 0;
                    case 'sectContribution': return gs.sect?.contribution || 0;
                    default: return 0;
                }
            }

            // V124: _getAchievementTarget - 获取成就目标值
            _getAchievementTarget(achData) {
                const cond = achData.condition;
                if (cond.type === 'realm' || cond.type === 'rank' || cond.type === 'sectLeader') return cond.level || cond.position || cond.amount;
                return cond.amount || 0;
            }

            // V124: mcpAchievementClaim - 领取成就奖励
            mcpAchievementClaim(achievementId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!achievementId) return { error: '成就ID不能为空' };
                    const achievement = this._initAchievementState();
                    const achData = ACHIEVEMENT_POOL.find(a => a.id === achievementId);
                    if (!achData) return { error: '成就不存在: ' + achievementId };
                    if (!achievement.unlocked.includes(achievementId)) return { error: '成就未解锁' };
                    if (achievement.rewardsClaimed.includes(achievementId)) return { error: '奖励已领取' };
                    achievement.rewardsClaimed.push(achievementId);
                    const reward = achData.reward || { spiritStones: 100, exp: 10 };
                    gs.spiritStones = (gs.spiritStones || 0) + (reward.spiritStones || 0);
                    return { success: true, achievementId, reward, message: '奖励已领取' };
                } catch (e) { return { error: e.message }; }
            }

            // V124: mcpAchievementProgress - 查看成就进度
            mcpAchievementProgress(achievementId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!achievementId) return { error: '成就ID不能为空' };
                    const achData = ACHIEVEMENT_POOL.find(a => a.id === achievementId);
                    if (!achData) return { error: '成就不存在: ' + achievementId };
                    const progress = this._getAchievementProgress(achData);
                    const target = this._getAchievementTarget(achData);
                    const complete = progress >= target;
                    return {
                        success: true,
                        achievementId,
                        name: achData.name,
                        progress,
                        target,
                        complete
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V124: mcpTitleList - 获取称号列表
            mcpTitleList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const title = this._initTitleState();
                    const unlockedTitles = title.titles.filter(t => t.unlocked);
                    return {
                        success: true,
                        total: unlockedTitles.length,
                        titles: unlockedTitles.map(t => ({
                            id: t.id,
                            name: t.name,
                            description: t.description
                        })),
                        activeTitle: title.activeTitle
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V124: mcpTitleActivate - 激活称号
            mcpTitleActivate(titleId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!titleId) return { error: '称号ID不能为空' };
                    const title = this._initTitleState();
                    const titleData = title.titles.find(t => t.id === titleId);
                    if (!titleData) return { error: '称号不存在: ' + titleId };
                    if (!titleData.unlocked) return { error: '称号未解锁' };
                    title.activeTitle = titleId;
                    return { success: true, titleId, name: titleData.name, message: '称号已激活' };
                } catch (e) { return { error: e.message }; }
            }

            // V124: mcpTitleRemove - 卸下称号
            mcpTitleRemove() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const title = this._initTitleState();
                    if (!title.activeTitle) return { success: true, message: '当前未佩戴称号' };
                    title.activeTitle = null;
                    return { success: true, message: '称号已卸下' };
                } catch (e) { return { error: e.message }; }
            }

            // V125: _initMailState - 初始化邮件状态
            _initMailState() {
                const gs = window.gameState;
                if (!gs.mail) {
                    gs.mail = {
                        mails: [],
                        nextMailId: 1
                    };
                }
                return gs.mail;
            }

            // V125: _initMessageState - 初始化消息状态
            _initMessageState() {
                const gs = window.gameState;
                if (!gs.message) {
                    gs.message = {
                        messages: [],
                        nextMessageId: 1
                    };
                }
                return gs.message;
            }

            // V125: mcpMailList - 获取邮件列表
            mcpMailList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mail = this._initMailState();
                    const unreadCount = mail.mails.filter(m => !m.read).length;
                    return {
                        success: true,
                        total: mail.mails.length,
                        unreadCount,
                        mails: mail.mails.map(m => ({
                            id: m.id,
                            from: m.from,
                            to: m.to,
                            title: m.title,
                            content: m.content,
                            time: m.time,
                            read: m.read,
                            attachments: m.attachments || []
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMailSend - 发送邮件
            mcpMailSend(to, title, content) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!to) return { error: '收件人不能为空' };
                    if (!title) return { error: '标题不能为空' };
                    if (!content) return { error: '内容不能为空' };
                    const mail = this._initMailState();
                    const newMail = {
                        id: 'mail_' + mail.nextMailId++,
                        from: gs.playerName || gs.name || 'player',
                        to: to,
                        title: title,
                        content: content,
                        time: Date.now(),
                        read: false,
                        attachments: []
                    };
                    mail.mails.push(newMail);
                    return { success: true, mailId: newMail.id, message: '邮件已发送' };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMailDelete - 删除邮件
            mcpMailDelete(mailId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mailId) return { error: '邮件ID不能为空' };
                    const mail = this._initMailState();
                    const index = mail.mails.findIndex(m => m.id === mailId);
                    if (index === -1) return { error: '邮件不存在: ' + mailId };
                    mail.mails.splice(index, 1);
                    return { success: true, message: '邮件已删除' };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMessageList - 获取消息列表
            mcpMessageList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const message = this._initMessageState();
                    const unreadCount = message.messages.filter(m => !m.read).length;
                    return {
                        success: true,
                        total: message.messages.length,
                        unreadCount,
                        messages: message.messages.map(m => ({
                            id: m.id,
                            type: m.type,
                            content: m.content,
                            time: m.time,
                            read: m.read
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMessageMarkRead - 标记消息已读
            mcpMessageMarkRead(messageId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!messageId) return { error: '消息ID不能为空' };
                    const message = this._initMessageState();
                    const msg = message.messages.find(m => m.id === messageId);
                    if (!msg) return { error: '消息不存在: ' + messageId };
                    msg.read = true;
                    return { success: true, message: '消息已标记为已读' };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMessageClear - 清空所有消息
            mcpMessageClear() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const message = this._initMessageState();
                    const count = message.messages.length;
                    message.messages = [];
                    return { success: true, cleared: count, message: '已清空所有消息' };
                } catch (e) { return { error: e.message }; }
            }

            // V126: _initMapState - 初始化地图状态
            _initMapState() {
                const gs = window.gameState;
                if (!gs.map) {
                    gs.map = {
                        areas: MAP_AREAS.map(a => ({ ...a, unlocked: a.level === 1 })),
                        currentArea: null
                    };
                }
                return gs.map;
            }

            // V126: _initExploreState - 初始化探索状态
            _initExploreState() {
                const gs = window.gameState;
                if (!gs.explore) {
                    gs.explore = {
                        active: null,
                        history: []
                    };
                }
                return gs.explore;
            }

            // V126: mcpMapList - 获取地图区域列表
            mcpMapList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mapState = this._initMapState();
                    return {
                        success: true,
                        areas: mapState.areas.map(a => ({
                            id: a.id,
                            name: a.name,
                            level: a.level,
                            unlocked: a.unlocked,
                            description: a.description
                        })),
                        currentArea: mapState.currentArea
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpMapDetail - 获取地图详情
            mcpMapDetail(mapId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mapId) return { error: '地图ID不能为空' };
                    const mapState = this._initMapState();
                    const area = mapState.areas.find(a => a.id === mapId);
                    if (!area) return { error: '地图区域不存在: ' + mapId };
                    return {
                        success: true,
                        id: area.id,
                        name: area.name,
                        description: area.description,
                        level: area.level,
                        unlocked: area.unlocked,
                        unlockCost: area.unlockCost,
                        reward: area.reward,
                        duration: area.duration
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpMapUnlock - 解锁地图区域
            mcpMapUnlock(mapId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mapId) return { error: '地图ID不能为空' };
                    const mapState = this._initMapState();
                    const area = mapState.areas.find(a => a.id === mapId);
                    if (!area) return { error: '地图区域不存在: ' + mapId };
                    if (area.unlocked) return { error: '该区域已解锁' };
                    if (gs.spiritStones < area.unlockCost) return { error: '灵石不足，需要 ' + area.unlockCost + ' 灵石' };
                    gs.spiritStones -= area.unlockCost;
                    area.unlocked = true;
                    return { success: true, message: '区域已解锁: ' + area.name, cost: area.unlockCost };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpExploreStart - 开始探索
            mcpExploreStart(mapId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mapId) return { error: '地图ID不能为空' };
                    const mapState = this._initMapState();
                    const exploreState = this._initExploreState();
                    const area = mapState.areas.find(a => a.id === mapId);
                    if (!area) return { error: '地图区域不存在: ' + mapId };
                    if (!area.unlocked) return { error: '该区域未解锁，请先解锁' };
                    if (exploreState.active) return { error: '已有正在进行的探索，请先完成' };
                    exploreState.active = {
                        areaId: mapId,
                        areaName: area.name,
                        startTime: Date.now(),
                        duration: area.duration * 1000
                    };
                    return { success: true, message: '开始探索: ' + area.name, duration: area.duration };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpExploreStatus - 查看探索状态
            mcpExploreStatus() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const exploreState = this._initExploreState();
                    if (!exploreState.active) return { active: false, message: '当前没有正在进行的探索' };
                    const elapsed = Date.now() - exploreState.active.startTime;
                    const remaining = Math.max(0, exploreState.active.duration - elapsed);
                    const completed = remaining === 0;
                    return {
                        active: true,
                        areaId: exploreState.active.areaId,
                        areaName: exploreState.active.areaName,
                        elapsed: Math.floor(elapsed / 1000),
                        remaining: Math.floor(remaining / 1000),
                        completed,
                        message: completed ? '探索已完成，可以领取奖励' : '探索进行中'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpExploreComplete - 领取探索奖励
            mcpExploreComplete() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };