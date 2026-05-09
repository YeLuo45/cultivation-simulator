// Auto-generated module: config.js
'use strict';

        // --- CONFIG (3-11) ---
        const CONFIG = {
            realms: ['炼气', '筑基', '金丹', '元婴', '化神'],
            stages: ['初期', '中期', '后期'],
            stageNames: ['凡人', '修士', '真人', '天君', '大能'],
            apiUrl: 'https://api.minimaxi.com/v1/chat/completions',
            storageKey: 'cultivationSave',
            apiConfigKey: 'cultivationApiConfig',
            miniMaxConfigKey: 'cultivationMiniMaxConfig'
        };

        // --- PILLS (15-23) ---
        const PILLS = {
            '聚灵丹': { quality: 'common', effect: { type: 'qi', value: 50 }, price: 30, desc: '恢复50灵气', icon: '💊' },
            '心魔丹': { quality: 'common', effect: { type: 'mindset', value: 30 }, price: 40, desc: '恢复30心境', icon: '💊' },
            '金髓丹': { quality: 'rare', effect: { type: 'qi', value: 200 }, price: 100, desc: '恢复200灵气', icon: '💊' },
            '筑基丹': { quality: 'rare', effect: { type: 'breakthrough_boost', value: 0.2 }, price: 1200, desc: '突破成功率+20%', icon: '💊' },
            '破境丹': { quality: 'precious', effect: { type: 'breakthrough_boost', value: 0.3 }, price: 5000, desc: '突破+30%', icon: '💊' },
            '洗髓丹': { quality: 'precious', effect: { type: 'cultivate_speed', value: 0.1 }, price: 8000, desc: '修炼速度+10%', icon: '💊' },
            '定神丹': { quality: 'precious', effect: { type: '渡劫_mindset_protect', value: 0.5 }, price: 12000, desc: '渡劫心境消耗-50%', icon: '💊' }
        };

        // --- TREASURES (27-35) ---
        const TREASURES = {
            '青锋剑': { type: 'weapon', quality: 'common', effect: { type: 'attack', value: 0.1 }, price: 150, desc: '攻击+10%', icon: '⚔️' },
            '玄铁盾': { type: 'armor', quality: 'common', effect: { type: 'defense', value: 0.1 }, price: 150, desc: '防御+10%', icon: '🛡️' },
            '聚灵阵': { type: 'accessory', quality: 'rare', effect: { type: 'cultivate_qi_rate', value: 0.2 }, price: 800, desc: '修炼灵气+20%', icon: '📿' },
            '避火罩': { type: 'armor', quality: 'rare', effect: { type: '渡劫_damage_reduce', value: 0.3 }, price: 1500, desc: '渡劫伤害-30%', icon: '🔥' },
            '缩地符': { type: 'accessory', quality: 'rare', effect: { type: 'escape', value: 0.5 }, price: 600, desc: '逃跑成功率+50%', icon: '📜' },
            '天机镜': { type: 'accessory', quality: 'precious', effect: { type: 'foresee_event', value: 1 }, price: 8000, desc: '预知事件类型', icon: '🔮' },
            '混元珠': { type: 'accessory', quality: 'legendary', effect: { type: 'all_stats', value: 0.05 }, price: 40000, desc: '全属性+5%', icon: '珠' }
        };

        // --- COMBAT_TREASURES (39-49) ---
        const COMBAT_TREASURES = {
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

        // --- COMBAT_PILLS (53-58) ---
        const COMBAT_PILLS = {
            '聚灵丹': { effect: { type: 'attackBoost', value: 0.2 }, desc: '攻击+20%', icon: '💊', price: 600 },
            '护体丹': { effect: { type: 'defenseBoost', value: 0.2 }, desc: '防御+20%', icon: '💊', price: 600 },
            '破妄丹': { effect: { type: 'ignoreDefense', value: 1 }, desc: '无视防御', icon: '💊', price: 4000 },
            '回春丹': { effect: { type: 'heal', value: 0.3 }, desc: '恢复30%生命', icon: '💊', price: 500 }
        };

        // --- ENHANCE_CONFIG (61-86) ---
        const ENHANCE_CONFIG = {
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

        // --- TRIBULATIONS (888-934) ---
        const TRIBULATIONS = {
            '金丹初期雷劫': {
                type: 'thunder',
                realm: 3,
                stage: '初期',
                baseRate: 0.6,
                stages: 3,
                damage: 30,
                desc: '九天神雷，淬体锻魂'
            },
            '金丹中期阴火': {
                type: 'fire',
                realm: 3,
                stage: '中期',
                baseRate: 0.5,
                stages: 5,
                damage: 40,
                desc: '琉璃阴火，焚心烧魄'
            },
            '金丹后期风劫': {
                type: 'wind',
                realm: 3,
                stage: '后期',
                baseRate: 0.4,
                stages: 7,
                damage: 50,
                desc: '九幽阴风，刮骨伐髓'
            },
            '元婴心魔': {
                type: 'demon',
                realm: 4,
                stage: '任意',
                baseRate: 0.4,
                stages: 9,
                damage: 0,
                desc: '心魔滋生，最难渡'
            },
            '化神飞升': {
                type: 'all',
                realm: 5,
                stage: '后期',
                baseRate: 0.2,
                stages: 9,
                damage: 60,
                desc: '飞升之劫，成败在此一举'
            }
        };

        // --- FURNACES (939-943) ---
        const FURNACES = {
            '土炼丹炉': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼丹炉' },
            '玄火丹炉': { level: 2, successBonus: 0.15, cost: 50000, unlockCondition: '宗门2级或50000灵石', desc: '中级炼丹炉，成功率+15%' },
            '天玄神炉': { level: 3, successBonus: 0.30, cost: 200000, unlockCondition: '化神期', desc: '高级炼丹炉，成功率+30%' }
        };

        // --- ANVILS (947-951) ---
        const ANVILS = {
            '土炼器台': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼器台' },
            '玄铁熔炉': { level: 2, successBonus: 0.15, cost: 80000, unlockCondition: '宗门2级或80000灵石', desc: '中级炼器台，成功率+15%' },
            '天工神炉': { level: 3, successBonus: 0.30, cost: 300000, unlockCondition: '化神期', desc: '高级炼器台，成功率+30%' }
        };

        // --- ALCHEMY_RECIPES (954-962) ---
        const ALCHEMY_RECIPES = {
            '回气丹': { materials: { '灵草': 3 }, successRate: 0.80, fuelCost: 100, desc: '恢复20%灵力', icon: '💊' },
            '疗伤丹': { materials: { '灵草': 2, '妖兽血': 1 }, successRate: 0.75, fuelCost: 100, desc: '恢复30%生命', icon: '💊' },
            '聚灵丹': { materials: { '灵石': 100, '灵草': 5 }, successRate: 0.60, fuelCost: 100, desc: '修炼速度+20%，持续3天', icon: '💊' },
            '破境丹': { materials: { '灵石': 500, '天材': 2 }, successRate: 0.40, fuelCost: 100, desc: '突破瓶颈概率+15%', icon: '💊' },
            '渡劫丹': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.30, fuelCost: 100, desc: '渡劫成功率+10%', icon: '💊' },
            '洗髓丹': { materials: { '天材': 3, '灵石': 500 }, successRate: 0.50, fuelCost: 100, desc: '灵根刷新', icon: '💊' },
            '混沌丹': { materials: { '混沌石': 1, '天材': 10 }, successRate: 0.20, fuelCost: 100, desc: '保底混沌灵根', icon: '💊', requireChaos: true }
        };

        // --- FORGE_RECIPES (965-972) ---
        const FORGE_RECIPES = {
            '凡铁剑': { materials: { '玄铁': 5 }, successRate: 0.90, fuelCost: 200, effect: { type: 'attack', value: 0.05 }, desc: '攻击+5%', icon: '⚔️' },
            '青云剑': { materials: { '玄铁': 10, '天材': 1 }, successRate: 0.60, fuelCost: 200, effect: { type: 'attack', value: 0.15 }, desc: '攻击+15%', icon: '⚔️' },
            '混元珠': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.40, fuelCost: 200, effect: { type: 'crit', value: 0.10 }, desc: '暴击+10%', icon: '🔮' },
            '金缕衣': { materials: { '天材': 3, '妖兽皮': 5 }, successRate: 0.50, fuelCost: 200, effect: { type: 'hp', value: 0.10 }, desc: '生命+10%', icon: '👘' },
            '避火罩': { materials: { '天材': 2, '妖兽骨': 5 }, successRate: 0.45, fuelCost: 200, effect: { type: 'fireResist', value: 0.30 }, desc: '火抗+30%', icon: '🔥' },
            '定神珠': { materials: { '天材': 5, '灵石': 2000 }, successRate: 0.35, fuelCost: 200, effect: { type: 'mindset', value: 0.20 }, desc: '精神状态+20%', icon: '📿' }
        };

        // --- MATERIALS (976-984) ---
        const MATERIALS = {
            '灵草': { type: 'herb', basePrice: 100, icon: '🌿', desc: '普通灵草，炼丹材料' },
            '妖兽血': { type: 'beast', basePrice: 200, icon: '🩸', desc: '妖兽血液，炼丹炼器材料' },
            '天材': { type: 'rare', basePrice: 500, icon: '✨', desc: '稀有天材，高级材料' },
            '混沌石': { type: 'legendary', basePrice: 1667, icon: '💎', desc: '混沌神石，传说材料', requireChaos: true },
            '玄铁': { type: 'metal', basePrice: 100, icon: '🔩', desc: '玄铁矿物，炼器材料' },
            '妖兽皮': { type: 'beast', basePrice: 180, icon: '🐾', desc: '妖兽皮毛，炼器材料' },
            '妖兽骨': { type: 'beast', basePrice: 220, icon: '🦴', desc: '妖兽骨骼，炼器材料' }
        };

        // --- ADVANCED_FORGE_RECIPES (988-1037) ---
        const ADVANCED_FORGE_RECIPES = {
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

        // --- SERENDIPITY_EVENTS (1041-1265) ---
        const SERENDIPITY_EVENTS = {
            // 正面奇遇
            '古修士传承': {
                type: 'positive',
                icon: '📜',
                minRealm: 2, // 金丹及以上
                effect: (state) => {
                    const rewards = [
                        { type: 'spiritStones', value: Math.floor(1000 + Math.random() * 2000) },
                        { type: 'technique', value: 1 }
                    ];
                    const reward = rewards[Math.floor(Math.random() * rewards.length)];
                    if (reward.type === 'spiritStones') {
                        state.spiritStones += reward.value;
                        return { title: '古修士传承', text: `获得前辈遗留的 ${reward.value} 灵石！`, effects: [{ type: '灵石', value: reward.value, positive: true }] };
                    } else {
                        return { title: '古修士传承', text: '获得高阶功法传承！', effects: [{ type: '功法', value: 1, positive: true }] };
                    }
                }
            },
            '秘境入口': {
                type: 'positive',
                icon: '🌀',
                minRealm: 0,
                effect: (state) => {
                    state.currentEvent = { type: '秘境入口', inProgress: true };
                    return { title: '秘境入口', text: '发现一处神秘秘境入口，进入可能获得稀有奖励！', effects: [], showRealmBattle: true };
                }
            },
            '神兽认主': {
                type: 'positive',
                icon: '🦅',
                minRealm: 3, // 元婴及以上
                effect: (state) => {
                    const bonuses = [
                        { type: 'attack', value: 0.1 },
                        { type: 'defense', value: 0.1 },
                        { type: 'cultivate_speed', value: 0.05 }
                    ];
                    const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
                    state.activeEffects[bonus.type] += bonus.value;
                    return { title: '神兽认主', text: `神兽与你结缘，${bonus.type === 'attack' ? '攻击' : bonus.type === 'defense' ? '防御' : '修炼速度'}+${Math.round(bonus.value * 100)}%！`, effects: [{ type: bonus.type === 'attack' ? '攻击' : bonus.type === 'defense' ? '防御' : '修炼速度', value: Math.round(bonus.value * 100) + '%', positive: true }] };
                }
            },
            '仙人指路': {
                type: 'positive',
                icon: '🧙',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.serendipityBoostEndDay = state.days + 3;
                    state.activeEffects.serendipity_boost = 0.15;
                    return { title: '仙人指路', text: '仙人指点，突破成功率+30%，持续3天！', effects: [{ type: '突破成功率', value: '+30%', positive: true }] };
                }
            },
            '灵根觉醒': {
                type: 'positive',
                icon: '✨',
                minRealm: 0,
                effect: (state) => {
                    const gain = Math.floor(5 + Math.random() * 10);
                    state.activeEffects.cultivate_speed += gain / 1000;
                    return { title: '灵根觉醒', text: `灵根资质提升，修炼速度+${gain}%！`, effects: [{ type: '修炼速度', value: gain + '%', positive: true }] };
                }
            },
            '顿悟': {
                type: 'positive',
                icon: '💡',
                minRealm: 0,
                effect: (state) => {
                    state.spiritStones += 10000;
                    return { title: '顿悟', text: '修炼中顿悟，获得10000灵石！', effects: [{ type: '灵石', value: 10000, positive: true }] };
                }
            },
            // V7 体质相关奇遇
            '天赐体质·至尊骨': {
                type: 'positive',
                icon: '🦴',
                minRealm: 2, // 金丹及以上
                condition: (state) => !state.constitutions.find(c => c.type === '至尊骨'),
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '天赐体质·至尊骨', inProgress: true, choices: ['接受完整传承', '只取部分精华'] };
                    return { title: '天赐体质·至尊骨', text: '异象降世！骨如金铁，光耀万里……你可否愿接受完整传承？', effects: [], showChoice: true };
                }
            },
            '天赐体质·疾风灵体': {
                type: 'positive',
                icon: '💨',
                minRealm: 1, // 筑基及以上
                condition: (state) => !state.constitutions.find(c => c.type === '疾风灵体'),
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '天赐体质·疾风灵体', inProgress: true, choices: ['与风融为一体', '保持自我意识'] };
                    return { title: '天赐体质·疾风灵体', text: '风之精灵感应你的存在……与风融为一体可获完整灵体，但需冒风险。', effects: [], showChoice: true };
                }
            },
            '天赐体质·重瞳': {
                type: 'positive',
                icon: '👁️',
                minRealm: 3, // 元婴及以上
                condition: (state) => !state.constitutions.find(c => c.type === '重瞳'),
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '天赐体质·重瞳', inProgress: true, choices: ['承受重瞳试炼', '以凡眼视之'] };
                    return { title: '天赐体质·重瞳', text: '天道震怒！重瞳降临将开启你的天眼……试炼凶险，但成功后可看透万物本质。', effects: [], showChoice: true };
                }
            },
            // 负面奇遇
            '心魔入侵': {
                type: 'negative',
                icon: '👹',
                minRealm: 3, // 元婴及以上
                effect: (state) => {
                    const loss = Math.floor(state.spiritStones * 0.3);
                    state.spiritStones -= loss;
                    state.serendipity.luckStatus = 'unlucky';
                    state.serendipity.luckEndDay = state.days + 3;
                    return { title: '心魔入侵', text: `心魔入侵，损失 ${loss} 灵石，运气-，持续3天！`, effects: [{ type: '灵石', value: -loss, positive: false }] };
                }
            },
            '仇家追杀': {
                type: 'negative',
                icon: '⚔️',
                minRealm: 0,
                condition: (state) => state.combat.losses > 0,
                effect: (state) => {
                    const loss = Math.floor(state.spiritStones * 0.5);
                    state.spiritStones -= loss;
                    return { title: '仇家追杀', text: `旧日仇家找上门来，损失 ${loss} 灵石！`, effects: [{ type: '灵石', value: -loss, positive: false }] };
                }
            },
            '魔器诱惑': {
                type: 'negative',
                icon: '🗡️',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '魔器诱惑', inProgress: true };
                    return { title: '魔器诱惑', text: '发现一把散发魔气的武器，装备后每回合扣血！', effects: [], showChoice: true };
                }
            },
            '走火入魔': {
                type: 'negative',
                icon: '💀',
                minRealm: 0,
                condition: (state) => state.cultivationProgress > 1000,
                effect: (state) => {
                    if (state.realm > 0) state.realm--;
                    state.cultivationProgress = 0;
                    state.serendipity.luckStatus = 'unlucky';
                    state.serendipity.luckEndDay = state.days + 3;
                    return { title: '走火入魔', text: '修炼过度，走火入魔！境界-1，强制休息！', effects: [{ type: '境界', value: -1, positive: false }] };
                }
            },
            '妖兽袭击': {
                type: 'negative',
                icon: '🐺',
                minRealm: 0,
                effect: (state) => {
                    state.currentEvent = { type: '妖兽袭击', inProgress: true };
                    return { title: '妖兽袭击', text: '遭遇妖兽袭击！', effects: [], showRealmBattle: true, isNegative: true };
                }
            },
            // 中性奇遇
            '乞丐讨缘': {
                type: 'neutral',
                icon: '🙏',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '乞丐讨缘', inProgress: true, choices: ['施舍100灵石', '不给'] };
                    return { title: '乞丐讨缘', text: '路遇乞丐向你讨缘，你会怎么做？', effects: [] };
                }
            },
            '商人交易': {
                type: 'neutral',
                icon: '💰',
                minRealm: 0,
                effect: (state) => {
                    const items = ['聚灵丹', '心魔丹', '金髓丹'];
                    const item = items[Math.floor(Math.random() * items.length)];
                    const cost = Math.floor(100 + Math.random() * 200);
                    if (state.spiritStones >= cost) {
                        state.spiritStones -= cost;
                        addItemToInventory(item, 1);
                        return { title: '商人交易', text: `花费 ${cost} 灵石购买了 ${item}！`, effects: [{ type: '灵石', value: -cost, positive: false }, { type: item, value: 1, positive: true }] };
                    } else {
                        return { title: '商人交易', text: '灵石不足，无法交易！', effects: [] };
                    }
                }
            },
            '散修求助': {
                type: 'neutral',
                icon: '👤',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '散修求助', inProgress: true, choices: ['帮助', '不帮'] };
                    return { title: '散修求助', text: '一位散修请求你帮忙，你会帮助吗？', effects: [] };
                }
            },
            // B1 扩充奇遇
            '天地精华': {
                type: 'positive',
                icon: '🌟',
                minRealm: 0,
                effect: (state) => {
                    const qiGain = Math.floor(state.maxQi * 0.5);
                    state.qi = Math.min(state.maxQi, state.qi + qiGain);
                    return { title: '天地精华', text: `吸收天地精华，灵气+${qiGain}！`, effects: [{ type: '灵气', value: qiGain, positive: true }] };
                }
            },
            '心魔试炼': {
                type: 'negative',
                icon: '👹',
                minRealm: 1, // 筑基及以上
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '心魔试炼', inProgress: true, choices: ['勇敢面对', '退缩'] };
                    return { title: '心魔试炼', text: '识海中浮现心魔化身！你要直面还是退缩？', effects: [], showChoice: true };
                }
            },
            '上古遗迹': {
                type: 'neutral',
                icon: '🏛️',
                minRealm: 2, // 金丹及以上
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '上古遗迹', inProgress: true, choices: ['深入探索', '浅尝辄止', '离开'] };
                    return { title: '上古遗迹', text: '发现一处上古遗迹，灵气浓郁！如何行动？', effects: [], showChoice: true };
                }
            }
        };

        // --- SERENDIPITY_TALISMANS (1268-1273) ---
        const SERENDIPITY_TALISMANS = {
            '祥云符': { type: 'consumable', effect: { type: 'serendipity_boost', value: 0.1 }, duration: 1, price: 2000, desc: '奇遇概率+10%，持续1天', icon: '☁️' },
            '避厄符': { type: 'consumable', effect: { type: 'immune_negative', value: 1 }, duration: 1, price: 1500, desc: '免疫下次负面奇遇', icon: '🛡️' },
            '探路符': { type: 'consumable', effect: { type: 'force_realm', value: 1 }, duration: 0, price: 3000, desc: '指定触发"秘境入口"奇遇', icon: '📜' },
            '还童丹': { type: 'consumable', effect: { type: 'convert_demon', value: 1 }, duration: 0, price: 5000, desc: '将魔器转换为正常法宝', icon: '💊' }
        };

        // --- SPIRIT_ROOT_QUALITIES (1278-1285) ---
        const SPIRIT_ROOT_QUALITIES = {
            '伪灵根': { grade: 0, icon: '🌱', speedBonus: 0.6, bottleneckBonus: 0.4, tribulationBonus: -0.2, weight: 35 },
            '下品灵根': { grade: 1, icon: '🌿', speedBonus: 0.8, bottleneckBonus: 0.2, tribulationBonus: -0.1, weight: 25 },
            '中品灵根': { grade: 2, icon: '🌳', speedBonus: 1.0, bottleneckBonus: 0, tribulationBonus: 0, weight: 20 },
            '上品灵根': { grade: 3, icon: '🌲', speedBonus: 1.3, bottleneckBonus: -0.15, tribulationBonus: 0.1, weight: 12 },
            '天灵根': { grade: 4, icon: '✨', speedBonus: 1.6, bottleneckBonus: -0.25, tribulationBonus: 0.2, weight: 6 },
            '混沌灵根': { grade: 5, icon: '🌈', speedBonus: 2.0, bottleneckBonus: -0.4, tribulationBonus: 0.3, weight: 2 }
        };

        // --- FIVE_ELEMENT_TECHNIQUES (1288-1294) ---
        const FIVE_ELEMENT_TECHNIQUES = {
            '金': { name: '庚金剑诀', icon: '⚔️', bonusType: 'attack', bonusValue: 0.25, threshold: 20 },
            '木': { name: '青木长生诀', icon: '🌿', bonusType: 'heal', bonusValue: 0.5, threshold: 20 },
            '水': { name: '玄冰寒咒', icon: '❄️', bonusType: 'defense', bonusValue: 0.2, threshold: 20 },
            '火': { name: '烈焰真经', icon: '🔥', bonusType: 'attack', bonusValue: 0.2, threshold: 20 },
            '土': { name: '厚土玄功', icon: '🛡️', bonusType: 'resist', bonusValue: 0.25, threshold: 20 }
        };

        // --- CONSTITUTIONS (1297-1360) ---
        const CONSTITUTIONS = {
            '先天道体': {
                icon: '👼',
                desc: '全属性+20%，修炼速度+50%',
                effect: { allStats: 0.2, cultivateSpeed: 0.5 },
                trigger: (state) => state.spiritRoot.quality === '混沌灵根' && state.realm >= 3,
                source: '混沌灵根突破元婴'
            },
            '至尊骨': {
                icon: '🦴',
                desc: '攻击+30%，战斗中暴击+15%',
                effect: { attack: 0.3, crit: 0.15 },
                trigger: () => false, // 只能通过奇遇获得
                source: '随机奇遇'
            },
            '琉璃玉体': {
                icon: '💎',
                desc: '防御+25%，受到伤害-15%',
                effect: { defense: 0.25, damageReduce: 0.15 },
                trigger: (state) => {
                    const grade = SPIRIT_ROOT_QUALITIES[state.spiritRoot.quality].grade;
                    return grade >= 2 && state.realm === 2 && state.cultivationProgress >= REALM_REQUIREMENTS[2].stageThreshold[2];
                },
                source: '中品以上灵根突破金丹'
            },
            '玄冥之体': {
                icon: '🌊',
                desc: '水系功法伤害+40%，水系抗性+50%',
                effect: { waterBonus: 0.4, waterResist: 0.5 },
                trigger: (state) => state.spiritRoot.affinity.water >= 80,
                source: '水属性亲和≥80'
            },
            '烈焰战体': {
                icon: '🔥',
                desc: '火系功法伤害+40%，生命上限+20%',
                effect: { fireBonus: 0.4, hpBonus: 0.2 },
                trigger: (state) => state.spiritRoot.affinity.fire >= 80,
                source: '火属性亲和≥80'
            },
            '疾风灵体': {
                icon: '💨',
                desc: '速度+35%，先手概率+25%',
                effect: { speed: 0.35, firstStrike: 0.25 },
                trigger: () => false, // 只能通过奇遇获得
                source: '随机奇遇'
            },
            '不灭金身': {
                icon: '🛡️',
                desc: '免疫一次致命伤害，每日1次',
                effect: { lethalImmune: 1 },
                trigger: (state) => {
                    const grade = SPIRIT_ROOT_QUALITIES[state.spiritRoot.quality].grade;
                    return grade >= 3 && state.realm === 4 && state.cultivationProgress >= REALM_REQUIREMENTS[4].stageThreshold[2];
                },
                source: '上品以上灵根突破化神'
            },
            '重瞳': {
                icon: '👁️',
                desc: '可预判敌人攻击，闪避+20%',
                effect: { dodge: 0.2, foresee: 1 },
                trigger: () => false, // 只能通过奇遇获得
                source: '随机奇遇'
            }
        };

        // --- REALM_REQUIREMENTS (1483-1489) ---
        const REALM_REQUIREMENTS = {
            0: { maxQi: 100, stageThreshold: [30, 60, 90], breakthroughQi: 100 },
            1: { maxQi: 200, stageThreshold: [60, 120, 180], breakthroughQi: 200 },
            2: { maxQi: 400, stageThreshold: [120, 240, 360], breakthroughQi: 400 },
            3: { maxQi: 800, stageThreshold: [240, 480, 720], breakthroughQi: 800 },
            4: { maxQi: 1600, stageThreshold: [480, 960, 1440], breakthroughQi: 1600 }
        };

        // --- DEFAULT_MINIMAX_CONFIG (1505-1515) ---
        const DEFAULT_MINIMAX_CONFIG = {
            apiKey: '',
            baseUrl: 'https://api.minimaxi.com/v1',
            model: 'MiniMax-M2.7',
            groupId: '',
            features: {
                aiDialogue: false,
                aiSerendipity: false,
                aiTechnique: false
            }
        };

        // --- TECHNIQUE_BONUS (5014-5019) ---
        const TECHNIQUE_BONUS = {
            '雷法': { beats: '体术', losesTo: '火法' },
            '火法': { beats: '雷法', losesTo: '水法' },
            '水法': { beats: '火法', losesTo: '体术' },
            '体术': { beats: '水法', losesTo: '雷法' }
        };

        // --- TECHNIQUE_COLORS (5020-5025) ---
        const TECHNIQUE_COLORS = {
            '雷法': '#ffff00',
            '火法': '#ff4500',
            '水法': '#00bfff',
            '体术': '#228b22'
        };

        // --- SECT_CONFIG (6086-6101) ---
        const SECT_CONFIG = {
            createCost: 50000,
            maxDisciples: { 1: 30, 2: 50, 3: 80 },
            upgradeCost: { 2: 80000, 3: 150000 },
            upgradeDisciples: { 2: 20, 3: 40 },
            buildings: {
                library: { name: '功法阁', icon: '📚', cost: 10000, unlockLevel: 1, desc: '存放可供传承的功法' },
                alchemy: { name: '炼丹房', icon: '⚗️', cost: 20000, unlockLevel: 2, desc: '宗门产出丹药' },
                forge: { name: '炼器室', icon: '🔨', cost: 20000, unlockLevel: 2, desc: '宗门产出法宝' },
                archive: { name: '藏经阁', icon: '🏛️', cost: 50000, unlockLevel: 3, desc: '存放至高功法' }
            },
            talents: ['下品', '中品', '上品', '极品'],
            talentWeights: [0.4, 0.35, 0.2, 0.05],
            techniqueGrades: ['人阶', '灵阶', '天阶', '仙阶'],
            techniqueGradeColors: ['grade-human', 'grade-spirit', 'grade-heaven', 'grade-immortal']
        };

        // --- SECT_TECHNIQUES (6104-6111) ---
        const SECT_TECHNIQUES = {
            '基础练气诀': { grade: 0, effect: { type: 'cultivate_speed', value: 0.05 }, desc: '修炼速度+5%', icon: '📖' },
            '灵根培育法': { grade: 1, effect: { type: 'qi_rate', value: 0.1 }, desc: '灵气获取+10%', icon: '🌱' },
            '天元心法': { grade: 1, effect: { type: 'breakthrough_boost', value: 0.1 }, desc: '突破成功率+10%', icon: '☀️' },
            '金刚炼体术': { grade: 2, effect: { type: 'defense', value: 0.15 }, desc: '防御+15%', icon: '🛡️' },
            '紫霄雷法': { grade: 2, effect: { type: 'attack', value: 0.15 }, desc: '攻击+15%', icon: '⚡' },
            '九转玄天诀': { grade: 3, effect: { type: 'all_stats', value: 0.1 }, desc: '全属性+10%', icon: '🌟' }
        };

