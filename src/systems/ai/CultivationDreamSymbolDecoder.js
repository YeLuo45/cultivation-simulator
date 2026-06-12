/**
 * CultivationDreamSymbolDecoder.js - 修真梦境符号解读
 * V876 P-20260613-019 Iteration 19/30 Round 34
 *
 * 修真梦境系统：解读梦境中出现的符号与寓意
 * - 核心 API: decodeSymbol / interpretMeaning / applyInsight
 * - 数据结构: { id, dreamId, symbol, meaning, interpretation, appliedAt }
 * - 配置: SYMBOL_TYPES, MEANING_LIBRARY, INTERPRETATION_RULES
 */

export const SYMBOL_TYPES = [
    'sword', 'lotus', 'phoenix', 'dragon', 'taiji', 'moon', 'sun', 'river', 'mountain', 'star',
];

export const SYMBOL_TYPE_COUNT = 10;

export const MEANING_LIBRARY = {
    sword: { meaning: '破妄斩业', polarity: 'yang', omen: 'victory' },
    lotus: { meaning: '清净无染', polarity: 'yin', omen: 'purity' },
    phoenix: { meaning: '浴火重生', polarity: 'yang', omen: 'rebirth' },
    dragon: { meaning: '腾云驾雾', polarity: 'yang', omen: 'ascension' },
    taiji: { meaning: '阴阳调和', polarity: 'balanced', omen: 'harmony' },
    moon: { meaning: '阴晴圆缺', polarity: 'yin', omen: 'cycle' },
    sun: { meaning: '光明普照', polarity: 'yang', omen: 'clarity' },
    river: { meaning: '川流不息', polarity: 'yang', omen: 'flow' },
    mountain: { meaning: '稳如磐石', polarity: 'yin', omen: 'stability' },
    star: { meaning: '指引迷途', polarity: 'yang', omen: 'guidance' },
};

export const MEANING_LIBRARY_COUNT = 10;

export const INTERPRETATION_RULES = {
    yangBase: 0.5,
    yinBase: 0.4,
    balancedBase: 0.7,
    masteryThreshold: 0.8,
    insightBoost: 0.2,
};

export const INTERPRETATION_LEVELS = ['novice', 'adept', 'master'];

export const MAX_INTERPRETATIONS_PER_DREAM = 20;

export const DEFAULT_MAX_DECODED_SYMBOLS = 200;

export const SYMBOL_NOT_FOUND = 'SYMBOL_NOT_FOUND';
export const DECODED_NOT_FOUND = 'DECODED_NOT_FOUND';
export const INVALID_INPUT = 'INVALID_INPUT';
export const ALREADY_APPLIED = 'ALREADY_APPLIED';

export class CultivationDreamSymbolDecoder {
    constructor(config = {}) {
        this.config = {
            maxDecodedSymbols: config.maxDecodedSymbols !== undefined ? config.maxDecodedSymbols : DEFAULT_MAX_DECODED_SYMBOLS,
            maxInterpretationsPerDream: config.maxInterpretationsPerDream !== undefined ? config.maxInterpretationsPerDream : MAX_INTERPRETATIONS_PER_DREAM,
            autoInterpret: config.autoInterpret !== undefined ? config.autoInterpret : true,
            masteryThreshold: config.masteryThreshold !== undefined ? config.masteryThreshold : INTERPRETATION_RULES.masteryThreshold,
            ...config,
        };
        this.decoded = new Map();
        this.dreamDecoded = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalDecoded: 0,
            totalInterpreted: 0,
            totalApplied: 0,
            evolutionCount: 0,
            bySymbol: { sword: 0, lotus: 0, phoenix: 0, dragon: 0, taiji: 0, moon: 0, sun: 0, river: 0, mountain: 0, star: 0 },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDecoded', (ctx) => this.getDecoded(ctx.decodedId));
        this.registerTool('listByDream', (ctx) => this.listByDream(ctx.dreamId));
        this.registerTool('listApplied', () => this.listApplied());
    }

    _genId() {
        return `symdec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _isValidSymbol(symbol) {
        return typeof symbol === 'string' && SYMBOL_TYPES.includes(symbol);
    }

    _lookupMeaning(symbol) {
        return MEANING_LIBRARY[symbol] || null;
    }

    _baseScoreForPolarity(polarity) {
        if (polarity === 'yang') return INTERPRETATION_RULES.yangBase;
        if (polarity === 'yin') return INTERPRETATION_RULES.yinBase;
        if (polarity === 'balanced') return INTERPRETATION_RULES.balancedBase;
        return 0.1;
    }

    _classifyLevel(score) {
        if (score >= this.config.masteryThreshold) return 'master';
        if (score >= 0.5) return 'adept';
        return 'novice';
    }

    _clipProbability(p) {
        return Math.max(0, Math.min(1, p));
    }

    decodeSymbol(dreamId, symbol) {
        if (typeof dreamId !== 'string' || dreamId.length === 0) {
            return { success: false, error: INVALID_INPUT };
        }
        if (!this._isValidSymbol(symbol)) {
            return { success: false, error: SYMBOL_NOT_FOUND };
        }
        const meaning = this._lookupMeaning(symbol);
        if (!meaning) {
            return { success: false, error: SYMBOL_NOT_FOUND };
        }

        const id = this._genId();
        const decoded = {
            id,
            dreamId,
            symbol,
            meaning: meaning.meaning,
            polarity: meaning.polarity,
            omen: meaning.omen,
            interpretation: null,
            interpretationLevel: null,
            score: 0,
            applied: false,
            appliedAt: null,
            decodedAt: Date.now(),
        };

        this.decoded.set(id, decoded);
        if (!this.dreamDecoded.has(dreamId)) {
            this.dreamDecoded.set(dreamId, []);
        }
        const list = this.dreamDecoded.get(dreamId);
        list.push(id);

        // Trim
        if (list.length > this.config.maxInterpretationsPerDream) {
            const removed = list.shift();
            if (removed && this.decoded.has(removed)) {
                this.decoded.delete(removed);
            }
        }

        this.stats.totalDecoded += 1;
        this.stats.bySymbol[symbol] = (this.stats.bySymbol[symbol] || 0) + 1;
        this._triggerHook('onDecoded', { decoded });

        if (this.config.autoInterpret) {
            this.interpretMeaning(id);
        }

        return { success: true, decoded: this.getDecoded(id) };
    }

    interpretMeaning(decodedId) {
        if (typeof decodedId !== 'string' || decodedId.length === 0) {
            return { success: false, error: INVALID_INPUT };
        }
        if (!this.decoded.has(decodedId)) {
            return { success: false, error: DECODED_NOT_FOUND };
        }
        const entry = this.decoded.get(decodedId);
        const base = this._baseScoreForPolarity(entry.polarity);
        const insightBoost = entry.omen === 'rebirth' || entry.omen === 'ascension'
            ? INTERPRETATION_RULES.insightBoost : 0.1;
        const score = this._clipProbability(base + insightBoost);
        const level = this._classifyLevel(score);
        entry.score = score;
        entry.interpretation = `${entry.symbol}主${entry.meaning}，象${entry.omen}。`;
        entry.interpretationLevel = level;
        this.stats.totalInterpreted += 1;
        this._triggerHook('onInterpreted', { decodedId, score, level });
        return { success: true, score, level, interpretation: entry.interpretation };
    }

    applyInsight(decodedId) {
        if (typeof decodedId !== 'string' || decodedId.length === 0) {
            return { success: false, error: INVALID_INPUT };
        }
        if (!this.decoded.has(decodedId)) {
            return { success: false, error: DECODED_NOT_FOUND };
        }
        const entry = this.decoded.get(decodedId);
        if (entry.applied) {
            return { success: false, error: ALREADY_APPLIED };
        }
        if (entry.interpretation === null) {
            return { success: false, error: 'NOT_INTERPRETED' };
        }
        entry.applied = true;
        entry.appliedAt = Date.now();
        this.stats.totalApplied += 1;
        this._triggerHook('onApplied', { decodedId, appliedAt: entry.appliedAt });
        return { success: true, appliedAt: entry.appliedAt };
    }

    getDecoded(decodedId) {
        if (!this.decoded.has(decodedId)) return null;
        return { ...this.decoded.get(decodedId) };
    }

    listByDream(dreamId) {
        if (!this.dreamDecoded.has(dreamId)) return [];
        const ids = this.dreamDecoded.get(dreamId);
        return ids.map(id => this.decoded.get(id)).filter(d => d !== undefined).map(d => ({ ...d }));
    }

    listApplied() {
        return Array.from(this.decoded.values()).filter(d => d.applied).map(d => ({ ...d }));
    }

    listBySymbol(symbol) {
        if (!this._isValidSymbol(symbol)) return [];
        return Array.from(this.decoded.values()).filter(d => d.symbol === symbol).map(d => ({ ...d }));
    }

    listByLevel(level) {
        if (!INTERPRETATION_LEVELS.includes(level)) return [];
        return Array.from(this.decoded.values()).filter(d => d.interpretationLevel === level).map(d => ({ ...d }));
    }

    deleteDecoded(decodedId) {
        if (!this.decoded.has(decodedId)) return { success: false, error: DECODED_NOT_FOUND };
        const entry = this.decoded.get(decodedId);
        if (this.dreamDecoded.has(entry.dreamId)) {
            const list = this.dreamDecoded.get(entry.dreamId);
            const idx = list.indexOf(decodedId);
            if (idx !== -1) list.splice(idx, 1);
        }
        this.decoded.delete(decodedId);
        return { success: true };
    }

    registerTool(name, handler) {
        if (typeof name !== 'string' || name.length === 0) {
            return { success: false, error: INVALID_INPUT };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_INPUT };
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
            return { success: false, error: INVALID_INPUT };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_INPUT };
        }
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(handler);
        return { success: true };
    }

    _triggerHook(event, data) {
        if (!this.hooks.has(event)) return;
        for (const h of this.hooks.get(event)) {
            try { h(data); } catch (e) { /* silent */ }
        }
    }

    unregisterHook(event, handler) {
        if (!this.hooks.has(event)) return { success: false, error: 'EVENT_NOT_FOUND' };
        const arr = this.hooks.get(event);
        const idx = arr.indexOf(handler);
        if (idx === -1) return { success: false, error: 'HANDLER_NOT_FOUND' };
        arr.splice(idx, 1);
        return { success: true };
    }

    toJSON() {
        return {
            config: this.config,
            decoded: Array.from(this.decoded.entries()),
            dreamDecoded: Array.from(this.dreamDecoded.entries()),
            stats: this.stats,
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: INVALID_INPUT };
        if (data.config) this.config = { ...this.config, ...data.config };
        if (data.decoded && Array.isArray(data.decoded)) this.decoded = new Map(data.decoded);
        if (data.dreamDecoded && Array.isArray(data.dreamDecoded)) this.dreamDecoded = new Map(data.dreamDecoded);
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalTracked: this.decoded.size,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { evolutionCount: this.stats.evolutionCount });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.decoded.clear();
        this.dreamDecoded.clear();
        this.hooks.clear();
        this.stats = {
            totalDecoded: 0,
            totalInterpreted: 0,
            totalApplied: 0,
            evolutionCount: 0,
            bySymbol: { sword: 0, lotus: 0, phoenix: 0, dragon: 0, taiji: 0, moon: 0, sun: 0, river: 0, mountain: 0, star: 0 },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}
