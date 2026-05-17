// Auto-generated module: immortal.js
'use strict';

// ===== IMMORTAL_REALMS =====
const IMMORTAL_REALMS = {
    1: { name: '地仙境', icon: '🌱', description: '仙界最低境界，相当于凡界筑基~金丹', cultivationBase: 100 },
    2: { name: '天仙境', icon: '☁️', description: '中级仙人，相当于凡界元婴', cultivationBase: 200 },
    3: { name: '金仙境', icon: '⭐', description: '高级仙人，相当于凡界化神', cultivationBase: 400 },
    4: { name: '大罗金仙', icon: '🌟', description: '顶级强者，相当于凡界渡劫', cultivationBase: 800 },
    5: { name: '混元大罗', icon: '💫', description: '飞升目标，超越凡界一切', cultivationBase: 1600 }
};

// ===== IMMORTAL_REGIONS =====
const IMMORTAL_REGIONS = {
    '仙灵谷': {
        realmRequired: 1,
        dangerLevel: 1,
        icon: '🌿',
        description: '新手区域，仙气充沛，适合初入仙界者',
        resources: ['仙草', '仙兽蛋'],
        color: '#4caf50'
    },
    '天庭': {
        realmRequired: 2,
        dangerLevel: 2,
        icon: '🏯',
        description: '仙界中心，天道法则汇聚之地',
        resources: ['天庭令牌', '仙官赐福'],
        color: '#ffd700'
    },
    '万妖山': {
        realmRequired: 2,
        dangerLevel: 2,
        icon: '🏔️',
        description: '妖修领地，妖族强者云集',
        resources: ['妖修功法', '妖族坐骑'],
        color: '#ff5722'
    },
    '神魔战场': {
        realmRequired: 3,
        dangerLevel: 4,
        icon: '⚔️',
        description: '上古神魔大战遗迹，蕴含无穷奥秘',
        resources: ['神魔装备', '混沌碎片'],
        color: '#9c27b0'
    },
    '三十三天': {
        realmRequired: 4,
        dangerLevel: 5,
        icon: '🔮',
        description: '极高危险区域，突破混元大罗的必经之地',
        resources: ['混沌碎片', '飞升道具'],
        color: '#e91e63'
    },
    '混沌海': {
        realmRequired: 5,
        dangerLevel: 5,
        icon: '🌀',
        description: '最终区域，传说中混元大罗的诞生之地',
        resources: ['混沌神石', '位面法则'],
        color: '#00bcd4'
    }
};

// ===== initializeImmortalState =====
function initializeImmortalState() {
    if (!gameState.immortal) {
        gameState.immortal = {
            realm: 1,
            spiritStones: 0,
            currentRegion: '仙灵谷',
            exploredRegions: ['仙灵谷'],
            cultivationProgress: 0,
            map: {
                '仙灵谷': { unlocked: true, explored: [] },
                '天庭': { unlocked: false, realmRequired: 2 },
                '万妖山': { unlocked: false, realmRequired: 2 },
                '神魔战场': { unlocked: false, realmRequired: 3 },
                '三十三天': { unlocked: false, realmRequired: 4 },
                '混沌海': { unlocked: false, realmRequired: 5 }
            },
            lastAerialCooldown: 0,
            lastFateTask: 0,
            fateTaskRefreshDay: 0,
            celestialCycleDay: 0,
            celestialCycleCompleted: false
        };
    }
    if (!gameState.mounts) gameState.mounts = [];
    if (!gameState.immortalSkills) gameState.immortalSkills = [];
    if (!gameState.immortalEquipment) {
        gameState.immortalEquipment = {
            head: null,
            body: null,
            foot: null,
            weapon: null,
            shield: null,
            accessory: null
        };
    }
    if (!gameState.currentRealm) gameState.currentRealm = 'mortal';
    if (gameState.currentMount === undefined) gameState.currentMount = null;
}

// ===== canEnterRegion =====
function canEnterRegion(region) {
    const req = IMMORTAL_REGIONS[region].realmRequired;
    return gameState.immortal.realm >= req;
}

// ===== doAerialTravel =====
function doAerialTravel(targetRegion) {
    if (!gameState.immortal || gameState.immortal.currentRegion === targetRegion) return;
    
    const cooldown = getAerialCooldown();
    const timeSinceLast = Date.now() - gameState.immortal.lastAerialCooldown;
    
    if (timeSinceLast < cooldown) {
        const remaining = Math.ceil((cooldown - timeSinceLast) / 1000);
        showToast(`御空术冷却中，还需${remaining}秒`);
        return;
    }
    
    if (!canEnterRegion(targetRegion)) {
        showToast('境界不足，无法进入该区域');
        return;
    }
    
    gameState.immortal.currentRegion = targetRegion;
    gameState.immortal.lastAerialCooldown = Date.now();
    
    // 添加到已探索
    if (!gameState.immortal.exploredRegions.includes(targetRegion)) {
        gameState.immortal.exploredRegions.push(targetRegion);
    }
    
    // 触发区域事件
    triggerRegionEvent(targetRegion);
    saveGame();
    updateDisplay();
    
    // 更新UI
    if (typeof renderImmortalUI === 'function') renderImmortalUI();
}

// ===== getAerialCooldown =====
function getAerialCooldown() {
    const baseCooldown = 10000; // 10秒基础冷却
    const mountBonus = getMountSpeedBonus();
    return Math.max(1000, baseCooldown * (1 - mountBonus));
}

// ===== getMountSpeedBonus =====
function getMountSpeedBonus() {
    const mount = gameState.currentMount;
    if (!mount) return 0;
    // 成熟度越高加速越多
    return (mount.maturity / 100) * (mount.stats.speed / 100) * 0.5;
}

// ===== triggerRegionEvent =====
function triggerRegionEvent(region) {
    const rand = Math.random();
    if (rand < 0.3) {
        // 30%概率触发仙缘任务
        if (gameState.immortal.currentRegion !== '天庭') {
            showToast(`在${region}遇到神秘机缘...`);
        }
    }
}

// ===== earnSpiritStones =====
function earnSpiritStones(amount, source) {
    gameState.immortal.spiritStones += amount;
    addLog('good', '获得仙石', `获得 ${amount} 仙石（${source}）`);
    saveGame();
    updateDisplay();
}

// ===== spendSpiritStones =====
function spendSpiritStones(amount, reason) {
    if (gameState.immortal.spiritStones < amount) {
        showToast('仙石不足');
        return false;
    }
    gameState.immortal.spiritStones -= amount;
    saveGame();
    return true;
}

// ===== doImmortalCultivation =====
function doImmortalCultivation() {
    const realm = gameState.immortal.realm;
    const realmData = IMMORTAL_REALMS[realm];
    let baseGain = realmData.cultivationBase * (1 + Math.random() * 0.5);
    
    // 应用装备加成
    baseGain *= (1 + getImmortalEquipBonus());
    
    // 应用仙兽加成
    if (gameState.currentMount) {
        baseGain *= (1 + gameState.currentMount.stats.speed / 200);
    }
    
    const gain = Math.floor(baseGain);
    gameState.immortal.cultivationProgress += gain;
    
    // 检查境界突破
    const nextRealm = realm + 1;
    if (nextRealm <= 5 && gameState.immortal.cultivationProgress >= realmData.cultivationBase * 10) {
        gameState.immortal.realm = nextRealm;
        gameState.immortal.cultivationProgress = 0;
        // 解锁新区域
        unlockRegionForRealm(nextRealm);
        addLog('good', '境界突破', `突破到${IMMORTAL_REALMS[nextRealm].name}！`);
        showToast(`恭喜突破到${IMMORTAL_REALMS[nextRealm].name}！`);
    } else {
        addLog('neutral', '仙气修炼', `修炼${gain}点仙气，感觉体内的仙力更加充沛。`);
    }
    
    gameState.days++;
    saveGame();
    updateDisplay();
}

// ===== unlockRegionForRealm =====
function unlockRegionForRealm(realm) {
    for (const region in gameState.immortal.map) {
        if (gameState.immortal.map[region].realmRequired === realm) {
            gameState.immortal.map[region].unlocked = true;
        }
    }
}

// ===== getImmortalEquipBonus =====
function getImmortalEquipBonus() {
    let bonus = 0;
    const equip = gameState.immortalEquipment;
    for (const slot in equip) {
        if (equip[slot]) {
            bonus += equip[slot].quality * 0.1;
        }
    }
    return bonus;
}

// ===== showImmortalMap =====
function showImmortalMap() {
    let html = '<div style="padding:16px;">';
    html += '<h3 style="color:#ffd700;text-align:center;margin-bottom:16px;">☁️ 仙界地图 ☁️</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">';
    
    for (const region in IMMORTAL_REGIONS) {
        const data = IMMORTAL_REGIONS[region];
        const isUnlocked = canEnterRegion(region);
        const isCurrent = gameState.immortal.currentRegion === region;
        const isExplored = gameState.immortal.exploredRegions.includes(region);
        
        let style = 'padding:12px;border-radius:8px;text-align:center;cursor:pointer;';
        style += isUnlocked ? `background:${data.color}33;border:2px solid ${data.color};` : 'background:#333;border:2px solid #555;';
        style += isCurrent ? 'box-shadow:0 0 15px #ffd700;' : '';
        
        html += `<div style="${style}" onclick="${isUnlocked ? `doAerialTravel('${region}')` : ''}">`;
        html += `<div style="font-size:24px;">${data.icon}</div>`;
        html += `<div style="color:${isUnlocked ? '#fff' : '#666'};font-weight:bold;">${region}</div>`;
        html += `<div style="font-size:11px;color:${isUnlocked ? '#aaa' : '#444'};">需要${data.realmRequired}重天</div>`;
        html += isCurrent ? '<div style="color:#ffd700;font-size:11px;">当前位置</div>' : '';
        html += '</div>';
    }
    
    html += '</div></div>';
    
    // 冷却显示
    const cooldown = getAerialCooldown();
    const timeSinceLast = Date.now() - gameState.immortal.lastAerialCooldown;
    const remaining = Math.max(0, cooldown - timeSinceLast);
    
    html += `<div style="text-align:center;margin-top:16px;padding:10px;background:#1a1a2e;border-radius:8px;">`;
    html += `<div style="color:#aaa;font-size:12px;">御空术冷却: ${Math.ceil(remaining / 1000)}秒</div>`;
    if (gameState.currentMount) {
        html += `<div style="color:#4caf50;font-size:12px;">🐎 骑乘${gameState.currentMount.name}，冷却缩短50%</div>`;
    }
    html += '</div>';
    
    openModal('仙界地图', html, '');
}

// ===== getImmortalDailyIncome =====
function getImmortalDailyIncome() {
    if (gameState.currentRealm !== 'immortal') return { qi: 0, stones: 0 };
    const regionData = IMMORTAL_REGIONS[gameState.immortal.currentRegion];
    const realmData = IMMORTAL_REALMS[gameState.immortal.realm];
    const baseQi = realmData.cultivationBase * 0.1;
    const regionBonus = (regionData.dangerLevel || 1) * 0.05;
    const blessingBonus = gameState.celestialCycle.blessingActive ? 0.2 : 0;
    return {
        qi: Math.floor(baseQi * (1 + regionBonus + blessingBonus)),
        stones: Math.floor((regionData.dangerLevel || 1) * 10 * Math.random())
    };
}

// ===== processCelestialCycle =====
function processCelestialCycle() {
    if (gameState.currentRealm !== 'immortal') return;
    
    const cc = gameState.celestialCycle;
    const interval = cc.cycleInterval || 3;
    
    // 每日仙界修炼结算（自动主路径）
    const income = getImmortalDailyIncome();
    const spiritRootBonus = 1 + (getSpiritRootCultivationBonus ? getSpiritRootCultivationBonus() : 0);
    const progressGain = Math.floor(income.qi * spiritRootBonus);
    
    // 更新修炼进度
    if (gameState.immortal) {
        gameState.immortal.cultivationProgress += progressGain;
        gameState.immortal.spiritStones += income.stones;
        
        // 检查境界突破
        const realmData = IMMORTAL_REALMS[gameState.immortal.realm];
        if (realmData && gameState.immortal.cultivationProgress >= realmData.cultivationBase * 10) {
            const nextRealm = gameState.immortal.realm + 1;
            if (nextRealm <= 5) {
                gameState.immortal.realm = nextRealm;
                gameState.immortal.cultivationProgress = 0;
                addLog('good', '境界突破', `天道轮回中，突破至${IMMORTAL_REALMS[nextRealm].name}！`);
            }
        }
    }
    
    // 天道轮回日结算
    cc.day++;
    if (cc.day >= interval && !cc.completed) {
        executeCelestialCycle();
        cc.day = 0;
        cc.completed = true;
    }
    
    // 新周期开始
    if (cc.day === 0) {
        cc.completed = false;
    }
}

// ===== executeCelestialCycle =====
function executeCelestialCycle() {
    if (gameState.currentRealm !== 'immortal') return;
    
    const realmData = IMMORTAL_REALMS[gameState.immortal.realm];
    const regionData = IMMORTAL_REGIONS[gameState.immortal.currentRegion];
    
    // 主路径：修炼结算
    let resultText = `【天道轮回·第${gameState.days}天】\n`;
    let eventType = 'neutral';
    let effects = { qi: 0, stones: 0, mindset: 0 };
    
    const baseProgress = realmData.cultivationBase;
    const spiritRootBonus = 1 + (getSpiritRootCultivationBonus ? getSpiritRootCultivationBonus() : 0);
    const regionBonus = (regionData.dangerLevel || 1) * 0.1;
    const progressGain = Math.floor(baseProgress * (1 + regionBonus) * spiritRootBonus);
    
    if (gameState.immortal) {
        gameState.immortal.cultivationProgress += progressGain;
    }
    resultText += `修炼进度 +${progressGain}\n`;
    effects.qi = progressGain;
    
    // 次路径：气运波动触发器
    const roll = Math.random();
    const blessingBonus = gameState.celestialCycle.blessingActive ? 0.15 : 0;
    
    if (roll < 0.4 + blessingBonus) {
        // 正面事件 40%
        eventType = 'positive';
        const positiveEvents = [
            { text: '✨ 顿悟时刻', effect: () => { 
                if (gameState.immortal) gameState.immortal.cultivationProgress += Math.floor(progressGain * 0.5);
                effects.qi += Math.floor(progressGain * 0.5);
                return '修炼进度额外 +50%';
            }},
            { text: '🌟 天赐灵物', effect: () => {
                const stoneGain = Math.floor(500 * Math.random()) + 100;
                if (gameState.immortal) gameState.immortal.spiritStones += stoneGain;
                effects.stones = stoneGain;
                return `获得 ${stoneGain} 灵石`;
            }},
            { text: '☁️ 祥瑞降临', effect: () => {
                effects.mindset = 10;
                return '心态 +10';
            }}
        ];
        const event = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
        resultText += event.text + '：' + event.effect() + '\n';
        
    } else if (roll < 0.7 + blessingBonus) {
        // 负面事件 30%
        eventType = 'negative';
        const negativeEvents = [
            { text: '👹 心魔入侵', effect: () => {
                effects.mindset = -20;
                return '心态 -20，修炼受阻';
            }},
            { text: '⚡ 天道压制', effect: () => {
                effects.qi = -Math.floor(progressGain * 0.3);
                if (gameState.immortal) gameState.immortal.cultivationProgress -= Math.floor(progressGain * 0.3);
                return '当日修炼效率 -30%';
            }},
            { text: '💔 灵气紊乱', effect: () => {
                const stoneLoss = Math.floor((gameState.immortal?.spiritStones || 0) * 0.05);
                if (gameState.immortal && stoneLoss > 0) gameState.immortal.spiritStones -= stoneLoss;
                effects.stones = -stoneLoss;
                return `损失 ${stoneLoss} 灵石`;
            }}
        ];
        const event = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
        resultText += event.text + '：' + event.effect() + '\n';
        
    } else {
        // 中性事件 30%
        eventType = 'neutral';
        const neutralEvents = [
            { text: '🧙 仙人指路', effect: () => {
                return '天道启示：继续保持当前修炼节奏';
            }},
            { text: '🔮 奇遇发现', effect: () => {
                // 解锁新区域线索
                return '隐约感知到未知区域的召唤';
            }},
            { text: '⏳ 平静期', effect: () => {
                return '天道运行平稳，无特殊事件';
            }}
        ];
        const event = neutralEvents[Math.floor(Math.random() * neutralEvents.length)];
        resultText += event.text + '：' + event.effect() + '\n';
    }
    
    // 清除祈福状态
    gameState.celestialCycle.blessingActive = false;
    
    // 保存结果
    const result = { type: eventType, text: resultText, effects: effects, day: gameState.days };
    gameState.celestialCycle.lastResult = result;
    
    showCelestialCycleResult(result);
    
    addLog(eventType === 'positive' ? 'good' : eventType === 'negative' ? 'bad' : 'normal', 
           '天道轮回', resultText.replace(/\n/g, ' '));
}

// ===== showCelestialCycleResult =====
function showCelestialCycleResult(result) {
    const icon = result.type === 'positive' ? '🌟' : result.type === 'negative' ? '💥' : '🔮';
    const color = result.type === 'positive' ? '#4caf50' : result.type === 'negative' ? '#f44336' : '#2196f3';
    
    const modal = document.getElementById('modalNormal');
    if (!modal) return;
    
    let effectsText = '';
    if (result.effects.qi !== 0) effectsText += ` 灵气 ${result.effects.qi > 0 ? '+' : ''}${result.effects.qi}`;
    if (result.effects.stones !== 0) effectsText += ` 灵石 ${result.effects.stones > 0 ? '+' : ''}${result.effects.stones}`;
    if (result.effects.mindset !== 0) effectsText += ` 心态 ${result.effects.mindset > 0 ? '+' : ''}${result.effects.mindset}`;
    
    modal.innerHTML = `
        <div class="result-title" style="color:${color}">${icon} 天道轮回结算 ${icon}</div>
        <div style="margin:15px 0;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;text-align:left">
            ${result.text.replace(/\n/g, '<br/>')}
        </div>
        <div style="color:#aaa;font-size:12px">${effectsText}</div>
        <div style="margin-top:15px">
            <button onclick="closeModal('modalNormal')" style="padding:8px 20px;background:#444;color:#fff;border:none;border-radius:4px;cursor:pointer">确定</button>
        </div>
    `;
    modal.classList.remove('hidden');
}

// ===== requestExtraCycle =====
function requestExtraCycle() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('只有在仙界才能请求天道轮回');
        return;
    }
    const cost = 100;
    if ((gameState.immortal?.spiritStones || 0) < cost) {
        showToast(`需要 ${cost} 灵石请求额外轮回`);
        return;
    }
    if (gameState.immortal) {
        gameState.immortal.spiritStones -= cost;
    }
    gameState.celestialCycle.day = gameState.celestialCycle.cycleInterval || 3;
    showToast(`消耗 ${cost} 灵石，请求天道轮回`);
    addLog('normal', '主动干预', `消耗 ${cost} 灵石请求额外天道轮回`);
}

// ===== requestFortuneBlessing =====
function requestFortuneBlessing() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('只有在仙界才能进行气运祈福');
        return;
    }
    const cost = 200;
    if ((gameState.immortal?.spiritStones || 0) < cost) {
        showToast(`需要 ${cost} 灵石进行气运祈福`);
        return;
    }
    if (gameState.immortal) {
        gameState.immortal.spiritStones -= cost;
    }
    gameState.celestialCycle.blessingActive = true;
    showToast(`消耗 ${cost} 灵石，气运祈福生效（下次轮回正面事件概率+15%）`);
    addLog('good', '气运祈福', `消耗 ${cost} 灵石，下次轮回将获得更好气运`);
}

// ===== renderImmortalUI =====
function renderImmortalUI() {
    if (gameState.currentRealm !== 'immortal') return;
    
    // 更新仙界状态显示
    const realmData = IMMORTAL_REALMS[gameState.immortal.realm];
    const regionData = IMMORTAL_REGIONS[gameState.immortal.currentRegion];
    
    // 更新境界显示
    const realmDisplay = document.getElementById('immortalRealmDisplay');
    if (realmDisplay) {
        realmDisplay.innerHTML = `${realmData.icon} ${realmData.name}`;
    }
    
    // 更新仙石显示
    const stoneDisplay = document.getElementById('immortalStoneDisplay');
    if (stoneDisplay) {
        stoneDisplay.textContent = `💎 ${gameState.immortal.spiritStones}`;
    }
    
    // 更新区域显示
    const regionDisplay = document.getElementById('immortalRegionDisplay');
    if (regionDisplay) {
        regionDisplay.innerHTML = `${regionData.icon} ${gameState.immortal.currentRegion}`;
    }
}
