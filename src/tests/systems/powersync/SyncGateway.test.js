/**
 * SyncGateway.test.js - 同步协议网关测试
 * V1167 Round 44 Iter 10/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SyncGateway, PROTOCOLS, GATEWAY_STATES } from '../../../systems/powersync/SyncGateway.js';

describe('SyncGateway', () => {
    let gw;
    beforeEach(() => { gw = new SyncGateway(); });

    describe('exports', () => {
        it('should export PROTOCOLS', () => {
            expect(PROTOCOLS).toContain('websocket');
            expect(PROTOCOLS).toContain('http');
            expect(PROTOCOLS).toContain('quic');
        });
        it('should export GATEWAY_STATES', () => {
            expect(GATEWAY_STATES).toContain('disconnected');
            expect(GATEWAY_STATES).toContain('connecting');
            expect(GATEWAY_STATES).toContain('connected');
            expect(GATEWAY_STATES).toContain('error');
        });
    });

    describe('constructor', () => {
        it('should initialize disconnected', () => {
            expect(gw.state).toBe('disconnected');
            expect(gw.protocol).toBeNull();
        });
        it('should accept defaultProtocol', () => {
            const g = new SyncGateway({ defaultProtocol: 'http' });
            expect(g.config.defaultProtocol).toBe('http');
        });
    });

    describe('connect', () => {
        it('should set state to connected', () => {
            const r = gw.connect('websocket');
            expect(gw.state).toBe('connected');
            expect(r.state).toBe('connected');
        });
        it('should set protocol', () => {
            gw.connect('http');
            expect(gw.protocol).toBe('http');
        });
        it('should use default protocol', () => {
            gw.connect();
            expect(gw.protocol).toBe('websocket');
        });
        it('should throw on unknown protocol', () => {
            expect(() => gw.connect('ftp')).toThrow();
        });
        it('should set state to error on unknown protocol', () => {
            try { gw.connect('ftp'); } catch (_) {}
            expect(gw.state).toBe('error');
        });
        it('should increment connect stat', () => {
            gw.connect('websocket');
            expect(gw.stats.connect).toBe(1);
        });
        it('should return protocol and state', () => {
            const r = gw.connect('quic');
            expect(r.protocol).toBe('quic');
            expect(r.state).toBe('connected');
        });
    });

    describe('disconnect', () => {
        it('should return false when already disconnected', () => {
            expect(gw.disconnect()).toBe(false);
        });
        it('should clear protocol and state', () => {
            gw.connect('websocket');
            gw.disconnect();
            expect(gw.protocol).toBeNull();
            expect(gw.state).toBe('disconnected');
        });
        it('should increment disconnect stat', () => {
            gw.connect('websocket');
            gw.disconnect();
            expect(gw.stats.disconnect).toBe(1);
        });
    });

    describe('send', () => {
        it('should send when connected', () => {
            gw.connect('websocket');
            const ok = gw.send({ data: 'x' });
            expect(ok).toBe(true);
        });
        it('should fail when disconnected', () => {
            const ok = gw.send({ data: 'x' });
            expect(ok).toBe(false);
        });
        it('should track in sentLog', () => {
            gw.connect('websocket');
            gw.send({ data: 'a' });
            gw.send({ data: 'b' });
            expect(gw.sentLog.length).toBe(2);
        });
        it('should increment sent stat', () => {
            gw.connect('websocket');
            gw.send({ data: 'x' });
            expect(gw.stats.sent).toBe(1);
        });
        it('should call message handlers', () => {
            gw.connect('websocket');
            const received = [];
            gw.onMessage((m) => received.push(m));
            gw.send({ data: 'x' });
            expect(received.length).toBe(1);
        });
        it('should increment received stat', () => {
            gw.connect('websocket');
            gw.onMessage(() => {});
            gw.send({ data: 'x' });
            expect(gw.stats.received).toBe(1);
        });
    });

    describe('onMessage', () => {
        it('should register handler', () => {
            const ok = gw.onMessage(() => {});
            expect(ok).toBe(true);
        });
        it('should reject non-function', () => {
            expect(gw.onMessage('not a function')).toBe(false);
        });
        it('should support multiple handlers', () => {
            let count = 0;
            gw.onMessage(() => count++);
            gw.onMessage(() => count++);
            gw.connect('websocket');
            gw.send({ a: 1 });
            expect(count).toBe(2);
        });
        it('handler errors should not crash', () => {
            gw.connect('websocket');
            gw.onMessage(() => { throw new Error('boom'); });
            expect(() => gw.send({ a: 1 })).not.toThrow();
        });
    });

    describe('queries', () => {
        it('listSent returns log', () => {
            gw.connect('websocket');
            gw.send({ a: 1 });
            expect(gw.listSent().length).toBe(1);
        });
        it('listProtocols returns PROTOCOLS copy', () => {
            const list = gw.listProtocols();
            expect(list).toContain('websocket');
            expect(list.length).toBe(3);
        });
        it('isConnected reflects state', () => {
            expect(gw.isConnected()).toBe(false);
            gw.connect('websocket');
            expect(gw.isConnected()).toBe(true);
        });
        it('getProtocol returns current', () => {
            gw.connect('http');
            expect(gw.getProtocol()).toBe('http');
        });
        it('getState returns state', () => {
            expect(gw.getState()).toBe('disconnected');
        });
        it('clear empties log and handlers', () => {
            gw.connect('websocket');
            gw.send({ a: 1 });
            gw.onMessage(() => {});
            gw.clear();
            expect(gw.sentLog.length).toBe(0);
            expect(gw.messageHandlers.length).toBe(0);
        });
    });

    describe('stats', () => {
        it('getStats includes all counters', () => {
            gw.connect('websocket');
            gw.onMessage(() => {});
            gw.send({ a: 1 });
            const s = gw.getStats();
            expect(s.connect).toBe(1);
            expect(s.sent).toBe(1);
            expect(s.received).toBe(1);
            expect(s.state).toBe('connected');
            expect(s.protocol).toBe('websocket');
        });
    });

    describe('hooks', () => {
        it('should emit connecting then connected', () => {
            const events = [];
            gw.registerHook('connecting', () => events.push('connecting'));
            gw.registerHook('connected', () => events.push('connected'));
            gw.connect('websocket');
            expect(events).toContain('connecting');
            expect(events).toContain('connected');
        });
        it('should emit disconnected', () => {
            let fired = false;
            gw.registerHook('disconnected', () => { fired = true; });
            gw.connect('websocket');
            gw.disconnect();
            expect(fired).toBe(true);
        });
        it('should emit sent', () => {
            let captured = null;
            gw.registerHook('sent', (p) => { captured = p; });
            gw.connect('websocket');
            gw.send({ a: 1 });
            expect(captured.payload.a).toBe(1);
        });
        it('should handle hook errors silently', () => {
            gw.registerHook('connected', () => { throw new Error('boom'); });
            expect(() => gw.connect('websocket')).not.toThrow();
        });
    });
});
