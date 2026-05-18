// Auto-generated module: achievements.js

        // ===== checkAchievements =====
        function checkAchievements() {
            if (!gameState.achievements) {
                gameState.achievements = {
                    unlocked: [],
                    titles: [],
                    stats: {
                        tribulationsCompleted: 0,
                        dungeonBossesKilled: 0,
                        sectContributions: 0,
                        treasuresRefined: 0,
                        serendipitiesEncountered: 0,
                        flawlessTribulations: 0
                    }
                };
            }

            const ach = gameState.achievements;

            for (const achievement of ACHIEVEMENTS) {
                // 跳过已解锁的
                if (ach.unlocked.includes(achievement.id)) continue;

                let unlocked = false;
                const req = achievement.requirement;

                if (req.type === 'stat') {
                    const currentValue = ach.stats[req.key] || 0;
                    if (currentValue >= req.value) {
                        unlocked = true;
                    }
                } else if (req.type === 'realm') {
                    if (gameState.realm >= req.value) {
                        unlocked = true;
                    }
                } else if (req.type === 'set') {
                    // 检查套装是否收集完成
                    const set = SET_BONUSES[req.setName];
                    if (set) {
                        const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
                        const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
                        const allPieces = [...new Set([...equipped, ...owned])];
                        const hasAll = set.pieces.every(p => allPieces.includes(p));
                        if (hasAll) unlocked = true;
                    }
                }

                if (unlocked) {
                    ach.unlocked.push(achievement.id);
                    if (achievement.title && !ach.titles.includes(achievement.title)) {
                        ach.titles.push(achievement.title);
                        // 如果没有装备称号，自动装备新称号
                        if (!gameState.title || gameState.title === '筑基修士') {
                            gameState.title = achievement.title;
                        }
                    }
                    addLog('good', '🏆 成就解锁', `【${achievement.name}】${achievement.desc}！获得称号：${achievement.title}`);
                    saveGame();
                }
            }
        }

        // ===== getTitleBonus =====
        function getTitleBonus() {
            const bonuses = {
                cultivationSpeed: 0,
                attack: 0,
                defense: 0,
                craftingSuccess: 0,
                serendipityRate: 0,
                realmSuppression: 0,
                setBonus: 0,
                tribulationCost: 0,
                sectContribution: 0
            };

            if (!gameState.title || !gameState.achievements) return bonuses;

            // 遍历所有已解锁的成就，找出当前称号对应的加成
            const ach = gameState.achievements;
            for (const achievement of ACHIEVEMENTS) {
                if (ach.unlocked.includes(achievement.id)) {
                    const reward = achievement.reward;
                    if (reward.type === 'attribute') {
                        if (bonuses.hasOwnProperty(reward.target)) {
                            bonuses[reward.target] += reward.bonus;
                        }
                    }
                }
            }

            return bonuses;
        }

        // ===== equipTitle =====
        function equipTitle(titleName) {
            if (!gameState.achievements || !gameState.achievements.titles.includes(titleName)) {
                addLog('bad', '称号装备', '你还没有获得这个称号！');
                return;
            }
            gameState.title = titleName;
            addLog('good', '称号装备', `已装备称号：【${titleName}】`);
            updateDisplay();
            saveGame();
        }

        // ===== openAchievements =====
        function openAchievements() {
            document.getElementById('achievementModal').classList.add('active');
            renderAchievements();
        }

        // ===== closeAchievements =====
        function closeAchievements() {
            document.getElementById('achievementModal').classList.remove('active');
        }

        // ===== renderAchievements =====
        function renderAchievements() {
            const content = document.getElementById('achievementContent');
            if (!content) return;

            const ach = gameState.achievements || { unlocked: [], titles: [], stats: {} };

            let html = `<div class="achievement-header">`;
            html += `<div class="achievement-title-display">当前称号：<span style="color:#ffd700;">【${gameState.title || '无'}】</span></div>`;
            html += `</div>`;

            // 分类显示
            const categories = {
                cultivation: '修炼',
                combat: '战斗',
                collection: '收集',
                story: '剧情',
                special: '特殊'
            };

            for (const [catKey, catName] of Object.entries(categories)) {
                const catAchievements = ACHIEVEMENTS.filter(a => a.category === catKey);
                if (catAchievements.length === 0) continue;

                html += `<div class="achievement-category">`;
                html += `<h4>${catName}</h4>`;

                for (const a of catAchievements) {
                    const isUnlocked = ach.unlocked.includes(a.id);
                    const progress = getAchievementProgress(a, ach);

                    html += `<div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">`;
                    html += `<div class="achievement-icon">${isUnlocked ? '🏆' : '🔒'}</div>`;
                    html += `<div class="achievement-info">`;
                    html += `<div class="achievement-name">${a.name}</div>`;
                    html += `<div class="achievement-desc">${a.desc}</div>`;

                    if (!isUnlocked && progress > 0) {
                        html += `<div class="achievement-progress">`;
                        html += `<div class="progress-bar" style="width:${progress}%"></div>`;
                        html += `</div>`;
                        html += `<div class="achievement-progress-text">${getAchievementProgressText(a, ach)}</div>`;
                    }

                    html += `</div>`;
                    html += `<div class="achievement-reward">`;
                    html += `<div style="color:#4caf50;">奖励：${getRewardText(a)}</div>`;
                    if (a.title) html += `<div style="color:#ffd700;">称号：${a.title}</div>`;
                    html += `</div>`;
                    html += `</div>`;
                }

                html += `</div>`;
            }

            // 已获得称号列表
            if (ach.titles.length > 0) {
                html += `<div class="achievement-category">`;
                html += `<h4>已获称号</h4>`;
                html += `<div class="title-list">`;
                for (const t of ach.titles) {
                    const isEquipped = gameState.title === t;
                    html += `<div class="title-item ${isEquipped ? 'equipped' : ''}" onclick="equipTitle('${t}')">`;
                    html += `【${t}】${isEquipped ? '(已装备)' : '(点击装备)'}`;
                    html += `</div>`;
                }
                html += `</div>`;
                html += `</div>`;
            }

            content.innerHTML = html;
        }

        // ===== renderSpiritRootContent =====
        function renderSpiritRootContent() {
            const content = document.getElementById('spiritRootContent');
            const sr = gameState.spiritRoot;
            const srData = SPIRIT_ROOT_QUALITIES[sr.quality];
            const cons = gameState.constitutions;
            
            const speedBonus = Math.round((srData.speedBonus - 1) * 100);
            const bottleneckEffect = srData.bottleneckBonus >= 0 ? `+${Math.round(srData.bottleneckBonus * 100)}%` : `${Math.round(srData.bottleneckBonus * 100)}%`;
            const tribEffect = srData.tribulationBonus >= 0 ? `+${Math.round(srData.tribulationBonus * 100)}%` : `${Math.round(srData.tribulationBonus * 100)}%`;
            
            const highestBonus = getHighestElementBonus();
            
            let html = `
                <div class="sr-header">
                    <div class="sr-quality">${srData.icon} ${sr.quality}</div>
                    <div style="color:#aaa;">灵根资质评估</div>
                </div>
                
                <div class="sr-stats">
                    <div class="sr-stat">
                        <div class="sr-stat-value" style="color: ${speedBonus >= 0 ? '#4caf50' : '#f44336'}">${speedBonus >= 0 ? '+' : ''}${speedBonus}%</div>
                        <div class="sr-stat-label">修炼速度</div>
                        <div class="sr-stat-bonus">${srData.speedBonus >= 1 ? '🌟 超越常人' : '📉 低于常人'}</div>
                    </div>
                    <div class="sr-stat">
                        <div class="sr-stat-value">${bottleneckEffect}</div>
                        <div class="sr-stat-label">瓶颈概率</div>
                        <div class="sr-stat-bonus">${srData.bottleneckBonus <= 0 ? '🌟 更易突破' : '📉 较难突破'}</div>
                    </div>
                    <div class="sr-stat">
                        <div class="sr-stat-value" style="color: ${srData.tribulationBonus >= 0 ? '#4caf50' : '#f44336'}">${tribEffect}</div>
                        <div class="sr-stat-label">渡劫成功率</div>
                        <div class="sr-stat-bonus">${srData.tribulationBonus >= 0 ? '🌟 天道眷顾' : '📉 渡劫艰难'}</div>
                    </div>
                </div>
                
                <div class="sr-section">
                    <div class="sr-section-title">🌈 五行亲和</div>
                    <div class="five-elements-grid">
                        <div class="element-card">
                            <div class="element-icon">⚔️</div>
                            <div class="element-name">金</div>
                            <div class="element-value ${sr.affinity.metal >= ELEMENT_HIGH_THRESHOLD ? 'high' : ''}">${sr.affinity.metal}%</div>
                        </div>
                        <div class="element-card">
                            <div class="element-icon">🌿</div>
                            <div class="element-name">木</div>
                            <div class="element-value ${sr.affinity.wood >= ELEMENT_HIGH_THRESHOLD ? 'high' : ''}">${sr.affinity.wood}%</div>
                        </div>
                        <div class="element-card">
                            <div class="element-icon">❄️</div>
                            <div class="element-name">水</div>
                            <div class="element-value ${sr.affinity.water >= ELEMENT_HIGH_THRESHOLD ? 'high' : ''}">${sr.affinity.water}%</div>
                        </div>
                        <div class="element-card">
                            <div class="element-icon">🔥</div>
                            <div class="element-name">火</div>
                            <div class="element-value ${sr.affinity.fire >= ELEMENT_HIGH_THRESHOLD ? 'high' : ''}">${sr.affinity.fire}%</div>
                        </div>
                        <div class="element-card">
                            <div class="element-icon">🛡️</div>
                            <div class="element-name">土</div>
                            <div class="element-value ${sr.affinity.earth >= ELEMENT_HIGH_THRESHOLD ? 'high' : ''}">${sr.affinity.earth}%</div>
                        </div>
                    </div>
                    ${highestBonus ? `
                    <div style="text-align:center;margin-top:10px;color:#ffd700;">
                        当前最高加成：${highestBonus.element} ${highestBonus.technique.icon} ${highestBonus.technique.name} (${highestBonus.affinity}%)
                    </div>
                    ` : ''}
                </div>
                
                <div class="sr-section">
                    <div class="sr-section-title">👼 体质列表</div>
                    <div class="constitutions-list">
            `;
            
            // 渲染所有体质
            for (const [name, data] of Object.entries(CONSTITUTIONS)) {
                const acquired = cons.find(c => c.type === name);
                const canActivate = data.trigger(gameState);
                
                html += `
                    <div class="constitution-card ${acquired ? 'active' : 'inactive'}">
                        <div class="icon">${data.icon}</div>
                        <div class="info">
                            <div class="name">${name}</div>
                            <div class="effect">${data.desc}</div>
                            <div class="source">触发条件：${data.source}</div>
                        </div>
                        <div class="status ${acquired ? 'active' : 'inactive'}">
                            ${acquired ? '已激活' : canActivate ? '可激活' : '未获得'}
                        </div>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
                
                <div class="sr-actions">
                    <button class="btn-refresh-sr" onclick="refreshSpiritRoot(false)" ${gameState.spiritStones < 10000 ? 'disabled' : ''}>
                        🔄 洗髓丹 (10000灵石)
                    </button>
                    <button class="btn-refresh-sr" onclick="refreshSpiritRoot(true)" ${gameState.spiritStones < 50000 || gameState.realm < 4 ? 'disabled' : ''}>
                        🌈 混沌丹 (50000灵石)
                    </button>
                </div>
                
                <div class="sr-tips">
                    <h4>💡 小提示</h4>
                    <ul>
                        <li>灵根品质影响修炼速度、瓶颈概率和渡劫成功率</li>
                        <li>五行亲和达到一定数值可激活对应功法加成</li>
                        <li>部分体质通过奇遇获得，部分通过突破境界激活</li>
                        <li>最多同时拥有2种体质</li>
                        <li>混沌丹需要化神期才能使用，100%获得混沌灵根</li>
                    </ul>
                </div>
            `;
            
            content.innerHTML = html;
        }


// Auto-generated module: arena.js

// ===== CELESTIAL_ARENA CONSTANTS (V42) =====
const ARENA_CONFIG = {
    seasonDays: 14,           // 赛季周期14天
    dailyChallenges: 3,       // 每日挑战次数
    rankTiers: 12,            // 段位数量
    promotionMatches: 3,       // 晋级赛所需场次
    derankProtection: 2,       // 掉段保护次数
    matchHistoryLimit: 50,
    rewardClaimDays: 7         // 奖励领取期限
};

const ARENA_RANKS = {
    // 段位名称和图标
    1:  { name: '青铜Ⅰ', icon: '🥉', minScore: 0, promotionScore: 100 },
    2:  { name: '青铜Ⅱ', icon: '🥈', minScore: 100, promotionScore: 200 },
    3:  { name: '青铜Ⅲ', icon: '🥇', minScore: 200, promotionScore: 350 },
    4:  { name: '白银Ⅰ', icon: '🤍', minScore: 350, promotionScore: 500 },
    5:  { name: '白银Ⅱ', icon: '🩶', minScore: 500, promotionScore: 700 },
    6:  { name: '白银Ⅲ', icon: '💿', minScore: 700, promotionScore: 900 },
    7:  { name: '黄金Ⅰ', icon: '🥉', minScore: 900, promotionScore: 1200 },
    8:  { name: '黄金Ⅱ', icon: '🥈', minScore: 1200, promotionScore: 1500 },
    9:  { name: '黄金Ⅲ', icon: '🥇', minScore: 1500, promotionScore: 2000 },
    10: { name: '钻石Ⅰ', icon: '💎', minScore: 2000, promotionScore: 3000 },
    11: { name: '钻石Ⅱ', icon: '💠', minScore: 3000, promotionScore: 4500 },
    12: { name: '至尊', icon: '👑', minScore: 4500, promotionScore: 99999 }
};

const ARENA_REWARDS = {
    // 段位赛季奖励
    1:  { stones: 500, honor: 50, badge: '青铜勋章' },
    2:  { stones: 800, honor: 80, badge: '青铜勋章' },
    3:  { stones: 1200, honor: 120, badge: '青铜之星' },
    4:  { stones: 1800, honor: 180, badge: '白银勋章' },
    5:  { stones: 2500, honor: 250, badge: '白银勋章' },
    6:  { stones: 3500, honor: 350, badge: '白银之星' },
    7:  { stones: 5000, honor: 500, badge: '黄金勋章' },
    8:  { stones: 7000, honor: 700, badge: '黄金勋章' },
    9:  { stones: 10000, honor: 1000, badge: '黄金之星' },
    10: { stones: 15000, honor: 1500, badge: '钻石勋章' },
    11: { stones: 25000, honor: 2500, badge: '钻石勋章' },
    12: { stones: 50000, honor: 5000, badge: '至尊龙徽' }
};

const ARENA_BATTLE_MODES = {
    '排位赛': {
        icon: '🎯',
        desc: '提升段位，获取丰厚奖励',
        scoreWin: 25,
        scoreLose: -15,
        cost: 0
    },
    '练习赛': {
        icon: '⚔️',
        desc: '无风险，积累战斗经验',
        scoreWin: 5,
        scoreLose: 0,
        cost: 0
    },
    '赏金赛': {
        icon: '💰',
        desc: '支付灵石参赛，胜者瓜分奖池',
        scoreWin: 30,
        scoreLose: -20,
        cost: 500
    }
};

// ===== ARENA FUNCTIONS =====

function showArenaPanel() {
    const arena = gameState.celestialArena;
    const now = Date.now();
    const seasonEnd = arena.seasonStartTime + ARENA_CONFIG.seasonDays * 86400000;
    const seasonDaysLeft = Math.max(0, Math.ceil((seasonEnd - now) / 86400000));

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff6f00;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ff6f00;text-align:center;margin-bottom:10px;">🏆 天道竞技场</h2>
            <div style="text-align:center;color:#aaa;margin-bottom:15px;">
                第${arena.currentSeason}赛季 | 剩余${seasonDaysLeft}天 | 段位: ${ARENA_RANKS[arena.currentRank]?.icon} ${ARENA_RANKS[arena.currentRank]?.name}
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:15px;">
                <div style="background:rgba(255,111,0,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">积分</div>
                    <div style="color:#ffd700;font-size:1.3em;font-weight:bold;">${arena.score}</div>
                </div>
                <div style="background:rgba(255,111,0,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">胜场</div>
                    <div style="color:#4caf50;font-size:1.3em;font-weight:bold;">${arena.totalWins}</div>
                </div>
                <div style="background:rgba(255,111,0,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">负场</div>
                    <div style="color:#f44336;font-size:1.3em;font-weight:bold;">${arena.totalLosses}</div>
                </div>
                <div style="background:rgba(255,111,0,0.1);padding:10px;border-radius:8px;text-align:center;">
                    <div style="color:#aaa;font-size:0.8em;">连胜</div>
                    <div style="color:#ff9800;font-size:1.3em;font-weight:bold;">${arena.currentStreak}</div>
                </div>
            </div>

            <div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn" style="background:#4caf50;color:white;" onclick="showArenaRankings()">📊 排行榜</button>
                <button class="btn" style="background:#2196f3;color:white;" onclick="showArenaHistory()">📜 战斗记录</button>
                <button class="btn" style="background:#9c27b0;color:white;" onclick="showArenaRewards()">🎁 段位奖励</button>
                <button class="btn" style="background:#ff9800;color:white;" onclick="claimArenaSeasonReward()">✨ 领取奖励</button>
            </div>

            <div style="margin-bottom:15px;">
                <h3 style="color:#ffd700;margin-bottom:10px;">⚔️ 挑战模式</h3>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">`;

    Object.entries(ARENA_BATTLE_MODES).forEach(([mode, data]) => {
        const canAfford = mode === '赏金赛' ? gameState.spiritStones >= data.cost : true;
        const challengesLeft = mode === '排位赛' ? Math.max(0, ARENA_CONFIG.dailyChallenges - arena.dailyChallengesUsed) : '∞';
        html += `<div style="background:rgba(0,0,0,0.3);border:1px solid #555;border-radius:8px;padding:12px;">
            <div style="color:#ffd700;font-weight:bold;font-size:1.1em;">${data.icon} ${mode}</div>
            <div style="color:#aaa;font-size:0.85em;margin:5px 0;">${data.desc}</div>
            <div style="color:#aaa;font-size:0.85em;">今日剩余: ${challengesLeft}</div>
            ${mode === '赏金赛' ? `<div style="color:#ff9800;font-size:0.85em;">参赛费: ${data.cost}灵石</div>` : ''}
            <button class="btn" style="background:${canAfford ? '#4caf50' : '#555'};color:white;width:100%;margin-top:8px;"
                onclick="enterArenaBattle('${mode}')" ${canAfford ? '' : 'disabled'}>
                ${canAfford ? '进入' : '灵石不足'}
            </button>
        </div>`;
    });

    html += `</div></div>

            <div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin-bottom:15px;">
                <h4 style="color:#ffd700;margin-bottom:8px;">📋 当前赛季信息</h4>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:0.9em;">
                    <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">最高段位</span><span>${ARENA_RANKS[arena.highestRank]?.icon || '?'} ${ARENA_RANKS[arena.highestRank]?.name || '无'}</span></div>
                    <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">晋级赛</span><span style="color:${arena.promotionWins >= ARENA_CONFIG.promotionMatches ? '#4caf50' : '#ff9800'};">${arena.promotionWins}/${ARENA_CONFIG.promotionMatches}胜</span></div>
                    <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">累计积分</span><span>${arena.totalScoreEarned}</span></div>
                    <div style="display:flex;justify-content:space-between;"><span style="color:#aaa;">赏金赛奖励</span><span>${arena.bountyWins}胜</span></div>
                </div>
            </div>

            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
            </div>
        </div>
    </div>`;
    openModal('天道竞技场', html, []);
}

function showArenaRankings() {
    const arena = gameState.celestialArena;
    const now = Date.now();
    const seasonEnd = arena.seasonStartTime + ARENA_CONFIG.seasonDays * 86400000;
    const seasonDaysLeft = Math.max(0, Math.ceil((seasonEnd - now) / 86400000));

    // 获取排行榜（本地模拟）
    const rankings = getArenaRankings();

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff6f00;border-radius:12px;padding:20px;max-width:600px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ff6f00;text-align:center;margin-bottom:10px;">📊 排行榜</h2>
            <div style="text-align:center;color:#aaa;margin-bottom:15px;">第${arena.currentSeason}赛季 | 剩余${seasonDaysLeft}天</div>

            <div style="max-height:400px;overflow-y:auto;">`;

    // 玩家排名
    const playerRank = getArenaPlayerRank();
    html += `<div style="background:rgba(255,111,0,0.2);border:2px solid #ff6f00;border-radius:8px;padding:12px;margin-bottom:15px;">
                <div style="color:#ffd700;font-weight:bold;">你的排名</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px;">
                    <div>
                        <span style="color:#ff6f00;font-size:1.5em;font-weight:bold;">#${playerRank}</span>
                        <span style="color:#ffd700;margin-left:10px;">${ARENA_RANKS[arena.currentRank]?.icon} ${ARENA_RANKS[arena.currentRank]?.name}</span>
                    </div>
                    <div style="color:#ffd700;">${arena.score}分</div>
                </div>
            </div>`;

    // Top 20
    html += `<div style="display:grid;gap:8px;">`;
    rankings.slice(0, 20).forEach((entry, idx) => {
        const isPlayer = entry.isPlayer;
        const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32', '#aaa', '#aaa'];
        const rankColor = idx < 3 ? rankColors[idx] : '#aaa';
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:${isPlayer ? 'rgba(255,111,0,0.2)' : 'rgba(0,0,0,0.2)'};border-radius:5px;">
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="color:${rankColor};font-weight:bold;min-width:30px;">${idx + 1}</span>
                <span style="color:#fff;">${entry.name}</span>
                <span style="color:#888;font-size:0.85em;">${ARENA_RANKS[entry.rank]?.icon || '?'} ${ARENA_RANKS[entry.rank]?.name || '?'}</span>
            </div>
            <div style="color:#ffd700;">${entry.score}分</div>
        </div>`;
    });
    html += `</div></div>

            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="showArenaPanel()">返回</button>
            </div>
        </div>
    </div>`;
    openModal('排行榜', html, []);
}

function showArenaHistory() {
    const arena = gameState.celestialArena;

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #2196f3;border-radius:12px;padding:20px;max-width:600px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#2196f3;text-align:center;margin-bottom:15px;">📜 战斗记录</h2>`;

    if (arena.matchHistory.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">暂无战斗记录</p>`;
    } else {
        html += `<div style="max-height:400px;overflow-y:auto;display:grid;gap:8px;">`;
        arena.matchHistory.slice().reverse().forEach(match => {
            const isWin = match.result === 'win';
            const modeData = ARENA_BATTLE_MODES[match.mode] || {};
            html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:5px;border-left:3px solid ${isWin ? '#4caf50' : '#f44336'};">
                <div>
                    <div style="color:${isWin ? '#4caf50' : '#f44336'};font-weight:bold;">${isWin ? '胜' : '负'} ${match.mode}</div>
                    <div style="color:#888;font-size:0.85em;">vs ${match.opponentName || '神秘对手'}</div>
                </div>
                <div style="text-align:right;">
                    <div style="color:#ffd700;">${isWin ? '+' : ''}${match.scoreChange}分</div>
                    <div style="color:#888;font-size:0.85em;">${formatArenaTime(match.timestamp)}</div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="showArenaPanel()">返回</button>
            </div>
        </div>
    </div>`;
    openModal('战斗记录', html, []);
}

function showArenaRewards() {
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:500px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">🎁 段位奖励</h2>
            <p style="color:#aaa;text-align:center;margin-bottom:15px;">赛季结算时按最高段位发放</p>

            <div style="display:grid;gap:8px;">`;
    Object.entries(ARENA_REWARDS).forEach(([rank, reward]) => {
        const rankData = ARENA_RANKS[rank];
        const isCurrentOrHigher = gameState.celestialArena.currentRank >= parseInt(rank);
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:${isCurrentOrHigher ? 'rgba(76,175,80,0.2)' : 'rgba(0,0,0,0.3)'};border-radius:5px;border:1px solid ${isCurrentOrHigher ? '#4caf50' : '#444'};">
            <div>
                <span style="color:#ffd700;font-weight:bold;">${rankData?.icon} ${rankData?.name}</span>
            </div>
            <div style="text-align:right;">
                <div style="color:#ffd700;">💎 ${reward.stones.toLocaleString()}</div>
                <div style="color:#aaa;font-size:0.85em;">荣誉+${reward.honor}</div>
            </div>
        </div>`;
    });
    html += `</div>

            <div style="text-align:center;margin-top:15px;">
                <button class="btn" style="background:#555;color:white;" onclick="showArenaPanel()">返回</button>
            </div>
        </div>
    </div>`;
    openModal('段位奖励', html, []);
}

function enterArenaBattle(mode) {
    const arena = gameState.celestialArena;
    const modeData = ARENA_BATTLE_MODES[mode];

    if (mode === '排位赛') {
        if (arena.dailyChallengesUsed >= ARENA_CONFIG.dailyChallenges) {
            addLog('今日排位赛次数已用完', '#f44336');
            return;
        }
    }

    if (mode === '赏金赛') {
        if (gameState.spiritStones < modeData.cost) {
            addLog('灵石不足', '#f44336');
            return;
        }
        gameState.spiritStones -= modeData.cost;
        arena.bountyPool += modeData.cost;
    }

    // 生成对手
    const opponent = generateArenaOpponent();
    const playerPower = calculatePlayerArenaPower();
    const opponentPower = opponent.power;

    // 计算胜负（考虑装备、技能、境界等）
    const winChance = calculateArenaWinChance(playerPower, opponentPower);
    const isWin = Math.random() < winChance;

    // 计算积分变化
    let scoreChange = isWin ? modeData.scoreWin : modeData.scoreLose;
    if (isWin && arena.currentStreak >= 3) {
        scoreChange += 5; // 连胜加成
    }
    if (mode === '赏金赛') {
        scoreChange = isWin ? modeData.scoreWin * 2 : modeData.scoreLose;
    }

    // 更新arena状态
    arena.dailyChallengesUsed++;
    arena.score = Math.max(0, arena.score + scoreChange);

    if (isWin) {
        arena.totalWins++;
        arena.currentStreak++;
        arena.promotionWins++;
        if (mode === '赏金赛') {
            arena.bountyWins++;
            const bountyReward = Math.floor(arena.bountyPool * 0.8);
            gameState.spiritStones += bountyReward;
            arena.bountyPool = 0;
            addLog(`🏆 赏金赛胜利！获得${bountyReward}灵石！`, '#ffd700');
        }
        if (arena.currentStreak > arena.longestStreak) {
            arena.longestStreak = arena.currentStreak;
        }
    } else {
        arena.totalLosses++;
        arena.currentStreak = 0;
        arena.promotionWins = 0;
    }

    // 检查段位提升
    checkArenaPromotion();

    // 记录战斗
    const match = {
        mode: mode,
        opponentName: opponent.name,
        opponentRank: opponent.rank,
        result: isWin ? 'win' : 'loss',
        scoreChange: scoreChange,
        playerPower: playerPower,
        opponentPower: opponentPower,
        timestamp: Date.now()
    };
    arena.matchHistory.push(match);
    if (arena.matchHistory.length > ARENA_CONFIG.matchHistoryLimit) {
        arena.matchHistory.shift();
    }

    // 更新统计
    arena.totalScoreEarned += Math.max(0, scoreChange);

    // 战斗日志
    if (isWin) {
        addLog(`🏆 天道竞技场${mode}胜利！+${scoreChange}分！当前段位: ${ARENA_RANKS[arena.currentRank]?.icon} ${ARENA_RANKS[arena.currentRank]?.name}`, '#4caf50');
    } else {
        addLog(`⚔️ 天道竞技场${mode}失败！${scoreChange}分...`, '#f44336');
    }

    updateDisplay();
    showArenaPanel();
}

function generateArenaOpponent() {
    const arena = gameState.celestialArena;
    const playerRank = arena.currentRank;

    // 根据玩家段位生成对手（上下浮动2个段位）
    const rankRange = Math.min(2, playerRank - 1, 12 - playerRank);
    const opponentRank = Math.max(1, Math.min(12, playerRank + Math.floor(Math.random() * (rankRange * 2 + 1)) - rankRange));

    const opponentNames = ['青云子', '玄冥真人', '紫霄真人', '白眉老祖', '血魔尊者', '天璇散人', '无极魔君', '天机阁主', '太虚真人', '九幽冥王', '玉清仙子', '东华帝君'];
    const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神', '大乘', '地仙', '天仙', '金仙'];

    const basePower = 100 + opponentRank * 50 + Math.floor(Math.random() * 30);
    const power = basePower * (0.9 + Math.random() * 0.2);

    return {
        name: opponentNames[Math.floor(Math.random() * opponentNames.length)],
        rank: opponentRank,
        realm: Math.min(realmNames.length - 1, Math.floor(opponentRank * 0.8)),
        power: Math.round(power)
    };
}

function calculatePlayerArenaPower() {
    const player = gameState;
    let power = 100;

    // 境界加成
    power += player.realm * 30;
    power += player.stage * 5;

    // 战斗属性加成
    const combat = player.combat || {};
    if (combat.fame) power += combat.fame * 0.1;
    if (combat.honor) power += combat.honor * 0.2;

    // 装备加成
    if (player.immortalEquipment) {
        Object.values(player.immortalEquipment).forEach(eq => {
            if (eq && eq.stats) {
                power += (eq.stats.attack || 0) * 0.5;
                power += (eq.stats.defense || 0) * 0.3;
            }
        });
    }

    // 法则加成
    if (player.celestialLaws && player.celestialLaws.active) {
        power += player.celestialLaws.active.length * 15;
    }

    // 仙宠加成
    if (player.spiritPets && player.spiritPets.pets) {
        player.spiritPets.pets.forEach(pet => {
            if (pet.isHatched) {
                power += pet.stats.attack * 0.3;
                power += pet.stats.defense * 0.2;
            }
        });
    }

    return Math.round(power);
}

function calculateArenaWinChance(playerPower, opponentPower) {
    const ratio = playerPower / opponentPower;
    if (ratio >= 1.5) return 0.85;
    if (ratio >= 1.2) return 0.70;
    if (ratio >= 1.0) return 0.55;
    if (ratio >= 0.8) return 0.40;
    if (ratio >= 0.6) return 0.25;
    return 0.15;
}

function checkArenaPromotion() {
    const arena = gameState.celestialArena;
    const currentRank = ARENA_RANKS[arena.currentRank];

    // 检查是否达到晋级条件
    if (arena.promotionWins >= ARENA_CONFIG.promotionMatches && arena.score >= currentRank.promotionScore) {
        if (arena.currentRank < ARENA_CONFIG.rankTiers) {
            arena.currentRank++;
            arena.promotionWins = 0;
            addLog(`🎉 恭喜突破至${ARENA_RANKS[arena.currentRank]?.icon} ${ARENA_RANKS[arena.currentRank]?.name}！`, '#ffd700');

            // 记录最高段位
            if (arena.currentRank > arena.highestRank) {
                arena.highestRank = arena.currentRank;
            }
        }
    }

    // 检查是否降段
    const minScoreForRank = ARENA_RANKS[arena.currentRank]?.minScore || 0;
    if (arena.currentRank > 1 && arena.score < minScoreForRank - 50) {
        if (arena.derankProtection > 0) {
            arena.derankProtection--;
            addLog(`⚠️ 段位保护生效（剩余${arena.derankProtection}次）`, '#ff9800');
        } else {
            arena.currentRank--;
            arena.derankProtection = ARENA_CONFIG.derankProtection;
            addLog(`📉 段位掉落至${ARENA_RANKS[arena.currentRank]?.icon} ${ARENA_RANKS[arena.currentRank]?.name}`, '#f44336');
        }
    }
}

function claimArenaSeasonReward() {
    const arena = gameState.celestialArena;
    const now = Date.now();
    const seasonEnd = arena.seasonStartTime + ARENA_CONFIG.seasonDays * 86400000;

    // 检查赛季是否结束
    if (now < seasonEnd) {
        addLog('赛季尚未结束', '#f44336');
        return;
    }

    // 检查是否已领取
    if (arena.lastRewardClaimed >= arena.seasonStartTime) {
        addLog('本赛季奖励已领取', '#f44336');
        return;
    }

    // 计算可领取奖励（基于最高段位）
    const reward = ARENA_REWARDS[arena.highestRank] || ARENA_REWARDS[1];
    gameState.spiritStones += reward.stones;
    gameState.combat.honor += reward.honor;

    arena.lastRewardClaimed = now;
    arena.totalRewardsClaimed++;

    addLog(`🎁 领取赛季奖励：${reward.stones}灵石 + ${reward.honor}荣誉（${reward.badge}）`, '#ffd700');
    updateDisplay();
}

function getArenaRankings() {
    // 模拟排行榜数据
    const arena = gameState.celestialArena;
    const rankings = [];

    // 添加玩家
    rankings.push({
        name: gameState.playerName || '你',
        rank: arena.currentRank,
        score: arena.score,
        isPlayer: true
    });

    // 生成AI玩家
    const aiNames = ['天璇子', '无极真人', '太虚剑仙', '九幽冥后', '天机老人', '紫霄仙子', '血魔老祖', '玉清真人', '东华帝君', '昆仑散人',
                     '蓬莱仙翁', '瑶池圣母', '东海龙王', '西王母', '南华真人', '北冥老祖', '中天大帝', '斗战胜佛', '齐天大圣', '如来佛祖'];
    const realms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    for (let i = 0; i < 50; i++) {
        const rank = realms[Math.floor(Math.random() * realms.length)];
        const score = ARENA_RANKS[rank]?.minScore + Math.floor(Math.random() * 200);
        rankings.push({
            name: aiNames[i % aiNames.length] + (i >= aiNames.length ? (i + 1) : ''),
            rank: rank,
            score: score,
            isPlayer: false
        });
    }

    // 按分数排序
    rankings.sort((a, b) => b.score - a.score);
    return rankings;
}

function getArenaPlayerRank() {
    const rankings = getArenaRankings();
    const idx = rankings.findIndex(e => e.isPlayer);
    return idx + 1;
}

function formatArenaTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
}

function processDailyArenaReset() {
    const arena = gameState.celestialArena;
    const now = Date.now();
    const seasonEnd = arena.seasonStartTime + ARENA_CONFIG.seasonDays * 86400000;

    // 每日重置挑战次数
    arena.dailyChallengesUsed = 0;

    // 检查赛季是否结束
    if (now >= seasonEnd) {
        // 赛季结束，结算奖励
        if (!arena.lastRewardClaimed || arena.lastRewardClaimed < arena.seasonStartTime) {
            addLog('🏆 赛季结束！请领取您的段位奖励！', '#ffd700');
        }

        // 开始新赛季
        arena.currentSeason++;
        arena.seasonStartTime = now;
        arena.promotionWins = 0;
        arena.bountyPool = 0;
        arena.bountyWins = 0;
        // 段位保留或微调
        if (arena.currentRank > 1) {
            arena.currentRank = Math.max(1, arena.currentRank - 1);
        }
        arena.score = ARENA_RANKS[arena.currentRank]?.minScore || 0;
        addLog(`🌟 第${arena.currentSeason}赛季开始！`, '#ff9800');
    }
}
// Auto-generated module: ascension.js

// ===== ASCENSION_COSTS =====
const ASCENSION_COSTS = {
    spiritStones: 500000,  // 50万灵石
    equipmentQuality: 'rare' // 需要紫色(rare)或以上装备
};

// ===== hasOrangeOrHigherEquip =====
function hasOrangeOrHigherEquip() {
    const qualityOrder = { common: 0, rare: 1, precious: 2, legendary: 3 };
    const minQuality = qualityOrder['rare']; // 紫色=rare=1, 橙色=precious=2
    
    // 检查背包
    for (const item of gameState.inventory) {
        if (item.type === 'treasure') {
            if ((qualityOrder[item.quality] || 0) >= minQuality) {
                return true;
            }
        }
    }
    
    // 检查已装备
    for (const equip of gameState.equippedTreasures) {
        if (equip && (qualityOrder[equip.quality] || 0) >= minQuality) {
            return true;
        }
    }
    
    return false;
}

// ===== canAscend =====
function canAscend() {
    // 检查渡劫是否成功
    const hasCompletedTribulation = gameState.realm >= 4 && gameState.stage >= 2;
    if (!hasCompletedTribulation) {
        return { result: false, reason: '需要渡劫成功（化神后期）' };
    }
    
    // 检查灵石
    if (gameState.spiritStones < ASCENSION_COSTS.spiritStones) {
        return { result: false, reason: `需要${ASCENSION_COSTS.spiritStones}灵石，飞升费用` };
    }
    
    // 检查橙色以上装备
    if (!hasOrangeOrHigherEquip()) {
        return { result: false, reason: '需要至少1件紫色以上品质的装备' };
    }
    
    // 检查是否已经飞升
    if (gameState.currentRealm === 'immortal') {
        return { result: false, reason: '已经飞升' };
    }
    
    return { result: true };
}

// ===== showAscensionButton =====
function showAscensionButton() {
    const check = canAscend();
    
    const btn = document.getElementById('ascensionBtn');
    if (!btn) return;
    
    if (check.result) {
        btn.style.display = 'inline-block';
        btn.style.background = 'linear-gradient(135deg, #9c27b0, #e91e63)';
        btn.style.boxShadow = '0 0 20px rgba(233, 30, 99, 0.5)';
        btn.onclick = showAscensionModal;
    } else {
        btn.style.display = 'inline-block';
        btn.style.background = '#444';
        btn.style.boxShadow = 'none';
        btn.onclick = () => showToast(check.reason);
    }
}

// ===== showAscensionModal =====
function showAscensionModal() {
    const check = canAscend();
    if (!check.result) {
        showToast(check.reason);
        return;
    }
    
    let html = '<div style="padding:20px;text-align:center;">';
    html += '<div style="font-size:48px;margin-bottom:10px;">🌟</div>';
    html += '<h2 style="color:#ffd700;margin-bottom:10px;">飞升成仙</h2>';
    html += '<p style="color:#aaa;font-size:13px;margin-bottom:20px;">突破凡界桎梏，进入仙界篇章</p>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:16px;">';
    html += '<div style="color:#ffd700;font-size:12px;margin-bottom:8px;">飞升消耗：</div>';
    html += `<div style="color:#f44336;margin-bottom:4px;">💎 500000 灵石（保留50%）</div>`;
    html += '<div style="color:#ff9800;margin-bottom:4px;">⚔️ 橙色以上装备 → 仙界材料</div>';
    html += '<div style="color:#4caf50;">✨ 已学功法 → 转换仙界版</div>';
    html += '</div>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:16px;">';
    html += '<div style="color:#ffd700;font-size:12px;margin-bottom:8px;">飞升保留：</div>';
    html += '<div style="color:#aaa;margin-bottom:4px;">• 灵石（扣除50%）</div>';
    html += '<div style="color:#aaa;margin-bottom:4px;">• 已学功法（转换仙界版）</div>';
    html += '<div style="color:#aaa;margin-bottom:4px;">• 宗门归属</div>';
    html += '<div style="color:#aaa;margin-bottom:4px;">• 成就/称号（部分保留）</div>';
    html += '<div style="color:#aaa;">• 宗门贡献</div>';
    html += '</div>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:16px;">';
    html += '<div style="color:#ffd700;font-size:12px;margin-bottom:8px;">仙界境界：</div>';
    html += '<div style="color:#4caf50;margin-bottom:4px;">🌱 地仙境 → 天仙境 → 金仙境</div>';
    html += '<div style="color:#2196f3;">⭐ 大罗金仙 → 混元大罗</div>';
    html += '</div>';
    
    html += `<button onclick="doAscend()" style="width:100%;padding:14px;background:linear-gradient(135deg,#9c27b0,#e91e63);color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">🌟 确认飞升</button>`;
    html += `<button onclick="closeModal()" style="width:100%;margin-top:8px;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">返回</button>`;
    html += '</div>';
    
    openModal('飞升', html, '');
}

// ===== doAscend =====
function doAscend() {
    const check = canAscend();
    if (!check.result) {
        showToast(check.reason);
        closeModal();
        return;
    }
    
    // 1. 扣除灵石（保留50%）
    const keepStones = Math.floor(gameState.spiritStones * 0.5);
    const spentStones = gameState.spiritStones - keepStones;
    gameState.spiritStones = keepStones;
    
    // 2. 凡界装备 → 材料（只保留橙色以上）
    const materialsGained = [];
    const qualityOrder = { common: 0, rare: 1, precious: 2, legendary: 3 };
    
    // 背包装备转化
    const newInventory = [];
    for (const item of gameState.inventory) {
        if (item.type === 'treasure' && qualityOrder[item.quality] >= qualityOrder['precious']) {
            materialsGained.push({ name: item.name, quality: item.quality });
        } else {
            newInventory.push(item);
        }
    }
    gameState.inventory = newInventory;
    
    // 装备栏转化
    for (let i = 0; i < gameState.equippedTreasures.length; i++) {
        const equip = gameState.equippedTreasures[i];
        if (equip && qualityOrder[equip.quality] >= qualityOrder['precious']) {
            materialsGained.push({ name: equip.name, quality: equip.quality });
            gameState.equippedTreasures[i] = null;
        }
    }
    
    // 3. 初始化仙界状态
    initializeImmortalState();
    
    // 4. 设置初始仙石
    gameState.immortal.spiritStones = 0; // 仙石独立
    
    // 5. 切换到仙界
    gameState.currentRealm = 'immortal';
    
    // 6. 保留一些凡界资源
    gameState.realm = 1; // 凡界境界回归筑基
    gameState.stage = 0;
    gameState.cultivationProgress = 0;
    
    // 7. 保存日志
    addLog('good', '飞升成功', `历经${gameState.days}天的修炼，终于飞升成仙！`);
    
    saveGame();
    
    // 8. 关闭模态框，显示成功界面
    closeModal();
    showAscensionSuccessScreen();
}

// ===== showAscensionSuccessScreen =====
function showAscensionSuccessScreen() {
    let html = '<div style="padding:30px;text-align:center;">';
    html += '<div style="font-size:64px;animation:pulse 2s infinite;">✨🌟✨</div>';
    html += '<h2 style="color:#ffd700;font-size:24px;margin:20px 0;">恭喜飞升成仙！</h2>';
    html += '<p style="color:#aaa;margin-bottom:20px;">你已突破凡界桎梏，进入仙界篇章</p>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:20px;">';
    html += '<div style="color:#4caf50;margin-bottom:8px;">✅ 保留50%灵石：' + gameState.spiritStones + '</div>';
    html += '<div style="color:#2196f3;margin-bottom:8px;">✅ 境界：地仙境（重新修炼）</div>';
    html += '<div style="color:#9c27b0;">✅ 仙界篇章开启</div>';
    html += '</div>';
    
    html += '<div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:left;margin-bottom:20px;">';
    html += '<div style="color:#ffd700;margin-bottom:8px;">📍 当前区域：仙灵谷</div>';
    html += '<div style="color:#aaa;font-size:13px;">仙气充沛，适合初入仙界者修炼</div>';
    html += '</div>';
    
    html += `<button onclick="enterImmortalRealm()" style="width:100%;padding:14px;background:linear-gradient(135deg,#4caf50,#2e7d32);color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">☁️ 进入仙界</button>`;
    html += '</div>';
    
    openModal('飞升', html, '');
}

// ===== enterImmortalRealm =====
function enterImmortalRealm() {
    closeModal();
    saveGame();
    updateDisplay();
    
    // 显示仙界UI
    if (typeof showImmortalMainUI === 'function') {
        showImmortalMainUI();
    }
    
    addLog('good', '进入仙界', '踏入仙界，开始全新的修仙之旅！');
}

// ===== switchRealm =====
function switchRealm(targetRealm) {
    if (targetRealm === gameState.currentRealm) return;
    
    if (targetRealm === 'immortal') {
        if (!gameState.immortal) {
            showToast('尚未飞升，无法进入仙界');
            return;
        }
        gameState.currentRealm = 'immortal';
        addLog('neutral', '切换位面', '进入仙界');
    } else {
        gameState.currentRealm = 'mortal';
        addLog('neutral', '切换位面', '返回凡界');
    }
    
    saveGame();
    updateDisplay();
    
    // 重新渲染UI
    if (typeof renderGameUI === 'function') renderGameUI();
}

// ===== showRealmSwitchButton =====
function showRealmSwitchButton() {
    if (!gameState.immortal) return; // 未飞升不显示
    
    const btn = document.getElementById('realmSwitchBtn');
    if (!btn) return;
    
    if (gameState.currentRealm === 'mortal') {
        btn.textContent = '☁️ 仙界';
        btn.onclick = () => switchRealm('immortal');
    } else {
        btn.textContent = '🏯 凡界';
        btn.onclick = () => switchRealm('mortal');
    }
    
    btn.style.display = 'inline-block';
}

// ===== doFateTask =====
function doFateTask() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('仙缘任务只在仙界可用');
        return;
    }
    
    const today = Math.floor(gameState.days / 1);
    if (gameState.immortal.fateTaskRefreshDay === today) {
        showToast('今日仙缘任务已完成');
        return;
    }
    
    // 仙缘任务奖励
    const reward = Math.floor(100 + Math.random() * 400);
    earnSpiritStones(reward, '每日仙缘任务');
    
    // 20%概率额外奖励
    if (Math.random() < 0.2) {
        const bonus = Math.floor(50 + Math.random() * 150);
        earnSpiritStones(bonus, '天赐福缘');
        showToast(`天赐福缘！额外获得${bonus}仙石`);
    }
    
    gameState.immortal.fateTaskRefreshDay = today;
    gameState.immortal.lastFateTask = gameState.days;
    saveGame();
}

// ===== doCelestialCycle =====
function doCelestialCycle() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('天道轮回只在仙界可用');
        return;
    }
    
    const cycleDay = 7;
    const daysSinceCycle = gameState.days - (gameState.immortal.celestialCycleDay || 0);
    
    if (daysSinceCycle < cycleDay) {
        showToast(`天道轮回每7天一次，还需${cycleDay - daysSinceCycle}天`);
        return;
    }
    
    // 开始天道轮回
    const survivalChance = 0.7 + (gameState.immortal.realm * 0.05);
    
    if (Math.random() < survivalChance) {
        // 成功
        const reward = Math.floor(200 + Math.random() * 600);
        earnSpiritStones(reward, '天道轮回奖励');
        
        // 额外奖励
        if (gameState.immortal.celestialCycleCompleted) {
            const extra = Math.floor(100 + Math.random() * 200);
            earnSpiritStones(extra, '轮回福报');
        }
        
        gameState.immortal.celestialCycleCompleted = true;
        showToast(`天道轮回完成！获得${reward}仙石`);
    } else {
        // 失败
        const loss = Math.floor(gameState.immortal.spiritStones * 0.1);
        gameState.immortal.spiritStones = Math.max(0, gameState.immortal.spiritStones - loss);
        showToast(`天道轮回失败！损失${loss}仙石`);
    }
    
    gameState.immortal.celestialCycleDay = gameState.days;
    saveGame();
    updateDisplay();
}

// Auto-generated module: combat.js

        // ===== calculateSetBonuses =====
        function calculateSetBonuses() {
            const equipped = [];
            if (combatState.player.weaponData) equipped.push(combatState.player.weaponData.name);
            if (combatState.player.armorData) equipped.push(combatState.player.armorData.name);
            if (combatState.player.accessories) {
                combatState.player.accessories.forEach(a => { if (a) equipped.push(a.name); });
            }
            const bonuses = {};
            const skills = [];
            for (const setName in SET_BONUSES) {
                const set = SET_BONUSES[setName];
                const matched = set.pieces.filter(p => equipped.includes(p));
                if (matched.length >= 2) {
                    bonuses[setName] = matched.length; // 2 or 3
                    if (matched.length === set.count && set.skill) skills.push(set.skill);
                }
            }
            combatState.player.setBonuses = bonuses;
            combatState.player.skills = skills;
            return bonuses;
        }

        // ===== recalculatePlayerStats =====
        function recalculatePlayerStats() {
            let attackBonus = 1.0, critBonus = 0, defenseBonus = 1.0, qiRegenBonus = 0;
            for (const setName in combatState.player.setBonuses) {
                const set = SET_BONUSES[setName];
                const count = combatState.player.setBonuses[setName];
                if (set.stats.attackPercent) attackBonus += set.stats.attackPercent * (count === 3 ? 1 : 0.5);
                if (set.stats.critPercent) critBonus += set.stats.critPercent * (count === 3 ? 1 : 0.5);
                if (set.stats.defensePercent) defenseBonus += set.stats.defensePercent * (count === 3 ? 1 : 0.5);
                if (set.stats.qiRegenPercent) qiRegenBonus += set.stats.qiRegenPercent * (count === 3 ? 1 : 0.5);
            }
            combatState.player.attackPercent = attackBonus;
            combatState.player.critBonus = critBonus;
            combatState.player.defensePercent = defenseBonus;
            combatState.player.qiRegenBonus = qiRegenBonus;
        }

        // ===== getCurrentUltimateSkills =====
        function getCurrentUltimateSkills() {
            const weaponData = combatState.player.weaponData || { name:'空手' };
            return ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
        }

        // ===== getEnergyBar =====
        function getEnergyBar() {
            const skills = getCurrentUltimateSkills();
            // 找到最低cost的技能作为能量条参考
            const minCost = skills.length > 0 ? Math.min(...skills.map(s => s.cost)) : 50;
            const pct = Math.min(100, (combatEnergy / minCost) * 100);
            const ready = combatEnergy >= minCost;
            return {
                current: combatEnergy,
                cost: minCost,
                pct,
                ready,
                skills
            };
        }

        // ===== executeUltimateSkill =====
        function executeUltimateSkill(skill) {
            const weaponData = combatState.player.weaponData || { name:'空手', star:1 };
            const level = combatState.player.skillLevels ? (combatState.player.skillLevels[skill.id] || 1) : 1;
            const starMultiplier = ENHANCE_CONFIG && ENHANCE_CONFIG.starMultipliers ? (ENHANCE_CONFIG.starMultipliers[weaponData.star] || 1.0) : 1.0;

            if (combatEnergy < skill.cost) return;

            combatEnergy -= skill.cost;
            combatState.round++;

            // 计算基础伤害
            const baseAttack = typeof calculatePlayerAttack === 'function' ? calculatePlayerAttack() : combatState.player.attack;
            const levelMultiplier = 1 + (level - 1) * 0.2;
            let damage = Math.floor(baseAttack * skill.damage * levelMultiplier * starMultiplier);

            // 功法克制
            if (TECHNIQUE_BONUS[combatState.player.technique].beats === combatState.opponent.technique) {
                damage = Math.floor(damage * 1.5);
            }

            const isCrit = Math.random() < combatState.player.critRate;
            if (isCrit) damage = Math.floor(damage * 1.5);

            let finalDamage = damage;
            if (!combatState.effects.player.ignoreDefense) {
                finalDamage = Math.max(1, damage - Math.floor(combatState.opponent.defense * 0.3));
            }
            combatState.opponent.hp = Math.max(0, combatState.opponent.hp - finalDamage);
            let logText = `⚡ ${weaponData.name} 发动 ${skill.name} Lv.${level}！造成 ${finalDamage} 伤害！${isCrit ? '（暴击）' : ''}`;

            // 应用效果
            if (skill.effects) {
                if (skill.effects.burn) {
                    const chance = skill.effects.burn * levelMultiplier;
                    if (Math.random() < chance) {
                        combatState.opponent.burning = skill.effects.burnTurns || 3;
                        logText += ` 🔥敌人被灼烧 ${combatState.opponent.burning} 回合！`;
                    }
                }
                if (skill.effects.freeze) {
                    const chance = skill.effects.freeze * levelMultiplier;
                    if (Math.random() < chance) {
                        combatState.opponent.frozen = skill.effects.freezeTurns || 2;
                        logText += ` ❄️敌人被冻结 ${combatState.opponent.frozen} 回合！`;
                    }
                }
                if (skill.effects.stun) {
                    if (Math.random() < skill.effects.stun * levelMultiplier) {
                        combatState.opponent.stunned = 1;
                        logText += ` 💫敌人被眩晕 1 回合！`;
                    }
                }
                if (skill.effects.defBoost) {
                    combatState.effects.player.defenseBoost = (combatState.effects.player.defenseBoost || 0) + skill.effects.defBoost * levelMultiplier;
                    logText += ` 🛡️防御提升 ${Math.round(skill.effects.defBoost * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.critBonus) {
                    combatState.effects.player.critBoostNext = (combatState.effects.player.critBoostNext || 0) + skill.effects.critBonus * levelMultiplier;
                    logText += ` 💥暴击率提升 ${Math.round(skill.effects.critBonus * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.drain) {
                    const drainAmount = Math.floor(finalDamage * skill.effects.drain * levelMultiplier);
                    combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + drainAmount);
                    logText += ` 💉吸取 ${drainAmount} HP！`;
                }
                if (skill.effects.trueDamage) {
                    const trueDmg = Math.floor(finalDamage * skill.effects.trueDamage * levelMultiplier);
                    combatState.opponent.hp = Math.max(0, combatState.opponent.hp - trueDmg);
                    logText += ` ✨真实伤害 +${trueDmg}！`;
                }
                if (skill.effects.healRate) {
                    const healPerTurn = Math.floor(combatState.player.maxHp * skill.effects.healRate * levelMultiplier);
                    combatState.effects.player.healRate = (combatState.effects.player.healRate || 0) + healPerTurn;
                    logText += ` 💚每回合恢复 ${healPerTurn} HP！`;
                }
                if (skill.effects.dmgReduce) {
                    combatState.effects.player.damageReduction = (combatState.effects.player.damageReduction || 0) + skill.effects.dmgReduce * levelMultiplier;
                    logText += ` 🛡️伤害减免 ${Math.round(skill.effects.dmgReduce * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.counterRate) {
                    combatState.effects.player.counterRate = (combatState.effects.player.counterRate || 0) + skill.effects.counterRate * levelMultiplier;
                    logText += ` ⚡反击率提升 ${Math.round(skill.effects.counterRate * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.speedReduce) {
                    combatState.opponent.speedReduce = (combatState.opponent.speedReduce || 0) + skill.effects.speedReduce * levelMultiplier;
                    logText += ` 🌪️敌人速度降低！`;
                }
                if (skill.effects.armorBreak) {
                    combatState.opponent.armorBroken = true;
                    logText += ` 💥敌人护甲破碎！`;
                }
                if (skill.effects.chain) {
                    if (combatState.opponent.hp > 0) {
                        const chainDmg = Math.floor(finalDamage * skill.effects.chain);
                        combatState.opponent.hp = Math.max(0, combatState.opponent.hp - chainDmg);
                        logText += ` ⛓️雷链传导，额外 ${chainDmg} 伤害！`;
                    }
                }
                if (skill.effects.fireResist) {
                    combatState.effects.player.fireResist = (combatState.effects.player.fireResist || 0) + skill.effects.fireResist;
                    logText += ` 🔥火抗提升！`;
                }
                if (skill.effects.fireDrain) {
                    combatState.effects.player.fireDrain = (combatState.effects.player.fireDrain || 0) + skill.effects.fireDrain;
                    logText += ` 🔥火焰吸收！`;
                }
                if (skill.effects.reflect) {
                    combatState.effects.player.reflect = (combatState.effects.player.reflect || 0) + skill.effects.reflect;
                    logText += ` 🔄伤害反射！`;
                }
                if (skill.effects.maxHpBoost) {
                    combatState.player.maxHP += Math.floor(combatState.player.maxHP * skill.effects.maxHpBoost);
                    combatState.player.hp = Math.min(combatState.player.hp, combatState.player.maxHP);
                    logText += ` ❤️最大HP提升！`;
                }
                if (skill.effects.cleanse) {
                    combatState.effects.player.cleanseStacks = (combatState.effects.player.cleanseStacks || 0) + skill.effects.cleanse;
                    logText += ` ✨净化负面状态！`;
                }
                if (skill.effects.invincible) {
                    combatState.effects.player.invincible = skill.effects.invincible;
                    logText += ` 👼无敌状态！`;
                }
                if (skill.effects.thunder) {
                    combatState.effects.player.thunderBonus = (combatState.effects.player.thunderBonus || 0) + skill.effects.thunder * levelMultiplier;
                    logText += ` ⚡雷法伤害+${Math.round(skill.effects.thunder * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.doubleHit) {
                    combatState.effects.player.doubleHit = (combatState.effects.player.doubleHit || 0) + skill.effects.doubleHit * levelMultiplier;
                    logText += ` ⚔️连击+${Math.round(skill.effects.doubleHit * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.pierce) {
                    combatState.effects.player.pierce = (combatState.effects.player.pierce || 0) + skill.effects.pierce * levelMultiplier;
                    logText += ` 🗡️穿刺+${Math.round(skill.effects.pierce * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.cleave) {
                    combatState.effects.player.cleave = (combatState.effects.player.cleave || 0) + skill.effects.cleave * levelMultiplier;
                    logText += ` 🌀顺劈+${Math.round(skill.effects.cleave * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.freezeAura) {
                    combatState.effects.player.freezeAura = (combatState.effects.player.freezeAura || 0) + skill.effects.freezeAura * levelMultiplier;
                    logText += ` ❄️冰霜光环！`;
                }
                if (skill.effects.burnAura) {
                    combatState.effects.player.burnAura = (combatState.effects.player.burnAura || 0) + skill.effects.burnAura * levelMultiplier;
                    logText += ` 🔥灼烧光环！`;
                }
                if (skill.effects.curse) {
                    combatState.effects.opponent.curse = (combatState.effects.opponent.curse || 0) + skill.effects.curse * levelMultiplier;
                    logText += ` 💀诅咒！`;
                }
            }

            combatState.log.push({ type: 'player-action', actionType: 'ultimate', text: logText, round: combatState.round });
            combatState.turn = 'opponent';
            renderCombatArena();

            if (combatState.opponent.hp <= 0) {
                setTimeout(() => endCombat('win'), 500);
            } else {
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }

        // ===== generateOpponent =====
        function generateOpponent(difficulty) {
            const playerRealm = gameState.realm;
            let targetRealm = playerRealm;
            if (difficulty === 'easy') targetRealm = Math.max(0, playerRealm - 1);
            else if (difficulty === 'normal') targetRealm = playerRealm;
            else if (difficulty === 'hard') targetRealm = Math.min(4, playerRealm + 1);

            const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
            const stages = ['初期', '中期', '后期'];
            const stage = Math.floor(Math.random() * 3);

            const hpByRealm = { 0: 500, 1: 800, 2: 1000, 3: 2000, 4: 5000 };
            const baseHp = hpByRealm[targetRealm] || 1000;
            const baseAttack = 80 + targetRealm * 40;
            const baseDefense = 40 + targetRealm * 20;
            const baseSpeed = 80 + targetRealm * 15;

            const technique = TECHNIQUES[Math.floor(Math.random() * 4)];
            const treasures = Object.keys(COMBAT_TREASURES);
            const weapon = treasures.filter(t => COMBAT_TREASURES[t].type === 'weapon');
            const armor = treasures.filter(t => COMBAT_TREASURES[t].type === 'armor');

            const opponentFixed = FIXED_OPPONENTS[Math.floor(Math.random() * FIXED_OPPONENTS.length)];
            const name = difficulty === 'normal' ? opponentFixed.name : `${opponentFixed.name}（${['初级', '中级', '高级'][difficulty === 'easy' ? 0 : difficulty === 'normal' ? 1 : 2]}）`;

            return {
                name: name,
                avatar: opponentFixed.avatar,
                realm: targetRealm,
                realmName: realmNames[targetRealm] + '期' + stages[stage],
                maxHP: baseHp,
                hp: baseHp,
                attack: baseAttack,
                defense: baseDefense,
                speed: baseSpeed,
                technique: technique,
                techniqueColor: TECHNIQUE_COLORS[technique],
                weapon: weapon[Math.floor(Math.random() * weapon.length)],
                armor: armor[Math.floor(Math.random() * armor.length)],
                critRate: 0.1 + targetRealm * 0.03
            };
        }

        // ===== openCombat =====
        function openCombat() {
            renderCombatHome();
            document.getElementById('combatModal').classList.add('active');
        }

        // ===== closeCombat =====
        function closeCombat() {
            document.getElementById('combatModal').classList.remove('active');
            combatState.inProgress = false;
        }

        // ===== renderCombatHome =====
        function renderCombatHome() {
            const wins = gameState.combat?.wins || 0;
            const losses = gameState.combat?.losses || 0;
            const honor = gameState.combat?.honor || 0;
            const fame = gameState.combat?.fame || 0;
            const total = wins + losses;

            let html = `
                <div class="honor-display">
                    <div class="honor-stats">
                        <div class="honor-stat">
                            <div class="honor-stat-value">${honor}</div>
                            <div class="honor-stat-label">荣誉点</div>
                        </div>
                        <div class="honor-stat">
                            <div class="honor-stat-value">${fame}</div>
                            <div class="honor-stat-label">声望</div>
                        </div>
                        <div class="honor-stat">
                            <div class="honor-stat-value">${wins}</div>
                            <div class="honor-stat-label">胜</div>
                        </div>
                        <div class="honor-stat">
                            <div class="honor-stat-value">${losses}</div>
                            <div class="honor-stat-label">负</div>
                        </div>
                    </div>
                </div>
                <div class="challenge-cost">
                    挑战消耗：<span>挑战状 ×1</span> | 当前拥有：<span>${getItemCount('挑战状')}张</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;">
                    <button class="combat-action-btn" onclick="startCombatChallenge('easy')" ${getItemCount('挑战状') < 1 ? 'disabled' : ''}>
                        <div style="font-size:1.2em">🟢 初级挑战</div>
                        <div style="font-size:0.8em;color:#aaa">境界低于你</div>
                    </button>
                    <button class="combat-action-btn" onclick="startCombatChallenge('normal')" ${getItemCount('挑战状') < 1 ? 'disabled' : ''}>
                        <div style="font-size:1.2em">🟡 中级挑战</div>
                        <div style="font-size:0.8em;color:#aaa">境界相当</div>
                    </button>
                    <button class="combat-action-btn" onclick="startCombatChallenge('hard')" ${getItemCount('挑战状') < 1 ? 'disabled' : ''}>
                        <div style="font-size:1.2em">🔴 高级挑战</div>
                        <div style="font-size:0.8em;color:#aaa">境界高于你</div>
                    </button>
                </div>
                <h3 style="color:#ffd700;margin:15px 0 10px;">历史战绩</h3>
                <div class="battle-history" id="battleHistory">
            `;

            const history = gameState.combat?.battleHistory || [];
            if (history.length === 0) {
                html += '<p style="text-align:center;color:#888;padding:20px;">暂无战绩记录</p>';
            } else {
                history.slice(0, 10).forEach(record => {
                    const resultClass = record.result === 'win' ? 'win' : 'lose';
                    const resultText = record.result === 'win' ? '胜' : '负';
                    html += `
                        <div class="battle-record ${resultClass}">
                            <div class="battle-record-info">
                                <span class="battle-record-result ${resultClass}">${resultText}</span>
                                <span class="battle-record-opponent">vs ${record.opponent}</span>
                            </div>
                            <span class="battle-record-reward">${record.result === 'win' ? '+' + record.reward : '-' + record.penalty}灵石</span>
                        </div>
                    `;
                });
            }
            html += '</div><button class="close-btn" onclick="closeCombat()">关闭</button>';
            document.getElementById('combatContent').innerHTML = html;
        }

        // ===== getItemCount =====
        function getItemCount(name) {
            const item = gameState.inventory.find(i => i.name === name);
            return item ? item.quantity : 0;
        }

        // ===== startCombatChallenge =====
        function startCombatChallenge(difficulty) {
            if (getItemCount('挑战状') < 1) {
                alert('挑战状不足！请在商店购买。');
                return;
            }

            // 消耗挑战状
            const idx = gameState.inventory.findIndex(i => i.name === '挑战状');
            if (idx !== -1) {
                gameState.inventory[idx].quantity--;
                if (gameState.inventory[idx].quantity <= 0) {
                    gameState.inventory.splice(idx, 1);
                }
            }

            const opponent = generateOpponent(difficulty);
            initCombat(opponent);
            renderCombatArena();
        }

        // ===== initCombat =====
        function initCombat(opponent) {
            const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
            const hpByRealm = { 0: 500, 1: 800, 2: 1000, 3: 2000, 4: 5000 };

            const playerWeapon = gameState.equippedTreasures[0];
            const playerArmor = gameState.equippedTreasures[1];

            let playerMaxHP = hpByRealm[gameState.realm] || 1000;
            let playerAttack = 80 + gameState.realm * 40;
            let playerDefense = 40 + gameState.realm * 20;
            let playerSpeed = 80 + gameState.realm * 15;
            let playerCritRate = 0.1 + gameState.realm * 0.03;
            let playerTechnique = getPlayerTechnique();

            // 应用装备星级加成
            if (playerWeapon && COMBAT_TREASURES[playerWeapon.name]) {
                const weaponData = COMBAT_TREASURES[playerWeapon.name];
                const star = playerWeapon.star || 1;
                const mult = ENHANCE_CONFIG.starMultipliers[star] || 1.0;
                const baseVal = weaponData.effect.attackBonus || 0;
                playerAttack = Math.floor(playerAttack * (1 + baseVal * mult));
                if (weaponData.effect.critBonus) {
                    playerCritRate += weaponData.effect.critBonus * mult;
                }
            }
            if (playerArmor && COMBAT_TREASURES[playerArmor.name]) {
                const armorData = COMBAT_TREASURES[playerArmor.name];
                const star = playerArmor.star || 1;
                const mult = ENHANCE_CONFIG.starMultipliers[star] || 1.0;
                const baseDef = armorData.effect.defenseBonus || 0;
                const baseHP = armorData.effect.hpBonus || 0;
                if (baseDef > 0) playerDefense = Math.floor(playerDefense * (1 + baseDef * mult));
                if (baseHP > 0) playerMaxHP = Math.floor(playerMaxHP * (1 + baseHP * mult));
            }
            
            // V7 应用体质战斗效果
            if (gameState.activeEffects.constitution_bonuses) {
                const cb = gameState.activeEffects.constitution_bonuses;
                if (cb.attack) playerAttack = Math.floor(playerAttack * (1 + cb.attack));
                if (cb.defense) playerDefense = Math.floor(playerDefense * (1 + cb.defense));
                if (cb.hpBonus) playerMaxHP = Math.floor(playerMaxHP * (1 + cb.hpBonus));
                if (cb.crit) playerCritRate += cb.crit;
                if (cb.dodge) playerSpeed += Math.floor(playerSpeed * cb.dodge);
            }
            // 应用all_stats加成
            if (gameState.activeEffects.all_stats) {
                playerAttack = Math.floor(playerAttack * (1 + gameState.activeEffects.all_stats));
                playerDefense = Math.floor(playerDefense * (1 + gameState.activeEffects.all_stats));
                playerMaxHP = Math.floor(playerMaxHP * (1 + gameState.activeEffects.all_stats));
            }

            combatEnergy = 0; // 重置必杀技能量

            combatState = {
                inProgress: true,
                round: 0,
                turn: playerSpeed >= opponent.speed ? 'player' : 'opponent',
                player: {
                    name: '你',
                    avatar: '🧑‍🎓',
                    realm: gameState.realm,
                    realmName: realmNames[gameState.realm] + '期',
                    maxHP: playerMaxHP,
                    hp: playerMaxHP,
                    attack: playerAttack,
                    defense: playerDefense,
                    speed: playerSpeed,
                    technique: playerTechnique,
                    techniqueColor: TECHNIQUE_COLORS[playerTechnique],
                    weapon: playerWeapon ? playerWeapon.name : null,
                    weaponData: playerWeapon, // 完整对象含星级
                    armor: playerArmor ? playerArmor.name : null,
                    armorData: playerArmor,
                    critRate: playerCritRate,
                    setBonuses: {},
                    skills: [],
                    accessories: [],
                    counterEnergy: 0,
                    inDefenseStance: false,
                    skillLevels: {}
                },
                opponent: opponent,
                log: [],
                effects: {
                    player: { defending: false, attackBoost: 0, defenseBoost: 0, ignoreDefense: false, burning: 0, frozen: 0 },
                    opponent: { defending: false, attackBoost: 0, defenseBoost: 0, burning: 0, frozen: 0 }
                }
            };

            // A4 套装共鸣加成
            calculateSetBonuses();
            recalculatePlayerStats();

            combatState.log.push({
                type: 'system',
                text: `战斗开始！${opponent.name}（${opponent.realmName}，功法：${opponent.technique}）`,
                round: 0
            });

            if (combatState.turn === 'opponent') {
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }

        // ===== renderUltimateEnergyBar =====
        function renderUltimateEnergyBar() {
            const info = getEnergyBar();
            const readyClass = info.ready ? 'energy-ready' : '';
            const skillName = info.skills.length > 0 ? info.skills[0].name.substring(0,3) : '绝技';
            return `
                <div class="ultimate-energy-bar" style="margin-top:5px;">
                    <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">
                        <span style="font-size:0.75em;color:#ffd700;">⚡ ${skillName}</span>
                        <span style="font-size:0.7em;color:#aaa;margin-left:auto;">${info.current}/${info.cost}</span>
                    </div>
                    <div style="background:rgba(0,0,0,0.4);border-radius:4px;height:8px;overflow:hidden;">
                        <div class="energy-fill ${readyClass}" style="width:${info.pct}%;background:${info.ready ? '#ffd700' : '#555'};height:100%;border-radius:4px;transition:width 0.3s;"></div>
                    </div>
                </div>
            `;
        }

        // ===== renderCounterEnergyBar =====
        function renderCounterEnergyBar() {
            const energy = combatState.player.counterEnergy || 0;
            const max = 100;
            const pct = (energy / max) * 100;
            const ready = energy >= 50;
            const color = ready ? '#ffeb3b' : '#888888';
            const glow = ready ? 'box-shadow: 0 0 8px #ffeb3b;' : '';
            return `
                <div style="margin-top:4px;display:flex;align-items:center;gap:6px;">
                    <span style="font-size:11px;color:#aaa;">⚡反击</span>
                    <div style="flex:1;height:8px;background:#333;border-radius:4px;overflow:hidden;">
                        <div style="width:${pct}%;height:100%;background:${color};${glow}transition:width 0.3s,background 0.3s;"></div>
                    </div>
                    <span style="font-size:10px;color:#888;">${energy}/${max}</span>
                </div>
            `;
        }

        // ===== addCombatLog =====
        function addCombatLog(message) {
            if (!gameState.combatLogHistory) gameState.combatLogHistory = [];
            const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
            gameState.combatLogHistory.push({time, message});
            if (gameState.combatLogHistory.length > 100) gameState.combatLogHistory.shift();
        }

        // ===== addEventLog =====
        function addEventLog(message, type='normal') {
            const colors = { normal:'#ccc', success:'#00ff88', warning:'#ff9800', danger:'#f44336' };
            const color = colors[type] || colors.normal;
            // 通过addLog系统记录
            addLog(type === 'success' ? 'good' : type === 'danger' ? 'bad' : type, '提示', message);
        }

        // ===== showCombatLogHistory =====
        function showCombatLogHistory() {
            const history = gameState.combatLogHistory || [];
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;max-height:400px;overflow-y:auto;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
            html += '<b style="color:#ffd700;font-size:14px;">⚔️ 战斗日志历史</b>';
            html += `<span style="color:#888;font-size:11px;">${history.length}条记录</span>`;
            html += '</div>';
            if (history.length === 0) {
                html += '<div style="color:#666;text-align:center;padding:20px;">暂无记录</div>';
            } else {
                history.forEach(entry => {
                    html += `<div style="margin-bottom:6px;padding:6px;background:#252540;border-radius:4px;font-size:12px;">`;
                    html += `<span style="color:#666;font-size:10px;">[${entry.time}]</span> `;
                    html += `<span style="color:#ccc;">${entry.message}</span>`;
                    html += '</div>';
                });
            }
            html += '<div style="margin-top:10px;display:flex;gap:8px;">';
            html += `<button onclick="clearCombatLogHistory()" style="flex:1;padding:8px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;">清空</button>`;
            html += `<button onclick="closeModal()" style="flex:1;padding:8px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">关闭</button>`;
            html += '</div></div>';
            showModal(html);
        }

        // ===== clearCombatLogHistory =====
        function clearCombatLogHistory() {
            gameState.combatLogHistory = [];
            addEventLog('⚠️ 战斗日志已清空', 'warning');
            closeModal();
        }

        // ===== showEventLogHistory =====
        function showEventLogHistory() {
            const history = gameState.eventLogHistory || [];
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;max-height:400px;overflow-y:auto;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
            html += '<b style="color:#ffd700;font-size:14px;">📜 事件日志历史</b>';
            html += `<span style="color:#888;font-size:11px;">${history.length}条记录</span>`;
            html += '</div>';
            if (history.length === 0) {
                html += '<div style="color:#666;text-align:center;padding:20px;">暂无记录</div>';
            } else {
                history.slice().reverse().forEach(entry => {
                    const colors = { good:'#00ff88', bad:'#f44336', neutral:'#ccc', negative:'#f44336', warning:'#ff9800', welcome:'#ffd700' };
                    const color = colors[entry.type] || '#ccc';
                    html += `<div style="margin-bottom:6px;padding:6px;background:#252540;border-radius:4px;font-size:12px;">`;
                    html += `<span style="color:#666;font-size:10px;">[${entry.time}] 第${entry.day}天</span> `;
                    html += `<span style="color:${color};">${entry.title}</span> `;
                    html += `<span style="color:#aaa;">${entry.text}</span>`;
                    html += '</div>';
                });
            }
            html += '<div style="margin-top:10px;display:flex;gap:8px;">';
            html += `<button onclick="clearEventLogHistory()" style="flex:1;padding:8px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;">清空</button>`;
            html += `<button onclick="closeModal()" style="flex:1;padding:8px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">关闭</button>`;
            html += '</div></div>';
            showModal(html);
        }

        // ===== clearEventLogHistory =====
        function clearEventLogHistory() {
            gameState.eventLogHistory = [];
            addLog('warning', '日志清空', '事件日志已清空');
            closeModal();
        }

        // ===== renderCombatArena =====
        function renderCombatArena() {
            const p = combatState.player;
            const o = combatState.opponent;
            const pHpPercent = (p.hp / p.maxHP) * 100;
            const oHpPercent = (o.hp / o.maxHP) * 100;
            const pHpClass = pHpPercent <= 25 ? 'low' : pHpPercent <= 50 ? 'medium' : '';
            const oHpClass = oHpPercent <= 25 ? 'low' : oHpPercent <= 50 ? 'medium' : '';

            let html = `
                <div class="combat-arena">
                    <div class="combatants">
                        <div class="combatant player">
                            <div class="combatant-header">
                                <span class="combatant-avatar">${p.avatar}</span>
                                <div class="combatant-info">
                                    <div class="combatant-name">${p.name}</div>
                                    <div class="combatant-realm">${p.realmName} | ${p.technique}</div>
                                </div>
                            </div>
                            <div class="combatant-hp-bar">
                                <div class="combatant-hp-fill ${pHpClass}" style="width:${pHpPercent}%">
                                    ${p.hp}/${p.maxHP}
                                </div>
                            </div>
                            <div class="combatant-stats">
                                <span class="combatant-stat"><span class="icon">⚔️</span>${p.attack}</span>
                                <span class="combatant-stat"><span class="icon">🛡️</span>${p.defense}</span>
                                <span class="combatant-stat"><span class="icon">💨</span>${p.speed}</span>
                                <span class="combatant-stat"><span class="icon">💥</span>${Math.round(p.critRate * 100)}%</span>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="flex:1;">${renderUltimateEnergyBar()}</div>
                                <div style="flex:1;">${renderCounterEnergyBar()}</div>
                            </div>
                            <div class="combatant-effects">
                                ${p.weapon ? `<span class="combat-effect">${p.weapon}</span>` : ''}
                                ${p.armor ? `<span class="combat-effect">${p.armor}</span>` : ''}
                            </div>
                        </div>
                        <div class="combatant opponent">
                            <div class="combatant-header">
                                <span class="combatant-avatar">${o.avatar}</span>
                                <div class="combatant-info">
                                    <div class="combatant-name">${o.name}</div>
                                    <div class="combatant-realm">${o.realmName} | ${o.technique}</div>
                                </div>
                            </div>
                            <div class="combatant-hp-bar">
                                <div class="combatant-hp-fill ${oHpClass}" style="width:${oHpPercent}%">
                                    ${o.hp}/${o.maxHP}
                                </div>
                            </div>
                            <div class="combatant-stats">
                                <span class="combatant-stat"><span class="icon">⚔️</span>${o.attack}</span>
                                <span class="combatant-stat"><span class="icon">🛡️</span>${o.defense}</span>
                                <span class="combatant-stat"><span class="icon">💨</span>${o.speed}</span>
                                <span class="combatant-stat"><span class="icon">💥</span>${Math.round(o.critRate * 100)}%</span>
                            </div>
                            <div class="combatant-effects">
                                ${o.weapon ? `<span class="combat-effect">${o.weapon}</span>` : ''}
                                ${o.armor ? `<span class="combat-effect">${o.armor}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="combat-log" style="height:120px;overflow-y:auto;padding:8px;background:#111;border-radius:4px;font-size:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="color:#ffd700;font-size:11px;">⚔️ 战斗日志</span>
                            <button onclick="showCombatLogHistory()" style="padding:2px 8px;background:#333;color:#888;border:1px solid #444;border-radius:3px;cursor:pointer;font-size:10px;">历史</button>
                        </div>
                        ${combatState.log.slice(-8).map(entry => `
                            <div class="combat-log-entry ${entry.type} ${entry.actionType || ''}">${entry.text}</div>
                        `).join('')}
                    </div>
                </div>
            `;

            if (combatState.turn === 'player' && combatState.inProgress) {
                html += renderPlayerActions();
            } else if (!combatState.inProgress) {
                html += renderCombatResult();
            } else {
                html += '<div style="text-align:center;padding:20px;color:#aaa;">对方行动中...</div>';
            }

            document.getElementById('combatContent').innerHTML = html;
        }

        // ===== renderPlayerActions =====
        function renderPlayerActions() {
            const info = getEnergyBar();
            const canUltimate = info.ready;
            return `
                <div class="combat-actions">
                    <button class="combat-action-btn attack" onclick="selectCombatAction('attack')">
                        ⚔️ 攻击
                    </button>
                    <button class="combat-action-btn defend" onclick="selectCombatAction('defend')">
                        🛡️ 防御
                    </button>
                    <button class="combat-action-btn ultimate" onclick="showUltimateSkillPanel()" ${canUltimate ? '' : 'disabled'}>
                        ⚡ 必杀技 ${canUltimate ? '' : `(${info.current}/${info.cost})`}
                    </button>
                    <button class="combat-action-btn" onclick="selectCombatAction('treasure')">
                        🔮 法宝
                    </button>
                    <button class="combat-action-btn" onclick="selectCombatAction('pill')">
                        💊 丹药
                    </button>
                    <button class="combat-action-btn escape" onclick="selectCombatAction('escape')">
                        🏃 逃跑
                    </button>
                    <button class="combat-action-btn" onclick="selectCombatAction('technique')">
                        📖 功法
                    </button>
                </div>
            `;
        }

        // ===== selectCombatAction =====
        function selectCombatAction(action) {
            if (action === 'attack') {
                executePlayerAttack();
            } else if (action === 'defend') {
                executePlayerDefend();
            } else if (action === 'escape') {
                executePlayerEscape();
            } else if (action === 'treasure') {
                showTreasureMenu();
            } else if (action === 'pill') {
                showPillMenu();
            } else if (action === 'technique') {
                showTechniqueInfo();
            }
        }

        // ===== showTreasureMenu =====
        function showTreasureMenu() {
            const availableTreasures = [];
            for (const item of gameState.inventory) {
                if (COMBAT_TREASURES[item.name]) {
                    availableTreasures.push(item);
                }
            }

            let html = '<div class="combat-submenu">';
            if (availableTreasures.length === 0) {
                html += '<p style="grid-column:span 2;text-align:center;color:#888;padding:20px;">背包中没有可用法宝</p>';
            } else {
                availableTreasures.forEach(item => {
                    const treasure = COMBAT_TREASURES[item.name];
                    html += `
                        <button class="combat-submenu-btn" onclick="useCombatTreasure('${item.name}')">
                            ${treasure.icon} ${item.name}
                            <div style="font-size:0.8em;color:#aaa">${treasure.desc}</div>
                        </button>
                    `;
                });
            }
            html += '<button class="combat-submenu-btn" onclick="renderCombatArena()" style="grid-column:span 2;">返回</button></div>';
            document.getElementById('combatContent').innerHTML = document.getElementById('combatContent').innerHTML.replace(renderPlayerActions(), html);
        }

        // ===== useCombatTreasure =====
        function useCombatTreasure(name) {
            const treasure = COMBAT_TREASURES[name];
            if (!treasure) return;

            const idx = gameState.inventory.findIndex(i => i.name === name);
            if (idx !== -1) {
                gameState.inventory[idx].quantity--;
                if (gameState.inventory[idx].quantity <= 0) {
                    gameState.inventory.splice(idx, 1);
                }
            }

            const effect = treasure.effect;
            let effectText = '';
            if (effect.attackBonus) {
                combatState.effects.player.attackBoost += effect.attackBonus;
                effectText = `${name}发动！攻击+${Math.round(effect.attackBonus * 100)}%`;
            } else if (effect.defenseBonus) {
                combatState.effects.player.defenseBoost += effect.defenseBonus;
                effectText = `${name}发动！防御+${Math.round(effect.defenseBonus * 100)}%`;
            } else if (effect.critBonus) {
                combatState.player.critRate += effect.critBonus;
                effectText = `${name}发动！暴击率+${Math.round(effect.critBonus * 100)}%`;
            } else if (effect.hpBonus) {
                const heal = Math.floor(combatState.player.maxHP * effect.hpBonus);
                combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + heal);
                effectText = `${name}发动！生命+${heal}`;
            }

            combatState.log.push({ type: 'player-action', text: `你使用了${name}！${effectText}`, round: combatState.round });
            combatState.turn = 'opponent';
            renderCombatArena();

            setTimeout(() => executeOpponentTurn(), 1000);
        }

        // ===== showPillMenu =====
        function showPillMenu() {
            let html = '<div class="combat-submenu">';
            let hasPills = false;

            for (const [name, pill] of Object.entries(COMBAT_PILLS)) {
                if (getItemCount(name) > 0) {
                    hasPills = true;
                    html += `
                        <button class="combat-submenu-btn" onclick="useCombatPill('${name}')">
                            ${pill.icon} ${name}
                            <div style="font-size:0.8em;color:#aaa">${pill.desc}</div>
                        </button>
                    `;
                }
            }

            if (!hasPills) {
                html += '<p style="grid-column:span 2;text-align:center;color:#888;padding:20px;">背包中没有战斗丹药</p>';
            }
            html += '<button class="combat-submenu-btn" onclick="renderCombatArena()" style="grid-column:span 2;">返回</button></div>';
            document.getElementById('combatContent').innerHTML = document.getElementById('combatContent').innerHTML.replace(renderPlayerActions(), html);
        }

        // ===== useCombatPill =====
        function useCombatPill(name) {
            const pill = COMBAT_PILLS[name];
            if (!pill) return;

            const idx = gameState.inventory.findIndex(i => i.name === name);
            if (idx !== -1) {
                gameState.inventory[idx].quantity--;
                if (gameState.inventory[idx].quantity <= 0) {
                    gameState.inventory.splice(idx, 1);
                }
            }

            const effect = pill.effect;
            let effectText = '';

            if (effect.type === 'attackBoost') {
                combatState.effects.player.attackBoost += effect.value;
                effectText = `攻击+${Math.round(effect.value * 100)}%`;
            } else if (effect.type === 'defenseBoost') {
                combatState.effects.player.defenseBoost += effect.value;
                effectText = `防御+${Math.round(effect.value * 100)}%`;
            } else if (effect.type === 'ignoreDefense') {
                combatState.effects.player.ignoreDefense = true;
                effectText = '无视对方防御';
            } else if (effect.type === 'heal') {
                const heal = Math.floor(combatState.player.maxHP * effect.value);
                combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + heal);
                effectText = `恢复${heal}生命`;
            }

            combatState.log.push({ type: 'player-action', text: `你服用了${name}！${effectText}`, round: combatState.round });
            combatState.turn = 'opponent';
            renderCombatArena();

            setTimeout(() => executeOpponentTurn(), 1000);
        }

        // ===== showTechniqueInfo =====
        function showTechniqueInfo() {
            const p = combatState.player;
            const o = combatState.opponent;
            const myTechnique = p.technique;
            const oppTechnique = o.technique;

            let克制关系 = '';
            if (TECHNIQUE_BONUS[myTechnique].beats === oppTechnique) {
                克制关系 = `你的${myTechnique}克制对方的${oppTechnique}，伤害+50%`;
            } else if (TECHNIQUE_BONUS[myTechnique].losesTo === oppTechnique) {
                克制关系 = `对方的${oppTechnique}克制你的${myTechnique}，伤害-30%`;
            } else {
                克制关系 = '功法无克制关系';
            }

            const html = `
                <div class="combat-submenu">
                    <div style="grid-column:span 2;text-align:center;padding:20px;background:rgba(0,0,0,0.3);border-radius:10px;">
                        <p style="color:${p.techniqueColor};font-size:1.2em;margin-bottom:10px;">你的功法：${myTechnique}</p>
                        <p style="color:${o.techniqueColor};font-size:1.2em;margin-bottom:10px;">对方功法：${oppTechnique}</p>
                        <p style="color:#ffd700;margin-top:15px;">${克制关系}</p>
                    </div>
                    <button class="combat-submenu-btn" onclick="renderCombatArena()" style="grid-column:span 2;">返回</button>
                </div>
            `;
            document.getElementById('combatContent').innerHTML = document.getElementById('combatContent').innerHTML.replace(renderPlayerActions(), html);
        }

        // ===== executePlayerAttack =====
        function executePlayerAttack() {
            const p = combatState.player;
            const o = combatState.opponent;
            const effects = combatState.effects.player;

            // 清除防御状态
            effects.defending = false;
            combatState.player.inDefenseStance = false;

            // 计算伤害
            let baseDamage = p.attack;
            baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));

            // 功法相克
            let techniqueMultiplier = 1;
            if (TECHNIQUE_BONUS[p.technique].beats === o.technique) {
                techniqueMultiplier = 1.5;
                combatState.log.push({ type: 'system', text: `功法克制！伤害+50%`, round: combatState.round });
            } else if (TECHNIQUE_BONUS[p.technique].losesTo === o.technique) {
                techniqueMultiplier = 0.7;
                combatState.log.push({ type: 'system', text: `被功法克制！伤害-30%`, round: combatState.round });
            }
            baseDamage = Math.floor(baseDamage * techniqueMultiplier);

            // A4 套装攻击加成
            if (p.attackPercent) {
                baseDamage = Math.floor(baseDamage * p.attackPercent);
            }

            // 防御减伤
            let finalDamage = baseDamage;
            if (!effects.ignoreDefense) {
                const defReduction = effects.defending ? o.defense * 1.5 : o.defense;
                finalDamage = Math.max(1, baseDamage - defReduction);
            }

            // 暴击判定
            const critRateWithSet = p.critRate + (p.critBonus || 0);
            const isCrit = Math.random() < critRateWithSet;
            if (isCrit) {
                finalDamage = Math.floor(finalDamage * 1.5);
                combatState.log.push({ type: 'player-action', actionType: 'critical', text: `💥暴击！`, round: combatState.round });
            }

            o.hp = Math.max(0, o.hp - finalDamage);

            // A4 套装技能触发
            if (p.skills && p.skills.includes('freezeAura') && Math.random() < 0.25) {
                combatState.effects.opponent.frozen = 2;
                combatState.log.push({ type: 'system', text: `❄️ 玄冰领域生效！敌人被冻结2回合！`, round: combatState.round });
            }
            if (p.skills && p.skills.includes('burnAura') && Math.random() < 0.30) {
                combatState.effects.opponent.burning = 3;
                combatState.log.push({ type: 'system', text: `🔥 烈焰领域生效！敌人被灼烧3回合！`, round: combatState.round });
            }
            if (p.skills && p.skills.includes('angelJudgment') && Math.random() < 0.20) {
                const healAmount = Math.floor(p.maxHP * 0.15);
                p.hp = Math.min(p.maxHP, p.hp + healAmount);
                combatState.log.push({ type: 'system', text: `👼 天使审判生效！恢复${healAmount}点生命！`, round: combatState.round });
            }

            const techniqueColor = TECHNIQUE_COLORS[p.technique];
            combatState.log.push({
                type: 'player-action',
                actionType: 'damage',
                text: `你施展<span style="color:${techniqueColor}">${p.technique}</span>，造成 <span style="color:#ff6666">${finalDamage}</span> 点伤害${isCrit ? '（暴击）' : ''}`,
                round: combatState.round
            });

            addEnergy(20); // 攻击积蓄能量
            combatState.turn = 'opponent';
            renderCombatArena();

            if (o.hp <= 0) {
                setTimeout(() => endCombat('win'), 500);
            } else {
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }

        // ===== executePlayerDefend =====
        function executePlayerDefend() {
            combatState.effects.player.defending = true;
            combatState.player.inDefenseStance = true;
            if (typeof combatState.player.counterEnergy === 'undefined') combatState.player.counterEnergy = 0;
            combatState.player.counterEnergy = Math.min(100, combatState.player.counterEnergy + 35);
            combatState.log.push({
                type: 'player-action',
                text: `🛡️ 防御姿态！反击能量+35（${combatState.player.counterEnergy}/100）`,
                round: combatState.round
            });

            combatState.turn = 'opponent';
            renderCombatArena();
            setTimeout(() => executeOpponentTurn(), 1000);
        }

        // ===== executePlayerEscape =====
        function executePlayerEscape() {
            const escapeChance = 0.4 + gameState.activeEffects.escape;
            const success = Math.random() < escapeChance;

            if (success) {
                const cost = Math.floor(gameState.spiritStones * 0.5);
                gameState.spiritStones -= cost;
                combatState.log.push({
                    type: 'system',
                    text: `逃跑成功！损失${cost}灵石`,
                    round: combatState.round
                });
                combatState.turn = 'opponent';
                renderCombatArena();
                setTimeout(() => endCombat('escape'), 500);
            } else {
                combatState.log.push({
                    type: 'system',
                    text: '逃跑失败！被对方追击',
                    round: combatState.round
                });
                const extraCost = Math.floor(gameState.spiritStones * 0.2);
                gameState.spiritStones -= extraCost;
                combatState.log.push({
                    type: 'system',
                    text: `被追击！额外损失${extraCost}灵石`,
                    round: combatState.round
                });
                combatState.turn = 'opponent';
                renderCombatArena();
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }

        // ===== executeOpponentTurn =====

        // ===== V33 战斗AI学习系统 =====

        // AI工具注册表（类似ruflo hooks模式）
        const COMBAT_AI_TOOLS = {
            // 攻击工具
            heavyAttack: {
                name: '重击',
                weight: 1.0,
                trigger: 'player_defending',
                description: '对防御中的玩家造成更多伤害'
            },
            quickAttack: {
                name: '快攻',
                weight: 1.0,
                trigger: 'player_low_hp',
                description: '玩家血量低时快速结束战斗'
            },
            spellAttack: {
                name: '技法攻击',
                weight: 1.0,
                trigger: 'player_spell_cooldown',
                description: '趁玩家技能冷却时攻击'
            },
            ultimateSkill: {
                name: '大招',
                weight: 0.5,
                trigger: 'energy_full',
                description: '能量充足时释放大招'
            },
            // 防守工具
            heal: {
                name: '使用丹药',
                weight: 1.0,
                trigger: 'hp_below_50',
                description: '血量低于50%时使用丹药'
            },
            defend: {
                name: '防御',
                weight: 1.0,
                trigger: 'player_high_aggression',
                description: '玩家进攻强烈时防御'
            },
            counter: {
                name: '反击',
                weight: 1.0,
                trigger: 'player_attack_pattern',
                description: '识破玩家攻击规律后反击'
            },
            // 破防工具
            techniqueBreak: {
                name: '破功',
                weight: 1.0,
                trigger: 'player_technique_active',
                description: '破除玩家功法加成'
            },
            armorBreak: {
                name: '破甲',
                weight: 1.2,
                trigger: 'player_defense_high',
                description: '针对高防御玩家'
            }
        };

        // ===== recordPlayerAction =====
        function recordPlayerAction(actionType, detail = {}) {
            if (!gameState.combatProfile) return;
            
            const profile = gameState.combatProfile;
            profile.totalBattles++;
            profile.lastCombatDay = gameState.days;
            
            // 记录行动模式
            const existing = profile.playerPatterns.find(p => p.action === actionType);
            if (existing) {
                existing.count++;
                existing.lastUsed = gameState.days;
            } else {
                profile.playerPatterns.push({
                    action: actionType,
                    count: 1,
                    lastUsed: gameState.days,
                    detail: detail
                });
            }
            
            // 记录特殊模式
            if (actionType === 'defend') {
                profile.defenseFrequency = (profile.defenseFrequency * (profile.totalBattles - 1) + 1) / profile.totalBattles;
            }
            if (actionType === 'ultimate') {
                profile.attackTiming.push('ultimate');
            }
            if (actionType === 'attack' && detail.weaponType) {
                profile.preferredDistance = detail.weaponType;
            }
        }

        // ===== analyzePlayerProfile =====
        function analyzePlayerProfile() {
            const profile = gameState.combatProfile;
            if (!profile || profile.totalBattles < 3) return null;
            
            // 计算各模式占比
            const total = profile.playerPatterns.reduce((sum, p) => sum + p.count, 0);
            const patterns = profile.playerPatterns.map(p => ({
                ...p,
                ratio: p.count / total
            }));
            
            // 判断玩家风格
            const defenseRatio = profile.defenseFrequency;
            const ultimateCount = profile.attackTiming.filter(t => t === 'ultimate').length;
            
            let style = 'balanced';
            if (defenseRatio > 0.6) style = 'defensive';
            else if (defenseRatio < 0.2 && ultimateCount > profile.totalBattles * 0.4) style = 'aggressive';
            
            // 检测弱点
            const weaknesses = [];
            const attackPatterns = patterns.filter(p => p.action === 'attack');
            if (attackPatterns.length > 0) {
                // 玩家经常使用某种攻击
                const commonAttack = attackPatterns.reduce((a, b) => a.count > b.count ? a : b);
                if (commonAttack.ratio > 0.4) {
                    weaknesses.push('attack_predictable'); // 攻击可预测
                }
            }
            
            return {
                style: style,
                patterns: patterns,
                weaknesses: weaknesses,
                defenseRatio: defenseRatio,
                spellUsageRate: profile.spellUsageRate
            };
        }

        // ===== getAdjustedToolWeights =====
        function getAdjustedToolWeights() {
            const profile = gameState.combatProfile;
            const analysis = analyzePlayerProfile();
            
            // 复制基础权重
            const weights = {};
            for (const tool in COMBAT_AI_TOOLS) {
                weights[tool] = COMBAT_AI_TOOLS[tool].weight;
            }
            
            if (!analysis) return weights;
            
            // 根据玩家风格调整权重
            if (analysis.defenseRatio > 0.5) {
                // 玩家爱防御 → 提高破防工具权重
                weights.heavyAttack *= 1.4;
                weights.armorBreak *= 1.3;
                weights.techniqueBreak *= 1.2;
            }
            
            if (analysis.weaknesses.includes('attack_predictable')) {
                // 玩家攻击可预测 → 提高反击权重
                weights.counter *= 1.5;
                weights.defend *= 0.7; // 少防御，多等反击机会
            }
            
            // 检查玩家使用大招的时机
            const ultimateCount = profile.attackTiming.filter(t => t === 'ultimate').length;
            if (ultimateCount > profile.totalBattles * 0.3) {
                // 玩家爱用大招 → 提高打断能力
                weights.techniqueBreak *= 1.3;
            }
            
            return weights;
        }

        // ===== selectBestAI tool =====
        function selectBestAITool(opponentHp, playerHp, playerDefending, playerEffects) {
            const weights = getAdjustedToolWeights();
            const tools = Object.keys(weights);
            
            // 计算每个工具的适用度
            const scores = tools.map(tool => {
                let score = weights[tool];
                const toolDef = COMBAT_AI_TOOLS[tool];
                
                // 根据触发条件调整
                if (toolDef.trigger === 'player_defending' && playerDefending) {
                    score *= 2;
                }
                if (toolDef.trigger === 'hp_below_50' && opponentHp < opponent.maxHP * 0.5) {
                    score *= 1.8;
                }
                if (toolDef.trigger === 'player_high_aggression' && playerEffects.attacking) {
                    score *= 1.5;
                }
                if (toolDef.trigger === 'energy_full' && combatEnergy >= 80) {
                    score *= 1.3;
                }
                
                return { tool, score, name: toolDef.name };
            });
            
            // 按分数排序
            scores.sort((a, b) => b.score - a.score);
            
            return scores[0];
        }

        // ===== executeOpponentTurn with AI Learning =====
        const originalExecuteOpponentTurn = executeOpponentTurn;
        function executeOpponentTurn() {
            if (!combatState.inProgress || combatState.opponent.hp <= 0) return;
            
            combatState.round++;
            const p = combatState.player;
            const o = combatState.opponent;
            const effects = combatState.effects.opponent;
            
            // 显示AI思考状态
            showAIThinking();
            
            // 清除防御状态
            effects.defending = false;
            
            // V33: AI工具选择（基于玩家画像）
            const aiDecision = selectBestAITool(o.hp, p.hp, p.defending, p.effects || {});
            
            // 记录玩家行动（事后学习）
            if (combatState.turn === 'player') {
                // 玩家刚行动过，记录该行动
                const lastAction = combatState.log[combatState.log.length - 1];
                if (lastAction && lastAction.type === 'player-action') {
                    if (lastAction.actionType === 'attack') {
                        recordPlayerAction('attack', { damage: lastAction.damage });
                    } else if (lastAction.actionType === 'defend') {
                        recordPlayerAction('defend');
                    } else if (lastAction.actionType === 'ultimate') {
                        recordPlayerAction('ultimate');
                    }
                }
            }
            
            // 根据AI决策选择行动
            let action = 'attack';
            let actionDetail = '';
            
            if (aiDecision && aiDecision.tool === 'heal') {
                action = 'heal';
                actionDetail = '使用丹药';
            } else if (aiDecision && aiDecision.tool === 'defend') {
                action = 'defend';
                actionDetail = '防御';
            } else if (aiDecision && aiDecision.tool === 'counter') {
                action = 'counter';
                actionDetail = '反击';
            }
            
            // 如果hp低且有回春丹，优先治疗
            if (o.hp < o.maxHP * 0.4 && getItemCount('回春丹') > 0 && Math.random() < 0.6) {
                action = 'heal';
                actionDetail = '紧急治疗';
            }
            
            if (action === 'heal') {
                // 使用回春丹
                const idx = gameState.inventory.findIndex(i => i.name === '回春丹');
                if (idx !== -1) {
                    gameState.inventory[idx].quantity--;
                    if (gameState.inventory[idx].quantity <= 0) {
                        gameState.inventory.splice(idx, 1);
                    }
                }
                const heal = Math.floor(o.maxHP * 0.3);
                o.hp = Math.min(o.maxHP, o.hp + heal);
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'heal',
                    text: `${o.name}使用了回春丹，恢复${heal}生命 (AI分析:${aiDecision?.name || '攻击'})`,
                    round: combatState.round
                });
            } else if (action === 'defend') {
                effects.defending = true;
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'defend',
                    text: `${o.name}进入防御姿态 (AI识破玩家进攻模式)`,
                    round: combatState.round
                });
            } else if (action === 'counter') {
                // 反击 - 先记录，等玩家攻击后触发
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'counter_setup',
                    text: `${o.name}识破玩家攻击规律，准备反击`,
                    round: combatState.round
                });
                // 直接攻击，但标记为反击
                let baseDamage = o.attack;
                baseDamage = Math.floor(baseDamage * 1.3); // 反击加成
                baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));
                
                let techniqueMultiplier = 1;
                if (TECHNIQUE_BONUS[o.technique].beats === p.technique) {
                    techniqueMultiplier = 1.5;
                } else if (TECHNIQUE_BONUS[o.technique].losesTo === p.technique) {
                    techniqueMultiplier = 0.7;
                }
                baseDamage = Math.floor(baseDamage * techniqueMultiplier);
                
                let finalDamage = baseDamage;
                if (combatState.effects.player.defending) {
                    finalDamage = Math.floor(baseDamage * 0.5);
                }
                finalDamage = Math.max(1, finalDamage - Math.floor(p.defense * 0.5));
                
                p.hp = Math.max(0, p.hp - finalDamage);
                combatState.effects.player.defending = false;
                
                const techniqueColor = TECHNIQUE_COLORS[o.technique];
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'damage',
                    text: `${o.name}施展<span style="color:${techniqueColor}">${o.technique}</span>，造成 <span style="color:#ff6666">${finalDamage}</span> 点伤害（反击）`,
                    round: combatState.round
                });
            } else {
                // 普通攻击
                let baseDamage = o.attack;
                baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));
                
                let techniqueMultiplier = 1;
                if (TECHNIQUE_BONUS[o.technique].beats === p.technique) {
                    techniqueMultiplier = 1.5;
                } else if (TECHNIQUE_BONUS[o.technique].losesTo === p.technique) {
                    techniqueMultiplier = 0.7;
                }
                baseDamage = Math.floor(baseDamage * techniqueMultiplier);
                
                let finalDamage = baseDamage;
                if (combatState.effects.player.defending) {
                    finalDamage = Math.floor(baseDamage * 0.5);
                }
                finalDamage = Math.max(1, finalDamage - Math.floor(p.defense * (1 + combatState.effects.player.defenseBoost)));
                
                const isCrit = Math.random() < o.critRate;
                if (isCrit) {
                    finalDamage = Math.floor(finalDamage * 1.5);
                }
                
                p.hp = Math.max(0, p.hp - finalDamage);
                combatState.effects.player.defending = false;
                
                const techniqueColor = TECHNIQUE_COLORS[o.technique];
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'damage',
                    text: `${o.name}施展<span style="color:${techniqueColor}">${o.technique}</span>，造成 <span style="color:#ff6666">${finalDamage}</span> 点伤害${isCrit ? '（暴击）' : ''}`,
                    round: combatState.round
                });
            }
            
            // 检查玩家是否死亡
            if (p.hp <= 0) {
                setTimeout(() => endCombat('lose'), 500);
            } else {
                combatState.turn = 'player';
                renderCombatArena();
            }
        }

        // ===== showAIThinking =====
        function showAIThinking() {
            const analysis = analyzePlayerProfile();
            if (!analysis) return;
            
            // 在对手血条附近显示AI状态
            const aiStatusEl = document.getElementById('aiThinkingStatus');
            if (aiStatusEl) {
                let statusText = '';
                if (analysis.style === 'defensive') {
                    statusText = '📊 分析中: 玩家偏防守，启用破防策略...';
                } else if (analysis.style === 'aggressive') {
                    statusText = '📊 分析中: 玩家进攻猛烈，等待反击时机...';
                } else {
                    statusText = '📊 分析中: 玩家风格均衡，保持平衡策略...';
                }
                aiStatusEl.textContent = statusText;
                aiStatusEl.style.display = 'block';
                
                // 3秒后隐藏
                setTimeout(() => {
                    if (aiStatusEl) aiStatusEl.style.display = 'none';
                }, 3000);
            }
        }

        // ===== learnFromCombat =====
        function learnFromCombat(result) {
            const profile = gameState.combatProfile;
            if (!profile) return;
            
            if (result === 'win') {
                profile.winsAgainst++;
            }
            
            // 战后分析
            const analysis = analyzePlayerProfile();
            if (analysis) {
                // 显示学习报告
                setTimeout(() => {
                    showLearningReport(analysis);
                }, 1000);
            }
        }

        // ===== showLearningReport =====
        function showLearningReport(analysis) {
            const report = `
                <div style="padding:20px;text-align:center">
                    <div style="font-size:24px;color:#2196f3;margin-bottom:15px">🧠 AI对战报告</div>
                    <div style="background:rgba(33,150,243,0.1);padding:15px;border-radius:8px;text-align:left;margin-bottom:15px">
                        <div style="color:#ffd700">📈 观察到的玩家风格:</div>
                        <div style="color:#fff;margin-top:8px">战斗风格: <span style="color:${
                            analysis.style === 'defensive' ? '#4caf50' : 
                            analysis.style === 'aggressive' ? '#f44336' : '#2196f3'
                        }">${analysis.style === 'defensive' ? '防守型' : analysis.style === 'aggressive' ? '进攻型' : '平衡型'}</span></div>
                        <div style="color:#fff">防御频率: ${(analysis.defenseRatio * 100).toFixed(0)}%</div>
                        <div style="color:#fff">弱点检测: ${analysis.weaknesses.length > 0 ? '攻击可预测' : '无明显弱点'}</div>
                    </div>
                    <div style="color:#aaa;font-size:12px">AI已根据您的风格调整策略</div>
                    <button onclick="closeModal('modalNormal')" style="margin-top:15px;padding:8px 20px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer">确定</button>
                </div>
            `;
            
            const modal = document.getElementById('modalNormal');
            if (modal) {
                modal.innerHTML = report;
                modal.classList.remove('hidden');
            }
        }

        // ===== endCombat =====
        function endCombat(result) {
            combatState.inProgress = false;
            const p = combatState.player;
            const o = combatState.opponent;

            let reward = 0;
            let penalty = 0;
            let honorChange = 0;
            let fameChange = 0;
            let realmDropChance = 0;

            if (result === 'win') {
                reward = Math.floor(o.maxHP * 0.5);
                gameState.spiritStones += reward;
                honorChange = 10;
                fameChange = 5;
                gameState.combat = gameState.combat || { wins: 0, losses: 0, honor: 0, fame: 0, battleHistory: [] };
                gameState.combat.wins++;
                gameState.combat.honor += honorChange;
                gameState.combat.fame += fameChange;
                combatState.log.push({
                    type: 'system',
                    text: `🎉 胜利！获得${reward}灵石，荣誉+${honorChange}，声望+${fameChange}`,
                    round: combatState.round
                });
            } else if (result === 'lose') {
                penalty = Math.floor(gameState.spiritStones * 0.3);
                gameState.spiritStones -= penalty;
                honorChange = -5;
                fameChange = -3;
                realmDropChance = 0.1;
                gameState.combat = gameState.combat || { wins: 0, losses: 0, honor: 0, fame: 0, battleHistory: [] };
                gameState.combat.losses++;
                gameState.combat.honor = Math.max(0, gameState.combat.honor + honorChange);
                gameState.combat.fame = Math.max(0, gameState.combat.fame + fameChange);

                // 境界跌落
                if (Math.random() < realmDropChance) {
                    const oldRealm = gameState.realm;
                    gameState.realm = Math.max(0, gameState.realm - 1);
                    combatState.log.push({
                        type: 'system',
                        text: `💔 境界跌落！从${CONFIG.realms[oldRealm]}期跌落到${CONFIG.realms[gameState.realm]}期`,
                        round: combatState.round
                    });
                }

                // 重伤debuff：3场内属性-20%
                gameState.combat.injured = true;
                gameState.combat.injuryEndDay = gameState.days + 3;
                combatState.log.push({
                    type: 'system',
                    text: `💔 重伤！未来3场战斗属性降低20%`,
                    round: combatState.round
                });

                combatState.log.push({
                    type: 'system',
                    text: `😢 战败！损失${penalty}灵石，荣誉${honorChange}，声望${fameChange}`,
                    round: combatState.round
                });
            }

            // 记录战斗历史
            gameState.combat.battleHistory = gameState.combat.battleHistory || [];
            gameState.combat.battleHistory.unshift({
                opponent: o.name,
                result: result,
                reward: reward,
                penalty: penalty,
                day: gameState.days
            });
            if (gameState.combat.battleHistory.length > 50) {
                gameState.combat.battleHistory.pop();
            }

            // V33: 触发AI学习
            learnFromCombat(result);

            saveGame();
            renderCombatArena();
        }

        // ===== renderCombatResult =====
        function renderCombatResult() {
            const result = combatState.opponent.hp <= 0 ? 'win' : (combatState.player.hp <= 0 ? 'lose' : 'escape');
            const o = combatState.opponent;
            let reward = 0;
            let penalty = 0;

            if (result === 'win') {
                reward = Math.floor(o.maxHP * 0.5);
            } else if (result === 'lose') {
                penalty = Math.floor(gameState.spiritStones / 0.7 * 0.3) || Math.floor(gameState.spiritStones * 0.3);
            }

            const resultTitle = result === 'win' ? '🎉 胜利！' : result === 'lose' ? '💔 战败' : '🏃 逃跑';
            const resultClass = result === 'win' ? 'win' : result === 'lose' ? 'lose' : 'escape';

            return `
                <div class="combat-result ${resultClass}">
                    <h2>${resultTitle}</h2>
                    <div class="combat-result-stats">
                        <div class="combat-result-stat">
                            <div class="value">${combatState.round}</div>
                            <div class="label">回合数</div>
                        </div>
                        <div class="combat-result-stat">
                            <div class="value" style="color:${result === 'win' ? '#4caf50' : '#ff6666'}">${result === 'win' ? '+' + reward : '-' + penalty}</div>
                            <div class="label">灵石</div>
                        </div>
                    </div>
                    <button class="btn btn-combat" onclick="renderCombatHome()" style="margin-top:20px;">返回斗法界面</button>
                    <button class="close-btn" onclick="closeCombat()">关闭</button>
                </div>
            `;
        }


// Auto-generated module: config.js

        // --- CONFIG (3-11) ---
        const CONFIG = {
            realms: ['炼气', '筑基', '金丹', '元婴', '化神'],
            stages: ['初期', '中期', '后期'],
            stageNames: ['凡人', '修士', '真人', '天君', '大能'],
            apiUrl: 'https://api.minimaxi.com/v1/chat/completions',
            storageKey: 'cultivationSave',
            apiConfigKey: 'cultivationApiConfig',
            miniMaxConfigKey: 'cultivationMiniMaxConfig'
        };

        // --- PILLS (15-23) ---
        const PILLS = {
            '聚灵丹': { quality: 'common', effect: { type: 'qi', value: 50 }, price: 30, desc: '恢复50灵气', icon: '💊' },
            '心魔丹': { quality: 'common', effect: { type: 'mindset', value: 30 }, price: 40, desc: '恢复30心境', icon: '💊' },
            '金髓丹': { quality: 'rare', effect: { type: 'qi', value: 200 }, price: 100, desc: '恢复200灵气', icon: '💊' },
            '筑基丹': { quality: 'rare', effect: { type: 'breakthrough_boost', value: 0.2 }, price: 1200, desc: '突破成功率+20%', icon: '💊' },
            '破境丹': { quality: 'precious', effect: { type: 'breakthrough_boost', value: 0.3 }, price: 5000, desc: '突破+30%', icon: '💊' },
            '洗髓丹': { quality: 'precious', effect: { type: 'cultivate_speed', value: 0.1 }, price: 8000, desc: '修炼速度+10%', icon: '💊' },
            '定神丹': { quality: 'precious', effect: { type: '渡劫_mindset_protect', value: 0.5 }, price: 12000, desc: '渡劫心境消耗-50%', icon: '💊' }
        };

        // --- TREASURES (27-35) ---
        const TREASURES = {
            '青锋剑': { type: 'weapon', quality: 'common', effect: { type: 'attack', value: 0.1 }, price: 150, desc: '攻击+10%', icon: '⚔️' },
            '玄铁盾': { type: 'armor', quality: 'common', effect: { type: 'defense', value: 0.1 }, price: 150, desc: '防御+10%', icon: '🛡️' },
            '聚灵阵': { type: 'accessory', quality: 'rare', effect: { type: 'cultivate_qi_rate', value: 0.2 }, price: 800, desc: '修炼灵气+20%', icon: '📿' },
            '避火罩': { type: 'armor', quality: 'rare', effect: { type: '渡劫_damage_reduce', value: 0.3 }, price: 1500, desc: '渡劫伤害-30%', icon: '🔥' },
            '缩地符': { type: 'accessory', quality: 'rare', effect: { type: 'escape', value: 0.5 }, price: 600, desc: '逃跑成功率+50%', icon: '📜' },
            '天机镜': { type: 'accessory', quality: 'precious', effect: { type: 'foresee_event', value: 1 }, price: 8000, desc: '预知事件类型', icon: '🔮' },
            '混元珠': { type: 'accessory', quality: 'legendary', effect: { type: 'all_stats', value: 0.05 }, price: 40000, desc: '全属性+5%', icon: '珠' }
        };

        // --- COMBAT_TREASURES (39-49) ---
        const COMBAT_TREASURES = {
            '青云剑': { type: 'weapon', quality: 'common', effect: { attackBonus: 0.15 }, desc: '攻击+15%', icon: '⚔️', price: 300 },
            '玄铁盾': { type: 'armor', quality: 'common', effect: { defenseBonus: 0.2 }, desc: '防御+20%', icon: '🛡️', price: 250 },
            '混元珠': { type: 'weapon', quality: 'rare', effect: { critBonus: 0.1 }, desc: '暴击率+10%', icon: '🔮', price: 600 },
            '金缕衣': { type: 'armor', quality: 'rare', effect: { hpBonus: 0.1 }, desc: '生命+10%', icon: '👘', price: 400 },
            '避火罩': { type: 'armor', quality: 'rare', effect: { fireResist: 0.3 }, desc: '火法抗性+30%', icon: '🔥', price: 500 },
            '雷霆铛': { type: 'weapon', quality: 'precious', effect: { thunderBonus: 0.25 }, desc: '雷法伤害+25%', icon: '⚡', price: 5000 },
            '赤焰刀': { type: 'weapon', quality: 'precious', effect: { fireBonus: 0.25 }, desc: '火法伤害+25%', icon: '🔪', price: 5000 },
            '寒冰剑': { type: 'weapon', quality: 'precious', effect: { waterBonus: 0.25 }, desc: '水法伤害+25%', icon: '❄️', price: 5000 },
            '金刚杵': { type: 'weapon', quality: 'precious', effect: { bodyBonus: 0.25 }, desc: '体术伤害+25%', icon: '🔨', price: 5000 }
        };

        // --- COMBAT_PILLS (53-58) ---
        const COMBAT_PILLS = {
            '聚灵丹': { effect: { type: 'attackBoost', value: 0.2 }, desc: '攻击+20%', icon: '💊', price: 600 },
            '护体丹': { effect: { type: 'defenseBoost', value: 0.2 }, desc: '防御+20%', icon: '💊', price: 600 },
            '破妄丹': { effect: { type: 'ignoreDefense', value: 1 }, desc: '无视防御', icon: '💊', price: 4000 },
            '回春丹': { effect: { type: 'heal', value: 0.3 }, desc: '恢复30%生命', icon: '💊', price: 500 }
        };

        // --- ENHANCE_CONFIG (61-86) ---
        const ENHANCE_CONFIG = {
            // 1→2, 2→3, ... : [玄铁, 天材, 混沌石, 灵石]
            costs: {
                1: { iron: 3,  heavenly: 0, chaos: 0, stones: 200 },
                2: { iron: 5,  heavenly: 0, chaos: 0, stones: 400 },
                3: { iron: 8,  heavenly: 0, chaos: 0, stones: 800 },
                4: { iron: 10, heavenly: 1, chaos: 0, stones: 1500 },
                5: { iron: 12, heavenly: 2, chaos: 0, stones: 3000 },
                6: { iron: 15, heavenly: 3, chaos: 0, stones: 6000 },
                7: { iron: 0,  heavenly: 5, chaos: 1, stones: 15000 },
                8: { iron: 0,  heavenly: 8, chaos: 2, stones: 30000 },
                9: { iron: 0,  heavenly: 10, chaos: 3, stones: 60000 }
            },
            // 每级基础成功率（1→2用costs[1]）
            successRates: {
                1: 0.85, 2: 0.80, 3: 0.75, 4: 0.65, 5: 0.55,
                6: 0.45, 7: 0.35, 8: 0.30, 9: 0.25
            },
            // 每级强化后属性倍率
            starMultipliers: {
                1: 1.0, 2: 1.15, 3: 1.35, 4: 1.60, 5: 1.90,
                6: 2.25, 7: 2.70, 8: 3.20, 9: 4.00
            },
            // 炼器台等级限制可强化的最高星级
            anvilStarLimit: { 1: 3, 2: 6, 3: 9 }
        };

        // --- TRIBULATIONS (888-934) ---
        const TRIBULATIONS = {
            '金丹初期雷劫': {
                type: 'thunder',
                realm: 3,
                stage: '初期',
                baseRate: 0.6,
                stages: 3,
                damage: 30,
                desc: '九天神雷，淬体锻魂'
            },
            '金丹中期阴火': {
                type: 'fire',
                realm: 3,
                stage: '中期',
                baseRate: 0.5,
                stages: 5,
                damage: 40,
                desc: '琉璃阴火，焚心烧魄'
            },
            '金丹后期风劫': {
                type: 'wind',
                realm: 3,
                stage: '后期',
                baseRate: 0.4,
                stages: 7,
                damage: 50,
                desc: '九幽阴风，刮骨伐髓'
            },
            '元婴心魔': {
                type: 'demon',
                realm: 4,
                stage: '任意',
                baseRate: 0.4,
                stages: 9,
                damage: 0,
                desc: '心魔滋生，最难渡'
            },
            '化神飞升': {
                type: 'all',
                realm: 5,
                stage: '后期',
                baseRate: 0.2,
                stages: 9,
                damage: 60,
                desc: '飞升之劫，成败在此一举'
            }
        };

        // --- FURNACES (939-943) ---
        const FURNACES = {
            '土炼丹炉': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼丹炉' },
            '玄火丹炉': { level: 2, successBonus: 0.15, cost: 50000, unlockCondition: '宗门2级或50000灵石', desc: '中级炼丹炉，成功率+15%' },
            '天玄神炉': { level: 3, successBonus: 0.30, cost: 200000, unlockCondition: '化神期', desc: '高级炼丹炉，成功率+30%' }
        };

        // --- ANVILS (947-951) ---
        const ANVILS = {
            '土炼器台': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼器台' },
            '玄铁熔炉': { level: 2, successBonus: 0.15, cost: 80000, unlockCondition: '宗门2级或80000灵石', desc: '中级炼器台，成功率+15%' },
            '天工神炉': { level: 3, successBonus: 0.30, cost: 300000, unlockCondition: '化神期', desc: '高级炼器台，成功率+30%' }
        };

        // --- ALCHEMY_RECIPES (954-962) ---
        const ALCHEMY_RECIPES = {
            '回气丹': { materials: { '灵草': 3 }, successRate: 0.80, fuelCost: 100, desc: '恢复20%灵力', icon: '💊' },
            '疗伤丹': { materials: { '灵草': 2, '妖兽血': 1 }, successRate: 0.75, fuelCost: 100, desc: '恢复30%生命', icon: '💊' },
            '聚灵丹': { materials: { '灵石': 100, '灵草': 5 }, successRate: 0.60, fuelCost: 100, desc: '修炼速度+20%，持续3天', icon: '💊' },
            '破境丹': { materials: { '灵石': 500, '天材': 2 }, successRate: 0.40, fuelCost: 100, desc: '突破瓶颈概率+15%', icon: '💊' },
            '渡劫丹': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.30, fuelCost: 100, desc: '渡劫成功率+10%', icon: '💊' },
            '洗髓丹': { materials: { '天材': 3, '灵石': 500 }, successRate: 0.50, fuelCost: 100, desc: '灵根刷新', icon: '💊' },
            '混沌丹': { materials: { '混沌石': 1, '天材': 10 }, successRate: 0.20, fuelCost: 100, desc: '保底混沌灵根', icon: '💊', requireChaos: true }
        };

        // --- FORGE_RECIPES (965-972) ---
        const FORGE_RECIPES = {
            '凡铁剑': { materials: { '玄铁': 5 }, successRate: 0.90, fuelCost: 200, effect: { type: 'attack', value: 0.05 }, desc: '攻击+5%', icon: '⚔️' },
            '青云剑': { materials: { '玄铁': 10, '天材': 1 }, successRate: 0.60, fuelCost: 200, effect: { type: 'attack', value: 0.15 }, desc: '攻击+15%', icon: '⚔️' },
            '混元珠': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.40, fuelCost: 200, effect: { type: 'crit', value: 0.10 }, desc: '暴击+10%', icon: '🔮' },
            '金缕衣': { materials: { '天材': 3, '妖兽皮': 5 }, successRate: 0.50, fuelCost: 200, effect: { type: 'hp', value: 0.10 }, desc: '生命+10%', icon: '👘' },
            '避火罩': { materials: { '天材': 2, '妖兽骨': 5 }, successRate: 0.45, fuelCost: 200, effect: { type: 'fireResist', value: 0.30 }, desc: '火抗+30%', icon: '🔥' },
            '定神珠': { materials: { '天材': 5, '灵石': 2000 }, successRate: 0.35, fuelCost: 200, effect: { type: 'mindset', value: 0.20 }, desc: '精神状态+20%', icon: '📿' }
        };

        // --- MATERIALS (976-984) ---
        const MATERIALS = {
            '灵草': { type: 'herb', basePrice: 100, icon: '🌿', desc: '普通灵草，炼丹材料' },
            '妖兽血': { type: 'beast', basePrice: 200, icon: '🩸', desc: '妖兽血液，炼丹炼器材料' },
            '天材': { type: 'rare', basePrice: 500, icon: '✨', desc: '稀有天材，高级材料' },
            '混沌石': { type: 'legendary', basePrice: 1667, icon: '💎', desc: '混沌神石，传说材料', requireChaos: true },
            '玄铁': { type: 'metal', basePrice: 100, icon: '🔩', desc: '玄铁矿物，炼器材料' },
            '妖兽皮': { type: 'beast', basePrice: 180, icon: '🐾', desc: '妖兽皮毛，炼器材料' },
            '妖兽骨': { type: 'beast', basePrice: 220, icon: '🦴', desc: '妖兽骨骼，炼器材料' }
        };

        // --- ADVANCED_FORGE_RECIPES (988-1037) ---
        const ADVANCED_FORGE_RECIPES = {
            '灵宝·苍穹印': { 
                materials: { '玄铁': 20, '天材': 5, '混沌石': 1 }, 
                fuelCost: 2000, 
                desc: '灵宝·攻击+25%', icon: '🔮', 
                effect: { type: 'attack', value: 0.25 }
            },
            '灵宝·玄武甲': { 
                materials: { '玄铁': 20, '天材': 5, '混沌石': 1 }, 
                fuelCost: 2000, 
                desc: '灵宝·防御+25%', icon: '🛡️', 
                effect: { type: 'defense', value: 0.25 }
            },
            '圣器·天使神剑': { 
                materials: { '天材': 10, '混沌石': 3 }, 
                fuelCost: 8000, 
                desc: '圣器·攻击+40%', icon: '⚔️', 
                effect: { type: 'attack', value: 0.40 }
            },
            '圣器·天使神甲': { 
                materials: { '天材': 10, '混沌石': 3 }, 
                fuelCost: 8000, 
                desc: '圣器·防御+40%', icon: '👘', 
                effect: { type: 'defense', value: 0.40 }
            },
            '圣器·天使神翼': { 
                materials: { '天材': 10, '混沌石': 3 }, 
                fuelCost: 8000, 
                desc: '圣器·全属性+15%', icon: '👼', 
                effect: { type: 'all_stats', value: 0.15 }
            },
            '天神器·天使神剑': { 
                materials: { '天材': 20, '混沌石': 8 }, 
                fuelCost: 20000, 
                desc: '天神器·攻击+60%', icon: '⚔️', 
                effect: { type: 'attack', value: 0.60 }
            },
            '天神器·天使神甲': { 
                materials: { '天材': 20, '混沌石': 8 }, 
                fuelCost: 20000, 
                desc: '天神器·防御+60%', icon: '👘', 
                effect: { type: 'defense', value: 0.60 }
            },
            '天神器·天使神翼': { 
                materials: { '天材': 20, '混沌石': 8 }, 
                fuelCost: 20000, 
                desc: '天神器·全属性+25%', icon: '👼', 
                effect: { type: 'all_stats', value: 0.25 }
            }
        };

        // --- SERENDIPITY_EVENTS (1041-1265) ---
        const SERENDIPITY_EVENTS = {
            // 正面奇遇
            '古修士传承': {
                type: 'positive',
                icon: '📜',
                minRealm: 2, // 金丹及以上
                effect: (state) => {
                    const rewards = [
                        { type: 'spiritStones', value: Math.floor(1000 + Math.random() * 2000) },
                        { type: 'technique', value: 1 }
                    ];
                    const reward = rewards[Math.floor(Math.random() * rewards.length)];
                    if (reward.type === 'spiritStones') {
                        state.spiritStones += reward.value;
                        return { title: '古修士传承', text: `获得前辈遗留的 ${reward.value} 灵石！`, effects: [{ type: '灵石', value: reward.value, positive: true }] };
                    } else {
                        return { title: '古修士传承', text: '获得高阶功法传承！', effects: [{ type: '功法', value: 1, positive: true }] };
                    }
                }
            },
            '秘境入口': {
                type: 'positive',
                icon: '🌀',
                minRealm: 0,
                effect: (state) => {
                    state.currentEvent = { type: '秘境入口', inProgress: true };
                    return { title: '秘境入口', text: '发现一处神秘秘境入口，进入可能获得稀有奖励！', effects: [], showRealmBattle: true };
                }
            },
            '神兽认主': {
                type: 'positive',
                icon: '🦅',
                minRealm: 3, // 元婴及以上
                effect: (state) => {
                    const bonuses = [
                        { type: 'attack', value: 0.1 },
                        { type: 'defense', value: 0.1 },
                        { type: 'cultivate_speed', value: 0.05 }
                    ];
                    const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
                    state.activeEffects[bonus.type] += bonus.value;
                    return { title: '神兽认主', text: `神兽与你结缘，${bonus.type === 'attack' ? '攻击' : bonus.type === 'defense' ? '防御' : '修炼速度'}+${Math.round(bonus.value * 100)}%！`, effects: [{ type: bonus.type === 'attack' ? '攻击' : bonus.type === 'defense' ? '防御' : '修炼速度', value: Math.round(bonus.value * 100) + '%', positive: true }] };
                }
            },
            '仙人指路': {
                type: 'positive',
                icon: '🧙',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.serendipityBoostEndDay = state.days + 3;
                    state.activeEffects.serendipity_boost = 0.15;
                    return { title: '仙人指路', text: '仙人指点，突破成功率+30%，持续3天！', effects: [{ type: '突破成功率', value: '+30%', positive: true }] };
                }
            },
            '灵根觉醒': {
                type: 'positive',
                icon: '✨',
                minRealm: 0,
                effect: (state) => {
                    const gain = Math.floor(5 + Math.random() * 10);
                    state.activeEffects.cultivate_speed += gain / 1000;
                    return { title: '灵根觉醒', text: `灵根资质提升，修炼速度+${gain}%！`, effects: [{ type: '修炼速度', value: gain + '%', positive: true }] };
                }
            },
            '顿悟': {
                type: 'positive',
                icon: '💡',
                minRealm: 0,
                effect: (state) => {
                    state.spiritStones += 10000;
                    return { title: '顿悟', text: '修炼中顿悟，获得10000灵石！', effects: [{ type: '灵石', value: 10000, positive: true }] };
                }
            },
            // V7 体质相关奇遇
            '天赐体质·至尊骨': {
                type: 'positive',
                icon: '🦴',
                minRealm: 2, // 金丹及以上
                condition: (state) => !state.constitutions.find(c => c.type === '至尊骨'),
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '天赐体质·至尊骨', inProgress: true, choices: ['接受完整传承', '只取部分精华'] };
                    return { title: '天赐体质·至尊骨', text: '异象降世！骨如金铁，光耀万里……你可否愿接受完整传承？', effects: [], showChoice: true };
                }
            },
            '天赐体质·疾风灵体': {
                type: 'positive',
                icon: '💨',
                minRealm: 1, // 筑基及以上
                condition: (state) => !state.constitutions.find(c => c.type === '疾风灵体'),
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '天赐体质·疾风灵体', inProgress: true, choices: ['与风融为一体', '保持自我意识'] };
                    return { title: '天赐体质·疾风灵体', text: '风之精灵感应你的存在……与风融为一体可获完整灵体，但需冒风险。', effects: [], showChoice: true };
                }
            },
            '天赐体质·重瞳': {
                type: 'positive',
                icon: '👁️',
                minRealm: 3, // 元婴及以上
                condition: (state) => !state.constitutions.find(c => c.type === '重瞳'),
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '天赐体质·重瞳', inProgress: true, choices: ['承受重瞳试炼', '以凡眼视之'] };
                    return { title: '天赐体质·重瞳', text: '天道震怒！重瞳降临将开启你的天眼……试炼凶险，但成功后可看透万物本质。', effects: [], showChoice: true };
                }
            },
            // 负面奇遇
            '心魔入侵': {
                type: 'negative',
                icon: '👹',
                minRealm: 3, // 元婴及以上
                effect: (state) => {
                    const loss = Math.floor(state.spiritStones * 0.3);
                    state.spiritStones -= loss;
                    state.serendipity.luckStatus = 'unlucky';
                    state.serendipity.luckEndDay = state.days + 3;
                    return { title: '心魔入侵', text: `心魔入侵，损失 ${loss} 灵石，运气-，持续3天！`, effects: [{ type: '灵石', value: -loss, positive: false }] };
                }
            },
            '仇家追杀': {
                type: 'negative',
                icon: '⚔️',
                minRealm: 0,
                condition: (state) => state.combat.losses > 0,
                effect: (state) => {
                    const loss = Math.floor(state.spiritStones * 0.5);
                    state.spiritStones -= loss;
                    return { title: '仇家追杀', text: `旧日仇家找上门来，损失 ${loss} 灵石！`, effects: [{ type: '灵石', value: -loss, positive: false }] };
                }
            },
            '魔器诱惑': {
                type: 'negative',
                icon: '🗡️',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '魔器诱惑', inProgress: true };
                    return { title: '魔器诱惑', text: '发现一把散发魔气的武器，装备后每回合扣血！', effects: [], showChoice: true };
                }
            },
            '走火入魔': {
                type: 'negative',
                icon: '💀',
                minRealm: 0,
                condition: (state) => state.cultivationProgress > 1000,
                effect: (state) => {
                    if (state.realm > 0) state.realm--;
                    state.cultivationProgress = 0;
                    state.serendipity.luckStatus = 'unlucky';
                    state.serendipity.luckEndDay = state.days + 3;
                    return { title: '走火入魔', text: '修炼过度，走火入魔！境界-1，强制休息！', effects: [{ type: '境界', value: -1, positive: false }] };
                }
            },
            '妖兽袭击': {
                type: 'negative',
                icon: '🐺',
                minRealm: 0,
                effect: (state) => {
                    state.currentEvent = { type: '妖兽袭击', inProgress: true };
                    return { title: '妖兽袭击', text: '遭遇妖兽袭击！', effects: [], showRealmBattle: true, isNegative: true };
                }
            },
            // 中性奇遇
            '乞丐讨缘': {
                type: 'neutral',
                icon: '🙏',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '乞丐讨缘', inProgress: true, choices: ['施舍100灵石', '不给'] };
                    return { title: '乞丐讨缘', text: '路遇乞丐向你讨缘，你会怎么做？', effects: [] };
                }
            },
            '商人交易': {
                type: 'neutral',
                icon: '💰',
                minRealm: 0,
                effect: (state) => {
                    const items = ['聚灵丹', '心魔丹', '金髓丹'];
                    const item = items[Math.floor(Math.random() * items.length)];
                    const cost = Math.floor(100 + Math.random() * 200);
                    if (state.spiritStones >= cost) {
                        state.spiritStones -= cost;
                        addItemToInventory(item, 1);
                        return { title: '商人交易', text: `花费 ${cost} 灵石购买了 ${item}！`, effects: [{ type: '灵石', value: -cost, positive: false }, { type: item, value: 1, positive: true }] };
                    } else {
                        return { title: '商人交易', text: '灵石不足，无法交易！', effects: [] };
                    }
                }
            },
            '散修求助': {
                type: 'neutral',
                icon: '👤',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '散修求助', inProgress: true, choices: ['帮助', '不帮'] };
                    return { title: '散修求助', text: '一位散修请求你帮忙，你会帮助吗？', effects: [] };
                }
            },
            // B1 扩充奇遇
            '天地精华': {
                type: 'positive',
                icon: '🌟',
                minRealm: 0,
                effect: (state) => {
                    const qiGain = Math.floor(state.maxQi * 0.5);
                    state.qi = Math.min(state.maxQi, state.qi + qiGain);
                    return { title: '天地精华', text: `吸收天地精华，灵气+${qiGain}！`, effects: [{ type: '灵气', value: qiGain, positive: true }] };
                }
            },
            '心魔试炼': {
                type: 'negative',
                icon: '👹',
                minRealm: 1, // 筑基及以上
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '心魔试炼', inProgress: true, choices: ['勇敢面对', '退缩'] };
                    return { title: '心魔试炼', text: '识海中浮现心魔化身！你要直面还是退缩？', effects: [], showChoice: true };
                }
            },
            '上古遗迹': {
                type: 'neutral',
                icon: '🏛️',
                minRealm: 2, // 金丹及以上
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '上古遗迹', inProgress: true, choices: ['深入探索', '浅尝辄止', '离开'] };
                    return { title: '上古遗迹', text: '发现一处上古遗迹，灵气浓郁！如何行动？', effects: [], showChoice: true };
                }
            }
        };

        // --- SERENDIPITY_TALISMANS (1268-1273) ---
        const SERENDIPITY_TALISMANS = {
            '祥云符': { type: 'consumable', effect: { type: 'serendipity_boost', value: 0.1 }, duration: 1, price: 2000, desc: '奇遇概率+10%，持续1天', icon: '☁️' },
            '避厄符': { type: 'consumable', effect: { type: 'immune_negative', value: 1 }, duration: 1, price: 1500, desc: '免疫下次负面奇遇', icon: '🛡️' },
            '探路符': { type: 'consumable', effect: { type: 'force_realm', value: 1 }, duration: 0, price: 3000, desc: '指定触发"秘境入口"奇遇', icon: '📜' },
            '还童丹': { type: 'consumable', effect: { type: 'convert_demon', value: 1 }, duration: 0, price: 5000, desc: '将魔器转换为正常法宝', icon: '💊' }
        };

        // --- SPIRIT_ROOT_QUALITIES (1278-1285) ---
        const SPIRIT_ROOT_QUALITIES = {
            '伪灵根': { grade: 0, icon: '🌱', speedBonus: 0.6, bottleneckBonus: 0.4, tribulationBonus: -0.2, weight: 35 },
            '下品灵根': { grade: 1, icon: '🌿', speedBonus: 0.8, bottleneckBonus: 0.2, tribulationBonus: -0.1, weight: 25 },
            '中品灵根': { grade: 2, icon: '🌳', speedBonus: 1.0, bottleneckBonus: 0, tribulationBonus: 0, weight: 20 },
            '上品灵根': { grade: 3, icon: '🌲', speedBonus: 1.3, bottleneckBonus: -0.15, tribulationBonus: 0.1, weight: 12 },
            '天灵根': { grade: 4, icon: '✨', speedBonus: 1.6, bottleneckBonus: -0.25, tribulationBonus: 0.2, weight: 6 },
            '混沌灵根': { grade: 5, icon: '🌈', speedBonus: 2.0, bottleneckBonus: -0.4, tribulationBonus: 0.3, weight: 2 }
        };

        // --- FIVE_ELEMENT_TECHNIQUES (1288-1294) ---
        const FIVE_ELEMENT_TECHNIQUES = {
            '金': { name: '庚金剑诀', icon: '⚔️', bonusType: 'attack', bonusValue: 0.25, threshold: 20 },
            '木': { name: '青木长生诀', icon: '🌿', bonusType: 'heal', bonusValue: 0.5, threshold: 20 },
            '水': { name: '玄冰寒咒', icon: '❄️', bonusType: 'defense', bonusValue: 0.2, threshold: 20 },
            '火': { name: '烈焰真经', icon: '🔥', bonusType: 'attack', bonusValue: 0.2, threshold: 20 },
            '土': { name: '厚土玄功', icon: '🛡️', bonusType: 'resist', bonusValue: 0.25, threshold: 20 }
        };

        // --- CONSTITUTIONS (1297-1360) ---
        const CONSTITUTIONS = {
            '先天道体': {
                icon: '👼',
                desc: '全属性+20%，修炼速度+50%',
                effect: { allStats: 0.2, cultivateSpeed: 0.5 },
                trigger: (state) => state.spiritRoot.quality === '混沌灵根' && state.realm >= 3,
                source: '混沌灵根突破元婴'
            },
            '至尊骨': {
                icon: '🦴',
                desc: '攻击+30%，战斗中暴击+15%',
                effect: { attack: 0.3, crit: 0.15 },
                trigger: () => false, // 只能通过奇遇获得
                source: '随机奇遇'
            },
            '琉璃玉体': {
                icon: '💎',
                desc: '防御+25%，受到伤害-15%',
                effect: { defense: 0.25, damageReduce: 0.15 },
                trigger: (state) => {
                    const grade = SPIRIT_ROOT_QUALITIES[state.spiritRoot.quality].grade;
                    return grade >= 2 && state.realm === 2 && state.cultivationProgress >= REALM_REQUIREMENTS[2].stageThreshold[2];
                },
                source: '中品以上灵根突破金丹'
            },
            '玄冥之体': {
                icon: '🌊',
                desc: '水系功法伤害+40%，水系抗性+50%',
                effect: { waterBonus: 0.4, waterResist: 0.5 },
                trigger: (state) => state.spiritRoot.affinity.water >= 80,
                source: '水属性亲和≥80'
            },
            '烈焰战体': {
                icon: '🔥',
                desc: '火系功法伤害+40%，生命上限+20%',
                effect: { fireBonus: 0.4, hpBonus: 0.2 },
                trigger: (state) => state.spiritRoot.affinity.fire >= 80,
                source: '火属性亲和≥80'
            },
            '疾风灵体': {
                icon: '💨',
                desc: '速度+35%，先手概率+25%',
                effect: { speed: 0.35, firstStrike: 0.25 },
                trigger: () => false, // 只能通过奇遇获得
                source: '随机奇遇'
            },
            '不灭金身': {
                icon: '🛡️',
                desc: '免疫一次致命伤害，每日1次',
                effect: { lethalImmune: 1 },
                trigger: (state) => {
                    const grade = SPIRIT_ROOT_QUALITIES[state.spiritRoot.quality].grade;
                    return grade >= 3 && state.realm === 4 && state.cultivationProgress >= REALM_REQUIREMENTS[4].stageThreshold[2];
                },
                source: '上品以上灵根突破化神'
            },
            '重瞳': {
                icon: '👁️',
                desc: '可预判敌人攻击，闪避+20%',
                effect: { dodge: 0.2, foresee: 1 },
                trigger: () => false, // 只能通过奇遇获得
                source: '随机奇遇'
            }
        };

        // --- REALM_REQUIREMENTS (1483-1489) ---
        const REALM_REQUIREMENTS = {
            0: { maxQi: 100, stageThreshold: [30, 60, 90], breakthroughQi: 100 },
            1: { maxQi: 200, stageThreshold: [60, 120, 180], breakthroughQi: 200 },
            2: { maxQi: 400, stageThreshold: [120, 240, 360], breakthroughQi: 400 },
            3: { maxQi: 800, stageThreshold: [240, 480, 720], breakthroughQi: 800 },
            4: { maxQi: 1600, stageThreshold: [480, 960, 1440], breakthroughQi: 1600 }
        };

        // --- DEFAULT_MINIMAX_CONFIG (1505-1515) ---
        const DEFAULT_MINIMAX_CONFIG = {
            apiKey: '',
            baseUrl: 'https://api.minimaxi.com/v1',
            model: 'MiniMax-M2.7',
            groupId: '',
            features: {
                aiDialogue: false,
                aiSerendipity: false,
                aiTechnique: false
            }
        };

        // --- TECHNIQUE_BONUS (5014-5019) ---
        const TECHNIQUE_BONUS = {
            '雷法': { beats: '体术', losesTo: '火法' },
            '火法': { beats: '雷法', losesTo: '水法' },
            '水法': { beats: '火法', losesTo: '体术' },
            '体术': { beats: '水法', losesTo: '雷法' }
        };

        // --- TECHNIQUE_COLORS (5020-5025) ---
        const TECHNIQUE_COLORS = {
            '雷法': '#ffff00',
            '火法': '#ff4500',
            '水法': '#00bfff',
            '体术': '#228b22'
        };

        // --- SECT_CONFIG (6086-6101) ---
        const SECT_CONFIG = {
            createCost: 50000,
            maxDisciples: { 1: 30, 2: 50, 3: 80 },
            upgradeCost: { 2: 80000, 3: 150000 },
            upgradeDisciples: { 2: 20, 3: 40 },
            buildings: {
                library: { name: '功法阁', icon: '📚', cost: 10000, unlockLevel: 1, desc: '存放可供传承的功法' },
                alchemy: { name: '炼丹房', icon: '⚗️', cost: 20000, unlockLevel: 2, desc: '宗门产出丹药' },
                forge: { name: '炼器室', icon: '🔨', cost: 20000, unlockLevel: 2, desc: '宗门产出法宝' },
                archive: { name: '藏经阁', icon: '🏛️', cost: 50000, unlockLevel: 3, desc: '存放至高功法' }
            },
            talents: ['下品', '中品', '上品', '极品'],
            talentWeights: [0.4, 0.35, 0.2, 0.05],
            techniqueGrades: ['人阶', '灵阶', '天阶', '仙阶'],
            techniqueGradeColors: ['grade-human', 'grade-spirit', 'grade-heaven', 'grade-immortal']
        };

        // --- SECT_TECHNIQUES (6104-6111) ---
        const SECT_TECHNIQUES = {
            '基础练气诀': { grade: 0, effect: { type: 'cultivate_speed', value: 0.05 }, desc: '修炼速度+5%', icon: '📖' },
            '灵根培育法': { grade: 1, effect: { type: 'qi_rate', value: 0.1 }, desc: '灵气获取+10%', icon: '🌱' },
            '天元心法': { grade: 1, effect: { type: 'breakthrough_boost', value: 0.1 }, desc: '突破成功率+10%', icon: '☀️' },
            '金刚炼体术': { grade: 2, effect: { type: 'defense', value: 0.15 }, desc: '防御+15%', icon: '🛡️' },
            '紫霄雷法': { grade: 2, effect: { type: 'attack', value: 0.15 }, desc: '攻击+15%', icon: '⚡' },
            '九转玄天诀': { grade: 3, effect: { type: 'all_stats', value: 0.1 }, desc: '全属性+10%', icon: '🌟' }
        };


// Auto-generated module: core.js

        // ===== showModal =====
        function showModal(html) {
            const modal = document.getElementById('eventModal');
            if (!modal) return;
            document.getElementById('modalTitle').textContent = '⚡ 绝技选择';
            document.getElementById('modalDescription').innerHTML = html;
            document.getElementById('modalOptions').innerHTML = '';
            document.getElementById('modalResult').classList.add('hidden');
            modal.classList.add('active');
        }

        // ===== openModal =====
        function openModal(title, description, options) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDescription').innerHTML = description;
            document.getElementById('modalOptions').innerHTML = options;
            document.getElementById('modalOptions').classList.remove('hidden');
            document.getElementById('modalResult').classList.add('hidden');
            document.getElementById('eventModal').classList.add('active');
        }

        // ===== manualSave =====
        function manualSave() {
            showSaveLoadModal();
        }

        // ===== saveGame =====
        function saveGame() {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(gameState));
        }

        // ===== showSaveLoadModal =====
        function showSaveLoadModal() {
            const saved = localStorage.getItem(CONFIG.storageKey);
            let saveInfo = '未找到存档';
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    saveInfo = `存档时间: ${new Date(data.days ? data.days : Date.now()).toLocaleString('zh-CN')}`;
                } catch(e) {
                    saveInfo = '存档损坏';
                }
            }
            
            let html = '<div style="padding:16px;background:#1a1a2e;border-radius:8px;min-width:280px;">';
            html += '<div style="margin-bottom:16px;text-align:center;">';
            html += '<b style="color:#ffd700;font-size:16px;">📁 存档管理</b>';
            html += `<div style="color:#888;font-size:11px;margin-top:4px;">${saveInfo}</div>`;
            html += '</div>';
            html += '<div style="display:flex;flex-direction:column;gap:10px;">';
            html += `<button onclick="doSaveGame();closeModal();" style="padding:12px;background:#2e7d32;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">💾 保存游戏</button>`;
            html += `<button onclick="doLoadGame();closeModal();" style="padding:12px;background:#1565c0;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">📂 加载存档</button>`;
            html += `<button onclick="showAutoSaveInfo()" style="padding:12px;background:#333;color:#aaa;border:1px solid #555;border-radius:6px;cursor:pointer;font-size:14px;">ℹ️ 自动存档</button>`;
            html += `<button onclick="doResetGame()" style="padding:12px;background:#c62828;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">⚠️ 重置游戏</button>`;
            html += '</div>';
            html += '<button onclick="closeModal()" style="margin-top:16px;width:100%;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>';
            html += '</div>';
            showModal(html);
        }

        // ===== doSaveGame =====
        function doSaveGame() {
            try {
                saveGame();
                addLog('good', '存档成功', '游戏已保存到本地存储');
            } catch (e) {
                addLog('bad', '存档失败', '保存失败: ' + e.message);
            }
        }

        // ===== doLoadGame =====
        function doLoadGame() {
            try {
                const saved = localStorage.getItem(CONFIG.storageKey);
                if (!saved) {
                    addLog('bad', '加载失败', '没有找到存档');
                    return;
                }
                const data = JSON.parse(saved);
                // 确保新增字段存在（向后兼容）
                if (!data.combatLogHistory) data.combatLogHistory = [];
                if (!data.eventLogHistory) data.eventLogHistory = [];
                gameState = data;
                addLog('good', '加载成功', `存档已加载 (第${gameState.days}天)`);
                // 重新渲染UI
                if (typeof renderGameUI === 'function') renderGameUI();
                if (typeof refreshInventoryUI === 'function') refreshInventoryUI();
                if (typeof updateDisplay === 'function') updateDisplay();
                showGameUI();
            } catch (e) {
                addLog('bad', '加载失败', '加载失败: ' + e.message);
            }
        }

        // ===== doResetGame =====
        function doResetGame() {
            if (!confirm('确定要重置游戏吗？所有进度将丢失！')) return;
            try {
                localStorage.removeItem(CONFIG.storageKey);
                location.reload();
            } catch (e) {
                addLog('bad', '重置失败', '重置失败');
            }
        }

        // ===== showAutoSaveInfo =====
        function showAutoSaveInfo() {
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;">';
            html += '<b style="color:#ffd700;">ℹ️ 自动存档说明</b><br><br>';
            html += '<div style="color:#ccc;font-size:13px;line-height:1.6;">';
            html += '• 游戏会自动在重要操作后保存到本地<br>';
            html += '• 点击「保存游戏」可手动保存当前进度<br>';
            html += '• 存档保存在浏览器本地存储中<br>';
            html += '• 清除浏览器数据会导致存档丢失<br>';
            html += '• 建议定期手动保存重要进度</div>';
            html += '<button onclick="showSaveLoadModal()" style="margin-top:12px;width:100%;padding:8px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">知道了</button>';
            html += '</div>';
            showModal(html);
        }

        // ===== recalculateAllEffects =====
        function recalculateAllEffects() {
            // 保存需要保留的非装备效果（来自奇遇等系统）
            const savedSerendipityBoost = gameState.activeEffects.serendipity_boost || 0;
            const savedBreakthroughBoost = gameState.activeEffects.breakthrough_boost || 0;
            const savedCultivateSpeed = gameState.activeEffects.cultivate_speed || 0;
            const saved渡劫MindsetProtect = gameState.activeEffects['渡劫_mindset_protect'] || 0;
            const saved渡劫DamageReduce = gameState.activeEffects['渡劫_damage_reduce'] || 0;
            const savedAllStats = gameState.activeEffects.all_stats || 0;
            const savedAttack = gameState.activeEffects.attack || 0;
            const savedDefense = gameState.activeEffects.defense || 0;
            const savedCultivateQiRate = gameState.activeEffects.cultivate_qi_rate || 0;
            const savedEscape = gameState.activeEffects.escape || 0;
            const savedForeseeEvent = gameState.activeEffects.foresee_event || 0;

            // 重置所有效果
            for (let key in gameState.activeEffects) {
                gameState.activeEffects[key] = 0;
            }

            // 累加装备效果
            for (const treasure of gameState.equippedTreasures) {
                if (treasure) {
                    const effectType = treasure.effect.type;
                    if (gameState.activeEffects.hasOwnProperty(effectType)) {
                        gameState.activeEffects[effectType] += treasure.effect.value;
                    }
                }
            }

            // 恢复非装备效果（这些效果由奇遇系统或丹药管理，不应被清除）
            if (savedSerendipityBoost > 0) gameState.activeEffects.serendipity_boost = savedSerendipityBoost;
            if (savedBreakthroughBoost > 0) gameState.activeEffects.breakthrough_boost = savedBreakthroughBoost;
            if (savedCultivateSpeed > 0) gameState.activeEffects.cultivate_speed = savedCultivateSpeed;
            if (saved渡劫MindsetProtect > 0) gameState.activeEffects['渡劫_mindset_protect'] = saved渡劫MindsetProtect;
            if (saved渡劫DamageReduce > 0) gameState.activeEffects['渡劫_damage_reduce'] = saved渡劫DamageReduce;
            if (savedAllStats > 0) gameState.activeEffects.all_stats = savedAllStats;
            if (savedAttack > 0) gameState.activeEffects.attack = savedAttack;
            if (savedDefense > 0) gameState.activeEffects.defense = savedDefense;
            if (savedCultivateQiRate > 0) gameState.activeEffects.cultivate_qi_rate = savedCultivateQiRate;
            if (savedEscape > 0) gameState.activeEffects.escape = savedEscape;
            if (savedForeseeEvent > 0) gameState.activeEffects.foresee_event = savedForeseeEvent;
        }

        // ===== updateEquipmentBar =====
        function updateEquipmentBar() {
            const icons = ['⚔️', '🛡️', '💍'];
            for (let i = 0; i < 3; i++) {
                const slot = document.getElementById(`equipSlot${i}`);
                const treasure = gameState.equippedTreasures[i];
                if (treasure) {
                    slot.classList.add('filled');
                    slot.querySelector('.slot-icon').textContent = treasure.icon || icons[i];
                    const star = treasure.star || 1;
                    const starDisplay = getStarDisplay(star);
                    slot.querySelector('.slot-tooltip').textContent = `${treasure.name}${starDisplay}\n${treasure.desc}`;
                } else {
                    slot.classList.remove('filled');
                    slot.querySelector('.slot-icon').textContent = icons[i];
                    slot.querySelector('.slot-tooltip').textContent = '空';
                }
            }
        }

        // ===== renderSetStatus =====
        function renderSetStatus() {
            let html = '<div style="margin-top:8px;padding:6px;background:#1a1a2e;border-radius:6px;font-size:11px;">';
            html += '<b style="color:#ffd700;">套装状态</b><br>';
            let hasAny = false;
            for (const setName in SET_BONUSES) {
                const set = SET_BONUSES[setName];
                const equipped = [];
                const treasures = gameState.equippedTreasures;
                for (const t of treasures) {
                    if (t && set.pieces.includes(t.name)) equipped.push(t.name);
                }
                if (equipped.length > 0) {
                    hasAny = true;
                    const count = equipped.length;
                    const color = count >= set.count ? '#00ff88' : '#aaaaaa';
                    const status = count >= set.count ? '✓ ' + (count === 3 ? set.threePiece : set.twoPiece) : `(${equipped.length}/${set.count}) ${set.twoPiece}`;
                    html += `<span style="color:${color};">${setName} ${status}</span><br>`;
                }
            }
            if (!hasAny) html += '<span style="color:#666;">无套装激活</span>';
            html += '</div>';
            return html;
        }

        // ===== openEquipSlotMenu =====
        function openEquipSlotMenu(slotIndex) {
            const treasure = gameState.equippedTreasures[slotIndex];
            if (!treasure) return;
            // 移除已存在的菜单
            const existing = document.getElementById('equipSlotMenu');
            if (existing) existing.remove();

            const star = treasure.star || 1;
            const html = `<div id="equipSlotMenu" style="position:fixed;z-index:1002;background:#1a1a2e;border:1px solid #ffd700;border-radius:10px;padding:10px;min-width:160px;box-shadow:0 0 20px rgba(255,215,0,0.3);">
                <div style="color:#ffd700;font-weight:bold;text-align:center;margin-bottom:8px;">${treasure.icon || '📦'} ${treasure.name} ${getStarDisplay(star)}</div>
                <button onclick="openEnhanceFromEquip(${slotIndex})" style="display:block;width:100%;padding:6px 12px;background:rgba(255,215,0,0.15);border:1px solid #ffd700;border-radius:6px;color:#ffd700;cursor:pointer;margin-bottom:5px;">⬆️ 强化</button>
                <button onclick="unequipTreasure(${slotIndex});closeEquipSlotMenu()" style="display:block;width:100%;padding:6px 12px;background:rgba(100,100,100,0.2);border:1px solid #888;border-radius:6px;color:#ccc;cursor:pointer;">卸下</button>
                <button onclick="closeEquipSlotMenu()" style="display:block;width:100%;padding:6px 12px;background:transparent;border:none;color:#888;cursor:pointer;margin-top:3px;">取消</button>
            </div>`;
            const slot = document.getElementById(`equipSlot${slotIndex}`);
            const rect = slot.getBoundingClientRect();
            document.body.insertAdjacentHTML('beforeend', html);
            const menu = document.getElementById('equipSlotMenu');
            menu.style.top = (rect.bottom + 5) + 'px';
            menu.style.left = rect.left + 'px';
        }

        // ===== closeEquipSlotMenu =====
        function closeEquipSlotMenu() {
            const menu = document.getElementById('equipSlotMenu');
            if (menu) menu.remove();
        }

        // ===== unequipTreasure =====
        function unequipTreasure(slotIndex) {
            const treasure = gameState.equippedTreasures[slotIndex];
            if (treasure) {
                // 移回背包（保留星级）
                const invItem = {
                    type: treasure.type,
                    name: treasure.name,
                    quantity: 1,
                    quality: treasure.quality,
                    effect: treasure.effect,
                    desc: treasure.desc,
                    icon: treasure.icon,
                    star: treasure.star || 1
                };
                addToInventoryObj(invItem);
                gameState.equippedTreasures[slotIndex] = null;
                recalculateAllEffects();
                updateEquipmentBar();
                saveGame();
                addLog('neutral', '卸下灵宝', `卸下了${treasure.name}`);
                if (document.getElementById('setStatusContainer')) {
                    document.getElementById('setStatusContainer').innerHTML = renderSetStatus();
                }
            }
        }

        // ===== addToInventory =====
        function addToInventory(type, name, quantity, quality, effect, desc, icon, star) {
            // 查找是否已存在同类型物品
            const existing = gameState.inventory.find(item => item.name === name && item.type === type);
            if (existing) {
                existing.quantity += quantity;
            } else {
                if (gameState.inventory.length >= gameState.maxInventorySlots) {
                    return false; // 背包满了
                }
                gameState.inventory.push({
                    id: Date.now(),
                    type,
                    name,
                    quantity,
                    quality,
                    effect,
                    desc,
                    icon,
                    star: star || 1
                });
            }
            return true;
        }

        // ===== addToInventoryObj =====
        function addToInventoryObj(itemObj) {
            const existing = gameState.inventory.find(i => i.name === itemObj.name && i.type === itemObj.type);
            if (existing) {
                existing.quantity += itemObj.quantity;
            } else {
                if (gameState.inventory.length >= gameState.maxInventorySlots) {
                    return false;
                }
                gameState.inventory.push({
                    id: Date.now(),
                    type: itemObj.type,
                    name: itemObj.name,
                    quantity: itemObj.quantity,
                    quality: itemObj.quality,
                    effect: itemObj.effect,
                    desc: itemObj.desc,
                    icon: itemObj.icon,
                    star: itemObj.star || 1
                });
            }
            return true;
        }

        // ===== openInventory =====
        function openInventory() {
            currentInvTab = 'all';
            selectedInvItem = null;
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
            document.getElementById('inventoryModal').classList.add('active');
            document.getElementById('setStatusContainer').innerHTML = renderSetStatus();
        }

        // ===== closeInventory =====
        function closeInventory() {
            document.getElementById('inventoryModal').classList.remove('active');
        }

        // ===== switchInvTab =====
        function switchInvTab(tab) {
            currentInvTab = tab;
            selectedInvItem = null;
            document.querySelectorAll('.inventory-tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
        }

        // ===== renderInventoryGrid =====
        function renderInventoryGrid() {
            const grid = document.getElementById('inventoryGrid');
            let items = gameState.inventory;
            if (currentInvTab !== 'all') {
                items = items.filter(item => item.type === currentInvTab);
            }
            
            document.getElementById('invCapacity').textContent = gameState.inventory.length;
            
            grid.innerHTML = items.map((item, idx) => `
                <div class="inventory-slot ${selectedInvItem === idx ? 'selected' : ''}" 
                     onclick="selectInvItem(${idx})">
                    <span style="font-size:1.5em">${item.icon || '📦'}</span>
                    <span class="item-name quality-${item.quality}">${item.name}</span>
                    ${item.quantity > 1 ? `<span class="item-quantity">x${item.quantity}</span>` : ''}
                </div>
            `).join('');
        }

        // ===== selectInvItem =====
        function selectInvItem(idx) {
            let items = gameState.inventory;
            if (currentInvTab !== 'all') {
                items = items.filter(item => item.type === currentInvTab);
            }
            selectedInvItem = idx;
            const item = items[idx];
            renderInventoryGrid();
            
            document.getElementById('invDetail').style.display = 'block';
            document.getElementById('invDetailContent').innerHTML = `
                <div style="display:flex;align-items:center;gap:15px;margin-bottom:10px;">
                    <span style="font-size:2em">${item.icon || '📦'}</span>
                    <div>
                        <div style="font-weight:bold;font-size:1.2em;color:${getQualityColor(item.quality)}">${item.name}</div>
                        <div style="color:#888">${item.desc}</div>
                    </div>
                </div>
                <div style="color:#aaa">数量: ${item.quantity}</div>
            `;
            
            let actions = '';
            if (item.type === 'pill') {
                actions = `<button class="btn btn-cultivate" onclick="usePill('${item.name}', ${idx})">使用</button>`;
            } else if (item.type === 'treasure') {
                const star = item.star || 1;
                const starDisplay = getStarDisplay(star);
                const starColor = getStarColor(star);
                actions = `<button class="btn btn-breakthrough" onclick="equipTreasure('${item.name}', ${idx})">装备</button>`;
                actions += `<button class="btn btn-enhance" onclick="openEnhanceFromInventory(${idx})" style="background:rgba(255,215,0,0.15);border:1px solid #ffd700;color:#ffd700;padding:5px 12px;border-radius:5px;cursor:pointer;margin-left:5px;">强化</button>`;
            }
            actions += `<button class="btn btn-save" onclick="sellItem(${idx})">出售(${Math.floor(item.quality === 'common' ? 10 : item.quality === 'rare' ? 50 : item.quality === 'precious' ? 200 : 1000)}灵石)</button>`;
            actions += `<button class="btn btn-new" onclick="discardItem(${idx})">丢弃</button>`;
            document.getElementById('invActions').innerHTML = actions;
        }

        // ===== usePill =====
        function usePill(name, idx) {
            const pill = PILLS[name];
            if (!pill) return;
            
            const item = gameState.inventory.find((i, iidx) => {
                let items = gameState.inventory;
                if (currentInvTab !== 'all') items = items.filter(it => it.type === currentInvTab);
                return iidx === idx;
            });
            if (!item || item.quantity <= 0) return;
            
            item.quantity--;
            if (item.quantity <= 0) {
                gameState.inventory = gameState.inventory.filter(i => i.name !== name || i.type !== 'pill');
            }
            
            // 应用丹药效果
            switch (pill.effect.type) {
                case 'qi':
                    gameState.qi = Math.min(gameState.maxQi, gameState.qi + pill.effect.value);
                    addLog('good', '使用丹药', `服下${name}，灵气+${pill.effect.value}`);
                    break;
                case 'mindset':
                    gameState.mindset = Math.min(100, gameState.mindset + pill.effect.value);
                    addLog('good', '使用丹药', `服下${name}，心境+${pill.effect.value}`);
                    break;
                case 'breakthrough_boost':
                case 'cultivate_speed':
                case '渡劫_mindset_protect':
                    gameState.activeEffects[pill.effect.type] += pill.effect.value;
                    addLog('good', '使用丹药', `服下${name}，${pill.desc}（永久生效）`);
                    break;
            }
            
            saveGame();
            updateDisplay();
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
        }

        // ===== equipTreasure =====
        function equipTreasure(name, idx) {
            const treasure = TREASURES[name];
            if (!treasure) return;

            // 找到空槽位
            const emptySlot = gameState.equippedTreasures.findIndex(t => t === null);
            if (emptySlot === -1) {
                alert('装备栏已满！');
                return;
            }

            // 查找背包中的物品
            const itemIdx = gameState.inventory.findIndex(i => i.name === name && i.type === 'treasure');
            if (itemIdx === -1) return;

            const item = gameState.inventory[itemIdx];
            const star = item.star || 1; // 保留星级
            item.quantity--;
            if (item.quantity <= 0) {
                gameState.inventory.splice(itemIdx, 1);
            }

            // 装备（携带星级）
            gameState.equippedTreasures[emptySlot] = {
                name: item.name,
                type: item.type,
                quality: item.quality,
                effect: item.effect,
                desc: item.desc,
                icon: item.icon,
                star
            };
            
            recalculateAllEffects();
            updateEquipmentBar();
            saveGame();
            addLog('good', '装备灵宝', `装备了${name}`);
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
            document.getElementById('setStatusContainer').innerHTML = renderSetStatus();
        }

        // ===== sellItem =====
        function sellItem(idx) {
            let items = gameState.inventory;
            if (currentInvTab !== 'all') {
                items = items.filter(item => item.type === currentInvTab);
            }
            const item = items[idx];
            if (!item) return;
            
            // 经济调整：出售价格改为材料原价的30%（原为品质固定值）
            // 这样更符合经济逻辑：稀有材料出售价格更高
            let price = 10; // 默认普通物品
            if (item.type === 'material' && MATERIALS[item.name]) {
                // 材料出售价格 = basePrice × 0.3（约为原价的三折）
                price = Math.floor(MATERIALS[item.name].basePrice * 0.3);
            } else {
                // 非材料物品仍按品质定价（但略微降低）
                const prices = { common: 8, rare: 40, precious: 150, legendary: 800 };
                price = prices[item.quality] || 10;
            }
            
            item.quantity--;
            if (item.quantity <= 0) {
                gameState.inventory = gameState.inventory.filter(i => i !== item);
            }
            
            gameState.spiritStones += price;
            saveGame();
            updateDisplay();
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
            addLog('neutral', '出售物品', `出售了${item.name}，获得${price}灵石`);
        }

        // ===== discardItem =====
        function discardItem(idx) {
            let items = gameState.inventory;
            if (currentInvTab !== 'all') {
                items = items.filter(item => item.type === currentInvTab);
            }
            const item = items[idx];
            if (!item) return;
            
            item.quantity--;
            if (item.quantity <= 0) {
                gameState.inventory = gameState.inventory.filter(i => i !== item);
            }
            
            saveGame();
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
            addLog('neutral', '丢弃物品', `丢弃了${item.name}`);
        }


// Auto-generated module: crafting.js

        // ===== openShop =====
        function openShop() {
            if (gameState.shopItems.length === 0) {
                generateShopItems();
            }
            renderShopItems();
            document.getElementById('shopModal').classList.add('active');
            if (miniMaxConfig.apiKey) {
                generateShopIntro();
            }
        }

        // ===== closeShop =====
        function closeShop() {
            document.getElementById('shopModal').classList.remove('active');
        }

        // ===== generateShopItems =====
        function generateShopItems() {
            const allItems = [];
            // 收集所有丹药和灵宝
            for (const [name, pill] of Object.entries(PILLS)) {
                allItems.push({ type: 'pill', name, ...pill });
            }
            for (const [name, treasure] of Object.entries(TREASURES)) {
                allItems.push({ type: 'treasure', name, ...treasure });
            }
            // V4战斗道具
            for (const [name, treasure] of Object.entries(COMBAT_TREASURES)) {
                allItems.push({ type: 'treasure', name, ...treasure });
            }
            // 挑战状
            allItems.push({ type: 'special', name: '挑战状', quality: 'common', price: 500, desc: '用于发起斗法挑战', icon: '📜' });
            // 战斗丹药
            for (const [name, pill] of Object.entries(COMBAT_PILLS)) {
                allItems.push({ type: 'pill', name, ...pill, price: pill.price || 1000 });
            }

            // 随机选8-12个
            const count = 8 + Math.floor(Math.random() * 5);
            const shuffled = allItems.sort(() => Math.random() - 0.5);
            gameState.shopItems = shuffled.slice(0, Math.min(count, allItems.length));
            gameState.lastShopDay = gameState.days;
            saveGame();
        }

        // ===== renderShopItems =====
        function renderShopItems() {
            const grid = document.getElementById('shopGrid');
            grid.innerHTML = gameState.shopItems.map((item, idx) => `
                <div class="shop-item">
                    <div class="shop-item-info">
                        <div class="shop-item-name" style="color:${getQualityColor(item.quality)}">${item.icon || '📦'} ${item.name}</div>
                        <div class="shop-item-desc">${item.desc}</div>
                    </div>
                    <div class="shop-item-price">💎 ${item.price}</div>
                    <button class="btn-buy" onclick="buyItem(${idx})" ${gameState.spiritStones < item.price ? 'disabled' : ''}>购买</button>
                </div>
            `).join('');
        }

        // ===== buyItem =====
        function buyItem(idx) {
            const item = gameState.shopItems[idx];
            if (!item || gameState.spiritStones < item.price) {
                alert('灵石不足！');
                return;
            }
            
            if (gameState.inventory.length >= gameState.maxInventorySlots) {
                alert('背包已满！');
                return;
            }
            
            gameState.spiritStones -= item.price;
            addToInventory(item.type, item.name, 1, item.quality, item.effect, item.desc, item.icon);
            saveGame();
            updateDisplay();
            renderShopItems();
            addLog('good', '购买物品', `购买了${item.name}`);
        }

        // ===== refreshShop =====
        function refreshShop(isAuto = false) {
            // 经济调整：商店刷新费用递增，防止玩家无限制刷新刷出稀有物品
            if (!isAuto) {
                const refreshCost = Math.floor(100 * (1 + (gameState.shopRefreshCount || 0) * 0.5));
                if (gameState.spiritStones < refreshCost) {
                    alert(`灵石不足！刷新商店需要 ${refreshCost} 灵石`);
                    return;
                }
                gameState.spiritStones -= refreshCost;
                gameState.shopRefreshCount++;
                
                gameState.days++;
                saveGame();
                updateDisplay();
            }
            generateShopItems();
            renderShopItems();
            if (!isAuto) {
                addLog('neutral', '刷新商店', `商店已刷新，花费${refreshCost}灵石`);
            }
        }

        // ===== openCrafting =====
        function openCrafting(type) {
            selectedCraftType = type;
            selectedRecipeName = null;
            document.getElementById('alchemyDetail').style.display = 'none';
            document.getElementById('alchemyResult').style.display = 'none';
            renderCraftingRecipes();
            document.getElementById('alchemyModal').classList.add('active');
        }

        // ===== openAlchemy =====
        function openAlchemy() {
            openCrafting('alchemy');
        }

        // ===== openForge =====
        function openForge() {
            openCrafting('forge');
        }

        // ===== closeAlchemy =====
        function closeAlchemy() {
            document.getElementById('alchemyModal').classList.remove('active');
        }

        // ===== renderCraftingRecipes =====
        function renderCraftingRecipes() {
            const container = document.getElementById('alchemyRecipes');
            const modalTitle = document.querySelector('#alchemyModal .modal-title');
            const recipes = selectedCraftType === 'alchemy' ? ALCHEMY_RECIPES : FORGE_RECIPES;
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            const currentLevel = gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level;

            modalTitle.textContent = selectedCraftType === 'alchemy' ? '⚗️ 炼丹系统' : '🔨 炼器系统';

            // 渲染炉子选择和升级
            let furnaceHtml = '<div style="margin-bottom:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;">';
            furnaceHtml += '<div style="color:#aaa;margin-bottom:8px;">当前炉/台:</div>';
            furnaceHtml += '<div style="display:flex;gap:10px;flex-wrap:wrap;">';

            for (const [name, data] of Object.entries(furnace)) {
                const isOwned = data.level <= currentLevel;
                const isEquipped = data.level === currentLevel;
                const canBuy = data.cost > 0 && !isOwned;
                const canAfford = gameState.spiritStones >= data.cost;

                if (isEquipped) {
                    furnaceHtml += `<span style="padding:5px 12px;background:rgba(255,215,0,0.2);border:1px solid #ffd700;border-radius:5px;color:#ffd700;">${name} ${data.level === 1 ? '(免费)' : data.level === 2 ? '+15%' : '+30%'}</span>`;
                } else if (isOwned) {
                    furnaceHtml += `<button onclick="selectFurnace('${name}')" style="padding:5px 12px;background:rgba(0,0,0,0.4);border:1px solid #aaa;border-radius:5px;color:#aaa;cursor:pointer;">${name}</button>`;
                } else if (canBuy) {
                    furnaceHtml += `<button onclick="upgradeFurnace('${name}')" ${!canAfford ? 'disabled title="灵石不足"' : ''} style="padding:5px 12px;background:rgba(76,175,80,0.2);border:1px solid #4caf50;border-radius:5px;color:#4caf50;cursor:${canAfford ? 'pointer' : 'not-allowed'};">升级 ${name}(${data.cost}灵石)</button>`;
                }
            }
            furnaceHtml += '</div></div>';

            // 渲染配方列表
            let recipesHtml = '<div style="max-height:250px;overflow-y:auto;">';
            for (const [name, recipe] of Object.entries(recipes)) {
                const materialsStr = Object.entries(recipe.materials)
                    .map(([m, q]) => `${m}×${q}`)
                    .join(' + ');
                const canCraft = checkMaterialsForRecipe(recipe);
                const isSelected = selectedRecipeName === name;

                recipesHtml += `
                    <div class="alchemy-recipe ${isSelected ? 'selected' : ''}" onclick="selectCraftRecipe('${name}')">
                        <div class="recipe-info">
                            <div class="recipe-name" style="color:${getQualityColor(getRecipeQuality(name))}">${recipe.icon || '📦'} ${name}</div>
                            <div class="recipe-materials">材料: ${materialsStr}</div>
                            <div class="recipe-success">成功率: ${Math.round(recipe.successRate * 100)}% + 炉加成</div>
                        </div>
                        <button class="btn-craft">炼制</button>
                    </div>
                `;
            }
            recipesHtml += '</div>';

            container.innerHTML = furnaceHtml + recipesHtml;
        }

        // ===== getRecipeQuality =====
        function getRecipeQuality(name) {
            const recipe = ALCHEMY_RECIPES[name] || FORGE_RECIPES[name];
            if (!recipe) return 'common';
            const rate = recipe.successRate;
            if (rate >= 0.7) return 'common';
            if (rate >= 0.5) return 'rare';
            if (rate >= 0.35) return 'precious';
            return 'legendary';
        }

        // ===== selectFurnace =====
        function selectFurnace(name) {
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            if (furnace[name]) {
                gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level = furnace[name].level;
                saveGame();
                renderCraftingRecipes();
            }
        }

        // ===== upgradeFurnace =====
        function upgradeFurnace(name) {
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            const data = furnace[name];
            if (data && gameState.spiritStones >= data.cost) {
                gameState.spiritStones -= data.cost;
                gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level = data.level;
                addLog('good', '升级成功', `升级${selectedCraftType === 'alchemy' ? '炼丹炉' : '炼器台'}到${name}`);
                saveGame();
                updateDisplay();
                renderCraftingRecipes();
            }
        }

        // ===== selectCraftRecipe =====
        function selectCraftRecipe(name) {
            selectedRecipeName = name;
            renderCraftingRecipes();

            const recipes = selectedCraftType === 'alchemy' ? ALCHEMY_RECIPES : FORGE_RECIPES;
            const recipe = recipes[name];
            if (!recipe) return;

            const materialsStr = Object.entries(recipe.materials)
                .map(([m, q]) => `${m}×${q}`)
                .join(' + ');

            // 计算实际成功率
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            const currentLevel = gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level;
            const furnaceData = Object.values(furnace).find(f => f.level === currentLevel);
            const furnaceBonus = furnaceData ? furnaceData.successBonus : 0;
            const totalSuccessRate = Math.min(0.95, recipe.successRate + furnaceBonus);

            // 检查材料
            const canCraft = checkMaterialsForRecipe(recipe);

            // 检查燃料费
            const hasFuel = gameState.spiritStones >= recipe.fuelCost;

            document.getElementById('alchemyDetail').style.display = 'block';
            document.getElementById('alchemyDetailContent').innerHTML = `
                <div style="display:flex;align-items:center;gap:15px;margin-bottom:10px;">
                    <span style="font-size:2em">${recipe.icon || '📦'}</span>
                    <div>
                        <div style="font-weight:bold;font-size:1.2em;color:${getQualityColor(getRecipeQuality(name))}">${name}</div>
                        <div style="color:#aaa">${recipe.desc}</div>
                    </div>
                </div>
                <div style="margin:10px 0;">材料: ${materialsStr}</div>
                <div style="color:#aaa;">燃料费: ${recipe.fuelCost}灵石</div>
                <div style="color:#4caf50;">基础成功率: ${Math.round(recipe.successRate * 100)}%</div>
                <div style="color:#ffd700;">炉/台加成: +${Math.round(furnaceBonus * 100)}%</div>
                <div style="color:#00ff88;">总计成功率: ${Math.round(totalSuccessRate * 100)}%</div>
                <div style="margin-top:15px;">
                    <button class="btn-craft" onclick="doCraft('${name}')" ${!canCraft || !hasFuel ? 'disabled' : ''}>
                        ${!canCraft ? '材料不足' : !hasFuel ? '灵石不足(燃料)' : '开始炼制(消耗1天)'}
                    </button>
                </div>
            `;
        }

        // ===== checkMaterialsForRecipe =====
        function checkMaterialsForRecipe(recipe) {
            for (const [mat, qty] of Object.entries(recipe.materials)) {
                if (mat === '灵石') {
                    if (gameState.spiritStones < qty) return false;
                } else {
                    const hasItem = gameState.inventory.some(item =>
                        item.name === mat && item.quantity >= qty
                    );
                    if (!hasItem) return false;
                }
            }
            return true;
        }

        // ===== getPillEffect =====
        function getPillEffect(name) {
            const effects = {
                '回气丹': { type: 'qi', value: 0.2 },
                '疗伤丹': { type: 'health', value: 0.3 },
                '聚灵丹': { type: 'cultivate_speed', value: 0.2 },
                '破境丹': { type: 'breakthrough_boost', value: 0.15 },
                '渡劫丹': { type: '渡劫_success', value: 0.1 },
                '洗髓丹': { type: 'spiritRoot_refresh', value: 1 },
                '混沌丹': { type: '混沌灵根', value: 1 }
            };
            return effects[name] || {};
        }

        // ===== returnCraftMaterials =====
        function returnCraftMaterials(materials, rate) {
            for (const [mat, qty] of Object.entries(materials)) {
                if (mat === '灵石') {
                    gameState.spiritStones += Math.floor(qty * rate);
                } else {
                    const item = gameState.inventory.find(i => i.name === mat);
                    if (item) {
                        item.quantity += Math.floor(qty * rate);
                    } else if (Math.floor(qty * rate) > 0) {
                        const matData = MATERIALS[mat] || { icon: '📦', type: 'material' };
                        gameState.inventory.push({
                            id: Date.now() + Math.random(),
                            type: 'material',
                            name: mat,
                            quantity: Math.floor(qty * rate),
                            quality: 'common',
                            effect: {},
                            desc: `回收的${mat}`,
                            icon: matData.icon
                        });
                    }
                }
            }
        }

        // ===== openMarket =====
        function openMarket() {
            renderMarketItems();
            document.getElementById('alchemyModal').classList.add('active');
            document.querySelector('#alchemyModal .modal-title').textContent = '🏪 交易市场';
        }

        // ===== renderMarketItems =====
        function renderMarketItems() {
            const container = document.getElementById('alchemyRecipes');
            const logs = gameState.crafting.transactionLog || [];

            let html = '<div style="margin-bottom:15px;">';
            html += '<div style="color:#aaa;margin-bottom:10px;">上架你的物品出售(定价5%手续费)</div>';

            // 玩家可上架的物品
            const sellableItems = gameState.inventory.filter(item =>
                item.type === 'pill' || item.type === 'treasure'
            );

            if (sellableItems.length > 0) {
                html += '<div style="max-height:150px;overflow-y:auto;">';
                for (const item of sellableItems) {
                    const price = item.price || MATERIALS[item.name]?.basePrice || 100;
                    html += `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:rgba(0,0,0,0.3);border-radius:5px;margin-bottom:5px;">
                            <span>${item.icon} ${item.name} ×${item.quantity}</span>
                            <button onclick="listItem('${item.name}', ${price})" style="padding:3px 10px;background:#4caf50;border:none;border-radius:5px;color:white;cursor:pointer;">上架</button>
                        </div>
                    `;
                }
                html += '</div>';
            } else {
                html += '<div style="color:#888;text-align:center;padding:20px;">背包中没有可出售的物品</div>';
            }
            html += '</div>';

            // 交易记录
            html += '<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;">';
            html += '<div style="color:#ffd700;margin-bottom:10px;">最近交易记录</div>';
            if (logs.length > 0) {
                html += '<div style="max-height:150px;overflow-y:auto;">';
                for (const log of logs.slice(-10).reverse()) {
                    html += `
                        <div style="padding:5px;background:rgba(0,0,0,0.2);border-radius:3px;margin-bottom:3px;font-size:0.9em;">
                            <span style="color:${log.type === 'sell' ? '#4caf50' : '#ff9800'}">[${log.type === 'sell' ? '售出' : '购买'}]</span>
                            ${log.itemName} ×${log.quantity} @ ${log.price}灵石
                        </div>
                    `;
                }
                html += '</div>';
            } else {
                html += '<div style="color:#888;text-align:center;padding:10px;">暂无交易记录</div>';
            }
            html += '</div>';

            container.innerHTML = html;
        }

        // ===== listItem =====
        function listItem(name, basePrice) {
            const price = prompt(`请输入${name}的售价:`, basePrice);
            if (!price) return;
            const finalPrice = parseInt(price);
            if (isNaN(finalPrice) || finalPrice <= 0) {
                alert('请输入有效的价格');
                return;
            }

            // 扣除上架费(5%)
            const fee = Math.floor(finalPrice * 0.05);
            if (gameState.spiritStones < fee) {
                alert(`上架费${fee}灵石，你的灵石不足`);
                return;
            }

            gameState.spiritStones -= fee;

            // 消耗物品
            const item = gameState.inventory.find(i => i.name === name);
            if (item) {
                item.quantity -= 1;
                if (item.quantity <= 0) {
                    gameState.inventory = gameState.inventory.filter(i => i !== item);
                }
            }

            // 记录上架
            if (!gameState.crafting.listedItems) {
                gameState.crafting.listedItems = [];
            }
            gameState.crafting.listedItems.push({
                name,
                price: finalPrice,
                seller: '玩家',
                day: gameState.days
            });

            addLog('neutral', '物品上架', `${name}已上架，售价${finalPrice}灵石(手续费${fee})`);
            saveGame();
            updateDisplay();
            renderMarketItems();
        }

        // ===== buyFromMarket =====
        function buyFromMarket(listingIndex) {
            const listing = gameState.crafting.listedItems[listingIndex];
            if (!listing) return;

            if (gameState.spiritStones < listing.price) {
                alert('灵石不足');
                return;
            }

            gameState.spiritStones -= listing.price;
            addToInventory('pill', listing.name, 1, 'common', {}, '购买的物品', '📦');

            // 记录交易
            gameState.crafting.transactionLog.push({
                type: 'buy',
                itemName: listing.name,
                quantity: 1,
                price: listing.price,
                day: gameState.days
            });

            // 从上架列表移除
            gameState.crafting.listedItems.splice(listingIndex, 1);

            addLog('good', '购买成功', `购买了${listing.name}`);
            saveGame();
            updateDisplay();
            renderMarketItems();
        }

        // ===== selectRecipe =====
        function selectRecipe(name) {
            selectCraftRecipe(name);
        }

        // ===== craftPill =====
        function craftPill(name) {
            doCraft(name);
        }

        // ===== checkMaterials =====
        function checkMaterials(materials) {
            for (const [mat, qty] of Object.entries(materials)) {
                if (mat === '灵石') {
                    if (gameState.spiritStones < qty) return false;
                } else {
                    if (!gameState.inventory.some(item => item.name === mat && item.quantity >= qty)) return false;
                }
            }
            return true;
        }

        // ===== consumeMaterials =====
        function consumeMaterials(materials) {
            for (const [mat, qty] of Object.entries(materials)) {
                if (mat === '灵石') {
                    gameState.spiritStones -= qty;
                } else {
                    const item = gameState.inventory.find(i => i.name === mat);
                    if (item) {
                        item.quantity -= qty;
                        if (item.quantity <= 0) {
                            gameState.inventory = gameState.inventory.filter(i => i !== item);
                        }
                    }
                }
            }
        }

        // ===== returnMaterials =====
        function returnMaterials(materials, rate) {
            returnCraftMaterials(materials, rate);
        }


// Auto-generated module: cultivation.js

        // ===== renderLog =====
        function renderLog() {
            const container = document.getElementById('logEntries');
            const recentLogs = gameState.eventLog.slice(0, 5);
            container.innerHTML = recentLogs.map(log => `
                <div class="log-entry ${log.type}">
                    <div class="log-entry-title">第${log.day}天 - ${log.title}</div>
                    <div class="log-entry-text">${log.text}</div>
                </div>
            `).join('');
        }

        // ===== doCultivate =====
        function doCultivate() {
            const req = REALM_REQUIREMENTS[gameState.realm];
            let baseGain = 5 + Math.random() * 10 + gameState.realm * 3;
            // V7 应用灵根速度加成
            baseGain *= getSpiritRootSpeedBonus();
            // 应用体质修炼速度加成
            if (gameState.activeEffects.constitution_bonuses && gameState.activeEffects.constitution_bonuses.cultivateSpeed) {
                baseGain *= (1 + gameState.activeEffects.constitution_bonuses.cultivateSpeed);
            }
            // 应用装备和丹药效果
            baseGain *= (1 + gameState.activeEffects.cultivate_speed);
            baseGain *= (1 + gameState.activeEffects.cultivate_qi_rate);
            baseGain *= (1 + gameState.activeEffects.all_stats);
            const gain = Math.floor(baseGain);
            gameState.qi = Math.min(gameState.maxQi, gameState.qi + gain);
            gameState.cultivationProgress += gain;
            
            let logType = 'good';
            let logText = `修炼${gain}点灵气，感觉体内的灵力更加充沛。`;
            
            // 检查是否需要晋级
            if (gameState.cultivationProgress >= req.stageThreshold[gameState.stage] && gameState.stage < 2) {
                gameState.stage++;
                logText = `修炼${gain}点灵气，境界突破到${CONFIG.stages[gameState.stage]}！`;
                addLog(logType, '境界突破', logText);
            } else if (gameState.cultivationProgress >= req.stageThreshold[2]) {
                logText = `修炼${gain}点灵气，${CONFIG.realms[gameState.realm]}期修炼圆满，可以尝试突破到下一个境界！`;
                addLog('neutral', '境界圆满', logText);
            } else {
                addLog(logType, '修炼', logText);
            }
            
            gameState.days++;
            saveGame();
            updateDisplay();
            doMorningExercise();
        }

        // ===== doMorningExercise =====
        function doMorningExercise() {
            const gain = Math.floor(2 + Math.random() * 5);
            gameState.qi = Math.min(gameState.maxQi, gameState.qi + gain);
            gameState.mindset = Math.min(100, gameState.mindset + 1);
            updateDisplay();

            // V6: 处理每日奇遇结算
            processEndOfDaySerendipity();

            // V6: 检查是否触发奇遇
            const serendipityResult = checkSerendipity();
            if (serendipityResult) {
                showSerendipityModal(serendipityResult);
            }
        }

        // ===== getLocalRandomEvent =====
        function getLocalRandomEvent() {
            const events = [
                {
                    title: '🌿 发现灵草',
                    description: '在山林间发现一株散发幽香的灵草，似乎可以服用增强灵气。',
                    options: [
                        { text: '小心采摘', risk: 'low', effects: { qi: 15, mindset: 0, spiritStones: 0 } },
                        { text: '直接服用', risk: 'medium', effects: { qi: 35, mindset: -5, spiritStones: 0 } },
                        { text: '连根拔起研究', risk: 'high', effects: { qi: 60, mindset: -15, spiritStones: 0 } }
                    ]
                },
                {
                    title: '⚔️ 遇到妖兽',
                    description: '一只妖兽从林中窜出，眼中闪烁着凶光，似乎把你当成了猎物。',
                    options: [
                        { text: '悄悄绕行', risk: 'low', effects: { qi: 0, mindset: 5, spiritStones: 0 } },
                        { text: '与之搏斗', risk: 'medium', effects: { qi: -20, mindset: -10, spiritStones: 30 } },
                        { text: '全力击杀', risk: 'high', effects: { qi: -40, mindset: -25, spiritStones: 80 } }
                    ]
                },
                {
                    title: '🏯 废弃洞府',
                    description: '前方有一座废弃的修士洞府，门口的石碑上刻着模糊的文字。',
                    options: [
                        { text: '礼貌叩门', risk: 'low', effects: { qi: 10, mindset: 5, spiritStones: 0 } },
                        { text: '尝试破阵', risk: 'medium', effects: { qi: 30, mindset: -10, spiritStones: 50 } },
                        { text: '强行闯入', risk: 'high', effects: { qi: -30, mindset: -30, spiritStones: 150 } }
                    ]
                },
                {
                    title: '☁️ 灵气潮汐',
                    description: '天地灵气突然变得躁动，形成一股灵气潮汐，正是修炼的好时机。',
                    options: [
                        { text: '静心吸收', risk: 'low', effects: { qi: 25, mindset: 10, spiritStones: 0 } },
                        { text: '引导入体', risk: 'medium', effects: { qi: 50, mindset: 0, spiritStones: 0 } },
                        { text: '强行吞噬', risk: 'high', effects: { qi: 100, mindset: -20, spiritStones: 0 } }
                    ]
                },
                {
                    title: '🧘 偶遇前辈',
                    description: '一位神秘的前辈高人出现在你面前，似乎对你有所指点。',
                    options: [
                        { text: '恭敬请教', risk: 'low', effects: { qi: 20, mindset: 15, spiritStones: 0 } },
                        { text: '交流心得', risk: 'medium', effects: { qi: 40, mindset: 5, spiritStones: 0 } },
                        { text: '请求收徒', risk: 'high', effects: { qi: 80, mindset: -10, spiritStones: -50 } }
                    ]
                }
            ];
            return events[Math.floor(Math.random() * events.length)];
        }

        // ===== displayEventModal =====
        function displayEventModal(event) {
            document.getElementById('modalTitle').textContent = event.title;
            document.getElementById('modalDescription').textContent = event.description;
            
            const optionsContainer = document.getElementById('modalOptions');
            optionsContainer.innerHTML = event.options.map((opt, idx) => `
                <button class="option-btn" onclick="handleOption(${idx}, ${JSON.stringify(event.options[idx]).replace(/"/g, '&quot;')})">
                    ${opt.text}
                    <span class="option-risk ${opt.risk}">${opt.risk === 'low' ? '低风险' : opt.risk === 'medium' ? '中风险' : '高风险'}</span>
                </button>
            `).join('');
            
            // 保存当前事件
            window.currentEvent = event;
        }

        // ===== getTribulationKey =====
        function getTribulationKey(realm, stage) {
            if (realm === 3) {
                if (stage === 0) return '金丹初期雷劫';
                if (stage === 1) return '金丹中期阴火';
                return '金丹后期风劫';
            }
            if (realm === 4) return '元婴心魔';
            return '化神飞升';
        }

        // ===== localBreakthrough =====
        function localBreakthrough(isTribulation = false) {
            if (isTribulation) {
                executeTribulation();
                return;
            }
            
            const req = REALM_REQUIREMENTS[gameState.realm];
            let chance = (gameState.mindset / 100) * (gameState.qi / req.breakthroughQi);
            // 应用突破加成效果
            chance *= (1 + gameState.activeEffects.breakthrough_boost);
            chance *= (1 + gameState.activeEffects.all_stats);
            
            if (Math.random() < chance) {
                if (gameState.realm >= 4) {
                    // 飞升！
                    gameState.isGameOver = true;
                    gameState.isVictory = true;
                    addLog('good', '白日飞升', `历经${gameState.days}天的修炼，你终于突破化神期，白日飞升！`);
                    saveGame();
                    showGameOverScreen();
                } else {
                    // 突破成功
                    gameState.realm++;
                    gameState.stage = 0;
                    gameState.cultivationProgress = 0;
                    gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
                    gameState.qi = Math.floor(gameState.qi * 0.3);
                    gameState.mindset = Math.max(0, gameState.mindset - 10);
                    addLog('good', '突破成功', `恭喜！突破到${CONFIG.realms[gameState.realm]}期！`);
                    // V7 检查体质激活
                    initializeConstitutionEffects();
                    saveGame();
                    updateDisplay();
                }
            } else {
                // 突破失败
                gameState.qi = Math.floor(gameState.qi * 0.3);
                gameState.mindset = Math.max(0, gameState.mindset - 20);
                addLog('bad', '突破失败', '突破失败，灵气反噬...');
                saveGame();
                updateDisplay();
            }
        }

        // ===== displayBreakthroughResult =====
        function displayBreakthroughResult(result) {
            document.getElementById('modalDescription').innerHTML = '';
            const descDiv = document.createElement('div');
            descDiv.className = 'modal-description';
            descDiv.innerHTML = `<strong>${result.title}</strong><br><br>${result.description}`;
            document.getElementById('modalDescription').appendChild(descDiv);
            
            if (result.success) {
                if (gameState.realm >= 4) {
                    gameState.isGameOver = true;
                    gameState.isVictory = true;
                    addLog('good', '白日飞升', `历经${gameState.days}天的修炼，你终于突破化神期，白日飞升！`);
                } else {
                    gameState.realm++;
                    gameState.stage = 0;
                    gameState.cultivationProgress = 0;
                    gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
                    gameState.qi = Math.floor(gameState.qi * 0.3);
                    gameState.mindset = Math.max(0, gameState.mindset - 10);
                    addLog('good', '突破成功', `恭喜！突破到${CONFIG.realms[gameState.realm]}期！`);
                }
            } else {
                gameState.qi = Math.floor(gameState.qi * 0.3);
                gameState.mindset = Math.max(0, gameState.mindset - 20);
                addLog('bad', '突破失败', '突破失败，灵气反噬...');
            }
            
            saveGame();
            updateDisplay();
            
            document.getElementById('modalOptions').classList.add('hidden');
        }

        // ===== showTribulationUI =====
        function showTribulationUI() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];
            const modal = document.getElementById('tribulationModal');
            const scene = document.getElementById('tribulationScene');
            const typeDiv = document.getElementById('tribType');
            const rateSpan = document.getElementById('successRate');
            const prepDiv = document.getElementById('tribulationPreparations');
            const actionsDiv = document.getElementById('tribulationActions');
            const prepList = document.getElementById('prepList');

            // 设置场景样式
            scene.className = 'tribulation-scene ' + trib.type;
            scene.innerHTML = `<p style="color:#aaa;font-size:1.1em">${trib.desc}</p><p style="color:#ffd700;margin-top:10px">第 ${gameState.tribulation.currentStage + 1} / ${gameState.tribulation.totalStages} 重</p>`;

            // 天劫类型
            typeDiv.innerHTML = `【${gameState.tribulation.tribKey}】`;

            // 计算并显示成功率
            const rate = calculateTribulationSuccess(gameState.tribulation.tribKey);
            rateSpan.textContent = Math.round(rate * 100) + '%';

            // 准备加成列表
            updatePrepList();

            // 生成准备选项
            prepDiv.innerHTML = '';
            
            // 阵法选项
            const hasArray = gameState.tribulation.preparations.includes('阵法');
            const arrayBtn = document.createElement('button');
            arrayBtn.innerHTML = hasArray ? '✓ 阵法已布置' : '📿 布置阵法 (-2000灵石)';
            arrayBtn.className = hasArray ? 'active' : '';
            arrayBtn.disabled = hasArray || gameState.spiritStones < 2000;
            arrayBtn.onclick = () => addPreparation('阵法');
            prepDiv.appendChild(arrayBtn);

            // 定神丹选项
            const hasPill = gameState.tribulation.preparations.includes('定神丹');
            const hasDingShen = gameState.inventory.some(item => item.name === '定神丹');
            const pillBtn = document.createElement('button');
            pillBtn.innerHTML = hasPill ? '✓ 已服用定神丹' : '💊 服用定神丹';
            pillBtn.className = hasPill ? 'active' : '';
            pillBtn.disabled = hasPill || !hasDingShen;
            pillBtn.onclick = () => addPreparation('定神丹');
            prepDiv.appendChild(pillBtn);

            // 祈祷选项
            const hasPray = gameState.tribulation.preparations.includes('祈祷');
            const prayBtn = document.createElement('button');
            prayBtn.innerHTML = hasPray ? '✓ 祈祷已完成' : '🙏 祈祷先祖 (-10000灵石)';
            prayBtn.className = hasPray ? 'active' : '';
            prayBtn.disabled = hasPray || gameState.spiritStones < 10000;
            prayBtn.onclick = () => addPreparation('祈祷');
            prepDiv.appendChild(prayBtn);

            // 装备检查
            const equipped = gameState.equippedTreasures.filter(t => t);
            if (equipped.length > 0) {
                const equipInfo = equipped.map(t => `${t.icon||'📦'}${t.name}`).join(', ');
                const equipDiv = document.createElement('div');
                equipDiv.style.cssText = 'font-size:0.85em;color:#aaa;margin-top:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;';
                equipDiv.innerHTML = `当前装备：${equipInfo}`;
                prepDiv.appendChild(equipDiv);
            }

            // 转世buff提示
            if (gameState.hasTransmigrationBuff) {
                const buffDiv = document.createElement('div');
                buffDiv.className = 'buff-indicator';
                buffDiv.style.cssText = 'margin-top:10px;display:inline-block;';
                buffDiv.innerHTML = '✨ 转世重修加成：成功率+10%';
                prepDiv.appendChild(buffDiv);
            }

            // 操作按钮
            actionsDiv.innerHTML = '';
            const startBtn = document.createElement('button');
            startBtn.className = 'btn-tribulation start';
            startBtn.textContent = '🔥 开始渡劫';
            startBtn.onclick = () => startTribulation();
            actionsDiv.appendChild(startBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-tribulation cancel';
            cancelBtn.textContent = '⏸ 暂缓突破';
            cancelBtn.onclick = () => cancelTribulation();
            actionsDiv.appendChild(cancelBtn);

            modal.classList.add('active');
        }

        // ===== updatePrepList =====
        function updatePrepList() {
            const prepList = document.getElementById('prepList');
            const preps = gameState.tribulation.preparations;
            if (preps.length === 0) {
                prepList.innerHTML = '';
                return;
            }
            prepList.innerHTML = '准备加成：' + preps.map(p => {
                let bonus = '';
                if (p === '阵法') bonus = '(伤害-30%)';
                if (p === '定神丹') bonus = '(心境消耗-50%)';
                if (p === '祈祷') bonus = '(成功率+10%)';
                return p + bonus;
            }).join('、');
        }

        // ===== addPreparation =====
        function addPreparation(type) {
            if (gameState.tribulation.preparations.includes(type)) return;

            if (type === '阵法') {
                if (gameState.spiritStones < 2000) {
                    alert('灵石不足！布置阵法需要2000灵石');
                    return;
                }
                gameState.spiritStones -= 2000;
            } else if (type === '定神丹') {
                const idx = gameState.inventory.findIndex(item => item.name === '定神丹');
                if (idx === -1) {
                    alert('背包中没有定神丹！');
                    return;
                }
                gameState.inventory.splice(idx, 1);
            } else if (type === '祈祷') {
                if (gameState.spiritStones < 10000) {
                    alert('灵石不足！祈祷先祖需要10000灵石');
                    return;
                }
                gameState.spiritStones -= 10000;
            }

            gameState.tribulation.preparations.push(type);
            saveGame();
            showTribulationUI();
            updateDisplay();
        }

        // ===== calculateTribulationSuccess =====
        function calculateTribulationSuccess(tribKey) {
            const trib = TRIBULATIONS[tribKey];
            let rate = trib.baseRate;

            // 心境加成
            rate += (gameState.mindset / 100) * 0.2;

            // 转世重修buff
            if (gameState.hasTransmigrationBuff) {
                rate += 0.1;
            }

            // 装备加成
            const equipped = gameState.equippedTreasures.filter(t => t);
            equipped.forEach(t => {
                if (t.effects) {
                    t.effects.forEach(e => {
                        if (e.type === '渡劫_damage_reduce') rate += e.value * 0.1;
                        if (e.type === 'all_stats') rate += e.value * 0.5;
                    });
                }
            });

            // 准备加成
            if (gameState.tribulation.preparations.includes('阵法')) rate += 0.15;
            if (gameState.tribulation.preparations.includes('定神丹')) rate += 0.1;
            if (gameState.tribulation.preparations.includes('祈祷')) rate += 0.1;

            // 境界惩罚
            if (gameState.realm === 4) rate -= 0.1;
            if (gameState.realm === 5) rate -= 0.2;

            return Math.min(0.95, Math.max(0.05, rate));
        }

        // ===== generateTribulationScene =====
        function generateTribulationScene(realm, callback) {
            const model = miniMaxConfig.model || 'MiniMax-M2.7';
            const prompt = `你是一个修仙游戏的天劫场景生成器。请为玩家的渡劫场景生成一段独特的描述。
            
当前玩家信息：
- 境界：${REALMS[realm] || '未知'}
- 灵石：${gameState.stones}
- 装备：${typeof getEquippedItems === 'function' ? getEquippedItems() : '无'}

要求：
1. 生成一段50-100字的渡劫场景描述
2. 包含天象异变（雷电/乌云/异火等）
3. 包含内心心境描写
4. 描述要独特，每次生成都不同
5. 用中文输出，不要加引号

直接输出场景描述文字，不要前缀。`;

            callMiniMaxAPI(prompt, model, 200, (reply) => {
                if (reply && reply.trim()) {
                    callback(reply.trim());
                } else {
                    callback(getDefaultTribulationScene(realm));
                }
            }, (err) => {
                callback(getDefaultTribulationScene(realm));
            });
        }

        // ===== getDefaultTribulationScene =====
        function getDefaultTribulationScene(realm) {
            const scenes = [
                '天空骤然暗沉，乌云如墨般压下，电蛇在云层中狂舞，一道道紫色的天雷在云间酝酿，整个世界仿佛都在这股天威下颤抖。',
                '狂风骤起，飞沙走石，虚空中裂开一道道金色的裂缝，从中泄出炽热的光芒，仿佛有无形的神灵在注视着你，天劫即将降临。',
                '天地间一片肃杀之气，极寒与极热交替从天空倾泻而下，雷云翻涌如海，一道道银白色的雷劫之柱从天而降，直指你的位置。'
            ];
            return scenes[realm % scenes.length];
        }

        // ===== executeTribulation =====
        function executeTribulation() {
            const rate = calculateTribulationSuccess(gameState.tribulation.tribKey);
            const roll = Math.random();

            if (roll < rate) {
                // 成功
                if (roll < rate * 0.5) {
                    // 大成功
                    handleGreatSuccess();
                } else {
                    // 普通成功
                    handleSuccess();
                }
            } else {
                // 失败
                if (roll < 0.3) {
                    // 陨落
                    handleDeath();
                } else {
                    // 重伤
                    handleInjury();
                }
            }
        }

        // ===== handleGreatSuccess =====
        function handleGreatSuccess() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];

            // 突破成功
            gameState.realm++;
            gameState.stage = 0;
            gameState.cultivationProgress = 0;
            gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
            gameState.qi = Math.floor(gameState.qi * 0.5); // 大成功保留50%
            gameState.mindset = Math.min(100, gameState.mindset + 20); // 心境提升
            gameState.hasTransmigrationBuff = false; // 清除转世buff

            // 天劫洗礼加成
            gameState.activeEffects.attack += 0.1;
            gameState.activeEffects.defense += 0.1;

            // 记录
            gameState.tribulationRecord.push({
                type: gameState.tribulation.tribKey,
                result: '大成功',
                day: gameState.days
            });

            gameState.tribulation.inProgress = false;

            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <div class="tribulation-result great-success">
                    <h3>✨ 大成功 ✨</h3>
                    <p style="color:#ffd700">天劫洗礼，你的修为突飞猛进！</p>
                    <p style="color:#aaa;margin-top:10px">突破到${CONFIG.realms[gameState.realm]}期！</p>
                    <p style="color:#4caf50;margin-top:5px">获得天劫洗礼加成：攻击+10%，防御+10%</p>
                    <p style="color:#ff69b4;margin-top:5px">心境+20</p>
                </div>
            `;

            addLog('good', '渡劫大成功', `历经天劫洗礼，突破到${CONFIG.realms[gameState.realm]}期！获得天劫洗礼加成！`);
            saveGame();
            updateDisplay();

            // 3秒后关闭
            setTimeout(() => {
                closeTribulationModal();
                // V11: 渡劫成功后显示飞升按钮
                showAscensionButton();
            }, 3000);
        }

        // ===== handleSuccess =====
        function handleSuccess() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];
            const wasTranscending = gameState.realm >= 4; // V11: 记录是否在渡劫期

            // 突破成功
            gameState.realm++;
            gameState.stage = 0;
            gameState.cultivationProgress = 0;
            gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
            gameState.qi = Math.floor(gameState.qi * 0.3);
            gameState.mindset = Math.max(0, gameState.mindset - 5);
            gameState.hasTransmigrationBuff = false;

            // 天劫洗礼加成（较小）
            gameState.activeEffects.attack += 0.05;
            gameState.activeEffects.defense += 0.05;

            // 记录
            gameState.tribulationRecord.push({
                type: gameState.tribulation.tribKey,
                result: '成功',
                day: gameState.days
            });

            gameState.tribulation.inProgress = false;

            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <div class="tribulation-result success">
                    <h3>🎉 渡劫成功 🎉</h3>
                    <p style="color:#aaa">你历经重重磨难，终于渡过天劫！</p>
                    <p style="color:#ffd700;margin-top:10px">突破到${CONFIG.realms[gameState.realm]}期！</p>
                    <p style="color:#4caf50;margin-top:5px">获得天劫洗礼加成：攻击+5%，防御+5%</p>
                    ${wasTranscending ? '<p style="color:#e91e63;margin-top:15px;font-size:16px;">✨ 可以准备飞升了！ ✨</p>' : ''}
                </div>
            `;

            addLog('good', '渡劫成功', `渡过${trib.desc}，突破到${CONFIG.realms[gameState.realm]}期！`);
            saveGame();
            updateDisplay();

            setTimeout(() => {
                closeTribulationModal();
                // V11: 渡劫成功后显示飞升按钮
                showAscensionButton();
            }, 3000);
        }

        // ===== handleInjury =====
        function handleInjury() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];

            // 渡劫失败但保命
            gameState.qi = Math.floor(gameState.qi * 0.1);
            gameState.mindset = Math.max(0, gameState.mindset - 30);

            // 记录
            gameState.tribulationRecord.push({
                type: gameState.tribulation.tribKey,
                result: '重伤',
                day: gameState.days
            });

            gameState.tribulation.inProgress = false;

            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <div class="tribulation-result injury">
                    <h3>💔 重伤💔</h3>
                    <p style="color:#aaa">天劫反噬，你身受重伤...</p>
                    <p style="color:#ff9800;margin-top:10px">灵气大幅减少，心境下降</p>
                    <p style="color:#aaa;margin-top:10px">突破失败，但保住了性命</p>
                </div>
            `;

            addLog('bad', '渡劫重伤', `渡过${trib.desc}失败，身受重伤...`);
            saveGame();
            updateDisplay();

            setTimeout(() => {
                closeTribulationModal();
            }, 3000);
        }

        // ===== handleDeath =====
        function handleDeath() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];

            // 保留10%资源
            const keepStones = Math.floor(gameState.spiritStones * 0.1);
            const keepPills = gameState.inventory.filter(item =>
                item.name === '聚灵丹'
            ).slice(0, 2);

            // 重置状态
            gameState.realm = 1;
            gameState.stage = 0;
            gameState.qi = 50;
            gameState.maxQi = 100;
            gameState.spiritStones = keepStones;
            gameState.inventory = keepPills;
            gameState.mindset = 50;
            gameState.days = 1;
            gameState.cultivationProgress = 0;
            gameState.hasTransmigrationBuff = true; // 转世buff
            gameState.tribulation.inProgress = false;

            // 清空装备效果
            recalculateAllEffects();

            // 记录
            gameState.tribulationRecord.push({
                type: gameState.tribulation.tribKey,
                result: '陨落',
                day: gameState.days
            });

            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <div class="tribulation-result death">
                    <h3>💀 陨落 💀</h3>
                    <p style="color:#f44336">天劫无情，你陨落了...</p>
                    <p style="color:#aaa;margin-top:10px">但天道循环，你得以转世重修</p>
                    <p style="color:#e1bee7;margin-top:10px">保留部分资源和记忆</p>
                    <p style="color:#ffd700;margin-top:10px">获得【转世重修】加成：成功率+10%</p>
                </div>
            `;

            addLog('bad', '渡劫陨落', `渡劫失败，陨落了...但转世重修，获得转世buff！`);

            setTimeout(() => {
                closeTribulationModal();
                saveGame();
                showGameUI();
                updateDisplay();
            }, 3000);
        }

        // ===== closeTribulationModal =====
        function closeTribulationModal() {
            document.getElementById('tribulationModal').classList.remove('active');
            gameState.tribulation.inProgress = false;
        }

        // ===== cancelTribulation =====
        function cancelTribulation() {
            gameState.tribulation.inProgress = false;
            gameState.tribulation.preparations = [];
            closeTribulationModal();
            addLog('neutral', '暂缓突破', '你决定暂缓突破，继续积累实力...');
            saveGame();
        }

        // ===== getPlayerTechnique =====
        function getPlayerTechnique() {
            if (gameState.realm <= 1) return '体术';
            if (gameState.realm === 2) return ['雷法', '火法', '水法'][Math.floor(Math.random() * 3)];
            return TECHNIQUES[Math.floor(Math.random() * 4)];
        }


// Auto-generated module: data.js

        let selectedEnhanceItem = null; // 背包中选中的待强化灵宝
        let selectedEnhanceSlot = null; // 装备栏中选中的槽位（0/1/2）
        const ULTIMATE_SKILLS = {
            '凡铁剑': [
                { id:'basic_heavy', name:'重击', cost:50, damage:2.0, effects:{}, maxLevel:5 },
                { id:'basic_quick', name:'连击', cost:40, damage:1.2, effects:{doubleHit:0.3}, maxLevel:5 },
                { id:'basic_crash', name:'碎甲', cost:60, damage:1.8, effects:{armorBreak:0.25}, maxLevel:5 }
            ],
            '青云剑': [
                { id:'qy_heavy', name:'青云重击', cost:50, damage:2.0, effects:{}, maxLevel:5 },
                { id:'qy_slash', name:'剑气纵横', cost:65, damage:2.5, effects:{cleave:0.2}, maxLevel:5 },
                { id:'qy_fly', name:'御剑术', cost:80, damage:3.2, effects:{pierce:0.15}, maxLevel:5 }
            ],
            '雷霆铛': [
                { id:'thunder_1', name:'神雷', cost:70, damage:3.0, effects:{thunder:0.5}, maxLevel:5 },
                { id:'thunder_chain', name:'雷链', cost:75, damage:2.5, effects:{chain:0.25}, maxLevel:5 },
                { id:'thunder_storm', name:'雷罚', cost:90, damage:4.0, effects:{stun:0.15}, maxLevel:5 }
            ],
            '赤炎刀': [
                { id:'fire_slash', name:'焚天斩', cost:70, damage:3.0, effects:{burn:0.5}, maxLevel:5 },
                { id:'fire_inferno', name:'烈焰焚天', cost:85, damage:3.5, effects:{burn:0.35,defBoost:0.2}, maxLevel:5 },
                { id:'fire_immortal', name:'焚尽苍穹', cost:100, damage:4.5, effects:{burn:0.5,burnTurns:5}, maxLevel:5 }
            ],
            '寒冰剑': [
                { id:'ice_slash', name:'寒冰斩', cost:70, damage:3.0, effects:{freeze:0.4}, maxLevel:5 },
                { id:'ice_prison', name:'寒冰牢笼', cost:80, damage:2.0, effects:{freeze:0.3,freezeTurns:2}, maxLevel:5 },
                { id:'ice_shatter', name:'玄冰碎裂', cost:90, damage:3.8, effects:{freeze:0.45,freezeTurns:3}, maxLevel:5 }
            ],
            '金刚杵': [
                { id:'vajra_hit', name:'金刚杵击', cost:70, damage:3.0, effects:{armorBreak:0.3}, maxLevel:5 },
                { id:'vajra_beast', name:'伏魔金身', cost:75, damage:2.2, effects:{counterRate:0.4,defBoost:0.3}, maxLevel:5 },
                { id:'vajra_smash', name:'金刚碎岳', cost:95, damage:4.2, effects:{stun:0.2,armorBreak:0.3}, maxLevel:5 }
            ],
            '混元珠': [
                { id:'hunyuan_boom', name:'混元爆发', cost:50, damage:1.5, effects:{critBonus:0.30}, maxLevel:5 },
                { id:'hunyuan_shield', name:'混元护盾', cost:60, damage:0, effects:{defBoost:0.5,dmgReduce:0.2}, maxLevel:5 },
                { id:'hunyuan_orbit', name:'混元流转', cost:70, damage:2.2, effects:{drain:0.2,healRate:0.1}, maxLevel:5 }
            ],
            '金缕衣': [
                { id:'jinroo_guard', name:'金身护体', cost:50, damage:0, effects:{defBoost:0.5,dmgReduce:0.2}, maxLevel:5 },
                { id:'jinroo_reflect', name:'金缕反伤', cost:55, damage:0.8, effects:{reflect:0.3}, maxLevel:5 },
                { id:'jinroo_blessing', name:'金仙祝福', cost:70, damage:0, effects:{healRate:0.15,maxHpBoost:0.2}, maxLevel:5 }
            ],
            '避火罩': [
                { id:'fireproof_shield', name:'烈焰护盾', cost:50, damage:0, effects:{fireResist:1.0}, maxLevel:5 },
                { id:'fireproof_counter', name:'火抗反击', cost:60, damage:1.5, effects:{counterRate:0.35,fireResist:0.5}, maxLevel:5 },
                { id:'fireproof_absorb', name:'烈焰吸收', cost:75, damage:0, effects:{fireDrain:0.4,healRate:0.12}, maxLevel:5 }
            ],
            '玄冰甲': [
                { id:'icearmor_counter', name:'玄冰反击', cost:55, damage:1.2, effects:{counterRate:0.50,freeze:0.2}, maxLevel:5 },
                { id:'icearmor_wall', name:'玄冰冰墙', cost:65, damage:0, effects:{dmgReduce:0.4,freezeAura:0.25}, maxLevel:5 },
                { id:'icearmor_shatter', name:'冰霜爆裂', cost:80, damage:2.8, effects:{freeze:0.35,freezeTurns:2}, maxLevel:5 }
            ],
            '灵玉镯': [
                { id:'jade_shield', name:'灵玉护盾', cost:60, damage:0, effects:{defBoost:0.6,dmgReduce:0.25}, maxLevel:5 },
                { id:'jade_heal', name:'灵玉治愈', cost:55, damage:0, effects:{healRate:0.2,cleanse:1}, maxLevel:5 },
                { id:'jade_curse', name:'灵玉诅咒', cost:70, damage:2.2, effects:{curse:0.3,dmgReduce:0.2}, maxLevel:5 }
            ],
            '赤炎剑': [
                { id:'redfire_slash', name:'烈焰斩', cost:60, damage:2.8, effects:{burn:0.25}, maxLevel:5 },
                { id:'redfire_storm', name:'烈焰风暴', cost:80, damage:3.5, effects:{burn:0.35,cleave:0.25}, maxLevel:5 },
                { id:'redfire_immortal', name:'焚天灭世', cost:100, damage:4.5, effects:{burn:0.5,burnTurns:4}, maxLevel:5 }
            ],
            '风灵扇': [
                { id:'wind_fan', name:'风暴降临', cost:65, damage:2.2, effects:{speedReduce:0.30}, maxLevel:5 },
                { id:'wind_blade', name:'风刃连斩', cost:75, damage:2.8, effects:{doubleHit:0.25,speedReduce:0.15}, maxLevel:5 },
                { id:'wind_tornado', name:'龙卷风暴', cost:90, damage:3.8, effects:{speedReduce:0.45,cleave:0.2}, maxLevel:5 }
            ],
            '玄铁重甲': [
                { id:'iron_guard', name:'玄铁金身', cost:65, damage:0, effects:{defBoost:0.8,dmgReduce:0.25}, maxLevel:5 },
                { id:'iron_crash', name:'玄铁冲击', cost:70, damage:2.2, effects:{armorBreak:0.3,stun:0.15}, maxLevel:5 },
                { id:'iron_ultimate', name:'金铁合鸣', cost:85, damage:3.0, effects:{counterRate:0.45,dmgReduce:0.3}, maxLevel:5 }
            ],
            '紫电锤': [
                { id:'purple_thunder', name:'雷霆万钧', cost:75, damage:3.5, effects:{thunder:0.6}, maxLevel:5 },
                { id:'purple_chain', name:'紫电神链', cost:80, damage:3.0, effects:{chain:0.35,stun:0.15}, maxLevel:5 },
                { id:'purple_divine', name:'神雷灭世', cost:100, damage:5.0, effects:{thunder:0.7,stun:0.25}, maxLevel:5 }
            ],
            '天火扇': [
                { id:'divine_fire', name:'焚天之怒', cost:70, damage:3.0, effects:{burn:0.35,burnTurns:4}, maxLevel:5 },
                { id:'divine_inferno', name:'天火灭世', cost:90, damage:4.0, effects:{burn:0.5,burnTurns:5,dmgReduce:0.2}, maxLevel:5 },
                { id:'divine_meteor', name:'流星火雨', cost:95, damage:4.2, effects:{burn:0.45,cleave:0.3}, maxLevel:5 }
            ],
            '玄冰剑': [
                { id:'ice_crystal', name:'玄冰碎裂', cost:70, damage:2.8, effects:{freeze:0.35,freezeTurns:2}, maxLevel:5 },
                { id:'ice_domain', name:'玄冰领域', cost:85, damage:3.5, effects:{freeze:0.45,freezeTurns:3,freezeAura:0.2}, maxLevel:5 },
                { id:'ice_shatter', name:'万冰穿心', cost:100, damage:4.5, effects:{freeze:0.55,freezeTurns:4}, maxLevel:5 }
            ],
            '玄武甲': [
                { id:'blackturtle_guard', name:'玄武真身', cost:70, damage:0, effects:{defBoost:1.0,dmgReduce:0.35,healRate:0.10}, maxLevel:5 },
                { id:'blackturtle_counter', name:'玄武反击', cost:75, damage:1.8, effects:{counterRate:0.5,healRate:0.12}, maxLevel:5 },
                { id:'blackturtle_immortal', name:'玄武永固', cost:90, damage:0, effects:{invincible:1,dmgReduce:0.5,healRate:0.15}, maxLevel:5 }
            ],
            '天使神剑': [
                { id:'angel_slash', name:'天使裁决', cost:80, damage:4.5, effects:{trueDamage:0.30}, maxLevel:5 },
                { id:'angel_justice', name:'神圣审判', cost:90, damage:5.0, effects:{trueDamage:0.40,healRate:0.15}, maxLevel:5 },
                { id:'angel_divine', name:'神圣灭魔斩', cost:110, damage:6.0, effects:{trueDamage:0.5,burn:0.3}, maxLevel:5 }
            ],
            '天使神甲': [
                { id:'angel_armor_guard', name:'天使守护', cost:80, damage:0, effects:{invincible:1,dmgReduce:0.50,healRate:0.15}, maxLevel:5 },
                { id:'angel_armor_holy', name:'圣光护盾', cost:70, damage:0, effects:{defBoost:0.8,healRate:0.2,cleanse:2}, maxLevel:5 },
                { id:'angel_armor_final', name:'神盾永固', cost:95, damage:0, effects:{invincible:2,dmgReduce:0.6,healRate:0.25}, maxLevel:5 }
            ],
            '天使神翼': [
                { id:'angel_wing_strike', name:'天使制裁', cost:80, damage:3.0, effects:{drain:0.30}, maxLevel:5 },
                { id:'angel_wing_judgment', name:'天堂之拳', cost:90, damage:4.5, effects:{drain:0.35,stun:0.2}, maxLevel:5 },
                { id:'angel_wing_divine', name:'神圣审判之翼', cost:105, damage:5.5, effects:{drain:0.45,trueDamage:0.25}, maxLevel:5 }
            ],
            '空手': [
                { id:'empty_qigong', name:'气功波', cost:45, damage:1.8, effects:{}, maxLevel:5 },
                { id:'empty_chi', name:'气吞天下', cost:60, damage:2.5, effects:{drain:0.15}, maxLevel:5 },
                { id:'empty_ultimate', name:'混沌元气', cost:80, damage:3.5, effects:{drain:0.25,healRate:0.1}, maxLevel:5 }
            ]
        };
        const SET_BONUSES = {
            '青云套装': {
                pieces: ['青云剑', '青云甲'],
                count: 2,
                stats: { attackPercent: 0.15, critPercent: 0.10 },
                twoPiece: '攻击+15%，暴击+10%',
                threePiece: null,
                skill: null
            }
        };
        const ACHIEVEMENTS = [
            {
                id: 'tribulation_master',
                name: '渡劫宗师',
                desc: '渡过10次天劫',
                category: 'cultivation',
                requirement: { type: 'stat', key: 'tribulationsCompleted', value: 10 },
                reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.05 },
                title: '渡劫宗师'
            },
            {
                id: 'dungeon_slayer',
                name: '秘境杀手',
                desc: '击杀10个秘境首领',
                category: 'combat',
                requirement: { type: 'stat', key: 'dungeonBossesKilled', value: 10 },
                reward: { type: 'attribute', target: 'attack', bonus: 0.03 },
                title: '秘境杀手'
            },
            {
                id: 'sect_founder',
                name: '宗门创始人',
                desc: '创建宗门',
                category: 'story',
                requirement: { type: 'stat', key: 'sectContributions', value: 1 },
                reward: { type: 'attribute', target: 'sectContribution', bonus: 0.10 },
                title: '宗门创始人'
            },
            {
                id: 'treasure_master',
                name: '炼器宗师',
                desc: '强化9星装备1件',
                category: 'collection',
                requirement: { type: 'stat', key: 'treasuresRefined', value: 1 },
                reward: { type: 'attribute', target: 'craftingSuccess', bonus: 0.05 },
                title: '炼器宗师'
            },
            {
                id: 'serendipity_finder',
                name: '天选之人',
                desc: '触发20次奇遇',
                category: 'cultivation',
                requirement: { type: 'stat', key: 'serendipitiesEncountered', value: 20 },
                reward: { type: 'attribute', target: 'serendipityRate', bonus: 0.05 },
                title: '天选之人'
            },
            {
                id: 'first_ascension',
                name: '飞升者',
                desc: '首次突破化神',
                category: 'story',
                requirement: { type: 'realm', value: 4 },
                reward: { type: 'attribute', target: 'realmSuppression', bonus: 0.10 },
                title: '飞升者'
            },
            {
                id: 'equipment_collector',
                name: '套装收藏家',
                desc: '收集全套青云套装',
                category: 'collection',
                requirement: { type: 'set', setName: '青云套装' },
                reward: { type: 'attribute', target: 'setBonus', bonus: 0.15 },
                title: '套装收藏家'
            },
            {
                id: 'flawless_tribulation',
                name: '完美渡劫',
                desc: '零消耗渡劫成功',
                category: 'special',
                requirement: { type: 'stat', key: 'flawlessTribulations', value: 1 },
                reward: { type: 'attribute', target: 'tribulationCost', bonus: -0.10 },
                title: '完美渡劫'
            }
        ];
        let combatEnergy = 0;
        const MAX_ENERGY = 100;
        function closeModal() {
            const modal = document.getElementById('eventModal');
            if (modal) modal.classList.remove('active');
        }
        const ELEMENT_HIGH_THRESHOLD = 50;
        async function testApiConfig() {
            const apiKey = document.getElementById('settingsApiKey').value.trim();
            const baseUrl = document.getElementById('settingsBaseUrl').value.trim() || 'https://api.minimaxi.com/v1';
            const model = document.getElementById('settingsModel').value.trim() || 'MiniMax-M2.7';
            if (!apiKey) {
                document.getElementById('apiKeyTestResult').textContent = '✗ 请先填写API Key';
                document.getElementById('apiKeyTestResult').className = 'test-result error';
                document.getElementById('apiKeyTestResult').style.display = 'block';
                return;
            }
            document.getElementById('apiKeyTestResult').textContent = '测试中...';
            document.getElementById('apiKeyTestResult').className = 'test-result';
            document.getElementById('apiKeyTestResult').style.display = 'block';
            try {
                const startTime = Date.now();
                const response = await fetch(`${baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        max_tokens: 20,
                        temperature: 0.8,
                        messages: [{ role: "user", content: "hi" }]
                    })
                });
                const elapsed = Date.now() - startTime;
                const data = await response.json();
                if (response.ok) {
                    document.getElementById('apiKeyTestResult').className = 'test-result success';
                    document.getElementById('apiKeyTestResult').textContent = `✓ 连接成功 (${elapsed}ms)`;
                } else {
                    document.getElementById('apiKeyTestResult').className = 'test-result error';
                    document.getElementById('apiKeyTestResult').textContent = `✗ ${data.base_resp?.status_msg || data.error?.message || '请求失败'}`;
                }
            } catch (error) {
                document.getElementById('apiKeyTestResult').className = 'test-result error';
                document.getElementById('apiKeyTestResult').textContent = `✗ ${error.message}`;
            }
        }
        async function doExplore() {
            if (!miniMaxConfig.apiKey) {
                alert('请先配置MiniMax API Key！');
                openSettings('api');
                return;
            }
            openModal('探索中...', '<div class="loading">正在生成随机事件</div>', []);
            try {
                const eventData = await generateEvent();
                displayEventModal(eventData);
            } catch (error) {
                console.error('生成事件失败:', error);
                const localEvent = getLocalRandomEvent();
                displayEventModal(localEvent);
            }
        }
        async function generateEvent() {
            const realmName = CONFIG.realms[gameState.realm];
            const stageName = CONFIG.stages[gameState.stage];
            const eventTypes = ['奇遇', '挑战', '机缘', '平静', '劫难'];
            const weights = [0.2, 0.25, 0.15, 0.3, 0.1];
            const rand = Math.random();
            let cumulative = 0;
            let eventType = '平静';
            for (let i = 0; i < weights.length; i++) {
                cumulative += weights[i];
                if (rand < cumulative) {
                    eventType = eventTypes[i];
                    break;
                }
            }
            const prompt = `你是一个修仙游戏的事件生成器。
当前玩家状态：
- 境界：${realmName}期${stageName}
- 灵气：${gameState.qi}/${gameState.maxQi}
- 灵石：${gameState.spiritStones}
- 心境：${gameState.mindset}/100
- 游戏天数：${gameState.days}
请生成一个"${eventType}"类型的修仙事件。
要求：
1. 事件标题简洁有力（4-10字）
2. 事件描述生动有趣，体现修仙世界的奇妙
3. 提供3个不同风险等级的选项（低风险/中风险/高风险）
4. 每个选项都要有明确的效果描述
请以JSON格式返回：
{
    "title": "事件标题",
    "description": "事件描述（50-100字）",
    "options": [
        {"text": "选项1描述", "risk": "low", "effects": {"qi": 10, "mindset": 5, "spiritStones": 0}},
        {"text": "选项2描述", "risk": "medium", "effects": {"qi": 30, "mindset": -10, "spiritStones": 0}},
        {"text": "选项3描述", "risk": "high", "effects": {"qi": 80, "mindset": -30, "spiritStones": 0}}
    ]
}
注意：
- 低风险选项效果较小但安全
- 高风险选项效果大但可能失败
- effects中的值可以是负数表示减少
- qi和spiritStones可以是0表示无影响
- 只返回JSON，不要其他内容`;
            const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: miniMaxConfig.model || 'MiniMax-Text-01',
                    max_tokens: 500,
                    temperature: 0.8,
                    messages: [{ role: "user", content: prompt }]
                })
            });
            if (!response.ok) {
                throw new Error('API请求失败');
            }
            const data = await response.json();
            const content = data.choices[0].message.content;
            let jsonStr = content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            return JSON.parse(jsonStr);
        }
        async function handleOption(index, option) {
            const effects = option.effects;
            gameState.qi = Math.max(0, Math.min(gameState.maxQi, gameState.qi + (effects.qi || 0)));
            gameState.mindset = Math.max(0, Math.min(100, gameState.mindset + (effects.mindset || 0)));
            gameState.spiritStones = Math.max(0, gameState.spiritStones + (effects.spiritStones || 0));
            if (gameState.mindset <= 10) {
                gameState.isGameOver = true;
                gameState.isVictory = false;
                addLog('bad', '心境崩溃', '心境过低，走火入魔...');
                saveGame();
                closeModal();
                showGameOverScreen();
                return;
            }
            if (gameState.realm === 1 && gameState.cultivationProgress >= REALM_REQUIREMENTS[1].stageThreshold[2]) {
                if (Math.random() < 0.3) {
                    await handleTribulation();
                }
            }
            let resultTitle = '结果';
            let resultText = '';
            if (effects.qi > 0) resultText += `灵气 +${effects.qi} `;
            if (effects.qi < 0) resultText += `灵气 ${effects.qi} `;
            if (effects.mindset > 0) resultText += `心境 +${effects.mindset} `;
            if (effects.mindset < 0) resultText += `心境 ${effects.mindset} `;
            if (effects.spiritStones > 0) resultText += `灵石 +${effects.spiritStones} `;
            if (effects.spiritStones < 0) resultText += `灵石 ${effects.spiritStones} `;
            if (!resultText) resultText = '没有变化';
            addLog(effects.qi >= 0 && effects.mindset >= 0 ? 'good' : 'bad', option.text, resultText);
            // V29 NPC AI 每日任务处理
            if (gameState.sect && gameState.sect.name) {
                processNpcTasks();
                processNpcAutoBehavior();
            }
            // V31 天道轮回处理（仙界每日自动结算）
            if (gameState.currentRealm === 'immortal') {
                processCelestialCycle();
            }
            // V32 灵根觉醒触发检测
            checkSpiritRootAwakening();
            // V35 宗门任务进度处理
            if (gameState.sect && gameState.sect.name) {
                processDailySectMissions();
            }
            // V37 天道法则领悟进度处理
            processLawComprehension();
            // V38 仙界社交系统每日处理
            processDailySocial();
            // V39 仙宠培养系统每日处理
            processDailyPets();
            // V40 仙界拍卖行每日处理
            processAuctionEnd();
            // V41 仙界经济系统每日处理
            processDailyEconomy();
            // V42 天道竞技场每日重置
            processDailyArenaReset();
            // V43 仙宫建设每日处理
            processDailyPalace();
            // V44 仙法创造每日处理
            processDailySpellPractice();
            // V45 天道轮回增强每日处理
            processReincarnationRewards();
            gameState.days++;
            if (gameState.spiritStones < 500) {
                const bonusStones = Math.floor(gameState.realm * 50 * Math.random());
                if (bonusStones > 0) {
                    gameState.spiritStones += bonusStones;
                    addLog('good', '意外收获', `探索途中发现散落的灵石，获得${bonusStones}灵石`);
                }
            }
            saveGame();
            updateDisplay();
            document.getElementById('modalResult').innerHTML = `
                <div class="result-title">${resultTitle}</div>
                <p>${resultText}</p>
            `;
            document.getElementById('modalResult').classList.remove('hidden');
            document.getElementById('modalOptions').classList.add('hidden');
        }
        async function handleTribulation() {
            let survivalChance = gameState.mindset / 100;
            survivalChance *= (1 + getSpiritRootTribulationBonus());
            if (gameState.activeEffects.constitution_bonuses && gameState.activeEffects.constitution_bonuses.damageReduce) {
                survivalChance *= (1 + gameState.activeEffects.constitution_bonuses.damageReduce * 0.5);
            }
            survivalChance *= (1 + gameState.activeEffects.渡劫_mindset_protect);
            survivalChance *= (1 + gameState.activeEffects.all_stats);
            // V30 审批祝福buff
            const approvalBuff = gameState.activeEffects.tribulation_approval_buff || 0;
            survivalChance *= (1 + approvalBuff);
            if (Math.random() < survivalChance) {
                addLog('good', '渡劫成功', '天雷降临，你成功渡过天劫，修为大涨！');
                gameState.cultivationProgress = 0;
                gameState.stage = 0;
                const oldRealm = gameState.realm;
                gameState.realm = Math.min(4, gameState.realm + 1);
                gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
                gameState.qi = Math.floor(gameState.qi / 2);
                initializeConstitutionEffects();
                if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {} };
                gameState.achievements.stats.tribulationsCompleted++;
                if (gameState.tribulation && gameState.tribulation.damageTaken === 0) {
                    gameState.achievements.stats.flawlessTribulations++;
                }
                checkAchievements();
            } else {
                const damageReduction = gameState.activeEffects.渡劫_damage_reduce + gameState.activeEffects.all_stats;
                const qiLoss = Math.floor(gameState.qi * (0.8 * (1 - damageReduction)));
                const mindsetLoss = Math.floor(30 * (1 - gameState.activeEffects.渡劫_mindset_protect));
                addLog('bad', '渡劫失败', `天雷过于猛烈，你重伤垂死...`);
                gameState.qi = Math.max(0, gameState.qi - qiLoss);
                gameState.mindset = Math.max(0, gameState.mindset - mindsetLoss);
                if (survivalChance < 0.3 && gameState.realm > 0) {
                    const oldRealm = gameState.realm;
                    gameState.realm = Math.max(0, gameState.realm - 1);
                    gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
                    gameState.qi = Math.floor(gameState.qi * 0.3);
                    gameState.cultivationProgress = 0;
                    gameState.stage = 0;
                    addLog('bad', '境界倒退', `💔 天劫反噬过重，从${CONFIG.realms[oldRealm]}期跌落到${CONFIG.realms[gameState.realm]}期！`);
                }
            }
        }
        async function tryBreakthrough() {
            const req = REALM_REQUIREMENTS[gameState.realm];
            if (gameState.cultivationProgress < req.stageThreshold[2]) {
                alert('境界尚未圆满，无法突破！');
                return;
            }
            if (gameState.qi < req.breakthroughQi) {
                alert('灵气不足，无法突破！');
                return;
            }
            if (gameState.realm >= 3) {
                // V30 渡劫审批检查
                if (gameState.sect && gameState.sect.tribulationRequest) {
                    const req = gameState.sect.tribulationRequest;
                    if (req.status !== 'approved') {
                        openTribulationRequest();
                        return;
                    }
                    // 审批通过，应用buff
                    const approvalBuff = getTribulationApprovalBuff();
                    if (approvalBuff > 0) {
                        gameState.activeEffects.tribulation_approval_buff = approvalBuff;
                    }
                }
                const tribKey = getTribulationKey(gameState.realm, gameState.stage);
                gameState.tribulation = {
                    inProgress: true,
                    currentStage: 0,
                    totalStages: TRIBULATIONS[tribKey].stages,
                    currentType: TRIBULATIONS[tribKey].type,
                    preparations: [],
                    damageTaken: 0,
                    tribKey: tribKey
                };
                showTribulationUI();
                return;
            }
            if (!miniMaxConfig.apiKey) {
                localBreakthrough(false);
                return;
            }
            openModal('突破中...', '<div class="loading">正在生成突破描述</div>', []);
            try {
                const result = await generateBreakthroughResult();
                displayBreakthroughResult(result, false);
            } catch (error) {
                console.error('突破描述生成失败:', error);
                localBreakthrough(false);
            }
        }
async function generateBreakthroughResult() {
            const nextRealm = CONFIG.realms[Math.min(4, gameState.realm + 1)];
            const currentRealm = CONFIG.realms[gameState.realm];
            const prompt = `你是一个修仙游戏的突破场景描述器。
当前玩家状态：
- 当前境界：${currentRealm}期
- 目标境界：${nextRealm}期
- 灵气：${gameState.qi}/${gameState.maxQi}
- 心境：${gameState.mindset}/100
请生成一段突破时的场景描述，包括：
1. 天象变化（雷云、灵气漩涡等）
2. 身体的剧烈变化
3. 成功或失败的描述
请以JSON格式返回：
{
    "success": true或false,
    "title": "突破标题",
    "description": "详细描述（80-150字）"
}`;
            const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: miniMaxConfig.model || 'MiniMax-Text-01',
                    max_tokens: 300,
                    temperature: 0.8,
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const data = await response.json();
            const content = data.choices[0].message.content;
            let jsonStr = content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            return JSON.parse(jsonStr);
        }
        init();
        let currentInvTab = 'all';
        let selectedInvItem = null;
        async function generateShopIntro() {
            if (!miniMaxConfig.apiKey) return;
            try {
                const realmName = CONFIG.realms[gameState.realm];
                const prompt = `你是一个修仙世界的商店掌柜。请为"天机阁"生成一段简短的问候语（20-40字），要符合当前境界的修士。掌柜语气要亲切但不啰嗦。当前修士是${realmName}期修士。只返回问候语，不要其他内容。`;
                const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                    },
                    body: JSON.stringify({
                        model: miniMaxConfig.model || 'MiniMax-Text-01',
                        max_tokens: 100,
                        temperature: 0.8,
                        messages: [{ role: "user", content: prompt }]
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    const intro = data.choices[0].message.content.trim();
                    document.getElementById('shopIntro').textContent = intro;
                }
            } catch (error) {
                console.log('生成商店开场白失败，使用默认');
            }
        }
        let selectedCraftType = 'alchemy'; // 'alchemy' or 'forge'
        let selectedRecipeName = null;
        async function doCraft(name) {
            const recipes = selectedCraftType === 'alchemy' ? ALCHEMY_RECIPES : FORGE_RECIPES;
            const recipe = recipes[name];
            if (!recipe) return;
            if (recipe.materials['灵石']) {
                gameState.spiritStones -= recipe.materials['灵石'];
            }
            gameState.spiritStones -= recipe.fuelCost;
            for (const [mat, qty] of Object.entries(recipe.materials)) {
                if (mat === '灵石') continue;
                const item = gameState.inventory.find(i => i.name === mat);
                if (item) {
                    item.quantity -= qty;
                    if (item.quantity <= 0) {
                        gameState.inventory = gameState.inventory.filter(i => i !== item);
                    }
                }
            }
            // V29 NPC AI 每日任务处理
            if (gameState.sect && gameState.sect.name) {
                processNpcTasks();
                processNpcAutoBehavior();
            }
            gameState.days++;
            document.getElementById('alchemyDetail').style.display = 'none';
            const resultDiv = document.getElementById('alchemyResult');
            resultDiv.style.display = 'block';
            const craftType = selectedCraftType === 'alchemy' ? '炼丹' : '炼器';
            let craftDesc = `丹炉中灵光闪烁，药香四溢...`;
            if (miniMaxConfig.apiKey) {
                try {
                    const prompt = `描述一次${craftType}过程，物品名称是${name}，用50-80字描述${craftType}时的情景，包括火候、灵气变化等。`;
                    const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                        },
                        body: JSON.stringify({
                            model: miniMaxConfig.model || 'MiniMax-Text-01',
                            max_tokens: 150,
                            temperature: 0.8,
                            messages: [{ role: "user", content: prompt }]
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        craftDesc = data.choices[0].message.content.trim();
                    }
                } catch (error) {
                    craftDesc = `丹炉中灵光闪烁，药香四溢...`;
                }
            }
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            const currentLevel = gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level;
            const furnaceData = Object.values(furnace).find(f => f.level === currentLevel);
            const furnaceBonus = furnaceData ? furnaceData.successBonus : 0;
            const totalSuccessRate = Math.min(0.95, recipe.successRate + furnaceBonus);
            const roll = Math.random();
            if (roll < totalSuccessRate) {
                if (selectedCraftType === 'alchemy') {
                    addToInventory('pill', name, 1, getRecipeQuality(name), getPillEffect(name), recipe.desc, recipe.icon);
                } else {
                    addToInventory('treasure', name, 1, getRecipeQuality(name), recipe.effect, recipe.desc, recipe.icon);
                }
                resultDiv.innerHTML = `
                    <div class="result-success">🎉 ${craftType}成功！</div>
                    <p style="margin-top:10px;color:#aaa">${craftDesc}</p>
                    <p style="margin-top:10px;color:#ffd700">获得${name}×1，已放入背包</p>
                `;
                addLog('good', `${craftType}成功`, `成功${craftType === '炼丹' ? '炼制' : '锻造'}了${name}`);
            } else {
                returnCraftMaterials(recipe.materials, 0.5);
                resultDiv.innerHTML = `
                    <div class="result-fail">💔 ${craftType}失败...</div>
                    <p style="margin-top:10px;color:#aaa">${craftDesc}</p>
                    <p style="margin-top:10px;color:#888">材料损毁，返还50%材料</p>
                `;
                addLog('bad', `${craftType}失败`, `${craftType === '炼丹' ? '炼制' : '锻造'}${name}失败`);
            }
            saveGame();
            updateDisplay();
            setTimeout(() => {
                document.getElementById('alchemyResult').style.display = 'none';
                renderCraftingRecipes();
            }, 3000);
        }
        let selectedMarketItem = null;
        async function startTribulation() {
            const tribKey = gameState.tribulation.tribKey;
            const trib = TRIBULATIONS[tribKey];
            if (trib.type === 'demon') {
                await handleDemonTribulation();
                return;
            }
            if (!miniMaxConfig.apiKey) {
                executeTribulation();
                return;
            }
            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `<div class="loading" style="color:#ffd700">天劫降临中...</div>`;
            try {
                const desc = await generateTribulationDesc(tribKey);
                scene.innerHTML = `<p style="color:#ffd700;font-size:1.2em">${desc}</p>`;
                setTimeout(() => executeTribulation(), 2000);
            } catch (error) {
                console.error('生成渡劫描述失败:', error);
                executeTribulation();
            }
        }
        async function generateTribulationDesc(tribKey) {
            const trib = TRIBULATIONS[tribKey];
            return new Promise((resolve) => {
                generateTribulationScene(gameState.realm, (sceneDesc) => {
                    resolve(sceneDesc || trib.desc);
                });
            });
        }
        async function handleDemonTribulation() {
            const demonDamage = 20 * (gameState.tribulation.currentStage + 1);
            const preps = gameState.tribulation.preparations;
            if (preps.includes('定神丹')) {
                gameState.mindset = Math.max(0, gameState.mindset - Math.floor(demonDamage * 0.5));
            } else {
                gameState.mindset = Math.max(0, gameState.mindset - demonDamage);
            }
            gameState.tribulation.currentStage++;
            gameState.tribulation.damageTaken += demonDamage;
            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <p style="color:#ff00ff;font-size:1.1em">心魔入侵！</p>
                <p style="color:#aaa;margin-top:10px">心境 -${demonDamage}${preps.includes('定神丹') ? '(定神丹减免)' : ''}</p>
                <p style="color:#ffd700;margin-top:10px">当前心境：${gameState.mindset}/100</p>
            `;
            saveGame();
            if (gameState.mindset <= 0) {
                gameState.mindset = 0;
                setTimeout(() => handleInjury(), 1500);
            } else if (gameState.tribulation.currentStage >= gameState.tribulation.totalStages) {
                setTimeout(() => handleSuccess(), 1500);
            } else {
                setTimeout(() => showTribulationUI(), 1500);
            }
        }
        const TECHNIQUES = ['雷法', '火法', '水法', '体术'];
        const FIXED_OPPONENTS = [
            { name: '青云子', avatar: '👴', baseRealm: 2 },
            { name: '赤焰仙', avatar: '👩‍🦰', baseRealm: 2 },
            { name: '寒冰仙子', avatar: '👸', baseRealm: 3 },
            { name: '金刚罗汉', avatar: '💪', baseRealm: 3 },
            { name: '雷霆真君', avatar: '👨‍🔬', baseRealm: 4 }
        ];
        const CONTRIBUTION_SHOP_ITEMS = [
            { name: '灵阶功法·灵根培育法', cost: 500, type: 'technique', data: '灵根培育法' },
            { name: '天阶功法·金刚炼体术', cost: 2000, type: 'technique', data: '金刚炼体术' },
            { name: '上品筑基丹', cost: 300, type: 'pill', data: '筑基丹', quantity: 1 },
            { name: '破境丹', cost: 800, type: 'pill', data: '破境丹', quantity: 1 },
            { name: '宗门特权·双倍修炼', cost: 1000, type: 'buff', data: 'double_cultivate', duration: 7 }
        ];
        // ===== getStarDisplay =====
        function getStarDisplay(star) {
            if (!star || star <= 1) return '';
            let s = '★';
            if (star >= 3) s = '★★';
            if (star >= 5) s = '★★★';
            if (star >= 7) s = '✦★★★';
            if (star >= 9) s = '✦✦★★★';
            return s;
        }

        // ===== getStarColor =====
        function getStarColor(star) {
            if (star >= 8) return '#ffd700';
            if (star >= 5) return '#ba68c8';
            if (star >= 3) return '#64b5f6';
            return '#aaaaaa';
        }

        // ===== getEnhanceCost =====
        function getEnhanceCost(currentStar) {
            const next = currentStar + 1;
            if (next > 9) return null;
            return ENHANCE_CONFIG.costs[next];
        }

        // ===== checkEnhanceMaterials =====
        function checkEnhanceMaterials(cost) {
            if (!cost) return false;
            if (gameState.spiritStones < cost.stones) return false;
            if (cost.iron > 0) {
                const ironItem = gameState.inventory.find(i => i.name === '玄铁' && i.quantity >= cost.iron);
                if (!ironItem) return false;
            }
            if (cost.heavenly > 0) {
                const heavItem = gameState.inventory.find(i => i.name === '天材' && i.quantity >= cost.heavenly);
                if (!heavItem) return false;
            }
            if (cost.chaos > 0) {
                const chaosItem = gameState.inventory.find(i => i.name === '混沌石' && i.quantity >= cost.chaos);
                if (!chaosItem) return false;
            }
            return true;
        }

        // ===== openEnhanceFromInventory =====
        function openEnhanceFromInventory(itemIdx) {
            let items = gameState.inventory;
            if (currentInvTab !== 'all') items = items.filter(it => it.type === 'treasure');
            const item = items[itemIdx];
            if (!item || item.type !== 'treasure') return;
            selectedEnhanceItem = { source: 'inventory', idx: itemIdx, item };
            selectedEnhanceSlot = null;
            openEnhancePanel();
        }

        // ===== openEnhanceFromEquip =====
        function openEnhanceFromEquip(slotIndex) {
            const treasure = gameState.equippedTreasures[slotIndex];
            if (!treasure) return;
            selectedEnhanceSlot = slotIndex;
            selectedEnhanceItem = { source: 'equip', idx: slotIndex, item: treasure };
            openEnhancePanel();
        }

        // ===== openEnhancePanel =====
        function openEnhancePanel() {
            if (!selectedEnhanceItem) return;
            const item = selectedEnhanceItem.item;
            const star = item.star || 1;
            const nextStar = star + 1;
            const atMax = star >= 9;
            const cost = getEnhanceCost(star);
            const anvilLevel = gameState.crafting.anvil.level;
            const maxAllowed = ENHANCE_CONFIG.anvilStarLimit[anvilLevel] || 3;
            const blockedByAnvil = nextStar > maxAllowed;

            // 计算基础成功率
            const baseRate = atMax ? 0 : (ENHANCE_CONFIG.successRates[star] || 0.5);
            const furnaceData = Object.values(ANVILS).find(a => a.level === anvilLevel);
            const furnaceBonus = furnaceData ? furnaceData.successBonus : 0;
            const totalRate = atMax ? 0 : Math.min(0.95, baseRate + furnaceBonus);

            // 计算强化后属性倍率
            const currentMult = ENHANCE_CONFIG.starMultipliers[star] || 1.0;
            const nextMult = ENHANCE_CONFIG.starMultipliers[nextStar] || 1.0;

            // 当前和强化后的效果值
            const baseEffect = getBaseEffectValue(item);
            const currentVal = Math.round(baseEffect * currentMult * 100);
            const nextVal = Math.round(baseEffect * nextMult * 100);

            const canAfford = !atMax && !blockedByAnvil && checkEnhanceMaterials(cost);
            const hasFuel = gameState.spiritStones >= (cost ? cost.stones : 0);

            // 显示强化面板（在炼器模态框上覆盖）
            let html = `<div id="enhancePanel" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1001;background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #ffd700;border-radius:15px;padding:25px;min-width:380px;max-width:90vw;box-shadow:0 0 30px rgba(255,215,0,0.3);">
                <h2 style="color:#ffd700;text-align:center;margin-bottom:15px;">⬆️ 装备强化</h2>
                <div style="background:rgba(0,0,0,0.4);border-radius:10px;padding:15px;margin-bottom:15px;">
                    <div style="text-align:center;margin-bottom:10px;">
                        <span style="font-size:2em">${item.icon || '📦'}</span>
                        <div style="color:${getStarColor(star)};font-weight:bold;font-size:1.1em;margin-top:5px;">${item.name} ${getStarDisplay(star)}</div>
                        <div style="color:#aaa;font-size:0.9em;margin-top:3px;">${item.desc}</div>
                    </div>
                    <div style="display:flex;justify-content:space-around;margin-top:10px;">
                        <div style="text-align:center;">
                            <div style="color:#aaa;font-size:0.8em;">当前星级</div>
                            <div style="color:${getStarColor(star)};font-size:1.2em;font-weight:bold;">${star}星</div>
                            <div style="color:#64b5f6;font-size:0.85em;">${item.effect.type === 'attack' || item.effect.type === 'attackBonus' ? '攻击' : item.effect.type === 'defense' || item.effect.type === 'defenseBonus' ? '防御' : item.effect.type === 'crit' || item.effect.type === 'critBonus' ? '暴击' : item.effect.type === 'hp' || item.effect.type === 'hpBonus' ? '生命' : '效果'}+${currentVal}%</div>
                        </div>
                        <div style="color:#ffd700;font-size:1.5em;align-self:center;">→</div>
                        <div style="text-align:center;">
                            <div style="color:#aaa;font-size:0.8em;">强化后</div>
                            <div style="color:${getStarColor(nextStar)};font-size:1.2em;font-weight:bold;">${atMax ? '已满级' : nextStar + '星'}</div>
                            <div style="color:#4caf50;font-size:0.85em;">${atMax ? '—' : (item.effect.type === 'attack' || item.effect.type === 'attackBonus' ? '攻击' : item.effect.type === 'defense' || item.effect.type === 'defenseBonus' ? '防御' : item.effect.type === 'crit' || item.effect.type === 'critBonus' ? '暴击' : item.effect.type === 'hp' || item.effect.type === 'hpBonus' ? '生命' : '效果') + '+' + nextVal + '%'}</div>
                        </div>
                    </div>
                </div>`;

            if (atMax) {
                html += `<div style="text-align:center;color:#ffd700;font-size:1.1em;margin-bottom:15px;">★★★★★ 此装备已达最高强化等级 ★★★★★</div>`;
            } else if (blockedByAnvil) {
                html += `<div style="text-align:center;color:#ff6b6b;font-size:1em;margin-bottom:15px;">⚠️ 当前炼器台等级不足<br><span style="color:#aaa;font-size:0.9em;">升级炼器台至「天工神炉」可强化至${maxAllowed}星</span></div>`;
            } else {
                html += `<div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;margin-bottom:15px;">
                    <div style="color:#aaa;font-size:0.9em;margin-bottom:8px;">强化消耗：</div>
                    <div style="display:flex;gap:15px;flex-wrap:wrap;margin-bottom:8px;">
                        ${cost.iron > 0 ? `<span style="color:#64b5f6;">玄铁×${cost.iron}</span>` : ''}
                        ${cost.heavenly > 0 ? `<span style="color:#ba68c8;">天材×${cost.heavenly}</span>` : ''}
                        ${cost.chaos > 0 ? `<span style="color:#ffd700;">混沌石×${cost.chaos}</span>` : ''}
                        <span style="color:#ffd700;">灵石×${cost.stones}</span>
                    </div>
                    <div style="color:#4caf50;font-size:0.9em;">基础成功率: ${Math.round(baseRate * 100)}% | 炼器台加成: +${Math.round(furnaceBonus * 100)}% | 总计: ${Math.round(totalRate * 100)}%</div>
                </div>`;
            }

            html += `<div style="text-align:center;display:flex;gap:10px;justify-content:center;">
                <button onclick="closeEnhancePanel()" style="padding:8px 20px;background:rgba(100,100,100,0.3);border:1px solid #888;border-radius:8px;color:#ccc;cursor:pointer;">取消</button>`;

            if (!atMax && !blockedByAnvil) {
                const btnDisabled = (!canAfford || !hasFuel);
                html += `<button onclick="doEnhance()" ${btnDisabled ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : 'style="padding:8px 20px;background:rgba(76,175,80,0.3);border:1px solid #4caf50;border-radius:8px;color:#4caf50;cursor:pointer;"'}>
                    ${btnDisabled ? (blockedByAnvil ? '炼器台等级不足' : (!hasFuel ? '灵石不足' : '材料不足')) : '▶ 开始强化'}
                </button>`;
            }
            html += `</div></div>`;

            // 遮罩
            let overlay = document.getElementById('enhanceOverlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'enhanceOverlay';
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1000;';
                overlay.onclick = closeEnhancePanel;
                document.body.appendChild(overlay);
            }
            let panel = document.getElementById('enhancePanel');
            if (panel) panel.remove();
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // ===== closeEnhancePanel =====
        function closeEnhancePanel() {
            const panel = document.getElementById('enhancePanel');
            const overlay = document.getElementById('enhanceOverlay');
            if (panel) panel.remove();
            if (overlay) overlay.remove();
            selectedEnhanceItem = null;
            selectedEnhanceSlot = null;
        }

        // ===== getBaseEffectValue =====
        function getBaseEffectValue(item) {
            if (!item || !item.effect) return 0;
            const eff = item.effect;
            // 兼容两种格式
            return eff.value || eff.attackBonus || eff.defenseBonus || eff.critBonus || eff.hpBonus || eff.thunderBonus || eff.fireBonus || eff.waterBonus || eff.bodyBonus || 0;
        }

        // ===== doEnhance =====
        function doEnhance() {
            if (!selectedEnhanceItem) return;
            const { source, idx, item } = selectedEnhanceItem;
            const star = item.star || 1;
            const cost = getEnhanceCost(star);
            if (!cost) return;

            // 扣材料
            gameState.spiritStones -= cost.stones;
            if (cost.iron > 0) {
                const ironItem = gameState.inventory.find(i => i.name === '玄铁');
                if (ironItem) ironItem.quantity -= cost.iron;
            }
            if (cost.heavenly > 0) {
                const heavItem = gameState.inventory.find(i => i.name === '天材');
                if (heavItem) heavItem.quantity -= cost.heavenly;
            }
            if (cost.chaos > 0) {
                const chaosItem = gameState.inventory.find(i => i.name === '混沌石');
                if (chaosItem) chaosItem.quantity -= cost.chaos;
            }

            // 成功率判定
            const baseRate = ENHANCE_CONFIG.successRates[star] || 0.5;
            const anvilLevel = gameState.crafting.anvil.level;
            const furnaceData = Object.values(ANVILS).find(a => a.level === anvilLevel);
            const furnaceBonus = furnaceData ? furnaceData.successBonus : 0;
            const totalRate = Math.min(0.95, baseRate + furnaceBonus);
            const success = Math.random() < totalRate;

            const newStar = success ? star + 1 : star;

            // 更新装备星级
            if (source === 'equip') {
                gameState.equippedTreasures[idx].star = newStar;
            } else {
                const invIdx = gameState.inventory.findIndex(i => i.name === item.name && i.type === 'treasure');
                if (invIdx !== -1) {
                    gameState.inventory[invIdx].star = newStar;
                }
            }

            // 日志
            if (success) {
                addLog('good', '强化成功', `${item.name}强化至${newStar}星！属性大幅提升！`);

                // A5 成就检查 - 强化9星装备成功
                if (star === 9 && newStar === 10) {
                    if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {} };
                    gameState.achievements.stats.treasuresRefined++;
                    checkAchievements();
                }
            } else {
                addLog('negative', '强化失败', `${item.name}强化失败，材料化为乌有...`);
            }

            saveGame();
            recalculateAllEffects();
            updateEquipmentBar();
            updateDisplay();
            closeEnhancePanel();
        }

        // ===== showUltimateSkillPanel =====
        function showUltimateSkillPanel() {
            const weaponData = combatState.player.weaponData || { name:'空手' };
            const skills = ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
            if (!skills || skills.length === 0) {
                addCombatLog('当前武器没有可用的绝技');
                return;
            }
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;max-height:350px;overflow-y:auto;">';
            html += '<b style="color:#ffd700;font-size:14px;">⚡选择绝技</b><br><br>';
            skills.forEach((skill, idx) => {
                const level = combatState.player.skillLevels ? (combatState.player.skillLevels[skill.id] || 1) : 1;
                const maxed = level >= skill.maxLevel;
                const canUse = combatEnergy >= skill.cost;
                const color = canUse ? '#00ff88' : '#666';
                const upgradeCost = maxed ? null : getSkillUpgradeCost(level);
                html += `<div style="margin-bottom:10px;padding:8px;background:#252540;border-radius:6px;cursor:${canUse?'pointer':'not-allowed'};opacity:${canUse?1:0.6};" onclick="${canUse ? `selectUltimateSkill(${idx})` : ''}">`;
                html += `<div style="display:flex;justify-content:space-between;">`;
                html += `<span style="color:${color};font-size:13px;">${skill.name}</span>`;
                html += `<span style="color:#888;font-size:11px;">Lv.${level}${maxed?' <span style="color:#ffd700;">MAX</span>':''}</span>`;
                html += `</div>`;
                html += `<div style="color:#aaa;font-size:11px;margin-top:4px;">`;
                html += `消耗: ${skill.cost}能量 | 伤害: ×${(skill.damage * (1 + (level-1)*0.2)).toFixed(1)}`;
                if (skill.effects && Object.keys(skill.effects).length > 0) {
                    const effNames = Object.keys(skill.effects).join('/');
                    html += ` | 效果: ${effNames}`;
                }
                html += `</div>`;
                if (!maxed) {
                    html += `<div style="color:#888;font-size:10px;margin-top:3px;">升级(${level}→${level+1}): ${upgradeCost.text}</div>`;
                    html += `<button onclick="event.stopPropagation();upgradeUltimateSkill('${skill.id}')" style="margin-top:4px;padding:3px 10px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;font-size:10px;">升级</button>`;
                }
                html += `</div>`;
            });
            html += '<button onclick="closeModal()" style="margin-top:8px;padding:6px 16px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">返回</button>';
            html += '</div>';
            showModal(html);
        }

        // ===== getSkillUpgradeCost =====
        function getSkillUpgradeCost(level) {
            const materials = [
                { text:'100灵石', cost:100 },
                { text:'300灵石+1天材', cost:300, tiancai:1 },
                { text:'800灵石+1混沌石', cost:800, hunyuan:1 },
                { text:'2000灵石+1混沌石', cost:2000, hunyuan:1 },
                { text:'5000灵石+2混沌石', cost:5000, hunyuan:2 }
            ];
            return materials[Math.min(level, materials.length-1)];
        }

        // ===== upgradeUltimateSkill =====
        function upgradeUltimateSkill(skillId) {
            const weaponData = combatState.player.weaponData || { name:'空手' };
            const skills = ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
            const skill = skills.find(s => s.id === skillId);
            if (!skill) return;
            const level = combatState.player.skillLevels ? (combatState.player.skillLevels[skillId] || 1) : 1;
            if (level >= skill.maxLevel) return;
            const upgradeInfo = getSkillUpgradeCost(level);
            // 检查灵石
            if ((gameState.stones || 0) < upgradeInfo.cost) {
                addCombatLog(`升级${skill.name}需要${upgradeInfo.text}，灵石不足！`);
                return;
            }
            // 检查天材/混沌石
            if (upgradeInfo.tiancai && (gameState.materials['天材'] || 0) < upgradeInfo.tiancai) {
                addCombatLog(`升级${skill.name}需要${upgradeInfo.text}，天材不足！`);
                return;
            }
            if (upgradeInfo.hunyuan && (gameState.materials['混沌石'] || 0) < upgradeInfo.hunyuan) {
                addCombatLog(`升级${skill.name}需要${upgradeInfo.text}，混沌石不足！`);
                return;
            }
            // 扣除并升级
            gameState.stones -= upgradeInfo.cost;
            if (upgradeInfo.tiancai) gameState.materials['天材'] -= upgradeInfo.tiancai;
            if (upgradeInfo.hunyuan) gameState.materials['混沌石'] -= upgradeInfo.hunyuan;
            if (!combatState.player.skillLevels) combatState.player.skillLevels = {};
            combatState.player.skillLevels[skillId] = level + 1;
            addCombatLog(`⚡ ${skill.name} 升级到 Lv.${level+1}！`);
            if (typeof refreshInventoryUI === 'function') refreshInventoryUI();
            showUltimateSkillPanel();
        }

        // ===== selectUltimateSkill =====
        function selectUltimateSkill(idx) {
            const weaponData = combatState.player.weaponData || { name:'空手' };
            const skills = ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
            const skill = skills[idx];
            if (!skill || combatEnergy < skill.cost) return;
            executeUltimateSkill(skill);
            closeModal();
        }

        // ===== addEnergy =====
        function addEnergy(amount) {
            combatEnergy = Math.min(MAX_ENERGY, combatEnergy + amount);
        }

        // ===== openSettings =====
        function openSettings() {
            // 填充当前配置
            document.getElementById('settingsApiKey').value = miniMaxConfig.apiKey || '';
            document.getElementById('settingsBaseUrl').value = miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1';
            document.getElementById('settingsModel').value = miniMaxConfig.model || 'MiniMax-M2.7';
            document.getElementById('featureAiDialogue').checked = miniMaxConfig.features.aiDialogue || false;
            document.getElementById('featureAiSerendipity').checked = miniMaxConfig.features.aiSerendipity || false;
            document.getElementById('featureAiTechnique').checked = miniMaxConfig.features.aiTechnique || false;
            
            // 清除测试结果
            document.querySelectorAll('.test-result').forEach(el => {
                el.className = 'test-result';
                el.style.display = 'none';
            });
            
            // 显示面板
            document.getElementById('settingsModal').classList.add('active');
        }

        // ===== closeSettings =====
        function closeSettings() {
            document.getElementById('settingsModal').classList.remove('active');
        }

        // ===== switchSettingsTab =====
        function switchSettingsTab(tab) {
            document.querySelectorAll('.settings-nav-item').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.settings-section').forEach(el => el.classList.remove('active'));
            document.querySelector(`.settings-nav-item[onclick="switchSettingsTab('${tab}')"]`).classList.add('active');
            document.getElementById(`settings${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
        }

        // ===== saveSettings =====
        function saveSettings() {
            miniMaxConfig.apiKey = document.getElementById('settingsApiKey').value.trim();
            miniMaxConfig.baseUrl = document.getElementById('settingsBaseUrl').value.trim() || 'https://api.minimaxi.com/v1';
            miniMaxConfig.model = document.getElementById('settingsModel').value.trim() || 'MiniMax-M2.7';
            miniMaxConfig.features.aiDialogue = document.getElementById('featureAiDialogue').checked;
            miniMaxConfig.features.aiSerendipity = document.getElementById('featureAiSerendipity').checked;
            miniMaxConfig.features.aiTechnique = document.getElementById('featureAiTechnique').checked;
            
            localStorage.setItem(CONFIG.miniMaxConfigKey, JSON.stringify(miniMaxConfig));
            
            // 更新CONFIG中的apiUrl
            CONFIG.apiUrl = miniMaxConfig.baseUrl + '/chat/completions';
            
            closeSettings();
            addLog('good', '设置', '配置已保存！');
        }

        // ===== resetSettings =====
        function resetSettings() {
            miniMaxConfig = { ...DEFAULT_MINIMAX_CONFIG };
            document.getElementById('settingsApiKey').value = '';
            document.getElementById('settingsBaseUrl').value = DEFAULT_MINIMAX_CONFIG.baseUrl;
            document.getElementById('settingsModel').value = DEFAULT_MINIMAX_CONFIG.model;
            document.getElementById('featureAiDialogue').checked = false;
            document.getElementById('featureAiSerendipity').checked = false;
            document.getElementById('featureAiTechnique').checked = false;
            
            // 清除测试结果
            document.querySelectorAll('.test-result').forEach(el => {
                el.className = 'test-result';
                el.style.display = 'none';
            });
        }

        // ===== callMiniMaxAPI =====
        function callMiniMaxAPI(prompt, model, maxTokens, successCallback, errorCallback) {
            if (!miniMaxConfig.apiKey) {
                if (errorCallback) errorCallback('API未配置');
                return;
            }
            
            const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
            
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + miniMaxConfig.apiKey
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: maxTokens,
                    temperature: 0.8
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                    successCallback(data.choices[0].message.content);
                } else if (data.error) {
                    if (errorCallback) errorCallback(data.error.message || 'API错误');
                } else {
                    if (errorCallback) errorCallback('返回格式错误');
                }
            })
            .catch(e => {
                if (errorCallback) errorCallback(e.message);
            });
        }

        // ===== showGameOverScreen =====
        function showGameOverScreen() {
            document.getElementById('startScreen').classList.remove('hidden');
            document.getElementById('gameStats').classList.add('hidden');
            document.getElementById('cultivationProgress').classList.add('hidden');
            document.getElementById('equipmentBar').classList.add('hidden');
            document.getElementById('gameButtons').classList.add('hidden');
            document.getElementById('eventLog').classList.add('hidden');
            
            let html = '<div class="game-over">';
            if (gameState.isVictory) {
                html += `<h2 class="victory">🎉 飞升成功！🎉</h2>
                         <p>历经${gameState.days}天，你终于突破化神期，白日飞升！</p>`;
            } else {
                html += `<h2 class="defeat">💀 陨落 💀</h2>
                         <p>修仙之路充满危险，你在第${gameState.days}天陨落...</p>`;
            }
            html += '<button class="btn btn-new" onclick="startNewGame()">重新开始</button></div>';
            document.getElementById('startScreen').innerHTML = html;
        }

        // ===== generateRandomSpiritRoot =====
        function generateRandomSpiritRoot() {
            const rand = Math.random() * 100;
            let cumulative = 0;
            let selectedQuality = '中品灵根';
            
            for (const [quality, data] of Object.entries(SPIRIT_ROOT_QUALITIES)) {
                cumulative += data.weight;
                if (rand < cumulative) {
                    selectedQuality = quality;
                    break;
                }
            }
            
            // 生成随机五行亲和
            const affinity = {
                metal: Math.floor(Math.random() * 40) + 10,
                wood: Math.floor(Math.random() * 40) + 10,
                water: Math.floor(Math.random() * 40) + 10,
                fire: Math.floor(Math.random() * 40) + 10,
                earth: Math.floor(Math.random() * 40) + 10
            };
            
            // 计算总点数并归一化
            const total = affinity.metal + affinity.wood + affinity.water + affinity.fire + affinity.earth;
            const scale = 100 / total;
            for (const el in affinity) {
                affinity[el] = Math.floor(affinity[el] * scale);
            }
            
            // 随机共鸣度 0-10
            const resonance = Math.floor(Math.random() * 11);
            
            return {
                quality: selectedQuality,
                affinity: affinity,
                resonance: resonance,
                lastRefreshDay: 0
            };
        }

        // ===== getSpiritRootSpeedBonus =====
        function getSpiritRootSpeedBonus() {
            const quality = gameState.spiritRoot.quality;
            return SPIRIT_ROOT_QUALITIES[quality].speedBonus;
        }

        // ===== getSpiritRootBottleneckBonus =====
        function getSpiritRootBottleneckBonus() {
            const quality = gameState.spiritRoot.quality;
            return SPIRIT_ROOT_QUALITIES[quality].bottleneckBonus;
        }

        // ===== getSpiritRootTribulationBonus =====
        function getSpiritRootTribulationBonus() {
            const quality = gameState.spiritRoot.quality;
            return SPIRIT_ROOT_QUALITIES[quality].tribulationBonus;
        }

        // ===== getFiveElementBonus =====
        function getFiveElementBonus(element) {
            const affinity = gameState.spiritRoot.affinity[element.toLowerCase()];
            if (!affinity) return 0;
            
            const tech = FIVE_ELEMENT_TECHNIQUES[element];
            if (!tech) return 0;
            
            if (affinity >= tech.threshold) {
                return tech.bonusValue;
            }
            return 0;
        }

        // ===== getHighestElementBonus =====
        function getHighestElementBonus() {
            let best = null;
            let bestValue = 0;
            
            for (const [element, tech] of Object.entries(FIVE_ELEMENT_TECHNIQUES)) {
                const affinity = gameState.spiritRoot.affinity[element.toLowerCase()];
                if (affinity >= tech.threshold && tech.bonusValue > bestValue) {
                    best = element;
                    bestValue = tech.bonusValue;
                }
            }
            
            return best ? { element: best, technique: FIVE_ELEMENT_TECHNIQUES[best], affinity: gameState.spiritRoot.affinity[best.toLowerCase()] } : null;
        }

        // ===== refreshSpiritRoot =====
        function refreshSpiritRoot(withChaos = false) {
            const cost = withChaos ? 50000 : 10000;
            
            if (gameState.spiritStones < cost) {
                alert(`灵石不足！需要 ${cost} 灵石`);
                return;
            }
            
            if (withChaos && gameState.realm < 4) {
                alert('需要化神期才能使用混沌丹！');
                return;
            }
            
            if (withChaos) {
                // 混沌丹保底混沌灵根
                gameState.spiritRoot = {
                    quality: '混沌灵根',
                    affinity: {
                        metal: 20, wood: 20, water: 20, fire: 20, earth: 20
                    },
                    resonance: 10,
                    lastRefreshDay: gameState.days
                };
            } else {
                gameState.spiritRoot = generateRandomSpiritRoot();
                gameState.spiritRoot.lastRefreshDay = gameState.days;
            }
            
            gameState.spiritStones -= cost;
            
            // 重新初始化体质效果
            initializeConstitutionEffects();
            
            addLog('good', '灵根重塑', `使用${withChaos ? '混沌丹' : '洗髓丹'}重塑灵根，新的灵根为：${gameState.spiritRoot.quality}！`);
            
            closeSpiritRootModal();
            updateDisplay();
            saveGame();
        }

        // ===== initializeConstitutionEffects =====
        function initializeConstitutionEffects() {
            // 重置所有体质相关效果
            if (!gameState.activeEffects.constitution_bonuses) {
                gameState.activeEffects.constitution_bonuses = {};
            }
            
            // 检查并激活符合条件的体质
            for (const [name, data] of Object.entries(CONSTITUTIONS)) {
                const existing = gameState.constitutions.find(c => c.type === name);
                
                // 检查是否应该激活
                if (data.trigger(gameState)) {
                    if (!existing) {
                        // 新激活体质
                        if (gameState.constitutions.length >= 2) {
                            // 超过2个体质，替换最弱的
                            const weakest = findWeakestConstitution();
                            if (weakest) {
                                gameState.constitutions = gameState.constitutions.filter(c => c.type !== weakest);
                            }
                        }
                        gameState.constitutions.push({
                            type: name,
                            active: true,
                            acquiredAt: gameState.days
                        });
                        addLog('good', '体质觉醒', `你的${name}觉醒了！效果：${data.desc}`);
                    }
                }
            }
            
            // 应用体质效果到activeEffects
            recalculateConstitutionEffects();
        }

        // ===== findWeakestConstitution =====
        function findWeakestConstitution() {
            if (gameState.constitutions.length === 0) return null;
            
            let weakest = null;
            let weakestPower = Infinity;
            
            for (const c of gameState.constitutions) {
                const data = CONSTITUTIONS[c.type];
                let power = 0;
                for (const v of Object.values(data.effect)) {
                    power += typeof v === 'number' ? v : 0;
                }
                if (power < weakestPower) {
                    weakestPower = power;
                    weakest = c.type;
                }
            }
            
            return weakest;
        }

        // ===== recalculateConstitutionEffects =====
        function recalculateConstitutionEffects() {
            // 重置体质加成
            gameState.activeEffects.constitution_bonuses = {
                attack: 0,
                defense: 0,
                cultivateSpeed: 0,
                crit: 0,
                dodge: 0,
                damageReduce: 0,
                waterBonus: 0,
                fireBonus: 0,
                hpBonus: 0,
                lethalImmune: 0,
                firstStrike: 0
            };
            
            // 应用激活的体质效果
            for (const c of gameState.constitutions) {
                if (!c.active) continue;
                const data = CONSTITUTIONS[c.type];
                if (!data) continue;
                
                const effects = data.effect;
                if (effects.attack) gameState.activeEffects.constitution_bonuses.attack += effects.attack;
                if (effects.defense) gameState.activeEffects.constitution_bonuses.defense += effects.defense;
                if (effects.cultivateSpeed) gameState.activeEffects.constitution_bonuses.cultivateSpeed += effects.cultivateSpeed;
                if (effects.crit) gameState.activeEffects.constitution_bonuses.crit += effects.crit;
                if (effects.dodge) gameState.activeEffects.constitution_bonuses.dodge += effects.dodge;
                if (effects.damageReduce) gameState.activeEffects.constitution_bonuses.damageReduce += effects.damageReduce;
                if (effects.waterBonus) gameState.activeEffects.constitution_bonuses.waterBonus += effects.waterBonus;
                if (effects.fireBonus) gameState.activeEffects.constitution_bonuses.fireBonus += effects.fireBonus;
                if (effects.hpBonus) gameState.activeEffects.constitution_bonuses.hpBonus += effects.hpBonus;
                if (effects.lethalImmune) gameState.activeEffects.constitution_bonuses.lethalImmune += effects.lethalImmune;
                if (effects.firstStrike) gameState.activeEffects.constitution_bonuses.firstStrike += effects.firstStrike;
                if (effects.allStats) {
                    gameState.activeEffects.constitution_bonuses.attack += effects.allStats;
                    gameState.activeEffects.constitution_bonuses.defense += effects.allStats;
                }
            }
        }

        // ===== updateSpiritRootDisplay =====
        function updateSpiritRootDisplay() {
            if (!gameState.spiritRoot) return;
            
            const sr = gameState.spiritRoot;
            const srData = SPIRIT_ROOT_QUALITIES[sr.quality];
            
            // 更新灵根名称和图标
            const srNameEl = document.getElementById('spiritRootName');
            if (srNameEl) {
                srNameEl.textContent = sr.quality;
                srNameEl.className = `spirit-root-name grade-${srData.grade}`;
            }
            
            const srIcon = document.querySelector('.spirit-root-icon');
            if (srIcon) {
                srIcon.textContent = srData.icon;
            }
            
            // 更新五行亲和显示
            const elementIds = ['metal', 'wood', 'water', 'fire', 'earth'];
            const elementNames = { metal: '金', wood: '木', water: '水', fire: '火', earth: '土' };
            elementIds.forEach(el => {
                const dot = document.getElementById('element' + el.charAt(0).toUpperCase() + el.slice(1));
                if (dot) {
                    const value = sr.affinity[el];
                    dot.style.opacity = value >= ELEMENT_HIGH_THRESHOLD ? '1' : '0.4';
                    dot.title = `${elementNames[el]}: ${value}%`;
                }
            });
            
            // 更新体质显示
            const cons = gameState.constitutions.filter(c => c.active);
            const consIcon = document.getElementById('constitutionIcon');
            const consName = document.getElementById('constitutionName');
            const consCount = document.getElementById('constitutionCount');
            const consDisplay = document.getElementById('constitutionDisplay');
            
            if (consIcon && consName && consCount && consDisplay) {
                if (cons.length > 0) {
                    consIcon.textContent = CONSTITUTIONS[cons[0].type].icon;
                    consName.textContent = cons[0].type;
                    consDisplay.classList.add('has-constitution');
                } else {
                    consIcon.textContent = '⚗️';
                    consName.textContent = '无体质';
                    consDisplay.classList.remove('has-constitution');
                }
                consCount.textContent = `(${cons.length}/2)`;
            }
        }

        // ===== openSpiritRootModal =====
        function openSpiritRootModal() {
            document.getElementById('spiritRootModal').classList.add('active');
            renderSpiritRootContent();
        }

        // ===== closeSpiritRootModal =====
        function closeSpiritRootModal() {
            document.getElementById('spiritRootModal').classList.remove('active');
        }

        // ===== getAchievementProgress =====
        function getAchievementProgress(achievement, ach) {
            const req = achievement.requirement;
            if (req.type === 'stat') {
                const current = ach.stats[req.key] || 0;
                return Math.min(100, (current / req.value) * 100);
            } else if (req.type === 'realm') {
                return gameState.realm >= req.value ? 100 : 0;
            } else if (req.type === 'set') {
                const set = SET_BONUSES[req.setName];
                if (!set) return 0;
                const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
                const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
                const allPieces = [...new Set([...equipped.filter(p => p), ...owned])];
                return Math.min(100, (allPieces.length / set.pieces.length) * 100);
            }
            return 0;
        }

        // ===== getAchievementProgressText =====
        function getAchievementProgressText(achievement, ach) {
            const req = achievement.requirement;
            if (req.type === 'stat') {
                const current = ach.stats[req.key] || 0;
                return `${current}/${req.value}`;
            } else if (req.type === 'realm') {
                return `当前：${CONFIG.realms[gameState.realm]}`;
            } else if (req.type === 'set') {
                const set = SET_BONUSES[req.setName];
                if (!set) return '0/2';
                const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
                const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
                const allPieces = [...new Set([...equipped.filter(p => p), ...owned])];
                return `${allPieces.length}/${set.pieces.length}`;
            }
            return '';
        }

        // ===== getRewardText =====
        function getRewardText(achievement) {
            const r = achievement.reward;
            if (r.type === 'attribute') {
                const bonusText = r.bonus >= 0 ? `+${Math.round(r.bonus * 100)}%` : `${Math.round(r.bonus * 100)}%`;
                const targetNames = {
                    cultivationSpeed: '修炼速度',
                    attack: '攻击',
                    defense: '防御',
                    craftingSuccess: '炼器成功率',
                    serendipityRate: '奇遇触发率',
                    realmSuppression: '境界压制',
                    setBonus: '套装效果',
                    tribulationCost: '渡劫消耗',
                    sectContribution: '宗门贡献'
                };
                return `${targetNames[r.target] || r.target}${bonusText}`;
            }
            return '';
        }

        // ===== acquireConstitutionFromSerendipity =====
        function acquireConstitutionFromSerendipity(type) {
            if (gameState.constitutions.length >= 2) {
                // 超过2个体质，替换
                const weakest = findWeakestConstitution();
                if (weakest) {
                    gameState.constitutions = gameState.constitutions.filter(c => c.type !== weakest);
                    addLog('neutral', '体质替换', `由于体质数量已达上限，${weakest}被${type}替换！`);
                }
            }
            
            gameState.constitutions.push({
                type: type,
                active: true,
                acquiredAt: gameState.days
            });
            
            initializeConstitutionEffects();
            addLog('good', '获得体质', `恭喜！通过奇遇获得了${type}！效果：${CONSTITUTIONS[type].desc}`);
            updateDisplay();
            saveGame();
        }

        // ===== addLog =====
        function addLog(type, title, text) {
            gameState.eventLog.unshift({ type, title, text, day: gameState.days });
            if (gameState.eventLog.length > 50) {
                gameState.eventLog.pop();
            }
            // 存储历史（最多100条）
            if (!gameState.eventLogHistory) gameState.eventLogHistory = [];
            const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
            gameState.eventLogHistory.push({time, type, title, text, day: gameState.days});
            if (gameState.eventLogHistory.length > 100) gameState.eventLogHistory.shift();
            renderLog();
        }

        // ===== getQualityColor =====
        function getQualityColor(quality) {
            const colors = {
                common: '#ffffff',
                rare: '#64b5f6',
                precious: '#ba68c8',
                legendary: '#ffd700'
            };
            return colors[quality] || colors.common;
        }

        // ===== V32 灵根觉醒系统 =====

        // 灵根品质升级映射
        const SPIRIT_ROOT_AWAKENING_MAP = {
            '伪灵根': '下品灵根',
            '下品灵根': '中品灵根',
            '中品灵根': '上品灵根',
            '上品灵根': '天灵根',
            '天灵根': '混沌灵根',
            '混沌灵根': null  // 最高，无法继续觉醒
        };

        // 觉醒任务类型定义
        const AWAKENING_TASKS = {
            collect: {
                name: '收集天材地宝',
                description: '收集指定数量的觉醒材料',
                icon: '📦'
            },
            battle: {
                name: '击败守关者',
                description: '击败心魔试炼的守护者',
                icon: '⚔️'
            },
            cultivate: {
                name: '连续修炼',
                description: '在指定区域连续修炼N天',
                icon: '🧘'
            },
            quiz: {
                name: '悟道答题',
                description: '回答修仙知识问题',
                icon: '📚'
            }
        };

        // ===== checkSpiritRootAwakening =====
        function checkSpiritRootAwakening() {
            const sr = gameState.spiritRoot;
            const sra = gameState.spiritRootAwakening;

            // 已完成觉醒或已激活则不再触发
            if (sra.status === 'completed' || sra.status !== 'dormant') return;
            // 已完成觉醒的灵根不再触发
            if (sr.hasAwakened && sr.quality === sr.awakenedQuality) return;

            // 检查触发条件
            let canTrigger = false;

            // 条件1：境界达到化神（realm>=3）+ 连续修炼30天
            if (gameState.realm >= 3 && gameState.days - (sra.triggerDay || 0) >= 30) {
                canTrigger = true;
            }

            // 条件2：灵根共鸣度>=8
            if (sr.resonance >= 8) {
                canTrigger = true;
            }

            // 条件3：服用灵根觉醒丹（通过道具触发）
            // 条件4：特殊奇遇触发（在 serendipity 系统中设置）

            if (canTrigger && !sr.awakeningAvailable) {
                triggerSpiritRootAwakening();
            }
        }

        // ===== triggerSpiritRootAwakening =====
        function triggerSpiritRootAwakening() {
            const sr = gameState.spiritRoot;
            const sra = gameState.spiritRootAwakening;

            // 检查是否可以觉醒
            const nextQuality = SPIRIT_ROOT_AWAKENING_MAP[sr.quality];
            if (!nextQuality) {
                // 已达最高品质
                return;
            }

            sr.awakeningAvailable = true;
            sra.status = 'stage1';
            sra.stage = 1;
            sra.triggerDay = gameState.days;
            sra.tasks = [];
            sra.lastEventDay = gameState.days;
            sra.attempts = 0;

            // 生成任务
            generateAwakeningTasks();

            // 弹出觉醒界面
            showSpiritRootAwakeningUI();
        }

        // ===== generateAwakeningTasks =====
        function generateAwakeningTasks() {
            const sra = gameState.spiritRootAwakening;
            const sr = gameState.spiritRoot;

            // 根据灵根品质决定任务难度
            const qualityGrade = {
                '伪灵根': 0, '下品灵根': 1, '中品灵根': 2,
                '上品灵根': 3, '天灵根': 4, '混沌灵根': 5
            };
            const grade = qualityGrade[sr.quality] || 0;

            // 生成4个任务
            sra.tasks = [
                {
                    type: 'collect',
                    target: '灵根觉醒石',
                    targetCount: 3 + grade,
                    current: 0,
                    completed: false,
                    icon: '📦'
                },
                {
                    type: 'battle',
                    target: '心魔试炼·守关者',
                    targetCount: 1,
                    current: 0,
                    completed: false,
                    icon: '⚔️'
                },
                {
                    type: 'cultivate',
                    target: gameState.currentRealm === 'immortal' ? '仙灵谷' : '中州城',
                    targetCount: 3 + Math.floor(grade / 2),
                    current: 0,
                    completed: false,
                    icon: '🧘'
                },
                {
                    type: 'quiz',
                    target: '修仙基础知识',
                    targetCount: 3 + grade,
                    current: 0,
                    completed: false,
                    icon: '📚'
                }
            ];
        }

        // ===== showSpiritRootAwakeningUI =====
        function showSpiritRootAwakeningUI() {
            const sr = gameState.spiritRoot;
            const sra = gameState.spiritRootAwakening;
            const qualityData = SPIRIT_ROOT_QUALITIES[sr.quality];
            const nextQuality = SPIRIT_ROOT_AWAKENING_MAP[sr.quality];

            if (!nextQuality) {
                showToast('灵根已达最高品质，无需觉醒');
                return;
            }

            let taskHtml = sra.tasks.map((task, i) => {
                const taskDef = AWAKENING_TASKS[task.type];
                const progress = `${task.current}/${task.targetCount}`;
                const doneClass = task.completed ? ' style="color:#4caf50"' : '';
                return `
                    <div class="awakening-task" style="margin:8px 0;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px">
                        <div style="display:flex;align-items:center;gap:8px">
                            <span style="font-size:20px">${task.icon}</span>
                            <div style="flex:1">
                                <div${doneClass}>${taskDef.name}：${task.target}</div>
                                <div style="color:#aaa;font-size:12px">${taskDef.description}</div>
                            </div>
                            <div style="color:${task.completed ? '#4caf50' : '#ffd700'}">${progress}</div>
                        </div>
                        ${task.completed ? '<div style="color:#4caf50;margin-top:5px">✓ 已完成</div>' : ''}
                    </div>
                `;
            }).join('');

            const html = `
                <div style="text-align:center;padding:20px">
                    <div style="font-size:48px;margin-bottom:10px">🌟</div>
                    <div style="font-size:24px;color:#ffd700;margin-bottom:5px">灵根觉醒</div>
                    <div style="color:#aaa;margin-bottom:20px">${qualityData.icon} ${sr.quality} → ${nextQuality}</div>
                    <div style="background:linear-gradient(90deg,#1a1a2e 0%,#16213e 100%);padding:15px;border-radius:12px;margin-bottom:20px">
                        <div style="color:#ffd700;font-size:14px;margin-bottom:5px">觉醒进度</div>
                        <div style="font-size:12px;color:#aaa">完成全部任务后可进行觉醒试炼</div>
                    </div>
                    <div style="text-align:left;margin-bottom:20px">
                        ${taskHtml}
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center">
                        <button onclick="closeModal('modalNormal')" style="padding:10px 20px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer">稍后</button>
                        <button onclick="showAwakeningHelp()" style="padding:10px 20px;background:#2196f3;color:#fff;border:none;border-radius:6px;cursor:pointer">获取帮助</button>
                    </div>
                </div>
            `;

            const modal = document.getElementById('modalNormal');
            if (modal) {
                modal.innerHTML = html;
                modal.classList.remove('hidden');
            }
        }

        // ===== showAwakeningHelp =====
        function showAwakeningHelp() {
            const sra = gameState.spiritRootAwakening;
            const helpText = `
                <div style="padding:15px">
                    <div style="color:#ffd700;font-size:16px;margin-bottom:10px">📖 灵根觉醒帮助</div>
                    <div style="color:#aaa;font-size:13px;line-height:1.8">
                        <p><strong>收集任务</strong>：通过探索、奇遇或商店购买收集材料</p>
                        <p><strong>战斗任务</strong>：在心魔试炼中击败守关者</p>
                        <p><strong>修炼任务</strong>：在指定区域连续修炼达到天数要求</p>
                        <p><strong>答题任务</strong>：回答修仙问题，答对计入进度</p>
                        <p style="margin-top:10px">完成后进入试炼阶段，通过即可觉醒！</p>
                    </div>
                    <button onclick="closeModal('modalNormal')" style="margin-top:15px;padding:8px 20px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer">知道了</button>
                </div>
            `;
            const modal = document.getElementById('modalNormal');
            if (modal) {
                modal.innerHTML = helpText;
            }
        }

        // ===== updateAwakeningTaskProgress =====
        function updateAwakeningTaskProgress(type, target, amount = 1) {
            const sra = gameState.spiritRootAwakening;
            if (sra.status === 'completed' || sra.status === 'dormant') return;

            for (const task of sra.tasks) {
                if (task.type === type && task.target === target && !task.completed) {
                    task.current = Math.min(task.targetCount, task.current + amount);
                    if (task.current >= task.targetCount) {
                        task.completed = true;
                        addLog('good', '觉醒任务完成', `${AWAKENING_TASKS[type].name}：${target}`);
                    }
                    // 检查是否所有任务完成
                    if (sra.tasks.every(t => t.completed)) {
                        // 进入试炼阶段
                        sra.status = 'stage2';
                        sra.stage = 2;
                        showAwakeningTrial();
                    }
                    break;
                }
            }
        }

        // ===== showAwakeningTrial =====
        function showAwakeningTrial() {
            const sra = gameState.spiritRootAwakening;

            const html = `
                <div style="text-align:center;padding:20px">
                    <div style="font-size:48px;margin-bottom:10px">⚡</div>
                    <div style="font-size:24px;color:#e91e63;margin-bottom:15px">觉醒试炼</div>
                    <div style="color:#aaa;margin-bottom:20px">完成试炼即可突破灵根品质！</div>
                    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px">
                        <button onclick="startAwakeningTrial('heart_demon')" style="padding:12px;background:linear-gradient(135deg,#9c27b0,#673ab7);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px">
                            👹 心魔试炼（战斗类）
                        </button>
                        <button onclick="startAwakeningTrial('celestial_thunder')" style="padding:12px;background:linear-gradient(135deg,#3f51b5,#2196f3);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px">
                            ⚡ 天雷试炼（反应类）
                        </button>
                        <button onclick="startAwakeningTrial('enlightenment')" style="padding:12px;background:linear-gradient(135deg,#00695c,#009688);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px">
                            💫 悟道试炼（答题类）
                        </button>
                    </div>
                    <button onclick="closeModal('modalNormal')" style="padding:8px 20px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer">取消</button>
                </div>
            `;

            const modal = document.getElementById('modalNormal');
            if (modal) {
                modal.innerHTML = html;
                modal.classList.remove('hidden');
            }
        }

        // ===== startAwakeningTrial =====
        function startAwakeningTrial(trialType) {
            const sra = gameState.spiritRootAwakening;
            sra.trialType = trialType;
            sra.trialProgress = 0;
            sra.attempts = (sra.attempts || 0) + 1;

            if (trialType === 'heart_demon') {
                // 心魔试炼 - 简化为直接判定
                const chance = 0.5 + (gameState.spiritRoot.resonance / 20);
                if (Math.random() < chance) {
                    completeAwakeningTrial(true);
                } else {
                    failAwakeningTrial('心魔反噬');
                }
            } else if (trialType === 'celestial_thunder') {
                // 天雷试炼 - 简化为直接判定
                const chance = 0.4 + (gameState.mindset / 200);
                if (Math.random() < chance) {
                    completeAwakeningTrial(true);
                } else {
                    failAwakeningTrial('天雷过猛');
                }
            } else if (trialType === 'enlightenment') {
                // 悟道试炼 - 简化为直接判定
                const chance = 0.6 + (gameState.spiritRoot.resonance / 15);
                if (Math.random() < chance) {
                    completeAwakeningTrial(true);
                } else {
                    failAwakeningTrial('悟道不足');
                }
            }
        }

        // ===== completeAwakeningTrial =====
        function completeAwakeningTrial(success) {
            const sr = gameState.spiritRoot;
            const sra = gameState.spiritRootAwakening;
            const nextQuality = SPIRIT_ROOT_AWAKENING_MAP[sr.quality];

            if (!nextQuality) {
                showToast('灵根已达最高品质');
                return;
            }

            // 提升灵根品质
            sr.quality = nextQuality;
            sr.awakenedQuality = nextQuality;
            sr.hasAwakened = true;

            // 应用觉醒奖励
            sra.status = 'completed';
            sra.stage = 3;
            sra.rewards = {
                speedBonus: 0.2,
                bottleneckBonus: 0.15,
                tribulationBonus: 0.1
            };

            // 更新属性加成
            applySpiritRootAwakeningBonus();

            // 显示成功界面
            const html = `
                <div style="text-align:center;padding:30px">
                    <div style="font-size:64px;margin-bottom:15px">🌟✨🌟</div>
                    <div style="font-size:28px;color:#ffd700;margin-bottom:10px">灵根觉醒成功！</div>
                    <div style="color:#aaa;margin-bottom:20px">品质提升至 ${nextQuality}</div>
                    <div style="background:rgba(255,215,0,0.1);padding:15px;border-radius:12px;margin-bottom:20px">
                        <div style="color:#4caf50">🎁 觉醒奖励</div>
                        <div style="color:#fff;margin-top:8px">修炼速度 +20%</div>
                        <div style="color:#fff">突破瓶颈加成 +15%</div>
                        <div style="color:#fff">渡劫成功率 +10%</div>
                    </div>
                    <button onclick="closeModal('modalNormal');updateDisplay();" style="padding:12px 30px;background:#ffd700;color:#000;border:none;border-radius:8px;cursor:pointer;font-size:16px">确定</button>
                </div>
            `;

            const modal = document.getElementById('modalNormal');
            if (modal) {
                modal.innerHTML = html;
            }

            addLog('good', '灵根觉醒', `灵根品质提升至 ${nextQuality}！`);
        }

        // ===== failAwakeningTrial =====
        function failAwakeningTrial(reason) {
            const sra = gameState.spiritRootAwakening;

            const html = `
                <div style="text-align:center;padding:30px">
                    <div style="font-size:48px;margin-bottom:15px">💔</div>
                    <div style="font-size:22px;color:#f44336;margin-bottom:10px">觉醒失败</div>
                    <div style="color:#aaa;margin-bottom:20px">${reason}</div>
                    <div style="background:rgba(255,0,0,0.1);padding:15px;border-radius:8px;margin-bottom:20px">
                        <div style="color:#ffa500">可重新尝试试炼（已有 ${sra.attempts} 次尝试）</div>
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center">
                        <button onclick="sra.status='stage1';sra.tasks.forEach(t=>t.completed=false);sra.tasks.forEach(t=>t.current=0);generateAwakeningTasks();closeModal('modalNormal');showSpiritRootAwakeningUI();" style="padding:10px 20px;background:#2196f3;color:#fff;border:none;border-radius:6px;cursor:pointer">重置任务</button>
                        <button onclick="closeModal('modalNormal')" style="padding:10px 20px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer">稍后</button>
                    </div>
                </div>
            `;

            const modal = document.getElementById('modalNormal');
            if (modal) {
                modal.innerHTML = html;
            }
        }

        // ===== applySpiritRootAwakeningBonus =====
        function applySpiritRootAwakeningBonus() {
            const sra = gameState.spiritRootAwakening;
            if (!sra.rewards) return;

            // 增强修炼速度
            if (!gameState.activeEffects.spirit_root_awakening_speed) {
                gameState.activeEffects.spirit_root_awakening_speed = sra.rewards.speedBonus;
            } else {
                gameState.activeEffects.spirit_root_awakening_speed += sra.rewards.speedBonus * 0.5;
            }
        }

        // ===== triggerSpiritRootAwakeningFromItem =====
        function triggerSpiritRootAwakeningFromItem() {
            const sr = gameState.spiritRoot;
            const sra = gameState.spiritRootAwakening;

            if (sra.status !== 'dormant') {
                showToast('灵根正在觉醒中');
                return;
            }

            const nextQuality = SPIRIT_ROOT_AWAKENING_MAP[sr.quality];
            if (!nextQuality) {
                showToast('灵根已达最高品质');
                return;
            }

            triggerSpiritRootAwakening();
        }


// Auto-generated module: economy.js

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
// Auto-generated module: farming.js

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



// Auto-generated module: immortal.js

// ===== IMMORTAL_REALMS =====
const IMMORTAL_REALMS = {
    1: { name: '地仙境', icon: '🌱', description: '仙界最低境界，相当于凡界筑基~金丹', cultivationBase: 100 },
    2: { name: '天仙境', icon: '☁️', description: '中级仙人，相当于凡界元婴', cultivationBase: 200 },
    3: { name: '金仙境', icon: '⭐', description: '高级仙人，相当于凡界化神', cultivationBase: 400 },
    4: { name: '大罗金仙', icon: '🌟', description: '顶级强者，相当于凡界渡劫', cultivationBase: 800 },
    5: { name: '混元大罗', icon: '💫', description: '飞升目标，超越凡界一切', cultivationBase: 1600 }
};

// ===== SECRET_REALMS_IMMORTAL =====
const SECRET_REALMS_IMMORTAL = {
    '太虚遗迹': {
        type: 'ruins',
        realmRequired: 1,
        dangerLevel: 2,
        waves: 3,
        rewards: ['太虚仙法残卷', '上古丹药', '仙灵泉水'],
        npc: { type: 'guardian', name: '太虚守护者' }
    },
    '九天瑶池': {
        type: 'resource',
        realmRequired: 2,
        dangerLevel: 1,
        waves: 2,
        rewards: ['九天仙草', '瑶池圣水', '万年灵芝'],
        npc: { type: 'merchant', name: '瑶池仙子' }
    },
    '混沌战场': {
        type: 'combat',
        realmRequired: 3,
        dangerLevel: 4,
        waves: 4,
        rewards: ['混沌至宝', '神魔精血', '混沌丹'],
        boss: { name: '混沌魔神' }
    },
    '星辰海洋': {
        type: 'serendipity',
        realmRequired: 2,
        dangerLevel: 2,
        waves: 1,
        rewards: ['星辰精华', '星君传承'],
        special: true
    }
};

// ===== IMMORTAL_REGIONS =====
const IMMORTAL_REGIONS = {
    '仙灵谷': {
        realmRequired: 1,
        dangerLevel: 1,
        icon: '🌿',
        description: '新手区域，仙气充沛，适合初入仙界者',
        resources: ['仙草', '仙兽蛋'],
        color: '#4caf50'
    },
    '天庭': {
        realmRequired: 2,
        dangerLevel: 2,
        icon: '🏯',
        description: '仙界中心，天道法则汇聚之地',
        resources: ['天庭令牌', '仙官赐福'],
        color: '#ffd700'
    },
    '万妖山': {
        realmRequired: 2,
        dangerLevel: 2,
        icon: '🏔️',
        description: '妖修领地，妖族强者云集',
        resources: ['妖修功法', '妖族坐骑'],
        color: '#ff5722'
    },
    '神魔战场': {
        realmRequired: 3,
        dangerLevel: 4,
        icon: '⚔️',
        description: '上古神魔大战遗迹，蕴含无穷奥秘',
        resources: ['神魔装备', '混沌碎片'],
        color: '#9c27b0'
    },
    '三十三天': {
        realmRequired: 4,
        dangerLevel: 5,
        icon: '🔮',
        description: '极高危险区域，突破混元大罗的必经之地',
        resources: ['混沌碎片', '飞升道具'],
        color: '#e91e63'
    },
    '混沌海': {
        realmRequired: 5,
        dangerLevel: 5,
        icon: '🌀',
        description: '最终区域，传说中混元大罗的诞生之地',
        resources: ['混沌神石', '位面法则'],
        color: '#00bcd4'
    }
};

// ===== initializeImmortalState =====
function initializeImmortalState() {
    if (!gameState.immortal) {
        gameState.immortal = {
            realm: 1,
            spiritStones: 0,
            currentRegion: '仙灵谷',
            exploredRegions: ['仙灵谷'],
            cultivationProgress: 0,
            map: {
                '仙灵谷': { unlocked: true, explored: [] },
                '天庭': { unlocked: false, realmRequired: 2 },
                '万妖山': { unlocked: false, realmRequired: 2 },
                '神魔战场': { unlocked: false, realmRequired: 3 },
                '三十三天': { unlocked: false, realmRequired: 4 },
                '混沌海': { unlocked: false, realmRequired: 5 }
            },
            lastAerialCooldown: 0,
            lastFateTask: 0,
            fateTaskRefreshDay: 0,
            celestialCycleDay: 0,
            celestialCycleCompleted: false,
            // V34 仙界秘境探索系统
            secretRealm: {
                inSecretRealm: false,
                currentRealm: null,
                currentType: null,
                wave: 0,
                totalWaves: 0,
                enemies: [],
                rewards: [],
                npc: null,
                jade: 0,  // 仙玉
                tokens: 1,  // 秘境令牌（每日重置）
                lastTokenRefresh: 0,
                explored: []  // 已探索秘境记录
            }
        };
    }
    // V34 秘境令牌每日重置
    if (gameState.immortal && gameState.immortal.secretRealm) {
        const today = Math.floor(gameState.days / 10) * 10;  // 简化：每10天重置
        if (gameState.immortal.secretRealm.lastTokenRefresh < today) {
            gameState.immortal.secretRealm.tokens = 3;
            gameState.immortal.secretRealm.lastTokenRefresh = today;
        }
    }
    if (!gameState.mounts) gameState.mounts = [];
    if (!gameState.immortalSkills) gameState.immortalSkills = [];
    if (!gameState.immortalEquipment) {
        gameState.immortalEquipment = {
            head: null,
            body: null,
            foot: null,
            weapon: null,
            shield: null,
            accessory: null
        };
    }
    if (!gameState.currentRealm) gameState.currentRealm = 'mortal';
    if (gameState.currentMount === undefined) gameState.currentMount = null;
}

// ===== canEnterRegion =====
function canEnterRegion(region) {
    const req = IMMORTAL_REGIONS[region].realmRequired;
    return gameState.immortal.realm >= req;
}

// ===== doAerialTravel =====
function doAerialTravel(targetRegion) {
    if (!gameState.immortal || gameState.immortal.currentRegion === targetRegion) return;
    
    const cooldown = getAerialCooldown();
    const timeSinceLast = Date.now() - gameState.immortal.lastAerialCooldown;
    
    if (timeSinceLast < cooldown) {
        const remaining = Math.ceil((cooldown - timeSinceLast) / 1000);
        showToast(`御空术冷却中，还需${remaining}秒`);
        return;
    }
    
    if (!canEnterRegion(targetRegion)) {
        showToast('境界不足，无法进入该区域');
        return;
    }
    
    gameState.immortal.currentRegion = targetRegion;
    gameState.immortal.lastAerialCooldown = Date.now();
    
    // 添加到已探索
    if (!gameState.immortal.exploredRegions.includes(targetRegion)) {
        gameState.immortal.exploredRegions.push(targetRegion);
    }
    
    // 触发区域事件
    triggerRegionEvent(targetRegion);
    saveGame();
    updateDisplay();
    
    // 更新UI
    if (typeof renderImmortalUI === 'function') renderImmortalUI();
}

// ===== getAerialCooldown =====
function getAerialCooldown() {
    const baseCooldown = 10000; // 10秒基础冷却
    const mountBonus = getMountSpeedBonus();
    return Math.max(1000, baseCooldown * (1 - mountBonus));
}

// ===== getMountSpeedBonus =====
function getMountSpeedBonus() {
    const mount = gameState.currentMount;
    if (!mount) return 0;
    // 成熟度越高加速越多
    return (mount.maturity / 100) * (mount.stats.speed / 100) * 0.5;
}

// ===== triggerRegionEvent =====
function triggerRegionEvent(region) {
    const rand = Math.random();
    if (rand < 0.3) {
        // 30%概率触发仙缘任务
        if (gameState.immortal.currentRegion !== '天庭') {
            showToast(`在${region}遇到神秘机缘...`);
        }
    }
}

// ===== earnSpiritStones =====
function earnSpiritStones(amount, source) {
    gameState.immortal.spiritStones += amount;
    addLog('good', '获得仙石', `获得 ${amount} 仙石（${source}）`);
    saveGame();
    updateDisplay();
}

// ===== spendSpiritStones =====
function spendSpiritStones(amount, reason) {
    if (gameState.immortal.spiritStones < amount) {
        showToast('仙石不足');
        return false;
    }
    gameState.immortal.spiritStones -= amount;
    saveGame();
    return true;
}

// ===== doImmortalCultivation =====
function doImmortalCultivation() {
    const realm = gameState.immortal.realm;
    const realmData = IMMORTAL_REALMS[realm];
    let baseGain = realmData.cultivationBase * (1 + Math.random() * 0.5);
    
    // 应用装备加成
    baseGain *= (1 + getImmortalEquipBonus());
    
    // 应用仙兽加成
    if (gameState.currentMount) {
        baseGain *= (1 + gameState.currentMount.stats.speed / 200);
    }
    
    const gain = Math.floor(baseGain);
    gameState.immortal.cultivationProgress += gain;
    
    // 检查境界突破
    const nextRealm = realm + 1;
    if (nextRealm <= 5 && gameState.immortal.cultivationProgress >= realmData.cultivationBase * 10) {
        gameState.immortal.realm = nextRealm;
        gameState.immortal.cultivationProgress = 0;
        // 解锁新区域
        unlockRegionForRealm(nextRealm);
        addLog('good', '境界突破', `突破到${IMMORTAL_REALMS[nextRealm].name}！`);
        showToast(`恭喜突破到${IMMORTAL_REALMS[nextRealm].name}！`);
    } else {
        addLog('neutral', '仙气修炼', `修炼${gain}点仙气，感觉体内的仙力更加充沛。`);
    }
    
    gameState.days++;
    saveGame();
    updateDisplay();
}

// ===== unlockRegionForRealm =====
function unlockRegionForRealm(realm) {
    for (const region in gameState.immortal.map) {
        if (gameState.immortal.map[region].realmRequired === realm) {
            gameState.immortal.map[region].unlocked = true;
        }
    }
}

// ===== getImmortalEquipBonus =====
function getImmortalEquipBonus() {
    let bonus = 0;
    const equip = gameState.immortalEquipment;
    for (const slot in equip) {
        if (equip[slot]) {
            bonus += equip[slot].quality * 0.1;
        }
    }
    return bonus;
}

// ===== showImmortalMap =====
function showImmortalMap() {
    let html = '<div style="padding:16px;">';
    html += '<h3 style="color:#ffd700;text-align:center;margin-bottom:16px;">☁️ 仙界地图 ☁️</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">';
    
    for (const region in IMMORTAL_REGIONS) {
        const data = IMMORTAL_REGIONS[region];
        const isUnlocked = canEnterRegion(region);
        const isCurrent = gameState.immortal.currentRegion === region;
        const isExplored = gameState.immortal.exploredRegions.includes(region);
        
        let style = 'padding:12px;border-radius:8px;text-align:center;cursor:pointer;';
        style += isUnlocked ? `background:${data.color}33;border:2px solid ${data.color};` : 'background:#333;border:2px solid #555;';
        style += isCurrent ? 'box-shadow:0 0 15px #ffd700;' : '';
        
        html += `<div style="${style}" onclick="${isUnlocked ? `doAerialTravel('${region}')` : ''}">`;
        html += `<div style="font-size:24px;">${data.icon}</div>`;
        html += `<div style="color:${isUnlocked ? '#fff' : '#666'};font-weight:bold;">${region}</div>`;
        html += `<div style="font-size:11px;color:${isUnlocked ? '#aaa' : '#444'};">需要${data.realmRequired}重天</div>`;
        html += isCurrent ? '<div style="color:#ffd700;font-size:11px;">当前位置</div>' : '';
        html += '</div>';
    }
    
    html += '</div></div>';
    
    // 冷却显示
    const cooldown = getAerialCooldown();
    const timeSinceLast = Date.now() - gameState.immortal.lastAerialCooldown;
    const remaining = Math.max(0, cooldown - timeSinceLast);
    
    html += `<div style="text-align:center;margin-top:16px;padding:10px;background:#1a1a2e;border-radius:8px;">`;
    html += `<div style="color:#aaa;font-size:12px;">御空术冷却: ${Math.ceil(remaining / 1000)}秒</div>`;
    if (gameState.currentMount) {
        html += `<div style="color:#4caf50;font-size:12px;">🐎 骑乘${gameState.currentMount.name}，冷却缩短50%</div>`;
    }
    html += '</div>';
    
    openModal('仙界地图', html, '');
}

// ===== getImmortalDailyIncome =====
function getImmortalDailyIncome() {
    if (gameState.currentRealm !== 'immortal') return { qi: 0, stones: 0 };
    const regionData = IMMORTAL_REGIONS[gameState.immortal.currentRegion];
    const realmData = IMMORTAL_REALMS[gameState.immortal.realm];
    const baseQi = realmData.cultivationBase * 0.1;
    const regionBonus = (regionData.dangerLevel || 1) * 0.05;
    const blessingBonus = gameState.celestialCycle.blessingActive ? 0.2 : 0;
    return {
        qi: Math.floor(baseQi * (1 + regionBonus + blessingBonus)),
        stones: Math.floor((regionData.dangerLevel || 1) * 10 * Math.random())
    };
}

// ===== processCelestialCycle =====
function processCelestialCycle() {
    if (gameState.currentRealm !== 'immortal') return;
    
    const cc = gameState.celestialCycle;
    const interval = cc.cycleInterval || 3;
    
    // 每日仙界修炼结算（自动主路径）
    const income = getImmortalDailyIncome();
    const spiritRootBonus = 1 + (getSpiritRootCultivationBonus ? getSpiritRootCultivationBonus() : 0);
    const progressGain = Math.floor(income.qi * spiritRootBonus);
    
    // 更新修炼进度
    if (gameState.immortal) {
        gameState.immortal.cultivationProgress += progressGain;
        gameState.immortal.spiritStones += income.stones;
        
        // 检查境界突破
        const realmData = IMMORTAL_REALMS[gameState.immortal.realm];
        if (realmData && gameState.immortal.cultivationProgress >= realmData.cultivationBase * 10) {
            const nextRealm = gameState.immortal.realm + 1;
            if (nextRealm <= 5) {
                gameState.immortal.realm = nextRealm;
                gameState.immortal.cultivationProgress = 0;
                addLog('good', '境界突破', `天道轮回中，突破至${IMMORTAL_REALMS[nextRealm].name}！`);
            }
        }
    }
    
    // 天道轮回日结算
    cc.day++;
    if (cc.day >= interval && !cc.completed) {
        executeCelestialCycle();
        cc.day = 0;
        cc.completed = true;
    }
    
    // 新周期开始
    if (cc.day === 0) {
        cc.completed = false;
    }
}

// ===== executeCelestialCycle =====
function executeCelestialCycle() {
    if (gameState.currentRealm !== 'immortal') return;
    
    const realmData = IMMORTAL_REALMS[gameState.immortal.realm];
    const regionData = IMMORTAL_REGIONS[gameState.immortal.currentRegion];
    
    // 主路径：修炼结算
    let resultText = `【天道轮回·第${gameState.days}天】\n`;
    let eventType = 'neutral';
    let effects = { qi: 0, stones: 0, mindset: 0 };
    
    const baseProgress = realmData.cultivationBase;
    const spiritRootBonus = 1 + (getSpiritRootCultivationBonus ? getSpiritRootCultivationBonus() : 0);
    const regionBonus = (regionData.dangerLevel || 1) * 0.1;
    const progressGain = Math.floor(baseProgress * (1 + regionBonus) * spiritRootBonus);
    
    if (gameState.immortal) {
        gameState.immortal.cultivationProgress += progressGain;
    }
    resultText += `修炼进度 +${progressGain}\n`;
    effects.qi = progressGain;
    
    // 次路径：气运波动触发器
    const roll = Math.random();
    const blessingBonus = gameState.celestialCycle.blessingActive ? 0.15 : 0;
    
    if (roll < 0.4 + blessingBonus) {
        // 正面事件 40%
        eventType = 'positive';
        const positiveEvents = [
            { text: '✨ 顿悟时刻', effect: () => { 
                if (gameState.immortal) gameState.immortal.cultivationProgress += Math.floor(progressGain * 0.5);
                effects.qi += Math.floor(progressGain * 0.5);
                return '修炼进度额外 +50%';
            }},
            { text: '🌟 天赐灵物', effect: () => {
                const stoneGain = Math.floor(500 * Math.random()) + 100;
                if (gameState.immortal) gameState.immortal.spiritStones += stoneGain;
                effects.stones = stoneGain;
                return `获得 ${stoneGain} 灵石`;
            }},
            { text: '☁️ 祥瑞降临', effect: () => {
                effects.mindset = 10;
                return '心态 +10';
            }}
        ];
        const event = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
        resultText += event.text + '：' + event.effect() + '\n';
        
    } else if (roll < 0.7 + blessingBonus) {
        // 负面事件 30%
        eventType = 'negative';
        const negativeEvents = [
            { text: '👹 心魔入侵', effect: () => {
                effects.mindset = -20;
                return '心态 -20，修炼受阻';
            }},
            { text: '⚡ 天道压制', effect: () => {
                effects.qi = -Math.floor(progressGain * 0.3);
                if (gameState.immortal) gameState.immortal.cultivationProgress -= Math.floor(progressGain * 0.3);
                return '当日修炼效率 -30%';
            }},
            { text: '💔 灵气紊乱', effect: () => {
                const stoneLoss = Math.floor((gameState.immortal?.spiritStones || 0) * 0.05);
                if (gameState.immortal && stoneLoss > 0) gameState.immortal.spiritStones -= stoneLoss;
                effects.stones = -stoneLoss;
                return `损失 ${stoneLoss} 灵石`;
            }}
        ];
        const event = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
        resultText += event.text + '：' + event.effect() + '\n';
        
    } else {
        // 中性事件 30%
        eventType = 'neutral';
        const neutralEvents = [
            { text: '🧙 仙人指路', effect: () => {
                return '天道启示：继续保持当前修炼节奏';
            }},
            { text: '🔮 奇遇发现', effect: () => {
                // 解锁新区域线索
                return '隐约感知到未知区域的召唤';
            }},
            { text: '⏳ 平静期', effect: () => {
                return '天道运行平稳，无特殊事件';
            }}
        ];
        const event = neutralEvents[Math.floor(Math.random() * neutralEvents.length)];
        resultText += event.text + '：' + event.effect() + '\n';
    }
    
    // 清除祈福状态
    gameState.celestialCycle.blessingActive = false;
    
    // 保存结果
    const result = { type: eventType, text: resultText, effects: effects, day: gameState.days };
    gameState.celestialCycle.lastResult = result;
    
    showCelestialCycleResult(result);
    
    addLog(eventType === 'positive' ? 'good' : eventType === 'negative' ? 'bad' : 'normal', 
           '天道轮回', resultText.replace(/\n/g, ' '));
}

// ===== showCelestialCycleResult =====
function showCelestialCycleResult(result) {
    const icon = result.type === 'positive' ? '🌟' : result.type === 'negative' ? '💥' : '🔮';
    const color = result.type === 'positive' ? '#4caf50' : result.type === 'negative' ? '#f44336' : '#2196f3';
    
    const modal = document.getElementById('modalNormal');
    if (!modal) return;
    
    let effectsText = '';
    if (result.effects.qi !== 0) effectsText += ` 灵气 ${result.effects.qi > 0 ? '+' : ''}${result.effects.qi}`;
    if (result.effects.stones !== 0) effectsText += ` 灵石 ${result.effects.stones > 0 ? '+' : ''}${result.effects.stones}`;
    if (result.effects.mindset !== 0) effectsText += ` 心态 ${result.effects.mindset > 0 ? '+' : ''}${result.effects.mindset}`;
    
    modal.innerHTML = `
        <div class="result-title" style="color:${color}">${icon} 天道轮回结算 ${icon}</div>
        <div style="margin:15px 0;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;text-align:left">
            ${result.text.replace(/\n/g, '<br/>')}
        </div>
        <div style="color:#aaa;font-size:12px">${effectsText}</div>
        <div style="margin-top:15px">
            <button onclick="closeModal('modalNormal')" style="padding:8px 20px;background:#444;color:#fff;border:none;border-radius:4px;cursor:pointer">确定</button>
        </div>
    `;
    modal.classList.remove('hidden');
}

// ===== requestExtraCycle =====
function requestExtraCycle() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('只有在仙界才能请求天道轮回');
        return;
    }
    const cost = 100;
    if ((gameState.immortal?.spiritStones || 0) < cost) {
        showToast(`需要 ${cost} 灵石请求额外轮回`);
        return;
    }
    if (gameState.immortal) {
        gameState.immortal.spiritStones -= cost;
    }
    gameState.celestialCycle.day = gameState.celestialCycle.cycleInterval || 3;
    showToast(`消耗 ${cost} 灵石，请求天道轮回`);
    addLog('normal', '主动干预', `消耗 ${cost} 灵石请求额外天道轮回`);
}

// ===== requestFortuneBlessing =====
function requestFortuneBlessing() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('只有在仙界才能进行气运祈福');
        return;
    }
    const cost = 200;
    if ((gameState.immortal?.spiritStones || 0) < cost) {
        showToast(`需要 ${cost} 灵石进行气运祈福`);
        return;
    }
    if (gameState.immortal) {
        gameState.immortal.spiritStones -= cost;
    }
    gameState.celestialCycle.blessingActive = true;
    showToast(`消耗 ${cost} 灵石，气运祈福生效（下次轮回正面事件概率+15%）`);
    addLog('good', '气运祈福', `消耗 ${cost} 灵石，下次轮回将获得更好气运`);
}

// ===== V34 仙界秘境探索系统 =====

// ===== canEnterSecretRealm =====
function canEnterSecretRealm(realmName) {
    const realm = SECRET_REALMS_IMMORTAL[realmName];
    if (!realm) return { result: false, reason: '秘境不存在' };
    if (gameState.immortal.realm < realm.realmRequired) {
        return { result: false, reason: `需要${IMMORTAL_REALMS[realm.realmRequired].name}才能进入` };
    }
    if (!gameState.immortal.secretRealm || gameState.immortal.secretRealm.tokens <= 0) {
        return { result: false, reason: '秘境令牌不足' };
    }
    return { result: true };
}

// ===== enterSecretRealm =====
function enterSecretRealm(realmName) {
    const check = canEnterSecretRealm(realmName);
    if (!check.result) {
        showToast(check.reason);
        return;
    }
    
    const realm = SECRET_REALMS_IMMORTAL[realmName];
    gameState.immortal.secretRealm.tokens--;
    gameState.immortal.secretRealm.inSecretRealm = true;
    gameState.immortal.secretRealm.currentRealm = realmName;
    gameState.immortal.secretRealm.currentType = realm.type;
    gameState.immortal.secretRealm.wave = 0;
    gameState.immortal.secretRealm.totalWaves = realm.waves;
    gameState.immortal.secretRealm.enemies = [];
    gameState.immortal.secretRealm.rewards = [];
    gameState.immortal.secretRealm.npc = realm.npc ? { ...realm.npc } : null;
    
    showToast(`进入【${realmName}】`);
    renderSecretRealmUI();
}

// ===== renderSecretRealmUI =====
function renderSecretRealmUI() {
    const sr = gameState.immortal.secretRealm;
    if (!sr || !sr.inSecretRealm) return;
    
    const realm = SECRET_REALMS_IMMORTAL[sr.currentRealm];
    const typeIcons = { ruins: '🏛️', resource: '🌿', combat: '⚔️', serendipity: '✨' };
    const typeNames = { ruins: '遗迹秘境', resource: '资源秘境', combat: '战斗秘境', serendipity: '奇遇秘境' };
    
    let content = `
        <div style="padding:20px;color:#fff">
            <div style="text-align:center;margin-bottom:20px">
                <div style="font-size:24px">${typeIcons[realm.type] || '🏛️'} ${sr.currentRealm}</div>
                <div style="color:#aaa;font-size:12px">${typeNames[realm.type]} - 第${sr.wave}/${sr.totalWaves}波</div>
            </div>
    `;
    
    // 类型特定UI
    if (realm.type === 'resource') {
        content += `
            <div style="background:rgba(76,175,80,0.2);padding:15px;border-radius:8px;margin-bottom:15px">
                <div style="color:#4caf50;font-size:14px">🌿 资源秘境 - 收集仙草和灵材</div>
            </div>
            <button onclick="collectResource()" style="width:100%;padding:12px;background:linear-gradient(135deg,#4caf50,#2e7d32);color:white;border:none;border-radius:8px;cursor:pointer;margin-bottom:10px">采集资源</button>
        `;
    } else if (realm.type === 'ruins') {
        content += `
            <div style="background:rgba(156,39,176,0.2);padding:15px;border-radius:8px;margin-bottom:15px">
                <div style="color:#9c27b0;font-size:14px">🏛️ 遗迹秘境 - 探索上古仙人洞府</div>
                ${sr.npc && sr.npc.type === 'guardian' ? `<div style="color:#ff5722;margin-top:8px">⚠️ 守护者: ${sr.npc.name}</div>` : ''}
            </div>
            <button onclick="exploreRuins()" style="width:100%;padding:12px;background:linear-gradient(135deg,#9c27b0,#7b1fa2);color:white;border:none;border-radius:8px;cursor:pointer;margin-bottom:10px">探索遗迹</button>
        `;
    } else if (realm.type === 'combat') {
        content += `
            <div style="background:rgba(244,67,54,0.2);padding:15px;border-radius:8px;margin-bottom:15px">
                <div style="color:#f44336;font-size:14px">⚔️ 战斗秘境 - 击败守护者获取混沌至宝</div>
                ${realm.boss ? `<div style="color:#ff5722;margin-top:8px">💀 Boss: ${realm.boss.name}</div>` : ''}
            </div>
            <button onclick="fightSecretRealmBoss()" style="width:100%;padding:12px;background:linear-gradient(135deg,#f44336,#c62828);color:white;border:none;border-radius:8px;cursor:pointer;margin-bottom:10px">挑战Boss</button>
        `;
    } else if (realm.type === 'serendipity') {
        content += `
            <div style="background:rgba(255,215,0,0.2);padding:15px;border-radius:8px;margin-bottom:15px">
                <div style="color:#ffd700;font-size:14px">✨ 奇遇秘境 - 随机触发特殊事件</div>
            </div>
            <button onclick="triggerSerendipityEvent()" style="width:100%;padding:12px;background:linear-gradient(135deg,#ffd700,#ff9800);color:#333;border:none;border-radius:8px;cursor:pointer;margin-bottom:10px">触发奇遇</button>
        `;
    }
    
    // 奖励展示
    if (sr.rewards.length > 0) {
        content += `
            <div style="margin-top:15px">
                <div style="color:#ffd700;margin-bottom:8px">已获得奖励:</div>
                ${sr.rewards.map(r => `<div style="color:#4caf50;font-size:12px">✧ ${r}</div>`).join('')}
            </div>
        `;
    }
    
    content += `
            <button onclick="exitSecretRealm()" style="width:100%;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;margin-top:15px">返回仙界</button>
        </div>
    `;
    
    openModal('秘境探索', content, '');
}

// ===== collectResource =====
function collectResource() {
    const sr = gameState.immortal.secretRealm;
    if (!sr.inSecretRealm) return;
    
    sr.wave++;
    const realm = SECRET_REALMS_IMMORTAL[sr.currentRealm];
    const reward = realm.rewards[Math.floor(Math.random() * realm.rewards.length)];
    sr.rewards.push(reward);
    
    showToast(`获得: ${reward}`);
    addLog('good', '秘境收获', `在${sr.currentRealm}获得${reward}`);
    
    if (sr.wave >= sr.totalWaves) {
        completeImmortalSecretRealm();
    } else {
        renderSecretRealmUI();
    }
}

// ===== exploreRuins =====
function exploreRuins() {
    const sr = gameState.immortal.secretRealm;
    if (!sr.inSecretRealm) return;
    
    sr.wave++;
    const realm = SECRET_REALMS_IMMORTAL[sr.currentRealm];
    
    // 遗迹探索可能遇到敌人或奖励
    if (Math.random() < 0.4 && sr.wave < sr.totalWaves) {
        // 遇到守护者战斗
        showToast(`遭遇${sr.npc?.name || '守护者'}！`);
        startImmortalRealmBattle(sr.npc);
    } else {
        // 获得奖励
        const reward = realm.rewards[Math.floor(Math.random() * realm.rewards.length)];
        sr.rewards.push(reward);
        showToast(`探索获得: ${reward}`);
        addLog('good', '秘境收获', `在${sr.currentRealm}探索获得${reward}`);
        
        if (sr.wave >= sr.totalWaves) {
            completeImmortalSecretRealm();
        } else {
            renderSecretRealmUI();
        }
    }
}

// ===== fightSecretRealmBoss =====
function fightSecretRealmBoss() {
    const sr = gameState.immortal.secretRealm;
    if (!sr.inSecretRealm) return;
    
    const realm = SECRET_REALMS_IMMORTAL[sr.currentRealm];
    const bossName = realm.boss?.name || '秘境守卫';
    const bossHP = 5000 + (gameState.immortal.realm * 2000);
    
    showToast(`挑战 ${bossName}！`);
    startImmortalRealmBattle({ name: bossName, hp: bossHP, maxHP: bossHP });
}

// ===== startImmortalRealmBattle =====
function startImmortalRealmBattle(enemy) {
    const sr = gameState.immortal.secretRealm;
    
    // 使用通用战斗系统
    const playerMaxHP = gameState.maxHP || 1000;
    const playerAttack = gameState.attack || 100;
    const playerDefense = gameState.defense || 50;
    
    combatState.inProgress = true;
    combatState.player = {
        hp: playerMaxHP,
        maxHP: playerMaxHP,
        attack: playerAttack,
        defense: playerDefense,
        technique: gameState.technique || '金刚诀'
    };
    combatState.opponent = {
        name: enemy.name || '秘境守卫',
        hp: enemy.hp || 3000,
        maxHP: enemy.maxHP || enemy.hp || 3000,
        attack: 80 + (gameState.immortal?.realm || 1) * 30,
        defense: 40 + (gameState.immortal?.realm || 1) * 15,
        technique: '混沌诀',
        critRate: 0.1,
        level: 1
    };
    combatState.round = 0;
    combatState.turn = 'player';
    combatState.log = [];
    combatState.effects = {
        player: { attacking: false, defending: false, attackBoost: 0, defenseBoost: 0 },
        opponent: { attacking: false, defending: false, attackBoost: 0, defenseBoost: 0 }
    };
    
    // 设置战斗结束回调
    window.secretRealmBattleEnd = function(result) {
        if (result === 'win') {
            const realm = SECRET_REALMS_IMMORTAL[sr.currentRealm];
            const reward = realm.rewards[Math.floor(Math.random() * realm.rewards.length)];
            sr.rewards.push(reward);
            showToast(`战斗胜利！获得: ${reward}`);
            addLog('good', '秘境战斗', `在${sr.currentRealm}击败${enemy.name}获得${reward}`);
            
            sr.wave++;
            if (sr.wave >= sr.totalWaves) {
                completeImmortalSecretRealm();
            } else {
                renderSecretRealmUI();
            }
        } else {
            showToast('战斗失败，秘境探索结束');
            exitSecretRealm();
        }
        delete window.secretRealmBattleEnd;
    };
    
    renderCombatArena();
}

// ===== triggerSerendipityEvent =====
function triggerSerendipityEvent() {
    const sr = gameState.immortal.secretRealm;
    if (!sr.inSecretRealm) return;
    
    const events = [
        { type: 'epiphany', text: '💡 顿悟！境界提升！', effect: () => { gameState.immortal.realm = Math.min(5, gameState.immortal.realm + 1); } },
        { type: 'treasure', text: '💎 发现上古宝藏！', effect: () => { sr.rewards.push('上古宝藏'); } },
        { type: 'technique', text: '📜 获得仙人传承！', effect: () => { sr.rewards.push('星君传承'); } },
        { type: 'jade', text: '💰 发现仙玉矿脉！', effect: () => { sr.rewards.push('仙玉x100'); } }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
    
    showToast(event.text);
    addLog('good', '奇遇秘境', `${event.text} - ${sr.currentRealm}`);
    
    completeImmortalSecretRealm();
}

// ===== completeImmortalSecretRealm =====
function completeImmortalSecretRealm() {
    const sr = gameState.immortal.secretRealm;
    
    showToast(`秘境探索完成！获得${sr.rewards.length}个奖励`);
    addLog('good', '秘境完成', `完成${sr.currentRealm}，获得: ${sr.rewards.join(', ')}`);
    
    // 添加探索记录
    if (!sr.explored) sr.explored = [];
    if (!sr.explored.includes(sr.currentRealm)) {
        sr.explored.push(sr.currentRealm);
    }
    
    setTimeout(() => exitSecretRealm(), 1500);
}

// ===== exitSecretRealm =====
function exitSecretRealm() {
    const sr = gameState.immortal.secretRealm;
    const rewards = [...(sr.rewards || [])];
    
    sr.inSecretRealm = false;
    sr.currentRealm = null;
    sr.currentType = null;
    sr.wave = 0;
    sr.enemies = [];
    sr.npc = null;
    
    closeModal('modalNormal');
    showToast(`秘境奖励: ${rewards.length > 0 ? rewards.join(', ') : '无'}`);
    renderImmortalUI();
}

// ===== renderImmortalUI =====
function renderImmortalUI() {
    if (gameState.currentRealm !== 'immortal') return;
    
    // 更新仙界状态显示
    const realmData = IMMORTAL_REALMS[gameState.immortal.realm];
    const regionData = IMMORTAL_REGIONS[gameState.immortal.currentRegion];
    
    // 更新境界显示
    const realmDisplay = document.getElementById('immortalRealmDisplay');
    if (realmDisplay) {
        realmDisplay.innerHTML = `${realmData.icon} ${realmData.name}`;
    }
    
    // 更新仙石显示
    const stoneDisplay = document.getElementById('immortalStoneDisplay');
    if (stoneDisplay) {
        stoneDisplay.textContent = `💎 ${gameState.immortal.spiritStones}`;
    }
    
    // 更新区域显示
    const regionDisplay = document.getElementById('immortalRegionDisplay');
    if (regionDisplay) {
        regionDisplay.innerHTML = `${regionData.icon} ${gameState.immortal.currentRegion}`;
    }
    
    // V34 添加秘境探索入口
    const secretBtn = document.getElementById('secretRealmBtn');
    if (secretBtn && gameState.immortal.secretRealm) {
        secretBtn.textContent = `🏛️ 秘境探索 (令牌:${gameState.immortal.secretRealm.tokens})`;
    }
}

// ===== V34 renderSecretRealmList =====
function renderSecretRealmList() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('只有在仙界才能进行秘境探索');
        return;
    }
    
    const sr = gameState.immortal.secretRealm;
    let content = `
        <div style="padding:20px;color:#fff">
            <div style="text-align:center;margin-bottom:20px">
                <div style="font-size:20px;color:#ffd700">🏛️ 仙界秘境</div>
                <div style="color:#aaa;font-size:12px">秘境令牌: ${sr?.tokens || 0}</div>
            </div>
    `;
    
    // 列出所有秘境
    for (const [name, realm] of Object.entries(SECRET_REALMS_IMMORTAL)) {
        const canEnter = gameState.immortal.realm >= realm.realmRequired;
        const typeIcons = { ruins: '🏛️', resource: '🌿', combat: '⚔️', serendipity: '✨' };
        const typeNames = { ruins: '遗迹', resource: '资源', combat: '战斗', serendipity: '奇遇' };
        
        content += `
            <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-bottom:10px;${!canEnter ? 'opacity:0.5' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-size:16px">${typeIcons[realm.type]} ${name}</div>
                        <div style="color:#aaa;font-size:11px">${typeNames[realm.type]} | 危险${'⚠️'.repeat(realm.dangerLevel)} | 需要: ${IMMORTAL_REALMS[realm.realmRequired]?.name || '未知'}</div>
                    </div>
                    ${canEnter ? `<button onclick="enterSecretRealm('${name}')" style="padding:6px 12px;background:#4caf50;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px">进入</button>` : '<span style="color:#f44336;font-size:11px">境界不足</span>'}
                </div>
            </div>
        `;
    }
    
    content += `
            <button onclick="closeModal('modalNormal')" style="width:100%;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;margin-top:10px">返回</button>
        </div>
    `;
    
    openModal('秘境探索', content, '');
}

// Auto-generated module: immortalEquip.js

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

// Auto-generated module: immortalSkill.js

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

// Auto-generated module: init.js

        // ===== init =====
        function init() {
            loadMiniMaxConfig();
            updateDisplay();
        }

        // ===== loadMiniMaxConfig =====
        function loadMiniMaxConfig() {
            const saved = localStorage.getItem(CONFIG.miniMaxConfigKey);
            if (saved) {
                try {
                    miniMaxConfig = JSON.parse(saved);
                    // 确保features结构完整
                    if (!miniMaxConfig.features) {
                        miniMaxConfig.features = { ...DEFAULT_MINIMAX_CONFIG.features };
                    }
                } catch (e) {
                    miniMaxConfig = { ...DEFAULT_MINIMAX_CONFIG };
                }
            }
        }

        // ===== startNewGame =====
        function startNewGame() {
            gameState = {
                realm: 0,
                stage: 0,
                qi: 20,
                maxQi: 100,
                spiritStones: 50,
                mindset: 50,
                days: 1,
                cultivationProgress: 0,
                eventLog: [],
                isGameOver: false,
                isVictory: false,
                inventory: [],
                equippedTreasures: [null, null, null],
                maxInventorySlots: 20,
                shopItems: [],
                lastShopDay: 0,
                shopRefreshCount: 0, // 经济调整：商店刷新次数计数器，用于递增刷新费用
                activeEffects: {
                    breakthrough_boost: 0,
                    cultivate_speed: 0,
                    渡劫_mindset_protect: 0,
                    attack: 0,
                    defense: 0,
                    cultivate_qi_rate: 0,
                    渡劫_damage_reduce: 0,
                    escape: 0,
                    foresee_event: 0,
                    all_stats: 0
                },
                tribulation: {
                    inProgress: false,
                    currentStage: 0,
                    totalStages: 9,
                    currentType: null,
                    preparations: [],
                    damageTaken: 0,
                    tribKey: null
                },
                hasTransmigrationBuff: false,
                tribulationRecord: [],
                combat: {
                    wins: 0,
                    losses: 0,
                    honor: 0,
                    fame: 0,
                    battleHistory: [],
                    injured: false,
                    injuryEndDay: 0
                },
                sect: {
                    name: null,
                    level: 0,
                    spiritStones: 0,
                    disciples: [],
                    elders: [],
                    buildings: {
                        library: false,
                        alchemy: false,
                        forge: false,
                        archive: false
                    },
                    techniques: [],
                    contributionShop: [],
                    lastShopRefresh: 0,
                    lastResourceCollection: 0,
                    // V29 NPC AI系统
                    npcDialogueHistory: [],
                    npcTasks: [],
                    npcLastActions: {},
                    // V30 渡劫审批系统
                    tribulationRequest: {
                        status: 'none',
                        elderScore: 0,
                        elderComment: '',
                        leaderDecision: '',
                        leaderComment: '',
                        buffApplied: false,
                        submitDay: 0
                    },
                    // V31 天道轮回系统
                    celestialCycle: {
                        day: 0,
                        completed: false,
                        lastResult: null,
                        blessingActive: false,
                        cycleInterval: 3
                    },
                    // V35 宗门任务链
                    sectMissions: [],
                    sectMissionCooldown: 0,
                    lastMissionRefreshDay: 0,
                    // V36 装备打造增强
                    equipmentForgeCount: 0,
                    lastForgeDay: 0,
                    // V37 天道法则系统
                    celestialLaws: {
                        comprehended: [], active: [], comprehending: null,
                        comprehendingProgress: 0, comprehendDays: 0,
                        maxActiveLaws: 3, lawBonus: {}
                    }
                },
                // V6 奇遇系统字段
                serendipity: {
                    lastTriggerDay: 0,
                    todayCount: 0,
                    lastTriggerType: null,
                    cooldownTypes: {},
                    badLuck: 0,
                    currentEvent: null,
                    log: [],
                    luckStatus: null,
                    luckEndDay: 0,
                    serendipityBoostEndDay: 0
                },
                // V7 灵根/体质系统
                spiritRoot: {
                    ...generateRandomSpiritRoot(),
                    awakeningAvailable: false,
                    hasAwakened: false,
                    awakenedQuality: null
                },
                // V32 灵根觉醒系统
                spiritRootAwakening: {
                    status: 'dormant',
                    stage: 0,
                    triggerDay: 0,
                    tasks: [],
                    rewards: null,
                    lastEventDay: 0,
                    attempts: 0
                },
                constitutions: [],
                // V8 丹药炼器系统
                crafting: {
                    furnace: { level: 1, type: 'alchemy' },
                    anvil: { level: 1, type: 'forge' },
                    transactionLog: []
                },
                // V9 世界地图系统
                worldMap: {
                    currentContinent: '中州',
                    currentRegion: '中州城',
                    exploredContinents: ['中州'],
                    exploredRegions: ['中州城', '中州野外'],
                    actionPower: 10,
                    maxActionPower: 10,
                    continentUnlocks: {
                        '中州': 0,
                        '南疆': 1,
                        '北域': 2,
                        '西域': 3,
                        '东海': 2,
                        '仙界碎片': 4
                    },
                    bossRefreshDays: {},
                    lastTravelDay: 0
                },
                // E1 NPC对话记忆
                npcMemory: [],
                // B 成就/称号系统
                title: '筑基修士',
                achievements: {
                    unlocked: [],
                    titles: [],
                    stats: {
                        tribulationsCompleted: 0,
                        dungeonBossesKilled: 0,
                        sectContributions: 0,
                        treasuresRefined: 0,
                        serendipitiesEncountered: 0,
                        flawlessTribulations: 0
                    }
                }
            };
            saveGame();
            showGameUI();
            addLog('welcome', '欢迎', '你踏入修仙之路，成为一名炼气期修士。吸收天地灵气，开启你的修仙之旅！');
        }

        // ===== loadGame =====
        function loadGame() {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const loaded = JSON.parse(saved);
                // 确保V2新增字段存在（向后兼容）
                gameState = {
                    ...gameState,
                    ...loaded,
                    activeEffects: loaded.activeEffects || {
                        breakthrough_boost: 0,
                        cultivate_speed: 0,
                        渡劫_mindset_protect: 0,
                        attack: 0,
                        defense: 0,
                        cultivate_qi_rate: 0,
                        渡劫_damage_reduce: 0,
                        escape: 0,
                        foresee_event: 0,
                        all_stats: 0
                    },
                    equippedTreasures: loaded.equippedTreasures || [null, null, null],
                    inventory: loaded.inventory || [],
                    shopItems: loaded.shopItems || [],
                    lastShopDay: loaded.lastShopDay || 0,
                    tribulation: loaded.tribulation || {
                        inProgress: false,
                        currentStage: 0,
                        totalStages: 9,
                        currentType: null,
                        preparations: [],
                        damageTaken: 0,
                        tribKey: null
                    },
                    hasTransmigrationBuff: loaded.hasTransmigrationBuff || false,
                    tribulationRecord: loaded.tribulationRecord || [],
                    combat: loaded.combat || {
                        wins: 0,
                        losses: 0,
                        honor: 0,
                        fame: 0,
                        battleHistory: [],
                        injured: false,
                        injuryEndDay: 0
                    },
                    // V33 战斗AI学习系统
                    combatProfile: loaded.combatProfile || {
                        playerPatterns: [],
                        totalBattles: 0,
                        winsAgainst: 0,
                        currentEnemy: null,
                        learningData: {},
                        preferredDistance: null,
                        spellUsageRate: 0,
                        defenseFrequency: 0,
                        attackTiming: []
                    },
                    lastCombatDay: loaded.lastCombatDay || 0,
                    // V35 宗门互动增强
                    sectMissions: loaded.sectMissions || [],
                    sectMissionCooldown: loaded.sectMissionCooldown || 0,
                    lastMissionRefreshDay: loaded.lastMissionRefreshDay || 0,
                    // V36 装备打造增强
                    equipmentForgeCount: loaded.equipmentForgeCount || 0,
                    lastForgeDay: loaded.lastForgeDay || 0,
                    // V37 天道法则系统
                    celestialLaws: loaded.celestialLaws || {
                        comprehended: [], active: [], comprehending: null,
                        comprehendingProgress: 0, comprehendDays: 0,
                        maxActiveLaws: 3, lawBonus: {}
                    },
                    // V38 仙界社交系统
                    immortalAlly: loaded.immortalAlly || {
                        id: null, name: '', rank: 1, role: 'none', contribution: 0,
                        joinedDay: 0, allies: [], skillLevel: 0, dailyActivity: 0, lastActivityDay: 0
                    },
                    immortalFriends: loaded.immortalFriends || [],
                    allyApplications: loaded.allyApplications || [],
                    // V39 仙宠培养系统
                    spiritPets: loaded.spiritPets || { pets: [], lastInteractionDay: 0 },
                    // V40 仙界拍卖行
                    auction: loaded.auction || { listings: [], frozenFunds: 0, playerId: null, playerName: null, sortType: 'endingSoon' },
                    // V41 仙界经济系统
                    economy: loaded.economy || {
                        currentInflation: 0.02, totalIncome: 0, totalExpense: 0, totalTax: 0,
                        totalWealth: 0, avgDailyIncome: 50, avgDailyExpense: 0,
                        luxuryPurchases: 0, activeEvents: [], economyBuffs: {}
                    },
                    // V42 天道竞技场
                    celestialArena: loaded.celestialArena || {
                        currentSeason: 1, seasonStartTime: Date.now(), currentRank: 1, highestRank: 1,
                        score: 0, totalScoreEarned: 0, totalWins: 0, totalLosses: 0, currentStreak: 0,
                        longestStreak: 0, promotionWins: 0, dailyChallengesUsed: 0, derankProtection: 2,
                        matchHistory: [], lastRewardClaimed: 0, totalRewardsClaimed: 0, bountyPool: 0, bountyWins: 0
                    },
                    // V43 仙宫建设系统
                    palace: loaded.palace || {
                        level: 1, prosperity: 100, buildings: [], workers: [], styleIndex: 0,
                        bonus: { incomeBonus: 0, cultivationSpeed: 0, serendipityChance: 0, combatPower: 0 },
                        totalWagesPaid: 0
                    },
                    // V44 仙法创造系统
                    customSpells: loaded.customSpells || [],
                    essences: loaded.essences || {},
                    // V45 天道轮回增强
                    karma: loaded.karma || { points: 0, goodKarma: 0, evilKarma: 0, reincarnationCount: 0, pastLifeMemories: [] },
                    sect: loaded.sect ? {
                        ...loaded.sect,
                        npcDialogueHistory: loaded.sect.npcDialogueHistory || [],
                        npcTasks: loaded.sect.npcTasks || [],
                        npcLastActions: loaded.sect.npcLastActions || {},
                        tribulationRequest: loaded.sect.tribulationRequest || {
                            status: 'none', elderScore: 0, elderComment: '',
                            leaderDecision: '', leaderComment: '', buffApplied: false, submitDay: 0
                        },
                        celestialCycle: loaded.sect.celestialCycle || {
                            day: 0, completed: false, lastResult: null, blessingActive: false, cycleInterval: 3
                        },
                        // V35 宗门任务链
                        sectMissions: loaded.sect.sectMissions || [],
                        sectMissionCooldown: loaded.sect.sectMissionCooldown || 0
                    } : {
                        name: null,
                        level: 0,
                        spiritStones: 0,
                        disciples: [],
                        elders: [],
                        buildings: {
                            library: false,
                            alchemy: false,
                            forge: false,
                            archive: false
                        },
                        techniques: [],
                        contributionShop: [],
                        lastShopRefresh: 0,
                        lastResourceCollection: 0
                    },
                    serendipity: loaded.serendipity || {
                        lastTriggerDay: 0,
                        todayCount: 0,
                        lastTriggerType: null,
                        cooldownTypes: {},
                        badLuck: 0,
                        currentEvent: null,
                        log: [],
                        luckStatus: null,
                        luckEndDay: 0,
                        serendipityBoostEndDay: 0
                    },
                    // V7 灵根/体质系统
                    spiritRoot: loaded.spiritRoot ? {
                        ...loaded.spiritRoot,
                        awakeningAvailable: loaded.spiritRoot.awakeningAvailable || false,
                        hasAwakened: loaded.spiritRoot.hasAwakened || false,
                        awakenedQuality: loaded.spiritRoot.awakenedQuality || null
                    } : { ...generateRandomSpiritRoot(), awakeningAvailable: false, hasAwakened: false, awakenedQuality: null },
                    // V32 灵根觉醒系统
                    spiritRootAwakening: loaded.spiritRootAwakening || {
                        status: 'dormant',
                        stage: 0,
                        triggerDay: 0,
                        tasks: [],
                        rewards: null,
                        lastEventDay: 0,
                        attempts: 0
                    },
                    constitutions: loaded.constitutions || [],
                    // V8 丹药炼器系统
                    crafting: loaded.crafting || {
                        furnace: { level: 1, type: 'alchemy' },
                        anvil: { level: 1, type: 'forge' },
                        transactionLog: []
                    },
                    // V9 世界地图系统
                    worldMap: loaded.worldMap || {
                        currentContinent: '中州',
                        currentRegion: '中州城',
                        exploredContinents: ['中州'],
                        exploredRegions: ['中州城', '中州野外'],
                        actionPower: 10,
                        maxActionPower: 10,
                        continentUnlocks: {
                            '中州': 0,
                            '南疆': 1,
                            '北域': 2,
                            '西域': 3,
                            '东海': 2,
                            '仙界碎片': 4
                        },
                        bossRefreshDays: {},
                        lastTravelDay: 0
                    }
                };
                // E1 确保npcMemory字段存在（向后兼容）
                if (!gameState.npcMemory) gameState.npcMemory = [];
                // B 成就/称号系统向后兼容
                if (!gameState.title) gameState.title = '筑基修士';
                if (!gameState.achievements) {
                    gameState.achievements = {
                        unlocked: [],
                        titles: [],
                        stats: {
                            tribulationsCompleted: 0,
                            dungeonBossesKilled: 0,
                            sectContributions: 0,
                            treasuresRefined: 0,
                            serendipitiesEncountered: 0,
                            flawlessTribulations: 0
                        }
                    };
                }
                // 确保activeEffects包含serendipity_boost
                if (!gameState.activeEffects.serendipity_boost) {
                    gameState.activeEffects.serendipity_boost = 0;
                }
                // 初始化体质效果
                initializeConstitutionEffects();
                // 重新计算装备效果
                recalculateAllEffects();
                // 初始化世界地图
                initWorldMap();
                if (gameState.isGameOver) {
                    showGameOverScreen();
                } else {
                    showGameUI();
                }
            } else {
                alert('没有找到存档！');
            }
        }

        // ===== showGameUI =====
        function showGameUI() {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('apiConfig').classList.add('hidden');
            document.getElementById('gameStats').classList.remove('hidden');
            document.getElementById('cultivationProgress').classList.remove('hidden');
            document.getElementById('equipmentBar').classList.remove('hidden');
            document.getElementById('gameButtons').classList.remove('hidden');
            document.getElementById('eventLog').classList.remove('hidden');
            updateDisplay();
            renderLog();
            updateEquipmentBar();
            // 检查商店刷新
            if (gameState.lastShopDay < gameState.days) {
                refreshShop(true);
            }
            // 重置每日行动力
            if (gameState.worldMap) {
                const wm = gameState.worldMap;
                if (wm.lastTravelDay < gameState.days) {
                    wm.actionPower = wm.maxActionPower;
                    wm.lastTravelDay = 0;
                }
            }
            // 检查宗门按钮显示
            const sectBtn = document.getElementById('sectBtn');
            if (sectBtn) {
                sectBtn.style.display = (gameState.sect && gameState.sect.name) ? 'inline-block' : 'none';
            }
            // V37 检查悟道按钮显示
            const lawBtn = document.getElementById('lawBtn');
            if (lawBtn) {
                lawBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V38 检查仙界社交按钮显示（境界≥地仙=realm 8）
            const allyBtn = document.getElementById('allyBtn');
            if (allyBtn) {
                allyBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            const friendsBtn = document.getElementById('friendsBtn');
            if (friendsBtn) {
                friendsBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            const tradingBtn = document.getElementById('tradingBtn');
            if (tradingBtn) {
                tradingBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V40 拍卖按钮显示（境界≥地仙=realm 8）
            const auctionBtn = document.getElementById('auctionBtn');
            if (auctionBtn) {
                auctionBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V41 经济系统按钮显示（境界≥地仙=realm 8）
            const economyBtn = document.getElementById('economyBtn');
            if (economyBtn) {
                economyBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V42 天道竞技场按钮显示（境界≥地仙=realm 8）
            const arenaBtn = document.getElementById('arenaBtn');
            if (arenaBtn) {
                arenaBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V43 仙宫建设按钮显示（境界≥地仙=realm 8）
            const palaceBtn = document.getElementById('palaceBtn');
            if (palaceBtn) {
                palaceBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V44 仙法创造按钮显示（境界≥地仙=realm 8）
            const spellBtn = document.getElementById('spellBtn');
            if (spellBtn) {
                spellBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V45 天道轮回按钮显示（境界≥地仙=realm 8）
            const karmaBtn = document.getElementById('karmaBtn');
            if (karmaBtn) {
                karmaBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
            // V46 仙界 farming 按钮显示（境界≥地仙=realm 8）
            const farmingBtn = document.getElementById('farmingBtn');
            if (farmingBtn) {
                farmingBtn.style.display = (gameState.realm >= 8) ? 'inline-block' : 'none';
            }
        }

        // ===== updateDisplay =====
        function updateDisplay() {
            const realmName = CONFIG.realms[gameState.realm];
            const stageName = CONFIG.stages[gameState.stage];
            
            document.getElementById('realmDisplay').textContent = `${realmName}期`;
            document.getElementById('qiDisplay').textContent = `${gameState.qi}/${gameState.maxQi}`;
            document.getElementById('stonesDisplay').textContent = gameState.spiritStones;
            document.getElementById('mindsetDisplay').textContent = gameState.mindset;
            document.getElementById('daysDisplay').textContent = gameState.days;
            
            document.getElementById('realmName').textContent = `${realmName}期`;
            document.getElementById('realmStage').textContent = stageName;

            // A5 更新称号显示
            const titleDisplay = document.getElementById('titleDisplay');
            if (titleDisplay) {
                titleDisplay.textContent = `【${gameState.title || '筑基修士'}】`;
            }

            const req = REALM_REQUIREMENTS[gameState.realm];
            const progressInStage = gameState.stage === 0 ? 
                gameState.cultivationProgress : 
                gameState.cultivationProgress - req.stageThreshold[gameState.stage - 1];
            const stageSize = gameState.stage === 0 ? 
                req.stageThreshold[0] : 
                (req.stageThreshold[gameState.stage] - req.stageThreshold[gameState.stage - 1]);
            const percentage = Math.min(100, (progressInStage / stageSize) * 100);
            
            document.getElementById('cultivationBar').style.width = `${percentage}%`;
            document.getElementById('cultivationBar').textContent = `${Math.round(percentage)}%`;
            
            // V7 更新灵根显示
            updateSpiritRootDisplay();
            
            // V9 更新世界地图显示
            updateMinimapDisplay();
            if (gameState.worldMap) {
                const wm = gameState.worldMap;
                document.getElementById('actionPowerDisplay').textContent = `${wm.actionPower}/${wm.maxActionPower}`;
            }
        }


// Auto-generated module: laws.js

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
// Auto-generated module: mount.js

// ===== MOUNT_TYPES =====
const MOUNT_TYPES = {
    '仙鹤': {
        icon: '🦅',
        baseStats: { speed: 30, attack: 10, defense: 5, luck: 15 },
        skills: ['御空加速'],
        growthRate: 1.0,
        maturityMax: 100,
        price: 1000
    },
    '凤凰': {
        icon: '🦅',
        baseStats: { speed: 25, attack: 20, defense: 15, luck: 25 },
        skills: ['御空加速', '仙兽护主'],
        growthRate: 1.2,
        maturityMax: 120,
        price: 5000
    },
    '麒麟': {
        icon: '🦄',
        baseStats: { speed: 20, attack: 25, defense: 20, luck: 20 },
        skills: ['御空加速', '仙兽护主'],
        growthRate: 1.1,
        maturityMax: 110,
        price: 8000
    },
    '白虎': {
        icon: '🐯',
        baseStats: { speed: 25, attack: 30, defense: 10, luck: 10 },
        skills: ['御空加速', '坐骑融合'],
        growthRate: 1.15,
        maturityMax: 105,
        price: 6000
    },
    '青龙': {
        icon: '🐉',
        baseStats: { speed: 35, attack: 15, defense: 15, luck: 20 },
        skills: ['御空加速', '仙缘感应'],
        growthRate: 1.25,
        maturityMax: 130,
        price: 10000
    },
    '玄武': {
        icon: '🐢',
        baseStats: { speed: 15, attack: 10, defense: 35, luck: 15 },
        skills: ['御空加速', '仙兽护主'],
        growthRate: 1.0,
        maturityMax: 140,
        price: 7000
    },
    '九尾狐': {
        icon: '🦊',
        baseStats: { speed: 30, attack: 20, defense: 10, luck: 30 },
        skills: ['御空加速', '仙缘感应'],
        growthRate: 1.3,
        maturityMax: 100,
        price: 12000
    },
    '鲲鹏': {
        icon: '🐋',
        baseStats: { speed: 40, attack: 15, defense: 10, luck: 20 },
        skills: ['御空加速', '坐骑融合', '仙缘感应'],
        growthRate: 1.4,
        maturityMax: 150,
        price: 20000
    }
};

// ===== MOUNT_GROWTH_TYPES =====
const MOUNT_GROWTH_TYPES = {
    '普通': { multiplier: 0.8, color: '#aaaaaa', price: 0 },
    '优秀': { multiplier: 1.0, color: '#4caf50', price: 1000 },
    '稀有': { multiplier: 1.2, color: '#2196f3', price: 5000 },
    '神话': { multiplier: 1.5, color: '#9c27b0', price: 20000 }
};

// ===== getRandomMountType =====
function getRandomMountType() {
    const types = Object.keys(MOUNT_TYPES);
    return types[Math.floor(Math.random() * types.length)];
}

// ===== getRandomGrowthType =====
function getRandomGrowthType() {
    const rand = Math.random();
    if (rand < 0.5) return '普通';
    if (rand < 0.8) return '优秀';
    if (rand < 0.95) return '稀有';
    return '神话';
}

// ===== createMount =====
function createMount(type, growth) {
    const template = MOUNT_TYPES[type];
    const growthData = MOUNT_GROWTH_TYPES[growth];
    
    return {
        uid: 'mount_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: type,
        type: type,
        level: 1,
        growth: growth,
        stats: {
            speed: Math.floor(template.baseStats.speed * growthData.multiplier),
            attack: Math.floor(template.baseStats.attack * growthData.multiplier),
            defense: Math.floor(template.baseStats.defense * growthData.multiplier),
            luck: Math.floor(template.baseStats.luck * growthData.multiplier)
        },
        skills: [...template.skills],
        maturity: 0,
        matureMax: template.maturityMax,
        exp: 0,
        expToLevel: 100
    };
}

// ===== acquireMount =====
function acquireMount(mount) {
    if (gameState.mounts.length >= 3) {
        showToast('仙兽栏已满（最多3只）');
        return false;
    }
    
    gameState.mounts.push(mount);
    addLog('good', '获得仙兽', `获得${mount.growth}级仙兽【${mount.name}】！`);
    saveGame();
    return true;
}

// ===== tryCaptureMount =====
function tryCaptureMount() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('仙兽只可在仙界捕捉');
        return;
    }
    
    const mountType = getRandomMountType();
    const growth = getRandomGrowthType();
    const mount = createMount(mountType, growth);
    
    // 稀有度影响成功率
    const successRates = { '普通': 0.8, '优秀': 0.5, '稀有': 0.3, '神话': 0.1 };
    const luckBonus = gameState.currentMount ? gameState.currentMount.stats.luck / 200 : 0;
    
    if (Math.random() < successRates[growth] + luckBonus) {
        acquireMount(mount);
        showToast(`捕捉成功！获得${growth}仙兽【${mountType}】`);
    } else {
        showToast('捕捉失败，仙兽逃走了...');
    }
    
    saveGame();
}

// ===== feedMount =====
function feedMount(mountIndex, herbCount) {
    if (gameState.mounts.length <= mountIndex) return;
    
    const mount = gameState.mounts[mountIndex];
    if (mount.maturity >= mount.matureMax) {
        showToast('仙兽已完全成熟');
        return;
    }
    
    // 仙草喂养，每个仙草+5成熟度
    const gain = Math.min(herbCount * 5, mount.matureMax - mount.maturity);
    mount.maturity += gain;
    
    // 检查是否成熟
    if (mount.maturity >= mount.matureMax) {
        mount.level = Math.min(10, mount.level + 1);
        mount.maturity = mount.matureMax;
        showToast(`${mount.name}已完全成熟，等级提升！`);
    }
    
    saveGame();
    updateDisplay();
}

// ===== rideMount =====
function rideMount(mountIndex) {
    if (gameState.mounts.length <= mountIndex) return;
    
    gameState.currentMount = gameState.mounts[mountIndex];
    addLog('good', '骑乘仙兽', `骑乘【${gameState.currentMount.name}】飞行`);
    saveGame();
    updateDisplay();
}

// ===== dismountMount =====
function dismountMount() {
    if (!gameState.currentMount) return;
    addLog('neutral', '解除骑乘', `解除【${gameState.currentMount.name}】骑乘状态`);
    gameState.currentMount = null;
    saveGame();
    updateDisplay();
}

// ===== showMountPanel =====
function showMountPanel() {
    let html = '<div style="padding:16px;">';
    html += '<h3 style="color:#ffd700;text-align:center;margin-bottom:16px;">🐎 仙兽面板</h3>';
    
    // 当前骑乘
    if (gameState.currentMount) {
        const m = gameState.currentMount;
        html += `<div style="background:#1a1a2e;padding:12px;border-radius:8px;margin-bottom:12px;border:1px solid #ffd700;">`;
        html += `<div style="display:flex;align-items:center;gap:10px;">`;
        html += `<span style="font-size:32px;">${MOUNT_TYPES[m.type].icon}</span>`;
        html += `<div><div style="color:#ffd700;font-weight:bold;">${m.name}</div>`;
        html += `<div style="color:#aaa;font-size:12px;">${m.growth}级 | Lv.${m.level}</div></div>`;
        html += `<button onclick="dismountMount();closeModal();" style="margin-left:auto;padding:6px 12px;background:#c62828;color:white;border:none;border-radius:4px;cursor:pointer;">解除骑乘</button>`;
        html += '</div>';
        
        // 成熟度条
        const progress = (m.maturity / m.matureMax * 100).toFixed(0);
        html += `<div style="margin-top:8px;"><div style="display:flex;justify-content:space-between;color:#aaa;font-size:11px;"><span>成熟度</span><span>${progress}%</span></div>`;
        html += `<div style="height:6px;background:#333;border-radius:3px;margin-top:4px;"><div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#4caf50,#81c784);border-radius:3px;"></div></div></div>`;
        
        // 属性
        html += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px;text-align:center;">`;
        html += `<div><div style="color:#4caf50;font-size:14px;">${m.stats.speed}</div><div style="color:#666;font-size:10px;">速度</div></div>`;
        html += `<div><div style="color:#f44336;font-size:14px;">${m.stats.attack}</div><div style="color:#666;font-size:10px;">攻击</div></div>`;
        html += `<div><div style="color:#2196f3;font-size:14px;">${m.stats.defense}</div><div style="color:#666;font-size:10px;">防御</div></div>`;
        html += `<div><div style="color:#ff9800;font-size:14px;">${m.stats.luck}</div><div style="color:#666;font-size:10px;">幸运</div></div>`;
        html += '</div></div>';
    }
    
    // 仙兽列表
    html += '<div style="margin-bottom:12px;"><div style="color:#aaa;font-size:12px;margin-bottom:8px;">仙兽栏 (' + gameState.mounts.length + '/3)</div>';
    
    if (gameState.mounts.length === 0) {
        html += '<div style="text-align:center;color:#666;padding:20px;">暂无仙兽</div>';
    } else {
        for (let i = 0; i < gameState.mounts.length; i++) {
            const m = gameState.mounts[i];
            const isRiding = gameState.currentMount && gameState.currentMount.uid === m.uid;
            const growthColor = MOUNT_GROWTH_TYPES[m.growth].color;
            
            html += `<div style="background:#252540;padding:10px;border-radius:6px;margin-bottom:8px;cursor:pointer;" onclick="toggleMountDetails(${i})">`;
            html += `<div style="display:flex;align-items:center;gap:10px;">`;
            html += `<span style="font-size:24px;">${MOUNT_TYPES[m.type].icon}</span>`;
            html += `<div style="flex:1;">`;
            html += `<div style="color:${growthColor};font-weight:bold;">${m.name} <span style="color:#666;font-size:11px;">(${m.growth})</span></div>`;
            html += `<div style="color:#888;font-size:11px;">Lv.${m.level} | 成熟度${(m.maturity/m.matureMax*100).toFixed(0)}%</div>`;
            html += '</div>';
            if (!isRiding) {
                html += `<button onclick="event.stopPropagation();rideMount(${i});closeModal();" style="padding:4px 8px;background:#2e7d32;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">骑乘</button>`;
            } else {
                html += `<span style="color:#ffd700;font-size:11px;">已骑乘</span>`;
            }
            html += '</div></div>';
        }
    }
    html += '</div>';
    
    // 捕捉按钮
    html += `<button onclick="tryCaptureMount();closeModal();" style="width:100%;padding:12px;background:#1565c0;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">🔍 捕捉仙兽</button>`;
    
    html += `<button onclick="closeModal()" style="width:100%;margin-top:8px;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>`;
    html += '</div>';
    
    openModal('仙兽', html, '');
}

// ===== MOUNT_SKILLS =====
const MOUNT_SKILLS = {
    '御空加速': {
        icon: '💨',
        effect: '移动冷却-50%',
        description: '骑乘时御空术冷却时间减半'
    },
    '仙兽护主': {
        icon: '🛡️',
        effect: '战斗加成',
        description: '战斗时仙兽协助攻击，伤害+20%'
    },
    '仙缘感应': {
        icon: '✨',
        effect: '仙缘任务+20%',
        description: '仙缘任务刷新概率+20%'
    },
    '坐骑融合': {
        icon: '🔗',
        effect: '属性翻倍',
        description: '骑乘时仙兽属性加成翻倍'
    }
};

// Auto-generated module: palace.js

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
// Auto-generated module: pet.js

// ===== PET CONSTANTS (V39) =====
const PET_CONFIG = {
    maxPets: 5,           // 最多5只仙宠
    eggHatchDays: 3,      // 孵化所需天数
    evolveMinLevel: 10,   // 进化最低等级
    skillSlotBase: 1,     // 基础技能槽
    skillSlotPerEvo: 1,   // 每次进化解锁1个技能槽
    feedCostBase: 50,     // 基础喂养灵石
    bondMax: 100          // 羁绊最大值
};

const PET_QUALITIES = {
    '凡品': { multiplier: 0.8, color: '#9e9e9e', hatchRate: 0.7, growthBonus: 0.5 },
    '良品': { multiplier: 1.0, color: '#4caf50', hatchRate: 0.2, growthBonus: 1.0 },
    '上品': { multiplier: 1.2, color: '#2196f3', hatchRate: 0.08, growthBonus: 1.5 },
    '精品': { multiplier: 1.5, color: '#9c27b0', hatchRate: 0.015, growthBonus: 2.0 },
    '仙品': { multiplier: 2.0, color: '#ff9800', hatchRate: 0.004, growthBonus: 3.0 },
    '神品': { multiplier: 2.5, color: '#ffd700', hatchRate: 0.001, growthBonus: 5.0 }
};

const PET_TYPES = {
    '仙鹤': {
        icon: '🦅', element: '风',
        baseStats: { attack: 15, defense: 10, speed: 40, luck: 20 },
        skills: ['御空加速', '仙羽护体'],
        growthRate: 1.0, maturityMax: 80, eggIcon: '🥚'
    },
    '凤凰': {
        icon: '🦅', element: '火',
        baseStats: { attack: 35, defense: 20, speed: 25, luck: 30 },
        skills: ['涅槃之火', '羽翼灼烧'],
        growthRate: 1.3, maturityMax: 120, eggIcon: '🥚'
    },
    '麒麟': {
        icon: '🦄', element: '土',
        baseStats: { attack: 30, defense: 35, speed: 20, luck: 25 },
        skills: ['祥云笼罩', '踏火祥瑞'],
        growthRate: 1.1, maturityMax: 100, eggIcon: '🥚'
    },
    '白虎': {
        icon: '🐯', element: '金',
        baseStats: { attack: 45, defense: 15, speed: 25, luck: 10 },
        skills: ['白虎战魂', '金之神力'],
        growthRate: 1.15, maturityMax: 90, eggIcon: '🥚'
    },
    '青龙': {
        icon: '🐉', element: '木',
        baseStats: { attack: 25, defense: 20, speed: 35, luck: 30 },
        skills: ['青龙之怒', '行云布雨'],
        growthRate: 1.2, maturityMax: 110, eggIcon: '🥚'
    },
    '玄武': {
        icon: '🐢', element: '水',
        baseStats: { attack: 15, defense: 45, speed: 15, luck: 20 },
        skills: ['玄冰护甲', '龟息大法'],
        growthRate: 0.9, maturityMax: 130, eggIcon: '🥚'
    },
    '九尾狐': {
        icon: '🦊', element: '魅',
        baseStats: { attack: 30, defense: 15, speed: 35, luck: 45 },
        skills: ['九尾魅惑', '狐火之术'],
        growthRate: 1.4, maturityMax: 85, eggIcon: '🥚'
    },
    '鲲鹏': {
        icon: '🐋', element: '雷',
        baseStats: { attack: 35, defense: 15, speed: 50, luck: 25 },
        skills: ['鲲鹏展翅', '雷霆万钧'],
        growthRate: 1.5, maturityMax: 140, eggIcon: '🥚'
    },
    '独角兽': {
        icon: '🦄', element: '光',
        baseStats: { attack: 25, defense: 25, speed: 30, luck: 40 },
        skills: ['圣光治愈', '独角突刺'],
        growthRate: 1.25, maturityMax: 95, eggIcon: '🥚'
    },
    '白泽': {
        icon: '🦌', element: '智',
        baseStats: { attack: 20, defense: 30, speed: 25, luck: 50 },
        skills: ['神兽智慧', '白泽之鉴'],
        growthRate: 1.35, maturityMax: 105, eggIcon: '🥚'
    }
};

const PET_SKILLS = {
    '御空加速': { type: 'passive', effect: { speed: 0.2 }, desc: '速度+20%' },
    '仙羽护体': { type: 'active', effect: { defense: 0.15 }, desc: '防御+15%', cost: 10 },
    '涅槃之火': { type: 'active', effect: { attack: 0.25, revive: 0.3 }, desc: '攻击+25%，30%概率复活', cost: 20 },
    '羽翼灼烧': { type: 'active', effect: { attack: 0.2, burn: true }, desc: '攻击+20%，灼烧效果', cost: 15 },
    '祥云笼罩': { type: 'passive', effect: { luck: 0.3 }, desc: '幸运+30%' },
    '踏火祥瑞': { type: 'active', effect: { attack: 0.2, defense: 0.1 }, desc: '攻击+20%，防御+10%', cost: 15 },
    '白虎战魂': { type: 'active', effect: { attack: 0.35 }, desc: '攻击+35%', cost: 25 },
    '金之神力': { type: 'passive', effect: { attack: 0.15, defense: 0.1 }, desc: '攻击+15%，防御+10%' },
    '青龙之怒': { type: 'active', effect: { attack: 0.3, speed: 0.1 }, desc: '攻击+30%，速度+10%', cost: 20 },
    '行云布雨': { type: 'active', effect: { attack: 0.15, heal: 0.1 }, desc: '攻击+15%，治疗+10%', cost: 15 },
    '玄冰护甲': { type: 'passive', effect: { defense: 0.25 }, desc: '防御+25%' },
    '龟息大法': { type: 'passive', effect: { defense: 0.15, revive: 0.15 }, desc: '防御+15%，15%概率复活' },
    '九尾魅惑': { type: 'active', effect: { control: true, attack: 0.2 }, desc: '控制敌人，攻击+20%', cost: 25 },
    '狐火之术': { type: 'active', effect: { attack: 0.25, burn: true }, desc: '攻击+25%，灼烧效果', cost: 20 },
    '鲲鹏展翅': { type: 'passive', effect: { speed: 0.4, attack: 0.1 }, desc: '速度+40%，攻击+10%' },
    '雷霆万钧': { type: 'active', effect: { attack: 0.4, stun: true }, desc: '攻击+40%，眩晕效果', cost: 30 },
    '圣光治愈': { type: 'active', effect: { heal: 0.25 }, desc: '治疗+25%', cost: 20 },
    '独角突刺': { type: 'active', effect: { attack: 0.3 }, desc: '攻击+30%', cost: 20 },
    '神兽智慧': { type: 'passive', effect: { luck: 0.25, serendipity: 0.2 }, desc: '幸运+25%，奇遇+20%' },
    '白泽之鉴': { type: 'active', effect: { foresee: true, defense: 0.2 }, desc: '预知敌人行动，防御+20%', cost: 25 }
};

const PET_EVOLUTION_MAP = {
    '仙鹤': '金羽仙鹤',
    '凤凰': '九天凤凰',
    '麒麟': '圣金麒麟',
    '白虎': '战伐白虎',
    '青龙': '苍青神龙',
    '玄武': '冥水玄武',
    '九尾狐': '九天真狐',
    '鲲鹏': '太古鲲鹏',
    '独角兽': '星辉独角兽',
    '白泽': '祥瑞白泽'
};

const PET_FOOD = {
    '灵果': { cost: 50, exp: 20, happiness: 5 },
    '仙露': { cost: 100, exp: 50, happiness: 10 },
    '仙丹': { cost: 300, exp: 150, happiness: 15 },
    '神兽肉': { cost: 500, exp: 300, happiness: 25 }
};

// ===== PET FUNCTIONS =====

function showPetPanel() {
    const sp = gameState.spiritPets;
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff9800;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ff9800;text-align:center;margin-bottom:15px;">🐉 仙宠培养</h2>`;

    // 仙宠列表
    html += `<div style="margin-bottom:20px;">
        <h3 style="color:#ffd700;margin-bottom:10px;">我的仙宠（${sp.pets.length}/${PET_CONFIG.maxPets}）</h3>`;

    if (sp.pets.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">暂无仙宠，去获取仙兽蛋吧！</p>`;
    } else {
        sp.pets.forEach((pet, idx) => {
            const template = PET_TYPES[pet.type] || PET_QUALITIES[pet.quality];
            const qualityColor = PET_QUALITIES[pet.quality]?.color || '#fff';
            const evoStage = Math.floor(pet.level / PET_CONFIG.evolveMinLevel);
            const evoName = evoStage > 0 ? PET_EVOLUTION_MAP[pet.type] || pet.type : pet.type;
            const skillSlots = PET_CONFIG.skillSlotBase + evoStage * PET_CONFIG.skillSlotPerEvo;

            html += `<div style="background:rgba(255,152,0,0.1);border:1px solid ${qualityColor};border-radius:8px;padding:12px;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <span style="font-size:2em;">${template.icon}</span>
                    <div style="flex:1;">
                        <div style="color:${qualityColor};font-weight:bold;">${evoName} ${pet.nickname ? `"${pet.nickname}"` : ''}</div>
                        <div style="color:#aaa;font-size:0.9em;">等级 Lv.${pet.level} | ${pet.quality} | ${template.element}属性 | 成长${pet.growth.toFixed(2)}x</div>
                    </div>
                    <div style="color:#ffd700;">❤️ ${pet.bond}/${PET_CONFIG.bondMax}</div>
                </div>
                <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">
                    <span style="color:#aaa;font-size:0.85em;">攻击:${Math.round(pet.stats.attack)}</span>
                    <span style="color:#aaa;font-size:0.85em;">防御:${Math.round(pet.stats.defense)}</span>
                    <span style="color:#aaa;font-size:0.85em;">速度:${Math.round(pet.stats.speed)}</span>
                    <span style="color:#aaa;font-size:0.85em;">幸运:${Math.round(pet.stats.luck)}</span>
                    <span style="color:#aaa;font-size:0.85em;">经验:${pet.exp}/${pet.nextLevelExp}</span>
                </div>
                <div style="color:#aaa;font-size:0.85em;margin-bottom:8px;">
                    技能槽(${pet.skills.length}/${skillSlots}): ${pet.skills.map(s => `${s}(${PET_SKILLS[s]?.desc || '?'})`).join(' | ') || '暂无'}
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">`;

            if (!pet.isHatched) {
                html += `<button class="btn" style="background:#4caf50;color:white;" onclick="hatchPetEgg(${idx})">🥚 孵化（剩余${pet.hatchDays}天）</button>`;
            } else {
                html += `<button class="btn" style="background:#ff9800;color:white;" onclick="feedPet(${idx})">🍖 喂养</button>`;
                if (evoStage < 3 && pet.level >= PET_CONFIG.evolveMinLevel * (evoStage + 1)) {
                    html += `<button class="btn" style="background:#9c27b0;color:white;" onclick="evolvePet(${idx})">✨ 进化（需${PET_CONFIG.evolveMinLevel * (evoStage + 1)}级）</button>`;
                }
                if (pet.skills.length < skillSlots) {
                    html += `<button class="btn" style="background:#2196f3;color:white;" onclick="teachPetSkill(${idx})">📖 传授技能</button>`;
                }
                html += `<button class="btn" style="background:#f44336;color:white;" onclick="releasePet(${idx})">🗑️ 放生</button>`;
            }
            html += `</div></div>`;
        });
    }
    html += `</div>`;

    // 仙兽蛋市场
    html += `<div style="margin-top:20px;">
        <h3 style="color:#ffd700;margin-bottom:10px;">🥚 仙兽蛋市场</h3>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">`;

    const eggTypes = ['凡品蛋', '良品蛋', '上品蛋', '精品蛋', '仙品蛋'];
    const eggCosts = [500, 2000, 8000, 30000, 100000];
    const eggRates = [0.7, 0.2, 0.08, 0.015, 0.004];

    eggTypes.forEach((egg, i) => {
        html += `<div style="background:rgba(0,0,0,0.3);border:1px solid #555;border-radius:8px;padding:10px;text-align:center;">
            <div style="color:#aaa;">${egg}</div>
            <div style="color:#ffd700;">💎 ${eggCosts[i]}</div>
            <div style="color:#aaa;font-size:0.8em;">孵化成功:凡品${eggTypes.length-i}品</div>
            <button class="btn" style="background:#ff9800;color:white;margin-top:5px;" onclick="buyPetEgg(${i})"
                ${gameState.spiritStones < eggCosts[i] ? 'disabled' : ''}>购买</button>
        </div>`;
    });

    html += `</div></div>`;

    // 每日互动
    html += `<div style="margin-top:20px;text-align:center;">
        <button class="btn" style="background:#4caf50;color:white;" onclick="interactWithPets()">🤝 与所有仙宠互动（+羁绊）</button>
    </div>`;

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
    </div></div></div>`;

    openModal('仙宠培养', html, []);
}

function buyPetEgg(qualityIndex) {
    const eggCosts = [500, 2000, 8000, 30000, 100000];
    const cost = eggCosts[qualityIndex];

    if (gameState.spiritStones < cost) {
        addLog('灵石不足！', '#f44336');
        return;
    }

    const sp = gameState.spiritPets;
    if (sp.pets.length >= PET_CONFIG.maxPets) {
        addLog('仙宠栏已满！', '#f44336');
        return;
    }

    gameState.spiritStones -= cost;
    const qualities = ['凡品', '良品', '上品', '精品', '仙品'];
    const quality = qualities[qualityIndex];
    const types = Object.keys(PET_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const growthTypes = ['普通', '普通', '普通', '优秀', '优秀', '稀有', '稀有', '神话'];

    const egg = {
        type: type,
        quality: quality,
        growth: PET_QUALITIES[quality].growthBonus * (0.8 + Math.random() * 0.4),
        nickname: '',
        level: 1,
        exp: 0,
        nextLevelExp: 100,
        stats: { attack: 0, defense: 0, speed: 0, luck: 0 },
        skills: [],
        isHatched: false,
        hatchDays: PET_CONFIG.eggHatchDays,
        bond: 20,
        element: PET_TYPES[type].element
    };

    sp.pets.push(egg);
    addLog(`获得${quality}${type}蛋！`, '#ff9800');
    updateDisplay();
    showPetPanel();
}

function hatchPetEgg(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];

    if (pet.isHatched) {
        addLog('这只仙兽已经孵化了！', '#f44336');
        return;
    }

    pet.hatchDays--;
    if (pet.hatchDays <= 0) {
        pet.isHatched = true;
        // 根据品质决定是否变异
        const qualityData = PET_QUALITIES[pet.quality];
        if (Math.random() < qualityData.hatchRate * 0.1) {
            // 变异
            const allTypes = Object.keys(PET_TYPES);
            pet.type = allTypes[Math.floor(Math.random() * allTypes.length)];
            pet.quality = '精品';
            addLog(`🐣 孵化成功！仙兽发生变异，成为${pet.quality}${pet.type}！`, '#ffd700');
        } else {
            addLog(`🐣 孵化成功！获得${pet.quality}${pet.type}！`, '#ff9800');
        }

        // 初始化属性
        const template = PET_TYPES[pet.type];
        const multiplier = PET_QUALITIES[pet.quality].multiplier * pet.growth;
        pet.stats.attack = Math.round(template.baseStats.attack * multiplier);
        pet.stats.defense = Math.round(template.baseStats.defense * multiplier);
        pet.stats.speed = Math.round(template.baseStats.speed * multiplier);
        pet.stats.luck = Math.round(template.baseStats.luck * multiplier);

        // 遗传技能
        if (Math.random() < 0.5) {
            const inheritedSkills = template.skills.filter(() => Math.random() < 0.3);
            pet.skills = inheritedSkills.slice(0, 1);
        }
        updateDisplay();
    } else {
        addLog(`仙兽蛋还需要${pet.hatchDays}天孵化...`, '#aaa');
    }
    showPetPanel();
}

function feedPet(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];

    if (!pet.isHatched) {
        addLog('仙兽蛋无法喂养！', '#f44336');
        return;
    }

    // 弹出喂养选择
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff9800;border-radius:12px;padding:20px;max-width:500px;">
            <h3 style="color:#ff9800;text-align:center;">🍖 喂养${pet.type}</h3>
            <p style="color:#aaa;text-align:center;">选择食物（当前灵石: ${gameState.spiritStones}）</p>`;

    Object.keys(PET_FOOD).forEach((food, i) => {
        const f = PET_FOOD[food];
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #333;">
            <div>
                <span style="color:#ffd700;">${food}</span>
                <span style="color:#aaa;font-size:0.9em;"> +经验${f.exp} +好感${f.happiness}</span>
            </div>
            <button class="btn" style="background:#4caf50;color:white;" onclick="confirmFeedPet(${idx},${i})"
                ${gameState.spiritStones < f.cost ? 'disabled' : ''}>💎${f.cost}</button>
        </div>`;
    });

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showPetPanel()">返回</button>
    </div></div></div>`;
    openModal('喂养', html, []);
}

function confirmFeedPet(idx, foodIdx) {
    const foods = Object.keys(PET_FOOD);
    const food = foods[foodIdx];
    const f = PET_FOOD[food];

    if (gameState.spiritStones < f.cost) {
        addLog('灵石不足！', '#f44336');
        return;
    }

    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];

    gameState.spiritStones -= f.cost;
    pet.exp += f.exp;
    pet.bond = Math.min(PET_CONFIG.bondMax, pet.bond + f.happiness);

    // 检查升级
    while (pet.exp >= pet.nextLevelExp) {
        pet.exp -= pet.nextLevelExp;
        pet.level++;
        pet.nextLevelExp = Math.floor(pet.nextLevelExp * 1.5);
        // 属性成长
        const template = PET_TYPES[pet.type];
        const multiplier = PET_QUALITIES[pet.quality].multiplier * pet.growth;
        const growthPerLevel = template.growthRate * multiplier;
        pet.stats.attack += Math.round(template.baseStats.attack * growthPerLevel * 0.1);
        pet.stats.defense += Math.round(template.baseStats.defense * growthPerLevel * 0.1);
        pet.stats.speed += Math.round(template.baseStats.speed * growthPerLevel * 0.1);
        pet.stats.luck += Math.round(template.baseStats.luck * growthPerLevel * 0.1);
        addLog(`🐉 ${pet.type}升级到Lv.${pet.level}！`, '#ffd700');
    }

    addLog(`喂养${pet.type}成功！`, '#4caf50');
    updateDisplay();
    showPetPanel();
}

function evolvePet(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];
    const evoStage = Math.floor(pet.level / PET_CONFIG.evolveMinLevel);

    if (evoStage >= 3) {
        addLog('已达到最大进化阶段！', '#f44336');
        return;
    }

    const evoCost = 5000 * (evoStage + 1);
    if (gameState.spiritStones < evoCost) {
        addLog(`进化需要${evoCost}灵石！`, '#f44336');
        return;
    }

    gameState.spiritStones -= evoCost;
    const newType = PET_EVOLUTION_MAP[pet.type] || pet.type;
    pet.type = newType;

    // 进化加成
    const multiplier = PET_QUALITIES[pet.quality].multiplier * pet.growth;
    const template = PET_TYPES[pet.type] || PET_TYPES[Object.keys(PET_TYPES)[0]];
    pet.stats.attack += Math.round(template.baseStats.attack * multiplier * 0.3);
    pet.stats.defense += Math.round(template.baseStats.defense * multiplier * 0.3);
    pet.stats.speed += Math.round(template.baseStats.speed * multiplier * 0.3);
    pet.stats.luck += Math.round(template.baseStats.luck * multiplier * 0.3);

    // 解锁进化天赋
    const evoTalents = {
        '金羽仙鹤': '御空加速',
        '九天凤凰': '涅槃之火',
        '圣金麒麟': '祥云笼罩',
        '战伐白虎': '白虎战魂',
        '苍青神龙': '青龙之怒',
        '冥水玄武': '玄冰护甲',
        '九天真狐': '九尾魅惑',
        '太古鲲鹏': '鲲鹏展翅',
        '星辉独角兽': '圣光治愈',
        '祥瑞白泽': '神兽智慧'
    };

    if (evoTalents[newType] && !pet.skills.includes(evoTalents[newType])) {
        pet.skills.push(evoTalents[newType]);
        addLog(`✨ 进化成功！领悟天赋【${evoTalents[newType]}】！`, '#ffd700');
    } else {
        addLog(`✨ 进化成功！${pet.type}！`, '#ff9800');
    }

    updateDisplay();
    showPetPanel();
}

function teachPetSkill(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];
    const template = PET_TYPES[pet.type];
    const allSkills = Object.keys(PET_SKILLS);

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #2196f3;border-radius:12px;padding:20px;max-width:500px;">
            <h3 style="color:#2196f3;text-align:center;">📖 传授技能给${pet.type}</h3>`;

    // 可学习的技能
    const learnableSkills = allSkills.filter(s => !pet.skills.includes(s) && PET_SKILLS[s]);
    learnableSkills.forEach(skill => {
        const sk = PET_SKILLS[skill];
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #333;">
            <div>
                <span style="color:#ffd700;">${skill}</span>
                <span style="color:#aaa;font-size:0.85em;">${sk.desc}</span>
            </div>
            <button class="btn" style="background:#2196f3;color:white;" onclick="confirmTeachSkill(${idx},'${skill}')">学习</button>
        </div>`;
    });

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showPetPanel()">返回</button>
    </div></div></div>`;
    openModal('传授技能', html, []);
}

function confirmTeachSkill(idx, skill) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];
    const sk = PET_SKILLS[skill];

    if (pet.skills.length >= PET_CONFIG.skillSlotBase + Math.floor(pet.level / PET_CONFIG.evolveMinLevel)) {
        addLog('技能槽已满！', '#f44336');
        return;
    }

    pet.skills.push(skill);
    addLog(`🐉 ${pet.type}学会【${skill}】！`, '#2196f3');
    showPetPanel();
}

function releasePet(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];

    if (confirm(`确定放生${pet.type}吗？放生后无法恢复！`)) {
        sp.pets.splice(idx, 1);
        addLog(`${pet.type}已被放生...`, '#aaa');
        updateDisplay();
        showPetPanel();
    }
}

function interactWithPets() {
    const sp = gameState.spiritPets;
    if (sp.pets.length === 0) {
        addLog('还没有仙宠！', '#f44336');
        return;
    }

    sp.pets.forEach(pet => {
        if (pet.isHatched) {
            pet.bond = Math.min(PET_CONFIG.bondMax, pet.bond + 5);
            // 互动增加少量经验
            pet.exp += 5;
            if (pet.exp >= pet.nextLevelExp) {
                pet.exp -= pet.nextLevelExp;
                pet.level++;
                pet.nextLevelExp = Math.floor(pet.nextLevelExp * 1.5);
                addLog(`🐉 ${pet.type}升级到Lv.${pet.level}！`, '#ffd700');
            }
        }
    });

    addLog('与所有仙宠互动，好感度提升！', '#4caf50');
    updateDisplay();
    showPetPanel();
}

// Alias for existing button handler
function openPet() {
    showPetPanel();
}

function processDailyPets() {
    const sp = gameState.spiritPets;
    if (sp.pets.length === 0) return;

    sp.pets.forEach(pet => {
        if (!pet.isHatched) {
            // 未孵化仙兽蛋自然孵化
            // 已在hatchPetEgg中处理
        } else {
            // 羁绊每日衰减
            pet.bond = Math.max(0, pet.bond - 2);

            // 羁绊加成：战斗时仙宠助战
            if (pet.bond >= 80) {
                const bonus = 0.1 + (pet.bond - 80) * 0.005;
                if (!gameState.activeEffects.petBond) {
                    gameState.activeEffects.petBond = 0;
                }
                gameState.activeEffects.petBond += bonus;
            }
        }
    });

    // 每日喂养提醒
    if (sp.pets.some(p => p.isHatched)) {
        addLog('🐉 你的仙宠饿了，记得去喂养哦！', '#ff9800');
    }
}

// 输出宠物战斗助战效果
function getPetCombatBonus() {
    const sp = gameState.spiritPets;
    let bonus = { attack: 0, defense: 0, speed: 0, luck: 0, revive: 0 };

    sp.pets.forEach(pet => {
        if (!pet.isHatched || pet.bond < 50) return;

        const bondFactor = pet.bond / PET_CONFIG.bondMax;
        const levelFactor = pet.level / 100 + 0.5;

        bonus.attack += pet.stats.attack * bondFactor * levelFactor * 0.3;
        bonus.defense += pet.stats.defense * bondFactor * levelFactor * 0.3;
        bonus.speed += pet.stats.speed * bondFactor * levelFactor * 0.2;
        bonus.luck += pet.stats.luck * bondFactor * levelFactor * 0.2;

        // 复活概率
        if (pet.skills.some(s => PET_SKILLS[s]?.effect?.revive)) {
            bonus.revive += 0.1 * bondFactor;
        }
    });

    return bonus;
}
// Auto-generated module: reincarnation.js

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


// Auto-generated module: sect.js

        // ===== openSect =====
        function openSect() {
            document.getElementById('sectModal').classList.add('active');
            renderSectHome();
        }

        // ===== closeSect =====
        function closeSect() {
            document.getElementById('sectModal').classList.remove('active');
        }

        // ===== renderSectHome =====
        function renderSectHome() {
            const sect = gameState.sect;
            const content = document.getElementById('sectContent');
            
            // 检查是否已创建宗门
            if (!sect.name) {
                content.innerHTML = renderCreateSectForm();
                return;
            }

            const html = `
                <div class="sect-header">
                    <div class="sect-name">🏛️ ${sect.name}</div>
                    <div class="sect-level">等级 ${sect.level}</div>
                </div>
                <div class="sect-resources">
                    <div class="sect-resource">
                        <div class="sect-resource-icon">💎</div>
                        <div class="sect-resource-value">${sect.spiritStones}</div>
                        <div class="sect-resource-label">宗门灵石</div>
                    </div>
                    <div class="sect-resource">
                        <div class="sect-resource-icon">👥</div>
                        <div class="sect-resource-value">${sect.disciples.length}/${SECT_CONFIG.maxDisciples[sect.level]}</div>
                        <div class="sect-resource-label">弟子人数</div>
                    </div>
                    <div class="sect-resource">
                        <div class="sect-resource-icon">⚡</div>
                        <div class="sect-resource-value">${calculateSectIncome()}</div>
                        <div class="sect-resource-label">每日产出</div>
                    </div>
                </div>
                <div class="sect-tabs">
                    <div class="sect-tab active" onclick="switchSectTab('disciples')">👥 弟子</div>
                    <div class="sect-tab" onclick="switchSectTab('buildings')">🏗️ 建筑</div>
                    <div class="sect-tab" onclick="switchSectTab('techniques')">📚 功法</div>
                    <div class="sect-tab" onclick="switchSectTab('shop')">🏪 贡献商店</div>
                    <div class="sect-tab" onclick="switchSectTab('missions')">📋 任务</div>
                    <div class="sect-tab" onclick="switchSectTab('manage')">⚙️ 管理</div>
                </div>
                <div class="sect-content" id="sectTabContent">
                    ${renderDisciplesTab()}
                </div>
            `;
            content.innerHTML = html;
        }

        // ===== switchSectTab =====
        function switchSectTab(tab) {
            // 更新标签样式
            document.querySelectorAll('.sect-tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            
            // 渲染对应内容
            const tabContent = document.getElementById('sectTabContent');
            switch(tab) {
                case 'disciples':
                    tabContent.innerHTML = renderDisciplesTab();
                    break;
                case 'buildings':
                    tabContent.innerHTML = renderBuildingsTab();
                    break;
                case 'techniques':
                    tabContent.innerHTML = renderTechniquesTab();
                    break;
                case 'shop':
                    tabContent.innerHTML = renderContributionShop();
                    break;
                case 'missions':
                    tabContent.innerHTML = renderSectMissionsTab();
                    break;
                case 'manage':
                    tabContent.innerHTML = renderManageTab();
                    break;
            }
        }

        // ===== renderCreateSectForm =====
        function renderCreateSectForm() {
            const canCreate = gameState.realm >= 4 && gameState.spiritStones >= SECT_CONFIG.createCost;
            const realmName = CONFIG.realms[gameState.realm];
            
            let html = `
                <div class="create-sect-form">
                    <h3 style="color:#9c27b0;margin-bottom:20px;">🏛️ 创建宗门</h3>
                    <p style="color:#aaa;margin-bottom:15px;">
                        宗主境界：${realmName}期<br>
                        ${gameState.realm >= 4 ? '✅ 已达到元婴期，可创建宗门' : '❌ 需要元婴期才能创建宗门'}
                    </p>
                    <input type="text" class="sect-name-input" id="sectNameInput" placeholder="请输入宗门名称" maxlength="10">
                    <div class="create-sect-cost">
                        创建消耗：<span>${SECT_CONFIG.createCost}</span> 灵石<br>
                        当前拥有：<span>${gameState.spiritStones}</span> 灵石
                    </div>
                    <button class="btn btn-sect" onclick="createSect()" ${canCreate ? '' : 'disabled'} style="padding:15px 40px;">
                        🏛️ 创建宗门
                    </button>
                </div>
            `;
            return html;
        }

        // ===== createSect =====
        function createSect() {
            const nameInput = document.getElementById('sectNameInput');
            const name = nameInput.value.trim();
            
            if (!name) {
                alert('请输入宗门名称！');
                return;
            }
            
            if (gameState.spiritStones < SECT_CONFIG.createCost) {
                alert('灵石不足！');
                return;
            }
            
            if (gameState.realm < 4) {
                alert('需要元婴期才能创建宗门！');
                return;
            }
            
            gameState.spiritStones -= SECT_CONFIG.createCost;
            gameState.sect = {
                name: name,
                level: 1,
                spiritStones: 0,
                disciples: [],
                elders: [],
                buildings: {
                    library: false,
                    alchemy: false,
                    forge: false,
                    archive: false
                },
                techniques: [],
                contributionShop: [],
                lastShopRefresh: gameState.days,
                lastResourceCollection: gameState.days
            };
            
            // 给宗主添加一个初始弟子
            addDisciple('入门弟子', 3);
            
            addLog('good', '宗门创建', `恭喜！${name}正式成立，你成为开山宗主！`);

            // A5 成就检查 - 宗门创建
            if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {} };
            gameState.achievements.stats.sectContributions++;
            checkAchievements();

            saveGame();
            updateDisplay();
            renderSectHome();
        }

        // ===== renderDisciplesTab =====
        function renderDisciplesTab() {
            const sect = gameState.sect;
            const disciples = sect.disciples;
            
            let html = `
                <div style="margin-bottom:15px;">
                    <button class="btn btn-sect" onclick="recruitDisciple()" style="padding:10px 20px;">
                        ➕ 招募弟子
                    </button>
                    <button class="btn btn-sect" onclick="collectSectResources()" style="padding:10px 20px;margin-left:10px;">
                        💎 领取产出
                    </button>
                </div>
            `;
            
            if (disciples.length === 0) {
                html += '<p style="text-align:center;color:#888;padding:40px;">暂无弟子，快去招募吧！</p>';
                return html;
            }
            
            html += '<div class="disciple-list">';
            disciples.forEach((d, idx) => {
                const talentClass = d.talent === '下品' ? 'talent-low' : d.talent === '中品' ? 'talent-mid' : d.talent === '上品' ? 'talent-high' : 'talent-super';
                const statusClass = d.status === 'idle' ? 'status-idle' : d.status === 'training' ? 'status-training' : 'status-elder';
                const realmName = CONFIG.realms[d.realm] + '期';
                const isElder = sect.elders.includes(d.uid);
                // V29 NPC 角色信息
                const npcRole = d.npcRole || 'disciple';
                const roleInfo = SECT_NPC_ROLES[npcRole] || SECT_NPC_ROLES['disciple'];
                const task = getNpcTask(d.uid);
                // V35 弟子成长信息
                const level = d.level || 1;
                const exp = d.experience || 0;
                const expNeeded = level * 50;
                const expPercent = Math.min(100, Math.floor((exp / expNeeded) * 100));
                const moodIcon = d.mood === 'happy' ? '😊' : d.mood === 'upset' ? '😔' : '😐';
                const mission = d.assignment ? sect.sectMissions.find(m => m.id === d.assignment) : null;

                html += `
                    <div class="disciple-card">
                        <div class="disciple-info">
                            <span class="disciple-avatar">${roleInfo.icon}</span>
                            <div>
                                <div class="disciple-name">${d.name} <span style="color:${roleInfo.color};font-size:11px;">${roleInfo.title}</span> ${mission ? '📋' : ''}</div>
                                <div class="disciple-realm">${realmName} <span style="color:#888;font-size:11px;">Lv.${level} ${moodIcon}</span></div>
                            </div>
                            <span class="disciple-talent ${talentClass}">${d.talent}</span>
                        </div>
                        <div style="text-align:right;">
                            <div class="disciple-contribution">贡献: ${d.contribution}</div>
                            <span class="disciple-status ${statusClass}">${isElder ? '长老' : d.status}</span>
                            ${task ? `<div style="color:#888;font-size:11px;">📋${task.type === 'cultivate' ? '修炼' : task.type === 'collect' ? '采集' : '任务'}</div>` : ''}
                            <div style="color:#888;font-size:10px;margin-top:2px;">经验: ${exp}/${expNeeded}</div>
                            ${mission ? `<div style="color:#ff9800;font-size:10px;">任务: ${mission.description.substring(0,8)}...</div>` : ''}
                            <button onclick="openNpcDialogue('${d.uid}')" style="background:#333;border:1px solid #555;color:#aaa;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer;margin-top:3px;">💬</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            return html;
        }

        // ===== renderBuildingsTab =====
        function renderBuildingsTab() {
            const sect = gameState.sect;
            const level = sect.level;
            
            let html = '<div class="building-list">';
            
            for (const [key, building] of Object.entries(SECT_CONFIG.buildings)) {
                const isBuilt = sect.buildings[key];
                const isLocked = building.unlockLevel > level;
                const canBuild = !isBuilt && !isLocked && sect.spiritStones >= building.cost;
                
                let cardClass = 'building-card';
                if (isBuilt) cardClass += ' built';
                else if (isLocked) cardClass += ' locked';
                
                let statusHtml = '';
                if (isBuilt) {
                    statusHtml = '<span class="building-status built">已建造</span>';
                } else if (isLocked) {
                    statusHtml = `<span class="building-status locked">等级${building.unlockLevel}解锁</span>`;
                } else {
                    statusHtml = `<button class="building-status unbuilt" onclick="buildBuilding('${key}')" ${canBuild ? '' : 'disabled'}>建造(${building.cost}灵石)</button>`;
                }
                
                html += `
                    <div class="${cardClass}">
                        <div class="building-info">
                            <span class="building-icon">${building.icon}</span>
                            <div>
                                <div class="building-name">${building.name}</div>
                                <div class="building-effect">${building.desc}</div>
                            </div>
                        </div>
                        ${statusHtml}
                    </div>
                `;
            }
            html += '</div>';
            
            // 添加升级按钮
            if (level < 3) {
                const nextLevel = level + 1;
                const upgradeCost = SECT_CONFIG.upgradeCost[nextLevel];
                const requiredDisciples = SECT_CONFIG.upgradeDisciples[nextLevel];
                const canUpgrade = sect.spiritStones >= upgradeCost && sect.disciples.length >= requiredDisciples;
                
                html += `
                    <div style="margin-top:20px;text-align:center;">
                        <h4 style="color:#9c27b0;margin-bottom:10px;">升级宗门到 ${nextLevel} 级</h4>
                        <p style="color:#aaa;font-size:0.9em;">
                            消耗：${upgradeCost}灵石 | 需要：${requiredDisciples}名弟子<br>
                            当前弟子：${sect.disciples.length}名
                        </p>
                        <button class="btn btn-sect" onclick="upgradeSect()" ${canUpgrade ? '' : 'disabled'} style="margin-top:10px;">
                            ⬆️ 升级宗门
                        </button>
                    </div>
                `;
            } else {
                html += '<p style="text-align:center;color:#ffd700;padding:20px;">🏆 宗门已升至最高等级！</p>';
            }
            
            return html;
        }

        // ===== renderTechniquesTab =====
        function renderTechniquesTab() {
            const sect = gameState.sect;
            
            let html = '';
            
            // 宗主功法
            if (gameState.techniques && gameState.techniques.length > 0) {
                html += '<h4 style="color:#9c27b0;margin-bottom:10px;">📖 你的功法</h4>';
                html += '<div class="technique-list" style="margin-bottom:20px;">';
                gameState.techniques.forEach(tech => {
                    const gradeClass = SECT_CONFIG.techniqueGradeColors[tech.grade] || 'grade-human';
                    html += `
                        <div class="technique-card">
                            <div class="technique-info">
                                <span class="technique-icon">${tech.icon || '📖'}</span>
                                <div>
                                    <div class="technique-name">${tech.name}</div>
                                    <div class="technique-effect">${tech.desc}</div>
                                </div>
                            </div>
                            <div class="technique-action">
                                <span class="technique-grade ${gradeClass}">${SECT_CONFIG.techniqueGrades[tech.grade] || '人阶'}</span>
                                ${sect.buildings.library ? `<button class="btn btn-sect" onclick="donateTechnique('${tech.name}')" style="padding:5px 15px;font-size:0.85em;">存入功法阁</button>` : ''}
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            // 宗门功法阁
            if (!sect.buildings.library) {
                html += '<p style="text-align:center;color:#888;padding:20px;">📚 建造功法阁后可存放功法</p>';
            } else if (sect.techniques.length === 0) {
                html += '<p style="text-align:center;color:#888;padding:20px;">📚 功法阁暂无功法，快存入功法吧！</p>';
            } else {
                html += '<h4 style="color:#9c27b0;margin-bottom:10px;">📚 功法阁</h4>';
                html += '<div class="technique-list">';
                sect.techniques.forEach((tech, idx) => {
                    const gradeClass = SECT_CONFIG.techniqueGradeColors[tech.grade] || 'grade-human';
                    html += `
                        <div class="technique-card">
                            <div class="technique-info">
                                <span class="technique-icon">${tech.icon || '📖'}</span>
                                <div>
                                    <div class="technique-name">${tech.name}</div>
                                    <div class="technique-effect">${tech.desc}</div>
                                </div>
                            </div>
                            <div class="technique-action">
                                <span class="technique-grade ${gradeClass}">${SECT_CONFIG.techniqueGrades[tech.grade] || '人阶'}</span>
                                <button class="btn btn-sect" onclick="learnSectTechnique(${idx})" style="padding:5px 15px;font-size:0.85em;">学习</button>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            return html;
        }

        // ===== renderContributionShop =====
        function renderContributionShop() {
            const sect = gameState.sect;
            
            // 刷新商店
            if (sect.lastShopRefresh === 0 || gameState.days - sect.lastShopRefresh >= 3) {
                refreshContributionShop();
            }
            
            let html = `
                <div style="margin-bottom:15px;text-align:center;">
                    <p style="color:#aaa;">贡献商店每72小时刷新</p>
                    <p style="color:#9c27b0;">你的贡献点：<span style="font-weight:bold;">${getPlayerContribution()}</span></p>
                </div>
            `;
            
            if (sect.contributionShop.length === 0) {
                html += '<p style="text-align:center;color:#888;padding:40px;">商店暂无物品</p>';
                return html;
            }
            
            html += '<div class="contribution-shop">';
            sect.contributionShop.forEach((item, idx) => {
                const canBuy = getPlayerContribution() >= item.cost;
                html += `
                    <div class="shop-item-card">
                        <div class="shop-item-info">
                            <div class="shop-item-name">${item.icon || '📦'} ${item.name}</div>
                            <div class="shop-item-desc">${item.desc}</div>
                        </div>
                        <div class="contribution-cost">${item.cost}贡献</div>
                        <button class="btn btn-sect" onclick="buyContributionItem(${idx})" ${canBuy ? '' : 'disabled'} style="padding:8px 15px;font-size:0.85em;">
                            购买
                        </button>
                    </div>
                `;
            });
            html += '</div>';
            
            return html;
        }

        // ===== renderManageTab =====
        function renderManageTab() {
            const sect = gameState.sect;
            
            let html = `
                <h4 style="color:#9c27b0;margin-bottom:15px;">👴 长老席位</h4>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px;">
            `;
            
            const maxElders = sect.level >= 2 ? 3 : 0;
            
            for (let i = 0; i < maxElders; i++) {
                const elder = sect.elders[i] ? sect.disciples.find(d => d.uid === sect.elders[i]) : null;
                
                if (elder) {
                    html += `
                        <div class="elder-slot filled">
                            <div style="font-size:2em;">👴</div>
                            <div class="disciple-name">${elder.name}</div>
                            <div class="disciple-realm">${CONFIG.realms[elder.realm]}期</div>
                            <button class="elder-assign-btn" onclick="removeElder(${i})" style="background:#c62828;margin-top:10px;">免职</button>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="elder-slot">
                            <div class="elder-empty">空缺</div>
                            <button class="elder-assign-btn" onclick="assignElder(${i})">任命</button>
                        </div>
                    `;
                }
            }
            
            if (maxElders === 0) {
                html += '<p style="grid-column:span 3;text-align:center;color:#888;padding:20px;">宗门2级后解锁长老席位</p>';
            }
            
            html += '</div>';
            
            // 宗主操作
            html += `
                <h4 style="color:#9c27b0;margin-bottom:15px;">⚙️ 宗主操作</h4>
                <div style="display:grid;gap:10px;">
                    <button class="btn btn-sect" onclick="disbandSect()" style="background:#c62828;padding:12px;">
                        💀 解散宗门（不可恢复）
                    </button>
                </div>
            `;
            
            return html;
        }

        // ===== recruitDisciple =====
        function recruitDisciple() {
            const sect = gameState.sect;
            const maxDisciples = SECT_CONFIG.maxDisciples[sect.level];
            
            if (sect.disciples.length >= maxDisciples) {
                alert(`宗门人数已达上限（${maxDisciples}人）！`);
                return;
            }
            
            // 消耗灵石
            const recruitCost = 100;
            if (gameState.spiritStones < recruitCost) {
                alert('灵石不足！需要 ' + recruitCost + ' 灵石');
                return;
            }
            
            gameState.spiritStones -= recruitCost;
            
            // 随机生成弟子
            const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十', '钱二', '孙三'];
            const randomName = names[Math.floor(Math.random() * names.length)] + ' [' + Math.floor(Math.random() * 100) + ']';
            const talent = weightedRandom(SECT_CONFIG.talentWeights);
            const talentIndex = SECT_CONFIG.talents.indexOf(talent);
            const realm = Math.max(0, gameState.realm - 1);
            
            addDisciple(randomName, realm, talentIndex);
            
            addLog('good', '招募弟子', `成功招募 ${randomName}（${talent}资质）`);
            saveGame();
            updateDisplay();
            renderSectHome();
        }

        // ===== addDisciple =====
        function addDisciple(name, realm, talentIndex = 1) {
            const sect = gameState.sect;
            const uid = 'd_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            
            sect.disciples.push({
                uid: uid,
                name: name,
                realm: realm,
                talent: SECT_CONFIG.talents[talentIndex],
                talentIndex: talentIndex,
                contribution: 0,
                techniques: [],
                status: 'idle',
                npcRole: 'disciple'  // V29 默认弟子角色
            });
            
            // V29 自动分配 NPC 角色
            const newDisciple = sect.disciples[sect.disciples.length - 1];
            assignNpcRole(newDisciple);
        }

        // ===== weightedRandom =====
        function weightedRandom(weights) {
            const total = weights.reduce((a, b) => a + b, 0);
            let random = Math.random() * total;
            for (let i = 0; i < weights.length; i++) {
                random -= weights[i];
                if (random <= 0) return i;
            }
            return weights.length - 1;
        }

        // ===== collectSectResources =====
        function collectSectResources() {
            const sect = gameState.sect;
            const daysPassed = gameState.days - sect.lastResourceCollection;
            
            if (daysPassed < 1) {
                alert('今日已领取产出！');
                return;
            }
            
            const income = calculateSectIncome();
            const totalIncome = income * daysPassed;
            
            sect.spiritStones += totalIncome;
            sect.lastResourceCollection = gameState.days;
            
            // 弟子贡献值增加
            sect.disciples.forEach(d => {
                const contribGain = Math.floor(5 + d.talentIndex * 2);
                d.contribution += contribGain;
            });
            
            // 建筑产出
            if (sect.buildings.alchemy) {
                const pills = daysPassed * 2;
                addItemToInventory('聚灵丹', pills);
            }
            
            if (sect.buildings.forge && daysPassed >= 3) {
                const treasures = Math.floor(daysPassed / 3);
                if (treasures > 0) {
                    addItemToInventory('青云剑', treasures);
                }
            }
            
            addLog('good', '宗门产出', `领取了 ${daysPassed} 天的宗门产出，共 ${totalIncome} 灵石`);
            saveGame();
            updateDisplay();
            renderSectHome();
        }

        // ===== calculateSectIncome =====
        function calculateSectIncome() {
            const sect = gameState.sect;
            let income = 0;
            
            // 弟子修炼产出
            sect.disciples.forEach(d => {
                const realmMultiplier = (d.realm + 1) * 10;
                const talentMultiplier = 1 + d.talentIndex * 0.2;
                income += Math.floor(realmMultiplier * talentMultiplier);
            });
            
            // 长老加成
            sect.elders.forEach(elderUid => {
                const elder = sect.disciples.find(d => d.uid === elderUid);
                if (elder) {
                    income += 500;
                }
            });
            
            return income;
        }

        // ===== buildBuilding =====
        function buildBuilding(key) {
            const sect = gameState.sect;
            const building = SECT_CONFIG.buildings[key];
            
            if (sect.spiritStones < building.cost) {
                alert('宗门灵石不足！');
                return;
            }
            
            sect.spiritStones -= building.cost;
            sect.buildings[key] = true;
            
            addLog('good', '建筑建造', `成功建造 ${building.name}！`);
            saveGame();
            updateDisplay();
            renderSectHome();
        }

        // ===== upgradeSect =====
        function upgradeSect() {
            const sect = gameState.sect;
            const nextLevel = sect.level + 1;
            const cost = SECT_CONFIG.upgradeCost[nextLevel];
            const requiredDisciples = SECT_CONFIG.upgradeDisciples[nextLevel];
            
            if (sect.spiritStones < cost) {
                alert('宗门灵石不足！');
                return;
            }
            
            if (sect.disciples.length < requiredDisciples) {
                alert(`弟子人数不足！需要 ${requiredDisciples} 名弟子`);
                return;
            }
            
            // 检查1级建筑是否全部建成
            if (nextLevel === 3) {
                if (!sect.buildings.library || !sect.buildings.alchemy || !sect.buildings.forge) {
                    alert('升级需要全部1级建筑！');
                    return;
                }
            }
            
            sect.spiritStones -= cost;
            sect.level = nextLevel;
            
            addLog('good', '宗门升级', `宗门升级为 ${nextLevel} 级！`);
            saveGame();
            updateDisplay();
            renderSectHome();
        }

        // ===== donateTechnique =====
        function donateTechnique(techName) {
            const sect = gameState.sect;
            const techIndex = gameState.techniques.findIndex(t => t.name === techName);
            
            if (techIndex === -1) return;
            
            const tech = gameState.techniques[techIndex];
            sect.techniques.push(tech);
            gameState.techniques.splice(techIndex, 1);
            
            addLog('good', '功法传承', `将 ${techName} 存入功法阁`);
            saveGame();
            renderSectHome();
        }

        // ===== learnSectTechnique =====
        function learnSectTechnique(idx) {
            const sect = gameState.sect;
            const tech = sect.techniques[idx];
            
            if (!tech) return;
            
            // 检查是否已学习
            if (gameState.techniques.find(t => t.name === tech.name)) {
                alert('已学习此功法！');
                return;
            }
            
            // 检查等级要求
            if (tech.grade >= 2 && sect.level < 2) {
                alert('宗门等级不足！');
                return;
            }
            if (tech.grade >= 3 && sect.level < 3) {
                alert('宗门等级不足！');
                return;
            }
            
            // 学习消耗灵石
            const cost = (tech.grade + 1) * 500;
            if (gameState.spiritStones < cost) {
                alert('灵石不足！需要 ' + cost + ' 灵石');
                return;
            }
            
            gameState.spiritStones -= cost;
            gameState.techniques.push(tech);
            
            // 应用功法效果
            if (tech.effect) {
                const effectType = tech.effect.type;
                if (gameState.activeEffects.hasOwnProperty(effectType)) {
                    gameState.activeEffects[effectType] += tech.effect.value;
                }
            }
            
            addLog('good', '功法学习', `学习了 ${tech.name}！`);
            saveGame();
            updateDisplay();
            renderSectHome();
        }

        // ===== refreshContributionShop =====
        function refreshContributionShop() {
            const sect = gameState.sect;
            sect.contributionShop = [...CONTRIBUTION_SHOP_ITEMS];
            sect.lastShopRefresh = gameState.days;
        }

        // ===== getPlayerContribution =====
        function getPlayerContribution() {
            const sect = gameState.sect;
            const myDisciple = sect.disciples.find(d => d.uid === 'player');
            return myDisciple ? myDisciple.contribution : 0;
        }

        // ===== buyContributionItem =====
        function buyContributionItem(idx) {
            const sect = gameState.sect;
            const item = sect.contributionShop[idx];
            
            if (!item) return;
            
            const contribution = getPlayerContribution();
            if (contribution < item.cost) {
                alert('贡献点不足！');
                return;
            }
            
            // 扣除贡献
            const myDisciple = sect.disciples.find(d => d.uid === 'player');
            if (myDisciple) {
                myDisciple.contribution -= item.cost;
            }
            
            // 给予物品
            if (item.type === 'technique') {
                const tech = SECT_TECHNIQUES[item.data];
                if (tech && !gameState.techniques.find(t => t.name === item.data)) {
                    gameState.techniques.push({
                        name: item.data,
                        grade: tech.grade,
                        icon: tech.icon,
                        desc: tech.desc,
                        effect: tech.effect
                    });
                    addLog('good', '购买功法', `获得 ${item.data}！`);
                }
            } else if (item.type === 'pill') {
                addItemToInventory(item.data, item.quantity || 1);
                addLog('good', '购买丹药', `获得 ${item.name}！`);
            } else if (item.type === 'buff') {
                addLog('good', '购买特权', `获得 ${item.name}！`);
            }
            
            saveGame();
            renderSectHome();
        }

        // ===== addItemToInventory =====
        function addItemToInventory(name, quantity) {
            const existing = gameState.inventory.find(i => i.name === name);
            if (existing) {
                existing.quantity += quantity;
            } else {
                gameState.inventory.push({ name: name, quantity: quantity });
            }
        }

        // ===== assignElder =====
        function assignElder(slot) {
            const sect = gameState.sect;
            const availableDisciples = sect.disciples.filter(d => !sect.elders.includes(d.uid));
            
            if (availableDisciples.length === 0) {
                alert('没有可任命的弟子！');
                return;
            }
            
            // 简单实现：自动任命第一个非长老弟子
            const newElder = availableDisciples[0];
            sect.elders[slot] = newElder.uid;
            newElder.status = 'elder';
            
            addLog('good', '任命长老', `${newElder.name} 被任命为长老！`);
            saveGame();
            renderSectHome();
        }

        // ===== removeElder =====
        function removeElder(slot) {
            const sect = gameState.sect;
            const elderUid = sect.elders[slot];
            
            if (!elderUid) return;
            
            const elder = sect.disciples.find(d => d.uid === elderUid);
            if (elder) {
                elder.status = 'idle';
            }
            
            sect.elders.splice(slot, 1);
            
            addLog('neutral', '免职长老', `${elder ? elder.name : '长老'} 被免职`);
            saveGame();
            renderSectHome();
        }

        // ===== disbandSect =====
        function disbandSect() {
            if (!confirm('确定要解散宗门吗？此操作不可恢复！')) return;
            
            addLog('bad', '宗门解散', `${gameState.sect.name} 已解散！`);
            
            gameState.sect = {
                name: null,
                level: 0,
                spiritStones: 0,
                disciples: [],
                elders: [],
                buildings: {
                    library: false,
                    alchemy: false,
                    forge: false,
                    archive: false
                },
                techniques: [],
                contributionShop: [],
                lastShopRefresh: 0,
                lastResourceCollection: 0
            };
            
            saveGame();
            updateDisplay();
            closeSect();
        }

        // ===== checkSectCreation =====
        function checkSectCreation() {
            const sectBtn = document.getElementById('sectBtn');
            if (!sectBtn) return;
            
            if (gameState.sect && gameState.sect.name) {
                sectBtn.style.display = 'inline-block';
            } else {
                sectBtn.style.display = 'none';
            }
        }

        // ===== V29 NPC AI 系统 =====

        // NPC 角色配置
        const SECT_NPC_ROLES = {
            'leader': { title: '掌门', icon: '👑', color: '#FFD700', greet: '宗主驾临，有何吩咐？', topics: ['宗门管理', '任务发布', '战略指导'] },
            'elder':  { title: '长老', icon: '👴', color: '#9c27b0', greet: '师叔祖有何指教？', topics: ['修炼指导', '功法传授', '境界点评'] },
            'disciple': { title: '弟子', icon: '🧑‍🎓', color: '#4CAF50', greet: '弟子拜见宗主！', topics: ['请求指点', '汇报修炼', '闲聊'] }
        };

        // 分配 NPC 角色
        function assignNpcRole(disciple) {
            if (!disciple) return;
            // 境界 >= 6 (元婴期) 自动成为长老
            if (disciple.realm >= 6 && gameState.sect.elders.length < 3) {
                disciple.npcRole = 'elder';
                if (!gameState.sect.elders.includes(disciple.uid)) {
                    gameState.sect.elders.push(disciple.uid);
                }
            } else if (gameState.sect.disciples.filter(d => d.npcRole === 'leader').length === 0 && disciple.realm >= 3) {
                // 第一个境界较高者成为掌门
                disciple.npcRole = 'leader';
            } else {
                disciple.npcRole = 'disciple';
            }
        }

        // 打开 NPC 对话框
        function openNpcDialogue(uid) {
            const disciple = gameState.sect.disciples.find(d => d.uid === uid);
            if (!disciple) return;
            
            const role = SECT_NPC_ROLES[disciple.npcRole] || SECT_NPC_ROLES['disciple'];
            const realmName = CONFIG.realms[disciple.realm] || '未知';
            
            // 获取该 NPC 的历史对话
            const npcHistory = gameState.sect.npcDialogueHistory.filter(h => h.uid === uid).slice(-20);
            
            let html = `<div id="npcDialogueModal" class="modal active" style="z-index:1001;">
                <div class="modal-content" style="background:#1a1a2e;max-width:500px;">
                    <div style="background:${role.color};padding:15px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:24px;">${role.icon}</span>
                            <div>
                                <div style="font-weight:bold;color:#fff;">${disciple.name}</div>
                                <div style="font-size:12px;color:rgba(255,255,255,0.8);">${role.title} · ${realmName}期</div>
                            </div>
                        </div>
                        <button onclick="closeNpcDialogue()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;padding:8px 12px;border-radius:5px;cursor:pointer;">关闭</button>
                    </div>
                    <div id="npcDialogueHistory" style="height:250px;overflow-y:auto;padding:15px;background:#16213e;">
                        <div style="color:#888;text-align:center;margin-bottom:10px;">—— 对话记录 ——</div>
                        ${npcHistory.length === 0 ? '<div style="color:#666;text-align:center;">暂无对话记录</div>' : ''}
                        ${npcHistory.map(h => `
                            <div style="margin-bottom:10px;${h.isPlayer ? 'text-align:right;' : ''}">
                                <div style="display:inline-block;padding:8px 12px;border-radius:10px;max-width:80%;${h.isPlayer ? 'background:#4a4a6a;color:#fff;' : 'background:#2a2a4a;color:#ddd;'}">
                                    <div style="font-size:11px;opacity:0.7;margin-bottom:3px;">${h.isPlayer ? '你' : disciple.name}</div>
                                    ${h.text}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="padding:15px;background:#1a1a2e;border-top:1px solid #333;">
                        <div style="margin-bottom:10px;display:flex;gap:5px;flex-wrap:wrap;">
                            ${role.topics.map(t => `<button onclick="sendNpcQuickReply('${uid}', '${t}')" style="background:#333;border:1px solid #555;color:#aaa;padding:5px 10px;border-radius:15px;font-size:12px;cursor:pointer;">${t}</button>`).join('')}
                        </div>
                        <div style="display:flex;gap:8px;">
                            <input type="text" id="npcMessageInput" placeholder="输入对话内容..." style="flex:1;padding:10px;border-radius:8px;border:1px solid #444;background:#252540;color:#fff;" onkeypress="if(event.key==='Enter')sendNpcMessage('${uid}')">
                            <button onclick="sendNpcMessage('${uid}')" style="background:${role.color};border:none;color:#fff;padding:10px 20px;border-radius:8px;cursor:pointer;">发送</button>
                        </div>
                    </div>
                </div>
            </div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
            document.getElementById('npcMessageInput').focus();
        }

        // 关闭 NPC 对话框
        function closeNpcDialogue() {
            const modal = document.getElementById('npcDialogueModal');
            if (modal) modal.remove();
        }

        // 发送 NPC 消息
        function sendNpcMessage(uid) {
            const input = document.getElementById('npcMessageInput');
            if (!input || !input.value.trim()) return;
            const text = input.value.trim();
            input.value = '';
            
            const disciple = gameState.sect.disciples.find(d => d.uid === uid);
            if (!disciple) return;
            
            // 记录玩家消息
            gameState.sect.npcDialogueHistory.push({ uid, text, isPlayer: true, day: gameState.days });
            if (gameState.sect.npcDialogueHistory.length > 100) gameState.sect.npcDialogueHistory.shift();
            
            // 生成 NPC 回复
            const response = generateNpcResponse(disciple, text);
            
            // 记录 NPC 回复
            gameState.sect.npcDialogueHistory.push({ uid, text: response, isPlayer: false, day: gameState.days });
            
            // 刷新对话 UI
            const historyDiv = document.getElementById('npcDialogueHistory');
            if (historyDiv) {
                const npcHistory = gameState.sect.npcDialogueHistory.filter(h => h.uid === uid).slice(-20);
                historyDiv.innerHTML = npcHistory.map(h => `
                    <div style="margin-bottom:10px;${h.isPlayer ? 'text-align:right;' : ''}">
                        <div style="display:inline-block;padding:8px 12px;border-radius:10px;max-width:80%;${h.isPlayer ? 'background:#4a4a6a;color:#fff;' : 'background:#2a2a4a;color:#ddd;'}">
                            <div style="font-size:11px;opacity:0.7;margin-bottom:3px;">${h.isPlayer ? '你' : disciple.name}</div>
                            ${h.text}
                        </div>
                    </div>
                `).join('');
                historyDiv.scrollTop = historyDiv.scrollHeight;
            }
            
            saveGame();
        }

        // 快捷回复
        function sendNpcQuickReply(uid, topic) {
            const quickReplies = {
                '宗门管理': '最近宗门运转如何？有哪些需要决策的大事？',
                '任务发布': '我有一项重要任务要交给宗门弟子。',
                '战略指导': '关于宗门未来的发展，你有何建议？',
                '修炼指导': '我近期修炼遇到瓶颈，如何突破？',
                '功法传授': '可否传授我一门高阶功法？',
                '境界点评': '以我目前的修为，还有哪些不足？',
                '请求指点': '长老，我该如何更快提升境界？',
                '汇报修炼': '弟子近期修炼有所进展，请过目。',
                '闲聊': '今日天气不错，修炼之余也想放松一下。'
            };
            
            const input = document.getElementById('npcMessageInput');
            if (input) input.value = quickReplies[topic] || topic;
            sendNpcMessage(uid);
        }

        // 生成 NPC 回复
        function generateNpcResponse(disciple, message) {
            const role = disciple.npcRole || 'disciple';
            const realmName = CONFIG.realms[disciple.realm] || '未知';
            const lowerMsg = message.toLowerCase();
            
            if (lowerMsg.includes('任务') || lowerMsg.includes('交给')) {
                if (role === 'leader') return '宗主放心，我这就安排弟子去办！不知是要紧任务还是日常事务？';
                if (role === 'elder') return '长老会尽力指导弟子完成任务，请宗主指示具体目标。';
                return '弟子愿为宗门效力！请宗主吩咐任务内容。';
            }
            
            if (lowerMsg.includes('境界') || lowerMsg.includes('修为') || lowerMsg.includes('突破')) {
                if (disciple.realm >= 8) return `以${realmName}的修为，我认为您应当尝试进入更深层次的修炼，天道法则已离您不远。`;
                if (disciple.realm >= 5) return `师叔祖目前处于${realmName}，若能集齐上品丹药和天道装备，突破指日可待。`;
                return '弟子目前才疏学浅，但若宗主需要，弟子愿潜心研究突破之法。';
            }
            
            if (lowerMsg.includes('功法') || lowerMsg.includes('传授')) {
                if (gameState.sect.buildings.library && gameState.sect.techniques.length > 0) {
                    const tech = gameState.sect.techniques[Math.floor(Math.random() * gameState.sect.techniques.length)];
                    return `本门功法阁藏有「${tech.name}」，师祖若有兴趣，弟子可以为您讲解。`;
                } else {
                    return '功法阁尚未建立，无法传授高阶功法。还请宗主先建造功法阁。';
                }
            }
            
            if (lowerMsg.includes('资源') || lowerMsg.includes('灵石') || lowerMsg.includes('采集')) {
                return `宗门目前有灵石 ${gameState.sect.spiritStones} 枚，弟子们每日可采集 ${calculateSectIncome()} 灵石。`;
            }
            
            if (lowerMsg.includes('天气') || lowerMsg.includes('放松') || lowerMsg.includes('闲聊')) {
                const randomChats = [
                    '是啊，今日灵气充沛，正是修炼的好时机。',
                    '弟子平日除了修炼，也喜欢研读功法典籍。',
                    '听闻天外天最近有异象，不知是福是祸。',
                    '宗主洪福齐天，宗门上下都对您敬佩有加！',
                    '修行之路漫漫，能与同门共进退，实乃幸事。'
                ];
                return randomChats[Math.floor(Math.random() * randomChats.length)];
            }
            
            const defaultReplies = {
                'leader': ['宗主英明，弟子定当遵从。', '此事需从长计议，请宗主三思。', '宗门事务繁忙，全赖宗主运筹帷幄。'],
                'elder': ['弟子受教，定当努力修炼。', '多谢宗主指点，弟子明白了。', '师叔祖教训的是，弟子谨记。'],
                'disciple': ['弟子领命！', '是，宗主！', '弟子这就去办！']
            };
            const replies = defaultReplies[role] || defaultReplies['disciple'];
            return replies[Math.floor(Math.random() * replies.length)];
        }

        // 分配 NPC 任务
        function assignNpcTask(uid, taskType, target) {
            const disciple = gameState.sect.disciples.find(d => d.uid === uid);
            if (!disciple) return;
            
            // 移除旧任务
            gameState.sect.npcTasks = gameState.sect.npcTasks.filter(t => t.uid !== uid);
            
            const taskNames = { cultivate: '闭关修炼', collect: '灵石采集', alchemy: '丹药炼制', forge: '装备炼制' };
            const endDay = gameState.days + Math.floor(Math.random() * 5) + 3;
            
            gameState.sect.npcTasks.push({
                uid,
                type: taskType,
                target: target || (taskType === 'cultivate' ? disciple.realm + 1 : null),
                startDay: gameState.days,
                endDay: endDay,
                completed: false,
                progress: 0
            });
            
            disciple.status = taskType === 'cultivate' ? 'meditating' : 'training';
            addLog('good', '任务分配', `${disciple.name}开始执行「${taskNames[taskType]}」任务`);
            saveGame();
        }

        // 处理 NPC 任务（每日结算时调用）
        function processNpcTasks() {
            if (!gameState.sect || !gameState.sect.name) return;
            
            const taskNames = { cultivate: '修炼', collect: '采集', alchemy: '炼丹', forge: '炼器' };
            
            gameState.sect.npcTasks.forEach(task => {
                const disciple = gameState.sect.disciples.find(d => d.uid === task.uid);
                if (!disciple || task.completed) return;
                
                if (task.type === 'cultivate') {
                    const talentBonus = disciple.talent === '极品' ? 3 : disciple.talent === '上品' ? 2 : 1;
                    const progress = (Math.random() * 0.5 + 0.5) * talentBonus;
                    task.progress = Math.min(1, (task.progress || 0) + progress / 10);
                    
                    if (task.progress >= 1 && disciple.realm < task.target) {
                        disciple.realm++;
                        task.completed = true;
                        addLog('good', '弟子突破', `${disciple.name}在${taskNames[task.type]}中成功突破到${CONFIG.realms[disciple.realm]}！`);
                        if (disciple.npcRole === 'disciple' && disciple.realm >= 6) {
                            disciple.npcRole = 'elder';
                            if (!gameState.sect.elders.includes(disciple.uid)) {
                                gameState.sect.elders.push(disciple.uid);
                            }
                            addLog('good', '长老晋升', `${disciple.name}晋升为长老！`);
                        }
                    }
                }
                
                if (task.type === 'collect') {
                    const income = Math.floor((Math.random() * 20 + 10) * (1 + disciple.realm * 0.2));
                    gameState.sect.spiritStones += income;
                    task.progress = Math.min(1, (task.progress || 0) + 1/5);
                }
                
                if (gameState.days >= task.endDay && !task.completed) {
                    task.completed = true;
                    disciple.status = 'idle';
                    addLog('normal', '任务结束', `${disciple.name}的「${taskNames[task.type]}」任务已结束`);
                }
            });
            
            gameState.sect.npcTasks = gameState.sect.npcTasks.filter(t => !t.completed || (gameState.days - t.endDay) < 3);
        }

        // 获取 NPC 当前任务
        function getNpcTask(uid) {
            return gameState.sect.npcTasks.find(t => t.uid === uid && !t.completed);
        }

        // NPC 自动行为
        function processNpcAutoBehavior() {
            if (!gameState.sect || !gameState.sect.name) return;
            
            gameState.sect.disciples.forEach(d => {
                const hasTask = getNpcTask(d.uid);
                if (!hasTask) {
                    d.status = 'meditating';
                    const progress = (Math.random() * 0.3 + 0.1) * (d.talent === '极品' ? 2 : d.talent === '上品' ? 1.5 : 1);
                    d.cultivationProgress = Math.min(100, d.cultivationProgress + progress);
                    
                    if (d.cultivationProgress >= 100 && d.realm < 12) {
                        d.realm++;
                        d.cultivationProgress = 0;
                        addLog('good', '弟子突破', `${d.name}闭关修炼，境界提升至${CONFIG.realms[d.realm]}！`);
                        if (d.npcRole === 'disciple' && d.realm >= 6) {
                            d.npcRole = 'elder';
                            if (!gameState.sect.elders.includes(d.uid)) {
                                gameState.sect.elders.push(d.uid);
                                addLog('good', '长老晋升', `${d.name}晋升为长老！`);
                            }
                        }
                    }
                }
            });
        }

        // ===== V30 渡劫审批系统 =====

        // 渡劫审批申请界面
        function openTribulationRequest() {
            const req = gameState.sect.tribulationRequest;
            const realm = gameState.realm;
            const stage = gameState.stage;
            const mindset = gameState.mindset;
            const tribulationsDone = gameState.achievements?.stats?.tribulationsCompleted || 0;

            // 检查装备评分
            let equipScore = 0;
            const qualityOrder = { common: 0, rare: 1, precious: 2, legendary: 3 };
            for (const equip of gameState.equippedTreasures) {
                if (equip) equipScore = Math.max(equipScore, qualityOrder[equip.quality] || 0);
            }
            for (const item of gameState.inventory) {
                if (item.type === 'treasure') equipScore = Math.max(equipScore, qualityOrder[item.quality] || 0);
            }

            // 检查渡劫丹
            const tribPillCount = gameState.inventory.filter(i => i.name === '渡劫丹').length;

            // 检查是否已有待处理审批
            if (req.status === 'pending_elder' || req.status === 'pending_leader') {
                showTribulationRequestStatus(req, equipScore, mindset, tribPillCount, tribulationsDone);
                return;
            }

            if (req.status === 'approved') {
                // 已批准，直接进入渡劫
                showToast('审批已通过，点击突破进入渡劫');
                return;
            }

            // 显示申请界面
            let html = `<div style="padding:20px;">`;
            html += `<h3 style="color:#ffd700;margin-bottom:15px;text-align:center;">📜 渡劫审批申请书</h3>`;

            // 当前准备状态
            html += `<div style="background:#1a1a2e;padding:12px;border-radius:8px;margin-bottom:12px;">`;
            html += `<div style="color:#aaa;font-size:12px;margin-bottom:8px;">【申请人】${gameState.playerName || '修士'}</div>`;
            html += `<div style="color:#aaa;font-size:12px;margin-bottom:4px;">境界：${CONFIG.realms[realm]}${CONFIG.stages[stage]}</div>`;
            html += `<div style="color:#aaa;font-size:12px;margin-bottom:4px;">心态：${mindset}/100 ${mindset >= 60 ? '✅' : '❌'}</div>`;
            html += `<div style="color:#aaa;font-size:12px;margin-bottom:4px;">装备评分：${['普通', '稀有', '珍贵', '传说'][equipScore] || '普通'} ${equipScore >= 1 ? '✅' : '❌'}</div>`;
            html += `<div style="color:#aaa;font-size:12px;margin-bottom:4px;">渡劫丹：×${tribPillCount} ${tribPillCount >= 1 ? '✅' : '❌'}</div>`;
            html += `<div style="color:#aaa;font-size:12px;">历史渡劫：${tribulationsDone}次 ${tribulationsDone > 0 ? '✅' : '❌'}</div>`;
            html += `</div>`;

            // 当前审批状态
            if (req.status === 'rejected') {
                html += `<div style="background:#2d1a1a;padding:12px;border-radius:8px;margin-bottom:12px;border:1px solid #e57373;">`;
                html += `<div style="color:#e57373;font-size:13px;margin-bottom:5px;">❌ 审批驳回</div>`;
                html += `<div style="color:#aaa;font-size:12px;">长老意见：${req.elderComment}</div>`;
                html += `<div style="color:#aaa;font-size:12px;">掌门决定：${req.leaderComment}</div>`;
                html += `</div>`;
            }

            // 提交按钮
            const canSubmit = req.status === 'none' || req.status === 'rejected';
            if (canSubmit) {
                html += `<button onclick="submitTribulationRequest(${equipScore},${mindset},${tribPillCount},${tribulationsDone})" style="width:100%;padding:12px;background:linear-gradient(135deg,#9c27b0,#e91e63);color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;">📮 提交审批</button>`;
            }
            html += `<button onclick="closeModal()" style="width:100%;margin-top:8px;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>`;
            html += `</div>`;

            openModal('渡劫审批', html, '');
        }

        // 显示审批状态
        function showTribulationRequestStatus(req, equipScore, mindset, tribPillCount, tribulationsDone) {
            let html = `<div style="padding:20px;">`;
            html += `<h3 style="color:#ffd700;margin-bottom:15px;text-align:center;">📜 渡劫审批进度</h3>`;

            const statusMap = {
                'pending_elder': { icon: '👴', text: '长老审核中...', color: '#ff9800' },
                'pending_leader': { icon: '👑', text: '掌门审批中...', color: '#ff9800' },
                'approved': { icon: '✅', text: '已批准', color: '#4caf50' },
                'rejected': { icon: '❌', text: '已驳回', color: '#e57373' }
            };
            const s = statusMap[req.status] || statusMap['none'];

            html += `<div style="background:#1a1a2e;padding:12px;border-radius:8px;margin-bottom:12px;text-align:center;">`;
            html += `<div style="font-size:32px;margin-bottom:8px;">${s.icon}</div>`;
            html += `<div style="color:${s.color};font-size:14px;">${s.text}</div>`;
            html += `</div>`;

            if (req.elderComment) {
                html += `<div style="background:#1a1a2e;padding:10px;border-radius:8px;margin-bottom:8px;">`;
                html += `<div style="color:#aaa;font-size:11px;">长老评估：</div>`;
                html += `<div style="color:#ff9800;font-size:12px;">${req.elderComment}</div>`;
                html += `</div>`;
            }
            if (req.leaderComment) {
                html += `<div style="background:#1a1a2e;padding:10px;border-radius:8px;margin-bottom:8px;">`;
                html += `<div style="color:#aaa;font-size:11px;">掌门决定：</div>`;
                html += `<div style="color:#e57373;font-size:12px;">${req.leaderComment}</div>`;
                html += `</div>`;
            }

            if (req.status === 'approved') {
                html += `<div style="background:#1a3a2e;padding:10px;border-radius:8px;margin-bottom:12px;text-align:center;">`;
                html += `<div style="color:#4caf50;font-size:13px;">✨ 掌门祝福：渡劫成功率+5%</div>`;
                html += `</div>`;
            }

            html += `<button onclick="closeModal()" style="width:100%;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>`;
            html += `</div>`;
            openModal('渡劫审批', html, '');
        }

        // 提交审批
        function submitTribulationRequest(equipScore, mindset, tribPillCount, tribulationsDone) {
            gameState.sect.tribulationRequest = {
                status: 'pending_elder',
                elderScore: 0,
                elderComment: '',
                leaderDecision: '',
                leaderComment: '',
                buffApplied: false,
                submitDay: gameState.days
            };

            // 长老立即审核
            processElderReview(equipScore, mindset, tribPillCount, tribulationsDone);
            closeModal();
            openTribulationRequest(); // 重新打开显示状态
        }

        // 长老审核
        function processElderReview(equipScore, mindset, tribPillCount, tribulationsDone) {
            let score = 0;
            let comments = [];

            if (equipScore >= 1) { score++; comments.push('装备尚可'); }
            else comments.push('装备较差');

            if (mindset >= 60) { score++; comments.push('心态稳定'); }
            else comments.push('心态不足');

            if (tribPillCount >= 1) { score++; comments.push('备有渡劫丹'); }
            else comments.push('未备渡劫丹');

            if (tribulationsDone > 0) { score++; comments.push('有渡劫经验'); }
            else comments.push('首次渡劫');

            gameState.sect.tribulationRequest.elderScore = score;
            gameState.sect.tribulationRequest.elderComment = `评估：${comments.join('，')}。综合评分：${score}/4。`;

            // 根据评分决定
            if (score >= 3) {
                gameState.sect.tribulationRequest.status = 'pending_leader';
                // 掌门审批
                setTimeout(() => processLeaderDecision(), 500);
            } else {
                gameState.sect.tribulationRequest.status = 'rejected';
                gameState.sect.tribulationRequest.leaderDecision = 'rejected';
                gameState.sect.tribulationRequest.leaderComment = `条件不足（${score}/4），建议提升后再申请。缺失：${score < 1 ? '装备等级 ' : ''}${score < 2 ? '心态值 ' : ''}${score < 3 ? '渡劫丹 ' : ''}${score < 4 ? '渡劫经验' : ''}`;
            }

            saveGame();
        }

        // 掌门审批
        function processLeaderDecision() {
            const req = gameState.sect.tribulationRequest;
            if (req.status !== 'pending_leader') return;

            const score = req.elderScore;

            if (score >= 3) {
                req.status = 'approved';
                req.leaderDecision = 'approved';
                req.leaderComment = '条件具备，批准渡劫。愿你顺利渡过天劫。';
                req.buffApplied = true;
                addLog('good', '渡劫批准', '掌门批准了你的渡劫申请，祝福你渡劫成功！');
            } else {
                req.status = 'rejected';
                req.leaderDecision = 'rejected';
                req.leaderComment = `条件不足（${score}/4），需满足更多条件方可申请渡劫。`;
            }

            saveGame();
        }

        // 获取渡劫审批buff（成功率加成）
        function getTribulationApprovalBuff() {
            const req = gameState.sect.tribulationRequest;
            if (req.status === 'approved' && req.buffApplied) return 0.05;
            return 0;
        }

        // ===== V35 宗门任务系统 =====

        // 宗门任务类型配置
        const SECT_MISSION_TYPES = {
            cultivate: {
                name: '修炼任务',
                icon: '🧘',
                desc: '完成指定修炼次数',
                baseReward: { contribution: 20, exp: 15 },
                difficulty: [5, 10, 15]  // 不同难度目标
            },
            collect: {
                name: '采集任务',
                icon: '💎',
                desc: '采集指定数量灵石',
                baseReward: { contribution: 15, exp: 10, spiritStone: 30 },
                difficulty: [50, 100, 200]
            },
            battle: {
                name: '战斗任务',
                icon: '⚔️',
                desc: '击败指定数量敌人',
                baseReward: { contribution: 25, exp: 20 },
                difficulty: [3, 5, 8]
            },
            deliver: {
                name: '跑腿任务',
                icon: '📦',
                desc: '在宗门间传递物品',
                baseReward: { contribution: 30, exp: 15, spiritStone: 20 },
                difficulty: [1, 2, 3]
            },
            special: {
                name: '特殊任务',
                icon: '🌟',
                desc: '完成宗门特殊事件',
                baseReward: { contribution: 50, exp: 40, spiritStone: 100 },
                difficulty: [1, 1, 1]
            }
        };

        // 生成宗门任务
        function generateSectMissions() {
            const sect = gameState.sect;
            const daysSinceRefresh = gameState.days - (gameState.lastMissionRefreshDay || 0);

            // 每3天刷新一次任务
            if (daysSinceRefresh < 3 && sect.sectMissions.length >= 3) {
                return; // 未到刷新时间且已有任务
            }

            // 最多3个进行中的任务
            const activeCount = sect.sectMissions.filter(m => m.status === 'active').length;
            if (activeCount >= 3) return;

            const toGenerate = 3 - activeCount;
            const types = Object.keys(SECT_MISSION_TYPES);

            for (let i = 0; i < toGenerate; i++) {
                const typeRoll = Math.random();
                let type;
                if (typeRoll < 0.35) type = 'cultivate';
                else if (typeRoll < 0.6) type = 'collect';
                else if (typeRoll < 0.8) type = 'battle';
                else if (typeRoll < 0.95) type = 'deliver';
                else type = 'special';

                const missionType = SECT_MISSION_TYPES[type];
                const difficultyIdx = Math.min(Math.floor(sect.level / 2), 2);
                const target = missionType.difficulty[difficultyIdx];
                const rewardMultiplier = 1 + difficultyIdx * 0.5;

                const mission = {
                    id: 'm_' + Date.now() + '_' + i,
                    type: type,
                    description: missionType.desc,
                    target: target,
                    progress: 0,
                    reward: {
                        contribution: Math.floor(missionType.baseReward.contribution * rewardMultiplier),
                        exp: Math.floor(missionType.baseReward.exp * rewardMultiplier),
                        spiritStone: missionType.baseReward.spiritStone ? Math.floor(missionType.baseReward.spiritStone * rewardMultiplier) : 0
                    },
                    assignedUid: null,  // 未分配
                    status: 'available',  // available | active | completed | failed
                    createdDay: gameState.days,
                    expireDay: gameState.days + 7  // 7天后过期
                };

                sect.sectMissions.push(mission);
            }

            gameState.lastMissionRefreshDay = gameState.days;
            saveGame();
        }

        // 分配弟子到任务
        function assignMission(missionId, discipleUid) {
            const sect = gameState.sect;
            const mission = sect.sectMissions.find(m => m.id === missionId);
            if (!mission || mission.status !== 'available') return false;

            const disciple = sect.disciples.find(d => d.uid === discipleUid);
            if (!disciple) return false;

            // 检查弟子是否已在其他任务中
            sect.sectMissions.forEach(m => {
                if (m.assignedUid === discipleUid && m.status === 'active') {
                    m.status = 'available';
                    m.assignedUid = null;
                    m.progress = 0;
                }
            });

            mission.assignedUid = discipleUid;
            mission.status = 'active';
            disciple.assignment = missionId;

            addLog('good', '任务分配', `${disciple.name}开始执行「${mission.description}」`);
            saveGame();
            return true;
        }

        // 处理每日任务进度
        function processDailySectMissions() {
            const sect = gameState.sect;
            const today = gameState.days;

            sect.sectMissions.forEach(mission => {
                if (mission.status !== 'active' || !mission.assignedUid) return;

                const disciple = sect.disciples.find(d => d.uid === mission.assignedUid);
                if (!disciple) {
                    mission.status = 'available';
                    mission.assignedUid = null;
                    mission.progress = 0;
                    return;
                }

                // 根据任务类型增加进度
                let progressGain = 0;
                switch (mission.type) {
                    case 'cultivate':
                        // 修炼任务：根据弟子境界和资质
                        progressGain = 1 + Math.floor(disciple.talentIndex * 0.5);
                        break;
                    case 'collect':
                        progressGain = 10 + disciple.level * 2;
                        break;
                    case 'battle':
                        progressGain = 1;
                        break;
                    case 'deliver':
                        progressGain = 1;
                        break;
                    case 'special':
                        progressGain = 0;  // 特殊任务需要手动触发
                        break;
                }

                mission.progress = Math.min(mission.target, mission.progress + progressGain);

                // 任务完成检查
                if (mission.progress >= mission.target) {
                    mission.status = 'completed';

                    // 发放奖励
                    disciple.contribution += mission.reward.contribution;
                    disciple.experience = (disciple.experience || 0) + mission.reward.exp;
                    if (mission.reward.spiritStone) {
                        sect.spiritStones += mission.reward.spiritStone;
                    }

                    // 检查升级
                    checkDiscipleLevelUp(disciple);

                    // 重置弟子任务状态
                    disciple.assignment = null;

                    addLog('good', '任务完成', `${disciple.name}完成了「${mission.description}」，获得${mission.reward.contribution}贡献和${mission.reward.exp}经验！`);
                }

                // 过期检查
                if (today > mission.expireDay) {
                    mission.status = 'failed';
                    disciple.assignment = null;
                    disciple.mood = disciple.mood === 'happy' ? 'normal' : 'upset';
                    addLog('warn', '任务失败', `${disciple.name}未能完成任务「${mission.description}」，心情低落`);
                }
            });

            // 清理过期任务
            sect.sectMissions = sect.sectMissions.filter(m => m.status !== 'failed' || m.createdDay > today - 30);

            saveGame();
        }

        // 检查弟子升级
        function checkDiscipleLevelUp(disciple) {
            if (!disciple.experience) disciple.experience = 0;
            if (!disciple.level) disciple.level = 1;

            const expNeeded = disciple.level * 50;  // 每级需要 level * 50 经验

            if (disciple.experience >= expNeeded) {
                disciple.experience -= expNeeded;
                disciple.level++;

                // 升级时有机会提升境界
                const realmChance = 0.1 + disciple.talentIndex * 0.05;
                if (Math.random() < realmChance && disciple.realm < gameState.realm) {
                    disciple.realm = Math.min(gameState.realm, disciple.realm + 1);
                    addLog('good', '弟子突破', `${disciple.name}升到${disciple.level}级，并突破到${CONFIG.realms[disciple.realm]}期！`);
                } else {
                    addLog('good', '弟子升级', `${disciple.name}升到${disciple.level}级！`);
                }

                // 递归检查是否还能升级
                checkDiscipleLevelUp(disciple);
            }
        }

        // 渲染宗门任务标签页
        function renderSectMissionsTab() {
            const sect = gameState.sect;
            const missions = sect.sectMissions.filter(m => m.status !== 'failed');
            const activeMissions = missions.filter(m => m.status === 'active');
            const availableMissions = missions.filter(m => m.status === 'available');

            let html = `
                <div style="margin-bottom:15px;display:flex;gap:10px;">
                    <button class="btn btn-sect" onclick="generateSectMissions()" style="padding:10px 20px;">
                        🎲 刷新任务
                    </button>
                    <span style="color:#888;font-size:12px;align-self:center;">
                        每3天自动刷新 | ${activeMissions.length}/3进行中
                    </span>
                </div>
            `;

            if (missions.length === 0) {
                html += '<p style="text-align:center;color:#666;padding:30px;">暂无任务，点击刷新获取</p>';
                return html;
            }

            // 进行中的任务
            if (activeMissions.length > 0) {
                html += '<h4 style="color:#ff9800;margin:10px 0;">🔄 进行中</h4>';
                activeMissions.forEach(m => {
                    const missionType = SECT_MISSION_TYPES[m.type];
                    const disciple = sect.disciples.find(d => d.uid === m.assignedUid);
                    const progressPercent = Math.floor((m.progress / m.target) * 100);
                    const isOverdue = gameState.days > m.expireDay;

                    html += `
                        <div class="disciple-card" style="border-left:3px solid #ff9800;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <span style="font-size:20px;">${missionType.icon}</span>
                                    <span style="font-weight:bold;">${m.description}</span>
                                    ${isOverdue ? '<span style="color:#f44336;font-size:11px;">⚠️已过期</span>' : ''}
                                </div>
                                <div style="text-align:right;">
                                    <div style="color:#4CAF50;font-size:12px;">${m.progress}/${m.target} (${progressPercent}%)</div>
                                    <div style="color:#888;font-size:11px;">
                                        执行者: ${disciple ? disciple.name : '未知'}
                                    </div>
                                    <div style="color:#888;font-size:11px;">
                                        奖励: ${m.reward.contribution}贡献 | ${m.reward.exp}经验
                                        ${m.reward.spiritStone ? ` | ${m.reward.spiritStone}灵石` : ''}
                                    </div>
                                </div>
                            </div>
                            <div style="background:#333;border-radius:4px;height:6px;margin-top:8px;">
                                <div style="background:#ff9800;height:100%;border-radius:4px;width:${progressPercent}%;"></div>
                            </div>
                        </div>
                    `;
                });
            }

            // 可用任务
            if (availableMissions.length > 0) {
                html += '<h4 style="color:#9c27b0;margin:15px 0 10px;">📋 可接取</h4>';
                availableMissions.forEach(m => {
                    const missionType = SECT_MISSION_TYPES[m.type];

                    html += `
                        <div class="disciple-card" style="border-left:3px solid #9c27b0;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <span style="font-size:20px;">${missionType.icon}</span>
                                    <span style="font-weight:bold;">${m.description}</span>
                                    <span style="color:#888;font-size:11px;"> 目标: ${m.target}</span>
                                </div>
                                <div style="text-align:right;">
                                    <div style="color:#888;font-size:11px;">
                                        奖励: ${m.reward.contribution}贡献 | ${m.reward.exp}经验
                                        ${m.reward.spiritStone ? ` | ${m.reward.spiritStone}灵石` : ''}
                                    </div>
                                    <div style="margin-top:5px;">
                                        <select id="mission_assign_${m.id}" style="background:#333;color:#fff;border:1px solid #555;padding:3px 8px;border-radius:4px;font-size:12px;">
                                            <option value="">分配弟子</option>
                                            ${sect.disciples.map(d => `<option value="${d.uid}">${d.name}(Lvl.${d.level || 1})</option>`).join('')}
                                        </select>
                                        <button onclick="confirmMissionAssign('${m.id}')" style="background:#4CAF50;border:none;color:#fff;padding:3px 10px;border-radius:4px;font-size:12px;cursor:pointer;margin-left:5px;">确认</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            return html;
        }

        // 确认任务分配
        function confirmMissionAssign(missionId) {
            const select = document.getElementById('mission_assign_' + missionId);
            const discipleUid = select.value;
            if (!discipleUid) {
                alert('请选择要分配执行的弟子');
                return;
            }

            if (assignMission(missionId, discipleUid)) {
                renderSectHome();  // 刷新宗门界面
            }
        }


// Auto-generated module: serendipity.js

        // ===== calculateSerendipityChance =====
        function calculateSerendipityChance() {
            let chance = 0.15; // 基础15%

            // 连续未触发加成
            if (gameState.serendipity.badLuck > 0) {
                chance += Math.min(0.10, gameState.serendipity.badLuck * 0.01);
            }

            // 祥云符效果
            if (gameState.serendipity.serendipityBoostEndDay >= gameState.days) {
                chance += 0.10;
            }

            // 鸿运当头状态
            if (gameState.serendipity.luckStatus === 'lucky' && gameState.serendipity.luckEndDay >= gameState.days) {
                chance += 0.15;
            }

            // 厄运缠身状态
            if (gameState.serendipity.luckStatus === 'unlucky' && gameState.serendipity.luckEndDay >= gameState.days) {
                chance -= 0.10;
            }

            // 境界提升加成
            if (gameState.serendipity.lastTriggerDay > 0 && gameState.days - gameState.serendipity.lastTriggerDay <= 1) {
                chance += 0.05;
            }

            // 渡劫期间不触发
            if (gameState.tribulation && gameState.tribulation.inProgress) {
                return 0;
            }

            return Math.max(0.05, Math.min(0.30, chance));
        }

        // ===== checkSerendipity =====
        function checkSerendipity() {
            // 每日最多2次
            if (gameState.serendipity.todayCount >= 2) {
                return null;
            }

            // 渡劫期间不触发
            if (gameState.tribulation && gameState.tribulation.inProgress) {
                return null;
            }

            const chance = calculateSerendipityChance();

            if (Math.random() < chance) {
                return triggerRandomSerendipity();
            } else {
                // 累计连续未触发
                gameState.serendipity.badLuck++;
            }

            return null;
        }

        // ===== triggerRandomSerendipity =====
        function triggerRandomSerendipity() {
            // 获取符合条件的奇遇
            const eligibleEvents = [];
            for (const [name, event] of Object.entries(SERENDIPITY_EVENTS)) {
                // 检查境界要求
                if (gameState.realm < event.minRealm) continue;

                // 检查冷却
                if (gameState.serendipity.cooldownTypes[name] && gameState.serendipity.cooldownTypes[name] > gameState.days) continue;

                // 检查条件
                if (event.condition && !event.condition(gameState)) continue;

                eligibleEvents.push({ name, event });
            }

            if (eligibleEvents.length === 0) return null;

            // 随机选择
            const selected = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
            return executeSerendipity(selected.name, selected.event);
        }

        // ===== generateAiSerendipity =====
        function generateAiSerendipity(serendipityType, callback) {
            if (!miniMaxConfig.apiKey) {
                callback(getDefaultSerendipityText(serendipityType));
                return;
            }
            
            const model = miniMaxConfig.model || 'MiniMax-M2.7';
            const prompts = {
                'positive': `你是一个修仙游戏的奇遇描述生成器。请为玩家的一个正面奇遇生成独特描述。

玩家信息：
- 境界：${REALMS[gameState.realm] || '凡人'}
- 灵石：${gameState.stones}

要求：
1. 生成20-40字的中文奇遇描述
2. 描述要独特有画面感
3. 包含发现的物品或遇到的机缘
4. 直接输出描述，不要前缀

直接输出描述文字。`,
                'negative': `你是一个修仙游戏的奇遇描述生成器。请为玩家的一个负面奇遇生成独特描述。

玩家信息：
- 境界：${REALMS[gameState.realm] || '凡人'}
- 灵石：${gameState.stones}

要求：
1. 生成20-40字的中文奇遇描述
2. 描述危险或困境
3. 直接输出描述，不要前缀

直接输出描述文字。`,
                'neutral': `你是一个修仙游戏的奇遇描述生成器。请为玩家的一个中性奇遇生成独特描述。

玩家信息：
- 境界：${REALMS[gameState.realm] || '凡人'}
- 灵石：${gameState.stones}

要求：
1. 生成20-40字的中文奇遇描述
2. 描述一个需要选择的情况
3. 直接输出描述，不要前缀

直接输出描述文字。`
            };
            
            const prompt = prompts[serendipityType] || prompts['neutral'];
            
            callMiniMaxAPI(prompt, model, 100, (reply) => {
                if (reply && reply.trim()) {
                    callback(reply.trim());
                } else {
                    callback(getDefaultSerendipityText(serendipityType));
                }
            }, (err) => {
                callback(getDefaultSerendipityText(serendipityType));
            });
        }

        // ===== getDefaultSerendipityText =====
        function getDefaultSerendipityText(type) {
            const texts = {
                'positive': '你在路边发现了一株散发奇异光芒的灵草，似乎是罕见的天地精华！',
                'negative': '你不慎踏入了一处危险的禁地，四周弥漫着诡异的气息...',
                'neutral': '你遇到了一位神秘的散修，他似乎有话要对你说...'
            };
            return texts[type] || texts['neutral'];
        }

        // ===== executeSerendipity =====
        function executeSerendipity(name, event) {
            const serendipity = gameState.serendipity;

            // 更新状态
            serendipity.lastTriggerDay = gameState.days;
            serendipity.todayCount++;
            serendipity.lastTriggerType = name;
            serendipity.badLuck = 0;
            serendipity.cooldownTypes[name] = gameState.days + 1; // 24小时冷却

            // 执行效果
            const result = event.effect(gameState);

            // 记录日志
            const logEntry = {
                day: gameState.days,
                type: event.type,
                name: name,
                result: result.text
            };
            serendipity.log.unshift(logEntry);
            if (serendipity.log.length > 20) serendipity.log.pop();

            // A5 成就检查 - 奇遇触发
            if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {} };
            gameState.achievements.stats.serendipitiesEncountered++;
            checkAchievements();

            return { name, event, result };
        }

        // ===== showSerendipityModal =====
        function showSerendipityModal(serendipityData) {
            if (!serendipityData) return;

            const { name, event, result } = serendipityData;
            const modal = document.getElementById('serendipityModal');
            const content = document.getElementById('serendipityContent');
            const titleEl = document.getElementById('serendipityTitle');

            // 设置边框颜色
            modal.querySelector('.modal-content').className = `modal-content ${event.type}`;

            // 设置标题
            titleEl.textContent = `${event.icon} ${name} ${event.icon}`;

            // E4 使用AI生成独特描述
            if (miniMaxConfig.features.aiSerendipity && miniMaxConfig.apiKey) {
                // 先显示默认描述，然后异步获取AI描述更新
                let html = `
                    <div style="text-align:center;">
                        <span class="serendipity-type-badge ${event.type}">${event.type === 'positive' ? '✨ 吉利' : event.type === 'negative' ? '💀 凶险' : '⚖️ 中性'}</span>
                    </div>
                    <div class="serendipity-effect">
                        <p id="serendipityAiDesc" style="text-align:center;margin-bottom:15px;color:#aaa;">${result.text}<br><small>(AI描述生成中...)</small></p>
                `;

                if (result.effects && result.effects.length > 0) {
                    html += '<div class="serendipity-effect-item" style="font-weight:bold;margin-bottom:10px;">效果：</div>';
                    for (const effect of result.effects) {
                        const valueStr = effect.value > 0 ? `+${effect.value}` : `${effect.value}`;
                        html += `
                            <div class="serendipity-effect-item">
                                <span>${effect.type}</span>
                                <span class="${effect.positive ? 'effect-positive' : 'effect-negative'}">${valueStr}</span>
                            </div>
                        `;
                    }
                }
                html += '</div>';

                if (result.showRealmBattle) {
                    const isNegative = result.isNegative || false;
                    html += `
                        <div style="text-align:center;margin-top:15px;">
                            <button class="btn ${isNegative ? 'btn-combat' : 'btn-explore'}" onclick="startSecretRealmBattle('${name}', ${isNegative})">
                                ${isNegative ? '⚔️ 应战' : '🌀 进入秘境'}
                            </button>
                            <button class="btn btn-save" onclick="skipRealmBattle()" style="margin-left:10px;">跳过</button>
                        </div>
                    `;
                }

                if (result.showChoice && result.choices && result.choices.length > 0) {
                    const choiceLabels = { 0: '接受', 1: '拒绝' };
                    html += `<div style="text-align:center;margin-top:15px;">`;
                    result.choices.forEach((label, idx) => {
                        const btnLabel = choiceLabels[idx] || label;
                        html += `<button class="btn btn-cultivate" onclick="handleSerendipityChoice('${name}', ${idx})" style="margin-left:${idx > 0 ? '8px' : '0'}">${btnLabel}</button>`;
                    });
                    html += `</div>`;
                }

                content.innerHTML = html;
                modal.classList.add('active');

                // 异步生成AI描述
                generateAiSerendipity(event.type, (aiDescription) => {
                    gameState.currentSerendipityDescription = aiDescription;
                    const descEl = document.getElementById('serendipityAiDesc');
                    if (descEl) {
                        descEl.innerHTML = `<strong>${aiDescription}</strong>`;
                        descEl.style.color = '#ffd700';
                    }
                });
            } else {
                // 不使用AI时直接显示默认描述
                let html = `
                    <div style="text-align:center;">
                        <span class="serendipity-type-badge ${event.type}">${event.type === 'positive' ? '✨ 吉利' : event.type === 'negative' ? '💀 凶险' : '⚖️ 中性'}</span>
                    </div>
                    <div class="serendipity-effect">
                        <p style="text-align:center;margin-bottom:15px;">${result.text}</p>
                `;

                if (result.effects && result.effects.length > 0) {
                    html += '<div class="serendipity-effect-item" style="font-weight:bold;margin-bottom:10px;">效果：</div>';
                    for (const effect of result.effects) {
                        const valueStr = effect.value > 0 ? `+${effect.value}` : `${effect.value}`;
                        html += `
                            <div class="serendipity-effect-item">
                                <span>${effect.type}</span>
                                <span class="${effect.positive ? 'effect-positive' : 'effect-negative'}">${valueStr}</span>
                            </div>
                        `;
                    }
                }
                html += '</div>';

                if (result.showRealmBattle) {
                    const isNegative = result.isNegative || false;
                    html += `
                        <div style="text-align:center;margin-top:15px;">
                            <button class="btn ${isNegative ? 'btn-combat' : 'btn-explore'}" onclick="startSecretRealmBattle('${name}', ${isNegative})">
                                ${isNegative ? '⚔️ 应战' : '🌀 进入秘境'}
                            </button>
                            <button class="btn btn-save" onclick="skipRealmBattle()" style="margin-left:10px;">跳过</button>
                        </div>
                    `;
                }

                if (result.showChoice && result.choices && result.choices.length > 0) {
                    const choiceLabels = { 0: '接受', 1: '拒绝' };
                    html += `<div style="text-align:center;margin-top:15px;">`;
                    result.choices.forEach((label, idx) => {
                        const btnLabel = choiceLabels[idx] || label;
                        html += `<button class="btn btn-cultivate" onclick="handleSerendipityChoice('${name}', ${idx})" style="margin-left:${idx > 0 ? '8px' : '0'}">${btnLabel}</button>`;
                    });
                    html += `</div>`;
                }

                content.innerHTML = html;
                modal.classList.add('active');
            }

            // 记录日志
            addLog(event.type === 'positive' ? 'good' : event.type === 'negative' ? 'bad' : 'neutral', name, result.text);
        }

        // ===== handleSerendipityChoice =====
        function handleSerendipityChoice(name, idx) {
            closeSerendipityModal();

            if (name === '乞丐讨缘') {
                if (idx === 0) {
                    gameState.spiritStones -= 100;
                    gameState.serendipity.luckStatus = 'lucky';
                    gameState.serendipity.luckEndDay = gameState.days + 3;
                    addLog('good', '乞丐讨缘', '施舍乞丐，获得好运buff 3天');
                } else {
                    gameState.serendipity.badLuck += 3;
                    addLog('bad', '乞丐讨缘', '拒绝施舍，运气下降');
                }
            } else if (name === '散修求助') {
                if (idx === 0) {
                    gameState.spiritStones -= 200;
                    gameState.serendipity.serendipityBoostEndDay = gameState.days + 3;
                    gameState.activeEffects.serendipity_boost = 0.10;
                    addLog('good', '散修求助', '帮助散修，后续奇遇概率+10% 3天');
                } else {
                    addLog('neutral', '散修求助', '拒绝帮助，无影响');
                }
            } else if (name === '魔器诱惑') {
                if (idx === 0) {
                    // 添加魔器到背包
                    addToInventory('treasure', '魔刃', 1, 'rare',
                        { type: 'attack', value: 0.3 },
                        '攻击+30%，但每回合扣5灵气', '🗡️');
                    addLog('bad', '魔器诱惑', '获得魔刃，但每回合扣5灵气');
                } else {
                    addLog('good', '魔器诱惑', '拒绝魔器诱惑');
                }
            } else if (name === '心魔试炼') {
                if (idx === 0) {
                    // 勇敢面对：心境判定，胜利则大收益，失败则扣心境
                    const mindCheck = Math.random() < (gameState.mindset / 100);
                    if (mindCheck) {
                        const gain = 20;
                        gameState.mindset = Math.min(100, gameState.mindset + gain);
                        addLog('good', '心魔试炼', `击败心魔，心境+${gain}！`);
                    } else {
                        const loss = 15;
                        gameState.mindset = Math.max(0, gameState.mindset - loss);
                        addLog('bad', '心魔试炼', `心魔反噬，心境-${loss}`);
                    }
                } else {
                    // 退缩：无事发生，但浪费一次奇遇
                    addLog('neutral', '心魔试炼', '退缩逃避，无事发生');
                }
            } else if (name === '上古遗迹') {
                if (idx === 0) {
                    // 深入探索：70%获得大量灵石/功法，30%遇险
                    if (Math.random() < 0.7) {
                        const reward = Math.random() < 0.5
                            ? { type: 'spiritStones', value: Math.floor(2000 + Math.random() * 3000) }
                            : { type: 'technique', value: 1 };
                        if (reward.type === 'spiritStones') {
                            gameState.spiritStones += reward.value;
                            addLog('good', '上古遗迹', `深入探索成功，获得 ${reward.value} 灵石！`);
                        } else {
                            addLog('good', '上古遗迹', '深入探索成功，获得上古功法传承！');
                        }
                    } else {
                        const loss = Math.floor(gameState.spiritStones * 0.2);
                        gameState.spiritStones -= loss;
                        addLog('bad', '上古遗迹', `触发机关陷阱，损失 ${loss} 灵石！`);
                    }
                } else if (idx === 1) {
                    // 浅尝辄止：稳定小收益
                    const gain = Math.floor(500 + Math.random() * 500);
                    gameState.spiritStones += gain;
                    addLog('good', '上古遗迹', `浅尝辄止，稳定获得 ${gain} 灵石`);
                } else {
                    // 离开
                    addLog('neutral', '上古遗迹', '谨慎离开，无事发生');
                }
            } else if (name === '天赐体质·至尊骨') {
                if (idx === 0) {
                    // 接受完整传承
                    acquireConstitutionFromSerendipity('至尊骨');
                    addLog('good', '至尊骨', '接受完整传承，获得至尊骨！攻击+30%，暴击+15%');
                } else {
                    // 只取部分精华
                    acquireConstitutionFromSerendipity('至尊骨');
                    gameState.activeEffects.attack += 0.15;
                    addLog('good', '至尊骨', '只取精华，获得弱化版至尊骨：攻击+15%');
                }
            } else if (name === '天赐体质·疾风灵体') {
                if (idx === 0) {
                    // 与风融为一体：70%成功获完整灵体，30%失败获部分
                    if (Math.random() < 0.7) {
                        acquireConstitutionFromSerendipity('疾风灵体');
                        addLog('good', '疾风灵体', '与风融为一体，成功获得疾风灵体！速度+35%，先手+25%');
                    } else {
                        acquireConstitutionFromSerendipity('疾风灵体');
                        gameState.activeEffects.cultivate_speed += 0.1;
                        addLog('neutral', '疾风灵体', '融合不完全，获得弱化版：修炼速度+10%');
                    }
                } else {
                    // 保持自我：获得部分buff
                    acquireConstitutionFromSerendipity('疾风灵体');
                    addLog('good', '疾风灵体', '保持自我，获得疾风灵体！');
                }
            } else if (name === '天赐体质·重瞳') {
                if (idx === 0) {
                    // 承受试炼：60%成功获完整重瞳，40%失败仅获感知
                    if (Math.random() < 0.6) {
                        acquireConstitutionFromSerendipity('重瞳');
                        addLog('good', '重瞳', '试炼成功！获得重瞳：闪避+20%，可预判攻击');
                    } else {
                        acquireConstitutionFromSerendipity('重瞳');
                        gameState.activeEffects.defense += 0.1;
                        addLog('neutral', '重瞳', '试炼失败，仅获得部分感知：防御+10%');
                    }
                } else {
                    // 以凡眼视之：无事发生
                    addLog('neutral', '重瞳', '放弃试炼，重瞳消散……');
                }
            }

            saveGame();
            updateDisplay();
        }

        // ===== startSecretRealmBattle =====
        function startSecretRealmBattle(eventName, isNegative) {
            closeSerendipityModal();

            // E3 生成秘境名称
            generateRealmName((realmName) => {
                gameState.currentSecretRealmName = realmName;
                addEventLog(`📍 你进入了「${realmName}」`, 'success');
                
                // 玩家最大生命值随境界成长
                const playerMaxHP = 100 + gameState.realm * 100;
                secretRealmState = {
                    wave: 0,
                    totalWaves: 3,
                    enemies: generateRealmEnemies(isNegative),
                    playerHP: playerMaxHP,
                    playerMaxHP: playerMaxHP,
                    rewards: [],
                    eventName: eventName,
                    isNegative: isNegative,
                    realmName: realmName
                };

                // 显示秘境战斗UI
                showSecretRealmBattleUI();
            });
        }

        // ===== generateRealmName =====
        function generateRealmName(callback) {
            const model = miniMaxConfig.model || 'MiniMax-M2.7';
            const prompt = `你是一个修仙游戏的秘境名称生成器。请为玩家的下一个秘境生成一个独特的名字。

当前玩家境界：${REALMS[gameState.realm] || '凡人'}
秘境难度：第${gameState.realm + 1}层秘境

要求：
1. 生成一个2-5字的秘境名称
2. 要有仙侠风格（可以用：深渊/裂隙/遗迹/洞府/秘境/禁地/幻境等词）
3. 名称要独特有诗意
4. 直接输出名称，不要加引号或解释

直接输出名称。`;

            callMiniMaxAPI(prompt, model, 30, (reply) => {
                if (reply && reply.trim()) {
                    callback(reply.trim().substring(0, 8));
                } else {
                    callback(getDefaultRealmName());
                }
            }, (err) => {
                callback(getDefaultRealmName());
            });
        }

        // ===== getDefaultRealmName =====
        function getDefaultRealmName() {
            const names = ['迷雾深渊', '星辰裂隙', '上古遗迹', '天机洞府', '幽冥禁地', '幻境之海', '苍穹秘境', '永恒禁域'];
            return names[Math.floor(Math.random() * names.length)];
        }

        // ===== generateRealmEnemies =====
        function generateRealmEnemies(isNegative) {
            const enemies = [];
            // 境界名称池（随境界成长）
            const positivePrefixes = ['守护', '精英', '远古'];
            const negativePrefixes = ['野', '狂', '堕'];
            const names = isNegative
                ? ['狼', '熊', '蟒']
                : ['傀儡', '妖兽', '守卫'];
            const icons = isNegative
                ? ['🐺', '🐻', '🐍']
                : ['🤖', '👹', '⚔️'];

            for (let i = 0; i < 3; i++) {
                // 敌人境界 = 玩家境界 - 1(缓冲区) + i(逐波增强)
                const enemyRealm = Math.max(0, gameState.realm - 1 + i);
                // HP: 指数成长，每境界×1.7，第一波有缓冲区
                const baseHP = Math.floor(80 * Math.pow(1.7, enemyRealm));
                const hp = baseHP + Math.floor(Math.random() * baseHP * 0.5);
                // 攻击: 指数成长，每境界×1.6
                const baseAttack = Math.floor(15 * Math.pow(1.6, enemyRealm));
                const attack = baseAttack + Math.floor(Math.random() * baseAttack * 0.4);
                // 名字格式：正面 远古傀儡1号 / 负面 野狼
                const prefix = isNegative ? negativePrefixes[i] : positivePrefixes[i];
                const name = isNegative
                    ? `${prefix}${names[i]}`
                    : `${prefix}${names[i]}${i + 1}号`;
                enemies.push({
                    name: name,
                    icon: icons[i],
                    hp: hp,
                    maxHP: hp,
                    attack: attack,
                    realm: enemyRealm
                });
            }
            return enemies;
        }

        // ===== showSecretRealmBattleUI =====
        function showSecretRealmBattleUI() {
            const content = document.getElementById('secretRealmContent');
            const modal = document.getElementById('secretRealmModal');
            const realmName = gameState.currentSecretRealmName || secretRealmState.realmName || '神秘秘境';

            let html = `
                <div class="secret-realm-arena">
                    <div class="realm-name" style="color:#ffd700;font-size:1.3em;margin-bottom:10px;">「${realmName}」</div>
                    <div class="realm-wave">第 ${secretRealmState.wave + 1} / ${secretRealmState.totalWaves} 波</div>
                    <div class="realm-progress">
            `;

            for (let i = 0; i < secretRealmState.totalWaves; i++) {
                let cls = 'wave-dot';
                if (i < secretRealmState.wave) cls += ' completed';
                else if (i === secretRealmState.wave) cls += ' current';
                html += `<div class="${cls}"></div>`;
            }

            html += '</div>';

            // 玩家状态
            html += `
                <div style="margin-bottom:20px;text-align:center;">
                    <div style="color:#ffd700;font-size:1.2em;">你的状态</div>
                    <div class="realm-hp-bar" style="margin:10px auto;width:200px;">
                        <div class="realm-hp-fill" style="width:${(secretRealmState.playerHP / secretRealmState.playerMaxHP) * 100}%"></div>
                    </div>
                    <div style="color:#aaa;">${secretRealmState.playerHP} / ${secretRealmState.playerMaxHP}</div>
                </div>
            `;

            // 敌人列表
            for (let i = secretRealmState.wave; i < secretRealmState.enemies.length; i++) {
                const enemy = secretRealmState.enemies[i];
                const hpPercent = (enemy.hp / enemy.maxHP) * 100;
                html += `
                    <div class="realm-enemy">
                        <div class="realm-enemy-info">
                            <span class="realm-enemy-avatar">${enemy.icon}</span>
                            <div>
                                <div class="realm-enemy-name">${enemy.name}</div>
                                <div class="realm-enemy-realm">${CONFIG.realms[enemy.realm]}期</div>
                            </div>
                        </div>
                        <div class="realm-enemy-hp">
                            <div>攻击: ${enemy.attack}</div>
                            <div class="realm-hp-bar">
                                <div class="realm-hp-fill" style="width:${hpPercent}%"></div>
                            </div>
                            <div style="font-size:0.85em;color:#aaa;">${enemy.hp} / ${enemy.maxHP}</div>
                        </div>
                    </div>
                `;
            }

            html += '</div>';

            // 操作按钮
            html += `
                <div style="text-align:center;">
                    <button class="btn btn-cultivate" onclick="attackRealmEnemy()">⚔️ 攻击</button>
                    <button class="btn btn-breakthrough" onclick="defendRealmAttack()">🛡️ 防御</button>
                </div>
            `;

            content.innerHTML = html;
            modal.classList.add('active');
        }

        // ===== attackRealmEnemy =====
        function attackRealmEnemy() {
            const enemy = secretRealmState.enemies[secretRealmState.wave];
            const playerAttack = Math.floor(20 + gameState.realm * 15 + Math.random() * 20);

            // 计算伤害（考虑功法加成和装备）
            let totalAttack = playerAttack * (1 + gameState.activeEffects.attack);

            enemy.hp -= Math.floor(totalAttack);

            // 记录伤害
            addLog('good', '秘境战斗', `对${enemy.name}造成 ${Math.floor(totalAttack)} 点伤害！`);

            // 检查是否击败敌人
            if (enemy.hp <= 0) {
                secretRealmState.wave++;

                // 发放波次奖励
                const waveRewards = [
                    { type: 'spiritStones', value: Math.floor(100 + Math.random() * 100) },
                    { type: 'qi', value: Math.floor(20 + Math.random() * 30) }
                ];
                const reward = waveRewards[Math.floor(Math.random() * waveRewards.length)];

                if (reward.type === 'spiritStones') {
                    gameState.spiritStones += reward.value;
                    secretRealmState.rewards.push(`${reward.value} 灵石`);
                } else {
                    gameState.qi = Math.min(gameState.maxQi, gameState.qi + reward.value);
                    secretRealmState.rewards.push(`${reward.value} 灵气`);
                }

                addLog('good', '秘境战斗', `击败${enemy.name}！获得 ${secretRealmState.rewards[secretRealmState.rewards.length - 1]}`);

                // 检查是否通关
                if (secretRealmState.wave >= secretRealmState.totalWaves) {
                    completeSecretRealm();
                    return;
                }
            } else {
                // 敌人反击
                const damage = Math.floor(enemy.attack * (1 - gameState.activeEffects.defense));
                secretRealmState.playerHP -= damage;
                addLog('bad', '秘境战斗', `${enemy.name}反击，造成 ${damage} 点伤害！`);

                // 检查玩家是否死亡
                if (secretRealmState.playerHP <= 0) {
                    failSecretRealm();
                    return;
                }
            }

            saveGame();
            updateDisplay();
            showSecretRealmBattleUI();
        }

        // ===== defendRealmAttack =====
        function defendRealmAttack() {
            const enemy = secretRealmState.enemies[secretRealmState.wave];
            const damage = Math.floor(enemy.attack * 0.3 * (1 - gameState.activeEffects.defense));
            secretRealmState.playerHP -= damage;

            addLog('neutral', '秘境战斗', `防御成功，受到 ${damage} 点伤害！`);

            if (secretRealmState.playerHP <= 0) {
                failSecretRealm();
                return;
            }

            saveGame();
            updateDisplay();
            showSecretRealmBattleUI();
        }

        // ===== completeSecretRealm =====
        function completeSecretRealm() {
            const modal = document.getElementById('secretRealmModal');
            modal.classList.remove('active');

            // 发放最终奖励
            // 经济调整：秘境灵石奖励 ×1.5，让秘境成为更重要的发展途径
            const finalRewards = [];
            const stones = Math.floor((500 + gameState.realm * 300 + Math.random() * 500) * 1.5);
            gameState.spiritStones += stones;
            finalRewards.push(`${stones} 灵石`);

            // 随机额外奖励
            if (Math.random() < 0.5) {
                const qi = Math.floor(50 + Math.random() * 100);
                gameState.qi = Math.min(gameState.maxQi, gameState.qi + qi);
                finalRewards.push(`${qi} 灵气`);
            }
            if (Math.random() < 0.3) {
                const pill = ['聚灵丹', '心魔丹', '金髓丹'][Math.floor(Math.random() * 3)];
                addItemToInventory(pill, 1);
                finalRewards.push(`${pill} x1`);
            }

            const rewardText = finalRewards.join('、');
            addLog('good', '秘境通关', `秘境探险完成！获得：${rewardText}`);

            // 记录到奇遇日志
            gameState.serendipity.log.unshift({
                day: gameState.days,
                type: 'positive',
                name: secretRealmState.eventName,
                result: `秘境通关，获得：${rewardText}`
            });

            saveGame();
            updateDisplay();

            alert(`🎉 秘境通关！\n\n获得：${rewardText}`);
        }

        // ===== failSecretRealm =====
        function failSecretRealm() {
            const modal = document.getElementById('secretRealmModal');
            modal.classList.remove('active');

            // 失败惩罚
            if (secretRealmState.isNegative) {
                const loss = Math.floor(gameState.spiritStones * 0.2);
                gameState.spiritStones -= loss;
                addLog('bad', '秘境失败', `抵御妖兽失败！损失 ${loss} 灵石`);
            } else {
                const loss = Math.floor(gameState.spiritStones * 0.1);
                gameState.spiritStones -= loss;
                addLog('bad', '秘境失败', `秘境挑战失败！损失 ${loss} 灵石`);
            }

            // 记录到奇遇日志
            gameState.serendipity.log.unshift({
                day: gameState.days,
                type: 'negative',
                name: secretRealmState.eventName,
                result: '秘境挑战失败'
            });

            saveGame();
            updateDisplay();
        }

        // ===== skipRealmBattle =====
        function skipRealmBattle() {
            const modal = document.getElementById('secretRealmModal');
            modal.classList.remove('active');
            addLog('neutral', '秘境探险', '选择跳过秘境探险');
            saveGame();
        }

        // ===== closeSerendipityModal =====
        function closeSerendipityModal() {
            document.getElementById('serendipityModal').classList.remove('active');
        }

        // ===== openSerendipityLog =====
        function openSerendipityLog() {
            const serendipity = gameState.serendipity;
            const modal = document.getElementById('serendipityModal');
            const titleEl = document.getElementById('serendipityTitle');
            const content = document.getElementById('serendipityContent');

            titleEl.textContent = '✨ 奇遇记录 ✨';
            modal.querySelector('.modal-content').className = 'modal-content neutral';

            // 显示当前状态
            let statusHtml = '<div style="margin-bottom:15px;">';

            // 运气状态
            if (serendipity.luckStatus === 'lucky' && serendipity.luckEndDay >= gameState.days) {
                statusHtml += '<span class="status-badge lucky">🌟 鸿运当头 (剩余' + (serendipity.luckEndDay - gameState.days) + '天)</span> ';
            }
            if (serendipity.luckStatus === 'unlucky' && serendipity.luckEndDay >= gameState.days) {
                statusHtml += '<span class="status-badge unlucky">💀 厄运缠身 (剩余' + (serendipity.luckEndDay - gameState.days) + '天)</span> ';
            }
            if (serendipity.serendipityBoostEndDay >= gameState.days) {
                statusHtml += '<span class="status-badge serendipity-boost">🔮 奇遇加成 (剩余' + (serendipity.serendipityBoostEndDay - gameState.days) + '天)</span> ';
            }

            statusHtml += '</div>';

            // 奇遇概率
            const chance = calculateSerendipityChance();
            statusHtml += `<div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;margin-bottom:15px;">
                <div style="display:flex;justify-content:space-between;">
                    <span>当前奇遇概率</span>
                    <span style="color:#ffd700;">${Math.round(chance * 100)}%</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.85em;color:#aaa;">
                    <span>今日奇遇次数</span>
                    <span>${serendipity.todayCount} / 2</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.85em;color:#aaa;">
                    <span>连续未触发</span>
                    <span>${serendipity.badLuck} 回合</span>
                </div>
            </div>`;

            // 奇遇日志
            if (serendipity.log.length === 0) {
                statusHtml += '<p style="text-align:center;color:#888;padding:30px;">暂无奇遇记录</p>';
            } else {
                statusHtml += '<div class="serendipity-log">';
                for (const entry of serendipity.log.slice(0, 10)) {
                    statusHtml += `
                        <div class="serendipity-log-entry ${entry.type}">
                            <div style="display:flex;justify-content:space-between;">
                                <span>第${entry.day}天 - ${entry.name}</span>
                                <span style="font-size:0.85em;color:#aaa;">${entry.type === 'positive' ? '✨' : entry.type === 'negative' ? '💀' : '⚖️'}</span>
                            </div>
                            <div style="font-size:0.9em;color:#ccc;">${entry.result}</div>
                        </div>
                    `;
                }
                statusHtml += '</div>';
            }

            // 奇遇道具说明
            statusHtml += `
                <div style="margin-top:20px;padding:15px;background:rgba(0,0,0,0.3);border-radius:10px;">
                    <h4 style="color:#ffd700;margin-bottom:10px;">🧿 奇遇道具</h4>
                    <div style="font-size:0.9em;color:#aaa;">
                        <p>☁️ 祥云符 - 奇遇概率+10%，持续1天 | 2000灵石</p>
                        <p>🛡️ 避厄符 - 免疫下次负面奇遇 | 1500灵石</p>
                        <p>📜 探路符 - 指定触发秘境入口 | 3000灵石</p>
                    </div>
                </div>
            `;

            content.innerHTML = statusHtml;
            modal.classList.add('active');
        }

        // ===== useExploreTalisman =====
        function useExploreTalisman() {
            const talismanIdx = gameState.inventory.findIndex(i => i.name === '探路符');
            if (talismanIdx === -1) {
                alert('没有探路符！');
                return;
            }

            const talisman = gameState.inventory[talismanIdx];
            talisman.quantity--;
            if (talisman.quantity <= 0) {
                gameState.inventory.splice(talismanIdx, 1);
            }

            // 强制触发秘境入口
            const event = SERENDIPITY_EVENTS['秘境入口'];
            const result = executeSerendipity('秘境入口', event);
            showSerendipityModal(result);

            saveGame();
        }

        // ===== processEndOfDaySerendipity =====
        function processEndOfDaySerendipity() {
            // 重置每日计数
            if (gameState.serendipity.lastTriggerDay < gameState.days) {
                gameState.serendipity.todayCount = 0;
            }

            // 检查状态持续时间
            if (gameState.serendipity.luckEndDay > 0 && gameState.serendipity.luckEndDay <= gameState.days) {
                gameState.serendipity.luckStatus = null;
                addLog('neutral', '状态结束', '运气状态已结束');
            }
            if (gameState.serendipity.serendipityBoostEndDay > 0 && gameState.serendipity.serendipityBoostEndDay <= gameState.days) {
                gameState.activeEffects.serendipity_boost = 0;
                addLog('neutral', '状态结束', '奇遇加成状态已结束');
            }

            // 检查魔器扣血效果
            const demonWeapon = gameState.inventory.find(i => i.name === '魔刃');
            if (demonWeapon) {
                const hpLoss = 5;
                gameState.qi = Math.max(0, gameState.qi - hpLoss);
                addLog('bad', '魔器侵蚀', `魔刃吸取灵气，-${hpLoss}灵气`);
            }
        }

        // ===== buySerendipityItem =====
        function buySerendipityItem(name) {
            const talisman = SERENDIPITY_TALISMANS[name];
            if (!talisman) return;

            if (gameState.spiritStones < talisman.price) {
                alert('灵石不足！');
                return;
            }

            gameState.spiritStones -= talisman.price;
            addToInventory('talisman', name, 1, 'rare',
                talisman.effect,
                talisman.desc,
                talisman.icon);

            addLog('good', '购买道具', `购买了 ${name}！`);
            saveGame();
            updateDisplay();
        }


// Auto-generated module: social.js

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
// Auto-generated module: spellCreation.js

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
// Auto-generated module: state.js

        // --- gameState (1366-1480) ---
        let gameState = {
            realm: 0,       // 0-4 对应 炼气到化神
            stage: 0,       // 0-2 对应 初期/中期/后期
            qi: 0,
            maxQi: 100,
            spiritStones: 50,
            mindset: 50,
            days: 1,
            cultivationProgress: 0,
            eventLog: [],
            combatLogHistory: [],
            eventLogHistory: [],
            isGameOver: false,
            isVictory: false,
            // V2新增字段
            inventory: [],
            equippedTreasures: [null, null, null],
            maxInventorySlots: 20,
            shopItems: [],
            lastShopDay: 0,
            activeEffects: {
                breakthrough_boost: 0,
                cultivate_speed: 0,
                渡劫_mindset_protect: 0,
                attack: 0,
                defense: 0,
                cultivate_qi_rate: 0,
                渡劫_damage_reduce: 0,
                escape: 0,
                foresee_event: 0,
                all_stats: 0,
                serendipity_boost: 0
            },
            // V3渡劫系统字段
            tribulation: {
                inProgress: false,
                currentStage: 0,
                totalStages: 9,
                currentType: null,
                preparations: [],
                damageTaken: 0,
                tribKey: null
            },
            hasTransmigrationBuff: false,
            tribulationRecord: [],
            // V4 战斗系统字段
            combat: {
                wins: 0,
                losses: 0,
                honor: 0,
                fame: 0,
                battleHistory: [],
                injured: false,
                injuryEndDay: 0
            },
            // V5 宗门系统字段
            sect: {
                name: null,
                level: 0,
                spiritStones: 0,
                disciples: [],
                elders: [],
                buildings: {
                    library: false,
                    alchemy: false,
                    forge: false,
                    archive: false
                },
                techniques: [],
                contributionShop: [],
                lastShopRefresh: 0,
                lastResourceCollection: 0,
                // V29 NPC AI系统
                npcDialogueHistory: [],   // [{uid, text, isPlayer, day}]
                npcTasks: [],             // [{uid, type, target, startDay, endDay, completed, progress}]
                npcLastActions: {},        // {uid: {action, day}}
                // V30 渡劫审批系统
                tribulationRequest: {
                    status: 'none',        // none | pending_elder | pending_leader | approved | rejected
                    elderScore: 0,
                    elderComment: '',
                    leaderDecision: '',
                    leaderComment: '',
                    buffApplied: false,
                    submitDay: 0
                },
                // V31 天道轮回系统
                celestialCycle: {
                    day: 0,                // 距离下次轮回的天数
                    completed: false,      // 本周期是否已完成
                    lastResult: null,       // 上次轮回结果 {type, text, effects}
                    blessingActive: false, // 气运祈福是否激活
                    cycleInterval: 3        // 轮回间隔天数
                },
                // V35 宗门任务链
                sectMissions: [],         // [{id, type, target, progress, reward, assignedUid, status, description}]
                sectMissionCooldown: 0    // 任务冷却
            },
            // V6 奇遇系统字段
            serendipity: {
                lastTriggerDay: 0,
                todayCount: 0,
                lastTriggerType: null,
                cooldownTypes: {},
                badLuck: 0,
                currentEvent: null,
                log: [],
                luckStatus: null,
                luckEndDay: 0,
                serendipityBoostEndDay: 0
            },
            // V7 灵根/体质系统字段
            spiritRoot: {
                quality: '中品灵根', // 伪灵根/下品灵根/中品灵根/上品灵根/天灵根/混沌灵根
                affinity: { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 },
                resonance: 0,
                lastRefreshDay: 0,
                awakeningAvailable: false, // V32 是否可以觉醒
                hasAwakened: false,          // V32 是否已完成觉醒
                awakenedQuality: null        // V32 觉醒后的品质
            },
            // V32 灵根觉醒系统
            spiritRootAwakening: {
                status: 'dormant',   // dormant | stage1 | stage2 | stage3 | completed
                stage: 0,
                triggerDay: 0,
                tasks: [],           // [{type, target, current, completed}]
                rewards: null,
                lastEventDay: 0,
                attempts: 0
            },
            constitutions: [], // 已获得的体质
            // V8 丹药炼器系统字段
            crafting: {
                furnace: { level: 1, type: 'alchemy' },
                anvil: { level: 1, type: 'forge' },
                transactionLog: []
            },
            // V11 成就/称号系统字段
            title: '筑基修士',
            achievements: {
                unlocked: [],
                titles: [],
                stats: {
                    tribulationsCompleted: 0,
                    dungeonBossesKilled: 0,
                    sectContributions: 0,
                    treasuresRefined: 0,
                    serendipitiesEncountered: 0,
                    flawlessTribulations: 0
                }
            },
            // V11 飞升系统字段
            currentRealm: 'mortal',  // 'mortal' | 'immortal'
            immortal: null,          // 仙界状态，飞升后初始化
            mounts: [],              // 仙兽列表（最多3只）
            immortalSkills: [],       // 仙法列表
            immortalEquipment: {      // 飞升装备栏
                head: null,
                body: null,
                foot: null,
                weapon: null,
                shield: null,
                accessory: null
            },
            currentMount: null       // 当前骑乘的仙兽
        };

        // --- miniMaxConfig (1492-1502) ---
        let miniMaxConfig = {
            apiKey: '',
            baseUrl: 'https://api.minimaxi.com/v1',
            model: 'MiniMax-M2.7',
            groupId: '',
            features: {
                aiDialogue: false,
                aiSerendipity: false,
                aiTechnique: false
            }
        };

        // --- combatState (5037-5051) ---
        let combatState = {
            inProgress: false,
            player: null,
            opponent: null,
            round: 0,
            turn: 'player',
            playerAction: null,
            playerSubAction: null,
            log: [],
            effects: {
                player: { attacking: false, defending: false, attackBoost: 0, defenseBoost: 0, ignoreDefense: false, burning: 0, frozen: 0, manaDrain: 0 },
                opponent: { attacking: false, defending: false, attackBoost: 0, defenseBoost: 0, burning: 0, frozen: 0 }
            },
            battleRecord: [],
            // V33 战斗AI学习系统
            combatProfile: {
                playerPatterns: [],     // [{action, count, lastUsed}]
                totalBattles: 0,
                winsAgainst: 0,
                currentEnemy: null,
                learningData: {},       // {enemyId: {adaptationLevel, observedPatterns}}
                preferredDistance: null,
                spellUsageRate: 0,
                defenseFrequency: 0,
                attackTiming: []
            },
            lastCombatDay: 0,           // V33 上次战斗天数（用于触发学习）
            // V35 宗门互动增强
            sectMissions: [],         // [{id, type, target, progress, reward, assignedUid, status, description}]
            sectMissionCooldown: 0,    // 任务冷却
            lastMissionRefreshDay: 0,   // 上次任务刷新
            // V36 装备打造增强
            equipmentForgeCount: 0,     // 累计打造次数（用于解锁配方）
            lastForgeDay: 0,            // 上次打造时间
            // V37 天道法则系统
            celestialLaws: {
                comprehended: [],          // 已领悟的法则 ['time','space',...]
                active: [],                // 当前激活的法则（最多3个）
                comprehending: null,        // 当前领悟中的法则
                comprehendingProgress: 0,  // 领悟进度 0-100
                comprehendDays: 0,         // 领悟已进行的天数
                maxActiveLaws: 3,          // 最大激活数量
                lawBonus: {}               // 当前激活法则计算后的加成
            },
            // V38 仙界社交系统
            immortalAlly: {
                id: null,
                name: '',
                rank: 1,
                role: 'none',     // none|member|elder|vice_leader|leader
                contribution: 0,
                joinedDay: 0,
                allies: [],
                skillLevel: 0,
                dailyActivity: 0,
                lastActivityDay: 0
            },
            immortalFriends: [],   // [{uid, name, realm, intimacy, lastInteraction}]
            allyApplications: [],   // [{allyId, allyName, allyRank, applyDay, status}]
            // V39 仙宠培养系统
            spiritPets: {
                pets: [],
                lastInteractionDay: 0
            },
            // V40 仙界拍卖行
            auction: {
                listings: [],
                frozenFunds: 0,
                playerId: null,
                playerName: null,
                sortType: 'endingSoon'
            },
            // V41 仙界经济系统
            economy: {
                currentInflation: 0.02,
                totalIncome: 0,
                totalExpense: 0,
                totalTax: 0,
                totalWealth: 0,
                avgDailyIncome: 50,
                avgDailyExpense: 0,
                luxuryPurchases: 0,
                activeEvents: [],
                economyBuffs: {}
            },
            // V42 天道竞技场
            celestialArena: {
                currentSeason: 1,
                seasonStartTime: Date.now(),
                currentRank: 1,
                highestRank: 1,
                score: 0,
                totalScoreEarned: 0,
                totalWins: 0,
                totalLosses: 0,
                currentStreak: 0,
                longestStreak: 0,
                promotionWins: 0,
                dailyChallengesUsed: 0,
                derankProtection: 2,
                matchHistory: [],
                lastRewardClaimed: 0,
                totalRewardsClaimed: 0,
                bountyPool: 0,
                bountyWins: 0
            },
            // V43 仙宫建设系统
            palace: {
                level: 1,
                prosperity: 100,
                buildings: [],
                workers: [],
                styleIndex: 0,
                bonus: {
                    incomeBonus: 0,
                    cultivationSpeed: 0,
                    serendipityChance: 0,
                    combatPower: 0
                },
                totalWagesPaid: 0
            },
            // V44 仙法创造系统
            customSpells: [],
            essences: {},
            // V45 天道轮回增强
            karma: {
                points: 0,
                goodKarma: 0,
                evilKarma: 0,
                reincarnationCount: 0,
                pastLifeMemories: []
            }
        };

        // --- secretRealmState (7391-7398) ---
        let secretRealmState = {
            wave: 0,
            totalWaves: 3,
            enemies: [],
            playerHP: 0,
            playerMaxHP: 0,
            rewards: []
        };


// Auto-generated module: auction.js

// ===== AUCTION CONSTANTS (V40) =====
const AUCTION_CONFIG = {
    minIncrement: 0.05,      // 最低加价幅度5%
    maxBidHours: 24,        // 竞拍时长24小时
    bidExtensionMinutes: 5, // 最后5分钟有人出价延长的时长
    platformFee: 0.03,      // 平台手续费3%
    listingFee: 100,         // 挂单费用100灵石
    maxListings: 20,         // 最多同时挂20个物品
    categories: ['功法', '装备', '丹药', '材料', '仙宠', '其他']
};

const AUCTION_RARITY = {
    '普通': { color: '#9e9e9e', bidMultiplier: 1.0 },
    '稀有': { color: '#2196f3', bidMultiplier: 1.5 },
    '珍贵': { color: '#9c27b0', bidMultiplier: 2.5 },
    '史诗': { color: '#ff9800', bidMultiplier: 5 },
    '传说': { color: '#ffd700', bidMultiplier: 10 },
    '神话': { color: '#f44336', bidMultiplier: 25 }
};

const AUCTION_CATEGORIES = {
    '功法': { icon: '📖', itemTypes: ['technique', 'manual'] },
    '装备': { icon: '⚔️', itemTypes: ['weapon', 'armor', 'accessory'] },
    '丹药': { icon: '💊', itemTypes: ['pill', 'elixir'] },
    '材料': { icon: '💎', itemTypes: ['herb', 'ore', 'spirit'] },
    '仙宠': { icon: '🐉', itemTypes: ['pet'] },
    '其他': { icon: '🎁', itemTypes: ['misc'] }
};

// ===== AUCTION FUNCTIONS =====

function showAuctionPanel() {
    const auction = gameState.auction;
    const now = Date.now();
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:1000px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">🏪 仙界拍卖行</h2>
            <div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn" style="background:#4caf50;color:white;" onclick="showAuctionBrowse()">🔍 浏览拍卖</button>
                <button class="btn" style="background:#ff9800;color:white;" onclick="showAuctionMyBids()">📊 我的竞拍</button>
                <button class="btn" style="background:#2196f3;color:white;" onclick="showAuctionMyListings()">📦 我的挂单</button>
                <button class="btn" style="background:#9c27b0;color:white;" onclick="showAuctionCreateListing()">➕ 发布拍卖</button>
            </div>`;

    // 当前热门
    const activeAuctions = auction.listings.filter(l => l.endTime > now && l.status === 'active');
    const endingSoon = activeAuctions.filter(l => l.endTime - now < 3600000).sort((a, b) => a.endTime - b.endTime).slice(0, 5);

    if (endingSoon.length > 0) {
        html += `<div style="margin-bottom:15px;">
            <h3 style="color:#f44336;margin-bottom:10px;">⏰ 即将结束</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">`;
        endingSoon.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const timeLeft = formatAuctionTime(l.endTime - now);
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            html += `<div style="background:rgba(244,67,54,0.2);border:1px solid #f44336;border-radius:8px;padding:10px;cursor:pointer;" onclick="showAuctionDetail(${l.id})">
                <div style="color:${rarityData.color};font-weight:bold;">${item.name}</div>
                <div style="color:#aaa;font-size:0.85em;">${item.category} | ${item.rarity}</div>
                <div style="color:#ffd700;">当前: ${currentBid}灵石</div>
                <div style="color:#f44336;font-size:0.9em;">剩余: ${timeLeft}</div>
            </div>`;
        });
        html += `</div></div>`;
    }

    // 高价值物品
    const highValue = activeAuctions.filter(l => {
        const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
        return currentBid >= 10000;
    }).sort((a, b) => {
        const aBid = a.bids.length > 0 ? a.bids[a.bids.length - 1].amount : a.startPrice;
        const bBid = b.bids.length > 0 ? b.bids[b.bids.length - 1].amount : b.startPrice;
        return bBid - aBid;
    }).slice(0, 5);

    if (highValue.length > 0) {
        html += `<div style="margin-bottom:15px;">
            <h3 style="color:#ffd700;margin-bottom:10px;">💰 高价值拍卖</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">`;
        highValue.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            html += `<div style="background:rgba(255,215,0,0.1);border:1px solid #ffd700;border-radius:8px;padding:10px;cursor:pointer;" onclick="showAuctionDetail(${l.id})">
                <div style="color:${rarityData.color};font-weight:bold;">${item.name}</div>
                <div style="color:#aaa;font-size:0.85em;">${item.category} | ${item.rarity}</div>
                <div style="color:#ffd700;">当前: ${currentBid}灵石</div>
                <div style="color:#aaa;font-size:0.85em;">出价次数: ${l.bids.length}</div>
            </div>`;
        });
        html += `</div></div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
    </div></div></div>`;
    openModal('仙界拍卖行', html, []);
}

function showAuctionBrowse() {
    const auction = gameState.auction;
    const now = Date.now();
    const activeListings = auction.listings.filter(l => l.endTime > now && l.status === 'active');
    const categories = AUCTION_CONFIG.categories;

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">🔍 浏览拍卖</h2>
            <div style="display:flex;gap:8px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn" style="background:#555;color:white;" onclick="showAuctionBrowse()">全部</button>`;
    categories.forEach(cat => {
        html += `<button class="btn" style="background:#333;color:white;" onclick="showAuctionBrowseByCategory('${cat}')">${AUCTION_CATEGORIES[cat].icon} ${cat}</button>`;
    });
    html += `</div>`;

    // 排序选项
    html += `<div style="display:flex;gap:10px;margin-bottom:15px;align-items:center;">
        <span style="color:#aaa;">排序:</span>
        <button class="btn" style="background:#333;color:white;font-size:0.85em;" onclick="sortAuctionListings('endingSoon')">即将结束</button>
        <button class="btn" style="background:#333;color:white;font-size:0.85em;" onclick="sortAuctionListings('priceHigh')">价格最高</button>
        <button class="btn" style="background:#333;color:white;font-size:0.85em;" onclick="sortAuctionListings('priceLow')">价格最低</button>
        <button class="btn" style="background:#333;color:white;font-size:0.85em;" onclick="sortAuctionListings('newest')">最新</button>
    </div>`;

    // 物品列表
    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">`;
    if (activeListings.length === 0) {
        html += `<p style="color:#aaa;text-align:center;grid-column:1/-1;">暂无拍卖物品</p>`;
    } else {
        activeListings.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const timeLeft = formatAuctionTime(l.endTime - now);
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            const isEnding = l.endTime - now < 3600000;
            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${rarityData.color};border-radius:8px;padding:12px;cursor:pointer;${isEnding ? 'border-color:#f44336;' : ''}" onclick="showAuctionDetail(${l.id})">
                <div style="color:${rarityData.color};font-weight:bold;font-size:1.05em;">${item.name}</div>
                <div style="color:#aaa;font-size:0.85em;margin:4px 0;">${AUCTION_CATEGORIES[item.category]?.icon || '🎁'} ${item.category} | ${item.rarity}</div>
                ${item.level ? `<div style="color:#aaa;font-size:0.8em;">等级: ${item.level}</div>` : ''}
                <div style="color:#ffd700;margin-top:5px;">当前: ${formatNumber(currentBid)}灵石</div>
                <div style="color:${isEnding ? '#f44336' : '#aaa'};font-size:0.85em;">⏰ ${timeLeft}</div>
                <div style="color:#aaa;font-size:0.8em;">出价: ${l.bids.length}次</div>
            </div>`;
        });
    }
    html += `</div><div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionPanel()">返回</button>
    </div></div></div>`;
    openModal('浏览拍卖', html, []);
}

function showAuctionBrowseByCategory(category) {
    const auction = gameState.auction;
    const now = Date.now();
    const activeListings = auction.listings.filter(l => l.endTime > now && l.status === 'active' && l.item.category === category);

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">${AUCTION_CATEGORIES[category].icon} ${category}拍卖</h2>`;

    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">`;
    if (activeListings.length === 0) {
        html += `<p style="color:#aaa;text-align:center;grid-column:1/-1;">该分类暂无拍卖物品</p>`;
    } else {
        activeListings.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const timeLeft = formatAuctionTime(l.endTime - now);
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            const isEnding = l.endTime - now < 3600000;
            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${rarityData.color};border-radius:8px;padding:12px;cursor:pointer;${isEnding ? 'border-color:#f44336;' : ''}" onclick="showAuctionDetail(${l.id})">
                <div style="color:${rarityData.color};font-weight:bold;font-size:1.05em;">${item.name}</div>
                <div style="color:#aaa;font-size:0.85em;margin:4px 0;">${item.rarity}</div>
                ${item.level ? `<div style="color:#aaa;font-size:0.8em;">等级: ${item.level}</div>` : ''}
                <div style="color:#ffd700;margin-top:5px;">当前: ${formatNumber(currentBid)}灵石</div>
                <div style="color:${isEnding ? '#f44336' : '#aaa'};font-size:0.85em;">⏰ ${timeLeft}</div>
            </div>`;
        });
    }
    html += `</div><div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionBrowse()">返回</button>
    </div></div></div>`;
    openModal(`${category}拍卖`, html, []);
}

function sortAuctionListings(sortType) {
    gameState.auction.sortType = sortType;
    showAuctionBrowse();
}

function showAuctionDetail(listingId) {
    const auction = gameState.auction;
    const listing = auction.listings.find(l => l.id === listingId);
    if (!listing) {
        addLog('拍卖物品不存在', '#f44336');
        return;
    }

    const item = listing.item;
    const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
    const now = Date.now();
    const timeLeft = listing.endTime - now;
    const currentBid = listing.bids.length > 0 ? listing.bids[listing.bids.length - 1].amount : listing.startPrice;
    const minNextBid = Math.ceil(currentBid * (1 + AUCTION_CONFIG.minIncrement));
    const myBids = listing.bids.filter(b => b.bidderId === gameState.playerId);
    const isHighestBidder = myBids.length > 0 && listing.bids[listing.bids.length - 1].bidderId === gameState.playerId;
    const isOwner = listing.sellerId === gameState.playerId;
    const isEnded = timeLeft <= 0;

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid ${rarityData.color};border-radius:12px;padding:20px;max-width:600px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:${rarityData.color};text-align:center;margin-bottom:10px;">${AUCTION_CATEGORIES[item.category]?.icon || '🎁'} ${item.name}</h2>
            <div style="text-align:center;margin-bottom:15px;">
                <span style="color:#aaa;">${item.category} | ${item.rarity}</span>
                ${item.level ? `<span style="color:#aaa;"> | 等级: ${item.level}</span>` : ''}
            </div>`;

    // 物品描述
    html += `<div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin-bottom:15px;">
        <div style="color:#ffd700;">${item.description || '暂无描述'}</div>
        ${item.stats ? `<div style="margin-top:8px;color:#aaa;">属性: ${Object.entries(item.stats).map(([k, v]) => `${k}+${v}`).join(' | ')}</div>` : ''}
        ${item.effects ? `<div style="color:#aaa;font-size:0.9em;">效果: ${item.effects}</div>` : ''}
    </div>`;

    // 拍卖信息
    html += `<div style="margin-bottom:15px;">
        <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
            <span style="color:#aaa;">起拍价</span>
            <span style="color:#ffd700;">${formatNumber(listing.startPrice)}灵石</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
            <span style="color:#aaa;">当前价</span>
            <span style="color:#ffd700;font-weight:bold;">${formatNumber(currentBid)}灵石</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
            <span style="color:#aaa;">竞拍次数</span>
            <span style="color:#fff;">${listing.bids.length}次</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
            <span style="color:#aaa;">剩余时间</span>
            <span style="color:${timeLeft < 3600000 ? '#f44336' : '#4caf50'};font-weight:bold;">${isEnded ? '已结束' : formatAuctionTime(timeLeft)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px;">
            <span style="color:#aaa;">卖家</span>
            <span style="color:#fff;">${listing.sellerName}</span>
        </div>
    </div>`;

    // 竞拍历史
    if (listing.bids.length > 0) {
        html += `<div style="margin-bottom:15px;">
            <h4 style="color:#ffd700;margin-bottom:8px;">竞拍记录</h4>`;
        listing.bids.slice(-5).reverse().forEach(b => {
            const isMe = b.bidderId === gameState.playerId;
            html += `<div style="display:flex;justify-content:space-between;padding:4px;font-size:0.9em;">
                <span style="color:${isMe ? '#4caf50' : '#aaa'};">${isMe ? '我' : b.bidderName}</span>
                <span style="color:#ffd700;">${formatNumber(b.amount)}灵石</span>
                <span style="color:#888;">${formatAuctionTime(now - b.time)}前</span>
            </div>`;
        });
        html += `</div>`;
    }

    // 出价/取消
    if (!isEnded) {
        if (isOwner) {
            html += `<p style="color:#aaa;text-align:center;">这是您的拍卖物品</p>`;
        } else {
            if (isHighestBidder) {
                html += `<p style="color:#4caf50;text-align:center;margin-bottom:10px;">🏆 您是当前最高出价者</p>`;
            }
            html += `<div style="display:flex;gap:10px;margin-bottom:10px;">
                <input type="number" id="bidAmount" value="${minNextBid}" min="${minNextBid}" step="${Math.ceil(minNextBid * 0.05)}"
                    style="flex:1;background:#333;border:1px solid #555;color:#ffd700;padding:10px;border-radius:5px;" />
                <button class="btn" style="background:#4caf50;color:white;" onclick="placeBid(${listingId})">出价</button>
            </div>`;
            if (myBids.length > 0) {
                html += `<button class="btn" style="background:#f44336;color:white;width:100%;" onclick="cancelMyBid(${listingId})">取消我的出价（返还${myBids[0].amount}灵石）</button>`;
            }
        }
    } else {
        // 拍卖已结束
        if (listing.bids.length > 0) {
            const winner = listing.bids[listing.bids.length - 1];
            if (winner.bidderId === gameState.playerId) {
                html += `<p style="color:#4caf50;text-align:center;font-size:1.2em;">🏆 恭喜您拍得此物品！</p>`;
                if (!listing.winnerPaid) {
                    html += `<button class="btn" style="background:#4caf50;color:white;width:100%;margin-top:10px;" onclick="claimAuctionItem(${listingId})">确认收货（支付${formatNumber(currentBid)}灵石）</button>`;
                } else {
                    html += `<p style="color:#aaa;text-align:center;">物品已发放至背包</p>`;
                }
            } else if (isOwner) {
                html += `<p style="color:#ffd700;text-align:center;">拍卖结束，售出给 ${winner.bidderName}</p>`;
                html += `<p style="color:#aaa;text-align:center;">获得 ${formatNumber(Math.floor(currentBid * (1 - AUCTION_CONFIG.platformFee)))} 灵石（扣除${AUCTION_CONFIG.platformFee * 100}%手续费）</p>`;
            } else {
                html += `<p style="color:#aaa;text-align:center;">很遗憾，您未能拍得此物品</p>`;
            }
        } else {
            html += `<p style="color:#aaa;text-align:center;">拍卖流拍</p>`;
            if (isOwner) {
                html += `<p style="color:#888;text-align:center;">物品已返还至背包</p>`;
            }
        }
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionBrowse()">返回</button>
    </div></div></div>`;
    openModal('拍卖详情', html, []);
}

function placeBid(listingId) {
    const bidInput = document.getElementById('bidAmount');
    if (!bidInput) return;
    const amount = parseInt(bidInput.value);

    const auction = gameState.auction;
    const listing = auction.listings.find(l => l.id === listingId);
    if (!listing) {
        addLog('拍卖物品不存在', '#f44336');
        return;
    }

    if (listing.sellerId === gameState.playerId) {
        addLog('不能竞拍自己的物品', '#f44336');
        return;
    }

    if (amount > gameState.spiritStones) {
        addLog('灵石不足', '#f44336');
        return;
    }

    const currentBid = listing.bids.length > 0 ? listing.bids[listing.bids.length - 1].amount : listing.startPrice;
    const minBid = Math.ceil(currentBid * (1 + AUCTION_CONFIG.minIncrement));

    if (amount < minBid) {
        addLog(`最低出价 ${formatNumber(minBid)} 灵石`, '#f44336');
        return;
    }

    // 冻结灵石
    gameState.spiritStones -= amount;
    if (!auction.frozenFunds) auction.frozenFunds = 0;
    auction.frozenFunds += amount;

    // 记录出价
    const bid = {
        bidderId: gameState.playerId,
        bidderName: gameState.playerName,
        amount: amount,
        time: Date.now()
    };
    listing.bids.push(bid);

    // 延长竞拍时间（最后5分钟）
    const now = Date.now();
    const timeLeft = listing.endTime - now;
    if (timeLeft < AUCTION_CONFIG.bidExtensionMinutes * 60 * 1000) {
        listing.endTime = now + AUCTION_CONFIG.bidExtensionMinutes * 60 * 1000;
        addLog('竞拍时间已延长5分钟', '#ff9800');
    }

    addLog(`出价成功：${formatNumber(amount)}灵石`, '#4caf50');
    updateDisplay();
    showAuctionDetail(listingId);
}

function cancelMyBid(listingId) {
    const auction = gameState.auction;
    const listing = auction.listings.find(l => l.id === listingId);
    if (!listing) return;

    const myBidIdx = listing.bids.findIndex(b => b.bidderId === gameState.playerId);
    if (myBidIdx === -1) {
        addLog('您没有出价记录', '#f44336');
        return;
    }

    // 解冻灵石
    const myBid = listing.bids[myBidIdx];
    gameState.spiritStones += myBid.amount;
    if (auction.frozenFunds) auction.frozenFunds -= myBid.amount;

    // 移除出价（只移除最后一笔）
    listing.bids.splice(myBidIdx, 1);
    addLog('已取消出价', '#4caf50');
    updateDisplay();
    showAuctionBrowse();
}

function claimAuctionItem(listingId) {
    const auction = gameState.auction;
    const listing = auction.listings.find(l => l.id === listingId);
    if (!listing) return;

    const winner = listing.bids[listing.bids.length - 1];
    if (winner.bidderId !== gameState.playerId) {
        addLog('您不是最高出价者', '#f44336');
        return;
    }

    if (listing.winnerPaid) {
        addLog('已确认收货', '#f44336');
        return;
    }

    const finalPrice = winner.amount;
    const platformFee = Math.floor(finalPrice * AUCTION_CONFIG.platformFee);

    // 解冻并扣除
    if (auction.frozenFunds) auction.frozenFunds -= finalPrice;
    gameState.spiritStones -= (finalPrice - winner.amount); // 只补差价
    if (gameState.spiritStones < 0) {
        gameState.spiritStones += finalPrice;
        addLog('灵石不足', '#f44336');
        return;
    }

    // 发放物品
    addItemToInventory(listing.item);
    listing.winnerPaid = true;

    // 给卖家转帐（扣除手续费）
    const sellerEarnings = finalPrice - platformFee;
    // 卖家灵石通过后台处理，这里只记录
    listing.sellerEarnings = sellerEarnings;

    addLog(`获得物品：${listing.item.name}`, '#4caf50');
    updateDisplay();
    showAuctionPanel();
}

function showAuctionMyBids() {
    const auction = gameState.auction;
    const now = Date.now();
    const myBidListings = auction.listings.filter(l => l.bids.some(b => b.bidderId === gameState.playerId));

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff9800;border-radius:12px;padding:20px;max-width:800px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ff9800;text-align:center;margin-bottom:15px;">📊 我的竞拍</h2>`;

    if (myBidListings.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">暂无竞拍记录</p>`;
    } else {
        html += `<div style="display:grid;gap:12px;">`;
        myBidListings.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            const myLastBid = [...l.bids].reverse().find(b => b.bidderId === gameState.playerId);
            const isHighest = l.bids.length > 0 && l.bids[l.bids.length - 1].bidderId === gameState.playerId;
            const isEnded = l.endTime <= now;
            const timeLeft = l.endTime - now;

            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${rarityData.color};border-radius:8px;padding:12px;cursor:pointer;" onclick="showAuctionDetail(${l.id})">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="color:${rarityData.color};font-weight:bold;">${item.name}</div>
                        <div style="color:#aaa;font-size:0.85em;">${item.category} | ${item.rarity}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:${isHighest ? '#4caf50' : '#f44336'};">${isHighest ? '🏆 领先' : '落后'}</div>
                        <div style="color:#ffd700;">我的出价: ${formatNumber(myLastBid?.amount || 0)}</div>
                        <div style="color:#aaa;font-size:0.85em;">${isEnded ? '已结束' : '剩余: ' + formatAuctionTime(timeLeft)}</div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionPanel()">返回</button>
    </div></div></div>`;
    openModal('我的竞拍', html, []);
}

function showAuctionMyListings() {
    const auction = gameState.auction;
    const now = Date.now();
    const myListings = auction.listings.filter(l => l.sellerId === gameState.playerId);

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #2196f3;border-radius:12px;padding:20px;max-width:800px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#2196f3;text-align:center;margin-bottom:15px;">📦 我的挂单</h2>`;

    if (myListings.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">暂无挂单</p>`;
    } else {
        html += `<div style="display:grid;gap:12px;">`;
        myListings.forEach(l => {
            const item = l.item;
            const rarityData = AUCTION_RARITY[item.rarity] || AUCTION_RARITY['普通'];
            const currentBid = l.bids.length > 0 ? l.bids[l.bids.length - 1].amount : l.startPrice;
            const isEnded = l.endTime <= now;
            const timeLeft = l.endTime - now;

            html += `<div style="background:rgba(0,0,0,0.3);border:1px solid ${rarityData.color};border-radius:8px;padding:12px;cursor:pointer;" onclick="showAuctionDetail(${l.id})">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="color:${rarityData.color};font-weight:bold;">${item.name}</div>
                        <div style="color:#aaa;font-size:0.85em;">起拍: ${formatNumber(l.startPrice)}灵石</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#ffd700;font-weight:bold;">当前: ${formatNumber(currentBid)}灵石</div>
                        <div style="color:${isEnded ? '#f44336' : '#4caf50'};">${isEnded ? '已结束' : '剩余: ' + formatAuctionTime(timeLeft)}</div>
                        <div style="color:#aaa;font-size:0.85em;">出价: ${l.bids.length}次</div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionPanel()">返回</button>
    </div></div></div>`;
    openModal('我的挂单', html, []);
}

function showAuctionCreateListing() {
    const auction = gameState.auction;
    if (auction.listings.filter(l => l.sellerId === gameState.playerId && l.endTime > Date.now()).length >= AUCTION_CONFIG.maxListings) {
        addLog(`最多同时挂${AUCTION_CONFIG.maxListings}个物品`, '#f44336');
        return;
    }

    // 获取可上架物品（背包中的装备/丹药/材料等）
    const sellableItems = gameState.inventory.filter(item => {
        return item && (item.rarity || item.quality) && !item.auctionListed;
    });

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #9c27b0;border-radius:12px;padding:20px;max-width:600px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#9c27b0;text-align:center;margin-bottom:15px;">➕ 发布拍卖</h2>
            <p style="color:#aaa;text-align:center;margin-bottom:15px;">挂单费用: ${AUCTION_CONFIG.listingFee}灵石 | 手续费: ${AUCTION_CONFIG.platformFee * 100}%</p>`;

    if (sellableItems.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">背包中没有可上架的物品</p>`;
    } else {
        html += `<div style="max-height:300px;overflow-y:auto;margin-bottom:15px;">
            <div style="display:grid;gap:8px;">`;
        sellableItems.slice(0, 10).forEach((item, idx) => {
            const rarity = item.rarity || item.quality || '普通';
            const rarityData = AUCTION_RARITY[rarity] || AUCTION_RARITY['普通'];
            html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:5px;cursor:pointer;"
                onclick="selectAuctionItem(${idx})" id="auctionItem${idx}">
                <div>
                    <span style="color:${rarityData.color};">${item.name}</span>
                    <span style="color:#888;font-size:0.85em;">${rarity}</span>
                </div>
                <span style="color:#ffd700;">选择</span>
            </div>`;
        });
        html += `</div></div>`;

        // 选择后显示设置表单
        html += `<div id="auctionForm" style="display:none;">
            <div style="margin-bottom:10px;">
                <label style="color:#aaa;display:block;margin-bottom:5px;">起拍价（灵石）</label>
                <input type="number" id="auctionStartPrice" value="1000" min="1" step="100"
                    style="width:100%;background:#333;border:1px solid #555;color:#ffd700;padding:8px;border-radius:5px;" />
            </div>
            <div style="margin-bottom:10px;">
                <label style="color:#aaa;display:block;margin-bottom:5px;">拍卖时长</label>
                <select id="auctionDuration" style="width:100%;background:#333;border:1px solid #555;color:#ffd700;padding:8px;border-radius:5px;">
                    <option value="6">6小时</option>
                    <option value="12">12小时</option>
                    <option value="24" selected>24小时</option>
                    <option value="48">48小时</option>
                    <option value="72">72小时</option>
                </select>
            </div>
            <button class="btn" style="background:#4caf50;color:white;width:100%;" onclick="confirmAuctionListing()">确认发布</button>
        </div>`;

        // 存储选择
        window._selectedAuctionItem = null;
        window._sellableItems = sellableItems.slice(0, 10);
    }

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showAuctionPanel()">取消</button>
    </div></div></div>`;
    openModal('发布拍卖', html, []);
}

function selectAuctionItem(idx) {
    window._selectedAuctionItem = idx;
    document.getElementById('auctionForm').style.display = 'block';

    // 高亮选中
    document.querySelectorAll('[id^="auctionItem"]').forEach((el, i) => {
        el.style.border = i === idx ? '2px solid #4caf50' : 'none';
    });
}

function confirmAuctionListing() {
    const idx = window._selectedAuctionItem;
    if (idx === null || idx === undefined) {
        addLog('请选择要拍卖的物品', '#f44336');
        return;
    }

    const item = window._sellableItems[idx];
    if (!item) return;

    const startPrice = parseInt(document.getElementById('auctionStartPrice').value);
    const duration = parseInt(document.getElementById('auctionDuration').value);

    if (startPrice < 1) {
        addLog('起拍价必须大于0', '#f44336');
        return;
    }

    if (gameState.spiritStones < AUCTION_CONFIG.listingFee) {
        addLog(`挂单费用${AUCTION_CONFIG.listingFee}灵石不足`, '#f44336');
        return;
    }

    // 扣除挂单费
    gameState.spiritStones -= AUCTION_CONFIG.listingFee;

    // 从背包移除
    const invIdx = gameState.inventory.findIndex(i => i === item);
    if (invIdx !== -1) gameState.inventory.splice(invIdx, 1);

    // 创建拍卖
    const auction = gameState.auction;
    const listing = {
        id: 'auction_' + Date.now(),
        item: { ...item },
        sellerId: gameState.playerId,
        sellerName: gameState.playerName,
        startPrice: startPrice,
        currentPrice: startPrice,
        startTime: Date.now(),
        endTime: Date.now() + duration * 3600000,
        bids: [],
        status: 'active',
        winnerPaid: false,
        sellerEarnings: 0
    };

    auction.listings.push(listing);
    addLog(`拍卖发布成功：${item.name}，起拍价${formatNumber(startPrice)}灵石`, '#4caf50');
    updateDisplay();
    showAuctionPanel();
}

function processAuctionEnd() {
    const auction = gameState.auction;
    const now = Date.now();

    auction.listings.forEach(listing => {
        if (listing.status === 'active' && listing.endTime <= now) {
            listing.status = 'ended';

            if (listing.bids.length > 0) {
                const winner = listing.bids[listing.bids.length - 1];
                // 如果赢家未付款或未确认，物品返还卖家（简化处理）
                if (!listing.winnerPaid && winner.bidderId !== listing.sellerId) {
                    // 返还卖家灵石（解冻）
                    // 实际上赢家灵石已冻结，这里简化处理
                }
            } else {
                // 流拍，物品返还卖家
                addItemToInventory(listing.item);
                addLog(`拍卖流拍：${listing.item.name} 已返还背包`, '#aaa');
            }
        }
    });
}

function formatAuctionTime(ms) {
    if (ms <= 0) return '0秒';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (hours > 0) return `${hours}小时${minutes}分`;
    if (minutes > 0) return `${minutes}分${seconds}秒`;
    return `${seconds}秒`;
}

function formatNumber(num) {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toLocaleString();
}

// 初始化playerId
if (!gameState.playerId) {
    gameState.playerId = 'player_' + Date.now();
}
if (!gameState.playerName) {
    gameState.playerName = '修士' + Math.floor(Math.random() * 9999);
}
// Auto-generated module: ui.js

        // --- CONTINENTS (7877-7926) ---
        const CONTINENTS = {
            '中州': {
                icon: '🏯',
                requiredRealm: 0, // 筑基
                dangerLevel: 1,
                description: '新手大陆，安全区域，宗门林立',
                color: '#4caf50',
                regions: ['中州城', '中州野外', '青云山']
            },
            '南疆': {
                icon: '🌴',
                requiredRealm: 1, // 金丹
                dangerLevel: 2,
                description: '妖兽聚集之地，材料丰富',
                color: '#ff9800',
                regions: ['南疆密林', '妖兽谷', '毒瘴沼泽']
            },
            '北域': {
                icon: '❄️',
                requiredRealm: 2, // 元婴
                dangerLevel: 3,
                description: '宗门林立，功法交易盛行',
                color: '#2196f3',
                regions: ['北域雪山', '冰魄宫', '寒冰洞府']
            },
            '西域': {
                icon: '🏜️',
                requiredRealm: 3, // 化神
                dangerLevel: 4,
                description: '秘境众多，机缘深厚',
                color: '#ff5722',
                regions: ['西域沙漠', '火焰山', '风沙遗迹']
            },
            '东海': {
                icon: '🌊',
                requiredRealm: 2, // 元婴
                dangerLevel: 3,
                description: '海族领地，神兽出没',
                color: '#00bcd4',
                regions: ['东海渔村', '深海礁石', '龙宫入口']
            },
            '仙界碎片': {
                icon: '✨',
                requiredRealm: 4, // 渡劫
                dangerLevel: 5,
                description: '飞升前最终试炼，蕴含成仙之秘',
                color: '#9c27b0',
                regions: ['仙府遗迹', '天劫之渊', '飞升祭坛']
            }
        };

        // --- REGIONS (7929-8052) ---
        const REGIONS = {
            '中州城': {
                type: 'safe', // 安全区
                monsters: [],
                resources: ['灵草', '普通矿石'],
                description: '繁华的修仙者聚落，可休息和交易'
            },
            '中州野外': {
                type: 'wild', // 野外区
                monsters: ['野兔精', '狐狸精'],
                monsterLevel: [1, 5],
                resources: ['灵草', '妖兽血'],
                description: '中州边缘的野外区域，有低级妖兽出没'
            },
            '青云山': {
                type: 'secret', // 秘境
                secretRealm: '青云洞府',
                difficulty: 'low',
                description: '上古修士洞府，藏有入门功法'
            },
            '南疆密林': {
                type: 'wild',
                monsters: ['妖兽狼', '巨蟒'],
                monsterLevel: [10, 20],
                resources: ['妖兽皮', '妖兽骨', '南疆蛊虫'],
                description: '密林深处，妖兽横行'
            },
            '妖兽谷': {
                type: 'boss', // 有首领
                monsters: ['妖兽狼王'],
                monsterLevel: [25],
                bossName: '妖兽谷主',
                resources: ['妖兽皮', '兽王胆'],
                description: '妖兽聚集之地，首领，每7天刷新'
            },
            '毒瘴沼泽': {
                type: 'wild',
                monsters: ['毒蛙', '沼蟒'],
                monsterLevel: [15, 25],
                resources: ['毒囊', '沼泽精华'],
                description: '充满毒气的沼泽区域'
            },
            '北域雪山': {
                type: 'wild',
                monsters: ['冰魄熊', '雪怪'],
                monsterLevel: [25, 35],
                resources: ['冰魄精', '寒冰髓'],
                description: '终年积雪，寒冷刺骨'
            },
            '冰魄宫': {
                type: 'boss',
                monsters: ['冰魄熊王'],
                monsterLevel: [40],
                bossName: '冰魄宫主',
                resources: ['冰魄精', '万年寒冰'],
                description: '冰系修士的圣地，首领，每7天刷新'
            },
            '寒冰洞府': {
                type: 'secret',
                secretRealm: '上古冰宫',
                difficulty: 'medium',
                description: '上古遗迹，藏有冰系高阶功法'
            },
            '西域沙漠': {
                type: 'wild',
                monsters: ['沙虫', '蝎王'],
                monsterLevel: [40, 50],
                resources: ['沙之心', '蝎王毒'],
                description: '茫茫沙漠，危机四伏'
            },
            '火焰山': {
                type: 'boss',
                monsters: ['火焰狮王'],
                monsterLevel: [55],
                bossName: '火焰山主',
                resources: ['火精', '熔岩核心'],
                description: '火焰肆虐之地，首领，每7天刷新'
            },
            '风沙遗迹': {
                type: 'secret',
                secretRealm: '古修士遗迹',
                difficulty: 'high',
                description: '上古遗迹，藏有混沌石'
            },
            '东海渔村': {
                type: 'safe',
                monsters: [],
                resources: ['珍珠', '海藻'],
                description: '东海之滨的小渔村，可休整'
            },
            '深海礁石': {
                type: 'wild',
                monsters: ['海妖', '巨型章鱼'],
                monsterLevel: [35, 45],
                resources: ['海妖珠', '深海珍珠'],
                description: '深海区域，海族妖兽出没'
            },
            '龙宫入口': {
                type: 'secret',
                secretRealm: '东海龙宫',
                difficulty: 'high',
                description: '传说中龙族的宫殿，藏有龙族秘宝'
            },
            '仙府遗迹': {
                type: 'secret',
                secretRealm: '仙府',
                difficulty: 'extreme',
                description: '仙界碎片中的遗迹，有飞升道具'
            },
            '天劫之渊': {
                type: 'boss',
                monsters: ['天劫守护兽'],
                monsterLevel: [70],
                bossName: '天劫化身',
                resources: ['天劫雷晶', '渡劫丹方'],
                description: '天劫之力凝聚，首领，每7天刷新'
            },
            '飞升祭坛': {
                type: 'secret',
                secretRealm: '飞升台',
                difficulty: 'extreme',
                description: '最终飞升之地，需要渡劫期才能进入'
            }
        };

        // --- SECRET_REALMS (8055-8086) ---
        const SECRET_REALMS = {
            '青云洞府': {
                duration: 30,
                reward: '入门功法',
                successRate: 0.8
            },
            '上古冰宫': {
                duration: 40,
                reward: '冰系功法',
                successRate: 0.6
            },
            '古修士遗迹': {
                duration: 50,
                reward: '混沌石',
                successRate: 0.4
            },
            '东海龙宫': {
                duration: 50,
                reward: '龙族材料',
                successRate: 0.35
            },
            '仙府': {
                duration: 60,
                reward: '飞升道具',
                successRate: 0.25
            },
            '飞升台': {
                duration: 60,
                reward: '飞升丹',
                successRate: 0.2
            }
        };


// Auto-generated module: worldmap.js

        // ===== initWorldMap =====
        function initWorldMap() {
            if (!gameState.worldMap) {
                gameState.worldMap = {
                    currentContinent: '中州',
                    currentRegion: '中州城',
                    exploredContinents: ['中州'],
                    exploredRegions: ['中州城', '中州野外'],
                    actionPower: 10,
                    maxActionPower: 10,
                    continentUnlocks: {
                        '中州': 0,   // 筑基
                        '南疆': 1,   // 金丹
                        '北域': 2,   // 元婴
                        '西域': 3,   // 化神
                        '东海': 2,   // 元婴
                        '仙界碎片': 4 // 渡劫
                    },
                    bossRefreshDays: {}, // 记录首领刷新时间
                    lastTravelDay: 0
                };
            }
        }

        // ===== openWorldMap =====
        function openWorldMap() {
            initWorldMap();
            renderWorldMap();
            document.getElementById('worldMapModal').classList.add('active');
        }

        // ===== closeWorldMap =====
        function closeWorldMap() {
            document.getElementById('worldMapModal').classList.remove('active');
        }

        // ===== renderWorldMap =====
        function renderWorldMap(selectedContinent = null) {
            const wm = gameState.worldMap;
            let html = `
                <div class="worldmap-header">
                    <div class="current-location">
                        📍 ${wm.currentContinent} - ${wm.currentRegion}
                    </div>
                    <div class="action-power">
                        <span class="action-power-label">今日行动力:</span>
                        <span class="action-power-value">${wm.actionPower}/${wm.maxActionPower}</span>
                    </div>
                </div>
                <div class="worldmap-grid">
            `;

            // 渲染大陆卡片
            for (const [name, data] of Object.entries(CONTINENTS)) {
                const isUnlocked = gameState.realm >= data.requiredRealm;
                const isExplored = wm.exploredContinents.includes(name);
                const isCurrent = wm.currentContinent === name;
                const isSelected = selectedContinent === name;

                let statusClass = 'explored';
                let statusText = '已探索';
                if (isCurrent) {
                    statusClass = 'current';
                    statusText = '当前';
                } else if (!isExplored) {
                    statusClass = 'danger';
                    statusText = '未探索';
                }

                let dangerStars = '';
                for (let i = 1; i <= 5; i++) {
                    dangerStars += `<span class="danger-star ${i <= data.dangerLevel ? '' : 'empty'}">★</span>`;
                }

                const realmNames = ['筑基', '金丹', '元婴', '化神', '渡劫'];
                const requiredText = realmNames[data.requiredRealm] + '期';

                html += `
                    <div class="continent-card ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'current' : ''} ${isExplored ? 'explored' : ''}"
                         onclick="${isUnlocked ? `selectContinent('${name}')` : ''}"
                         style="border-color: ${isCurrent ? '#ffd700' : (isExplored ? 'rgba(76,175,80,0.5)' : 'rgba(255,255,255,0.1)')}">
                        ${!isUnlocked ? '<span class="boss-indicator">🔒</span>' : ''}
                        ${data.regions.some(r => REGIONS[r] && REGIONS[r].type === 'secret') ? '<span class="secret-realm-badge">秘境</span>' : ''}
                        <div class="continent-icon">${data.icon}</div>
                        <div class="continent-name">${name}</div>
                        <div class="continent-realm">需要: ${requiredText}</div>
                        <div class="continent-danger">${dangerStars}</div>
                        <span class="continent-status status-${isCurrent ? 'safe' : (!isExplored ? 'danger' : 'safe')}">${isCurrent ? '当前' : (!isExplored ? '未探索' : '已探索')}</span>
                        ${!isUnlocked ? `<div class="lock-reason">境界不足，无法进入</div>` : ''}
                    </div>
                `;
            }

            html += '</div>';

            // 渲染区域详情
            if (selectedContinent) {
                html += renderRegionDetail(selectedContinent);
            } else {
                html += renderRegionDetail(wm.currentContinent);
            }

            document.getElementById('worldMapContent').innerHTML = html;
        }

        // ===== renderRegionDetail =====
        function renderRegionDetail(continentName) {
            const wm = gameState.worldMap;
            const continentData = CONTINENTS[continentName];
            const isUnlocked = gameState.realm >= continentData.requiredRealm;

            let html = `<div class="region-detail">`;
            html += `<div class="region-detail-header">`;
            html += `<div class="region-detail-title">${continentName} - 区域</div>`;
            html += `</div>`;

            // 区域信息
            html += `<div class="region-detail-info">`;
            html += `<div class="region-info-item">
                        <div class="region-info-label">大陆危险度</div>
                        <div class="region-info-value">${'★'.repeat(continentData.dangerLevel)}${'☆'.repeat(5 - continentData.dangerLevel)}</div>
                    </div>`;
            html += `<div class="region-info-item">
                        <div class="region-info-label">进入境界</div>
                        <div class="region-info-value">${['筑基', '金丹', '元婴', '化神', '渡劫'][continentData.requiredRealm]}期</div>
                    </div>`;
            html += `<div class="region-info-item">
                        <div class="region-info-label">探索状态</div>
                        <div class="region-info-value">${wm.exploredContinents.includes(continentName) ? '已探索' : '未探索'}</div>
                    </div>`;
            html += `</div>`;

            // 显示区域列表
            html += `<div class="region-monsters">`;
            html += `<div class="region-section-title">🏰 区域列表</div>`;
            html += `<div class="region-item-list">`;
            for (const regionName of continentData.regions) {
                const regionData = REGIONS[regionName];
                if (!regionData) continue;

                const isExplored = wm.exploredRegions.includes(regionName);
                const isCurrent = wm.currentRegion === regionName;
                const isBossRegion = regionData.type === 'boss';
                const isSecret = regionData.type === 'secret';
                const isSafe = regionData.type === 'safe';

                let regionClass = '';
                if (isCurrent) regionClass = 'style="background:rgba(255,215,0,0.3);border:1px solid #ffd700;"';
                else if (isExplored) regionClass = 'style="background:rgba(76,175,80,0.2);border:1px solid rgba(76,175,80,0.5);"';

                let typeIcon = isSafe ? '🏠' : isBossRegion ? '👹' : isSecret ? '🌀' : '⚔️';
                let typeText = isSafe ? '安全' : isBossRegion ? '首领' : isSecret ? '秘境' : '野外';

                html += `
                    <div class="region-item-tag" ${regionClass} onclick="selectRegion('${regionName}')">
                        ${typeIcon} ${regionName} <span style="font-size:0.75em;color:#888;">(${typeText})</span>
                        ${isCurrent ? '<span style="color:#ffd700;">[当前]</span>' : ''}
                    </div>
                `;
            }
            html += `</div></div>`;

            // 行动按钮
            html += `<div class="region-actions">`;
            if (continentName !== wm.currentContinent && isUnlocked) {
                const travelCost = 1;
                const canTravel = wm.actionPower >= travelCost && wm.lastTravelDay < gameState.days;
                html += `<button class="btn-travel" ${!canTravel ? 'disabled' : ''} onclick="travelToContinent('${continentName}')">
                    🚀 前往${continentName} (消耗${travelCost}行动力)
                </button>`;
            } else if (continentName === wm.currentContinent) {
                html += `<button class="btn-travel" disabled>📍 已在${continentName}</button>`;
            } else {
                html += `<button class="btn-travel" disabled>🔒 境界不足</button>`;
            }
            html += `</div>`;
            html += `</div>`;

            return html;
        }

        // ===== selectContinent =====
        function selectContinent(continentName) {
            renderWorldMap(continentName);
        }

        // ===== selectRegion =====
        function selectRegion(regionName) {
            const wm = gameState.worldMap;
            const regionData = REGIONS[regionName];
            if (!regionData) return;

            // 如果是当前区域，显示进入选项
            if (wm.currentRegion === regionName) {
                enterRegion(regionName);
            } else {
                // 前往该大陆
                const continentName = Object.keys(CONTINENTS).find(c => CONTINENTS[c].regions.includes(regionName));
                if (continentName && gameState.realm >= CONTINENTS[continentName].requiredRealm) {
                    travelToContinent(continentName, regionName);
                }
            }
        }

        // ===== travelToContinent =====
        function travelToContinent(continentName, targetRegion = null) {
            const wm = gameState.worldMap;
            if (wm.actionPower < 1) {
                alert('行动力不足！');
                return;
            }
            if (wm.lastTravelDay >= gameState.days) {
                alert('今日已移动过，每天最多移动2次！');
                return;
            }

            wm.actionPower -= 1;
            wm.lastTravelDay = gameState.days;
            wm.currentContinent = continentName;

            // 探索新大陆
            if (!wm.exploredContinents.includes(continentName)) {
                wm.exploredContinents.push(continentName);
                addLog('good', '新大陆', `发现了${continentName}！这是一片新的领域。`);
            }

            // 设置区域
            if (targetRegion) {
                wm.currentRegion = targetRegion;
            } else {
                // 默认进入该大陆的第一个安全区
                const continentData = CONTINENTS[continentName];
                const safeRegion = continentData.regions.find(r => REGIONS[r] && REGIONS[r].type === 'safe') || continentData.regions[0];
                wm.currentRegion = safeRegion;
            }

            gameState.days += 1;
            addLog('neutral', '旅行', `经过1天跋涉，你来到了${continentName}的${wm.currentRegion}。`);

            saveGame();
            updateDisplay();
            renderWorldMap(continentName);
            checkDailyEffects();
        }

        // ===== enterRegion =====
        function enterRegion(regionName) {
            const wm = gameState.worldMap;
            const regionData = REGIONS[regionName];
            if (!regionData) return;

            wm.currentRegion = regionName;

            // 探索新区域
            if (!wm.exploredRegions.includes(regionName)) {
                wm.exploredRegions.push(regionName);
                addLog('good', '探索', `探索了${regionName}！`);
            }

            // 根据区域类型触发事件
            if (regionData.type === 'safe') {
                addLog('neutral', '安全区域', regionData.description);
                // 安全区休息，恢复少量灵气
                const recover = Math.floor(gameState.maxQi * 0.1);
                gameState.qi = Math.min(gameState.maxQi, gameState.qi + recover);
                addLog('good', '休息', `在${regionName}休息，恢复${recover}灵气。`);
            } else if (regionData.type === 'wild') {
                // 野外区，强制战斗
                triggerWildEncounter(regionName);
            } else if (regionData.type === 'boss') {
                // 首领区
                triggerBossEncounter(regionName);
            } else if (regionData.type === 'secret') {
                // 秘境入口
                triggerSecretRealm(regionName);
            }

            saveGame();
            updateDisplay();
            renderWorldMap(wm.currentContinent);
        }

        // ===== triggerWildEncounter =====
        function triggerWildEncounter(regionName) {
            const regionData = REGIONS[regionName];
            if (!regionData || regionData.monsters.length === 0) {
                addLog('neutral', '探索', `在${regionName}探索，未发现妖兽。`);
                return;
            }

            const monsterName = regionData.monsters[Math.floor(Math.random() * regionData.monsters.length)];
            const levelRange = regionData.monsterLevel || [1, 10];
            const level = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];

            // 随机事件
            const eventRoll = Math.random();
            if (eventRoll < 0.4) {
                // 40% 遭遇战斗
                startMonsterBattle(monsterName, level, regionData);
            } else if (eventRoll < 0.6) {
                // 20% 发现资源
                const resource = regionData.resources[Math.floor(Math.random() * regionData.resources.length)];
                addLog('good', '发现资源', `在${regionName}发现了${resource}！`);
                if (Math.random() < 0.5) {
                    addToInventory('material', resource, 1, 'common');
                }
            } else if (eventRoll < 0.7) {
                // 10% 遇到商人
                const bonus = Math.floor(Math.random() * 20) + 10;
                gameState.spiritStones += bonus;
                addLog('good', '遇到商人', `在${regionName}遇到行商，获得${bonus}灵石！`);
            } else if (eventRoll < 0.85) {
                // 15% 触发奇遇
                addLog('neutral', '奇遇', `在${regionName}感受到灵气波动，似乎有奇遇降临...`);
                if (Math.random() < 0.3) {
                    triggerRandomSerendipity();
                }
            } else {
                // 15% 无事发生
                addLog('neutral', '探索', `在${regionName}探索，未有特殊发现。`);
            }
        }

        // ===== triggerBossEncounter =====
        function triggerBossEncounter(regionName) {
            const regionData = REGIONS[regionName];
            if (!regionData) return;

            const bossName = regionData.bossName || regionData.monsters[0];
            const bossLevel = regionData.monsterLevel ? regionData.monsterLevel[0] : 30;

            // 检查首领是否刷新
            const wm = gameState.worldMap;
            const lastDefeatDay = wm.bossRefreshDays[regionName] || 0;
            const daysSinceDefeat = gameState.days - lastDefeatDay;

            if (daysSinceDefeat < 7 && lastDefeatDay > 0) {
                addLog('neutral', '首领', `${bossName}尚未刷新，还需${7 - daysSinceDefeat}天。`);
                // 普通野外事件
                triggerWildEncounter(regionName);
                return;
            }

            // 首领战斗
            startBossBattle(bossName, bossLevel, regionName);
        }

        // ===== startMonsterBattle =====
        function startMonsterBattle(monsterName, level, regionData) {
            const playerPower = calculatePlayerPower();

            if (playerPower < level * 10) {
                // 实力不足，有风险
                const fleeChance = 0.3 + (gameState.activeEffects.escape || 0) * 0.1;
                if (Math.random() < fleeChance) {
                    addLog('neutral', '遭遇', `遭遇${monsterName}，你选择避战绕行。`);
                    return;
                } else {
                    // 战斗失败
                    const stoneLoss = Math.floor(gameState.spiritStones * 0.2);
                    gameState.spiritStones -= stoneLoss;
                    addLog('bad', '战斗失败', `不是${monsterName}的对手，损失${stoneLoss}灵石！`);
                    return;
                }
            }

            // 战斗成功
            const expGain = level * 5;
            gameState.cultivationProgress += expGain;
            addLog('good', '战斗胜利', `击败${monsterName}，获得${expGain}修为！`);

            // 掉落材料
            if (regionData.resources && Math.random() < 0.5) {
                const resource = regionData.resources[Math.floor(Math.random() * regionData.resources.length)];
                addToInventory('material', resource, 1, 'common');
                addLog('good', '获得材料', `获得${resource}！`);
            }

            // 消耗行动力
            const wm = gameState.worldMap;
            wm.actionPower = Math.max(0, wm.actionPower - 1);
        }

        // ===== startBossBattle =====
        function startBossBattle(bossName, bossLevel, regionName) {
            const playerPower = calculatePlayerPower();

            addLog('neutral', '首领出现', `${bossName}出现在${regionName}！这是一场硬仗！`);

            if (playerPower < bossLevel * 15) {
                // 实力不足
                const stoneLoss = Math.floor(gameState.spiritStones * 0.3);
                gameState.spiritStones -= stoneLoss;
                addLog('bad', '首领击败', `${bossName}太强了！损失${stoneLoss}灵石！`);
                return;
            }

            // 首领战斗
            const wm = gameState.worldMap;
            const expGain = bossLevel * 20;
            gameState.cultivationProgress += expGain;
            wm.bossRefreshDays[regionName] = gameState.days;

            addLog('good', '首领击败', `艰难击败${bossName}！获得${expGain}修为！`);

            // A5 成就检查 - 秘境首领击杀
            if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {} };
            gameState.achievements.stats.dungeonBossesKilled++;
            checkAchievements();

            // 稀有掉落
            const regionData = REGIONS[regionName];
            if (regionData && regionData.resources && Math.random() < 0.7) {
                const resource = regionData.resources[Math.floor(Math.random() * regionData.resources.length)];
                const quality = Math.random() < 0.3 ? 'rare' : 'precious';
                addToInventory('material', resource, 1, quality);
                addLog('good', '稀有掉落', `获得稀有材料${resource}！`);
            }

            wm.actionPower = Math.max(0, wm.actionPower - 2);
        }

        // ===== triggerSecretRealm =====
        function triggerSecretRealm(regionName) {
            const regionData = REGIONS[regionName];
            if (!regionData || !regionData.secretRealm) return;

            const realmData = SECRET_REALMS[regionData.secretRealm];
            if (!realmData) return;

            // 检查秘境令
            const token = gameState.inventory.find(i => i.type === 'material' && i.name === '秘境令');
            if (!token) {
                addLog('neutral', '秘境', `${regionData.secretRealm}需要秘境令才能进入。`);
                // 可以触发其他事件
                if (Math.random() < 0.5) {
                    triggerWildEncounter(regionName);
                }
                return;
            }

            // 消耗秘境令
            removeFromInventory('秘境令', 1);

            addLog('good', '进入秘境', `消耗秘境令，进入${regionData.secretRealm}！`);

            // 秘境探索结果
            if (Math.random() < realmData.successRate) {
                // 成功
                const reward = realmData.reward;
                if (reward === '入门功法') {
                    addToInventory('technique', '青云诀', 1, 'spirit', '修炼速度+10%', '基础功法');
                } else if (reward === '冰系功法') {
                    addToInventory('technique', '冰魄心法', 1, 'heaven', '冰系亲和+15', '高阶冰系功法');
                } else if (reward === '混沌石') {
                    addToInventory('material', '混沌石', 1, 'legendary');
                } else if (reward === '龙族材料') {
                    addToInventory('material', '龙鳞', 1, 'precious');
                } else if (reward === '飞升道具') {
                    addToInventory('material', '飞升丹', 1, 'legendary');
                } else if (reward === '飞升丹') {
                    addToInventory('material', '飞升丹', 1, 'legendary');
                }
                addLog('good', '秘境探索', `在${regionData.secretRealm}获得${reward}！`);
            } else {
                // 失败
                addLog('bad', '秘境失败', `${regionData.secretRealm}探索失败，未能获得奖励。`);
            }

            const wm = gameState.worldMap;
            wm.actionPower = Math.max(0, wm.actionPower - 2);
        }

        // ===== calculatePlayerPower =====
        function calculatePlayerPower() {
            let power = gameState.realm * 50 + gameState.stage * 20 + Math.floor(gameState.qi / 10);
            power += gameState.activeEffects.attack || 0;
            power += gameState.activeEffects.all_stats || 0;

            // 装备加成
            for (const equip of gameState.equippedTreasures) {
                if (equip && equip.effect) {
                    if (typeof equip.effect === 'number') {
                        power += equip.effect;
                    }
                }
            }

            return power;
        }

        // ===== removeFromInventory =====
        function removeFromInventory(itemName, quantity) {
            const idx = gameState.inventory.findIndex(i => i.name === itemName);
            if (idx !== -1) {
                gameState.inventory[idx].quantity -= quantity;
                if (gameState.inventory[idx].quantity <= 0) {
                    gameState.inventory.splice(idx, 1);
                }
            }
        }

        // ===== updateMinimapDisplay =====
        function updateMinimapDisplay() {
            const minimapEl = document.getElementById('minimapDisplay');
            if (minimapEl && gameState.worldMap) {
                const wm = gameState.worldMap;
                const continentIcon = CONTINENTS[wm.currentContinent]?.icon || '🏰';
                minimapEl.innerHTML = `<span class="minimap-icon">${continentIcon}</span><span class="minimap-text">${wm.currentContinent}</span>`;
            }
        }


