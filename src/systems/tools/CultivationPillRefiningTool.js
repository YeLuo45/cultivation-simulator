/**
 * CultivationPillRefiningTool.js - 修真丹药炼制工具
 * V919 P-20260613-093 Iteration 2/30 Round 36
 *
 * 修真工具链 (claude-code Toolchain 启发)：丹药炼制工具
 * - 核心 API: refinePill(prescriptionId, materials) / listPrescriptions() /
 *             upgradeCauldron(level) / getPillQuality(pillId) /
 *             consumePill(pillId) / discardPill(pillId)
 * - 数据结构: prescription = { id, name, rank, materials: [{name, qty}],
 *              outputPillId, effect, basePotency, baseDuration }
 *              pill = { id, prescriptionId, name, quality, potency, duration,
 *              effects: [], createdAt, consumed }
 * - 配置: PRESCRIPTIONS (8+), QUALITY_LEVELS (5: mortal/spirit/earth/heaven/immortal),
 *         MAX_PILLS (100), FURNACE_LEVELS (1-10), QUALITY_THRESHOLDS
 */

// ============================================================================
// Quality level definitions
// ============================================================================

export const QUALITY_MORTAL = 'mortal';
export const QUALITY_SPIRIT = 'spirit';
export const QUALITY_EARTH = 'earth';
export const QUALITY_HEAVEN = 'heaven';
export const QUALITY_IMMORTAL = 'immortal';

export const QUALITY_LEVELS = [
    QUALITY_MORTAL,
    QUALITY_SPIRIT,
    QUALITY_EARTH,
    QUALITY_HEAVEN,
    QUALITY_IMMORTAL,
];
export const QUALITY_LEVEL_KEYS = [...QUALITY_LEVELS];
export const QUALITY_LEVEL_COUNT = 5;

export const QUALITY_RANK = {
    [QUALITY_MORTAL]: 1,
    [QUALITY_SPIRIT]: 2,
    [QUALITY_EARTH]: 3,
    [QUALITY_HEAVEN]: 4,
    [QUALITY_IMMORTAL]: 5,
};

export const QUALITY_THRESHOLDS = {
    // score [0, 1) → quality bucket; cumulative ceiling
    [QUALITY_MORTAL]: 0.2,
    [QUALITY_SPIRIT]: 0.4,
    [QUALITY_EARTH]: 0.7,
    [QUALITY_HEAVEN]: 0.9,
    // [0.9, 1.0] → IMMORTAL
};

export const QUALITY_POTENCY_MULTIPLIER = {
    [QUALITY_MORTAL]: 0.6,
    [QUALITY_SPIRIT]: 0.85,
    [QUALITY_EARTH]: 1.0,
    [QUALITY_HEAVEN]: 1.3,
    [QUALITY_IMMORTAL]: 1.7,
};

// ============================================================================
// Materials database
// ============================================================================

export const HERB_MATERIALS = {
    spirit_grass: { name: '灵草', tier: 1, baseValue: 10 },
    blood_orchid: { name: '血兰', tier: 2, baseValue: 25 },
    jade_petal: { name: '玉瓣', tier: 2, baseValue: 22 },
    frost_lotus: { name: '霜莲', tier: 3, baseValue: 40 },
    flame_bloom: { name: '焰花', tier: 3, baseValue: 38 },
    thunder_root: { name: '雷根', tier: 3, baseValue: 42 },
    celestial_nectar: { name: '天酿', tier: 4, baseValue: 80 },
    dragon_saliva: { name: '龙涎', tier: 4, baseValue: 95 },
    phoenix_feather: { name: '凤羽', tier: 5, baseValue: 150 },
    nine_yang_flower: { name: '九阳花', tier: 5, baseValue: 180 },
    moonlit_mushroom: { name: '月华菇', tier: 2, baseValue: 20 },
    sunfire_resin: { name: '阳炎脂', tier: 2, baseValue: 24 },
};
export const HERB_MATERIAL_KEYS = Object.keys(HERB_MATERIALS);
export const HERB_MATERIAL_COUNT = 12;

// ============================================================================
// Prescription database (8+ entries)
// ============================================================================

export const PRESCRIPTIONS = {
    healing_pill: {
        id: 'healing_pill',
        name: '疗伤丹',
        rank: 1,
        requiredMaterials: ['spirit_grass', 'jade_petal'],
        outputPillId: 'pill_healing',
        effect: 'restore_health',
        basePotency: 30,
        baseDuration: 60000,
        effects: ['heal', 'cleanse'],
    },
    spirit_pill: {
        id: 'spirit_pill',
        name: '聚气丹',
        rank: 1,
        requiredMaterials: ['spirit_grass', 'moonlit_mushroom'],
        outputPillId: 'pill_spirit',
        effect: 'restore_qi',
        basePotency: 25,
        baseDuration: 90000,
        effects: ['qi_regen'],
    },
    blood_pill: {
        id: 'blood_pill',
        name: '补血丹',
        rank: 2,
        requiredMaterials: ['blood_orchid', 'jade_petal'],
        outputPillId: 'pill_blood',
        effect: 'restore_blood',
        basePotency: 50,
        baseDuration: 120000,
        effects: ['blood_regen', 'warmth'],
    },
    flame_pill: {
        id: 'flame_pill',
        name: '烈焰丹',
        rank: 2,
        requiredMaterials: ['flame_bloom', 'sunfire_resin'],
        outputPillId: 'pill_flame',
        effect: 'boost_fire',
        basePotency: 60,
        baseDuration: 45000,
        effects: ['fire_damage', 'burn'],
    },
    frost_pill: {
        id: 'frost_pill',
        name: '凝霜丹',
        rank: 2,
        requiredMaterials: ['frost_lotus', 'jade_petal'],
        outputPillId: 'pill_frost',
        effect: 'boost_ice',
        basePotency: 65,
        baseDuration: 50000,
        effects: ['ice_damage', 'chill'],
    },
    thunder_pill: {
        id: 'thunder_pill',
        name: '雷霆丹',
        rank: 3,
        requiredMaterials: ['thunder_root', 'blood_orchid'],
        outputPillId: 'pill_thunder',
        effect: 'boost_thunder',
        basePotency: 80,
        baseDuration: 40000,
        effects: ['thunder_damage', 'stun'],
    },
    celestial_pill: {
        id: 'celestial_pill',
        name: '天元丹',
        rank: 3,
        requiredMaterials: ['celestial_nectar', 'moonlit_mushroom'],
        outputPillId: 'pill_celestial',
        effect: 'breakthrough_aid',
        basePotency: 120,
        baseDuration: 180000,
        effects: ['breakthrough', 'purify'],
    },
    dragon_pill: {
        id: 'dragon_pill',
        name: '龙魄丹',
        rank: 4,
        requiredMaterials: ['dragon_saliva', 'flame_bloom'],
        outputPillId: 'pill_dragon',
        effect: 'dragon_empower',
        basePotency: 160,
        baseDuration: 240000,
        effects: ['dragon_power', 'fire_aura'],
    },
    phoenix_pill: {
        id: 'phoenix_pill',
        name: '凤魂丹',
        rank: 4,
        requiredMaterials: ['phoenix_feather', 'celestial_nectar'],
        outputPillId: 'pill_phoenix',
        effect: 'phoenix_rebirth',
        basePotency: 180,
        baseDuration: 300000,
        effects: ['rebirth', 'purify', 'fire_resist'],
    },
    nine_yang_pill: {
        id: 'nine_yang_pill',
        name: '九阳金丹',
        rank: 5,
        requiredMaterials: ['nine_yang_flower', 'dragon_saliva', 'phoenix_feather'],
        outputPillId: 'pill_nine_yang',
        effect: 'yang_empower',
        basePotency: 250,
        baseDuration: 600000,
        effects: ['yang_purify', 'yang_empower', 'yang_aura'],
    },
};
export const PRESCRIPTION_KEYS = Object.keys(PRESCRIPTIONS);
export const PRESCRIPTION_COUNT = 10;

// ============================================================================
// Furnace (cauldron) levels
// ============================================================================

export const FURNACE_LEVEL_MIN = 1;
export const FURNACE_LEVEL_MAX = 10;
export const FURNACE_LEVEL_DEFAULT = 1;
export const FURNACE_LEVELS = [];
for (let i = FURNACE_LEVEL_MIN; i <= FURNACE_LEVEL_MAX; i += 1) {
    FURNACE_LEVELS.push(i);
}
export const FURNACE_LEVEL_COUNT = FURNACE_LEVELS.length;

// Max rank unlocked at each furnace level
export const FURNACE_MAX_RANK = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
    7: 4,
    8: 4,
    9: 5,
    10: 5,
};

// ============================================================================
// Defaults / global limits
// ============================================================================

export const MAX_PILLS = 100;
export const DEFAULT_BASE_QUALITY_SCORE = 0.1;
export const MIN_QUALITY_SCORE = 0.0;
export const MAX_QUALITY_SCORE = 1.0;
export const POTENCY_MIN = 1;
export const DURATION_MIN = 1000;

// ============================================================================
// Error codes
// ============================================================================

export const ERROR_CODES = {
    INVALID_PRESCRIPTION_ID: 'INVALID_PRESCRIPTION_ID',
    INVALID_MATERIALS: 'INVALID_MATERIALS',
    INSUFFICIENT_MATERIALS: 'INSUFFICIENT_MATERIALS',
    UNKNOWN_MATERIAL: 'UNKNOWN_MATERIAL',
    INVENTORY_FULL: 'INVENTORY_FULL',
    FURNACE_LEVEL_TOO_LOW: 'FURNACE_LEVEL_TOO_LOW',
    INVALID_FURNACE_LEVEL: 'INVALID_FURNACE_LEVEL',
    FURNACE_LEVEL_SAME: 'FURNACE_LEVEL_SAME',
    FURNACE_LEVEL_HIGHER: 'FURNACE_LEVEL_HIGHER',
    PILL_NOT_FOUND: 'PILL_NOT_FOUND',
    PILL_ALREADY_CONSUMED: 'PILL_ALREADY_CONSUMED',
    INVALID_PILL_ID: 'INVALID_PILL_ID',
    INVALID_TOOL_NAME: 'INVALID_TOOL_NAME',
    INVALID_HANDLER: 'INVALID_HANDLER',
    UNKNOWN_TOOL: 'UNKNOWN_TOOL',
    TOOL_EXECUTION_ERROR: 'TOOL_EXECUTION_ERROR',
    INVALID_EVENT_NAME: 'INVALID_EVENT_NAME',
    EVENT_NOT_REGISTERED: 'EVENT_NOT_REGISTERED',
    HANDLER_NOT_FOUND: 'HANDLER_NOT_FOUND',
    INVALID_DATA: 'INVALID_DATA',
};

// ============================================================================
// Main class
// ============================================================================

export class CultivationPillRefiningTool {
    constructor(config = {}) {
        this.config = {
            maxPills: config.maxPills !== undefined ? config.maxPills : MAX_PILLS,
            furnaceLevel:
                config.furnaceLevel !== undefined
                    ? config.furnaceLevel
                    : FURNACE_LEVEL_DEFAULT,
            defaultBaseQualityScore:
                config.defaultBaseQualityScore !== undefined
                    ? config.defaultBaseQualityScore
                    : DEFAULT_BASE_QUALITY_SCORE,
            ...config,
        };
        // ensure furnaceLevel in bounds
        if (this.config.furnaceLevel < FURNACE_LEVEL_MIN) {
            this.config.furnaceLevel = FURNACE_LEVEL_MIN;
        }
        if (this.config.furnaceLevel > FURNACE_LEVEL_MAX) {
            this.config.furnaceLevel = FURNACE_LEVEL_MAX;
        }

        this.pills = new Map();
        this.prescriptions = new Map();
        for (const k of PRESCRIPTION_KEYS) {
            this.prescriptions.set(k, PRESCRIPTIONS[k]);
        }
        this.tools = new Map();
        this.hooks = new Map();

        this.stats = {
            totalRefined: 0,
            totalConsumed: 0,
            totalDiscarded: 0,
            totalUpgrades: 0,
            evolutionCount: 0,
            byQuality: {
                [QUALITY_MORTAL]: 0,
                [QUALITY_SPIRIT]: 0,
                [QUALITY_EARTH]: 0,
                [QUALITY_HEAVEN]: 0,
                [QUALITY_IMMORTAL]: 0,
            },
            byRank: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
            },
        };

        this._registerDefaultTools();
    }

    // ------------------------------------------------------------------------
    // Internal helpers
    // ------------------------------------------------------------------------

    _registerDefaultTools() {
        this.registerTool('refine', (ctx) =>
            this.refinePill(ctx.prescriptionId, ctx.materials, ctx.options),
        );
        this.registerTool('consume', (ctx) => this.consumePill(ctx.pillId));
        this.registerTool('discard', (ctx) => this.discardPill(ctx.pillId));
        this.registerTool('upgrade', (ctx) => this.upgradeCauldron(ctx.level));
        this.registerTool('listPrescriptions', (ctx) =>
            this.listPrescriptions(ctx && ctx.rank !== undefined ? ctx.rank : undefined),
        );
        this.registerTool('listAll', () => this.listAllPills());
    }

    _genId(prefix = 'pill') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _now() {
        return Date.now();
    }

    _validateMaterials(materials) {
        if (!Array.isArray(materials)) return false;
        if (materials.length === 0) return false;
        for (const m of materials) {
            if (
                !m ||
                typeof m !== 'object' ||
                typeof m.name !== 'string' ||
                m.name.length === 0 ||
                typeof m.qty !== 'number' ||
                m.qty <= 0 ||
                !Number.isFinite(m.qty)
            ) {
                return false;
            }
        }
        return true;
    }

    _consolidateMaterials(materials) {
        const map = new Map();
        for (const m of materials) {
            if (map.has(m.name)) {
                map.set(m.name, map.get(m.name) + m.qty);
            } else {
                map.set(m.name, m.qty);
            }
        }
        return Array.from(map.entries()).map(([name, qty]) => ({ name, qty }));
    }

    _checkMaterialsSufficient(materials, requiredMaterials) {
        const provided = new Map();
        for (const m of materials) {
            if (provided.has(m.name)) {
                provided.set(m.name, provided.get(m.name) + m.qty);
            } else {
                provided.set(m.name, m.qty);
            }
        }
        for (const req of requiredMaterials) {
            if (!provided.has(req) || provided.get(req) < 1) {
                return false;
            }
        }
        return true;
    }

    _computeQualityScore(materials, furnaceLevel) {
        let score = this.config.defaultBaseQualityScore;
        for (const m of materials) {
            const def = HERB_MATERIALS[m.name];
            if (def) {
                // higher tier → larger bonus; clamp to [0, 1]
                const bonus = (def.tier * def.baseValue * m.qty) / 1000;
                score += Math.min(1, bonus);
            }
        }
        // furnace bonus: +0.05 per level above 1, capped at +0.3
        const furnaceBonus = Math.min(0.3, (furnaceLevel - 1) * 0.05);
        score += furnaceBonus;
        // clamp to [0, 1]
        return Math.max(MIN_QUALITY_SCORE, Math.min(MAX_QUALITY_SCORE, score));
    }

    _scoreToQuality(score) {
        if (score < QUALITY_THRESHOLDS[QUALITY_MORTAL]) return QUALITY_MORTAL;
        if (score < QUALITY_THRESHOLDS[QUALITY_SPIRIT]) return QUALITY_SPIRIT;
        if (score < QUALITY_THRESHOLDS[QUALITY_EARTH]) return QUALITY_EARTH;
        if (score < QUALITY_THRESHOLDS[QUALITY_HEAVEN]) return QUALITY_HEAVEN;
        return QUALITY_IMMORTAL;
    }

    _getMaxRankForFurnace(level) {
        const capped = Math.max(
            FURNACE_LEVEL_MIN,
            Math.min(FURNACE_LEVEL_MAX, level),
        );
        return FURNACE_MAX_RANK[capped];
    }

    _clonePill(pill) {
        return {
            ...pill,
            effects: [...pill.effects],
        };
    }

    // ------------------------------------------------------------------------
    // Public API: prescriptions
    // ------------------------------------------------------------------------

    listPrescriptions(rank) {
        if (rank !== undefined) {
            return PRESCRIPTION_KEYS
                .filter((k) => PRESCRIPTIONS[k].rank === rank)
                .map((k) => ({ ...PRESCRIPTIONS[k], materials: undefined }));
        }
        return PRESCRIPTION_KEYS.map((k) => ({ ...PRESCRIPTIONS[k] }));
    }

    getPrescription(prescriptionId) {
        if (!this.prescriptions.has(prescriptionId)) return null;
        const p = this.prescriptions.get(prescriptionId);
        return { ...p };
    }

    // ------------------------------------------------------------------------
    // Public API: refine
    // ------------------------------------------------------------------------

    refinePill(prescriptionId, materials, options = {}) {
        if (!this.prescriptions.has(prescriptionId)) {
            return { success: false, error: ERROR_CODES.INVALID_PRESCRIPTION_ID };
        }
        if (!this._validateMaterials(materials)) {
            return { success: false, error: ERROR_CODES.INVALID_MATERIALS };
        }

        const prescription = this.prescriptions.get(prescriptionId);

        // Validate all materials are known
        for (const m of materials) {
            if (!HERB_MATERIALS[m.name]) {
                return { success: false, error: ERROR_CODES.UNKNOWN_MATERIAL };
            }
        }

        // Validate required materials sufficiency
        if (
            !this._checkMaterialsSufficient(materials, prescription.requiredMaterials)
        ) {
            return { success: false, error: ERROR_CODES.INSUFFICIENT_MATERIALS };
        }

        // Validate furnace rank gate
        const maxRank = this._getMaxRankForFurnace(this.config.furnaceLevel);
        if (prescription.rank > maxRank) {
            return { success: false, error: ERROR_CODES.FURNACE_LEVEL_TOO_LOW };
        }

        // Inventory full?
        if (this.pills.size >= this.config.maxPills) {
            return { success: false, error: ERROR_CODES.INVENTORY_FULL };
        }

        // Compute quality
        const consolidated = this._consolidateMaterials(materials);
        const score = this._computeQualityScore(consolidated, this.config.furnaceLevel);
        const quality = this._scoreToQuality(score);
        const multiplier = QUALITY_POTENCY_MULTIPLIER[quality];

        // Override multipliers if provided in options
        const potencyMultiplier = options.potencyMultiplier !== undefined
            ? options.potencyMultiplier
            : multiplier;
        const durationMultiplier = options.durationMultiplier !== undefined
            ? options.durationMultiplier
            : multiplier;

        const potency = Math.max(
            POTENCY_MIN,
            Math.round(prescription.basePotency * potencyMultiplier),
        );
        const duration = Math.max(
            DURATION_MIN,
            Math.round(prescription.baseDuration * durationMultiplier),
        );

        const id = this._genId('pill');
        const pill = {
            id,
            prescriptionId,
            name: prescription.name,
            quality,
            potency,
            duration,
            effects: [...prescription.effects],
            createdAt: this._now(),
            consumed: false,
        };

        this.pills.set(id, pill);

        this.stats.totalRefined += 1;
        this.stats.byQuality[quality] =
            (this.stats.byQuality[quality] || 0) + 1;
        this.stats.byRank[prescription.rank] =
            (this.stats.byRank[prescription.rank] || 0) + 1;

        this._triggerHook('onRefine', { pill, prescription });

        return { success: true, pill, quality, score };
    }

    // ------------------------------------------------------------------------
    // Public API: get / list pills
    // ------------------------------------------------------------------------

    getPillQuality(pillId) {
        if (typeof pillId !== 'string' || pillId.length === 0) {
            return { success: false, error: ERROR_CODES.INVALID_PILL_ID };
        }
        if (!this.pills.has(pillId)) {
            return { success: false, error: ERROR_CODES.PILL_NOT_FOUND };
        }
        const pill = this.pills.get(pillId);
        return {
            success: true,
            pillId,
            quality: pill.quality,
            potency: pill.potency,
            duration: pill.duration,
            rank: QUALITY_RANK[pill.quality],
        };
    }

    listAllPills() {
        return Array.from(this.pills.values()).map((p) => this._clonePill(p));
    }

    listByQuality(quality) {
        if (!QUALITY_LEVEL_KEYS.includes(quality)) return [];
        return Array.from(this.pills.values())
            .filter((p) => p.quality === quality)
            .map((p) => this._clonePill(p));
    }

    listByRank(rank) {
        if (typeof rank !== 'number' || !Number.isFinite(rank)) return [];
        return Array.from(this.pills.values())
            .filter((p) => p.prescriptionId && PRESCRIPTIONS[p.prescriptionId]
                && PRESCRIPTIONS[p.prescriptionId].rank === rank)
            .map((p) => this._clonePill(p));
    }

    // ------------------------------------------------------------------------
    // Public API: consume / discard
    // ------------------------------------------------------------------------

    consumePill(pillId) {
        if (typeof pillId !== 'string' || pillId.length === 0) {
            return { success: false, error: ERROR_CODES.INVALID_PILL_ID };
        }
        if (!this.pills.has(pillId)) {
            return { success: false, error: ERROR_CODES.PILL_NOT_FOUND };
        }
        const pill = this.pills.get(pillId);
        if (pill.consumed) {
            return { success: false, error: ERROR_CODES.PILL_ALREADY_CONSUMED };
        }
        pill.consumed = true;
        pill.consumedAt = this._now();
        this.stats.totalConsumed += 1;
        this._triggerHook('onConsume', { pill });
        return { success: true, pill: this._clonePill(pill) };
    }

    discardPill(pillId) {
        if (typeof pillId !== 'string' || pillId.length === 0) {
            return { success: false, error: ERROR_CODES.INVALID_PILL_ID };
        }
        if (!this.pills.has(pillId)) {
            return { success: false, error: ERROR_CODES.PILL_NOT_FOUND };
        }
        const pill = this.pills.get(pillId);
        if (pill.consumed) {
            return { success: false, error: ERROR_CODES.PILL_ALREADY_CONSUMED };
        }
        this.pills.delete(pillId);
        this.stats.totalDiscarded += 1;
        this._triggerHook('onDiscard', { pillId });
        return { success: true, pillId };
    }

    // ------------------------------------------------------------------------
    // Public API: upgrade cauldron
    // ------------------------------------------------------------------------

    upgradeCauldron(level) {
        if (typeof level !== 'number' || !Number.isFinite(level)) {
            return { success: false, error: ERROR_CODES.INVALID_FURNACE_LEVEL };
        }
        if (level < FURNACE_LEVEL_MIN || level > FURNACE_LEVEL_MAX) {
            return { success: false, error: ERROR_CODES.INVALID_FURNACE_LEVEL };
        }
        if (level === this.config.furnaceLevel) {
            return { success: false, error: ERROR_CODES.FURNACE_LEVEL_SAME };
        }
        if (level < this.config.furnaceLevel) {
            return { success: false, error: ERROR_CODES.FURNACE_LEVEL_HIGHER };
        }
        const prev = this.config.furnaceLevel;
        this.config.furnaceLevel = level;
        this.stats.totalUpgrades += 1;
        this._triggerHook('onUpgrade', { prev, next: level });
        return {
            success: true,
            prev,
            next: level,
            maxRank: this._getMaxRankForFurnace(level),
        };
    }

    getFurnaceStats() {
        return {
            level: this.config.furnaceLevel,
            maxRank: this._getMaxRankForFurnace(this.config.furnaceLevel),
            totalUpgrades: this.stats.totalUpgrades,
        };
    }

    // ------------------------------------------------------------------------
    // Tool registry
    // ------------------------------------------------------------------------

    registerTool(name, handler) {
        if (typeof name !== 'string' || name.length === 0) {
            return { success: false, error: ERROR_CODES.INVALID_TOOL_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: ERROR_CODES.INVALID_HANDLER };
        }
        this.tools.set(name, handler);
        return { success: true };
    }

    executeTool(name, context) {
        if (!this.tools.has(name)) {
            return { success: false, error: ERROR_CODES.UNKNOWN_TOOL };
        }
        const handler = this.tools.get(name);
        const ctx = context !== undefined && context !== null ? context : {};
        try {
            const result = handler(ctx);
            return { success: true, result };
        } catch (e) {
            return {
                success: false,
                error: ERROR_CODES.TOOL_EXECUTION_ERROR,
                message: e.message,
            };
        }
    }

    // ------------------------------------------------------------------------
    // Hooks
    // ------------------------------------------------------------------------

    registerHook(event, handler) {
        if (typeof event !== 'string' || event.length === 0) {
            return { success: false, error: ERROR_CODES.INVALID_EVENT_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: ERROR_CODES.INVALID_HANDLER };
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
        if (!this.hooks.has(event)) {
            return { success: false, error: ERROR_CODES.EVENT_NOT_REGISTERED };
        }
        const handlers = this.hooks.get(event);
        const idx = handlers.indexOf(handler);
        if (idx === -1) {
            return { success: false, error: ERROR_CODES.HANDLER_NOT_FOUND };
        }
        handlers.splice(idx, 1);
        return { success: true };
    }

    // ------------------------------------------------------------------------
    // Serialization / stats / evolution / reset
    // ------------------------------------------------------------------------

    toJSON() {
        return {
            config: { ...this.config },
            pills: Array.from(this.pills.entries()),
            stats: { ...this.stats },
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') {
            return { success: false, error: ERROR_CODES.INVALID_DATA };
        }
        if (data.config) {
            this.config = { ...this.config, ...data.config };
            if (this.config.furnaceLevel < FURNACE_LEVEL_MIN) {
                this.config.furnaceLevel = FURNACE_LEVEL_MIN;
            }
            if (this.config.furnaceLevel > FURNACE_LEVEL_MAX) {
                this.config.furnaceLevel = FURNACE_LEVEL_MAX;
            }
        }
        if (data.pills && Array.isArray(data.pills)) {
            this.pills = new Map(data.pills);
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalPills: this.pills.size,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { stats: this.stats });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.pills.clear();
        this.hooks.clear();
        this.config.furnaceLevel = FURNACE_LEVEL_DEFAULT;
        this.stats = {
            totalRefined: 0,
            totalConsumed: 0,
            totalDiscarded: 0,
            totalUpgrades: 0,
            evolutionCount: 0,
            byQuality: {
                [QUALITY_MORTAL]: 0,
                [QUALITY_SPIRIT]: 0,
                [QUALITY_EARTH]: 0,
                [QUALITY_HEAVEN]: 0,
                [QUALITY_IMMORTAL]: 0,
            },
            byRank: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
            },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}
