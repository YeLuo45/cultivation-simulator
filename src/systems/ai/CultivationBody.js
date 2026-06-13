/**
 * CultivationBody.js - 道身系统
 * V525 Iteration 7/20 Round 21 - Cultivation Body
 */

export class CultivationBody {
    constructor(config = {}) {
        this.config = { maxBodies: config.maxBodies || 50, baseStrength: config.baseStrength || 30, ...config };
        this.bodies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBodies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBody', (ctx) => this.getBody(ctx.bodyId));
        this.registerTool('forgeBody', (ctx) => this.forgeBody(ctx));
    }

    forgeBody(data) {
        const id = data.bodyId || `bdy_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const body = {
            bodyId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Body',
            type: data.type || 'immortal',
            strength: data.strength || this.config.baseStrength,
            bones: [],
            level: 1,
            status: 'mortal',
            createdAt: Date.now()
        };
        this.bodies.set(id, body);
        this.stats.totalBodies++;
        this._triggerHook('bodyForged', { bodyId: id });
        return { success: true, body };
    }

    getBody(id) { return this.bodies.get(id) ? { ...this.bodies.get(id) } : null; }
    listBodies() { return Array.from(this.bodies.values()).map(b => ({ ...b })); }
    listByCultivator(cultivatorId) { return Array.from(this.bodies.values()).filter(b => b.cultivatorId === cultivatorId).map(b => ({ ...b })); }
    listEnlightened() { return Array.from(this.bodies.values()).filter(b => b.status === 'enlightened').map(b => ({ ...b })); }

    addBone(bodyId, bone) {
        const body = this.bodies.get(bodyId);
        if (!body) return { success: false, error: 'BODY_NOT_FOUND' };
        body.bones.push(bone);
        this._triggerHook('boneAdded', { bodyId, bone });
        return { success: true, body: { ...body } };
    }

    increaseStrength(bodyId, amount = 5) {
        const body = this.bodies.get(bodyId);
        if (!body) return { success: false, error: 'BODY_NOT_FOUND' };
        body.strength += amount;
        this._triggerHook('strengthIncreased', { bodyId, newStrength: body.strength });
        return { success: true };
    }

    levelUpBody(bodyId) {
        const body = this.bodies.get(bodyId);
        if (!body) return { success: false, error: 'BODY_NOT_FOUND' };
        body.level++;
        this._triggerHook('bodyLeveledUp', { bodyId, newLevel: body.level });
        return { success: true };
    }

    ascendBody(bodyId) {
        const body = this.bodies.get(bodyId);
        if (!body) return { success: false, error: 'BODY_NOT_FOUND' };
        body.status = 'ascended';
        this._triggerHook('bodyAscended', { bodyId });
        return { success: true };
    }

    calculateBodyPower(bodyId) {
        const body = this.bodies.get(bodyId);
        if (!body) return 0;
        return body.level * 100 + body.strength * 2 + body.bones.length * 30;
    }

    listByType(type) { return Array.from(this.bodies.values()).filter(b => b.type === type).map(b => ({ ...b })); }

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
        if (this.stats.totalBodies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBodies += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { bodies: Array.from(this.bodies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.bodies) this.bodies = new Map(data.bodies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bodyCount: this.bodies.size }; }
}
