/**
 * SecretRealmExplorer.js - 秘境探险系统
 * V334 Iteration 4/9 Round 6
 */
export class SecretRealmExplorer {
    constructor(config = {}) {
        this.config = { maxRealms: config.maxRealms || 50, baseDifficulty: config.baseDifficulty || 1, ...config };
        this.realms = new Map();
        this.explorations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalExplorations: 0, totalCleared: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const types = [
            { typeId: 'elemental', name: 'Elemental Realm', tier: 1, rewards: ['qi_stone', 'herb'] },
            { typeId: 'demonic', name: 'Demonic Realm', tier: 3, rewards: ['demon_core', 'dark_herb'] },
            { typeId: 'celestial', name: 'Celestial Realm', tier: 5, rewards: ['celestial_artifact', 'immortal_jade'] }
        ];
        for (const t of types) this.config[`type_${t.typeId}`] = t;
    }

    _registerDefaultTools() {
        this.registerTool('getRealm', (ctx) => this.getRealm(ctx.realmId));
        this.registerTool('listRealms', () => Array.from(this.realms.values()).map(r => ({...r})));
    }

    createRealm(data) {
        const id = data.id || `rlm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const realm = {
            realmId: id, name: data.name || 'Mysterious Realm',
            typeId: data.typeId || 'elemental', tier: data.tier || 1, difficulty: data.difficulty || this.config.baseDifficulty,
            cleared: false, maxParticipants: data.maxParticipants || 5, createdAt: Date.now()
        };
        this.realms.set(id, realm);
        this._triggerHook('realmCreated', { realmId: id });
        return { success: true, realm };
    }

    getRealm(id) { return this.realms.get(id) ? { ...this.realms.get(id) } : null; }
    listRealms() { return Array.from(this.realms.values()).map(r => ({ ...r })); }
    listByTier(tier) { return Array.from(this.realms.values()).filter(r => r.tier === tier).map(r => ({ ...r })); }

    startExploration(realmId, explorerId) {
        const realm = this.realms.get(realmId);
        if (!realm) return { success: false, error: 'REALM_NOT_FOUND' };
        const expId = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const exploration = { expId, realmId, explorerId, status: 'in_progress', progress: 0, startedAt: Date.now() };
        this.explorations.set(expId, exploration);
        this.stats.totalExplorations++;
        this._triggerHook('explorationStarted', { realmId, expId });
        return { success: true, exploration };
    }

    advanceExploration(expId, effort = 20) {
        const exp = this.explorations.get(expId);
        if (!exp) return { success: false, error: 'EXPLORATION_NOT_FOUND' };
        if (exp.status !== 'in_progress') return { success: false, error: 'EXPLORATION_INACTIVE' };
        exp.progress += effort;
        if (exp.progress >= 100) return this.completeExploration(expId);
        return { success: true, exploration: { ...exp } };
    }

    completeExploration(expId) {
        const exp = this.explorations.get(expId);
        if (!exp) return { success: false, error: 'EXPLORATION_NOT_FOUND' };
        if (exp.status !== 'in_progress') return { success: false, error: 'EXPLORATION_INACTIVE' };
        const realm = this.realms.get(exp.realmId);
        if (realm) realm.cleared = true;
        exp.status = 'cleared';
        this.stats.totalCleared++;
        this._triggerHook('explorationCleared', { expId, realmId: exp.realmId });
        return { success: true, exploration: { ...exp } };
    }

    failExploration(expId, reason) {
        const exp = this.explorations.get(expId);
        if (!exp) return { success: false, error: 'EXPLORATION_NOT_FOUND' };
        exp.status = 'failed';
        exp.failureReason = reason || 'unknown';
        this._triggerHook('explorationFailed', { expId });
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
        if (this.stats.totalCleared < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRealms += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { realms: Array.from(this.realms.entries()), explorations: Array.from(this.explorations.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.realms) this.realms = new Map(data.realms);
        if (data.explorations) this.explorations = new Map(data.explorations);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, realmCount: this.realms.size }; }
}