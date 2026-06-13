/**
 * FailurePatternDetector.js - 失败模式检测器
 * V954 P-20260614-007 Iteration 7/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (nanobot mesh pattern detection):
 * - 收集玩家失败事件
 * - 分类失败模式 (timeout / resource / decision / execution)
 * - 提取 recurring 模式
 * - 给出模式严重度
 */

export const FAILURE_CATEGORIES = ['timeout', 'resource', 'decision', 'execution', 'unknown'];
export const PATTERN_MIN_REPEAT = 2;
export const DEFAULT_MAX_PATTERNS = 100;

export class FailurePatternDetector {
    constructor(config = {}) {
        this.config = {
            minRepeat: config.minRepeat !== undefined ? config.minRepeat : PATTERN_MIN_REPEAT,
            maxPatterns: config.maxPatterns !== undefined ? config.maxPatterns : DEFAULT_MAX_PATTERNS,
            ...config,
        };
        this.failures = new Map();      // failureId -> failure record
        this.playerFailures = new Map(); // playerId -> failureId[]
        this.patterns = new Map();      // patternId -> pattern
        this.hooks = new Map();
        this.stats = { totalRecorded: 0, totalPatterns: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _newId() { return `flr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    recordFailure(playerId, category, target, context = {}) {
        if (!playerId || !FAILURE_CATEGORIES.includes(category)) return null;
        const id = this._newId();
        const failure = { id, playerId, category, target: target || 'unknown', context, ts: Date.now() };
        this.failures.set(id, failure);
        if (!this.playerFailures.has(playerId)) this.playerFailures.set(playerId, []);
        this.playerFailures.get(playerId).push(id);
        this.stats.totalRecorded++;
        this._emit('failureRecorded', failure);
        this._analyzePatterns(playerId);
        return failure;
    }

    _signature(category, target) {
        return `${category}::${target}`;
    }

    _analyzePatterns(playerId) {
        const list = this.playerFailures.get(playerId) || [];
        if (list.length < this.config.minRepeat) return;
        const sigs = {};
        for (const fid of list) {
            const f = this.failures.get(fid);
            if (!f) continue;
            const sig = this._signature(f.category, f.target);
            sigs[sig] = (sigs[sig] || 0) + 1;
        }
        for (const [sig, count] of Object.entries(sigs)) {
            if (count >= this.config.minRepeat) {
                const [cat, tgt] = sig.split('::');
                this._recordPattern(playerId, cat, tgt, count);
            }
        }
    }

    _recordPattern(playerId, category, target, count) {
        const id = `pat_${playerId}_${category}_${target}`;
        const existing = this.patterns.get(id);
        if (existing) {
            existing.count = count;
            existing.lastUpdated = Date.now();
            existing.severity = count >= 10 ? 'critical' : count >= 5 ? 'high' : count >= 3 ? 'moderate' : 'low';
            return existing;
        }
        const severity = count >= 10 ? 'critical' : count >= 5 ? 'high' : count >= 3 ? 'moderate' : 'low';
        const pattern = {
            id, playerId, category, target, count, severity,
            firstSeen: Date.now(), lastUpdated: Date.now(),
        };
        this.patterns.set(id, pattern);
        this.stats.totalPatterns++;
        this._emit('patternDetected', pattern);
        if (this.patterns.size > this.config.maxPatterns) this._pruneOld();
        return pattern;
    }

    _pruneOld() {
        const sorted = [...this.patterns.values()].sort((a, b) => a.lastUpdated - b.lastUpdated);
        const toRemove = this.patterns.size - this.config.maxPatterns;
        for (let i = 0; i < toRemove; i++) this.patterns.delete(sorted[i].id);
    }

    getFailure(failureId) { return this.failures.get(failureId) || null; }

    getPattern(patternId) { return this.patterns.get(patternId) || null; }

    listPlayerFailures(playerId, category = null) {
        const list = this.playerFailures.get(playerId) || [];
        const failures = list.map(id => this.failures.get(id)).filter(Boolean);
        if (category) return failures.filter(f => f.category === category);
        return failures;
    }

    listPlayerPatterns(playerId) {
        return [...this.patterns.values()].filter(p => p.playerId === playerId);
    }

    dominantCategory(playerId) {
        const list = this.listPlayerFailures(playerId);
        if (list.length === 0) return null;
        const counts = {};
        for (const f of list) counts[f.category] = (counts[f.category] || 0) + 1;
        let maxCat = null, maxCount = 0;
        for (const [c, n] of Object.entries(counts)) {
            if (n > maxCount) { maxCount = n; maxCat = c; }
        }
        return maxCat;
    }

    report(playerId) {
        const failures = this.listPlayerFailures(playerId);
        const patterns = this.listPlayerPatterns(playerId);
        const catCounts = {};
        for (const c of FAILURE_CATEGORIES) catCounts[c] = 0;
        for (const f of failures) catCounts[f.category] = (catCounts[f.category] || 0) + 1;
        return {
            playerId,
            totalFailures: failures.length,
            categoryCounts: catCounts,
            totalPatterns: patterns.length,
            dominantCategory: this.dominantCategory(playerId),
        };
    }

    reset() {
        this.failures.clear();
        this.playerFailures.clear();
        this.patterns.clear();
        this.stats = { totalRecorded: 0, totalPatterns: 0 };
    }
}
