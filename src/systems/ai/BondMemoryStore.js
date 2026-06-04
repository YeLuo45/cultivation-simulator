/**
 * BondMemoryStore.js - 羁绊记忆持久化存储
 * V305 Iteration 2/9 - Bond Memory Persistence
 *
 * 融合6大设计系统:
 * - nanobot: 记忆mesh网络 (分布式存储)
 * - generic-agent: 记忆自进化
 * - claude-code: 记忆搜索工具
 * - thunderbolt: 离线持久化
 * - ruflo: 记忆事件Hook
 * - chatdev: 记忆角色分类
 */

export class BondMemoryStore {
    constructor(config = {}) {
        this.config = {
            maxMemoriesPerBond: config.maxMemoriesPerBond || 1000,
            memoryDecayRate: config.memoryDecayRate || 0.001,
            emotionalWeight: config.emotionalWeight || 0.5,
            autoSave: config.autoSave !== false,
            ...config
        };

        this.memories = new Map();        // memoryId -> memory
        this.bondIndex = new Map();        // companionshipId -> Set<memoryId>
        this.timeline = [];                // chronological
        this.emotionalMap = new Map();     // emotion -> count
        this.meshNodes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalStored: 0,
            totalRecalled: 0,
            totalForgotten: 0,
            evolutionCount: 0
        };

        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('searchMemories', (ctx) => this.searchMemories(ctx.query || {}));
        this.registerTool('getMemoryStrength', (ctx) => this.getMemoryStrength(ctx.memoryId));
        this.registerTool('forgetOldest', (ctx) => this.forgetOldest(ctx.companionshipId, ctx.count || 1));
    }

    // ========== 记忆存储 ==========

    storeMemory(memoryData) {
        if (!memoryData.companionshipId) return { success: false, error: 'COMPANIONSHIP_ID_REQUIRED' };
        const memoryId = memoryData.id || `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const memory = {
            memoryId,
            companionshipId: memoryData.companionshipId,
            content: memoryData.content || '',
            emotion: memoryData.emotion || 'neutral',
            intensity: memoryData.intensity || 0.5,
            tags: memoryData.tags || [],
            participants: memoryData.participants || [],
            timestamp: memoryData.timestamp || Date.now(),
            recalled: 0,
            strength: 1.0
        };
        this.memories.set(memoryId, memory);
        if (!this.bondIndex.has(memory.companionshipId)) {
            this.bondIndex.set(memory.companionshipId, new Set());
        }
        this.bondIndex.get(memory.companionshipId).add(memoryId);
        this.timeline.push(memoryId);
        this._incrementEmotion(memory.emotion);
        this.stats.totalStored++;
        this._triggerHook('memoryStored', { memoryId, companionshipId: memory.companionshipId });
        return { success: true, memory };
    }

    _incrementEmotion(emotion) {
        this.emotionalMap.set(emotion, (this.emotionalMap.get(emotion) || 0) + 1);
    }

    getMemory(memoryId) {
        const m = this.memories.get(memoryId);
        return m ? { ...m } : null;
    }

    updateMemory(memoryId, updates) {
        const m = this.memories.get(memoryId);
        if (!m) return { success: false, error: 'MEMORY_NOT_FOUND' };
        if (updates.content !== undefined) m.content = updates.content;
        if (updates.emotion !== undefined) m.emotion = updates.emotion;
        if (updates.intensity !== undefined) m.intensity = updates.intensity;
        if (updates.tags !== undefined) m.tags = updates.tags;
        return { success: true, memory: { ...m } };
    }

    deleteMemory(memoryId) {
        if (!this.memories.has(memoryId)) return { success: false, error: 'MEMORY_NOT_FOUND' };
        const m = this.memories.get(memoryId);
        const bondSet = this.bondIndex.get(m.companionshipId);
        if (bondSet) bondSet.delete(memoryId);
        this.emotionalMap.set(m.emotion, Math.max(0, (this.emotionalMap.get(m.emotion) || 0) - 1));
        this.memories.delete(memoryId);
        const idx = this.timeline.indexOf(memoryId);
        if (idx >= 0) this.timeline.splice(idx, 1);
        this.stats.totalForgotten++;
        this._triggerHook('memoryDeleted', { memoryId });
        return { success: true };
    }

    // ========== 记忆回忆 ==========

    recallMemory(memoryId) {
        const m = this.memories.get(memoryId);
        if (!m) return { success: false, error: 'MEMORY_NOT_FOUND' };
        m.recalled++;
        m.strength = Math.min(2, m.strength + 0.1);
        this.stats.totalRecalled++;
        this._triggerHook('memoryRecalled', { memoryId, recallCount: m.recalled });
        return { success: true, memory: { ...m } };
    }

    getMemoriesByCompanionship(companionshipId) {
        const ids = this.bondIndex.get(companionshipId) || new Set();
        return Array.from(ids).map(id => this.memories.get(id)).filter(Boolean).map(m => ({ ...m }));
    }

    getMemoriesByEmotion(emotion) {
        return Array.from(this.memories.values()).filter(m => m.emotion === emotion).map(m => ({ ...m }));
    }

    getMemoriesByTag(tag) {
        return Array.from(this.memories.values()).filter(m => m.tags.includes(tag)).map(m => ({ ...m }));
    }

    getMemoriesByParticipant(participantId) {
        return Array.from(this.memories.values()).filter(m => m.participants.includes(participantId)).map(m => ({ ...m }));
    }

    // ========== 记忆强度与衰减 ==========

    getMemoryStrength(memoryId) {
        const m = this.memories.get(memoryId);
        if (!m) return 0;
        const age = Date.now() - m.timestamp;
        const decay = this.config.memoryDecayRate * age / (1000 * 60 * 60 * 24);  // per day
        return Math.max(0, m.strength - decay + m.recalled * 0.1);
    }

    applyDecay() {
        for (const m of this.memories.values()) {
            m.strength = Math.max(0, m.strength - this.config.memoryDecayRate);
        }
        this._triggerHook('decayApplied', { time: Date.now() });
        return { success: true, count: this.memories.size };
    }

    forgetOldest(companionshipId, count = 1) {
        const memories = this.getMemoriesByCompanionship(companionshipId)
            .sort((a, b) => a.timestamp - b.timestamp);
        const toForget = memories.slice(0, count);
        for (const m of toForget) {
            this.deleteMemory(m.memoryId);
        }
        return { success: true, forgotten: toForget.length };
    }

    // ========== 搜索 ==========

    searchMemories(query) {
        let results = Array.from(this.memories.values());
        if (query.companionshipId) results = results.filter(m => m.companionshipId === query.companionshipId);
        if (query.emotion) results = results.filter(m => m.emotion === query.emotion);
        if (query.tag) results = results.filter(m => m.tags.includes(query.tag));
        if (query.participant) results = results.filter(m => m.participants.includes(query.participant));
        if (query.minIntensity !== undefined) results = results.filter(m => m.intensity >= query.minIntensity);
        if (query.keyword) {
            const kw = query.keyword.toLowerCase();
            results = results.filter(m => m.content.toLowerCase().includes(kw));
        }
        return results.sort((a, b) => b.timestamp - a.timestamp).map(m => ({ ...m }));
    }

    getTimeline(limit = 50) {
        const recent = this.timeline.slice(-limit);
        return recent.map(id => this.memories.get(id)).filter(Boolean).map(m => ({ ...m }));
    }

    // ========== 情感分析 ==========

    getEmotionalProfile(companionshipId) {
        const memories = this.getMemoriesByCompanionship(companionshipId);
        const profile = {};
        for (const m of memories) {
            profile[m.emotion] = (profile[m.emotion] || 0) + m.intensity;
        }
        return profile;
    }

    getMostFrequentEmotion(companionshipId) {
        const profile = this.getEmotionalProfile(companionshipId);
        const entries = Object.entries(profile);
        if (entries.length === 0) return null;
        entries.sort((a, b) => b[1] - a[1]);
        return entries[0][0];
    }

    // ========== Mesh 分布式存储 (nanobot) ==========

    addMeshNode(nodeId, region) {
        const node = { nodeId, region: region || 'default', memories: new Set(), connected: true };
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }

    connectMeshNodes(a, b) {
        const na = this.meshNodes.get(a);
        const nb = this.meshNodes.get(b);
        if (!na || !nb) return { success: false, error: 'NODE_NOT_FOUND' };
        if (!na.connections) na.connections = new Set();
        if (!nb.connections) nb.connections = new Set();
        na.connections.add(b);
        nb.connections.add(a);
        return { success: true };
    }

    distributeMemoryToMesh(memoryId, sourceNodeId) {
        const source = this.meshNodes.get(sourceNodeId);
        if (!source) return { success: false, error: 'NODE_NOT_FOUND' };
        const memory = this.memories.get(memoryId);
        if (!memory) return { success: false, error: 'MEMORY_NOT_FOUND' };
        const visited = new Set([sourceNodeId]);
        const queue = [sourceNodeId];
        const targets = [];
        while (queue.length > 0) {
            const current = queue.shift();
            const node = this.meshNodes.get(current);
            if (!node || !node.connected) continue;
            node.memories.add(memoryId);
            targets.push(current);
            for (const n of (node.connections || [])) {
                if (!visited.has(n)) { visited.add(n); queue.push(n); }
            }
        }
        return { success: true, propagated: targets.length };
    }

    // ========== 工具系统 (claude-code) ==========

    registerTool(name, handler) {
        this.tools.set(name, { name, handler, registeredAt: Date.now() });
    }

    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try {
            const result = tool.handler(context || {});
            return { success: true, result };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    listTools() {
        return Array.from(this.tools.keys());
    }

    // ========== Hook 系统 (ruflo) ==========

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => {
            const arr = this.hooks.get(event);
            if (arr) {
                const idx = arr.indexOf(handler);
                if (idx >= 0) arr.splice(idx, 1);
            }
        };
    }

    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) {
            try { h(data); } catch (e) { /* silent */ }
        }
    }

    // ========== 自进化 (generic-agent) ==========

    autoEvolve() {
        if (this.stats.totalStored < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.memoryDecayRate = Math.max(0, this.config.memoryDecayRate - 0.0001);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    // ========== 持久化 (thunderbolt) ==========

    toJSON() {
        return {
            memories: Array.from(this.memories.entries()),
            bondIndex: Array.from(this.bondIndex.entries()).map(([k, v]) => [k, Array.from(v)]),
            timeline: this.timeline,
            emotionalMap: Array.from(this.emotionalMap.entries()),
            meshNodes: Array.from(this.meshNodes.entries()),
            stats: this.stats,
            config: this.config
        };
    }

    fromJSON(data) {
        if (data.memories) this.memories = new Map(data.memories);
        if (data.bondIndex) this.bondIndex = new Map(data.bondIndex.map(([k, v]) => [k, new Set(v)]));
        if (data.timeline) this.timeline = data.timeline;
        if (data.emotionalMap) this.emotionalMap = new Map(data.emotionalMap);
        if (data.meshNodes) {
            this.meshNodes = new Map(data.meshNodes.map(([k, v]) => [k, { ...v, memories: new Set(v.memories || []), connections: new Set(v.connections || []) }]));
        }
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            memoryCount: this.memories.size,
            bondCount: this.bondIndex.size,
            meshNodeCount: this.meshNodes.size
        };
    }
}