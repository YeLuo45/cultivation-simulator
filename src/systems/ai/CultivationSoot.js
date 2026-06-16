/**
 * CultivationSoot.js - 修真煤烟系统
 * V852 Iteration 25/30 Round 33
 */
export class CultivationSoot {
    constructor(config = {}) {
        this.config = { maxSoots: config.maxSoots || 20, baseDarkness: config.baseDarkness || 20, ...config };
        this.soots = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSoots: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSoot', (ctx) => this.getSoot(ctx.sootId));
        this.registerTool('recruitSoot', (ctx) => this.recruitSoot(ctx));
    }

    recruitSoot(data) {
        const id = data.id || `soot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const soot = {
            sootId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_soot',
            type: data.type || 'chimney',
            darkness: data.darkness || this.config.baseDarkness,
            stains: data.stains || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.soots.set(id, soot);
        this.stats.totalSoots++;
        this._triggerHook('sootRecruited', { sootId: id });
        return { success: true, soot };
    }

    getSoot(id) { return this.soots.get(id) ? { ...this.soots.get(id) } : null; }
    listSoots() { return Array.from(this.soots.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.soots.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.soots.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addStain(sootId, stain) {
        const soot = this.soots.get(sootId);
        if (!soot) return { success: false, error: 'SOOT_NOT_FOUND' };
        soot.stains.push(stain);
        if (soot.stains.length >= 5) soot.status = 'veteran';
        this._triggerHook('stainAdded', { sootId, stain });
        return { success: true };
    }

    raiseDarkness(sootId, amount = 5) {
        const soot = this.soots.get(sootId);
        if (!soot) return { success: false, error: 'SOOT_NOT_FOUND' };
        soot.darkness += amount;
        this._triggerHook('darknessRaised', { sootId, newDarkness: soot.darkness });
        return { success: true };
    }

    levelUpSoot(sootId) {
        const soot = this.soots.get(sootId);
        if (!soot) return { success: false, error: 'SOOT_NOT_FOUND' };
        soot.level++;
        this._triggerHook('sootLeveledUp', { sootId, newLevel: soot.level });
        return { success: true };
    }

    legendSoot(sootId) {
        const soot = this.soots.get(sootId);
        if (!soot) return { success: false, error: 'SOOT_NOT_FOUND' };
        soot.status = 'legendary';
        this._triggerHook('sootLegendized', { sootId });
        return { success: true };
    }

    calculateSootValue(sootId) {
        const soot = this.soots.get(sootId);
        if (!soot) return 0;
        return soot.level * 100 + soot.darkness * 2 + soot.stains.length * 30;
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
        if (this.stats.totalSoots < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSoots += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { soots: Array.from(this.soots.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.soots) this.soots = new Map(data.soots);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sootCount: this.soots.size }; }
}
