/**
 * ArrayTester.js - 符阵测试
 * V1151 Round 43 Iter 24/30
 */
export const TEST_STATUS = ['queued', 'testing', 'passed', 'failed', 'inconclusive'];
export const TEST_TYPES = ['stress', 'integration', 'unit', 'regression', 'benchmark'];

export class ArrayTester {
    constructor(config = {}) {
        this.config = { ...config };
        this.tests = new Map();   // tid -> { id, array, type, status, score, startedAt, endedAt }
        this.hooks = new Map();
        this.stats = { total: 0, totalPassed: 0, totalFailed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `at_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    queue(array, type = 'unit') {
        if (!array) return null;
        if (!TEST_TYPES.includes(type)) type = 'unit';
        const id = this._newId();
        const t = { id, array, type, status: 'queued', score: 0, startedAt: null, endedAt: null };
        this.tests.set(id, t);
        this.stats.total++;
        return t;
    }
    get(id) { return this.tests.get(id) || null; }
    listAll() { return [...this.tests.values()]; }
    listByArray(arr) { return this.tests.get ? this.listAll().filter(t => t.array === arr) : this.listAll(); }
    // Fallback safe
    _listByArray(arr) { return this.listAll().filter(t => t.array === arr); }
    listByStatus(st) { return this.listAll().filter(t => t.status === st); }
    listByType(type) { return this.listAll().filter(t => t.type === type); }
    listActive() { return this.listByStatus('testing'); }
    listPassed() { return this.listByStatus('passed'); }

    setStatus(id, status) {
        const t = this.tests.get(id);
        if (!t) return false;
        if (!TEST_STATUS.includes(status)) return false;
        t.status = status;
        if (status === 'passed') {
            t.endedAt = Date.now();
            this.stats.totalPassed++;
            this._emit('passed', t);
        } else if (status === 'failed') {
            t.endedAt = Date.now();
            this.stats.totalFailed++;
        } else if (status === 'testing') {
            t.startedAt = Date.now();
        }
        return true;
    }
    start(id) { return this.setStatus(id, 'testing'); }
    pass(id) { return this.setStatus(id, 'passed'); }
    fail(id) { return this.setStatus(id, 'failed'); }
    inconclusive(id) { return this.setStatus(id, 'inconclusive'); }
    setScore(id, score) {
        const t = this.tests.get(id);
        if (!t) return false;
        t.score = Math.max(0, Math.min(100, score));
        return true;
    }
    setType(id, type) {
        const t = this.tests.get(id);
        if (!t) return false;
        if (!TEST_TYPES.includes(type)) return false;
        t.type = type;
        return true;
    }
    isActive(id) { return this.tests.get(id)?.status === 'testing'; }
    isPassed(id) { return this.tests.get(id)?.status === 'passed'; }
    isFailed(id) { return this.tests.get(id)?.status === 'failed'; }
    isInconclusive(id) { return this.tests.get(id)?.status === 'inconclusive'; }
    scoreOf(id) { return this.tests.get(id)?.score || 0; }
    typeOf(id) { return this.tests.get(id)?.type || null; }
    duration(id) {
        const t = this.tests.get(id);
        if (!t || !t.endedAt) return 0;
        return t.endedAt - t.startedAt;
    }
    passRate() { return this.stats.total === 0 ? 0 : this.stats.totalPassed / this.stats.total; }
    arrayCount(arr) { return this._listByArray(arr).length; }
    averageScore() {
        if (this.tests.size === 0) return 0;
        return this.listAll().reduce((s, t) => s + t.score, 0) / this.tests.size;
    }
    countByType() {
        const c = {};
        for (const t of TEST_TYPES) c[t] = 0;
        for (const te of this.tests.values()) c[te.type] = (c[te.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalPassed: this.stats.totalPassed, totalFailed: this.stats.totalFailed, passRate: this.passRate() }; }
    reset() { this.tests.clear(); this.stats = { total: 0, totalPassed: 0, totalFailed: 0 }; }
}
