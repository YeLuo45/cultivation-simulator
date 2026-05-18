// Auto-generated module: palace.js
'use strict';

// ===== PALACE CONSTANTS (V43) =====
const PALACE_CONFIG = {
    maxPalaceLevel: 10,
    upgradeDaysBase: 7,
    resourceTypes: ['灵石', '灵草', '矿石', '仙露'],
    buildingSlots: 6,
    workerSlots: 4,
    serendipityChanceBase: 0.05,
    cultivationSpeedBase: 0.1
};

const PALACE_BUILDINGS = {
    // 建筑类型
    '聚灵阵': {
        icon: '🔮',
        desc: '提升修炼速度',
        maxLevel: 5,
        effects: { cultivationSpeed: 0.05 },
        cost: { stones: 5000, materials: 100 },
        upgradeTime: 5
    },
    '藏经阁': {
        icon: '📚',
        desc: '提升功法领悟速度',
        maxLevel: 5,
        effects: { comprehensionSpeed: 0.05 },
        cost: { stones: 8000, materials: 150 },
        upgradeTime: 7
    },
    '炼丹房': {
        icon: '⚗️',
        desc: '炼制丹药成功率提升',
        maxLevel: 5,
        effects: { alchemySuccess: 0.03 },
        cost: { stones: 10000, materials: 200 },
        upgradeTime: 7
    },
    '灵兽园': {
        icon: '🦌',
        desc: '仙宠经验获取增加',
        maxLevel: 5,
        effects: { petExpBonus: 0.05 },
        cost: { stones: 7000, materials: 120 },
        upgradeTime: 6
    },
    '天机阁': {
        icon: '🔭',
        desc: '奇遇概率提升',
        maxLevel: 5,
        effects: { serendipityChance: 0.02 },
        cost: { stones: 12000, materials: 250 },
        upgradeTime: 10
    },
    '演武场': {
        icon: '⚔️',
        desc: '战斗属性加成',
        maxLevel: 5,
        effects: { combatPower: 0.05 },
        cost: { stones: 9000, materials: 180 },
        upgradeTime: 8
    },
    '聚宝阁': {
        icon: '💎',
        desc: '灵石产量增加',
        maxLevel: 5,
        effects: { incomeBonus: 0.05 },
        cost: { stones: 15000, materials: 300 },
        upgradeTime: 12
    },
    '悟道堂': {
        icon: '🧘',
        desc: '法则领悟速度提升',
        maxLevel: 3,
        effects: { lawComprehension: 0.05 },
        cost: { stones: 20000, materials: 400 },
        upgradeTime: 15
    }
};

const PALACE_WORKERS = {
    '杂役弟子': {
        icon: '👣',
        cost: 100,
        dailyCost: 10,
        task: 'resource',
        efficiency: 1.0
    },
    '炼丹学徒': {
        icon: '🧪',
        cost: 500,
        dailyCost: 50,
        task: 'alchemy',
        efficiency: 1.2
    },
    '护法长老': {
        icon: '👴',
        cost: 2000,
        dailyCost: 200,
        task: 'protection',
        efficiency: 1.5
    },
    '仙缘使者': {
        icon: '🧧',
        cost: 5000,
        dailyCost: 500,
        task: 'serendipity',
        efficiency: 2.0
    }
};

const PALACE_STYLES = [
    { name: '简约古朴', color: '#8d6e63', bonus: {} },
    { name: '华丽璀璨', color: '#ffd700', bonus: { fame: 0.2 } },
    { name: '神秘幽深', color: '#7b1fa2', bonus: { cultivationSpeed: 0.15 } },
    { name: '威严庄重', color: '#c62828', bonus: { combatPower: 0.15 } },
    { name: '清新雅致', color: '#26a69a', bonus: { serendipityChance: 0.2 } }
];

// ===== PALACE FUNCTIONS =====

function openPalace() {
    const palace = gameState.palace;
    const player = gameState;
    const now = Date.now();

    // 检查是否有升级中的建筑
    const upgradingBuilding = palace.buildings.find(b => b.upgrading && b.upgradeEndTime && now < b.upgradeEndTime);

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:950px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:10px;">🏯 仙宫建设</h2>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:15px;">
                <div style="background:rgba(156,39,176,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">仙宫等级</div>
                    <div style="color:#ffd700;font-size:1.3em;font-weight:bold;">Lv.${palace.level}</div>
                </div>
                <div style="background:rgba(156,39,176,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">繁荣度</div>
                    <div style="color:#4caf50;font-size:1.3em;font-weight:bold;">${palace.prosperity}</div>
                </div>
                <div style="background:rgba(156,39,176,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">建筑数</div>
                    <div style="color:#2196f3;font-size:1.3em;font-weight:bold;">${palace.buildings.length}/${PALACE_CONFIG.buildingSlots}</div>
                </div>
                <div style="background:rgba(156,39,176,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">门客数</div>
                    <div style="color:#ff9800;font-size:1.3em;font-weight:bold;">${palace.workers.length}/${PALACE_CONFIG.workerSlots}</div>
                </div>
            </div>

            <div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn" style="background:#4caf50;color:white;" onclick="showPalaceBuildOptions()">🏗️ 建造建筑</button>
                <button class="btn" style="background:#ff9800;color:white;" onclick="showPalaceWorkers()">👥 招募门客</button>
                <button class="btn" style="background:#2196f3;color:white;" onclick="showPalaceStyles()">🎨 仙宫风格</button>
                <button class="btn" style="background:#9c27b0;color:white;" onclick="upgradePalace()">⬆️ 升级仙宫</button>
            </div>`;

    // 升级提示
    if (upgradingBuilding) {
        const timeLeft = Math.ceil((upgradingBuilding.upgradeEndTime - now) / 86400000);
        html += `<div style="background:rgba(255,152,0,0.2);padding:10px;border-radius:8px;margin-bottom:15px;text-align:center;">
            <span style="color:#ff9800;">⏳ ${upgradingBuilding.name} 升级中，剩余 ${timeLeft} 天</span>
        </div>`;
    }

    // 当前仙宫风格效果
    const style = PALACE_STYLES[palace.styleIndex] || PALACE_STYLES[0];
    html += `<div style="background:rgba(${hexToRgb(style.color)},0.2);padding:10px;border-radius:8px;margin-bottom:15px;text-align:center;">
        <span style="color:${style.color};">当前风格：${style.name}</span>
        ${Object.keys(style.bonus).length > 0 ? `<span style="color:#aaa;margin-left:10px;">效果: ${formatStyleBonus(style.bonus)}</span>` : ''}
    </div>`;

    // 建筑列表
    html += `<div style="margin-bottom:15px;">
        <h3 style="color:#ffd700;margin-bottom:10px;">🏛️ 建筑列表</h3>`;

    if (palace.buildings.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">尚未建造任何建筑</p>`;
    } else {
        html += `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">`;
        palace.buildings.forEach((building, idx) => {
            const config = PALACE_BUILDINGS[building.type];
            const progress = building.upgrading && building.upgradeEndTime
                ? Math.max(0, Math.floor((now - building.upgradeStartTime) / (building.upgradeEndTime - building.upgradeStartTime) * 100))
                : 100;

            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid #555;border-radius:8px;padding:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span style="color:#ffd700;font-weight:bold;font-size:1.1em;">${config?.icon || '🏛️'} ${building.type}</span>
                        <span style="color:#ff9800;margin-left:5px;">Lv.${building.level}</span>
                    </div>
                    <div style="color:#aaa;font-size:0.85em;">${building.upgrading ? `升级中 ${progress}%` : '正常'}</div>
                </div>
                <div style="color:#aaa;font-size:0.85em;margin:5px 0;">${config?.desc || ''}</div>
                <div style="color:#888;font-size:0.8em;">效果: ${formatBuildingEffects(building)}</div>
                ${building.level < (config?.maxLevel || 5) && !building.upgrading ? `
                    <button class="btn" style="background:#ff9800;color:white;width:100%;margin-top:8px;font-size:0.85em;"
                        onclick="upgradeBuilding(${idx})">升级 (${formatUpgradeCost(building, config)})</button>
                ` : ''}
            </div>`;
        });
        html += `</div>`;
    }
    html += `</div>`;

    // 门客列表
    html += `<div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin-bottom:15px;">
        <h3 style="color:#ffd700;margin-bottom:8px;">👥 门客（${palace.workers.length}/${PALACE_CONFIG.workerSlots}）</h3>`;

    if (palace.workers.length === 0) {
        html += `<p style="color:#aaa;text-align:center;font-size:0.9em;">尚未招募门客</p>`;
    } else {
        html += `<div style="display:flex;gap:8px;flex-wrap:wrap;">`;
        palace.workers.forEach((worker, idx) => {
            const config = PALACE_WORKERS[worker.type];
            html += `<div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:5px;text-align:center;min-width:80px;">
                <div style="font-size:1.5em;">${config?.icon || '👤'}</div>
                <div style="color:#ffd700;font-size:0.85em;">${worker.type}</div>
                <div style="color:#aaa;font-size:0.75em;">效率x${config?.efficiency || 1}</div>
                <button class="btn" style="background:#f44336;color:white;font-size:0.75em;padding:2px 8px;margin-top:4px;"
                    onclick="dismissWorker(${idx})">解雇</button>
            </div>`;
        });
        html += `</div>`;
    }
    html += `</div>`;

    // 每日收益
    html += `<div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin-bottom:15px;">
        <h4 style="color:#ffd700;margin-bottom:8px;">📊 仙宫收益</h4>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:0.9em;">
            <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">灵石产量</span><span style="color:#4caf50;">+${palace.bonus.incomeBonus || 0}%</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">修炼速度</span><span style="color:#4caf50;">+${palace.bonus.cultivationSpeed || 0}%</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">奇遇概率</span><span style="color:#4caf50;">+${palace.bonus.serendipityChance || 0}%</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">战斗力</span><span style="color:#4caf50;">+${palace.bonus.combatPower || 0}%</span></div>
        </div>
    </div>`;

    // 升级仙宫条件
    const nextLevelCost = getPalaceUpgradeCost(palace.level);
    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
    </div></div></div>`;
    openModal('仙宫建设', html, []);
}

function showPalaceBuildOptions() {
    const palace = gameState.palace;

    if (palace.buildings.length >= PALACE_CONFIG.buildingSlots) {
        addLog('建筑数量已达上限', '#f44336');
        return;
    }

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #4caf50;border-radius:12px;padding:20px;max-width:600px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#4caf50;text-align:center;margin-bottom:15px;">🏗️ 建造建筑</h2>

            <div style="display:grid;gap:10px;">`;
    Object.entries(PALACE_BUILDINGS).forEach(([type, config]) => {
        // 检查是否已满级
        const existing = palace.buildings.find(b => b.type === type);
        if (existing && existing.level >= config.maxLevel) {
            return; // 跳过已满级建筑
        }

        const cost = existing
            ? { stones: config.cost.stones * (existing.level + 1), materials: config.cost.materials * (existing.level + 1) }
            : config.cost;
        const canAfford = gameState.spiritStones >= cost.stones && (gameState.materials || 0) >= cost.materials;

        html += `<div style="background:rgba(0,0,0,0.3);border:1px solid #555;border-radius:8px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="color:#ffd700;font-weight:bold;font-size:1.1em;">${config.icon} ${type}</span>
                    <span style="color:#ff9800;margin-left:5px;">${existing ? `Lv.${existing.level}→${existing.level + 1}` : '新建'}</span>
                </div>
                <div style="color:#aaa;font-size:0.85em;">${config.desc}</div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                <div>
                    <span style="color:#aaa;font-size:0.85em;">💎 ${cost.stones.toLocaleString()}</span>
                    <span style="color:#aaa;font-size:0.85em;margin-left:10px;">📦 ${cost.materials}</span>
                </div>
                <button class="btn" style="background:${canAfford ? '#4caf50' : '#555'};color:white;font-size:0.85em;"
                    onclick="buildOrUpgradeBuilding('${type}')" ${canAfford ? '' : 'disabled'}>
                    ${canAfford ? '建造' : '资源不足'}
                </button>
            </div>
        </div>`;
    });
    html += `</div>

            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="openPalace()">返回</button>
            </div>
        </div>
    </div>`;
    openModal('建造建筑', html, []);
}

function buildOrUpgradeBuilding(type) {
    const palace = gameState.palace;
    const config = PALACE_BUILDINGS[type];
    if (!config) return;

    const existing = palace.buildings.find(b => b.type === type);
    const isNew = !existing;

    const cost = isNew
        ? config.cost
        : { stones: config.cost.stones * (existing.level + 1), materials: config.cost.materials * (existing.level + 1) };

    if (gameState.spiritStones < cost.stones || (gameState.materials || 0) < cost.materials) {
        addLog('资源不足', '#f44336');
        return;
    }

    gameState.spiritStones -= cost.stones;
    gameState.materials = (gameState.materials || 0) - cost.materials;

    if (isNew) {
        palace.buildings.push({
            type: type,
            level: 1,
            upgrading: false,
            upgradeStartTime: null,
            upgradeEndTime: null
        });
        addLog(`🏗️ 建造「${type}」成功！`, '#4caf50');
    } else {
        existing.upgrading = true;
        existing.upgradeStartTime = Date.now();
        existing.upgradeEndTime = Date.now() + config.upgradeTime * 86400000;
        addLog(`⬆️ ${type} 开始升级，预计${config.upgradeTime}天`, '#ff9800');
    }

    recalculatePalaceBonus();
    updateDisplay();
    openPalace();
}

function upgradeBuilding(idx) {
    const building = gameState.palace.buildings[idx];
    if (!building) return;
    buildOrUpgradeBuilding(building.type);
}

function showPalaceWorkers() {
    const palace = gameState.palace;

    if (palace.workers.length >= PALACE_CONFIG.workerSlots) {
        addLog('门客数量已达上限', '#f44336');
        return;
    }

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff9800;border-radius:12px;padding:20px;max-width:500px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ff9800;text-align:center;margin-bottom:15px;">👥 招募门客</h2>
            <p style="color:#aaa;text-align:center;margin-bottom:15px;font-size:0.9em;">门客每日需支付工资</p>

            <div style="display:grid;gap:10px;">`;
    Object.entries(PALACE_WORKERS).forEach(([type, config]) => {
        const canAfford = gameState.spiritStones >= config.cost;
        html += `<div style="background:rgba(0,0,0,0.3);border:1px solid #555;border-radius:8px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="font-size:1.5em;">${config.icon}</span>
                    <span style="color:#ffd700;font-weight:bold;margin-left:8px;">${type}</span>
                </div>
                <div style="color:#aaa;font-size:0.85em;">效率x${config.efficiency}</div>
            </div>
            <div style="color:#aaa;font-size:0.85em;margin:5px 0;">任务: ${getWorkerTaskDesc(config.task)} | 日薪: ${config.dailyCost}灵石</div>
            <button class="btn" style="background:${canAfford ? '#4caf50' : '#555'};color:white;width:100%;"
                onclick="recruitWorker('${type}')" ${canAfford ? '' : 'disabled'}>
                ${canAfford ? `招募 (${config.cost}灵石)` : '灵石不足'}
            </button>
        </div>`;
    });
    html += `</div>

            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="openPalace()">返回</button>
            </div>
        </div>
    </div>`;
    openModal('招募门客', html, []);
}

function recruitWorker(type) {
    const config = PALACE_WORKERS[type];
    if (!config) return;

    if (gameState.spiritStones < config.cost) {
        addLog('灵石不足', '#f44336');
        return;
    }

    if (gameState.palace.workers.length >= PALACE_CONFIG.workerSlots) {
        addLog('门客已满', '#f44336');
        return;
    }

    gameState.spiritStones -= config.cost;
    gameState.palace.workers.push({
        type: type,
        recruitedDay: gameState.days
    });

    addLog(`👥 招募${type}成功！`, '#4caf50');
    recalculatePalaceBonus();
    updateDisplay();
    showPalaceWorkers();
}

function dismissWorker(idx) {
    const worker = gameState.palace.workers[idx];
    if (!worker) return;

    gameState.palace.workers.splice(idx, 1);
    addLog(`👋 解雇${worker.type}`, '#ff9800');
    recalculatePalaceBonus();
    updateDisplay();
    openPalace();
}

function showPalaceStyles() {
    const palace = gameState.palace;

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #2196f3;border-radius:12px;padding:20px;max-width:500px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#2196f3;text-align:center;margin-bottom:15px;">🎨 仙宫风格</h2>

            <div style="display:grid;gap:10px;">`;
    PALACE_STYLES.forEach((style, idx) => {
        const isCurrent = palace.styleIndex === idx;
        const canAfford = !isCurrent; // 风格切换暂时免费
        const bonusText = Object.keys(style.bonus).length > 0 ? formatStyleBonus(style.bonus) : '无加成';

        html += `<div style="background:rgba(${hexToRgb(style.color)},0.1);border:2px solid ${isCurrent ? style.color : '#555'};border-radius:8px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="color:${style.color};font-weight:bold;font-size:1.1em;">${style.name}</span>
                    ${isCurrent ? '<span style="color:#ffd700;margin-left:5px;">[当前]</span>' : ''}
                </div>
                <div style="color:#aaa;font-size:0.85em;">${bonusText}</div>
            </div>
            <div style="margin-top:8px;">
                <button class="btn" style="background:${isCurrent ? '#555' : '#2196f3'};color:white;width:100%;"
                    onclick="changePalaceStyle(${idx})" ${isCurrent ? 'disabled' : ''}>
                    ${isCurrent ? '已启用' : '切换风格'}
                </button>
            </div>
        </div>`;
    });
    html += `</div>

            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="openPalace()">返回</button>
            </div>
        </div>
    </div>`;
    openModal('仙宫风格', html, []);
}

function changePalaceStyle(idx) {
    const palace = gameState.palace;
    palace.styleIndex = idx;
    recalculatePalaceBonus();
    addLog(`🎨 仙宫风格切换为「${PALACE_STYLES[idx].name}」`, '#2196f3');
    updateDisplay();
    showPalaceStyles();
}

function upgradePalace() {
    const palace = gameState.palace;
    if (palace.level >= PALACE_CONFIG.maxPalaceLevel) {
        addLog('仙宫已达最高等级', '#f44336');
        return;
    }

    const cost = getPalaceUpgradeCost(palace.level);

    if (gameState.spiritStones < cost.stones || (gameState.materials || 0) < cost.materials) {
        addLog('资源不足', '#f44336');
        return;
    }

    if (palace.prosperity < cost.prosperity) {
        addLog(`繁荣度不足，还需${cost.prosperity - palace.prosperity}点`, '#f44336');
        return;
    }

    gameState.spiritStones -= cost.stones;
    gameState.materials = (gameState.materials || 0) - cost.materials;
    palace.level++;
    palace.prosperity = Math.floor(palace.prosperity * 0.8); // 升级后繁荣度降低

    addLog(`🏯 仙宫升级至 Lv.${palace.level}！`, '#9c27b0');
    recalculatePalaceBonus();
    updateDisplay();
    openPalace();
}

function recalculatePalaceBonus() {
    const palace = gameState.palace;
    const style = PALACE_STYLES[palace.styleIndex] || PALACE_STYLES[0];

    // 重置基础加成
    let bonus = {
        incomeBonus: 0,
        cultivationSpeed: 0,
        serendipityChance: 0,
        combatPower: 0,
        comprehensionSpeed: 0,
        alchemySuccess: 0,
        petExpBonus: 0,
        lawComprehension: 0
    };

    // 计算建筑加成
    palace.buildings.forEach(building => {
        const config = PALACE_BUILDINGS[building.type];
        if (config && config.effects) {
            Object.entries(config.effects).forEach(([key, value]) => {
                if (bonus[key] !== undefined) {
                    bonus[key] += value * building.level;
                }
            });
        }
    });

    // 门客加成
    palace.workers.forEach(worker => {
        const config = PALACE_WORKERS[worker.type];
        if (config) {
            if (config.task === 'resource') {
                bonus.incomeBonus += 0.02 * config.efficiency;
            } else if (config.task === 'serendipity') {
                bonus.serendipityChance += 0.01 * config.efficiency;
            } else if (config.task === 'protection') {
                bonus.combatPower += 0.03 * config.efficiency;
            }
        }
    });

    // 仙宫等级加成
    bonus.incomeBonus += palace.level * 0.02;
    bonus.cultivationSpeed += palace.level * 0.01;

    // 风格加成
    if (style.bonus) {
        Object.entries(style.bonus).forEach(([key, value]) => {
            if (bonus[key] !== undefined) {
                bonus[key] += value;
            }
        });
    }

    palace.bonus = bonus;
}

function getPalaceUpgradeCost(level) {
    return {
        stones: Math.floor(20000 * Math.pow(1.8, level)),
        materials: Math.floor(500 * Math.pow(1.5, level)),
        prosperity: 100 + level * 50
    };
}

function formatUpgradeCost(building, config) {
    if (!config) return '';
    const cost = {
        stones: config.cost.stones * (building.level + 1),
        materials: config.cost.materials * (building.level + 1)
    };
    return `💎${cost.stones} 📦${cost.materials}`;
}

function formatBuildingEffects(building) {
    const config = PALACE_BUILDINGS[building.type];
    if (!config || !config.effects) return '无';

    return Object.entries(config.effects)
        .map(([key, value]) => {
            const effectNames = {
                cultivationSpeed: '修炼速度',
                comprehensionSpeed: '领悟速度',
                alchemySuccess: '炼丹成功率',
                petExpBonus: '仙宠经验',
                serendipityChance: '奇遇概率',
                combatPower: '战斗力',
                incomeBonus: '灵石产量',
                lawComprehension: '法则领悟'
            };
            return `+${(value * building.level * 100).toFixed(0)}% ${effectNames[key] || key}`;
        })
        .join(', ');
}

function formatStyleBonus(bonus) {
    return Object.entries(bonus)
        .map(([key, value]) => {
            const names = {
                fame: '声望',
                cultivationSpeed: '修炼速度',
                combatPower: '战斗力',
                serendipityChance: '奇遇概率'
            };
            return `+${(value * 100).toFixed(0)}% ${names[key] || key}`;
        })
        .join(', ');
}

function getWorkerTaskDesc(task) {
    const descs = {
        resource: '资源采集',
        alchemy: '丹药炼制',
        protection: '仙宫守护',
        serendipity: '奇遇搜寻'
    };
    return descs[task] || task;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
        : '0,0,0';
}

function processDailyPalace() {
    const palace = gameState.palace;
    const now = Date.now();

    // 1. 处理建筑升级
    palace.buildings.forEach(building => {
        if (building.upgrading && building.upgradeEndTime && now >= building.upgradeEndTime) {
            building.level++;
            building.upgrading = false;
            building.upgradeStartTime = null;
            building.upgradeEndTime = null;
            addLog(`🏛️ ${building.type} 升级完成！现在是 Lv.${building.level}`, '#4caf50');
        }
    });

    // 2. 支付门客工资
    let totalWage = 0;
    palace.workers.forEach(worker => {
        const config = PALACE_WORKERS[worker.type];
        if (config) {
            totalWage += config.dailyCost;
        }
    });

    if (totalWage > 0 && gameState.spiritStones >= totalWage) {
        gameState.spiritStones -= totalWage;
        palace.totalWagesPaid = (palace.totalWagesPaid || 0) + totalWage;
    }

    // 3. 更新繁荣度
    const prosperityGain = Math.floor(palace.level * 2 + Math.random() * palace.level);
    palace.prosperity += prosperityGain;

    // 4. 资源自动产出（基于建筑和门客）
    if (palace.bonus.incomeBonus > 0) {
        const resourceGain = Math.floor(100 * palace.bonus.incomeBonus);
        gameState.spiritStones += resourceGain;
    }

    // 5. 触发仙宫奇遇
    if (palace.bonus.serendipityChance > 0 && Math.random() < palace.bonus.serendipityChance) {
        triggerPalaceSerendipity();
    }

    recalculatePalaceBonus();
}

function triggerPalaceSerendipity() {
    const events = [
        { type: 'stones', amount: 1000, desc: '打扫仙宫时发现散落的灵石' },
        { type: 'materials', amount: 50, desc: '在废墟中发现珍贵矿石' },
        { type: 'pet', desc: '一只野生的仙兽路过你的仙宫' },
        { type: 'comprehension', desc: '仙宫气场让你有所领悟' }
    ];

    const event = events[Math.floor(Math.random() * events.length)];

    switch (event.type) {
        case 'stones':
            gameState.spiritStones += event.amount;
            addLog(`🌟 仙宫奇遇：${event.desc}，获得${event.amount}灵石`, '#ffd700');
            break;
        case 'materials':
            gameState.materials = (gameState.materials || 0) + event.amount;
            addLog(`🌟 仙宫奇遇：${event.desc}，获得${event.amount}矿石`, '#ffd700');
            break;
        case 'pet':
            if (gameState.spiritPets && gameState.spiritPets.pets.length < 5) {
                addLog(`🌟 仙宫奇遇：${event.desc}！`, '#ffd700');
            }
            break;
        case 'comprehension':
            if (gameState.cultivation && gameState.cultivation.comprehension) {
                gameState.cultivation.comprehension += 5;
                addLog(`🌟 仙宫奇遇：${event.desc}，领悟+5`, '#9c27b0');
            }
            break;
    }
}

function getPalaceStats() {
    const palace = gameState.palace;
    return {
        level: palace.level,
        prosperity: palace.prosperity,
        buildings: palace.buildings.length,
        workers: palace.workers.length,
        bonus: palace.bonus
    };
}