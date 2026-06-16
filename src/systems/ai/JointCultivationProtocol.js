/**
 * JointCultivationProtocol.js - 双修协议引擎
 * V306 Iteration 3/9 - Dual Cultivation Engine
 *
 * 融合6大设计系统:
 * - generic-agent: 双修自进化
 * - chatdev: 双修角色协调
 * - nanobot: 灵力传输mesh
 * - claude-code: 双修计算工具
 * - thunderbolt: 双修会话持久化
 * - ruflo: 双修事件Hook
 */

export class JointCultivationProtocol {
    constructor(config = {}) {
        this.config = {
            maxConcurrentSessions: config.maxConcurrentSessions || 5,
            baseSynergyBonus: config.baseSynergyBonus || 0.2,
            energyTransferRate: config.energyTransferRate || 0.5,
            harmonyThreshold: config.harmonyThreshold || 0.7,
            ...config
        };

        this.sessions = new Map();
        this.techniques = new Map();
        this.participants = new Map();
        this.cultivations = new Map();
        this.meshNodes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalSessions: 0,
            totalCompleted: 0,
            totalFailed: 0,
            totalEnergyExchanged: 0,
            evolutionCount: 0
        };

        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('calculateSynergy', (ctx) => this.calculateSynergy(ctx.participantA, ctx.participantB));
        this.registerTool('getSessionStatus', (ctx) => this.getSession(ctx.sessionId));
        this.registerTool('listActiveSessions', () => this.listActiveSessions());
    }

    // ========== 参与者管理 ==========

    registerParticipant(data) {
        const id = data.id || `par_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const participant = {
            id,
            name: data.name || 'Anonymous',
            spiritualRoot: data.spiritualRoot || 'balanced',
            cultivationLevel: data.cultivationLevel || 1,
            qiPool: data.qiPool || 100,
            maxQi: data.maxQi || 1000,
            daoHeart: data.daoHeart || 0.5,
            harmony: data.harmony || 0.5,
            affinity: data.affinity || []
        };
        this.participants.set(id, participant);
        return { success: true, participant };
    }

    getParticipant(id) {
        return this.participants.get(id) || null;
    }

    // ========== 功法管理 ==========

    registerTechnique(data) {
        const id = data.id || `tech_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const technique = {
            id,
            name: data.name || 'Unnamed',
            type: data.type || 'dual',  // dual, group, solo
            element: data.element || 'none',
            qiCost: data.qiCost || 50,
            duration: data.duration || 1000,
            minHarmony: data.minHarmony || 0.3,
            minSynergy: data.minSynergy || 0.4,
            effects: data.effects || []
        };
        this.techniques.set(id, technique);
        return { success: true, technique };
    }

    getTechnique(id) {
        return this.techniques.get(id) || null;
    }

    // ========== 协同度计算 ==========

    calculateSynergy(participantAId, participantBId) {
        const a = this.participants.get(participantAId);
        const b = this.participants.get(participantBId);
        if (!a || !b) return { success: false, error: 'PARTICIPANT_NOT_FOUND' };
        let synergy = this.config.baseSynergyBonus;
        if (a.spiritualRoot === b.spiritualRoot) synergy += 0.2;
        const overlap = a.affinity.filter(x => b.affinity.includes(x)).length;
        synergy += Math.min(0.3, overlap * 0.1);
        const avgDaoHeart = (a.daoHeart + b.daoHeart) / 2;
        synergy += avgDaoHeart * 0.1;
        const harmony = (a.harmony + b.harmony) / 2;
        synergy += harmony * 0.2;
        return { success: true, synergy: Math.min(1, synergy) };
    }

    // ========== 双修会话 ==========

    startSession(participantAId, participantBId, techniqueId) {
        if (this.sessions.size >= this.config.maxConcurrentSessions) {
            return { success: false, error: 'TOO_MANY_SESSIONS' };
        }
        const a = this.participants.get(participantAId);
        const b = this.participants.get(participantBId);
        if (!a || !b) return { success: false, error: 'PARTICIPANT_NOT_FOUND' };
        const technique = this.techniques.get(techniqueId);
        if (!technique) return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        const synergyResult = this.calculateSynergy(participantAId, participantBId);
        if (synergyResult.synergy < technique.minSynergy) {
            return { success: false, error: 'SYNERGY_TOO_LOW' };
        }
        if (a.qiPool < technique.qiCost) return { success: false, error: 'INSUFFICIENT_QI_A' };
        if (b.qiPool < technique.qiCost) return { success: false, error: 'INSUFFICIENT_QI_B' };
        const sessionId = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const session = {
            sessionId,
            participants: [participantAId, participantBId],
            techniqueId,
            synergy: synergyResult.synergy,
            qiExchanged: 0,
            progress: 0,
            status: 'active',
            startedAt: Date.now()
        };
        this.sessions.set(sessionId, session);
        this.stats.totalSessions++;
        this._triggerHook('sessionStarted', { sessionId, participants: [participantAId, participantBId] });
        return { success: true, session };
    }

    getSession(sessionId) {
        const s = this.sessions.get(sessionId);
        return s ? { ...s } : null;
    }

    listActiveSessions() {
        return Array.from(this.sessions.values()).filter(s => s.status === 'active').map(s => ({ ...s }));
    }

    // ========== 能量交换 ==========

    exchangeEnergy(sessionId, amount) {
        const session = this.sessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'active') return { success: false, error: 'SESSION_INACTIVE' };
        const a = this.participants.get(session.participants[0]);
        const b = this.participants.get(session.participants[1]);
        if (!a || !b) return { success: false, error: 'PARTICIPANT_NOT_FOUND' };
        const half = amount / 2;
        const transfer = half * this.config.energyTransferRate * session.synergy;
        a.qiPool = Math.max(0, a.qiPool - transfer);
        b.qiPool = Math.min(b.maxQi, b.qiPool + transfer);
        a.qiPool = Math.min(a.maxQi, a.qiPool + transfer);
        b.qiPool = Math.max(0, b.qiPool - transfer);
        session.qiExchanged += amount;
        this.stats.totalEnergyExchanged += amount;
        this._triggerHook('energyExchanged', { sessionId, amount });
        return { success: true, transferred: amount };
    }

    // ========== 推进会话 ==========

    advanceSession(sessionId, effort = 10) {
        const session = this.sessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'active') return { success: false, error: 'SESSION_INACTIVE' };
        const technique = this.techniques.get(session.techniqueId);
        if (!technique) return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        session.progress = Math.min(100, session.progress + effort * session.synergy);
        if (session.progress >= 100) {
            return this.completeSession(sessionId);
        }
        return { success: true, session: { ...session } };
    }

    completeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'active') return { success: false, error: 'SESSION_INACTIVE' };
        const a = this.participants.get(session.participants[0]);
        const b = this.participants.get(session.participants[1]);
        if (a) {
            a.cultivationLevel += Math.floor(session.synergy * 2);
            a.harmony = Math.min(1, a.harmony + 0.05);
        }
        if (b) {
            b.cultivationLevel += Math.floor(session.synergy * 2);
            b.harmony = Math.min(1, b.harmony + 0.05);
        }
        session.status = 'completed';
        session.completedAt = Date.now();
        this.stats.totalCompleted++;
        this._triggerHook('sessionCompleted', { sessionId });
        return { success: true, session: { ...session } };
    }

    failSession(sessionId, reason = 'unknown') {
        const session = this.sessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'active') return { success: false, error: 'SESSION_INACTIVE' };
        session.status = 'failed';
        session.failureReason = reason;
        session.failedAt = Date.now();
        this.stats.totalFailed++;
        this._triggerHook('sessionFailed', { sessionId, reason });
        return { success: true, session: { ...session } };
    }

    // ========== Mesh 灵力传输 (nanobot) ==========

    addMeshNode(nodeId) {
        const node = { nodeId, qiReservoir: 100, connections: new Set(), active: true };
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }

    connectMeshNodes(a, b) {
        const na = this.meshNodes.get(a);
        const nb = this.meshNodes.get(b);
        if (!na || !nb) return { success: false, error: 'NODE_NOT_FOUND' };
        na.connections.add(b);
        nb.connections.add(a);
        return { success: true };
    }

    transferQi(fromNode, toNode, amount) {
        const from = this.meshNodes.get(fromNode);
        const to = this.meshNodes.get(toNode);
        if (!from || !to) return { success: false, error: 'NODE_NOT_FOUND' };
        if (!from.connections.has(toNode)) return { success: false, error: 'NOT_CONNECTED' };
        if (from.qiReservoir < amount) return { success: false, error: 'INSUFFICIENT_QI' };
        from.qiReservoir -= amount;
        to.qiReservoir += amount;
        this._triggerHook('qiTransferred', { from: fromNode, to: toNode, amount });
        return { success: true, transferred: amount };
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
        if (this.stats.totalCompleted < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseSynergyBonus = Math.min(0.5, this.config.baseSynergyBonus + 0.05);
        this.config.energyTransferRate = Math.min(1, this.config.energyTransferRate + 0.1);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    // ========== 持久化 (thunderbolt) ==========

    toJSON() {
        return {
            sessions: Array.from(this.sessions.entries()),
            techniques: Array.from(this.techniques.entries()),
            participants: Array.from(this.participants.entries()),
            meshNodes: Array.from(this.meshNodes.entries()),
            stats: this.stats,
            config: this.config
        };
    }

    fromJSON(data) {
        if (data.sessions) this.sessions = new Map(data.sessions);
        if (data.techniques) this.techniques = new Map(data.techniques);
        if (data.participants) this.participants = new Map(data.participants);
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
            sessionCount: this.sessions.size,
            techniqueCount: this.techniques.size,
            participantCount: this.participants.size,
            meshNodeCount: this.meshNodes.size
        };
    }
}