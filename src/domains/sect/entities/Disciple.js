/**
 * Disciple Entity - 弟子实体
 * disciple data structure and related functions
 */

/**
 * Create a new disciple
 */
function createDisciple(name, realm, talentIndex = 1) {
    const uid = 'd_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    return {
        uid: uid,
        name: name,
        realm: realm,
        talent: SECT_CONFIG.talents[talentIndex],
        talentIndex: talentIndex,
        contribution: 0,
        techniques: [],
        status: 'idle',
        // NPC autonomous system fields
        npcRole: 'disciple',
        npcDialogueHistory: [],
        npcMood: 'normal',
        npcAffection: 50,
        npcTask: null,
        npcTaskDays: 0,
        // NPC apprenticeship fields
        npcMasterId: null,
        npcApprentices: [],
        npcGiftLiked: null,
        // NPC personality
        npcPersonality: null,
        // NPC self-evolution memory
        npcMemory: initNpcMemory(),
        // Dispatch status
        dispatched: false,
        dispatchedTo: null,
        // Combat stats
        attack: 5,
        defense: 3,
        maxHp: 30
    };
}

/**
 * NPC roles configuration
 */
const NPC_ROLES = {
    leader: { title: '掌门', icon: '👑', taskType: 'lead', color: '#FFD700', minApprenticeAffection: 60 },
    elder: { title: '长老', icon: '👴', taskType: 'train', color: '#9c27b0', minApprenticeAffection: 50 },
    disciple: { title: '弟子', icon: '🧑‍🎓', taskType: 'collect', color: '#4CAF50', minApprenticeAffection: 40 }
};

/**
 * NPC personality configuration
 */
const NPC_PERSONALITIES = {
    diligent: { label: '勤奋', emoji: '📖', color: '#4CAF50', taskPref: 'train', efficiency: 1.3 },
    lazy: { label: '懒散', emoji: '😴', color: '#9e9e9e', taskPref: 'collect', efficiency: 0.7 },
    aggressive: { label: '好斗', emoji: '⚔️', color: '#f44336', taskPref: 'combat', efficiency: 1.1 },
    steady: { label: '稳重', emoji: '🧘', color: '#2196F3', taskPref: 'train', efficiency: 1.0 }
};

/**
 * NPC gift configuration
 */
const NPC_GIFTS = {
    low: { name: '灵石袋', cost: 50, affection: 5 },
    mid: { name: '灵草', cost: 200, affection: 15 },
    high: { name: '功法残卷', cost: 500, affection: 30 }
};

/**
 * NPC skill crystals (skill from experience)
 */
const NPC_SKILL_CRYSTALS = {
    combat_master: { name: '战斗精通', desc: '战斗中磨砺出的本能反应', icon: '⚔️', threshold: 10 },
    resource_sense: { name: '资源敏锐', desc: '对灵石和资源的高度敏感', icon: '💎', threshold: 8 },
    social_network: { name: '社交高手', desc: '与同门建立深厚关系网', icon: '🤝', threshold: 12 },
    wisdom_eye: { name: '慧眼', desc: '能洞察事物本质', icon: '👁️', threshold: 15 },
    cultivation_talent: { name: '修炼天赋', desc: '对灵气运行的天赋', icon: '🧘', threshold: 10 },
    leadership_aura: { name: '领袖气质', desc: '引领他人的感召力', icon: '👑', threshold: 20 }
};

/**
 * NPC memory layers (L0-L4)
 */
const NPC_MEMORY_LAYERS = {
    L0_episodic: { label: '情景记忆', desc: '单次事件记录', decay: 0.95 },
    L1_shortTerm: { label: '短时记忆', desc: '近期经验汇总', decay: 0.9 },
    L2_longTerm: { label: '长时记忆', desc: '重要经历固化', decay: 0.7 },
    L3_semantic: { label: '语义记忆', desc: '知识与技能', decay: 0.0 },
    L4_epic: { label: '史诗记忆', desc: '里程碑事件', decay: 0.0 }
};

/**
 * Initialize NPC memory
 */
function initNpcMemory() {
    return {
        L0_episodic: [],
        L1_shortTerm: { totalTasks: 0, completedTasks: 0, totalBattles: 0, wins: 0, giftsGiven: 0, interactions: 0 },
        L2_longTerm: [],
        L3_semantic: { skills: [], insights: [] },
        L4_epic: [],
        evolutionPoints: 0,
        evolutionLevel: 1,
        lastEvolved: 0
    };
}

/**
 * Get disciple info for display
 */
function getDiscipleInfo(disciple) {
    return {
        uid: disciple.uid,
        name: disciple.name,
        talent: disciple.talent || '普通',
        realm: disciple.realm || 0,
        status: disciple.status || 'idle',
        contribution: disciple.contribution || 0,
        efficiency: disciple.efficiency || 1.0,
        npcRole: disciple.npcRole || 'disciple',
        npcMood: disciple.npcMood || 'normal',
        npcAffection: disciple.npcAffection || 50
    };
}

/**
 * Get personality info
 */
function getPersonalityInfo(p) {
    return NPC_PERSONALITIES[p] || NPC_PERSONALITIES.steady;
}

/**
 * Get NPC role icon
 */
function getNpcRoleIcon(d) {
    const role = d.npcRole || 'disciple';
    return NPC_ROLES[role] ? NPC_ROLES[role].icon : NPC_ROLES.disciple.icon;
}

/**
 * Get NPC role title
 */
function getNpcRoleTitle(d) {
    const role = d.npcRole || 'disciple';
    return NPC_ROLES[role] ? NPC_ROLES[role].title : '弟子';
}

/**
 * Record NPC memory event
 */
function recordNpcMemory(npcUid, eventType, eventData) {
    const sect = gameState.sect;
    const npc = sect.disciples.find(d => d.uid === npcUid);
    if (!npc || !npc.npcMemory) return;

    const mem = npc.npcMemory;
    const timestamp = gameState.days;

    mem.L0_episodic.push({
        type: eventType,
        data: eventData,
        day: timestamp,
        mood: npc.npcMood
    });
    if (mem.L0_episodic.length > 20) mem.L0_episodic.shift();

    if (eventType === 'task_complete') {
        mem.L1_shortTerm.totalTasks++;
        mem.L1_shortTerm.completedTasks++;
    } else if (eventType === 'battle') {
        mem.L1_shortTerm.totalBattles++;
        if (eventData.won) mem.L1_shortTerm.wins++;
    } else if (eventType === 'gift') {
        mem.L1_shortTerm.giftsGiven++;
    } else if (eventType === 'interaction') {
        mem.L1_shortTerm.interactions++;
    }

    if (mem.L1_shortTerm.completedTasks >= 5 && mem.L2_longTerm.filter(e => e.type === 'task_master').length === 0) {
        mem.L2_longTerm.push({ type: 'task_master', day: timestamp, desc: '完成任务5次以上' });
    }
    if (mem.L1_shortTerm.wins >= 3 && mem.L2_longTerm.filter(e => e.type === 'combat_hero').length === 0) {
        mem.L2_longTerm.push({ type: 'combat_hero', day: timestamp, desc: '战斗胜利3次以上' });
    }
    if (mem.L2_longTerm.length > 10) mem.L2_longTerm.shift();

    checkNpcSkillCrystallization(npc);

    if (eventType === 'task_complete' && mem.L1_shortTerm.completedTasks === 10 && !mem.L4_epic.find(e => e.type === 'task_master_10')) {
        mem.L4_epic.push({ type: 'task_master_10', day: timestamp, desc: '完成10项任务' });
    }
    if (eventType === 'battle' && mem.L1_shortTerm.wins === 5 && !mem.L4_epic.find(e => e.type === 'combat_hero_5')) {
        mem.L4_epic.push({ type: 'combat_hero_5', day: timestamp, desc: '战斗5连胜' });
    }
    if (mem.L4_epic.length > 5) mem.L4_epic.shift();

    const pointsMap = { task_complete: 2, battle: 3, gift: 1, interaction: 1, evolution: 10 };
    mem.evolutionPoints += pointsMap[eventType] || 1;

    checkNpcEvolution(npc);
}

/**
 * Check NPC skill crystallization
 */
function checkNpcSkillCrystallization(npc) {
    if (!npc || !npc.npcMemory) return;
    const mem = npc.npcMemory;
    const skills = mem.L3_semantic.skills;

    if (mem.L1_shortTerm.totalBattles >= NPC_SKILL_CRYSTALS.combat_master.threshold && !skills.find(s => s.id === 'combat_master')) {
        skills.push({ id: 'combat_master', ...NPC_SKILL_CRYSTALS.combat_master, crystallizedDay: gameState.days });
        npc.attack = Math.floor((npc.attack || 5) * 1.2);
        addLog('good', '技能结晶', `${npc.name}领悟了【${NPC_SKILL_CRYSTALS.combat_master.name}】！攻击力+20%`);
    }
    if (mem.L1_shortTerm.totalTasks >= NPC_SKILL_CRYSTALS.resource_sense.threshold && !skills.find(s => s.id === 'resource_sense')) {
        skills.push({ id: 'resource_sense', ...NPC_SKILL_CRYSTALS.resource_sense, crystallizedDay: gameState.days });
    }
    if (mem.L1_shortTerm.giftsGiven >= NPC_SKILL_CRYSTALS.social_network.threshold && !skills.find(s => s.id === 'social_network')) {
        skills.push({ id: 'social_network', ...NPC_SKILL_CRYSTALS.social_network, crystallizedDay: gameState.days });
        npc.npcAffection = Math.min(100, npc.npcAffection + 20);
        addLog('good', '技能结晶', `${npc.name}领悟了【${NPC_SKILL_CRYSTALS.social_network.name}】！好感度+20`);
    }
    if (mem.L1_shortTerm.interactions >= NPC_SKILL_CRYSTALS.wisdom_eye.threshold && !skills.find(s => s.id === 'wisdom_eye')) {
        skills.push({ id: 'wisdom_eye', ...NPC_SKILL_CRYSTALS.wisdom_eye, crystallizedDay: gameState.days });
        skills.push({ id: 'insight', name: '洞察', desc: '能感知隐藏机会', icon: '🔮', crystallizedDay: gameState.days });
    }
}

/**
 * Check NPC evolution
 */
function checkNpcEvolution(npc) {
    if (!npc || !npc.npcMemory) return;
    const mem = npc.npcMemory;
    const levelThresholds = [0, 20, 50, 100, 200];

    if (mem.evolutionLevel < 5) {
        const nextLevel = mem.evolutionLevel + 1;
        if (mem.evolutionPoints >= levelThresholds[nextLevel]) {
            mem.evolutionLevel = nextLevel;
            mem.lastEvolved = gameState.days;
            npc.attack = Math.floor((npc.attack || 5) * 1.15);
            npc.defense = Math.floor((npc.defense || 3) * 1.15);
            npc.maxHp = Math.floor((npc.maxHp || 30) * 1.15);
            addLog('good', 'NPC进化', `${npc.name}突破至Lv.${nextLevel}！基础属性+15%`);
        }
    }
}

/**
 * NPC autonomous decision
 */
function npcAutonomousDecision(npc) {
    if (!npc || !npc.npcMemory) return null;
    const mem = npc.npcMemory;
    const personality = NPC_PERSONALITIES[npc.personality] || NPC_PERSONALITIES.steady;
    const rand = Math.random();

    const hasCombatSkill = mem.L3_semantic.skills.find(s => s.id === 'combat_master');
    const hasSocialSkill = mem.L3_semantic.skills.find(s => s.id === 'social_network');

    if (rand < personality.efficiency) {
        if (personality.taskPref === 'train') {
            return { action: 'cultivate', reason: '性格勤奋，选择修炼' };
        } else if (personality.taskPref === 'combat') {
            if (hasCombatSkill && rand < 0.5) {
                return { action: 'challenge', reason: '战斗精通，挑战强敌' };
            }
            return { action: 'combat', reason: '好斗性格，选择战斗' };
        } else {
            return { action: 'collect', reason: '性格务实，选择采集' };
        }
    } else if (rand < 0.7) {
        if (hasSocialSkill && rand < 0.4) {
            return { action: 'socialize', reason: '社交高手，与人交流' };
        }
        return { action: 'rest', reason: '稍作休息' };
    } else {
        const actions = ['explore', 'meditate', 'help'];
        return { action: actions[Math.floor(Math.random() * actions.length)], reason: '自主探索' };
    }
}

/**
 * Get NPC memory display HTML
 */
function getNpcMemoryDisplay(npc) {
    if (!npc || !npc.npcMemory) return '';
    const mem = npc.npcMemory;
    let html = '<div class="npc-memory-panel">';
    html += `<div class="npc-memory-title">🧠 ${npc.name}的记忆 (Lv.${mem.evolutionLevel})</div>`;

    if (mem.L4_epic.length > 0) {
        html += '<div class="npc-mem-layer">';
        html += `<span class="mem-label">📜 史诗记忆</span>`;
        mem.L4_epic.forEach(e => {
            html += `<div class="mem-item epic">第${e.day}天：${e.desc}</div>`;
        });
        html += '</div>';
    }

    if (mem.L3_semantic.skills.length > 0) {
        html += '<div class="npc-mem-layer">';
        html += `<span class="mem-label">⚡ 技能结晶</span>`;
        mem.L3_semantic.skills.forEach(s => {
            html += `<span class="skill-tag" title="${s.desc}">${s.icon||'✨'} ${s.name}</span>`;
        });
        html += '</div>';
    }

    if (mem.L2_longTerm.length > 0) {
        html += '<div class="npc-mem-layer">';
        html += `<span class="mem-label">💎 重要经历</span>`;
        mem.L2_longTerm.slice(-3).forEach(e => {
            html += `<div class="mem-item">${e.desc}</div>`;
        });
        html += '</div>';
    }

    html += '<div class="npc-mem-layer">';
    html += `<span class="mem-label">📊 近况</span>`;
    html += `<span>任务${mem.L1_shortTerm.completedTasks}/${mem.L1_shortTerm.totalTasks}</span> `;
    html += `<span>战斗${mem.L1_shortTerm.wins}/${mem.L1_shortTerm.totalBattles}</span> `;
    html += `<span>互动${mem.L1_shortTerm.interactions}</span>`;
    html += ` <span class="evo-points">进化点:${mem.evolutionPoints}</span>`;
    html += '</div>';

    html += '</div>';
    return html;
}

export {
    createDisciple,
    NPC_ROLES,
    NPC_PERSONALITIES,
    NPC_GIFTS,
    NPC_SKILL_CRYSTALS,
    NPC_MEMORY_LAYERS,
    initNpcMemory,
    getDiscipleInfo,
    getPersonalityInfo,
    getNpcRoleIcon,
    getNpcRoleTitle,
    recordNpcMemory,
    checkNpcSkillCrystallization,
    checkNpcEvolution,
    npcAutonomousDecision,
    getNpcMemoryDisplay
};