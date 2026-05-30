/**
 * HerbDiscoveryService - 药材探索系统
 * V229 Direction Q续: 丹药丹方知识图谱 - 药材探索
 * 
 * 功能：
 * 1. 地域药材探索（平原、山林、湖泊、沙漠、雪山、秘境）
 * 2. 季节性药材变化（春夏秋冬）
 * 3. 药材稀有度分类
 * 4. 药材协同效应分析
 * 5. 药材知识获取（元素精通）
 */

class HerbDiscoveryService {
    constructor() {
        this.initialized = false;
        this.gameState = null;
        
        // 地域药材数据库
        this.regionHerbs = {
            '平原': {
                common: ['甘草', '黄芪', '人参叶', '野菊花'],
                uncommon: ['灵芝', '何首乌', '枸杞子'],
                rare: ['天麻', '黄精'],
                legendary: []
            },
            '山林': {
                common: ['金银花', '连翘', '板蓝根', '蒲公英'],
                uncommon: ['天冬', '麦冬', '茯苓'],
                rare: ['虫草', '松茸'],
                legendary: ['千年灵芝']
            },
            '湖泊': {
                common: ['荷叶', '莲子', '芦苇', '香蒲'],
                uncommon: ['珍珠粉', '贝母', '莲花蕊'],
                rare: ['九眼石', '莲心草'],
                legendary: ['冰莲']
            },
            '沙漠': {
                common: ['肉苁蓉', '锁阳', '沙参'],
                uncommon: ['红景天', '麻黄'],
                rare: ['肉桂', '檀香'],
                legendary: ['沙之眼']
            },
            '雪山': {
                common: ['雪莲', '红花', '艾叶'],
                uncommon: ['雪茶', '冰草'],
                rare: ['雪蛤', '冰蟾'],
                legendary: ['冰魄寒莲']
            },
            '秘境': {
                common: ['七彩草', '幻影花', '幽冥藤'],
                uncommon: ['血精草', '魂花'],
                rare: ['虚空兰', '命运花'],
                legendary: ['道韵花', '天命果']
            }
        };
        
        // 季节性药材（季节影响获取概率和种类）
        this.seasonalHerbs = {
            '春': {
                available: ['人参叶', '野菊花', '金银花', '连翘', '蒲公英', '天冬', '麦冬', '茯苓'],
                bonus: ['灵芝', '虫草'],
                spawnRate: 1.2
            },
            '夏': {
                available: ['甘草', '黄芪', '板蓝根', '荷叶', '莲子', '芦苇', '香蒲', '珍珠粉'],
                bonus: ['松茸', '冰草'],
                spawnRate: 1.0
            },
            '秋': {
                available: ['枸杞子', '天麻', '黄精', '虫草', '松茸', '肉苁蓉', '锁阳', '沙参'],
                bonus: ['雪莲', '红景天'],
                spawnRate: 1.1
            },
            '冬': {
                available: ['雪莲', '红花', '艾叶', '雪茶', '冰草', '雪蛤', '冰蟾', '冰莲'],
                bonus: ['千年灵芝', '冰魄寒莲'],
                spawnRate: 0.9
            }
        };
        
        // 稀有度等级
        this.rarityLevels = {
            'common': { name: '普通', color: '#9E9E9E', discoveryChance: 0.8, masteryBonus: 1 },
            'uncommon': { name: '稀有', color: '#4CAF50', discoveryChance: 0.5, masteryBonus: 2 },
            'rare': { name: '珍稀', color: '#2196F3', discoveryChance: 0.25, masteryBonus: 3 },
            'legendary': { name: '传说', color: '#FF9800', discoveryChance: 0.1, masteryBonus: 5 }
        };
        
        // 药材属性协同效应
        this.herbSynergies = {
            '灵芝+虫草': { result: '强化灵力', efficiency: 1.5 },
            '人参叶+枸杞子': { result: '补气养血', efficiency: 1.3 },
            '雪莲+冰草': { result: '寒冰淬体', efficiency: 1.4 },
            '天麻+黄精': { result: '安神益智', efficiency: 1.2 },
            '茯苓+莲子': { result: '健脾宁心', efficiency: 1.3 },
            '金银花+连翘': { result: '清热解毒', efficiency: 1.4 },
            '肉苁蓉+锁阳': { result: '壮阳补肾', efficiency: 1.5 },
            '珍珠粉+贝母': { result: '润肺养颜', efficiency: 1.3 },
            '千年灵芝+虫草': { result: '延年益寿', efficiency: 2.0 },
            '冰魄寒莲+雪蛤': { result: '冰肌玉骨', efficiency: 1.8 },
            '道韵花+天命果': { result: '逆天改命', efficiency: 2.5 },
            '血精草+魂花': { result: '血祭灵魂', efficiency: 1.6 },
            '虚空兰+幻影花': { result: '虚实相生', efficiency: 1.7 },
            '七彩草+幽冥藤': { result: '阴阳调和', efficiency: 1.5 }
        };
        
        // 已发现的药材记录
        this.discoveredHerbs = new Set();
        
        // 药材知识等级（影响发现概率）
        this.herbKnowledge = {
            metal: 0,   // 金
            wood: 0,    // 木
            water: 0,   // 水
            fire: 0,    // 火
            earth: 0    // 土
        };
        
        // 探索冷却
        this.exploreCooldown = 0;
        this.cooldownDuration = 5000; // 5秒冷却
    }
    
    /**
     * 初始化药材探索服务
     */
    init(gameState) {
        this.gameState = gameState;
        
        // 初始化已发现药材
        if (!gameState.herbDiscovery) {
            gameState.herbDiscovery = {
                discoveredHerbs: [],
                herbKnowledge: { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 },
                totalExplorations: 0,
                successfulDiscoveries: 0,
                regionVisits: {},
                seasonHarvests: {}
            };
        }
        
        // 加载已发现药材
        this.discoveredHerbs = new Set(gameState.herbDiscovery.discoveredHerbs || []);
        this.herbKnowledge = { ...this.herbKnowledge, ...(gameState.herbDiscovery.herbKnowledge || {}) };
        
        this.initialized = true;
        return gameState;
    }
    
    /**
     * 获取当前季节
     */
    getCurrentSeason() {
        // 根据游戏中的日期计算季节
        const days = this.gameState?.days || 1;
        const seasonIndex = Math.floor((days % 365) / 91); // 每91天一个季节
        const seasons = ['春', '夏', '秋', '冬'];
        return seasons[seasonIndex] || '春';
    }
    
    /**
     * 计算发现概率
     */
    calculateDiscoveryChance(rarity, elementBonus = 0) {
        const rarityData = this.rarityLevels[rarity] || this.rarityLevels['common'];
        const baseChance = rarityData.discoveryChance;
        
        // 元素精通加成
        const masteryBonus = rarityData.masteryBonus;
        const elementMultiplier = 1 + (elementBonus * 0.1);
        
        // 综合发现概率
        return Math.min(0.95, baseChance * elementMultiplier);
    }
    
    /**
     * 计算协同效应
     */
    calculateSynergy(herbs) {
        const synergies = [];
        const sortedHerbs = [...herbs].sort();
        
        for (const [combo, effect] of Object.entries(this.herbSynergies)) {
            const [herb1, herb2] = combo.split('+');
            if (sortedHerbs.includes(herb1) && sortedHerbs.includes(herb2)) {
                synergies.push({
                    herbs: [herb1, herb2],
                    effect: effect.result,
                    efficiency: effect.efficiency
                });
            }
        }
        
        // 按效率排序
        synergies.sort((a, b) => b.efficiency - a.efficiency);
        
        return synergies;
    }
    
    // ===== MCP 工具实现 =====
    
    /**
     * herb.explore.region - 在指定地域探索药材
     */
    exploreRegion(params) {
        if (!this.initialized) {
            return { success: false, error: '药材探索服务未初始化' };
        }
        
        const { region, useMastery = true } = params || {};
        
        // 检查冷却
        if (this.exploreCooldown > Date.now()) {
            const remaining = Math.ceil((this.exploreCooldown - Date.now()) / 1000);
            return { success: false, error: `探索冷却中，请等待 ${remaining} 秒` };
        }
        
        // 验证地域
        if (!region || !this.regionHerbs[region]) {
            return { 
                success: false, 
                error: '无效的地域',
                validRegions: Object.keys(this.regionHerbs)
            };
        }
        
        // 计算元素精通加成
        let elementBonus = 0;
        if (useMastery && this.gameState?.spiritRoot?.attributes) {
            const attrs = this.gameState.spiritRoot.attributes;
            elementBonus = (attrs.metal || 0) + (attrs.wood || 0) + 
                          (attrs.water || 0) + (attrs.fire || 0) + (attrs.earth || 0);
        }
        
        // 获取地域药材
        const regionData = this.regionHerbs[region];
        const season = this.getCurrentSeason();
        const seasonData = this.seasonalHerbs[season];
        
        // 合并季节加成
        const availableHerbs = [...regionData.common];
        if (seasonData.bonus.some(h => regionData.uncommon.includes(h))) {
            availableHerbs.push(...regionData.uncommon.filter(h => seasonData.bonus.includes(h)));
        }
        
        // 根据稀有度随机选择药材
        const rarityRoll = Math.random();
        let selectedRarity;
        let herbs;
        
        if (rarityRoll < 0.60) {
            selectedRarity = 'common';
            herbs = regionData.common;
        } else if (rarityRoll < 0.85) {
            selectedRarity = 'uncommon';
            herbs = regionData.uncommon;
        } else if (rarityRoll < 0.97) {
            selectedRarity = 'rare';
            herbs = regionData.rare;
        } else {
            selectedRarity = 'legendary';
            herbs = regionData.legendary;
        }
        
        // 如果该稀有度没有药材，降级
        while (herbs.length === 0 && selectedRarity !== 'common') {
            if (selectedRarity === 'legendary') selectedRarity = 'rare';
            else if (selectedRarity === 'rare') selectedRarity = 'uncommon';
            else if (selectedRarity === 'uncommon') selectedRarity = 'common';
            herbs = regionData[selectedRarity];
        }
        
        // 计算发现概率
        const discoveryChance = this.calculateDiscoveryChance(selectedRarity, elementBonus);
        
        // 季节影响
        const seasonMultiplier = seasonData.spawnRate;
        const finalChance = discoveryChance * seasonMultiplier;
        
        // 随机判定
        const roll = Math.random();
        const discovered = roll < finalChance;
        
        // 设置冷却
        this.exploreCooldown = Date.now() + this.cooldownDuration;
        
        // 更新统计
        this.gameState.herbDiscovery.totalExplorations++;
        this.gameState.herbDiscovery.regionVisits[region] = 
            (this.gameState.herbDiscovery.regionVisits[region] || 0) + 1;
        
        if (discovered && herbs.length > 0) {
            // 随机选择一种药材
            const herb = herbs[Math.floor(Math.random() * herbs.length)];
            const isNew = !this.discoveredHerbs.has(herb);
            
            if (isNew) {
                this.discoveredHerbs.add(herb);
                this.gameState.herbDiscovery.discoveredHerbs.push(herb);
                this.gameState.herbDiscovery.successfulDiscoveries++;
            }
            
            return {
                success: true,
                region,
                season,
                herb,
                rarity: selectedRarity,
                rarityName: this.rarityLevels[selectedRarity].name,
                isNew,
                discoveryChance: finalChance,
                roll,
                seasonBonus: seasonMultiplier > 1 ? 'good' : seasonMultiplier < 1 ? 'bad' : 'normal'
            };
        }
        
        return {
            success: false,
            reason: '未发现药材',
            region,
            season,
            discoveryChance: finalChance,
            roll,
            regionHerbs: regionData.common.slice(0, 3)
        };
    }
    
    /**
     * herb.season.query - 查询当前季节的药材
     */
    querySeasonalHerbs(params) {
        if (!this.initialized) {
            return { success: false, error: '药材探索服务未初始化' };
        }
        
        const { season } = params || {};
        const targetSeason = season || this.getCurrentSeason();
        const seasonData = this.seasonalHerbs[targetSeason];
        
        if (!seasonData) {
            return { success: false, error: `无效的季节: ${season}` };
        }
        
        // 统计每个稀有度的药材数量
        const rarityCounts = {
            common: seasonData.available.filter(h => 
                Object.values(this.regionHerbs).some(r => r.common.includes(h))
            ).length,
            uncommon: seasonData.bonus.filter(h => 
                Object.values(this.regionHerbs).some(r => r.uncommon.includes(h))
            ).length
        };
        
        return {
            success: true,
            season: targetSeason,
            availableHerbs: seasonData.available,
            bonusHerbs: seasonData.bonus,
            spawnRate: seasonData.spawnRate,
            rarityCounts,
            description: this.getSeasonDescription(targetSeason)
        };
    }
    
    /**
     * 获取季节描述
     */
    getSeasonDescription(season) {
        const descriptions = {
            '春': '春季万物复苏，草木生长旺盛，是采集灵草的好时节。',
            '夏': '夏季阳光充足，湖泊药材生长迅速，但山林药材较少。',
            '秋': '秋季是收获的季节，大部分药材都在此时成熟。',
            '冬': '冬季寒冷，冰雪药材品质最佳，但数量较少。'
        };
        return descriptions[season] || '';
    }
    
    /**
     * herb.discovery.list - 查看已发现药材
     */
    listDiscoveredHerbs(params) {
        if (!this.initialized) {
            return { success: false, error: '药材探索服务未初始化' };
        }
        
        const { filter, rarity } = params || {};
        
        let herbs = Array.from(this.discoveredHerbs);
        
        // 按稀有度筛选
        if (rarity) {
            herbs = herbs.filter(h => 
                Object.entries(this.regionHerbs).some(([, data]) => 
                    data[rarity]?.includes(h)
                )
            );
        }
        
        // 按名称过滤
        if (filter) {
            herbs = herbs.filter(h => h.includes(filter));
        }
        
        // 按稀有度分类
        const classifiedHerbs = {
            common: [],
            uncommon: [],
            rare: [],
            legendary: []
        };
        
        for (const herb of herbs) {
            for (const [rarity, data] of Object.entries(this.regionHerbs)) {
                if (data.legendary.includes(herb)) {
                    classifiedHerbs.legendary.push(herb);
                } else if (data.rare.includes(herb)) {
                    classifiedHerbs.rare.push(herb);
                } else if (data.uncommon.includes(herb)) {
                    classifiedHerbs.uncommon.push(herb);
                } else if (data.common.includes(herb)) {
                    classifiedHerbs.common.push(herb);
                }
            }
        }
        
        return {
            success: true,
            totalCount: herbs.length,
            herbs: herbs.sort(),
            classified: classifiedHerbs,
            stats: {
                totalExplorations: this.gameState.herbDiscovery.totalExplorations,
                successfulDiscoveries: this.gameState.herbDiscovery.successfulDiscoveries,
                discoveryRate: this.gameState.herbDiscovery.totalExplorations > 0
                    ? (this.gameState.herbDiscovery.successfulDiscoveries / this.gameState.herbDiscovery.totalExplorations * 100).toFixed(1) + '%'
                    : '0%'
            }
        };
    }
    
    /**
     * herb.rarity.classify - 药材稀有度分类
     */
    classifyHerbsByRarity(params) {
        if (!this.initialized) {
            return { success: false, error: '药材探索服务未初始化' };
        }
        
        const { herb } = params || {};
        
        // 如果指定了药材，返回该药材的稀有度
        if (herb) {
            for (const [rarity, data] of Object.entries(this.regionHerbs)) {
                for (const [rarityType, herbs] of Object.entries(data)) {
                    if (herbs.includes(herb)) {
                        const rarityData = this.rarityLevels[rarityType];
                        return {
                            success: true,
                            herb,
                            rarity: rarityType,
                            rarityName: rarityData.name,
                            color: rarityData.color,
                            discoveryChance: rarityData.discoveryChance,
                            masteryBonus: rarityData.masteryBonus,
                            regions: this.findHerbRegions(herb)
                        };
                    }
                }
            }
            return { success: false, error: `未找到药材: ${herb}` };
        }
        
        // 返回所有药材的稀有度分类
        const classification = {};
        
        for (const [regionName, data] of Object.entries(this.regionHerbs)) {
            for (const [rarityType, herbs] of Object.entries(data)) {
                if (!classification[rarityType]) {
                    classification[rarityType] = {
                        name: this.rarityLevels[rarityType].name,
                        color: this.rarityLevels[rarityType].color,
                        herbs: []
                    };
                }
                classification[rarityType].herbs.push(...herbs);
            }
        }
        
        // 去重
        for (const rarity of Object.keys(classification)) {
            classification[rarity].herbs = [...new Set(classification[rarity].herbs)];
            classification[rarity].count = classification[rarity].herbs.length;
        }
        
        return {
            success: true,
            classification,
            totalHerbs: Object.values(classification).reduce((sum, c) => sum + c.count, 0)
        };
    }
    
    /**
     * 查找药材存在的地域
     */
    findHerbRegions(herb) {
        const regions = [];
        for (const [regionName, data] of Object.entries(this.regionHerbs)) {
            for (const [rarity, herbs] of Object.entries(data)) {
                if (herbs.includes(herb)) {
                    regions.push({
                        region: regionName,
                        rarity
                    });
                }
            }
        }
        return regions;
    }
    
    /**
     * herb.synergy.analyze - 分析药材协同效应
     */
    analyzeSynergy(params) {
        if (!this.initialized) {
            return { success: false, error: '药材探索服务未初始化' };
        }
        
        const { herbs } = params || {};
        
        if (!herbs || !Array.isArray(herbs) || herbs.length < 2) {
            return { 
                success: false, 
                error: '请提供至少2种药材进行分析',
                availableSynergies: Object.keys(this.herbSynergies).slice(0, 5)
            };
        }
        
        // 计算协同效应
        const synergies = this.calculateSynergy(herbs);
        
        // 计算总效率
        const totalEfficiency = synergies.reduce((sum, s) => sum + s.efficiency, 0);
        
        // 分析已发现的药材
        const discoveredCount = herbs.filter(h => this.discoveredHerbs.has(h)).length;
        
        // 获取可能的组合建议
        const possibleCombos = [];
        for (const [combo, effect] of Object.entries(this.herbSynergies)) {
            const [h1, h2] = combo.split('+');
            if (herbs.includes(h1) || herbs.includes(h2)) {
                const hasBoth = herbs.includes(h1) && herbs.includes(h2);
                const hasOne = herbs.includes(h1) || herbs.includes(h2);
                
                if (!hasBoth) {
                    possibleCombos.push({
                        existing: herbs.includes(h1) ? h1 : h2,
                        missing: herbs.includes(h1) ? h2 : h1,
                        effect: effect.result,
                        efficiency: effect.efficiency
                    });
                }
            }
        }
        
        return {
            success: true,
            inputHerbs: herbs,
            synergies,
            totalEfficiency,
            hasSynergy: synergies.length > 0,
            discoveredCount,
            missingCount: herbs.length - discoveredCount,
            possibleCombos: possibleCombos.slice(0, 5)
        };
    }
    
    /**
     * herb.knowledge.gain - 获取药材知识（升级精通）
     */
    gainHerbKnowledge(params) {
        if (!this.initialized) {
            return { success: false, error: '药材探索服务未初始化' };
        }
        
        const { element, amount } = params || {};
        const knowledgeGain = amount || 1;
        
        // 验证元素
        const validElements = ['metal', 'wood', 'water', 'fire', 'earth'];
        if (element && !validElements.includes(element)) {
            return { 
                success: false, 
                error: '无效的元素',
                validElements 
            };
        }
        
        // 更新知识
        if (element) {
            const oldLevel = this.herbKnowledge[element];
            this.herbKnowledge[element] += knowledgeGain;
            const newLevel = this.herbKnowledge[element];
            
            // 保存到游戏状态
            this.gameState.herbDiscovery.herbKnowledge[element] = newLevel;
            
            return {
                success: true,
                element,
                knowledgeGain,
                oldLevel,
                newLevel,
                levelUp: Math.floor(newLevel / 10) > Math.floor(oldLevel / 10),
                bonusMultiplier: 1 + (newLevel * 0.1)
            };
        }
        
        // 返回所有元素知识状态
        const totalKnowledge = Object.values(this.herbKnowledge).reduce((sum, v) => sum + v, 0);
        const elementDescriptions = {
            metal: '金 - 控制矿物和金属类药材',
            wood: '木 - 控制草本和植物类药材',
            water: '水 - 控制水系和寒性药材',
            fire: '火 - 控制火系和热性药材',
            earth: '土 - 控制土系和矿物类药材'
        };
        
        return {
            success: true,
            herbKnowledge: this.herbKnowledge,
            totalKnowledge,
            elementDescriptions,
            overallBonus: 1 + (totalKnowledge * 0.05),
            levelSummary: Object.fromEntries(
                Object.entries(this.herbKnowledge).map(([el, val]) => [el, Math.floor(val / 10)])
            )
        };
    }
    
    /**
     * 获取服务状态
     */
    getStatus() {
        return {
            initialized: this.initialized,
            discoveredCount: this.discoveredHerbs.size,
            totalKnowledge: Object.values(this.herbKnowledge).reduce((sum, v) => sum + v, 0),
            cooldownActive: this.exploreCooldown > Date.now(),
            cooldownRemaining: Math.max(0, this.exploreCooldown - Date.now()),
            currentSeason: this.getCurrentSeason(),
            stats: {
                totalExplorations: this.gameState?.herbDiscovery?.totalExplorations || 0,
                successfulDiscoveries: this.gameState?.herbDiscovery?.successfulDiscoveries || 0
            }
        };
    }
}

// 导出单例
export const herbDiscoveryService = new HerbDiscoveryService();
export default herbDiscoveryService;