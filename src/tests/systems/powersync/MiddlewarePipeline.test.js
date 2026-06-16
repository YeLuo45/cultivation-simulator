/**
 * MiddlewarePipeline.test.js - 中间件管道测试
 * V1174 Round 44 Iter 17/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { MiddlewarePipeline, PIPELINE_STATES } from '../../../systems/powersync/MiddlewarePipeline.js';

describe('MiddlewarePipeline', () => {
    let mp;
    beforeEach(() => { mp = new MiddlewarePipeline(); });

    describe('exports', () => {
        it('should export PIPELINE_STATES', () => {
            expect(PIPELINE_STATES).toContain('idle');
            expect(PIPELINE_STATES).toContain('running');
            expect(PIPELINE_STATES).toContain('stopped');
        });
    });

    describe('constructor', () => {
        it('should start idle with count 0', () => {
            expect(mp.state).toBe('idle');
            expect(mp.count).toBe(0);
        });
        it('should have empty hooks', () => {
            expect(mp.hooks.size).toBe(0);
        });
    });

    describe('use', () => {
        it('should register a middleware and return id', () => {
            const id = mp.use(async () => {});
            expect(typeof id).toBe('string');
            expect(mp.count).toBe(1);
        });
        it('should throw on non-function', () => {
            expect(() => mp.use('nope')).toThrow();
            expect(() => mp.use(null)).toThrow();
        });
        it('should track count across many use calls', () => {
            mp.use(async () => {});
            mp.use(async () => {});
            mp.use(async () => {});
            expect(mp.count).toBe(3);
        });
        it('should accept name option', () => {
            const id = mp.use(async () => {}, 'auth');
            expect(mp.list().find(x => x.id === id).name).toBe('auth');
        });
    });

    describe('execute', () => {
        it('should run a single middleware', async () => {
            let ran = false;
            mp.use(async (ctx, next) => { ran = true; await next(); });
            await mp.execute({ payload: 1 });
            expect(ran).toBe(true);
        });
        it('should run middlewares in registration order', async () => {
            const order = [];
            mp.use(async (ctx, next) => { order.push(1); await next(); });
            mp.use(async (ctx, next) => { order.push(2); await next(); });
            mp.use(async (ctx, next) => { order.push(3); await next(); });
            await mp.execute();
            expect(order).toEqual([1, 2, 3]);
        });
        it('should share ctx across middlewares', async () => {
            mp.use(async (ctx, next) => { ctx.state.x = 1; await next(); });
            mp.use(async (ctx, next) => { ctx.state.x += 1; await next(); });
            mp.use(async (ctx, next) => { ctx.state.x += 1; await next(); });
            const result = await mp.execute();
            expect(result.state.x).toBe(3);
        });
        it('should support pre and post logic', async () => {
            const order = [];
            mp.use(async (ctx, next) => { order.push('pre1'); await next(); order.push('post1'); });
            mp.use(async (ctx, next) => { order.push('pre2'); await next(); order.push('post2'); });
            await mp.execute();
            expect(order).toEqual(['pre1', 'pre2', 'post2', 'post1']);
        });
        it('should return ctx with stopped=false when not aborted', async () => {
            mp.use(async (ctx, next) => { await next(); });
            const result = await mp.execute();
            expect(result.stopped).toBe(false);
        });
        it('should run no middleware when empty', async () => {
            const result = await mp.execute();
            expect(result.stopped).toBe(false);
        });
        it('should support ctx.metadata accumulation', async () => {
            mp.use(async (ctx, next) => { ctx.metadata.t1 = true; await next(); });
            mp.use(async (ctx, next) => { ctx.metadata.t2 = true; await next(); });
            const result = await mp.execute();
            expect(result.metadata.t1).toBe(true);
            expect(result.metadata.t2).toBe(true);
        });
    });

    describe('abort', () => {
        it('should stop subsequent middlewares when ctx.stopped set', async () => {
            const order = [];
            mp.use(async (ctx, next) => { order.push(1); ctx.stopped = true; await next(); });
            mp.use(async (ctx, next) => { order.push(2); await next(); });
            mp.use(async (ctx, next) => { order.push(3); await next(); });
            const result = await mp.execute();
            expect(order).toEqual([1]);
            expect(result.stopped).toBe(true);
        });
        it('should stop via explicit abort()', async () => {
            const order = [];
            mp.use(async (ctx, next) => { order.push(1); mp.abort('manual'); await next(); });
            mp.use(async (ctx, next) => { order.push(2); await next(); });
            const result = await mp.execute();
            expect(order).toEqual([1]);
            expect(result.stopped).toBe(true);
        });
        it('should record abortReason via abort()', async () => {
            mp.use(async (ctx, next) => { mp.abort('because'); await next(); });
            const result = await mp.execute();
            expect(result.abortReason).toBe('because');
        });
        it('should increment aborted stat', () => {
            mp.abort();
            expect(mp.stats.aborted).toBe(1);
        });
    });

    describe('reset', () => {
        it('should clear all middlewares', () => {
            mp.use(async () => {});
            mp.use(async () => {});
            expect(mp.count).toBe(2);
            mp.reset();
            expect(mp.count).toBe(0);
        });
        it('should return number removed', () => {
            mp.use(async () => {});
            mp.use(async () => {});
            expect(mp.reset()).toBe(2);
        });
        it('should return 0 when empty', () => {
            expect(mp.reset()).toBe(0);
        });
        it('should reset state to idle', () => {
            mp.use(async () => {});
            mp.reset();
            expect(mp.state).toBe('idle');
        });
    });

    describe('error handling', () => {
        it('should not crash when middleware throws synchronously', async () => {
            mp.use(async () => { throw new Error('boom'); });
            mp.use(async (ctx, next) => { ctx.state.after = true; await next(); });
            const result = await mp.execute();
            expect(result.state.after).toBe(true);
        });
        it('should not crash when middleware throws asynchronously', async () => {
            mp.use(async () => { return Promise.reject(new Error('async')); });
            const result = await mp.execute();
            expect(result.stopped).toBe(false);
        });
        it('should record error in stats', async () => {
            mp.use(async () => { throw new Error('x'); });
            await mp.execute();
            expect(mp.stats.errors).toBeGreaterThan(0);
        });
        it('should record error in ctx.metadata.lastError', async () => {
            mp.use(async () => { throw new Error('specific'); });
            const result = await mp.execute();
            expect(result.metadata.lastError).toBe('specific');
        });
        it('should continue with subsequent middlewares on error', async () => {
            const order = [];
            mp.use(async () => { order.push(1); throw new Error('x'); });
            mp.use(async () => { order.push(2); });
            mp.use(async () => { order.push(3); });
            await mp.execute();
            expect(order).toEqual([1, 2, 3]);
        });
    });

    describe('list/has', () => {
        it('list returns names/ids', () => {
            mp.use(async () => {}, 'one');
            mp.use(async () => {}, 'two');
            const l = mp.list();
            expect(l.length).toBe(2);
            expect(l[0].name).toBe('one');
        });
        it('has by id', () => {
            const id = mp.use(async () => {});
            expect(mp.has(id)).toBe(true);
        });
        it('has by name', () => {
            mp.use(async () => {}, 'auth');
            expect(mp.has('auth')).toBe(true);
        });
        it('has returns false when not present', () => {
            expect(mp.has('nope')).toBe(false);
        });
    });

    describe('hooks', () => {
        it('should emit registered on use', () => {
            let cnt = 0;
            mp.registerHook('registered', () => cnt++);
            mp.use(async () => {});
            mp.use(async () => {});
            expect(cnt).toBe(2);
        });
        it('should emit start and end on execute', async () => {
            let started = false;
            let ended = false;
            mp.registerHook('start', () => { started = true; });
            mp.registerHook('end', () => { ended = true; });
            mp.use(async () => {});
            await mp.execute();
            expect(started).toBe(true);
            expect(ended).toBe(true);
        });
        it('should emit aborted', () => {
            let fired = false;
            mp.registerHook('aborted', () => { fired = true; });
            mp.abort();
            expect(fired).toBe(true);
        });
        it('should emit reset', () => {
            let fired = false;
            mp.registerHook('reset', () => { fired = true; });
            mp.use(async () => {});
            mp.reset();
            expect(fired).toBe(true);
        });
        it('should swallow hook errors', async () => {
            mp.registerHook('start', () => { throw new Error('x'); });
            mp.use(async () => {});
            await mp.execute();
            expect(true).toBe(true);
        });
    });

    describe('stats', () => {
        it('should track registered count', () => {
            mp.use(async () => {});
            mp.use(async () => {});
            expect(mp.stats.registered).toBe(2);
        });
        it('should track executed count', async () => {
            mp.use(async () => {});
            await mp.execute();
            await mp.execute();
            expect(mp.stats.executed).toBe(2);
        });
        it('getStats includes count and state', async () => {
            mp.use(async () => {});
            const s = mp.getStats();
            expect(s.count).toBe(1);
            expect(s.state).toBe('idle');
        });
    });
});
