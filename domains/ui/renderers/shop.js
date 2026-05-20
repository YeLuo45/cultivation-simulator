// ===== UI Renderer: shop.js =====
// Phase 5 extraction - UI layer

        // ===== closeAlchemy =====
        function closeAlchemy() {
            document.getElementById('alchemyModal').classList.remove('active');
        }

        // ===== closeShop =====
        function closeShop() {
            document.getElementById('shopModal').classList.remove('active');
        }

        // ===== openAlchemy =====
        function openAlchemy() {
            openCrafting('alchemy');
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

        // ===== openForge =====
        function openForge() {
            openCrafting('forge');
        }

        // ===== openMarket =====
        function openMarket() {
            renderMarketItems();
            document.getElementById('alchemyModal').classList.add('active');
            document.querySelector('#alchemyModal .modal-title').textContent = '🏪 交易市场';
        }

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

