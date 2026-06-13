/**
 * ReflectionPrompt.test.js - V972 Iter 25/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ReflectionPrompt, REFLECTION_TRIGGERS } from '../../../systems/ai/ReflectionPrompt.js';

describe('ReflectionPrompt', () => {
    let r;
    beforeEach(() => { r = new ReflectionPrompt(); });

    it('initializes with defaults', () => { expect(r.stats.totalPrompted).toBe(0); });

    it('addPrompt adds valid', () => {
        expect(r.addPrompt('session_end', '今天学到了什么？')).toBe(true);
    });

    it('addPrompt rejects invalid trigger', () => { expect(r.addPrompt('invalid', 'x')).toBe(false); });

    it('addPrompt respects max per kind', () => {
        const p = new ReflectionPrompt({ promptsPerKind: 2 });
        expect(p.addPrompt('session_end', 'q1')).toBe(true);
        expect(p.addPrompt('session_end', 'q2')).toBe(true);
        expect(p.addPrompt('session_end', 'q3')).toBe(false);
    });

    it('getPromptsFor returns all', () => {
        r.addPrompt('session_end', 'q1');
        r.addPrompt('session_end', 'q2');
        expect(r.getPromptsFor('session_end').length).toBe(2);
    });

    it('getPromptsFor for unknown returns []', () => { expect(r.getPromptsFor('unknown').length).toBe(0); });

    it('promptPlayer returns prompt', () => {
        r.addPrompt('session_end', 'q1');
        const p = r.promptPlayer('p1', 'session_end');
        expect(p).not.toBeNull();
        expect(r.stats.totalPrompted).toBe(1);
    });

    it('promptPlayer returns null for no prompts', () => { expect(r.promptPlayer('p1', 'session_end')).toBeNull(); });
    it('promptPlayer rejects invalid trigger', () => { expect(r.promptPlayer('p1', 'invalid')).toBeNull(); });

    it('recordResponse tracks responses', () => {
        r.addPrompt('session_end', 'q');
        r.promptPlayer('p1', 'session_end');
        r.recordResponse('p1', 'session_end', 'q', '我学到了很多');
        expect(r.stats.totalReflected).toBe(1);
    });

    it('listResponses returns all', () => {
        r.recordResponse('p1', 'session_end', 'q', 'a');
        expect(r.listResponses('p1').length).toBe(1);
    });

    it('listResponses for unknown returns []', () => { expect(r.listResponses('p1').length).toBe(0); });

    it('responsesByTrigger filters', () => {
        r.recordResponse('p1', 'session_end', 'q1', 'a1');
        r.recordResponse('p1', 'level_up', 'q2', 'a2');
        expect(r.responsesByTrigger('p1', 'session_end').length).toBe(1);
    });

    it('reflectionRate returns count', () => {
        r.recordResponse('p1', 'session_end', 'q', 'a');
        r.recordResponse('p1', 'session_end', 'q', 'b');
        expect(r.reflectionRate('p1')).toBe(2);
    });

    it('hasMeaningfulReflection checks length', () => {
        r.recordResponse('p1', 'session_end', 'q', 'short');
        expect(r.hasMeaningfulReflection('p1')).toBe(false);
        r.recordResponse('p1', 'session_end', 'q', 'this is a meaningful reflection with detail');
        expect(r.hasMeaningfulReflection('p1')).toBe(true);
    });

    it('triggers prompted and responded hooks', () => {
        let p = false, rsp = false;
        r.registerHook('prompted', () => { p = true; });
        r.registerHook('responded', () => { rsp = true; });
        r.addPrompt('session_end', 'q');
        r.promptPlayer('p1', 'session_end');
        r.recordResponse('p1', 'session_end', 'q', 'a');
        expect(p).toBe(true);
        expect(rsp).toBe(true);
    });

    it('report aggregates', () => {
        r.recordResponse('p1', 'session_end', 'q', 'a');
        const rep = r.report('p1');
        expect(rep.byTrigger.session_end).toBe(1);
    });

    it('reset clears', () => {
        r.addPrompt('session_end', 'q');
        r.reset();
        expect(r.prompts.size).toBe(0);
    });

    it('exposes REFLECTION_TRIGGERS', () => { expect(REFLECTION_TRIGGERS).toContain('session_end'); });
});
