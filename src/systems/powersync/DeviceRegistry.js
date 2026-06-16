/**
 * DeviceRegistry.js - 设备注册表
 * V1166 Round 44 Iter 9/30 Direction A PowerSync Federation (nanobot)
 * 灵感: nanobot deviceId + lastSeen + deviceType tracking
 */

export const DEVICE_TYPES = ['mobile', 'desktop', 'tablet', 'server', 'iot', 'web'];
export const CAPABILITY_GROUPS = ['storage', 'network', 'compute', 'sync', 'display'];

export class DeviceRegistry {
    constructor(config = {}) {
        this.config = { onlineTimeoutMs: 60000, ...config };
        this.devices = new Map();  // id -> { id, type, name, capabilities, lastSeen, registeredAt }
        this.hooks = new Map();
        this.stats = { registered: 0, duplicates: 0, deregistered: 0, heartbeats: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    register(info) {
        if (!info || typeof info.id !== 'string' || !info.id) return false;
        if (this.devices.has(info.id)) {
            this.stats.duplicates++;
            this._emit('duplicate', { id: info.id });
            return false;
        }
        const type = DEVICE_TYPES.includes(info.type) ? info.type : 'web';
        const entry = {
            id: info.id,
            type,
            name: info.name || info.id,
            capabilities: Array.isArray(info.capabilities) ? info.capabilities.slice() : [],
            lastSeen: Date.now(),
            registeredAt: Date.now(),
            meta: info.meta || {},
        };
        this.devices.set(info.id, entry);
        this.stats.registered++;
        this._emit('registered', entry);
        return true;
    }

    heartbeat(id, ts = null) {
        const e = this.devices.get(id);
        if (!e) return false;
        e.lastSeen = ts || Date.now();
        this.stats.heartbeats++;
        this._emit('heartbeat', e);
        return true;
    }

    updateCapabilities(id, caps) {
        const e = this.devices.get(id);
        if (!e) return false;
        if (!Array.isArray(caps)) return false;
        e.capabilities = caps.slice();
        this._emit('capabilities_updated', e);
        return true;
    }

    addCapability(id, cap) {
        const e = this.devices.get(id);
        if (!e) return false;
        if (typeof cap !== 'string' || !cap) return false;
        if (e.capabilities.includes(cap)) return false;
        e.capabilities.push(cap);
        return true;
    }

    removeCapability(id, cap) {
        const e = this.devices.get(id);
        if (!e) return false;
        const idx = e.capabilities.indexOf(cap);
        if (idx < 0) return false;
        e.capabilities.splice(idx, 1);
        return true;
    }

    deregister(id) {
        const e = this.devices.get(id);
        if (!e) return false;
        this.devices.delete(id);
        this.stats.deregistered++;
        this._emit('deregistered', e);
        return true;
    }

    get(id) {
        const e = this.devices.get(id);
        if (!e) return null;
        return { ...e, capabilities: e.capabilities.slice() };
    }
    listAll() { return Array.from(this.devices.values()); }
    listByType(type) {
        if (!DEVICE_TYPES.includes(type)) return [];
        return this.listAll().filter(d => d.type === type);
    }
    listWithCapability(cap) {
        return this.listAll().filter(d => d.capabilities.includes(cap));
    }
    listOnline(timeoutMs = null, now = null) {
        const to = timeoutMs !== null ? timeoutMs : this.config.onlineTimeoutMs;
        const t = now || Date.now();
        return this.listAll().filter(d => (t - d.lastSeen) <= to);
    }
    isOnline(id, timeoutMs = null, now = null) {
        const e = this.devices.get(id);
        if (!e) return false;
        const to = timeoutMs !== null ? timeoutMs : this.config.onlineTimeoutMs;
        const t = now || Date.now();
        return (t - e.lastSeen) <= to;
    }
    getStats() {
        return {
            ...this.stats,
            total: this.devices.size,
            online: this.listOnline().length,
            byType: DEVICE_TYPES.reduce((acc, t) => {
                acc[t] = this.listByType(t).length;
                return acc;
            }, {}),
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.DeviceRegistry = DeviceRegistry;
    globalThis.DEVICE_TYPES = DEVICE_TYPES;
    globalThis.CAPABILITY_GROUPS = CAPABILITY_GROUPS;
}
