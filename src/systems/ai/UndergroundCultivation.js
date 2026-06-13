/**
 * UndergroundCultivation.js - 地下探索系统
 * V467 Iteration 14/15 Round 17
 */
export class UndergroundCultivation {
    constructor(config = {}) {
        this.config = { maxCaves: config.maxCaves || 50, baseDarkness: config.baseDarkness || 100, ...config };
        this.caves = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCaves: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCave', (ctx) => this.getCave(ctx.caveId));
        this.registerTool('enterCave', (ctx) => this.enterCave(ctx));
    }

    enterCave(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cave = {
            caveId: id,
            explorerId: data.explorerId,
            name: data.name || 'Unnamed Cave',
            depth: 0,
            darkness: this.config.baseDarkness,
            creatures: [],
            treasures: [],
            status: 'unexplored',
            enteredAt: Date.now()
        };
        this.caves.set(id, cave);
        this.stats.totalCaves++;
        this._triggerHook('caveEntered', { caveId: id });
        return { success: true, cave };
    }

    getCave(id) { return this.caves.get(id) ? { ...this.caves.get(id) } : null; }
    listCaves() { return Array.from(this.caves.values()).map(c => ({ ...c })); }
    listByExplorer(explorerId) { return Array.from(this.caves.values()).filter(c => c.explorerId === explorerId).map(c => ({ ...c })); }
    listMapped() { return Array.from(this.caves.values()).filter(c => c.status === 'mapped' || c.status === 'conquered').map(c => ({ ...c })); }

    deepenCave(caveId, amount = 10) {
        const cave = this.caves.get(caveId);
        if (!cave) return { success: false, error: 'CAVE_NOT_FOUND' };
        cave.depth += amount;
        if (cave.status === 'unexplored') cave.status = 'mapped';
        this._triggerHook('caveDeepened', { caveId, newDepth: cave.depth });
        return { success: true };
    }

    lightUp(caveId, amount = 5) {
        const cave = this.caves.get(caveId);
        if (!cave) return { success: false, error: 'CAVE_NOT_FOUND' };
        cave.darkness = Math.max(0, cave.darkness - amount);
        this._triggerHook('lightIncreased', { caveId, newDarkness: cave.darkness });
        return { success: true };
    }

    encounterCreature(caveId, creature) {
        const cave = this.caves.get(caveId);
        if (!cave) return { success: false, error: 'CAVE_NOT_FOUND' };
        cave.creatures.push(creature);
        if (cave.status === 'unexplored') cave.status = 'mapped';
        this._triggerHook('creatureEncountered', { caveId, creature });
        return { success: true };
    }

    findTreasure(caveId, treasure) {
        const cave = this.caves.get(caveId);
        if (!cave) return { success: false, error: 'CAVE_NOT_FOUND' };
        cave.treasures.push(treasure);
        if (cave.status === 'unexplored') cave.status = 'mapped';
        this._triggerHook('treasureFound', { caveId, treasure });
        return { success: true };
    }

    conquerCave(caveId) {
        const cave = this.caves.get(caveId);
        if (!cave) return { success: false, error: 'CAVE_NOT_FOUND' };
        cave.status = 'conquered';
        this._triggerHook('caveConquered', { caveId });
        return { success: true };
    }

    calculateDepthPower(caveId) {
        const cave = this.caves.get(caveId);
        if (!cave) return 0;
        return cave.depth * 2 + cave.treasures.length * 5 + (100 - cave.darkness) / 10;
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
        if (this.stats.totalCaves < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCaves += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { caves: Array.from(this.caves.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.caves) this.caves = new Map(data.caves);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, caveCount: this.caves.size }; }
}
