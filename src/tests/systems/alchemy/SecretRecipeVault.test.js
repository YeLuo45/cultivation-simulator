import { describe, it, expect, beforeEach } from 'vitest';
import { SecretRecipeVault, VAULT_SECURITY } from '../../../systems/alchemy/SecretRecipeVault.js';

describe('SecretRecipeVault', () => {
    let v;
    beforeEach(() => { v = new SecretRecipeVault(); });
    it('initializes with defaults', () => { expect(v.stats.total).toBe(0); });
    it('store', () => { expect(v.store('Secret', ['h1'], 'top_secret')).not.toBeNull(); });
    it('store rejects missing', () => { expect(v.store('', [])).toBeNull(); expect(v.store('A', 'not array')).toBeNull(); });
    it('store normalizes invalid security', () => { const x = v.store('A', [], 'invalid'); expect(x.security).toBe('restricted'); });
    it('get returns null for unknown', () => { expect(v.get('ghost')).toBeNull(); });
    it('listAll and listBySecurity and listByOwner and listPublic', () => {
        v.store('A', [], 'public');
        v.store('B', [], 'restricted');
        v.store('C', [], 'top_secret', 'p1');
        expect(v.listAll().length).toBe(3);
        expect(v.listBySecurity('public').length).toBe(1);
        expect(v.listByOwner('p1').length).toBe(1);
        expect(v.listPublic().length).toBe(1);
    });
    it('canAccess', () => { const x = v.store('A', [], 'top_secret'); expect(v.canAccess(0, x.id)).toBe(false); expect(v.canAccess(3, x.id)).toBe(true); });
    it('canAccess for unknown', () => { expect(v.canAccess(3, 'ghost')).toBe(false); });
    it('access', () => { const x = v.store('A', [], 'public'); expect(v.access('u1', x.id, 0)).not.toBeNull(); });
    it('access returns null for denied', () => { const x = v.store('A', [], 'top_secret'); expect(v.access('u1', x.id, 0)).toBeNull(); });
    it('access returns null for unknown', () => { expect(v.access('u1', 'ghost', 0)).toBeNull(); });
    it('setSecurity', () => { const x = v.store('A', []); expect(v.setSecurity(x.id, 'top_secret')).toBe(true); });
    it('setSecurity rejects invalid', () => { const x = v.store('A', []); expect(v.setSecurity(x.id, 'invalid')).toBe(false); });
    it('setSecurity returns false for unknown', () => { expect(v.setSecurity('ghost', 'top_secret')).toBe(false); });
    it('transfer', () => { const x = v.store('A', []); expect(v.transfer(x.id, 'p1')).toBe(true); });
    it('transfer returns false for unknown', () => { expect(v.transfer('ghost', 'p1')).toBe(false); });
    it('isPublic and isTopSecret', () => { const a = v.store('A', [], 'public'); const b = v.store('B', [], 'top_secret'); expect(v.isPublic(a.id)).toBe(true); expect(v.isTopSecret(b.id)).toBe(true); });
    it('isPublic for unknown', () => { expect(v.isPublic('ghost')).toBe(false); });
    it('isTopSecret for unknown', () => { expect(v.isTopSecret('ghost')).toBe(false); });
    it('recentAccesses', () => { const x = v.store('A', [], 'public'); v.access('u1', x.id, 0); expect(v.recentAccesses().length).toBe(1); });
    it('countBySecurity', () => { v.store('A', [], 'public'); expect(v.countBySecurity().public).toBe(1); });
    it('report aggregates', () => { v.store('A', []); expect(v.report().total).toBe(1); });
    it('reset clears', () => { v.store('A', []); v.reset(); expect(v.stats.total).toBe(0); });
    it('exposes VAULT_SECURITY', () => { expect(VAULT_SECURITY).toContain('public'); });
});
