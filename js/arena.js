// Auto-generated module: arena.js
'use strict';

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