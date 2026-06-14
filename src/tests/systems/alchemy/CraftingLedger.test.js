import { describe, it, expect, beforeEach } from 'vitest';
import { CraftingLedger, LEDGER_ENTRY_TYPES } from '../../../systems/alchemy/CraftingLedger.js';

describe('CraftingLedger', () => {
    let l;
    beforeEach(() => { l = new CraftingLedger(); });
    it('initializes with defaults', () => { expect(l.stats.totalEntries).toBe(0); });
    it('record', () => { expect(l.record('craft', 100)).not.toBeNull(); });
    it('record rejects invalid type', () => { expect(l.record('invalid', 100)).toBeNull(); });
    it('record rejects non-positive amount', () => { expect(l.record('craft', -1)).toBeNull(); });
    it('get returns null for unknown', () => { expect(l.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByStatus and listForItem', () => {
        l.record('craft', 100, 'pill1');
        l.record('sell', 50, 'pill1');
        l.record('craft', 200, 'pill2');
        expect(l.listAll().length).toBe(3);
        expect(l.listByType('craft').length).toBe(2);
        expect(l.listByStatus('pending').length).toBe(3);
        expect(l.listForItem('pill1').length).toBe(2);
    });
    it('commit craft deducts balance', () => { const x = l.record('craft', 100); l.commit(x.id); expect(l.currentBalance()).toBe(-100); });
    it('commit sell increases balance', () => { const x = l.record('sell', 200); l.commit(x.id); expect(l.currentBalance()).toBe(200); });
    it('commit rejects non-pending', () => { const x = l.record('craft', 100); l.commit(x.id); expect(l.commit(x.id)).toBe(false); });
    it('commit returns false for unknown', () => { expect(l.commit('ghost')).toBe(false); });
    it('reverse', () => { const x = l.record('craft', 100); l.commit(x.id); expect(l.reverse(x.id)).toBe(true); expect(l.currentBalance()).toBe(0); });
    it('reverse rejects non-committed', () => { const x = l.record('craft', 100); expect(l.reverse(x.id)).toBe(false); });
    it('reverse returns false for unknown', () => { expect(l.reverse('ghost')).toBe(false); });
    it('isCommitted and isReversed and isPending', () => { const x = l.record('craft', 100); expect(l.isPending(x.id)).toBe(true); l.commit(x.id); expect(l.isCommitted(x.id)).toBe(true); l.reverse(x.id); expect(l.isReversed(x.id)).toBe(true); });
    it('incomeTotal and expenseTotal', () => { const a = l.record('sell', 200); const b = l.record('craft', 100); l.commit(a.id); l.commit(b.id); expect(l.incomeTotal()).toBe(200); expect(l.expenseTotal()).toBe(100); });
    it('netChange', () => { const a = l.record('sell', 200); const b = l.record('craft', 100); l.commit(a.id); l.commit(b.id); expect(l.netChange()).toBe(100); });
    it('pendingCount and committedCount', () => { const a = l.record('sell', 200); l.commit(a.id); expect(l.committedCount()).toBe(1); expect(l.pendingCount()).toBe(0); });
    it('report aggregates', () => { l.record('craft', 100); expect(l.report().totalEntries).toBe(1); });
    it('reset clears', () => { l.record('craft', 100); l.reset(); expect(l.stats.totalEntries).toBe(0); });
    it('exposes LEDGER_ENTRY_TYPES', () => { expect(LEDGER_ENTRY_TYPES).toContain('craft'); });
});
