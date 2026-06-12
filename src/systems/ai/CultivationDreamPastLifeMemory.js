/**
 * CultivationDreamPastLifeMemory.js - 修真前世记忆
 * V872 Iteration 6/30 Round 34
 */
export const MEMORY_ERAS = ['ancient', 'classical', 'modern'];
export const FRAGMENT_TYPES = ['emotional', 'visual', 'auditory', 'tactile', 'conceptual', 'spiritual'];
export const SYNTHESIS_RULES = ['chronological', 'thematic', 'causal', 'symbolic', 'emotional'];

export class CultivationDreamPastLifeMemory {
    constructor(config = {}) {
        this.config = { maxMemories: config.maxMemories || 100, fragmentCount: config.fragmentCount || 4, ...config };
        this.memories = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecovered: 0, totalSynthesized: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMemory', (ctx) => this.getMemory(ctx.memoryId));
        this.registerTool('listByEra', (ctx) => this.listByEra(ctx.era));
    }

    recoverMemory(dreamId, era) {
        if (!MEMORY_ERAS.includes(era)) return { success: false, error: 'INVALID_ERA' };
        const id = `memory_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fragments = [];
        const used = new Set();
        for (let i = 0; i < this.config.fragmentCount; i++) {
            let idx = Math.floor(Math.random() * FRAGMENT_TYPES.length);
            let attempts = 0;
            while (used.has(idx) && attempts < 20) { idx = Math.floor(Math.random() * FRAGMENT_TYPES.length); attempts++; }
            used.add(idx);
            fragments.push(FRAGMENT_TYPES[idx]);
        }
        const memory = {
            id, dreamId, era, memoryFragments: fragments,
            linkScore: 0, linkedTo: null, synthesized: false,
            recoveredAt: Date.now()
        };
        this.memories.set(id, memory);
        this.stats.totalRecovered++;
        this._triggerHook('memoryRecovered', { id, dreamId, era });
        return { success: true, memory };
    }

    getMemory(id) { return this.memories.get(id) ? { ...this.memories.get(id) } : null; }
    listMemories() { return Array.from(this.memories.values()).map(m => ({ ...m })); }
    listByEra(era) { return Array.from(this.memories.values()).filter(m => m.era === era).map(m => ({ ...m })); }
    listByDream(dreamId) { return Array.from(this.memories.values()).filter(m => m.dreamId === dreamId).map(m => ({ ...m })); }
    listSynthesized() { return Array.from(this.memories.values()).filter(m => m.synthesized).map(m => ({ ...m })); }

    linkMemory(memoryId, currentLife) {
        const memory = this.memories.get(memoryId);
        if (!memory) return { success: false, error: 'MEMORY_NOT_FOUND' };
        memory.linkedTo = currentLife;
        memory.linkScore = Math.min(1, memory.memoryFragments.length * 0.2);
        memory.linkedAt = Date.now();
        this._triggerHook('memoryLinked', { memoryId, currentLife });
        return { success: true, linkScore: memory.linkScore };
    }

    synthesizeMemories(memoryIds) {
        if (!Array.isArray(memoryIds) || memoryIds.length === 0) return { success: false, error: 'INVALID_INPUT' };
        const valid = memoryIds.filter(id => this.memories.has(id));
        if (valid.length === 0) return { success: false, error: 'NO_VALID_MEMORIES' };
        for (const id of valid) {
            const m = this.memories.get(id);
            m.synthesized = true;
            m.synthesizedAt = Date.now();
        }
        this.stats.totalSynthesized++;
        this._triggerHook('memoriesSynthesized', { memoryIds: valid });
        return { success: true, count: valid.length };
    }

    addFragment(memoryId, fragment) {
        const memory = this.memories.get(memoryId);
        if (!memory) return { success: false, error: 'MEMORY_NOT_FOUND' };
        if (!FRAGMENT_TYPES.includes(fragment)) return { success: false, error: 'INVALID_FRAGMENT' };
        if (!memory.memoryFragments.includes(fragment)) memory.memoryFragments.push(fragment);
        return { success: true };
    }

    raiseLinkScore(memoryId, amount = 0.1) {
        const memory = this.memories.get(memoryId);
        if (!memory) return { success: false, error: 'MEMORY_NOT_FOUND' };
        memory.linkScore = Math.min(1, memory.linkScore + amount);
        return { success: true, linkScore: memory.linkScore };
    }

    deleteMemory(memoryId) {
        if (!this.memories.has(memoryId)) return { success: false, error: 'MEMORY_NOT_FOUND' };
        this.memories.delete(memoryId);
        this._triggerHook('memoryDeleted', { memoryId });
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

    toJSON() { return { memories: Array.from(this.memories.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.memories) this.memories = new Map(data.memories);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, memoryCount: this.memories.size }; }
}
