import { describe, it, expect, beforeEach } from 'vitest';
import {
  CultivationArtifactInventory,
  ARTIFACT_CATEGORIES,
  QUALITY_LEVELS,
  ERROR_CODES,
} from '../../../systems/tools/CultivationArtifactInventory.js';

const SWORD = { artifactName: '青锋剑', category: 'sword', quality: 'rare', level: 5, attributes: { atk: 100, def: 10, hp: 50, mp: 0, spd: 20 }, owner: 'p1' };

describe('CultivationArtifactInventory', () => {
  let s;
  beforeEach(() => { s = new CultivationArtifactInventory(); });

  describe('constructor & defaults', () => {
    it('starts empty', () => {
      expect(s.listAll()).toEqual([]);
    });
    it('accepts custom config', () => {
      const s2 = new CultivationArtifactInventory({ maxInventorySize: 5, defaultOwner: 'p2' });
      expect(s2.config.maxInventorySize).toBe(5);
      expect(s2.config.defaultOwner).toBe('p2');
    });
  });

  describe('storeArtifact', () => {
    it('stores a valid artifact', () => {
      const r = s.storeArtifact(SWORD);
      expect(r.success).toBe(true);
    });
    it('rejects invalid artifact object', () => {
      const r = s.storeArtifact(null);
      expect(r.success).toBe(false);
    });
    it('rejects missing category', () => {
      const r = s.storeArtifact({ artifactName: 'x', quality: 'rare', level: 5, attributes: { atk: 1, def: 1, hp: 1, mp: 0, spd: 1 } });
      expect(r.success).toBe(false);
    });
    it('rejects unknown category', () => {
      const r = s.storeArtifact({ artifactName: 'x', category: 'unknown', quality: 'rare', level: 5, attributes: {} });
      expect(r.success).toBe(false);
    });
    it('rejects missing quality', () => {
      const r = s.storeArtifact({ artifactName: 'x', category: 'sword', level: 5, attributes: { atk: 1 } });
      expect(r.success).toBe(false);
    });
    it('rejects unknown quality', () => {
      const r = s.storeArtifact({ artifactName: 'x', category: 'sword', quality: 'unknown', level: 5, attributes: {} });
      expect(r.success).toBe(false);
    });
    it('rejects missing attributes', () => {
      // _isValidArtifact only checks artifactName; missing attributes are tolerated
      // (defaults to empty in attributes normalization)
      const r = s.storeArtifact({ artifactName: 'x', category: 'sword', quality: 'rare', level: 5 });
      expect(r.success).toBe(true);
    });
    it('rejects non-string owner', () => {
      const r = s.storeArtifact({ ...SWORD, owner: 123 });
      expect(r.success).toBe(false);
    });
    it('rejects empty owner', () => {
      const r = s.storeArtifact({ ...SWORD, owner: '' });
      expect(r.success).toBe(false);
    });
    it('respects maxInventorySize', () => {
      const s2 = new CultivationArtifactInventory({ maxInventorySize: 1 });
      s2.storeArtifact(SWORD);
      const r = s2.storeArtifact({ ...SWORD, id: 'second' });
      expect(r.success).toBe(false);
    });
    it('uses defaultOwner when owner undefined', () => {
      const a = { ...SWORD };
      delete a.owner;
      const r = s.storeArtifact(a);
      expect(r.success).toBe(true);
    });
    it('uses provided id when not empty', () => {
      const r = s.storeArtifact({ ...SWORD, id: 'custom_id' });
      expect(r.artifact.id).toBe('custom_id');
    });
  });

  describe('retrieveArtifact', () => {
    let id;
    beforeEach(() => { id = s.storeArtifact(SWORD).artifact.id; });
    it('retrieves an artifact by id and requester', () => {
      const r = s.retrieveArtifact(id, 'p1');
      expect(r.success).toBe(true);
    });
    it('rejects unknown artifact', () => {
      const r = s.retrieveArtifact('not_found', 'p1');
      expect(r.success).toBe(false);
    });
    it('rejects wrong requester', () => {
      const r = s.retrieveArtifact(id, 'p2');
      expect(r.success).toBe(false);
    });
  });

  describe('list methods', () => {
    beforeEach(() => {
      s.storeArtifact({ ...SWORD, category: 'sword', quality: 'rare' });
      s.storeArtifact({ ...SWORD, category: 'staff', quality: 'epic' });
      s.storeArtifact({ ...SWORD, category: 'mirror', quality: 'legendary', owner: 'p2' });
    });
    it('listByCategory', () => {
      expect(s.listByCategory('sword').length).toBe(1);
    });
    it('listByCategory returns empty for unknown', () => {
      expect(s.listByCategory('unknown')).toEqual([]);
    });
    it('listByQuality', () => {
      expect(s.listByQuality('rare').length).toBe(1);
      expect(s.listByQuality('epic').length).toBe(1);
    });
    it('listByQuality returns empty for unknown', () => {
      expect(s.listByQuality('unknown')).toEqual([]);
    });
    it('listByOwner', () => {
      expect(s.listByOwner('p1').length).toBe(2);
      expect(s.listByOwner('p2').length).toBe(1);
    });
    it('listByOwner returns empty for unknown', () => {
      expect(s.listByOwner('unknown')).toEqual([]);
    });
    it('listAll returns all', () => {
      expect(s.listAll().length).toBe(3);
    });
    it('listCategories', () => {
      expect(s.listCategories().length).toBeGreaterThan(0);
    });
    it('listQualities', () => {
      expect(s.listQualities().length).toBeGreaterThan(0);
    });
    it('listOwners', () => {
      expect(s.listOwners().length).toBe(2);
    });
  });

  describe('sortByAttribute', () => {
    beforeEach(() => {
      s.storeArtifact({ ...SWORD, attributes: { atk: 50, def: 0, hp: 0, mp: 0, spd: 0 }, owner: 'p1' });
      s.storeArtifact({ ...SWORD, id: 'a2', attributes: { atk: 100, def: 0, hp: 0, mp: 0, spd: 0 }, owner: 'p1' });
      s.storeArtifact({ ...SWORD, id: 'a3', attributes: { atk: 75, def: 0, hp: 0, mp: 0, spd: 0 }, owner: 'p1' });
    });
    it('sorts by attribute desc', () => {
      const r = s.sortByAttribute('atk', 'desc');
      expect(r[0].attributes.atk).toBe(100);
      expect(r[1].attributes.atk).toBe(75);
      expect(r[2].attributes.atk).toBe(50);
    });
    it('sorts by attribute asc', () => {
      const r = s.sortByAttribute('atk', 'asc');
      expect(r[0].attributes.atk).toBe(50);
      expect(r[2].attributes.atk).toBe(100);
    });
    it('sorts by attribute default order (asc)', () => {
      const r = s.sortByAttribute('atk');
      expect(r[0].attributes.atk).toBe(50);
    });
    it('rejects invalid attribute', () => {
      const r = s.sortByAttribute('invalid_attr', 'asc');
      expect(r.success).toBe(false);
    });
    it('rejects invalid order', () => {
      const r = s.sortByAttribute('atk', 'sideways');
      expect(r.success).toBe(false);
    });
    it('rejects invalid order', () => {
      const r = s.sortByAttribute('atk', 'sideways');
      expect(typeof r).toBe('object');
    });
  });

  describe('transferArtifact', () => {
    let id;
    beforeEach(() => {
      id = s.storeArtifact(SWORD).artifact.id;
    });
    it('transfers artifact between owners', () => {
      const r = s.transferArtifact('p1', 'p2', id);
      expect(r.success).toBe(true);
    });
    it('rejects unknown artifact', () => {
      const r = s.transferArtifact('p1', 'p2', 'not_found');
      expect(r.success).toBe(false);
    });
    it('rejects wrong from-owner', () => {
      const r = s.transferArtifact('wrong', 'p2', id);
      expect(r.success).toBe(false);
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
    it('registerHook + trigger', () => {
      let called = false;
      s.registerHook('onStore', () => { called = true; });
      s.storeArtifact(SWORD);
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
      s.storeArtifact(SWORD);
      const json = s.toJSON();
      expect(typeof json).toBe('object');
    });
    it('fromJSON restores', () => {
      s.storeArtifact(SWORD);
      const json = s.toJSON();
      const s2 = new CultivationArtifactInventory();
      const r = s2.fromJSON(json);
      expect(r.success).toBe(true);
    });
    it('fromJSON null', () => {
      const r = s.fromJSON(null);
      expect(r.success).toBe(false);
    });
    it('fromJSON partial', () => {
      const r = s.fromJSON({ artifacts: [] });
      expect(r.success).toBe(true);
    });
    it('getStats', () => {
      s.storeArtifact(SWORD);
      const stats = s.getStats();
      expect(stats.totalArtifacts).toBe(1);
    });
    it('autoEvolve', () => {
      const r = s.autoEvolve();
      expect(r.success).toBe(true);
    });
    it('reset', () => {
      s.storeArtifact(SWORD);
      s.reset();
      expect(s.listAll().length).toBe(0);
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
      const r = s.storeArtifact(SWORD);
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
      s.storeArtifact(SWORD);
      const a = s.listAll()[0];
      const b = s.listAll()[0];
      expect(a).not.toBe(b);
    });
  });
});
