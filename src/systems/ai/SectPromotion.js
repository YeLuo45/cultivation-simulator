/**
 * SectPromotion.js - 宗门晋升系统
 * V491 Iteration 8/15 Round 19
 */

export class SectPromotion {
    constructor(config = {}) {
        this.config = { maxPromotions: config.maxPromotions || 100, baseMerit: config.baseMerit || 10, ...config };
        this.promotions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPromotions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPromotion', (ctx) => this.getPromotion(ctx.promotionId));
        this.registerTool('proposePromotion', (ctx) => this.proposePromotion(ctx));
    }

    proposePromotion(data) {
        const id = data.id || `prm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const promotion = {
            promotionId: id,
            sectId: data.sectId,
            member: data.member,
            fromRank: data.fromRank || 'outer',
            toRank: data.toRank || 'inner',
            merit: data.merit || this.config.baseMerit,
            status: data.status || 'pending',
            createdAt: Date.now()
        };
        this.promotions.set(id, promotion);
        this.stats.totalPromotions++;
        this._triggerHook('promotionProposed', { promotionId: id });
        return { success: true, promotion };
    }

    getPromotion(id) { return this.promotions.get(id) ? { ...this.promotions.get(id) } : null; }
    listPromotions() { return Array.from(this.promotions.values()).map(p => ({ ...p })); }
    listBySect(sectId) { return Array.from(this.promotions.values()).filter(p => p.sectId === sectId).map(p => ({ ...p })); }
    listApproved() { return Array.from(this.promotions.values()).filter(p => p.status === 'approved').map(p => ({ ...p })); }

    addMerit(promotionId, amount = 10) {
        const promotion = this.promotions.get(promotionId);
        if (!promotion) return { success: false, error: 'PROMOTION_NOT_FOUND' };
        promotion.merit += amount;
        this._triggerHook('meritAdded', { promotionId, newMerit: promotion.merit });
        return { success: true };
    }

    approvePromotion(promotionId) {
        const promotion = this.promotions.get(promotionId);
        if (!promotion) return { success: false, error: 'PROMOTION_NOT_FOUND' };
        promotion.status = 'approved';
        this._triggerHook('promotionApproved', { promotionId });
        return { success: true };
    }

    rejectPromotion(promotionId) {
        const promotion = this.promotions.get(promotionId);
        if (!promotion) return { success: false, error: 'PROMOTION_NOT_FOUND' };
        promotion.status = 'rejected';
        this._triggerHook('promotionRejected', { promotionId });
        return { success: true };
    }

    calculatePromotionScore(promotionId) {
        const promotion = this.promotions.get(promotionId);
        if (!promotion) return 0;
        return promotion.merit * 10 + promotion.toRank.length;
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
        if (this.stats.totalPromotions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPromotions += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { promotions: Array.from(this.promotions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.promotions) this.promotions = new Map(data.promotions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, promotionCount: this.promotions.size }; }
}
