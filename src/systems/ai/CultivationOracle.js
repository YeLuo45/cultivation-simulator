/**
 * CultivationOracle.js - 修真神谕系统
 * V650 Iteration 3/30 Round 27
 */
export class CultivationOracle {
    constructor(config = {}) {
        this.config = { maxOracles: config.maxOracles || 20, baseProphecy: config.baseProphecy || 20, ...config };
        this.oracles = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalOracles: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getOracle', (ctx) => this.getOracle(ctx.oracleId));
        this.registerTool('recruitOracle', (ctx) => this.recruitOracle(ctx));
    }

    recruitOracle(data) {
        const id = data.oracleId || `oracle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const oracle = {
            oracleId: id,
            prophetId: data.prophetId,
            name: data.name || 'Unknown Oracle',
            type: data.type || 'divine',
            prophecy: data.prophecy !== undefined ? data.prophecy : this.config.baseProphecy,
            oracles: data.oracles || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.oracles.set(id, oracle);
        this.stats.totalOracles++;
        this._triggerHook('oracleRecruited', { oracleId: id });
        return { success: true, oracle };
    }

    getOracle(id) { return this.oracles.get(id) ? { ...this.oracles.get(id), oracles: [...(this.oracles.get(id).oracles || [])] } : null; }
    listOracles() { return Array.from(this.oracles.values()).map(o => ({ ...o, oracles: [...(o.oracles || [])] })); }
    listByProphet(prophetId) { return Array.from(this.oracles.values()).filter(o => o.prophetId === prophetId).map(o => ({ ...o, oracles: [...(o.oracles || [])] })); }
    listLegendary() { return Array.from(this.oracles.values()).filter(o => o.status === 'legendary').map(o => ({ ...o, oracles: [...(o.oracles || [])] })); }

    addOracle(oracleId, oracle) {
        const target = this.oracles.get(oracleId);
        if (!target) return { success: false, error: 'ORACLE_NOT_FOUND' };
        target.oracles.push(oracle);
        this._triggerHook('oracleAdded', { oracleId, oracle });
        return { success: true };
    }

    deepenProphecy(oracleId, amount = 5) {
        const target = this.oracles.get(oracleId);
        if (!target) return { success: false, error: 'ORACLE_NOT_FOUND' };
        target.prophecy += amount;
        this._triggerHook('prophecyDeepened', { oracleId, newProphecy: target.prophecy });
        return { success: true };
    }

    levelUpOracle(oracleId) {
        const target = this.oracles.get(oracleId);
        if (!target) return { success: false, error: 'ORACLE_NOT_FOUND' };
        target.level++;
        this._triggerHook('oracleLeveledUp', { oracleId, newLevel: target.level });
        return { success: true };
    }

    legendOracle(oracleId) {
        const target = this.oracles.get(oracleId);
        if (!target) return { success: false, error: 'ORACLE_NOT_FOUND' };
        target.status = 'legendary';
        this._triggerHook('oracleLegendized', { oracleId });
        return { success: true };
    }

    calculateOracleValue(oracleId) {
        const target = this.oracles.get(oracleId);
        if (!target) return 0;
        return target.level * 100 + target.prophecy * 2 + (target.oracles ? target.oracles.length : 0) * 30;
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
        if (this.stats.totalOracles < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxOracles += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { oracles: Array.from(this.oracles.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.oracles) this.oracles = new Map(data.oracles);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, oracleCount: this.oracles.size }; }
}
