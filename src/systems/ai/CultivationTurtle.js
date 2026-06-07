/**
 * CultivationTurtle.js - 修真龟
 * V722 Iteration 15/30 Round 29
 */
export class CultivationTurtle {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxTurtles: config.maxTurtles || 20, baseEndurance: config.baseEndurance || 20, ...config };
        this.turtles = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTurtles: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTurtle', (ctx) => this.getTurtle(ctx.turtleId));
        this.registerTool('recruitTurtle', (ctx) => this.recruitTurtle(ctx));
    }

    recruitTurtle(data) {
        const id = data.id || `turtle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const turtle = { turtleId: id, masterId: data.masterId || 'unknown', name: data.name || 'Unnamed Turtle', type: data.type || 'sea', endurance: data.endurance || this.config.baseEndurance, shells: data.shells || [], level: data.level || 1, status: 'novice', recruitedAt: Date.now(), lastRefresh: Date.now() };
        this.turtles.set(id, turtle);
        this.stats.totalTurtles++;
        this._triggerHook('turtleRecruited', { turtleId: id });
        return { success: true, turtle };
    }

    getTurtle(id) { return this.turtles.get(id) ? { ...this.turtles.get(id) } : null; }
    listTurtles() { return Array.from(this.turtles.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.turtles.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listByType(type) { return Array.from(this.turtles.values()).filter(t => t.type === type).map(t => ({ ...t })); }
    listByEndurance(min) { return Array.from(this.turtles.values()).filter(t => t.endurance >= min).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.turtles.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }
    listTop(n = 10) { return [...this.listTurtles()].sort((a, b) => b.level - a.level).slice(0, n); }

    refreshTurtle(turtleId) {
        const turtle = this.turtles.get(turtleId);
        if (!turtle) return { success: false, error: 'TURTLE_NOT_FOUND' };
        turtle.lastRefresh = Date.now();
        this._triggerHook('turtleRefreshed', { turtleId });
        return { success: true };
    }

    addShell(turtleId, shell) {
        const turtle = this.turtles.get(turtleId);
        if (!turtle) return { success: false, error: 'TURTLE_NOT_FOUND' };
        turtle.shells.push(shell);
        this._triggerHook('shellAdded', { turtleId });
        return { success: true };
    }

    raiseEndurance(turtleId, amount = 5) {
        const turtle = this.turtles.get(turtleId);
        if (!turtle) return { success: false, error: 'TURTLE_NOT_FOUND' };
        turtle.endurance += amount;
        this._triggerHook('enduranceRaised', { turtleId, newEndurance: turtle.endurance });
        return { success: true };
    }

    levelUpTurtle(turtleId) {
        const turtle = this.turtles.get(turtleId);
        if (!turtle) return { success: false, error: 'TURTLE_NOT_FOUND' };
        turtle.level++;
        this._triggerHook('turtleLeveledUp', { turtleId, newLevel: turtle.level });
        return { success: true };
    }

    trainTurtle(turtleId) {
        const turtle = this.turtles.get(turtleId);
        if (!turtle) return { success: false, error: 'TURTLE_NOT_FOUND' };
        turtle.status = 'veteran';
        this._triggerHook('turtleTrained', { turtleId });
        return { success: true };
    }

    legendTurtle(turtleId) {
        const turtle = this.turtles.get(turtleId);
        if (!turtle) return { success: false, error: 'TURTLE_NOT_FOUND' };
        turtle.status = 'legendary';
        this._triggerHook('turtleLegendized', { turtleId });
        return { success: true };
    }

    changeType(turtleId, newType) {
        const turtle = this.turtles.get(turtleId);
        if (!turtle) return { success: false, error: 'TURTLE_NOT_FOUND' };
        turtle.type = newType;
        this._triggerHook('typeChanged', { turtleId });
        return { success: true };
    }

    calculateTurtleValue(turtleId) {
        const turtle = this.turtles.get(turtleId);
        if (!turtle) return 0;
        return turtle.level * 100 + turtle.endurance * 2 + turtle.shells.length * 30;
    }

    deleteTurtle(turtleId) {
        if (!this.turtles.has(turtleId)) return { success: false, error: 'TURTLE_NOT_FOUND' };
        this.turtles.delete(turtleId);
        this._triggerHook('turtleDeleted', { turtleId });
        return { success: true };
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
        if (this.stats.totalTurtles < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTurtles += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { turtles: Array.from(this.turtles.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.turtles) this.turtles = new Map(data.turtles);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, turtleCount: this.turtles.size }; }
}
