// Auto-generated module: init.js
'use strict';

        // ===== init =====
        function init() {
            loadMiniMaxConfig();
            updateDisplay();
        }

        // ===== loadMiniMaxConfig =====
        function loadMiniMaxConfig() {
            const saved = localStorage.getItem(CONFIG.miniMaxConfigKey);
            if (saved) {
                try {
                    miniMaxConfig = JSON.parse(saved);
                    // 确保features结构完整
                    if (!miniMaxConfig.features) {
                        miniMaxConfig.features = { ...DEFAULT_MINIMAX_CONFIG.features };
                    }
                } catch (e) {
                    miniMaxConfig = { ...DEFAULT_MINIMAX_CONFIG };
                }
            }
        }

        // ===== startNewGame =====
        function startNewGame() {
            gameState = {
                realm: 0,
                stage: 0,
                qi: 20,
                maxQi: 100,
                spiritStones: 50,
                mindset: 50,
                days: 1,
                cultivationProgress: 0,
                eventLog: [],
                isGameOver: false,
                isVictory: false,
                inventory: [],
                equippedTreasures: [null, null, null],
                maxInventorySlots: 20,
                shopItems: [],
                lastShopDay: 0,
                shopRefreshCount: 0, // 经济调整：商店刷新次数计数器，用于递增刷新费用
                activeEffects: {
                    breakthrough_boost: 0,
                    cultivate_speed: 0,
                    渡劫_mindset_protect: 0,
                    attack: 0,
                    defense: 0,
                    cultivate_qi_rate: 0,
                    渡劫_damage_reduce: 0,
                    escape: 0,
                    foresee_event: 0,
                    all_stats: 0
                },
                tribulation: {
                    inProgress: false,
                    currentStage: 0,
                    totalStages: 9,
                    currentType: null,
                    preparations: [],
                    damageTaken: 0,
                    tribKey: null
                },
                hasTransmigrationBuff: false,
                tribulationRecord: [],
                combat: {
                    wins: 0,
                    losses: 0,
                    honor: 0,
                    fame: 0,
                    battleHistory: [],
                    injured: false,
                    injuryEndDay: 0
                },
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
                    // V29 NPC AI系统
                    npcDialogueHistory: [],
                    npcTasks: [],
                    npcLastActions: {},
                    // V30 渡劫审批系统
                    tribulationRequest: {
                        status: 'none',
                        elderScore: 0,
                        elderComment: '',
                        leaderDecision: '',
                        leaderComment: '',
                        buffApplied: false,
                        submitDay: 0
                    },
                    // V31 天道轮回系统
                    celestialCycle: {
                        day: 0,
                        completed: false,
                        lastResult: null,
                        blessingActive: false,
                        cycleInterval: 3
                    },
                    // V35 宗门任务链
                    sectMissions: [],
                    sectMissionCooldown: 0,
                    lastMissionRefreshDay: 0,
                    // V36 装备打造增强
                    equipmentForgeCount: 0,
                    lastForgeDay: 0,
                    // V37 天道法则系统
                    celestialLaws: {
                        comprehended: [], active: [], comprehending: null,
                        comprehendingProgress: 0, comprehendDays: 0,
                        maxActiveLaws: 3, lawBonus: {}
                    }
                },
                // V6 奇遇系统字段
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
                // V7 灵根/体质系统
                spiritRoot: {
                    ...generateRandomSpiritRoot(),
                    awakeningAvailable: false,
                    hasAwakened: false,
                    awakenedQuality: null
                },
                // V32 灵根觉醒系统
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
                // V8 丹药炼器系统
                crafting: {
                    furnace: { level: 1, type: 'alchemy' },
                    anvil: { level: 1, type: 'forge' },
                    transactionLog: []
                },
                // V9 世界地图系统
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
                // E1 NPC对话记忆
                npcMemory: [],
                // B 成就/称号系统
                title: '筑基修士',
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
                }
            };
            saveGame();
            showGameUI();
            addLog('welcome', '欢迎', '你踏入修仙之路，成为一名炼气期修士。吸收天地灵气，开启你的修仙之旅！');
        }

        // ===== loadGame =====
        function loadGame() {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const loaded = JSON.parse(saved);
                // 确保V2新增字段存在（向后兼容）
                gameState = {
                    ...gameState,
                    ...loaded,
                    activeEffects: loaded.activeEffects || {
                        breakthrough_boost: 0,
                        cultivate_speed: 0,
                        渡劫_mindset_protect: 0,
                        attack: 0,
                        defense: 0,
                        cultivate_qi_rate: 0,
                        渡劫_damage_reduce: 0,
                        escape: 0,
                        foresee_event: 0,
                        all_stats: 0
                    },
                    equippedTreasures: loaded.equippedTreasures || [null, null, null],
                    inventory: loaded.inventory || [],
                    shopItems: loaded.shopItems || [],
                    lastShopDay: loaded.lastShopDay || 0,
                    tribulation: loaded.tribulation || {
                        inProgress: false,
                        currentStage: 0,
                        totalStages: 9,
                        currentType: null,
                        preparations: [],
                        damageTaken: 0,
                        tribKey: null
                    },
                    hasTransmigrationBuff: loaded.hasTransmigrationBuff || false,
                    tribulationRecord: loaded.tribulationRecord || [],
                    combat: loaded.combat || {
                        wins: 0,
                        losses: 0,
                        honor: 0,
                        fame: 0,
                        battleHistory: [],
                        injured: false,
                        injuryEndDay: 0
                    },
                    // V33 战斗AI学习系统
                    combatProfile: loaded.combatProfile || {
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
                    lastCombatDay: loaded.lastCombatDay || 0,
                    // V35 宗门互动增强
                    sectMissions: loaded.sectMissions || [],
                    sectMissionCooldown: loaded.sectMissionCooldown || 0,
                    lastMissionRefreshDay: loaded.lastMissionRefreshDay || 0,
                    // V36 装备打造增强
                    equipmentForgeCount: loaded.equipmentForgeCount || 0,
                    lastForgeDay: loaded.lastForgeDay || 0,
                    // V37 天道法则系统
                    celestialLaws: loaded.celestialLaws || {
                        comprehended: [], active: [], comprehending: null,
                        comprehendingProgress: 0, comprehendDays: 0,
                        maxActiveLaws: 3, lawBonus: {}
                    },
                    // V38 仙界社交系统
                    immortalAlly: loaded.immortalAlly || {
                        id: null, name: '', rank: 1, role: 'none', contribution: 0,
                        joinedDay: 0, allies: [], skillLevel: 0, dailyActivity: 0, lastActivityDay: 0
                    },
                    immortalFriends: loaded.immortalFriends || [],
                    allyApplications: loaded.allyApplications || [],
                    // V39 仙宠培养系统
                    spiritPets: loaded.spiritPets || { pets: [], lastInteractionDay: 0 },
                    // V40 仙界拍卖行
                    auction: loaded.auction || { listings: [], frozenFunds: 0, playerId: null, playerName: null, sortType: 'endingSoon' },
                    // V41 仙界经济系统
                    economy: loaded.economy || {
                        currentInflation: 0.02, totalIncome: 0, totalExpense: 0, totalTax: 0,
                        totalWealth: 0, avgDailyIncome: 50, avgDailyExpense: 0,
                        luxuryPurchases: 0, activeEvents: [], economyBuffs: {}
                    },
                    sect: loaded.sect ? {
                        ...loaded.sect,
                        npcDialogueHistory: loaded.sect.npcDialogueHistory || [],
                        npcTasks: loaded.sect.npcTasks || [],
                        npcLastActions: loaded.sect.npcLastActions || {},
                        tribulationRequest: loaded.sect.tribulationRequest || {
                            status: 'none', elderScore: 0, elderComment: '',
                            leaderDecision: '', leaderComment: '', buffApplied: false, submitDay: 0
                        },
                        celestialCycle: loaded.sect.celestialCycle || {
                            day: 0, completed: false, lastResult: null, blessingActive: false, cycleInterval: 3
                        },
                        // V35 宗门任务链
                        sectMissions: loaded.sect.sectMissions || [],
                        sectMissionCooldown: loaded.sect.sectMissionCooldown || 0
                    } : {
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
                        lastResourceCollection: 0
                    },
                    serendipity: loaded.serendipity || {
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
                    // V7 灵根/体质系统
                    spiritRoot: loaded.spiritRoot ? {
                        ...loaded.spiritRoot,
                        awakeningAvailable: loaded.spiritRoot.awakeningAvailable || false,
                        hasAwakened: loaded.spiritRoot.hasAwakened || false,
                        awakenedQuality: loaded.spiritRoot.awakenedQuality || null
                    } : { ...generateRandomSpiritRoot(), awakeningAvailable: false, hasAwakened: false, awakenedQuality: null },
                    // V32 灵根觉醒系统
                    spiritRootAwakening: loaded.spiritRootAwakening || {
                        status: 'dormant',
                        stage: 0,
                        triggerDay: 0,
                        tasks: [],
                        rewards: null,
                        lastEventDay: 0,
                        attempts: 0
                    },
                    constitutions: loaded.constitutions || [],
                    // V8 丹药炼器系统
                    crafting: loaded.crafting || {
                        furnace: { level: 1, type: 'alchemy' },
                        anvil: { level: 1, type: 'forge' },
                        transactionLog: []
                    },
                    // V9 世界地图系统
                    worldMap: loaded.worldMap || {
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
                    }
                };
                // E1 确保npcMemory字段存在（向后兼容）
                if (!gameState.npcMemory) gameState.npcMemory = [];
                // B 成就/称号系统向后兼容
                if (!gameState.title) gameState.title = '筑基修士';
                if (!gameState.achievements) {
                    gameState.achievements = {
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
                    };
                }
                // 确保activeEffects包含serendipity_boost
                if (!gameState.activeEffects.serendipity_boost) {
                    gameState.activeEffects.serendipity_boost = 0;
                }
                // 初始化体质效果
                initializeConstitutionEffects();
                // 重新计算装备效果
                recalculateAllEffects();
                // 初始化世界地图
                initWorldMap();
                if (gameState.isGameOver) {
                    showGameOverScreen();
                } else {
                    showGameUI();
                }
            } else {
                alert('没有找到存档！');
            }
        }

        // ===== showGameUI =====
        function showGameUI() {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('apiConfig').classList.add('hidden');
            document.getElementById('gameStats').classList.remove('hidden');
            document.getElementById('cultivationProgress').classList.remove('hidden');
            document.getElementById('equipmentBar').classList.remove('hidden');
            document.getElementById('gameButtons').classList.remove('hidden');
            document.getElementById('eventLog').classList.remove('hidden');
            updateDisplay();
            renderLog();
            updateEquipmentBar();
            // 检查商店刷新
            if (gameState.lastShopDay < gameState.days) {
                refreshShop(true);
            }
            // 重置每日行动力
            if (gameState.worldMap) {
                const wm = gameState.worldMap;
                if (wm.lastTravelDay < gameState.days) {
                    wm.actionPower = wm.maxActionPower;
                    wm.lastTravelDay = 0;
                }
            }
            // 检查宗门按钮显示
            const sectBtn = document.getElementById('sectBtn');
            if (sectBtn) {
                sectBtn.style.display = (gameState.sect && gameState.sect.name) ? 'inline-block' : 'none';
            }
            // V37 检查悟道按钮显示
            const lawBtn = document.getElementById('lawBtn');
            if (lawBtn) {
                lawBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V38 检查仙界社交按钮显示（境界≥地仙=realm 8）
            const allyBtn = document.getElementById('allyBtn');
            if (allyBtn) {
                allyBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            const friendsBtn = document.getElementById('friendsBtn');
            if (friendsBtn) {
                friendsBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            const tradingBtn = document.getElementById('tradingBtn');
            if (tradingBtn) {
                tradingBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V40 拍卖按钮显示（境界≥地仙=realm 8）
            const auctionBtn = document.getElementById('auctionBtn');
            if (auctionBtn) {
                auctionBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V41 经济系统按钮显示（境界≥地仙=realm 8）
            const economyBtn = document.getElementById('economyBtn');
            if (economyBtn) {
                economyBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
        }

        // ===== updateDisplay =====
        function updateDisplay() {
            const realmName = CONFIG.realms[gameState.realm];
            const stageName = CONFIG.stages[gameState.stage];
            
            document.getElementById('realmDisplay').textContent = `${realmName}期`;
            document.getElementById('qiDisplay').textContent = `${gameState.qi}/${gameState.maxQi}`;
            document.getElementById('stonesDisplay').textContent = gameState.spiritStones;
            document.getElementById('mindsetDisplay').textContent = gameState.mindset;
            document.getElementById('daysDisplay').textContent = gameState.days;
            
            document.getElementById('realmName').textContent = `${realmName}期`;
            document.getElementById('realmStage').textContent = stageName;

            // A5 更新称号显示
            const titleDisplay = document.getElementById('titleDisplay');
            if (titleDisplay) {
                titleDisplay.textContent = `【${gameState.title || '筑基修士'}】`;
            }

            const req = REALM_REQUIREMENTS[gameState.realm];
            const progressInStage = gameState.stage === 0 ? 
                gameState.cultivationProgress : 
                gameState.cultivationProgress - req.stageThreshold[gameState.stage - 1];
            const stageSize = gameState.stage === 0 ? 
                req.stageThreshold[0] : 
                (req.stageThreshold[gameState.stage] - req.stageThreshold[gameState.stage - 1]);
            const percentage = Math.min(100, (progressInStage / stageSize) * 100);
            
            document.getElementById('cultivationBar').style.width = `${percentage}%`;
            document.getElementById('cultivationBar').textContent = `${Math.round(percentage)}%`;
            
            // V7 更新灵根显示
            updateSpiritRootDisplay();
            
            // V9 更新世界地图显示
            updateMinimapDisplay();
            if (gameState.worldMap) {
                const wm = gameState.worldMap;
                document.getElementById('actionPowerDisplay').textContent = `${wm.actionPower}/${wm.maxActionPower}`;
            }
        }

