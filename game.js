
// ===== config.js =====

        // --- CONFIG (3-11) ---
        const CONFIG = {
            realms: ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'],
            stages: ['初期', '中期', '后期'],
            stageNames: ['凡人', '修士', '真人', '天君', '大能'],
            apiUrl: 'https://api.minimaxi.com/v1/chat/completions',
            storageKey: 'cultivationSave',
            apiConfigKey: 'cultivationApiConfig',
            miniMaxConfigKey: 'cultivationMiniMaxConfig',
            // 云端存档配置
            cloudSaveEnabled: false,
            cloudSaveUrl: 'https://api.github.com/gists',
            cloudSaveGistId: '',
            cloudSaveToken: ''
        };

        // --- PET_TYPES (宠物配置) ---
        const PET_TYPES = {
            '灵狐': { icon: '🦊', baseStats: { attack: 5, defense: 3, hp: 30 }, quality: 'common', ability: '魅惑', abilityDesc: '战斗中魅惑敌方，使其攻击降低' },
            '玄蛇': { icon: '🐍', baseStats: { attack: 7, defense: 2, hp: 25 }, quality: 'common', ability: '毒雾', abilityDesc: '战斗中毒伤敌方，每回合损失生命' },
            '灵鹤': { icon: '🦢', baseStats: { attack: 4, defense: 5, hp: 35 }, quality: 'common', ability: '御风', abilityDesc: '主人速度+10%' },
            '玉兔': { icon: '🐰', baseStats: { attack: 2, defense: 4, hp: 40 }, quality: 'common', ability: '捣药', abilityDesc: '每3天产出灵气+5' },
            '青鸾': { icon: '🦚', baseStats: { attack: 8, defense: 4, hp: 35 }, quality: 'rare', ability: '鸣音', abilityDesc: '战斗中山攻击+15%' },
            '白虎': { icon: '🐯', baseStats: { attack: 12, defense: 6, hp: 50 }, quality: 'rare', ability: '猛虎', abilityDesc: '战斗中山攻击+20%' },
            '玄武': { icon: '🐢', baseStats: { attack: 6, defense: 15, hp: 80 }, quality: 'rare', ability: '护盾', abilityDesc: '主人受到的伤害-15%' },
            '青龙': { icon: '🐉', baseStats: { attack: 15, defense: 8, hp: 60 }, quality: 'precious', ability: '龙威', abilityDesc: '战斗中山所有属性+10%' },
            '朱雀': { icon: '🔥', baseStats: { attack: 18, defense: 5, hp: 45 }, quality: 'precious', ability: '涅槃', abilityDesc: '主人死亡时复活一次(50%生命)' },
            '白泽': { icon: '🦁', baseStats: { attack: 10, defense: 10, hp: 70 }, quality: 'precious', ability: '通灵', abilityDesc: '奇遇触发率+20%' },
            '麒麟': { icon: '🦒', baseStats: { attack: 14, defense: 14, hp: 85 }, quality: 'legendary', ability: '祥瑞', abilityDesc: '主人修炼速度+15%' },
            '鲲鹏': { icon: '🐋', baseStats: { attack: 20, defense: 12, hp: 100 }, quality: 'legendary', ability: '扶摇', abilityDesc: '探索区域范围+2' }
        };

        const PET_QUALITY_MULTIPLIERS = {
            common: 1.0,
            rare: 1.5,
            precious: 2.0,
            legendary: 3.0
        };

        const PET_FOOD_COST = 10; // 喂养消耗灵石
        const PET_SUMMON_COST = 500; // 召唤消耗灵石
        const PET_MAX_LEVEL = {
            common: 20,
            rare: 40,
            precious: 60,
            legendary: 100
        };
        const PET_EXP_NEEDED_PER_LEVEL = 100; // 每级所需经验
        const PET_LOYALTY_DECAY_RATE = 5; // 每天忠诚度下降

        // ===== PLUGIN_CATEGORIES (V48) =====
        const PLUGIN_CATEGORIES = {
            skill: { icon: '⚔️', label: '技能包', desc: '自定义技能和法术' },
            resource: { icon: '💎', label: '资源包', desc: '灵石/丹药/装备' },
            plot: { icon: '📜', label: '剧情包', desc: '自定义剧情和事件' },
            theme: { icon: '🎨', label: '界面主题', desc: '界面样式定制' },
            combat: { icon: '🏟️', label: '战斗包', desc: '战斗规则修改' }
        };

        // ===== PROPOSAL_SYSTEM (V50) =====
        const PROPOSAL_DIRECTIONS = {
            A: { label: 'A', color: '#e53935', desc: 'AI/智能系统' },
            B: { label: 'B', color: '#1e88e5', desc: '玩法/系统' },
            C: { label: 'C', color: '#43a047', desc: '内容/剧情' },
            D: { label: 'D', color: '#8e24aa', desc: '界面/体验' },
            E: { label: 'E', color: '#fb8c00', desc: '性能/架构' }
        };
        const PROPOSAL_STATUS = {
            submitted: { label: '待审核', color: '#ff9800' },
            approved: { label: '已采纳', color: '#4caf50' },
            rejected: { label: '已拒绝', color: '#f44336' },
            implemented: { label: '已实现', color: '#2196f3' }
        };

        // ===== DESTINY_SYSTEM (V52) =====
        const DESTINY_KEYWORDS = {
            '逆天改命': {
                icon: '⚡', color: '#e53935',
                desc: '与天道对抗者，修炼速度+20%，渡劫难度+30%',
                bonuses: { cultivationSpeed: 0.2, tribulationDifficulty: 0.3 }
            },
            '天道宠儿': {
                icon: '🌟', color: '#ffd700',
                desc: '天之骄子，奇遇触发+30%，渡劫成功率+15%',
                bonuses: { serendipityRate: 0.3, tribulationSuccess: 0.15 }
            },
            '命途多舛': {
                icon: '🌧️', color: '#78909c',
                desc: '历经磨难者，战斗经验+25%，心境上限+20',
                bonuses: { combatExp: 0.25, mindsetMax: 20 }
            },
            '仙缘深厚': {
                icon: '🍀', color: '#43a047',
                desc: '福缘深厚，所有优质事件概率+20%',
                bonuses: { goodEventRate: 0.2 }
            },
            '道心坚定': {
                icon: '💎', color: '#1e88e5',
                desc: '心如止水，渡劫时心境消耗-50%，心魔入侵-40%',
                bonuses: { mindsetConsume: -0.5, demonicInvasion: -0.4 }
            },
            '天命不凡': {
                icon: '🔮', color: '#8e24aa',
                desc: '身怀隐秘来历，所有属性+10%',
                bonuses: { allStats: 0.1 }
            }
        };

        // ===== BUILT_IN_PLUGINS (V48) =====
        const BUILT_IN_PLUGINS = [
            {
                id: 'skill_dragon_soul',
                name: '太古龙魂',
                version: '1.0.0',
                author: '系统',
                description: '解锁太古龙魂技能：龙魂觉醒(HP<30%时触发，回复20%HP+造成150%伤害)',
                category: 'skill',
                icon: '🐉',
                dependencies: [],
                installCount: 128,
                rating: 4.8,
                hooks: {
                    onBattleEnd: function(result) {
                        if (result && result.won && gameState.combat && gameState.combat.injured) {
                            const healAmount = Math.floor((gameState.combat.injured ? 0 : 0));
                            if (healAmount > 0) {
                                gameState.qi = Math.min(gameState.qi + healAmount, gameState.maxQi);
                                addLog('good', '太古龙魂', `龙魂觉醒！回复 ${healAmount} 灵气`);
                            }
                        }
                    }
                }
            },
            {
                id: 'resource_heaven_treasures',
                name: '天庭宝藏',
                version: '1.0.0',
                author: '系统',
                description: '每7天自动发放天庭俸禄：5000灵石+10个筑基丹+1件紫金装备',
                category: 'resource',
                icon: '👑',
                dependencies: [],
                installCount: 256,
                rating: 4.5,
                hooks: {
                    onDayChange: function(day) {
                        if (day % 7 === 0) {
                            gameState.spiritStones += 5000;
                            addLog('good', '天庭宝藏', '天庭俸禄发放：+5000灵石');
                        }
                    }
                }
            },
            {
                id: 'plot_ancient_ruins',
                name: '上古遗迹',
                version: '1.0.0',
                author: '系统',
                description: '新增「上古遗迹」随机事件，完成可获得传承和稀有道具',
                category: 'plot',
                icon: '🏛️',
                dependencies: [],
                installCount: 89,
                rating: 4.3,
                hooks: {}
            },
            {
                id: 'theme_xianxia_classic',
                name: '仙侠古风',
                version: '1.0.0',
                author: '系统',
                description: '界面切换为仙侠古风样式，墨绿底色+金色边框+云纹装饰',
                category: 'theme',
                icon: '🖌️',
                dependencies: [],
                installCount: 512,
                rating: 4.9,
                hooks: {
                    onThemeApply: function() {
                        applyXianxiaTheme();
                    }
                }
            },
            {
                id: 'combat_heaven_arena',
                name: '天道竞技',
                version: '1.0.0',
                author: '系统',
                description: '新增天道竞技场规则：每场战斗额外获得天道积分，可兑换稀有奖励',
                category: 'combat',
                icon: '⚡',
                dependencies: [],
                installCount: 167,
                rating: 4.6,
                hooks: {
                    onBattleWin: function(result) {
                        if (!gameState.celestialEconomy) {
                            gameState.celestialEconomy = { immortalStones: 0, exchangeRate: 100, totalExchanged: 0, investments: [], marketItems: [], lastMarketRefresh: 0, totalEarned: 0, celestialReputation: 0 };
                        }
                        gameState.celestialEconomy.celestialReputation += 10;
                        addLog('good', '天道竞技', '战斗胜利：+10天道积分');
                    }
                }
            },
            {
                id: 'skill_sword_intent',
                name: '剑意凌云',
                version: '1.0.0',
                author: '系统',
                description: '剑修专属技能包：剑意(每击+5%伤害，最高叠加10层)+万剑归宗(必杀技，500%伤害)',
                category: 'skill',
                icon: '⚔️',
                dependencies: [],
                installCount: 203,
                rating: 4.7,
                hooks: {}
            }
        ];

        // 仙侠古风主题应用
        function applyXianxiaTheme() {
            const style = document.getElementById('xianxia-theme');
            if (style) {
                style.remove();
            }
            const css = document.createElement('style');
            css.id = 'xianxia-theme';
            css.textContent = 'body { background: linear-gradient(135deg, #0a1a0a 0%, #0d2818 100%) !important; } .panel { border: 2px solid #d4a017 !important; background: rgba(10,30,15,0.95) !important; } .panel-header { background: linear-gradient(90deg, #1a3a1a, #0d2818) !important; border-bottom: 1px solid #d4a017 !important; } .btn { border: 1px solid #d4a017 !important; color: #d4a017 !important; } .btn:hover { background: rgba(212,160,23,0.2) !important; }';
            document.head.appendChild(css);
            addLog('good', '仙侠古风', '主题已应用：墨绿底色+金色边框');
        }
        const PET_HUNGER_DECAY_RATE = 10; // 每天饱食度下降
        const PET_MAX_LOYALTY = 100;
        const PET_MAX_HUNGER = 100;
        
        // --- PET_BREEDING_CONSTANTS ---
        const PET_BREEDING_COST = 200; // 繁殖消耗灵石
        const PET_BREEDING_MIN_LOYALTY = 70; // 繁殖最低忠诚度
        const PET_BREEDING_COOLDOWN = 3; // 繁殖冷却天数
        const PET_INCUBATION_DAYS_BASE = 5; // 基础孵化天数
        const PET_INCUBATION_DAYS_VAR = 3; // 孵化天数波动
        const PET_MAX_EGGS = 5; // 最大蛋容量
        
        // --- PET_EGG_TYPES ---
        const PET_EGG_TYPES = {
            common: { icon: '🥚', name: '灵兽蛋', hatchTime: 5 },
            rare: { icon: '🥚', name: '稀有灵兽蛋', hatchTime: 7 },
            precious: { icon: '🥚', name: '珍兽蛋', hatchTime: 10 },
            legendary: { icon: '🌟', name: '神兽蛋', hatchTime: 15 }
        };
        
        // 稀有灵兽蛋的icons
        const PET_EGG_ICONS = {
            common: '🥚',
            rare: '🥚',
            precious: '🥚',
            legendary: '✨'
        };

        // --- PET_ADVANCEMENT_CONFIG (进阶配置) ---
        const PET_ADVANCEMENT_COSTS = [
            { stones: 300, exp: 50 },   // 第一次进阶
            { stones: 600, exp: 100 },  // 第二次
            { stones: 1200, exp: 200 },  // 第三次
            { stones: 2500, exp: 400 },  // 第四次
            { stones: 5000, exp: 800 }   // 第五次（满级）
        ];
        const PET_ADVANCEMENT_BONUS_PER_LEVEL = 0.1; // 每级属性提升10%
        const PET_MAX_ADVANCEMENT = 5; // 最大进阶次数

        // --- PET_TRANSFORMATION_CONFIG (化形配置) ---
        const PET_TRANSFORMATION_STAGES = {
            0: { name: '幼体', icon: '🐣', statBonus: 0 },
            1: { name: '成体', icon: '🐾', statBonus: 0.15 },
            2: { name: '妖兽', icon: '🦁', statBonus: 0.30 },
            3: { name: '化形', icon: '🧑', statBonus: 0.50 },
            4: { name: '人形', icon: '👤', statBonus: 0.75 },
            5: { name: '真形', icon: '🌟', statBonus: 1.0 }
        };
        const PET_TRANSFORMATION_COSTS = [
            { stones: 500, realmMin: 1 },   // 化形1需要金丹
            { stones: 1500, realmMin: 2 },  // 化形2需要元婴
            { stones: 4000, realmMin: 3 },  // 化形3需要化神
            { stones: 10000, realmMin: 4 }, // 化形4需要渡劫
            { stones: 30000, realmMin: 5 }  // 化形5需要大乘
        ];

        // --- CELESTIAL_ECONOMY_CONFIG (仙界经济系统配置) ---
        const CELESTIAL_ITEMS = {
            // 仙丹类
            '九转金丹': { icon: '💫', type: 'pill', price: 50, desc: '服用后境界提升一级', effect: { type: 'realm_boost', value: 1 } },
            '蟠桃': { icon: '🍑', type: 'pill', price: 30, desc: '寿命+100年', effect: { type: 'lifespan', value: 100 } },
            '人参果': { icon: '🍎', type: 'pill', price: 25, desc: '最大灵气+500', effect: { type: 'max_qi', value: 500 } },
            '太乙丹': { icon: '✨', type: 'pill', price: 40, desc: '修炼速度+50%，持续7天', effect: { type: 'cultivate_speed_immortal', value: 0.5, duration: 7 } },
            '琉璃丹': { icon: '🔮', type: 'pill', price: 35, desc: '所有属性+20%', effect: { type: 'all_stats', value: 0.2 } },
            // 仙宝类
            '玲珑塔': { icon: '🏰', type: 'treasure', price: 80, desc: '装备后受到伤害-30%', effect: { type: 'defense', value: 0.3 } },
            '捆仙索': { icon: '🪢', type: 'treasure', price: 75, desc: '斗法中敌人逃跑概率+50%', effect: { type: 'escape', value: 0.5 } },
            '玄天镜': { icon: '🪞', type: 'treasure', price: 60, desc: '每日首次奇遇必定触发', effect: { type: 'serendipity_boost', value: 1.0 } },
            '昊天印': { icon: '👑', type: 'treasure', price: 100, desc: '攻击+50%', effect: { type: 'attack', value: 0.5 } },
            // 投资领域
            '灵药园': { icon: '🌿', type: 'investment', baseCost: 20, dailyReturn: 3, duration: 30, desc: '种植灵药，每日产出仙石' },
            '仙丹坊': { icon: '⚗️', type: 'investment', baseCost: 50, dailyReturn: 8, duration: 25, desc: '炼制仙丹，利润丰厚' },
            '法宝阁': { icon: '⚔️', type: 'investment', baseCost: 80, dailyReturn: 15, duration: 20, desc: '出售法宝，回报极高' },
            '天机楼': { icon: '🔮', type: 'investment', baseCost: 120, dailyReturn: 25, duration: 15, desc: '情报生意，日进斗金' }
        };

        const EXCHANGE_TIERS = [
            { min: 0, rate: 100, name: '凡俗兑换' },
            { min: 1000, rate: 95, name: '小有所成' },
            { min: 10000, rate: 90, name: '富甲一方' },
            { min: 50000, rate: 85, name: '仙家贵宾' },
            { min: 100000, rate: 80, name: '仙界豪商' }
        ];

        const CELESTIAL_REPUTATION_LEVELS = [
            { min: 0, name: '无名之辈', bonus: 0 },
            { min: 100, name: '初入仙界', bonus: 0.05 },
            { min: 500, name: '小有名气', bonus: 0.10 },
            { min: 2000, name: '仙界红人', bonus: 0.15 },
            { min: 5000, name: '一方巨擘', bonus: 0.20 },
            { min: 20000, name: '仙界传奇', bonus: 0.30 }
        ];

        // --- PET_AWAKENING_CONFIG (技能觉醒配置) ---
        const PET_AWAKENING_SKILLS = {
            // 通用觉醒技能 - 所有宠物都可能觉醒
            common: [
                { name: '火球术', icon: '🔥', desc: '战斗中使用火系法术攻击', power: 1.2, cost: 30 },
                { name: '冰霜术', icon: '❄️', desc: '战斗中有概率冻结敌人', power: 1.1, cost: 30 },
                { name: '疾风术', icon: '💨', desc: '主人速度+15%', power: 1.0, cost: 25 },
                { name: '护体术', icon: '🛡️', desc: '主人受到伤害-10%', power: 1.0, cost: 25 }
            ],
            // 稀有灵兽觉醒技能
            rare: [
                { name: '雷击术', icon: '⚡', desc: '战斗中高概率造成雷系暴击', power: 1.5, cost: 50 },
                { name: '毒雾术', icon: '☠️', desc: '每回合使敌人中毒', power: 1.3, cost: 45 },
                { name: '治疗术', icon: '💚', desc: '每回合恢复主人5%生命', power: 1.2, cost: 40 },
                { name: '护盾术', icon: '🔮', desc: '为主人提供伤害护盾', power: 1.3, cost: 45 }
            ],
            // 珍兽觉醒技能
            precious: [
                { name: '天雷术', icon: '🌩️', desc: '造成大范围雷系伤害', power: 2.0, cost: 80 },
                { name: '涅槃火', icon: '🦅', desc: '主人死亡时复活并恢复30%生命', power: 2.0, cost: 100 },
                { name: '通灵术', icon: '👻', desc: '奇遇触发率+25%', power: 1.5, cost: 60 },
                { name: '龙息术', icon: '🐉', desc: '吐息攻击，造成大量伤害', power: 1.8, cost: 70 }
            ],
            // 神兽觉醒技能
            legendary: [
                { name: '九天雷劫', icon: '💥', desc: '召唤九天雷劫，造成巨大伤害', power: 3.0, cost: 150 },
                { name: '时空扭曲', icon: '🌀', desc: '战斗中有概率回避致命伤害', power: 2.5, cost: 120 },
                { name: '祥瑞之光', icon: '✨', desc: '主人修炼速度+20%', power: 2.0, cost: 100 },
                { name: '鲲鹏展翅', icon: '🌊', desc: '探索范围+3，逃跑率+30%', power: 2.0, cost: 100 }
            ]
        };
        const PET_AWAKENING_COST = 1000; // 技能觉醒消耗灵石
        const PET_AWAKENING_EXP_COST = 200; // 技能觉醒需要经验
        const PET_MAX_AWAKENED_SKILLS = 4; // 最多觉醒技能数

        // --- PET_FUSION_CONFIG (融合系统配置) ---
        const PET_FUSION_COST = 500; // 融合消耗灵石
        const PET_FUSION_MIN_LOYALTY = 60; // 融合最低忠诚度
        const PET_FUSION_COOLDOWN = 5; // 融合冷却天数

        // --- PET_MUTATION_CONFIG (基因变异配置) ---
        const PET_MUTATION_COST = 300; // 基因变异消耗灵石
        const PET_MUTATION_COOLDOWN = 3; // 基因变异冷却天数
        const PET_MUTATION_BASE_CHANCE = 0.3; // 基础变异概率

        // 基因类型定义
        const PET_GENE_TYPES = {
            attack: { name: '攻击基因', icon: '⚔️', color: '#f44336' },
            defense: { name: '防御基因', icon: '🛡️', color: '#2196f3' },
            hp: { name: '生命基因', icon: '❤️', color: '#e91e63' },
            speed: { name: '速度基因', icon: '💨', color: '#4caf50' },
            crit: { name: '暴击基因', icon: '💥', color: '#ff9800' },
            lucky: { name: '幸运基因', icon: '🍀', color: '#9c27b0' }
        };

        // 变异效果类型
        const PET_MUTATION_EFFECTS = [
            { id: 'attack_up', name: '攻击力强化', desc: '攻击力+15%', stat: 'attack', value: 0.15, probability: 0.2 },
            { id: 'defense_up', name: '防御力强化', desc: '防御力+15%', stat: 'defense', value: 0.15, probability: 0.2 },
            { id: 'hp_up', name: '生命强化', desc: '最大生命+20%', stat: 'hp', value: 0.20, probability: 0.2 },
            { id: 'speed_up', name: '速度强化', desc: '速度+12%', stat: 'speed', value: 0.12, probability: 0.15 },
            { id: 'crit_up', name: '暴击强化', desc: '暴击率+10%', stat: 'crit', value: 0.10, probability: 0.1 },
            { id: 'regen', name: '再生能力', desc: '每天恢复生命+5%', stat: 'hp_regen', value: 0.05, probability: 0.08 },
            { id: 'resistance', name: '抗性强化', desc: '异常状态抗性+20%', stat: 'resist', value: 0.20, probability: 0.07 },
            { id: 'ability_boost', name: '天赋强化', desc: '现有技能效果+25%', stat: 'ability', value: 0.25, probability: 0.05 },
            { id: 'dual_attack', name: '双重打击', desc: '普通攻击有30%概率攻击两次', stat: 'dual_attack', value: 0.30, probability: 0.03 },
            { id: 'element_fire', name: '火焰基因', desc: '攻击附带10%火焰伤害', stat: 'element_fire', value: 0.10, probability: 0.03 },
            { id: 'element_ice', name: '寒冰基因', desc: '攻击有10%概率冻结敌人', stat: 'element_ice', value: 0.10, probability: 0.03 },
            { id: 'element_thunder', name: '雷电基因', desc: '攻击有8%概率造成麻痹', stat: 'element_thunder', value: 0.08, probability: 0.02 }
        ];

        // 融合后的特殊组合效果
        const PET_FUSION_COMBINATIONS = {
            '灵狐+玄蛇': { name: '妖狐蛇君', icon: '🐍', ability: '魅惑毒雾', statBonus: { attack: 1.2, crit: 0.1 } },
            '玄蛇+灵鹤': { name: '鹤蛇合体', icon: '🦢', ability: '御风毒雾', statBonus: { attack: 1.15, speed: 0.15 } },
            '灵狐+灵鹤': { name: '狐鹤仙', icon: '🦅', ability: '魅惑御风', statBonus: { attack: 1.1, speed: 0.2 } },
            '青鸾+白虎': { name: '虎鸾神', icon: '🐯', ability: '虎鸾共鸣', statBonus: { attack: 1.3, defense: 1.2 } },
            '青龙+朱雀': { name: '龙凤呈祥', icon: '🐉', ability: '龙凤和鸣', statBonus: { attack: 1.4, hp: 1.3 } },
            '玄武+白虎': { name: '玄武白虎', icon: '🐢', ability: '玄武护盾', statBonus: { defense: 1.5, hp: 1.2 } },
            '麒麟+白泽': { name: '瑞兽传奇', icon: '🦁', ability: '祥瑞通灵', statBonus: { attack: 1.2, luck: 0.3 } },
            '鲲鹏+青龙': { name: '鲲龙', icon: '🐋', ability: '鲲龙之怒', statBonus: { attack: 1.5, speed: 1.3 } },
            '朱雀+白虎': { name: '火虎', icon: '🐯', ability: '烈焰虎啸', statBonus: { attack: 1.4, crit: 0.15 } },
            '白泽+麒麟': { name: '圣兽', icon: '🦁', ability: '圣兽庇护', statBonus: { all: 1.25 } }
        };

        // --- PILLS (15-23) ---
        const PILLS = {
            '聚灵丹': { quality: 'common', effect: { type: 'qi', value: 50 }, price: 30, desc: '恢复50灵气', icon: '💊' },
            '心魔丹': { quality: 'common', effect: { type: 'mindset', value: 30 }, price: 40, desc: '恢复30心境', icon: '💊' },
            '金髓丹': { quality: 'rare', effect: { type: 'qi', value: 200 }, price: 100, desc: '恢复200灵气', icon: '💊' },
            '筑基丹': { quality: 'rare', effect: { type: 'breakthrough_boost', value: 0.2 }, price: 1200, desc: '突破成功率+20%', icon: '💊' },
            '破境丹': { quality: 'precious', effect: { type: 'breakthrough_boost', value: 0.3 }, price: 5000, desc: '突破+30%', icon: '💊' },
            '洗髓丹': { quality: 'precious', effect: { type: 'cultivate_speed', value: 0.1 }, price: 8000, desc: '修炼速度+10%', icon: '💊' },
            '定神丹': { quality: 'precious', effect: { type: '渡劫_mindset_protect', value: 0.5 }, price: 12000, desc: '渡劫心境消耗-50%', icon: '💊' }
        };

        // --- TREASURES (27-35) ---
        const TREASURES = {
            '青锋剑': { type: 'weapon', quality: 'common', effect: { type: 'attack', value: 0.1 }, price: 150, desc: '攻击+10%', icon: '⚔️' },
            '玄铁盾': { type: 'armor', quality: 'common', effect: { type: 'defense', value: 0.1 }, price: 150, desc: '防御+10%', icon: '🛡️' },
            '聚灵阵': { type: 'accessory', quality: 'rare', effect: { type: 'cultivate_qi_rate', value: 0.2 }, price: 800, desc: '修炼灵气+20%', icon: '📿' },
            '避火罩': { type: 'armor', quality: 'rare', effect: { type: '渡劫_damage_reduce', value: 0.3 }, price: 1500, desc: '渡劫伤害-30%', icon: '🔥' },
            '缩地符': { type: 'accessory', quality: 'rare', effect: { type: 'escape', value: 0.5 }, price: 600, desc: '逃跑成功率+50%', icon: '📜' },
            '天机镜': { type: 'accessory', quality: 'precious', effect: { type: 'foresee_event', value: 1 }, price: 8000, desc: '预知事件类型', icon: '🔮' },
            '混元珠': { type: 'accessory', quality: 'legendary', effect: { type: 'all_stats', value: 0.05 }, price: 40000, desc: '全属性+5%', icon: '珠' }
        };

        // --- HEAVENLY_DAO_EQUIPMENTS (Ultimate Tier) ---
        const HEAVENLY_DAO_EQUIPMENTS = {
            '天道剑·永恒': {
                type: 'weapon', quality: 'ultimate', slot: 0,
                baseEffect: { type: 'attack', value: 0.30 },
                lawEffect: { type: 'time_reversal', desc: '时间法则：战斗中有20%概率回溯一回合' },
                price: 500000, desc: '攻击+30%', icon: '⚔️',
                evolutionReq: { item: '青云剑', star: 9, stones: 100000 }
            },
            '天盾·不灭': {
                type: 'armor', quality: 'ultimate', slot: 1,
                baseEffect: { type: 'defense', value: 0.30 },
                lawEffect: { type: 'immortal_shield', desc: '不朽法则：受到致命伤害时免疫一次，每场战斗限一次' },
                price: 500000, desc: '防御+30%', icon: '🛡️',
                evolutionReq: { item: '玄铁盾', star: 9, stones: 100000 }
            },
            '天命珠·轮回': {
                type: 'accessory', quality: 'ultimate', slot: 2,
                baseEffect: { type: 'all_stats', value: 0.15 },
                lawEffect: { type: 'reincarnation_blessing', desc: '轮回法则：死亡时25%概率保留50%修为转世' },
                price: 800000, desc: '全属性+15%', icon: '🔮',
                evolutionReq: { item: '混元珠', star: 9, stones: 150000 }
            },
            '天罚令': {
                type: 'heavenly', quality: 'ultimate', slot: 3,
                baseEffect: { type: 'tribulation_power', value: 0.50 },
                lawEffect: { type: 'heavenly_blade', desc: '天罚法则：渡劫伤害+50%，渡劫成功率+25%' },
                price: 1000000, desc: '渡劫之力+50%', icon: '👑',
                evolutionReq: null // 天罚令只能通过天劫奖励或特殊奇遇获得
            },
            '道种': {
                type: 'heavenly', quality: 'ultimate', slot: 3,
                baseEffect: { type: 'cultivation_speed', value: 0.30 },
                lawEffect: { type: 'dao_seed', desc: '道种法则：修炼时有概率触发顿悟，修为翻倍' },
                price: 800000, desc: '修炼速度+30%', icon: '🌱',
                evolutionReq: null // 道种只能通过顿悟奇遇获得
            },
            '因果镜': {
                type: 'heavenly', quality: 'ultimate', slot: 3,
                baseEffect: { type: 'serendipity_rate', value: 0.40 },
                lawEffect: { type: 'karma_sight', desc: '因果法则：可窥探事件因果，吉凶提前预知' },
                price: 600000, desc: '奇遇率+40%', icon: '🪞',
                evolutionReq: null
            }
        };

        // --- HEAVENLY_DAO_SET_BONUSES ---
        const HEAVENLY_DAO_SET_BONUSES = {
            '天道套装': {
                pieces: ['天道剑·永恒', '天盾·不灭', '天命珠·轮回'],
                count: 3,
                stats: { attackPercent: 0.25, defensePercent: 0.25, all_stats: 0.10 },
                twoPiece: '攻击+25%，防御+25%',
                threePiece: '全属性+10%，解锁【天命】被动：每回合恢复1%最大生命',
                skill: '天命：受到致命伤害时，消耗天道气息复活，恢复30%生命，每日限一次'
            },
            '法则套装': {
                pieces: ['天罚令', '道种', '因果镜'],
                count: 3,
                stats: { tribulation_power: 0.30, cultivation_speed: 0.25, serendipity_rate: 0.20 },
                twoPiece: '渡劫+30%，修炼+25%',
                threePiece: '奇遇+20%，解锁【道法自然】被动：所有概率加成额外+15%',
                skill: '道法自然：所有概率触发效果提升15%，包括暴击、闪避、顿悟等'
            },
            '终极套装': {
                pieces: ['天道剑·永恒', '天盾·不灭', '天命珠·轮回', '天罚令', '道种', '因果镜'],
                count: 6,
                stats: { attackPercent: 0.30, defensePercent: 0.30, all_stats: 0.20, critPercent: 0.15 },
                twoPiece: '攻击+30%，防御+30%',
                threePiece: '全属性+20%，暴击+15%',
                sixPiece: '解锁【超脱】被动：渡劫必定成功，修炼速度翻倍，寿元无限制',
                skill: '超脱：免疫一切负面状态，寿元耗尽时自动进入轮回转世，保留全部属性加成'
            }
        };

        // --- COMBAT_TREASURES (39-49) ---
        const COMBAT_TREASURES = {
            '青云剑': { type: 'weapon', quality: 'common', effect: { attackBonus: 0.15 }, desc: '攻击+15%', icon: '⚔️', price: 300 },
            '玄铁盾': { type: 'armor', quality: 'common', effect: { defenseBonus: 0.2 }, desc: '防御+20%', icon: '🛡️', price: 250 },
            '混元珠': { type: 'weapon', quality: 'rare', effect: { critBonus: 0.1 }, desc: '暴击率+10%', icon: '🔮', price: 600 },
            '金缕衣': { type: 'armor', quality: 'rare', effect: { hpBonus: 0.1 }, desc: '生命+10%', icon: '👘', price: 400 },
            '避火罩': { type: 'armor', quality: 'rare', effect: { fireResist: 0.3 }, desc: '火法抗性+30%', icon: '🔥', price: 500 },
            '雷霆铛': { type: 'weapon', quality: 'precious', effect: { thunderBonus: 0.25 }, desc: '雷法伤害+25%', icon: '⚡', price: 5000 },
            '赤焰刀': { type: 'weapon', quality: 'precious', effect: { fireBonus: 0.25 }, desc: '火法伤害+25%', icon: '🔪', price: 5000 },
            '寒冰剑': { type: 'weapon', quality: 'precious', effect: { waterBonus: 0.25 }, desc: '水法伤害+25%', icon: '❄️', price: 5000 },
            '金刚杵': { type: 'weapon', quality: 'precious', effect: { bodyBonus: 0.25 }, desc: '体术伤害+25%', icon: '🔨', price: 5000 }
        };

        // --- COMBAT_PILLS (53-58) ---
        const COMBAT_PILLS = {
            '聚灵丹': { effect: { type: 'attackBoost', value: 0.2 }, desc: '攻击+20%', icon: '💊', price: 600 },
            '护体丹': { effect: { type: 'defenseBoost', value: 0.2 }, desc: '防御+20%', icon: '💊', price: 600 },
            '破妄丹': { effect: { type: 'ignoreDefense', value: 1 }, desc: '无视防御', icon: '💊', price: 4000 },
            '回春丹': { effect: { type: 'heal', value: 0.3 }, desc: '恢复30%生命', icon: '💊', price: 500 }
        };

        // --- ENHANCE_CONFIG (61-86) ---
        const ENHANCE_CONFIG = {
            // 1→2, 2→3, ... : [玄铁, 天材, 混沌石, 灵石]
            costs: {
                1: { iron: 3,  heavenly: 0, chaos: 0, stones: 200 },
                2: { iron: 5,  heavenly: 0, chaos: 0, stones: 400 },
                3: { iron: 8,  heavenly: 0, chaos: 0, stones: 800 },
                4: { iron: 10, heavenly: 1, chaos: 0, stones: 1500 },
                5: { iron: 12, heavenly: 2, chaos: 0, stones: 3000 },
                6: { iron: 15, heavenly: 3, chaos: 0, stones: 6000 },
                7: { iron: 0,  heavenly: 5, chaos: 1, stones: 15000 },
                8: { iron: 0,  heavenly: 8, chaos: 2, stones: 30000 },
                9: { iron: 0,  heavenly: 10, chaos: 3, stones: 60000 }
            },
            // 每级基础成功率（1→2用costs[1]）
            successRates: {
                1: 0.85, 2: 0.80, 3: 0.75, 4: 0.65, 5: 0.55,
                6: 0.45, 7: 0.35, 8: 0.30, 9: 0.25
            },
            // 每级强化后属性倍率
            starMultipliers: {
                1: 1.0, 2: 1.15, 3: 1.35, 4: 1.60, 5: 1.90,
                6: 2.25, 7: 2.70, 8: 3.20, 9: 4.00
            },
            // 炼器台等级限制可强化的最高星级
            anvilStarLimit: { 1: 3, 2: 6, 3: 9 }
        };

        // --- TRIBULATIONS (888-934) ---
        const TRIBULATIONS = {
            '金丹初期雷劫': {
                type: 'thunder',
                realm: 3,
                stage: '初期',
                baseRate: 0.6,
                stages: 3,
                damage: 30,
                desc: '九天神雷，淬体锻魂'
            },
            '金丹中期阴火': {
                type: 'fire',
                realm: 3,
                stage: '中期',
                baseRate: 0.5,
                stages: 5,
                damage: 40,
                desc: '琉璃阴火，焚心烧魄'
            },
            '金丹后期风劫': {
                type: 'wind',
                realm: 3,
                stage: '后期',
                baseRate: 0.4,
                stages: 7,
                damage: 50,
                desc: '九幽阴风，刮骨伐髓'
            },
            '元婴心魔': {
                type: 'demon',
                realm: 4,
                stage: '任意',
                baseRate: 0.4,
                stages: 9,
                damage: 0,
                desc: '心魔滋生，最难渡'
            },
            '化神飞升': {
                type: 'all',
                realm: 5,
                stage: '后期',
                baseRate: 0.2,
                stages: 9,
                damage: 60,
                desc: '飞升之劫，成败在此一举'
            }
        };

        // --- FURNACES (939-943) ---
        const FURNACES = {
            '土炼丹炉': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼丹炉' },
            '玄火丹炉': { level: 2, successBonus: 0.15, cost: 50000, unlockCondition: '宗门2级或50000灵石', desc: '中级炼丹炉，成功率+15%' },
            '天玄神炉': { level: 3, successBonus: 0.30, cost: 200000, unlockCondition: '化神期', desc: '高级炼丹炉，成功率+30%' }
        };

        // --- ANVILS (947-951) ---
        const ANVILS = {
            '土炼器台': { level: 1, successBonus: 0, cost: 0, unlockCondition: '默认', desc: '基础炼器台' },
            '玄铁熔炉': { level: 2, successBonus: 0.15, cost: 80000, unlockCondition: '宗门2级或80000灵石', desc: '中级炼器台，成功率+15%' },
            '天工神炉': { level: 3, successBonus: 0.30, cost: 300000, unlockCondition: '化神期', desc: '高级炼器台，成功率+30%' }
        };

        // --- ALCHEMY_RECIPES (954-962) ---
        const ALCHEMY_RECIPES = {
            '回气丹': { materials: { '灵草': 3 }, successRate: 0.80, fuelCost: 100, desc: '恢复20%灵力', icon: '💊' },
            '疗伤丹': { materials: { '灵草': 2, '妖兽血': 1 }, successRate: 0.75, fuelCost: 100, desc: '恢复30%生命', icon: '💊' },
            '聚灵丹': { materials: { '灵石': 100, '灵草': 5 }, successRate: 0.60, fuelCost: 100, desc: '修炼速度+20%，持续3天', icon: '💊' },
            '破境丹': { materials: { '灵石': 500, '天材': 2 }, successRate: 0.40, fuelCost: 100, desc: '突破瓶颈概率+15%', icon: '💊' },
            '渡劫丹': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.30, fuelCost: 100, desc: '渡劫成功率+10%', icon: '💊' },
            '洗髓丹': { materials: { '天材': 3, '灵石': 500 }, successRate: 0.50, fuelCost: 100, desc: '灵根刷新', icon: '💊' },
            '混沌丹': { materials: { '混沌石': 1, '天材': 10 }, successRate: 0.20, fuelCost: 100, desc: '保底混沌灵根', icon: '💊', requireChaos: true }
        };

        // --- FORGE_RECIPES (965-972) ---
        const FORGE_RECIPES = {
            '凡铁剑': { materials: { '玄铁': 5 }, successRate: 0.90, fuelCost: 200, effect: { type: 'attack', value: 0.05 }, desc: '攻击+5%', icon: '⚔️' },
            '青云剑': { materials: { '玄铁': 10, '天材': 1 }, successRate: 0.60, fuelCost: 200, effect: { type: 'attack', value: 0.15 }, desc: '攻击+15%', icon: '⚔️' },
            '混元珠': { materials: { '天材': 5, '灵石': 1000 }, successRate: 0.40, fuelCost: 200, effect: { type: 'crit', value: 0.10 }, desc: '暴击+10%', icon: '🔮' },
            '金缕衣': { materials: { '天材': 3, '妖兽皮': 5 }, successRate: 0.50, fuelCost: 200, effect: { type: 'hp', value: 0.10 }, desc: '生命+10%', icon: '👘' },
            '避火罩': { materials: { '天材': 2, '妖兽骨': 5 }, successRate: 0.45, fuelCost: 200, effect: { type: 'fireResist', value: 0.30 }, desc: '火抗+30%', icon: '🔥' },
            '定神珠': { materials: { '天材': 5, '灵石': 2000 }, successRate: 0.35, fuelCost: 200, effect: { type: 'mindset', value: 0.20 }, desc: '精神状态+20%', icon: '📿' }
        };

        // --- MATERIALS (976-984) ---
        const MATERIALS = {
            '灵草': { type: 'herb', basePrice: 100, icon: '🌿', desc: '普通灵草，炼丹材料' },
            '妖兽血': { type: 'beast', basePrice: 200, icon: '🩸', desc: '妖兽血液，炼丹炼器材料' },
            '天材': { type: 'rare', basePrice: 500, icon: '✨', desc: '稀有天材，高级材料' },
            '混沌石': { type: 'legendary', basePrice: 1667, icon: '💎', desc: '混沌神石，传说材料', requireChaos: true },
            '玄铁': { type: 'metal', basePrice: 100, icon: '🔩', desc: '玄铁矿物，炼器材料' },
            '妖兽皮': { type: 'beast', basePrice: 180, icon: '🐾', desc: '妖兽皮毛，炼器材料' },
            '妖兽骨': { type: 'beast', basePrice: 220, icon: '🦴', desc: '妖兽骨骼，炼器材料' }
        };

        // --- ADVANCED_FORGE_RECIPES (988-1037) ---
        const ADVANCED_FORGE_RECIPES = {
            '灵宝·苍穹印': { 
                materials: { '玄铁': 20, '天材': 5, '混沌石': 1 }, 
                fuelCost: 2000, 
                desc: '灵宝·攻击+25%', icon: '🔮', 
                effect: { type: 'attack', value: 0.25 }
            },
            '灵宝·玄武甲': { 
                materials: { '玄铁': 20, '天材': 5, '混沌石': 1 }, 
                fuelCost: 2000, 
                desc: '灵宝·防御+25%', icon: '🛡️', 
                effect: { type: 'defense', value: 0.25 }
            },
            '圣器·天使神剑': { 
                materials: { '天材': 10, '混沌石': 3 }, 
                fuelCost: 8000, 
                desc: '圣器·攻击+40%', icon: '⚔️', 
                effect: { type: 'attack', value: 0.40 }
            },
            '圣器·天使神甲': { 
                materials: { '天材': 10, '混沌石': 3 }, 
                fuelCost: 8000, 
                desc: '圣器·防御+40%', icon: '👘', 
                effect: { type: 'defense', value: 0.40 }
            },
            '圣器·天使神翼': { 
                materials: { '天材': 10, '混沌石': 3 }, 
                fuelCost: 8000, 
                desc: '圣器·全属性+15%', icon: '👼', 
                effect: { type: 'all_stats', value: 0.15 }
            },
            '天神器·天使神剑': { 
                materials: { '天材': 20, '混沌石': 8 }, 
                fuelCost: 20000, 
                desc: '天神器·攻击+60%', icon: '⚔️', 
                effect: { type: 'attack', value: 0.60 }
            },
            '天神器·天使神甲': { 
                materials: { '天材': 20, '混沌石': 8 }, 
                fuelCost: 20000, 
                desc: '天神器·防御+60%', icon: '👘', 
                effect: { type: 'defense', value: 0.60 }
            },
            '天神器·天使神翼': { 
                materials: { '天材': 20, '混沌石': 8 }, 
                fuelCost: 20000, 
                desc: '天神器·全属性+25%', icon: '👼', 
                effect: { type: 'all_stats', value: 0.25 }
            }
        };

        // --- SERENDIPITY_EVENTS (1041-1265) ---
        const SERENDIPITY_EVENTS = {
            // 正面奇遇
            '古修士传承': {
                type: 'positive',
                icon: '📜',
                minRealm: 2, // 金丹及以上
                effect: (state) => {
                    const rewards = [
                        { type: 'spiritStones', value: Math.floor(1000 + Math.random() * 2000) },
                        { type: 'technique', value: 1 }
                    ];
                    const reward = rewards[Math.floor(Math.random() * rewards.length)];
                    if (reward.type === 'spiritStones') {
                        state.spiritStones += reward.value;
                        return { title: '古修士传承', text: `获得前辈遗留的 ${reward.value} 灵石！`, effects: [{ type: '灵石', value: reward.value, positive: true }] };
                    } else {
                        return { title: '古修士传承', text: '获得高阶功法传承！', effects: [{ type: '功法', value: 1, positive: true }] };
                    }
                }
            },
            '秘境入口': {
                type: 'positive',
                icon: '🌀',
                minRealm: 0,
                effect: (state) => {
                    state.currentEvent = { type: '秘境入口', inProgress: true };
                    return { title: '秘境入口', text: '发现一处神秘秘境入口，进入可能获得稀有奖励！', effects: [], showRealmBattle: true };
                }
            },
            '神兽认主': {
                type: 'positive',
                icon: '🦅',
                minRealm: 3, // 元婴及以上
                effect: (state) => {
                    const bonuses = [
                        { type: 'attack', value: 0.1 },
                        { type: 'defense', value: 0.1 },
                        { type: 'cultivate_speed', value: 0.05 }
                    ];
                    const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
                    state.activeEffects[bonus.type] += bonus.value;
                    return { title: '神兽认主', text: `神兽与你结缘，${bonus.type === 'attack' ? '攻击' : bonus.type === 'defense' ? '防御' : '修炼速度'}+${Math.round(bonus.value * 100)}%！`, effects: [{ type: bonus.type === 'attack' ? '攻击' : bonus.type === 'defense' ? '防御' : '修炼速度', value: Math.round(bonus.value * 100) + '%', positive: true }] };
                }
            },
            '仙人指路': {
                type: 'positive',
                icon: '🧙',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.serendipityBoostEndDay = state.days + 3;
                    state.activeEffects.serendipity_boost = 0.15;
                    return { title: '仙人指路', text: '仙人指点，突破成功率+30%，持续3天！', effects: [{ type: '突破成功率', value: '+30%', positive: true }] };
                }
            },
            '灵根觉醒': {
                type: 'positive',
                icon: '✨',
                minRealm: 0,
                effect: (state) => {
                    const gain = Math.floor(5 + Math.random() * 10);
                    state.activeEffects.cultivate_speed += gain / 1000;
                    return { title: '灵根觉醒', text: `灵根资质提升，修炼速度+${gain}%！`, effects: [{ type: '修炼速度', value: gain + '%', positive: true }] };
                }
            },
            '顿悟': {
                type: 'positive',
                icon: '💡',
                minRealm: 0,
                effect: (state) => {
                    state.spiritStones += 10000;
                    return { title: '顿悟', text: '修炼中顿悟，获得10000灵石！', effects: [{ type: '灵石', value: 10000, positive: true }] };
                }
            },
            // V7 体质相关奇遇
            '天赐体质·至尊骨': {
                type: 'positive',
                icon: '🦴',
                minRealm: 2, // 金丹及以上
                condition: (state) => !state.constitutions.find(c => c.type === '至尊骨'),
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '天赐体质·至尊骨', inProgress: true, choices: ['接受完整传承', '只取部分精华'] };
                    return { title: '天赐体质·至尊骨', text: '异象降世！骨如金铁，光耀万里……你可否愿接受完整传承？', effects: [], showChoice: true };
                }
            },
            '天赐体质·疾风灵体': {
                type: 'positive',
                icon: '💨',
                minRealm: 1, // 筑基及以上
                condition: (state) => !state.constitutions.find(c => c.type === '疾风灵体'),
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '天赐体质·疾风灵体', inProgress: true, choices: ['与风融为一体', '保持自我意识'] };
                    return { title: '天赐体质·疾风灵体', text: '风之精灵感应你的存在……与风融为一体可获完整灵体，但需冒风险。', effects: [], showChoice: true };
                }
            },
            '天赐体质·重瞳': {
                type: 'positive',
                icon: '👁️',
                minRealm: 3, // 元婴及以上
                condition: (state) => !state.constitutions.find(c => c.type === '重瞳'),
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '天赐体质·重瞳', inProgress: true, choices: ['承受重瞳试炼', '以凡眼视之'] };
                    return { title: '天赐体质·重瞳', text: '天道震怒！重瞳降临将开启你的天眼……试炼凶险，但成功后可看透万物本质。', effects: [], showChoice: true };
                }
            },
            // 负面奇遇
            '心魔入侵': {
                type: 'negative',
                icon: '👹',
                minRealm: 3, // 元婴及以上
                effect: (state) => {
                    const loss = Math.floor(state.spiritStones * 0.3);
                    state.spiritStones -= loss;
                    state.serendipity.luckStatus = 'unlucky';
                    state.serendipity.luckEndDay = state.days + 3;
                    return { title: '心魔入侵', text: `心魔入侵，损失 ${loss} 灵石，运气-，持续3天！`, effects: [{ type: '灵石', value: -loss, positive: false }] };
                }
            },
            '仇家追杀': {
                type: 'negative',
                icon: '⚔️',
                minRealm: 0,
                condition: (state) => state.combat.losses > 0,
                effect: (state) => {
                    const loss = Math.floor(state.spiritStones * 0.5);
                    state.spiritStones -= loss;
                    return { title: '仇家追杀', text: `旧日仇家找上门来，损失 ${loss} 灵石！`, effects: [{ type: '灵石', value: -loss, positive: false }] };
                }
            },
            '魔器诱惑': {
                type: 'negative',
                icon: '🗡️',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '魔器诱惑', inProgress: true };
                    return { title: '魔器诱惑', text: '发现一把散发魔气的武器，装备后每回合扣血！', effects: [], showChoice: true };
                }
            },
            '走火入魔': {
                type: 'negative',
                icon: '💀',
                minRealm: 0,
                condition: (state) => state.cultivationProgress > 1000,
                effect: (state) => {
                    if (state.realm > 0) state.realm--;
                    state.cultivationProgress = 0;
                    state.serendipity.luckStatus = 'unlucky';
                    state.serendipity.luckEndDay = state.days + 3;
                    return { title: '走火入魔', text: '修炼过度，走火入魔！境界-1，强制休息！', effects: [{ type: '境界', value: -1, positive: false }] };
                }
            },
            '妖兽袭击': {
                type: 'negative',
                icon: '🐺',
                minRealm: 0,
                effect: (state) => {
                    state.currentEvent = { type: '妖兽袭击', inProgress: true };
                    return { title: '妖兽袭击', text: '遭遇妖兽袭击！', effects: [], showRealmBattle: true, isNegative: true };
                }
            },
            // 中性奇遇
            '乞丐讨缘': {
                type: 'neutral',
                icon: '🙏',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '乞丐讨缘', inProgress: true, choices: ['施舍100灵石', '不给'] };
                    return { title: '乞丐讨缘', text: '路遇乞丐向你讨缘，你会怎么做？', effects: [] };
                }
            },
            '商人交易': {
                type: 'neutral',
                icon: '💰',
                minRealm: 0,
                effect: (state) => {
                    const items = ['聚灵丹', '心魔丹', '金髓丹'];
                    const item = items[Math.floor(Math.random() * items.length)];
                    const cost = Math.floor(100 + Math.random() * 200);
                    if (state.spiritStones >= cost) {
                        state.spiritStones -= cost;
                        addItemToInventory(item, 1);
                        return { title: '商人交易', text: `花费 ${cost} 灵石购买了 ${item}！`, effects: [{ type: '灵石', value: -cost, positive: false }, { type: item, value: 1, positive: true }] };
                    } else {
                        return { title: '商人交易', text: '灵石不足，无法交易！', effects: [] };
                    }
                }
            },
            '散修求助': {
                type: 'neutral',
                icon: '👤',
                minRealm: 0,
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '散修求助', inProgress: true, choices: ['帮助', '不帮'] };
                    return { title: '散修求助', text: '一位散修请求你帮忙，你会帮助吗？', effects: [] };
                }
            },
            // B1 扩充奇遇
            '天地精华': {
                type: 'positive',
                icon: '🌟',
                minRealm: 0,
                effect: (state) => {
                    const qiGain = Math.floor(state.maxQi * 0.5);
                    state.qi = Math.min(state.maxQi, state.qi + qiGain);
                    return { title: '天地精华', text: `吸收天地精华，灵气+${qiGain}！`, effects: [{ type: '灵气', value: qiGain, positive: true }] };
                }
            },
            '心魔试炼': {
                type: 'negative',
                icon: '👹',
                minRealm: 1, // 筑基及以上
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '心魔试炼', inProgress: true, choices: ['勇敢面对', '退缩'] };
                    return { title: '心魔试炼', text: '识海中浮现心魔化身！你要直面还是退缩？', effects: [], showChoice: true };
                }
            },
            '上古遗迹': {
                type: 'neutral',
                icon: '🏛️',
                minRealm: 2, // 金丹及以上
                effect: (state) => {
                    state.serendipity.currentEvent = { type: '上古遗迹', inProgress: true, choices: ['深入探索', '浅尝辄止', '离开'] };
                    return { title: '上古遗迹', text: '发现一处上古遗迹，灵气浓郁！如何行动？', effects: [], showChoice: true };
                }
            }
        };

        // --- SERENDIPITY_TALISMANS (1268-1273) ---
        const SERENDIPITY_TALISMANS = {
            '祥云符': { type: 'consumable', effect: { type: 'serendipity_boost', value: 0.1 }, duration: 1, price: 2000, desc: '奇遇概率+10%，持续1天', icon: '☁️' },
            '避厄符': { type: 'consumable', effect: { type: 'immune_negative', value: 1 }, duration: 1, price: 1500, desc: '免疫下次负面奇遇', icon: '🛡️' },
            '探路符': { type: 'consumable', effect: { type: 'force_realm', value: 1 }, duration: 0, price: 3000, desc: '指定触发"秘境入口"奇遇', icon: '📜' },
            '还童丹': { type: 'consumable', effect: { type: 'convert_demon', value: 1 }, duration: 0, price: 5000, desc: '将魔器转换为正常法宝', icon: '💊' }
        };

        // --- SPIRIT_ROOT_QUALITIES (1278-1285) ---
        const SPIRIT_ROOT_QUALITIES = {
            '伪灵根': { grade: 0, icon: '🌱', speedBonus: 0.6, bottleneckBonus: 0.4, tribulationBonus: -0.2, weight: 35 },
            '下品灵根': { grade: 1, icon: '🌿', speedBonus: 0.8, bottleneckBonus: 0.2, tribulationBonus: -0.1, weight: 25 },
            '中品灵根': { grade: 2, icon: '🌳', speedBonus: 1.0, bottleneckBonus: 0, tribulationBonus: 0, weight: 20 },
            '上品灵根': { grade: 3, icon: '🌲', speedBonus: 1.3, bottleneckBonus: -0.15, tribulationBonus: 0.1, weight: 12 },
            '天灵根': { grade: 4, icon: '✨', speedBonus: 1.6, bottleneckBonus: -0.25, tribulationBonus: 0.2, weight: 6 },
            '混沌灵根': { grade: 5, icon: '🌈', speedBonus: 2.0, bottleneckBonus: -0.4, tribulationBonus: 0.3, weight: 2 }
        };

        // --- FIVE_ELEMENT_TECHNIQUES (1288-1294) ---
        const FIVE_ELEMENT_TECHNIQUES = {
            '金': { name: '庚金剑诀', icon: '⚔️', bonusType: 'attack', bonusValue: 0.25, threshold: 20 },
            '木': { name: '青木长生诀', icon: '🌿', bonusType: 'heal', bonusValue: 0.5, threshold: 20 },
            '水': { name: '玄冰寒咒', icon: '❄️', bonusType: 'defense', bonusValue: 0.2, threshold: 20 },
            '火': { name: '烈焰真经', icon: '🔥', bonusType: 'attack', bonusValue: 0.2, threshold: 20 },
            '土': { name: '厚土玄功', icon: '🛡️', bonusType: 'resist', bonusValue: 0.25, threshold: 20 }
        };

        // --- CONSTITUTIONS (1297-1360) ---
        const CONSTITUTIONS = {
            '先天道体': {
                icon: '👼',
                desc: '全属性+20%，修炼速度+50%',
                effect: { allStats: 0.2, cultivateSpeed: 0.5 },
                trigger: (state) => state.spiritRoot.quality === '混沌灵根' && state.realm >= 3,
                source: '混沌灵根突破元婴'
            },
            '至尊骨': {
                icon: '🦴',
                desc: '攻击+30%，战斗中暴击+15%',
                effect: { attack: 0.3, crit: 0.15 },
                trigger: () => false, // 只能通过奇遇获得
                source: '随机奇遇'
            },
            '琉璃玉体': {
                icon: '💎',
                desc: '防御+25%，受到伤害-15%',
                effect: { defense: 0.25, damageReduce: 0.15 },
                trigger: (state) => {
                    const grade = SPIRIT_ROOT_QUALITIES[state.spiritRoot.quality].grade;
                    return grade >= 2 && state.realm === 2 && state.cultivationProgress >= REALM_REQUIREMENTS[2].stageThreshold[2];
                },
                source: '中品以上灵根突破金丹'
            },
            '玄冥之体': {
                icon: '🌊',
                desc: '水系功法伤害+40%，水系抗性+50%',
                effect: { waterBonus: 0.4, waterResist: 0.5 },
                trigger: (state) => state.spiritRoot.affinity.water >= 80,
                source: '水属性亲和≥80'
            },
            '烈焰战体': {
                icon: '🔥',
                desc: '火系功法伤害+40%，生命上限+20%',
                effect: { fireBonus: 0.4, hpBonus: 0.2 },
                trigger: (state) => state.spiritRoot.affinity.fire >= 80,
                source: '火属性亲和≥80'
            },
            '疾风灵体': {
                icon: '💨',
                desc: '速度+35%，先手概率+25%',
                effect: { speed: 0.35, firstStrike: 0.25 },
                trigger: () => false, // 只能通过奇遇获得
                source: '随机奇遇'
            },
            '不灭金身': {
                icon: '🛡️',
                desc: '免疫一次致命伤害，每日1次',
                effect: { lethalImmune: 1 },
                trigger: (state) => {
                    const grade = SPIRIT_ROOT_QUALITIES[state.spiritRoot.quality].grade;
                    return grade >= 3 && state.realm === 4 && state.cultivationProgress >= REALM_REQUIREMENTS[4].stageThreshold[2];
                },
                source: '上品以上灵根突破化神'
            },
            '重瞳': {
                icon: '👁️',
                desc: '可预判敌人攻击，闪避+20%',
                effect: { dodge: 0.2, foresee: 1 },
                trigger: () => false, // 只能通过奇遇获得
                source: '随机奇遇'
            }
        };

        // --- REALM_REQUIREMENTS (1483-1489) ---
        const REALM_REQUIREMENTS = {
            0: { maxQi: 100, stageThreshold: [30, 60, 90], breakthroughQi: 100 },
            1: { maxQi: 200, stageThreshold: [60, 120, 180], breakthroughQi: 200 },
            2: { maxQi: 400, stageThreshold: [120, 240, 360], breakthroughQi: 400 },
            3: { maxQi: 800, stageThreshold: [240, 480, 720], breakthroughQi: 800 },
            4: { maxQi: 1600, stageThreshold: [480, 960, 1440], breakthroughQi: 1600 },
            5: { maxQi: 3200, stageThreshold: [960, 1920, 2880], breakthroughQi: 3200 }  // 飞升期
        };

        // --- DEFAULT_MINIMAX_CONFIG (1505-1515) ---
        const DEFAULT_MINIMAX_CONFIG = {
            apiKey: '',
            baseUrl: 'https://api.minimaxi.com/v1',
            model: 'MiniMax-M2.7',
            groupId: '',
            features: {
                aiDialogue: false,
                aiSerendipity: false,
                aiTechnique: false
            }
        };

        // --- TECHNIQUE_BONUS (5014-5019) ---
        const TECHNIQUE_BONUS = {
            '雷法': { beats: '体术', losesTo: '火法' },
            '火法': { beats: '雷法', losesTo: '水法' },
            '水法': { beats: '火法', losesTo: '体术' },
            '体术': { beats: '水法', losesTo: '雷法' }
        };

        // --- TECHNIQUE_COLORS (5020-5025) ---
        const TECHNIQUE_COLORS = {
            '雷法': '#ffff00',
            '火法': '#ff4500',
            '水法': '#00bfff',
            '体术': '#228b22'
        };

        // --- SECT_CONFIG (6086-6101) ---
        const SECT_CONFIG = {
            createCost: 50000,
            maxDisciples: { 1: 30, 2: 50, 3: 80 },
            upgradeCost: { 2: 80000, 3: 150000 },
            upgradeDisciples: { 2: 20, 3: 40 },
            buildings: {
                library: { name: '功法阁', icon: '📚', cost: 10000, unlockLevel: 1, desc: '存放可供传承的功法' },
                alchemy: { name: '炼丹房', icon: '⚗️', cost: 20000, unlockLevel: 2, desc: '宗门产出丹药' },
                forge: { name: '炼器室', icon: '🔨', cost: 20000, unlockLevel: 2, desc: '宗门产出法宝' },
                archive: { name: '藏经阁', icon: '🏛️', cost: 50000, unlockLevel: 3, desc: '存放至高功法' }
            },
            talents: ['下品', '中品', '上品', '极品'],
            talentWeights: [0.4, 0.35, 0.2, 0.05],
            techniqueGrades: ['人阶', '灵阶', '天阶', '仙阶'],
            techniqueGradeColors: ['grade-human', 'grade-spirit', 'grade-heaven', 'grade-immortal']
        };

        // --- PALACE_CONFIG (仙宫配置) ---
        const PALACE_CONFIG = {
            // 仙宫等级配置
            levelConfig: {
                1: { name: '凡宫', maxRooms: 3, upgradeCost: 0, desc: '初建仙宫，灵气稀薄' },
                2: { name: '灵宫', maxRooms: 5, upgradeCost: 50000, desc: '灵气充沛，可纳弟子' },
                3: { name: '天宫', maxRooms: 8, upgradeCost: 150000, desc: '天界宫阙，万仙来朝' },
                4: { name: '神宫', maxRooms: 12, upgradeCost: 500000, desc: '神圣之地，法则汇聚' },
                5: { name: '圣宫', maxRooms: 20, upgradeCost: 2000000, desc: '至高圣殿，超脱轮回' }
            },
            // 仙宫房间类型
            roomTypes: {
                '修炼殿': { icon: '🧘', cost: 5000, effect: 'cultivate_speed', effectValue: 0.05, desc: '修炼速度+5%' },
                '藏宝阁': { icon: '💎', cost: 8000, effect: 'treasure_bonus', effectValue: 0.1, desc: '宝物获取+10%' },
                '炼丹房': { icon: '⚗️', cost: 10000, effect: 'alchemy_success', effectValue: 0.1, desc: '炼丹成功率+10%' },
                '炼器室': { icon: '🔨', cost: 10000, effect: 'forge_success', effectValue: 0.1, desc: '炼器成功率+10%' },
                '悟道阁': { icon: '📖', cost: 15000, effect: 'mindset_gain', effectValue: 0.1, desc: '心境获取+10%' },
                '聚灵阵': { icon: '🔮', cost: 20000, effect: 'qi_rate', effectValue: 0.15, desc: '灵气获取+15%' },
                '渡劫台': { icon: '⚡', cost: 30000, effect: '渡劫_protect', effectValue: 0.15, desc: '渡劫成功率+15%' },
                '天机殿': { icon: '🔭', cost: 50000, effect: 'serendipity_rate', effectValue: 0.2, desc: '奇遇概率+20%' }
            },
            // 弟子分配工作产出
            workYields: {
                '修炼中': { spiritStones: 0, reputation: 1 },
                '采矿': { spiritStones: 50, reputation: 0 },
                '采药': { spiritStones: 30, reputation: 1 },
                '巡逻': { spiritStones: 20, reputation: 3 },
                '炼丹': { spiritStones: 100, reputation: 2 }
            },
            // 仙宫产出周期(天)
            productionCycle: 1,
            // 最大仙宫弟子
            maxPalaceDisciples: { 1: 5, 2: 10, 3: 20, 4: 40, 5: 80 },
            // 仙宫弟子任务配置
            taskTypes: {
                'cultivate': { name: '闭关修炼', icon: '🧘', desc: '在修炼殿修炼', duration: 3, reward: { spiritStones: 100, reputation: 10 }, requirement: { type: 'room', roomType: '修炼殿' } },
                'mine': { name: '采集灵石', icon: '⛏️', desc: '前往灵矿采集灵石', duration: 2, reward: { spiritStones: 200, reputation: 5 }, requirement: { type: 'discipleCount', count: 1 } },
                'herbal': { name: '采药炼丹', icon: '🌿', desc: '采集灵草并尝试炼丹', duration: 3, reward: { spiritStones: 150, reputation: 15, items: ['丹药'] }, requirement: { type: 'room', roomType: '炼丹房' } },
                'patrol': { name: '巡逻护宫', icon: '🛡️', desc: '巡视仙宫周围', duration: 2, reward: { spiritStones: 80, reputation: 25 }, requirement: { type: 'none' } },
                'forge': { name: '锻造法宝', icon: '🔨', desc: '使用炼器室锻造法宝', duration: 4, reward: { spiritStones: 300, reputation: 20, items: ['法宝'] }, requirement: { type: 'room', roomType: '炼器室' } },
                'study': { name: '研读典籍', icon: '📖', desc: '在藏经阁研读功法', duration: 3, reward: { spiritStones: 50, reputation: 30, exp: 50 }, requirement: { type: 'room', roomType: '悟道阁' } },
                'collect_revenue': { name: '收取贡赋', icon: '💎', desc: '向附庸势力收取贡赋', duration: 5, reward: { spiritStones: 500, reputation: 10 }, requirement: { type: 'palaceLevel', level: 2 } },
                'explore': { name: '探索秘境', icon: '🌀', desc: '组队探索附近秘境', duration: 4, reward: { spiritStones: 400, reputation: 40, items: ['灵草'] }, requirement: { type: 'discipleCount', count: 2 } },
                'defend': { name: '守护仙宫', icon: '⚔️', desc: '抵御外来入侵者', duration: 3, reward: { spiritStones: 250, reputation: 50 }, requirement: { type: 'discipleCount', count: 3 } },
                'diplomacy': { name: '外交往来', icon: '🤝', desc: '与其他势力进行外交', duration: 5, reward: { spiritStones: 100, reputation: 60 }, requirement: { type: 'palaceLevel', level: 3 } }
            },
            // 任务难度对应奖励倍数
            taskDifficultyMultiplier: { easy: 1, normal: 1.5, hard: 2.5 }
        };

        // --- SECT_TECHNIQUES (6104-6111) ---
        const SECT_TECHNIQUES = {
            '基础练气诀': { grade: 0, effect: { type: 'cultivate_speed', value: 0.05 }, desc: '修炼速度+5%', icon: '📖' },
            '灵根培育法': { grade: 1, effect: { type: 'qi_rate', value: 0.1 }, desc: '灵气获取+10%', icon: '🌱' },
            '天元心法': { grade: 1, effect: { type: 'breakthrough_boost', value: 0.1 }, desc: '突破成功率+10%', icon: '☀️' },
            '金刚炼体术': { grade: 2, effect: { type: 'defense', value: 0.15 }, desc: '防御+15%', icon: '🛡️' },
            '紫霄雷法': { grade: 2, effect: { type: 'attack', value: 0.15 }, desc: '攻击+15%', icon: '⚡' },
            '九转玄天诀': { grade: 3, effect: { type: 'all_stats', value: 0.1 }, desc: '全属性+10%', icon: '🌟' }
        };

        // --- TECHNIQUE_UPGRADE_MATERIALS ---
        // 功法进阶材料配置：grade -> [材料名称, 数量, 灵石费用]
        const TECHNIQUE_UPGRADE_MATERIALS = {
            // 人阶(0) -> 灵阶(1): 天材×3 + 灵石200
            0: { materials: { '天材': 3 }, stones: 200 },
            // 灵阶(1) -> 天阶(2): 天材×5 + 混沌石×1 + 灵石500
            1: { materials: { '天材': 5, '混沌石': 1 }, stones: 500 },
            // 天阶(2) -> 仙阶(3): 混沌石×3 + 灵石2000
            2: { materials: { '混沌石': 3 }, stones: 2000 }
        };

        // --- TECHNIQUE_UPGRADE_EFFECTS ---
        // 功法进阶后效果提升配置
        const TECHNIQUE_UPGRADE_EFFECTS = {
            // 人阶基础效果提升
            0: { value: 0.05, desc: '修炼速度+5%' },
            1: { value: 0.10, desc: '灵气获取+10%' },
            2: { value: 0.10, desc: '突破成功率+10%' },
            3: { value: 0.15, desc: '防御+15%' },
            4: { value: 0.15, desc: '攻击+15%' },
            5: { value: 0.10, desc: '全属性+10%' },
            // 灵阶效果提升
            6: { value: 0.10, desc: '修炼速度+10%' },
            7: { value: 0.20, desc: '灵气获取+20%' },
            8: { value: 0.20, desc: '突破成功率+20%' },
            9: { value: 0.25, desc: '防御+25%' },
            10: { value: 0.25, desc: '攻击+25%' },
            11: { value: 0.20, desc: '全属性+20%' },
            // 天阶效果提升
            12: { value: 0.15, desc: '修炼速度+15%' },
            13: { value: 0.30, desc: '灵气获取+30%' },
            14: { value: 0.30, desc: '突破成功率+30%' },
            15: { value: 0.35, desc: '防御+35%' },
            16: { value: 0.35, desc: '攻击+35%' },
            17: { value: 0.30, desc: '全属性+30%' }
        };

// ===== state.js =====

        // --- gameState (1366-1480) ---
        let gameState = {
            realm: 0,       // 0-4 对应 炼气到化神
            stage: 0,       // 0-2 对应 初期/中期/后期
            qi: 0,
            maxQi: 100,
            spiritStones: 50,
            mindset: 50,
            days: 1,
            cultivationProgress: 0,
            eventLog: [],
            combatLogHistory: [],
            eventLogHistory: [],
            isGameOver: false,
            isVictory: false,
            // V2新增字段
            inventory: [],
            equippedTreasures: [null, null, null, null],
            maxInventorySlots: 20,
            shopItems: [],
            lastShopDay: 0,
            activeEffects: {
                breakthrough_boost: 0,
                cultivate_speed: 0,
                渡劫_mindset_protect: 0,
                attack: 0,
                defense: 0,
                cultivate_qi_rate: 0,
                渡劫_damage_reduce: 0,
                escape: 0,
                foresee_event: 0,
                all_stats: 0,
                serendipity_boost: 0
            },
            // 仙界经济系统字段
            celestialEconomy: {
                immortalStones: 0,           // 仙石数量
                exchangeRate: 100,            // 汇率：1仙石=100灵石
                totalExchanged: 0,            // 累计兑换金额
                investments: [],              // 投资记录 [{area, amount, returns, daysLeft}]
                marketItems: [],              // 仙界市场物品
                lastMarketRefresh: 0,         // 上次市场刷新
                totalEarned: 0,               // 累计收益
                celestialReputation: 0        // 仙界声望
            },
            // V3渡劫系统字段
            tribulation: {
                inProgress: false,
                currentStage: 0,
                totalStages: 9,
                currentType: null,
                preparations: [],
                damageTaken: 0,
                tribKey: null
            },
            hasTransmigrationBuff: false,
            tribulationRecord: [],
            // V4 战斗系统字段
            combat: {
                wins: 0,
                losses: 0,
                honor: 0,
                fame: 0,
                battleHistory: [],
                injured: false,
                injuryEndDay: 0
            },
            // V5 宗门系统字段
            sect: {
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
                lastResourceCollection: 0,
                // 双轨系统字段
                dualTrackEnabled: false,
                syncResources: false,
                syncInterval: 1,
                dispatchedToPalace: 0
            },
            // V14 仙宫系统字段
            palace: {
                name: null,
                level: 1,
                spiritStones: 0,
                reputation: 0,
                rooms: [],
                disciples: [],
                lastProductionDay: 0,
                decorationBonus: 0,
                tasks: [],           // 弟子任务列表
                taskRecord: { completed: 0, failed: 0, totalReward: 0 }  // 任务统计
            },
            // V6 奇遇系统字段
            serendipity: {
                lastTriggerDay: 0,
                todayCount: 0,
                lastTriggerType: null,
                cooldownTypes: {},
                badLuck: 0,
                currentEvent: null,
                log: [],
                luckStatus: null,
                luckEndDay: 0,
                serendipityBoostEndDay: 0
            },
            // V7 灵根/体质系统字段
            spiritRoot: {
                quality: '中品灵根', // 伪灵根/下品灵根/中品灵根/上品灵根/天灵根/混沌灵根
                affinity: { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 },
                resonance: 0,
                lastRefreshDay: 0
            },
            constitutions: [], // 已获得的体质
            // V8 丹药炼器系统字段
            crafting: {
                furnace: { level: 1, type: 'alchemy' },
                anvil: { level: 1, type: 'forge' },
                transactionLog: []
            },
            // V28 成就系统大改版字段
            achievements: {
                unlocked: [],
                titles: [],
                stats: {
                    tribulationsCompleted: 0,
                    dungeonBossesKilled: 0,
                    sectContributions: 0,
                    treasuresRefined: 0,
                    serendipitiesEncountered: 0,
                    flawlessTribulations: 0
                },
                // V28 新增字段
                progress: {},        // {成就ID: 当前数值}
                claimedStages: {},   // {成就ID: [已领取阶段索引]}
                seasonPoints: 0,     // 赛季积分
                seasonRewards: []    // 已兑换赛季奖励ID
            },
            equippedFrame: null,     // V28 当前头像框
            equippedBubble: null,   // V28 当前气泡
            currentSeason: 's1',    // V28 当前赛季
            displaySettings: { showTitle: true, showFrame: true, showBubble: true }, // V28 显示设置
            title: '筑基修士',       // 当前称号
            // 仙宠灵兽系统字段
            pets: [],
            summonedPet: null,
            petBreedingCooldowns: {}, // { petId: daysUntilBreedable }
            petEggs: [], // [{ id, quality, type, daysLeft, totalDays, isHatching }]
            selectedBreedingPet1: null,
            selectedBreedingPet2: null,
            breedingResult: null,
            // 仙宠融合/基因变异系统字段
            selectedFusionPet1: null,
            selectedFusionPet2: null,
            fusionResult: null,
            fusionCooldowns: {}, // { petId: daysUntilFusable }
            mutationCooldowns: {}, // { petId: daysUntilMutable }
            petGeneBank: {}, // { petId: { attack: 0-3, defense: 0-3, ... } } - 基因库，记录每个宠物携带的基因强度
            // V15 轮回转世系统字段
            reincarnation: {
                count: 0,              // 转世次数
                soulAge: 0,           // 灵魂修为（累计）
                pastLifeMemories: [],  // 前世记忆（可获得加成）
                rebirthCultivation: 0, // 重修时保留的修为（转化为基础属性）
                hasReincarnatedBuff: false, // 转世重修buff
                reincarnatedFromAchievement: false // 是否通过成就触发转世
            },
            // 三界排行榜PVP系统字段
            rankingPVP: {
                enabled: true,
                rating: 1000,              // 积分
                rank: '凡人',              // 段位名称
                rankLevel: 0,              // 段位等级 (0-9)
                wins: 0,                   // 累计胜场
                losses: 0,                 // 累计负场
                currentStreak: 0,          // 当前连胜/连负
                bestStreak: 0,             // 最高连胜
                season: 1,                  // 当前赛季
                seasonStartDay: 1,         // 赛季开始天数
                lastSeasonRewardClaimed: false, // 上赛季奖励是否已领取
                realmDivision: 'human',     // 所在境界分区: human/cultivation/immortal
                battleHistory: [],         // PVP战斗历史
                dailyChallenges: 3,       // 每日挑战次数
                lastChallengeDay: 0,      // 上次重置挑战次数的日期
                seasonRewards: {           // 赛季奖励记录
                    lastSeason: 0,
                    claimed: []
                }
            }
        };

        // --- miniMaxConfig ---
        let miniMaxConfig = {
            apiKey: '',
            baseUrl: 'https://api.minimaxi.com/v1',
            model: 'MiniMax-M2.7',
            groupId: '',
            features: {
                aiDialogue: false,
                aiSerendipity: false,
                aiTechnique: false
            }
        };

        // --- combatState (5037-5051) ---
        let combatState = {
            inProgress: false,
            player: null,
            opponent: null,
            round: 0,
            turn: 'player',
            playerAction: null,
            playerSubAction: null,
            log: [],
            effects: {
                player: { attacking: false, defending: false, attackBoost: 0, defenseBoost: 0, ignoreDefense: false, burning: 0, frozen: 0, manaDrain: 0 },
                opponent: { attacking: false, defending: false, attackBoost: 0, defenseBoost: 0, burning: 0, frozen: 0 }
            },
            battleRecord: []
        };

        // --- secretRealmState (7391-7398) ---
        let secretRealmState = {
            wave: 0,
            totalWaves: 3,
            enemies: [],
            playerHP: 0,
            playerMaxHP: 0,
            rewards: []
        };

// ===== ui.js =====

        // --- CONTINENTS (7877-7926) ---
        const CONTINENTS = {
            '中州': {
                icon: '🏯',
                requiredRealm: 0, // 筑基
                dangerLevel: 1,
                description: '新手大陆，安全区域，宗门林立',
                color: '#4caf50',
                regions: ['中州城', '中州野外', '青云山']
            },
            '南疆': {
                icon: '🌴',
                requiredRealm: 1, // 金丹
                dangerLevel: 2,
                description: '妖兽聚集之地，材料丰富',
                color: '#ff9800',
                regions: ['南疆密林', '妖兽谷', '毒瘴沼泽']
            },
            '北域': {
                icon: '❄️',
                requiredRealm: 2, // 元婴
                dangerLevel: 3,
                description: '宗门林立，功法交易盛行',
                color: '#2196f3',
                regions: ['北域雪山', '冰魄宫', '寒冰洞府']
            },
            '西域': {
                icon: '🏜️',
                requiredRealm: 3, // 化神
                dangerLevel: 4,
                description: '秘境众多，机缘深厚',
                color: '#ff5722',
                regions: ['西域沙漠', '火焰山', '风沙遗迹']
            },
            '东海': {
                icon: '🌊',
                requiredRealm: 2, // 元婴
                dangerLevel: 3,
                description: '海族领地，神兽出没',
                color: '#00bcd4',
                regions: ['东海渔村', '深海礁石', '龙宫入口']
            },
            '仙界碎片': {
                icon: '✨',
                requiredRealm: 4, // 渡劫
                dangerLevel: 5,
                description: '飞升前最终试炼，蕴含成仙之秘',
                color: '#9c27b0',
                regions: ['仙府遗迹', '天劫之渊', '飞升祭坛']
            },
            '天外天': {
                icon: '🌌',
                requiredRealm: 5, // 飞升后
                dangerLevel: 5,
                description: '诸天万界交汇之地，超脱轮回之所',
                color: '#ffd700',
                regions: ['天道碎片', '命运长河', '轮回之地', '大道之树', '永恒星域']
            }
        };

        // ===== 三十三天剧情配置 =====
        const THIRTY_THREE_HEAVENS = [
            { id: 1, name: '第一重天·太皇天', desc: '凡界飞升者初至此地', lore: '传闻太皇天是凡界与仙界的中转站，凡是通过飞升的修士都会在此接受天道法则的洗礼...' },
            { id: 2, name: '第二重天·太明天', desc: '日月交替之光', lore: '太明天的光芒由上古神龙掌控，据说这里的阳光能照见修士的前世今生...' },
            { id: 3, name: '第三重天·玉明天', desc: '美玉无瑕之境', lore: '玉明天遍地产灵玉，修士在此可净化身心，祛除心魔...' },
            { id: 4, name: '第四重天·宝明天', desc: '万宝归宗之所', lore: '宝明天藏有上古仙府遗迹，无数宝物等待有缘人...' },
            { id: 5, name: '第五重天·望天', desc: '登高望远之地', lore: '望天之上可远眺诸天万界，是观测仙界动向的最佳位置...' },
            { id: 6, name: '第六重天·弧天', desc: '天弧环绕之界', lore: '弧天被神秘天弧环绕，传说弧心处藏有天道残卷...' },
            { id: 7, name: '第七重天·咸天', desc: '仙凡交汇之处', lore: '咸天是仙界与凡间的连接点，无数位面在此交汇...' },
            { id: 8, name: '第八重天·太极天', desc: '阴阳初分之地', lore: '太极天蕴含阴阳法则，修士可在此领悟生死轮回之秘...' },
            { id: 9, name: '第九重天·皓天', desc: '纯净无瑕之天', lore: '皓天终年洁白无瑕，是洗涤罪孽的圣地...' },
            { id: 10, name: '第十重天·元天', desc: '万物元始之地', lore: '元天是诸天万界的起源，所有法则的起点...' },
            { id: 11, name: '第十一重天·贞天', desc: '坚定不渝之心', lore: '贞天考验修士的道心，唯有信念坚定者方可通过...' },
            { id: 12, name: '第十二重天·是天', desc: '天命所归之处', lore: '是天承载天命，是非成败皆由天定...' },
            { id: 13, name: '第十三重天·遁天', desc: '隐世修行之所', lore: '遁天藏于诸天之外，是隐世大能的道场...' },
            { id: 14, name: '第十四重天·信天', desc: '信念凝聚之地', lore: '信天能让修士的道心化作实质，信念越强力量越强...' },
            { id: 15, name: '第十五重天·午天', desc: '天之正中', lore: '午天位于三十三天的正中，是天地交泰之地...' },
            { id: 16, name: '第十六重天·上升天', desc: '飞升者的圣地', lore: '上升天是历代飞升成功的修士最终归宿...' },
            { id: 17, name: '第十七重天·释罗天', desc: '佛法东渐之地', lore: '释罗天融汇佛道两家之学，是佛道双修者的圣地...' },
            { id: 18, name: '第十八重天·牟工天', desc: '天工匠造之所', lore: '牟工天是上古天工匠的遗迹，藏有失传的炼器秘术...' },
            { id: 19, name: '第十九重天·目 Junction 天', desc: '诸天枢纽', lore: '目 Junction 天连接三十三天，是诸天之间的交通要道...' },
            { id: 20, name: '第二十重天·静天', desc: '万籁俱寂之地', lore: '静天无声无息，是参悟天道寂灭之法的圣地...' },
            { id: 21, name: '第二十一重天·冀天', desc: '希望与期盼', lore: '冀天承载着无数修士的希望，是愿望之力的汇聚之地...' },
            { id: 22, name: '第二十二重天·郡天', desc: '天之疆域', lore: '郡天划分三十三天的疆域，各路势力在此角力...' },
            { id: 23, name: '第二十三重天·祥天', desc: '瑞气千条之所', lore: '祥天遍布祥瑞之气，是福缘深厚者的洞府...' },
            { id: 24, name: '第二十四重天·温天', desc: '温和如玉之境', lore: '温天气候宜人，是修身养性的绝佳去处...' },
            { id: 25, name: '第二十五重天·江天', desc: '大江东去之境', lore: '江天有一条天河支流，传说能洗净世间一切烦恼...' },
            { id: 26, name: '第二十六重天·辅天', desc: '辅弼天地之所', lore: '辅天辅助天道运转，是天道的左膀右臂...' },
            { id: 27, name: '第二十七重天·弼天', desc: '天道之臂膀', lore: '弼天与辅天相辅相成，共同维护天道秩序...' },
            { id: 28, name: '第二十八重天·邪天', desc: '天之暗面', lore: '邪天与诸天对立，是天道的阴暗面，藏有禁忌之力...' },
            { id: 29, name: '第二十九重天·真天', desc: '返璞归真之地', lore: '真天能让修士返璞归真，回归最纯粹的自我...' },
            { id: 30, name: '第三十重天·天中天', desc: '天外有天', lore: '天中天是三十三天的中心，天道法则在此汇聚...' },
            { id: 31, name: '第三十一重天·定天', desc: '永恒不动之地', lore: '定天是三十三天最稳定之地，时间在此静止...' },
            { id: 32, name: '第三十二重天·镜天', desc: '映照万界之镜', lore: '镜天有一面天道镜，能映照诸天万界的过去与未来...' },
            { id: 33, name: '第三十三重天·道天', desc: '天道最终奥秘', lore: '道天是三十三天的尽头，也是天道最终奥秘的所在。传闻只有超脱者方能踏入此地，领悟天道最终奥义...' },
            { id: 34, name: '第三十四重天·天外天', desc: '诸天之外之地', lore: '天外天藏于诸天之上，是超脱者方能触及的禁忌领域。此地蕴含打破天道枷锁的秘密...' },
            { id: 35, name: '第三十五重天·虚道天', desc: '虚空证道之所', lore: '虚道天无天无地，唯有一片混沌虚空。传说在此地可以剥离一切后天之道，回归先天本源...' },
            { id: 36, name: '第三十六重天·本源天', desc: '天道本源之地', lore: '本源天是天道法则的起源，是一切道法的根源。传闻踏入此地者将与天道合真，成为新的天道化身...' },
            { id: 37, name: '第三十七重天·超脱天', desc: '混沌虚无之地', lore: '超脱天藏于天道之外，是一片永恒的混沌虚无。只有集齐三十六枚法则印记的超脱者，方能触及此地...' },
            { id: 38, name: '第三十八重天·天命天', desc: '最终归宿之地', lore: '天命天是所有超脱者的最终归宿，在此地将面临天道最终的选择：超脱、回归或永恒...' }
        ];

        // 主线剧情配置
        const MAIN_PLOT = {
            act1: {
                title: '第一幕：迷惘者',
                description: '你从沉睡中醒来，发现自己身处天外天，却不记得自己的过去...',
                trigger: '进入天外天且未触发过剧情',
                rewards: []
            },
            act2: {
                title: '第二幕：三十三天',
                description: '一位神秘老者告诉你，天外天之上还有三十三天，而你或许是解开天道奥秘的关键...',
                trigger: '探索天外天区域达到3次',
                rewards: []
            },
            act3: {
                title: '第三幕：仙界之谜',
                description: '你在探索中发现，天外天与仙界之间有着不为人知的秘密...',
                trigger: '探索完10重三十三天',
                rewards: []
            },
            act4: {
                title: '第四幕：真相大白',
                description: '当你踏足第三十三重天道天时，一切真相终于揭晓...',
                trigger: '探索完33重三十三天',
                rewards: []
            },
            act5: {
                title: '第五幕：超脱永恒',
                description: '道祖遗迹中隐藏着终极奥秘，天道印记指引着你找到通往超脱之路...',
                trigger: '获得天道印记并探索道祖遗迹',
                rewards: []
            }
        };

        // --- REGIONS (7929-8052) ---
        const REGIONS = {
            '中州城': {
                type: 'safe', // 安全区
                monsters: [],
                resources: ['灵草', '普通矿石'],
                description: '繁华的修仙者聚落，可休息和交易'
            },
            '中州野外': {
                type: 'wild', // 野外区
                monsters: ['野兔精', '狐狸精'],
                monsterLevel: [1, 5],
                resources: ['灵草', '妖兽血'],
                description: '中州边缘的野外区域，有低级妖兽出没'
            },
            '青云山': {
                type: 'secret', // 秘境
                secretRealm: '青云洞府',
                difficulty: 'low',
                description: '上古修士洞府，藏有入门功法'
            },
            '南疆密林': {
                type: 'wild',
                monsters: ['妖兽狼', '巨蟒'],
                monsterLevel: [10, 20],
                resources: ['妖兽皮', '妖兽骨', '南疆蛊虫'],
                description: '密林深处，妖兽横行'
            },
            '妖兽谷': {
                type: 'boss', // 有首领
                monsters: ['妖兽狼王'],
                monsterLevel: [25],
                bossName: '妖兽谷主',
                resources: ['妖兽皮', '兽王胆'],
                description: '妖兽聚集之地，首领，每7天刷新'
            },
            '毒瘴沼泽': {
                type: 'wild',
                monsters: ['毒蛙', '沼蟒'],
                monsterLevel: [15, 25],
                resources: ['毒囊', '沼泽精华'],
                description: '充满毒气的沼泽区域'
            },
            '北域雪山': {
                type: 'wild',
                monsters: ['冰魄熊', '雪怪'],
                monsterLevel: [25, 35],
                resources: ['冰魄精', '寒冰髓'],
                description: '终年积雪，寒冷刺骨'
            },
            '冰魄宫': {
                type: 'boss',
                monsters: ['冰魄熊王'],
                monsterLevel: [40],
                bossName: '冰魄宫主',
                resources: ['冰魄精', '万年寒冰'],
                description: '冰系修士的圣地，首领，每7天刷新'
            },
            '寒冰洞府': {
                type: 'secret',
                secretRealm: '上古冰宫',
                difficulty: 'medium',
                description: '上古遗迹，藏有冰系高阶功法'
            },
            '西域沙漠': {
                type: 'wild',
                monsters: ['沙虫', '蝎王'],
                monsterLevel: [40, 50],
                resources: ['沙之心', '蝎王毒'],
                description: '茫茫沙漠，危机四伏'
            },
            '火焰山': {
                type: 'boss',
                monsters: ['火焰狮王'],
                monsterLevel: [55],
                bossName: '火焰山主',
                resources: ['火精', '熔岩核心'],
                description: '火焰肆虐之地，首领，每7天刷新'
            },
            '风沙遗迹': {
                type: 'secret',
                secretRealm: '古修士遗迹',
                difficulty: 'high',
                description: '上古遗迹，藏有混沌石'
            },
            '东海渔村': {
                type: 'safe',
                monsters: [],
                resources: ['珍珠', '海藻'],
                description: '东海之滨的小渔村，可休整'
            },
            '深海礁石': {
                type: 'wild',
                monsters: ['海妖', '巨型章鱼'],
                monsterLevel: [35, 45],
                resources: ['海妖珠', '深海珍珠'],
                description: '深海区域，海族妖兽出没'
            },
            '龙宫入口': {
                type: 'secret',
                secretRealm: '东海龙宫',
                difficulty: 'high',
                description: '传说中龙族的宫殿，藏有龙族秘宝'
            },
            '仙府遗迹': {
                type: 'secret',
                secretRealm: '仙府',
                difficulty: 'extreme',
                description: '仙界碎片中的遗迹，有飞升道具'
            },
            '天劫之渊': {
                type: 'boss',
                monsters: ['天劫守护兽'],
                monsterLevel: [70],
                bossName: '天劫化身',
                resources: ['天劫雷晶', '渡劫丹方'],
                description: '天劫之力凝聚，首领，每7天刷新'
            },
            '飞升祭坛': {
                type: 'secret',
                secretRealm: '飞升台',
                difficulty: 'extreme',
                description: '最终飞升之地，需要渡劫期才能进入'
            },
            // 天外天区域
            '天道碎片': {
                type: 'secret',
                secretRealm: '天道遗迹',
                difficulty: 'beyond',
                description: '天道意志碎片，蕴含宇宙本源之力'
            },
            '命运长河': {
                type: 'wild',
                monsters: ['命运守护者', '时间长河之灵'],
                monsterLevel: [80, 90],
                resources: ['命运之水', '时间法则碎片'],
                description: '过去未来交汇之处，窥探天机'
            },
            '轮回之地': {
                type: 'boss',
                monsters: ['轮回之主'],
                monsterLevel: [85],
                bossName: '六道轮回神',
                resources: ['轮回法则', '转世金丹'],
                description: '轮回法则凝聚之地，每7天刷新'
            },
            '大道之树': {
                type: 'secret',
                secretRealm: '道果秘境',
                difficulty: 'beyond',
                description: '万道之根源，藏有证道之机'
            },
            '永恒星域': {
                type: 'wild',
                monsters: ['星辰守护兽', '虚空邪神'],
                monsterLevel: [90, 100],
                resources: ['永恒星核', '虚空法则'],
                description: '永恒不朽的星海，超脱生死之地'
            }
        };

        // --- SECRET_REALMS (8055-8086) ---
        const SECRET_REALMS = {
            '青云洞府': {
                duration: 30,
                reward: '入门功法',
                successRate: 0.8
            },
            '上古冰宫': {
                duration: 40,
                reward: '冰系功法',
                successRate: 0.6
            },
            '古修士遗迹': {
                duration: 50,
                reward: '混沌石',
                successRate: 0.4
            },
            '东海龙宫': {
                duration: 50,
                reward: '龙族材料',
                successRate: 0.35
            },
            '仙府': {
                duration: 60,
                reward: '飞升道具',
                successRate: 0.25
            },
            '飞升台': {
                duration: 60,
                reward: '飞升丹',
                successRate: 0.2
            },
            // 天外天秘境
            '天道遗迹': {
                duration: 90,
                reward: '天道法则',
                successRate: 0.15
            },
            '道果秘境': {
                duration: 120,
                reward: '大道之果',
                successRate: 0.1
            }
        };

// ===== achievements.js =====
// V28 成就系统大改版

        // ===== getRarityWeight =====
        function getRarityWeight(rarity) {
            const weights = { common: 1.0, rare: 1.5, legendary: 2.0, mythic: 3.0 };
            return weights[rarity] || 1.0;
        }

        // ===== getSeasonMultiplier =====
        function getSeasonMultiplier() {
            const season = SEASONS.find(s => s.id === gameState.currentSeason);
            return season ? season.pointsMultiplier : 1.0;
        }

        // ===== getAchievementPoints =====
        function getAchievementPoints(rarity) {
            const basePoints = { common: 10, rare: 25, legendary: 50, mythic: 100 };
            const base = basePoints[rarity] || 10;
            return Math.floor(base * getRarityWeight(rarity) * getSeasonMultiplier());
        }

        // ===== checkAchievements (V28重写) =====
        function checkAchievements() {
            if (!gameState.achievements) {
                gameState.achievements = {
                    unlocked: [],
                    titles: [],
                    stats: {
                        tribulationsCompleted: 0,
                        dungeonBossesKilled: 0,
                        sectContributions: 0,
                        treasuresRefined: 0,
                        serendipitiesEncountered: 0,
                        flawlessTribulations: 0
                    },
                    progress: {},
                    claimedStages: {},
                    seasonPoints: 0,
                    seasonRewards: []
                };
            }

            const ach = gameState.achievements;
            if (!ach.progress) ach.progress = {};
            if (!ach.claimedStages) ach.claimedStages = {};

            for (const achievement of ACHIEVEMENTS) {
                // 如果是赛季成就，跳过非当前赛季的成就
                if (achievement.season && achievement.season !== gameState.currentSeason) continue;

                const req = achievement.requirement;
                const progressKey = achievement.id;
                let currentProgress = ach.progress[progressKey] || 0;
                let newProgress = currentProgress;

                // 计算当前进度
                if (req) {
                    if (req.type === 'stat') {
                        const statValue = ach.stats[req.key] || 0;
                        newProgress = Math.max(currentProgress, statValue);
                        ach.progress[progressKey] = newProgress;
                    } else if (req.type === 'realm') {
                        newProgress = Math.max(currentProgress, gameState.realm);
                        ach.progress[progressKey] = newProgress;
                    } else if (req.type === 'set') {
                        // 套装检查需要特殊处理
                        const set = SET_BONUSES[req.setName];
                        if (set) {
                            const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
                            const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
                            const allPieces = [...new Set([...equipped, ...owned])];
                            const collectedCount = set.pieces.filter(p => allPieces.includes(p)).length;
                            newProgress = Math.max(currentProgress, collectedCount);
                            ach.progress[progressKey] = newProgress;
                        }
                    } else if (req.type === 'allCommon') {
                        // 检查所有common成就是否解锁
                        const commonAchs = ACHIEVEMENTS.filter(a => a.rarity === 'common');
                        const allUnlocked = commonAchs.every(a => ach.unlocked.includes(a.id));
                        newProgress = allUnlocked ? 1 : 0;
                        ach.progress[progressKey] = newProgress;
                    }
                } else if (achievement.stages) {
                    // 有阶段系统的成就，根据阶段目标更新进度
                    // 进度来源由外部更新（如cultivation_count等）
                    newProgress = currentProgress;
                }

                // 处理阶段奖励解锁
                if (achievement.stages) {
                    const claimed = ach.claimedStages[progressKey] || [];
                    for (let i = 0; i < achievement.stages.length; i++) {
                        if (claimed.includes(i)) continue;
                        const stage = achievement.stages[i];
                        if (newProgress >= stage.value) {
                            // 解锁该阶段奖励
                            applyAchievementReward(stage.reward);
                            claimed.push(i);
                            addLog('good', '🏆 阶段奖励解锁', `【${achievement.name}】阶段${i+1}奖励已发放！`);
                        }
                    }
                    ach.claimedStages[progressKey] = claimed;
                }

                // 检查成就是否完全解锁（对于非阶段制成就）
                const alreadyUnlocked = ach.unlocked.includes(achievement.id);
                if (!alreadyUnlocked) {
                    let unlocked = false;

                    if (req) {
                        if (req.type === 'stat') {
                            if ((ach.stats[req.key] || 0) >= req.value) unlocked = true;
                        } else if (req.type === 'realm') {
                            if (gameState.realm >= req.value) unlocked = true;
                        } else if (req.type === 'set') {
                            const set = SET_BONUSES[req.setName];
                            if (set) {
                                const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
                                const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
                                const allPieces = [...new Set([...equipped, ...owned])];
                                unlocked = set.pieces.every(p => allPieces.includes(p));
                            }
                        } else if (req.type === 'allCommon') {
                            unlocked = newProgress >= 1;
                        }
                    } else if (achievement.stages) {
                        // 阶段制成就：所有阶段都完成才算完全解锁
                        const lastStage = achievement.stages[achievement.stages.length - 1];
                        if (newProgress >= lastStage.value) unlocked = true;
                    }

                    if (unlocked) {
                        ach.unlocked.push(achievement.id);
                        
                        // 应用奖励（阶段制成就的最终奖励）
                        if (achievement.reward) {
                            applyAchievementReward(achievement.reward);
                        }
                        
                        // 给予称号
                        if (achievement.title && !ach.titles.includes(achievement.title)) {
                            ach.titles.push(achievement.title);
                            if (!gameState.title || gameState.title === '筑基修士') {
                                gameState.title = achievement.title;
                            }
                        }

                        // 计算并添加赛季积分
                        const points = getAchievementPoints(achievement.rarity);
                        ach.seasonPoints += points;

                        // 飘字提示
                        const rarityIcon = achievement.rarity === 'legendary' ? '⭐' : achievement.rarity === 'mythic' ? '🌟' : '🏆';
                        addLog('good', `${rarityIcon} 成就解锁`, `【${achievement.name}】${achievement.desc}！+${points}赛季积分`);
                        
                        // 保存游戏
                        saveGame();
                    }
                }
            }
        }

        // ===== applyAchievementReward (V28扩展) =====
        function applyAchievementReward(reward) {
            if (!reward) return;
            switch (reward.type) {
                case 'attribute':
                    // 属性加成记录到对应字段（由getTitleBonus处理）
                    break;
                case 'title':
                    if (reward.title && gameState.achievements && !gameState.achievements.titles.includes(reward.title)) {
                        gameState.achievements.titles.push(reward.title);
                    }
                    break;
                case 'frame':
                    gameState.equippedFrame = reward.item;
                    addLog('good', '头像框获得', `获得头像框：${reward.item}`);
                    break;
                case 'bubble':
                    gameState.equippedBubble = reward.item;
                    addLog('good', '气泡获得', `获得气泡：${reward.item}`);
                    break;
                case 'item':
                    if (reward.item && reward.quantity) {
                        addToInventory(reward.item, reward.quantity);
                        addLog('good', '道具获得', `获得 ${reward.item} x${reward.quantity}`);
                    }
                    break;
                case 'pet':
                    // 宠物解锁逻辑
                    break;
            }
        }

        // ===== getSeasonCountdown =====
        function getSeasonCountdown() {
            const season = SEASONS.find(s => s.id === gameState.currentSeason);
            if (!season) return '无活动赛季';
            const end = new Date(season.endDate).getTime();
            const now = Date.now();
            const days = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
            const hours = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60)) % 24);
            return `剩余 ${days} 天 ${hours} 小时`;
        }

        // ===== claimAchievementStage =====
        function claimAchievementStage(achId, stageIdx) {
            const ach = ACHIEVEMENTS.find(a => a.id === achId);
            if (!ach || !ach.stages) return;
            const stage = ach.stages[stageIdx];
            if (!stage) return;
            
            const claimed = gameState.achievements.claimedStages[achId] || [];
            if (claimed.includes(stageIdx)) {
                addLog('warn', '阶段奖励', '已领取过该阶段奖励');
                return;
            }
            
            // 应用奖励
            applyAchievementReward(stage.reward);
            
            // 标记已领取
            if (!gameState.achievements.claimedStages[achId]) {
                gameState.achievements.claimedStages[achId] = [];
            }
            gameState.achievements.claimedStages[achId].push(stageIdx);
            
            addLog('good', '阶段奖励领取', `${ach.name} 阶段${stageIdx + 1}奖励已发放`);
            updateDisplay();
            saveGame();
        }

        // ===== claimSeasonReward =====
        function claimSeasonReward(rewardIdx) {
            const season = SEASONS.find(s => s.id === gameState.currentSeason);
            if (!season) return;
            const reward = season.rewards[rewardIdx];
            if (!reward) return;
            
            if (gameState.achievements.seasonRewards.includes(rewardIdx)) {
                addLog('warn', '赛季奖励', '已领取过该奖励');
                return;
            }
            
            if (gameState.achievements.seasonPoints < reward.points) {
                addLog('warn', '赛季奖励', `积分不足，需要 ${reward.points} 积分，当前 ${gameState.achievements.seasonPoints}`);
                return;
            }
            
            gameState.achievements.seasonPoints -= reward.points;
            gameState.achievements.seasonRewards.push(rewardIdx);
            
            if (reward.type === 'frame') gameState.equippedFrame = reward.item;
            if (reward.type === 'bubble') gameState.equippedBubble = reward.item;
            if (reward.type === 'title' && reward.item) {
                if (!gameState.achievements.titles.includes(reward.item)) {
                    gameState.achievements.titles.push(reward.item);
                }
            }
            
            addLog('good', '赛季奖励', `已兑换：${reward.item}`);
            updateDisplay();
            saveGame();
        }

        // ===== filterAchievements =====
        let currentAchievementFilter = 'all';
        function filterAchievements(category) {
            currentAchievementFilter = category;
            renderAchievements();
        }



        // ===== getTitleBonus =====
        function getTitleBonus() {
            const bonuses = {
                cultivationSpeed: 0,
                attack: 0,
                defense: 0,
                craftingSuccess: 0,
                serendipityRate: 0,
                realmSuppression: 0,
                setBonus: 0,
                tribulationCost: 0,
                sectContribution: 0
            };

            if (!gameState.title || !gameState.achievements) return bonuses;

            // 遍历所有已解锁的成就，找出当前称号对应的加成
            const ach = gameState.achievements;
            for (const achievement of ACHIEVEMENTS) {
                if (ach.unlocked.includes(achievement.id)) {
                    const reward = achievement.reward;
                    if (reward.type === 'attribute') {
                        if (bonuses.hasOwnProperty(reward.target)) {
                            bonuses[reward.target] += reward.bonus;
                        }
                    }
                }
            }

            return bonuses;
        }

        // ===== equipTitle =====
        function equipTitle(titleName) {
            if (!gameState.achievements || !gameState.achievements.titles.includes(titleName)) {
                addLog('bad', '称号装备', '你还没有获得这个称号！');
                return;
            }
            gameState.title = titleName;
            addLog('good', '称号装备', `已装备称号：【${titleName}】`);
            updateDisplay();
            saveGame();
        }







// ===== cultivation.js =====



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
            // 仙宠加成：麒麟提供修炼速度
            const petCultBonus = getPetBonus('cultivate_speed');
            if (petCultBonus > 0) {
                baseGain *= (1 + petCultBonus);
            }
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
            
            // 仙宠系统每日处理
            processPetDaily();
            
            // 双轨系统每日资源同步
            processDailyDualTrackSync();

            // 仙界经济系统每日结算
            processCelestialEconomyDaily();

            // V39: NPC自主行动每日结算
            processNpcAutonomousLoop();

            // V48: 插件系统每日钩子
            if (typeof callPluginHook === 'function') {
                callPluginHook('onDayChange', gameState.days);
            }

            // V6: 检查是否触发奇遇
            const serendipityResult = checkSerendipity();
            if (serendipityResult) {
                showSerendipityModal(serendipityResult);
            }

            // 自动云端存档
            autoCloudSave();
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
                    // 飞升到飞升期！
                    if (gameState.realm === 4) {
                        // 突破到飞升期
                        gameState.realm = 5;
                        gameState.stage = 0;
                        gameState.cultivationProgress = 0;
                        gameState.maxQi = REALM_REQUIREMENTS[5].maxQi;
                        gameState.qi = Math.floor(gameState.qi * 0.5);
                        gameState.mindset = Math.max(0, gameState.mindset - 5);
                        // 解锁天外天
                        unlockBeyondHeaven();
                        addLog('good', '白日飞升', `历经${gameState.days}天的修炼，你终于突破化神期，白日飞升！踏入天外天，探索诸天万界！`);
                        saveGame();
                        updateDisplay();
                    }
                    // 飞升期继续积累，不需要再突破
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
                if (gameState.realm === 4) {
                    // 突破到飞升期
                    gameState.realm = 5;
                    gameState.stage = 0;
                    gameState.cultivationProgress = 0;
                    gameState.maxQi = REALM_REQUIREMENTS[5].maxQi;
                    gameState.qi = Math.floor(gameState.qi * 0.5);
                    gameState.mindset = Math.max(0, gameState.mindset - 5);
                    // 解锁天外天
                    unlockBeyondHeaven();
                    addLog('good', '白日飞升', `历经${gameState.days}天的修炼，你终于突破化神期，白日飞升！踏入天外天，探索诸天万界！`);
                    saveGame();
                    updateDisplay();
                } else if (gameState.realm >= 5) {
                    // 飞升期继续
                    addLog('good', '修为精进', '你的修为在飞升期继续精进！');
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

        // ===== showTribulationUI (AI增强版) =====
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
            
            // 显示进度点
            const progressHtml = `
                <div class="tribulation-progress" style="margin-bottom:15px;">
                    ${Array.from({length: trib.stages}, (_, i) => {
                        let cls = 'tribulation-dot';
                        if (i < gameState.tribulation.currentStage) {
                            cls += ' completed';
                        } else if (i === gameState.tribulation.currentStage) {
                            cls += ' current';
                        }
                        return `<div class="${cls}"></div>`;
                    }).join('')}
                </div>
            `;
            
            scene.innerHTML = `
                ${progressHtml}
                <p style="color:#ffd700;font-size:1.1em">第 ${gameState.tribulation.currentStage + 1} / ${gameState.tribulation.totalStages} 重</p>
                <p style="color:#aaa;font-size:0.95em;margin-top:5px">${trib.desc}</p>
            `;

            // 尝试AI生成当前重数的天劫事件描述
            if (miniMaxConfig.apiKey) {
                const currentStage = gameState.tribulation.currentStage;
                generateStageEvent(currentStage, trib.type, (eventDesc) => {
                    if (eventDesc) {
                        scene.innerHTML = `
                            ${progressHtml}
                            <div class="tribulation-event" style="margin:10px 0;">
                                <p style="color:#ffd700;font-size:1.1em">第 ${currentStage + 1} / ${gameState.tribulation.totalStages} 重</p>
                                <p style="color:#e1bee7;font-style:italic;margin-top:8px">"${eventDesc}"</p>
                            </div>
                        `;
                    }
                });
            }

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

        // ===== generateTribulationScene (AI增强版) =====
        function generateTribulationScene(realm, callback) {
            const model = miniMaxConfig.model || 'MiniMax-M2.7';
            const tribKey = gameState.tribulation.tribKey;
            const trib = TRIBULATIONS[tribKey] || {};
            const tribTypeNames = { thunder: '九天神雷', fire: '琉璃阴火', wind: '九幽阴风', demon: '心魔入侵', all: '五行天劫' };
            const tribTypeName = tribTypeNames[trib.type] || '天劫';
            const stageInfo = trib.stage ? `${trib.stage}期` : '';
            
            const prompt = `你是一个修仙游戏的天劫场景生成器。请为玩家的渡劫场景生成一段沉浸式的独特描述。

当前玩家信息：
- 境界：${REALMS[realm] || '未知'}${stageInfo}
- 渡劫类型：${tribTypeName}
- 已渡过的重数：${gameState.tribulation.currentStage} / ${gameState.tribulation.totalStages}
- 心境：${gameState.mindset}/100
- 当前灵气：${gameState.qi}/${gameState.maxQi}

要求：
1. 生成一段80-150字的渡劫场景描述，要有画面感
2. 根据渡劫类型描写对应的天象异变：
   - 雷劫：乌云翻滚、电闪雷鸣、紫雷降世
   - 火劫：烈焰焚天、阴火缭绕、热浪灼烧
   - 风劫：狂风大作、飞沙走石、刮骨伐髓
   - 心魔：心魔入侵、幻象丛生、内心挣扎
   - 全部：五行交汇、天地变色
3. 包含角色的内心感受和身体反应
4. 描述要独特、有创意，体现每一重天劫的不同
5. 用中文输出，不要加引号或任何标记

直接输出场景描述文字。`;

            callMiniMaxAPI(prompt, model, 300, (reply) => {
                if (reply && reply.trim()) {
                    callback(reply.trim());
                } else {
                    callback(getDefaultTribulationScene(realm, trib.type));
                }
            }, (err) => {
                callback(getDefaultTribulationScene(realm, trib.type));
            });
        }

        // ===== generateStageEvent (AI生成单重天劫事件) =====
        function generateStageEvent(stageNum, tribType, callback) {
            if (!miniMaxConfig.apiKey) {
                callback(getDefaultStageEvent(stageNum, tribType));
                return;
            }
            
            const model = miniMaxConfig.model || 'MiniMax-M2.7';
            const tribTypeNames = { thunder: '九天神雷', fire: '琉璃阴火', wind: '九幽阴风', demon: '心魔入侵', all: '五行天劫' };
            const intensity = Math.min(1, 0.3 + (stageNum / gameState.tribulation.totalStages) * 0.7);
            
            const prompt = `你是一个修仙游戏的渡劫事件生成器。请为玩家的第${stageNum + 1}重天劫生成一个独特的事件描述。

天劫信息：
- 天劫类型：${tribTypeNames[tribType] || '天劫'}
- 当前第${stageNum + 1}重（共${gameState.tribulation.totalStages}重）
- 劫难强度：${Math.round(intensity * 100)}%

要求：
1. 生成一个30-60字的天劫事件描述
2. 描述这一重天劫的具体表现（如：第X道雷劈下、山崩地裂等）
3. 根据类型有所不同：
   - 雷劫：雷电的具体描写
   - 火劫：火焰的具体形态
   - 风劫：狂风的猛烈程度
   - 心魔：出现的幻象内容
4. 用中文输出，不要加引号
5. 只需要输出事件描述，不需要其他内容

直接输出事件描述。`;

            callMiniMaxAPI(prompt, model, 150, (reply) => {
                if (reply && reply.trim()) {
                    callback(reply.trim());
                } else {
                    callback(getDefaultStageEvent(stageNum, tribType));
                }
            }, (err) => {
                callback(getDefaultStageEvent(stageNum, tribType));
            });
        }

        // ===== generateResultNarrative (AI生成渡劫结果叙述) =====
        function generateResultNarrative(result, callback) {
            if (!miniMaxConfig.apiKey) {
                callback(null);
                return;
            }
            
            const model = miniMaxConfig.model || 'MiniMax-M2.7';
            const realmName = REALMS[gameState.realm] || '未知';
            const nextRealm = REALMS[gameState.realm + 1] || '下一个境界';
            
            let prompt = '';
            if (result === 'great_success') {
                prompt = `你是一个修仙游戏的叙述生成器。请为玩家的大成功渡劫结果生成一段叙述。

信息：
- 玩家刚渡过天劫，获得大成功
- 突破前境界：${realmName}
- 突破后境界：${nextRealm}
- 获得天劫洗礼加成：攻击+10%，防御+10%
- 心境提升

要求：
1. 生成一段40-80字的叙述
2. 描述天降祥瑞、灵力暴涨、身体蜕变等
3. 体现大成功的非凡之处
4. 用中文输出，不要加引号

直接输出叙述文字。`;
            } else if (result === 'success') {
                prompt = `你是一个修仙游戏的叙述生成器。请为玩家的普通成功渡劫结果生成一段叙述。

信息：
- 玩家成功渡过天劫
- 突破到${nextRealm}
- 获得天劫洗礼加成：攻击+5%，防御+5%

要求：
1. 生成一段40-80字的叙述
2. 描述天劫消退、境界稳固等
3. 体现成功的不易
4. 用中文输出，不要加引号

直接输出叙述文字。`;
            } else if (result === 'injury') {
                prompt = `你是一个修仙游戏的叙述生成器。请为玩家的渡劫重伤结果生成一段叙述。

信息：
- 玩家渡劫失败，身受重伤
- 当前境界：${realmName}
- 灵气大幅减少，心境下降

要求：
1. 生成一段40-80字的叙述
2. 描述天劫反噬、灵气溃散、身体受损等
3. 体现重伤的痛苦但保住了性命
4. 用中文输出，不要加引号

直接输出叙述文字。`;
            } else if (result === 'death') {
                prompt = `你是一个修仙游戏的叙述生成器。请为玩家的渡劫陨落结果生成一段叙述。

信息：
- 玩家渡劫失败，陨落
- 陨落前境界：${realmName}

要求：
1. 生成一段40-80字的叙述
2. 描述天劫毁灭、魂飞魄散等
3. 体现陨落的悲壮
4. 用中文输出，不要加引号

直接输出叙述文字。`;
            }

            callMiniMaxAPI(prompt, model, 150, (reply) => {
                callback(reply && reply.trim() ? reply.trim() : null);
            }, (err) => {
                callback(null);
            });
        }

        // ===== getDefaultTribulationScene (优化版) =====
        function getDefaultTribulationScene(realm, tribType) {
            const scenes = {
                thunder: [
                    '天空骤然暗沉，乌云如墨般压下，电蛇在云层中狂舞，一道道紫色的天雷在云间酝酿，整个世界仿佛都在这股天威下颤抖。',
                    '乌云翻滚如潮，雷光如网，天际被撕裂成一片紫白色的光芒海洋。你感到每一根毛发都因这股天威而颤栗。',
                    '闷雷从远处滚滚而来，紫色的电弧在云层中穿梭，天劫的威压让你的呼吸都变得困难，但你的道心坚定如铁。'
                ],
                fire: [
                    '虚空中燃起幽蓝色的火焰，琉璃色的火舌舔舐着你的肌肤，焚心烧魄的痛楚让你几乎站立不住，但你的意志坚不可摧。',
                    '阴火从地底渗出，将周围化为一片火海。那火焰看似美丽，却蕴含着足以焚毁一切的毁灭力量，正向你的位置蔓延。',
                    '天地间一片炽热，琉璃阴火在空中形成各种幻象，试图动摇你的心智。你紧守本心，任凭火焰灼烧。'
                ],
                wind: [
                    '狂风骤起，飞沙走石，虚空中裂开一道道金色的裂缝。九幽阴风如刀般切割着你的身体，每一缕风都像是在刮骨伐髓。',
                    '黑色的旋风从天而降，带着刺骨的寒意和毁灭的力量。风声中似乎夹杂着远古的咆哮，试图撕裂你的灵魂。',
                    '狂风呼啸如鬼哭狼嚎，风刃如雨点般向你袭来。你运转灵力护体，却仍感到阵阵刺痛。'
                ],
                demon: [
                    '心魔滋生，你的眼前出现无数幻象——过去的执念、内心的恐惧、隐藏的欲望，一一浮现，试图动摇你的道心。',
                    '黑暗中有什么东西在窥视着你，那是来自内心深处的心魔。它化为你最熟悉的人的模样，试图诱惑你放弃抵抗。',
                    '幻境丛生，你仿佛回到了过去某个难忘的时刻。但你知道这一切都是心魔的伎俩，唯有守住本心才能渡过此劫。'
                ],
                all: [
                    '天地变色，五行紊乱。雷、火、风三劫同时降临，加上心魔入侵，这是飞升前最后的考验。你感到前所未有的压力。',
                    '五行天劫同时爆发，天地间仿佛陷入了末世浩劫。雷电、阴火、狂风交织在一起，毁灭一切阻挡在前方的障碍。',
                    '苍穹裂开，无数异象从中倾泻而下。这是化神飞升的最终劫难，成败就在此一举。你的眼中燃烧着不屈的斗志。'
                ]
            };
            const typeScenes = scenes[tribType] || scenes.thunder;
            return typeScenes[realm % typeScenes.length];
        }

        // ===== getDefaultStageEvent =====
        function getDefaultStageEvent(stageNum, tribType) {
            const events = {
                thunder: [
                    `第一道天雷从天而降，带着毁灭一切的力量！`,
                    `第二道紫雷划破长空，直劈你的天灵盖！`,
                    `第三道雷劫更加猛烈，电光刺得你睁不开眼！`,
                    `雷云中降下第四道神雷，你全力运转护体灵光！`,
                    `第五道天雷蕴含天道意志，你感到骨骼都在颤抖！`,
                    `第六道雷劫中夹杂着金色电弧，威力倍增！`,
                    `第七道神雷如瀑布般倾泻而下！`,
                    `第八道天雷带着天道法则的压制！`,
                    `最后一道金色雷劫，代表着天道对你最后的考验！`
                ],
                fire: [
                    `琉璃阴火从地底涌出，包围了你的四周！`,
                    `第二重火劫，火焰颜色变为深蓝，温度骤升！`,
                    `第三重火海中出现了火焰幻兽！`,
                    `第四重阴火开始灼烧你的经脉！`,
                    `第五重火焰中蕴含着焚尽一切的力量！`,
                    `第六重火浪如潮水般向你涌来！`,
                    `第七重天火在你头顶凝聚成云！`,
                    `第八重烈火焚身，你咬牙坚持！`,
                    `最后一道琉璃圣火，考验你的极限！`
                ],
                wind: [
                    `九幽阴风从虚空中生成，环绕着你！`,
                    `第二重风劫，狂风开始撕扯你的身体！`,
                    `第三重风刃如刀，切割着你的皮肤！`,
                    `第四重风暴中夹杂着冰霜！`,
                    `第五重狂风让你的灵力护罩开始龟裂！`,
                    `第六重风劫带着刺骨的寒意！`,
                    `第七重风暴开始影响你的心智！`,
                    `第八重狂风如鬼哭狼嚎！`,
                    `最后一道灭世狂风，考验你的道心！`
                ],
                demon: [
                    `心魔初现，黑暗中有什么在注视着你！`,
                    `第二重心魔入侵，过去执念浮现！`,
                    `第三重幻境中，你看到了曾经的自己！`,
                    `第四重心魔化为你最亲的人试图诱惑！`,
                    `第五重幻境开始影响你的判断！`,
                    `第六重心魔试图瓦解你的信念！`,
                    `第七重最痛苦的回忆开始涌现！`,
                    `第八重心魔试图让你放弃抵抗！`,
                    `最后一道心魔，是你最深处的恐惧！`
                ],
                all: [
                    `五行之力开始汇聚，天地变色！`,
                    `第二重天劫降下，雷火交织！`,
                    `第三重狂风加入，威力剧增！`,
                    `第四重心魔开始入侵！`,
                    `第五重五行紊乱，你勉力支撑！`,
                    `第六重天地之力压制你！`,
                    `第七重三劫齐发，危在旦夕！`,
                    `第八重极限考验，道心动摇！`,
                    `最后一重，五行合一，渡劫成败在此一举！`
                ]
            };
            const typeEvents = events[tribType] || events.thunder;
            return typeEvents[Math.min(stageNum, typeEvents.length - 1)];
        }

        // ===== triggerLightningEffect (触发雷电特效) =====
        function triggerLightningEffect(container) {
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt';
            bolt.style.left = Math.random() * 80 + 10 + '%';
            bolt.style.top = '0';
            bolt.style.width = Math.random() * 4 + 2 + 'px';
            bolt.style.height = container.offsetHeight + 'px';
            container.appendChild(bolt);
            setTimeout(() => bolt.remove(), 500);
        }

        // ===== showTribulationProgressDots (显示进度点) =====
        function showTribulationProgressDots(container, currentStage, totalStages, results) {
            let html = '<div class="tribulation-progress">';
            for (let i = 0; i < totalStages; i++) {
                let cls = 'tribulation-dot';
                if (i < currentStage) {
                    cls += results && results[i] ? ' completed' : ' failed';
                } else if (i === currentStage) {
                    cls += ' current';
                }
                html += `<div class="${cls}"></div>`;
            }
            html += '</div>';
            container.innerHTML = html;
        }

        // Old function removed - replaced by AI-enhanced version above

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
            
            // 尝试获取AI生成的叙述
            generateResultNarrative('great_success', (narrative) => {
                const narrativeHtml = narrative ? `<p style="color:#e1bee7;margin-top:10px;font-style:italic">"${narrative}"</p>` : '';
                scene.innerHTML = `
                    <div class="tribulation-event">
                        <div class="tribulation-result great-success">
                            <h3>✨ 大成功 ✨</h3>
                            <p style="color:#ffd700">天劫洗礼，你的修为突飞猛进！</p>
                            <p style="color:#aaa;margin-top:10px">突破到${CONFIG.realms[gameState.realm]}期！</p>
                            <p style="color:#4caf50;margin-top:5px">获得天劫洗礼加成：攻击+10%，防御+10%</p>
                            <p style="color:#ff69b4;margin-top:5px">心境+20</p>
                            ${narrativeHtml}
                        </div>
                    </div>
                `;
            });

            addLog('good', '渡劫大成功', `历经天劫洗礼，突破到${CONFIG.realms[gameState.realm]}期！获得天劫洗礼加成！`);
            saveGame();
            updateDisplay();

            // 3秒后关闭
            setTimeout(() => {
                closeTribulationModal();
            }, 4000);
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
            
            // 尝试获取AI生成的叙述
            generateResultNarrative('success', (narrative) => {
                const narrativeHtml = narrative ? `<p style="color:#e1bee7;margin-top:10px;font-style:italic">"${narrative}"</p>` : '';
                scene.innerHTML = `
                    <div class="tribulation-event">
                        <div class="tribulation-result success">
                            <h3>🎉 渡劫成功 🎉</h3>
                            <p style="color:#aaa">你历经重重磨难，终于渡过天劫！</p>
                            <p style="color:#ffd700;margin-top:10px">突破到${CONFIG.realms[gameState.realm]}期！</p>
                            <p style="color:#4caf50;margin-top:5px">获得天劫洗礼加成：攻击+5%，防御+5%</p>
                            ${narrativeHtml}
                        </div>
                    </div>
                `;
            });

            addLog('good', '渡劫成功', `渡过${trib.desc}，突破到${CONFIG.realms[gameState.realm]}期！`);
            saveGame();
            updateDisplay();

            setTimeout(() => {
                closeTribulationModal();
            }, 4000);
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
            
            // 尝试获取AI生成的叙述
            generateResultNarrative('injury', (narrative) => {
                const narrativeHtml = narrative ? `<p style="color:#e1bee7;margin-top:10px;font-style:italic">"${narrative}"</p>` : '';
                scene.innerHTML = `
                    <div class="tribulation-event">
                        <div class="tribulation-result injury">
                            <h3>💔 重伤💔</h3>
                            <p style="color:#aaa">天劫反噬，你身受重伤...</p>
                            <p style="color:#ff9800;margin-top:10px">灵气大幅减少，心境下降</p>
                            <p style="color:#aaa;margin-top:10px">突破失败，但保住了性命</p>
                            ${narrativeHtml}
                        </div>
                    </div>
                `;
            });

            addLog('bad', '渡劫重伤', `渡过${trib.desc}失败，身受重伤...`);
            saveGame();
            updateDisplay();

            setTimeout(() => {
                closeTribulationModal();
            }, 4000);
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
            
            // 尝试获取AI生成的叙述
            generateResultNarrative('death', (narrative) => {
                const narrativeHtml = narrative ? `<p style="color:#e1bee7;margin-top:10px;font-style:italic">"${narrative}"</p>` : '';
                scene.innerHTML = `
                    <div class="tribulation-event">
                        <div class="tribulation-result death">
                            <h3>💀 陨落 💀</h3>
                            <p style="color:#f44336">天劫无情，你陨落了...</p>
                            <p style="color:#aaa;margin-top:10px">但天道循环，你得以转世重修</p>
                            <p style="color:#e1bee7;margin-top:10px">保留部分资源和记忆</p>
                            <p style="color:#ffd700;margin-top:10px">获得【转世重修】加成：成功率+10%</p>
                            ${narrativeHtml}
                        </div>
                    </div>
                `;
            });

            addLog('bad', '渡劫陨落', `渡劫失败，陨落了...但转世重修，获得转世buff！`);

            setTimeout(() => {
                closeTribulationModal();
                saveGame();
                showGameUI();
                updateDisplay();
            }, 4000);
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

// ===== combat.js =====

        // ===== calculateSetBonuses =====
        function calculateSetBonuses() {
            const equipped = [];
            if (combatState.player.weaponData) equipped.push(combatState.player.weaponData.name);
            if (combatState.player.armorData) equipped.push(combatState.player.armorData.name);
            if (combatState.player.accessories) {
                combatState.player.accessories.forEach(a => { if (a) equipped.push(a.name); });
            }
            const bonuses = {};
            const skills = [];
            for (const setName in SET_BONUSES) {
                const set = SET_BONUSES[setName];
                const matched = set.pieces.filter(p => equipped.includes(p));
                if (matched.length >= 2) {
                    bonuses[setName] = matched.length; // 2 or 3
                    if (matched.length === set.count && set.skill) skills.push(set.skill);
                }
            }
            combatState.player.setBonuses = bonuses;
            combatState.player.skills = skills;
            return bonuses;
        }

        // ===== recalculatePlayerStats =====
        function recalculatePlayerStats() {
            let attackBonus = 1.0, critBonus = 0, defenseBonus = 1.0, qiRegenBonus = 0;
            for (const setName in combatState.player.setBonuses) {
                const set = SET_BONUSES[setName];
                const count = combatState.player.setBonuses[setName];
                if (set.stats.attackPercent) attackBonus += set.stats.attackPercent * (count === 3 ? 1 : 0.5);
                if (set.stats.critPercent) critBonus += set.stats.critPercent * (count === 3 ? 1 : 0.5);
                if (set.stats.defensePercent) defenseBonus += set.stats.defensePercent * (count === 3 ? 1 : 0.5);
                if (set.stats.qiRegenPercent) qiRegenBonus += set.stats.qiRegenPercent * (count === 3 ? 1 : 0.5);
            }
            combatState.player.attackPercent = attackBonus;
            combatState.player.critBonus = critBonus;
            combatState.player.defensePercent = defenseBonus;
            combatState.player.qiRegenBonus = qiRegenBonus;
        }

        // ===== getCurrentUltimateSkills =====
        function getCurrentUltimateSkills() {
            const weaponData = combatState.player.weaponData || { name:'空手' };
            return ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
        }

        // ===== getEnergyBar =====
        function getEnergyBar() {
            const skills = getCurrentUltimateSkills();
            // 找到最低cost的技能作为能量条参考
            const minCost = skills.length > 0 ? Math.min(...skills.map(s => s.cost)) : 50;
            const pct = Math.min(100, (combatEnergy / minCost) * 100);
            const ready = combatEnergy >= minCost;
            return {
                current: combatEnergy,
                cost: minCost,
                pct,
                ready,
                skills
            };
        }

        // ===== executeUltimateSkill =====
        function executeUltimateSkill(skill) {
            const weaponData = combatState.player.weaponData || { name:'空手', star:1 };
            const level = combatState.player.skillLevels ? (combatState.player.skillLevels[skill.id] || 1) : 1;
            const starMultiplier = ENHANCE_CONFIG && ENHANCE_CONFIG.starMultipliers ? (ENHANCE_CONFIG.starMultipliers[weaponData.star] || 1.0) : 1.0;

            if (combatEnergy < skill.cost) return;

            combatEnergy -= skill.cost;
            combatState.round++;

            // 计算基础伤害
            const baseAttack = typeof calculatePlayerAttack === 'function' ? calculatePlayerAttack() : combatState.player.attack;
            const levelMultiplier = 1 + (level - 1) * 0.2;
            let damage = Math.floor(baseAttack * skill.damage * levelMultiplier * starMultiplier);

            // 功法克制
            if (TECHNIQUE_BONUS[combatState.player.technique].beats === combatState.opponent.technique) {
                damage = Math.floor(damage * 1.5);
            }

            const isCrit = Math.random() < combatState.player.critRate;
            if (isCrit) damage = Math.floor(damage * 1.5);

            let finalDamage = damage;
            if (!combatState.effects.player.ignoreDefense) {
                finalDamage = Math.max(1, damage - Math.floor(combatState.opponent.defense * 0.3));
            }
            combatState.opponent.hp = Math.max(0, combatState.opponent.hp - finalDamage);
            let logText = `⚡ ${weaponData.name} 发动 ${skill.name} Lv.${level}！造成 ${finalDamage} 伤害！${isCrit ? '（暴击）' : ''}`;

            // 应用效果
            if (skill.effects) {
                if (skill.effects.burn) {
                    const chance = skill.effects.burn * levelMultiplier;
                    if (Math.random() < chance) {
                        combatState.opponent.burning = skill.effects.burnTurns || 3;
                        logText += ` 🔥敌人被灼烧 ${combatState.opponent.burning} 回合！`;
                    }
                }
                if (skill.effects.freeze) {
                    const chance = skill.effects.freeze * levelMultiplier;
                    if (Math.random() < chance) {
                        combatState.opponent.frozen = skill.effects.freezeTurns || 2;
                        logText += ` ❄️敌人被冻结 ${combatState.opponent.frozen} 回合！`;
                    }
                }
                if (skill.effects.stun) {
                    if (Math.random() < skill.effects.stun * levelMultiplier) {
                        combatState.opponent.stunned = 1;
                        logText += ` 💫敌人被眩晕 1 回合！`;
                    }
                }
                if (skill.effects.defBoost) {
                    combatState.effects.player.defenseBoost = (combatState.effects.player.defenseBoost || 0) + skill.effects.defBoost * levelMultiplier;
                    logText += ` 🛡️防御提升 ${Math.round(skill.effects.defBoost * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.critBonus) {
                    combatState.effects.player.critBoostNext = (combatState.effects.player.critBoostNext || 0) + skill.effects.critBonus * levelMultiplier;
                    logText += ` 💥暴击率提升 ${Math.round(skill.effects.critBonus * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.drain) {
                    const drainAmount = Math.floor(finalDamage * skill.effects.drain * levelMultiplier);
                    combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + drainAmount);
                    logText += ` 💉吸取 ${drainAmount} HP！`;
                }
                if (skill.effects.trueDamage) {
                    const trueDmg = Math.floor(finalDamage * skill.effects.trueDamage * levelMultiplier);
                    combatState.opponent.hp = Math.max(0, combatState.opponent.hp - trueDmg);
                    logText += ` ✨真实伤害 +${trueDmg}！`;
                }
                if (skill.effects.healRate) {
                    const healPerTurn = Math.floor(combatState.player.maxHp * skill.effects.healRate * levelMultiplier);
                    combatState.effects.player.healRate = (combatState.effects.player.healRate || 0) + healPerTurn;
                    logText += ` 💚每回合恢复 ${healPerTurn} HP！`;
                }
                if (skill.effects.dmgReduce) {
                    combatState.effects.player.damageReduction = (combatState.effects.player.damageReduction || 0) + skill.effects.dmgReduce * levelMultiplier;
                    logText += ` 🛡️伤害减免 ${Math.round(skill.effects.dmgReduce * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.counterRate) {
                    combatState.effects.player.counterRate = (combatState.effects.player.counterRate || 0) + skill.effects.counterRate * levelMultiplier;
                    logText += ` ⚡反击率提升 ${Math.round(skill.effects.counterRate * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.speedReduce) {
                    combatState.opponent.speedReduce = (combatState.opponent.speedReduce || 0) + skill.effects.speedReduce * levelMultiplier;
                    logText += ` 🌪️敌人速度降低！`;
                }
                if (skill.effects.armorBreak) {
                    combatState.opponent.armorBroken = true;
                    logText += ` 💥敌人护甲破碎！`;
                }
                if (skill.effects.chain) {
                    if (combatState.opponent.hp > 0) {
                        const chainDmg = Math.floor(finalDamage * skill.effects.chain);
                        combatState.opponent.hp = Math.max(0, combatState.opponent.hp - chainDmg);
                        logText += ` ⛓️雷链传导，额外 ${chainDmg} 伤害！`;
                    }
                }
                if (skill.effects.fireResist) {
                    combatState.effects.player.fireResist = (combatState.effects.player.fireResist || 0) + skill.effects.fireResist;
                    logText += ` 🔥火抗提升！`;
                }
                if (skill.effects.fireDrain) {
                    combatState.effects.player.fireDrain = (combatState.effects.player.fireDrain || 0) + skill.effects.fireDrain;
                    logText += ` 🔥火焰吸收！`;
                }
                if (skill.effects.reflect) {
                    combatState.effects.player.reflect = (combatState.effects.player.reflect || 0) + skill.effects.reflect;
                    logText += ` 🔄伤害反射！`;
                }
                if (skill.effects.maxHpBoost) {
                    combatState.player.maxHP += Math.floor(combatState.player.maxHP * skill.effects.maxHpBoost);
                    combatState.player.hp = Math.min(combatState.player.hp, combatState.player.maxHP);
                    logText += ` ❤️最大HP提升！`;
                }
                if (skill.effects.cleanse) {
                    combatState.effects.player.cleanseStacks = (combatState.effects.player.cleanseStacks || 0) + skill.effects.cleanse;
                    logText += ` ✨净化负面状态！`;
                }
                if (skill.effects.invincible) {
                    combatState.effects.player.invincible = skill.effects.invincible;
                    logText += ` 👼无敌状态！`;
                }
                if (skill.effects.thunder) {
                    combatState.effects.player.thunderBonus = (combatState.effects.player.thunderBonus || 0) + skill.effects.thunder * levelMultiplier;
                    logText += ` ⚡雷法伤害+${Math.round(skill.effects.thunder * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.doubleHit) {
                    combatState.effects.player.doubleHit = (combatState.effects.player.doubleHit || 0) + skill.effects.doubleHit * levelMultiplier;
                    logText += ` ⚔️连击+${Math.round(skill.effects.doubleHit * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.pierce) {
                    combatState.effects.player.pierce = (combatState.effects.player.pierce || 0) + skill.effects.pierce * levelMultiplier;
                    logText += ` 🗡️穿刺+${Math.round(skill.effects.pierce * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.cleave) {
                    combatState.effects.player.cleave = (combatState.effects.player.cleave || 0) + skill.effects.cleave * levelMultiplier;
                    logText += ` 🌀顺劈+${Math.round(skill.effects.cleave * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.freezeAura) {
                    combatState.effects.player.freezeAura = (combatState.effects.player.freezeAura || 0) + skill.effects.freezeAura * levelMultiplier;
                    logText += ` ❄️冰霜光环！`;
                }
                if (skill.effects.burnAura) {
                    combatState.effects.player.burnAura = (combatState.effects.player.burnAura || 0) + skill.effects.burnAura * levelMultiplier;
                    logText += ` 🔥灼烧光环！`;
                }
                if (skill.effects.curse) {
                    combatState.effects.opponent.curse = (combatState.effects.opponent.curse || 0) + skill.effects.curse * levelMultiplier;
                    logText += ` 💀诅咒！`;
                }
            }

            combatState.log.push({ type: 'player-action', actionType: 'ultimate', text: logText, round: combatState.round });
            combatState.turn = 'opponent';
            renderCombatArena();

            if (combatState.opponent.hp <= 0) {
                setTimeout(() => endCombat('win'), 500);
            } else {
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }

        // ===== generateOpponent =====
        function generateOpponent(difficulty) {
            const playerRealm = gameState.realm;
            let targetRealm = playerRealm;
            if (difficulty === 'easy') targetRealm = Math.max(0, playerRealm - 1);
            else if (difficulty === 'normal') targetRealm = playerRealm;
            else if (difficulty === 'hard') targetRealm = Math.min(4, playerRealm + 1);

            const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
            const stages = ['初期', '中期', '后期'];
            const stage = Math.floor(Math.random() * 3);

            const hpByRealm = { 0: 500, 1: 800, 2: 1000, 3: 2000, 4: 5000 };
            const baseHp = hpByRealm[targetRealm] || 1000;
            const baseAttack = 80 + targetRealm * 40;
            const baseDefense = 40 + targetRealm * 20;
            const baseSpeed = 80 + targetRealm * 15;

            const technique = TECHNIQUES[Math.floor(Math.random() * 4)];
            const treasures = Object.keys(COMBAT_TREASURES);
            const weapon = treasures.filter(t => COMBAT_TREASURES[t].type === 'weapon');
            const armor = treasures.filter(t => COMBAT_TREASURES[t].type === 'armor');

            const opponentFixed = FIXED_OPPONENTS[Math.floor(Math.random() * FIXED_OPPONENTS.length)];
            const name = difficulty === 'normal' ? opponentFixed.name : `${opponentFixed.name}（${['初级', '中级', '高级'][difficulty === 'easy' ? 0 : difficulty === 'normal' ? 1 : 2]}）`;

            return {
                name: name,
                avatar: opponentFixed.avatar,
                realm: targetRealm,
                realmName: realmNames[targetRealm] + '期' + stages[stage],
                maxHP: baseHp,
                hp: baseHp,
                attack: baseAttack,
                defense: baseDefense,
                speed: baseSpeed,
                technique: technique,
                techniqueColor: TECHNIQUE_COLORS[technique],
                weapon: weapon[Math.floor(Math.random() * weapon.length)],
                armor: armor[Math.floor(Math.random() * armor.length)],
                critRate: 0.1 + targetRealm * 0.03
            };
        }





        // ===== 三界排行榜PVP系统 =====

        // 段位配置
        const RANK_CONFIG = {
            human: { // 人间界 (炼气-筑基)
                name: '人间界',
                icon: '🌍',
                ranks: [
                    { name: '凡人', icon: '👤', minRating: 0 },
                    { name: '炼气修士', icon: '🌀', minRating: 1000 },
                    { name: '筑基修士', icon: '🧱', minRating: 1100 },
                    { name: '金丹真人', icon: '🌟', minRating: 1200 },
                    { name: '元婴老怪', icon: '👴', minRating: 1300 },
                    { name: '化神大能', icon: '🦢', minRating: 1400 }
                ]
            },
            cultivation: { // 修仙界 (元婴-化神)
                name: '修仙界',
                icon: '☁️',
                ranks: [
                    { name: '散修', icon: '🧙', minRating: 1400 },
                    { name: '宗门弟子', icon: '⚔️', minRating: 1500 },
                    { name: '内门精英', icon: '💎', minRating: 1600 },
                    { name: '长老', icon: '👑', minRating: 1700 },
                    { name: '宗主', icon: '🏰', minRating: 1800 },
                    { name: '飞升仙人', icon: '🌈', minRating: 1900 }
                ]
            },
            immortal: { // 仙界 (飞升后)
                name: '仙界',
                icon: '✨',
                ranks: [
                    { name: '地仙', icon: '🌍', minRating: 1900 },
                    { name: '天仙', icon: '☀️', minRating: 2000 },
                    { name: '金仙', icon: '🌟', minRating: 2100 },
                    { name: '大罗金仙', icon: '💫', minRating: 2200 },
                    { name: '准圣', icon: '🔱', minRating: 2300 },
                    { name: '圣人', icon: '👼', minRating: 2400 }
                ]
            }
        };

        // AI对手名称库
        const AI_OPPONENTS = {
            human: [
                '青云子', '玄天', '灵虚子', '玉清子', '天璇', '天玑', '天权', '玉衡',
                '开阳', '摇光', '紫霞仙子', '青莲剑仙', '血魔老祖', '九幽散人'
            ],
            cultivation: [
                '太虚真人', '虚无宗主', '万剑归宗', '九天玄女', '太古魔尊', '天道子',
                '轮回王', '不灭魔君', '仙盟盟主', '天魔教教主', '万妖女王', '诸神黄昏'
            ],
            immortal: [
                '盘古始祖', '鸿钧道祖', '女娲娘娘', '伏羲圣皇', '神农氏', '轩辕黄帝',
                '昊天上帝', '西王母', '东皇太一', '帝俊', '烛龙', '应龙'
            ]
        };

        // 获取玩家段位信息
        function getPlayerRankInfo() {
            const pvp = gameState.rankingPVP;
            const division = RANK_CONFIG[pvp.realmDivision];
            let rankIndex = 0;
            for (let i = 0; i < division.ranks.length; i++) {
                if (pvp.rating >= division.ranks[i].minRating) {
                    rankIndex = i;
                }
            }
            return {
                ...division.ranks[rankIndex],
                division: division,
                rankIndex: rankIndex,
                nextRank: division.ranks[rankIndex + 1] || null,
                rating: pvp.rating,
                wins: pvp.wins,
                losses: pvp.losses,
                streak: pvp.currentStreak
            };
        }

        // 更新玩家段位
        function updatePlayerRank() {
            const pvp = gameState.rankingPVP;
            const division = RANK_CONFIG[pvp.realmDivision];
            let rankIndex = 0;
            for (let i = 0; i < division.ranks.length; i++) {
                if (pvp.rating >= division.ranks[i].minRating) {
                    rankIndex = i;
                }
            }
            pvp.rank = division.ranks[rankIndex].name;
            pvp.rankLevel = rankIndex;
        }

        // 根据境界确定分区
        function getRealmDivision(realm) {
            if (realm <= 1) return 'human';      // 炼气、筑基
            if (realm <= 3) return 'cultivation'; // 元婴、化神
            return 'immortal';                   // 飞升后
        }

        // 获取每日挑战次数
        function getDailyChallenges() {
            const pvp = gameState.rankingPVP;
            if (pvp.lastChallengeDay < gameState.days) {
                pvp.dailyChallenges = 3;
                pvp.lastChallengeDay = gameState.days;
            }
            return pvp.dailyChallenges;
        }

        // 生成AI对手列表
        function generateAIOpponents(division, count = 10) {
            const pvp = gameState.rankingPVP;
            const opponents = [];
            const usedNames = new Set();
            const names = AI_OPPONENTS[division];

            // 根据玩家积分生成不同难度的对手
            const baseRating = pvp.rating;
            const ratingVariance = 200;

            for (let i = 0; i < count; i++) {
                let name;
                do {
                    name = names[Math.floor(Math.random() * names.length)];
                } while (usedNames.has(name));
                usedNames.add(name);

                // 随机生成对手积分
                const variance = Math.floor(Math.random() * ratingVariance * 2) - ratingVariance;
                const opponentRating = Math.max(800, Math.min(2600, baseRating + variance));

                // 确定对手境界
                let realmLevel = 0;
                if (division === 'human') {
                    realmLevel = Math.floor(Math.random() * 2); // 0-1 (炼气-筑基)
                } else if (division === 'cultivation') {
                    realmLevel = 2 + Math.floor(Math.random() * 2); // 2-3 (元婴-化神)
                } else {
                    realmLevel = 4 + Math.floor(Math.random() * 2); // 4-5 (大乘-渡劫)
                }

                const realmNames = ['炼气期', '筑基期', '元婴期', '化神期', '大乘期', '渡劫期'];
                const stageNames = ['初期', '中期', '后期', '圆满'];

                opponents.push({
                    id: 'ai_' + Date.now() + '_' + i,
                    name: name,
                    avatar: getOpponentAvatar(name),
                    realm: realmLevel,
                    realmName: realmNames[realmLevel] || '大乘期',
                    stage: Math.floor(Math.random() * 4),
                    stageName: stageNames[Math.floor(Math.random() * 4)],
                    rating: opponentRating,
                    wins: Math.floor(Math.random() * 100) + 50,
                    losses: Math.floor(Math.random() * 50) + 20,
                    rank: getRankNameFromRating(opponentRating, division)
                });
            }

            // 按积分排序
            opponents.sort((a, b) => b.rating - a.rating);
            return opponents;
        }

        // 根据积分获取段位名称
        function getRankNameFromRating(rating, division) {
            const ranks = RANK_CONFIG[division].ranks;
            let rankName = ranks[0].name;
            for (const rank of ranks) {
                if (rating >= rank.minRating) {
                    rankName = rank.name;
                }
            }
            return rankName;
        }

        // 获取对手头像
        function getOpponentAvatar(name) {
            const avatars = ['🧙', '🧛', '🧚', '👨‍🦳', '👩‍🦳', '🦸', '🥷', '🧜', '🧛‍♂️', '🧝', '🧝‍♂️', '👸', '🤴', '🦹', '🦹‍♂️'];
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = ((hash << 5) - hash) + name.charCodeAt(i);
                hash = hash & hash;
            }
            return avatars[Math.abs(hash) % avatars.length];
        }















        // 开始PVP挑战
        function startRankingPVP(opponentId, opponentRating) {
            const pvp = gameState.rankingPVP;

            if (pvp.dailyChallenges <= 0) {
                alert('今日挑战次数已用完，请明天再来！');
                return;
            }

            pvp.dailyChallenges--;
            saveGame();

            // 计算战斗结果
            const playerPower = calculatePlayerPVPower();
            const opponentPower = calculateOpponentPower(opponentRating);

            // 使用战斗系统进行模拟战斗
            const playerWins = simulatePVPRound(playerPower, opponentPower);

            // 计算积分变化
            const ratingChange = calculateRatingChange(pvp.rating, opponentRating, playerWins);

            // 更新状态
            pvp.rating = Math.max(800, Math.min(2600, pvp.rating + ratingChange));
            updatePlayerRank();

            if (playerWins) {
                pvp.wins++;
                pvp.currentStreak = Math.max(0, pvp.currentStreak) + 1;
                if (pvp.currentStreak > pvp.bestStreak) {
                    pvp.bestStreak = pvp.currentStreak;
                }
            } else {
                pvp.losses++;
                pvp.currentStreak = Math.min(0, pvp.currentStreak) - 1;
            }

            // 获取对手信息
            const opponents = generateAIOpponents(pvp.realmDivision, 8);
            const opponent = opponents.find(o => o.id === opponentId) || opponents[0];

            // 记录战斗历史
            pvp.battleHistory.unshift({
                day: gameState.days,
                opponentName: opponent.name,
                opponentRank: opponent.rank,
                opponentRating: opponentRating,
                result: playerWins ? 'win' : 'lose',
                ratingChange: Math.abs(ratingChange),
                ratingAfter: pvp.rating
            });

            // 限制历史记录长度
            if (pvp.battleHistory.length > 50) {
                pvp.battleHistory = pvp.battleHistory.slice(0, 50);
            }

            saveGame();

            // 显示战斗结果
            showPVPResult(playerWins, opponent, ratingChange);
        }

        // 计算玩家PVP战力
        function calculatePlayerPVPower() {
            const gs = gameState;
            const basePower = gs.realm * 500 + gs.stage * 100 + gs.cultivationProgress;
            const attackBonus = gs.activeEffects.attack * 10;
            const defenseBonus = gs.activeEffects.defense * 10;

            // 装备加成
            let equipmentBonus = 0;
            for (const equip of gs.equippedTreasures) {
                if (equip && equip.effect) {
                    equipmentBonus += (equip.effect.attack || 0) * 5;
                    equipmentBonus += (equip.effect.defense || 0) * 5;
                }
            }

            // 宠物加成
            let petBonus = 0;
            if (gs.summonedPet) {
                petBonus = 100;
            }

            return basePower + attackBonus + defenseBonus + equipmentBonus + petBonus;
        }

        // 计算对手战力
        function calculateOpponentPower(rating) {
            return rating * 0.8 + Math.random() * 200;
        }

        // 模拟PVP一回合
        function simulatePVPRound(playerPower, opponentPower) {
            // 玩家战力越高于对手，胜率越高
            const powerRatio = playerPower / opponentPower;
            const winChance = Math.min(0.9, Math.max(0.1, 0.5 + (powerRatio - 1) * 0.2));
            return Math.random() < winChance;
        }

        // 计算积分变化
        function calculateRatingChange(playerRating, opponentRating, playerWins) {
            const K = 32; // 积分系数
            const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
            const actual = playerWins ? 1 : 0;
            const change = Math.round(K * (actual - expected));

            // 胜利最少+10，失败最多-30
            if (playerWins && change < 10) return 10;
            if (!playerWins && change > -5) return -5;

            return change;
        }

        // 显示PVP结果
        function showPVPResult(playerWins, opponent, ratingChange) {
            const resultText = playerWins ? '🎉 胜利！' : '😢 惜败...';
            const ratingText = playerWins ? `+${ratingChange}` : `${ratingChange}`;
            const ratingColor = playerWins ? '#4caf50' : '#f44336';

            const html = `
                <div class="combat-result ${playerWins ? 'win' : 'lose'}">
                    <h2>${resultText}</h2>
                    <div style="font-size:3em;margin:20px 0;">${opponent.avatar}</div>
                    <div style="color:#ffd700;font-size:1.2em;">${opponent.name}</div>
                    <div style="color:#aaa;">${opponent.realmName} · ${opponent.rank}</div>

                    <div class="combat-result-stats">
                        <div class="combat-result-stat">
                            <div class="value" style="color:${ratingColor};">${ratingText}</div>
                            <div class="label">积分变化</div>
                        </div>
                        <div class="combat-result-stat">
                            <div class="value">${gameState.rankingPVP.rating}</div>
                            <div class="label">当前积分</div>
                        </div>
                    </div>

                    <div style="margin-top:20px;">
                        <div style="color:#aaa;">当前段位: ${getPlayerRankInfo().icon} ${getPlayerRankInfo().name}</div>
                    </div>

                    <button class="btn btn-combat" onclick="closeRankingPVP()" style="margin-top:20px;width:100%;">
                        返回排行榜
                    </button>
                </div>
            `;

            document.getElementById('rankingPVPContent').innerHTML = html;
        }

        // 更新每日挑战次数显示
        function updateRankingPVPButton() {
            const btn = document.getElementById('rankingPVPBtn');
            if (btn) {
                const remaining = getDailyChallenges();
                btn.textContent = `🏆 排行榜(${remaining}/3)`;
            }
        }



        // ===== getItemCount =====
        function getItemCount(name) {
            const item = gameState.inventory.find(i => i.name === name);
            return item ? item.quantity : 0;
        }

        // ===== startCombatChallenge =====
        function startCombatChallenge(difficulty) {
            if (getItemCount('挑战状') < 1) {
                alert('挑战状不足！请在商店购买。');
                return;
            }

            // 消耗挑战状
            const idx = gameState.inventory.findIndex(i => i.name === '挑战状');
            if (idx !== -1) {
                gameState.inventory[idx].quantity--;
                if (gameState.inventory[idx].quantity <= 0) {
                    gameState.inventory.splice(idx, 1);
                }
            }

            const opponent = generateOpponent(difficulty);
            initCombat(opponent);
            renderCombatArena();
        }

        // ===== initCombat =====
        function initCombat(opponent) {
            const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
            const hpByRealm = { 0: 500, 1: 800, 2: 1000, 3: 2000, 4: 5000 };

            const playerWeapon = gameState.equippedTreasures[0];
            const playerArmor = gameState.equippedTreasures[1];

            let playerMaxHP = hpByRealm[gameState.realm] || 1000;
            let playerAttack = 80 + gameState.realm * 40;
            let playerDefense = 40 + gameState.realm * 20;
            let playerSpeed = 80 + gameState.realm * 15;
            let playerCritRate = 0.1 + gameState.realm * 0.03;
            let playerTechnique = getPlayerTechnique();

            // 应用装备星级加成
            if (playerWeapon && COMBAT_TREASURES[playerWeapon.name]) {
                const weaponData = COMBAT_TREASURES[playerWeapon.name];
                const star = playerWeapon.star || 1;
                const mult = ENHANCE_CONFIG.starMultipliers[star] || 1.0;
                const baseVal = weaponData.effect.attackBonus || 0;
                playerAttack = Math.floor(playerAttack * (1 + baseVal * mult));
                if (weaponData.effect.critBonus) {
                    playerCritRate += weaponData.effect.critBonus * mult;
                }
            }
            if (playerArmor && COMBAT_TREASURES[playerArmor.name]) {
                const armorData = COMBAT_TREASURES[playerArmor.name];
                const star = playerArmor.star || 1;
                const mult = ENHANCE_CONFIG.starMultipliers[star] || 1.0;
                const baseDef = armorData.effect.defenseBonus || 0;
                const baseHP = armorData.effect.hpBonus || 0;
                if (baseDef > 0) playerDefense = Math.floor(playerDefense * (1 + baseDef * mult));
                if (baseHP > 0) playerMaxHP = Math.floor(playerMaxHP * (1 + baseHP * mult));
            }
            
            // V7 应用体质战斗效果
            if (gameState.activeEffects.constitution_bonuses) {
                const cb = gameState.activeEffects.constitution_bonuses;
                if (cb.attack) playerAttack = Math.floor(playerAttack * (1 + cb.attack));
                if (cb.defense) playerDefense = Math.floor(playerDefense * (1 + cb.defense));
                if (cb.hpBonus) playerMaxHP = Math.floor(playerMaxHP * (1 + cb.hpBonus));
                if (cb.crit) playerCritRate += cb.crit;
                if (cb.dodge) playerSpeed += Math.floor(playerSpeed * cb.dodge);
            }
            // 应用all_stats加成
            if (gameState.activeEffects.all_stats) {
                playerAttack = Math.floor(playerAttack * (1 + gameState.activeEffects.all_stats));
                playerDefense = Math.floor(playerDefense * (1 + gameState.activeEffects.all_stats));
                playerMaxHP = Math.floor(playerMaxHP * (1 + gameState.activeEffects.all_stats));
            }

            combatEnergy = 0; // 重置必杀技能量

            combatState = {
                inProgress: true,
                round: 0,
                turn: playerSpeed >= opponent.speed ? 'player' : 'opponent',
                player: {
                    name: '你',
                    avatar: '🧑‍🎓',
                    realm: gameState.realm,
                    realmName: realmNames[gameState.realm] + '期',
                    maxHP: playerMaxHP,
                    hp: playerMaxHP,
                    attack: playerAttack,
                    defense: playerDefense,
                    speed: playerSpeed,
                    technique: playerTechnique,
                    techniqueColor: TECHNIQUE_COLORS[playerTechnique],
                    weapon: playerWeapon ? playerWeapon.name : null,
                    weaponData: playerWeapon, // 完整对象含星级
                    armor: playerArmor ? playerArmor.name : null,
                    armorData: playerArmor,
                    critRate: playerCritRate,
                    setBonuses: {},
                    skills: [],
                    accessories: [],
                    counterEnergy: 0,
                    inDefenseStance: false,
                    skillLevels: {}
                },
                opponent: opponent,
                log: [],
                effects: {
                    player: { defending: false, attackBoost: 0, defenseBoost: 0, ignoreDefense: false, burning: 0, frozen: 0 },
                    opponent: { defending: false, attackBoost: 0, defenseBoost: 0, burning: 0, frozen: 0 }
                }
            };

            // A4 套装共鸣加成
            calculateSetBonuses();
            recalculatePlayerStats();

            combatState.log.push({
                type: 'system',
                text: `战斗开始！${opponent.name}（${opponent.realmName}，功法：${opponent.technique}）`,
                round: 0
            });

            if (combatState.turn === 'opponent') {
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }





        // ===== addCombatLog =====
        function addCombatLog(message) {
            if (!gameState.combatLogHistory) gameState.combatLogHistory = [];
            const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
            gameState.combatLogHistory.push({time, message});
            if (gameState.combatLogHistory.length > 100) gameState.combatLogHistory.shift();
        }

        // ===== addEventLog =====
        function addEventLog(message, type='normal') {
            const colors = { normal:'#ccc', success:'#00ff88', warning:'#ff9800', danger:'#f44336' };
            const color = colors[type] || colors.normal;
            // 通过addLog系统记录
            addLog(type === 'success' ? 'good' : type === 'danger' ? 'bad' : type, '提示', message);
        }

        // ===== showCombatLogHistory =====
        function showCombatLogHistory() {
            const history = gameState.combatLogHistory || [];
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;max-height:400px;overflow-y:auto;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
            html += '<b style="color:#ffd700;font-size:14px;">⚔️ 战斗日志历史</b>';
            html += `<span style="color:#888;font-size:11px;">${history.length}条记录</span>`;
            html += '</div>';
            if (history.length === 0) {
                html += '<div style="color:#666;text-align:center;padding:20px;">暂无记录</div>';
            } else {
                history.forEach(entry => {
                    html += `<div style="margin-bottom:6px;padding:6px;background:#252540;border-radius:4px;font-size:12px;">`;
                    html += `<span style="color:#666;font-size:10px;">[${entry.time}]</span> `;
                    html += `<span style="color:#ccc;">${entry.message}</span>`;
                    html += '</div>';
                });
            }
            html += '<div style="margin-top:10px;display:flex;gap:8px;">';
            html += `<button onclick="clearCombatLogHistory()" style="flex:1;padding:8px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;">清空</button>`;
            html += `<button onclick="closeModal()" style="flex:1;padding:8px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">关闭</button>`;
            html += '</div></div>';
            showModal(html);
        }

        // ===== clearCombatLogHistory =====
        function clearCombatLogHistory() {
            gameState.combatLogHistory = [];
            addEventLog('⚠️ 战斗日志已清空', 'warning');
            closeModal();
        }

        // ===== showEventLogHistory =====
        function showEventLogHistory() {
            const history = gameState.eventLogHistory || [];
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;max-height:400px;overflow-y:auto;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
            html += '<b style="color:#ffd700;font-size:14px;">📜 事件日志历史</b>';
            html += `<span style="color:#888;font-size:11px;">${history.length}条记录</span>`;
            html += '</div>';
            if (history.length === 0) {
                html += '<div style="color:#666;text-align:center;padding:20px;">暂无记录</div>';
            } else {
                history.slice().reverse().forEach(entry => {
                    const colors = { good:'#00ff88', bad:'#f44336', neutral:'#ccc', negative:'#f44336', warning:'#ff9800', welcome:'#ffd700' };
                    const color = colors[entry.type] || '#ccc';
                    html += `<div style="margin-bottom:6px;padding:6px;background:#252540;border-radius:4px;font-size:12px;">`;
                    html += `<span style="color:#666;font-size:10px;">[${entry.time}] 第${entry.day}天</span> `;
                    html += `<span style="color:${color};">${entry.title}</span> `;
                    html += `<span style="color:#aaa;">${entry.text}</span>`;
                    html += '</div>';
                });
            }
            html += '<div style="margin-top:10px;display:flex;gap:8px;">';
            html += `<button onclick="clearEventLogHistory()" style="flex:1;padding:8px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;">清空</button>`;
            html += `<button onclick="closeModal()" style="flex:1;padding:8px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">关闭</button>`;
            html += '</div></div>';
            showModal(html);
        }

        // ===== clearEventLogHistory =====
        function clearEventLogHistory() {
            gameState.eventLogHistory = [];
            addLog('warning', '日志清空', '事件日志已清空');
            closeModal();
        }





        // ===== selectCombatAction =====
        function selectCombatAction(action) {
            if (action === 'attack') {
                executePlayerAttack();
            } else if (action === 'defend') {
                executePlayerDefend();
            } else if (action === 'escape') {
                executePlayerEscape();
            } else if (action === 'treasure') {
                showTreasureMenu();
            } else if (action === 'pill') {
                showPillMenu();
            } else if (action === 'technique') {
                showTechniqueInfo();
            }
        }

        // ===== showTreasureMenu =====
        function showTreasureMenu() {
            const availableTreasures = [];
            for (const item of gameState.inventory) {
                if (COMBAT_TREASURES[item.name]) {
                    availableTreasures.push(item);
                }
            }

            let html = '<div class="combat-submenu">';
            if (availableTreasures.length === 0) {
                html += '<p style="grid-column:span 2;text-align:center;color:#888;padding:20px;">背包中没有可用法宝</p>';
            } else {
                availableTreasures.forEach(item => {
                    const treasure = COMBAT_TREASURES[item.name];
                    html += `
                        <button class="combat-submenu-btn" onclick="useCombatTreasure('${item.name}')">
                            ${treasure.icon} ${item.name}
                            <div style="font-size:0.8em;color:#aaa">${treasure.desc}</div>
                        </button>
                    `;
                });
            }
            html += '<button class="combat-submenu-btn" onclick="renderCombatArena()" style="grid-column:span 2;">返回</button></div>';
            document.getElementById('combatContent').innerHTML = document.getElementById('combatContent').innerHTML.replace(renderPlayerActions(), html);
        }

        // ===== useCombatTreasure =====
        function useCombatTreasure(name) {
            const treasure = COMBAT_TREASURES[name];
            if (!treasure) return;

            const idx = gameState.inventory.findIndex(i => i.name === name);
            if (idx !== -1) {
                gameState.inventory[idx].quantity--;
                if (gameState.inventory[idx].quantity <= 0) {
                    gameState.inventory.splice(idx, 1);
                }
            }

            const effect = treasure.effect;
            let effectText = '';
            if (effect.attackBonus) {
                combatState.effects.player.attackBoost += effect.attackBonus;
                effectText = `${name}发动！攻击+${Math.round(effect.attackBonus * 100)}%`;
            } else if (effect.defenseBonus) {
                combatState.effects.player.defenseBoost += effect.defenseBonus;
                effectText = `${name}发动！防御+${Math.round(effect.defenseBonus * 100)}%`;
            } else if (effect.critBonus) {
                combatState.player.critRate += effect.critBonus;
                effectText = `${name}发动！暴击率+${Math.round(effect.critBonus * 100)}%`;
            } else if (effect.hpBonus) {
                const heal = Math.floor(combatState.player.maxHP * effect.hpBonus);
                combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + heal);
                effectText = `${name}发动！生命+${heal}`;
            }

            combatState.log.push({ type: 'player-action', text: `你使用了${name}！${effectText}`, round: combatState.round });
            combatState.turn = 'opponent';
            renderCombatArena();

            setTimeout(() => executeOpponentTurn(), 1000);
        }

        // ===== showPillMenu =====
        function showPillMenu() {
            let html = '<div class="combat-submenu">';
            let hasPills = false;

            for (const [name, pill] of Object.entries(COMBAT_PILLS)) {
                if (getItemCount(name) > 0) {
                    hasPills = true;
                    html += `
                        <button class="combat-submenu-btn" onclick="useCombatPill('${name}')">
                            ${pill.icon} ${name}
                            <div style="font-size:0.8em;color:#aaa">${pill.desc}</div>
                        </button>
                    `;
                }
            }

            if (!hasPills) {
                html += '<p style="grid-column:span 2;text-align:center;color:#888;padding:20px;">背包中没有战斗丹药</p>';
            }
            html += '<button class="combat-submenu-btn" onclick="renderCombatArena()" style="grid-column:span 2;">返回</button></div>';
            document.getElementById('combatContent').innerHTML = document.getElementById('combatContent').innerHTML.replace(renderPlayerActions(), html);
        }

        // ===== useCombatPill =====
        function useCombatPill(name) {
            const pill = COMBAT_PILLS[name];
            if (!pill) return;

            const idx = gameState.inventory.findIndex(i => i.name === name);
            if (idx !== -1) {
                gameState.inventory[idx].quantity--;
                if (gameState.inventory[idx].quantity <= 0) {
                    gameState.inventory.splice(idx, 1);
                }
            }

            const effect = pill.effect;
            let effectText = '';

            if (effect.type === 'attackBoost') {
                combatState.effects.player.attackBoost += effect.value;
                effectText = `攻击+${Math.round(effect.value * 100)}%`;
            } else if (effect.type === 'defenseBoost') {
                combatState.effects.player.defenseBoost += effect.value;
                effectText = `防御+${Math.round(effect.value * 100)}%`;
            } else if (effect.type === 'ignoreDefense') {
                combatState.effects.player.ignoreDefense = true;
                effectText = '无视对方防御';
            } else if (effect.type === 'heal') {
                const heal = Math.floor(combatState.player.maxHP * effect.value);
                combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + heal);
                effectText = `恢复${heal}生命`;
            }

            combatState.log.push({ type: 'player-action', text: `你服用了${name}！${effectText}`, round: combatState.round });
            combatState.turn = 'opponent';
            renderCombatArena();

            setTimeout(() => executeOpponentTurn(), 1000);
        }

        // ===== showTechniqueInfo =====
        function showTechniqueInfo() {
            const p = combatState.player;
            const o = combatState.opponent;
            const myTechnique = p.technique;
            const oppTechnique = o.technique;

            let克制关系 = '';
            if (TECHNIQUE_BONUS[myTechnique].beats === oppTechnique) {
                克制关系 = `你的${myTechnique}克制对方的${oppTechnique}，伤害+50%`;
            } else if (TECHNIQUE_BONUS[myTechnique].losesTo === oppTechnique) {
                克制关系 = `对方的${oppTechnique}克制你的${myTechnique}，伤害-30%`;
            } else {
                克制关系 = '功法无克制关系';
            }

            const html = `
                <div class="combat-submenu">
                    <div style="grid-column:span 2;text-align:center;padding:20px;background:rgba(0,0,0,0.3);border-radius:10px;">
                        <p style="color:${p.techniqueColor};font-size:1.2em;margin-bottom:10px;">你的功法：${myTechnique}</p>
                        <p style="color:${o.techniqueColor};font-size:1.2em;margin-bottom:10px;">对方功法：${oppTechnique}</p>
                        <p style="color:#ffd700;margin-top:15px;">${克制关系}</p>
                    </div>
                    <button class="combat-submenu-btn" onclick="renderCombatArena()" style="grid-column:span 2;">返回</button>
                </div>
            `;
            document.getElementById('combatContent').innerHTML = document.getElementById('combatContent').innerHTML.replace(renderPlayerActions(), html);
        }

        // ===== executePlayerAttack =====
        function executePlayerAttack() {
            const p = combatState.player;
            const o = combatState.opponent;
            const effects = combatState.effects.player;

            // 清除防御状态
            effects.defending = false;
            combatState.player.inDefenseStance = false;

            // 计算伤害
            let baseDamage = p.attack;
            baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));

            // 功法相克
            let techniqueMultiplier = 1;
            if (TECHNIQUE_BONUS[p.technique].beats === o.technique) {
                techniqueMultiplier = 1.5;
                combatState.log.push({ type: 'system', text: `功法克制！伤害+50%`, round: combatState.round });
            } else if (TECHNIQUE_BONUS[p.technique].losesTo === o.technique) {
                techniqueMultiplier = 0.7;
                combatState.log.push({ type: 'system', text: `被功法克制！伤害-30%`, round: combatState.round });
            }
            baseDamage = Math.floor(baseDamage * techniqueMultiplier);

            // A4 套装攻击加成
            if (p.attackPercent) {
                baseDamage = Math.floor(baseDamage * p.attackPercent);
            }

            // 防御减伤
            let finalDamage = baseDamage;
            if (!effects.ignoreDefense) {
                const defReduction = effects.defending ? o.defense * 1.5 : o.defense;
                finalDamage = Math.max(1, baseDamage - defReduction);
            }

            // 暴击判定
            const critRateWithSet = p.critRate + (p.critBonus || 0);
            const isCrit = Math.random() < critRateWithSet;
            if (isCrit) {
                finalDamage = Math.floor(finalDamage * 1.5);
                combatState.log.push({ type: 'player-action', actionType: 'critical', text: `💥暴击！`, round: combatState.round });
            }

            o.hp = Math.max(0, o.hp - finalDamage);

            // A4 套装技能触发
            if (p.skills && p.skills.includes('freezeAura') && Math.random() < 0.25) {
                combatState.effects.opponent.frozen = 2;
                combatState.log.push({ type: 'system', text: `❄️ 玄冰领域生效！敌人被冻结2回合！`, round: combatState.round });
            }
            if (p.skills && p.skills.includes('burnAura') && Math.random() < 0.30) {
                combatState.effects.opponent.burning = 3;
                combatState.log.push({ type: 'system', text: `🔥 烈焰领域生效！敌人被灼烧3回合！`, round: combatState.round });
            }
            if (p.skills && p.skills.includes('angelJudgment') && Math.random() < 0.20) {
                const healAmount = Math.floor(p.maxHP * 0.15);
                p.hp = Math.min(p.maxHP, p.hp + healAmount);
                combatState.log.push({ type: 'system', text: `👼 天使审判生效！恢复${healAmount}点生命！`, round: combatState.round });
            }

            const techniqueColor = TECHNIQUE_COLORS[p.technique];
            combatState.log.push({
                type: 'player-action',
                actionType: 'damage',
                text: `你施展<span style="color:${techniqueColor}">${p.technique}</span>，造成 <span style="color:#ff6666">${finalDamage}</span> 点伤害${isCrit ? '（暴击）' : ''}`,
                round: combatState.round
            });

            addEnergy(20); // 攻击积蓄能量
            combatState.turn = 'opponent';
            renderCombatArena();

            if (o.hp <= 0) {
                setTimeout(() => endCombat('win'), 500);
            } else {
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }

        // ===== executePlayerDefend =====
        function executePlayerDefend() {
            combatState.effects.player.defending = true;
            combatState.player.inDefenseStance = true;
            if (typeof combatState.player.counterEnergy === 'undefined') combatState.player.counterEnergy = 0;
            combatState.player.counterEnergy = Math.min(100, combatState.player.counterEnergy + 35);
            combatState.log.push({
                type: 'player-action',
                text: `🛡️ 防御姿态！反击能量+35（${combatState.player.counterEnergy}/100）`,
                round: combatState.round
            });

            combatState.turn = 'opponent';
            renderCombatArena();
            setTimeout(() => executeOpponentTurn(), 1000);
        }

        // ===== executePlayerEscape =====
        function executePlayerEscape() {
            const escapeChance = 0.4 + gameState.activeEffects.escape;
            const success = Math.random() < escapeChance;

            if (success) {
                const cost = Math.floor(gameState.spiritStones * 0.5);
                gameState.spiritStones -= cost;
                combatState.log.push({
                    type: 'system',
                    text: `逃跑成功！损失${cost}灵石`,
                    round: combatState.round
                });
                combatState.turn = 'opponent';
                renderCombatArena();
                setTimeout(() => endCombat('escape'), 500);
            } else {
                combatState.log.push({
                    type: 'system',
                    text: '逃跑失败！被对方追击',
                    round: combatState.round
                });
                const extraCost = Math.floor(gameState.spiritStones * 0.2);
                gameState.spiritStones -= extraCost;
                combatState.log.push({
                    type: 'system',
                    text: `被追击！额外损失${extraCost}灵石`,
                    round: combatState.round
                });
                combatState.turn = 'opponent';
                renderCombatArena();
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }

        // ===== executeOpponentTurn =====
        function executeOpponentTurn() {
            if (!combatState.inProgress || combatState.opponent.hp <= 0) return;

            combatState.round++;
            const p = combatState.player;
            const o = combatState.opponent;
            const effects = combatState.effects.opponent;

            // 清除防御状态
            effects.defending = false;

            // 对手AI：随机选择行动
            const rand = Math.random();
            let action = 'attack';
            if (rand < 0.1 && getItemCount('回春丹') > 0 && o.hp < o.maxHP * 0.5) {
                action = 'heal';
            }

            if (action === 'heal') {
                // 使用回春丹
                const idx = gameState.inventory.findIndex(i => i.name === '回春丹');
                if (idx !== -1) {
                    gameState.inventory[idx].quantity--;
                    if (gameState.inventory[idx].quantity <= 0) {
                        gameState.inventory.splice(idx, 1);
                    }
                }
                const heal = Math.floor(o.maxHP * 0.3);
                o.hp = Math.min(o.maxHP, o.hp + heal);
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'heal',
                    text: `${o.name}使用了回春丹，恢复${heal}生命`,
                    round: combatState.round
                });
            } else {
                // 攻击
                let baseDamage = o.attack;
                baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));

                // 功法相克
                let techniqueMultiplier = 1;
                if (TECHNIQUE_BONUS[o.technique].beats === p.technique) {
                    techniqueMultiplier = 1.5;
                } else if (TECHNIQUE_BONUS[o.technique].losesTo === p.technique) {
                    techniqueMultiplier = 0.7;
                }
                baseDamage = Math.floor(baseDamage * techniqueMultiplier);

                // 玩家防御减伤
                let finalDamage = baseDamage;
                if (combatState.effects.player.defending) {
                    finalDamage = Math.floor(baseDamage * 0.5);
                }
                finalDamage = Math.max(1, finalDamage - Math.floor(p.defense * (1 + combatState.effects.player.defenseBoost)));

                // 暴击
                const isCrit = Math.random() < o.critRate;
                if (isCrit) {
                    finalDamage = Math.floor(finalDamage * 1.5);
                }

                p.hp = Math.max(0, p.hp - finalDamage);
                combatState.effects.player.defending = false;

                const techniqueColor = TECHNIQUE_COLORS[o.technique];
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'damage',
                    text: `${o.name}施展<span style="color:${techniqueColor}">${o.technique}</span>，造成 <span style="color:#ff6666">${finalDamage}</span> 点伤害${isCrit ? '（暴击）' : ''}`,
                    round: combatState.round
                });

                // ========== A5 防御反击系统 ==========
                // 反击逻辑：受到攻击时检查反击能量
                if (combatState.player.counterEnergy >= 50 && !combatState.player.inDefenseStance) {
                    const weaponData = combatState.player.weaponData || { name: '空手', star: 1 };
                    const starMultiplier = ENHANCE_CONFIG.starMultipliers[weaponData.star] || 1;
                    const baseWeaponDamage = 50; // 基础反击伤害基数
                    let counterDamage = Math.floor(baseWeaponDamage * p.attack * starMultiplier * 0.01); // 0.01为反击系数

                    // 玄武甲套装效果：反击伤害+50%，额外恢复HP
                    if (combatState.player.skills && combatState.player.skills.includes('玄武反击')) {
                        counterDamage = Math.floor(counterDamage * 1.5);
                        const healAmount = Math.floor(counterDamage * 0.15);
                        combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + healAmount);
                        combatState.log.push({ type: 'system', text: `🐢 玄武反击！伤害+50%并恢复 ${healAmount} HP！`, round: combatState.round });
                    }

                    combatState.opponent.hp = Math.max(1, combatState.opponent.hp - counterDamage);
                    combatState.player.counterEnergy -= 50;
                    combatState.log.push({ type: 'player-action', text: `⚡ 反击！对敌人造成 ${counterDamage} 点伤害！（-${50}反击能量）`, round: combatState.round });
                }
            }

            renderCombatArena();

            if (p.hp <= 0) {
                setTimeout(() => endCombat('lose'), 500);
            } else {
                combatState.turn = 'player';
                renderCombatArena();
            }
        }

        // ===== endCombat =====
        function endCombat(result) {
            combatState.inProgress = false;
            const p = combatState.player;
            const o = combatState.opponent;

            let reward = 0;
            let penalty = 0;
            let honorChange = 0;
            let fameChange = 0;
            let realmDropChance = 0;

            if (result === 'win') {
                reward = Math.floor(o.maxHP * 0.5);
                gameState.spiritStones += reward;
                honorChange = 10;
                fameChange = 5;
                gameState.combat = gameState.combat || { wins: 0, losses: 0, honor: 0, fame: 0, battleHistory: [] };
                gameState.combat.wins++;
                gameState.combat.honor += honorChange;
                gameState.combat.fame += fameChange;
                combatState.log.push({
                    type: 'system',
                    text: `🎉 胜利！获得${reward}灵石，荣誉+${honorChange}，声望+${fameChange}`,
                    round: combatState.round
                });
            } else if (result === 'lose') {
                penalty = Math.floor(gameState.spiritStones * 0.3);
                gameState.spiritStones -= penalty;
                honorChange = -5;
                fameChange = -3;
                realmDropChance = 0.1;
                gameState.combat = gameState.combat || { wins: 0, losses: 0, honor: 0, fame: 0, battleHistory: [] };
                gameState.combat.losses++;
                gameState.combat.honor = Math.max(0, gameState.combat.honor + honorChange);
                gameState.combat.fame = Math.max(0, gameState.combat.fame + fameChange);

                // 境界跌落
                if (Math.random() < realmDropChance) {
                    const oldRealm = gameState.realm;
                    gameState.realm = Math.max(0, gameState.realm - 1);
                    combatState.log.push({
                        type: 'system',
                        text: `💔 境界跌落！从${CONFIG.realms[oldRealm]}期跌落到${CONFIG.realms[gameState.realm]}期`,
                        round: combatState.round
                    });
                }

                // 重伤debuff：3场内属性-20%
                gameState.combat.injured = true;
                gameState.combat.injuryEndDay = gameState.days + 3;
                combatState.log.push({
                    type: 'system',
                    text: `💔 重伤！未来3场战斗属性降低20%`,
                    round: combatState.round
                });

                combatState.log.push({
                    type: 'system',
                    text: `😢 战败！损失${penalty}灵石，荣誉${honorChange}，声望${fameChange}`,
                    round: combatState.round
                });
            }

            // 记录战斗历史
            gameState.combat.battleHistory = gameState.combat.battleHistory || [];
            gameState.combat.battleHistory.unshift({
                opponent: o.name,
                result: result,
                reward: reward,
                penalty: penalty,
                day: gameState.days
            });
            if (gameState.combat.battleHistory.length > 50) {
                gameState.combat.battleHistory.pop();
            }

            // V48: 插件系统战斗钩子
            if (typeof callPluginHook === 'function') {
                if (result === 'win') {
                    callPluginHook('onBattleWin', { opponent: o.name, reward, day: gameState.days });
                }
                callPluginHook('onBattleEnd', { result, opponent: o.name, reward, penalty, day: gameState.days });
            }

            saveGame();
            renderCombatArena();
        }



// ===== core.js =====

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
                // 确保三界排行榜PVP字段存在（向后兼容）
                if (!data.rankingPVP) {
                    data.rankingPVP = {
                        enabled: true,
                        rating: 1000,
                        rank: '凡人',
                        rankLevel: 0,
                        wins: 0,
                        losses: 0,
                        currentStreak: 0,
                        bestStreak: 0,
                        season: 1,
                        seasonStartDay: data.days || 1,
                        lastSeasonRewardClaimed: false,
                        realmDivision: getRealmDivision(data.realm || 0),
                        battleHistory: [],
                        dailyChallenges: 3,
                        lastChallengeDay: data.days || 0,
                        seasonRewards: { lastSeason: 0, claimed: [] }
                    };
                }
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

        // ===== 云端存档函数 =====

        // 获取云端配置
        function getCloudConfig() {
            return {
                token: localStorage.getItem('cultivationCloudToken') || '',
                gistId: localStorage.getItem('cultivationCloudGistId') || '',
                autoSave: localStorage.getItem('cultivationCloudAutoSave') === 'true'
            };
        }

        // 保存云端配置
        function saveCloudConfig(token, gistId, autoSave) {
            localStorage.setItem('cultivationCloudToken', token);
            localStorage.setItem('cultivationCloudGistId', gistId);
            localStorage.setItem('cultivationCloudAutoSave', autoSave ? 'true' : 'false');
        }

        // 更新云端状态显示
        function updateCloudStatus(message, isError = false) {
            const el = document.getElementById('cloudStatus');
            if (el) {
                el.textContent = message;
                el.style.color = isError ? '#f44336' : '#4caf50';
            }
        }

        // 云端保存
        async function cloudSave() {
            const config = getCloudConfig();
            if (!config.token) {
                updateCloudStatus('请先填写 GitHub Token', true);
                return;
            }

            updateCloudStatus('正在保存到云端...');

            const saveData = {
                 description: `修仙模拟器存档 - 第${gameState.days}天`,
                 public: false,
                 files: {
                     'cultivation-save.json': {
                         content: JSON.stringify(gameState)
                     }
                 }
            };

            try {
                let url = 'https://api.github.com/gists';
                let method = 'POST';

                if (config.gistId) {
                    url = `https://api.github.com/gists/${config.gistId}`;
                    method = 'PATCH';
                }

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${config.token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    body: JSON.stringify(saveData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || `HTTP ${response.status}`);
                }

                const result = await response.json();
                const newGistId = result.id;

                // 保存新的 Gist ID
                saveCloudConfig(config.token, newGistId, config.autoSave);

                // 更新 UI 中的 Gist ID 字段
                const gistIdInput = document.getElementById('cloudGistId');
                if (gistIdInput) gistIdInput.value = newGistId;

                updateCloudStatus(`☁️ 云端存档成功！Gist ID: ${newGistId}`);
                addLog('good', '☁️ 云端存档', `存档已保存到云端 (第${gameState.days}天)`);

                // 同时保存到本地
                saveGame();

            } catch (e) {
                updateCloudStatus(`云端保存失败: ${e.message}`, true);
                addLog('bad', '☁️ 云端存档失败', e.message);
            }
        }

        // 云端加载
        async function cloudLoad() {
            const config = getCloudConfig();
            const gistIdInput = document.getElementById('cloudGistId');
            const gistId = gistIdInput ? gistIdInput.value.trim() : '';

            if (!config.token) {
                updateCloudStatus('请先填写 GitHub Token', true);
                return;
            }

            if (!gistId && !config.gistId) {
                updateCloudStatus('请填写 Gist ID 或先生成存档', true);
                return;
            }

            const targetGistId = gistId || config.gistId;
            updateCloudStatus('正在从云端加载...');

            try {
                const response = await fetch(`https://api.github.com/gists/${targetGistId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${config.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || `HTTP ${response.status}`);
                }

                const result = await response.json();
                const saveFile = result.files['cultivation-save.json'];

                if (!saveFile) {
                    throw new Error('未找到存档文件');
                }

                const loadedData = JSON.parse(saveFile.content);

                // 应用存档数据
                gameState = {
                    ...gameState,
                    ...loadedData,
                    activeEffects: loadedData.activeEffects || {
                        breakthrough_boost: 0,
                        cultivate_speed: 0,
                        '渡劫_mindset_protect': 0,
                        attack: 0,
                        defense: 0,
                        cultivate_qi_rate: 0,
                        '渡劫_damage_reduce': 0,
                        escape: 0,
                        foresee_event: 0,
                        all_stats: 0,
                        serendipity_boost: 0
                    }
                };

                // 保存 Gist ID 配置
                saveCloudConfig(config.token, targetGistId, config.autoSave);

                // 更新 UI
                if (typeof updateDisplay === 'function') updateDisplay();
                if (typeof refreshInventoryUI === 'function') refreshInventoryUI();
                if (typeof renderGameUI === 'function') renderGameUI();
                showGameUI();

                updateCloudStatus(`☁️ 云端存档加载成功 (第${gameState.days}天)`);
                addLog('good', '☁️ 云端加载', `从云端加载存档成功 (第${gameState.days}天)`);

                // 同时保存到本地作为备份
                saveGame();

            } catch (e) {
                updateCloudStatus(`云端加载失败: ${e.message}`, true);
                addLog('bad', '☁️ 云端加载失败', e.message);
            }
        }

        // 自动云端存档（每天结束时调用）
        async function autoCloudSave() {
            const config = getCloudConfig();
            if (!config.autoSave || !config.token) return;

            try {
                await cloudSave();
            } catch (e) {
                console.log('自动云端存档失败:', e.message);
            }
        }

        // 填充云端设置 UI
        function fillCloudSettings() {
            const config = getCloudConfig();
            const tokenInput = document.getElementById('cloudToken');
            const gistIdInput = document.getElementById('cloudGistId');
            const autoSaveInput = document.getElementById('cloudAutoSave');

            if (tokenInput) tokenInput.value = config.token;
            if (gistIdInput) gistIdInput.value = config.gistId;
            if (autoSaveInput) autoSaveInput.checked = config.autoSave;
        }

        // 修改 openSettings 函数以填充云端设置
        const originalOpenSettings = openSettings;
        openSettings = function() {
            originalOpenSettings();
            fillCloudSettings();
        };

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
                    // 普通装备效果
                    if (treasure.effect && treasure.effect.type) {
                        const effectType = treasure.effect.type;
                        const effectValue = treasure.effect.value || 0;
                        if (gameState.activeEffects.hasOwnProperty(effectType)) {
                            gameState.activeEffects[effectType] += effectValue;
                        }
                    }
                    // 天道法则装备基础效果
                    if (treasure.baseEffect && treasure.baseEffect.type) {
                        const effectType = treasure.baseEffect.type;
                        const effectValue = treasure.baseEffect.value || 0;
                        if (gameState.activeEffects.hasOwnProperty(effectType)) {
                            gameState.activeEffects[effectType] += effectValue;
                        }
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
            const icons = ['⚔️', '🛡️', '💍', '👑'];
            for (let i = 0; i < 4; i++) {
                const slot = document.getElementById(`equipSlot${i}`);
                const treasure = gameState.equippedTreasures[i];
                if (treasure) {
                    slot.classList.add('filled');
                    if (i === 3) slot.classList.add('heavenly-dao-slot');
                    slot.querySelector('.slot-icon').textContent = treasure.icon || icons[i];
                    const star = treasure.star || 1;
                    const starDisplay = getStarDisplay(star);
                    const desc = treasure.desc || (treasure.lawEffect ? treasure.lawEffect.desc : '');
                    slot.querySelector('.slot-tooltip').textContent = `${treasure.name}${starDisplay}\n${desc}`;
                } else {
                    slot.classList.remove('filled');
                    if (i === 3) slot.classList.remove('heavenly-dao-slot');
                    slot.querySelector('.slot-icon').textContent = icons[i];
                    slot.querySelector('.slot-tooltip').textContent = i === 3 ? '天道法则装备' : '空';
                }
            }
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





        // ===== unequipHeavenlyDao =====
        function unequipHeavenlyDao() {
            const heavenlyDao = gameState.equippedTreasures[3];
            if (heavenlyDao) {
                const invItem = {
                    type: 'heavenly',
                    name: heavenlyDao.name,
                    quantity: 1,
                    quality: 'ultimate',
                    effect: heavenlyDao.baseEffect,
                    desc: heavenlyDao.desc,
                    icon: heavenlyDao.icon,
                    star: heavenlyDao.star || 1,
                    lawEffect: heavenlyDao.lawEffect
                };
                addToInventoryObj(invItem);
                gameState.equippedTreasures[3] = null;
                recalculateAllEffects();
                updateEquipmentBar();
                saveGame();
                addLog('neutral', '天道装备', `卸下了${heavenlyDao.name}`);
            }
        }

        // ===== equipHeavenlyDao =====
        function equipHeavenlyDao(name) {
            const hdEquip = HEAVENLY_DAO_EQUIPMENTS[name];
            if (!hdEquip) return;
            
            // 查找背包中的物品
            const itemIdx = gameState.inventory.findIndex(i => i.name === name);
            if (itemIdx === -1) return;
            
            const item = gameState.inventory[itemIdx];
            item.quantity--;
            if (item.quantity <= 0) {
                gameState.inventory.splice(itemIdx, 1);
            }
            
            // 装备天道法则装备
            gameState.equippedTreasures[3] = {
                name: item.name,
                type: 'heavenly',
                quality: 'ultimate',
                desc: item.desc,
                icon: item.icon || hdEquip.icon,
                baseEffect: hdEquip.baseEffect,
                lawEffect: hdEquip.lawEffect,
                star: item.star || 1
            };
            
            recalculateAllEffects();
            updateEquipmentBar();
            saveGame();
            addLog('good', '天道装备', `装备了天道法则装备【${name}】`);
            closeHeavenlyDaoSlotMenu();
        }

        // ===== canEvolveToHeavenlyDao =====
        function canEvolveToHeavenlyDao(itemName) {
            const hdEquip = HEAVENLY_DAO_EQUIPMENTS[itemName];
            if (!hdEquip || !hdEquip.evolutionReq) return { can: false, reason: '该装备无法进化' };
            
            const req = hdEquip.evolutionReq;
            const hasItem = gameState.inventory.find(i => i.name === req.item && i.star >= req.star);
            if (!hasItem) return { can: false, reason: `需要${req.item}(${req.star}星)才能进化` };
            if (gameState.spiritStones < req.stones) return { can: false, reason: `需要${req.stones}灵石` };
            
            return { can: true };
        }





        // ===== doEvolution =====
        function doEvolution(targetName) {
            const hdEquip = HEAVENLY_DAO_EQUIPMENTS[targetName];
            if (!hdEquip || !hdEquip.evolutionReq) {
                alert('该装备无法进化！');
                return;
            }
            
            const req = hdEquip.evolutionReq;
            const canEvolve = canEvolveToHeavenlyDao(targetName);
            if (!canEvolve.can) {
                alert(canEvolve.reason);
                return;
            }
            
            // 扣除材料和灵石
            const itemIdx = gameState.inventory.findIndex(i => i.name === req.item && i.star >= req.star);
            if (itemIdx !== -1) {
                gameState.inventory.splice(itemIdx, 1);
            }
            gameState.spiritStones -= req.stones;
            
            // 添加天道法则装备到背包
            const newItem = {
                type: 'heavenly',
                name: targetName,
                quantity: 1,
                quality: 'ultimate',
                effect: hdEquip.baseEffect,
                desc: hdEquip.desc,
                icon: hdEquip.icon,
                star: 1,
                lawEffect: hdEquip.lawEffect
            };
            addToInventoryObj(newItem);
            
            closeEvolutionUI();
            updateDisplay();
            saveGame();
            
            addLog('good', '天道进化', `成功进化出天道法则装备【${targetName}】！`);
            alert(`恭喜！成功进化出天道法则装备【${targetName}】！\n\n${hdEquip.lawEffect.desc}`);
        }

        // ===== addToInventory =====
        function addToInventory(type, name, quantity, quality, effect, desc, icon, star, grade, level, maxLevel) {
            // 查找是否已存在同类型物品
            const existing = gameState.inventory.find(item => item.name === name && item.type === type);
            if (existing) {
                existing.quantity += quantity;
            } else {
                if (gameState.inventory.length >= gameState.maxInventorySlots) {
                    return false; // 背包满了
                }
                const itemObj = {
                    id: Date.now(),
                    type,
                    name,
                    quantity,
                    quality,
                    effect,
                    desc,
                    icon,
                    star: star || 1
                };
                // 功法额外字段
                if (type === 'technique') {
                    itemObj.grade = grade !== undefined ? grade : 0;
                    itemObj.level = level || 1;
                    itemObj.maxLevel = maxLevel || 5;
                }
                gameState.inventory.push(itemObj);
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





        // ===== switchInvTab =====
        function switchInvTab(tab) {
            currentInvTab = tab;
            selectedInvItem = null;
            document.querySelectorAll('.inventory-tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
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
                    <span style="font-size:2em">${item.icon || '📖'}</span>
                    <div>
                        <div style="font-weight:bold;font-size:1.2em;color:${getQualityColor(item.quality)}">${item.name}</div>
                        <div style="color:#888">${item.desc}</div>
                    </div>
                </div>
                <div style="color:#aaa">数量: ${item.quantity}</div>
                ${item.type === 'technique' ? `<div style="color:#ffd700;margin-top:5px;">等级: ${item.level || 1}/${item.maxLevel || 5} ${item.grade !== undefined ? '(' + (SECT_CONFIG.techniqueGrades[item.grade] || '人阶') + ')' : ''}</div>` : ''}
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
            } else if (item.type === 'technique') {
                const level = item.level || 1;
                const maxLevel = item.maxLevel || 5;
                const grade = item.grade !== undefined ? item.grade : 0;
                const gradeName = SECT_CONFIG.techniqueGrades[grade] || '人阶';
                if (level < maxLevel) {
                    const upgradeCost = getTechniqueUpgradeCost(grade, level);
                    actions = `<button class="btn btn-breakthrough" onclick="openTechniqueUpgrade(${idx})" style="margin-bottom:5px;">进阶</button>`;
                } else {
                    actions = `<span style="color:#ffd700;">已满级</span>`;
                }
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

        // ===== getTechniqueUpgradeCost =====
        function getTechniqueUpgradeCost(grade, level) {
            // 等级达到上限(5)则无法进阶
            if (level >= 5) return null;
            
            // 获取进阶材料配置
            const upgradeConfig = TECHNIQUE_UPGRADE_MATERIALS[grade];
            if (!upgradeConfig) return null;
            
            // 根据level计算具体消耗（level 1->2用第1级材料，2->3用第2级，3->4用第3级，4->5用第4级）
            // 实际上我们只定义了3个进阶阶段（0->1, 1->2, 2->3），等级5是满级
            const stage = level - 1; // stage 0=1级, 1=2级, 2=3级, 3=4级
            if (stage >= 3) return null; // 仙阶满级无法继续进阶
            
            return {
                materials: { ...upgradeConfig.materials },
                stones: upgradeConfig.stones
            };
        }

        // ===== getTechniqueEffectKey =====
        function getTechniqueEffectKey(grade, level) {
            // 根据等阶和等级计算效果配置索引
            // 人阶: level 1-5 -> index 0-4
            // 灵阶: level 1-5 -> index 5-9 (人阶5个 + 灵阶前4个)
            // 天阶: level 1-5 -> index 10-14
            // 仙阶: 不进阶，使用天阶满级效果
            if (grade === 0) return level - 1;
            if (grade === 1) return 5 + (level - 1);
            if (grade === 2) return 10 + (level - 1);
            return 15; // 仙阶用天阶满级效果
        }





        // ===== doTechniqueUpgrade =====
        function doTechniqueUpgrade(idx) {
            let items = gameState.inventory;
            if (currentInvTab !== 'all') {
                items = items.filter(item => item.type === currentInvTab);
            }
            const item = items[idx];
            if (!item || item.type !== 'technique') return;
            
            const level = item.level || 1;
            const maxLevel = item.maxLevel || 5;
            const grade = item.grade !== undefined ? item.grade : 0;
            
            if (level >= maxLevel) return;
            
            const upgradeCost = getTechniqueUpgradeCost(grade, level);
            if (!upgradeCost) return;
            
            // 检查材料
            for (const [mat, qty] of Object.entries(upgradeCost.materials)) {
                if (getItemCount(mat) < qty) {
                    alert(`材料不足：需要${mat}×${qty}，拥有${getItemCount(mat)}`);
                    return;
                }
            }
            
            // 检查灵石
            if (gameState.spiritStones < upgradeCost.stones) {
                alert(`灵石不足：需要${upgradeCost.stones}，拥有${gameState.spiritStones}`);
                return;
            }
            
            // 扣除材料
            for (const [mat, qty] of Object.entries(upgradeCost.materials)) {
                removeItem(mat, qty);
            }
            
            // 扣除灵石
            gameState.spiritStones -= upgradeCost.stones;
            
            // 更新功法属性
            item.level = level + 1;
            item.effect = TECHNIQUE_UPGRADE_EFFECTS[getTechniqueEffectKey(grade, level + 1)].desc;
            
            // 如果进阶到新阶等（人阶5级升灵阶1级）
            if (level === 5 && grade < 3) {
                item.grade = grade + 1;
                item.maxLevel = 5;
            }
            
            // 更新显示
            const gradeName = SECT_CONFIG.techniqueGrades[item.grade] || '人阶';
            addLog('good', '功法进阶', `【${item.name}】进阶成功！当前：${gradeName} Lv.${item.level}`);
            
            closeTechniqueUpgradeModal();
            saveGame();
            updateDisplay();
            renderInventoryGrid();
            document.getElementById('invDetail').style.display = 'none';
        }

        // ===== removeItem =====
        function removeItem(name, quantity) {
            const idx = gameState.inventory.findIndex(i => i.name === name);
            if (idx !== -1) {
                gameState.inventory[idx].quantity -= quantity;
                if (gameState.inventory[idx].quantity <= 0) {
                    gameState.inventory.splice(idx, 1);
                }
            }
        }

// ===== crafting.js =====





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

// ===== data.js =====

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
        // V28 成就系统大改版 - 30+成就/稀有度/赛季挑战/头像框气泡
        const ACHIEVEMENTS = [
            // === 修炼类 (cultivation) ===
            {
                id: 'tribulation_master',
                name: '渡劫宗师',
                desc: '渡过10次天劫',
                category: 'cultivation',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'tribulationsCompleted', value: 10 },
                reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.05 },
                title: '渡劫宗师'
            },
            {
                id: 'cultivation_path',
                name: '修炼之路',
                desc: '累计修炼1000次',
                category: 'cultivation',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 100, reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.02 } },
                    { value: 500, reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.03 } },
                    { value: 1000, reward: { type: 'title', title: '修炼狂人' } }
                ]
            },
            {
                id: 'serendipity_finder',
                name: '天选之人',
                desc: '触发20次奇遇',
                category: 'cultivation',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'serendipitiesEncountered', value: 20 },
                reward: { type: 'attribute', target: 'serendipityRate', bonus: 0.05 },
                title: '天选之人'
            },
            {
                id: 'realm_ascension',
                name: '境界突破',
                desc: '突破到更高境界',
                category: 'cultivation',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 2, reward: { type: 'attribute', target: 'cultivationBase', bonus: 0.05 } },
                    { value: 4, reward: { type: 'attribute', target: 'cultivationBase', bonus: 0.10 } },
                    { value: 6, reward: { type: 'frame', item: '头像框·筑基' } }
                ]
            },
            {
                id: 'spirit_energy_master',
                name: '灵气大师',
                desc: '灵气上限达到10000',
                category: 'cultivation',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 5000, reward: { type: 'attribute', target: 'maxQi', bonus: 0.10 } },
                    { value: 10000, reward: { type: 'bubble', item: '气泡·灵气充沛' } }
                ]
            },
            // === 战斗类 (combat) ===
            {
                id: 'dungeon_slayer',
                name: '秘境杀手',
                desc: '击杀10个秘境首领',
                category: 'combat',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'dungeonBossesKilled', value: 10 },
                reward: { type: 'attribute', target: 'attack', bonus: 0.03 },
                title: '秘境杀手'
            },
            {
                id: 'pvp_champion',
                name: ' PVP之王',
                desc: '在排行榜PVP中获得100场胜利',
                category: 'combat',
                rarity: 'legendary',
                secret: false,
                stages: [
                    { value: 10, reward: { type: 'attribute', target: 'pvpBonus', bonus: 0.05 } },
                    { value: 50, reward: { type: 'attribute', target: 'pvpBonus', bonus: 0.10 } },
                    { value: 100, reward: { type: 'title', title: 'PVP之王' } }
                ]
            },
            {
                id: 'combat_veteran',
                name: '战斗老兵',
                desc: '参与100场战斗',
                category: 'combat',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 20, reward: { type: 'attribute', target: 'attack', bonus: 0.02 } },
                    { value: 50, reward: { type: 'attribute', target: 'defense', bonus: 0.02 } },
                    { value: 100, reward: { type: 'attribute', target: 'attack', bonus: 0.05 } }
                ]
            },
            {
                id: 'arena_master',
                name: '斗法场霸主',
                desc: '在斗法场中获得50次胜利',
                category: 'combat',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'arenaWins', value: 50 },
                reward: { type: 'attribute', target: 'critPercent', bonus: 0.05 },
                title: '斗法霸主'
            },
            {
                id: 'boss_hunter',
                name: 'BOSS猎人',
                desc: '击杀各路BOSS',
                category: 'combat',
                rarity: 'legendary',
                secret: true,
                stages: [
                    { value: 1, reward: { type: 'attribute', target: 'attack', bonus: 0.05 } },
                    { value: 5, reward: { type: 'item', item: '天材', quantity: 10 } },
                    { value: 10, reward: { type: 'title', title: 'BOSS克星' } }
                ]
            },
            // === 剧情类 (story) ===
            {
                id: 'sect_founder',
                name: '宗门创始人',
                desc: '创建宗门',
                category: 'story',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'sectContributions', value: 1 },
                reward: { type: 'attribute', target: 'sectContribution', bonus: 0.10 },
                title: '宗门创始人'
            },
            {
                id: 'first_ascension',
                name: '飞升者',
                desc: '首次突破化神',
                category: 'story',
                rarity: 'legendary',
                secret: false,
                requirement: { type: 'realm', value: 4 },
                reward: { type: 'attribute', target: 'realmSuppression', bonus: 0.10 },
                title: '飞升者'
            },
            {
                id: 'story_chapter',
                name: '剧情探索者',
                desc: '完成剧情章节',
                category: 'story',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 3, reward: { type: 'attribute', target: 'storyBonus', bonus: 0.05 } },
                    { value: 10, reward: { type: 'bubble', item: '气泡·剧情达人' } },
                    { value: 20, reward: { type: 'title', title: '剧情大师' } }
                ]
            },
            {
                id: 'reincarnation_sage',
                name: '轮回仙人',
                desc: '转世重生3次',
                category: 'story',
                rarity: 'legendary',
                secret: false,
                stages: [
                    { value: 1, reward: { type: 'attribute', target: 'soulAgeBonus', bonus: 0.10 } },
                    { value: 2, reward: { type: 'frame', item: '头像框·轮回' } },
                    { value: 3, reward: { type: 'title', title: '轮回仙人' } }
                ]
            },
            // === 收藏类 (collection) ===
            {
                id: 'treasure_master',
                name: '炼器宗师',
                desc: '强化9星装备1件',
                category: 'collection',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'treasuresRefined', value: 1 },
                reward: { type: 'attribute', target: 'craftingSuccess', bonus: 0.05 },
                title: '炼器宗师'
            },
            {
                id: 'equipment_collector',
                name: '套装收藏家',
                desc: '收集全套青云套装',
                category: 'collection',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'set', setName: '青云套装' },
                reward: { type: 'attribute', target: 'setBonus', bonus: 0.15 },
                title: '套装收藏家'
            },
            {
                id: 'inventory_expand',
                name: '收藏家',
                desc: '背包物品达到上限',
                category: 'collection',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 50, reward: { type: 'attribute', target: 'inventorySize', bonus: 0.10 } },
                    { value: 100, reward: { type: 'attribute', target: 'inventorySize', bonus: 0.15 } },
                    { value: 200, reward: { type: 'frame', item: '头像框·收藏家' } }
                ]
            },
            {
                id: 'constitution_collector',
                name: '体质收集者',
                desc: '收集各种体质',
                category: 'collection',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 3, reward: { type: 'attribute', target: 'constitutionBonus', bonus: 0.05 } },
                    { value: 6, reward: { type: 'attribute', target: 'constitutionBonus', bonus: 0.10 } },
                    { value: 10, reward: { type: 'title', title: '体质大师' } }
                ]
            },
            {
                id: 'pet_collector',
                name: '灵兽收藏家',
                desc: '收集5种不同宠物',
                category: 'collection',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 3, reward: { type: 'attribute', target: 'petBonus', bonus: 0.05 } },
                    { value: 5, reward: { type: 'bubble', item: '气泡·灵兽相伴' } },
                    { value: 10, reward: { type: 'title', title: '灵兽宗师' } }
                ]
            },
            // === 探索类 (exploration) ===
            {
                id: 'world_explorer',
                name: '世界探索者',
                desc: '探索世界地图50次',
                category: 'exploration',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 10, reward: { type: 'attribute', target: 'explorationBonus', bonus: 0.03 } },
                    { value: 30, reward: { type: 'item', item: '天材', quantity: 5 } },
                    { value: 50, reward: { type: 'frame', item: '头像框·探索者' } }
                ]
            },
            {
                id: 'dungeon_explorer',
                name: '秘境探索者',
                desc: '通关秘境20次',
                category: 'exploration',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 5, reward: { type: 'attribute', target: 'dungeonBonus', bonus: 0.05 } },
                    { value: 10, reward: { type: 'item', item: '混沌石', quantity: 1 } },
                    { value: 20, reward: { type: 'title', title: '秘境探索者' } }
                ]
            },
            {
                id: 'map_revealer',
                name: '地图测绘师',
                desc: '解锁地图上50个地点',
                category: 'exploration',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 20, reward: { type: 'attribute', target: 'mapBonus', bonus: 0.05 } },
                    { value: 35, reward: { type: 'attribute', target: 'serendipityRate', bonus: 0.05 } },
                    { value: 50, reward: { type: 'bubble', item: '气泡·测绘师' } }
                ]
            },
            // === 社交类 (social) ===
            {
                id: 'social_butterfly',
                name: '社交达人',
                desc: '与其他玩家互动100次',
                category: 'social',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 20, reward: { type: 'attribute', target: 'socialBonus', bonus: 0.03 } },
                    { value: 50, reward: { type: 'attribute', target: 'socialBonus', bonus: 0.05 } },
                    { value: 100, reward: { type: 'frame', item: '头像框·社交达人' } }
                ]
            },
            {
                id: 'sect_builder',
                name: '宗门建设者',
                desc: '为宗门贡献10000资源',
                category: 'social',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 1000, reward: { type: 'attribute', target: 'sectBonus', bonus: 0.05 } },
                    { value: 5000, reward: { type: 'attribute', target: 'sectBonus', bonus: 0.10 } },
                    { value: 10000, reward: { type: 'title', title: '宗门功臣' } }
                ]
            },
            // === 特殊类 (special) ===
            {
                id: 'flawless_tribulation',
                name: '完美渡劫',
                desc: '零消耗渡劫成功',
                category: 'special',
                rarity: 'legendary',
                secret: true,
                requirement: { type: 'stat', key: 'flawlessTribulations', value: 1 },
                reward: { type: 'attribute', target: 'tribulationCost', bonus: -0.10 },
                title: '完美渡劫'
            },
            {
                id: 'dedicated_player',
                name: '坚持不懈',
                desc: '连续登录游戏30天',
                category: 'special',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 7, reward: { type: 'item', item: '天材', quantity: 3 } },
                    { value: 14, reward: { type: 'item', item: '混沌石', quantity: 1 } },
                    { value: 30, reward: { type: 'title', title: '修仙楷模' } }
                ]
            },
            {
                id: 'wealthy_cultivator',
                name: '富甲一方',
                desc: '累计拥有100000灵石',
                category: 'special',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 10000, reward: { type: 'attribute', target: 'tradeBonus', bonus: 0.05 } },
                    { value: 50000, reward: { type: 'bubble', item: '气泡·财大气粗' } },
                    { value: 100000, reward: { type: 'title', title: '灵石富翁' } }
                ]
            },
            {
                id: 'mythic_realm',
                name: '神话境界',
                desc: '突破到神话境界',
                category: 'special',
                rarity: 'mythic',
                secret: true,
                requirement: { type: 'realm', value: 10 },
                reward: { type: 'frame', item: '头像框·神话' },
                title: '神话仙人'
            },
            {
                id: 'perfectionist',
                name: '完美主义者',
                desc: '收集所有普通成就',
                category: 'special',
                rarity: 'mythic',
                secret: true,
                requirement: { type: 'allCommon', value: 1 },
                reward: { type: 'title', title: '完美主义者' }
            },
            // === 赛季专属成就 (s1) ===
            {
                id: 's1_cultivation',
                name: '赛季修炼者',
                desc: '第一赛季修炼500次',
                category: 'special',
                rarity: 'legendary',
                secret: true,
                season: 's1',
                stages: [
                    { value: 200, reward: { type: 'item', item: '天材', quantity: 5 } },
                    { value: 500, reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.10 } }
                ]
            },
            {
                id: 's1_pvp_mvp',
                name: '赛季MVP',
                desc: '第一赛季获得50场PVP胜利',
                category: 'special',
                rarity: 'legendary',
                secret: true,
                season: 's1',
                stages: [
                    { value: 20, reward: { type: 'item', item: '混沌石', quantity: 1 } },
                    { value: 50, reward: { type: 'title', title: '赛季MVP' } }
                ]
            },
            {
                id: 's1_explorer',
                name: '赛季探索家',
                desc: '第一赛季探索30次',
                category: 'special',
                rarity: 'rare',
                secret: true,
                season: 's1',
                stages: [
                    { value: 15, reward: { type: 'item', item: '天材', quantity: 3 } },
                    { value: 30, reward: { type: 'frame', item: '赛季头像框·探索' } }
                ]
            },
            {
                id: 's1_collector',
                name: '赛季收藏家',
                desc: '第一赛季收集10件套装',
                category: 'special',
                rarity: 'rare',
                secret: true,
                season: 's1',
                stages: [
                    { value: 5, reward: { type: 'attribute', target: 'collectionBonus', bonus: 0.05 } },
                    { value: 10, reward: { type: 'bubble', item: '赛季气泡·收藏' } }
                ]
            },
            {
                id: 's1_dedicated',
                name: '赛季坚持者',
                desc: '第一赛季登录20天',
                category: 'special',
                rarity: 'rare',
                secret: true,
                season: 's1',
                stages: [
                    { value: 10, reward: { type: 'item', item: '天材', quantity: 2 } },
                    { value: 20, reward: { type: 'attribute', target: 'loginBonus', bonus: 0.05 } }
                ]
            },
            {
                id: 's1_legendary',
                name: '赛季传奇',
                desc: '第一赛季获得5000赛季积分',
                category: 'special',
                rarity: 'mythic',
                secret: true,
                season: 's1',
                stages: [
                    { value: 2000, reward: { type: 'item', item: '混沌石', quantity: 2 } },
                    { value: 5000, reward: { type: 'title', title: '第一赛季·传奇' } }
                ]
            }
        ];

        // V28 成就ID兼容性映射
        const ACHIEVEMENT_ID_MAP = {
            'tribulation_master': 'tribulation_master',
            'dungeon_slayer': 'dungeon_slayer',
            'sect_founder': 'sect_founder',
            'treasure_master': 'treasure_master',
            'serendipity_finder': 'serendipity_finder',
            'first_ascension': 'first_ascension',
            'equipment_collector': 'equipment_collector',
            'flawless_tribulation': 'flawless_tribulation'
        };

        // V28 赛季系统常量
        const SEASONS = [
            {
                id: 's1',
                name: '第一赛季：青云之路',
                startDate: '2026-05-12',
                endDate: '2026-06-12',
                theme: 'cultivation',
                achievements: ['s1_cultivation', 's1_pvp_mvp', 's1_explorer', 's1_collector', 's1_dedicated', 's1_legendary'],
                rewards: [
                    { points: 1000, item: '赛季头像框·青云', type: 'frame' },
                    { points: 2000, item: '赛季气泡·青云', type: 'bubble' },
                    { points: 5000, item: '赛季称号·青云仙人', type: 'title' },
                ],
                pointsMultiplier: 2.0,
            }
        ];
        let combatEnergy = 0;
        const MAX_ENERGY = 100;
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
            const response = await fetch(`${CONFIG.apiUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: miniMaxConfig.model || 'MiniMax-M2.7',
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
            if (Math.random() < survivalChance) {
                addLog('good', '渡劫成功', '天雷降临，你成功渡过天劫，修为大涨！');
                gameState.cultivationProgress = 0;
                gameState.stage = 0;
                const oldRealm = gameState.realm;
                gameState.realm = Math.min(4, gameState.realm + 1);
                gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
                gameState.qi = Math.floor(gameState.qi / 2);
                initializeConstitutionEffects();
                if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {}, progress: {}, claimedStages: {}, seasonPoints: 0, seasonRewards: [] };
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
            const response = await fetch(`${CONFIG.apiUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: miniMaxConfig.model || 'MiniMax-M2.7',
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
                const response = await fetch(`${CONFIG.apiUrl}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                    },
                    body: JSON.stringify({
                        model: miniMaxConfig.model || 'MiniMax-M2.7',
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
            gameState.days++;
            document.getElementById('alchemyDetail').style.display = 'none';
            const resultDiv = document.getElementById('alchemyResult');
            resultDiv.style.display = 'block';
            const craftType = selectedCraftType === 'alchemy' ? '炼丹' : '炼器';
            let craftDesc = `丹炉中灵光闪烁，药香四溢...`;
            if (miniMaxConfig.apiKey) {
                try {
                    const prompt = `描述一次${craftType}过程，物品名称是${name}，用50-80字描述${craftType}时的情景，包括火候、灵气变化等。`;
                    const response = await fetch(`${CONFIG.apiUrl}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${miniMaxConfig.apiKey}`
                        },
                        body: JSON.stringify({
                            model: miniMaxConfig.model || 'MiniMax-M2.7',
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
            scene.innerHTML = `
                <div class="tribulation-loading">
                    <div class="spinner"></div>
                    <p style="color:#ffd700;font-size:1.1em">天劫降临中...</p>
                    <p style="color:#aaa;font-size:0.9em;margin-top:5px">天道感应中</p>
                </div>
            `;
            
            // 触发闪电效果
            const animContainer = document.createElement('div');
            animContainer.className = 'tribulation-anim-container';
            animContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
            scene.style.position = 'relative';
            scene.appendChild(animContainer);
            
            // 闪电定时器
            const lightningInterval = setInterval(() => {
                if (trib.type === 'thunder' || trib.type === 'all') {
                    triggerLightningEffect(animContainer);
                }
            }, 300);
            
            try {
                const desc = await generateTribulationDesc(tribKey);
                clearInterval(lightningInterval);
                scene.innerHTML = `<div class="tribulation-event"><p style="color:#ffd700;font-size:1.2em;line-height:1.6">${desc}</p></div>`;
                setTimeout(() => executeTribulation(), 2500);
            } catch (error) {
                clearInterval(lightningInterval);
                console.error('生成渡劫描述失败:', error);
                scene.innerHTML = `<p style="color:#ffd700;font-size:1.2em">${trib.desc}</p>`;
                setTimeout(() => executeTribulation(), 2000);
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
        
        // ===== enhanced handleDemonTribulation (AI心魔增强) =====
        async function enhancedHandleDemonTribulation() {
            const currentStage = gameState.tribulation.currentStage;
            const totalStages = gameState.tribulation.totalStages;
            const trib = TRIBULATIONS[gameState.tribulation.tribKey];
            
            const scene = document.getElementById('tribulationScene');
            
            // 显示加载状态
            scene.innerHTML = `
                <div class="tribulation-loading">
                    <div class="spinner"></div>
                    <p style="color:#ff00ff;font-size:1.1em">心魔入侵中...</p>
                </div>
            `;
            
            // 尝试AI生成心魔事件描述
            const stageEvent = await new Promise((resolve) => {
                generateStageEvent(currentStage, 'demon', resolve);
            });
            
            const demonDamage = 20 * (currentStage + 1);
            const preps = gameState.tribulation.preparations;
            if (preps.includes('定神丹')) {
                gameState.mindset = Math.max(0, gameState.mindset - Math.floor(demonDamage * 0.5));
            } else {
                gameState.mindset = Math.max(0, gameState.mindset - demonDamage);
            }
            gameState.tribulation.currentStage++;
            gameState.tribulation.damageTaken += demonDamage;
            
            scene.innerHTML = `
                <div class="tribulation-event">
                    <p style="color:#ff00ff;font-size:1.1em">心魔入侵！</p>
                    <p style="color:#e1bee7;margin-top:10px;font-style:italic">"${stageEvent}"</p>
                    <p style="color:#aaa;margin-top:15px">心境 -${demonDamage}${preps.includes('定神丹') ? '(定神丹减免)' : ''}</p>
                    <p style="color:#ffd700;margin-top:10px">当前心境：${gameState.mindset}/100</p>
                    <div class="tribulation-hp-bar">
                        <div class="tribulation-hp-fill ${gameState.mindset < 30 ? 'danger' : ''}" style="width:${gameState.mindset}%"></div>
                    </div>
                </div>
            `;
            
            saveGame();
            if (gameState.mindset <= 0) {
                gameState.mindset = 0;
                setTimeout(() => handleInjury(), 2000);
            } else if (gameState.tribulation.currentStage >= gameState.tribulation.totalStages) {
                setTimeout(() => handleSuccess(), 2000);
            } else {
                setTimeout(() => showTribulationUI(), 2000);
            }
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
                    if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {}, progress: {}, claimedStages: {}, seasonPoints: 0, seasonRewards: [] };
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
                // 陨落时显示轮回转世选项
                const reincarnationCount = gameState.reincarnation.count;
                const soulAge = gameState.reincarnation.soulAge;
                html += `<h2 class="defeat">💀 陨落 💀</h2>
                         <p>修仙之路充满危险，你在第${gameState.days}天陨落...</p>`;
                
                // 显示轮回信息
                if (reincarnationCount > 0) {
                    html += `<div style="margin:15px 0;padding:10px;background:rgba(100,100,255,0.2);border-radius:10px;">
                        <p style="color:#aaa;">已轮回 <span style="color:#ffd700;">${reincarnationCount}</span> 次</p>
                        <p style="color:#aaa;">灵魂修为 <span style="color:#ffd700;">${soulAge}</span></p>
                    </div>`;
                }
                
                // 转世重修按钮
                html += `<button class="btn" onclick="reincarnate()" style="margin:10px;background:linear-gradient(135deg,#9c27b0,#e91e63);color:white;">
                    🔄 轮回转世（保留${Math.floor(soulAge * 0.3)}点灵魂修为）
                </button>`;
            }
            html += '<button class="btn btn-new" onclick="startNewGame()" style="margin:10px;">重新开始</button></div>';
            document.getElementById('startScreen').innerHTML = html;
        }

        // ===== reincarnate =====
        // 轮回转世：保留部分灵魂修为重修
        function reincarnate() {
            const reincarnation = gameState.reincarnation;
            
            // 计算保留的灵魂修为（每次转世累加）
            // 灵魂修为来源：境界(5)、天数(0.1)、灵石(0.01)
            const realmExp = gameState.realm * 50;
            const daysExp = gameState.days * 0.5;
            const stonesExp = Math.min(gameState.spiritStones, 100000) * 0.01;
            const totalExp = Math.floor(realmExp + daysExp + stonesExp);
            
            // 累加到灵魂修为
            reincarnation.soulAge += totalExp;
            reincarnation.count++;
            reincarnation.hasReincarnatedBuff = true;
            reincarnation.rebirthCultivation = Math.floor(reincarnation.soulAge * 0.3);
            
            // 记录前世的某些记忆
            if (gameState.days > 365) {
                const memories = [
                    '前世的修炼经验让你对灵气感知更加敏锐',
                    '前世的记忆让你更容易参悟功法',
                    '前世经历的劫难让你心境更加坚定',
                    '前世的感悟让你的灵魂更加纯净'
                ];
                const randomMem = memories[Math.floor(Math.random() * memories.length)];
                reincarnation.pastLifeMemories.push(randomMem);
            }
            
            // 保存转世数据到localStorage
            const savedReincarnation = {
                count: reincarnation.count,
                soulAge: reincarnation.soulAge,
                pastLifeMemories: reincarnation.pastLifeMemories,
                rebirthCultivation: reincarnation.rebirthCultivation
            };
            localStorage.setItem('reincarnationData', JSON.stringify(savedReincarnation));
            
            // 执行真正的重置，但保留加成
            startNewGame(true);
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

// ===== pet.js ===== 仙宠灵兽系统













        // ===== selectPet =====
        function selectPet(index) {
            gameState.selectedPetIndex = index;
            renderPetHome('myPets');
        }

        // ===== calculatePetStat =====
        function calculatePetStat(pet, statType) {
            const typeData = PET_TYPES[pet.type];
            const baseStat = typeData.baseStats[statType];
            const qualityMult = PET_QUALITY_MULTIPLIERS[pet.quality];
            const levelBonus = 1 + (pet.level - 1) * 0.1;
            const loyaltyBonus = 1 + (pet.loyalty / 500); // 忠诚度最高提供20%加成
            const advancementBonus = 1 + (pet.advancement || 0) * PET_ADVANCEMENT_BONUS_PER_LEVEL;
            const transBonus = 1 + (PET_TRANSFORMATION_STAGES[pet.transformation || 0]?.statBonus || 0);
            return Math.floor(baseStat * qualityMult * levelBonus * loyaltyBonus * advancementBonus * transBonus);
        }

        // ===== summonPetByIndex =====
        function summonPetByIndex(index) {
            gameState.summonedPet = index;
            const pet = gameState.pets[index];
            const typeData = PET_TYPES[pet.type];
            addLog('good', '灵兽召唤', `你召唤了${pet.name}！${typeData.icon}将陪伴你征战修仙界！`);
            renderPetHome('myPets');
        }

        // ===== dismissPet =====
        function dismissPet() {
            gameState.summonedPet = null;
            addLog('neutral', '灵兽遣散', `你的灵兽已返回灵兽栏`);
            renderPetHome('myPets');
        }

        // ===== summonRandomPet =====
        function summonRandomPet() {
            if (gameState.spiritStones < PET_SUMMON_COST) {
                addLog('bad', '召唤失败', '灵石不足！');
                return;
            }
            if (gameState.pets.length >= 5) {
                addLog('bad', '召唤失败', '灵兽栏已满！');
                return;
            }

            gameState.spiritStones -= PET_SUMMON_COST;
            updateDisplay();

            // 根据玩家境界和运气决定召唤结果
            const realm = gameState.realm;
            const rand = Math.random();
            let quality;
            
            // 境界越高，越容易获得高品质灵兽
            if (rand < 0.05 + realm * 0.01) {
                quality = 'legendary'; // 5% + 境界加成
            } else if (rand < 0.15 + realm * 0.02) {
                quality = 'precious'; // 15% + 境界加成
            } else if (rand < 0.35 + realm * 0.05) {
                quality = 'rare'; // 35% + 境界加成
            } else {
                quality = 'common';
            }

            // 选择该品质的随机灵兽
            const availableTypes = Object.keys(PET_TYPES).filter(t => PET_TYPES[t].quality === quality);
            if (availableTypes.length === 0) {
                // 降一级选择
                const lowerQuality = quality === 'legendary' ? 'precious' : quality === 'precious' ? 'rare' : 'common';
                const lowerTypes = Object.keys(PET_TYPES).filter(t => PET_TYPES[t].quality === lowerQuality);
                const type = lowerTypes[Math.floor(Math.random() * lowerTypes.length)];
                quality = lowerQuality;
            } else {
                var type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            }

            const typeData = PET_TYPES[type];
            const petNames = ['小', '青', '灵', '玉', '玄', '白', '紫', '金'];
            const name = petNames[Math.floor(Math.random() * petNames.length)] + type;

            const newPet = {
                type: type,
                name: name,
                quality: quality,
                level: 1,
                exp: 0,
                loyalty: 70,
                hunger: 80,
                advancement: 0,
                transformation: 0,
                awakenedSkills: []
            };

            gameState.pets.push(newPet);
            gameState.selectedPetIndex = gameState.pets.length - 1;

            addLog('good', '召唤成功', `恭喜！你在召唤中获得了${quality === 'legendary' ? '神兽' : quality === 'precious' ? '珍兽' : quality === 'rare' ? '灵兽' : '凡兽'}${typeData.icon}${name}！`);
            renderPetHome('myPets');
        }

        // ===== buyPetFromMarket =====
        function buyPetFromMarket(type, price) {
            if (gameState.spiritStones < price) {
                addLog('bad', '购买失败', '灵石不足！');
                return;
            }
            if (gameState.pets.length >= 5) {
                addLog('bad', '购买失败', '灵兽栏已满！');
                return;
            }

            gameState.spiritStones -= price;
            const typeData = PET_TYPES[type];
            const quality = typeData.quality;
            const petNames = ['小', '青', '灵', '玉', '玄', '白', '紫', '金'];
            const name = petNames[Math.floor(Math.random() * petNames.length)] + type;

            const newPet = {
                type: type,
                name: name,
                quality: quality,
                level: 1,
                exp: 0,
                loyalty: 80,
                hunger: 80,
                advancement: 0,
                transformation: 0,
                awakenedSkills: []
            };

            gameState.pets.push(newPet);
            gameState.selectedPetIndex = gameState.pets.length - 1;

            addLog('good', '购买成功', `你购买了${typeData.icon}${name}！`);
            updateDisplay();
            renderPetHome('market');
        }

        // ===== feedPet =====
        function feedPet() {
            if (gameState.selectedPetIndex === undefined) return;
            const pet = gameState.pets[gameState.selectedPetIndex];
            if (!pet) return;

            if (gameState.spiritStones < PET_FOOD_COST) {
                addLog('bad', '喂养失败', '灵石不足！');
                return;
            }

            gameState.spiritStones -= PET_FOOD_COST;
            pet.hunger = Math.min(PET_MAX_HUNGER, pet.hunger + 40);
            pet.loyalty = Math.min(PET_MAX_LOYALTY, pet.loyalty + 5);
            pet.exp += 10; // 喂养也给少量经验

            addLog('good', '喂养成功', `你喂养了${pet.name}，它很开心！`);
            updateDisplay();
            renderPetHome('myPets');
        }

        // ===== canEvolvePet =====
        function canEvolvePet(pet) {
            if (pet.quality === 'legendary') return false; // 最高品质无法进化
            const maxLevel = PET_MAX_LEVEL[pet.quality];
            return pet.level >= maxLevel;
        }

        // ===== evolvePet =====
        function evolvePet() {
            if (gameState.selectedPetIndex === undefined) return;
            const pet = gameState.pets[gameState.selectedPetIndex];
            if (!pet) return;

            if (!canEvolvePet(pet)) {
                addLog('bad', '进化失败', '等级未满或已达到最高品质！');
                return;
            }

            const evolutionMap = {
                'common': 'rare',
                'rare': 'precious',
                'precious': 'legendary'
            };
            const newQuality = evolutionMap[pet.quality];

            // 进化后重新roll形象
            const availableTypes = Object.keys(PET_TYPES).filter(t => PET_TYPES[t].quality === newQuality);
            if (availableTypes.length === 0) {
                addLog('bad', '进化失败', '无法进化！');
                return;
            }

            const oldType = pet.type;
            pet.type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            pet.quality = newQuality;
            pet.level = 1;
            pet.exp = 0;
            pet.loyalty = Math.min(PET_MAX_LOYALTY, pet.loyalty + 20);

            const typeData = PET_TYPES[pet.type];
            addLog('good', '进化成功', `恭喜！${oldType}进化为${pet.quality === 'legendary' ? '神兽' : pet.quality === 'precious' ? '珍兽' : '灵兽'}${typeData.icon}${pet.type}！属性大幅提升！`);
            renderPetHome('myPets');
        }

        // ===== canAdvancePet =====
        function canAdvancePet(pet) {
            if (!pet) return false;
            const currentAdv = pet.advancement || 0;
            if (currentAdv >= PET_MAX_ADVANCEMENT) return false;
            const cost = PET_ADVANCEMENT_COSTS[currentAdv];
            return gameState.spiritStones >= cost.stones && pet.exp >= cost.exp;
        }

        // ===== advancePet =====
        function advancePet() {
            if (gameState.selectedPetIndex === undefined) return;
            const pet = gameState.pets[gameState.selectedPetIndex];
            if (!pet) return;

            const currentAdv = pet.advancement || 0;
            if (currentAdv >= PET_MAX_ADVANCEMENT) {
                addLog('bad', '进阶失败', '已达到最大进阶等级！');
                return;
            }

            const cost = PET_ADVANCEMENT_COSTS[currentAdv];
            if (gameState.spiritStones < cost.stones) {
                addLog('bad', '进阶失败', `灵石不足！需要${cost.stones}灵石`);
                return;
            }
            if (pet.exp < cost.exp) {
                addLog('bad', '进阶失败', `经验不足！需要${cost.exp}经验`);
                return;
            }

            gameState.spiritStones -= cost.stones;
            pet.exp -= cost.exp;
            pet.advancement = currentAdv + 1;

            addLog('good', '进阶成功', `恭喜！${pet.name}进阶成功！已达到${currentAdv + 1}阶，属性提升${PET_ADVANCEMENT_BONUS_PER_LEVEL * 100}%！`);
            updateDisplay();
            renderPetHome('myPets');
        }

        // ===== canTransformPet =====
        function canTransformPet(pet) {
            if (!pet) return false;
            const currentTrans = pet.transformation || 0;
            if (currentTrans >= 5) return false; // max is 5 (index 5 = 真形)
            const cost = PET_TRANSFORMATION_COSTS[currentTrans];
            return gameState.spiritStones >= cost.stones && gameState.realm >= cost.realmMin;
        }

        // ===== transformPet =====
        function transformPet() {
            if (gameState.selectedPetIndex === undefined) return;
            const pet = gameState.pets[gameState.selectedPetIndex];
            if (!pet) return;

            const currentTrans = pet.transformation || 0;
            if (currentTrans >= 5) {
                addLog('bad', '化形失败', '已达到最高化形境界！');
                return;
            }

            const cost = PET_TRANSFORMATION_COSTS[currentTrans];
            if (gameState.spiritStones < cost.stones) {
                addLog('bad', '化形失败', `灵石不足！需要${cost.stones}灵石`);
                return;
            }
            if (gameState.realm < cost.realmMin) {
                const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘'];
                addLog('bad', '化形失败', `境界不足！需要${realmNames[cost.realmMin]}境界`);
                return;
            }

            gameState.spiritStones -= cost.stones;
            pet.transformation = currentTrans + 1;

            const nextStage = PET_TRANSFORMATION_STAGES[pet.transformation];
            addLog('good', '化形成功', `恭喜！${pet.name}成功化为${nextStage.icon}${nextStage.name}形态！属性大幅提升！`);
            updateDisplay();
            renderPetHome('myPets');
        }

        // ===== canAwakenPetSkill =====
        function canAwakenPetSkill(pet) {
            if (!pet) return false;
            if ((pet.awakenedSkills || []).length >= PET_MAX_AWAKENED_SKILLS) return false;
            return gameState.spiritStones >= PET_AWAKENING_COST && pet.exp >= PET_AWAKENING_EXP_COST;
        }

        // ===== awakenPetSkill =====
        function awakenPetSkill() {
            if (gameState.selectedPetIndex === undefined) return;
            const pet = gameState.pets[gameState.selectedPetIndex];
            if (!pet) return;

            if ((pet.awakenedSkills || []).length >= PET_MAX_AWAKENED_SKILLS) {
                addLog('bad', '技能觉醒失败', '已达到最大觉醒技能数！');
                return;
            }

            if (gameState.spiritStones < PET_AWAKENING_COST) {
                addLog('bad', '技能觉醒失败', `灵石不足！需要${PET_AWAKENING_COST}灵石`);
                return;
            }
            if (pet.exp < PET_AWAKENING_EXP_COST) {
                addLog('bad', '技能觉醒失败', `经验不足！需要${PET_AWAKENING_EXP_COST}经验`);
                return;
            }

            gameState.spiritStones -= PET_AWAKENING_COST;
            pet.exp -= PET_AWAKENING_EXP_COST;

            // 获取可觉醒的技能池
            const quality = pet.quality;
            const availableSkills = [];
            // 总是可以觉醒通用技能
            availableSkills.push(...PET_AWAKENING_SKILLS.common);
            // 根据品质添加对应级别的技能
            if (quality !== 'common') {
                availableSkills.push(...PET_AWAKENING_SKILLS.rare);
            }
            if (quality === 'precious' || quality === 'legendary') {
                availableSkills.push(...PET_AWAKENING_SKILLS.precious);
            }
            if (quality === 'legendary') {
                availableSkills.push(...PET_AWAKENING_SKILLS.legendary);
            }

            // 过滤掉已经觉醒的技能
            const currentSkills = pet.awakenedSkills || [];
            const filteredSkills = availableSkills.filter(s => 
                !currentSkills.some(cs => cs.name === s.name)
            );

            if (filteredSkills.length === 0) {
                // 退还灵石（理论上不应该发生）
                gameState.spiritStones += PET_AWAKENING_COST;
                pet.exp += PET_AWAKENING_EXP_COST;
                addLog('bad', '技能觉醒失败', '没有可觉醒的技能！');
                return;
            }

            // 随机选择一个技能觉醒
            const awakenedSkill = filteredSkills[Math.floor(Math.random() * filteredSkills.length)];
            pet.awakenedSkills = [...currentSkills, awakenedSkill];

            addLog('good', '技能觉醒成功', `恭喜！${pet.name}觉醒了${awakenedSkill.icon}${awakenedSkill.name}！效果：${awakenedSkill.desc}`);
            updateDisplay();
            renderPetHome('myPets');
        }

        // ===== releasePet =====
        function releasePet() {
            if (gameState.selectedPetIndex === undefined) return;
            const pet = gameState.pets[gameState.selectedPetIndex];
            if (!pet) return;

            const confirmed = confirm(`确定要释放${pet.name}吗？释放后将无法恢复。`);
            if (!confirmed) return;

            if (gameState.summonedPet === gameState.selectedPetIndex) {
                gameState.summonedPet = null;
            } else if (gameState.summonedPet !== null && gameState.summonedPet > gameState.selectedPetIndex) {
                gameState.summonedPet--;
            }

            gameState.pets.splice(gameState.selectedPetIndex, 1);
            gameState.selectedPetIndex = undefined;

            addLog('neutral', '灵兽释放', `你释放了${pet.name}。`);
            renderPetHome('myPets');
        }



        // ===== selectBreedingPet =====
        function selectBreedingPet(slot) {
            // 打开宠物选择模式
            if (slot === 1) {
                gameState.selectedBreedingPet1 = null;
            } else {
                gameState.selectedBreedingPet2 = null;
            }
            renderPetBreeding();
        }

        // ===== selectBreedingPetFromList =====
        function selectBreedingPetFromList(index) {
            const pets = gameState.pets;
            const pet1Index = gameState.selectedBreedingPet1;
            const pet2Index = gameState.selectedBreedingPet2;
            
            if (pet1Index === index) {
                gameState.selectedBreedingPet1 = null;
            } else if (pet2Index === index) {
                gameState.selectedBreedingPet2 = null;
            } else if (pet1Index === null) {
                gameState.selectedBreedingPet1 = index;
            } else if (pet2Index === null) {
                gameState.selectedBreedingPet2 = index;
            } else {
                // 替换pet1
                gameState.selectedBreedingPet1 = index;
            }
            gameState.breedingResult = null;
            renderPetBreeding();
        }

        // ===== startBreeding =====
        function startBreeding() {
            const pet1Index = gameState.selectedBreedingPet1;
            const pet2Index = gameState.selectedBreedingPet2;
            if (pet1Index === null || pet2Index === null) {
                addLog('bad', '繁殖失败', '请选择两只灵兽！');
                return;
            }
            if (pet1Index === pet2Index) {
                addLog('bad', '繁殖失败', '不能选择同一只灵兽！');
                return;
            }
            if (gameState.spiritStones < PET_BREEDING_COST) {
                addLog('bad', '繁殖失败', '灵石不足！');
                return;
            }
            
            const pet1 = gameState.pets[pet1Index];
            const pet2 = gameState.pets[pet2Index];
            const breedingCooldowns = gameState.petBreedingCooldowns || {};
            
            // 检查冷却
            if ((breedingCooldowns[pet1.type + pet1.name] || 0) > 0) {
                addLog('bad', '繁殖失败', `${pet1.name}还在冷却中！`);
                return;
            }
            if ((breedingCooldowns[pet2.type + pet2.name] || 0) > 0) {
                addLog('bad', '繁殖失败', `${pet2.name}还在冷却中！`);
                return;
            }
            
            // 消耗灵石
            gameState.spiritStones -= PET_BREEDING_COST;
            
            // 设置冷却
            if (!gameState.petBreedingCooldowns) gameState.petBreedingCooldowns = {};
            gameState.petBreedingCooldowns[pet1.type + pet1.name] = PET_BREEDING_COOLDOWN;
            gameState.petBreedingCooldowns[pet2.type + pet2.name] = PET_BREEDING_COOLDOWN;
            
            // 降低饱食度
            pet1.hunger = Math.max(0, pet1.hunger - 20);
            pet2.hunger = Math.max(0, pet2.hunger - 20);
            
            // 增加忠诚度
            pet1.loyalty = Math.min(PET_MAX_LOYALTY, pet1.loyalty + 10);
            pet2.loyalty = Math.min(PET_MAX_LOYALTY, pet2.loyalty + 10);
            
            // 计算后代品质 - 基于父母品质
            const qualityRand = Math.random();
            const parentQualityAvg = (PET_QUALITY_MULTIPLIERS[pet1.quality] + PET_QUALITY_MULTIPLIERS[pet2.quality]) / 2;
            
            let resultQuality;
            const roll = Math.random();
            if (roll < 0.05 * parentQualityAvg) {
                resultQuality = 'legendary';
            } else if (roll < 0.15 * parentQualityAvg) {
                resultQuality = 'precious';
            } else if (roll < 0.35 * parentQualityAvg) {
                resultQuality = 'rare';
            } else {
                resultQuality = 'common';
            }
            
            // 决定后代类型 - 父母中随机
            const resultType = Math.random() < 0.5 ? pet1.type : pet2.type;
            
            // 计算孵化天数
            const hatchDays = PET_INCUBATION_DAYS_BASE + Math.floor(Math.random() * PET_INCUBATION_DAYS_VAR) + 1;
            
            // 创建蛋
            const newEgg = {
                id: Date.now(),
                quality: resultQuality,
                type: resultType,
                daysLeft: hatchDays,
                totalDays: hatchDays,
                isHatching: false
            };
            
            if (!gameState.petEggs) gameState.petEggs = [];
            if (gameState.petEggs.length >= PET_MAX_EGGS) {
                addLog('bad', '繁殖失败', '孵化巢已满！');
                return;
            }
            gameState.petEggs.push(newEgg);
            
            gameState.breedingResult = {
                quality: resultQuality,
                type: resultType,
                hatchDays: hatchDays
            };
            
            const qualityName = resultQuality === 'legendary' ? '神兽' : resultQuality === 'precious' ? '珍兽' : resultQuality === 'rare' ? '灵兽' : '凡兽';
            addLog('good', '繁殖成功', `恭喜！${pet1.name}与${pet2.name}繁殖获得${qualityName}蛋！`);
            
            updateDisplay();
            renderPetBreeding();
        }



        // ===== startIncubation =====
        function startIncubation(eggIndex) {
            const egg = gameState.petEggs[eggIndex];
            if (!egg) return;
            if (egg.daysLeft <= 0) {
                addLog('bad', '孵化失败', '这个蛋已经可以孵化了！');
                return;
            }
            if (gameState.spiritStones < 50) {
                addLog('bad', '孵化失败', '灵石不足！催熟需要50灵石');
                return;
            }
            
            gameState.spiritStones -= 50;
            egg.daysLeft = Math.max(0, egg.daysLeft - 1);
            
            addLog('good', '催熟成功', `你使用灵石催熟灵兽蛋，距离孵化还有${egg.daysLeft}天`);
            
            updateDisplay();
            renderPetIncubation();
        }

        // ===== cancelIncubation =====
        function cancelIncubation(eggIndex) {
            const egg = gameState.petEggs[eggIndex];
            if (!egg) return;
            egg.isHatching = false;
            addLog('neutral', '取消催熟', '已取消灵兽蛋的催熟');
            renderPetIncubation();
        }

        // ===== hatchEgg =====
        function hatchEgg(eggIndex) {
            const egg = gameState.petEggs[eggIndex];
            if (!egg) return;
            if (egg.daysLeft > 0) {
                addLog('bad', '孵化失败', '灵兽蛋还未孵化完成！');
                return;
            }
            if (gameState.pets.length >= 5) {
                addLog('bad', '孵化失败', '灵兽栏已满！');
                return;
            }
            
            // 创建新灵兽
            const typeData = PET_TYPES[egg.type];
            const quality = egg.quality;
            const petNames = ['小', '青', '灵', '玉', '玄', '白', '紫', '金'];
            const name = petNames[Math.floor(Math.random() * petNames.length)] + egg.type;
            
            const newPet = {
                type: egg.type,
                name: name,
                quality: quality,
                level: 1,
                exp: 0,
                loyalty: 80,
                hunger: 80,
                advancement: 0,
                transformation: 0,
                genes: {},
                mutations: []
            };
            
            // 移除蛋
            gameState.petEggs.splice(eggIndex, 1);
            gameState.pets.push(newPet);
            gameState.selectedPetIndex = gameState.pets.length - 1;
            
            const qualityName = quality === 'legendary' ? '神兽' : quality === 'precious' ? '珍兽' : quality === 'rare' ? '灵兽' : '凡兽';
            addLog('good', '孵化成功', `恭喜！${typeData.icon}${name}孵化成功！获得了${qualityName}！`);
            
            updateDisplay();
            renderPetIncubation();
        }

        // ===== discardEgg =====
        function discardEgg(eggIndex) {
            const egg = gameState.petEggs[eggIndex];
            if (!egg) return;

            const confirmed = confirm('确定要丢弃这个灵兽蛋吗？丢弃后将无法恢复。');
            if (!confirmed) return;

            gameState.petEggs.splice(eggIndex, 1);
            addLog('neutral', '丢弃灵兽蛋', '你丢弃了一个灵兽蛋');
            renderPetIncubation();
        }



        // ===== calculateFusionPreview =====
        function calculateFusionPreview(pet1, pet2) {
            const type1 = pet1.type;
            const type2 = pet2.type;

            // 计算基础属性（取平均）
            const attack1 = calculatePetStat(pet1, 'attack');
            const attack2 = calculatePetStat(pet2, 'attack');
            const defense1 = calculatePetStat(pet1, 'defense');
            const defense2 = calculatePetStat(pet2, 'defense');
            const hp1 = calculatePetStat(pet1, 'hp');
            const hp2 = calculatePetStat(pet2, 'hp');

            // 融合属性计算（加权平均 + 随机波动）
            const qualityBonus1 = PET_QUALITY_MULTIPLIERS[pet1.quality];
            const qualityBonus2 = PET_QUALITY_MULTIPLIERS[pet2.quality];
            const avgQuality = (qualityBonus1 + qualityBonus2) / 2;

            const attack = Math.floor((attack1 + attack2) / 2 * (1 + Math.random() * 0.2) * avgQuality / 1.5);
            const defense = Math.floor((defense1 + defense2) / 2 * (1 + Math.random() * 0.2) * avgQuality / 1.5);
            const hp = Math.floor((hp1 + hp2) / 2 * (1 + Math.random() * 0.2) * avgQuality / 1.5);

            // 检查特殊组合
            let specialCombo = null;
            const combo1 = `${type1}+${type2}`;
            const combo2 = `${type2}+${type1}`;
            if (PET_FUSION_COMBINATIONS[combo1]) {
                specialCombo = PET_FUSION_COMBINATIONS[combo1].name;
            } else if (PET_FUSION_COMBINATIONS[combo2]) {
                specialCombo = PET_FUSION_COMBINATIONS[combo2].name;
            }

            return { attack, defense, hp, specialCombo };
        }

        // ===== getPetGeneLevel =====
        function getPetGeneLevel(pet, geneType) {
            if (!pet.genes) return 0;
            return pet.genes[geneType] || 0;
        }

        // ===== selectFusionPet =====
        function selectFusionPet(slot) {
            if (slot === 1) {
                gameState.selectedFusionPet1 = null;
            } else {
                gameState.selectedFusionPet2 = null;
            }
            gameState.fusionResult = null;
            renderPetFusion();
        }

        // ===== selectFusionPetFromList =====
        function selectFusionPetFromList(index) {
            const pets = gameState.pets;
            const pet1Index = gameState.selectedFusionPet1;
            const pet2Index = gameState.selectedFusionPet2;

            if (pet1Index === index) {
                gameState.selectedFusionPet1 = null;
            } else if (pet2Index === index) {
                gameState.selectedFusionPet2 = null;
            } else if (pet1Index === null) {
                gameState.selectedFusionPet1 = index;
            } else if (pet2Index === null) {
                gameState.selectedFusionPet2 = index;
            } else {
                // 替换pet1
                gameState.selectedFusionPet1 = index;
            }
            gameState.fusionResult = null;
            renderPetFusion();
        }

        // ===== startFusion =====
        function startFusion() {
            const pet1Index = gameState.selectedFusionPet1;
            const pet2Index = gameState.selectedFusionPet2;
            if (pet1Index === null || pet2Index === null) {
                addLog('bad', '融合失败', '请选择两只灵兽！');
                return;
            }
            if (pet1Index === pet2Index) {
                addLog('bad', '融合失败', '不能选择同一只灵兽！');
                return;
            }
            if (gameState.spiritStones < PET_FUSION_COST) {
                addLog('bad', '融合失败', '灵石不足！');
                return;
            }

            const pet1 = gameState.pets[pet1Index];
            const pet2 = gameState.pets[pet2Index];
            const fusionCooldowns = gameState.fusionCooldowns || {};

            // 检查冷却
            if ((fusionCooldowns[pet1.type + pet1.name + pet1.id] || 0) > 0) {
                addLog('bad', '融合失败', `${pet1.name}还在融合冷却中！`);
                return;
            }
            if ((fusionCooldowns[pet2.type + pet2.name + pet2.id] || 0) > 0) {
                addLog('bad', '融合失败', `${pet2.name}还在融合冷却中！`);
                return;
            }

            // 消耗灵石
            gameState.spiritStones -= PET_FUSION_COST;

            // 设置冷却
            if (!gameState.fusionCooldowns) gameState.fusionCooldowns = {};
            gameState.fusionCooldowns[pet1.type + pet1.name + pet1.id] = PET_FUSION_COOLDOWN;
            gameState.fusionCooldowns[pet2.type + pet2.name + pet2.id] = PET_FUSION_COOLDOWN;

            // 降低饱食度
            pet1.hunger = Math.max(0, pet1.hunger - 30);
            pet2.hunger = Math.max(0, pet2.hunger - 30);

            // 计算融合后代
            const preview = calculateFusionPreview(pet1, pet2);
            const type1 = pet1.type;
            const type2 = pet2.type;
            const combo1 = `${type1}+${type2}`;
            const combo2 = `${type2}+${type1}`;

            // 检查是否是特殊组合
            let isSpecialCombo = false;
            let fusionResultName = '';
            let fusionResultIcon = '';
            let fusionResultAbility = '';

            if (PET_FUSION_COMBINATIONS[combo1]) {
                isSpecialCombo = true;
                fusionResultName = PET_FUSION_COMBINATIONS[combo1].name;
                fusionResultIcon = PET_FUSION_COMBINATIONS[combo1].icon;
                fusionResultAbility = PET_FUSION_COMBINATIONS[combo1].ability;
            } else if (PET_FUSION_COMBINATIONS[combo2]) {
                isSpecialCombo = true;
                fusionResultName = PET_FUSION_COMBINATIONS[combo2].name;
                fusionResultIcon = PET_FUSION_COMBINATIONS[combo2].icon;
                fusionResultAbility = PET_FUSION_COMBINATIONS[combo2].ability;
            }

            // 确定新灵兽类型
            let resultType;
            if (isSpecialCombo) {
                // 特殊组合保留组合名作为类型标识
                resultType = fusionResultName;
            } else {
                // 普通融合随机选择父本类型
                resultType = Math.random() < 0.5 ? type1 : type2;
            }

            // 计算品质 - 基于父母品质
            const qualityRand = Math.random();
            const parentQualityAvg = (PET_QUALITY_MULTIPLIERS[pet1.quality] + PET_QUALITY_MULTIPLIERS[pet2.quality]) / 2;
            let resultQuality;
            const roll = Math.random();
            if (roll < 0.03 * parentQualityAvg) {
                resultQuality = 'legendary';
            } else if (roll < 0.10 * parentQualityAvg) {
                resultQuality = 'precious';
            } else if (roll < 0.25 * parentQualityAvg) {
                resultQuality = 'rare';
            } else {
                resultQuality = 'common';
            }

            // 合并基因
            const mergedGenes = {};
            const geneTypes = Object.keys(PET_GENE_TYPES);
            geneTypes.forEach(geneType => {
                const gene1 = getPetGeneLevel(pet1, geneType);
                const gene2 = getPetGeneLevel(pet2, geneType);
                // 融合基因：取最大值 + 随机增量
                mergedGenes[geneType] = Math.max(gene1, gene2) + (Math.random() < 0.3 ? 1 : 0);
                mergedGenes[geneType] = Math.min(mergedGenes[geneType], 3); // 最大3级
            });

            // 合并变异效果
            const mergedMutations = [...(pet1.mutations || []), ...(pet2.mutations || [])];
            // 去重
            const uniqueMutations = [];
            const seen = new Set();
            mergedMutations.forEach(m => {
                if (!seen.has(m.id)) {
                    seen.add(m.id);
                    uniqueMutations.push(m);
                }
            });

            // 继承父本等级的一半
            const inheritedLevel = Math.floor((pet1.level + pet2.level) / 4);

            // 创建新的融合灵兽
            const newPet = {
                id: Date.now(),
                name: isSpecialCombo ? fusionResultName : `${type1}${type2}融合兽`,
                type: resultType,
                quality: resultQuality,
                level: Math.max(1, inheritedLevel),
                exp: 0,
                loyalty: Math.floor((pet1.loyalty + pet2.loyalty) / 2),
                hunger: 100,
                genes: mergedGenes,
                mutations: uniqueMutations.slice(0, 3), // 最多保留3个变异
                inheritedSkills: true
            };

            // 移除父母灵兽
            const indicesToRemove = [pet1Index, pet2Index].sort((a, b) => b - a);
            indicesToRemove.forEach(idx => {
                gameState.pets.splice(idx, 1);
            });

            // 添加新灵兽
            if (gameState.pets.length >= 5) {
                addLog('bad', '融合失败', '灵兽栏已满，无法获得融合后的灵兽！');
                return;
            }
            gameState.pets.push(newPet);

            // 清除选择状态
            gameState.selectedFusionPet1 = null;
            gameState.selectedFusionPet2 = null;

            gameState.fusionResult = {
                name: newPet.name,
                type: newPet.type,
                icon: isSpecialCombo ? fusionResultIcon : PET_TYPES[type1]?.icon || '🐉',
                quality: newPet.quality,
                attack: preview.attack,
                defense: preview.defense,
                hp: preview.hp,
                isSpecialCombo: isSpecialCombo,
                combinationAbility: fusionResultAbility
            };

            const qualityName = resultQuality === 'legendary' ? '神兽' : resultQuality === 'precious' ? '珍兽' : resultQuality === 'rare' ? '灵兽' : '凡兽';
            addLog('good', '融合成功', `恭喜！${pet1.name}与${pet2.name}融合生成${fusionResultName}（${qualityName}）！`);

            updateDisplay();
            renderPetFusion();
        }

        // ===== startMutation =====
        function startMutation(petIndex) {
            const pet = gameState.pets[petIndex];
            if (!pet) return;

            const mutationCooldowns = gameState.mutationCooldowns || {};
            if ((mutationCooldowns[pet.type + pet.name + pet.id] || 0) > 0) {
                addLog('bad', '变异失败', `${pet.name}还在变异冷却中！`);
                return;
            }

            if (gameState.spiritStones < PET_MUTATION_COST) {
                addLog('bad', '变异失败', '灵石不足！');
                return;
            }

            gameState.spiritStones -= PET_MUTATION_COST;

            // 设置冷却
            if (!gameState.mutationCooldowns) gameState.mutationCooldowns = {};
            gameState.mutationCooldowns[pet.type + pet.name + pet.id] = PET_MUTATION_COOLDOWN;

            // 计算变异概率（受品质影响）
            const qualityBonus = PET_QUALITY_MULTIPLIERS[pet.quality];
            const mutationChance = PET_MUTATION_BASE_CHANCE * qualityBonus;
            const roll = Math.random();

            // 初始化变异和基因数组
            if (!pet.mutations) pet.mutations = [];
            if (!pet.genes) pet.genes = {};

            if (roll < mutationChance) {
                // 变异成功
                // 选择一个变异效果
                const possibleEffects = PET_MUTATION_EFFECTS.filter(e => !pet.mutations.find(m => m.id === e.id));
                if (possibleEffects.length > 0) {
                    // 按概率加权选择
                    const totalWeight = possibleEffects.reduce((sum, e) => sum + e.probability, 0);
                    let random = Math.random() * totalWeight;
                    let selectedEffect = possibleEffects[0];
                    for (const effect of possibleEffects) {
                        random -= effect.probability;
                        if (random <= 0) {
                            selectedEffect = effect;
                            break;
                        }
                    }

                    pet.mutations.push({
                        id: selectedEffect.id,
                        name: selectedEffect.name,
                        desc: selectedEffect.desc,
                        stat: selectedEffect.stat,
                        value: selectedEffect.value
                    });

                    // 强化对应基因
                    const geneType = getGeneTypeFromStat(selectedEffect.stat);
                    if (geneType && pet.genes[geneType] !== undefined) {
                        pet.genes[geneType] = Math.min(3, (pet.genes[geneType] || 0) + 1);
                    } else if (geneType) {
                        pet.genes[geneType] = 1;
                    }

                    addLog('good', '基因变异成功', `${pet.name}发生基因变异，获得了「${selectedEffect.name}」！`);
                } else {
                    // 所有变异效果都已拥有，随机强化一个基因
                    const geneTypes = Object.keys(PET_GENE_TYPES);
                    const randomGene = geneTypes[Math.floor(Math.random() * geneTypes.length)];
                    pet.genes[randomGene] = Math.min(3, (pet.genes[randomGene] || 0) + 1);
                    addLog('good', '基因强化', `${pet.name}的「${PET_GENE_TYPES[randomGene].name}」得到强化！`);
                }
            } else {
                // 变异失败，但有概率强化基因
                if (Math.random() < 0.3) {
                    const geneTypes = Object.keys(PET_GENE_TYPES);
                    const randomGene = geneTypes[Math.floor(Math.random() * geneTypes.length)];
                    pet.genes[randomGene] = Math.min(3, (pet.genes[randomGene] || 0) + 1);
                    addLog('neutral', '变异尝试', `${pet.name}变异失败，但基因「${PET_GENE_TYPES[randomGene].name}」略有强化。`);
                } else {
                    addLog('neutral', '变异尝试', `${pet.name}基因变异未成功，但身体健康无恙。`);
                }
            }

            updateDisplay();
            renderPetFusion();
        }

        // ===== getGeneTypeFromStat =====
        function getGeneTypeFromStat(stat) {
            switch(stat) {
                case 'attack': return 'attack';
                case 'defense': return 'defense';
                case 'hp': return 'hp';
                case 'speed': return 'speed';
                case 'crit': return 'crit';
                case 'luck': return 'lucky';
                default: return null;
            }
        }

        // ===== getActivePet =====
        function getActivePet() {
            if (gameState.summonedPet !== null && gameState.pets[gameState.summonedPet]) {
                return gameState.pets[gameState.summonedPet];
            }
            return null;
        }

        // ===== getPetBonus =====
        function getPetBonus(type) {
            const pet = getActivePet();
            if (!pet) return 0;

            const typeData = PET_TYPES[pet.type];
            const qualityMult = PET_QUALITY_MULTIPLIERS[pet.quality];
            const levelBonus = 1 + (pet.level - 1) * 0.1;
            const loyaltyBonus = pet.loyalty / 100;

            switch(type) {
                case 'cultivate_speed':
                    // 麒麟提供修炼速度
                    if (pet.type === '麒麟') return 0.15 * qualityMult * loyaltyBonus;
                    return 0;
                case 'serendipity_boost':
                    // 白泽提供奇遇加成
                    if (pet.type === '白泽') return 0.2 * qualityMult * loyaltyBonus;
                    return 0;
                case 'attack':
                case 'defense':
                case 'hp':
                    // 战斗型宠物加成
                    return calculatePetStat(pet, type) * 0.1 * loyaltyBonus;
                case 'qi_rate':
                    // 玉兔每3天产出灵气
                    if (pet.type === '玉兔') return 5 / 3;
                    return 0;
                default:
                    return 0;
            }
        }

        // ===== processPetDaily =====
        function processPetDaily() {
            // 每日处理宠物状态
            gameState.pets.forEach(pet => {
                // 饱食度下降
                pet.hunger = Math.max(0, pet.hunger - PET_HUNGER_DECAY_RATE);
                // 忠诚度下降（饿着会影响忠诚）
                const hungerPenalty = pet.hunger < 30 ? PET_LOYALTY_DECAY_RATE * 2 : PET_LOYALTY_DECAY_RATE;
                pet.loyalty = Math.max(0, pet.loyalty - hungerPenalty);

                // 特殊宠物效果
                if (pet.type === '玉兔' && gameState.days % 3 === 0) {
                    gameState.qi = Math.min(gameState.maxQi, gameState.qi + 5);
                    addLog('good', '玉兔捣药', '玉兔为你捣药，天地灵气+5');
                }
            });
            
            // 处理繁殖冷却
            if (gameState.petBreedingCooldowns) {
                Object.keys(gameState.petBreedingCooldowns).forEach(key => {
                    if (gameState.petBreedingCooldowns[key] > 0) {
                        gameState.petBreedingCooldowns[key]--;
                    }
                });
            }

            // 处理融合冷却
            if (gameState.fusionCooldowns) {
                Object.keys(gameState.fusionCooldowns).forEach(key => {
                    if (gameState.fusionCooldowns[key] > 0) {
                        gameState.fusionCooldowns[key]--;
                    }
                });
            }

            // 处理变异冷却
            if (gameState.mutationCooldowns) {
                Object.keys(gameState.mutationCooldowns).forEach(key => {
                    if (gameState.mutationCooldowns[key] > 0) {
                        gameState.mutationCooldowns[key]--;
                    }
                });
            }
            
            // 处理宠物基因变异效果（每天恢复一定生命）
            gameState.pets.forEach(pet => {
                if (pet.mutations) {
                    const regenMutation = pet.mutations.find(m => m.id === 'regen');
                    if (regenMutation) {
                        // 再生能力：每天恢复5%生命
                        const maxHp = calculatePetStat(pet, 'hp');
                        const healAmount = Math.floor(maxHp * regenMutation.value);
                    }
                }
            });

            // 处理灵兽蛋孵化
            if (gameState.petEggs && gameState.petEggs.length > 0) {
                gameState.petEggs.forEach(egg => {
                    if (egg.daysLeft > 0) {
                        egg.daysLeft--;
                        if (egg.daysLeft === 0) {
                            const eggData = PET_EGG_TYPES[egg.quality];
                            addLog('good', '灵兽蛋孵化', `${eggData.name}已孵化完成，可以前往孵化巢穴领取了！`);
                        }
                    }
                });
            }
        }

// ===== sect.js =====







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
                case 'manage':
                    tabContent.innerHTML = renderManageTab();
                    break;
            }
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
                lastResourceCollection: gameState.days,
                // 双轨系统字段
                dualTrackEnabled: false,
                syncResources: false,
                syncInterval: 1,
                dispatchedToPalace: 0,
                // V39 NPC自主行动系统字段
                npcTasks: [],
                npcLeaderId: null,
                npcLastActionDay: 0,
                // V41 宗门气氛值
                sectMood: 70
            };
            
            // 给宗主添加一个初始弟子
            addDisciple('入门弟子', 3);
            
            addLog('good', '宗门创建', `恭喜！${name}正式成立，你成为开山宗主！`);

            // A5 成就检查 - 宗门创建
            if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {}, progress: {}, claimedStages: {}, seasonPoints: 0, seasonRewards: [] };
            gameState.achievements.stats.sectContributions++;
            checkAchievements();

            saveGame();
            updateDisplay();
            renderSectHome();
        }













        // ===== calculateDualTrackBonus ===== 计算双轨加成
        function calculateDualTrackBonus() {
            const sect = gameState.sect;
            const palace = gameState.palace;
            let bonuses = { sectBonus: 0, palaceBonus: 0, cultivateBonus: 0, total: 0 };
            
            if (!sect.dualTrackEnabled || !palace.name) return bonuses;
            
            // 基础双轨加成
            bonuses.sectBonus = 0.05;  // 宗门灵石+5%
            bonuses.palaceBonus = 0.05; // 仙宫产出+5%
            
            // 弟子派遣加成：每派遣1名弟子，双方各获得+2%加成
            const dispatchedCount = sect.dispatchedToPalace || 0;
            bonuses.sectBonus += dispatchedCount * 0.02;
            bonuses.palaceBonus += dispatchedCount * 0.02;
            
            // 资源同步加成
            if (sect.syncResources) {
                bonuses.cultivateBonus = 0.03; // 修炼速度+3%
            }
            
            // 等级差加成：宗门等级+仙宫等级 > 6时额外+5%
            if ((sect.level + palace.level) > 6) {
                bonuses.sectBonus += 0.05;
                bonuses.palaceBonus += 0.05;
            }
            
            bonuses.total = bonuses.sectBonus + bonuses.palaceBonus + bonuses.cultivateBonus;
            return bonuses;
        }

        // ===== toggleDualTrack =====
        function toggleDualTrack() {
            const sect = gameState.sect;
            sect.dualTrackEnabled = !sect.dualTrackEnabled;
            if (sect.dualTrackEnabled) {
                addLog('good', '双轨系统', `宗门与仙宫开启双轨互联！`);
            } else {
                addLog('neutral', '双轨系统', `双轨互联已停用`);
            }
            saveGame();
            renderSectHome();
        }

        // ===== toggleSyncResources =====
        function toggleSyncResources() {
            const sect = gameState.sect;
            sect.syncResources = !sect.syncResources;
            addLog('good', '资源同步', sect.syncResources ? '灵石共享已开启' : '灵石共享已关闭');
            saveGame();
            renderSectHome();
        }

        // ===== dispatchDiscipleToPalace =====
        function dispatchDiscipleToPalace() {
            const sect = gameState.sect;
            const palace = gameState.palace;
            
            if (!sect.disciples || sect.disciples.length === 0) {
                alert('宗门没有弟子可派遣！');
                return;
            }
            
            const maxPalaceDisciples = PALACE_CONFIG.maxPalaceDisciples[palace.level];
            if (palace.disciples.length >= maxPalaceDisciples) {
                alert(`仙宫弟子已达上限（${maxPalaceDisciples}人）！`);
                return;
            }
            
            // 打开选择弟子模态框
            showDiscipleSelectionModal('dispatch');
        }

        // ===== recallDiscipleFromPalace =====
        function recallDiscipleFromPalace() {
            const sect = gameState.sect;
            const palace = gameState.palace;
            
            if (!palace.disciples || palace.disciples.length === 0) {
                alert('仙宫没有弟子可召回！');
                return;
            }
            
            const maxDisciples = SECT_CONFIG.maxDisciples[sect.level];
            if (sect.disciples.length >= maxDisciples) {
                alert(`宗门弟子已达上限（${maxDisciples}人）！`);
                return;
            }
            
            // 打开选择弟子模态框
            showPalaceDiscipleSelectionModal('recall');
        }

        // ===== showDiscipleSelectionModal =====
        function showDiscipleSelectionModal(action) {
            const sect = gameState.sect;
            const palace = gameState.palace;
            const maxPalaceDisciples = PALACE_CONFIG.maxPalaceDisciples[palace.level];
            
            let html = `
                <div style="padding:20px;">
                    <h4 style="color:#9c27b0;margin-bottom:15px;text-align:center;">${action === 'dispatch' ? '🚀 选择派遣弟子' : '🔙 选择召回弟子'}</h4>
            `;
            
            if (action === 'dispatch') {
                const availableCount = sect.disciples.filter(d => !d.dispatched).length;
                const canDispatch = availableCount > 0 && palace.disciples.length < maxPalaceDisciples;
                html += `<div style="color:#aaa;font-size:0.9em;margin-bottom:15px;text-align:center;">可派遣: ${availableCount}人 | 仙宫空位: ${maxPalaceDisciples - palace.disciples.length}</div>`;
                
                html += '<div style="max-height:300px;overflow-y:auto;">';
                sect.disciples.filter(d => !d.dispatched).forEach((d, idx) => {
                    const realIdx = sect.disciples.findIndex(dd => dd.uid === d.uid);
                    html += `
                        <div onclick="selectDiscipleForDispatch(${realIdx})" style="padding:12px;background:rgba(0,0,0,0.3);border-radius:8px;margin-bottom:8px;cursor:pointer;border:1px solid rgba(255,111,0,0.3);transition:all 0.2s;" onmouseover="this.style.borderColor='#ffb300'" onmouseout="this.style.borderColor='rgba(255,111,0,0.3)'">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <span style="color:#ffd700;font-weight:bold;">${d.name}</span>
                                    <span style="color:#aaa;font-size:0.85em;margin-left:10px;">${CONFIG.realms[d.realm]}期</span>
                                </div>
                                <span class="talent-${['low','mid','mid','high','super'][d.talentIndex || 1]}">${d.talent}资质</span>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            html += `<button onclick="closeDiscipleSelectionModal()" style="width:100%;padding:10px;margin-top:15px;background:#555;color:white;border:none;border-radius:8px;cursor:pointer;">取消</button>`;
            html += '</div>';
            
            // 创建临时模态框
            const modal = document.createElement('div');
            modal.id = 'discipleSelectModal';
            modal.className = 'modal active';
            modal.innerHTML = `<div class="modal-content" style="max-width:400px;background:linear-gradient(135deg,#1a0a2e,#2d1b4e);border:2px solid rgba(156,39,176,0.5);">${html}</div>`;
            document.body.appendChild(modal);
        }

        // ===== showPalaceDiscipleSelectionModal =====
        function showPalaceDiscipleSelectionModal(action) {
            const palace = gameState.palace;
            
            let html = `
                <div style="padding:20px;">
                    <h4 style="color:#ffb300;margin-bottom:15px;text-align:center;">🔙 选择召回弟子</h4>
            `;
            
            html += `<div style="color:#aaa;font-size:0.9em;margin-bottom:15px;text-align:center;">仙宫弟子: ${palace.disciples.length}人</div>`;
            
            html += '<div style="max-height:300px;overflow-y:auto;">';
            palace.disciples.forEach((d, idx) => {
                html += `
                    <div onclick="selectDiscipleForRecall(${idx})" style="padding:12px;background:rgba(0,0,0,0.3);border-radius:8px;margin-bottom:8px;cursor:pointer;border:1px solid rgba(156,39,176,0.3);transition:all 0.2s;" onmouseover="this.style.borderColor='#9c27b0'" onmouseout="this.style.borderColor='rgba(156,39,176,0.3)'">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <span style="color:#ffd700;font-weight:bold;">${d.name}</span>
                                <span style="color:#aaa;font-size:0.85em;margin-left:10px;">${CONFIG.realms[d.realm]}期</span>
                            </div>
                            <span style="color:#ff69b4;">${d.talent}资质</span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            html += `<button onclick="closeDiscipleSelectionModal()" style="width:100%;padding:10px;margin-top:15px;background:#555;color:white;border:none;border-radius:8px;cursor:pointer;">取消</button>`;
            html += '</div>';
            
            const modal = document.createElement('div');
            modal.id = 'discipleSelectModal';
            modal.className = 'modal active';
            modal.innerHTML = `<div class="modal-content" style="max-width:400px;background:linear-gradient(135deg,#1a0a2e,#2d1b4e);border:2px solid rgba(156,39,176,0.5);">${html}</div>`;
            document.body.appendChild(modal);
        }



        // ===== selectDiscipleForDispatch =====
        function selectDiscipleForDispatch(discipleIdx) {
            const sect = gameState.sect;
            const palace = gameState.palace;
            
            const disciple = sect.disciples[discipleIdx];
            if (!disciple) return;
            
            // 标记为已派遣
            disciple.dispatched = true;
            disciple.dispatchedTo = 'palace';
            
            // 创建仙宫弟子副本
            const palaceDisciple = {
                ...disciple,
                uid: 'p_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                dispatchedFrom: 'sect',
                originalUid: disciple.uid
            };
            
            palace.disciples.push(palaceDisciple);
            sect.dispatchedToPalace = (sect.dispatchedToPalace || 0) + 1;
            
            addLog('good', '弟子派遣', `${disciple.name}已派遣至仙宫支援！`);
            saveGame();
            closeDiscipleSelectionModal();
            renderSectHome();
        }

        // ===== selectDiscipleForRecall =====
        function selectDiscipleForRecall(discipleIdx) {
            const sect = gameState.sect;
            const palace = gameState.palace;
            
            const palaceDisciple = palace.disciples[discipleIdx];
            if (!palaceDisciple) return;
            
            // 找到原来的弟子并更新状态
            const originalDisciple = sect.disciples.find(d => d.uid === palaceDisciple.originalUid);
            if (originalDisciple) {
                originalDisciple.dispatched = false;
                originalDisciple.dispatchedTo = null;
            }
            
            // 从仙宫移除
            palace.disciples.splice(discipleIdx, 1);
            sect.dispatchedToPalace = Math.max(0, (sect.dispatchedToPalace || 0) - 1);
            
            addLog('good', '弟子召回', `${palaceDisciple.name}已从仙宫召回！`);
            saveGame();
            closeDiscipleSelectionModal();
            renderSectHome();
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
                // V39 NPC自主行动系统字段
                npcRole: 'disciple',
                npcDialogueHistory: [],
                npcMood: 'normal',
                npcAffection: 50,
                npcTask: null,
                npcTaskDays: 0,
                // V40 NPC好感度+师徒系统字段
                npcMasterId: null,
                npcApprentices: [],
                npcGiftLiked: null, // V40: 喜欢的礼物类型
                // V41 NPC性格系统字段
                npcPersonality: null, // 'diligent'|'lazy'|'aggressive'|'steady'
                // V49 NPC自进化记忆系统
                npcMemory: initNpcMemory()
            });
            
            // V39: 宗门创建时宗主自动成为掌门
            if (sect.npcLeaderId === null) {
                sect.npcLeaderId = uid;
                const newDisciple = sect.disciples[sect.disciples.length - 1];
                if (newDisciple) newDisciple.npcRole = 'leader';
            }

            // V41: 分配随机性格
            const personalities = ['diligent', 'lazy', 'aggressive', 'steady'];
            const newDiscipleRef = sect.disciples[sect.disciples.length - 1];
            if (newDiscipleRef) {
                newDiscipleRef.npcPersonality = personalities[Math.floor(Math.random() * personalities.length)];
            }
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

        // ===== V39 NPC角色系统 =====

        // NPC角色定义
        const NPC_ROLES = {
            leader: { title: '掌门', icon: '👑', taskType: 'lead', color: '#FFD700', minApprenticeAffection: 60 },
            elder: { title: '长老', icon: '👴', taskType: 'train', color: '#9c27b0', minApprenticeAffection: 50 },
            disciple: { title: '弟子', icon: '🧑‍🎓', taskType: 'collect', color: '#4CAF50', minApprenticeAffection: 40 }
        };

        // V40 NPC礼物配置
        const NPC_GIFTS = {
            low: { name: '灵石袋', cost: 50, affection: 5 },
            mid: { name: '灵草', cost: 200, affection: 15 },
            high: { name: '功法残卷', cost: 500, affection: 30 }
        };

        // V41 NPC性格配置
        const NPC_PERSONALITIES = {
            diligent: { label: '勤奋', emoji: '📖', color: '#4CAF50', taskPref: 'train', efficiency: 1.3 },
            lazy: { label: '懒散', emoji: '😴', color: '#9e9e9e', taskPref: 'collect', efficiency: 0.7 },
            aggressive: { label: '好斗', emoji: '⚔️', color: '#f44336', taskPref: 'combat', efficiency: 1.1 },
            steady: { label: '稳重', emoji: '🧘', color: '#2196F3', taskPref: 'train', efficiency: 1.0 }
        };

        function getPersonalityInfo(p) {
            return NPC_PERSONALITIES[p] || NPC_PERSONALITIES.steady;
        }

        // ===== V49 NPC自进化系统 (参考 generic-agent L0-L4 五层记忆) =====

        // NPC记忆层级 (对应 generic-agent L0-L4)
        const NPC_MEMORY_LAYERS = {
            L0_episodic: { label: '情景记忆', desc: '单次事件记录', decay: 0.95 },
            L1_shortTerm: { label: '短时记忆', desc: '近期经验汇总', decay: 0.9 },
            L2_longTerm: { label: '长时记忆', desc: '重要经历固化', decay: 0.7 },
            L3_semantic: { label: '语义记忆', desc: '知识与技能', decay: 0.0 },
            L4_epic: { label: '史诗记忆', desc: '里程碑事件', decay: 0.0 }
        };

        // NPC技能结晶配置 (技能从经验中"结晶"形成)
        const NPC_SKILL_CRYSTALS = {
            combat_master: { name: '战斗精通', desc: '战斗中磨砺出的本能反应', icon: '⚔️', threshold: 10 },
            resource_sense: { name: '资源敏锐', desc: '对灵石和资源的高度敏感', icon: '💎', threshold: 8 },
            social_network: { name: '社交高手', desc: '与同门建立深厚关系网', icon: '🤝', threshold: 12 },
            wisdom_eye: { name: '慧眼', desc: '能洞察事物本质', icon: '👁️', threshold: 15 },
            cultivation_talent: { name: '修炼天赋', desc: '对灵气运行的天赋', icon: '🧘', threshold: 10 },
            leadership_aura: { name: '领袖气质', desc: '引领他人的感召力', icon: '👑', threshold: 20 }
        };

        // 初始化NPC记忆
        function initNpcMemory() {
            return {
                // L0: 情景记忆 - 最近发生的事件
                L0_episodic: [],
                // L1: 短时记忆 - 近期经验汇总
                L1_shortTerm: { totalTasks: 0, completedTasks: 0, totalBattles: 0, wins: 0, giftsGiven: 0, interactions: 0 },
                // L2: 长时记忆 - 重要经历
                L2_longTerm: [],
                // L3: 语义记忆 - 掌握的技能/知识
                L3_semantic: { skills: [], insights: [] },
                // L4: 史诗记忆 - 里程碑事件
                L4_epic: [],
                // 进化相关
                evolutionPoints: 0,
                evolutionLevel: 1,  // 1-5级，对应generic-agent的成长阶段
                lastEvolved: 0
            };
        }

        // NPC记忆系统 - 记录一次交互
        function recordNpcMemory(npcUid, eventType, eventData) {
            const sect = gameState.sect;
            const npc = sect.disciples.find(d => d.uid === npcUid);
            if (!npc || !npc.npcMemory) return;

            const mem = npc.npcMemory;
            const timestamp = gameState.days;

            // L0: 记录情景事件
            mem.L0_episodic.push({
                type: eventType,
                data: eventData,
                day: timestamp,
                mood: npc.npcMood
            });
            // L0 最多保留20条
            if (mem.L0_episodic.length > 20) mem.L0_episodic.shift();

            // L1: 更新短时统计
            if (eventType === 'task_complete') {
                mem.L1_shortTerm.totalTasks++;
                mem.L1_shortTerm.completedTasks++;
            } else if (eventType === 'battle') {
                mem.L1_shortTerm.totalBattles++;
                if (eventData.won) mem.L1_shortTerm.wins++;
            } else if (eventType === 'gift') {
                mem.L1_shortTerm.giftsGiven++;
            } else if (eventType === 'interaction') {
                mem.L1_shortTerm.interactions++;
            }

            // L2: 重要经历超过阈值时固化
            if (mem.L1_shortTerm.completedTasks >= 5 && mem.L2_longTerm.filter(e => e.type === 'task_master').length === 0) {
                mem.L2_longTerm.push({ type: 'task_master', day: timestamp, desc: '完成任务5次以上' });
            }
            if (mem.L1_shortTerm.wins >= 3 && mem.L2_longTerm.filter(e => e.type === 'combat_hero').length === 0) {
                mem.L2_longTerm.push({ type: 'combat_hero', day: timestamp, desc: '战斗胜利3次以上' });
            }
            // L2 最多保留10条
            if (mem.L2_longTerm.length > 10) mem.L2_longTerm.shift();

            // 检查技能结晶
            checkNpcSkillCrystallization(npc);

            // L4: 里程碑事件
            if (eventType === 'task_complete' && mem.L1_shortTerm.completedTasks === 10 && !mem.L4_epic.find(e => e.type === 'task_master_10')) {
                mem.L4_epic.push({ type: 'task_master_10', day: timestamp, desc: '完成10项任务' });
            }
            if (eventType === 'battle' && mem.L1_shortTerm.wins === 5 && !mem.L4_epic.find(e => e.type === 'combat_hero_5')) {
                mem.L4_epic.push({ type: 'combat_hero_5', day: timestamp, desc: '战斗5连胜' });
            }
            // L4 最多保留5条
            if (mem.L4_epic.length > 5) mem.L4_epic.shift();

            // 更新进化点数
            const pointsMap = { task_complete: 2, battle: 3, gift: 1, interaction: 1, evolution: 10 };
            mem.evolutionPoints += pointsMap[eventType] || 1;

            // 检查是否可升级
            checkNpcEvolution(npc);
        }

        // 检查NPC技能结晶
        function checkNpcSkillCrystallization(npc) {
            if (!npc || !npc.npcMemory) return;
            const mem = npc.npcMemory;
            const skills = mem.L3_semantic.skills;

            // 战斗精通
            if (mem.L1_shortTerm.totalBattles >= NPC_SKILL_CRYSTALS.combat_master.threshold && !skills.find(s => s.id === 'combat_master')) {
                skills.push({ id: 'combat_master', ...NPC_SKILL_CRYSTALS.combat_master, crystallizedDay: gameState.days });
                npc.attack = Math.floor((npc.attack || 5) * 1.2);
                addLog('good', '技能结晶', `${npc.name}领悟了【${NPC_SKILL_CRYSTALS.combat_master.name}】！攻击力+20%`);
            }
            // 资源敏锐
            if (mem.L1_shortTerm.totalTasks >= NPC_SKILL_CRYSTALS.resource_sense.threshold && !skills.find(s => s.id === 'resource_sense')) {
                skills.push({ id: 'resource_sense', ...NPC_SKILL_CRYSTALS.resource_sense, crystallizedDay: gameState.days });
                // 提供资源时奖励更多
            }
            // 社交高手
            if (mem.L1_shortTerm.giftsGiven >= NPC_SKILL_CRYSTALS.social_network.threshold && !skills.find(s => s.id === 'social_network')) {
                skills.push({ id: 'social_network', ...NPC_SKILL_CRYSTALS.social_network, crystallizedDay: gameState.days });
                npc.npcAffection = Math.min(100, npc.npcAffection + 20);
                addLog('good', '技能结晶', `${npc.name}领悟了【${NPC_SKILL_CRYSTALS.social_network.name}】！好感度+20`);
            }
            // 慧眼
            if (mem.L1_shortTerm.interactions >= NPC_SKILL_CRYSTALS.wisdom_eye.threshold && !skills.find(s => s.id === 'wisdom_eye')) {
                skills.push({ id: 'wisdom_eye', ...NPC_SKILL_CRYSTALS.wisdom_eye, crystallizedDay: gameState.days });
                skills.push({ id: 'insight', name: '洞察', desc: '能感知隐藏机会', icon: '🔮', crystallizedDay: gameState.days });
            }
        }

        // 检查NPC是否可进化
        function checkNpcEvolution(npc) {
            if (!npc || !npc.npcMemory) return;
            const mem = npc.npcMemory;
            const levelThresholds = [0, 20, 50, 100, 200]; // 每级所需点数

            if (mem.evolutionLevel < 5) {
                const nextLevel = mem.evolutionLevel + 1;
                if (mem.evolutionPoints >= levelThresholds[nextLevel]) {
                    mem.evolutionLevel = nextLevel;
                    mem.lastEvolved = gameState.days;
                    // 进化时提升基础属性
                    npc.attack = Math.floor((npc.attack || 5) * 1.15);
                    npc.defense = Math.floor((npc.defense || 3) * 1.15);
                    npc.maxHp = Math.floor((npc.maxHp || 30) * 1.15);
                    addLog('good', 'NPC进化', `${npc.name}突破至Lv.${nextLevel}！基础属性+15%`);
                }
            }
        }

        // NPC自主决策 - 基于记忆选择行动
        function npcAutonomousDecision(npc) {
            if (!npc || !npc.npcMemory) return null;
            const mem = npc.npcMemory;
            const personality = NPC_PERSONALITIES[npc.personality] || NPC_PERSONALITIES.steady;
            const rand = Math.random();

            // L3技能影响决策
            const hasCombatSkill = mem.L3_semantic.skills.find(s => s.id === 'combat_master');
            const hasSocialSkill = mem.L3_semantic.skills.find(s => s.id === 'social_network');

            // 高效弟子倾向于训练，懒惰弟子倾向于采集
            if (rand < personality.efficiency) {
                // 性格倾向任务
                if (personality.taskPref === 'train') {
                    return { action: 'cultivate', reason: '性格勤奋，选择修炼' };
                } else if (personality.taskPref === 'combat') {
                    if (hasCombatSkill && rand < 0.5) {
                        return { action: 'challenge', reason: '战斗精通，挑战强敌' };
                    }
                    return { action: 'combat', reason: '好斗性格，选择战斗' };
                } else {
                    return { action: 'collect', reason: '性格务实，选择采集' };
                }
            } else if (rand < 0.7) {
                // 30%概率社交
                if (hasSocialSkill && rand < 0.4) {
                    return { action: 'socialize', reason: '社交高手，与人交流' };
                }
                return { action: 'rest', reason: '稍作休息' };
            } else {
                // 探索/随机
                const actions = ['explore', 'meditate', 'help'];
                return { action: actions[Math.floor(Math.random() * actions.length)], reason: '自主探索' };
            }
        }

        // 获取NPC记忆显示
        function getNpcMemoryDisplay(npc) {
            if (!npc || !npc.npcMemory) return '';
            const mem = npc.npcMemory;
            let html = '<div class="npc-memory-panel">';
            html += `<div class="npc-memory-title">🧠 ${npc.name}的记忆 (Lv.${mem.evolutionLevel})</div>`;

            // L4 史诗
            if (mem.L4_epic.length > 0) {
                html += '<div class="npc-mem-layer">';
                html += `<span class="mem-label">📜 史诗记忆</span>`;
                mem.L4_epic.forEach(e => {
                    html += `<div class="mem-item epic">第${e.day}天：${e.desc}</div>`;
                });
                html += '</div>';
            }

            // L3 技能
            if (mem.L3_semantic.skills.length > 0) {
                html += '<div class="npc-mem-layer">';
                html += `<span class="mem-label">⚡ 技能结晶</span>`;
                mem.L3_semantic.skills.forEach(s => {
                    html += `<span class="skill-tag" title="${s.desc}">${s.icon||'✨'} ${s.name}</span>`;
                });
                html += '</div>';
            }

            // L2 长时
            if (mem.L2_longTerm.length > 0) {
                html += '<div class="npc-mem-layer">';
                html += `<span class="mem-label">💎 重要经历</span>`;
                mem.L2_longTerm.slice(-3).forEach(e => {
                    html += `<div class="mem-item">${e.desc}</div>`;
                });
                html += '</div>';
            }

            // L1 统计
            html += '<div class="npc-mem-layer">';
            html += `<span class="mem-label">📊 近况</span>`;
            html += `<span>任务${mem.L1_shortTerm.completedTasks}/${mem.L1_shortTerm.totalTasks}</span> `;
            html += `<span>战斗${mem.L1_shortTerm.wins}/${mem.L1_shortTerm.totalBattles}</span> `;
            html += `<span>互动${mem.L1_shortTerm.interactions}</span>`;
            html += ` <span class="evo-points">进化点:${mem.evolutionPoints}</span>`;
            html += '</div>';

            html += '</div>';
            return html;
        }

        // 获取弟子NPC图标
        function getNpcRoleIcon(d) {
            const role = d.npcRole || 'disciple';
            return NPC_ROLES[role] ? NPC_ROLES[role].icon : NPC_ROLES.disciple.icon;
        }

        // 获取弟子NPC身份文字
        function getNpcRoleTitle(d) {
            const role = d.npcRole || 'disciple';
            return NPC_ROLES[role] ? NPC_ROLES[role].title : '弟子';
        }

        // ===== processNpcAutonomousLoop =====
        // V39: NPC自主行动每日结算
        function processNpcAutonomousLoop() {
            const sect = gameState.sect;
            if (!sect.name || sect.disciples.length === 0) return;

            // 检查是否已执行
            if (sect.npcLastActionDay >= gameState.days) return;
            sect.npcLastActionDay = gameState.days;

            const logMessages = [];

            sect.disciples.forEach(d => {
                // 掌门：自动发布任务
                if (d.npcRole === 'leader') {
                    // 掌门有30%概率发布新任务
                    if (Math.random() < 0.3 && sect.npcTasks.length < 3) {
                        const taskTypes = ['collect', 'train', 'combat'];
                        const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
                        const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
                        const rewards = { spiritStones: Math.floor(20 + Math.random() * 30), contribution: Math.floor(5 + Math.random() * 10) };
                        sect.npcTasks.push({
                            id: taskId,
                            type: taskType,
                            target: Math.floor(3 + Math.random() * 5),
                            progress: 0,
                            status: 'active',
                            reward: rewards,
                            assignedUid: null,
                            createdDay: gameState.days
                        });
                        logMessages.push(`【${d.name}】发布了新的宗门任务`);
                    }
                }

                // 有任务的弟子执行任务
                if (d.npcTask) {
                    d.npcTaskDays++;
                    d.npcTask.progress++;

                    // 根据任务类型给予奖励
                    if (d.npcTask.type === 'collect') {
                        d.contribution += 2;
                    } else if (d.npcTask.type === 'train') {
                        // V40: 师徒加成
                        const bonus = getMasterBonus(d);
                        const trainChance = 0.3 + bonus * 0.05;
                        if (Math.random() < trainChance) {
                            d.realm = Math.min(d.realm + 1, gameState.realm + 2);
                            logMessages.push(`【${d.name}】在师傅指导下修炼精进，境界提升！`);
                        }
                    } else if (d.npcTask.type === 'combat') {
                        d.contribution += 3;
                    }

                    // 任务完成
                    if (d.npcTask.progress >= d.npcTask.target) {
                        const task = sect.npcTasks.find(t => t.id === d.npcTask.id);
                        if (task) {
                            task.status = 'completed';
                            sect.spiritStones += task.reward.spiritStones;
                            d.contribution += task.reward.contribution;
                            logMessages.push(`【${d.name}】完成任务：${task.reward.spiritStones}灵石！`);
                        }
                        d.npcTask = null;
                        d.npcTaskDays = 0;
                    }
                } else {
                    // 无任务弟子自动选择行为（V41：性格影响偏好）
                    const personality = d.npcPersonality || 'steady';
                    const pinfo = getPersonalityInfo(personality);
                    const rand = Math.random();
                    if (personality === 'diligent') {
                        // 勤奋型：70%修炼，20%采集，10%闭关
                        if (rand < 0.7) { d.status = 'training'; d.npcMood = 'happy'; }
                        else if (rand < 0.9) { d.status = 'collecting'; sect.spiritStones += Math.floor(5 * pinfo.efficiency + d.talentIndex * 2); }
                        else { d.status = 'meditating'; d.npcMood = 'happy'; }
                    } else if (personality === 'lazy') {
                        // 懒散型：20%修炼，60%采集，20%休息
                        if (rand < 0.2) { d.status = 'training'; d.npcMood = 'normal'; }
                        else if (rand < 0.8) { d.status = 'collecting'; sect.spiritStones += Math.floor(5 * pinfo.efficiency + d.talentIndex * 2); }
                        else { d.status = 'idle'; d.npcMood = 'normal'; }
                    } else if (personality === 'aggressive') {
                        // 好斗型：30%修炼，30%采集，40%闭关
                        if (rand < 0.3) { d.status = 'training'; d.npcMood = 'normal'; }
                        else if (rand < 0.6) { d.status = 'collecting'; sect.spiritStones += Math.floor(5 * pinfo.efficiency + d.talentIndex * 2); }
                        else { d.status = 'meditating'; d.npcMood = Math.random() < 0.5 ? 'upset' : 'normal'; }
                    } else {
                        // 稳重型：50%修炼，30%采集，20%闭关
                        if (rand < 0.5) { d.status = 'training'; d.npcMood = 'normal'; }
                        else if (rand < 0.8) { d.status = 'collecting'; sect.spiritStones += Math.floor(5 * pinfo.efficiency + d.talentIndex * 2); }
                        else { d.status = 'meditating'; d.npcMood = 'normal'; }
                    }
                }
            });

            // V41: 更新宗门气氛
            const avgMood = sect.disciples.reduce((sum, d) => {
                const mood = d.npcMood === 'happy' ? 100 : d.npcMood === 'upset' ? 0 : 50;
                return sum + mood;
            }, 0) / sect.disciples.length;
            sect.sectMood = Math.max(0, Math.min(100, Math.round(sect.sectMood * 0.7 + avgMood * 0.3)));

            // V41: 触发宗门随机事件
            processSectRandomEvent();

            // 记录日志
            if (logMessages.length > 0) {
                logMessages.forEach(msg => addLog('good', '宗门动态', msg));
            }
        }





        // ===== sendNpcMessage =====
        function sendNpcMessage(discipleUid) {
            const input = document.getElementById('npcDialogueInput');
            if (!input) return;
            const text = input.value.trim();
            if (!text) return;
            input.value = '';

            const sect = gameState.sect;
            const disciple = sect.disciples.find(d => d.uid === discipleUid);
            if (!disciple) return;

            // 记录玩家消息
            if (!disciple.npcDialogueHistory) disciple.npcDialogueHistory = [];
            disciple.npcDialogueHistory.push({ text, isPlayer: true, day: gameState.days });
            if (disciple.npcDialogueHistory.length > 50) disciple.npcDialogueHistory.shift();

            // 生成NPC回复
            const response = generateNpcResponse(disciple, text);
            disciple.npcDialogueHistory.push({ text: response, isPlayer: false, day: gameState.days });
            if (disciple.npcDialogueHistory.length > 50) disciple.npcDialogueHistory.shift();

            // 更新显示
            const historyDiv = document.getElementById('npcDialogueHistory');
            if (historyDiv) {
                const history = disciple.npcDialogueHistory || [];
                historyDiv.innerHTML = history.slice(-5).map(entry =>
                    `<div class="npc-msg ${entry.isPlayer ? 'player-msg' : 'npc-msg-other'}">${entry.text}</div>`
                ).join('');
                historyDiv.scrollTop = historyDiv.scrollHeight;
            }
        }

        // ===== sendNpcQuickMessage =====
        function sendNpcQuickMessage(discipleUid, type) {
            const sect = gameState.sect;
            const disciple = sect.disciples.find(d => d.uid === discipleUid);
            if (!disciple) return;

            const texts = {
                '请教': ['修炼之道贵在坚持，切不可急功近利。', '你的疑惑，老夫略知一二。', '此事需从基础做起，不可好高骛远。'],
                '任务': ['近日宗门事务繁忙，你可愿代为分忧？', '有一事需你相助。', '我正有一项任务要交付。'],
                '闲聊': ['今日天气甚好，适合闭关修炼。', '宗门事务繁忙，无暇闲聊。', '你且说来听听。']
            };
            const options = texts[type] || texts['闲聊'];
            const randomText = options[Math.floor(Math.random() * options.length)];
            const input = document.getElementById('npcDialogueInput');
            if (input) input.value = randomText;

            // V40: 好感度影响
            if (disciple) {
                if (type === '请教') {
                    modifyAffection(disciple, Math.random() < 0.6 ? 1 : -1);
                } else if (type === '闲聊') {
                    modifyAffection(disciple, Math.random() < 0.7 ? 1 : 0);
                }
            }

            sendNpcMessage(discipleUid);
        }

        // ===== generateNpcResponse =====
        function generateNpcResponse(disciple, playerMessage) {
            const role = disciple.npcRole || 'disciple';
            const lowerMsg = playerMessage.toLowerCase();

            // 掌门回复
            if (role === 'leader') {
                if (lowerMsg.includes('请教') || lowerMsg.includes('修炼')) {
                    return '修炼之道，在于心境平和。你若能保持心境，突破境界指日可待。';
                }
                if (lowerMsg.includes('任务')) {
                    if (disciple.npcTask) {
                        return `当前任务：${disciple.npcTask.progress}/${disciple.npcTask.target}，继续努力。`;
                    }
                    return '宗门暂无紧急任务，你且安心修炼。';
                }
                return '宗门之事，老夫自有安排。你只需专注修行。';
            }

            // 长老回复
            if (role === 'elder') {
                if (lowerMsg.includes('请教') || lowerMsg.includes('功法')) {
                    return '老夫修行多年，有些心得可与你分享。勤加练习，必有所成。';
                }
                if (lowerMsg.includes('任务')) {
                    return '我正在指导弟子修炼，若有任务自会告知。';
                }
                return '师叔祖有何吩咐？';
            }

            // 弟子回复
            if (lowerMsg.includes('请教')) {
                return '师兄/师姐，我也还在学习中，我们可以一起探讨。';
            }
            if (lowerMsg.includes('任务')) {
                return disciple.npcTask
                    ? `我正在执行任务，已完成${disciple.npcTask.progress}/${disciple.npcTask.target}。`
                    : '我暂时没有任务，可以去做些什么呢？';
            }
            return '今天修炼感觉不错，谢谢关心！';
        }

        // ===== assignNpcTask =====
        function assignNpcTask(discipleUid, taskType) {
            const sect = gameState.sect;
            const disciple = sect.disciples.find(d => d.uid === discipleUid);
            if (!disciple || disciple.npcRole === 'leader') return;

            disciple.npcTask = {
                id: 'task_' + Date.now(),
                type: taskType,
                target: Math.floor(3 + Math.random() * 5),
                progress: 0
            };
            disciple.npcTaskDays = 0;
            addLog('good', '任务分配', `为【${disciple.name}】分配了${taskType === 'collect' ? '采集' : taskType === 'train' ? '修炼' : '战斗'}任务`);
            renderSectHome();
        }

        // ===== V40 NPC好感度+师徒系统 =====

        // ===== showGiftMenu =====
        function showGiftMenu(discipleUid) {
            const modal = document.getElementById('giftMenuModal');
            if (modal) modal.remove();

            const html = `
                <div id="giftMenuModal" style="position:fixed;z-index:2100;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;">
                    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #9c27b0;border-radius:15px;padding:20px;max-width:350px;width:90%;box-shadow:0 0 30px rgba(156,39,176,0.3);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <div style="color:#9c27b0;font-weight:bold;font-size:1.1em;">🎁 选择礼物</div>
                            <button onclick="closeGiftMenu()" style="background:#333;color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;">×</button>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:10px;">
                            ${Object.entries(NPC_GIFTS).map(([key, gift]) => `
                                <button onclick="sendGift('${discipleUid}','${key}')" class="btn" style="background:#1a1a2e;color:#fff;padding:10px 15px;border:1px solid #333;border-radius:8px;cursor:pointer;text-align:left;">
                                    <div style="display:flex;justify-content:space-between;">
                                        <span>${gift.name}</span>
                                        <span style="color:#f44336;">${gift.cost}灵石</span>
                                    </div>
                                    <div style="color:#888;font-size:0.8em;">好感+${gift.affection}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
        }



        // ===== sendGift =====
        function sendGift(discipleUid, giftKey) {
            const sect = gameState.sect;
            const disciple = sect.disciples.find(d => d.uid === discipleUid);
            if (!disciple) return;

            const gift = NPC_GIFTS[giftKey];
            if (!gift) return;
            if (gameState.spiritStones < gift.cost) {
                alert('灵石不足！');
                return;
            }

            gameState.spiritStones -= gift.cost;
            disciple.npcAffection = Math.min(100, (disciple.npcAffection || 50) + gift.affection);

            // 添加回复
            if (!disciple.npcDialogueHistory) disciple.npcDialogueHistory = [];
            disciple.npcDialogueHistory.push({ text: `🎁 收到${gift.name}，甚是欢喜！`, isPlayer: false, day: gameState.days });
            if (disciple.npcDialogueHistory.length > 50) disciple.npcDialogueHistory.shift();

            addLog('good', '送礼', `向【${disciple.name}】赠送了${gift.name}，好感+${gift.affection}`);
            closeGiftMenu();

            // 刷新对话框
            openNpcDialogue(discipleUid);
            updateDisplay();
        }

        // ===== tryApprentice =====
        function tryApprentice(discipleUid) {
            const sect = gameState.sect;
            const disciple = sect.disciples.find(d => d.uid === discipleUid);
            if (!disciple || disciple.npcRole === 'leader') return;

            // 查找可拜的师傅（境界高于自己且未满徒弟数）
            const potentialMasters = sect.disciples.filter(d => {
                if (d.uid === discipleUid) return false;
                if (d.npcRole === 'leader' || d.npcRole === 'elder') {
                    const hasRoom = (d.npcApprentices || []).length < 3;
                    const higherRealm = d.realm >= disciple.realm;
                    return hasRoom && higherRealm;
                }
                return false;
            });

            if (potentialMasters.length === 0) {
                alert('当前没有可拜的师傅（需要境界不低于你且徒弟未满）');
                return;
            }

            // 选择境界最高的
            const master = potentialMasters.sort((a, b) => b.realm - a.realm)[0];
            const minAffection = NPC_ROLES[master.npcRole]?.minApprenticeAffection || 50;

            if ((disciple.npcAffection || 50) < minAffection) {
                alert(`好感度不足${minAffection}，无法拜师！当前好感：${disciple.npcAffection}`);
                return;
            }

            // 建立师徒关系
            disciple.npcMasterId = master.uid;
            if (!master.npcApprentices) master.npcApprentices = [];
            master.npcApprentices.push(disciple.uid);

            addLog('good', '拜师', `【${disciple.name}】拜【${master.name}】为师！`);
            closeNpcDialogue();

            // 刷新显示
            renderSectHome();
            updateDisplay();
        }

        // ===== modifyAffection =====
        // V40: 修改好感度并记录心情变化
        function modifyAffection(disciple, delta) {
            const oldAff = disciple.npcAffection || 50;
            disciple.npcAffection = Math.max(0, Math.min(100, oldAff + delta));

            // 心情跟随好感变化
            if (disciple.npcAffection >= 70) disciple.npcMood = 'happy';
            else if (disciple.npcAffection <= 25) disciple.npcMood = 'upset';
            else disciple.npcMood = 'normal';

            return disciple.npcAffection - oldAff;
        }

        // ===== getMasterBonus =====
        // V40: 获取师徒修炼加成
        function getMasterBonus(disciple) {
            if (!disciple.npcMasterId) return 0;
            const sect = gameState.sect;
            const master = sect.disciples.find(d => d.uid === disciple.npcMasterId);
            if (!master) return 0;

            // 师傅境界越高，加成越高
            const realmDiff = master.realm - disciple.realm;
            if (realmDiff <= 0) return 0;
            return Math.floor(2 + realmDiff * 1.5);
        }

        // ===== processSectRandomEvent =====
        // V41: 宗门随机事件系统
        function processSectRandomEvent() {
            const sect = gameState.sect;
            if (!sect.name) return;

            // 气氛影响事件触发概率
            const baseChance = 0.15;
            const moodModifier = (sect.sectMood - 50) / 500; // ±10%
            const triggerChance = baseChance + moodModifier;
            if (Math.random() > triggerChance) return;

            const events = [
                // 奇遇类
                { type: 'serendipity', weight: 1, title: '🌟 弟子顿悟', desc: '某位弟子在修炼中突然顿悟，境界有所提升', effect: (sect) => {
                    const d = sect.disciples[Math.floor(Math.random() * sect.disciples.length)];
                    if (d) {
                        d.realm = Math.min(d.realm + 1, gameState.realm + 2);
                        addLog('good', '宗门事件', `【${d.name}】修炼中顿悟，境界提升！`);
                    }
                }},
                { type: 'serendipity', weight: 1, title: '💎 矿区发现', desc: '弟子在附近发现了一处灵石矿区', effect: (sect) => {
                    const gain = Math.floor(200 + Math.random() * 300);
                    sect.spiritStones += gain;
                    addLog('good', '宗门事件', `发现灵石矿区，获得${gain}灵石！`);
                }},
                // 危机类
                { type: 'crisis', weight: 1, title: '🔥 宗门冲突', desc: '弟子之间发生冲突，宗门气氛下降', effect: (sect) => {
                    sect.sectMood = Math.max(0, sect.sectMood - 15);
                    const d = sect.disciples[Math.floor(Math.random() * sect.disciples.length)];
                    if (d) modifyAffection(d, -10);
                    addLog('bad', '宗门事件', '弟子冲突，宗门气氛下降！');
                }},
                { type: 'crisis', weight: 1, title: '⚠️ 外部挑衅', desc: '其他势力对宗门产生敌意', effect: (sect) => {
                    sect.sectMood = Math.max(0, sect.sectMood - 10);
                    addLog('bad', '宗门事件', '外部势力挑衅，宗门气氛受损！');
                }},
                // 日常类
                { type: 'daily', weight: 2, title: '🎉 宗门团建', desc: '弟子们举办了一次联谊活动', effect: (sect) => {
                    sect.sectMood = Math.min(100, sect.sectMood + 10);
                    sect.disciples.forEach(d => modifyAffection(d, 3));
                    addLog('good', '宗门事件', '宗门联谊，气氛提升！');
                }},
                { type: 'daily', weight: 2, title: '📚 功法交流会', desc: '长老主持功法交流，弟子们受益匪浅', effect: (sect) => {
                    sect.disciples.forEach(d => modifyAffection(d, 2));
                    addLog('good', '宗门事件', '功法交流会，弟子好感提升！');
                }},
                { type: 'daily', weight: 1, title: '🌿 灵草丰收', desc: '宗门灵草园喜获丰收', effect: (sect) => {
                    const gain = Math.floor(50 + Math.random() * 100);
                    sect.spiritStones += gain;
                    addLog('good', '宗门事件', `灵草丰收，获得${gain}灵石！`);
                }}
            ];

            // 按权重随机选择
            const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
            let rand = Math.random() * totalWeight;
            let selectedEvent = events[events.length - 1];
            for (const e of events) {
                rand -= e.weight;
                if (rand <= 0) { selectedEvent = e; break; }
            }

            selectedEvent.effect(sect);
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
            gameState.techniques.push({
                ...tech,
                level: tech.level || 1,
                maxLevel: tech.maxLevel || 5
            });
            
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
                        level: 1,
                        maxLevel: 5,
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

// ===== palace.js (仙宫经营系统) =====







        // ===== switchPalaceTab =====
        function switchPalaceTab(tab) {
            document.querySelectorAll('.palace-tab').forEach(t => {
                t.classList.remove('active');
                t.style.background = 'rgba(0,0,0,0.3)';
                t.style.color = '#aaa';
            });
            event.target.classList.add('active');
            event.target.style.background = 'rgba(255,111,0,0.3)';
            event.target.style.color = '#ffb300';
            
            const tabContent = document.getElementById('palaceTabContent');
            switch(tab) {
                case 'rooms':
                    tabContent.innerHTML = renderRoomsTab();
                    break;
                case 'disciples':
                    tabContent.innerHTML = renderPalaceDisciplesTab();
                    break;
                case 'tasks':
                    tabContent.innerHTML = renderPalaceTasksTab();
                    break;
                case 'manage':
                    tabContent.innerHTML = renderPalaceManageTab();
                    break;
            }
        }



        // ===== generatePalaceTask =====
        function generatePalaceTask() {
            const palace = gameState.palace;
            const tasks = palace.tasks || [];
            
            if (tasks.filter(t => t.status === 'active').length >= 3) {
                showToast('最多同时进行3个任务！');
                return;
            }
            
            // 获取可用弟子
            const activeTaskDisciples = tasks.filter(t => t.status === 'active').flatMap(t => t.assignedDisciples || []);
            const availableDisciples = palace.disciples.filter(d => !activeTaskDisciples.includes(d.uid));
            
            if (availableDisciples.length === 0) {
                showToast('没有空闲弟子！');
                return;
            }
            
            // 随机选择一个任务类型
            const taskTypeKeys = Object.keys(PALACE_CONFIG.taskTypes);
            const randomTaskType = taskTypeKeys[Math.floor(Math.random() * taskTypeKeys.length)];
            const taskConfig = PALACE_CONFIG.taskTypes[randomTaskType];
            
            // 随机分配1-3个弟子
            const numDisciples = Math.min(availableDisciples.length, Math.floor(Math.random() * 3) + 1);
            const assignedDisciples = availableDisciples.slice(0, numDisciples);
            
            // 随机难度
            const difficulties = ['easy', 'normal', 'hard'];
            const difficultyWeights = [0.4, 0.4, 0.2];
            let rand = Math.random();
            let difficulty = 'easy';
            for (let i = 0; i < difficulties.length; i++) {
                if (rand < difficultyWeights[i]) {
                    difficulty = difficulties[i];
                    break;
                }
                rand -= difficultyWeights[i];
            }
            
            const task = {
                id: Date.now(),
                type: randomTaskType,
                difficulty: difficulty,
                duration: taskConfig.duration,
                startDay: gameState.days,
                endDay: gameState.days + taskConfig.duration,
                assignedDisciples: assignedDisciples.map(d => d.uid),
                status: 'active',
                success: null,
                claimedAt: null
            };
            
            palace.tasks.push(task);
            
            const discipleNames = assignedDisciples.map(d => d.name).join(', ');
            addLog('neutral', '任务分配', `弟子 ${discipleNames} 开始执行「${taskConfig.name}」任务`);
            
            saveGame();
            updateDisplay();
            renderPalaceHome();
        }

        // ===== claimPalaceTask =====
        function claimPalaceTask(taskIndex) {
            const palace = gameState.palace;
            const tasks = palace.tasks.filter(t => t.status === 'active');
            
            if (taskIndex < 0 || taskIndex >= tasks.length) return;
            
            const task = tasks[taskIndex];
            const taskConfig = PALACE_CONFIG.taskTypes[task.type];
            const difficultyMult = PALACE_CONFIG.taskDifficultyMultiplier[task.difficulty] || 1;
            
            // 计算成功率（基于难度和弟子数量）
            let baseSuccessRate = 0.8;
            if (task.difficulty === 'easy') baseSuccessRate = 0.95;
            else if (task.difficulty === 'normal') baseSuccessRate = 0.75;
            else if (task.difficulty === 'hard') baseSuccessRate = 0.5;
            
            // 弟子数量加成
            const discipleCount = task.assignedDisciples?.length || 1;
            baseSuccessRate += (discipleCount - 1) * 0.05;
            baseSuccessRate = Math.min(0.98, baseSuccessRate);
            
            // 判定成功
            const success = Math.random() < baseSuccessRate;
            
            task.status = 'completed';
            task.success = success;
            task.claimedAt = Date.now();
            
            if (success) {
                // 发放奖励
                const spiritReward = Math.floor((taskConfig.reward.spiritStones || 0) * difficultyMult * (0.8 + Math.random() * 0.4));
                const repReward = Math.floor((taskConfig.reward.reputation || 0) * difficultyMult * (0.8 + Math.random() * 0.4));
                
                palace.spiritStones += spiritReward;
                palace.reputation += repReward;
                palace.taskRecord.completed++;
                palace.taskRecord.totalReward += spiritReward;
                
                let rewardText = `💎 ${spiritReward}灵石，⭐ ${repReward}声望`;
                
                // 额外物品奖励
                if (taskConfig.reward.items && Math.random() < 0.3 * difficultyMult) {
                    const itemType = taskConfig.reward.items[Math.floor(Math.random() * taskConfig.reward.items.length)];
                    // 简单添加物品到背包
                    if (!gameState.inventory) gameState.inventory = [];
                    gameState.inventory.push({ name: itemType, type: 'material', quality: 'normal' });
                    rewardText += `，🎁 ${itemType}`;
                }
                
                addLog('good', '任务完成', `「${taskConfig.name}」任务成功！获得：${rewardText}`);
            } else {
                palace.taskRecord.failed++;
                addLog('bad', '任务失败', `「${taskConfig.name}」任务失败，弟子安全返回`);
            }
            
            // 清理旧记录（保留最近20条）
            const completedTasks = palace.tasks.filter(t => t.status === 'completed');
            if (completedTasks.length > 20) {
                palace.tasks = [...palace.tasks.filter(t => t.status === 'active'), ...completedTasks.slice(-20)];
            }
            
            saveGame();
            updateDisplay();
            renderPalaceHome();
        }

        // ===== checkTaskProgress =====
        function checkTaskProgress() {
            const palace = gameState.palace;
            if (!palace.name || !palace.tasks) return;
            
            const activeTasks = palace.tasks.filter(t => t.status === 'active');
            for (const task of activeTasks) {
                if (gameState.days >= task.endDay && task.endDay > 0) {
                    // 任务到期但未领取，在领取时判定
                }
            }
        }



        // ===== createPalace =====
        function createPalace() {
            const nameInput = document.getElementById('palaceNameInput');
            const name = nameInput.value.trim();
            
            if (!name) {
                alert('请输入仙宫名称！');
                return;
            }
            
            if (gameState.spiritStones < 30000) {
                alert('灵石不足！');
                return;
            }
            
            if (gameState.realm < 3) {
                alert('需要金丹期才能创建仙宫！');
                return;
            }
            
            gameState.spiritStones -= 30000;
            gameState.palace = {
                name: name,
                level: 1,
                spiritStones: 0,
                reputation: 0,
                rooms: [],
                disciples: [],
                lastProductionDay: gameState.days,
                decorationBonus: 0,
                tasks: [],
                taskRecord: { completed: 0, failed: 0, totalReward: 0 }
            };
            
            // 初始赠送一个修炼殿
            gameState.palace.rooms.push({ type: '修炼殿', level: 1 });
            
            addLog('good', '仙宫创建', `恭喜！${name}正式成立，你成为仙宫之主！`);
            
            checkPalaceCreation();
            saveGame();
            updateDisplay();
            renderPalaceHome();
        }



        // ===== showBuildRoomModal =====
        function showBuildRoomModal() {
            const palace = gameState.palace;
            const levelConfig = PALACE_CONFIG.levelConfig[palace.level];
            
            if (palace.rooms.length >= levelConfig.maxRooms) {
                showToast('已达到当前仙宫等级最大房间数！');
                return;
            }
            
            let html = '<div style="padding:15px;"><h3 style="color:#ffb300;margin-bottom:15px;text-align:center;">选择建造房间</h3>';
            html += '<div style="display:grid;gap:10px;">';
            
            for (const [roomName, roomConfig] of Object.entries(PALACE_CONFIG.roomTypes)) {
                const canBuild = gameState.spiritStones >= roomConfig.cost;
                html += `
                    <div style="padding:15px;background:rgba(0,0,0,0.4);border-radius:10px;${canBuild ? 'border:1px solid rgba(255,111,0,0.3);cursor:pointer;' : 'opacity:0.5;'}">
                        <div onclick="${canBuild ? `buildRoom('${roomName}')` : ''}" style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <span style="font-size:1.5em;">${roomConfig.icon}</span>
                                <span style="color:#ffd700;font-weight:bold;margin-left:10px;">${roomName}</span>
                            </div>
                            <div style="text-align:right;">
                                <div style="color:#87ceeb;">💎 ${roomConfig.cost}</div>
                                <div style="color:#4caf50;font-size:0.85em;">${roomConfig.desc}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            html += '</div></div>';
            
            openModal('建造房间', html, '');
        }

        // ===== buildRoom =====
        function buildRoom(roomName) {
            const roomConfig = PALACE_CONFIG.roomTypes[roomName];
            
            if (gameState.spiritStones < roomConfig.cost) {
                showToast('灵石不足！');
                return;
            }
            
            gameState.spiritStones -= roomConfig.cost;
            gameState.palace.rooms.push({ type: roomName, level: 1 });
            
            addLog('good', '房间建造', `建造了 ${roomName}！`);
            
            closeModal();
            saveGame();
            updateDisplay();
            renderPalaceHome();
        }

        // ===== upgradeRoom =====
        function upgradeRoom(idx) {
            const room = gameState.palace.rooms[idx];
            const cost = room.level * 5000;
            
            if (gameState.spiritStones < cost) {
                showToast('灵石不足！');
                return;
            }
            
            gameState.spiritStones -= cost;
            room.level++;
            
            addLog('good', '房间升级', `${room.type} 升级到 Lv.${room.level}！`);
            
            saveGame();
            updateDisplay();
            renderPalaceHome();
        }



        // ===== recruitPalaceDisciple =====
        function recruitPalaceDisciple() {
            const palace = gameState.palace;
            const maxDisciples = PALACE_CONFIG.maxPalaceDisciples[palace.level];
            
            if (palace.disciples.length >= maxDisciples) {
                showToast('弟子人数已达上限！');
                return;
            }
            
            const cost = 1000 * palace.level;
            if (gameState.spiritStones < cost) {
                showToast('灵石不足！');
                return;
            }
            
            gameState.spiritStones -= cost;
            
            // 生成随机弟子
            const names = ['清虚', '太一', '玄清', '玉清', '紫霄', '青冥', '天璇', '天玑', '天权', '玉衡'];
            const talents = ['下品', '下品', '中品', '中品', '上品'];
            const randomName = names[Math.floor(Math.random() * names.length)] + (palace.disciples.length + 1);
            const randomTalent = talents[Math.floor(Math.random() * talents.length)];
            
            const disciple = {
                uid: Date.now(),
                name: randomName,
                realm: Math.max(0, gameState.realm - 1),
                talent: randomTalent,
                work: '修炼中'
            };
            
            palace.disciples.push(disciple);
            
            addLog('good', '招募弟子', `招募了弟子 ${randomName}（${randomTalent}资质）`);
            
            saveGame();
            updateDisplay();
            renderPalaceHome();
        }

        // ===== assignPalaceWork =====
        function assignPalaceWork(idx, work) {
            gameState.palace.disciples[idx].work = work;
            addLog('neutral', '分配工作', `${gameState.palace.disciples[idx].name} 被分配到「${work}」`);
            saveGame();
            renderPalaceHome();
        }





        // ===== processDailyDualTrackSync ===== 每日双轨资源同步
        function processDailyDualTrackSync() {
            const sect = gameState.sect;
            const palace = gameState.palace;
            
            if (!sect.dualTrackEnabled || !sect.syncResources) return;
            if (!sect.name || !palace.name) return;
            
            // 宗门向仙宫同步灵石（10%）
            if (gameState.spiritStones > 0 && sect.spiritStones !== undefined) {
                const syncAmount = Math.floor(Math.min(gameState.spiritStones, sect.spiritStones) * 0.1);
                if (syncAmount > 0) {
                    sect.spiritStones -= syncAmount;
                    palace.spiritStones += syncAmount;
                }
            }
        }

        // ===== upgradePalace =====
        function upgradePalace() {
            const palace = gameState.palace;
            if (palace.level >= 5) {
                showToast('仙宫已达到最高等级！');
                return;
            }
            
            const cost = PALACE_CONFIG.levelConfig[palace.level + 1].upgradeCost;
            if (gameState.spiritStones < cost) {
                showToast('灵石不足！');
                return;
            }
            
            gameState.spiritStones -= cost;
            palace.level++;
            
            addLog('good', '仙宫升级', `仙宫升级为 ${PALACE_CONFIG.levelConfig[palace.level].name}！`);
            
            saveGame();
            updateDisplay();
            renderPalaceHome();
        }

        // ===== collectPalaceProduction =====
        function collectPalaceProduction() {
            const palace = gameState.palace;
            
            let totalStones = 0;
            let totalReputation = 0;
            
            for (const d of palace.disciples) {
                const work = d.work || '修炼中';
                const yields = PALACE_CONFIG.workYields[work];
                if (yields) {
                    totalStones += yields.spiritStones;
                    totalReputation += yields.reputation;
                }
            }
            
            // 房间加成
            const bonuses = calculatePalaceBonus();
            if (bonuses.spiritStones) {
                totalStones = Math.floor(totalStones * (1 + bonuses.spiritStones));
            }
            
            palace.spiritStones += totalStones;
            palace.reputation += totalReputation;
            palace.lastProductionDay = gameState.days;
            
            if (totalStones > 0 || totalReputation > 0) {
                addLog('good', '仙宫产出', `获得 ${totalStones} 灵石，${totalReputation} 声望！`);
            } else {
                addLog('neutral', '仙宫产出', '今日无产出，弟子正在修炼中');
            }
            
            saveGame();
            updateDisplay();
            renderPalaceHome();
        }

        // ===== disbandPalace =====
        function disbandPalace() {
            if (!confirm('确定要解散仙宫吗？此操作不可恢复！')) return;
            
            addLog('bad', '仙宫解散', `${gameState.palace.name} 已解散！`);
            
            gameState.palace = {
                name: null,
                level: 1,
                spiritStones: 0,
                reputation: 0,
                rooms: [],
                disciples: [],
                lastProductionDay: 0,
                decorationBonus: 0,
                tasks: [],
                taskRecord: { completed: 0, failed: 0, totalReward: 0 }
            };
            
            checkPalaceCreation();
            saveGame();
            updateDisplay();
            closePalace();
        }

        // ===== checkPalaceCreation =====
        function checkPalaceCreation() {
            const palaceBtn = document.getElementById('palaceBtn');
            if (!palaceBtn) return;
            
            if (gameState.palace && gameState.palace.name) {
                palaceBtn.style.display = 'inline-block';
            } else {
                palaceBtn.style.display = 'none';
            }
        }

        // ===== getPalaceBonus =====
        function getPalaceBonus(effectType) {
            if (!gameState.palace || !gameState.palace.name) return 0;
            const bonuses = calculatePalaceBonus();
            return bonuses[effectType] || 0;
        }

// ===== serendipity.js =====

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
            if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {}, progress: {}, claimedStages: {}, seasonPoints: 0, seasonRewards: [] };
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

// ===== worldmap.js =====

        // ===== initWorldMap =====
        function initWorldMap() {
            if (!gameState.worldMap) {
                gameState.worldMap = {
                    currentContinent: '中州',
                    currentRegion: '中州城',
                    exploredContinents: ['中州'],
                    exploredRegions: ['中州城', '中州野外'],
                    actionPower: 10,
                    maxActionPower: 10,
                    continentUnlocks: {
                        '中州': 0,   // 筑基
                        '南疆': 1,   // 金丹
                        '北域': 2,   // 元婴
                        '西域': 3,   // 化神
                        '东海': 2,   // 元婴
                        '仙界碎片': 4 // 渡劫
                    },
                    bossRefreshDays: {}, // 记录首领刷新时间
                    lastTravelDay: 0
                };
            }
        }





        // ===== 天外天探索系统 =====

        // 初始化天外天数据
        function initBeyondHeaven() {
            if (!gameState.beyondHeaven) {
                gameState.beyondHeaven = {
                    unlocked: false,  // 是否解锁天外天
                    exploredAreas: [], // 已探索区域
                    totalMysteries: 0, // 总发现神秘事件
                    mysteryLogs: [],   // 神秘日志
                    selectedArea: null,
                    spiritualPower: 0, // 天外天灵力（飞升后积累）
                    maxSpiritualPower: 100
                };
            }
            // 初始化三十三天剧情数据
            if (!gameState.thirtyThreeHeavens) {
                gameState.thirtyThreeHeavens = {
                    unlocked: false,           // 是否解锁三十三天剧情
                    unlockedHeavens: [],       // 已解锁的天（默认只开放前5重）
                    visitedHeavens: [],        // 已访问的天
                    currentAct: 0,             // 当前剧情章节（0=未开始）
                    plotFlags: {},              // 剧情标志位
                    loreDiscovered: [],         // 已发现的 lore
                    npcDialogues: {},           // NPC对话记录
                    chaptersCompleted: [],       // 已完成的章节
                    // 道祖遗迹系统
                    daoAncestorUnlocked: false,  // 道祖遗迹是否解锁
                    daoAncestorLayers: [],       // 已探索的道祖遗迹层数
                    daoAncestorCurrentLayer: 0,  // 当前所在层数
                    daoAncestorDiscovered: [],   // 已发现的道祖
                    // 天道印记道具
                    heavenlySeals: [],           // 持有的天道印记
                    totalSealsCollected: 0,      // 累计收集的印记数
                    // 天道法则领悟系统
                    lawsComprehended: [],        // 已领悟的法则
                    currentLawInsight: 0,        // 当前法则领悟进度
                    maxLawInsight: 100,         // 最大领悟进度
                    lawFragmentOffered: 0       // 已献祭的法则碎片
                };
            }
        }

        // 检查天外天是否解锁
        function isBeyondHeavenUnlocked() {
            // 飞升后（realm=5）自动解锁
            return gameState.beyondHeaven && gameState.beyondHeaven.unlocked;
        }

        // 解锁天外天
        function unlockBeyondHeaven() {
            if (!gameState.beyondHeaven) {
                initBeyondHeaven();
            }
            gameState.beyondHeaven.unlocked = true;
            // 同时解锁三十三天剧情
            if (!gameState.thirtyThreeHeavens) {
                gameState.thirtyThreeHeavens = {
                    unlocked: true,
                    unlockedHeavens: [1, 2, 3, 4, 5],  // 前5重天初始解锁
                    visitedHeavens: [],
                    currentAct: 1,  // 自动触发第一幕
                    plotFlags: {},
                    loreDiscovered: [],
                    npcDialogues: {},
                    chaptersCompleted: [],
                    // 道祖遗迹系统
                    daoAncestorUnlocked: false,
                    daoAncestorLayers: [],
                    daoAncestorCurrentLayer: 0,
                    daoAncestorDiscovered: [],
                    // 天道印记道具
                    heavenlySeals: [],
                    totalSealsCollected: 0,
                    // 天道法则领悟系统
                    lawsComprehended: [],
                    currentLawInsight: 0,
                    maxLawInsight: 100,
                    lawFragmentOffered: 0,
                    // A3 超脱天扩展
                    lawImprints: [], // 36个法则印记，每境各一个
                    hasTranscenderTitle: false, // 是否获得超脱者称号
                    hasCompletedTranscendence: false, // 是否完成超脱天
                    hasTitleChoice: false, // 是否面临天命抉择
                    hiddenEventsTriggered: {}, // 隐藏事件触发记录 {heavenId: timestamp}
                    // 虚无道祖战斗状态
                    voidDaoAncestorState: {
                        phase: 0, // 0未开始 1第一阶段 2第二阶段 3第三阶段
                        dialoguesShown: [], // 已显示的对话
                        defeated: false
                    },
                    // 天命归宿结局记录
                    finalDestinyChoice: null, // 'transcend' | 'return' | 'eternal'
                    newGamePlusUnlocked: false
                };
                addLog('story', '三十三天', '【第一幕：迷惘者】你从沉睡中醒来，发现自己身处天外天，却不记得自己的过去...一位神秘老者出现在你面前...');
            }
            addLog('good', '天外天解锁', '恭喜！你已超脱轮回，进入天外天！诸天万界，任你探索！');
            saveGame();
        }

        // 解锁道祖遗迹
        function unlockDaoAncestor() {
            tth = gameState.thirtyThreeHeavens;
            if (!tth) return;
            
            tth.daoAncestorUnlocked = true;
            tth.daoAncestorCurrentLayer = 1; // 默认从第一层开始
            
            addLog('story', '道祖遗迹', '🏛️ 道祖遗迹已解锁！历代道祖的长眠之地，蕴含天道终极奥秘...');
            addLog('good', '系统提示', '在道祖遗迹中探索，有机会发现道祖、获得天道印记、领悟天道法则！');
            
            saveGame();
            renderBeyondHeaven();
        }







        // ===== 三十三天剧情系统 =====

        // 切换三十三天Tab显示
        function showThirtyThreeTab() {
            const tab = document.getElementById('thirtyThreeTab');
            tab.style.display = tab.style.display === 'none' ? 'block' : 'none';
        }



        // 显示锁定天境的提示
        function showLockedHeavenHint(heavenId) {
            const heaven = THIRTY_THREE_HEAVENS.find(h => h.id === heavenId);
            tth = gameState.thirtyThreeHeavens;
            
            let hint = '';
            if (heavenId === 37) {
                const imprints = tth.lawImprints.length;
                hint = `需要集齐36枚法则印记（当前${imprints}/36）方可进入超脱天`;
            } else if (heavenId === 38) {
                hint = '需要通关第37重天·超脱天方可进入天命归宿';
            } else {
                hint = '探索更多天境以解锁此隐藏天境';
            }
            
            addLog('neutral', '天境提示', hint);
        }

        // 探索某一重天
        function exploreHeaven(heavenId) {
            tth = gameState.thirtyThreeHeavens;
            const heaven = THIRTY_THREE_HEAVENS.find(h => h.id === heavenId);
            
            // A3 特殊天境处理
            if (heavenId === 37) {
                exploreTranscendenceHeaven();
                return;
            } else if (heavenId === 38) {
                exploreDestinyHeaven();
                return;
            }
            
            // 标记为已访问
            if (!tth.visitedHeavens.includes(heavenId)) {
                tth.visitedHeavens.push(heavenId);
            }
            
            // 发现 lore
            if (!tth.loreDiscovered.includes(heavenId)) {
                tth.loreDiscovered.push(heavenId);
            }
            
            // 根据探索数量解锁新天
            const visitedCount = tth.visitedHeavens.length;
            if (visitedCount === 3 && tth.currentAct < 2) {
                tth.currentAct = 2;
                addLog('story', '剧情进展', '【第二幕：三十三天】一位神秘老者告诉你，天外天之上还有三十三天...');
                // 解锁6-10重天
                unlockHeavenRange(6, 10);
            } else if (visitedCount === 10 && tth.currentAct < 3) {
                tth.currentAct = 3;
                addLog('story', '剧情进展', '【第三幕：仙界之谜】你在探索中发现，天外天与仙界之间有着不为人知的秘密...');
                // 解锁11-20重天
                unlockHeavenRange(11, 20);
            } else if (visitedCount === 20 && tth.currentAct < 4) {
                tth.currentAct = 4;
                addLog('story', '剧情进展', '【第四幕：真相大白】当你踏足第三十三重天道天时，一切真相终于揭晓...');
                // 解锁21-33重天
                unlockHeavenRange(21, 33);
            } else if (visitedCount === 33 && tth.currentAct < 5) {
                tth.currentAct = 5;
                addLog('story', '剧情进展', '【第五幕：超脱永恒】三十三天的真相已经揭晓，但还有更深的秘密等待着你...');
                // 解锁34-36隐藏天境
                unlockHeavenRange(34, 36);
                // 解锁道祖遗迹
                tth.daoAncestorUnlocked = true;
                tth.daoAncestorCurrentLayer = 1;
                addLog('story', '道祖遗迹', '🏛️ 道祖遗迹已解锁！历代道祖的长眠之地，蕴含天道终极奥秘...');
            }
            
            // 36天境各增加法则印记（每境获得1个）
            if (heavenId >= 1 && heavenId <= 36 && !tth.lawImprints.includes(heavenId)) {
                tth.lawImprints.push(heavenId);
                const imprintCount = tth.lawImprints.length;
                addLog('good', '法则印记', `你在${heaven.name}领悟了法则，获得第${imprintCount}枚法则印记！`);
                
                // 当获得36枚法则印记时，解锁第37超脱天
                if (imprintCount >= 36 && !tth.unlockedHeavens.includes(37)) {
                    unlockHeavenRange(37, 37);
                    addLog('story', '超脱天解锁', '🌌 你已集齐36枚法则印记！第37重天·超脱天已解锁！');
                }
            }
            
            // A3 隐藏事件系统 - 每个天境5%概率触发
            if (Math.random() < 0.05 && heavenId <= 36) {
                // 检查是否已经触发过
                const lastTriggered = tth.hiddenEventsTriggered[heavenId];
                const now = Date.now();
                // 冷却时间24小时（同一秘境）
                if (!lastTriggered || (now - lastTriggered) > 86400000) {
                    tth.hiddenEventsTriggered[heavenId] = now;
                    triggerHiddenEvent(heavenId, heaven);
                    return; // 隐藏事件会自己显示结果，不走正常流程
                }
            }
            
            // 隐藏天境特殊效果
            if (heavenId >= 34 && heavenId <= 36) {
                // 隐藏天境探索给予大量奖励
                const bonusQi = (heavenId - 33) * 500;
                gameState.qi = Math.min(gameState.maxQi, gameState.qi + bonusQi);
                addLog('good', '隐藏天境', `你探索了隐藏天境，获得${bonusQi}灵力加持！`);
                
                // 概率获得天道印记碎片
                if (Math.random() < 0.3) {
                    const unsealed = HEAVENLY_SEALS.filter(s => !tth.heavenlySeals.includes(s.id));
                    if (unsealed.length > 0) {
                        const seal = unsealed[Math.floor(Math.random() * unsealed.length)];
                        tth.heavenlySeals.push(seal.id);
                        tth.totalSealsCollected++;
                        addLog('good', '天道印记', `在${heaven.name}发现了一枚${seal.name}！`);
                    }
                }
            }
            
            // 显示探索结果
            showHeavenDiscoveryModal(heaven);
            saveGame();
        }

        // ===== A3 隐藏事件系统 =====
        const HIDDEN_EVENTS = {
            // 奇遇类
            mysteriousMerchant: {
                type: 'serendipity',
                name: '神秘商人',
                icon: '🏪',
                description: '一位神秘的商人出现在你面前...',
                options: [
                    { text: '购买天道碎片', effect: () => { addItem('天道碎片', 1); return '获得天道碎片×1'; } },
                    { text: '婉拒离开', effect: () => '你离开了神秘商人...' }
                ]
            },
            ancientSoul: {
                type: 'serendipity',
                name: '上古残魂',
                icon: '👻',
                description: '一缕上古残魂向你诉说古老的秘密...',
                options: [
                    { text: '倾听并接受传承', effect: () => { gameState.qi += 200; return '获得200灵力加持'; } },
                    { text: '礼貌告辞', effect: () => '残魂消散于虚空...' }
                ]
            },
            heavenFragment: {
                type: 'serendipity',
                name: '天道碎片',
                icon: '🔮',
                description: '你发现了一块漂浮的天道碎片...',
                options: [
                    { text: '吸收碎片', effect: () => { addItem('天道碎片', 1); return '获得天道碎片×1'; } },
                    { text: '放置不管', effect: () => '碎片消散于虚空...' }
                ]
            },
            // 战斗类
            heartDemonInvasion: {
                type: 'combat',
                name: '心魔入侵',
                icon: '😈',
                description: '心魔趁虚而入，试图侵蚀你的道心！',
                combat: { hp: 50000, attack: 8000, reward: '心魔结晶×3' }
            },
            lawConflict: {
                type: 'combat',
                name: '法则冲突',
                icon: '⚡',
                description: '两种法则在此交汇，引发激烈冲突！',
                combat: { hp: 30000, attack: 5000, reward: '法则感悟×5' }
            },
            karmaPunishment: {
                type: 'combat',
                name: '因果惩罚',
                icon: '⛓️',
                description: '你过往的因果孽债在此刻降临！',
                combat: { hp: 40000, attack: 6000, reward: '因果之珠×2' }
            },
            // 剧情类
            guardianTrial: {
                type: 'story',
                name: '天境守护者考验',
                icon: '🛡️',
                description: '天境守护者现身，要考验你的实力与心性...',
                options: [
                    { text: '接受考验', effect: () => { gameState.activeEffects.cultivate_speed += 0.05; return '考验通过！修炼速度+5%'; } },
                    { text: '婉言拒绝', effect: () => '守护者消失于虚空...' }
                ]
            },
            pastLifeMemory: {
                type: 'story',
                name: '前世记忆',
                icon: '🔮',
                description: '你的前世记忆如潮水般涌来...',
                options: [
                    { text: '接受记忆', effect: () => { gameState.activeEffects.attack += 0.03; return '领悟攻击+3%'; } },
                    { text: '封印记忆', effect: () => '记忆重新封印...' }
                ]
            },
            destinyHint: {
                type: 'story',
                name: '天命暗示',
                icon: '✨',
                description: '冥冥中有什么在暗示你未来的道路...',
                options: [
                    { text: '顺其自然', effect: () => { gameState.activeEffects.luck += 0.1; return '运势+10%'; } },
                    { text: '追问详情', effect: () => '天机不可泄露...' }
                ]
            }
        };

        // 触发隐藏事件
        function triggerHiddenEvent(heavenId, heaven) {
            const events = Object.keys(HIDDEN_EVENTS);
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            const eventData = HIDDEN_EVENTS[randomEvent];
            
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');
            
            let html = `<div class="heaven-discovery" style="background:linear-gradient(135deg,#1a0a2e,#2d1b4e);border:2px solid #9c27b0;">
                <h2 style="text-align:center;color:#e91e63;">✨ 隐藏事件 ✨</h2>
                <div style="text-align:center;font-size:3em;margin:15px 0;">${eventData.icon}</div>
                <h3 style="color:#ffd700;text-align:center;">${eventData.name}</h3>
                <div class="discovery-lore">
                    <p style="color:#e0e0e0;line-height:1.8;">${eventData.description}</p>
                </div>`;
            
            if (eventData.type === 'combat') {
                html += `<div style="text-align:center;margin:20px 0;">
                    <p style="color:#ff5722;">危险战斗！</p>
                    <p>敌人血量：${eventData.combat.hp.toLocaleString()}</p>
                    <p>敌人攻击：${eventData.combat.attack.toLocaleString()}</p>
                    <p style="color:#4caf50;">胜利奖励：${eventData.combat.reward}</p>
                </div>
                <div style="text-align:center;">
                    <button class="btn btn-combat" onclick="startHiddenEventBattle(${heavenId}, '${randomEvent}')">⚔️ 迎战</button>
                    <button class="btn btn-save" onclick="skipHiddenEvent()">🏃 撤退</button>
                </div>`;
            } else if (eventData.options) {
                html += '<div style="text-align:center;margin-top:20px;">';
                eventData.options.forEach((opt, idx) => {
                    html += `<button class="btn" style="margin:5px;" onclick="resolveHiddenEvent(${heavenId}, '${randomEvent}', ${idx})">${opt.text}</button>`;
                });
                html += '</div>';
            }
            
            html += `<div style="text-align:center;margin-top:15px;">
                <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');" style="font-size:0.85em;">返回</button>
            </div></div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        // 开始隐藏事件战斗
        function startHiddenEventBattle(heavenId, eventKey) {
            const eventData = HIDDEN_EVENTS[eventKey];
            const combat = eventData.combat;
            
            // 玩家最大生命值
            const playerMaxHP = 100 + gameState.realm * 100;
            secretRealmState = {
                wave: 0,
                totalWaves: 1,
                enemies: [{
                    name: eventData.name,
                    icon: eventData.icon,
                    hp: combat.hp,
                    maxHP: combat.hp,
                    attack: combat.attack,
                    realm: 10
                }],
                playerHP: playerMaxHP,
                playerMaxHP: playerMaxHP,
                rewards: [],
                eventName: eventData.name,
                isNegative: true,
                realmName: '隐藏事件',
                hiddenEventReward: combat.reward
            };
            
            showSecretRealmBattleUI();
        }

        // 解决隐藏事件（非战斗选项）
        function resolveHiddenEvent(heavenId, eventKey, optionIdx) {
            const eventData = HIDDEN_EVENTS[eventKey];
            const option = eventData.options[optionIdx];
            const result = option.effect();
            
            addLog('good', '隐藏事件', `${eventData.name}：${result}`);
            showHeavenDiscoveryModal(THIRTY_THREE_HEAVENS.find(h => h.id === heavenId));
            saveGame();
        }

        // 跳过隐藏事件
        function skipHiddenEvent() {
            addLog('neutral', '隐藏事件', '你选择了撤退，隐藏事件消失于虚空...');
            renderBeyondHeaven();
            document.getElementById('beyondHeavenModal').classList.add('active');
        }

        // ===== A3 第37重天·超脱天（混沌虚无之地）=====
        // 进入条件：天外天36天境全部完成（每境各获得1个法则印记，共36个）
        // 敌人：虚无道祖（血量800万，攻击120万，超脱伤害无视防御）
        // 奖励：超脱者称号 + 天道印记×99 + 混沌灵液×50
        // 剧情对话（3段）

        const VOID_DAO_ANCESTOR = {
            name: '虚无道祖',
            icon: '🌑',
            totalHP: 8000000,
            attack: 1200000,
            phases: [
                { name: '虚无降临', dialogue: '你已超越天道，但超脱之后...是什么？', hpThreshold: 0.7 },
                { name: '虚空凝视', dialogue: '天道之外，虚无一片，你为何而来？', hpThreshold: 0.3 },
                { name: '超脱之刻', dialogue: '原来超脱不是消失，而是...成为新的天道。', hpThreshold: 0 }
            ]
        };

        function exploreTranscendenceHeaven() {
            tth = gameState.thirtyThreeHeavens;
            const heaven = THIRTY_THREE_HEAVENS.find(h => h.id === 37);
            
            // 标记为已访问
            if (!tth.visitedHeavens.includes(37)) {
                tth.visitedHeavens.push(37);
            }
            
            // 如果尚未完成超脱天，开始战斗流程
            if (!tth.hasCompletedTranscendence) {
                startVoidDaoAncestorBattle();
            } else {
                // 已完成，显示完成状态
                showHeavenDiscoveryModal(heaven);
            }
            saveGame();
        }

        function startVoidDaoAncestorBattle() {
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');
            
            // 初始化虚无道祖状态
            const vda = gameState.thirtyThreeHeavens.voidDaoAncestorState;
            vda.phase = 1;
            vda.dialoguesShown = [];
            vda.defeated = false;
            
            let html = `<div class="heaven-discovery" style="background:linear-gradient(135deg,#0a0a15,#1a1a2e,#0d0d1a);border:2px solid #4a148c;">
                <h2 style="text-align:center;color:#9c27b0;">🌌 第37重天·超脱天 🌌</h2>
                <div style="text-align:center;font-size:4em;margin:15px 0;">🌑</div>
                <h3 style="color:#e91e63;text-align:center;font-size:1.5em;">虚无道祖</h3>
                <div class="discovery-lore">
                    <p style="color:#e0e0e0;line-height:1.8;font-size:1.1em;text-align:center;">${VOID_DAO_ANCESTOR.phases[0].dialogue}</p>
                </div>
                <div style="text-align:center;margin:20px 0;">
                    <p style="color:#ff5722;font-size:1.2em;">⚠️ 警告：超脱伤害无视防御 ⚠️</p>
                    <p style="color:#aaa;">敌人血量：${VOID_DAO_ANCESTOR.totalHP.toLocaleString()}</p>
                    <p style="color:#aaa;">敌人攻击：${VOID_DAO_ANCESTOR.attack.toLocaleString()}</p>
                </div>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-combat" onclick="startVoidDaoAncestorCombat()" style="background:linear-gradient(135deg,#4a148c,#7b1fa2);font-size:1.1em;padding:15px 40px;">⚔️ 进入战斗</button>
                </div>
                <div style="text-align:center;margin-top:15px;">
                    <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');" style="font-size:0.9em;">返回天外天</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        function startVoidDaoAncestorCombat() {
            const playerMaxHP = 100 + gameState.realm * 100;
            
            secretRealmState = {
                wave: 0,
                totalWaves: 3, // 3阶段战斗
                enemies: [
                    { name: '虚无道祖·第一阶段', icon: '🌑', hp: Math.floor(VOID_DAO_ANCESTOR.totalHP * 0.4), maxHP: Math.floor(VOID_DAO_ANCESTOR.totalHP * 0.4), attack: VOID_DAO_ANCESTOR.attack, realm: 15, ignoreDefense: true },
                    { name: '虚无道祖·第二阶段', icon: '🌀', hp: Math.floor(VOID_DAO_ANCESTOR.totalHP * 0.35), maxHP: Math.floor(VOID_DAO_ANCESTOR.totalHP * 0.35), attack: Math.floor(VOID_DAO_ANCESTOR.attack * 1.3), realm: 15, ignoreDefense: true },
                    { name: '虚无道祖·最终阶段', icon: '✨', hp: Math.floor(VOID_DAO_ANCESTOR.totalHP * 0.25), maxHP: Math.floor(VOID_DAO_ANCESTOR.totalHP * 0.25), attack: Math.floor(VOID_DAO_ANCESTOR.attack * 1.6), realm: 15, ignoreDefense: true }
                ],
                playerHP: playerMaxHP,
                playerMaxHP: playerMaxHP,
                rewards: [],
                eventName: '虚无道祖',
                isNegative: true,
                realmName: '超脱天',
                phase: 1,
                dialogueIndex: 0
            };
            
            // 显示第一阶段剧情对话
            showVoidDaoAncestorDialogue(0);
        }

        function showVoidDaoAncestorDialogue(dialogueIdx) {
            const modal = document.getElementById('secretRealmModal');
            const content = document.getElementById('secretRealmContent');
            const dialogue = VOID_DAO_ANCESTOR.phases[dialogueIdx];
            
            let html = `<div class="secret-realm-arena" style="background:linear-gradient(135deg,#0a0a15,#1a1a2e);">
                <div class="realm-name" style="color:#9c27b0;font-size:1.5em;margin-bottom:20px;">🌑 虚无道祖 · ${dialogue.name}</div>
                <div style="text-align:center;font-size:4em;margin:20px 0;">${VOID_DAO_ANCESTOR.icon}</div>
                <div class="discovery-lore" style="background:rgba(76,0,130,0.3);padding:20px;border-radius:10px;margin:20px 0;">
                    <p style="color:#e0e0e0;line-height:1.8;font-size:1.2em;text-align:center;">"${dialogue.dialogue}"</p>
                </div>
                <div style="text-align:center;margin-top:30px;">
                    <button class="btn btn-combat" onclick="continueVoidBattle(${dialogueIdx})" style="background:linear-gradient(135deg,#4a148c,#7b1fa2);padding:15px 40px;font-size:1.1em;">继续战斗 ⚔️</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        function continueVoidBattle(dialogueIdx) {
            gameState.thirtyThreeHeavens.voidDaoAncestorState.dialoguesShown.push(dialogueIdx);
            secretRealmState.dialogueIndex = dialogueIdx;
            closeSecretRealmModal();
            showSecretRealmBattleUI();
        }

        // 覆盖 attackRealmEnemy 以处理虚无道祖的无视防御特殊伤害
        const originalAttackRealmEnemy = attackRealmEnemy;
        attackRealmEnemy = function() {
            const enemy = secretRealmState.enemies[secretRealmState.wave];
            const playerAttack = Math.floor(20 + gameState.realm * 15 + Math.random() * 20);
            let totalAttack = playerAttack * (1 + gameState.activeEffects.attack);

            enemy.hp -= Math.floor(totalAttack);
            addLog('good', '秘境战斗', `对${enemy.name}造成 ${Math.floor(totalAttack)} 点伤害！`);

            if (enemy.hp <= 0) {
                secretRealmState.wave++;
                
                // 每波次奖励
                const waveRewards = [
                    { type: 'qi', value: 500 },
                    { type: 'qi', value: 800 },
                    { type: 'qi', value: 1200 }
                ];
                const reward = waveRewards[secretRealmState.wave - 1] || waveRewards[2];
                gameState.qi = Math.min(gameState.maxQi, gameState.qi + reward.value);
                secretRealmState.rewards.push(`${reward.value} 灵力`);
                addLog('good', '秘境战斗', `击败${enemy.name}！获得 ${secretRealmState.rewards[secretRealmState.rewards.length - 1]}`);

                if (secretRealmState.wave >= secretRealmState.totalWaves) {
                    // 全部击败！
                    onVoidDaoAncestorDefeated();
                } else {
                    // 显示下一阶段对话
                    const nextDialogueIdx = secretRealmState.wave;
                    if (nextDialogueIdx < VOID_DAO_ANCESTOR.phases.length - 1) {
                        closeSecretRealmModal();
                        showVoidDaoAncestorDialogue(nextDialogueIdx);
                    } else {
                        // 最终阶段直接继续
                        showSecretRealmBattleUI();
                    }
                }
            } else {
                // 敌人攻击（虚无伤害无视防御）
                let damage = enemy.attack;
                if (enemy.ignoreDefense) {
                    // 虚无道祖特殊攻击：无视防御直接扣血
                    damage = Math.floor(damage * (1 + secretRealmState.wave * 0.2));
                } else {
                    damage = Math.floor(damage * (1 - gameState.activeEffects.defense));
                }
                damage = Math.max(1, damage);
                secretRealmState.playerHP -= damage;
                addLog('bad', '秘境战斗', `${enemy.name}对你造成 ${damage} 点超脱伤害！`);

                if (secretRealmState.playerHP <= 0) {
                    secretRealmState.playerHP = 0;
                    onVoidBattleDefeat();
                }
                showSecretRealmBattleUI();
            }
        };

        function onVoidDaoAncestorDefeated() {
            tth = gameState.thirtyThreeHeavens;
            tth.hasCompletedTranscendence = true;
            tth.voidDaoAncestorState.defeated = true;
            
            // 奖励：超脱者称号 + 天道印记×99 + 混沌灵液×50
            if (!tth.hasTranscenderTitle) {
                tth.hasTranscenderTitle = true;
                if (!gameState.achievements.titles.includes('超脱者')) {
                    gameState.achievements.titles.push('超脱者');
                }
                addLog('good', '称号获得', '🏆 你获得了【超脱者】称号！');
            }
            
            // 添加天道印记×99
            tth.totalSealsCollected += 99;
            for (let i = 0; i < 99; i++) {
                const sealTypes = ['destiny', 'reincarnation', 'time', 'void', 'creation', 'primordial'];
                const randomSeal = sealTypes[Math.floor(Math.random() * sealTypes.length)];
                if (!tth.heavenlySeals.includes(randomSeal)) {
                    tth.heavenlySeals.push(randomSeal);
                }
            }
            
            // 混沌灵液×50
            addItem('混沌灵液', 50);
            
            addLog('good', '超脱天通关', '🎉 你击败了虚无道祖，通关了第37重天·超脱天！');
            addLog('good', '超脱天奖励', '获得：超脱者称号 + 天道印记×99 + 混沌灵液×50');
            
            // 解锁第38天命归宿
            if (!tth.unlockedHeavens.includes(38)) {
                unlockHeavenRange(38, 38);
                addLog('story', '天命归宿', '✨ 第38重天·天命天已解锁！所有超脱者的最终归宿等待着你...');
            }
            
            saveGame();
            showVoidDaoAncestorVictory();
        }

        function showVoidDaoAncestorVictory() {
            const modal = document.getElementById('secretRealmModal');
            const content = document.getElementById('secretRealmContent');
            
            let html = `<div class="secret-realm-arena" style="background:linear-gradient(135deg,#0a0a15,#1a1a2e,#0d0d1a);">
                <div style="text-align:center;font-size:5em;margin:20px 0;">🏆</div>
                <h2 style="color:#ffd700;text-align:center;">超脱天通关！</h2>
                <div style="text-align:center;margin:20px 0;">
                    <p style="color:#e0e0e0;font-size:1.2em;">你击败了虚无道祖，领悟了超脱的真意...</p>
                    <p style="color:#9c27b0;font-size:1.1em;margin-top:15px;">"原来超脱不是消失，而是...成为新的天道。"</p>
                </div>
                <div style="background:rgba(156,39,176,0.2);padding:15px;border-radius:10px;margin:20px 0;text-align:center;">
                    <p style="color:#4caf50;">🎁 通关奖励</p>
                    <p style="color:#ffd700;">超脱者称号</p>
                    <p style="color:#ffd700;">天道印记×99</p>
                    <p style="color:#ffd700;">混沌灵液×50</p>
                </div>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-cultivate" onclick="closeSecretRealmModal(); renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');" style="padding:15px 40px;font-size:1.1em;">返回天外天</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        function onVoidBattleDefeat() {
            addLog('bad', '秘境战斗', '你被虚无道祖击败了...');
            closeSecretRealmModal();
            
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');
            
            let html = `<div class="heaven-discovery" style="background:linear-gradient(135deg,#1a0a0a,#2d1b1b);border:2px solid #f44336;">
                <h2 style="text-align:center;color:#f44336;">挑战失败</h2>
                <div style="text-align:center;font-size:4em;margin:15px 0;">💀</div>
                <p style="color:#e0e0e0;text-align:center;">你被虚无道祖击败了...</p>
                <p style="color:#aaa;text-align:center;margin-top:10px;">超脱之路艰难，但道心不灭</p>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');">返回天外天</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        // ===== A3 第38重天·天命归宿（最终隐藏结局）=====
        // 进入条件：超脱天通关 + 已获得「超脱者」称号
        // 特殊战斗：天命抉择（无敌人，纯选择）
        // 三个结局选项：
        //   选项A「超脱」：化作虚无，永世游离于天道之外（获得「虚无道祖」称号）
        //   选项B「回归」：重返修仙路，重新开始（解锁二周目模式）
        //   选项C「永恒」：化为天道本身，永恒守护修仙界（获得「天命道祖」称号 + 特殊头像框）

        function exploreDestinyHeaven() {
            tth = gameState.thirtyThreeHeavens;
            const heaven = THIRTY_THREE_HEAVENS.find(h => h.id === 38);
            
            // 标记为已访问
            if (!tth.visitedHeavens.includes(38)) {
                tth.visitedHeavens.push(38);
            }
            
            // 检查是否已经有结局
            if (tth.finalDestinyChoice) {
                showAlreadyMadeChoice(heaven);
            } else {
                showDestinyChoice();
            }
            saveGame();
        }

        function showDestinyChoice() {
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');
            
            let html = `<div class="heaven-discovery" style="background:linear-gradient(135deg,#1a0a2e,#2d1b4e,#0d0d1a);border:2px solid #ffd700;">
                <h2 style="text-align:center;color:#ffd700;">✨ 第38重天·天命归宿 ✨</h2>
                <div style="text-align:center;font-size:4em;margin:15px 0;">🔮</div>
                <h3 style="color:#e91e63;text-align:center;">天命抉择</h3>
                <div class="discovery-lore">
                    <p style="color:#e0e0e0;line-height:1.8;font-size:1.1em;text-align:center;">
                        你已超越天道，来到所有超脱者的最终归宿。<br>
                        在此，你将做出最终的选择...
                    </p>
                </div>
                
                <div style="margin:30px 0;">
                    <div style="background:rgba(76,0,130,0.3);padding:20px;border-radius:10px;margin-bottom:15px;text-align:center;">
                        <h4 style="color:#9c27b0;margin-bottom:10px;">选项A：超脱 🌑</h4>
                        <p style="color:#aaa;font-size:0.9em;">化作虚无，永世游离于天道之外</p>
                        <p style="color:#4caf50;font-size:0.85em;">奖励：「虚无道祖」称号</p>
                        <button class="btn" onclick="makeDestinyChoice('transcend')" style="background:linear-gradient(135deg,#4a148c,#7b1fa2);color:white;margin-top:10px;padding:10px 30px;">选择超脱</button>
                    </div>
                    
                    <div style="background:rgba(0,100,0,0.3);padding:20px;border-radius:10px;margin-bottom:15px;text-align:center;">
                        <h4 style="color:#4caf50;margin-bottom:10px;">选项B：回归 🔄</h4>
                        <p style="color:#aaa;font-size:0.9em;">重返修仙路，重新开始</p>
                        <p style="color:#4caf50;font-size:0.85em;">奖励：解锁二周目模式（New Game+）</p>
                        <button class="btn" onclick="makeDestinyChoice('return')" style="background:linear-gradient(135deg,#2e7d32,#4caf50);color:white;margin-top:10px;padding:10px 30px;">选择回归</button>
                    </div>
                    
                    <div style="background:rgba(139,69,19,0.3);padding:20px;border-radius:10px;text-align:center;">
                        <h4 style="color:#ffd700;margin-bottom:10px;">选项C：永恒 ⭐</h4>
                        <p style="color:#aaa;font-size:0.9em;">化为天道本身，永恒守护修仙界</p>
                        <p style="color:#4caf50;font-size:0.85em;">奖励：「天命道祖」称号 + 特殊头像框</p>
                        <button class="btn" onclick="makeDestinyChoice('eternal')" style="background:linear-gradient(135deg,#ff6f00,#ffd700);color:white;margin-top:10px;padding:10px 30px;">选择永恒</button>
                    </div>
                </div>
                
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');" style="font-size:0.9em;">返回天外天</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        function makeDestinyChoice(choice) {
            tth = gameState.thirtyThreeHeavens;
            tth.finalDestinyChoice = choice;
            
            switch(choice) {
                case 'transcend':
                    // 化作虚无，永世游离于天道之外
                    if (!gameState.achievements.titles.includes('虚无道祖')) {
                        gameState.achievements.titles.push('虚无道祖');
                    }
                    gameState.title = '虚无道祖';
                    addLog('story', '天命归宿', '🌑 你选择了【超脱】，化作虚无，永世游离于天道之外...');
                    addLog('good', '称号获得', '🏆 你获得了【虚无道祖】称号！');
                    showTranscendentEnding();
                    break;
                    
                case 'return':
                    // 重返修仙路，重新开始
                    tth.newGamePlusUnlocked = true;
                    addLog('story', '天命归宿', '🔄 你选择了【回归】，重返修仙路，重新开始...');
                    addLog('good', '二周目解锁', '🎮 你解锁了二周目模式（New Game+）！');
                    showReturnEnding();
                    break;
                    
                case 'eternal':
                    // 化为天道本身，永恒守护修仙界
                    if (!gameState.achievements.titles.includes('天命道祖')) {
                        gameState.achievements.titles.push('天命道祖');
                    }
                    gameState.title = '天命道祖';
                    gameState.equippedFrame = '天命道祖头像框';
                    addLog('story', '天命归宿', '⭐ 你选择了【永恒】，化为天道本身，永恒守护修仙界...');
                    addLog('good', '称号获得', '🏆 你获得了【天命道祖】称号！');
                    addLog('good', '头像框获得', '🖼️ 你获得了【天命道祖头像框】！');
                    showEternalEnding();
                    break;
            }
            
            saveGame();
        }

        function showTranscendentEnding() {
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');
            
            let html = `<div class="heaven-discovery" style="background:linear-gradient(135deg,#0a0a15,#1a1a2e,#0d0d1a);border:2px solid #4a148c;">
                <div style="text-align:center;font-size:5em;margin:20px 0;">🌑</div>
                <h2 style="color:#9c27b0;text-align:center;">【超脱】结局</h2>
                <div class="discovery-lore" style="margin:20px 0;">
                    <p style="color:#e0e0e0;line-height:1.8;text-align:center;">
                        你化作虚无，离开了这个宇宙。<br><br>
                        天道之外，永恒的虚无中，<br>
                        你将以另一种形式永存...<br><br>
                        这不是消亡，而是真正的超脱。
                    </p>
                </div>
                <div style="text-align:center;background:rgba(76,0,130,0.3);padding:15px;border-radius:10px;">
                    <p style="color:#ffd700;">🏆 获得称号：【虚无道祖】</p>
                </div>
                <p style="color:#aaa;text-align:center;margin-top:20px;">感谢你的游玩！</p>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');">返回天外天</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        function showReturnEnding() {
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');
            
            let html = `<div class="heaven-discovery" style="background:linear-gradient(135deg,#0a1a0a,#1a2e1a,#0d1a0d);border:2px solid #4caf50;">
                <div style="text-align:center;font-size:5em;margin:20px 0;">🔄</div>
                <h2 style="color:#4caf50;text-align:center;">【回归】结局</h2>
                <div class="discovery-lore" style="margin:20px 0;">
                    <p style="color:#e0e0e0;line-height:1.8;text-align:center;">
                        你选择重返修仙路，再历红尘。<br><br>
                        带着前世的记忆与感悟，<br>
                        你将以全新的身份重新开始...<br><br>
                        但你获得的道心与智慧，将永远相随。
                    </p>
                </div>
                <div style="text-align:center;background:rgba(0,100,0,0.3);padding:15px;border-radius:10px;">
                    <p style="color:#4caf50;">🎮 解锁二周目模式（New Game+）</p>
                    <p style="color:#aaa;font-size:0.9em;margin-top:5px;">下次开始新游戏时可在设置中选择</p>
                </div>
                <p style="color:#aaa;text-align:center;margin-top:20px;">感谢你的游玩！</p>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');">返回天外天</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        function showEternalEnding() {
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');
            
            let html = `<div class="heaven-discovery" style="background:linear-gradient(135deg,#1a1a0a,#2e2e1a,#1a1a0d);border:2px solid #ffd700;">
                <div style="text-align:center;font-size:5em;margin:20px 0;">⭐</div>
                <h2 style="color:#ffd700;text-align:center;">【永恒】结局</h2>
                <div class="discovery-lore" style="margin:20px 0;">
                    <p style="color:#e0e0e0;line-height:1.8;text-align:center;">
                        你选择化为天道本身，永恒守护这片天地。<br><br>
                        亿万年后，<br>
                        你化身的天道将庇护无数修士，<br>
                        见证无数飞升与超脱...<br><br>
                        这是最孤独，却也是最伟大的选择。
                    </p>
                </div>
                <div style="text-align:center;background:rgba(139,69,19,0.3);padding:15px;border-radius:10px;">
                    <p style="color:#ffd700;">🏆 获得称号：【天命道祖】</p>
                    <p style="color:#ffd700;margin-top:5px;">🖼️ 获得头像框：天命道祖头像框</p>
                </div>
                <p style="color:#aaa;text-align:center;margin-top:20px;">恭喜你达成真结局！感谢你的游玩！</p>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');">返回天外天</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        function showAlreadyMadeChoice(heaven) {
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');
            tth = gameState.thirtyThreeHeavens;
            
            const endings = {
                'transcend': { name: '超脱', icon: '🌑', color: '#9c27b0' },
                'return': { name: '回归', icon: '🔄', color: '#4caf50' },
                'eternal': { name: '永恒', icon: '⭐', color: '#ffd700' }
            };
            
            const ending = endings[tth.finalDestinyChoice] || endings.transcend;
            
            let html = `<div class="heaven-discovery" style="background:linear-gradient(135deg,#1a0a2e,#2d1b4e,#0d0d1a);border:2px solid ${ending.color};">
                <h2 style="text-align:center;color:${ending.color};">✨ 第38重天·天命归宿 ✨</h2>
                <div style="text-align:center;font-size:4em;margin:15px 0;">${ending.icon}</div>
                <h3 style="color:#e0e0e0;text-align:center;">你已做出选择</h3>
                <div style="text-align:center;margin:20px 0;">
                    <p style="color:${ending.color};font-size:1.5em;">【${ending.name}】</p>
                    <p style="color:#aaa;margin-top:10px;">你已经选择了属于你的命运</p>
                </div>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');">返回天外天</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        // 解锁指定范围的天
        function unlockHeavenRange(start, end) {
            tth = gameState.thirtyThreeHeavens;
            for (let i = start; i <= end; i++) {
                if (!tth.unlockedHeavens.includes(i)) {
                    tth.unlockedHeavens.push(i);
                }
            }
            addLog('good', '天境解锁', `已解锁第${start}至第${end}重天！`);
        }

        // 显示天道发现模态框
        function showHeavenDiscoveryModal(heaven) {
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');
            
            let html = `<div class="heaven-discovery">
                <h2 style="text-align:center;color:#ffd700;">✨ ${heaven.name} ✨</h2>
                <div class="discovery-lore">
                    <p style="color:#e0e0e0;line-height:1.8;">${heaven.lore}</p>
                </div>
                <div class="discovery-reward">
                    <p>🎁 你对这片天境有了更深的理解...</p>
                </div>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');">返回天外天</button>
                </div>
            </div>`;
            
            content.innerHTML = html;
            modal.classList.add('active');
        }

        // ===== 道祖遗迹系统 =====

        // 道祖数据配置
        const DAO_ANCESTORS = [
            { id: 1, name: '太上道祖', icon: '👴', quote: '道可道，非常道...', blessing: '领悟力+10%', reward: '天道印记碎片×1' },
            { id: 2, name: '原始天魔', icon: '😈', quote: '非道非魔，亦道亦魔...', blessing: '心魔抗性+15%', reward: '心魔结晶×1' },
            { id: 3, name: '命运古神', icon: '🔮', quote: '命运如织，因果循环...', blessing: '运势+20%', reward: '命运之纱×1' },
            { id: 4, name: '轮回天尊', icon: '⚰️', quote: '生死轮转，永劫不灭...', blessing: '轮回感悟+25%', reward: '轮回法则碎片×1' },
            { id: 5, name: '时空王者', icon: '⏳', quote: '过去未来，皆在一念...', blessing: '时空法则+15%', reward: '时空道痕×1' },
            { id: 6, name: '虚无大帝', icon: '🌑', quote: '无中生有，有归于无...', blessing: '虚无之力+20%', reward: '虚无之气×1' }
        ];

        // 道祖遗迹层配置
        const DAO_ANCESTOR_LAYERS = [
            { id: 1, name: '第一层·道祖残影', desc: '历代道祖留下的意志投影', difficulty: 1, reward: '道祖感悟×1', sealChance: 0.1 },
            { id: 2, name: '第二层·道韵流转', desc: '天道法则流动的秘境', difficulty: 2, reward: '道韵精华×1', sealChance: 0.15 },
            { id: 3, name: '第三层·祖魂栖息', desc: '道祖残念长眠之地', difficulty: 3, reward: '祖魂结晶×1', sealChance: 0.2 },
            { id: 4, name: '第四层·法则熔炉', desc: '天道法则交汇之处', difficulty: 4, reward: '法则本源×1', sealChance: 0.25 },
            { id: 5, name: '第五层·道祖真身', desc: '道祖真正遗迹的核心', difficulty: 5, reward: '道祖传承×1', sealChance: 0.3 }
        ];

        // 天道印记配置
        const HEAVENLY_SEALS = [
            { id: 'destiny', name: '命运印记', icon: '🔮', desc: '蕴含命运法则的天道印记', effect: '运势永久+15%' },
            { id: 'reincarnation', name: '轮回印记', icon: '⚰️', desc: '蕴含轮回法则的天道印记', effect: '寿元消耗-20%' },
            { id: 'time', name: '时空印记', icon: '⏳', desc: '蕴含时空法则的天道印记', effect: '修炼速度+15%' },
            { id: 'void', name: '虚无印记', icon: '🌑', desc: '蕴含虚无法则的天道印记', effect: '心魔抗性+25%' },
            { id: 'creation', name: '造化印记', icon: '✨', desc: '蕴含造化法则的天道印记', effect: '突破成功率+20%' },
            { id: 'primordial', name: '混沌印记', icon: '🌌', desc: '蕴含混沌法则的天道印记', effect: '所有属性+10%' }
        ];

        // 天道法则配置
        const HEAVENLY_LAWS = [
            { id: 'destiny', name: '命运法则', desc: '因果循环，命运注定', progressNeeded: 100 },
            { id: 'reincarnation', name: '轮回法则', desc: '生死轮转，永劫不灭', progressNeeded: 120 },
            { id: 'time', name: '时空法则', desc: '过去未来，皆在一念', progressNeeded: 150 },
            { id: 'void', name: '虚无法则', desc: '无中生有，有归于无', progressNeeded: 130 },
            { id: 'creation', name: '造化法则', desc: '万物生长，造物之主', progressNeeded: 140 },
            { id: 'primordial', name: '混沌法则', desc: '天地初开，混沌为源', progressNeeded: 200 }
        ];

        // 切换道祖遗迹Tab显示
        function showDaoAncestorTab() {
            const tab = document.getElementById('daoAncestorTab');
            if (tab) {
                tab.style.display = tab.style.display === 'none' ? 'block' : 'none';
            }
        }



        // 探索道祖遗迹层
        function exploreDaoAncestorLayer(layerId) {
            tth = gameState.thirtyThreeHeavens;
            const layer = DAO_ANCESTOR_LAYERS.find(l => l.id === layerId);
            if (!layer) return;

            // 设置当前层
            tth.daoAncestorCurrentLayer = layerId;
            
            // 随机事件判定
            const roll = Math.random();
            let event = {};
            
            if (roll < 0.3) {
                // 发现道祖
                const undiscoveredAncestors = DAO_ANCESTORS.filter(a => !tth.daoAncestorDiscovered.includes(a.id));
                if (undiscoveredAncestors.length > 0) {
                    const ancestor = undiscoveredAncestors[Math.floor(Math.random() * undiscoveredAncestors.length)];
                    tth.daoAncestorDiscovered.push(ancestor.id);
                    event = {
                        type: 'ancestor',
                        title: `🎉 发现道祖: ${ancestor.name}`,
                        desc: `"${ancestor.quote}"`,
                        blessing: ancestor.blessing
                    };
                    addLog('story', '道祖发现', `在${layer.name}发现了${ancestor.name}！获得祝福: ${ancestor.blessing}`);
                }
            } else if (roll < 0.6) {
                // 获得天道印记
                if (Math.random() < layer.sealChance) {
                    const unsealed = HEAVENLY_SEALS.filter(s => !tth.heavenlySeals.includes(s.id));
                    if (unsealed.length > 0) {
                        const seal = unsealed[Math.floor(Math.random() * unsealed.length)];
                        tth.heavenlySeals.push(seal.id);
                        tth.totalSealsCollected++;
                        event = {
                            type: 'seal',
                            title: `🔮 获得天道印记: ${seal.name}`,
                            desc: seal.desc,
                            effect: seal.effect
                        };
                        addLog('good', '天道印记', `获得${seal.name}！效果: ${seal.effect}`);
                        
                        // 检查是否触发第五幕剧情
                        if (tth.totalSealsCollected >= 3 && tth.currentAct < 5) {
                            tth.currentAct = 5;
                            addLog('story', '剧情进展', '【第五幕：超脱永恒】道祖遗迹中隐藏着终极奥秘，天道印记指引着你找到通往超脱之路...');
                        }
                    }
                }
            } else if (roll < 0.85) {
                // 法则领悟进度
                const progress = Math.floor(Math.random() * 20) + 10;
                tth.currentLawInsight = Math.min(tth.maxLawInsight, tth.currentLawInsight + progress);
                event = {
                    type: 'law_progress',
                    title: '📜 天道法则领悟',
                    desc: `对天道法则的领悟加深，进度+${progress}`,
                    progress: tth.currentLawInsight
                };
                addLog('good', '法则领悟', `法则领悟进度+${progress}`);
            } else {
                // 战斗/挑战
                const qiLoss = Math.floor(Math.random() * 100) + 50;
                gameState.qi = Math.max(1, gameState.qi - qiLoss);
                event = {
                    type: 'danger',
                    title: '⚔️ 遭遇危险',
                    desc: `遗迹中的守护者发起攻击，消耗灵力${qiLoss}点`,
                    loss: qiLoss
                };
                addLog('danger', '遗迹危险', `遭遇守护者攻击，损失${qiLoss}灵力`);
            }

            // 标记为已探索
            if (!tth.daoAncestorLayers.includes(layerId)) {
                tth.daoAncestorLayers.push(layerId);
            }

            // 检查是否可以领悟法则
            checkLawComprehension();

            // 显示探索结果
            showDaoAncestorDiscoveryModal(event, layer);
            saveGame();
        }

        // 探索当前选定的层
        function exploreCurrentDaoAncestorLayer() {
            tth = gameState.thirtyThreeHeavens;
            if (tth.daoAncestorCurrentLayer > 0) {
                exploreDaoAncestorLayer(tth.daoAncestorCurrentLayer);
            }
        }

        // 显示道祖发现弹窗
        function showDaoAncestorDiscoveryModal(event, layer) {
            const modal = document.getElementById('beyondHeavenModal');
            const content = document.getElementById('beyondHeavenContent');

            let html = `<div class="dao-ancestor-discovery">`;
            html += `<h2 style="text-align:center;color:#ffd700;">${layer.name}</h2>`;

            if (event.type === 'ancestor') {
                const ancestor = DAO_ANCESTORS.find(a => a.name.includes(event.title.replace('🎉 发现道祖: ', '')));
                html += `
                    <div class="dao-ancestor-portrait">${ancestor ? ancestor.icon : '👻'}</div>
                    <div class="dao-ancestor-name">${event.title.replace('🎉 发现道祖: ', '')}</div>
                    <div class="dao-ancestor-quote">"${event.desc.replace(/"/g, '')}"</div>
                    <div class="dao-ancestor-blessing">✨ 祝福: ${event.blessing}</div>
                `;
            } else if (event.type === 'seal') {
                const seal = HEAVENLY_SEALS.find(s => s.name === event.title.replace('🔮 获得天道印记: ', ''));
                html += `
                    <div class="heavenly-seal-icon" style="font-size:3em;">${seal ? seal.icon : '🔮'}</div>
                    <div class="heavenly-seal-name">${event.title.replace('🔮 获得天道印记: ', '')}</div>
                    <div class="heavenly-seal-desc">${event.desc}</div>
                    <div class="heavenly-seal-count">${event.effect}</div>
                `;
            } else if (event.type === 'law_progress') {
                html += `
                    <div style="font-size:3em;">📜</div>
                    <div style="color:#ffd700;font-size:1.2em;">${event.title}</div>
                    <div style="color:#b0b0b0;margin:15px 0;">${event.desc}</div>
                    <div style="color:#4caf50;">当前领悟进度: ${event.progress}/${gameState.thirtyThreeHeavens.maxLawInsight}</div>
                `;
            } else if (event.type === 'danger') {
                html += `
                    <div style="font-size:3em;">⚔️</div>
                    <div style="color:#f44336;font-size:1.2em;">${event.title}</div>
                    <div style="color:#b0b0b0;margin:15px 0;">${event.desc}</div>
                `;
            }

            html += `
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn btn-cultivate" onclick="renderBeyondHeaven(); document.getElementById('beyondHeavenModal').classList.add('active');">返回天外天</button>
                </div>
            </div>`;

            content.innerHTML = html;
            modal.classList.add('active');
        }

        // 领悟天道法则
        function comprehendLaw(lawId) {
            tth = gameState.thirtyThreeHeavens;
            const law = HEAVENLY_LAWS.find(l => l.id === lawId);
            if (!law) return;

            // 检查是否已领悟
            if (tth.lawsComprehended.includes(lawId)) {
                addLog('neutral', '法则领悟', `你已经领悟了${law.name}`);
                return;
            }

            // 检查领悟进度
            if (tth.currentLawInsight < 50) {
                addLog('neutral', '法则领悟', `对${law.name}的领悟还不够深入，需要更多积累...`);
                return;
            }

            // 消耗进度并领悟
            tth.currentLawInsight = 0;
            tth.lawsComprehended.push(lawId);
            
            // 根据法则类型给予特殊效果
            switch(lawId) {
                case 'destiny':
                    gameState.luck = (gameState.luck || 0) + 15;
                    break;
                case 'reincarnation':
                    gameState.maxLifeSpan = (gameState.maxLifeSpan || 100) * 1.2;
                    break;
                case 'time':
                    gameState.cultivationSpeed = (gameState.cultivationSpeed || 1) * 1.15;
                    break;
                case 'void':
                    gameState.mindControlResistance = (gameState.mindControlResistance || 0) + 25;
                    break;
                case 'creation':
                    gameState.breakthroughBonus = (gameState.breakthroughBonus || 0) + 20;
                    break;
                case 'primordial':
                    // 全属性提升
                    gameState.qi = (gameState.qi || 0) * 1.1;
                    gameState.spiritStones = (gameState.spiritStones || 0) * 1.1;
                    break;
            }

            addLog('good', '法则领悟', `恭喜！你对${law.name}有了更深的理解！${law.desc}`);
            
            // 检查是否全部领悟，触发特殊事件
            if (tth.lawsComprehended.length === HEAVENLY_LAWS.length) {
                addLog('story', '终极成就', '你已领悟全部天道法则！距离超脱永恒只差一步之遥...');
            }

            saveGame();
            updateDisplay();
        }

        // 检查是否可以领悟法则
        function checkLawComprehension() {
            tth = gameState.thirtyThreeHeavens;
            
            // 每次探索增加领悟进度
            tth.currentLawInsight = Math.min(tth.maxLawInsight, tth.currentLawInsight + 5);
            
            // 如果进度满了，提示可以领悟
            if (tth.currentLawInsight >= 50) {
                addLog('neutral', '法则领悟', '你对某条天道法则的领悟已经足够深厚，可以尝试领悟了！');
            }
        }

        // 选择天外天区域
        function selectBeyondArea(areaName) {
            initBeyondHeaven();
            gameState.beyondHeaven.selectedArea = areaName;
            renderBeyondHeaven();
        }

        // 探索天外天区域
        function exploreBeyondArea() {
            const bh = gameState.beyondHeaven;
            if (!bh.selectedArea) return;

            const areaName = bh.selectedArea;
            const regionData = REGIONS[areaName];
            if (!regionData) return;

            // 标记为已探索
            if (!bh.exploredAreas.includes(areaName)) {
                bh.exploredAreas.push(areaName);
            }

            // 根据区域类型生成探索结果
            let result = generateBeyondExploreResult(areaName, regionData);

            // 添加神秘日志
            bh.mysteryLogs.push({
                title: result.title,
                text: result.description,
                area: areaName,
                day: gameState.days
            });
            bh.totalMysteries++;

            // 增加天外天灵力
            bh.spiritualPower = Math.min(bh.maxSpiritualPower, bh.spiritualPower + result.powerGain);

            // 应用奖励/惩罚
            if (result.qi) {
                gameState.qi = Math.min(gameState.maxQi, gameState.qi + result.qi);
            }
            if (result.spiritStones) {
                gameState.spiritStones = Math.max(0, gameState.spiritStones + result.spiritStones);
            }
            if (result.mindset) {
                gameState.mindset = Math.max(0, Math.min(100, gameState.mindset + result.mindset));
            }

            // 添加日志
            addLog('good', '天外天探索', `${areaName}：${result.description}`);

            // 显示结果
            showBeyondExploreResult(result);

            saveGame();
            updateDisplay();
        }

        // 生成天外天探索结果
        function generateBeyondExploreResult(areaName, regionData) {
            const roll = Math.random();
            const bh = gameState.beyondHeaven;

            // 基础结果
            let result = {
                title: '',
                description: '',
                qi: 0,
                spiritStones: 0,
                mindset: 0,
                powerGain: 5,
                item: null,
                success: true
            };

            // 秘境类型
            if (regionData.type === 'secret') {
                if (roll < 0.15) {
                    // 大成功
                    result.title = '✨ 惊天机缘 ✨';
                    result.description = `在${areaName}中，你意外发现了一处未曾被人触及的秘境核心！`;
                    result.qi = 500;
                    result.spiritStones = 5000;
                    result.mindset = 20;
                    result.powerGain = 30;
                    result.item = getBeyondSecretItem(areaName);
                } else if (roll < 0.5) {
                    // 成功
                    result.title = '🌟 有所收获';
                    result.description = `探索${areaName}，你领悟了宇宙法则的一丝奥秘。`;
                    result.qi = 200;
                    result.spiritStones = 1000;
                    result.powerGain = 15;
                } else {
                    // 普通
                    result.title = '🔍 略有发现';
                    result.description = `${areaName}的探索让你对天道有了更深的理解。`;
                    result.qi = 50;
                    result.powerGain = 5;
                }
            }
            // 野外类型
            else if (regionData.type === 'wild') {
                if (roll < 0.2) {
                    // 遭遇强敌
                    result.title = '⚔️ 遭遇强敌';
                    result.description = `${regionData.monsters ? regionData.monsters[0] : '神秘存在'}出现！经历一番激战，你侥幸脱身。`;
                    result.qi = -100;
                    result.mindset = -10;
                    result.powerGain = 10;
                } else if (roll < 0.6) {
                    // 收获资源
                    result.title = '💎 资源发现';
                    result.description = `在${areaName}发现了珍贵的${regionData.resources ? regionData.resources[0] : '神秘资源'}！`;
                    result.spiritStones = 2000;
                    result.powerGain = 15;
                } else {
                    // 普通探索
                    result.title = '🌌 感悟天道';
                    result.description = `${areaName}的虚空之中，你静心感悟宇宙变化。`;
                    result.qi = 100;
                    result.mindset = 5;
                    result.powerGain = 10;
                }
            }
            // 首领类型
            else if (regionData.type === 'boss') {
                if (roll < 0.25) {
                    // 击败首领
                    result.title = '🏆 击败首领';
                    result.description = `你与${regionData.bossName}展开惊天一战，将其击败！`;
                    result.qi = 800;
                    result.spiritStones = 10000;
                    result.mindset = 30;
                    result.powerGain = 50;
                    result.item = regionData.resources ? regionData.resources[0] : '轮回法则';
                } else if (roll < 0.5) {
                    // 平局撤退
                    result.title = '⚡ 势均力敌';
                    result.description = `与${regionData.bossName}的对决中，你认识到自己的不足，选择暂退。`;
                    result.qi = -50;
                    result.mindset = 10;
                    result.powerGain = 15;
                } else {
                    // 探索遗迹
                    result.title = '🏛️ 遗迹探索';
                    result.description = `虽然未能遇见${regionData.bossName}，但你探索了周围的遗迹。`;
                    result.qi = 150;
                    result.powerGain = 10;
                }
            }

            return result;
        }

        // 获取天外天秘宝
        function getBeyondSecretItem(areaName) {
            const items = {
                '天道碎片': '天道法则碎片',
                '命运长河': '命运之水',
                '轮回之地': '轮回法则',
                '大道之树': '大道之果',
                '永恒星域': '永恒星核'
            };
            return items[areaName] || '神秘法则';
        }

        // 显示探索结果
        function showBeyondExploreResult(result) {
            let content = `
                <div class="result-title" style="color:#ffd700;text-align:center;font-size:1.5em;margin-bottom:15px;">
                    ${result.title}
                </div>
                <div style="background:rgba(0,0,0,0.4);padding:20px;border-radius:10px;margin-bottom:20px;">
                    <p style="color:#ccc;line-height:1.8;margin-bottom:15px;">${result.description}</p>
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
            `;

            if (result.qi !== 0) {
                const color = result.qi > 0 ? '#4caf50' : '#f44336';
                content += `<div style="color:${color};text-align:center;">灵气 ${result.qi > 0 ? '+' : ''}${result.qi}</div>`;
            }
            if (result.spiritStones !== 0) {
                const color = result.spiritStones > 0 ? '#4caf50' : '#f44336';
                content += `<div style="color:${color};text-align:center;">灵石 ${result.spiritStones > 0 ? '+' : ''}${result.spiritStones}</div>`;
            }
            if (result.mindset !== 0) {
                const color = result.mindset > 0 ? '#4caf50' : '#f44336';
                content += `<div style="color:${color};text-align:center;">心境 ${result.mindset > 0 ? '+' : ''}${result.mindset}</div>`;
            }
            if (result.powerGain > 0) {
                content += `<div style="color:#9c27b0;text-align:center;">天外天灵力 +${result.powerGain}</div>`;
            }
            if (result.item) {
                content += `<div style="color:#ffd700;text-align:center;">获得：${result.item}</div>`;
            }

            content += `
                    </div>
                </div>
                <button class="close-btn" onclick="closeBeyondResult()">继续探索</button>
            `;

            openModal('🌌 天外天探索结果', content, []);
        }



        // 更新天外天按钮显示
        function updateBeyondHeavenButton() {
            const btn = document.getElementById('beyondHeavenBtn');
            if (btn && gameState.beyondHeaven && gameState.beyondHeaven.unlocked) {
                btn.style.display = 'inline-block';
            }
        }





        // ===== selectContinent =====
        function selectContinent(continentName) {
            renderWorldMap(continentName);
        }

        // ===== selectRegion =====
        function selectRegion(regionName) {
            const wm = gameState.worldMap;
            const regionData = REGIONS[regionName];
            if (!regionData) return;

            // 如果是当前区域，显示进入选项
            if (wm.currentRegion === regionName) {
                enterRegion(regionName);
            } else {
                // 前往该大陆
                const continentName = Object.keys(CONTINENTS).find(c => CONTINENTS[c].regions.includes(regionName));
                if (continentName && gameState.realm >= CONTINENTS[continentName].requiredRealm) {
                    travelToContinent(continentName, regionName);
                }
            }
        }

        // ===== travelToContinent =====
        function travelToContinent(continentName, targetRegion = null) {
            const wm = gameState.worldMap;
            if (wm.actionPower < 1) {
                alert('行动力不足！');
                return;
            }
            if (wm.lastTravelDay >= gameState.days) {
                alert('今日已移动过，每天最多移动2次！');
                return;
            }

            wm.actionPower -= 1;
            wm.lastTravelDay = gameState.days;
            wm.currentContinent = continentName;

            // 探索新大陆
            if (!wm.exploredContinents.includes(continentName)) {
                wm.exploredContinents.push(continentName);
                addLog('good', '新大陆', `发现了${continentName}！这是一片新的领域。`);
            }

            // 设置区域
            if (targetRegion) {
                wm.currentRegion = targetRegion;
            } else {
                // 默认进入该大陆的第一个安全区
                const continentData = CONTINENTS[continentName];
                const safeRegion = continentData.regions.find(r => REGIONS[r] && REGIONS[r].type === 'safe') || continentData.regions[0];
                wm.currentRegion = safeRegion;
            }

            gameState.days += 1;
            addLog('neutral', '旅行', `经过1天跋涉，你来到了${continentName}的${wm.currentRegion}。`);

            saveGame();
            updateDisplay();
            renderWorldMap(continentName);
            checkDailyEffects();
        }

        // ===== enterRegion =====
        function enterRegion(regionName) {
            const wm = gameState.worldMap;
            const regionData = REGIONS[regionName];
            if (!regionData) return;

            wm.currentRegion = regionName;

            // 探索新区域
            if (!wm.exploredRegions.includes(regionName)) {
                wm.exploredRegions.push(regionName);
                addLog('good', '探索', `探索了${regionName}！`);
            }

            // 根据区域类型触发事件
            if (regionData.type === 'safe') {
                addLog('neutral', '安全区域', regionData.description);
                // 安全区休息，恢复少量灵气
                const recover = Math.floor(gameState.maxQi * 0.1);
                gameState.qi = Math.min(gameState.maxQi, gameState.qi + recover);
                addLog('good', '休息', `在${regionName}休息，恢复${recover}灵气。`);
            } else if (regionData.type === 'wild') {
                // 野外区，强制战斗
                triggerWildEncounter(regionName);
            } else if (regionData.type === 'boss') {
                // 首领区
                triggerBossEncounter(regionName);
            } else if (regionData.type === 'secret') {
                // 秘境入口
                triggerSecretRealm(regionName);
            }

            saveGame();
            updateDisplay();
            renderWorldMap(wm.currentContinent);
        }

        // ===== triggerWildEncounter =====
        function triggerWildEncounter(regionName) {
            const regionData = REGIONS[regionName];
            if (!regionData || regionData.monsters.length === 0) {
                addLog('neutral', '探索', `在${regionName}探索，未发现妖兽。`);
                return;
            }

            const monsterName = regionData.monsters[Math.floor(Math.random() * regionData.monsters.length)];
            const levelRange = regionData.monsterLevel || [1, 10];
            const level = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];

            // 随机事件
            const eventRoll = Math.random();
            if (eventRoll < 0.4) {
                // 40% 遭遇战斗
                startMonsterBattle(monsterName, level, regionData);
            } else if (eventRoll < 0.6) {
                // 20% 发现资源
                const resource = regionData.resources[Math.floor(Math.random() * regionData.resources.length)];
                addLog('good', '发现资源', `在${regionName}发现了${resource}！`);
                if (Math.random() < 0.5) {
                    addToInventory('material', resource, 1, 'common');
                }
            } else if (eventRoll < 0.7) {
                // 10% 遇到商人
                const bonus = Math.floor(Math.random() * 20) + 10;
                gameState.spiritStones += bonus;
                addLog('good', '遇到商人', `在${regionName}遇到行商，获得${bonus}灵石！`);
            } else if (eventRoll < 0.85) {
                // 15% 触发奇遇
                addLog('neutral', '奇遇', `在${regionName}感受到灵气波动，似乎有奇遇降临...`);
                if (Math.random() < 0.3) {
                    triggerRandomSerendipity();
                }
            } else {
                // 15% 无事发生
                addLog('neutral', '探索', `在${regionName}探索，未有特殊发现。`);
            }
        }

        // ===== triggerBossEncounter =====
        function triggerBossEncounter(regionName) {
            const regionData = REGIONS[regionName];
            if (!regionData) return;

            const bossName = regionData.bossName || regionData.monsters[0];
            const bossLevel = regionData.monsterLevel ? regionData.monsterLevel[0] : 30;

            // 检查首领是否刷新
            const wm = gameState.worldMap;
            const lastDefeatDay = wm.bossRefreshDays[regionName] || 0;
            const daysSinceDefeat = gameState.days - lastDefeatDay;

            if (daysSinceDefeat < 7 && lastDefeatDay > 0) {
                addLog('neutral', '首领', `${bossName}尚未刷新，还需${7 - daysSinceDefeat}天。`);
                // 普通野外事件
                triggerWildEncounter(regionName);
                return;
            }

            // 首领战斗
            startBossBattle(bossName, bossLevel, regionName);
        }

        // ===== startMonsterBattle =====
        function startMonsterBattle(monsterName, level, regionData) {
            const playerPower = calculatePlayerPower();

            if (playerPower < level * 10) {
                // 实力不足，有风险
                const fleeChance = 0.3 + (gameState.activeEffects.escape || 0) * 0.1;
                if (Math.random() < fleeChance) {
                    addLog('neutral', '遭遇', `遭遇${monsterName}，你选择避战绕行。`);
                    return;
                } else {
                    // 战斗失败
                    const stoneLoss = Math.floor(gameState.spiritStones * 0.2);
                    gameState.spiritStones -= stoneLoss;
                    addLog('bad', '战斗失败', `不是${monsterName}的对手，损失${stoneLoss}灵石！`);
                    return;
                }
            }

            // 战斗成功
            const expGain = level * 5;
            gameState.cultivationProgress += expGain;
            addLog('good', '战斗胜利', `击败${monsterName}，获得${expGain}修为！`);

            // 掉落材料
            if (regionData.resources && Math.random() < 0.5) {
                const resource = regionData.resources[Math.floor(Math.random() * regionData.resources.length)];
                addToInventory('material', resource, 1, 'common');
                addLog('good', '获得材料', `获得${resource}！`);
            }

            // 消耗行动力
            const wm = gameState.worldMap;
            wm.actionPower = Math.max(0, wm.actionPower - 1);
        }

        // ===== startBossBattle =====
        function startBossBattle(bossName, bossLevel, regionName) {
            const playerPower = calculatePlayerPower();

            addLog('neutral', '首领出现', `${bossName}出现在${regionName}！这是一场硬仗！`);

            if (playerPower < bossLevel * 15) {
                // 实力不足
                const stoneLoss = Math.floor(gameState.spiritStones * 0.3);
                gameState.spiritStones -= stoneLoss;
                addLog('bad', '首领击败', `${bossName}太强了！损失${stoneLoss}灵石！`);
                return;
            }

            // 首领战斗
            const wm = gameState.worldMap;
            const expGain = bossLevel * 20;
            gameState.cultivationProgress += expGain;
            wm.bossRefreshDays[regionName] = gameState.days;

            addLog('good', '首领击败', `艰难击败${bossName}！获得${expGain}修为！`);

            // A5 成就检查 - 秘境首领击杀
            if (!gameState.achievements) gameState.achievements = { unlocked: [], titles: [], stats: {}, progress: {}, claimedStages: {}, seasonPoints: 0, seasonRewards: [] };
            gameState.achievements.stats.dungeonBossesKilled++;
            checkAchievements();

            // 稀有掉落
            const regionData = REGIONS[regionName];
            if (regionData && regionData.resources && Math.random() < 0.7) {
                const resource = regionData.resources[Math.floor(Math.random() * regionData.resources.length)];
                const quality = Math.random() < 0.3 ? 'rare' : 'precious';
                addToInventory('material', resource, 1, quality);
                addLog('good', '稀有掉落', `获得稀有材料${resource}！`);
            }

            wm.actionPower = Math.max(0, wm.actionPower - 2);
        }

        // ===== triggerSecretRealm =====
        function triggerSecretRealm(regionName) {
            const regionData = REGIONS[regionName];
            if (!regionData || !regionData.secretRealm) return;

            const realmData = SECRET_REALMS[regionData.secretRealm];
            if (!realmData) return;

            // 检查秘境令
            const token = gameState.inventory.find(i => i.type === 'material' && i.name === '秘境令');
            if (!token) {
                addLog('neutral', '秘境', `${regionData.secretRealm}需要秘境令才能进入。`);
                // 可以触发其他事件
                if (Math.random() < 0.5) {
                    triggerWildEncounter(regionName);
                }
                return;
            }

            // 消耗秘境令
            removeFromInventory('秘境令', 1);

            addLog('good', '进入秘境', `消耗秘境令，进入${regionData.secretRealm}！`);

            // 秘境探索结果
            if (Math.random() < realmData.successRate) {
                // 成功
                const reward = realmData.reward;
                if (reward === '入门功法') {
                    addToInventory('technique', '青云诀', 1, 'spirit', '修炼速度+10%', '基础功法', '📖', 1, 0, 1, 5);
                } else if (reward === '冰系功法') {
                    addToInventory('technique', '冰魄心法', 1, 'heaven', '冰系亲和+15', '高阶冰系功法', '❄️', 1, 2, 1, 5);
                } else if (reward === '混沌石') {
                    addToInventory('material', '混沌石', 1, 'legendary');
                } else if (reward === '龙族材料') {
                    addToInventory('material', '龙鳞', 1, 'precious');
                } else if (reward === '飞升道具') {
                    addToInventory('material', '飞升丹', 1, 'legendary');
                } else if (reward === '飞升丹') {
                    addToInventory('material', '飞升丹', 1, 'legendary');
                }
                addLog('good', '秘境探索', `在${regionData.secretRealm}获得${reward}！`);
            } else {
                // 失败
                addLog('bad', '秘境失败', `${regionData.secretRealm}探索失败，未能获得奖励。`);
            }

            const wm = gameState.worldMap;
            wm.actionPower = Math.max(0, wm.actionPower - 2);
        }

        // ===== calculatePlayerPower =====
        function calculatePlayerPower() {
            let power = gameState.realm * 50 + gameState.stage * 20 + Math.floor(gameState.qi / 10);
            power += gameState.activeEffects.attack || 0;
            power += gameState.activeEffects.all_stats || 0;

            // 装备加成
            for (const equip of gameState.equippedTreasures) {
                if (equip && equip.effect) {
                    if (typeof equip.effect === 'number') {
                        power += equip.effect;
                    }
                }
            }

            return power;
        }

        // ===== removeFromInventory =====
        function removeFromInventory(itemName, quantity) {
            const idx = gameState.inventory.findIndex(i => i.name === itemName);
            if (idx !== -1) {
                gameState.inventory[idx].quantity -= quantity;
                if (gameState.inventory[idx].quantity <= 0) {
                    gameState.inventory.splice(idx, 1);
                }
            }
        }

        // ===== updateMinimapDisplay =====
        function updateMinimapDisplay() {
            const minimapEl = document.getElementById('minimapDisplay');
            if (minimapEl && gameState.worldMap) {
                const wm = gameState.worldMap;
                const continentIcon = CONTINENTS[wm.currentContinent]?.icon || '🏰';
                minimapEl.innerHTML = `<span class="minimap-icon">${continentIcon}</span><span class="minimap-text">${wm.currentContinent}</span>`;
            }
        }

// ===== init.js =====

        // ===== init =====
        function init() {
            loadMiniMaxConfig();
            updateDisplay();
        }

        // ===== loadMiniMaxConfig =====
        function loadMiniMaxConfig() {
            const saved = localStorage.getItem(CONFIG.miniMaxConfigKey);
            if (saved) {
                try {
                    miniMaxConfig = JSON.parse(saved);
                    // 确保features结构完整
                    if (!miniMaxConfig.features) {
                        miniMaxConfig.features = { ...DEFAULT_MINIMAX_CONFIG.features };
                    }
                } catch (e) {
                    miniMaxConfig = { ...DEFAULT_MINIMAX_CONFIG };
                }
            }
        }

        // ===== startNewGame =====
        function startNewGame(fromReincarnation = false) {
            let reincarnationData = null;
            
            // 如果是从轮回转世来的，恢复转世数据
            if (fromReincarnation) {
                const saved = localStorage.getItem('reincarnationData');
                if (saved) {
                    reincarnationData = JSON.parse(saved);
                }
            }
            
            gameState = {
                realm: 0,
                stage: 0,
                qi: 20,
                maxQi: 100,
                spiritStones: 50,
                mindset: 50,
                days: 1,
                cultivationProgress: 0,
                eventLog: [],
                isGameOver: false,
                isVictory: false,
                inventory: [],
                equippedTreasures: [null, null, null, null],
                maxInventorySlots: 20,
                shopItems: [],
                lastShopDay: 0,
                shopRefreshCount: 0, // 经济调整：商店刷新次数计数器，用于递增刷新费用
                activeEffects: {
                    breakthrough_boost: 0,
                    cultivate_speed: 0,
                    渡劫_mindset_protect: 0,
                    attack: 0,
                    defense: 0,
                    cultivate_qi_rate: 0,
                    渡劫_damage_reduce: 0,
                    escape: 0,
                    foresee_event: 0,
                    all_stats: 0
                },
                tribulation: {
                    inProgress: false,
                    currentStage: 0,
                    totalStages: 9,
                    currentType: null,
                    preparations: [],
                    damageTaken: 0,
                    tribKey: null
                },
                hasTransmigrationBuff: false,
                tribulationRecord: [],
                // 仙界经济系统
                celestialEconomy: {
                    immortalStones: 0,
                    exchangeRate: 100,
                    totalExchanged: 0,
                    investments: [],
                    marketItems: [],
                    lastMarketRefresh: 0,
                    totalEarned: 0,
                    celestialReputation: 0
                },
                combat: {
                    wins: 0,
                    losses: 0,
                    honor: 0,
                    fame: 0,
                    battleHistory: [],
                    injured: false,
                    injuryEndDay: 0
                },
                sect: {
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
                },
                // V14 仙宫系统
                palace: {
                    name: null,
                    level: 1,
                    spiritStones: 0,
                    reputation: 0,
                    rooms: [],
                    disciples: [],
                    lastProductionDay: 0,
                    decorationBonus: 0
                },
                // V6 奇遇系统字段
                serendipity: {
                    lastTriggerDay: 0,
                    todayCount: 0,
                    lastTriggerType: null,
                    cooldownTypes: {},
                    badLuck: 0,
                    currentEvent: null,
                    log: [],
                    luckStatus: null,
                    luckEndDay: 0,
                    serendipityBoostEndDay: 0
                },
                // V7 灵根/体质系统
                spiritRoot: generateRandomSpiritRoot(),
                constitutions: [],
                // V8 丹药炼器系统
                crafting: {
                    furnace: { level: 1, type: 'alchemy' },
                    anvil: { level: 1, type: 'forge' },
                    transactionLog: []
                },
                // V9 世界地图系统
                worldMap: {
                    currentContinent: '中州',
                    currentRegion: '中州城',
                    exploredContinents: ['中州'],
                    exploredRegions: ['中州城', '中州野外'],
                    actionPower: 10,
                    maxActionPower: 10,
                    continentUnlocks: {
                        '中州': 0,
                        '南疆': 1,
                        '北域': 2,
                        '西域': 3,
                        '东海': 2,
                        '仙界碎片': 4
                    },
                    bossRefreshDays: {},
                    lastTravelDay: 0
                },
                // E1 NPC对话记忆
                npcMemory: [],
                // B 成就/称号系统
                title: '筑基修士',
                achievements: {
                    unlocked: [],
                    titles: [],
                    stats: {
                        tribulationsCompleted: 0,
                        dungeonBossesKilled: 0,
                        sectContributions: 0,
                        treasuresRefined: 0,
                        serendipitiesEncountered: 0,
                        flawlessTribulations: 0
                    }
                },
                pets: [],
                summonedPet: null,
                petBreedingCooldowns: {},
                petEggs: [],
                selectedBreedingPet1: null,
                selectedBreedingPet2: null,
                breedingResult: null,
                // V15 轮回转世系统
                reincarnation: reincarnationData ? {
                    count: reincarnationData.count,
                    soulAge: reincarnationData.soulAge,
                    pastLifeMemories: reincarnationData.pastLifeMemories || [],
                    rebirthCultivation: reincarnationData.rebirthCultivation,
                    hasReincarnatedBuff: reincarnationData.count > 0,
                    reincarnatedFromAchievement: false
                } : {
                    count: 0,
                    soulAge: 0,
                    pastLifeMemories: [],
                    rebirthCultivation: 0,
                    hasReincarnatedBuff: false,
                    reincarnatedFromAchievement: false
                },
                // 天外天探索系统
                beyondHeaven: {
                    unlocked: false,
                    exploredAreas: [],
                    totalMysteries: 0,
                    mysteryLogs: [],
                    selectedArea: null,
                    spiritualPower: 0,
                    maxSpiritualPower: 100
                },
                // V48 插件系统
                plugins: {
                    installed: {},
                    enabled: [],
                    favorites: []
                },
                // V50 提案系统
                proposals: {
                    submitted: [],
                    nextId: 1
                }
            };

            // 如果是转世重修，应用灵魂修为加成
            if (fromReincarnation && reincarnationData && reincarnationData.rebirthCultivation > 0) {
                const bonus = reincarnationData.rebirthCultivation;
                // 根据保留的灵魂修为给予加成
                // 每100点灵魂修为：初始灵气+10，最大灵气+10，心境+5
                const qiBonus = Math.floor(bonus / 10) * 10;
                const maxQiBonus = Math.floor(bonus / 10) * 10;
                const mindsetBonus = Math.floor(bonus / 20) * 5;
                
                gameState.qi = Math.min(gameState.qi + qiBonus, gameState.maxQi + maxQiBonus);
                gameState.maxQi += maxQiBonus;
                gameState.mindset = Math.min(100, gameState.mindset + mindsetBonus);
                
                // 显示转世欢迎信息
                addLog('good', '转世觉醒', 
                    `灵魂觉醒！你保留了 ${bonus} 点灵魂修为。<br>` +
                    `初始灵气 +${qiBonus}，最大灵气 +${maxQiBonus}，心境 +${mindsetBonus}<br>` +
                    `转世次数：${reincarnationData.count}，当前灵魂修为：${reincarnationData.soulAge}`);
                
                // 如果有前世记忆，显示第一条
                if (reincarnationData.pastLifeMemories && reincarnationData.pastLifeMemories.length > 0) {
                    addLog('neutral', '前世记忆', reincarnationData.pastLifeMemories[reincarnationData.pastLifeMemories.length - 1]);
                }
            }
            
            saveGame();
            showGameUI();
            
            // 只有非转世才显示欢迎消息
            if (!fromReincarnation) {
                addLog('welcome', '欢迎', '你踏入修仙之路，成为一名炼气期修士。吸收天地灵气，开启你的修仙之旅！');
            }
        }

        // ===== loadGame =====
        function loadGame() {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const loaded = JSON.parse(saved);
                // 确保V2新增字段存在（向后兼容）
                gameState = {
                    ...gameState,
                    ...loaded,
                    activeEffects: loaded.activeEffects || {
                        breakthrough_boost: 0,
                        cultivate_speed: 0,
                        渡劫_mindset_protect: 0,
                        attack: 0,
                        defense: 0,
                        cultivate_qi_rate: 0,
                        渡劫_damage_reduce: 0,
                        escape: 0,
                        foresee_event: 0,
                        all_stats: 0
                    },
                    equippedTreasures: loaded.equippedTreasures || [null, null, null, null],
                    inventory: loaded.inventory || [],
                    shopItems: loaded.shopItems || [],
                    lastShopDay: loaded.lastShopDay || 0,
                    tribulation: loaded.tribulation || {
                        inProgress: false,
                        currentStage: 0,
                        totalStages: 9,
                        currentType: null,
                        preparations: [],
                        damageTaken: 0,
                        tribKey: null
                    },
                    hasTransmigrationBuff: loaded.hasTransmigrationBuff || false,
                    tribulationRecord: loaded.tribulationRecord || [],
                    combat: loaded.combat || {
                        wins: 0,
                        losses: 0,
                        honor: 0,
                        fame: 0,
                        battleHistory: [],
                        injured: false,
                        injuryEndDay: 0
                    },
                    sect: loaded.sect || {
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
                    },
                    serendipity: loaded.serendipity || {
                        lastTriggerDay: 0,
                        todayCount: 0,
                        lastTriggerType: null,
                        cooldownTypes: {},
                        badLuck: 0,
                        currentEvent: null,
                        log: [],
                        luckStatus: null,
                        luckEndDay: 0,
                        serendipityBoostEndDay: 0
                    },
                    // V7 灵根/体质系统
                    spiritRoot: loaded.spiritRoot || generateRandomSpiritRoot(),
                    constitutions: loaded.constitutions || [],
                    // V8 丹药炼器系统
                    crafting: loaded.crafting || {
                        furnace: { level: 1, type: 'alchemy' },
                        anvil: { level: 1, type: 'forge' },
                        transactionLog: []
                    },
                    // V9 世界地图系统
                    worldMap: loaded.worldMap || {
                        currentContinent: '中州',
                        currentRegion: '中州城',
                        exploredContinents: ['中州'],
                        exploredRegions: ['中州城', '中州野外'],
                        actionPower: 10,
                        maxActionPower: 10,
                        continentUnlocks: {
                            '中州': 0,
                            '南疆': 1,
                            '北域': 2,
                            '西域': 3,
                            '东海': 2,
                            '仙界碎片': 4
                        },
                        bossRefreshDays: {},
                        lastTravelDay: 0
                    }
                };
                // E1 确保npcMemory字段存在（向后兼容）
                if (!gameState.npcMemory) gameState.npcMemory = [];
                // B 成就/称号系统向后兼容
                if (!gameState.title) gameState.title = '筑基修士';
                if (!gameState.achievements) {
                    gameState.achievements = {
                        unlocked: [],
                        titles: [],
                        stats: {
                            tribulationsCompleted: 0,
                            dungeonBossesKilled: 0,
                            sectContributions: 0,
                            treasuresRefined: 0,
                            serendipitiesEncountered: 0,
                            flawlessTribulations: 0
                        },
                        progress: {},
                        claimedStages: {},
                        seasonPoints: 0,
                        seasonRewards: []
                    };
                }
                // V28 新字段向后兼容
                if (!gameState.achievements.progress) gameState.achievements.progress = {};
                if (!gameState.achievements.claimedStages) gameState.achievements.claimedStages = {};
                if (!gameState.achievements.seasonPoints) gameState.achievements.seasonPoints = 0;
                if (!gameState.achievements.seasonRewards) gameState.achievements.seasonRewards = [];
                if (!gameState.equippedFrame) gameState.equippedFrame = null;
                if (!gameState.equippedBubble) gameState.equippedBubble = null;
                if (!gameState.currentSeason) gameState.currentSeason = 's1';
                if (!gameState.displaySettings) gameState.displaySettings = { showTitle: true, showFrame: true, showBubble: true };
                // 仙宠系统向后兼容
                if (!gameState.pets) gameState.pets = [];
                if (!gameState.summonedPet) gameState.summonedPet = null;
                if (!gameState.petBreedingCooldowns) gameState.petBreedingCooldowns = {};
                if (!gameState.petEggs) gameState.petEggs = [];
                if (gameState.selectedBreedingPet1 === undefined) gameState.selectedBreedingPet1 = null;
                if (gameState.selectedBreedingPet2 === undefined) gameState.selectedBreedingPet2 = null;
                // 天外天系统向后兼容
                if (!gameState.beyondHeaven) {
                    gameState.beyondHeaven = {
                        unlocked: false,
                        exploredAreas: [],
                        totalMysteries: 0,
                        mysteryLogs: [],
                        selectedArea: null,
                        spiritualPower: 0,
                        maxSpiritualPower: 100
                    };
                }
                // 仙界经济系统向后兼容
                if (!gameState.celestialEconomy) {
                    gameState.celestialEconomy = {
                        immortalStones: 0,
                        exchangeRate: 100,
                        totalExchanged: 0,
                        investments: [],
                        marketItems: [],
                        lastMarketRefresh: 0,
                        totalEarned: 0,
                        celestialReputation: 0
                    };
                }
                // 确保activeEffects包含serendipity_boost
                if (!gameState.activeEffects.serendipity_boost) {
                    gameState.activeEffects.serendipity_boost = 0;
                }
                // 初始化体质效果
                initializeConstitutionEffects();
                // 重新计算装备效果
                recalculateAllEffects();
                // 初始化世界地图
                initWorldMap();
                if (gameState.isGameOver) {
                    showGameOverScreen();
                } else {
                    showGameUI();
                }
            } else {
                alert('没有找到存档！');
            }
        }

        // ===== showGameUI =====
        function showGameUI() {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('apiConfig').classList.add('hidden');
            document.getElementById('gameStats').classList.remove('hidden');
            document.getElementById('cultivationProgress').classList.remove('hidden');
            document.getElementById('equipmentBar').classList.remove('hidden');
            document.getElementById('gameButtons').classList.remove('hidden');
            document.getElementById('eventLog').classList.remove('hidden');
            updateDisplay();
            renderLog();
            updateEquipmentBar();
            // 检查商店刷新
            if (gameState.lastShopDay < gameState.days) {
                refreshShop(true);
            }
            // 重置每日行动力
            if (gameState.worldMap) {
                const wm = gameState.worldMap;
                if (wm.lastTravelDay < gameState.days) {
                    wm.actionPower = wm.maxActionPower;
                    wm.lastTravelDay = 0;
                }
            }
            // 检查宗门按钮显示
            const sectBtn = document.getElementById('sectBtn');
            if (sectBtn) {
                sectBtn.style.display = (gameState.sect && gameState.sect.name) ? 'inline-block' : 'none';
            }
            // 检查仙宫按钮显示
            checkPalaceCreation();

            // 天外天按钮显示 - 飞升后自动解锁
            const beyondHeavenBtn = document.getElementById('beyondHeavenBtn');
            if (beyondHeavenBtn) {
                // 飞升后（realm >= 5 或 beyondHeaven.unlocked）显示按钮
                if (gameState.realm >= 5 || (gameState.beyondHeaven && gameState.beyondHeaven.unlocked)) {
                    beyondHeavenBtn.style.display = 'inline-block';
                    // 自动解锁天外天
                    if (!gameState.beyondHeaven || !gameState.beyondHeaven.unlocked) {
                        unlockBeyondHeaven();
                    }
                } else {
                    beyondHeavenBtn.style.display = 'none';
                }
            }
        }

        // ===== updateDisplay =====
        function updateDisplay() {
            const realmName = CONFIG.realms[gameState.realm];
            const stageName = CONFIG.stages[gameState.stage];
            
            document.getElementById('realmDisplay').textContent = `${realmName}期`;
            document.getElementById('qiDisplay').textContent = `${gameState.qi}/${gameState.maxQi}`;
            document.getElementById('stonesDisplay').textContent = gameState.spiritStones;
            document.getElementById('mindsetDisplay').textContent = gameState.mindset;
            document.getElementById('daysDisplay').textContent = gameState.days;
            
            document.getElementById('realmName').textContent = `${realmName}期`;
            document.getElementById('realmStage').textContent = stageName;

            // A5 更新称号显示
            const titleDisplay = document.getElementById('titleDisplay');
            if (titleDisplay) {
                titleDisplay.textContent = `【${gameState.title || '筑基修士'}】`;
            }

            const req = REALM_REQUIREMENTS[gameState.realm];
            const progressInStage = gameState.stage === 0 ? 
                gameState.cultivationProgress : 
                gameState.cultivationProgress - req.stageThreshold[gameState.stage - 1];
            const stageSize = gameState.stage === 0 ? 
                req.stageThreshold[0] : 
                (req.stageThreshold[gameState.stage] - req.stageThreshold[gameState.stage - 1]);
            const percentage = Math.min(100, (progressInStage / stageSize) * 100);
            
            document.getElementById('cultivationBar').style.width = `${percentage}%`;
            document.getElementById('cultivationBar').textContent = `${Math.round(percentage)}%`;
            
            // V7 更新灵根显示
            updateSpiritRootDisplay();
            
            // V9 更新世界地图显示
            updateMinimapDisplay();
            if (gameState.worldMap) {
                const wm = gameState.worldMap;
                document.getElementById('actionPowerDisplay').textContent = `${wm.actionPower}/${wm.maxActionPower}`;
            }
            
            // V15 更新轮回显示
            const reincarnationDisplay = document.getElementById('reincarnationDisplay');
            if (reincarnationDisplay) {
                const rc = gameState.reincarnation;
                if (rc && rc.count > 0) {
                    reincarnationDisplay.style.display = 'inline-block';
                    document.getElementById('reincarnationStatDisplay').textContent = `${rc.count}次`;
                } else {
                    reincarnationDisplay.style.display = 'none';
                }
            }

            // 仙界经济显示更新
            updateCelestialEconomyDisplay();

            // 三界排行榜PVP按钮更新
            updateRankingPVPButton();
        }

        // ===== 仙界经济系统函数 =====

        // 获取当前兑换汇率
        function getCurrentExchangeRate() {
            const total = gameState.celestialEconomy.totalExchanged;
            let tier = EXCHANGE_TIERS[0];
            for (const t of EXCHANGE_TIERS) {
                if (total >= t.min) tier = t;
            }
            // 声望加成
            const repBonus = getCelestialReputationBonus();
            return Math.floor(tier.rate * (1 - repBonus));
        }

        // 获取仙界声望加成
        function getCelestialReputationBonus() {
            const rep = gameState.celestialEconomy.celestialReputation;
            let level = CELESTIAL_REPUTATION_LEVELS[0];
            for (const l of CELESTIAL_REPUTATION_LEVELS) {
                if (rep >= l.min) level = l;
            }
            return level.bonus;
        }

        // 获取仙界声望等级名称
        function getCelestialReputationName() {
            const rep = gameState.celestialEconomy.celestialReputation;
            let level = CELESTIAL_REPUTATION_LEVELS[0];
            for (const l of CELESTIAL_REPUTATION_LEVELS) {
                if (rep >= l.min) level = l;
            }
            return level.name;
        }

        // 灵石兑换仙石
        function exchangeToImmortalStones(amount) {
            const rate = getCurrentExchangeRate();
            const cost = amount * rate;
            if (gameState.spiritStones < cost) {
                alert(`灵石不足！需要 ${cost} 灵石兑换 ${amount} 仙石`);
                return false;
            }
            gameState.spiritStones -= cost;
            gameState.celestialEconomy.immortalStones += amount;
            gameState.celestialEconomy.totalExchanged += cost;
            // 声望提升
            gameState.celestialEconomy.celestialReputation += Math.floor(amount / 2);
            addLog('good', '灵石兑换', `消耗 ${cost} 灵石，兑换 ${amount} 仙石。当前汇率：1仙石=${rate}灵石`);
            saveGame();
            updateDisplay();
            return true;
        }

        // 仙石兑换灵石
        function exchangeToSpiritStones(amount) {
            const rate = getCurrentExchangeRate();
            const returnAmount = Math.floor(amount * rate * 0.8); // 仙石换灵石有20%损耗
            if (gameState.celestialEconomy.immortalStones < amount) {
                alert(`仙石不足！需要 ${amount} 仙石`);
                return false;
            }
            gameState.celestialEconomy.immortalStones -= amount;
            gameState.spiritStones += returnAmount;
            addLog('neutral', '仙石兑换', `消耗 ${amount} 仙石，兑换 ${returnAmount} 灵石（损耗20%）`);
            saveGame();
            updateDisplay();
            return true;
        }

        // 生成仙界市场物品
        function generateCelestialMarketItems() {
            const items = Object.entries(CELESTIAL_ITEMS).filter(([name, data]) => data.type !== 'investment');
            const count = 5 + Math.floor(Math.random() * 4);
            const shuffled = items.sort(() => Math.random() - 0.5);
            gameState.celestialEconomy.marketItems = shuffled.slice(0, Math.min(count, items.length));
            gameState.celestialEconomy.lastMarketRefresh = gameState.days;
            saveGame();
        }



        // 切换仙界商行标签页
        function switchCelestialTab(tab) {
            document.querySelectorAll('.celestial-tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            const content = document.getElementById('celestialTabContent');
            if (tab === 'market') {
                content.innerHTML = renderCelestialMarketTab();
            } else if (tab === 'invest') {
                content.innerHTML = renderCelestialInvestTab();
            } else if (tab === 'records') {
                content.innerHTML = renderCelestialRecordsTab();
            }
        }





        // 渲染记录标签页
        function renderCelestialRecordsTab() {
            const ce = gameState.celestialEconomy;
            let html = '<div style="color:#aaa;margin-bottom:15px;">仙界商行记录</div>';

            html += '<div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;margin-bottom:15px;">';
            html += `<div style="color:#ffd700;">累计收益：${ce.totalEarned.toLocaleString()} 仙石</div>`;
            html += `<div style="color:#aaa;font-size:0.9em;">累计兑换：${ce.totalExchanged.toLocaleString()} 灵石</div>`;
            html += `<div style="color:#e1bee7;font-size:0.9em;">仙界声望：${ce.celestialReputation} (${getCelestialReputationName()})</div>`;
            html += '</div>';

            html += '<div style="color:#ffd700;margin-bottom:10px;">💰 每日收益计算</div>';
            let dailyTotal = 0;
            for (const inv of ce.investments) {
                dailyTotal += inv.dailyReturn;
            }
            if (dailyTotal > 0) {
                html += `<div style="color:#4caf50;font-size:1.1em;">每日仙石收益：+${dailyTotal} 💜</div>`;
            } else {
                html += '<div style="color:#888;">暂无活跃投资</div>';
            }

            return html;
        }

        // 购买仙界物品
        function buyCelestialItem(itemName) {
            const ce = gameState.celestialEconomy;
            const itemData = CELESTIAL_ITEMS[itemName];
            if (!itemData) return;

            if (ce.immortalStones < itemData.price) {
                alert('仙石不足！');
                return;
            }

            if (itemData.type === 'pill') {
                // 丹药直接使用
                ce.immortalStones -= itemData.price;
                applyCelestialEffect(itemData.effect);
                addLog('good', '仙界购物', `购买了 ${itemData.icon} ${itemName}！${itemData.desc}`);
            } else if (itemData.type === 'treasure') {
                // 宝物添加到背包
                ce.immortalStones -= itemData.price;
                if (gameState.inventory.length >= gameState.maxInventorySlots) {
                    alert('背包已满！');
                    ce.immortalStones += itemData.price;
                    return;
                }
                addToInventory('treasure', itemName, 1, 'legendary', itemData.effect, itemData.desc, itemData.icon);
                addLog('good', '仙界购物', `购买了 ${itemData.icon} ${itemName}！`);
            }

            saveGame();
            updateDisplay();
            renderCelestialEconomy();
        }

        // 应用仙界物品效果
        function applyCelestialEffect(effect) {
            if (!effect) return;
            switch (effect.type) {
                case 'realm_boost':
                    if (gameState.realm < 5) {
                        gameState.realm += effect.value;
                        gameState.qi = 0;
                        gameState.cultivationProgress = 0;
                    }
                    break;
                case 'lifespan':
                    // 寿命系统如果有的话
                    break;
                case 'max_qi':
                    gameState.maxQi += effect.value;
                    gameState.qi += effect.value;
                    break;
                case 'cultivate_speed_immortal':
                    gameState.activeEffects.cultivate_speed += effect.value;
                    if (!gameState.activeEffects.cultivate_speed_endDay) {
                        gameState.activeEffects.cultivate_speed_endDay = {};
                    }
                    gameState.activeEffects.cultivate_speed_endDay.cultivate_speed_immortal = gameState.days + effect.duration;
                    break;
                case 'all_stats':
                    gameState.activeEffects.all_stats += effect.value;
                    break;
            }
        }

        // 投资仙界产业
        function investCelestial(areaName) {
            const ce = gameState.celestialEconomy;
            const data = CELESTIAL_ITEMS[areaName];
            if (!data || data.type !== 'investment') return;

            if (ce.immortalStones < data.baseCost) {
                alert('仙石不足！');
                return;
            }

            // 检查是否已达到最大投资数
            const currentCount = ce.investments.filter(inv => inv.area === areaName).length;
            if (currentCount >= 3) {
                alert('该产业投资已达上限！');
                return;
            }

            ce.immortalStones -= data.baseCost;
            const totalReturns = data.dailyReturn * data.duration;
            ce.investments.push({
                area: areaName,
                amount: data.baseCost,
                dailyReturn: data.dailyReturn,
                returns: totalReturns,
                daysLeft: data.duration,
                startDay: gameState.days
            });

            addLog('good', '仙界投资', `投资了 ${data.icon} ${areaName}，投资 ${data.baseCost} 仙石，预计总收益 ${totalReturns} 仙石`);
            saveGame();
            updateDisplay();
            renderCelestialEconomy();
        }

        // 刷新仙界市场
        function refreshCelestialMarket() {
            const ce = gameState.celestialEconomy;
            if (ce.immortalStones < 1) {
                alert('仙石不足！刷新市场需要 1 仙石');
                return;
            }
            ce.immortalStones -= 1;
            generateCelestialMarketItems();
            saveGame();
            updateDisplay();
            renderCelestialEconomy();
            addLog('neutral', '市场刷新', '仙界市场已刷新');
        }

        // 每日仙界经济结算
        function processCelestialEconomyDaily() {
            const ce = gameState.celestialEconomy;
            if (!ce.investments || ce.investments.length === 0) return 0;

            let dailyEarnings = 0;
            ce.investments = ce.investments.filter(inv => {
                inv.daysLeft--;
                if (inv.daysLeft <= 0) {
                    // 投资到期，返还收益
                    ce.immortalStones += inv.returns;
                    ce.totalEarned += inv.returns;
                    dailyEarnings += inv.returns;
                    addLog('good', '投资到期', `${inv.area} 投资到期，获得 ${inv.returns} 仙石！`);
                    return false;
                }
                // 每日收益
                ce.immortalStones += inv.dailyReturn;
                ce.totalEarned += inv.dailyReturn;
                dailyEarnings += inv.dailyReturn;
                return true;
            });

            if (dailyEarnings > 0) {
                addLog('good', '仙界收益', `今日仙界投资收益：+${dailyEarnings} 仙石`);
            }
            return dailyEarnings;
        }





        // 更新仙界经济显示
        function updateCelestialEconomyDisplay() {
            const ce = gameState.celestialEconomy;
            const stoneDisplay = document.getElementById('immortalStonesValue');
            if (stoneDisplay) {
                stoneDisplay.textContent = `💎 ${ce.immortalStones.toLocaleString()}`;
            }

            // 仙界商行按钮显示
            const celestialBtn = document.getElementById('celestialEconomyBtn');
            if (celestialBtn) {
                // 飞升后或天外天解锁后显示
                if (gameState.realm >= 5 || (gameState.beyondHeaven && gameState.beyondHeaven.unlocked)) {
                    celestialBtn.style.display = 'inline-block';
                }
            }

            // 插件按钮显示 (V48)
            const pluginBtn = document.getElementById('pluginBtn');
            if (pluginBtn) {
                pluginBtn.style.display = 'inline-block';
            }
            const proposalBtn = document.getElementById('proposalBtn');
            if (proposalBtn) {
                proposalBtn.style.display = 'inline-block';
            }
        }

        // ===== V48 插件系统 =====

        // 插件钩子调用
        function callPluginHook(hookName, ...args) {
            let result = args;
            const enabled = gameState.plugins && gameState.plugins.enabled || [];
            enabled.forEach(pluginId => {
                const plugin = gameState.plugins.installed[pluginId];
                if (plugin && plugin.hooks && typeof plugin.hooks[hookName] === 'function') {
                    try {
                        result = plugin.hooks[hookName](...result) !== undefined ? result : args;
                    } catch (e) {
                        console.warn(`Plugin ${pluginId} hook ${hookName} error:`, e);
                    }
                }
            });
            return result;
        }

        // 插件安装
        function installPlugin(pluginId) {
            const marketPlugin = BUILT_IN_PLUGINS.find(p => p.id === pluginId);
            if (!marketPlugin) return;

            // 检查依赖
            for (const dep of (marketPlugin.dependencies || [])) {
                if (!gameState.plugins.installed[dep]) {
                    showToast(`缺少依赖插件: ${dep}`);
                    return;
                }
            }

            // 安装
            gameState.plugins.installed[pluginId] = { ...marketPlugin };
            if (!gameState.plugins.enabled.includes(pluginId)) {
                gameState.plugins.enabled.push(pluginId);
            }

            // 调用onSpawn
            if (marketPlugin.hooks && typeof marketPlugin.hooks.onSpawn === 'function') {
                try { marketPlugin.hooks.onSpawn(); } catch(e) {}
            }

            // 调用主题钩子
            if (marketPlugin.category === 'theme') {
                callPluginHook('onThemeApply');
            }

            marketPlugin.installCount = (marketPlugin.installCount || 0) + 1;
            showToast(`已安装 ${marketPlugin.name}`);
            saveGame();
            updateDisplay();
            if (typeof renderPluginPanel === 'function') renderPluginPanel();
        }

        // 插件卸载
        function uninstallPlugin(pluginId) {
            const plugin = gameState.plugins.installed[pluginId];
            if (!plugin) return;

            // 检查是否有插件依赖此插件
            Object.values(gameState.plugins.installed).forEach(p => {
                if (p.dependencies && p.dependencies.includes(pluginId)) {
                    showToast(`无法卸载: ${p.name} 依赖此插件`);
                    return;
                }
            });

            // 调用onDestroy
            if (plugin.hooks && typeof plugin.hooks.onDestroy === 'function') {
                try { plugin.hooks.onDestroy(); } catch(e) {}
            }

            delete gameState.plugins.installed[pluginId];
            gameState.plugins.enabled = gameState.plugins.enabled.filter(id => id !== pluginId);
            showToast(`已卸载 ${plugin.name}`);
            saveGame();
            updateDisplay();
            if (typeof renderPluginPanel === 'function') renderPluginPanel();
        }

        // 插件启用/禁用切换
        function togglePlugin(pluginId) {
            const idx = gameState.plugins.enabled.indexOf(pluginId);
            if (idx >= 0) {
                gameState.plugins.enabled.splice(idx, 1);
                showToast('插件已禁用');
            } else {
                gameState.plugins.enabled.push(pluginId);
                const plugin = gameState.plugins.installed[pluginId];
                if (plugin && plugin.hooks && typeof plugin.hooks.onSpawn === 'function') {
                    try { plugin.hooks.onSpawn(); } catch(e) {}
                }
                if (plugin && plugin.category === 'theme') {
                    callPluginHook('onThemeApply');
                }
                showToast('插件已启用');
            }
            saveGame();
            updateDisplay();
            if (typeof renderPluginPanel === 'function') renderPluginPanel();
        }

        // 切换收藏
        function togglePluginFavorite(pluginId) {
            if (!gameState.plugins.favorites) gameState.plugins.favorites = [];
            const idx = gameState.plugins.favorites.indexOf(pluginId);
            if (idx >= 0) {
                gameState.plugins.favorites.splice(idx, 1);
            } else {
                gameState.plugins.favorites.push(pluginId);
            }
            saveGame();
            if (typeof renderPluginPanel === 'function') renderPluginPanel();
        }

        // 渲染插件面板
        let currentPluginTab = 'market';
        let currentPluginCategory = 'skill';

        function openPluginPanel() {
            showModal('📦 插件系统', `
                <div class="plugin-tabs">
                    <button class="tab-btn ${currentPluginTab === 'market' ? 'active' : ''}" onclick="setPluginTab('market')">📦 市场</button>
                    <button class="tab-btn ${currentPluginTab === 'installed' ? 'active' : ''}" onclick="setPluginTab('installed')">📥 我的插件</button>
                </div>
                <div id="pluginTabContent"></div>
            `, 600);
            renderPluginPanel();
        }

        function setPluginTab(tab) {
            currentPluginTab = tab;
            renderPluginPanel();
        }

        function renderPluginPanel() {
            const content = document.getElementById('pluginTabContent');
            if (!content) return;
            if (currentPluginTab === 'market') {
                content.innerHTML = renderPluginMarket();
            } else {
                content.innerHTML = renderInstalledPlugins();
            }
        }

        // 渲染市场插件
        function renderPluginMarket() {
            let html = '<div class="market-categories">';
            Object.entries(PLUGIN_CATEGORIES).forEach(([key, cat]) => {
                html += `<button class="tab-btn ${currentPluginCategory === key ? 'active' : ''}" onclick="setPluginCategory('${key}')">${cat.icon} ${cat.label}</button>`;
            });
            html += '</div>';

            const filtered = BUILT_IN_PLUGINS.filter(p => p.category === currentPluginCategory);
            if (filtered.length === 0) {
                html += '<div class="empty-state">该分类暂无插件</div>';
            } else {
                filtered.forEach(plugin => {
                    html += renderMarketPluginCard(plugin);
                });
            }
            return html;
        }

        function setPluginCategory(cat) {
            currentPluginCategory = cat;
            renderPluginPanel();
        }

        // 渲染市场插件卡片
        function renderMarketPluginCard(plugin) {
            const isInstalled = gameState.plugins.installed[plugin.id];
            const isFav = gameState.plugins.favorites && gameState.plugins.favorites.includes(plugin.id);
            const isEnabled = gameState.plugins.enabled.includes(plugin.id);

            let actionBtn = '';
            if (isInstalled) {
                actionBtn = `<button class="btn btn-sm ${isEnabled ? 'btn-installed' : 'btn-disabled'}" onclick="togglePlugin('${plugin.id}')">${isEnabled ? '已启用' : '已禁用'}</button>
                             <button class="btn btn-sm btn-uninstall" onclick="uninstallPlugin('${plugin.id}')">卸载</button>`;
            } else {
                actionBtn = `<button class="btn btn-sm btn-install" onclick="installPlugin('${plugin.id}')">安装</button>`;
            }

            return `<div class="plugin-card">
                <div class="plugin-card-header">
                    <span class="plugin-icon">${plugin.icon}</span>
                    <div class="plugin-info">
                        <span class="plugin-name">${plugin.name}</span>
                        <span class="plugin-version">v${plugin.version}</span>
                    </div>
                    <span class="plugin-rating">⭐ ${(plugin.rating || 0).toFixed(1)}</span>
                </div>
                <div class="plugin-desc">${plugin.description}</div>
                <div class="plugin-meta">
                    <span>👤 ${plugin.author}</span>
                    <span>📥 ${plugin.installCount || 0}</span>
                </div>
                <div class="plugin-actions">
                    ${actionBtn}
                    <button class="btn btn-sm ${isFav ? 'btn-fav-active' : 'btn-fav'}" onclick="togglePluginFavorite('${plugin.id}')">❤️</button>
                </div>
            </div>`;
        }

        // 渲染已安装插件
        function renderInstalledPlugins() {
            const installed = Object.values(gameState.plugins.installed);
            if (installed.length === 0) {
                return '<div class="empty-state">暂无已安装插件<br><br>前往市场安装更多插件吧！</div>';
            }

            let html = '<div class="installed-plugins">';
            installed.forEach(plugin => {
                const isEnabled = gameState.plugins.enabled.includes(plugin.id);
                const cat = PLUGIN_CATEGORIES[plugin.category] || {};
                html += `<div class="plugin-card ${!isEnabled ? 'plugin-disabled' : ''}">
                    <div class="plugin-card-header">
                        <span class="plugin-icon">${plugin.icon}</span>
                        <div class="plugin-info">
                            <span class="plugin-name">${plugin.name}</span>
                            <span class="plugin-version">v${plugin.version}</span>
                            <span class="plugin-cat">${cat.icon || ''} ${cat.label || plugin.category}</span>
                        </div>
                        <span class="plugin-status ${isEnabled ? 'status-enabled' : 'status-disabled'}">${isEnabled ? '● 运行中' : '○ 已停止'}</span>
                    </div>
                    <div class="plugin-desc">${plugin.description}</div>
                    <div class="plugin-actions">
                        <button class="btn btn-sm ${isEnabled ? 'btn-disable' : 'btn-enable'}" onclick="togglePlugin('${plugin.id}')">${isEnabled ? '禁用' : '启用'}</button>
                        <button class="btn btn-sm btn-uninstall" onclick="uninstallPlugin('${plugin.id}')">卸载</button>
                    </div>
                </div>`;
            });
            html += '</div>';
            return html;
        }

        // 在游戏主循环中调用插件钩子 (V48)
        function callPluginHooksForDayChange(day) {
            callPluginHook('onDayChange', day);
        }

        // ===== V50 提案系统 =====

        function openProposalPanel() {
            showModal('💡 迭代提案系统', `
                <div class="plugin-tabs">
                    <button class="tab-btn ${currentProposalTab === 'list' ? 'active' : ''}" onclick="setProposalTab('list')">📋 我的提案</button>
                    <button class="tab-btn ${currentProposalTab === 'submit' ? 'active' : ''}" onclick="setProposalTab('submit')">✏️ 提交提案</button>
                </div>
                <div id="proposalTabContent"></div>
            `, 600);
            renderProposalPanel();
        }

        let currentProposalTab = 'list';

        function setProposalTab(tab) {
            currentProposalTab = tab;
            renderProposalPanel();
        }

        function renderProposalPanel() {
            const content = document.getElementById('proposalTabContent');
            if (!content) return;
            if (currentProposalTab === 'list') {
                content.innerHTML = renderProposalList();
            } else {
                content.innerHTML = renderProposalSubmitForm();
            }
        }

        function renderProposalList() {
            const proposals = gameState.proposals.submitted || [];
            if (proposals.length === 0) {
                return '<div class="empty-state">暂无提案，试试提交一个新提案吧！</div>';
            }
            let html = '<div class="plugin-card" style="margin-bottom:10px;">';
            proposals.forEach((p, idx) => {
                const dir = PROPOSAL_DIRECTIONS[p.direction] || { label: p.direction, color: '#888' };
                const status = PROPOSAL_STATUS[p.status] || { label: p.status, color: '#888' };
                html += `<div style="padding:8px 0;border-bottom:1px solid #eee;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                        <span style="background:${dir.color};color:white;padding:2px 8px;border-radius:10px;font-size:11px;">${dir.label}</span>
                        <span style="background:${status.color};color:white;padding:2px 8px;border-radius:10px;font-size:11px;">${status.label}</span>
                    </div>
                    <div style="font-weight:bold;margin-bottom:4px;">${p.title}</div>
                    <div style="font-size:12px;color:#666;">${p.description.substring(0, 60)}${p.description.length > 60 ? '...' : ''}</div>
                    <div style="font-size:11px;color:#999;margin-top:4px;">${p.id} · ${p.date}</div>
                </div>`;
            });
            html += '</div>';
            return html;
        }

        function renderProposalSubmitForm() {
            let html = `<div style="padding:10px 0;">
                <div style="margin-bottom:12px;">
                    <label style="display:block;font-weight:bold;margin-bottom:4px;">📌 标题</label>
                    <input type="text" id="proposalTitle" placeholder="如：仙界钓鱼系统" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box;">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block;font-weight:bold;margin-bottom:4px;">🏷️ 方向</label>
                    <select id="proposalDirection" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box;">
                        <option value="">选择方向...</option>
                        ${Object.entries(PROPOSAL_DIRECTIONS).map(([k, v]) => `<option value="${k}">${v.label} - ${v.desc}</option>`).join('')}
                    </select>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block;font-weight:bold;margin-bottom:4px;">📝 详细描述</label>
                    <textarea id="proposalDesc" placeholder="描述你的功能建议..." style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;height:100px;resize:vertical;box-sizing:border-box;"></textarea>
                </div>
                <button class="btn btn-cultivate" onclick="submitProposal()">提交提案</button>
            </div>`;
            return html;
        }

        function submitProposal() {
            const title = document.getElementById('proposalTitle').value.trim();
            const direction = document.getElementById('proposalDirection').value;
            const description = document.getElementById('proposalDesc').value.trim();
            if (!title) { addLog('bad', '提案', '请输入标题'); return; }
            if (!direction) { addLog('bad', '提案', '请选择方向'); return; }
            if (!description) { addLog('bad', '提案', '请输入描述'); return; }
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
            const id = 'P-' + dateStr.replace(/-/g, '') + '-' + String(gameState.proposals.nextId || 1).padStart(3, '0');
            const proposal = { id, title, direction, description, status: 'submitted', date: dateStr };
            if (!gameState.proposals.submitted) gameState.proposals.submitted = [];
            gameState.proposals.submitted.push(proposal);
            gameState.proposals.nextId = (gameState.proposals.nextId || 1) + 1;
            saveGame();
            addLog('good', '提案', `提交成功：${title}`);
            currentProposalTab = 'list';
            renderProposalPanel();
        }
