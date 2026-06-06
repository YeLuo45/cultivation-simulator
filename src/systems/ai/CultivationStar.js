/**
 * CultivationStar.js - 修真星系统
 * V593 Iteration 16/20 Round 24 - Cultivation Star
 */
export class CultivationStar {
    constructor(config = {}) {
        this.config = { maxStars: config.maxStars || 20, baseBrilliance: config.baseBrilliance || 20, ...config };
        this.stars = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStars: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getStar', (ctx) => this.getStar(ctx.starId));
        this.registerTool('observeStar', (ctx) => this.observeStar(ctx));
    }

    observeStar(data) {
        const id = data.starId || `str_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const star = {
            starId: id,
            astronomerId: data.astronomerId,
            name: data.name || 'Unknown Star',
            type: data.type || 'luminous',
            brilliance: data.brilliance || this.config.baseBrilliance,
            satellites: data.satellites || [],
            level: 1,
            status: 'rising',
            createdAt: Date.now()
        };
        this.stars.set(id, star);
        this.stats.totalStars++;
        this._triggerHook('starObserved', { starId: id });
        return { success: true, star };
    }

    getStar(id) { return this.stars.get(id) ? { ...this.stars.get(id) } : null; }
    listStars() { return Array.from(this.stars.values()).map(s => ({ ...s })); }
    listByAstronomer(astronomerId) { return Array.from(this.stars.values()).filter(s => s.astronomerId === astronomerId).map(s => ({ ...s })); }
    listEternal() { return Array.from(this.stars.values()).filter(s => s.status === 'eternal').map(s => ({ ...s })); }

    addSatellite(starId, satellite) {
        const star = this.stars.get(starId);
        if (!star) return { success: false, error: 'STAR_NOT_FOUND' };
        star.satellites.push(satellite);
        this._triggerHook('satelliteAdded', { starId, satellite });
        return { success: true };
    }

    increaseBrilliance(starId, amount = 5) {
        const star = this.stars.get(starId);
        if (!star) return { success: false, error: 'STAR_NOT_FOUND' };
        star.brilliance += amount;
        this._triggerHook('brillianceIncreased', { starId, newBrilliance: star.brilliance });
        return { success: true };
    }

    levelUpStar(starId) {
        const star = this.stars.get(starId);
        if (!star) return { success: false, error: 'STAR_NOT_FOUND' };
        star.level++;
        this._triggerHook('starLeveledUp', { starId, newLevel: star.level });
        return { success: true };
    }

    eternalizeStar(starId) {
        const star = this.stars.get(starId);
        if (!star) return { success: false, error: 'STAR_NOT_FOUND' };
        star.status = 'eternal';
        this._triggerHook('starEternalized', { starId });
        return { success: true };
    }

    calculateStarValue(starId) {
        const star = this.stars.get(starId);
        if (!star) return 0;
        return star.level * 100 + star.brilliance * 2 + star.satellites.length * 30;
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
        if (this.stats.totalStars < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxStars += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { stars: Array.from(this.stars.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.stars) this.stars = new Map(data.stars);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, starCount: this.stars.size }; }
}
