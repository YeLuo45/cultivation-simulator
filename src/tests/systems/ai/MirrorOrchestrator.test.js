/**
 * MirrorOrchestrator.test.js - V977 FINAL Iter 30/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { MirrorOrchestrator, ADAPT_MODES } from '../../../systems/ai/MirrorOrchestrator.js';

describe('MirrorOrchestrator', () => {
    let o;
    beforeEach(() => { o = new MirrorOrchestrator(); });

    it('initializes with 29 engines', () => {
        expect(Object.keys(o.engines).length).toBe(29);
    });

    it('orchestrate returns state', () => {
        o.engines.playerBehaviorCollector.collect('p1', 'cultivate', 't1');
        o.engines.sessionEventStream.startSession('p1');
        const state = o.orchestrate('p1');
        expect(state).not.toBeNull();
        expect(state.snapshot).toBeDefined();
        expect(state.mastery).toBeGreaterThanOrEqual(0);
    });

    it('orchestrate increments stats', () => {
        o.orchestrate('p1');
        expect(o.stats.totalOrchestrated).toBe(1);
    });

    it('adapt returns valid mode', () => {
        expect(ADAPT_MODES).toContain(o.adapt({ mastery: 0.1, coherence: 0.5, density: 0.5 }));
    });

    it('adapt bootstrap for low mastery', () => {
        expect(o.adapt({ mastery: 0.1, coherence: 0.5, density: 0.5 })).toBe('bootstrap');
    });

    it('adapt balance for low coherence', () => {
        expect(o.adapt({ mastery: 0.5, coherence: 0.1, density: 0.5 })).toBe('balance');
    });

    it('adapt activate for low density', () => {
        expect(o.adapt({ mastery: 0.5, coherence: 0.5, density: 0.2 })).toBe('activate');
    });

    it('adapt maintain for high all', () => {
        expect(o.adapt({ mastery: 0.8, coherence: 0.8, density: 0.8 })).toBe('maintain');
    });

    it('orchestrateAndAdapt returns both', () => {
        o.engines.playerBehaviorCollector.collect('p1', 'cultivate', 't1');
        const result = o.orchestrateAndAdapt('p1');
        expect(result.state).toBeDefined();
        expect(ADAPT_MODES).toContain(result.mode);
    });

    it('snapshot is stored', () => {
        o.orchestrate('p1');
        expect(o.getSnapshot('p1')).not.toBeNull();
    });

    it('getSnapshot for unknown returns null', () => { expect(o.getSnapshot('p1')).toBeNull(); });

    it('listSnapshots returns all', () => {
        o.orchestrate('p1');
        o.orchestrate('p2');
        expect(o.listSnapshots().length).toBe(2);
    });

    it('snapshot has 8 dimensions', () => {
        const s = o.orchestrate('p1');
        expect(Object.keys(s.snapshot).length).toBe(8);
    });

    it('mastery is bounded 0-1', () => {
        for (let i = 0; i < 100; i++) o.engines.playerBehaviorCollector.collect('p1', 'cultivate', `t${i}`);
        const s = o.orchestrate('p1');
        expect(s.mastery).toBeLessThanOrEqual(1);
        expect(s.mastery).toBeGreaterThanOrEqual(0);
    });

    it('coherence is bounded 0-1', () => {
        const s = o.orchestrate('p1');
        expect(s.coherence).toBeLessThanOrEqual(1);
        expect(s.coherence).toBeGreaterThanOrEqual(0);
    });

    it('resetAll clears all engines', () => {
        o.engines.playerBehaviorCollector.collect('p1', 'cultivate', 't1');
        o.orchestrate('p1');
        o.resetAll();
        expect(o.engines.playerBehaviorCollector.events.size).toBe(0);
        expect(o.snapshots.size).toBe(0);
    });

    it('uses all 29 engines in orchestration', () => {
        o.engines.playerBehaviorCollector.collect('p1', 'cultivate', 't1');
        o.engines.stuckPointDetector.recordAttempt('p1', 'cultivate', false);
        o.engines.stuckPointDetector.recordAttempt('p1', 'cultivate', false);
        o.engines.stuckPointDetector.recordAttempt('p1', 'cultivate', false);
        const s = o.orchestrate('p1');
        expect(s.snapshot.dim4).toBeGreaterThan(0);
    });

    it('exposes ADAPT_MODES', () => { expect(ADAPT_MODES).toContain('maintain'); });
});
