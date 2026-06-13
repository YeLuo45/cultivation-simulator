/**
 * CultivationAge.js - 修真龄系统
 * V580 Iteration 3/20 Round 24
 */
export class CultivationAge {
    constructor(config = {}) {
        this.config = { maxAges: config.maxAges || 50, baseWisdom: config.baseWisdom || 20, ...config };
        this.ages = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAges: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAge', (ctx) => this.getAge(ctx.ageId));
        this.registerTool('openAge', (ctx) => this.openAge(ctx));
    }

    openAge(data) {
        const id = data.ageId || `age_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const age = {
            ageId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'unnamed',
            type: data.type || 'mortal',
            wisdom: data.wisdom !== undefined ? data.wisdom : this.config.baseWisdom,
            milestones: data.milestones || [],
            level: data.level || 1,
            status: data.status || 'young',
            createdAt: Date.now()
        };
        this.ages.set(id, age);
        this.stats.totalAges++;
        this._triggerHook('ageOpened', { ageId: id });
        return { success: true, age };
    }

    getAge(id) { return this.ages.get(id) ? { ...this.ages.get(id) } : null; }
    listAges() { return Array.from(this.ages.values()).map(a => ({ ...a })); }
    listByCultivator(cultivatorId) { return Array.from(this.ages.values()).filter(a => a.cultivatorId === cultivatorId).map(a => ({ ...a })); }
    listAncient() { return Array.from(this.ages.values()).filter(a => a.status === 'ancient').map(a => ({ ...a })); }

    addMilestone(ageId, milestone) {
        const age = this.ages.get(ageId);
        if (!age) return { success: false, error: 'AGE_NOT_FOUND' };
        age.milestones.push(milestone);
        this._triggerHook('milestoneAdded', { ageId, milestone });
        return { success: true };
    }

    increaseWisdom(ageId, amount = 5) {
        const age = this.ages.get(ageId);
        if (!age) return { success: false, error: 'AGE_NOT_FOUND' };
        age.wisdom += amount;
        this._triggerHook('wisdomIncreased', { ageId, newWisdom: age.wisdom });
        return { success: true };
    }

    levelUpAge(ageId) {
        const age = this.ages.get(ageId);
        if (!age) return { success: false, error: 'AGE_NOT_FOUND' };
        age.level++;
        this._triggerHook('ageLeveledUp', { ageId, newLevel: age.level });
        return { success: true };
    }

    ancientAge(ageId) {
        const age = this.ages.get(ageId);
        if (!age) return { success: false, error: 'AGE_NOT_FOUND' };
        age.status = 'ancient';
        this._triggerHook('ageAncientized', { ageId });
        return { success: true };
    }

    calculateAgeValue(ageId) {
        const age = this.ages.get(ageId);
        if (!age) return 0;
        return age.level * 100 + age.wisdom * 2 + age.milestones.length * 30;
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
        if (this.stats.totalAges < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAges += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ages: Array.from(this.ages.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ages) this.ages = new Map(data.ages);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ageCount: this.ages.size }; }
}
