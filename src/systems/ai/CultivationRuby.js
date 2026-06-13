/**
 * CultivationRuby.js - 修真红宝石系统
 * V833 Iteration 6/30 Round 33
 */
export class CultivationRuby {
    constructor(config = {}) {
        this.config = { maxRubies: config.maxRubies || 20, baseFire: config.baseFire || 20, ...config };
        this.rubies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRubies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRuby', (ctx) => this.getRuby(ctx.rubyId));
        this.registerTool('recruitRuby', (ctx) => this.recruitRuby(ctx));
    }

    recruitRuby(data) {
        const id = data.rubyId || `ruby_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ruby = { rubyId: id, masterId: data.masterId, name: data.name || 'Mystic Ruby', type: data.type || 'divine', fire: data.fire || this.config.baseFire, inclusions: data.inclusions || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.rubies.set(id, ruby);
        this.stats.totalRubies++;
        this._triggerHook('rubyRecruited', { rubyId: id });
        return { success: true, ruby };
    }

    getRuby(id) { return this.rubies.get(id) ? { ...this.rubies.get(id) } : null; }
    listRubies() { return Array.from(this.rubies.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.rubies.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.rubies.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addInclusion(rubyId, inclusion) {
        const ruby = this.rubies.get(rubyId);
        if (!ruby) return { success: false, error: 'RUBY_NOT_FOUND' };
        ruby.inclusions.push(inclusion);
        this._triggerHook('inclusionAdded', { rubyId, inclusion });
        return { success: true };
    }

    raiseFire(rubyId, amount = 5) {
        const ruby = this.rubies.get(rubyId);
        if (!ruby) return { success: false, error: 'RUBY_NOT_FOUND' };
        ruby.fire += amount;
        this._triggerHook('fireRaised', { rubyId, newFire: ruby.fire });
        return { success: true };
    }

    levelUpRuby(rubyId) {
        const ruby = this.rubies.get(rubyId);
        if (!ruby) return { success: false, error: 'RUBY_NOT_FOUND' };
        ruby.level++;
        this._triggerHook('rubyLeveledUp', { rubyId, newLevel: ruby.level });
        return { success: true };
    }

    legendRuby(rubyId) {
        const ruby = this.rubies.get(rubyId);
        if (!ruby) return { success: false, error: 'RUBY_NOT_FOUND' };
        ruby.status = 'legendary';
        this._triggerHook('rubyLegendized', { rubyId });
        return { success: true };
    }

    calculateRubyValue(rubyId) {
        const ruby = this.rubies.get(rubyId);
        if (!ruby) return 0;
        return ruby.level * 100 + ruby.fire * 2 + ruby.inclusions.length * 30;
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
        if (this.stats.totalRubies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRubies += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rubies: Array.from(this.rubies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rubies) this.rubies = new Map(data.rubies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, rubyCount: this.rubies.size }; }
}
