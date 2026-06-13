/**
 * PetService - 灵宠服务
 * 处理宠物相关的业务逻辑
 */

import { Pet, PET_TYPES, PET_RARITY, RARITY_COLORS } from '../entities/Pet.js';

// 宠物配置常量
const PET_CONFIG = {
    maxPets: 10,
    petSlots: 3,
    evolveCostBase: 500,
    evolveCostMultiplier: 1.5,
    captureCost: 200,
    petTypes: ['妖兽', '灵兽', '神兽', '仙兽'],
};

const PET_CONFIG_V4 = {
    maxPets: 5,
    petSlots: 1,
    evolveCostBase: 500,
};

const PET_CONFIG_V5 = {
    maxPets: 10,
    petSlots: 3,
    evolveCostBase: 500,
    evolveCostMultiplier: 1.5,
    petTypes: ['妖兽', '灵兽', '神兽', '仙兽'],
    rarityColors: { common: '#999', rare: '#00f', epic: '#f0f', legend: '#f80' }
};

const PET_CONFIG_V6 = {
    maxPets: 15,
    petSlots: 5,
    evolveCostBase: 800,
    evolveCostMultiplier: 1.8,
    petTypes: ['妖兽', '灵兽', '神兽', '仙兽', '圣兽'],
    rarityColors: { common: '#999', rare: '#00f', epic: '#f0f', legend: '#f80', mythic: '#ff0' }
};

// 食物配置
const FOOD_CONFIG = {
    basic: { cost: 20, intimacy: 5 },
    normal: { cost: 30, intimacy: 8 },
    premium: { cost: 80, intimacy: 15 },
    super: { cost: 200, intimacy: 30 }
};

// 进化亲密度要求
const INTIMACY_REQUIRED = {
    adult: 30,
    mutant: 60,
    divine: 90
};

// 进化消耗
const EVO_COST = {
    adult: 500,
    mutant: 2000,
    divine: 8000
};

// 宠物种类基础属性
const TIER_POWER = {
    wolf: 15,
    tiger: 20,
    fox: 12,
    dragon: 30,
    phoenix: 25,
    turtle: 10,
};

/**
 * PetService Class - 灵宠服务类
 */
class PetService {
    constructor(gameState) {
        this.gs = gameState;
    }

    /**
     * 初始化宠物状态 (V132)
     */
    _initPetState() {
        if (!this.gs.pets) {
            this.gs.pets = [];
        }
        if (!this.gs.petState) {
            this.gs.petState = {
                pets: [],
                nextId: 1,
                captureCost: 200
            };
        }
        return this.gs.petState;
    }

    /**
     * 初始化进化状态 (V132)
     */
    _initEvolveState() {
        if (!this.gs.evolveState) {
            this.gs.evolveState = {
                preparing: false,
                inProgress: false,
                petId: null,
                startTime: null
            };
        }
        return this.gs.evolveState;
    }

    /**
     * 获取宠物列表 (V78基础版)
     */
    mcpPetList() {
        try {
            const pets = this.gs.pets || [];
            return { total: pets.length, pets };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 喂食宠物 (V78基础版)
     */
    mcpPetFeed(petId, food) {
        try {
            const pets = this.gs.pets || [];
            const pet = pets.find(p => p.id === petId);
            if (!pet) return { error: 'Pet not found: ' + petId };
            
            const FOOD_BONUS = { normal: 5, premium: 15, super: 50 };
            pet.affinity = (pet.affinity || 0) + (FOOD_BONUS[food] || 5);
            return { success: true, petId, affinity: pet.affinity, bonus: FOOD_BONUS[food] || 5 };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 宠物进化 (V78基础版)
     */
    mcpPetEvolve(petId, stones) {
        try {
            const pets = this.gs.pets || [];
            const pet = pets.find(p => p.id === petId);
            if (!pet) return { error: 'Pet not found: ' + petId };
            
            const cost = (stones || 1) * 50;
            if ((this.gs.spiritStones || 0) < cost) return { error: 'Not enough spirit stones' };
            
            this.gs.spiritStones -= cost;
            pet.stage = (pet.stage || 1) + 1;
            pet.evolutionCost = cost;
            return { success: true, petId, newStage: pet.stage, cost, remaining: this.gs.spiritStones };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 宠物技能管理 (V78基础版)
     */
    mcpPetSkill(petId, action, skillId) {
        try {
            const pets = this.gs.pets || [];
            const pet = pets.find(p => p.id === petId);
            if (!pet) return { error: 'Pet not found: ' + petId };
            
            if (!pet.skills) pet.skills = [];
            
            if (action === 'learn') {
                if (pet.skills.length >= 4) return { error: 'Pet already has 4 skills' };
                pet.skills.push({ id: skillId || 'skill_' + Date.now(), level: 1 });
                return { success: true, skill: pet.skills[pet.skills.length - 1] };
            }
            if (action === 'upgrade') {
                const skill = pet.skills.find(s => s.id === skillId);
                if (!skill) return { error: 'Skill not found: ' + skillId };
                skill.level = (skill.level || 1) + 1;
                return { success: true, skill };
            }
            if (action === 'forget') {
                pet.skills = pet.skills.filter(s => s.id !== skillId);
                return { success: true, remaining: pet.skills.length };
            }
            return { error: 'Invalid action: ' + action };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取灵宠列表 (V132)
     */
    mcpPetList() {
        try {
            const petState = this._initPetState();
            return {
                success: true,
                total: petState.pets.length,
                pets: petState.pets,
                captureCost: petState.captureCost
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 捕捉灵宠 (V132)
     */
    mcpPetCapture() {
        try {
            const petState = this._initPetState();
            const cost = petState.captureCost;
            if ((this.gs.spiritStones || 0) < cost) {
                return { error: '灵石不足，捕捉需要 ' + cost + ' 灵石' };
            }
            this.gs.spiritStones -= cost;
            
            // 随机生成灵宠
            const species = ['灵狐', '玄龟', '火鹤', '玉兔', '银狼', '青蛇', '白虎', '金鹏'];
            const speciesIndex = Math.floor(Math.random() * species.length);
            const baseLevel = Math.floor(Math.random() * 3) + 1;
            const names = ['小仙', '灵儿', '小白', '阿福', '朵朵', '威威', '圆圆', '壮壮'];
            const nameIndex = Math.floor(Math.random() * names.length);
            
            const pet = new Pet({
                id: 'pet_' + (petState.nextId++),
                name: names[nameIndex],
                species: species[speciesIndex],
                level: baseLevel,
                evolutionStage: 1,
                stats: {
                    attack: 10 + baseLevel * 5,
                    defense: 5 + baseLevel * 3,
                    spirit: 8 + baseLevel * 4
                }
            });
            
            petState.pets.push(pet.toJSON());
            return { success: true, pet: pet.toJSON(), cost, message: '捕捉成功！获得 ' + pet.species + ' 【' + pet.name + '】' };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 放生灵宠 (V132)
     */
    mcpPetRelease(petId) {
        try {
            const petState = this._initPetState();
            const idx = petState.pets.findIndex(p => p.id === petId);
            if (idx === -1) return { error: '灵宠不存在: ' + petId };
            
            const pet = petState.pets[idx];
            petState.pets.splice(idx, 1);
            return { success: true, pet, message: '放生了 ' + pet.species + ' 【' + pet.name + '】' };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 准备进化 (V132)
     */
    mcpEvolvePrepare(petId) {
        try {
            const petState = this._initPetState();
            const evolveState = this._initEvolveState();
            const pet = petState.pets.find(p => p.id === petId);
            
            if (!pet) return { error: '灵宠不存在: ' + petId };
            if (pet.level < 5) {
                return { success: false, petId, message: pet.name + ' 等级不足，需要5级才能进化', levelRequired: 5, currentLevel: pet.level };
            }
            if (pet.evolutionStage >= 3) {
                return { success: false, petId, message: pet.name + ' 已达最高进化阶段', maxStage: 3 };
            }
            
            evolveState.preparing = true;
            evolveState.petId = petId;
            
            return {
                success: true,
                petId,
                petName: pet.name,
                currentStage: pet.evolutionStage,
                nextStage: pet.evolutionStage + 1,
                message: pet.name + ' 已准备好进化，当前阶段 ' + pet.evolutionStage + '，可进化至 ' + (pet.evolutionStage + 1)
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 开始进化 (V132)
     */
    mcpEvolveStart() {
        try {
            const petState = this._initPetState();
            const evolveState = this._initEvolveState();
            
            if (!evolveState.preparing || !evolveState.petId) {
                return { error: '没有准备进化的灵宠，请先调用 evolve.prepare' };
            }
            
            const pet = petState.pets.find(p => p.id === evolveState.petId);
            if (!pet) return { error: '灵宠不存在，可能已被放生' };
            
            evolveState.preparing = false;
            evolveState.inProgress = true;
            evolveState.startTime = Date.now();
            
            return {
                success: true,
                petId: pet.id,
                petName: pet.name,
                message: pet.name + ' 开始进化，请等待后调用 evolve.complete 完成进化'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 完成进化 (V132)
     */
    mcpEvolveComplete() {
        try {
            const petState = this._initPetState();
            const evolveState = this._initEvolveState();
            
            if (!evolveState.inProgress || !evolveState.petId) {
                return { error: '没有正在进化的灵宠，请先调用 evolve.start' };
            }
            
            const pet = petState.pets.find(p => p.id === evolveState.petId);
            if (!pet) return { error: '灵宠不存在，可能已被放生' };
            
            const oldLevel = pet.level;
            const oldStage = pet.evolutionStage;
            
            pet.level += 2;
            pet.evolutionStage += 1;
            pet.stats.attack = Math.floor(pet.stats.attack * 1.3);
            pet.stats.defense = Math.floor(pet.stats.defense * 1.3);
            pet.stats.spirit = Math.floor(pet.stats.spirit * 1.3);
            
            const evolvedPetId = evolveState.petId;
            evolveState.inProgress = false;
            evolveState.petId = null;
            evolveState.startTime = null;
            
            return {
                success: true,
                petId: evolvedPetId,
                petName: pet.name,
                oldLevel,
                newLevel: pet.level,
                oldStage: oldStage,
                newStage: pet.evolutionStage,
                statsUpgrade: pet.stats,
                message: pet.name + ' 进化成功！等级 ' + oldLevel + ' -> ' + pet.level + '，阶段 ' + oldStage + ' -> ' + pet.evolutionStage
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 捕捉灵兽 (V85)
     */
    mcpPetCapture(type, bait) {
        try {
            const VALID_TYPES = ['wolf', 'tiger', 'fox', 'dragon', 'phoenix', 'turtle'];
            if (!VALID_TYPES.includes(type)) return { error: 'Invalid pet type' };
            
            const BAIT_COST = { low: 50, medium: 150, high: 400, premium: 1000 };
            const BAIT_SUCCESS = { low: 0.4, medium: 0.65, high: 0.85, premium: 0.95 };
            
            const b = bait || 'medium';
            const cost = BAIT_COST[b];
            
            this.gs.spiritStones = this.gs.spiritStones || 0;
            if (this.gs.spiritStones < cost) {
                return { error: 'Not enough spirit stones', required: cost, available: this.gs.spiritStones };
            }
            
            const roll = Math.random();
            const successRate = BAIT_SUCCESS[b];
            
            if (roll > successRate) {
                this.gs.spiritStones -= cost;
                return { success: false, reason: 'Pet escaped', cost, remainingStones: this.gs.spiritStones };
            }
            
            this.gs.spiritStones -= cost;
            this.gs.pets = this.gs.pets || [];
            
            const petId = 'PET_' + Date.now();
            const newPet = {
                id: petId,
                type,
                name: type.charAt(0).toUpperCase() + type.slice(1),
                form: 'child',
                level: 1,
                power: TIER_POWER[type] || 10,
                intimacy: 0,
                hunger: 0,
                active: true,
                skills: [],
                equipped: null,
                loyalty: 50,
                potential: Math.floor(Math.random() * 30) + 70,
                captureCost: cost,
                capturedAt: Date.now()
            };
            
            this.gs.pets.push(newPet);
            return { success: true, pet: newPet, cost, remainingStones: this.gs.spiritStones };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取宠物列表 (V85)
     */
    mcpPetListV85(filter) {
        try {
            const pets = this.gs.pets || [];
            const f = filter || 'all';
            
            let filtered = pets;
            if (f === 'active') filtered = pets.filter(p => p.active);
            else if (f === 'released') filtered = pets.filter(p => !p.active);
            
            return { pets: filtered, total: filtered.length };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 喂食灵兽 (V85)
     */
    mcpPetFeedV85(petId, food) {
        try {
            this.gs.pets = this.gs.pets || [];
            const pet = this.gs.pets.find(p => p.id === petId);
            
            if (!pet) return { error: 'Pet not found' };
            if (!pet.active) return { error: 'Pet has been released' };
            
            const FOOD_INTIMACY = { basic: 5, premium: 15, super: 30 };
            const FOOD_COST = { basic: 20, premium: 80, super: 200 };
            
            const f = food || 'basic';
            const cost = FOOD_COST[f];
            
            this.gs.spiritStones = this.gs.spiritStones || 0;
            if (this.gs.spiritStones < cost) {
                return { error: 'Not enough spirit stones', required: cost, available: this.gs.spiritStones };
            }
            
            this.gs.spiritStones -= cost;
            pet.hunger = Math.max(0, pet.hunger - 20);
            pet.intimacy = Math.min(100, pet.intimacy + FOOD_INTIMACY[f]);
            pet.loyalty = Math.min(100, pet.loyalty + 2);
            
            return { success: true, petId: pet.id, intimacy: pet.intimacy, loyalty: pet.loyalty, hunger: pet.hunger, cost };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 灵兽进化 (V85)
     */
    mcpPetEvolveV85(petId, targetForm) {
        try {
            this.gs.pets = this.gs.pets || [];
            const pet = this.gs.pets.find(p => p.id === petId);
            
            if (!pet) return { error: 'Pet not found' };
            if (!pet.active) return { error: 'Pet has been released' };
            
            const VALID_FORMS = ['adult', 'mutant', 'divine'];
            if (!VALID_FORMS.includes(targetForm)) return { error: 'Invalid target form' };
            
            const FORM_ORDER = ['child', 'adult', 'mutant', 'divine'];
            const currentIdx = FORM_ORDER.indexOf(pet.form);
            const targetIdx = FORM_ORDER.indexOf(targetForm);
            
            if (targetIdx <= currentIdx) return { error: 'Target form must be higher than current' };
            
            const INTIMACY_REQUIRED = { adult: 30, mutant: 60, divine: 90 };
            if (pet.intimacy < INTIMACY_REQUIRED[targetForm]) {
                return { error: `Intimacy ${pet.intimacy} below required ${INTIMACY_REQUIRED[targetForm]} for ${targetForm}` };
            }
            
            const EVO_COST = { adult: 500, mutant: 2000, divine: 8000 };
            const cost = EVO_COST[targetForm];
            
            this.gs.spiritStones = this.gs.spiritStones || 0;
            if (this.gs.spiritStones < cost) {
                return { error: 'Not enough spirit stones', required: cost, available: this.gs.spiritStones };
            }
            
            this.gs.spiritStones -= cost;
            pet.form = targetForm;
            pet.power = Math.round(pet.power * (1 + (targetIdx - currentIdx) * 0.3));
            pet.level = Math.min(99, pet.level + 5);
            
            return { success: true, petId: pet.id, newForm: pet.form, newPower: pet.power, newLevel: pet.level, cost };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 放生灵兽 (V85)
     */
    mcpPetReleaseV85(petId) {
        try {
            this.gs.pets = this.gs.pets || [];
            const pet = this.gs.pets.find(p => p.id === petId);
            
            if (!pet) return { error: 'Pet not found' };
            if (!pet.active) return { error: 'Pet already released' };
            
            pet.active = false;
            pet.releasedAt = Date.now();
            
            return { success: true, petId, status: 'released' };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取宠物状态 (V85)
     */
    mcpPetStats(petId) {
        try {
            const pets = this.gs.pets || [];
            
            if (petId) {
                const pet = pets.find(p => p.id === petId);
                if (!pet) return { error: 'Pet not found' };
                return { pet, active: pets.filter(p => p.active).length, total: pets.length };
            }
            
            return {
                pets: pets.filter(p => p.active),
                total: pets.length,
                activeCount: pets.filter(p => p.active).length,
                releasedCount: pets.filter(p => !p.active).length,
                byType: {
                    wolf: pets.filter(p => p.type === 'wolf').length,
                    tiger: pets.filter(p => p.type === 'tiger').length,
                    fox: pets.filter(p => p.type === 'fox').length,
                    dragon: pets.filter(p => p.type === 'dragon').length,
                    phoenix: pets.filter(p => p.type === 'phoenix').length,
                    turtle: pets.filter(p => p.type === 'turtle').length
                }
            };
        } catch (e) { return { error: e.message }; }
    }
}

export {
    PetService,
    PET_CONFIG,
    PET_CONFIG_V4,
    PET_CONFIG_V5,
    PET_CONFIG_V6,
    FOOD_CONFIG,
    TIER_POWER,
};