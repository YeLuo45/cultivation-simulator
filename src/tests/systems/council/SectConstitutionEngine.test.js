import { describe, it, expect, beforeEach } from 'vitest';
import { SectConstitutionEngine, CONSTITUTION_SECTIONS } from '../../../systems/council/SectConstitutionEngine.js';

describe('SectConstitutionEngine', () => {
    let c;
    beforeEach(() => { c = new SectConstitutionEngine(); });
    it('initializes with defaults', () => { expect(c.stats.totalAmendments).toBe(0); });
    it('setSection', () => { expect(c.setSection('preamble', 'text')).toBe(true); });
    it('setSection rejects invalid', () => { expect(c.setSection('invalid', 'text')).toBe(false); });
    it('getSection returns null for unknown', () => { expect(c.getSection('ghost')).toBeNull(); });
    it('hasSection', () => { c.setSection('preamble', 't'); expect(c.hasSection('preamble')).toBe(true); });
    it('listSections', () => { c.setSection('preamble', 't'); expect(c.listSections().length).toBe(1); });
    it('amend add', () => {
        c.setSection('preamble', 'original');
        expect(c.amend('preamble', 'add', 'extra', 'm1')).not.toBeNull();
    });
    it('amend modify', () => {
        c.setSection('preamble', 'original');
        c.amend('preamble', 'modify', 'new', 'm1');
        expect(c.getSection('preamble').content).toBe('new');
    });
    it('amend remove', () => {
        c.setSection('preamble', 'remove this');
        c.amend('preamble', 'remove', 'remove ', 'm1');
        expect(c.getSection('preamble').content).toBe('this');
    });
    it('amend repeal', () => {
        c.setSection('preamble', 'text');
        c.amend('preamble', 'repeal', '', 'm1');
        expect(c.getSection('preamble').content).toBe('');
    });
    it('amend rejects invalid type', () => {
        c.setSection('preamble', 't');
        expect(c.amend('preamble', 'invalid', '', 'm1')).toBe(false);
    });
    it('amend rejects unknown section', () => { expect(c.amend('ghost', 'add', '', 'm1')).toBe(false); });
    it('versionOf increments', () => {
        c.setSection('preamble', 't');
        c.amend('preamble', 'modify', 't2', 'm1');
        expect(c.versionOf('preamble')).toBe(2);
    });
    it('amendmentsFor and amendmentCount', () => {
        c.setSection('preamble', 't');
        c.amend('preamble', 'modify', 't2', 'm1');
        expect(c.amendmentCount('preamble')).toBe(1);
    });
    it('contains', () => {
        c.setSection('preamble', 'this is text');
        expect(c.contains('preamble', 'text')).toBe(true);
    });
    it('contains false for unknown', () => { expect(c.contains('ghost', 'x')).toBe(false); });
    it('wordCount', () => {
        c.setSection('preamble', 'one two three');
        expect(c.wordCount('preamble')).toBe(3);
    });
    it('completeness and isComplete', () => {
        for (const s of CONSTITUTION_SECTIONS) c.setSection(s, 't');
        expect(c.isComplete()).toBe(true);
    });
    it('missingSections', () => { c.setSection('preamble', 't'); expect(c.missingSections().length).toBeGreaterThan(0); });
    it('fullText', () => {
        c.setSection('preamble', 'hello');
        expect(c.fullText()).toContain('hello');
    });
    it('recentAmendments', () => {
        c.setSection('preamble', 't');
        c.amend('preamble', 'modify', 't2', 'm1');
        expect(c.recentAmendments().length).toBe(1);
    });
    it('report aggregates', () => { c.setSection('preamble', 't'); expect(c.report().totalSections).toBe(1); });
    it('reset clears', () => { c.setSection('preamble', 't'); c.reset(); expect(c.sections.size).toBe(0); });
    it('exposes CONSTITUTION_SECTIONS', () => { expect(CONSTITUTION_SECTIONS).toContain('preamble'); });
});
