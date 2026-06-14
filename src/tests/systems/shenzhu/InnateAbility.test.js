import { describe, it, expect, beforeEach } from 'vitest';
import { InnateAbility, ABILITY_TIERS } from '../../../systems/shenzhu/InnateAbility.js';

describe('InnateAbility', () => {
    let a;
    beforeEach(() => { a = new InnateAbility(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('grant', () => { expect(a.grant('A', 'combat')).not.toBeNull(); });
    it('grant rejects missing', () => { expect(a.grant('', 'combat')).toBeNull(); });
    it('grant normalizes invalid type', () => { const x = a.grant('A', 'invalid'); expect(x.type).toBe('combat'); });
    it('grant normalizes invalid tier', () => { const x = a.grant('A', 'combat', 'invalid'); expect(x.tier).toBe('common'); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByTier and listLegendary', () => {
        a.grant('A', 'combat', 'common', 1, 'p1');
        a.grant('A', 'support', 'legendary', 1, 'p1');
        a.grant('B', 'combat', 'mythic', 1, 'p2');
        expect(a.listAll().length).toBe(3);
        expect(a.listByOwner('p1').length).toBe(2);
        expect(a.listByType('combat').length).toBe(2);
        expect(a.listByTier('mythic').length).toBe(1);
        expect(a.listLegendary().length).toBe(2);
    });
    it('setPower', () => { const x = a.grant('A', 'combat'); a.setPower(x.id, 50); expect(a.powerOf(x.id)).toBe(50); });
    it('setPower clamps', () => { const x = a.grant('A', 'combat'); a.setPower(x.id, -5); expect(a.powerOf(x.id)).toBe(0); });
    it('setPower returns false for unknown', () => { expect(a.setPower('ghost', 5)).toBe(false); });
    it('setCooldown and setOwner', () => { const x = a.grant('A'); a.setCooldown(x.id, 5); a.setOwner(x.id, 'B'); expect(x.cooldown).toBe(5); expect(x.owner).toBe('B'); });
    it('setCooldown returns false for unknown', () => { expect(a.setCooldown('ghost', 5)).toBe(false); });
    it('setOwner returns false for unknown', () => { expect(a.setOwner('ghost', 'A')).toBe(false); });
    it('isLegendary and isMythic', () => { const x = a.grant('A', 'combat', 'mythic'); expect(a.isLegendary(x.id)).toBe(true); expect(a.isMythic(x.id)).toBe(true); });
    it('isLegendary for unknown', () => { expect(a.isLegendary('ghost')).toBe(false); });
    it('powerOf and typeOf and tierOf and ownerOf for unknown', () => { expect(a.powerOf('ghost')).toBe(0); expect(a.typeOf('ghost')).toBeNull(); expect(a.tierOf('ghost')).toBeNull(); expect(a.ownerOf('ghost')).toBeNull(); });
    it('averagePower', () => { a.grant('A', 'combat', 'common', 5); expect(a.averagePower()).toBe(5); });
    it('bestPower', () => { a.grant('A', 'combat', 'common', 5); expect(a.bestPower()).not.toBeNull(); });
    it('bestPower null for empty', () => { expect(a.bestPower()).toBeNull(); });
    it('countByTier', () => { a.grant('A', 'combat', 'legendary'); expect(a.countByTier().legendary).toBe(1); });
    it('report aggregates', () => { a.grant('A'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.grant('A'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes ABILITY_TIERS', () => { expect(ABILITY_TIERS).toContain('legendary'); });
});
