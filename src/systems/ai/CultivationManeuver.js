/**
 * CultivationManeuver.js - 修真身法
 * V696 Iteration 19/30 Round 28 - Cultivation Maneuver
 */
export class CultivationManeuver {
    constructor(config = {}) {
        this.config = { maxManeuvers: config.maxManeuvers || 30, baseAgility: config.baseAgility || 20, ...config };
        this.maneuvers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalManeuvers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getManeuver', (ctx) => this.getManeuver(ctx.maneuverId));
        this.registerTool('recruitManeuver', (ctx) => this.recruitManeuver(ctx));
    }

    recruitManeuver(data) {
        const id = data.id || `mnv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const maneuver = {
            maneuverId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-maneuver',
            type: data.type || 'evade',
            agility: data.agility || this.config.baseAgility,
            dodges: data.dodges || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.maneuvers.set(id, maneuver);
        this.stats.totalManeuvers++;
        this._triggerHook('maneuverRecruited', { maneuverId: id });
        return { success: true, maneuver };
    }

    getManeuver(id) { return this.maneuvers.get(id) ? { ...this.maneuvers.get(id) } : null; }
    listManeuvers() { return Array.from(this.maneuvers.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.maneuvers.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.maneuvers.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addDodge(maneuverId, dodge) {
        const maneuver = this.maneuvers.get(maneuverId);
        if (!maneuver) return { success: false, error: 'MANEUVER_NOT_FOUND' };
        maneuver.dodges.push(dodge);
        this._triggerHook('dodgeAdded', { maneuverId, dodge });
        return { success: true };
    }

    raiseAgility(maneuverId, amount = 5) {
        const maneuver = this.maneuvers.get(maneuverId);
        if (!maneuver) return { success: false, error: 'MANEUVER_NOT_FOUND' };
        maneuver.agility += amount;
        this._triggerHook('agilityRaised', { maneuverId, newAgility: maneuver.agility });
        return { success: true };
    }

    levelUpManeuver(maneuverId) {
        const maneuver = this.maneuvers.get(maneuverId);
        if (!maneuver) return { success: false, error: 'MANEUVER_NOT_FOUND' };
        maneuver.level++;
        if (maneuver.level >= 5) maneuver.status = 'veteran';
        this._triggerHook('maneuverLeveledUp', { maneuverId, newLevel: maneuver.level });
        return { success: true };
    }

    legendManeuver(maneuverId) {
        const maneuver = this.maneuvers.get(maneuverId);
        if (!maneuver) return { success: false, error: 'MANEUVER_NOT_FOUND' };
        maneuver.status = 'legendary';
        this._triggerHook('maneuverLegendized', { maneuverId });
        return { success: true };
    }

    calculateManeuverValue(maneuverId) {
        const maneuver = this.maneuvers.get(maneuverId);
        if (!maneuver) return 0;
        return maneuver.level * 100 + maneuver.agility * 2 + maneuver.dodges.length * 30;
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
        if (this.stats.totalManeuvers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxManeuvers += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { maneuvers: Array.from(this.maneuvers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.maneuvers) this.maneuvers = new Map(data.maneuvers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, maneuverCount: this.maneuvers.size }; }
}
