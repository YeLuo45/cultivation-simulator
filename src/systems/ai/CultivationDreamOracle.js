/**
 * CultivationDreamOracle.js - 修真梦境神谕
 * V869 Iteration 3/30 Round 34
 */
export const ORACLE_TOPICS = ['cultivation', 'combat', 'love', 'wealth', 'health'];
export const ANSWER_TEMPLATES = [
    'The path reveals itself in time',
    'Seek balance and harmony',
    'A storm approaches, prepare',
    'Blessings flow from the heavens',
    'Beware the shadow that follows',
    'Patience yields the greatest reward',
    'Trust the journey within',
    'The answer lies in stillness'
];
export const CONFIDENCE_LEVELS = ['doubtful', 'uncertain', 'neutral', 'confident', 'certain'];

export class CultivationDreamOracle {
    constructor(config = {}) {
        this.config = { maxOracles: config.maxOracles || 50, baseConfidence: config.baseConfidence ?? 0.5, ...config };
        this.oracles = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalConsulted: 0, totalInterpreted: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getOracle', (ctx) => this.getOracle(ctx.oracleId));
        this.registerTool('listByTopic', (ctx) => this.listByTopic(ctx.topic));
    }

    consultOracle(dreamId, question) {
        if (typeof question !== 'string' || !question) return { success: false, error: 'INVALID_QUESTION' };
        const id = `oracle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const answer = ANSWER_TEMPLATES[Math.floor(Math.random() * ANSWER_TEMPLATES.length)];
        const confidence = Math.min(1, this.config.baseConfidence + Math.random() * 0.2);
        const oracle = {
            id, dreamId, question, answer, interpretation: null,
            confidenceLevel: this._getConfidenceLevel(confidence),
            confidence, topic: null,
            consultedAt: Date.now()
        };
        this.oracles.set(id, oracle);
        this.stats.totalConsulted++;
        this._triggerHook('oracleConsulted', { id, dreamId, question });
        return { success: true, oracle };
    }

    _getConfidenceLevel(c) {
        const idx = Math.min(CONFIDENCE_LEVELS.length - 1, Math.max(0, Math.floor(c * CONFIDENCE_LEVELS.length)));
        return CONFIDENCE_LEVELS[idx];
    }

    interpretAnswer(oracleId) {
        const oracle = this.oracles.get(oracleId);
        if (!oracle) return { success: false, error: 'ORACLE_NOT_FOUND' };
        oracle.interpretation = `Interpretation: ${oracle.answer} - trust the vision.`;
        oracle.interpretedAt = Date.now();
        this.stats.totalInterpreted++;
        this._triggerHook('answerInterpreted', { oracleId });
        return { success: true, interpretation: oracle.interpretation };
    }

    seekGuidance(dreamId, topic) {
        if (!ORACLE_TOPICS.includes(topic)) return { success: false, error: 'INVALID_TOPIC' };
        const id = `oracle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const confidence = Math.min(1, this.config.baseConfidence + 0.1 + Math.random() * 0.15);
        const oracle = {
            id, dreamId, question: `Guidance on ${topic}`, answer: ANSWER_TEMPLATES[Math.floor(Math.random() * ANSWER_TEMPLATES.length)],
            interpretation: null, confidence, confidenceLevel: this._getConfidenceLevel(confidence),
            topic, consultedAt: Date.now()
        };
        this.oracles.set(id, oracle);
        this.stats.totalConsulted++;
        this._triggerHook('guidanceSought', { id, dreamId, topic });
        return { success: true, oracle };
    }

    getOracle(id) { return this.oracles.get(id) ? { ...this.oracles.get(id) } : null; }
    listOracles() { return Array.from(this.oracles.values()).map(o => ({ ...o })); }
    listByTopic(topic) { return Array.from(this.oracles.values()).filter(o => o.topic === topic).map(o => ({ ...o })); }
    listByDream(dreamId) { return Array.from(this.oracles.values()).filter(o => o.dreamId === dreamId).map(o => ({ ...o })); }
    listInterpreted() { return Array.from(this.oracles.values()).filter(o => o.interpretation).map(o => ({ ...o })); }

    raiseConfidence(oracleId, amount = 0.1) {
        const oracle = this.oracles.get(oracleId);
        if (!oracle) return { success: false, error: 'ORACLE_NOT_FOUND' };
        oracle.confidence = Math.min(1, oracle.confidence + amount);
        oracle.confidenceLevel = this._getConfidenceLevel(oracle.confidence);
        return { success: true, confidence: oracle.confidence };
    }

    getConfidenceLevelName(confidence) {
        if (typeof confidence !== 'number') return CONFIDENCE_LEVELS[0];
        return this._getConfidenceLevel(confidence);
    }

    deleteOracle(oracleId) {
        if (!this.oracles.has(oracleId)) return { success: false, error: 'ORACLE_NOT_FOUND' };
        this.oracles.delete(oracleId);
        this._triggerHook('oracleDeleted', { oracleId });
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

    toJSON() { return { oracles: Array.from(this.oracles.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.oracles) this.oracles = new Map(data.oracles);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, oracleCount: this.oracles.size }; }
}
