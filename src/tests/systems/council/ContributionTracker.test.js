import { describe, it, expect, beforeEach } from 'vitest';
import { ContributionTracker, CONTRIBUTION_TYPES } from '../../../systems/council/ContributionTracker.js';

describe('ContributionTracker', () => {
    let t;
    beforeEach(() => { t = new ContributionTracker(); });
    it('initializes with defaults', () => { expect(t.stats.totalEvents).toBe(0); });
    it('record creates entry', () => { expect(t.record('m1', 'quest_completed', 10)).toBe(10); });
    it('record rejects missing', () => { expect(t.record('', 'quest_completed', 10)).toBeNull(); });
    it('record rejects invalid type', () => { expect(t.record('m1', 'invalid', 10)).toBeNull(); });
    it('record rejects non-positive', () => { expect(t.record('m1', 'quest_completed', 0)).toBeNull(); });
    it('get returns 0 for unknown', () => { expect(t.get('ghost')).toBe(0); });
    it('getHistory', () => { t.record('m1', 'quest_completed', 10); expect(t.getHistory('m1').length).toBe(1); });
    it('getHistory for unknown returns []', () => { expect(t.getHistory('ghost').length).toBe(0); });
    it('getByType', () => {
        t.record('m1', 'quest_completed', 10);
        t.record('m1', 'resource_donated', 5);
        expect(t.getByType('m1', 'quest_completed').length).toBe(1);
    });
    it('pointsByType', () => {
        t.record('m1', 'quest_completed', 10);
        t.record('m1', 'resource_donated', 5);
        const r = t.pointsByType('m1');
        expect(r.quest_completed).toBe(10);
    });
    it('topContributors', () => {
        t.record('m1', 'quest_completed', 10);
        t.record('m2', 'quest_completed', 20);
        expect(t.topContributors()[0][0]).toBe('m2');
    });
    it('isTopContributor', () => {
        t.record('m1', 'quest_completed', 100);
        expect(t.isTopContributor('m1')).toBe(true);
    });
    it('totalContributions and averageContribution', () => {
        t.record('m1', 'quest_completed', 10);
        t.record('m2', 'quest_completed', 20);
        expect(t.totalContributions()).toBe(30);
        expect(t.averageContribution()).toBe(15);
    });
    it('resetMember', () => {
        t.record('m1', 'quest_completed', 10);
        t.resetMember('m1');
        expect(t.get('m1')).toBe(0);
    });
    it('report aggregates', () => { t.record('m1', 'quest_completed', 10); expect(t.report().totalEvents).toBe(1); });
    it('reset clears', () => { t.record('m1', 'quest_completed', 10); t.reset(); expect(t.stats.totalEvents).toBe(0); });
    it('exposes CONTRIBUTION_TYPES', () => { expect(CONTRIBUTION_TYPES).toContain('quest_completed'); });
});
