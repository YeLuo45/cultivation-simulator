// domains/shared/constants/cultivation.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Cultivation Domain Constants
// ============================================================================

export const CONFIG = {
            realms: ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'],
            stages: ['初期', '中期', '后期'],
            stageNames: ['凡人', '修士', '真人', '天君', '大能'],
            apiUrl: 'https://api.minimaxi.com/v1/chat/completions',
            storageKey: 'cultivationSave',
            apiConfigKey: 'cultivationApiConfig',
            miniMaxConfigKey: 'cultivationMiniMaxConfig',
            // 云端存档配置
            cloudSaveEnabled: false,
            cloudSaveUrl: 'https://api.github.com/gists',
            cloudSaveGistId: '',
            cloudSaveToken: ''
        };


export const SERENDIPITY_EVENTS = {
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


export const SERENDIPITY_TALISMANS = {
            '祥云符': { type: 'consumable', effect: { type: 'serendipity_boost', value: 0.1 }, duration: 1, price: 2000, desc: '奇遇概率+10%，持续1天', icon: '☁️' },
            '避厄符': { type: 'consumable', effect: { type: 'immune_negative', value: 1 }, duration: 1, price: 1500, desc: '免疫下次负面奇遇', icon: '🛡️' },
            '探路符': { type: 'consumable', effect: { type: 'force_realm', value: 1 }, duration: 0, price: 3000, desc: '指定触发"秘境入口"奇遇', icon: '📜' },
            '还童丹': { type: 'consumable', effect: { type: 'convert_demon', value: 1 }, duration: 0, price: 5000, desc: '将魔器转换为正常法宝', icon: '💊' }
        };


export const SPIRIT_ROOT_QUALITIES = {
            '伪灵根': { grade: 0, icon: '🌱', speedBonus: 0.6, bottleneckBonus: 0.4, tribulationBonus: -0.2, weight: 35 },
            '下品灵根': { grade: 1, icon: '🌿', speedBonus: 0.8, bottleneckBonus: 0.2, tribulationBonus: -0.1, weight: 25 },
            '中品灵根': { grade: 2, icon: '🌳', speedBonus: 1.0, bottleneckBonus: 0, tribulationBonus: 0, weight: 20 },
            '上品灵根': { grade: 3, icon: '🌲', speedBonus: 1.3, bottleneckBonus: -0.15, tribulationBonus: 0.1, weight: 12 },
            '天灵根': { grade: 4, icon: '✨', speedBonus: 1.6, bottleneckBonus: -0.25, tribulationBonus: 0.2, weight: 6 },
            '混沌灵根': { grade: 5, icon: '🌈', speedBonus: 2.0, bottleneckBonus: -0.4, tribulationBonus: 0.3, weight: 2 }
        };


export const FIVE_ELEMENT_TECHNIQUES = {
            '金': { name: '庚金剑诀', icon: '⚔️', bonusType: 'attack', bonusValue: 0.25, threshold: 20 },
            '木': { name: '青木长生诀', icon: '🌿', bonusType: 'heal', bonusValue: 0.5, threshold: 20 },
            '水': { name: '玄冰寒咒', icon: '❄️', bonusType: 'defense', bonusValue: 0.2, threshold: 20 },
            '火': { name: '烈焰真经', icon: '🔥', bonusType: 'attack', bonusValue: 0.2, threshold: 20 },
            '土': { name: '厚土玄功', icon: '🛡️', bonusType: 'resist', bonusValue: 0.25, threshold: 20 }
        };


export const CONSTITUTIONS = {
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


export const REALM_REQUIREMENTS = {
            0: { maxQi: 100, stageThreshold: [30, 60, 90], breakthroughQi: 100 },
            1: { maxQi: 200, stageThreshold: [60, 120, 180], breakthroughQi: 200 },
            2: { maxQi: 400, stageThreshold: [120, 240, 360], breakthroughQi: 400 },
            3: { maxQi: 800, stageThreshold: [240, 480, 720], breakthroughQi: 800 },
            4: { maxQi: 1600, stageThreshold: [480, 960, 1440], breakthroughQi: 1600 },
            5: { maxQi: 3200, stageThreshold: [960, 1920, 2880], breakthroughQi: 3200 }  // 飞升期
        };


export const DEFAULT_MINIMAX_CONFIG = {
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


export const TECHNIQUE_BONUS = {
            '雷法': { beats: '体术', losesTo: '火法' },
            '火法': { beats: '雷法', losesTo: '水法' },
            '水法': { beats: '火法', losesTo: '体术' },
            '体术': { beats: '水法', losesTo: '雷法' }
        };


export const TECHNIQUE_COLORS = {
            '雷法': '#ffff00',
            '火法': '#ff4500',
            '水法': '#00bfff',
            '体术': '#228b22'
        };


export const SECT_CONFIG = {
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


export const PALACE_CONFIG = {
            // 仙宫等级配置
            levelConfig: {
                1: { name: '凡宫', maxRooms: 3, upgradeCost: 0, desc: '初建仙宫，灵气稀薄' },
                2: { name: '灵宫', maxRooms: 5, upgradeCost: 50000, desc: '灵气充沛，可纳弟子' },
                3: { name: '天宫', maxRooms: 8, upgradeCost: 150000, desc: '天界宫阙，万仙来朝' },
                4: { name: '神宫', maxRooms: 12, upgradeCost: 500000, desc: '神圣之地，法则汇聚' },
                5: { name: '圣宫', maxRooms: 20, upgradeCost: 2000000, desc: '至高圣殿，超脱轮回' }
            },
            // 仙宫房间类型
            roomTypes: {
                '修炼殿': { icon: '🧘', cost: 5000, effect: 'cultivate_speed', effectValue: 0.05, desc: '修炼速度+5%' },
                '藏宝阁': { icon: '💎', cost: 8000, effect: 'treasure_bonus', effectValue: 0.1, desc: '宝物获取+10%' },
                '炼丹房': { icon: '⚗️', cost: 10000, effect: 'alchemy_success', effectValue: 0.1, desc: '炼丹成功率+10%' },
                '炼器室': { icon: '🔨', cost: 10000, effect: 'forge_success', effectValue: 0.1, desc: '炼器成功率+10%' },
                '悟道阁': { icon: '📖', cost: 15000, effect: 'mindset_gain', effectValue: 0.1, desc: '心境获取+10%' },
                '聚灵阵': { icon: '🔮', cost: 20000, effect: 'qi_rate', effectValue: 0.15, desc: '灵气获取+15%' },
                '渡劫台': { icon: '⚡', cost: 30000, effect: '渡劫_protect', effectValue: 0.15, desc: '渡劫成功率+15%' },
                '天机殿': { icon: '🔭', cost: 50000, effect: 'serendipity_rate', effectValue: 0.2, desc: '奇遇概率+20%' }
            },
            // 弟子分配工作产出
            workYields: {
                '修炼中': { spiritStones: 0, reputation: 1 },
                '采矿': { spiritStones: 50, reputation: 0 },
                '采药': { spiritStones: 30, reputation: 1 },
                '巡逻': { spiritStones: 20, reputation: 3 },
                '炼丹': { spiritStones: 100, reputation: 2 }
            },
            // 仙宫产出周期(天)
            productionCycle: 1,
            // 最大仙宫弟子
            maxPalaceDisciples: { 1: 5, 2: 10, 3: 20, 4: 40, 5: 80 },
            // 仙宫弟子任务配置
            taskTypes: {
                'cultivate': { name: '闭关修炼', icon: '🧘', desc: '在修炼殿修炼', duration: 3, reward: { spiritStones: 100, reputation: 10 }, requirement: { type: 'room', roomType: '修炼殿' } },
                'mine': { name: '采集灵石', icon: '⛏️', desc: '前往灵矿采集灵石', duration: 2, reward: { spiritStones: 200, reputation: 5 }, requirement: { type: 'discipleCount', count: 1 } },
                'herbal': { name: '采药炼丹', icon: '🌿', desc: '采集灵草并尝试炼丹', duration: 3, reward: { spiritStones: 150, reputation: 15, items: ['丹药'] }, requirement: { type: 'room', roomType: '炼丹房' } },
                'patrol': { name: '巡逻护宫', icon: '🛡️', desc: '巡视仙宫周围', duration: 2, reward: { spiritStones: 80, reputation: 25 }, requirement: { type: 'none' } },
                'forge': { name: '锻造法宝', icon: '🔨', desc: '使用炼器室锻造法宝', duration: 4, reward: { spiritStones: 300, reputation: 20, items: ['法宝'] }, requirement: { type: 'room', roomType: '炼器室' } },
                'study': { name: '研读典籍', icon: '📖', desc: '在藏经阁研读功法', duration: 3, reward: { spiritStones: 50, reputation: 30, exp: 50 }, requirement: { type: 'room', roomType: '悟道阁' } },
                'collect_revenue': { name: '收取贡赋', icon: '💎', desc: '向附庸势力收取贡赋', duration: 5, reward: { spiritStones: 500, reputation: 10 }, requirement: { type: 'palaceLevel', level: 2 } },
                'explore': { name: '探索秘境', icon: '🌀', desc: '组队探索附近秘境', duration: 4, reward: { spiritStones: 400, reputation: 40, items: ['灵草'] }, requirement: { type: 'discipleCount', count: 2 } },
                'defend': { name: '守护仙宫', icon: '⚔️', desc: '抵御外来入侵者', duration: 3, reward: { spiritStones: 250, reputation: 50 }, requirement: { type: 'discipleCount', count: 3 } },
                'diplomacy': { name: '外交往来', icon: '🤝', desc: '与其他势力进行外交', duration: 5, reward: { spiritStones: 100, reputation: 60 }, requirement: { type: 'palaceLevel', level: 3 } }
            },
            // 任务难度对应奖励倍数
            taskDifficultyMultiplier: { easy: 1, normal: 1.5, hard: 2.5 }
        };


export const SECT_TECHNIQUES = {
            '基础练气诀': { grade: 0, effect: { type: 'cultivate_speed', value: 0.05 }, desc: '修炼速度+5%', icon: '📖' },
            '灵根培育法': { grade: 1, effect: { type: 'qi_rate', value: 0.1 }, desc: '灵气获取+10%', icon: '🌱' },
            '天元心法': { grade: 1, effect: { type: 'breakthrough_boost', value: 0.1 }, desc: '突破成功率+10%', icon: '☀️' },
            '金刚炼体术': { grade: 2, effect: { type: 'defense', value: 0.15 }, desc: '防御+15%', icon: '🛡️' },
            '紫霄雷法': { grade: 2, effect: { type: 'attack', value: 0.15 }, desc: '攻击+15%', icon: '⚡' },
            '九转玄天诀': { grade: 3, effect: { type: 'all_stats', value: 0.1 }, desc: '全属性+10%', icon: '🌟' }
        };


export const TECHNIQUE_UPGRADE_MATERIALS = {
            // 人阶(0) -> 灵阶(1): 天材×3 + 灵石200
            0: { materials: { '天材': 3 }, stones: 200 },
            // 灵阶(1) -> 天阶(2): 天材×5 + 混沌石×1 + 灵石500
            1: { materials: { '天材': 5, '混沌石': 1 }, stones: 500 },
            // 天阶(2) -> 仙阶(3): 混沌石×3 + 灵石2000
            2: { materials: { '混沌石': 3 }, stones: 2000 }
        };


export const TECHNIQUE_UPGRADE_EFFECTS = {
            // 人阶基础效果提升
            0: { value: 0.05, desc: '修炼速度+5%' },
            1: { value: 0.10, desc: '灵气获取+10%' },
            2: { value: 0.10, desc: '突破成功率+10%' },
            3: { value: 0.15, desc: '防御+15%' },
            4: { value: 0.15, desc: '攻击+15%' },
            5: { value: 0.10, desc: '全属性+10%' },
            // 灵阶效果提升
            6: { value: 0.10, desc: '修炼速度+10%' },
            7: { value: 0.20, desc: '灵气获取+20%' },
            8: { value: 0.20, desc: '突破成功率+20%' },
            9: { value: 0.25, desc: '防御+25%' },
            10: { value: 0.25, desc: '攻击+25%' },
            11: { value: 0.20, desc: '全属性+20%' },
            // 天阶效果提升
            12: { value: 0.15, desc: '修炼速度+15%' },
            13: { value: 0.30, desc: '灵气获取+30%' },
            14: { value: 0.30, desc: '突破成功率+30%' },
            15: { value: 0.35, desc: '防御+35%' },
            16: { value: 0.35, desc: '攻击+35%' },
            17: { value: 0.30, desc: '全属性+30%' }
        };


