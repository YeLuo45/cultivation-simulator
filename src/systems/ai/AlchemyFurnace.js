/**
 * AlchemyFurnace.js - 丹炉系统
 * V326 Iteration 5/9 Round 5
 */
export class AlchemyFurnace {
    constructor(config = {}) {
        this.config = { maxTemperature: config.maxTemperature || 1000, baseFirePower: config.baseFirePower || 50, ...config };
        this.furnaces = new Map();
        this.fires = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFurnaces: 0, totalIgnitions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFurnace', (ctx) => this.getFurnace(ctx.furnaceId));
        this.registerTool('listFurnaces', () => Array.from(this.furnaces.values()).map(f => ({...f})));
    }

    createFurnace(data) {
        const id = data.id || `frn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const furnace = {
            furnaceId: id, name: data.name || 'Unnamed',
            quality: data.quality || 'common', durability: data.durability || 100,
            maxDurability: data.maxDurability || 100, capacity: data.capacity || 5,
            ownerId: data.ownerId, fire: null
        };
        this.furnaces.set(id, furnace);
        this.stats.totalFurnaces++;
        this._triggerHook('furnaceCreated', { furnaceId: id });
        return { success: true, furnace };
    }

    getFurnace(id) { return this.furnaces.get(id) ? { ...this.furnaces.get(id) } : null; }
    listFurnaces() { return Array.from(this.furnaces.values()).map(f => ({ ...f })); }

    ignite(furnaceId, fireType = 'standard') {
        const furnace = this.furnaces.get(furnaceId);
        if (!furnace) return { success: false, error: 'FURNACE_NOT_FOUND' };
        const fireId = `fir_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fire = { fireId, furnaceId, type: fireType, power: this.config.baseFirePower, temperature: 200, ignitedAt: Date.now(), status: 'burning' };
        this.fires.set(fireId, fire);
        furnace.fire = fire;
        this.stats.totalIgnitions++;
        this._triggerHook('furnaceIgnited', { furnaceId, fireId });
        return { success: true, fire };
    }

    getFire(fireId) { return this.fires.get(fireId) ? { ...this.fires.get(fireId) } : null; }
    listFires() { return Array.from(this.fires.values()).map(f => ({ ...f })); }

    adjustTemperature(fireId, targetTemp) {
        const fire = this.fires.get(fireId);
        if (!fire) return { success: false, error: 'FIRE_NOT_FOUND' };
        if (fire.status !== 'burning') return { success: false, error: 'FIRE_INACTIVE' };
        if (targetTemp > this.config.maxTemperature) return { success: false, error: 'TEMPERATURE_TOO_HIGH' };
        fire.temperature = targetTemp;
        this._triggerHook('temperatureAdjusted', { fireId, targetTemp });
        return { success: true, fire: { ...fire } };
    }

    extinguish(fireId) {
        const fire = this.fires.get(fireId);
        if (!fire) return { success: false, error: 'FIRE_NOT_FOUND' };
        fire.status = 'extinguished';
        fire.extinguishedAt = Date.now();
        const furnace = this.furnaces.get(fire.furnaceId);
        if (furnace) furnace.fire = null;
        this._triggerHook('fireExtinguished', { fireId });
        return { success: true };
    }

    damageFurnace(furnaceId, amount) {
        const furnace = this.furnaces.get(furnaceId);
        if (!furnace) return { success: false, error: 'FURNACE_NOT_FOUND' };
        furnace.durability = Math.max(0, furnace.durability - amount);
        if (furnace.durability === 0) {
            this._triggerHook('furnaceDestroyed', { furnaceId });
        }
        return { success: true, furnace: { ...furnace } };
    }

    repairFurnace(furnaceId, amount) {
        const furnace = this.furnaces.get(furnaceId);
        if (!furnace) return { success: false, error: 'FURNACE_NOT_FOUND' };
        furnace.durability = Math.min(furnace.maxDurability, furnace.durability + amount);
        return { success: true, furnace: { ...furnace } };
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
        if (this.stats.totalIgnitions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseFirePower = Math.min(200, this.config.baseFirePower + 10);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { furnaces: Array.from(this.furnaces.entries()), fires: Array.from(this.fires.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.furnaces) this.furnaces = new Map(data.furnaces);
        if (data.fires) this.fires = new Map(data.fires);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, furnaceCount: this.furnaces.size, fireCount: this.fires.size }; }
}