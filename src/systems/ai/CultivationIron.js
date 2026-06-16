/**
 * CultivationIron.js - 修真铁系统
 * V853 Iteration 26/30 Round 33
 */
export class CultivationIron {
    constructor(config = {}) {
        this.config = { maxIrons: config.maxIrons || 20, baseHardness: config.baseHardness || 20, ...config };
        this.irons = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalIrons: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getIron', (ctx) => this.getIron(ctx.ironId));
        this.registerTool('recruitIron', (ctx) => this.recruitIron(ctx));
    }

    recruitIron(data = {}) {
        if (this.irons.size >= this.config.maxIrons) {
            return { success: false, error: 'MAX_IRONS_REACHED' };
        }
        const id = data.ironId || `irn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const iron = {
            ironId: id,
            masterId: data.masterId || null,
            name: data.name || `Iron-${id.slice(-5)}`,
            type: data.type || 'wrought',
            hardness: data.hardness !== undefined ? data.hardness : this.config.baseHardness,
            ores: Array.isArray(data.ores) ? [...data.ores] : [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.irons.set(id, iron);
        this.stats.totalIrons++;
        this._triggerHook('ironRecruited', { ironId: id, masterId: iron.masterId });
        return { success: true, iron };
    }

    getIron(id) { return this.irons.get(id) ? { ...this.irons.get(id) } : null; }
    listIrons() { return Array.from(this.irons.values()).map(i => ({ ...i })); }
    listByMaster(masterId) { return Array.from(this.irons.values()).filter(i => i.masterId === masterId).map(i => ({ ...i })); }
    listLegendary() { return Array.from(this.irons.values()).filter(i => i.status === 'legendary').map(i => ({ ...i })); }

    addOre(ironId, ore) {
        const iron = this.irons.get(ironId);
        if (!iron) return { success: false, error: 'IRON_NOT_FOUND' };
        iron.ores.push(ore);
        this._triggerHook('oreAdded', { ironId, ore, totalOres: iron.ores.length });
        return { success: true };
    }

    raiseHardness(ironId, amount = 5) {
        const iron = this.irons.get(ironId);
        if (!iron) return { success: false, error: 'IRON_NOT_FOUND' };
        iron.hardness += amount;
        this._triggerHook('hardnessRaised', { ironId, newHardness: iron.hardness });
        return { success: true };
    }

    levelUpIron(ironId) {
        const iron = this.irons.get(ironId);
        if (!iron) return { success: false, error: 'IRON_NOT_FOUND' };
        iron.level++;
        this._triggerHook('ironLeveledUp', { ironId, newLevel: iron.level });
        return { success: true };
    }

    legendIron(ironId) {
        const iron = this.irons.get(ironId);
        if (!iron) return { success: false, error: 'IRON_NOT_FOUND' };
        iron.status = 'legendary';
        this._triggerHook('ironLegendized', { ironId });
        return { success: true };
    }

    calculateIronValue(ironId) {
        const iron = this.irons.get(ironId);
        if (!iron) return 0;
        return iron.level * 100 + iron.hardness * 2 + iron.ores.length * 30;
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
        if (this.stats.totalIrons < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxIrons += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { irons: Array.from(this.irons.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.irons) this.irons = new Map(data.irons);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ironCount: this.irons.size }; }
}
