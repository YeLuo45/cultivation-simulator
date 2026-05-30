// ===== config.js =====

// --- CONFIG ---
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

// --- IDLE_TASKS ---
export const IDLE_TASKS = {
    'qi_cultivation': { name: '灵气修炼', baseReward: 10, unit: '灵气/小时', duration: 24, realmScale: true },
    'stone_gathering': { name: '灵石采集', baseReward: 50, unit: '灵石/小时', duration: 24, realmScale: true },
    'pill_refining': { name: '丹药炼制', baseReward: 1, unit: '丹药/小时', duration: 12, requires: 'alchemy' },
    'technique_study': { name: '功法领悟', baseReward: 5, unit: '熟练度/小时', duration: 48, realmScale: true },
    'secret_explore': { name: '秘境探索', baseReward: 100, unit: '探索积分/小时', duration: 6, tokenCost: 1, realmScale: true }
};

// --- IDLE_CONFIG ---
export const IDLE_CONFIG = {
    maxConcurrentTasks: 3,
    maxOfflineHours: 24,
    offlineEfficiency: 0.8,
    earningsThreshold: 1000,
    autoSuspendDays: 7
};

// --- NPC_ROLE_REGISTRY ---
export const NPC_ROLE_REGISTRY = {
    'master': {
        role: 'master',
        title: '师尊',
        skills: ['teach', 'assign_task', 'evaluate', 'reward'],
        collaborationWeight: 0.3,
        responseSpeed: 'slow'
    },
    'monster': {
        role: 'monster',
        title: '妖兽',
        skills: ['challenge', 'guard', 'drop_item'],
        collaborationWeight: 0.2,
        responseSpeed: 'fast'
    },
    'merchant': {
        role: 'merchant',
        title: '商人',
        skills: ['trade', 'appraise', 'special_goods'],
        collaborationWeight: 0.25,
        responseSpeed: 'medium'
    },
    'fellow': {
        role: 'fellow',
        title: '同道',
        skills: ['practice_together', 'share_resource', 'mutual_help'],
        collaborationWeight: 0.25,
        responseSpeed: 'medium'
    }
};

// --- PLAN_REVIEW_GATE ---
export const PLAN_REVIEW_GATE = {
    gates: {
        'major_cultivation_advice': { threshold: 0.7, auto_approve: false },
        'rare_item_trade': { threshold: 0.5, auto_approve: false },
        'sect_mission': { threshold: 0.6, auto_approve: true },
        'fellow_help_request': { threshold: 0.4, auto_approve: true }
    },
    shouldBlock(action) {
        const gate = this.gates[action];
        if (!gate) return false;
        return !gate.auto_approve;
    }
};