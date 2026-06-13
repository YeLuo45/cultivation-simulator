/**
 * CultivationMCPServer.test.js - 修真 MCP Server 核心引擎测试
 * V859 Iteration 1/30 Round 35 - Direction F - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMCPServer, JSON_RPC_VERSION, ERROR_CODES, DEFAULT_METHODS } from '../../../systems/ai/CultivationMCPServer.js';

describe('CultivationMCPServer', () => {
    let server;
    beforeEach(() => { server = new CultivationMCPServer(); });

    describe('constructor', () => {
        it('should default to serverName cultivation-mcp', () => {
            expect(server.config.serverName).toBe('cultivation-mcp');
        });

        it('should accept custom config', () => {
            const s = new CultivationMCPServer({ serverName: 'test', maxMethods: 50 });
            expect(s.config.serverName).toBe('test');
            expect(s.config.maxMethods).toBe(50);
        });

        it('should register 3 default methods', () => {
            expect(server.methods.has('server.ping')).toBe(true);
            expect(server.methods.has('server.info')).toBe(true);
            expect(server.methods.has('server.listMethods')).toBe(true);
        });

        it('should not be running on init', () => {
            expect(server.running).toBe(false);
            expect(server.startedAt).toBe(null);
        });

        it('should initialize stats with zero counters', () => {
            expect(server.stats.totalRequests).toBe(0);
            expect(server.stats.successfulRequests).toBe(0);
            expect(server.stats.failedRequests).toBe(0);
        });
    });

    describe('registerMethod / getMethod / listMethods', () => {
        it('should register a method', () => {
            const r = server.registerMethod('player.get', () => ({ name: 'cultivator' }), { permission: 'read' });
            expect(r.success).toBe(true);
            expect(server.methods.has('player.get')).toBe(true);
        });

        it('should reject when over maxMethods', () => {
            const s = new CultivationMCPServer({ maxMethods: 3 });
            s.registerMethod('a', () => 1);
            s.registerMethod('b', () => 2);
            s.registerMethod('c', () => 3);
            const r = s.registerMethod('d', () => 4);
            expect(r.success).toBe(false);
            expect(r.error).toBe('METHOD_LIMIT_REACHED');
        });

        it('should unregister method', () => {
            server.registerMethod('temp', () => 1);
            const r = server.unregisterMethod('temp');
            expect(r.success).toBe(true);
            expect(server.methods.has('temp')).toBe(false);
        });

        it('should return false when unregistering non-existent', () => {
            const r = server.unregisterMethod('nonexistent');
            expect(r.success).toBe(false);
        });

        it('should return method via getMethod', () => {
            server.registerMethod('echo', () => 'hi', { description: 'Echo endpoint' });
            const m = server.getMethod('echo');
            expect(m.handler()).toBe('hi');
            expect(m.description).toBe('Echo endpoint');
        });

        it('should return null for missing method', () => {
            expect(server.getMethod('missing')).toBe(null);
        });

        it('should list all methods', () => {
            const names = server.listMethods();
            expect(names).toContain('server.ping');
            expect(names).toContain('server.info');
        });

        it('should filter methods by permission', () => {
            server.registerMethod('public.read', () => 1, { permission: 'read' });
            server.registerMethod('private.write', () => 1, { permission: 'write' });
            const readMethods = server.listMethodsByPermission('read');
            expect(readMethods).toContain('public.read');
            expect(readMethods).toContain('server.ping');
            expect(readMethods).not.toContain('private.write');
        });
    });

    describe('registerTool / executeTool', () => {
        it('should register and execute a tool', () => {
            server.registerTool('player.attack', ({ targetId }) => `attacked ${targetId}`);
            const r = server.executeTool('player.attack', { targetId: 'npc-001' });
            expect(r.success).toBe(true);
            expect(r.result).toBe('attacked npc-001');
            expect(server.stats.toolCalls).toBe(1);
        });

        it('should fail on missing tool', () => {
            const r = server.executeTool('does.not.exist', {});
            expect(r.success).toBe(false);
            expect(r.error).toBe('TOOL_NOT_FOUND');
        });

        it('should catch tool errors', () => {
            server.registerTool('boom', () => { throw new Error('explosion'); });
            const r = server.executeTool('boom', {});
            expect(r.success).toBe(false);
            expect(r.error).toBe('explosion');
        });

        it('should list tools', () => {
            server.registerTool('a', () => 1);
            server.registerTool('b', () => 2);
            expect(server.listTools()).toEqual(['a', 'b']);
        });
    });

    describe('hooks', () => {
        it('should register and trigger hook', () => {
            let called = false;
            server.registerHook('methodRegistered', () => { called = true; });
            server.registerMethod('test', () => 1);
            expect(called).toBe(true);
        });

        it('should support unregister via returned function', () => {
            let count = 0;
            const unregister = server.registerHook('event', () => { count++; });
            server._triggerHook('event', {});
            unregister();
            server._triggerHook('event', {});
            expect(count).toBe(1);
        });

        it('should reject dispatch when hook returns false', () => {
            server.registerHook('beforeMethodCall', () => false);
            server.registerMethod('foo', () => 'bar');
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'foo' });
            expect(r.error.code).toBe(ERROR_CODES.HOOK_REJECTED);
            expect(server.stats.hookRejections).toBe(1);
        });

        it('should not throw if hook handler throws', () => {
            server.registerHook('bad', () => { throw new Error('hook fail'); });
            expect(() => server._triggerHook('bad', {})).not.toThrow();
        });

        it('should count hook rejections', () => {
            server.registerHook('event', () => false);
            server._triggerHook('event', {});
            expect(server.stats.hookRejections).toBe(1);
        });
    });

    describe('start / stop', () => {
        it('should start server', () => {
            const r = server.start();
            expect(r.success).toBe(true);
            expect(r.startedAt).toBeGreaterThan(0);
            expect(server.running).toBe(true);
        });

        it('should not double-start', () => {
            server.start();
            const r = server.start();
            expect(r.success).toBe(false);
            expect(r.error).toBe('ALREADY_RUNNING');
        });

        it('should stop server', () => {
            server.start();
            const r = server.stop();
            expect(r.success).toBe(true);
            expect(server.running).toBe(false);
        });

        it('should not stop when not running', () => {
            const r = server.stop();
            expect(r.success).toBe(false);
            expect(r.error).toBe('NOT_RUNNING');
        });

        it('should reject start via hook', () => {
            server.registerHook('serverStart', () => false);
            const r = server.start();
            expect(r.success).toBe(false);
            expect(r.error).toBe('HOOK_REJECTED');
        });

        it('should report running state', () => {
            expect(server.isRunning()).toBe(false);
            server.start();
            expect(server.isRunning()).toBe(true);
        });
    });

    describe('handleRequest validation', () => {
        it('should reject non-object request', () => {
            const r = server.handleRequest(null);
            expect(r.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
            expect(server.stats.failedRequests).toBe(1);
        });

        it('should reject wrong jsonrpc version', () => {
            const r = server.handleRequest({ jsonrpc: '1.0', id: 1, method: 'x' });
            expect(r.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
        });

        it('should reject non-string method', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 123 });
            expect(r.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
        });

        it('should reject empty method', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: '' });
            expect(r.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
        });

        it('should reject non-object params', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'x', params: 'bad' });
            expect(r.error.code).toBe(ERROR_CODES.INVALID_PARAMS);
        });

        it('should reject array params', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'x', params: [] });
            expect(r.error.code).toBe(ERROR_CODES.INVALID_PARAMS);
        });
    });

    describe('handleRequest dispatch', () => {
        it('should handle valid request and return result', () => {
            server.registerMethod('add', ({ a, b }) => a + b);
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'add', params: { a: 2, b: 3 } });
            expect(r.result).toBe(5);
            expect(r.id).toBe(1);
            expect(r.jsonrpc).toBe(JSON_RPC_VERSION);
            expect(server.stats.successfulRequests).toBe(1);
            expect(server.stats.methodCalls).toBe(1);
        });

        it('should return method not found', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'unknown' });
            expect(r.error.code).toBe(ERROR_CODES.METHOD_NOT_FOUND);
        });

        it('should catch handler exceptions', () => {
            server.registerMethod('crash', () => { throw new Error('boom'); });
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'crash' });
            expect(r.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
            expect(r.error.message).toBe('boom');
        });

        it('should handle notification (no id) and return null', () => {
            server.registerMethod('log', () => undefined);
            const r = server.handleRequest({ jsonrpc: '2.0', method: 'log' });
            expect(r).toBe(null);
            expect(server.stats.notifications).toBe(1);
        });

        it('should handle default ping method', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 99, method: 'server.ping' });
            expect(r.result.pong).toBe(true);
            expect(r.result.timestamp).toBeGreaterThan(0);
        });

        it('should handle default info method', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'server.info' });
            expect(r.result.name).toBe('cultivation-mcp');
            expect(r.result.version).toBe('1.0.0');
        });

        it('should handle default listMethods', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'server.listMethods' });
            expect(Array.isArray(r.result)).toBe(true);
            expect(r.result.length).toBe(3);
        });
    });

    describe('handleBatch', () => {
        it('should process batch of requests', () => {
            server.registerMethod('a', () => 'A');
            server.registerMethod('b', () => 'B');
            const r = server.handleBatch([
                { jsonrpc: '2.0', id: 1, method: 'a' },
                { jsonrpc: '2.0', id: 2, method: 'b' },
            ]);
            expect(Array.isArray(r)).toBe(true);
            expect(r.length).toBe(2);
            expect(r[0].result).toBe('A');
            expect(r[1].result).toBe('B');
        });

        it('should reject non-array batch', () => {
            const r = server.handleBatch('not-array');
            expect(r.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
        });

        it('should reject empty batch', () => {
            const r = server.handleBatch([]);
            expect(r.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
        });

        it('should return null when batch is all notifications', () => {
            server.registerMethod('log', () => null);
            const r = server.handleBatch([{ jsonrpc: '2.0', method: 'log' }]);
            expect(r).toBe(null);
        });
    });

    describe('history', () => {
        it('should record request history', () => {
            server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'server.ping' });
            expect(server.history.length).toBe(1);
            expect(server.history[0].receivedAt).toBeGreaterThan(0);
        });

        it('should bound history at maxHistoryLength', () => {
            const s = new CultivationMCPServer({ maxHistoryLength: 3 });
            s.registerMethod('noop', () => null);
            for (let i = 0; i < 5; i++) s.handleRequest({ jsonrpc: '2.0', id: i, method: 'noop' });
            expect(s.history.length).toBe(3);
        });
    });

    describe('getStats / toJSON / fromJSON', () => {
        it('should compute getStats with all fields', () => {
            server.registerTool('a', () => 1);
            server.registerHook('e', () => null);
            const stats = server.getStats();
            expect(stats.methodCount).toBeGreaterThanOrEqual(3);
            expect(stats.toolCount).toBe(1);
            expect(stats.hookCount).toBe(1);
            expect(stats.running).toBe(false);
            expect(stats.uptimeMs).toBe(0);
        });

        it('should report uptime when running', () => {
            server.start();
            const stats = server.getStats();
            expect(stats.uptimeMs).toBeGreaterThanOrEqual(0);
            server.stop();
        });

        it('should serialize to JSON', () => {
            server.start();
            const j = server.toJSON();
            expect(j.running).toBe(true);
            expect(Array.isArray(j.methods)).toBe(true);
        });

        it('should restore from JSON', () => {
            server.start();
            const j = server.toJSON();
            const s2 = new CultivationMCPServer();
            const r = s2.fromJSON(j);
            expect(r.success).toBe(true);
            expect(s2.running).toBe(true);
        });
    });

    describe('module exports', () => {
        it('should export JSON_RPC_VERSION constant', () => {
            expect(JSON_RPC_VERSION).toBe('2.0');
        });

        it('should export ERROR_CODES with all standard codes', () => {
            expect(ERROR_CODES.PARSE_ERROR).toBe(-32700);
            expect(ERROR_CODES.INVALID_REQUEST).toBe(-32600);
            expect(ERROR_CODES.METHOD_NOT_FOUND).toBe(-32601);
            expect(ERROR_CODES.INVALID_PARAMS).toBe(-32602);
            expect(ERROR_CODES.INTERNAL_ERROR).toBe(-32603);
        });

        it('should export DEFAULT_METHODS with 3 default methods', () => {
            expect(Object.keys(DEFAULT_METHODS).length).toBe(3);
        });
    });
});
