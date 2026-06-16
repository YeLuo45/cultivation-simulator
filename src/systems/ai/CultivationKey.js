/**
 * CultivationKey.js - 修真钥匙系统
 * V755 Iteration 18/30 Round 30 - Cultivation Key
 */

export class CultivationKey {
    constructor(config = {}) {
        this.config = { maxKeys: config.maxKeys || 30, baseMastery: config.baseMastery || 20, ...config };
        this.keys = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalKeys: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getKey', (ctx) => this.getKey(ctx.keyId));
        this.registerTool('recruitKey', (ctx) => this.recruitKey(ctx));
    }

    recruitKey(data) {
        const id = data.keyId || `key_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const key = {
            keyId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Key',
            type: data.type || 'silver',
            mastery: data.mastery || this.config.baseMastery,
            notches: data.notches || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.keys.set(id, key);
        this.stats.totalKeys++;
        this._triggerHook('keyRecruited', { keyId: id });
        return { success: true, key };
    }

    getKey(id) { return this.keys.get(id) ? { ...this.keys.get(id) } : null; }
    listKeys() { return Array.from(this.keys.values()).map(k => ({ ...k })); }
    listByMaster(masterId) { return Array.from(this.keys.values()).filter(k => k.masterId === masterId).map(k => ({ ...k })); }
    listLegendary() { return Array.from(this.keys.values()).filter(k => k.status === 'legendary').map(k => ({ ...k })); }

    addNotch(keyId, notch) {
        const key = this.keys.get(keyId);
        if (!key) return { success: false, error: 'KEY_NOT_FOUND' };
        key.notches.push(notch);
        this._triggerHook('notchAdded', { keyId, notch });
        return { success: true, key: { ...key } };
    }

    raiseMastery(keyId, amount = 5) {
        const key = this.keys.get(keyId);
        if (!key) return { success: false, error: 'KEY_NOT_FOUND' };
        key.mastery += amount;
        this._triggerHook('masteryRaised', { keyId, newMastery: key.mastery });
        return { success: true };
    }

    levelUpKey(keyId) {
        const key = this.keys.get(keyId);
        if (!key) return { success: false, error: 'KEY_NOT_FOUND' };
        key.level++;
        this._triggerHook('keyLeveledUp', { keyId, newLevel: key.level });
        return { success: true };
    }

    legendKey(keyId) {
        const key = this.keys.get(keyId);
        if (!key) return { success: false, error: 'KEY_NOT_FOUND' };
        key.status = 'legendary';
        this._triggerHook('keyLegendized', { keyId });
        return { success: true };
    }

    calculateKeyValue(keyId) {
        const key = this.keys.get(keyId);
        if (!key) return 0;
        return key.level * 100 + key.mastery * 2 + key.notches.length * 30;
    }

    listByType(type) { return Array.from(this.keys.values()).filter(k => k.type === type).map(k => ({ ...k })); }
    listVeteran() { return Array.from(this.keys.values()).filter(k => k.status === 'veteran').map(k => ({ ...k })); }

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
        if (this.stats.totalKeys < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxKeys += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { keys: Array.from(this.keys.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.keys) this.keys = new Map(data.keys);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, keyCount: this.keys.size }; }
}
