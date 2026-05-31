/**
 * ReputationService.js + LeaderboardService.js
 * V252: 仙界声望+排行榜系统
 */

// ===== 声望服务 =====

export const REP_LEVELS = {
  0: { name: '无名之辈', minRep: 0 },
  1: { name: '凡人', minRep: 100 },
  2: { name: '修士', minRep: 500 },
  3: { name: '真人', minRep: 2000 },
  4: { name: '地仙', minRep: 5000 },
  5: { name: '天仙', minRep: 15000 },
  6: { name: '金仙', minRep: 50000 },
  7: { name: '大罗金仙', minRep: 200000 },
  8: { name: '仙君', minRep: 1000000 },
  9: { name: '仙帝', minRep: 10000000 }
};

export const RANKING_TYPES = ['totalPower', 'beastPower', 'sectPower', 'spiritStone', 'level'];

let _repInstance = null;
let _lbInstance = null;

export function createReputationService(gameState) {
  if (_repInstance) return _repInstance;
  _repInstance = new ReputationService(gameState);
  return _repInstance;
}

export function createLeaderboardService(gameState) {
  if (_lbInstance) return _lbInstance;
  _lbInstance = new LeaderboardService(gameState);
  return _lbInstance;
}

class ReputationService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensureData();
  }

  _ensureData() {
    if (!this.gameState.reputation) {
      this.gameState.reputation = { score: 0, history: [] };
    }
  }

  gainReputation(amount, source = 'misc') {
    if (amount <= 0) return { success: false, message: '声望必须为正数' };
    this.gameState.reputation.score += amount;
    this.gameState.reputation.history.push({ amount, source, timestamp: Date.now() });
    return { success: true, newRep: this.gameState.reputation.score, level: this.getReputationLevel() };
  }

  loseReputation(amount, source = 'misc') {
    if (amount <= 0) return { success: false, message: '声望必须为正数' };
    this.gameState.reputation.score = Math.max(0, this.gameState.reputation.score - amount);
    this.gameState.reputation.history.push({ amount: -amount, source, timestamp: Date.now() });
    return { success: true, newRep: this.gameState.reputation.score, level: this.getReputationLevel() };
  }

  getReputationLevel() {
    let level = 0;
    for (let i = 9; i >= 0; i--) {
      if (this.gameState.reputation.score >= (REP_LEVELS[i]?.minRep || 0)) {
        level = i;
        break;
      }
    }
    return level;
  }

  getReputationInfo() {
    const level = this.getReputationLevel();
    const nextLevel = Math.min(level + 1, 9);
    const current = REP_LEVELS[level];
    const next = REP_LEVELS[nextLevel];
    return {
      success: true,
      level,
      name: current.name,
      score: this.gameState.reputation.score,
      nextLevelName: next?.name,
      progress: next ? (this.gameState.reputation.score - current.minRep) / (next.minRep - current.minRep) : 1
    };
  }
}

class LeaderboardService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensureData();
  }

  _ensureData() {
    if (!this.gameState.rankings) {
      this.gameState.rankings = { totalPower: [], beastPower: [], sectPower: [], spiritStone: [], level: [], lastSeasonReset: Date.now() };
    }
    if (!this.gameState.rankings.totalPower) {
      this.gameState.rankings = { totalPower: [], beastPower: [], sectPower: [], spiritStone: [], level: [], lastSeasonReset: Date.now() };
    }
  }

  updateRanking(type, value) {
    if (!RANKING_TYPES.includes(type)) return { success: false, message: '未知榜单类型' };
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    const playerId = player.id || player.name;
    const arr = this.gameState.rankings[type];
    const existing = arr.findIndex(e => e.playerId === playerId);

    if (existing >= 0) {
      arr[existing].value = value;
    } else {
      arr.push({ playerId, name: player.name, value, updatedAt: Date.now() });
    }

    arr.sort((a, b) => b.value - a.value);
    const rank = arr.findIndex(e => e.playerId === playerId) + 1;

    return { success: true, type, rank, value };
  }

  getRankings(type, limit = 100) {
    if (!RANKING_TYPES.includes(type)) return { success: false, message: '未知榜单类型' };
    return {
      success: true,
      type,
      rankings: this.gameState.rankings[type].slice(0, limit)
    };
  }

  getMyRank(type) {
    if (!RANKING_TYPES.includes(type)) return { success: false, message: '未知榜单类型' };
    const player = this.gameState.player;
    const playerId = player?.id || player?.name;
    const arr = this.gameState.rankings[type];
    const rank = arr.findIndex(e => e.playerId === playerId) + 1;
    return { success: true, type, rank: rank || null, total: arr.length };
  }

  getTopPlayers(type, count = 10) {
    const result = this.getRankings(type, count);
    if (!result.success) return result;
    return {
      success: true,
      type,
      top: result.rankings.slice(0, count)
    };
  }

  seasonReset() {
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    if (now - this.gameState.rankings.lastSeasonReset < oneMonth) {
      return { success: false, message: '赛季重置冷却中' };
    }
    for (const type of RANKING_TYPES) {
      this.gameState.rankings[type] = [];
    }
    this.gameState.rankings.lastSeasonReset = now;
    return { success: true, message: '赛季已重置' };
  }
}

export const REPUTATION_TOOLS = [
  { name: 'rep.gain', description: '增加声望', params: ['amount', 'source'] },
  { name: 'rep.lose', description: '减少声望', params: ['amount', 'source'] },
  { name: 'rep.info', description: '声望信息', params: [] },
  { name: 'rank.get', description: '获取排名', params: ['type'] },
  { name: 'rank.my', description: '我的排名', params: ['type'] },
  { name: 'rank.top', description: '顶尖玩家', params: ['type', 'count'] }
];