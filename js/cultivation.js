// Auto-generated module: cultivation.js
'use strict';

        // ===== renderLog =====
        function renderLog() {
            const container = document.getElementById('logEntries');
            const recentLogs = gameState.eventLog.slice(0, 5);
            container.innerHTML = recentLogs.map(log => `
                <div class="log-entry ${log.type}">
                    <div class="log-entry-title">第${log.day}天 - ${log.title}</div>
                    <div class="log-entry-text">${log.text}</div>
                </div>
            `).join('');
        }

        // ===== doCultivate =====
        function doCultivate() {
            const req = REALM_REQUIREMENTS[gameState.realm];
            let baseGain = 5 + Math.random() * 10 + gameState.realm * 3;
            // V7 应用灵根速度加成
            baseGain *= getSpiritRootSpeedBonus();
            // 应用体质修炼速度加成
            if (gameState.activeEffects.constitution_bonuses && gameState.activeEffects.constitution_bonuses.cultivateSpeed) {
                baseGain *= (1 + gameState.activeEffects.constitution_bonuses.cultivateSpeed);
            }
            // 应用装备和丹药效果
            baseGain *= (1 + gameState.activeEffects.cultivate_speed);
            baseGain *= (1 + gameState.activeEffects.cultivate_qi_rate);
            baseGain *= (1 + gameState.activeEffects.all_stats);
            const gain = Math.floor(baseGain);
            gameState.qi = Math.min(gameState.maxQi, gameState.qi + gain);
            gameState.cultivationProgress += gain;
            
            let logType = 'good';
            let logText = `修炼${gain}点灵气，感觉体内的灵力更加充沛。`;
            
            // 检查是否需要晋级
            if (gameState.cultivationProgress >= req.stageThreshold[gameState.stage] && gameState.stage < 2) {
                gameState.stage++;
                logText = `修炼${gain}点灵气，境界突破到${CONFIG.stages[gameState.stage]}！`;
                addLog(logType, '境界突破', logText);
            } else if (gameState.cultivationProgress >= req.stageThreshold[2]) {
                logText = `修炼${gain}点灵气，${CONFIG.realms[gameState.realm]}期修炼圆满，可以尝试突破到下一个境界！`;
                addLog('neutral', '境界圆满', logText);
            } else {
                addLog(logType, '修炼', logText);
            }
            
            gameState.days++;
            saveGame();
            updateDisplay();
            doMorningExercise();
        }

        // ===== doMorningExercise =====
        function doMorningExercise() {
            const gain = Math.floor(2 + Math.random() * 5);
            gameState.qi = Math.min(gameState.maxQi, gameState.qi + gain);
            gameState.mindset = Math.min(100, gameState.mindset + 1);
            updateDisplay();

            // V6: 处理每日奇遇结算
            processEndOfDaySerendipity();

            // V6: 检查是否触发奇遇
            const serendipityResult = checkSerendipity();
            if (serendipityResult) {
                showSerendipityModal(serendipityResult);
            }
        }

        // ===== getLocalRandomEvent =====
        function getLocalRandomEvent() {
            const events = [
                {
                    title: '🌿 发现灵草',
                    description: '在山林间发现一株散发幽香的灵草，似乎可以服用增强灵气。',
                    options: [
                        { text: '小心采摘', risk: 'low', effects: { qi: 15, mindset: 0, spiritStones: 0 } },
                        { text: '直接服用', risk: 'medium', effects: { qi: 35, mindset: -5, spiritStones: 0 } },
                        { text: '连根拔起研究', risk: 'high', effects: { qi: 60, mindset: -15, spiritStones: 0 } }
                    ]
                },
                {
                    title: '⚔️ 遇到妖兽',
                    description: '一只妖兽从林中窜出，眼中闪烁着凶光，似乎把你当成了猎物。',
                    options: [
                        { text: '悄悄绕行', risk: 'low', effects: { qi: 0, mindset: 5, spiritStones: 0 } },
                        { text: '与之搏斗', risk: 'medium', effects: { qi: -20, mindset: -10, spiritStones: 30 } },
                        { text: '全力击杀', risk: 'high', effects: { qi: -40, mindset: -25, spiritStones: 80 } }
                    ]
                },
                {
                    title: '🏯 废弃洞府',
                    description: '前方有一座废弃的修士洞府，门口的石碑上刻着模糊的文字。',
                    options: [
                        { text: '礼貌叩门', risk: 'low', effects: { qi: 10, mindset: 5, spiritStones: 0 } },
                        { text: '尝试破阵', risk: 'medium', effects: { qi: 30, mindset: -10, spiritStones: 50 } },
                        { text: '强行闯入', risk: 'high', effects: { qi: -30, mindset: -30, spiritStones: 150 } }
                    ]
                },
                {
                    title: '☁️ 灵气潮汐',
                    description: '天地灵气突然变得躁动，形成一股灵气潮汐，正是修炼的好时机。',
                    options: [
                        { text: '静心吸收', risk: 'low', effects: { qi: 25, mindset: 10, spiritStones: 0 } },
                        { text: '引导入体', risk: 'medium', effects: { qi: 50, mindset: 0, spiritStones: 0 } },
                        { text: '强行吞噬', risk: 'high', effects: { qi: 100, mindset: -20, spiritStones: 0 } }
                    ]
                },
                {
                    title: '🧘 偶遇前辈',
                    description: '一位神秘的前辈高人出现在你面前，似乎对你有所指点。',
                    options: [
                        { text: '恭敬请教', risk: 'low', effects: { qi: 20, mindset: 15, spiritStones: 0 } },
                        { text: '交流心得', risk: 'medium', effects: { qi: 40, mindset: 5, spiritStones: 0 } },
                        { text: '请求收徒', risk: 'high', effects: { qi: 80, mindset: -10, spiritStones: -50 } }
                    ]
                }
            ];
            return events[Math.floor(Math.random() * events.length)];
        }

        // ===== displayEventModal =====
        function displayEventModal(event) {
            document.getElementById('modalTitle').textContent = event.title;
            document.getElementById('modalDescription').textContent = event.description;
            
            const optionsContainer = document.getElementById('modalOptions');
            optionsContainer.innerHTML = event.options.map((opt, idx) => `
                <button class="option-btn" onclick="handleOption(${idx}, ${JSON.stringify(event.options[idx]).replace(/"/g, '&quot;')})">
                    ${opt.text}
                    <span class="option-risk ${opt.risk}">${opt.risk === 'low' ? '低风险' : opt.risk === 'medium' ? '中风险' : '高风险'}</span>
                </button>
            `).join('');
            
            // 保存当前事件
            window.currentEvent = event;
        }

        // ===== getTribulationKey =====
        function getTribulationKey(realm, stage) {
            if (realm === 3) {
                if (stage === 0) return '金丹初期雷劫';
                if (stage === 1) return '金丹中期阴火';
                return '金丹后期风劫';
            }
            if (realm === 4) return '元婴心魔';
            return '化神飞升';
        }

        // ===== localBreakthrough =====
        function localBreakthrough(isTribulation = false) {
            if (isTribulation) {
                executeTribulation();
                return;
            }
            
            const req = REALM_REQUIREMENTS[gameState.realm];
            let chance = (gameState.mindset / 100) * (gameState.qi / req.breakthroughQi);
            // 应用突破加成效果
            chance *= (1 + gameState.activeEffects.breakthrough_boost);
            chance *= (1 + gameState.activeEffects.all_stats);
            
            if (Math.random() < chance) {
                if (gameState.realm >= 4) {
                    // 飞升！
                    gameState.isGameOver = true;
                    gameState.isVictory = true;
                    addLog('good', '白日飞升', `历经${gameState.days}天的修炼，你终于突破化神期，白日飞升！`);
                    saveGame();
                    showGameOverScreen();
                } else {
                    // 突破成功
                    gameState.realm++;
                    gameState.stage = 0;
                    gameState.cultivationProgress = 0;
                    gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
                    gameState.qi = Math.floor(gameState.qi * 0.3);
                    gameState.mindset = Math.max(0, gameState.mindset - 10);
                    addLog('good', '突破成功', `恭喜！突破到${CONFIG.realms[gameState.realm]}期！`);
                    // V7 检查体质激活
                    initializeConstitutionEffects();
                    saveGame();
                    updateDisplay();
                }
            } else {
                // 突破失败
                gameState.qi = Math.floor(gameState.qi * 0.3);
                gameState.mindset = Math.max(0, gameState.mindset - 20);
                addLog('bad', '突破失败', '突破失败，灵气反噬...');
                saveGame();
                updateDisplay();
            }
        }

        // ===== displayBreakthroughResult =====
        function displayBreakthroughResult(result) {
            document.getElementById('modalDescription').innerHTML = '';
            const descDiv = document.createElement('div');
            descDiv.className = 'modal-description';
            descDiv.innerHTML = `<strong>${result.title}</strong><br><br>${result.description}`;
            document.getElementById('modalDescription').appendChild(descDiv);
            
            if (result.success) {
                if (gameState.realm >= 4) {
                    gameState.isGameOver = true;
                    gameState.isVictory = true;
                    addLog('good', '白日飞升', `历经${gameState.days}天的修炼，你终于突破化神期，白日飞升！`);
                } else {
                    gameState.realm++;
                    gameState.stage = 0;
                    gameState.cultivationProgress = 0;
                    gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
                    gameState.qi = Math.floor(gameState.qi * 0.3);
                    gameState.mindset = Math.max(0, gameState.mindset - 10);
                    addLog('good', '突破成功', `恭喜！突破到${CONFIG.realms[gameState.realm]}期！`);
                }
            } else {
                gameState.qi = Math.floor(gameState.qi * 0.3);
                gameState.mindset = Math.max(0, gameState.mindset - 20);
                addLog('bad', '突破失败', '突破失败，灵气反噬...');
            }
            
            saveGame();
            updateDisplay();
            
            document.getElementById('modalOptions').classList.add('hidden');
        }

        // ===== showTribulationUI =====
        function showTribulationUI() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];
            const modal = document.getElementById('tribulationModal');
            const scene = document.getElementById('tribulationScene');
            const typeDiv = document.getElementById('tribType');
            const rateSpan = document.getElementById('successRate');
            const prepDiv = document.getElementById('tribulationPreparations');
            const actionsDiv = document.getElementById('tribulationActions');
            const prepList = document.getElementById('prepList');

            // 设置场景样式
            scene.className = 'tribulation-scene ' + trib.type;
            scene.innerHTML = `<p style="color:#aaa;font-size:1.1em">${trib.desc}</p><p style="color:#ffd700;margin-top:10px">第 ${gameState.tribulation.currentStage + 1} / ${gameState.tribulation.totalStages} 重</p>`;

            // 天劫类型
            typeDiv.innerHTML = `【${gameState.tribulation.tribKey}】`;

            // 计算并显示成功率
            const rate = calculateTribulationSuccess(gameState.tribulation.tribKey);
            rateSpan.textContent = Math.round(rate * 100) + '%';

            // 准备加成列表
            updatePrepList();

            // 生成准备选项
            prepDiv.innerHTML = '';
            
            // 阵法选项
            const hasArray = gameState.tribulation.preparations.includes('阵法');
            const arrayBtn = document.createElement('button');
            arrayBtn.innerHTML = hasArray ? '✓ 阵法已布置' : '📿 布置阵法 (-2000灵石)';
            arrayBtn.className = hasArray ? 'active' : '';
            arrayBtn.disabled = hasArray || gameState.spiritStones < 2000;
            arrayBtn.onclick = () => addPreparation('阵法');
            prepDiv.appendChild(arrayBtn);

            // 定神丹选项
            const hasPill = gameState.tribulation.preparations.includes('定神丹');
            const hasDingShen = gameState.inventory.some(item => item.name === '定神丹');
            const pillBtn = document.createElement('button');
            pillBtn.innerHTML = hasPill ? '✓ 已服用定神丹' : '💊 服用定神丹';
            pillBtn.className = hasPill ? 'active' : '';
            pillBtn.disabled = hasPill || !hasDingShen;
            pillBtn.onclick = () => addPreparation('定神丹');
            prepDiv.appendChild(pillBtn);

            // 祈祷选项
            const hasPray = gameState.tribulation.preparations.includes('祈祷');
            const prayBtn = document.createElement('button');
            prayBtn.innerHTML = hasPray ? '✓ 祈祷已完成' : '🙏 祈祷先祖 (-10000灵石)';
            prayBtn.className = hasPray ? 'active' : '';
            prayBtn.disabled = hasPray || gameState.spiritStones < 10000;
            prayBtn.onclick = () => addPreparation('祈祷');
            prepDiv.appendChild(prayBtn);

            // 装备检查
            const equipped = gameState.equippedTreasures.filter(t => t);
            if (equipped.length > 0) {
                const equipInfo = equipped.map(t => `${t.icon||'📦'}${t.name}`).join(', ');
                const equipDiv = document.createElement('div');
                equipDiv.style.cssText = 'font-size:0.85em;color:#aaa;margin-top:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;';
                equipDiv.innerHTML = `当前装备：${equipInfo}`;
                prepDiv.appendChild(equipDiv);
            }

            // 转世buff提示
            if (gameState.hasTransmigrationBuff) {
                const buffDiv = document.createElement('div');
                buffDiv.className = 'buff-indicator';
                buffDiv.style.cssText = 'margin-top:10px;display:inline-block;';
                buffDiv.innerHTML = '✨ 转世重修加成：成功率+10%';
                prepDiv.appendChild(buffDiv);
            }

            // 操作按钮
            actionsDiv.innerHTML = '';
            const startBtn = document.createElement('button');
            startBtn.className = 'btn-tribulation start';
            startBtn.textContent = '🔥 开始渡劫';
            startBtn.onclick = () => startTribulation();
            actionsDiv.appendChild(startBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-tribulation cancel';
            cancelBtn.textContent = '⏸ 暂缓突破';
            cancelBtn.onclick = () => cancelTribulation();
            actionsDiv.appendChild(cancelBtn);

            modal.classList.add('active');
        }

        // ===== updatePrepList =====
        function updatePrepList() {
            const prepList = document.getElementById('prepList');
            const preps = gameState.tribulation.preparations;
            if (preps.length === 0) {
                prepList.innerHTML = '';
                return;
            }
            prepList.innerHTML = '准备加成：' + preps.map(p => {
                let bonus = '';
                if (p === '阵法') bonus = '(伤害-30%)';
                if (p === '定神丹') bonus = '(心境消耗-50%)';
                if (p === '祈祷') bonus = '(成功率+10%)';
                return p + bonus;
            }).join('、');
        }

        // ===== addPreparation =====
        function addPreparation(type) {
            if (gameState.tribulation.preparations.includes(type)) return;

            if (type === '阵法') {
                if (gameState.spiritStones < 2000) {
                    alert('灵石不足！布置阵法需要2000灵石');
                    return;
                }
                gameState.spiritStones -= 2000;
            } else if (type === '定神丹') {
                const idx = gameState.inventory.findIndex(item => item.name === '定神丹');
                if (idx === -1) {
                    alert('背包中没有定神丹！');
                    return;
                }
                gameState.inventory.splice(idx, 1);
            } else if (type === '祈祷') {
                if (gameState.spiritStones < 10000) {
                    alert('灵石不足！祈祷先祖需要10000灵石');
                    return;
                }
                gameState.spiritStones -= 10000;
            }

            gameState.tribulation.preparations.push(type);
            saveGame();
            showTribulationUI();
            updateDisplay();
        }

        // ===== calculateTribulationSuccess =====
        function calculateTribulationSuccess(tribKey) {
            const trib = TRIBULATIONS[tribKey];
            let rate = trib.baseRate;

            // 心境加成
            rate += (gameState.mindset / 100) * 0.2;

            // 转世重修buff
            if (gameState.hasTransmigrationBuff) {
                rate += 0.1;
            }

            // 装备加成
            const equipped = gameState.equippedTreasures.filter(t => t);
            equipped.forEach(t => {
                if (t.effects) {
                    t.effects.forEach(e => {
                        if (e.type === '渡劫_damage_reduce') rate += e.value * 0.1;
                        if (e.type === 'all_stats') rate += e.value * 0.5;
                    });
                }
            });

            // 准备加成
            if (gameState.tribulation.preparations.includes('阵法')) rate += 0.15;
            if (gameState.tribulation.preparations.includes('定神丹')) rate += 0.1;
            if (gameState.tribulation.preparations.includes('祈祷')) rate += 0.1;

            // 境界惩罚
            if (gameState.realm === 4) rate -= 0.1;
            if (gameState.realm === 5) rate -= 0.2;

            return Math.min(0.95, Math.max(0.05, rate));
        }

        // ===== generateTribulationScene =====
        function generateTribulationScene(realm, callback) {
            const model = miniMaxConfig.model || 'MiniMax-M2.7';
            const prompt = `你是一个修仙游戏的天劫场景生成器。请为玩家的渡劫场景生成一段独特的描述。
            
当前玩家信息：
- 境界：${REALMS[realm] || '未知'}
- 灵石：${gameState.stones}
- 装备：${typeof getEquippedItems === 'function' ? getEquippedItems() : '无'}

要求：
1. 生成一段50-100字的渡劫场景描述
2. 包含天象异变（雷电/乌云/异火等）
3. 包含内心心境描写
4. 描述要独特，每次生成都不同
5. 用中文输出，不要加引号

直接输出场景描述文字，不要前缀。`;

            callMiniMaxAPI(prompt, model, 200, (reply) => {
                if (reply && reply.trim()) {
                    callback(reply.trim());
                } else {
                    callback(getDefaultTribulationScene(realm));
                }
            }, (err) => {
                callback(getDefaultTribulationScene(realm));
            });
        }

        // ===== getDefaultTribulationScene =====
        function getDefaultTribulationScene(realm) {
            const scenes = [
                '天空骤然暗沉，乌云如墨般压下，电蛇在云层中狂舞，一道道紫色的天雷在云间酝酿，整个世界仿佛都在这股天威下颤抖。',
                '狂风骤起，飞沙走石，虚空中裂开一道道金色的裂缝，从中泄出炽热的光芒，仿佛有无形的神灵在注视着你，天劫即将降临。',
                '天地间一片肃杀之气，极寒与极热交替从天空倾泻而下，雷云翻涌如海，一道道银白色的雷劫之柱从天而降，直指你的位置。'
            ];
            return scenes[realm % scenes.length];
        }

        // ===== executeTribulation =====
        function executeTribulation() {
            const rate = calculateTribulationSuccess(gameState.tribulation.tribKey);
            const roll = Math.random();

            if (roll < rate) {
                // 成功
                if (roll < rate * 0.5) {
                    // 大成功
                    handleGreatSuccess();
                } else {
                    // 普通成功
                    handleSuccess();
                }
            } else {
                // 失败
                if (roll < 0.3) {
                    // 陨落
                    handleDeath();
                } else {
                    // 重伤
                    handleInjury();
                }
            }
        }

        // ===== handleGreatSuccess =====
        function handleGreatSuccess() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];

            // 突破成功
            gameState.realm++;
            gameState.stage = 0;
            gameState.cultivationProgress = 0;
            gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
            gameState.qi = Math.floor(gameState.qi * 0.5); // 大成功保留50%
            gameState.mindset = Math.min(100, gameState.mindset + 20); // 心境提升
            gameState.hasTransmigrationBuff = false; // 清除转世buff

            // 天劫洗礼加成
            gameState.activeEffects.attack += 0.1;
            gameState.activeEffects.defense += 0.1;

            // 记录
            gameState.tribulationRecord.push({
                type: gameState.tribulation.tribKey,
                result: '大成功',
                day: gameState.days
            });

            gameState.tribulation.inProgress = false;

            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <div class="tribulation-result great-success">
                    <h3>✨ 大成功 ✨</h3>
                    <p style="color:#ffd700">天劫洗礼，你的修为突飞猛进！</p>
                    <p style="color:#aaa;margin-top:10px">突破到${CONFIG.realms[gameState.realm]}期！</p>
                    <p style="color:#4caf50;margin-top:5px">获得天劫洗礼加成：攻击+10%，防御+10%</p>
                    <p style="color:#ff69b4;margin-top:5px">心境+20</p>
                </div>
            `;

            addLog('good', '渡劫大成功', `历经天劫洗礼，突破到${CONFIG.realms[gameState.realm]}期！获得天劫洗礼加成！`);
            saveGame();
            updateDisplay();

            // 3秒后关闭
            setTimeout(() => {
                closeTribulationModal();
            }, 3000);
        }

        // ===== handleSuccess =====
        function handleSuccess() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];

            // 突破成功
            gameState.realm++;
            gameState.stage = 0;
            gameState.cultivationProgress = 0;
            gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
            gameState.qi = Math.floor(gameState.qi * 0.3);
            gameState.mindset = Math.max(0, gameState.mindset - 5);
            gameState.hasTransmigrationBuff = false;

            // 天劫洗礼加成（较小）
            gameState.activeEffects.attack += 0.05;
            gameState.activeEffects.defense += 0.05;

            // 记录
            gameState.tribulationRecord.push({
                type: gameState.tribulation.tribKey,
                result: '成功',
                day: gameState.days
            });

            gameState.tribulation.inProgress = false;

            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <div class="tribulation-result success">
                    <h3>🎉 渡劫成功 🎉</h3>
                    <p style="color:#aaa">你历经重重磨难，终于渡过天劫！</p>
                    <p style="color:#ffd700;margin-top:10px">突破到${CONFIG.realms[gameState.realm]}期！</p>
                    <p style="color:#4caf50;margin-top:5px">获得天劫洗礼加成：攻击+5%，防御+5%</p>
                </div>
            `;

            addLog('good', '渡劫成功', `渡过${trib.desc}，突破到${CONFIG.realms[gameState.realm]}期！`);
            saveGame();
            updateDisplay();

            setTimeout(() => {
                closeTribulationModal();
            }, 3000);
        }

        // ===== handleInjury =====
        function handleInjury() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];

            // 渡劫失败但保命
            gameState.qi = Math.floor(gameState.qi * 0.1);
            gameState.mindset = Math.max(0, gameState.mindset - 30);

            // 记录
            gameState.tribulationRecord.push({
                type: gameState.tribulation.tribKey,
                result: '重伤',
                day: gameState.days
            });

            gameState.tribulation.inProgress = false;

            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <div class="tribulation-result injury">
                    <h3>💔 重伤💔</h3>
                    <p style="color:#aaa">天劫反噬，你身受重伤...</p>
                    <p style="color:#ff9800;margin-top:10px">灵气大幅减少，心境下降</p>
                    <p style="color:#aaa;margin-top:10px">突破失败，但保住了性命</p>
                </div>
            `;

            addLog('bad', '渡劫重伤', `渡过${trib.desc}失败，身受重伤...`);
            saveGame();
            updateDisplay();

            setTimeout(() => {
                closeTribulationModal();
            }, 3000);
        }

        // ===== handleDeath =====
        function handleDeath() {
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];

            // 保留10%资源
            const keepStones = Math.floor(gameState.spiritStones * 0.1);
            const keepPills = gameState.inventory.filter(item =>
                item.name === '聚灵丹'
            ).slice(0, 2);

            // 重置状态
            gameState.realm = 1;
            gameState.stage = 0;
            gameState.qi = 50;
            gameState.maxQi = 100;
            gameState.spiritStones = keepStones;
            gameState.inventory = keepPills;
            gameState.mindset = 50;
            gameState.days = 1;
            gameState.cultivationProgress = 0;
            gameState.hasTransmigrationBuff = true; // 转世buff
            gameState.tribulation.inProgress = false;

            // 清空装备效果
            recalculateAllEffects();

            // 记录
            gameState.tribulationRecord.push({
                type: gameState.tribulation.tribKey,
                result: '陨落',
                day: gameState.days
            });

            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <div class="tribulation-result death">
                    <h3>💀 陨落 💀</h3>
                    <p style="color:#f44336">天劫无情，你陨落了...</p>
                    <p style="color:#aaa;margin-top:10px">但天道循环，你得以转世重修</p>
                    <p style="color:#e1bee7;margin-top:10px">保留部分资源和记忆</p>
                    <p style="color:#ffd700;margin-top:10px">获得【转世重修】加成：成功率+10%</p>
                </div>
            `;

            addLog('bad', '渡劫陨落', `渡劫失败，陨落了...但转世重修，获得转世buff！`);

            setTimeout(() => {
                closeTribulationModal();
                saveGame();
                showGameUI();
                updateDisplay();
            }, 3000);
        }

        // ===== closeTribulationModal =====
        function closeTribulationModal() {
            document.getElementById('tribulationModal').classList.remove('active');
            gameState.tribulation.inProgress = false;
        }

        // ===== cancelTribulation =====
        function cancelTribulation() {
            gameState.tribulation.inProgress = false;
            gameState.tribulation.preparations = [];
            closeTribulationModal();
            addLog('neutral', '暂缓突破', '你决定暂缓突破，继续积累实力...');
            saveGame();
        }

        // ===== getPlayerTechnique =====
        function getPlayerTechnique() {
            if (gameState.realm <= 1) return '体术';
            if (gameState.realm === 2) return ['雷法', '火法', '水法'][Math.floor(Math.random() * 3)];
            return TECHNIQUES[Math.floor(Math.random() * 4)];
        }

