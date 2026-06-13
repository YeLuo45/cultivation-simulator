/**
 * InnerBalance.js - 内在平衡
 * V438 Iteration 15/15 FINAL Round 15
 */
export class InnerBalance {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, baseYin: config.baseYin || 50, baseYang: config.baseYang || 50, ...config };
        this.balances = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBalances: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBalance', (ctx) => this.getBalance(ctx.balanceId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.balanceId));
    }

    createBalance(data) {
        const id = data.id || `ib_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const balance = { balanceId: id, name: data.name || 'Inner Balance', cultivatorId: data.cultivatorId, yin: data.yin || this.config.baseYin, yang: data.yang || this.config.baseYang, fiveElements: data.fiveElements || 0, meridians: data.meridians || 12, status: 'balanced', createdAt: Date.now(), lastRefresh: Date.now() };
        this.balances.set(id, balance);
        this.metrics.set(id, { yin: balance.yin, yang: balance.yang, harmony: 100, imbalance: 0, alignment: 0 });
        this.stats.totalBalances++;
        this._triggerHook('balanceCreated', { balanceId: id });
        return { success: true, balance };
    }

    getBalance(id) { return this.balances.get(id) ? { ...this.balances.get(id) } : null; }
    listBalances() { return Array.from(this.balances.values()).map(b => ({ ...b })); }
    listByStatus(status) { return Array.from(this.balances.values()).filter(b => b.status === status).map(b => ({ ...b })); }

    setMetrics(balanceId, metrics) {
        const current = this.metrics.get(balanceId);
        if (!current) return { success: false, error: 'BALANCE_NOT_FOUND' };
        this.metrics.set(balanceId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(balanceId) { return this.metrics.get(balanceId) ? { ...this.metrics.get(balanceId) } : null; }

    refreshBalance(balanceId) {
        const balance = this.balances.get(balanceId);
        if (!balance) return { success: false, error: 'BALANCE_NOT_FOUND' };
        const m = this.metrics.get(balanceId);
        const harmony = Math.max(0, 100 - Math.abs(balance.yin - balance.yang));
        const imbalance = Math.abs(balance.yin - balance.yang);
        const alignment = balance.fiveElements * 5 + balance.meridians * 2;
        this.metrics.set(balanceId, { ...m, harmony, imbalance, alignment, updatedAt: Date.now() });
        balance.status = harmony >= 80 ? 'balanced' : (harmony >= 50 ? 'slight-imbalance' : 'imbalanced');
        balance.lastRefresh = Date.now();
        this._triggerHook('balanceRefreshed', { balanceId });
        return { success: true };
    }

    calculateHarmonyScore(balanceId) {
        const balance = this.balances.get(balanceId);
        if (!balance) return 0;
        return Math.max(0, 100 - Math.abs(balance.yin - balance.yang));
    }

    adjustYinYang(balanceId, yinDelta, yangDelta) {
        const balance = this.balances.get(balanceId);
        if (!balance) return { success: false, error: 'BALANCE_NOT_FOUND' };
        balance.yin = Math.max(0, Math.min(100, balance.yin + yinDelta));
        balance.yang = Math.max(0, Math.min(100, balance.yang + yangDelta));
        this._triggerHook('yinYangAdjusted', { balanceId });
        return { success: true };
    }

    deleteBalance(balanceId) {
        if (!this.balances.has(balanceId)) return { success: false, error: 'BALANCE_NOT_FOUND' };
        this.balances.delete(balanceId);
        this.metrics.delete(balanceId);
        this._triggerHook('balanceDeleted', { balanceId });
        return { success: true };
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
        if (this.stats.totalBalances < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { balances: Array.from(this.balances.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.balances) this.balances = new Map(data.balances);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, balanceCount: this.balances.size }; }
}