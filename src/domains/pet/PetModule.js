/**
 * PetModule - 宠物模块导出
 * 整合宠物系统的所有功能
 */

import { Pet } from './entities/Pet.js';
import { PetService } from './services/PetService.js';
import { PetEvolveService } from './services/PetEvolveService.js';

// 宠物状态初始化
const PET_STATE_INITIALIZERS = {
    V78: '_initPetState',
    V85: '_initPetState',
    V132: '_initPetState',
    V171: '_initPetStateV4',
    V181: '_initPetStateV5',
    V191: '_initPetStateV6',
};

// 宠物配置版本
const PET_CONFIGS = {
    V78: { maxPets: 5, evolveCostBase: 250, evolveCostMultiplier: 1.0 },
    V85: { maxPets: 10, petSlots: 3, evolveCostBase: 500, evolveCostMultiplier: 1.2 },
    V132: { maxPets: 8, captureCost: 200, evolveCostBase: 400, evolveCostMultiplier: 1.3 },
    V171: { maxPets: 5, petSlots: 1, evolveCostBase: 500, evolveCostMultiplier: 1.0 },
    V181: { maxPets: 10, petSlots: 3, evolveCostBase: 500, evolveCostMultiplier: 1.5 },
    V191: { maxPets: 15, petSlots: 5, evolveCostBase: 800, evolveCostMultiplier: 1.8 },
};

// 导出的API列表
const PET_API_METHODS = [
    'mcpPetList',
    'mcpPetFeed',
    'mcpPetEvolve',
    'mcpPetSkill',
    'mcpPetCapture',
    'mcpPetRelease',
    'mcpPetStats',
    'mcpEvolvePrepare',
    'mcpEvolveStart',
    'mcpEvolveComplete',
    'mcpPetListV85',
    'mcpPetFeedV85',
    'mcpPetEvolveV85',
    'mcpPetReleaseV85',
    'mcpPetEquipV4',
    'mcpPetEvolveV4',
    'mcpPetEquipV5',
    'mcpPetEvolveV5',
    'mcpPetEquipV6',
    'mcpPetEvolveV6',
];

// 导出所有宠物模块内容
export default {
    // 实体
    Pet,
    
    // 服务
    PetService,
    PetEvolveService,
    
    // 配置
    PET_STATE_INITIALIZERS,
    PET_CONFIGS,
    
    // API方法列表
    PET_API_METHODS,
    
    // 模块信息
    moduleName: 'pet',
    moduleVersion: 'V191',
    moduleDescription: '宠物系统 - 包含灵宠捕捉、培养、进化、探险等功能',
};