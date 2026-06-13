/**
 * MotivationBooster.test.js - V971 Iter 24/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { MotivationBooster, MOTIVATION_KINDS, BOOST_TIMING } from '../../../systems/ai/MotivationBooster.js';

describe('MotivationBooster', () => {
    let b;
    beforeEach(() => { b = new MotivationBooster(); });

    it('initializes with defaults', () => { expect(b.stats.totalDelivered).toBe(0); });

    it('addMessage adds valid', () => {
        expect(b.addMessage('achievement', '你做到了！')).toBe(true);
    });

    it('addMessage rejects invalid kind', () => { expect(b.addMessage('invalid', 'x')).toBe(false); });

    it('getMessagesFor returns all', () => {
        b.addMessage('achievement', 'msg1');
        b.addMessage('achievement', 'msg2');
        expect(b.getMessagesFor('achievement').length).toBe(2);
    });

    it('getMessagesFor for unknown returns []', () => { expect(b.getMessagesFor('unknown').length).toBe(0); });

    it('boost returns message', () => {
        b.addMessage('achievement', 'test');
        const r = b.boost('p1', 'achievement');
        expect(r).not.toBeNull();
        expect(b.stats.totalDelivered).toBe(1);
    });

    it('boost rejects invalid kind', () => { expect(b.boost('p1', 'invalid')).toBeNull(); });
    it('boost rejects invalid timing', () => { expect(b.boost('p1', 'achievement', 'invalid')).toBeNull(); });
    it('boost returns null for empty kind', () => { expect(b.boost('p1', 'achievement')).toBeNull(); });

    it('boostForMotivation uses dominant', () => {
        b.addMessage('achievement', 'msg');
        expect(b.boostForMotivation('p1', 'achievement')).not.toBeNull();
    });

    it('boostForMotivation for null returns null', () => { expect(b.boostForMotivation('p1', null)).toBeNull(); });

    it('listDelivered returns history', () => {
        b.addMessage('achievement', 'msg');
        b.boost('p1', 'achievement');
        expect(b.listDelivered('p1').length).toBe(1);
    });

    it('listDelivered for unknown returns []', () => { expect(b.listDelivered('p1').length).toBe(0); });

    it('countByKind aggregates', () => {
        b.addMessage('achievement', 'm1');
        b.addMessage('social', 'm2');
        b.boost('p1', 'achievement');
        b.boost('p1', 'social');
        const counts = b.countByKind('p1');
        expect(counts.achievement).toBe(1);
        expect(counts.social).toBe(1);
    });

    it('isTimeForBoost true for new player', () => { expect(b.isTimeForBoost('p1')).toBe(true); });
    it('isTimeForBoost false within cooldown', () => {
        b.addMessage('achievement', 'm');
        b.boost('p1', 'achievement');
        expect(b.isTimeForBoost('p1', 60000)).toBe(false);
    });
    it('isTimeForBoost true after cooldown', () => {
        b.addMessage('achievement', 'm');
        b.boost('p1', 'achievement');
        return new Promise((r) => setTimeout(() => {
            expect(b.isTimeForBoost('p1', 0)).toBe(true);
            r();
        }, 5));
    });

    it('triggers boosted hook', () => {
        let called = false;
        b.registerHook('boosted', () => { called = true; });
        b.addMessage('achievement', 'm');
        b.boost('p1', 'achievement');
        expect(called).toBe(true);
    });

    it('report aggregates', () => {
        b.addMessage('achievement', 'm');
        b.boost('p1', 'achievement');
        const r = b.report('p1');
        expect(r.totalDelivered).toBe(1);
    });

    it('caps delivery history at 100', () => {
        b.addMessage('achievement', 'm');
        for (let i = 0; i < 150; i++) b.boost('p1', 'achievement');
        expect(b.listDelivered('p1').length).toBeLessThanOrEqual(100);
    });

    it('reset clears', () => {
        b.addMessage('achievement', 'm');
        b.reset();
        expect(b.messages.size).toBe(0);
    });

    it('exposes MOTIVATION_KINDS and BOOST_TIMING', () => {
        expect(MOTIVATION_KINDS).toContain('achievement');
        expect(BOOST_TIMING).toContain('immediate');
    });
});
