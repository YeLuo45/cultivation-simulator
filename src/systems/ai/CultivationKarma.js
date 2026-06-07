/**
 * CultivationKarma.js - 修真因果
 * V739 Iteration 2/30 Round 30
 *
 * 融合6大设计系统:
 * - generic-agent: 因果自循环
 * - chatdev: 因果角色协调
 * - nanobot: 因果mesh
 * - claude-code: 因果分析工具
 * - thunderbolt: 因果持久化
 * - ruflo: 因果Hook
 */

export class CultivationKarma {
    constructor(config = {}) {
        this.config = { maxKarmas: config.maxKarmas || 20, baseBalance: config.baseBalance || 20, ...config };
        this.karmas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalKarmas: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getKarma', (ctx) => this.getKarma(ctx.karmaId));
        this.registerTool('recruitKarma', (ctx) => this.recruitKarma(ctx));
    }

    recruitKarma(data) {
        const id = data.id || `krm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const karma = {
            karmaId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'neutral',
            balance: data.balance || this.config.baseBalance,
            actions: data.actions || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.karmas.set(id, karma);
        this.stats.totalKarmas++;
        this._triggerHook('karmaRecruited', { karmaId: id });
        return { success: true, karma };
    }

    getKarma(id) { return this.karmas.get(id) ? { ...this.karmas.get(id) } : null; }
    listKarmas() { return Array.from(this.karmas.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.karmas.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.karmas.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addAction(karmaId, action) {
        const karma = this.karmas.get(karmaId);
        if (!karma) return { success: false, error: 'KARMA_NOT_FOUND' };
        karma.actions.push(action);
        this._triggerHook('actionAdded', { karmaId, action });
        return { success: true };
    }

    raiseBalance(karmaId, amount = 5) {
        const karma = this.karmas.get(karmaId);
        if (!karma) return { success: false, error: 'KARMA_NOT_FOUND' };
        karma.balance += amount;
        this._triggerHook('balanceRaised', { karmaId, newBalance: karma.balance });
        return { success: true };
    }

    levelUpKarma(karmaId) {
        const karma = this.karmas.get(karmaId);
        if (!karma) return { success: false, error: 'KARMA_NOT_FOUND' };
        karma.level++;
        this._triggerHook('karmaLeveledUp', { karmaId, newLevel: karma.level });
        return { success: true };
    }

    legendKarma(karmaId) {
        const karma = this.karmas.get(karmaId);
        if (!karma) return { success: false, error: 'KARMA_NOT_FOUND' };
        karma.status = 'legendary';
        this._triggerHook('karmaLegendized', { karmaId });
        return { success: true };
    }

    calculateKarmaValue(karmaId) {
        const karma = this.karmas.get(karmaId);
        if (!karma) return 0;
        return karma.level * 100 + karma.balance * 2 + karma.actions.length * 30;
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
        if (this.stats.totalKarmas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxKarmas += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { karmas: Array.from(this.karmas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.karmas) this.karmas = new Map(data.karmas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, karmaCount: this.karmas.size }; }
}
