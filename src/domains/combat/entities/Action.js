/**
 * Action Entity - 战斗动作实体
 * Defines action types and related combat action data structures
 */

/**
 * Action types available in combat
 */
const ACTION_TYPES = {
    ATTACK: 'attack',
    DEFEND: 'defend',
    ESCAPE: 'escape',
    TREASURE: 'treasure',
    PILL: 'pill',
    TECHNIQUE: 'technique',
    ULTIMATE: 'ultimate'
};

/**
 * Result types for combat actions
 */
const ACTION_RESULT_TYPES = {
    DAMAGE: 'damage',
    CRITICAL: 'critical',
    MISS: 'miss',
    HEAL: 'heal',
    BUFF: 'buff',
    DEBUFF: 'debuff',
    COUNTER: 'counter',
    STATUS_EFFECT: 'status_effect'
};

/**
 * Status effect types that can be applied during combat
 */
const STATUS_EFFECTS = {
    BURNING: 'burning',
    FROZEN: 'frozen',
    STUNNED: 'stunned',
    POISONED: 'poisoned',
    BLEEDING: 'bleeding'
};

/**
 * Create a combat log entry
 */
function createCombatLogEntry(type, text, round, actionType = null) {
    return {
        type,       // 'system' | 'player-action' | 'opponent-action'
        actionType, // 'damage' | 'heal' | 'critical' etc.
        text,
        round,
        timestamp: Date.now()
    };
}

/**
 * Create an action record for history tracking
 */
function createActionRecord(actor, actionType, target, result, damage = 0) {
    return {
        actor,       // 'player' | 'opponent'
        actionType,  // attack | defend | escape | ultimate
        target,      // 'player' | 'opponent'
        result,      // 'hit' | 'miss' | 'dodge' | 'counter' | 'critical'
        damage,
        timestamp: Date.now()
    };
}

/**
 * Action metadata for UI display
 */
const ACTION_METADATA = {
    attack: {
        label: '攻击',
        icon: '⚔️',
        description: '普通攻击，造成基础伤害'
    },
    defend: {
        label: '防御',
        icon: '🛡️',
        description: '减少受到的伤害，积蓄反击能量'
    },
    escape: {
        label: '逃跑',
        icon: '🏃',
        description: '尝试脱离战斗，可能损失灵石'
    },
    treasure: {
        label: '法宝',
        icon: '🔮',
        description: '使用背包中的战斗法宝'
    },
    pill: {
        label: '丹药',
        icon: '💊',
        description: '使用战斗丹药'
    },
    technique: {
        label: '功法',
        icon: '📜',
        description: '查看功法克制信息'
    },
    ultimate: {
        label: '绝技',
        icon: '⚡',
        description: '释放终极技能（消耗能量）'
    }
};

export {
    ACTION_TYPES,
    ACTION_RESULT_TYPES,
    STATUS_EFFECTS,
    createCombatLogEntry,
    createActionRecord,
    ACTION_METADATA
};