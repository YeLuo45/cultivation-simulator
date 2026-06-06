/**
 * CultivationEye.js - 道眼系统
 * V521 Iteration 3/20 Round 21 - Cultivation Eye
 */

export class CultivationEye {
    constructor(config = {}) {
        this.config = { maxEyes: config.maxEyes || 50, basePerception: config.basePerception || 20, ...config };
        this.eyes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEyes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEye', (ctx) => this.getEye(ctx.eyeId));
        this.registerTool('openEye', (ctx) => this.openEye(ctx));
    }

    openEye(data) {
        const id = data.eyeId || `eye_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const eye = {
            eyeId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Eye',
            type: data.type || 'heavenly',
            perception: data.perception || this.config.basePerception,
            visions: [],
            level: 1,
            status: 'open',
            createdAt: Date.now()
        };
        this.eyes.set(id, eye);
        this.stats.totalEyes++;
        this._triggerHook('eyeOpened', { eyeId: id });
        return { success: true, eye };
    }

    getEye(id) { return this.eyes.get(id) ? { ...this.eyes.get(id) } : null; }
    listEyes() { return Array.from(this.eyes.values()).map(e => ({ ...e })); }
    listByCultivator(cultivatorId) { return Array.from(this.eyes.values()).filter(e => e.cultivatorId === cultivatorId).map(e => ({ ...e })); }
    listAwakened() { return Array.from(this.eyes.values()).filter(e => e.status === 'awakened').map(e => ({ ...e })); }

    addVision(eyeId, vision) {
        const eye = this.eyes.get(eyeId);
        if (!eye) return { success: false, error: 'EYE_NOT_FOUND' };
        eye.visions.push(vision);
        this._triggerHook('visionAdded', { eyeId, vision });
        return { success: true, eye: { ...eye } };
    }

    increasePerception(eyeId, amount = 5) {
        const eye = this.eyes.get(eyeId);
        if (!eye) return { success: false, error: 'EYE_NOT_FOUND' };
        eye.perception += amount;
        this._triggerHook('perceptionIncreased', { eyeId, newPerception: eye.perception });
        return { success: true };
    }

    levelUpEye(eyeId) {
        const eye = this.eyes.get(eyeId);
        if (!eye) return { success: false, error: 'EYE_NOT_FOUND' };
        eye.level++;
        this._triggerHook('eyeLeveledUp', { eyeId, newLevel: eye.level });
        return { success: true };
    }

    awakenEye(eyeId) {
        const eye = this.eyes.get(eyeId);
        if (!eye) return { success: false, error: 'EYE_NOT_FOUND' };
        eye.status = 'awakened';
        this._triggerHook('eyeAwakened', { eyeId });
        return { success: true };
    }

    calculateEyePower(eyeId) {
        const eye = this.eyes.get(eyeId);
        if (!eye) return 0;
        return eye.level * 50 + eye.perception + eye.visions.length * 20;
    }

    listByType(type) { return Array.from(this.eyes.values()).filter(e => e.type === type).map(e => ({ ...e })); }

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
        if (this.stats.totalEyes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEyes += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { eyes: Array.from(this.eyes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.eyes) this.eyes = new Map(data.eyes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, eyeCount: this.eyes.size }; }
}
