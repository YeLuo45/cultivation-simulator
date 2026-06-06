/**
 * CultivationPatriarch.js - 修真族长系统
 * V665 Iteration 18/30 Round 27 - Cultivation Patriarch
 */

export class CultivationPatriarch {
    constructor(config = {}) {
        this.config = { maxPatriarchs: config.maxPatriarchs || 10, baseAuthority: config.baseAuthority || 20, ...config };
        this.patriarchs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPatriarchs: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPatriarch', (ctx) => this.getPatriarch(ctx.patriarchId));
        this.registerTool('recruitPatriarch', (ctx) => this.recruitPatriarch(ctx));
    }

    recruitPatriarch(data) {
        const id = data.patriarchId || `ptr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const patriarch = {
            patriarchId: id,
            clanId: data.clanId,
            name: data.name || 'Untitled Patriarch',
            type: data.type || 'founder',
            authority: data.authority !== undefined ? data.authority : this.config.baseAuthority,
            edicts: Array.isArray(data.edicts) ? [...data.edicts] : [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.patriarchs.set(id, patriarch);
        this.stats.totalPatriarchs++;
        this._triggerHook('patriarchRecruited', { patriarchId: id });
        return { success: true, patriarch };
    }

    getPatriarch(id) { return this.patriarchs.get(id) ? { ...this.patriarchs.get(id) } : null; }
    listPatriarchs() { return Array.from(this.patriarchs.values()).map(p => ({ ...p })); }
    listByClan(clanId) { return Array.from(this.patriarchs.values()).filter(p => p.clanId === clanId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.patriarchs.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addEdict(patriarchId, edict) {
        const patriarch = this.patriarchs.get(patriarchId);
        if (!patriarch) return { success: false, error: 'PATRIARCH_NOT_FOUND' };
        patriarch.edicts.push(edict);
        this._triggerHook('edictAdded', { patriarchId, edict });
        return { success: true };
    }

    buildAuthority(patriarchId, amount = 5) {
        const patriarch = this.patriarchs.get(patriarchId);
        if (!patriarch) return { success: false, error: 'PATRIARCH_NOT_FOUND' };
        patriarch.authority += amount;
        this._triggerHook('authorityBuilt', { patriarchId, newAuthority: patriarch.authority });
        return { success: true };
    }

    levelUpPatriarch(patriarchId) {
        const patriarch = this.patriarchs.get(patriarchId);
        if (!patriarch) return { success: false, error: 'PATRIARCH_NOT_FOUND' };
        patriarch.level++;
        this._triggerHook('patriarchLeveledUp', { patriarchId, newLevel: patriarch.level });
        return { success: true };
    }

    legendPatriarch(patriarchId) {
        const patriarch = this.patriarchs.get(patriarchId);
        if (!patriarch) return { success: false, error: 'PATRIARCH_NOT_FOUND' };
        patriarch.status = 'legendary';
        this._triggerHook('patriarchLegendized', { patriarchId });
        return { success: true };
    }

    calculatePatriarchValue(patriarchId) {
        const patriarch = this.patriarchs.get(patriarchId);
        if (!patriarch) return 0;
        return patriarch.level * 100 + patriarch.authority * 2 + patriarch.edicts.length * 30;
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
        if (this.stats.totalPatriarchs < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPatriarchs += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { patriarchs: Array.from(this.patriarchs.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.patriarchs) this.patriarchs = new Map(data.patriarchs);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, patriarchCount: this.patriarchs.size }; }
}
