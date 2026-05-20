// ===== UI Renderer: combat.js =====
// Phase 5 extraction - UI layer

        // ===== closeCombat =====
        function closeCombat() {
            document.getElementById('combatModal').classList.remove('active');
            combatState.inProgress = false;
        }

        // ===== closeRankingPVP =====
        function closeRankingPVP() {
            document.getElementById('rankingPVPModal').classList.remove('active');
        }

        // ===== openCombat =====
        function openCombat() {
            renderCombatHome();
            document.getElementById('combatModal').classList.add('active');
        }

        // ===== openRankingPVP =====
        function openRankingPVP() {
            // 更新分区
            const division = getRealmDivision(gameState.realm);
            if (gameState.rankingPVP.realmDivision !== division) {
                gameState.rankingPVP.realmDivision = division;
            }
            renderRankingPVP('ranking');
            document.getElementById('rankingPVPModal').classList.add('active');
        }

        // ===== renderChallengeTab =====
        function renderChallengeTab() {
            const pvp = gameState.rankingPVP;
            const division = pvp.realmDivision;
            const opponents = generateAIOpponents(division, 8);
            const challengesLeft = getDailyChallenges();

            return `
                <div class="ranking-tabs">
                    <div class="ranking-tab" onclick="renderRankingPVP('ranking')">📊 排行榜</div>
                    <div class="ranking-tab active" onclick="renderRankingPVP('challenge')">⚔️ 挑战</div>
                    <div class="ranking-tab" onclick="renderRankingPVP('history')">📜 战绩</div>
                    <div class="ranking-tab" onclick="renderRankingPVP('season')">🏅 赛季</div>
                </div>

                <div class="ranking-realm-title ${division}">
                    ${RANK_CONFIG[division].icon} 选择挑战对手
                </div>

                <div style="text-align:center;margin-bottom:15px;">
                    <span style="color:#ffd700;font-size:1.2em;">剩余挑战次数：${challengesLeft}/3</span>
                    <div style="color:#888;font-size:0.85em;margin-top:5px;">每日凌晨重置</div>
                </div>

                <div class="opponent-list">
                    ${opponents.map((opp, index) => {
                        const difficulty = opp.rating > pvp.rating + 100 ? '困难' : 
                                          opp.rating < pvp.rating - 100 ? '简单' : '中等';
                        const diffClass = difficulty === '困难' ? 'difficulty-hard' : 
                                         difficulty === '简单' ? 'difficulty-easy' : 'difficulty-normal';
                        const rewardMultiplier = difficulty === '困难' ? 1.5 : 
                                               difficulty === '简单' ? 0.7 : 1.0;
                        const expectedReward = Math.floor(20 * rewardMultiplier);

                        return `
                            <div class="opponent-card">
                                <div class="opponent-card-info">
                                    <div class="opponent-card-avatar">${opp.avatar}</div>
                                    <div>
                                        <div class="opponent-card-name">${opp.name}</div>
                                        <div class="opponent-card-realm">${opp.realmName} · ${opp.stageName}</div>
                                        <div class="opponent-card-technique">${opp.rank} · 积分: ${opp.rating}</div>
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <div class="opponent-card-difficulty ${diffClass}">${difficulty}</div>
                                    <div style="color:#aaa;font-size:0.8em;margin-top:5px;">预计奖励: +${expectedReward}积分</div>
                                    <button class="pvp-challenge-btn" 
                                            onclick="startRankingPVP('${opp.id}', ${opp.rating})"
                                            ${challengesLeft <= 0 ? 'disabled' : ''}>
                                        挑战
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <button class="close-btn" onclick="renderRankingPVP('ranking')" style="margin-top:15px;">返回排行榜</button>
            `;
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

        // ===== renderHistoryTab =====
        function renderHistoryTab() {
            const pvp = gameState.rankingPVP;
            const history = pvp.battleHistory.slice(0, 20);

            return `
                <div class="ranking-tabs">
                    <div class="ranking-tab" onclick="renderRankingPVP('ranking')">📊 排行榜</div>
                    <div class="ranking-tab" onclick="renderRankingPVP('challenge')">⚔️ 挑战</div>
                    <div class="ranking-tab active" onclick="renderRankingPVP('history')">📜 战绩</div>
                    <div class="ranking-tab" onclick="renderRankingPVP('season')">🏅 赛季</div>
                </div>

                <div class="ranking-stats-bar">
                    <div class="ranking-stat-box">
                        <div class="value" style="color:#4caf50;">${pvp.wins}</div>
                        <div class="label">总胜场</div>
                    </div>
                    <div class="ranking-stat-box">
                        <div class="value" style="color:#f44336;">${pvp.losses}</div>
                        <div class="label">总负场</div>
                    </div>
                    <div class="ranking-stat-box">
                        <div class="value">${pvp.wins + pvp.losses > 0 ? Math.round(pvp.wins / (pvp.wins + pvp.losses) * 100) : 0}%</div>
                        <div class="label">胜率</div>
                    </div>
                    <div class="ranking-stat-box">
                        <div class="value">${pvp.bestStreak}</div>
                        <div class="label">最高连胜</div>
                    </div>
                </div>

                <div class="ranking-list">
                    ${history.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#888;">
                            暂无战绩记录<br>快去挑战对手吧！
                        </div>
                    ` : history.map(record => `
                        <div class="ranking-item ${record.result === 'win' ? 'player-item' : ''}">
                            <div class="ranking-rank ${record.result === 'win' ? 'rank-1' : 'rank-other'}" style="color:${record.result === 'win' ? '#4caf50' : '#f44336'}">
                                ${record.result === 'win' ? '胜' : '负'}
                            </div>
                            <div class="ranking-info" style="margin-left:10px;">
                                <div class="ranking-name">vs ${record.opponentName}</div>
                                <div class="ranking-details">${record.opponentRank} · 挑战时间: 第${record.day}天</div>
                            </div>
                            <div class="ranking-rating">
                                <div class="ranking-rating-value" style="color:${record.result === 'win' ? '#4caf50' : '#f44336'}">
                                    ${record.result === 'win' ? '+' : '-'}${record.ratingChange}
                                </div>
                                <div class="ranking-rating-label">积分变化</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <button class="close-btn" onclick="renderRankingPVP('ranking')" style="margin-top:15px;">返回排行榜</button>
            `;
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

        // ===== renderRankingPVP =====
        function renderRankingPVP(tab, subTab = null) {
            const pvp = gameState.rankingPVP;
            const content = document.getElementById('rankingPVPContent');
            const rankInfo = getPlayerRankInfo();

            let html = '';

            if (tab === 'ranking') {
                html = renderRankingTab(rankInfo, pvp);
            } else if (tab === 'challenge') {
                html = renderChallengeTab();
            } else if (tab === 'history') {
                html = renderHistoryTab();
            } else if (tab === 'season') {
                html = renderSeasonTab(rankInfo);
            }

            content.innerHTML = html;
        }

        // ===== renderRankingTab =====
        function renderRankingTab(rankInfo, pvp) {
            const division = pvp.realmDivision;
            const opponents = generateAIOpponents(division, 15);
            const playerRankIndex = opponents.findIndex(o => o.id === 'player') + 1 || '-';

            return `
                <div class="ranking-tabs">
                    <div class="ranking-tab active" onclick="renderRankingPVP('ranking')">📊 排行榜</div>
                    <div class="ranking-tab" onclick="renderRankingPVP('challenge')">⚔️ 挑战</div>
                    <div class="ranking-tab" onclick="renderRankingPVP('history')">📜 战绩</div>
                    <div class="ranking-tab" onclick="renderRankingPVP('season')">🏅 赛季</div>
                </div>

                <div class="season-info">
                    <div>第 ${pvp.season} 赛季 · ${RANK_CONFIG[division].icon} ${RANK_CONFIG[division].name}</div>
                    <div class="season-timer">赛季进度：第 ${gameState.days - pvp.seasonStartDay + 1} 天</div>
                </div>

                <div class="ranking-realm-title ${division}">
                    ${rankInfo.division.icon} ${rankInfo.division.name} · ${rankInfo.icon} ${rankInfo.name}
                </div>

                <div class="ranking-stats-bar">
                    <div class="ranking-stat-box">
                        <div class="value">${pvp.rating}</div>
                        <div class="label">积分</div>
                    </div>
                    <div class="ranking-stat-box">
                        <div class="value">${pvp.wins}胜 ${pvp.losses}负</div>
                        <div class="label">战绩</div>
                    </div>
                    <div class="ranking-stat-box">
                        <div class="value" style="color:${pvp.currentStreak >= 0 ? '#4caf50' : '#f44336'}">
                            ${pvp.currentStreak > 0 ? '🔥' : ''}${Math.abs(pvp.currentStreak)}${pvp.currentStreak < 0 ? '💔' : ''}
                        </div>
                        <div class="label">连胜/连负</div>
                    </div>
                    <div class="ranking-stat-box">
                        <div class="value">${rankInfo.nextRank ? rankInfo.nextRank.minRating - pvp.rating : 'MAX'}</div>
                        <div class="label">距上一段位</div>
                    </div>
                </div>

                <div class="ranking-list">
                    ${opponents.map((opp, index) => `
                        <div class="ranking-item ${index < 3 ? 'top-' + (index + 1) : ''}">
                            <div class="ranking-rank ${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other'}">
                                ${index + 1}
                            </div>
                            <div class="ranking-avatar">${opp.avatar}</div>
                            <div class="ranking-info">
                                <div class="ranking-name">${opp.name}</div>
                                <div class="ranking-details">${opp.realmName} · ${opp.rank}</div>
                            </div>
                            <div class="ranking-rating">
                                <div class="ranking-rating-value">${opp.rating}</div>
                                <div class="ranking-rating-label">积分</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <button class="btn btn-combat" onclick="renderRankingPVP('challenge')" style="margin-top:15px;width:100%;">
                    ⚔️ 开始挑战 (剩余 ${getDailyChallenges()} 次)
                </button>
            `;
        }

        // ===== renderSeasonTab =====
        function renderSeasonTab(rankInfo) {
            const pvp = gameState.rankingPVP;

            const seasonRewards = [
                { rank: 1, name: '第1名', reward: '2000灵石 + 冠军称号', icon: '🥇' },
                { rank: 2, name: '第2名', reward: '1500灵石 + 亚军称号', icon: '🥈' },
                { rank: 3, name: '第3名', reward: '1000灵石 + 季军称号', icon: '🥉' },
                { rank: 10, name: '前10', reward: '500灵石 + 精英称号', icon: '⭐' },
                { rank: 50, name: '前50', reward: '200灵石 + 挑战者称号', icon: '🏅' }
            ];

            return `
                <div class="ranking-tabs">
                    <div class="ranking-tab" onclick="renderRankingPVP('ranking')">📊 排行榜</div>
                    <div class="ranking-tab" onclick="renderRankingPVP('challenge')">⚔️ 挑战</div>
                    <div class="ranking-tab" onclick="renderRankingPVP('history')">📜 战绩</div>
                    <div class="ranking-tab active" onclick="renderRankingPVP('season')">🏅 赛季</div>
                </div>

                <div class="season-info">
                    <div>第 ${pvp.season} 赛季 · ${RANK_CONFIG[pvp.realmDivision].icon} ${RANK_CONFIG[pvp.realmDivision].name}</div>
                    <div class="season-timer">
                        赛季时长: 30天 | 剩余: ${Math.max(0, 30 - (gameState.days - pvp.seasonStartDay + 1))} 天
                    </div>
                </div>

                <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:10px;margin-bottom:15px;">
                    <div style="color:#ffd700;margin-bottom:10px;">📊 当前赛季战绩</div>
                    <div style="display:flex;justify-content:space-around;text-align:center;">
                        <div>
                            <div style="font-size:1.5em;color:#ffd700;">${pvp.rating}</div>
                            <div style="font-size:0.8em;color:#888;">当前积分</div>
                        </div>
                        <div>
                            <div style="font-size:1.5em;color:#4caf50;">${pvp.wins}胜</div>
                            <div style="font-size:0.8em;color:#888;">胜场</div>
                        </div>
                        <div>
                            <div style="font-size:1.5em;color:#f44336;">${pvp.losses}负</div>
                            <div style="font-size:0.8em;color:#888;">负场</div>
                        </div>
                        <div>
                            <div style="font-size:1.5em;color:#ff9800;">${pvp.bestStreak}</div>
                            <div style="font-size:0.8em;color:#888;">最高连胜</div>
                        </div>
                    </div>
                </div>

                <div style="color:#ffd700;margin-bottom:10px;">🏆 赛季结束奖励</div>
                <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:10px;">
                    ${seasonRewards.map(reward => `
                        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
                            <span>${reward.icon} ${reward.name}</span>
                            <span style="color:#aaa;">${reward.reward}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top:15px;color:#888;font-size:0.85em;text-align:center;">
                    赛季结束后，根据排行榜排名发放奖励<br>
                    当前在榜排名会影响赛季奖励
                </div>

                <button class="close-btn" onclick="renderRankingPVP('ranking')" style="margin-top:15px;">返回排行榜</button>
            `;
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

