/**
 * TournamentService.js - 仙道大会+竞技赛事
 * V261: 仙道大会+竞技赛事
 */

export const TOURNAMENT_TIERS = { 凡: 1, 灵: 2, 仙: 3, 神: 4, 天: 5 };
export const MATCH_RESULT = { WIN: 'win', LOSE: 'lose', DRAW: 'draw' };

let _instance = null;

export function createTournamentService(gameState) {
  if (_instance) return _instance;
  _instance = new TournamentService(gameState);
  return _instance;
}

class TournamentService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.tournaments) {
      this.gameState.tournaments = {
        history: [],
        registered: {},
        currentSeason: 1,
        rankings: {}
      };
    }
  }

  /**
   * 报名参赛
   */
  register(tier = '凡') {
    if (!TOURNAMENT_TIERS[tier]) return { success: false, message: '无效级别' };

    const playerId = this.gameState.player.id || this.gameState.player.name;
    if (this.gameState.tournaments.registered[playerId]) {
      return { success: false, message: '已报名' };
    }

    const entryFee = TOURNAMENT_TIERS[tier] * 500;
    const player = this.gameState.player;
    if ((player.spiritStones || 0) < entryFee) {
      return { success: false, message: '灵石不足' };
    }

    player.spiritStones -= entryFee;
    const matchId = `match_${Date.now()}`;

    this.gameState.tournaments.registered[playerId] = {
      tier,
      matchId,
      registeredAt: Date.now(),
      wins: 0,
      losses: 0,
      draws: 0
    };

    return { success: true, message: `报名${tier}级仙道大会`, entryFee, matchId };
  }

  /**
   * 开始匹配
   */
  startMatch() {
    const playerId = this.gameState.player.id || this.gameState.player.name;
    const reg = this.gameState.tournaments.registered[playerId];
    if (!reg) return { success: false, message: '未报名' };

    const playerPower = (this.gameState.player.attack || 0) + (this.gameState.player.defense || 0) + (this.gameState.player.cultivationLevel || 1) * 100;
    const enemyPower = Math.floor(playerPower * (0.8 + Math.random() * 0.4));

    const playerScore = playerPower + Math.random() * 100;
    const enemyScore = enemyPower + Math.random() * 100;

    let result, rewards;
    if (playerScore > enemyScore * 1.1) {
      result = MATCH_RESULT.WIN;
      const tierMult = TOURNAMENT_TIERS[reg.tier];
      rewards = { exp: 1000 * tierMult, spiritStones: 500 * tierMult, fame: 10 * tierMult };
    } else if (playerScore < enemyScore * 0.9) {
      result = MATCH_RESULT.LOSE;
      rewards = { exp: 100, spiritStones: 50 };
    } else {
      result = MATCH_RESULT.DRAW;
      rewards = { exp: 300, spiritStones: 150, fame: 2 };
    }

    if (result === MATCH_RESULT.WIN) reg.wins++;
    else if (result === MATCH_RESULT.LOSE) reg.losses++;
    else reg.draws++;

    const player = this.gameState.player;
    player.exp = (player.exp || 0) + rewards.exp;
    player.spiritStones = (player.spiritStones || 0) + rewards.spiritStones;
    if (rewards.fame) {
      player.fame = (player.fame || 0) + rewards.fame;
    }

    this.gameState.tournaments.history.push({
      playerId, tier: reg.tier, result, enemyPower, playerPower,
      rewards, timestamp: Date.now()
    });

    return { success: true, result, enemyPower, playerPower, rewards };
  }

  /**
   * 取消报名
   */
  unregister() {
    const playerId = this.gameState.player.id || this.gameState.player.name;
    if (!this.gameState.tournaments.registered[playerId]) {
      return { success: false, message: '未报名' };
    }
    delete this.gameState.tournaments.registered[playerId];
    return { success: true, message: '已取消报名' };
  }

  /**
   * 获取排名
   */
  getRankings(tier = '凡') {
    const history = this.gameState.tournaments.history;
    const scores = {};

    for (const h of history) {
      if (h.tier !== tier) continue;
      if (!scores[h.playerId]) scores[h.playerId] = { wins: 0, losses: 0, draws: 0, score: 0 };
      const s = scores[h.playerId];
      if (h.result === MATCH_RESULT.WIN) { s.wins++; s.score += 3; }
      else if (h.result === MATCH_RESULT.LOSE) { s.losses++; }
      else { s.draws++; s.score += 1; }
    }

    const rankings = Object.entries(scores)
      .map(([playerId, data]) => ({ playerId, ...data }))
      .sort((a, b) => b.score - a.score);

    return { success: true, tier, rankings };
  }

  /**
   * 获取赛事历史
   */
  getHistory(limit = 20) {
    return {
      success: true,
      history: this.gameState.tournaments.history.slice(-limit)
    };
  }
}

export const TOURNAMENT_TOOLS = [
  { name: 'tournament.register', description: '报名参赛', params: ['tier'] },
  { name: 'tournament.match', description: '开始匹配', params: [] },
  { name: 'tournament.unregister', description: '取消报名', params: [] },
  { name: 'tournament.rankings', description: '排行榜', params: ['tier'] },
  { name: 'tournament.history', description: '赛事历史', params: ['limit'] }
];