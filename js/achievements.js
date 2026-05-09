// Auto-generated module: achievements.js
'use strict';

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

