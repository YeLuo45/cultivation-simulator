// domains/shared/constants/pet.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Pet Domain Constants
// ============================================================================

export const PET_TYPES = {
            '灵狐': { icon: '🦊', baseStats: { attack: 5, defense: 3, hp: 30 }, quality: 'common', ability: '魅惑', abilityDesc: '战斗中魅惑敌方，使其攻击降低' },
            '玄蛇': { icon: '🐍', baseStats: { attack: 7, defense: 2, hp: 25 }, quality: 'common', ability: '毒雾', abilityDesc: '战斗中毒伤敌方，每回合损失生命' },
            '灵鹤': { icon: '🦢', baseStats: { attack: 4, defense: 5, hp: 35 }, quality: 'common', ability: '御风', abilityDesc: '主人速度+10%' },
            '玉兔': { icon: '🐰', baseStats: { attack: 2, defense: 4, hp: 40 }, quality: 'common', ability: '捣药', abilityDesc: '每3天产出灵气+5' },
            '青鸾': { icon: '🦚', baseStats: { attack: 8, defense: 4, hp: 35 }, quality: 'rare', ability: '鸣音', abilityDesc: '战斗中山攻击+15%' },
            '白虎': { icon: '🐯', baseStats: { attack: 12, defense: 6, hp: 50 }, quality: 'rare', ability: '猛虎', abilityDesc: '战斗中山攻击+20%' },
            '玄武': { icon: '🐢', baseStats: { attack: 6, defense: 15, hp: 80 }, quality: 'rare', ability: '护盾', abilityDesc: '主人受到的伤害-15%' },
            '青龙': { icon: '🐉', baseStats: { attack: 15, defense: 8, hp: 60 }, quality: 'precious', ability: '龙威', abilityDesc: '战斗中山所有属性+10%' },
            '朱雀': { icon: '🔥', baseStats: { attack: 18, defense: 5, hp: 45 }, quality: 'precious', ability: '涅槃', abilityDesc: '主人死亡时复活一次(50%生命)' },
            '白泽': { icon: '🦁', baseStats: { attack: 10, defense: 10, hp: 70 }, quality: 'precious', ability: '通灵', abilityDesc: '奇遇触发率+20%' },
            '麒麟': { icon: '🦒', baseStats: { attack: 14, defense: 14, hp: 85 }, quality: 'legendary', ability: '祥瑞', abilityDesc: '主人修炼速度+15%' },
            '鲲鹏': { icon: '🐋', baseStats: { attack: 20, defense: 12, hp: 100 }, quality: 'legendary', ability: '扶摇', abilityDesc: '探索区域范围+2' }
        };


export const PET_QUALITY_MULTIPLIERS = {
            common: 1.0,
            rare: 1.5,
            precious: 2.0,
            legendary: 3.0
        };


export const PET_FOOD_COST = 10; // 喂养消耗灵石


export const PET_SUMMON_COST = 500; // 召唤消耗灵石


export const PET_MAX_LEVEL = {
            common: 20,
            rare: 40,
            precious: 60,
            legendary: 100
        };


export const PET_EXP_NEEDED_PER_LEVEL = 100; // 每级所需经验


export const PET_LOYALTY_DECAY_RATE = 5; // 每天忠诚度下降


export const PET_HUNGER_DECAY_RATE = 10; // 每天饱食度下降


export const PET_MAX_LOYALTY = 100;


export const PET_MAX_HUNGER = 100;


export const PET_BREEDING_COST = 200; // 繁殖消耗灵石


export const PET_BREEDING_MIN_LOYALTY = 70; // 繁殖最低忠诚度


export const PET_BREEDING_COOLDOWN = 3; // 繁殖冷却天数


export const PET_INCUBATION_DAYS_BASE = 5; // 基础孵化天数


export const PET_INCUBATION_DAYS_VAR = 3; // 孵化天数波动


export const PET_MAX_EGGS = 5; // 最大蛋容量


export const PET_EGG_TYPES = {
            common: { icon: '🥚', name: '灵兽蛋', hatchTime: 5 },
            rare: { icon: '🥚', name: '稀有灵兽蛋', hatchTime: 7 },
            precious: { icon: '🥚', name: '珍兽蛋', hatchTime: 10 },
            legendary: { icon: '🌟', name: '神兽蛋', hatchTime: 15 }
        };


export const PET_EGG_ICONS = {
            common: '🥚',
            rare: '🥚',
            precious: '🥚',
            legendary: '✨'
        };


export const PET_ADVANCEMENT_COSTS = [
            { stones: 300, exp: 50 },   // 第一次进阶
            { stones: 600, exp: 100 },  // 第二次
            { stones: 1200, exp: 200 },  // 第三次
            { stones: 2500, exp: 400 },  // 第四次
            { stones: 5000, exp: 800 }   // 第五次（满级）
        ];


export const PET_ADVANCEMENT_BONUS_PER_LEVEL = 0.1; // 每级属性提升10%


export const PET_MAX_ADVANCEMENT = 5; // 最大进阶次数


export const PET_TRANSFORMATION_STAGES = {
            0: { name: '幼体', icon: '🐣', statBonus: 0 },
            1: { name: '成体', icon: '🐾', statBonus: 0.15 },
            2: { name: '妖兽', icon: '🦁', statBonus: 0.30 },
            3: { name: '化形', icon: '🧑', statBonus: 0.50 },
            4: { name: '人形', icon: '👤', statBonus: 0.75 },
            5: { name: '真形', icon: '🌟', statBonus: 1.0 }
        };


export const PET_TRANSFORMATION_COSTS = [
            { stones: 500, realmMin: 1 },   // 化形1需要金丹
            { stones: 1500, realmMin: 2 },  // 化形2需要元婴
            { stones: 4000, realmMin: 3 },  // 化形3需要化神
            { stones: 10000, realmMin: 4 }, // 化形4需要渡劫
            { stones: 30000, realmMin: 5 }  // 化形5需要大乘
        ];


export const PET_AWAKENING_SKILLS = {
            // 通用觉醒技能 - 所有宠物都可能觉醒
            common: [
                { name: '火球术', icon: '🔥', desc: '战斗中使用火系法术攻击', power: 1.2, cost: 30 },
                { name: '冰霜术', icon: '❄️', desc: '战斗中有概率冻结敌人', power: 1.1, cost: 30 },
                { name: '疾风术', icon: '💨', desc: '主人速度+15%', power: 1.0, cost: 25 },
                { name: '护体术', icon: '🛡️', desc: '主人受到伤害-10%', power: 1.0, cost: 25 }
            ],
            // 稀有灵兽觉醒技能
            rare: [
                { name: '雷击术', icon: '⚡', desc: '战斗中高概率造成雷系暴击', power: 1.5, cost: 50 },
                { name: '毒雾术', icon: '☠️', desc: '每回合使敌人中毒', power: 1.3, cost: 45 },
                { name: '治疗术', icon: '💚', desc: '每回合恢复主人5%生命', power: 1.2, cost: 40 },
                { name: '护盾术', icon: '🔮', desc: '为主人提供伤害护盾', power: 1.3, cost: 45 }
            ],
            // 珍兽觉醒技能
            precious: [
                { name: '天雷术', icon: '🌩️', desc: '造成大范围雷系伤害', power: 2.0, cost: 80 },
                { name: '涅槃火', icon: '🦅', desc: '主人死亡时复活并恢复30%生命', power: 2.0, cost: 100 },
                { name: '通灵术', icon: '👻', desc: '奇遇触发率+25%', power: 1.5, cost: 60 },
                { name: '龙息术', icon: '🐉', desc: '吐息攻击，造成大量伤害', power: 1.8, cost: 70 }
            ],
            // 神兽觉醒技能
            legendary: [
                { name: '九天雷劫', icon: '💥', desc: '召唤九天雷劫，造成巨大伤害', power: 3.0, cost: 150 },
                { name: '时空扭曲', icon: '🌀', desc: '战斗中有概率回避致命伤害', power: 2.5, cost: 120 },
                { name: '祥瑞之光', icon: '✨', desc: '主人修炼速度+20%', power: 2.0, cost: 100 },
                { name: '鲲鹏展翅', icon: '🌊', desc: '探索范围+3，逃跑率+30%', power: 2.0, cost: 100 }
            ]
        };


export const PET_AWAKENING_COST = 1000; // 技能觉醒消耗灵石


export const PET_AWAKENING_EXP_COST = 200; // 技能觉醒需要经验


export const PET_MAX_AWAKENED_SKILLS = 4; // 最多觉醒技能数


export const PET_FUSION_COST = 500; // 融合消耗灵石


export const PET_FUSION_MIN_LOYALTY = 60; // 融合最低忠诚度


export const PET_FUSION_COOLDOWN = 5; // 融合冷却天数


export const PET_MUTATION_COST = 300; // 基因变异消耗灵石


export const PET_MUTATION_COOLDOWN = 3; // 基因变异冷却天数


export const PET_MUTATION_BASE_CHANCE = 0.3; // 基础变异概率


export const PET_GENE_TYPES = {
            attack: { name: '攻击基因', icon: '⚔️', color: '#f44336' },
            defense: { name: '防御基因', icon: '🛡️', color: '#2196f3' },
            hp: { name: '生命基因', icon: '❤️', color: '#e91e63' },
            speed: { name: '速度基因', icon: '💨', color: '#4caf50' },
            crit: { name: '暴击基因', icon: '💥', color: '#ff9800' },
            lucky: { name: '幸运基因', icon: '🍀', color: '#9c27b0' }
        };


export const PET_MUTATION_EFFECTS = [
            { id: 'attack_up', name: '攻击力强化', desc: '攻击力+15%', stat: 'attack', value: 0.15, probability: 0.2 },
            { id: 'defense_up', name: '防御力强化', desc: '防御力+15%', stat: 'defense', value: 0.15, probability: 0.2 },
            { id: 'hp_up', name: '生命强化', desc: '最大生命+20%', stat: 'hp', value: 0.20, probability: 0.2 },
            { id: 'speed_up', name: '速度强化', desc: '速度+12%', stat: 'speed', value: 0.12, probability: 0.15 },
            { id: 'crit_up', name: '暴击强化', desc: '暴击率+10%', stat: 'crit', value: 0.10, probability: 0.1 },
            { id: 'regen', name: '再生能力', desc: '每天恢复生命+5%', stat: 'hp_regen', value: 0.05, probability: 0.08 },
            { id: 'resistance', name: '抗性强化', desc: '异常状态抗性+20%', stat: 'resist', value: 0.20, probability: 0.07 },
            { id: 'ability_boost', name: '天赋强化', desc: '现有技能效果+25%', stat: 'ability', value: 0.25, probability: 0.05 },
            { id: 'dual_attack', name: '双重打击', desc: '普通攻击有30%概率攻击两次', stat: 'dual_attack', value: 0.30, probability: 0.03 },
            { id: 'element_fire', name: '火焰基因', desc: '攻击附带10%火焰伤害', stat: 'element_fire', value: 0.10, probability: 0.03 },
            { id: 'element_ice', name: '寒冰基因', desc: '攻击有10%概率冻结敌人', stat: 'element_ice', value: 0.10, probability: 0.03 },
            { id: 'element_thunder', name: '雷电基因', desc: '攻击有8%概率造成麻痹', stat: 'element_thunder', value: 0.08, probability: 0.02 }
        ];


export const PET_FUSION_COMBINATIONS = {
            '灵狐+玄蛇': { name: '妖狐蛇君', icon: '🐍', ability: '魅惑毒雾', statBonus: { attack: 1.2, crit: 0.1 } },
            '玄蛇+灵鹤': { name: '鹤蛇合体', icon: '🦢', ability: '御风毒雾', statBonus: { attack: 1.15, speed: 0.15 } },
            '灵狐+灵鹤': { name: '狐鹤仙', icon: '🦅', ability: '魅惑御风', statBonus: { attack: 1.1, speed: 0.2 } },
            '青鸾+白虎': { name: '虎鸾神', icon: '🐯', ability: '虎鸾共鸣', statBonus: { attack: 1.3, defense: 1.2 } },
            '青龙+朱雀': { name: '龙凤呈祥', icon: '🐉', ability: '龙凤和鸣', statBonus: { attack: 1.4, hp: 1.3 } },
            '玄武+白虎': { name: '玄武白虎', icon: '🐢', ability: '玄武护盾', statBonus: { defense: 1.5, hp: 1.2 } },
            '麒麟+白泽': { name: '瑞兽传奇', icon: '🦁', ability: '祥瑞通灵', statBonus: { attack: 1.2, luck: 0.3 } },
            '鲲鹏+青龙': { name: '鲲龙', icon: '🐋', ability: '鲲龙之怒', statBonus: { attack: 1.5, speed: 1.3 } },
            '朱雀+白虎': { name: '火虎', icon: '🐯', ability: '烈焰虎啸', statBonus: { attack: 1.4, crit: 0.15 } },
            '白泽+麒麟': { name: '圣兽', icon: '🦁', ability: '圣兽庇护', statBonus: { all: 1.25 } }
        };


