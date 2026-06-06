/**
 * MountTaming.js - 坐骑系统
 * V450 Iteration 12/15 Round 16
 */
export class MountTaming {
    constructor(config = {}) {
        this.config = { maxMounts: config.maxMounts || 100, baseStamina: config.baseStamina || 50, ...config };
        this.mounts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMounts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMount', (ctx) => this.getMount(ctx.mountId));
        this.registerTool('captureMount', (ctx) => this.captureMount(ctx));
    }

    captureMount(data) {
        const id = data.mountId || `mnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mount = {
            mountId: id,
            riderId: data.riderId,
            name: data.name || 'Wild Mount',
            species: data.species || 'horse',
            speed: data.speed || 10,
            stamina: data.stamina || this.config.baseStamina,
            loyalty: data.loyalty || 20,
            status: data.status || 'wild',
            capturedAt: Date.now()
        };
        this.mounts.set(id, mount);
        this.stats.totalMounts++;
        this._triggerHook('mountCaptured', { mountId: id, riderId: data.riderId });
        return { success: true, mount };
    }

    getMount(id) { return this.mounts.get(id) ? { ...this.mounts.get(id) } : null; }
    listMounts() { return Array.from(this.mounts.values()).map(m => ({ ...m })); }
    listByRider(riderId) { return Array.from(this.mounts.values()).filter(m => m.riderId === riderId).map(m => ({ ...m })); }
    listBySpecies(species) { return Array.from(this.mounts.values()).filter(m => m.species === species).map(m => ({ ...m })); }

    breakMount(mountId, amount = 5) {
        const mount = this.mounts.get(mountId);
        if (!mount) return { success: false, error: 'MOUNT_NOT_FOUND' };
        mount.loyalty = Math.min(100, mount.loyalty + amount);
        if (mount.status === 'wild') mount.status = 'broken';
        this._triggerHook('mountBroken', { mountId, newLoyalty: mount.loyalty });
        return { success: true };
    }

    increaseSpeed(mountId, amount = 2) {
        const mount = this.mounts.get(mountId);
        if (!mount) return { success: false, error: 'MOUNT_NOT_FOUND' };
        mount.speed += amount;
        this._triggerHook('speedIncreased', { mountId, newSpeed: mount.speed });
        return { success: true };
    }

    trainMount(mountId, amount = 10) {
        const mount = this.mounts.get(mountId);
        if (!mount) return { success: false, error: 'MOUNT_NOT_FOUND' };
        mount.stamina += amount;
        this._triggerHook('mountTrained', { mountId, newStamina: mount.stamina });
        return { success: true };
    }

    rideMount(mountId) {
        const mount = this.mounts.get(mountId);
        if (!mount) return { success: false, error: 'MOUNT_NOT_FOUND' };
        mount.status = 'ridden';
        this._triggerHook('mountRidden', { mountId });
        return { success: true };
    }

    calculateMountSpeed(mountId) {
        const mount = this.mounts.get(mountId);
        if (!mount) return 0;
        return mount.speed * (1 + mount.loyalty / 100) + mount.stamina / 10;
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
        if (this.stats.totalMounts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMounts += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mounts: Array.from(this.mounts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mounts) this.mounts = new Map(data.mounts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mountCount: this.mounts.size }; }
}
