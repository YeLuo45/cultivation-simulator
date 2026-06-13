/**
 * CultivationEmpress.js - 修真皇后系统
 * V731 Iteration 24/30 Round 29
 */
export class CultivationEmpress {
    constructor(config = {}) {
        this.config = { maxEmpresses: config.maxEmpresses || 5, baseDignity: config.baseDignity || 20, ...config };
        this.empresses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEmpresses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEmpress', (ctx) => this.getEmpress(ctx.empressId));
        this.registerTool('recruitEmpress', (ctx) => this.recruitEmpress(ctx));
    }

    recruitEmpress(data) {
        const id = data.empressId || `empress_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const empress = {
            empressId: id,
            empireId: data.empireId,
            name: data.name,
            type: data.type || 'divine',
            dignity: data.dignity || this.config.baseDignity,
            gifts: data.gifts || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.empresses.set(id, empress);
        this.stats.totalEmpresses++;
        this._triggerHook('empressRecruited', { empressId: id });
        return { success: true, empress };
    }

    getEmpress(id) { return this.empresses.get(id) ? { ...this.empresses.get(id) } : null; }
    listEmpresses() { return Array.from(this.empresses.values()).map(e => ({ ...e })); }
    listByEmpire(empireId) { return Array.from(this.empresses.values()).filter(e => e.empireId === empireId).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.empresses.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addGift(empressId, gift) {
        const empress = this.empresses.get(empressId);
        if (!empress) return { success: false, error: 'EMPRESS_NOT_FOUND' };
        empress.gifts.push(gift);
        this._triggerHook('giftAdded', { empressId, gift });
        return { success: true };
    }

    raiseDignity(empressId, amount = 5) {
        const empress = this.empresses.get(empressId);
        if (!empress) return { success: false, error: 'EMPRESS_NOT_FOUND' };
        empress.dignity += amount;
        this._triggerHook('dignityRaised', { empressId, newDignity: empress.dignity });
        return { success: true };
    }

    levelUpEmpress(empressId) {
        const empress = this.empresses.get(empressId);
        if (!empress) return { success: false, error: 'EMPRESS_NOT_FOUND' };
        empress.level++;
        this._triggerHook('empressLeveledUp', { empressId, newLevel: empress.level });
        return { success: true };
    }

    legendEmpress(empressId) {
        const empress = this.empresses.get(empressId);
        if (!empress) return { success: false, error: 'EMPRESS_NOT_FOUND' };
        empress.status = 'legendary';
        this._triggerHook('empressLegendized', { empressId });
        return { success: true };
    }

    calculateEmpressValue(empressId) {
        const empress = this.empresses.get(empressId);
        if (!empress) return 0;
        return empress.level * 100 + empress.dignity * 2 + empress.gifts.length * 30;
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
        if (this.stats.totalEmpresses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEmpresses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { empresses: Array.from(this.empresses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.empresses) this.empresses = new Map(data.empresses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, empressCount: this.empresses.size }; }
}
