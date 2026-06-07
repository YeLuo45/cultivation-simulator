/**
 * CultivationLock.js - 修真锁系统
 * V756 Iteration 19/30 Round 30 - Cultivation Lock
 */

export class CultivationLock {
    constructor(config = {}) {
        this.config = { maxLocks: config.maxLocks || 20, baseResistance: config.baseResistance || 20, ...config };
        this.locks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLocks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLock', (ctx) => this.getLock(ctx.lockId));
        this.registerTool('recruitLock', (ctx) => this.recruitLock(ctx));
    }

    recruitLock(data) {
        const id = data.lockId || `lck_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const lock = {
            lockId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Lock',
            type: data.type || 'silver',
            resistance: data.resistance || this.config.baseResistance,
            pins: data.pins || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.locks.set(id, lock);
        this.stats.totalLocks++;
        this._triggerHook('lockRecruited', { lockId: id });
        return { success: true, lock };
    }

    getLock(id) { return this.locks.get(id) ? { ...this.locks.get(id) } : null; }
    listLocks() { return Array.from(this.locks.values()).map(l => ({ ...l })); }
    listByMaster(masterId) { return Array.from(this.locks.values()).filter(l => l.masterId === masterId).map(l => ({ ...l })); }
    listLegendary() { return Array.from(this.locks.values()).filter(l => l.status === 'legendary').map(l => ({ ...l })); }

    addPin(lockId, pin) {
        const lock = this.locks.get(lockId);
        if (!lock) return { success: false, error: 'LOCK_NOT_FOUND' };
        lock.pins.push(pin);
        this._triggerHook('pinAdded', { lockId, pin });
        return { success: true, lock: { ...lock } };
    }

    raiseResistance(lockId, amount = 5) {
        const lock = this.locks.get(lockId);
        if (!lock) return { success: false, error: 'LOCK_NOT_FOUND' };
        lock.resistance += amount;
        this._triggerHook('resistanceRaised', { lockId, newResistance: lock.resistance });
        return { success: true };
    }

    levelUpLock(lockId) {
        const lock = this.locks.get(lockId);
        if (!lock) return { success: false, error: 'LOCK_NOT_FOUND' };
        lock.level++;
        this._triggerHook('lockLeveledUp', { lockId, newLevel: lock.level });
        return { success: true };
    }

    legendLock(lockId) {
        const lock = this.locks.get(lockId);
        if (!lock) return { success: false, error: 'LOCK_NOT_FOUND' };
        lock.status = 'legendary';
        this._triggerHook('lockLegendized', { lockId });
        return { success: true };
    }

    calculateLockValue(lockId) {
        const lock = this.locks.get(lockId);
        if (!lock) return 0;
        return lock.level * 100 + lock.resistance * 2 + lock.pins.length * 30;
    }

    listByType(type) { return Array.from(this.locks.values()).filter(l => l.type === type).map(l => ({ ...l })); }
    listVeteran() { return Array.from(this.locks.values()).filter(l => l.status === 'veteran').map(l => ({ ...l })); }

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
        if (this.stats.totalLocks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLocks += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { locks: Array.from(this.locks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.locks) this.locks = new Map(data.locks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, lockCount: this.locks.size }; }
}
