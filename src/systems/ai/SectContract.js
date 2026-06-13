/**
 * SectContract.js - 宗门契约
 * V473 Iteration 5/15 Round 18
 */

export class SectContract {
    constructor(config = {}) {
        this.config = { maxContracts: config.maxContracts || 100, baseDuration: config.baseDuration || 30, ...config };
        this.contracts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalContracts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getContract', (ctx) => this.getContract(ctx.contractId));
        this.registerTool('draftContract', (ctx) => this.draftContract(ctx));
    }

    draftContract(data) {
        const id = data.id || `crt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const contract = {
            contractId: id,
            sectId: data.sectId,
            party1: data.party1,
            party2: data.party2,
            terms: data.terms || [],
            duration: data.duration || this.config.baseDuration,
            status: 'draft',
            createdAt: Date.now()
        };
        this.contracts.set(id, contract);
        this.stats.totalContracts++;
        this._triggerHook('contractDrafted', { contractId: id });
        return { success: true, contract };
    }

    getContract(id) { return this.contracts.get(id) ? { ...this.contracts.get(id) } : null; }
    listContracts() { return Array.from(this.contracts.values()).map(c => ({ ...c })); }
    listBySect(sectId) { return Array.from(this.contracts.values()).filter(c => c.sectId === sectId).map(c => ({ ...c })); }
    listActive() { return Array.from(this.contracts.values()).filter(c => c.status === 'active').map(c => ({ ...c })); }

    addTerm(contractId, term) {
        const contract = this.contracts.get(contractId);
        if (!contract) return { success: false, error: 'CONTRACT_NOT_FOUND' };
        contract.terms.push(term);
        this._triggerHook('termAdded', { contractId, term });
        return { success: true };
    }

    extendContract(contractId, amount = 10) {
        const contract = this.contracts.get(contractId);
        if (!contract) return { success: false, error: 'CONTRACT_NOT_FOUND' };
        contract.duration += amount;
        this._triggerHook('contractExtended', { contractId, newDuration: contract.duration });
        return { success: true };
    }

    fulfillContract(contractId) {
        const contract = this.contracts.get(contractId);
        if (!contract) return { success: false, error: 'CONTRACT_NOT_FOUND' };
        contract.status = 'fulfilled';
        this._triggerHook('contractFulfilled', { contractId });
        return { success: true };
    }

    breachContract(contractId) {
        const contract = this.contracts.get(contractId);
        if (!contract) return { success: false, error: 'CONTRACT_NOT_FOUND' };
        contract.status = 'breached';
        this._triggerHook('contractBreached', { contractId });
        return { success: true };
    }

    calculateContractStrength(contractId) {
        const contract = this.contracts.get(contractId);
        if (!contract) return 0;
        return contract.terms.length * 10 + contract.duration;
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
        if (this.stats.totalContracts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxContracts += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { contracts: Array.from(this.contracts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.contracts) this.contracts = new Map(data.contracts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, contractCount: this.contracts.size }; }
}
