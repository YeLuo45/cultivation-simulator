/**
 * CultivationDreamCultivationInsight.js - 梦中修真感悟
 * V865 P-20260613-008 Iteration 8/30 Round 34
 *
 * 修真梦境系统：梦境内领悟修真感悟
 * - 核心 API: gainInsight / mergeInsights / extractWisdom
 * - 数据结构: { id, dreamId, source, wisdomScore, mergedCount, extractedEssence, gainedAt }
 * - 配置: INSIGHT_SOURCES (3), WISDOM_THRESHOLDS (5 grade), EXTRACTION_RATES
 */

export const INSIGHT_SOURCES = {
    breakthrough: {
        name: '突破感悟',
        wisdomGain: 12,
        rarity: 0.5,
    },
    alchemy: {
        name: '炼丹感悟',
        wisdomGain: 8,
        rarity: 0.3,
    },
    encounter: {
        name: '奇遇感悟',
        wisdomGain: 5,
        rarity: 0.2,
    },
};

export const SOURCE_KEYS = ['breakthrough', 'alchemy', 'encounter'];

export const WISDOM_THRESHOLDS = [0, 20, 50, 100, 200];

export const WISDOM_GRADES = ['novice', 'apprentice', 'adept', 'sage', 'immortal'];

export const EXTRACTION_RATES = {
    novice: 0.1,
    apprentice: 0.2,
    adept: 0.3,
    sage: 0.4,
    immortal: 0.5,
};

export const WISDOM_GRADE_MAX = 4;

export const INSIGHT_STATES = {
    GAINED: 'gained',
    MERGED: 'merged',
    EXTRACTED: 'extracted',
};

export class CultivationDreamCultivationInsight {
    constructor(config = {}) {
        this.config = {
            maxInsights: config.maxInsights !== undefined ? config.maxInsights : 50,
            maxMergeBatch: config.maxMergeBatch !== undefined ? config.maxMergeBatch : 10,
            essenceCap: config.essenceCap !== undefined ? config.essenceCap : 100000,
            baseMergeBonus: config.baseMergeBonus !== undefined ? config.baseMergeBonus : 2,
            ...config,
        };
        this.insights = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGains: 0, totalMerges: 0, totalExtractions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getInsight', (ctx) => this.getInsight(ctx.insightId));
        this.registerTool('listInsightsByDream', (ctx) => this.listInsightsByDream(ctx.dreamId));
    }

    _genId() {
        return `insight_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _isValidSource(source) {
        return typeof source === 'string' && SOURCE_KEYS.includes(source);
    }

    _calcWisdomGrade(wisdomScore) {
        let g = 0;
        for (let i = 0; i < WISDOM_THRESHOLDS.length; i++) {
            if (wisdomScore >= WISDOM_THRESHOLDS[i]) {
                g = i;
            }
        }
        return g;
    }

    gainInsight(dreamId, source) {
        if (typeof dreamId !== 'string' || dreamId.length === 0) {
            return { success: false, error: 'INVALID_DREAM_ID' };
        }
        if (!this._isValidSource(source)) {
            return { success: false, error: 'UNKNOWN_SOURCE' };
        }
        if (this.insights.size >= this.config.maxInsights) {
            return { success: false, error: 'MAX_INSIGHTS_REACHED' };
        }
        const id = this._genId();
        const srcDef = INSIGHT_SOURCES[source];
        const insight = {
            id,
            dreamId,
            source,
            sourceName: srcDef.name,
            wisdomScore: srcDef.wisdomGain,
            mergedCount: 0,
            extractedEssence: 0,
            gainedAt: Date.now(),
            state: INSIGHT_STATES.GAINED,
        };
        this.insights.set(id, insight);
        this.stats.totalGains++;
        this._triggerHook('insightGained', { insightId: id, dreamId, source });
        return { success: true, insight };
    }

    getInsight(id) {
        const ins = this.insights.get(id);
        return ins ? { ...ins } : null;
    }

    listInsights() {
        return Array.from(this.insights.values()).map(ins => ({ ...ins }));
    }

    listInsightsByDream(dreamId) {
        return Array.from(this.insights.values())
            .filter(ins => ins.dreamId === dreamId)
            .map(ins => ({ ...ins }));
    }

    listInsightsBySource(source) {
        return Array.from(this.insights.values())
            .filter(ins => ins.source === source)
            .map(ins => ({ ...ins }));
    }

    listInsightsByGrade(grade) {
        return Array.from(this.insights.values())
            .filter(ins => this._calcWisdomGrade(ins.wisdomScore) === grade)
            .map(ins => ({ ...ins }));
    }

    listInsightsByState(state) {
        return Array.from(this.insights.values())
            .filter(ins => ins.state === state)
            .map(ins => ({ ...ins }));
    }

    listExtractedInsights() {
        return Array.from(this.insights.values())
            .filter(ins => ins.extractedEssence > 0)
            .map(ins => ({ ...ins }));
    }

    mergeInsights(dreamId, insightIds) {
        if (typeof dreamId !== 'string' || dreamId.length === 0) {
            return { success: false, error: 'INVALID_DREAM_ID' };
        }
        if (!Array.isArray(insightIds) || insightIds.length < 2) {
            return { success: false, error: 'INVALID_IDS' };
        }
        if (insightIds.length > this.config.maxMergeBatch) {
            return { success: false, error: 'BATCH_TOO_LARGE' };
        }
        const targets = [];
        for (const iid of insightIds) {
            const ins = this.insights.get(iid);
            if (!ins) return { success: false, error: 'INSIGHT_NOT_FOUND' };
            if (ins.dreamId !== dreamId) {
                return { success: false, error: 'DREAM_MISMATCH' };
            }
            if (ins.state === INSIGHT_STATES.EXTRACTED) {
                return { success: false, error: 'ALREADY_EXTRACTED' };
            }
            targets.push(ins);
        }
        // Sum wisdom, mark all but the first as merged (we keep first as the merge target)
        // The first insight absorbs wisdom from others and its mergedCount increments by (n-1)
        const primary = targets[0];
        let totalMergedWisdom = 0;
        for (let i = 1; i < targets.length; i++) {
            totalMergedWisdom += targets[i].wisdomScore;
            targets[i].state = INSIGHT_STATES.MERGED;
            targets[i].wisdomScore = 0;
        }
        primary.wisdomScore = primary.wisdomScore + totalMergedWisdom + this.config.baseMergeBonus;
        primary.mergedCount += targets.length - 1;
        primary.state = INSIGHT_STATES.MERGED;
        this.stats.totalMerges++;
        this._triggerHook('insightsMerged', {
            dreamId,
            primaryInsightId: primary.id,
            mergedCount: primary.mergedCount,
            wisdomScore: primary.wisdomScore,
        });
        return {
            success: true,
            primaryInsightId: primary.id,
            mergedCount: primary.mergedCount,
            wisdomScore: primary.wisdomScore,
        };
    }

    extractWisdom(insightId) {
        const ins = this.insights.get(insightId);
        if (!ins) return { success: false, error: 'INSIGHT_NOT_FOUND' };
        if (ins.state === INSIGHT_STATES.EXTRACTED) {
            return { success: false, error: 'ALREADY_EXTRACTED' };
        }
        const grade = this._calcWisdomGrade(ins.wisdomScore);
        const gradeName = WISDOM_GRADES[grade];
        const rate = EXTRACTION_RATES[gradeName];
        const extracted = Math.min(this.config.essenceCap, Math.floor(ins.wisdomScore * rate));
        ins.extractedEssence = extracted;
        ins.state = INSIGHT_STATES.EXTRACTED;
        this.stats.totalExtractions++;
        this._triggerHook('wisdomExtracted', {
            insightId,
            grade: gradeName,
            extractedEssence: extracted,
        });
        return {
            success: true,
            grade: gradeName,
            extractedEssence: extracted,
        };
    }

    calculateWisdomGrade(insightId) {
        const ins = this.insights.get(insightId);
        if (!ins) return null;
        const g = this._calcWisdomGrade(ins.wisdomScore);
        return WISDOM_GRADES[g];
    }

    getDreamInsightSummary(dreamId) {
        const inss = this.listInsightsByDream(dreamId);
        if (inss.length === 0) {
            return {
                dreamId,
                insightCount: 0,
                totalWisdom: 0,
                totalEssence: 0,
                maxGrade: WISDOM_GRADES[0],
            };
        }
        const totalWisdom = inss.reduce((s, ins) => s + ins.wisdomScore, 0);
        const totalEssence = inss.reduce((s, ins) => s + ins.extractedEssence, 0);
        let maxGradeIdx = 0;
        for (const ins of inss) {
            const g = this._calcWisdomGrade(ins.wisdomScore);
            if (g > maxGradeIdx) maxGradeIdx = g;
        }
        return {
            dreamId,
            insightCount: inss.length,
            totalWisdom,
            totalEssence,
            maxGrade: WISDOM_GRADES[maxGradeIdx],
        };
    }

    registerTool(name, handler) {
        this.tools.set(name, { name, handler });
    }

    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try {
            return {
                success: true,
                result: tool.handler(context !== undefined && context !== null ? context : {}),
            };
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
            try { h(data); } catch (e) { /* swallow */ }
        }
    }

    autoEvolve() {
        if (this.stats.totalGains < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            insights: Array.from(this.insights.entries()),
            stats: { ...this.stats },
            config: { ...this.config },
        };
    }

    fromJSON(data) {
        if (data.insights) this.insights = new Map(data.insights);
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return { ...this.stats, insightCount: this.insights.size };
    }
}
