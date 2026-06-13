/**
 * CultivationInsurance.js - 修真保险
 * V542 Iteration 5/20 Round 22
 */
export class CultivationInsurance {
    constructor(config = {}) {
        this.config = { maxInsurances: config.maxInsurances || 50, baseCoverage: config.baseCoverage || 100, ...config };
        this.insurances = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalInsurances: 0, totalClaims: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getInsurance', (ctx) => this.getInsurance(ctx.insuranceId));
        this.registerTool('offerInsurance', (ctx) => this.offerInsurance(ctx));
    }

    offerInsurance(data) {
        const id = data.insuranceId || data.id || `ins_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const insurance = {
            insuranceId: id,
            insurerId: data.insurerId,
            name: data.name || 'Untitled Insurance',
            type: data.type || 'life',
            coverage: data.coverage || this.config.baseCoverage,
            claims: [],
            level: 1,
            status: 'offered',
            createdAt: Date.now()
        };
        this.insurances.set(id, insurance);
        this.stats.totalInsurances++;
        this._triggerHook('insuranceOffered', { insuranceId: id });
        return { success: true, insurance };
    }

    getInsurance(insuranceId) { return this.insurances.get(insuranceId) ? { ...this.insurances.get(insuranceId) } : null; }
    listInsurances() { return Array.from(this.insurances.values()).map(i => ({ ...i })); }
    listByInsurer(insurerId) { return Array.from(this.insurances.values()).filter(i => i.insurerId === insurerId).map(i => ({ ...i })); }
    listActive() { return Array.from(this.insurances.values()).filter(i => i.status === 'active').map(i => ({ ...i })); }

    addClaim(insuranceId, claim) {
        const insurance = this.insurances.get(insuranceId);
        if (!insurance) return { success: false, error: 'INSURANCE_NOT_FOUND' };
        const claimEntry = {
            claimId: claim.claimId || `clm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            claimantId: claim.claimantId,
            amount: claim.amount || 0,
            reason: claim.reason || 'unspecified',
            filedAt: Date.now()
        };
        insurance.claims.push(claimEntry);
        this.stats.totalClaims++;
        this._triggerHook('claimAdded', { insuranceId, claimId: claimEntry.claimId });
        return { success: true, claim: claimEntry };
    }

    increaseCoverage(insuranceId, amount = 5) {
        const insurance = this.insurances.get(insuranceId);
        if (!insurance) return { success: false, error: 'INSURANCE_NOT_FOUND' };
        insurance.coverage += amount;
        if (insurance.coverage > 1000 && insurance.status === 'offered') insurance.status = 'active';
        this._triggerHook('coverageIncreased', { insuranceId, newCoverage: insurance.coverage });
        return { success: true, newCoverage: insurance.coverage };
    }

    levelUpInsurance(insuranceId) {
        const insurance = this.insurances.get(insuranceId);
        if (!insurance) return { success: false, error: 'INSURANCE_NOT_FOUND' };
        insurance.level++;
        this._triggerHook('insuranceLeveledUp', { insuranceId, newLevel: insurance.level });
        return { success: true, newLevel: insurance.level };
    }

    expireInsurance(insuranceId) {
        const insurance = this.insurances.get(insuranceId);
        if (!insurance) return { success: false, error: 'INSURANCE_NOT_FOUND' };
        insurance.status = 'expired';
        this._triggerHook('insuranceExpired', { insuranceId });
        return { success: true };
    }

    calculateInsuranceValue(insuranceId) {
        const insurance = this.insurances.get(insuranceId);
        if (!insurance) return 0;
        return insurance.level * 100 + insurance.coverage * 2 + insurance.claims.length * 30;
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
        if (this.stats.totalInsurances < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxInsurances += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { insurances: Array.from(this.insurances.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.insurances) this.insurances = new Map(data.insurances);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, insuranceCount: this.insurances.size }; }
}
