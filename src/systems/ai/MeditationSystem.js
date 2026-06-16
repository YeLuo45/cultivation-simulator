/**
 * MeditationSystem.js - 冥想系统
 * V347 Iteration 8/9 Round 7
 */
export class MeditationSystem {
    constructor(config = {}) {
        this.config = { maxSessions: config.maxSessions || 200, baseExp: config.baseExp || 5, ...config };
        this.cultivators = new Map();
        this.sessions = new Map();
        this.postures = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSessions: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const postures = [
            { postureId: 'lotus', name: 'Lotus Posture', multiplier: 1.5 },
            { postureId: 'standing', name: 'Standing', multiplier: 1.0 },
            { postureId: 'lying', name: 'Lying', multiplier: 0.7 }
        ];
        for (const p of postures) this.postures.set(p.postureId, p);
    }

    _registerDefaultTools() {
        this.registerTool('getCultivator', (ctx) => this.getCultivator(ctx.cultivatorId));
        this.registerTool('startSession', (ctx) => this.startSession(ctx.cultivatorId, ctx.postureId));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', exp: 0, level: 1, sessionsCompleted: 0 };
        this.cultivators.set(id, cultivator);
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }
    listCultivators() { return Array.from(this.cultivators.values()).map(c => ({ ...c })); }

    listPostures() { return Array.from(this.postures.values()).map(p => ({ ...p })); }
    getPosture(id) { return this.postures.get(id) ? { ...this.postures.get(id) } : null; }

    startSession(cultivatorId, postureId = 'lotus') {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const posture = this.postures.get(postureId);
        if (!posture) return { success: false, error: 'POSTURE_NOT_FOUND' };
        const id = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const session = { sessionId: id, cultivatorId, postureId, status: 'in_progress', progress: 0, startedAt: Date.now() };
        this.sessions.set(id, session);
        this.stats.totalSessions++;
        this._triggerHook('sessionStarted', { cultivatorId, sessionId: id });
        return { success: true, session };
    }

    advanceSession(sessionId, effort = 20) {
        const session = this.sessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'in_progress') return { success: false, error: 'SESSION_INACTIVE' };
        session.progress += effort;
        if (session.progress >= 100) return this.completeSession(sessionId);
        return { success: true, session: { ...session } };
    }

    completeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'in_progress') return { success: false, error: 'SESSION_INACTIVE' };
        const cultivator = this.cultivators.get(session.cultivatorId);
        const posture = this.postures.get(session.postureId);
        const exp = Math.floor(this.config.baseExp * posture.multiplier);
        cultivator.exp += exp;
        cultivator.sessionsCompleted++;
        const newLevel = 1 + Math.floor(cultivator.exp / 100);
        const leveled = newLevel > cultivator.level;
        cultivator.level = newLevel;
        session.status = 'completed';
        session.expGained = exp;
        this._triggerHook('sessionCompleted', { sessionId, exp });
        if (leveled) this._triggerHook('levelUp', { cultivatorId: session.cultivatorId, newLevel });
        return { success: true, session: { ...session }, cultivator: { ...cultivator } };
    }

    interruptSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        session.status = 'interrupted';
        this._triggerHook('sessionInterrupted', { sessionId });
        return { success: true };
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
        if (this.stats.totalSessions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseExp += 2;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cultivators: Array.from(this.cultivators.entries()), sessions: Array.from(this.sessions.entries()), postures: Array.from(this.postures.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.sessions) this.sessions = new Map(data.sessions);
        if (data.postures) this.postures = new Map(data.postures);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultivatorCount: this.cultivators.size, sessionCount: this.sessions.size }; }
}