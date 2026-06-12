/**
 * CultivationDreamFutureSight.js - 修真未来洞察
 * V873 Iteration 7/30 Round 34
 */
export const TIMELINES = ['near', 'mid', 'far'];
export const CLARITY_LEVELS = ['hazy', 'blurry', 'moderate', 'sharp', 'crystal'];
export const REFINEMENT_RULES = ['focus', 'isolate', 'amplify', 'steady', 'verify'];

export class CultivationDreamFutureSight {
    constructor(config = {}) {
        this.config = { maxSights: config.maxSights || 50, baseClarity: config.baseClarity ?? 0.2, maxRefinements: config.maxRefinements || 10, ...config };
        this.sights = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGlimpsed: 0, totalLocked: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSight', (ctx) => this.getSight(ctx.sightId));
        this.registerTool('listByTimeline', (ctx) => this.listByTimeline(ctx.timeline));
    }

    glimpseFuture(dreamId, timeline) {
        if (!TIMELINES.includes(timeline)) return { success: false, error: 'INVALID_TIMELINE' };
        const id = `sight_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sight = {
            id, dreamId, timeline,
            visionClarity: Math.min(1, this.config.baseClarity + Math.random() * 0.1),
            refinementCount: 0, locked: false,
            glimpedAt: Date.now()
        };
        this.sights.set(id, sight);
        this.stats.totalGlimpsed++;
        this._triggerHook('futureGlimpsed', { id, dreamId, timeline });
        return { success: true, sight };
    }

    getSight(id) { return this.sights.get(id) ? { ...this.sights.get(id) } : null; }
    listSights() { return Array.from(this.sights.values()).map(s => ({ ...s })); }
    listByTimeline(timeline) { return Array.from(this.sights.values()).filter(s => s.timeline === timeline).map(s => ({ ...s })); }
    listByDream(dreamId) { return Array.from(this.sights.values()).filter(s => s.dreamId === dreamId).map(s => ({ ...s })); }
    listLocked() { return Array.from(this.sights.values()).filter(s => s.locked).map(s => ({ ...s })); }

    refineVision(sightId, feedback) {
        const sight = this.sights.get(sightId);
        if (!sight) return { success: false, error: 'SIGHT_NOT_FOUND' };
        if (sight.locked) return { success: false, error: 'SIGHT_LOCKED' };
        if (sight.refinementCount >= this.config.maxRefinements) return { success: false, error: 'MAX_REFINEMENTS' };
        const rule = typeof feedback === 'string' ? feedback : 'focus';
        const valid = REFINEMENT_RULES.includes(rule) ? rule : 'focus';
        sight.refinementCount++;
        sight.visionClarity = Math.min(1, sight.visionClarity + 0.1);
        sight.lastRefinement = valid;
        const clarityIdx = Math.min(CLARITY_LEVELS.length - 1, Math.floor(sight.visionClarity * CLARITY_LEVELS.length));
        sight.clarityLevel = CLARITY_LEVELS[clarityIdx];
        this._triggerHook('visionRefined', { sightId, rule: valid });
        return { success: true, visionClarity: sight.visionClarity, clarityLevel: sight.clarityLevel };
    }

    lockProphecy(sightId) {
        const sight = this.sights.get(sightId);
        if (!sight) return { success: false, error: 'SIGHT_NOT_FOUND' };
        sight.locked = true;
        sight.lockedAt = Date.now();
        this.stats.totalLocked++;
        this._triggerHook('prophecyLocked', { sightId });
        return { success: true };
    }

    unlockProphecy(sightId) {
        const sight = this.sights.get(sightId);
        if (!sight) return { success: false, error: 'SIGHT_NOT_FOUND' };
        sight.locked = false;
        sight.unlockedAt = Date.now();
        return { success: true };
    }

    getClarityLevel(clarity) {
        if (typeof clarity !== 'number') return CLARITY_LEVELS[0];
        const idx = Math.min(CLARITY_LEVELS.length - 1, Math.max(0, Math.floor(clarity * CLARITY_LEVELS.length)));
        return CLARITY_LEVELS[idx];
    }

    deleteSight(sightId) {
        if (!this.sights.has(sightId)) return { success: false, error: 'SIGHT_NOT_FOUND' };
        this.sights.delete(sightId);
        this._triggerHook('sightDeleted', { sightId });
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

    toJSON() { return { sights: Array.from(this.sights.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sights) this.sights = new Map(data.sights);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sightCount: this.sights.size }; }
}
