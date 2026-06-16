/**
 * CultivationBank.js - 修真银行
 * V540 Iteration 3/20 Round 22
 */
export class CultivationBank {
    constructor(config = {}) {
        this.config = { maxBanks: config.maxBanks || 30, baseDeposits: config.baseDeposits || 100, ...config };
        this.banks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBanks: 0, totalLoans: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBank', (ctx) => this.getBank(ctx.bankId));
        this.registerTool('openBank', (ctx) => this.openBank(ctx));
    }

    openBank(data) {
        const id = data.bankId || data.id || `bnk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const bank = {
            bankId: id,
            ownerId: data.ownerId,
            name: data.name || 'Untitled Bank',
            type: data.type || 'central',
            deposits: data.deposits || this.config.baseDeposits,
            loans: [],
            level: 1,
            status: 'open',
            createdAt: Date.now()
        };
        this.banks.set(id, bank);
        this.stats.totalBanks++;
        this._triggerHook('bankOpened', { bankId: id });
        return { success: true, bank };
    }

    getBank(bankId) { return this.banks.get(bankId) ? { ...this.banks.get(bankId) } : null; }
    listBanks() { return Array.from(this.banks.values()).map(b => ({ ...b })); }
    listByOwner(ownerId) { return Array.from(this.banks.values()).filter(b => b.ownerId === ownerId).map(b => ({ ...b })); }
    listOpen() { return Array.from(this.banks.values()).filter(b => b.status === 'open').map(b => ({ ...b })); }

    addLoan(bankId, loan) {
        const bank = this.banks.get(bankId);
        if (!bank) return { success: false, error: 'BANK_NOT_FOUND' };
        const loanEntry = {
            loanId: loan.loanId || `ln_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            borrowerId: loan.borrowerId,
            amount: loan.amount || 0,
            interest: loan.interest || 0.05,
            issuedAt: Date.now()
        };
        bank.loans.push(loanEntry);
        this.stats.totalLoans++;
        this._triggerHook('loanAdded', { bankId, loanId: loanEntry.loanId });
        return { success: true, loan: loanEntry };
    }

    increaseDeposits(bankId, amount = 5) {
        const bank = this.banks.get(bankId);
        if (!bank) return { success: false, error: 'BANK_NOT_FOUND' };
        bank.deposits += amount;
        if (bank.deposits > 1000 && bank.status === 'open') bank.status = 'prosperous';
        this._triggerHook('depositsIncreased', { bankId, newDeposits: bank.deposits });
        return { success: true, newDeposits: bank.deposits };
    }

    levelUpBank(bankId) {
        const bank = this.banks.get(bankId);
        if (!bank) return { success: false, error: 'BANK_NOT_FOUND' };
        bank.level++;
        this._triggerHook('bankLeveledUp', { bankId, newLevel: bank.level });
        return { success: true, newLevel: bank.level };
    }

    closeBank(bankId) {
        const bank = this.banks.get(bankId);
        if (!bank) return { success: false, error: 'BANK_NOT_FOUND' };
        bank.status = 'closed';
        this._triggerHook('bankClosed', { bankId });
        return { success: true };
    }

    calculateBankWealth(bankId) {
        const bank = this.banks.get(bankId);
        if (!bank) return 0;
        return bank.level * 100 + bank.deposits * 2 + bank.loans.length * 30;
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
        if (this.stats.totalBanks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBanks += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { banks: Array.from(this.banks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.banks) this.banks = new Map(data.banks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bankCount: this.banks.size }; }
}
