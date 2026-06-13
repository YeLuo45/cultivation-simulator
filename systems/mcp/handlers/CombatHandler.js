// ============================================================
// CombatHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 7120-8424
// Auto-generated - Do not edit manually
// ============================================================

            // V80: Arena Battle System
            mcpBattleArenaList(season, page) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const currentSeason = season || gs.arenaSeason || 'S1';
                    const pageNum = page || 1;
                    const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'immortal'];
                    // Simulated leaderboard
                    const entries = [];
                    for (let i = 0; i < 20; i++) {
                        const tierIdx = Math.min(5, Math.floor(i / 3));
                        entries.push({
                            rank: (pageNum - 1) * 20 + i + 1,
                            name: ['天道宗弟子', '万灵谷修士', '散修散人', '仙盟长老', '妖族妖王'][i % 5] + (i + 1),
                            tier: TIERS[tierIdx],
                            rating: 2000 - i * 15,
                            wins: 50 - i,
                            losses: 10 + i
                        });
                    }
                    return {
                        season: currentSeason,
                        page: pageNum,
                        entries,
                        totalPages: 5
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpBattleArenaJoin(rankTier) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'immortal'];
                    const tier = rankTier || TIERS[Math.floor(Math.random() * 3)];
                    if (!gs.arena) {
                        gs.arena = { season: 'S1', rank: tier, rating: 1200, wins: 0, losses: 0, reports: [] };
                    }
                    gs.arena.rank = tier;
                    gs.arena.rating = gs.arena.rating || 1200;
                    // Simulate matching
                    const opponentTierIdx = Math.min(5, TIERS.indexOf(tier) + Math.floor(Math.random() * 3) - 1);
                    const opponent = {
                        name: ['挑战者甲', '挑战者乙', '金丹真人', '元婴老怪', '化神强者'][Math.floor(Math.random() * 5)],
                        tier: TIERS[Math.max(0, opponentTierIdx)],
                        rating: gs.arena.rating + Math.floor(Math.random() * 400) - 200
                    };
                    const gs2 = window.gameState;
                    if (!gs2.battleHistory) gs2.battleHistory = [];
                    const reportId = `ARENA_${Date.now()}`;
                    const playerWin = Math.random() > 0.4;
                    const damageDealt = Math.floor(500 + Math.random() * 2000);
                    const damageTaken = Math.floor(300 + Math.random() * 1500);
                    gs2.battleHistory.push({
                        id: reportId,
                        type: 'arena',
                        timestamp: Date.now(),
                        result: playerWin ? 'win' : 'loss',
                        opponent: opponent.name,
                        damageDealt,
                        damageTaken
                    });
                    gs.arena.wins += playerWin ? 1 : 0;
                    gs.arena.losses += playerWin ? 0 : 1;
                    gs.arena.rating += playerWin ? 25 : -20;
                    gs.arena.reports = gs.arena.reports || [];
                    gs.arena.reports.push(reportId);
                    return {
                        matched: true,
                        reportId,
                        opponent: opponent.name,
                        opponentTier: opponent.tier,
                        yourTier: tier,
                        yourRating: gs.arena.rating
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpBattleArenaReport(reportId) {
                try {
                    const gs = window.gameState;
                    if (!gs || !gs.battleHistory) return { error: 'No battle history' };
                    const report = gs.battleHistory.find(r => r.id === reportId);
                    if (!report) return { error: 'Report not found' };
                    return {
                        id: report.id,
                        type: report.type,
                        timestamp: new Date(report.timestamp).toISOString(),
                        result: report.result,
                        opponent: report.opponent,
                        damageDealt: report.damageDealt,
                        damageTaken: report.damageTaken,
                        duration: Math.floor(60 + Math.random() * 300) + 's',
                        skills: ['天雷术', '御剑术', '金刚诀'][Math.floor(Math.random() * 3)]
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpBattleCombatLog(count, filter) {
                try {
                    const gs = window.gameState;
                    const limit = count || 20;
                    const filterType = filter || 'all';
                    let logs = gs && gs.battleHistory ? gs.battleHistory : [];
                    if (filterType !== 'all') {
                        logs = logs.filter(l => l.type === filterType);
                    }
                    logs = logs.slice(-limit);
                    return {
                        logs: logs.map(l => ({
                            id: l.id,
                            type: l.type,
                            result: l.result,
                            opponent: l.opponent,
                            timestamp: new Date(l.timestamp).toISOString(),
                            damageDealt: l.damageDealt
                        })),
                        total: logs.length
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpBattleRankRise(period) {
                try {
                    const gs = window.gameState;
                    const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'immortal'];
                    const currentTier = gs && gs.arena ? gs.arena.rank || 'bronze' : 'bronze';
                    const currentIdx = TIERS.indexOf(currentTier);
                    const entries = [];
                    const counts = { daily: 7, weekly: 4, seasonal: 2 }[period || 'daily'] || 7;
                    let prevRating = gs && gs.arena ? gs.arena.rating - 150 : 1200;
                    for (let i = counts - 1; i >= 0; i--) {
                        const delta = Math.floor(Math.random() * 60) - 20;
                        prevRating += delta;
                        entries.push({
                            day: i === 0 ? 'today' : `${i} day${i > 1 ? 's' : ''} ago`,
                            rating: prevRating,
                            delta,
                            tier: TIERS[Math.min(5, Math.max(0, Math.floor((prevRating - 1000) / 200)))]
                        });
                    }
                    return {
                        period: period || 'daily',
                        entries,
                        currentTier,
                        currentRating: gs && gs.arena ? gs.arena.rating : 1200
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpBattleRewardClaim(tier) {
                try {
                    const TIERS = ['participation', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'immortal'];
                    const REWARDS = {
                        participation: { spiritStones: 100, xp: 50 },
                        bronze: { spiritStones: 500, xp: 200, badge: '铜牌修士' },
                        silver: { spiritStones: 1200, xp: 500, badge: '银牌修士' },
                        gold: { spiritStones: 2500, xp: 1000, badge: '金牌修士' },
                        platinum: { spiritStones: 5000, xp: 2000, badge: '铂金修士' },
                        diamond: { spiritStones: 10000, xp: 5000, badge: '钻石修士' },
                        immortal: { spiritStones: 25000, xp: 15000, badge: '不朽称号', title: '不朽者' }
                    };
                    if (!TIERS.includes(tier)) return { error: 'Invalid tier' };
                    const reward = REWARDS[tier];
                    const gs = window.gameState;
                    if (!gs.claimedRewards) gs.claimedRewards = {};
                    if (gs.claimedRewards[tier]) return { error: 'Reward already claimed for this tier', claimed: Object.keys(gs.claimedRewards) };
                    gs.claimedRewards[tier] = true;
                    gs.spiritStones = (gs.spiritStones || 0) + reward.spiritStones;
                    gs.cultivationXP = (gs.cultivationXP || 0) + reward.xp;
                    return {
                        claimed: true,
                        tier,
                        rewards: reward,
                        spiritStones: gs.spiritStones,
                        cultivationXP: gs.cultivationXP
                    };
                } catch(e) { return { error: e.message }; }
            }

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

            // V84: Artifact & Equipment System
            mcpArtifactForge(tier, material) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const VALID_TIERS = ['common', 'rare', 'epic', 'legendary'];
                    if (!VALID_TIERS.includes(tier)) return { error: 'Invalid artifact tier' };
                    const TIER_POWER = { common: 10, rare: 25, epic: 50, legendary: 100 };
                    const TIER_COST = { common: 100, rare: 500, epic: 2000, legendary: 8000 };
                    const MATERIAL_BONUS = { iron: 1.0, jade: 1.2, gold: 1.5, spirit: 2.0 };
                    const mat = material || 'iron';
                    const bonus = MATERIAL_BONUS[mat] || 1.0;
                    const cost = TIER_COST[tier];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    gs.spiritStones -= cost;
                    gs.artifacts = gs.artifacts || [];
                    const artifactId = 'AR_' + Date.now();
                    const power = Math.round(TIER_POWER[tier] * bonus);
                    const newArtifact = { id: artifactId, tier, material: mat, level: 1, power, bound: false, attunement: 0, createdAt: Date.now() };
                    gs.artifacts.push(newArtifact);
                    return { success: true, artifact: newArtifact, cost, remainingStones: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpArtifactUpgrade(artifactId, targetLevel) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.artifacts = gs.artifacts || [];
                    const artifact = gs.artifacts.find(a => a.id === artifactId);
                    if (!artifact) return { error: 'Artifact not found' };
                    const target = targetLevel || (artifact.level + 1);
                    if (target > 15) return { error: 'Max artifact level is 15' };
                    if (target <= artifact.level) return { error: 'Target level must be higher than current' };
                    const LEVEL_COST = (target - artifact.level) * 200 * (artifact.level + 1);
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < LEVEL_COST) return { error: 'Not enough spirit stones', required: LEVEL_COST, available: gs.spiritStones };
                    gs.spiritStones -= LEVEL_COST;
                    artifact.level = target;
                    artifact.power = Math.round(artifact.power * (1 + (target - 1) * 0.1));
                    return { success: true, artifactId, newLevel: artifact.level, newPower: artifact.power, cost: LEVEL_COST };
                } catch(e) { return { error: e.message }; }
            }

            mcpArtifactAttune(artifactId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.artifacts = gs.artifacts || [];
                    const artifact = gs.artifacts.find(a => a.id === artifactId);
                    if (!artifact) return { error: 'Artifact not found' };
                    if (!artifact.bound) return { error: 'Artifact must be bound before attunement' };
                    const ATTUNEMENT_PER_USE = 10;
                    artifact.attunement = Math.min(100, (artifact.attunement || 0) + ATTUNEMENT_PER_USE);
                    const BONUS_PER_10 = { attack: 2, defense: 2, critRate: 0.5 };
                    return {
                        attunement: artifact.attunement,
                        maxAttunement: 100,
                        bonuses: {
                            attack: Math.floor(artifact.attunement / 10) * BONUS_PER_10.attack,
                            defense: Math.floor(artifact.attunement / 10) * BONUS_PER_10.defense,
                            critRate: (artifact.attunement / 10) * BONUS_PER_10.critRate
                        }
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpArtifactBind(artifactId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.artifacts = gs.artifacts || [];
                    const artifact = gs.artifacts.find(a => a.id === artifactId);
                    if (!artifact) return { error: 'Artifact not found' };
                    if (artifact.bound) return { error: 'Artifact already bound' };
                    artifact.bound = true;
                    return { success: true, artifactId, bound: true };
                } catch(e) { return { error: e.message }; }
            }

            mcpArtifactStats(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const artifacts = gs.artifacts || [];
                    const f = filter || 'all';
                    let filtered = artifacts;
                    if (f === 'equipped') filtered = artifacts.filter(a => gs.equippedArtifacts && gs.equippedArtifacts.includes(a.id));
                    else if (f === 'inventory') filtered = artifacts.filter(a => !gs.equippedArtifacts || !gs.equippedArtifacts.includes(a.id));
                    else if (f === 'bound') filtered = artifacts.filter(a => a.bound);
                    else if (f === 'unbound') filtered = artifacts.filter(a => !a.bound);
                    return {
                        artifacts: filtered,
                        total: filtered.length,
                        totalPower: filtered.reduce((sum, a) => sum + a.power, 0),
                        byTier: {
                            common: filtered.filter(a => a.tier === 'common').length,
                            rare: filtered.filter(a => a.tier === 'rare').length,
                            epic: filtered.filter(a => a.tier === 'epic').length,
                            legendary: filtered.filter(a => a.tier === 'legendary').length
                        }
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpArtifactTransform(artifactId, targetTier) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const VALID_TIERS = ['common', 'rare', 'epic', 'legendary', 'mythic'];
                    if (!VALID_TIERS.includes(targetTier)) return { error: 'Invalid target tier' };
                    gs.artifacts = gs.artifacts || [];
                    const artifact = gs.artifacts.find(a => a.id === artifactId);
                    if (!artifact) return { error: 'Artifact not found' };
                    const TIER_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];
                    const currentIdx = TIER_ORDER.indexOf(artifact.tier);
                    const targetIdx = TIER_ORDER.indexOf(targetTier);
                    if (targetIdx <= currentIdx) return { error: 'Target tier must be higher than current tier' };
                    const TIER_TRANSFORM_COST = { rare: 5000, epic: 20000, legendary: 80000, mythic: 300000 };
                    const cost = TIER_TRANSFORM_COST[targetTier];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    gs.spiritStones -= cost;
                    const TIER_POWER = { common: 10, rare: 25, epic: 50, legendary: 100, mythic: 200 };
                    artifact.tier = targetTier;
                    artifact.power = TIER_POWER[targetTier];
                    artifact.attunement = 0;
                    return { success: true, artifactId, newTier: targetTier, newPower: artifact.power, cost };
                } catch(e) { return { error: e.message }; }
            }

            // V85: Pet Spirit Beast System
            mcpPetCapture(type, bait) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const VALID_TYPES = ['wolf', 'tiger', 'fox', 'dragon', 'phoenix', 'turtle'];
                    if (!VALID_TYPES.includes(type)) return { error: 'Invalid pet type' };
                    const BAIT_COST = { low: 50, medium: 150, high: 400, premium: 1000 };
                    const BAIT_SUCCESS = { low: 0.4, medium: 0.65, high: 0.85, premium: 0.95 };
                    const b = bait || 'medium';
                    const cost = BAIT_COST[b];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    const roll = Math.random();
                    const successRate = BAIT_SUCCESS[b];
                    if (roll > successRate) {
                        gs.spiritStones -= cost;
                        return { success: false, reason: 'Pet escaped', cost, remainingStones: gs.spiritStones };
                    }
                    gs.spiritStones -= cost;
                    gs.pets = gs.pets || [];
                    const petId = 'PET_' + Date.now();
                    const TIER_POWER = { wolf: 15, tiger: 20, fox: 12, dragon: 30, phoenix: 25, turtle: 10 };
                    const INTIMACY_THRESHOLDS = [0, 20, 40, 60, 80, 100];
                    const newPet = {
                        id: petId, type, name: type.charAt(0).toUpperCase() + type.slice(1),
                        form: 'child', level: 1, power: TIER_POWER[type] || 10,
                        intimacy: 0, hunger: 0, active: true, skills: [], equipped: null,
                        loyalty: 50, potential: Math.floor(Math.random() * 30) + 70,
                        captureCost: cost, capturedAt: Date.now()
                    };
                    gs.pets.push(newPet);
                    return { success: true, pet: newPet, cost, remainingStones: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetList(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pets = gs.pets || [];
                    const f = filter || 'all';
                    let filtered = pets;
                    if (f === 'active') filtered = pets.filter(p => p.active);
                    else if (f === 'released') filtered = pets.filter(p => !p.active);
                    return { pets: filtered, total: filtered.length };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetFeed(petId, food) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pets = gs.pets || [];
                    const pet = gs.pets.find(p => p.id === petId);
                    if (!pet) return { error: 'Pet not found' };
                    if (!pet.active) return { error: 'Pet has been released' };
                    const FOOD_INTIMACY = { basic: 5, premium: 15, super: 30 };
                    const FOOD_COST = { basic: 20, premium: 80, super: 200 };
                    const f = food || 'basic';
                    const cost = FOOD_COST[f];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    gs.spiritStones -= cost;
                    pet.hunger = Math.max(0, pet.hunger - 20);
                    pet.intimacy = Math.min(100, pet.intimacy + FOOD_INTIMACY[f]);
                    pet.loyalty = Math.min(100, pet.loyalty + 2);
                    return { success: true, petId: pet.id, intimacy: pet.intimacy, loyalty: pet.loyalty, hunger: pet.hunger, cost };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetEvolve(petId, targetForm) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pets = gs.pets || [];
                    const pet = gs.pets.find(p => p.id === petId);
                    if (!pet) return { error: 'Pet not found' };
                    if (!pet.active) return { error: 'Pet has been released' };
                    const VALID_FORMS = ['adult', 'mutant', 'divine'];
                    if (!VALID_FORMS.includes(targetForm)) return { error: 'Invalid target form' };
                    const FORM_ORDER = ['child', 'adult', 'mutant', 'divine'];
                    const currentIdx = FORM_ORDER.indexOf(pet.form);
                    const targetIdx = FORM_ORDER.indexOf(targetForm);
                    if (targetIdx <= currentIdx) return { error: 'Target form must be higher than current' };
                    const INTIMACY_REQUIRED = { adult: 30, mutant: 60, divine: 90 };
                    if (pet.intimacy < INTIMACY_REQUIRED[targetForm]) return { error: `Intimacy ${pet.intimacy} below required ${INTIMACY_REQUIRED[targetForm]} for ${targetForm}` };
                    const EVO_COST = { adult: 500, mutant: 2000, divine: 8000 };
                    const cost = EVO_COST[targetForm];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    gs.spiritStones -= cost;
                    pet.form = targetForm;
                    pet.power = Math.round(pet.power * (1 + (targetIdx - currentIdx) * 0.3));
                    pet.level = Math.min(99, pet.level + 5);
                    return { success: true, petId: pet.id, newForm: pet.form, newPower: pet.power, newLevel: pet.level, cost };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetRelease(petId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pets = gs.pets || [];
                    const pet = gs.pets.find(p => p.id === petId);
                    if (!pet) return { error: 'Pet not found' };
                    if (!pet.active) return { error: 'Pet already released' };
                    pet.active = false;
                    pet.releasedAt = Date.now();
                    return { success: true, petId, status: 'released' };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetStats(petId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pets = gs.pets || [];
                    if (petId) {
                        const pet = pets.find(p => p.id === petId);
                        if (!pet) return { error: 'Pet not found' };
                        return { pet, active: pets.filter(p => p.active).length, total: pets.length };
                    }
                    return {
                        pets: pets.filter(p => p.active),
                        total: pets.length,
                        activeCount: pets.filter(p => p.active).length,
                        releasedCount: pets.filter(p => !p.active).length,
                        byType: {
                            wolf: pets.filter(p => p.type === 'wolf').length,
                            tiger: pets.filter(p => p.type === 'tiger').length,
                            fox: pets.filter(p => p.type === 'fox').length,
                            dragon: pets.filter(p => p.type === 'dragon').length,
                            phoenix: pets.filter(p => p.type === 'phoenix').length,
                            turtle: pets.filter(p => p.type === 'turtle').length
                        }
                    };
                } catch(e) { return { error: e.message }; }
            }

            // V86: Alchemy System
            mcpAlchemyListFormulas(tier) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const FORMULAS = [
                        { id: 'qi_pill_basic', name: '灵气丹(初)', tier: 'basic', effect: { cultivationXP: 50 }, learnCost: 0 },
                        { id: 'strength_pill_basic', name: '力量丹(初)', tier: 'basic', effect: { strength: 5 }, learnCost: 0 },
                        { id: 'spirit_pill_basic', name: '灵力丹(初)', tier: 'basic', effect: { maxSpirit: 20 }, learnCost: 0 },
                        { id: 'qi_pill_intermediate', name: '灵气丹(中)', tier: 'intermediate', effect: { cultivationXP: 200 }, learnCost: 200 },
                        { id: 'strength_pill_intermediate', name: '力量丹(中)', tier: 'intermediate', effect: { strength: 20 }, learnCost: 200 },
                        { id: 'spirit_pill_intermediate', name: '灵力丹(中)', tier: 'intermediate', effect: { maxSpirit: 80 }, learnCost: 200 },
                        { id: 'qi_pill_advanced', name: '灵气丹(高)', tier: 'advanced', effect: { cultivationXP: 800 }, learnCost: 800 },
                        { id: 'strength_pill_advanced', name: '力量丹(高)', tier: 'advanced', effect: { strength: 60 }, learnCost: 800 },
                        { id: 'spirit_pill_advanced', name: '灵力丹(高)', tier: 'advanced', effect: { maxSpirit: 200 }, learnCost: 800 },
                        { id: 'qi_pill_rare', name: '灵气丹(极)', tier: 'rare', effect: { cultivationXP: 3000 }, learnCost: 3000 },
                        { id: 'strength_pill_rare', name: '力量丹(极)', tier: 'rare', effect: { strength: 150 }, learnCost: 3000 },
                        { id: 'spirit_pill_rare', name: '灵力丹(极)', tier: 'rare', effect: { maxSpirit: 500 }, learnCost: 3000 }
                    ];
                    gs.learnedFormulas = gs.learnedFormulas || [];
                    const f = tier || 'all';
                    let filtered = FORMULAS;
                    if (f !== 'all') filtered = FORMULAS.filter(formula => formula.tier === f);
                    return { formulas: filtered, total: filtered.length, learnedCount: gs.learnedFormulas.length };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyCollectHerbs(location, quality) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const VALID_LOCATIONS = ['forest', 'mountain', 'cave', 'swamp'];
                    if (!VALID_LOCATIONS.includes(location)) return { error: 'Invalid location' };
                    const QUALITY_COST = { low: 30, medium: 100, high: 300, premium: 800 };
                    const QUALITY_YIELD = { low: 1, medium: 2, high: 3, premium: 5 };
                    const q = quality || 'medium';
                    const cost = QUALITY_COST[q];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    gs.spiritStones -= cost;
                    gs.herbSlots = gs.herbSlots || { slot1: null, slot2: null, slot3: null };
                    const herbId = 'HERB_' + Date.now();
                    const HERB_POWER = { forest: 8, mountain: 12, cave: 15, swamp: 10 };
                    const herb = { id: herbId, location, quality: q, power: HERB_POWER[location] * QUALITY_YIELD[q], slot: null };
                    let placed = false;
                    for (const slot of ['slot1', 'slot2', 'slot3']) {
                        if (!gs.herbSlots[slot]) { gs.herbSlots[slot] = herb; herb.slot = slot; placed = true; break; }
                    }
                    if (!placed) return { success: false, reason: 'No herb slot available', cost, remainingStones: gs.spiritStones };
                    return { success: true, herb, cost, remainingStones: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyRefine(formulaId, herbSlot) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.herbSlots = gs.herbSlots || { slot1: null, slot2: null, slot3: null };
                    if (!gs.herbSlots[herbSlot]) return { error: 'Herb slot is empty' };
                    gs.learnedFormulas = gs.learnedFormulas || [];
                    if (!gs.learnedFormulas.includes(formulaId)) {
                        const FORMULA_LEARN_COST = { basic: 0, intermediate: 200, advanced: 800, rare: 3000 };
                        const allFormulas = [
                            { id: 'qi_pill_basic', tier: 'basic' }, { id: 'strength_pill_basic', tier: 'basic' }, { id: 'spirit_pill_basic', tier: 'basic' },
                            { id: 'qi_pill_intermediate', tier: 'intermediate' }, { id: 'strength_pill_intermediate', tier: 'intermediate' }, { id: 'spirit_pill_intermediate', tier: 'intermediate' },
                            { id: 'qi_pill_advanced', tier: 'advanced' }, { id: 'strength_pill_advanced', tier: 'advanced' }, { id: 'spirit_pill_advanced', tier: 'advanced' },
                            { id: 'qi_pill_rare', tier: 'rare' }, { id: 'strength_pill_rare', tier: 'rare' }, { id: 'spirit_pill_rare', tier: 'rare' }
                        ];
                        const formula = allFormulas.find(f => f.id === formulaId);
                        if (!formula) return { error: 'Unknown formula ID' };
                        const learnCost = FORMULA_LEARN_COST[formula.tier];
                        if (gs.spiritStones < learnCost) return { error: 'Not enough spirit stones to learn formula', required: learnCost };
                        gs.spiritStones -= learnCost;
                        gs.learnedFormulas.push(formulaId);
                    }
                    gs.pills = gs.pills || [];
                    const herb = gs.herbSlots[herbSlot];
                    gs.herbSlots[herbSlot] = null;
                    const basePower = herb ? herb.power : 5;
                    const craftSkill = gs.craftingSkill || 1;
                    const successRate = Math.min(0.95, 0.5 + craftSkill * 0.05);
                    const roll = Math.random();
                    if (roll > successRate) return { success: false, reason: 'Refinement failed', herbUsed: !!herb, cost: 0 };
                    const pillId = 'PILL_' + Date.now();
                    const qualityRoll = Math.random();
                    const pillQuality = qualityRoll > 0.9 ? 'high' : qualityRoll > 0.7 ? 'medium' : 'low';
                    const QUALITY_MULT = { low: 1.0, medium: 1.3, high: 1.8 };
                    const allFormulas = [
                        { id: 'qi_pill_basic', name: '灵气丹(初)', effect: { cultivationXP: 50 } },
                        { id: 'strength_pill_basic', name: '力量丹(初)', effect: { strength: 5 } },
                        { id: 'spirit_pill_basic', name: '灵力丹(初)', effect: { maxSpirit: 20 } },
                        { id: 'qi_pill_intermediate', name: '灵气丹(中)', effect: { cultivationXP: 200 } },
                        { id: 'strength_pill_intermediate', name: '力量丹(中)', effect: { strength: 20 } },
                        { id: 'spirit_pill_intermediate', name: '灵力丹(中)', effect: { maxSpirit: 80 } },
                        { id: 'qi_pill_advanced', name: '灵气丹(高)', effect: { cultivationXP: 800 } },
                        { id: 'strength_pill_advanced', name: '力量丹(高)', effect: { strength: 60 } },
                        { id: 'spirit_pill_advanced', name: '灵力丹(高)', effect: { maxSpirit: 200 } },
                        { id: 'qi_pill_rare', name: '灵气丹(极)', effect: { cultivationXP: 3000 } },
                        { id: 'strength_pill_rare', name: '力量丹(极)', effect: { strength: 150 } },
                        { id: 'spirit_pill_rare', name: '灵力丹(极)', effect: { maxSpirit: 500 } }
                    ];
                    const formula = allFormulas.find(frm => frm.id === formulaId);
                    const pill = {
                        id: pillId, formulaId, name: formula ? formula.name : formulaId,
                        quality: pillQuality, power: Math.round(basePower * QUALITY_MULT[pillQuality]),
                        effect: formula ? formula.effect : { cultivationXP: 50 }, consumed: false, createdAt: Date.now()
                    };
                    gs.pills.push(pill);
                    return { success: true, pill, successRate: Math.round(successRate * 100) + '%' };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyConsume(pillId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pills = gs.pills || [];
                    const pill = gs.pills.find(p => p.id === pillId);
                    if (!pill) return { error: 'Pill not found' };
                    if (pill.consumed) return { error: 'Pill already consumed' };
                    pill.consumed = true;
                    pill.consumedAt = Date.now();
                    if (pill.effect.cultivationXP) gs.cultivationXP = (gs.cultivationXP || 0) + pill.effect.cultivationXP;
                    if (pill.effect.strength) gs.strength = (gs.strength || 0) + pill.effect.strength;
                    if (pill.effect.maxSpirit) gs.maxSpirit = (gs.maxSpirit || 0) + pill.effect.maxSpirit;
                    return { success: true, pillId, effect: pill.effect, cultivationXP: gs.cultivationXP };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyPillStats(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pills = gs.pills || [];
                    const f = filter || 'all';
                    let pills = gs.pills;
                    if (f === 'consumed') pills = gs.pills.filter(p => p.consumed);
                    else if (f === 'inventory') pills = gs.pills.filter(p => !p.consumed);
                    return { pills, total: pills.length, byQuality: { low: pills.filter(p => p.quality === 'low').length, medium: pills.filter(p => p.quality === 'medium').length, high: pills.filter(p => p.quality === 'high').length } };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyForgetFormula(formulaId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.learnedFormulas = gs.learnedFormulas || [];
                    const idx = gs.learnedFormulas.indexOf(formulaId);
                    if (idx === -1) return { error: 'Formula not learned' };
                    gs.learnedFormulas.splice(idx, 1);
                    return { success: true, formulaId, remainingFormulas: gs.learnedFormulas.length };
                } catch(e) { return { error: e.message }; }
            }

            // V87: Economy and Karma System
            mcpEconomyIncomeStats(period) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.economyLog = gs.economyLog || [];
                    const now = Date.now();
                    const PERIOD_MS = { day: 86400000, week: 604800000, month: 2592000000, all: Infinity };
                    const ms = PERIOD_MS[period] || PERIOD_MS['all'];
                    const since = now - ms;
                    const incomeEntries = gs.economyLog.filter(e => e.type === 'income' && e.time > since);
                    const total = incomeEntries.reduce((s, e) => s + (e.amount || 0), 0);
                    return { period, totalIncome: total, count: incomeEntries.length, entries: incomeEntries.slice(-20) };
                } catch(e) { return { error: e.message }; }
            }

            mcpEconomyExpenseStats(period) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.economyLog = gs.economyLog || [];
                    const now = Date.now();
                    const PERIOD_MS = { day: 86400000, week: 604800000, month: 2592000000, all: Infinity };
                    const ms = PERIOD_MS[period] || PERIOD_MS['all'];
                    const since = now - ms;
                    const expenseEntries = gs.economyLog.filter(e => e.type === 'expense' && e.time > since);
                    const total = expenseEntries.reduce((s, e) => s + (e.amount || 0), 0);
                    return { period, totalExpense: total, count: expenseEntries.length, entries: expenseEntries.slice(-20) };
                } catch(e) { return { error: e.message }; }
            }

            mcpEconomyTransfer(targetName, amount) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!targetName || amount <= 0) return { error: 'Invalid target or amount' };
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < amount) return { error: 'Not enough spirit stones', required: amount, available: gs.spiritStones };
                    gs.spiritStones -= amount;
                    gs.economyLog = gs.economyLog || [];
                    gs.economyLog.push({ type: 'expense', category: 'transfer', amount, target: targetName, time: Date.now() });
                    return { success: true, amount, target: targetName, remainingStones: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpRealmTribute(amount) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!amount || amount <= 0) return { error: 'Invalid tribute amount' };
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < amount) return { error: 'Not enough spirit stones', required: amount, available: gs.spiritStones };
                    gs.spiritStones -= amount;
                    gs.realmTributeTotal = (gs.realmTributeTotal || 0) + amount;
                    gs.economyLog = gs.economyLog || [];
                    gs.economyLog.push({ type: 'expense', category: 'tribute', amount, time: Date.now() });
                    // Tribute buffs scale with amount
                    const BUFF_MULT = 0.001;
                    const buffPower = amount * BUFF_MULT;
                    gs.realmTributeBuff = (gs.realmTributeBuff || 0) + buffPower;
                    return { success: true, amount, tributeTotal: gs.realmTributeTotal, buffPower: Math.round(buffPower * 100) / 100 };
                } catch(e) { return { error: e.message }; }
            }

            mcpHeavenlyBlessing(type) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const karma = gs.karmaPoints || 0;
                    if (karma < 100) return { error: 'Insufficient karma points (need 100)', current: karma };
                    const BLESSING_COST = { cultivation: 100, combat: 150, luck: 200, realm: 300 };
                    const cost = BLESSING_COST[type] || 100;
                    if (karma < cost) return { error: `Not enough karma for ${type} blessing (need ${cost})`, current: karma };
                    gs.karmaPoints -= cost;
                    const BLESSING_EFFECTS = {
                        cultivation: { cultivationSpeed: 1.2, expBonus: 0.1 },
                        combat: { attackBonus: 0.15, defenseBonus: 0.1 },
                        luck: { dropRateBonus: 0.2, serendipityChance: 0.1 },
                        realm: { breakthroughBonus: 0.15, tribulationResistance: 0.1 }
                    };
                    const effect = BLESSING_EFFECTS[type] || BLESSING_EFFECTS.cultivation;
                    gs.heavenlyBlessingActive = gs.heavenlyBlessingActive || {};
                    gs.heavenlyBlessingActive[type] = { effect, expiresAt: Date.now() + 3600000, cost };
                    return { success: true, type, cost, effect, expiresIn: '1 hour' };
                } catch(e) { return { error: e.message }; }
            }

            mcpKarmaPointQuery(limit) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const karma = gs.karmaPoints || 0;
                    const history = (gs.karmaHistory || []).slice(-(limit || 20));
                    return { currentKarma: karma, totalEvents: (gs.karmaHistory || []).length, history };
                } catch(e) { return { error: e.message }; }
            }

            // V88: Celestial Market and Serendipity
            mcpCelestialMarketList(category) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.celestialMarket = gs.celestialMarket || [];
                    const VALID_CATS = ['pills', 'artifacts', 'techniques', 'materials', 'all'];
                    const cat = category || 'all';
                    if (!VALID_CATS.includes(cat)) return { error: 'Invalid category' };
                    const items = cat === 'all' ? gs.celestialMarket : gs.celestialMarket.filter(i => i.category === cat);
                    return { items, total: items.length, category: cat };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialMarketBuy(itemId, quantity) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.celestialMarket = gs.celestialMarket || [];
                    const item = gs.celestialMarket.find(i => i.id === itemId);
                    if (!item) return { error: 'Item not found in market' };
                    const qty = quantity || 1;
                    const totalCost = item.price * qty;
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < totalCost) return { error: 'Not enough spirit stones', required: totalCost, available: gs.spiritStones };
                    gs.spiritStones -= totalCost;
                    gs.inventory = gs.inventory || [];
                    for (let i = 0; i < qty; i++) gs.inventory.push({ ...item, id: item.id + '_' + Date.now() + i });
                    gs.economyLog = gs.economyLog || [];
                    gs.economyLog.push({ type: 'expense', category: 'market_buy', amount: totalCost, itemId, time: Date.now() });
                    return { success: true, item: item.name, quantity: qty, totalCost, remainingStones: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialMarketSell(itemId, price) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.inventory = gs.inventory || [];
                    const idx = gs.inventory.findIndex(i => i.id === itemId);
                    if (idx === -1) return { error: 'Item not found in inventory' };
                    if (!price || price <= 0) return { error: 'Invalid price' };
                    const item = gs.inventory[idx];
                    gs.inventory.splice(idx, 1);
                    gs.celestialMarket = gs.celestialMarket || [];
                    gs.celestialMarket.push({ id: 'MKT_' + Date.now(), name: item.name, category: item.category || 'materials', price, seller: gs.name || 'Player', listedAt: Date.now() });
                    return { success: true, item: item.name, price, marketFee: Math.round(price * 0.05) };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialMarketSearch(keyword) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.celestialMarket = gs.celestialMarket || [];
                    const kw = (keyword || '').toLowerCase();
                    const results = gs.celestialMarket.filter(i => (i.name || '').toLowerCase().includes(kw));
                    return { results, count: results.length, keyword };
                } catch(e) { return { error: e.message }; }
            }

            mcpSerendipityTrigger(type) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const TYPES = ['treasure', 'encounter', 'blessing', 'danger', 'all'];
                    const t = type || 'all';
                    const SERENDIPITY_POOL = [
                        { type: 'treasure', name: '发现古修士洞府', karma: 10, reward: { spiritStones: 500 } },
                        { type: 'encounter', name: '遇见散仙论道', karma: 15, reward: { cultivationXP: 200 } },
                        { type: 'blessing', name: '天降祥瑞', karma: 20, reward: { maxSpirit: 50 } },
                        { type: 'danger', name: '遭遇妖兽袭击', karma: -10, reward: { combatXP: 100 } }
                    ];
                    const pool = t === 'all' ? SERENDIPITY_POOL : SERENDIPITY_POOL.filter(e => e.type === t);
                    if (pool.length === 0) return { error: 'No serendipity events of this type' };
                    const event = pool[Math.floor(Math.random() * pool.length)];
                    const eventId = 'SER_' + Date.now();
                    gs.karmaPoints = (gs.karmaPoints || 0) + event.karma;
                    gs.karmaHistory = gs.karmaHistory || [];
                    gs.karmaHistory.push({ eventId, type: event.type, karma: event.karma, reason: event.name, time: Date.now() });
                    return { eventId, type: event.type, name: event.name, karmaDelta: event.karma, reward: event.reward };
                } catch(e) { return { error: e.message }; }
            }

            mcpSerendipityKarmaUpdate(eventId, karmaDelta, reason) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (karmaDelta === undefined) return { error: 'karmaDelta required' };
                    gs.karmaPoints = (gs.karmaPoints || 0) + (karmaDelta || 0);
                    gs.karmaHistory = gs.karmaHistory || [];
                    gs.karmaHistory.push({ eventId, karma: karmaDelta, reason: reason || 'serendipity', time: Date.now() });
                    return { success: true, eventId, newKarma: gs.karmaPoints, karmaDelta };
                } catch(e) { return { error: e.message }; }
            }

            // V89: Arena Leaderboard and Ladder
            mcpArenaLeaderboard(season, limit) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const seasonId = season || gs.currentSeason || 'S1';
                    const max = limit || 10;
                    const leaderboard = gs.arenaLeaderboard || [];
                    const top = leaderboard.slice(0, max).map((e, i) => ({
                        rank: i + 1, playerId: e.playerId, name: e.name || '修士', rating: e.rating || 1500, wins: e.wins || 0
                    }));
                    return { season: seasonId, leaderboard: top, total: leaderboard.length };
                } catch(e) { return { error: e.message }; }
            }

            mcpArenaMatchHistory(playerId, season, limit) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pid = playerId || gs.playerId || gs.name || 'Player';
                    const seasonId = season || gs.currentSeason || 'S1';
                    const max = limit || 20;
                    const history = gs.arenaMatchHistory || [];
                    const filtered = history.filter(m => m.playerId === pid && m.season === seasonId);
                    return { playerId: pid, season: seasonId, matches: filtered.slice(-max), total: filtered.length };
                } catch(e) { return { error: e.message }; }
            }

            mcpSectWarReport(reportId, sectId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const sid = sectId || (gs.sect && gs.sect.id) || 'SECT_001';
                    const reports = gs.sectWarReports || [];
                    const report = reports.find(r => r.id === reportId && (r.sectId === sid || !reportId));
                    if (!report) return { error: 'War report not found', reportId, sectId: sid };
                    return { reportId: report.id, sectId: report.sectId, date: report.date, outcome: report.outcome, details: report.details };
                } catch(e) { return { error: e.message }; }
            }

            mcpSectBattleStats(sectId, statType) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const sid = sectId || (gs.sect && gs.sect.id) || 'SECT_001';
                    const stats = gs.sectBattleStats || {};
                    const sectStats = stats[sid] || { wins: 0, losses: 0, draws: 0 };
                    if (statType && statType !== 'all') return { [statType]: sectStats[statType] || 0 };
                    return { sectId: sid, ...sectStats };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialLadderRank(playerId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pid = playerId || gs.playerId || gs.name || 'Player';
                    const ladder = gs.celestialLadder || [];
                    const entry = ladder.find(e => e.playerId === pid);
                    if (!entry) return { playerId: pid, rank: 0, rating: 1500, message: 'Not on ladder' };
                    return { playerId: pid, rank: entry.rank || 0, rating: entry.rating || 1500, wins: entry.wins || 0, losses: entry.losses || 0 };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialLadderFight(targetPlayerId, stake) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const target = targetPlayerId || 'RIVAL_001';
                    const stakeAmount = stake || 100;
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < stakeAmount) return { error: 'Not enough spirit stones for stake', required: stakeAmount, available: gs.spiritStones };
                    const myRating = 1500;
                    const targetEntry = gs.celestialLadder ? gs.celestialLadder.find(e => e.playerId === target) : null;
                    const targetRating = targetEntry ? targetEntry.rating : 1500;
                    const myChance = 1 / (1 + Math.pow(10, (targetRating - myRating) / 400));
                    const roll = Math.random();
                    const won = roll < myChance;
                    gs.spiritStones = won ? gs.spiritStones + stakeAmount : gs.spiritStones - stakeAmount;
                    const ratingDelta = Math.round(20 * (won ? 1 - myChance : myChance));
                    return {
                        success: true, won, ratingDelta, newRating: myRating + ratingDelta,
                        opponent: target, stake: stakeAmount, newBalance: gs.spiritStones,
                        message: won ? `挑战成功！rating +${ratingDelta}` : `挑战失败，损失${stakeAmount}灵石`
                    };
                } catch(e) { return { error: e.message }; }
            }
