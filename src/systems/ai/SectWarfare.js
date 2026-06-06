/**
 * SectWarfare.js - 宗门战争
 * V474 Iteration 6/15 Round 18 - Sect Warfare
 *
 * 融合6大设计系统:
 * - generic-agent: 战争自循环
 * - chatdev: 战争角色协调
 * - nanobot: 战争mesh
 * - claude-code: 战争分析工具
 * - thunderbolt: 战争持久化
 * - ruflo: 战争Hook
 */

export class SectWarfare {
    constructor(config = {}) {
        this.config = { maxWars: config.maxWars || 50, baseSoldiers: config.baseSoldiers || 100, ...config };
        this.wars = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWars: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWar', (ctx) => this.getWar(ctx.warId));
        this.registerTool('declareWar', (ctx) => this.declareWar(ctx));
    }

    declareWar(data) {
        const id = data.warId || data.id || `war_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const war = {
            warId: id,
            sectId: data.sectId,
            enemySect: data.enemySect,
            soldiers: data.soldiers || this.config.baseSoldiers,
            battles: data.battles || [],
            casualties: data.casualties || 0,
            status: data.status || 'declared',
            declaredAt: Date.now()
        };
        this.wars.set(id, war);
        this.stats.totalWars++;
        this._triggerHook('warDeclared', { warId: id });
        return { success: true, war };
    }

    getWar(id) { return this.wars.get(id) ? { ...this.wars.get(id) } : null; }
    listWars() { return Array.from(this.wars.values()).map(w => ({ ...w })); }
    listBySect(sect) { return Array.from(this.wars.values()).filter(w => w.sectId === sect || w.enemySect === sect).map(w => ({ ...w })); }
    listOngoing() { return Array.from(this.wars.values()).filter(w => w.status === 'ongoing' || w.status === 'declared').map(w => ({ ...w })); }

    sendSoldiers(warId, count = 10) {
        const war = this.wars.get(warId);
        if (!war) return { success: false, error: 'WAR_NOT_FOUND' };
        war.soldiers += count;
        this._triggerHook('soldiersSent', { warId, count, totalSoldiers: war.soldiers });
        return { success: true };
    }

    recordBattle(warId, battle) {
        const war = this.wars.get(warId);
        if (!war) return { success: false, error: 'WAR_NOT_FOUND' };
        war.battles.push(battle);
        if (war.status === 'declared') war.status = 'ongoing';
        this._triggerHook('battleRecorded', { warId, battle });
        return { success: true };
    }

    declareVictory(warId) {
        const war = this.wars.get(warId);
        if (!war) return { success: false, error: 'WAR_NOT_FOUND' };
        war.status = 'victorious';
        this._triggerHook('warConcluded', { warId, result: 'victorious' });
        return { success: true };
    }

    declareDefeat(warId) {
        const war = this.wars.get(warId);
        if (!war) return { success: false, error: 'WAR_NOT_FOUND' };
        war.status = 'defeated';
        this._triggerHook('warConcluded', { warId, result: 'defeated' });
        return { success: true };
    }

    calculateWarStrength(warId) {
        const war = this.wars.get(warId);
        if (!war) return 0;
        return war.soldiers * 2 + war.battles.length * 50 - war.casualties;
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
        if (this.stats.totalWars < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWars += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { wars: Array.from(this.wars.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.wars) this.wars = new Map(data.wars);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, warCount: this.wars.size }; }
}
