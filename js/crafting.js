// Auto-generated module: crafting.js
'use strict';

        // ===== openShop =====
        function openShop() {
            if (gameState.shopItems.length === 0) {
                generateShopItems();
            }
            renderShopItems();
            document.getElementById('shopModal').classList.add('active');
            if (miniMaxConfig.apiKey) {
                generateShopIntro();
            }
        }

        // ===== closeShop =====
        function closeShop() {
            document.getElementById('shopModal').classList.remove('active');
        }

        // ===== generateShopItems =====
        function generateShopItems() {
            const allItems = [];
            // 收集所有丹药和灵宝
            for (const [name, pill] of Object.entries(PILLS)) {
                allItems.push({ type: 'pill', name, ...pill });
            }
            for (const [name, treasure] of Object.entries(TREASURES)) {
                allItems.push({ type: 'treasure', name, ...treasure });
            }
            // V4战斗道具
            for (const [name, treasure] of Object.entries(COMBAT_TREASURES)) {
                allItems.push({ type: 'treasure', name, ...treasure });
            }
            // 挑战状
            allItems.push({ type: 'special', name: '挑战状', quality: 'common', price: 500, desc: '用于发起斗法挑战', icon: '📜' });
            // 战斗丹药
            for (const [name, pill] of Object.entries(COMBAT_PILLS)) {
                allItems.push({ type: 'pill', name, ...pill, price: pill.price || 1000 });
            }

            // 随机选8-12个
            const count = 8 + Math.floor(Math.random() * 5);
            const shuffled = allItems.sort(() => Math.random() - 0.5);
            gameState.shopItems = shuffled.slice(0, Math.min(count, allItems.length));
            gameState.lastShopDay = gameState.days;
            saveGame();
        }

        // ===== renderShopItems =====
        function renderShopItems() {
            const grid = document.getElementById('shopGrid');
            grid.innerHTML = gameState.shopItems.map((item, idx) => `
                <div class="shop-item">
                    <div class="shop-item-info">
                        <div class="shop-item-name" style="color:${getQualityColor(item.quality)}">${item.icon || '📦'} ${item.name}</div>
                        <div class="shop-item-desc">${item.desc}</div>
                    </div>
                    <div class="shop-item-price">💎 ${item.price}</div>
                    <button class="btn-buy" onclick="buyItem(${idx})" ${gameState.spiritStones < item.price ? 'disabled' : ''}>购买</button>
                </div>
            `).join('');
        }

        // ===== buyItem =====
        function buyItem(idx) {
            const item = gameState.shopItems[idx];
            if (!item || gameState.spiritStones < item.price) {
                alert('灵石不足！');
                return;
            }
            
            if (gameState.inventory.length >= gameState.maxInventorySlots) {
                alert('背包已满！');
                return;
            }
            
            gameState.spiritStones -= item.price;
            addToInventory(item.type, item.name, 1, item.quality, item.effect, item.desc, item.icon);
            saveGame();
            updateDisplay();
            renderShopItems();
            addLog('good', '购买物品', `购买了${item.name}`);
        }

        // ===== refreshShop =====
        function refreshShop(isAuto = false) {
            // 经济调整：商店刷新费用递增，防止玩家无限制刷新刷出稀有物品
            if (!isAuto) {
                const refreshCost = Math.floor(100 * (1 + (gameState.shopRefreshCount || 0) * 0.5));
                if (gameState.spiritStones < refreshCost) {
                    alert(`灵石不足！刷新商店需要 ${refreshCost} 灵石`);
                    return;
                }
                gameState.spiritStones -= refreshCost;
                gameState.shopRefreshCount++;
                
                gameState.days++;
                saveGame();
                updateDisplay();
            }
            generateShopItems();
            renderShopItems();
            if (!isAuto) {
                addLog('neutral', '刷新商店', `商店已刷新，花费${refreshCost}灵石`);
            }
        }

        // ===== openCrafting =====
        function openCrafting(type) {
            selectedCraftType = type;
            selectedRecipeName = null;
            document.getElementById('alchemyDetail').style.display = 'none';
            document.getElementById('alchemyResult').style.display = 'none';
            renderCraftingRecipes();
            document.getElementById('alchemyModal').classList.add('active');
        }

        // ===== openAlchemy =====
        function openAlchemy() {
            openCrafting('alchemy');
        }

        // ===== openForge =====
        function openForge() {
            openCrafting('forge');
        }

        // ===== closeAlchemy =====
        function closeAlchemy() {
            document.getElementById('alchemyModal').classList.remove('active');
        }

        // ===== renderCraftingRecipes =====
        function renderCraftingRecipes() {
            const container = document.getElementById('alchemyRecipes');
            const modalTitle = document.querySelector('#alchemyModal .modal-title');
            const recipes = selectedCraftType === 'alchemy' ? ALCHEMY_RECIPES : FORGE_RECIPES;
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            const currentLevel = gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level;

            modalTitle.textContent = selectedCraftType === 'alchemy' ? '⚗️ 炼丹系统' : '🔨 炼器系统';

            // 渲染炉子选择和升级
            let furnaceHtml = '<div style="margin-bottom:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;">';
            furnaceHtml += '<div style="color:#aaa;margin-bottom:8px;">当前炉/台:</div>';
            furnaceHtml += '<div style="display:flex;gap:10px;flex-wrap:wrap;">';

            for (const [name, data] of Object.entries(furnace)) {
                const isOwned = data.level <= currentLevel;
                const isEquipped = data.level === currentLevel;
                const canBuy = data.cost > 0 && !isOwned;
                const canAfford = gameState.spiritStones >= data.cost;

                if (isEquipped) {
                    furnaceHtml += `<span style="padding:5px 12px;background:rgba(255,215,0,0.2);border:1px solid #ffd700;border-radius:5px;color:#ffd700;">${name} ${data.level === 1 ? '(免费)' : data.level === 2 ? '+15%' : '+30%'}</span>`;
                } else if (isOwned) {
                    furnaceHtml += `<button onclick="selectFurnace('${name}')" style="padding:5px 12px;background:rgba(0,0,0,0.4);border:1px solid #aaa;border-radius:5px;color:#aaa;cursor:pointer;">${name}</button>`;
                } else if (canBuy) {
                    furnaceHtml += `<button onclick="upgradeFurnace('${name}')" ${!canAfford ? 'disabled title="灵石不足"' : ''} style="padding:5px 12px;background:rgba(76,175,80,0.2);border:1px solid #4caf50;border-radius:5px;color:#4caf50;cursor:${canAfford ? 'pointer' : 'not-allowed'};">升级 ${name}(${data.cost}灵石)</button>`;
                }
            }
            furnaceHtml += '</div></div>';

            // 渲染配方列表
            let recipesHtml = '<div style="max-height:250px;overflow-y:auto;">';
            for (const [name, recipe] of Object.entries(recipes)) {
                const materialsStr = Object.entries(recipe.materials)
                    .map(([m, q]) => `${m}×${q}`)
                    .join(' + ');
                const canCraft = checkMaterialsForRecipe(recipe);
                const isSelected = selectedRecipeName === name;

                recipesHtml += `
                    <div class="alchemy-recipe ${isSelected ? 'selected' : ''}" onclick="selectCraftRecipe('${name}')">
                        <div class="recipe-info">
                            <div class="recipe-name" style="color:${getQualityColor(getRecipeQuality(name))}">${recipe.icon || '📦'} ${name}</div>
                            <div class="recipe-materials">材料: ${materialsStr}</div>
                            <div class="recipe-success">成功率: ${Math.round(recipe.successRate * 100)}% + 炉加成</div>
                        </div>
                        <button class="btn-craft">炼制</button>
                    </div>
                `;
            }
            recipesHtml += '</div>';

            container.innerHTML = furnaceHtml + recipesHtml;
        }

        // ===== getRecipeQuality =====
        function getRecipeQuality(name) {
            const recipe = ALCHEMY_RECIPES[name] || FORGE_RECIPES[name];
            if (!recipe) return 'common';
            const rate = recipe.successRate;
            if (rate >= 0.7) return 'common';
            if (rate >= 0.5) return 'rare';
            if (rate >= 0.35) return 'precious';
            return 'legendary';
        }

        // ===== selectFurnace =====
        function selectFurnace(name) {
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            if (furnace[name]) {
                gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level = furnace[name].level;
                saveGame();
                renderCraftingRecipes();
            }
        }

        // ===== upgradeFurnace =====
        function upgradeFurnace(name) {
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            const data = furnace[name];
            if (data && gameState.spiritStones >= data.cost) {
                gameState.spiritStones -= data.cost;
                gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level = data.level;
                addLog('good', '升级成功', `升级${selectedCraftType === 'alchemy' ? '炼丹炉' : '炼器台'}到${name}`);
                saveGame();
                updateDisplay();
                renderCraftingRecipes();
            }
        }

        // ===== selectCraftRecipe =====
        function selectCraftRecipe(name) {
            selectedRecipeName = name;
            renderCraftingRecipes();

            const recipes = selectedCraftType === 'alchemy' ? ALCHEMY_RECIPES : FORGE_RECIPES;
            const recipe = recipes[name];
            if (!recipe) return;

            const materialsStr = Object.entries(recipe.materials)
                .map(([m, q]) => `${m}×${q}`)
                .join(' + ');

            // 计算实际成功率
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            const currentLevel = gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level;
            const furnaceData = Object.values(furnace).find(f => f.level === currentLevel);
            const furnaceBonus = furnaceData ? furnaceData.successBonus : 0;
            const totalSuccessRate = Math.min(0.95, recipe.successRate + furnaceBonus);

            // 检查材料
            const canCraft = checkMaterialsForRecipe(recipe);

            // 检查燃料费
            const hasFuel = gameState.spiritStones >= recipe.fuelCost;

            document.getElementById('alchemyDetail').style.display = 'block';
            document.getElementById('alchemyDetailContent').innerHTML = `
                <div style="display:flex;align-items:center;gap:15px;margin-bottom:10px;">
                    <span style="font-size:2em">${recipe.icon || '📦'}</span>
                    <div>
                        <div style="font-weight:bold;font-size:1.2em;color:${getQualityColor(getRecipeQuality(name))}">${name}</div>
                        <div style="color:#aaa">${recipe.desc}</div>
                    </div>
                </div>
                <div style="margin:10px 0;">材料: ${materialsStr}</div>
                <div style="color:#aaa;">燃料费: ${recipe.fuelCost}灵石</div>
                <div style="color:#4caf50;">基础成功率: ${Math.round(recipe.successRate * 100)}%</div>
                <div style="color:#ffd700;">炉/台加成: +${Math.round(furnaceBonus * 100)}%</div>
                <div style="color:#00ff88;">总计成功率: ${Math.round(totalSuccessRate * 100)}%</div>
                <div style="margin-top:15px;">
                    <button class="btn-craft" onclick="doCraft('${name}')" ${!canCraft || !hasFuel ? 'disabled' : ''}>
                        ${!canCraft ? '材料不足' : !hasFuel ? '灵石不足(燃料)' : '开始炼制(消耗1天)'}
                    </button>
                </div>
            `;
        }

        // ===== checkMaterialsForRecipe =====
        function checkMaterialsForRecipe(recipe) {
            for (const [mat, qty] of Object.entries(recipe.materials)) {
                if (mat === '灵石') {
                    if (gameState.spiritStones < qty) return false;
                } else {
                    const hasItem = gameState.inventory.some(item =>
                        item.name === mat && item.quantity >= qty
                    );
                    if (!hasItem) return false;
                }
            }
            return true;
        }

        // ===== getPillEffect =====
        function getPillEffect(name) {
            const effects = {
                '回气丹': { type: 'qi', value: 0.2 },
                '疗伤丹': { type: 'health', value: 0.3 },
                '聚灵丹': { type: 'cultivate_speed', value: 0.2 },
                '破境丹': { type: 'breakthrough_boost', value: 0.15 },
                '渡劫丹': { type: '渡劫_success', value: 0.1 },
                '洗髓丹': { type: 'spiritRoot_refresh', value: 1 },
                '混沌丹': { type: '混沌灵根', value: 1 }
            };
            return effects[name] || {};
        }

        // ===== returnCraftMaterials =====
        function returnCraftMaterials(materials, rate) {
            for (const [mat, qty] of Object.entries(materials)) {
                if (mat === '灵石') {
                    gameState.spiritStones += Math.floor(qty * rate);
                } else {
                    const item = gameState.inventory.find(i => i.name === mat);
                    if (item) {
                        item.quantity += Math.floor(qty * rate);
                    } else if (Math.floor(qty * rate) > 0) {
                        const matData = MATERIALS[mat] || { icon: '📦', type: 'material' };
                        gameState.inventory.push({
                            id: Date.now() + Math.random(),
                            type: 'material',
                            name: mat,
                            quantity: Math.floor(qty * rate),
                            quality: 'common',
                            effect: {},
                            desc: `回收的${mat}`,
                            icon: matData.icon
                        });
                    }
                }
            }
        }

        // ===== openMarket =====
        function openMarket() {
            renderMarketItems();
            document.getElementById('alchemyModal').classList.add('active');
            document.querySelector('#alchemyModal .modal-title').textContent = '🏪 交易市场';
        }

        // ===== renderMarketItems =====
        function renderMarketItems() {
            const container = document.getElementById('alchemyRecipes');
            const logs = gameState.crafting.transactionLog || [];

            let html = '<div style="margin-bottom:15px;">';
            html += '<div style="color:#aaa;margin-bottom:10px;">上架你的物品出售(定价5%手续费)</div>';

            // 玩家可上架的物品
            const sellableItems = gameState.inventory.filter(item =>
                item.type === 'pill' || item.type === 'treasure'
            );

            if (sellableItems.length > 0) {
                html += '<div style="max-height:150px;overflow-y:auto;">';
                for (const item of sellableItems) {
                    const price = item.price || MATERIALS[item.name]?.basePrice || 100;
                    html += `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:rgba(0,0,0,0.3);border-radius:5px;margin-bottom:5px;">
                            <span>${item.icon} ${item.name} ×${item.quantity}</span>
                            <button onclick="listItem('${item.name}', ${price})" style="padding:3px 10px;background:#4caf50;border:none;border-radius:5px;color:white;cursor:pointer;">上架</button>
                        </div>
                    `;
                }
                html += '</div>';
            } else {
                html += '<div style="color:#888;text-align:center;padding:20px;">背包中没有可出售的物品</div>';
            }
            html += '</div>';

            // 交易记录
            html += '<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;">';
            html += '<div style="color:#ffd700;margin-bottom:10px;">最近交易记录</div>';
            if (logs.length > 0) {
                html += '<div style="max-height:150px;overflow-y:auto;">';
                for (const log of logs.slice(-10).reverse()) {
                    html += `
                        <div style="padding:5px;background:rgba(0,0,0,0.2);border-radius:3px;margin-bottom:3px;font-size:0.9em;">
                            <span style="color:${log.type === 'sell' ? '#4caf50' : '#ff9800'}">[${log.type === 'sell' ? '售出' : '购买'}]</span>
                            ${log.itemName} ×${log.quantity} @ ${log.price}灵石
                        </div>
                    `;
                }
                html += '</div>';
            } else {
                html += '<div style="color:#888;text-align:center;padding:10px;">暂无交易记录</div>';
            }
            html += '</div>';

            container.innerHTML = html;
        }

        // ===== listItem =====
        function listItem(name, basePrice) {
            const price = prompt(`请输入${name}的售价:`, basePrice);
            if (!price) return;
            const finalPrice = parseInt(price);
            if (isNaN(finalPrice) || finalPrice <= 0) {
                alert('请输入有效的价格');
                return;
            }

            // 扣除上架费(5%)
            const fee = Math.floor(finalPrice * 0.05);
            if (gameState.spiritStones < fee) {
                alert(`上架费${fee}灵石，你的灵石不足`);
                return;
            }

            gameState.spiritStones -= fee;

            // 消耗物品
            const item = gameState.inventory.find(i => i.name === name);
            if (item) {
                item.quantity -= 1;
                if (item.quantity <= 0) {
                    gameState.inventory = gameState.inventory.filter(i => i !== item);
                }
            }

            // 记录上架
            if (!gameState.crafting.listedItems) {
                gameState.crafting.listedItems = [];
            }
            gameState.crafting.listedItems.push({
                name,
                price: finalPrice,
                seller: '玩家',
                day: gameState.days
            });

            addLog('neutral', '物品上架', `${name}已上架，售价${finalPrice}灵石(手续费${fee})`);
            saveGame();
            updateDisplay();
            renderMarketItems();
        }

        // ===== buyFromMarket =====
        function buyFromMarket(listingIndex) {
            const listing = gameState.crafting.listedItems[listingIndex];
            if (!listing) return;

            if (gameState.spiritStones < listing.price) {
                alert('灵石不足');
                return;
            }

            gameState.spiritStones -= listing.price;
            addToInventory('pill', listing.name, 1, 'common', {}, '购买的物品', '📦');

            // 记录交易
            gameState.crafting.transactionLog.push({
                type: 'buy',
                itemName: listing.name,
                quantity: 1,
                price: listing.price,
                day: gameState.days
            });

            // 从上架列表移除
            gameState.crafting.listedItems.splice(listingIndex, 1);

            addLog('good', '购买成功', `购买了${listing.name}`);
            saveGame();
            updateDisplay();
            renderMarketItems();
        }

        // ===== selectRecipe =====
        function selectRecipe(name) {
            selectCraftRecipe(name);
        }

        // ===== craftPill =====
        function craftPill(name) {
            doCraft(name);
        }

        // ===== checkMaterials =====
        function checkMaterials(materials) {
            for (const [mat, qty] of Object.entries(materials)) {
                if (mat === '灵石') {
                    if (gameState.spiritStones < qty) return false;
                } else {
                    if (!gameState.inventory.some(item => item.name === mat && item.quantity >= qty)) return false;
                }
            }
            return true;
        }

        // ===== consumeMaterials =====
        function consumeMaterials(materials) {
            for (const [mat, qty] of Object.entries(materials)) {
                if (mat === '灵石') {
                    gameState.spiritStones -= qty;
                } else {
                    const item = gameState.inventory.find(i => i.name === mat);
                    if (item) {
                        item.quantity -= qty;
                        if (item.quantity <= 0) {
                            gameState.inventory = gameState.inventory.filter(i => i !== item);
                        }
                    }
                }
            }
        }

        // ===== returnMaterials =====
        function returnMaterials(materials, rate) {
            returnCraftMaterials(materials, rate);
        }

