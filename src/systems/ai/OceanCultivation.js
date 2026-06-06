/**
 * OceanCultivation.js - 海洋修真系统
 * V465 Iteration 12/15 Round 17
 */
export class OceanCultivation {
    constructor(config = {}) {
        this.config = { maxZones: config.maxZones || 100, baseDepth: config.baseDepth || 100, ...config };
        this.zones = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalZones: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getZone', (ctx) => this.getZone(ctx.zoneId));
        this.registerTool('enterZone', (ctx) => this.enterZone(ctx));
    }

    enterZone(data) {
        const id = data.id || `oc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const zone = { zoneId: id, cultivatorId: data.cultivatorId, name: data.name || 'Unnamed Ocean Zone', depth: this.config.baseDepth, creatures: [], pearls: [], currents: data.currents || 1, status: 'calm', enteredAt: Date.now() };
        this.zones.set(id, zone);
        this.stats.totalZones++;
        this._triggerHook('zoneEntered', { zoneId: id });
        return { success: true, zone };
    }

    getZone(id) { return this.zones.get(id) ? { ...this.zones.get(id) } : null; }
    listZones() { return Array.from(this.zones.values()).map(z => ({ ...z })); }
    listByCultivator(cultivatorId) { return Array.from(this.zones.values()).filter(z => z.cultivatorId === cultivatorId).map(z => ({ ...z })); }

    diveDeeper(zoneId, amount = 10) {
        const zone = this.zones.get(zoneId);
        if (!zone) return { success: false, error: 'ZONE_NOT_FOUND' };
        zone.depth += amount;
        this._triggerHook('zoneDived', { zoneId, newDepth: zone.depth });
        return { success: true };
    }

    catchCreature(zoneId, creature) {
        const zone = this.zones.get(zoneId);
        if (!zone) return { success: false, error: 'ZONE_NOT_FOUND' };
        zone.creatures.push(creature);
        this._triggerHook('creatureCaught', { zoneId, creature });
        return { success: true };
    }

    collectPearl(zoneId, pearl) {
        const zone = this.zones.get(zoneId);
        if (!zone) return { success: false, error: 'ZONE_NOT_FOUND' };
        zone.pearls.push(pearl);
        this._triggerHook('pearlCollected', { zoneId, pearl });
        return { success: true };
    }

    calmZone(zoneId) {
        const zone = this.zones.get(zoneId);
        if (!zone) return { success: false, error: 'ZONE_NOT_FOUND' };
        zone.status = 'calm';
        this._triggerHook('zoneCalmed', { zoneId });
        return { success: true };
    }

    calculateOceanPower(zoneId) {
        const zone = this.zones.get(zoneId);
        if (!zone) return 0;
        return zone.depth * 2 + zone.creatures.length * 3 + zone.pearls.length * 5;
    }

    listActive() { return Array.from(this.zones.values()).filter(z => z.status !== 'tranquil').map(z => ({ ...z })); }

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
        if (this.stats.totalZones < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxZones += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { zones: Array.from(this.zones.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.zones) this.zones = new Map(data.zones);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, zoneCount: this.zones.size }; }
}
