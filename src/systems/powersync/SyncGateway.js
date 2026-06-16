/**
 * SyncGateway.js - 同步协议网关
 * V1167 Round 44 Iter 10/30 Direction A PowerSync Federation (thunderbolt)
 * 灵感: thunderbolt PowerSync protocol adapter (WebSocket/Http/Quic)
 */

export const PROTOCOLS = ['websocket', 'http', 'quic'];
export const GATEWAY_STATES = ['disconnected', 'connecting', 'connected', 'error'];

export class SyncGateway {
    constructor(config = {}) {
        this.config = { defaultProtocol: 'websocket', ...config };
        this.protocol = null;
        this.state = 'disconnected';
        this.messageHandlers = [];
        this.sentLog = [];   // for trace
        this.hooks = new Map();
        this.stats = { connect: 0, disconnect: 0, sent: 0, received: 0, errors: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    connect(protocol = null) {
        const p = protocol || this.config.defaultProtocol;
        if (!PROTOCOLS.includes(p)) {
            this.stats.errors++;
            this.state = 'error';
            this._emit('error', { reason: 'unknown_protocol', protocol: p });
            throw new Error(`Unknown protocol: ${p}`);
        }
        const prev = this.state;
        this.state = 'connecting';
        this._emit('connecting', { protocol: p, prev });
        // simulate transition
        this.protocol = p;
        this.state = 'connected';
        this.stats.connect++;
        this._emit('connected', { protocol: p });
        return { protocol: p, state: this.state };
    }

    disconnect() {
        if (this.state === 'disconnected') return false;
        const prev = this.protocol;
        this.protocol = null;
        this.state = 'disconnected';
        this.stats.disconnect++;
        this._emit('disconnected', { protocol: prev });
        return true;
    }

    send(payload) {
        if (this.state !== 'connected') {
            this.stats.errors++;
            this._emit('error', { reason: 'not_connected' });
            return false;
        }
        const entry = { payload, protocol: this.protocol, ts: Date.now() };
        this.sentLog.push(entry);
        this.stats.sent++;
        this._emit('sent', entry);
        // simulate a roundtrip - call message handlers
        for (const h of this.messageHandlers) {
            try {
                h({ type: 'echo', payload, protocol: this.protocol, ts: entry.ts });
            } catch (_) { /* ignore */ }
        }
        this.stats.received++;
        return true;
    }

    onMessage(fn) {
        if (typeof fn !== 'function') return false;
        this.messageHandlers.push(fn);
        return true;
    }

    listSent() { return this.sentLog.slice(); }
    listProtocols() { return PROTOCOLS.slice(); }
    isConnected() { return this.state === 'connected'; }
    getProtocol() { return this.protocol; }
    getState() { return this.state; }
    clear() {
        this.sentLog = [];
        this.messageHandlers = [];
    }
    getStats() {
        return {
            ...this.stats,
            state: this.state,
            protocol: this.protocol,
            handlers: this.messageHandlers.length,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.SyncGateway = SyncGateway;
    globalThis.PROTOCOLS = PROTOCOLS;
    globalThis.GATEWAY_STATES = GATEWAY_STATES;
}
