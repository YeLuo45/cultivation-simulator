/**
 * CultivationInsignia.js - 修真纹章系统
 * V766 Iteration 29/30 Round 30 - Cultivation Insignia
 */

export class CultivationInsignia {
    constructor(config = {}) {
        this.config = { maxInsignias: config.maxInsignias || 20, baseHonor: config.baseHonor || 20, ...config };
        this.insignias = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalInsignias: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getInsignia', (ctx) => this.getInsignia(ctx.insigniaId));
        this.registerTool('recruitInsignia', (ctx) => this.recruitInsignia(ctx));
    }

    recruitInsignia(data) {
        const id = data.insigniaId || `ins_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const insignia = {
            insigniaId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Insignia',
            type: data.type || 'gold',
            honor: data.honor || this.config.baseHonor,
            sigils: data.sigils || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.insignias.set(id, insignia);
        this.stats.totalInsignias++;
        this._triggerHook('insigniaRecruited', { insigniaId: id });
        return { success: true, insignia };
    }

    getInsignia(id) { return this.insignias.get(id) ? { ...this.insignias.get(id) } : null; }
    listInsignias() { return Array.from(this.insignias.values()).map(i => ({ ...i })); }
    listByMaster(masterId) { return Array.from(this.insignias.values()).filter(i => i.masterId === masterId).map(i => ({ ...i })); }
    listLegendary() { return Array.from(this.insignias.values()).filter(i => i.status === 'legendary').map(i => ({ ...i })); }

    addSigil(insigniaId, sigil) {
        const insignia = this.insignias.get(insigniaId);
        if (!insignia) return { success: false, error: 'INSIGNIA_NOT_FOUND' };
        insignia.sigils.push(sigil);
        this._triggerHook('sigilAdded', { insigniaId, sigil });
        return { success: true, insignia: { ...insignia } };
    }

    raiseHonor(insigniaId, amount = 5) {
        const insignia = this.insignias.get(insigniaId);
        if (!insignia) return { success: false, error: 'INSIGNIA_NOT_FOUND' };
        insignia.honor += amount;
        this._triggerHook('honorRaised', { insigniaId, newHonor: insignia.honor });
        return { success: true };
    }

    levelUpInsignia(insigniaId) {
        const insignia = this.insignias.get(insigniaId);
        if (!insignia) return { success: false, error: 'INSIGNIA_NOT_FOUND' };
        insignia.level++;
        this._triggerHook('insigniaLeveledUp', { insigniaId, newLevel: insignia.level });
        return { success: true };
    }

    legendInsignia(insigniaId) {
        const insignia = this.insignias.get(insigniaId);
        if (!insignia) return { success: false, error: 'INSIGNIA_NOT_FOUND' };
        insignia.status = 'legendary';
        this._triggerHook('insigniaLegendized', { insigniaId });
        return { success: true };
    }

    calculateInsigniaValue(insigniaId) {
        const insignia = this.insignias.get(insigniaId);
        if (!insignia) return 0;
        return insignia.level * 100 + insignia.honor * 2 + insignia.sigils.length * 30;
    }

    listByType(type) { return Array.from(this.insignias.values()).filter(i => i.type === type).map(i => ({ ...i })); }
    listVeteran() { return Array.from(this.insignias.values()).filter(i => i.status === 'veteran').map(i => ({ ...i })); }

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
        if (this.stats.totalInsignias < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxInsignias += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { insignias: Array.from(this.insignias.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.insignias) this.insignias = new Map(data.insignias);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, insigniaCount: this.insignias.size }; }
}
