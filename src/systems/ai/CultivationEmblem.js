/**
 * CultivationEmblem.js - 修真徽章系统
 * V764 Iteration 27/30 Round 30 - Cultivation Emblem
 */

export class CultivationEmblem {
    constructor(config = {}) {
        this.config = { maxEmblems: config.maxEmblems || 20, basePrestige: config.basePrestige || 20, ...config };
        this.emblems = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEmblems: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEmblem', (ctx) => this.getEmblem(ctx.emblemId));
        this.registerTool('recruitEmblem', (ctx) => this.recruitEmblem(ctx));
    }

    recruitEmblem(data) {
        const id = data.emblemId || `emb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const emblem = {
            emblemId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Emblem',
            type: data.type || 'gold',
            prestige: data.prestige || this.config.basePrestige,
            decorations: data.decorations || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.emblems.set(id, emblem);
        this.stats.totalEmblems++;
        this._triggerHook('emblemRecruited', { emblemId: id });
        return { success: true, emblem };
    }

    getEmblem(id) { return this.emblems.get(id) ? { ...this.emblems.get(id) } : null; }
    listEmblems() { return Array.from(this.emblems.values()).map(e => ({ ...e })); }
    listByMaster(masterId) { return Array.from(this.emblems.values()).filter(e => e.masterId === masterId).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.emblems.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addDecoration(emblemId, decoration) {
        const emblem = this.emblems.get(emblemId);
        if (!emblem) return { success: false, error: 'EMBLEM_NOT_FOUND' };
        emblem.decorations.push(decoration);
        this._triggerHook('decorationAdded', { emblemId, decoration });
        return { success: true, emblem: { ...emblem } };
    }

    raisePrestige(emblemId, amount = 5) {
        const emblem = this.emblems.get(emblemId);
        if (!emblem) return { success: false, error: 'EMBLEM_NOT_FOUND' };
        emblem.prestige += amount;
        this._triggerHook('prestigeRaised', { emblemId, newPrestige: emblem.prestige });
        return { success: true };
    }

    levelUpEmblem(emblemId) {
        const emblem = this.emblems.get(emblemId);
        if (!emblem) return { success: false, error: 'EMBLEM_NOT_FOUND' };
        emblem.level++;
        this._triggerHook('emblemLeveledUp', { emblemId, newLevel: emblem.level });
        return { success: true };
    }

    legendEmblem(emblemId) {
        const emblem = this.emblems.get(emblemId);
        if (!emblem) return { success: false, error: 'EMBLEM_NOT_FOUND' };
        emblem.status = 'legendary';
        this._triggerHook('emblemLegendized', { emblemId });
        return { success: true };
    }

    calculateEmblemValue(emblemId) {
        const emblem = this.emblems.get(emblemId);
        if (!emblem) return 0;
        return emblem.level * 100 + emblem.prestige * 2 + emblem.decorations.length * 30;
    }

    listByType(type) { return Array.from(this.emblems.values()).filter(e => e.type === type).map(e => ({ ...e })); }
    listVeteran() { return Array.from(this.emblems.values()).filter(e => e.status === 'veteran').map(e => ({ ...e })); }

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
        if (this.stats.totalEmblems < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEmblems += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { emblems: Array.from(this.emblems.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.emblems) this.emblems = new Map(data.emblems);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, emblemCount: this.emblems.size }; }
}
