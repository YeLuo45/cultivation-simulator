/**
 * ElementalCultivation.js - 元素修炼
 * V361 Iteration 4/9 Round 9
 */
export class ElementalCultivation {
    constructor(config = {}) {
        this.config = { maxExp: config.maxExp || 1000, baseExp: config.baseExp || 5, ...config };
        this.cultivators = new Map();
        this.sessions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSessions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCultivator', (ctx) => this.getCultivator(ctx.cultivatorId));
        this.registerTool('startSession', (ctx) => this.startSession(ctx.cultivatorId, ctx.elementId));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', exp: 0, level: 1, element: null, totalSessions: 0 };
        this.cultivators.set(id, cultivator);
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }

    startSession(cultivatorId, elementId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const validElements = ['metal', 'wood', 'water', 'fire', 'earth'];
        if (!validElements.includes(elementId)) return { success: false, error: 'INVALID_ELEMENT' };
        const id = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const session = { sessionId: id, cultivatorId, elementId, status: 'in_progress', progress: 0, startedAt: Date.now() };
        this.sessions.set(id, session);
        this.stats.totalSessions++;
        this._triggerHook('sessionStarted', { cultivatorId, sessionId: id, elementId });
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
        const exp = this.config.baseExp * 2;
        cultivator.exp += exp;
        cultivator.element = session.elementId;
        cultivator.totalSessions++;
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

    listByElement(elementId) { return Array.from(this.cultivators.values()).filter(c => c.element === elementId).map(c => ({ ...c })); }

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

    toJSON() { return { cultivators: Array.from(this.cultivators.entries()), sessions: Array.from(this.sessions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.sessions) this.sessions = new Map(data.sessions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultivatorCount: this.cultivators.size }; }
}