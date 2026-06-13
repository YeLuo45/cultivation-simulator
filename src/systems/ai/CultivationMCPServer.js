/**
 * CultivationMCPServer.js - 修真 MCP Server 核心引擎
 * V859 P-20260613-002 Iteration 1/30 Round 35 - Direction F: MCP Server 反向暴露
 *
 * 修真世界反向暴露引擎：让外部 AI 通过 JSON-RPC 2.0 协议查询/操控游戏
 * - 核心 API: start / stop / handleRequest / registerMethod / registerTool
 * - 数据结构: { id, jsonrpc, method, params, result, error, registeredMethods, stats }
 * - 配置: JSON_RPC_VERSION, ERROR_CODES, DEFAULT_METHODS
 */

export const JSON_RPC_VERSION = '2.0';

export const ERROR_CODES = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
    PERMISSION_DENIED: -32001,
    RATE_LIMITED: -32002,
    TOOL_NOT_FOUND: -32003,
    HOOK_REJECTED: -32004,
};

export const DEFAULT_METHODS = {
    'server.ping': { description: '健康检查', requiresAuth: false, permission: 'read' },
    'server.info': { description: '服务器元数据', requiresAuth: false, permission: 'read' },
    'server.listMethods': { description: '列出所有可用方法', requiresAuth: false, permission: 'read' },
};

/**
 * McpRequest - 解析后的 JSON-RPC 2.0 请求
 */
class McpRequest {
    constructor({ id = null, method, params = {}, jsonrpc = JSON_RPC_VERSION } = {}) {
        this.id = id;
        this.method = method;
        this.params = params;
        this.jsonrpc = jsonrpc;
        this.receivedAt = Date.now();
    }
    isNotification() { return this.id === null; }
}

/**
 * McpResponse - JSON-RPC 2.0 响应
 */
class McpResponse {
    constructor(id, result = null, error = null) {
        this.id = id;
        if (error) {
            this.error = { code: error.code, message: error.message, data: error.data || null };
        } else {
            this.result = result;
        }
    }
    toJSON() {
        if (this.error) return { jsonrpc: JSON_RPC_VERSION, id: this.id, error: this.error };
        return { jsonrpc: JSON_RPC_VERSION, id: this.id, result: this.result };
    }
}

/**
 * CultivationMCPServer - MCP Server 核心
 * 反向暴露游戏状态给外部 AI 客户端
 */
export class CultivationMCPServer {
    constructor(config = {}) {
        this.config = {
            serverName: config.serverName || 'cultivation-mcp',
            serverVersion: config.serverVersion || '1.0.0',
            maxMethods: config.maxMethods || 200,
            maxHistoryLength: config.maxHistoryLength || 500,
            requestTimeoutMs: config.requestTimeoutMs || 30000,
            ...config,
        };
        /** @type {Map<string, {handler: Function, schema: Object, permission: string, requiresAuth: boolean, description: string}>} */
        this.methods = new Map();
        /** @type {Map<string, {name: string, handler: Function, schema: Object, permission: string}>} */
        this.tools = new Map();
        /** @type {Map<string, Function[]>} */
        this.hooks = new Map();
        this.history = [];
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            notifications: 0,
            methodCalls: 0,
            toolCalls: 0,
            hookRejections: 0,
        };
        this.running = false;
        this.startedAt = null;
        this._registerDefaultMethods();
    }

    _registerDefaultMethods() {
        this.registerMethod('server.ping', () => ({ pong: true, timestamp: Date.now() }), { permission: 'read' });
        this.registerMethod('server.info', () => ({
            name: this.config.serverName,
            version: this.config.serverVersion,
            uptimeMs: this.startedAt ? Date.now() - this.startedAt : 0,
            methodCount: this.methods.size,
            toolCount: this.tools.size,
        }), { permission: 'read' });
        this.registerMethod('server.listMethods', () => Array.from(this.methods.entries()).map(([name, m]) => ({
            name, description: m.description, permission: m.permission, requiresAuth: m.requiresAuth,
        })), { permission: 'read' });
    }

    registerMethod(name, handler, options = {}) {
        if (this.methods.size >= this.config.maxMethods) {
            return { success: false, error: 'METHOD_LIMIT_REACHED' };
        }
        this.methods.set(name, {
            handler,
            schema: options.schema || { type: 'object', properties: {}, additionalProperties: true },
            permission: options.permission || 'read',
            requiresAuth: options.requiresAuth !== false,
            description: options.description || '',
        });
        this._triggerHook('methodRegistered', { name, permission: options.permission || 'read' });
        return { success: true };
    }

    unregisterMethod(name) {
        const existed = this.methods.delete(name);
        if (existed) this._triggerHook('methodUnregistered', { name });
        return { success: existed };
    }

    getMethod(name) { return this.methods.get(name) || null; }
    listMethods() { return Array.from(this.methods.keys()); }
    listMethodsByPermission(permission) {
        return Array.from(this.methods.entries())
            .filter(([, m]) => m.permission === permission)
            .map(([name]) => name);
    }

    registerTool(name, handler, options = {}) {
        this.tools.set(name, {
            name,
            handler,
            schema: options.schema || { type: 'object', properties: {}, additionalProperties: true },
            permission: options.permission || 'write',
        });
        this._triggerHook('toolRegistered', { name, permission: options.permission || 'write' });
        return { success: true };
    }

    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try {
            const result = tool.handler(context || {});
            this.stats.toolCalls++;
            return { success: true, result };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => {
            const arr = this.hooks.get(event);
            if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); }
        };
    }

    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return true;
        for (const h of handlers) {
            try {
                const result = h(data);
                if (result === false) {
                    this.stats.hookRejections++;
                    return false;
                }
            } catch (e) {}
        }
        return true;
    }

    start() {
        if (this.running) return { success: false, error: 'ALREADY_RUNNING' };
        const allowed = this._triggerHook('serverStart', { serverName: this.config.serverName });
        if (!allowed) return { success: false, error: 'HOOK_REJECTED' };
        this.running = true;
        this.startedAt = Date.now();
        this._triggerHook('serverStarted', { startedAt: this.startedAt });
        return { success: true, startedAt: this.startedAt };
    }

    stop() {
        if (!this.running) return { success: false, error: 'NOT_RUNNING' };
        this._triggerHook('serverStop', { uptimeMs: Date.now() - this.startedAt });
        this.running = false;
        this.startedAt = null;
        this._triggerHook('serverStopped', {});
        return { success: true };
    }

    isRunning() { return this.running; }

    _validateRequest(raw) {
        if (raw === null || typeof raw !== 'object') {
            return { valid: false, code: ERROR_CODES.INVALID_REQUEST, message: 'Request must be an object' };
        }
        if (raw.jsonrpc !== JSON_RPC_VERSION) {
            return { valid: false, code: ERROR_CODES.INVALID_REQUEST, message: 'jsonrpc must be "2.0"' };
        }
        if (typeof raw.method !== 'string' || raw.method.length === 0) {
            return { valid: false, code: ERROR_CODES.INVALID_REQUEST, message: 'method must be a non-empty string' };
        }
        if (raw.params !== undefined && (typeof raw.params !== 'object' || Array.isArray(raw.params))) {
            return { valid: false, code: ERROR_CODES.INVALID_PARAMS, message: 'params must be an object' };
        }
        return { valid: true };
    }

    _dispatch(request) {
        const method = this.methods.get(request.method);
        if (!method) {
            return { error: { code: ERROR_CODES.METHOD_NOT_FOUND, message: `Method not found: ${request.method}` } };
        }
        const allowed = this._triggerHook('beforeMethodCall', { method: request.method, params: request.params, permission: method.permission });
        if (!allowed) {
            return { error: { code: ERROR_CODES.HOOK_REJECTED, message: 'Request rejected by hook' } };
        }
        try {
            const result = method.handler(request.params || {});
            this.stats.methodCalls++;
            this._triggerHook('afterMethodCall', { method: request.method, success: true });
            return { result };
        } catch (e) {
            this._triggerHook('afterMethodCall', { method: request.method, success: false, error: e.message });
            return { error: { code: ERROR_CODES.INTERNAL_ERROR, message: e.message, data: e.stack || null } };
        }
    }

    handleRequest(rawRequest) {
        this.stats.totalRequests++;
        if (this.history.length >= this.config.maxHistoryLength) this.history.shift();
        this.history.push({ receivedAt: Date.now(), raw: rawRequest });

        const validation = this._validateRequest(rawRequest);
        if (!validation.valid) {
            this.stats.failedRequests++;
            const errResponse = new McpResponse(rawRequest && rawRequest.id, null, { code: validation.code, message: validation.message });
            return errResponse.toJSON();
        }

        const request = new McpRequest(rawRequest);
        if (request.isNotification()) {
            this.stats.notifications++;
            this._dispatch(request);
            return null;
        }

        const dispatch = this._dispatch(request);
        if (dispatch.error) {
            this.stats.failedRequests++;
            return new McpResponse(request.id, null, dispatch.error).toJSON();
        }
        this.stats.successfulRequests++;
        return new McpResponse(request.id, dispatch.result).toJSON();
    }

    handleBatch(rawRequests) {
        if (!Array.isArray(rawRequests)) {
            return new McpResponse(null, null, { code: ERROR_CODES.INVALID_REQUEST, message: 'Batch must be an array' }).toJSON();
        }
        if (rawRequests.length === 0) {
            return new McpResponse(null, null, { code: ERROR_CODES.INVALID_REQUEST, message: 'Batch cannot be empty' }).toJSON();
        }
        const responses = rawRequests.map(req => this.handleRequest(req)).filter(r => r !== null);
        return responses.length === 0 ? null : responses;
    }

    getStats() {
        return {
            ...this.stats,
            methodCount: this.methods.size,
            toolCount: this.tools.size,
            hookCount: Array.from(this.hooks.values()).reduce((sum, arr) => sum + arr.length, 0),
            historyLength: this.history.length,
            running: this.running,
            uptimeMs: this.startedAt ? Date.now() - this.startedAt : 0,
        };
    }

    toJSON() {
        return {
            config: this.config,
            methods: Array.from(this.methods.keys()),
            tools: Array.from(this.tools.keys()),
            stats: this.stats,
            running: this.running,
            startedAt: this.startedAt,
        };
    }

    fromJSON(data) {
        if (data.config) this.config = { ...this.config, ...data.config };
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (typeof data.running === 'boolean') this.running = data.running;
        if (typeof data.startedAt === 'number') this.startedAt = data.startedAt;
        return { success: true };
    }
}

export default CultivationMCPServer;
