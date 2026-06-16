/**
 * BloodlineAwakening.js - 血脉觉醒
 * V397 Iteration 4/15 Round 13
 */
export class BloodlineAwakening {
    constructor(config = {}) {
        this.config = { maxBloodlines: config.maxBloodlines || 50, basePurity: config.basePurity || 10, ...config };
        this.bloodlines = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBloodlines: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBloodline', (ctx) => this.getBloodline(ctx.bloodlineId));
        this.registerTool('awakenBloodline', (ctx) => this.awakenBloodline(ctx));
    }

    awakenBloodline(data) {
        const id = data.id || `bl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const bloodline = { bloodlineId: id, cultivatorId: data.cultivatorId, name: data.name || 'Ancient Bloodline', purity: data.purity || this.config.basePurity, level: 1, awakenedAbilities: [], awakenedAt: Date.now() };
        this.bloodlines.set(id, bloodline);
        this.stats.totalBloodlines++;
        this._triggerHook('bloodlineAwakened', { bloodlineId: id });
        return { success: true, bloodline };
    }

    getBloodline(id) { return this.bloodlines.get(id) ? { ...this.bloodlines.get(id) } : null; }
    listBloodlines() { return Array.from(this.bloodlines.values()).map(b => ({ ...b })); }
    listByCultivator(cultivatorId) { return Array.from(this.bloodlines.values()).filter(b => b.cultivatorId === cultivatorId).map(b => ({ ...b })); }
    listByPurity(min) { return Array.from(this.bloodlines.values()).filter(b => b.purity >= min).map(b => ({ ...b })); }

    purify(bloodlineId, amount = 5) {
        const bloodline = this.bloodlines.get(bloodlineId);
        if (!bloodline) return { success: false, error: 'BLOODLINE_NOT_FOUND' };
        bloodline.purity += amount;
        this._triggerHook('bloodlinePurified', { bloodlineId, newPurity: bloodline.purity });
        return { success: true };
    }

    unlockAbility(bloodlineId, ability) {
        const bloodline = this.bloodlines.get(bloodlineId);
        if (!bloodline) return { success: false, error: 'BLOODLINE_NOT_FOUND' };
        if (!bloodline.awakenedAbilities.includes(ability)) bloodline.awakenedAbilities.push(ability);
        this._triggerHook('abilityUnlocked', { bloodlineId, ability });
        return { success: true };
    }

    levelUp(bloodlineId) {
        const bloodline = this.bloodlines.get(bloodlineId);
        if (!bloodline) return { success: false, error: 'BLOODLINE_NOT_FOUND' };
        bloodline.level++;
        bloodline.purity += 10;
        this._triggerHook('bloodlineLeveledUp', { bloodlineId });
        return { success: true };
    }

    calculatePower(bloodlineId) {
        const bloodline = this.bloodlines.get(bloodlineId);
        if (!bloodline) return 0;
        return bloodline.purity * bloodline.level + bloodline.awakenedAbilities.length * 5;
    }

    listPure() { return this.listByPurity(50); }

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
        if (this.stats.totalBloodlines < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBloodlines += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { bloodlines: Array.from(this.bloodlines.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.bloodlines) this.bloodlines = new Map(data.bloodlines);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bloodlineCount: this.bloodlines.size }; }
}