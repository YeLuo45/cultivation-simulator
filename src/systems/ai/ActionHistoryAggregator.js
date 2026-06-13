/**
 * ActionHistoryAggregator.js - 行动历史聚合器
 * V950 P-20260614-003 Iteration 3/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (thunderbolt aggregation pipeline):
 * - 聚合玩家连续行为到 action chain
 * - 检测 action sequence pattern
 * - 按时间窗聚合 (hour/day/week)
 * - 提供趋势分析
 */

export const AGGREGATION_WINDOWS = ['hour', 'day', 'week', 'month'];
export const CHAIN_MAX_LENGTH = 50;

export class ActionHistoryAggregator {
    constructor(config = {}) {
        this.config = {
            defaultWindow: config.defaultWindow || 'day',
            chainMaxLength: config.chainMaxLength || CHAIN_MAX_LENGTH,
            ...config,
        };
        this.actions = new Map();          // actionId -> action
        this.playerActions = new Map();    // playerId -> Map<window, actionId[]>
        this.chains = new Map();           // playerId -> chain[]
        this.hooks = new Map();
        this.stats = { totalRecorded: 0, totalAggregated: 0, totalChains: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }

    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _windowKey(window, ts) {
        const d = new Date(ts);
        if (window === 'hour') return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${d.getUTCHours()}`;
        if (window === 'day') return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
        if (window === 'week') {
            const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const dayOfYear = Math.floor((d - jan1) / 86400000);
            const week = Math.floor(dayOfYear / 7);
            return `${d.getUTCFullYear()}-W${week}`;
        }
        if (window === 'month') return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
        return String(ts);
    }

    record(playerId, actionType, outcome = 'success', meta = {}) {
        if (!playerId || !actionType) return null;
        const id = `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const action = { id, playerId, actionType, outcome, meta, timestamp: Date.now() };
        this.actions.set(id, action);
        if (!this.playerActions.has(playerId)) this.playerActions.set(playerId, new Map());
        const wmap = this.playerActions.get(playerId);
        for (const w of AGGREGATION_WINDOWS) {
            if (!wmap.has(w)) wmap.set(w, new Map());
            const k = this._windowKey(w, action.timestamp);
            if (!wmap.get(w).has(k)) wmap.get(w).set(k, []);
            wmap.get(w).get(k).push(id);
        }
        this._addToChain(playerId, action);
        this.stats.totalRecorded++;
        this._emit('recorded', action);
        return action;
    }

    _addToChain(playerId, action) {
        if (!this.chains.has(playerId)) this.chains.set(playerId, []);
        const c = this.chains.get(playerId);
        c.push(action);
        if (c.length > this.config.chainMaxLength) c.shift();
        if (c.length >= 2) {
            this.stats.totalChains++;
            this._emit('chainExtended', { playerId, chain: [...c] });
        }
    }

    aggregate(playerId, window) {
        const w = window || this.config.defaultWindow;
        const wmap = this.playerActions.get(playerId);
        if (!wmap) return {};
        const winMap = wmap.get(w);
        if (!winMap) return {};
        const result = {};
        for (const [k, ids] of winMap) {
            const acts = ids.map(id => this.actions.get(id)).filter(Boolean);
            const typeCounts = {};
            const outcomeCounts = {};
            for (const a of acts) {
                typeCounts[a.actionType] = (typeCounts[a.actionType] || 0) + 1;
                outcomeCounts[a.outcome] = (outcomeCounts[a.outcome] || 0) + 1;
            }
            result[k] = { count: acts.length, typeCounts, outcomeCounts };
        }
        this.stats.totalAggregated++;
        return result;
    }

    getChain(playerId) {
        return [...(this.chains.get(playerId) || [])];
    }

    findPattern(playerId, minLen = 2) {
        const chain = this.getChain(playerId);
        if (chain.length < minLen) return null;
        const tail = chain.slice(-minLen);
        const sig = tail.map(a => a.actionType).join('->');
        return { signature: sig, length: tail.length, actions: tail };
    }

    getAction(actionId) { return this.actions.get(actionId) || null; }

    report(playerId) {
        const daily = this.aggregate(playerId, 'day');
        const totalDays = Object.keys(daily).length;
        let totalActions = 0;
        let peakDay = null;
        let peakCount = 0;
        for (const [k, v] of Object.entries(daily)) {
            totalActions += v.count;
            if (v.count > peakCount) { peakCount = v.count; peakDay = k; }
        }
        const chain = this.getChain(playerId);
        return {
            playerId,
            totalActions,
            totalDays,
            avgActionsPerDay: totalDays > 0 ? totalActions / totalDays : 0,
            peakDay, peakCount,
            currentChainLength: chain.length,
        };
    }

    reset() {
        this.actions.clear();
        this.playerActions.clear();
        this.chains.clear();
        this.stats = { totalRecorded: 0, totalAggregated: 0, totalChains: 0 };
    }
}
