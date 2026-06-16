/**
 * SectJustice.js - 宗门审判
 * V472 Iteration 4/15 Round 18
 */
export class SectJustice {
    constructor(config = {}) {
        this.config = { maxTrials: config.maxTrials || 100, baseEvidence: config.baseEvidence || 1, ...config };
        this.trials = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTrials: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTrial', (ctx) => this.getTrial(ctx.trialId));
        this.registerTool('fileTrial', (ctx) => this.fileTrial(ctx));
    }

    fileTrial(data) {
        const id = data.id || `trl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const trial = {
            trialId: id,
            sectId: data.sectId,
            defendant: data.defendant,
            accuser: data.accuser,
            evidence: data.evidence ? [...data.evidence] : Array(this.config.baseEvidence).fill('initial_evidence'),
            verdict: data.verdict || '',
            status: data.status || 'filed',
            createdAt: Date.now()
        };
        this.trials.set(id, trial);
        this.stats.totalTrials++;
        this._triggerHook('trialFiled', { trialId: id });
        return { success: true, trial };
    }

    getTrial(id) {
        const trial = this.trials.get(id);
        if (!trial) return null;
        return { ...trial, evidence: [...trial.evidence] };
    }

    listTrials() { return Array.from(this.trials.values()).map(t => ({ ...t, evidence: [...t.evidence] })); }
    listBySect(sectId) { return Array.from(this.trials.values()).filter(t => t.sectId === sectId).map(t => ({ ...t, evidence: [...t.evidence] })); }
    listByStatus(status) { return Array.from(this.trials.values()).filter(t => t.status === status).map(t => ({ ...t, evidence: [...t.evidence] })); }

    addEvidence(trialId, evidence) {
        const trial = this.trials.get(trialId);
        if (!trial) return { success: false, error: 'TRIAL_NOT_FOUND' };
        trial.evidence.push(evidence);
        this._triggerHook('evidenceAdded', { trialId, evidence, totalEvidence: trial.evidence.length });
        return { success: true };
    }

    presentVerdict(trialId, verdict) {
        const trial = this.trials.get(trialId);
        if (!trial) return { success: false, error: 'TRIAL_NOT_FOUND' };
        trial.verdict = verdict;
        this._triggerHook('verdictPresented', { trialId, verdict });
        return { success: true };
    }

    settleTrial(trialId) {
        const trial = this.trials.get(trialId);
        if (!trial) return { success: false, error: 'TRIAL_NOT_FOUND' };
        trial.status = 'verdict';
        this._triggerHook('trialSettled', { trialId });
        return { success: true };
    }

    calculateJudgmentScore(trialId) {
        const trial = this.trials.get(trialId);
        if (!trial) return 0;
        return trial.evidence.length * 10 + trial.verdict.length;
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
        if (this.stats.totalTrials < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTrials += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { trials: Array.from(this.trials.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.trials) this.trials = new Map(data.trials);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, trialCount: this.trials.size }; }
}
