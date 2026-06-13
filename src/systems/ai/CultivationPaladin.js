/**
 * CultivationPaladin.js - 修真圣骑士
 * V607 Iteration 10/20 Round 25
 */
export class CultivationPaladin {
    constructor(config = {}) {
        this.config = { maxPaladins: config.maxPaladins || 50, baseFaith: config.baseFaith || 20, ...config };
        this.paladins = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPaladins: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPaladin', (ctx) => this.getPaladin(ctx.paladinId));
        this.registerTool('recruitPaladin', (ctx) => this.recruitPaladin(ctx));
    }

    recruitPaladin(data) {
        const id = data.paladinId || `pal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const paladin = {
            paladinId: id,
            leaderId: data.leaderId,
            name: data.name || 'Anonymous Paladin',
            type: data.type || 'light',
            faith: data.faith || this.config.baseFaith,
            blessings: data.blessings || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.paladins.set(id, paladin);
        this.stats.totalPaladins++;
        this._triggerHook('paladinRecruited', { paladinId: id });
        return { success: true, paladin };
    }

    getPaladin(id) { return this.paladins.get(id) ? { ...this.paladins.get(id) } : null; }
    listPaladins() { return Array.from(this.paladins.values()).map(p => ({ ...p })); }
    listByLeader(leaderId) { return Array.from(this.paladins.values()).filter(p => p.leaderId === leaderId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.paladins.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addBlessing(paladinId, blessing) {
        const paladin = this.paladins.get(paladinId);
        if (!paladin) return { success: false, error: 'PALADIN_NOT_FOUND' };
        paladin.blessings.push(blessing);
        this._triggerHook('blessingAdded', { paladinId, blessing });
        return { success: true };
    }

    increaseFaith(paladinId, amount = 5) {
        const paladin = this.paladins.get(paladinId);
        if (!paladin) return { success: false, error: 'PALADIN_NOT_FOUND' };
        paladin.faith += amount;
        this._triggerHook('faithIncreased', { paladinId, newFaith: paladin.faith });
        return { success: true };
    }

    levelUpPaladin(paladinId) {
        const paladin = this.paladins.get(paladinId);
        if (!paladin) return { success: false, error: 'PALADIN_NOT_FOUND' };
        paladin.level++;
        if (paladin.level >= 5 && paladin.status === 'novice') {
            paladin.status = 'veteran';
        }
        this._triggerHook('paladinLeveledUp', { paladinId, newLevel: paladin.level });
        return { success: true };
    }

    legendPaladin(paladinId) {
        const paladin = this.paladins.get(paladinId);
        if (!paladin) return { success: false, error: 'PALADIN_NOT_FOUND' };
        paladin.status = 'legendary';
        this._triggerHook('paladinLegendized', { paladinId });
        return { success: true };
    }

    calculatePaladinValue(paladinId) {
        const paladin = this.paladins.get(paladinId);
        if (!paladin) return 0;
        return paladin.level * 100 + paladin.faith * 2 + paladin.blessings.length * 30;
    }

    listVeterans() { return Array.from(this.paladins.values()).filter(p => p.status === 'veteran').map(p => ({ ...p })); }

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
        if (this.stats.totalPaladins < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPaladins += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { paladins: Array.from(this.paladins.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.paladins) this.paladins = new Map(data.paladins);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, paladinCount: this.paladins.size }; }
}
