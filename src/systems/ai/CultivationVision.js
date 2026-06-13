/**
 * CultivationVision.js - 修真幻象系统
 * V769 Iteration 2/30 Round 31 - Cultivation Vision
 *
 * 融合6大设计系统:
 * - generic-agent: 幻象自循环
 * - chatdev: 幻象角色协调
 * - nanobot: 幻象mesh
 * - claude-code: 幻象分析工具
 * - thunderbolt: 幻象持久化
 * - ruflo: 幻象Hook
 */

export class CultivationVision {
    constructor(config = {}) {
        this.config = { maxVisions: config.maxVisions || 20, baseClarity: config.baseClarity || 20, ...config };
        this.visions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVisions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVision', (ctx) => this.getVision(ctx.visionId));
        this.registerTool('recruitVision', (ctx) => this.recruitVision(ctx));
    }

    recruitVision(data) {
        const id = data.visionId || `vis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const vision = {
            visionId: id,
            masterId: data.masterId,
            name: data.name || 'Vision',
            type: data.type || 'divine',
            clarity: data.clarity || this.config.baseClarity,
            fragments: data.fragments || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.visions.set(id, vision);
        this.stats.totalVisions++;
        this._triggerHook('visionRecruited', { visionId: id });
        return { success: true, vision };
    }

    getVision(id) { return this.visions.get(id) ? { ...this.visions.get(id) } : null; }
    listVisions() { return Array.from(this.visions.values()).map(v => ({ ...v })); }
    listByMaster(masterId) { return Array.from(this.visions.values()).filter(v => v.masterId === masterId).map(v => ({ ...v })); }
    listLegendary() { return Array.from(this.visions.values()).filter(v => v.status === 'legendary').map(v => ({ ...v })); }

    addFragment(visionId, fragment) {
        const vision = this.visions.get(visionId);
        if (!vision) return { success: false, error: 'VISION_NOT_FOUND' };
        vision.fragments.push(fragment);
        this._triggerHook('fragmentAdded', { visionId, fragment });
        return { success: true, vision: { ...vision } };
    }

    raiseClarity(visionId, amount = 5) {
        const vision = this.visions.get(visionId);
        if (!vision) return { success: false, error: 'VISION_NOT_FOUND' };
        vision.clarity += amount;
        this._triggerHook('clarityRaised', { visionId, newClarity: vision.clarity });
        return { success: true };
    }

    levelUpVision(visionId) {
        const vision = this.visions.get(visionId);
        if (!vision) return { success: false, error: 'VISION_NOT_FOUND' };
        vision.level++;
        this._triggerHook('visionLeveledUp', { visionId, newLevel: vision.level });
        return { success: true };
    }

    legendVision(visionId) {
        const vision = this.visions.get(visionId);
        if (!vision) return { success: false, error: 'VISION_NOT_FOUND' };
        vision.status = 'legendary';
        this._triggerHook('visionLegendized', { visionId });
        return { success: true };
    }

    calculateVisionValue(visionId) {
        const vision = this.visions.get(visionId);
        if (!vision) return 0;
        return vision.level * 100 + vision.clarity * 2 + vision.fragments.length * 30;
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
        if (this.stats.totalVisions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxVisions += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { visions: Array.from(this.visions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.visions) this.visions = new Map(data.visions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, visionCount: this.visions.size }; }
}
