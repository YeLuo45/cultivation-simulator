/**
 * ProgressVelocityTracker.test.js - 进度速度追踪器测试
 * V956 P-20260614-009 Iteration 9/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressVelocityTracker, TRACKABLE_GOALS } from '../../../systems/ai/ProgressVelocityTracker.js';

describe('ProgressVelocityTracker', () => {
    let t;
    beforeEach(() => { t = new ProgressVelocityTracker(); });

    it('initializes with defaults', () => {
        expect(t.progress.size).toBe(0);
        expect(t.config.velocityWindow).toBe(5);
    });

    it('records progress', () => {
        const p = t.recordProgress('p1', 'cultivate', 10, 100);
        expect(p).not.toBeNull();
        expect(t.stats.totalProgress).toBe(1);
    });

    it('rejects invalid input', () => {
        expect(t.recordProgress('', 'cultivate', 10)).toBeNull();
        expect(t.recordProgress('p1', 'invalid', 10)).toBeNull();
        expect(t.recordProgress('p1', 'cultivate', 'notnum')).toBeNull();
    });

    it('velocity returns 0 for no data', () => {
        expect(t.velocity('ghost', 'cultivate')).toBe(0);
    });

    it('velocity returns 0 for single point', () => {
        t.recordProgress('p1', 'cultivate', 10);
        expect(t.velocity('p1', 'cultivate')).toBe(0);
    });

    it('velocity calculates per-second rate', async () => {
        t.recordProgress('p1', 'cultivate', 10, 10);
        await new Promise(r => setTimeout(r, 5));
        t.recordProgress('p1', 'cultivate', 20, 30);
        const v = t.velocity('p1', 'cultivate');
        expect(v).toBeGreaterThan(0);
    });

    it('averageVelocity overall', async () => {
        t.recordProgress('p1', 'cultivate', 10);
        await new Promise(r => setTimeout(r, 5));
        t.recordProgress('p1', 'cultivate', 20);
        const v = t.averageVelocity('p1', 'cultivate');
        expect(v).toBeGreaterThan(0);
    });

    it('isStalled for empty data', () => {
        expect(t.isStalled('ghost', 'cultivate')).toBe(false);
    });

    it('isStalled detects stall', () => {
        for (let i = 0; i < 5; i++) {
            t.recordProgress('p1', 'cultivate', 100, i * 100);
        }
        for (let i = 0; i < 5; i++) {
            t.recordProgress('p1', 'cultivate', 1, (i + 5) * 100);
        }
        expect(t.isStalled('p1', 'cultivate')).toBe(true);
    });

    it('isSlowing detects decline', () => {
        for (let i = 0; i < 6; i++) t.recordProgress('p1', 'cultivate', 100, i * 100);
        for (let i = 6; i < 12; i++) t.recordProgress('p1', 'cultivate', 1, i * 100);
        expect(t.isSlowing('p1', 'cultivate')).toBe(true);
    });

    it('isSlowing false for too few samples', () => {
        t.recordProgress('p1', 'cultivate', 10);
        t.recordProgress('p1', 'cultivate', 5);
        expect(t.isSlowing('p1', 'cultivate')).toBe(false);
    });

    it('estimateETA returns null for no data', () => {
        expect(t.estimateETA('ghost', 'cultivate', 100)).toBeNull();
    });

    it('estimateETA returns null for target=0', () => {
        t.recordProgress('p1', 'cultivate', 10);
        expect(t.estimateETA('p1', 'cultivate', 0)).toBeNull();
    });

    it('estimateETA returns 0 for already reached target', async () => {
        t.recordProgress('p1', 'cultivate', 100, 100);
        await new Promise(r => setTimeout(r, 5));
        t.recordProgress('p1', 'cultivate', 0, 100);
        expect(t.estimateETA('p1', 'cultivate', 100)).toBe(0);
    });

    it('estimateETA calculates seconds', async () => {
        t.recordProgress('p1', 'cultivate', 10, 10);
        await new Promise(r => setTimeout(r, 5));
        t.recordProgress('p1', 'cultivate', 10, 20);
        const eta = t.estimateETA('p1', 'cultivate', 100);
        expect(typeof eta === 'number' ? eta : 0).toBeGreaterThan(0);
    });

    it('getProgress returns by id', () => {
        const p = t.recordProgress('p1', 'cultivate', 10);
        expect(t.getProgress(p.id).id).toBe(p.id);
        expect(t.getProgress('ghost')).toBeNull();
    });

    it('report aggregates per goal', async () => {
        t.recordProgress('p1', 'cultivate', 10);
        await new Promise(r => setTimeout(r, 5));
        t.recordProgress('p1', 'cultivate', 20);
        const r = t.report('p1');
        expect(r.byGoal.cultivate).toBeDefined();
        expect(r.byGoal.cultivate.velocity).toBeGreaterThan(0);
    });

    it('reset clears', () => {
        t.recordProgress('p1', 'cultivate', 10);
        t.reset();
        expect(t.progress.size).toBe(0);
    });

    it('exposes TRACKABLE_GOALS', () => {
        expect(TRACKABLE_GOALS).toContain('cultivate');
    });

    it('covers all public methods', () => {
        t.recordProgress('p1', 'cultivate', 10, 10);
        t.getProgress('ghost');
        t.velocity('p1', 'cultivate');
        t.averageVelocity('p1', 'cultivate');
        t.isStalled('p1', 'cultivate');
        t.isSlowing('p1', 'cultivate');
        t.estimateETA('p1', 'cultivate', 100);
        t.report('p1');
        t.reset();
        const t2 = new ProgressVelocityTracker();
        let called = false;
        t2.registerHook('progressRecorded', () => { called = true; });
        t2.recordProgress('p1', 'cultivate', 10);
        expect(called).toBe(true);
    });
});
