/**
 * PlayerLearningStyle.test.js - 玩家学习风格测试
 * V959 P-20260614-012 Iteration 12/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerLearningStyle, LEARNING_STYLES, STYLE_SIGNALS } from '../../../systems/ai/PlayerLearningStyle.js';

describe('PlayerLearningStyle', () => {
    let l;
    beforeEach(() => { l = new PlayerLearningStyle(); });

    it('initializes with defaults', () => {
        expect(l.signals.size).toBe(0);
    });

    it('records a signal', () => {
        const s = l.recordSignal('p1', 'watch_demo');
        expect(s).not.toBeNull();
        expect(s.signalType).toBe('watch_demo');
    });

    it('rejects invalid signal', () => {
        expect(l.recordSignal('p1', 'invalid')).toBeNull();
        expect(l.recordSignal('', 'watch_demo')).toBeNull();
    });

    it('dominantStyle returns null for empty', () => {
        expect(l.dominantStyle('ghost')).toBeNull();
    });

    it('identifies visual dominant', () => {
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'view_map');
        l.recordSignal('p1', 'inspect_item');
        expect(l.dominantStyle('p1')).toBe('visual');
    });

    it('returns null when no dominant', () => {
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'practice_combat');
        expect(l.dominantStyle('p1')).toBeNull();
    });

    it('identifies secondary style', () => {
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'practice_combat');
        l.recordSignal('p1', 'practice_combat');
        l.recordSignal('p1', 'read_manual');
        expect(l.secondaryStyle('p1')).not.toBeNull();
    });

    it('isMultimodal true for multiple styles', () => {
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'practice_combat');
        l.recordSignal('p1', 'practice_combat');
        l.recordSignal('p1', 'read_manual');
        l.recordSignal('p1', 'read_manual');
        expect(l.isMultimodal('p1')).toBe(true);
    });

    it('recommendedContent returns signals', () => {
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'watch_demo');
        const recs = l.recommendedContent('p1');
        expect(recs.primary.length).toBeGreaterThan(0);
    });

    it('recommendedContent empty for no data', () => {
        const recs = l.recommendedContent('ghost');
        expect(recs.primary).toEqual([]);
    });

    it('getStyleRatios returns null for unknown', () => {
        expect(l.getStyleRatios('ghost')).toBeNull();
    });

    it('getSignal returns by id', () => {
        const s = l.recordSignal('p1', 'watch_demo');
        expect(l.getSignal(s.id).id).toBe(s.id);
        expect(l.getSignal('ghost')).toBeNull();
    });

    it('listSignals returns player signals', () => {
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'practice_combat');
        expect(l.listSignals('p1').length).toBe(2);
    });

    it('report aggregates all styles', () => {
        l.recordSignal('p1', 'watch_demo');
        l.recordSignal('p1', 'watch_demo');
        const r = l.report('p1');
        expect(r.ratios.visual).toBeGreaterThan(0);
    });

    it('reset clears', () => {
        l.recordSignal('p1', 'watch_demo');
        l.reset();
        expect(l.signals.size).toBe(0);
    });

    it('exposes LEARNING_STYLES and STYLE_SIGNALS', () => {
        expect(LEARNING_STYLES).toContain('visual');
        expect(STYLE_SIGNALS.visual).toContain('watch_demo');
    });

    it('covers all public methods', () => {
        l.recordSignal('p1', 'watch_demo');
        l.getSignal('ghost');
        l.getStyleRatios('p1');
        l.dominantStyle('p1');
        l.secondaryStyle('p1');
        l.isMultimodal('p1');
        l.recommendedContent('p1');
        l.listSignals('p1');
        l.report('p1');
        l.reset();
        const l2 = new PlayerLearningStyle();
        let called = false;
        l2.registerHook('signalRecorded', () => { called = true; });
        l2.recordSignal('p1', 'watch_demo');
        expect(called).toBe(true);
    });
});
