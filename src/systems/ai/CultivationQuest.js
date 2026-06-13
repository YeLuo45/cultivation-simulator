/**
 * CultivationQuest.js - 修真任务系统
 * V568 Iteration 11/20 Round 23
 */
export class CultivationQuest {
    constructor(config = {}) {
        this.config = { maxQuests: config.maxQuests || 100, baseDifficulty: config.baseDifficulty || 10, ...config };
        this.quests = new Map();
        this.activeQuestIds = new Set();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalQuests: 0, totalCompleted: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getQuest', (ctx) => this.getQuest(ctx.questId));
        this.registerTool('startQuest', (ctx) => this.startQuest(ctx));
    }

    startQuest(data) {
        if (this.quests.size >= this.config.maxQuests) return { success: false, error: 'MAX_QUESTS_REACHED' };
        const id = data.questId || `cq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const quest = {
            questId: id,
            giverId: data.giverId || 'unknown',
            name: data.name || 'Untitled Quest',
            type: data.type || 'side',
            difficulty: data.difficulty || this.config.baseDifficulty,
            objectives: data.objectives || [],
            level: data.level || 1,
            status: 'active',
            createdAt: Date.now()
        };
        this.quests.set(id, quest);
        this.activeQuestIds.add(id);
        this.stats.totalQuests++;
        this._triggerHook('questStarted', { questId: id, giverId: quest.giverId });
        return { success: true, quest };
    }

    getQuest(id) { return this.quests.get(id) ? { ...this.quests.get(id) } : null; }
    listQuests() { return Array.from(this.quests.values()).map(q => ({ ...q })); }
    listByGiver(giverId) { return Array.from(this.quests.values()).filter(q => q.giverId === giverId).map(q => ({ ...q })); }
    listActive() { return Array.from(this.quests.values()).filter(q => q.status === 'active').map(q => ({ ...q })); }

    addObjective(questId, objective) {
        const quest = this.quests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        if (quest.status === 'completed') return { success: false, error: 'QUEST_COMPLETED' };
        const obj = typeof objective === 'string' ? { desc: objective, done: false } : { ...objective, done: objective.done || false };
        quest.objectives.push(obj);
        this._triggerHook('objectiveAdded', { questId, objective: obj });
        return { success: true, quest };
    }

    increaseDifficulty(questId, amount = 5) {
        const quest = this.quests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        quest.difficulty += amount;
        this._triggerHook('difficultyIncreased', { questId, newDifficulty: quest.difficulty, amount });
        return { success: true, quest };
    }

    levelUpQuest(questId) {
        const quest = this.quests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        quest.level++;
        this._triggerHook('questLeveledUp', { questId, newLevel: quest.level });
        return { success: true, quest };
    }

    completeQuest(questId) {
        const quest = this.quests.get(questId);
        if (!quest) return { success: false, error: 'QUEST_NOT_FOUND' };
        if (quest.status === 'completed') return { success: false, error: 'QUEST_ALREADY_COMPLETED' };
        quest.status = 'completed';
        quest.completedAt = Date.now();
        this.activeQuestIds.delete(questId);
        this.stats.totalCompleted++;
        this._triggerHook('questCompleted', { questId, giverId: quest.giverId });
        return { success: true, quest };
    }

    calculateQuestValue(questId) {
        const quest = this.quests.get(questId);
        if (!quest) return 0;
        return quest.level * 100 + quest.difficulty * 2 + quest.objectives.length * 30;
    }

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
        if (this.stats.totalQuests < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxQuests += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { quests: Array.from(this.quests.entries()), activeQuestIds: Array.from(this.activeQuestIds), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.quests) this.quests = new Map(data.quests);
        if (data.activeQuestIds) this.activeQuestIds = new Set(data.activeQuestIds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, questCount: this.quests.size, activeCount: this.activeQuestIds.size }; }
}
