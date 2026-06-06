/**
 * CultivationNecroKnight.js - 修真死骑
 * V623 Iteration 6/30 Round 26
 */
export class CultivationNecroKnight {
    constructor(config = {}) {
        this.config = { maxNecroKnights: config.maxNecroKnights || 30, baseUndeath: config.baseUndeath || 20, ...config };
        this.necroknights = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalNecroKnights: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getNecroKnight', (ctx) => this.getNecroKnight(ctx.necroId));
        this.registerTool('recruitNecroKnight', (ctx) => this.recruitNecroKnight(ctx));
    }

    recruitNecroKnight(data) {
        if (this.necroknights.size >= this.config.maxNecroKnights) return { success: false, error: 'MAX_NECROKNIGHTS_REACHED' };
        const id = data.necroId || `nkt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const necroknight = {
            necroId: id,
            masterId: data.masterId,
            name: data.name || 'Anonymous Necro Knight',
            type: data.type || 'skeleton',
            undeath: data.undeath != null ? data.undeath : this.config.baseUndeath,
            steeds: data.steeds || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.necroknights.set(id, necroknight);
        this.stats.totalNecroKnights++;
        this._triggerHook('necroKnightRecruited', { necroId: id, masterId: necroknight.masterId });
        return { success: true, necroknight };
    }

    getNecroKnight(id) { return this.necroknights.get(id) ? { ...this.necroknights.get(id) } : null; }
    listNecroKnights() { return Array.from(this.necroknights.values()).map(n => ({ ...n })); }
    listByMaster(masterId) { return Array.from(this.necroknights.values()).filter(n => n.masterId === masterId).map(n => ({ ...n })); }
    listLegendary() { return Array.from(this.necroknights.values()).filter(n => n.status === 'legendary').map(n => ({ ...n })); }

    addSteed(necroId, steed) {
        const necroknight = this.necroknights.get(necroId);
        if (!necroknight) return { success: false, error: 'NECROKNIGHT_NOT_FOUND' };
        necroknight.steeds.push(steed);
        this._triggerHook('steedAdded', { necroId, steed });
        return { success: true };
    }

    gainUndeath(necroId, amount = 5) {
        const necroknight = this.necroknights.get(necroId);
        if (!necroknight) return { success: false, error: 'NECROKNIGHT_NOT_FOUND' };
        necroknight.undeath += amount;
        this._triggerHook('undeathGained', { necroId, newUndeath: necroknight.undeath });
        return { success: true };
    }

    levelUpNecroKnight(necroId) {
        const necroknight = this.necroknights.get(necroId);
        if (!necroknight) return { success: false, error: 'NECROKNIGHT_NOT_FOUND' };
        necroknight.level++;
        if (necroknight.level >= 5 && necroknight.status === 'novice') {
            necroknight.status = 'veteran';
        }
        this._triggerHook('necroKnightLeveledUp', { necroId, newLevel: necroknight.level });
        return { success: true };
    }

    legendNecroKnight(necroId) {
        const necroknight = this.necroknights.get(necroId);
        if (!necroknight) return { success: false, error: 'NECROKNIGHT_NOT_FOUND' };
        necroknight.status = 'legendary';
        this._triggerHook('necroKnightLegendized', { necroId });
        return { success: true };
    }

    calculateNecroKnightValue(necroId) {
        const necroknight = this.necroknights.get(necroId);
        if (!necroknight) return 0;
        return necroknight.level * 100 + necroknight.undeath * 2 + necroknight.steeds.length * 30;
    }

    listVeterans() { return Array.from(this.necroknights.values()).filter(n => n.status === 'veteran').map(n => ({ ...n })); }

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
        if (this.stats.totalNecroKnights < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxNecroKnights += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { necroknights: Array.from(this.necroknights.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.necroknights) this.necroknights = new Map(data.necroknights);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, necroknightCount: this.necroknights.size }; }
}
