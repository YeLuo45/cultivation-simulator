/**
 * HookRegistry.js - Hook 注册表 (global/local scope + 优先级 + once 模式)
 * V1173 Round 44 Iter 16/30 Direction A PowerSync Federation (ruflo)
 * 灵感: ruflo event hook registry with scoped priorities + once
 */

export const SCOPES = ['global', 'local'];

export class HookRegistry {
    constructor(config = {}) {
        this.config = {
            defaultPriority: 10,
            ...config,
        };
        this.defaultPriority = this.config.defaultPriority;
        // event -> array of { fn, priority, scope, once, id }
        this.events = new Map();
        this.hooks = new Map();
        this.stats = { registered: 0, triggered: 0, removed: 0, errors: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `hook_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    register(event, fn, options = {}) {
        if (typeof event !== 'string' || !event) {
            this.stats.errors++;
            throw new Error('register: event must be non-empty string');
        }
        if (typeof fn !== 'function') {
            this.stats.errors++;
            throw new Error('register: fn must be a function');
        }
        const opts = {
            priority: this.defaultPriority,
            scope: 'global',
            once: false,
            ...options,
        };
        if (!SCOPES.includes(opts.scope)) {
            this.stats.errors++;
            throw new Error(`register: invalid scope ${opts.scope}`);
        }
        const entry = {
            id: this._newId(),
            fn,
            priority: opts.priority,
            scope: opts.scope,
            once: opts.once,
            event,
            ts: Date.now(),
        };
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event).push(entry);
        this.stats.registered++;
        this._emit('registered', { event, id: entry.id, scope: entry.scope });
        return entry.id;
    }

    on(event, fn, options) {
        return this.register(event, fn, options);
    }

    unregister(event, fnOrId) {
        const list = this.events.get(event);
        if (!list) return false;
        const before = list.length;
        const remaining = list.filter(e => {
            if (typeof fnOrId === 'function') return e.fn !== fnOrId;
            if (typeof fnOrId === 'string') return e.id !== fnOrId;
            return true;
        });
        if (remaining.length === before) return false;
        this.events.set(event, remaining);
        this.stats.removed += (before - remaining.length);
        this._emit('unregistered', { event, removed: before - remaining.length });
        return true;
    }

    trigger(event, payload, options = {}) {
        const list = this.events.get(event);
        if (!list || list.length === 0) {
            this._emit('triggered', { event, count: 0 });
            return 0;
        }
        const targetScope = options.scope || 'global';
        // sort by priority ascending (lower number = higher priority)
        const sorted = list.slice().sort((a, b) => a.priority - b.priority);
        let called = 0;
        const toRemove = [];
        for (const entry of sorted) {
            if (entry.scope === 'local' && targetScope !== 'local') continue;
            try {
                entry.fn(payload, { event, scope: entry.scope });
                called++;
            } catch (err) {
                this.stats.errors++;
                this._emit('error', { event, id: entry.id, error: err && err.message });
            }
            if (entry.once) toRemove.push(entry.id);
        }
        // remove once-firing entries
        if (toRemove.length > 0) {
            const remaining = list.filter(e => !toRemove.includes(e.id));
            this.events.set(event, remaining);
            this.stats.removed += toRemove.length;
        }
        this.stats.triggered += called;
        this._emit('triggered', { event, count: called, scope: targetScope });
        return called;
    }

    listHooks(event) {
        if (event === undefined || event === null) {
            const out = {};
            for (const [k, v] of this.events.entries()) {
                out[k] = v.slice().sort((a, b) => a.priority - b.priority);
            }
            return out;
        }
        const list = this.events.get(event) || [];
        return list.slice().sort((a, b) => a.priority - b.priority);
    }

    count(event) {
        if (event === undefined || event === null) {
            let total = 0;
            for (const v of this.events.values()) total += v.length;
            return total;
        }
        const list = this.events.get(event);
        return list ? list.length : 0;
    }

    clear(event) {
        if (event === undefined || event === null) {
            let total = 0;
            for (const v of this.events.values()) total += v.length;
            this.events.clear();
            this.stats.removed += total;
            this._emit('cleared', { event: null, count: total });
            return total;
        }
        const list = this.events.get(event);
        if (!list) return 0;
        const n = list.length;
        this.events.delete(event);
        this.stats.removed += n;
        this._emit('cleared', { event, count: n });
        return n;
    }

    getStats() {
        return {
            ...this.stats,
            events: this.events.size,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.HookRegistry = HookRegistry;
    globalThis.SCOPES = SCOPES;
}
