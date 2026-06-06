/**
 * CultivationGalaxy.js - 修真星系系统
 * V594 Iteration 17/20 Round 24
 */
export class CultivationGalaxy {
    constructor(config = {}) {
        this.config = { maxGalaxies: config.maxGalaxies || 15, baseEnergy: config.baseEnergy || 100, ...config };
        this.galaxies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGalaxies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGalaxy', (ctx) => this.getGalaxy(ctx.galaxyId));
        this.registerTool('createGalaxy', (ctx) => this.createGalaxy(ctx));
    }

    createGalaxy(data) {
        if (this.galaxies.size >= this.config.maxGalaxies) return { success: false, error: 'MAX_GALAXIES_REACHED' };
        const id = data.galaxyId || `gal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const galaxy = {
            galaxyId: id,
            sageId: data.sageId,
            name: data.name,
            type: data.type || 'spiral',
            energy: data.energy || this.config.baseEnergy,
            stars: data.stars || [],
            level: 1,
            status: 'forming',
            createdAt: Date.now()
        };
        this.galaxies.set(id, galaxy);
        this.stats.totalGalaxies++;
        this._triggerHook('galaxyCreated', { galaxyId: id });
        return { success: true, galaxy };
    }

    getGalaxy(id) { return this.galaxies.get(id) ? { ...this.galaxies.get(id) } : null; }
    listGalaxies() { return Array.from(this.galaxies.values()).map(g => ({ ...g })); }
    listBySage(sageId) { return Array.from(this.galaxies.values()).filter(g => g.sageId === sageId).map(g => ({ ...g })); }
    listStable() { return Array.from(this.galaxies.values()).filter(g => g.status === 'stable' || g.status === 'eternal').map(g => ({ ...g })); }

    addStar(galaxyId, star) {
        const galaxy = this.galaxies.get(galaxyId);
        if (!galaxy) return { success: false, error: 'GALAXY_NOT_FOUND' };
        galaxy.stars.push(star);
        this._triggerHook('starAdded', { galaxyId, star });
        return { success: true };
    }

    increaseEnergy(galaxyId, amount = 5) {
        const galaxy = this.galaxies.get(galaxyId);
        if (!galaxy) return { success: false, error: 'GALAXY_NOT_FOUND' };
        galaxy.energy += amount;
        this._triggerHook('energyIncreased', { galaxyId, newEnergy: galaxy.energy });
        return { success: true };
    }

    levelUpGalaxy(galaxyId) {
        const galaxy = this.galaxies.get(galaxyId);
        if (!galaxy) return { success: false, error: 'GALAXY_NOT_FOUND' };
        galaxy.level++;
        this._triggerHook('galaxyLeveledUp', { galaxyId, newLevel: galaxy.level });
        return { success: true };
    }

    eternalizeGalaxy(galaxyId) {
        const galaxy = this.galaxies.get(galaxyId);
        if (!galaxy) return { success: false, error: 'GALAXY_NOT_FOUND' };
        galaxy.status = 'eternal';
        this._triggerHook('galaxyEternalized', { galaxyId });
        return { success: true };
    }

    calculateGalaxyValue(galaxyId) {
        const galaxy = this.galaxies.get(galaxyId);
        if (!galaxy) return 0;
        return galaxy.level * 100 + galaxy.energy * 2 + galaxy.stars.length * 30;
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
        if (this.stats.totalGalaxies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGalaxies += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { galaxies: Array.from(this.galaxies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.galaxies) this.galaxies = new Map(data.galaxies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, galaxyCount: this.galaxies.size }; }
}
