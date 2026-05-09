// Auto-generated module: immortalSkill.js
'use strict';

// ===== IMMORTAL_SKILLS_DATA =====
const IMMORTAL_SKILLS_DATA = {
    '万剑归宗': {
        type: '剑仙法',
        icon: '⚔️',
        baseDamage: 200,
        cooldown: 5,
        maxLevel: 10,
        description: '召唤万剑攻击目标，造成大量伤害',
        upgradeCost: { spiritStones: 500, herbs: 5 },
        damageType: 'attack'
    },
    '金刚不坏': {
        type: '体仙法',
        icon: '🛡️',
        baseDamage: 0,
        cooldown: 8,
        maxLevel: 10,
        description: '进入金刚不坏状态，防御大幅提升，免疫控制',
        upgradeCost: { spiritStones: 500, herbs: 5 },
        damageType: 'defense'
    },
    '天地大同': {
        type: '法仙法',
        icon: '🌍',
        baseDamage: 150,
        cooldown: 6,
        maxLevel: 10,
        description: '仙法伤害+150%，范围攻击',
        upgradeCost: { spiritStones: 600, herbs: 6 },
        damageType: 'AoE'
    },
    '撒豆成兵': {
        type: '召唤仙法',
        icon: '👥',
        baseDamage: 80,
        cooldown: 10,
        maxLevel: 10,
        description: '召唤仙兵助战，仙兵继承部分属性',
        upgradeCost: { spiritStones: 700, herbs: 8 },
        damageType: 'summon'
    },
    '周天星斗': {
        type: '阵法仙法',
        icon: '⭐',
        baseDamage: 0,
        cooldown: 15,
        maxLevel: 10,
        description: '布置周天星斗阵，阵内队友属性+50%',
        upgradeCost: { spiritStones: 800, herbs: 10 },
        damageType: 'buff'
    }
};

// ===== IMMORTAL_SKILL_TYPES =====
const IMMORTAL_SKILL_TYPES = {
    '剑仙法': { color: '#f44336', bonusType: 'attack', bonusValue: 0.2 },
    '体仙法': { color: '#4caf50', bonusType: 'defense', bonusValue: 0.2 },
    '法仙法': { color: '#2196f3', bonusType: 'spellDamage', bonusValue: 0.15 },
    '召唤仙法': { color: '#9c27b0', bonusType: 'summon', bonusValue: 0.1 },
    '阵法仙法': { color: '#ff9800', bonusType: 'teamBuff', bonusValue: 0.05 }
};

// ===== learnImmortalSkill =====
function learnImmortalSkill(skillName) {
    const skillData = IMMORTAL_SKILLS_DATA[skillName];
    if (!skillData) return false;
    
    // 检查是否已学会
    if (gameState.immortalSkills.find(s => s.name === skillName)) {
        showToast('已学会此仙法');
        return false;
    }
    
    const skill = {
        uid: 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: skillName,
        type: skillData.type,
        level: 1,
        maxLevel: skillData.maxLevel,
        cooldown: skillData.cooldown,
        currentCooldown: 0,
        damage: skillData.baseDamage,
        description: skillData.description
    };
    
    gameState.immortalSkills.push(skill);
    addLog('good', '学会仙法', `学会【${skillName}】！`);
    saveGame();
    return true;
}

// ===== upgradeImmortalSkill =====
function upgradeImmortalSkill(skillIndex) {
    if (gameState.immortalSkills.length <= skillIndex) return;
    
    const skill = gameState.immortalSkills[skillIndex];
    const skillData = IMMORTAL_SKILLS_DATA[skill.name];
    
    if (skill.level >= skill.maxLevel) {
        showToast('仙法已达最大等级');
        return;
    }
    
    const cost = {
        spiritStones: skillData.upgradeCost.spiritStones * skill.level,
        herbs: skillData.upgradeCost.herbs * skill.level
    };
    
    if (gameState.immortal.spiritStones < cost.spiritStones) {
        showToast('仙石不足');
        return;
    }
    
    // 扣除仙石
    gameState.immortal.spiritStones -= cost.spiritStones;
    
    // 升级
    skill.level++;
    skill.damage = Math.floor(skillData.baseDamage * (1 + skill.level * 0.1));
    
    addLog('good', '仙法升级', `${skill.name}升级到Lv.${skill.level}！`);
    saveGame();
    updateDisplay();
}

// ===== useImmortalSkill =====
function useImmortalSkill(skillIndex, target) {
    if (gameState.immortalSkills.length <= skillIndex) return;
    
    const skill = gameState.immortalSkills[skillIndex];
    
    if (skill.currentCooldown > 0) {
        showToast(`${skill.name}冷却中，还需${skill.currentCooldown}秒`);
        return;
    }
    
    // 应用技能效果
    const skillTypeData = IMMORTAL_SKILL_TYPES[skill.type];
    let effectDescription = '';
    
    switch (skill.damageType) {
        case 'attack':
            effectDescription = `对目标造成${skill.damage}%伤害`;
            // 直接应用伤害（战斗系统会在此处接入）
            break;
        case 'defense':
            effectDescription = '防御大幅提升，免疫控制3秒';
            break;
        case 'AoE':
            effectDescription = `对范围内敌人造成${skill.damage}%伤害`;
            break;
        case 'summon':
            effectDescription = '召唤仙兵助战';
            break;
        case 'buff':
            effectDescription = '阵内队友属性+50%';
            break;
    }
    
    // 设置冷却
    skill.currentCooldown = skill.cooldown;
    
    addLog('good', '施展仙法', `施展【${skill.name}】：${effectDescription}`);
    saveGame();
    
    // 启动冷却计时
    startSkillCooldownTimer(skillIndex);
    
    return true;
}

// ===== startSkillCooldownTimer =====
function startSkillCooldownTimer(skillIndex) {
    const interval = setInterval(() => {
        if (gameState.immortalSkills.length <= skillIndex) {
            clearInterval(interval);
            return;
        }
        
        const skill = gameState.immortalSkills[skillIndex];
        if (skill.currentCooldown > 0) {
            skill.currentCooldown--;
            updateDisplay();
        } else {
            clearInterval(interval);
        }
    }, 1000);
}

// ===== showImmortalSkillPanel =====
function showImmortalSkillPanel() {
    let html = '<div style="padding:16px;">';
    html += '<h3 style="color:#ffd700;text-align:center;margin-bottom:16px;">✨ 仙法面板</h3>';
    
    // 技能列表
    if (gameState.immortalSkills.length === 0) {
        html += '<div style="text-align:center;color:#666;padding:30px;">尚未学会任何仙法</div>';
    } else {
        for (let i = 0; i < gameState.immortalSkills.length; i++) {
            const skill = gameState.immortalSkills[i];
            const skillData = IMMORTAL_SKILLS_DATA[skill.name];
            const typeData = IMMORTAL_SKILL_TYPES[skill.type];
            
            html += `<div style="background:#1a1a2e;padding:12px;border-radius:8px;margin-bottom:10px;border-left:4px solid ${typeData.color};">`;
            html += `<div style="display:flex;align-items:center;gap:10px;">`;
            html += `<span style="font-size:28px;">${skillData.icon}</span>`;
            html += `<div style="flex:1;">`;
            html += `<div style="color:#fff;font-weight:bold;">${skill.name} <span style="color:${typeData.color};font-size:12px;">[${skill.type}]</span></div>`;
            html += `<div style="color:#888;font-size:11px;">Lv.${skill.level}/${skill.maxLevel}</div>`;
            html += '</div>';
            
            // 冷却显示
            if (skill.currentCooldown > 0) {
                html += `<div style="color:#f44336;font-size:12px;">冷却:${skill.currentCooldown}秒</div>`;
            } else {
                html += `<button onclick="useImmortalSkill(${i});closeModal();" style="padding:4px 10px;background:#2e7d32;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">施展</button>`;
            }
            
            html += '</div>';
            
            // 升级按钮
            const upgradeCost = {
                spiritStones: skillData.upgradeCost.spiritStones * skill.level,
                herbs: skillData.upgradeCost.herbs * skill.level
            };
            
            html += `<div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;">`;
            html += `<div style="color:#aaa;font-size:11px;">${skill.description}</div>`;
            
            if (skill.level < skill.maxLevel) {
                const canUpgrade = gameState.immortal.spiritStones >= upgradeCost.spiritStones;
                html += `<button onclick="upgradeImmortalSkill(${i});closeModal();" ${canUpgrade ? '' : 'disabled'} style="padding:4px 8px;background:${canUpgrade ? '#1565c0' : '#444'};color:${canUpgrade ? '#fff' : '#666'};border:none;border-radius:4px;cursor:${canUpgrade ? 'pointer' : 'not-allowed'};font-size:11px;">升级 ${upgradeCost.spiritStones}💎</button>`;
            } else {
                html += `<span style="color:#ffd700;font-size:11px;">已满级</span>`;
            }
            
            html += '</div></div>';
        }
    }
    
    // 学习新仙法
    html += '<div style="margin-top:16px;padding-top:16px;border-top:1px solid #333;">';
    html += '<div style="color:#aaa;font-size:12px;margin-bottom:8px;">可学习仙法：</div>';
    
    const availableSkills = Object.keys(IMMORTAL_SKILLS_DATA).filter(
        name => !gameState.immortalSkills.find(s => s.name === name)
    );
    
    if (availableSkills.length === 0) {
        html += '<div style="color:#666;text-align:center;">已学会所有仙法</div>';
    } else {
        for (const skillName of availableSkills) {
            const skillData = IMMORTAL_SKILLS_DATA[skillName];
            const typeData = IMMORTAL_SKILL_TYPES[skillData.type];
            
            html += `<div style="background:#252540;padding:10px;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">`;
            html += `<div style="display:flex;align-items:center;gap:10px;">`;
            html += `<span style="font-size:20px;">${skillData.icon}</span>`;
            html += `<div><div style="color:#fff;font-size:13px;">${skillName}</div><div style="color:${typeData.color};font-size:11px;">${skillData.type}</div></div>`;
            html += '</div>';
            html += `<button onclick="learnImmortalSkill('${skillName}');closeModal();" style="padding:4px 10px;background:#2e7d32;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">学习</button>`;
            html += '</div>';
        }
    }
    html += '</div>';
    
    html += `<button onclick="closeModal()" style="width:100%;margin-top:16px;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>`;
    html += '</div>';
    
    openModal('仙法', html, '');
}

// ===== getImmortalSkillBonus =====
function getImmortalSkillBonus(type) {
    let bonus = 0;
    for (const skill of gameState.immortalSkills) {
        const skillTypeData = IMMORTAL_SKILL_TYPES[skill.type];
        if (skillTypeData.bonusType === type) {
            bonus += skillTypeData.bonusValue * skill.level;
        }
    }
    return bonus;
}
