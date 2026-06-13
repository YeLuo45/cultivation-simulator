/**
 * CultivationFormationTool.js - 修真阵法工具
 * V918 P-20260613-092 Iteration 1/30 Round 36
 *
 * 修真工具链 (claude-code Toolchain 启发)：阵法工具
 * 核心 6 工具: deployFormation / activateFormation / deactivateFormation /
 *              inspectFormation / tickDecay / destroyFormation
 * - 核心 API: deployFormation(formationType, materials) / activateFormation(formationId) /
 *             deactivateFormation(formationId) / inspectFormation(formationId)
 * - 数据结构: { id, playerId, formationType ('attack'|'defense'|'trap'|'illusion'|'healing'),
 *              materials: [{name, qty}], status ('pending'|'active'|'dormant'|'destroyed'),
 *              powerLevel, deployedAt, duration, tickCount, lastTickAt }
 * - 配置: FORMATION_TYPES (5), MATERIALS_DB (12), MAX_FORMATIONS_PER_PLAYER (20),
 *         POWER_DECAY_RATE (0.05/tick), DEFAULT_DURATION (60000ms)
 */

export const FORMATION_TYPES = {
    attack: {
        name: '攻击阵法',
        requiredMaterials: ['spirit_stone', 'sword_essence'],
        basePower: 100,
        duration: 60000,
        category: 'combat',
    },
    defense: {
        name: '防御阵法',
        requiredMaterials: ['earth_core', 'turtle_shell'],
        basePower: 80,
        duration: 90000,
        category: 'combat',
    },
    trap: {
        name: '困敌阵法',
        requiredMaterials: ['shadow_vein', 'poison_dust'],
        basePower: 50,
        duration: 120000,
        category: 'control',
    },
    illusion: {
        name: '幻象阵法',
        requiredMaterials: ['mirage_mist', 'phantom_silk'],
        basePower: 60,
        duration: 45000,
        category: 'control',
    },
    healing: {
        name: '疗愈阵法',
        requiredMaterials: ['life_water', 'wood_heart'],
        basePower: 70,
        duration: 30000,
        category: 'support',
    },
};
export const FORMATION_TYPE_KEYS = Object.keys(FORMATION_TYPES);
export const FORMATION_TYPE_COUNT = 5;

export const MATERIALS_DB = {
    spirit_stone: { name: '灵石', tier: 1, baseValue: 10 },
    sword_essence: { name: '剑精', tier: 2, baseValue: 25 },
    earth_core: { name: '地核', tier: 2, baseValue: 20 },
    turtle_shell: { name: '龟甲', tier: 1, baseValue: 15 },
    shadow_vein: { name: '幽影脉', tier: 2, baseValue: 22 },
    poison_dust: { name: '毒尘', tier: 1, baseValue: 12 },
    mirage_mist: { name: '幻影雾', tier: 2, baseValue: 18 },
    phantom_silk: { name: '幻蚕丝', tier: 2, baseValue: 28 },
    life_water: { name: '生命之水', tier: 3, baseValue: 40 },
    wood_heart: { name: '木心', tier: 2, baseValue: 24 },
    gold_leaf: { name: '金叶', tier: 3, baseValue: 35 },
    blood_iron: { name: '血铁', tier: 3, baseValue: 38 },
};
export const MATERIALS_DB_KEYS = Object.keys(MATERIALS_DB);
export const MATERIALS_DB_COUNT = 12;

export const FORMATION_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    DORMANT: 'dormant',
    DESTROYED: 'destroyed',
};
export const FORMATION_STATUS_KEYS = Object.keys(FORMATION_STATUS).map(
    (k) => FORMATION_STATUS[k],
);
export const FORMATION_STATUS_COUNT = 4;

export const MAX_FORMATIONS_PER_PLAYER = 20;
export const POWER_DECAY_RATE = 0.05;
export const DEFAULT_DURATION = 60000;
export const MIN_POWER_LEVEL = 0.0001;

export const ERROR_CODES = {
    INVALID_PLAYER_ID: 'INVALID_PLAYER_ID',
    INVALID_FORMATION_TYPE: 'INVALID_FORMATION_TYPE',
    INVALID_MATERIALS: 'INVALID_MATERIALS',
    INSUFFICIENT_MATERIALS: 'INSUFFICIENT_MATERIALS',
    UNKNOWN_MATERIAL: 'UNKNOWN_MATERIAL',
    FORMATION_NOT_FOUND: 'FORMATION_NOT_FOUND',
    FORMATION_NOT_PENDING: 'FORMATION_NOT_PENDING',
    FORMATION_NOT_ACTIVE: 'FORMATION_NOT_ACTIVE',
    FORMATION_ALREADY_DESTROYED: 'FORMATION_ALREADY_DESTROYED',
    MAX_FORMATIONS_REACHED: 'MAX_FORMATIONS_REACHED',
    INVALID_TOOL_NAME: 'INVALID_TOOL_NAME',
    INVALID_HANDLER: 'INVALID_HANDLER',
    UNKNOWN_TOOL: 'UNKNOWN_TOOL',
    TOOL_EXECUTION_ERROR: 'TOOL_EXECUTION_ERROR',
    INVALID_EVENT_NAME: 'INVALID_EVENT_NAME',
    EVENT_NOT_REGISTERED: 'EVENT_NOT_REGISTERED',
    HANDLER_NOT_FOUND: 'HANDLER_NOT_FOUND',
    INVALID_DATA: 'INVALID_DATA',
};

export class CultivationFormationTool {
    constructor(config = {}) {
        this.config = {
            maxFormationsPerPlayer:
                config.maxFormationsPerPlayer !== undefined
                    ? config.maxFormationsPerPlayer
                    : MAX_FORMATIONS_PER_PLAYER,
            powerDecayRate:
                config.powerDecayRate !== undefined
                    ? config.powerDecayRate
                    : POWER_DECAY_RATE,
            defaultDuration:
                config.defaultDuration !== undefined
                    ? config.defaultDuration
                    : DEFAULT_DURATION,
            returnMaterialsOnDeactivate:
                config.returnMaterialsOnDeactivate !== undefined
                    ? config.returnMaterialsOnDeactivate
                    : false,
            autoDestroyOnZeroPower:
                config.autoDestroyOnZeroPower !== undefined
                    ? config.autoDestroyOnZeroPower
                    : false,
            ...config,
        };
        this.formations = new Map();
        this.playerFormations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalDeployed: 0,
            totalActivated: 0,
            totalDeactivated: 0,
            totalDestroyed: 0,
            totalTicks: 0,
            evolutionCount: 0,
            byType: {
                attack: 0,
                defense: 0,
                trap: 0,
                illusion: 0,
                healing: 0,
            },
            byStatus: {
                pending: 0,
                active: 0,
                dormant: 0,
                destroyed: 0,
            },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('deploy', (ctx) =>
            this.deployFormation(ctx.playerId, ctx.formationType, ctx.materials),
        );
        this.registerTool('activate', (ctx) =>
            this.activateFormation(ctx.formationId),
        );
        this.registerTool('deactivate', (ctx) =>
            this.deactivateFormation(ctx.formationId),
        );
        this.registerTool('inspect', (ctx) =>
            this.inspectFormation(ctx.formationId),
        );
        this.registerTool('listByPlayer', (ctx) =>
            this.listByPlayer(ctx.playerId),
        );
    }

    _genId() {
        return `formation_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _now() {
        return Date.now();
    }

    _validatePlayerId(playerId) {
        return typeof playerId === 'string' && playerId.length > 0;
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

    _computeInitialPower(formationType, materials) {
        const basePower = FORMATION_TYPES[formationType].basePower;
        let bonus = 0;
        for (const m of materials) {
            const def = MATERIALS_DB[m.name];
            if (def) {
                bonus += (def.tier * def.baseValue * m.qty) / 100;
            }
        }
        return Math.max(MIN_POWER_LEVEL, basePower + bonus);
    }

    _countByPlayer(playerId) {
        if (!this.playerFormations.has(playerId)) return 0;
        return this.playerFormations.get(playerId).length;
    }

    deployFormation(playerId, formationType, materials, options = {}) {
        if (!this._validatePlayerId(playerId)) {
            return { success: false, error: ERROR_CODES.INVALID_PLAYER_ID };
        }
        if (!FORMATION_TYPES[formationType]) {
            return { success: false, error: ERROR_CODES.INVALID_FORMATION_TYPE };
        }
        if (!this._validateMaterials(materials)) {
            return { success: false, error: ERROR_CODES.INVALID_MATERIALS };
        }

        const typeDef = FORMATION_TYPES[formationType];
        for (const m of materials) {
            if (!MATERIALS_DB[m.name]) {
                return { success: false, error: ERROR_CODES.UNKNOWN_MATERIAL };
            }
        }

        if (!this._checkMaterialsSufficient(materials, typeDef.requiredMaterials)) {
            return { success: false, error: ERROR_CODES.INSUFFICIENT_MATERIALS };
        }

        if (this._countByPlayer(playerId) >= this.config.maxFormationsPerPlayer) {
            return { success: false, error: ERROR_CODES.MAX_FORMATIONS_REACHED };
        }

        const id = this._genId();
        const deployedAt = this._now();
        const duration = options.duration !== undefined ? options.duration : typeDef.duration;
        const consolidated = this._consolidateMaterials(materials);
        const powerLevel = this._computeInitialPower(formationType, consolidated);

        const formation = {
            id,
            playerId,
            formationType,
            materials: consolidated,
            status: FORMATION_STATUS.PENDING,
            powerLevel,
            deployedAt,
            duration,
            tickCount: 0,
            lastTickAt: null,
        };

        this.formations.set(id, formation);
        if (!this.playerFormations.has(playerId)) {
            this.playerFormations.set(playerId, []);
        }
        this.playerFormations.get(playerId).push(id);

        this.stats.totalDeployed += 1;
        this.stats.byType[formationType] = (this.stats.byType[formationType] || 0) + 1;
        this.stats.byStatus[FORMATION_STATUS.PENDING] += 1;

        this._triggerHook('onDeploy', { formation });
        return { success: true, formation };
    }

    activateFormation(formationId) {
        if (!this.formations.has(formationId)) {
            return { success: false, error: ERROR_CODES.FORMATION_NOT_FOUND };
        }
        const formation = this.formations.get(formationId);
        if (formation.status === FORMATION_STATUS.DESTROYED) {
            return { success: false, error: ERROR_CODES.FORMATION_ALREADY_DESTROYED };
        }
        if (formation.status !== FORMATION_STATUS.PENDING && formation.status !== FORMATION_STATUS.DORMANT) {
            return { success: false, error: ERROR_CODES.FORMATION_NOT_PENDING };
        }

        const prevStatus = formation.status;
        formation.status = FORMATION_STATUS.ACTIVE;
        formation.lastTickAt = this._now();

        this.stats.byStatus[prevStatus] -= 1;
        this.stats.byStatus[FORMATION_STATUS.ACTIVE] += 1;
        this.stats.totalActivated += 1;

        this._triggerHook('onActivate', { formation });
        return { success: true, formation };
    }

    deactivateFormation(formationId) {
        if (!this.formations.has(formationId)) {
            return { success: false, error: ERROR_CODES.FORMATION_NOT_FOUND };
        }
        const formation = this.formations.get(formationId);
        if (formation.status === FORMATION_STATUS.DESTROYED) {
            return { success: false, error: ERROR_CODES.FORMATION_ALREADY_DESTROYED };
        }
        if (formation.status !== FORMATION_STATUS.ACTIVE) {
            return { success: false, error: ERROR_CODES.FORMATION_NOT_ACTIVE };
        }

        const prevStatus = formation.status;
        formation.status = FORMATION_STATUS.DORMANT;
        formation.lastTickAt = this._now();

        this.stats.byStatus[prevStatus] -= 1;
        this.stats.byStatus[FORMATION_STATUS.DORMANT] += 1;
        this.stats.totalDeactivated += 1;

        const releasedMaterials = this.config.returnMaterialsOnDeactivate
            ? formation.materials.map((m) => ({ ...m }))
            : [];

        this._triggerHook('onDeactivate', { formation, releasedMaterials });
        return { success: true, formation, releasedMaterials };
    }

    destroyFormation(formationId) {
        if (!this.formations.has(formationId)) {
            return { success: false, error: ERROR_CODES.FORMATION_NOT_FOUND };
        }
        const formation = this.formations.get(formationId);
        if (formation.status === FORMATION_STATUS.DESTROYED) {
            return { success: false, error: ERROR_CODES.FORMATION_ALREADY_DESTROYED };
        }

        const prevStatus = formation.status;
        formation.status = FORMATION_STATUS.DESTROYED;
        formation.powerLevel = 0;
        formation.lastTickAt = this._now();

        this.stats.byStatus[prevStatus] -= 1;
        this.stats.byStatus[FORMATION_STATUS.DESTROYED] += 1;
        this.stats.totalDestroyed += 1;

        if (this.playerFormations.has(formation.playerId)) {
            const list = this.playerFormations.get(formation.playerId);
            const idx = list.indexOf(formationId);
            if (idx !== -1) list.splice(idx, 1);
        }

        this._triggerHook('onDestroy', { formation });
        return { success: true, formation };
    }

    inspectFormation(formationId) {
        if (!this.formations.has(formationId)) return null;
        const formation = this.formations.get(formationId);
        return this._cloneFormation(formation);
    }

    _cloneFormation(formation) {
        return {
            ...formation,
            materials: formation.materials.map((m) => ({ ...m })),
        };
    }

    tickDecay(formationId, now = this._now()) {
        if (!this.formations.has(formationId)) {
            return { success: false, error: ERROR_CODES.FORMATION_NOT_FOUND };
        }
        const formation = this.formations.get(formationId);
        if (formation.status !== FORMATION_STATUS.ACTIVE) {
            return { success: false, error: ERROR_CODES.FORMATION_NOT_ACTIVE };
        }

        const decay = this.config.powerDecayRate;
        formation.powerLevel = Math.max(0, formation.powerLevel - decay);
        formation.tickCount += 1;
        formation.lastTickAt = now;
        this.stats.totalTicks += 1;

        let autoDestroyed = false;
        if (formation.powerLevel <= 0 && this.config.autoDestroyOnZeroPower) {
            formation.status = FORMATION_STATUS.DESTROYED;
            this.stats.byStatus[FORMATION_STATUS.ACTIVE] -= 1;
            this.stats.byStatus[FORMATION_STATUS.DESTROYED] += 1;
            this.stats.totalDestroyed += 1;
            autoDestroyed = true;
            this._triggerHook('onAutoDestroy', { formation });
        }

        this._triggerHook('onTick', { formation });
        return { success: true, formation, autoDestroyed };
    }

    tickAllActive(now = this._now()) {
        const ids = Array.from(this.formations.keys()).filter((id) => {
            const f = this.formations.get(id);
            return f && f.status === FORMATION_STATUS.ACTIVE;
        });
        let ticked = 0;
        let autoDestroyed = 0;
        for (const id of ids) {
            const result = this.tickDecay(id, now);
            if (result.success) {
                ticked += 1;
                if (result.autoDestroyed) autoDestroyed += 1;
            }
        }
        return { success: true, ticked, autoDestroyed };
    }

    listByPlayer(playerId) {
        if (!this.playerFormations.has(playerId)) return [];
        const ids = this.playerFormations.get(playerId);
        return ids
            .map((id) => this.formations.get(id))
            .filter((f) => f !== undefined)
            .map((f) => this._cloneFormation(f));
    }

    listByType(formationType) {
        if (!FORMATION_TYPES[formationType]) return [];
        return Array.from(this.formations.values())
            .filter((f) => f.formationType === formationType)
            .map((f) => this._cloneFormation(f));
    }

    listByStatus(status) {
        if (!FORMATION_STATUS_KEYS.includes(status)) return [];
        return Array.from(this.formations.values())
            .filter((f) => f.status === status)
            .map((f) => this._cloneFormation(f));
    }

    listActive() {
        return this.listByStatus(FORMATION_STATUS.ACTIVE);
    }

    listAll() {
        return Array.from(this.formations.values()).map((f) => this._cloneFormation(f));
    }

    getFormationStats(playerId) {
        const playerFormations = this.listByPlayer(playerId);
        const byType = {
            attack: 0,
            defense: 0,
            trap: 0,
            illusion: 0,
            healing: 0,
        };
        const byStatus = {
            pending: 0,
            active: 0,
            dormant: 0,
            destroyed: 0,
        };
        let totalPower = 0;
        for (const f of playerFormations) {
            if (byType[f.formationType] !== undefined) byType[f.formationType] += 1;
            if (byStatus[f.status] !== undefined) byStatus[f.status] += 1;
            totalPower += f.powerLevel;
        }
        return {
            playerId,
            totalFormations: playerFormations.length,
            totalPower,
            byType,
            byStatus,
        };
    }

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

    toJSON() {
        return {
            config: { ...this.config },
            formations: Array.from(this.formations.entries()),
            playerFormations: Array.from(this.playerFormations.entries()),
            stats: { ...this.stats },
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') {
            return { success: false, error: ERROR_CODES.INVALID_DATA };
        }
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.formations && Array.isArray(data.formations)) {
            this.formations = new Map(data.formations);
        }
        if (data.playerFormations && Array.isArray(data.playerFormations)) {
            this.playerFormations = new Map(data.playerFormations);
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalFormations: this.formations.size,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { stats: this.stats });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.formations.clear();
        this.playerFormations.clear();
        this.hooks.clear();
        this.stats = {
            totalDeployed: 0,
            totalActivated: 0,
            totalDeactivated: 0,
            totalDestroyed: 0,
            totalTicks: 0,
            evolutionCount: 0,
            byType: {
                attack: 0,
                defense: 0,
                trap: 0,
                illusion: 0,
                healing: 0,
            },
            byStatus: {
                pending: 0,
                active: 0,
                dormant: 0,
                destroyed: 0,
            },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}