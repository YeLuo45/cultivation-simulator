/**
 * FailurePatternDetector.test.js - 失败模式检测器测试
 * V954 P-20260614-007 Iteration 7/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { FailurePatternDetector, FAILURE_CATEGORIES } from '../../../systems/ai/FailurePatternDetector.js';

describe('FailurePatternDetector', () => {
    let d;
    beforeEach(() => { d = new FailurePatternDetector(); });

    it('initializes with defaults', () => {
        expect(d.failures.size).toBe(0);
        expect(d.config.minRepeat).toBe(2);
    });

    it('records a failure', () => {
        const f = d.recordFailure('p1', 'timeout', 'combat');
        expect(f).not.toBeNull();
        expect(d.stats.totalRecorded).toBe(1);
    });

    it('rejects invalid category', () => {
        expect(d.recordFailure('p1', 'invalid', 'x')).toBeNull();
    });

    it('detects pattern after repeat', () => {
        d.recordFailure('p1', 'timeout', 'combat');
        d.recordFailure('p1', 'timeout', 'combat');
        expect(d.stats.totalPatterns).toBe(1);
    });

    it('does not detect pattern for single failure', () => {
        d.recordFailure('p1', 'timeout', 'combat');
        expect(d.stats.totalPatterns).toBe(0);
    });

    it('updates existing pattern count', () => {
        d.recordFailure('p1', 'timeout', 'combat');
        d.recordFailure('p1', 'timeout', 'combat');
        d.recordFailure('p1', 'timeout', 'combat');
        const list = d.listPlayerPatterns('p1');
        expect(list.length).toBe(1);
        expect(list[0].count).toBe(3);
    });

    it('classifies severity', () => {
        for (let i = 0; i < 10; i++) d.recordFailure('p1', 'timeout', 'combat');
        const p = d.listPlayerPatterns('p1')[0];
        expect(p.severity).toBe('critical');
    });

    it('dominantCategory returns most common', () => {
        d.recordFailure('p1', 'timeout', 'x');
        d.recordFailure('p1', 'timeout', 'y');
        d.recordFailure('p1', 'resource', 'z');
        expect(d.dominantCategory('p1')).toBe('timeout');
    });

    it('dominantCategory returns null for empty', () => {
        expect(d.dominantCategory('ghost')).toBeNull();
    });

    it('listPlayerFailures filters by category', () => {
        d.recordFailure('p1', 'timeout', 'a');
        d.recordFailure('p1', 'resource', 'b');
        expect(d.listPlayerFailures('p1', 'timeout').length).toBe(1);
        expect(d.listPlayerFailures('p1').length).toBe(2);
    });

    it('getFailure returns by id', () => {
        const f = d.recordFailure('p1', 'timeout', 'a');
        expect(d.getFailure(f.id).id).toBe(f.id);
        expect(d.getFailure('ghost')).toBeNull();
    });

    it('getPattern returns by id', () => {
        d.recordFailure('p1', 'timeout', 'a');
        d.recordFailure('p1', 'timeout', 'a');
        const p = d.listPlayerPatterns('p1')[0];
        expect(d.getPattern(p.id).id).toBe(p.id);
        expect(d.getPattern('ghost')).toBeNull();
    });

    it('report aggregates', () => {
        d.recordFailure('p1', 'timeout', 'a');
        d.recordFailure('p1', 'timeout', 'a');
        d.recordFailure('p1', 'resource', 'b');
        d.recordFailure('p1', 'timeout', 'a');
        d.recordFailure('p1', 'timeout', 'a');
        const r = d.report('p1');
        expect(r.totalFailures).toBe(5);
        expect(r.totalPatterns).toBe(1);
        expect(r.dominantCategory).toBe('timeout');
    });

    it('reset clears', () => {
        d.recordFailure('p1', 'timeout', 'a');
        d.reset();
        expect(d.failures.size).toBe(0);
    });

    it('triggers patternDetected hook', () => {
        let called = false;
        d.registerHook('patternDetected', () => { called = true; });
        d.recordFailure('p1', 'timeout', 'a');
        d.recordFailure('p1', 'timeout', 'a');
        expect(called).toBe(true);
    });

    it('exposes FAILURE_CATEGORIES', () => {
        expect(FAILURE_CATEGORIES).toContain('timeout');
    });

    it('covers all public methods', () => {
        d.recordFailure('p1', 'timeout', 'a');
        d.recordFailure('p1', 'timeout', 'a');
        d.getFailure('ghost');
        d.getPattern('ghost');
        d.listPlayerFailures('p1');
        d.listPlayerPatterns('p1');
        d.dominantCategory('p1');
        d.report('p1');
        d.reset();
        const d2 = new FailurePatternDetector();
        let called = false;
        d2.registerHook('failureRecorded', () => { called = true; });
        d2.recordFailure('p1', 'timeout', 'x');
        expect(called).toBe(true);
    });
});
