/**
 * DestinyThread.js - 命运之线
 * V372 Iteration 6/9 Round 10
 */
export class DestinyThread {
    constructor(config = {}) {
        this.config = { maxThreads: config.maxThreads || 100, ...config };
        this.threads = new Map();
        this.connections = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalThreads: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getThread', (ctx) => this.getThread(ctx.threadId));
        this.registerTool('createThread', (ctx) => this.createThread(ctx));
    }

    createThread(data) {
        const id = data.id || `th_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const thread = { threadId: id, ownerId: data.ownerId, destiny: data.destiny || 'unknown', strength: data.strength || 1, connections: [], createdAt: Date.now() };
        this.threads.set(id, thread);
        this.stats.totalThreads++;
        this._triggerHook('threadCreated', { threadId: id });
        return { success: true, thread };
    }

    getThread(id) { return this.threads.get(id) ? { ...this.threads.get(id) } : null; }
    listThreads() { return Array.from(this.threads.values()).map(t => ({ ...t })); }
    listByOwner(ownerId) { return Array.from(this.threads.values()).filter(t => t.ownerId === ownerId).map(t => ({ ...t })); }
    listByDestiny(destiny) { return Array.from(this.threads.values()).filter(t => t.destiny === destiny).map(t => ({ ...t })); }

    connectThreads(fromId, toId, type = 'bonded') {
        const from = this.threads.get(fromId);
        const to = this.threads.get(toId);
        if (!from || !to) return { success: false, error: 'THREAD_NOT_FOUND' };
        const id = `cn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const connection = { connectionId: id, fromId, toId, type, createdAt: Date.now() };
        this.connections.set(id, connection);
        from.connections.push(id);
        to.connections.push(id);
        this._triggerHook('threadsConnected', { fromId, toId });
        return { success: true, connection };
    }

    disconnectThreads(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return { success: false, error: 'CONNECTION_NOT_FOUND' };
        this.connections.delete(connectionId);
        const from = this.threads.get(connection.fromId);
        const to = this.threads.get(connection.toId);
        if (from) from.connections = from.connections.filter(c => c !== connectionId);
        if (to) to.connections = to.connections.filter(c => c !== connectionId);
        this._triggerHook('threadsDisconnected', { connectionId });
        return { success: true };
    }

    strengthenThread(threadId, amount) {
        const thread = this.threads.get(threadId);
        if (!thread) return { success: false, error: 'THREAD_NOT_FOUND' };
        thread.strength = Math.min(10, thread.strength + amount);
        this._triggerHook('threadStrengthened', { threadId, newStrength: thread.strength });
        return { success: true };
    }

    weakenThread(threadId, amount) {
        const thread = this.threads.get(threadId);
        if (!thread) return { success: false, error: 'THREAD_NOT_FOUND' };
        thread.strength = Math.max(0, thread.strength - amount);
        this._triggerHook('threadWeakened', { threadId, newStrength: thread.strength });
        return { success: true };
    }

    getConnection(id) { return this.connections.get(id) ? { ...this.connections.get(id) } : null; }
    listConnections() { return Array.from(this.connections.values()).map(c => ({ ...c })); }
    listConnectionsByThread(threadId) { return Array.from(this.connections.values()).filter(c => c.fromId === threadId || c.toId === threadId).map(c => ({ ...c })); }

    findShortestPath(fromId, toId) {
        if (!this.threads.has(fromId) || !this.threads.has(toId)) return null;
        const visited = new Set();
        const queue = [[fromId]];
        while (queue.length > 0) {
            const path = queue.shift();
            const node = path[path.length - 1];
            if (node === toId) return path;
            if (visited.has(node)) continue;
            visited.add(node);
            const thread = this.threads.get(node);
            for (const cId of thread.connections) {
                const connection = this.connections.get(cId);
                if (!connection) continue;
                const next = connection.fromId === node ? connection.toId : connection.fromId;
                if (!visited.has(next)) queue.push([...path, next]);
            }
        }
        return null;
    }

    registerTool(name, handler) { this.tools.set(name, { name, handler }); }
    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try { return { success: true, result: tool.handler(context || {}) }; }
        catch (e) { return { success: false, error: e.message }; }
    }
    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalThreads < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxThreads += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { threads: Array.from(this.threads.entries()), connections: Array.from(this.connections.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.threads) this.threads = new Map(data.threads);
        if (data.connections) this.connections = new Map(data.connections);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, threadCount: this.threads.size, connectionCount: this.connections.size }; }
}