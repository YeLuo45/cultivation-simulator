import { describe, it, expect, beforeEach } from 'vitest';
import { CounterEspionage, COUNTER_METHODS } from '../../../systems/intel/CounterEspionage.js';

describe('CounterEspionage', () => {
    let e;
    beforeEach(() => { e = new CounterEspionage(); });
    it('initializes with defaults', () => { expect(e.stats.total).toBe(0); });
    it('plan', () => { expect(e.plan('Target1')).not.toBeNull(); });
    it('plan rejects missing', () => { expect(e.plan('')).toBeNull(); });
    it('plan normalizes invalid method', () => { const x = e.plan('A', 'invalid'); expect(x.method).toBe('double_agent'); });
    it('get returns null for unknown', () => { expect(e.get('ghost')).toBeNull(); });
    it('listAll and listByStatus and listByMethod and listByTarget', () => {
        e.plan('A', 'sabotage');
        e.plan('B', 'exposure');
        expect(e.listAll().length).toBe(2);
        expect(e.listByStatus('planning').length).toBe(2);
        expect(e.listByMethod('sabotage').length).toBe(1);
    });
    it('execute', () => { const x = e.plan('A'); expect(e.execute(x.id)).toBe(true); });
    it('execute fails for non-planning', () => { const x = e.plan('A'); e.execute(x.id); expect(e.execute(x.id)).toBe(false); });
    it('execute returns false for unknown', () => { expect(e.execute('ghost')).toBe(false); });
    it('succeed', () => { const x = e.plan('A'); e.execute(x.id); e.succeed(x.id); expect(e.stats.successful).toBe(1); });
    it('succeed returns false for unknown', () => { expect(e.succeed('ghost')).toBe(false); });
    it('fail', () => { const x = e.plan('A'); e.fail(x.id); expect(e.stats.failed).toBe(1); });
    it('fail returns false for unknown', () => { expect(e.fail('ghost')).toBe(false); });
    it('expose', () => { const x = e.plan('A'); e.expose(x.id); expect(e.isExposed(x.id)).toBe(true); });
    it('expose returns false for unknown', () => { expect(e.expose('ghost')).toBe(false); });
    it('setMethod and setSuccessRate', () => { const x = e.plan('A'); e.setMethod(x.id, 'disinformation'); e.setSuccessRate(x.id, 0.9); expect(x.method).toBe('disinformation'); });
    it('setMethod rejects invalid', () => { const x = e.plan('A'); expect(e.setMethod(x.id, 'invalid')).toBe(false); });
    it('setMethod returns false for unknown', () => { expect(e.setMethod('ghost', 'sabotage')).toBe(false); });
    it('setSuccessRate clamps', () => { const x = e.plan('A'); e.setSuccessRate(x.id, 2); expect(x.successRate).toBe(1); });
    it('setSuccessRate returns false for unknown', () => { expect(e.setSuccessRate('ghost', 0.5)).toBe(false); });
    it('isSuccessful and isFailed and isExposed', () => { const x = e.plan('A'); e.execute(x.id); e.succeed(x.id); expect(e.isSuccessful(x.id)).toBe(true); });
    it('isFailed for unknown', () => { expect(e.isFailed('ghost')).toBe(false); });
    it('successRate', () => { const x = e.plan('A'); e.succeed(x.id); expect(e.successRate()).toBe(1); });
    it('report aggregates', () => { e.plan('A'); expect(e.report().total).toBe(1); });
    it('reset clears', () => { e.plan('A'); e.reset(); expect(e.stats.total).toBe(0); });
    it('exposes COUNTER_METHODS', () => { expect(COUNTER_METHODS).toContain('sabotage'); });
});
