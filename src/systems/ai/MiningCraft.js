/**
 * MiningCraft.js - 采矿系统
 * V447 Iteration 9/15 Round 16
 */
export class MiningCraft {
    constructor(config = {}) {
        this.config = { maxMines: config.maxMines || 100, baseDurability: config.baseDurability || 100, ...config };
        this.mines = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMines: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMine', (ctx) => this.getMine(ctx.mineId));
        this.registerTool('startMining', (ctx) => this.startMining(ctx));
    }

    startMining(data) {
        const id = data.id || `mn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mine = { mineId: id, minerId: data.minerId, name: data.name || 'Unnamed Mine', oreType: data.oreType || 'iron', depth: 0, ores: 0, durability: this.config.baseDurability, status: 'active', startedAt: Date.now() };
        this.mines.set(id, mine);
        this.stats.totalMines++;
        this._triggerHook('mineStarted', { mineId: id });
        return { success: true, mine };
    }

    getMine(id) { return this.mines.get(id) ? { ...this.mines.get(id) } : null; }
    listMines() { return Array.from(this.mines.values()).map(m => ({ ...m })); }
    listByMiner(minerId) { return Array.from(this.mines.values()).filter(m => m.minerId === minerId).map(m => ({ ...m })); }
    listByOreType(oreType) { return Array.from(this.mines.values()).filter(m => m.oreType === oreType).map(m => ({ ...m })); }

    mineOre(mineId, amount = 5) {
        const mine = this.mines.get(mineId);
        if (!mine) return { success: false, error: 'MINE_NOT_FOUND' };
        mine.ores += amount;
        mine.durability = Math.max(0, mine.durability - 1);
        this._triggerHook('oreMined', { mineId, amount, totalOres: mine.ores });
        return { success: true };
    }

    deepenMine(mineId, amount = 10) {
        const mine = this.mines.get(mineId);
        if (!mine) return { success: false, error: 'MINE_NOT_FOUND' };
        mine.depth += amount;
        this._triggerHook('mineDeepened', { mineId, newDepth: mine.depth });
        return { success: true };
    }

    exhaustMine(mineId) {
        const mine = this.mines.get(mineId);
        if (!mine) return { success: false, error: 'MINE_NOT_FOUND' };
        mine.status = 'exhausted';
        this._triggerHook('mineExhausted', { mineId });
        return { success: true };
    }

    calculateMiningYield(mineId) {
        const mine = this.mines.get(mineId);
        if (!mine) return 0;
        return mine.ores * (1 + mine.depth / 100) + mine.durability / 10;
    }

    listActive() { return Array.from(this.mines.values()).filter(m => m.status === 'active').map(m => ({ ...m })); }

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
        if (this.stats.totalMines < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMines += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mines: Array.from(this.mines.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mines) this.mines = new Map(data.mines);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mineCount: this.mines.size }; }
}
