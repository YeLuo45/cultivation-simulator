// Auto-generated module: sect.js
'use strict';

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
                
                html += `
                    <div class="disciple-card">
                        <div class="disciple-info">
                            <span class="disciple-avatar">${isElder ? '👴' : '🧑‍🎓'}</span>
                            <div>
                                <div class="disciple-name">${d.name}</div>
                                <div class="disciple-realm">${realmName}</div>
                            </div>
                            <span class="disciple-talent ${talentClass}">${d.talent}</span>
                        </div>
                        <div style="text-align:right;">
                            <div class="disciple-contribution">贡献: ${d.contribution}</div>
                            <span class="disciple-status ${statusClass}">${isElder ? '长老' : d.status}</span>
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
                status: 'idle'
            });
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

