/**
 * MapCartography.js - 地图绘制系统
 * V335 Iteration 5/9 Round 6
 */
export class MapCartography {
    constructor(config = {}) {
        this.config = { maxMaps: config.maxMaps || 50, ...config };
        this.maps = new Map();
        this.regions = new Map();
        this.connections = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMaps: 0, totalRegions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMap', (ctx) => this.getMap(ctx.mapId));
        this.registerTool('listMaps', () => Array.from(this.maps.values()).map(m => ({...m})));
    }

    createMap(data) {
        const id = data.id || `map_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const map = { mapId: id, name: data.name || 'Unnamed', scale: data.scale || 'continent', explored: 0, total: data.total || 100, createdAt: Date.now() };
        this.maps.set(id, map);
        this.connections.set(id, []);
        this.stats.totalMaps++;
        this._triggerHook('mapCreated', { mapId: id });
        return { success: true, map };
    }

    getMap(id) { return this.maps.get(id) ? { ...this.maps.get(id) } : null; }
    listMaps() { return Array.from(this.maps.values()).map(m => ({ ...m })); }

    addRegion(mapId, regionData) {
        const map = this.maps.get(mapId);
        if (!map) return { success: false, error: 'MAP_NOT_FOUND' };
        const id = regionData.id || `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const region = { regionId: id, mapId, name: regionData.name || 'Unnamed', x: regionData.x || 0, y: regionData.y || 0, type: regionData.type || 'unknown' };
        this.regions.set(id, region);
        this.stats.totalRegions++;
        this._triggerHook('regionAdded', { mapId, regionId: id });
        return { success: true, region };
    }

    getRegion(id) { return this.regions.get(id) ? { ...this.regions.get(id) } : null; }
    listRegions(mapId) { return Array.from(this.regions.values()).filter(r => r.mapId === mapId).map(r => ({ ...r })); }

    connectRegions(mapId, regionA, regionB) {
        if (!this.maps.has(mapId)) return { success: false, error: 'MAP_NOT_FOUND' };
        if (!this.regions.has(regionA) || !this.regions.has(regionB)) return { success: false, error: 'REGION_NOT_FOUND' };
        if (!this.connections.has(mapId)) this.connections.set(mapId, []);
        const conns = this.connections.get(mapId);
        if (!conns.some(c => c.a === regionA && c.b === regionB)) {
            conns.push({ a: regionA, b: regionB });
        }
        this._triggerHook('regionsConnected', { mapId, regionA, regionB });
        return { success: true };
    }

    getConnections(mapId) { return this.connections.get(mapId) || []; }

    exploreRegion(mapId, amount) {
        const map = this.maps.get(mapId);
        if (!map) return { success: false, error: 'MAP_NOT_FOUND' };
        map.explored = Math.min(map.total, map.explored + amount);
        this._triggerHook('regionExplored', { mapId, explored: map.explored });
        return { success: true, explored: map.explored };
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
        if (this.stats.totalMaps < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMaps += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { maps: Array.from(this.maps.entries()), regions: Array.from(this.regions.entries()), connections: Array.from(this.connections.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.maps) this.maps = new Map(data.maps);
        if (data.regions) this.regions = new Map(data.regions);
        if (data.connections) this.connections = new Map(data.connections);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mapCount: this.maps.size, regionCount: this.regions.size }; }
}