// ===== UI Renderer: inventory.js =====
// Phase 5 extraction - UI layer

        // ===== closeEnhancePanel =====
        function closeEnhancePanel() {
            const panel = document.getElementById('enhancePanel');
            const overlay = document.getElementById('enhanceOverlay');
            if (panel) panel.remove();
            if (overlay) overlay.remove();
            selectedEnhanceItem = null;
            selectedEnhanceSlot = null;
        }

        // ===== closeEquipSlotMenu =====
        function closeEquipSlotMenu() {
            const menu = document.getElementById('equipSlotMenu');
            if (menu) menu.remove();
        }

        // ===== closeEvolutionUI =====
        function closeEvolutionUI() {
            const modal = document.getElementById('evolutionModal');
            if (modal) modal.remove();
        }

        // ===== closeHeavenlyDaoSlotMenu =====
        function closeHeavenlyDaoSlotMenu() {
            const menu = document.getElementById('heavenlyDaoMenu');
            if (menu) menu.remove();
        }

        // ===== closeInventory =====
        function closeInventory() {
            document.getElementById('inventoryModal').classList.remove('active');
        }

        // ===== closeTechniqueUpgradeModal =====
        function closeTechniqueUpgradeModal() {
            const modal = document.getElementById('techniqueUpgradeModal');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        }

        // ===== openEnhanceFromEquip =====
        function openEnhanceFromEquip(slotIndex) {
            const treasure = gameState.equippedTreasures[slotIndex];
            if (!treasure) return;
            selectedEnhanceSlot = slotIndex;
            selectedEnhanceItem = { source: 'equip', idx: slotIndex, item: treasure };
            openEnhancePanel();
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

        // ===== openEvolutionUI =====
        function openEvolutionUI() {
            const existing = document.getElementById('evolutionModal');
            if (existing) existing.remove();
            
            let html = `<div id="evolutionModal" style="position:fixed;z-index:1003;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;">
                <div style="background:linear-gradient(135deg,#1a0a2e,#2d1b4e);border:2px solid #ff6b6b;border-radius:15px;padding:25px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 0 40px rgba(255,107,107,0.4);">
                    <h2 style="color:#ff6b6b;text-align:center;margin-bottom:15px;">⬆️ 天道法则进化</h2>
                    <p style="color:#aaa;text-align:center;margin-bottom:15px;font-size:0.9em;">将9星传奇装备进化为天道法则终极装备</p>
                    <div style="max-height:400px;overflow-y:auto;">`;
            
            let hasAny = false;
            for (const [name, hdEquip] of Object.entries(HEAVENLY_DAO_EQUIPMENTS)) {
                if (!hdEquip.evolutionReq) continue;
                hasAny = true;
                const req = hdEquip.evolutionReq;
                const canEvolve = canEvolveToHeavenlyDao(name);
                const requiredItem = gameState.inventory.find(i => i.name === req.item && i.star >= req.star);
                const hasStones = gameState.spiritStones >= req.stones;
                
                html += `
                    <div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:15px;margin-bottom:10px;border:1px solid rgba(255,107,107,0.2);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="color:#ff6b6b;font-weight:bold;">${hdEquip.icon} ${name}</span>
                            <span style="color:#ffd700;">进化消耗: ${req.stones}灵石</span>
                        </div>
                        <div style="font-size:0.85em;color:#aaa;margin-bottom:5px;">
                            需求: ${req.item} ×1 (${req.star}星以上)
                            ${requiredItem ? `<span style="color:#4caf50;">✓</span>` : `<span style="color:#f44336;">✗</span>`}
                        </div>
                        <div style="font-size:0.85em;color:#aaa;margin-bottom:8px;">
                            基础效果: ${hdEquip.desc}
                        </div>
                        <div style="font-size:0.8em;color:#ff6b6b;padding:5px;background:rgba(255,107,107,0.1);border-radius:5px;margin-bottom:10px;">
                            法则: ${hdEquip.lawEffect.desc}
                        </div>
                        <button onclick="doEvolution('${name}')" ${!canEvolve.can ? 'disabled' : ''} style="width:100%;padding:10px;background:${canEvolve.can ? 'linear-gradient(135deg,#ff6b6b,#ff8a8a)' : '#555'};border:none;border-radius:8px;color:white;cursor:${canEvolve.can ? 'pointer' : 'not-allowed'};font-size:1em;">
                            ${canEvolve.can ? '⬆️ 进化' : canEvolve.reason}
                        </button>
                    </div>
                `;
            }
            
            if (!hasAny) {
                html += '<div style="color:#888;text-align:center;padding:30px;">暂无可进化装备</div>';
            }
            
            html += `</div>
                    <button onclick="closeEvolutionUI()" style="display:block;width:100%;padding:12px;margin-top:15px;background:rgba(100,100,100,0.3);border:1px solid #666;border-radius:8px;color:#aaa;cursor:pointer;">关闭</button>
                </div>
            </div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // ===== openHeavenlyDaoSlotMenu =====
        function openHeavenlyDaoSlotMenu() {
            const heavenlyDao = gameState.equippedTreasures[3];
            // 移除已存在的菜单
            const existing = document.getElementById('heavenlyDaoMenu');
            if (existing) existing.remove();

            if (!heavenlyDao) {
                // 空槽位，显示装备选项
                let optionsHtml = '<div style="color:#ffd700;margin-bottom:8px;text-align:center;">天道法则装备</div>';
                
                // 检查背包中是否有天道法则装备
                const heavenlyItems = gameState.inventory.filter(i => i.quality === 'ultimate' || HEAVENLY_DAO_EQUIPMENTS[i.name]);
                if (heavenlyItems.length > 0) {
                    optionsHtml += '<div style="max-height:200px;overflow-y:auto;">';
                    for (const item of heavenlyItems) {
                        const hdEquip = HEAVENLY_DAO_EQUIPMENTS[item.name];
                        const lawDesc = hdEquip ? hdEquip.lawEffect.desc : (item.lawEffect ? item.lawEffect.desc : '天道法则');
                        optionsHtml += `
                            <div onclick="equipHeavenlyDao('${item.name}')" style="padding:8px;background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);border-radius:6px;margin-bottom:5px;cursor:pointer;">
                                <div style="color:#ff6b6b;font-weight:bold;">${item.icon || '👑'} ${item.name}</div>
                                <div style="color:#aaa;font-size:0.8em;">${lawDesc}</div>
                            </div>
                        `;
                    }
                    optionsHtml += '</div>';
                } else {
                    optionsHtml += '<div style="color:#888;text-align:center;padding:15px;">背包中没有天道法则装备</div>';
                }
                
                optionsHtml += '<button onclick="closeHeavenlyDaoSlotMenu()" style="display:block;width:100%;padding:6px;margin-top:8px;background:rgba(100,100,100,0.2);border:1px solid #666;border-radius:6px;color:#aaa;cursor:pointer;">关闭</button>';
                
                const html = `<div id="heavenlyDaoMenu" style="position:fixed;z-index:1002;background:#1a0a2e;border:1px solid #ff6b6b;border-radius:10px;padding:10px;min-width:200px;max-width:280px;box-shadow:0 0 20px rgba(255,107,107,0.3);">${optionsHtml}</div>`;
                const slot = document.getElementById('equipSlot3');
                const rect = slot.getBoundingClientRect();
                document.body.insertAdjacentHTML('beforeend', html);
                const menu = document.getElementById('heavenlyDaoMenu');
                menu.style.top = (rect.bottom + 5) + 'px';
                menu.style.left = rect.left + 'px';
            } else {
                // 已有装备，显示详情菜单
                const lawDesc = heavenlyDao.lawEffect ? heavenlyDao.lawEffect.desc : '天道法则';
                const html = `<div id="heavenlyDaoMenu" style="position:fixed;z-index:1002;background:#1a0a2e;border:1px solid #ff6b6b;border-radius:10px;padding:10px;min-width:200px;box-shadow:0 0 20px rgba(255,107,107,0.3);">
                    <div style="color:#ff6b6b;font-weight:bold;text-align:center;margin-bottom:8px;">${heavenlyDao.icon || '👑'} ${heavenlyDao.name}</div>
                    <div style="color:#ffd700;font-size:0.9em;text-align:center;margin-bottom:5px;">基础: ${heavenlyDao.desc || ''}</div>
                    <div style="color:#ff6b6b;font-size:0.85em;text-align:center;padding:5px;background:rgba(255,107,107,0.1);border-radius:5px;margin-bottom:8px;">法则: ${lawDesc}</div>
                    <button onclick="unequipHeavenlyDao();closeHeavenlyDaoSlotMenu()" style="display:block;width:100%;padding:6px 12px;background:rgba(100,100,100,0.2);border:1px solid #888;border-radius:6px;color:#ccc;cursor:pointer;margin-bottom:5px;">卸下</button>
                    <button onclick="closeHeavenlyDaoSlotMenu()" style="display:block;width:100%;padding:6px 12px;background:transparent;border:none;color:#888;cursor:pointer;">取消</button>
                </div>`;
                const slot = document.getElementById('equipSlot3');
                const rect = slot.getBoundingClientRect();
                document.body.insertAdjacentHTML('beforeend', html);
                const menu = document.getElementById('heavenlyDaoMenu');
                menu.style.top = (rect.bottom + 5) + 'px';
                menu.style.left = rect.left + 'px';
            }
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

        // ===== openTechniqueUpgrade =====
        function openTechniqueUpgrade(idx) {
            let items = gameState.inventory;
            if (currentInvTab !== 'all') {
                items = items.filter(item => item.type === currentInvTab);
            }
            const item = items[idx];
            if (!item || item.type !== 'technique') return;
            
            const level = item.level || 1;
            const maxLevel = item.maxLevel || 5;
            const grade = item.grade !== undefined ? item.grade : 0;
            
            if (level >= maxLevel) {
                alert('此功法已达到最高等级！');
                return;
            }
            
            const upgradeCost = getTechniqueUpgradeCost(grade, level);
            if (!upgradeCost) {
                alert('此功法无法继续进阶！');
                return;
            }
            
            // 检查玩家材料是否足够
            const materialsNeeded = [];
            for (const [mat, qty] of Object.entries(upgradeCost.materials)) {
                const have = getItemCount(mat);
                materialsNeeded.push({ name: mat, need: qty, have: have });
            }
            
            const canAfford = materialsNeeded.every(m => m.have >= m.need) && gameState.spiritStones >= upgradeCost.stones;
            
            // 显示进阶确认模态框
            const materialList = materialsNeeded.map(m => {
                const enough = m.have >= m.need;
                return `<div style="display:flex;justify-content:space-between;padding:5px 0;">
                    <span>${m.name}</span>
                    <span style="color:${enough ? '#4caf50' : '#f44336'};">${m.have}/${m.need}</span>
                </div>`;
            }).join('');
            
            const gradeName = SECT_CONFIG.techniqueGrades[grade] || '人阶';
            const nextGradeName = SECT_CONFIG.techniqueGrades[grade + 1] || '未知';
            const currentEffectIdx = getTechniqueEffectKey(grade, level);
            const nextEffectIdx = getTechniqueEffectKey(grade, level + 1);
            const currentEffect = TECHNIQUE_UPGRADE_EFFECTS[currentEffectIdx];
            const nextEffect = TECHNIQUE_UPGRADE_EFFECTS[nextEffectIdx];
            
            document.getElementById('techniqueUpgradeModal') && document.getElementById('techniqueUpgradeModal').remove();
            
            const modal = document.createElement('div');
            modal.id = 'techniqueUpgradeModal';
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:450px;">
                    <h2 class="modal-title">📖 功法进阶</h2>
                    <div style="text-align:center;margin-bottom:15px;">
                        <span style="font-size:2em">${item.icon || '📖'}</span>
                        <div style="font-weight:bold;color:#ffd700;margin-top:5px;">${item.name}</div>
                        <div style="color:#aaa;">当前: ${gradeName} Lv.${level} → 进阶后: ${nextGradeName} Lv.${level + 1}</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.4);padding:15px;border-radius:10px;margin-bottom:15px;">
                        <div style="color:#888;margin-bottom:5px;">效果提升</div>
                        <div style="color:#aaa;text-decoration:line-through;">${currentEffect ? currentEffect.desc : item.effect.desc}</div>
                        <div style="color:#4caf50;">→ ${nextEffect ? nextEffect.desc : item.effect.desc}</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.4);padding:15px;border-radius:10px;margin-bottom:15px;">
                        <div style="color:#888;margin-bottom:5px;">进阶消耗</div>
                        ${materialList}
                        <div style="display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid #333;margin-top:5px;">
                            <span>灵石</span>
                            <span style="color:${gameState.spiritStones >= upgradeCost.stones ? '#4caf50' : '#f44336'};">${gameState.spiritStones}/${upgradeCost.stones}</span>
                        </div>
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button class="btn btn-cultivate" onclick="doTechniqueUpgrade(${idx})" ${!canAfford ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} style="flex:1;">进阶</button>
                        <button class="btn btn-save" onclick="closeTechniqueUpgradeModal()" style="flex:1;">取消</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // ===== renderHeavenlyDaoSetStatus =====
        function renderHeavenlyDaoSetStatus() {
            let html = '<div style="margin-top:8px;padding:6px;background:#1a0a2e;border-radius:6px;font-size:11px;border:1px solid rgba(255,107,107,0.3);">';
            html += '<b style="color:#ff6b6b;">天道法则套装</b><br>';
            let hasAny = false;
            for (const setName in HEAVENLY_DAO_SET_BONUSES) {
                const set = HEAVENLY_DAO_SET_BONUSES[setName];
                const equipped = [];
                const treasures = gameState.equippedTreasures;
                for (const t of treasures) {
                    if (t && set.pieces.includes(t.name)) equipped.push(t.name);
                }
                if (equipped.length > 0) {
                    hasAny = true;
                    const count = equipped.length;
                    const color = count >= set.count ? '#ff6b6b' : '#aaaaaa';
                    let status;
                    if (count >= set.count) {
                        if (set.count === 6) {
                            status = '✓ ' + set.sixPiece;
                        } else if (count === set.count) {
                            status = '✓ ' + set.threePiece;
                        } else {
                            status = '✓ ' + set.twoPiece;
                        }
                    } else {
                        status = `(${equipped.length}/${set.count}) ${set.twoPiece}`;
                    }
                    html += `<span style="color:${color};">${setName} ${status}</span><br>`;
                }
            }
            if (!hasAny) html += '<span style="color:#666;">无天道套装激活</span>';
            html += '</div>';
            return html;
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

