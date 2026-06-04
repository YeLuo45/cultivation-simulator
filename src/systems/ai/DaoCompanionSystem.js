/**
 * DaoCompanionSystem.js - 道侣关系管理系统核心
 * V304 Iteration 1/9 - Dao Companion & Bond System
 *
 * 融合6大设计系统:
 * - generic-agent: 关系自进化 (bond level)
 * - chatdev: 道侣角色专业化
 * - nanobot: 心神感应mesh
 * - claude-code: 关系分析工具
 * - thunderbolt: 关系状态离线持久化
 * - ruflo: 关系事件Hook
 */

export class DaoCompanionSystem {
    constructor(config = {}) {
        this.config = {
            maxCompanionsPerCultivator: config.maxCompanionsPerCultivator || 3,
            minBondLevelForCultivation: config.minBondLevelForCultivation || 50,
            baseCompatibility: config.baseCompatibility || 0.5,
            bondGrowthRate: config.bondGrowthRate || 1.0,
            autoSave: config.autoSave !== false,
            ...config
        };

        this.companionships = new Map();
        this.companions = new Map();
        this.bonds = new Map();
        this.compatibilityScores = new Map();
        this.dates = new Map();
        this.gifts = new Map();
        this.meshNodes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalCompanionships: 0,
            totalDissolved: 0,
            totalBondsUpgraded: 0,
            evolutionCount: 0
        };

        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('analyzeCompatibility', (ctx) => this.analyzeCompatibility(ctx.cultivatorA, ctx.cultivatorB));
        this.registerTool('getBondStatus', (ctx) => this.getBond(ctx.companionshipId));
        this.registerTool('listCompanions', (ctx) => this.listCompanionships(ctx.cultivatorId || {}));
    }

    // ========== 道侣注册 ==========

    registerCompanion(companionData) {
        const id = companionData.id || `comp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const companion = {
            id,
            name: companionData.name || 'Anonymous',
            gender: companionData.gender || 'unknown',
            realm: companionData.realm || 'qi_refining',
            personality: companionData.personality || 'balanced',
            daoAffinity: companionData.daoAffinity || [],
            interests: companionData.interests || [],
            available: companionData.available !== false,
            registeredAt: Date.now()
        };
        this.companions.set(id, companion);
        return { success: true, companion };
    }

    getCompanion(id) {
        return this.companions.get(id) || null;
    }

    listAvailableCompanions(filter = {}) {
        const all = Array.from(this.companions.values()).filter(c => c.available);
        if (filter.gender) return all.filter(c => c.gender === filter.gender);
        if (filter.realm) return all.filter(c => c.realm === filter.realm);
        if (filter.personality) return all.filter(c => c.personality === filter.personality);
        return all;
    }

    // ========== 兼容性分析 ==========

    analyzeCompatibility(cultivatorAId, cultivatorBId) {
        const a = this.companions.get(cultivatorAId);
        const b = this.companions.get(cultivatorBId);
        if (!a || !b) return { success: false, error: 'COMPANION_NOT_FOUND' };

        let score = this.config.baseCompatibility;
        // Personality match
        if (a.personality === b.personality) score += 0.2;
        // Dao affinity overlap
        const overlap = a.daoAffinity.filter(d => b.daoAffinity.includes(d)).length;
        score += Math.min(0.3, overlap * 0.1);
        // Interest overlap
        const interestOverlap = a.interests.filter(i => b.interests.includes(i)).length;
        score += Math.min(0.2, interestOverlap * 0.05);
        // Realm difference penalty
        const realmA = parseInt(a.realm.replace(/\D/g, '')) || 1;
        const realmB = parseInt(b.realm.replace(/\D/g, '')) || 1;
        const realmDiff = Math.abs(realmA - realmB);
        score -= Math.min(0.3, realmDiff * 0.1);

        score = Math.max(0, Math.min(1, score));
        const key = this._makeCompatibilityKey(cultivatorAId, cultivatorBId);
        this.compatibilityScores.set(key, { score, computedAt: Date.now() });
        return { success: true, score, breakdown: { personality: a.personality === b.personality, overlap, interestOverlap, realmDiff } };
    }

    _makeCompatibilityKey(a, b) {
        return [a, b].sort().join('::');
    }

    getCompatibilityScore(a, b) {
        const key = this._makeCompatibilityKey(a, b);
        const cached = this.compatibilityScores.get(key);
        return cached ? cached.score : null;
    }

    // ========== 道侣关系建立 ==========

    formCompanionship(cultivatorAId, cultivatorBId) {
        const a = this.companions.get(cultivatorAId);
        const b = this.companions.get(cultivatorBId);
        if (!a || !b) return { success: false, error: 'COMPANION_NOT_FOUND' };
        if (cultivatorAId === cultivatorBId) return { success: false, error: 'SELF_COMPANIONSHIP' };

        // Check max companions per cultivator
        const aCount = this._getCompanionshipCount(cultivatorAId);
        const bCount = this._getCompanionshipCount(cultivatorBId);
        if (aCount >= this.config.maxCompanionsPerCultivator) return { success: false, error: 'A_AT_MAX_COMPANIONS' };
        if (bCount >= this.config.maxCompanionsPerCultivator) return { success: false, error: 'B_AT_MAX_COMPANIONS' };

        const compatResult = this.analyzeCompatibility(cultivatorAId, cultivatorBId);
        if (compatResult.score < 0.3) return { success: false, error: 'INCOMPATIBLE', score: compatResult.score };

        const companionshipId = `csh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const companionship = {
            companionshipId,
            companions: [cultivatorAId, cultivatorBId],
            bondLevel: 10,
            bondType: 'acquaintance',
            status: 'new',
            formedAt: Date.now(),
            experiences: [],
            vows: []
        };
        this.companionships.set(companionshipId, companionship);
        a.available = false;
        b.available = false;
        this.stats.totalCompanionships++;
        this._triggerHook('companionshipFormed', { companionshipId, companions: [cultivatorAId, cultivatorBId] });
        return { success: true, companionship, compatibility: compatResult.score };
    }

    _getCompanionshipCount(cultivatorId) {
        let count = 0;
        for (const c of this.companionships.values()) {
            if (c.companions.includes(cultivatorId) && c.status !== 'dissolved') count++;
        }
        return count;
    }

    getCompanionship(companionshipId) {
        const c = this.companionships.get(companionshipId);
        return c ? { ...c } : null;
    }

    listCompanionships(filter = {}) {
        const all = Array.from(this.companionships.values());
        if (filter.cultivatorId) {
            return all.filter(c => c.companions.includes(filter.cultivatorId));
        }
        if (filter.status) return all.filter(c => c.status === filter.status);
        if (filter.bondType) return all.filter(c => c.bondType === filter.bondType);
        return all.map(c => ({ ...c }));
    }

    // ========== 羁绊提升 ==========

    increaseBond(companionshipId, amount, reason = 'interaction') {
        const c = this.companionships.get(companionshipId);
        if (!c) return { success: false, error: 'COMPANIONSHIP_NOT_FOUND' };
        if (c.status === 'dissolved') return { success: false, error: 'COMPANIONSHIP_DISSOLVED' };

        const growth = amount * this.config.bondGrowthRate;
        c.bondLevel = Math.min(100, c.bondLevel + growth);
        c.experiences.push({ type: reason, amount, timestamp: Date.now() });
        this._updateBondType(c);
        this.stats.totalBondsUpgraded++;
        this._triggerHook('bondIncreased', { companionshipId, newLevel: c.bondLevel });
        return { success: true, bondLevel: c.bondLevel, bondType: c.bondType };
    }

    _updateBondType(c) {
        const prevType = c.bondType;
        if (c.bondLevel >= 90) c.bondType = 'soulmate';
        else if (c.bondLevel >= 70) c.bondType = 'devoted';
        else if (c.bondLevel >= 50) c.bondType = 'intimate';
        else if (c.bondLevel >= 30) c.bondType = 'close';
        else if (c.bondLevel >= 10) c.bondType = 'acquaintance';
        else c.bondType = 'stranger';

        if (prevType !== c.bondType) {
            this._triggerHook('bondTypeChanged', { companionshipId: c.companionshipId, from: prevType, to: c.bondType });
        }
    }

    decreaseBond(companionshipId, amount, reason = 'conflict') {
        const c = this.companionships.get(companionshipId);
        if (!c) return { success: false, error: 'COMPANIONSHIP_NOT_FOUND' };
        if (c.status === 'dissolved') return { success: false, error: 'COMPANIONSHIP_DISSOLVED' };

        c.bondLevel = Math.max(0, c.bondLevel - amount);
        c.experiences.push({ type: reason, amount: -amount, timestamp: Date.now() });
        this._updateBondType(c);
        this._triggerHook('bondDecreased', { companionshipId, newLevel: c.bondLevel });
        return { success: true, bondLevel: c.bondLevel, bondType: c.bondType };
    }

    getBond(companionshipId) {
        const c = this.companionships.get(companionshipId);
        if (!c) return null;
        return {
            companionshipId,
            bondLevel: c.bondLevel,
            bondType: c.bondType,
            status: c.status,
            experienceCount: c.experiences.length
        };
    }

    // ========== 海誓山盟 ==========

    exchangeVows(companionshipId, vowText) {
        const c = this.companionships.get(companionshipId);
        if (!c) return { success: false, error: 'COMPANIONSHIP_NOT_FOUND' };
        if (c.bondLevel < 30) return { success: false, error: 'BOND_TOO_LOW' };
        const vow = { text: vowText, exchangedAt: Date.now() };
        c.vows.push(vow);
        c.bondLevel = Math.min(100, c.bondLevel + 5);
        this._updateBondType(c);
        this._triggerHook('vowsExchanged', { companionshipId, vow });
        return { success: true, vow, bondLevel: c.bondLevel };
    }

    listVows(companionshipId) {
        const c = this.companionships.get(companionshipId);
        if (!c) return [];
        return [...c.vows];
    }

    // ========== 关系解除 ==========

    dissolveCompanionship(companionshipId, reason = 'mutual') {
        const c = this.companionships.get(companionshipId);
        if (!c) return { success: false, error: 'COMPANIONSHIP_NOT_FOUND' };
        if (c.status === 'dissolved') return { success: false, error: 'ALREADY_DISSOLVED' };
        c.status = 'dissolved';
        c.dissolvedAt = Date.now();
        c.dissolutionReason = reason;
        for (const compId of c.companions) {
            const comp = this.companions.get(compId);
            if (comp) comp.available = true;
        }
        this.stats.totalDissolved++;
        this._triggerHook('companionshipDissolved', { companionshipId, reason });
        return { success: true, companionship: c };
    }

    // ========== Mesh 心神感应 (nanobot) ==========

    addMeshNode(nodeId, sensitivity = 1.0) {
        const node = { nodeId, sensitivity, connections: new Set(), active: true };
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }

    connectMeshHearts(a, b) {
        const na = this.meshNodes.get(a);
        const nb = this.meshNodes.get(b);
        if (!na || !nb) return { success: false, error: 'NODE_NOT_FOUND' };
        na.connections.add(b);
        nb.connections.add(a);
        return { success: true };
    }

    sendHeartSignal(fromNodeId, toNodeId, emotion) {
        const from = this.meshNodes.get(fromNodeId);
        const to = this.meshNodes.get(toNodeId);
        if (!from || !to) return { success: false, error: 'NODE_NOT_FOUND' };
        if (!from.connections.has(toNodeId)) return { success: false, error: 'NOT_CONNECTED' };
        this._triggerHook('heartSignalReceived', { to: toNodeId, from: fromNodeId, emotion });
        return { success: true, delivered: true, emotion };
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
        if (this.stats.totalCompanionships < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.bondGrowthRate *= 1.1;
        this.config.baseCompatibility = Math.min(0.8, this.config.baseCompatibility + 0.05);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    // ========== 持久化 (thunderbolt) ==========

    toJSON() {
        return {
            companions: Array.from(this.companions.entries()),
            companionships: Array.from(this.companionships.entries()),
            compatibilityScores: Array.from(this.compatibilityScores.entries()),
            meshNodes: Array.from(this.meshNodes.entries()),
            stats: this.stats,
            config: this.config
        };
    }

    fromJSON(data) {
        if (data.companions) this.companions = new Map(data.companions);
        if (data.companionships) this.companionships = new Map(data.companionships);
        if (data.compatibilityScores) this.compatibilityScores = new Map(data.compatibilityScores);
        if (data.meshNodes) {
            this.meshNodes = new Map(data.meshNodes.map(([k, v]) => [k, { ...v, connections: new Set(v.connections || []) }]));
        }
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            companionCount: this.companions.size,
            activeCompanionshipCount: Array.from(this.companionships.values()).filter(c => c.status !== 'dissolved').length,
            meshNodeCount: this.meshNodes.size
        };
    }
}