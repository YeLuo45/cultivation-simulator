/**
 * CultivationDuel.js - 修真决斗
 * V545 Iteration 8/20 Round 22
 */
export class CultivationDuel {
    constructor(config = {}) {
        this.config = { maxDuels: config.maxDuels || 50, baseRounds: config.baseRounds || 3, ...config };
        this.duels = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDuels: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDuel', (ctx) => this.getDuel(ctx.duelId));
        this.registerTool('startDuel', (ctx) => this.startDuel(ctx));
    }

    startDuel(data) {
        const id = data.duelId || data.id || `dul_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const duel = {
            duelId: id,
            challengerId: data.challengerId,
            name: data.name || 'Untitled Duel',
            type: data.type || 'point',
            stakes: [],
            rounds: data.rounds !== undefined ? data.rounds : this.config.baseRounds,
            level: 1,
            status: 'pending',
            createdAt: Date.now()
        };
        this.duels.set(id, duel);
        this.stats.totalDuels++;
        this._triggerHook('duelStarted', { duelId: id });
        return { success: true, duel };
    }

    getDuel(duelId) { return this.duels.get(duelId) ? { ...this.duels.get(duelId) } : null; }
    listDuels() { return Array.from(this.duels.values()).map(d => ({ ...d })); }
    listByChallenger(challengerId) { return Array.from(this.duels.values()).filter(d => d.challengerId === challengerId).map(d => ({ ...d })); }
    listActive() { return Array.from(this.duels.values()).filter(d => d.status === 'active' || d.status === 'pending').map(d => ({ ...d })); }

    addStake(duelId, stake) {
        const duel = this.duels.get(duelId);
        if (!duel) return { success: false, error: 'DUEL_NOT_FOUND' };
        const stakeEntry = {
            stakeId: stake.stakeId || `stk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            item: stake.item,
            value: stake.value || 0,
            offeredBy: stake.offeredBy,
            addedAt: Date.now()
        };
        duel.stakes.push(stakeEntry);
        this._triggerHook('stakeAdded', { duelId, stakeId: stakeEntry.stakeId });
        return { success: true, stake: stakeEntry };
    }

    increaseRounds(duelId, amount = 5) {
        const duel = this.duels.get(duelId);
        if (!duel) return { success: false, error: 'DUEL_NOT_FOUND' };
        duel.rounds += amount;
        if (duel.status === 'pending') duel.status = 'active';
        this._triggerHook('roundsIncreased', { duelId, newRounds: duel.rounds });
        return { success: true, newRounds: duel.rounds };
    }

    levelUpDuel(duelId) {
        const duel = this.duels.get(duelId);
        if (!duel) return { success: false, error: 'DUEL_NOT_FOUND' };
        duel.level++;
        this._triggerHook('duelLeveledUp', { duelId, newLevel: duel.level });
        return { success: true, newLevel: duel.level };
    }

    finishDuel(duelId) {
        const duel = this.duels.get(duelId);
        if (!duel) return { success: false, error: 'DUEL_NOT_FOUND' };
        duel.status = 'finished';
        this._triggerHook('duelFinished', { duelId });
        return { success: true };
    }

    calculateDuelPower(duelId) {
        const duel = this.duels.get(duelId);
        if (!duel) return 0;
        return duel.level * 100 + duel.rounds * 2 + duel.stakes.length * 30;
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
        if (this.stats.totalDuels < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDuels += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { duels: Array.from(this.duels.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.duels) this.duels = new Map(data.duels);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, duelCount: this.duels.size }; }
}
