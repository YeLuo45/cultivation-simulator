/**
 * CultivationWay.js - 道途系统
 * V528 Iteration 10/20 Round 21 - Cultivation Way
 */

export class CultivationWay {
    constructor(config = {}) {
        this.config = { maxWays: config.maxWays || 50, baseHarmony: config.baseHarmony || 30, ...config };
        this.ways = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWays: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWay', (ctx) => this.getWay(ctx.wayId));
        this.registerTool('walkWay', (ctx) => this.walkWay(ctx));
    }

    walkWay(data) {
        const id = data.wayId || `way_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const way = {
            wayId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Way',
            type: data.type || 'righteous',
            harmony: data.harmony || this.config.baseHarmony,
            milestones: data.milestones || [],
            level: 1,
            status: 'forming',
            createdAt: Date.now()
        };
        this.ways.set(id, way);
        this.stats.totalWays++;
        this._triggerHook('wayWalked', { wayId: id });
        return { success: true, way };
    }

    getWay(id) { return this.ways.get(id) ? { ...this.ways.get(id) } : null; }
    listWays() { return Array.from(this.ways.values()).map(w => ({ ...w })); }
    listByCultivator(cultivatorId) { return Array.from(this.ways.values()).filter(w => w.cultivatorId === cultivatorId).map(w => ({ ...w })); }
    listEternal() { return Array.from(this.ways.values()).filter(w => w.status === 'eternal').map(w => ({ ...w })); }

    addMilestone(wayId, milestone) {
        const way = this.ways.get(wayId);
        if (!way) return { success: false, error: 'WAY_NOT_FOUND' };
        way.milestones.push(milestone);
        this._triggerHook('milestoneAdded', { wayId, milestone });
        return { success: true, way: { ...way } };
    }

    increaseHarmony(wayId, amount = 5) {
        const way = this.ways.get(wayId);
        if (!way) return { success: false, error: 'WAY_NOT_FOUND' };
        way.harmony += amount;
        this._triggerHook('harmonyIncreased', { wayId, newHarmony: way.harmony });
        return { success: true };
    }

    levelUpWay(wayId) {
        const way = this.ways.get(wayId);
        if (!way) return { success: false, error: 'WAY_NOT_FOUND' };
        way.level++;
        this._triggerHook('wayLeveledUp', { wayId, newLevel: way.level });
        return { success: true };
    }

    eternizeWay(wayId) {
        const way = this.ways.get(wayId);
        if (!way) return { success: false, error: 'WAY_NOT_FOUND' };
        way.status = 'eternal';
        this._triggerHook('wayEternalized', { wayId });
        return { success: true };
    }

    calculateWayPower(wayId) {
        const way = this.ways.get(wayId);
        if (!way) return 0;
        return way.level * 100 + way.harmony * 2 + way.milestones.length * 30;
    }

    listByType(type) { return Array.from(this.ways.values()).filter(w => w.type === type).map(w => ({ ...w })); }

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
        if (this.stats.totalWays < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWays += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ways: Array.from(this.ways.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ways) this.ways = new Map(data.ways);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, wayCount: this.ways.size }; }
}
