import { describe, it, expect, beforeEach } from 'vitest';
import { MessageRelay, RELAY_STATUS } from '../../../systems/intel/MessageRelay.js';

describe('MessageRelay', () => {
    let r;
    beforeEach(() => { r = new MessageRelay(); });
    it('initializes with defaults', () => { expect(r.stats.total).toBe(0); });
    it('send', () => { expect(r.send('a', 'b', 'content')).not.toBeNull(); });
    it('send rejects missing', () => { expect(r.send('', 'b', 'c')).toBeNull(); expect(r.send('a', '', 'c')).toBeNull(); });
    it('send normalizes invalid priority', () => { const x = r.send('a', 'b', 'c', 'invalid'); expect(x.priority).toBe('normal'); });
    it('get returns null for unknown', () => { expect(r.get('ghost')).toBeNull(); });
    it('listAll and listByStatus and listByFrom and listByTo and listByPriority', () => {
        r.send('a', 'b', 'c1');
        r.send('a', 'c', 'c2', 'high');
        r.send('d', 'b', 'c3');
        expect(r.listAll().length).toBe(3);
        expect(r.listByStatus('pending').length).toBe(3);
        expect(r.listByFrom('a').length).toBe(2);
        expect(r.listByTo('b').length).toBe(2);
        expect(r.listByPriority('high').length).toBe(1);
    });
    it('setStatus', () => { const x = r.send('a', 'b', 'c'); expect(r.setStatus(x.id, 'delivered')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = r.send('a', 'b', 'c'); expect(r.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(r.setStatus('ghost', 'delivered')).toBe(false); });
    it('transit and deliver and fail and interrupt', () => { const x = r.send('a', 'b', 'c'); r.transit(x.id); r.deliver(x.id); expect(r.deliver(x.id)).toBe(false); const y = r.send('a', 'b', 'c'); r.fail(y.id); expect(r.isFailed(y.id)).toBe(true); const z = r.send('a', 'b', 'c'); r.interrupt(z.id); expect(z.status).toBe('interrupted'); });
    it('hop', () => { const x = r.send('a', 'b', 'c'); r.hop(x.id); r.hop(x.id); expect(r.hopsOf(x.id)).toBe(2); });
    it('hop returns false for unknown', () => { expect(r.hop('ghost')).toBe(false); });
    it('isDelivered and isPending and isFailed', () => { const x = r.send('a', 'b', 'c'); r.deliver(x.id); expect(r.isDelivered(x.id)).toBe(true); expect(r.isPending(x.id)).toBe(false); });
    it('hopsOf for unknown', () => { expect(r.hopsOf('ghost')).toBe(0); });
    it('duration for not delivered', () => { const x = r.send('a', 'b', 'c'); expect(r.duration(x.id)).toBe(0); });
    it('duration for unknown', () => { expect(r.duration('ghost')).toBe(0); });
    it('successRate', () => { const x = r.send('a', 'b', 'c'); r.deliver(x.id); expect(r.successRate()).toBe(1); });
    it('pendingCount', () => { r.send('a', 'b', 'c'); expect(r.pendingCount()).toBe(1); });
    it('report aggregates', () => { r.send('a', 'b', 'c'); expect(r.report().total).toBe(1); });
    it('reset clears', () => { r.send('a', 'b', 'c'); r.reset(); expect(r.stats.total).toBe(0); });
    it('exposes RELAY_STATUS', () => { expect(RELAY_STATUS).toContain('pending'); });
});
