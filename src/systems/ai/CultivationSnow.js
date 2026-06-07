/**
 * CultivationSnow.js - 修真雪
 * V800 Iteration 3/30 Round 32
 */
export class CultivationSnow {
    constructor(config = {}) {
        this.config = { maxSnows: config.maxSnows || 20, basePurity: config.basePurity || 20, ...config };
        this.snows = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecruited: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSnow', (ctx) => this.getSnow(ctx.snowId));
        this.registerTool('recruitSnow', (ctx) => this.recruitSnow(ctx));
    }

    recruitSnow(data) {
        const id = data.id || `snow_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const snow = {
            snowId: id, masterId: data.masterId || 'unknown', name: data.name || 'Unnamed Snow',
            type: data.type || 'winter', purity: data.purity || this.config.basePurity,
            flakes: data.flakes || [], level: data.level || 1, status: 'novice',
            createdAt: Date.now()
        };
        this.snows.set(id, snow);
        this.stats.totalRecruited++;
        this._triggerHook('snowRecruited', { snowId: id });
        return { success: true, snow };
    }

    getSnow(id) { return this.snows.get(id) ? { ...this.snows.get(id) } : null; }
    listSnows() { return Array.from(this.snows.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.snows.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.snows.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addFlake(snowId, flake) {
        const snow = this.snows.get(snowId);
        if (!snow) return { success: false, error: 'SNOW_NOT_FOUND' };
        snow.flakes.push(flake);
        this._triggerHook('flakeAdded', { snowId });
        return { success: true };
    }

    raisePurity(snowId, amount = 5) {
        const snow = this.snows.get(snowId);
        if (!snow) return { success: false, error: 'SNOW_NOT_FOUND' };
        snow.purity = Math.max(0, snow.purity + amount);
        this._triggerHook('purityRaised', { snowId });
        return { success: true };
    }

    levelUpSnow(snowId) {
        const snow = this.snows.get(snowId);
        if (!snow) return { success: false, error: 'SNOW_NOT_FOUND' };
        snow.level++;
        this._triggerHook('snowLeveledUp', { snowId });
        return { success: true };
    }

    legendSnow(snowId) {
        const snow = this.snows.get(snowId);
        if (!snow) return { success: false, error: 'SNOW_NOT_FOUND' };
        snow.status = 'legendary';
        this._triggerHook('snowLegendized', { snowId });
        return { success: true };
    }

    calculateSnowValue(snowId) {
        const snow = this.snows.get(snowId);
        if (!snow) return 0;
        return snow.level * 100 + snow.purity * 2 + snow.flakes.length * 30;
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
        if (this.stats.totalRecruited < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSnows += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { snows: Array.from(this.snows.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.snows) this.snows = new Map(data.snows);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, snowCount: this.snows.size }; }
}
