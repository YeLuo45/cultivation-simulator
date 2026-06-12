/**
 * CultivationDreamPillRefining.js - 梦中炼丹
 * V861 P-20260613-004 Iteration 4/30 Round 34
 *
 * 修真梦境系统：梦境内以神识凝练丹药
 * - 核心 API: startRefining / controlFlame / extractPill
 * - 数据结构: { id, dreamId, recipe, flameIntensity, refiningProgress, pillQuality, ingredients }
 * - 配置: PILL_RECIPES, FLAME_LEVELS, QUALITY_THRESHOLDS
 */

export const PILL_RECIPES = {
    qi_gathering: {
        name: '聚气丹',
        tier: 1,
        requiredIngredients: ['spirit_grass', 'qi_essence'],
        difficulty: 0.3,
        baseQuality: 0.5,
    },
    foundation: {
        name: '筑基丹',
        tier: 2,
        requiredIngredients: ['spirit_grass', 'qi_essence', 'dragon_root'],
        difficulty: 0.6,
        baseQuality: 0.4,
    },
    golden_core: {
        name: '金丹',
        tier: 3,
        requiredIngredients: ['spirit_grass', 'qi_essence', 'dragon_root', 'phoenix_feather'],
        difficulty: 0.9,
        baseQuality: 0.3,
    },
};

export const FLAME_LEVELS = ['ember', 'low', 'medium', 'high', 'inferno'];
export const FLAME_INTENSITY_VALUES = {
    ember: 0.1,
    low: 0.3,
    medium: 0.5,
    high: 0.75,
    inferno: 1.0,
};

export const QUALITY_THRESHOLDS = {
    poor: 0.3,
    common: 0.6,
    rare: 0.85,
    legendary: 1.01,
};

export const QUALITY_TIERS = ['poor', 'common', 'rare', 'legendary'];

export class CultivationDreamPillRefining {
    constructor(config = {}) {
        this.config = {
            maxRefinings: config.maxRefinings !== undefined ? config.maxRefinings : 50,
            maxIngredients: config.maxIngredients !== undefined ? config.maxIngredients : 8,
            defaultFlameLevel: config.defaultFlameLevel !== undefined ? config.defaultFlameLevel : 1,
            progressPerTick: config.progressPerTick !== undefined ? config.progressPerTick : 10,
            ...config,
        };
        this.refinings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStarted: 0, totalExtracted: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRefining', (ctx) => this.getRefining(ctx.refiningId));
        this.registerTool('listByDream', (ctx) => this.listByDream(ctx.dreamId));
    }

    _genId() {
        return `refining_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    startRefining(dreamId, recipe, options = {}) {
        if (typeof dreamId !== 'string' || dreamId.length === 0) {
            return { success: false, error: 'INVALID_DREAM_ID' };
        }
        if (!PILL_RECIPES[recipe]) {
            return { success: false, error: 'UNKNOWN_RECIPE' };
        }
        if (this.refinings.size >= this.config.maxRefinings) {
            return { success: false, error: 'MAX_REFININGS_REACHED' };
        }
        const id = this._genId();
        const recipeDef = PILL_RECIPES[recipe];
        const flameLevel = options.flameLevel !== undefined
            ? options.flameLevel
            : this.config.defaultFlameLevel;
        const intensityIndex = flameLevel >= 0 && flameLevel < FLAME_LEVELS.length ? flameLevel : 0;
        const flameName = FLAME_LEVELS[intensityIndex];
        const refining = {
            id,
            dreamId,
            recipe,
            recipeName: recipeDef.name,
            tier: recipeDef.tier,
            flameIntensity: intensityIndex,
            flameName,
            refiningProgress: 0,
            pillQuality: 0,
            ingredients: Array.isArray(options.ingredients) ? [...options.ingredients] : [],
            difficulty: recipeDef.difficulty,
            baseQuality: recipeDef.baseQuality,
            startedAt: Date.now(),
            completedAt: null,
            extracted: false,
            status: 'in_progress',
        };
        this.refinings.set(id, refining);
        this.stats.totalStarted++;
        this._triggerHook('refiningStarted', { refiningId: id, dreamId, recipe });
        return { success: true, refining };
    }

    getRefining(id) {
        const r = this.refinings.get(id);
        return r ? { ...r, ingredients: [...r.ingredients] } : null;
    }

    listRefinings() {
        return Array.from(this.refinings.values()).map(r => ({ ...r, ingredients: [...r.ingredients] }));
    }

    listByDream(dreamId) {
        return Array.from(this.refinings.values())
            .filter(r => r.dreamId === dreamId)
            .map(r => ({ ...r, ingredients: [...r.ingredients] }));
    }

    listByRecipe(recipe) {
        return Array.from(this.refinings.values())
            .filter(r => r.recipe === recipe)
            .map(r => ({ ...r, ingredients: [...r.ingredients] }));
    }

    listExtracted() {
        return Array.from(this.refinings.values())
            .filter(r => r.extracted)
            .map(r => ({ ...r, ingredients: [...r.ingredients] }));
    }

    listInProgress() {
        return Array.from(this.refinings.values())
            .filter(r => !r.extracted)
            .map(r => ({ ...r, ingredients: [...r.ingredients] }));
    }

    listTop(n = 5) {
        return [...this.listRefinings()].sort((a, b) => b.pillQuality - a.pillQuality).slice(0, n);
    }

    controlFlame(refiningId, intensity) {
        const r = this.refinings.get(refiningId);
        if (!r) return { success: false, error: 'REFINING_NOT_FOUND' };
        if (typeof intensity !== 'number' || intensity < 0) {
            return { success: false, error: 'INVALID_INTENSITY' };
        }
        const newLevel = intensity >= FLAME_LEVELS.length
            ? FLAME_LEVELS.length - 1
            : Math.floor(intensity);
        r.flameIntensity = newLevel;
        r.flameName = FLAME_LEVELS[newLevel];
        this._triggerHook('flameControlled', { refiningId, intensity: newLevel });
        return { success: true, flameIntensity: newLevel, flameName: r.flameName };
    }

    addIngredient(refiningId, ingredient) {
        const r = this.refinings.get(refiningId);
        if (!r) return { success: false, error: 'REFINING_NOT_FOUND' };
        if (r.extracted) return { success: false, error: 'ALREADY_EXTRACTED' };
        if (r.ingredients.length >= this.config.maxIngredients) {
            return { success: false, error: 'MAX_INGREDIENTS' };
        }
        const ingName = typeof ingredient === 'string' ? ingredient : (ingredient && ingredient.name) || 'unknown';
        r.ingredients.push(ingName);
        this._triggerHook('ingredientAdded', { refiningId, ingredient: ingName });
        return { success: true, count: r.ingredients.length };
    }

    tickProgress(refiningId) {
        const r = this.refinings.get(refiningId);
        if (!r) return { success: false, error: 'REFINING_NOT_FOUND' };
        if (r.extracted) return { success: false, error: 'ALREADY_EXTRACTED' };
        const before = r.refiningProgress;
        r.refiningProgress = Math.min(100, r.refiningProgress + this.config.progressPerTick);
        if (r.refiningProgress >= 100) {
            r.status = 'ready';
            r.completedAt = Date.now();
            this._computeQuality(r);
        }
        this._triggerHook('progressTicked', { refiningId, progress: r.refiningProgress });
        return { success: true, progress: r.refiningProgress, delta: r.refiningProgress - before };
    }

    _computeQuality(r) {
        const recipeDef = PILL_RECIPES[r.recipe];
        const required = recipeDef.requiredIngredients;
        const matched = required.filter(need => r.ingredients.includes(need)).length;
        const matchRatio = matched / required.length;
        const flameVal = FLAME_INTENSITY_VALUES[FLAME_LEVELS[r.flameIntensity]] || 0;
        const flameOptimal = Math.abs(flameVal - 0.5) < 0.4 ? 1 : 0.6;
        const difficulty = recipeDef.difficulty;
        const baseQuality = recipeDef.baseQuality;
        const raw = baseQuality + (1 - difficulty) * 0.3 * matchRatio * flameOptimal;
        r.pillQuality = Math.max(0, Math.min(1, raw));
    }

    classifyQuality(quality) {
        if (typeof quality !== 'number' || quality < 0) return 'poor';
        if (quality < QUALITY_THRESHOLDS.poor) return 'poor';
        if (quality < QUALITY_THRESHOLDS.common) return 'common';
        if (quality < QUALITY_THRESHOLDS.rare) return 'rare';
        return 'legendary';
    }

    extractPill(refiningId) {
        const r = this.refinings.get(refiningId);
        if (!r) return { success: false, error: 'REFINING_NOT_FOUND' };
        if (r.extracted) return { success: false, error: 'ALREADY_EXTRACTED' };
        if (r.refiningProgress < 100) return { success: false, error: 'NOT_READY' };
        r.extracted = true;
        r.status = 'extracted';
        r.completedAt = r.completedAt !== null ? r.completedAt : Date.now();
        this.stats.totalExtracted++;
        const tier = this.classifyQuality(r.pillQuality);
        this._triggerHook('pillExtracted', { refiningId, quality: r.pillQuality, tier });
        return {
            success: true,
            pill: {
                refiningId,
                dreamId: r.dreamId,
                recipe: r.recipe,
                recipeName: r.recipeName,
                quality: r.pillQuality,
                tier,
                ingredients: [...r.ingredients],
            },
        };
    }

    cancelRefining(refiningId) {
        const r = this.refinings.get(refiningId);
        if (!r) return { success: false, error: 'REFINING_NOT_FOUND' };
        if (r.extracted) return { success: false, error: 'ALREADY_EXTRACTED' };
        this.refinings.delete(refiningId);
        this._triggerHook('refiningCancelled', { refiningId });
        return { success: true };
    }

    deleteRefining(refiningId) {
        if (!this.refinings.has(refiningId)) return { success: false, error: 'REFINING_NOT_FOUND' };
        this.refinings.delete(refiningId);
        this._triggerHook('refiningDeleted', { refiningId });
        return { success: true };
    }

    calculateRefiningScore(refiningId) {
        const r = this.refinings.get(refiningId);
        if (!r) return 0;
        const recipeDef = PILL_RECIPES[r.recipe];
        const required = recipeDef.requiredIngredients;
        const matched = required.filter(need => r.ingredients.includes(need)).length;
        const matchBonus = (matched / required.length) * 50;
        return Math.floor(r.pillQuality * 100 + matchBonus + r.tier * 10);
    }

    getDreamProgress(dreamId) {
        const rs = this.listByDream(dreamId);
        if (rs.length === 0) return { dreamId, refiningCount: 0, avgQuality: 0, extracted: 0 };
        const totalQ = rs.reduce((s, r) => s + r.pillQuality, 0);
        const extracted = rs.filter(r => r.extracted).length;
        return {
            dreamId,
            refiningCount: rs.length,
            avgQuality: totalQ / rs.length,
            extracted,
        };
    }

    registerTool(name, handler) {
        this.tools.set(name, { name, handler });
    }

    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try {
            return { success: true, result: tool.handler(context !== undefined && context !== null ? context : {}) };
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
        if (this.stats.totalStarted < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            refinings: Array.from(this.refinings.entries()),
            stats: { ...this.stats },
            config: { ...this.config },
        };
    }

    fromJSON(data) {
        if (data.refinings) this.refinings = new Map(data.refinings);
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return { ...this.stats, refiningCount: this.refinings.size };
    }
}
