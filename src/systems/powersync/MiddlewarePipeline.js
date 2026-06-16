/**
 * MiddlewarePipeline.js - 中间件管道 (pre/post hook chain + abort + ctx 传递)
 * V1174 Round 44 Iter 17/30 Direction A PowerSync Federation (ruflo)
 * 灵感: ruflo middleware chain (Koa-style) with abort signal
 */

export const PIPELINE_STATES = ['idle', 'running', 'stopped', 'error'];

export class MiddlewarePipeline {
    constructor(config = {}) {
        this.config = { ...config };
        this.middlewares = []; // { id, fn, name }
        this.hooks = new Map();
        this.stats = { registered: 0, executed: 0, aborted: 0, errors: 0, resets: 0 };
        this.state = 'idle';
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `mw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    use(middlewareFn, name) {
        if (typeof middlewareFn !== 'function') {
            this.stats.errors++;
            throw new Error('use: middleware must be a function (ctx, next) => Promise');
        }
        const entry = {
            id: this._newId(),
            fn: middlewareFn,
            name: name || `mw_${this.middlewares.length}`,
        };
        this.middlewares.push(entry);
        this.stats.registered++;
        this._emit('registered', { id: entry.id, name: entry.name });
        return entry.id;
    }

    abort(reason = 'aborted') {
        this.state = 'stopped';
        this._abortReason = reason;
        this.stats.aborted++;
        this._emit('aborted', { reason });
    }

    reset() {
        const n = this.middlewares.length;
        this.middlewares = [];
        this.state = 'idle';
        this.stats.resets++;
        this.stats.registered = 0;
        this._emit('reset', { removed: n });
        return n;
    }

    get count() { return this.middlewares.length; }

    async execute(initialCtx = {}) {
        const ctx = {
            state: {},
            payload: null,
            metadata: {},
            stopped: false,
            abortReason: null,
            ...initialCtx,
        };
        this.state = 'running';
        this._abortReason = null;
        this._emit('start', { count: this.middlewares.length });

        // Build a next() chain
        const fns = this.middlewares.map(e => e.fn);
        const dispatch = async (i) => {
            if (ctx.stopped || this.state === 'stopped') return;
            if (i >= fns.length) return;
            const fn = fns[i];
            let nextCalled = false;
            try {
                await fn(ctx, () => { nextCalled = true; return dispatch(i + 1); });
            } catch (err) {
                this.stats.errors++;
                ctx.metadata.lastError = err && err.message;
                this._emit('error', { id: this.middlewares[i].id, error: err && err.message });
                // do not re-throw: isolate middleware failures
            }
            // If middleware didn't call next (or threw), auto-advance to keep chain alive
            if (!nextCalled && !ctx.stopped && this.state !== 'stopped') {
                await dispatch(i + 1);
            }
        };

        try {
            await dispatch(0);
        } catch (err) {
            this.stats.errors++;
            this._emit('error', { phase: 'dispatch', error: err && err.message });
        }

        if (ctx.stopped || this.state === 'stopped') {
            this.state = 'stopped';
            ctx.stopped = true;
            if (this._abortReason !== null) ctx.abortReason = this._abortReason;
        } else {
            this.state = 'idle';
        }
        this.stats.executed++;
        this._emit('end', { state: this.state, ctx });
        return ctx;
    }

    list() {
        return this.middlewares.map(e => ({ id: e.id, name: e.name }));
    }

    has(idOrName) {
        return this.middlewares.some(e => e.id === idOrName || e.name === idOrName);
    }

    getStats() {
        return {
            ...this.stats,
            count: this.middlewares.length,
            state: this.state,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.MiddlewarePipeline = MiddlewarePipeline;
    globalThis.PIPELINE_STATES = PIPELINE_STATES;
}
