/**
 * CultivationHammerman.js - 修真锤手
 * V622 Iteration 5/30 Round 26
 */
export class CultivationHammerman {
    constructor(config = {}) {
        this.config = { maxHammermen: config.maxHammermen || 50, baseImpact: config.baseImpact || 20, ...config };
        this.hammermen = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHammermen: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHammerman', (ctx) => this.getHammerman(ctx.hammermanId));
        this.registerTool('recruitHammerman', (ctx) => this.recruitHammerman(ctx));
    }

    recruitHammerman(data) {
        const id = data.hammermanId || `hmm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const hammerman = {
            hammermanId: id,
            trainerId: data.trainerId,
            name: data.name || 'Anonymous Hammerman',
            type: data.type || 'war',
            impact: data.impact || this.config.baseImpact,
            hammers: data.hammers || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.hammermen.set(id, hammerman);
        this.stats.totalHammermen++;
        this._triggerHook('hammermanRecruited', { hammermanId: id });
        return { success: true, hammerman };
    }

    getHammerman(id) { return this.hammermen.get(id) ? { ...this.hammermen.get(id) } : null; }
    listHammermen() { return Array.from(this.hammermen.values()).map(h => ({ ...h })); }
    listByTrainer(trainerId) { return Array.from(this.hammermen.values()).filter(h => h.trainerId === trainerId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.hammermen.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addHammer(hammermanId, hammer) {
        const hammerman = this.hammermen.get(hammermanId);
        if (!hammerman) return { success: false, error: 'HAMMERMAN_NOT_FOUND' };
        hammerman.hammers.push(hammer);
        this._triggerHook('hammerAdded', { hammermanId, hammer });
        return { success: true };
    }

    raiseImpact(hammermanId, amount = 5) {
        const hammerman = this.hammermen.get(hammermanId);
        if (!hammerman) return { success: false, error: 'HAMMERMAN_NOT_FOUND' };
        hammerman.impact += amount;
        this._triggerHook('impactRaised', { hammermanId, newImpact: hammerman.impact });
        return { success: true };
    }

    levelUpHammerman(hammermanId) {
        const hammerman = this.hammermen.get(hammermanId);
        if (!hammerman) return { success: false, error: 'HAMMERMAN_NOT_FOUND' };
        hammerman.level++;
        if (hammerman.level >= 5 && hammerman.status === 'novice') {
            hammerman.status = 'veteran';
        }
        this._triggerHook('hammermanLeveledUp', { hammermanId, newLevel: hammerman.level });
        return { success: true };
    }

    legendHammerman(hammermanId) {
        const hammerman = this.hammermen.get(hammermanId);
        if (!hammerman) return { success: false, error: 'HAMMERMAN_NOT_FOUND' };
        hammerman.status = 'legendary';
        this._triggerHook('hammermanLegendized', { hammermanId });
        return { success: true };
    }

    calculateHammermanValue(hammermanId) {
        const hammerman = this.hammermen.get(hammermanId);
        if (!hammerman) return 0;
        return hammerman.level * 100 + hammerman.impact * 2 + hammerman.hammers.length * 30;
    }

    listVeterans() { return Array.from(this.hammermen.values()).filter(h => h.status === 'veteran').map(h => ({ ...h })); }

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
        if (this.stats.totalHammermen < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHammermen += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { hammermen: Array.from(this.hammermen.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.hammermen) this.hammermen = new Map(data.hammermen);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, hammermanCount: this.hammermen.size }; }
}
