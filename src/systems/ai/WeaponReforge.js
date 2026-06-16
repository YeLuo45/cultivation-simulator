/**
 * WeaponReforge.js - 武器重铸系统
 * V508 Iteration 10/20 Round 20
 */
export class WeaponReforge {
    constructor(config = {}) {
        this.config = { maxReforges: config.maxReforges || 100, basePower: config.basePower || 50, ...config };
        this.reforges = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalReforges: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getReforge', (ctx) => this.getReforge(ctx.reforgeId));
        this.registerTool('startReforge', (ctx) => this.startReforge(ctx));
    }

    startReforge(data) {
        const id = data.reforgeId || `rfg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const reforge = {
            reforgeId: id,
            smithId: data.smithId,
            weaponName: data.weaponName || 'Unnamed Weapon',
            originalPower: data.originalPower || this.config.basePower,
            materials: data.materials || [],
            level: data.level || 1,
            status: 'broken',
            createdAt: Date.now()
        };
        this.reforges.set(id, reforge);
        this.stats.totalReforges++;
        this._triggerHook('reforgeStarted', { reforgeId: id });
        return { success: true, reforge };
    }

    getReforge(id) { return this.reforges.get(id) ? { ...this.reforges.get(id) } : null; }
    listReforges() { return Array.from(this.reforges.values()).map(r => ({ ...r })); }
    listBySmith(smithId) { return Array.from(this.reforges.values()).filter(r => r.smithId === smithId).map(r => ({ ...r })); }
    listActive() { return Array.from(this.reforges.values()).filter(r => r.status !== 'cooled').map(r => ({ ...r })); }

    addMaterial(reforgeId, material) {
        const reforge = this.reforges.get(reforgeId);
        if (!reforge) return { success: false, error: 'REFORGE_NOT_FOUND' };
        reforge.materials.push(material);
        this._triggerHook('materialAdded', { reforgeId, material });
        return { success: true };
    }

    increaseLevel(reforgeId, amount = 5) {
        const reforge = this.reforges.get(reforgeId);
        if (!reforge) return { success: false, error: 'REFORGE_NOT_FOUND' };
        reforge.level += amount;
        this._triggerHook('levelIncreased', { reforgeId, newLevel: reforge.level });
        return { success: true };
    }

    meltWeapon(reforgeId) {
        const reforge = this.reforges.get(reforgeId);
        if (!reforge) return { success: false, error: 'REFORGE_NOT_FOUND' };
        reforge.status = 'melting';
        this._triggerHook('weaponMelted', { reforgeId });
        return { success: true };
    }

    coolWeapon(reforgeId) {
        const reforge = this.reforges.get(reforgeId);
        if (!reforge) return { success: false, error: 'REFORGE_NOT_FOUND' };
        reforge.status = 'cooled';
        this._triggerHook('weaponCooled', { reforgeId });
        return { success: true };
    }

    calculateReforgePower(reforgeId) {
        const reforge = this.reforges.get(reforgeId);
        if (!reforge) return 0;
        return reforge.originalPower + reforge.level * 10 + reforge.materials.length * 5;
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
        if (this.stats.totalReforges < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxReforges += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { reforges: Array.from(this.reforges.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.reforges) this.reforges = new Map(data.reforges);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, reforgeCount: this.reforges.size }; }
}
