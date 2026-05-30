/**
 * main.js - 游戏入口文件
 * 修仙模拟器 - 模块化主入口
 * 
 * 功能：
 * 1. 导入所有模块 (config, domains/*, systems/*, ui/*)
 * 2. 初始化游戏状态 gameState
 * 3. 注册所有 MCP 工具
 * 4. 初始化所有领域模块
 * 5. 初始化持久化系统 (SaveManager, LoadManager)
 * 6. 初始化离线系统 (OfflineManager)
 * 7. 暴露全局函数 (init, startNewGame, updateDisplay等)
 * 8. 处理游戏循环和事件调度
 */

// ===== 模块导入 =====

// 配置模块
import { CONFIG, IDLE_TASKS, IDLE_CONFIG, NPC_ROLE_REGISTRY, PLAN_REVIEW_GATE } from './config/constants.js';

// 领域模块
import { createCultivationModule } from './domains/cultivation/CultivationModule.js';
import { createPlayerModule } from './domains/player/PlayerModule.js';
import { createAchievementModule } from './domains/achievement/AchievementModule.js';

// 领域模块 (ES Module - default exports)
import InventoryModule from './domains/inventory/InventoryModule.js';
import PetModule from './domains/pet/PetModule.js';

// 丹方知识图谱 (Direction Q: 丹药丹方知识图谱)
import { alchemyKBService } from './domains/inventory/services/AlchemyKBService.js';

// 药材探索系统 (V229 Direction Q续: 丹药丹方知识图谱 - 药材探索)
import { herbDiscoveryService } from './domains/inventory/services/HerbDiscoveryService.js';

// 领域模块 (ES Module - named exports)
import { createRankingService, createArenaService } from './domains/ranking/RankingModule.js';
import { createSigninService, createWelfareService } from './domains/signin/SigninModule.js';
import CombatModule from './domains/combat/CombatModule.js';
import SectModule from './domains/sect/SectModule.js';
import { reincarnationService } from './domains/reincarnation/services/ReincarnationService.js';
import { reincarnationBookService } from './domains/reincarnation/services/ReincarnationBookService.js';
import { TalentTreeService, createTalentTreeMCPHandlers } from './domains/cultivation/services/TalentTreeService.js';

// 飞升系统 (V230 Direction R: 飞升系统)
import { getAscensionService } from './domains/cultivation/services/AscensionService.js';

// 仙界宗门系统 (V231 Direction S: 仙界宗门系统 - chatdev/nanobot)
import { createImmortalSectService } from './domains/sect/services/ImmortalSectService.js';

// 系统模块
import { saveGame, doSaveGame, showSaveLoadModal, getSaveHistory } from './systems/persistence/SaveManager.js';
import { loadGame, doLoadGame } from './systems/persistence/LoadManager.js';
import { 
    OfflineSnapshot, 
    PowerSync,
    IDLE_TASKS as OFFLINE_IDLE_TASKS,
    OFFLINE_CONFIG,
    powerSync
} from './systems/offline/OfflineManager.js';

// NPC进化引擎 (Direction N: nanobot分布式mesh注册表 + generic-agent自我进化)
import { npcEvolutionEngine } from './systems/ai/NPCEvolutionEngine.js';

// NPC对话生成服务 (V228 Direction N续: NPC自主进化引擎 - 对话生成)
import { npcDialogueService } from './systems/ai/NPCDialogueService.js';

// 仙界事件总线 (Direction O: 全局事件总线 + 事件级联触发机制)
import { realmEventBus, EVENT_BUS_TOOLS } from './systems/event/RealmEventBus.js';

// 事件分析服务 (Direction O续: 仙界事件总线 - 事件历史分析)
import { eventAnalyticsService, EVENT_ANALYTICS_TOOLS } from './systems/event/EventAnalyticsService.js';

// ===== 全局状态 =====

/**
 * 游戏状态主对象
 * 所有游戏数据都存储在这里
 */
let gameState = null;

/**
 * 游戏初始化标志
 */
let isGameInitialized = false;

/**
 * 游戏主循环定时器
 */
let gameLoopTimer = null;

/**
 * 最后更新时间戳
 */
let lastUpdateTime = Date.now();

/**
 * 游戏是否正在运行
 */
let isGameRunning = false;

/**
 * 离线管理器实例
 */
let offlineManager = null;

/**
 * 领域模块实例集合
 */
const domainModules = {};

/**
 * MCP 工具注册表
 */
const mcpToolRegistry = {};

/**
 * 游戏循环配置
 */
const GAME_LOOP_CONFIG = {
    tickInterval: 1000,      // 主循环间隔 (ms)
    autoSaveInterval: 60000, // 自动保存间隔 (ms)
    uiUpdateInterval: 100,  // UI更新间隔 (ms)
    saveDebounceTime: 5000  // 保存防抖时间 (ms)
};

// ===== 游戏状态初始化 =====

/**
 * 创建初始游戏状态
 */
function createInitialGameState() {
    return {
        // 玩家基础信息
        player: {
            name: '修士',
            level: 1,
            experience: 0,
            spiritStones: 100,
            qi: 0,
            reputation: 0,
            karmaPoints: 0,
            titles: [],
            achievements: [],
            badges: []
        },
        
        // 修为系统
        realm: 0,            // 0-5: 炼气、筑基、金丹、元婴、化神、飞升
        stage: 0,            // 0-2: 初期、中期、后期
        cultivationProgress: 0,
        cultivationXP: 0,
        
        // 灵根系统
        spiritRoot: {
            type: 'wood',
            tier: 1,
            attributes: {
                wood: 10,
                fire: 0,
                earth: 0,
                metal: 0,
                water: 0
            }
        },
        
        // 天劫系统
        tribulation: {
            inProgress: false,
            targetRealm: null,
            lightningCount: 0,
            progress: 0
        },
        
        // 祝福系统
        blessings: [],
        activeEffects: [],
        
        // 背包系统
        inventory: {
            items: [],
            equipment: {},
            maxSlots: 50,
            expandedSlots: 0
        },
        
        // 宗门系统
        sect: null,
        disciples: [],
        
        // 宠物系统
        pets: [],
        activePet: null,
        maxPets: 5,
        
        // 战斗系统
        combat: {
            inCombat: false,
            currentOpponent: null,
            combatLog: [],
            energy: 100,
            maxEnergy: 100
        },
        
        // 排行榜系统
        ranking: {
            rating: 1000,
            rank: '青铜',
            wins: 0,
            losses: 0,
            arenaHistory: []
        },
        
        // 成就系统
        achievementState: {
            completedAchievements: [],
            progress: {},
            totalPoints: 0
        },
        badgeState: {
            equippedBadges: [],
            unlockedBadges: []
        },
        
        // 奇遇系统
        serendipity: {
            triggeredEvents: [],
            dagStatus: null,
            karmaHistory: []
        },
        
        // 签到系统
        signin: {
            lastSigninDate: null,
            consecutiveDays: 0,
            totalSignins: 0,
            rewardsClaimed: []
        },
        
        // 投资系统
        investment: {
            monthCard: null,
            investments: [],
            dailyReturns: []
        },
        
        // 邮件系统
        mail: {
            unreadCount: 0,
            letters: []
        },
        
        // 离线系统
        idleTasks: [],
        offlineEfficiency: OFFLINE_CONFIG.offlineEfficiency,
        lastActiveTime: Date.now(),
        offlineEarnings: 0,
        
        // 游戏进度
        days: 1,
        totalPlayTime: 0,
        gameVersion: 'V231',
        
        // 设置
        settings: {
            soundEnabled: true,
            notificationsEnabled: true,
            autoSaveEnabled: true
        },
        
        // 元数据
        meta: {
            createdAt: Date.now(),
            lastSavedAt: null,
            lastLoadedAt: null,
            saveSlots: {}
        }
    };
}

/**
 * 深度合并对象
 */
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// ===== 领域模块初始化 =====

/**
 * 初始化所有领域模块
 */
function initializeDomainModules() {
    console.log('[Main] 初始化领域模块...');
    
    // 玩家模块
    domainModules.player = createPlayerModule(() => gameState);
    
    // 修炼模块
    domainModules.cultivation = createCultivationModule(() => gameState);
    
    // 背包模块
    domainModules.inventory = InventoryModule;
    domainModules.inventory.initInventory(gameState);
    
    // 宠物模块
    domainModules.pet = PetModule;
    
    // 成就模块
    domainModules.achievement = createAchievementModule();
    
    // 战斗模块 (ES Module)
    domainModules.combat = CombatModule;
    
    // 宗门模块 (ES Module)
    domainModules.sect = SectModule;
    
    // 排行榜模块 (ES Module)
    domainModules.ranking = { createRankingService, createArenaService };
    
    // 签到模块 (ES Module)
    domainModules.signin = { createSigninService, createWelfareService };

    // 轮回模块 (ES Module)
    domainModules.reincarnation = reincarnationService;
    reincarnationService.init(gameState);

    // 轮回簿天道记录 (V226: Direction M续)
    domainModules.reincarnationBook = reincarnationBookService;
    reincarnationBookService.init(gameState);

    // 天赋树模块 (Direction P: 灵根天赋系统)
    domainModules.talentTree = new TalentTreeService(gameState);

    // 丹方知识图谱 (Direction Q: 丹药丹方知识图谱)
    alchemyKBService.init(gameState);
    domainModules.alchemyKB = alchemyKBService;

    // 药材探索系统 (V229 Direction Q续: 丹药丹方知识图谱 - 药材探索)
    herbDiscoveryService.init(gameState);
    domainModules.herbDiscovery = herbDiscoveryService;

    // 飞升系统 (V230 Direction R: 飞升系统)
    ascensionService.init(gameState);
    domainModules.ascension = ascensionService;

    // 仙界宗门系统 (V231 Direction S: 仙界宗门系统 - chatdev/nanobot)
    const immortalSectService = createImmortalSectService(gameState);
    immortalSectService.init(gameState);
    domainModules.immortalSect = immortalSectService;

    // NPC进化引擎 (Direction N: nanobot分布式mesh注册表 + generic-agent自我进化)
    npcEvolutionEngine.init(gameState);

    // NPC对话生成服务 (V228 Direction N续: NPC自主进化引擎 - 对话生成)
    npcDialogueService.init(gameState);

    // 事件分析服务 (Direction O续: 仙界事件总线 - 事件历史分析)
    eventAnalyticsService.init(gameState);

    console.log('[Main] 领域模块初始化完成');
}

/**
 * 获取领域模块
 */
function getDomainModule(name) {
    return domainModules[name];
}

// ===== MCP 工具注册 =====

/**
 * MCP 工具注册表类
 */
class MCPRegistry {
    constructor() {
        this.tools = new Map();
        this.handlers = new Map();
    }
    
    /**
     * 注册 MCP 工具
     */
    registerTool(toolName, toolDefinition, handler) {
        this.tools.set(toolName, toolDefinition);
        this.handlers.set(toolName, handler);
        console.log(`[MCP] 注册工具: ${toolName}`);
    }
    
    /**
     * 注册多个工具
     */
    registerTools(tools) {
        for (const [name, def] of Object.entries(tools)) {
            this.registerTool(name, def, null);
        }
    }
    
    /**
     * 执行工具
     */
    async executeTool(toolName, params) {
        const handler = this.handlers.get(toolName);
        if (!handler) {
            return { error: `Unknown tool: ${toolName}` };
        }
        try {
            return await handler(params);
        } catch (e) {
            console.error(`[MCP] Tool execution error: ${toolName}`, e);
            return { error: e.message };
        }
    }
    
    /**
     * 获取所有工具
     */
    getAllTools() {
        return Object.fromEntries(this.tools);
    }
    
    /**
     * 获取工具定义
     */
    getTool(toolName) {
        return this.tools.get(toolName);
    }
}

// 全局 MCP 注册表实例
const mcpRegistry = new MCPRegistry();

/**
 * 注册所有 MCP 工具
 */
function registerMCPTools() {
    console.log('[MCP] 注册 MCP 工具...');
    
    // 核心工具
    const coreTools = {
        'gameState.query': {
            name: 'gameState.query',
            description: 'Query current game state',
            inputSchema: {
                type: 'object',
                properties: {
                    field: { type: 'string', description: 'Field to query' }
                }
            }
        },
        'player.info': {
            name: 'player.info',
            description: 'Get player information',
            inputSchema: { type: 'object', properties: {} }
        },
        'cultivation.advance': {
            name: 'cultivation.advance',
            description: 'Advance cultivation',
            inputSchema: {
                type: 'object',
                properties: {
                    action: { type: 'string', enum: ['meditate', 'breakthrough', 'tribulation'] }
                }
            }
        }
    };
    
    mcpRegistry.registerTools(coreTools);
    
    // 注册领域特定工具
    registerDomainMCPTools();
    
    console.log(`[MCP] 已注册 ${mcpRegistry.tools.size} 个工具`);
}

/**
 * 注册领域 MCP 工具
 */
function registerDomainMCPTools() {
    // 修炼工具
    mcpRegistry.registerTool('cultivation.meditate', {
        name: 'cultivation.meditate',
        description: 'Meditate to gain qi',
        inputSchema: { type: 'object', properties: { amount: { type: 'number' } } }
    }, (params) => {
        const amount = params?.amount || 10;
        return domainModules.cultivation.meditate(amount);
    });
    
    mcpRegistry.registerTool('cultivation.breakthrough', {
        name: 'cultivation.breakthrough',
        description: 'Attempt realm breakthrough',
        inputSchema: { type: 'object', properties: {} }
    }, () => domainModules.cultivation.breakthrough());
    
    // 背包工具
    mcpRegistry.registerTool('inventory.addItem', {
        name: 'inventory.addItem',
        description: 'Add item to inventory',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string' },
                name: { type: 'string' },
                quantity: { type: 'number' },
                quality: { type: 'string' }
            }
        }
    }, (params) => {
        const { type, name, quantity, quality } = params;
        return domainModules.inventory.addItemToInventory(gameState, type, name, quantity, quality);
    });
    
    mcpRegistry.registerTool('inventory.useItem', {
        name: 'inventory.useItem',
        description: 'Use an item',
        inputSchema: { type: 'object', properties: { name: { type: 'string' } } }
    }, (params) => domainModules.inventory.useItem(gameState, params?.name));
    
    // 宠物工具
    mcpRegistry.registerTool('pet.list', {
        name: 'pet.list',
        description: 'List all pets',
        inputSchema: { type: 'object', properties: {} }
    }, () => domainModules.pet?.getPets?.() || { pets: gameState.pets });
    
    // 成就工具
    mcpRegistry.registerTool('achievement.list', {
        name: 'achievement.list',
        description: 'List achievements',
        inputSchema: { type: 'object', properties: {} }
    }, () => ({ achievements: gameState.achievementState?.completedAchievements || [] }));

    // 轮回工具 (Direction M: 悟道境轮回系统)
    mcpRegistry.registerTool('reincarnation.crystal.create', {
        name: 'reincarnation.crystal.create',
        description: 'Create a remembrance crystal from current insights',
        inputSchema: {
            type: 'object',
            properties: {
                quality: { type: 'string', description: 'Crystal quality (凡品/良品/珍品/上品/极品)' },
                source: { type: 'string', description: 'Source type (breakthrough/alchemy/serendipity/meditation/combat)' }
            }
        }
    }, (params) => reincarnationService.mcpCrystalCreate(params || {}, gameState));

    mcpRegistry.registerTool('reincarnation.crystal.list', {
        name: 'reincarnation.crystal.list',
        description: 'List all remembrance crystals',
        inputSchema: { type: 'object', properties: {} }
    }, () => reincarnationService.mcpCrystalList());

    mcpRegistry.registerTool('reincarnation.crystal.apply', {
        name: 'reincarnation.crystal.apply',
        description: 'Apply a crystal to restore attributes after reincarnation',
        inputSchema: {
            type: 'object',
            properties: {
                crystalId: { type: 'string', description: 'ID of the crystal to apply' }
            },
            required: ['crystalId']
        }
    }, (params) => reincarnationService.mcpCrystalApply(params || {}, gameState));

    mcpRegistry.registerTool('reincarnation.insight.awaken', {
        name: 'reincarnation.insight.awaken',
        description: 'Trigger an insight awakening event',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Insight type' },
                desc: { type: 'string', description: 'Insight description' }
            }
        }
    }, (params) => reincarnationService.mcpInsightAwaken(params || {}, gameState));

    mcpRegistry.registerTool('reincarnation.insight.list', {
        name: 'reincarnation.insight.list',
        description: 'List all cultivation insights',
        inputSchema: { type: 'object', properties: {} }
    }, () => reincarnationService.mcpInsightList());

    mcpRegistry.registerTool('reincarnation.cycle.status', {
        name: 'reincarnation.cycle.status',
        description: 'Get reincarnation cycle status and memory layer info',
        inputSchema: { type: 'object', properties: {} }
    }, () => reincarnationService.mcpCycleStatus(gameState));

    // 轮回簿天道记录MCP工具 (V226: Direction M续)
    mcpRegistry.registerTool('reincarnation.book.list', {
        name: 'reincarnation.book.list',
        description: 'View reincarnation history (reincarnation book)',
        inputSchema: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'Number of records to return', default: 20 },
                offset: { type: 'number', description: 'Offset for pagination', default: 0 },
                filter: { type: 'string', enum: ['all', 'good', 'bad'], description: 'Filter by karma', default: 'all' }
            }
        }
    }, (params) => reincarnationBookService.mcpBookList(params || {}));

    mcpRegistry.registerTool('reincarnation.karma.record', {
        name: 'reincarnation.karma.record',
        description: 'Record karma behavior',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Behavior type (rescue/charity/honest/medicine/protect/kill/steal/lie/harm/betray)' },
                action: { type: 'string', enum: ['good', 'bad'], description: 'Good or bad action' },
                amount: { type: 'number', description: 'Karma amount' },
                description: { type: 'string', description: 'Custom description' }
            },
            required: ['type', 'action']
        }
    }, (params) => reincarnationBookService.mcpKarmaRecord(params || {}));

    mcpRegistry.registerTool('reincarnation.karma.query', {
        name: 'reincarnation.karma.query',
        description: 'Query current karma status',
        inputSchema: { type: 'object', properties: {} }
    }, () => reincarnationBookService.mcpKarmaQuery());

    mcpRegistry.registerTool('reincarnation.tiandao.record', {
        name: 'reincarnation.tiandao.record',
        description: 'Record tiandao merit event',
        inputSchema: {
            type: 'object',
            properties: {
                eventType: { type: 'string', description: 'Event type (breakthrough/fly/tribulation/merit/serendipity/alchemy)' },
                merit: { type: 'number', description: 'Merit amount to record' },
                description: { type: 'string', description: 'Custom description' }
            },
            required: ['eventType']
        }
    }, (params) => reincarnationBookService.mcpTiandaoRecord(params || {}));

    mcpRegistry.registerTool('reincarnation.tiandao.bless', {
        name: 'reincarnation.tiandao.bless',
        description: 'Receive tiandao blessing (consumes merit)',
        inputSchema: {
            type: 'object',
            properties: {
                level: { type: 'string', enum: ['SSS', 'SS', 'S', 'A', 'B', 'C'], description: 'Blessing level' },
                reason: { type: 'string', description: 'Reason for blessing' }
            }
        }
    }, (params) => reincarnationBookService.mcpTiandaoBless(params || {}));

    mcpRegistry.registerTool('reincarnation.history.export', {
        name: 'reincarnation.history.export',
        description: 'Export reincarnation history',
        inputSchema: {
            type: 'object',
            properties: {
                format: { type: 'string', enum: ['json', 'text'], description: 'Export format', default: 'json' },
                includeDetails: { type: 'boolean', description: 'Include karma and tiandao records', default: true }
            }
        }
    }, (params) => reincarnationBookService.mcpHistoryExport(params || {}));

    // 天赋树MCP工具 (Direction P: 灵根天赋系统)
    const talentTreeHandlers = createTalentTreeMCPHandlers(gameState);
    
    mcpRegistry.registerTool('spirit.talent.allocate', {
        name: 'spirit.talent.allocate',
        description: 'Allocate talent points to a branch layer',
        inputSchema: {
            type: 'object',
            properties: {
                branch: { type: 'string', enum: ['attack', 'defense', 'cultivation', 'perception'] },
                layer: { type: 'number', minimum: 1, maximum: 5 }
            },
            required: ['branch', 'layer']
        }
    }, (params) => talentTreeHandlers['spirit.talent.allocate'](params));
    
    mcpRegistry.registerTool('spirit.talent.reset', {
        name: 'spirit.talent.reset',
        description: 'Reset talent tree (requires 洗髓丹)',
        inputSchema: {
            type: 'object',
            properties: {
                hasItem: { type: 'boolean', description: 'Whether player has 洗髓丹' }
            }
        }
    }, (params) => talentTreeHandlers['spirit.talent.reset'](params));
    
    mcpRegistry.registerTool('spirit.talent.query', {
        name: 'spirit.talent.query',
        description: 'Query talent tree status',
        inputSchema: { type: 'object', properties: {} }
    }, () => talentTreeHandlers['spirit.talent.query']());
    
    mcpRegistry.registerTool('spirit.mastery.query', {
        name: 'spirit.mastery.query',
        description: 'Query elemental mastery',
        inputSchema: {
            type: 'object',
            properties: {
                element: { type: 'string', enum: ['metal', 'wood', 'water', 'fire', 'earth', 'thunder'] }
            }
        }
    }, (params) => talentTreeHandlers['spirit.mastery.query'](params));
    
    mcpRegistry.registerTool('spirit.mastery.upgrade', {
        name: 'spirit.mastery.upgrade',
        description: 'Upgrade elemental mastery level',
        inputSchema: {
            type: 'object',
            properties: {
                element: { type: 'string', enum: ['metal', 'wood', 'water', 'fire', 'earth', 'thunder'] },
                required: ['element']
            }
        }
    }, (params) => talentTreeHandlers['spirit.mastery.upgrade'](params));
    
    mcpRegistry.registerTool('spirit.hook.register', {
        name: 'spirit.hook.register',
        description: 'Register a spirit root change hook',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Hook type' },
                callback: { type: 'function', description: 'Callback function' }
            },
            required: ['type']
        }
    }, (params) => talentTreeHandlers['spirit.hook.register'](params));

    // 丹方知识图谱MCP工具 (Direction Q: 丹药丹方知识图谱)
    mcpRegistry.registerTool('alchemy.kb.query', {
        name: 'alchemy.kb.query',
        description: 'Query the alchemy knowledge base',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['recipe', 'herb', 'efficacy'], description: 'Query type' },
                name: { type: 'string', description: 'Name to query' }
            }
        }
    }, (params) => alchemyKBService.query(params));

    mcpRegistry.registerTool('alchemy.recipe.discover', {
        name: 'alchemy.recipe.discover',
        description: 'Manually research to discover new alchemy recipes (consumes qi)',
        inputSchema: {
            type: 'object',
            properties: {
                herbs: { type: 'array', items: { type: 'string' }, description: 'Herbs to use for research' },
                qiCost: { type: 'number', description: 'Qi cost for discovery' }
            }
        }
    }, (params) => alchemyKBService.discover(params));

    mcpRegistry.registerTool('alchemy.recipe.list', {
        name: 'alchemy.recipe.list',
        description: 'List all discovered alchemy recipes',
        inputSchema: {
            type: 'object',
            properties: {
                filter: { type: 'string', description: 'Filter recipes by name, material, or efficacy' }
            }
        }
    }, (params) => alchemyKBService.listRecipes(params));

    mcpRegistry.registerTool('alchemy.efficacy.map', {
        name: 'alchemy.efficacy.map',
        description: 'View herb efficacy mapping and synergy effects',
        inputSchema: {
            type: 'object',
            properties: {
                herb: { type: 'string', description: 'Specific herb to query' }
            }
        }
    }, (params) => alchemyKBService.getEfficacyMap(params));

    mcpRegistry.registerTool('alchemy.craft.calculate', {
        name: 'alchemy.craft.calculate',
        description: 'Calculate crafting result preview with given materials',
        inputSchema: {
            type: 'object',
            properties: {
                materials: { type: 'array', items: { type: 'string' }, description: 'Materials to use', required: ['materials'] }
            },
            required: ['materials']
        }
    }, (params) => alchemyKBService.calculateCraft(params));

    mcpRegistry.registerTool('alchemy.kb.export', {
        name: 'alchemy.kb.export',
        description: 'Export the knowledge graph',
        inputSchema: {
            type: 'object',
            properties: {
                format: { type: 'string', enum: ['json'], description: 'Export format' },
                includeHidden: { type: 'boolean', description: 'Include undiscovered recipes' }
            }
        }
    }, (params) => alchemyKBService.exportKB(params));

    // 药材探索MCP工具 (V229 Direction Q续: 丹药丹方知识图谱 - 药材探索)
    mcpRegistry.registerTool('herb.explore.region', {
        name: 'herb.explore.region',
        description: 'Explore a region to discover herbs',
        inputSchema: {
            type: 'object',
            properties: {
                region: { 
                    type: 'string', 
                    enum: ['平原', '山林', '湖泊', '沙漠', '雪山', '秘境'],
                    description: 'Region to explore' 
                },
                useMastery: { type: 'boolean', description: 'Use elemental mastery bonus', default: true }
            },
            required: ['region']
        }
    }, (params) => herbDiscoveryService.exploreRegion(params));

    mcpRegistry.registerTool('herb.season.query', {
        name: 'herb.season.query',
        description: 'Query herbs available in current or specified season',
        inputSchema: {
            type: 'object',
            properties: {
                season: { 
                    type: 'string', 
                    enum: ['春', '夏', '秋', '冬'],
                    description: 'Season to query' 
                }
            }
        }
    }, (params) => herbDiscoveryService.querySeasonalHerbs(params));

    mcpRegistry.registerTool('herb.discovery.list', {
        name: 'herb.discovery.list',
        description: 'List all discovered herbs',
        inputSchema: {
            type: 'object',
            properties: {
                filter: { type: 'string', description: 'Filter by herb name' },
                rarity: { 
                    type: 'string', 
                    enum: ['common', 'uncommon', 'rare', 'legendary'],
                    description: 'Filter by rarity' 
                }
            }
        }
    }, (params) => herbDiscoveryService.listDiscoveredHerbs(params));

    mcpRegistry.registerTool('herb.rarity.classify', {
        name: 'herb.rarity.classify',
        description: 'Classify herbs by rarity or query specific herb rarity',
        inputSchema: {
            type: 'object',
            properties: {
                herb: { type: 'string', description: 'Specific herb to query' }
            }
        }
    }, (params) => herbDiscoveryService.classifyHerbsByRarity(params));

    mcpRegistry.registerTool('herb.synergy.analyze', {
        name: 'herb.synergy.analyze',
        description: 'Analyze synergy effects between herbs',
        inputSchema: {
            type: 'object',
            properties: {
                herbs: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'List of herbs to analyze',
                    required: ['herbs']
                }
            },
            required: ['herbs']
        }
    }, (params) => herbDiscoveryService.analyzeSynergy(params));

    mcpRegistry.registerTool('herb.knowledge.gain', {
        name: 'herb.knowledge.gain',
        description: 'Gain herb knowledge and upgrade elemental mastery',
        inputSchema: {
            type: 'object',
            properties: {
                element: { 
                    type: 'string', 
                    enum: ['metal', 'wood', 'water', 'fire', 'earth'],
                    description: 'Element to gain knowledge in' 
                },
                amount: { type: 'number', description: 'Knowledge amount to gain', default: 1 }
            }
        }
    }, (params) => herbDiscoveryService.gainHerbKnowledge(params));

    // 飞升系统MCP工具 (V230 Direction R: 飞升系统)
    mcpRegistry.registerTool('ascension.requirements.check', {
        name: 'ascension.requirements.check',
        description: 'Check if player meets ascension requirements',
        inputSchema: {
            type: 'object',
            properties: {
                detailed: { type: 'boolean', description: 'Include detailed requirement info' }
            }
        }
    }, (params) => ascensionService.mcpRequirementsCheck(params));

    mcpRegistry.registerTool('ascension.initiate', {
        name: 'ascension.initiate',
        description: 'Initiate the ascension process',
        inputSchema: {
            type: 'object',
            properties: {
                confirm: { type: 'boolean', description: 'Confirm ascension' }
            }
        }
    }, (params) => ascensionService.mcpInitiate(params));

    mcpRegistry.registerTool('ascension.tribulation.execute', {
        name: 'ascension.tribulation.execute',
        description: 'Execute the divine tribulation',
        inputSchema: {
            type: 'object',
            properties: {
                strikeNumber: { type: 'number', description: 'Current strike number' },
                resisted: { type: 'boolean', description: 'Whether the strike was resisted' }
            }
        }
    }, (params) => ascensionService.mcpTribulationExecute(params));

    mcpRegistry.registerTool('ascension.reward.claim', {
        name: 'ascension.reward.claim',
        description: 'Claim ascension rewards',
        inputSchema: {
            type: 'object',
            properties: {
                rewardIndex: { type: 'number', description: 'Specific reward index to claim (0-3), all if undefined' }
            }
        }
    }, (params) => ascensionService.mcpRewardClaim(params));

    mcpRegistry.registerTool('ascension.realm.query', {
        name: 'ascension.realm.query',
        description: 'Query current immortal realm status',
        inputSchema: {
            type: 'object',
            properties: {
                detailed: { type: 'boolean', description: 'Include detailed info' }
            }
        }
    }, (params) => ascensionService.mcpRealmQuery(params));

    mcpRegistry.registerTool('ascension.blessing.list', {
        name: 'ascension.blessing.list',
        description: 'List all divine blessings',
        inputSchema: {
            type: 'object',
            properties: {
                filter: { type: 'string', description: 'Filter by name or description' },
                showAll: { type: 'boolean', description: 'Show all blessings including acquired ones' }
            }
        }
    }, (params) => ascensionService.mcpBlessingList(params));

    // 仙界宗门MCP工具 (V231 Direction S: 仙界宗门系统)
    mcpRegistry.registerTool('sect.immortal.create', {
        name: 'sect.immortal.create',
        description: 'Create an immortal sect in the immortal realm',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Name of the immortal sect' }
            },
            required: ['name']
        }
    }, (params) => domainModules.immortalSect.mcpCreate(params));

    mcpRegistry.registerTool('sect.immortal.join', {
        name: 'sect.immortal.join',
        description: 'Join an existing immortal sect',
        inputSchema: {
            type: 'object',
            properties: {
                sectId: { type: 'string', description: 'UID of the sect to join' }
            },
            required: ['sectId']
        }
    }, (params) => domainModules.immortalSect.mcpJoin(params));

    mcpRegistry.registerTool('sect.immortal.resource.list', {
        name: 'sect.immortal.resource.list',
        description: 'List resources of an immortal sect',
        inputSchema: {
            type: 'object',
            properties: {
                sectId: { type: 'string', description: 'UID of the sect (optional, defaults to player sect)' }
            }
        }
    }, (params) => domainModules.immortalSect.mcpResourceList(params));

    mcpRegistry.registerTool('sect.immortal.trade.execute', {
        name: 'sect.immortal.trade.execute',
        description: 'Execute a trade between immortal sects',
        inputSchema: {
            type: 'object',
            properties: {
                targetSectId: { type: 'string', description: 'Target sect ID' },
                resourceType: { type: 'string', enum: ['spiritStones', 'pills', 'techniques', 'merit'] },
                amount: { type: 'number' },
                price: { type: 'number' }
            },
            required: ['targetSectId', 'resourceType', 'amount', 'price']
        }
    }, (params) => domainModules.immortalSect.mcpTradeExecute(params));

    mcpRegistry.registerTool('sect.immortal.disciple.promote', {
        name: 'sect.immortal.disciple.promote',
        description: 'Promote a mortal sect disciple to elite disciple',
        inputSchema: {
            type: 'object',
            properties: {
                discipleUid: { type: 'string', description: 'UID of the disciple to promote' }
            },
            required: ['discipleUid']
        }
    }, (params) => domainModules.immortalSect.mcpDisciplePromote(params));

    mcpRegistry.registerTool('sect.immortal.alliance.form', {
        name: 'sect.immortal.alliance.form',
        description: 'Form an alliance with another immortal sect',
        inputSchema: {
            type: 'object',
            properties: {
                targetSectId: { type: 'string', description: 'Target sect ID to ally with' }
            },
            required: ['targetSectId']
        }
    }, (params) => domainModules.immortalSect.mcpAllianceForm(params));

    // NPC进化工具 (Direction N: nanobot分布式mesh注册表 + generic-agent自我进化)
    mcpRegistry.registerTool('npc.evolution.register', {
        name: 'npc.evolution.register',
        description: 'Register NPC to learning system',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'Unique NPC identifier' },
                role: { type: 'string', description: 'NPC role (master/monster/merchant/fellow)' },
                dialogueBase: { type: 'array', description: 'Base dialogue entries' }
            },
            required: ['npcId']
        }
    }, (params) => npcEvolutionEngine.mcpRegister(params || {}));

    mcpRegistry.registerTool('npc.evolution.record', {
        name: 'npc.evolution.record',
        description: 'Record NPC-player interaction',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' },
                type: { type: 'string', description: 'Interaction type (trade/task/chat/combat/social)' },
                playerAction: { type: 'string', description: 'Player action description' },
                npcResponse: { type: 'string', description: 'NPC response description' },
                outcome: { type: 'object', description: 'Interaction outcome' }
            },
            required: ['npcId', 'type']
        }
    }, (params) => npcEvolutionEngine.mcpRecord(params || {}));

    mcpRegistry.registerTool('npc.evolution.get', {
        name: 'npc.evolution.get',
        description: 'Get NPC current learning status',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' }
            },
            required: ['npcId']
        }
    }, (params) => npcEvolutionEngine.mcpGet(params || {}));

    mcpRegistry.registerTool('npc.dialogue.add', {
        name: 'npc.dialogue.add',
        description: 'Add extended dialogue for NPC',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' },
                text: { type: 'string', description: 'Dialogue text' },
                category: { type: 'string', description: 'Dialogue category (base/extended/adaptive)' },
                metadata: { type: 'object', description: 'Additional metadata' }
            },
            required: ['npcId', 'text']
        }
    }, (params) => npcEvolutionEngine.mcpAddDialogue(params || {}));

    mcpRegistry.registerTool('npc.dialogue.list', {
        name: 'npc.dialogue.list',
        description: 'View NPC dialogue library',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' },
                filter: { type: 'object', description: 'Filter options' }
            },
            required: ['npcId']
        }
    }, (params) => npcEvolutionEngine.mcpListDialogues(params || {}));

    mcpRegistry.registerTool('npc.evolution.trigger', {
        name: 'npc.evolution.trigger',
        description: 'Manually trigger NPC behavior evolution evaluation',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' }
            },
            required: ['npcId']
        }
    }, (params) => npcEvolutionEngine.mcpTriggerEvolution(params || {}));

    // NPC对话生成服务 MCP工具 (V228 Direction N续: NPC自主进化引擎 - 对话生成)
    mcpRegistry.registerTool('npc.dialogue.generate', {
        name: 'npc.dialogue.generate',
        description: 'Generate NPC dialogue response based on player input and context',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' },
                playerMessage: { type: 'string', description: 'Player message to respond to' }
            },
            required: ['npcId', 'playerMessage']
        }
    }, (params) => npcDialogueService.mcpGenerateDialogue(params || {}));

    mcpRegistry.registerTool('npc.dialogue.context', {
        name: 'npc.dialogue.context',
        description: 'Get current dialogue context for NPC',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' }
            },
            required: ['npcId']
        }
    }, (params) => npcDialogueService.mcpGetContext(params || {}));

    mcpRegistry.registerTool('npc.memory.retrieve', {
        name: 'npc.memory.retrieve',
        description: 'Retrieve NPC memories and learning status',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' },
                type: { type: 'string', description: 'Memory type filter (interaction/preference/event/relationship)' },
                limit: { type: 'number', description: 'Maximum memories to retrieve' }
            },
            required: ['npcId']
        }
    }, (params) => npcDialogueService.mcpRetrieveMemory(params || {}));

    mcpRegistry.registerTool('npc.context.update', {
        name: 'npc.context.update',
        description: 'Update dialogue context fields for NPC',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' },
                updates: {
                    type: 'object',
                    description: 'Fields to update (currentTopic, emotion, goal, tone)',
                    properties: {
                        currentTopic: { type: 'string' },
                        emotion: { type: 'string' },
                        goal: { type: 'string' },
                        tone: { type: 'string' }
                    }
                }
            },
            required: ['npcId', 'updates']
        }
    }, (params) => npcDialogueService.mcpUpdateContext(params || {}));

    mcpRegistry.registerTool('npc.dialogue.reset', {
        name: 'npc.dialogue.reset',
        description: 'Reset NPC dialogue state',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' },
                clearMemories: { type: 'boolean', description: 'Also clear NPC memories' }
            },
            required: ['npcId']
        }
    }, (params) => npcDialogueService.mcpResetDialogue(params || {}));

    mcpRegistry.registerTool('npc.tone.set', {
        name: 'npc.tone.set',
        description: 'Set NPC dialogue tone',
        inputSchema: {
            type: 'object',
            properties: {
                npcId: { type: 'string', description: 'NPC identifier' },
                tone: { type: 'string', description: 'Tone to set (formal/casual/mysterious)' }
            },
            required: ['npcId', 'tone']
        }
    }, (params) => npcDialogueService.mcpSetTone(params || {}));
    mcpRegistry.registerTool('event.bus.publish', {
        name: 'event.bus.publish',
        description: 'Publish an event to the realm event bus',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Event type' },
                data: { type: 'object', description: 'Event data payload' },
                source: { type: 'string', description: 'Event source' },
                target: { type: 'string', description: 'Event target' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] }
            },
            required: ['type']
        }
    }, (params) => {
        const { mcpPublish } = require('./systems/event/RealmEventBus.js');
        return mcpPublish(params);
    });

    mcpRegistry.registerTool('event.bus.subscribe', {
        name: 'event.bus.subscribe',
        description: 'Subscribe to events matching a pattern',
        inputSchema: {
            type: 'object',
            properties: {
                pattern: { type: 'string', description: 'Event pattern (glob supported)' },
                subscriberId: { type: 'string', description: 'Subscriber ID' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] }
            },
            required: ['pattern']
        }
    }, (params) => {
        const { mcpSubscribe } = require('./systems/event/RealmEventBus.js');
        return mcpSubscribe(params);
    });

    mcpRegistry.registerTool('event.bus.unsubscribe', {
        name: 'event.bus.unsubscribe',
        description: 'Unsubscribe from an event',
        inputSchema: {
            type: 'object',
            properties: {
                subscriberId: { type: 'string', description: 'Subscriber ID to remove' }
            },
            required: ['subscriberId']
        }
    }, (params) => {
        const { mcpUnsubscribe } = require('./systems/event/RealmEventBus.js');
        return mcpUnsubscribe(params);
    });

    mcpRegistry.registerTool('event.bus.history', {
        name: 'event.bus.history',
        description: 'View event history',
        inputSchema: {
            type: 'object',
            properties: {
                eventType: { type: 'string', description: 'Filter by event type' },
                source: { type: 'string', description: 'Filter by source' },
                since: { type: 'number', description: 'Filter events since timestamp' },
                limit: { type: 'number', description: 'Max events to return' }
            }
        }
    }, (params) => {
        const { mcpHistory } = require('./systems/event/RealmEventBus.js');
        return mcpHistory(params);
    });

    mcpRegistry.registerTool('event.cascade.trigger', {
        name: 'event.cascade.trigger',
        description: 'Manually trigger a cascade of events',
        inputSchema: {
            type: 'object',
            properties: {
                initialEvent: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        data: { type: 'object' },
                        source: { type: 'string' }
                    },
                    required: ['type']
                },
                followUpEvents: { type: 'array' },
                maxDepth: { type: 'number' }
            },
            required: ['initialEvent']
        }
    }, (params) => {
        const { mcpCascadeTrigger } = require('./systems/event/RealmEventBus.js');
        return mcpCascadeTrigger(params);
    });

    mcpRegistry.registerTool('event.subscriber.list', {
        name: 'event.subscriber.list',
        description: 'List all event subscribers',
        inputSchema: {
            type: 'object',
            properties: {
                pattern: { type: 'string', description: 'Filter by pattern' },
                subscriberId: { type: 'string', description: 'Filter by subscriber ID' }
            }
        }
    }, (params) => {
        const { mcpSubscriberList } = require('./systems/event/RealmEventBus.js');
        return mcpSubscriberList(params);
    });

    // 事件分析工具 (Direction O续: 仙界事件总线 - 事件历史分析)
    mcpRegistry.registerTool('event.analytics.stats', {
        name: 'event.analytics.stats',
        description: 'Get event statistics including counts by type, source, and priority',
        inputSchema: {
            type: 'object',
            properties: {
                eventType: { type: 'string', description: 'Filter by event type' },
                source: { type: 'string', description: 'Filter by source' },
                timeRange: {
                    type: 'object',
                    description: 'Time range filter',
                    properties: {
                        since: { type: 'number' },
                        until: { type: 'number' }
                    }
                }
            }
        }
    }, (params) => {
        const { mcpAnalyticsStats } = require('./systems/event/EventAnalyticsService.js');
        return mcpAnalyticsStats(params);
    });

    mcpRegistry.registerTool('event.analytics.trend', {
        name: 'event.analytics.trend',
        description: 'Get event trends over time with moving averages',
        inputSchema: {
            type: 'object',
            properties: {
                windowSize: { type: 'number', description: 'Number of time windows' },
                eventType: { type: 'string', description: 'Filter by event type' },
                granularity: { type: 'string', enum: ['minute', 'hour', 'day'] }
            }
        }
    }, (params) => {
        const { mcpAnalyticsTrend } = require('./systems/event/EventAnalyticsService.js');
        return mcpAnalyticsTrend(params);
    });

    mcpRegistry.registerTool('event.analytics.pattern', {
        name: 'event.analytics.pattern',
        description: 'Detect recurring event patterns and sequences',
        inputSchema: {
            type: 'object',
            properties: {
                sequenceLength: { type: 'number', description: 'Max sequence length' },
                minOccurrences: { type: 'number', description: 'Minimum occurrences' },
                eventType: { type: 'string', description: 'Filter by event type' }
            }
        }
    }, (params) => {
        const { mcpAnalyticsPattern } = require('./systems/event/EventAnalyticsService.js');
        return mcpAnalyticsPattern(params);
    });

    mcpRegistry.registerTool('event.analytics.anomaly', {
        name: 'event.analytics.anomaly',
        description: 'Detect anomalous events using statistical analysis',
        inputSchema: {
            type: 'object',
            properties: {
                threshold: { type: 'number', description: 'Z-score threshold' },
                windowSize: { type: 'number', description: 'Window size for analysis' },
                source: { type: 'string', description: 'Filter by source' }
            }
        }
    }, (params) => {
        const { mcpAnalyticsAnomaly } = require('./systems/event/EventAnalyticsService.js');
        return mcpAnalyticsAnomaly(params);
    });

    mcpRegistry.registerTool('event.history.query', {
        name: 'event.history.query',
        description: 'Query historical events with filtering and pagination',
        inputSchema: {
            type: 'object',
            properties: {
                eventType: { type: 'string', description: 'Filter by event type' },
                source: { type: 'string', description: 'Filter by source' },
                since: { type: 'number', description: 'Start timestamp' },
                until: { type: 'number', description: 'End timestamp' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                dataFilter: { type: 'object', description: 'Filter by event data' },
                limit: { type: 'number', description: 'Max results' },
                offset: { type: 'number', description: 'Offset for pagination' }
            }
        }
    }, (params) => {
        const { mcpHistoryQuery } = require('./systems/event/EventAnalyticsService.js');
        return mcpHistoryQuery(params);
    });

    mcpRegistry.registerTool('event.analytics.forecast', {
        name: 'event.analytics.forecast',
        description: 'Predict future events based on historical patterns',
        inputSchema: {
            type: 'object',
            properties: {
                horizonHours: { type: 'number', description: 'Forecast horizon in hours' },
                eventType: { type: 'string', description: 'Filter by event type' }
            }
        }
    }, (params) => {
        const { mcpAnalyticsForecast } = require('./systems/event/EventAnalyticsService.js');
        return mcpAnalyticsForecast(params);
    });
}

// ===== 持久化系统 =====

/**
 * 执行游戏保存
 */
function doSaveGameWithFeedback() {
    const result = doSaveGame();
    if (result.success) {
        addLog('good', '💾 存档成功', `游戏已保存 (${(result.size / 1024).toFixed(1)}KB)`);
    } else {
        addLog('bad', '💾 存档失败', result.error);
    }
    return result;
}

/**
 * 加载游戏
 */
function doLoadGameWithFeedback() {
    const result = doLoadGame();
    if (result.success) {
        gameState = result.data;
        isGameInitialized = true;
        addLog('good', '📂 读档成功', '游戏已从存档恢复');
        updateDisplay();
    } else {
        addLog('bad', '📂 读档失败', result.error);
    }
    return result;
}

/**
 * 重置游戏
 */
function doResetGame() {
    if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
        localStorage.removeItem('cultivationSave');
        localStorage.removeItem('cultivation_sim_autosave');
        localStorage.removeItem('cultivation_save_history');
        startNewGame();
        addLog('warn', '⚠️ 游戏重置', '所有数据已清除');
    }
}

/**
 * 自动保存
 */
function autoSave() {
    if (gameState?.settings?.autoSaveEnabled !== false) {
        saveGame();
    }
}

// ===== 离线系统 =====

/**
 * 初始化离线管理器
 */
function initializeOfflineManager() {
    // 离线管理器初始化（使用 powerSync 全局实例）
    console.log('[Main] 离线管理器初始化完成');
}

/**
 * 处理离线收益
 */
function processOfflineEarnings() {
    if (!isGameInitialized) return;
    
    const snapshot = powerSync.captureSnapshot(gameState);
    const result = powerSync.restoreFromSnapshot(snapshot, gameState);
    
    if (result.offlineEarnings > 0) {
        console.log(`[Offline] 离线收益: ${result.offlineEarnings} 灵石 (${result.offlineHours.toFixed(1)}小时)`);
    }
}

// ===== 日志系统 =====

/**
 * 日志数组
 */
let gameLogs = [];

/**
 * 添加游戏日志
 */
function addLog(type, title, message) {
    const entry = {
        id: Date.now() + Math.random(),
        type, // 'good' | 'bad' | 'info' | 'warn'
        title,
        message,
        timestamp: Date.now()
    };
    
    gameLogs.unshift(entry);
    
    // 限制日志数量
    if (gameLogs.length > 100) {
        gameLogs = gameLogs.slice(0, 100);
    }
    
    // 输出到控制台
    const color = type === 'good' ? '#4CAF50' : type === 'bad' ? '#F44336' : type === 'warn' ? '#FF9800' : '#2196F3';
    console.log(`%c[${title}] ${message}`, `color:${color}`);
    
    return entry;
}

/**
 * 获取游戏日志
 */
function getLogs(limit = 50) {
    return gameLogs.slice(0, limit);
}

/**
 * 清除日志
 */
function clearLogs() {
    gameLogs = [];
}

// ===== 游戏循环 =====

/**
 * 游戏主循环
 */
function gameLoop() {
    if (!isGameRunning) return;
    
    const now = Date.now();
    const deltaTime = now - lastUpdateTime;
    lastUpdateTime = now;
    
    // 更新游戏时间
    if (gameState) {
        gameState.totalPlayTime += deltaTime;
    }
    
    // 处理领域模块更新
    updateDomainModules(deltaTime);
    
    // 检查离线收益
    if (deltaTime > 60000) { // 超过1分钟可能是因为标签页隐藏
        processOfflineEarnings();
    }
    
    // 更新UI显示
    updateDisplayIfNeeded();
}

/**
 * 更新领域模块
 */
function updateDomainModules(deltaTime) {
    // 更新灵气恢复
    if (gameState?.player?.qi !== undefined) {
        const qiRegenRate = 1 + (gameState.realm || 0) * 0.5;
        gameState.player.qi = Math.min(
            gameState.player.qi + qiRegenRate * (deltaTime / 1000),
            getMaxQi()
        );
    }
}

/**
 * 获取最大灵气
 */
function getMaxQi() {
    const baseMax = 100;
    const realmBonus = (gameState?.realm || 0) * 50;
    return baseMax + realmBonus;
}

/**
 * UI更新相关
 */
let lastUIUpdate = 0;

/**
 * 条件性更新显示
 */
function updateDisplayIfNeeded() {
    const now = Date.now();
    if (now - lastUIUpdate > GAME_LOOP_CONFIG.uiUpdateInterval) {
        lastUIUpdate = now;
        // 可以添加条件更新逻辑
    }
}

// ===== 事件调度 =====

/**
 * 事件队列
 */
const eventQueue = [];

/**
 * 调度事件
 */
function scheduleEvent(eventName, callback, delay = 0) {
    const event = {
        id: Date.now() + Math.random(),
        eventName,
        callback,
        executeAt: Date.now() + delay,
        delay
    };
    eventQueue.push(event);
    return event.id;
}

/**
 * 处理事件队列
 */
function processEventQueue() {
    const now = Date.now();
    const dueEvents = eventQueue.filter(e => e.executeAt <= now);
    
    for (const event of dueEvents) {
        try {
            event.callback();
        } catch (e) {
            console.error(`[Event] Event ${event.eventName} error:`, e);
        }
    }
    
    // 移除已处理的事件
    eventQueue.splice(0, dueEvents.length);
}

/**
 * 清除事件
 */
function clearEvents(eventName) {
    const index = eventQueue.findIndex(e => e.eventName === eventName);
    if (index !== -1) {
        eventQueue.splice(index, 1);
    }
}

// ===== 全局函数暴露 =====

/**
 * 初始化游戏
 */
async function init() {
    console.log('[Main] 游戏初始化中...');
    
    // 创建游戏状态
    gameState = createInitialGameState();
    
    // 初始化领域模块
    initializeDomainModules();
    
    // 初始化离线系统
    initializeOfflineManager();
    
    // 注册 MCP 工具
    registerMCPTools();
    
    // 尝试加载存档
    const savedGame = localStorage.getItem('cultivationSave');
    if (savedGame) {
        try {
            gameState = JSON.parse(savedGame);
            addLog('info', '📂 存档加载', '检测到存档，数据已恢复');
            
            // 处理离线收益
            processOfflineEarnings();
        } catch (e) {
            console.error('[Main] 存档解析失败:', e);
            addLog('warn', '⚠️ 存档损坏', '使用新游戏');
        }
    }
    
    // 标记已初始化
    isGameInitialized = true;
    
    // 启动游戏循环
    startGameLoop();
    
    console.log('[Main] 游戏初始化完成');
    addLog('good', '🎮 游戏就绪', '欢迎来到修仙世界');
    
    return gameState;
}

/**
 * 开始新游戏
 */
function startNewGame() {
    console.log('[Main] 开始新游戏...');
    
    // 重置游戏状态
    gameState = createInitialGameState();
    gameLogs = [];
    
    // 重新初始化领域模块
    initializeDomainModules();
    
    // 标记已初始化
    isGameInitialized = true;
    
    // 保存新游戏
    autoSave();
    
    addLog('good', '🆕 新游戏', '第1天 | 炼气期初期');
    updateDisplay();
    
    return gameState;
}

/**
 * 启动游戏循环
 */
function startGameLoop() {
    if (gameLoopTimer) {
        clearInterval(gameLoopTimer);
    }
    
    isGameRunning = true;
    lastUpdateTime = Date.now();
    
    gameLoopTimer = setInterval(gameLoop, GAME_LOOP_CONFIG.tickInterval);
    console.log(`[Main] 游戏循环启动 (间隔: ${GAME_LOOP_CONFIG.tickInterval}ms)`);
}

/**
 * 停止游戏循环
 */
function stopGameLoop() {
    isGameRunning = false;
    if (gameLoopTimer) {
        clearInterval(gameLoopTimer);
        gameLoopTimer = null;
    }
    console.log('[Main] 游戏循环已停止');
}

/**
 * 更新显示
 */
function updateDisplay() {
    if (!gameState) return;
    
    // 触发自定义事件让UI层处理
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gameStateUpdated', { detail: gameState }));
    }
    
    // 更新最后更新时间
    lastUIUpdate = Date.now();
}

/**
 * 获取游戏状态
 */
function getGameState() {
    return gameState;
}

/**
 * 设置游戏状态字段
 */
function setGameStateField(path, value) {
    const keys = path.split('.');
    let current = gameState;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
}

/**
 * 获取游戏状态字段
 */
function getGameStateField(path) {
    const keys = path.split('.');
    let current = gameState;
    
    for (const key of keys) {
        if (current === undefined) return undefined;
        current = current[key];
    }
    
    return current;
}

// ===== 便捷方法 =====

/**
 * 获取玩家信息
 */
function getPlayerInfo() {
    if (!gameState) return null;
    return {
        name: gameState.player?.name,
        level: gameState.player?.level,
        realm: gameState.realm,
        stage: gameState.stage,
        spiritStones: gameState.player?.spiritStones,
        qi: gameState.player?.qi
    };
}

/**
 * 获取当前境界信息
 */
function getRealmInfo() {
    if (!gameState) return null;
    
    const realms = ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'];
    const stages = ['初期', '中期', '后期'];
    
    return {
        realm: gameState.realm,
        realmName: realms[gameState.realm] || '未知',
        stage: gameState.stage,
        stageName: stages[gameState.stage] || '未知',
        cultivationProgress: gameState.cultivationProgress
    };
}

/**
 * 推进时间（天数）
 */
function advanceDay(days = 1) {
    if (!gameState) return;
    gameState.days += days;
    addLog('info', '📅 时间推进', `第 ${gameState.days} 天`);
    updateDisplay();
}

// ===== 游戏结束处理 =====

/**
 * 保存并退出
 */
function saveAndExit() {
    autoSave();
    stopGameLoop();
    addLog('info', '👋 游戏已保存', '下次见，修仙者！');
}

/**
 * 获取游戏统计信息
 */
function getGameStats() {
    if (!gameState) return null;
    
    return {
        days: gameState.days,
        totalPlayTime: gameState.totalPlayTime,
        realm: getRealmInfo(),
        achievements: gameState.achievementState?.completedAchievements?.length || 0,
        pets: gameState.pets?.length || 0,
        sect: gameState.sect ? '已加入宗门' : '无'
    };
}

// ===== 导出 =====

// ES Module 导出
export {
    // 初始化
    init,
    startNewGame,
    
    // 游戏状态
    getGameState,
    setGameStateField,
    getGameStateField,
    
    // 游戏循环
    startGameLoop,
    stopGameLoop,
    gameLoop,
    
    // 显示更新
    updateDisplay,
    
    // 持久化
    saveGame,
    doSaveGame,
    doSaveGameWithFeedback,
    loadGame,
    doLoadGame,
    doLoadGameWithFeedback,
    doResetGame,
    showSaveLoadModal,
    autoSave,
    getSaveHistory,
    
    // 离线系统
    processOfflineEarnings,
    
    // 日志
    addLog,
    getLogs,
    clearLogs,
    
    // 领域模块
    getDomainModule,
    domainModules,
    
    // MCP
    mcpRegistry,
    registerMCPTools,
    
    // 事件调度
    scheduleEvent,
    clearEvents,
    processEventQueue,
    
    // 便捷方法
    getPlayerInfo,
    getRealmInfo,
    advanceDay,
    getGameStats,
    saveAndExit,
    
    // 配置
    CONFIG,
    GAME_LOOP_CONFIG
};

// 浏览器环境全局暴露
if (typeof window !== 'undefined') {
    window.init = init;
    window.startNewGame = startNewGame;
    window.getGameState = getGameState;
    window.setGameStateField = setGameStateField;
    window.getGameStateField = getGameStateField;
    window.updateDisplay = updateDisplay;
    window.saveGame = saveGame;
    window.doSaveGame = doSaveGameWithFeedback;
    window.loadGame = loadGame;
    window.doLoadGame = doLoadGameWithFeedback;
    window.doResetGame = doResetGame;
    window.showSaveLoadModal = showSaveLoadModal;
    window.addLog = addLog;
    window.getLogs = getLogs;
    window.clearLogs = clearLogs;
    window.mcpRegistry = mcpRegistry;
    window.getPlayerInfo = getPlayerInfo;
    window.getRealmInfo = getRealmInfo;
    window.advanceDay = advanceDay;
    window.getGameStats = getGameStats;
    window.gameState = gameState;
    window.saveAndExit = saveAndExit;
}

console.log('[Main] main.js 模块加载完成');