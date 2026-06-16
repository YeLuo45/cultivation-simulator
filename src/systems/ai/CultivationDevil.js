/**
 * CultivationDevil.js - 修真魔系统
 * V671 Iteration 24/30 Round 27
 */
export class CultivationDevil {
    constructor(config = {}) {
        this.config = { maxDevils: config.maxDevils || 5, baseEvil: config.baseEvil || 20, ...config };
        this.devils = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDevils: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDevil', (ctx) => this.getDevil(ctx.devilId));
        this.registerTool('recruitDevil', (ctx) => this.recruitDevil(ctx));
    }

    recruitDevil(data) {
        if (this.devils.size >= this.config.maxDevils) return { success: false, error: 'MAX_DEVILS_REACHED' };
        const id = data.devilId || `dvl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const devil = {
            devilId: id,
            overlordId: data.overlordId,
            name: data.name || 'Unnamed Devil',
            type: data.type || 'demon',
            evil: data.evil != null ? data.evil : this.config.baseEvil,
            curses: data.curses || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.devils.set(id, devil);
        this.stats.totalDevils++;
        this._triggerHook('devilRecruited', { devilId: id, overlordId: devil.overlordId });
        return { success: true, devil };
    }

    getDevil(id) { return this.devils.get(id) ? { ...this.devils.get(id) } : null; }
    listDevils() { return Array.from(this.devils.values()).map(d => ({ ...d })); }
    listByOverlord(overlordId) { return Array.from(this.devils.values()).filter(d => d.overlordId === overlordId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.devils.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addCurse(devilId, curse) {
        const devil = this.devils.get(devilId);
        if (!devil) return { success: false, error: 'DEVIL_NOT_FOUND' };
        devil.curses.push(curse);
        this._triggerHook('curseAdded', { devilId, curse });
        return { success: true };
    }

    raiseEvil(devilId, amount = 5) {
        const devil = this.devils.get(devilId);
        if (!devil) return { success: false, error: 'DEVIL_NOT_FOUND' };
        devil.evil += amount;
        this._triggerHook('evilRaised', { devilId, newEvil: devil.evil });
        return { success: true };
    }

    levelUpDevil(devilId) {
        const devil = this.devils.get(devilId);
        if (!devil) return { success: false, error: 'DEVIL_NOT_FOUND' };
        devil.level++;
        this._triggerHook('devilLeveledUp', { devilId, newLevel: devil.level });
        return { success: true };
    }

    legendDevil(devilId) {
        const devil = this.devils.get(devilId);
        if (!devil) return { success: false, error: 'DEVIL_NOT_FOUND' };
        devil.status = 'legendary';
        this._triggerHook('devilLegendized', { devilId });
        return { success: true };
    }

    calculateDevilValue(devilId) {
        const devil = this.devils.get(devilId);
        if (!devil) return 0;
        return devil.level * 100 + devil.evil * 2 + devil.curses.length * 30;
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
        if (this.stats.totalDevils < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDevils += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { devils: Array.from(this.devils.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.devils) this.devils = new Map(data.devils);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, devilCount: this.devils.size }; }
}
