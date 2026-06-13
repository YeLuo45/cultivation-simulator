/**
 * LightPhantasm.js - 幻光 (Light Phantasm system)
 * V432 Iteration 9/15 Round 15
 */
export class LightPhantasm {
    constructor(config = {}) {
        this.config = { maxIllusions: config.maxIllusions || 100, baseBrightness: config.baseBrightness || 20, ...config };
        this.illusions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalIllusions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getIllusion', (ctx) => this.getIllusion(ctx.illusionId));
        this.registerTool('createIllusion', (ctx) => this.createIllusion(ctx));
    }

    createIllusion(data) {
        const id = data.id || `lum_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ill = {
            illusionId: id,
            casterId: data.casterId,
            name: data.name || 'Light Phantasm',
            brightness: data.brightness || this.config.baseBrightness,
            color: data.color || 'white',
            duration: data.duration || 30,
            targets: data.targets || [],
            status: 'conceived',
            createdAt: Date.now()
        };
        this.illusions.set(id, ill);
        this.stats.totalIllusions++;
        this._triggerHook('illusionCreated', { illusionId: id });
        return { success: true, illusion: ill };
    }

    getIllusion(id) { return this.illusions.get(id) ? { ...this.illusions.get(id) } : null; }
    listIllusions() { return Array.from(this.illusions.values()).map(i => ({ ...i })); }
    listByCaster(casterId) { return Array.from(this.illusions.values()).filter(i => i.casterId === casterId).map(i => ({ ...i })); }
    listActive() { return Array.from(this.illusions.values()).filter(i => i.status === 'casted').map(i => ({ ...i })); }

    intensifyIllusion(illusionId, amount = 5) {
        const ill = this.illusions.get(illusionId);
        if (!ill) return { success: false, error: 'ILLUSION_NOT_FOUND' };
        ill.brightness += amount;
        if (ill.status === 'conceived') ill.status = 'casted';
        this._triggerHook('illusionIntensified', { illusionId, newBrightness: ill.brightness });
        return { success: true };
    }

    addTarget(illusionId, target) {
        const ill = this.illusions.get(illusionId);
        if (!ill) return { success: false, error: 'ILLUSION_NOT_FOUND' };
        if (!ill.targets.includes(target)) ill.targets.push(target);
        if (ill.status === 'conceived') ill.status = 'casted';
        this._triggerHook('targetAdded', { illusionId, target, targetCount: ill.targets.length });
        return { success: true };
    }

    prolongIllusion(illusionId, amount = 10) {
        const ill = this.illusions.get(illusionId);
        if (!ill) return { success: false, error: 'ILLUSION_NOT_FOUND' };
        ill.duration += amount;
        this._triggerHook('illusionProlonged', { illusionId, newDuration: ill.duration });
        return { success: true };
    }

    dispelIllusion(illusionId) {
        const ill = this.illusions.get(illusionId);
        if (!ill) return { success: false, error: 'ILLUSION_NOT_FOUND' };
        ill.status = 'dissipated';
        this._triggerHook('illusionDispelled', { illusionId });
        return { success: true };
    }

    calculatePhantasmPower(illusionId) {
        const ill = this.illusions.get(illusionId);
        if (!ill) return 0;
        return ill.brightness * (1 + ill.duration / 100) + ill.targets.length * 2;
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
        if (this.stats.totalIllusions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxIllusions += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { illusions: Array.from(this.illusions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.illusions) this.illusions = new Map(data.illusions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, illusionCount: this.illusions.size }; }
}
