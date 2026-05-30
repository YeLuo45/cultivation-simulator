/**
 * SectService - 宗门服务
 * Core sect operations: createSect, recruitDisciple, trainDisciple, dispatchDisciple, collectResources
 */

import { createSect, SECT_CONFIG, calculateSectIncome } from '../entities/Sect.js';
import { createDisciple, NPC_ROLES, NPC_PERSONALITIES, NPC_GIFTS, recordNpcMemory } from '../entities/Disciple.js';

/**
 * Create a new sect
 */
function createNewSect(name) {
    if (gameState.spiritStones < SECT_CONFIG.createCost) {
        alert('灵石不足！');
        return null;
    }
    
    if (gameState.realm < 4) {
        alert('需要元婴期才能创建宗门！');
        return null;
    }
    
    gameState.spiritStones -= SECT_CONFIG.createCost;
    gameState.sect = createSect(name);
    
    // Add initial disciple for sect leader
    addDisciple('入门弟子', 3);
    
    addLog('good', '宗门创建', `恭喜！${name}正式成立，你成为开山宗主！`);
    
    if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {}, progress: {}, claimedStages: {}, seasonPoints: 0, seasonRewards: [] };
    gameState.achievements.stats.sectContributions++;
    checkAchievements();

    saveGame();
    updateDisplay();
    renderSectHome();
    
    return gameState.sect;
}

/**
 * Add a disciple to sect
 */
function addDisciple(name, realm, talentIndex = 1) {
    const sect = gameState.sect;
    const disciple = createDisciple(name, realm, talentIndex);
    
    sect.disciples.push(disciple);
    
    // First disciple becomes leader
    if (sect.npcLeaderId === null) {
        sect.npcLeaderId = disciple.uid;
        disciple.npcRole = 'leader';
    }

    // Assign random personality
    const personalities = ['diligent', 'lazy', 'aggressive', 'steady'];
    disciple.npcPersonality = personalities[Math.floor(Math.random() * personalities.length)];
    
    return disciple;
}

/**
 * Recruit a new disciple
 */
function recruitDisciple() {
    const sect = gameState.sect;
    const maxDisciples = SECT_CONFIG.maxDisciples[sect.level];
    
    if (sect.disciples.length >= maxDisciples) {
        alert(`宗门人数已达上限（${maxDisciples}人）！`);
        return null;
    }
    
    const recruitCost = SECT_CONFIG.recruitCost;
    if (gameState.spiritStones < recruitCost) {
        alert('灵石不足！需要 ' + recruitCost + ' 灵石');
        return null;
    }
    
    gameState.spiritStones -= recruitCost;
    
    const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十', '钱二', '孙三'];
    const randomName = names[Math.floor(Math.random() * names.length)] + ' [' + Math.floor(Math.random() * 100) + ']';
    const talent = weightedRandom(SECT_CONFIG.talentWeights);
    const talentIndex = SECT_CONFIG.talents.indexOf(talent);
    const realm = Math.max(0, gameState.realm - 1);
    
    const disciple = addDisciple(randomName, realm, talentIndex);
    
    addLog('good', '招募弟子', `成功招募 ${randomName}（${talent}资质）`);
    saveGame();
    updateDisplay();
    renderSectHome();
    
    return disciple;
}

/**
 * Weighted random selection
 */
function weightedRandom(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) return i;
    }
    return weights.length - 1;
}

/**
 * Train a disciple
 */
function trainDisciple(discipleId, type) {
    const sect = gameState.sect;
    const disciple = sect.disciples.find(d => d.uid === discipleId);
    if (!disciple) return null;
    
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
    
    recordNpcMemory(discipleId, 'task_complete', { type: trainType, gains: gains[trainType] });
    
    return { success: true, discipleId, type: trainType, gains: gains[trainType], newRealm: disciple.realm };
}

/**
 * Dispatch disciple to palace
 */
function dispatchDiscipleToPalace() {
    const sect = gameState.sect;
    const palace = gameState.palace;
    
    if (!sect.disciples || sect.disciples.length === 0) {
        alert('宗门没有弟子可派遣！');
        return false;
    }
    
    const maxPalaceDisciples = PALACE_CONFIG.maxPalaceDisciples[palace.level];
    if (palace.disciples.length >= maxPalaceDisciples) {
        alert(`仙宫弟子已达上限（${maxPalaceDisciples}人）！`);
        return false;
    }
    
    showDiscipleSelectionModal('dispatch');
    return true;
}

/**
 * Recall disciple from palace
 */
function recallDiscipleFromPalace() {
    const sect = gameState.sect;
    const palace = gameState.palace;
    
    if (!palace.disciples || palace.disciples.length === 0) {
        alert('仙宫没有弟子可召回！');
        return false;
    }
    
    const maxDisciples = SECT_CONFIG.maxDisciples[sect.level];
    if (sect.disciples.length >= maxDisciples) {
        alert(`宗门弟子已达上限（${maxDisciples}人）！`);
        return false;
    }
    
    showPalaceDiscipleSelectionModal('recall');
    return true;
}

/**
 * Select disciple for dispatch
 */
function selectDiscipleForDispatch(discipleIdx) {
    const sect = gameState.sect;
    const palace = gameState.palace;
    
    const disciple = sect.disciples[discipleIdx];
    if (!disciple) return;
    
    disciple.dispatched = true;
    disciple.dispatchedTo = 'palace';
    
    const palaceDisciple = {
        ...disciple,
        uid: 'p_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        dispatchedFrom: 'sect',
        originalUid: disciple.uid
    };
    
    palace.disciples.push(palaceDisciple);
    sect.dispatchedToPalace = (sect.dispatchedToPalace || 0) + 1;
    
    addLog('good', '弟子派遣', `${disciple.name}已派遣至仙宫支援！`);
    saveGame();
    closeDiscipleSelectionModal();
    renderSectHome();
}

/**
 * Select disciple for recall
 */
function selectDiscipleForRecall(discipleIdx) {
    const sect = gameState.sect;
    const palace = gameState.palace;
    
    const palaceDisciple = palace.disciples[discipleIdx];
    if (!palaceDisciple) return;
    
    const originalDisciple = sect.disciples.find(d => d.uid === palaceDisciple.originalUid);
    if (originalDisciple) {
        originalDisciple.dispatched = false;
        originalDisciple.dispatchedTo = null;
    }
    
    palace.disciples.splice(discipleIdx, 1);
    sect.dispatchedToPalace = Math.max(0, (sect.dispatchedToPalace || 0) - 1);
    
    addLog('good', '弟子召回', `${palaceDisciple.name}已从仙宫召回！`);
    saveGame();
    closeDiscipleSelectionModal();
    renderSectHome();
}

/**
 * Collect sect resources
 */
function collectSectResources() {
    const sect = gameState.sect;
    const daysPassed = gameState.days - sect.lastResourceCollection;
    
    if (daysPassed < 1) {
        alert('今日已领取产出！');
        return;
    }
    
    const income = calculateSectIncome.call({ sect });
    const totalIncome = income * daysPassed;
    
    sect.spiritStones += totalIncome;
    sect.lastResourceCollection = gameState.days;
    
    sect.disciples.forEach(d => {
        const contribGain = Math.floor(5 + (d.talentIndex || 1) * 2);
        d.contribution += contribGain;
    });
    
    if (sect.buildings.alchemy) {
        const pills = daysPassed * 2;
        addItemToInventory('聚灵丹', pills);
    }
    
    if (sect.buildings.forge && daysPassed >= 3) {
        const treasures = Math.floor(daysPassed / 3);
        if (treasures > 0) {
            addItemToInventory('青云剑', treasures);
        }
    }
    
    addLog('good', '宗门产出', `领取了 ${daysPassed} 天的宗门产出，共 ${totalIncome} 灵石`);
    saveGame();
    updateDisplay();
    renderSectHome();
}

/**
 * Build a sect building
 */
function buildBuilding(key) {
    const sect = gameState.sect;
    const building = SECT_CONFIG.buildings[key];
    
    if (sect.spiritStones < building.cost) {
        alert('宗门灵石不足！');
        return;
    }
    
    sect.spiritStones -= building.cost;
    sect.buildings[key] = true;
    
    addLog('good', '建筑建造', `成功建造 ${building.name}！`);
    saveGame();
    updateDisplay();
    renderSectHome();
}

/**
 * Upgrade sect
 */
function upgradeSect() {
    const sect = gameState.sect;
    const nextLevel = sect.level + 1;
    const cost = SECT_CONFIG.upgradeCost[nextLevel];
    const requiredDisciples = SECT_CONFIG.upgradeDisciples[nextLevel];
    
    if (sect.spiritStones < cost) {
        alert('宗门灵石不足！');
        return;
    }
    
    if (sect.disciples.length < requiredDisciples) {
        alert(`弟子人数不足！需要 ${requiredDisciples} 名弟子`);
        return;
    }
    
    if (nextLevel === 3) {
        if (!sect.buildings.library || !sect.buildings.alchemy || !sect.buildings.forge) {
            alert('升级需要全部1级建筑！');
            return;
        }
    }
    
    sect.spiritStones -= cost;
    sect.level = nextLevel;
    
    addLog('good', '宗门升级', `宗门升级为 ${nextLevel} 级！`);
    saveGame();
    updateDisplay();
    renderSectHome();
}

/**
 * Assign elder
 */
function assignElder(slot) {
    const sect = gameState.sect;
    const availableDisciples = sect.disciples.filter(d => !sect.elders.includes(d.uid));
    
    if (availableDisciples.length === 0) {
        alert('没有可任命的弟子！');
        return;
    }
    
    const newElder = availableDisciples[0];
    sect.elders[slot] = newElder.uid;
    newElder.status = 'elder';
    
    addLog('good', '任命长老', `${newElder.name} 被任命为长老！`);
    saveGame();
    renderSectHome();
}

/**
 * Remove elder
 */
function removeElder(slot) {
    const sect = gameState.sect;
    const elderUid = sect.elders[slot];
    
    if (!elderUid) return;
    
    const elder = sect.disciples.find(d => d.uid === elderUid);
    if (elder) {
        elder.status = 'idle';
    }
    
    sect.elders.splice(slot, 1);
    
    addLog('neutral', '免职长老', `${elder ? elder.name : '长老'} 被免职`);
    saveGame();
    renderSectHome();
}

/**
 * Disband sect
 */
function disbandSect() {
    if (!confirm('确定要解散宗门吗？此操作不可恢复！')) return;
    
    addLog('bad', '宗门解散', `${gameState.sect.name} 已解散！`);
    
    gameState.sect = {
        name: null,
        level: 0,
        spiritStones: 0,
        disciples: [],
        elders: [],
        buildings: { library: false, alchemy: false, forge: false, archive: false },
        techniques: [],
        contributionShop: [],
        lastShopRefresh: 0,
        lastResourceCollection: 0
    };
    
    saveGame();
    updateDisplay();
    closeSect();
}

/**
 * Process NPC autonomous loop (daily)
 */
function processNpcAutonomousLoop() {
    const sect = gameState.sect;
    if (!sect.name || sect.disciples.length === 0) return;

    if (sect.npcLastActionDay >= gameState.days) return;
    sect.npcLastActionDay = gameState.days;

    const logMessages = [];

    sect.disciples.forEach(d => {
        if (d.npcRole === 'leader') {
            if (Math.random() < 0.3 && sect.npcTasks.length < 3) {
                const taskTypes = ['collect', 'train', 'combat'];
                const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
                const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
                const rewards = { spiritStones: Math.floor(20 + Math.random() * 30), contribution: Math.floor(5 + Math.random() * 10) };
                sect.npcTasks.push({
                    id: taskId,
                    type: taskType,
                    target: Math.floor(3 + Math.random() * 5),
                    progress: 0,
                    status: 'active',
                    reward: rewards,
                    assignedUid: null,
                    createdDay: gameState.days
                });
                logMessages.push(`【${d.name}】发布了新的宗门任务`);
            }
        }

        if (d.npcTask) {
            d.npcTaskDays++;
            d.npcTask.progress++;

            if (d.npcTask.type === 'collect') {
                d.contribution += 2;
            } else if (d.npcTask.type === 'train') {
                const bonus = getMasterBonus(d);
                const trainChance = 0.3 + bonus * 0.05;
                if (Math.random() < trainChance) {
                    d.realm = Math.min(d.realm + 1, gameState.realm + 2);
                    logMessages.push(`【${d.name}】在师傅指导下修炼精进，境界提升！`);
                }
            } else if (d.npcTask.type === 'combat') {
                d.contribution += 3;
            }

            if (d.npcTask.progress >= d.npcTask.target) {
                const task = sect.npcTasks.find(t => t.id === d.npcTask.id);
                if (task) {
                    task.status = 'completed';
                    sect.spiritStones += task.reward.spiritStones;
                    d.contribution += task.reward.contribution;
                    logMessages.push(`【${d.name}】完成任务：${task.reward.spiritStones}灵石！`);
                }
                d.npcTask = null;
                d.npcTaskDays = 0;
            }
        } else {
            const personality = d.npcPersonality || 'steady';
            const pinfo = NPC_PERSONALITIES[personality] || NPC_PERSONALITIES.steady;
            const rand = Math.random();
            
            if (personality === 'diligent') {
                if (rand < 0.7) { d.status = 'training'; d.npcMood = 'happy'; }
                else if (rand < 0.9) { d.status = 'collecting'; sect.spiritStones += Math.floor(5 * pinfo.efficiency + (d.talentIndex || 1) * 2); }
                else { d.status = 'meditating'; d.npcMood = 'happy'; }
            } else if (personality === 'lazy') {
                if (rand < 0.2) { d.status = 'training'; d.npcMood = 'normal'; }
                else if (rand < 0.8) { d.status = 'collecting'; sect.spiritStones += Math.floor(5 * pinfo.efficiency + (d.talentIndex || 1) * 2); }
                else { d.status = 'idle'; d.npcMood = 'normal'; }
            } else if (personality === 'aggressive') {
                if (rand < 0.3) { d.status = 'training'; d.npcMood = 'normal'; }
                else if (rand < 0.6) { d.status = 'collecting'; sect.spiritStones += Math.floor(5 * pinfo.efficiency + (d.talentIndex || 1) * 2); }
                else { d.status = 'meditating'; d.npcMood = Math.random() < 0.5 ? 'upset' : 'normal'; }
            } else {
                if (rand < 0.5) { d.status = 'training'; d.npcMood = 'normal'; }
                else if (rand < 0.8) { d.status = 'collecting'; sect.spiritStones += Math.floor(5 * pinfo.efficiency + (d.talentIndex || 1) * 2); }
                else { d.status = 'meditating'; d.npcMood = 'normal'; }
            }
        }
    });

    const avgMood = sect.disciples.reduce((sum, d) => {
        const mood = d.npcMood === 'happy' ? 100 : d.npcMood === 'upset' ? 0 : 50;
        return sum + mood;
    }, 0) / sect.disciples.length;
    sect.sectMood = Math.max(0, Math.min(100, Math.round(sect.sectMood * 0.7 + avgMood * 0.3)));

    processSectRandomEvent();

    if (logMessages.length > 0) {
        logMessages.forEach(msg => addLog('good', '宗门动态', msg));
    }
}

/**
 * Process sect random event
 */
function processSectRandomEvent() {
    const sect = gameState.sect;
    if (!sect.name) return;

    const baseChance = 0.15;
    const moodModifier = (sect.sectMood - 50) / 500;
    const triggerChance = baseChance + moodModifier;
    if (Math.random() > triggerChance) return;

    const events = [
        { type: 'serendipity', weight: 1, title: '🌟 弟子顿悟', desc: '某位弟子在修炼中突然顿悟，境界有所提升', effect: (sect) => {
            const d = sect.disciples[Math.floor(Math.random() * sect.disciples.length)];
            if (d) {
                d.realm = Math.min(d.realm + 1, gameState.realm + 2);
                addLog('good', '宗门事件', `【${d.name}】修炼中顿悟，境界提升！`);
            }
        }},
        { type: 'serendipity', weight: 1, title: '💎 矿区发现', desc: '弟子在附近发现了一处灵石矿区', effect: (sect) => {
            const gain = Math.floor(200 + Math.random() * 300);
            sect.spiritStones += gain;
            addLog('good', '宗门事件', `发现灵石矿区，获得${gain}灵石！`);
        }},
        { type: 'crisis', weight: 1, title: '🔥 宗门冲突', desc: '弟子之间发生冲突，宗门气氛下降', effect: (sect) => {
            sect.sectMood = Math.max(0, sect.sectMood - 15);
            const d = sect.disciples[Math.floor(Math.random() * sect.disciples.length)];
            if (d) modifyAffection(d, -10);
            addLog('bad', '宗门事件', '弟子冲突，宗门气氛下降！');
        }},
        { type: 'crisis', weight: 1, title: '⚠️ 外部挑衅', desc: '其他势力对宗门产生敌意', effect: (sect) => {
            sect.sectMood = Math.max(0, sect.sectMood - 10);
            addLog('bad', '宗门事件', '外部势力挑衅，宗门气氛受损！');
        }},
        { type: 'daily', weight: 2, title: '🎉 宗门团建', desc: '弟子们举办了一次联谊活动', effect: (sect) => {
            sect.sectMood = Math.min(100, sect.sectMood + 10);
            sect.disciples.forEach(d => modifyAffection(d, 3));
            addLog('good', '宗门事件', '宗门联谊，气氛提升！');
        }},
        { type: 'daily', weight: 2, title: '📚 功法交流会', desc: '长老主持功法交流，弟子们受益匪浅', effect: (sect) => {
            sect.disciples.forEach(d => modifyAffection(d, 2));
            addLog('good', '宗门事件', '功法交流会，弟子好感提升！');
        }},
        { type: 'daily', weight: 1, title: '🌿 灵草丰收', desc: '宗门灵草园喜获丰收', effect: (sect) => {
            const gain = Math.floor(50 + Math.random() * 100);
            sect.spiritStones += gain;
            addLog('good', '宗门事件', `灵草丰收，获得${gain}灵石！`);
        }}
    ];

    const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedEvent = events[events.length - 1];
    for (const e of events) {
        rand -= e.weight;
        if (rand <= 0) { selectedEvent = e; break; }
    }

    selectedEvent.effect(sect);
}

/**
 * Modify disciple affection
 */
function modifyAffection(disciple, delta) {
    const oldAff = disciple.npcAffection || 50;
    disciple.npcAffection = Math.max(0, Math.min(100, oldAff + delta));

    if (disciple.npcAffection >= 70) disciple.npcMood = 'happy';
    else if (disciple.npcAffection <= 25) disciple.npcMood = 'upset';
    else disciple.npcMood = 'normal';

    return disciple.npcAffection - oldAff;
}

/**
 * Get master bonus for disciple
 */
function getMasterBonus(disciple) {
    if (!disciple.npcMasterId) return 0;
    const sect = gameState.sect;
    const master = sect.disciples.find(d => d.uid === disciple.npcMasterId);
    if (!master) return 0;

    const realmDiff = master.realm - disciple.realm;
    if (realmDiff <= 0) return 0;
    return Math.floor(2 + realmDiff * 1.5);
}

/**
 * Add item to inventory
 */
function addItemToInventory(name, quantity) {
    const existing = gameState.inventory.find(i => i.name === name);
    if (existing) {
        existing.quantity += quantity;
    } else {
        gameState.inventory.push({ name: name, quantity: quantity });
    }
}

export {
    createNewSect,
    addDisciple,
    recruitDisciple,
    weightedRandom,
    trainDisciple,
    dispatchDiscipleToPalace,
    recallDiscipleFromPalace,
    selectDiscipleForDispatch,
    selectDiscipleForRecall,
    collectSectResources,
    buildBuilding,
    upgradeSect,
    assignElder,
    removeElder,
    disbandSect,
    processNpcAutonomousLoop,
    processSectRandomEvent,
    modifyAffection,
    getMasterBonus,
    addItemToInventory
};