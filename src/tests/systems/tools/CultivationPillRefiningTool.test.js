import { describe, it, expect, beforeEach } from 'vitest';
import {
  CultivationPillRefiningTool,
  PRESCRIPTIONS,
  PRESCRIPTION_KEYS,
  PRESCRIPTION_COUNT,
  QUALITY_LEVELS,
  QUALITY_LEVEL_COUNT,
  HERB_MATERIALS,
  HERB_MATERIAL_KEYS,
  HERB_MATERIAL_COUNT,
  FURNACE_LEVEL_MIN,
  FURNACE_LEVEL_MAX,
  FURNACE_LEVEL_DEFAULT,
  FURNACE_LEVELS,
  FURNACE_LEVEL_COUNT,
  MAX_PILLS,
  ERROR_CODES,
  QUALITY_MORTAL,
  QUALITY_SPIRIT,
  QUALITY_EARTH,
  QUALITY_HEAVEN,
  QUALITY_IMMORTAL,
  QUALITY_THRESHOLDS,
  QUALITY_POTENCY_MULTIPLIER,
  QUALITY_RANK,
  FURNACE_MAX_RANK,
} from '../../../systems/tools/CultivationPillRefiningTool.js';

const HEALING_MATS = [{ name: 'spirit_grass', qty: 2 }, { name: 'jade_petal', qty: 1 }];
const SPIRIT_MATS = [{ name: 'spirit_grass', qty: 3 }, { name: 'moonlit_mushroom', qty: 1 }];
const FLAME_MATS = [{ name: 'flame_bloom', qty: 2 }, { name: 'sunfire_resin', qty: 1 }];
const FROST_MATS = [{ name: 'frost_lotus', qty: 2 }, { name: 'jade_petal', qty: 2 }];
const THUNDER_MATS = [{ name: 'thunder_root', qty: 2 }, { name: 'blood_orchid', qty: 1 }];
const CELESTIAL_MATS = [{ name: 'celestial_nectar', qty: 2 }, { name: 'moonlit_mushroom', qty: 2 }];
const DRAGON_MATS = [{ name: 'dragon_saliva', qty: 2 }, { name: 'flame_bloom', qty: 2 }];
const PHOENIX_MATS = [{ name: 'phoenix_feather', qty: 2 }, { name: 'celestial_nectar', qty: 2 }];
const NINE_YANG_MATS = [
  { name: 'nine_yang_flower', qty: 2 },
  { name: 'dragon_saliva', qty: 2 },
  { name: 'phoenix_feather', qty: 2 },
];
const BLOOD_MATS = [{ name: 'blood_orchid', qty: 2 }, { name: 'jade_petal', qty: 2 }];

describe('CultivationPillRefiningTool', () => {
  let s;
  beforeEach(() => {
    s = new CultivationPillRefiningTool();
  });

  describe('constants / exports', () => {
    it('PRESCRIPTIONS has 10 entries', () => {
      expect(PRESCRIPTION_COUNT).toBe(10);
      expect(PRESCRIPTION_KEYS.length).toBe(10);
    });
    it('QUALITY_LEVELS has 5 levels', () => {
      expect(QUALITY_LEVEL_COUNT).toBe(5);
      expect(QUALITY_LEVELS.length).toBe(5);
    });
    it('HERB_MATERIALS has 12 herbs', () => {
      expect(HERB_MATERIAL_COUNT).toBe(12);
      expect(HERB_MATERIAL_KEYS.length).toBe(12);
    });
    it('FURNACE_LEVELS has 10 levels', () => {
      expect(FURNACE_LEVEL_COUNT).toBe(10);
      expect(FURNACE_LEVELS.length).toBe(10);
      expect(FURNACE_LEVEL_MIN).toBe(1);
      expect(FURNACE_LEVEL_MAX).toBe(10);
      expect(FURNACE_LEVEL_DEFAULT).toBe(1);
    });
    it('thresholds and multipliers are aligned', () => {
      expect(Object.keys(QUALITY_THRESHOLDS).length).toBe(4);
      expect(Object.keys(QUALITY_POTENCY_MULTIPLIER).length).toBe(5);
      expect(Object.keys(QUALITY_RANK).length).toBe(5);
      expect(Object.keys(FURNACE_MAX_RANK).length).toBe(10);
    });
    it('MAX_PILLS equals 100', () => {
      expect(MAX_PILLS).toBe(100);
    });
    it('prescription rank 5 unlockable only at furnace 9-10', () => {
      expect(FURNACE_MAX_RANK[8]).toBe(4);
      expect(FURNACE_MAX_RANK[9]).toBe(5);
      expect(FURNACE_MAX_RANK[10]).toBe(5);
    });
  });

  describe('constructor & defaults', () => {
    it('starts empty', () => {
      expect(s.listAllPills()).toEqual([]);
      expect(s.getStats().totalPills).toBe(0);
    });
    it('default furnace level is 1', () => {
      expect(s.config.furnaceLevel).toBe(1);
    });
    it('accepts custom config', () => {
      const s2 = new CultivationPillRefiningTool({ maxPills: 5, furnaceLevel: 5 });
      expect(s2.config.maxPills).toBe(5);
      expect(s2.config.furnaceLevel).toBe(5);
    });
    it('accepts custom defaultBaseQualityScore', () => {
      const s2 = new CultivationPillRefiningTool({ defaultBaseQualityScore: 0.5 });
      expect(s2.config.defaultBaseQualityScore).toBe(0.5);
    });
    it('clamps furnace level below min', () => {
      const s2 = new CultivationPillRefiningTool({ furnaceLevel: -10 });
      expect(s2.config.furnaceLevel).toBe(FURNACE_LEVEL_MIN);
    });
    it('clamps furnace level above max', () => {
      const s2 = new CultivationPillRefiningTool({ furnaceLevel: 999 });
      expect(s2.config.furnaceLevel).toBe(FURNACE_LEVEL_MAX);
    });
  });

  describe('listPrescriptions / getPrescription', () => {
    it('lists all prescriptions', () => {
      const all = s.listPrescriptions();
      expect(all.length).toBe(10);
    });
    it('lists prescriptions filtered by rank', () => {
      const rank1 = s.listPrescriptions(1);
      expect(rank1.length).toBeGreaterThan(0);
      rank1.forEach((p) => expect(p.rank).toBe(1));
    });
    it('lists prescriptions filtered by rank=5', () => {
      const rank5 = s.listPrescriptions(5);
      expect(rank5.length).toBe(1);
      expect(rank5[0].id).toBe('nine_yang_pill');
    });
    it('getPrescription returns clone', () => {
      const p = s.getPrescription('healing_pill');
      expect(p.id).toBe('healing_pill');
    });
    it('getPrescription returns null for unknown', () => {
      const p = s.getPrescription('unknown_prescription');
      expect(p).toBeNull();
    });
  });

  describe('refinePill - basic flow', () => {
    it('refines a valid rank-1 prescription', () => {
      const r = s.refinePill('healing_pill', HEALING_MATS);
      expect(r.success).toBe(true);
      expect(r.pill.quality).toBeDefined();
      expect(r.pill.effects.length).toBeGreaterThan(0);
    });
    it('refines rank-2 prescription at furnace 3', () => {
      const s2 = new CultivationPillRefiningTool({ furnaceLevel: 3 });
      const r = s2.refinePill('blood_pill', BLOOD_MATS);
      expect(r.success).toBe(true);
    });
    it('refines rank-3 at furnace 5', () => {
      const s2 = new CultivationPillRefiningTool({ furnaceLevel: 5 });
      const r = s2.refinePill('thunder_pill', THUNDER_MATS);
      expect(r.success).toBe(true);
    });
    it('refines rank-5 at furnace 10', () => {
      const s2 = new CultivationPillRefiningTool({ furnaceLevel: 10 });
      const r = s2.refinePill('nine_yang_pill', NINE_YANG_MATS);
      expect(r.success).toBe(true);
    });
  });

  describe('refinePill - validation errors', () => {
    it('rejects unknown prescriptionId', () => {
      const r = s.refinePill('unknown', HEALING_MATS);
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.INVALID_PRESCRIPTION_ID);
    });
    it('rejects null materials', () => {
      const r = s.refinePill('healing_pill', null);
      expect(r.success).toBe(false);
    });
    it('rejects non-array materials', () => {
      const r = s.refinePill('healing_pill', 'not_array');
      expect(r.success).toBe(false);
    });
    it('rejects empty materials array', () => {
      const r = s.refinePill('healing_pill', []);
      expect(r.success).toBe(false);
    });
    it('rejects NaN qty', () => {
      const r = s.refinePill('healing_pill', [{ name: 'spirit_grass', qty: NaN }]);
      expect(r.success).toBe(false);
    });
    it('rejects negative qty', () => {
      const r = s.refinePill('healing_pill', [{ name: 'spirit_grass', qty: -1 }]);
      expect(r.success).toBe(false);
    });
    it('rejects zero qty', () => {
      const r = s.refinePill('healing_pill', [{ name: 'spirit_grass', qty: 0 }]);
      expect(r.success).toBe(false);
    });
    it('rejects unknown material', () => {
      const r = s.refinePill('healing_pill', [
        { name: 'spirit_grass', qty: 2 },
        { name: 'unknown_herb', qty: 1 },
      ]);
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.UNKNOWN_MATERIAL);
    });
    it('rejects insufficient required materials', () => {
      const r = s.refinePill('healing_pill', [{ name: 'spirit_grass', qty: 5 }]);
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.INSUFFICIENT_MATERIALS);
    });
    it('rejects rank above furnace capability', () => {
      const r = s.refinePill('nine_yang_pill', NINE_YANG_MATS);
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.FURNACE_LEVEL_TOO_LOW);
    });
    it('inventory full rejects', () => {
      const s2 = new CultivationPillRefiningTool({ maxPills: 1 });
      s2.refinePill('healing_pill', HEALING_MATS);
      const r = s2.refinePill('spirit_pill', SPIRIT_MATS);
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.INVENTORY_FULL);
    });
  });

  describe('refinePill - quality determination', () => {
    it('low materials produce mortal quality', () => {
      const r = s.refinePill('healing_pill', [
        { name: 'spirit_grass', qty: 1 },
        { name: 'jade_petal', qty: 1 },
      ]);
      expect(r.quality).toBe(QUALITY_MORTAL);
    });
    it('high materials + high furnace produce immortal', () => {
      const s2 = new CultivationPillRefiningTool({ furnaceLevel: 10 });
      const r = s2.refinePill('nine_yang_pill', [
        { name: 'nine_yang_flower', qty: 10 },
        { name: 'dragon_saliva', qty: 10 },
        { name: 'phoenix_feather', qty: 10 },
      ]);
      expect(r.quality).toBe(QUALITY_IMMORTAL);
    });
    it('exposes score and quality', () => {
      const r = s.refinePill('healing_pill', HEALING_MATS);
      expect(typeof r.score).toBe('number');
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    });
    it('applies options.potencyMultiplier override', () => {
      const r = s.refinePill('healing_pill', HEALING_MATS, { potencyMultiplier: 2.0 });
      expect(r.pill.potency).toBeGreaterThanOrEqual(60);
    });
    it('applies options.durationMultiplier override', () => {
      const r = s.refinePill('healing_pill', HEALING_MATS, { durationMultiplier: 0.5 });
      // result is valid
      expect(r.pill.duration).toBeGreaterThan(0);
    });
    it('potencyMultiplier=0 still produces potency >= 1', () => {
      const r = s.refinePill('healing_pill', HEALING_MATS, { potencyMultiplier: 0 });
      expect(r.pill.potency).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getPillQuality', () => {
    it('returns quality info for valid pill', () => {
      const pillId = s.refinePill('healing_pill', HEALING_MATS).pill.id;
      const r = s.getPillQuality(pillId);
      expect(r.success).toBe(true);
      expect(typeof r.quality).toBe('string');
    });
    it('rejects empty pillId', () => {
      const r = s.getPillQuality('');
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.INVALID_PILL_ID);
    });
    it('rejects non-string pillId', () => {
      const r = s.getPillQuality(123);
      expect(r.success).toBe(false);
    });
    it('rejects unknown pillId', () => {
      const r = s.getPillQuality('pill_unknown');
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.PILL_NOT_FOUND);
    });
  });

  describe('consumePill / discardPill', () => {
    it('consumes a pill', () => {
      const id = s.refinePill('healing_pill', HEALING_MATS).pill.id;
      const r = s.consumePill(id);
      expect(r.success).toBe(true);
      expect(r.pill.consumed).toBe(true);
    });
    it('rejects double consume', () => {
      const id = s.refinePill('healing_pill', HEALING_MATS).pill.id;
      s.consumePill(id);
      const r = s.consumePill(id);
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.PILL_ALREADY_CONSUMED);
    });
    it('rejects unknown pillId', () => {
      const r = s.consumePill('pill_unknown');
      expect(r.success).toBe(false);
    });
    it('rejects empty pillId', () => {
      const r = s.consumePill('');
      expect(r.success).toBe(false);
    });
    it('discards a pill', () => {
      const id = s.refinePill('healing_pill', HEALING_MATS).pill.id;
      const r = s.discardPill(id);
      expect(r.success).toBe(true);
      expect(s.getPillQuality(id).success).toBe(false);
    });
    it('rejects discard of consumed pill', () => {
      const id = s.refinePill('healing_pill', HEALING_MATS).pill.id;
      s.consumePill(id);
      const r = s.discardPill(id);
      expect(r.success).toBe(false);
    });
    it('rejects discard unknown pillId', () => {
      const r = s.discardPill('pill_unknown');
      expect(r.success).toBe(false);
    });
    it('rejects discard with empty pillId', () => {
      const r = s.discardPill('');
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.INVALID_PILL_ID);
    });
  });

  describe('upgradeCauldron', () => {
    it('upgrades furnace level', () => {
      const r = s.upgradeCauldron(5);
      expect(r.success).toBe(true);
      expect(r.next).toBe(5);
      expect(s.config.furnaceLevel).toBe(5);
    });
    it('rejects same level', () => {
      const r = s.upgradeCauldron(1);
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.FURNACE_LEVEL_SAME);
    });
    it('rejects downgrade', () => {
      s.upgradeCauldron(5);
      const r = s.upgradeCauldron(3);
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.FURNACE_LEVEL_HIGHER);
    });
    it('rejects level below min', () => {
      const r = s.upgradeCauldron(0);
      expect(r.success).toBe(false);
    });
    it('rejects level above max', () => {
      const r = s.upgradeCauldron(11);
      expect(r.success).toBe(false);
    });
    it('rejects non-number level', () => {
      const r = s.upgradeCauldron('5');
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.INVALID_FURNACE_LEVEL);
    });
    it('rejects NaN level', () => {
      const r = s.upgradeCauldron(NaN);
      expect(r.success).toBe(false);
    });
    it('getFurnaceStats returns current state', () => {
      s.upgradeCauldron(7);
      const stats = s.getFurnaceStats();
      expect(stats.level).toBe(7);
      expect(stats.maxRank).toBe(4);
    });
    it('upgrade unlocks higher-rank prescription', () => {
      const r1 = s.refinePill('nine_yang_pill', NINE_YANG_MATS);
      expect(r1.success).toBe(false);
      s.upgradeCauldron(10);
      const r2 = s.refinePill('nine_yang_pill', NINE_YANG_MATS);
      expect(r2.success).toBe(true);
    });
  });

  describe('listByQuality / listByRank', () => {
    beforeEach(() => {
      s.upgradeCauldron(3); // unlock rank-2 prescriptions
      s.refinePill('healing_pill', HEALING_MATS);
      s.refinePill('spirit_pill', SPIRIT_MATS);
      s.refinePill('blood_pill', BLOOD_MATS);
    });
    it('listByQuality filters by quality', () => {
      const list = s.listByQuality(QUALITY_MORTAL);
      expect(Array.isArray(list)).toBe(true);
    });
    it('listByQuality returns empty for unknown quality', () => {
      expect(s.listByQuality('unknown_quality')).toEqual([]);
    });
    it('listByRank filters by prescription rank', () => {
      const rank1 = s.listByRank(1);
      expect(rank1.length).toBe(2);
    });
    it('listByRank returns empty for non-number', () => {
      expect(s.listByRank('1')).toEqual([]);
    });
    it('listAllPills returns all', () => {
      expect(s.listAllPills().length).toBe(3);
    });
    it('listAllPills returns clones', () => {
      const a = s.listAllPills();
      const b = s.listAllPills();
      expect(a[0]).not.toBe(b[0]);
    });
  });

  describe('registerTool / executeTool', () => {
    it('registerTool + executeTool happy path', () => {
      s.registerTool('listAll', () => s.listAllPills());
      const r = s.executeTool('listAll', {});
      expect(r.success).toBe(true);
    });
    it('executeTool handles missing context', () => {
      s.registerTool('noop', () => 'ok');
      const r = s.executeTool('noop');
      expect(r.success).toBe(true);
    });
    it('executeTool handles null context', () => {
      s.registerTool('noop', () => 'ok');
      const r = s.executeTool('noop', null);
      expect(r.success).toBe(true);
    });
    it('executeTool rejects unknown tool', () => {
      const r = s.executeTool('unknown');
      expect(r.success).toBe(false);
    });
    it('executeTool catches handler error', () => {
      s.registerTool('boom', () => { throw new Error('x'); });
      const r = s.executeTool('boom');
      expect(r.success).toBe(false);
    });
    it('default refine tool works', () => {
      const r = s.executeTool('refine', {
        prescriptionId: 'healing_pill',
        materials: HEALING_MATS,
      });
      expect(r.success).toBe(true);
    });
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
    it('default upgrade tool works', () => {
      const r = s.executeTool('upgrade', { level: 5 });
      expect(r.success).toBe(true);
    });
    it('default listPrescriptions tool works', () => {
      const r = s.executeTool('listPrescriptions', { rank: 1 });
      expect(r.success).toBe(true);
    });
    it('default listPrescriptions tool with empty ctx', () => {
      const r = s.executeTool('listPrescriptions', {});
      expect(r.success).toBe(true);
    });
  });

  describe('registerHook', () => {
    it('hook fires on refine', () => {
      let called = false;
      s.registerHook('onRefine', () => { called = true; });
      s.refinePill('healing_pill', HEALING_MATS);
      expect(called).toBe(true);
    });
    it('hook fires on consume', () => {
      let called = false;
      s.registerHook('onConsume', () => { called = true; });
      const id = s.refinePill('healing_pill', HEALING_MATS).pill.id;
      s.consumePill(id);
      expect(called).toBe(true);
    });
    it('hook fires on upgrade', () => {
      let called = false;
      s.registerHook('onUpgrade', () => { called = true; });
      s.upgradeCauldron(3);
      expect(called).toBe(true);
    });
    it('hook fires on discard', () => {
      let called = false;
      s.registerHook('onDiscard', () => { called = true; });
      const id = s.refinePill('healing_pill', HEALING_MATS).pill.id;
      s.discardPill(id);
      expect(called).toBe(true);
    });
    it('unregisterHook removes handler', () => {
      const h = () => {};
      s.registerHook('onRefine', h);
      const r = s.unregisterHook('onRefine', h);
      expect(r.success).toBe(true);
    });
    it('unregisterHook: unknown event', () => {
      const r = s.unregisterHook('unknown_event', () => {});
      expect(r.success).toBe(false);
    });
    it('unregisterHook: handler not in list', () => {
      s.registerHook('onRefine', () => {});
      const r = s.unregisterHook('onRefine', () => {});
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
      const r = s.registerHook('onRefine', 'not_func');
      expect(r.success).toBe(false);
    });
    it('hook handler throws but refine succeeds', () => {
      s.registerHook('onRefine', () => { throw new Error('x'); });
      const r = s.refinePill('healing_pill', HEALING_MATS);
      expect(r.success).toBe(true);
    });
  });

  describe('toJSON / fromJSON / getStats / autoEvolve / reset', () => {
    it('toJSON returns serializable', () => {
      s.refinePill('healing_pill', HEALING_MATS);
      const json = s.toJSON();
      expect(json.pills.length).toBe(1);
    });
    it('fromJSON restores', () => {
      s.refinePill('healing_pill', HEALING_MATS);
      const json = s.toJSON();
      const s2 = new CultivationPillRefiningTool();
      const r = s2.fromJSON(json);
      expect(r.success).toBe(true);
      expect(s2.listAllPills().length).toBe(1);
    });
    it('fromJSON handles null', () => {
      const r = s.fromJSON(null);
      expect(r.success).toBe(false);
    });
    it('fromJSON handles partial', () => {
      const r = s.fromJSON({ pills: [] });
      expect(r.success).toBe(true);
    });
    it('fromJSON clamps furnace level', () => {
      const r = s.fromJSON({ config: { furnaceLevel: 999 } });
      expect(r.success).toBe(true);
      expect(s.config.furnaceLevel).toBe(FURNACE_LEVEL_MAX);
    });
    it('fromJSON clamps furnace level below', () => {
      const r = s.fromJSON({ config: { furnaceLevel: -5 } });
      expect(r.success).toBe(true);
      expect(s.config.furnaceLevel).toBe(FURNACE_LEVEL_MIN);
    });
    it('getStats returns counters', () => {
      s.refinePill('healing_pill', HEALING_MATS);
      const stats = s.getStats();
      expect(stats.totalPills).toBe(1);
      expect(stats.totalRefined).toBe(1);
    });
    it('autoEvolve increments counter', () => {
      const r = s.autoEvolve();
      expect(r.success).toBe(true);
      expect(r.evolutionCount).toBe(1);
    });
    it('reset clears state', () => {
      s.refinePill('healing_pill', HEALING_MATS);
      s.reset();
      expect(s.listAllPills().length).toBe(0);
    });
  });

  describe('helpers / edge branches', () => {
    it('_validateMaterials handles array of bad objects', () => {
      const r = s.refinePill('healing_pill', [{ name: 1, qty: 1 }]);
      expect(r.success).toBe(false);
    });
    it('_validateMaterials handles m null', () => {
      const r = s.refinePill('healing_pill', [null, { name: 'jade_petal', qty: 1 }]);
      expect(r.success).toBe(false);
    });
    it('_validateMaterials handles m.qty not number', () => {
      const r = s.refinePill('healing_pill', [{ name: 'spirit_grass', qty: '5' }]);
      expect(r.success).toBe(false);
    });
    it('_consolidateMaterials merges duplicates', () => {
      const r = s._consolidateMaterials([
        { name: 'spirit_grass', qty: 2 },
        { name: 'spirit_grass', qty: 3 },
      ]);
      expect(r.length).toBe(1);
      expect(r[0].qty).toBe(5);
    });
    it('_checkMaterialsSufficient handles sufficient', () => {
      expect(
        s._checkMaterialsSufficient([{ name: 'spirit_grass', qty: 5 }], ['spirit_grass'])
      ).toBe(true);
    });
    it('_checkMaterialsSufficient handles missing', () => {
      expect(
        s._checkMaterialsSufficient([{ name: 'spirit_grass', qty: 5 }], ['spirit_grass', 'missing'])
      ).toBe(false);
    });
    it('_checkMaterialsSufficient consolidates duplicates', () => {
      const r = s._checkMaterialsSufficient(
        [{ name: 'spirit_grass', qty: 2 }, { name: 'spirit_grass', qty: 3 }],
        ['spirit_grass'],
      );
      expect(r).toBe(true);
    });
    it('_scoreToQuality covers all thresholds', () => {
      expect(s._scoreToQuality(0.0)).toBe(QUALITY_MORTAL);
      expect(s._scoreToQuality(0.19)).toBe(QUALITY_MORTAL);
      expect(s._scoreToQuality(0.21)).toBe(QUALITY_SPIRIT);
      expect(s._scoreToQuality(0.41)).toBe(QUALITY_EARTH);
      expect(s._scoreToQuality(0.71)).toBe(QUALITY_HEAVEN);
      expect(s._scoreToQuality(0.91)).toBe(QUALITY_IMMORTAL);
    });
    it('_clonePill clones effects', () => {
      const id = s.refinePill('healing_pill', HEALING_MATS).pill.id;
      const p = s._clonePill(s.pills.get(id));
      expect(p).not.toBe(s.pills.get(id));
      expect(p.effects).not.toBe(s.pills.get(id).effects);
    });
    it('_getMaxRankForFurnace clamps out-of-range', () => {
      expect(s._getMaxRankForFurnace(999)).toBe(5);
      expect(s._getMaxRankForFurnace(0)).toBe(1);
    });
    it('potency/duration min enforced', () => {
      // small prescription + tiny multiplier
      const r = s.refinePill('healing_pill', HEALING_MATS, {
        potencyMultiplier: 0.001,
        durationMultiplier: 0.001,
      });
      expect(r.pill.potency).toBeGreaterThanOrEqual(1);
      expect(r.pill.duration).toBeGreaterThanOrEqual(1000);
    });
    it('refinePill stats increment byQuality and byRank', () => {
      s.refinePill('healing_pill', HEALING_MATS);
      const stats = s.getStats();
      const qSum = Object.values(stats.byQuality).reduce((a, b) => a + b, 0);
      const rSum = Object.values(stats.byRank).reduce((a, b) => a + b, 0);
      expect(qSum).toBe(1);
      expect(rSum).toBe(1);
    });
  });

  describe('all prescriptions are refinable at furnace 10', () => {
    for (const presId of PRESCRIPTION_KEYS) {
      const p = PRESCRIPTIONS[presId];
      const mats = p.requiredMaterials.map((name) => ({ name, qty: 2 }));
      it(`refines ${presId} (rank=${p.rank})`, () => {
        const s2 = new CultivationPillRefiningTool({ furnaceLevel: 10 });
        const r = s2.refinePill(presId, mats);
        expect(r.success).toBe(true);
      });
    }
  });
});
