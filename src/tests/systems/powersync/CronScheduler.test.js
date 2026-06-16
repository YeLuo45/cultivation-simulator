/**
 * CronScheduler.test.js - 定时调度器测试
 * V1175 Round 44 Iter 18/30
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CronScheduler, SCHEDULE_TYPES, CRON_FIELDS } from '../../../systems/powersync/CronScheduler.js';

describe('CronScheduler', () => {
    let cs;
    beforeEach(() => { cs = new CronScheduler(); });

    describe('exports', () => {
        it('should export SCHEDULE_TYPES', () => {
            expect(SCHEDULE_TYPES).toContain('interval');
            expect(SCHEDULE_TYPES).toContain('cron');
        });
        it('should export CRON_FIELDS', () => {
            expect(CRON_FIELDS).toContain('minute');
            expect(CRON_FIELDS).toContain('hour');
            expect(CRON_FIELDS.length).toBe(5);
        });
    });

    describe('constructor', () => {
        it('should default missedJobPolicy to run', () => {
            expect(cs.config.missedJobPolicy).toBe('run');
        });
        it('should accept custom policy', () => {
            const x = new CronScheduler({ missedJobPolicy: 'skip' });
            expect(x.config.missedJobPolicy).toBe('skip');
        });
        it('should start with 0 jobs', () => {
            expect(cs.list().length).toBe(0);
        });
        it('should start with zero stats', () => {
            expect(cs.stats.fired).toBe(0);
            expect(cs.stats.missed).toBe(0);
        });
    });

    describe('schedule interval', () => {
        it('should schedule an interval job', () => {
            const id = cs.schedule('j1', 'interval', 1000, () => {});
            expect(id).toBe('j1');
            expect(cs.has('j1')).toBe(true);
        });
        it('should throw on duplicate id', () => {
            cs.schedule('j1', 'interval', 1000, () => {});
            expect(() => cs.schedule('j1', 'interval', 1000, () => {})).toThrow();
        });
        it('should throw on non-positive interval', () => {
            expect(() => cs.schedule('j1', 'interval', 0, () => {})).toThrow();
            expect(() => cs.schedule('j1', 'interval', -1, () => {})).toThrow();
        });
        it('should throw on NaN interval', () => {
            expect(() => cs.schedule('j1', 'interval', 'abc', () => {})).toThrow();
        });
        it('should throw on unknown type', () => {
            expect(() => cs.schedule('j1', 'weird', 1, () => {})).toThrow();
        });
        it('should throw on non-function fn', () => {
            expect(() => cs.schedule('j1', 'interval', 1000, 'nope')).toThrow();
        });
        it('should throw on empty id', () => {
            expect(() => cs.schedule('', 'interval', 1000, () => {})).toThrow();
        });
        it('should increment registered stat', () => {
            cs.schedule('j1', 'interval', 1000, () => {});
            expect(cs.stats.registered).toBe(1);
        });
    });

    describe('schedule cron', () => {
        it('should schedule a cron job', () => {
            cs.schedule('c1', 'cron', '* * * * *', () => {});
            expect(cs.has('c1')).toBe(true);
        });
        it('should throw on invalid field count', () => {
            expect(() => cs.schedule('c1', 'cron', '* * *', () => {})).toThrow();
        });
        it('should throw on invalid field value', () => {
            expect(() => cs.schedule('c1', 'cron', 'abc * * * *', () => {})).toThrow();
        });
        it('should throw on out-of-range integer', () => {
            expect(() => cs.schedule('c1', 'cron', '99 * * * *', () => {})).toThrow();
        });
        it('should throw on invalid step', () => {
            expect(() => cs.schedule('c1', 'cron', '*/0 * * * *', () => {})).toThrow();
        });
        it('should accept */N step syntax', () => {
            cs.schedule('c1', 'cron', '*/15 * * * *', () => {});
            expect(cs.has('c1')).toBe(true);
        });
        it('should accept integer field', () => {
            cs.schedule('c1', 'cron', '0 12 * * *', () => {});
            expect(cs.has('c1')).toBe(true);
        });
    });

    describe('cancel', () => {
        it('should cancel a job', () => {
            cs.schedule('j1', 'interval', 1000, () => {});
            expect(cs.cancel('j1')).toBe(true);
            expect(cs.has('j1')).toBe(false);
        });
        it('should return false for unknown id', () => {
            expect(cs.cancel('nope')).toBe(false);
        });
        it('should increment cancelled stat', () => {
            cs.schedule('j1', 'interval', 1000, () => {});
            cs.cancel('j1');
            expect(cs.stats.cancelled).toBe(1);
        });
    });

    describe('tick - interval', () => {
        it('should fire a job whose nextRun has passed', () => {
            const fn = vi.fn();
            cs.setVirtualTime(0);
            cs.schedule('j1', 'interval', 100, fn);
            // first schedule set nextRun = 0 + 100 = 100
            cs.tick(150);
            expect(fn).toHaveBeenCalledTimes(1);
        });
        it('should not fire before nextRun', () => {
            const fn = vi.fn();
            cs.setVirtualTime(0);
            cs.schedule('j1', 'interval', 100, fn);
            cs.tick(50);
            expect(fn).toHaveBeenCalledTimes(0);
        });
        it('should fire multiple missed jobs immediately (run policy)', () => {
            const fn = vi.fn();
            cs.setVirtualTime(0);
            cs.schedule('j1', 'interval', 100, fn);
            // nextRun = 100, tick 350 → 100,200,300
            cs.tick(350);
            expect(fn).toHaveBeenCalledTimes(3);
            expect(cs.stats.missed).toBe(2);
        });
        it('should fire only once when policy=skip', () => {
            const fn = vi.fn();
            const x = new CronScheduler({ missedJobPolicy: 'skip' });
            x.setVirtualTime(0);
            x.schedule('j1', 'interval', 100, fn);
            x.tick(350);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(x.stats.missed).toBe(2);
        });
        it('should update nextRun after firing', () => {
            const fn = vi.fn();
            cs.setVirtualTime(0);
            cs.schedule('j1', 'interval', 100, fn);
            cs.tick(150);
            const job = cs.get('j1');
            expect(job.nextRun).toBe(200);
        });
        it('should isolate errors and continue', () => {
            const fn1 = vi.fn(() => { throw new Error('x'); });
            const fn2 = vi.fn();
            cs.setVirtualTime(0);
            cs.schedule('a', 'interval', 100, fn1);
            cs.schedule('b', 'interval', 100, fn2);
            cs.tick(150);
            expect(fn2).toHaveBeenCalledTimes(1);
            expect(cs.stats.errors).toBe(1);
        });
        it('should return fired/missed summary', () => {
            const fn = vi.fn();
            cs.setVirtualTime(0);
            cs.schedule('j1', 'interval', 100, fn);
            const r = cs.tick(350);
            expect(r.fired).toBe(3);
            expect(r.missed).toBe(2);
        });
    });

    describe('tick - cron', () => {
        it('should fire a cron job at matching time', () => {
            const fn = vi.fn();
            // pick a time we control
            const base = new Date(2026, 0, 1, 0, 0, 0, 0).getTime();
            cs.setVirtualTime(base);
            cs.schedule('c1', 'cron', '0 * * * *', fn); // every hour
            // tick 1 minute in: should not fire
            cs.tick(base + 60 * 1000);
            expect(fn).toHaveBeenCalledTimes(0);
            // tick 1 hour in: should fire
            cs.tick(base + 60 * 60 * 1000);
            expect(fn).toHaveBeenCalledTimes(1);
        });
        it('should not fire a cron job with non-matching field', () => {
            const fn = vi.fn();
            const base = new Date(2026, 0, 1, 0, 0, 0, 0).getTime();
            cs.setVirtualTime(base);
            cs.schedule('c1', 'cron', '30 1 * * *', fn);
            cs.tick(base + 60 * 60 * 1000); // 1am on the hour, not 1:30
            expect(fn).toHaveBeenCalledTimes(0);
        });
        it('should handle missed cron jobs', () => {
            const fn = vi.fn();
            const base = new Date(2026, 0, 1, 0, 0, 0, 0).getTime();
            cs.setVirtualTime(base);
            cs.schedule('c1', 'cron', '0 * * * *', fn);
            // tick 3 hours in: should fire 3 times
            cs.tick(base + 3 * 60 * 60 * 1000);
            expect(fn).toHaveBeenCalledTimes(3);
            expect(cs.stats.missed).toBe(2);
        });
    });

    describe('list/has/get', () => {
        it('list returns all jobs', () => {
            cs.schedule('a', 'interval', 100, () => {});
            cs.schedule('b', 'cron', '0 * * * *', () => {});
            expect(cs.list().length).toBe(2);
        });
        it('list includes type and value', () => {
            cs.schedule('a', 'interval', 100, () => {});
            const l = cs.list();
            expect(l[0].type).toBe('interval');
            expect(l[0].value).toBe(100);
        });
        it('has true for known id', () => {
            cs.schedule('a', 'interval', 100, () => {});
            expect(cs.has('a')).toBe(true);
        });
        it('has false for unknown', () => {
            expect(cs.has('nope')).toBe(false);
        });
        it('get returns null for unknown', () => {
            expect(cs.get('nope')).toBeNull();
        });
        it('get returns job snapshot', () => {
            cs.schedule('a', 'interval', 100, () => {});
            const j = cs.get('a');
            expect(j.type).toBe('interval');
            expect(j.id).toBe('a');
        });
    });

    describe('hooks', () => {
        it('should emit scheduled', () => {
            let captured = null;
            cs.registerHook('scheduled', (p) => { captured = p; });
            cs.schedule('a', 'interval', 100, () => {});
            expect(captured.id).toBe('a');
        });
        it('should emit fired', () => {
            let captured = null;
            cs.registerHook('fired', (p) => { captured = p; });
            cs.setVirtualTime(0);
            cs.schedule('a', 'interval', 100, () => {});
            cs.tick(200);
            expect(captured.id).toBe('a');
        });
        it('should emit cancelled', () => {
            let captured = null;
            cs.registerHook('cancelled', (p) => { captured = p; });
            cs.schedule('a', 'interval', 100, () => {});
            cs.cancel('a');
            expect(captured.id).toBe('a');
        });
        it('should swallow hook errors', () => {
            cs.registerHook('scheduled', () => { throw new Error('x'); });
            expect(() => cs.schedule('a', 'interval', 100, () => {})).not.toThrow();
        });
    });

    describe('stats', () => {
        it('should track fired', () => {
            cs.setVirtualTime(0);
            cs.schedule('a', 'interval', 100, () => {});
            cs.tick(150);
            expect(cs.stats.fired).toBe(1);
        });
        it('getStats includes jobs count', () => {
            cs.schedule('a', 'interval', 100, () => {});
            cs.schedule('b', 'interval', 100, () => {});
            expect(cs.getStats().jobs).toBe(2);
        });
    });
});
