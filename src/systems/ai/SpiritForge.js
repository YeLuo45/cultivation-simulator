/**
 * SpiritForge.js - 灵器锻造
 * V499 Iteration 1/20 Round 20
 */
export class SpiritForge {
    constructor(config = {}) {
        this.config = { maxForges: config.maxForges || 100, baseHeat: config.baseHeat || 50, ...config };
        this.forges = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalForges: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getForge', (ctx) => this.getForge(ctx.forgeId));
        this.registerTool('createForge', (ctx) => this.createForge(ctx));
    }

    createForge(data) {
        const id = data.id || `frg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const forge = { forgeId: id, blacksmithId: data.blacksmithId, name: data.name || 'unnamed-forge', type: data.type || 'sword', heat: data.heat || this.config.baseHeat, materials: data.materials || [], items: data.items || [], status: data.status || 'cold', createdAt: Date.now() };
        this.forges.set(id, forge);
        this.stats.totalForges++;
        this._triggerHook('forgeCreated', { forgeId: id });
        return { success: true, forge };
    }

    getForge(id) { return this.forges.get(id) ? { ...this.forges.get(id) } : null; }
    listForges() { return Array.from(this.forges.values()).map(f => ({ ...f })); }
    listByBlacksmith(blacksmithId) { return Array.from(this.forges.values()).filter(f => f.blacksmithId === blacksmithId).map(f => ({ ...f })); }
    listWorking() { return Array.from(this.forges.values()).filter(f => f.status === 'working').map(f => ({ ...f })); }

    addMaterial(forgeId, material) {
        const forge = this.forges.get(forgeId);
        if (!forge) return { success: false, error: 'FORGE_NOT_FOUND' };
        forge.materials.push(material);
        this._triggerHook('materialAdded', { forgeId, material });
        return { success: true };
    }

    increaseHeat(forgeId, amount = 10) {
        const forge = this.forges.get(forgeId);
        if (!forge) return { success: false, error: 'FORGE_NOT_FOUND' };
        forge.heat += amount;
        forge.status = 'heating';
        this._triggerHook('heatIncreased', { forgeId, newHeat: forge.heat });
        return { success: true };
    }

    craftItem(forgeId, item) {
        const forge = this.forges.get(forgeId);
        if (!forge) return { success: false, error: 'FORGE_NOT_FOUND' };
        forge.items.push(item);
        forge.status = 'working';
        this._triggerHook('itemCrafted', { forgeId, item });
        return { success: true };
    }

    coolForge(forgeId) {
        const forge = this.forges.get(forgeId);
        if (!forge) return { success: false, error: 'FORGE_NOT_FOUND' };
        forge.status = 'cold';
        this._triggerHook('forgeCooled', { forgeId });
        return { success: true };
    }

    calculateForgePower(forgeId) {
        const forge = this.forges.get(forgeId);
        if (!forge) return 0;
        return forge.heat * 2 + forge.materials.length * 5 + forge.items.length * 20;
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
        if (this.stats.totalForges < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxForges += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { forges: Array.from(this.forges.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.forges) this.forges = new Map(data.forges);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, forgeCount: this.forges.size }; }
}
