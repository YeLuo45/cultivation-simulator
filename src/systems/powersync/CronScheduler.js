/**
 * CronScheduler.js - 定时调度器 (interval + cron 5字段 + missed-job 立即执行)
 * V1175 Round 44 Iter 18/30 Direction A PowerSync Federation (ruflo)
 * 灵感: ruflo scheduler with cron parser + tick-based missed-job recovery
 */

export const SCHEDULE_TYPES = ['interval', 'cron'];
export const CRON_FIELDS = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

/**
 * Parse a single cron field to a list of integer values.
 * Supports: star, step (slash N), and integer N (minute 0-59, hour 0-23, dom 1-31, month 1-12, dow 0-6)
 */
function parseCronField(field, min, max) {
    if (field === '*') {
        const out = [];
        for (let i = min; i <= max; i++) out.push(i);
        return out;
    }
    if (field.startsWith('*/')) {
        const step = parseInt(field.slice(2), 10);
        if (isNaN(step) || step <= 0) return [];
        const out = [];
        for (let i = min; i <= max; i += step) out.push(i);
        return out;
    }
    const n = parseInt(field, 10);
    if (isNaN(n)) return [];
    if (n < min || n > max) return [];
    return [n];
}

export class CronScheduler {
    constructor(config = {}) {
        this.config = {
            missedJobPolicy: 'run', // 'run' | 'skip'
            ...config,
        };
        this.jobs = new Map(); // id -> job
        this.hooks = new Map();
        this.stats = { fired: 0, missed: 0, registered: 0, cancelled: 0, errors: 0 };
        // for test-friendly tick advancement: when set, ignore real Date.now()
        this._virtualNow = null;
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    setVirtualTime(t) { this._virtualNow = t; }
    _now() { return this._virtualNow !== null ? this._virtualNow : Date.now(); }

    schedule(id, type, value, fn) {
        if (typeof id !== 'string' || !id) {
            this.stats.errors++;
            throw new Error('schedule: id must be non-empty string');
        }
        if (typeof fn !== 'function') {
            this.stats.errors++;
            throw new Error('schedule: fn must be a function');
        }
        if (!SCHEDULE_TYPES.includes(type)) {
            this.stats.errors++;
            throw new Error(`schedule: unknown type ${type}`);
        }
        if (this.jobs.has(id)) {
            this.stats.errors++;
            throw new Error(`schedule: duplicate id ${id}`);
        }
        let job;
        if (type === 'interval') {
            const ms = Number(value);
            if (isNaN(ms) || ms <= 0) {
                this.stats.errors++;
                throw new Error('schedule: interval value must be positive number');
            }
            job = {
                id, type, value: ms, fn,
                lastRun: null,
                nextRun: this._now() + ms,
            };
        } else {
            // cron
            const expr = String(value).trim();
            const parts = expr.split(/\s+/);
            if (parts.length !== 5) {
                this.stats.errors++;
                throw new Error('schedule: cron must have 5 fields');
            }
            const [m, h, dom, mon, dow] = parts;
            const ranges = [
                [0, 59], // minute
                [0, 23], // hour
                [1, 31], // dayOfMonth
                [1, 12], // month
                [0, 6],  // dayOfWeek
            ];
            const fields = CRON_FIELDS.map((_, i) =>
                parseCronField(parts[i], ranges[i][0], ranges[i][1])
            );
            if (fields.some(f => f.length === 0)) {
                this.stats.errors++;
                throw new Error(`schedule: invalid cron field in ${expr}`);
            }
            job = {
                id, type, value: expr, fn,
                fields,
                lastRun: null,
                nextRun: this._nextCronTime(this._now(), fields),
            };
        }
        this.jobs.set(id, job);
        this.stats.registered++;
        this._emit('scheduled', { id, type, value: job.value });
        return id;
    }

    _nextCronTime(fromMs, fieldsArr) {
        // simple linear scan up to 7 days to find next match
        const start = new Date(fromMs);
        // Round up to next minute
        start.setSeconds(0, 0);
        start.setMinutes(start.getMinutes() + 1);
        const max = 7 * 24 * 60 * 60 * 1000;
        const end = fromMs + max;
        const fields = fieldsArr || this._currentJobFields;
        if (!fields) return null;
        let t = start.getTime();
        while (t <= end) {
            const d = new Date(t);
            const min = d.getMinutes();
            const hr = d.getHours();
            const dom = d.getDate();
            const mon = d.getMonth() + 1;
            const dow = d.getDay();
            const [fMin, fHr, fDom, fMon, fDow] = fields;
            if (
                fMin.includes(min) &&
                fHr.includes(hr) &&
                fDom.includes(dom) &&
                fMon.includes(mon) &&
                fDow.includes(dow)
            ) {
                return t;
            }
            t += 60 * 1000; // step 1 minute
        }
        return null;
    }

    cancel(id) {
        if (!this.jobs.has(id)) return false;
        this.jobs.delete(id);
        this.stats.cancelled++;
        this._emit('cancelled', { id });
        return true;
    }

    tick(now) {
        const t = (typeof now === 'number') ? now : this._now();
        let fired = 0;
        let missed = 0;
        for (const job of this.jobs.values()) {
            if (job.type === 'interval') {
                let count = 0;
                while (job.nextRun !== null && job.nextRun <= t) {
                    count++;
                    job.nextRun = job.nextRun + job.value;
                }
                if (count > 0) {
                    if (this.config.missedJobPolicy === 'run') {
                        for (let i = 0; i < count; i++) {
                            try {
                                job.fn({ scheduled: job.lastRun, tickAt: t, fireCount: i + 1 });
                                this.stats.fired++;
                                fired++;
                                this._emit('fired', { id: job.id, count: i + 1 });
                            } catch (err) {
                                this.stats.errors++;
                                this._emit('error', { id: job.id, error: err && err.message });
                            }
                        }
                        if (count > 1) {
                            this.stats.missed += (count - 1);
                            missed += (count - 1);
                        }
                    } else {
                        // skip: only fire once
                        try {
                            job.fn({ scheduled: job.lastRun, tickAt: t, fireCount: 1, skipped: count - 1 });
                            this.stats.fired++;
                            fired++;
                            this._emit('fired', { id: job.id, count: 1, skipped: count - 1 });
                        } catch (err) {
                            this.stats.errors++;
                            this._emit('error', { id: job.id, error: err && err.message });
                        }
                        this.stats.missed += (count - 1);
                        missed += (count - 1);
                    }
                    job.lastRun = t;
                }
            } else {
                // cron
                let count = 0;
                while (job.nextRun !== null && job.nextRun <= t) {
                    count++;
                    job.nextRun = this._nextCronTime(job.nextRun, job.fields);
                }
                if (count > 0) {
                    if (this.config.missedJobPolicy === 'run') {
                        for (let i = 0; i < count; i++) {
                            try {
                                job.fn({ scheduled: job.lastRun, tickAt: t, fireCount: i + 1 });
                                this.stats.fired++;
                                fired++;
                                this._emit('fired', { id: job.id, count: i + 1 });
                            } catch (err) {
                                this.stats.errors++;
                                this._emit('error', { id: job.id, error: err && err.message });
                            }
                        }
                        if (count > 1) {
                            this.stats.missed += (count - 1);
                            missed += (count - 1);
                        }
                    } else {
                        try {
                            job.fn({ scheduled: job.lastRun, tickAt: t, fireCount: 1, skipped: count - 1 });
                            this.stats.fired++;
                            fired++;
                            this._emit('fired', { id: job.id, count: 1, skipped: count - 1 });
                        } catch (err) {
                            this.stats.errors++;
                            this._emit('error', { id: job.id, error: err && err.message });
                        }
                        this.stats.missed += (count - 1);
                        missed += (count - 1);
                    }
                    job.lastRun = t;
                }
            }
        }
        return { fired, missed };
    }

    list() {
        return Array.from(this.jobs.values()).map(j => ({
            id: j.id,
            type: j.type,
            value: j.value,
            lastRun: j.lastRun,
            nextRun: j.nextRun,
        }));
    }

    has(id) { return this.jobs.has(id); }

    get(id) {
        const j = this.jobs.get(id);
        if (!j) return null;
        return { id: j.id, type: j.type, value: j.value, lastRun: j.lastRun, nextRun: j.nextRun };
    }

    getStats() { return { ...this.stats, jobs: this.jobs.size }; }
}

if (typeof globalThis !== 'undefined') {
    globalThis.CronScheduler = CronScheduler;
    globalThis.SCHEDULE_TYPES = SCHEDULE_TYPES;
    globalThis.CRON_FIELDS = CRON_FIELDS;
}
