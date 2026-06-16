/**
 * SyncLearner.test.js - 学习器测试
 * V1182 Round 44 Iter 25/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    SyncLearner,
    LEARNER_OPS,
    RECOMMENDATION_KINDS,
} from '../../../systems/powersync/SyncLearner.js';

describe('SyncLearner', () => {
    let l;
    beforeEach(() => { l = new SyncLearner({ hotKeyThreshold: 5, windowSize: 50 }); });

    describe('exports', () => {
        it('LEARNER_OPS includes read/write/sync', () => {
            expect(LEARNER_OPS).toContain('read');
            expect(LEARNER_OPS).toContain('write');
            expect(LEARNER_OPS).toContain('sync');
        });
        it('RECOMMENDATION_KINDS includes cache/batch', () => {
            expect(RECOMMENDATION_KINDS).toContain('cache');
            expect(RECOMMENDATION_KINDS).toContain('batch');
        });
    });

    describe('constructor', () => {
        it('starts empty', () => {
            expect(l.events.length).toBe(0);
            expect(l.totalObserved).toBe(0);
        });
        it('accepts config', () => {
            const x = new SyncLearner({ hotKeyThreshold: 20, windowSize: 200 });
            expect(x.config.hotKeyThreshold).toBe(20);
            expect(x.config.windowSize).toBe(200);
        });
    });

    describe('observe', () => {
        it('adds event', () => {
            expect(l.observe({ key: 'k1', op: 'read' })).toBe(true);
            expect(l.events.length).toBe(1);
        });
        it('fills defaults', () => {
            l.observe({ key: 'k1' });
            const e = l.events[0];
            expect(e.op).toBe('read');
            expect(e.latency).toBe(0);
            expect(e.ts).toBeGreaterThan(0);
        });
        it('rejects non-object', () => {
            expect(l.observe(null)).toBe(false);
            expect(l.observe('x')).toBe(false);
        });
        it('increments totalObserved', () => {
            l.observe({ key: 'k1', op: 'read' });
            l.observe({ key: 'k2', op: 'read' });
            expect(l.totalObserved).toBe(2);
        });
        it('respects windowSize', () => {
            const x = new SyncLearner({ windowSize: 3 });
            for (let i = 0; i < 10; i++) x.observe({ key: `k${i}`, op: 'read' });
            expect(x.events.length).toBe(3);
            expect(x.totalObserved).toBe(10);
        });
        it('preserves latency', () => {
            l.observe({ key: 'k', op: 'read', latency: 250 });
            expect(l.events[0].latency).toBe(250);
        });
    });

    describe('getPatterns', () => {
        it('byKey counts', () => {
            l.observe({ key: 'a', op: 'read' });
            l.observe({ key: 'a', op: 'read' });
            l.observe({ key: 'b', op: 'read' });
            const p = l.getPatterns();
            expect(p.byKey.get('a')).toBe(2);
            expect(p.byKey.get('b')).toBe(1);
        });
        it('byOp counts', () => {
            l.observe({ key: 'a', op: 'read' });
            l.observe({ key: 'a', op: 'write' });
            l.observe({ key: 'a', op: 'write' });
            const p = l.getPatterns();
            expect(p.byOp.get('read')).toBe(1);
            expect(p.byOp.get('write')).toBe(2);
        });
        it('byLatencyBucket', () => {
            l.observe({ key: 'a', op: 'read', latency: 10 });
            l.observe({ key: 'a', op: 'read', latency: 100 });
            l.observe({ key: 'a', op: 'read', latency: 600 });
            const p = l.getPatterns();
            expect(p.byLatencyBucket.get('fast')).toBe(1);
            expect(p.byLatencyBucket.get('normal')).toBe(1);
            expect(p.byLatencyBucket.get('very_slow')).toBe(1);
        });
        it('empty returns empty maps', () => {
            const p = l.getPatterns();
            expect(p.byKey.size).toBe(0);
            expect(p.byOp.size).toBe(0);
        });
    });

    describe('getHotKeys', () => {
        it('returns above threshold', () => {
            for (let i = 0; i < 6; i++) l.observe({ key: 'hot', op: 'read' });
            l.observe({ key: 'cold', op: 'read' });
            const hot = l.getHotKeys();
            expect(hot.length).toBe(1);
            expect(hot[0].key).toBe('hot');
            expect(hot[0].count).toBe(6);
        });
        it('returns empty when none', () => {
            for (let i = 0; i < 3; i++) l.observe({ key: 'a', op: 'read' });
            expect(l.getHotKeys().length).toBe(0);
        });
        it('sorts by count desc', () => {
            for (let i = 0; i < 6; i++) l.observe({ key: 'b', op: 'read' });
            for (let i = 0; i < 10; i++) l.observe({ key: 'a', op: 'read' });
            const hot = l.getHotKeys();
            expect(hot[0].key).toBe('a');
            expect(hot[1].key).toBe('b');
        });
        it('updates hotKeys stat', () => {
            for (let i = 0; i < 6; i++) l.observe({ key: 'a', op: 'read' });
            l.getHotKeys();
            expect(l.stats.hotKeys).toBe(1);
        });
    });

    describe('getRecommendations', () => {
        it('cache recommendation for hot key', () => {
            for (let i = 0; i < 6; i++) l.observe({ key: 'a', op: 'read' });
            const r = l.getRecommendations();
            expect(r.some((x) => x.kind === 'cache' && x.target === 'a')).toBe(true);
        });
        it('batch recommendation for write-heavy', () => {
            for (let i = 0; i < 8; i++) l.observe({ key: 'k', op: 'write' });
            for (let i = 0; i < 2; i++) l.observe({ key: 'k', op: 'read' });
            const r = l.getRecommendations();
            expect(r.some((x) => x.kind === 'batch')).toBe(true);
        });
        it('compress recommendation for high latency', () => {
            l.observe({ key: 'slow', op: 'read', latency: 9999 });
            const r = l.getRecommendations();
            expect(r.some((x) => x.kind === 'compress' && x.target === 'slow')).toBe(true);
        });
        it('throttle recommendation for very_slow ratio', () => {
            for (let i = 0; i < 5; i++) l.observe({ key: 'k', op: 'read', latency: 9000 });
            l.observe({ key: 'k', op: 'read', latency: 10 });
            const r = l.getRecommendations();
            expect(r.some((x) => x.kind === 'throttle')).toBe(true);
        });
        it('observe recommendation for single observation', () => {
            l.observe({ key: 'unique', op: 'read' });
            const r = l.getRecommendations();
            expect(r.some((x) => x.kind === 'observe' && x.target === 'unique')).toBe(true);
        });
        it('empty events yields no recommendations (besides observe)', () => {
            // empty
            const r = l.getRecommendations();
            // only observe for nothing — no events means none
            expect(r.length).toBe(0);
        });
        it('updates recommendations stat', () => {
            l.observe({ key: 'a', op: 'read' });
            l.getRecommendations();
            expect(l.stats.recommendations).toBeGreaterThan(0);
        });
    });

    describe('getStats', () => {
        it('returns aggregate', () => {
            l.observe({ key: 'a', op: 'read' });
            l.observe({ key: 'b', op: 'write' });
            const s = l.getStats();
            expect(s.total).toBe(2);
            expect(s.unique).toBe(2);
            expect(s.window).toBe(2);
        });
    });

    describe('config setters', () => {
        it('setHotKeyThreshold valid', () => {
            expect(l.setHotKeyThreshold(20)).toBe(true);
            expect(l.config.hotKeyThreshold).toBe(20);
        });
        it('setHotKeyThreshold invalid', () => {
            expect(l.setHotKeyThreshold(0)).toBe(false);
            expect(l.setHotKeyThreshold(-1)).toBe(false);
        });
        it('setWindowSize valid trims', () => {
            for (let i = 0; i < 20; i++) l.observe({ key: `k${i}`, op: 'read' });
            l.setWindowSize(5);
            expect(l.events.length).toBe(5);
        });
        it('setWindowSize invalid', () => {
            expect(l.setWindowSize(0)).toBe(false);
        });
        it('setLatencyThreshold valid', () => {
            expect(l.setLatencyThreshold(1000)).toBe(true);
        });
        it('setLatencyThreshold invalid', () => {
            expect(l.setLatencyThreshold(-1)).toBe(false);
        });
    });

    describe('reset', () => {
        it('clears events and stats', () => {
            l.observe({ key: 'a', op: 'read' });
            l.observe({ key: 'a', op: 'read' });
            l.reset();
            expect(l.events.length).toBe(0);
            expect(l.totalObserved).toBe(0);
            expect(l.stats.observed).toBe(0);
        });
    });

    describe('queries', () => {
        it('listEvents returns copy', () => {
            l.observe({ key: 'a', op: 'read' });
            const list = l.listEvents();
            list.length = 0;
            expect(l.events.length).toBe(1);
        });
        it('listOps returns LEARNER_OPS copy', () => {
            const list = l.listOps();
            expect(list).toContain('read');
            list.push('xxx');
            expect(l.listOps()).toEqual(LEARNER_OPS);
        });
    });

    describe('hooks', () => {
        it('emits observed', () => {
            let captured = null;
            l.registerHook('observed', (e) => { captured = e; });
            l.observe({ key: 'a', op: 'read' });
            expect(captured.key).toBe('a');
        });
        it('hook errors swallowed', () => {
            l.registerHook('observed', () => { throw new Error('x'); });
            expect(() => l.observe({ key: 'a', op: 'read' })).not.toThrow();
        });
    });
});
