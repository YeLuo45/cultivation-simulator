/**
 * CultivationChampion.js - 修真冠军
 * V660 Iteration 13/30 Round 27
 */
export class CultivationChampion {
    constructor(config = {}) {
        this.config = { maxChampions: config.maxChampions || 20, baseGlory: config.baseGlory || 20, ...config };
        this.champions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalChampions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getChampion', (ctx) => this.getChampion(ctx.championId));
        this.registerTool('recruitChampion', (ctx) => this.recruitChampion(ctx));
    }

    recruitChampion(data) {
        const id = data.championId || `chp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const champion = {
            championId: id,
            masterId: data.masterId,
            name: data.name || 'Anonymous Champion',
            type: data.type || 'arena',
            glory: data.glory || this.config.baseGlory,
            trophies: data.trophies || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.champions.set(id, champion);
        this.stats.totalChampions++;
        this._triggerHook('championRecruited', { championId: id });
        return { success: true, champion };
    }

    getChampion(id) { return this.champions.get(id) ? { ...this.champions.get(id) } : null; }
    listChampions() { return Array.from(this.champions.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.champions.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.champions.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addTrophy(championId, trophy) {
        const champion = this.champions.get(championId);
        if (!champion) return { success: false, error: 'CHAMPION_NOT_FOUND' };
        champion.trophies.push(trophy);
        this._triggerHook('trophyAdded', { championId, trophy });
        return { success: true };
    }

    gainGlory(championId, amount = 5) {
        const champion = this.champions.get(championId);
        if (!champion) return { success: false, error: 'CHAMPION_NOT_FOUND' };
        champion.glory += amount;
        this._triggerHook('gloryGained', { championId, newGlory: champion.glory });
        return { success: true };
    }

    levelUpChampion(championId) {
        const champion = this.champions.get(championId);
        if (!champion) return { success: false, error: 'CHAMPION_NOT_FOUND' };
        champion.level++;
        this._triggerHook('championLeveledUp', { championId, newLevel: champion.level });
        return { success: true };
    }

    legendChampion(championId) {
        const champion = this.champions.get(championId);
        if (!champion) return { success: false, error: 'CHAMPION_NOT_FOUND' };
        champion.status = 'legendary';
        this._triggerHook('championLegendized', { championId });
        return { success: true };
    }

    calculateChampionValue(championId) {
        const champion = this.champions.get(championId);
        if (!champion) return 0;
        return champion.level * 100 + champion.glory * 2 + champion.trophies.length * 30;
    }

    listVeterans() { return Array.from(this.champions.values()).filter(c => c.status === 'veteran').map(c => ({ ...c })); }

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
        if (this.stats.totalChampions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxChampions += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { champions: Array.from(this.champions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.champions) this.champions = new Map(data.champions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, championCount: this.champions.size }; }
}
