// Auto-generated module: ascension.js
'use strict';

// ===== ASCENSION_COSTS =====
const ASCENSION_COSTS = {
    spiritStones: 500000,  // 50万灵石
    equipmentQuality: 'rare' // 需要紫色(rare)或以上装备
};

// ===== hasOrangeOrHigherEquip =====
function hasOrangeOrHigherEquip() {
    const qualityOrder = { common: 0, rare: 1, precious: 2, legendary: 3 };
    const minQuality = qualityOrder['rare']; // 紫色=rare=1, 橙色=precious=2
    
    // 检查背包
    for (const item of gameState.inventory) {
        if (item.type === 'treasure') {
            if ((qualityOrder[item.quality] || 0) >= minQuality) {
                return true;
            }
        }
    }
    
    // 检查已装备
    for (const equip of gameState.equippedTreasures) {
        if (equip && (qualityOrder[equip.quality] || 0) >= minQuality) {
            return true;
        }
    }
    
    return false;
}

// ===== canAscend =====
function canAscend() {
    // 检查渡劫是否成功
    const hasCompletedTribulation = gameState.realm >= 4 && gameState.stage >= 2;
    if (!hasCompletedTribulation) {
        return { result: false, reason: '需要渡劫成功（化神后期）' };
    }
    
    // 检查灵石
    if (gameState.spiritStones < ASCENSION_COSTS.spiritStones) {
        return { result: false, reason: `需要${ASCENSION_COSTS.spiritStones}灵石，飞升费用` };
    }
    
    // 检查橙色以上装备
    if (!hasOrangeOrHigherEquip()) {
        return { result: false, reason: '需要至少1件紫色以上品质的装备' };
    }
    
    // 检查是否已经飞升
    if (gameState.currentRealm === 'immortal') {
        return { result: false, reason: '已经飞升' };
    }
    
    return { result: true };
}

// ===== showAscensionButton =====
function showAscensionButton() {
    const check = canAscend();
    
    const btn = document.getElementById('ascensionBtn');
    if (!btn) return;
    
    if (check.result) {
        btn.style.display = 'inline-block';
        btn.style.background = 'linear-gradient(135deg, #9c27b0, #e91e63)';
        btn.style.boxShadow = '0 0 20px rgba(233, 30, 99, 0.5)';
        btn.onclick = showAscensionModal;
    } else {
        btn.style.display = 'inline-block';
        btn.style.background = '#444';
        btn.style.boxShadow = 'none';
        btn.onclick = () => showToast(check.reason);
    }
}

// ===== showAscensionModal =====
function showAscensionModal() {
    const check = canAscend();
    if (!check.result) {
        showToast(check.reason);
        return;
    }
    
    let html = '<div style="padding:20px;text-align:center;">';
    html += '<div style="font-size:48px;margin-bottom:10px;">🌟</div>';
    html += '<h2 style="color:#ffd700;margin-bottom:10px;">飞升成仙</h2>';
    html += '<p style="color:#aaa;font-size:13px;margin-bottom:20px;">突破凡界桎梏，进入仙界篇章</p>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:16px;">';
    html += '<div style="color:#ffd700;font-size:12px;margin-bottom:8px;">飞升消耗：</div>';
    html += `<div style="color:#f44336;margin-bottom:4px;">💎 500000 灵石（保留50%）</div>`;
    html += '<div style="color:#ff9800;margin-bottom:4px;">⚔️ 橙色以上装备 → 仙界材料</div>';
    html += '<div style="color:#4caf50;">✨ 已学功法 → 转换仙界版</div>';
    html += '</div>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:16px;">';
    html += '<div style="color:#ffd700;font-size:12px;margin-bottom:8px;">飞升保留：</div>';
    html += '<div style="color:#aaa;margin-bottom:4px;">• 灵石（扣除50%）</div>';
    html += '<div style="color:#aaa;margin-bottom:4px;">• 已学功法（转换仙界版）</div>';
    html += '<div style="color:#aaa;margin-bottom:4px;">• 宗门归属</div>';
    html += '<div style="color:#aaa;margin-bottom:4px;">• 成就/称号（部分保留）</div>';
    html += '<div style="color:#aaa;">• 宗门贡献</div>';
    html += '</div>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:16px;">';
    html += '<div style="color:#ffd700;font-size:12px;margin-bottom:8px;">仙界境界：</div>';
    html += '<div style="color:#4caf50;margin-bottom:4px;">🌱 地仙境 → 天仙境 → 金仙境</div>';
    html += '<div style="color:#2196f3;">⭐ 大罗金仙 → 混元大罗</div>';
    html += '</div>';
    
    html += `<button onclick="doAscend()" style="width:100%;padding:14px;background:linear-gradient(135deg,#9c27b0,#e91e63);color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">🌟 确认飞升</button>`;
    html += `<button onclick="closeModal()" style="width:100%;margin-top:8px;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">返回</button>`;
    html += '</div>';
    
    openModal('飞升', html, '');
}

// ===== doAscend =====
function doAscend() {
    const check = canAscend();
    if (!check.result) {
        showToast(check.reason);
        closeModal();
        return;
    }
    
    // 1. 扣除灵石（保留50%）
    const keepStones = Math.floor(gameState.spiritStones * 0.5);
    const spentStones = gameState.spiritStones - keepStones;
    gameState.spiritStones = keepStones;
    
    // 2. 凡界装备 → 材料（只保留橙色以上）
    const materialsGained = [];
    const qualityOrder = { common: 0, rare: 1, precious: 2, legendary: 3 };
    
    // 背包装备转化
    const newInventory = [];
    for (const item of gameState.inventory) {
        if (item.type === 'treasure' && qualityOrder[item.quality] >= qualityOrder['precious']) {
            materialsGained.push({ name: item.name, quality: item.quality });
        } else {
            newInventory.push(item);
        }
    }
    gameState.inventory = newInventory;
    
    // 装备栏转化
    for (let i = 0; i < gameState.equippedTreasures.length; i++) {
        const equip = gameState.equippedTreasures[i];
        if (equip && qualityOrder[equip.quality] >= qualityOrder['precious']) {
            materialsGained.push({ name: equip.name, quality: equip.quality });
            gameState.equippedTreasures[i] = null;
        }
    }
    
    // 3. 初始化仙界状态
    initializeImmortalState();
    
    // 4. 设置初始仙石
    gameState.immortal.spiritStones = 0; // 仙石独立
    
    // 5. 切换到仙界
    gameState.currentRealm = 'immortal';
    
    // 6. 保留一些凡界资源
    gameState.realm = 1; // 凡界境界回归筑基
    gameState.stage = 0;
    gameState.cultivationProgress = 0;
    
    // 7. 保存日志
    addLog('good', '飞升成功', `历经${gameState.days}天的修炼，终于飞升成仙！`);
    
    saveGame();
    
    // 8. 关闭模态框，显示成功界面
    closeModal();
    showAscensionSuccessScreen();
}

// ===== showAscensionSuccessScreen =====
function showAscensionSuccessScreen() {
    let html = '<div style="padding:30px;text-align:center;">';
    html += '<div style="font-size:64px;animation:pulse 2s infinite;">✨🌟✨</div>';
    html += '<h2 style="color:#ffd700;font-size:24px;margin:20px 0;">恭喜飞升成仙！</h2>';
    html += '<p style="color:#aaa;margin-bottom:20px;">你已突破凡界桎梏，进入仙界篇章</p>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:20px;">';
    html += '<div style="color:#4caf50;margin-bottom:8px;">✅ 保留50%灵石：' + gameState.spiritStones + '</div>';
    html += '<div style="color:#2196f3;margin-bottom:8px;">✅ 境界：地仙境（重新修炼）</div>';
    html += '<div style="color:#9c27b0;">✅ 仙界篇章开启</div>';
    html += '</div>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:20px;">';
    html += '<div style="color:#ffd700;margin-bottom:8px;">📍 当前区域：仙灵谷</div>';
    html += '<div style="color:#aaa;font-size:13px;">仙气充沛，适合初入仙界者修炼</div>';
    html += '</div>';
    
    html += `<button onclick="enterImmortalRealm()" style="width:100%;padding:14px;background:linear-gradient(135deg,#4caf50,#2e7d32);color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">☁️ 进入仙界</button>`;
    html += '</div>';
    
    openModal('飞升', html, '');
}

// ===== enterImmortalRealm =====
function enterImmortalRealm() {
    closeModal();
    saveGame();
    updateDisplay();
    
    // 显示仙界UI
    if (typeof showImmortalMainUI === 'function') {
        showImmortalMainUI();
    }
    
    addLog('good', '进入仙界', '踏入仙界，开始全新的修仙之旅！');
}

// ===== switchRealm =====
function switchRealm(targetRealm) {
    if (targetRealm === gameState.currentRealm) return;
    
    if (targetRealm === 'immortal') {
        if (!gameState.immortal) {
            showToast('尚未飞升，无法进入仙界');
            return;
        }
        gameState.currentRealm = 'immortal';
        addLog('neutral', '切换位面', '进入仙界');
    } else {
        gameState.currentRealm = 'mortal';
        addLog('neutral', '切换位面', '返回凡界');
    }
    
    saveGame();
    updateDisplay();
    
    // 重新渲染UI
    if (typeof renderGameUI === 'function') renderGameUI();
}

// ===== showRealmSwitchButton =====
function showRealmSwitchButton() {
    if (!gameState.immortal) return; // 未飞升不显示
    
    const btn = document.getElementById('realmSwitchBtn');
    if (!btn) return;
    
    if (gameState.currentRealm === 'mortal') {
        btn.textContent = '☁️ 仙界';
        btn.onclick = () => switchRealm('immortal');
    } else {
        btn.textContent = '🏯 凡界';
        btn.onclick = () => switchRealm('mortal');
    }
    
    btn.style.display = 'inline-block';
}

// ===== doFateTask =====
function doFateTask() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('仙缘任务只在仙界可用');
        return;
    }
    
    const today = Math.floor(gameState.days / 1);
    if (gameState.immortal.fateTaskRefreshDay === today) {
        showToast('今日仙缘任务已完成');
        return;
    }
    
    // 仙缘任务奖励
    const reward = Math.floor(100 + Math.random() * 400);
    earnSpiritStones(reward, '每日仙缘任务');
    
    // 20%概率额外奖励
    if (Math.random() < 0.2) {
        const bonus = Math.floor(50 + Math.random() * 150);
        earnSpiritStones(bonus, '天赐福缘');
        showToast(`天赐福缘！额外获得${bonus}仙石`);
    }
    
    gameState.immortal.fateTaskRefreshDay = today;
    gameState.immortal.lastFateTask = gameState.days;
    saveGame();
}

// ===== doCelestialCycle =====
function doCelestialCycle() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('天道轮回只在仙界可用');
        return;
    }
    
    const cycleDay = 7;
    const daysSinceCycle = gameState.days - (gameState.immortal.celestialCycleDay || 0);
    
    if (daysSinceCycle < cycleDay) {
        showToast(`天道轮回每7天一次，还需${cycleDay - daysSinceCycle}天`);
        return;
    }
    
    // 开始天道轮回
    const survivalChance = 0.7 + (gameState.immortal.realm * 0.05);
    
    if (Math.random() < survivalChance) {
        // 成功
        const reward = Math.floor(200 + Math.random() * 600);
        earnSpiritStones(reward, '天道轮回奖励');
        
        // 额外奖励
        if (gameState.immortal.celestialCycleCompleted) {
            const extra = Math.floor(100 + Math.random() * 200);
            earnSpiritStones(extra, '轮回福报');
        }
        
        gameState.immortal.celestialCycleCompleted = true;
        showToast(`天道轮回完成！获得${reward}仙石`);
    } else {
        // 失败
        const loss = Math.floor(gameState.immortal.spiritStones * 0.1);
        gameState.immortal.spiritStones = Math.max(0, gameState.immortal.spiritStones - loss);
        showToast(`天道轮回失败！损失${loss}仙石`);
    }
    
    gameState.immortal.celestialCycleDay = gameState.days;
    saveGame();
    updateDisplay();
}
