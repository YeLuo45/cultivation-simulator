/**
 * StuckPointDetector.test.js - 卡点识别器测试
 * V953 P-20260614-006 Iteration 6/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { StuckPointDetector, STUCK_SEVERITY } from '../../../systems/ai/StuckPointDetector.js';

describe('StuckPointDetector', () => {
    let d;
    beforeEach(() => { d = new StuckPointDetector(); });

    it('initializes with defaults', () => {
        expect(d.stuckRecords.size).toBe(0);
        expect(d.config.consecutiveFailures).toBe(3);
    });

    it('records an attempt', () => {
        const r = d.recordAttempt('p1', 'cultivate', true, 1000);
        expect(r).toBeNull();
    });

    it('detects stuck after consecutive failures', () => {
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        const r = d.recordAttempt('p1', 'cultivate', false);
        expect(r).not.toBeNull();
        expect(r.severity).toBe('moderate');
        expect(d.stats.totalDetected).toBe(1);
    });

    it('escalates severity on more failures', () => {
        for (let i = 0; i < 9; i++) d.recordAttempt('p1', 'cultivate', false);
        const list = d.listPlayerStucks('p1');
        expect(list.some(s => s.severity === 'critical')).toBe(true);
    });

    it('detects time overrun', () => {
        d.recordAttempt('p1', 'cultivate', true, 1000);
        d.recordAttempt('p1', 'cultivate', true, 1100);
        d.recordAttempt('p1', 'cultivate', true, 900);
        const r = d.recordAttempt('p1', 'cultivate', true, 5000, 1000);
        expect(r).not.toBeNull();
        expect(r.timeOverrun).toBe(true);
    });

    it('marks recovered', () => {
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        const r = d.recordAttempt('p1', 'cultivate', false);
        d.markRecovered(r.id);
        expect(d.getStuck(r.id).recoveredAt).toBeDefined();
        expect(d.stats.totalRecovered).toBe(1);
    });

    it('clearStuck removes record', () => {
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        const r = d.recordAttempt('p1', 'cultivate', false);
        expect(d.clearStuck(r.id)).toBe(true);
        expect(d.getStuck(r.id)).toBeNull();
    });

    it('clearStuck returns false for unknown', () => {
        expect(d.clearStuck('ghost')).toBe(false);
    });

    it('isPlayerStuck by taskType', () => {
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        expect(d.isPlayerStuck('p1')).toBe(true);
        expect(d.isPlayerStuck('p1', 'cultivate')).toBe(true);
        expect(d.isPlayerStuck('p1', 'combat')).toBe(false);
    });

    it('report aggregates', () => {
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        const r = d.report('p1');
        expect(r.totalStuck).toBe(1);
        expect(r.byTask.cultivate).toBe(1);
    });

    it('reset clears all', () => {
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        d.reset();
        expect(d.stuckRecords.size).toBe(0);
    });

    it('triggers hook on detect', () => {
        let called = false;
        d.registerHook('stuckDetected', () => { called = true; });
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        expect(called).toBe(true);
    });

    it('success resets failure count', () => {
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', true);
        d.recordAttempt('p1', 'cultivate', false);
        d.recordAttempt('p1', 'cultivate', false);
        const r = d.recordAttempt('p1', 'cultivate', true);
        expect(r).toBeNull();
    });

    it('exposes STUCK_SEVERITY', () => {
        expect(STUCK_SEVERITY).toContain('critical');
    });

    it('prunes old records when over capacity', () => {
        const d2 = new StuckPointDetector({ maxStuckRecords: 2 });
        for (let i = 0; i < 5; i++) {
            d2.recordAttempt('p1', `task${i}`, false);
            d2.recordAttempt('p1', `task${i}`, false);
            d2.recordAttempt('p1', `task${i}`, false);
        }
        expect(d2.stuckRecords.size).toBeLessThanOrEqual(5);
    });
});
