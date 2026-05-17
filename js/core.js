// Auto-generated module: core.js
'use strict';

        // ===== showModal =====
        function showModal(html) {
            const modal = document.getElementById('eventModal');
            if (!modal) return;
            document.getElementById('modalTitle').textContent = '⚡ 绝技选择';
            document.getElementById('modalDescription').innerHTML = html;
            document.getElementById('modalOptions').innerHTML = '';
            document.getElementById('modalResult').classList.add('hidden');
            modal.classList.add('active');
        }

        // ===== openModal =====
        function openModal(title, description, options) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDescription').innerHTML = description;
            document.getElementById('modalOptions').innerHTML = options;
            document.getElementById('modalOptions').classList.remove('hidden');
            document.getElementById('modalResult').classList.add('hidden');
            document.getElementById('eventModal').classList.add('active');
        }

        // ===== manualSave =====
        function manualSave() {
            showSaveLoadModal();
        }

        // ===== saveGame =====
        function saveGame() {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(gameState));
        }

        // ===== showSaveLoadModal =====
        function showSaveLoadModal() {
            const saved = localStorage.getItem(CONFIG.storageKey);
            let saveInfo = '未找到存档';
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    saveInfo = `存档时间: ${new Date(data.days ? data.days : Date.now()).toLocaleString('zh-CN')}`;
                } catch(e) {
                    saveInfo = '存档损坏';
                }
            }
            
            let html = '<div style="padding:16px;background:#1a1a2e;border-radius:8px;min-width:280px;">';
            html += '<div style="margin-bottom:16px;text-align:center;">';
            html += '<b style="color:#ffd700;font-size:16px;">📁 存档管理</b>';
            html += `<div style="color:#888;font-size:11px;margin-top:4px;">${saveInfo}</div>`;
            html += '</div>';
            html += '<div style="display:flex;flex-direction:column;gap:10px;">';
            html += `<button onclick="doSaveGame();closeModal();" style="padding:12px;background:#2e7d32;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">💾 保存游戏</button>`;
            html += `<button onclick="doLoadGame();closeModal();" style="padding:12px;background:#1565c0;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">📂 加载存档</button>`;
            html += `<button onclick="showAutoSaveInfo()" style="padding:12px;background:#333;color:#aaa;border:1px solid #555;border-radius:6px;cursor:pointer;font-size:14px;">ℹ️ 自动存档</button>`;
            html += `<button onclick="doResetGame()" style="padding:12px;background:#c62828;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">⚠️ 重置游戏</button>`;
            html += '</div>';
            html += '<button onclick="closeModal()" style="margin-top:16px;width:100%;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>';
            html += '</div>';
            showModal(html);
        }

        // ===== doSaveGame =====
        function doSaveGame() {
            try {
                saveGame();
                addLog('good', '存档成功', '游戏已保存到本地存储');
            } catch (e) {
                addLog('bad', '存档失败', '保存失败: ' + e.message);
            }
        }

        // ===== doLoadGame =====
        function doLoadGame() {
            try {
                const saved = localStorage.getItem(CONFIG.storageKey);
                if (!saved) {
                    addLog('bad', '加载失败', '没有找到存档');
                    return;
                }
                const data = JSON.parse(saved);
                // 确保新增字段存在（向后兼容）
                if (!data.combatLogHistory) data.combatLogHistory = [];
                if (!data.eventLogHistory) data.eventLogHistory = [];
                gameState = data;
                addLog('good', '加载成功', `存档已加载 (第${gameState.days}天)`);
                // 重新渲染UI
                if (typeof renderGameUI === 'function') renderGameUI();
                if (typeof refreshInventoryUI === 'function') refreshInventoryUI();
                if (typeof updateDisplay === 'function') updateDisplay();
                showGameUI();
            } catch (e) {
                addLog('bad', '加载失败', '加载失败: ' + e.message);
            }
        }

        // ===== doResetGame =====
        function doResetGame() {
            if (!confirm('确定要重置游戏吗？所有进度将丢失！')) return;
            try {
                localStorage.removeItem(CONFIG.storageKey);
                location.reload();
            } catch (e) {
                addLog('bad', '重置失败', '重置失败');
            }
        }

        // ===== showAutoSaveInfo =====
        function showAutoSaveInfo() {
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;">';
            html += '<b style="color:#ffd700;">ℹ️ 自动存档说明</b><br><br>';
            html += '<div style="color:#ccc;font-size:13px;line-height:1.6;">';
            html += '• 游戏会自动在重要操作后保存到本地<br>';
            html += '• 点击「保存游戏」可手动保存当前进度<br>';
            html += '• 存档保存在浏览器本地存储中<br>';
            html += '• 清除浏览器数据会导致存档丢失<br>';
            html += '• 建议定期手动保存重要进度</div>';
            html += '<button onclick="showSaveLoadModal()" style="margin-top:12px;width:100%;padding:8px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">知道了</button>';
            html += '</div>';
            showModal(html);
        }

        // ===== recalculateAllEffects =====
        function recalculateAllEffects() {
            // 保存需要保留的非装备效果（来自奇遇等系统）
            const savedSerendipityBoost = gameState.activeEffects.serendipity_boost || 0;
            const savedBreakthroughBoost = gameState.activeEffects.breakthrough_boost || 0;
            const savedCultivateSpeed = gameState.activeEffects.cultivate_speed || 0;
            const saved渡劫MindsetProtect = gameState.activeEffects['渡劫_mindset_protect'] || 0;
            const saved渡劫DamageReduce = gameState.activeEffects['渡劫_damage_reduce'] || 0;
            const savedAllStats = gameState.activeEffects.all_stats || 0;
            const savedAttack = gameState.activeEffects.attack || 0;
            const savedDefense = gameState.activeEffects.defense || 0;
            const savedCultivateQiRate = gameState.activeEffects.cultivate_qi_rate || 0;
            const savedEscape = gameState.activeEffects.escape || 0;
            const savedForeseeEvent = gameState.activeEffects.foresee_event || 0;

            // 重置所有效果
            for (let key in gameState.activeEffects) {
                gameState.activeEffects[key] = 0;
            }

            // 累加装备效果
            for (const treasure of gameState.equippedTreasures) {
                if (treasure) {
                    const effectType = treasure.effect.type;
                    if (gameState.activeEffects.hasOwnProperty(effectType)) {
                        gameState.activeEffects[effectType] += treasure.effect.value;
                    }
                }
            }

            // 恢复非装备效果（这些效果由奇遇系统或丹药管理，不应被清除）
            if (savedSerendipityBoost > 0) gameState.activeEffects.serendipity_boost = savedSerendipityBoost;
            if (savedBreakthroughBoost > 0) gameState.activeEffects.breakthrough_boost = savedBreakthroughBoost;
            if (savedCultivateSpeed > 0) gameState.activeEffects.cultivate_speed = savedCultivateSpeed;
            if (saved渡劫MindsetProtect > 0) gameState.activeEffects['渡劫_mindset_protect'] = saved渡劫MindsetProtect;
            if (saved渡劫DamageReduce > 0) gameState.activeEffects['渡劫_damage_reduce'] = saved渡劫DamageReduce;
            if (savedAllStats > 0) gameState.activeEffects.all_stats = savedAllStats;
            if (savedAttack > 0) gameState.activeEffects.attack = savedAttack;
            if (savedDefense > 0) gameState.activeEffects.defense = savedDefense;
            if (savedCultivateQiRate > 0) gameState.activeEffects.cultivate_qi_rate = savedCultivateQiRate;
            if (savedEscape > 0) gameState.activeEffects.escape = savedEscape;
            if (savedForeseeEvent > 0) gameState.activeEffects.foresee_event = savedForeseeEvent;
        }

        // ===== updateEquipmentBar =====
        function updateEquipmentBar() {
            const icons = ['⚔️', '🛡️', '💍'];
            for (let i = 0; i < 3; i++) {
                const slot = document.getElementById(`equipSlot${i}`);
                const treasure = gameState.equippedTreasures[i];
                if (treasure) {
                    slot.classList.add('filled');
                    slot.querySelector('.slot-icon').textContent = treasure.icon || icons[i];
                    const star = treasure.star || 1;
                    const starDisplay = getStarDisplay(star);
                    slot.querySelector('.slot-tooltip').textContent = `${treasure.name}${starDisplay}\n${treasure.desc}`;
                } else {
                    slot.classList.remove('filled');
                    slot.querySelector('.slot-icon').textContent = icons[i];
                    slot.querySelector('.slot-tooltip').textContent = '空';
                }
            }
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

        // ===== closeEquipSlotMenu =====
        function closeEquipSlotMenu() {
            const menu = document.getElementById('equipSlotMenu');
            if (menu) menu.remove();
        }

        // ===== unequipTreasure =====
        function unequipTreasure(slotIndex) {
            const treasure = gameState.equippedTreasures[slotIndex];
            if (treasure) {
                // 移回背包（保留星级）
                const invItem = {
                    type: treasure.type,
                    name: treasure.name,
                    quantity: 1,
                    quality: treasure.quality,
                    effect: treasure.effect,
                    desc: treasure.desc,
                    icon: treasure.icon,
                    star: treasure.star || 1
                };
                addToInventoryObj(invItem);
                gameState.equippedTreasures[slotIndex] = null;
                recalculateAllEffects();
                updateEquipmentBar();
                saveGame();
                addLog('neutral', '卸下灵宝', `卸下了${treasure.name}`);
                if (document.getElementById('setStatusContainer')) {
                    document.getElementById('setStatusContainer').innerHTML = renderSetStatus();
                }
            }
        }

        // ===== addToInventory =====
        function addToInventory(type, name, quantity, quality, effect, desc, icon, star) {
            // 查找是否已存在同类型物品
            const existing = gameState.inventory.find(item => item.name === name && item.type === type);
            if (existing) {
                existing.quantity += quantity;
            } else {
                if (gameState.inventory.length >= gameState.maxInventorySlots) {
                    return false; // 背包满了
                }
                gameState.inventory.push({
                    id: Date.now(),
                    type,
                    name,
                    quantity,
                    quality,
                    effect,
                    desc,
                    icon,
                    star: star || 1
                });
            }
            return true;
        }

        // ===== addToInventoryObj =====
        function addToInventoryObj(itemObj) {
            const existing = gameState.inventory.find(i => i.name === itemObj.name && i.type === itemObj.type);
            if (existing) {
                existing.quantity += itemObj.quantity;
            } else {
                if (gameState.inventory.length >= gameState.maxInventorySlots) {
                    return false;
                }
                gameState.inventory.push({
                    id: Date.now(),
                    type: itemObj.type,
                    name: itemObj.name,
                    quantity: itemObj.quantity,
                    quality: itemObj.quality,
                    effect: itemObj.effect,
                    desc: itemObj.desc,
                    icon: itemObj.icon,
                    star: itemObj.star || 1
                });
            }
            return true;
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

        // ===== closeInventory =====
        function closeInventory() {
            document.getElementById('inventoryModal').classList.remove('active');
        }

        // ===== switchInvTab =====
        function switchInvTab(tab) {
            currentInvTab = tab;
            selectedInvItem = null;
            document.querySelectorAll('.inventory-tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
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

        // ===== selectInvItem =====
        function selectInvItem(idx) {
            let items = gameState.inventory;
            if (currentInvTab !== 'all') {
                items = items.filter(item => item.type === currentInvTab);
            }
            selectedInvItem = idx;
            const item = items[idx];
            renderInventoryGrid();
            
            document.getElementById('invDetail').style.display = 'block';
            document.getElementById('invDetailContent').innerHTML = `
                <div style="display:flex;align-items:center;gap:15px;margin-bottom:10px;">
                    <span style="font-size:2em">${item.icon || '📦'}</span>
                    <div>
                        <div style="font-weight:bold;font-size:1.2em;color:${getQualityColor(item.quality)}">${item.name}</div>
                        <div style="color:#888">${item.desc}</div>
                    </div>
                </div>
                <div style="color:#aaa">数量: ${item.quantity}</div>
            `;
            
            let actions = '';
            if (item.type === 'pill') {
                actions = `<button class="btn btn-cultivate" onclick="usePill('${item.name}', ${idx})">使用</button>`;
            } else if (item.type === 'treasure') {
                const star = item.star || 1;
                const starDisplay = getStarDisplay(star);
                const starColor = getStarColor(star);
                actions = `<button class="btn btn-breakthrough" onclick="equipTreasure('${item.name}', ${idx})">装备</button>`;
                actions += `<button class="btn btn-enhance" onclick="openEnhanceFromInventory(${idx})" style="background:rgba(255,215,0,0.15);border:1px solid #ffd700;color:#ffd700;padding:5px 12px;border-radius:5px;cursor:pointer;margin-left:5px;">强化</button>`;
            }
            actions += `<button class="btn btn-save" onclick="sellItem(${idx})">出售(${Math.floor(item.quality === 'common' ? 10 : item.quality === 'rare' ? 50 : item.quality === 'precious' ? 200 : 1000)}灵石)</button>`;
            actions += `<button class="btn btn-new" onclick="discardItem(${idx})">丢弃</button>`;
            document.getElementById('invActions').innerHTML = actions;
        }

        // ===== usePill =====
        function usePill(name, idx) {
            const pill = PILLS[name];
            if (!pill) return;
            
            const item = gameState.inventory.find((i, iidx) => {
                let items = gameState.inventory;
                if (currentInvTab !== 'all') items = items.filter(it => it.type === currentInvTab);
                return iidx === idx;
            });
            if (!item || item.quantity <= 0) return;
            
            item.quantity--;
            if (item.quantity <= 0) {
                gameState.inventory = gameState.inventory.filter(i => i.name !== name || i.type !== 'pill');
            }
            
            // 应用丹药效果
            switch (pill.effect.type) {
                case 'qi':
                    gameState.qi = Math.min(gameState.maxQi, gameState.qi + pill.effect.value);
                    addLog('good', '使用丹药', `服下${name}，灵气+${pill.effect.value}`);
                    break;
                case 'mindset':
                    gameState.mindset = Math.min(100, gameState.mindset + pill.effect.value);
                    addLog('good', '使用丹药', `服下${name}，心境+${pill.effect.value}`);
                    break;
                case 'breakthrough_boost':
                case 'cultivate_speed':
                case '渡劫_mindset_protect':
                    gameState.activeEffects[pill.effect.type] += pill.effect.value;
                    addLog('good', '使用丹药', `服下${name}，${pill.desc}（永久生效）`);
                    break;
            }
            
            saveGame();
            updateDisplay();
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
        }

        // ===== equipTreasure =====
        function equipTreasure(name, idx) {
            const treasure = TREASURES[name];
            if (!treasure) return;

            // 找到空槽位
            const emptySlot = gameState.equippedTreasures.findIndex(t => t === null);
            if (emptySlot === -1) {
                alert('装备栏已满！');
                return;
            }

            // 查找背包中的物品
            const itemIdx = gameState.inventory.findIndex(i => i.name === name && i.type === 'treasure');
            if (itemIdx === -1) return;

            const item = gameState.inventory[itemIdx];
            const star = item.star || 1; // 保留星级
            item.quantity--;
            if (item.quantity <= 0) {
                gameState.inventory.splice(itemIdx, 1);
            }

            // 装备（携带星级）
            gameState.equippedTreasures[emptySlot] = {
                name: item.name,
                type: item.type,
                quality: item.quality,
                effect: item.effect,
                desc: item.desc,
                icon: item.icon,
                star
            };
            
            recalculateAllEffects();
            updateEquipmentBar();
            saveGame();
            addLog('good', '装备灵宝', `装备了${name}`);
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
            document.getElementById('setStatusContainer').innerHTML = renderSetStatus();
        }

        // ===== sellItem =====
        function sellItem(idx) {
            let items = gameState.inventory;
            if (currentInvTab !== 'all') {
                items = items.filter(item => item.type === currentInvTab);
            }
            const item = items[idx];
            if (!item) return;
            
            // 经济调整：出售价格改为材料原价的30%（原为品质固定值）
            // 这样更符合经济逻辑：稀有材料出售价格更高
            let price = 10; // 默认普通物品
            if (item.type === 'material' && MATERIALS[item.name]) {
                // 材料出售价格 = basePrice × 0.3（约为原价的三折）
                price = Math.floor(MATERIALS[item.name].basePrice * 0.3);
            } else {
                // 非材料物品仍按品质定价（但略微降低）
                const prices = { common: 8, rare: 40, precious: 150, legendary: 800 };
                price = prices[item.quality] || 10;
            }
            
            item.quantity--;
            if (item.quantity <= 0) {
                gameState.inventory = gameState.inventory.filter(i => i !== item);
            }
            
            gameState.spiritStones += price;
            saveGame();
            updateDisplay();
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
            addLog('neutral', '出售物品', `出售了${item.name}，获得${price}灵石`);
        }

        // ===== discardItem =====
        function discardItem(idx) {
            let items = gameState.inventory;
            if (currentInvTab !== 'all') {
                items = items.filter(item => item.type === currentInvTab);
            }
            const item = items[idx];
            if (!item) return;
            
            item.quantity--;
            if (item.quantity <= 0) {
                gameState.inventory = gameState.inventory.filter(i => i !== item);
            }
            
            saveGame();
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
            addLog('neutral', '丢弃物品', `丢弃了${item.name}`);
        }

