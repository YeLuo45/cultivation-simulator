/**
 * EvolverEngine.test.js - 演化引擎测试
 * V1184 Round 45 Iter 28/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    EvolverEngine,
    EVOLVE_STRATEGIES,
} from '../../../systems/powersync/EvolverEngine.js';

describe('EvolverEngine', () => {
    let e;
    beforeEach(() => {
        e = new EvolverEngine({ mutationRate: 0.1, population: 5 });
        e.registerParam('batchSize',    { min: 1,   max: 100, current: 10 });
        e.registerParam('threshold',    { min: 0,   max: 1,   current: 0.5 });
        e.registerParam('retryCount',   { min: 1,   max: 10,  current: 3 });
    });

    describe('exports', () => {
        it('EVOLVE_STRATEGIES contains explore/exploit/mutate', () => {
            expect(EVOLVE_STRATEGIES).toContain('explore');
            expect(EVOLVE_STRATEGIES).toContain('exploit');
            expect(EVOLVE_STRATEGIES).toContain('mutate');
        });
    });

    describe('constructor', () => {
        it('starts empty history', () => {
            const x = new EvolverEngine();
            expect(x.history.length).toBe(0);
            expect(x.generation).toBe(0);
        });
        it('accepts config', () => {
            const x = new EvolverEngine({ mutationRate: 0.2, population: 8 });
            expect(x.config.mutationRate).toBe(0.2);
            expect(x.config.population).toBe(8);
        });
    });

    describe('registerParam', () => {
        it('valid param', () => {
            const x = new EvolverEngine();
            expect(x.registerParam('a', { min: 0, max: 10, current: 5 })).toBe(true);
            expect(x.params.size).toBe(1);
        });
        it('rejects empty name', () => {
            const x = new EvolverEngine();
            expect(x.registerParam('', { min: 0, max: 1, current: 0.5 })).toBe(false);
            expect(x.registerParam(null, { min: 0, max: 1, current: 0.5 })).toBe(false);
        });
        it('rejects invalid spec', () => {
            const x = new EvolverEngine();
            expect(x.registerParam('a', null)).toBe(false);
            expect(x.registerParam('a', {})).toBe(false);
        });
        it('rejects min >= max', () => {
            const x = new EvolverEngine();
            expect(x.registerParam('a', { min: 5, max: 5, current: 5 })).toBe(false);
            expect(x.registerParam('a', { min: 5, max: 4, current: 4 })).toBe(false);
        });
        it('rejects current out of range', () => {
            const x = new EvolverEngine();
            expect(x.registerParam('a', { min: 0, max: 10, current: -1 })).toBe(false);
            expect(x.registerParam('a', { min: 0, max: 10, current: 11 })).toBe(false);
        });
        it('rejects non-numeric values', () => {
            const x = new EvolverEngine();
            expect(x.registerParam('a', { min: 'x', max: 10, current: 5 })).toBe(false);
            expect(x.registerParam('a', { min: 0, max: 10, current: 'x' })).toBe(false);
        });
        it('unregisterParam removes', () => {
            const x = new EvolverEngine();
            x.registerParam('a', { min: 0, max: 10, current: 5 });
            expect(x.unregisterParam('a')).toBe(true);
            expect(x.params.size).toBe(0);
        });
        it('hasParam', () => {
            expect(e.hasParam('batchSize')).toBe(true);
            expect(e.hasParam('zzz')).toBe(false);
        });
        it('getParamSpec', () => {
            const s = e.getParamSpec('batchSize');
            expect(s.min).toBe(1);
            expect(s.max).toBe(100);
            expect(s.current).toBe(10);
        });
        it('getParamSpec unknown returns null', () => {
            expect(e.getParamSpec('zzz')).toBeNull();
        });
        it('listParams returns array', () => {
            const list = e.listParams();
            expect(list.length).toBe(3);
            expect(list[0]).toHaveProperty('name');
        });
    });

    describe('getCurrentParams', () => {
        it('returns map of name → value', () => {
            const p = e.getCurrentParams();
            expect(p.batchSize).toBe(10);
            expect(p.threshold).toBe(0.5);
            expect(p.retryCount).toBe(3);
        });
    });

    describe('evolve', () => {
        it('returns new params object', () => {
            const out = e.evolve(0.5);
            expect(out).toHaveProperty('batchSize');
            expect(out).toHaveProperty('threshold');
            expect(out).toHaveProperty('retryCount');
        });
        it('updates current params', () => {
            const before = e.getCurrentParams();
            e.evolve(0.7);
            const after = e.getCurrentParams();
            // at least one should differ (random explore first)
            const changed = Object.keys(before).some((k) => before[k] !== after[k]);
            expect(changed).toBe(true);
        });
        it('appends to history', () => {
            e.evolve(0.5);
            e.evolve(0.6);
            expect(e.history.length).toBe(2);
        });
        it('increments generation', () => {
            e.evolve(0.5);
            e.evolve(0.5);
            expect(e.generation).toBe(2);
        });
        it('rejects non-numeric metric', () => {
            expect(e.evolve('x')).toBeNull();
            expect(e.evolve(null)).toBeNull();
        });
        it('rejects non-finite metric', () => {
            expect(e.evolve(NaN)).toBeNull();
            expect(e.evolve(Infinity)).toBeNull();
        });
        it('first generation uses explore', () => {
            const out = e.evolve(0.5);
            expect(e.history[0].strategy).toBe('explore');
            expect(out).toBeTruthy();
        });
        it('keeps values within bounds', () => {
            for (let i = 0; i < 30; i++) e.evolve(Math.random());
            const p = e.getCurrentParams();
            expect(p.batchSize).toBeGreaterThanOrEqual(1);
            expect(p.batchSize).toBeLessThanOrEqual(100);
            expect(p.threshold).toBeGreaterThanOrEqual(0);
            expect(p.threshold).toBeLessThanOrEqual(1);
        });
        it('emits evolved event', () => {
            let captured = null;
            e.registerHook('evolved', (x) => { captured = x; });
            e.evolve(0.5);
            expect(captured).toHaveProperty('generation');
            expect(captured.metric).toBe(0.5);
        });
        it('hook errors swallowed', () => {
            e.registerHook('evolved', () => { throw new Error('x'); });
            expect(() => e.evolve(0.5)).not.toThrow();
        });
    });

    describe('history & best', () => {
        it('getHistory returns copy', () => {
            e.evolve(0.5);
            const h = e.getHistory();
            h.length = 0;
            expect(e.history.length).toBe(1);
        });
        it('getBest returns highest metric generation', () => {
            e.evolve(0.3);
            e.evolve(0.9);
            e.evolve(0.5);
            const best = e.getBest();
            expect(best.metric).toBe(0.9);
            expect(best.generation).toBe(2);
        });
        it('getWorst returns lowest', () => {
            e.evolve(0.3);
            e.evolve(0.9);
            e.evolve(0.1);
            const w = e.getWorst();
            expect(w.metric).toBe(0.1);
        });
        it('getLast returns most recent', () => {
            e.evolve(0.3);
            e.evolve(0.9);
            const last = e.getLast();
            expect(last.metric).toBe(0.9);
        });
        it('getBest empty returns null', () => {
            const x = new EvolverEngine();
            expect(x.getBest()).toBeNull();
            expect(x.getWorst()).toBeNull();
            expect(x.getLast()).toBeNull();
        });
        it('updates bestMetric in stats', () => {
            e.evolve(0.1);
            e.evolve(0.7);
            e.evolve(0.4);
            expect(e.stats.bestMetric).toBe(0.7);
        });
    });

    describe('config setters', () => {
        it('setMutationRate valid', () => {
            expect(e.setMutationRate(0.2)).toBe(true);
            expect(e.config.mutationRate).toBe(0.2);
        });
        it('setMutationRate invalid', () => {
            expect(e.setMutationRate(-0.1)).toBe(false);
            expect(e.setMutationRate(1.5)).toBe(false);
        });
        it('setPopulation valid', () => {
            expect(e.setPopulation(10)).toBe(true);
        });
        it('setPopulation invalid', () => {
            expect(e.setPopulation(0)).toBe(false);
        });
    });

    describe('getStats', () => {
        it('returns aggregate', () => {
            e.evolve(0.5);
            const s = e.getStats();
            expect(s.generation).toBe(1);
            expect(s.params).toBe(3);
            expect(s.history).toBe(1);
            expect(s.mutationRate).toBe(0.1);
        });
    });

    describe('reset', () => {
        it('clears history', () => {
            e.evolve(0.5);
            e.evolve(0.6);
            e.reset();
            expect(e.history.length).toBe(0);
            expect(e.generation).toBe(0);
        });
        it('keeps params registered', () => {
            e.evolve(0.5);
            e.reset();
            expect(e.params.size).toBe(3);
        });
    });
});
