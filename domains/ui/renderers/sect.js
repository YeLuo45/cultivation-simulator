// ===== UI Renderer: sect.js =====
// Phase 5 extraction - UI layer

        // ===== closeDiscipleSelectionModal =====
        function closeDiscipleSelectionModal() {
            const modal = document.getElementById('discipleSelectModal');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        }

        // ===== closeGiftMenu =====
        function closeGiftMenu() {
            const modal = document.getElementById('giftMenuModal');
            if (modal) modal.remove();
        }

        // ===== closeNpcDialogue =====
        function closeNpcDialogue() {
            const modal = document.getElementById('npcDialogueModal');
            if (modal) modal.remove();
        }

        // ===== closePalace =====
        function closePalace() {
            document.getElementById('palaceModal').classList.remove('active');
        }

        // ===== closeSect =====
        function closeSect() {
            document.getElementById('sectModal').classList.remove('active');
        }

        // ===== openNpcDialogue =====
        function openNpcDialogue(discipleUid) {
            const sect = gameState.sect;
            const disciple = sect.disciples.find(d => d.uid === discipleUid);
            if (!disciple) return;

            const role = NPC_ROLES[disciple.npcRole] || NPC_ROLES.disciple;
            const realmName = CONFIG.realms[disciple.realm] || '炼气期';
            const moodEmoji = disciple.npcMood === 'happy' ? '😊' : disciple.npcMood === 'upset' ? '😔' : '😐';

            // V40: 好感度条
            const affection = disciple.npcAffection || 50;
            const affectionColor = affection >= 70 ? '#4CAF50' : affection >= 40 ? '#FFC107' : '#f44336';
            const affectionBar = `<div style="margin-top:5px;display:flex;align-items:center;gap:6px;">
                <span style="font-size:0.75em;color:#888;">好感</span>
                <div style="flex:1;height:6px;background:#333;border-radius:3px;">
                    <div style="width:${affection}%;height:100%;background:${affectionColor};border-radius:3px;transition:width 0.3s;"></div>
                </div>
                <span style="font-size:0.75em;color:${affectionColor};">${affection}</span>
            </div>`;

            // V40: 师徒信息
            let mentorInfo = '';
            if (disciple.npcMasterId) {
                const master = sect.disciples.find(d => d.uid === disciple.npcMasterId);
                if (master) mentorInfo = `<div style="color:#aaa;font-size:0.8em;margin-top:3px;">师傅：${master.name}</div>`;
            } else if (disciple.npcApprentices && disciple.npcApprentices.length > 0) {
                mentorInfo = `<div style="color:#aaa;font-size:0.8em;margin-top:3px;">徒弟：${disciple.npcApprentices.length}人</div>`;
            }

            let historyHtml = '';
            const history = disciple.npcDialogueHistory || [];
            history.slice(-5).forEach(entry => {
                historyHtml += `<div class="npc-msg ${entry.isPlayer ? 'player-msg' : 'npc-msg-other'}">${entry.text}</div>`;
            });
            if (history.length === 0) {
                historyHtml = '<p style="color:#888;text-align:center;">暂无对话记录</p>';
            }

            const modal = document.getElementById('npcDialogueModal');
            if (modal) modal.remove();

            const html = `
                <div id="npcDialogueModal" style="position:fixed;z-index:2000;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;">
                    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid ${role.color};border-radius:15px;padding:20px;max-width:450px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 0 30px rgba(${role.color === '#FFD700' ? '255,215,0' : role.color === '#9c27b0' ? '156,39,176' : '76,175,80'},0.3);">
                        <div style="display:flex;align-items:center;margin-bottom:15px;border-bottom:1px solid #333;padding-bottom:10px;">
                            <span style="font-size:2em;margin-right:10px;">${role.icon}</span>
                            <div>
                                <div style="color:${role.color};font-weight:bold;font-size:1.1em;">${disciple.name}</div>
                                <div style="color:#888;font-size:0.85em;">${role.title} · ${realmName} · ${moodEmoji}</div>
                                ${affectionBar}
                                ${mentorInfo}
                            </div>
                            <button onclick="closeNpcDialogue()" style="margin-left:auto;background:#333;color:#fff;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:1.1em;">×</button>
                        </div>
                        <div id="npcDialogueHistory" style="max-height:200px;overflow-y:auto;margin-bottom:15px;padding:10px;background:#0d0d1a;border-radius:8px;">
                            ${historyHtml}
                        </div>
                        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
                            <button onclick="sendNpcQuickMessage('${discipleUid}','请教')" class="btn" style="background:#333;color:#aaa;padding:6px 12px;font-size:0.85em;border:none;cursor:pointer;border-radius:5px;">请教</button>
                            <button onclick="sendNpcQuickMessage('${discipleUid}','任务')" class="btn" style="background:#333;color:#aaa;padding:6px 12px;font-size:0.85em;border:none;cursor:pointer;border-radius:5px;">任务</button>
                            <button onclick="sendNpcQuickMessage('${discipleUid}','闲聊')" class="btn" style="background:#333;color:#aaa;padding:6px 12px;font-size:0.85em;border:none;cursor:pointer;border-radius:5px;">闲聊</button>
                            ${disciple.npcMasterId ? '' : `<button onclick="showGiftMenu('${discipleUid}')" class="btn" style="background:#333;color:#aaa;padding:6px 12px;font-size:0.85em;border:none;cursor:pointer;border-radius:5px;">🎁 送礼</button>`}
                            ${!disciple.npcMasterId && disciple.npcRole !== 'leader' ? `<button onclick="tryApprentice('${discipleUid}')" class="btn" style="background:#333;color:#aaa;padding:6px 12px;font-size:0.85em;border:none;cursor:pointer;border-radius:5px;">拜师</button>` : ''}
                        </div>
                        <div style="display:flex;gap:8px;">
                            <input type="text" id="npcDialogueInput" placeholder="输入消息..." style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid #333;background:#1a1a2e;color:#fff;font-size:0.9em;" onkeydown="if(event.key==='Enter')sendNpcMessage('${discipleUid}')">
                            <button onclick="sendNpcMessage('${discipleUid}')" class="btn" style="background:${role.color};color:#000;font-weight:bold;padding:8px 16px;border:none;cursor:pointer;border-radius:8px;">发送</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // ===== openPalace =====
        function openPalace() {
            document.getElementById('palaceModal').classList.add('active');
            checkTaskProgress();
            renderPalaceHome();
        }

        // ===== openSect =====
        function openSect() {
            document.getElementById('sectModal').classList.add('active');
            renderSectHome();
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

        // ===== renderCreatePalaceForm =====
        function renderCreatePalaceForm() {
            const canCreate = gameState.realm >= 3 && gameState.spiritStones >= 30000;
            const realmName = CONFIG.realms[gameState.realm];
            
            let html = `
                <div style="text-align:center;padding:30px;">
                    <div style="font-size:64px;margin-bottom:15px;">🏯</div>
                    <h3 style="color:#ffb300;margin-bottom:15px;">🏯 创建仙宫</h3>
                    <p style="color:#aaa;margin-bottom:15px;">
                        宫主境界：${realmName}期<br>
                        ${gameState.realm >= 3 ? '✅ 已达到金丹期，可创建仙宫' : '❌ 需要金丹期才能创建仙宫'}
                    </p>
                    <input type="text" id="palaceNameInput" placeholder="请输入仙宫名称" maxlength="10" style="width:100%;padding:12px;border:1px solid rgba(255,111,0,0.3);border-radius:8px;background:rgba(0,0,0,0.5);color:#fff;margin-bottom:10px;text-align:center;">
                    <div style="color:#888;font-size:0.9em;margin-bottom:15px;">
                        创建消耗：<span style="color:#ffd700;">30000</span> 灵石<br>
                        当前拥有：<span style="color:#ffd700;">${gameState.spiritStones}</span> 灵石
                    </div>
                    <button onclick="createPalace()" ${canCreate ? '' : 'disabled'} style="width:100%;padding:15px;background:${canCreate ? 'linear-gradient(135deg,#ff6f00,#ffb300)' : '#555'};color:white;border:none;border-radius:10px;cursor:${canCreate ? 'pointer' : 'not-allowed'};font-size:1em;font-weight:bold;">
                        🏯 创建仙宫
                    </button>
                </div>
            `;
            return html;
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
                const npcRole = d.npcRole || 'disciple';
                const roleIcon = getNpcRoleIcon(d);
                const roleTitle = getNpcRoleTitle(d);
                const npcMood = d.npcMood === 'happy' ? '😊' : d.npcMood === 'upset' ? '😔' : '😐';
                const taskInfo = d.npcTask ? `任务:${d.npcTask.progress}/${d.npcTask.target}` : '';
                const personalityInfo = getPersonalityInfo(d.npcPersonality);
                const personalityTag = d.npcPersonality ? `<span style="color:${personalityInfo.color};font-size:0.75em;">${personalityInfo.emoji}${personalityInfo.label}</span>` : '';

                html += `
                    <div class="disciple-card">
                        <div class="disciple-info">
                            <span class="disciple-avatar">${roleIcon}</span>
                            <div>
                                <div class="disciple-name">${d.name} <span style="color:${NPC_ROLES[npcRole] ? NPC_ROLES[npcRole].color : '#4CAF50'};font-size:0.75em;">[${roleTitle}]</span> ${npcMood} ${personalityTag}</div>
                                <div class="disciple-realm">${realmName}</div>
                                ${taskInfo ? `<div style="color:#aaa;font-size:0.8em;">${taskInfo}</div>` : ''}
                            </div>
                            <span class="disciple-talent ${talentClass}">${d.talent}</span>
                        </div>
                        <div style="text-align:right;">
                            <div class="disciple-contribution">贡献: ${d.contribution}</div>
                            <span class="disciple-status ${statusClass}">${isElder ? '长老' : d.status}</span>
                            <button onclick="openNpcDialogue('${d.uid}')" style="display:block;margin-top:5px;background:#333;color:#aaa;border:none;padding:3px 8px;border-radius:4px;font-size:0.75em;cursor:pointer;">💬 对话</button>
                        </div>
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
            
            // ========== 双轨系统：宗门仙宫互联 ==========
            html += renderSectPalaceDualTrack();
            
            return html;
        }

        // ===== renderPalaceDisciplesTab =====
        function renderPalaceDisciplesTab() {
            const palace = gameState.palace;
            const maxDisciples = PALACE_CONFIG.maxPalaceDisciples[palace.level];
            
            let html = `
                <div style="margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;">
                    <div style="color:#aaa;">弟子: ${palace.disciples.length}/${maxDisciples}</div>
                    <button onclick="recruitPalaceDisciple()" ${palace.disciples.length >= maxDisciples ? 'disabled' : ''} style="padding:10px 20px;background:${palace.disciples.length >= maxDisciples ? '#555' : 'linear-gradient(135deg,#ff6f00,#ffb300)'};color:white;border:none;border-radius:8px;cursor:${palace.disciples.length >= maxDisciples ? 'not-allowed' : 'pointer'};">
                        ➕ 招募弟子
                    </button>
                </div>
            `;
            
            if (palace.disciples.length === 0) {
                html += '<p style="text-align:center;color:#888;padding:40px;">暂无弟子，快去招募吧！</p>';
                return html;
            }
            
            html += '<div style="display:grid;gap:10px;">';
            palace.disciples.forEach((d, idx) => {
                const workOptions = Object.keys(PALACE_CONFIG.workYields);
                html += `
                    <div style="padding:12px;background:rgba(0,0,0,0.4);border-radius:10px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <div>
                                <span style="font-size:1.2em;">🧑‍🎓</span>
                                <span style="color:#ffd700;font-weight:bold;margin-left:8px;">${d.name}</span>
                                <span style="color:#aaa;font-size:0.85em;margin-left:8px;">${CONFIG.realms[d.realm] || '炼气'}期</span>
                            </div>
                            <div style="color:#aaa;font-size:0.85em;">
                                资质: <span style="color:${d.talent === '上品' ? '#4caf50' : d.talent === '中品' ? '#87ceeb' : '#888'};">${d.talent}</span>
                            </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <select onchange="assignPalaceWork(${idx}, this.value)" style="padding:6px;border:1px solid rgba(255,111,0,0.3);border-radius:5px;background:rgba(0,0,0,0.5);color:#fff;font-size:0.85em;">
                                ${workOptions.map(w => `<option value="${w}" ${d.work === w ? 'selected' : ''}>${w}</option>`).join('')}
                            </select>
                            <div style="color:#888;font-size:0.8em;">
                                工作产出: 灵石${PALACE_CONFIG.workYields[d.work || '修炼中'].spiritStones} | 声望+${PALACE_CONFIG.workYields[d.work || '修炼中'].reputation}
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            return html;
        }

        // ===== renderPalaceHome =====
        function renderPalaceHome() {
            const palace = gameState.palace;
            const content = document.getElementById('palaceContent');
            
            // 检查是否已创建仙宫
            if (!palace.name) {
                content.innerHTML = renderCreatePalaceForm();
                return;
            }

            const levelConfig = PALACE_CONFIG.levelConfig[palace.level];
            const canUpgrade = palace.level < 5 && gameState.spiritStones >= PALACE_CONFIG.levelConfig[palace.level + 1].upgradeCost;
            
            let html = `
                <div class="palace-header" style="display:flex;justify-content:space-between;align-items:center;padding:15px;background:rgba(255,111,0,0.2);border-radius:15px;margin-bottom:15px;">
                    <div class="palace-name" style="color:#ffb300;font-size:1.5em;font-weight:bold;">🏯 ${palace.name}</div>
                    <div class="palace-level" style="padding:5px 15px;background:linear-gradient(135deg,#ff6f00,#ffb300);border-radius:20px;color:white;font-size:0.9em;">
                        ${levelConfig.name} Lv.${palace.level}
                    </div>
                </div>
                <div class="palace-resources" style="display:flex;gap:20px;margin-bottom:15px;">
                    <div class="palace-resource" style="flex:1;padding:15px;background:rgba(0,0,0,0.3);border-radius:10px;text-align:center;">
                        <div style="font-size:1.5em;">💎</div>
                        <div style="color:#ffd700;font-size:1.2em;font-weight:bold;">${palace.spiritStones}</div>
                        <div style="color:#aaa;font-size:0.85em;">仙宫灵石</div>
                    </div>
                    <div class="palace-resource" style="flex:1;padding:15px;background:rgba(0,0,0,0.3);border-radius:10px;text-align:center;">
                        <div style="font-size:1.5em;">⭐</div>
                        <div style="color:#ff69b4;font-size:1.2em;font-weight:bold;">${palace.reputation}</div>
                        <div style="color:#aaa;font-size:0.85em;">声望</div>
                    </div>
                    <div class="palace-resource" style="flex:1;padding:15px;background:rgba(0,0,0,0.3);border-radius:10px;text-align:center;">
                        <div style="font-size:1.5em;">👥</div>
                        <div style="color:#87ceeb;font-size:1.2em;font-weight:bold;">${palace.disciples.length}/${PALACE_CONFIG.maxPalaceDisciples[palace.level]}</div>
                        <div style="color:#aaa;font-size:0.85em;">弟子</div>
                    </div>
                </div>
                <div class="palace-tabs" style="display:flex;gap:10px;margin-bottom:15px;">
                    <div class="palace-tab active" onclick="switchPalaceTab('rooms')" style="flex:1;padding:12px;border:1px solid rgba(255,111,0,0.3);border-radius:10px;background:rgba(0,0,0,0.3);color:#aaa;cursor:pointer;text-align:center;transition:all 0.3s;">🏗️ 房间</div>
                    <div class="palace-tab" onclick="switchPalaceTab('disciples')" style="flex:1;padding:12px;border:1px solid rgba(255,111,0,0.3);border-radius:10px;background:rgba(0,0,0,0.3);color:#aaa;cursor:pointer;text-align:center;transition:all 0.3s;">👥 弟子</div>
                    <div class="palace-tab" onclick="switchPalaceTab('tasks')" style="flex:1;padding:12px;border:1px solid rgba(255,111,0,0.3);border-radius:10px;background:rgba(0,0,0,0.3);color:#aaa;cursor:pointer;text-align:center;transition:all 0.3s;">📜 任务</div>
                    <div class="palace-tab" onclick="switchPalaceTab('manage')" style="flex:1;padding:12px;border:1px solid rgba(255,111,0,0.3);border-radius:10px;background:rgba(0,0,0,0.3);color:#aaa;cursor:pointer;text-align:center;transition:all 0.3s;">⚙️ 管理</div>
                </div>
                <div class="palace-content" id="palaceTabContent" style="max-height:400px;overflow-y:auto;">
                    ${renderRoomsTab()}
                </div>
            `;
            content.innerHTML = html;
        }

        // ===== renderPalaceManageTab =====
        function renderPalaceManageTab() {
            const palace = gameState.palace;
            const levelConfig = PALACE_CONFIG.levelConfig[palace.level];
            const nextLevelConfig = PALACE_CONFIG.levelConfig[palace.level + 1];
            
            let html = `
                <div style="padding:15px;background:rgba(0,0,0,0.4);border-radius:10px;margin-bottom:15px;">
                    <h4 style="color:#ffb300;margin-bottom:10px;">📊 仙宫信息</h4>
                    <div style="color:#aaa;font-size:0.9em;line-height:1.8;">
                        <div>仙宫名称：<span style="color:#ffd700;">${palace.name}</span></div>
                        <div>当前等级：<span style="color:#ffb300;">${levelConfig.name} (Lv.${palace.level})</span></div>
                        <div>房间数量：<span style="color:#87ceeb;">${palace.rooms.length}/${levelConfig.maxRooms}</span></div>
                        <div>声望值：<span style="color:#ff69b4;">${palace.reputation}</span></div>
                    </div>
                </div>
            `;
            
            // 仙宫加成
            const bonusNames = {
                'cultivate_speed': '修炼速度',
                'treasure_bonus': '宝物获取',
                'alchemy_success': '炼丹成功率',
                'forge_success': '炼器成功率',
                'mindset_gain': '心境获取',
                'qi_rate': '灵气获取',
                '渡劫_protect': '渡劫保护',
                'serendipity_rate': '奇遇概率'
            };
            const bonuses = calculatePalaceBonus();
            if (Object.keys(bonuses).length > 0) {
                html += `
                    <div style="padding:15px;background:rgba(0,0,0,0.4);border-radius:10px;margin-bottom:15px;">
                        <h4 style="color:#4caf50;margin-bottom:10px;">✨ 仙宫加成</h4>
                        <div style="font-size:0.85em;color:#aaa;">
                            ${Object.entries(bonuses).map(([key, val]) => `<div>• ${bonusNames[key] || key}: +${(val * 100).toFixed(0)}%</div>`).join('')}
                        </div>
                    </div>
                `;
            }
            
            // 升级仙宫
            if (palace.level < 5) {
                const upgradeCost = nextLevelConfig.upgradeCost;
                const canUpgrade = gameState.spiritStones >= upgradeCost;
                html += `
                    <div style="padding:15px;background:rgba(0,0,0,0.4);border-radius:10px;margin-bottom:15px;">
                        <h4 style="color:#ffb300;margin-bottom:10px;">⬆️ 升级仙宫</h4>
                        <div style="color:#aaa;font-size:0.9em;margin-bottom:10px;">
                            <div>升级后：<span style="color:#4caf50;">${nextLevelConfig.name}</span></div>
                            <div>最大房间：<span style="color:#87ceeb;">${nextLevelConfig.maxRooms}</span></div>
                            <div>最大弟子：<span style="color:#87ceeb;">${PALACE_CONFIG.maxPalaceDisciples[palace.level + 1]}</span></div>
                            <div style="color:#ffd700;">升级费用：💎 ${upgradeCost}</div>
                            <div style="color:#888;font-size:0.85em;margin-top:5px;">${nextLevelConfig.desc}</div>
                        </div>
                        <button onclick="upgradePalace()" ${canUpgrade ? '' : 'disabled'} style="width:100%;padding:12px;background:${canUpgrade ? 'linear-gradient(135deg,#ff6f00,#ffb300)' : '#555'};color:white;border:none;border-radius:8px;cursor:${canUpgrade ? 'pointer' : 'not-allowed'};font-weight:bold;">
                            ⬆️ 升级仙宫
                        </button>
                    </div>
                `;
            }
            
            // 领取产出
            if (gameState.days > palace.lastProductionDay) {
                html += `
                    <button onclick="collectPalaceProduction()" style="width:100%;padding:15px;background:linear-gradient(135deg,#4caf50,#81c784);color:white;border:none;border-radius:10px;cursor:pointer;font-size:1em;font-weight:bold;margin-bottom:15px;">
                        💎 领取仙宫产出
                    </button>
                `;
            } else {
                html += `
                    <div style="text-align:center;padding:15px;color:#888;font-size:0.9em;">
                        明日再来领取仙宫产出
                    </div>
                `;
            }
            
            // 解散仙宫
            html += `
                <button onclick="disbandPalace()" style="width:100%;padding:10px;background:rgba(244,67,54,0.3);color:#f44336;border:1px solid #f44336;border-radius:8px;cursor:pointer;font-size:0.9em;">
                    💀 解散仙宫
                </button>
            `;
            
            // ========== 双轨系统：仙宫宗门互联 ==========
            html += renderPalaceSectDualTrack();
            
            return html;
        }

        // ===== renderPalaceSectDualTrack =====
        function renderPalaceSectDualTrack() {
            const sect = gameState.sect;
            const palace = gameState.palace;
            
            let html = `
                <div style="margin-top:20px;padding:15px;background:rgba(100,50,150,0.2);border-radius:15px;border:1px solid rgba(255,111,0,0.4);">
                    <h4 style="color:#ffb300;margin-bottom:15px;text-align:center;">🔗 双轨系统 - 仙宫端</h4>
            `;
            
            // 检查是否已创建宗门
            if (!sect.name) {
                html += `
                    <div style="text-align:center;padding:20px;color:#888;">
                        <div style="font-size:2em;margin-bottom:10px;">🏛️</div>
                        <div>创建宗门后可开启双轨互联</div>
                        <div style="font-size:0.85em;margin-top:5px;">需要元婴期且消耗50000灵石</div>
                    </div>
                `;
                html += '</div>';
                return html;
            }
            
            // 双轨状态
            const dualEnabled = sect.dualTrackEnabled || false;
            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;">
                    <div>
                        <div style="color:#ffd700;font-weight:bold;">双轨互联</div>
                        <div style="color:#aaa;font-size:0.85em;">宗门↔仙宫资源共享</div>
                    </div>
                    <div style="padding:6px 15px;border-radius:15px;background:${dualEnabled ? '#4caf50' : '#666'};color:white;font-size:0.85em;">
                        ${dualEnabled ? '✅ 已启用' : '❌ 停用'}
                    </div>
                </div>
            `;
            
            // 弟子状态
            const dispatchedDisciples = palace.disciples.filter(d => d.dispatchedFrom === 'sect');
            html += `
                <div style="margin-bottom:15px;">
                    <div style="color:#ffb300;font-weight:bold;margin-bottom:10px;">👥 派遣弟子状态</div>
                    <div style="padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span style="color:#aaa;">来自宗门:</span>
                            <span style="color:#9c27b0;">${dispatchedDisciples.length}人</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span style="color:#aaa;">仙宫自有:</span>
                            <span style="color:#ffb300;">${palace.disciples.length - dispatchedDisciples.length}人</span>
                        </div>
                    </div>
                </div>
            `;
            
            // 资源同步状态
            const syncResources = sect.syncResources || false;
            html += `
                <div style="margin-bottom:15px;">
                    <div style="color:#ffb300;font-weight:bold;margin-bottom:10px;">📦 灵石共享</div>
                    <div style="padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="color:#ffd700;">每日同步10%灵石</div>
                            <div style="color:#888;font-size:0.85em;">开启后双方灵石互通</div>
                        </div>
                        <div style="padding:6px 15px;border-radius:15px;background:${syncResources ? '#4caf50' : '#666'};color:white;font-size:0.85em;">
                            ${syncResources ? '✅ 开启' : '❌ 关闭'}
                        </div>
                    </div>
                </div>
            `;
            
            // 双轨加成显示
            const bonuses = calculateDualTrackBonus();
            if (bonuses.total > 0) {
                html += `
                    <div style="padding:10px;background:rgba(76,175,80,0.2);border-radius:10px;border:1px solid rgba(76,175,80,0.4);">
                        <div style="color:#4caf50;font-weight:bold;margin-bottom:8px;">✨ 双轨加成（已启用）</div>
                        <div style="font-size:0.85em;color:#aaa;">
                            ${bonuses.palaceBonus > 0 ? `<div>• 仙宫产出: +${(bonuses.palaceBonus * 100).toFixed(0)}%</div>` : ''}
                            ${bonuses.cultivateBonus > 0 ? `<div>• 修炼速度: +${(bonuses.cultivateBonus * 100).toFixed(0)}%</div>` : ''}
                            <div style="margin-top:5px;color:#ffd700;">总加成: +${(bonuses.total * 100).toFixed(0)}%</div>
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
            return html;
        }

        // ===== renderPalaceTasksTab =====
        function renderPalaceTasksTab() {
            const palace = gameState.palace;
            const tasks = palace.tasks || [];
            const activeTasks = tasks.filter(t => t.status === 'active');
            const completedTasks = tasks.filter(t => t.status === 'completed');
            
            let html = `
                <div style="margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;">
                    <div style="color:#aaa;">
                        进行中: <span style="color:#ffb300;">${activeTasks.length}</span> | 
                        已完成: <span style="color:#4caf50;">${completedTasks.length}</span>
                    </div>
                    <button onclick="generatePalaceTask()" ${palace.disciples.length === 0 ? 'disabled' : ''} style="padding:10px 20px;background:${palace.disciples.length === 0 ? '#555' : 'linear-gradient(135deg,#ff6f00,#ffb300)'};color:white;border:none;border-radius:8px;cursor:${palace.disciples.length === 0 ? 'not-allowed' : 'pointer'};font-size:0.9em;">
                        📜 生成任务
                    </button>
                </div>
                <div style="color:#888;font-size:0.85em;margin-bottom:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                    💡 派遣弟子执行任务可获得灵石、声望和稀有物品奖励。<br>
                    📊 任务统计：完成 ${palace.taskRecord?.completed || 0} 次，失败 ${palace.taskRecord?.failed || 0} 次
                </div>
            `;
            
            // 进行中的任务
            if (activeTasks.length > 0) {
                html += `<h4 style="color:#ffb300;margin-bottom:10px;">🔄 进行中的任务</h4>`;
                html += '<div style="display:grid;gap:10px;margin-bottom:20px;">';
                activeTasks.forEach((task, idx) => {
                    const taskConfig = PALACE_CONFIG.taskTypes[task.type];
                    const daysLeft = task.endDay - gameState.days;
                    const progress = Math.max(0, Math.min(100, ((task.duration - daysLeft) / task.duration) * 100));
                    const assignedDisciples = task.assignedDisciples || [];
                    const discipleNames = assignedDisciples.map(dId => {
                        const d = palace.disciples.find(pd => pd.uid === dId);
                        return d ? d.name : '未知';
                    }).join(', ');
                    
                    html += `
                        <div style="padding:15px;background:rgba(0,0,0,0.4);border-radius:10px;border:1px solid rgba(255,111,0,0.3);">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <div>
                                    <span style="font-size:1.3em;">${taskConfig.icon}</span>
                                    <span style="color:#ffd700;font-weight:bold;margin-left:8px;">${taskConfig.name}</span>
                                    ${task.difficulty ? `<span style="font-size:0.8em;padding:2px 8px;border-radius:5px;margin-left:8px;background:${task.difficulty === 'hard' ? '#f44336' : task.difficulty === 'normal' ? '#ff9800' : '#4caf50'};color:white;">${task.difficulty === 'hard' ? '困难' : task.difficulty === 'normal' ? '普通' : '简单'}</span>` : ''}
                                </div>
                                <div style="color:#aaa;font-size:0.85em;">
                                    ${daysLeft <= 0 ? '<span style="color:#4caf50;">可领取</span>' : `剩余 ${daysLeft} 天`}
                                </div>
                            </div>
                            <div style="color:#888;font-size:0.85em;margin-bottom:8px;">
                                ${taskConfig.desc} | 派遣弟子: ${discipleNames || '未指定'}
                            </div>
                            <div style="margin-bottom:8px;">
                                <div style="display:flex;justify-content:space-between;color:#888;font-size:0.8em;margin-bottom:3px;">
                                    <span>进度</span>
                                    <span>${Math.round(progress)}%</span>
                                </div>
                                <div style="height:8px;background:rgba(0,0,0,0.5);border-radius:4px;overflow:hidden;">
                                    <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#ff6f00,#ffb300);border-radius:4px;transition:width 0.3s;"></div>
                                </div>
                            </div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                <div style="font-size:0.8em;color:#aaa;">
                                    💎 ${Math.floor((taskConfig.reward.spiritStones || 0) * (task.difficulty ? PALACE_CONFIG.taskDifficultyMultiplier[task.difficulty] : 1))}
                                </div>
                                <div style="font-size:0.8em;color:#aaa;">
                                    ⭐ +${Math.floor((taskConfig.reward.reputation || 0) * (task.difficulty ? PALACE_CONFIG.taskDifficultyMultiplier[task.difficulty] : 1))} 声望
                                </div>
                                ${taskConfig.reward.items ? `<div style="font-size:0.8em;color:#87ceeb;">🎁 ${taskConfig.reward.items.join(',')}</div>` : ''}
                            </div>
                            ${daysLeft <= 0 ? `
                                <button onclick="claimPalaceTask(${idx})" style="margin-top:10px;width:100%;padding:8px;background:linear-gradient(135deg,#4caf50,#69f0ae);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.9em;">
                                    ✨ 领取奖励
                                </button>
                            ` : ''}
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            // 空闲弟子（可分配任务）
            const idleDisciples = palace.disciples.filter(d => !tasks.some(t => t.status === 'active' && (t.assignedDisciples || []).includes(d.uid)));
            
            if (idleDisciples.length > 0 && activeTasks.length < 3) {
                html += `<h4 style="color:#87ceeb;margin-bottom:10px;">🧑‍🎓 可用弟子 (${idleDisciples.length})</h4>`;
                html += '<div style="display:grid;gap:8px;margin-bottom:15px;">';
                idleDisciples.slice(0, 5).forEach(d => {
                    html += `
                        <div style="padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <span style="color:#ffd700;">${d.name}</span>
                                <span style="color:#888;font-size:0.85em;margin-left:10px;">${CONFIG.realms[d.realm] || '炼气'}期 · ${d.talent}</span>
                            </div>
                            <div style="color:#aaa;font-size:0.8em;">
                                ${d.work || '修炼中'}
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            // 最近完成的任务记录
            if (completedTasks.length > 0) {
                html += `<h4 style="color:#888;margin-bottom:10px;">📋 任务记录</h4>`;
                html += '<div style="max-height:200px;overflow-y:auto;">';
                completedTasks.slice(-5).reverse().forEach(task => {
                    const taskConfig = PALACE_CONFIG.taskTypes[task.type];
                    html += `
                        <div style="padding:8px 12px;background:rgba(0,0,0,0.2);border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <span style="color:#888;font-size:0.9em;">${taskConfig.icon} ${taskConfig.name}</span>
                                ${task.success ? '<span style="color:#4caf50;font-size:0.8em;margin-left:8px;">✅成功</span>' : '<span style="color:#f44336;font-size:0.8em;margin-left:8px;">❌失败</span>'}
                            </div>
                            <div style="color:#888;font-size:0.8em;">
                                ${task.claimedAt ? new Date(task.claimedAt).toLocaleDateString() : ''}
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            if (tasks.length === 0) {
                html += `
                    <div style="text-align:center;padding:40px;color:#888;">
                        <div style="font-size:48px;margin-bottom:15px;">📜</div>
                        <div>暂无任务</div>
                        <div style="font-size:0.85em;margin-top:10px;">点击"生成任务"为弟子分配任务</div>
                    </div>
                `;
            }
            
            return html;
        }

        // ===== renderRoomsTab =====
        function renderRoomsTab() {
            const palace = gameState.palace;
            const levelConfig = PALACE_CONFIG.levelConfig[palace.level];
            const maxRooms = levelConfig.maxRooms;
            
            let html = `
                <div style="margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;">
                    <div style="color:#aaa;">房间: ${palace.rooms.length}/${maxRooms}</div>
                    <button onclick="showBuildRoomModal()" ${palace.rooms.length >= maxRooms ? 'disabled' : ''} style="padding:10px 20px;background:${palace.rooms.length >= maxRooms ? '#555' : 'linear-gradient(135deg,#ff6f00,#ffb300)'};color:white;border:none;border-radius:8px;cursor:${palace.rooms.length >= maxRooms ? 'not-allowed' : 'pointer'};">
                        ➕ 建造房间
                    </button>
                </div>
            `;
            
            if (palace.rooms.length === 0) {
                html += '<p style="text-align:center;color:#888;padding:40px;">暂无房间，快去建造吧！</p>';
                return html;
            }
            
            html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">';
            palace.rooms.forEach((room, idx) => {
                const roomConfig = PALACE_CONFIG.roomTypes[room.type];
                html += `
                    <div style="padding:15px;background:rgba(0,0,0,0.4);border-radius:10px;border:1px solid rgba(255,111,0,0.3);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-size:1.5em;">${roomConfig.icon}</span>
                            <span style="color:#ffd700;font-weight:bold;">${room.type}</span>
                            <span style="color:#888;font-size:0.85em;">Lv.${room.level}</span>
                        </div>
                        <div style="color:#4caf50;font-size:0.85em;">${roomConfig.desc}</div>
                        <button onclick="upgradeRoom(${idx})" style="margin-top:8px;width:100%;padding:6px;background:#333;color:#aaa;border:none;border-radius:5px;cursor:pointer;font-size:0.85em;">
                            升级 (${room.level * 5000}灵石)
                        </button>
                    </div>
                `;
            });
            html += '</div>';
            return html;
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
                    ${sect.sectMood !== undefined ? `<div class="sect-resource">
                        <div class="sect-resource-icon">${sect.sectMood >= 70 ? '😊' : sect.sectMood >= 40 ? '😐' : '😰'}</div>
                        <div class="sect-resource-value">${sect.sectMood}</div>
                        <div class="sect-resource-label">宗门气氛</div>
                    </div>` : ''}
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

        // ===== renderSectPalaceDualTrack =====
        function renderSectPalaceDualTrack() {
            const sect = gameState.sect;
            const palace = gameState.palace;
            
            let html = `
                <div style="margin-top:20px;padding:15px;background:rgba(100,50,150,0.2);border-radius:15px;border:1px solid rgba(156,39,176,0.4);">
                    <h4 style="color:#e040fb;margin-bottom:15px;text-align:center;">🔗 宗门仙宫双轨系统</h4>
            `;
            
            // 检查是否已创建仙宫
            if (!palace.name) {
                html += `
                    <div style="text-align:center;padding:20px;color:#888;">
                        <div style="font-size:2em;margin-bottom:10px;">🏯</div>
                        <div>创建仙宫后可开启双轨系统</div>
                        <div style="font-size:0.85em;margin-top:5px;">需要金丹期且消耗30000灵石</div>
                    </div>
                `;
                html += '</div>';
                return html;
            }
            
            // 双轨状态
            const dualEnabled = sect.dualTrackEnabled || false;
            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;">
                    <div>
                        <div style="color:#ffd700;font-weight:bold;">双轨互联</div>
                        <div style="color:#aaa;font-size:0.85em;">启用后可共享资源与弟子</div>
                    </div>
                    <button onclick="toggleDualTrack()" style="padding:8px 20px;border:none;border-radius:20px;cursor:pointer;font-weight:bold;background:${dualEnabled ? 'linear-gradient(135deg,#4caf50,#81c784)' : 'linear-gradient(135deg,#666,#888)'};color:white;">
                        ${dualEnabled ? '✅ 已启用' : '❌ 停用'}
                    </button>
                </div>
            `;
            
            // 资源同步状态
            const syncResources = sect.syncResources || false;
            const syncInterval = sect.syncInterval || 1;
            html += `
                <div style="margin-bottom:15px;">
                    <div style="color:#9c27b0;font-weight:bold;margin-bottom:10px;">📦 资源同步</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;">
                        <div>
                            <div style="color:#ffd700;">灵石共享</div>
                            <div style="color:#888;font-size:0.85em;">每日自动同步灵石的10%</div>
                        </div>
                        <button onclick="toggleSyncResources()" style="padding:6px 15px;border:none;border-radius:15px;cursor:pointer;background:${syncResources ? '#4caf50' : '#666'};color:white;font-size:0.85em;">
                            ${syncResources ? '✅ 开启' : '❌ 关闭'}
                        </button>
                    </div>
                </div>
            `;
            
            // 弟子派遣
            html += `
                <div style="margin-bottom:15px;">
                    <div style="color:#9c27b0;font-weight:bold;margin-bottom:10px;">👥 弟子派遣</div>
                    <div style="padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;margin-bottom:10px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:#aaa;">宗门弟子:</span>
                            <span style="color:#ffd700;">${sect.disciples.length}人</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span style="color:#aaa;">仙宫弟子:</span>
                            <span style="color:#ffb300;">${palace.disciples.length}人</span>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <button onclick="dispatchDiscipleToPalace()" style="padding:10px;background:linear-gradient(135deg,#ff6f00,#ffb300);border:none;border-radius:8px;cursor:pointer;color:white;font-size:0.9em;">
                            🚀 派遣弟子→仙宫
                        </button>
                        <button onclick="recallDiscipleFromPalace()" style="padding:10px;background:linear-gradient(135deg,#6a1b9a,#9c27b0);border:none;border-radius:8px;cursor:pointer;color:white;font-size:0.9em;">
                            🔙 召回弟子←仙宫
                        </button>
                    </div>
                </div>
            `;
            
            // 双轨加成
            const bonuses = calculateDualTrackBonus();
            if (bonuses.total > 0) {
                html += `
                    <div style="padding:10px;background:rgba(76,175,80,0.2);border-radius:10px;border:1px solid rgba(76,175,80,0.4);">
                        <div style="color:#4caf50;font-weight:bold;margin-bottom:8px;">✨ 双轨加成（已启用）</div>
                        <div style="font-size:0.85em;color:#aaa;">
                            ${bonuses.sectBonus > 0 ? `<div>• 宗门灵石收益: +${(bonuses.sectBonus * 100).toFixed(0)}%</div>` : ''}
                            ${bonuses.palaceBonus > 0 ? `<div>• 仙宫产出: +${(bonuses.palaceBonus * 100).toFixed(0)}%</div>` : ''}
                            ${bonuses.cultivateBonus > 0 ? `<div>• 修炼速度: +${(bonuses.cultivateBonus * 100).toFixed(0)}%</div>` : ''}
                            <div style="margin-top:5px;color:#ffd700;">总加成: +${(bonuses.total * 100).toFixed(0)}%</div>
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
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

