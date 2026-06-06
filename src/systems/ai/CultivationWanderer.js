/**
 * CultivationWanderer.js - 修真游侠
 * V654 Iteration 7/30 Round 27 - Cultivation Wanderer
 *
 * 修真游侠系统: 管理游侠招募、路径扩展、自由度提升、传奇晋升。
 */

export class CultivationWanderer {
    constructor(config = {}) {
        this.config = { maxWanderers: config.maxWanderers || 50, baseFreedom: config.baseFreedom || 20, ...config };
        this.wanderers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWanderers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWanderer', (ctx) => this.getWanderer(ctx.wandererId));
        this.registerTool('recruitWanderer', (ctx) => this.recruitWanderer(ctx));
    }

    recruitWanderer(data) {
        const id = data.id || `wnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const wanderer = {
            wandererId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Wanderer',
            type: data.type || 'nomad',
            freedom: data.freedom || this.config.baseFreedom,
            paths: data.paths || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.wanderers.set(id, wanderer);
        this.stats.totalWanderers++;
        this._triggerHook('wandererRecruited', { wandererId: id });
        return { success: true, wanderer };
    }

    getWanderer(id) { return this.wanderers.get(id) ? { ...this.wanderers.get(id) } : null; }
    listWanderers() { return Array.from(this.wanderers.values()).map(w => ({ ...w })); }
    listByMaster(masterId) { return Array.from(this.wanderers.values()).filter(w => w.masterId === masterId).map(w => ({ ...w })); }
    listLegendary() { return Array.from(this.wanderers.values()).filter(w => w.status === 'legendary').map(w => ({ ...w })); }

    addPath(wandererId, path) {
        const wanderer = this.wanderers.get(wandererId);
        if (!wanderer) return { success: false, error: 'WANDERER_NOT_FOUND' };
        if (wanderer.paths.includes(path)) return { success: false, error: 'PATH_ALREADY_ADDED' };
        wanderer.paths.push(path);
        this._triggerHook('pathAdded', { wandererId, path });
        return { success: true, paths: [...wanderer.paths] };
    }

    expandFreedom(wandererId, amount = 5) {
        const wanderer = this.wanderers.get(wandererId);
        if (!wanderer) return { success: false, error: 'WANDERER_NOT_FOUND' };
        wanderer.freedom += amount;
        this._triggerHook('freedomExpanded', { wandererId, newFreedom: wanderer.freedom });
        return { success: true, newFreedom: wanderer.freedom };
    }

    levelUpWanderer(wandererId) {
        const wanderer = this.wanderers.get(wandererId);
        if (!wanderer) return { success: false, error: 'WANDERER_NOT_FOUND' };
        wanderer.level++;
        this._triggerHook('wandererLeveledUp', { wandererId, newLevel: wanderer.level });
        return { success: true, newLevel: wanderer.level };
    }

    legendWanderer(wandererId) {
        const wanderer = this.wanderers.get(wandererId);
        if (!wanderer) return { success: false, error: 'WANDERER_NOT_FOUND' };
        wanderer.status = 'legendary';
        this._triggerHook('wandererLegendized', { wandererId });
        return { success: true, status: wanderer.status };
    }

    calculateWandererValue(wandererId) {
        const wanderer = this.wanderers.get(wandererId);
        if (!wanderer) return 0;
        return wanderer.level * 100 + wanderer.freedom * 2 + wanderer.paths.length * 30;
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
        if (this.stats.totalWanderers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWanderers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { wanderers: Array.from(this.wanderers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.wanderers) this.wanderers = new Map(data.wanderers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, wandererCount: this.wanderers.size }; }
}
