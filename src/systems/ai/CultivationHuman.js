/**
 * CultivationHuman.js - 修真人类
 * V673 Iteration 26/30 Round 27
 */
export class CultivationHuman {
    constructor(config = {}) {
        this.config = { maxHumans: config.maxHumans || 50, baseAdaptability: config.baseAdaptability || 20, ...config };
        this.humans = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHumans: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHuman', (ctx) => this.getHuman(ctx.humanId));
        this.registerTool('recruitHuman', (ctx) => this.recruitHuman(ctx));
    }

    recruitHuman(data) {
        const id = data.humanId || `hmn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const human = {
            humanId: id,
            parentId: data.parentId,
            name: data.name || 'Anonymous Human',
            type: data.type || 'common',
            adaptability: data.adaptability || this.config.baseAdaptability,
            skills: data.skills || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.humans.set(id, human);
        this.stats.totalHumans++;
        this._triggerHook('humanRecruited', { humanId: id });
        return { success: true, human };
    }

    getHuman(id) { return this.humans.get(id) ? { ...this.humans.get(id) } : null; }
    listHumans() { return Array.from(this.humans.values()).map(h => ({ ...h })); }
    listByParent(parentId) { return Array.from(this.humans.values()).filter(h => h.parentId === parentId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.humans.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addSkill(humanId, skill) {
        const human = this.humans.get(humanId);
        if (!human) return { success: false, error: 'HUMAN_NOT_FOUND' };
        human.skills.push(skill);
        this._triggerHook('skillAdded', { humanId, skill });
        return { success: true };
    }

    raiseAdaptability(humanId, amount = 5) {
        const human = this.humans.get(humanId);
        if (!human) return { success: false, error: 'HUMAN_NOT_FOUND' };
        human.adaptability += amount;
        this._triggerHook('adaptabilityRaised', { humanId, newAdaptability: human.adaptability });
        return { success: true };
    }

    levelUpHuman(humanId) {
        const human = this.humans.get(humanId);
        if (!human) return { success: false, error: 'HUMAN_NOT_FOUND' };
        human.level++;
        this._triggerHook('humanLeveledUp', { humanId, newLevel: human.level });
        return { success: true };
    }

    legendHuman(humanId) {
        const human = this.humans.get(humanId);
        if (!human) return { success: false, error: 'HUMAN_NOT_FOUND' };
        human.status = 'legendary';
        this._triggerHook('humanLegendized', { humanId });
        return { success: true };
    }

    calculateHumanValue(humanId) {
        const human = this.humans.get(humanId);
        if (!human) return 0;
        return human.level * 100 + human.adaptability * 2 + human.skills.length * 30;
    }

    listVeterans() { return Array.from(this.humans.values()).filter(h => h.status === 'veteran').map(h => ({ ...h })); }

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
        if (this.stats.totalHumans < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHumans += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { humans: Array.from(this.humans.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.humans) this.humans = new Map(data.humans);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, humanCount: this.humans.size }; }
}
