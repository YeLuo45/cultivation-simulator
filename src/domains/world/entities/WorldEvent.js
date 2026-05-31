/**
 * WorldEvent.js - 世界事件实体配置
 * V248: 事件类型: 天灾/奇遇/神迹/浩劫
 */

// 世界事件基础配置 (天灾)
export const WORLD_EVENTS = {
    'earthquake': {
        name: '地震',
        type: '天灾',
        probability: 0.1,
        effect: { spiritStones: -100, health: -20 },
        message: '天崩地裂！大地震动，灵气紊乱！',
        duration: 3,
        isGlobal: true,
        canResist: true
    },
    'drought': {
        name: '大旱',
        type: '天灾',
        probability: 0.08,
        effect: { cultivation: -0.5 },
        message: '赤地千里，灵脉枯竭！',
        duration: 5,
        isGlobal: true,
        canResist: false
    },
    'flood': {
        name: '洪水',
        type: '天灾',
        probability: 0.07,
        effect: { spiritStones: -200, health: -30 },
        message: '洪灾泛滥，灵脉被淹！',
        duration: 4,
        isGlobal: true,
        canResist: true
    },
    'plague': {
        name: '瘟疫',
        type: '天灾',
        probability: 0.06,
        effect: { health: -40, spirit: -20 },
        message: '瘴气弥漫，疫情横行！',
        duration: 6,
        isGlobal: true,
        canResist: true
    },
    'tianzhai': {
        name: '天灾降临',
        type: '天灾',
        probability: 0.1,
        effect: { spiritStones: -100 },
        message: '天灾降临!',
        duration: 3,
        isGlobal: true,
        canResist: true
    }
};

// 浩劫事件配置
export const CATASTROPHE_EVENTS = {
    'demonInvasion': {
        name: '魔界入侵',
        type: '浩劫',
        probability: 0.03,
        effect: { spiritStones: -500, health: -50, reputation: -30 },
        message: '魔界裂缝大开，妖魔大军入侵！',
        duration: 10,
        isGlobal: true,
        canResist: true,
        chaosWeight: 2,
        chaosRequired: 60
    },
    'celestialCalamity': {
        name: '天塌之灾',
        type: '浩劫',
        probability: 0.02,
        effect: { cultivation: -2, realm: -1 },
        message: '天柱崩塌，三界大乱！',
        duration: 15,
        isGlobal: true,
        canResist: false,
        chaosWeight: 3,
        chaosRequired: 80
    },
    'spiritRealmCollapse': {
        name: '灵界崩塌',
        type: '浩劫',
        probability: 0.015,
        effect: { spiritStones: -1000, luck: -20 },
        message: '灵界根基动摇，灵气紊乱！',
        duration: 20,
        isGlobal: true,
        canResist: true,
        chaosWeight: 2.5,
        chaosRequired: 75
    },
    'worldFusion': {
        name: '三界融合',
        type: '浩劫',
        probability: 0.01,
        effect: { chaos: 50, spirit: -30 },
        message: '人魔仙三界壁垒崩塌！',
        duration: 30,
        isGlobal: true,
        canResist: false,
        chaosWeight: 4,
        chaosRequired: 90
    },
    'haoijie': {
        name: '浩劫降临',
        type: '浩劫',
        probability: 0.02,
        effect: { spiritStones: -300 },
        message: '浩劫降临!',
        duration: 10,
        isGlobal: true,
        canResist: true,
        chaosWeight: 2
    }
};

// 神迹事件配置
export const DIVINE_EVENTS = {
    'immortalGuidance': {
        name: '仙人指引',
        type: '神迹',
        probability: 0.05,
        effect: { cultivation: 1.5, luck: 5 },
        message: '仙人显灵，指点迷津！',
        duration: 5,
        isGlobal: false,
        canResist: false,
        minLevel: 5
    },
    'heavenlyBlessing': {
        name: '天赐神佑',
        type: '神迹',
        probability: 0.04,
        effect: { health: 50, spirit: 30 },
        message: '天道眷顾，神光普照！',
        duration: 7,
        isGlobal: false,
        canResist: false
    },
    'divineRevelation': {
        name: '天道启示',
        type: '神迹',
        probability: 0.03,
        effect: { cultivation: 3, realm: 0.5 },
        message: '天道轮回，启示降临！',
        duration: 10,
        isGlobal: false,
        canResist: false,
        minLevel: 8
    },
    'shenji': {
        name: '神迹显现',
        type: '神迹',
        probability: 0.05,
        effect: { cultivation: 1.5 },
        message: '神迹显现!',
        duration: 5,
        isGlobal: true,
        canResist: false,
        minLevel: 3
    },
    'phoenixRevival': {
        name: '凤凰涅槃',
        type: '神迹',
        probability: 0.02,
        effect: { health: 100, spirit: 100, realm: 1 },
        message: '凤凰浴火重生，祥瑞降临！',
        duration: 1,
        isGlobal: false,
        canResist: false,
        minLevel: 10
    },
    'dragonBlessing': {
        name: '真龙祝福',
        type: '神迹',
        probability: 0.025,
        effect: { combat: 0.3, reputation: 50 },
        message: '真龙现世，福泽天下！',
        duration: 15,
        isGlobal: true,
        canResist: false
    }
};

// 奇遇事件配置
export const SERENDIPITY_EVENTS = {
    'ancientInheritance': {
        name: '上古传承',
        type: '奇遇',
        probability: 0.15,
        effect: { cultivation: 2, spiritStones: 200 },
        message: '仙人遗迹!',
        duration: 3,
        isGlobal: false,
        canResist: false,
        minCultivation: 100,
        rarity: 'EPIC'
    },
    'treasureDiscovery': {
        name: '发现宝藏',
        type: '奇遇',
        probability: 0.2,
        effect: { spiritStones: 500 },
        message: '意外发现前人洞府！',
        duration: 1,
        isGlobal: false,
        canResist: false,
        rarity: 'RARE'
    },
    'masterEncounter': {
        name: '名师指点',
        type: '奇遇',
        probability: 0.12,
        effect: { cultivation: 1, comprehension: 2 },
        message: '偶遇高人传授心得！',
        duration: 5,
        isGlobal: false,
        canResist: false,
        rarity: 'RARE'
    },
    'spiritBeastTame': {
        name: '灵兽认主',
        type: '奇遇',
        probability: 0.08,
        effect: { combat: 0.2 },
        message: '灵兽主动追随！',
        duration: 1,
        isGlobal: false,
        canResist: false,
        rarity: 'EPIC'
    },
    'qiYuan': {
        name: '奇遇降临',
        type: '奇遇',
        probability: 0.15,
        effect: { spiritStones: 500 },
        message: '仙人遗迹!',
        duration: 3,
        isGlobal: true,
        canResist: false,
        rarity: 'COMMON'
    },
    'elixirMatured': {
        name: '丹药成熟',
        type: '奇遇',
        probability: 0.18,
        effect: { health: 30, spirit: 20 },
        message: '意外发现成熟灵药！',
        duration: 1,
        isGlobal: false,
        canResist: false,
        rarity: 'COMMON'
    },
    'mysteriousMap': {
        name: '神秘地图',
        type: '奇遇',
        probability: 0.1,
        effect: { luck: 10 },
        message: '获得通往秘境的地图！',
        duration: 1,
        isGlobal: false,
        canResist: false,
        rarity: 'EPIC'
    },
    'legendaryWeapon': {
        name: '神器出世',
        type: '奇遇',
        probability: 0.03,
        effect: { combat: 0.5 },
        message: '神兵利器认主！',
        duration: 1,
        isGlobal: false,
        canResist: false,
        rarity: 'LEGENDARY'
    }
};

// 事件稀有度定义
export const EVENT_RARITIES = {
    COMMON: { name: '普通', weight: 0.6, color: '#fff' },
    RARE: { name: '稀有', weight: 0.25, color: '#00f' },
    EPIC: { name: '史诗', weight: 0.12, color: '#f80' },
    LEGENDARY: { name: '传说', weight: 0.03, color: '#f0f' }
};

// 事件效果类型
export const EVENT_IMPACT_TYPES = {
    SPIRIT_STONES: 'spiritStones',
    CULTIVATION: 'cultivation',
    REALM: 'realm',
    HEALTH: 'health',
    SPIRIT: 'spirit',
    REPUTATION: 'reputation',
    LUCK: 'luck',
    COMBAT: 'combat',
    CHAOS: 'chaos',
    COMPREHENSION: 'comprehension'
};

// 事件历史记录
export function createEventHistory() {
    return {
        events: [],
        totalTriggered: 0,
        byType: {
            '天灾': 0,
            '奇遇': 0,
            '神迹': 0,
            '浩劫': 0
        }
    };
}

/**
 * 获取所有事件配置
 */
export function getAllEvents() {
    return {
        ...WORLD_EVENTS,
        ...CATASTROPHE_EVENTS,
        ...DIVINE_EVENTS,
        ...SERENDIPITY_EVENTS
    };
}

/**
 * 按类型获取事件
 */
export function getEventsByType(type) {
    const allEvents = getAllEvents();
    return Object.values(allEvents).filter(e => e.type === type);
}