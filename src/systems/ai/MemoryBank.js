/**
 * MemoryBank.js - 记忆存储系统
 * V342 Iteration 3/9 Round 7
 */
export class MemoryBank {
    constructor(config = {}) {
        this.config = { maxMemories: config.maxMemories || 500, baseStrength: config.baseStrength || 0.5, ...config };
        this.memories = new Map();
        this.memoryBatches = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMemories: 0, totalRecalls: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('storeMemory', (ctx) => this.storeMemory(ctx));
        this.registerTool('recallMemory', (ctx) => this.recallMemory(ctx.memoryId));
    }

    storeMemory(data) {
        const id = data.id || `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const memory = { memoryId: id, ownerId: data.ownerId, content: data.content || '', type: data.type || 'event', strength: data.strength || this.config.baseStrength, tags: data.tags || [], createdAt: Date.now(), accessed: 0 };
        this.memories.set(id, memory);
        this.stats.totalMemories++;
        this._triggerHook('memoryStored', { memoryId: id });
        return { success: true, memory };
    }

    getMemory(id) { return this.memories.get(id) ? { ...this.memories.get(id) } : null; }
    listMemories() { return Array.from(this.memories.values()).map(m => ({ ...m })); }
    listByOwner(ownerId) { return Array.from(this.memories.values()).filter(m => m.ownerId === ownerId).map(m => ({ ...m })); }
    listByType(type) { return Array.from(this.memories.values()).filter(m => m.type === type).map(m => ({ ...m })); }
    listByTag(tag) { return Array.from(this.memories.values()).filter(m => m.tags.includes(tag)).map(m => ({ ...m })); }
    listByMinStrength(min) { return Array.from(this.memories.values()).filter(m => m.strength >= min).map(m => ({ ...m })); }

    recallMemory(memoryId) {
        const memory = this.memories.get(memoryId);
        if (!memory) return { success: false, error: 'MEMORY_NOT_FOUND' };
        memory.accessed++;
        this.stats.totalRecalls++;
        this._triggerHook('memoryRecalled', { memoryId });
        return { success: true, memory: { ...memory } };
    }

    strengthenMemory(memoryId, amount) {
        const memory = this.memories.get(memoryId);
        if (!memory) return { success: false, error: 'MEMORY_NOT_FOUND' };
        memory.strength = Math.min(1, memory.strength + amount);
        this._triggerHook('memoryStrengthened', { memoryId, newStrength: memory.strength });
        return { success: true, memory: { ...memory } };
    }

    forgetMemory(memoryId) {
        if (!this.memories.has(memoryId)) return { success: false, error: 'MEMORY_NOT_FOUND' };
        this.memories.delete(memoryId);
        this._triggerHook('memoryForgotten', { memoryId });
        return { success: true };
    }

    createBatch(name) {
        const id = `btc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        this.memoryBatches.set(id, { batchId: id, name, memoryIds: [], createdAt: Date.now() });
        return { success: true, batch: this.memoryBatches.get(id) };
    }

    addToBatch(batchId, memoryId) {
        const batch = this.memoryBatches.get(batchId);
        if (!batch) return { success: false, error: 'BATCH_NOT_FOUND' };
        if (!this.memories.has(memoryId)) return { success: false, error: 'MEMORY_NOT_FOUND' };
        if (!batch.memoryIds.includes(memoryId)) batch.memoryIds.push(memoryId);
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
        if (this.stats.totalMemories < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMemories += 100;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { memories: Array.from(this.memories.entries()), memoryBatches: Array.from(this.memoryBatches.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.memories) this.memories = new Map(data.memories);
        if (data.memoryBatches) this.memoryBatches = new Map(data.memoryBatches);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, memoryCount: this.memories.size, batchCount: this.memoryBatches.size }; }
}