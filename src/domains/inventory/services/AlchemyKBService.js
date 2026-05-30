/**
 * AlchemyKBService - 丹方知识图谱系统
 * Direction Q: 丹药丹方知识图谱
 * 
 * 功能：
 * 1. 维护丹方知识图谱（药材、属性、丹方、成品）
 * 2. 支持丹方发现机制
 * 3. 药材属性映射和协同效应计算
 * 4. 炼丹结果预览
 */

import { inventoryService } from './InventoryService.js';

class AlchemyKBService {
    constructor() {
        this.initialized = false;
        this.gameState = null;
        
        // 知识图谱数据结构
        // nodes: { id, type, name, properties }
        // edges: { source, target, relation }
        this.knowledgeGraph = {
            nodes: [],
            edges: [],
            recipes: {},       // 已发现的丹方
            herbEfficacies: {} // 药材属性映射
        };
        
        // 预设药材属性
        this.herbEfficacyDatabase = {
            '灵草': ['qi_restoration', 'cultivation_boost'],
            '妖兽血': ['attack_boost', 'beast_summon'],
            '天材': ['all_attributes', 'breakthrough_help'],
            '混沌石': ['chaos_attribute', 'legendary_boost'],
            '玄铁': ['defense_boost', 'weapon_material'],
            '妖兽皮': ['defense_boost', 'armor_material'],
            '妖兽骨': ['attack_boost', 'tool_material'],
            '灵石': ['energy_source', 'universal']
        };
        
        // 预设丹方知识（初始已知）
        this.initialRecipes = {
            '回气丹': {
                materials: ['灵草'],
                efficacies: ['qi_restoration'],
                discovered: true,
                discoverProbability: 0
            },
            '疗伤丹': {
                materials: ['灵草', '妖兽血'],
                efficacies: ['healing', 'attack_boost'],
                discovered: true,
                discoverProbability: 0
            },
            '聚灵丹': {
                materials: ['灵石', '灵草'],
                efficacies: ['cultivation_boost', 'qi_restoration'],
                discovered: true,
                discoverProbability: 0
            },
            '破境丹': {
                materials: ['灵石', '天材'],
                efficacies: ['breakthrough_help', 'realm_barrier'],
                discovered: true,
                discoverProbability: 0
            },
            '渡劫丹': {
                materials: ['天材', '灵石'],
                efficacies: ['tribulation_help', 'mindset_boost'],
                discovered: true,
                discoverProbability: 0
            },
            '洗髓丹': {
                materials: ['天材', '灵石'],
                efficacies: ['spirit_root_refresh', 'all_attributes'],
                discovered: true,
                discoverProbability: 0
            }
        };
        
        // 预设属性协同效应
        this.synergyEffects = {
            'qi_restoration+cultivation_boost': 'enhanced_cultivation',
            'attack_boost+defense_boost': 'balanced_combat',
            'all_attributes+legendary_boost': 'ultimate_pill',
            'breakthrough_help+mindset_boost': 'smooth_breakthrough',
            'healing+qi_restoration': 'full_recovery'
        };
        
        // 丹方发现消耗
        this.discoveryCost = 500; // 灵气消耗
    }
    
    /**
     * 初始化丹方知识图谱
     */
    init(gameState) {
        this.gameState = gameState;
        
        if (!gameState.alchemyKB) {
            gameState.alchemyKB = {
                recipes: { ...this.initialRecipes },
                herbEfficacies: { ...this.herbEfficacyDatabase },
                totalDiscoveries: 0,
                lastDiscoveryDate: null
            };
        }
        
        // 加载知识图谱
        this.knowledgeGraph.recipes = gameState.alchemyKB.recipes;
        this.knowledgeGraph.herbEfficacies = gameState.alchemyKB.herbEfficacies;
        
        // 构建初始图谱节点
        this.buildKnowledgeGraph();
        
        this.initialized = true;
        return gameState;
    }
    
    /**
     * 构建知识图谱
     */
    buildKnowledgeGraph() {
        const nodes = [];
        const edges = [];
        
        // 添加药材节点
        for (const herb of Object.keys(this.knowledgeGraph.herbEfficacies)) {
            nodes.push({
                id: `herb_${herb}`,
                type: 'herb',
                name: herb,
                properties: {
                    efficacies: this.knowledgeGraph.herbEfficacies[herb]
                }
            });
        }
        
        // 添加属性节点
        const efficacySet = new Set();
        for (const herbEfficacies of Object.values(this.knowledgeGraph.herbEfficacies)) {
            for (const eff of herbEfficacies) {
                efficacySet.add(eff);
            }
        }
        for (const eff of efficacySet) {
            nodes.push({
                id: `efficacy_${eff}`,
                type: 'efficacy',
                name: eff,
                properties: {}
            });
        }
        
        // 添加已发现丹方节点
        for (const [recipeName, recipe] of Object.entries(this.knowledgeGraph.recipes)) {
            if (recipe.discovered) {
                nodes.push({
                    id: `recipe_${recipeName}`,
                    type: 'recipe',
                    name: recipeName,
                    properties: {
                        materials: recipe.materials,
                        efficacies: recipe.efficacies
                    }
                });
                
                // 添加边：药材 -> 丹方
                for (const mat of recipe.materials) {
                    edges.push({
                        source: `herb_${mat}`,
                        target: `recipe_${recipeName}`,
                        relation: 'material_for'
                    });
                }
                
                // 添加边：属性 -> 丹方
                for (const eff of recipe.efficacies) {
                    edges.push({
                        source: `efficacy_${eff}`,
                        target: `recipe_${recipeName}`,
                        relation: 'contributes_to'
                    });
                }
            }
        }
        
        this.knowledgeGraph.nodes = nodes;
        this.knowledgeGraph.edges = edges;
    }
    
    // ===== MCP 工具实现 =====
    
    /**
     * alchemy.kb.query - 查询丹方知识库
     */
    query(params) {
        if (!this.initialized) {
            return { success: false, error: '知识库未初始化' };
        }
        
        const { type, name } = params || {};
        
        if (!type && !name) {
            // 返回所有知识
            return {
                success: true,
                data: {
                    totalNodes: this.knowledgeGraph.nodes.length,
                    totalEdges: this.knowledgeGraph.edges.length,
                    discoveredRecipes: Object.values(this.knowledgeGraph.recipes).filter(r => r.discovered).length,
                    totalRecipes: Object.keys(this.knowledgeGraph.recipes).length,
                    herbCount: Object.keys(this.knowledgeGraph.herbEfficacies).length
                }
            };
        }
        
        if (type === 'recipe' && name) {
            // 查询特定丹方
            const recipe = this.knowledgeGraph.recipes[name];
            if (!recipe) {
                return { success: false, error: `丹方 ${name} 不存在` };
            }
            
            // 查找相关节点和边
            const recipeNode = this.knowledgeGraph.nodes.find(n => n.id === `recipe_${name}`);
            const incomingEdges = this.knowledgeGraph.edges.filter(e => e.target === `recipe_${name}`);
            
            return {
                success: true,
                data: {
                    name,
                    discovered: recipe.discovered,
                    materials: recipe.materials,
                    efficacies: recipe.efficacies,
                    relatedHerbs: incomingEdges.filter(e => e.relation === 'material_for').map(e => e.source.replace('herb_', '')),
                    relatedEfficacies: incomingEdges.filter(e => e.relation === 'contributes_to').map(e => e.source.replace('efficacy_', ''))
                }
            };
        }
        
        if (type === 'herb' && name) {
            // 查询特定药材
            const efficacies = this.knowledgeGraph.herbEfficacies[name];
            if (!efficacies) {
                return { success: false, error: `药材 ${name} 不存在` };
            }
            
            // 查找使用此药材的丹方
            const relatedRecipes = Object.entries(this.knowledgeGraph.recipes)
                .filter(([, recipe]) => recipe.discovered && recipe.materials.includes(name))
                .map(([name]) => name);
            
            return {
                success: true,
                data: {
                    name,
                    efficacies,
                    relatedRecipes
                }
            };
        }
        
        if (type === 'efficacy' && name) {
            // 查询特定属性
            const efficacyNode = this.knowledgeGraph.nodes.find(n => n.id === `efficacy_${name}`);
            if (!efficacyNode) {
                return { success: false, error: `属性 ${name} 不存在` };
            }
            
            const relatedEdges = this.knowledgeGraph.edges.filter(e => e.source === `efficacy_${name}`);
            const relatedRecipes = relatedEdges.map(e => e.target.replace('recipe_', ''));
            
            return {
                success: true,
                data: {
                    name,
                    relatedRecipes
                }
            };
        }
        
        return { success: false, error: '无效的查询参数' };
    }
    
    /**
     * alchemy.recipe.discover - 手动研究新丹方（消耗灵气）
     */
    discover(params) {
        if (!this.initialized) {
            return { success: false, error: '知识库未初始化' };
        }
        
        const { herbs, qiCost } = params || {};
        const cost = qiCost || this.discoveryCost;
        
        // 检查灵气是否足够
        if (this.gameState.player.qi < cost) {
            return { success: false, error: `灵气不足，需要 ${cost} 点` };
        }
        
        // 消耗灵气
        this.gameState.player.qi -= cost;
        
        // 计算发现概率（基于元素精通等级）
        const elementMastery = this.gameState.spiritRoot?.attributes?.wood || 0;
        const baseProbability = 0.1 + (elementMastery / 100);
        
        // 检查是否已有所有丹方
        const allRecipesKnown = Object.values(this.knowledgeGraph.recipes).every(r => r.discovered);
        if (allRecipesKnown) {
            return { success: false, error: '所有丹方已发现', qiSpent: cost, discoveryChance: 0 };
        }
        
        // 获取未发现的丹方
        const unknownRecipes = Object.entries(this.knowledgeGraph.recipes)
            .filter(([, recipe]) => !recipe.discovered);
        
        if (unknownRecipes.length === 0) {
            return { success: false, error: '没有可发现的丹方', qiSpent: cost };
        }
        
        // 根据材料匹配度提升概率
        let discoveryChance = baseProbability;
        if (herbs && herbs.length > 0) {
            // 计算材料匹配度
            for (const [recipeName, recipe] of unknownRecipes) {
                const matchedMaterials = recipe.materials.filter(m => herbs.includes(m));
                if (matchedMaterials.length > 0) {
                    discoveryChance += (matchedMaterials.length / recipe.materials.length) * 0.3;
                }
            }
        }
        
        // 随机判定
        const roll = Math.random();
        const discovered = roll < discoveryChance;
        
        if (discovered) {
            // 随机选择一个未发现的丹方
            const [discoveredName, discoveredRecipe] = unknownRecipes[Math.floor(Math.random() * unknownRecipes.length)];
            
            // 更新知识图谱
            this.knowledgeGraph.recipes[discoveredName].discovered = true;
            this.gameState.alchemyKB.recipes[discoveredName].discovered = true;
            this.gameState.alchemyKB.totalDiscoveries++;
            this.gameState.alchemyKB.lastDiscoveryDate = Date.now();
            
            // 重建图谱
            this.buildKnowledgeGraph();
            
            return {
                success: true,
                discovered: discoveredName,
                materials: discoveredRecipe.materials,
                efficacies: discoveredRecipe.efficacies,
                qiSpent: cost,
                discoveryChance
            };
        }
        
        return {
            success: false,
            reason: '研究失败，未发现新丹方',
            qiSpent: cost,
            discoveryChance,
            roll
        };
    }
    
    /**
     * alchemy.recipe.list - 列出已发现的丹方
     */
    listRecipes(params) {
        if (!this.initialized) {
            return { success: false, error: '知识库未初始化' };
        }
        
        const { filter } = params || {};
        
        let recipes = Object.entries(this.knowledgeGraph.recipes)
            .filter(([, recipe]) => recipe.discovered)
            .map(([name, recipe]) => ({
                name,
                materials: recipe.materials,
                efficacies: recipe.efficacies
            }));
        
        if (filter) {
            recipes = recipes.filter(r => 
                r.name.includes(filter) ||
                r.materials.some(m => m.includes(filter)) ||
                r.efficacies.some(e => e.includes(filter))
            );
        }
        
        return {
            success: true,
            count: recipes.length,
            totalKnown: Object.keys(this.knowledgeGraph.recipes).length,
            recipes
        };
    }
    
    /**
     * alchemy.efficacy.map - 查看药材属性映射
     */
    getEfficacyMap(params) {
        if (!this.initialized) {
            return { success: false, error: '知识库未初始化' };
        }
        
        const { herb } = params || {};
        
        if (herb) {
            // 查询特定药材的属性
            const efficacies = this.knowledgeGraph.herbEfficacies[herb];
            if (!efficacies) {
                return { success: false, error: `药材 ${herb} 不存在` };
            }
            
            // 查找协同效应
            const synergyInfo = {};
            for (const eff of efficacies) {
                for (const [combo, result] of Object.entries(this.synergyEffects)) {
                    if (combo.includes(eff)) {
                        synergyInfo[combo] = result;
                    }
                }
            }
            
            return {
                success: true,
                herb,
                efficacies,
                synergies: synergyInfo
            };
        }
        
        // 返回所有药材属性映射
        return {
            success: true,
            totalHerbs: Object.keys(this.knowledgeGraph.herbEfficacies).length,
            herbEfficacyMap: { ...this.knowledgeGraph.herbEfficacies },
            synergyEffects: { ...this.synergyEffects }
        };
    }
    
    /**
     * alchemy.craft.calculate - 计算炼丹结果预览
     */
    calculateCraft(params) {
        if (!this.initialized) {
            return { success: false, error: '知识库未初始化' };
        }
        
        const { materials } = params || {};
        
        if (!materials || !Array.isArray(materials) || materials.length === 0) {
            return { success: false, error: '请提供材料列表' };
        }
        
        // 检查材料是否足够
        const materialCheck = this.checkMaterials(materials);
        if (!materialCheck.available) {
            return {
                success: false,
                error: '材料不足',
                missing: materialCheck.missing
            };
        }
        
        // 计算匹配到的丹方
        const matchedRecipes = [];
        for (const [recipeName, recipe] of Object.entries(this.knowledgeGraph.recipes)) {
            if (!recipe.discovered) continue;
            
            const matchedMaterials = recipe.materials.filter(m => materials.includes(m));
            const matchRatio = matchedMaterials.length / recipe.materials.length;
            
            if (matchRatio > 0) {
                matchedRecipes.push({
                    name: recipeName,
                    matchRatio,
                    matchDetails: {
                        matched: matchedMaterials,
                        required: recipe.materials,
                        missing: recipe.materials.filter(m => !materials.includes(m))
                    },
                    expectedEfficacies: recipe.efficacies
                });
            }
        }
        
        // 按匹配度排序
        matchedRecipes.sort((a, b) => b.matchRatio - a.matchRatio);
        
        // 计算协同效应
        const materialEfficacies = [];
        for (const mat of materials) {
            const effs = this.knowledgeGraph.herbEfficacies[mat];
            if (effs) {
                materialEfficacies.push(...effs);
            }
        }
        
        const activeSynergies = [];
        for (const [combo, result] of Object.entries(this.synergyEffects)) {
            const comboEffs = combo.split('+');
            if (comboEffs.every(e => materialEfficacies.includes(e))) {
                activeSynergies.push({ combo, result });
            }
        }
        
        // 预估品质
        let estimatedQuality = 'common';
        if (activeSynergies.length >= 2) {
            estimatedQuality = 'rare';
        }
        if (activeSynergies.length >= 3 || matchedRecipes[0]?.matchRatio === 1) {
            estimatedQuality = 'precious';
        }
        if (activeSynergies.length >= 4 && matchedRecipes[0]?.matchRatio === 1) {
            estimatedQuality = 'legendary';
        }
        
        return {
            success: true,
            inputMaterials: materials,
            matchedRecipes: matchedRecipes.slice(0, 5),
            activeSynergies,
            estimatedQuality,
            materialEfficacies: [...new Set(materialEfficacies)]
        };
    }
    
    /**
     * alchemy.kb.export - 导出知识图谱
     */
    exportKB(params) {
        if (!this.initialized) {
            return { success: false, error: '知识库未初始化' };
        }
        
        const { format, includeHidden } = params || {};
        
        const exportData = {
            meta: {
                exportedAt: new Date().toISOString(),
                totalNodes: this.knowledgeGraph.nodes.length,
                totalEdges: this.knowledgeGraph.edges.length,
                discoveredRecipes: Object.values(this.knowledgeGraph.recipes).filter(r => r.discovered).length,
                totalDiscoveries: this.gameState.alchemyKB?.totalDiscoveries || 0
            },
            nodes: this.knowledgeGraph.nodes,
            edges: this.knowledgeGraph.edges,
            recipes: includeHidden ? this.knowledgeGraph.recipes : 
                Object.fromEntries(
                    Object.entries(this.knowledgeGraph.recipes)
                        .map(([k, v]) => [k, { ...v, discoverProbability: undefined }])
                ),
            herbEfficacies: this.knowledgeGraph.herbEfficacies,
            synergyEffects: this.synergyEffects
        };
        
        if (format === 'json') {
            return {
                success: true,
                data: JSON.stringify(exportData, null, 2),
                mimeType: 'application/json'
            };
        }
        
        // 默认返回对象格式
        return {
            success: true,
            data: exportData
        };
    }
    
    // ===== 辅助方法 =====
    
    /**
     * 检查材料是否足够
     */
    checkMaterials(materials) {
        const missing = [];
        
        for (const mat of materials) {
            if (mat === '灵石') {
                // 灵石需要单独检查
                continue;
            }
            
            const hasItem = this.gameState.inventory.some(item =>
                item.name === mat && item.quantity >= 1
            );
            
            if (!hasItem) {
                missing.push(mat);
            }
        }
        
        return {
            available: missing.length === 0,
            missing
        };
    }
    
    /**
     * 根据炼丹结果发现新丹方
     */
    onCraftResult(craftResult) {
        if (!this.initialized || !craftResult?.success) return;
        
        const { materials, recipeName } = craftResult;
        
        // 检查是否有未知丹方可以发现
        const unknownRecipes = Object.entries(this.knowledgeGraph.recipes)
            .filter(([, recipe]) => !recipe.discovered);
        
        if (unknownRecipes.length === 0) return;
        
        // 根据使用材料计算发现概率
        const elementMastery = this.gameState.spiritRoot?.attributes?.wood || 0;
        let discoveryChance = 0.05 + (elementMastery / 200);
        
        // 检查材料匹配度
        for (const [name, recipe] of unknownRecipes) {
            const matchedMaterials = recipe.materials.filter(m => materials.includes(m));
            discoveryChance += (matchedMaterials.length / recipe.materials.length) * 0.1;
        }
        
        // 随机判定
        const roll = Math.random();
        if (roll < discoveryChance) {
            const [discoveredName, discoveredRecipe] = unknownRecipes[Math.floor(Math.random() * unknownRecipes.length)];
            
            this.knowledgeGraph.recipes[discoveredName].discovered = true;
            this.gameState.alchemyKB.recipes[discoveredName].discovered = true;
            this.gameState.alchemyKB.totalDiscoveries++;
            this.gameState.alchemyKB.lastDiscoveryDate = Date.now();
            
            this.buildKnowledgeGraph();
            
            return {
                discovered: true,
                recipeName: discoveredName,
                materials: discoveredRecipe.materials,
                efficacies: discoveredRecipe.efficacies
            };
        }
        
        return { discovered: false };
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalNodes: this.knowledgeGraph.nodes.length,
            totalEdges: this.knowledgeGraph.edges.length,
            discoveredRecipes: Object.values(this.knowledgeGraph.recipes).filter(r => r.discovered).length,
            totalRecipes: Object.keys(this.knowledgeGraph.recipes).length,
            herbCount: Object.keys(this.knowledgeGraph.herbEfficacies).length,
            totalDiscoveries: this.gameState.alchemyKB?.totalDiscoveries || 0,
            lastDiscovery: this.gameState.alchemyKB?.lastDiscoveryDate || null
        };
    }
}

// 导出单例
const alchemyKBService = new AlchemyKBService();

export { AlchemyKBService, alchemyKBService };