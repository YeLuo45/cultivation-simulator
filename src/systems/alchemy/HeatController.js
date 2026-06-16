/**
 * HeatController.js - 火候控制器
 * V1044 P-20260614-234 Round 40 Iter 7/30
 */
export const HEAT_LEVELS = ['cold', 'warm', 'hot', 'blazing', 'infernal'];
export const TARGET_HEAT = { cold: 50, warm: 200, hot: 500, blazing: 1000, infernal: 2000 };

export class HeatController {
    constructor(config = {}) {
        this.config = { coolingRate: 10, ...config };
        this.temperatures = new Map();   // sessionId -> { temp, target, history }
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `hcs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    startSession(targetHeat = 'hot', initialTemp = 20) {
        if (!HEAT_LEVELS.includes(targetHeat)) targetHeat = 'hot';
        const id = this._newId();
        const s = { id, temp: initialTemp, target: TARGET_HEAT[targetHeat], level: this._levelFor(initialTemp), history: [{ temp: initialTemp, ts: Date.now() }] };
        this.temperatures.set(id, s);
        this.stats.total++;
        return s;
    }
    _levelFor(temp) {
        if (temp < 100) return 'cold';
        if (temp < 300) return 'warm';
        if (temp < 700) return 'hot';
        if (temp < 1501) return 'blazing';
        if (temp < 2500) return 'infernal';
        return 'infernal';
    }
    get(id) { return this.temperatures.get(id) || null; }
    listAll() { return [...this.temperatures.values()]; }

    increase(id, amount = 50) {
        const s = this.temperatures.get(id);
        if (!s) return false;
        s.temp += amount;
        s.level = this._levelFor(s.temp);
        s.history.push({ temp: s.temp, ts: Date.now() });
        if (s.history.length > 50) s.history.shift();
        return true;
    }
    decrease(id, amount = 50) {
        const s = this.temperatures.get(id);
        if (!s) return false;
        s.temp = Math.max(0, s.temp - amount);
        s.level = this._levelFor(s.temp);
        s.history.push({ temp: s.temp, ts: Date.now() });
        if (s.history.length > 50) s.history.shift();
        return true;
    }
    setTemp(id, temp) {
        const s = this.temperatures.get(id);
        if (!s) return false;
        s.temp = Math.max(0, temp);
        s.level = this._levelFor(s.temp);
        return true;
    }
    cool(id) { return this.decrease(id, this.config.coolingRate * 10); }

    isOnTarget(id) {
        const s = this.temperatures.get(id);
        return s ? Math.abs(s.temp - s.target) < 50 : false;
    }
    distanceToTarget(id) {
        const s = this.temperatures.get(id);
        if (!s) return 0;
        return Math.abs(s.temp - s.target);
    }
    currentLevel(id) { return this.temperatures.get(id)?.level || null; }
    history(id) { return [...(this.temperatures.get(id)?.history || [])]; }
    maxTemp(id) {
        const h = this.history(id);
        if (h.length === 0) return 0;
        return Math.max(...h.map(x => x.temp));
    }
    averageTemp() {
        if (this.temperatures.size === 0) return 0;
        return this.listAll().reduce((s, x) => s + x.temp, 0) / this.temperatures.size;
    }
    report() { return { total: this.stats.total, averageTemp: this.averageTemp() }; }
    reset() { this.temperatures.clear(); this.stats = { total: 0 }; }
}
