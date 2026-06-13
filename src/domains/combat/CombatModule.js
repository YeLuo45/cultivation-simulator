/**
 * CombatModule - 战斗模块导出
 * Aggregates all combat-related entities, services, and types
 */

// Entities
export { combatState, combatEnergy, createCombatState, serializeCombatState, restoreCombatState, resetCombatState } from './entities/CombatState.js';
export { ACTION_TYPES, ACTION_RESULT_TYPES, STATUS_EFFECTS, createCombatLogEntry, createActionRecord, ACTION_METADATA } from './entities/Action.js';

// Services
export { 
    initCombat,
    generateOpponent,
    startCombatChallenge,
    executePlayerAttack,
    executePlayerDefend,
    executePlayerEscape,
    executeOpponentTurn,
    endCombat,
    addEnergy,
    getItemCount,
    selectCombatAction
} from './services/CombatService.js';

export {
    mcpBattleArenaList,
    mcpBattleArenaJoin,
    mcpBattleArenaReport,
    mcpBattleCombatLog,
    mcpBattleRankRise,
    mcpBattleRewardClaim,
    getPlayerRankInfo,
    updatePlayerRank,
    getRealmDivision,
    getDailyChallenges,
    generateAIOpponents,
    getRankNameFromRating,
    getOpponentAvatar,
    startRankingPVP,
    calculatePlayerPVPower,
    calculateOpponentPower,
    simulatePVPRound,
    calculateRatingChange
} from './services/CombatAIService.js';

// Combat constants
export const COMBAT_CONFIG = {
    ENERGY_PER_ATTACK: 20,
    COUNTER_ENERGY_COST: 50,
    COUNTER_ENERGY_THRESHOLD: 100,
    CRIT_BASE_RATE: 0.1,
    CRIT_BONUS: 1.5,
    DEFENSE_REDUCTION: 0.5,
    TECHNIQUE_BONUS_MULTIPLIER: 1.5,
    TECHNIQUE_PENALTY_MULTIPLIER: 0.7
};

export default {
    entities: {
        CombatState: { combatState, combatEnergy, createCombatState, serializeCombatState, restoreCombatState, resetCombatState },
        Action: { ACTION_TYPES, ACTION_RESULT_TYPES, STATUS_EFFECTS, createCombatLogEntry, createActionRecord, ACTION_METADATA }
    },
    services: {
        CombatService: {
            initCombat,
            generateOpponent,
            startCombatChallenge,
            executePlayerAttack,
            executePlayerDefend,
            executePlayerEscape,
            executeOpponentTurn,
            endCombat,
            addEnergy,
            getItemCount,
            selectCombatAction
        },
        CombatAIService: {
            mcpBattleArenaList,
            mcpBattleArenaJoin,
            mcpBattleArenaReport,
            mcpBattleCombatLog,
            mcpBattleRankRise,
            mcpBattleRewardClaim,
            getPlayerRankInfo,
            updatePlayerRank,
            getRealmDivision,
            getDailyChallenges,
            generateAIOpponents,
            getRankNameFromRating,
            getOpponentAvatar,
            startRankingPVP,
            calculatePlayerPVPower,
            calculateOpponentPower,
            simulatePVPRound,
            calculateRatingChange
        }
    },
    config: COMBAT_CONFIG
};