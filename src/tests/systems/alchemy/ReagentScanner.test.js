import { describe, it, expect, beforeEach } from 'vitest';
import { ReagentScanner, SCAN_RESULTS } from '../../../systems/alchemy/ReagentScanner.js';

describe('ReagentScanner', () => {
    let s;
    beforeEach(() => { s = new ReagentScanner(); });
    it('initializes with defaults', () => { expect(s.stats.totalScans).toBe(0); });
    it('scan', () => { expect(s.scan('herb1', 95)).not.toBeNull(); });
    it('scan rejects missing', () => { expect(s.scan('', 95)).toBeNull(); });
    it('scan result is identified for high purity', () => { const x = s.scan('a', 95); expect(x.result).toBe('identified'); });
    it('scan result is impure for mid purity', () => { const x = s.scan('a', 60); expect(x.result).toBe('impure'); });
    it('scan result is unknown for low purity', () => { const x = s.scan('a', 30); expect(x.result).toBe('unknown'); });
    it('scan result is fraudulent for very low', () => { const x = s.scan('a', 10); expect(x.result).toBe('fraudulent'); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll and listForItem and listByResult', () => {
        s.scan('a', 95);
        s.scan('a', 10);
        s.scan('b', 95);
        expect(s.listAll().length).toBe(3);
        expect(s.listForItem('a').length).toBe(2);
        expect(s.listByResult('identified').length).toBe(2);
    });
    it('isAuthentic and isImpure and isFraudulent', () => {
        const x = s.scan('a', 95);
        expect(s.isAuthentic(x.id)).toBe(true);
    });
    it('isFraudulent true', () => { const x = s.scan('a', 10); expect(s.isFraudulent(x.id)).toBe(true); });
    it('averagePurity', () => { s.scan('a', 90); s.scan('b', 50); expect(s.averagePurity()).toBe(70); });
    it('purityFor', () => { s.scan('a', 90); s.scan('a', 50); expect(s.purityFor('a')).toBe(70); });
    it('purityFor null for no scans', () => { expect(s.purityFor('a')).toBeNull(); });
    it('scanCount', () => { s.scan('a', 90); s.scan('a', 80); expect(s.scanCount('a')).toBe(2); });
    it('successRate', () => { s.scan('a', 95); s.scan('b', 10); expect(s.successRate()).toBe(0.5); });
    it('fraudCount', () => { s.scan('a', 10); s.scan('b', 5); expect(s.fraudCount()).toBe(2); });
    it('report aggregates', () => { s.scan('a', 95); expect(s.report().totalScans).toBe(1); });
    it('reset clears', () => { s.scan('a', 95); s.reset(); expect(s.stats.totalScans).toBe(0); });
    it('exposes SCAN_RESULTS', () => { expect(SCAN_RESULTS).toContain('identified'); });
});
