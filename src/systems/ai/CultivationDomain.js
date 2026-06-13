/**
 * CultivationDomain.js - 修真领域系统
 * V585 Iteration 8/20 Round 24
 */
export class CultivationDomain {
    constructor(config = {}) {
        this.config = { maxDomains: config.maxDomains || 30, basePower: config.basePower || 20, ...config };
        this.domains = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDomains: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDomain', (ctx) => this.getDomain(ctx.domainId));
        this.registerTool('openDomain', (ctx) => this.openDomain(ctx));
    }

    openDomain(data) {
        if (this.domains.size >= this.config.maxDomains) return { success: false, error: 'MAX_DOMAINS_REACHED' };
        const id = data.domainId || `dom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const domain = {
            domainId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'neutral',
            power: data.power || this.config.basePower,
            rules: data.rules || [],
            level: 1,
            status: 'forming',
            createdAt: Date.now()
        };
        this.domains.set(id, domain);
        this.stats.totalDomains++;
        this._triggerHook('domainOpened', { domainId: id });
        return { success: true, domain };
    }

    getDomain(id) { return this.domains.get(id) ? { ...this.domains.get(id) } : null; }
    listDomains() { return Array.from(this.domains.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.domains.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listStable() { return Array.from(this.domains.values()).filter(d => d.status === 'stable' || d.status === 'eternal').map(d => ({ ...d })); }

    addRule(domainId, rule) {
        const domain = this.domains.get(domainId);
        if (!domain) return { success: false, error: 'DOMAIN_NOT_FOUND' };
        domain.rules.push(rule);
        this._triggerHook('ruleAdded', { domainId, rule });
        return { success: true };
    }

    increasePower(domainId, amount = 5) {
        const domain = this.domains.get(domainId);
        if (!domain) return { success: false, error: 'DOMAIN_NOT_FOUND' };
        domain.power += amount;
        if (domain.status === 'forming' && domain.power >= this.config.basePower * 2) domain.status = 'stable';
        this._triggerHook('powerIncreased', { domainId, newPower: domain.power });
        return { success: true };
    }

    levelUpDomain(domainId) {
        const domain = this.domains.get(domainId);
        if (!domain) return { success: false, error: 'DOMAIN_NOT_FOUND' };
        domain.level++;
        this._triggerHook('domainLeveledUp', { domainId, newLevel: domain.level });
        return { success: true };
    }

    eternizeDomain(domainId) {
        const domain = this.domains.get(domainId);
        if (!domain) return { success: false, error: 'DOMAIN_NOT_FOUND' };
        domain.status = 'eternal';
        this._triggerHook('domainEternalized', { domainId });
        return { success: true };
    }

    calculateDomainValue(domainId) {
        const domain = this.domains.get(domainId);
        if (!domain) return 0;
        return domain.level * 100 + domain.power * 2 + domain.rules.length * 30;
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
        if (this.stats.totalDomains < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDomains += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { domains: Array.from(this.domains.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.domains) this.domains = new Map(data.domains);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, domainCount: this.domains.size }; }
}
