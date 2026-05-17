// Auto-generated module: data.js
'use strict';

        let selectedEnhanceItem = null; // 背包中选中的待强化灵宝
        let selectedEnhanceSlot = null; // 装备栏中选中的槽位（0/1/2）
        const ULTIMATE_SKILLS = {
            '凡铁剑': [
                { id:'basic_heavy', name:'重击', cost:50, damage:2.0, effects:{}, maxLevel:5 },
                { id:'basic_quick', name:'连击', cost:40, damage:1.2, effects:{doubleHit:0.3}, maxLevel:5 },
                { id:'basic_crash', name:'碎甲', cost:60, damage:1.8, effects:{armorBreak:0.25}, maxLevel:5 }
            ],
            '青云剑': [
                { id:'qy_heavy', name:'青云重击', cost:50, damage:2.0, effects:{}, maxLevel:5 },
                { id:'qy_slash', name:'剑气纵横', cost:65, damage:2.5, effects:{cleave:0.2}, maxLevel:5 },
                { id:'qy_fly', name:'御剑术', cost:80, damage:3.2, effects:{pierce:0.15}, maxLevel:5 }
            ],
            '雷霆铛': [
                { id:'thunder_1', name:'神雷', cost:70, damage:3.0, effects:{thunder:0.5}, maxLevel:5 },
                { id:'thunder_chain', name:'雷链', cost:75, damage:2.5, effects:{chain:0.25}, maxLevel:5 },
                { id:'thunder_storm', name:'雷罚', cost:90, damage:4.0, effects:{stun:0.15}, maxLevel:5 }
            ],
            '赤炎刀': [
                { id:'fire_slash', name:'焚天斩', cost:70, damage:3.0, effects:{burn:0.5}, maxLevel:5 },
                { id:'fire_inferno', name:'烈焰焚天', cost:85, damage:3.5, effects:{burn:0.35,defBoost:0.2}, maxLevel:5 },
                { id:'fire_immortal', name:'焚尽苍穹', cost:100, damage:4.5, effects:{burn:0.5,burnTurns:5}, maxLevel:5 }
            ],
            '寒冰剑': [
                { id:'ice_slash', name:'寒冰斩', cost:70, damage:3.0, effects:{freeze:0.4}, maxLevel:5 },
                { id:'ice_prison', name:'寒冰牢笼', cost:80, damage:2.0, effects:{freeze:0.3,freezeTurns:2}, maxLevel:5 },
                { id:'ice_shatter', name:'玄冰碎裂', cost:90, damage:3.8, effects:{freeze:0.45,freezeTurns:3}, maxLevel:5 }
            ],
            '金刚杵': [
                { id:'vajra_hit', name:'金刚杵击', cost:70, damage:3.0, effects:{armorBreak:0.3}, maxLevel:5 },
                { id:'vajra_beast', name:'伏魔金身', cost:75, damage:2.2, effects:{counterRate:0.4,defBoost:0.3}, maxLevel:5 },
                { id:'vajra_smash', name:'金刚碎岳', cost:95, damage:4.2, effects:{stun:0.2,armorBreak:0.3}, maxLevel:5 }
            ],
            '混元珠': [
                { id:'hunyuan_boom', name:'混元爆发', cost:50, damage:1.5, effects:{critBonus:0.30}, maxLevel:5 },
                { id:'hunyuan_shield', name:'混元护盾', cost:60, damage:0, effects:{defBoost:0.5,dmgReduce:0.2}, maxLevel:5 },
                { id:'hunyuan_orbit', name:'混元流转', cost:70, damage:2.2, effects:{drain:0.2,healRate:0.1}, maxLevel:5 }
            ],
            '金缕衣': [
                { id:'jinroo_guard', name:'金身护体', cost:50, damage:0, effects:{defBoost:0.5,dmgReduce:0.2}, maxLevel:5 },
                { id:'jinroo_reflect', name:'金缕反伤', cost:55, damage:0.8, effects:{reflect:0.3}, maxLevel:5 },
                { id:'jinroo_blessing', name:'金仙祝福', cost:70, damage:0, effects:{healRate:0.15,maxHpBoost:0.2}, maxLevel:5 }
            ],
            '避火罩': [
                { id:'fireproof_shield', name:'烈焰护盾', cost:50, damage:0, effects:{fireResist:1.0}, maxLevel:5 },
                { id:'fireproof_counter', name:'火抗反击', cost:60, damage:1.5, effects:{counterRate:0.35,fireResist:0.5}, maxLevel:5 },
                { id:'fireproof_absorb', name:'烈焰吸收', cost:75, damage:0, effects:{fireDrain:0.4,healRate:0.12}, maxLevel:5 }
            ],
            '玄冰甲': [
                { id:'icearmor_counter', name:'玄冰反击', cost:55, damage:1.2, effects:{counterRate:0.50,freeze:0.2}, maxLevel:5 },
                { id:'icearmor_wall', name:'玄冰冰墙', cost:65, damage:0, effects:{dmgReduce:0.4,freezeAura:0.25}, maxLevel:5 },
                { id:'icearmor_shatter', name:'冰霜爆裂', cost:80, damage:2.8, effects:{freeze:0.35,freezeTurns:2}, maxLevel:5 }
            ],
            '灵玉镯': [
                { id:'jade_shield', name:'灵玉护盾', cost:60, damage:0, effects:{defBoost:0.6,dmgReduce:0.25}, maxLevel:5 },
                { id:'jade_heal', name:'灵玉治愈', cost:55, damage:0, effects:{healRate:0.2,cleanse:1}, maxLevel:5 },
                { id:'jade_curse', name:'灵玉诅咒', cost:70, damage:2.2, effects:{curse:0.3,dmgReduce:0.2}, maxLevel:5 }
            ],
            '赤炎剑': [
                { id:'redfire_slash', name:'烈焰斩', cost:60, damage:2.8, effects:{burn:0.25}, maxLevel:5 },
                { id:'redfire_storm', name:'烈焰风暴', cost:80, damage:3.5, effects:{burn:0.35,cleave:0.25}, maxLevel:5 },
                { id:'redfire_immortal', name:'焚天灭世', cost:100, damage:4.5, effects:{burn:0.5,burnTurns:4}, maxLevel:5 }
            ],
            '风灵扇': [
                { id:'wind_fan', name:'风暴降临', cost:65, damage:2.2, effects:{speedReduce:0.30}, maxLevel:5 },
                { id:'wind_blade', name:'风刃连斩', cost:75, damage:2.8, effects:{doubleHit:0.25,speedReduce:0.15}, maxLevel:5 },
                { id:'wind_tornado', name:'龙卷风暴', cost:90, damage:3.8, effects:{speedReduce:0.45,cleave:0.2}, maxLevel:5 }
            ],
            '玄铁重甲': [
                { id:'iron_guard', name:'玄铁金身', cost:65, damage:0, effects:{defBoost:0.8,dmgReduce:0.25}, maxLevel:5 },
                { id:'iron_crash', name:'玄铁冲击', cost:70, damage:2.2, effects:{armorBreak:0.3,stun:0.15}, maxLevel:5 },
                { id:'iron_ultimate', name:'金铁合鸣', cost:85, damage:3.0, effects:{counterRate:0.45,dmgReduce:0.3}, maxLevel:5 }
            ],
            '紫电锤': [
                { id:'purple_thunder', name:'雷霆万钧', cost:75, damage:3.5, effects:{thunder:0.6}, maxLevel:5 },
                { id:'purple_chain', name:'紫电神链', cost:80, damage:3.0, effects:{chain:0.35,stun:0.15}, maxLevel:5 },
                { id:'purple_divine', name:'神雷灭世', cost:100, damage:5.0, effects:{thunder:0.7,stun:0.25}, maxLevel:5 }
            ],
            '天火扇': [
                { id:'divine_fire', name:'焚天之怒', cost:70, damage:3.0, effects:{burn:0.35,burnTurns:4}, maxLevel:5 },
                { id:'divine_inferno', name:'天火灭世', cost:90, damage:4.0, effects:{burn:0.5,burnTurns:5,dmgReduce:0.2}, maxLevel:5 },
                { id:'divine_meteor', name:'流星火雨', cost:95, damage:4.2, effects:{burn:0.45,cleave:0.3}, maxLevel:5 }
            ],
            '玄冰剑': [
                { id:'ice_crystal', name:'玄冰碎裂', cost:70, damage:2.8, effects:{freeze:0.35,freezeTurns:2}, maxLevel:5 },
                { id:'ice_domain', name:'玄冰领域', cost:85, damage:3.5, effects:{freeze:0.45,freezeTurns:3,freezeAura:0.2}, maxLevel:5 },
                { id:'ice_shatter', name:'万冰穿心', cost:100, damage:4.5, effects:{freeze:0.55,freezeTurns:4}, maxLevel:5 }
            ],
            '玄武甲': [
                { id:'blackturtle_guard', name:'玄武真身', cost:70, damage:0, effects:{defBoost:1.0,dmgReduce:0.35,healRate:0.10}, maxLevel:5 },
                { id:'blackturtle_counter', name:'玄武反击', cost:75, damage:1.8, effects:{counterRate:0.5,healRate:0.12}, maxLevel:5 },
                { id:'blackturtle_immortal', name:'玄武永固', cost:90, damage:0, effects:{invincible:1,dmgReduce:0.5,healRate:0.15}, maxLevel:5 }
            ],
            '天使神剑': [
                { id:'angel_slash', name:'天使裁决', cost:80, damage:4.5, effects:{trueDamage:0.30}, maxLevel:5 },
                { id:'angel_justice', name:'神圣审判', cost:90, damage:5.0, effects:{trueDamage:0.40,healRate:0.15}, maxLevel:5 },
                { id:'angel_divine', name:'神圣灭魔斩', cost:110, damage:6.0, effects:{trueDamage:0.5,burn:0.3}, maxLevel:5 }
            ],
            '天使神甲': [
                { id:'angel_armor_guard', name:'天使守护', cost:80, damage:0, effects:{invincible:1,dmgReduce:0.50,healRate:0.15}, maxLevel:5 },
                { id:'angel_armor_holy', name:'圣光护盾', cost:70, damage:0, effects:{defBoost:0.8,healRate:0.2,cleanse:2}, maxLevel:5 },
                { id:'angel_armor_final', name:'神盾永固', cost:95, damage:0, effects:{invincible:2,dmgReduce:0.6,healRate:0.25}, maxLevel:5 }
            ],
            '天使神翼': [
                { id:'angel_wing_strike', name:'天使制裁', cost:80, damage:3.0, effects:{drain:0.30}, maxLevel:5 },
                { id:'angel_wing_judgment', name:'天堂之拳', cost:90, damage:4.5, effects:{drain:0.35,stun:0.2}, maxLevel:5 },
                { id:'angel_wing_divine', name:'神圣审判之翼', cost:105, damage:5.5, effects:{drain:0.45,trueDamage:0.25}, maxLevel:5 }
            ],
            '空手': [
                { id:'empty_qigong', name:'气功波', cost:45, damage:1.8, effects:{}, maxLevel:5 },
                { id:'empty_chi', name:'气吞天下', cost:60, damage:2.5, effects:{drain:0.15}, maxLevel:5 },
                { id:'empty_ultimate', name:'混沌元气', cost:80, damage:3.5, effects:{drain:0.25,healRate:0.1}, maxLevel:5 }
            ]
        };
        const SET_BONUSES = {
            '青云套装': {
                pieces: ['青云剑', '青云甲'],
                count: 2,
                stats: { attackPercent: 0.15, critPercent: 0.10 },
                twoPiece: '攻击+15%，暴击+10%',
                threePiece: null,
                skill: null
            }
        };
        const ACHIEVEMENTS = [
            {
                id: 'tribulation_master',
                name: '渡劫宗师',
                desc: '渡过10次天劫',
                category: 'cultivation',
                requirement: { type: 'stat', key: 'tribulationsCompleted', value: 10 },
                reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.05 },
                title: '渡劫宗师'
            },
            {
                id: 'dungeon_slayer',
                name: '秘境杀手',
                desc: '击杀10个秘境首领',
                category: 'combat',
                requirement: { type: 'stat', key: 'dungeonBossesKilled', value: 10 },
                reward: { type: 'attribute', target: 'attack', bonus: 0.03 },
                title: '秘境杀手'
            },
            {
                id: 'sect_founder',
                name: '宗门创始人',
                desc: '创建宗门',
                category: 'story',
                requirement: { type: 'stat', key: 'sectContributions', value: 1 },
                reward: { type: 'attribute', target: 'sectContribution', bonus: 0.10 },
                title: '宗门创始人'
            },
            {
                id: 'treasure_master',
                name: '炼器宗师',
                desc: '强化9星装备1件',
                category: 'collection',
                requirement: { type: 'stat', key: 'treasuresRefined', value: 1 },
                reward: { type: 'attribute', target: 'craftingSuccess', bonus: 0.05 },
                title: '炼器宗师'
            },
            {
                id: 'serendipity_finder',
                name: '天选之人',
                desc: '触发20次奇遇',
                category: 'cultivation',
                requirement: { type: 'stat', key: 'serendipitiesEncountered', value: 20 },
                reward: { type: 'attribute', target: 'serendipityRate', bonus: 0.05 },
                title: '天选之人'
            },
            {
                id: 'first_ascension',
                name: '飞升者',
                desc: '首次突破化神',
                category: 'story',
                requirement: { type: 'realm', value: 4 },
                reward: { type: 'attribute', target: 'realmSuppression', bonus: 0.10 },
                title: '飞升者'
            },
            {
                id: 'equipment_collector',
                name: '套装收藏家',
                desc: '收集全套青云套装',
                category: 'collection',
                requirement: { type: 'set', setName: '青云套装' },
                reward: { type: 'attribute', target: 'setBonus', bonus: 0.15 },
                title: '套装收藏家'
            },
            {
                id: 'flawless_tribulation',
                name: '完美渡劫',
                desc: '零消耗渡劫成功',
                category: 'special',
                requirement: { type: 'stat', key: 'flawlessTribulations', value: 1 },
                reward: { type: 'attribute', target: 'tribulationCost', bonus: -0.10 },
                title: '完美渡劫'
            }
        ];
        let combatEnergy = 0;
        const MAX_ENERGY = 100;
        function closeModal() {
            const modal = document.getElementById('eventModal');
            if (modal) modal.classList.remove('active');
        }
        const ELEMENT_HIGH_THRESHOLD = 50;
        async function testApiConfig() {
            const apiKey = document.getElementById('settingsApiKey').value.trim();
            const baseUrl = document.getElementById('settingsBaseUrl').value.trim() || 'https://api.minimaxi.com/v1';
            const model = document.getElementById('settingsModel').value.trim() || 'MiniMax-M2.7';
            if (!apiKey) {
                document.getElementById('apiKeyTestResult').textContent = '✗ 请先填写API Key';
                document.getElementById('apiKeyTestResult').className = 'test-result error';
                document.getElementById('apiKeyTestResult').style.display = 'block';
                return;
            }
            document.getElementById('apiKeyTestResult').textContent = '测试中...';
            document.getElementById('apiKeyTestResult').className = 'test-result';
            document.getElementById('apiKeyTestResult').style.display = 'block';
            try {
                const startTime = Date.now();
                const response = await fetch(`${baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        max_tokens: 20,
                        temperature: 0.8,
                        messages: [{ role: "user", content: "hi" }]
                    })
                });
                const elapsed = Date.now() - startTime;
                const data = await response.json();
                if (response.ok) {
                    document.getElementById('apiKeyTestResult').className = 'test-result success';
                    document.getElementById('apiKeyTestResult').textContent = `✓ 连接成功 (${elapsed}ms)`;
                } else {
                    document.getElementById('apiKeyTestResult').className = 'test-result error';
                    document.getElementById('apiKeyTestResult').textContent = `✗ ${data.base_resp?.status_msg || data.error?.message || '请求失败'}`;
                }
            } catch (error) {
                document.getElementById('apiKeyTestResult').className = 'test-result error';
                document.getElementById('apiKeyTestResult').textContent = `✗ ${error.message}`;
            }
        }
        async function doExplore() {
            if (!miniMaxConfig.apiKey) {
                alert('请先配置MiniMax API Key！');
                openSettings('api');
                return;
            }
            openModal('探索中...', '<div class="loading">正在生成随机事件</div>', []);
            try {
                const eventData = await generateEvent();
                displayEventModal(eventData);
            } catch (error) {
                console.error('生成事件失败:', error);
                const localEvent = getLocalRandomEvent();
                displayEventModal(localEvent);
            }
        }
        async function generateEvent() {
            const realmName = CONFIG.realms[gameState.realm];
            const stageName = CONFIG.stages[gameState.stage];
            const eventTypes = ['奇遇', '挑战', '机缘', '平静', '劫难'];
            const weights = [0.2, 0.25, 0.15, 0.3, 0.1];
            const rand = Math.random();
            let cumulative = 0;
            let eventType = '平静';
            for (let i = 0; i < weights.length; i++) {
                cumulative += weights[i];
                if (rand < cumulative) {
                    eventType = eventTypes[i];
                    break;
                }
            }
            const prompt = `你是一个修仙游戏的事件生成器。
当前玩家状态：
- 境界：${realmName}期${stageName}
- 灵气：${gameState.qi}/${gameState.maxQi}
- 灵石：${gameState.spiritStones}
- 心境：${gameState.mindset}/100
- 游戏天数：${gameState.days}
请生成一个"${eventType}"类型的修仙事件。
要求：
1. 事件标题简洁有力（4-10字）
2. 事件描述生动有趣，体现修仙世界的奇妙
3. 提供3个不同风险等级的选项（低风险/中风险/高风险）
4. 每个选项都要有明确的效果描述
请以JSON格式返回：
{
    "title": "事件标题",
    "description": "事件描述（50-100字）",
    "options": [
        {"text": "选项1描述", "risk": "low", "effects": {"qi": 10, "mindset": 5, "spiritStones": 0}},
        {"text": "选项2描述", "risk": "medium", "effects": {"qi": 30, "mindset": -10, "spiritStones": 0}},
        {"text": "选项3描述", "risk": "high", "effects": {"qi": 80, "mindset": -30, "spiritStones": 0}}
    ]
}
注意：
- 低风险选项效果较小但安全
- 高风险选项效果大但可能失败
- effects中的值可以是负数表示减少
- qi和spiritStones可以是0表示无影响
- 只返回JSON，不要其他内容`;
            const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: miniMaxConfig.model || 'MiniMax-Text-01',
                    max_tokens: 500,
                    temperature: 0.8,
                    messages: [{ role: "user", content: prompt }]
                })
            });
            if (!response.ok) {
                throw new Error('API请求失败');
            }
            const data = await response.json();
            const content = data.choices[0].message.content;
            let jsonStr = content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            return JSON.parse(jsonStr);
        }
        async function handleOption(index, option) {
            const effects = option.effects;
            gameState.qi = Math.max(0, Math.min(gameState.maxQi, gameState.qi + (effects.qi || 0)));
            gameState.mindset = Math.max(0, Math.min(100, gameState.mindset + (effects.mindset || 0)));
            gameState.spiritStones = Math.max(0, gameState.spiritStones + (effects.spiritStones || 0));
            if (gameState.mindset <= 10) {
                gameState.isGameOver = true;
                gameState.isVictory = false;
                addLog('bad', '心境崩溃', '心境过低，走火入魔...');
                saveGame();
                closeModal();
                showGameOverScreen();
                return;
            }
            if (gameState.realm === 1 && gameState.cultivationProgress >= REALM_REQUIREMENTS[1].stageThreshold[2]) {
                if (Math.random() < 0.3) {
                    await handleTribulation();
                }
            }
            let resultTitle = '结果';
            let resultText = '';
            if (effects.qi > 0) resultText += `灵气 +${effects.qi} `;
            if (effects.qi < 0) resultText += `灵气 ${effects.qi} `;
            if (effects.mindset > 0) resultText += `心境 +${effects.mindset} `;
            if (effects.mindset < 0) resultText += `心境 ${effects.mindset} `;
            if (effects.spiritStones > 0) resultText += `灵石 +${effects.spiritStones} `;
            if (effects.spiritStones < 0) resultText += `灵石 ${effects.spiritStones} `;
            if (!resultText) resultText = '没有变化';
            addLog(effects.qi >= 0 && effects.mindset >= 0 ? 'good' : 'bad', option.text, resultText);
            // V29 NPC AI 每日任务处理
            if (gameState.sect && gameState.sect.name) {
                processNpcTasks();
                processNpcAutoBehavior();
            }
            gameState.days++;
            if (gameState.spiritStones < 500) {
                const bonusStones = Math.floor(gameState.realm * 50 * Math.random());
                if (bonusStones > 0) {
                    gameState.spiritStones += bonusStones;
                    addLog('good', '意外收获', `探索途中发现散落的灵石，获得${bonusStones}灵石`);
                }
            }
            saveGame();
            updateDisplay();
            document.getElementById('modalResult').innerHTML = `
                <div class="result-title">${resultTitle}</div>
                <p>${resultText}</p>
            `;
            document.getElementById('modalResult').classList.remove('hidden');
            document.getElementById('modalOptions').classList.add('hidden');
        }
        async function handleTribulation() {
            let survivalChance = gameState.mindset / 100;
            survivalChance *= (1 + getSpiritRootTribulationBonus());
            if (gameState.activeEffects.constitution_bonuses && gameState.activeEffects.constitution_bonuses.damageReduce) {
                survivalChance *= (1 + gameState.activeEffects.constitution_bonuses.damageReduce * 0.5);
            }
            survivalChance *= (1 + gameState.activeEffects.渡劫_mindset_protect);
            survivalChance *= (1 + gameState.activeEffects.all_stats);
            // V30 审批祝福buff
            const approvalBuff = gameState.activeEffects.tribulation_approval_buff || 0;
            survivalChance *= (1 + approvalBuff);
            if (Math.random() < survivalChance) {
                addLog('good', '渡劫成功', '天雷降临，你成功渡过天劫，修为大涨！');
                gameState.cultivationProgress = 0;
                gameState.stage = 0;
                const oldRealm = gameState.realm;
                gameState.realm = Math.min(4, gameState.realm + 1);
                gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
                gameState.qi = Math.floor(gameState.qi / 2);
                initializeConstitutionEffects();
                if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {} };
                gameState.achievements.stats.tribulationsCompleted++;
                if (gameState.tribulation && gameState.tribulation.damageTaken === 0) {
                    gameState.achievements.stats.flawlessTribulations++;
                }
                checkAchievements();
            } else {
                const damageReduction = gameState.activeEffects.渡劫_damage_reduce + gameState.activeEffects.all_stats;
                const qiLoss = Math.floor(gameState.qi * (0.8 * (1 - damageReduction)));
                const mindsetLoss = Math.floor(30 * (1 - gameState.activeEffects.渡劫_mindset_protect));
                addLog('bad', '渡劫失败', `天雷过于猛烈，你重伤垂死...`);
                gameState.qi = Math.max(0, gameState.qi - qiLoss);
                gameState.mindset = Math.max(0, gameState.mindset - mindsetLoss);
                if (survivalChance < 0.3 && gameState.realm > 0) {
                    const oldRealm = gameState.realm;
                    gameState.realm = Math.max(0, gameState.realm - 1);
                    gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
                    gameState.qi = Math.floor(gameState.qi * 0.3);
                    gameState.cultivationProgress = 0;
                    gameState.stage = 0;
                    addLog('bad', '境界倒退', `💔 天劫反噬过重，从${CONFIG.realms[oldRealm]}期跌落到${CONFIG.realms[gameState.realm]}期！`);
                }
            }
        }
        async function tryBreakthrough() {
            const req = REALM_REQUIREMENTS[gameState.realm];
            if (gameState.cultivationProgress < req.stageThreshold[2]) {
                alert('境界尚未圆满，无法突破！');
                return;
            }
            if (gameState.qi < req.breakthroughQi) {
                alert('灵气不足，无法突破！');
                return;
            }
            if (gameState.realm >= 3) {
                // V30 渡劫审批检查
                if (gameState.sect && gameState.sect.tribulationRequest) {
                    const req = gameState.sect.tribulationRequest;
                    if (req.status !== 'approved') {
                        openTribulationRequest();
                        return;
                    }
                    // 审批通过，应用buff
                    const approvalBuff = getTribulationApprovalBuff();
                    if (approvalBuff > 0) {
                        gameState.activeEffects.tribulation_approval_buff = approvalBuff;
                    }
                }
                const tribKey = getTribulationKey(gameState.realm, gameState.stage);
                gameState.tribulation = {
                    inProgress: true,
                    currentStage: 0,
                    totalStages: TRIBULATIONS[tribKey].stages,
                    currentType: TRIBULATIONS[tribKey].type,
                    preparations: [],
                    damageTaken: 0,
                    tribKey: tribKey
                };
                showTribulationUI();
                return;
            }
            if (!miniMaxConfig.apiKey) {
                localBreakthrough(false);
                return;
            }
            openModal('突破中...', '<div class="loading">正在生成突破描述</div>', []);
            try {
                const result = await generateBreakthroughResult();
                displayBreakthroughResult(result, false);
            } catch (error) {
                console.error('突破描述生成失败:', error);
                localBreakthrough(false);
            }
        }
async function generateBreakthroughResult() {
            const nextRealm = CONFIG.realms[Math.min(4, gameState.realm + 1)];
            const currentRealm = CONFIG.realms[gameState.realm];
            const prompt = `你是一个修仙游戏的突破场景描述器。
当前玩家状态：
- 当前境界：${currentRealm}期
- 目标境界：${nextRealm}期
- 灵气：${gameState.qi}/${gameState.maxQi}
- 心境：${gameState.mindset}/100
请生成一段突破时的场景描述，包括：
1. 天象变化（雷云、灵气漩涡等）
2. 身体的剧烈变化
3. 成功或失败的描述
请以JSON格式返回：
{
    "success": true或false,
    "title": "突破标题",
    "description": "详细描述（80-150字）"
}`;
            const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: miniMaxConfig.model || 'MiniMax-Text-01',
                    max_tokens: 300,
                    temperature: 0.8,
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const data = await response.json();
            const content = data.choices[0].message.content;
            let jsonStr = content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            return JSON.parse(jsonStr);
        }
        init();
        let currentInvTab = 'all';
        let selectedInvItem = null;
        async function generateShopIntro() {
            if (!miniMaxConfig.apiKey) return;
            try {
                const realmName = CONFIG.realms[gameState.realm];
                const prompt = `你是一个修仙世界的商店掌柜。请为"天机阁"生成一段简短的问候语（20-40字），要符合当前境界的修士。掌柜语气要亲切但不啰嗦。当前修士是${realmName}期修士。只返回问候语，不要其他内容。`;
                const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                    },
                    body: JSON.stringify({
                        model: miniMaxConfig.model || 'MiniMax-Text-01',
                        max_tokens: 100,
                        temperature: 0.8,
                        messages: [{ role: "user", content: prompt }]
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    const intro = data.choices[0].message.content.trim();
                    document.getElementById('shopIntro').textContent = intro;
                }
            } catch (error) {
                console.log('生成商店开场白失败，使用默认');
            }
        }
        let selectedCraftType = 'alchemy'; // 'alchemy' or 'forge'
        let selectedRecipeName = null;
        async function doCraft(name) {
            const recipes = selectedCraftType === 'alchemy' ? ALCHEMY_RECIPES : FORGE_RECIPES;
            const recipe = recipes[name];
            if (!recipe) return;
            if (recipe.materials['灵石']) {
                gameState.spiritStones -= recipe.materials['灵石'];
            }
            gameState.spiritStones -= recipe.fuelCost;
            for (const [mat, qty] of Object.entries(recipe.materials)) {
                if (mat === '灵石') continue;
                const item = gameState.inventory.find(i => i.name === mat);
                if (item) {
                    item.quantity -= qty;
                    if (item.quantity <= 0) {
                        gameState.inventory = gameState.inventory.filter(i => i !== item);
                    }
                }
            }
            // V29 NPC AI 每日任务处理
            if (gameState.sect && gameState.sect.name) {
                processNpcTasks();
                processNpcAutoBehavior();
            }
            gameState.days++;
            document.getElementById('alchemyDetail').style.display = 'none';
            const resultDiv = document.getElementById('alchemyResult');
            resultDiv.style.display = 'block';
            const craftType = selectedCraftType === 'alchemy' ? '炼丹' : '炼器';
            let craftDesc = `丹炉中灵光闪烁，药香四溢...`;
            if (miniMaxConfig.apiKey) {
                try {
                    const prompt = `描述一次${craftType}过程，物品名称是${name}，用50-80字描述${craftType}时的情景，包括火候、灵气变化等。`;
                    const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                        },
                        body: JSON.stringify({
                            model: miniMaxConfig.model || 'MiniMax-Text-01',
                            max_tokens: 150,
                            temperature: 0.8,
                            messages: [{ role: "user", content: prompt }]
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        craftDesc = data.choices[0].message.content.trim();
                    }
                } catch (error) {
                    craftDesc = `丹炉中灵光闪烁，药香四溢...`;
                }
            }
            const furnace = selectedCraftType === 'alchemy' ? FURNACES : ANVILS;
            const currentLevel = gameState.crafting[selectedCraftType === 'alchemy' ? 'furnace' : 'anvil'].level;
            const furnaceData = Object.values(furnace).find(f => f.level === currentLevel);
            const furnaceBonus = furnaceData ? furnaceData.successBonus : 0;
            const totalSuccessRate = Math.min(0.95, recipe.successRate + furnaceBonus);
            const roll = Math.random();
            if (roll < totalSuccessRate) {
                if (selectedCraftType === 'alchemy') {
                    addToInventory('pill', name, 1, getRecipeQuality(name), getPillEffect(name), recipe.desc, recipe.icon);
                } else {
                    addToInventory('treasure', name, 1, getRecipeQuality(name), recipe.effect, recipe.desc, recipe.icon);
                }
                resultDiv.innerHTML = `
                    <div class="result-success">🎉 ${craftType}成功！</div>
                    <p style="margin-top:10px;color:#aaa">${craftDesc}</p>
                    <p style="margin-top:10px;color:#ffd700">获得${name}×1，已放入背包</p>
                `;
                addLog('good', `${craftType}成功`, `成功${craftType === '炼丹' ? '炼制' : '锻造'}了${name}`);
            } else {
                returnCraftMaterials(recipe.materials, 0.5);
                resultDiv.innerHTML = `
                    <div class="result-fail">💔 ${craftType}失败...</div>
                    <p style="margin-top:10px;color:#aaa">${craftDesc}</p>
                    <p style="margin-top:10px;color:#888">材料损毁，返还50%材料</p>
                `;
                addLog('bad', `${craftType}失败`, `${craftType === '炼丹' ? '炼制' : '锻造'}${name}失败`);
            }
            saveGame();
            updateDisplay();
            setTimeout(() => {
                document.getElementById('alchemyResult').style.display = 'none';
                renderCraftingRecipes();
            }, 3000);
        }
        let selectedMarketItem = null;
        async function startTribulation() {
            const tribKey = gameState.tribulation.tribKey;
            const trib = TRIBULATIONS[tribKey];
            if (trib.type === 'demon') {
                await handleDemonTribulation();
                return;
            }
            if (!miniMaxConfig.apiKey) {
                executeTribulation();
                return;
            }
            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `<div class="loading" style="color:#ffd700">天劫降临中...</div>`;
            try {
                const desc = await generateTribulationDesc(tribKey);
                scene.innerHTML = `<p style="color:#ffd700;font-size:1.2em">${desc}</p>`;
                setTimeout(() => executeTribulation(), 2000);
            } catch (error) {
                console.error('生成渡劫描述失败:', error);
                executeTribulation();
            }
        }
        async function generateTribulationDesc(tribKey) {
            const trib = TRIBULATIONS[tribKey];
            return new Promise((resolve) => {
                generateTribulationScene(gameState.realm, (sceneDesc) => {
                    resolve(sceneDesc || trib.desc);
                });
            });
        }
        async function handleDemonTribulation() {
            const demonDamage = 20 * (gameState.tribulation.currentStage + 1);
            const preps = gameState.tribulation.preparations;
            if (preps.includes('定神丹')) {
                gameState.mindset = Math.max(0, gameState.mindset - Math.floor(demonDamage * 0.5));
            } else {
                gameState.mindset = Math.max(0, gameState.mindset - demonDamage);
            }
            gameState.tribulation.currentStage++;
            gameState.tribulation.damageTaken += demonDamage;
            const scene = document.getElementById('tribulationScene');
            scene.innerHTML = `
                <p style="color:#ff00ff;font-size:1.1em">心魔入侵！</p>
                <p style="color:#aaa;margin-top:10px">心境 -${demonDamage}${preps.includes('定神丹') ? '(定神丹减免)' : ''}</p>
                <p style="color:#ffd700;margin-top:10px">当前心境：${gameState.mindset}/100</p>
            `;
            saveGame();
            if (gameState.mindset <= 0) {
                gameState.mindset = 0;
                setTimeout(() => handleInjury(), 1500);
            } else if (gameState.tribulation.currentStage >= gameState.tribulation.totalStages) {
                setTimeout(() => handleSuccess(), 1500);
            } else {
                setTimeout(() => showTribulationUI(), 1500);
            }
        }
        const TECHNIQUES = ['雷法', '火法', '水法', '体术'];
        const FIXED_OPPONENTS = [
            { name: '青云子', avatar: '👴', baseRealm: 2 },
            { name: '赤焰仙', avatar: '👩‍🦰', baseRealm: 2 },
            { name: '寒冰仙子', avatar: '👸', baseRealm: 3 },
            { name: '金刚罗汉', avatar: '💪', baseRealm: 3 },
            { name: '雷霆真君', avatar: '👨‍🔬', baseRealm: 4 }
        ];
        const CONTRIBUTION_SHOP_ITEMS = [
            { name: '灵阶功法·灵根培育法', cost: 500, type: 'technique', data: '灵根培育法' },
            { name: '天阶功法·金刚炼体术', cost: 2000, type: 'technique', data: '金刚炼体术' },
            { name: '上品筑基丹', cost: 300, type: 'pill', data: '筑基丹', quantity: 1 },
            { name: '破境丹', cost: 800, type: 'pill', data: '破境丹', quantity: 1 },
            { name: '宗门特权·双倍修炼', cost: 1000, type: 'buff', data: 'double_cultivate', duration: 7 }
        ];
        // ===== getStarDisplay =====
        function getStarDisplay(star) {
            if (!star || star <= 1) return '';
            let s = '★';
            if (star >= 3) s = '★★';
            if (star >= 5) s = '★★★';
            if (star >= 7) s = '✦★★★';
            if (star >= 9) s = '✦✦★★★';
            return s;
        }

        // ===== getStarColor =====
        function getStarColor(star) {
            if (star >= 8) return '#ffd700';
            if (star >= 5) return '#ba68c8';
            if (star >= 3) return '#64b5f6';
            return '#aaaaaa';
        }

        // ===== getEnhanceCost =====
        function getEnhanceCost(currentStar) {
            const next = currentStar + 1;
            if (next > 9) return null;
            return ENHANCE_CONFIG.costs[next];
        }

        // ===== checkEnhanceMaterials =====
        function checkEnhanceMaterials(cost) {
            if (!cost) return false;
            if (gameState.spiritStones < cost.stones) return false;
            if (cost.iron > 0) {
                const ironItem = gameState.inventory.find(i => i.name === '玄铁' && i.quantity >= cost.iron);
                if (!ironItem) return false;
            }
            if (cost.heavenly > 0) {
                const heavItem = gameState.inventory.find(i => i.name === '天材' && i.quantity >= cost.heavenly);
                if (!heavItem) return false;
            }
            if (cost.chaos > 0) {
                const chaosItem = gameState.inventory.find(i => i.name === '混沌石' && i.quantity >= cost.chaos);
                if (!chaosItem) return false;
            }
            return true;
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

        // ===== openEnhanceFromEquip =====
        function openEnhanceFromEquip(slotIndex) {
            const treasure = gameState.equippedTreasures[slotIndex];
            if (!treasure) return;
            selectedEnhanceSlot = slotIndex;
            selectedEnhanceItem = { source: 'equip', idx: slotIndex, item: treasure };
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

        // ===== closeEnhancePanel =====
        function closeEnhancePanel() {
            const panel = document.getElementById('enhancePanel');
            const overlay = document.getElementById('enhanceOverlay');
            if (panel) panel.remove();
            if (overlay) overlay.remove();
            selectedEnhanceItem = null;
            selectedEnhanceSlot = null;
        }

        // ===== getBaseEffectValue =====
        function getBaseEffectValue(item) {
            if (!item || !item.effect) return 0;
            const eff = item.effect;
            // 兼容两种格式
            return eff.value || eff.attackBonus || eff.defenseBonus || eff.critBonus || eff.hpBonus || eff.thunderBonus || eff.fireBonus || eff.waterBonus || eff.bodyBonus || 0;
        }

        // ===== doEnhance =====
        function doEnhance() {
            if (!selectedEnhanceItem) return;
            const { source, idx, item } = selectedEnhanceItem;
            const star = item.star || 1;
            const cost = getEnhanceCost(star);
            if (!cost) return;

            // 扣材料
            gameState.spiritStones -= cost.stones;
            if (cost.iron > 0) {
                const ironItem = gameState.inventory.find(i => i.name === '玄铁');
                if (ironItem) ironItem.quantity -= cost.iron;
            }
            if (cost.heavenly > 0) {
                const heavItem = gameState.inventory.find(i => i.name === '天材');
                if (heavItem) heavItem.quantity -= cost.heavenly;
            }
            if (cost.chaos > 0) {
                const chaosItem = gameState.inventory.find(i => i.name === '混沌石');
                if (chaosItem) chaosItem.quantity -= cost.chaos;
            }

            // 成功率判定
            const baseRate = ENHANCE_CONFIG.successRates[star] || 0.5;
            const anvilLevel = gameState.crafting.anvil.level;
            const furnaceData = Object.values(ANVILS).find(a => a.level === anvilLevel);
            const furnaceBonus = furnaceData ? furnaceData.successBonus : 0;
            const totalRate = Math.min(0.95, baseRate + furnaceBonus);
            const success = Math.random() < totalRate;

            const newStar = success ? star + 1 : star;

            // 更新装备星级
            if (source === 'equip') {
                gameState.equippedTreasures[idx].star = newStar;
            } else {
                const invIdx = gameState.inventory.findIndex(i => i.name === item.name && i.type === 'treasure');
                if (invIdx !== -1) {
                    gameState.inventory[invIdx].star = newStar;
                }
            }

            // 日志
            if (success) {
                addLog('good', '强化成功', `${item.name}强化至${newStar}星！属性大幅提升！`);

                // A5 成就检查 - 强化9星装备成功
                if (star === 9 && newStar === 10) {
                    if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {} };
                    gameState.achievements.stats.treasuresRefined++;
                    checkAchievements();
                }
            } else {
                addLog('negative', '强化失败', `${item.name}强化失败，材料化为乌有...`);
            }

            saveGame();
            recalculateAllEffects();
            updateEquipmentBar();
            updateDisplay();
            closeEnhancePanel();
        }

        // ===== showUltimateSkillPanel =====
        function showUltimateSkillPanel() {
            const weaponData = combatState.player.weaponData || { name:'空手' };
            const skills = ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
            if (!skills || skills.length === 0) {
                addCombatLog('当前武器没有可用的绝技');
                return;
            }
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;max-height:350px;overflow-y:auto;">';
            html += '<b style="color:#ffd700;font-size:14px;">⚡选择绝技</b><br><br>';
            skills.forEach((skill, idx) => {
                const level = combatState.player.skillLevels ? (combatState.player.skillLevels[skill.id] || 1) : 1;
                const maxed = level >= skill.maxLevel;
                const canUse = combatEnergy >= skill.cost;
                const color = canUse ? '#00ff88' : '#666';
                const upgradeCost = maxed ? null : getSkillUpgradeCost(level);
                html += `<div style="margin-bottom:10px;padding:8px;background:#252540;border-radius:6px;cursor:${canUse?'pointer':'not-allowed'};opacity:${canUse?1:0.6};" onclick="${canUse ? `selectUltimateSkill(${idx})` : ''}">`;
                html += `<div style="display:flex;justify-content:space-between;">`;
                html += `<span style="color:${color};font-size:13px;">${skill.name}</span>`;
                html += `<span style="color:#888;font-size:11px;">Lv.${level}${maxed?' <span style="color:#ffd700;">MAX</span>':''}</span>`;
                html += `</div>`;
                html += `<div style="color:#aaa;font-size:11px;margin-top:4px;">`;
                html += `消耗: ${skill.cost}能量 | 伤害: ×${(skill.damage * (1 + (level-1)*0.2)).toFixed(1)}`;
                if (skill.effects && Object.keys(skill.effects).length > 0) {
                    const effNames = Object.keys(skill.effects).join('/');
                    html += ` | 效果: ${effNames}`;
                }
                html += `</div>`;
                if (!maxed) {
                    html += `<div style="color:#888;font-size:10px;margin-top:3px;">升级(${level}→${level+1}): ${upgradeCost.text}</div>`;
                    html += `<button onclick="event.stopPropagation();upgradeUltimateSkill('${skill.id}')" style="margin-top:4px;padding:3px 10px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;font-size:10px;">升级</button>`;
                }
                html += `</div>`;
            });
            html += '<button onclick="closeModal()" style="margin-top:8px;padding:6px 16px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">返回</button>';
            html += '</div>';
            showModal(html);
        }

        // ===== getSkillUpgradeCost =====
        function getSkillUpgradeCost(level) {
            const materials = [
                { text:'100灵石', cost:100 },
                { text:'300灵石+1天材', cost:300, tiancai:1 },
                { text:'800灵石+1混沌石', cost:800, hunyuan:1 },
                { text:'2000灵石+1混沌石', cost:2000, hunyuan:1 },
                { text:'5000灵石+2混沌石', cost:5000, hunyuan:2 }
            ];
            return materials[Math.min(level, materials.length-1)];
        }

        // ===== upgradeUltimateSkill =====
        function upgradeUltimateSkill(skillId) {
            const weaponData = combatState.player.weaponData || { name:'空手' };
            const skills = ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
            const skill = skills.find(s => s.id === skillId);
            if (!skill) return;
            const level = combatState.player.skillLevels ? (combatState.player.skillLevels[skillId] || 1) : 1;
            if (level >= skill.maxLevel) return;
            const upgradeInfo = getSkillUpgradeCost(level);
            // 检查灵石
            if ((gameState.stones || 0) < upgradeInfo.cost) {
                addCombatLog(`升级${skill.name}需要${upgradeInfo.text}，灵石不足！`);
                return;
            }
            // 检查天材/混沌石
            if (upgradeInfo.tiancai && (gameState.materials['天材'] || 0) < upgradeInfo.tiancai) {
                addCombatLog(`升级${skill.name}需要${upgradeInfo.text}，天材不足！`);
                return;
            }
            if (upgradeInfo.hunyuan && (gameState.materials['混沌石'] || 0) < upgradeInfo.hunyuan) {
                addCombatLog(`升级${skill.name}需要${upgradeInfo.text}，混沌石不足！`);
                return;
            }
            // 扣除并升级
            gameState.stones -= upgradeInfo.cost;
            if (upgradeInfo.tiancai) gameState.materials['天材'] -= upgradeInfo.tiancai;
            if (upgradeInfo.hunyuan) gameState.materials['混沌石'] -= upgradeInfo.hunyuan;
            if (!combatState.player.skillLevels) combatState.player.skillLevels = {};
            combatState.player.skillLevels[skillId] = level + 1;
            addCombatLog(`⚡ ${skill.name} 升级到 Lv.${level+1}！`);
            if (typeof refreshInventoryUI === 'function') refreshInventoryUI();
            showUltimateSkillPanel();
        }

        // ===== selectUltimateSkill =====
        function selectUltimateSkill(idx) {
            const weaponData = combatState.player.weaponData || { name:'空手' };
            const skills = ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
            const skill = skills[idx];
            if (!skill || combatEnergy < skill.cost) return;
            executeUltimateSkill(skill);
            closeModal();
        }

        // ===== addEnergy =====
        function addEnergy(amount) {
            combatEnergy = Math.min(MAX_ENERGY, combatEnergy + amount);
        }

        // ===== openSettings =====
        function openSettings() {
            // 填充当前配置
            document.getElementById('settingsApiKey').value = miniMaxConfig.apiKey || '';
            document.getElementById('settingsBaseUrl').value = miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1';
            document.getElementById('settingsModel').value = miniMaxConfig.model || 'MiniMax-M2.7';
            document.getElementById('featureAiDialogue').checked = miniMaxConfig.features.aiDialogue || false;
            document.getElementById('featureAiSerendipity').checked = miniMaxConfig.features.aiSerendipity || false;
            document.getElementById('featureAiTechnique').checked = miniMaxConfig.features.aiTechnique || false;
            
            // 清除测试结果
            document.querySelectorAll('.test-result').forEach(el => {
                el.className = 'test-result';
                el.style.display = 'none';
            });
            
            // 显示面板
            document.getElementById('settingsModal').classList.add('active');
        }

        // ===== closeSettings =====
        function closeSettings() {
            document.getElementById('settingsModal').classList.remove('active');
        }

        // ===== switchSettingsTab =====
        function switchSettingsTab(tab) {
            document.querySelectorAll('.settings-nav-item').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.settings-section').forEach(el => el.classList.remove('active'));
            document.querySelector(`.settings-nav-item[onclick="switchSettingsTab('${tab}')"]`).classList.add('active');
            document.getElementById(`settings${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
        }

        // ===== saveSettings =====
        function saveSettings() {
            miniMaxConfig.apiKey = document.getElementById('settingsApiKey').value.trim();
            miniMaxConfig.baseUrl = document.getElementById('settingsBaseUrl').value.trim() || 'https://api.minimaxi.com/v1';
            miniMaxConfig.model = document.getElementById('settingsModel').value.trim() || 'MiniMax-M2.7';
            miniMaxConfig.features.aiDialogue = document.getElementById('featureAiDialogue').checked;
            miniMaxConfig.features.aiSerendipity = document.getElementById('featureAiSerendipity').checked;
            miniMaxConfig.features.aiTechnique = document.getElementById('featureAiTechnique').checked;
            
            localStorage.setItem(CONFIG.miniMaxConfigKey, JSON.stringify(miniMaxConfig));
            
            // 更新CONFIG中的apiUrl
            CONFIG.apiUrl = miniMaxConfig.baseUrl + '/chat/completions';
            
            closeSettings();
            addLog('good', '设置', '配置已保存！');
        }

        // ===== resetSettings =====
        function resetSettings() {
            miniMaxConfig = { ...DEFAULT_MINIMAX_CONFIG };
            document.getElementById('settingsApiKey').value = '';
            document.getElementById('settingsBaseUrl').value = DEFAULT_MINIMAX_CONFIG.baseUrl;
            document.getElementById('settingsModel').value = DEFAULT_MINIMAX_CONFIG.model;
            document.getElementById('featureAiDialogue').checked = false;
            document.getElementById('featureAiSerendipity').checked = false;
            document.getElementById('featureAiTechnique').checked = false;
            
            // 清除测试结果
            document.querySelectorAll('.test-result').forEach(el => {
                el.className = 'test-result';
                el.style.display = 'none';
            });
        }

        // ===== callMiniMaxAPI =====
        function callMiniMaxAPI(prompt, model, maxTokens, successCallback, errorCallback) {
            if (!miniMaxConfig.apiKey) {
                if (errorCallback) errorCallback('API未配置');
                return;
            }
            
            const apiUrl = (miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1').replace(/\/$/, '') + '/chat/completions';
            
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + miniMaxConfig.apiKey
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: maxTokens,
                    temperature: 0.8
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                    successCallback(data.choices[0].message.content);
                } else if (data.error) {
                    if (errorCallback) errorCallback(data.error.message || 'API错误');
                } else {
                    if (errorCallback) errorCallback('返回格式错误');
                }
            })
            .catch(e => {
                if (errorCallback) errorCallback(e.message);
            });
        }

        // ===== showGameOverScreen =====
        function showGameOverScreen() {
            document.getElementById('startScreen').classList.remove('hidden');
            document.getElementById('gameStats').classList.add('hidden');
            document.getElementById('cultivationProgress').classList.add('hidden');
            document.getElementById('equipmentBar').classList.add('hidden');
            document.getElementById('gameButtons').classList.add('hidden');
            document.getElementById('eventLog').classList.add('hidden');
            
            let html = '<div class="game-over">';
            if (gameState.isVictory) {
                html += `<h2 class="victory">🎉 飞升成功！🎉</h2>
                         <p>历经${gameState.days}天，你终于突破化神期，白日飞升！</p>`;
            } else {
                html += `<h2 class="defeat">💀 陨落 💀</h2>
                         <p>修仙之路充满危险，你在第${gameState.days}天陨落...</p>`;
            }
            html += '<button class="btn btn-new" onclick="startNewGame()">重新开始</button></div>';
            document.getElementById('startScreen').innerHTML = html;
        }

        // ===== generateRandomSpiritRoot =====
        function generateRandomSpiritRoot() {
            const rand = Math.random() * 100;
            let cumulative = 0;
            let selectedQuality = '中品灵根';
            
            for (const [quality, data] of Object.entries(SPIRIT_ROOT_QUALITIES)) {
                cumulative += data.weight;
                if (rand < cumulative) {
                    selectedQuality = quality;
                    break;
                }
            }
            
            // 生成随机五行亲和
            const affinity = {
                metal: Math.floor(Math.random() * 40) + 10,
                wood: Math.floor(Math.random() * 40) + 10,
                water: Math.floor(Math.random() * 40) + 10,
                fire: Math.floor(Math.random() * 40) + 10,
                earth: Math.floor(Math.random() * 40) + 10
            };
            
            // 计算总点数并归一化
            const total = affinity.metal + affinity.wood + affinity.water + affinity.fire + affinity.earth;
            const scale = 100 / total;
            for (const el in affinity) {
                affinity[el] = Math.floor(affinity[el] * scale);
            }
            
            // 随机共鸣度 0-10
            const resonance = Math.floor(Math.random() * 11);
            
            return {
                quality: selectedQuality,
                affinity: affinity,
                resonance: resonance,
                lastRefreshDay: 0
            };
        }

        // ===== getSpiritRootSpeedBonus =====
        function getSpiritRootSpeedBonus() {
            const quality = gameState.spiritRoot.quality;
            return SPIRIT_ROOT_QUALITIES[quality].speedBonus;
        }

        // ===== getSpiritRootBottleneckBonus =====
        function getSpiritRootBottleneckBonus() {
            const quality = gameState.spiritRoot.quality;
            return SPIRIT_ROOT_QUALITIES[quality].bottleneckBonus;
        }

        // ===== getSpiritRootTribulationBonus =====
        function getSpiritRootTribulationBonus() {
            const quality = gameState.spiritRoot.quality;
            return SPIRIT_ROOT_QUALITIES[quality].tribulationBonus;
        }

        // ===== getFiveElementBonus =====
        function getFiveElementBonus(element) {
            const affinity = gameState.spiritRoot.affinity[element.toLowerCase()];
            if (!affinity) return 0;
            
            const tech = FIVE_ELEMENT_TECHNIQUES[element];
            if (!tech) return 0;
            
            if (affinity >= tech.threshold) {
                return tech.bonusValue;
            }
            return 0;
        }

        // ===== getHighestElementBonus =====
        function getHighestElementBonus() {
            let best = null;
            let bestValue = 0;
            
            for (const [element, tech] of Object.entries(FIVE_ELEMENT_TECHNIQUES)) {
                const affinity = gameState.spiritRoot.affinity[element.toLowerCase()];
                if (affinity >= tech.threshold && tech.bonusValue > bestValue) {
                    best = element;
                    bestValue = tech.bonusValue;
                }
            }
            
            return best ? { element: best, technique: FIVE_ELEMENT_TECHNIQUES[best], affinity: gameState.spiritRoot.affinity[best.toLowerCase()] } : null;
        }

        // ===== refreshSpiritRoot =====
        function refreshSpiritRoot(withChaos = false) {
            const cost = withChaos ? 50000 : 10000;
            
            if (gameState.spiritStones < cost) {
                alert(`灵石不足！需要 ${cost} 灵石`);
                return;
            }
            
            if (withChaos && gameState.realm < 4) {
                alert('需要化神期才能使用混沌丹！');
                return;
            }
            
            if (withChaos) {
                // 混沌丹保底混沌灵根
                gameState.spiritRoot = {
                    quality: '混沌灵根',
                    affinity: {
                        metal: 20, wood: 20, water: 20, fire: 20, earth: 20
                    },
                    resonance: 10,
                    lastRefreshDay: gameState.days
                };
            } else {
                gameState.spiritRoot = generateRandomSpiritRoot();
                gameState.spiritRoot.lastRefreshDay = gameState.days;
            }
            
            gameState.spiritStones -= cost;
            
            // 重新初始化体质效果
            initializeConstitutionEffects();
            
            addLog('good', '灵根重塑', `使用${withChaos ? '混沌丹' : '洗髓丹'}重塑灵根，新的灵根为：${gameState.spiritRoot.quality}！`);
            
            closeSpiritRootModal();
            updateDisplay();
            saveGame();
        }

        // ===== initializeConstitutionEffects =====
        function initializeConstitutionEffects() {
            // 重置所有体质相关效果
            if (!gameState.activeEffects.constitution_bonuses) {
                gameState.activeEffects.constitution_bonuses = {};
            }
            
            // 检查并激活符合条件的体质
            for (const [name, data] of Object.entries(CONSTITUTIONS)) {
                const existing = gameState.constitutions.find(c => c.type === name);
                
                // 检查是否应该激活
                if (data.trigger(gameState)) {
                    if (!existing) {
                        // 新激活体质
                        if (gameState.constitutions.length >= 2) {
                            // 超过2个体质，替换最弱的
                            const weakest = findWeakestConstitution();
                            if (weakest) {
                                gameState.constitutions = gameState.constitutions.filter(c => c.type !== weakest);
                            }
                        }
                        gameState.constitutions.push({
                            type: name,
                            active: true,
                            acquiredAt: gameState.days
                        });
                        addLog('good', '体质觉醒', `你的${name}觉醒了！效果：${data.desc}`);
                    }
                }
            }
            
            // 应用体质效果到activeEffects
            recalculateConstitutionEffects();
        }

        // ===== findWeakestConstitution =====
        function findWeakestConstitution() {
            if (gameState.constitutions.length === 0) return null;
            
            let weakest = null;
            let weakestPower = Infinity;
            
            for (const c of gameState.constitutions) {
                const data = CONSTITUTIONS[c.type];
                let power = 0;
                for (const v of Object.values(data.effect)) {
                    power += typeof v === 'number' ? v : 0;
                }
                if (power < weakestPower) {
                    weakestPower = power;
                    weakest = c.type;
                }
            }
            
            return weakest;
        }

        // ===== recalculateConstitutionEffects =====
        function recalculateConstitutionEffects() {
            // 重置体质加成
            gameState.activeEffects.constitution_bonuses = {
                attack: 0,
                defense: 0,
                cultivateSpeed: 0,
                crit: 0,
                dodge: 0,
                damageReduce: 0,
                waterBonus: 0,
                fireBonus: 0,
                hpBonus: 0,
                lethalImmune: 0,
                firstStrike: 0
            };
            
            // 应用激活的体质效果
            for (const c of gameState.constitutions) {
                if (!c.active) continue;
                const data = CONSTITUTIONS[c.type];
                if (!data) continue;
                
                const effects = data.effect;
                if (effects.attack) gameState.activeEffects.constitution_bonuses.attack += effects.attack;
                if (effects.defense) gameState.activeEffects.constitution_bonuses.defense += effects.defense;
                if (effects.cultivateSpeed) gameState.activeEffects.constitution_bonuses.cultivateSpeed += effects.cultivateSpeed;
                if (effects.crit) gameState.activeEffects.constitution_bonuses.crit += effects.crit;
                if (effects.dodge) gameState.activeEffects.constitution_bonuses.dodge += effects.dodge;
                if (effects.damageReduce) gameState.activeEffects.constitution_bonuses.damageReduce += effects.damageReduce;
                if (effects.waterBonus) gameState.activeEffects.constitution_bonuses.waterBonus += effects.waterBonus;
                if (effects.fireBonus) gameState.activeEffects.constitution_bonuses.fireBonus += effects.fireBonus;
                if (effects.hpBonus) gameState.activeEffects.constitution_bonuses.hpBonus += effects.hpBonus;
                if (effects.lethalImmune) gameState.activeEffects.constitution_bonuses.lethalImmune += effects.lethalImmune;
                if (effects.firstStrike) gameState.activeEffects.constitution_bonuses.firstStrike += effects.firstStrike;
                if (effects.allStats) {
                    gameState.activeEffects.constitution_bonuses.attack += effects.allStats;
                    gameState.activeEffects.constitution_bonuses.defense += effects.allStats;
                }
            }
        }

        // ===== updateSpiritRootDisplay =====
        function updateSpiritRootDisplay() {
            if (!gameState.spiritRoot) return;
            
            const sr = gameState.spiritRoot;
            const srData = SPIRIT_ROOT_QUALITIES[sr.quality];
            
            // 更新灵根名称和图标
            const srNameEl = document.getElementById('spiritRootName');
            if (srNameEl) {
                srNameEl.textContent = sr.quality;
                srNameEl.className = `spirit-root-name grade-${srData.grade}`;
            }
            
            const srIcon = document.querySelector('.spirit-root-icon');
            if (srIcon) {
                srIcon.textContent = srData.icon;
            }
            
            // 更新五行亲和显示
            const elementIds = ['metal', 'wood', 'water', 'fire', 'earth'];
            const elementNames = { metal: '金', wood: '木', water: '水', fire: '火', earth: '土' };
            elementIds.forEach(el => {
                const dot = document.getElementById('element' + el.charAt(0).toUpperCase() + el.slice(1));
                if (dot) {
                    const value = sr.affinity[el];
                    dot.style.opacity = value >= ELEMENT_HIGH_THRESHOLD ? '1' : '0.4';
                    dot.title = `${elementNames[el]}: ${value}%`;
                }
            });
            
            // 更新体质显示
            const cons = gameState.constitutions.filter(c => c.active);
            const consIcon = document.getElementById('constitutionIcon');
            const consName = document.getElementById('constitutionName');
            const consCount = document.getElementById('constitutionCount');
            const consDisplay = document.getElementById('constitutionDisplay');
            
            if (consIcon && consName && consCount && consDisplay) {
                if (cons.length > 0) {
                    consIcon.textContent = CONSTITUTIONS[cons[0].type].icon;
                    consName.textContent = cons[0].type;
                    consDisplay.classList.add('has-constitution');
                } else {
                    consIcon.textContent = '⚗️';
                    consName.textContent = '无体质';
                    consDisplay.classList.remove('has-constitution');
                }
                consCount.textContent = `(${cons.length}/2)`;
            }
        }

        // ===== openSpiritRootModal =====
        function openSpiritRootModal() {
            document.getElementById('spiritRootModal').classList.add('active');
            renderSpiritRootContent();
        }

        // ===== closeSpiritRootModal =====
        function closeSpiritRootModal() {
            document.getElementById('spiritRootModal').classList.remove('active');
        }

        // ===== getAchievementProgress =====
        function getAchievementProgress(achievement, ach) {
            const req = achievement.requirement;
            if (req.type === 'stat') {
                const current = ach.stats[req.key] || 0;
                return Math.min(100, (current / req.value) * 100);
            } else if (req.type === 'realm') {
                return gameState.realm >= req.value ? 100 : 0;
            } else if (req.type === 'set') {
                const set = SET_BONUSES[req.setName];
                if (!set) return 0;
                const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
                const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
                const allPieces = [...new Set([...equipped.filter(p => p), ...owned])];
                return Math.min(100, (allPieces.length / set.pieces.length) * 100);
            }
            return 0;
        }

        // ===== getAchievementProgressText =====
        function getAchievementProgressText(achievement, ach) {
            const req = achievement.requirement;
            if (req.type === 'stat') {
                const current = ach.stats[req.key] || 0;
                return `${current}/${req.value}`;
            } else if (req.type === 'realm') {
                return `当前：${CONFIG.realms[gameState.realm]}`;
            } else if (req.type === 'set') {
                const set = SET_BONUSES[req.setName];
                if (!set) return '0/2';
                const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
                const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
                const allPieces = [...new Set([...equipped.filter(p => p), ...owned])];
                return `${allPieces.length}/${set.pieces.length}`;
            }
            return '';
        }

        // ===== getRewardText =====
        function getRewardText(achievement) {
            const r = achievement.reward;
            if (r.type === 'attribute') {
                const bonusText = r.bonus >= 0 ? `+${Math.round(r.bonus * 100)}%` : `${Math.round(r.bonus * 100)}%`;
                const targetNames = {
                    cultivationSpeed: '修炼速度',
                    attack: '攻击',
                    defense: '防御',
                    craftingSuccess: '炼器成功率',
                    serendipityRate: '奇遇触发率',
                    realmSuppression: '境界压制',
                    setBonus: '套装效果',
                    tribulationCost: '渡劫消耗',
                    sectContribution: '宗门贡献'
                };
                return `${targetNames[r.target] || r.target}${bonusText}`;
            }
            return '';
        }

        // ===== acquireConstitutionFromSerendipity =====
        function acquireConstitutionFromSerendipity(type) {
            if (gameState.constitutions.length >= 2) {
                // 超过2个体质，替换
                const weakest = findWeakestConstitution();
                if (weakest) {
                    gameState.constitutions = gameState.constitutions.filter(c => c.type !== weakest);
                    addLog('neutral', '体质替换', `由于体质数量已达上限，${weakest}被${type}替换！`);
                }
            }
            
            gameState.constitutions.push({
                type: type,
                active: true,
                acquiredAt: gameState.days
            });
            
            initializeConstitutionEffects();
            addLog('good', '获得体质', `恭喜！通过奇遇获得了${type}！效果：${CONSTITUTIONS[type].desc}`);
            updateDisplay();
            saveGame();
        }

        // ===== addLog =====
        function addLog(type, title, text) {
            gameState.eventLog.unshift({ type, title, text, day: gameState.days });
            if (gameState.eventLog.length > 50) {
                gameState.eventLog.pop();
            }
            // 存储历史（最多100条）
            if (!gameState.eventLogHistory) gameState.eventLogHistory = [];
            const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
            gameState.eventLogHistory.push({time, type, title, text, day: gameState.days});
            if (gameState.eventLogHistory.length > 100) gameState.eventLogHistory.shift();
            renderLog();
        }

        // ===== getQualityColor =====
        function getQualityColor(quality) {
            const colors = {
                common: '#ffffff',
                rare: '#64b5f6',
                precious: '#ba68c8',
                legendary: '#ffd700'
            };
            return colors[quality] || colors.common;
        }

