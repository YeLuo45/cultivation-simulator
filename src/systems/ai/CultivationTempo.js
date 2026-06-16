/**
 * CultivationTempo.js - 修真节拍系统
 * V786 Iteration 19/30 Round 31
 */
export class CultivationTempo {
    constructor(config = {}) {
        this.config = { maxTempos: config.maxTempos || 20, baseSpeed: config.baseSpeed || 20, ...config };
        this.tempos = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTempos: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTempo', (ctx) => this.getTempo(ctx.tempoId));
        this.registerTool('recruitTempo', (ctx) => this.recruitTempo(ctx));
    }

    recruitTempo(data) {
        const id = data.tempoId || `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tempo = {
            tempoId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Tempo',
            type: data.type || 'fast',
            speed: data.speed || this.config.baseSpeed,
            pulses: data.pulses || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.tempos.set(id, tempo);
        this.stats.totalTempos++;
        this._triggerHook('tempoRecruited', { tempoId: id });
        return { success: true, tempo };
    }

    getTempo(id) { return this.tempos.get(id) ? { ...this.tempos.get(id) } : null; }
    listTempos() { return Array.from(this.tempos.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.tempos.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.tempos.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addPulse(tempoId, pulse) {
        const tempo = this.tempos.get(tempoId);
        if (!tempo) return { success: false, error: 'TEMPO_NOT_FOUND' };
        tempo.pulses.push(pulse);
        this._triggerHook('pulseAdded', { tempoId, pulse });
        return { success: true };
    }

    raiseSpeed(tempoId, amount = 5) {
        const tempo = this.tempos.get(tempoId);
        if (!tempo) return { success: false, error: 'TEMPO_NOT_FOUND' };
        tempo.speed += amount;
        this._triggerHook('speedRaised', { tempoId, newSpeed: tempo.speed });
        return { success: true };
    }

    levelUpTempo(tempoId) {
        const tempo = this.tempos.get(tempoId);
        if (!tempo) return { success: false, error: 'TEMPO_NOT_FOUND' };
        tempo.level++;
        this._triggerHook('tempoLeveledUp', { tempoId, newLevel: tempo.level });
        return { success: true };
    }

    legendTempo(tempoId) {
        const tempo = this.tempos.get(tempoId);
        if (!tempo) return { success: false, error: 'TEMPO_NOT_FOUND' };
        tempo.status = 'legendary';
        this._triggerHook('tempoLegendized', { tempoId });
        return { success: true };
    }

    calculateTempoValue(tempoId) {
        const tempo = this.tempos.get(tempoId);
        if (!tempo) return 0;
        return tempo.level * 100 + tempo.speed * 2 + tempo.pulses.length * 30;
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
        if (this.stats.totalTempos < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTempos += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tempos: Array.from(this.tempos.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tempos) this.tempos = new Map(data.tempos);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tempoCount: this.tempos.size }; }
}
