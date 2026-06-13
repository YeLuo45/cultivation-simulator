/**
 * NPCDialogueService.js - NPC对话生成服务
 * V228 Direction N续: NPC自主进化引擎 - 对话生成
 * 
 * 6个MCP工具：
 * - npc.dialogue.generate - 生成NPC对话回复
 * - npc.dialogue.context - 获取当前对话上下文
 * - npc.memory.retrieve - 检索NPC记忆
 * - npc.context.update - 更新对话上下文
 * - npc.dialogue.reset - 重置NPC对话状态
 * - npc.tone.set - 设置NPC对话语气
 */

import { npcEvolutionEngine } from './NPCEvolutionEngine.js';
import { NPC_ROLE_REGISTRY } from './NPCCollaboration.js';

// ===== 对话模板 =====

/**
 * Dialogue Templates by role and tone
 */
const DIALOGUE_TEMPLATES = {
    master: {
        formal: [
            { template: '徒儿，{topic}，为师甚感欣慰。', variables: ['topic'] },
            { template: '修仙之路艰难，{topic}，你需勤加修炼。', variables: ['topic'] },
            { template: '为师观你根骨，{topic}，日后必成大器。', variables: ['topic'] }
        ],
        casual: [
            { template: '徒儿啊，{topic}，这事为师也不好多说。', variables: ['topic'] },
            { template: '说起来，{topic}，你自己好好琢磨琢磨。', variables: ['topic'] }
        ],
        mysterious: [
            { template: '天机不可泄露，{topic}，你且记住便是。', variables: ['topic'] },
            { template: '冥冥之中自有定数，{topic}，无需多问。', variables: ['topic'] }
        ]
    },
    merchant: {
        formal: [
            { template: '这位道友，{topic}，本店应有尽有。', variables: ['topic'] },
            { template: '客官，{topic}，您眼光真是独到。', variables: ['topic'] }
        ],
        casual: [
            { template: '哟，{topic}，来看看这个，保证便宜！', variables: ['topic'] },
            { template: '嘿，{topic}，我这儿可是货真价实！', variables: ['topic'] }
        ],
        mysterious: [
            { template: '这些东西嘛，{topic}，来历可不简单。', variables: ['topic'] },
            { template: '你我有缘，{topic}，便赠你一句：莫贪便宜。', variables: ['topic'] }
        ]
    },
    fellow: {
        formal: [
            { template: '道兄，{topic}，不知有何见教？', variables: ['topic'] },
            { template: '这位道友，{topic}，吾等当共勉之。', variables: ['topic'] }
        ],
        casual: [
            { template: '嘿，{topic}，最近修炼得怎么样？', variables: ['topic'] },
            { template: '说起来，{topic}，咱们一块儿去探险如何？', variables: ['topic'] }
        ],
        mysterious: [
            { template: '我昨夜占了一卦，{topic}，你且听好。', variables: ['topic'] },
            { template: '天机示现，{topic}，恐有大事发生。', variables: ['topic'] }
        ]
    },
    monster: {
        formal: [
            { template: '卑微的人类，{topic}，速速离去！', variables: ['topic'] },
            { template: '哼，{topic}，本座不屑与你计较。', variables: ['topic'] }
        ],
        casual: [
            { template: '哟，{topic}，又来送死了？', variables: ['topic'] },
            { template: '哈哈哈，{topic}，正好饿了！', variables: ['topic'] }
        ],
        mysterious: [
            { template: '千年沉睡中，{topic}，吾已等待多时。', variables: ['topic'] },
            { template: '命运的齿轮转动，{topic}，一切皆有定数。', variables: ['topic'] }
        ]
    }
};

// 默认模板（当角色不匹配时使用）
const DEFAULT_TEMPLATES = {
    formal: [
        { template: '这位修士，{topic}，有何贵干？', variables: ['topic'] }
    ],
    casual: [
        { template: '嘿，{topic}，有什么事吗？', variables: ['topic'] }
    ],
    mysterious: [
        { template: '天机玄妙，{topic}，吾难以参透。', variables: ['topic'] }
    ]
};

// ===== 对话上下文管理 =====

/**
 * DialogueContext - 单个NPC的对话上下文
 */
class DialogueContext {
    constructor(npcId) {
        this.npcId = npcId;
        this.conversationHistory = [];  // 对话历史
        this.currentTopic = null;       // 当前话题
        this.emotion = 'neutral';        // neutral/positive/negative
        this.goal = null;               // 当前对话目标
        this.turnCount = 0;              // 对话轮次
        this.lastPlayerMessage = null;   // 上次玩家消息
        this.lastGeneratedDialogue = null; // 上次生成的对话
        this.tone = 'formal';           // 默认语气
        this.createdAt = Date.now();
        this.updatedAt = Date.now();
    }
    
    /**
     * 添加对话到历史
     */
    addToHistory(playerMessage, npcResponse) {
        this.conversationHistory.push({
            playerMessage,
            npcResponse,
            timestamp: Date.now(),
            turn: this.turnCount
        });
        this.lastPlayerMessage = playerMessage;
        this.lastGeneratedDialogue = npcResponse;
        this.turnCount++;
        this.updatedAt = Date.now();
    }
    
    /**
     * 重置上下文
     */
    reset() {
        this.conversationHistory = [];
        this.currentTopic = null;
        this.emotion = 'neutral';
        this.goal = null;
        this.turnCount = 0;
        this.lastPlayerMessage = null;
        this.lastGeneratedDialogue = null;
        this.updatedAt = Date.now();
    }
}

// ===== NPC记忆检索 =====

/**
 * NPCMemoryEntry - 记忆条目
 */
class NPCMemoryEntry {
    constructor(type, content, metadata = {}) {
        this.id = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;           // 'interaction' | 'preference' | 'event' | 'relationship'
        this.content = content;
        this.metadata = metadata;
        this.importance = metadata.importance || 0.5;  // 0-1
        this.createdAt = Date.now();
        this.lastAccessedAt = Date.now();
        this.accessCount = 0;
    }
    
    /**
     * 访问记忆
     */
    access() {
        this.lastAccessedAt = Date.now();
        this.accessCount++;
    }
}

// ===== NPC对话生成服务 =====

/**
 * NPCDialogueService - NPC对话生成服务主类
 */
class NPCDialogueService {
    constructor() {
        this.contexts = new Map();        // npcId -> DialogueContext
        this.memories = new Map();        // npcId -> NPCMemoryEntry[]
        this.toneSettings = new Map();     // npcId -> tone setting
        this.gameState = null;
        this.initialized = false;
        
        // 模板缓存
        this.templateCache = new Map();
        
        // 最大记忆条数
        this.maxMemoriesPerNPC = 100;
        // 最大上下文历史
        this.maxContextHistory = 50;
    }
    
    /**
     * 初始化服务
     */
    init(gameState) {
        this.gameState = gameState;
        this.initialized = true;
        console.log('[NPCDialogueService] NPC对话生成服务初始化完成');
        return { success: true };
    }
    
    /**
     * 获取或创建NPC上下文
     */
    getOrCreateContext(npcId) {
        if (!this.contexts.has(npcId)) {
            this.contexts.set(npcId, new DialogueContext(npcId));
        }
        return this.contexts.get(npcId);
    }
    
    /**
     * 获取玩家上下文信息
     */
    getPlayerContext() {
        if (!this.gameState) return null;
        
        return {
            name: this.gameState.player?.name || '未知修士',
            level: this.gameState.player?.level || 1,
            realm: this.gameState.realm || 0,
            stage: this.gameState.stage || 0,
            reputation: this.gameState.player?.reputation || 0
        };
    }
    
    /**
     * 从NPCEvolutionEngine获取NPC学习状态
     */
    getNPCLearningStatus(npcId) {
        try {
            const status = npcEvolutionEngine.registry.getLearningStatus(npcId);
            return status;
        } catch (e) {
            return null;
        }
    }
    
    // ===== MCP工具实现 =====
    
    /**
     * MCP: npc.dialogue.generate
     * 生成NPC对话回复
     */
    mcpGenerateDialogue(params = {}) {
        const { npcId, playerMessage, context: customContext } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        if (!playerMessage) {
            return { success: false, reason: 'Missing playerMessage parameter' };
        }
        
        // 获取NPC角色
        const role = this.extractRole(npcId);
        
        // 获取上下文
        const ctx = this.getOrCreateContext(npcId);
        
        // 获取记忆用于上下文丰富
        const memories = this.getMemories(npcId);
        const relevantMemories = this.findRelevantMemories(memories, playerMessage);
        
        // 生成对话
        const generated = this.generateDialogue(npcId, role, playerMessage, ctx, relevantMemories);
        
        // 更新上下文
        ctx.addToHistory(playerMessage, generated.text);
        if (ctx.turnCount === 1) {
            ctx.currentTopic = this.extractTopic(playerMessage);
        }
        
        // 记录到记忆
        this.recordMemory(npcId, 'interaction', {
            playerMessage,
            npcResponse: generated.text
        }, { importance: 0.5 });
        
        return {
            tool: 'npc.dialogue.generate',
            success: true,
            npcId,
            dialogue: generated,
            context: {
                turnCount: ctx.turnCount,
                currentTopic: ctx.currentTopic,
                emotion: ctx.emotion,
                tone: ctx.tone
            }
        };
    }
    
    /**
     * 提取NPC角色
     */
    extractRole(npcId) {
        const lowerNpcId = npcId.toLowerCase();
        
        // 精确匹配
        if (NPC_ROLE_REGISTRY[lowerNpcId]) {
            return lowerNpcId;
        }
        
        // 前缀匹配
        for (const role of Object.keys(NPC_ROLE_REGISTRY)) {
            if (lowerNpcId.startsWith(role) || lowerNpcId.includes(role)) {
                return role;
            }
        }
        
        return 'fellow'; // 默认角色
    }
    
    /**
     * 提取话题
     */
    extractTopic(message) {
        // 简单的话题提取逻辑
        const keywords = {
            '修炼': 'cultivation',
            '突破': 'breakthrough',
            '灵根': 'spirit_root',
            '丹药': 'pill',
            '功法': 'technique',
            '任务': 'task',
            '战斗': 'combat',
            '交易': 'trade',
            '切磋': 'sparring'
        };
        
        for (const [keyword, topic] of Object.entries(keywords)) {
            if (message.includes(keyword)) {
                return topic;
            }
        }
        
        return 'general';
    }
    
    /**
     * 生成对话
     */
    generateDialogue(npcId, role, playerMessage, context, memories) {
        // 获取当前设置的tone
        const tone = this.toneSettings.get(npcId) || context.tone || 'formal';
        
        // 获取模板
        const templates = DIALOGUE_TEMPLATES[role] || DEFAULT_TEMPLATES;
        const toneTemplates = templates[tone] || templates.formal;
        
        if (toneTemplates.length === 0) {
            return { text: '...', tone, source: 'default' };
        }
        
        // 基于记忆和上下文选择模板
        let selectedTemplate = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
        
        // 如果有相关记忆，考虑使用相关记忆中的内容
        if (memories.length > 0) {
            const recentMemory = memories[0];
            if (recentMemory.content.npcResponse) {
                // 轻微变体：复用最近的对话风格
                const variantIndex = Math.floor(Math.random() * toneTemplates.length);
                selectedTemplate = toneTemplates[variantIndex];
            }
        }
        
        // 替换变量
        let text = selectedTemplate.template;
        const topic = this.extractTopic(playerMessage);
        const topicMap = {
            'cultivation': '修炼之事',
            'breakthrough': '突破之机',
            'spirit_root': '灵根之道',
            'pill': '丹药之理',
            'technique': '功法之妙',
            'task': '任务之约',
            'combat': '战斗之道',
            'trade': '交易之道',
            'sparring': '切磋之谊',
            'general': '修行之路'
        };
        
        text = text.replace('{topic}', topicMap[topic] || topicMap.general);
        
        return {
            text,
            tone,
            template: selectedTemplate.template,
            source: 'template'
        };
    }
    
    /**
     * MCP: npc.dialogue.context
     * 获取当前对话上下文
     */
    mcpGetContext(params = {}) {
        const { npcId } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        const ctx = this.contexts.get(npcId);
        
        if (!ctx) {
            return {
                success: true,
                npcId,
                exists: false,
                message: 'No active dialogue context'
            };
        }
        
        return {
            tool: 'npc.dialogue.context',
            success: true,
            npcId,
            exists: true,
            context: {
                conversationHistory: ctx.conversationHistory.slice(-10), // 最近10条
                currentTopic: ctx.currentTopic,
                emotion: ctx.emotion,
                goal: ctx.goal,
                turnCount: ctx.turnCount,
                lastPlayerMessage: ctx.lastPlayerMessage,
                lastGeneratedDialogue: ctx.lastGeneratedDialogue,
                tone: ctx.tone,
                createdAt: ctx.createdAt,
                updatedAt: ctx.updatedAt
            }
        };
    }
    
    /**
     * MCP: npc.memory.retrieve
     * 检索NPC记忆
     */
    mcpRetrieveMemory(params = {}) {
        const { npcId, type, limit = 10 } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        // 首先尝试从NPCEvolutionEngine获取学习数据
        const learningStatus = this.getNPCLearningStatus(npcId);
        
        // 获取本地记忆
        const memories = this.getMemories(npcId);
        let filtered = memories;
        
        if (type) {
            filtered = memories.filter(m => m.type === type);
        }
        
        // 按重要性排序
        filtered.sort((a, b) => b.importance - a.importance);
        
        // 限制数量
        filtered = filtered.slice(0, limit);
        
        // 更新访问时间
        for (const memory of filtered) {
            memory.access();
        }
        
        return {
            tool: 'npc.memory.retrieve',
            success: true,
            npcId,
            memories: filtered,
            totalMemories: memories.length,
            learningStatus: learningStatus ? {
                adaptationLevel: learningStatus.adaptationLevel,
                behaviorPattern: learningStatus.behaviorPattern,
                stats: learningStatus.stats
            } : null
        };
    }
    
    /**
     * 获取NPC记忆
     */
    getMemories(npcId) {
        if (!this.memories.has(npcId)) {
            this.memories.set(npcId, []);
        }
        return this.memories.get(npcId);
    }
    
    /**
     * 记录记忆
     */
    recordMemory(npcId, type, content, metadata = {}) {
        const memories = this.getMemories(npcId);
        
        const entry = new NPCMemoryEntry(type, content, metadata);
        memories.push(entry);
        
        // 限制记忆数量
        if (memories.length > this.maxMemoriesPerNPC) {
            // 删除最不重要的记忆
            memories.sort((a, b) => a.importance - b.importance);
            memories.shift();
        }
        
        return entry;
    }
    
    /**
     * 查找相关记忆
     */
    findRelevantMemories(memories, query) {
        if (memories.length === 0) return [];
        
        const queryWords = query.toLowerCase().split(/\s+/);
        
        return memories
            .map(memory => {
                let relevance = 0;
                const contentStr = JSON.stringify(memory.content).toLowerCase();
                
                for (const word of queryWords) {
                    if (contentStr.includes(word)) {
                        relevance += 0.3;
                    }
                }
                
                // 基于访问频率
                relevance += Math.min(memory.accessCount * 0.05, 0.3);
                
                // 基于重要性
                relevance += memory.importance * 0.2;
                
                return { memory, relevance };
            })
            .filter(item => item.relevance > 0.1)
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 5)
            .map(item => item.memory);
    }
    
    /**
     * MCP: npc.context.update
     * 更新对话上下文
     */
    mcpUpdateContext(params = {}) {
        const { npcId, updates } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        if (!updates) {
            return { success: false, reason: 'Missing updates parameter' };
        }
        
        const ctx = this.getOrCreateContext(npcId);
        
        // 应用更新
        if (updates.currentTopic !== undefined) {
            ctx.currentTopic = updates.currentTopic;
        }
        if (updates.emotion !== undefined) {
            ctx.emotion = updates.emotion;
        }
        if (updates.goal !== undefined) {
            ctx.goal = updates.goal;
        }
        if (updates.tone !== undefined) {
            ctx.tone = updates.tone;
            this.toneSettings.set(npcId, updates.tone);
        }
        
        ctx.updatedAt = Date.now();
        
        return {
            tool: 'npc.context.update',
            success: true,
            npcId,
            updatedFields: Object.keys(updates),
            context: {
                currentTopic: ctx.currentTopic,
                emotion: ctx.emotion,
                goal: ctx.goal,
                tone: ctx.tone,
                turnCount: ctx.turnCount
            }
        };
    }
    
    /**
     * MCP: npc.dialogue.reset
     * 重置NPC对话状态
     */
    mcpResetDialogue(params = {}) {
        const { npcId, clearMemories = false } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        const ctx = this.contexts.get(npcId);
        const hadContext = !!ctx;
        
        // 重置上下文
        if (ctx) {
            ctx.reset();
        }
        
        // 可选：清除记忆
        if (clearMemories) {
            this.memories.delete(npcId);
        }
        
        // 清除tone设置
        this.toneSettings.delete(npcId);
        
        return {
            tool: 'npc.dialogue.reset',
            success: true,
            npcId,
            hadContext,
            memoriesCleared: clearMemories
        };
    }
    
    /**
     * MCP: npc.tone.set
     * 设置NPC对话语气
     */
    mcpSetTone(params = {}) {
        const { npcId, tone } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        if (!tone) {
            return { success: false, reason: 'Missing tone parameter' };
        }
        
        const validTones = ['formal', 'casual', 'mysterious'];
        if (!validTones.includes(tone)) {
            return {
                success: false,
                reason: `Invalid tone. Must be one of: ${validTones.join(', ')}`
            };
        }
        
        // 设置tone
        this.toneSettings.set(npcId, tone);
        
        // 更新上下文
        const ctx = this.getOrCreateContext(npcId);
        ctx.tone = tone;
        ctx.updatedAt = Date.now();
        
        return {
            tool: 'npc.tone.set',
            success: true,
            npcId,
            tone,
            message: `NPC ${npcId} tone set to ${tone}`
        };
    }
    
    /**
     * 获取服务状态
     */
    getStatus() {
        return {
            initialized: this.initialized,
            activeContexts: this.contexts.size,
            totalMemories: Array.from(this.memories.values()).reduce((sum, arr) => sum + arr.length, 0),
            toneSettings: this.toneSettings.size
        };
    }
}

// ===== 全局实例 =====

const npcDialogueService = new NPCDialogueService();

// ===== 导出模块 =====

export {
    NPCDialogueService,
    npcDialogueService,
    DialogueContext,
    NPCMemoryEntry,
    DIALOGUE_TEMPLATES,
    DEFAULT_TEMPLATES
};
