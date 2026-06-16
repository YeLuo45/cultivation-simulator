/**
 * SyncNegotiator.js - 协商 Agent
 * V1180 Round 44 Iter 23/30 Direction A PowerSync Federation (chatdev)
 * 灵感: chatdev negotiator - 协议握手 + 能力交换 + 降级方案 + 重试
 */

export const NEGOTIATOR_STATES = ['idle', 'negotiating', 'agreed', 'degraded', 'failed'];
export const DEGRADATION_LEVELS = ['none', 'reduce_features', 'lower_protocol', 'fallback_passthrough'];

export class SyncNegotiator {
    constructor(config = {}) {
        this.config = {
            supportedProtocols: ['v1', 'v2'],
            maxRetries: 2,
            ...config,
        };
        this.state = 'idle';
        this.agreedProtocol = null;
        this.capabilities = null;     // agreed (intersection)
        this.remoteCaps = null;
        this.localCaps = null;
        this.attempts = 0;
        this.degradationLevel = 'none';
        this.degradationPath = null;
        this.hooks = new Map();
        this.history = [];
        this.stats = { handshakes: 0, exchanges: 0, negotiations: 0, degraded: 0, failed: 0, retries: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `neg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    _setState(s) {
        if (!NEGOTIATOR_STATES.includes(s)) return false;
        const prev = this.state;
        this.state = s;
        this._emit('stateChange', { prev, state: s });
        return true;
    }

    _protocolPriority() {
        // higher index = preferred. e.g. ['v1', 'v2'] -> v2 wins
        const list = this.config.supportedProtocols;
        return list.slice();
    }

    // ---- protocol handshake ----
    handshake(remoteCaps) {
        this.stats.handshakes++;
        this.remoteCaps = remoteCaps;
        const myProtocols = this._protocolPriority();
        const theirProtocols = (remoteCaps && remoteCaps.protocols) || [];
        // pick best common protocol (highest preference, prefer latest index)
        let chosen = null;
        for (let i = myProtocols.length - 1; i >= 0; i--) {
            if (theirProtocols.includes(myProtocols[i])) {
                chosen = myProtocols[i];
                break;
            }
        }
        this.agreedProtocol = chosen;
        if (chosen) {
            this._setState('agreed');
            this._emit('handshake', { protocol: chosen, agreed: true });
        } else {
            this._setState('degraded');
            this._emit('handshake', { protocol: null, agreed: false });
        }
        return { protocol: chosen, agreed: !!chosen };
    }

    // ---- capability exchange ----
    exchangeCapabilities(localCaps) {
        this.stats.exchanges++;
        this.localCaps = localCaps;
        const remote = this.remoteCaps || (localCaps && localCaps.remote) || null;
        // try to extract remote from localCaps.remote (chatdev-style)
        let remoteCaps = remote;
        if (!remoteCaps) {
            // assume localCaps carries the local side; remote comes from a prior handshake
            remoteCaps = this.remoteCaps;
        }
        if (!localCaps || !remoteCaps) {
            // can't do intersection - return local as-is
            this.capabilities = localCaps ? { ...localCaps } : null;
            this._emit('exchange', { capabilities: this.capabilities, degraded: true });
            return { capabilities: this.capabilities, degraded: true };
        }
        const myFeatures = new Set(localCaps.features || []);
        const theirFeatures = new Set(remoteCaps.features || []);
        const commonFeatures = Array.from(myFeatures).filter((f) => theirFeatures.has(f));
        const myPayload = localCaps.maxPayload || 0;
        const theirPayload = remoteCaps.maxPayload || 0;
        const maxPayload = Math.min(myPayload, theirPayload);
        this.capabilities = {
            protocols: this.agreedProtocol ? [this.agreedProtocol] : [],
            features: commonFeatures,
            maxPayload,
        };
        this._emit('exchange', { capabilities: this.capabilities });
        return { capabilities: this.capabilities, degraded: commonFeatures.length < myFeatures.size };
    }

    // ---- full negotiate ----
    negotiate(remoteCaps) {
        this.stats.negotiations++;
        this.attempts = 0;
        this.degradationLevel = 'none';
        this.degradationPath = null;
        this._setState('negotiating');
        let lastResult = null;
        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            this.attempts = attempt + 1;
            if (attempt > 0) this.stats.retries++;
            const hs = this.handshake(remoteCaps);
            if (hs.agreed) {
                this.degradationLevel = 'none';
                this.degradationPath = null;
                const ex = this.exchangeCapabilities(this.localCaps || this._inferLocalCaps());
                lastResult = { agreed: true, protocol: hs.protocol, capabilities: this.capabilities, attempts: this.attempts, degradation: this.degradationLevel };
                this.history.push({ ts: Date.now(), ...lastResult });
                this._setState('agreed');
                this._emit('negotiated', lastResult);
                return lastResult;
            }
            // try degradation
            const deg = this.getDegradationPath();
            this.degradationLevel = deg.level;
            this.degradationPath = deg;
            this.stats.degraded++;
            if (!deg.protocol && !deg.allowPassthrough) {
                // no fallback
                this.stats.failed++;
                lastResult = { agreed: false, protocol: null, capabilities: null, attempts: this.attempts, degradation: this.degradationLevel };
                this.history.push({ ts: Date.now(), ...lastResult });
                this._setState('failed');
                this._emit('negotiated', lastResult);
                return lastResult;
            }
        }
        // exhausted retries
        this.stats.failed++;
        lastResult = { agreed: false, protocol: null, capabilities: null, attempts: this.attempts, degradation: this.degradationLevel };
        this.history.push({ ts: Date.now(), ...lastResult });
        this._setState('failed');
        this._emit('negotiated', lastResult);
        return lastResult;
    }

    _inferLocalCaps() {
        return { protocols: this.config.supportedProtocols.slice(), features: [], maxPayload: 0 };
    }

    // ---- degradation path ----
    getDegradationPath() {
        const myProtocols = this._protocolPriority();
        const theirProtocols = (this.remoteCaps && this.remoteCaps.protocols) || [];
        // find any common protocol
        for (let i = myProtocols.length - 1; i >= 0; i--) {
            if (theirProtocols.includes(myProtocols[i])) {
                return { level: 'none', protocol: myProtocols[i], reason: 'common_found' };
            }
        }
        // no common - propose lowest mutual (try mine)
        if (myProtocols.length > 0) {
            return { level: 'lower_protocol', protocol: myProtocols[0], reason: 'lowest_local_attempt' };
        }
        return { level: 'fallback_passthrough', protocol: null, allowPassthrough: true, reason: 'no_protocols' };
    }

    // ---- queries / config ----
    getState() { return this.state; }
    getAgreedProtocol() { return this.agreedProtocol; }
    getCapabilities() { return this.capabilities; }
    getStats() {
        return {
            ...this.stats,
            state: this.state,
            attempts: this.attempts,
            degradationLevel: this.degradationLevel,
            agreedProtocol: this.agreedProtocol,
        };
    }
    listHistory() { return this.history.slice(); }
    listSupportedProtocols() { return this.config.supportedProtocols.slice(); }
    setSupportedProtocols(list) {
        if (!Array.isArray(list) || list.length === 0) return false;
        this.config.supportedProtocols = list.slice();
        return true;
    }
    setMaxRetries(n) {
        if (typeof n !== 'number' || n < 0) return false;
        this.config.maxRetries = n;
        return true;
    }
    reset() {
        this.state = 'idle';
        this.agreedProtocol = null;
        this.capabilities = null;
        this.remoteCaps = null;
        this.localCaps = null;
        this.attempts = 0;
        this.degradationLevel = 'none';
        this.degradationPath = null;
        this.history = [];
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.SyncNegotiator = SyncNegotiator;
    globalThis.NEGOTIATOR_STATES = NEGOTIATOR_STATES;
    globalThis.DEGRADATION_LEVELS = DEGRADATION_LEVELS;
}
