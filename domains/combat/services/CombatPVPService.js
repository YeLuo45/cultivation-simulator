// domains/combat/services/CombatPVPService.js
// Combat PVP Service - Phase 4 DDD refactoring

/**
 * CombatPVPService - handles PVP combat logic
 * Note: Most PVP logic is in RankingService. This service handles
 * the combat simulation aspects of PVP.
 */
export class CombatPVPService {
  constructor() {
    this.K = 32; // Rating change coefficient
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
   * Simulate a PVP round (determines who wins)
   */
  simulateRound(playerPower, opponentPower) {
    const powerRatio = playerPower / opponentPower;
    const winChance = Math.min(0.9, Math.max(0.1, 0.5 + (powerRatio - 1) * 0.2));
    return Math.random() < winChance;
  }

  /**
   * Calculate rating change after PVP
   */
  calculateRatingChange(playerRating, opponentRating, playerWins) {
    const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actual = playerWins ? 1 : 0;
    const change = Math.round(this.K * (actual - expected));

    // Victory minimum +10, defeat maximum -30
    if (playerWins && change < 10) return 10;
    if (!playerWins && change > -5) return -5;

    return change;
  }
}

export const combatPVPService = new CombatPVPService();
export default combatPVPService;
