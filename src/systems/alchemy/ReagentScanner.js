/**
 * ReagentScanner.js - 试剂扫描仪
 * V1040 P-20260614-259 Round 40 Iter 3/30
 */
export const SCAN_RESULTS = ['identified', 'unknown', 'impure', 'fraudulent'];

export class ReagentScanner {
    constructor(config = {}) {
        this.config = { ...config };
        this.scans = new Map();   // scanId -> { id, itemId, result, purity, ts }
        this.hooks = new Map();
        this.stats = { totalScans: 0, identified: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `scn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    scan(itemId, purity = 100) {
        if (!itemId) return null;
        const id = this._newId();
        let result;
        if (purity >= 80) result = 'identified';
        else if (purity >= 50) result = 'impure';
        else if (purity >= 20) result = 'unknown';
        else result = 'fraudulent';
        const s = { id, itemId, result, purity, ts: Date.now() };
        this.scans.set(id, s);
        this.stats.totalScans++;
        if (result === 'identified') this.stats.identified++;
        this._emit('scanned', s);
        return s;
    }
    get(id) { return this.scans.get(id) || null; }
    listAll() { return [...this.scans.values()]; }
    listForItem(itemId) { return this.listAll().filter(s => s.itemId === itemId); }
    listByResult(result) { return this.listAll().filter(s => s.result === result); }
    isAuthentic(scanId) { return this.scans.get(scanId)?.result === 'identified'; }
    isImpure(scanId) { return this.scans.get(scanId)?.result === 'impure'; }
    isFraudulent(scanId) { return this.scans.get(scanId)?.result === 'fraudulent'; }
    averagePurity() {
        if (this.scans.size === 0) return 0;
        return this.listAll().reduce((s, x) => s + x.purity, 0) / this.scans.size;
    }
    purityFor(itemId) {
        const list = this.listForItem(itemId);
        if (list.length === 0) return null;
        return list.reduce((s, x) => s + x.purity, 0) / list.length;
    }
    scanCount(itemId) { return this.listForItem(itemId).length; }
    successRate() { return this.stats.totalScans === 0 ? 0 : this.stats.identified / this.stats.totalScans; }
    fraudCount() { return this.listByResult('fraudulent').length; }
    report() { return { totalScans: this.stats.totalScans, identified: this.stats.identified, successRate: this.successRate() }; }
    reset() { this.scans.clear(); this.stats = { totalScans: 0, identified: 0 }; }
}
