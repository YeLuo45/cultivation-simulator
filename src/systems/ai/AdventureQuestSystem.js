/**
 * AdventureQuestSystem.js - 冒险任务系统
 * V332 Iteration 2/9 Round 6
 */
export class AdventureQuestSystem {
    constructor(config = {}) {
        this.config = { maxQuests: config.maxQuests || 200, ...config };
        this.quests = new Map();
        this.questTemplates = new Map();
        this.activeQuests = new Map();
        this.completedQuests = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalQuests: 0, totalCompleted: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const templates = [
            { templateId: 'hunt_demon', name: 'Hunt Demon', difficulty: 3, reward: 100, duration: 60000 },
            { templateId: 'gather_herbs', name: 'Gather Herbs', difficulty: 1, reward: 30, duration: 30000 },
            { templateId: 'escort_caravan', name: 'Escort Caravan', difficulty: 2, reward: 50, duration: 45000 },
            { templateId: 'slay_dragon', name: 'Slay Dragon', difficulty: 10, reward: 1000, duration: 180000 }
        ];
        for (const t of templates) this.questTemplates.set(t.templateId, t);
    }

    _registerDefaultTools() {
        this.registerTool('getQuest', (ctx) => this.getQuest(ctx.questId));
        this.registerTool('listQuests', () => Array.from(this.quests.values()).map(q => ({...q})));
    }

    createQuest(data) {
        const id = data.id || `qst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const template = this.questTemplates.get(data.templateId);
        const difficulty = data.difficulty || template?.difficulty || 1;
        const quest = {
            questId: id, name: data.name || template?.name || 'Custom Quest',
            description: data.description || '', difficulty, reward: data.reward || template?.reward || 10,
            duration: data.duration || template?.duration || 30000,
            status: 'available', objectives: data.objectives || [],
            createdAt: Date.now()
        };
        this.quests.set(id, quest);
        this.stats.totalQuests++;
        this._triggerHook('questCreated', { questId: id });
        return { success: true, quest };
    }

    getQuest(id) { return this.quests.get(id) ? { ...this.quests.get(id) } : null; }
    listQuests() { return Array.from(this.quests.values()).map(q => ({ ...q })); }
    listQuestsByStatus(status) { return Array.from(this.quests.values()).filter(q => q.status === status).map(q => ({ ...q })); }
    listQuestsByDifficulty(min, max) {
        return Array.from(this.quests.values()).filter(q => q.difficulty >= min && q.difficulty <= max).map(q => ({ ...q }));
    }

    getTemplate(id) { return this.questTemplates.get(id) ? { ...this.questTemplates.get(id) } : null; }
    listTemplates() { return Array.from(this.questTemplates.values()).map(t => ({ ...t })); }

    acceptQuest(questId, adventurerId) {
        const quest = this.quests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        if (quest.status !== 'available') return { success: false, error: 'QUEST_UNAVAILABLE' };
        quest.status = 'in_progress';
        quest.adventurerId = adventurerId;
        quest.acceptedAt = Date.now();
        if (!this.activeQuests.has(adventurerId)) this.activeQuests.set(adventurerId, []);
        this.activeQuests.get(adventurerId).push(questId);
        this._triggerHook('questAccepted', { questId, adventurerId });
        return { success: true, quest: { ...quest } };
    }

    completeQuest(questId) {
        const quest = this.quests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        if (quest.status !== 'in_progress') return { success: false, error: 'QUEST_NOT_ACTIVE' };
        quest.status = 'completed';
        quest.completedAt = Date.now();
        this.stats.totalCompleted++;
        if (quest.adventurerId && this.activeQuests.has(quest.adventurerId)) {
            this.activeQuests.set(quest.adventurerId, this.activeQuests.get(quest.adventurerId).filter(qid => qid !== questId));
        }
        if (quest.adventurerId) {
            if (!this.completedQuests.has(quest.adventurerId)) this.completedQuests.set(quest.adventurerId, []);
            this.completedQuests.get(quest.adventurerId).push(questId);
        }
        this._triggerHook('questCompleted', { questId, adventurerId: quest.adventurerId });
        return { success: true, quest: { ...quest } };
    }

    failQuest(questId, reason) {
        const quest = this.quests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        if (quest.status !== 'in_progress') return { success: false, error: 'QUEST_NOT_ACTIVE' };
        quest.status = 'failed';
        quest.failedAt = Date.now();
        quest.failureReason = reason || 'unknown';
        if (quest.adventurerId && this.activeQuests.has(quest.adventurerId)) {
            this.activeQuests.set(quest.adventurerId, this.activeQuests.get(quest.adventurerId).filter(qid => qid !== questId));
        }
        this._triggerHook('questFailed', { questId, reason });
        return { success: true, quest: { ...quest } };
    }

    getActiveQuests(adventurerId) { return (this.activeQuests.get(adventurerId) || []).map(id => this.quests.get(id)).filter(Boolean).map(q => ({ ...q })); }
    getCompletedQuests(adventurerId) { return (this.completedQuests.get(adventurerId) || []).map(id => this.quests.get(id)).filter(Boolean).map(q => ({ ...q })); }

    registerTool(name, handler) { this.tools.set(name, { name, handler }); }
    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try { return { success: true, result: tool.handler(context || {}) }; }
        catch (e) { return { success: false, error: e.message }; }
    }
    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalCompleted < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxQuests += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { quests: Array.from(this.quests.entries()), questTemplates: Array.from(this.questTemplates.entries()), activeQuests: Array.from(this.activeQuests.entries()), completedQuests: Array.from(this.completedQuests.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.quests) this.quests = new Map(data.quests);
        if (data.questTemplates) this.questTemplates = new Map(data.questTemplates);
        if (data.activeQuests) this.activeQuests = new Map(data.activeQuests);
        if (data.completedQuests) this.completedQuests = new Map(data.completedQuests);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, questCount: this.quests.size, templateCount: this.questTemplates.size }; }
}