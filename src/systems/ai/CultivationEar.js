/**
 * CultivationEar.js - 道耳系统
 * V522 Iteration 4/20 Round 21 - Cultivation Ear
 */

export class CultivationEar {
    constructor(config = {}) {
        this.config = { maxEars: config.maxEars || 50, baseSensitivity: config.baseSensitivity || 20, ...config };
        this.ears = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEars: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEar', (ctx) => this.getEar(ctx.earId));
        this.registerTool('openEar', (ctx) => this.openEar(ctx));
    }

    openEar(data) {
        const id = data.earId || `ear_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ear = {
            earId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Ear',
            type: data.type || 'heavenly',
            sensitivity: data.sensitivity || this.config.baseSensitivity,
            sounds: [],
            level: 1,
            status: 'open',
            createdAt: Date.now()
        };
        this.ears.set(id, ear);
        this.stats.totalEars++;
        this._triggerHook('earOpened', { earId: id });
        return { success: true, ear };
    }

    getEar(id) { return this.ears.get(id) ? { ...this.ears.get(id) } : null; }
    listEars() { return Array.from(this.ears.values()).map(e => ({ ...e })); }
    listByCultivator(cultivatorId) { return Array.from(this.ears.values()).filter(e => e.cultivatorId === cultivatorId).map(e => ({ ...e })); }
    listAwakened() { return Array.from(this.ears.values()).filter(e => e.status === 'awakened').map(e => ({ ...e })); }

    addSound(earId, sound) {
        const ear = this.ears.get(earId);
        if (!ear) return { success: false, error: 'EAR_NOT_FOUND' };
        ear.sounds.push(sound);
        this._triggerHook('soundAdded', { earId, sound });
        return { success: true, ear: { ...ear } };
    }

    increaseSensitivity(earId, amount = 5) {
        const ear = this.ears.get(earId);
        if (!ear) return { success: false, error: 'EAR_NOT_FOUND' };
        ear.sensitivity += amount;
        this._triggerHook('sensitivityIncreased', { earId, newSensitivity: ear.sensitivity });
        return { success: true };
    }

    levelUpEar(earId) {
        const ear = this.ears.get(earId);
        if (!ear) return { success: false, error: 'EAR_NOT_FOUND' };
        ear.level++;
        this._triggerHook('earLeveledUp', { earId, newLevel: ear.level });
        return { success: true };
    }

    awakenEar(earId) {
        const ear = this.ears.get(earId);
        if (!ear) return { success: false, error: 'EAR_NOT_FOUND' };
        ear.status = 'awakened';
        this._triggerHook('earAwakened', { earId });
        return { success: true };
    }

    calculateEarPower(earId) {
        const ear = this.ears.get(earId);
        if (!ear) return 0;
        return ear.level * 50 + ear.sensitivity + ear.sounds.length * 15;
    }

    listByType(type) { return Array.from(this.ears.values()).filter(e => e.type === type).map(e => ({ ...e })); }

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
        if (this.stats.totalEars < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEars += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ears: Array.from(this.ears.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ears) this.ears = new Map(data.ears);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, earCount: this.ears.size }; }
}
