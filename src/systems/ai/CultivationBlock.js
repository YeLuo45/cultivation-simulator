/**
 * CultivationBlock.js - 修真格挡系统
 * V735 Iteration 28/30 Round 29
 */
export class CultivationBlock {
    constructor(config = {}) {
        this.config = { maxBlocks: config.maxBlocks || 30, baseResistance: config.baseResistance || 20, ...config };
        this.blocks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBlocks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBlock', (ctx) => this.getBlock(ctx.blockId));
        this.registerTool('recruitBlock', (ctx) => this.recruitBlock(ctx));
    }

    recruitBlock(data) {
        const id = data.blockId || `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const block = {
            blockId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'shield',
            resistance: data.resistance || this.config.baseResistance,
            guards: data.guards || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.blocks.set(id, block);
        this.stats.totalBlocks++;
        this._triggerHook('blockRecruited', { blockId: id });
        return { success: true, block };
    }

    getBlock(id) { return this.blocks.get(id) ? { ...this.blocks.get(id) } : null; }
    listBlocks() { return Array.from(this.blocks.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.blocks.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.blocks.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addGuard(blockId, guard) {
        const block = this.blocks.get(blockId);
        if (!block) return { success: false, error: 'BLOCK_NOT_FOUND' };
        block.guards.push(guard);
        this._triggerHook('guardAdded', { blockId, guard });
        return { success: true };
    }

    raiseResistance(blockId, amount = 5) {
        const block = this.blocks.get(blockId);
        if (!block) return { success: false, error: 'BLOCK_NOT_FOUND' };
        block.resistance += amount;
        this._triggerHook('resistanceRaised', { blockId, newResistance: block.resistance });
        return { success: true };
    }

    levelUpBlock(blockId) {
        const block = this.blocks.get(blockId);
        if (!block) return { success: false, error: 'BLOCK_NOT_FOUND' };
        block.level++;
        this._triggerHook('blockLeveledUp', { blockId, newLevel: block.level });
        return { success: true };
    }

    legendBlock(blockId) {
        const block = this.blocks.get(blockId);
        if (!block) return { success: false, error: 'BLOCK_NOT_FOUND' };
        block.status = 'legendary';
        this._triggerHook('blockLegendized', { blockId });
        return { success: true };
    }

    calculateBlockValue(blockId) {
        const block = this.blocks.get(blockId);
        if (!block) return 0;
        return block.level * 100 + block.resistance * 2 + block.guards.length * 30;
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
        if (this.stats.totalBlocks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBlocks += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { blocks: Array.from(this.blocks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.blocks) this.blocks = new Map(data.blocks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, blockCount: this.blocks.size }; }
}
