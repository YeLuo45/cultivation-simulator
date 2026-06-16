/**
 * SectAlliance.js - 宗门联盟
 * V495 Iteration 12/15 Round 19
 */

export class SectAlliance {
    constructor(config = {}) {
        this.config = { maxAlliances: config.maxAlliances || 50, baseStrength: config.baseStrength || 10, ...config };
        this.alliances = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAlliances: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAlliance', (ctx) => this.getAlliance(ctx.allianceId));
        this.registerTool('formAlliance', (ctx) => this.formAlliance(ctx));
    }

    formAlliance(data) {
        const id = data.id || `alc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const alliance = {
            allianceId: id,
            leader: data.leader,
            ally: data.ally,
            strength: data.strength || this.config.baseStrength,
            bonds: data.bonds || [],
            status: 'forming',
            createdAt: Date.now()
        };
        this.alliances.set(id, alliance);
        this.stats.totalAlliances++;
        this._triggerHook('allianceFormed', { allianceId: id });
        return { success: true, alliance };
    }

    getAlliance(id) { return this.alliances.get(id) ? { ...this.alliances.get(id) } : null; }
    listAlliances() { return Array.from(this.alliances.values()).map(a => ({ ...a })); }
    listByLeader(leader) { return Array.from(this.alliances.values()).filter(a => a.leader === leader).map(a => ({ ...a })); }
    listActive() { return Array.from(this.alliances.values()).filter(a => a.status === 'active').map(a => ({ ...a })); }

    strengthenAlliance(allianceId, amount = 5) {
        const alliance = this.alliances.get(allianceId);
        if (!alliance) return { success: false, error: 'ALLIANCE_NOT_FOUND' };
        alliance.strength += amount;
        if (alliance.status === 'forming') alliance.status = 'active';
        this._triggerHook('allianceStrengthened', { allianceId, newStrength: alliance.strength });
        return { success: true };
    }

    addBond(allianceId, bond) {
        const alliance = this.alliances.get(allianceId);
        if (!alliance) return { success: false, error: 'ALLIANCE_NOT_FOUND' };
        alliance.bonds.push(bond);
        this._triggerHook('bondAdded', { allianceId, bond });
        return { success: true };
    }

    dissolveAlliance(allianceId) {
        const alliance = this.alliances.get(allianceId);
        if (!alliance) return { success: false, error: 'ALLIANCE_NOT_FOUND' };
        alliance.status = 'dissolved';
        this._triggerHook('allianceDissolved', { allianceId });
        return { success: true };
    }

    calculateAllianceValue(allianceId) {
        const alliance = this.alliances.get(allianceId);
        if (!alliance) return 0;
        return alliance.strength * 10 + alliance.bonds.length * 20;
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
        if (this.stats.totalAlliances < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAlliances += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { alliances: Array.from(this.alliances.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.alliances) this.alliances = new Map(data.alliances);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, allianceCount: this.alliances.size }; }
}
