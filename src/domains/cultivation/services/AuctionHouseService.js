/**
 * AuctionHouseService.js - 仙界拍卖行+交易系统
 * V260: 仙界拍卖行+交易系统
 */

export const ITEM_QUALITIES = { 白板: 1, 优秀: 2, 精良: 3, 史诗: 4, 传说: 5, 神器: 6 };
export const AUCTION_DURATIONS = { '1h': 3600000, '6h': 21600000, '12h': 43200000, '24h': 86400000 };

let _instance = null;

export function createAuctionHouseService(gameState) {
  if (_instance) return _instance;
  _instance = new AuctionHouseService(gameState);
  return _instance;
}

class AuctionHouseService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.auctionHouse) {
      this.gameState.auctionHouse = {
        listings: {},
        bidHistory: [],
        myListings: {},
        totalSales: 0
      };
    }
  }

  /**
   * 挂售物品
   */
  listItem(itemId, itemName, quality, startingPrice, duration) {
    if (!ITEM_QUALITIES[quality]) return { success: false, message: '无效品质' };
    if (!AUCTION_DURATIONS[duration]) return { success: false, message: '无效时长' };

    const listingId = `listing_${Date.now()}`;
    const endTime = Date.now() + AUCTION_DURATIONS[duration];

    this.gameState.auctionHouse.listings[listingId] = {
      listingId,
      itemId,
      itemName,
      quality,
      startingPrice,
      currentBid: startingPrice,
      currentBidder: null,
      bids: [],
      endTime,
      seller: this.gameState.player.id || this.gameState.player.name,
      createdAt: Date.now()
    };

    return { success: true, listingId, endTime, message: `「${itemName}」已挂售` };
  }

  /**
   * 出价
   */
  placeBid(listingId, amount) {
    const listing = this.gameState.auctionHouse.listings[listingId];
    if (!listing) return { success: false, message: '拍卖不存在' };
    if (Date.now() >= listing.endTime) return { success: false, message: '拍卖已结束' };

    const minBid = Math.floor(listing.currentBid * 1.1);
    if (amount < minBid) return { success: false, message: `最低出价${minBid}` };

    if (listing.currentBidder) {
      const prev = listing.currentBidder;
    }

    listing.currentBid = amount;
    listing.currentBidder = this.gameState.player.id || this.gameState.player.name;
    listing.bids.push({ bidder: listing.currentBidder, amount, time: Date.now() });
    this.gameState.auctionHouse.bidHistory.push({ listingId, bidder: listing.currentBidder, amount });

    return {
      success: true,
      message: `出价${amount}灵石成功`,
      currentBid: listing.currentBid
    };
  }

  /**
   * 领取拍卖结算
   */
  claimSale(listingId) {
    const listing = this.gameState.auctionHouse.listings[listingId];
    if (!listing) return { success: false, message: '拍卖不存在' };
    if (Date.now() < listing.endTime) return { success: false, message: '拍卖进行中' };
    if (listing.seller !== (this.gameState.player.id || this.gameState.player.name)) {
      return { success: false, message: '无权操作' };
    }

    const seller = this.gameState.player;
    const fee = Math.floor(listing.currentBid * 0.05);
    const net = listing.currentBid - fee;

    seller.spiritStones = (seller.spiritStones || 0) + net;
    this.gameState.auctionHouse.totalSales += listing.currentBid;

    delete this.gameState.auctionHouse.listings[listingId];

    return {
      success: true,
      message: `拍卖完成，获得${net}灵石（扣除${fee}手续费）`,
      net,
      fee
    };
  }

  /**
   * 领取拍品
   */
  claimAuctionWin(listingId) {
    const listing = this.gameState.auctionHouse.listings[listingId];
    if (!listing) return { success: false, message: '拍卖不存在' };
    if (Date.now() < listing.endTime) return { success: false, message: '拍卖进行中' };
    if (listing.currentBidder !== (this.gameState.player.id || this.gameState.player.name)) {
      return { success: false, message: '不是最高出价者' };
    }

    const player = this.gameState.player;
    if ((player.spiritStones || 0) < listing.currentBid) {
      return { success: false, message: '灵石不足' };
    }

    player.spiritStones -= listing.currentBid;
    delete this.gameState.auctionHouse.listings[listingId];

    return {
      success: true,
      message: `拍得「${listing.itemName}」，花费${listing.currentBid}灵石`
    };
  }

  /**
   * 获取活跃拍卖
   */
  getActiveListings(filter = {}) {
    const now = Date.now();
    let listings = Object.values(this.gameState.auctionHouse.listings)
      .filter(l => l.endTime > now);

    if (filter.quality) {
      listings = listings.filter(l => l.quality === filter.quality);
    }

    return {
      success: true,
      listings: listings.sort((a, b) => a.endTime - b.endTime),
      count: listings.length
    };
  }

  /**
   * 获取我的拍卖
   */
  getMyListings() {
    const playerId = this.gameState.player.id || this.gameState.player.name;
    const mine = Object.values(this.gameState.auctionHouse.listings)
      .filter(l => l.seller === playerId);
    return { success: true, listings: mine };
  }
}

export const AUCTION_TOOLS = [
  { name: 'auction.list', description: '挂售物品', params: ['itemId', 'itemName', 'quality', 'startingPrice', 'duration'] },
  { name: 'auction.bid', description: '出价', params: ['listingId', 'amount'] },
  { name: 'auction.claimSale', description: '领取拍卖款', params: ['listingId'] },
  { name: 'auction.claimWin', description: '领取拍品', params: ['listingId'] },
  { name: 'auction.active', description: '活跃拍卖', params: ['filter'] },
  { name: 'auction.mine', description: '我的拍卖', params: [] }
];