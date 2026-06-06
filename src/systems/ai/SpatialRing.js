/**
 * SpatialRing.js - 储物戒系统
 * V449 Iteration 11/15 Round 16
 */
export class SpatialRing {
    constructor(config = {}) {
        this.config = { maxRings: config.maxRings || 200, baseCapacity: config.baseCapacity || 100, ...config };
        this.rings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRing', (ctx) => this.getRing(ctx.ringId));
        this.registerTool('forgeRing', (ctx) => this.forgeRing(ctx));
    }

    forgeRing(data) {
        const id = data.id || `rng_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ring = {
            ringId: id,
            ownerId: data.ownerId,
            name: data.name || 'Spatial Ring',
            tier: data.tier || 1,
            capacity: data.capacity || this.config.baseCapacity,
            items: [],
            status: 'empty',
            createdAt: Date.now()
        };
        this.rings.set(id, ring);
        this.stats.totalRings++;
        this._triggerHook('ringForged', { ringId: id });
        return { success: true, ring };
    }

    getRing(id) { return this.rings.get(id) ? { ...this.rings.get(id) } : null; }
    listRings() { return Array.from(this.rings.values()).map(r => ({ ...r })); }
    listByOwner(ownerId) { return Array.from(this.rings.values()).filter(r => r.ownerId === ownerId).map(r => ({ ...r })); }
    listByTier(tier) { return Array.from(this.rings.values()).filter(r => r.tier === tier).map(r => ({ ...r })); }

    storeItem(ringId, item) {
        const ring = this.rings.get(ringId);
        if (!ring) return { success: false, error: 'RING_NOT_FOUND' };
        const currentSize = ring.items.length;
        if (currentSize + 1 > ring.capacity) return { success: false, error: 'RING_FULL' };
        ring.items.push(item);
        ring.status = ring.items.length >= ring.capacity ? 'full' : 'loaded';
        this._triggerHook('itemStored', { ringId, item });
        return { success: true };
    }

    removeItem(ringId, item) {
        const ring = this.rings.get(ringId);
        if (!ring) return { success: false, error: 'RING_NOT_FOUND' };
        const idx = ring.items.findIndex(i => JSON.stringify(i) === JSON.stringify(item));
        if (idx < 0) return { success: false, error: 'ITEM_NOT_FOUND' };
        ring.items.splice(idx, 1);
        ring.status = ring.items.length === 0 ? 'empty' : 'loaded';
        this._triggerHook('itemRemoved', { ringId, item });
        return { success: true };
    }

    upgradeRing(ringId, amount = 10) {
        const ring = this.rings.get(ringId);
        if (!ring) return { success: false, error: 'RING_NOT_FOUND' };
        ring.capacity += amount;
        ring.tier += 1;
        this._triggerHook('ringUpgraded', { ringId, newCapacity: ring.capacity });
        return { success: true };
    }

    calculateStorageCapacity(ringId) {
        const ring = this.rings.get(ringId);
        if (!ring) return 0;
        return ring.capacity + ring.items.length;
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
        if (this.stats.totalRings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRings += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rings: Array.from(this.rings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rings) this.rings = new Map(data.rings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ringCount: this.rings.size }; }
}
