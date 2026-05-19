// domains/ranking/services/RankingService.js
// Ranking domain service - Phase 4 DDD refactoring

import { RANK_CONFIG } from '../../shared/constants/combat.js';

/**
 * RankingService - handles ranking, PVP and ladder logic
 */
export class RankingService {
  constructor() {
    this.PVP_K = 32; // Rating coefficient
  }

  /**
   * Get player rank info
   */
  getRankInfo(gameState) {
    const pvp = gameState.rankingPVP;
    const division = RANK_CONFIG[pvp.realmDivision];
    let rankIndex = 0;
    for (let i = 0; i < division.ranks.length; i++) {
      if (pvp.rating >= division.ranks[i].minRating) {
        rankIndex = i;
      }
    }
    return {
      ...division.ranks[rankIndex],
      division: division,
      rankIndex: rankIndex,
      nextRank: division.ranks[rankIndex + 1] || null,
      rating: pvp.rating,
      wins: pvp.wins,
      losses: pvp.losses,
      streak: pvp.currentStreak
    };
  }

  /**
   * Update player rank based on current rating
   */
  updateRank(gameState) {
    const pvp = gameState.rankingPVP;
    const division = RANK_CONFIG[pvp.realmDivision];
    let rankIndex = 0;
    for (let i = 0; i < division.ranks.length; i++) {
      if (pvp.rating >= division.ranks[i].minRating) {
        rankIndex = i;
      }
    }
    pvp.rank = division.ranks[rankIndex].name;
    pvp.rankLevel = rankIndex;
    return pvp.rank;
  }

  /**
   * Get realm division based on player realm
   */
  getDivision(realm) {
    if (realm <= 1) return 'human';
    if (realm <= 3) return 'cultivation';
    return 'immortal';
  }

  /**
   * Get daily challenges available
   */
  getDailyChallenges(gameState) {
    const pvp = gameState.rankingPVP;
    if (pvp.lastChallengeDay < gameState.days) {
      pvp.dailyChallenges = 3;
      pvp.lastChallengeDay = gameState.days;
    }
    return pvp.dailyChallenges;
  }

  /**
   * Start a ranking PVP match
   */
  startPVP(gameState, opponentId, opponentRating, generateAIOpponentsFn) {
    const pvp = gameState.rankingPVP;

    if (pvp.dailyChallenges <= 0) {
      return { success: false, error: '今日挑战次数已用完' };
    }

    pvp.dailyChallenges--;

    // Calculate battle result
    const playerPower = this.calculatePlayerPower(gameState);
    const opponentPower = this.calculateOpponentPower(opponentRating);

    // Simulate battle
    const playerWins = this.simulateRound(playerPower, opponentPower);

    // Calculate rating change
    const ratingChange = this.calculateRatingChange(pvp.rating, opponentRating, playerWins);

    // Update state
    pvp.rating = Math.max(800, Math.min(2600, pvp.rating + ratingChange));
    this.updateRank(gameState);

    if (playerWins) {
      pvp.wins++;
      pvp.currentStreak = Math.max(0, pvp.currentStreak) + 1;
      if (pvp.currentStreak > pvp.bestStreak) {
        pvp.bestStreak = pvp.currentStreak;
      }
    } else {
      pvp.losses++;
      pvp.currentStreak = Math.min(0, pvp.currentStreak) - 1;
    }

    // Get opponent info
    const opponents = generateAIOpponentsFn(pvp.realmDivision, 8);
    const opponent = opponents.find(o => o.id === opponentId) || opponents[0];

    // Record battle history
    pvp.battleHistory = pvp.battleHistory || [];
    pvp.battleHistory.unshift({
      day: gameState.days,
      opponentName: opponent.name,
      opponentRank: opponent.rank,
      opponentRating: opponentRating,
      result: playerWins ? 'win' : 'lose',
      ratingChange: Math.abs(ratingChange),
      ratingAfter: pvp.rating
    });

    if (pvp.battleHistory.length > 50) {
      pvp.battleHistory = pvp.battleHistory.slice(0, 50);
    }

    return {
      success: true,
      playerWins,
      opponent,
      ratingChange,
      newRating: pvp.rating
    };
  }

  /**
   * Calculate player PVP power
   */
  calculatePlayerPower(gameState) {
    const gs = gameState;
    const basePower = gs.realm * 500 + gs.stage * 100 + gs.cultivationProgress;
    const attackBonus = (gs.activeEffects.attack || 0) * 10;
    const defenseBonus = (gs.activeEffects.defense || 0) * 10;

    // Equipment bonus
    let equipmentBonus = 0;
    for (const equip of gs.equippedTreasures) {
      if (equip && equip.effect) {
        equipmentBonus += (equip.effect.attack || 0) * 5;
        equipmentBonus += (equip.effect.defense || 0) * 5;
      }
    }

    // Pet bonus
    let petBonus = 0;
    if (gs.summonedPet) {
      petBonus = 100;
    }

    return basePower + attackBonus + defenseBonus + equipmentBonus + petBonus;
  }

  /**
   * Calculate opponent power from rating
   */
  calculateOpponentPower(rating) {
    return rating * 0.8 + Math.random() * 200;
  }

  /**
   * Simulate a PVP round
   */
  simulateRound(playerPower, opponentPower) {
    const powerRatio = playerPower / opponentPower;
    const winChance = Math.min(0.9, Math.max(0.1, 0.5 + (powerRatio - 1) * 0.2));
    return Math.random() < winChance;
  }

  /**
   * Calculate rating change using Elo formula
   */
  calculateRatingChange(playerRating, opponentRating, playerWins) {
    const K = this.PVP_K;
    const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actual = playerWins ? 1 : 0;
    const change = Math.round(K * (actual - expected));

    // Victory minimum +10, defeat maximum -5
    if (playerWins && change < 10) return 10;
    if (!playerWins && change > -5) return -5;

    return change;
  }

  /**
   * Get rank name from rating and division
   */
  getRankName(rating, division) {
    const ranks = RANK_CONFIG[division].ranks;
    let rankName = ranks[0].name;
    for (const rank of ranks) {
      if (rating >= rank.minRating) {
        rankName = rank.name;
      }
    }
    return rankName;
  }
}

export const rankingService = new RankingService();
export default rankingService;
