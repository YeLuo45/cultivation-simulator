/**
 * SectModule - 宗门模块导出
 * Aggregates all sect-related entities, services, and types
 */

// Entities
export { createSect, SECT_CONFIG, getSectOverview, getSectResources, calculateSectIncome, getSectBuildings, serializeSect, canUpgradeSect } from './entities/Sect.js';
export { 
    createDisciple, 
    NPC_ROLES, 
    NPC_PERSONALITIES, 
    NPC_GIFTS, 
    NPC_SKILL_CRYSTALS, 
    NPC_MEMORY_LAYERS, 
    initNpcMemory,
    getDiscipleInfo, 
    getPersonalityInfo, 
    getNpcRoleIcon, 
    getNpcRoleTitle, 
    recordNpcMemory, 
    checkNpcSkillCrystallization, 
    checkNpcEvolution, 
    npcAutonomousDecision, 
    getNpcMemoryDisplay 
} from './entities/Disciple.js';

// Services
export {
    createNewSect,
    addDisciple,
    recruitDisciple,
    weightedRandom,
    trainDisciple,
    dispatchDiscipleToPalace,
    recallDiscipleFromPalace,
    selectDiscipleForDispatch,
    selectDiscipleForRecall,
    collectSectResources,
    buildBuilding,
    upgradeSect,
    assignElder,
    removeElder,
    disbandSect,
    processNpcAutonomousLoop,
    processSectRandomEvent,
    modifyAffection,
    getMasterBonus,
    addItemToInventory
} from './services/SectService.js';

// Sect configuration
export { SECT_CONFIG as SECT_CONFIG_CONSTANTS } from './entities/Sect.js';

export default {
    entities: {
        Sect: { createSect, SECT_CONFIG, getSectOverview, getSectResources, calculateSectIncome, getSectBuildings, serializeSect, canUpgradeSect },
        Disciple: { 
            createDisciple, 
            NPC_ROLES, 
            NPC_PERSONALITIES, 
            NPC_GIFTS, 
            NPC_SKILL_CRYSTALS, 
            NPC_MEMORY_LAYERS, 
            initNpcMemory,
            getDiscipleInfo, 
            getPersonalityInfo, 
            getNpcRoleIcon, 
            getNpcRoleTitle, 
            recordNpcMemory, 
            checkNpcSkillCrystallization, 
            checkNpcEvolution, 
            npcAutonomousDecision, 
            getNpcMemoryDisplay 
        }
    },
    services: {
        SectService: {
            createNewSect,
            addDisciple,
            recruitDisciple,
            weightedRandom,
            trainDisciple,
            dispatchDiscipleToPalace,
            recallDiscipleFromPalace,
            selectDiscipleForDispatch,
            selectDiscipleForRecall,
            collectSectResources,
            buildBuilding,
            upgradeSect,
            assignElder,
            removeElder,
            disbandSect,
            processNpcAutonomousLoop,
            processSectRandomEvent,
            modifyAffection,
            getMasterBonus,
            addItemToInventory
        }
    }
};