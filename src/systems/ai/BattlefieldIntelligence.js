/**
 * BattlefieldIntelligence.js - 战场情报系统
 * V315 Iteration 3/9 Round 4 - Battlefield Intelligence
 */
export class BattlefieldIntelligence {
    constructor(config = {}) {
        this.config = { scanRange: config.scanRange || 100, intelDecay: config.intelDecay || 0.05, ...config };
        this.intel = new Map();
        this.scans = [];
        this.enemies = new Map();
        this.threats = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalScans: 0, totalIntel: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('scanArea', (ctx) => this.scanArea(ctx.cx, ctx.cy, ctx.radius));
        this.registerTool('getIntel', (ctx) => this.getIntel(ctx.id));
    }

    registerEnemy(data) {
        const id = data.id || `en_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const enemy = { enemyId: id, name: data.name || 'Unknown', level: data.level || 1, x: data.x || 0, y: data.y || 0, type: data.type || 'normal' };
        this.enemies.set(id, enemy);
        return { success: true, enemy };
    }

    getEnemy(id) { return this.enemies.get(id) ? { ...this.enemies.get(id) } : null; }

    addThreat(threatData) {
        const id = threatData.id || `thr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const threat = { threatId: id, level: threatData.level || 1, type: threatData.type || 'combat', location: threatData.location || 'unknown', reportedAt: Date.now() };
        this.threats.set(id, threat);
        this._triggerHook('threatAdded', { threatId: id });
        return { success: true, threat };
    }

    getThreat(id) { return this.threats.get(id) ? { ...this.threats.get(id) } : null; }
    listThreats() { return Array.from(this.threats.values()).map(t => ({ ...t })); }
    clearThreat(id) {
        if (!this.threats.has(id)) return { success: false, error: 'THREAT_NOT_FOUND' };
        this.threats.delete(id);
        this._triggerHook('threatCleared', { threatId: id });
        return { success: true };
    }

    scanArea(cx, cy, radius) {
        const found = Array.from(this.enemies.values()).filter(e => {
            const dx = e.x - cx, dy = e.y - cy;
            return Math.sqrt(dx * dx + dy * dy) <= radius;
        });
        const scan = { id: `scn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, cx, cy, radius, found: found.length, timestamp: Date.now() };
        this.scans.push(scan);
        this.stats.totalScans++;
        this._triggerHook('areaScanned', scan);
        return { success: true, found, scan };
    }

    recordIntel(intelData) {
        const id = intelData.id || `int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const intel = { id, source: intelData.source || 'unknown', content: intelData.content || '', reliability: intelData.reliability || 0.5, age: 0, createdAt: Date.now() };
        this.intel.set(id, intel);
        this.stats.totalIntel++;
        this._triggerHook('intelRecorded', { id });
        return { success: true, intel };
    }

    getIntel(id) { return this.intel.get(id) ? { ...this.intel.get(id) } : null; }
    listIntel() { return Array.from(this.intel.values()).map(i => ({ ...i })); }

    applyIntelAging() {
        for (const i of this.intel.values()) {
            i.age = Math.min(1, i.age + this.config.intelDecay);
            i.reliability = Math.max(0, i.reliability - this.config.intelDecay);
        }
        this._triggerHook('intelAged', { time: Date.now() });
        return { success: true };
    }

    getRecentScans(limit = 10) { return this.scans.slice(-limit); }

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
        if (this.stats.totalScans < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.scanRange *= 1.5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { intel: Array.from(this.intel.entries()), scans: this.scans, enemies: Array.from(this.enemies.entries()), threats: Array.from(this.threats.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.intel) this.intel = new Map(data.intel);
        if (data.scans) this.scans = data.scans;
        if (data.enemies) this.enemies = new Map(data.enemies);
        if (data.threats) this.threats = new Map(data.threats);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, intelCount: this.intel.size, enemyCount: this.enemies.size, threatCount: this.threats.size }; }
}