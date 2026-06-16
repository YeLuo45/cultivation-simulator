/**
 * EngagementDecayDetector.test.js - 投入度衰减检测器测试
 * V957 P-20260614-010 Iteration 10/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { EngagementDecayDetector, ENGAGEMENT_SIGNALS } from '../../../systems/ai/EngagementDecayDetector.js';

describe('EngagementDecayDetector', () => {
    let d;
    beforeEach(() => { d = new EngagementDecayDetector(); });

    it('initializes with defaults', () => {
        expect(d.signals.size).toBe(0);
        expect(d.config.decayThreshold).toBe(0.3);
    });

    it('records a signal', () => {
        const s = d.recordSignal('p1', 'login', 1);
        expect(s).not.toBeNull();
        expect(d.stats.totalSignals).toBe(1);
    });

    it('rejects invalid input', () => {
        expect(d.recordSignal('', 'login', 1)).toBeNull();
        expect(d.recordSignal('p1', 'invalid', 1)).toBeNull();
        expect(d.recordSignal('p1', 'login', 'notnum')).toBeNull();
    });

    it('triggers intervention on decay', () => {
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 10);
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 1);
        expect(d.stats.totalInterventions).toBeGreaterThan(0);
    });

    it('no intervention for stable signal', () => {
        for (let i = 0; i < 10; i++) d.recordSignal('p1', 'login', 5);
        expect(d.stats.totalInterventions).toBe(0);
    });

    it('engagementScore returns 0.5 for no data', () => {
        expect(d.engagementScore('ghost')).toBe(0.5);
    });

    it('engagementScore averages recent', () => {
        d.recordSignal('p1', 'login', 5);
        d.recordSignal('p1', 'login', 5);
        d.recordSignal('p1', 'action', 3);
        d.recordSignal('p1', 'action', 3);
        const s = d.engagementScore('p1');
        expect(s).toBeGreaterThan(0);
    });

    it('isDecaying returns true after intervention', () => {
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 10);
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 1);
        expect(d.isDecaying('p1')).toBe(true);
    });

    it('listInterventions returns player interventions', () => {
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 10);
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 1);
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'action', 10);
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'action', 1);
        expect(d.listInterventions('p1').length).toBeGreaterThanOrEqual(2);
    });

    it('getIntervention returns by id', () => {
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 10);
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 1);
        const list = d.listInterventions('p1');
        const id = list[0].id;
        expect(d.getIntervention(id).id).toBe(id);
        expect(d.getIntervention('ghost')).toBeNull();
    });

    it('getSignal returns by id', () => {
        const s = d.recordSignal('p1', 'login', 5);
        expect(d.getSignal(s.id).id).toBe(s.id);
        expect(d.getSignal('ghost')).toBeNull();
    });

    it('report aggregates all signal types', () => {
        d.recordSignal('p1', 'login', 5);
        d.recordSignal('p1', 'action', 3);
        const r = d.report('p1');
        expect(r.signalAverages.login.count).toBe(1);
        expect(r.signalAverages.action.count).toBe(1);
        expect(r.engagementScore).toBeGreaterThan(0);
    });

    it('reset clears all', () => {
        d.recordSignal('p1', 'login', 5);
        d.reset();
        expect(d.signals.size).toBe(0);
    });

    it('no intervention for rising signal', () => {
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 1);
        for (let i = 0; i < 5; i++) d.recordSignal('p1', 'login', 10);
        expect(d.stats.totalInterventions).toBe(0);
    });

    it('exposes ENGAGEMENT_SIGNALS', () => {
        expect(ENGAGEMENT_SIGNALS).toContain('login');
    });

    it('covers all public methods', () => {
        d.recordSignal('p1', 'login', 5);
        d.getIntervention('ghost');
        d.getSignal('ghost');
        d.engagementScore('p1');
        d.isDecaying('p1');
        d.listInterventions('p1');
        d.report('p1');
        d.reset();
        const d2 = new EngagementDecayDetector();
        let called = false;
        d2.registerHook('signalRecorded', () => { called = true; });
        d2.recordSignal('p1', 'login', 5);
        expect(called).toBe(true);
    });
});
