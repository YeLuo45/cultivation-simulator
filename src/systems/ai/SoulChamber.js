/**
 * SoulChamber.js - 灵魂殿堂
 * V371 Iteration 5/9 Round 10
 */
export class SoulChamber {
    constructor(config = {}) {
        this.config = { maxChambers: config.maxChambers || 50, baseCapacity: config.baseCapacity || 10, ...config };
        this.chambers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalChambers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getChamber', (ctx) => this.getChamber(ctx.chamberId));
        this.registerTool('createChamber', (ctx) => this.createChamber(ctx));
    }

    createChamber(data) {
        const id = data.id || `ch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const chamber = { chamberId: id, ownerId: data.ownerId, name: data.name || 'Chamber', capacity: data.capacity || this.config.baseCapacity, residents: [], level: 1, createdAt: Date.now() };
        this.chambers.set(id, chamber);
        this.stats.totalChambers++;
        this._triggerHook('chamberCreated', { chamberId: id });
        return { success: true, chamber };
    }

    getChamber(id) { return this.chambers.get(id) ? { ...this.chambers.get(id) } : null; }
    listChambers() { return Array.from(this.chambers.values()).map(c => ({ ...c })); }
    listByOwner(ownerId) { return Array.from(this.chambers.values()).filter(c => c.ownerId === ownerId).map(c => ({ ...c })); }
    listByLevel(level) { return Array.from(this.chambers.values()).filter(c => c.level === level).map(c => ({ ...c })); }

    addResident(chamberId, soulId) {
        const chamber = this.chambers.get(chamberId);
        if (!chamber) return { success: false, error: 'CHAMBER_NOT_FOUND' };
        if (chamber.residents.length >= chamber.capacity) return { success: false, error: 'CHAMBER_FULL' };
        if (!chamber.residents.includes(soulId)) chamber.residents.push(soulId);
        this._triggerHook('residentAdded', { chamberId, soulId });
        return { success: true };
    }

    removeResident(chamberId, soulId) {
        const chamber = this.chambers.get(chamberId);
        if (!chamber) return { success: false, error: 'CHAMBER_NOT_FOUND' };
        const idx = chamber.residents.indexOf(soulId);
        if (idx < 0) return { success: false, error: 'RESIDENT_NOT_FOUND' };
        chamber.residents.splice(idx, 1);
        this._triggerHook('residentRemoved', { chamberId, soulId });
        return { success: true };
    }

    upgradeChamber(chamberId) {
        const chamber = this.chambers.get(chamberId);
        if (!chamber) return { success: false, error: 'CHAMBER_NOT_FOUND' };
        chamber.level++;
        chamber.capacity += 5;
        this._triggerHook('chamberUpgraded', { chamberId, newLevel: chamber.level });
        return { success: true, chamber: { ...chamber } };
    }

    destroyChamber(chamberId) {
        if (!this.chambers.has(chamberId)) return { success: false, error: 'CHAMBER_NOT_FOUND' };
        this.chambers.delete(chamberId);
        this._triggerHook('chamberDestroyed', { chamberId });
        return { success: true };
    }

    getResidentCount(chamberId) {
        const chamber = this.chambers.get(chamberId);
        return chamber ? chamber.residents.length : 0;
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
        if (this.stats.totalChambers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxChambers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { chambers: Array.from(this.chambers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.chambers) this.chambers = new Map(data.chambers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, chamberCount: this.chambers.size }; }
}