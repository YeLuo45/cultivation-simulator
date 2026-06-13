/**
 * CultivationCryomancer.js - 修真冰霜师
 * V629 Iteration 12/30 Round 26
 */
export class CultivationCryomancer {
    constructor(config = {}) {
        this.config = { maxCryomancers: config.maxCryomancers || 50, baseCold: config.baseCold || 20, ...config };
        this.cryomancers = new Map();
        this.blizzardLogs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecruited: 0, totalBlizzards: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCryomancer', (ctx) => this.getCryomancer(ctx.cryomancerId));
        this.registerTool('recruitCryomancer', (ctx) => this.recruitCryomancer(ctx));
    }

    recruitCryomancer(data = {}) {
        if (this.cryomancers.size >= this.config.maxCryomancers) {
            return { success: false, error: 'MAX_CRYOMANCERS_REACHED' };
        }
        const id = data.cryomancerId || `cry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const validTypes = ['ice', 'frost', 'snow'];
        const type = validTypes.includes(data.type) ? data.type : 'ice';
        const cryomancer = {
            cryomancerId: id,
            mentorId: data.mentorId || null,
            name: data.name || 'Anonymous Cryomancer',
            type,
            cold: data.cold || this.config.baseCold,
            blizzards: [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.cryomancers.set(id, cryomancer);
        this.stats.totalRecruited++;
        this._triggerHook('cryomancerRecruited', { cryomancerId: id, mentorId: cryomancer.mentorId, type });
        return { success: true, cryomancer };
    }

    getCryomancer(id) { return this.cryomancers.get(id) ? { ...this.cryomancers.get(id), blizzards: [...this.cryomancers.get(id).blizzards] } : null; }

    listCryomancers() { return Array.from(this.cryomancers.values()).map(c => ({ ...c, blizzards: [...c.blizzards] })); }

    listByMentor(mentorId) { return Array.from(this.cryomancers.values()).filter(c => c.mentorId === mentorId).map(c => ({ ...c, blizzards: [...c.blizzards] })); }

    listLegendary() { return Array.from(this.cryomancers.values()).filter(c => c.status === 'legendary').map(c => ({ ...c, blizzards: [...c.blizzards] })); }

    addBlizzard(cryomancerId, blizzard) {
        const cryomancer = this.cryomancers.get(cryomancerId);
        if (!cryomancer) return { success: false, error: 'CRYOMANCER_NOT_FOUND' };
        const blizzardData = {
            blizzardId: blizzard.blizzardId || `blz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            power: blizzard.power || 10,
            radius: blizzard.radius || 5,
            addedAt: Date.now()
        };
        cryomancer.blizzards.push(blizzardData);
        this.stats.totalBlizzards++;
        this._triggerHook('blizzardAdded', { cryomancerId, blizzardId: blizzardData.blizzardId, power: blizzardData.power });
        return { success: true, blizzard: blizzardData };
    }

    deepenCold(cryomancerId, amount = 5) {
        const cryomancer = this.cryomancers.get(cryomancerId);
        if (!cryomancer) return { success: false, error: 'CRYOMANCER_NOT_FOUND' };
        cryomancer.cold += amount;
        this._triggerHook('coldDeepened', { cryomancerId, newCold: cryomancer.cold, amount });
        return { success: true, newCold: cryomancer.cold };
    }

    levelUpCryomancer(cryomancerId) {
        const cryomancer = this.cryomancers.get(cryomancerId);
        if (!cryomancer) return { success: false, error: 'CRYOMANCER_NOT_FOUND' };
        cryomancer.level++;
        if (cryomancer.level >= 10) cryomancer.status = 'veteran';
        this._triggerHook('cryomancerLeveledUp', { cryomancerId, newLevel: cryomancer.level });
        return { success: true, newLevel: cryomancer.level };
    }

    legendCryomancer(cryomancerId) {
        const cryomancer = this.cryomancers.get(cryomancerId);
        if (!cryomancer) return { success: false, error: 'CRYOMANCER_NOT_FOUND' };
        cryomancer.status = 'legendary';
        this._triggerHook('cryomancerLegendized', { cryomancerId, name: cryomancer.name });
        return { success: true, status: cryomancer.status };
    }

    calculateCryomancerValue(cryomancerId) {
        const cryomancer = this.cryomancers.get(cryomancerId);
        if (!cryomancer) return 0;
        return cryomancer.level * 100 + cryomancer.cold * 2 + cryomancer.blizzards.length * 30;
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
        if (this.stats.totalRecruited < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseCold += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cryomancers: Array.from(this.cryomancers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cryomancers) this.cryomancers = new Map(data.cryomancers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cryomancerCount: this.cryomancers.size, legendaryCount: this.listLegendary().length }; }
}
