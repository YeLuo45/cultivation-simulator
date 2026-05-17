// Auto-generated module: social.js
'use strict';

// ===== ALLY CONSTANTS (V38) =====
const ALLY_CONFIG = {
    createCost: 10000,
    maxMembers: 50,
    maxApplications: 5,
    taxRate: 0.05,
    maxFriends: 20
};

const ALLY_RANKS = {
    1: { name: '一级仙盟', maxMembers: 20, skillCap: 1 },
    2: { name: '二级仙盟', maxMembers: 25, skillCap: 2 },
    3: { name: '三级仙盟', maxMembers: 30, skillCap: 2 },
    4: { name: '四级仙盟', maxMembers: 35, skillCap: 3 },
    5: { name: '五级仙盟', maxMembers: 40, skillCap: 3 },
    6: { name: '六级仙盟', maxMembers: 45, skillCap: 4 },
    7: { name: '七级仙盟', maxMembers: 48, skillCap: 4 },
    8: { name: '八级仙盟', maxMembers: 49, skillCap: 5 },
    9: { name: '九级仙盟', maxMembers: 49, skillCap: 5 },
    10: { name: '十级仙盟', maxMembers: 50, skillCap: 5 }
};

const ALLY_SKILLS = {
    1: { name: '集体修炼', icon: '🧘', desc: '全员修炼速度+5%/级', cost: 1000, effect: { cultivate_speed: 0.05 } },
    2: { name: '奇遇加成', icon: '✨', desc: '奇遇概率+10%/级', cost: 2000, effect: { serendipity: 0.10 } },
    3: { name: '资源共享', icon: '🔗', desc: '可借用成员装备', cost: 3000, effect: { share: true } },
    4: { name: '战斗加成', icon: '⚔️', desc: '仙盟成员战斗+5%/级', cost: 2500, effect: { combat: 0.05 } },
    5: { name: '灵石加成', icon: '💎', desc: '每日灵石收益+10%/级', cost: 3500, effect: { spiritStone: 0.10 } }
};

const ALLY_ACTIVITIES = {
    '修炼': { desc: '与仙盟成员组队修炼', reward: 'contribution', amount: 15, icon: '🧘' },
    '采集': { desc: '采集仙盟领地资源', reward: 'spiritStone', amount: 100, icon: '🌿' },
    '战斗': { desc: '击败仙盟入侵者', reward: 'contribution', amount: 25, icon: '⚔️' },
    '探索': { desc: '共同探索秘境', reward: 'contribution', amount: 20, icon: '🗺️' },
    '传功': { desc: '传授功法给后辈', reward: 'contribution', amount: 30, icon: '📖' }
};

// ===== ALLY FUNCTIONS =====

function showAllyPanel() {
    const ia = gameState.immortalAlly;
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:800px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">🏛️ 仙盟</h2>`;

    if (!ia.id) {
        // 无仙盟
        html += `<div style="text-align:center;padding:30px;">
            <div style="color:#888;margin-bottom:20px;">您还没有加入任何仙盟</div>
            <div style="margin-bottom:20px;">
                <button class="btn" style="background:linear-gradient(135deg,#9c27b0,#e91e63);color:white;" onclick="showCreateAllyUI()">🏗️ 创建仙盟（${ALLY_CONFIG.createCost}灵石）</button>
            </div>
            <div>
                <button class="btn" style="background:#333;color:#fff;" onclick="showJoinAllyUI()">🔍 加入仙盟</button>
            </div>
        </div>`;
    } else {
        // 有仙盟
        const rankInfo = ALLY_RANKS[ia.rank] || ALLY_RANKS[1];
        html += `<div style="background:#16213e;border-radius:8px;padding:12px;margin-bottom:15px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="color:#9c27b0;font-size:18px;font-weight:bold;">${ia.name}</div>
                    <div style="color:#888;font-size:12px;">${rankInfo.name} | 成员 ${ia.allies.length}/${rankInfo.maxMembers}</div>
                </div>
                <div style="text-align:right;">
                    <div style="color:#ffd700;">贡献: ${ia.contribution}</div>
                    <div style="color:#888;font-size:11px;">职位: ${getAllyRoleName(ia.role)}</div>
                </div>
            </div>
        </div>`;

        // 仙盟技能
        html += `<div style="margin-bottom:15px;">
            <div style="color:#9c27b0;margin-bottom:8px;">仙盟技能 (等级${ia.skillLevel})</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">`;
        for (const [lv, skill] of Object.entries(ALLY_SKILLS)) {
            const unlocked = parseInt(lv) <= rankInfo.skillCap;
            const active = parseInt(lv) <= ia.skillLevel;
            html += `<div style="background:#0f0f23;border:1px solid ${active ? '#9c27b0' : '#333'};border-radius:6px;padding:8px;opacity:${unlocked ? 1 : 0.5};min-width:120px;">
                <div style="color:${active ? '#ffd700' : '#666'};">${skill.icon} ${skill.name}</div>
                <div style="color:#888;font-size:10px;">${skill.desc}</div>
                ${unlocked && !active && ia.role === 'leader' ? `<button class="btn" style="margin-top:5px;font-size:10px;padding:3px 8px;" onclick="upgradeAllySkill(${lv})">升级(${skill.cost}贡献)</button>` : ''}
            </div>`;
        }
        html += `</div></div>`;

        // 仙盟活动
        html += `<div style="margin-bottom:15px;">
            <div style="color:#9c27b0;margin-bottom:8px;">今日活动</div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">`;
        for (const [type, act] of Object.entries(ALLY_ACTIVITIES)) {
            html += `<div style="background:#0f0f23;border-radius:6px;padding:8px;text-align:center;cursor:pointer;" onclick="doAllyActivity('${type}')">
                <div style="font-size:20px;">${act.icon}</div>
                <div style="color:#fff;font-size:11px;">${type}</div>
                <div style="color:#888;font-size:10px;">+${act.amount} ${act.reward === 'contribution' ? '贡献' : '灵石'}</div>
            </div>`;
        }
        html += `</div></div>`;

        // 成员列表
        html += `<div style="margin-bottom:15px;">
            <div style="color:#9c27b0;margin-bottom:8px;">成员列表</div>
            <div style="max-height:200px;overflow-y:auto;">`;
        const sortedAllies = [...ia.allies].sort((a, b) => {
            const roleOrder = { leader: 0, vice_leader: 1, elder: 2, member: 3 };
            return (roleOrder[a.role] || 4) - (roleOrder[b.role] || 4);
        });
        for (const ally of sortedAllies) {
            const realmName = getRealmName(ally.realm);
            html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px;background:#0f0f23;border-radius:4px;margin-bottom:4px;">
                <div>
                    <span style="color:${ally.role === 'leader' ? '#ffd700' : '#fff'};">${ally.name}</span>
                    <span style="color:#888;font-size:10px;"> ${realmName}</span>
                </div>
                <div>
                    <span style="color:#888;font-size:11px;">${getAllyRoleName(ally.role)}</span>
                    <span style="color:#9c27b0;font-size:11px;"> | 贡献:${ally.contribution}</span>
                </div>
            </div>`;
        }
        html += `</div></div>`;

        // 入盟申请（盟主/副盟主可见）
        if (ia.role === 'leader' || ia.role === 'vice_leader') {
            const pendingApps = gameState.allyApplications.filter(a => a.allyId === ia.id && a.status === 'pending');
            if (pendingApps.length > 0) {
                html += `<div style="margin-bottom:15px;">
                    <div style="color:#ff9800;margin-bottom:8px;">待审批入盟申请 (${pendingApps.length})</div>`;
                for (const app of pendingApps) {
                    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px;background:#0f0f23;border-radius:4px;margin-bottom:4px;">
                        <div style="color:#fff;">${app.applicantName} (${app.applicantRealm})</div>
                        <div>
                            <button class="btn" style="background:#4caf50;color:white;padding:3px 10px;font-size:11px;" onclick="handleAllyApplication('${app.applyDay}', 'approve')">批准</button>
                            <button class="btn" style="background:#f44336;color:white;padding:3px 10px;font-size:11px;" onclick="handleAllyApplication('${app.applyDay}', 'reject')">拒绝</button>
                        </div>
                    </div>`;
                }
                html += `</div>`;
            }
        }
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" onclick="closeModal('eventModal')">关闭</button>
    </div></div></div>`;

    setModalContent('allyPanel', html);
    openSocialModal('仙盟');
}

function getAllyRoleName(role) {
    const names = { none: '无', member: '弟子', elder: '长老', vice_leader: '副盟主', leader: '盟主' };
    return names[role] || role;
}

function getRealmName(realm) {
    const realms = ['凡', '炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘', '地仙', '天仙', '金仙', '大罗', '混元'];
    return realms[realm] || '凡';
}

function showCreateAllyUI() {
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:400px;">
            <h3 style="color:#9c27b0;text-align:center;">🏗️ 创建仙盟</h3>
            <div style="margin:15px 0;">
                <input type="text" id="allyNameInput" placeholder="输入仙盟名称" style="width:100%;padding:10px;background:#0f0f23;border:1px solid #333;color:#fff;border-radius:6px;">
            </div>
            <div style="color:#888;text-align:center;margin-bottom:15px;">消耗 ${ALLY_CONFIG.createCost} 灵石</div>
            <div style="text-align:center;">
                <button class="btn" style="background:#9c27b0;color:white;" onclick="createAlly()">创建</button>
                <button class="btn" style="background:#333;color:#fff;" onclick="closeModal('eventModal')">取消</button>
            </div>
        </div></div>`;
    setModalContent('createAlly', html);
    openSocialModal('创建仙盟');
}

function createAlly() {
    const name = document.getElementById('allyNameInput').value.trim();
    if (!name) { showToast('请输入仙盟名称'); return; }
    if (gameState.spiritStones < ALLY_CONFIG.createCost) { showToast('灵石不足'); return; }

    gameState.spiritStones -= ALLY_CONFIG.createCost;
    gameState.immortalAlly = {
        id: 'ally_' + Date.now(),
        name: name,
        rank: 1,
        role: 'leader',
        contribution: 0,
        joinedDay: gameState.days,
        allies: [{ uid: 'player', name: gameState.playerName || '我', realm: gameState.realm, role: 'leader', contribution: 0 }],
        skillLevel: 0,
        dailyActivity: 0,
        lastActivityDay: gameState.days
    };

    addLog('good', '仙盟创建', `成功创建仙盟【${name}】！`);
    showToast(`仙盟【${name}】创建成功！`);
    closeModal('eventModal');
    showAllyPanel();
}

function showJoinAllyUI() {
    // 简化版：随机生成3个可加入的仙盟
    const sampleAllies = [
        { id: 'ally_1', name: '青云宗', rank: 3, memberCount: 15, skillLevel: 2 },
        { id: 'ally_2', name: '天机阁', rank: 5, memberCount: 28, skillLevel: 3 },
        { id: 'ally_3', name: '万仙盟', rank: 7, memberCount: 40, skillLevel: 4 }
    ];

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:500px;max-height:80vh;overflow-y:auto;">
            <h3 style="color:#9c27b0;text-align:center;margin-bottom:15px;">🔍 加入仙盟</h3>`;

    for (const ally of sampleAllies) {
        html += `<div style="background:#0f0f23;border-radius:8px;padding:12px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="color:#fff;font-weight:bold;">${ally.name}</div>
                    <div style="color:#888;font-size:11px;">${ALLY_RANKS[ally.rank].name} | 成员 ${ally.memberCount}/${ALLY_RANKS[ally.rank].maxMembers}</div>
                </div>
                <button class="btn" style="background:#9c27b0;color:white;" onclick="applyToJoinAlly('${ally.id}', '${ally.name}', ${ally.rank})">申请</button>
            </div>
        </div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#333;color:#fff;" onclick="closeModal('eventModal')">关闭</button>
    </div></div></div>`;

    setModalContent('joinAlly', html);
    openSocialModal('加入仙盟');
}

function applyToJoinAlly(allyId, allyName, allyRank) {
    if (gameState.allyApplications.length >= ALLY_CONFIG.maxApplications) {
        showToast('申请数量已达上限');
        return;
    }
    gameState.allyApplications.push({
        allyId, allyName, allyRank, applyDay: gameState.days, status: 'pending', applicantName: gameState.playerName || '我', applicantRealm: getRealmName(gameState.realm)
    });
    showToast(`已申请加入【${allyName}】`);
    closeModal('eventModal');
}

function handleAllyApplication(applyDay, decision) {
    const ia = gameState.immortalAlly;
    const appIdx = gameState.allyApplications.findIndex(a => a.applyDay == applyDay && a.allyId === ia.id && a.status === 'pending');
    if (appIdx < 0) return;

    const app = gameState.allyApplications[appIdx];
    if (decision === 'approve') {
        ia.allies.push({ uid: 'ally_' + Date.now(), name: app.applicantName, realm: app.applicantRealm, role: 'member', contribution: 0 });
        app.status = 'approved';
        addLog('good', '仙盟', `${app.applicantName} 加入仙盟`);
    } else {
        app.status = 'rejected';
    }
    showAllyPanel();
}

function doAllyActivity(type) {
    const ia = gameState.immortalAlly;
    if (!ia.id) return;

    const act = ALLY_ACTIVITIES[type];
    if (!act) return;

    if (act.reward === 'contribution') {
        ia.contribution += act.amount;
    } else {
        gameState.spiritStones += act.amount;
    }
    ia.dailyActivity++;

    // 仙盟技能加成
    if (ia.skillLevel > 0 && act.reward === 'contribution') {
        const bonus = Math.floor(act.amount * 0.1 * ia.skillLevel);
        ia.contribution += bonus;
    }

    addLog('good', '仙盟活动', `完成【${type}】，获得${act.amount}${act.reward === 'contribution' ? '贡献' : '灵石'}`);
    showToast(`活动完成：+${act.amount} ${act.reward === 'contribution' ? '贡献' : '灵石'}`);
    showAllyPanel();
}

function upgradeAllySkill(lv) {
    const ia = gameState.immortalAlly;
    if (ia.role !== 'leader') { showToast('只有盟主可以升级技能'); return; }

    const skill = ALLY_SKILLS[lv];
    if (!skill || ia.skillLevel >= parseInt(lv)) { showToast('无法升级'); return; }

    if (ia.contribution < skill.cost) { showToast('贡献点不足'); return; }

    ia.contribution -= skill.cost;
    ia.skillLevel = parseInt(lv);
    addLog('good', '仙盟技能', `升级【${skill.name}】至${ia.skillLevel}级`);
    showToast(`技能升级成功！`);
    showAllyPanel();
}

// ===== FRIENDS FUNCTIONS =====

function showFriendsPanel() {
    const friends = gameState.immortalFriends;
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #4caf50;border-radius:12px;padding:20px;max-width:700px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#4caf50;text-align:center;margin-bottom:15px;">👥 仙友</h2>`;

    if (friends.length === 0) {
        html += `<div style="text-align:center;padding:30px;color:#888;">
            暂无仙友，快去结交道友吧！
        </div>`;
    } else {
        html += `<div style="max-height:400px;overflow-y:auto;">`;
        const sortedFriends = [...friends].sort((a, b) => b.intimacy - a.intimacy);
        for (const f of sortedFriends) {
            const intimacyColor = f.intimacy >= 70 ? '#ffd700' : f.intimacy >= 30 ? '#4caf50' : '#888';
            html += `<div style="background:#0f0f23;border-radius:8px;padding:12px;margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span style="color:#fff;font-weight:bold;">${f.name}</span>
                        <span style="color:#888;font-size:11px;"> ${getRealmName(f.realm)}</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:${intimacyColor};">友好度 ${f.intimacy}/100</div>
                        <div style="color:#666;font-size:10px;">最后互动: ${f.lastInteraction > 0 ? `${gameState.days - f.lastInteraction}天前` : '今天'}</div>
                    </div>
                </div>
                <div style="margin-top:8px;display:flex;gap:8px;">
                    <button class="btn" style="background:#4caf50;color:white;font-size:11px;padding:4px 10px;" onclick="giveGiftToFriend('${f.uid}')">🎁 送礼</button>
                    <button class="btn" style="background:#2196f3;color:white;font-size:11px;padding:4px 10px;" ${f.intimacy < 30 ? 'disabled title="友好度不足30"' : ''} onclick="requestFriendHelp('${f.uid}')">🤝 协助</button>
                </div>
            </div>`;
        }
        html += `</div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#333;color:#fff;" onclick="closeModal('eventModal')">关闭</button>
    </div></div></div>`;

    setModalContent('friendsPanel', html);
    openSocialModal('仙友');
}

function giveGiftToFriend(friendUid) {
    const friend = gameState.immortalFriends.find(f => f.uid === friendUid);
    if (!friend) return;

    const giftAmount = Math.min(gameState.spiritStones, 500);
    if (giftAmount <= 0) { showToast('灵石不足'); return; }

    gameState.spiritStones -= giftAmount;
    friend.intimacy = Math.min(100, friend.intimacy + Math.floor(giftAmount / 50));
    friend.lastInteraction = gameState.days;

    addLog('good', '仙友互动', `向【${friend.name}】赠送了${giftAmount}灵石，友好度+${Math.floor(giftAmount / 50)}`);
    showToast(`送礼成功！友好度+${Math.floor(giftAmount / 50)}`);
    showFriendsPanel();
}

function requestFriendHelp(friendUid) {
    const friend = gameState.immortalFriends.find(f => f.uid === friendUid);
    if (!friend || friend.intimacy < 30) { showToast('友好度不足30，无法请求协助'); return; }

    // 简化：直接获得修炼加成
    const bonus = Math.floor(friend.intimacy * 0.01);
    gameState.activeEffects.cultivate_speed += bonus;
    friend.intimacy = Math.max(0, friend.intimacy - 5);
    friend.lastInteraction = gameState.days;

    addLog('good', '仙友协助', `【${friend.name}】协助修炼，修炼速度+${(bonus * 100).toFixed(0)}%`);
    showToast(`获得协助！修炼速度+${(bonus * 100).toFixed(0)}%`);
    closeModal('eventModal');
}

function addRandomFriend() {
    if (gameState.immortalFriends.length >= ALLY_CONFIG.maxFriends) return;
    if (gameState.realm < 1) return; // 炼气及以上才有仙友

    const names = ['太乙真人', '广成子', '南极仙翁', '镇元大仙', '观音菩萨', '普贤菩萨', '文殊菩萨', '地藏王'];
    const usedNames = gameState.immortalFriends.map(f => f.name);
    const available = names.filter(n => !usedNames.includes(n));
    if (available.length === 0) return;

    const name = available[Math.floor(Math.random() * available.length)];
    gameState.immortalFriends.push({
        uid: 'npc_' + Date.now(),
        name: name,
        realm: Math.max(1, gameState.realm - 2 + Math.floor(Math.random() * 4)),
        intimacy: 10,
        lastInteraction: gameState.days
    });
    addLog('good', '新仙友', `结交了新仙友【${name}】！`);
}

// ===== TRADING POST =====

function showTradingPost() {
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff9800;border-radius:12px;padding:20px;max-width:800px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ff9800;text-align:center;margin-bottom:15px;">🏪 仙境交易行</h2>`;

    // 简化：显示一些示例商品
    const sampleItems = [
        { name: '筑基丹', quality: 'rare', price: 500, seller: '青云子' },
        { name: '破境丹', quality: 'precious', price: 2000, seller: '天机老人' },
        { name: '上品灵草', quality: 'uncommon', price: 150, seller: '采药仙子' },
        { name: '金刚杵', quality: 'rare', price: 3000, seller: '炼器师' },
        { name: '混元珠', quality: 'precious', price: 5000, seller: '万宝阁' }
    ];

    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:15px;">`;
    for (const item of sampleItems) {
        const color = item.quality === 'rare' ? '#2196f3' : item.quality === 'precious' ? '#9c27b0' : '#4caf50';
        html += `<div style="background:#0f0f23;border:1px solid ${color};border-radius:8px;padding:10px;text-align:center;">
            <div style="color:${color};font-weight:bold;">${item.name}</div>
            <div style="color:#ffd700;font-size:14px;margin:5px 0;">💎 ${item.price}</div>
            <div style="color:#888;font-size:10px;">卖家: ${item.seller}</div>
            <button class="btn" style="margin-top:8px;background:${color};color:white;font-size:11px;padding:4px 12px;" onclick="buyItemFromPost('${item.name}', ${item.price})">购买</button>
        </div>`;
    }
    html += `</div>`;

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#333;color:#fff;" onclick="closeModal('eventModal')">关闭</button>
    </div></div></div>`;

    setModalContent('tradingPost', html);
    openSocialModal('仙境交易行');
}

function buyItemFromPost(itemName, price) {
    if (gameState.spiritStones < price) { showToast('灵石不足'); return; }

    const tax = Math.floor(price * ALLY_CONFIG.taxRate);
    gameState.spiritStones -= price;

    // 添加物品到背包
    gameState.inventory.push({
        name: itemName,
        type: 'pill',
        quality: 'rare',
        effect: { type: 'breakthrough_boost', value: 0.1 }
    });

    addLog('good', '交易行', `购买【${itemName}】成功，花费${price}灵石（含${tax}税费）`);
    showToast(`购买成功！`);
    showTradingPost();
}

// ===== DAILY PROCESSING =====

function processDailySocial() {
    // 仙友友好度衰减
    const friends = gameState.immortalFriends;
    for (const f of friends) {
        if (gameState.days - f.lastInteraction > 7) {
            f.intimacy = Math.max(0, f.intimacy - 1);
        }
    }

    // 随机结交新仙友（5%概率）
    if (Math.random() < 0.05) {
        addRandomFriend();
    }

    // 仙盟每日重置
    const ia = gameState.immortalAlly;
    if (ia.id && ia.lastActivityDay < gameState.days) {
        ia.dailyActivity = 0;
        ia.lastActivityDay = gameState.days;
    }
}

// ===== HELPER =====
let _currentSocialModalId = '';
let _currentSocialModalHTML = '';

function setModalContent(id, html) {
    _currentSocialModalId = id;
    _currentSocialModalHTML = html;
}

function openSocialModal(title) {
    openModal(title, _currentSocialModalHTML, '');
}