/**
 * MCPToolsRegistry.js - MCP 工具注册表
 * V284 Iteration 8/9 - MCP Tools for Self-Evolution
 * 
 * 核心机制：
 * 1. 管理所有注册的 MCP 工具
 * 2. 提供工具注册、查询、执行功能
 * 3. 支持工具的元数据存储
 */

/**
 * MCPToolsRegistry - MCP 工具注册表
 * 管理所有 MCP 工具的注册、查询和执行
 */
export class MCPToolsRegistry {
    /**
     * @param {string} namespace - 工具命名空间，默认 'default'
     */
    constructor(namespace = 'default') {
        this.namespace = namespace;
        /** @type {Map<string, {name: string, description: string, parameters: Object, handler: Function}>} */
        this.tools = new Map();
    }

    /**
     * 注册 MCP 工具
     * @param {Object} tool - 工具定义 { name, description, parameters, handler }
     * @param {string} tool.name - 工具名称
     * @param {string} tool.description - 工具描述
     * @param {Object} tool.parameters - 参数定义 (JSON Schema)
     * @param {Function} tool.handler - 处理函数
     * @returns {Object} 注册结果
     */
    register(tool) {
        if (!tool.name) {
            return { success: false, reason: 'Tool name is required' };
        }

        if (this.tools.has(tool.name)) {
            return { success: false, reason: 'Tool already registered', toolName: tool.name };
        }

        if (typeof tool.handler !== 'function') {
            return { success: false, reason: 'Tool handler must be a function' };
        }

        const toolEntry = {
            name: tool.name,
            description: tool.description || '',
            parameters: tool.parameters || { type: 'object', properties: {} },
            handler: tool.handler,
            registeredAt: Date.now()
        };

        this.tools.set(tool.name, toolEntry);
        return { success: true, tool: toolEntry };
    }

    /**
     * 批量注册工具
     * @param {Object[]} tools - 工具数组
     * @returns {Object} 注册结果
     */
    registerMany(tools) {
        const results = [];
        const registered = [];
        const failed = [];

        for (const tool of tools) {
            const result = this.register(tool);
            if (result.success) {
                registered.push(tool.name);
            } else {
                failed.push({ name: tool.name, reason: result.reason });
            }
            results.push(result);
        }

        return {
            success: failed.length === 0,
            registered,
            failed,
            results
        };
    }

    /**
     * 获取工具定义
     * @param {string} name - 工具名称
     * @returns {Object|null} 工具定义
     */
    getTool(name) {
        const tool = this.tools.get(name);
        if (!tool) return null;

        return {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        };
    }

    /**
     * 获取工具处理器
     * @param {string} name - 工具名称
     * @returns {Function|null} 处理函数
     */
    getHandler(name) {
        const tool = this.tools.get(name);
        return tool ? tool.handler : null;
    }

    /**
     * 获取所有已注册工具
     * @returns {Object[]} 工具定义数组
     */
    getAllTools() {
        const tools = [];
        for (const tool of this.tools.values()) {
            tools.push({
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            });
        }
        return tools;
    }

    /**
     * 获取所有工具的完整信息（包括处理器）
     * @returns {Object[]} 工具完整信息数组
     */
    getAllToolsWithHandlers() {
        return Array.from(this.tools.values());
    }

    /**
     * 执行工具
     * @param {string} name - 工具名称
     * @param {Object} params - 执行参数
     * @returns {Promise<Object>} 执行结果
     */
    async execute(name, params = {}) {
        const tool = this.tools.get(name);

        if (!tool) {
            return { 
                success: false, 
                error: 'Tool not found',
                toolName: name 
            };
        }

        try {
            const result = await tool.handler(params);
            return { 
                success: true, 
                toolName: name,
                result 
            };
        } catch (error) {
            return {
                success: false,
                toolName: name,
                error: error.message || String(error)
            };
        }
    }

    /**
     * 同步执行工具（如果处理器是同步的）
     * @param {string} name - 工具名称
     * @param {Object} params - 执行参数
     * @returns {Object} 执行结果
     */
    executeSync(name, params = {}) {
        const tool = this.tools.get(name);

        if (!tool) {
            return { 
                success: false, 
                error: 'Tool not found',
                toolName: name 
            };
        }

        try {
            const result = tool.handler(params);
            // 如果返回的是 Promise，需要提示使用 async 版本
            if (result && typeof result.then === 'function') {
                return {
                    success: false,
                    error: 'Tool handler is async, use execute() instead',
                    toolName: name
                };
            }
            return { 
                success: true, 
                toolName: name,
                result 
            };
        } catch (error) {
            return {
                success: false,
                toolName: name,
                error: error.message || String(error)
            };
        }
    }

    /**
     * 批量执行工具
     * @param {Object[]} requests - 请求数组 [{name, params}]
     * @returns {Promise<Object[]>} 结果数组
     */
    async executeBatch(requests) {
        const results = [];
        for (const request of requests) {
            const result = await this.execute(request.name, request.params);
            results.push(result);
        }
        return results;
    }

    /**
     * 注销工具
     * @param {string} name - 工具名称
     * @returns {Object} 注销结果
     */
    unregister(name) {
        if (!this.tools.has(name)) {
            return { success: false, reason: 'Tool not found' };
        }

        const tool = this.tools.get(name);
        this.tools.delete(name);
        return { success: true, removed: tool };
    }

    /**
     * 检查工具是否已注册
     * @param {string} name - 工具名称
     * @returns {boolean}
     */
    has(name) {
        return this.tools.has(name);
    }

    /**
     * 获取注册工具数量
     * @returns {number}
     */
    size() {
        return this.tools.size;
    }

    /**
     * 清空所有工具
     * @returns {Object} 清空结果
     */
    clear() {
        const count = this.tools.size;
        this.tools.clear();
        return { success: true, cleared: count };
    }

    /**
     * 获取工具统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            namespace: this.namespace,
            totalTools: this.tools.size,
            toolNames: Array.from(this.tools.keys())
        };
    }

    /**
     * 导出工具定义为标准 MCP 格式
     * @returns {Object} MCP 工具定义
     */
    exportAsMCPTools() {
        const tools = {};
        for (const [name, tool] of this.tools) {
            tools[name] = {
                description: tool.description,
                parameters: tool.parameters
            };
        }
        return tools;
    }
}

export default MCPToolsRegistry;