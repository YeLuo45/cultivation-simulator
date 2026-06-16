/**
 * MemoryPalace.js - 记忆宫殿
 * V417 Iteration 9/15 Round 14 - Memory Palace
 *
 * 融合6大设计系统:
 * - generic-agent: 记忆宫殿自循环
 * - chatdev: 记忆宫殿角色协调
 * - nanobot: 记忆宫殿mesh
 * - claude-code: 记忆宫殿分析工具
 * - thunderbolt: 记忆宫殿持久化
 * - ruflo: 记忆宫殿Hook
 */

export class MemoryPalace {
    constructor(config = {}) {
        this.config = { maxPalaces: config.maxPalaces || 100, baseRooms: config.baseRooms || 10, baseCapacity: config.baseCapacity || 100, ...config };
        this.palaces = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPalaces: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPalace', (ctx) => this.getPalace(ctx.palaceId));
        this.registerTool('buildPalace', (ctx) => this.buildPalace(ctx));
    }

    buildPalace(data) {
        const id = data.id || `pal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const palace = {
            palaceId: id,
            cultivatorId: data.cultivatorId,
            rooms: data.rooms !== undefined ? data.rooms : this.config.baseRooms,
            hallways: data.hallways !== undefined ? data.hallways : 4,
            brightness: data.brightness !== undefined ? data.brightness : 50,
            capacity: data.capacity !== undefined ? data.capacity : this.config.baseCapacity,
            status: data.status || 'active',
            createdAt: Date.now()
        };
        this.palaces.set(id, palace);
        this.stats.totalPalaces++;
        this._triggerHook('palaceBuilt', { palaceId: id });
        return { success: true, palace };
    }

    getPalace(id) { return this.palaces.get(id) ? { ...this.palaces.get(id) } : null; }
    listPalaces() { return Array.from(this.palaces.values()).map(p => ({ ...p })); }
    listByCultivator(cultivatorId) { return Array.from(this.palaces.values()).filter(p => p.cultivatorId === cultivatorId).map(p => ({ ...p })); }
    listByBrightness(min) { return Array.from(this.palaces.values()).filter(p => p.brightness >= min).map(p => ({ ...p })); }

    addRoom(palaceId, name) {
        const palace = this.palaces.get(palaceId);
        if (!palace) return { success: false, error: 'PALACE_NOT_FOUND' };
        palace.rooms += 1;
        const room = { name: name || `room_${palace.rooms}`, index: palace.rooms };
        this._triggerHook('roomAdded', { palaceId, room });
        return { success: true, room };
    }

    storeMemory(palaceId, memoryId, name) {
        const palace = this.palaces.get(palaceId);
        if (!palace) return { success: false, error: 'PALACE_NOT_FOUND' };
        palace.brightness = Math.min(100, palace.brightness + 5);
        const memory = { memoryId, name: name || `memory_${memoryId}`, storedAt: Date.now() };
        this._triggerHook('memoryStored', { palaceId, memoryId, newBrightness: palace.brightness });
        return { success: true, memory };
    }

    expandPalace(palaceId, amount = 5) {
        const palace = this.palaces.get(palaceId);
        if (!palace) return { success: false, error: 'PALACE_NOT_FOUND' };
        palace.capacity += amount;
        this._triggerHook('palaceExpanded', { palaceId, newCapacity: palace.capacity });
        return { success: true };
    }

    calculateCapacity(palaceId) {
        const palace = this.palaces.get(palaceId);
        if (!palace) return 0;
        return palace.rooms * 10 + palace.capacity;
    }

    listRadiant() { return this.listByBrightness(80); }

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
        if (this.stats.totalPalaces < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPalaces += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { palaces: Array.from(this.palaces.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.palaces) this.palaces = new Map(data.palaces);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, palaceCount: this.palaces.size }; }
}
