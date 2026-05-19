// domains/combat/entities/Action.js
// Combat Action entity - Phase 4 DDD refactoring

/**
 * CombatAction types
 */
export const ACTION_TYPES = {
  ATTACK: 'attack',
  DEFEND: 'defend',
  ESCAPE: 'escape',
  ULTIMATE: 'ultimate',
  TREASURE: 'treasure',
  PILL: 'pill',
  HEAL: 'heal'
};

/**
 * CombatAction entity - represents a combat action
 */
export class Action {
  constructor(type, data = {}) {
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
  }

  static attack() {
    return new Action(ACTION_TYPES.ATTACK);
  }

  static defend() {
    return new Action(ACTION_TYPES.DEFEND);
  }

  static escape() {
    return new Action(ACTION_TYPES.ESCAPE);
  }

  static ultimate(skill) {
    return new Action(ACTION_TYPES.ULTIMATE, { skill });
  }

  static treasure(name) {
    return new Action(ACTION_TYPES.TREASURE, { name });
  }

  static pill(name) {
    return new Action(ACTION_TYPES.PILL, { name });
  }
}

export default Action;
