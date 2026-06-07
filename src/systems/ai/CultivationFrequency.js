/**
 * CultivationFrequency.js - 修真频率
 * V747 Iteration 10/30 Round 30
 */
export class CultivationFrequency {
    constructor(config = {}) {
        this.config = { maxFrequencies: config.maxFrequencies || 20, baseAmplitude: config.baseAmplitude || 20, ...config };
        this.frequencies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFrequencies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFrequency', (ctx) => this.getFrequency(ctx.frequencyId));
        this.registerTool('recruitFrequency', (ctx) => this.recruitFrequency(ctx));
    }

    recruitFrequency(data) {
        const id = data.id || `freq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const frequency = {
            frequencyId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed',
            type: data.type || 'medium',
            amplitude: data.amplitude || this.config.baseAmplitude,
            waves: data.waves || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.frequencies.set(id, frequency);
        this.stats.totalFrequencies++;
        this._triggerHook('frequencyRecruited', { frequencyId: id });
        return { success: true, frequency };
    }

    getFrequency(id) { return this.frequencies.get(id) ? { ...this.frequencies.get(id) } : null; }
    listFrequencies() { return Array.from(this.frequencies.values()).map(f => ({ ...f })); }
    listByMaster(masterId) { return Array.from(this.frequencies.values()).filter(f => f.masterId === masterId).map(f => ({ ...f })); }
    listLegendary() { return Array.from(this.frequencies.values()).filter(f => f.status === 'legendary').map(f => ({ ...f })); }

    addWave(frequencyId, wave) {
        const frequency = this.frequencies.get(frequencyId);
        if (!frequency) return { success: false, error: 'FREQUENCY_NOT_FOUND' };
        frequency.waves.push(wave);
        if (frequency.waves.length >= 3 && frequency.status === 'novice') frequency.status = 'veteran';
        this._triggerHook('waveAdded', { frequencyId, wave });
        return { success: true };
    }

    raiseAmplitude(frequencyId, amount = 5) {
        const frequency = this.frequencies.get(frequencyId);
        if (!frequency) return { success: false, error: 'FREQUENCY_NOT_FOUND' };
        frequency.amplitude += amount;
        this._triggerHook('amplitudeRaised', { frequencyId, newAmplitude: frequency.amplitude });
        return { success: true };
    }

    levelUpFrequency(frequencyId) {
        const frequency = this.frequencies.get(frequencyId);
        if (!frequency) return { success: false, error: 'FREQUENCY_NOT_FOUND' };
        frequency.level++;
        this._triggerHook('frequencyLeveledUp', { frequencyId, newLevel: frequency.level });
        return { success: true };
    }

    legendFrequency(frequencyId) {
        const frequency = this.frequencies.get(frequencyId);
        if (!frequency) return { success: false, error: 'FREQUENCY_NOT_FOUND' };
        frequency.status = 'legendary';
        this._triggerHook('frequencyLegendized', { frequencyId });
        return { success: true };
    }

    calculateFrequencyValue(frequencyId) {
        const frequency = this.frequencies.get(frequencyId);
        if (!frequency) return 0;
        return frequency.level * 100 + frequency.amplitude * 2 + frequency.waves.length * 30;
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
        if (this.stats.totalFrequencies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFrequencies += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { frequencies: Array.from(this.frequencies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.frequencies) this.frequencies = new Map(data.frequencies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, frequencyCount: this.frequencies.size }; }
}
