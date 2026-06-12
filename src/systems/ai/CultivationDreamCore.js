/**
 * CultivationDreamCore.js - 修真梦境核心引擎
 * V858 P-20260613-001 Iteration 1/30 Round 34
 *
 * 修真梦境系统：梦中证道全链路核心
 * - 核心 API: enterDream / exitDream / getDreamStats
 * - 数据结构: { id, playerId, type, quality, duration, insights, enteredAt, exitedAt, outcome }
 * - 配置: DREAM_TYPES, QUALITY_THRESHOLDS
 */

export const DREAM_TYPES = {
    meditation: {
        name: '冥想梦境',
        category: 'cultivation',
        baseDuration: 60000,
        baseQuality: 'common',
        insightChance: 0.4,
    },
    pill: {
        name: '炼丹梦境',
        category: 'craft',
        baseDuration: 90000,
        baseQuality: 'common',
        insightChance: 0.3,
    },
    sword: {
        name: '练剑梦境',
        category: 'combat',
        baseDuration: 75000,
        baseQuality: 'common',
        insightChance: 0.35,
    },
    formation: {
        name: '阵法梦境',
        category: 'tactic',
        baseDuration: 120000,
        baseQuality: 'common',
        insightChance: 0.25,
    },
    dao: {
        name: '悟道梦境',
        category: 'cultivation',
        baseDuration: 180000,
        baseQuality: 'rare',
        insightChance: 0.6,
    },
};

export const DREAM_TYPE_KEYS = Object.keys(DREAM_TYPES);

export const QUALITY_THRESHOLDS = {
    common: 0,
    rare: 70,
    legendary: 90,
    mythic: 99,
};

export const QUALITY_TIERS = ['common', 'rare', 'legendary', 'mythic'];

export const MAX_INSIGHTS_PER_DREAM = 10;
export const DEFAULT_MAX_DREAMS_PER_PLAYER = 100;

export class CultivationDreamCore {
    constructor(config = {}) {
        this.config = {
            maxDreamsPerPlayer: config.maxDreamsPerPlayer !== undefined ? config.maxDreamsPerPlayer : DEFAULT_MAX_DREAMS_PER_PLAYER,
            maxInsightsPerDream: config.maxInsightsPerDream !== undefined ? config.maxInsightsPerDream : MAX_INSIGHTS_PER_DREAM,
            autoClassify: config.autoClassify !== undefined ? config.autoClassify : true,
            defaultQuality: config.defaultQuality !== undefined ? config.defaultQuality : 'common',
            ...config,
        };
        this.dreams = new Map();
        this.playerDreams = new Map();
        this.activeDreams = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalEntered: 0,
            totalExited: 0,
            totalInsights: 0,
            evolutionCount: 0,
            byQuality: { common: 0, rare: 0, legendary: 0, mythic: 0 },
            byType: { meditation: 0, pill: 0, sword: 0, formation: 0, dao: 0 },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDream', (ctx) => this.getDream(ctx.dreamId));
        this.registerTool('listByPlayer', (ctx) => this.listByPlayer(ctx.playerId));
        this.registerTool('listActive', () => this.listActive());
        this.registerTool('getDreamStats', (ctx) => this.getDreamStats(ctx.playerId));
    }

    _genId() {
        return `dream_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _classifyQuality(score) {
        if (score >= QUALITY_THRESHOLDS.mythic) return 'mythic';
        if (score >= QUALITY_THRESHOLDS.legendary) return 'legendary';
        if (score >= QUALITY_THRESHOLDS.rare) return 'rare';
        return 'common';
    }

    enterDream(playerId, type, options = {}) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: 'INVALID_PLAYER_ID' };
        }
        if (!DREAM_TYPES[type]) {
            return { success: false, error: 'UNKNOWN_DREAM_TYPE' };
        }
        const dreamType = DREAM_TYPES[type];

        // Check if player has too many active dreams
        const activeCount = this._countActiveByPlayer(playerId);
        if (activeCount >= 5) {
            return { success: false, error: 'TOO_MANY_ACTIVE_DREAMS' };
        }

        const dreamId = this._genId();
        const enteredAt = Date.now();
        const dream = {
            id: dreamId,
            playerId,
            type,
            quality: dreamType.baseQuality,
            duration: options.duration !== undefined ? options.duration : dreamType.baseDuration,
            insights: [],
            enteredAt,
            exitedAt: null,
            outcome: null,
            intensity: options.intensity !== undefined ? options.intensity : 1.0,
        };

        this.dreams.set(dreamId, dream);
        this.activeDreams.set(dreamId, dream);

        if (!this.playerDreams.has(playerId)) {
            this.playerDreams.set(playerId, []);
        }
        this.playerDreams.get(playerId).push(dreamId);

        // Trim player dreams if exceeding max
        const playerDreamList = this.playerDreams.get(playerId);
        if (playerDreamList.length > this.config.maxDreamsPerPlayer) {
            const removed = playerDreamList.shift();
            if (removed && this.dreams.has(removed)) {
                const removedDream = this.dreams.get(removed);
                if (!removedDream.exitedAt) {
                    this.activeDreams.delete(removed);
                }
                this.dreams.delete(removed);
            }
        }

        this.stats.totalEntered += 1;
        this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;

        this._triggerHook('onDreamEnter', { dream });
        return { success: true, dream };
    }

    exitDream(dreamId, outcome = {}) {
        if (typeof dreamId !== 'string' || dreamId.length === 0) {
            return { success: false, error: 'INVALID_DREAM_ID' };
        }
        if (!this.dreams.has(dreamId)) {
            return { success: false, error: 'DREAM_NOT_FOUND' };
        }
        const dream = this.dreams.get(dreamId);
        if (dream.exitedAt !== null) {
            return { success: false, error: 'DREAM_ALREADY_EXITED' };
        }

        dream.exitedAt = Date.now();
        dream.outcome = outcome;

        // Auto-classify quality based on outcome score
        let qualityChanged = false;
        if (this.config.autoClassify && outcome.score !== undefined) {
            const newQuality = this._classifyQuality(outcome.score);
            const oldQuality = dream.quality;
            if (newQuality !== oldQuality) {
                dream.quality = newQuality;
                qualityChanged = true;
            }
        }

        // Count final quality once
        if (!qualityChanged) {
            this.stats.byQuality[dream.quality] = (this.stats.byQuality[dream.quality] || 0) + 1;
        } else {
            // Was already incremented by enterDream initial quality? No - we don't increment on enter.
            // So on upgrade, increment new quality once.
            this.stats.byQuality[dream.quality] = (this.stats.byQuality[dream.quality] || 0) + 1;
        }

        // Add insights from outcome
        if (outcome.insights && Array.isArray(outcome.insights)) {
            const newInsights = outcome.insights.slice(0, this.config.maxInsightsPerDream - dream.insights.length);
            for (const insight of newInsights) {
                if (dream.insights.length < this.config.maxInsightsPerDream) {
                    dream.insights.push(insight);
                    this.stats.totalInsights += 1;
                }
            }
        }

        this.activeDreams.delete(dreamId);
        this.stats.totalExited += 1;

        this._triggerHook('onDreamExit', { dream });
        return { success: true, dream };
    }

    getDream(dreamId) {
        if (!this.dreams.has(dreamId)) return null;
        const dream = this.dreams.get(dreamId);
        return { ...dream, insights: [...dream.insights] };
    }

    listByPlayer(playerId) {
        if (!this.playerDreams.has(playerId)) return [];
        const ids = this.playerDreams.get(playerId);
        return ids.map(id => this.dreams.get(id)).filter(d => d !== undefined);
    }

    listByType(type) {
        if (!DREAM_TYPES[type]) return [];
        return Array.from(this.dreams.values()).filter(d => d.type === type);
    }

    listByQuality(quality) {
        if (!QUALITY_TIERS.includes(quality)) return [];
        return Array.from(this.dreams.values()).filter(d => d.quality === quality);
    }

    listActive() {
        return Array.from(this.activeDreams.values()).map(d => ({ ...d }));
    }

    listActiveByPlayer(playerId) {
        return this.listActive().filter(d => d.playerId === playerId);
    }

    _countActiveByPlayer(playerId) {
        return this.listActiveByPlayer(playerId).length;
    }

    getDreamStats(playerId) {
        const playerDreams = this.listByPlayer(playerId);
        const exited = playerDreams.filter(d => d.exitedAt !== null);
        const active = playerDreams.filter(d => d.exitedAt === null);
        const totalDuration = exited.reduce((sum, d) => sum + (d.exitedAt - d.enteredAt), 0);
        const avgDuration = exited.length > 0 ? totalDuration / exited.length : 0;
        const totalInsights = playerDreams.reduce((sum, d) => sum + d.insights.length, 0);

        const qualityDistribution = { common: 0, rare: 0, legendary: 0, mythic: 0 };
        for (const d of playerDreams) {
            qualityDistribution[d.quality] = (qualityDistribution[d.quality] || 0) + 1;
        }

        return {
            playerId,
            totalDreams: playerDreams.length,
            exitedCount: exited.length,
            activeCount: active.length,
            avgDuration,
            totalInsights,
            qualityDistribution,
        };
    }

    registerTool(name, handler) {
        if (typeof name !== 'string' || name.length === 0) {
            return { success: false, error: 'INVALID_TOOL_NAME' };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: 'INVALID_HANDLER' };
        }
        this.tools.set(name, handler);
        return { success: true };
    }

    executeTool(name, context) {
        if (!this.tools.has(name)) {
            return { success: false, error: 'UNKNOWN_TOOL' };
        }
        const handler = this.tools.get(name);
        const ctx = (context !== undefined && context !== null) ? context : {};
        try {
            const result = handler(ctx);
            return { success: true, result };
        } catch (e) {
            return { success: false, error: 'TOOL_EXECUTION_ERROR', message: e.message };
        }
    }

    registerHook(event, handler) {
        if (typeof event !== 'string' || event.length === 0) {
            return { success: false, error: 'INVALID_EVENT_NAME' };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: 'INVALID_HANDLER' };
        }
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(handler);
        return { success: true };
    }

    _triggerHook(event, data) {
        if (!this.hooks.has(event)) return;
        for (const handler of this.hooks.get(event)) {
            try {
                handler(data);
            } catch (e) {
                // silent error handling
            }
        }
    }

    unregisterHook(event, handler) {
        if (!this.hooks.has(event)) return { success: false, error: 'EVENT_NOT_FOUND' };
        const handlers = this.hooks.get(event);
        const idx = handlers.indexOf(handler);
        if (idx === -1) return { success: false, error: 'HANDLER_NOT_FOUND' };
        handlers.splice(idx, 1);
        return { success: true };
    }

    deleteDream(dreamId) {
        if (!this.dreams.has(dreamId)) return { success: false, error: 'DREAM_NOT_FOUND' };
        const dream = this.dreams.get(dreamId);
        const playerId = dream.playerId;
        if (this.playerDreams.has(playerId)) {
            const list = this.playerDreams.get(playerId);
            const idx = list.indexOf(dreamId);
            if (idx !== -1) list.splice(idx, 1);
        }
        this.activeDreams.delete(dreamId);
        this.dreams.delete(dreamId);
        return { success: true };
    }

    toJSON() {
        return {
            config: this.config,
            dreams: Array.from(this.dreams.entries()),
            playerDreams: Array.from(this.playerDreams.entries()),
            stats: this.stats,
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: 'INVALID_DATA' };
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.dreams && Array.isArray(data.dreams)) {
            this.dreams = new Map(data.dreams);
            this.activeDreams = new Map();
            for (const [id, dream] of this.dreams.entries()) {
                if (dream.exitedAt === null) this.activeDreams.set(id, dream);
            }
        }
        if (data.playerDreams && Array.isArray(data.playerDreams)) {
            this.playerDreams = new Map(data.playerDreams);
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalDreams: this.dreams.size,
            activeDreams: this.activeDreams.size,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { stats: this.stats });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.dreams.clear();
        this.playerDreams.clear();
        this.activeDreams.clear();
        this.hooks.clear();
        this.stats = {
            totalEntered: 0,
            totalExited: 0,
            totalInsights: 0,
            evolutionCount: 0,
            byQuality: { common: 0, rare: 0, legendary: 0, mythic: 0 },
            byType: { meditation: 0, pill: 0, sword: 0, formation: 0, dao: 0 },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}