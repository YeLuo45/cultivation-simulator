/**
 * ConsciousnessWave.js - 意识海
 * V395 Iteration 2/15 Round 13
 */
export class ConsciousnessWave {
    constructor(config = {}) {
        this.config = { maxWaves: config.maxWaves || 100, baseDepth: config.baseDepth || 10, ...config };
        this.waves = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWaves: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWave', (ctx) => this.getWave(ctx.waveId));
        this.registerTool('createWave', (ctx) => this.createWave(ctx));
    }

    createWave(data) {
        const id = data.id || `wv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const wave = { waveId: id, cultivatorId: data.cultivatorId, depth: data.depth || this.config.baseDepth, range: data.range || 5, sharpness: data.sharpness || 10, status: 'active', createdAt: Date.now() };
        this.waves.set(id, wave);
        this.stats.totalWaves++;
        this._triggerHook('waveCreated', { waveId: id });
        return { success: true, wave };
    }

    getWave(id) { return this.waves.get(id) ? { ...this.waves.get(id) } : null; }
    listWaves() { return Array.from(this.waves.values()).map(w => ({ ...w })); }
    listByCultivator(cultivatorId) { return Array.from(this.waves.values()).filter(w => w.cultivatorId === cultivatorId).map(w => ({ ...w })); }
    listByDepth(min) { return Array.from(this.waves.values()).filter(w => w.depth >= min).map(w => ({ ...w })); }

    expand(waveId, amount = 5) {
        const wave = this.waves.get(waveId);
        if (!wave) return { success: false, error: 'WAVE_NOT_FOUND' };
        wave.depth += amount;
        wave.range += Math.floor(amount / 2);
        this._triggerHook('waveExpanded', { waveId, newDepth: wave.depth });
        return { success: true };
    }

    sharpen(waveId, amount = 5) {
        const wave = this.waves.get(waveId);
        if (!wave) return { success: false, error: 'WAVE_NOT_FOUND' };
        wave.sharpness += amount;
        this._triggerHook('waveSharpened', { waveId });
        return { success: true };
    }

    releaseWave(waveId) {
        const wave = this.waves.get(waveId);
        if (!wave) return { success: false, error: 'WAVE_NOT_FOUND' };
        wave.status = 'released';
        this._triggerHook('waveReleased', { waveId });
        return { success: true };
    }

    calculatePower(waveId) {
        const wave = this.waves.get(waveId);
        if (!wave) return 0;
        return wave.depth * wave.sharpness + wave.range * 3;
    }

    listActive() { return Array.from(this.waves.values()).filter(w => w.status === 'active').map(w => ({ ...w })); }

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
        if (this.stats.totalWaves < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWaves += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { waves: Array.from(this.waves.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.waves) this.waves = new Map(data.waves);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, waveCount: this.waves.size }; }
}