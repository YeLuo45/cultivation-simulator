/**
 * CultivationDevice.js - 修真装置系统
 * V574 Iteration 17/20 Round 23
 */
export class CultivationDevice {
    constructor(config = {}) {
        this.config = { maxDevices: config.maxDevices || 50, baseSensitivity: config.baseSensitivity || 20, ...config };
        this.devices = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDevices: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDevice', (ctx) => this.getDevice(ctx.deviceId));
        this.registerTool('buildDevice', (ctx) => this.buildDevice(ctx));
    }

    buildDevice(data) {
        const id = data.id || `dev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const device = {
            deviceId: id,
            inventorId: data.inventorId,
            name: data.name || 'Unnamed Device',
            type: data.type || 'sensor',
            sensitivity: data.sensitivity || this.config.baseSensitivity,
            modules: data.modules || [],
            level: 1,
            status: 'offline',
            builtAt: Date.now()
        };
        this.devices.set(id, device);
        this.stats.totalDevices++;
        this._triggerHook('deviceBuilt', { deviceId: id });
        return { success: true, device };
    }

    getDevice(id) { return this.devices.get(id) ? { ...this.devices.get(id) } : null; }
    listDevices() { return Array.from(this.devices.values()).map(d => ({ ...d })); }
    listByInventor(inventorId) { return Array.from(this.devices.values()).filter(d => d.inventorId === inventorId).map(d => ({ ...d })); }
    listQuantum() { return Array.from(this.devices.values()).filter(d => d.status === 'quantum').map(d => ({ ...d })); }

    addModule(deviceId, module) {
        const device = this.devices.get(deviceId);
        if (!device) return { success: false, error: 'DEVICE_NOT_FOUND' };
        device.modules.push(module);
        this._triggerHook('moduleAdded', { deviceId, module });
        return { success: true };
    }

    increaseSensitivity(deviceId, amount = 5) {
        const device = this.devices.get(deviceId);
        if (!device) return { success: false, error: 'DEVICE_NOT_FOUND' };
        device.sensitivity += amount;
        this._triggerHook('sensitivityIncreased', { deviceId, newSensitivity: device.sensitivity });
        return { success: true };
    }

    levelUpDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) return { success: false, error: 'DEVICE_NOT_FOUND' };
        device.level++;
        this._triggerHook('deviceLeveledUp', { deviceId, newLevel: device.level });
        return { success: true };
    }

    quantumDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) return { success: false, error: 'DEVICE_NOT_FOUND' };
        device.status = 'quantum';
        this._triggerHook('deviceQuantized', { deviceId });
        return { success: true };
    }

    calculateDeviceValue(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) return 0;
        return device.level * 100 + device.sensitivity * 2 + device.modules.length * 30;
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
        if (this.stats.totalDevices < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDevices += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { devices: Array.from(this.devices.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.devices) this.devices = new Map(data.devices);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, deviceCount: this.devices.size }; }
}
