/**
 * CultivationWorld.js - 修真世界
 * V557 Iteration 20/20 FINAL Round 22
 */
export class CultivationWorld {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxRealms: config.maxRealms || 100, baseStability: config.baseStability || 50, ...config };
        this.realms = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRealms: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRealm', (ctx) => this.getRealm(ctx.realmId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.realmId));
    }

    openRealm(data) {
        const id = data.id || `cw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const realm = { realmId: id, name: data.name || 'Unnamed Realm', cultivator: data.cultivator || 'unknown', tier: data.tier || 'mortal', power: data.power || 100, realms: data.realms || 1, level: data.level || 1, status: 'open', createdAt: Date.now(), lastRefresh: Date.now() };
        this.realms.set(id, realm);
        this.metrics.set(id, { prosperity: 50, peace: 60, cultivation: 75 });
        this.stats.totalRealms++;
        this._triggerHook('realmOpened', { realmId: id });
        return { success: true, realm };
    }

    getRealm(id) { return this.realms.get(id) ? { ...this.realms.get(id) } : null; }
    listRealms() { return Array.from(this.realms.values()).map(r => ({ ...r })); }
    listByCultivator(cultivator) { return Array.from(this.realms.values()).filter(r => r.cultivator === cultivator).map(r => ({ ...r })); }
    listByTier(tier) { return Array.from(this.realms.values()).filter(r => r.tier === tier).map(r => ({ ...r })); }
    listByPower(min) { return Array.from(this.realms.values()).filter(r => r.power >= min).map(r => ({ ...r })); }
    listTop(n = 10) { return [...this.listRealms()].sort((a, b) => b.power - a.power).slice(0, n); }

    setMetrics(realmId, metrics) {
        const current = this.metrics.get(realmId);
        if (!current) return { success: false, error: 'REALM_NOT_FOUND' };
        this.metrics.set(realmId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(realmId) { return this.metrics.get(realmId) ? { ...this.metrics.get(realmId) } : null; }

    refreshRealm(realmId) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.lastRefresh = Date.now();
        this._triggerHook('realmRefreshed', { realmId });
        return { success: true };
    }

    gainPower(realmId, amount = 10) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.power += amount;
        this._triggerHook('powerGained', { realmId });
        return { success: true };
    }

    expandRealm(realmId, amount = 5) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.realms += amount;
        this._triggerHook('realmExpanded', { realmId });
        return { success: true };
    }

    promoteRealm(realmId) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.level++;
        this._triggerHook('realmPromoted', { realmId });
        return { success: true };
    }

    changeTier(realmId, newTier) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.tier = newTier;
        this._triggerHook('tierChanged', { realmId });
        return { success: true };
    }

    closeRealm(realmId) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.status = 'closed';
        this._triggerHook('realmClosed', { realmId });
        return { success: true };
    }

    calculateWorldPower(realmId) {
        const realm = this.realms.get(realmId);
        if (!realm) return 0;
        return realm.level * 100 + realm.power * 2 + realm.realms * 10;
    }

    deleteRealm(realmId) {
        if (!this.realms.has(realmId)) return { success: false, error: 'REALM_NOT_FOUND' };
        this.realms.delete(realmId);
        this.metrics.delete(realmId);
        this._triggerHook('realmDeleted', { realmId });
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
        if (this.stats.totalRealms < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { realms: Array.from(this.realms.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.realms) this.realms = new Map(data.realms);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, realmCount: this.realms.size }; }
}