/**
 * CultivationDemon.js - 修真妖系统
 * V672 Iteration 25/30 Round 27
 */
export class CultivationDemon {
    constructor(config = {}) {
        this.config = { maxDemons: config.maxDemons || 10, baseMalevolence: config.baseMalevolence || 20, ...config };
        this.demons = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDemons: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDemon', (ctx) => this.getDemon(ctx.demonId));
        this.registerTool('recruitDemon', (ctx) => this.recruitDemon(ctx));
    }

    recruitDemon(data) {
        if (this.demons.size >= this.config.maxDemons) return { success: false, error: 'MAX_DEMONS_REACHED' };
        const id = data.demonId || `dmn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const demon = {
            demonId: id,
            parentId: data.parentId,
            name: data.name || 'Unnamed Demon',
            type: data.type || 'beast',
            malevolence: data.malevolence != null ? data.malevolence : this.config.baseMalevolence,
            rituals: data.rituals || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.demons.set(id, demon);
        this.stats.totalDemons++;
        this._triggerHook('demonRecruited', { demonId: id, parentId: demon.parentId });
        return { success: true, demon };
    }

    getDemon(id) { return this.demons.get(id) ? { ...this.demons.get(id) } : null; }
    listDemons() { return Array.from(this.demons.values()).map(d => ({ ...d })); }
    listByParent(parentId) { return Array.from(this.demons.values()).filter(d => d.parentId === parentId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.demons.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addRitual(demonId, ritual) {
        const demon = this.demons.get(demonId);
        if (!demon) return { success: false, error: 'DEMON_NOT_FOUND' };
        demon.rituals.push(ritual);
        this._triggerHook('ritualAdded', { demonId, ritual });
        return { success: true };
    }

    raiseMalevolence(demonId, amount = 5) {
        const demon = this.demons.get(demonId);
        if (!demon) return { success: false, error: 'DEMON_NOT_FOUND' };
        demon.malevolence += amount;
        this._triggerHook('malevolenceRaised', { demonId, newMalevolence: demon.malevolence });
        return { success: true };
    }

    levelUpDemon(demonId) {
        const demon = this.demons.get(demonId);
        if (!demon) return { success: false, error: 'DEMON_NOT_FOUND' };
        demon.level++;
        this._triggerHook('demonLeveledUp', { demonId, newLevel: demon.level });
        return { success: true };
    }

    legendDemon(demonId) {
        const demon = this.demons.get(demonId);
        if (!demon) return { success: false, error: 'DEMON_NOT_FOUND' };
        demon.status = 'legendary';
        this._triggerHook('demonLegendized', { demonId });
        return { success: true };
    }

    calculateDemonValue(demonId) {
        const demon = this.demons.get(demonId);
        if (!demon) return 0;
        return demon.level * 100 + demon.malevolence * 2 + demon.rituals.length * 30;
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
        if (this.stats.totalDemons < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDemons += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { demons: Array.from(this.demons.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.demons) this.demons = new Map(data.demons);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, demonCount: this.demons.size }; }
}
