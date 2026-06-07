/**
 * CultivationCastle.js - 修真城堡
 * V713 Iteration 6/30 Round 29
 *
 * 融合6大设计系统:
 * - generic-agent: 城堡自循环
 * - chatdev: 城堡角色协调
 * - nanobot: 城堡mesh
 * - claude-code: 城堡分析工具
 * - thunderbolt: 城堡持久化
 * - ruflo: 城堡Hook
 */

export class CultivationCastle {
    constructor(config = {}) {
        this.config = { maxCastles: config.maxCastles || 20, baseDefense: config.baseDefense || 20, ...config };
        this.castles = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCastles: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCastle', (ctx) => this.getCastle(ctx.castleId));
        this.registerTool('recruitCastle', (ctx) => this.recruitCastle(ctx));
    }

    recruitCastle(data) {
        const id = data.id || `cstl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const castle = {
            castleId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'fortress',
            defense: data.defense || this.config.baseDefense,
            walls: data.walls || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.castles.set(id, castle);
        this.stats.totalCastles++;
        this._triggerHook('castleRecruited', { castleId: id });
        return { success: true, castle };
    }

    getCastle(id) { return this.castles.get(id) ? { ...this.castles.get(id) } : null; }
    listCastles() { return Array.from(this.castles.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.castles.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.castles.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addWall(castleId, wall) {
        const castle = this.castles.get(castleId);
        if (!castle) return { success: false, error: 'CASTLE_NOT_FOUND' };
        castle.walls.push(wall);
        this._triggerHook('wallAdded', { castleId, wall });
        return { success: true };
    }

    raiseDefense(castleId, amount = 5) {
        const castle = this.castles.get(castleId);
        if (!castle) return { success: false, error: 'CASTLE_NOT_FOUND' };
        castle.defense += amount;
        this._triggerHook('defenseRaised', { castleId, newDefense: castle.defense });
        return { success: true };
    }

    levelUpCastle(castleId) {
        const castle = this.castles.get(castleId);
        if (!castle) return { success: false, error: 'CASTLE_NOT_FOUND' };
        castle.level++;
        this._triggerHook('castleLeveledUp', { castleId, newLevel: castle.level });
        return { success: true };
    }

    legendCastle(castleId) {
        const castle = this.castles.get(castleId);
        if (!castle) return { success: false, error: 'CASTLE_NOT_FOUND' };
        castle.status = 'legendary';
        this._triggerHook('castleLegendized', { castleId });
        return { success: true };
    }

    calculateCastleValue(castleId) {
        const castle = this.castles.get(castleId);
        if (!castle) return 0;
        return castle.level * 100 + castle.defense * 2 + castle.walls.length * 30;
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
        if (this.stats.totalCastles < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCastles += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { castles: Array.from(this.castles.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.castles) this.castles = new Map(data.castles);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, castleCount: this.castles.size }; }
}
