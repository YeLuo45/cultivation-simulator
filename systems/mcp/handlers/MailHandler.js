// ============================================================
// MailHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 30675-31014
// Auto-generated - Do not edit manually
// ============================================================

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