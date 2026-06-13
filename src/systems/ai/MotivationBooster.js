/**
 * MotivationBooster.js - 动机增强器
 * V971 P-20260614-024 Iteration 24/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (chatdev multi-agent + motivation):
 * - 当玩家动机下降时推送激励内容
 * - 维护 motivational message pool
 * - 个性化匹配玩家动机
 */

export const MOTIVATION_KINDS = ['achievement', 'social', 'exploration', 'mastery', 'immersion'];
export const BOOST_TIMING = ['immediate', 'session_start', 'achievement', 'random'];

export class MotivationBooster {
    constructor(config = {}) {
        this.config = { ...config };
        this.messages = new Map();      // kind -> [messages]
        this.delivered = new Map();     // playerId -> [{kind, ts}]
        this.hooks = new Map();
        this.stats = { totalDelivered: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    addMessage(kind, message) {
        if (!MOTIVATION_KINDS.includes(kind)) return false;
        if (!this.messages.has(kind)) this.messages.set(kind, []);
        this.messages.get(kind).push(message);
        return true;
    }

    getMessagesFor(kind) {
        return [...(this.messages.get(kind) || [])];
    }

    boost(playerId, kind, timing = 'immediate') {
        if (!MOTIVATION_KINDS.includes(kind)) return null;
        if (!BOOST_TIMING.includes(timing)) return null;
        const list = this.getMessagesFor(kind);
        if (list.length === 0) return null;
        const idx = Math.floor(Math.random() * list.length);
        const message = list[idx];
        this._recordDelivery(playerId, kind, message);
        this.stats.totalDelivered++;
        this._emit('boosted', { playerId, kind, message, timing });
        return { message, kind, timing };
    }

    boostForMotivation(playerId, dominantMotivation) {
        if (!dominantMotivation) return null;
        return this.boost(playerId, dominantMotivation);
    }

    _recordDelivery(playerId, kind, message) {
        if (!this.delivered.has(playerId)) this.delivered.set(playerId, []);
        this.delivered.get(playerId).push({ kind, message, ts: Date.now() });
        if (this.delivered.get(playerId).length > 100) this.delivered.get(playerId).shift();
    }

    listDelivered(playerId) {
        return [...(this.delivered.get(playerId) || [])];
    }

    countByKind(playerId) {
        const list = this.listDelivered(playerId);
        const counts = {};
        for (const k of MOTIVATION_KINDS) counts[k] = 0;
        for (const d of list) counts[d.kind] = (counts[d.kind] || 0) + 1;
        return counts;
    }

    isTimeForBoost(playerId, cooldownMs = 300000) {
        const list = this.listDelivered(playerId);
        if (list.length === 0) return true;
        const last = list[list.length - 1];
        return Date.now() - last.ts > cooldownMs;
    }

    report(playerId) {
        const list = this.listDelivered(playerId);
        return {
            playerId,
            totalDelivered: list.length,
            counts: this.countByKind(playerId),
        };
    }

    reset() {
        this.messages.clear();
        this.delivered.clear();
        this.stats = { totalDelivered: 0 };
    }
}
