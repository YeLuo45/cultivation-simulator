// ===== UI Renderer: achievement.js =====
// Phase 5 extraction - UI layer

        // ===== closeAchievements =====
        function closeAchievements() {
            document.getElementById('achievementModal').classList.remove('active');
        }

        // ===== closeSpiritRootModal =====
        function closeSpiritRootModal() {
            document.getElementById('spiritRootModal').classList.remove('active');
        }

        // ===== openAchievements =====
        function openAchievements() {
            document.getElementById('achievementModal').classList.add('active');
            renderAchievements();
        }

        // ===== openSpiritRootModal =====
        function openSpiritRootModal() {
            document.getElementById('spiritRootModal').classList.add('active');
            renderSpiritRootContent();
        }

        // ===== renderAchievements =====
        function renderAchievements() {
            const content = document.getElementById('achievementContent');
            if (!content) return;

            const ach = gameState.achievements || { 
                unlocked: [], 
                titles: [], 
                stats: {},
                progress: {},
                claimedStages: {},
                seasonPoints: 0,
                seasonRewards: []
            };

            const rarities = { common: '#9E9E9E', rare: '#2196F3', legendary: '#9C27B0', mythic: '#FFD700' };
            const categories = ['cultivation', 'combat', 'story', 'collection', 'exploration', 'social', 'special'];
            const categoryNames = { cultivation: '修炼', combat: '战斗', story: '剧情', collection: '收藏', exploration: '探索', social: '社交', special: '特殊' };
            
            // 赛季信息
            const season = SEASONS.find(s => s.id === gameState.currentSeason);
            
            let html = `<div class="achievement-header">
                <div style="text-align:center;margin-bottom:10px;">
                    <div style="color:#ffd700;font-size:16px;">🏆 ${season ? season.name : '赛季'}</div>
                    <div style="color:#aaa;font-size:12px;">⏰ ${getSeasonCountdown()}</div>
                    <div style="color:#4caf50;font-size:14px;">⭐ 赛季积分: ${ach.seasonPoints}</div>
                </div>
            </div>`;
            
            // 赛季奖励兑换
            if (season && season.rewards.length > 0) {
                html += `<div style="margin-bottom:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">`;
                html += `<div style="color:#fff;font-size:13px;margin-bottom:8px;">🎁 赛季奖励兑换</div>`;
                for (let i = 0; i < season.rewards.length; i++) {
                    const r = season.rewards[i];
                    const claimed = ach.seasonRewards.includes(i);
                    const canClaim = ach.seasonPoints >= r.points && !claimed;
                    const icon = r.type === 'frame' ? '🖼️' : r.type === 'bubble' ? '💬' : '👑';
                    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin:5px 0;padding:5px;background:${claimed ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)'};border-radius:4px;">
                        <span>${icon} ${r.item} (${r.points}积分)</span>
                        <button onclick="claimSeasonReward(${i})" ${canClaim ? '' : 'disabled'} style="padding:3px 10px;font-size:11px;background:${claimed ? '#666' : '#4caf50'};color:#fff;border:none;border-radius:3px;cursor:${canClaim ? 'pointer' : 'default'};">
                            ${claimed ? '已兑换' : '兑换'}
                        </button>
                    </div>`;
                }
                html += `</div>`;
            }

            // 当前头像框/气泡/称号显示
            html += `<div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">`;
            if (ach.titles.length > 0) {
                html += `<div style="padding:5px 10px;background:rgba(255,215,0,0.2);border-radius:4px;font-size:12px;">👑 ${gameState.title || '无'}</div>`;
            }
            if (gameState.equippedFrame) {
                html += `<div style="padding:5px 10px;background:rgba(33,150,243,0.2);border-radius:4px;font-size:12px;">🖼️ ${gameState.equippedFrame}</div>`;
            }
            if (gameState.equippedBubble) {
                html += `<div style="padding:5px 10px;background:rgba(156,39,176,0.2);border-radius:4px;font-size:12px;">💬 ${gameState.equippedBubble}</div>`;
            }
            html += `</div>`;

            // 标签筛选
            html += `<div class="achievement-tabs" style="display:flex;gap:5px;margin-bottom:15px;flex-wrap:wrap;">`;
            html += `<button class="tab-btn ${currentAchievementFilter === 'all' ? 'active' : ''}" onclick="filterAchievements('all')" style="padding:5px 12px;font-size:12px;background:${currentAchievementFilter === 'all' ? '#4caf50' : '#333'};color:#fff;border:none;border-radius:4px;cursor:pointer;">全部</button>`;
            for (const c of categories) {
                const count = ACHIEVEMENTS.filter(a => a.category === c).length;
                html += `<button class="tab-btn ${currentAchievementFilter === c ? 'active' : ''}" onclick="filterAchievements('${c}')" style="padding:5px 12px;font-size:12px;background:${currentAchievementFilter === c ? '#4caf50' : '#333'};color:#fff;border:none;border-radius:4px;cursor:pointer;">${categoryNames[c]}(${count})</button>`;
            }
            html += `</div>`;

            // 成就列表
            const filteredAchs = currentAchievementFilter === 'all' 
                ? ACHIEVEMENTS 
                : ACHIEVEMENTS.filter(a => a.category === currentAchievementFilter);

            html += `<div class="achievement-list">`;
            for (const a of filteredAchs) {
                const unlocked = ach.unlocked.includes(a.id);
                const progress = ach.progress[a.id] || 0;
                const rarityColor = rarities[a.rarity] || '#9E9E9E';
                const rarityName = { common: '普通', rare: '稀有', legendary: '传说', mythic: '神话' }[a.rarity] || '普通';
                
                // 计算百分比
                let targetValue = 100;
                let hasStages = false;
                if (a.stages) {
                    hasStages = true;
                    targetValue = a.stages[a.stages.length - 1].value;
                } else if (a.requirement && a.requirement.value) {
                    targetValue = a.requirement.value;
                }
                const pct = Math.min(100, Math.round((progress / targetValue) * 100));
                
                // 名称显示（隐藏成就未解锁时显示???）
                const displayName = (a.secret && !unlocked) ? '???' : a.name;
                const displayDesc = (a.secret && !unlocked) ? '隐藏成就' : a.desc;
                
                // 稀有度图标
                const rarityIcon = a.rarity === 'legendary' ? '⭐' : a.rarity === 'mythic' ? '🌟' : '•';
                const points = getAchievementPoints(a.rarity);
                
                // 阶段奖励预览
                let stagePreview = '';
                let stageButtons = '';
                if (a.stages) {
                    const claimed = ach.claimedStages[a.id] || [];
                    for (let i = 0; i < a.stages.length; i++) {
                        const stage = a.stages[i];
                        const isClaimed = claimed.includes(i);
                        const canClaim = progress >= stage.value && !isClaimed;
                        const rewardText = stage.reward.type === 'attribute' 
                            ? `+${Math.round(stage.reward.bonus * 100)}% ${stage.reward.target}` 
                            : stage.reward.type === 'title' ? stage.reward.title
                            : stage.reward.type === 'frame' ? stage.reward.item
                            : stage.reward.type === 'bubble' ? stage.reward.item
                            : stage.reward.type === 'item' ? `${stage.reward.item} x${stage.reward.quantity}`
                            : stage.reward.type;
                        
                        stageButtons += `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:11px;">
                            <span style="color:${isClaimed ? '#4caf50' : canClaim ? '#ffd700' : '#666'}">阶段${i + 1}: ${progress}/${stage.value} → ${rewardText}</span>
                            ${canClaim ? `<button onclick="claimAchievementStage('${a.id}', ${i})" style="padding:2px 8px;font-size:10px;background:#4caf50;color:#fff;border:none;border-radius:3px;cursor:pointer;">领取</button>` : ''}
                            ${isClaimed ? '<span style="color:#4caf50;">✓</span>' : ''}
                        </div>`;
                    }
                }
                
                html += `<div class="achievement-card ${unlocked ? 'unlocked' : ''}" style="border-left: 4px solid ${rarityColor}; margin-bottom: 10px; padding: 10px; background: ${unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)'}; border-radius: 4px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:${rarityColor};font-weight:bold;font-size:13px;">${rarityIcon} [${rarityName}] ${displayName}</span>
                        <span style="color:#aaa;font-size:11px;">${unlocked ? '✓ 已解锁' : points + '分'}</span>
                    </div>
                    <div style="color:#ccc;margin:5px 0;font-size:12px;">${displayDesc}</div>
                    ${!unlocked ? `
                        <div style="background:#333;height:6px;border-radius:3px;margin:8px 0;">
                            <div style="background:${rarityColor};height:6px;border-radius:3px;width:${pct}%;transition:width 0.3s;"></div>
                        </div>
                        <div style="color:#888;font-size:11px;">${progress}/${targetValue} (${pct}%)</div>
                    ` : ''}
                    ${stageButtons}
                </div>`;
            }
            html += `</div>`;

            // 已获得称号列表
            if (ach.titles.length > 0) {
                html += `<div style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">`;
                html += `<div style="color:#fff;font-size:13px;margin-bottom:8px;">👑 已获称号</div>`;
                for (const t of ach.titles) {
                    const isEquipped = gameState.title === t;
                    html += `<div class="title-item ${isEquipped ? 'equipped' : ''}" onclick="equipTitle('${t}')" style="padding:5px 10px;margin:3px 0;background:${isEquipped ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)'};border-radius:4px;cursor:pointer;font-size:12px;">
                        【${t}】${isEquipped ? '(已装备)' : '(点击装备)'}
                    </div>`;
                }
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
                
                ${gameState.reincarnation && gameState.reincarnation.count > 0 ? `
                <div class="sr-section">
                    <div class="sr-section-title">🔄 轮回信息</div>
                    <div style="text-align:center;">
                        <div style="margin:10px 0;">
                            <span style="color:#9c27b0;">轮回次数：</span>
                            <span style="color:#ffd700;font-size:1.2em;">${gameState.reincarnation.count}</span>
                        </div>
                        <div style="margin:10px 0;">
                            <span style="color:#9c27b0;">灵魂修为：</span>
                            <span style="color:#ffd700;font-size:1.2em;">${gameState.reincarnation.soulAge}</span>
                        </div>
                        <div style="margin:10px 0;">
                            <span style="color:#9c27b0;">保留修为：</span>
                            <span style="color:#4caf50;font-size:1.2em;">${gameState.reincarnation.rebirthCultivation}</span>
                        </div>
                    </div>
                    ${gameState.reincarnation.pastLifeMemories.length > 0 ? `
                    <div style="margin-top:15px;">
                        <div style="color:#aaa;margin-bottom:5px;">前世记忆碎片：</div>
                        ${gameState.reincarnation.pastLifeMemories.map(m => `<div style="color:#888;font-size:0.9em;margin:5px 0;">✨ ${m}</div>`).join('')}
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
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

