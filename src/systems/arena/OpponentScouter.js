/**
 * OpponentScouter.js - 对手侦查器
 * V1010 P-20260614-170 Round 39 Iter 3/30
 */
export const SCOUTING_DEPTHS = ['basic', 'detailed', 'exhaustive'];
export const DEFAULT_DEPTH = 'detailed';

export class OpponentScouter {
    constructor(config = {}) {
        this.config = { depth: config.depth || DEFAULT_DEPTH, ...config };
        this.profiles = new Map();   // opponentId -> { id, name, power, techniques, winRate, recent }
        this.reports = new Map();    // reportId -> { scout, target, data, ts }
        this.hooks = new Map();
        this.stats = { totalReports: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    registerOpponent(id, name, basePower = 100) {
        if (!id || !name) return null;
        this.profiles.set(id, { id, name, power: basePower, techniques: [], winRate: 0.5, recent: [] });
        return this.profiles.get(id);
    }
    get(id) { return this.profiles.get(id) || null; }
    listAll() { return [...this.profiles.values()]; }
    addTechnique(oppId, technique) {
        const p = this.profiles.get(oppId);
        if (!p) return false;
        p.techniques.push(technique);
        return true;
    }
    setPower(oppId, power) {
        const p = this.profiles.get(oppId);
        if (!p) return false;
        p.power = power;
        return true;
    }
    recordResult(oppId, won) {
        const p = this.profiles.get(oppId);
        if (!p) return false;
        p.recent.push(won);
        if (p.recent.length > 10) p.recent.shift();
        const w = p.recent.filter(x => x).length;
        p.winRate = w / p.recent.length;
        return true;
    }

    scout(scoutId, targetId) {
        const t = this.profiles.get(targetId);
        if (!t) return null;
        const id = this._newId();
        const depth = this.config.depth;
        const data = {
            name: t.name,
            power: t.power,
            techniques: depth === 'basic' ? t.techniques.slice(0, 1) : t.techniques,
            winRate: t.winRate,
            recent: depth === 'exhaustive' ? t.recent : t.recent.slice(-5),
            strengths: this._inferStrengths(t),
            weaknesses: this._inferWeaknesses(t),
        };
        const r = { id, scout: scoutId, target: targetId, data, depth, ts: Date.now() };
        this.reports.set(id, r);
        this.stats.totalReports++;
        this._emit('scouted', r);
        return r;
    }
    _inferStrengths(t) {
        const s = [];
        if (t.power > 200) s.push('high_power');
        if (t.techniques.length > 5) s.push('versatile');
        if (t.winRate > 0.7) s.push('consistent_winner');
        return s;
    }
    _inferWeaknesses(t) {
        const w = [];
        if (t.power < 100) w.push('low_power');
        if (t.techniques.length < 2) w.push('predictable');
        if (t.winRate < 0.3) w.push('struggling');
        return w;
    }

    getReport(id) { return this.reports.get(id) || null; }
    listReportsFor(targetId) { return [...this.reports.values()].filter(r => r.target === targetId); }
    listReportsBy(scoutId) { return [...this.reports.values()].filter(r => r.scout === scoutId); }
    setDepth(depth) {
        if (!SCOUTING_DEPTHS.includes(depth)) return false;
        this.config.depth = depth;
        return true;
    }
    threat(oppId) {
        const p = this.profiles.get(oppId);
        if (!p) return 0;
        return p.power * (0.5 + p.winRate);
    }
    isThreat(oppId, threshold = 100) {
        return this.threat(oppId) >= threshold;
    }
    report_() { return { totalReports: this.stats.totalReports, opponents: this.profiles.size }; }
    reset() { this.profiles.clear(); this.reports.clear(); this.stats = { totalReports: 0 }; }
}
