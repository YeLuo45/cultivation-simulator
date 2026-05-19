// domains/shared/constants/inventory.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Inventory Domain Constants
// ============================================================================

export const PILLS = {
            '聚灵丹': { quality: 'common', effect: { type: 'qi', value: 50 }, price: 30, desc: '恢复50灵气', icon: '💊' },
            '心魔丹': { quality: 'common', effect: { type: 'mindset', value: 30 }, price: 40, desc: '恢复30心境', icon: '💊' },
            '金髓丹': { quality: 'rare', effect: { type: 'qi', value: 200 }, price: 100, desc: '恢复200灵气', icon: '💊' },
            '筑基丹': { quality: 'rare', effect: { type: 'breakthrough_boost', value: 0.2 }, price: 1200, desc: '突破成功率+20%', icon: '💊' },
            '破境丹': { quality: 'precious', effect: { type: 'breakthrough_boost', value: 0.3 }, price: 5000, desc: '突破+30%', icon: '💊' },
            '洗髓丹': { quality: 'precious', effect: { type: 'cultivate_speed', value: 0.1 }, price: 8000, desc: '修炼速度+10%', icon: '💊' },
            '定神丹': { quality: 'precious', effect: { type: '渡劫_mindset_protect', value: 0.5 }, price: 12000, desc: '渡劫心境消耗-50%', icon: '💊' }
        };


export const TREASURES = {
            '青锋剑': { type: 'weapon', quality: 'common', effect: { type: 'attack', value: 0.1 }, price: 150, desc: '攻击+10%', icon: '⚔️' },
            '玄铁盾': { type: 'armor', quality: 'common', effect: { type: 'defense', value: 0.1 }, price: 150, desc: '防御+10%', icon: '🛡️' },
            '聚灵阵': { type: 'accessory', quality: 'rare', effect: { type: 'cultivate_qi_rate', value: 0.2 }, price: 800, desc: '修炼灵气+20%', icon: '📿' },
            '避火罩': { type: 'armor', quality: 'rare', effect: { type: '渡劫_damage_reduce', value: 0.3 }, price: 1500, desc: '渡劫伤害-30%', icon: '🔥' },
            '缩地符': { type: 'accessory', quality: 'rare', effect: { type: 'escape', value: 0.5 }, price: 600, desc: '逃跑成功率+50%', icon: '📜' },
            '天机镜': { type: 'accessory', quality: 'precious', effect: { type: 'foresee_event', value: 1 }, price: 8000, desc: '预知事件类型', icon: '🔮' },
            '混元珠': { type: 'accessory', quality: 'legendary', effect: { type: 'all_stats', value: 0.05 }, price: 40000, desc: '全属性+5%', icon: '珠' }
        };


export const HEAVENLY_DAO_EQUIPMENTS = {
            '天道剑·永恒': {
                type: 'weapon', quality: 'ultimate', slot: 0,
                baseEffect: { type: 'attack', value: 0.30 },
                lawEffect: { type: 'time_reversal', desc: '时间法则：战斗中有20%概率回溯一回合' },
                price: 500000, desc: '攻击+30%', icon: '⚔️',
                evolutionReq: { item: '青云剑', star: 9, stones: 100000 }
            },
            '天盾·不灭': {
                type: 'armor', quality: 'ultimate', slot: 1,
                baseEffect: { type: 'defense', value: 0.30 },
                lawEffect: { type: 'immortal_shield', desc: '不朽法则：受到致命伤害时免疫一次，每场战斗限一次' },
                price: 500000, desc: '防御+30%', icon: '🛡️',
                evolutionReq: { item: '玄铁盾', star: 9, stones: 100000 }
            },
            '天命珠·轮回': {
                type: 'accessory', quality: 'ultimate', slot: 2,
                baseEffect: { type: 'all_stats', value: 0.15 },
                lawEffect: { type: 'reincarnation_blessing', desc: '轮回法则：死亡时25%概率保留50%修为转世' },
                price: 800000, desc: '全属性+15%', icon: '🔮',
                evolutionReq: { item: '混元珠', star: 9, stones: 150000 }
            },
            '天罚令': {
                type: 'heavenly', quality: 'ultimate', slot: 3,
                baseEffect: { type: 'tribulation_power', value: 0.50 },
                lawEffect: { type: 'heavenly_blade', desc: '天罚法则：渡劫伤害+50%，渡劫成功率+25%' },
                price: 1000000, desc: '渡劫之力+50%', icon: '👑',
                evolutionReq: null // 天罚令只能通过天劫奖励或特殊奇遇获得
            },
            '道种': {
                type: 'heavenly', quality: 'ultimate', slot: 3,
                baseEffect: { type: 'cultivation_speed', value: 0.30 },
                lawEffect: { type: 'dao_seed', desc: '道种法则：修炼时有概率触发顿悟，修为翻倍' },
                price: 800000, desc: '修炼速度+30%', icon: '🌱',
                evolutionReq: null // 道种只能通过顿悟奇遇获得
            },
            '因果镜': {
                type: 'heavenly', quality: 'ultimate', slot: 3,
                baseEffect: { type: 'serendipity_rate', value: 0.40 },
                lawEffect: { type: 'karma_sight', desc: '因果法则：可窥探事件因果，吉凶提前预知' },
                price: 600000, desc: '奇遇率+40%', icon: '🪞',
                evolutionReq: null
            }
        };


export const HEAVENLY_DAO_SET_BONUSES = {
            '天道套装': {
                pieces: ['天道剑·永恒', '天盾·不灭', '天命珠·轮回'],
                count: 3,
                stats: { attackPercent: 0.25, defensePercent: 0.25, all_stats: 0.10 },
                twoPiece: '攻击+25%，防御+25%',
                threePiece: '全属性+10%，解锁【天命】被动：每回合恢复1%最大生命',
                skill: '天命：受到致命伤害时，消耗天道气息复活，恢复30%生命，每日限一次'
            },
            '法则套装': {
                pieces: ['天罚令', '道种', '因果镜'],
                count: 3,
                stats: { tribulation_power: 0.30, cultivation_speed: 0.25, serendipity_rate: 0.20 },
                twoPiece: '渡劫+30%，修炼+25%',
                threePiece: '奇遇+20%，解锁【道法自然】被动：所有概率加成额外+15%',
                skill: '道法自然：所有概率触发效果提升15%，包括暴击、闪避、顿悟等'
            },
            '终极套装': {
                pieces: ['天道剑·永恒', '天盾·不灭', '天命珠·轮回', '天罚令', '道种', '因果镜'],
                count: 6,
                stats: { attackPercent: 0.30, defensePercent: 0.30, all_stats: 0.20, critPercent: 0.15 },
                twoPiece: '攻击+30%，防御+30%',
                threePiece: '全属性+20%，暴击+15%',
                sixPiece: '解锁【超脱】被动：渡劫必定成功，修炼速度翻倍，寿元无限制',
                skill: '超脱：免疫一切负面状态，寿元耗尽时自动进入轮回转世，保留全部属性加成'
            }
        };


export const COMBAT_TREASURES = {
            '青云剑': { type: 'weapon', quality: 'common', effect: { attackBonus: 0.15 }, desc: '攻击+15%', icon: '⚔️', price: 300 },
            '玄铁盾': { type: 'armor', quality: 'common', effect: { defenseBonus: 0.2 }, desc: '防御+20%', icon: '🛡️', price: 250 },
            '混元珠': { type: 'weapon', quality: 'rare', effect: { critBonus: 0.1 }, desc: '暴击率+10%', icon: '🔮', price: 600 },
            '金缕衣': { type: 'armor', quality: 'rare', effect: { hpBonus: 0.1 }, desc: '生命+10%', icon: '👘', price: 400 },
            '避火罩': { type: 'armor', quality: 'rare', effect: { fireResist: 0.3 }, desc: '火法抗性+30%', icon: '🔥', price: 500 },
            '雷霆铛': { type: 'weapon', quality: 'precious', effect: { thunderBonus: 0.25 }, desc: '雷法伤害+25%', icon: '⚡', price: 5000 },
            '赤焰刀': { type: 'weapon', quality: 'precious', effect: { fireBonus: 0.25 }, desc: '火法伤害+25%', icon: '🔪', price: 5000 },
            '寒冰剑': { type: 'weapon', quality: 'precious', effect: { waterBonus: 0.25 }, desc: '水法伤害+25%', icon: '❄️', price: 5000 },
            '金刚杵': { type: 'weapon', quality: 'precious', effect: { bodyBonus: 0.25 }, desc: '体术伤害+25%', icon: '🔨', price: 5000 }
        };


export const COMBAT_PILLS = {
            '聚灵丹': { effect: { type: 'attackBoost', value: 0.2 }, desc: '攻击+20%', icon: '💊', price: 600 },
            '护体丹': { effect: { type: 'defenseBoost', value: 0.2 }, desc: '防御+20%', icon: '💊', price: 600 },
            '破妄丹': { effect: { type: 'ignoreDefense', value: 1 }, desc: '无视防御', icon: '💊', price: 4000 },
            '回春丹': { effect: { type: 'heal', value: 0.3 }, desc: '恢复30%生命', icon: '💊', price: 500 }
        };


export const ENHANCE_CONFIG = {
            // 1→2, 2→3, ... : [玄铁, 天材, 混沌石, 灵石]
            costs: {
                1: { iron: 3,  heavenly: 0, chaos: 0, stones: 200 },
                2: { iron: 5,  heavenly: 0, chaos: 0, stones: 400 },
                3: { iron: 8,  heavenly: 0, chaos: 0, stones: 800 },
                4: { iron: 10, heavenly: 1, chaos: 0, stones: 1500 },
                5: { iron: 12, heavenly: 2, chaos: 0, stones: 3000 },
                6: { iron: 15, heavenly: 3, chaos: 0, stones: 6000 },
                7: { iron: 0,  heavenly: 5, chaos: 1, stones: 15000 },
                8: { iron: 0,  heavenly: 8, chaos: 2, stones: 30000 },
                9: { iron: 0,  heavenly: 10, chaos: 3, stones: 60000 }
            },
            // 每级基础成功率（1→2用costs[1]）
            successRates: {
                1: 0.85, 2: 0.80, 3: 0.75, 4: 0.65, 5: 0.55,
                6: 0.45, 7: 0.35, 8: 0.30, 9: 0.25
            },
            // 每级强化后属性倍率
            starMultipliers: {
                1: 1.0, 2: 1.15, 3: 1.35, 4: 1.60, 5: 1.90,
                6: 2.25, 7: 2.70, 8: 3.20, 9: 4.00
            },
            // 炼器台等级限制可强化的最高星级
            anvilStarLimit: { 1: 3, 2: 6, 3: 9 }
        };


export const FURNACES = {
            '土炼丹炉': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼丹炉' },
            '玄火丹炉': { level: 2, successBonus: 0.15, cost: 50000, unlockCondition: '宗门2级或50000灵石', desc: '中级炼丹炉，成功率+15%' },
            '天玄神炉': { level: 3, successBonus: 0.30, cost: 200000, unlockCondition: '化神期', desc: '高级炼丹炉，成功率+30%' }
        };


export const ANVILS = {
            '土炼器台': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼器台' },
            '玄铁熔炉': { level: 2, successBonus: 0.15, cost: 80000, unlockCondition: '宗门2级或80000灵石', desc: '中级炼器台，成功率+15%' },
            '天工神炉': { level: 3, successBonus: 0.30, cost: 300000, unlockCondition: '化神期', desc: '高级炼器台，成功率+30%' }
        };


export const ALCHEMY_RECIPES = {
            '回气丹': { materials: { '灵草': 3 }, successRate: 0.80, fuelCost: 100, desc: '恢复20%灵力', icon: '💊' },
            '疗伤丹': { materials: { '灵草': 2, '妖兽血': 1 }, successRate: 0.75, fuelCost: 100, desc: '恢复30%生命', icon: '💊' },
            '聚灵丹': { materials: { '灵石': 100, '灵草': 5 }, successRate: 0.60, fuelCost: 100, desc: '修炼速度+20%，持续3天', icon: '💊' },
            '破境丹': { materials: { '灵石': 500, '天材': 2 }, successRate: 0.40, fuelCost: 100, desc: '突破瓶颈概率+15%', icon: '💊' },
            '渡劫丹': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.30, fuelCost: 100, desc: '渡劫成功率+10%', icon: '💊' },
            '洗髓丹': { materials: { '天材': 3, '灵石': 500 }, successRate: 0.50, fuelCost: 100, desc: '灵根刷新', icon: '💊' },
            '混沌丹': { materials: { '混沌石': 1, '天材': 10 }, successRate: 0.20, fuelCost: 100, desc: '保底混沌灵根', icon: '💊', requireChaos: true }
        };


export const FORGE_RECIPES = {
            '凡铁剑': { materials: { '玄铁': 5 }, successRate: 0.90, fuelCost: 200, effect: { type: 'attack', value: 0.05 }, desc: '攻击+5%', icon: '⚔️' },
            '青云剑': { materials: { '玄铁': 10, '天材': 1 }, successRate: 0.60, fuelCost: 200, effect: { type: 'attack', value: 0.15 }, desc: '攻击+15%', icon: '⚔️' },
            '混元珠': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.40, fuelCost: 200, effect: { type: 'crit', value: 0.10 }, desc: '暴击+10%', icon: '🔮' },
            '金缕衣': { materials: { '天材': 3, '妖兽皮': 5 }, successRate: 0.50, fuelCost: 200, effect: { type: 'hp', value: 0.10 }, desc: '生命+10%', icon: '👘' },
            '避火罩': { materials: { '天材': 2, '妖兽骨': 5 }, successRate: 0.45, fuelCost: 200, effect: { type: 'fireResist', value: 0.30 }, desc: '火抗+30%', icon: '🔥' },
            '定神珠': { materials: { '天材': 5, '灵石': 2000 }, successRate: 0.35, fuelCost: 200, effect: { type: 'mindset', value: 0.20 }, desc: '精神状态+20%', icon: '📿' }
        };


export const MATERIALS = {
            '灵草': { type: 'herb', basePrice: 100, icon: '🌿', desc: '普通灵草，炼丹材料' },
            '妖兽血': { type: 'beast', basePrice: 200, icon: '🩸', desc: '妖兽血液，炼丹炼器材料' },
            '天材': { type: 'rare', basePrice: 500, icon: '✨', desc: '稀有天材，高级材料' },
            '混沌石': { type: 'legendary', basePrice: 1667, icon: '💎', desc: '混沌神石，传说材料', requireChaos: true },
            '玄铁': { type: 'metal', basePrice: 100, icon: '🔩', desc: '玄铁矿物，炼器材料' },
            '妖兽皮': { type: 'beast', basePrice: 180, icon: '🐾', desc: '妖兽皮毛，炼器材料' },
            '妖兽骨': { type: 'beast', basePrice: 220, icon: '🦴', desc: '妖兽骨骼，炼器材料' }
        };


export const ADVANCED_FORGE_RECIPES = {
            '灵宝·苍穹印': { 
                materials: { '玄铁': 20, '天材': 5, '混沌石': 1 }, 
                fuelCost: 2000, 
                desc: '灵宝·攻击+25%', icon: '🔮', 
                effect: { type: 'attack', value: 0.25 }
            },
            '灵宝·玄武甲': { 
                materials: { '玄铁': 20, '天材': 5, '混沌石': 1 }, 
                fuelCost: 2000, 
                desc: '灵宝·防御+25%', icon: '🛡️', 
                effect: { type: 'defense', value: 0.25 }
            },
            '圣器·天使神剑': { 
                materials: { '天材': 10, '混沌石': 3 }, 
                fuelCost: 8000, 
                desc: '圣器·攻击+40%', icon: '⚔️', 
                effect: { type: 'attack', value: 0.40 }
            },
            '圣器·天使神甲': { 
                materials: { '天材': 10, '混沌石': 3 }, 
                fuelCost: 8000, 
                desc: '圣器·防御+40%', icon: '👘', 
                effect: { type: 'defense', value: 0.40 }
            },
            '圣器·天使神翼': { 
                materials: { '天材': 10, '混沌石': 3 }, 
                fuelCost: 8000, 
                desc: '圣器·全属性+15%', icon: '👼', 
                effect: { type: 'all_stats', value: 0.15 }
            },
            '天神器·天使神剑': { 
                materials: { '天材': 20, '混沌石': 8 }, 
                fuelCost: 20000, 
                desc: '天神器·攻击+60%', icon: '⚔️', 
                effect: { type: 'attack', value: 0.60 }
            },
            '天神器·天使神甲': { 
                materials: { '天材': 20, '混沌石': 8 }, 
                fuelCost: 20000, 
                desc: '天神器·防御+60%', icon: '👘', 
                effect: { type: 'defense', value: 0.60 }
            },
            '天神器·天使神翼': { 
                materials: { '天材': 20, '混沌石': 8 }, 
                fuelCost: 20000, 
                desc: '天神器·全属性+25%', icon: '👼', 
                effect: { type: 'all_stats', value: 0.25 }
            }
        };


export const CELESTIAL_ITEMS = {
            // 仙丹类
            '九转金丹': { icon: '💫', type: 'pill', price: 50, desc: '服用后境界提升一级', effect: { type: 'realm_boost', value: 1 } },
            '蟠桃': { icon: '🍑', type: 'pill', price: 30, desc: '寿命+100年', effect: { type: 'lifespan', value: 100 } },
            '人参果': { icon: '🍎', type: 'pill', price: 25, desc: '最大灵气+500', effect: { type: 'max_qi', value: 500 } },
            '太乙丹': { icon: '✨', type: 'pill', price: 40, desc: '修炼速度+50%，持续7天', effect: { type: 'cultivate_speed_immortal', value: 0.5, duration: 7 } },
            '琉璃丹': { icon: '🔮', type: 'pill', price: 35, desc: '所有属性+20%', effect: { type: 'all_stats', value: 0.2 } },
            // 仙宝类
            '玲珑塔': { icon: '🏰', type: 'treasure', price: 80, desc: '装备后受到伤害-30%', effect: { type: 'defense', value: 0.3 } },
            '捆仙索': { icon: '🪢', type: 'treasure', price: 75, desc: '斗法中敌人逃跑概率+50%', effect: { type: 'escape', value: 0.5 } },
            '玄天镜': { icon: '🪞', type: 'treasure', price: 60, desc: '每日首次奇遇必定触发', effect: { type: 'serendipity_boost', value: 1.0 } },
            '昊天印': { icon: '👑', type: 'treasure', price: 100, desc: '攻击+50%', effect: { type: 'attack', value: 0.5 } },
            // 投资领域
            '灵药园': { icon: '🌿', type: 'investment', baseCost: 20, dailyReturn: 3, duration: 30, desc: '种植灵药，每日产出仙石' },
            '仙丹坊': { icon: '⚗️', type: 'investment', baseCost: 50, dailyReturn: 8, duration: 25, desc: '炼制仙丹，利润丰厚' },
            '法宝阁': { icon: '⚔️', type: 'investment', baseCost: 80, dailyReturn: 15, duration: 20, desc: '出售法宝，回报极高' },
            '天机楼': { icon: '🔮', type: 'investment', baseCost: 120, dailyReturn: 25, duration: 15, desc: '情报生意，日进斗金' }
        };


export const EXCHANGE_TIERS = [
            { min: 0, rate: 100, name: '凡俗兑换' },
            { min: 1000, rate: 95, name: '小有所成' },
            { min: 10000, rate: 90, name: '富甲一方' },
            { min: 50000, rate: 85, name: '仙家贵宾' },
            { min: 100000, rate: 80, name: '仙界豪商' }
        ];


export const CELESTIAL_REPUTATION_LEVELS = [
            { min: 0, name: '无名之辈', bonus: 0 },
            { min: 100, name: '初入仙界', bonus: 0.05 },
            { min: 500, name: '小有名气', bonus: 0.10 },
            { min: 2000, name: '仙界红人', bonus: 0.15 },
            { min: 5000, name: '一方巨擘', bonus: 0.20 },
            { min: 20000, name: '仙界传奇', bonus: 0.30 }
        ];


