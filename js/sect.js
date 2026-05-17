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

