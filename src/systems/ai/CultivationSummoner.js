/**
 * CultivationSummoner.js - 修真召唤师系统
 * V604 Iteration 7/20 Round 25
 */
export class CultivationSummoner {
    constructor(config = {}) {
        this.config = { maxSummoners: config.maxSummoners || 50, baseResonance: config.baseResonance || 20, ...config };
        this.summoners = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSummoners: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSummoner', (ctx) => this.getSummoner(ctx.summonerId));
        this.registerTool('recruitSummoner', (ctx) => this.recruitSummoner(ctx));
    }

    recruitSummoner(data) {
        const id = data.summonerId || `sum_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const summoner = {
            summonerId: id,
            mentorId: data.mentorId,
            name: data.name || 'Unnamed Summoner',
            type: data.type || 'beast',
            resonance: data.resonance || this.config.baseResonance,
            summons: data.summons || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.summoners.set(id, summoner);
        this.stats.totalSummoners++;
        this._triggerHook('summonerRecruited', { summonerId: id });
        return { success: true, summoner };
    }

    getSummoner(id) { return this.summoners.get(id) ? { ...this.summoners.get(id) } : null; }
    listSummoners() { return Array.from(this.summoners.values()).map(s => ({ ...s })); }
    listByMentor(mentorId) { return Array.from(this.summoners.values()).filter(s => s.mentorId === mentorId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.summoners.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addSummon(summonerId, summon) {
        const summoner = this.summoners.get(summonerId);
        if (!summoner) return { success: false, error: 'SUMMONER_NOT_FOUND' };
        summoner.summons.push(summon);
        this._triggerHook('summonAdded', { summonerId, summon });
        return { success: true };
    }

    amplifyResonance(summonerId, amount = 5) {
        const summoner = this.summoners.get(summonerId);
        if (!summoner) return { success: false, error: 'SUMMONER_NOT_FOUND' };
        summoner.resonance += amount;
        this._triggerHook('resonanceAmplified', { summonerId, newResonance: summoner.resonance });
        return { success: true };
    }

    levelUpSummoner(summonerId) {
        const summoner = this.summoners.get(summonerId);
        if (!summoner) return { success: false, error: 'SUMMONER_NOT_FOUND' };
        summoner.level++;
        this._triggerHook('summonerLeveledUp', { summonerId, newLevel: summoner.level });
        return { success: true };
    }

    legendSummoner(summonerId) {
        const summoner = this.summoners.get(summonerId);
        if (!summoner) return { success: false, error: 'SUMMONER_NOT_FOUND' };
        summoner.status = 'legendary';
        this._triggerHook('summonerLegendized', { summonerId });
        return { success: true };
    }

    calculateSummonerValue(summonerId) {
        const summoner = this.summoners.get(summonerId);
        if (!summoner) return 0;
        return summoner.level * 100 + summoner.resonance * 2 + summoner.summons.length * 30;
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
        if (this.stats.totalSummoners < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSummoners += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { summoners: Array.from(this.summoners.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.summoners) this.summoners = new Map(data.summoners);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, summonerCount: this.summoners.size }; }
}
