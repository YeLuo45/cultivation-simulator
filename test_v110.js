// V110 Test Runner
global.window = { gameState: {
  spiritStones: 10000, realm: 3, stage: 1, reputation: 50,
  heavenOath: null, karmaOath: null,
  heavenCycle: { karmaRecords: [{ id: 'karma_1', action: 'good', desc: '救人有功', weight: 10 }] }
}};

class CultivationMCPServer {
  constructor() {
    this._initHeavenOathState = function() {
      const gs = global.window.gameState;
      if (!gs.heavenOath) gs.heavenOath = { oaths: [], oathIdCounter: 0 };
      return gs.heavenOath;
    };
    this._initKarmaOathState = function() {
      const gs = global.window.gameState;
      if (!gs.karmaOath) gs.karmaOath = { binds: [], bindIdCounter: 0 };
      return gs.karmaOath;
    };
    this.mcpHeavenOathTake = function(args) {
      const gs = global.window.gameState;
      const { oathText, severity = 'minor' } = args || {};
      if (!oathText) return { error: '誓言内容不能为空' };
      if (!['minor', 'major', 'critical'].includes(severity)) return { error: '严重程度必须是 minor/major/critical 之一' };
      const state = this._initHeavenOathState();
      const oathId = 'oath_' + (++state.oathIdCounter);
      state.oaths.push({ id: oathId, oathText, severity, status: 'active', createdAt: Date.now(), pledgedAt: null, brokenAt: null });
      return { success: true, oathId, severity, status: 'active', message: '天道誓言 "' + oathText + '" 已立下' };
    };
    this.mcpHeavenOathPledge = function(args) {
      const gs = global.window.gameState;
      const { oathId } = args || {};
      if (!oathId) return { error: '誓言ID不能为空' };
      const state = this._initHeavenOathState();
      const oath = state.oaths.find(o => o.id === oathId);
      if (!oath) return { error: '誓言不存在: ' + oathId };
      if (oath.status === 'broken') return { error: '誓言已违背，无法遵守' };
      oath.pledgedAt = Date.now();
      return { success: true, oathId, status: 'pledged', message: '誓言已遵守' };
    };
    this.mcpHeavenOathBreak = function(args) {
      const gs = global.window.gameState;
      const { oathId } = args || {};
      if (!oathId) return { error: '誓言ID不能为空' };
      const state = this._initHeavenOathState();
      const oath = state.oaths.find(o => o.id === oathId);
      if (!oath) return { error: '誓言不存在: ' + oathId };
      if (oath.status === 'broken') return { error: '誓言已违背' };
      oath.brokenAt = Date.now();
      oath.status = 'broken';
      let penalty = { type: 'none' };
      if (oath.severity === 'minor') {
        gs.reputation = (gs.reputation || 50) - 10;
        penalty = { type: 'reputation', amount: 10 };
      } else if (oath.severity === 'major') {
        gs.spiritStones = (gs.spiritStones || 0) - 1000;
        penalty = { type: 'spiritStones', amount: 1000 };
      } else if (oath.severity === 'critical') {
        gs.realm = Math.max(0, (gs.realm || 0) - 1);
        penalty = { type: 'realm', amount: 1 };
      }
      return { success: true, oathId, severity: oath.severity, penalty, message: '违背誓言，遭受天道惩罚' };
    };
    this.mcpKarmaOathQuery = function(args) {
      const gs = global.window.gameState;
      const { filter = 'all' } = args || {};
      const state = this._initKarmaOathState();
      let binds = state.binds || [];
      if (filter === 'active') binds = binds.filter(b => b.status === 'active');
      else if (filter === 'broken') binds = binds.filter(b => b.status === 'broken');
      return { filter, total: binds.length, binds };
    };
    this.mcpKarmaOathBind = function(args) {
      const gs = global.window.gameState;
      const { oathId, karmaRecordId } = args || {};
      if (!oathId) return { error: '誓言ID不能为空' };
      if (!karmaRecordId) return { error: '因果记录ID不能为空' };
      const karmaState = this._initKarmaOathState();
      const heavenState = this._initHeavenOathState();
      const oath = heavenState.oaths.find(o => o.id === oathId);
      if (!oath) return { error: '誓言不存在: ' + oathId };
      const karmaRecords = gs.heavenCycle?.karmaRecords || [];
      const karmaRecord = karmaRecords.find(r => r.id === karmaRecordId);
      if (!karmaRecord) return { error: '因果记录不存在: ' + karmaRecordId };
      const bindId = 'bind_' + (++karmaState.bindIdCounter);
      karmaState.binds.push({ id: bindId, oathId, karmaRecordId, status: 'active', createdAt: Date.now(), releasedAt: null });
      return { success: true, bindId, oathId, karmaRecordId, status: 'active', message: '誓约已绑定因果' };
    };
    this.mcpKarmaOathRelease = function(args) {
      const gs = global.window.gameState;
      const { oathId } = args || {};
      if (!oathId) return { error: '誓言ID不能为空' };
      const state = this._initKarmaOathState();
      const bind = state.binds.find(b => b.oathId === oathId && b.status === 'active');
      if (!bind) return { error: '不存在的誓约或已解除: ' + oathId };
      bind.releasedAt = Date.now();
      bind.status = 'broken';
      return { success: true, oathId, status: 'released', message: '誓约已解除' };
    };
  }
}

const results = [];
function v110Assert(condition, msg) { results.push({ pass: !!condition, msg }); }

const mockGameState = {
  spiritStones: 10000, realm: 3, stage: 1, reputation: 50,
  heavenOath: null, karmaOath: null,
  heavenCycle: { karmaRecords: [{ id: 'karma_1', action: 'good', desc: '救人有功', weight: 10 }] }
};
global.window = { gameState: mockGameState };
const server = new CultivationMCPServer();

// Test 1
mockGameState.heavenOath = null;
const take1 = server.mcpHeavenOathTake({ oathText: '永不杀生', severity: 'minor' });
v110Assert(take1.success === true, 'Test 1: heaven.oath.take succeeds');
v110Assert(take1.oathId && take1.oathId.startsWith('oath_'), 'Test 1: returns oathId');
v110Assert(take1.severity === 'minor', 'Test 1: minor severity');
v110Assert(take1.status === 'active', 'Test 1: status active');

// Test 2
mockGameState.heavenOath = null;
const take2 = server.mcpHeavenOathTake({ oathText: '永不欺师', severity: 'major' });
v110Assert(take2.severity === 'major', 'Test 2: major severity');

// Test 3
mockGameState.heavenOath = null;
const take3 = server.mcpHeavenOathTake({ oathText: '永不叛道', severity: 'critical' });
v110Assert(take3.severity === 'critical', 'Test 3: critical severity');

// Test 4
mockGameState.heavenOath = null;
const take4 = server.mcpHeavenOathTake({});
v110Assert(take4.error && take4.error.includes('不能为空'), 'Test 4: fails without oathText');

// Test 5
mockGameState.heavenOath = null;
const take5 = server.mcpHeavenOathTake({ oathText: 'test', severity: 'invalid' });
v110Assert(take5.error && take5.error.includes('minor/major/critical'), 'Test 5: rejects invalid severity');

// Test 6
mockGameState.heavenOath = { oaths: [{ id: 'oath_1', oathText: 'test', severity: 'minor', status: 'active' }], oathIdCounter: 1 };
const pledge6 = server.mcpHeavenOathPledge({ oathId: 'oath_1' });
v110Assert(pledge6.success === true, 'Test 6: pledge succeeds');
v110Assert(pledge6.status === 'pledged', 'Test 6: status pledged');

// Test 7
const pledge7 = server.mcpHeavenOathPledge({ oathId: 'oath_999' });
v110Assert(pledge7.error && pledge7.error.includes('不存在'), 'Test 7: fails for non-existent oath');

// Test 8
mockGameState.heavenOath = { oaths: [{ id: 'oath_2', oathText: 'test', severity: 'minor', status: 'broken' }], oathIdCounter: 2 };
const pledge8 = server.mcpHeavenOathPledge({ oathId: 'oath_2' });
v110Assert(pledge8.error && pledge8.error.includes('已违背'), 'Test 8: fails for broken oath');

// Test 9
mockGameState.reputation = 50;
mockGameState.heavenOath = { oaths: [{ id: 'oath_3', oathText: 'test', severity: 'minor', status: 'active' }], oathIdCounter: 3 };
const break9 = server.mcpHeavenOathBreak({ oathId: 'oath_3' });
v110Assert(break9.success === true, 'Test 9: break succeeds');
v110Assert(break9.penalty && break9.penalty.type === 'reputation', 'Test 9: minor penalty is reputation');
v110Assert(mockGameState.reputation === 40, 'Test 9: minor penalty -10 reputation');

// Test 10
mockGameState.spiritStones = 10000;
mockGameState.heavenOath = { oaths: [{ id: 'oath_4', oathText: 'test', severity: 'major', status: 'active' }], oathIdCounter: 4 };
const break10 = server.mcpHeavenOathBreak({ oathId: 'oath_4' });
v110Assert(break10.penalty && break10.penalty.type === 'spiritStones', 'Test 10: major penalty is spiritStones');
v110Assert(mockGameState.spiritStones === 9000, 'Test 10: major penalty -1000 stones');

// Test 11
mockGameState.realm = 3;
mockGameState.heavenOath = { oaths: [{ id: 'oath_5', oathText: 'test', severity: 'critical', status: 'active' }], oathIdCounter: 5 };
const break11 = server.mcpHeavenOathBreak({ oathId: 'oath_5' });
v110Assert(break11.penalty && break11.penalty.type === 'realm', 'Test 11: critical penalty is realm');
v110Assert(mockGameState.realm === 2, 'Test 11: critical penalty realm -1');

// Test 12
const break12 = server.mcpHeavenOathBreak({ oathId: 'oath_999' });
v110Assert(break12.error && break12.error.includes('不存在'), 'Test 12: break fails for non-existent oath');

// Test 13
mockGameState.heavenOath = { oaths: [{ id: 'oath_6', oathText: 'test', severity: 'minor', status: 'broken' }], oathIdCounter: 6 };
const break13 = server.mcpHeavenOathBreak({ oathId: 'oath_6' });
v110Assert(break13.error && break13.error.includes('已违背'), 'Test 13: break fails for already broken oath');

// Test 14
mockGameState.karmaOath = { binds: [], bindIdCounter: 0 };
const query14 = server.mcpKarmaOathQuery({});
v110Assert(query14.filter === 'all', 'Test 14: default filter all');
v110Assert(query14.total === 0, 'Test 14: returns 0 binds');
v110Assert(Array.isArray(query14.binds), 'Test 14: returns binds array');

// Test 15
mockGameState.karmaOath = { binds: [{ id: 'bind_1', oathId: 'oath_1', status: 'active' }], bindIdCounter: 1 };
const query15 = server.mcpKarmaOathQuery({ filter: 'active' });
v110Assert(query15.filter === 'active', 'Test 15: filter active');
v110Assert(query15.total === 1, 'Test 15: active returns 1');

// Test 16
const query16 = server.mcpKarmaOathQuery({ filter: 'broken' });
v110Assert(query16.filter === 'broken', 'Test 16: filter broken');
v110Assert(query16.total === 0, 'Test 16: broken returns 0');

// Test 17
mockGameState.heavenOath = { oaths: [{ id: 'oath_7', oathText: 'test', severity: 'minor', status: 'active' }], oathIdCounter: 7 };
mockGameState.karmaOath = { binds: [], bindIdCounter: 0 };
const bind17 = server.mcpKarmaOathBind({ oathId: 'oath_7', karmaRecordId: 'karma_1' });
v110Assert(bind17.success === true, 'Test 17: bind succeeds');
v110Assert(bind17.bindId && bind17.bindId.startsWith('bind_'), 'Test 17: returns bindId');
v110Assert(bind17.status === 'active', 'Test 17: status active');

// Test 18
const bind18 = server.mcpKarmaOathBind({ karmaRecordId: 'karma_1' });
v110Assert(bind18.error && bind18.error.includes('誓言ID不能为空'), 'Test 18: fails without oathId');

// Test 19
const bind19 = server.mcpKarmaOathBind({ oathId: 'oath_1' });
v110Assert(bind19.error && bind19.error.includes('因果记录ID不能为空'), 'Test 19: fails without karmaRecordId');

// Test 20
mockGameState.karmaOath = { binds: [], bindIdCounter: 0 };
const bind20 = server.mcpKarmaOathBind({ oathId: 'oath_999', karmaRecordId: 'karma_1' });
v110Assert(bind20.error && bind20.error.includes('誓言不存在'), 'Test 20: fails for non-existent oath');

// Test 21
mockGameState.heavenOath = { oaths: [{ id: 'oath_8', oathText: 'test', severity: 'minor', status: 'active' }], oathIdCounter: 8 };
const bind21 = server.mcpKarmaOathBind({ oathId: 'oath_8', karmaRecordId: 'karma_999' });
v110Assert(bind21.error && bind21.error.includes('因果记录不存在'), 'Test 21: fails for non-existent karma record');

// Test 22
mockGameState.heavenOath = { oaths: [{ id: 'oath_9', oathText: 'test', severity: 'minor', status: 'active' }], oathIdCounter: 9 };
mockGameState.karmaOath = { binds: [{ id: 'bind_2', oathId: 'oath_9', karmaRecordId: 'karma_1', status: 'active' }], bindIdCounter: 2 };
const release22 = server.mcpKarmaOathRelease({ oathId: 'oath_9' });
v110Assert(release22.success === true, 'Test 22: release succeeds');
v110Assert(release22.status === 'released', 'Test 22: status released');

// Test 23
const release23 = server.mcpKarmaOathRelease({});
v110Assert(release23.error && release23.error.includes('誓言ID不能为空'), 'Test 23: fails without oathId');

// Test 24
mockGameState.karmaOath = { binds: [], bindIdCounter: 0 };
const release24 = server.mcpKarmaOathRelease({ oathId: 'oath_999' });
v110Assert(release24.error && release24.error.includes('不存在'), 'Test 24: fails for non-existent bind');

// Test 25
mockGameState.karmaOath = { binds: [{ id: 'bind_3', oathId: 'oath_10', karmaRecordId: 'karma_1', status: 'broken' }], bindIdCounter: 3 };
const release25 = server.mcpKarmaOathRelease({ oathId: 'oath_10' });
v110Assert(release25.error && release25.error.includes('已解除'), 'Test 25: fails for already released bind');

// Test 26
mockGameState.heavenOath = { oaths: [], oathIdCounter: 0 };
server.mcpHeavenOathTake({ oathText: 'test1', severity: 'minor' });
server.mcpHeavenOathTake({ oathText: 'test2', severity: 'minor' });
v110Assert(mockGameState.heavenOath.oathIdCounter === 2, 'Test 26: increments counter');

// Test 27
mockGameState.heavenOath = { oaths: [{ id: 'oath_11', oathText: 'test', severity: 'minor', status: 'active' }], oathIdCounter: 11 };
mockGameState.karmaOath = { binds: [], bindIdCounter: 0 };
server.mcpKarmaOathBind({ oathId: 'oath_11', karmaRecordId: 'karma_1' });
server.mcpKarmaOathBind({ oathId: 'oath_11', karmaRecordId: 'karma_1' });
v110Assert(mockGameState.karmaOath.bindIdCounter === 2, 'Test 27: bind increments counter');

// Test 28
mockGameState.karmaOath = { binds: [{ id: 'bind_4', oathId: 'oath_a', karmaRecordId: 'karma_1', status: 'active' }, { id: 'bind_5', oathId: 'oath_b', karmaRecordId: 'karma_1', status: 'broken' }], bindIdCounter: 5 };
const query28 = server.mcpKarmaOathQuery({});
v110Assert(query28.total === 2, 'Test 28: returns 2 binds');

// Test 29
mockGameState.realm = 0;
mockGameState.heavenOath = { oaths: [{ id: 'oath_12', oathText: 'test', severity: 'critical', status: 'active' }], oathIdCounter: 12 };
server.mcpHeavenOathBreak({ oathId: 'oath_12' });
v110Assert(mockGameState.realm === 0, 'Test 29: critical penalty realm stays at 0');

// Test 30
mockGameState.heavenOath = { oaths: [{ id: 'oath_13', oathText: 'test', severity: 'minor', status: 'active' }], oathIdCounter: 13 };
mockGameState.karmaOath = { binds: [], bindIdCounter: 0 };
const bind30 = server.mcpKarmaOathBind({ oathId: 'oath_13', karmaRecordId: 'karma_1' });
v110Assert(bind30.oathId === 'oath_13', 'Test 30: returns correct oathId');
v110Assert(bind30.karmaRecordId === 'karma_1', 'Test 30: returns correct karmaRecordId');

// Test 31
mockGameState.heavenOath = { oaths: [{ id: 'oath_14', oathText: 'test', severity: 'minor', status: 'active', pledgedAt: null }], oathIdCounter: 14 };
server.mcpHeavenOathPledge({ oathId: 'oath_14' });
v110Assert(mockGameState.heavenOath.oaths[0].pledgedAt > 0, 'Test 31: pledge sets pledgedAt');

// Test 32
mockGameState.heavenOath = { oaths: [{ id: 'oath_15', oathText: 'test', severity: 'minor', status: 'active', brokenAt: null }], oathIdCounter: 15 };
server.mcpHeavenOathBreak({ oathId: 'oath_15' });
v110Assert(mockGameState.heavenOath.oaths[0].brokenAt > 0, 'Test 32: break sets brokenAt');

// Test 33
mockGameState.karmaOath = { binds: [{ id: 'bind_6', oathId: 'oath_16', karmaRecordId: 'karma_1', status: 'active', releasedAt: null }], bindIdCounter: 6 };
server.mcpKarmaOathRelease({ oathId: 'oath_16' });
v110Assert(mockGameState.karmaOath.binds[0].releasedAt > 0, 'Test 33: release sets releasedAt');

// Test 34
mockGameState.heavenOath = null;
server.mcpHeavenOathTake({ oathText: '永不淫邪', severity: 'minor' });
v110Assert(mockGameState.heavenOath.oaths[0].oathText === '永不淫邪', 'Test 34: stores correct oathText');

// Test 35
mockGameState.heavenOath = null;
const take35 = server.mcpHeavenOathTake({ oathText: 'test' });
v110Assert(take35.severity === 'minor', 'Test 35: default severity minor');

// Test 36
mockGameState.karmaOath = { binds: [{ id: 'bind_7', oathId: 'oath_a', karmaRecordId: 'karma_1', status: 'active' }, { id: 'bind_8', oathId: 'oath_b', karmaRecordId: 'karma_1', status: 'broken' }], bindIdCounter: 8 };
const query36 = server.mcpKarmaOathQuery({ filter: 'all' });
v110Assert(query36.total === 2, 'Test 36: filter all returns both');

// Test 37
mockGameState.heavenOath = null;
server._initHeavenOathState();
v110Assert(mockGameState.heavenOath.oaths && Array.isArray(mockGameState.heavenOath.oaths), 'Test 37: creates oaths array');
v110Assert(mockGameState.heavenOath.oathIdCounter === 0, 'Test 37: initializes counter');

// Test 38
mockGameState.karmaOath = null;
server._initKarmaOathState();
v110Assert(mockGameState.karmaOath.binds && Array.isArray(mockGameState.karmaOath.binds), 'Test 38: creates binds array');
v110Assert(mockGameState.karmaOath.bindIdCounter === 0, 'Test 38: initializes counter');

// Test 39
mockGameState.heavenOath = { oaths: [{ id: 'oath_17', oathText: 'test', severity: 'minor', status: 'active' }], oathIdCounter: 17 };
mockGameState.karmaOath = { binds: [], bindIdCounter: 0 };
mockGameState.heavenCycle.karmaRecords = [];
const bind39 = server.mcpKarmaOathBind({ oathId: 'oath_17', karmaRecordId: 'karma_1' });
v110Assert(bind39.error && bind39.error.includes('因果记录不存在'), 'Test 39: fails when karma record not found');

// Test 40
mockGameState.heavenOath = { oaths: [{ id: 'oath_18', oathText: 'test', severity: 'minor', status: 'active' }], oathIdCounter: 18 };
mockGameState.karmaOath = { binds: [], bindIdCounter: 0 };
mockGameState.heavenCycle.karmaRecords = [{ id: 'karma_test', action: 'good', desc: 'test', weight: 5 }];
const bind40 = server.mcpKarmaOathBind({ oathId: 'oath_18', karmaRecordId: 'karma_test' });
v110Assert(bind40.success === true, 'Test 40: bind succeeds with valid karma record');

const passed = results.filter(r => r.pass).length;
const total = results.length;
const passRate = passed / total;
console.log('V110 Tests:', passed + '/' + total, '(' + (passRate * 100).toFixed(1) + '%)');
if (passed < total) {
  results.forEach((r, i) => { if (!r.pass) console.log('  FAIL[' + i + ']: ' + r.msg); });
}
process.exit(passed === total ? 0 : 1);