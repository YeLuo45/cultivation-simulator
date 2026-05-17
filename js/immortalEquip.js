// Auto-generated module: immortalEquip.js
'use strict';

// ===== IMMORTAL_EQUIP_QUALITIES =====
const IMMORTAL_EQUIP_QUALITIES = {
    1: { name: '仙器', color: '#2196f3', multiplier: 1.5, colorHex: '蓝色' },
    2: { name: '灵仙器', color: '#9c27b0', multiplier: 2.0, colorHex: '紫色' },
    3: { name: '神仙器', color: '#ff9800', multiplier: 3.0, colorHex: '橙色' },
    4: { name: '混沌器', color: '#ffd700', multiplier: 5.0, colorHex: '金色' }
};

// ===== IMMORTAL_EQUIP_SLOTS =====
const IMMORTAL_EQUIP_SLOTS = {
    head: { name: '仙冠', icon: '👑', pos: 0 },
    body: { name: '仙袍', icon: '👘', pos: 1 },
    foot: { name: '仙履', icon: '👟', pos: 2 },
    weapon: { name: '仙剑', icon: '⚔️', pos: 3 },
    shield: { name: '仙盾', icon: '🛡️', pos: 4 },
    accessory: { name: '仙佩', icon: '📿', pos: 5 }
};

// ===== IMMORTAL_EQUIP_SETS =====
const IMMORTAL_EQUIP_SETS = {
    '仙灵套装': {
        pieces: ['仙冠-仙灵', '仙袍-仙灵', '仙履-仙灵'],
        setBonus: { effect: 'cultivationSpeed', value: 0.2 },
        description: '2件：仙气修炼效率+20%'
    },
    '战神套装': {
        pieces: ['仙剑-战神', '仙盾-战神', '仙冠-战神', '仙袍-战神'],
        setBonus: { effect: 'attack', value: 0.5 },
        description: '4件：攻击+50%，仙兽参战伤害+30%'
    },
    '不死套装': {
        pieces: ['仙冠-不死', '仙袍-不死', '仙履-不死', '仙佩-不死'],
        setBonus: { effect: 'invincible', value: 3, cooldown: 60 },
        description: '4件：致命伤害时无敌3秒，CD60秒'
    },
    '混沌套装': {
        pieces: ['仙冠-混沌', '仙袍-混沌', '仙履-混沌', '仙剑-混沌', '仙盾-混沌', '仙佩-混沌'],
        setBonus: { effect: 'allStats', value: 1.0 },
        description: '6件：全属性+100%，仙法伤害+100%'
    }
};

// ===== EQUIPMENT_BASE_STATS =====
const EQUIPMENT_BASE_STATS = {
    attack: 100,
    defense: 80,
    hp: 500,
    speed: 50,
    crit: 10,
    resist: 15
};

// ===== EQUIPMENT_AFFIX_TYPES =====
const EQUIPMENT_AFFIX_TYPES = [
    { name: 'attack', display: '攻击', min: 5, max: 30, rarity: 'common' },
    { name: 'defense', display: '防御', min: 5, max: 25, rarity: 'common' },
    { name: 'hp', display: '生命', min: 20, max: 100, rarity: 'common' },
    { name: 'crit', display: '暴击', min: 3, max: 15, rarity: 'uncommon' },
    { name: 'resist', display: '抗性', min: 3, max: 12, rarity: 'uncommon' },
    { name: 'speed', display: '速度', min: 2, max: 10, rarity: 'uncommon' },
    { name: 'cultivate_qi_rate', display: '灵气效率', min: 0.05, max: 0.15, rarity: 'rare', isPercent: true },
    { name: 'breakthrough_boost', display: '突破加成', min: 0.05, max: 0.10, rarity: 'rare', isPercent: true },
    { name: 'tribulation_damage_reduce', display: '渡劫减伤', min: 0.05, max: 0.15, rarity: 'epic', isPercent: true },
    { name: 'all_stats', display: '全属性', min: 0.03, max: 0.08, rarity: 'legendary', isPercent: true }
];

const AFFIX_RARITY_COLORS = {
    common: '#aaa',
    uncommon: '#4CAF50',
    rare: '#2196f3',
    epic: '#9c27b0',
    legendary: '#ff9800'
};

// ===== generateAffix =====
function generateAffix(quality, tier) {
    // 根据品质和难度等级筛选可用词条
    const availableAffixes = EQUIPMENT_AFFIX_TYPES.filter(a => {
        if (tier === 0) return a.rarity === 'common' || a.rarity === 'uncommon';
        if (tier === 1) return a.rarity !== 'legendary';
        return true;  // tier >= 2 所有词条
    });
    
    const affix = availableAffixes[Math.floor(Math.random() * availableAffixes.length)];
    const value = affix.min + Math.random() * (affix.max - affix.min);
    
    return {
        name: affix.name,
        display: affix.display,
        value: affix.isPercent ? parseFloat(value.toFixed(2)) : Math.floor(value),
        rarity: affix.rarity,
        isPercent: affix.isPercent || false,
        icon: affix.isPercent ? '%' : ''
    };
}

// ===== calculateEquipScore =====
function calculateEquipScore(equip) {
    if (!equip) return 0;
    let score = 0;
    
    // 基础属性评分
    const statWeights = { attack: 2, defense: 1.5, hp: 0.5, speed: 1, crit: 1.5, resist: 1 };
    for (const stat in equip.stats) {
        score += (equip.stats[stat] || 0) * (statWeights[stat] || 1);
    }
    
    // 词条加成评分
    if (equip.affixes) {
        equip.affixes.forEach(affix => {
            const rarityMultiplier = { common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5 };
            score += affix.value * (rarityMultiplier[affix.rarity] || 1);
        });
    }
    
    // 强化等级加成
    if (equip.enhancementLevel > 0) {
        score *= (1 + equip.enhancementLevel * 0.1);
    }
    
    // 精炼等级加成
    if (equip.refinementLevel > 0) {
        score *= (1 + equip.refinementLevel * 0.05);
    }
    
    return Math.floor(score);
}

// ===== generateImmortalEquip =====
function generateImmortalEquip(slot, quality) {
    const qualityData = IMMORTAL_EQUIP_QUALITIES[quality];
    const slotData = IMMORTAL_EQUIP_SLOTS[slot];
    
    const equip = {
        uid: 'equip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        slot: slot,
        name: `${slotData.name}-${qualityData.name}`,
        quality: quality,
        qualityName: qualityData.name,
        icon: slotData.icon,
        stats: {},
        setName: null, // 套装名
        refinationLevel: 0,  // V36 精炼等级 0-12
        enhancementLevel: 0,  // V36 强化等级 0-15
        affixes: []           // V36 随机词条
    };
    
    // 根据品质生成属性
    const multiplier = qualityData.multiplier;
    for (const stat in EQUIPMENT_BASE_STATS) {
        equip.stats[stat] = Math.floor(EQUIPMENT_BASE_STATS[stat] * multiplier * (0.8 + Math.random() * 0.4));
    }
    
    // V36 根据品质生成1-3条随机词条
    const affixCount = quality + Math.floor(Math.random() * quality);
    const tier = Math.min(2, Math.floor(quality / 2));
    for (let i = 0; i < affixCount; i++) {
        equip.affixes.push(generateAffix(quality, tier));
    }
    
    // 30%概率生成套装
    if (Math.random() < 0.3) {
        const setNames = Object.keys(IMMORTAL_EQUIP_SETS);
        equip.setName = setNames[Math.floor(Math.random() * setNames.length)];
    }
    
    return equip;
}

// ===== enhanceEquipment =====
function enhanceEquipment(slot) {
    const equip = gameState.immortalEquipment[slot];
    if (!equip) {
        showToast('该部位没有装备');
        return;
    }
    
    if (equip.enhancementLevel >= 15) {
        showToast('已达强化上限+15');
        return;
    }
    
    const level = equip.enhancementLevel;
    const baseCost = 500 * Math.pow(1.8, level);
    const cost = Math.floor(baseCost);
    
    if (gameState.immortal.spiritStones < cost) {
        showToast(`强化需要${cost}灵石`);
        return;
    }
    
    gameState.immortal.spiritStones -= cost;
    gameState.equipmentForgeCount++;
    
    // 成功率：+1:100%, +5:80%, +10:50%, +15:20%
    const successRates = [100, 100, 95, 90, 85, 80, 75, 70, 65, 60, 50, 40, 30, 25, 20, 15];
    const successRate = successRates[level + 1] || 20;
    const roll = Math.random() * 100;
    
    if (roll < successRate) {
        equip.enhancementLevel++;
        addLog('good', '装备强化', `强化成功！${equip.name}强化到+${equip.enhancementLevel}`);
        showToast(`强化成功！+${equip.enhancementLevel}`);
    } else {
        equip.enhancementLevel = Math.max(0, equip.enhancementLevel - 1);
        addLog('warn', '装备强化', `强化失败，${equip.name}降为+${equip.enhancementLevel}`);
        showToast(`强化失败，降为+${equip.enhancementLevel}`);
    }
    
    saveGame();
    showImmortalEquipPanel();
}

// ===== refineEquipment =====
function refineEquipment(slot) {
    const equip = gameState.immortalEquipment[slot];
    if (!equip) {
        showToast('该部位没有装备');
        return;
    }
    
    if (equip.refinementLevel >= 12) {
        showToast('已达精炼上限+12');
        return;
    }
    
    const level = equip.refinementLevel;
    const baseCost = 1000 * Math.pow(2, level);
    const cost = Math.floor(baseCost);
    
    if (gameState.immortal.spiritStones < cost) {
        showToast(`精炼需要${cost}灵石`);
        return;
    }
    
    gameState.immortal.spiritStones -= cost;
    gameState.equipmentForgeCount++;
    equip.refinementLevel++;
    
    // 精炼必定成功（消耗同名装备可以100%成功，这里简化处理）
    addLog('good', '装备精炼', `精炼成功！${equip.name}精炼到+${equip.refinementLevel}`);
    showToast(`精炼成功！+${equip.refinementLevel}`);
    
    saveGame();
    showImmortalEquipPanel();
}

// ===== equipImmortalItem =====
function equipImmortalItem(equip) {
    const slot = equip.slot;
    const oldEquip = gameState.immortalEquipment[slot];
    
    gameState.immortalEquipment[slot] = equip;
    
    addLog('good', '装备仙器', `装备【${equip.name}】`);
    saveGame();
    updateDisplay();
}

// ===== unequipImmortalItem =====
function unequipImmortalItem(slot) {
    const equip = gameState.immortalEquipment[slot];
    if (!equip) return;
    
    // 卸下到背包（暂时不实现背包系统，这里直接消失）
    addLog('neutral', '卸下仙器', `卸下了${equip.name}`);
    gameState.immortalEquipment[slot] = null;
    saveGame();
    updateDisplay();
}

// ===== calculateEquipSetBonus =====
function calculateEquipSetBonus() {
    const equipped = gameState.immortalEquipment;
    const bonuses = {};
    
    // 统计各套装件数
    const setCounts = {};
    for (const slot in equipped) {
        if (equipped[slot] && equipped[slot].setName) {
            setCounts[equipped[slot].setName] = (setCounts[equipped[slot].setName] || 0) + 1;
        }
    }
    
    // 计算套装效果
    for (const setName in setCounts) {
        const setData = IMMORTAL_EQUIP_SETS[setName];
        if (setData) {
            const count = setCounts[setName];
            // 检查是否满足套装条件
            for (let i = 0; i < setData.pieces.length; i++) {
                const requiredPieces = i + 2; // 2件起效
                if (count >= requiredPieces) {
                    bonuses[setName] = setData.setBonus;
                }
            }
        }
    }
    
    return bonuses;
}

// ===== getImmortalEquipStats =====
function getImmortalEquipStats() {
    let stats = { attack: 0, defense: 0, hp: 0, speed: 0, crit: 0, resist: 0 };
    const equip = gameState.immortalEquipment;
    
    for (const slot in equip) {
        if (equip[slot]) {
            for (const stat in equip[slot].stats) {
                stats[stat] += equip[slot].stats[stat];
            }
        }
    }
    
    // 应用套装加成
    const setBonuses = calculateEquipSetBonus();
    for (const setName in setBonuses) {
        const bonus = setBonuses[setName];
        if (bonus.effect === 'allStats') {
            stats.attack *= (1 + bonus.value);
            stats.defense *= (1 + bonus.value);
            stats.hp *= (1 + bonus.value);
        }
    }
    
    return stats;
}

// ===== showImmortalEquipPanel =====
function showImmortalEquipPanel() {
    let html = '<div style="padding:16px;">';
    html += '<h3 style="color:#ffd700;text-align:center;margin-bottom:16px;">⚔️ 飞升装备</h3>';
    
    // 装备栏
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">';
    
    for (const slot in IMMORTAL_EQUIP_SLOTS) {
        const slotData = IMMORTAL_EQUIP_SLOTS[slot];
        const equip = gameState.immortalEquipment[slot];
        
        let bgColor = '#252540';
        let borderColor = '#444';
        
        if (equip) {
            const qualityData = IMMORTAL_EQUIP_QUALITIES[equip.quality];
            bgColor = qualityData.color + '22';
            borderColor = qualityData.color;
        }
        
        html += `<div style="background:${bgColor};border:2px solid ${borderColor};border-radius:8px;padding:10px;text-align:center;cursor:pointer;" onclick="showEquipSlotDetail('${slot}')">`;
        html += `<div style="font-size:24px;">${slotData.icon}</div>`;
        
        if (equip) {
            html += `<div style="color:#fff;font-size:11px;">${equip.name}</div>`;
            html += `<div style="color:${IMMORTAL_EQUIP_QUALITIES[equip.quality].color};font-size:10px;">${equip.qualityName}</div>`;
        } else {
            html += `<div style="color:#666;font-size:11px;">${slotData.name}</div>`;
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    
    // 当前属性
    const stats = getImmortalEquipStats();
    html += '<div style="background:#1a1a2e;padding:12px;border-radius:8px;margin-bottom:12px;">';
    html += '<div style="color:#ffd700;font-size:12px;margin-bottom:8px;">装备加成</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;">';
    html += `<div><div style="color:#f44336;">${stats.attack}</div><div style="color:#666;font-size:10px;">攻击</div></div>`;
    html += `<div><div style="color:#2196f3;">${stats.defense}</div><div style="color:#666;font-size:10px;">防御</div></div>`;
    html += `<div><div style="color:#4caf50;">${stats.hp}</div><div style="color:#666;font-size:10px;">生命</div></div>`;
    html += `<div><div style="color:#ff9800;">${stats.speed}</div><div style="color:#666;font-size:10px;">速度</div></div>`;
    html += `<div><div style="color:#9c27b0;">${stats.crit}%</div><div style="color:#666;font-size:10px;">暴击</div></div>`;
    html += `<div><div style="color:#00bcd4;">${stats.resist}%</div><div style="color:#666;font-size:10px;">抗性</div></div>`;
    html += '</div></div>';
    
    // 套装效果
    const setBonuses = calculateEquipSetBonus();
    if (Object.keys(setBonuses).length > 0) {
        html += '<div style="background:#1a1a2e;padding:12px;border-radius:8px;margin-bottom:12px;">';
        html += '<div style="color:#ffd700;font-size:12px;margin-bottom:8px;">套装效果</div>';
        
        for (const setName in setBonuses) {
            const setData = IMMORTAL_EQUIP_SETS[setName];
            const bonus = setBonuses[setName];
            html += `<div style="color:#aaa;font-size:11px;margin-bottom:4px;">【${setName}】${setData.description}</div>`;
        }
        html += '</div>';
    }
    
    // 购买装备（仙界商店）
    html += '<div style="border-top:1px solid #333;padding-top:12px;margin-top:8px;">';
    html += '<div style="color:#aaa;font-size:12px;margin-bottom:8px;">仙界商店</div>';
    
    const buyOptions = [
        { slot: 'weapon', quality: 1, price: 1000, name: '仙器' },
        { slot: 'weapon', quality: 2, price: 5000, name: '灵仙器' },
        { slot: 'weapon', quality: 3, price: 20000, name: '神仙器' }
    ];
    
    for (const opt of buyOptions) {
        const qualityData = IMMORTAL_EQUIP_QUALITIES[opt.quality];
        const slotData = IMMORTAL_EQUIP_SLOTS[opt.slot];
        
        html += `<div style="background:#252540;padding:10px;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">`;
        html += `<div style="display:flex;align-items:center;gap:10px;">`;
        html += `<span style="font-size:20px;">${slotData.icon}</span>`;
        html += `<div><div style="color:${qualityData.color};">${qualityData.name}${slotData.name}</div><div style="color:#888;font-size:10px;">${opt.price}💎</div></div>`;
        html += '</div>';
        
        const canBuy = gameState.immortal.spiritStones >= opt.price;
        html += `<button onclick="buyImmortalEquip('${opt.slot}', ${opt.quality}, ${opt.price})" ${canBuy ? '' : 'disabled'} style="padding:4px 10px;background:${canBuy ? '#2e7d32' : '#444'};color:${canBuy ? '#fff' : '#666'};border:none;border-radius:4px;cursor:${canBuy ? 'pointer' : 'not-allowed'};font-size:11px;">购买</button>`;
        html += '</div>';
    }
    
    html += '</div>';
    
    html += `<button onclick="closeModal()" style="width:100%;margin-top:16px;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>`;
    html += '</div>';
    
    openModal('飞升装备', html, '');
}

// ===== buyImmortalEquip =====
function buyImmortalEquip(slot, quality, price) {
    if (!spendSpiritStones(price, '购买飞升装备')) {
        return;
    }
    
    const equip = generateImmortalEquip(slot, quality);
    equipImmortalItem(equip);
    showToast(`购买成功！获得【${equip.name}】`);
    closeModal();
    showImmortalEquipPanel();
}

// ===== showEquipSlotDetail =====
function showEquipSlotDetail(slot) {
    const equip = gameState.immortalEquipment[slot];
    if (!equip) {
        showToast('该部位暂无装备');
        return;
    }
    
    const qualityData = IMMORTAL_EQUIP_QUALITIES[equip.quality];
    const slotData = IMMORTAL_EQUIP_SLOTS[slot];
    const score = calculateEquipScore(equip);
    
    let html = '<div style="padding:16px;">';
    html += `<div style="text-align:center;">`;
    html += `<div style="font-size:48px;">${equip.icon}</div>`;
    html += `<div style="color:${qualityData.color};font-size:18px;font-weight:bold;margin-top:8px;">${equip.name}</div>`;
    html += `<div style="color:#888;font-size:12px;">${slotData.name}位</div>`;
    if (equip.setName) {
        html += `<div style="color:#ffd700;font-size:12px;margin-top:4px;">套装：${equip.setName}</div>`;
    }
    html += `<div style="color:#aaa;font-size:11px;margin-top:4px;">评分：${score}</div>`;
    html += '</div>';
    
    // V36 强化和精炼等级
    html += '<div style="display:flex;gap:10px;margin-top:12px;">';
    if (equip.enhancementLevel > 0) {
        html += `<span style="background:#333;padding:3px 8px;border-radius:4px;color:#ff9800;font-size:11px;">强化+${equip.enhancementLevel}</span>`;
    }
    if (equip.refinementLevel > 0) {
        html += `<span style="background:#333;padding:3px 8px;border-radius:4px;color:#9c27b0;font-size:11px;">精炼+${equip.refinementLevel}</span>`;
    }
    html += '</div>';
    
    html += '<div style="margin-top:16px;">';
    html += '<div style="color:#aaa;font-size:12px;margin-bottom:8px;">基础属性：</div>';
    for (const stat in equip.stats) {
        const statNames = { attack: '攻击', defense: '防御', hp: '生命', speed: '速度', crit: '暴击', resist: '抗性' };
        let value = equip.stats[stat];
        // 精炼加成
        if (equip.refinementLevel > 0) {
            value = Math.floor(value * (1 + equip.refinementLevel * 0.05));
        }
        html += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #333;">`;
        html += `<span style="color:#888;">${statNames[stat]}</span>`;
        html += `<span style="color:#fff;">+${value}</span>`;
        html += '</div>';
    }
    html += '</div>';
    
    // V36 词条显示
    if (equip.affixes && equip.affixes.length > 0) {
        html += '<div style="margin-top:16px;">';
        html += '<div style="color:#aaa;font-size:12px;margin-bottom:8px;">词条：</div>';
        equip.affixes.forEach(affix => {
            const color = AFFIX_RARITY_COLORS[affix.rarity] || '#aaa';
            const valueStr = affix.isPercent ? `${(affix.value * 100).toFixed(0)}%` : affix.value;
            html += `<div style="display:flex;justify-content:space-between;padding:3px 0;">`;
            html += `<span style="color:${color};font-size:11px;">◆ ${affix.display}</span>`;
            html += `<span style="color:${color};font-size:11px;">+${valueStr}</span>`;
            html += '</div>';
        });
        html += '</div>';
    }
    
    // V36 强化和精炼按钮
    const enhanceCost = Math.floor(500 * Math.pow(1.8, equip.enhancementLevel));
    const refineCost = Math.floor(1000 * Math.pow(2, equip.refinementLevel));
    
    html += '<div style="margin-top:16px;display:flex;gap:8px;">';
    if (equip.enhancementLevel < 15) {
        html += `<button onclick="enhanceEquipment('${slot}')" ${gameState.immortal.spiritStones >= enhanceCost ? '' : 'disabled'} style="flex:1;padding:8px;background:${gameState.immortal.spiritStones >= enhanceCost ? '#e65100' : '#444'};color:#fff;border:none;border-radius:6px;cursor:${gameState.immortal.spiritStones >= enhanceCost ? 'pointer' : 'not-allowed'};font-size:12px;">强化+${equip.enhancementLevel + 1}(${enhanceCost}💎)</button>`;
    }
    if (equip.refinementLevel < 12) {
        html += `<button onclick="refineEquipment('${slot}')" ${gameState.immortal.spiritStones >= refineCost ? '' : 'disabled'} style="flex:1;padding:8px;background:${gameState.immortal.spiritStones >= refineCost ? '#6a1b9a' : '#444'};color:#fff;border:none;border-radius:6px;cursor:${gameState.immortal.spiritStones >= refineCost ? 'pointer' : 'not-allowed'};font-size:12px;">精炼+${equip.refinementLevel + 1}(${refineCost}💎)</button>`;
    }
    html += '</div>';
    
    html += `<button onclick="unequipImmortalItem('${slot}');closeModal();" style="width:100%;margin-top:16px;padding:10px;background:#c62828;color:white;border:none;border-radius:6px;cursor:pointer;">卸下</button>`;
    html += `<button onclick="closeModal()" style="width:100%;margin-top:8px;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>`;
    html += '</div>';
    
    openModal('装备详情', html, '');
}
