/**
 * ChannelAdapter.test.js - 通道适配器测试
 * V1168 Round 44 Iter 11/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    ChannelAdapter,
    SERIALIZE_FORMATS,
    COMPRESSION_MODES,
    ADAPTER_STATES,
} from '../../../systems/powersync/ChannelAdapter.js';

describe('ChannelAdapter', () => {
    let ca;
    beforeEach(() => { ca = new ChannelAdapter({ chunkSize: 10, compression: 'none' }); });

    describe('exports', () => {
        it('should export SERIALIZE_FORMATS', () => {
            expect(SERIALIZE_FORMATS).toContain('json');
            expect(SERIALIZE_FORMATS).toContain('msgpack');
        });
        it('should export COMPRESSION_MODES', () => {
            expect(COMPRESSION_MODES).toContain('none');
            expect(COMPRESSION_MODES).toContain('gzip');
        });
        it('should export ADAPTER_STATES', () => {
            expect(ADAPTER_STATES).toContain('idle');
            expect(ADAPTER_STATES).toContain('connected');
            expect(ADAPTER_STATES).toContain('broken');
        });
    });

    describe('constructor', () => {
        it('should start idle', () => {
            expect(ca.state).toBe('idle');
        });
        it('should use defaults', () => {
            const x = new ChannelAdapter();
            expect(x.chunkSize).toBe(4096);
            expect(x.compression).toBe('none');
        });
        it('should accept custom config', () => {
            const x = new ChannelAdapter({ chunkSize: 100, compression: 'gzip' });
            expect(x.chunkSize).toBe(100);
            expect(x.compression).toBe('gzip');
        });
    });

    describe('serialize', () => {
        it('should serialize json', () => {
            const s = ca.serialize({ a: 1 }, 'json');
            expect(s).toBe('{"a":1}');
        });
        it('should serialize msgpack with marker', () => {
            const s = ca.serialize({ a: 1 }, 'msgpack');
            expect(s.startsWith('\x91')).toBe(true);
        });
        it('should throw on unknown format', () => {
            expect(() => ca.serialize({}, 'xml')).toThrow();
        });
        it('should increment stat', () => {
            ca.serialize({ a: 1 });
            expect(ca.stats.serialized).toBe(1);
        });
    });

    describe('compress', () => {
        it('should return as-is when mode=none', () => {
            const r = ca.compress('hello');
            expect(r.compressed).toBe(false);
        });
        it('should add gz: prefix when gzip', () => {
            const x = new ChannelAdapter({ compression: 'gzip' });
            const r = x.compress('hello');
            expect(r.compressed).toBe(true);
            expect(r.data.startsWith('gz:')).toBe(true);
        });
        it('should decompress gz: prefix back', () => {
            const x = new ChannelAdapter({ compression: 'gzip' });
            const r = x.compress('hello');
            expect(x.decompress(r.data)).toBe('hello');
        });
    });

    describe('chunk', () => {
        it('should split by chunkSize', () => {
            const chunks = ca.chunk('abcdefghijklmn');
            expect(chunks.length).toBe(2); // size 10
            expect(chunks[0].data).toBe('abcdefghij');
            expect(chunks[1].data).toBe('klmn');
        });
        it('should mark index and total', () => {
            const chunks = ca.chunk('abcdefghij');
            expect(chunks[0].index).toBe(0);
            expect(chunks[0].total).toBe(1);
        });
        it('should produce empty for empty string', () => {
            expect(ca.chunk('').length).toBe(0);
        });
        it('should reassemble back to original', () => {
            const orig = 'abcdefghijklmnopqrst';
            const chunks = ca.chunk(orig);
            const back = ca.reassemble(chunks);
            expect(back).toBe(orig);
        });
        it('should reassemble in any order', () => {
            const orig = 'abcdefghijklmnop';
            const chunks = ca.chunk(orig);
            const shuffled = [chunks[1], chunks[0]];
            expect(ca.reassemble(shuffled)).toBe(orig);
        });
    });

    describe('connect/break/reconnect', () => {
        it('should connect', () => {
            expect(ca.connect()).toBe(true);
            expect(ca.state).toBe('connected');
        });
        it('should refuse connect when broken and reconnect=false', () => {
            const x = new ChannelAdapter({ reconnect: false });
            x.break();
            expect(x.connect()).toBe(false);
        });
        it('should break', () => {
            ca.connect();
            ca.break();
            expect(ca.state).toBe('broken');
        });
        it('should reconnect and increment attempts', () => {
            ca.connect();
            ca.break();
            const ok = ca.reconnect();
            expect(ok).toBe(true);
            expect(ca.state).toBe('connected');
            expect(ca.getReconnectAttempts()).toBe(1);
            expect(ca.stats.reconnects).toBe(1);
        });
        it('should not reconnect when disabled', () => {
            const x = new ChannelAdapter({ reconnect: false });
            x.break();
            expect(x.reconnect()).toBe(false);
        });
        it('isHealthy when connected', () => {
            ca.connect();
            expect(ca.isHealthy()).toBe(true);
        });
        it('isHealthy false when broken', () => {
            ca.connect();
            ca.break();
            expect(ca.isHealthy()).toBe(false);
        });
        it('isHealthy false when idle', () => {
            expect(ca.isHealthy()).toBe(false);
        });
    });

    describe('send/recv', () => {
        it('should fail send when not connected', () => {
            const r = ca.send({ a: 1 });
            expect(r).toBeNull();
        });
        it('should send and produce chunks', () => {
            ca.connect();
            const r = ca.send({ a: 1 });
            expect(r.chunks.length).toBe(1);
        });
        it('should call onMessage handler on receive', () => {
            const received = [];
            ca.onMessage((m) => received.push(m));
            ca.receive({ data: 'hello' });
            expect(received.length).toBe(1);
        });
        it('onMessage should reject non-function', () => {
            expect(ca.onMessage('nope')).toBe(false);
        });
        it('receive with chunks should reassemble', () => {
            ca.connect();
            const sent = ca.send({ x: 'y'.repeat(15) });
            const back = ca.receive({ chunks: sent.chunks });
            expect(back.decompressed).toBeTruthy();
        });
        it('receive with raw field', () => {
            const r = ca.receive({ raw: 'rawdata' });
            expect(r.decompressed).toBe('rawdata');
        });
        it('should handle handler errors silently', () => {
            ca.onMessage(() => { throw new Error('boom'); });
            expect(() => ca.receive({ data: 'x' })).not.toThrow();
        });
    });

    describe('config setters', () => {
        it('setCompression valid', () => {
            expect(ca.setCompression('gzip')).toBe(true);
            expect(ca.compression).toBe('gzip');
        });
        it('setCompression invalid', () => {
            expect(ca.setCompression('rar')).toBe(false);
        });
        it('setChunkSize valid', () => {
            expect(ca.setChunkSize(100)).toBe(true);
            expect(ca.chunkSize).toBe(100);
        });
        it('setChunkSize invalid', () => {
            expect(ca.setChunkSize(0)).toBe(false);
            expect(ca.setChunkSize('big')).toBe(false);
        });
    });

    describe('queries', () => {
        it('listSent', () => {
            ca.connect();
            ca.send({ a: 1 });
            expect(ca.listSent().length).toBe(1);
        });
        it('listReceived', () => {
            ca.receive({ data: 'x' });
            expect(ca.listReceived().length).toBe(1);
        });
        it('clear', () => {
            ca.connect();
            ca.send({ a: 1 });
            ca.receive({ data: 'x' });
            ca.clear();
            expect(ca.sentLog.length).toBe(0);
            expect(ca.receivedLog.length).toBe(0);
        });
    });

    describe('hooks', () => {
        it('should emit connected', () => {
            let fired = false;
            ca.registerHook('connected', () => { fired = true; });
            ca.connect();
            expect(fired).toBe(true);
        });
        it('should emit sent', () => {
            let captured = null;
            ca.registerHook('sent', (e) => { captured = e; });
            ca.connect();
            ca.send({ a: 1 });
            expect(captured.raw.a).toBe(1);
        });
        it('should emit received', () => {
            let captured = null;
            ca.registerHook('received', (e) => { captured = e; });
            ca.receive({ data: 'x' });
            expect(captured.decompressed).toBe('x');
        });
        it('hook errors swallowed', () => {
            ca.registerHook('connected', () => { throw new Error('x'); });
            expect(() => ca.connect()).not.toThrow();
        });
    });

    describe('stats', () => {
        it('getStats includes all', () => {
            ca.connect();
            ca.send({ a: 1 });
            const s = ca.getStats();
            expect(s.state).toBe('connected');
            expect(s.sent).toBe(1);
            expect(s.chunkSize).toBe(10);
        });
    });
});
