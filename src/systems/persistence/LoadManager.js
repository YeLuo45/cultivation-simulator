/**
 * LoadManager.js - 持久化加载系统
 * 游戏状态恢复 | 版本迁移 | 数据验证
 */

// ===== 配置 =====
const LOAD_CONFIG = {
    storageKey: 'cultivationSave',
    autoSaveKey: 'cultivation_sim_autosave',
    versionKey: 'cultivation_save_version',
    currentVersion: 95, // 当前游戏版本
    migrationStrategies: new Map() // 版本迁移策略
};

/**
 * 主加载函数 - 从localStorage恢复游戏状态
 */
function loadGame() {
    const saved = localStorage.getItem(LOAD_CONFIG.storageKey);
    
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            
            // 执行版本迁移
            const migrated = migrateIfNeeded(loaded);
            
            // 应用加载的数据，应用默认值
            gameState = applyDefaults(migrated);
            
            // 验证数据完整性
            const validation = validateGameState(gameState);
            if (!validation.valid) {
                console.warn('存档验证警告:', validation.issues);
            }
            
            // 初始化UI
            if (gameState.isGameOver) {
                showGameOverScreen();
            } else {
                showGameUI();
            }
            
            return { success: true, days: gameState.days, version: gameState.version };
            
        } catch (e) {
            console.error('加载失败:', e);
            return { error: e.message };
        }
    } else {
        return { error: 'No save found' };
    }
}

/**
 * 应用默认值 - 确保新增字段存在（向后兼容）
 */
function applyDefaults(loaded) {
    const defaults = {
        // 基础战斗属性
        activeEffects: {
            breakthrough_boost: 0,
            cultivate_speed: 0,
            '渡劫_mindset_protect': 0,
            attack: 0,
            defense: 0,
            cultivate_qi_rate: 0,
            '渡劫_damage_reduce': 0,
            escape: 0,
            foresee_event: 0,
            all_stats: 0,
            serendipity_boost: 0
        },
        
        // 装备
        equippedTreasures: [null, null, null],
        
        // 背包
        inventory: [],
        shopItems: [],
        lastShopDay: 0,
        
        // 渡劫系统
        tribulation: {
            inProgress: false,
            currentStage: 0,
            totalStages: 9,
            currentType: null,
            preparations: [],
            damageTaken: 0,
            tribKey: null
        },
        
        // 转生buff
        hasTransmigrationBuff: false,
        
        // 渡劫记录
        tribulationRecord: [],
        
        // 战斗统计
        combat: {
            wins: 0,
            losses: 0,
            honor: 0,
            fame: 0,
            battleHistory: [],
            injured: false,
            injuryEndDay: 0
        },
        
        // V33 战斗AI学习系统
        combatProfile: {
            playerPatterns: [],
            totalBattles: 0,
            winsAgainst: 0,
            currentEnemy: null,
            learningData: {},
            preferredDistance: null,
            spellUsageRate: 0,
            defenseFrequency: 0,
            attackTiming: []
        },
        
        lastCombatDay: 0,
        
        // V35 宗门互动
        sectMissions: [],
        sectMissionCooldown: 0,
        lastMissionRefreshDay: 0,
        
        // V36 装备打造
        equipmentForgeCount: 0,
        lastForgeDay: 0,
        
        // V37 天道法则
        celestialLaws: {
            comprehended: [],
            active: [],
            comprehending: null,
            comprehendingProgress: 0,
            comprehendDays: 0,
            maxActiveLaws: 3,
            lawBonus: {}
        },
        
        // V38 仙界社交
        immortalAlly: {
            id: null,
            name: '',
            rank: 1,
            role: 'none',
            contribution: 0,
            joinedDay: 0,
            allies: [],
            skillLevel: 0,
            dailyActivity: 0,
            lastActivityDay: 0
        },
        immortalFriends: [],
        allyApplications: [],
        
        // V39 仙宠
        spiritPets: { pets: [], lastInteractionDay: 0 },
        
        // V40 拍卖行
        auction: {
            listings: [],
            frozenFunds: 0,
            playerId: null,
            playerName: null,
            sortType: 'endingSoon'
        },
        
        // V41 经济系统
        economy: {
            currentInflation: 0.02,
            totalIncome: 0,
            totalExpense: 0,
            totalTax: 0,
            totalWealth: 0,
            avgDailyIncome: 50,
            avgDailyExpense: 0,
            luxuryPurchases: 0,
            activeEvents: [],
            economyBuffs: {}
        },
        
        // V42 竞技场
        celestialArena: {
            currentSeason: 1,
            seasonStartTime: Date.now(),
            currentRank: 1,
            highestRank: 1,
            score: 0,
            totalScoreEarned: 0,
            totalWins: 0,
            totalLosses: 0,
            currentStreak: 0,
            longestStreak: 0,
            promotionWins: 0,
            dailyChallengesUsed: 0,
            derankProtection: 2,
            matchHistory: [],
            lastRewardClaimed: 0,
            totalRewardsClaimed: 0,
            bountyPool: 0,
            bountyWins: 0
        },
        
        // V43 仙宫
        palace: {
            level: 1,
            prosperity: 100,
            buildings: [],
            workers: [],
            styleIndex: 0,
            bonus: {
                incomeBonus: 0,
                cultivationSpeed: 0,
                serendipityChance: 0,
                combatPower: 0
            },
            totalWagesPaid: 0
        },
        
        // V44 自创仙法
        customSpells: [],
        essences: {},
        
        // V45 轮回
        karma: {
            points: 0,
            goodKarma: 0,
            evilKarma: 0,
            reincarnationCount: 0,
            pastLifeMemories: []
        },
        
        // 宗门
        sect: {
            name: null,
            level: 0,
            spiritStones: 0,
            disciples: [],
            elders: [],
            buildings: {
                library: false,
                alchemy: false,
                forge: false,
                archive: false
            },
            techniques: [],
            contributionShop: [],
            lastShopRefresh: 0,
            lastResourceCollection: 0,
            npcDialogueHistory: [],
            npcTasks: [],
            npcLastActions: {},
            tribulationRequest: {
                status: 'none',
                elderScore: 0,
                elderComment: '',
                leaderDecision: '',
                leaderComment: '',
                buffApplied: false,
                submitDay: 0
            },
            celestialCycle: {
                day: 0,
                completed: false,
                lastResult: null,
                blessingActive: false,
                cycleInterval: 3
            },
            sectMissions: [],
            sectMissionCooldown: 0
        },
        
        // 奇遇
        serendipity: {
            lastTriggerDay: 0,
            todayCount: 0,
            lastTriggerType: null,
            cooldownTypes: {},
            badLuck: 0,
            currentEvent: null,
            log: [],
            luckStatus: null,
            luckEndDay: 0,
            serendipityBoostEndDay: 0
        },
        
        // V7 灵根
        spiritRootAwakening: {
            status: 'dormant',
            stage: 0,
            triggerDay: 0,
            tasks: [],
            rewards: null,
            lastEventDay: 0,
            attempts: 0
        },
        
        constitutions: [],
        
        // V8 炼器
        crafting: {
            furnace: { level: 1, type: 'alchemy' },
            anvil: { level: 1, type: 'forge' },
            transactionLog: []
        },
        
        // V9 世界地图
        worldMap: {
            currentContinent: '中州',
            currentRegion: '中州城',
            exploredContinents: ['中州'],
            exploredRegions: ['中州城', '中州野外'],
            actionPower: 10,
            maxActionPower: 10,
            continentUnlocks: {
                '中州': 0,
                '南疆': 1,
                '北域': 2,
                '西域': 3,
                '东海': 2,
                '仙界碎片': 4
            },
            bossRefreshDays: {},
            lastTravelDay: 0
        },
        
        // 成就系统
        achievements: {
            unlocked: [],
            titles: [],
            stats: {
                tribulationsCompleted: 0,
                dungeonBossesKilled: 0,
                sectContributions: 0,
                treasuresRefined: 0,
                serendipitiesEncountered: 0,
                flawlessTribulations: 0
            }
        },
        
        // NPC记忆
        npcMemory: [],
        
        // 称号
        title: '筑基修士',
        
        // 离线挂机
        offlineEfficiency: 0.8,
        
        // 保存槽位
        saveSlots: {},
        
        // 历史日志
        combatLogHistory: [],
        eventLogHistory: []
    };
    
    // 合并默认数据
    const result = { ...defaults, ...loaded };
    
    // 深度合并activeEffects
    result.activeEffects = { ...defaults.activeEffects, ...(loaded.activeEffects || {}) };
    
    // 处理灵根（保留唤醒状态）
    if (loaded.spiritRoot) {
        result.spiritRoot = {
            ...loaded.spiritRoot,
            awakeningAvailable: loaded.spiritRoot.awakeningAvailable || false,
            hasAwakened: loaded.spiritRoot.hasAwakened || false,
            awakenedQuality: loaded.spiritRoot.awakenedQuality || null
        };
    }
    
    // 确保神根字段存在
    if (!result.spiritRoot) {
        result.spiritRoot = generateRandomSpiritRoot();
    }
    
    return result;
}

/**
 * 验证游戏状态完整性
 */
function validateGameState(state) {
    const issues = [];
    
    // 检查基础数值
    if (typeof state.realm !== 'number' || state.realm < 1) {
        issues.push('realm invalid');
    }
    
    if (typeof state.spiritStones !== 'number' || state.spiritStones < 0) {
        issues.push('spiritStones invalid');
    }
    
    if (typeof state.days !== 'number' || state.days < 1) {
        issues.push('days invalid');
    }
    
    // 检查数组字段
    if (!Array.isArray(state.inventory)) {
        issues.push('inventory not array');
    }
    
    if (!Array.isArray(state.techniques)) {
        issues.push('techniques not array');
    }
    
    // 检查对象字段
    if (typeof state.combat !== 'object') {
        issues.push('combat not object');
    }
    
    if (typeof state.serendipity !== 'object') {
        issues.push('serendipity not object');
    }
    
    return {
        valid: issues.length === 0,
        issues
    };
}

/**
 * 注册版本迁移策略
 */
function registerMigrationStrategy(fromVersion, toVersion, migrationFn) {
    const key = `${fromVersion}->${toVersion}`;
    LOAD_CONFIG.migrationStrategies.set(key, migrationFn);
}

/**
 * 执行版本迁移
 */
function migrateIfNeeded(data) {
    const saveVersion = data.version || 1;
    const currentVersion = LOAD_CONFIG.currentVersion;
    
    if (saveVersion >= currentVersion) {
        return data; // 不需要迁移
    }
    
    let migrated = { ...data };
    
    // 顺序执行每个版本的迁移
    for (let v = saveVersion + 1; v <= currentVersion; v++) {
        const key = `${v - 1}->${v}`;
        const strategy = LOAD_CONFIG.migrationStrategies.get(key);
        
        if (strategy) {
            migrated = strategy(migrated);
            console.log(`Migrated from v${v - 1} to v${v}`);
        }
    }
    
    migrated.version = currentVersion;
    return migrated;
}

/**
 * 常用迁移策略工厂
 */

// V2迁移 - 添加activeEffects
const migrateV1ToV2 = (data) => {
    data.activeEffects = {
        breakthrough_boost: 0,
        cultivate_speed: 0,
        '渡劫_mindset_protect': 0,
        attack: 0,
        defense: 0
    };
    data.equippedTreasures = [null, null, null];
    return data;
};

// V3迁移 - 添加背包
const migrateV2ToV3 = (data) => {
    data.inventory = data.inventory || [];
    data.shopItems = data.shopItems || [];
    return data;
};

// 注册迁移策略
registerMigrationStrategy(1, 2, migrateV1ToV2);
registerMigrationStrategy(2, 3, migrateV2ToV3);
// 后续版本迁移可以继续注册...

/**
 * 从云端加载存档
 */
async function cloudLoad() {
    const config = getCloudConfig();
    const gistIdInput = document.getElementById('cloudGistId');
    const gistId = gistIdInput ? gistIdInput.value.trim() : '';
    
    const targetGistId = gistId || config.gistId;
    
    if (!config.token) {
        updateCloudStatus('请先填写 GitHub Token', true);
        return { error: 'No token' };
    }
    
    if (!targetGistId) {
        updateCloudStatus('请填写 Gist ID', true);
        return { error: 'No Gist ID' };
    }
    
    updateCloudStatus('正在从云端加载...');
    
    try {
        const response = await fetch(`https://api.github.com/gists/${targetGistId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        const saveFile = result.files['cultivation-save.json'];
        
        if (!saveFile) {
            throw new Error('未找到存档文件');
        }
        
        const loadedData = JSON.parse(saveFile.content);
        
        // 应用存档数据
        gameState = applyDefaults(loadedData);
        
        // 验证
        const validation = validateGameState(gameState);
        if (!validation.valid) {
            console.warn('云端存档验证警告:', validation.issues);
        }
        
        // 保存配置
        saveCloudConfig(config.token, targetGistId, config.autoSave);
        
        // 更新UI
        if (typeof updateDisplay === 'function') updateDisplay();
        if (typeof refreshInventoryUI === 'function') refreshInventoryUI();
        if (typeof renderGameUI === 'function') renderGameUI();
        showGameUI();
        
        updateCloudStatus(`☁️ 云端存档加载成功 (第${gameState.days}天)`);
        addLog('good', '☁️ 云端加载', `从云端加载存档成功 (第${gameState.days}天)`);
        
        // 同时保存到本地
        saveGame();
        
        return { success: true, days: gameState.days };
        
    } catch (e) {
        updateCloudStatus(`云端加载失败: ${e.message}`, true);
        addLog('bad', '☁️ 云端加载失败', e.message);
        return { error: e.message };
    }
}

/**
 * 加载并验证存档
 */
function doLoadGame() {
    try {
        const saved = localStorage.getItem(LOAD_CONFIG.storageKey);
        
        if (!saved) {
            addLog('bad', '加载失败', '没有找到存档');
            return { error: 'No save' };
        }
        
        const data = JSON.parse(saved);
        
        // 确保历史日志字段存在
        if (!data.combatLogHistory) data.combatLogHistory = [];
        if (!data.eventLogHistory) data.eventLogHistory = [];
        
        // 迁移
        const migrated = migrateIfNeeded(data);
        
        // 应用
        gameState = applyDefaults(migrated);
        
        addLog('good', '加载成功', `存档已加载 (第${gameState.days}天)`);
        
        // 重新渲染UI
        if (typeof renderGameUI === 'function') renderGameUI();
        if (typeof refreshInventoryUI === 'function') refreshInventoryUI();
        if (typeof updateDisplay === 'function') updateDisplay();
        
        showGameUI();
        
        return { success: true, days: gameState.days };
        
    } catch (e) {
        addLog('bad', '加载失败', '加载失败: ' + e.message);
        return { error: e.message };
    }
}

/**
 * 验证存档完整性（检查关键字段）
 */
function validateSaveData(data) {
    const required = ['realm', 'days', 'spiritStones', 'cultivation'];
    const missing = required.filter(field => !(field in data));
    
    return {
        valid: missing.length === 0,
        missing,
        warnings: detectCorruption(data)
    };
}

/**
 * 检测数据损坏
 */
function detectCorruption(data) {
    const warnings = [];
    
    // 检测数值异常
    if (data.spiritStones > 1e15) {
        warnings.push('spiritStones异常高');
    }
    
    if (data.days > 100000) {
        warnings.push('days异常高');
    }
    
    // 检测数组膨胀
    if (data.combatLog && data.combatLog.length > 10000) {
        warnings.push('combatLog过大');
    }
    
    return warnings;
}

/**
 * 修复损坏的存档
 */
function repairSaveData(data) {
    let repaired = { ...data };
    
    // 修复数值
    if (repaired.spiritStones < 0) repaired.spiritStones = 0;
    if (repaired.days < 1) repaired.days = 1;
    
    // 裁剪过大数组
    if (repaired.combatLog && repaired.combatLog.length > 1000) {
        repaired.combatLog = repaired.combatLog.slice(-1000);
    }
    
    if (repaired.eventLog && repaired.eventLog.length > 1000) {
        repaired.eventLog = repaired.eventLog.slice(-1000);
    }
    
    return repaired;
}

/**
 * 获取存档摘要信息
 */
function getSaveInfo() {
    const saved = localStorage.getItem(LOAD_CONFIG.storageKey);
    
    if (!saved) {
        return { exists: false };
    }
    
    try {
        const data = JSON.parse(saved);
        return {
            exists: true,
            days: data.days,
            realm: data.realm,
            spiritStones: data.spiritStones,
            version: data.version || 1,
            timestamp: data.timestamp || null,
            size: saved.length
        };
    } catch (e) {
        return { exists: true, corrupted: true, error: e.message };
    }
}

/**
 * 清除损坏的存档
 */
function clearCorruptedSave() {
    localStorage.removeItem(LOAD_CONFIG.storageKey);
    localStorage.removeItem(LOAD_CONFIG.autoSaveKey);
    addLog('good', '清除存档', '已清除损坏的存档');
}

// 导出模块
export {
    loadGame, doLoadGame, cloudLoad,
    applyDefaults, migrateIfNeeded, validateGameState,
    validateSaveData, detectCorruption, repairSaveData,
    registerMigrationStrategy,
    getSaveInfo, clearCorruptedSave
};