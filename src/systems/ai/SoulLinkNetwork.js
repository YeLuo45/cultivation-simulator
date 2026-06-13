/**
 * SoulLinkNetwork.js - 神魂连接网络
 * V310 Iteration 7/9 - Soul Link Mesh
 */
export class SoulLinkNetwork {
    constructor(config = {}) {
        this.config = {
            maxLinkDepth: config.maxLinkDepth || 3,
            resonanceDecay: config.resonanceDecay || 0.1,
            ...config
        };
        this.nodes = new Map();
        this.links = new Map();
        this.resonance = new Map();
        this.broadcasts = [];
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLinks: 0, totalBroadcasts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getNode', (ctx) => this.getNode(ctx.nodeId));
        this.registerTool('getNetworkOverview', () => this.getNetworkOverview());
    }

    addNode(data) {
        const id = data.id || `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const node = {
            nodeId: id, ownerId: data.ownerId || null, soulType: data.soulType || 'normal',
            power: data.power || 1, links: new Set(), active: true
        };
        this.nodes.set(id, node);
        return { success: true, node };
    }

    getNode(id) { const n = this.nodes.get(id); return n ? { ...n, links: Array.from(n.links) } : null; }
    listNodes() { return Array.from(this.nodes.values()).map(n => ({ ...n, links: Array.from(n.links) })); }

    createLink(nodeAId, nodeBId, strength = 1.0) {
        const a = this.nodes.get(nodeAId);
        const b = this.nodes.get(nodeBId);
        if (!a || !b) return { success: false, error: 'NODE_NOT_FOUND' };
        const linkId = `lnk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const link = { linkId, nodeAId, nodeBId, strength, createdAt: Date.now() };
        this.links.set(linkId, link);
        a.links.add(linkId);
        b.links.add(linkId);
        this.stats.totalLinks++;
        this._triggerHook('linkCreated', { linkId, nodeAId, nodeBId });
        return { success: true, link };
    }

    severLink(linkId) {
        const link = this.links.get(linkId);
        if (!link) return { success: false, error: 'LINK_NOT_FOUND' };
        const a = this.nodes.get(link.nodeAId);
        const b = this.nodes.get(link.nodeBId);
        if (a) a.links.delete(linkId);
        if (b) b.links.delete(linkId);
        this.links.delete(linkId);
        this._triggerHook('linkSevered', { linkId });
        return { success: true };
    }

    setResonance(nodeAId, nodeBId, level) {
        const key = this._resonanceKey(nodeAId, nodeBId);
        this.resonance.set(key, { level, updatedAt: Date.now() });
        this._triggerHook('resonanceChanged', { nodeAId, nodeBId, level });
        return { success: true };
    }

    getResonance(nodeAId, nodeBId) {
        const key = this._resonanceKey(nodeAId, nodeBId);
        return this.resonance.get(key) || null;
    }

    _resonanceKey(a, b) { return [a, b].sort().join('::'); }

    applyResonanceDecay() {
        for (const [key, r] of this.resonance) {
            r.level = Math.max(0, r.level - this.config.resonanceDecay);
        }
        this._triggerHook('resonanceDecayed', { time: Date.now() });
        return { success: true };
    }

    broadcast(sourceNodeId, message, depth = 1) {
        const source = this.nodes.get(sourceNodeId);
        if (!source) return { success: false, error: 'NODE_NOT_FOUND' };
        const visited = new Set([sourceNodeId]);
        const queue = [{ id: sourceNodeId, d: 0 }];
        const received = [];
        while (queue.length > 0) {
            const { id, d } = queue.shift();
            if (d > depth) continue;
            const node = this.nodes.get(id);
            if (!node || !node.active) continue;
            if (d > 0) received.push(id);
            for (const linkId of node.links) {
                const link = this.links.get(linkId);
                if (!link) continue;
                const other = link.nodeAId === id ? link.nodeBId : link.nodeAId;
                if (!visited.has(other)) { visited.add(other); queue.push({ id: other, d: d + 1 }); }
            }
        }
        const broadcast = { id: `bcd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, sourceNodeId, message, received, depth, timestamp: Date.now() };
        this.broadcasts.push(broadcast);
        this.stats.totalBroadcasts++;
        this._triggerHook('broadcastSent', broadcast);
        return { success: true, broadcast };
    }

    getNetworkOverview() {
        return {
            nodeCount: this.nodes.size,
            linkCount: this.links.size,
            resonanceCount: this.resonance.size,
            broadcastCount: this.broadcasts.length
        };
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
        if (this.stats.totalLinks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLinkDepth++;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            nodes: Array.from(this.nodes.entries()).map(([k, v]) => [k, { ...v, links: Array.from(v.links) }]),
            links: Array.from(this.links.entries()),
            resonance: Array.from(this.resonance.entries()),
            broadcasts: this.broadcasts,
            stats: this.stats, config: this.config
        };
    }
    fromJSON(data) {
        if (data.nodes) this.nodes = new Map(data.nodes.map(([k, v]) => [k, { ...v, links: new Set(v.links || []) }]));
        if (data.links) this.links = new Map(data.links);
        if (data.resonance) this.resonance = new Map(data.resonance);
        if (data.broadcasts) this.broadcasts = data.broadcasts;
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, nodeCount: this.nodes.size, linkCount: this.links.size }; }
}