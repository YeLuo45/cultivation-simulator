// ============================================================
// SectHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 7301-7584
// Auto-generated - Do not edit manually
// ============================================================

            // V81: Sect & Disciple System
            mcpSectInfo(view) {
                try {
                    const gs = window.gameState;
                    if (!gs || !gs.sect) return { error: 'No sect found' };
                    const sect = gs.sect;
                    const v = view || 'overview';
                    switch (v) {
                        case 'overview':
                            return { name: sect.name || '无宗门', level: sect.level || 1, reputation: sect.reputation || 0, memberCount: sect.disciples ? sect.disciples.length : 0, maxDisciples: (sect.maxDisciples || 5) };
                        case 'disciples':
                            return { disciples: sect.disciples || [] };
                        case 'resources':
                            return { spiritStones: sect.spiritStones || 0, resources: sect.resources || {} };
                        case 'missions':
                            return { missions: sect.missions || [], activeMissions: (sect.missions || []).filter(m => m.status === 'active').length };
                        default:
                            return { error: 'Invalid view' };
                    }
                } catch(e) { return { error: e.message }; }
            }

            mcpSectDiscipleList(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs || !gs.sect || !gs.sect.disciples) return { error: 'No sect or disciples' };
                    const filterType = filter || 'all';
                    let disciples = gs.sect.disciples;
                    if (filterType === 'available') disciples = disciples.filter(d => d.status === 'available');
                    else if (filterType === 'dispatched') disciples = disciples.filter(d => d.status === 'dispatched');
                    else if (filterType === 'training') disciples = disciples.filter(d => d.status === 'training');
                    return {
                        disciples: disciples.map(d => ({
                            uid: d.uid,
                            name: d.name,
                            talent: d.talent || 'normal',
                            realm: d.realm || 0,
                            status: d.status || 'available',
                            efficiency: d.efficiency || 1.0
                        })),
                        total: disciples.length
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpSectDiscipleRecruit(talent, name) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.sect) {
                        gs.sect = { name: '青云宗', level: 1, reputation: 100, disciples: [], spiritStones: 1000, maxDisciples: 5, missions: [] };
                    }
                    const maxD = gs.sect.maxDisciples || 5;
                    if (gs.sect.disciples.length >= maxD) return { error: 'Max disciples reached for sect level' };
                    const TALENTS = ['normal', 'good', 'genius', 'immortal'];
                    const TALENT_NAMES = { normal: '普通', good: '优良', genius: '天才', immortal: '天生神人' };
                    const talentTier = talent || TALENTS[Math.floor(Math.random() * TALENTS.length)];
                    const autoName = ['弟子甲', '弟子乙', '弟子丙', '弟子丁', '弟子戊'][Math.floor(Math.random() * 5)] + Math.floor(Math.random() * 100);
                    const discipleName = name || autoName;
                    const uid = 'D_' + Date.now();
                    const newDisciple = {
                        uid,
                        name: discipleName,
                        talent: talentTier,
                        talentName: TALENT_NAMES[talentTier] || '普通',
                        realm: 1,
                        status: 'available',
                        efficiency: talentTier === 'immortal' ? 2.0 : talentTier === 'genius' ? 1.5 : talentTier === 'good' ? 1.2 : 1.0,
                        assignedTechnique: null
                    };
                    gs.sect.disciples.push(newDisciple);
                    return { success: true, disciple: newDisciple, sectDiscipleCount: gs.sect.disciples.length };
                } catch(e) { return { error: e.message }; }
            }

            mcpSectDiscipleTrain(discipleId, type) {
                try {
                    const gs = window.gameState;
                    if (!gs || !gs.sect) return { error: 'No sect' };
                    const disciple = gs.sect.disciples.find(d => d.uid === discipleId);
                    if (!disciple) return { error: 'Disciple not found' };
                    const TRAIN_TYPES = ['combat', 'cultivation', 'alchemy'];
                    const trainType = TRAIN_TYPES.includes(type) ? type : 'cultivation';
                    const gains = {
                        combat: { realm: 0.1, strength: Math.floor(5 + Math.random() * 10) },
                        cultivation: { realm: 0.2, xp: Math.floor(50 + Math.random() * 100) },
                        alchemy: { realm: 0.05, skillPoints: Math.floor(10 + Math.random() * 20) }
                    };
                    disciple.realm = (disciple.realm || 0) + gains[trainType].realm;
                    disciple.status = 'training';
                    disciple.lastTraining = { type: trainType, timestamp: Date.now(), gains: gains[trainType] };
                    return { success: true, discipleId, type: trainType, gains: gains[trainType], newRealm: disciple.realm };
                } catch(e) { return { error: e.message }; }
            }

            mcpSectCultivationAssign(discipleId, techniqueId) {
                try {
                    const gs = window.gameState;
                    if (!gs || !gs.sect) return { error: 'No sect' };
                    const disciple = gs.sect.disciples.find(d => d.uid === discipleId);
                    if (!disciple) return { error: 'Disciple not found' };
                    const TECHNIQUES = { 'T1': '青云诀', 'T2': '天雷法', 'T3': '金刚经', 'T4': '长生术', 'T5': '万化术' };
                    const techniqueName = TECHNIQUES[techniqueId] || techniqueId || '无名功法';
                    disciple.assignedTechnique = { id: techniqueId, name: techniqueName, assignedAt: Date.now() };
                    return { success: true, discipleId, technique: { id: techniqueId, name: techniqueName } };
                } catch(e) { return { error: e.message }; }
            }

            mcpSectMissionAccept(missionId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.sect) {
                        gs.sect = { name: '青云宗', level: 1, reputation: 100, disciples: [], spiritStones: 1000, maxDisciples: 5, missions: [] };
                    }
                    const MISSION_TEMPLATES = [
                        { id: 'M1', name: '采集灵石', difficulty: 1, reward: { spiritStones: 100, xp: 50 }, requiredDisciples: 1 },
                        { id: 'M2', name: '护送商队', difficulty: 2, reward: { spiritStones: 300, xp: 150 }, requiredDisciples: 2 },
                        { id: 'M3', name: '击杀妖兽', difficulty: 3, reward: { spiritStones: 800, xp: 400 }, requiredDisciples: 3 },
                        { id: 'M4', name: '探索秘境', difficulty: 4, reward: { spiritStones: 2000, xp: 1000, item: '灵草' }, requiredDisciples: 2 },
                        { id: 'M5', name: '渡劫任务', difficulty: 5, reward: { spiritStones: 5000, xp: 3000, title: '渡劫成功' }, requiredDisciples: 4 }
                    ];
                    const mission = MISSION_TEMPLATES.find(m => m.id === missionId);
                    if (!mission) return { error: 'Mission not found' };
                    const missionInstance = { ...mission, status: 'active', acceptedAt: Date.now(), assignedDisciples: [] };
                    gs.sect.missions = gs.sect.missions || [];
                    gs.sect.missions.push(missionInstance);
                    return { success: true, mission: { id: mission.id, name: mission.name, difficulty: mission.difficulty, reward: mission.reward } };
                } catch(e) { return { error: e.message }; }
            }

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
