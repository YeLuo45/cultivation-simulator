/**
 * MagicUnificationService.js - 万法归一系统
 * 将各种法术、法则统一融合
 * 
 * MCP工具:
 * - magic.unify(sourceMagicId, targetMagicId) - 融合法术
 * - magic.analyze(entityId) - 分析实体法力
 * - magic.balance() - 平衡法力
 * - magic.query() - 查询法力状态
 */

const MAGIC_TYPES = {
  ELEMENTAL: 'ELEMENTAL',     // 元素系
  SPIRITUAL: 'SPIRITUAL',    // 灵魂系
  PHYSICAL: 'PHYSICAL',      // 肉体系
  CELESTIAL: 'CELESTIAL',     // 天系
  DEMONIC: 'DEMONIC'         // 魔系
};

const MAGIC_DB_KEY = '_magic_db';

let _magicDB = null;

function _initDB() {
  const existing = GameGlobal.getDB ? GameGlobal.getDB(MAGIC_DB_KEY) : null;
  if (existing) { _magicDB = existing; }
  else {
    _magicDB = {
      unifiedLevel: 0,
      masteredMagics: [],
      magicPower: 100,
      balanceScore: 50,
      fusionHistory: []
    };
    if (GameGlobal.setDB) GameGlobal.setDB(MAGIC_DB_KEY, _magicDB);
  }
}

function _saveDB() { if (GameGlobal.setDB) GameGlobal.setDB(MAGIC_DB_KEY, _magicDB); }

const MAGIC_LIST = {
  'fireball': { name: '火球术', type: 'ELEMENTAL', power: 20, cost: 10 },
  'iceLance': { name: '冰刺术', type: 'ELEMENTAL', power: 18, cost: 10 },
  'lightning': { name: '雷击术', type: 'ELEMENTAL', power: 25, cost: 15 },
  'earthShield': { name: '土盾术', type: 'ELEMENTAL', power: 15, cost: 8 },
  'water Healing': { name: '水疗术', type: 'SPIRITUAL', power: 30, cost: 20 },
  'soulStrike': { name: '魂击术', type: 'SPIRITUAL', power: 35, cost: 25 },
  'bodyHardening': { name: '金身术', type: 'PHYSICAL', power: 20, cost: 12 },
  'tigerFist': { name: '虎拳术', type: 'PHYSICAL', power: 28, cost: 18 },
  'starArrow': { name: '星箭术', type: 'CELESTIAL', power: 40, cost: 30 },
  'moonBeam': { name: '月光术', type: 'CELESTIAL', power: 35, cost: 25 },
  'demonFire': { name: '魔焰术', type: 'DEMONIC', power: 45, cost: 35 },
  'darkBlade': { name: '暗刃术', type: 'DEMONIC', power: 42, cost: 32 }
};

function _calcFusionPower(m1, m2) {
  const p1 = m1.power * (1 + _magicDB.unifiedLevel * 0.1);
  const p2 = m2.power * (1 + _magicDB.unifiedLevel * 0.1);
  const synergy = (m1.type === m2.type) ? 1.5 : 1.0;
  return Math.floor((p1 + p2) * synergy);
}

function _updateBalance(type) {
  const typeWeights = { ELEMENTAL: 20, SPIRITUAL: 20, PHYSICAL: 20, CELESTIAL: 20, DEMONIC: 20 };
  const weight = typeWeights[type] || 10;
  _magicDB.balanceScore = Math.min(100, Math.max(0, _magicDB.balanceScore + (Math.random() > 0.5 ? weight : -weight)));
}

function queryMagicStatus() {
  _initDB();
  const playerLevel = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('level') : 1;
  return {
    success: true,
    status: { unifiedLevel: _magicDB.unifiedLevel, magicPower: _magicDB.magicPower, balanceScore: _magicDB.balanceScore, masteredCount: _magicDB.masteredMagics.length },
    masteredMagics: _magicDB.masteredMagics.map(m => ({ ...m, currentPower: Math.floor(m.basePower * (1 + _magicDB.unifiedLevel * 0.1)) })),
    availableMagics: Object.entries(MAGIC_LIST).map(([id, cfg]) => ({ id, ...cfg })),
    typeDistribution: Object.keys(MAGIC_TYPES).map(t => ({ type: t, count: _magicDB.masteredMagics.filter(m => m.type === t).length }))
  };
}

function analyzeEntityMagic(entityId) {
  _initDB();
  const entity = entityId === 'player' ? GameGlobal.getPlayerAttribute ? { level: GameGlobal.getPlayerAttribute('level'), spiritRoot: GameGlobal.getPlayerAttribute('spiritRoot') || 1 } : { level: 1, spiritRoot: 1 } : null;
  if (!entity) return { success: false, error: `实体 ${entityId} 不存在` };
  const potential = Math.floor(entity.level * 5 + entity.spiritRoot * 10);
  const affinity = Object.keys(MAGIC_TYPES).map(t => ({ type: t, score: Math.floor(Math.random() * 40 + 60) }));
  return { success: true, entity: { id: entityId, level: entity.level, spiritRoot: entity.spiritRoot, potential, affinity } };
}

function balanceMagic() {
  _initDB();
  if (_magicDB.magicPower < 50) return { success: false, error: '法力不足（需要50）' };
  _magicDB.magicPower -= 50;
  const before = _magicDB.balanceScore;
  _magicDB.balanceScore = 50;
  const magicsToBoost = _magicDB.masteredMagics.filter(m => m.type === Object.keys(MAGIC_TYPES)[Math.floor(Math.random() * 5)]);
  magicsToBoost.forEach(m => m.basePower = Math.floor(m.basePower * 1.1));
  _saveDB();
  return { success: true, message: '法力平衡完成', balanceScore: 50, magicPower: _magicDB.magicPower, boosted: magicsToBoost.length };
}

function unifyMagics(sourceMagicId, targetMagicId) {
  _initDB();
  const source = MAGIC_LIST[sourceMagicId];
  const target = MAGIC_LIST[targetMagicId];
  if (!source) return { success: false, error: `法术 ${sourceMagicId} 不存在` };
  if (!target) return { success: false, error: `法术 ${targetMagicId} 不存在` };
  if (_magicDB.magicPower < source.cost + target.cost) return { success: false, error: '法力不足' };
  if (_magicDB.masteredMagics.length >= 10 && !_magicDB.masteredMagics.find(m => m.id === sourceMagicId)) return { success: false, error: '已达上限（10个法术），需遗忘旧法术' };
  _magicDB.magicPower -= (source.cost + target.cost);
  const newPower = _calcFusionPower(source, target);
  const resultId = `${sourceMagicId}_${targetMagicId}`;
  const resultName = `${source.name}+${target.name}`;
  const existing = _magicDB.masteredMagics.find(m => m.id === resultId);
  if (existing) { existing.basePower = newPower; existing.fusionCount++; }
  else { _magicDB.masteredMagics.push({ id: resultId, name: resultName, type: source.type, basePower: newPower, cost: Math.floor((source.cost + target.cost) * 0.7), fusionCount: 1, masteredAt: Date.now() }); }
  _magicDB.unifiedLevel++;
  _updateBalance(source.type);
  _magicDB.fusionHistory.push({ source: sourceMagicId, target: targetMagicId, power: newPower, at: Date.now() });
  _saveDB();
  return { success: true, message: `融合成功：${resultName}，威力 ${newPower}`, unifiedLevel: _magicDB.unifiedLevel, newMagic: { id: resultId, name: resultName, power: newPower, type: source.type } };
}

function forgetMagic(magicId) {
  _initDB();
  const idx = _magicDB.masteredMagics.findIndex(m => m.id === magicId);
  if (idx === -1) return { success: false, error: `未学会此法术 ${magicId}` };
  _magicDB.masteredMagics.splice(idx, 1);
  _saveDB();
  return { success: true, message: `已遗忘 ${magicId}` };
}

const MAGIC_MCP_TOOLS = [
  { name: 'magic.query', description: '查询法力状态', params: {} },
  { name: 'magic.analyze', description: '分析实体法力', params: { entityId: 'string' } },
  { name: 'magic.unify', description: '融合两个法术', params: { sourceMagicId: 'string', targetMagicId: 'string' } },
  { name: 'magic.balance', description: '平衡法力', params: {} },
  { name: 'magic.forget', description: '遗忘法术', params: { magicId: 'string' } }
];

export { queryMagicStatus, analyzeEntityMagic, balanceMagic, unifyMagics, forgetMagic, MAGIC_TYPES, MAGIC_LIST, MAGIC_MCP_TOOLS };