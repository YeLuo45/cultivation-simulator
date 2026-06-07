/**
 * CultivationWhisper.js - 修真低语系统
 * V773 Iteration 6/30 Round 31
 */
export class CultivationWhisper {
    constructor(config = {}) {
        this.config = { maxWhispers: config.maxWhispers || 20, baseSoftness: config.baseSoftness || 20, ...config };
        this.whispers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWhispers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWhisper', (ctx) => this.getWhisper(ctx.whisperId));
        this.registerTool('recruitWhisper', (ctx) => this.recruitWhisper(ctx));
    }

    recruitWhisper(data) {
        const id = data.whisperId || `whs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const whisper = {
            whisperId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Whisper',
            type: data.type || 'gentle',
            softness: data.softness || this.config.baseSoftness,
            secrets: data.secrets || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.whispers.set(id, whisper);
        this.stats.totalWhispers++;
        this._triggerHook('whisperRecruited', { whisperId: id });
        return { success: true, whisper };
    }

    getWhisper(id) { return this.whispers.get(id) ? { ...this.whispers.get(id) } : null; }
    listWhispers() { return Array.from(this.whispers.values()).map(w => ({ ...w })); }
    listByMaster(masterId) { return Array.from(this.whispers.values()).filter(w => w.masterId === masterId).map(w => ({ ...w })); }
    listLegendary() { return Array.from(this.whispers.values()).filter(w => w.status === 'legendary').map(w => ({ ...w })); }

    addSecret(whisperId, secret) {
        const whisper = this.whispers.get(whisperId);
        if (!whisper) return { success: false, error: 'WHISPER_NOT_FOUND' };
        whisper.secrets.push(secret);
        this._triggerHook('secretAdded', { whisperId, secret });
        return { success: true };
    }

    raiseSoftness(whisperId, amount = 5) {
        const whisper = this.whispers.get(whisperId);
        if (!whisper) return { success: false, error: 'WHISPER_NOT_FOUND' };
        whisper.softness += amount;
        this._triggerHook('softnessRaised', { whisperId, newSoftness: whisper.softness });
        return { success: true };
    }

    levelUpWhisper(whisperId) {
        const whisper = this.whispers.get(whisperId);
        if (!whisper) return { success: false, error: 'WHISPER_NOT_FOUND' };
        whisper.level++;
        this._triggerHook('whisperLeveledUp', { whisperId, newLevel: whisper.level });
        return { success: true };
    }

    legendWhisper(whisperId) {
        const whisper = this.whispers.get(whisperId);
        if (!whisper) return { success: false, error: 'WHISPER_NOT_FOUND' };
        whisper.status = 'legendary';
        this._triggerHook('whisperLegendized', { whisperId });
        return { success: true };
    }

    calculateWhisperValue(whisperId) {
        const whisper = this.whispers.get(whisperId);
        if (!whisper) return 0;
        return whisper.level * 100 + whisper.softness * 2 + whisper.secrets.length * 30;
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
        if (this.stats.totalWhispers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWhispers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { whispers: Array.from(this.whispers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.whispers) this.whispers = new Map(data.whispers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, whisperCount: this.whispers.size }; }
}
