/**
 * CultivationDreamDaoInsight.js - 梦中悟道系统
 * V864 Iteration 7/30 Round 34 - Direction A
 *
 * 数据结构:
 *   DaoInsight = {
 *     id, dreamId, daoFragment, insightLevel, daoHeartProgress, crystallizedAt
 *   }
 *
 * 核心 API:
 *   - awakenDao(dreamId, daoFragment): 梦中悟道
 *   - integrateInsight(dreamId, level): 融合感悟
 *   - crystallizeDaoHeart(dreamId): 凝聚道心
 *
 * 配置:
 *   - DAO_FRAGMENTS (5): water|fire|wind|thunder|void
 *   - INSIGHT_LEVELS (10): 等级上限
 *   - DAO_HEART_THRESHOLDS: 凝聚道心阈值
 */

export const DAO_FRAGMENTS = ['water', 'fire', 'wind', 'thunder', 'void'];
export const INSIGHT_LEVELS = 10;
export const DAO_HEART_THRESHOLDS = {
    AWAKEN: 10,
    ADVANCE: 50,
    CRYSTALLIZE: 100,
};

export class CultivationDreamDaoInsight {
    constructor(config = {}) {
        this.config = {
            maxInsights: config.maxInsights ?? 100,
            baseSuccessRate: config.baseSuccessRate ?? 0.5,
            baseHeartProgress: config.baseHeartProgress ?? 5,
            insightCap: config.insightCap ?? INSIGHT_LEVELS,
            ...config,
        };
        this.daoInsights = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAwakenings: 0, totalCrystallizations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDaoInsight', (ctx) => this.getDaoInsight(ctx.id));
        this.registerTool('listByFragment', (ctx) => this.listByFragment(ctx.fragment));
    }

    awakenDao(dreamId, daoFragment, options = {}) {
        const id = options.id || `dao_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fragment = DAO_FRAGMENTS.includes(daoFragment) ? daoFragment : 'water';
        const initialLevel = options.initialLevel ?? 1;
        const successRate = options.successRate ?? this.config.baseSuccessRate;
        const skillBonus = options.skillBonus ?? 0;
        const effectiveRate = Math.min(1, successRate + skillBonus);
        const heartProgress = options.heartProgress ?? Math.floor(this.config.baseHeartProgress * effectiveRate);
        const insight = {
            id,
            dreamId: dreamId ?? 'unknown_dream',
            daoFragment: fragment,
            insightLevel: initialLevel,
            daoHeartProgress: heartProgress,
            crystallizedAt: null,
            awakenedAt: Date.now(),
            successRate: effectiveRate,
        };
        this.daoInsights.set(id, insight);
        this.stats.totalAwakenings++;
        this._triggerHook('daoAwakened', { id, dreamId: insight.dreamId, fragment });
        return { success: true, daoInsight: insight };
    }

    getDaoInsight(id) {
        const insight = this.daoInsights.get(id);
        return insight ? { ...insight } : null;
    }

    listDaoInsights() {
        return Array.from(this.daoInsights.values()).map(d => ({ ...d }));
    }

    listByDream(dreamId) {
        return Array.from(this.daoInsights.values()).filter(d => d.dreamId === dreamId).map(d => ({ ...d }));
    }

    listByFragment(fragment) {
        return Array.from(this.daoInsights.values()).filter(d => d.daoFragment === fragment).map(d => ({ ...d }));
    }

    listCrystallized() {
        return Array.from(this.daoInsights.values()).filter(d => d.crystallizedAt !== null).map(d => ({ ...d }));
    }

    listTopHeart(n = 5) {
        return [...this.listDaoInsights()].sort((a, b) => b.daoHeartProgress - a.daoHeartProgress).slice(0, n);
    }

    integrateInsight(dreamId, level = 1) {
        const insights = this.listByDream(dreamId).filter(d => d.crystallizedAt === null);
        if (insights.length === 0) return { success: false, error: 'NO_ACTIVE_INSIGHT' };
        const target = insights[0];
        const stored = this.daoInsights.get(target.id);
        const previousLevel = stored.insightLevel;
        stored.insightLevel = Math.min(this.config.insightCap, stored.insightLevel + level);
        const delta = stored.insightLevel - previousLevel;
        stored.daoHeartProgress = Math.min(DAO_HEART_THRESHOLDS.CRYSTALLIZE, stored.daoHeartProgress + delta * 5);
        this._triggerHook('insightIntegrated', { id: target.id, dreamId, newLevel: stored.insightLevel });
        return { success: true, id: target.id, insightLevel: stored.insightLevel, daoHeartProgress: stored.daoHeartProgress };
    }

    crystallizeDaoHeart(dreamId) {
        const insights = this.listByDream(dreamId).filter(d => d.crystallizedAt === null);
        if (insights.length === 0) return { success: false, error: 'NO_ACTIVE_INSIGHT' };
        const target = insights[0];
        const stored = this.daoInsights.get(target.id);
        if (stored.daoHeartProgress < DAO_HEART_THRESHOLDS.CRYSTALLIZE) {
            return { success: false, error: 'INSUFFICIENT_HEART_PROGRESS' };
        }
        stored.crystallizedAt = Date.now();
        stored.insightLevel = this.config.insightCap;
        this.stats.totalCrystallizations++;
        this._triggerHook('daoHeartCrystallized', { id: target.id, dreamId });
        return { success: true, id: target.id, crystallizedAt: stored.crystallizedAt };
    }

    calculateDaoPower(id) {
        const insight = this.daoInsights.get(id);
        if (!insight) return 0;
        const base = insight.insightLevel * 50;
        const heartBonus = insight.daoHeartProgress * 2;
        const crystalBonus = insight.crystallizedAt !== null ? 200 : 0;
        return base + heartBonus + crystalBonus;
    }

    mergeDaoInsights(id, otherId) {
        const a = this.daoInsights.get(id);
        const b = this.daoInsights.get(otherId);
        if (!a || !b) return { success: false, error: 'INSIGHT_NOT_FOUND' };
        if (a.daoFragment !== b.daoFragment) return { success: false, error: 'FRAGMENT_MISMATCH' };
        a.insightLevel = Math.min(this.config.insightCap, a.insightLevel + b.insightLevel);
        a.daoHeartProgress = Math.min(DAO_HEART_THRESHOLDS.CRYSTALLIZE, a.daoHeartProgress + b.daoHeartProgress);
        if (b.crystallizedAt !== null && a.crystallizedAt === null) {
            a.crystallizedAt = b.crystallizedAt;
        }
        this.daoInsights.delete(otherId);
        this._triggerHook('daoInsightsMerged', { id, otherId });
        return { success: true, merged: { ...a } };
    }

    deleteDaoInsight(id) {
        if (!this.daoInsights.has(id)) return { success: false, error: 'INSIGHT_NOT_FOUND' };
        this.daoInsights.delete(id);
        this._triggerHook('daoInsightDeleted', { id });
        return { success: true };
    }

    registerTool(name, handler) {
        this.tools.set(name, { name, handler });
    }

    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try {
            return { success: true, result: tool.handler(context ?? {}) };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    listTools() {
        return Array.from(this.tools.keys());
    }

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
            try {
                h(data);
            } catch (e) {
                // swallow hook errors
            }
        }
    }

    autoEvolve() {
        if (this.stats.totalAwakenings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            daoInsights: Array.from(this.daoInsights.entries()),
            stats: this.stats,
            config: this.config,
        };
    }

    fromJSON(data) {
        if (data.daoInsights) this.daoInsights = new Map(data.daoInsights);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            insightCount: this.daoInsights.size,
            crystallizedCount: this.listCrystallized().length,
        };
    }
}
