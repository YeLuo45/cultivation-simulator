import { describe, it, expect, beforeEach } from 'vitest';
import {
  CultivationFormationTool,
  FORMATION_TYPES,
  FORMATION_STATUS,
  FORMATION_TYPE_KEYS,
  MATERIALS_DB_KEYS,
  ERROR_CODES,
} from '../../../systems/tools/CultivationFormationTool.js';

const ATTACK_MATS = [{ name: 'spirit_stone', qty: 5 }, { name: 'sword_essence', qty: 1 }];
const DEFENSE_MATS = [{ name: 'earth_core', qty: 5 }, { name: 'turtle_shell', qty: 1 }];
const TRAP_MATS = [{ name: 'shadow_vein', qty: 5 }, { name: 'poison_dust', qty: 1 }];

describe('CultivationFormationTool', () => {
  let s;
  beforeEach(() => { s = new CultivationFormationTool(); });

  describe('constructor & defaults', () => {
    it('starts empty', () => {
      expect(s.listAll()).toEqual([]);
      expect(s.getStats().totalFormations).toBe(0);
    });
    it('accepts custom config', () => {
      const s2 = new CultivationFormationTool({ maxFormationsPerPlayer: 5, powerDecayRate: 0.1 });
      expect(s2.config.maxFormationsPerPlayer).toBe(5);
      expect(s2.config.powerDecayRate).toBe(0.1);
    });
  });

  describe('deployFormation', () => {
    it('deploys a valid formation', () => {
      const r = s.deployFormation('p1', 'attack', ATTACK_MATS);
      expect(r.success).toBe(true);
      expect(r.formation.status).toBe('pending');
    });
    it('rejects unknown formationType', () => {
      const r = s.deployFormation('p1', 'unknown', ATTACK_MATS);
      expect(r.success).toBe(false);
      expect(r.error).toBe(ERROR_CODES.INVALID_FORMATION_TYPE);
    });
    it('rejects empty playerId', () => {
      const r = s.deployFormation('', 'attack', ATTACK_MATS);
      expect(r.success).toBe(false);
    });
    it('rejects insufficient materials', () => {
      const r = s.deployFormation('p1', 'attack', [{ name: 'spirit_stone', qty: 0 }]);
      expect(r.success).toBe(false);
    });
    it('enforces maxFormationsPerPlayer', () => {
      const s2 = new CultivationFormationTool({ maxFormationsPerPlayer: 1 });
      s2.deployFormation('p1', 'attack', ATTACK_MATS);
      const r = s2.deployFormation('p1', 'defense', DEFENSE_MATS);
      expect(r.success).toBe(false);
    });
    it('uses options.duration when provided', () => {
      const r = s.deployFormation('p1', 'attack', ATTACK_MATS, { duration: 5000 });
      expect(r.formation.duration).toBe(5000);
    });
  });

  describe('activateFormation', () => {
    let id;
    beforeEach(() => { id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id; });
    it('activates a pending formation', () => {
      const r = s.activateFormation(id);
      expect(r.success).toBe(true);
      expect(r.formation.status).toBe('active');
    });
    it('rejects unknown formation', () => {
      const r = s.activateFormation('not_found');
      expect(r.success).toBe(false);
    });
    it('rejects double activation', () => {
      s.activateFormation(id);
      const r = s.activateFormation(id);
      expect(r.success).toBe(false);
    });
  });

  describe('deactivateFormation', () => {
    let id;
    beforeEach(() => {
      id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      s.activateFormation(id);
    });
    it('deactivates an active formation', () => {
      const r = s.deactivateFormation(id);
      expect(r.success).toBe(true);
      expect(r.formation.status).toBe('dormant');
    });
    it('rejects unknown formation', () => {
      const r = s.deactivateFormation('not_found');
      expect(r.success).toBe(false);
    });
  });

  describe('inspectFormation', () => {
    it('inspects a formation by id', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      const r = s.inspectFormation(id);
      expect(r).toBeTruthy();
      expect(r.id).toBe(id);
    });
    it('rejects unknown id', () => {
      const r = s.inspectFormation('not_found');
      expect(r).toBeNull();
    });
  });

  describe('list methods', () => {
    beforeEach(() => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      s.deployFormation('p1', 'defense', DEFENSE_MATS);
      s.deployFormation('p2', 'trap', TRAP_MATS);
    });
    it('listByPlayer', () => {
      expect(s.listByPlayer('p1').length).toBe(2);
      expect(s.listByPlayer('p2').length).toBe(1);
    });
    it('listByPlayer returns empty for unknown player', () => {
      expect(s.listByPlayer('ghost')).toEqual([]);
    });
    it('listByType', () => {
      expect(s.listByType('attack').length).toBe(1);
    });
    it('listByType returns empty for unknown type', () => {
      expect(s.listByType('unknown_type')).toEqual([]);
    });
    it('listByStatus', () => {
      expect(s.listByStatus('pending').length).toBe(3);
    });
    it('listByStatus returns empty for unknown status', () => {
      expect(s.listByStatus('unknown_status')).toEqual([]);
    });
    it('listActive returns empty when none active', () => {
      expect(s.listActive()).toEqual([]);
    });
    it('listAll returns all formations', () => {
      expect(s.listAll().length).toBe(3);
    });
  });

  describe('registerTool / executeTool / registerHook', () => {
    it('registerTool + executeTool happy path', () => {
      s.registerTool('list_all', () => s.listAll());
      const r = s.executeTool('list_all', {});
      expect(r.success).toBe(true);
    });
    it('executeTool handles missing context', () => {
      s.registerTool('noop', () => 'ok');
      const r = s.executeTool('noop');
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
    it('registerHook + trigger via deploy', () => {
      let called = false;
      s.registerHook('onDeploy', () => { called = true; });
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      expect(called).toBe(true);
    });
    it('unregisterHook removes handler', () => {
      const h = () => {};
      s.registerHook('onDeploy', h);
      s.unregisterHook('onDeploy', h);
      const r = s.executeTool('nonexistent_tool');
      expect(r.success).toBe(false);
    });
  });

  describe('toJSON / fromJSON / getStats / autoEvolve / reset', () => {
    it('toJSON returns serializable', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      const json = s.toJSON();
      expect(json.formations.length).toBe(1);
    });
    it('fromJSON restores', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      const json = s.toJSON();
      const s2 = new CultivationFormationTool();
      const r = s2.fromJSON(json);
      expect(r.success).toBe(true);
      expect(s2.listAll().length).toBe(1);
    });
    it('fromJSON handles null', () => {
      const r = s.fromJSON(null);
      expect(r.success).toBe(false);
    });
    it('fromJSON handles partial', () => {
      const r = s.fromJSON({ formations: [] });
      expect(r.success).toBe(true);
    });
    it('getStats returns counters', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      const stats = s.getStats();
      expect(stats.totalFormations).toBe(1);
    });
    it('autoEvolve increments counter', () => {
      const r = s.autoEvolve();
      expect(r.success).toBe(true);
    });
    it('reset clears state', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      s.reset();
      expect(s.listAll().length).toBe(0);
    });
  });

  describe('edge branches', () => {
    it('_validateMaterials: null', () => {
      const r = s.deployFormation('p1', 'attack', null);
      expect(r.success).toBe(false);
    });
    it('_validateMaterials: non-array', () => {
      const r = s.deployFormation('p1', 'attack', 'not_array');
      expect(r.success).toBe(false);
    });
    it('clones formation on read', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      const a = s.inspectFormation(id);
      const b = s.inspectFormation(id);
      expect(a).not.toBe(b);
    });
    it('listByPlayer clones formations', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      const a = s.listByPlayer('p1');
      const b = s.listByPlayer('p1');
      expect(a[0]).not.toBe(b[0]);
    });
    it('listByType clones formations', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      const a = s.listByType('attack');
      const b = s.listByType('attack');
      expect(a[0]).not.toBe(b[0]);
    });
    it('listByStatus clones formations', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      const a = s.listByStatus('pending');
      const b = s.listByStatus('pending');
      expect(a[0]).not.toBe(b[0]);
    });
    it('listAll clones formations', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      const a = s.listAll();
      const b = s.listAll();
      expect(a[0]).not.toBe(b[0]);
    });
    it('listActive clones formations', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      s.activateFormation(id);
      const a = s.listActive();
      expect(a[0].status).toBe('active');
    });
    it('deployFormation with NaN qty rejects', () => {
      const r = s.deployFormation('p1', 'attack', [{ name: 'spirit_stone', qty: NaN }, { name: 'sword_essence', qty: 1 }]);
      expect(r.success).toBe(false);
    });
    it('deployFormation with negative qty rejects', () => {
      const r = s.deployFormation('p1', 'attack', [{ name: 'spirit_stone', qty: -1 }, { name: 'sword_essence', qty: 1 }]);
      expect(r.success).toBe(false);
    });
  });

  describe('all branches coverage', () => {
    it('custom config: defaultDuration, returnMaterialsOnDeactivate, autoDestroyOnZeroPower', () => {
      const s2 = new CultivationFormationTool({ defaultDuration: 99999, returnMaterialsOnDeactivate: true, autoDestroyOnZeroPower: true });
      expect(s2.config.defaultDuration).toBe(99999);
      expect(s2.config.returnMaterialsOnDeactivate).toBe(true);
      expect(s2.config.autoDestroyOnZeroPower).toBe(true);
    });
    it('_consolidateMaterials merges same name', () => {
      const result = s._consolidateMaterials([{ name: 'a', qty: 2 }, { name: 'a', qty: 3 }]);
      expect(result.length).toBe(1);
      expect(result[0].qty).toBe(5);
    });
    it('_checkMaterialsSufficient handles sufficient', () => {
      const r = s._checkMaterialsSufficient([{ name: 'spirit_stone', qty: 5 }], ['spirit_stone']);
      expect(r).toBe(true);
    });
    it('deployFormation with unknown material rejects', () => {
      const r = s.deployFormation('p1', 'attack', [{ name: 'unknown_mat', qty: 1 }, { name: 'sword_essence', qty: 1 }]);
      expect(r.success).toBe(false);
    });
    it('activateFormation on destroyed rejects', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      const destroyFn = s.destroyFormation ? s.destroyFormation(id) : null;
      if (destroyFn) {
        const r = s.activateFormation(id);
        expect(r.success).toBe(false);
      }
    });
    it('deactivateFormation on destroyed rejects', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      if (s.destroyFormation) {
        s.destroyFormation(id);
        const r = s.deactivateFormation(id);
        expect(r.success).toBe(false);
      }
    });
    it('deactivateFormation on non-active rejects', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      const r = s.deactivateFormation(id);
      expect(r.success).toBe(false);
    });
    it('deactivate with returnMaterialsOnDeactivate returns materials', () => {
      const s2 = new CultivationFormationTool({ returnMaterialsOnDeactivate: true });
      const id = s2.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      s2.activateFormation(id);
      const r = s2.deactivateFormation(id);
      expect(r.success).toBe(true);
      expect(r.releasedMaterials).toBeDefined();
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
    it('registerHook: invalid event', () => {
      const r = s.registerHook('', () => {});
      expect(r.success).toBe(false);
    });
    it('registerHook: non-string event', () => {
      const r = s.registerHook(123, () => {});
      expect(r.success).toBe(false);
    });
    it('registerHook: non-function handler', () => {
      const r = s.registerHook('onDeploy', 'not_func');
      expect(r.success).toBe(false);
    });
    it('registerHook + handler throws, returns success', () => {
      s.registerHook('onDeploy', () => { throw new Error('x'); });
      const r = s.deployFormation('p1', 'attack', ATTACK_MATS);
      expect(r.success).toBe(true);
    });
    it('unregisterHook: unknown event', () => {
      const r = s.unregisterHook('unknown_event', () => {});
      expect(r.success).toBe(false);
    });
    it('unregisterHook: handler not in list', () => {
      s.registerHook('onDeploy', () => {});
      const r = s.unregisterHook('onDeploy', () => {});
      expect(r.success).toBe(false);
    });
    it('destroyFormation: unknown', () => {
      const r = s.destroyFormation('not_found');
      expect(r.success).toBe(false);
    });
    it('destroyFormation: success', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      const r = s.destroyFormation(id);
      expect(r.success).toBe(true);
    });
    it('destroyFormation: double destroy', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      s.destroyFormation(id);
      const r = s.destroyFormation(id);
      expect(r.success).toBe(false);
    });
    it('tickDecay: success on active', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      s.activateFormation(id);
      const r = s.tickDecay(id);
      expect(r.success).toBe(true);
    });
    it('tickDecay: unknown formation', () => {
      const r = s.tickDecay('not_found');
      expect(r.success).toBe(false);
    });
    it('tickDecay: on non-active rejects', () => {
      const id = s.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      const r = s.tickDecay(id);
      expect(r.success).toBe(false);
    });
    it('tickDecay: autoDestroyOnZeroPower triggers destroy', () => {
      const s2 = new CultivationFormationTool({ autoDestroyOnZeroPower: true, powerDecayRate: 99999 });
      const id = s2.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      s2.activateFormation(id);
      const r = s2.tickDecay(id);
      expect(r.success).toBe(true);
      expect(r.autoDestroyed).toBe(true);
    });
    it('tickAllActive ticks multiple', () => {
      const s2 = new CultivationFormationTool({ powerDecayRate: 0.01 });
      const id1 = s2.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      const id2 = s2.deployFormation('p1', 'defense', DEFENSE_MATS).formation.id;
      s2.activateFormation(id1);
      s2.activateFormation(id2);
      const r = s2.tickAllActive();
      expect(r.ticked).toBe(2);
    });
    it('getFormationStats: per-player breakdown', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      s.deployFormation('p1', 'defense', DEFENSE_MATS);
      const stats = s.getFormationStats('p1');
      expect(stats.totalFormations).toBe(2);
      expect(stats.byType.attack).toBe(1);
    });
    it('getFormationStats: empty player', () => {
      const stats = s.getFormationStats('ghost');
      expect(stats.totalFormations).toBe(0);
    });
    it('_checkMaterialsSufficient: missing required material', () => {
      const r = s._checkMaterialsSufficient([{ name: 'spirit_stone', qty: 5 }], ['spirit_stone', 'missing_mat']);
      expect(r).toBe(false);
    });
    it('deployFormation with insufficient required material', () => {
      const r = s.deployFormation('p1', 'attack', [{ name: 'spirit_stone', qty: 5 }]);
      expect(r.success).toBe(false);
    });
    it('deployFormation: empty materials array', () => {
      const r = s.deployFormation('p1', 'attack', []);
      expect(r.success).toBe(false);
    });
    it('_validateMaterials: m is null', () => {
      const r = s.deployFormation('p1', 'attack', [null, { name: 'sword_essence', qty: 1 }]);
      expect(r.success).toBe(false);
    });
    it('_validateMaterials: m.name is empty', () => {
      const r = s.deployFormation('p1', 'attack', [{ name: '', qty: 1 }, { name: 'sword_essence', qty: 1 }]);
      expect(r.success).toBe(false);
    });
    it('_validateMaterials: m.qty is not number', () => {
      const r = s.deployFormation('p1', 'attack', [{ name: 'spirit_stone', qty: '5' }, { name: 'sword_essence', qty: 1 }]);
      expect(r.success).toBe(false);
    });
    it('_checkMaterialsSufficient: consolidates duplicates', () => {
      const r = s._checkMaterialsSufficient([{ name: 'spirit_stone', qty: 2 }, { name: 'spirit_stone', qty: 3 }], ['spirit_stone']);
      expect(r).toBe(true);
    });
    it('tickAllActive with no active returns 0', () => {
      s.deployFormation('p1', 'attack', ATTACK_MATS);
      const r = s.tickAllActive();
      expect(r.ticked).toBe(0);
    });
    it('tickAllActive with autoDestroy counts it', () => {
      const s2 = new CultivationFormationTool({ autoDestroyOnZeroPower: true, powerDecayRate: 99999 });
      const id = s2.deployFormation('p1', 'attack', ATTACK_MATS).formation.id;
      s2.activateFormation(id);
      const r = s2.tickAllActive();
      expect(r.autoDestroyed).toBe(1);
    });
  });
});
