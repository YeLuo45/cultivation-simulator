/**
 * FederationMaster.js - Federation 总控
 * V1186 Round 45 Iter 30/30 Direction A PowerSync Federation (chatdev)
 * 灵感: orchestrator master - 集成引擎 + 状态机 + 命令路由
 */

export const FEDERATION_PHASES = ['init', 'syncing', 'stable', 'draining', 'shutdown'];
export const PHASE_TRANSITIONS = {
    init:     ['syncing', 'shutdown'],
    syncing:  ['stable', 'draining', 'shutdown'],
    stable:   ['draining', 'shutdown'],
    draining: ['shutdown'],
    shutdown: [],
};
export const MAX_DISPATCHES = 200;

export class FederationMaster {
    constructor(config = {}) {
        const { engines = {}, ...rest } = config;
        this.config = { autoStart: true, maxDispatchHistory: MAX_DISPATCHES, ...rest };
        this.engines = new Map();    // name -> instance
        this.commands = new Map();   // command name -> handler fn
        this.dispatches = [];        // history of dispatches
        this.phase = 'init';
        this.hooks = new Map();
        this.stats = {
            registered: 0,
            unregistered: 0,
            dispatched: 0,
            errors: 0,
            phaseChanges: 0,
            shutdowns: 0,
        };
        for (const [name, instance] of Object.entries(engines)) {
            this.engines.set(name, instance);
            this.stats.registered++;
        }
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    // ---- engine registry ----
    registerEngine(name, instance) {
        if (!name || !instance) return false;
        const existed = this.engines.has(name);
        this.engines.set(name, instance);
        if (!existed) this.stats.registered++;
        this._emit('engineRegistered', { name, replaced: existed });
        return true;
    }

    registerEngines(map) {
        if (!map || typeof map !== 'object') return 0;
        let n = 0;
        for (const [k, v] of Object.entries(map)) { if (this.registerEngine(k, v)) n++; }
        return n;
    }

    unregisterEngine(name) {
        const ok = this.engines.delete(name);
        if (ok) {
            this.stats.unregistered++;
            this._emit('engineUnregistered', { name });
        }
        return ok;
    }

    getEngine(name) { return this.engines.get(name) || null; }

    hasEngine(name) { return this.engines.has(name); }

    listEngines() { return Array.from(this.engines.keys()); }

    engineCount() { return this.engines.size; }

    // ---- command registry ----
    registerCommand(command, handler) {
        if (!command || typeof handler !== 'function') return false;
        this.commands.set(command, handler);
        return true;
    }

    unregisterCommand(command) { return this.commands.delete(command); }

    hasCommand(command) { return this.commands.has(command); }

    listCommands() { return Array.from(this.commands.keys()); }

    // ---- dispatch ----
    dispatch(command, payload) {
        if (!command) {
            this.stats.errors++;
            return { ok: false, error: 'no_command' };
        }
        const entry = { command, payload, ts: Date.now() };
        this.dispatches.push(entry);
        if (this.dispatches.length > this.config.maxDispatchHistory) {
            this.dispatches.shift();
        }
        this.stats.dispatched++;

        // priority 1: registered command handler
        const handler = this.commands.get(command);
        if (handler) {
            try {
                const result = handler(payload);
                this._emit('dispatched', { ...entry, target: 'command' });
                return { ok: true, result, target: 'command' };
            } catch (e) {
                this.stats.errors++;
                return { ok: false, error: (e && e.message) || String(e) };
            }
        }

        // priority 2: try to call engine[command]
        const engine = this.engines.get(command);
        if (engine && typeof engine[command] === 'function') {
            try {
                const result = engine[command](payload);
                this._emit('dispatched', { ...entry, target: 'engine' });
                return { ok: true, result, target: 'engine' };
            } catch (e) {
                this.stats.errors++;
                return { ok: false, error: (e && e.message) || String(e) };
            }
        }

        // no handler
        this.stats.errors++;
        return { ok: false, error: 'no_handler' };
    }

    // ---- phase state machine ----
    getPhase() { return this.phase; }

    setPhase(phase) {
        if (!FEDERATION_PHASES.includes(phase)) return false;
        if (phase === this.phase) return true; // idempotent
        const allowed = PHASE_TRANSITIONS[this.phase] || [];
        if (!allowed.includes(phase)) return false;
        const prev = this.phase;
        this.phase = phase;
        this.stats.phaseChanges++;
        this._emit('phaseChanged', { prev, phase });
        return true;
    }

    canTransitionTo(phase) {
        if (!FEDERATION_PHASES.includes(phase)) return false;
        if (phase === this.phase) return true;
        const allowed = PHASE_TRANSITIONS[this.phase] || [];
        return allowed.includes(phase);
    }

    // ---- status ----
    getStatus() {
        const engineStatus = {};
        let okCount = 0;
        let downCount = 0;
        for (const [name, instance] of this.engines.entries()) {
            if (instance && typeof instance.getStatus === 'function') {
                try {
                    const s = instance.getStatus();
                    engineStatus[name] = s;
                    if (s && s.status) okCount++;
                    else okCount++;
                } catch (_) {
                    engineStatus[name] = 'down';
                    downCount++;
                }
            } else if (instance && typeof instance === 'object') {
                engineStatus[name] = 'ok';
                okCount++;
            } else {
                engineStatus[name] = 'down';
                downCount++;
            }
        }
        return {
            phase: this.phase,
            engines: engineStatus,
            stats: { ...this.stats, ok: okCount, down: downCount },
            registered: this.engines.size,
        };
    }

    // ---- shutdown ----
    shutdown() {
        const prev = this.phase;
        const shutOk = [];
        for (const [name, instance] of this.engines.entries()) {
            if (instance && typeof instance.shutdown === 'function') {
                try { instance.shutdown(); shutOk.push(name); } catch (_) { /* ignore */ }
            }
        }
        this.phase = 'shutdown';
        this.stats.shutdowns++;
        this._emit('shutdown', { prev, shutOk });
        return { ok: true, prev, shutOk, count: shutOk.length };
    }

    // ---- queries ----
    getDispatches() { return this.dispatches.slice(); }

    getStats() {
        return {
            ...this.stats,
            engines: this.engines.size,
            commands: this.commands.size,
            phase: this.phase,
            dispatches: this.dispatches.length,
        };
    }

    reset() {
        this.engines.clear();
        this.commands.clear();
        this.dispatches = [];
        this.phase = 'init';
        this.stats = {
            registered: 0,
            unregistered: 0,
            dispatched: 0,
            errors: 0,
            phaseChanges: 0,
            shutdowns: 0,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.FederationMaster = FederationMaster;
    globalThis.FEDERATION_PHASES = FEDERATION_PHASES;
    globalThis.PHASE_TRANSITIONS = PHASE_TRANSITIONS;
}
