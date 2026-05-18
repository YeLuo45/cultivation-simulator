// Auto-generated module: spellCreation.js
'use strict';

// ===== SPELL_CREATION CONSTANTS (V44) =====
const SPELL_CONFIG = {
    maxCustomSpells: 10,
    minCreateLevel: 5,
    essenceSlotCount: 3,
    combineSlotCount: 2,
    spellNameMaxLen: 8
};

const ELEMENTAL_ESSENCES = {
    // 元素精华
    '火': { icon: '🔥', color: '#f44336', effect: { attack: 1.2, scaling: 0.1 } },
    '水': { icon: '💧', color: '#2196f3', effect: { defense: 1.2, hp: 0.15 } },
    '雷': { icon: '⚡', color: '#ffeb3b', effect: { attack: 1.3, cooldown: -0.1 } },
    '风': { icon: '🌪️', color: '#00bcd4', effect: { speed: 1.2, dodge: 0.1 } },
    '土': { icon: '🪨', color: '#795548', effect: { defense: 1.25, hp: 0.1 } },
    '木': { icon: '🌿', color: '#4caf50', effect: { healing: 1.2, regen: 0.1 } },
    '光': { icon: '✨', color: '#ffd700', effect: { attack: 1.15, critRate: 0.15 } },
    '暗': { icon: '🌑', color: '#9c27b0', effect: { attack: 1.25, critDamage: 0.2 } },
    '金': { icon: '🔱', color: '#ffc107', effect: { attack: 1.2, armorPen: 0.15 } },
    '冰': { icon: '❄️', color: '#03a9f4', effect: { attack: 1.15, slow: 0.2 } }
};

const SPELL_TYPES = {
    // 仙法类型
    '攻击': { icon: '⚔️', baseEffect: 'damage', defaultDamage: 100 },
    '防御': { icon: '🛡️', baseEffect: 'shield', defaultShield: 80 },
    '治疗': { icon: '💚', baseEffect: 'heal', defaultHeal: 60 },
    '召唤': { icon: '👥', baseEffect: 'summon', defaultSummonPower: 50 },
    '诅咒': { icon: '💀', baseEffect: 'debuff', defaultDebuff: 40 },
    '辅助': { icon: '🌟', baseEffect: 'buff', defaultBuff: 30 }
};

const SPELL_RARITY = {
    '凡品': { color: '#9e9e9e', multiplier: 1.0, maxLevel: 5 },
    '精品': { color: '#4caf50', multiplier: 1.3, maxLevel: 7 },
    '极品': { color: '#2196f3', multiplier: 1.7, maxLevel: 9 },
    '仙品': { color: '#9c27b0', multiplier: 2.2, maxLevel: 10 },
    '神品': { color: '#ffd700', multiplier: 3.0, maxLevel: 10 }
};

const SPELL_EFFECTS_COMBINATIONS = {
    // 效果组合
    '火+水': { name: '蒸汽爆炸', icon: '💥', effect: 'attack_boost', bonus: 0.3 },
    '火+风': { name: '烈焰风暴', icon: '🌋', effect: 'aoe_damage', bonus: 0.4 },
    '火+土': { name: '熔岩护盾', icon: '🛡️', effect: 'shield_damage', bonus: 0.35 },
    '水+冰': { name: '寒冰冲击', icon: '🧊', effect: 'freeze', bonus: 0.3 },
    '雷+光': { name: '天罚雷劫', icon: '⚡', effect: 'stun', bonus: 0.4 },
    '暗+诅咒': { name: '魂噬', icon: '💀', effect: 'lifeSteal', bonus: 0.35 },
    '木+光': { name: '生命绽放', icon: '🌸', effect: 'heal_over_time', bonus: 0.4 },
    '金+光': { name: '金光护体', icon: '🛡️', effect: 'perfect_shield', bonus: 0.5 },
    '风+雷': { name: '疾风迅雷', icon: '🌪️', effect: 'speed_strike', bonus: 0.45 },
    '水+木': { name: '生命之泉', icon: '💧', effect: 'continuous_heal', bonus: 0.35 }
};

const SPELL_ICONS = ['⚔️', '🛡️', '💚', '👥', '💀', '🌟', '🔥', '💧', '⚡', '🌪️', '🪨', '🌿', '✨', '🌑', '🔱', '❄️', '💥', '🌋', '🧊', '🌸'];

// ===== SPELL_CREATION FUNCTIONS =====

function openSpellCreation() {
    const spells = gameState.customSpells || [];
    const player = gameState;

    if (player.realm < SPELL_CONFIG.minCreateLevel) {
        addLog(`需要境界达到地仙才能创造仙法`, '#f44336');
        return;
    }

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #e91e63;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#e91e63;text-align:center;margin-bottom:10px;">✨ 仙法创造系统</h2>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:15px;">
                <div style="background:rgba(233,30,99,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">已创造</div>
                    <div style="color:#ffd700;font-size:1.3em;font-weight:bold;">${spells.length}/${SPELL_CONFIG.maxCustomSpells}</div>
                </div>
                <div style="background:rgba(233,30,99,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">领悟等级</div>
                    <div style="color:#e91e63;font-size:1.3em;font-weight:bold;">${player.cultivation?.comprehension || 0}</div>
                </div>
                <div style="background:rgba(233,30,99,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">仙法威力</div>
                    <div style="color:#f44336;font-size:1.3em;font-weight:bold;">${calculateTotalSpellPower()}%</div>
                </div>
                <div style="background:rgba(233,30,99,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">精华数量</div>
                    <div style="color:#2196f3;font-size:1.3em;font-weight:bold;">${player.essences ? Object.values(player.essences).reduce((a, b) => a + b, 0) : 0}</div>
                </div>
            </div>

            <button class="btn" style="background:#e91e63;color:white;width:100%;margin-bottom:15px;padding:12px;" onclick="showSpellCreationPanel()">
                ✨ 创造新仙法
            </button>

            <div style="margin-bottom:15px;">
                <h3 style="color:#ffd700;margin-bottom:10px;">📜 已掌握的仙法</h3>`;

    if (spells.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">尚未创造任何仙法</p>`;
    } else {
        html += `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-height:400px;overflow-y:auto;">`;
        spells.forEach((spell, idx) => {
            const rarity = SPELL_RARITY[spell.rarity] || SPELL_RARITY['凡品'];
            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${rarity.color};border-radius:8px;padding:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span style="color:${rarity.color};font-weight:bold;font-size:1.1em;">${spell.icon} ${spell.name}</span>
                        <span style="color:#aaa;margin-left:5px;">${spell.rarity}</span>
                    </div>
                    <div style="color:#aaa;font-size:0.85em;">Lv.${spell.level}</div>
                </div>
                <div style="color:#aaa;font-size:0.85em;margin:5px 0;">类型: ${spell.type} | 冷却: ${spell.cooldown}回合</div>
                <div style="color:#888;font-size:0.8em;margin-bottom:5px;">效果: ${spell.effectDesc}</div>
                <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:5px;">`;
            if (spell.essences) {
                spell.essences.forEach(es => {
                    const esData = ELEMENTAL_ESSENCES[es];
                    html += `<span style="color:${esData?.color || '#fff'};font-size:1.2em;" title="${es}">${esData?.icon || '💎'}</span>`;
                });
            }
            html += `</div>
                <div style="display:flex;gap:5px;">
                    <button class="btn" style="background:#4caf50;color:white;font-size:0.8em;flex:1;" onclick="upgradeCustomSpell(${idx})">升级</button>
                    <button class="btn" style="background:#ff9800;color:white;font-size:0.8em;flex:1;" onclick="castCustomSpell(${idx})">施展</button>
                    <button class="btn" style="background:#f44336;color:white;font-size:0.8em;flex:1;" onclick="forgetCustomSpell(${idx})">遗忘</button>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `</div>
            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
            </div>
        </div>
    </div>`;
    openModal('仙法创造', html, []);
}

function showSpellCreationPanel() {
    const spells = gameState.customSpells || [];

    if (spells.length >= SPELL_CONFIG.maxCustomSpells) {
        addLog('仙法数量已达上限', '#f44336');
        return;
    }

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #e91e63;border-radius:12px;padding:20px;max-width:700px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#e91e63;text-align:center;margin-bottom:15px;">✨ 创造新仙法</h2>

            <div style="margin-bottom:15px;">
                <label style="color:#ffd700;display:block;margin-bottom:5px;">仙法名称（2-8字）</label>
                <input type="text" id="spellNameInput" maxlength="${SPELL_CONFIG.spellNameMaxLen}"
                    placeholder="输入仙法名称"
                    style="width:100%;padding:10px;background:#333;border:1px solid #555;color:#fff;border-radius:5px;">
            </div>

            <div style="margin-bottom:15px;">
                <label style="color:#ffd700;display:block;margin-bottom:5px;">仙法类型</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">`;
    Object.entries(SPELL_TYPES).forEach(([type, data]) => {
        html += `<button class="btn" style="background:#333;color:#fff;border:1px solid #555;" id="spellType_${type}"
                    onclick="selectSpellType('${type}')">${data.icon} ${type}</button>`;
    });
    html += `</div></div>

            <div style="margin-bottom:15px;">
                <label style="color:#ffd700;display:block;margin-bottom:5px;">选择元素精华（0-3个）</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">`;
    Object.entries(ELEMENTAL_ESSENCES).forEach(([elem, data]) => {
        const count = gameState.essences?.[elem] || 0;
        const disabled = count <= 0 ? 'disabled style="opacity:0.3;"' : '';
        html += `<button class="btn" id="essence_${elem}" style="background:${data.color}33;color:${data.color};border:1px solid ${data.color};" onclick="toggleEssence('${elem}')" ${disabled}>
                    ${data.icon} ${elem} (${count})
                </button>`;
    });
    html += `</div></div>

            <div style="margin-bottom:15px;">
                <label style="color:#ffd700;display:block;margin-bottom:5px;">选择图标</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">`;
    SPELL_ICONS.forEach((icon, idx) => {
        html += `<button class="btn" id="spellIcon_${idx}" style="background:#333;color:#fff;font-size:1.2em;padding:5px 10px;" onclick="selectSpellIcon(${idx})">${icon}</button>`;
    });
    html += `</div></div>

            <div id="spellPreview" style="background:rgba(0,0,0,0.5);padding:15px;border-radius:8px;margin-bottom:15px;">
                <h4 style="color:#ffd700;margin-bottom:10px;">📋 仙法预览</h4>
                <div id="previewContent" style="color:#aaa;">请选择仙法类型和元素精华</div>
            </div>

            <div style="display:flex;gap:10px;">
                <button class="btn" style="background:#4caf50;color:white;flex:1;" onclick="confirmSpellCreation()">✨ 创造仙法</button>
                <button class="btn" style="background:#555;color:white;flex:1;" onclick="openSpellCreation()">取消</button>
            </div>
        </div>
    </div>`;
    openModal('创造仙法', html, []);
}

let selectedSpellType = null;
let selectedEssences = [];
let selectedSpellIcon = '⚔️';

function selectSpellType(type) {
    selectedSpellType = type;
    document.querySelectorAll('[id^="spellType_"]').forEach(btn => {
        btn.style.borderColor = '#555';
        btn.style.background = '#333';
    });
    const btn = document.getElementById('spellType_' + type);
    if (btn) {
        btn.style.borderColor = '#e91e63';
        btn.style.background = '#e91e6333';
    }
    updateSpellPreview();
}

function toggleEssence(elem) {
    const idx = selectedEssences.indexOf(elem);
    if (idx >= 0) {
        selectedEssences.splice(idx, 1);
    } else if (selectedEssences.length < SPELL_CONFIG.essenceSlotCount) {
        selectedEssences.push(elem);
    }
    updateSpellPreview();
}

function selectSpellIcon(idx) {
    selectedSpellIcon = SPELL_ICONS[idx];
    document.querySelectorAll('[id^="spellIcon_"]').forEach(btn => {
        btn.style.borderColor = '#555';
        btn.style.background = '#333';
    });
    const btn = document.getElementById('spellIcon_' + idx);
    if (btn) {
        btn.style.borderColor = '#e91e63';
        btn.style.background = '#e91e6333';
    }
    updateSpellPreview();
}

function updateSpellPreview() {
    const preview = document.getElementById('previewContent');
    if (!preview) return;

    let content = '';

    if (!selectedSpellType) {
        preview.innerHTML = '<span style="color:#888;">请选择仙法类型</span>';
        return;
    }

    const typeData = SPELL_TYPES[selectedSpellType];
    content += `<div style="margin-bottom:8px;"><span style="color:#ffd700;">类型:</span> ${typeData.icon} ${selectedSpellType}</div>`;

    // 计算效果
    let attackBonus = 1.0;
    let cooldownMod = 0;
    let defenseBonus = 1.0;
    let hpBonus = 0;
    let healBonus = 1.0;

    const essenceEffects = [];
    selectedEssences.forEach(es => {
        const esData = ELEMENTAL_ESSENCES[es];
        if (esData) {
            essenceEffects.push(`${esData.icon} ${es}`);
            if (esData.effect.attack) attackBonus *= esData.effect.attack;
            if (esData.effect.cooldown) cooldownMod += esData.effect.cooldown;
            if (esData.effect.defense) defenseBonus *= esData.effect.defense;
            if (esData.effect.hp) hpBonus += esData.effect.hp;
            if (esData.effect.healing) healBonus *= esData.effect.healing;
        }
    });

    if (essenceEffects.length > 0) {
        content += `<div style="margin-bottom:8px;"><span style="color:#ffd700;">元素:</span> ${essenceEffects.join(' + ')}</div>`;
    }

    // 基础数值
    let baseValue = typeData.defaultDamage || typeData.defaultShield || typeData.defaultHeal || 50;
    let effectDesc = '';

    switch (typeData.baseEffect) {
        case 'damage':
            effectDesc = `伤害 ${Math.round(baseValue * attackBonus)}`;
            if (cooldownMod !== 0) effectDesc += ` | 冷却 ${Math.round((1 + cooldownMod) * 10) / 10}回合`;
            break;
        case 'shield':
            effectDesc = `护盾 ${Math.round(baseValue * defenseBonus)}`;
            if (hpBonus > 0) effectDesc += ` | 生命上限 +${Math.round(hpBonus * 100)}%`;
            break;
        case 'heal':
            effectDesc = `治疗 ${Math.round(baseValue * healBonus)}`;
            break;
        default:
            effectDesc = typeData.baseEffect;
    }

    // 检测组合效果
    if (selectedEssences.length >= 2) {
        const comboKey = selectedEssences.slice(0, 2).sort().join('+');
        const combo = SPELL_EFFECTS_COMBINATIONS[comboKey];
        if (combo) {
            effectDesc += ` | 🌟 ${combo.name} (+${Math.round(combo.bonus * 100)}%)`;
        }
    }

    content += `<div style="margin-bottom:8px;"><span style="color:#ffd700;">效果:</span> ${effectDesc}</div>`;

    // 稀有度
    const rarity = selectedEssences.length === 0 ? '凡品'
        : selectedEssences.length === 1 ? '精品'
        : selectedEssences.length === 2 ? '极品'
        : '仙品';
    const rarityData = SPELL_RARITY[rarity];
    content += `<div style="margin-top:8px;"><span style="color:${rarityData.color};font-weight:bold;">${rarity}</span></div>`;

    preview.innerHTML = content;
}

function confirmSpellCreation() {
    const nameInput = document.getElementById('spellNameInput');
    const name = nameInput?.value?.trim();

    if (!name || name.length < 2) {
        addLog('请输入至少2个字的仙法名称', '#f44336');
        return;
    }

    if (!selectedSpellType) {
        addLog('请选择仙法类型', '#f44336');
        return;
    }

    // 检查是否已有同名仙法
    const spells = gameState.customSpells || [];
    if (spells.some(s => s.name === name)) {
        addLog('已有同名仙法', '#f44336');
        return;
    }

    // 消耗元素精华
    const essenceCost = selectedEssences.length;
    if (essenceCost > 0) {
        selectedEssences.forEach(es => {
            if (gameState.essences && gameState.essences[es] > 0) {
                gameState.essences[es]--;
            }
        });
    }

    // 计算数值
    const typeData = SPELL_TYPES[selectedSpellType];
    let baseValue = typeData.defaultDamage || typeData.defaultShield || typeData.defaultHeal || 50;
    let power = baseValue;
    let cooldown = 5;

    const rarity = selectedEssences.length === 0 ? '凡品'
        : selectedEssences.length === 1 ? '精品'
        : selectedEssences.length === 2 ? '极品'
        : '仙品';
    const rarityData = SPELL_RARITY[rarity];

    // 计算效果加成
    let attackBonus = 1.0;
    let cooldownMod = 0;
    selectedEssences.forEach(es => {
        const esData = ELEMENTAL_ESSENCES[es];
        if (esData && esData.effect.attack) attackBonus *= esData.effect.attack;
        if (esData && esData.effect.cooldown) cooldownMod += esData.effect.cooldown;
    });

    power = Math.round(baseValue * attackBonus * rarityData.multiplier);
    cooldown = Math.max(1, Math.round((1 + cooldownMod) * 5));

    let effectDesc = '';
    switch (typeData.baseEffect) {
        case 'damage':
            effectDesc = `伤害 ${power}`;
            if (cooldownMod !== 0) effectDesc += ` | 冷却${cooldown}回合`;
            break;
        case 'shield':
            effectDesc = `护盾 ${power}`;
            break;
        case 'heal':
            effectDesc = `治疗 ${power}`;
            break;
        case 'buff':
            effectDesc = `辅助效果`;
            break;
        case 'debuff':
            effectDesc = `诅咒效果`;
            break;
        case 'summon':
            effectDesc = `召唤威力 ${power}`;
            break;
        default:
            effectDesc = typeData.baseEffect;
    }

    // 检测组合效果
    if (selectedEssences.length >= 2) {
        const comboKey = selectedEssences.slice(0, 2).sort().join('+');
        const combo = SPELL_EFFECTS_COMBINATIONS[comboKey];
        if (combo) {
            effectDesc += ` | 🌟 ${combo.name}`;
        }
    }

    const newSpell = {
        name: name,
        icon: selectedSpellIcon,
        type: selectedSpellType,
        essences: [...selectedEssences],
        rarity: rarity,
        level: 1,
        power: power,
        cooldown: cooldown,
        effectDesc: effectDesc,
        experience: 0,
        createdAt: Date.now()
    };

    if (!gameState.customSpells) gameState.customSpells = [];
    gameState.customSpells.push(newSpell);

    addLog(`✨ 创造仙法「${name}」成功！${rarity}级`, '#e91e63');

    // 重置选择
    selectedSpellType = null;
    selectedEssences = [];
    selectedSpellIcon = '⚔️';

    updateDisplay();
    openSpellCreation();
}

function upgradeCustomSpell(idx) {
    const spell = gameState.customSpells?.[idx];
    if (!spell) return;

    const rarityData = SPELL_RARITY[spell.rarity];
    if (spell.level >= rarityData.maxLevel) {
        addLog('已达等级上限', '#f44336');
        return;
    }

    const upgradeCost = Math.floor(1000 * Math.pow(1.5, spell.level));
    const herbCost = Math.floor(10 * Math.pow(1.3, spell.level));

    if (gameState.spiritStones < upgradeCost || (gameState.herbs || 0) < herbCost) {
        addLog('资源不足', '#f44336');
        return;
    }

    gameState.spiritStones -= upgradeCost;
    gameState.herbs = (gameState.herbs || 0) - herbCost;

    spell.level++;
    spell.power = Math.round(spell.power * 1.15);
    spell.experience = 0;

    addLog(`⬆️ 仙法「${spell.name}」升级至 Lv.${spell.level}！`, '#4caf50');
    updateDisplay();
    openSpellCreation();
}

function castCustomSpell(idx) {
    const spell = gameState.customSpells?.[idx];
    if (!spell) return;

    // 检查冷却
    if (spell.lastCastTime && Date.now() - spell.lastCastTime < spell.cooldown * 1000) {
        addLog('仙法冷却中', '#f44336');
        return;
    }

    spell.lastCastTime = Date.now();

    // 施展效果
    const typeData = SPELL_TYPES[spell.type];
    switch (typeData.baseEffect) {
        case 'damage':
            // 对战斗中的敌人造成伤害
            if (gameState.combat && gameState.combat.enemy) {
                const damage = spell.power;
                gameState.combat.enemy.hp = Math.max(0, gameState.combat.enemy.hp - damage);
                addLog(`✨ 施展「${spell.name}」，造成 ${damage} 点伤害！`, '#f44336');
            } else {
                addLog(`✨ 施展「${spell.name}」，威力 ${spell.power}！`, '#e91e63');
            }
            break;
        case 'shield':
            if (!gameState.buffs) gameState.buffs = {};
            gameState.buffs.shield = (gameState.buffs.shield || 0) + spell.power;
            addLog(`✨ 施展「${spell.name}」，获得 ${spell.power} 点护盾！`, '#2196f3');
            break;
        case 'heal':
            const healAmount = Math.round(spell.power * (1 + (gameState.cultivation?.comprehension || 0) * 0.01));
            gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmount);
            addLog(`✨ 施展「${spell.name}」，恢复 ${healAmount} 点生命！`, '#4caf50');
            break;
        default:
            addLog(`✨ 施展「${spell.name}」！`, '#e91e63');
    }

    updateDisplay();
}

function forgetCustomSpell(idx) {
    const spell = gameState.customSpells?.[idx];
    if (!spell) return;

    // 返还部分精华
    if (spell.essences && gameState.essences) {
        spell.essences.forEach(es => {
            gameState.essences[es] = (gameState.essences[es] || 0) + 1;
        });
    }

    gameState.customSpells.splice(idx, 1);
    addLog(`💨 遗忘仙法「${spell.name}」`, '#9e9e9e');
    updateDisplay();
    openSpellCreation();
}

function calculateTotalSpellPower() {
    const spells = gameState.customSpells || [];
    if (spells.length === 0) return 0;

    let total = 0;
    spells.forEach(spell => {
        const rarityData = SPELL_RARITY[spell.rarity];
        total += spell.power * rarityData.multiplier * spell.level;
    });

    return Math.round(total / spells.length);
}

function processDailySpellPractice() {
    const spells = gameState.customSpells || [];

    // 修炼加成
    if (spells.length > 0 && gameState.cultivation) {
        const practiceBonus = spells.length * 2;
        if (!gameState.cultivation.comprehension) gameState.cultivation.comprehension = 0;
        gameState.cultivation.comprehension += practiceBonus;
    }

    // 仙法自动领悟（每日小概率触发）
    if (gameState.cultivation?.comprehension >= 50 && Math.random() < 0.1) {
        // 随机领悟一个元素
        const elements = Object.keys(ELEMENTAL_ESSENCES);
        const randomElem = elements[Math.floor(Math.random() * elements.length)];
        if (!gameState.essences) gameState.essences = {};
        gameState.essences[randomElem] = (gameState.essences[randomElem] || 0) + 1;
        addLog(`✨ 修炼时领悟了「${randomElem}」元素精华！`, '#e91e63');
    }
}