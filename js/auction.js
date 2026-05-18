// Auto-generated module: auction.js
'use strict';

// ===== AUCTION CONSTANTS (V40) =====
const AUCTION_CONFIG = {
    minIncrement: 0.05,      // 最低加价幅度5%
    maxBidHours: 24,        // 竞拍时长24小时
    bidExtensionMinutes: 5, // 最后5分钟有人出价延长的时长
    platformFee: 0.03,      // 平台手续费3%
    listingFee: 100,         // 挂单费用100灵石
    maxListings: 20,         // 最多同时挂20个物品
    categories: ['功法', '装备', '丹药', '材料', '仙宠', '其他']
};

const AUCTION_RARITY = {
    '普通': { color: '#9e9e9e', bidMultiplier: 1.0 },
    '稀有': { color: '#2196f3', bidMultiplier: 1.5 },
    '珍贵': { color: '#9c27b0', bidMultiplier: 2.5 },
    '史诗': { color: '#ff9800', bidMultiplier: 5 },
    '传说': { color: '#ffd700', bidMultiplier: 10 },
    '神话': { color: '#f44336', bidMultiplier: 25 }
};

const AUCTION_CATEGORIES = {
    '功法': { icon: '📖', itemTypes: ['technique', 'manual'] },
    '装备': { icon: '⚔️', itemTypes: ['weapon', 'armor', 'accessory'] },
    '丹药': { icon: '💊', itemTypes: ['pill', 'elixir'] },
    '材料': { icon: '💎', itemTypes: ['herb', 'ore', 'spirit'] },
    '仙宠': { icon: '🐉', itemTypes: ['pet'] },
    '其他': { icon: '🎁', itemTypes: ['misc'] }
};

// ===== AUCTION FUNCTIONS =====

function showAuctionPanel() {
    const auction = gameState.auction;
    const now = Date.now();
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:1000px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">🏪 仙界拍卖行</h2>
            <div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn" style="background:#4caf50;color:white;" onclick="showAuctionBrowse()">🔍 浏览拍卖</button>
                <button class="btn" style="background:#ff9800;color:white;" onclick="showAuctionMyBids()">📊 我的竞拍</button>
                <button class="btn" style="background:#2196f3;color:white;" onclick="showAuctionMyListings()">📦 我的挂单</button>
                <button class="btn" style="background:#9c27b0;color:white;" onclick="showAuctionCreateListing()">➕ 发布拍卖</button>
            </div>`;

    // 当前热门
    const activeAuctions = auction.listings.filter(l => l.endTime > now && l.status === 'active');
    const endingSoon = activeAuctions.filter(l => l.endTime - now < 3600000).sort((a, b) => a.endTime - b.endTime).slice(0, 5);

    if (endingSoon.length > 0) {
        html += `<div style="margin-bottom:15px;">
            <h3 style="color:#f44336;margin-bottom:10px;">⏰ 即将结束</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">`;
        endingSoon.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const timeLeft = formatAuctionTime(l.endTime - now);
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            html += `<div style="background:rgba(244,67,54,0.2);border:1px solid #f44336;border-radius:8px;padding:10px;cursor:pointer;" onclick="showAuctionDetail(${l.id})">
                <div style="color:${rarityData.color};font-weight:bold;">${item.name}</div>
                <div style="color:#aaa;font-size:0.85em;">${item.category} | ${item.rarity}</div>
                <div style="color:#ffd700;">当前: ${currentBid}灵石</div>
                <div style="color:#f44336;font-size:0.9em;">剩余: ${timeLeft}</div>
            </div>`;
        });
        html += `</div></div>`;
    }

    // 高价值物品
    const highValue = activeAuctions.filter(l => {
        const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
        return currentBid >= 10000;
    }).sort((a, b) => {
        const aBid = a.bids.length > 0 ? a.bids[a.bids.length - 1].amount : a.startPrice;
        const bBid = b.bids.length > 0 ? b.bids[b.bids.length - 1].amount : b.startPrice;
        return bBid - aBid;
    }).slice(0, 5);

    if (highValue.length > 0) {
        html += `<div style="margin-bottom:15px;">
            <h3 style="color:#ffd700;margin-bottom:10px;">💰 高价值拍卖</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">`;
        highValue.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            html += `<div style="background:rgba(255,215,0,0.1);border:1px solid #ffd700;border-radius:8px;padding:10px;cursor:pointer;" onclick="showAuctionDetail(${l.id})">
                <div style="color:${rarityData.color};font-weight:bold;">${item.name}</div>
                <div style="color:#aaa;font-size:0.85em;">${item.category} | ${item.rarity}</div>
                <div style="color:#ffd700;">当前: ${currentBid}灵石</div>
                <div style="color:#aaa;font-size:0.85em;">出价次数: ${l.bids.length}</div>
            </div>`;
        });
        html += `</div></div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
    </div></div></div>`;
    openModal('仙界拍卖行', html, []);
}

function showAuctionBrowse() {
    const auction = gameState.auction;
    const now = Date.now();
    const activeListings = auction.listings.filter(l => l.endTime > now && l.status === 'active');
    const categories = AUCTION_CONFIG.categories;

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">🔍 浏览拍卖</h2>
            <div style="display:flex;gap:8px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn" style="background:#555;color:white;" onclick="showAuctionBrowse()">全部</button>`;
    categories.forEach(cat => {
        html += `<button class="btn" style="background:#333;color:white;" onclick="showAuctionBrowseByCategory('${cat}')">${AUCTION_CATEGORIES[cat].icon} ${cat}</button>`;
    });
    html += `</div>`;

    // 排序选项
    html += `<div style="display:flex;gap:10px;margin-bottom:15px;align-items:center;">
        <span style="color:#aaa;">排序:</span>
        <button class="btn" style="background:#333;color:white;font-size:0.85em;" onclick="sortAuctionListings('endingSoon')">即将结束</button>
        <button class="btn" style="background:#333;color:white;font-size:0.85em;" onclick="sortAuctionListings('priceHigh')">价格最高</button>
        <button class="btn" style="background:#333;color:white;font-size:0.85em;" onclick="sortAuctionListings('priceLow')">价格最低</button>
        <button class="btn" style="background:#333;color:white;font-size:0.85em;" onclick="sortAuctionListings('newest')">最新</button>
    </div>`;

    // 物品列表
    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">`;
    if (activeListings.length === 0) {
        html += `<p style="color:#aaa;text-align:center;grid-column:1/-1;">暂无拍卖物品</p>`;
    } else {
        activeListings.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const timeLeft = formatAuctionTime(l.endTime - now);
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            const isEnding = l.endTime - now < 3600000;
            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${rarityData.color};border-radius:8px;padding:12px;cursor:pointer;${isEnding ? 'border-color:#f44336;' : ''}" onclick="showAuctionDetail(${l.id})">
                <div style="color:${rarityData.color};font-weight:bold;font-size:1.05em;">${item.name}</div>
                <div style="color:#aaa;font-size:0.85em;margin:4px 0;">${AUCTION_CATEGORIES[item.category]?.icon || '🎁'} ${item.category} | ${item.rarity}</div>
                ${item.level ? `<div style="color:#aaa;font-size:0.8em;">等级: ${item.level}</div>` : ''}
                <div style="color:#ffd700;margin-top:5px;">当前: ${formatNumber(currentBid)}灵石</div>
                <div style="color:${isEnding ? '#f44336' : '#aaa'};font-size:0.85em;">⏰ ${timeLeft}</div>
                <div style="color:#aaa;font-size:0.8em;">出价: ${l.bids.length}次</div>
            </div>`;
        });
    }
    html += `</div><div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionPanel()">返回</button>
    </div></div></div>`;
    openModal('浏览拍卖', html, []);
}

function showAuctionBrowseByCategory(category) {
    const auction = gameState.auction;
    const now = Date.now();
    const activeListings = auction.listings.filter(l => l.endTime > now && l.status === 'active' && l.item.category === category);

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">${AUCTION_CATEGORIES[category].icon} ${category}拍卖</h2>`;

    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">`;
    if (activeListings.length === 0) {
        html += `<p style="color:#aaa;text-align:center;grid-column:1/-1;">该分类暂无拍卖物品</p>`;
    } else {
        activeListings.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const timeLeft = formatAuctionTime(l.endTime - now);
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            const isEnding = l.endTime - now < 3600000;
            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${rarityData.color};border-radius:8px;padding:12px;cursor:pointer;${isEnding ? 'border-color:#f44336;' : ''}" onclick="showAuctionDetail(${l.id})">
                <div style="color:${rarityData.color};font-weight:bold;font-size:1.05em;">${item.name}</div>
                <div style="color:#aaa;font-size:0.85em;margin:4px 0;">${item.rarity}</div>
                ${item.level ? `<div style="color:#aaa;font-size:0.8em;">等级: ${item.level}</div>` : ''}
                <div style="color:#ffd700;margin-top:5px;">当前: ${formatNumber(currentBid)}灵石</div>
                <div style="color:${isEnding ? '#f44336' : '#aaa'};font-size:0.85em;">⏰ ${timeLeft}</div>
            </div>`;
        });
    }
    html += `</div><div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionBrowse()">返回</button>
    </div></div></div>`;
    openModal(`${category}拍卖`, html, []);
}

function sortAuctionListings(sortType) {
    gameState.auction.sortType = sortType;
    showAuctionBrowse();
}

function showAuctionDetail(listingId) {
    const auction = gameState.auction;
    const listing = auction.listings.find(l => l.id === listingId);
    if (!listing) {
        addLog('拍卖物品不存在', '#f44336');
        return;
    }

    const item = listing.item;
    const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
    const now = Date.now();
    const timeLeft = listing.endTime - now;
    const currentBid = listing.bids.length > 0 ? listing.bids[listing.bids.length - 1].amount : listing.startPrice;
    const minNextBid = Math.ceil(currentBid * (1 + AUCTION_CONFIG.minIncrement));
    const myBids = listing.bids.filter(b => b.bidderId === gameState.playerId);
    const isHighestBidder = myBids.length > 0 && listing.bids[listing.bids.length - 1].bidderId === gameState.playerId;
    const isOwner = listing.sellerId === gameState.playerId;
    const isEnded = timeLeft <= 0;

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid ${rarityData.color};border-radius:12px;padding:20px;max-width:600px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:${rarityData.color};text-align:center;margin-bottom:10px;">${AUCTION_CATEGORIES[item.category]?.icon || '🎁'} ${item.name}</h2>
            <div style="text-align:center;margin-bottom:15px;">
                <span style="color:#aaa;">${item.category} | ${item.rarity}</span>
                ${item.level ? `<span style="color:#aaa;"> | 等级: ${item.level}</span>` : ''}
            </div>`;

    // 物品描述
    html += `<div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin-bottom:15px;">
        <div style="color:#ffd700;">${item.description || '暂无描述'}</div>
        ${item.stats ? `<div style="margin-top:8px;color:#aaa;">属性: ${Object.entries(item.stats).map(([k, v]) => `${k}+${v}`).join(' | ')}</div>` : ''}
        ${item.effects ? `<div style="color:#aaa;font-size:0.9em;">效果: ${item.effects}</div>` : ''}
    </div>`;

    // 拍卖信息
    html += `<div style="margin-bottom:15px;">
        <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
            <span style="color:#aaa;">起拍价</span>
            <span style="color:#ffd700;">${formatNumber(listing.startPrice)}灵石</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
            <span style="color:#aaa;">当前价</span>
            <span style="color:#ffd700;font-weight:bold;">${formatNumber(currentBid)}灵石</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
            <span style="color:#aaa;">竞拍次数</span>
            <span style="color:#fff;">${listing.bids.length}次</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
            <span style="color:#aaa;">剩余时间</span>
            <span style="color:${timeLeft < 3600000 ? '#f44336' : '#4caf50'};font-weight:bold;">${isEnded ? '已结束' : formatAuctionTime(timeLeft)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px;">
            <span style="color:#aaa;">卖家</span>
            <span style="color:#fff;">${listing.sellerName}</span>
        </div>
    </div>`;

    // 竞拍历史
    if (listing.bids.length > 0) {
        html += `<div style="margin-bottom:15px;">
            <h4 style="color:#ffd700;margin-bottom:8px;">竞拍记录</h4>`;
        listing.bids.slice(-5).reverse().forEach(b => {
            const isMe = b.bidderId === gameState.playerId;
            html += `<div style="display:flex;justify-content:space-between;padding:4px;font-size:0.9em;">
                <span style="color:${isMe ? '#4caf50' : '#aaa'};">${isMe ? '我' : b.bidderName}</span>
                <span style="color:#ffd700;">${formatNumber(b.amount)}灵石</span>
                <span style="color:#888;">${formatAuctionTime(now - b.time)}前</span>
            </div>`;
        });
        html += `</div>`;
    }

    // 出价/取消
    if (!isEnded) {
        if (isOwner) {
            html += `<p style="color:#aaa;text-align:center;">这是您的拍卖物品</p>`;
        } else {
            if (isHighestBidder) {
                html += `<p style="color:#4caf50;text-align:center;margin-bottom:10px;">🏆 您是当前最高出价者</p>`;
            }
            html += `<div style="display:flex;gap:10px;margin-bottom:10px;">
                <input type="number" id="bidAmount" value="${minNextBid}" min="${minNextBid}" step="${Math.ceil(minNextBid * 0.05)}"
                    style="flex:1;background:#333;border:1px solid #555;color:#ffd700;padding:10px;border-radius:5px;" />
                <button class="btn" style="background:#4caf50;color:white;" onclick="placeBid(${listingId})">出价</button>
            </div>`;
            if (myBids.length > 0) {
                html += `<button class="btn" style="background:#f44336;color:white;width:100%;" onclick="cancelMyBid(${listingId})">取消我的出价（返还${myBids[0].amount}灵石）</button>`;
            }
        }
    } else {
        // 拍卖已结束
        if (listing.bids.length > 0) {
            const winner = listing.bids[listing.bids.length - 1];
            if (winner.bidderId === gameState.playerId) {
                html += `<p style="color:#4caf50;text-align:center;font-size:1.2em;">🏆 恭喜您拍得此物品！</p>`;
                if (!listing.winnerPaid) {
                    html += `<button class="btn" style="background:#4caf50;color:white;width:100%;margin-top:10px;" onclick="claimAuctionItem(${listingId})">确认收货（支付${formatNumber(currentBid)}灵石）</button>`;
                } else {
                    html += `<p style="color:#aaa;text-align:center;">物品已发放至背包</p>`;
                }
            } else if (isOwner) {
                html += `<p style="color:#ffd700;text-align:center;">拍卖结束，售出给 ${winner.bidderName}</p>`;
                html += `<p style="color:#aaa;text-align:center;">获得 ${formatNumber(Math.floor(currentBid * (1 - AUCTION_CONFIG.platformFee)))} 灵石（扣除${AUCTION_CONFIG.platformFee * 100}%手续费）</p>`;
            } else {
                html += `<p style="color:#aaa;text-align:center;">很遗憾，您未能拍得此物品</p>`;
            }
        } else {
            html += `<p style="color:#aaa;text-align:center;">拍卖流拍</p>`;
            if (isOwner) {
                html += `<p style="color:#888;text-align:center;">物品已返还至背包</p>`;
            }
        }
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionBrowse()">返回</button>
    </div></div></div>`;
    openModal('拍卖详情', html, []);
}

function placeBid(listingId) {
    const bidInput = document.getElementById('bidAmount');
    if (!bidInput) return;
    const amount = parseInt(bidInput.value);

    const auction = gameState.auction;
    const listing = auction.listings.find(l => l.id === listingId);
    if (!listing) {
        addLog('拍卖物品不存在', '#f44336');
        return;
    }

    if (listing.sellerId === gameState.playerId) {
        addLog('不能竞拍自己的物品', '#f44336');
        return;
    }

    if (amount > gameState.spiritStones) {
        addLog('灵石不足', '#f44336');
        return;
    }

    const currentBid = listing.bids.length > 0 ? listing.bids[listing.bids.length - 1].amount : listing.startPrice;
    const minBid = Math.ceil(currentBid * (1 + AUCTION_CONFIG.minIncrement));

    if (amount < minBid) {
        addLog(`最低出价 ${formatNumber(minBid)} 灵石`, '#f44336');
        return;
    }

    // 冻结灵石
    gameState.spiritStones -= amount;
    if (!auction.frozenFunds) auction.frozenFunds = 0;
    auction.frozenFunds += amount;

    // 记录出价
    const bid = {
        bidderId: gameState.playerId,
        bidderName: gameState.playerName,
        amount: amount,
        time: Date.now()
    };
    listing.bids.push(bid);

    // 延长竞拍时间（最后5分钟）
    const now = Date.now();
    const timeLeft = listing.endTime - now;
    if (timeLeft < AUCTION_CONFIG.bidExtensionMinutes * 60 * 1000) {
        listing.endTime = now + AUCTION_CONFIG.bidExtensionMinutes * 60 * 1000;
        addLog('竞拍时间已延长5分钟', '#ff9800');
    }

    addLog(`出价成功：${formatNumber(amount)}灵石`, '#4caf50');
    updateDisplay();
    showAuctionDetail(listingId);
}

function cancelMyBid(listingId) {
    const auction = gameState.auction;
    const listing = auction.listings.find(l => l.id === listingId);
    if (!listing) return;

    const myBidIdx = listing.bids.findIndex(b => b.bidderId === gameState.playerId);
    if (myBidIdx === -1) {
        addLog('您没有出价记录', '#f44336');
        return;
    }

    // 解冻灵石
    const myBid = listing.bids[myBidIdx];
    gameState.spiritStones += myBid.amount;
    if (auction.frozenFunds) auction.frozenFunds -= myBid.amount;

    // 移除出价（只移除最后一笔）
    listing.bids.splice(myBidIdx, 1);
    addLog('已取消出价', '#4caf50');
    updateDisplay();
    showAuctionBrowse();
}

function claimAuctionItem(listingId) {
    const auction = gameState.auction;
    const listing = auction.listings.find(l => l.id === listingId);
    if (!listing) return;

    const winner = listing.bids[listing.bids.length - 1];
    if (winner.bidderId !== gameState.playerId) {
        addLog('您不是最高出价者', '#f44336');
        return;
    }

    if (listing.winnerPaid) {
        addLog('已确认收货', '#f44336');
        return;
    }

    const finalPrice = winner.amount;
    const platformFee = Math.floor(finalPrice * AUCTION_CONFIG.platformFee);

    // 解冻并扣除
    if (auction.frozenFunds) auction.frozenFunds -= finalPrice;
    gameState.spiritStones -= (finalPrice - winner.amount); // 只补差价
    if (gameState.spiritStones < 0) {
        gameState.spiritStones += finalPrice;
        addLog('灵石不足', '#f44336');
        return;
    }

    // 发放物品
    addItemToInventory(listing.item);
    listing.winnerPaid = true;

    // 给卖家转帐（扣除手续费）
    const sellerEarnings = finalPrice - platformFee;
    // 卖家灵石通过后台处理，这里只记录
    listing.sellerEarnings = sellerEarnings;

    addLog(`获得物品：${listing.item.name}`, '#4caf50');
    updateDisplay();
    showAuctionPanel();
}

function showAuctionMyBids() {
    const auction = gameState.auction;
    const now = Date.now();
    const myBidListings = auction.listings.filter(l => l.bids.some(b => b.bidderId === gameState.playerId));

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff9800;border-radius:12px;padding:20px;max-width:800px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ff9800;text-align:center;margin-bottom:15px;">📊 我的竞拍</h2>`;

    if (myBidListings.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">暂无竞拍记录</p>`;
    } else {
        html += `<div style="display:grid;gap:12px;">`;
        myBidListings.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            const myLastBid = [...l.bids].reverse().find(b => b.bidderId === gameState.playerId);
            const isHighest = l.bids.length > 0 && l.bids[l.bids.length - 1].bidderId === gameState.playerId;
            const isEnded = l.endTime <= now;
            const timeLeft = l.endTime - now;

            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${rarityData.color};border-radius:8px;padding:12px;cursor:pointer;" onclick="showAuctionDetail(${l.id})">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="color:${rarityData.color};font-weight:bold;">${item.name}</div>
                        <div style="color:#aaa;font-size:0.85em;">${item.category} | ${item.rarity}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:${isHighest ? '#4caf50' : '#f44336'};">${isHighest ? '🏆 领先' : '落后'}</div>
                        <div style="color:#ffd700;">我的出价: ${formatNumber(myLastBid?.amount || 0)}</div>
                        <div style="color:#aaa;font-size:0.85em;">${isEnded ? '已结束' : '剩余: ' + formatAuctionTime(timeLeft)}</div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionPanel()">返回</button>
    </div></div></div>`;
    openModal('我的竞拍', html, []);
}

function showAuctionMyListings() {
    const auction = gameState.auction;
    const now = Date.now();
    const myListings = auction.listings.filter(l => l.sellerId === gameState.playerId);

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #2196f3;border-radius:12px;padding:20px;max-width:800px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#2196f3;text-align:center;margin-bottom:15px;">📦 我的挂单</h2>`;

    if (myListings.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">暂无挂单</p>`;
    } else {
        html += `<div style="display:grid;gap:12px;">`;
        myListings.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            const isEnded = l.endTime <= now;
            const timeLeft = l.endTime - now;

            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${rarityData.color};border-radius:8px;padding:12px;cursor:pointer;" onclick="showAuctionDetail(${l.id})">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="color:${rarityData.color};font-weight:bold;">${item.name}</div>
                        <div style="color:#aaa;font-size:0.85em;">起拍: ${formatNumber(l.startPrice)}灵石</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#ffd700;font-weight:bold;">当前: ${formatNumber(currentBid)}灵石</div>
                        <div style="color:${isEnded ? '#f44336' : '#4caf50'};">${isEnded ? '已结束' : '剩余: ' + formatAuctionTime(timeLeft)}</div>
                        <div style="color:#aaa;font-size:0.85em;">出价: ${l.bids.length}次</div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionPanel()">返回</button>
    </div></div></div>`;
    openModal('我的挂单', html, []);
}

function showAuctionCreateListing() {
    const auction = gameState.auction;
    if (auction.listings.filter(l => l.sellerId === gameState.playerId && l.endTime > Date.now()).length >= AUCTION_CONFIG.maxListings) {
        addLog(`最多同时挂${AUCTION_CONFIG.maxListings}个物品`, '#f44336');
        return;
    }

    // 获取可上架物品（背包中的装备/丹药/材料等）
    const sellableItems = gameState.inventory.filter(item => {
        return item && (item.rarity || item.quality) && !item.auctionListed;
    });

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:600px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">➕ 发布拍卖</h2>
            <p style="color:#aaa;text-align:center;margin-bottom:15px;">挂单费用: ${AUCTION_CONFIG.listingFee}灵石 | 手续费: ${AUCTION_CONFIG.platformFee * 100}%</p>`;

    if (sellableItems.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">背包中没有可上架的物品</p>`;
    } else {
        html += `<div style="max-height:300px;overflow-y:auto;margin-bottom:15px;">
            <div style="display:grid;gap:8px;">`;
        sellableItems.slice(0, 10).forEach((item, idx) => {
            const rarity = item.rarity || item.quality || '普通';
            const rarityData = AUCTION_RARITY[rarity] || AUCTION_RARITY['普通'];
            html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:5px;cursor:pointer;"
                onclick="selectAuctionItem(${idx})" id="auctionItem${idx}">
                <div>
                    <span style="color:${rarityData.color};">${item.name}</span>
                    <span style="color:#888;font-size:0.85em;">${rarity}</span>
                </div>
                <span style="color:#ffd700;">选择</span>
            </div>`;
        });
        html += `</div></div>`;

        // 选择后显示设置表单
        html += `<div id="auctionForm" style="display:none;">
            <div style="margin-bottom:10px;">
                <label style="color:#aaa;display:block;margin-bottom:5px;">起拍价（灵石）</label>
                <input type="number" id="auctionStartPrice" value="1000" min="1" step="100"
                    style="width:100%;background:#333;border:1px solid #555;color:#ffd700;padding:8px;border-radius:5px;" />
            </div>
            <div style="margin-bottom:10px;">
                <label style="color:#aaa;display:block;margin-bottom:5px;">拍卖时长</label>
                <select id="auctionDuration" style="width:100%;background:#333;border:1px solid #555;color:#ffd700;padding:8px;border-radius:5px;">
                    <option value="6">6小时</option>
                    <option value="12">12小时</option>
                    <option value="24" selected>24小时</option>
                    <option value="48">48小时</option>
                    <option value="72">72小时</option>
                </select>
            </div>
            <button class="btn" style="background:#4caf50;color:white;width:100%;" onclick="confirmAuctionListing()">确认发布</button>
        </div>`;

        // 存储选择
        window._selectedAuctionItem = null;
        window._sellableItems = sellableItems.slice(0, 10);
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionPanel()">取消</button>
    </div></div></div>`;
    openModal('发布拍卖', html, []);
}

function selectAuctionItem(idx) {
    window._selectedAuctionItem = idx;
    document.getElementById('auctionForm').style.display = 'block';

    // 高亮选中
    document.querySelectorAll('[id^="auctionItem"]').forEach((el, i) => {
        el.style.border = i === idx ? '2px solid #4caf50' : 'none';
    });
}

function confirmAuctionListing() {
    const idx = window._selectedAuctionItem;
    if (idx === null || idx === undefined) {
        addLog('请选择要拍卖的物品', '#f44336');
        return;
    }

    const item = window._sellableItems[idx];
    if (!item) return;

    const startPrice = parseInt(document.getElementById('auctionStartPrice').value);
    const duration = parseInt(document.getElementById('auctionDuration').value);

    if (startPrice < 1) {
        addLog('起拍价必须大于0', '#f44336');
        return;
    }

    if (gameState.spiritStones < AUCTION_CONFIG.listingFee) {
        addLog(`挂单费用${AUCTION_CONFIG.listingFee}灵石不足`, '#f44336');
        return;
    }

    // 扣除挂单费
    gameState.spiritStones -= AUCTION_CONFIG.listingFee;

    // 从背包移除
    const invIdx = gameState.inventory.findIndex(i => i === item);
    if (invIdx !== -1) gameState.inventory.splice(invIdx, 1);

    // 创建拍卖
    const auction = gameState.auction;
    const listing = {
        id: 'auction_' + Date.now(),
        item: { ...item },
        sellerId: gameState.playerId,
        sellerName: gameState.playerName,
        startPrice: startPrice,
        currentPrice: startPrice,
        startTime: Date.now(),
        endTime: Date.now() + duration * 3600000,
        bids: [],
        status: 'active',
        winnerPaid: false,
        sellerEarnings: 0
    };

    auction.listings.push(listing);
    addLog(`拍卖发布成功：${item.name}，起拍价${formatNumber(startPrice)}灵石`, '#4caf50');
    updateDisplay();
    showAuctionPanel();
}

function processAuctionEnd() {
    const auction = gameState.auction;
    const now = Date.now();

    auction.listings.forEach(listing => {
        if (listing.status === 'active' && listing.endTime <= now) {
            listing.status = 'ended';

            if (listing.bids.length > 0) {
                const winner = listing.bids[listing.bids.length - 1];
                // 如果赢家未付款或未确认，物品返还卖家（简化处理）
                if (!listing.winnerPaid && winner.bidderId !== listing.sellerId) {
                    // 返还卖家灵石（解冻）
                    // 实际上赢家灵石已冻结，这里简化处理
                }
            } else {
                // 流拍，物品返还卖家
                addItemToInventory(listing.item);
                addLog(`拍卖流拍：${listing.item.name} 已返还背包`, '#aaa');
            }
        }
    });
}

function formatAuctionTime(ms) {
    if (ms <= 0) return '0秒';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (hours > 0) return `${hours}小时${minutes}分`;
    if (minutes > 0) return `${minutes}分${seconds}秒`;
    return `${seconds}秒`;
}

function formatNumber(num) {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toLocaleString();
}

// 初始化playerId
if (!gameState.playerId) {
    gameState.playerId = 'player_' + Date.now();
}
if (!gameState.playerName) {
    gameState.playerName = '修士' + Math.floor(Math.random() * 9999);
}