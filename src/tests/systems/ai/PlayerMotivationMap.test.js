/**
 * PlayerMotivationMap.test.js - 玩家动机图谱测试
 * V961 P-20260614-014 Iteration 14/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerMotivationMap, MOTIVATION_TYPES, MOTIVATION_SIGNALS } from '../../../systems/ai/PlayerMotivationMap.js';

describe('PlayerMotivationMap', () => {
    let m;
    beforeEach(() => { m = new PlayerMotivationMap(); });

    it('initializes with defaults', () => {
        expect(m.signals.size).toBe(0);
    });

    it('records a signal', () => {
        const s = m.recordSignal('p1', 'complete_quest');
        expect(s).not.toBeNull();
    });

    it('rejects invalid signal', () => {
        expect(m.recordSignal('p1', 'invalid')).toBeNull();
        expect(m.recordSignal('', 'complete_quest')).toBeNull();
    });

    it('dominantMotivation returns most common', () => {
        m.recordSignal('p1', 'complete_quest');
        m.recordSignal('p1', 'collect_item');
        m.recordSignal('p1', 'reach_milestone');
        expect(m.dominantMotivation('p1')).toBe('achievement');
    });

    it('dominantMotivation for unknown returns null', () => {
        expect(m.dominantMotivation('ghost')).toBeNull();
    });

    it('getMotivationCount for unknown returns 0', () => {
        expect(m.getMotivationCount('ghost', 'achievement')).toBe(0);
    });

    it('getMap returns map', () => {
        m.recordSignal('p1', 'complete_quest');
        expect(m.getMap('p1')).not.toBeNull();
        expect(m.getMap('ghost')).toBeNull();
    });

    it('motivationLevel returns none for 0', () => {
        m.recordSignal('p1', 'complete_quest');
        expect(m.motivationLevel('p1', 'social')).toBe('none');
    });

    it('motivationLevel returns high for >0.4 ratio', () => {
        for (let i = 0; i < 8; i++) m.recordSignal('p1', 'complete_quest');
        m.recordSignal('p1', 'chat_npc');
        m.recordSignal('p1', 'chat_npc');
        expect(m.motivationLevel('p1', 'achievement')).toBe('high');
    });

    it('recommendedActivity returns first signal of dominant', () => {
        m.recordSignal('p1', 'complete_quest');
        m.recordSignal('p1', 'collect_item');
        expect(m.recommendedActivity('p1')).toBe('complete_quest');
    });

    it('recommendedActivity for unknown returns null', () => {
        expect(m.recommendedActivity('ghost')).toBeNull();
    });

    it('getSignal returns by id', () => {
        const s = m.recordSignal('p1', 'complete_quest');
        expect(m.getSignal(s.id).id).toBe(s.id);
        expect(m.getSignal('ghost')).toBeNull();
    });

    it('listSignals returns player signals', () => {
        m.recordSignal('p1', 'complete_quest');
        m.recordSignal('p1', 'chat_npc');
        expect(m.listSignals('p1').length).toBe(2);
    });

    it('report aggregates', () => {
        m.recordSignal('p1', 'complete_quest');
        m.recordSignal('p1', 'complete_quest');
        m.recordSignal('p1', 'chat_npc');
        const r = m.report('p1');
        expect(r.dominant).toBe('achievement');
        expect(r.recommended).toBe('complete_quest');
    });

    it('report for unknown returns null', () => {
        expect(m.report('ghost')).toBeNull();
    });

    it('reset clears', () => {
        m.recordSignal('p1', 'complete_quest');
        m.reset();
        expect(m.signals.size).toBe(0);
    });

    it('exposes MOTIVATION_TYPES and MOTIVATION_SIGNALS', () => {
        expect(MOTIVATION_TYPES).toContain('achievement');
        expect(MOTIVATION_SIGNALS.achievement).toContain('complete_quest');
    });

    it('covers all public methods', () => {
        m.recordSignal('p1', 'complete_quest');
        m.getSignal('ghost');
        m.getMap('p1');
        m.getMotivationCount('p1', 'achievement');
        m.dominantMotivation('p1');
        m.motivationLevel('p1', 'achievement');
        m.recommendedActivity('p1');
        m.listSignals('p1');
        m.report('p1');
        m.reset();
        const m2 = new PlayerMotivationMap();
        let called = false;
        m2.registerHook('signalRecorded', () => { called = true; });
        m2.recordSignal('p1', 'complete_quest');
        expect(called).toBe(true);
    });
});
