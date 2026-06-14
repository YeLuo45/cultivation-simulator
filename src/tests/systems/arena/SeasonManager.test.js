import { describe, it, expect, beforeEach } from 'vitest';
import { SeasonManager, SEASON_STATUS } from '../../../systems/arena/SeasonManager.js';

describe('SeasonManager', () => {
    let m;
    beforeEach(() => { m = new SeasonManager(); });
    it('initializes with defaults', () => { expect(m.stats.total).toBe(0); });
    it('create', () => { expect(m.create('Season 1')).not.toBeNull(); });
    it('create rejects missing', () => { expect(m.create('')).toBeNull(); });
    it('get returns null for unknown', () => { expect(m.get('ghost')).toBeNull(); });
    it('listAll and listByStatus', () => { m.create('S1'); expect(m.listAll().length).toBe(1); expect(m.listByStatus('upcoming').length).toBe(1); });
    it('current returns null initially', () => { expect(m.current()).toBeNull(); });
    it('start', () => { const x = m.create('S1'); expect(m.start(x.id)).toBe(true); });
    it('start fails for non-upcoming', () => { const x = m.create('S1'); m.start(x.id); expect(m.start(x.id)).toBe(false); });
    it('end', () => { const x = m.create('S1'); m.start(x.id); expect(m.end(x.id)).toBe(true); });
    it('end returns false for unknown', () => { expect(m.end('ghost')).toBe(false); });
    it('setReward', () => { const x = m.create('S1'); expect(m.setReward(x.id, { gold: 1000 })).toBe(true); });
    it('setCurrent', () => { const x = m.create('S1'); expect(m.setCurrent(x.id)).toBe(true); expect(m.current().id).toBe(x.id); });
    it('setCurrent returns false for unknown', () => { expect(m.setCurrent('ghost')).toBe(false); });
    it('isActive/isUpcoming/isEnded', () => { const x = m.create('S1'); expect(m.isUpcoming(x.id)).toBe(true); m.start(x.id); expect(m.isActive(x.id)).toBe(true); m.end(x.id); expect(m.isEnded(x.id)).toBe(true); });
    it('progress', () => { const x = m.create('S1'); expect(m.progress(x.id)).toBe(0); m.start(x.id); expect(m.progress(x.id)).toBeGreaterThanOrEqual(0); });
    it('progress for unknown', () => { expect(m.progress('ghost')).toBe(0); });
    it('daysLeft', () => { const x = m.create('S1'); expect(m.daysLeft(x.id)).toBeGreaterThanOrEqual(0); });
    it('rewardFor', () => { const x = m.create('S1', null, { gold: 100 }); expect(m.rewardFor(x.id, 'p1').gold).toBe(100); });
    it('rewardFor for unknown', () => { expect(m.rewardFor('ghost', 'p1')).toBeNull(); });
    it('report aggregates', () => { m.create('S1'); expect(m.report().total).toBe(1); });
    it('reset clears', () => { m.create('S1'); m.reset(); expect(m.stats.total).toBe(0); });
    it('exposes SEASON_STATUS', () => { expect(SEASON_STATUS).toContain('active'); });
});
