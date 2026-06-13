/**
 * PetEvolveService - 灵宠进化服务
 * 处理宠物进化相关的业务逻辑
 */

// 进化阶段常量
const EVOLUTION_STAGES = {
    INFANT: 1,     // 幼生期
    JUVENILE: 2,   // 幼年期
    MATURE: 3,     // 成熟期
    ANCIENT: 4,    // 远古期
    DIVINE: 5,     // 神化期
};

// 进化形态
const EVOLUTION_FORMS = {
    CHILD: 'child',     // 幼体
    YOUNG: 'young',     // 青年
    ADULT: 'adult',     // 成体
    ELDER: 'elder',     // 老年
    DIVINE: 'divine',   // 神体
    MUTANT: 'mutant',   // 变异体
};

// 进化消耗配置
const EVOLVE_COST_CONFIG = {
    base: 500,
    multiplier: 1.5,
    stageMultipliers: {
        1: 1.0,   // 幼生期进化
        2: 1.5,   // 幼年期进化
        3: 2.0,   // 成熟期进化
        4: 3.0,   // 远古期进化
    }
};

// 进化所需亲密度
const EVOLVE_INTIMACY_REQUIREMENTS = {
    2: 20,   // 进化到幼年需要20亲密度
    3: 40,   // 进化到成熟需要40亲密度
    4: 60,   // 进化到远古需要60亲密度
    5: 80,   // 进化到神化需要80亲密度
};

// 进化属性提升倍率
const EVOLVE_STATS_MULTIPLIER = {
    attack: 1.3,
    defense: 1.25,
    speed: 1.2,
    health: 1.15,
    spirit: 1.3,
};

// 进化所需等级
const EVOLVE_LEVEL_REQUIREMENTS = {
    2: 5,    // 进化到幼年需要5级
    3: 10,   // 进化到成熟需要10级
    4: 20,   // 进化到远古需要20级
    5: 30,   // 进化到神化需要30级
};

// 进化时间（毫秒）
const EVOLVE_DURATION = {
    2: 60000,    // 进化到幼年 1分钟
    3: 180000,   // 进化到成熟 3分钟
    4: 300000,   // 进化到远古 5分钟
    5: 600000,   // 进化到神化 10分钟
};

// 进化成功率
const EVOLVE_SUCCESS_RATE = {
    2: 0.95,
    3: 0.85,
    4: 0.70,
    5: 0.50,
};

// 进化道具消耗
const EVOLVE_MATERIALS = {
    stage2: [{ id: 'spirit_grass', count: 5, name: '灵草' }],
    stage3: [
        { id: 'spirit_grass', count: 10, name: '灵草' },
        { id: 'evolution_stone', count: 1, name: '进化石' }
    ],
    stage4: [
        { id: 'spirit_grass', count: 20, name: '灵草' },
        { id: 'evolution_stone', count: 3, name: '进化石' },
        { id: 'soul_crystal', count: 1, name: '魂晶' }
    ],
    stage5: [
        { id: 'spirit_grass', count: 50, name: '灵草' },
        { id: 'evolution_stone', count: 10, name: '进化石' },
        { id: 'soul_crystal', count: 5, name: '魂晶' },
        { id: 'divine_essence', count: 1, name: '神元' }
    ],
};

/**
 * PetEvolveService Class
 */
class PetEvolveService {
    constructor(gameState) {
        this.gs = gameState;
    }

    /**
     * 初始化宠物状态V4 (V171)
     */
    _initPetStateV4() {
        if (!this.gs.petV4) {
            this.gs.petV4 = {
                pets: [],
                maxPets: 5,
                equippedPetId: null
            };
        }
        return this.gs.petV4;
    }

    /**
     * 初始化宠物状态V5 (V181)
     */
    _initPetStateV5() {
        if (!this.gs.petV5) {
            this.gs.petV5 = {
                pets: [],
                petSlots: 3,
                equippedPets: [],
                evolveMaterials: {}
            };
        }
        return this.gs.petV5;
    }

    /**
     * 初始化宠物状态V6 (V191)
     */
    _initPetStateV6() {
        if (!this.gs.petV6) {
            this.gs.petV6 = {
                pets: [],
                equippedPet: null,
                totalPets: 0
            };
        }
        return this.gs.petV6;
    }

    /**
     * 计算进化消耗
     * @param {number} currentStage - 当前阶段
     * @param {string} configVersion - 配置版本 V4/V5/V6
     */
    calculateEvolveCost(currentStage, configVersion = 'V5') {
        const configs = {
            V4: { base: 500, multiplier: 1.0 },
            V5: { base: 500, multiplier: 1.5 },
            V6: { base: 800, multiplier: 1.8 }
        };
        
        const config = configs[configVersion] || configs.V5;
        return Math.floor(config.base * Math.pow(config.multiplier, currentStage - 1));
    }

    /**
     * 检查宠物是否可以进化
     * @param {Object} pet - 宠物对象
     * @param {number} targetStage - 目标阶段
     */
    checkCanEvolve(pet, targetStage = null) {
        const nextStage = targetStage || (pet.evolveStage || pet.evolutionStage || 1) + 1;
        
        // 检查是否达到最高阶段
        if ((pet.evolveStage || 1) >= 4) {
            return { canEvolve: false, reason: '已达最高进化阶段' };
        }
        
        // 检查等级
        const levelRequired = EVOLVE_LEVEL_REQUIREMENTS[nextStage] || 5;
        if ((pet.level || 1) < levelRequired) {
            return { 
                canEvolve: false, 
                reason: '等级不足', 
                levelRequired, 
                currentLevel: pet.level 
            };
        }
        
        // 检查亲密度
        const intimacyRequired = EVOLVE_INTIMACY_REQUIREMENTS[nextStage] || 20;
        if ((pet.intimacy || 0) < intimacyRequired) {
            return { 
                canEvolve: false, 
                reason: '亲密度不足', 
                intimacyRequired, 
                currentIntimacy: pet.intimacy 
            };
        }
        
        // 检查灵石
        const cost = this.calculateEvolveCost(nextStage - 1, 'V6');
        if ((this.gs.spiritStones || 0) < cost) {
            return { 
                canEvolve: false, 
                reason: '灵石不足', 
                costRequired: cost, 
                currentStones: this.gs.spiritStones 
            };
        }
        
        return { canEvolve: true, nextStage, cost };
    }

    /**
     * 执行宠物进化 V4 (V171)
     */
    mcpPetEvolveV4(petId) {
        try {
            if (!petId) return { error: '请指定宠物ID' };
            
            const petV4 = this._initPetStateV4();
            const petIdx = petV4.pets.findIndex(p => p.id === petId);
            if (petIdx === -1) return { error: '宠物不存在: ' + petId };
            
            const pet = petV4.pets[petIdx];
            
            // 进化消耗500灵石
            const evolveCost = 500;
            if ((this.gs.spiritStones || 0) < evolveCost) {
                return { error: '灵石不足，进化需要 ' + evolveCost + ' 灵石' };
            }
            
            this.gs.spiritStones -= evolveCost;
            
            // 进化提升属性
            pet.level = (pet.level || 1) + 1;
            pet.evolveStage = (pet.evolveStage || 1) + 1;
            petV4.pets[petIdx] = pet;
            
            return { 
                success: true, 
                petId, 
                name: pet.name, 
                newLevel: pet.level, 
                newEvolveStage: pet.evolveStage, 
                message: pet.name + ' 进化成功！等级提升至 ' + pet.level 
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 执行宠物进化 V5 (V181)
     */
    mcpPetEvolveV5(petId) {
        try {
            if (!petId) return { error: '请指定宠物ID' };
            
            const petV5 = this._initPetStateV5();
            const petIdx = petV5.pets.findIndex(p => p.id === petId);
            if (petIdx === -1) return { error: '宠物不存在: ' + petId };
            
            const pet = petV5.pets[petIdx];
            const evolveStage = pet.evolveStage || 1;
            const evolveCost = Math.floor(500 * Math.pow(1.5, evolveStage - 1));
            
            if ((this.gs.spiritStones || 0) < evolveCost) {
                return { error: '灵石不足，进化需要 ' + evolveCost + ' 灵石' };
            }
            
            this.gs.spiritStones -= evolveCost;
            pet.level = (pet.level || 1) + 1;
            pet.evolveStage = evolveStage + 1;
            petV5.pets[petIdx] = pet;
            
            return { 
                success: true, 
                petId, 
                name: pet.name, 
                newLevel: pet.level, 
                newEvolveStage: pet.evolveStage, 
                cost: evolveCost, 
                message: pet.name + ' 进化成功！等级提升至 ' + pet.level + '，消耗 ' + evolveCost + ' 灵石' 
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 执行宠物进化 V6 (V191)
     */
    mcpPetEvolveV6(petId) {
        try {
            if (!petId) return { error: '请指定宠物ID' };
            
            const petV6 = this._initPetStateV6();
            const petIdx = petV6.pets.findIndex(p => p.id === petId);
            if (petIdx === -1) return { error: '宠物不存在: ' + petId };
            
            const pet = petV6.pets[petIdx];
            const evolveStage = pet.evolveStage || 1;
            const evolveCost = Math.floor(800 * Math.pow(1.8, evolveStage - 1));
            
            if ((this.gs.spiritStones || 0) < evolveCost) {
                return { error: '灵石不足，进化需要 ' + evolveCost + ' 灵石' };
            }
            
            this.gs.spiritStones -= evolveCost;
            pet.level = (pet.level || 1) + 1;
            pet.evolveStage = evolveStage + 1;
            petV6.pets[petIdx] = pet;
            
            return { 
                success: true, 
                petId, 
                name: pet.name, 
                newLevel: pet.level, 
                newEvolveStage: pet.evolveStage, 
                cost: evolveCost, 
                message: pet.name + ' 进化成功！等级提升至 ' + pet.level + '，消耗 ' + evolveCost + ' 灵石' 
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 快速进化（消耗道具，直接完成）
     */
    quickEvolve(petId, targetStage = null) {
        try {
            const petState = this._initPetStateV6();
            const pet = petState.pets.find(p => p.id === petId);
            
            if (!pet) return { error: '宠物不存在: ' + petId };
            
            const check = this.checkCanEvolve(pet, targetStage);
            if (!check.canEvolve) {
                return { success: false, ...check };
            }
            
            const oldLevel = pet.level;
            const oldStage = pet.evolveStage || 1;
            
            // 消耗灵石
            this.gs.spiritStones -= check.cost;
            
            // 执行进化
            pet.level += 2;
            pet.evolveStage = (pet.evolveStage || 1) + 1;
            
            // 提升属性
            pet.attack = Math.floor((pet.attack || 10) * EVOLVE_STATS_MULTIPLIER.attack);
            pet.defense = Math.floor((pet.defense || 5) * EVOLVE_STATS_MULTIPLIER.defense);
            pet.speed = Math.floor((pet.speed || 10) * EVOLVE_STATS_MULTIPLIER.speed);
            
            return {
                success: true,
                petId,
                petName: pet.name,
                oldLevel,
                newLevel: pet.level,
                oldStage,
                newStage: pet.evolveStage,
                statsUpgrade: {
                    attack: pet.attack,
                    defense: pet.defense,
                    speed: pet.speed
                },
                cost: check.cost,
                message: pet.name + ' 进化成功！等级 ' + oldLevel + ' -> ' + pet.level
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 开始进化流程（带冷却时间）
     */
    startEvolution(petId, targetStage = null) {
        try {
            const petState = this._initPetStateV6();
            const pet = petState.pets.find(p => p.id === petId);
            
            if (!pet) return { error: '宠物不存在: ' + petId };
            
            const check = this.checkCanEvolve(pet, targetStage);
            if (!check.canEvolve) {
                return { success: false, ...check };
            }
            
            const nextStage = check.nextStage;
            const duration = EVOLVE_DURATION[nextStage] || 60000;
            
            // 设置进化状态
            if (!this.gs.evolveProcess) {
                this.gs.evolveProcess = {};
            }
            
            this.gs.evolveProcess[petId] = {
                status: 'in_progress',
                startTime: Date.now(),
                endTime: Date.now() + duration,
                targetStage: nextStage,
                cost: check.cost
            };
            
            return {
                success: true,
                petId,
                petName: pet.name,
                status: 'evolution_started',
                duration: duration,
                endTime: this.gs.evolveProcess[petId].endTime,
                message: pet.name + ' 开始进化，预计 ' + (duration / 1000) + ' 秒后完成'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 检查进化进度
     */
    checkEvolutionProgress(petId) {
        if (!this.gs.evolveProcess || !this.gs.evolveProcess[petId]) {
            return { error: '该宠物没有正在进化' };
        }
        
        const process = this.gs.evolveProcess[petId];
        const now = Date.now();
        
        if (now < process.endTime) {
            const remaining = process.endTime - now;
            return {
                petId,
                status: 'in_progress',
                progress: Math.floor((now - process.startTime) / (process.endTime - process.startTime) * 100),
                remainingMs: remaining,
                remainingSeconds: Math.ceil(remaining / 1000)
            };
        }
        
        return {
            petId,
            status: 'ready_to_complete',
            progress: 100
        };
    }

    /**
     * 完成进化
     */
    completeEvolution(petId) {
        try {
            const progress = this.checkEvolutionProgress(petId);
            if (progress.error) return progress;
            if (progress.status !== 'ready_to_complete') {
                return { error: '进化尚未完成，还需 ' + progress.remainingSeconds + ' 秒' };
            }
            
            const petState = this._initPetStateV6();
            const petIdx = petState.pets.findIndex(p => p.id === petId);
            if (petIdx === -1) return { error: '宠物不存在' };
            
            const pet = petState.pets[petIdx];
            const process = this.gs.evolveProcess[petId];
            
            const oldLevel = pet.level;
            const oldStage = pet.evolveStage || 1;
            
            // 消耗灵石
            this.gs.spiritStones -= process.cost;
            
            // 完成进化
            pet.level += 2;
            pet.evolveStage = process.targetStage;
            
            // 提升属性
            pet.attack = Math.floor((pet.attack || 10) * EVOLVE_STATS_MULTIPLIER.attack);
            pet.defense = Math.floor((pet.defense || 5) * EVOLVE_STATS_MULTIPLIER.defense);
            pet.speed = Math.floor((pet.speed || 10) * EVOLVE_STATS_MULTIPLIER.speed);
            
            // 清理进化进程
            delete this.gs.evolveProcess[petId];
            
            return {
                success: true,
                petId,
                petName: pet.name,
                oldLevel,
                newLevel: pet.level,
                oldStage,
                newStage: pet.evolveStage,
                message: pet.name + ' 进化完成！等级提升至 ' + pet.level
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取进化所需的道具
     */
    getEvolveMaterials(targetStage) {
        const stageKey = 'stage' + targetStage;
        return EVOLVE_MATERIALS[stageKey] || EVOLVE_MATERIALS.stage2;
    }

    /**
     * 检查进化道具是否足够
     */
    checkEvolveMaterials(petId, targetStage = null) {
        const petState = this._initPetStateV6();
        const pet = petState.pets.find(p => p.id === petId);
        
        if (!pet) return { error: '宠物不存在: ' + petId };
        
        const nextStage = targetStage || (pet.evolveStage || 1) + 1;
        const materials = this.getEvolveMaterials(nextStage);
        
        const results = materials.map(mat => {
            const owned = (this.gs.items || []).filter(i => i.id === mat.id).length;
            const enough = owned >= mat.count;
            return {
                ...mat,
                owned,
                enough
            };
        });
        
        const allEnough = results.every(r => r.enough);
        
        return {
            petId,
            targetStage: nextStage,
            materials: results,
            allEnough,
            message: allEnough ? '道具足够，可以进化' : '道具不足，无法进化'
        };
    }
}

// 导出进化阶段常量
const EVOLUTION_STAGE_NAMES = {
    1: '幼生期',
    2: '幼年期',
    3: '成熟期',
    4: '远古期',
    5: '神化期'
};

export {
    PetEvolveService,
    EVOLUTION_STAGES,
    EVOLUTION_FORMS,
    EVOLVE_COST_CONFIG,
    EVOLVE_INTIMACY_REQUIREMENTS,
    EVOLVE_STATS_MULTIPLIER,
    EVOLVE_LEVEL_REQUIREMENTS,
    EVOLVE_DURATION,
    EVOLVE_SUCCESS_RATE,
    EVOLVE_MATERIALS,
    EVOLUTION_STAGE_NAMES,
};