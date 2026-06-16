/**
 * CultivationFederation.js - 修真联邦
 * V556 Iteration 19/20 Round 22
 */

export class CultivationFederation {
    constructor(config = {}) {
        this.config = { maxFederations: config.maxFederations || 20, basePower: config.basePower || 20, ...config };
        this.federations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFederations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFederation', (ctx) => this.getFederation(ctx.federationId));
        this.registerTool('openFederation', (ctx) => this.openFederation(ctx));
    }

    openFederation(data) {
        const id = data.id || `fed_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const federation = {
            federationId: id,
            founderId: data.founderId,
            name: data.name || '无名联邦',
            type: data.type || 'alliance',
            power: data.power || this.config.basePower,
            members: data.members || [],
            level: data.level || 1,
            status: 'forming',
            createdAt: Date.now()
        };
        this.federations.set(id, federation);
        this.stats.totalFederations++;
        this._triggerHook('federationOpened', { federationId: id });
        return { success: true, federation };
    }

    getFederation(id) { return this.federations.get(id) ? { ...this.federations.get(id) } : null; }
    listFederations() { return Array.from(this.federations.values()).map(f => ({ ...f })); }
    listByFounder(founderId) { return Array.from(this.federations.values()).filter(f => f.founderId === founderId).map(f => ({ ...f })); }
    listStable() { return Array.from(this.federations.values()).filter(f => f.status === 'stable' || f.status === 'eternal').map(f => ({ ...f })); }

    addMember(federationId, member) {
        const federation = this.federations.get(federationId);
        if (!federation) return { success: false, error: 'FEDERATION_NOT_FOUND' };
        federation.members.push(member);
        this._triggerHook('memberAdded', { federationId, member });
        return { success: true };
    }

    increasePower(federationId, amount = 5) {
        const federation = this.federations.get(federationId);
        if (!federation) return { success: false, error: 'FEDERATION_NOT_FOUND' };
        federation.power += amount;
        if (federation.status === 'forming' && federation.members.length > 0) federation.status = 'stable';
        this._triggerHook('powerIncreased', { federationId, newPower: federation.power });
        return { success: true };
    }

    levelUpFederation(federationId) {
        const federation = this.federations.get(federationId);
        if (!federation) return { success: false, error: 'FEDERATION_NOT_FOUND' };
        federation.level++;
        this._triggerHook('federationLeveledUp', { federationId, newLevel: federation.level });
        return { success: true };
    }

    eternizeFederation(federationId) {
        const federation = this.federations.get(federationId);
        if (!federation) return { success: false, error: 'FEDERATION_NOT_FOUND' };
        federation.status = 'eternal';
        this._triggerHook('federationEternalized', { federationId });
        return { success: true };
    }

    calculateFederationPower(federationId) {
        const federation = this.federations.get(federationId);
        if (!federation) return 0;
        return federation.level * 100 + federation.power * 2 + federation.members.length * 30;
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
        if (this.stats.totalFederations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFederations += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { federations: Array.from(this.federations.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.federations) this.federations = new Map(data.federations);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, federationCount: this.federations.size }; }
}
