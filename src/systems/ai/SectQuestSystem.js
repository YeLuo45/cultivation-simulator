/**
 * SectQuestSystem.js - 宗门任务系统
 * V303 Iteration 9/9 (Final) - Sect Quest System
 * 
 * 融合6大设计系统:
 * - generic-agent: 任务自进化
 * - chatdev: 任务角色专业化
 * - nanobot: mesh网络任务分发
 * - claude-code: 工具系统
 * - thunderbolt: 离线持久化
 * - ruflo: Hook系统
 */

export class SectQuestSystem {
    constructor(config = {}) {
        this.config = {
            maxActiveQuests: config.maxActiveQuests || 20,
            maxCompletedHistory: config.maxCompletedHistory || 500,
            autoSave: config.autoSave !== false,
            experienceMultiplier: config.experienceMultiplier || 1.0,
            rewardMultiplier: config.rewardMultiplier || 1.0,
            ...config
        };
        
        this.questTemplates = new Map();
        this.activeQuests = new Map();
        this.completedQuests = [];
        this.failedQuests = [];
        this.questChains = new Map();
        this.disciples = new Map();
        this.questBoard = new Map();
        this.meshNodes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { 
            totalCreated: 0, 
            totalCompleted: 0, 
            totalFailed: 0,
            totalChains: 0,
            evolutionCount: 0 
        };
        
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('recommendQuest', (ctx) => this.recommendQuest(ctx.discipleId));
        this.registerTool('getQuestDetails', (ctx) => this.getQuest(ctx.questId));
        this.registerTool('analyzeDisciplePerformance', (ctx) => this.analyzeDisciple(ctx.discipleId));
    }

    // ========== 任务模板管理 ==========
    
    registerQuestTemplate(templateData) {
        const templateId = templateData.id || `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const template = {
            templateId,
            name: templateData.name || 'Unnamed Quest',
            type: templateData.type || 'misc',
            description: templateData.description || '',
            difficulty: templateData.difficulty || 1,
            rewards: templateData.rewards || { exp: 100, spirit_stone: 50 },
            requirements: templateData.requirements || {},
            objectives: templateData.objectives || [],
            repeatable: templateData.repeatable || false,
            timeLimit: templateData.timeLimit || 0,
            minDiscipleLevel: templateData.minDiscipleLevel || 1
        };
        this.questTemplates.set(templateId, template);
        return { success: true, template };
    }

    getQuestTemplate(templateId) {
        return this.questTemplates.get(templateId) || null;
    }

    listQuestTemplates(filter = {}) {
        const all = Array.from(this.questTemplates.values());
        if (filter.type) return all.filter(t => t.type === filter.type);
        if (filter.difficulty) return all.filter(t => t.difficulty === filter.difficulty);
        return all;
    }

    // ========== 任务板管理 ==========
    
    postToQuestBoard(templateId, sectId, customizations = {}) {
        const template = this.questTemplates.get(templateId);
        if (!template) return { success: false, error: 'TEMPLATE_NOT_FOUND' };
        
        const boardId = `board_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const boardEntry = {
            boardId,
            templateId,
            sectId,
            customizations,
            postedAt: Date.now(),
            taken: false
        };
        this.questBoard.set(boardId, boardEntry);
        this._triggerHook('questPosted', { boardId, templateId, sectId });
        return { success: true, boardId };
    }

    getQuestBoard(sectId) {
        const entries = Array.from(this.questBoard.values()).filter(e => e.sectId === sectId && !e.taken);
        return entries.map(e => ({ ...e, template: this.questTemplates.get(e.templateId) }));
    }

    acceptQuestFromBoard(boardId) {
        const entry = this.questBoard.get(boardId);
        if (!entry) return { success: false, error: 'BOARD_ENTRY_NOT_FOUND' };
        if (entry.taken) return { success: false, error: 'ALREADY_TAKEN' };
        entry.taken = true;
        return this.createQuest(entry.templateId, entry.sectId, entry.customizations);
    }

    // ========== 任务创建 ==========
    
    createQuest(templateId, sectId, customizations = {}) {
        const template = this.questTemplates.get(templateId);
        if (!template) return { success: false, error: 'TEMPLATE_NOT_FOUND' };
        
        if (this.activeQuests.size >= this.config.maxActiveQuests) {
            return { success: false, error: 'TOO_MANY_ACTIVE' };
        }
        
        const questId = `qst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const quest = {
            questId,
            templateId,
            sectId,
            name: customizations.name || template.name,
            type: template.type,
            difficulty: template.difficulty,
            rewards: {
                exp: Math.floor((template.rewards.exp || 0) * this.config.rewardMultiplier),
                spirit_stone: Math.floor((template.rewards.spirit_stone || 0) * this.config.rewardMultiplier)
            },
            objectives: template.objectives.map(o => ({ ...o, completed: false })),
            status: 'active',
            startedAt: Date.now(),
            timeLimit: template.timeLimit,
            assigneeId: null,
            customizations
        };
        this.activeQuests.set(questId, quest);
        this.stats.totalCreated++;
        this._triggerHook('questCreated', { questId, templateId, sectId });
        return { success: true, quest };
    }

    getQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return null;
        return { ...quest };
    }

    listActiveQuests(filter = {}) {
        const all = Array.from(this.activeQuests.values());
        if (filter.sectId) return all.filter(q => q.sectId === filter.sectId);
        if (filter.assigneeId) return all.filter(q => q.assigneeId === filter.assigneeId);
        if (filter.type) return all.filter(q => q.type === filter.type);
        return all;
    }

    // ========== 任务分配 ==========
    
    assignQuest(questId, discipleId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        if (quest.status !== 'active') return { success: false, error: 'QUEST_INACTIVE' };
        if (quest.assigneeId) return { success: false, error: 'ALREADY_ASSIGNED' };
        const disciple = this.disciples.get(discipleId);
        if (!disciple) return { success: false, error: 'DISCIPLE_NOT_FOUND' };
        
        quest.assigneeId = discipleId;
        quest.assignedAt = Date.now();
        this._triggerHook('questAssigned', { questId, discipleId });
        return { success: true, quest };
    }

    unassignQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        quest.assigneeId = null;
        quest.assignedAt = null;
        return { success: true };
    }

    // ========== 弟子管理 ==========
    
    registerDisciple(discipleData) {
        const id = discipleData.id || `disc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const disciple = {
            id,
            name: discipleData.name || 'Anonymous',
            level: discipleData.level || 1,
            exp: discipleData.exp || 0,
            spirit_stone: discipleData.spirit_stone || 0,
            skills: discipleData.skills || new Map(),
            completedQuests: 0,
            failedQuests: 0,
            reputation: 0
        };
        this.disciples.set(id, disciple);
        return { success: true, disciple };
    }

    getDisciple(id) {
        return this.disciples.get(id) || null;
    }

    listDisciples() {
        return Array.from(this.disciples.values());
    }

    // ========== 目标推进 ==========
    
    advanceObjective(questId, objectiveIndex) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        if (quest.status !== 'active') return { success: false, error: 'QUEST_INACTIVE' };
        if (objectiveIndex < 0 || objectiveIndex >= quest.objectives.length) {
            return { success: false, error: 'INVALID_OBJECTIVE_INDEX' };
        }
        
        quest.objectives[objectiveIndex].completed = true;
        this._triggerHook('objectiveCompleted', { questId, objectiveIndex });
        
        if (quest.objectives.every(o => o.completed)) {
            return this.completeQuest(questId);
        }
        return { success: true, quest };
    }

    // ========== 任务完成 ==========
    
    completeQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        if (quest.status !== 'active') return { success: false, error: 'QUEST_INACTIVE' };
        
        quest.status = 'completed';
        quest.completedAt = Date.now();
        
        if (quest.assigneeId) {
            const disciple = this.disciples.get(quest.assigneeId);
            if (disciple) {
                disciple.exp += quest.rewards.exp * this.config.experienceMultiplier;
                disciple.spirit_stone += quest.rewards.spirit_stone;
                disciple.completedQuests++;
                disciple.reputation += quest.difficulty * 5;
            }
        }
        
        this.activeQuests.delete(questId);
        this.completedQuests.push({ ...quest });
        if (this.completedQuests.length > this.config.maxCompletedHistory) {
            this.completedQuests.shift();
        }
        this.stats.totalCompleted++;
        this._triggerHook('questCompleted', { questId, assigneeId: quest.assigneeId });
        return { success: true, quest };
    }

    failQuest(questId, reason = 'unknown') {
        const quest = this.activeQuests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        if (quest.status !== 'active') return { success: false, error: 'QUEST_INACTIVE' };
        
        quest.status = 'failed';
        quest.failedAt = Date.now();
        quest.failureReason = reason;
        
        if (quest.assigneeId) {
            const disciple = this.disciples.get(quest.assigneeId);
            if (disciple) {
                disciple.failedQuests++;
                disciple.reputation = Math.max(0, disciple.reputation - 2);
            }
        }
        
        this.activeQuests.delete(questId);
        this.failedQuests.push({ ...quest });
        this.stats.totalFailed++;
        this._triggerHook('questFailed', { questId, reason });
        return { success: true, quest };
    }

    // ========== 任务链 (chatdev) ==========
    
    createQuestChain(chainData) {
        const chainId = chainData.id || `chain_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const chain = {
            chainId,
            name: chainData.name || 'Unnamed Chain',
            questIds: chainData.questIds || [],
            currentIndex: 0,
            status: 'active',
            rewards: chainData.rewards || {},
            createdAt: Date.now()
        };
        this.questChains.set(chainId, chain);
        this.stats.totalChains++;
        this._triggerHook('chainCreated', { chainId });
        return { success: true, chain };
    }

    advanceChain(chainId) {
        const chain = this.questChains.get(chainId);
        if (!chain) return { success: false, error: 'CHAIN_NOT_FOUND' };
        if (chain.status !== 'active') return { success: false, error: 'CHAIN_INACTIVE' };
        
        chain.currentIndex++;
        if (chain.currentIndex >= chain.questIds.length) {
            chain.status = 'completed';
            this._triggerHook('chainCompleted', { chainId });
        }
        return { success: true, chain };
    }

    getChain(chainId) {
        const c = this.questChains.get(chainId);
        if (!c) return null;
        return { ...c };
    }

    listChains(filter = {}) {
        const all = Array.from(this.questChains.values());
        if (filter.status) return all.filter(c => c.status === filter.status);
        return all;
    }

    // ========== 任务推荐 (chatdev 角色匹配) ==========
    
    recommendQuest(discipleId) {
        const disciple = this.disciples.get(discipleId);
        if (!disciple) return { success: false, error: 'DISCIPLE_NOT_FOUND' };
        
        const suitable = this.listQuestTemplates().filter(t => t.minDiscipleLevel <= disciple.level);
        // Return top 3 by difficulty
        const recommended = suitable
            .filter(t => !this.listActiveQuests({ assigneeId: discipleId }).some(q => q.templateId === t.templateId))
            .sort((a, b) => b.difficulty - a.difficulty)
            .slice(0, 3);
        return { success: true, recommended };
    }

    // ========== 弟子分析 (claude-code 工具) ==========
    
    analyzeDisciple(discipleId) {
        const disciple = this.disciples.get(discipleId);
        if (!disciple) return { success: false, error: 'DISCIPLE_NOT_FOUND' };
        
        const active = this.listActiveQuests({ assigneeId: discipleId });
        return {
            success: true,
            analysis: {
                id: discipleId,
                name: disciple.name,
                level: disciple.level,
                completedQuests: disciple.completedQuests,
                failedQuests: disciple.failedQuests,
                successRate: disciple.completedQuests + disciple.failedQuests > 0 
                    ? disciple.completedQuests / (disciple.completedQuests + disciple.failedQuests) 
                    : 0,
                reputation: disciple.reputation,
                activeQuestCount: active.length
            }
        };
    }

    // ========== Mesh 任务分发 (nanobot) ==========
    
    addMeshNode(nodeId, region) {
        const node = { nodeId, region: region || 'general', neighbors: [], quests: new Set(), connected: true };
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }

    connectMeshNodes(a, b) {
        const na = this.meshNodes.get(a);
        const nb = this.meshNodes.get(b);
        if (!na || !nb) return { success: false, error: 'NODE_NOT_FOUND' };
        if (!na.neighbors.includes(b)) na.neighbors.push(b);
        if (!nb.neighbors.includes(a)) nb.neighbors.push(a);
        return { success: true };
    }

    distributeQuestToMesh(questId, sourceNodeId) {
        const source = this.meshNodes.get(sourceNodeId);
        if (!source) return { success: false, error: 'NODE_NOT_FOUND' };
        const quest = this.activeQuests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        
        const visited = new Set([sourceNodeId]);
        const queue = [sourceNodeId];
        const targets = [];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const node = this.meshNodes.get(current);
            if (!node || !node.connected) continue;
            node.quests.add(questId);
            targets.push(current);
            for (const n of node.neighbors) {
                if (!visited.has(n)) { visited.add(n); queue.push(n); }
            }
        }
        return { success: true, propagated: targets.length, targets };
    }

    // ========== 工具系统 (claude-code) ==========
    
    registerTool(name, handler) {
        this.tools.set(name, { name, handler, registeredAt: Date.now() });
    }

    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try {
            const result = tool.handler(context || {});
            return { success: true, result };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    listTools() {
        return Array.from(this.tools.keys());
    }

    // ========== Hook 系统 (ruflo) ==========
    
    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => {
            const arr = this.hooks.get(event);
            if (arr) {
                const idx = arr.indexOf(handler);
                if (idx >= 0) arr.splice(idx, 1);
            }
        };
    }

    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) {
            try { h(data); } catch (e) { /* silent */ }
        }
    }

    // ========== 自进化 (generic-agent) ==========
    
    autoEvolve() {
        if (this.stats.totalCompleted < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        
        this.config.experienceMultiplier *= 1.1;
        this.config.rewardMultiplier *= 1.05;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    // ========== 持久化 (thunderbolt) ==========
    
    toJSON() {
        return {
            questTemplates: Array.from(this.questTemplates.entries()),
            activeQuests: Array.from(this.activeQuests.entries()),
            completedQuests: this.completedQuests,
            failedQuests: this.failedQuests,
            questChains: Array.from(this.questChains.entries()),
            disciples: Array.from(this.disciples.entries()),
            questBoard: Array.from(this.questBoard.entries()),
            meshNodes: Array.from(this.meshNodes.entries()),
            stats: this.stats,
            config: this.config
        };
    }

    fromJSON(data) {
        if (data.questTemplates) this.questTemplates = new Map(data.questTemplates);
        if (data.activeQuests) this.activeQuests = new Map(data.activeQuests);
        if (data.completedQuests) this.completedQuests = data.completedQuests;
        if (data.failedQuests) this.failedQuests = data.failedQuests;
        if (data.questChains) this.questChains = new Map(data.questChains);
        if (data.disciples) this.disciples = new Map(data.disciples);
        if (data.questBoard) this.questBoard = new Map(data.questBoard);
        if (data.meshNodes) {
            this.meshNodes = new Map(data.meshNodes.map(([k, v]) => [k, { ...v, quests: new Set(v.quests || []) }]));
        }
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            templateCount: this.questTemplates.size,
            activeQuestCount: this.activeQuests.size,
            completedQuestCount: this.completedQuests.length,
            failedQuestCount: this.failedQuests.length,
            chainCount: this.questChains.size,
            discipleCount: this.disciples.size,
            boardEntryCount: this.questBoard.size,
            meshNodeCount: this.meshNodes.size
        };
    }
}