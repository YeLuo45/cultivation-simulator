/**
 * CalamityWarning.js - 灾难预警
 * V387 Iteration 3/9 Round 12
 */
export class CalamityWarning {
    constructor(config = {}) {
        this.config = { maxWarnings: config.maxWarnings || 50, leadTime: config.leadTime || 86400000, ...config };
        this.warnings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWarnings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWarning', (ctx) => this.getWarning(ctx.warningId));
        this.registerTool('issueWarning', (ctx) => this.issueWarning(ctx));
    }

    issueWarning(data) {
        const id = data.id || `wrn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const warning = { warningId: id, level: data.level || 'yellow', targetRegion: data.targetRegion, targetEvent: data.targetEvent, message: data.message || '', status: 'active', issuedAt: Date.now(), expiresAt: data.expiresAt || Date.now() + this.config.leadTime };
        this.warnings.set(id, warning);
        this.stats.totalWarnings++;
        this._triggerHook('warningIssued', { warningId: id, level: warning.level });
        return { success: true, warning };
    }

    getWarning(id) { return this.warnings.get(id) ? { ...this.warnings.get(id) } : null; }
    listWarnings() { return Array.from(this.warnings.values()).map(w => ({ ...w })); }
    listActive() { return Array.from(this.warnings.values()).filter(w => w.status === 'active').map(w => ({ ...w })); }
    listByLevel(level) { return Array.from(this.warnings.values()).filter(w => w.level === level).map(w => ({ ...w })); }
    listByRegion(region) { return Array.from(this.warnings.values()).filter(w => w.targetRegion === region).map(w => ({ ...w })); }

    escalateLevel(warningId) {
        const warning = this.warnings.get(warningId);
        if (!warning) return { success: false, error: 'WARNING_NOT_FOUND' };
        const levels = ['yellow', 'orange', 'red', 'black'];
        const idx = levels.indexOf(warning.level);
        if (idx >= 0 && idx < levels.length - 1) {
            warning.level = levels[idx + 1];
            this._triggerHook('warningEscalated', { warningId, newLevel: warning.level });
        }
        return { success: true };
    }

    cancelWarning(warningId) {
        const warning = this.warnings.get(warningId);
        if (!warning) return { success: false, error: 'WARNING_NOT_FOUND' };
        warning.status = 'cancelled';
        this._triggerHook('warningCancelled', { warningId });
        return { success: true };
    }

    purgeExpired() {
        const now = Date.now();
        let purged = 0;
        for (const [id, w] of this.warnings) {
            if (w.expiresAt < now) { this.warnings.delete(id); purged++; }
        }
        return { success: true, purged };
    }

    countByLevel() {
        const counts = { yellow: 0, orange: 0, red: 0, black: 0 };
        for (const w of this.warnings.values()) {
            if (counts[w.level] !== undefined) counts[w.level]++;
        }
        return counts;
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
        if (this.stats.totalWarnings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWarnings += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { warnings: Array.from(this.warnings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.warnings) this.warnings = new Map(data.warnings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, warningCount: this.warnings.size }; }
}