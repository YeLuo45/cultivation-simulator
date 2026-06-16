/**
 * TechniqueInnovationSystem.js - 功法创新系统
 * V301 Iteration 7/9 - Technique Innovation System
 * 
 * 融合6大设计系统:
 * - generic-agent: 创新自进化
 * - chatdev: 协作研发
 * - nanobot: mesh网络知识共享
 * - claude-code: 工具系统
 * - thunderbolt: 离线持久化
 * - ruflo: Hook系统
 */

export class TechniqueInnovationSystem {
    constructor(config = {}) {
        this.config = {
            maxInnovations: config.maxInnovations || 50,
            innovationCost: config.innovationCost || 500,
            researchSpeed: config.researchSpeed || 1.0,
            autoSave: config.autoSave !== false,
            ...config
        };
        
        this.techniques = new Map();
        this.innovations = new Map();
        this.researchProjects = new Map();
        this.researchers = new Map();
        this.innovationHistory = [];
        this.meshNodes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalInnovations: 0, totalResearch: 0, evolutionCount: 0 };
        
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('analyzeTechnique', (ctx) => this.analyzeTechnique(ctx.techniqueId));
        this.registerTool('listInnovations', (ctx) => this.listInnovations(ctx.filter || {}));
        this.registerTool('getResearchStatus', (ctx) => this.getResearchStatus(ctx.projectId));
    }

    // ========== 功法管理 ==========
    
    registerTechnique(techniqueData) {
        const techniqueId = techniqueData.id || `tech_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const technique = {
            techniqueId,
            name: techniqueData.name || 'Unnamed Technique',
            element: techniqueData.element || 'none',
            tier: techniqueData.tier || 1,
            power: techniqueData.power || 10,
            complexity: techniqueData.complexity || 0.5,
            compatibility: techniqueData.compatibility || new Map(),
            origin: techniqueData.origin || 'natural',
            createdAt: Date.now()
        };
        this.techniques.set(techniqueId, technique);
        return { success: true, technique };
    }

    getTechnique(techniqueId) {
        return this.techniques.get(techniqueId) || null;
    }

    listTechniques(filter = {}) {
        const all = Array.from(this.techniques.values());
        if (filter.element) return all.filter(t => t.element === filter.element);
        if (filter.tier) return all.filter(t => t.tier === filter.tier);
        return all;
    }

    // ========== 创新系统 ==========
    
    innovate(parentId, mutationData = {}) {
        const parent = this.techniques.get(parentId);
        if (!parent) return { success: false, error: 'PARENT_NOT_FOUND' };
        
        const innovationId = `inn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mutationRate = mutationData.mutationRate || 0.1;
        
        const mutation = this._applyMutation(parent, mutationRate, mutationData);
        const innovation = {
            innovationId,
            parentId,
            name: mutationData.name || `${parent.name} v2`,
            element: mutation.element,
            tier: mutation.tier,
            power: mutation.power,
            complexity: Math.min(1, mutation.complexity),
            novelty: this._calculateNovelty(parent, mutation),
            createdAt: Date.now(),
            meshShared: false
        };
        
        this.innovations.set(innovationId, innovation);
        this.innovationHistory.push({ innovationId, parentId, timestamp: Date.now() });
        this.stats.totalInnovations++;
        this._triggerHook('innovationCreated', { innovationId, parentId });
        
        return { success: true, innovation };
    }

    _applyMutation(parent, rate, data) {
        const newElement = data.element || (Math.random() < rate ? this._mutateElement(parent.element) : parent.element);
        const newTier = data.tier || (Math.random() < rate * 2 ? parent.tier + 1 : parent.tier);
        const powerDelta = (Math.random() - 0.4) * 0.3;
        return {
            element: newElement,
            tier: newTier,
            power: Math.max(1, parent.power * (1 + powerDelta)),
            complexity: parent.complexity + (Math.random() - 0.5) * 0.2
        };
    }

    _mutateElement(element) {
        const elements = ['fire', 'water', 'earth', 'wind', 'thunder', 'ice', 'light', 'dark'];
        return elements[Math.floor(Math.random() * elements.length)];
    }

    _calculateNovelty(parent, mutation) {
        let novelty = 0;
        if (mutation.element !== parent.element) novelty += 0.5;
        if (mutation.tier !== parent.tier) novelty += 0.3;
        if (Math.abs(mutation.power - parent.power) > 5) novelty += 0.2;
        return Math.min(1, novelty);
    }

    getInnovation(innovationId) {
        return this.innovations.get(innovationId) || null;
    }

    listInnovations(filter = {}) {
        const all = Array.from(this.innovations.values());
        if (filter.parentId) return all.filter(i => i.parentId === filter.parentId);
        if (filter.minNovelty !== undefined) return all.filter(i => i.novelty >= filter.minNovelty);
        return all;
    }

    promoteInnovation(innovationId) {
        const innovation = this.innovations.get(innovationId);
        if (!innovation) return { success: false, error: 'INNOVATION_NOT_FOUND' };
        
        const technique = {
            id: innovation.innovationId,
            name: innovation.name,
            element: innovation.element,
            tier: innovation.tier,
            power: innovation.power,
            complexity: innovation.complexity,
            origin: 'innovation',
            parent: innovation.parentId
        };
        this.techniques.set(technique.id, technique);
        this._triggerHook('innovationPromoted', { innovationId, techniqueId: technique.id });
        return { success: true, technique };
    }

    // ========== 研发管理 (chatdev) ==========
    
    startResearch(innovationId, researcherId) {
        const innovation = this.innovations.get(innovationId);
        if (!innovation) return { success: false, error: 'INNOVATION_NOT_FOUND' };
        if (!this.researchers.has(researcherId)) {
            this.researchers.set(researcherId, { id: researcherId, reputation: 0, completedProjects: 0 });
        }
        
        const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const project = {
            projectId,
            innovationId,
            researcherId,
            progress: 0,
            requiredProgress: 100,
            cost: this.config.innovationCost,
            status: 'active',
            startedAt: Date.now()
        };
        this.researchProjects.set(projectId, project);
        this.stats.totalResearch++;
        this._triggerHook('researchStarted', { projectId, innovationId, researcherId });
        return { success: true, project };
    }

    advanceResearch(projectId, effort = 10) {
        const project = this.researchProjects.get(projectId);
        if (!project) return { success: false, error: 'PROJECT_NOT_FOUND' };
        if (project.status !== 'active') return { success: false, error: 'PROJECT_INACTIVE' };
        
        project.progress = Math.min(project.requiredProgress, project.progress + effort * this.config.researchSpeed);
        if (project.progress >= project.requiredProgress) {
            project.status = 'completed';
            project.completedAt = Date.now();
            const researcher = this.researchers.get(project.researcherId);
            if (researcher) {
                researcher.completedProjects++;
                researcher.reputation += 10;
            }
            this._triggerHook('researchCompleted', { projectId, innovationId: project.innovationId });
        }
        return { success: true, project };
    }

    getResearchStatus(projectId) {
        const project = this.researchProjects.get(projectId);
        if (!project) return null;
        return {
            projectId,
            status: project.status,
            progress: project.progress,
            percent: (project.progress / project.requiredProgress) * 100
        };
    }

    listResearchProjects(filter = {}) {
        const all = Array.from(this.researchProjects.values());
        if (filter.status) return all.filter(p => p.status === filter.status);
        if (filter.researcherId) return all.filter(p => p.researcherId === filter.researcherId);
        return all;
    }

    // ========== Mesh 网络 (nanobot) ==========
    
    addMeshNode(nodeId, category) {
        const node = {
            nodeId,
            category: category || 'general',
            neighbors: [],
            knowledge: new Set(),
            connected: true
        };
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }

    connectMeshNodes(nodeA, nodeB) {
        const a = this.meshNodes.get(nodeA);
        const b = this.meshNodes.get(nodeB);
        if (!a || !b) return { success: false, error: 'NODE_NOT_FOUND' };
        if (!a.neighbors.includes(nodeB)) a.neighbors.push(nodeB);
        if (!b.neighbors.includes(nodeA)) b.neighbors.push(nodeA);
        return { success: true };
    }

    shareInnovationToMesh(innovationId, nodeId) {
        const innovation = this.innovations.get(innovationId);
        const node = this.meshNodes.get(nodeId);
        if (!innovation) return { success: false, error: 'INNOVATION_NOT_FOUND' };
        if (!node) return { success: false, error: 'NODE_NOT_FOUND' };
        node.knowledge.add(innovationId);
        innovation.meshShared = true;
        this._triggerHook('meshShared', { innovationId, nodeId });
        return { success: true, propagated: 1 };
    }

    broadcastInnovation(innovationId, sourceNodeId) {
        const source = this.meshNodes.get(sourceNodeId);
        if (!source) return { success: false, error: 'NODE_NOT_FOUND' };
        const innovation = this.innovations.get(innovationId);
        if (!innovation) return { success: false, error: 'INNOVATION_NOT_FOUND' };
        
        const visited = new Set([sourceNodeId]);
        const queue = [sourceNodeId];
        const targets = [];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const node = this.meshNodes.get(current);
            if (!node || !node.connected) continue;
            if (node.category === 'innovation' || node.category === 'research') {
                node.knowledge.add(innovationId);
                targets.push(current);
            }
            for (const n of node.neighbors) {
                if (!visited.has(n)) { visited.add(n); queue.push(n); }
            }
        }
        return { success: true, propagated: targets.length, targets };
    }

    // Analysis method (claude-code tool target)
    analyzeTechnique(techniqueId) {
        const technique = this.techniques.get(techniqueId);
        if (!technique) return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        return {
            success: true,
            analysis: {
                techniqueId,
                name: technique.name,
                element: technique.element,
                tier: technique.tier,
                power: technique.power,
                complexity: technique.complexity
            }
        };
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
        if (this.stats.totalInnovations < 5) return { evolved: false, reason: 'NOT_ENOUGH_INNOVATIONS' };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        
        this.config.researchSpeed *= 1.1;
        this.config.innovationCost = Math.floor(this.config.innovationCost * 0.95);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    // ========== 持久化 (thunderbolt) ==========
    
    toJSON() {
        return {
            techniques: Array.from(this.techniques.entries()),
            innovations: Array.from(this.innovations.entries()),
            researchProjects: Array.from(this.researchProjects.entries()),
            researchers: Array.from(this.researchers.entries()),
            meshNodes: Array.from(this.meshNodes.entries()),
            stats: this.stats,
            config: this.config
        };
    }

    fromJSON(data) {
        if (data.techniques) this.techniques = new Map(data.techniques);
        if (data.innovations) this.innovations = new Map(data.innovations);
        if (data.researchProjects) this.researchProjects = new Map(data.researchProjects);
        if (data.researchers) this.researchers = new Map(data.researchers);
        if (data.meshNodes) {
            this.meshNodes = new Map(data.meshNodes.map(([k, v]) => [k, { ...v, knowledge: new Set(v.knowledge || []) }]));
        }
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            techniqueCount: this.techniques.size,
            innovationCount: this.innovations.size,
            researchProjectCount: this.researchProjects.size,
            researcherCount: this.researchers.size,
            meshNodeCount: this.meshNodes.size
        };
    }
}