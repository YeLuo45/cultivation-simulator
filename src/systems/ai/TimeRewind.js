/**
 * TimeRewind.js - 时光回溯系统
 * V356 Iteration 8/9 Round 8
 */
export class TimeRewind {
    constructor(config = {}) {
        this.config = { maxSnapshots: config.maxSnapshots || 50, ...config };
        this.snapshots = new Map();
        this.cultivators = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSnapshots: 0, totalRewinds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSnapshot', (ctx) => this.getSnapshot(ctx.snapshotId));
        this.registerTool('capture', (ctx) => this.capture(ctx.cultivatorId, ctx.state));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', createdAt: Date.now() };
        this.cultivators.set(id, cultivator);
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }

    capture(cultivatorId, state) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const id = `snp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const snapshot = { snapshotId: id, cultivatorId, state: { ...state }, capturedAt: Date.now() };
        this.snapshots.set(id, snapshot);
        this.stats.totalSnapshots++;
        if (this.snapshots.size > this.config.maxSnapshots) {
            const oldest = Array.from(this.snapshots.entries()).sort((a, b) => a[1].capturedAt - b[1].capturedAt)[0];
            this.snapshots.delete(oldest[0]);
        }
        this._triggerHook('snapshotCaptured', { snapshotId: id });
        return { success: true, snapshot };
    }

    rewind(snapshotId) {
        const snapshot = this.snapshots.get(snapshotId);
        if (!snapshot) return { success: false, error: 'SNAPSHOT_NOT_FOUND' };
        this.stats.totalRewinds++;
        this._triggerHook('timeRewound', { cultivatorId: snapshot.cultivatorId, snapshotId });
        return { success: true, state: { ...snapshot.state } };
    }

    getSnapshot(id) { return this.snapshots.get(id) ? { ...this.snapshots.get(id) } : null; }
    listSnapshots() { return Array.from(this.snapshots.values()).map(s => ({ ...s })); }
    listByCultivator(cultivatorId) { return Array.from(this.snapshots.values()).filter(s => s.cultivatorId === cultivatorId).map(s => ({ ...s })); }

    compareSnapshots(id1, id2) {
        const s1 = this.snapshots.get(id1);
        const s2 = this.snapshots.get(id2);
        if (!s1 || !s2) return null;
        const diff = {};
        const allKeys = new Set([...Object.keys(s1.state), ...Object.keys(s2.state)]);
        for (const key of allKeys) {
            if (s1.state[key] !== s2.state[key]) diff[key] = { from: s1.state[key], to: s2.state[key] };
        }
        return diff;
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
        if (this.stats.totalSnapshots < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSnapshots += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { snapshots: Array.from(this.snapshots.entries()), cultivators: Array.from(this.cultivators.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.snapshots) this.snapshots = new Map(data.snapshots);
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, snapshotCount: this.snapshots.size, cultivatorCount: this.cultivators.size }; }
}