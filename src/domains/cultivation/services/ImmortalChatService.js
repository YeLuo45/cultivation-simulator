/**
 * ImmortalChatService.js - 仙人社交+仙友互动系统
 * V253: 仙人社交+仙友互动
 * 
 * 功能：
 * 1. 仙友列表管理
 * 2. 好友赠送灵石
 * 3. 仙友互动事件
 * 4. 仙缘值系统
 */

export const INTERACTION_TYPES = ['拜访', '论道', '切磋', '送礼', '组队'];
export const RELATION_LEVELS = { 陌生人: 0, 初识: 1, 仙友: 2, 知己: 3, 道侣: 4 };

let _instance = null;

export function createImmortalChatService(gameState) {
  if (_instance) return _instance;
  _instance = new ImmortalChatService(gameState);
  return _instance;
}

class ImmortalChatService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.social) {
      this.gameState.social = { friends: {}, relationPoints: {}, giftHistory: [], chatHistory: [] };
    }
    if (!this.gameState.social.friends) this.gameState.social.friends = {};
    if (!this.gameState.social.relationPoints) this.gameState.social.relationPoints = {};
  }

  addFriend(playerId, name) {
    if (!playerId) return { success: false, message: '无效玩家ID' };
    if (this.gameState.social.friends[playerId]) {
      return { success: false, message: '已是仙友' };
    }
    this.gameState.social.friends[playerId] = { name, addedAt: Date.now(), level: '陌生人' };
    this.gameState.social.relationPoints[playerId] = 0;
    return { success: true, message: `与「${name}」成为仙友` };
  }

  removeFriend(playerId) {
    if (!this.gameState.social.friends[playerId]) {
      return { success: false, message: '不是仙友' };
    }
    delete this.gameState.social.friends[playerId];
    delete this.gameState.social.relationPoints[playerId];
    return { success: true, message: '已删除仙友' };
  }

  interact(playerId, type) {
    if (!INTERACTION_TYPES.includes(type)) {
      return { success: false, message: '无效互动类型' };
    }
    if (!this.gameState.social.friends[playerId]) {
      return { success: false, message: '不是仙友' };
    }
    const points = type === '送礼' ? 10 : type === '切磋' ? 5 : 3;
    this.gameState.social.relationPoints[playerId] += points;
    this._updateRelationLevel(playerId);
    return { success: true, points, newLevel: this.gameState.social.friends[playerId].level };
  }

  _updateRelationLevel(playerId) {
    const pts = this.gameState.social.relationPoints[playerId];
    let level = '陌生人';
    if (pts >= 100) level = '道侣';
    else if (pts >= 50) level = '知己';
    else if (pts >= 20) level = '仙友';
    else if (pts >= 5) level = '初识';
    this.gameState.social.friends[playerId].level = level;
  }

  sendGift(playerId, amount) {
    if (!this.gameState.social.friends[playerId]) {
      return { success: false, message: '不是仙友' };
    }
    const player = this.gameState.player;
    if ((player.spiritStones || 0) < amount) {
      return { success: false, message: '灵石不足' };
    }
    player.spiritStones -= amount;
    this.gameState.social.relationPoints[playerId] += Math.floor(amount / 100);
    this.gameState.social.giftHistory.push({ from: player.id || player.name, to: playerId, amount, timestamp: Date.now() });
    this._updateRelationLevel(playerId);
    return { success: true, message: `赠送${amount}灵石` };
  }

  getFriends() {
    return {
      success: true,
      friends: Object.entries(this.gameState.social.friends).map(([id, data]) => ({
        id, name: data.name, level: data.level, relationPoints: this.gameState.social.relationPoints[id] || 0
      }))
    };
  }

  getChatHistory(limit = 50) {
    return { success: true, history: this.gameState.social.chatHistory.slice(-limit) };
  }
}

export const IMMORTAL_CHAT_TOOLS = [
  { name: 'friend.add', description: '添加仙友', params: ['playerId', 'name'] },
  { name: 'friend.remove', description: '删除仙友', params: ['playerId'] },
  { name: 'friend.interact', description: '仙友互动', params: ['playerId', 'type'] },
  { name: 'friend.gift', description: '赠送灵石', params: ['playerId', 'amount'] },
  { name: 'friend.list', description: '仙友列表', params: [] },
  { name: 'friend.history', description: '聊天历史', params: ['limit'] }
];