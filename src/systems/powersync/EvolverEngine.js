/**
 * EvolverEngine.js - 演化引擎
 * V1184 Round 45 Iter 28/30 Direction A PowerSync Federation (chatdev)
 * 灵感: generic-agent evolver - 参数自调优 + 探索/利用
 */

export const EVOLVE_STRATEGIES = ['explore', 'exploit', 'mutate'];
export const MAX_GENERATIONS = 500;

export class EvolverEngine {
    constructor(config = {}) {
        this.config = { mutationRate: 0.1, population: 5, ...config };
        this.params = new Map();   // name -> { min, max, current }
        this.history = [];         // { generation, metric, params, strategy, ts }
        this.generation = 0;
        this.hooks = new Map();
        this.stats = { evolutions: 0, bestMetric: -Infinity, explore: 0, exploit: 0, mutate: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    // ---- param registry ----
    registerParam(name, spec) {
        if (!name || typeof name !== 'string') return false;
        if (!spec || typeof spec !== 'object') return false;
        const { min, max, current } = spec;
        if (typeof min !== 'number' || typeof max !== 'number' || min >= max) return false;
        if (typeof current !== 'number' || current < min || current > max) return false;
        if (!isFinite(min) || !isFinite(max) || !isFinite(current)) return false;
        this.params.set(name, { min, max, current });
        return true;
    }

    unregisterParam(name) {
        return this.params.delete(name);
    }

    hasParam(name) { return this.params.has(name); }

    getParamSpec(name) {
        const spec = this.params.get(name);
        return spec ? { name, ...spec } : null;
    }

    listParams() {
        return Array.from(this.params.entries()).map(([name, spec]) => ({ name, ...spec }));
    }

    getCurrentParams() {
        const out = {};
        for (const [name, spec] of this.params.entries()) {
            out[name] = spec.current;
        }
        return out;
    }

    // ---- evolution operators ----
    _randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    _mutateValue(current, min, max) {
        const range = max - min;
        const delta = (Math.random() * 2 - 1) * range * this.config.mutationRate;
        let next = current + delta;
        if (next < min) next = min;
        if (next > max) next = max;
        return next;
    }

    _pickStrategy(metric) {
        if (this.history.length === 0) return 'explore';
        const last = this.history[this.history.length - 1];
        if (last.metric > metric) return 'exploit';
        return 'mutate';
    }

    evolve(metric) {
        if (typeof metric !== 'number' || !isFinite(metric)) return null;
        this.generation++;
        const prevParams = this.getCurrentParams();
        const strategy = this._pickStrategy(metric);

        const best = this.getBest();
        const newParams = {};
        for (const [name, spec] of this.params.entries()) {
            let next;
            if (strategy === 'explore') {
                next = this._randomInRange(spec.min, spec.max);
            } else if (strategy === 'exploit' && best && best.params && best.params[name] !== undefined) {
                // take best, then mutate a bit
                next = this._mutateValue(best.params[name], spec.min, spec.max);
            } else {
                // mutate: best-of-one with random direction
                next = this._mutateValue(spec.current, spec.min, spec.max);
            }
            newParams[name] = next;
            spec.current = next;
        }

        const entry = {
            generation: this.generation,
            metric,
            params: newParams,
            prevParams,
            strategy,
            ts: Date.now(),
        };
        this.history.push(entry);
        this.stats.evolutions++;
        this.stats[strategy] = (this.stats[strategy] || 0) + 1;
        if (metric > this.stats.bestMetric) this.stats.bestMetric = metric;
        this._emit('evolved', entry);
        return newParams;
    }

    // ---- history / queries ----
    getHistory() {
        return this.history.slice();
    }

    getBest() {
        if (this.history.length === 0) return null;
        let best = this.history[0];
        for (const h of this.history) {
            if (h.metric > best.metric) best = h;
        }
        return best;
    }

    getWorst() {
        if (this.history.length === 0) return null;
        let worst = this.history[0];
        for (const h of this.history) {
            if (h.metric < worst.metric) worst = h;
        }
        return worst;
    }

    getLast() {
        return this.history.length > 0 ? this.history[this.history.length - 1] : null;
    }

    getGeneration() { return this.generation; }

    setMutationRate(r) {
        if (typeof r !== 'number' || r < 0 || r > 1) return false;
        this.config.mutationRate = r;
        return true;
    }

    setPopulation(n) {
        if (typeof n !== 'number' || n <= 0) return false;
        this.config.population = n;
        return true;
    }

    getStats() {
        return {
            ...this.stats,
            generation: this.generation,
            params: this.params.size,
            history: this.history.length,
            mutationRate: this.config.mutationRate,
            population: this.config.population,
        };
    }

    reset() {
        this.history = [];
        this.generation = 0;
        this.stats = { evolutions: 0, bestMetric: -Infinity, explore: 0, exploit: 0, mutate: 0 };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.EvolverEngine = EvolverEngine;
    globalThis.EVOLVE_STRATEGIES = EVOLVE_STRATEGIES;
}
