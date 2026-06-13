/**
 * CultivationLevel.js - 修真等级系统
 * V548 Iteration 11/20 Round 22 - Cultivation Level
 */

export class CultivationLevel {
    constructor(config = {}) {
        this.config = { maxLevels: config.maxLevels || 50, baseXP: config.baseXP || 0, ...config };
        this.levels = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLevels: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLevel', (ctx) => this.getLevel(ctx.levelId));
        this.registerTool('openLevel', (ctx) => this.openLevel(ctx));
    }

    openLevel(data) {
        const id = data.levelId || `lvl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const level = {
            levelId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Level',
            type: data.type || 'qi',
            xp: data.xp !== undefined ? data.xp : this.config.baseXP,
            skills: [],
            tier: data.tier || 1,
            status: data.status || 'training',
            createdAt: Date.now()
        };
        this.levels.set(id, level);
        this.stats.totalLevels++;
        this._triggerHook('levelOpened', { levelId: id });
        return { success: true, level };
    }

    getLevel(id) { return this.levels.get(id) ? { ...this.levels.get(id) } : null; }
    listLevels() { return Array.from(this.levels.values()).map(l => ({ ...l })); }
    listByCultivator(cultivatorId) { return Array.from(this.levels.values()).filter(l => l.cultivatorId === cultivatorId).map(l => ({ ...l })); }
    listAchieved() { return Array.from(this.levels.values()).filter(l => l.status === 'achieved').map(l => ({ ...l })); }

    addSkill(levelId, skill) {
        const level = this.levels.get(levelId);
        if (!level) return { success: false, error: 'LEVEL_NOT_FOUND' };
        level.skills.push(skill);
        this._triggerHook('skillAdded', { levelId, skill });
        return { success: true, level: { ...level } };
    }

    gainXP(levelId, amount = 5) {
        const level = this.levels.get(levelId);
        if (!level) return { success: false, error: 'LEVEL_NOT_FOUND' };
        level.xp += amount;
        this._triggerHook('xpGained', { levelId, newXP: level.xp });
        return { success: true };
    }

    ascendTier(levelId) {
        const level = this.levels.get(levelId);
        if (!level) return { success: false, error: 'LEVEL_NOT_FOUND' };
        level.tier++;
        this._triggerHook('tierAscended', { levelId, newTier: level.tier });
        return { success: true };
    }

    achieveLevel(levelId) {
        const level = this.levels.get(levelId);
        if (!level) return { success: false, error: 'LEVEL_NOT_FOUND' };
        level.status = 'achieved';
        this._triggerHook('levelAchieved', { levelId });
        return { success: true };
    }

    calculateLevelPower(levelId) {
        const level = this.levels.get(levelId);
        if (!level) return 0;
        return level.tier * 100 + level.xp * 2 + level.skills.length * 30;
    }

    listByType(type) { return Array.from(this.levels.values()).filter(l => l.type === type).map(l => ({ ...l })); }

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
        if (this.stats.totalLevels < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLevels += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { levels: Array.from(this.levels.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.levels) this.levels = new Map(data.levels);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, levelCount: this.levels.size }; }
}
