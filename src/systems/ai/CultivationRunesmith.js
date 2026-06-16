/**
 * CultivationRunesmith.js - 修真符文师
 * V767 Iteration 30/30 FINAL Round 30
 */
export class CultivationRunesmith {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxSmiths: config.maxSmiths || 30, baseSkill: config.baseSkill || 20, ...config };
        this.smiths = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalForged: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRunesmith', (ctx) => this.getRunesmith(ctx.runesmithId));
        this.registerTool('listByDiscipline', (ctx) => this.listByDiscipline(ctx.discipline));
    }

    forgeRunesmith(data) {
        const id = data.id || `runesmith_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const smith = {
            runesmithId: id, masterId: data.masterId || 'unknown', name: data.name || 'Unnamed Runesmith',
            type: data.type || 'rune', discipline: data.discipline || 'engraving',
            skill: data.skill || this.config.baseSkill, runes: data.runes || [],
            level: data.level || 1, status: 'novice',
            forgedAt: Date.now(), lastForge: Date.now()
        };
        this.smiths.set(id, smith);
        this.stats.totalForged++;
        this._triggerHook('runesmithForged', { runesmithId: id });
        return { success: true, smith };
    }

    getRunesmith(id) { return this.smiths.get(id) ? { ...this.smiths.get(id) } : null; }
    listRunesmiths() { return Array.from(this.smiths.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.smiths.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listByDiscipline(discipline) { return Array.from(this.smiths.values()).filter(s => s.discipline === discipline).map(s => ({ ...s })); }
    listByType(type) { return Array.from(this.smiths.values()).filter(s => s.type === type).map(s => ({ ...s })); }
    listVeteran() { return Array.from(this.smiths.values()).filter(s => s.status === 'veteran' || s.status === 'legendary').map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.smiths.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }
    listTop(n = 10) { return [...this.listRunesmiths()].sort((a, b) => b.level - a.level).slice(0, n); }

    engraveRune(runesmithId, rune) {
        const smith = this.smiths.get(runesmithId);
        if (!smith) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        smith.runes.push(rune);
        this._triggerHook('runeEngraved', { runesmithId });
        return { success: true };
    }

    raiseSkill(runesmithId, amount = 5) {
        const smith = this.smiths.get(runesmithId);
        if (!smith) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        smith.skill = Math.max(0, smith.skill + amount);
        this._triggerHook('skillRaised', { runesmithId });
        return { success: true };
    }

    promoteRunesmith(runesmithId) {
        const smith = this.smiths.get(runesmithId);
        if (!smith) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        smith.level++;
        this._triggerHook('runesmithPromoted', { runesmithId });
        return { success: true };
    }

    veteranizeRunesmith(runesmithId) {
        const smith = this.smiths.get(runesmithId);
        if (!smith) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        smith.status = 'veteran';
        this._triggerHook('runesmithVeteranized', { runesmithId });
        return { success: true };
    }

    legendizeRunesmith(runesmithId) {
        const smith = this.smiths.get(runesmithId);
        if (!smith) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        smith.status = 'legendary';
        this._triggerHook('runesmithLegendized', { runesmithId });
        return { success: true };
    }

    changeType(runesmithId, newType) {
        const smith = this.smiths.get(runesmithId);
        if (!smith) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        smith.type = newType;
        this._triggerHook('typeChanged', { runesmithId });
        return { success: true };
    }

    changeDiscipline(runesmithId, newDiscipline) {
        const smith = this.smiths.get(runesmithId);
        if (!smith) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        smith.discipline = newDiscipline;
        this._triggerHook('disciplineChanged', { runesmithId });
        return { success: true };
    }

    restRunesmith(runesmithId) {
        const smith = this.smiths.get(runesmithId);
        if (!smith) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        smith.lastForge = Date.now();
        this._triggerHook('runesmithRested', { runesmithId });
        return { success: true };
    }

    calculateRunesmithValue(runesmithId) {
        const smith = this.smiths.get(runesmithId);
        if (!smith) return 0;
        return smith.level * 100 + smith.skill * 2 + smith.runes.length * 30;
    }

    mergeRunesmiths(runesmithId, otherRunesmithId) {
        const smith = this.smiths.get(runesmithId);
        const other = this.smiths.get(otherRunesmithId);
        if (!smith || !other) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        smith.skill = Math.max(smith.skill, other.skill);
        smith.runes = [...smith.runes, ...other.runes];
        this.smiths.delete(otherRunesmithId);
        this._triggerHook('runesmithsMerged', { runesmithId, otherRunesmithId });
        return { success: true };
    }

    deleteRunesmith(runesmithId) {
        if (!this.smiths.has(runesmithId)) return { success: false, error: 'RUNESMITH_NOT_FOUND' };
        this.smiths.delete(runesmithId);
        this._triggerHook('runesmithDeleted', { runesmithId });
        return { success: true };
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
        if (this.stats.totalForged < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { smiths: Array.from(this.smiths.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.smiths) this.smiths = new Map(data.smiths);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, smithCount: this.smiths.size }; }
}