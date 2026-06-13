/**
 * QiCombat.js - 剑气战斗
 * V410 Iteration 2/15 Round 14
 */
export class QiCombat {
    constructor(config = {}) {
        this.config = { maxCombats: config.maxCombats || 200, baseDamage: config.baseDamage || 10, ...config };
        this.combats = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCombats: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCombat', (ctx) => this.getCombat(ctx.combatId));
        this.registerTool('startCombat', (ctx) => this.startCombat(ctx));
    }

    startCombat(data) {
        const id = data.id || `cb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const combat = { combatId: id, attackerId: data.attackerId, defenderId: data.defenderId, damage: 0, rounds: 0, status: 'ongoing', startedAt: Date.now() };
        this.combats.set(id, combat);
        this.stats.totalCombats++;
        this._triggerHook('combatStarted', { combatId: id });
        return { success: true, combat };
    }

    getCombat(id) { return this.combats.get(id) ? { ...this.combats.get(id) } : null; }
    listCombats() { return Array.from(this.combats.values()).map(c => ({ ...c })); }
    listOngoing() { return Array.from(this.combats.values()).filter(c => c.status === 'ongoing').map(c => ({ ...c })); }
    listByAttacker(attackerId) { return Array.from(this.combats.values()).filter(c => c.attackerId === attackerId).map(c => ({ ...c })); }
    listByDefender(defenderId) { return Array.from(this.combats.values()).filter(c => c.defenderId === defenderId).map(c => ({ ...c })); }

    attack(combatId, damage) {
        const combat = this.combats.get(combatId);
        if (!combat) return { success: false, error: 'COMBAT_NOT_FOUND' };
        if (combat.status !== 'ongoing') return { success: false, error: 'COMBAT_OVER' };
        combat.damage += damage;
        combat.rounds++;
        this._triggerHook('attackExecuted', { combatId, damage });
        return { success: true };
    }

    defend(combatId) {
        const combat = this.combats.get(combatId);
        if (!combat) return { success: false, error: 'COMBAT_NOT_FOUND' };
        combat.rounds++;
        this._triggerHook('defenseExecuted', { combatId });
        return { success: true };
    }

    endCombat(combatId, winner) {
        const combat = this.combats.get(combatId);
        if (!combat) return { success: false, error: 'COMBAT_NOT_FOUND' };
        combat.status = 'ended';
        combat.winner = winner;
        this._triggerHook('combatEnded', { combatId, winner });
        return { success: true };
    }

    calculateAverageDamage() {
        const ended = Array.from(this.combats.values()).filter(c => c.damage > 0);
        if (ended.length === 0) return 0;
        return ended.reduce((s, c) => s + c.damage, 0) / ended.length;
    }

    listWinners() { return Array.from(this.combats.values()).filter(c => c.winner).map(c => ({ ...c })); }

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
        if (this.stats.totalCombats < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCombats += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { combats: Array.from(this.combats.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.combats) this.combats = new Map(data.combats);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, combatCount: this.combats.size }; }
}