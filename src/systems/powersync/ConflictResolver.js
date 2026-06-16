/**
 * ConflictResolver.js - 冲突解决器
 * V1161 Round 44 Iter 4/30 Direction A PowerSync Federation (thunderbolt)
 * 灵感: thunderbolt LWW/SET/CUSTOM/MAX/MIN resolver strategies
 */

export const STRATEGIES = ['lww', 'set', 'custom', 'max', 'min'];
export const RESOLVE_MODES = ['two-way', 'three-way'];

export class ConflictResolver {
    constructor(config = {}) {
        this.config = { defaultStrategy: 'lww', ...config };
        this.strategies = new Map();
        this.hooks = new Map();
        this.stats = { resolved: 0, conflicts: 0, failed: 0 };
        // register built-in strategies
        this._registerBuiltin();
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    _registerBuiltin() {
        this.registerStrategy('lww', (local, remote, base) => {
            // last-writer-wins by timestamp
            const lt = (local && local.ts) || 0;
            const rt = (remote && remote.ts) || 0;
            if (lt === rt) return base !== undefined ? local : remote;
            return lt > rt ? local : remote;
        });
        this.registerStrategy('set', (local, remote) => {
            // set union: collect all values from both
            const set = new Set();
            const addAll = (v) => {
                if (Array.isArray(v)) for (const x of v) set.add(x);
                else if (v !== undefined && v !== null) set.add(v);
            };
            addAll(local && local.value);
            addAll(remote && remote.value);
            return { value: Array.from(set) };
        });
        this.registerStrategy('max', (local, remote) => {
            const lv = (local && local.value);
            const rv = (remote && remote.value);
            const winner = (typeof lv === 'number' && typeof rv === 'number')
                ? (lv >= rv ? local : remote)
                : local;
            return winner;
        });
        this.registerStrategy('min', (local, remote) => {
            const lv = (local && local.value);
            const rv = (remote && remote.value);
            const winner = (typeof lv === 'number' && typeof rv === 'number')
                ? (lv <= rv ? local : remote)
                : local;
            return winner;
        });
    }

    registerStrategy(name, fn) {
        if (typeof name !== 'string' || typeof fn !== 'function') return false;
        this.strategies.set(name, fn);
        return true;
    }

    unregisterStrategy(name) { return this.strategies.delete(name); }
    hasStrategy(name) { return this.strategies.has(name); }
    listStrategies() { return Array.from(this.strategies.keys()); }

    resolve(local, remote, strategy = null, base = null) {
        const stratName = strategy || this.config.defaultStrategy;
        const fn = this.strategies.get(stratName);
        if (!fn) {
            this.stats.failed++;
            throw new Error(`Unknown strategy: ${stratName}`);
        }
        // detect conflict: local and remote differ
        const hasConflict = (() => {
            if (!local || !remote) return false;
            if (local.value !== remote.value) return true;
            return false;
        })();
        if (hasConflict) this.stats.conflicts++;
        let winner;
        try {
            winner = base === null ? fn(local, remote) : fn(local, remote, base);
        } catch (e) {
            this.stats.failed++;
            throw e;
        }
        this.stats.resolved++;
        const result = {
            winner,
            strategy: stratName,
            hasConflict,
            ts: Date.now(),
        };
        this._emit('resolved', result);
        return result;
    }

    getStats() { return { ...this.stats, strategies: this.strategies.size }; }
}

if (typeof globalThis !== 'undefined') {
    globalThis.ConflictResolver = ConflictResolver;
    globalThis.STRATEGIES = STRATEGIES;
    globalThis.RESOLVE_MODES = RESOLVE_MODES;
}
