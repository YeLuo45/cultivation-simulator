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
        refinationLevel: 0
    };
    
    // 根据品质生成属性
    const multiplier = qualityData.multiplier;
    for (const stat in EQUIPMENT_BASE_STATS) {
        equip.stats[stat] = Math.floor(EQUIPMENT_BASE_STATS[stat] * multiplier * (0.8 + Math.random() * 0.4));
    }
    
    // 30%概率生成套装
    if (Math.random() < 0.3) {
        const setNames = Object.keys(IMMORTAL_EQUIP_SETS);
        equip.setName = setNames[Math.floor(Math.random() * setNames.length)];
    }
    
    return equip;
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
    
    let html = '<div style="padding:16px;">';
    html += `<div style="text-align:center;">`;
    html += `<div style="font-size:48px;">${equip.icon}</div>`;
    html += `<div style="color:${qualityData.color};font-size:18px;font-weight:bold;margin-top:8px;">${equip.name}</div>`;
    html += `<div style="color:#888;font-size:12px;">${slotData.name}位</div>`;
    if (equip.setName) {
        html += `<div style="color:#ffd700;font-size:12px;margin-top:4px;">套装：${equip.setName}</div>`;
    }
    html += '</div>';
    
    html += '<div style="margin-top:16px;">';
    html += '<div style="color:#aaa;font-size:12px;margin-bottom:8px;">属性：</div>';
    for (const stat in equip.stats) {
        const statNames = { attack: '攻击', defense: '防御', hp: '生命', speed: '速度', crit: '暴击', resist: '抗性' };
        html += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #333;">`;
        html += `<span style="color:#888;">${statNames[stat]}</span>`;
        html += `<span style="color:#fff;">+${equip.stats[stat]}</span>`;
        html += '</div>';
    }
    html += '</div>';
    
    html += `<button onclick="unequipImmortalItem('${slot}');closeModal();" style="width:100%;margin-top:16px;padding:10px;background:#c62828;color:white;border:none;border-radius:6px;cursor:pointer;">卸下</button>`;
    html += `<button onclick="closeModal()" style="width:100%;margin-top:8px;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>`;
    html += '</div>';
    
    openModal('装备详情', html, '');
}
