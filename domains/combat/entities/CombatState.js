// domains/combat/entities/CombatState.js
// Combat State entity - Phase 4 DDD refactoring

/**
 * CombatState entity - represents the state of a combat encounter
 * This is a simple data structure holder, logic goes in CombatService
 */
export class CombatState {
  constructor() {
    this.inProgress = false;
    this.player = null;
    this.opponent = null;
    this.round = 0;
    this.turn = 'player';
    this.playerAction = null;
    this.playerSubAction = null;
    this.log = [];
    this.effects = {
      player: {
        attacking: false,
        defending: false,
        attackBoost: 0,
        defenseBoost: 0,
        ignoreDefense: false,
        burning: 0,
        frozen: 0,
        manaDrain: 0
      },
      opponent: {
        attacking: false,
        defending: false,
        attackBoost: 0,
        defenseBoost: 0,
        burning: 0,
        frozen: 0
      }
    };
    this.battleRecord = [];
  }

  /**
   * Create initial combat state
   */
  static createInitial() {
    return new CombatState();
  }
}

export default CombatState;
