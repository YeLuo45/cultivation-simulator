// Auto-generated module: farming.js
'use strict';

// ===== FARMING CONSTANTS (V46) =====
const FARMING_CONFIG = {
    maxAutoResources: 5,
    offlineEarningHours: 24,
    checkIntervalMs: 60000,  // 1分钟检查一次
    resourceNodes: ['灵草园', '灵石矿', '矿石洞', '仙露池', '灵兽栏']
};

const FARMING_NODES = {
    // 资源节点配置
    '灵草园': {
        icon: '🌿',
        color: '#4caf50',
        resource: 'herbs',
        baseOutput: 10,
        outputInterval: 3600000,  // 1小时
        upgradeCost: { stones: 5000, herbs: 50 },
        upgradeBonus: 1.5,
        maxLevel: 10,
        desc: '自动产出灵草'
    },
    '灵石矿': {
        icon: '💎',
        color: '#2196f3',
        resource: 'spiritStones',
        baseOutput: 100,
        outputInterval: 7200000,  // 2小时
        upgradeCost: { stones: 8000, materials: 100 },
        upgradeBonus: 1.5,
        maxLevel: 10,
        desc: '自动产出灵石'
    },
    '矿石洞': {
        icon: '🪨',
        color: '#795548',
        resource: 'materials',
        baseOutput: 20,
        outputInterval: 3600000,
        upgradeCost: { stones: 6000, herbs: 30 },
        upgradeBonus: 1.5,
        maxLevel: 10,
        desc: '自动产出矿石'
    },
    '仙露池': {
        icon: '💧',
        color: '#00bcd4',
        resource: 'qi',
        baseOutput: 50,
        outputInterval: 1800000,  // 30分钟
        upgradeCost: { stones: 10000, herbs: 100 },
        upgradeBonus: 1.5,
        maxLevel: 10,
        desc: '自动产出灵气'
    },
    '灵兽栏': {
        icon: '🦌',
        color: '#ff9800',
        resource: 'petExp',
        baseOutput: 30,
        outputInterval: 7200000,
        upgradeCost: { stones: 15000, herbs: 200 },
        upgradeBonus: 1.5,
        maxLevel: 10,
        desc: '自动产出仙宠经验'
    }
};

const FARMING_UPGRADES = {
    // 全局升级
    '效率提升': {
        icon: '⚡',
        cost: { stones: 20000 },
        bonus: { allOutput: 0.2 },
        maxLevel: 5,
        desc: '所有资源产出+20%'
    },
    '自动采集': {
        icon: '🤖',
        cost: { stones: 30000 },
        bonus: { autoCollect: true },
        maxLevel: 1,
        desc: '自动收集资源，无需手动点击'
    },
    '离线收益': {
        icon: '💤',
        cost: { stones: 25000 },
        bonus: { offlineHours: 12 },
        maxLevel: 3,
        desc: '离线收益时间+12小时/级'
    },
    '暴击倍率': {
        icon: '🎯',
        cost: { stones: 40000 },
        bonus: { critChance: 0.1 },
        maxLevel: 5,
        desc: '资源暴击概率+10%/级'
    },
    '资源加成': {
        icon: '📈',
        cost: { stones: 50000 },
        bonus: { specificResource: {} },
        maxLevel: 1,
        desc: '选择一项资源产出翻倍'
    }
};

// ===== FARMING STATE =====
let farmingState = {
    nodes: {},           // { nodeId: { level, lastCollect, totalOutput } }
    upgrades: {},        // { upgradeId: level }
    lastOnlineTime: Date.now(),
    totalOfflineEarnings: null,
    selectedResource: null,
    lastAutoCollect: 0
};

// ===== FARMING FUNCTIONS =====

function openFarmingPanel() {
    updateFarmingState();
    const fs = farmingState;
    const now = Date.now();

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #4caf50;border-radius:12px;padding:20px;max-width:800px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#4caf50;text-align:center;margin-bottom:10px;">🌾 仙界 farming 系统</h2>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:15px;">
                <div style="background:rgba(76,175,80,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">资源节点</div>
                    <div style="color:#4caf50;font-size:1.3em;font-weight:bold;">${Object.keys(fs.nodes).length}/${FARMING_CONFIG.maxAutoResources}</div>
                </div>
                <div style="background:rgba(76,175,80,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">效率加成</div>
                    <div style="color:#ffd700;font-size:1.3em;font-weight:bold;">+${getFarmingEfficiencyBonus() * 100}%</div>
                </div>
                <div style="background:rgba(76,175,80,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">离线收益</div>
                    <div style="color:#2196f3;font-size:1.1em;font-weight:bold;">${getOfflineHours()}小时</div>
                </div>
                <div style="background:rgba(76,175,80,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">暴击概率</div>
                    <div style="color:#ff9800;font-size:1.3em;font-weight:bold;">${getFarmingCritChance() * 100}%</div>
                </div>
            </div>

            <div style="display:flex;gap:10px;margin-bottom:15px;">
                <button class="btn" style="background:#4caf50;color:white;flex:1;" onclick="showFarmingNodes()">⛏️ 资源节点</button>
                <button class="btn" style="background:#2196f3;color:white;flex:1;" onclick="showFarmingUpgrades()">⬆️ 全局升级</button>
                <button class="btn" style="background:#ff9800;color:white;flex:1;" onclick="collectAllResources()">📥 一键采集</button>
            </div>`;

    // 离线收益提示
    const offlineHours = getOfflineHours();
    if (offlineHours > 0) {
        const offlineEarnings = calculateOfflineEarnings();
        if (offlineEarnings.total > 0) {
            html += `<div style="background:rgba(33,150,243,0.1);border:1px solid #2196f3;border-radius:8px;padding:15px;margin-bottom:15px;">
                <h4 style="color:#2196f3;margin-bottom:10px;">💤 离线收益</h4>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:0.9em;">`;
            Object.entries(offlineEarnings.byResource).forEach(([res, amount]) => {
                if (amount > 0) {
                    const names = { spiritStones: '灵石', herbs: '灵草', materials: '矿石', qi: '灵气', petExp: '仙宠经验' };
                    html += `<div style="text-align:center;"><span style="color:#aaa;">${names[res] || res}</span><br><span style="color:#4caf50;font-weight:bold;">+${formatNumber(amount)}</span></div>`;
                }
            });
            html += `</div>
                <button class="btn" style="background:#2196f3;color:white;width:100%;margin-top:10px;" onclick="claimOfflineEarnings()">领取离线收益</button>
            </div>`;
        }
    }

    // 当前节点状态
    html += `<div style="margin-bottom:15px;">
        <h3 style="color:#ffd700;margin-bottom:10px;">⛏️ 资源节点状态</h3>`;

    if (Object.keys(fs.nodes).length === 0) {
        html += `<p style="color:#aaa;text-align:center;">尚未建造任何资源节点</p>`;
    } else {
        html += `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">`;
        Object.entries(fs.nodes).forEach(([nodeId, nodeData]) => {
            const config = FARMING_NODES[nodeId];
            if (!config) return;

            const timeSinceLast = now - (nodeData.lastCollect || 0);
            const timeToNext = Math.max(0, config.outputInterval - timeSinceLast);
            const progress = Math.min(100, (timeSinceLast / config.outputInterval) * 100);
            const output = Math.round(config.baseOutput * Math.pow(config.upgradeBonus, nodeData.level - 1) * getFarmingEfficiencyBonus());

            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${config.color};border-radius:8px;padding:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div>
                        <span style="color:${config.color};font-weight:bold;font-size:1.1em;">${config.icon} ${nodeId}</span>
                        <span style="color:#ff9800;margin-left:5px;">Lv.${nodeData.level}</span>
                    </div>
                    <div style="color:#aaa;font-size:0.85em;">${config.desc}</div>
                </div>
                <div style="background:#333;border-radius:4px;height:8px;margin-bottom:5px;">
                    <div style="background:${config.color};height:100%;border-radius:4px;width:${progress}%;transition:width 0.3s;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.85em;">
                    <span style="color:#aaa;">下次产出: ${timeToNext > 0 ? formatTime(timeToNext) : '可采集'}</span>
                    <span style="color:#4caf50;">+${output}</span>
                </div>
                <div style="display:flex;gap:5px;margin-top:8px;">
                    <button class="btn" style="background:#4caf50;color:white;font-size:0.8em;flex:1;" onclick="collectFarmingNodeResource('${nodeId}')" ${timeToNext > 0 ? 'disabled' : ''}>采集</button>
                    <button class="btn" style="background:#ff9800;color:white;font-size:0.8em;flex:1;" onclick="upgradeFarmingNode('${nodeId}')">升级</button>
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
    openModal('仙界 farming', html, []);
}

function showFarmingNodes() {
    const fs = farmingState;

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #4caf50;border-radius:12px;padding:20px;max-width:600px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#4caf50;text-align:center;margin-bottom:15px;">⛏️ 建造资源节点</h2>
            <p style="color:#aaa;text-align:center;margin-bottom:15px;font-size:0.9em;">最多建造 ${FARMING_CONFIG.maxAutoResources} 个节点</p>

            <div style="display:grid;gap:10px;">`;
    Object.entries(FARMING_NODES).forEach(([nodeId, config]) => {
        const existing = fs.nodes[nodeId];
        const canBuild = !existing && Object.keys(fs.nodes).length < FARMING_CONFIG.maxAutoResources;
        const cost = config.upgradeCost;

        html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${existing ? '#4caf50' : '#555'};border-radius:8px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div>
                    <span style="color:${config.color};font-weight:bold;font-size:1.1em;">${config.icon} ${nodeId}</span>
                    ${existing ? `<span style="color:#ff9800;margin-left:5px;">Lv.${existing.level}</span>` : ''}
                </div>
                <div style="color:#aaa;font-size:0.85em;">${config.desc}</div>
            </div>
            <div style="color:#aaa;font-size:0.85em;margin-bottom:8px;">
                产出: ${config.baseOutput} ${config.resource} / ${config.outputInterval / 3600000}小时
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="color:#aaa;font-size:0.85em;">💎 ${cost.stones.toLocaleString()}</span>
                    <span style="color:#aaa;font-size:0.85em;margin-left:10px;">🌿 ${cost.herbs || 0}</span>
                </div>
                ${existing
                    ? `<button class="btn" style="background:#555;color:#888;font-size:0.85em;" disabled>已建造</button>`
                    : canBuild
                        ? `<button class="btn" style="background:#4caf50;color:white;" onclick="buildFarmingNode('${nodeId}')">建造</button>`
                        : `<button class="btn" style="background:#555;color:#888;font-size:0.85em;" disabled>节点已满</button>`
                }
            </div>
        </div>`;
    });
    html += `</div>

            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="openFarmingPanel()">返回</button>
            </div>
        </div>
    </div>`;
    openModal('资源节点', html, []);
}

function buildFarmingNode(nodeId) {
    const config = FARMING_NODES[nodeId];
    if (!config) return;

    if (Object.keys(farmingState.nodes).length >= FARMING_CONFIG.maxAutoResources) {
        addLog('资源节点数量已达上限', '#f44336');
        return;
    }

    if (farmingState.nodes[nodeId]) {
        addLog('该节点已存在', '#f44336');
        return;
    }

    const cost = config.upgradeCost;
    if (gameState.spiritStones < cost.stones || (gameState.herbs || 0) < (cost.herbs || 0)) {
        addLog('资源不足', '#f44336');
        return;
    }

    gameState.spiritStones -= cost.stones;
    gameState.herbs = (gameState.herbs || 0) - (cost.herbs || 0);

    farmingState.nodes[nodeId] = {
        level: 1,
        lastCollect: Date.now(),
        totalOutput: 0
    };

    addLog(`⛏️ 建造「${nodeId}」成功！`, '#4caf50');
    saveFarmingState();
    updateDisplay();
    showFarmingNodes();
}

function upgradeFarmingNode(nodeId) {
    const config = FARMING_NODES[nodeId];
    const nodeData = farmingState.nodes[nodeId];
    if (!config || !nodeData) return;

    if (nodeData.level >= config.maxLevel) {
        addLog('已达最高等级', '#f44336');
        return;
    }

    const cost = {
        stones: Math.floor(config.upgradeCost.stones * Math.pow(1.5, nodeData.level)),
        herbs: Math.floor((config.upgradeCost.herbs || 0) * Math.pow(1.5, nodeData.level))
    };

    if (gameState.spiritStones < cost.stones || (gameState.herbs || 0) < cost.herbs) {
        addLog('资源不足', '#f44336');
        return;
    }

    gameState.spiritStones -= cost.stones;
    gameState.herbs = (gameState.herbs || 0) - cost.herbs;

    nodeData.level++;
    addLog(`⬆️ 「${nodeId}」升级至 Lv.${nodeData.level}！`, '#ff9800');
    saveFarmingState();
    updateDisplay();
    openFarmingPanel();
}

function collectFarmingNodeResource(nodeId) {
    const config = FARMING_NODES[nodeId];
    const nodeData = farmingState.nodes[nodeId];
    if (!config || !nodeData) return;

    const now = Date.now();
    const timeSinceLast = now - (nodeData.lastCollect || 0);

    if (timeSinceLast < config.outputInterval) {
        addLog('资源尚未产出', '#f44336');
        return;
    }

    // 计算产出
    let output = Math.round(config.baseOutput * Math.pow(config.upgradeBonus, nodeData.level - 1) * getFarmingEfficiencyBonus());

    // 暴击检查
    let isCrit = false;
    if (Math.random() < getFarmingCritChance()) {
        output = Math.round(output * 2);
        isCrit = true;
    }

    // 添加资源
    switch (config.resource) {
        case 'spiritStones':
            gameState.spiritStones += output;
            break;
        case 'herbs':
            gameState.herbs = (gameState.herbs || 0) + output;
            break;
        case 'materials':
            gameState.materials = (gameState.materials || 0) + output;
            break;
        case 'qi':
            gameState.qi = Math.min(gameState.maxQi, gameState.qi + output);
            break;
        case 'petExp':
            if (gameState.spiritPets && gameState.spiritPets.pets.length > 0) {
                gameState.spiritPets.pets[0].exp = (gameState.spiritPets.pets[0].exp || 0) + output;
            }
            break;
    }

    nodeData.lastCollect = now;
    nodeData.totalOutput = (nodeData.totalOutput || 0) + output;

    const critText = isCrit ? ' 🎯暴击！' : '';
    addLog(`📥 采集「${nodeId}」获得 ${output} ${config.resource}${critText}`, '#4caf50');

    saveFarmingState();
    updateDisplay();
    openFarmingPanel();
}

function collectAllResources() {
    let totalCollected = 0;
    Object.keys(farmingState.nodes).forEach(nodeId => {
        const config = FARMING_NODES[nodeId];
        const nodeData = farmingState.nodes[nodeId];
        if (!config || !nodeData) return;

        const now = Date.now();
        const timeSinceLast = now - (nodeData.lastCollect || 0);

        if (timeSinceLast >= config.outputInterval) {
            let output = Math.round(config.baseOutput * Math.pow(config.upgradeBonus, nodeData.level - 1) * getFarmingEfficiencyBonus());
            if (Math.random() < getFarmingCritChance()) {
                output = Math.round(output * 2);
            }

            switch (config.resource) {
                case 'spiritStones':
                    gameState.spiritStones += output;
                    break;
                case 'herbs':
                    gameState.herbs = (gameState.herbs || 0) + output;
                    break;
                case 'materials':
                    gameState.materials = (gameState.materials || 0) + output;
                    break;
            }

            nodeData.lastCollect = now;
            nodeData.totalOutput = (nodeData.totalOutput || 0) + output;
            totalCollected++;
        }
    });

    if (totalCollected > 0) {
        addLog(`📥 一键采集 ${totalCollected} 个节点完成！`, '#4caf50');
        saveFarmingState();
        updateDisplay();
    } else {
        addLog('暂无资源可采集', '#ff9800');
    }
    openFarmingPanel();
}

function showFarmingUpgrades() {
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #2196f3;border-radius:12px;padding:20px;max-width:500px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#2196f3;text-align:center;margin-bottom:15px;">⬆️ 全局升级</h2>

            <div style="display:grid;gap:10px;">`;
    Object.entries(FARMING_UPGRADES).forEach(([upgradeId, config]) => {
        const currentLevel = farmingState.upgrades[upgradeId] || 0;
        const isMaxed = currentLevel >= config.maxLevel;
        const cost = { stones: config.cost.stones * (currentLevel + 1) };
        const canAfford = gameState.spiritStones >= cost.stones;

        html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${isMaxed ? '#4caf50' : '#555'};border-radius:8px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                <div>
                    <span style="font-size:1.2em;">${config.icon}</span>
                    <span style="color:#ffd700;font-weight:bold;margin-left:5px;">${upgradeId}</span>
                </div>
                <div style="color:#aaa;font-size:0.85em;">Lv.${currentLevel}/${config.maxLevel}</div>
            </div>
            <div style="color:#aaa;font-size:0.85em;margin-bottom:8px;">${config.desc}</div>
            ${isMaxed
                ? `<button class="btn" style="background:#555;color:#888;width:100%;" disabled>已满级</button>`
                : `<button class="btn" style="background:${canAfford ? '#2196f3' : '#555'};color:white;width:100%;"
                    onclick="upgradeFarmingGlobal('${upgradeId}')" ${canAfford ? '' : 'disabled'}>
                    升级 (💎 ${cost.stones.toLocaleString()})
                </button>`
            }
        </div>`;
    });
    html += `</div>

            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="openFarmingPanel()">返回</button>
            </div>
        </div>
    </div>`;
    openModal('全局升级', html, []);
}

function upgradeFarmingGlobal(upgradeId) {
    const config = FARMING_UPGRADES[upgradeId];
    if (!config) return;

    const currentLevel = farmingState.upgrades[upgradeId] || 0;
    if (currentLevel >= config.maxLevel) {
        addLog('已达最高等级', '#f44336');
        return;
    }

    const cost = { stones: config.cost.stones * (currentLevel + 1) };
    if (gameState.spiritStones < cost.stones) {
        addLog('灵石不足', '#f44336');
        return;
    }

    gameState.spiritStones -= cost.stones;
    farmingState.upgrades[upgradeId] = currentLevel + 1;

    addLog(`⬆️ 全局升级「${upgradeId}」升至 Lv.${currentLevel + 1}！`, '#2196f3');
    saveFarmingState();
    updateDisplay();
    showFarmingUpgrades();
}

function getFarmingEfficiencyBonus() {
    let bonus = 1.0;

    // 全局效率提升
    const effLevel = farmingState.upgrades['效率提升'] || 0;
    bonus += effLevel * 0.2;

    // 节点加成
    Object.values(farmingState.nodes).forEach(node => {
        bonus += (node.level - 1) * 0.05;
    });

    return bonus;
}

function getOfflineHours() {
    let hours = 0;
    const level = farmingState.upgrades['离线收益'] || 0;
    hours = 12 * level;
    return hours;
}

function getFarmingCritChance() {
    const level = farmingState.upgrades['暴击倍率'] || 0;
    return level * 0.1;
}

function calculateOfflineEarnings() {
    const fs = farmingState;
    const now = Date.now();
    const lastOnline = fs.lastOnlineTime || now;
    const maxOfflineMs = getOfflineHours() * 3600000;
    const offlineMs = Math.min(now - lastOnline, maxOfflineMs);

    if (offlineMs < 60000) return { total: 0, byResource: {} };

    const byResource = {};
    let total = 0;

    Object.entries(fs.nodes).forEach(([nodeId, nodeData]) => {
        const config = FARMING_NODES[nodeId];
        if (!config) return;

        const timeSinceLast = now - (nodeData.lastCollect || 0);
        if (timeSinceLast >= config.outputInterval) {
            // 计算错过的产出次数
            const missedIntervals = Math.floor((offlineMs - timeSinceLast) / config.outputInterval);
            let output = Math.round(config.baseOutput * Math.pow(config.upgradeBonus, nodeData.level - 1) * getFarmingEfficiencyBonus() * missedIntervals);

            if (output > 0) {
                byResource[config.resource] = (byResource[config.resource] || 0) + output;
                total += output;
            }
        }
    });

    return { total, byResource };
}

function claimOfflineEarnings() {
    const earnings = calculateOfflineEarnings();
    if (earnings.total <= 0) {
        addLog('无可领取的离线收益', '#ff9800');
        return;
    }

    Object.entries(earnings.byResource).forEach(([resource, amount]) => {
        switch (resource) {
            case 'spiritStones':
                gameState.spiritStones += amount;
                break;
            case 'herbs':
                gameState.herbs = (gameState.herbs || 0) + amount;
                break;
            case 'materials':
                gameState.materials = (gameState.materials || 0) + amount;
                break;
        }
    });

    addLog(`💤 领取离线收益：${earnings.total} 资源！`, '#2196f3');
    farmingState.lastOnlineTime = Date.now();
    saveFarmingState();
    updateDisplay();
    openFarmingPanel();
}

function updateFarmingState() {
    // 从 gameState 恢复 farmingState
    if (!farmingState.lastOnlineTime) {
        farmingState.lastOnlineTime = Date.now();
    }
}

function saveFarmingState() {
    // farmingState 保存在内存中，下次打开时恢复
}

function processFarmingTick() {
    const now = Date.now();
    const fs = farmingState;

    // 自动采集
    const autoCollect = (farmingState.upgrades['自动采集'] || 0) >= 1;
    if (autoCollect && now - fs.lastAutoCollect > 60000) {
        collectAllResources();
        fs.lastAutoCollect = now;
    }
}

function onFarmingClose() {
    // 记录离线时间
    farmingState.lastOnlineTime = Date.now();
    saveFarmingState();
}


