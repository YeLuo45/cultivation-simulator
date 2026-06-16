/**
 * ElementalStrike.js - 元素攻击
 * V363 Iteration 6/9 Round 9
 */
export class ElementalStrike {
    constructor(config = {}) {
        this.config = { maxStrikes: config.maxStrikes || 100, baseDamage: config.baseDamage || 10, ...config };
        this.strikes = new Map();
        this.targets = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStrikes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getStrike', (ctx) => this.getStrike(ctx.strikeId));
        this.registerTool('executeStrike', (ctx) => this.executeStrike(ctx.elementId, ctx.targetId, ctx.power));
    }

    registerTarget(data) {
        const id = data.id || `tg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const target = { targetId: id, name: data.name || 'Target', defense: data.defense !== undefined ? data.defense : 10, hp: data.hp !== undefined ? data.hp : 100 };
        this.targets.set(id, target);
        return { success: true, target };
    }

    getTarget(id) { return this.targets.get(id) ? { ...this.targets.get(id) } : null; }
    listTargets() { return Array.from(this.targets.values()).map(t => ({ ...t })); }

    executeStrike(elementId, targetId, power = this.config.baseDamage) {
        const validElements = ['metal', 'wood', 'water', 'fire', 'earth'];
        if (!validElements.includes(elementId)) return { success: false, error: 'INVALID_ELEMENT' };
        const target = this.targets.get(targetId);
        if (!target) return { success: false, error: 'TARGET_NOT_FOUND' };
        const damage = Math.max(0, power - target.defense);
        target.hp = Math.max(0, target.hp - damage);
        const id = `str_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const strike = { strikeId: id, elementId, targetId, power, damage, remainingHp: target.hp, executedAt: Date.now() };
        this.strikes.set(id, strike);
        this.stats.totalStrikes++;
        this._triggerHook('strikeExecuted', { strikeId: id, damage });
        return { success: true, strike, target: { ...target } };
    }

    getStrike(id) { return this.strikes.get(id) ? { ...this.strikes.get(id) } : null; }
    listStrikes() { return Array.from(this.strikes.values()).map(s => ({ ...s })); }
    listByTarget(targetId) { return Array.from(this.strikes.values()).filter(s => s.targetId === targetId).map(s => ({ ...s })); }
    listByElement(elementId) { return Array.from(this.strikes.values()).filter(s => s.elementId === elementId).map(s => ({ ...s })); }

    calculateTotalDamage() { return Array.from(this.strikes.values()).reduce((s, x) => s + x.damage, 0); }

    listElements() { return ['metal', 'wood', 'water', 'fire', 'earth']; }

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
        if (this.stats.totalStrikes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseDamage += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { strikes: Array.from(this.strikes.entries()), targets: Array.from(this.targets.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.strikes) this.strikes = new Map(data.strikes);
        if (data.targets) this.targets = new Map(data.targets);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, strikeCount: this.strikes.size, targetCount: this.targets.size }; }
}