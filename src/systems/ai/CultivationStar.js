/**
 * CultivationStar.js - 修真星辰系统
 * V683 Iteration 6/30 Round 28
 *
 * 融合6大设计系统:
 * - generic-agent: 星辰自循环
 * - chatdev: 星辰角色协调
 * - nanobot: 星辰mesh
 * - claude-code: 星辰分析工具
 * - thunderbolt: 星辰持久化
 * - ruflo: 星辰Hook
 */

export class CultivationStar {
    constructor(config = {}) {
        this.config = { maxStars: config.maxStars || 28, baseBrilliance: config.baseBrilliance || 20, ...config };
        this.stars = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStars: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getStar', (ctx) => this.getStar(ctx.starId));
        this.registerTool('recruitStar', (ctx) => this.recruitStar(ctx));
    }

    recruitStar(data) {
        const id = data.starId || `str_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const star = {
            starId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Star',
            type: data.type || 'north',
            brilliance: data.brilliance || this.config.baseBrilliance,
            constellations: data.constellations || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.stars.set(id, star);
        this.stats.totalStars++;
        this._triggerHook('starRecruited', { starId: id });
        return { success: true, star };
    }

    getStar(id) { return this.stars.get(id) ? { ...this.stars.get(id) } : null; }
    listStars() { return Array.from(this.stars.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.stars.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.stars.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addConstellation(starId, constellation) {
        const star = this.stars.get(starId);
        if (!star) return { success: false, error: 'STAR_NOT_FOUND' };
        star.constellations.push(constellation);
        this._triggerHook('constellationAdded', { starId, constellation });
        return { success: true, star: { ...star } };
    }

    raiseBrilliance(starId, amount = 5) {
        const star = this.stars.get(starId);
        if (!star) return { success: false, error: 'STAR_NOT_FOUND' };
        star.brilliance += amount;
        this._triggerHook('brillianceRaised', { starId, newBrilliance: star.brilliance });
        return { success: true };
    }

    levelUpStar(starId) {
        const star = this.stars.get(starId);
        if (!star) return { success: false, error: 'STAR_NOT_FOUND' };
        star.level++;
        this._triggerHook('starLeveledUp', { starId, newLevel: star.level });
        return { success: true };
    }

    legendStar(starId) {
        const star = this.stars.get(starId);
        if (!star) return { success: false, error: 'STAR_NOT_FOUND' };
        star.status = 'legendary';
        this._triggerHook('starLegendized', { starId });
        return { success: true, star: { ...star } };
    }

    calculateStarValue(starId) {
        const star = this.stars.get(starId);
        if (!star) return 0;
        return star.level * 100 + star.brilliance * 2 + star.constellations.length * 30;
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
