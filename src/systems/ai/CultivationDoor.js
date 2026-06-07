/**
 * CultivationDoor.js - 修真门系统
 * V753 Iteration 16/30 Round 30 - Cultivation Door
 */

export class CultivationDoor {
    constructor(config = {}) {
        this.config = { maxDoors: config.maxDoors || 20, baseMystery: config.baseMystery || 20, ...config };
        this.doors = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDoors: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDoor', (ctx) => this.getDoor(ctx.doorId));
        this.registerTool('recruitDoor', (ctx) => this.recruitDoor(ctx));
    }

    recruitDoor(data) {
        const id = data.doorId || `dor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const door = {
            doorId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Door',
            type: data.type || 'wooden',
            mystery: data.mystery || this.config.baseMystery,
            hinges: data.hinges || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.doors.set(id, door);
        this.stats.totalDoors++;
        this._triggerHook('doorRecruited', { doorId: id });
        return { success: true, door };
    }

    getDoor(id) { return this.doors.get(id) ? { ...this.doors.get(id) } : null; }
    listDoors() { return Array.from(this.doors.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.doors.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.doors.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addHinge(doorId, hinge) {
        const door = this.doors.get(doorId);
        if (!door) return { success: false, error: 'DOOR_NOT_FOUND' };
        door.hinges.push(hinge);
        this._triggerHook('hingeAdded', { doorId, hinge });
        return { success: true, door: { ...door } };
    }

    raiseMystery(doorId, amount = 5) {
        const door = this.doors.get(doorId);
        if (!door) return { success: false, error: 'DOOR_NOT_FOUND' };
        door.mystery += amount;
        this._triggerHook('mysteryRaised', { doorId, newMystery: door.mystery });
        return { success: true };
    }

    levelUpDoor(doorId) {
        const door = this.doors.get(doorId);
        if (!door) return { success: false, error: 'DOOR_NOT_FOUND' };
        door.level++;
        this._triggerHook('doorLeveledUp', { doorId, newLevel: door.level });
        return { success: true };
    }

    legendDoor(doorId) {
        const door = this.doors.get(doorId);
        if (!door) return { success: false, error: 'DOOR_NOT_FOUND' };
        door.status = 'legendary';
        this._triggerHook('doorLegendized', { doorId });
        return { success: true };
    }

    calculateDoorValue(doorId) {
        const door = this.doors.get(doorId);
        if (!door) return 0;
        return door.level * 100 + door.mystery * 2 + door.hinges.length * 30;
    }

    listByType(type) { return Array.from(this.doors.values()).filter(d => d.type === type).map(d => ({ ...d })); }
    listVeteran() { return Array.from(this.doors.values()).filter(d => d.status === 'veteran').map(d => ({ ...d })); }

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
        if (this.stats.totalDoors < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDoors += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { doors: Array.from(this.doors.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.doors) this.doors = new Map(data.doors);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, doorCount: this.doors.size }; }
}
