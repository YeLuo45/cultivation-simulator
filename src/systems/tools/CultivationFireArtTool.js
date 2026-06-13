/**
 * CultivationFireArtTool.js - 火系术法工具
 * V929 P-20260613-103 Iteration 12/30 Round 36
 *
 * 修真 claude-code 6 工具 + ToolRegistry 范式 (法术选择/引导/释放/反噬)
 * - 核心 API: castFireArt / igniteTarget / burnArea / flameShield
 * - 数据结构: { id, artName, element ('fire'), manaCost, power, cooldown, targetType ('enemy'|'area'|'self'), castTime, effects: [] }
 * - 配置: FIRE_ARTS (5), ELEMENTAL_AFFINITIES (5), MAX_COOLDOWN (10), CRIT_MULTIPLIER (1.5)
 */

export const MAX_COOLDOWN = 10;
export const CRIT_MULTIPLIER = 1.5;
export const FIRE_ARTS = ['flame_bolt', 'fire_ball', 'meteor', 'wildfire', 'phoenix_rebirth'];
export const FIRE_ARTS_COUNT = 5;
export const ELEMENT_FIRE = 'fire';

export const TARGET_TYPE_ENEMY = 'enemy';
export const TARGET_TYPE_AREA = 'area';
export const TARGET_TYPE_SELF = 'self';
export const TARGET_TYPES = [TARGET_TYPE_ENEMY, TARGET_TYPE_AREA, TARGET_TYPE_SELF];
export const TARGET_TYPE_COUNT = 3;

export const ART_STATE_READY = 'ready';
export const ART_STATE_COOLDOWN = 'cooldown';
export const ART_STATE_ACTIVE = 'active';
export const ART_STATE_EXPIRED = 'expired';
export const ART_STATES = [ART_STATE_READY, ART_STATE_COOLDOWN, ART_STATE_ACTIVE, ART_STATE_EXPIRED];
export const ART_STATE_COUNT = 4;

export const ELEMENTAL_AFFINITIES = ['ice', 'fire', 'water', 'wind', 'earth'];
export const ELEMENTAL_AFFINITY_COUNT = 5;

export const AFFINITY_BONUS = {
    ice: 0.5,
    fire: 1.5,
    water: 1.0,
    wind: 1.0,
    earth: 1.0,
};

export const DEFAULT_MANA = 100;
export const DEFAULT_SHIELD_DURATION = 30000;
export const MAX_BURN_STACKS = 10;
export const MAX_BURN_RADIUS = 50;
export const MIN_CAST_TIME = 100;
export const CRIT_CHANCE = 0.15;

export const ART_DEFINITIONS = {
    flame_bolt: {
        name: '烈焰箭',
        manaCost: 10,
        power: 25,
        cooldown: 1,
        targetType: TARGET_TYPE_ENEMY,
        castTime: 300,
        effects: ['burn', 'damage'],
    },
    fire_ball: {
        name: '火球术',
        manaCost: 20,
        power: 40,
        cooldown: 3,
        targetType: TARGET_TYPE_ENEMY,
        castTime: 600,
        effects: ['damage', 'burn'],
    },
    wildfire: {
        name: '野火燎原',
        manaCost: 30,
        power: 55,
        cooldown: 4,
        targetType: TARGET_TYPE_ENEMY,
        castTime: 1200,
        effects: ['burn', 'damage', 'immolate'],
    },
    meteor: {
        name: '陨石天降',
        manaCost: 60,
        power: 90,
        cooldown: 8,
        targetType: TARGET_TYPE_AREA,
        castTime: 2400,
        effects: ['damage', 'burn', 'stun'],
    },
    phoenix_rebirth: {
        name: '凤凰涅槃',
        manaCost: 100,
        power: 250,
        cooldown: 10,
        targetType: TARGET_TYPE_SELF,
        castTime: 5000,
        effects: ['damage', 'immolate', 'stun'],
    },
};

export const ERROR_CODES = {
    INVALID_ART_NAME: 'INVALID_ART_NAME',
    INVALID_TARGET: 'INVALID_TARGET',
    INVALID_CASTER: 'INVALID_CASTER',
    INVALID_RADIUS: 'INVALID_RADIUS',
    INVALID_DURATION: 'INVALID_DURATION',
    INVALID_INTENSITY: 'INVALID_INTENSITY',
    INSUFFICIENT_MANA: 'INSUFFICIENT_MANA',
    ON_COOLDOWN: 'ON_COOLDOWN',
    UNKNOWN_ART: 'UNKNOWN_ART',
    INVALID_AFFINITY: 'INVALID_AFFINITY',
};

export class CultivationFireArtTool {
    constructor(config = {}) {
        this.config = {
            maxCooldown: config.maxCooldown !== undefined ? config.maxCooldown : MAX_COOLDOWN,
            critMultiplier: config.critMultiplier !== undefined ? config.critMultiplier : CRIT_MULTIPLIER,
            defaultMana: config.defaultMana !== undefined ? config.defaultMana : DEFAULT_MANA,
            defaultShieldDuration: config.defaultShieldDuration !== undefined ? config.defaultShieldDuration : DEFAULT_SHIELD_DURATION,
            critChance: config.critChance !== undefined ? config.critChance : CRIT_CHANCE,
            autoManaRegen: config.autoManaRegen !== undefined ? config.autoManaRegen : false,
            ...config,
        };
        this.arts = new Map();
        this.casters = new Map();
        this.cooldowns = new Map();
        this.shields = new Map();
        this.burnStacks = new Map();
        this.castHistory = new Map();
        this.activeEffects = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalCasts: 0,
            totalCrits: 0,
            totalShieldsCreated: 0,
            totalShieldValue: 0,
            totalBurnApplications: 0,
            totalBurnAreaHits: 0,
            totalManaSpent: 0,
            byArt: {
                flame_bolt: 0,
                fire_ball: 0,
                wildfire: 0,
                meteor: 0,
                phoenix_rebirth: 0,
            },
            byTargetType: {
                enemy: 0,
                area: 0,
                self: 0,
            },
            evolutionCount: 0,
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('castFireArt', (ctx) => this.castFireArt(ctx.artName, ctx.target, ctx.options ?? {}));
        this.registerTool('igniteTarget', (ctx) => this.igniteTarget(ctx.target, ctx.intensity ?? 1));
        this.registerTool('burnArea', (ctx) => this.burnArea(ctx.center, ctx.radius ?? 5));
        this.registerTool('flameShield', (ctx) => this.flameShield(ctx.caster, ctx.duration ?? this.config.defaultShieldDuration));
        this.registerTool('listArts', () => this.listArts());
        this.registerTool('getStats', () => this.getStats());
    }

    _genId() {
        return `fireart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _now() {
        return Date.now();
    }

    _validateArtName(artName) {
        return typeof artName === 'string' && FIRE_ARTS.includes(artName);
    }

    _validateTarget(target) {
        if (target === null || target === undefined) return false;
        if (typeof target === 'string') return target.length > 0;
        if (typeof target === 'object' && target.id !== undefined) return true;
        return false;
    }

    _validateCaster(caster) {
        if (caster === null || caster === undefined) return false;
        if (typeof caster === 'string') return caster.length > 0;
        if (typeof caster === 'object' && caster.id !== undefined) return true;
        return false;
    }

    _getCasterId(caster) {
        if (typeof caster === 'string') return caster;
        return caster.id;
    }

    _getTargetId(target) {
        if (typeof target === 'string') return target;
        return target.id;
    }

    _getMana(caster) {
        const casterId = this._getCasterId(caster);
        if (!this.casters.has(casterId)) {
            this.casters.set(casterId, { mana: this.config.defaultMana, maxMana: this.config.defaultMana, affinity: ELEMENT_FIRE });
            this.cooldowns.set(casterId, new Map());
            this.castHistory.set(casterId, []);
        }
        return this.casters.get(casterId);
    }

    _ensureCasterMaps(casterId) {
        if (!this.cooldowns.has(casterId)) {
            this.cooldowns.set(casterId, new Map());
        }
        if (!this.castHistory.has(casterId)) {
            this.castHistory.set(casterId, []);
        }
    }

    _isOnCooldown(casterId, artName) {
        if (!this.cooldowns.has(casterId)) return false;
        const cd = this.cooldowns.get(casterId);
        if (!cd.has(artName)) return false;
        const remaining = cd.get(artName) - this._now();
        return remaining > 0;
    }

    _getCooldownRemaining(casterId, artName) {
        if (!this.cooldowns.has(casterId)) return 0;
        const cd = this.cooldowns.get(casterId);
        if (!cd.has(artName)) return 0;
        const remaining = cd.get(artName) - this._now();
        return remaining > 0 ? remaining : 0;
    }

    _setCooldown(casterId, artName, cooldownSeconds) {
        const cappedCooldown = Math.min(cooldownSeconds, this.config.maxCooldown);
        const expiresAt = this._now() + cappedCooldown * 1000;
        if (!this.cooldowns.has(casterId)) {
            this.cooldowns.set(casterId, new Map());
        }
        this.cooldowns.get(casterId).set(artName, expiresAt);
    }

    _calculatePower(basePower, casterAffinity, isCrit) {
        const affinityMult = AFFINITY_BONUS[casterAffinity] !== undefined ? AFFINITY_BONUS[casterAffinity] : 1.0;
        const critMult = isCrit ? this.config.critMultiplier : 1.0;
        const final = basePower * affinityMult * critMult;
        return Math.max(0, final);
    }

    _calculateCrit(critChance) {
        const clampedChance = Math.min(1, Math.max(0, critChance !== undefined ? critChance : this.config.critChance));
        return Math.random() < clampedChance;
    }

    _resolveAffinity(caster) {
        if (typeof caster === 'object' && caster.affinity !== undefined) return caster.affinity;
        const casterState = this.casters.get(this._getCasterId(caster));
        if (casterState && casterState.affinity) return casterState.affinity;
        return ELEMENT_FIRE;
    }

    castFireArt(artName, target, options = {}) {
        if (!this._validateArtName(artName)) {
            return { success: false, error: ERROR_CODES.UNKNOWN_ART };
        }
        const caster = options.caster !== undefined ? options.caster : target;
        if (!this._validateCaster(caster)) {
            return { success: false, error: ERROR_CODES.INVALID_CASTER };
        }
        if (!this._validateTarget(target)) {
            return { success: false, error: ERROR_CODES.INVALID_TARGET };
        }

        const artDef = ART_DEFINITIONS[artName];
        const casterId = this._getCasterId(caster);
        const targetId = this._getTargetId(target);
        const casterState = this._getMana(caster);
        const affinity = this._resolveAffinity(casterState);

        if (this._isOnCooldown(casterId, artName)) {
            return {
                success: false,
                error: ERROR_CODES.ON_COOLDOWN,
                remaining: this._getCooldownRemaining(casterId, artName),
            };
        }

        if (casterState.mana < artDef.manaCost) {
            return { success: false, error: ERROR_CODES.INSUFFICIENT_MANA };
        }

        const targetType = options.targetType !== undefined ? options.targetType : artDef.targetType;
        if (!TARGET_TYPES.includes(targetType)) {
            return { success: false, error: ERROR_CODES.INVALID_TARGET };
        }

        const isCrit = this._calculateCrit(options.critChance);
        const power = this._calculatePower(artDef.power, affinity, isCrit);
        const castTime = artDef.castTime;
        const id = this._genId();
        const castAt = this._now();

        casterState.mana = Math.max(0, casterState.mana - artDef.manaCost);

        const cooldownValue = options.cooldown !== undefined ? options.cooldown : artDef.cooldown;
        this._setCooldown(casterId, artName, cooldownValue);

        const intensity = options.intensity !== undefined ? options.intensity : 1;
        if (artDef.effects.includes('burn')) {
            this.igniteTarget(target, intensity);
        }
        if (artDef.effects.includes('immolate')) {
            this.igniteTarget(target, 5);
        }

        const cast = {
            id,
            artName,
            element: ELEMENT_FIRE,
            manaCost: artDef.manaCost,
            power,
            basePower: artDef.power,
            cooldown: cooldownValue,
            targetType,
            castTime,
            effects: [...artDef.effects],
            casterId,
            targetId,
            isCrit,
            castAt,
            affinity,
        };

        this.castHistory.get(casterId).push(cast);

        if (targetType === TARGET_TYPE_AREA) {
            if (!this.activeEffects.has(id)) {
                this.activeEffects.set(id, cast);
            }
        }

        this.stats.totalCasts += 1;
        this.stats.byArt[artName] = (this.stats.byArt[artName] || 0) + 1;
        this.stats.byTargetType[targetType] = (this.stats.byTargetType[targetType] || 0) + 1;
        this.stats.totalManaSpent += artDef.manaCost;
        if (isCrit) this.stats.totalCrits += 1;
        if (artDef.effects.includes('burn')) {
            this.stats.totalBurnApplications += 1;
        }

        this._triggerHook('onCast', { cast });
        return { success: true, cast };
    }

    igniteTarget(target, intensity = 1) {
        if (!this._validateTarget(target)) {
            return { success: false, error: ERROR_CODES.INVALID_TARGET };
        }
        if (typeof intensity !== 'number' || intensity < 0) {
            return { success: false, error: ERROR_CODES.INVALID_INTENSITY };
        }
        const targetId = this._getTargetId(target);
        const currentStacks = this.burnStacks.has(targetId) ? this.burnStacks.get(targetId) : 0;
        const newStacks = Math.min(MAX_BURN_STACKS, currentStacks + intensity);
        this.burnStacks.set(targetId, newStacks);
        this.stats.totalBurnApplications += 1;
        this._triggerHook('onIgnite', { targetId, intensity, totalStacks: newStacks });
        return { success: true, targetId, stacks: newStacks, added: intensity };
    }

    burnArea(center, radius = 5) {
        if (!this._validateTarget(center)) {
            return { success: false, error: ERROR_CODES.INVALID_TARGET };
        }
        if (typeof radius !== 'number' || radius <= 0 || radius > MAX_BURN_RADIUS) {
            return { success: false, error: ERROR_CODES.INVALID_RADIUS };
        }
        const centerId = this._getTargetId(center);
        const affectedCount = Math.ceil(radius * 1.5);
        const burnPerTarget = Math.max(1, Math.ceil(radius / 5));
        this.igniteTarget(center, burnPerTarget);
        this.stats.totalBurnAreaHits += affectedCount;
        this._triggerHook('onBurnArea', { centerId, radius, affectedCount });
        return {
            success: true,
            centerId,
            radius,
            affectedCount,
            burnApplied: burnPerTarget,
        };
    }

    flameShield(caster, duration) {
        if (!this._validateCaster(caster)) {
            return { success: false, error: ERROR_CODES.INVALID_CASTER };
        }
        const dur = duration !== undefined ? duration : this.config.defaultShieldDuration;
        if (typeof dur !== 'number' || dur <= 0) {
            return { success: false, error: ERROR_CODES.INVALID_DURATION };
        }
        const casterId = this._getCasterId(caster);
        const shieldValue = Math.floor(dur / 100);
        const shield = {
            id: this._genId(),
            casterId,
            value: shieldValue,
            duration: dur,
            remaining: dur,
            createdAt: this._now(),
            expiresAt: this._now() + dur,
        };
        this.shields.set(casterId, shield);
        this.stats.totalShieldsCreated += 1;
        this.stats.totalShieldValue += shieldValue;
        this._triggerHook('onShield', { shield });
        return { success: true, shield };
    }

    getCastHistory(caster) {
        if (!this._validateCaster(caster)) return [];
        const casterId = this._getCasterId(caster);
        if (!this.castHistory.has(casterId)) return [];
        return [...this.castHistory.get(casterId)];
    }

    getBurnStacks(target) {
        if (!this._validateTarget(target)) return 0;
        const targetId = this._getTargetId(target);
        return this.burnStacks.has(targetId) ? this.burnStacks.get(targetId) : 0;
    }

    getShield(caster) {
        if (!this._validateCaster(caster)) return null;
        const casterId = this._getCasterId(caster);
        if (!this.shields.has(casterId)) return null;
        const shield = this.shields.get(casterId);
        const now = this._now();
        if (now >= shield.expiresAt) {
            this.shields.delete(casterId);
            return null;
        }
        return { ...shield };
    }

    getMana(caster) {
        const casterId = this._getCasterId(caster);
        if (!this.casters.has(casterId)) return this.config.defaultMana;
        return this.casters.get(casterId).mana;
    }

    setMana(caster, amount) {
        if (!this._validateCaster(caster)) return { success: false, error: ERROR_CODES.INVALID_CASTER };
        const casterId = this._getCasterId(caster);
        const casterState = this._getMana(caster);
        casterState.mana = Math.max(0, amount);
        return { success: true, mana: casterState.mana };
    }

    setAffinity(caster, affinity) {
        if (!this._validateCaster(caster)) return { success: false, error: ERROR_CODES.INVALID_CASTER };
        if (!ELEMENTAL_AFFINITIES.includes(affinity)) return { success: false, error: ERROR_CODES.INVALID_AFFINITY };
        const casterId = this._getCasterId(caster);
        const casterState = this._getMana(caster);
        casterState.affinity = affinity;
        return { success: true, affinity };
    }

    tickCooldowns(caster) {
        if (!this._validateCaster(caster)) return { success: false, error: ERROR_CODES.INVALID_CASTER };
        const casterId = this._getCasterId(caster);
        if (!this.cooldowns.has(casterId)) return { success: true, cleared: 0 };
        const cd = this.cooldowns.get(casterId);
        const now = this._now();
        let cleared = 0;
        for (const [artName, expiresAt] of cd.entries()) {
            if (now >= expiresAt) {
                cd.delete(artName);
                cleared += 1;
            }
        }
        return { success: true, cleared };
    }

    listArts() {
        return Object.entries(ART_DEFINITIONS).map(([artName, def]) => ({
            artName,
            ...def,
            element: ELEMENT_FIRE,
        }));
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
        const ctx = context !== undefined && context !== null ? context : {};
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

    removeBurn(target) {
        if (!this._validateTarget(target)) return { success: false, error: ERROR_CODES.INVALID_TARGET };
        const targetId = this._getTargetId(target);
        this.burnStacks.delete(targetId);
        return { success: true };
    }

    removeShield(caster) {
        if (!this._validateCaster(caster)) return { success: false, error: ERROR_CODES.INVALID_CASTER };
        const casterId = this._getCasterId(caster);
        if (!this.shields.has(casterId)) return { success: false, error: 'NO_SHIELD' };
        this.shields.delete(casterId);
        return { success: true };
    }

    toJSON() {
        return {
            config: this.config,
            casters: Array.from(this.casters.entries()),
            cooldowns: Array.from(this.cooldowns.entries()).map(([k, v]) => [k, Array.from(v.entries())]),
            shields: Array.from(this.shields.entries()),
            burnStacks: Array.from(this.burnStacks.entries()),
            castHistory: Array.from(this.castHistory.entries()),
            activeEffects: Array.from(this.activeEffects.entries()),
            stats: this.stats,
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: 'INVALID_DATA' };
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.casters && Array.isArray(data.casters)) {
            this.casters = new Map(data.casters);
        }
        if (data.cooldowns && Array.isArray(data.cooldowns)) {
            this.cooldowns = new Map(data.cooldowns.map(([k, v]) => [k, new Map(v)]));
        }
        if (data.shields && Array.isArray(data.shields)) {
            this.shields = new Map(data.shields);
        }
        if (data.burnStacks && Array.isArray(data.burnStacks)) {
            this.burnStacks = new Map(data.burnStacks);
        }
        if (data.castHistory && Array.isArray(data.castHistory)) {
            this.castHistory = new Map(data.castHistory);
        }
        if (data.activeEffects && Array.isArray(data.activeEffects)) {
            this.activeEffects = new Map(data.activeEffects);
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalCasters: this.casters.size,
            totalActiveShields: this.shields.size,
            totalBurningTargets: this.burnStacks.size,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { stats: this.stats });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.casters.clear();
        this.cooldowns.clear();
        this.shields.clear();
        this.burnStacks.clear();
        this.castHistory.clear();
        this.activeEffects.clear();
        this.hooks.clear();
        this.stats = {
            totalCasts: 0,
            totalCrits: 0,
            totalShieldsCreated: 0,
            totalShieldValue: 0,
            totalBurnApplications: 0,
            totalBurnAreaHits: 0,
            totalManaSpent: 0,
            byArt: {
                flame_bolt: 0,
                fire_ball: 0,
                wildfire: 0,
                meteor: 0,
                phoenix_rebirth: 0,
            },
            byTargetType: {
                enemy: 0,
                area: 0,
                self: 0,
            },
            evolutionCount: 0,
        };
        this._registerDefaultTools();
        return { success: true };
    }
}