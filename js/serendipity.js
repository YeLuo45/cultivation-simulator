// Auto-generated module: serendipity.js
'use strict';

        // ===== calculateSerendipityChance =====
        function calculateSerendipityChance() {
            let chance = 0.15; // 基础15%

            // 连续未触发加成
            if (gameState.serendipity.badLuck > 0) {
                chance += Math.min(0.10, gameState.serendipity.badLuck * 0.01);
            }

            // 祥云符效果
            if (gameState.serendipity.serendipityBoostEndDay >= gameState.days) {
                chance += 0.10;
            }

            // 鸿运当头状态
            if (gameState.serendipity.luckStatus === 'lucky' && gameState.serendipity.luckEndDay >= gameState.days) {
                chance += 0.15;
            }

            // 厄运缠身状态
            if (gameState.serendipity.luckStatus === 'unlucky' && gameState.serendipity.luckEndDay >= gameState.days) {
                chance -= 0.10;
            }

            // 境界提升加成
            if (gameState.serendipity.lastTriggerDay > 0 && gameState.days - gameState.serendipity.lastTriggerDay <= 1) {
                chance += 0.05;
            }

            // 渡劫期间不触发
            if (gameState.tribulation && gameState.tribulation.inProgress) {
                return 0;
            }

            return Math.max(0.05, Math.min(0.30, chance));
        }

        // ===== checkSerendipity =====
        function checkSerendipity() {
            // 每日最多2次
            if (gameState.serendipity.todayCount >= 2) {
                return null;
            }

            // 渡劫期间不触发
            if (gameState.tribulation && gameState.tribulation.inProgress) {
                return null;
            }

            const chance = calculateSerendipityChance();

            if (Math.random() < chance) {
                return triggerRandomSerendipity();
            } else {
                // 累计连续未触发
                gameState.serendipity.badLuck++;
            }

            return null;
        }

        // ===== triggerRandomSerendipity =====
        function triggerRandomSerendipity() {
            // 获取符合条件的奇遇
            const eligibleEvents = [];
            for (const [name, event] of Object.entries(SERENDIPITY_EVENTS)) {
                // 检查境界要求
                if (gameState.realm < event.minRealm) continue;

                // 检查冷却
                if (gameState.serendipity.cooldownTypes[name] && gameState.serendipity.cooldownTypes[name] > gameState.days) continue;

                // 检查条件
                if (event.condition && !event.condition(gameState)) continue;

                eligibleEvents.push({ name, event });
            }

            if (eligibleEvents.length === 0) return null;

            // 随机选择
            const selected = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
            return executeSerendipity(selected.name, selected.event);
        }

        // ===== generateAiSerendipity =====
        function generateAiSerendipity(serendipityType, callback) {
            if (!miniMaxConfig.apiKey) {
                callback(getDefaultSerendipityText(serendipityType));
                return;
            }
            
            const model = miniMaxConfig.model || 'MiniMax-M2.7';
            const prompts = {
                'positive': `你是一个修仙游戏的奇遇描述生成器。请为玩家的一个正面奇遇生成独特描述。

玩家信息：
- 境界：${REALMS[gameState.realm] || '凡人'}
- 灵石：${gameState.stones}

要求：
1. 生成20-40字的中文奇遇描述
2. 描述要独特有画面感
3. 包含发现的物品或遇到的机缘
4. 直接输出描述，不要前缀

直接输出描述文字。`,
                'negative': `你是一个修仙游戏的奇遇描述生成器。请为玩家的一个负面奇遇生成独特描述。

玩家信息：
- 境界：${REALMS[gameState.realm] || '凡人'}
- 灵石：${gameState.stones}

要求：
1. 生成20-40字的中文奇遇描述
2. 描述危险或困境
3. 直接输出描述，不要前缀

直接输出描述文字。`,
                'neutral': `你是一个修仙游戏的奇遇描述生成器。请为玩家的一个中性奇遇生成独特描述。

玩家信息：
- 境界：${REALMS[gameState.realm] || '凡人'}
- 灵石：${gameState.stones}

要求：
1. 生成20-40字的中文奇遇描述
2. 描述一个需要选择的情况
3. 直接输出描述，不要前缀

直接输出描述文字。`
            };
            
            const prompt = prompts[serendipityType] || prompts['neutral'];
            
            callMiniMaxAPI(prompt, model, 100, (reply) => {
                if (reply && reply.trim()) {
                    callback(reply.trim());
                } else {
                    callback(getDefaultSerendipityText(serendipityType));
                }
            }, (err) => {
                callback(getDefaultSerendipityText(serendipityType));
            });
        }

        // ===== getDefaultSerendipityText =====
        function getDefaultSerendipityText(type) {
            const texts = {
                'positive': '你在路边发现了一株散发奇异光芒的灵草，似乎是罕见的天地精华！',
                'negative': '你不慎踏入了一处危险的禁地，四周弥漫着诡异的气息...',
                'neutral': '你遇到了一位神秘的散修，他似乎有话要对你说...'
            };
            return texts[type] || texts['neutral'];
        }

        // ===== executeSerendipity =====
        function executeSerendipity(name, event) {
            const serendipity = gameState.serendipity;

            // 更新状态
            serendipity.lastTriggerDay = gameState.days;
            serendipity.todayCount++;
            serendipity.lastTriggerType = name;
            serendipity.badLuck = 0;
            serendipity.cooldownTypes[name] = gameState.days + 1; // 24小时冷却

            // 执行效果
            const result = event.effect(gameState);

            // 记录日志
            const logEntry = {
                day: gameState.days,
                type: event.type,
                name: name,
                result: result.text
            };
            serendipity.log.unshift(logEntry);
            if (serendipity.log.length > 20) serendipity.log.pop();

            // A5 成就检查 - 奇遇触发
            if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {} };
            gameState.achievements.stats.serendipitiesEncountered++;
            checkAchievements();

            return { name, event, result };
        }

        // ===== showSerendipityModal =====
        function showSerendipityModal(serendipityData) {
            if (!serendipityData) return;

            const { name, event, result } = serendipityData;
            const modal = document.getElementById('serendipityModal');
            const content = document.getElementById('serendipityContent');
            const titleEl = document.getElementById('serendipityTitle');

            // 设置边框颜色
            modal.querySelector('.modal-content').className = `modal-content ${event.type}`;

            // 设置标题
            titleEl.textContent = `${event.icon} ${name} ${event.icon}`;

            // E4 使用AI生成独特描述
            if (miniMaxConfig.features.aiSerendipity && miniMaxConfig.apiKey) {
                // 先显示默认描述，然后异步获取AI描述更新
                let html = `
                    <div style="text-align:center;">
                        <span class="serendipity-type-badge ${event.type}">${event.type === 'positive' ? '✨ 吉利' : event.type === 'negative' ? '💀 凶险' : '⚖️ 中性'}</span>
                    </div>
                    <div class="serendipity-effect">
                        <p id="serendipityAiDesc" style="text-align:center;margin-bottom:15px;color:#aaa;">${result.text}<br><small>(AI描述生成中...)</small></p>
                `;

                if (result.effects && result.effects.length > 0) {
                    html += '<div class="serendipity-effect-item" style="font-weight:bold;margin-bottom:10px;">效果：</div>';
                    for (const effect of result.effects) {
                        const valueStr = effect.value > 0 ? `+${effect.value}` : `${effect.value}`;
                        html += `
                            <div class="serendipity-effect-item">
                                <span>${effect.type}</span>
                                <span class="${effect.positive ? 'effect-positive' : 'effect-negative'}">${valueStr}</span>
                            </div>
                        `;
                    }
                }
                html += '</div>';

                if (result.showRealmBattle) {
                    const isNegative = result.isNegative || false;
                    html += `
                        <div style="text-align:center;margin-top:15px;">
                            <button class="btn ${isNegative ? 'btn-combat' : 'btn-explore'}" onclick="startSecretRealmBattle('${name}', ${isNegative})">
                                ${isNegative ? '⚔️ 应战' : '🌀 进入秘境'}
                            </button>
                            <button class="btn btn-save" onclick="skipRealmBattle()" style="margin-left:10px;">跳过</button>
                        </div>
                    `;
                }

                if (result.showChoice && result.choices && result.choices.length > 0) {
                    const choiceLabels = { 0: '接受', 1: '拒绝' };
                    html += `<div style="text-align:center;margin-top:15px;">`;
                    result.choices.forEach((label, idx) => {
                        const btnLabel = choiceLabels[idx] || label;
                        html += `<button class="btn btn-cultivate" onclick="handleSerendipityChoice('${name}', ${idx})" style="margin-left:${idx > 0 ? '8px' : '0'}">${btnLabel}</button>`;
                    });
                    html += `</div>`;
                }

                content.innerHTML = html;
                modal.classList.add('active');

                // 异步生成AI描述
                generateAiSerendipity(event.type, (aiDescription) => {
                    gameState.currentSerendipityDescription = aiDescription;
                    const descEl = document.getElementById('serendipityAiDesc');
                    if (descEl) {
                        descEl.innerHTML = `<strong>${aiDescription}</strong>`;
                        descEl.style.color = '#ffd700';
                    }
                });
            } else {
                // 不使用AI时直接显示默认描述
                let html = `
                    <div style="text-align:center;">
                        <span class="serendipity-type-badge ${event.type}">${event.type === 'positive' ? '✨ 吉利' : event.type === 'negative' ? '💀 凶险' : '⚖️ 中性'}</span>
                    </div>
                    <div class="serendipity-effect">
                        <p style="text-align:center;margin-bottom:15px;">${result.text}</p>
                `;

                if (result.effects && result.effects.length > 0) {
                    html += '<div class="serendipity-effect-item" style="font-weight:bold;margin-bottom:10px;">效果：</div>';
                    for (const effect of result.effects) {
                        const valueStr = effect.value > 0 ? `+${effect.value}` : `${effect.value}`;
                        html += `
                            <div class="serendipity-effect-item">
                                <span>${effect.type}</span>
                                <span class="${effect.positive ? 'effect-positive' : 'effect-negative'}">${valueStr}</span>
                            </div>
                        `;
                    }
                }
                html += '</div>';

                if (result.showRealmBattle) {
                    const isNegative = result.isNegative || false;
                    html += `
                        <div style="text-align:center;margin-top:15px;">
                            <button class="btn ${isNegative ? 'btn-combat' : 'btn-explore'}" onclick="startSecretRealmBattle('${name}', ${isNegative})">
                                ${isNegative ? '⚔️ 应战' : '🌀 进入秘境'}
                            </button>
                            <button class="btn btn-save" onclick="skipRealmBattle()" style="margin-left:10px;">跳过</button>
                        </div>
                    `;
                }

                if (result.showChoice && result.choices && result.choices.length > 0) {
                    const choiceLabels = { 0: '接受', 1: '拒绝' };
                    html += `<div style="text-align:center;margin-top:15px;">`;
                    result.choices.forEach((label, idx) => {
                        const btnLabel = choiceLabels[idx] || label;
                        html += `<button class="btn btn-cultivate" onclick="handleSerendipityChoice('${name}', ${idx})" style="margin-left:${idx > 0 ? '8px' : '0'}">${btnLabel}</button>`;
                    });
                    html += `</div>`;
                }

                content.innerHTML = html;
                modal.classList.add('active');
            }

            // 记录日志
            addLog(event.type === 'positive' ? 'good' : event.type === 'negative' ? 'bad' : 'neutral', name, result.text);
        }

        // ===== handleSerendipityChoice =====
        function handleSerendipityChoice(name, idx) {
            closeSerendipityModal();

            if (name === '乞丐讨缘') {
                if (idx === 0) {
                    gameState.spiritStones -= 100;
                    gameState.serendipity.luckStatus = 'lucky';
                    gameState.serendipity.luckEndDay = gameState.days + 3;
                    addLog('good', '乞丐讨缘', '施舍乞丐，获得好运buff 3天');
                } else {
                    gameState.serendipity.badLuck += 3;
                    addLog('bad', '乞丐讨缘', '拒绝施舍，运气下降');
                }
            } else if (name === '散修求助') {
                if (idx === 0) {
                    gameState.spiritStones -= 200;
                    gameState.serendipity.serendipityBoostEndDay = gameState.days + 3;
                    gameState.activeEffects.serendipity_boost = 0.10;
                    addLog('good', '散修求助', '帮助散修，后续奇遇概率+10% 3天');
                } else {
                    addLog('neutral', '散修求助', '拒绝帮助，无影响');
                }
            } else if (name === '魔器诱惑') {
                if (idx === 0) {
                    // 添加魔器到背包
                    addToInventory('treasure', '魔刃', 1, 'rare',
                        { type: 'attack', value: 0.3 },
                        '攻击+30%，但每回合扣5灵气', '🗡️');
                    addLog('bad', '魔器诱惑', '获得魔刃，但每回合扣5灵气');
                } else {
                    addLog('good', '魔器诱惑', '拒绝魔器诱惑');
                }
            } else if (name === '心魔试炼') {
                if (idx === 0) {
                    // 勇敢面对：心境判定，胜利则大收益，失败则扣心境
                    const mindCheck = Math.random() < (gameState.mindset / 100);
                    if (mindCheck) {
                        const gain = 20;
                        gameState.mindset = Math.min(100, gameState.mindset + gain);
                        addLog('good', '心魔试炼', `击败心魔，心境+${gain}！`);
                    } else {
                        const loss = 15;
                        gameState.mindset = Math.max(0, gameState.mindset - loss);
                        addLog('bad', '心魔试炼', `心魔反噬，心境-${loss}`);
                    }
                } else {
                    // 退缩：无事发生，但浪费一次奇遇
                    addLog('neutral', '心魔试炼', '退缩逃避，无事发生');
                }
            } else if (name === '上古遗迹') {
                if (idx === 0) {
                    // 深入探索：70%获得大量灵石/功法，30%遇险
                    if (Math.random() < 0.7) {
                        const reward = Math.random() < 0.5
                            ? { type: 'spiritStones', value: Math.floor(2000 + Math.random() * 3000) }
                            : { type: 'technique', value: 1 };
                        if (reward.type === 'spiritStones') {
                            gameState.spiritStones += reward.value;
                            addLog('good', '上古遗迹', `深入探索成功，获得 ${reward.value} 灵石！`);
                        } else {
                            addLog('good', '上古遗迹', '深入探索成功，获得上古功法传承！');
                        }
                    } else {
                        const loss = Math.floor(gameState.spiritStones * 0.2);
                        gameState.spiritStones -= loss;
                        addLog('bad', '上古遗迹', `触发机关陷阱，损失 ${loss} 灵石！`);
                    }
                } else if (idx === 1) {
                    // 浅尝辄止：稳定小收益
                    const gain = Math.floor(500 + Math.random() * 500);
                    gameState.spiritStones += gain;
                    addLog('good', '上古遗迹', `浅尝辄止，稳定获得 ${gain} 灵石`);
                } else {
                    // 离开
                    addLog('neutral', '上古遗迹', '谨慎离开，无事发生');
                }
            } else if (name === '天赐体质·至尊骨') {
                if (idx === 0) {
                    // 接受完整传承
                    acquireConstitutionFromSerendipity('至尊骨');
                    addLog('good', '至尊骨', '接受完整传承，获得至尊骨！攻击+30%，暴击+15%');
                } else {
                    // 只取部分精华
                    acquireConstitutionFromSerendipity('至尊骨');
                    gameState.activeEffects.attack += 0.15;
                    addLog('good', '至尊骨', '只取精华，获得弱化版至尊骨：攻击+15%');
                }
            } else if (name === '天赐体质·疾风灵体') {
                if (idx === 0) {
                    // 与风融为一体：70%成功获完整灵体，30%失败获部分
                    if (Math.random() < 0.7) {
                        acquireConstitutionFromSerendipity('疾风灵体');
                        addLog('good', '疾风灵体', '与风融为一体，成功获得疾风灵体！速度+35%，先手+25%');
                    } else {
                        acquireConstitutionFromSerendipity('疾风灵体');
                        gameState.activeEffects.cultivate_speed += 0.1;
                        addLog('neutral', '疾风灵体', '融合不完全，获得弱化版：修炼速度+10%');
                    }
                } else {
                    // 保持自我：获得部分buff
                    acquireConstitutionFromSerendipity('疾风灵体');
                    addLog('good', '疾风灵体', '保持自我，获得疾风灵体！');
                }
            } else if (name === '天赐体质·重瞳') {
                if (idx === 0) {
                    // 承受试炼：60%成功获完整重瞳，40%失败仅获感知
                    if (Math.random() < 0.6) {
                        acquireConstitutionFromSerendipity('重瞳');
                        addLog('good', '重瞳', '试炼成功！获得重瞳：闪避+20%，可预判攻击');
                    } else {
                        acquireConstitutionFromSerendipity('重瞳');
                        gameState.activeEffects.defense += 0.1;
                        addLog('neutral', '重瞳', '试炼失败，仅获得部分感知：防御+10%');
                    }
                } else {
                    // 以凡眼视之：无事发生
                    addLog('neutral', '重瞳', '放弃试炼，重瞳消散……');
                }
            }

            saveGame();
            updateDisplay();
        }

        // ===== startSecretRealmBattle =====
        function startSecretRealmBattle(eventName, isNegative) {
            closeSerendipityModal();

            // E3 生成秘境名称
            generateRealmName((realmName) => {
                gameState.currentSecretRealmName = realmName;
                addEventLog(`📍 你进入了「${realmName}」`, 'success');
                
                // 玩家最大生命值随境界成长
                const playerMaxHP = 100 + gameState.realm * 100;
                secretRealmState = {
                    wave: 0,
                    totalWaves: 3,
                    enemies: generateRealmEnemies(isNegative),
                    playerHP: playerMaxHP,
                    playerMaxHP: playerMaxHP,
                    rewards: [],
                    eventName: eventName,
                    isNegative: isNegative,
                    realmName: realmName
                };

                // 显示秘境战斗UI
                showSecretRealmBattleUI();
            });
        }

        // ===== generateRealmName =====
        function generateRealmName(callback) {
            const model = miniMaxConfig.model || 'MiniMax-M2.7';
            const prompt = `你是一个修仙游戏的秘境名称生成器。请为玩家的下一个秘境生成一个独特的名字。

当前玩家境界：${REALMS[gameState.realm] || '凡人'}
秘境难度：第${gameState.realm + 1}层秘境

要求：
1. 生成一个2-5字的秘境名称
2. 要有仙侠风格（可以用：深渊/裂隙/遗迹/洞府/秘境/禁地/幻境等词）
3. 名称要独特有诗意
4. 直接输出名称，不要加引号或解释

直接输出名称。`;

            callMiniMaxAPI(prompt, model, 30, (reply) => {
                if (reply && reply.trim()) {
                    callback(reply.trim().substring(0, 8));
                } else {
                    callback(getDefaultRealmName());
                }
            }, (err) => {
                callback(getDefaultRealmName());
            });
        }

        // ===== getDefaultRealmName =====
        function getDefaultRealmName() {
            const names = ['迷雾深渊', '星辰裂隙', '上古遗迹', '天机洞府', '幽冥禁地', '幻境之海', '苍穹秘境', '永恒禁域'];
            return names[Math.floor(Math.random() * names.length)];
        }

        // ===== generateRealmEnemies =====
        function generateRealmEnemies(isNegative) {
            const enemies = [];
            // 境界名称池（随境界成长）
            const positivePrefixes = ['守护', '精英', '远古'];
            const negativePrefixes = ['野', '狂', '堕'];
            const names = isNegative
                ? ['狼', '熊', '蟒']
                : ['傀儡', '妖兽', '守卫'];
            const icons = isNegative
                ? ['🐺', '🐻', '🐍']
                : ['🤖', '👹', '⚔️'];

            for (let i = 0; i < 3; i++) {
                // 敌人境界 = 玩家境界 - 1(缓冲区) + i(逐波增强)
                const enemyRealm = Math.max(0, gameState.realm - 1 + i);
                // HP: 指数成长，每境界×1.7，第一波有缓冲区
                const baseHP = Math.floor(80 * Math.pow(1.7, enemyRealm));
                const hp = baseHP + Math.floor(Math.random() * baseHP * 0.5);
                // 攻击: 指数成长，每境界×1.6
                const baseAttack = Math.floor(15 * Math.pow(1.6, enemyRealm));
                const attack = baseAttack + Math.floor(Math.random() * baseAttack * 0.4);
                // 名字格式：正面 远古傀儡1号 / 负面 野狼
                const prefix = isNegative ? negativePrefixes[i] : positivePrefixes[i];
                const name = isNegative
                    ? `${prefix}${names[i]}`
                    : `${prefix}${names[i]}${i + 1}号`;
                enemies.push({
                    name: name,
                    icon: icons[i],
                    hp: hp,
                    maxHP: hp,
                    attack: attack,
                    realm: enemyRealm
                });
            }
            return enemies;
        }

        // ===== showSecretRealmBattleUI =====
        function showSecretRealmBattleUI() {
            const content = document.getElementById('secretRealmContent');
            const modal = document.getElementById('secretRealmModal');
            const realmName = gameState.currentSecretRealmName || secretRealmState.realmName || '神秘秘境';

            let html = `
                <div class="secret-realm-arena">
                    <div class="realm-name" style="color:#ffd700;font-size:1.3em;margin-bottom:10px;">「${realmName}」</div>
                    <div class="realm-wave">第 ${secretRealmState.wave + 1} / ${secretRealmState.totalWaves} 波</div>
                    <div class="realm-progress">
            `;

            for (let i = 0; i < secretRealmState.totalWaves; i++) {
                let cls = 'wave-dot';
                if (i < secretRealmState.wave) cls += ' completed';
                else if (i === secretRealmState.wave) cls += ' current';
                html += `<div class="${cls}"></div>`;
            }

            html += '</div>';

            // 玩家状态
            html += `
                <div style="margin-bottom:20px;text-align:center;">
                    <div style="color:#ffd700;font-size:1.2em;">你的状态</div>
                    <div class="realm-hp-bar" style="margin:10px auto;width:200px;">
                        <div class="realm-hp-fill" style="width:${(secretRealmState.playerHP / secretRealmState.playerMaxHP) * 100}%"></div>
                    </div>
                    <div style="color:#aaa;">${secretRealmState.playerHP} / ${secretRealmState.playerMaxHP}</div>
                </div>
            `;

            // 敌人列表
            for (let i = secretRealmState.wave; i < secretRealmState.enemies.length; i++) {
                const enemy = secretRealmState.enemies[i];
                const hpPercent = (enemy.hp / enemy.maxHP) * 100;
                html += `
                    <div class="realm-enemy">
                        <div class="realm-enemy-info">
                            <span class="realm-enemy-avatar">${enemy.icon}</span>
                            <div>
                                <div class="realm-enemy-name">${enemy.name}</div>
                                <div class="realm-enemy-realm">${CONFIG.realms[enemy.realm]}期</div>
                            </div>
                        </div>
                        <div class="realm-enemy-hp">
                            <div>攻击: ${enemy.attack}</div>
                            <div class="realm-hp-bar">
                                <div class="realm-hp-fill" style="width:${hpPercent}%"></div>
                            </div>
                            <div style="font-size:0.85em;color:#aaa;">${enemy.hp} / ${enemy.maxHP}</div>
                        </div>
                    </div>
                `;
            }

            html += '</div>';

            // 操作按钮
            html += `
                <div style="text-align:center;">
                    <button class="btn btn-cultivate" onclick="attackRealmEnemy()">⚔️ 攻击</button>
                    <button class="btn btn-breakthrough" onclick="defendRealmAttack()">🛡️ 防御</button>
                </div>
            `;

            content.innerHTML = html;
            modal.classList.add('active');
        }

        // ===== attackRealmEnemy =====
        function attackRealmEnemy() {
            const enemy = secretRealmState.enemies[secretRealmState.wave];
            const playerAttack = Math.floor(20 + gameState.realm * 15 + Math.random() * 20);

            // 计算伤害（考虑功法加成和装备）
            let totalAttack = playerAttack * (1 + gameState.activeEffects.attack);

            enemy.hp -= Math.floor(totalAttack);

            // 记录伤害
            addLog('good', '秘境战斗', `对${enemy.name}造成 ${Math.floor(totalAttack)} 点伤害！`);

            // 检查是否击败敌人
            if (enemy.hp <= 0) {
                secretRealmState.wave++;

                // 发放波次奖励
                const waveRewards = [
                    { type: 'spiritStones', value: Math.floor(100 + Math.random() * 100) },
                    { type: 'qi', value: Math.floor(20 + Math.random() * 30) }
                ];
                const reward = waveRewards[Math.floor(Math.random() * waveRewards.length)];

                if (reward.type === 'spiritStones') {
                    gameState.spiritStones += reward.value;
                    secretRealmState.rewards.push(`${reward.value} 灵石`);
                } else {
                    gameState.qi = Math.min(gameState.maxQi, gameState.qi + reward.value);
                    secretRealmState.rewards.push(`${reward.value} 灵气`);
                }

                addLog('good', '秘境战斗', `击败${enemy.name}！获得 ${secretRealmState.rewards[secretRealmState.rewards.length - 1]}`);

                // 检查是否通关
                if (secretRealmState.wave >= secretRealmState.totalWaves) {
                    completeSecretRealm();
                    return;
                }
            } else {
                // 敌人反击
                const damage = Math.floor(enemy.attack * (1 - gameState.activeEffects.defense));
                secretRealmState.playerHP -= damage;
                addLog('bad', '秘境战斗', `${enemy.name}反击，造成 ${damage} 点伤害！`);

                // 检查玩家是否死亡
                if (secretRealmState.playerHP <= 0) {
                    failSecretRealm();
                    return;
                }
            }

            saveGame();
            updateDisplay();
            showSecretRealmBattleUI();
        }

        // ===== defendRealmAttack =====
        function defendRealmAttack() {
            const enemy = secretRealmState.enemies[secretRealmState.wave];
            const damage = Math.floor(enemy.attack * 0.3 * (1 - gameState.activeEffects.defense));
            secretRealmState.playerHP -= damage;

            addLog('neutral', '秘境战斗', `防御成功，受到 ${damage} 点伤害！`);

            if (secretRealmState.playerHP <= 0) {
                failSecretRealm();
                return;
            }

            saveGame();
            updateDisplay();
            showSecretRealmBattleUI();
        }

        // ===== completeSecretRealm =====
        function completeSecretRealm() {
            const modal = document.getElementById('secretRealmModal');
            modal.classList.remove('active');

            // 发放最终奖励
            // 经济调整：秘境灵石奖励 ×1.5，让秘境成为更重要的发展途径
            const finalRewards = [];
            const stones = Math.floor((500 + gameState.realm * 300 + Math.random() * 500) * 1.5);
            gameState.spiritStones += stones;
            finalRewards.push(`${stones} 灵石`);

            // 随机额外奖励
            if (Math.random() < 0.5) {
                const qi = Math.floor(50 + Math.random() * 100);
                gameState.qi = Math.min(gameState.maxQi, gameState.qi + qi);
                finalRewards.push(`${qi} 灵气`);
            }
            if (Math.random() < 0.3) {
                const pill = ['聚灵丹', '心魔丹', '金髓丹'][Math.floor(Math.random() * 3)];
                addItemToInventory(pill, 1);
                finalRewards.push(`${pill} x1`);
            }

            const rewardText = finalRewards.join('、');
            addLog('good', '秘境通关', `秘境探险完成！获得：${rewardText}`);

            // 记录到奇遇日志
            gameState.serendipity.log.unshift({
                day: gameState.days,
                type: 'positive',
                name: secretRealmState.eventName,
                result: `秘境通关，获得：${rewardText}`
            });

            saveGame();
            updateDisplay();

            alert(`🎉 秘境通关！\n\n获得：${rewardText}`);
        }

        // ===== failSecretRealm =====
        function failSecretRealm() {
            const modal = document.getElementById('secretRealmModal');
            modal.classList.remove('active');

            // 失败惩罚
            if (secretRealmState.isNegative) {
                const loss = Math.floor(gameState.spiritStones * 0.2);
                gameState.spiritStones -= loss;
                addLog('bad', '秘境失败', `抵御妖兽失败！损失 ${loss} 灵石`);
            } else {
                const loss = Math.floor(gameState.spiritStones * 0.1);
                gameState.spiritStones -= loss;
                addLog('bad', '秘境失败', `秘境挑战失败！损失 ${loss} 灵石`);
            }

            // 记录到奇遇日志
            gameState.serendipity.log.unshift({
                day: gameState.days,
                type: 'negative',
                name: secretRealmState.eventName,
                result: '秘境挑战失败'
            });

            saveGame();
            updateDisplay();
        }

        // ===== skipRealmBattle =====
        function skipRealmBattle() {
            const modal = document.getElementById('secretRealmModal');
            modal.classList.remove('active');
            addLog('neutral', '秘境探险', '选择跳过秘境探险');
            saveGame();
        }

        // ===== closeSerendipityModal =====
        function closeSerendipityModal() {
            document.getElementById('serendipityModal').classList.remove('active');
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

        // ===== useExploreTalisman =====
        function useExploreTalisman() {
            const talismanIdx = gameState.inventory.findIndex(i => i.name === '探路符');
            if (talismanIdx === -1) {
                alert('没有探路符！');
                return;
            }

            const talisman = gameState.inventory[talismanIdx];
            talisman.quantity--;
            if (talisman.quantity <= 0) {
                gameState.inventory.splice(talismanIdx, 1);
            }

            // 强制触发秘境入口
            const event = SERENDIPITY_EVENTS['秘境入口'];
            const result = executeSerendipity('秘境入口', event);
            showSerendipityModal(result);

            saveGame();
        }

        // ===== processEndOfDaySerendipity =====
        function processEndOfDaySerendipity() {
            // 重置每日计数
            if (gameState.serendipity.lastTriggerDay < gameState.days) {
                gameState.serendipity.todayCount = 0;
            }

            // 检查状态持续时间
            if (gameState.serendipity.luckEndDay > 0 && gameState.serendipity.luckEndDay <= gameState.days) {
                gameState.serendipity.luckStatus = null;
                addLog('neutral', '状态结束', '运气状态已结束');
            }
            if (gameState.serendipity.serendipityBoostEndDay > 0 && gameState.serendipity.serendipityBoostEndDay <= gameState.days) {
                gameState.activeEffects.serendipity_boost = 0;
                addLog('neutral', '状态结束', '奇遇加成状态已结束');
            }

            // 检查魔器扣血效果
            const demonWeapon = gameState.inventory.find(i => i.name === '魔刃');
            if (demonWeapon) {
                const hpLoss = 5;
                gameState.qi = Math.max(0, gameState.qi - hpLoss);
                addLog('bad', '魔器侵蚀', `魔刃吸取灵气，-${hpLoss}灵气`);
            }
        }

        // ===== buySerendipityItem =====
        function buySerendipityItem(name) {
            const talisman = SERENDIPITY_TALISMANS[name];
            if (!talisman) return;

            if (gameState.spiritStones < talisman.price) {
                alert('灵石不足！');
                return;
            }

            gameState.spiritStones -= talisman.price;
            addToInventory('talisman', name, 1, 'rare',
                talisman.effect,
                talisman.desc,
                talisman.icon);

            addLog('good', '购买道具', `购买了 ${name}！`);
            saveGame();
            updateDisplay();
        }

