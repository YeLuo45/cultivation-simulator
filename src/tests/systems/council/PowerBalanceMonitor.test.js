import { describe, it, expect, beforeEach } from 'vitest';
import { PowerBalanceMonitor } from '../../../systems/council/PowerBalanceMonitor.js';

describe('PowerBalanceMonitor', () => {
    let m;
    beforeEach(() => { m = new PowerBalanceMonitor(); });
    it('initializes with defaults', () => { expect(m.stats.alerts).toBe(0); });
    it('updateRole', () => { expect(m.updateRole('master', 50, 1)).toBe(true); });
    it('updateRole rejects zero members', () => { expect(m.updateRole('master', 50, 0)).toBe(false); });
    it('getRole returns null for unknown', () => { expect(m.getRole('ghost')).toBeNull(); });
    it('listAll', () => { m.updateRole('master', 50, 1); expect(m.listAll().length).toBe(1); });
    it('concentrationIndex', () => {
        m.updateRole('master', 50, 1);
        m.updateRole('elder', 50, 1);
        expect(m.concentrationIndex()).toBeGreaterThan(0);
    });
    it('isBalanced for equal', () => {
        m.updateRole('master', 50, 1);
        m.updateRole('elder', 50, 1);
        m.updateRole('disciple', 50, 1);
        m.updateRole('outer', 50, 1);
        m.updateRole('extra', 50, 1);
        expect(m.isBalanced()).toBe(true);
    });
    it('isBalanced for imbalanced', () => {
        m.updateRole('master', 1000, 1);
        expect(m.isBalanced()).toBe(false);
    });
    it('dominantRole', () => {
        m.updateRole('master', 100, 1);
        m.updateRole('elder', 50, 1);
        expect(m.dominantRole()).toBe('master');
    });
    it('dominantRole for empty returns null', () => { expect(m.dominantRole()).toBeNull(); });
    it('isDominant', () => { m.updateRole('master', 100, 1); expect(m.isDominant('master')).toBe(true); });
    it('powerRatio', () => {
        m.updateRole('master', 50, 1);
        m.updateRole('elder', 50, 1);
        expect(m.powerRatio('master')).toBe(0.5);
    });
    it('triggers alert on critical', () => {
        let called = false;
        m.registerHook('alert', () => { called = true; });
        m.updateRole('master', 1000, 1);
        expect(called).toBe(true);
    });
    it('recentAlerts', () => { m.updateRole('master', 1000, 1); expect(m.recentAlerts().length).toBeGreaterThan(0); });
    it('clearAlerts', () => { m.updateRole('master', 1000, 1); m.clearAlerts(); expect(m.alerts.length).toBe(0); });
    it('report aggregates', () => { m.updateRole('master', 50, 1); expect(m.report()).toBeDefined(); });
    it('reset clears', () => { m.updateRole('master', 50, 1); m.reset(); expect(m.powers.size).toBe(0); });
});
