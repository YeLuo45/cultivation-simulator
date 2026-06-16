/**
 * CultivationMCPTransport.test.js - 修真 MCP Transport 测试
 * V860 Iteration 2/30 Round 35 - Direction F
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    StdioTransport, HTTPTransport, SSEStream, WebSocketTransport, TransportRegistry,
    TRANSPORT_TYPES, FRAMING_CONFIG, SSE_EVENTS
} from '../../../systems/ai/CultivationMCPTransport.js';

describe('CultivationMCPTransport', () => {
    describe('StdioTransport', () => {
        let t;
        beforeEach(() => { t = new StdioTransport({ setupListeners: false }); });

        it('should default to type stdio', () => {
            expect(t.type).toBe('stdio');
        });

        it('should not start until start() called', () => {
            expect(t.isStarted()).toBe(false);
            t.start();
            expect(t.isStarted()).toBe(true);
        });

        it('should parse Content-Length framed message', () => {
            t.start();
            const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' });
            const frame = `Content-Length: ${body.length}\r\n\r\n${body}`;
            t.injectForTesting(frame);
            expect(t.stats.messagesReceived).toBe(1);
        });

        it('should parse LF-only framed message', () => {
            t.start();
            const body = JSON.stringify({ a: 1 });
            const frame = `Content-Length: ${body.length}\n\n${body}`;
            t.injectForTesting(frame);
            expect(t.stats.messagesReceived).toBe(1);
        });

        it('should parse headerless JSON messages', () => {
            t.start();
            t.injectForTesting('{"a":1}\n');
            expect(t.stats.messagesReceived).toBe(1);
        });

        it('should buffer incomplete frames', () => {
            t.start();
            const body = JSON.stringify({ a: 1 });
            t.injectForTesting(`Content-Length: ${body.length}\r\n\r\n${body.substring(0, 3)}`);
            expect(t.stats.messagesReceived).toBe(0);
            t.injectForTesting(body.substring(3));
            expect(t.stats.messagesReceived).toBe(1);
        });

        it('should reject oversized messages', () => {
            t.start();
            t.injectForTesting(`Content-Length: 999999999\r\n\r\n{}`);
            expect(t.stats.errors).toBe(1);
        });

        it('should send framed message', () => {
            t.start();
            const r = t.send({ jsonrpc: '2.0', id: 1, result: 'ok' });
            expect(r.success).toBe(true);
            expect(t.stats.messagesSent).toBe(1);
        });

        it('should refuse to send when not started', () => {
            const r = t.send({ a: 1 });
            expect(r.success).toBe(false);
            expect(r.error).toBe('NOT_STARTED');
        });

        it('should propagate errors from message handler', () => {
            t.setMessageHandler(() => { throw new Error('handler fail'); });
            t.start();
            t.injectForTesting('{"a":1}\n');
            expect(t.stats.errors).toBe(1);
        });
    });

    describe('HTTPTransport', () => {
        let t;
        beforeEach(() => { t = new HTTPTransport(); });

        it('should default to type http', () => {
            expect(t.type).toBe('http');
        });

        it('should reject when not started', () => {
            const r = t.handleRequest({ method: 'POST', path: '/', body: {} });
            expect(r.status).toBe(503);
        });

        it('should handle POST /mcp with JSON body', () => {
            t.start();
            const r = t.handleRequest({ method: 'POST', path: '/mcp', body: { a: 1 } });
            expect(r.status).toBe(200);
            expect(r.body.ack).toBe(true);
            expect(t.stats.messagesReceived).toBe(1);
        });

        it('should handle POST / with JSON body', () => {
            t.start();
            const r = t.handleRequest({ method: 'POST', path: '/', body: { a: 1 } });
            expect(r.status).toBe(200);
        });

        it('should parse string body as JSON', () => {
            t.start();
            const r = t.handleRequest({ method: 'POST', path: '/', body: '{"a":2}' });
            expect(r.status).toBe(200);
            expect(t.stats.messagesReceived).toBe(1);
        });

        it('should reject invalid JSON body', () => {
            t.start();
            const r = t.handleRequest({ method: 'POST', path: '/', body: 'not json' });
            expect(r.status).toBe(400);
            expect(t.stats.errors).toBe(1);
        });

        it('should handle GET /sse', () => {
            t.start();
            const r = t.handleRequest({ method: 'GET', path: '/sse' });
            expect(r.status).toBe(200);
            expect(r.contentType).toBe('text/event-stream');
            expect(r.sseClientId).toBeTruthy();
            expect(t.getSSEClientCount()).toBe(1);
        });

        it('should use custom clientId for SSE', () => {
            t.start();
            t.handleRequest({ method: 'GET', path: '/sse', clientId: 'my-client' });
            expect(t.getSSEClientCount()).toBe(1);
        });

        it('should remove SSE client', () => {
            t.start();
            t.handleRequest({ method: 'GET', path: '/sse', clientId: 'c1' });
            expect(t.removeSSEClient('c1')).toBe(true);
            expect(t.getSSEClientCount()).toBe(0);
        });

        it('should return 404 for unknown route', () => {
            t.start();
            const r = t.handleRequest({ method: 'PUT', path: '/foo' });
            expect(r.status).toBe(404);
        });

        it('should send to specific client', () => {
            t.start();
            t.handleRequest({ method: 'GET', path: '/sse', clientId: 'c1' });
            const r = t.send({ msg: 'hi' }, 'c1');
            expect(r.success).toBe(true);
            expect(r.sseEvent).toContain('event: message');
        });

        it('should broadcast to all SSE clients', () => {
            t.start();
            t.handleRequest({ method: 'GET', path: '/sse', clientId: 'c1' });
            t.handleRequest({ method: 'GET', path: '/sse', clientId: 'c2' });
            const r = t.broadcast({ msg: 'broadcast' });
            expect(r.success).toBe(true);
            expect(r.clientCount).toBe(2);
        });

        it('should refuse to send when not started', () => {
            const r = t.send({ a: 1 });
            expect(r.success).toBe(false);
        });

        it('should use custom handler when set', () => {
            t.start();
            t.setCustomHandler(req => ({ status: 200, body: { custom: true } }));
            const r = t.handleRequest({ method: 'POST', path: '/' });
            expect(r.body.custom).toBe(true);
        });

        it('should catch custom handler errors', () => {
            t.start();
            t.setCustomHandler(() => { throw new Error('handler err'); });
            const r = t.handleRequest({ method: 'POST', path: '/' });
            expect(r.status).toBe(500);
        });
    });

    describe('SSEStream', () => {
        let s;
        beforeEach(() => { s = new SSEStream('client-1'); });

        it('should start open', () => {
            expect(s.isClosed()).toBe(false);
        });

        it('should record events', () => {
            const r = s.send('message', { hello: 'world' });
            expect(r.success).toBe(true);
            expect(s.getEventCount()).toBe(1);
        });

        it('should increment event ids', () => {
            s.send('message', { a: 1 });
            s.send('message', { a: 2 });
            const events = s.getEvents();
            expect(events[0].id).toBe(1);
            expect(events[1].id).toBe(2);
        });

        it('should close', () => {
            s.close();
            expect(s.isClosed()).toBe(true);
        });

        it('should refuse events after close', () => {
            s.close();
            const r = s.send('message', { a: 1 });
            expect(r.success).toBe(false);
            expect(r.error).toBe('CLOSED');
        });
    });

    describe('WebSocketTransport', () => {
        let t;
        beforeEach(() => { t = new WebSocketTransport(); });

        it('should default to type websocket', () => {
            expect(t.type).toBe('websocket');
        });

        it('should connect and track client', () => {
            t.start();
            const r = t.onConnect('client-1', { ip: '127.0.0.1' });
            expect(r.success).toBe(true);
            expect(t.getClientCount()).toBe(1);
        });

        it('should disconnect client', () => {
            t.start();
            t.onConnect('c1');
            expect(t.onDisconnect('c1').success).toBe(true);
            expect(t.getClientCount()).toBe(0);
        });

        it('should reject frame for unknown client', () => {
            t.start();
            const r = t.onFrame('unknown', { opcode: 0x1, fin: true, payload: '{}' });
            expect(r.success).toBe(false);
        });

        it('should parse complete text frame', () => {
            t.start();
            t.onConnect('c1');
            t.onFrame('c1', { opcode: 0x1, fin: true, payload: '{"a":1}' });
            expect(t.stats.messagesReceived).toBe(1);
        });

        it('should accumulate fragments and dispatch on final', () => {
            t.start();
            t.onConnect('c1');
            t.onFrame('c1', { opcode: 0x1, fin: false, payload: '{"a"' });
            t.onFrame('c1', { opcode: 0x0, fin: false, payload: ':1}' });
            expect(t.stats.messagesReceived).toBe(0);
            t.onFrame('c1', { opcode: 0x0, fin: true, payload: '' });
            expect(t.stats.messagesReceived).toBe(1);
        });

        it('should reject oversized frames', () => {
            t.start();
            t.onConnect('c1');
            const big = JSON.stringify({ data: 'x'.repeat(20 * 1024 * 1024) });
            const r = t.send('c1', { huge: big });
            expect(r.success).toBe(false);
            expect(r.error).toBe('FRAME_TOO_LARGE');
        });

        it('should send to specific client', () => {
            t.start();
            t.onConnect('c1');
            const r = t.send('c1', { msg: 'hi' });
            expect(r.success).toBe(true);
            expect(r.frame.opcode).toBe(0x1);
        });

        it('should broadcast to all clients', () => {
            t.start();
            t.onConnect('c1');
            t.onConnect('c2');
            const r = t.broadcast({ msg: 'all' });
            expect(r.success).toBe(true);
            expect(r.clientCount).toBe(2);
        });

        it('should clear fragments on disconnect', () => {
            t.start();
            t.onConnect('c1');
            t.onFrame('c1', { opcode: 0x1, fin: false, payload: '{"a"' });
            t.onDisconnect('c1');
            expect(t.fragments.has('c1')).toBe(false);
        });

        it('should count invalid JSON errors', () => {
            t.start();
            t.onConnect('c1');
            t.onFrame('c1', { opcode: 0x1, fin: true, payload: 'not json' });
            expect(t.stats.errors).toBe(1);
        });
    });

    describe('TransportRegistry', () => {
        let registry;
        beforeEach(() => { registry = new TransportRegistry(); });

        it('should register a transport', () => {
            const t = new StdioTransport({ setupListeners: false });
            const r = registry.register('stdio-1', t);
            expect(r.success).toBe(true);
        });

        it('should unregister a transport', () => {
            const t = new StdioTransport({ setupListeners: false });
            registry.register('stdio-1', t);
            expect(registry.unregister('stdio-1').success).toBe(true);
        });

        it('should list transport names', () => {
            registry.register('s1', new StdioTransport({ setupListeners: false }));
            registry.register('h1', new HTTPTransport());
            expect(registry.list()).toEqual(['s1', 'h1']);
        });

        it('should dispatch message to handler', () => {
            let received = null;
            registry.setMessageHandler((name, msg) => { received = { name, msg }; });
            const t = new StdioTransport({ setupListeners: false });
            t.start();
            registry.register('s1', t);
            t.injectForTesting('{"a":1}\n');
            expect(received).toEqual({ name: 's1', msg: { a: 1 } });
        });

        it('should start all transports', () => {
            const t1 = new StdioTransport({ setupListeners: false });
            const t2 = new HTTPTransport();
            registry.register('s1', t1);
            registry.register('h1', t2);
            const r = registry.startAll();
            expect(r.length).toBe(2);
            expect(t1.isStarted()).toBe(true);
            expect(t2.isStarted()).toBe(true);
        });

        it('should stop all transports', () => {
            const t1 = new StdioTransport({ setupListeners: false });
            registry.register('s1', t1);
            t1.start();
            registry.stopAll();
            expect(t1.isStarted()).toBe(false);
        });

        it('should collect stats for all transports', () => {
            const t1 = new StdioTransport({ setupListeners: false });
            t1.start();
            registry.register('s1', t1);
            const stats = registry.getAllStats();
            expect(stats.s1.type).toBe('stdio');
        });

        it('should return null for missing transport', () => {
            expect(registry.get('missing')).toBe(null);
        });
    });

    describe('module exports', () => {
        it('should export all 4 transport types', () => {
            expect(TRANSPORT_TYPES.STDIO).toBe('stdio');
            expect(TRANSPORT_TYPES.HTTP).toBe('http');
            expect(TRANSPORT_TYPES.SSE).toBe('sse');
            expect(TRANSPORT_TYPES.WEBSOCKET).toBe('websocket');
        });

        it('should export framing config', () => {
            expect(FRAMING_CONFIG.maxMessageSize).toBe(10 * 1024 * 1024);
        });

        it('should export SSE event types', () => {
            expect(SSE_EVENTS.MESSAGE).toBe('message');
        });
    });
});
