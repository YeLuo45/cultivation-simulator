/**
 * Pet Entity - 灵宠实体
 * 宠物系统核心数据模型
 */

// 宠物基础属性接口
const PetAttributes = {
    id: '',           // 唯一标识
    name: '',         // 名称
    species: '',      // 种类
    level: 1,         // 等级
    experience: 0,    // 经验值
    loyalty: 50,      // 忠诚度
    health: 100,      // 生命值
    energy: 100,      // 能量值
    hunger: 0,        // 饥饿度
    happiness: 100,   // 快乐度
    active: true,     // 是否活跃
    capturedAt: null, // 捕捉时间
    lastFed: null,    // 最后喂食时间
    lastPlayed: null, // 最后互动时间
};

// 宠物战斗属性
const PetBattleStats = {
    attack: 10,        // 攻击力
    defense: 5,       // 防御力
    speed: 10,        // 速度
    critRate: 0.05,   // 暴击率
    critDamage: 1.5,   // 暴击伤害
    accuracy: 0.9,    // 命中率
    dodge: 0.1,       // 闪避率
};

// 宠物进化阶段
const EvolutionStages = {
    INFANT: 1,    // 幼生期
    MATURE: 2,    // 成熟期
    ANCIENT: 3,   // 远古期
    DIVINE: 4,    // 神化期
};

// 宠物形态
const PetForms = {
    CHILD: 'child',     // 幼体
    ADULT: 'adult',     // 成体
    MUTANT: 'mutant',   // 变异体
    DIVINE: 'divine',   // 神体
};

/**
 * Pet Entity Class
 */
class Pet {
    constructor(data = {}) {
        // 基础信息
        this.id = data.id || `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = data.name || '灵宠';
        this.species = data.species || '未知';
        this.type = data.type || 'normal';
        
        // 等级与经验
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.maxExperience = this.calcMaxExperience();
        
        // 基础属性
        this.health = data.health || 100;
        this.maxHealth = data.maxHealth || 100;
        this.energy = data.energy || 100;
        this.maxEnergy = data.maxEnergy || 100;
        this.hunger = data.hunger || 0;
        this.happiness = data.happiness || 100;
        
        // 忠诚度与亲密度
        this.loyalty = data.loyalty || 50;
        this.intimacy = data.intimacy || 0;
        this.affinity = data.affinity || 0;
        
        // 进化阶段
        this.evolutionStage = data.evolutionStage || EvolutionStages.INFANT;
        this.evolveStage = data.evolveStage || 1;
        this.form = data.form || PetForms.CHILD;
        
        // 战斗属性
        this.attack = data.attack || PetBattleStats.attack;
        this.defense = data.defense || PetBattleStats.defense;
        this.speed = data.speed || PetBattleStats.speed;
        this.power = data.power || 10;
        this.potential = data.potential || Math.floor(Math.random() * 30) + 70;
        
        // 技能
        this.skills = data.skills || [];
        this.maxSkills = 4;
        
        // 状态
        this.active = data.active !== undefined ? data.active : true;
        this.equipped = data.equipped || false;
        this.favorite = data.favorite || false;
        
        // 时间戳
        this.capturedAt = data.capturedAt || Date.now();
        this.lastFed = data.lastFed || null;
        this.lastPlayed = data.lastPlayed || null;
        this.lastTrained = data.lastTrained || null;
        
        // 元数据
        this.captureCost = data.captureCost || 0;
        this.rarity = data.rarity || 'common';
        this.color = data.color || '#999999';
    }

    /**
     * 计算升级所需最大经验值
     */
    calcMaxExperience() {
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }

    /**
     * 添加经验值
     */
    addExperience(exp) {
        this.experience += exp;
        let levelsGained = 0;
        while (this.experience >= this.maxExperience) {
            this.experience -= this.maxExperience;
            this.levelUp();
            levelsGained++;
        }
        this.maxExperience = this.calcMaxExperience();
        return levelsGained;
    }

    /**
     * 升级
     */
    levelUp() {
        this.level++;
        this.maxHealth += 5;
        this.health = Math.min(this.health + 5, this.maxHealth);
        this.attack += 2;
        this.defense += 1;
        this.speed += 1;
    }

    /**
     * 喂食
     */
    feed(foodType = 'normal') {
        const FOOD_BONUS = {
            normal: 5,
            basic: 5,
            premium: 15,
            super: 50
        };
        const FOOD_HUNGER_REDUCTION = {
            normal: 10,
            basic: 10,
            premium: 20,
            super: 40
        };
        
        const bonus = FOOD_BONUS[foodType] || 5;
        this.affinity = (this.affinity || 0) + bonus;
        this.intimacy = Math.min(100, (this.intimacy || 0) + bonus);
        this.hunger = Math.max(0, this.hunger - (FOOD_HUNGER_REDUCTION[foodType] || 10));
        this.lastFed = Date.now();
        
        return {
            affinityGain: bonus,
            hungerReduction: FOOD_HUNGER_REDUCTION[foodType] || 10
        };
    }

    /**
     * 互动/玩耍
     */
    play() {
        this.happiness = Math.min(100, this.happiness + 10);
        this.loyalty = Math.min(100, this.loyalty + 2);
        this.intimacy = Math.min(100, (this.intimacy || 0) + 3);
        this.energy = Math.max(0, this.energy - 5);
        this.lastPlayed = Date.now();
    }

    /**
     * 训练
     */
    train() {
        if (this.energy < 20) {
            return { success: false, message: '能量不足，无法训练' };
        }
        this.energy -= 20;
        this.experience += 10;
        this.attack += 1;
        this.loyalty = Math.min(100, this.loyalty + 1);
        this.lastTrained = Date.now();
        return { success: true, experienceGained: 10 };
    }

    /**
     * 学习技能
     */
    learnSkill(skillId, skillLevel = 1) {
        if (this.skills.length >= this.maxSkills) {
            return { success: false, message: '技能栏已满，最多' + this.maxSkills + '个技能' };
        }
        if (this.skills.some(s => s.id === skillId)) {
            return { success: false, message: '已学会该技能' };
        }
        this.skills.push({
            id: skillId,
            level: skillLevel,
            learnedAt: Date.now()
        });
        return { success: true, skill: this.skills[this.skills.length - 1] };
    }

    /**
     * 升级技能
     */
    upgradeSkill(skillId) {
        const skill = this.skills.find(s => s.id === skillId);
        if (!skill) {
            return { success: false, message: '技能不存在' };
        }
        skill.level = (skill.level || 1) + 1;
        return { success: true, skill };
    }

    /**
     * 遗忘技能
     */
    forgetSkill(skillId) {
        const idx = this.skills.findIndex(s => s.id === skillId);
        if (idx === -1) {
            return { success: false, message: '技能不存在' };
        }
        this.skills.splice(idx, 1);
        return { success: true, remaining: this.skills.length };
    }

    /**
     * 检查是否可以进化
     */
    canEvolve(targetStage = null) {
        const nextStage = targetStage || this.evolutionStage + 1;
        
        // 检查是否达到最高阶段
        if (this.evolutionStage >= 3) {
            return { canEvolve: false, reason: '已达最高进化阶段' };
        }
        
        // 检查等级是否足够
        const levelRequired = 5;
        if (this.level < levelRequired) {
            return { canEvolve: false, reason: '等级不足，需要' + levelRequired + '级', levelRequired, currentLevel: this.level };
        }
        
        // 检查亲密度是否足够
        const INTIMACY_REQUIRED = { 2: 30, 3: 60, 4: 90 };
        const requiredIntimacy = INTIMACY_REQUIRED[nextStage] || 30;
        if ((this.intimacy || 0) < requiredIntimacy) {
            return { canEvolve: false, reason: '亲密度不足', requiredIntimacy, currentIntimacy: this.intimacy };
        }
        
        return { canEvolve: true };
    }

    /**
     * 进化
     */
    evolve(targetStage = null) {
        const check = this.canEvolve(targetStage);
        if (!check.canEvolve) {
            return { success: false, ...check };
        }
        
        const oldLevel = this.level;
        const oldStage = this.evolutionStage;
        const oldForm = this.form;
        
        this.level += 2;
        this.evolutionStage += 1;
        this.evolveStage = (this.evolveStage || 1) + 1;
        
        // 进化形态变化
        const FORM_ORDER = [PetForms.CHILD, PetForms.ADULT, PetForms.MUTANT, PetForms.DIVINE];
        const currentIdx = FORM_ORDER.indexOf(this.form);
        const targetIdx = Math.min(currentIdx + 1, FORM_ORDER.length - 1);
        this.form = FORM_ORDER[targetIdx];
        
        // 属性提升
        this.attack = Math.floor(this.attack * 1.3);
        this.defense = Math.floor(this.defense * 1.3);
        this.speed = Math.floor(this.speed * 1.3);
        
        return {
            success: true,
            oldLevel,
            newLevel: this.level,
            oldStage,
            newStage: this.evolutionStage,
            oldForm,
            newForm: this.form,
            statsUpgrade: {
                attack: this.attack,
                defense: this.defense,
                speed: this.speed
            }
        };
    }

    /**
     * 设置是否活跃
     */
    setActive(isActive) {
        this.active = isActive;
        if (!isActive) {
            this.releasedAt = Date.now();
        }
    }

    /**
     * 获取战斗力评估
     */
    getBattlePower() {
        const basePower = this.attack * 1.2 + this.defense * 0.8 + this.speed * 0.5;
        const levelBonus = this.level * 5;
        const skillBonus = this.skills.reduce((sum, s) => sum + (s.level || 1) * 10, 0);
        const loyaltyBonus = this.loyalty > 80 ? 1.2 : this.loyalty > 50 ? 1.0 : 0.8;
        return Math.floor((basePower + levelBonus + skillBonus) * loyaltyBonus);
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            species: this.species,
            type: this.type,
            level: this.level,
            experience: this.experience,
            maxExperience: this.maxExperience,
            health: this.health,
            maxHealth: this.maxHealth,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            hunger: this.hunger,
            happiness: this.happiness,
            loyalty: this.loyalty,
            intimacy: this.intimacy,
            affinity: this.affinity,
            evolutionStage: this.evolutionStage,
            evolveStage: this.evolveStage,
            form: this.form,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            power: this.power,
            potential: this.potential,
            skills: this.skills,
            active: this.active,
            equipped: this.equipped,
            favorite: this.favorite,
            capturedAt: this.capturedAt,
            lastFed: this.lastFed,
            lastPlayed: this.lastPlayed,
            lastTrained: this.lastTrained,
            captureCost: this.captureCost,
            rarity: this.rarity,
            color: this.color
        };
    }

    /**
     * 从JSON创建实例
     */
    static fromJSON(json) {
        return new Pet(json);
    }
}

// 宠物类型常量
const PET_TYPES = {
    WOLF: 'wolf',
    TIGER: 'tiger',
    FOX: 'fox',
    DRAGON: 'dragon',
    PHOENIX: 'phoenix',
    TURTLE: 'turtle',
    SPIRIT_FOX: 'spirit_fox',
    MYSTIC_BIRD: 'mystic_bird',
};

// 宠物稀有度
const PET_RARITY = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
    MYTHIC: 'mythic',
};

// 宠物稀有度颜色
const RARITY_COLORS = {
    common: '#999999',
    uncommon: '#00ff00',
    rare: '#0066ff',
    epic: '#ff00ff',
    legendary: '#ff8800',
    mythic: '#ffff00',
};

// 宠物稀有度对应战斗力倍率
const RARITY_POWER_MULT = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2.0,
    legendary: 3.0,
    mythic: 5.0,
};

// 宠物种类配置
const PET_SPECIES_CONFIG = {
    '灵狐': { attack: 12, defense: 8, speed: 15, rarity: 'rare' },
    '玄龟': { attack: 8, defense: 15, speed: 6, rarity: 'uncommon' },
    '火鹤': { attack: 15, defense: 6, speed: 12, rarity: 'rare' },
    '玉兔': { attack: 10, defense: 10, speed: 10, rarity: 'common' },
    '银狼': { attack: 14, defense: 10, speed: 12, rarity: 'epic' },
    '青蛇': { attack: 16, defense: 5, speed: 14, rarity: 'epic' },
    '白虎': { attack: 18, defense: 12, speed: 10, rarity: 'legendary' },
    '金鹏': { attack: 20, defense: 8, speed: 18, rarity: 'mythic' },
};

module.exports = {
    Pet,
    PetAttributes,
    PetBattleStats,
    EvolutionStages,
    PetForms,
    PET_TYPES,
    PET_RARITY,
    RARITY_COLORS,
    RARITY_POWER_MULT,
    PET_SPECIES_CONFIG,
};