// Auto-generated module: state.js
'use strict';

        // --- gameState (1366-1480) ---
        let gameState = {
            realm: 0,       // 0-4 对应 炼气到化神
            stage: 0,       // 0-2 对应 初期/中期/后期
            qi: 0,
            maxQi: 100,
            spiritStones: 50,
            mindset: 50,
            days: 1,
            cultivationProgress: 0,
            eventLog: [],
            combatLogHistory: [],
            eventLogHistory: [],
            isGameOver: false,
            isVictory: false,
            // V2新增字段
            inventory: [],
            equippedTreasures: [null, null, null],
            maxInventorySlots: 20,
            shopItems: [],
            lastShopDay: 0,
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
                all_stats: 0,
                serendipity_boost: 0
            },
            // V3渡劫系统字段
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
            // V4 战斗系统字段
            combat: {
                wins: 0,
                losses: 0,
                honor: 0,
                fame: 0,
                battleHistory: [],
                injured: false,
                injuryEndDay: 0
            },
            // V5 宗门系统字段
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
                npcDialogueHistory: [],   // [{uid, text, isPlayer, day}]
                npcTasks: [],             // [{uid, type, target, startDay, endDay, completed, progress}]
                npcLastActions: {},        // {uid: {action, day}}
// V30 渡劫审批系统
                tribulationRequest: {
                    status: 'none',        // none | pending_elder | pending_leader | approved | rejected
                    elderScore: 0,
                    elderComment: '',
                    leaderDecision: '',
                    leaderComment: '',
                    buffApplied: false,
                    submitDay: 0
                },
                // V31 天道轮回系统
                celestialCycle: {
                    day: 0,                // 距离下次轮回的天数
                    completed: false,      // 本周期是否已完成
                    lastResult: null,       // 上次轮回结果 {type, text, effects}
                    blessingActive: false, // 气运祈福是否激活
                    cycleInterval: 3        // 轮回间隔天数
                },
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
            // V7 灵根/体质系统字段
            spiritRoot: {
                quality: '中品灵根', // 伪灵根/下品灵根/中品灵根/上品灵根/天灵根/混沌灵根
                affinity: { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 },
                resonance: 0,
                lastRefreshDay: 0
            },
            constitutions: [], // 已获得的体质
            // V8 丹药炼器系统字段
            crafting: {
                furnace: { level: 1, type: 'alchemy' },
                anvil: { level: 1, type: 'forge' },
                transactionLog: []
            },
            // V11 成就/称号系统字段
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
            },
            // V11 飞升系统字段
            currentRealm: 'mortal',  // 'mortal' | 'immortal'
            immortal: null,          // 仙界状态，飞升后初始化
            mounts: [],              // 仙兽列表（最多3只）
            immortalSkills: [],       // 仙法列表
            immortalEquipment: {      // 飞升装备栏
                head: null,
                body: null,
                foot: null,
                weapon: null,
                shield: null,
                accessory: null
            },
            currentMount: null       // 当前骑乘的仙兽
        };

        // --- miniMaxConfig (1492-1502) ---
        let miniMaxConfig = {
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

        // --- combatState (5037-5051) ---
        let combatState = {
            inProgress: false,
            player: null,
            opponent: null,
            round: 0,
            turn: 'player',
            playerAction: null,
            playerSubAction: null,
            log: [],
            effects: {
                player: { attacking: false, defending: false, attackBoost: 0, defenseBoost: 0, ignoreDefense: false, burning: 0, frozen: 0, manaDrain: 0 },
                opponent: { attacking: false, defending: false, attackBoost: 0, defenseBoost: 0, burning: 0, frozen: 0 }
            },
            battleRecord: []
        };

        // --- secretRealmState (7391-7398) ---
        let secretRealmState = {
            wave: 0,
            totalWaves: 3,
            enemies: [],
            playerHP: 0,
            playerMaxHP: 0,
            rewards: []
        };

