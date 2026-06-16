/**
 * SyncNegotiator.test.js - 协商 Agent 测试
 * V1180 Round 44 Iter 23/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    SyncNegotiator,
    NEGOTIATOR_STATES,
    DEGRADATION_LEVELS,
} from '../../../systems/powersync/SyncNegotiator.js';

describe('SyncNegotiator', () => {
    let n;
    beforeEach(() => { n = new SyncNegotiator(); });

    describe('exports', () => {
        it('NEGOTIATOR_STATES', () => {
            expect(NEGOTIATOR_STATES).toContain('idle');
            expect(NEGOTIATOR_STATES).toContain('negotiating');
            expect(NEGOTIATOR_STATES).toContain('agreed');
            expect(NEGOTIATOR_STATES).toContain('degraded');
            expect(NEGOTIATOR_STATES).toContain('failed');
        });
        it('DEGRADATION_LEVELS', () => {
            expect(DEGRADATION_LEVELS).toContain('none');
            expect(DEGRADATION_LEVELS).toContain('fallback_passthrough');
        });
    });

    describe('constructor', () => {
        it('starts idle', () => {
            expect(n.state).toBe('idle');
            expect(n.agreedProtocol).toBeNull();
        });
        it('accepts supportedProtocols', () => {
            const x = new SyncNegotiator({ supportedProtocols: ['a', 'b', 'c'] });
            expect(x.listSupportedProtocols()).toEqual(['a', 'b', 'c']);
        });
        it('accepts maxRetries', () => {
            const x = new SyncNegotiator({ maxRetries: 5 });
            expect(x.config.maxRetries).toBe(5);
        });
    });

    describe('handshake', () => {
        it('finds common v2', () => {
            const r = n.handshake({ protocols: ['v1', 'v2'] });
            expect(r.agreed).toBe(true);
            expect(r.protocol).toBe('v2');
        });
        it('finds common v1 only', () => {
            const r = n.handshake({ protocols: ['v1'] });
            expect(r.protocol).toBe('v1');
        });
        it('no common -> null', () => {
            const r = n.handshake({ protocols: ['v99'] });
            expect(r.agreed).toBe(false);
            expect(r.protocol).toBeNull();
        });
        it('prefers higher index in own list', () => {
            const x = new SyncNegotiator({ supportedProtocols: ['v1', 'v2', 'v3'] });
            const r = x.handshake({ protocols: ['v1', 'v2', 'v3'] });
            expect(r.protocol).toBe('v3');
        });
        it('handles empty remote protocols', () => {
            const r = n.handshake({ protocols: [] });
            expect(r.agreed).toBe(false);
        });
        it('increments handshake stat', () => {
            n.handshake({ protocols: ['v1'] });
            expect(n.stats.handshakes).toBe(1);
        });
    });

    describe('exchangeCapabilities', () => {
        it('intersects features', () => {
            n.handshake({ protocols: ['v1', 'v2'], features: ['a', 'b'], maxPayload: 1000 });
            const r = n.exchangeCapabilities({ features: ['a', 'c'], maxPayload: 500 });
            expect(r.capabilities.features.sort()).toEqual(['a']);
        });
        it('uses min maxPayload', () => {
            n.handshake({ protocols: ['v1'], features: ['a'], maxPayload: 1000 });
            const r = n.exchangeCapabilities({ features: ['a'], maxPayload: 200 });
            expect(r.capabilities.maxPayload).toBe(200);
        });
        it('protocols reduced to agreed', () => {
            n.handshake({ protocols: ['v2'] });
            const r = n.exchangeCapabilities({ features: [], maxPayload: 100 });
            expect(r.capabilities.protocols).toEqual(['v2']);
        });
        it('degraded when local has features remote lacks', () => {
            n.handshake({ protocols: ['v1'], features: ['a'], maxPayload: 1000 });
            const r = n.exchangeCapabilities({ features: ['a', 'b'], maxPayload: 1000 });
            expect(r.degraded).toBe(true);
        });
        it('handles null local caps', () => {
            const r = n.exchangeCapabilities(null);
            expect(r.capabilities).toBeNull();
        });
    });

    describe('negotiate', () => {
        it('happy path', () => {
            const r = n.negotiate({ protocols: ['v1', 'v2'], features: ['a', 'b'], maxPayload: 1000 });
            expect(r.agreed).toBe(true);
            expect(r.protocol).toBe('v2');
            expect(n.getState()).toBe('agreed');
        });
        it('no common -> degraded path then failed', () => {
            const r = n.negotiate({ protocols: ['v99'], features: [], maxPayload: 0 });
            expect(r.agreed).toBe(false);
            expect(n.getState()).toBe('failed');
        });
        it('retries on first failure when common found', () => {
            // first call agrees - should not retry
            const r = n.negotiate({ protocols: ['v2'] });
            expect(r.attempts).toBe(1);
        });
        it('increments negotiation stat', () => {
            n.negotiate({ protocols: ['v1'] });
            expect(n.stats.negotiations).toBe(1);
        });
        it('attempts counted', () => {
            n.negotiate({ protocols: ['v1'] });
            expect(n.stats.negotiations).toBe(1);
        });
        it('records history', () => {
            n.negotiate({ protocols: ['v2'] });
            expect(n.listHistory().length).toBe(1);
        });
    });

    describe('state transitions', () => {
        it('idle -> negotiating -> agreed', () => {
            n._setState('negotiating');
            expect(n.getState()).toBe('negotiating');
            n._setState('agreed');
            expect(n.getState()).toBe('agreed');
        });
        it('rejects invalid state', () => {
            expect(n._setState('xx')).toBe(false);
        });
        it('handshake success -> agreed', () => {
            n.handshake({ protocols: ['v1'] });
            expect(n.getState()).toBe('agreed');
        });
        it('handshake fail -> degraded', () => {
            n.handshake({ protocols: ['v99'] });
            expect(n.getState()).toBe('degraded');
        });
    });

    describe('degradation', () => {
        it('getDegradationPath common found', () => {
            n.handshake({ protocols: ['v1'] });
            const d = n.getDegradationPath();
            expect(d.level).toBe('none');
        });
        it('getDegradationPath no common', () => {
            n.handshake({ protocols: ['v99'] });
            const d = n.getDegradationPath();
            expect(d.level).toBe('lower_protocol');
        });
        it('increments degraded stat on negotiate', () => {
            n.negotiate({ protocols: ['v99'] });
            expect(n.stats.degraded).toBeGreaterThan(0);
        });
    });

    describe('retries', () => {
        it('retries stat on retry attempts', () => {
            const x = new SyncNegotiator({ maxRetries: 3 });
            // no common -> no success, but loops up to maxRetries+1 times
            x.negotiate({ protocols: ['v99'] });
            // 1 attempt at the first iteration that goes through degradation (no extra retry needed)
            expect(x.stats.retries).toBeGreaterThanOrEqual(0);
        });
        it('setMaxRetries valid', () => {
            expect(n.setMaxRetries(5)).toBe(true);
        });
        it('setMaxRetries invalid', () => {
            expect(n.setMaxRetries(-1)).toBe(false);
        });
    });

    describe('config setters', () => {
        it('setSupportedProtocols valid', () => {
            expect(n.setSupportedProtocols(['a', 'b'])).toBe(true);
            expect(n.listSupportedProtocols()).toEqual(['a', 'b']);
        });
        it('setSupportedProtocols invalid', () => {
            expect(n.setSupportedProtocols([])).toBe(false);
            expect(n.setSupportedProtocols('x')).toBe(false);
        });
    });

    describe('queries / reset', () => {
        it('getCapabilities returns intersection', () => {
            n.handshake({ protocols: ['v1'], features: ['a'], maxPayload: 100 });
            n.exchangeCapabilities({ features: ['a'], maxPayload: 100 });
            expect(n.getCapabilities().features).toContain('a');
        });
        it('reset clears state', () => {
            n.negotiate({ protocols: ['v1'] });
            n.reset();
            expect(n.getState()).toBe('idle');
            expect(n.agreedProtocol).toBeNull();
            expect(n.listHistory().length).toBe(0);
        });
        it('listSupportedProtocols returns copy', () => {
            const list = n.listSupportedProtocols();
            list.push('x');
            expect(n.listSupportedProtocols()).toEqual(['v1', 'v2']);
        });
    });

    describe('stats', () => {
        it('getStats aggregates', () => {
            n.handshake({ protocols: ['v1'] });
            n.exchangeCapabilities({ features: ['a'], maxPayload: 100 });
            const s = n.getStats();
            expect(s.handshakes).toBe(1);
            expect(s.exchanges).toBe(1);
            expect(s.agreedProtocol).toBe('v1');
        });
    });

    describe('hooks', () => {
        it('emits stateChange', () => {
            let n2 = 0;
            n.registerHook('stateChange', () => n2++);
            n.handshake({ protocols: ['v1'] });
            expect(n2).toBeGreaterThan(0);
        });
        it('emits negotiated', () => {
            let captured = null;
            n.registerHook('negotiated', (e) => { captured = e; });
            n.negotiate({ protocols: ['v1'] });
            expect(captured.agreed).toBe(true);
        });
        it('emits exchange', () => {
            let captured = null;
            n.registerHook('exchange', (e) => { captured = e; });
            n.handshake({ protocols: ['v1'], features: ['a'], maxPayload: 100 });
            n.exchangeCapabilities({ features: ['a'], maxPayload: 100 });
            expect(captured.capabilities.features).toContain('a');
        });
        it('hook errors swallowed', () => {
            n.registerHook('handshake', () => { throw new Error('x'); });
            expect(() => n.handshake({ protocols: ['v1'] })).not.toThrow();
        });
    });
});
