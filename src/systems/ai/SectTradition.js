/**
 * SectTradition.js - 宗门传统
 * V487 Iteration 4/15 Round 19
 */

export class SectTradition {
    constructor(config = {}) {
        this.config = { maxTraditions: config.maxTraditions || 50, baseParticipants: config.baseParticipants || 1, ...config };
        this.traditions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTraditions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTradition', (ctx) => this.getTradition(ctx.traditionId));
        this.registerTool('preserveTradition', (ctx) => this.preserveTradition(ctx));
    }

    preserveTradition(data) {
        const id = data.id || `trd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tradition = {
            traditionId: id,
            sectId: data.sectId,
            name: data.name,
            type: data.type || 'annual',
            participants: data.participants || [this.config.baseParticipants],
            gifts: data.gifts || [],
            status: 'active',
            createdAt: Date.now()
        };
        this.traditions.set(id, tradition);
        this.stats.totalTraditions++;
        this._triggerHook('traditionPreserved', { traditionId: id });
        return { success: true, tradition };
    }

    getTradition(id) { return this.traditions.get(id) ? { ...this.traditions.get(id) } : null; }
    listTraditions() { return Array.from(this.traditions.values()).map(t => ({ ...t })); }
    listBySect(sectId) { return Array.from(this.traditions.values()).filter(t => t.sectId === sectId).map(t => ({ ...t })); }
    listByType(type) { return Array.from(this.traditions.values()).filter(t => t.type === type).map(t => ({ ...t })); }

    addParticipant(traditionId, member) {
        const tradition = this.traditions.get(traditionId);
        if (!tradition) return { success: false, error: 'TRADITION_NOT_FOUND' };
        tradition.participants.push(member);
        this._triggerHook('participantAdded', { traditionId, member });
        return { success: true };
    }

    giveGift(traditionId, gift) {
        const tradition = this.traditions.get(traditionId);
        if (!tradition) return { success: false, error: 'TRADITION_NOT_FOUND' };
        tradition.gifts.push(gift);
        this._triggerHook('giftGiven', { traditionId, gift });
        return { success: true };
    }

    markRare(traditionId) {
        const tradition = this.traditions.get(traditionId);
        if (!tradition) return { success: false, error: 'TRADITION_NOT_FOUND' };
        tradition.status = 'rare';
        this._triggerHook('traditionRare', { traditionId });
        return { success: true };
    }

    calculateTraditionValue(traditionId) {
        const tradition = this.traditions.get(traditionId);
        if (!tradition) return 0;
        return tradition.participants.length * 5 + tradition.gifts.length * 10;
    }

    listRare() { return Array.from(this.traditions.values()).filter(t => t.status === 'rare').map(t => ({ ...t })); }

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
        if (this.stats.totalTraditions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTraditions += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { traditions: Array.from(this.traditions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.traditions) this.traditions = new Map(data.traditions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, traditionCount: this.traditions.size }; }
}
