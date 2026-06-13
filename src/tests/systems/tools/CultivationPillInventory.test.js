import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationPillInventory,
    PILL_QUALITIES,
    PILL_EFFECT_TYPES,
    PILL_QUALITY_KEYS,
} from '../../../systems/tools/CultivationPillInventory.js';

const HEAL_PILL = {
    pillName: '回气丹',
    quality: 'mortal',
    effects: ['heal'],
    potency: 50,
    duration: 0,
    owner: 'p1',
};

describe('CultivationPillInventory', () => {
    let s;
    beforeEach(() => { s = new CultivationPillInventory(); });

    describe('constructor & defaults', () => {
        it('starts empty', () => {
            expect(s.listAll()).toEqual([]);
        });
        it('accepts custom config', () => {
            const s2 = new CultivationPillInventory({ maxPillsPerOwner: 5, defaultOwner: 'p2' });
            expect(s2.config.maxPillsPerOwner).toBe(5);
            expect(s2.config.defaultOwner).toBe('p2');
        });
        it('exports pill qualities', () => {
            expect(PILL_QUALITY_KEYS.length).toBe(5);
            expect(PILL_QUALITIES.mortal.rank).toBe(1);
        });
        it('exports effect types', () => {
            expect(PILL_EFFECT_TYPES.length).toBe(8);
        });
    });

    describe('storePill', () => {
        it('stores a valid pill', () => {
            const r = s.storePill(HEAL_PILL);
            expect(r.success).toBe(true);
            expect(r.pill.pillName).toBe('回气丹');
        });
        it('rejects invalid pill object', () => {
            const r = s.storePill(null);
            expect(r.success).toBe(false);
        });
        it('rejects missing pillName', () => {
            const r = s.storePill({ quality: 'mortal', effects: ['heal'] });
            expect(r.success).toBe(false);
        });
        it('rejects empty pillName', () => {
            const r = s.storePill({ pillName: '', quality: 'mortal', effects: ['heal'] });
            expect(r.success).toBe(false);
        });
        it('rejects unknown quality', () => {
            const r = s.storePill({ ...HEAL_PILL, quality: 'divine_unknown' });
            expect(r.success).toBe(false);
        });
        it('rejects missing quality', () => {
            const r = s.storePill({ pillName: 'x', effects: ['heal'] });
            expect(r.success).toBe(false);
        });
        it('rejects non-array effects when provided', () => {
            const r = s.storePill({ ...HEAL_PILL, effects: 'not_array' });
            expect(r.success).toBe(false);
        });
        it('rejects non-string owner', () => {
            const r = s.storePill({ ...HEAL_PILL, owner: 123 });
            expect(r.success).toBe(false);
        });
        it('rejects empty owner', () => {
            const r = s.storePill({ ...HEAL_PILL, owner: '' });
            expect(r.success).toBe(false);
        });
        it('respects maxPillsPerOwner', () => {
            const s2 = new CultivationPillInventory({ maxPillsPerOwner: 1 });
            s2.storePill(HEAL_PILL);
            const r = s2.storePill({ ...HEAL_PILL, id: 'second' });
            expect(r.success).toBe(false);
        });
        it('uses defaultOwner when owner undefined', () => {
            const p = { ...HEAL_PILL };
            delete p.owner;
            const r = s.storePill(p);
            expect(r.success).toBe(true);
            expect(r.pill.owner).toBe('cultivator');
        });
        it('uses provided id when not empty', () => {
            const r = s.storePill({ ...HEAL_PILL, id: 'custom_id' });
            expect(r.pill.id).toBe('custom_id');
        });
        it('rejects duplicate id', () => {
            s.storePill({ ...HEAL_PILL, id: 'dup' });
            const r = s.storePill({ ...HEAL_PILL, id: 'dup' });
            expect(r.success).toBe(false);
        });
        it('rejects when autoGenerateId false and no id', () => {
            const s2 = new CultivationPillInventory({ autoGenerateId: false });
            const r = s2.storePill(HEAL_PILL);
            expect(r.success).toBe(false);
        });
        it('normalizes unknown effects to empty', () => {
            const r = s.storePill({ ...HEAL_PILL, effects: ['unknown_effect'] });
            expect(r.success).toBe(true);
            expect(r.pill.effects).toEqual([]);
        });
        it('deduplicates effects', () => {
            const r = s.storePill({ ...HEAL_PILL, effects: ['heal', 'heal', 'mp_restore'] });
            expect(r.pill.effects.length).toBe(2);
        });
    });

    describe('retrievePill', () => {
        let id;
        beforeEach(() => { id = s.storePill(HEAL_PILL).pill.id; });
        it('retrieves a pill by id and requester', () => {
            const r = s.retrievePill(id, 'p1');
            expect(r.success).toBe(true);
        });
        it('rejects unknown pill', () => {
            const r = s.retrievePill('not_found', 'p1');
            expect(r.success).toBe(false);
        });
        it('rejects wrong requester', () => {
            const r = s.retrievePill(id, 'p2');
            expect(r.success).toBe(false);
        });
        it('rejects empty pill id', () => {
            const r = s.retrievePill('', 'p1');
            expect(r.success).toBe(false);
        });
        it('rejects empty requester', () => {
            const r = s.retrievePill(id, '');
            expect(r.success).toBe(false);
        });
        it('removes pill after retrieve', () => {
            s.retrievePill(id, 'p1');
            expect(s.listAll().length).toBe(0);
        });
    });

    describe('list methods', () => {
        beforeEach(() => {
            s.storePill({ ...HEAL_PILL, quality: 'mortal', effects: ['heal'] });
            s.storePill({ ...HEAL_PILL, id: 'p2', quality: 'spirit', effects: ['mp_restore'], owner: 'p1' });
            s.storePill({ ...HEAL_PILL, id: 'p3', quality: 'heaven', effects: ['cultivation_boost'], owner: 'p2' });
        });
        it('listByQuality mortal', () => {
            expect(s.listByQuality('mortal').length).toBe(1);
        });
        it('listByQuality spirit', () => {
            expect(s.listByQuality('spirit').length).toBe(1);
        });
        it('listByQuality returns empty for unknown', () => {
            expect(s.listByQuality('unknown')).toEqual([]);
        });
        it('listByOwner p1', () => {
            expect(s.listByOwner('p1').length).toBe(2);
        });
        it('listByOwner p2', () => {
            expect(s.listByOwner('p2').length).toBe(1);
        });
        it('listByOwner returns empty for unknown', () => {
            expect(s.listByOwner('unknown')).toEqual([]);
        });
        it('listByOwner rejects empty', () => {
            expect(s.listByOwner('')).toEqual([]);
        });
        it('listAll returns all', () => {
            expect(s.listAll().length).toBe(3);
        });
        it('listQualities', () => {
            expect(s.listQualities().length).toBe(5);
        });
        it('listEffectTypes', () => {
            expect(s.listEffectTypes().length).toBe(8);
        });
        it('listOwners', () => {
            expect(s.listOwners().length).toBe(2);
        });
        it('listByEffect heal', () => {
            expect(s.listByEffect('heal').length).toBe(1);
        });
        it('listByEffect returns empty for unknown', () => {
            expect(s.listByEffect('not_a_real_effect')).toEqual([]);
        });
    });

    describe('sortByPotency', () => {
        beforeEach(() => {
            s.storePill({ ...HEAL_PILL, id: 'a1', potency: 50, owner: 'p1' });
            s.storePill({ ...HEAL_PILL, id: 'a2', potency: 100, owner: 'p1' });
            s.storePill({ ...HEAL_PILL, id: 'a3', potency: 75, owner: 'p1' });
        });
        it('sorts desc', () => {
            const r = s.sortByPotency('desc');
            expect(r.pills[0].potency).toBe(100);
            expect(r.pills[2].potency).toBe(50);
        });
        it('sorts asc', () => {
            const r = s.sortByPotency('asc');
            expect(r.pills[0].potency).toBe(50);
            expect(r.pills[2].potency).toBe(100);
        });
        it('default order asc', () => {
            const r = s.sortByPotency();
            expect(r.pills[0].potency).toBe(50);
        });
        it('rejects invalid order', () => {
            const r = s.sortByPotency('sideways');
            expect(r.success).toBe(false);
        });
    });

    describe('usePill', () => {
        let id;
        beforeEach(() => { id = s.storePill(HEAL_PILL).pill.id; });
        it('uses a pill on a target', () => {
            const target = { name: 'cultivator1', id: 't1' };
            const r = s.usePill(id, target);
            expect(r.success).toBe(true);
            expect(target._appliedEffects.length).toBe(1);
        });
        it('removes pill from inventory', () => {
            const target = { id: 't1' };
            s.usePill(id, target);
            expect(s.listAll().length).toBe(0);
        });
        it('rejects unknown pill', () => {
            const r = s.usePill('not_found', { id: 't1' });
            expect(r.success).toBe(false);
        });
        it('rejects empty pill id', () => {
            const r = s.usePill('', { id: 't1' });
            expect(r.success).toBe(false);
        });
        it('rejects invalid target', () => {
            const r = s.usePill(id, null);
            expect(r.success).toBe(false);
        });
        it('rejects missing target', () => {
            const r = s.usePill(id);
            expect(r.success).toBe(false);
        });
        it('rejects non-object target', () => {
            const r = s.usePill(id, 'not_obj');
            expect(r.success).toBe(false);
        });
        it('rejects expired pill', () => {
            s.storePill({ ...HEAL_PILL, id: 'exp', expiresAt: Date.now() - 1000 });
            const r = s.usePill('exp', { id: 't1' });
            expect(r.success).toBe(false);
        });
        it('logs use', () => {
            const target = { id: 't1' };
            s.usePill(id, target);
            expect(s.getUseLog().length).toBe(1);
        });
        it('applies multiple effects', () => {
            s.storePill({ ...HEAL_PILL, id: 'multi', effects: ['heal', 'mp_restore', 'exp_boost'] });
            const target = { id: 't1' };
            s.usePill('multi', target);
            expect(target._appliedEffects.length).toBe(3);
        });
        it('records potency in applied effects', () => {
            const target = { id: 't1' };
            s.usePill(id, target);
            expect(target._appliedEffects[0].potency).toBe(HEAL_PILL.potency);
        });
        it('records duration in applied effects', () => {
            const target = { id: 't1' };
            s.usePill(id, target);
            expect(target._appliedEffects[0].duration).toBe(HEAL_PILL.duration);
        });
    });

    describe('discardExpired', () => {
        it('discards expired pills', () => {
            s.storePill({ ...HEAL_PILL, id: 'exp1', expiresAt: Date.now() - 1000 });
            s.storePill({ ...HEAL_PILL, id: 'ok', expiresAt: Date.now() + 100000 });
            const r = s.discardExpired();
            expect(r.success).toBe(true);
            expect(r.count).toBe(1);
            expect(s.listAll().length).toBe(1);
        });
        it('returns empty when none expired', () => {
            s.storePill({ ...HEAL_PILL, id: 'ok1', expiresAt: Date.now() + 100000 });
            const r = s.discardExpired();
            expect(r.count).toBe(0);
        });
        it('keeps pills without expiresAt', () => {
            s.storePill({ ...HEAL_PILL, id: 'noexp' });
            const r = s.discardExpired();
            expect(s.listAll().length).toBe(1);
        });
        it('updates stats', () => {
            s.storePill({ ...HEAL_PILL, id: 'exp1', expiresAt: Date.now() - 1000 });
            s.discardExpired();
            expect(s.getStats().totalDiscarded).toBe(1);
        });
    });

    describe('getPill', () => {
        it('returns pill by id', () => {
            const id = s.storePill(HEAL_PILL).pill.id;
            const p = s.getPill(id);
            expect(p.pillName).toBe(HEAL_PILL.pillName);
        });
        it('returns null for unknown id', () => {
            expect(s.getPill('unknown')).toBe(null);
        });
        it('returns null for empty id', () => {
            expect(s.getPill('')).toBe(null);
        });
    });

    describe('getInventoryStats', () => {
        it('returns stats', () => {
            s.storePill({ ...HEAL_PILL, quality: 'mortal', effects: ['heal'] });
            s.storePill({ ...HEAL_PILL, id: 'p2', quality: 'spirit', effects: ['mp_restore'] });
            const stats = s.getInventoryStats();
            expect(stats.totalPills).toBe(2);
            expect(stats.byQuality.mortal).toBe(1);
            expect(stats.byEffect.heal).toBe(1);
        });
        it('empty stats', () => {
            const stats = s.getInventoryStats();
            expect(stats.totalPills).toBe(0);
        });
    });

    describe('registerTool / executeTool / registerHook', () => {
        it('registerTool + executeTool', () => {
            s.registerTool('listAll', () => s.listAll());
            const r = s.executeTool('listAll', {});
            expect(r.success).toBe(true);
        });
        it('executeTool missing context', () => {
            s.registerTool('noop', () => 'ok');
            const r = s.executeTool('noop');
            expect(r.success).toBe(true);
        });
        it('executeTool unknown tool', () => {
            const r = s.executeTool('unknown');
            expect(r.success).toBe(false);
        });
        it('executeTool catches handler error', () => {
            s.registerTool('boom', () => { throw new Error('x'); });
            const r = s.executeTool('boom');
            expect(r.success).toBe(false);
        });
        it('registerHook + trigger onStore', () => {
            let called = false;
            s.registerHook('onStore', () => { called = true; });
            s.storePill(HEAL_PILL);
            expect(called).toBe(true);
        });
        it('registerHook + trigger onUse', () => {
            const id = s.storePill(HEAL_PILL).pill.id;
            let called = false;
            s.registerHook('onUse', () => { called = true; });
            s.usePill(id, { id: 't1' });
            expect(called).toBe(true);
        });
        it('unregisterHook removes', () => {
            const h = () => {};
            s.registerHook('onStore', h);
            const r = s.unregisterHook('onStore', h);
            expect(r.success).toBe(true);
        });
    });

    describe('toJSON / fromJSON / getStats / autoEvolve / reset', () => {
        it('toJSON returns serializable', () => {
            s.storePill(HEAL_PILL);
            const json = s.toJSON();
            expect(typeof json).toBe('object');
        });
        it('fromJSON restores', () => {
            s.storePill(HEAL_PILL);
            const json = s.toJSON();
            const s2 = new CultivationPillInventory();
            const r = s2.fromJSON(json);
            expect(r.success).toBe(true);
        });
        it('fromJSON null', () => {
            const r = s.fromJSON(null);
            expect(r.success).toBe(false);
        });
        it('fromJSON partial', () => {
            const r = s.fromJSON({ pills: [] });
            expect(r.success).toBe(true);
        });
        it('getStats', () => {
            s.storePill(HEAL_PILL);
            const stats = s.getStats();
            expect(stats.totalPills).toBe(1);
            expect(stats.totalStored).toBe(1);
        });
        it('autoEvolve', () => {
            const r = s.autoEvolve();
            expect(r.success).toBe(true);
            expect(r.evolutionCount).toBe(1);
        });
        it('reset', () => {
            s.storePill(HEAL_PILL);
            s.reset();
            expect(s.listAll().length).toBe(0);
        });
        it('reset clears stats', () => {
            s.storePill(HEAL_PILL);
            s.reset();
            expect(s.getStats().totalStored).toBe(0);
        });
    });

    describe('all branches', () => {
        it('registerTool: invalid name', () => {
            const r = s.registerTool('', () => {});
            expect(r.success).toBe(false);
        });
        it('registerTool: non-string name', () => {
            const r = s.registerTool(123, () => {});
            expect(r.success).toBe(false);
        });
        it('registerTool: non-function handler', () => {
            const r = s.registerTool('foo', 'not_func');
            expect(r.success).toBe(false);
        });
        it('registerHook: invalid event', () => {
            const r = s.registerHook('', () => {});
            expect(r.success).toBe(false);
        });
        it('registerHook: non-string event', () => {
            const r = s.registerHook(123, () => {});
            expect(r.success).toBe(false);
        });
        it('registerHook: non-function handler', () => {
            const r = s.registerHook('onStore', 'not_func');
            expect(r.success).toBe(false);
        });
        it('registerHook + handler throws', () => {
            s.registerHook('onStore', () => { throw new Error('x'); });
            const r = s.storePill(HEAL_PILL);
            expect(r.success).toBe(true);
        });
        it('unregisterHook: unknown event', () => {
            const r = s.unregisterHook('unknown_event', () => {});
            expect(r.success).toBe(false);
        });
        it('unregisterHook: handler not in list', () => {
            s.registerHook('onStore', () => {});
            const r = s.unregisterHook('onStore', () => {});
            expect(r.success).toBe(false);
        });
        it('clone isolation on read', () => {
            s.storePill(HEAL_PILL);
            const a = s.listAll()[0];
            const b = s.listAll()[0];
            expect(a).not.toBe(b);
        });
        it('listByEffect heal full branch', () => {
            const r = s.storePill({ ...HEAL_PILL, effects: ['heal', 'mp_restore'] });
            expect(r.pill.effects.length).toBe(2);
            expect(s.listByEffect('heal').length).toBe(1);
            expect(s.listByEffect('mp_restore').length).toBe(1);
        });
        it('usePill returns appliedEffects', () => {
            const id = s.storePill(HEAL_PILL).pill.id;
            const r = s.usePill(id, { id: 't1' });
            expect(r.appliedEffects[0].effect).toBe('heal');
        });
        it('discardExpired updates byEffect stats', () => {
            s.storePill({ ...HEAL_PILL, id: 'exp', expiresAt: Date.now() - 1000, effects: ['heal'] });
            s.discardExpired();
            expect(s.getStats().byEffect.heal).toBe(0);
        });
    });
});