/**
 * CombatState Entity - 战斗状态实体
 * Stores all state related to an active combat encounter
 */

// Combat state global (shared with combat.js module)
let combatState = {
    inProgress: false,
    round: 0,
    turn: 'player', // 'player' | 'opponent'
    player: {
        name: '你',
        avatar: '🧑‍🎓',
        realm: 0,
        realmName: '炼气期',
        maxHP: 500,
        hp: 500,
        attack: 80,
        defense: 40,
        speed: 80,
        technique: '青云诀',
        techniqueColor: '#00ff88',
        weapon: null,
        weaponData: null,
        armor: null,
        armorData: null,
        critRate: 0.1,
        setBonuses: {},
        skills: [],
        accessories: [],
        counterEnergy: 0,
        inDefenseStance: false,
        skillLevels: {}
    },
    opponent: null,
    log: [],
    effects: {
        player: {
            defending: false,
            attackBoost: 0,
            defenseBoost: 0,
            ignoreDefense: false,
            burning: 0,
            frozen: 0,
            defenseBoostObj: 0,
            critBoostNext: 0,
            healRate: 0,
            damageReduction: 0,
            counterRate: 0,
            speedReduce: 0,
            armorBroken: false,
            fireResist: 0,
            fireDrain: 0,
            reflect: 0,
            maxHpBoost: 0,
            cleanseStacks: 0,
            invincible: 0,
            thunderBonus: 0,
            doubleHit: 0,
            pierce: 0,
            cleave: 0,
            freezeAura: 0,
            burnAura: 0,
            curse: 0
        },
        opponent: {
            defending: false,
            attackBoost: 0,
            defenseBoost: 0,
            burning: 0,
            frozen: 0,
            speedReduce: 0,
            armorBroken: false,
            curse: 0
        }
    }
};

// Combat energy (for ultimate skills)
let combatEnergy = 0;

/**
 * Create a fresh CombatState for a new battle
 */
function createCombatState() {
    return {
        inProgress: false,
        round: 0,
        turn: 'player',
        player: {
            name: '你',
            avatar: '🧑‍🎓',
            realm: 0,
            realmName: '炼气期',
            maxHP: 500,
            hp: 500,
            attack: 80,
            defense: 40,
            speed: 80,
            technique: '青云诀',
            techniqueColor: '#00ff88',
            weapon: null,
            weaponData: null,
            armor: null,
            armorData: null,
            critRate: 0.1,
            setBonuses: {},
            skills: [],
            accessories: [],
            counterEnergy: 0,
            inDefenseStance: false,
            skillLevels: {},
            attackPercent: 1.0,
            critBonus: 0,
            defensePercent: 1.0,
            qiRegenBonus: 0
        },
        opponent: null,
        log: [],
        effects: {
            player: {
                defending: false,
                attackBoost: 0,
                defenseBoost: 0,
                ignoreDefense: false,
                burning: 0,
                frozen: 0
            },
            opponent: {
                defending: false,
                attackBoost: 0,
                defenseBoost: 0,
                burning: 0,
                frozen: 0
            }
        }
    };
}

/**
 * Serialize combat state for saving
 */
function serializeCombatState() {
    return JSON.parse(JSON.stringify(combatState));
}

/**
 * Restore combat state from save
 */
function restoreCombatState(saved) {
    if (saved) {
        combatState = saved;
    }
}

/**
 * Reset combat state to initial values
 */
function resetCombatState() {
    combatState = createCombatState();
    combatEnergy = 0;
}

export function setCombatState(newState) {
    combatState = newState;
}

export function setCombatEnergy(value) {
    combatEnergy = value;
}

export {
    combatState,
    combatEnergy,
    createCombatState,
    serializeCombatState,
    restoreCombatState,
    resetCombatState
};