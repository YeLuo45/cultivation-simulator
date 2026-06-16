/**
 * ChannelAdapter.js - 通道适配器 (序列化/压缩/分片/重连)
 * V1168 Round 44 Iter 11/30 Direction A PowerSync Federation (nanobot)
 * 灵感: nanobot mesh channel codec + reconnect strategy
 */

export const SERIALIZE_FORMATS = ['json', 'msgpack'];
export const COMPRESSION_MODES = ['none', 'gzip'];
export const ADAPTER_STATES = ['idle', 'connected', 'broken'];

export class ChannelAdapter {
    constructor(config = {}) {
        this.config = {
            chunkSize: 4096,
            compression: 'none',
            reconnect: true,
            reconnectMs: 1000,
            ...config,
        };
        this.state = 'idle';
        this.chunkSize = this.config.chunkSize;
        this.compression = this.config.compression;
        this.reconnectAttempts = 0;
        this.lastReconnectAt = 0;
        this.messageHandlers = [];
        this.sentLog = [];   // { raw, serialized, compressed, chunks, ts }
        this.receivedLog = [];
        this.hooks = new Map();
        this.stats = {
            serialized: 0,
            compressed: 0,
            chunked: 0,
            reassembled: 0,
            reconnects: 0,
            messagesReceived: 0,
        };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    // ---- transport state ----
    connect() {
        if (this.state === 'broken' && !this.config.reconnect) return false;
        this.state = 'connected';
        this._emit('connected', { state: this.state });
        return true;
    }

    break() {
        this.state = 'broken';
        this._emit('broken', { state: this.state });
        return true;
    }

    reconnect() {
        if (!this.config.reconnect) return false;
        this.reconnectAttempts++;
        this.lastReconnectAt = Date.now();
        this.state = 'connected';
        this.stats.reconnects++;
        this._emit('reconnected', { attempts: this.reconnectAttempts });
        return true;
    }

    isHealthy() {
        return this.state === 'connected' && this.compression != null;
    }

    isConnected() { return this.state === 'connected'; }
    isBroken() { return this.state === 'broken'; }
    getState() { return this.state; }
    setCompression(mode) {
        if (!COMPRESSION_MODES.includes(mode)) return false;
        this.compression = mode;
        return true;
    }
    setChunkSize(n) {
        if (typeof n !== 'number' || n <= 0) return false;
        this.chunkSize = n;
        this.config.chunkSize = n;
        return true;
    }

    // ---- serialize / compress / chunk ----
    serialize(payload, format = 'json') {
        if (!SERIALIZE_FORMATS.includes(format)) {
            throw new Error(`Unknown serialize format: ${format}`);
        }
        let result;
        if (format === 'json') {
            result = JSON.stringify(payload);
        } else {
            // msgpack stub: JSON with a marker prefix
            result = '\x91' + JSON.stringify(payload);
        }
        this.stats.serialized++;
        this._emit('serialized', { format, size: result.length });
        return result;
    }

    compress(data) {
        if (this.compression === 'none') {
            return { data, compressed: false, originalSize: data.length, size: data.length };
        }
        // gzip stub: prepend a "gz:" marker + base64-ish, also track ratio
        // For test purposes we use a reversible marker: 'gz:' + data (length reduction simulated)
        const compressed = 'gz:' + data;
        this.stats.compressed++;
        this._emit('compressed', { originalSize: data.length, size: compressed.length });
        return { data: compressed, compressed: true, originalSize: data.length, size: compressed.length };
    }

    decompress(packet) {
        if (typeof packet === 'string' && packet.startsWith('gz:')) {
            return packet.slice(3);
        }
        return packet;
    }

    chunk(data) {
        const size = this.chunkSize;
        if (typeof data !== 'string') data = String(data);
        if (data.length === 0) return [];
        const chunks = [];
        const total = data.length;
        const totalChunks = Math.ceil(total / size);
        for (let i = 0; i < totalChunks; i++) {
            const start = i * size;
            const end = Math.min(start + size, total);
            chunks.push({
                id: this._newId(),
                index: i,
                total: totalChunks,
                size: end - start,
                data: data.slice(start, end),
            });
        }
        this.stats.chunked++;
        this._emit('chunked', { count: chunks.length, totalSize: total });
        return chunks;
    }

    reassemble(chunks) {
        if (!Array.isArray(chunks) || chunks.length === 0) return '';
        // sort by index
        const sorted = chunks.slice().sort((a, b) => a.index - b.index);
        const result = sorted.map(c => c.data).join('');
        this.stats.reassembled++;
        this._emit('reassembled', { count: sorted.length, total: result.length });
        return result;
    }

    // ---- high-level send/recv ----
    send(payload, format = 'json') {
        if (this.state !== 'connected') {
            this._emit('error', { reason: 'not_connected' });
            return null;
        }
        const serialized = this.serialize(payload, format);
        const compressed = this.compress(serialized);
        const chunks = this.chunk(compressed.data);
        const entry = {
            raw: payload,
            format,
            serialized,
            compressed,
            chunks,
            ts: Date.now(),
        };
        this.sentLog.push(entry);
        this._emit('sent', entry);
        return entry;
    }

    onMessage(handler) {
        if (typeof handler !== 'function') return false;
        this.messageHandlers.push(handler);
        return true;
    }

    receive(packet) {
        // packet: { chunks: [...] } or { data: 'gz:...' } or { raw: '...' }
        let raw = '';
        if (packet && Array.isArray(packet.chunks)) {
            raw = this.reassemble(packet.chunks);
        } else if (packet && typeof packet.data === 'string') {
            raw = packet.data;
        } else if (packet && typeof packet.raw === 'string') {
            raw = packet.raw;
        }
        const decompressed = this.decompress(raw);
        const entry = { raw, decompressed, ts: Date.now() };
        this.receivedLog.push(entry);
        this.stats.messagesReceived++;
        this._emit('received', entry);
        for (const h of this.messageHandlers) {
            try { h(entry); } catch (_) { /* ignore */ }
        }
        return entry;
    }

    // ---- queries ----
    listSent() { return this.sentLog.slice(); }
    listReceived() { return this.receivedLog.slice(); }
    getReconnectAttempts() { return this.reconnectAttempts; }
    getLastReconnectAt() { return this.lastReconnectAt; }
    clear() {
        this.sentLog = [];
        this.receivedLog = [];
        this.messageHandlers = [];
    }
    getStats() {
        return {
            ...this.stats,
            state: this.state,
            chunkSize: this.chunkSize,
            compression: this.compression,
            sent: this.sentLog.length,
            received: this.receivedLog.length,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.ChannelAdapter = ChannelAdapter;
    globalThis.SERIALIZE_FORMATS = SERIALIZE_FORMATS;
    globalThis.COMPRESSION_MODES = COMPRESSION_MODES;
    globalThis.ADAPTER_STATES = ADAPTER_STATES;
}
