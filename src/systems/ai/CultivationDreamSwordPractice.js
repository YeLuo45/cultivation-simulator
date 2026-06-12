/**
 * CultivationDreamSwordPractice.js - 梦中剑道修行
 * V863 P-20260613-006 Iteration 6/30 Round 34
 *
 * 修真梦境系统：梦境内修炼剑法
 * - 核心 API: practiceSwordForm / performCombo / manifestSwordIntent
 * - 数据结构: { id, dreamId, technique, comboCount, swordIntentLevel, masteryScore, lastPracticeAt }
 * - 配置: SWORD_TECHNIQUES (3), COMBO_MAX (10), INTENT_LEVELS (5)
 */

export const SWORD_TECHNIQUES = {
    sword_rain: {
        name: '万剑诀',
        difficulty: 0.4,
        baseMastery: 5,
        intentBonus: 1,
    },
    thunder_sword: {
        name: '雷剑诀',
        difficulty: 0.7,
        baseMastery: 8,
        intentBonus: 2,
    },
    void_slash: {
        name: '虚空斩',
        difficulty: 0.9,
        baseMastery: 12,
        intentBonus: 3,
    },
};

export const TECHNIQUE_KEYS = ['sword_rain', 'thunder_sword', 'void_slash'];

export const COMBO_MAX = 10;

export const INTENT_LEVELS = [0, 1, 2, 3, 4];
export const INTENT_LEVEL_MAX = 4;

export const INTENT_MASTERY_THRESHOLDS = [0, 20, 60, 140, 280];

export const SWORD_PRACTICE_STATES = {
    PRACTICING: 'practicing',
    COMBO: 'combo',
    INTENT: 'intent',
    MASTERED: 'mastered',
};

export class CultivationDreamSwordPractice {
    constructor(config = {}) {
        this.config = {
            maxPractices: config.maxPractices !== undefined ? config.maxPractices : 50,
            maxComboLength: config.maxComboLength !== undefined ? config.maxComboLength : 20,
            masteryDoubleCap: config.masteryDoubleCap !== undefined ? config.masteryDoubleCap : 10000,
            intentBaseCost: config.intentBaseCost !== undefined ? config.intentBaseCost : 1,
            ...config,
        };
        this.practices = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPractices: 0, totalCombos: 0, totalIntentManifestations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPractice', (ctx) => this.getPractice(ctx.practiceId));
        this.registerTool('listPracticesByDream', (ctx) => this.listPracticesByDream(ctx.dreamId));
    }

    _genId() {
        return `swordpractice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _isValidTechnique(technique) {
        return typeof technique === 'string' && TECHNIQUE_KEYS.includes(technique);
    }

    _calcIntentLevel(masteryScore) {
        let lvl = 0;
        for (let i = 0; i < INTENT_MASTERY_THRESHOLDS.length; i++) {
            if (masteryScore >= INTENT_MASTERY_THRESHOLDS[i]) {
                lvl = i;
            }
        }
        return lvl;
    }

    practiceSwordForm(dreamId, technique) {
        if (typeof dreamId !== 'string' || dreamId.length === 0) {
            return { success: false, error: 'INVALID_DREAM_ID' };
        }
        if (!this._isValidTechnique(technique)) {
            return { success: false, error: 'UNKNOWN_TECHNIQUE' };
        }
        if (this.practices.size >= this.config.maxPractices) {
            return { success: false, error: 'MAX_PRACTICES_REACHED' };
        }
        const id = this._genId();
        const techDef = SWORD_TECHNIQUES[technique];
        const practice = {
            id,
            dreamId,
            technique,
            techniqueName: techDef.name,
            comboCount: 0,
            swordIntentLevel: 0,
            masteryScore: 0,
            lastPracticeAt: Date.now(),
            state: SWORD_PRACTICE_STATES.PRACTICING,
        };
        this.practices.set(id, practice);
        this.stats.totalPractices++;
        this._triggerHook('swordPracticed', { practiceId: id, dreamId, technique });
        return { success: true, practice };
    }

    getPractice(id) {
        const p = this.practices.get(id);
        return p ? { ...p } : null;
    }

    listPractices() {
        return Array.from(this.practices.values()).map(p => ({ ...p }));
    }

    listPracticesByDream(dreamId) {
        return Array.from(this.practices.values())
            .filter(p => p.dreamId === dreamId)
            .map(p => ({ ...p }));
    }

    listPracticesByTechnique(technique) {
        return Array.from(this.practices.values())
            .filter(p => p.technique === technique)
            .map(p => ({ ...p }));
    }

    listPracticesByIntent(intentLevel) {
        return Array.from(this.practices.values())
            .filter(p => p.swordIntentLevel === intentLevel)
            .map(p => ({ ...p }));
    }

    listMasteredPractices() {
        return Array.from(this.practices.values())
            .filter(p => p.swordIntentLevel >= INTENT_LEVEL_MAX)
            .map(p => ({ ...p }));
    }

    listPracticesByState(state) {
        return Array.from(this.practices.values())
            .filter(p => p.state === state)
            .map(p => ({ ...p }));
    }

    performCombo(practiceId, sequence) {
        const p = this.practices.get(practiceId);
        if (!p) return { success: false, error: 'PRACTICE_NOT_FOUND' };
        if (!Array.isArray(sequence) || sequence.length === 0) {
            return { success: false, error: 'INVALID_SEQUENCE' };
        }
        if (sequence.length > this.config.maxComboLength) {
            return { success: false, error: 'SEQUENCE_TOO_LONG' };
        }
        const validSeq = sequence.every(s => this._isValidTechnique(s));
        if (!validSeq) {
            return { success: false, error: 'INVALID_TECHNIQUE_IN_SEQUENCE' };
        }
        // Accumulate combo with mastery bonus per technique
        const techDef = SWORD_TECHNIQUES[p.technique];
        const baseGain = sequence.length;
        const masteryGain = baseGain * techDef.baseMastery / 5;
        const intentPrev = p.swordIntentLevel;

        const newCombo = p.comboCount + sequence.length;
        let didCap = false;
        if (newCombo >= COMBO_MAX) {
            // At COMBO_MAX: masteryScore doubles
            p.masteryScore = Math.min(this.config.masteryDoubleCap, p.masteryScore * 2 + masteryGain);
            p.comboCount = COMBO_MAX;
            didCap = true;
            p.state = SWORD_PRACTICE_STATES.COMBO;
        } else {
            p.comboCount = newCombo;
            p.masteryScore = Math.min(this.config.masteryDoubleCap, p.masteryScore + masteryGain);
        }
        p.swordIntentLevel = this._calcIntentLevel(p.masteryScore);
        if (p.swordIntentLevel !== intentPrev) {
            if (p.swordIntentLevel >= INTENT_LEVEL_MAX) {
                p.state = SWORD_PRACTICE_STATES.MASTERED;
            } else {
                p.state = SWORD_PRACTICE_STATES.INTENT;
            }
        }
        p.lastPracticeAt = Date.now();
        this.stats.totalCombos++;
        this._triggerHook('comboPerformed', {
            practiceId,
            sequence,
            comboCount: p.comboCount,
            masteryScore: p.masteryScore,
            capped: didCap,
        });
        return {
            success: true,
            comboCount: p.comboCount,
            masteryScore: p.masteryScore,
            swordIntentLevel: p.swordIntentLevel,
            capped: didCap,
        };
    }

    manifestSwordIntent(practiceId) {
        const p = this.practices.get(practiceId);
        if (!p) return { success: false, error: 'PRACTICE_NOT_FOUND' };
        if (p.swordIntentLevel <= 0) {
            return { success: false, error: 'INSUFFICIENT_INTENT' };
        }
        const techDef = SWORD_TECHNIQUES[p.technique];
        // Manifest consumes intent cost; if intent > 0, gain mastery scaled by intentBonus
        const cost = this.config.intentBaseCost;
        const intentDeduction = Math.min(cost, p.swordIntentLevel);
        p.swordIntentLevel = p.swordIntentLevel - intentDeduction;
        const intentGainMastery = intentDeduction * techDef.intentBonus;
        p.masteryScore = Math.min(
            this.config.masteryDoubleCap,
            p.masteryScore + intentGainMastery
        );
        // Recompute intent level from mastery
        const recomputed = this._calcIntentLevel(p.masteryScore);
        if (recomputed > p.swordIntentLevel) {
            p.swordIntentLevel = recomputed;
        }
        if (p.swordIntentLevel >= INTENT_LEVEL_MAX) {
            p.state = SWORD_PRACTICE_STATES.MASTERED;
        } else if (p.swordIntentLevel > 0) {
            p.state = SWORD_PRACTICE_STATES.INTENT;
        } else {
            p.state = SWORD_PRACTICE_STATES.PRACTICING;
        }
        p.lastPracticeAt = Date.now();
        this.stats.totalIntentManifestations++;
        this._triggerHook('swordIntentManifested', {
            practiceId,
            swordIntentLevel: p.swordIntentLevel,
            masteryScore: p.masteryScore,
        });
        return {
            success: true,
            swordIntentLevel: p.swordIntentLevel,
            masteryScore: p.masteryScore,
        };
    }

    calculateSwordPower(practiceId) {
        const p = this.practices.get(practiceId);
        if (!p) return 0;
        const techDef = SWORD_TECHNIQUES[p.technique];
        const masteryComponent = p.masteryScore;
        const intentComponent = p.swordIntentLevel * 25;
        const difficultyComponent = techDef.difficulty * 50;
        return Math.floor(masteryComponent + intentComponent + difficultyComponent);
    }

    getDreamSwordSummary(dreamId) {
        const ps = this.listPracticesByDream(dreamId);
        if (ps.length === 0) {
            return {
                dreamId,
                practiceCount: 0,
                totalMastery: 0,
                totalCombos: 0,
                maxIntentLevel: 0,
            };
        }
        const totalMastery = ps.reduce((s, p) => s + p.masteryScore, 0);
        const totalCombos = ps.reduce((s, p) => s + p.comboCount, 0);
        const maxIntentLevel = ps.reduce((m, p) => Math.max(m, p.swordIntentLevel), 0);
        return {
            dreamId,
            practiceCount: ps.length,
            totalMastery,
            totalCombos,
            maxIntentLevel,
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
        if (this.stats.totalPractices < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            practices: Array.from(this.practices.entries()),
            stats: { ...this.stats },
            config: { ...this.config },
        };
    }

    fromJSON(data) {
        if (data.practices) this.practices = new Map(data.practices);
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return { ...this.stats, practiceCount: this.practices.size };
    }
}
