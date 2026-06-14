import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressDiary, ENTRY_TYPES } from '../../../systems/arena/ProgressDiary.js';

describe('ProgressDiary', () => {
    let d;
    beforeEach(() => { d = new ProgressDiary(); });
    it('initializes with defaults', () => { expect(d.stats.total).toBe(0); });
    it('log creates entry', () => { expect(d.log('p1', 'training', 'Did 100 pushups', 'satisfied', 50)).not.toBeNull(); });
    it('log rejects missing', () => { expect(d.log('', 'training', 'c')).toBeNull(); });
    it('log rejects invalid type', () => { expect(d.log('p1', 'invalid', 'c')).toBeNull(); });
    it('log normalizes invalid mood', () => { const x = d.log('p1', 'training', 'c', 'invalid'); expect(x.mood).toBe('neutral'); });
    it('get returns null for unknown', () => { expect(d.get('ghost')).toBeNull(); });
    it('listAll and forPlayer', () => { d.log('p1', 'training', 'c'); d.log('p2', 'match', 'c'); expect(d.listAll().length).toBe(2); expect(d.forPlayer('p1').length).toBe(1); });
    it('listByType and listByMood', () => { d.log('p1', 'training', 'c', 'satisfied'); expect(d.listByType('training').length).toBe(1); expect(d.listByMood('satisfied').length).toBe(1); });
    it('forPlayerByType and forPlayerByMood', () => { d.log('p1', 'training', 'c', 'satisfied'); expect(d.forPlayerByType('p1', 'training').length).toBe(1); expect(d.forPlayerByMood('p1', 'satisfied').length).toBe(1); });
    it('deleteEntry', () => { const x = d.log('p1', 'training', 'c'); expect(d.deleteEntry(x.id)).toBe(true); });
    it('deleteEntry returns false', () => { expect(d.deleteEntry('ghost')).toBe(false); });
    it('updateMood', () => { const x = d.log('p1', 'training', 'c'); expect(d.updateMood(x.id, 'inspired')).toBe(true); });
    it('updateMood rejects invalid', () => { const x = d.log('p1', 'training', 'c'); expect(d.updateMood(x.id, 'invalid')).toBe(false); });
    it('updateMood returns false for unknown', () => { expect(d.updateMood('ghost', 'inspired')).toBe(false); });
    it('totalExp and entryCount', () => { d.log('p1', 'training', 'c', 'neutral', 50); d.log('p1', 'match', 'c', 'neutral', 100); expect(d.totalExp('p1')).toBe(150); expect(d.entryCount('p1')).toBe(2); });
    it('typeCount', () => { d.log('p1', 'training', 'c'); d.log('p1', 'training', 'c'); expect(d.typeCount('p1', 'training')).toBe(2); });
    it('mostCommonType and dominantMood', () => { d.log('p1', 'training', 'c'); d.log('p1', 'training', 'c'); d.log('p1', 'match', 'c', 'inspired'); expect(d.mostCommonType('p1')).toBe('training'); expect(d.dominantMood('p1')).toBe('neutral'); });
    it('isInspired', () => { d.log('p1', 'match', 'c', 'inspired'); d.log('p1', 'match', 'c', 'inspired'); expect(d.isInspired('p1')).toBe(true); });
    it('recent', () => { d.log('p1', 'training', 'c'); d.log('p1', 'match', 'c'); expect(d.recent('p1').length).toBe(2); });
    it('report aggregates', () => { d.log('p1', 'training', 'c'); expect(d.report().total).toBe(1); });
    it('reset clears', () => { d.log('p1', 'training', 'c'); d.reset(); expect(d.stats.total).toBe(0); });
    it('exposes ENTRY_TYPES', () => { expect(ENTRY_TYPES).toContain('training'); });
});
