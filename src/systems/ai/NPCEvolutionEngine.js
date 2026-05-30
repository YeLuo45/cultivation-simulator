/**
 * NPCEvolutionEngine.js - NPC自主进化引擎
 * Direction N: nanobot分布式mesh注册表 + generic-agent自我进化
 * 
 * 核心机制：
 * 1. NPC_LEARNING_REGISTRY - NPC学习注册表，记录交互历史
 * 2. BEHAVIOR_EVOLUTION - 行为进化，根据历史调整行为模式
 * 3. ADAPTIVE_DIALOGUE - 自适应对话，动态扩展对话库
 */

import { NPC_ROLE_REGISTRY, npcMessageBus } from './NPCCollaboration.js';

// ===== NPC学习注册表 =====

/**
 * NPC Learning Entry - 单个NPC的学习记录
 */
class NPCLearningEntry {
    constructor(npcId, role, initialData = {}) {
        this.npcId = npcId;
        this.role = role;
        this.registeredAt = Date.now();
        this.lastInteraction = null;
        this.adaptationLevel = 1; // 1-10, 进化等级
        this.interactions = [];     // 交互历史
        this.behaviorPattern = {
            friendliness: 0.5,      // 0-1, 初始友好度
            taskSuccessRate: 0.5,   // 0-1, 任务成功率
            dialoguePreference: 'neutral', // neutral/positive/negative
            adaptationScore: 0      // 适应评分
        };
        this.evolutionCount = 0;
        this.lastEvolutionAt = null;
        
        // 从initialData合并
        if (initialData.dialogueBase) {
            this.dialogueBase = initialData.dialogueBase;
        }
    }
}

/**
 * Interaction Record - 单次交互记录
 */
class InteractionRecord {
    constructor(type, playerAction, npcResponse, outcome = {}) {
        this.id = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;           // 'trade' | 'task' | 'chat' | 'combat' | 'social'
        this.playerAction = playerAction;
        this.npcResponse = npcResponse;
        this.timestamp = Date.now();
        this.outcome = {
            success: outcome.success ?? false,
            satisfaction: outcome.satisfaction ?? 0.5, // 0-1
            reward: outcome.reward ?? 0,
            feedback: outcome.feedback ?? null
        };
    }
}

/**
 * Dialogue Entry - 对话条目
 */
class DialogueEntry {
    constructor(npcId, text, category = 'base', metadata = {}) {
        this.id = `dialogue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.npcId = npcId;
        this.text = text;
        this.category = category;   // 'base' | 'extended' | 'adaptive'
        this.usageCount = 0;
        this.lastUsed = null;
        this.effectiveness = 0.5;   // 0-1, 基于反馈评估
        this.createdAt = Date.now();
        this.metadata = metadata;
    }
}

// ===== NPC学习注册表 =====

/**
 * NPCLearningRegistry - NPC学习注册表
 * 实现nanobot-style的分布式mesh注册表
 */
class NPCLearningRegistry {
    constructor() {
        this.entries = new Map();  // npcId -> NPCLearningEntry
        this.dialogueLibrary = new Map(); // npcId -> DialogueEntry[]
        this.interactionStats = new Map(); // npcId -> stats
        this.maxInteractionsPerNPC = 500;
        this.evolveThreshold = 10; // 交互10次后触发进化评估
    }
    
    /**
     * 注册NPC到学习系统
     */
    register(npcId, role, initialData = {}) {
        if (this.entries.has(npcId)) {
            return { 
                success: false, 
                reason: 'NPC already registered',
                entry: this.entries.get(npcId)
            };
        }
        
        const entry = new NPCLearningEntry(npcId, role, initialData);
        this.entries.set(npcId, entry);
        
        // 初始化对话库（基础层）
        if (initialData.dialogueBase) {
            this.dialogueLibrary.set(npcId, initialData.dialogueBase.map(d => 
                new DialogueEntry(npcId, d.text, 'base', d.metadata)
            ));
        } else {
            this.dialogueLibrary.set(npcId, []);
        }
        
        // 初始化统计
        this.interactionStats.set(npcId, {
            totalInteractions: 0,
            successfulInteractions: 0,
            averageSatisfaction: 0,
            lastInteractionType: null
        });
        
        return { success: true, entry };
    }
    
    /**
     * 获取NPC学习条目
     */
    getEntry(npcId) {
        return this.entries.get(npcId);
    }
    
    /**
     * 记录NPC与玩家的交互
     */
    recordInteraction(npcId, type, playerAction, npcResponse, outcome = {}) {
        const entry = this.entries.get(npcId);
        if (!entry) {
            return { success: false, reason: 'NPC not registered' };
        }
        
        const record = new InteractionRecord(type, playerAction, npcResponse, outcome);
        entry.interactions.push(record);
        entry.lastInteraction = Date.now();
        
        // 限制历史长度
        if (entry.interactions.length > this.maxInteractionsPerNPC) {
            entry.interactions = entry.interactions.slice(-this.maxInteractionsPerNPC);
        }
        
        // 更新统计
        this.updateStats(npcId, record);
        
        // 更新行为模式
        this.updateBehaviorPattern(npcId, record);
        
        // 检查是否触发进化
        const shouldEvolve = this.checkEvolutionTrigger(npcId);
        
        return {
            success: true,
            record,
            shouldEvolve
        };
    }
    
    /**
     * 更新交互统计
     */
    updateStats(npcId, record) {
        const stats = this.interactionStats.get(npcId) || {
            totalInteractions: 0,
            successfulInteractions: 0,
            averageSatisfaction: 0,
            lastInteractionType: null
        };
        
        stats.totalInteractions++;
        if (record.outcome.success) {
            stats.successfulInteractions++;
        }
        
        // 计算新的平均满意度
        const totalSatisfaction = stats.averageSatisfaction * (stats.totalInteractions - 1) + record.outcome.satisfaction;
        stats.averageSatisfaction = totalSatisfaction / stats.totalInteractions;
        stats.lastInteractionType = record.type;
        
        this.interactionStats.set(npcId, stats);
    }
    
    /**
     * 更新行为模式
     */
    updateBehaviorPattern(npcId, record) {
        const entry = this.entries.get(npcId);
        if (!entry) return;
        
        const pattern = entry.behaviorPattern;
        
        // 根据交互结果调整友好度
        if (record.outcome.success) {
            pattern.friendliness = Math.min(1, pattern.friendliness + 0.02);
        } else {
            pattern.friendliness = Math.max(0, pattern.friendliness - 0.02);
        }
        
        // 根据满意度调整任务成功率
        if (record.type === 'task') {
            if (record.outcome.success) {
                pattern.taskSuccessRate = Math.min(1, pattern.taskSuccessRate + 0.05);
            }
        }
        
        // 更新适应评分
        pattern.adaptationScore = this.calculateAdaptationScore(npcId);
    }
    
    /**
     * 计算适应评分
     */
    calculateAdaptationScore(npcId) {
        const entry = this.entries.get(npcId);
        const stats = this.interactionStats.get(npcId);
        if (!entry || !stats) return 0;
        
        const interactionScore = Math.min(entry.interactions.length / 100, 1) * 0.3;
        const successScore = stats.totalInteractions > 0 
            ? stats.successfulInteractions / stats.totalInteractions * 0.3 
            : 0;
        const satisfactionScore = stats.averageSatisfaction * 0.4;
        
        return interactionScore + successScore + satisfactionScore;
    }
    
    /**
     * 检查是否触发进化
     */
    checkEvolutionTrigger(npcId) {
        const entry = this.entries.get(npcId);
        if (!entry) return false;
        
        // 触发条件1: 交互次数达到阈值
        if (entry.interactions.length >= this.evolveThreshold) {
            return true;
        }
        
        // 触发条件2: 特定事件（TODO: 可扩展）
        // 触发条件3: 适应评分超过阈值
        if (entry.behaviorPattern.adaptationScore > 0.8 && entry.adaptationLevel < 10) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 获取NPC学习状态
     */
    getLearningStatus(npcId) {
        const entry = this.entries.get(npcId);
        const stats = this.interactionStats.get(npcId);
        
        if (!entry) {
            return { error: 'NPC not registered' };
        }
        
        return {
            npcId: entry.npcId,
            role: entry.role,
            adaptationLevel: entry.adaptationLevel,
            behaviorPattern: entry.behaviorPattern,
            stats: {
                totalInteractions: stats?.totalInteractions || 0,
                successfulInteractions: stats?.successfulInteractions || 0,
                averageSatisfaction: stats?.averageSatisfaction || 0,
                lastInteractionType: stats?.lastInteractionType || null,
                successRate: stats?.totalInteractions > 0 
                    ? stats.successfulInteractions / stats.totalInteractions 
                    : 0
            },
            evolutionCount: entry.evolutionCount,
            lastEvolutionAt: entry.lastEvolutionAt,
            registeredAt: entry.registeredAt,
            lastInteraction: entry.lastInteraction,
            interactionCount: entry.interactions.length
        };
    }
    
    /**
     * 获取所有已注册的NPC
     */
    getAllRegisteredNPCs() {
        return Array.from(this.entries.keys());
    }
}

// ===== 行为进化引擎 =====

/**
 * BehaviorEvolutionEngine - 行为进化引擎
 * 实现generic-agent风格的自我进化
 */
class BehaviorEvolutionEngine {
    constructor(registry) {
        this.registry = registry;
        this.evolutionRules = this.initEvolutionRules();
    }
    
    initEvolutionRules() {
        return {
            // 进化维度
            dimensions: {
                friendliness: { min: 0, max: 1, weight: 0.3 },
                taskSuccessRate: { min: 0, max: 1, weight: 0.4 },
                dialoguePreference: { 
                    values: ['neutral', 'positive', 'negative'],
                    weight: 0.2 
                },
                adaptationScore: { min: 0, max: 1, weight: 0.1 }
            },
            // 进化触发阈值
            thresholds: {
                minInteractions: 10,
                minAdaptationScore: 0.5,
                evolutionCooldown: 3600000 // 1小时冷却
            }
        };
    }
    
    /**
     * 评估并执行进化
     */
    evaluateEvolution(npcId) {
        const entry = this.registry.getEntry(npcId);
        if (!entry) {
            return { success: false, reason: 'NPC not registered' };
        }
        
        // 检查冷却时间
        if (entry.lastEvolutionAt) {
            const cooldown = this.evolutionRules.thresholds.evolutionCooldown;
            if (Date.now() - entry.lastEvolutionAt < cooldown) {
                return { 
                    success: false, 
                    reason: 'Evolution on cooldown',
                    remainingCooldown: cooldown - (Date.now() - entry.lastEvolutionAt)
                };
            }
        }
        
        // 评估是否满足进化条件
        const evaluation = this.evaluateEvolutionConditions(npcId);
        
        if (evaluation.canEvolve) {
            return this.executeEvolution(npcId, evaluation);
        }
        
        return {
            success: true,
            evolved: false,
            evaluation
        };
    }
    
    /**
     * 评估进化条件
     */
    evaluateEvolutionConditions(npcId) {
        const entry = this.registry.getEntry(npcId);
        const stats = this.registry.interactionStats.get(npcId);
        
        const conditions = {
            meetsMinInteractions: entry.interactions.length >= this.evolutionRules.thresholds.minInteractions,
            meetsMinAdaptation: entry.behaviorPattern.adaptationScore >= this.evolutionRules.thresholds.minAdaptationScore,
            hasPositiveTrend: this.checkPositiveTrend(npcId)
        };
        
        const canEvolve = conditions.meetsMinInteractions && 
            (conditions.meetsMinAdaptation || conditions.hasPositiveTrend);
        
        return {
            canEvolve,
            conditions,
            currentLevel: entry.adaptationLevel,
            maxLevel: 10,
            gapToNextLevel: this.calculateGapToNextLevel(entry.adaptationLevel)
        };
    }
    
    /**
     * 检查是否有正向趋势
     */
    checkPositiveTrend(npcId) {
        const entry = this.registry.getEntry(npcId);
        if (!entry || entry.interactions.length < 5) return false;
        
        // 比较最近5次和之前5次的交互质量
        const recent = entry.interactions.slice(-5);
        const older = entry.interactions.slice(-10, -5);
        
        if (older.length === 0) return true;
        
        const recentAvgSatisfaction = recent.reduce((sum, r) => sum + r.outcome.satisfaction, 0) / recent.length;
        const olderAvgSatisfaction = older.reduce((sum, r) => sum + r.outcome.satisfaction, 0) / older.length;
        
        return recentAvgSatisfaction > olderAvgSatisfaction;
    }
    
    /**
     * 计算到下一级的差距
     */
    calculateGapToNextLevel(currentLevel) {
        // 假设每级需要100点适应评分
        const pointsNeeded = (currentLevel + 1) * 100;
        return pointsNeeded;
    }
    
    /**
     * 执行进化
     */
    executeEvolution(npcId, evaluation) {
        const entry = this.registry.getEntry(npcId);
        
        // 进化方向计算
        const evolutionVector = this.calculateEvolutionVector(npcId);
        
        // 应用进化
        entry.adaptationLevel = Math.min(10, entry.adaptationLevel + 1);
        entry.evolutionCount++;
        entry.lastEvolutionAt = Date.now();
        
        // 更新行为模式
        entry.behaviorPattern.friendliness = Math.min(1, 
            entry.behaviorPattern.friendliness + evolutionVector.friendliness * 0.1);
        entry.behaviorPattern.taskSuccessRate = Math.min(1,
            entry.behaviorPattern.taskSuccessRate + evolutionVector.taskSuccessRate * 0.1);
        
        // 调整对话偏好
        if (evolutionVector.dialoguePreferenceShift) {
            const prefs = this.evolutionRules.dimensions.dialoguePreference.values;
            const currentIdx = prefs.indexOf(entry.behaviorPattern.dialoguePreference);
            if (currentIdx < prefs.length - 1) {
                entry.behaviorPattern.dialoguePreference = prefs[currentIdx + 1];
            }
        }
        
        return {
            success: true,
            evolved: true,
            newLevel: entry.adaptationLevel,
            evolutionVector,
            changes: {
                friendliness: evolutionVector.friendliness * 0.1,
                taskSuccessRate: evolutionVector.taskSuccessRate * 0.1,
                dialoguePreference: entry.behaviorPattern.dialoguePreference
            }
        };
    }
    
    /**
     * 计算进化向量
     */
    calculateEvolutionVector(npcId) {
        const entry = this.registry.getEntry(npcId);
        const stats = this.registry.interactionStats.get(npcId);
        
        // 基于交互统计数据计算进化方向
        const successRate = stats.totalInteractions > 0 
            ? stats.successfulInteractions / stats.totalInteractions 
            : 0.5;
        
        return {
            friendliness: successRate > 0.6 ? 1 : (successRate < 0.4 ? -1 : 0),
            taskSuccessRate: entry.behaviorPattern.taskSuccessRate < 0.7 ? 1 : 0,
            dialoguePreferenceShift: entry.behaviorPattern.dialoguePreference === 'negative' && successRate > 0.5
        };
    }
    
    /**
     * 手动触发进化评估
     */
    triggerEvolution(npcId) {
        return this.evaluateEvolution(npcId);
    }
}

// ===== 自适应对话系统 =====

/**
 * AdaptiveDialogueSystem - 自适应对话系统
 */
class AdaptiveDialogueSystem {
    constructor(registry) {
        this.registry = registry;
        this.maxExtendedDialogues = 50;
    }
    
    /**
     * 添加扩展对话
     */
    addDialogue(npcId, text, category = 'extended', metadata = {}) {
        const entry = this.registry.getEntry(npcId);
        if (!entry) {
            return { success: false, reason: 'NPC not registered' };
        }
        
        const dialogues = this.registry.dialogueLibrary.get(npcId) || [];
        
        // 检查是否已达上限
        const extendedCount = dialogues.filter(d => d.category === 'extended').length;
        if (category === 'extended' && extendedCount >= this.maxExtendedDialogues) {
            return { 
                success: false, 
                reason: 'Maximum extended dialogues reached',
                maxExtendedDialogues: this.maxExtendedDialogues
            };
        }
        
        // 检查重复
        const exists = dialogues.some(d => d.text === text && d.npcId === npcId);
        if (exists) {
            return { success: false, reason: 'Dialogue already exists' };
        }
        
        const dialogue = new DialogueEntry(npcId, text, category, metadata);
        dialogues.push(dialogue);
        this.registry.dialogueLibrary.set(npcId, dialogues);
        
        return { success: true, dialogue };
    }
    
    /**
     * 列出NPC的对话库
     */
    listDialogues(npcId, filter = {}) {
        const dialogues = this.registry.dialogueLibrary.get(npcId) || [];
        
        let filtered = dialogues;
        
        // 按分类筛选
        if (filter.category) {
            filtered = filtered.filter(d => d.category === filter.category);
        }
        
        // 按有效性筛选
        if (filter.minEffectiveness) {
            filtered = filtered.filter(d => d.effectiveness >= filter.minEffectiveness);
        }
        
        // 排序
        if (filter.sortBy === 'usage') {
            filtered.sort((a, b) => b.usageCount - a.usageCount);
        } else if (filter.sortBy === 'effectiveness') {
            filtered.sort((a, b) => b.effectiveness - a.effectiveness);
        } else {
            filtered.sort((a, b) => a.createdAt - b.createdAt);
        }
        
        return {
            success: true,
            npcId,
            total: dialogues.length,
            filtered: filtered.length,
            breakdown: {
                base: dialogues.filter(d => d.category === 'base').length,
                extended: dialogues.filter(d => d.category === 'extended').length,
                adaptive: dialogues.filter(d => d.category === 'adaptive').length
            },
            dialogues: filtered
        };
    }
    
    /**
     * 选择最佳对话
     */
    selectDialogue(npcId, context = {}) {
        const entry = this.registry.getEntry(npcId);
        if (!entry) return null;
        
        const dialogues = this.registry.dialogueLibrary.get(npcId) || [];
        if (dialogues.length === 0) return null;
        
        // 基于行为模式选择对话
        const preference = entry.behaviorPattern.dialoguePreference;
        
        // 优先选择有效的对话
        const effectiveDialogues = dialogues.filter(d => d.effectiveness > 0.3);
        const candidates = effectiveDialogues.length > 0 ? effectiveDialogues : dialogues;
        
        // 基于偏好选择
        if (preference === 'positive') {
            const positive = candidates.filter(d => d.effectiveness > 0.6);
            if (positive.length > 0) return positive[Math.floor(Math.random() * positive.length)];
        }
        
        // 随机选择一个有效的对话
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        selected.usageCount++;
        selected.lastUsed = Date.now();
        
        return selected;
    }
    
    /**
     * 更新对话有效性（基于反馈）
     */
    updateDialogueEffectiveness(npcId, dialogueId, feedback) {
        const dialogues = this.registry.dialogueLibrary.get(npcId) || [];
        const dialogue = dialogues.find(d => d.id === dialogueId);
        
        if (!dialogue) return { success: false, reason: 'Dialogue not found' };
        
        // feedback: 0-1, 0表示负面反馈，1表示正面反馈
        const currentEffectiveness = dialogue.effectiveness;
        dialogue.effectiveness = currentEffectiveness * 0.7 + feedback * 0.3;
        
        return { success: true, newEffectiveness: dialogue.effectiveness };
    }
}

// ===== NPC进化引擎主类 =====

/**
 * NPCEvolutionEngine - NPC自主进化引擎主类
 */
class NPCEvolutionEngine {
    constructor() {
        this.registry = new NPCLearningRegistry();
        this.evolutionEngine = new BehaviorEvolutionEngine(this.registry);
        this.dialogueSystem = new AdaptiveDialogueSystem(this.registry);
        this.initialized = false;
    }
    
    /**
     * 初始化引擎
     */
    init(gameState) {
        this.initialized = true;
        
        // 如果gameState中有已保存的学习数据，恢复它们
        if (gameState.npcEvolution) {
            this.restoreFromState(gameState.npcEvolution);
        }
        
        console.log('[NPCEvolutionEngine] NPC自主进化引擎初始化完成');
        return { success: true };
    }
    
    /**
     * 保存状态到gameState
     */
    saveToState() {
        const state = {
            entries: Array.from(this.registry.entries.entries()),
            dialogueLibrary: Array.from(this.registry.dialogueLibrary.entries()),
            stats: Array.from(this.registry.interactionStats.entries())
        };
        return state;
    }
    
    /**
     * 从状态恢复
     */
    restoreFromState(state) {
        if (state.entries) {
            this.registry.entries = new Map(state.entries);
        }
        if (state.dialogueLibrary) {
            this.registry.dialogueLibrary = new Map(state.dialogueLibrary.map(([k, v]) => {
                const mappedDialogues = v.map(d => {
                    const entry = new DialogueEntry(d.npcId, d.text, d.category, d.metadata);
                    return Object.assign(entry, d);
                });
                return [k, mappedDialogues];
            }));
        }
        if (state.stats) {
            this.registry.interactionStats = new Map(state.stats);
        }
    }
    
    // ===== MCP工具实现 =====
    
    /**
     * MCP: npc.evolution.register
     * 注册NPC到学习系统
     */
    mcpRegister(params = {}) {
        const { npcId, role, dialogueBase } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        // 如果没有提供role，尝试从npcId中提取角色
        let actualRole = role;
        if (!actualRole) {
            // 尝试精确匹配
            const lowerNpcId = npcId.toLowerCase();
            if (NPC_ROLE_REGISTRY[lowerNpcId]) {
                actualRole = lowerNpcId;
            } else {
                // 尝试前缀匹配 (e.g., 'fellow_disciple' -> 'fellow')
                for (const registryRole of Object.keys(NPC_ROLE_REGISTRY)) {
                    if (lowerNpcId.startsWith(registryRole) || lowerNpcId.includes(registryRole)) {
                        actualRole = registryRole;
                        break;
                    }
                }
            }
        }
        
        const registryRole = actualRole ? NPC_ROLE_REGISTRY[actualRole] : null;
        
        const initialData = {};
        if (dialogueBase) {
            initialData.dialogueBase = dialogueBase;
        }
        
        const result = this.registry.register(npcId, registryRole ? actualRole : 'unknown', initialData);
        
        return {
            tool: 'npc.evolution.register',
            ...result
        };
    }
    
    /**
     * MCP: npc.evolution.record
     * 记录NPC与玩家交互
     */
    mcpRecord(params = {}) {
        const { npcId, type, playerAction, npcResponse, outcome } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        if (!type) {
            return { success: false, reason: 'Missing type parameter' };
        }
        
        const result = this.registry.recordInteraction(
            npcId, 
            type, 
            playerAction || '', 
            npcResponse || '', 
            outcome || {}
        );
        
        return {
            tool: 'npc.evolution.record',
            ...result
        };
    }
    
    /**
     * MCP: npc.evolution.get
     * 获取NPC当前学习状态
     */
    mcpGet(params = {}) {
        const { npcId } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        const status = this.registry.getLearningStatus(npcId);
        
        return {
            tool: 'npc.evolution.get',
            ...status
        };
    }
    
    /**
     * MCP: npc.dialogue.add
     * 为NPC添加扩展对话
     */
    mcpAddDialogue(params = {}) {
        const { npcId, text, category, metadata } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        if (!text) {
            return { success: false, reason: 'Missing text parameter' };
        }
        
        const result = this.dialogueSystem.addDialogue(npcId, text, category || 'extended', metadata || {});
        
        return {
            tool: 'npc.dialogue.add',
            ...result
        };
    }
    
    /**
     * MCP: npc.dialogue.list
     * 查看NPC的对话库
     */
    mcpListDialogues(params = {}) {
        const { npcId, filter } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        // 检查NPC是否已注册
        const entry = this.registry.getEntry(npcId);
        if (!entry) {
            return { success: false, reason: 'NPC not registered' };
        }
        
        const result = this.dialogueSystem.listDialogues(npcId, filter || {});
        
        return {
            tool: 'npc.dialogue.list',
            ...result
        };
    }
    
    /**
     * MCP: npc.evolution.trigger
     * 手动触发NPC行为进化评估
     */
    mcpTriggerEvolution(params = {}) {
        const { npcId } = params;
        
        if (!npcId) {
            return { success: false, reason: 'Missing npcId parameter' };
        }
        
        const result = this.evolutionEngine.triggerEvolution(npcId);
        
        return {
            tool: 'npc.evolution.trigger',
            ...result
        };
    }
    
    /**
     * 获取引擎状态摘要
     */
    getStatus() {
        return {
            initialized: this.initialized,
            registeredNPCs: this.registry.entries.size,
            evolutionEngine: {
                evolutionRules: this.evolutionEngine.evolutionRules.dimensions
            }
        };
    }
}

// ===== 全局实例 =====

const npcEvolutionEngine = new NPCEvolutionEngine();

// ===== 导出模块 =====

export {
    NPCEvolutionEngine,
    npcEvolutionEngine,
    NPCLearningRegistry,
    NPCLearningEntry,
    InteractionRecord,
    DialogueEntry,
    BehaviorEvolutionEngine,
    AdaptiveDialogueSystem
};
