/**
 * CultivationRealm.js - 修真境界
 * V678 Iteration 18/30 Round 28 - Cultivation Realm
 */
export class CultivationRealm {
    constructor(config = {}) {
        this.config = { maxRealms: config.maxRealms || 30, baseDensity: config.baseDensity || 20, ...config };
        this.realms = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRealms: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRealm', (ctx) => this.getRealm(ctx.realmId));
        this.registerTool('recruitRealm', (ctx) => this.recruitRealm(ctx));
    }

    recruitRealm(data) {
        const id = data.realmId || `rlm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const realm = {
            realmId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Realm',
            type: data.type || 'qi',
            density: data.density || this.config.baseDensity,
            laws: data.laws || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.realms.set(id, realm);
        this.stats.totalRealms++;
        this._triggerHook('realmRecruited', { realmId: id });
        return { success: true, realm };
    }

    getRealm(id) { return this.realms.get(id) ? { ...this.realms.get(id) } : null; }
    listRealms() { return Array.from(this.realms.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.realms.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.realms.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addLaw(realmId, law) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.laws.push(law);
        this._triggerHook('lawAdded', { realmId, law });
        return { success: true };
    }

    raiseDensity(realmId, amount = 5) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.density += amount;
        this._triggerHook('densityRaised', { realmId, newDensity: realm.density });
        return { success: true };
    }

    levelUpRealm(realmId) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.level++;
        this._triggerHook('realmLeveledUp', { realmId, newLevel: realm.level });
        return { success: true };
    }

    legendRealm(realmId) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        realm.status = 'legendary';
        this._triggerHook('realmLegendized', { realmId });
        return { success: true };
    }

    calculateRealmValue(realmId) {
        const realm = this.realms.get(realmId);
        if (!realm) return 0;
        return realm.level * 100 + realm.density * 2 + realm.laws.length * 30;
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
        this.config.maxRealms += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { realms: Array.from(this.realms.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.realms) this.realms = new Map(data.realms);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, realmCount: this.realms.size }; }
}
