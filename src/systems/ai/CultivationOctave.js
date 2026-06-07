/**
 * CultivationOctave.js - 修真八度系统
 * V793 Iteration 26/30 Round 31
 */
export class CultivationOctave {
    constructor(config = {}) {
        this.config = { maxOctaves: config.maxOctaves || 20, baseRange: config.baseRange || 20, ...config };
        this.octaves = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalOctaves: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getOctave', (ctx) => this.getOctave(ctx.octaveId));
        this.registerTool('recruitOctave', (ctx) => this.recruitOctave(ctx));
    }

    recruitOctave(data) {
        const id = data.octaveId || `oct_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const octave = {
            octaveId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Octave',
            type: data.type || 'high',
            range: data.range !== undefined ? data.range : this.config.baseRange,
            tones: data.tones || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.octaves.set(id, octave);
        this.stats.totalOctaves++;
        this._triggerHook('octaveRecruited', { octaveId: id, masterId: octave.masterId });
        return { success: true, octave };
    }

    getOctave(id) { return this.octaves.get(id) ? { ...this.octaves.get(id) } : null; }
    listOctaves() { return Array.from(this.octaves.values()).map(o => ({ ...o })); }
    listByMaster(masterId) { return Array.from(this.octaves.values()).filter(o => o.masterId === masterId).map(o => ({ ...o })); }
    listLegendary() { return Array.from(this.octaves.values()).filter(o => o.status === 'legendary').map(o => ({ ...o })); }

    addTone(octaveId, tone) {
        const octave = this.octaves.get(octaveId);
        if (!octave) return { success: false, error: 'OCTAVE_NOT_FOUND' };
        octave.tones.push(tone);
        this._triggerHook('toneAdded', { octaveId, tone, totalTones: octave.tones.length });
        return { success: true };
    }

    raiseRange(octaveId, amount = 5) {
        const octave = this.octaves.get(octaveId);
        if (!octave) return { success: false, error: 'OCTAVE_NOT_FOUND' };
        octave.range += amount;
        this._triggerHook('rangeRaised', { octaveId, newRange: octave.range });
        return { success: true };
    }

    levelUpOctave(octaveId) {
        const octave = this.octaves.get(octaveId);
        if (!octave) return { success: false, error: 'OCTAVE_NOT_FOUND' };
        octave.level++;
        this._triggerHook('octaveLeveledUp', { octaveId, newLevel: octave.level });
        return { success: true };
    }

    legendOctave(octaveId) {
        const octave = this.octaves.get(octaveId);
        if (!octave) return { success: false, error: 'OCTAVE_NOT_FOUND' };
        octave.status = 'legendary';
        this._triggerHook('octaveLegendized', { octaveId });
        return { success: true };
    }

    calculateOctaveValue(octaveId) {
        const octave = this.octaves.get(octaveId);
        if (!octave) return 0;
        return octave.level * 100 + octave.range * 2 + octave.tones.length * 30;
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
        if (this.stats.totalOctaves < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxOctaves += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { octaves: Array.from(this.octaves.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.octaves) this.octaves = new Map(data.octaves);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, octaveCount: this.octaves.size }; }
}
