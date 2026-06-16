/**
 * PowerBalanceMonitor.js - 权力制衡监控器
 * V993 P-20260614-153 Round 38 Iter 16/30
 */
export const BALANCE_THRESHOLDS = { warning: 0.7, critical: 0.9 };

export class PowerBalanceMonitor {
    constructor(config = {}) {
        this.config = { thresholds: BALANCE_THRESHOLDS, ...config };
        this.powers = new Map();      // role -> { totalPower, memberCount }
        this.alerts = [];             // [{ role, ratio, severity, ts }]
        this.hooks = new Map();
        this.stats = { alerts: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    updateRole(role, totalPower, memberCount) {
        if (memberCount <= 0) return false;
        this.powers.set(role, { totalPower, memberCount });
        this._checkBalance();
        return true;
    }
    getRole(role) { return this.powers.get(role) || null; }
    listAll() { return [...this.powers.entries()].map(([role, data]) => ({ role, ...data })); }

    _checkBalance() {
        let total = 0;
        for (const p of this.powers.values()) total += p.totalPower;
        if (total === 0) return;
        for (const [role, data] of this.powers) {
            const ratio = data.totalPower / total;
            if (ratio >= this.config.thresholds.critical) this._raiseAlert(role, ratio, 'critical');
            else if (ratio >= this.config.thresholds.warning) this._raiseAlert(role, ratio, 'warning');
        }
    }
    _raiseAlert(role, ratio, severity) {
        const alert = { role, ratio, severity, ts: Date.now() };
        this.alerts.push(alert);
        if (this.alerts.length > 100) this.alerts.shift();
        this.stats.alerts++;
        this._emit('alert', alert);
    }

    concentrationIndex() {
        // Herfindahl-Hirschman index
        let total = 0;
        for (const p of this.powers.values()) total += p.totalPower;
        if (total === 0) return 0;
        let hhi = 0;
        for (const p of this.powers.values()) {
            const share = p.totalPower / total;
            hhi += share * share;
        }
        return hhi;
    }
    isBalanced() {
        return this.concentrationIndex() < 0.5;
    }
    dominantRole() {
        let max = null, maxP = 0;
        let total = 0;
        for (const p of this.powers.values()) total += p.totalPower;
        if (total === 0) return null;
        for (const [role, p] of this.powers) {
            if (p.totalPower > maxP) { maxP = p.totalPower; max = role; }
        }
        return max;
    }
    isDominant(role) { return this.dominantRole() === role; }
    powerRatio(role) {
        let total = 0;
        for (const p of this.powers.values()) total += p.totalPower;
        if (total === 0) return 0;
        return (this.powers.get(role)?.totalPower || 0) / total;
    }

    recentAlerts(n = 10) { return [...this.alerts].slice(-n).reverse(); }
    clearAlerts() { this.alerts = []; }
    report() { return { concentrationIndex: this.concentrationIndex(), isBalanced: this.isBalanced(), dominantRole: this.dominantRole(), alerts: this.stats.alerts }; }
    reset() { this.powers.clear(); this.alerts = []; this.stats = { alerts: 0 }; }
}
