/**
 * CultivationFortress.js - 修真要塞
 * V717 Iteration 10/30 Round 29
 *
 * 融合6大设计系统:
 * - generic-agent: 要塞自循环
 * - chatdev: 要塞角色协调
 * - nanobot: 要塞mesh
 * - claude-code: 要塞分析工具
 * - thunderbolt: 要塞持久化
 * - ruflo: 要塞Hook
 */

export class CultivationFortress {
    constructor(config = {}) {
        this.config = { maxFortresses: config.maxFortresses || 20, baseGarrison: config.baseGarrison || 20, ...config };
        this.fortresses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFortresses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFortress', (ctx) => this.getFortress(ctx.fortressId));
        this.registerTool('recruitFortress', (ctx) => this.recruitFortress(ctx));
    }

    recruitFortress(data) {
        const id = data.id || `ftrs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fortress = {
            fortressId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'iron',
            garrison: data.garrison || this.config.baseGarrison,
            towers: data.towers || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.fortresses.set(id, fortress);
        this.stats.totalFortresses++;
        this._triggerHook('fortressRecruited', { fortressId: id });
        return { success: true, fortress };
    }

    getFortress(id) { return this.fortresses.get(id) ? { ...this.fortresses.get(id) } : null; }
    listFortresses() { return Array.from(this.fortresses.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.fortresses.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.fortresses.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addTower(fortressId, tower) {
        const fortress = this.fortresses.get(fortressId);
        if (!fortress) return { success: false, error: 'FORTRESS_NOT_FOUND' };
        fortress.towers.push(tower);
        this._triggerHook('towerAdded', { fortressId, tower });
        return { success: true };
    }

    raiseGarrison(fortressId, amount = 5) {
        const fortress = this.fortresses.get(fortressId);
        if (!fortress) return { success: false, error: 'FORTRESS_NOT_FOUND' };
        fortress.garrison += amount;
        this._triggerHook('garrisonRaised', { fortressId, newGarrison: fortress.garrison });
        return { success: true };
    }

    levelUpFortress(fortressId) {
        const fortress = this.fortresses.get(fortressId);
        if (!fortress) return { success: false, error: 'FORTRESS_NOT_FOUND' };
        fortress.level++;
        this._triggerHook('fortressLeveledUp', { fortressId, newLevel: fortress.level });
        return { success: true };
    }

    legendFortress(fortressId) {
        const fortress = this.fortresses.get(fortressId);
        if (!fortress) return { success: false, error: 'FORTRESS_NOT_FOUND' };
        fortress.status = 'legendary';
        this._triggerHook('fortressLegendized', { fortressId });
        return { success: true };
    }

    calculateFortressValue(fortressId) {
        const fortress = this.fortresses.get(fortressId);
        if (!fortress) return 0;
        return fortress.level * 100 + fortress.garrison * 2 + fortress.towers.length * 30;
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
        if (this.stats.totalFortresses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFortresses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { fortresses: Array.from(this.fortresses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.fortresses) this.fortresses = new Map(data.fortresses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, fortressCount: this.fortresses.size }; }
}
