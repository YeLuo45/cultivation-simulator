// Auto-generated module: economy.js
'use strict';

// ===== ECONOMY CONSTANTS (V41) =====
const ECONOMY_CONFIG = {
    // 灵石通胀控制
    baseIncomeRate: 1.0,       // 基础收入倍率
    inflationRate: 0.02,       // 每日通胀率2%
    maxSpiritStones: 999999999, // 灵石上限

    // 灵石 sinks（消耗渠道）
    repairCostPercent: 0.05,   // 装备维修5%
    upgradeWastePercent: 0.1,  // 强化失败损失10%
    tradeTaxRate: 0.03,        // 交易税3%
    auctionFeeRate: 0.03,      // 拍卖手续费3%
    realmTransitionTax: 0.15,  // 境界突破税15%

    // 灵石 source（产出渠道）
    dailyBaseIncome: 50,        // 基础每日收入
    cultivationIncomeBonus: 10, // 修炼等级加成
    sectIncomeBonus: 5,         // 宗门等级加成
    combatWinBonus: 100,        // 战斗胜利奖励
    serendipityBonus: 200,      // 奇遇奖励

    // 经济周期
    economicCycleDays: 7,       // 经济周期7天
    taxHolidayDays: 30          // 新手免税期30天
};

const LUXURY_ITEMS = {
    // 奢侈品（大型灵石 sinks）
    '悟道丹': { cost: 50000, effect: '悟道速度+50%', sink: true },
    '破天丹': { cost: 100000, effect: '突破成功率+20%', sink: true },
    '仙缘果': { cost: 30000, effect: '奇遇概率+30%', sink: true },
    '聚灵阵图纸': { cost: 80000, effect: '修炼速度+30%', sink: true },
    '仙宠进化丹': { cost: 50000, effect: '仙宠必定进化', sink: true },
    '天劫护符': { cost: 150000, effect: '渡劫伤害-30%', sink: true },
    '轮回镜': { cost: 200000, effect: '天道轮回冷却-50%', sink: true },
    '造化鼎': { cost: 300000, effect: '炼制仙丹成功率+40%', sink: true }
};

const ECONOMIC_EVENTS = {
    // 随机经济事件
    '灵石矿脉发现': { type: 'source', minAmount: 5000, maxAmount: 50000, probability: 0.05 },
    '灵脉枯竭': { type: 'sink', minAmount: 1000, maxAmount: 10000, probability: 0.03 },
    '商人大会': { type: 'trade_boost', bonus: 0.2, duration: 3, probability: 0.04 },
    '仙盟悬赏': { type: 'source', minAmount: 3000, maxAmount: 15000, probability: 0.06 },
    '妖兽肆虐': { type: 'sink', minAmount: 2000, maxAmount: 8000, probability: 0.04 },
    '天材地宝成熟': { type: 'source', minAmount: 8000, maxAmount: 30000, probability: 0.03 },
    '经济繁荣': { type: 'income_boost', bonus: 0.3, duration: 5, probability: 0.05 },
    '经济萧条': { type: 'income_reduce', penalty: 0.2, duration: 3, probability: 0.04 }
};

// ===== ECONOMY FUNCTIONS =====

function showEconomyPanel() {
    const eco = gameState.economy;
    const player = gameState;

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ffd700;border-radius:12px;padding:20px;max-width:800px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ffd700;text-align:center;margin-bottom:15px;">💰 仙界经济系统</h2>`;

    // 经济概览
    html += `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:15px;">
        <div style="background:rgba(255,215,0,0.1);padding:12px;border-radius:8px;text-align:center;">
            <div style="color:#aaa;font-size:0.85em;">当前灵石</div>
            <div style="color:#ffd700;font-size:1.5em;font-weight:bold;">${formatEcoNumber(player.spiritStones)}</div>
        </div>
        <div style="background:rgba(255,152,0,0.1);padding:12px;border-radius:8px;text-align:center;">
            <div style="color:#aaa;font-size:0.85em;">通胀率</div>
            <div style="color:#ff9800;font-size:1.5em;font-weight:bold;">${(eco.currentInflation * 100).toFixed(1)}%</div>
        </div>
        <div style="background:rgba(76,175,80,0.1);padding:12px;border-radius:8px;text-align:center;">
            <div style="color:#aaa;font-size:0.85em;">日收入</div>
            <div style="color:#4caf50;font-size:1.5em;font-weight:bold;">+${formatEcoNumber(eco.avgDailyIncome)}</div>
        </div>
        <div style="background:rgba(244,67,54,0.1);padding:12px;border-radius:8px;text-align:center;">
            <div style="color:#aaa;font-size:0.85em;">日支出</div>
            <div style="color:#f44336;font-size:1.5em;font-weight:bold;">-${formatEcoNumber(eco.avgDailyExpense)}</div>
        </div>
    </div>`;

    // 每日交易税
    html += `<div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin-bottom:15px;">
        <h4 style="color:#ffd700;margin-bottom:8px;">🏦 灵石兑换商店</h4>
        <p style="color:#aaa;font-size:0.85em;margin-bottom:10px;">大额灵石兑换（自动扣除3%交易税）</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn" style="background:#333;color:#ffd700;" onclick="exchangeSpiritStones(1000)">💎 1000灵石</button>
            <button class="btn" style="background:#333;color:#ffd700;" onclick="exchangeSpiritStones(5000)">💎 5000灵石</button>
            <button class="btn" style="background:#333;color:#ffd700;" onclick="exchangeSpiritStones(10000)">💎 10000灵石</button>
            <button class="btn" style="background:#333;color:#ffd700;" onclick="exchangeSpiritStones(50000)">💎 50000灵石</button>
        </div>
    </div>`;

    // 奢侈品商店
    html += `<div style="margin-bottom:15px;">
        <h4 style="color:#ffd700;margin-bottom:10px;">🏆 奢侈品商店（大型灵石 sinks）</h4>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">`;
    Object.entries(LUXURY_ITEMS).forEach(([name, data]) => {
        const canAfford = player.spiritStones >= data.cost;
        html += `<div style="background:rgba(0,0,0,0.3);border:1px solid #555;border-radius:8px;padding:10px;">
            <div style="color:#ffd700;font-weight:bold;">${name}</div>
            <div style="color:#aaa;font-size:0.85em;">${data.effect}</div>
            <div style="color:#ffd700;margin:5px 0;">💎 ${formatEcoNumber(data.cost)}</div>
            <button class="btn" style="background:${canAfford ? '#4caf50' : '#555'};color:white;width:100%;font-size:0.85em;"
                onclick="buyLuxuryItem('${name}')" ${canAfford ? '' : 'disabled'}>
                ${canAfford ? '购买' : '灵石不足'}
            </button>
        </div>`;
    });
    html += `</div></div>`;

    // 经济统计
    html += `<div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin-bottom:15px;">
        <h4 style="color:#ffd700;margin-bottom:8px;">📊 经济统计</h4>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:0.9em;">
            <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">累计收入</span><span style="color:#4caf50;">${formatEcoNumber(eco.totalIncome)}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">累计支出</span><span style="color:#f44336;">${formatEcoNumber(eco.totalExpense)}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">累计税收</span><span style="color:#ff9800;">${formatEcoNumber(eco.totalTax)}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">玩家财富</span><span style="color:#ffd700;">${formatEcoNumber(eco.totalWealth)}</span></div>
        </div>
    </div>`;

    // 当前经济事件
    if (eco.activeEvents.length > 0) {
        html += `<div style="background:rgba(156,39,176,0.2);padding:12px;border-radius:8px;margin-bottom:15px;">
            <h4 style="color:#9c27b0;margin-bottom:8px;">🌟 当前经济事件</h4>`;
        eco.activeEvents.forEach(ev => {
            html += `<div style="display:flex;justify-content:space-between;padding:4px;">
                <span style="color:#fff;">${ev.name}</span>
                <span style="color:#aaa;">剩余${ev.daysLeft}天</span>
            </div>`;
        });
        html += `</div>`;
    }

    // 境界转换税提示
    html += `<div style="background:rgba(33,150,243,0.2);padding:12px;border-radius:8px;margin-bottom:15px;">
        <h4 style="color:#2196f3;margin-bottom:5px;">⚠️ 境界突破税务</h4>
        <p style="color:#aaa;font-size:0.85em;">每次境界突破需缴纳当前灵石的15%作为税款</p>
        <p style="color:#ff9800;font-size:0.85em;">当前境界: ${getRealmName(player.realm)} | 预计税款: ~${formatEcoNumber(Math.floor(player.spiritStones * ECONOMY_CONFIG.realmTransitionTax))}灵石</p>
    </div>`;

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
    </div></div></div>`;
    openModal('仙界经济系统', html, []);
}

function exchangeSpiritStones(amount) {
    const tax = Math.floor(amount * ECONOMY_CONFIG.tradeTaxRate);
    const totalCost = amount + tax;

    if (gameState.spiritStones < totalCost) {
        addLog('灵石不足（包含交易税）', '#f44336');
        return;
    }

    gameState.spiritStones -= totalCost;

    // 记录税收
    if (!gameState.economy.totalTax) gameState.economy.totalTax = 0;
    gameState.economy.totalTax += tax;

    // 财富转移（模拟系统消耗）
    trackEconomicFlow('expense', amount + tax);
    addLog(`兑换${amount}灵石，缴纳${tax}灵石交易税`, '#ff9800');
    updateDisplay();
}

function buyLuxuryItem(itemName) {
    const item = LUXURY_ITEMS[itemName];
    if (!item) return;

    if (gameState.spiritStones < item.cost) {
        addLog('灵石不足', '#f44336');
        return;
    }

    gameState.spiritStones -= item.cost;

    // 记录大型 sink
    if (!gameState.economy.luxuryPurchases) gameState.economy.luxuryPurchases = 0;
    gameState.economy.luxuryPurchases++;

    trackEconomicFlow('expense', item.cost);

    // 应用效果
    applyLuxuryEffect(itemName);

    addLog(`购买奢侈品「${itemName}」，效果：${item.effect}`, '#ffd700');
    updateDisplay();
}

function applyLuxuryEffect(itemName) {
    const player = gameState;
    const days = player.days;

    switch (itemName) {
        case '悟道丹':
            // 加速法则领悟
            if (player.celestialLaws) {
                player.celestialLaws.comprehendingProgress = Math.min(100, player.celestialLaws.comprehendingProgress + 50);
            }
            break;
        case '破天丹':
            // 永久提升突破率（记录在buff中）
            if (!player.economyBuffs) player.economyBuffs = {};
            player.economyBuffs.breakthroughBoost = (player.economyBuffs.breakthroughBoost || 0) + 0.2;
            break;
        case '仙缘果':
            if (!player.economyBuffs) player.economyBuffs = {};
            player.economyBuffs.serendipityBoost = (player.economyBuffs.serendipityBoost || 0) + 0.3;
            break;
        case '聚灵阵图纸':
            if (!player.economyBuffs) player.economyBuffs = {};
            player.economyBuffs.cultivateSpeedBoost = (player.economyBuffs.cultivateSpeedBoost || 0) + 0.3;
            break;
        case '仙宠进化丹':
            // 应用在仙宠系统
            if (player.spiritPets && player.spiritPets.pets.length > 0) {
                const pet = player.spiritPets.pets[0];
                if (pet.level >= 10 && pet.bond >= 80) {
                    // 自动进化
                    const evoResult = `进化成功！${pet.type}变得更强大！`;
                    addLog(evoResult, '#9c27b0');
                }
            }
            break;
        case '天劫护符':
            if (!player.economyBuffs) player.economyBuffs = {};
            player.economyBuffs.tribulationDamageReduce = (player.economyBuffs.tribulationDamageReduce || 0) + 0.3;
            break;
        case '轮回镜':
            if (player.sect && player.sect.celestialCycle) {
                player.sect.celestialCycle.cycleInterval = Math.max(1, player.sect.celestialCycle.cycleInterval - 1);
            }
            break;
        case '造化鼎':
            if (!player.economyBuffs) player.economyBuffs = {};
            player.economyBuffs.alchemySuccessBoost = (player.economyBuffs.alchemySuccessBoost || 0) + 0.4;
            break;
    }
}

function trackEconomicFlow(type, amount) {
    const eco = gameState.economy;
    if (!eco.totalIncome) eco.totalIncome = 0;
    if (!eco.totalExpense) eco.totalExpense = 0;
    if (!eco.totalWealth) eco.totalWealth = 0;

    if (type === 'income') {
        eco.totalIncome += amount;
        eco.avgDailyIncome = Math.round(eco.totalIncome / Math.max(1, gameState.days));
    } else if (type === 'expense') {
        eco.totalExpense += amount;
        eco.avgDailyExpense = Math.round(eco.totalExpense / Math.max(1, gameState.days));
    }

    // 财富 = 收入 - 支出
    eco.totalWealth = eco.totalIncome - eco.totalExpense;
}

function processDailyEconomy() {
    const eco = gameState.economy;
    const player = gameState;

    if (!eco.currentInflation) eco.currentInflation = ECONOMY_CONFIG.inflationRate;
    if (!eco.totalIncome) eco.totalIncome = 0;
    if (!eco.totalExpense) eco.totalExpense = 0;
    if (!eco.avgDailyIncome) eco.avgDailyIncome = ECONOMY_CONFIG.dailyBaseIncome;
    if (!eco.avgDailyExpense) eco.avgDailyExpense = 0;
    if (!eco.luxuryPurchases) eco.luxuryPurchases = 0;
    if (!eco.totalTax) eco.totalTax = 0;
    if (!eco.activeEvents) eco.activeEvents = [];

    // 1. 计算玩家日收入
    let dailyIncome = ECONOMY_CONFIG.dailyBaseIncome;
    dailyIncome += ECONOMY_CONFIG.cultivationIncomeBonus * player.realm;
    if (player.sect && player.sect.level) {
        dailyIncome += ECONOMY_CONFIG.sectIncomeBonus * player.sect.level;
    }

    // 经济事件加成
    eco.activeEvents.forEach(ev => {
        if (ev.type === 'income_boost') {
            dailyIncome *= (1 + ev.bonus);
        } else if (ev.type === 'income_reduce') {
            dailyIncome *= (1 - ev.penalty);
        }
    });

    // 财富等级加成（高财富者收入递减）
    const wealthRatio = Math.min(1, player.spiritStones / 100000);
    dailyIncome *= (1 - wealthRatio * 0.3);

    // 2. 应用通胀（灵石购买力下降）
    eco.currentInflation = Math.min(0.1, ECONOMY_CONFIG.inflationRate * (1 + gameState.days / 365));

    // 3. 自动征税（装备维修等）
    const repairTax = Math.floor(player.spiritStones * ECONOMY_CONFIG.repairCostPercent * 0.01);
    if (repairTax > 0 && player.spiritStones > repairTax) {
        player.spiritStones -= repairTax;
        eco.totalExpense += repairTax;
        eco.totalTax += repairTax;
    }

    // 4. 处理活跃经济事件
    eco.activeEvents = eco.activeEvents.filter(ev => {
        ev.daysLeft--;
        return ev.daysLeft > 0;
    });

    // 5. 触发随机经济事件
    triggerRandomEconomicEvent();

    // 6. 记录日均
    eco.avgDailyIncome = Math.round((eco.avgDailyIncome * 0.9 + dailyIncome * 0.1));
    eco.avgDailyExpense = Math.round(eco.avgDailyExpense * 0.95);

    // 7. 灵石上限检查
    if (player.spiritStones > ECONOMY_CONFIG.maxSpiritStones) {
        player.spiritStones = ECONOMY_CONFIG.maxSpiritStones;
    }

    // 8. 每日收入
    player.spiritStones += Math.floor(dailyIncome);
    trackEconomicFlow('income', Math.floor(dailyIncome));

    // 9. 境界突破税（当玩家灵石超过一定阈值时）
    if (player.spiritStones > 100000 && player.days % 30 === 0) {
        const passiveTax = Math.floor(player.spiritStones * 0.01);
        if (passiveTax > 0) {
            player.spiritStones -= passiveTax;
            trackEconomicFlow('expense', passiveTax);
        }
    }
}

function triggerRandomEconomicEvent() {
    const eco = gameState.economy;
    const player = gameState;

    for (const [eventName, eventData] of Object.entries(ECONOMIC_EVENTS)) {
        if (Math.random() < eventData.probability) {
            // 检查是否已有相同类型事件
            if (eco.activeEvents.some(e => e.name === eventName)) continue;

            const event = {
                name: eventName,
                type: eventData.type,
                daysLeft: eventData.duration || 1
            };

            switch (eventData.type) {
                case 'source':
                    const sourceAmount = Math.floor(eventData.minAmount + Math.random() * (eventData.maxAmount - eventData.minAmount));
                    player.spiritStones += sourceAmount;
                    trackEconomicFlow('income', sourceAmount);
                    addLog(`🌟 经济事件「${eventName}」！获得${formatEcoNumber(sourceAmount)}灵石！`, '#ffd700');
                    break;
                case 'sink':
                    const sinkAmount = Math.min(eventData.maxAmount, Math.floor(player.spiritStones * 0.1));
                    player.spiritStones = Math.max(0, player.spiritStones - sinkAmount);
                    trackEconomicFlow('expense', sinkAmount);
                    addLog(`⚠️ 经济事件「${eventName}」！损失${formatEcoNumber(sinkAmount)}灵石！`, '#f44336');
                    break;
                case 'trade_boost':
                case 'income_boost':
                case 'income_reduce':
                    event.bonus = eventData.bonus || 0;
                    event.penalty = eventData.penalty || 0;
                    eco.activeEvents.push(event);
                    addLog(`🌟 经济事件「${eventName}」！效果持续${event.daysLeft}天！`, '#9c27b0');
                    break;
            }
            break; // 一次只触发一个事件
        }
    }
}

function formatEcoNumber(num) {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
}

function showEconomyStats() {
    const eco = gameState.economy;
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ffd700;border-radius:12px;padding:20px;max-width:600px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ffd700;text-align:center;margin-bottom:15px;">📊 经济统计</h2>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                <div style="background:rgba(76,175,80,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#4caf50;">累计收入</div>
                    <div style="color:#4caf50;font-weight:bold;">${formatEcoNumber(eco.totalIncome || 0)}</div>
                </div>
                <div style="background:rgba(244,67,54,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#f44336;">累计支出</div>
                    <div style="color:#f44336;font-weight:bold;">${formatEcoNumber(eco.totalExpense || 0)}</div>
                </div>
                <div style="background:rgba(255,152,0,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#ff9800;">累计税收</div>
                    <div style="color:#ff9800;font-weight:bold;">${formatEcoNumber(eco.totalTax || 0)}</div>
                </div>
                <div style="background:rgba(156,39,176,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#9c27b0;">奢侈品购买</div>
                    <div style="color:#9c27b0;font-weight:bold;">${eco.luxuryPurchases || 0}次</div>
                </div>
            </div>
            <div style="margin-top:15px;text-align:center;">
                <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
            </div>
        </div>
    </div>`;
    openModal('经济统计', html, []);
}