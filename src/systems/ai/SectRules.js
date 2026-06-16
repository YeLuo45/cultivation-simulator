/**
 * SectRules.js - 宗规戒律
 * V481 Iteration 13/15 Round 18 - Sect Rules
 */

export class SectRules {
    constructor(config = {}) {
        this.config = { maxRules: config.maxRules || 100, baseSeverity: config.baseSeverity || 1, ...config };
        this.rules = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRules: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRule', (ctx) => this.getRule(ctx.ruleId));
        this.registerTool('enactRule', (ctx) => this.enactRule(ctx));
    }

    enactRule(data) {
        const id = data.ruleId || `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rule = {
            ruleId: id,
            sectId: data.sectId,
            name: data.name,
            severity: data.severity || this.config.baseSeverity,
            violations: data.violations || [],
            punishments: data.punishments || [],
            status: 'active',
            createdAt: Date.now()
        };
        this.rules.set(id, rule);
        this.stats.totalRules++;
        this._triggerHook('ruleEnacted', { ruleId: id });
        return { success: true, rule };
    }

    getRule(id) { return this.rules.get(id) ? { ...this.rules.get(id) } : null; }
    listRules() { return Array.from(this.rules.values()).map(r => ({ ...r })); }
    listBySect(sectId) { return Array.from(this.rules.values()).filter(r => r.sectId === sectId).map(r => ({ ...r })); }
    listActive() { return Array.from(this.rules.values()).filter(r => r.status === 'active').map(r => ({ ...r })); }

    recordViolation(ruleId, member) {
        const rule = this.rules.get(ruleId);
        if (!rule) return { success: false, error: 'RULE_NOT_FOUND' };
        rule.violations.push({ member, timestamp: Date.now() });
        this._triggerHook('violationRecorded', { ruleId, member });
        return { success: true };
    }

    addPunishment(ruleId, punishment) {
        const rule = this.rules.get(ruleId);
        if (!rule) return { success: false, error: 'RULE_NOT_FOUND' };
        rule.punishments.push(punishment);
        this._triggerHook('punishmentAdded', { ruleId, punishment });
        return { success: true };
    }

    revokeRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (!rule) return { success: false, error: 'RULE_NOT_FOUND' };
        rule.status = 'inactive';
        this._triggerHook('ruleRevoked', { ruleId });
        return { success: true };
    }

    calculateRuleSeverity(ruleId) {
        const rule = this.rules.get(ruleId);
        if (!rule) return 0;
        return rule.severity * 10 + rule.violations.length * 5 + rule.punishments.length * 3;
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
        if (this.stats.totalRules < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRules += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rules: Array.from(this.rules.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rules) this.rules = new Map(data.rules);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ruleCount: this.rules.size }; }
}
