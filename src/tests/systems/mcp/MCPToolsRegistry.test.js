/**
 * MCPToolsRegistry 单元测试
 * V284 Iteration 8/9 - MCP Tools for Self-Evolution
 * 
 * 测试策略：验证工具注册表的核心功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MCPToolsRegistry } from '../../../systems/mcp/MCPToolsRegistry.js';

describe('MCPToolsRegistry', () => {
    let registry;
    
    beforeEach(() => {
        registry = new MCPToolsRegistry('test-namespace');
    });
    
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    describe('constructor', () => {
        it('应该使用默认命名空间创建实例', () => {
            const defaultRegistry = new MCPToolsRegistry();
            expect(defaultRegistry.namespace).toBe('default');
            expect(defaultRegistry.tools.size).toBe(0);
        });
        
        it('应该使用提供的命名空间创建实例', () => {
            expect(registry.namespace).toBe('test-namespace');
            expect(registry.tools.size).toBe(0);
        });
        
        it('应该初始化空的工具 Map', () => {
            expect(registry.tools).toBeInstanceOf(Map);
            expect(registry.size()).toBe(0);
        });
    });
    
    describe('register', () => {
        it('应该成功注册工具', () => {
            const tool = {
                name: 'test_tool',
                description: 'A test tool',
                parameters: { type: 'object', properties: {} },
                handler: async () => ({ result: 'ok' })
            };
            
            const result = registry.register(tool);
            
            expect(result.success).toBe(true);
            expect(registry.size()).toBe(1);
            expect(registry.has('test_tool')).toBe(true);
        });
        
        it('不应该注册没有名称的工具', () => {
            const tool = {
                description: 'A test tool',
                handler: async () => ({ result: 'ok' })
            };
            
            const result = registry.register(tool);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Tool name is required');
        });
        
        it('不应该注册重复的工具', () => {
            const tool = {
                name: 'duplicate_tool',
                description: 'A test tool',
                handler: async () => ({ result: 'ok' })
            };
            
            registry.register(tool);
            const result = registry.register(tool);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Tool already registered');
        });
        
        it('不应该注册没有处理函数的工具', () => {
            const tool = {
                name: 'no_handler_tool',
                description: 'A test tool'
            };
            
            const result = registry.register(tool);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Tool handler must be a function');
        });
        
        it('应该默认空描述为空字符串', () => {
            const tool = {
                name: 'no_desc_tool',
                handler: async () => ({ result: 'ok' })
            };
            
            registry.register(tool);
            const retrieved = registry.getTool('no_desc_tool');
            
            expect(retrieved.description).toBe('');
        });
        
        it('应该包含注册时间戳', () => {
            const tool = {
                name: 'timestamp_tool',
                description: 'A test tool',
                handler: async () => ({ result: 'ok' })
            };
            
            const before = Date.now();
            registry.register(tool);
            const after = Date.now();
            
            const retrieved = registry.getTool('timestamp_tool');
            expect(retrieved).toBeDefined();
        });
    });
    
    describe('registerMany', () => {
        it('应该批量注册工具', () => {
            const tools = [
                {
                    name: 'tool_1',
                    description: 'Tool 1',
                    handler: async () => ({ result: 1 })
                },
                {
                    name: 'tool_2',
                    description: 'Tool 2',
                    handler: async () => ({ result: 2 })
                },
                {
                    name: 'tool_3',
                    description: 'Tool 3',
                    handler: async () => ({ result: 3 })
                }
            ];
            
            const result = registry.registerMany(tools);
            
            expect(result.success).toBe(true);
            expect(result.registered).toEqual(['tool_1', 'tool_2', 'tool_3']);
            expect(result.failed).toEqual([]);
            expect(registry.size()).toBe(3);
        });
        
        it('应该处理批量注册中的失败', () => {
            const tools = [
                {
                    name: 'tool_1',
                    description: 'Tool 1',
                    handler: async () => ({ result: 1 })
                },
                {
                    name: 'tool_1', // 重复
                    description: 'Tool 1 duplicate',
                    handler: async () => ({ result: 1 })
                }
            ];
            
            const result = registry.registerMany(tools);
            
            expect(result.success).toBe(false);
            expect(result.registered).toEqual(['tool_1']);
            expect(result.failed.length).toBe(1);
        });
    });
    
    describe('getTool', () => {
        it('应该返回已注册工具的定义', () => {
            const tool = {
                name: 'get_tool_test',
                description: 'A test tool',
                parameters: { 
                    type: 'object',
                    properties: { 
                        id: { type: 'string' }
                    }
                },
                handler: async () => ({ result: 'ok' })
            };
            
            registry.register(tool);
            const retrieved = registry.getTool('get_tool_test');
            
            expect(retrieved).toBeDefined();
            expect(retrieved.name).toBe('get_tool_test');
            expect(retrieved.description).toBe('A test tool');
            expect(retrieved.parameters.properties.id.type).toBe('string');
        });
        
        it('应该返回 null 表示不存在的工具', () => {
            const retrieved = registry.getTool('non_existent_tool');
            expect(retrieved).toBeNull();
        });
        
        it('不应该返回处理函数', () => {
            const tool = {
                name: 'handler_test',
                description: 'A test tool',
                handler: async () => ({ result: 'ok' })
            };
            
            registry.register(tool);
            const retrieved = registry.getTool('handler_test');
            
            expect(retrieved.handler).toBeUndefined();
        });
    });
    
    describe('getHandler', () => {
        it('应该返回工具的处理函数', () => {
            const handler = async () => ({ result: 'ok' });
            const tool = {
                name: 'handler_tool',
                description: 'A test tool',
                handler
            };
            
            registry.register(tool);
            const retrievedHandler = registry.getHandler('handler_tool');
            
            expect(retrievedHandler).toBe(handler);
        });
        
        it('应该返回 null 表示不存在的工具', () => {
            const retrievedHandler = registry.getHandler('non_existent');
            expect(retrievedHandler).toBeNull();
        });
    });
    
    describe('getAllTools', () => {
        it('应该返回所有已注册工具', () => {
            const tools = [
                { name: 'all_tool_1', handler: async () => {} },
                { name: 'all_tool_2', handler: async () => {} },
                { name: 'all_tool_3', handler: async () => {} }
            ];
            
            for (const tool of tools) {
                registry.register(tool);
            }
            
            const allTools = registry.getAllTools();
            
            expect(allTools.length).toBe(3);
            expect(allTools.map(t => t.name)).toContain('all_tool_1');
            expect(allTools.map(t => t.name)).toContain('all_tool_2');
            expect(allTools.map(t => t.name)).toContain('all_tool_3');
        });
        
        it('应该返回空数组当没有工具时', () => {
            const allTools = registry.getAllTools();
            expect(allTools).toEqual([]);
        });
    });
    
    describe('getAllToolsWithHandlers', () => {
        it('应该返回包含处理函数的工具列表', () => {
            const handler = async () => {};
            registry.register({
                name: 'with_handler_tool',
                handler
            });
            
            const allTools = registry.getAllToolsWithHandlers();
            
            expect(allTools.length).toBe(1);
            expect(allTools[0].handler).toBe(handler);
        });
    });
    
    describe('execute', () => {
        it('应该成功执行工具', async () => {
            registry.register({
                name: 'execute_tool',
                handler: async (params) => ({ 
                    received: params.value,
                    computed: params.value * 2
                })
            });
            
            const result = await registry.execute('execute_tool', { value: 5 });
            
            expect(result.success).toBe(true);
            expect(result.result.received).toBe(5);
            expect(result.result.computed).toBe(10);
        });
        
        it('应该返回错误当工具不存在时', async () => {
            const result = await registry.execute('non_existent_tool', {});
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Tool not found');
        });
        
        it('应该捕获处理函数异常', async () => {
            registry.register({
                name: 'error_tool',
                handler: async () => {
                    throw new Error('Handler error');
                }
            });
            
            const result = await registry.execute('error_tool', {});
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Handler error');
        });
        
        it('应该传递参数到处理函数', async () => {
            registry.register({
                name: 'param_tool',
                handler: async (params) => params
            });
            
            const params = { 
                npcId: 'npc_001', 
                options: { deep: true } 
            };
            const result = await registry.execute('param_tool', params);
            
            expect(result.success).toBe(true);
            expect(result.result.npcId).toBe('npc_001');
            expect(result.result.options.deep).toBe(true);
        });
    });
    
    describe('executeSync', () => {
        it('应该同步执行工具', () => {
            registry.register({
                name: 'sync_tool',
                handler: (params) => ({ result: params.x + 1 })
            });
            
            const result = registry.executeSync('sync_tool', { x: 5 });
            
            expect(result.success).toBe(true);
            expect(result.result.result).toBe(6);
        });
        
        it('应该拒绝异步处理函数', () => {
            registry.register({
                name: 'async_tool',
                handler: async () => ({ result: 'async' })
            });
            
            const result = registry.executeSync('async_tool', {});
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Tool handler is async, use execute() instead');
        });
    });
    
    describe('executeBatch', () => {
        it('应该批量执行工具', async () => {
            registry.register({
                name: 'batch_1',
                handler: async (params) => ({ value: params.input * 1 })
            });
            registry.register({
                name: 'batch_2',
                handler: async (params) => ({ value: params.input * 2 })
            });
            
            const requests = [
                { name: 'batch_1', params: { input: 5 } },
                { name: 'batch_2', params: { input: 5 } }
            ];
            
            const results = await registry.executeBatch(requests);
            
            expect(results.length).toBe(2);
            expect(results[0].result.value).toBe(5);
            expect(results[1].result.value).toBe(10);
        });
    });
    
    describe('unregister', () => {
        it('应该成功注销工具', () => {
            registry.register({
                name: 'unregister_tool',
                handler: async () => {}
            });
            
            const result = registry.unregister('unregister_tool');
            
            expect(result.success).toBe(true);
            expect(registry.has('unregister_tool')).toBe(false);
            expect(registry.size()).toBe(0);
        });
        
        it('应该返回错误当工具不存在时', () => {
            const result = registry.unregister('non_existent');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Tool not found');
        });
    });
    
    describe('has', () => {
        it('应该正确检查工具存在性', () => {
            registry.register({
                name: 'has_tool',
                handler: async () => {}
            });
            
            expect(registry.has('has_tool')).toBe(true);
            expect(registry.has('non_has_tool')).toBe(false);
        });
    });
    
    describe('size', () => {
        it('应该返回正确的大小', () => {
            expect(registry.size()).toBe(0);
            
            registry.register({ name: 'size_1', handler: async () => {} });
            expect(registry.size()).toBe(1);
            
            registry.register({ name: 'size_2', handler: async () => {} });
            expect(registry.size()).toBe(2);
            
            registry.unregister('size_1');
            expect(registry.size()).toBe(1);
        });
    });
    
    describe('clear', () => {
        it('应该清空所有工具', () => {
            registry.register({ name: 'clear_1', handler: async () => {} });
            registry.register({ name: 'clear_2', handler: async () => {} });
            
            const result = registry.clear();
            
            expect(result.success).toBe(true);
            expect(result.cleared).toBe(2);
            expect(registry.size()).toBe(0);
        });
    });
    
    describe('getStats', () => {
        it('应该返回正确的统计信息', () => {
            registry.register({ name: 'stats_1', handler: async () => {} });
            registry.register({ name: 'stats_2', handler: async () => {} });
            
            const stats = registry.getStats();
            
            expect(stats.namespace).toBe('test-namespace');
            expect(stats.totalTools).toBe(2);
            expect(stats.toolNames).toContain('stats_1');
            expect(stats.toolNames).toContain('stats_2');
        });
    });
    
    describe('exportAsMCPTools', () => {
        it('应该导出为标准 MCP 格式', () => {
            registry.register({
                name: 'mcp_tool',
                description: 'A MCP tool',
                parameters: {
                    type: 'object',
                    properties: { id: { type: 'string' } }
                },
                handler: async () => {}
            });
            
            const mcpTools = registry.exportAsMCPTools();
            
            expect(mcpTools['mcp_tool']).toBeDefined();
            expect(mcpTools['mcp_tool'].description).toBe('A MCP tool');
            expect(mcpTools['mcp_tool'].parameters.properties.id.type).toBe('string');
        });
        
        it('应该不包含处理函数', () => {
            registry.register({
                name: 'export_handler_test',
                handler: async () => {}
            });
            
            const mcpTools = registry.exportAsMCPTools();
            
            expect(mcpTools['export_handler_test'].handler).toBeUndefined();
        });
    });
});