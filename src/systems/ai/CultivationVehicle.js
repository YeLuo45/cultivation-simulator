/**
 * CultivationVehicle.js - 修真车
 * V567 Iteration 10/20 Round 23
 */
export class CultivationVehicle {
    constructor(config = {}) {
        this.config = { maxVehicles: config.maxVehicles || 50, baseSpeed: config.baseSpeed || 20, ...config };
        this.vehicles = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVehicles: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVehicle', (ctx) => this.getVehicle(ctx.vehicleId));
        this.registerTool('craftVehicle', (ctx) => this.craftVehicle(ctx));
    }

    craftVehicle(data) {
        const id = data.vehicleId || `veh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const vehicle = {
            vehicleId: id,
            ownerId: data.ownerId,
            name: data.name || 'Mystic Carriage',
            type: data.type || 'carriage',
            speed: data.speed || this.config.baseSpeed,
            parts: data.parts || [],
            level: 1,
            status: 'idle',
            craftedAt: Date.now()
        };
        this.vehicles.set(id, vehicle);
        this.stats.totalVehicles++;
        this._triggerHook('vehicleCrafted', { vehicleId: id, ownerId: data.ownerId });
        return { success: true, vehicle };
    }

    getVehicle(id) { return this.vehicles.get(id) ? { ...this.vehicles.get(id) } : null; }
    listVehicles() { return Array.from(this.vehicles.values()).map(v => ({ ...v })); }
    listByOwner(ownerId) { return Array.from(this.vehicles.values()).filter(v => v.ownerId === ownerId).map(v => ({ ...v })); }
    listLegendary() { return Array.from(this.vehicles.values()).filter(v => v.status === 'legendary').map(v => ({ ...v })); }

    addPart(vehicleId, part) {
        const vehicle = this.vehicles.get(vehicleId);
        if (!vehicle) return { success: false, error: 'VEHICLE_NOT_FOUND' };
        vehicle.parts.push(part);
        this._triggerHook('partAdded', { vehicleId, part, partCount: vehicle.parts.length });
        return { success: true };
    }

    increaseSpeed(vehicleId, amount = 5) {
        const vehicle = this.vehicles.get(vehicleId);
        if (!vehicle) return { success: false, error: 'VEHICLE_NOT_FOUND' };
        vehicle.speed += amount;
        this._triggerHook('speedIncreased', { vehicleId, newSpeed: vehicle.speed });
        return { success: true };
    }

    levelUpVehicle(vehicleId) {
        const vehicle = this.vehicles.get(vehicleId);
        if (!vehicle) return { success: false, error: 'VEHICLE_NOT_FOUND' };
        vehicle.level++;
        this._triggerHook('vehicleLeveledUp', { vehicleId, newLevel: vehicle.level });
        return { success: true };
    }

    legendVehicle(vehicleId) {
        const vehicle = this.vehicles.get(vehicleId);
        if (!vehicle) return { success: false, error: 'VEHICLE_NOT_FOUND' };
        vehicle.status = 'legendary';
        this._triggerHook('vehicleLegendized', { vehicleId });
        return { success: true };
    }

    calculateVehicleValue(vehicleId) {
        const vehicle = this.vehicles.get(vehicleId);
        if (!vehicle) return 0;
        return vehicle.level * 100 + vehicle.speed * 2 + vehicle.parts.length * 30;
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
        if (this.stats.totalVehicles < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxVehicles += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { vehicles: Array.from(this.vehicles.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.vehicles) this.vehicles = new Map(data.vehicles);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, vehicleCount: this.vehicles.size }; }
}
