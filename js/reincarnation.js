// Auto-generated module: reincarnation.js
'use strict';

// ===== REINCARNATION CONSTANTS (V45) =====
const REINCARNATION_CONFIG = {
    baseKarmaRate: 0.1,
    maxKarma: 10000,
    maxPastLifeMemories: 12,
    reincarnationPointMultiplier: 1.5,
    karmaGoodThreshold: 5000,
    karmaEvilThreshold: -5000
};

const PAST_LIFE_MEMORIES = [
    { id: 'warrior', name: '战士之魂', icon: '⚔️', bonus: { attack: 0.1 }, desc: '前世战斗经验' },
    { id: 'healer', name: '医者之心', icon: '💚', bonus: { healing: 0.15 }, desc: '前世医术传承' },
    { id: 'scholar', name: '学者之慧', icon: '📚', bonus: { comprehension: 0.2 }, desc: '前世学识积累' },
    { id: 'merchant', name: '商人之道', icon: '💰', bonus: { incomeBonus: 0.2 }, desc: '前世商业头脑' },
    { id: 'artisan', name: '匠人之艺', icon: '🔨', bonus: { crafting: 0.2 }, desc: '前世锻造技艺' },
    { id: 'mage', name: '法师之魂', icon: '🔮', bonus: { spellPower: 0.15 }, desc: '前世魔法天赋' },
    { id: 'farmer', name: '农夫之力', icon: '🌾', bonus: { hp: 0.15 }, desc: '前世劳作体魄' },
    { id: 'poet', name: '诗人之情', icon: '📜', bonus: { serendipity: 0.2 }, desc: '前世艺术感悟' },
    { id: 'guard', name: '守卫之责', icon: '🛡️', bonus: { defense: 0.15 }, desc: '前世护卫生涯' },
    { id: 'wanderer', name: '行者之路', icon: '🌟', bonus: { speed: 0.2 }, desc: '前世游历见闻' },
    { id: 'sage', name: '先知之明', icon: '🔭', bonus: { lawComprehension: 0.25 }, desc: '前世悟道心得' },
    { id: 'dragon', name: '龙之血脉', icon: '🐉', bonus: { allAttributes: 0.1 }, desc: '远古龙族传承' }
];

const KARMA_ACTIONS = {
    // 善行（增加因果）
    good: {
        '帮助他人': { karma: 50, threshold: 0 },
        '施舍灵石': { karma: 100, threshold: 100 },
        '救死扶伤': { karma: 150, threshold: 200 },
        '维护正义': { karma: 200, threshold: 500 },
        '舍己为人': { karma: 300, threshold: 1000 },
        '建造仙宫': { karma: 500, threshold: 2000 },
        '传授功法': { karma: 400, threshold: 1500 },
        '炼制丹药': { karma: 100, threshold: 300 },
        '护佑苍生': { karma: 1000, threshold: 5000 }
    },
    // 恶行（减少因果）
    evil: {
        '抢夺他人': { karma: -80, threshold: 0 },
        '欺凌弱小': { karma: -100, threshold: -100 },
        '偷窃财物': { karma: -120, threshold: -200 },
        '伤害无辜': { karma: -200, threshold: -500 },
        '杀生过多': { karma: -300, threshold: -1000 },
        '贪婪吝啬': { karma: -150, threshold: -500 },
        '背信弃义': { karma: -250, threshold: -1000 },
        '为非作歹': { karma: -500, threshold: -2000 },
        '涂炭生灵': { karma: -1000, threshold: -5000 }
    }
};

const REINCARNATION_BLESSINGS = {
    // 大善人福报（因果>5000）
    saint: {
        title: '圣人转世',
        icon: '👼',
        color: '#ffd700',
        effects: {
            attack: 0.3,
            defense: 0.3,
            healing: 0.3,
            serendipity: 0.5,
            reincarnationBonus: 2.0
        },
        desc: '圣人之资，万法皆通'
    },
    // 善人福报（因果>2000）
    benevolent: {
        title: '善人转世',
        icon: '🙏',
        color: '#4caf50',
        effects: {
            attack: 0.15,
            defense: 0.15,
            healing: 0.2,
            serendipity: 0.25,
            reincarnationBonus: 1.5
        },
        desc: '积德行善，福报加身'
    },
    // 普通（因果>-2000且<2000）
    neutral: {
        title: '凡人转世',
        icon: '🧑',
        color: '#9e9e9e',
        effects: {
            attack: 0,
            defense: 0,
            healing: 0,
            serendipity: 0,
            reincarnationBonus: 1.0
        },
        desc: '六道轮回，因果自担'
    },
    // 恶人报应（因果<-2000）
    wicked: {
        title: '恶人转世',
        icon: '👿',
        color: '#f44336',
        effects: {
            attack: 0.2,
            defense: -0.1,
            healing: -0.2,
            serendipity: -0.3,
            reincarnationBonus: 0.5
        },
        desc: '作恶多端，因果报应'
    },
    // 大恶人报应（因果<-5000）
    demon: {
        title: '恶魔转世',
        icon: '😈',
        color: '#7b1fa2',
        effects: {
            attack: 0.4,
            defense: 0.1,
            healing: -0.4,
            serendipity: -0.5,
            reincarnationBonus: 0.3
        },
        desc: '恶魔降世，万劫不复'
    }
};

const REINCARNATION_REWARDS = {
    // 轮回奖励池
    good: [
        { type: 'spiritStones', amount: 5000, desc: '前世积蓄的灵石' },
        { type: 'comprehension', amount: 30, desc: '前世悟道心得' },
        { type: 'herb', amount: 100, desc: '前世珍藏灵草' },
        { type: 'memory', memoryId: 'warrior', desc: '战士之魂碎片' },
        { type: 'memory', memoryId: 'sage', desc: '先知之明碎片' },
        { type: 'lawFragment', amount: 5, desc: '法则感悟碎片' },
        { type: 'reputation', amount: 1000, desc: '前世声望' }
    ],
    neutral: [
        { type: 'spiritStones', amount: 2000, desc: '前世遗留灵石' },
        { type: 'comprehension', amount: 10, desc: '前世感悟' },
        { type: 'herb', amount: 30, desc: '前世遗留灵草' }
    ],
    evil: [
        { type: 'spiritStones', amount: -1000, desc: '因果清算' },
        { type: 'comprehension', amount: -10, desc: '业障蒙心' },
        { type: 'memory', memoryId: 'demon', desc: '恶魔血脉觉醒' }
    ]
};

// ===== REINCARNATION FUNCTIONS =====

function openReincarnationPanel() {
    const karma = gameState.karma || {};
    const karmaLevel = getKarmaLevel(karma.points || 0);
    const blessing = getKarmaBlessing(karma.points || 0);
    const memories = karma.pastLifeMemories || [];
    const memoriesBonus = calculateMemoriesBonus(memories);

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:700px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:10px;">🔄 天道轮回增强</h2>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;">
                <div style="background:rgba(156,39,176,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">轮回次数</div>
                    <div style="color:#ffd700;font-size:1.3em;font-weight:bold;">${karma.reincarnationCount || 0}</div>
                </div>
                <div style="background:rgba(156,39,176,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">因果点数</div>
                    <div style="color:${blessing.color};font-size:1.3em;font-weight:bold;">${karma.points || 0}</div>
                </div>
                <div style="background:rgba(156,39,176,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">因果等级</div>
                    <div style="color:${blessing.color};font-size:1.1em;font-weight:bold;">${karmaLevel}</div>
                </div>
            </div>

            <div style="background:rgba(${hexToRgb(blessing.color)},0.1);border:1px solid ${blessing.color};border-radius:8px;padding:15px;margin-bottom:15px;text-align:center;">
                <div style="font-size:1.5em;margin-bottom:5px;">${blessing.icon}</div>
                <div style="color:${blessing.color};font-weight:bold;font-size:1.1em;">${blessing.title}</div>
                <div style="color:#aaa;font-size:0.9em;">${blessing.desc}</div>
            </div>

            <div style="margin-bottom:15px;">
                <h3 style="color:#ffd700;margin-bottom:10px;">📊 因果明细</h3>
                <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;font-size:0.9em;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                        <span style="color:#aaa;">善行累计</span>
                        <span style="color:#4caf50;">+${karma.goodKarma || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                        <span style="color:#aaa;">恶行累计</span>
                        <span style="color:#f44336;">${karma.evilKarma || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#aaa;">轮回加成</span>
                        <span style="color:#2196f3;">${((blessing.effects.reincarnationBonus || 1) - 1) * 100 >= 0 ? '+' : ''}${((blessing.effects.reincarnationBonus || 1) - 1) * 100}%</span>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:15px;">
                <h3 style="color:#ffd700;margin-bottom:10px;">👻 前世记忆（${memories.length}/${REINCARNATION_CONFIG.maxPastLifeMemories}）</h3>`;

    if (memories.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">尚未觉醒任何前世记忆</p>`;
    } else {
        html += `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">`;
        memories.forEach(memoryId => {
            const memory = PAST_LIFE_MEMORIES.find(m => m.id === memoryId);
            if (memory) {
                html += `<div style="background:rgba(0,0,0,0.3);border:1px solid #ffd700;border-radius:5px;padding:8px;text-align:center;">
                    <div style="font-size:1.5em;">${memory.icon}</div>
                    <div style="color:#ffd700;font-size:0.85em;">${memory.name}</div>
                    <div style="color:#aaa;font-size:0.75em;">${memory.desc}</div>
                </div>`;
            }
        });
        html += `</div>`;
    }

    // 记忆加成
    if (Object.keys(memoriesBonus).length > 0) {
        html += `<div style="background:rgba(255,215,0,0.1);padding:8px;border-radius:5px;margin-top:8px;font-size:0.85em;">
            <span style="color:#ffd700;">记忆加成：</span>${formatMemoriesBonus(memoriesBonus)}
        </div>`;
    }

    html += `</div>

            <div style="margin-bottom:15px;">
                <h3 style="color:#ffd700;margin-bottom:10px;">⚡ 积德任务</h3>
                <div style="display:grid;gap:8px;">`;
    // 显示可完成的积德任务
    const availableGood = Object.entries(KARMA_ACTIONS.good).filter(([name, data]) => {
        return (karma.points || 0) >= data.threshold;
    });
    const availableEvil = Object.entries(KARMA_ACTIONS.evil).filter(([name, data]) => {
        return (karma.points || 0) >= data.threshold;
    });

    availableGood.slice(0, 3).forEach(([name, data]) => {
        html += `<div style="background:rgba(76,175,80,0.1);border:1px solid #4caf50;border-radius:5px;padding:8px;display:flex;justify-content:space-between;align-items:center;">
                    <div><span style="color:#4caf50;">✓</span> ${name} <span style="color:#aaa;font-size:0.85em;">+${data.karma}因果</span></div>
                    <button class="btn" style="background:#4caf50;color:white;font-size:0.8em;" onclick="performGoodDeed('${name}')">执行</button>
                </div>`;
    });

    html += `</div></div>

            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
            </div>
        </div>
    </div>`;
    openModal('天道轮回', html, []);
}

function getKarmaLevel(karmaPoints) {
    if (karmaPoints >= 8000) return '大贤者';
    if (karmaPoints >= 5000) return '贤者';
    if (karmaPoints >= 2000) return '善人';
    if (karmaPoints >= 500) return '小善人';
    if (karmaPoints >= -500) return '普通人';
    if (karmaPoints >= -2000) return '小恶人';
    if (karmaPoints >= -5000) return '恶人';
    if (karmaPoints >= -8000) return '大恶人';
    return '魔头';
}

function getKarmaBlessing(karmaPoints) {
    if (karmaPoints >= REINCARNATION_CONFIG.karmaGoodThreshold) {
        if (karmaPoints >= 8000) return REINCARNATION_BLESSINGS.saint;
        return REINCARNATION_BLESSINGS.benevolent;
    }
    if (karmaPoints <= -REINCARNATION_CONFIG.karmaEvilThreshold) {
        if (karmaPoints <= -8000) return REINCARNATION_BLESSINGS.demon;
        return REINCARNATION_BLESSINGS.wicked;
    }
    return REINCARNATION_BLESSINGS.neutral;
}

function calculateMemoriesBonus(memories) {
    const bonus = {
        attack: 0,
        defense: 0,
        healing: 0,
        spellPower: 0,
        serendipity: 0,
        incomeBonus: 0,
        comprehension: 0,
        lawComprehension: 0,
        crafting: 0,
        speed: 0,
        hp: 0
    };

    memories.forEach(memoryId => {
        const memory = PAST_LIFE_MEMORIES.find(m => m.id === memoryId);
        if (memory && memory.bonus) {
            Object.entries(memory.bonus).forEach(([key, value]) => {
                if (key === 'allAttributes') {
                    Object.keys(bonus).forEach(k => bonus[k] += value);
                } else if (bonus[key] !== undefined) {
                    bonus[key] += value;
                }
            });
        }
    });

    return bonus;
}

function formatMemoriesBonus(bonus) {
    return Object.entries(bonus)
        .filter(([k, v]) => v > 0)
        .map(([k, v]) => {
            const names = {
                attack: '攻击', defense: '防御', healing: '治疗', spellPower: '仙法威力',
                serendipity: '奇遇', incomeBonus: '灵石收益', comprehension: '领悟',
                lawComprehension: '法则领悟', crafting: '锻造', speed: '速度', hp: '生命'
            };
            return `+${(v * 100).toFixed(0)}% ${names[k] || k}`;
        })
        .join(', ') || '无';
}

function performGoodDeed(deedName) {
    const karmaAction = KARMA_ACTIONS.good[deedName];
    if (!karmaAction) return;

    const karma = gameState.karma || {};
    karma.points = (karma.points || 0) + karmaAction.karma;
    karma.goodKarma = (karma.goodKarma || 0) + karmaAction.karma;
    gameState.karma = karma;

    addLog(`⚡ 积德：「${deedName}」+${karmaAction.karma}因果`, '#4caf50');
    updateDisplay();
    openReincarnationPanel();
}

function addKarma(points, reason) {
    const karma = gameState.karma || { points: 0, goodKarma: 0, evilKarma: 0, reincarnationCount: 0, pastLifeMemories: [] };
    karma.points = Math.max(-REINCARNATION_CONFIG.maxKarma, Math.min(REINCARNATION_CONFIG.maxKarma, karma.points + points));

    if (points > 0) {
        karma.goodKarma = (karma.goodKarma || 0) + points;
    } else {
        karma.evilKarma = (karma.evilKarma || 0) + Math.abs(points);
    }

    gameState.karma = karma;
    updateKarmaBonusDisplay();
}

function getKarmaBonus() {
    const karma = gameState.karma || {};
    const blessing = getKarmaBlessing(karma.points || 0);
    const memoriesBonus = calculateMemoriesBonus(karma.pastLifeMemories || []);

    // 合并加成
    const combined = { ...blessing.effects };
    Object.entries(memoriesBonus).forEach(([key, value]) => {
        if (combined[key] !== undefined) {
            combined[key] += value;
        } else {
            combined[key] = value;
        }
    });

    return combined;
}

function updateKarmaBonusDisplay() {
    // 更新显示上的因果加成
    const bonus = getKarmaBonus();
    // 可选：添加视觉提示
}

function processReincarnationRewards() {
    const karma = gameState.karma || {};
    const blessing = getKarmaBlessing(karma.points || 0);
    const multiplier = blessing.effects.reincarnationBonus || 1;

    // 每日因果收益
    const dailyKarmaGain = Math.floor(10 * multiplier);
    karma.points = (karma.points || 0) + dailyKarmaGain;

    // 每7天额外奖励检查
    if ((gameState.days || 0) % 7 === 0) {
        triggerReincarnationReward();
    }

    gameState.karma = karma;
}

function triggerReincarnationReward() {
    const karma = gameState.karma || {};
    const blessing = getKarmaBlessing(karma.points || 0);
    const multiplier = blessing.effects.reincarnationBonus || 1;

    let rewardPool = [];
    if (karma.points >= 2000) {
        rewardPool = REINCARNATION_REWARDS.good;
    } else if (karma.points <= -2000) {
        rewardPool = REINCARNATION_REWARDS.evil;
    } else {
        rewardPool = REINCARNATION_REWARDS.neutral;
    }

    // 根据因果等级选择奖励
    const reward = rewardPool[Math.floor(Math.random() * rewardPool.length)];
    if (!reward) return;

    let rewardText = '';
    switch (reward.type) {
        case 'spiritStones':
            const amount = Math.floor(reward.amount * multiplier);
            gameState.spiritStones += amount;
            rewardText = `获得 ${amount} 灵石（${reward.desc}）`;
            break;
        case 'comprehension':
            if (!gameState.cultivation) gameState.cultivation = {};
            gameState.cultivation.comprehension = (gameState.cultivation.comprehension || 0) + reward.amount;
            rewardText = `领悟 +${reward.amount}（${reward.desc}）`;
            break;
        case 'herb':
            gameState.herbs = (gameState.herbs || 0) + reward.amount;
            rewardText = `获得 ${reward.amount} 灵草（${reward.desc}）`;
            break;
        case 'memory':
            if ((karma.pastLifeMemories || []).length < REINCARNATION_CONFIG.maxPastLifeMemories) {
                if (!karma.pastLifeMemories) karma.pastLifeMemories = [];
                if (!karma.pastLifeMemories.includes(reward.memoryId)) {
                    karma.pastLifeMemories.push(reward.memoryId);
                    const memory = PAST_LIFE_MEMORIES.find(m => m.id === reward.memoryId);
                    rewardText = `觉醒「${memory?.name || reward.memoryId}」（${reward.desc}）`;
                }
            }
            break;
        case 'lawFragment':
            if (!gameState.laws) gameState.laws = { fragments: 0 };
            gameState.laws.fragments = (gameState.laws.fragments || 0) + reward.amount;
            rewardText = `获得 ${reward.amount} 法则碎片（${reward.desc}）`;
            break;
    }

    if (rewardText) {
        addLog(`🔄 轮回福报：${rewardText}`, '#9c27b0');
    }

    gameState.karma = karma;
}

function triggerReincarnation() {
    const karma = gameState.karma || {};
    karma.reincarnationCount = (karma.reincarnationCount || 0) + 1;

    const blessing = getKarmaBlessing(karma.points || 0);
    const multiplier = blessing.effects.reincarnationBonus || 1;

    // 清零部分因果（保留一定比例）
    const retainedKarma = Math.floor((karma.points || 0) * 0.3);
    karma.points = retainedKarma;

    // 触发奖励
    triggerReincarnationReward();

    // 小概率获得新记忆
    if (Math.random() < 0.3 * multiplier) {
        const memories = karma.pastLifeMemories || [];
        if (memories.length < REINCARNATION_CONFIG.maxPastLifeMemories) {
            const availableMemories = PAST_LIFE_MEMORIES.filter(m => !memories.includes(m.id));
            if (availableMemories.length > 0) {
                const newMemory = availableMemories[Math.floor(Math.random() * availableMemories.length)];
                memories.push(newMemory.id);
                addLog(`👻 轮回时觉醒前世记忆：「${newMemory.name}」！`, '#9c27b0');
            }
        }
    }

    gameState.karma = karma;

    // 触发特殊事件
    if (karma.reincarnationCount >= 10) {
        addLog(`🔄 已轮回${karma.reincarnationCount}次，因果已深`, '#7b1fa2');
    }
}

function getKarmaStats() {
    const karma = gameState.karma || {};
    return {
        points: karma.points || 0,
        level: getKarmaLevel(karma.points || 0),
        blessing: getKarmaBlessing(karma.points || 0),
        reincarnationCount: karma.reincarnationCount || 0,
        pastLifeMemories: karma.pastLifeMemories || [],
        goodKarma: karma.goodKarma || 0,
        evilKarma: karma.evilKarma || 0
    };
}

