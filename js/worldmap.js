// Auto-generated module: worldmap.js
'use strict';

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

                let typeIcon = isSafe ? '🏠' : isBoss ? '👹' : isSecret ? '🌀' : '⚔️';
                let typeText = isSafe ? '安全' : isBoss ? '首领' : isSecret ? '秘境' : '野外';

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

