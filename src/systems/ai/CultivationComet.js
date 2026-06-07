/**
 * CultivationComet.js - 修真彗星系统
 * V686 Iteration 9/30 Round 28
 *
 * 融合6大设计系统:
 * - generic-agent: 彗星自循环
 * - chatdev: 彗星角色协调
 * - nanobot: 彗星mesh
 * - claude-code: 彗星分析工具
 * - thunderbolt: 彗星持久化
 * - ruflo: 彗星Hook
 */

export class CultivationComet {
    constructor(config = {}) {
        this.config = { maxComets: config.maxComets || 20, baseSpeed: config.baseSpeed || 20, ...config };
        this.comets = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalComets: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getComet', (ctx) => this.getComet(ctx.cometId));
        this.registerTool('recruitComet', (ctx) => this.recruitComet(ctx));
    }

    recruitComet(data) {
        const id = data.cometId || `com_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const comet = {
            cometId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Comet',
            type: data.type || 'meteor',
            speed: data.speed || this.config.baseSpeed,
            trails: data.trails || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.comets.set(id, comet);
        this.stats.totalComets++;
        this._triggerHook('cometRecruited', { cometId: id });
        return { success: true, comet };
    }

    getComet(id) { return this.comets.get(id) ? { ...this.comets.get(id) } : null; }
    listComets() { return Array.from(this.comets.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.comets.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.comets.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addTrail(cometId, trail) {
        const comet = this.comets.get(cometId);
        if (!comet) return { success: false, error: 'COMET_NOT_FOUND' };
        comet.trails.push(trail);
        this._triggerHook('trailAdded', { cometId, trail });
        return { success: true, comet: { ...comet } };
    }

    raiseSpeed(cometId, amount = 5) {
        const comet = this.comets.get(cometId);
        if (!comet) return { success: false, error: 'COMET_NOT_FOUND' };
        comet.speed += amount;
        this._triggerHook('speedRaised', { cometId, newSpeed: comet.speed });
        return { success: true };
    }

    levelUpComet(cometId) {
        const comet = this.comets.get(cometId);
        if (!comet) return { success: false, error: 'COMET_NOT_FOUND' };
        comet.level++;
        this._triggerHook('cometLeveledUp', { cometId, newLevel: comet.level });
        return { success: true };
    }

    legendComet(cometId) {
        const comet = this.comets.get(cometId);
        if (!comet) return { success: false, error: 'COMET_NOT_FOUND' };
        comet.status = 'legendary';
        this._triggerHook('cometLegendized', { cometId });
        return { success: true, comet: { ...comet } };
    }

    calculateCometValue(cometId) {
        const comet = this.comets.get(cometId);
        if (!comet) return 0;
        return comet.level * 100 + comet.speed * 2 + comet.trails.length * 30;
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
        if (this.stats.totalComets < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxComets += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { comets: Array.from(this.comets.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.comets) this.comets = new Map(data.comets);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cometCount: this.comets.size }; }
}
