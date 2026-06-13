/**
 * CultivationMCPTransport.js - 修真 MCP 多协议传输层
 * V860 P-20260613-002 Iteration 2/30 Round 35 - Direction F: MCP Server Transport
 *
 * 多协议传输层：让 MCP Server 通过 stdio / HTTP / SSE / WebSocket 暴露
 * - 核心 API: send / onMessage / start / stop / getStats
 * - 数据结构: { type, contentLength?, payload, transportType, stats }
 * - 配置: TRANSPORT_TYPES, FRAMING_CONFIG
 */

export const TRANSPORT_TYPES = {
    STDIO: 'stdio',
    HTTP: 'http',
    SSE: 'sse',
    WEBSOCKET: 'websocket',
};

export const FRAMING_CONFIG = {
    maxMessageSize: 10 * 1024 * 1024, // 10MB
    contentLengthHeader: 'Content-Length:',
    sseEventPrefix: 'data: ',
    sseKeepaliveMs: 15000,
    wsMaxFrameSize: 16 * 1024 * 1024,
    defaultHttpPort: 8765,
    defaultWsPort: 8766,
};

export const SSE_EVENTS = {
    MESSAGE: 'message',
    OPEN: 'open',
    CLOSE: 'close',
    KEEPALIVE: 'keepalive',
    ERROR: 'error',
};

/**
 * BaseTransport - 传输层抽象基类
 */
class BaseTransport {
    constructor(type, config = {}) {
        this.type = type;
        this.config = { ...FRAMING_CONFIG, ...config };
        this.stats = {
            messagesSent: 0,
            messagesReceived: 0,
            bytesReceived: 0,
            bytesSent: 0,
            errors: 0,
            startedAt: null,
        };
        this.started = false;
        this._messageHandler = null;
    }

    setMessageHandler(handler) { this._messageHandler = handler; }
    getStats() { return { ...this.stats, type: this.type, started: this.started }; }
    isStarted() { return this.started; }

    _emitMessage(raw) {
        this.stats.messagesReceived++;
        this.stats.bytesReceived += raw.length || 0;
        if (this._messageHandler) {
            try { this._messageHandler(raw); } catch (e) { this.stats.errors++; }
        }
    }

    _recordSend(bytes) {
        this.stats.messagesSent++;
        this.stats.bytesSent += bytes;
    }

    start() {
        this.started = true;
        this.stats.startedAt = Date.now();
        return { success: true };
    }

    stop() {
        this.started = false;
        this.stats.startedAt = null;
        return { success: true };
    }
}

/**
 * StdioTransport - 标准输入输出传输
 * LSP/MCP 标准协议：Content-Length 头 + 空行 + JSON 消息
 */
export class StdioTransport extends BaseTransport {
    constructor(config = {}) {
        super(TRANSPORT_TYPES.STDIO, config);
        this.buffer = '';
        this._setupListeners = config.setupListeners !== false;
    }

    start() {
        super.start();
        if (this._setupListeners && typeof process !== 'undefined') {
            if (process.stdin && process.stdin.setEncoding) {
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', chunk => this._onData(chunk));
            }
        }
        return { success: true };
    }

    _onData(chunk) {
        this.buffer += chunk;
        while (true) {
            const parsed = this._parseFramed(this.buffer);
            if (parsed === null) break;
            this.buffer = parsed.rest;
            this._emitMessage(parsed.message);
        }
    }

    _parseFramed(input) {
        if (input.length === 0) return null;
        // 1. Try CRLF double-LF
        let headerEnd = input.indexOf('\r\n\r\n');
        let sep = '\r\n\r\n';
        // 2. Try LF double-LF
        if (headerEnd === -1) {
            headerEnd = input.indexOf('\n\n');
            sep = '\n\n';
        }
        // 3. Headerless mode: find first LF and treat pre-LF line as JSON
        if (headerEnd === -1) {
            const lfIdx = input.indexOf('\n');
            if (lfIdx === -1) return null;
            const line = input.substring(0, lfIdx).trim();
            if (line.length === 0) return { message: null, rest: input.substring(lfIdx + 1) };
            try {
                const obj = JSON.parse(line);
                return { message: obj, rest: input.substring(lfIdx + 1) };
            } catch (e) {
                this.stats.errors++;
                return { message: null, rest: input.substring(lfIdx + 1) };
            }
        }
        return this._readContentLength(input, headerEnd, sep);
    }

    _readContentLength(input, headerEnd, sep) {
        const header = input.substring(0, headerEnd);
        const match = header.match(/Content-Length:\s*(\d+)/i);
        if (!match) {
            // 尝试按换行分隔的JSON格式（无头模式）
            const bodyStart = headerEnd + sep.length;
            if (bodyStart >= input.length) return null;
            const newlineIdx = input.indexOf('\n', bodyStart);
            if (newlineIdx === -1) return null;
            const message = input.substring(bodyStart, newlineIdx);
            try {
                const obj = JSON.parse(message);
                return { message: obj, rest: input.substring(newlineIdx + 1) };
            } catch (e) {
                this.stats.errors++;
                return { message: null, rest: input.substring(newlineIdx + 1) };
            }
        }
        const contentLength = parseInt(match[1], 10);
        if (contentLength > FRAMING_CONFIG.maxMessageSize) {
            this.stats.errors++;
            return null;
        }
        const bodyStart = headerEnd + sep.length;
        if (bodyStart + contentLength > input.length) return null;
        const body = input.substring(bodyStart, bodyStart + contentLength);
        try {
            const obj = JSON.parse(body);
            return { message: obj, rest: input.substring(bodyStart + contentLength) };
        } catch (e) {
            this.stats.errors++;
            return { message: null, rest: input.substring(bodyStart + contentLength) };
        }
    }

    send(message) {
        if (!this.started) return { success: false, error: 'NOT_STARTED' };
        const body = JSON.stringify(message);
        const header = `${FRAMING_CONFIG.contentLengthHeader} ${Buffer.byteLength(body, 'utf8')}\r\n\r\n`;
        const frame = header + body;
        this._recordSend(frame.length);
        if (typeof process !== 'undefined' && process.stdout && process.stdout.write) {
            process.stdout.write(frame);
        }
        return { success: true, bytes: frame.length };
    }

    injectForTesting(chunk) { this._onData(chunk); }
}

/**
 * HTTPTransport - HTTP POST + SSE 混合传输
 */
export class HTTPTransport extends BaseTransport {
    constructor(config = {}) {
        super(TRANSPORT_TYPES.HTTP, config);
        this.routes = new Map();
        this.sseClients = new Map();
        this._customHandler = null;
    }

    setCustomHandler(fn) { this._customHandler = fn; }

    handleRequest(req) {
        if (!this.started) return { status: 503, body: { error: 'NOT_STARTED' } };
        if (this._customHandler) {
            try { return this._customHandler(req); }
            catch (e) { this.stats.errors++; return { status: 500, body: { error: e.message } }; }
        }
        if (req.method === 'GET' && req.path === '/sse') {
            return this._handleSSEConnect(req);
        }
        if (req.method === 'POST' && (req.path === '/' || req.path === '/mcp')) {
            return this._handlePost(req);
        }
        return { status: 404, body: { error: 'NOT_FOUND' } };
    }

    _handlePost(req) {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) { this.stats.errors++; return { status: 400, body: { error: 'INVALID_JSON' } }; }
        }
        this._emitMessage(body);
        return { status: 200, body: { ack: true, receivedAt: Date.now() } };
    }

    _handleSSEConnect(req) {
        const clientId = req.clientId || `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        this.sseClients.set(clientId, { connectedAt: Date.now(), lastEventId: 0 });
        return {
            status: 200,
            contentType: 'text/event-stream',
            headers: { 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
            sseClientId: clientId,
        };
    }

    send(message, clientId = null) {
        if (!this.started) return { success: false, error: 'NOT_STARTED' };
        const body = JSON.stringify(message);
        this._recordSend(body.length);
        if (clientId && this.sseClients.has(clientId)) {
            this.sseClients.get(clientId).lastEventId++;
            return { success: true, sseEvent: `event: ${SSE_EVENTS.MESSAGE}\nid: ${this.sseClients.get(clientId).lastEventId}\ndata: ${body}\n\n` };
        }
        return { success: true, httpResponse: { status: 200, body: message } };
    }

    broadcast(message) {
        if (!this.started) return { success: false, error: 'NOT_STARTED' };
        const body = JSON.stringify(message);
        this._recordSend(body.length * this.sseClients.size);
        return { success: true, clientCount: this.sseClients.size, bytes: body.length * this.sseClients.size };
    }

    getSSEClientCount() { return this.sseClients.size; }
    removeSSEClient(clientId) { return this.sseClients.delete(clientId); }
}

/**
 * SSEStream - Server-Sent Events 单向流
 */
export class SSEStream {
    constructor(clientId) {
        this.clientId = clientId;
        this.events = [];
        this.closed = false;
    }

    send(eventType, data) {
        if (this.closed) return { success: false, error: 'CLOSED' };
        const event = { id: this.events.length + 1, type: eventType, data, sentAt: Date.now() };
        this.events.push(event);
        return { success: true, event };
    }

    close() { this.closed = true; return { success: true }; }
    isClosed() { return this.closed; }
    getEventCount() { return this.events.length; }
    getEvents() { return [...this.events]; }
}

/**
 * WebSocketTransport - WebSocket 全双工传输
 */
export class WebSocketTransport extends BaseTransport {
    constructor(config = {}) {
        super(TRANSPORT_TYPES.WEBSOCKET, config);
        this.clients = new Map();
        this.fragments = new Map();
    }

    onConnect(clientId, meta = {}) {
        this.clients.set(clientId, { connectedAt: Date.now(), frames: 0, ...meta });
        return { success: true, clientCount: this.clients.size };
    }

    onDisconnect(clientId) {
        const existed = this.clients.delete(clientId);
        this.fragments.delete(clientId);
        return { success: existed };
    }

    onFrame(clientId, frame) {
        if (!this.started) return { success: false, error: 'NOT_STARTED' };
        if (!this.clients.has(clientId)) return { success: false, error: 'CLIENT_NOT_FOUND' };
        if (frame.opcode === 0x0 && this.fragments.has(clientId)) {
            const accumulated = this.fragments.get(clientId) + frame.payload;
            if (frame.fin) {
                this.fragments.delete(clientId);
                this._emitMessage(JSON.parse(accumulated));
            } else {
                this.fragments.set(clientId, accumulated);
            }
        } else if (frame.opcode === 0x1) {
            if (!frame.fin) {
                this.fragments.set(clientId, frame.payload);
            } else {
                try { this._emitMessage(JSON.parse(frame.payload)); }
                catch (e) { this.stats.errors++; }
            }
        }
        this.clients.get(clientId).frames++;
        return { success: true };
    }

    send(clientId, message) {
        if (!this.clients.has(clientId)) return { success: false, error: 'CLIENT_NOT_FOUND' };
        const payload = JSON.stringify(message);
        if (payload.length > FRAMING_CONFIG.wsMaxFrameSize) {
            return { success: false, error: 'FRAME_TOO_LARGE' };
        }
        this._recordSend(payload.length);
        return { success: true, frame: { opcode: 0x1, fin: true, payload }, bytes: payload.length };
    }

    broadcast(message) {
        const payload = JSON.stringify(message);
        this._recordSend(payload.length * this.clients.size);
        return { success: true, clientCount: this.clients.size, frames: Array.from(this.clients.keys()).map(id => ({ clientId: id, frame: { opcode: 0x1, fin: true, payload } })) };
    }

    getClientCount() { return this.clients.size; }
    getClients() { return Array.from(this.clients.keys()); }
}

/**
 * TransportRegistry - 多传输实例注册表
 */
export class TransportRegistry {
    constructor() {
        this.transports = new Map();
        this._messageHandler = null;
    }

    register(name, transport) {
        this.transports.set(name, transport);
        transport.setMessageHandler(msg => this._dispatch(name, msg));
        return { success: true };
    }

    unregister(name) { return { success: this.transports.delete(name) }; }
    get(name) { return this.transports.get(name) || null; }
    list() { return Array.from(this.transports.keys()); }
    setMessageHandler(handler) { this._messageHandler = handler; }

    _dispatch(transportName, raw) {
        if (this._messageHandler) {
            try { this._messageHandler(transportName, raw); }
            catch (e) {}
        }
    }

    startAll() {
        const results = [];
        for (const [name, t] of this.transports) results.push({ name, ...t.start() });
        return results;
    }

    stopAll() {
        const results = [];
        for (const [name, t] of this.transports) results.push({ name, ...t.stop() });
        return results;
    }

    getAllStats() {
        const out = {};
        for (const [name, t] of this.transports) out[name] = t.getStats();
        return out;
    }
}

export default TransportRegistry;
