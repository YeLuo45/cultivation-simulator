/**
 * CultivationNose.js - 道鼻系统
 * V523 Iteration 5/20 Round 21 - Cultivation Nose
 */

export class CultivationNose {
    constructor(config = {}) {
        this.config = { maxNoses: config.maxNoses || 50, baseAcuity: config.baseAcuity || 20, ...config };
        this.noses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalNoses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getNose', (ctx) => this.getNose(ctx.noseId));
        this.registerTool('openNose', (ctx) => this.openNose(ctx));
    }

    openNose(data) {
        const id = data.noseId || `nose_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const nose = {
            noseId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Nose',
            type: data.type || 'heavenly',
            acuity: data.acuity || this.config.baseAcuity,
            aromas: [],
            level: 1,
            status: 'open',
            createdAt: Date.now()
        };
        this.noses.set(id, nose);
        this.stats.totalNoses++;
        this._triggerHook('noseOpened', { noseId: id });
        return { success: true, nose };
    }

    getNose(id) { return this.noses.get(id) ? { ...this.noses.get(id) } : null; }
    listNoses() { return Array.from(this.noses.values()).map(n => ({ ...n })); }
    listByCultivator(cultivatorId) { return Array.from(this.noses.values()).filter(n => n.cultivatorId === cultivatorId).map(n => ({ ...n })); }
    listAwakened() { return Array.from(this.noses.values()).filter(n => n.status === 'awakened').map(n => ({ ...n })); }

    addAroma(noseId, aroma) {
        const nose = this.noses.get(noseId);
        if (!nose) return { success: false, error: 'NOSE_NOT_FOUND' };
        nose.aromas.push(aroma);
        this._triggerHook('aromaAdded', { noseId, aroma });
        return { success: true, nose: { ...nose } };
    }

    increaseAcuity(noseId, amount = 5) {
        const nose = this.noses.get(noseId);
        if (!nose) return { success: false, error: 'NOSE_NOT_FOUND' };
        nose.acuity += amount;
        this._triggerHook('acuityIncreased', { noseId, newAcuity: nose.acuity });
        return { success: true };
    }

    levelUpNose(noseId) {
        const nose = this.noses.get(noseId);
        if (!nose) return { success: false, error: 'NOSE_NOT_FOUND' };
        nose.level++;
        this._triggerHook('noseLeveledUp', { noseId, newLevel: nose.level });
        return { success: true };
    }

    awakenNose(noseId) {
        const nose = this.noses.get(noseId);
        if (!nose) return { success: false, error: 'NOSE_NOT_FOUND' };
        nose.status = 'awakened';
        this._triggerHook('noseAwakened', { noseId });
        return { success: true };
    }

    calculateNosePower(noseId) {
        const nose = this.noses.get(noseId);
        if (!nose) return 0;
        return nose.level * 50 + nose.acuity + nose.aromas.length * 15;
    }

    listByType(type) { return Array.from(this.noses.values()).filter(n => n.type === type).map(n => ({ ...n })); }

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
        if (this.stats.totalNoses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxNoses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { noses: Array.from(this.noses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.noses) this.noses = new Map(data.noses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, noseCount: this.noses.size }; }
}
