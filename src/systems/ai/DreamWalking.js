/**
 * DreamWalking.js - 梦行系统
 * V418 Iteration 10/15 Round 14 - Dream Walking
 *
 * 融合6大设计系统:
 * - generic-agent: 梦行自循环
 * - chatdev: 梦行角色协调
 * - nanobot: 梦行mesh
 * - claude-code: 梦行分析工具
 * - thunderbolt: 梦行持久化
 * - ruflo: 梦行Hook
 */

export class DreamWalking {
    constructor(config = {}) {
        this.config = { maxWalks: config.maxWalks || 200, baseDepth: config.baseDepth || 10, baseLucidity: config.baseLucidity || 50, ...config };
        this.walks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWalks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWalk', (ctx) => this.getWalk(ctx.walkId));
        this.registerTool('startWalking', (ctx) => this.startWalking(ctx));
    }

    startWalking(data) {
        const id = data.id || `wlk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const walk = {
            walkId: id,
            walkerId: data.walkerId,
            targetId: data.targetId,
            depth: data.depth !== undefined ? data.depth : this.config.baseDepth,
            lucidity: data.lucidity !== undefined ? data.lucidity : this.config.baseLucidity,
            duration: data.duration || 0,
            experiences: data.experiences || 0,
            status: 'wandering',
            createdAt: Date.now()
        };
        this.walks.set(id, walk);
        this.stats.totalWalks++;
        this._triggerHook('walkStarted', { walkId: id });
        return { success: true, walk };
    }

    getWalk(id) { return this.walks.get(id) ? { ...this.walks.get(id) } : null; }
    listWalks() { return Array.from(this.walks.values()).map(w => ({ ...w })); }
    listByWalker(walkerId) { return Array.from(this.walks.values()).filter(w => w.walkerId === walkerId).map(w => ({ ...w })); }
    listByStatus(status) { return Array.from(this.walks.values()).filter(w => w.status === status).map(w => ({ ...w })); }

    deepenWalk(walkId, amount = 5) {
        const walk = this.walks.get(walkId);
        if (!walk) return { success: false, error: 'WALK_NOT_FOUND' };
        walk.depth += amount;
        walk.lucidity += amount;
        if (walk.depth >= 30) walk.status = 'deep';
        this._triggerHook('walkDeepened', { walkId, newDepth: walk.depth });
        return { success: true };
    }

    collectExperience(walkId, exp) {
        const walk = this.walks.get(walkId);
        if (!walk) return { success: false, error: 'WALK_NOT_FOUND' };
        walk.experiences += exp;
        this._triggerHook('experienceCollected', { walkId, exp });
        return { success: true };
    }

    exitWalk(walkId) {
        const walk = this.walks.get(walkId);
        if (!walk) return { success: false, error: 'WALK_NOT_FOUND' };
        walk.status = 'exited';
        this._triggerHook('walkExited', { walkId });
        return { success: true };
    }

    calculateJourneyDepth(walkId) {
        const walk = this.walks.get(walkId);
        if (!walk) return 0;
        return walk.depth * walk.lucidity / 100 + walk.experiences;
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
        if (this.stats.totalWalks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWalks += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { walks: Array.from(this.walks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.walks) this.walks = new Map(data.walks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, walkCount: this.walks.size }; }
}
