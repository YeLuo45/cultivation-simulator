/**
 * SoulMaturity.js - 灵魂成熟度
 * V374 Iteration 8/9 Round 10
 */
export class SoulMaturity {
    constructor(config = {}) {
        this.config = { maxStage: config.maxStage || 10, baseGrowth: config.baseGrowth || 1, ...config };
        this.souls = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGrowths: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSoul', (ctx) => this.getSoul(ctx.soulId));
        this.registerTool('registerSoul', (ctx) => this.registerSoul(ctx));
    }

    registerSoul(data) {
        const id = data.id || `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const soul = { soulId: id, name: data.name || 'Soul', maturity: 0, stage: 1, experiences: 0, createdAt: Date.now() };
        this.souls.set(id, soul);
        this._triggerHook('soulRegistered', { soulId: id });
        return { success: true, soul };
    }

    getSoul(id) { return this.souls.get(id) ? { ...this.souls.get(id) } : null; }
    listSouls() { return Array.from(this.souls.values()).map(s => ({ ...s })); }
    listByStage(stage) { return Array.from(this.souls.values()).filter(s => s.stage === stage).map(s => ({ ...s })); }
    listByMaturity(min) { return Array.from(this.souls.values()).filter(s => s.maturity >= min).map(s => ({ ...s })); }

    growMaturity(soulId, amount = this.config.baseGrowth) {
        const soul = this.souls.get(soulId);
        if (!soul) return { success: false, error: 'SOUL_NOT_FOUND' };
        soul.maturity += amount;
        soul.experiences++;
        const newStage = this._calculateStage(soul.maturity);
        const leveled = newStage > soul.stage;
        soul.stage = newStage;
        this.stats.totalGrowths++;
        this._triggerHook('maturityGrew', { soulId, newMaturity: soul.maturity });
        if (leveled) this._triggerHook('stageUp', { soulId, newStage });
        return { success: true, soul: { ...soul } };
    }

    _calculateStage(maturity) {
        return Math.min(this.config.maxStage, Math.floor(maturity / 100) + 1);
    }

    addExperience(soulId, count) {
        const soul = this.souls.get(soulId);
        if (!soul) return { success: false, error: 'SOUL_NOT_FOUND' };
        soul.experiences += count;
        this._triggerHook('experienceAdded', { soulId, count });
        return { success: true };
    }

    calculateTotalMaturity() { return Array.from(this.souls.values()).reduce((s, x) => s + x.maturity, 0); }
    calculateAverageMaturity() {
        if (this.souls.size === 0) return 0;
        return this.calculateTotalMaturity() / this.souls.size;
    }

    findMatureSouls(threshold) { return this.listByMaturity(threshold); }

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
        if (this.stats.totalGrowths < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxStage += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { souls: Array.from(this.souls.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.souls) this.souls = new Map(data.souls);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, soulCount: this.souls.size }; }
}