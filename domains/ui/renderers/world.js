// ===== UI Renderer: world.js =====
// Phase 5 extraction - UI layer

        // ===== closeBeyondHeaven =====
        function closeBeyondHeaven() {
            document.getElementById('beyondHeavenModal').classList.remove('active');
        }

        // ===== closeBeyondResult =====
        function closeBeyondResult() {
            closeModal();
            renderBeyondHeaven();
        }

        // ===== closeSerendipityModal =====
        function closeSerendipityModal() {
            document.getElementById('serendipityModal').classList.remove('active');
        }

        // ===== closeWorldMap =====
        function closeWorldMap() {
            document.getElementById('worldMapModal').classList.remove('active');
        }

        // ===== openBeyondHeaven =====
        function openBeyondHeaven() {
            initBeyondHeaven();
            renderBeyondHeaven();
            document.getElementById('beyondHeavenModal').classList.add('active');
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

        // ===== openWorldMap =====
        function openWorldMap() {
            initWorldMap();
            renderWorldMap();
            document.getElementById('worldMapModal').classList.add('active');
        }

        // ===== renderBeyondHeaven =====
        function renderBeyondHeaven() {
            const bh = gameState.beyondHeaven;
            const beyondAreas = CONTINENTS['天外天'].regions;
            tth = gameState.thirtyThreeHeavens;

            // 计算属性
            const totalExplored = bh.exploredAreas.length;
            const mysteryCount = bh.mysteryLogs.length;

            // A3 新增统计
            const exploredHeavens = tth ? tth.visitedHeavens.length : 0;
            const totalHeavens = 38; // A3扩展到38重天
            const lawImprints = tth ? tth.lawImprints.length : 0;
            const requiredImprints = 36; // 进入超脱天需要36个法则印记

            let html = `
                <div class="beyond-heaven-header">
                    <div class="beyond-heaven-title">🌌 天外天 🌌</div>
                    <div class="beyond-heaven-subtitle">诸天万界交汇之地 · 超脱轮回之所</div>
                </div>

                <div class="beyond-stats">
                    <div class="beyond-stat">
                        <div class="beyond-stat-label">探索区域</div>
                        <div class="beyond-stat-value">${totalExplored}/${beyondAreas.length}</div>
                    </div>
                    <div class="beyond-stat">
                        <div class="beyond-stat-label">天外天灵力</div>
                        <div class="beyond-stat-value">${bh.spiritualPower}/${bh.maxSpiritualPower}</div>
                    </div>
                    <div class="beyond-stat">
                        <div class="beyond-stat-label">神秘发现</div>
                        <div class="beyond-stat-value">${mysteryCount}</div>
                    </div>
                </div>

                <!-- A3 新增天境统计 -->
                <div class="beyond-stats" style="margin-top:10px;">
                    <div class="beyond-stat">
                        <div class="beyond-stat-label">已探索天境</div>
                        <div class="beyond-stat-value" style="color:#ffd700;">${exploredHeavens}/${totalHeavens}</div>
                    </div>
                    <div class="beyond-stat">
                        <div class="beyond-stat-label">法则印记</div>
                        <div class="beyond-stat-value" style="color:${lawImprints >= requiredImprints ? '#4caf50' : '#ff9800'};">${lawImprints}/${requiredImprints}</div>
                    </div>
                    ${lawImprints >= requiredImprints ? '<div class="beyond-stat"><div class="beyond-stat-label" style="color:#4caf50;">🌟 超脱天已解锁</div></div>' : ''}
                </div>

                <div class="beyond-area-grid">
            `;

            // 渲染每个区域
            const areaData = {
                '天道碎片': { icon: '⚡', danger: 5, reward: '天道法则', type: '秘境' },
                '命运长河': { icon: '🌊', danger: 4, reward: '命运之水', type: '野外' },
                '轮回之地': { icon: '🔄', danger: 5, reward: '轮回法则', type: '首领' },
                '大道之树': { icon: '🌳', danger: 5, reward: '大道之果', type: '秘境' },
                '永恒星域': { icon: '⭐', danger: 5, reward: '永恒星核', type: '野外' }
            };

            for (const areaName of beyondAreas) {
                const isExplored = bh.exploredAreas.includes(areaName);
                const isSelected = bh.selectedArea === areaName;
                const data = areaData[areaName] || { icon: '❓', danger: 5, reward: '未知', type: '未知' };
                const regionData = REGIONS[areaName] || {};
                const desc = regionData.description || `天外天神秘区域：${areaName}`;

                html += `
                    <div class="beyond-area-card ${isExplored ? 'explored' : ''} ${isSelected ? 'selected' : ''}"
                         onclick="selectBeyondArea('${areaName}')">
                        <div class="beyond-area-icon">${data.icon}</div>
                        <div class="beyond-area-name">${areaName}</div>
                        <div class="beyond-area-desc">${desc}</div>
                        <div class="beyond-area-info">
                            <span class="beyond-area-tag tag-danger">危险度 ${'★'.repeat(data.danger)}</span>
                            <span class="beyond-area-tag tag-reward">${data.reward}</span>
                            <span class="beyond-area-tag tag-mystery">${data.type}</span>
                        </div>
                        ${isExplored ? '<div style="color:#4caf50;margin-top:8px;">✓ 已探索</div>' : ''}
                    </div>
                `;
            }

            html += `
                </div>
                <button class="beyond-explore-btn" onclick="exploreBeyondArea()" ${!bh.selectedArea ? 'disabled' : ''}>
                    ${bh.selectedArea ? `🚀 探索 ${bh.selectedArea}` : '请先选择一个区域'}
                </button>
            `;

            // 三十三天Tab按钮
            html += '<div style="margin:15px 0;text-align:center;">';
            html += '<button class="btn" onclick="showThirtyThreeTab()" style="background:linear-gradient(135deg,#4a148c,#7b1fa2);color:#ffd700;border:2px solid #ffd700;">📜 三十三天</button>';
            
            // 如果已解锁第33重天且未解锁道祖遗迹，显示解锁按钮
            tth = gameState.thirtyThreeHeavens;
            if (tth && tth.visitedHeavens.includes(33) && !tth.daoAncestorUnlocked) {
                html += '<button class="btn" onclick="unlockDaoAncestor()" style="background:linear-gradient(135deg,#ff6f00,#ff8f00);color:#fff;border:2px solid #ffd700;margin-left:10px;">🏛️ 道祖遗迹</button>';
            } else if (tth && tth.daoAncestorUnlocked) {
                html += '<button class="btn" onclick="showDaoAncestorTab()" style="background:linear-gradient(135deg,#ff6f00,#ff8f00);color:#fff;border:2px solid #ffd700;margin-left:10px;">🏛️ 道祖遗迹</button>';
            }
            html += '</div>';
            html += '<div id="thirtyThreeTab" style="display:none;">';
            html += renderThirtyThreeHeavens();
            html += '</div>';
            
            // 道祖遗迹Tab
            html += '<div id="daoAncestorTab" style="display:none;">';
            html += renderDaoAncestor();
            html += '</div>';

            // 神秘日志
            if (bh.mysteryLogs.length > 0) {
                html += `
                    <div class="beyond-mystery-log">
                        <div style="color:#ffd700;font-size:1.1em;margin-bottom:10px;">✨ 神秘发现记录</div>
                `;
                for (const log of bh.mysteryLogs.slice(-5).reverse()) {
                    html += `
                        <div class="mystery-log-entry">
                            <div class="mystery-log-title">${log.title}</div>
                            <div class="mystery-log-text">${log.text}</div>
                        </div>
                    `;
                }
                html += '</div>';
            }

            document.getElementById('beyondHeavenContent').innerHTML = html;
        }

        // ===== renderDaoAncestor =====
        function renderDaoAncestor() {
            tth = gameState.thirtyThreeHeavens;
            if (!tth || !tth.daoAncestorUnlocked) {
                return '<div class="story-locked">道祖遗迹尚未解锁...完成三十三天探索即可解锁</div>';
            }

            let html = '<div class="dao-ancestor-container">';
            
            // 头部信息
            html += `
                <div class="dao-ancestor-header">
                    <div class="dao-ancestor-title">🏛️ 道祖遗迹</div>
                    <div class="dao-ancestor-subtitle">历代道祖长眠之地 · 蕴含天道终极奥秘</div>
                </div>
            `;

            // 统计数据
            html += `
                <div class="dao-ancestor-stats">
                    <div class="dao-ancestor-stat">
                        <div class="dao-ancestor-stat-label">已探索层数</div>
                        <div class="dao-ancestor-stat-value">${tth.daoAncestorLayers.length}/5</div>
                    </div>
                    <div class="dao-ancestor-stat">
                        <div class="dao-ancestor-stat-label">发现道祖</div>
                        <div class="dao-ancestor-stat-value">${tth.daoAncestorDiscovered.length}/${DAO_ANCESTORS.length}</div>
                    </div>
                </div>
            `;

            // 天道印记显示
            html += '<div class="heavenly-seal-section">';
            html += '<h4 style="color:#ffd700;margin-bottom:10px;">🔮 天道印记</h4>';
            if (tth.heavenlySeals.length > 0) {
                tth.heavenlySeals.forEach(sealId => {
                    const seal = HEAVENLY_SEALS.find(s => s.id === sealId);
                    if (seal) {
                        html += `
                            <div class="heavenly-seal">
                                <div class="heavenly-seal-icon">${seal.icon}</div>
                                <div class="heavenly-seal-name">${seal.name}</div>
                                <div class="heavenly-seal-desc">${seal.desc}</div>
                                <div class="heavenly-seal-count">${seal.effect}</div>
                            </div>
                        `;
                    }
                });
            } else {
                html += '<div style="color:#888;text-align:center;">尚未获得天道印记</div>';
            }
            html += `<div style="color:#4caf50;font-size:0.85em;margin-top:5px;">累计获得: ${tth.totalSealsCollected}枚</div>`;
            html += '</div>';

            // 法则领悟进度
            html += `
                <div class="law-comprehension">
                    <div class="law-comprehension-header">
                        <span class="law-comprehension-title">📜 天道法则领悟</span>
                        <span class="law-comprehension-progress">${tth.lawsComprehended.length}/${HEAVENLY_LAWS.length} 已领悟</span>
                    </div>
                    <div class="law-comprehension-bar">
                        <div class="law-comprehension-fill" style="width:${(tth.lawsComprehended.length / HEAVENLY_LAWS.length) * 100}%"></div>
                    </div>
            `;

            // 法则列表
            html += '<div class="law-list">';
            HEAVENLY_LAWS.forEach(law => {
                const comprehended = tth.lawsComprehended.includes(law.id);
                html += `
                    <div class="law-item ${comprehended ? 'comprehended' : ''}" onclick="comprehendLaw('${law.id}')">
                        ${law.name}${comprehended ? ' ✓' : ''}
                    </div>
                `;
            });
            html += '</div></div>';

            // 道祖遗迹层数
            html += '<div class="dao-ancestor-layers">';
            html += '<h4 style="color:#ffd700;margin-bottom:10px;">🏛️ 遗迹层数</h4>';
            DAO_ANCESTOR_LAYERS.forEach((layer, index) => {
                const isExplored = tth.daoAncestorLayers.includes(layer.id);
                const isLocked = index > 0 && !tth.daoAncestorLayers.includes(DAO_ANCESTOR_LAYERS[index - 1].id);
                const isCurrent = tth.daoAncestorCurrentLayer === layer.id;

                let layerClass = 'dao-ancestor-layer';
                if (isExplored) layerClass += ' explored';
                if (isLocked) layerClass += ' locked';
                if (isCurrent) layerClass += ' current';

                html += `
                    <div class="${layerClass}" onclick="${!isLocked && !isExplored ? `exploreDaoAncestorLayer(${layer.id})` : ''}">
                        <div class="dao-ancestor-layer-name">${layer.name} ${isCurrent ? '[当前]' : ''}</div>
                        <div class="dao-ancestor-layer-desc">${layer.desc}</div>
                        <div class="dao-ancestor-layer-reward">奖励: ${layer.reward} ${isExplored ? '✓' : ''}</div>
                        ${isLocked ? '<div style="color:#f44336;font-size:0.8em;">需先完成上一层</div>' : ''}
                    </div>
                `;
            });
            html += '</div>';

            // 探索按钮
            const canExplore = tth.daoAncestorCurrentLayer > 0 && tth.daoAncestorCurrentLayer < 5;
            html += `
                <button class="dao-ancestor-explore-btn" onclick="exploreCurrentDaoAncestorLayer()" ${!canExplore ? 'disabled' : ''}>
                    ${canExplore ? '🚀 探索当前层' : '选择一层开始探索'}
                </button>
            `;

            html += '</div>';
            return html;
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

        // ===== renderThirtyThreeHeavens =====
        function renderThirtyThreeHeavens() {
            tth = gameState.thirtyThreeHeavens;
            if (!tth || !tth.unlocked) {
                return '<div class="story-locked">三十三天尚未解锁...</div>';
            }
            
            let html = '<div class="thirty-three-heavens">';
            
            // 当前章节显示
            if (tth.currentAct > 0 && tth.currentAct <= 5) {
                const actKey = 'act' + tth.currentAct;
                const act = MAIN_PLOT[actKey];
                html += `<div class="plot-banner">
                    <h3>📜 ${act.title}</h3>
                    <p style="color:#ffd700;font-size:13px;">${act.description}</p>
                </div>`;
            }
            
            // A3 三十三天列表 - 显示所有已解锁的天境，未解锁的显示为问号
            html += '<div class="heavens-grid">';
            
            // 首先显示所有已解锁的天境
            tth.unlockedHeavens.forEach(id => {
                const heaven = THIRTY_THREE_HEAVENS.find(h => h.id === id);
                if (!heaven) return;
                const visited = tth.visitedHeavens.includes(id);
                const loreKnown = tth.loreDiscovered.includes(id);
                
                // 特殊图标 for 37 and 38
                let specialIcon = '';
                if (id === 37 && tth.hasTranscenderTitle) {
                    specialIcon = '<span style="color:#9c27b0;">🌑</span>';
                } else if (id === 38 && tth.finalDestinyChoice) {
                    const endingColors = { transcend: '#9c27b0', return: '#4caf50', eternal: '#ffd700' };
                    specialIcon = `<span style="color:${endingColors[tth.finalDestinyChoice] || '#ffd700'};">⭐</span>`;
                }
                
                html += `<div class="heaven-card ${visited ? 'visited' : ''}" onclick="exploreHeaven(${id})">
                    <div class="heaven-name">${heaven.name}</div>
                    <div class="heaven-desc">${heaven.desc}</div>
                    ${visited ? '<span class="visited-badge">✓</span>' : ''}
                    ${loreKnown ? '<span class="lore-badge">📖</span>' : ''}
                    ${specialIcon}
                </div>`;
            });
            
            // A3 显示未解锁的天境（问号图标，颜色根据探索进度渐变）
            const lockedHeavens = THIRTY_THREE_HEAVENS.filter(h => !tth.unlockedHeavens.includes(h.id));
            if (lockedHeavens.length > 0) {
                const progress = tth.visitedHeavens.length / 38; // 探索进度
                const baseColor = progress < 0.5 ? '#666' : progress < 0.9 ? '#9c27b0' : '#ffd700';
                
                lockedHeavens.forEach(heaven => {
                    // 只显示34-38的隐藏天境作为未解锁提示
                    if (heaven.id >= 34) {
                        html += `<div class="heaven-card" style="opacity:0.5;cursor:not-allowed;" onclick="showLockedHeavenHint(${heaven.id})">
                            <div class="heaven-name" style="color:${baseColor};">❓${heaven.name.replace(/第.+重天·/, '')}</div>
                            <div class="heaven-desc" style="color:#888;">[ 未解锁 ]</div>
                        </div>`;
                    }
                });
            }
            html += '</div>';
            
            // 已发现 lore 列表
            if (tth.loreDiscovered.length > 0) {
                html += '<div class="lore-section">';
                html += '<h4>📚 已发现的天道记载</h4>';
                tth.loreDiscovered.forEach(id => {
                    const heaven = THIRTY_THREE_HEAVENS.find(h => h.id === id);
                    html += `<div class="lore-entry">
                        <strong>${heaven.name}</strong>: ${heaven.lore.substring(0, 60)}...
                    </div>`;
                });
                html += '</div>';
            }
            
            html += '</div>';
            return html;
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

