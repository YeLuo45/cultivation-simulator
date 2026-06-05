/**
 * PastLifeMemory.js - 前世记忆
 * V370 Iteration 4/9 Round 10
 */
export class PastLifeMemory {
    constructor(config = {}) {
        this.config = { maxMemories: config.maxMemories || 200, ...config };
        this.lives = new Map();
        this.memories = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMemories: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMemory', (ctx) => this.getMemory(ctx.memoryId));
        this.registerTool('recordMemory', (ctx) => this.recordMemory(ctx.soulId, ctx));
    }

    registerLife(data) {
        const id = data.id || `lf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const life = { lifeId: id, soulId: data.soulId, era: data.era || 'unknown', role: data.role || 'cultivator', createdAt: Date.now() };
        this.lives.set(id, life);
        return { success: true, life };
    }

    getLife(id) { return this.lives.get(id) ? { ...this.lives.get(id) } : null; }
    listLives() { return Array.from(this.lives.values()).map(l => ({ ...l })); }
    listLivesBySoul(soulId) { return Array.from(this.lives.values()).filter(l => l.soulId === soulId).map(l => ({ ...l })); }

    recordMemory(soulId, data) {
        const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const memory = { memoryId: id, soulId, lifeId: data.lifeId, content: data.content || '', clarity: data.clarity || 0.5, year: data.year || 0, createdAt: Date.now() };
        this.memories.set(id, memory);
        this.stats.totalMemories++;
        this._triggerHook('memoryRecorded', { memoryId: id });
        return { success: true, memory };
    }

    getMemory(id) { return this.memories.get(id) ? { ...this.memories.get(id) } : null; }
    listMemories() { return Array.from(this.memories.values()).map(m => ({ ...m })); }
    listBySoul(soulId) { return Array.from(this.memories.values()).filter(m => m.soulId === soulId).map(m => ({ ...m })); }
    listByLife(lifeId) { return Array.from(this.memories.values()).filter(m => m.lifeId === lifeId).map(m => ({ ...m })); }
    listByClarity(minClarity) { return Array.from(this.memories.values()).filter(m => m.clarity >= minClarity).map(m => ({ ...m })); }

    enhanceMemory(memoryId, amount) {
        const memory = this.memories.get(memoryId);
        if (!memory) return { success: false, error: 'MEMORY_NOT_FOUND' };
        memory.clarity = Math.min(1, memory.clarity + amount);
        this._triggerHook('memoryEnhanced', { memoryId });
        return { success: true, memory: { ...memory } };
    }

    clearMemory(memoryId) {
        if (!this.memories.has(memoryId)) return { success: false, error: 'MEMORY_NOT_FOUND' };
        this.memories.delete(memoryId);
        this._triggerHook('memoryCleared', { memoryId });
        return { success: true };
    }

    calculateTotalClarity(soulId) {
        const mems = this.listBySoul(soulId);
        return mems.reduce((sum, m) => sum + m.clarity, 0);
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
        if (this.stats.totalMemories < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMemories += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { lives: Array.from(this.lives.entries()), memories: Array.from(this.memories.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.lives) this.lives = new Map(data.lives);
        if (data.memories) this.memories = new Map(data.memories);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, lifeCount: this.lives.size, memoryCount: this.memories.size }; }
}