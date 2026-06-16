/**
 * ShadowArts.js - 影术
 * V430 Iteration 7/15 Round 15 - Shadow Arts
 */
export class ShadowArts {
    constructor(config = {}) {
        this.config = { maxShadows: config.maxShadows || 100, baseDarkness: config.baseDarkness || 20, ...config };
        this.shadows = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalShadows: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getShadow', (ctx) => this.getShadow(ctx.shadowId));
        this.registerTool('summonShadow', (ctx) => this.summonShadow(ctx));
    }

    summonShadow(data = {}) {
        const id = data.id || `sh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const shadow = {
            shadowId: id,
            wielderId: data.wielderId,
            name: data.name || 'Shadow Wraith',
            form: data.form || 'wraith',
            darkness: data.darkness || this.config.baseDarkness,
            stealth: data.stealth !== undefined ? data.stealth : 30,
            attacks: data.attacks || 0,
            status: data.status || 'passive',
            summonedAt: Date.now()
        };
        this.shadows.set(id, shadow);
        this.stats.totalShadows++;
        this._triggerHook('shadowSummoned', { shadowId: id });
        return { success: true, shadow };
    }

    getShadow(id) { return this.shadows.get(id) ? { ...this.shadows.get(id) } : null; }
    listShadows() { return Array.from(this.shadows.values()).map(s => ({ ...s })); }
    listByWielder(wielderId) { return Array.from(this.shadows.values()).filter(s => s.wielderId === wielderId).map(s => ({ ...s })); }
    listByForm(form) { return Array.from(this.shadows.values()).filter(s => s.form === form).map(s => ({ ...s })); }

    channelDarkness(shadowId, amount = 5) {
        const shadow = this.shadows.get(shadowId);
        if (!shadow) return { success: false, error: 'SHADOW_NOT_FOUND' };
        shadow.darkness += amount;
        this._triggerHook('darknessChanneled', { shadowId, newDarkness: shadow.darkness });
        return { success: true };
    }

    performStealth(shadowId) {
        const shadow = this.shadows.get(shadowId);
        if (!shadow) return { success: false, error: 'SHADOW_NOT_FOUND' };
        shadow.status = 'active';
        shadow.stealth = (shadow.stealth || 0) + 5;
        this._triggerHook('stealthPerformed', { shadowId });
        return { success: true };
    }

    attackWithShadow(shadowId) {
        const shadow = this.shadows.get(shadowId);
        if (!shadow) return { success: false, error: 'SHADOW_NOT_FOUND' };
        shadow.attacks += 1;
        if (shadow.attacks >= 10) shadow.status = 'corporeal';
        this._triggerHook('shadowAttacked', { shadowId, attacks: shadow.attacks });
        return { success: true };
    }

    dismissShadow(shadowId) {
        const shadow = this.shadows.get(shadowId);
        if (!shadow) return { success: false, error: 'SHADOW_NOT_FOUND' };
        shadow.status = 'passive';
        return { success: true };
    }

    calculateShadowPower(shadowId) {
        const shadow = this.shadows.get(shadowId);
        if (!shadow) return 0;
        return shadow.darkness * (1 + shadow.stealth / 100) + shadow.attacks * 2;
    }

    listCorporeal() { return Array.from(this.shadows.values()).filter(s => s.status === 'corporeal').map(s => ({ ...s })); }

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
        if (this.stats.totalShadows < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxShadows += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { shadows: Array.from(this.shadows.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.shadows) this.shadows = new Map(data.shadows);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, shadowCount: this.shadows.size }; }
}
