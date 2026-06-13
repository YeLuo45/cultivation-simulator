/**
 * ElementalStorm.js - 元素风暴
 * V365 Iteration 8/9 Round 9
 */
export class ElementalStorm {
    constructor(config = {}) {
        this.config = { maxStorms: config.maxStorms || 50, baseIntensity: config.baseIntensity || 50, ...config };
        this.storms = new Map();
        this.strikes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStorms: 0, totalStrikes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getStorm', (ctx) => this.getStorm(ctx.stormId));
        this.registerTool('createStorm', (ctx) => this.createStorm(ctx));
    }

    createStorm(data) {
        const validElements = ['metal', 'wood', 'water', 'fire', 'earth'];
        if (!validElements.includes(data.elementId)) return { success: false, error: 'INVALID_ELEMENT' };
        const id = `stm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const storm = { stormId: id, name: data.name || 'Storm', elementId: data.elementId, intensity: data.intensity || this.config.baseIntensity, duration: data.duration || 100, strikes: [], active: true, createdAt: Date.now() };
        this.storms.set(id, storm);
        this.stats.totalStorms++;
        this._triggerHook('stormCreated', { stormId: id });
        return { success: true, storm };
    }

    getStorm(id) { return this.storms.get(id) ? { ...this.storms.get(id) } : null; }
    listStorms() { return Array.from(this.storms.values()).map(s => ({ ...s })); }
    listActive() { return Array.from(this.storms.values()).filter(s => s.active).map(s => ({ ...s })); }
    listByElement(elementId) { return Array.from(this.storms.values()).filter(s => s.elementId === elementId).map(s => ({ ...s })); }

    triggerStrike(stormId, targetId, damage) {
        const storm = this.storms.get(stormId);
        if (!storm) return { success: false, error: 'STORM_NOT_FOUND' };
        if (!storm.active) return { success: false, error: 'STORM_INACTIVE' };
        const id = `ss_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const strike = { strikeId: id, stormId, targetId, damage, triggeredAt: Date.now() };
        this.strikes.set(id, strike);
        storm.strikes.push(id);
        this.stats.totalStrikes++;
        storm.duration--;
        if (storm.duration <= 0) storm.active = false;
        this._triggerHook('strikeTriggered', { stormId, strikeId: id, damage });
        return { success: true, strike };
    }

    getStrike(id) { return this.strikes.get(id) ? { ...this.strikes.get(id) } : null; }
    listStrikes() { return Array.from(this.strikes.values()).map(s => ({ ...s })); }
    listStrikesByStorm(stormId) { return Array.from(this.strikes.values()).filter(s => s.stormId === stormId).map(s => ({ ...s })); }

    intensifyStorm(stormId, amount) {
        const storm = this.storms.get(stormId);
        if (!storm) return { success: false, error: 'STORM_NOT_FOUND' };
        storm.intensity += amount;
        this._triggerHook('stormIntensified', { stormId, newIntensity: storm.intensity });
        return { success: true };
    }

    endStorm(stormId) {
        const storm = this.storms.get(stormId);
        if (!storm) return { success: false, error: 'STORM_NOT_FOUND' };
        storm.active = false;
        this._triggerHook('stormEnded', { stormId });
        return { success: true };
    }

    calculateTotalDamage() { return Array.from(this.strikes.values()).reduce((s, x) => s + x.damage, 0); }

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
        if (this.stats.totalStorms < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseIntensity += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { storms: Array.from(this.storms.entries()), strikes: Array.from(this.strikes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.storms) this.storms = new Map(data.storms);
        if (data.strikes) this.strikes = new Map(data.strikes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, stormCount: this.storms.size, strikeCount: this.strikes.size }; }
}