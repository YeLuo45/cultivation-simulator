// ===== UI Renderer: celestial.js =====
// Phase 5 extraction - UI layer

        // ===== closeCelestialEconomy =====
        function closeCelestialEconomy() {
            document.getElementById('celestialEconomyModal').classList.remove('active');
        }

        // ===== openCelestialEconomy =====
        function openCelestialEconomy() {
            renderCelestialEconomy();
            document.getElementById('celestialEconomyModal').classList.add('active');
        }

        // ===== renderCelestialEconomy =====
        function renderCelestialEconomy() {
            const content = document.getElementById('celestialEconomyContent');
            const ce = gameState.celestialEconomy;
            const rate = getCurrentExchangeRate();
            const repName = getCelestialReputationName();
            const repBonus = getCelestialReputationBonus();

            let html = `
                <div class="celestial-balance">
                    <div class="balance-item">
                        <div class="balance-label">灵石</div>
                        <div class="balance-value stones">💎 ${gameState.spiritStones.toLocaleString()}</div>
                    </div>
                    <div class="balance-item">
                        <div class="balance-label">仙石</div>
                        <div class="balance-value immortal">💜 ${ce.immortalStones.toLocaleString()}</div>
                    </div>
                    <div class="balance-item">
                        <div class="balance-label">声望</div>
                        <div class="balance-value" style="color:#ffd700;">⭐ ${repName}</div>
                    </div>
                </div>

                <div class="celestial-economy-section">
                    <div class="celestial-economy-title">💱 货币兑换</div>
                    <div class="exchange-rate-display">
                        当前汇率：<span style="color:#e1bee7;">1 仙石 = ${rate} 灵石</span><br>
                        <span style="font-size:0.85em;color:#888;">
                            累计兑换：${ce.totalExchanged.toLocaleString()} 灵石 | 
                            声望加成：-${Math.round(repBonus * 100)}%
                        </span>
                    </div>
                    <div style="text-align:center;">
                        <div style="margin-bottom:10px;color:#aaa;">灵石 → 仙石</div>
                        <button class="exchange-btn" onclick="exchangeToImmortalStones(1)" ${gameState.spiritStones < rate ? 'disabled' : ''}>1 仙石</button>
                        <button class="exchange-btn" onclick="exchangeToImmortalStones(10)" ${gameState.spiritStones < rate * 10 ? 'disabled' : ''}>10 仙石</button>
                        <button class="exchange-btn" onclick="exchangeToImmortalStones(50)" ${gameState.spiritStones < rate * 50 ? 'disabled' : ''}>50 仙石</button>
                        <button class="exchange-btn" onclick="exchangeToImmortalStones(100)" ${gameState.spiritStones < rate * 100 ? 'disabled' : ''}>100 仙石</button>
                        <div style="margin:10px 0 10px;color:#aaa;">仙石 → 灵石 (损耗20%)</div>
                        <button class="exchange-btn" onclick="exchangeToSpiritStones(1)" ${ce.immortalStones < 1 ? 'disabled' : ''}>1 仙石</button>
                        <button class="exchange-btn" onclick="exchangeToSpiritStones(10)" ${ce.immortalStones < 10 ? 'disabled' : ''}>10 仙石</button>
                        <button class="exchange-btn" onclick="exchangeToSpiritStones(50)" ${ce.immortalStones < 50 ? 'disabled' : ''}>50 仙石</button>
                    </div>
                </div>

                <div class="celestial-tabs">
                    <div class="celestial-tab active" onclick="switchCelestialTab('market')">🏪 仙市</div>
                    <div class="celestial-tab" onclick="switchCelestialTab('invest')">📈 投资</div>
                    <div class="celestial-tab" onclick="switchCelestialTab('records')">📜 记录</div>
                </div>

                <div id="celestialTabContent">
                    ${renderCelestialMarketTab()}
                </div>
            `;

            content.innerHTML = html;
        }

        // ===== renderCelestialInvestTab =====
        function renderCelestialInvestTab() {
            const ce = gameState.celestialEconomy;
            const investments = CELESTIAL_ITEMS;

            let html = '<div style="margin-bottom:15px;color:#aaa;">投资仙界产业，每日获得仙石收益</div>';
            html += '<div class="celestial-market-grid">';

            for (const [name, data] of Object.entries(investments)) {
                if (data.type !== 'investment') continue;

                // 检查是否已投资
                const existingInvest = ce.investments.find(inv => inv.area === name);
                const maxInvestments = 3;
                const currentInvestCount = ce.investments.filter(inv => inv.area === name).length;

                html += `
                    <div class="celestial-item" style="flex-direction:column;align-items:flex-start;">
                        <div style="display:flex;width:100%;justify-content:space-between;align-items:center;">
                            <div class="celestial-item-info">
                                <div class="celestial-item-name" style="color:#e1bee7;">${data.icon} ${name}</div>
                                <div class="celestial-item-desc">${data.desc}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="color:#aaa;font-size:0.85em;">投资：${data.baseCost} 💜/份</div>
                                <div style="color:#4caf50;font-size:0.85em;">日收益：${data.dailyReturn} 💜</div>
                            </div>
                        </div>
                        <div style="display:flex;gap:5px;margin-top:8px;width:100%;justify-content:flex-end;">
                            ${existingInvest ? 
                                `<span style="color:#ffd700;">已投 ${currentInvestCount}/${maxInvestments} 份</span>` : 
                                `<button class="exchange-btn" onclick="investCelestial('${name}')" 
                                    ${ce.immortalStones < data.baseCost ? 'disabled' : ''}>投资1份</button>`
                            }
                        </div>
                        ${existingInvest ? `
                            <div style="font-size:0.8em;color:#aaa;margin-top:5px;">
                                剩余 ${existingInvest.daysLeft} 天 | 预计收益：${existingInvest.returns} 💜
                            </div>
                        ` : ''}
                    </div>
                `;
            }
            html += '</div>';

            // 活跃投资
            if (ce.investments.length > 0) {
                html += '<div style="margin-top:15px;border-top:1px solid rgba(156,39,176,0.3);padding-top:15px;">';
                html += '<div style="color:#ffd700;margin-bottom:10px;">📊 活跃投资</div>';
                for (const inv of ce.investments) {
                    html += `
                        <div style="display:flex;justify-content:space-between;padding:5px;background:rgba(0,0,0,0.2);border-radius:5px;margin-bottom:5px;font-size:0.9em;">
                            <span>${CELESTIAL_ITEMS[inv.area]?.icon || '📦'} ${inv.area}</span>
                            <span style="color:#aaa;">剩余 ${inv.daysLeft} 天</span>
                            <span style="color:#4caf50;">+${inv.dailyReturn} 💜/天</span>
                        </div>
                    `;
                }
                html += '</div>';
            }

            return html;
        }

        // ===== renderCelestialMarketTab =====
        function renderCelestialMarketTab() {
            const ce = gameState.celestialEconomy;
            if (ce.marketItems.length === 0 || ce.lastMarketRefresh < gameState.days) {
                generateCelestialMarketItems();
            }

            let html = '<div class="celestial-market-grid">';
            for (const item of ce.marketItems) {
                const itemData = CELESTIAL_ITEMS[item[0]];
                html += `
                    <div class="celestial-item">
                        <div class="celestial-item-info">
                            <div class="celestial-item-name" style="color:#e1bee7;">${itemData.icon} ${item[0]}</div>
                            <div class="celestial-item-desc">${itemData.desc}</div>
                        </div>
                        <div class="celestial-item-price">💜 ${itemData.price}</div>
                        <button class="exchange-btn" onclick="buyCelestialItem('${item[0]}')" 
                            ${ce.immortalStones < itemData.price ? 'disabled' : ''}>购买</button>
                    </div>
                `;
            }
            html += '</div>';
            html += '<div style="text-align:center;margin-top:15px;">';
            html += `<button class="exchange-btn" onclick="refreshCelestialMarket()">🔄 刷新市场 (消耗1仙石)</button>`;
            html += '</div>';
            return html;
        }

