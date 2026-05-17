// Auto-generated module: laws.js
'use strict';

// ===== CELESTIAL LAWS CONSTANTS (V37) =====
const CELESTIAL_LAWS = {
    time: {
        name: '时间法则', icon: '⏳', attr: 'cultivate_speed', value: 0.15,
        realm: '大乘', synergy: 'space', conflict: 'space',
        desc: '修炼速度+15%', cost: 5000, comprehendDays: 30
    },
    space: {
        name: '空间法则', icon: '🌀', attr: 'escape', value: 0.20,
        realm: '大乘', synergy: 'time', conflict: 'time',
        desc: '躲避率+20%', cost: 5000, comprehendDays: 30
    },
    wuxing: {
        name: '五行法则', icon: '🌈', attr: 'all_stats', value: 0.10,
        realm: '大乘', synergy: 'yinyang', conflict: 'chaos',
        desc: '全属性+10%', cost: 5000, comprehendDays: 30
    },
    yinyang: {
        name: '阴阳法则', icon: '☯️', attr: 'attack_defense_balance', value: 0.12,
        realm: '大乘', synergy: 'wuxing', conflict: 'destiny',
        desc: '攻防均衡+12%', cost: 5000, comprehendDays: 30
    },
    cause: {
        name: '因果法则', icon: '🔮', attr: 'crit', value: 0.18,
        realm: '地仙', synergy: 'destiny', conflict: 'reincarnation',
        desc: '暴击率+18%', cost: 8000, comprehendDays: 45
    },
    destiny: {
        name: '命运法则', icon: '⭐', attr: 'serendipity', value: 0.25,
        realm: '地仙', synergy: 'cause', conflict: 'yinyang',
        desc: '奇遇概率+25%', cost: 8000, comprehendDays: 45
    },
    destruction: {
        name: '毁灭法则', icon: '💥', attr: 'attack', value: 0.20,
        realm: '地仙', synergy: 'creation', conflict: 'creation',
        desc: '伤害+20%', cost: 8000, comprehendDays: 45
    },
    creation: {
        name: '创造法则', icon: '✨', attr: 'heal', value: 0.25,
        realm: '地仙', synergy: 'destruction', conflict: 'destruction',
        desc: '治疗效果+25%', cost: 8000, comprehendDays: 45
    },
    reincarnation: {
        name: '轮回法则', icon: '🔄', attr: 'cooldown_reduce', value: 0.20,
        realm: '太乙', synergy: 'chaos', conflict: 'cause',
        desc: '冷却缩减-20%', cost: 12000, comprehendDays: 60
    },
    chaos: {
        name: '混沌法则', icon: '🌌', attr: 'all_stats', value: 0.15,
        realm: '太乙', synergy: 'reincarnation', conflict: 'wuxing',
        desc: '全属性+15%，受伤+10%', cost: 12000, comprehendDays: 60,
        debuff: 'damage_taken', debuffValue: 0.10
    }
};

const LAW_RELM_REQUIREMENTS = { '大乘': 8, '地仙': 9, '太乙': 10 };

// ===== CORE FUNCTIONS =====

// 检查是否可以领悟法则
function canComprehendLaw(lawId) {
    const law = CELESTIAL_LAWS[lawId];
    if (!law) return { result: false, reason: '未知法则' };
    if (gameState.celestialLaws.comprehended.includes(lawId)) {
        return { result: false, reason: '已领悟此法则' };
    }
    if (gameState.celestialLaws.comprehending === lawId) {
        return { result: false, reason: '正在领悟此法则' };
    }
    if (gameState.celestialLaws.active.length >= gameState.celestialLaws.maxActiveLaws) {
        return { result: false, reason: `最多激活${gameState.celestialLaws.maxActiveLaws}条法则` };
    }
    const realmReq = LAW_RELM_REQUIREMENTS[law.realm];
    if (gameState.realm < realmReq) {
        return { result: false, reason: `需要境界达到${law.realm}` };
    }
    return { result: true };
}

// 开始领悟法则
function startComprehendLaw(lawId) {
    const check = canComprehendLaw(lawId);
    if (!check.result) {
        showToast(check.reason);
        return;
    }
    const law = CELESTIAL_LAWS[lawId];
    if (gameState.spiritStones < law.cost) {
        showToast('灵石不足');
        return;
    }
    gameState.spiritStones -= law.cost;
    gameState.celestialLaws.comprehending = lawId;
    gameState.celestialLaws.comprehendingProgress = 0;
    gameState.celestialLaws.comprehendDays = 0;
    addLog('good', '悟道开始', `开始领悟【${law.name}】`);
    showToast(`开始领悟【${law.name}】`);
    renderGameUI();
}

// 处理每日领悟进度
function processLawComprehension() {
    const cl = gameState.celestialLaws;
    if (!cl.comprehending) return;

    const law = CELESTIAL_LAWS[cl.comprehending];
    cl.comprehendDays++;
    // 每天进度 = 100 / 总天数
    cl.comprehendingProgress = Math.min(100, (cl.comprehendDays / law.comprehendDays) * 100);

    if (cl.comprehendingProgress >= 100) {
        // 领悟完成
        cl.comprehended.push(cl.comprehending);
        const completedLaw = cl.comprehending;
        cl.comprehending = null;
        cl.comprehendingProgress = 0;
        cl.comprehendDays = 0;

        // 自动激活（如有空位）
        if (cl.active.length < cl.maxActiveLaws) {
            cl.active.push(completedLaw);
        }
        addLog('good', '法则领悟', `【${CELESTIAL_LAWS[completedLaw].name}】领悟完成！`);
        showToast(`【${CELESTIAL_LAWS[completedLaw].name}】领悟成功！`);
        calculateLawBonus();
    }
}

// 计算法则加成
function calculateLawBonus() {
    const cl = gameState.celestialLaws;
    const bonus = {
        attack: 0, defense: 0, maxHp: 0, crit: 0, escape: 0,
        cultivate_speed: 0, serendipity: 0, cooldown_reduce: 0,
        all_stats: 0, heal: 0, damage_taken: 0, tribulation_boost: 0
    };

    if (cl.active.length === 0) {
        cl.lawBonus = bonus;
        applyLawBonus(bonus);
        return;
    }

    let hasConflict = false;
    let hasSynergy = false;

    // 计算每条激活法则的加成
    for (const lawId of cl.active) {
        const law = CELESTIAL_LAWS[lawId];
        if (!law) continue;

        let value = law.value;

        // 检测相克
        if (cl.active.includes(law.conflict)) {
            value *= 0.7; // 相克降低30%
            hasConflict = true;
        }

        // 检测相助（额外+15%）
        if (cl.active.includes(law.synergy)) {
            value *= 1.15;
            hasSynergy = true;
        }

        // 应用到对应属性
        if (law.attr === 'all_stats') {
            bonus.attack += value;
            bonus.defense += value;
            bonus.maxHp += value;
        } else if (law.attr === 'attack_defense_balance') {
            bonus.attack += value * 0.5;
            bonus.defense += value * 0.5;
        } else if (bonus.hasOwnProperty(law.attr)) {
            bonus[law.attr] += value;
        }

        // 混沌法则的减益
        if (law.debuff && bonus.hasOwnProperty(law.debuff)) {
            bonus[law.debuff] += law.debuffValue;
        }
    }

    // 渡劫加成：每条激活法则+5%，相克时取消
    bonus.tribulation_boost = hasConflict ? 0 : cl.active.length * 0.05;

    cl.lawBonus = bonus;
    applyLawBonus(bonus);

    // 记录日志（仅在状态变化时）
    if (hasConflict || hasSynergy) {
        const conflictLaws = cl.active.filter(id => cl.active.includes(CELESTIAL_LAWS[id].conflict));
        const synergyPairs = [];
        for (const lawId of cl.active) {
            const law = CELESTIAL_LAWS[lawId];
            if (cl.active.includes(law.synergy)) {
                synergyPairs.push(`${law.icon}${CELESTIAL_LAWS[law.synergy].icon}`);
            }
        }
        if (hasConflict) {
            addLog('warn', '法则相克', `激活的相克法则效果降低30%`);
        }
        if (hasSynergy && synergyPairs.length > 0) {
            addLog('good', '法则相助', `激活相助法则，额外+15%效果: ${synergyPairs.join(', ')}`);
        }
    }
}

// 应用法则加成到activeEffects
function applyLawBonus(bonus) {
    const ae = gameState.activeEffects;
    ae.attack = bonus.attack;
    ae.defense = bonus.defense;
    ae.all_stats = bonus.all_stats;
    ae.serendipity_boost = bonus.serendipity;
    ae.cultivate_speed = bonus.cultivate_speed;
    // 渡劫加成特殊处理
    if (bonus.tribulation_boost > 0) {
        ae.tribulation_boost_law = bonus.tribulation_boost;
    } else {
        delete ae.tribulation_boost_law;
    }
}

// 激活/停用法则
function toggleLawActive(lawId) {
    const cl = gameState.celestialLaws;
    if (!cl.comprehended.includes(lawId)) {
        showToast('请先领悟此法则');
        return;
    }

    const idx = cl.active.indexOf(lawId);
    if (idx >= 0) {
        // 停用
        cl.active.splice(idx, 1);
        calculateLawBonus();
        showToast(`【${CELESTIAL_LAWS[lawId].name}】已停用`);
    } else {
        // 激活
        if (cl.active.length >= cl.maxActiveLaws) {
            showToast(`最多激活${cl.maxActiveLaws}条法则`);
            return;
        }
        cl.active.push(lawId);
        calculateLawBonus();
        showToast(`【${CELESTIAL_LAWS[lawId].name}】已激活`);
    }
    renderGameUI();
}

// 获取法则状态
function getLawStatus(lawId) {
    const cl = gameState.celestialLaws;
    if (cl.active.includes(lawId)) return 'active';
    if (cl.comprehending === lawId) return 'comprehending';
    if (cl.comprehended.includes(lawId)) return 'comprehended';
    return 'locked';
}

// 获取法则颜色
function getLawColor(status) {
    switch (status) {
        case 'active': return '#ffd700';
        case 'comprehending': return '#ff6b35';
        case 'comprehended': return '#4ecdc4';
        default: return '#666';
    }
}

// 显示悟道台界面
function showLawComprehension() {
    const cl = gameState.celestialLaws;
    const realm = gameState.realm >= 8 ? '大乘' : gameState.realm >= 9 ? '地仙' : gameState.realm >= 10 ? '太乙' : null;

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ffd700;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ffd700;text-align:center;margin-bottom:15px;">⏳ 悟道台 - 天道法则</h2>`;

    // 当前加成显示
    if (cl.active.length > 0) {
        html += `<div style="background:#16213e;border-radius:8px;padding:12px;margin-bottom:15px;">`;
        html += `<div style="color:#4ecdc4;font-size:12px;margin-bottom:5px;">当前激活法则效果：</div>`;
        const bonus = cl.lawBonus || {};
        const parts = [];
        if (bonus.attack > 0) parts.push(`攻击+${(bonus.attack*100).toFixed(0)}%`);
        if (bonus.defense > 0) parts.push(`防御+${(bonus.defense*100).toFixed(0)}%`);
        if (bonus.cultivate_speed > 0) parts.push(`修炼+${(bonus.cultivate_speed*100).toFixed(0)}%`);
        if (bonus.crit > 0) parts.push(`暴击+${(bonus.crit*100).toFixed(0)}%`);
        if (bonus.escape > 0) parts.push(`躲避+${(bonus.escape*100).toFixed(0)}%`);
        if (bonus.serendipity > 0) parts.push(`奇遇+${(bonus.serendipity*100).toFixed(0)}%`);
        if (bonus.tribulation_boost > 0) parts.push(`渡劫+${(bonus.tribulation_boost*100).toFixed(0)}%`);
        html += `<div style="color:#fff;">${parts.join(' | ') || '无'}</div></div>`;
    }

    // 悟道路径提示
    if (!realm) {
        html += `<div style="text-align:center;color:#888;margin:30px 0;">
            悟道需境界达到【大乘】，当前境界不足<br>
            <span style="color:#aaa;font-size:12px;">境界达到大乘后可解锁悟道台</span>
        </div>`;
    } else {
        // 法则列表
        html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;margin-bottom:15px;">`;
        for (const [lawId, law] of Object.entries(CELESTIAL_LAWS)) {
            const status = getLawStatus(lawId);
            const isAvailable = !realm || LAW_RELM_REQUIREMENTS[law.realm] <= gameState.realm;
            const color = getLawColor(status);
            const borderColor = status === 'active' ? '#ffd700' : status === 'comprehending' ? '#ff6b35' : '#333';

            let stateLabel = '';
            let progressBar = '';
            if (status === 'comprehending') {
                stateLabel = '领悟中';
                progressBar = `<div style="background:#333;border-radius:4px;height:6px;margin-top:5px;">
                    <div style="background:linear-gradient(90deg,#ff6b35,#ffd700);height:100%;width:${cl.comprehendingProgress}%;border-radius:4px;transition:width 0.3s;"></div>
                </div>`;
            } else if (status === 'comprehended') {
                stateLabel = '已领悟';
            } else if (status === 'active') {
                stateLabel = '已激活';
            } else if (!isAvailable) {
                stateLabel = `需要${law.realm}`;
            }

            const synergyLaw = law.synergy ? CELESTIAL_LAWS[law.synergy] : null;
            const conflictLaw = law.conflict ? CELESTIAL_LAWS[law.conflict] : null;

            html += `<div style="background:#0f0f23;border:1px solid ${borderColor};border-radius:8px;padding:12px;opacity:${isAvailable ? 1 : 0.5};">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <span style="font-size:20px;">${law.icon}</span>
                    <div>
                        <div style="color:${color};font-weight:bold;">${law.name}</div>
                        <div style="color:#888;font-size:11px;">${stateLabel}</div>
                    </div>
                </div>
                <div style="color:#aaa;font-size:11px;margin-bottom:5px;">${law.desc}</div>
                ${progressBar}
                <div style="color:#666;font-size:10px;margin-top:5px;">
                    ${synergyLaw ? `<span style="color:#4ecdc4;">相助: ${synergyLaw.icon}${synergyLaw.name}</span>` : ''}
                    ${conflictLaw ? `<span style="color:#ff6b6b;"> | 相克: ${conflictLaw.icon}${conflictLaw.name}</span>` : ''}
                </div>
                <div style="color:#888;font-size:10px;margin-top:3px;">消耗: ${law.cost}灵石 | ${law.comprehendDays}天</div>`;

            // 按钮
            if (realm && isAvailable) {
                if (status === 'locked') {
                    const check = canComprehendLaw(lawId);
                    html += `<button class="btn" style="margin-top:8px;width:100%;font-size:11px;padding:5px 8px;"
                        onclick="startComprehendLaw('${lawId}')" ${check.result ? '' : 'disabled'}>
                        ${check.result ? '开始领悟' : check.reason}
                    </button>`;
                } else if (status === 'comprehended') {
                    html += `<button class="btn" style="margin-top:8px;width:100%;font-size:11px;padding:5px 8px;"
                        onclick="toggleLawActive('${lawId}')">
                        ${cl.active.includes(lawId) ? '停用' : '激活'}
                    </button>`;
                } else if (status === 'comprehending') {
                    html += `<div style="margin-top:8px;text-align:center;color:#ff6b35;font-size:11px;">
                        领悟中... ${Math.floor(cl.comprehendingProgress)}%
                    </div>`;
                }
            }
            html += `</div>`;
        }
        html += `</div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" onclick="closeModal('lawComprehension')">关闭</button>
    </div></div></div>`;

    setModalContent('lawComprehension', html);
    document.getElementById('modal-lawComprehension').style.display = 'block';
}

// 检查悟道台是否可用
function isLawComprehensionAvailable() {
    return gameState.realm >= 8; // 大乘
}