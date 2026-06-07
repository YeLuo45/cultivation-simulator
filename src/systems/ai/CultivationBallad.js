/**
 * CultivationBallad.js - 修真歌谣
 * V779 Iteration 12/30 Round 31 - Cultivation Ballad
 */
export class CultivationBallad {
    constructor(config = {}) {
        this.config = { maxBallads: config.maxBallads || 20, baseTune: config.baseTune || 20, ...config };
        this.ballads = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBallads: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBallad', (ctx) => this.getBallad(ctx.balladId));
        this.registerTool('recruitBallad', (ctx) => this.recruitBallad(ctx));
    }

    recruitBallad(data) {
        const id = data.id || `bld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ballad = {
            balladId: id,
            masterId: data.masterId,
            name: data.name || 'Untitled Ballad',
            type: data.type || 'folk',
            tune: data.tune || this.config.baseTune,
            verses: data.verses || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.ballads.set(id, ballad);
        this.stats.totalBallads++;
        this._triggerHook('balladRecruited', { balladId: id });
        return { success: true, ballad };
    }

    getBallad(id) { return this.ballads.get(id) ? { ...this.ballads.get(id) } : null; }
    listBallads() { return Array.from(this.ballads.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.ballads.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.ballads.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addVerse(balladId, verse) {
        const ballad = this.ballads.get(balladId);
        if (!ballad) return { success: false, error: 'BALLAD_NOT_FOUND' };
        ballad.verses.push(verse);
        this._triggerHook('verseAdded', { balladId, verse });
        return { success: true };
    }

    raiseTune(balladId, amount = 5) {
        const ballad = this.ballads.get(balladId);
        if (!ballad) return { success: false, error: 'BALLAD_NOT_FOUND' };
        ballad.tune += amount;
        this._triggerHook('tuneRaised', { balladId, newTune: ballad.tune });
        return { success: true };
    }

    levelUpBallad(balladId) {
        const ballad = this.ballads.get(balladId);
        if (!ballad) return { success: false, error: 'BALLAD_NOT_FOUND' };
        ballad.level++;
        this._triggerHook('balladLeveledUp', { balladId, newLevel: ballad.level });
        return { success: true };
    }

    legendBallad(balladId) {
        const ballad = this.ballads.get(balladId);
        if (!ballad) return { success: false, error: 'BALLAD_NOT_FOUND' };
        ballad.status = 'legendary';
        this._triggerHook('balladLegendized', { balladId });
        return { success: true };
    }

    calculateBalladValue(balladId) {
        const ballad = this.ballads.get(balladId);
        if (!ballad) return 0;
        return ballad.level * 100 + ballad.tune * 2 + ballad.verses.length * 30;
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
        if (this.stats.totalBallads < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBallads += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ballads: Array.from(this.ballads.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ballads) this.ballads = new Map(data.ballads);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, balladCount: this.ballads.size }; }
}
