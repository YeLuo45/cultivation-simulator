/**
 * CultivationSociety.js - 修真会
 * V553 Iteration 16/20 Round 22
 */
export class CultivationSociety {
    constructor(config = {}) {
        this.config = { maxSocieties: config.maxSocieties || 30, basePrestige: config.basePrestige || 20, ...config };
        this.societies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSocieties: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSociety', (ctx) => this.getSociety(ctx.societyId));
        this.registerTool('openSociety', (ctx) => this.openSociety(ctx));
    }

    openSociety(data) {
        const id = data.id || `soc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const society = { societyId: id, founderId: data.founderId, name: data.name || '无名修真会', type: data.type || 'learner', prestige: data.prestige || this.config.basePrestige, scholars: data.scholars || [], level: 1, status: 'forming', createdAt: Date.now() };
        this.societies.set(id, society);
        this.stats.totalSocieties++;
        this._triggerHook('societyOpened', { societyId: id });
        return { success: true, society };
    }

    getSociety(id) { return this.societies.get(id) ? { ...this.societies.get(id) } : null; }
    listSocieties() { return Array.from(this.societies.values()).map(s => ({ ...s })); }
    listByFounder(founderId) { return Array.from(this.societies.values()).filter(s => s.founderId === founderId).map(s => ({ ...s })); }
    listActive() { return Array.from(this.societies.values()).filter(s => s.status === 'active' || s.status === 'renowned').map(s => ({ ...s })); }

    addScholar(societyId, scholar) {
        const society = this.societies.get(societyId);
        if (!society) return { success: false, error: 'SOCIETY_NOT_FOUND' };
        society.scholars.push(scholar);
        this._triggerHook('scholarAdded', { societyId, scholar });
        return { success: true };
    }

    increasePrestige(societyId, amount = 5) {
        const society = this.societies.get(societyId);
        if (!society) return { success: false, error: 'SOCIETY_NOT_FOUND' };
        society.prestige += amount;
        if (society.prestige >= 50 && society.status === 'forming') society.status = 'active';
        this._triggerHook('prestigeIncreased', { societyId, amount, newPrestige: society.prestige });
        return { success: true };
    }

    levelUpSociety(societyId) {
        const society = this.societies.get(societyId);
        if (!society) return { success: false, error: 'SOCIETY_NOT_FOUND' };
        society.level++;
        this._triggerHook('societyLeveledUp', { societyId, newLevel: society.level });
        return { success: true };
    }

    renownedSociety(societyId) {
        const society = this.societies.get(societyId);
        if (!society) return { success: false, error: 'SOCIETY_NOT_FOUND' };
        society.status = 'renowned';
        this._triggerHook('societyRenowned', { societyId });
        return { success: true };
    }

    calculateSocietyPower(societyId) {
        const society = this.societies.get(societyId);
        if (!society) return 0;
        return society.level * 100 + society.prestige * 2 + society.scholars.length * 30;
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
        if (this.stats.totalSocieties < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSocieties += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { societies: Array.from(this.societies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.societies) this.societies = new Map(data.societies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, societyCount: this.societies.size }; }
}
