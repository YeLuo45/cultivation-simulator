/**
 * SectTreasury.js - 宗门金库
 * V478 Iteration 10/15 Round 18
 */
export class SectTreasury {
    constructor(config = {}) {
        this.config = { maxTreasuries: config.maxTreasuries || 100, baseStones: config.baseStones || 1000, ...config };
        this.treasuries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTreasuries: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTreasury', (ctx) => this.getTreasury(ctx.treasuryId));
        this.registerTool('openTreasury', (ctx) => this.openTreasury(ctx));
    }

    openTreasury(data) {
        const id = data.id || `trs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const treasury = { treasuryId: id, sectId: data.sectId, spiritStones: data.spiritStones || this.config.baseStones, gold: data.gold || 0, artifacts: data.artifacts || [], status: data.status || 'normal', level: 1, createdAt: Date.now() };
        this.treasuries.set(id, treasury);
        this.stats.totalTreasuries++;
        this._triggerHook('treasuryOpened', { treasuryId: id });
        return { success: true, treasury };
    }

    getTreasury(id) { return this.treasuries.get(id) ? { ...this.treasuries.get(id) } : null; }
    listTreasuries() { return Array.from(this.treasuries.values()).map(t => ({ ...t })); }
    listBySect(sectId) { return Array.from(this.treasuries.values()).filter(t => t.sectId === sectId).map(t => ({ ...t })); }
    listByStatus(status) { return Array.from(this.treasuries.values()).filter(t => t.status === status).map(t => ({ ...t })); }

    depositStones(treasuryId, amount = 100) {
        const treasury = this.treasuries.get(treasuryId);
        if (!treasury) return { success: false, error: 'TREASURY_NOT_FOUND' };
        treasury.spiritStones += amount;
        this._triggerHook('stonesDeposited', { treasuryId, amount, newBalance: treasury.spiritStones });
        return { success: true };
    }

    withdrawStones(treasuryId, amount = 50) {
        const treasury = this.treasuries.get(treasuryId);
        if (!treasury) return { success: false, error: 'TREASURY_NOT_FOUND' };
        treasury.spiritStones -= amount;
        this._triggerHook('stonesWithdrawn', { treasuryId, amount, newBalance: treasury.spiritStones });
        return { success: true };
    }

    addArtifact(treasuryId, artifact) {
        const treasury = this.treasuries.get(treasuryId);
        if (!treasury) return { success: false, error: 'TREASURY_NOT_FOUND' };
        treasury.artifacts.push(artifact);
        this._triggerHook('artifactAdded', { treasuryId, artifact });
        return { success: true };
    }

    lockTreasury(treasuryId) {
        const treasury = this.treasuries.get(treasuryId);
        if (!treasury) return { success: false, error: 'TREASURY_NOT_FOUND' };
        treasury.status = 'abundant';
        this._triggerHook('treasuryLocked', { treasuryId, status: treasury.status });
        return { success: true };
    }

    calculateTreasuryValue(treasuryId) {
        const treasury = this.treasuries.get(treasuryId);
        if (!treasury) return 0;
        return treasury.spiritStones + treasury.gold * 10 + treasury.artifacts.length * 1000;
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
        if (this.stats.totalTreasuries < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTreasuries += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { treasuries: Array.from(this.treasuries.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.treasuries) this.treasuries = new Map(data.treasuries);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, treasuryCount: this.treasuries.size }; }
}
