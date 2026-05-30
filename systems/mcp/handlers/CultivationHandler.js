// ============================================================
// CultivationHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 7432-7717
// Auto-generated - Do not edit manually
// ============================================================

            // V82: Technique & Skill DAG System
            mcpTechniqueLibrary(filter, realm) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const playerRealm = realm || gs.realm || 1;
                    const TECHNIQUES = [
                        { id: 'TK_QY', name: '青云诀', type: 'cultivation', realmReq: 1, power: 10, description: '基础修炼功法' },
                        { id: 'TK_TL', name: '天雷法', type: 'combat', realmReq: 2, power: 25, description: '天雷轰击术' },
                        { id: 'TK_JG', name: '金刚经', type: 'defense', realmReq: 2, power: 20, description: '金刚护体诀' },
                        { id: 'TK_CS', name: '长生术', type: 'cultivation', realmReq: 3, power: 15, description: '延年益寿诀' },
                        { id: 'TK_WH', name: '万化术', type: 'hybrid', realmReq: 4, power: 30, description: '万般变化诀' },
                        { id: 'TK_HC', name: '寒冰诀', type: 'combat', realmReq: 3, power: 28, description: '寒冰冻结术' },
                        { id: 'TK_LQ', name: '烈焰术', type: 'combat', realmReq: 2, power: 22, description: '烈焰焚烧术' },
                        { id: 'TK_FS', name: '飞天术', type: 'buff', realmReq: 3, power: 12, description: '腾云驾雾术' }
                    ];
                    const learned = gs.learnedTechniques || [];
                    const filterType = filter || 'all';
                    let filtered = TECHNIQUES;
                    if (filterType === 'learned') filtered = TECHNIQUES.filter(t => learned.includes(t.id));
                    else if (filterType === 'available') filtered = TECHNIQUES.filter(t => !learned.includes(t.id) && t.realmReq <= playerRealm);
                    else if (filterType === 'combat') filtered = TECHNIQUES.filter(t => t.type === 'combat' || t.type === 'hybrid');
                    else if (filterType === 'cultivation') filtered = TECHNIQUES.filter(t => t.type === 'cultivation' || t.type === 'buff');
                    return {
                        techniques: filtered.map(t => ({
                            ...t,
                            learned: learned.includes(t.id),
                            available: !learned.includes(t.id) && t.realmReq <= playerRealm
                        })),
                        total: filtered.length,
                        learnedCount: learned.length,
                        playerRealm
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpTechniqueLearn(techniqueId, autoAssign) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const TECH_IDS = ['TK_QY', 'TK_TL', 'TK_JG', 'TK_CS', 'TK_WH', 'TK_HC', 'TK_LQ', 'TK_FS'];
                    if (!TECH_IDS.includes(techniqueId)) return { error: 'Unknown technique ID' };
                    gs.learnedTechniques = gs.learnedTechniques || [];
                    if (gs.learnedTechniques.includes(techniqueId)) return { error: 'Technique already learned', learned: gs.learnedTechniques };
                    if (gs.learnedTechniques.length >= 4) return { error: 'Max techniques reached (4)' };
                    gs.learnedTechniques.push(techniqueId);
                    const TECH_NAMES = { TK_QY: '青云诀', TK_TL: '天雷法', TK_JG: '金刚经', TK_CS: '长生术', TK_WH: '万化术', TK_HC: '寒冰诀', TK_LQ: '烈焰术', TK_FS: '飞天术' };
                    const result = { success: true, techniqueId, techniqueName: TECH_NAMES[techniqueId], learnedCount: gs.learnedTechniques.length };
                    if (autoAssign !== false) {
                        gs.equippedTechniques = gs.equippedTechniques || [];
                        if (!gs.equippedTechniques.includes(techniqueId)) gs.equippedTechniques.push(techniqueId);
                        result.equipped = gs.equippedTechniques;
                    }
                    return result;
                } catch(e) { return { error: e.message }; }
            }

            mcpTechniqueForget(techniqueId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.learnedTechniques = gs.learnedTechniques || [];
                    const idx = gs.learnedTechniques.indexOf(techniqueId);
                    if (idx === -1) return { error: 'Technique not learned' };
                    gs.learnedTechniques.splice(idx, 1);
                    gs.equippedTechniques = (gs.equippedTechniques || []).filter(t => t !== techniqueId);
                    return { success: true, techniqueId, learnedCount: gs.learnedTechniques.length, equipped: gs.equippedTechniques };
                } catch(e) { return { error: e.message }; }
            }

            mcpTechniqueCombo(comboType) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const equipped = gs.equippedTechniques || [];
                    const TECH_COMBOS = {
                        attack: { name: '天雷烈火', techniques: ['TK_TL', 'TK_LQ'], bonus: { attack: 50, critRate: 15 }, description: '天雷+烈火 combo' },
                        defense: { name: '金刚寒冰', techniques: ['TK_JG', 'TK_HC'], bonus: { defense: 40, resist: 20 }, description: '金刚+寒冰 combo' },
                        buff: { name: '长生飞天', techniques: ['TK_CS', 'TK_FS'], bonus: { hpMax: 30, speed: 25 }, description: '长生+飞天 combo' },
                        hybrid: { name: '万化归一', techniques: ['TK_WH', 'TK_QY'], bonus: { attack: 20, defense: 20, hpMax: 20 }, description: '万化+青云 combo' }
                    };
                    const type = comboType || 'hybrid';
                    const combo = TECH_COMBOS[type];
                    if (!combo) return { error: 'Invalid combo type' };
                    const hasAll = combo.techniques.every(t => equipped.includes(t));
                    const hasPartial = combo.techniques.some(t => equipped.includes(t));
                    return {
                        combo,
                        active: hasAll,
                        partialMatch: hasPartial && !hasAll,
                        equippedTechniques: equipped,
                        message: hasAll ? 'Combo activated!' : hasPartial ? 'Partial combo (need more techniques)' : 'No matching techniques equipped'
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpSkillGraph(viewMode) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const view = viewMode || 'full';
                    const nodes = [
                        { id: 'N_ROOT', name: '炼气期', type: 'root', unlocked: true, x: 50, y: 80 },
                        { id: 'N_KIRIN', name: '麒麟腿', type: 'skill', unlocked: gs.skills && gs.skills.includes('N_KIRIN'), x: 30, y: 60, requires: ['N_ROOT'] },
                        { id: 'N_THUNDER', name: '天雷拳', type: 'skill', unlocked: gs.skills && gs.skills.includes('N_THUNDER'), x: 50, y: 60, requires: ['N_ROOT'] },
                        { id: 'N_GOLD', name: '金刚身', type: 'skill', unlocked: gs.skills && gs.skills.includes('N_GOLD'), x: 70, y: 60, requires: ['N_ROOT'] },
                        { id: 'N_FIRE', name: '烈焰掌', type: 'skill', unlocked: gs.skills && gs.skills.includes('N_FIRE'), x: 20, y: 40, requires: ['N_KIRIN'] },
                        { id: 'N_ICE', name: '寒冰指', type: 'skill', unlocked: gs.skills && gs.skills.includes('N_ICE'), x: 40, y: 40, requires: ['N_THUNDER'] },
                        { id: 'N_LIGHT', name: '闪电拳', type: 'skill', unlocked: gs.skills && gs.skills.includes('N_LIGHT'), x: 60, y: 40, requires: ['N_THUNDER'] },
                        { id: 'N_STONE', name: '金刚石', type: 'skill', unlocked: gs.skills && gs.skills.includes('N_STONE'), x: 80, y: 40, requires: ['N_GOLD'] },
                        { id: 'N_MERGE', name: '融合技', type: 'ultimate', unlocked: gs.skills && gs.skills.includes('N_MERGE'), x: 50, y: 20, requires: ['N_FIRE', 'N_ICE', 'N_LIGHT', 'N_STONE'] }
                    ];
                    const edges = [
                        { from: 'N_ROOT', to: 'N_KIRIN' }, { from: 'N_ROOT', to: 'N_THUNDER' }, { from: 'N_ROOT', to: 'N_GOLD' },
                        { from: 'N_KIRIN', to: 'N_FIRE' }, { from: 'N_THUNDER', to: 'N_ICE' }, { from: 'N_THUNDER', to: 'N_LIGHT' },
                        { from: 'N_GOLD', to: 'N_STONE' },
                        { from: 'N_FIRE', to: 'N_MERGE' }, { from: 'N_ICE', to: 'N_MERGE' }, { from: 'N_LIGHT', to: 'N_MERGE' }, { from: 'N_STONE', to: 'N_MERGE' }
                    ];
                    let filteredNodes = nodes;
                    if (view === 'unlocked') filteredNodes = nodes.filter(n => n.unlocked);
                    else if (view === 'locked') filteredNodes = nodes.filter(n => !n.unlocked);
                    else if (view === 'active') filteredNodes = nodes.filter(n => gs.skills && gs.skills.includes(n.id));
                    return {
                        nodes: filteredNodes,
                        edges: view === 'full' ? edges : edges.filter(e => filteredNodes.some(n => n.id === e.from || n.id === e.to)),
                        totalNodes: nodes.length,
                        unlockedCount: nodes.filter(n => n.unlocked).length
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpSkillUnlock(nodeId, cost) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const NODE_COSTS = { N_KIRIN: 100, N_THUNDER: 100, N_GOLD: 100, N_FIRE: 300, N_ICE: 300, N_LIGHT: 300, N_STONE: 300, N_MERGE: 1000 };
                    const NODE_NAMES = { N_KIRIN: '麒麟腿', N_THUNDER: '天雷拳', N_GOLD: '金刚身', N_FIRE: '烈焰掌', N_ICE: '寒冰指', N_LIGHT: '闪电拳', N_STONE: '金刚石', N_MERGE: '融合技' };
                    const NODE_REQUIRES = { N_KIRIN: ['N_ROOT'], N_THUNDER: ['N_ROOT'], N_GOLD: ['N_ROOT'], N_FIRE: ['N_KIRIN'], N_ICE: ['N_THUNDER'], N_LIGHT: ['N_THUNDER'], N_STONE: ['N_GOLD'], N_MERGE: ['N_FIRE', 'N_ICE', 'N_LIGHT', 'N_STONE'] };
                    if (!NODE_COSTS[nodeId]) return { error: 'Unknown skill node' };
                    gs.skills = gs.skills || [];
                    if (gs.skills.includes(nodeId)) return { error: 'Skill already unlocked', skills: gs.skills };
                    const requires = NODE_REQUIRES[nodeId] || [];
                    const missingReqs = requires.filter(r => !gs.skills.includes(r));
                    if (missingReqs.length > 0) return { error: 'Prerequisites not met', missing: missingReqs };
                    const actualCost = cost || NODE_COSTS[nodeId];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < actualCost) return { error: 'Not enough spirit stones', required: actualCost, available: gs.spiritStones };
                    gs.spiritStones -= actualCost;
                    gs.skills.push(nodeId);
                    return { success: true, nodeId, nodeName: NODE_NAMES[nodeId], cost: actualCost, remainingStones: gs.spiritStones, totalSkills: gs.skills.length };
                } catch(e) { return { error: e.message }; }
            }

            // V83: Tribulation System
            mcpTribulationStart(realm) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const targetRealm = realm || (gs.realm || 1) + 1;
                    const REALM_NAMES = { 2: '筑基期', 3: '金丹期', 4: '元婴期', 5: '化神期', 6: '渡劫期', 7: '大乘期', 8: '真仙期' };
                    gs.tribulation = {
                        active: true,
                        targetRealm,
                        realmName: REALM_NAMES[targetRealm] || '天人',
                        phase: 'lightning',
                        strikesTotal: targetRealm * 3,
                        strikesCurrent: 0,
                        damageAccumulated: 0,
                        resistedAccumulated: 0,
                        startTime: Date.now(),
                        success: null
                    };
                    return { success: true, targetRealm, realmName: REALM_NAMES[targetRealm], strikesTotal: gs.tribulation.strikesTotal };
                } catch(e) { return { error: e.message }; }
            }

            mcpTribulationProgress() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.tribulation || !gs.tribulation.active) return { error: 'No active tribulation' };
                    const t = gs.tribulation;
                    return {
                        targetRealm: t.targetRealm,
                        realmName: t.realmName,
                        phase: t.phase,
                        strikesCurrent: t.strikesCurrent,
                        strikesTotal: t.strikesTotal,
                        progress: t.strikesTotal > 0 ? (t.strikesCurrent / t.strikesTotal * 100).toFixed(1) + '%' : '0%',
                        damageAccumulated: t.damageAccumulated,
                        resistedAccumulated: t.resistedAccumulated,
                        resistanceRate: t.strikesCurrent > 0 ? (t.resistedAccumulated / t.strikesCurrent * 100).toFixed(1) + '%' : '0%',
                        success: t.success
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpTribulationLightning(damage, resisted) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.tribulation || !gs.tribulation.active) return { error: 'No active tribulation' };
                    const t = gs.tribulation;
                    t.strikesCurrent++;
                    t.damageAccumulated += damage;
                    if (resisted) t.resistedAccumulated++;
                    if (t.strikesCurrent >= t.strikesTotal) {
                        t.phase = 'complete';
                        t.active = false;
                        const resistRate = t.strikesCurrent > 0 ? t.resistedAccumulated / t.strikesCurrent : 0;
                        t.success = resistRate >= 0.5;
                        if (t.success) {
                            gs.realm = t.targetRealm;
                            gs.cultivationXP = (gs.cultivationXP || 0) + t.targetRealm * 500;
                        }
                    }
                    return {
                        strikeNumber: t.strikesCurrent,
                        damage,
                        resisted: resisted || false,
                        progress: t.strikesCurrent + '/' + t.strikesTotal,
                        tribulationComplete: !t.active,
                        success: t.success,
                        newRealm: t.success ? t.targetRealm : null
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpTribulationBlessing(type) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const record = gs.tribulationRecord || [];
                    const lastSuccess = record.filter(r => r.success).pop();
                    if (!lastSuccess) return { error: 'No successful tribulation to receive blessing' };
                    const blessType = type || 'random';
                    const BLESSINGS = {
                        strength: { name: '天雷淬体', effect: { attack: 15, defense: 10 } },
                        spirit: { name: '灵气灌顶', effect: { cultivationSpeed: 20, maxSpiritual: 50 } },
                        cultivation: { name: '道心稳固', effect: { realmProgress: 10, comprehension: 15 } },
                        random: null
                    };
                    let blessing;
                    if (blessType === 'random') {
                        const types = ['strength', 'spirit', 'cultivation'];
                        const chosen = types[Math.floor(Math.random() * types.length)];
                        blessing = { type: chosen, ...BLESSINGS[chosen] };
                    } else {
                        if (!BLESSINGS[blessType]) return { error: 'Invalid blessing type' };
                        blessing = { type: blessType, ...BLESSINGS[blessType] };
                    }
                    gs.blessings = gs.blessings || [];
                    gs.blessings.push({ ...blessing, receivedAt: Date.now(), realm: lastSuccess.realm });
                    return { success: true, blessing };
                } catch(e) { return { error: e.message }; }
            }

            mcpTribulationRecord(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const records = gs.tribulationRecord || [];
                    const f = filter || 'all';
                    let filtered = records;
                    if (f === 'success') filtered = records.filter(r => r.success);
                    else if (f === 'failed') filtered = records.filter(r => !r.success);
                    else if (f === 'latest') filtered = [records[records.length - 1]];
                    return { records: filtered, total: records.length, successCount: records.filter(r => r.success).length, failedCount: records.filter(r => !r.success).length };
                } catch(e) { return { error: e.message }; }
            }

            mcpTribulationTalentModify(talent) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const VALID_TALENTS = ['normal', 'good', 'genius', 'immortal'];
                    if (!VALID_TALENTS.includes(talent)) return { error: 'Invalid talent value' };
                    const record = gs.tribulationRecord || [];
                    const lastSuccess = record.filter(r => r.success).pop();
                    if (!lastSuccess) return { error: 'No successful tribulation for talent modification' };
                    const oldTalent = gs.talent || 'normal';
                    gs.talent = talent;
                    return { success: true, oldTalent, newTalent: talent, realm: lastSuccess.realm };
                } catch(e) { return { error: e.message }; }
            }
