/**
 * ReflectionPrompt.js - 反思提示
 * V972 P-20260614-025 Iteration 25/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (chatdev multi-agent + reflection):
 * - 在关键节点提示玩家反思
 * - 维护反思问题池
 * - 记录反思回答
 */

export const REFLECTION_TRIGGERS = ['session_end', 'level_up', 'failure_streak', 'achievement', 'milestone'];
export const DEFAULT_PROMPTS_PER_KIND = 3;

export class ReflectionPrompt {
    constructor(config = {}) {
        this.config = { promptsPerKind: config.promptsPerKind || DEFAULT_PROMPTS_PER_KIND, ...config };
        this.prompts = new Map();       // trigger -> [prompts]
        this.responses = new Map();      // playerId -> [{trigger, prompt, response, ts}]
        this.hooks = new Map();
        this.stats = { totalPrompted: 0, totalReflected: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    addPrompt(trigger, prompt) {
        if (!REFLECTION_TRIGGERS.includes(trigger)) return false;
        if (!this.prompts.has(trigger)) this.prompts.set(trigger, []);
        if (this.prompts.get(trigger).length >= this.config.promptsPerKind) return false;
        this.prompts.get(trigger).push(prompt);
        return true;
    }

    getPromptsFor(trigger) {
        return [...(this.prompts.get(trigger) || [])];
    }

    promptPlayer(playerId, trigger) {
        if (!REFLECTION_TRIGGERS.includes(trigger)) return null;
        const list = this.getPromptsFor(trigger);
        if (list.length === 0) return null;
        const prompt = list[Math.floor(Math.random() * list.length)];
        this.stats.totalPrompted++;
        this._emit('prompted', { playerId, prompt, trigger });
        return { prompt, trigger };
    }

    recordResponse(playerId, trigger, prompt, response) {
        if (!this.responses.has(playerId)) this.responses.set(playerId, []);
        const entry = { trigger, prompt, response, ts: Date.now() };
        this.responses.get(playerId).push(entry);
        this.stats.totalReflected++;
        this._emit('responded', { playerId, entry });
        return entry;
    }

    listResponses(playerId) {
        return [...(this.responses.get(playerId) || [])];
    }

    responsesByTrigger(playerId, trigger) {
        return this.listResponses(playerId).filter(r => r.trigger === trigger);
    }

    reflectionRate(playerId) {
        const list = this.listResponses(playerId);
        return list.length;
    }

    hasMeaningfulReflection(playerId) {
        const list = this.listResponses(playerId);
        return list.some(r => r.response && r.response.length > 10);
    }

    report(playerId) {
        const list = this.listResponses(playerId);
        return {
            playerId,
            totalPrompted: this.stats.totalPrompted,
            totalResponses: list.length,
            byTrigger: list.reduce((acc, r) => {
                acc[r.trigger] = (acc[r.trigger] || 0) + 1;
                return acc;
            }, {}),
            hasMeaningful: this.hasMeaningfulReflection(playerId),
        };
    }

    reset() {
        this.prompts.clear();
        this.responses.clear();
        this.stats = { totalPrompted: 0, totalReflected: 0 };
    }
}
