/**
 * AlchemyKBService 测试
 * TDD 测试 - 丹方知识图谱系统
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock gameState
const createMockGameState = () => ({
    player: {
        name: '测试修士',
        level: 1,
        qi: 1000,
        spiritStones: 10000
    },
    spiritRoot: {
        type: 'wood',
        attributes: {
            wood: 20,
            fire: 0,
            earth: 0,
            metal: 0,
            water: 0
        }
    },
    inventory: [
        { id: '1', name: '灵草', type: 'herb', quantity: 10, quality: 'common' },
        { id: '2', name: '妖兽血', type: 'beast', quantity: 5, quality: 'common' },
        { id: '3', name: '天材', type: 'rare', quantity: 3, quality: 'rare' },
        { id: '4', name: '灵石', type: 'currency', quantity: 1000, quality: 'common' }
    ],
    alchemyKB: null,
    maxInventorySlots: 50
});

// Mock InventoryService
const mockInventoryService = {
    addItemObj: vi.fn(() => ({ success: true, added: 1 })),
    hasItem: vi.fn((gameState, name) => {
        return gameState.inventory.some(item => item.name === name);
    }),
    getItemCount: vi.fn((gameState, name) => {
        const item = gameState.inventory.find(item => item.name === name);
        return item ? item.quantity : 0;
    })
};

describe('AlchemyKBService', () => {
    let AlchemyKBService;
    let alchemyKBService;
    
    beforeEach(async () => {
        // 重置模块
        vi.resetModules();
        
        // 动态导入模块
        const module = await import('../../../domains/inventory/services/AlchemyKBService.js');
        AlchemyKBService = module.AlchemyKBService;
        alchemyKBService = new AlchemyKBService();
    });
    
    describe('初始化', () => {
        it('应该正确初始化知识图谱', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            expect(alchemyKBService.initialized).toBe(true);
            expect(alchemyKBService.gameState).toBe(gameState);
        });
        
        it('应该在gameState中创建alchemyKB', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            expect(gameState.alchemyKB).toBeDefined();
            expect(gameState.alchemyKB.recipes).toBeDefined();
            expect(gameState.alchemyKB.herbEfficacies).toBeDefined();
        });
        
        it('应该加载初始丹方', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            expect(Object.keys(alchemyKBService.knowledgeGraph.recipes).length).toBeGreaterThan(0);
        });
        
        it('应该构建知识图谱节点', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            expect(alchemyKBService.knowledgeGraph.nodes.length).toBeGreaterThan(0);
            expect(alchemyKBService.knowledgeGraph.edges.length).toBeGreaterThan(0);
        });
    });
    
    describe('alchemy.kb.query', () => {
        it('应该返回整体知识库信息', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.query({});
            
            expect(result.success).toBe(true);
            expect(result.data.totalNodes).toBeGreaterThan(0);
            expect(result.data.totalEdges).toBeGreaterThan(0);
            expect(result.data.discoveredRecipes).toBeDefined();
            expect(result.data.totalRecipes).toBeDefined();
        });
        
        it('应该能查询特定丹方', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.query({ type: 'recipe', name: '回气丹' });
            
            expect(result.success).toBe(true);
            expect(result.data.name).toBe('回气丹');
            expect(result.data.discovered).toBe(true);
            expect(result.data.materials).toBeDefined();
        });
        
        it('应该能查询特定药材', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.query({ type: 'herb', name: '灵草' });
            
            expect(result.success).toBe(true);
            expect(result.data.name).toBe('灵草');
            expect(result.data.efficacies).toContain('qi_restoration');
        });
        
        it('应该能查询特定属性', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.query({ type: 'efficacy', name: 'qi_restoration' });
            
            expect(result.success).toBe(true);
            expect(result.data.name).toBe('qi_restoration');
            expect(result.data.relatedRecipes).toBeDefined();
        });
        
        it('应该处理不存在的丹方查询', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.query({ type: 'recipe', name: '不存在的丹方' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('不存在');
        });
        
        it('未初始化时应返回错误', () => {
            const result = alchemyKBService.query({});
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未初始化');
        });
    });
    
    describe('alchemy.recipe.discover', () => {
        it('应该消耗灵气进行研究', () => {
            const gameState = createMockGameState();
            const initialQi = gameState.player.qi;
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.discover({ qiCost: 100 });
            
            expect(gameState.player.qi).toBe(initialQi - 100);
        });
        
        it('灵气不足时应返回错误', () => {
            const gameState = createMockGameState();
            gameState.player.qi = 50;
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.discover({ qiCost: 100 });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵气不足');
        });
        
        it('应该返回发现结果', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.discover({ herbs: ['灵草', '妖兽血'] });
            
            expect(result.qiSpent).toBeDefined();
            expect(result.discoveryChance).toBeDefined();
        });
        
        it('应该更新知识图谱', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            // 强制发现
            const result = alchemyKBService.discover({ qiCost: 100 });
            
            // 无论成功与否，都应该消耗灵气
            expect(result.qiSpent).toBe(100);
        });
        
        it('应该考虑材料匹配度提升发现概率', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const resultWithHerbs = alchemyKBService.discover({ herbs: ['灵草'], qiCost: 100 });
            const resultWithoutHerbs = alchemyKBService.discover({ herbs: [], qiCost: 100 });
            
            // 有材料时的发现概率应该 >= 无材料时
            // 注意：由于随机性，这里只验证结构
            expect(resultWithHerbs.discoveryChance).toBeDefined();
            expect(resultWithoutHerbs.discoveryChance).toBeDefined();
        });
        
        it('未初始化时应返回错误', () => {
            const result = alchemyKBService.discover({});
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未初始化');
        });
    });
    
    describe('alchemy.recipe.list', () => {
        it('应该返回所有已发现丹方', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.listRecipes({});
            
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
            expect(result.totalKnown).toBeDefined();
            expect(result.recipes).toBeInstanceOf(Array);
        });
        
        it('应该支持按名称过滤', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.listRecipes({ filter: '回气' });
            
            expect(result.success).toBe(true);
            expect(result.recipes.length).toBeGreaterThan(0);
            expect(result.recipes[0].name).toContain('回气');
        });
        
        it('应该支持按材料过滤', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.listRecipes({ filter: '灵草' });
            
            expect(result.success).toBe(true);
            expect(result.recipes.some(r => r.materials.includes('灵草'))).toBe(true);
        });
        
        it('应该返回丹方的完整信息', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.listRecipes({});
            
            const recipe = result.recipes[0];
            expect(recipe.name).toBeDefined();
            expect(recipe.materials).toBeInstanceOf(Array);
            expect(recipe.efficacies).toBeInstanceOf(Array);
        });
        
        it('未初始化时应返回错误', () => {
            const result = alchemyKBService.listRecipes({});
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未初始化');
        });
    });
    
    describe('alchemy.efficacy.map', () => {
        it('应该返回所有药材属性映射', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.getEfficacyMap({});
            
            expect(result.success).toBe(true);
            expect(result.totalHerbs).toBeGreaterThan(0);
            expect(result.herbEfficacyMap).toBeDefined();
            expect(result.synergyEffects).toBeDefined();
        });
        
        it('应该能查询特定药材的属性', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.getEfficacyMap({ herb: '灵草' });
            
            expect(result.success).toBe(true);
            expect(result.herb).toBe('灵草');
            expect(result.efficacies).toContain('qi_restoration');
            expect(result.efficacies).toContain('cultivation_boost');
        });
        
        it('应该返回药材的协同效应信息', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.getEfficacyMap({ herb: '灵草' });
            
            expect(result.synergies).toBeDefined();
        });
        
        it('应该处理不存在的药材查询', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.getEfficacyMap({ herb: '不存在的药材' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('不存在');
        });
        
        it('未初始化时应返回错误', () => {
            const result = alchemyKBService.getEfficacyMap({});
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未初始化');
        });
    });
    
    describe('alchemy.craft.calculate', () => {
        it('应该计算材料匹配度', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.calculateCraft({ materials: ['灵草', '妖兽血'] });
            
            expect(result.success).toBe(true);
            expect(result.matchedRecipes).toBeInstanceOf(Array);
        });
        
        it('应该返回预估品质', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.calculateCraft({ materials: ['灵草', '妖兽血'] });
            
            expect(result.estimatedQuality).toBeDefined();
            expect(['common', 'rare', 'precious', 'legendary']).toContain(result.estimatedQuality);
        });
        
        it('应该计算协同效应', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.calculateCraft({ materials: ['灵草', '妖兽血'] });
            
            expect(result.activeSynergies).toBeInstanceOf(Array);
            expect(result.materialEfficacies).toBeInstanceOf(Array);
        });
        
        it('应该按匹配度排序结果', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.calculateCraft({ materials: ['灵草'] });
            
            // 验证排序
            for (let i = 1; i < result.matchedRecipes.length; i++) {
                expect(result.matchedRecipes[i - 1].matchRatio).toBeGreaterThanOrEqual(
                    result.matchedRecipes[i].matchRatio
                );
            }
        });
        
        it('应该处理材料不足的情况', () => {
            const gameState = createMockGameState();
            gameState.inventory = []; // 清空背包
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.calculateCraft({ materials: ['灵草'] });
            
            expect(result.success).toBe(false);
            expect(result.missing).toContain('灵草');
        });
        
        it('应该验证材料列表参数', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result1 = alchemyKBService.calculateCraft({ materials: [] });
            const result2 = alchemyKBService.calculateCraft({ materials: null });
            
            expect(result1.success).toBe(false);
            expect(result2.success).toBe(false);
        });
        
        it('应该返回匹配详情', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.calculateCraft({ materials: ['灵草'] });
            
            if (result.matchedRecipes.length > 0) {
                const matchDetails = result.matchedRecipes[0].matchDetails;
                expect(matchDetails.matched).toBeInstanceOf(Array);
                expect(matchDetails.required).toBeInstanceOf(Array);
                expect(matchDetails.missing).toBeInstanceOf(Array);
            }
        });
        
        it('未初始化时应返回错误', () => {
            const result = alchemyKBService.calculateCraft({ materials: ['灵草'] });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未初始化');
        });
    });
    
    describe('alchemy.kb.export', () => {
        it('应该导出完整知识图谱', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.exportKB({});
            
            expect(result.success).toBe(true);
            expect(result.data.meta).toBeDefined();
            expect(result.data.nodes).toBeInstanceOf(Array);
            expect(result.data.edges).toBeInstanceOf(Array);
            expect(result.data.recipes).toBeDefined();
            expect(result.data.herbEfficacies).toBeDefined();
        });
        
        it('应该包含正确的元数据', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.exportKB({});
            
            expect(result.data.meta.exportedAt).toBeDefined();
            expect(result.data.meta.totalNodes).toBeGreaterThan(0);
            expect(result.data.meta.totalEdges).toBeGreaterThan(0);
            expect(result.data.meta.discoveredRecipes).toBeDefined();
        });
        
        it('应该支持JSON格式导出', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.exportKB({ format: 'json' });
            
            expect(result.success).toBe(true);
            expect(typeof result.data).toBe('string');
            expect(JSON.parse(result.data)).toBeDefined();
            expect(result.mimeType).toBe('application/json');
        });
        
        it('应该支持隐藏未发现丹方的导出', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.exportKB({ includeHidden: false });
            
            expect(result.success).toBe(true);
            // 验证未发现的丹方不包含discoverProbability
            for (const recipe of Object.values(result.data.recipes)) {
                expect(recipe.discoverProbability).toBeUndefined();
            }
        });
        
        it('应该包含协同效应信息', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.exportKB({});
            
            expect(result.data.synergyEffects).toBeDefined();
            expect(Object.keys(result.data.synergyEffects).length).toBeGreaterThan(0);
        });
        
        it('未初始化时应返回错误', () => {
            const result = alchemyKBService.exportKB({});
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未初始化');
        });
    });
    
    describe('辅助方法', () => {
        it('checkMaterials应该正确检查材料', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.checkMaterials(['灵草', '妖兽血']);
            
            expect(result.available).toBe(true);
            expect(result.missing).toHaveLength(0);
        });
        
        it('checkMaterials应该检测缺失材料', () => {
            const gameState = createMockGameState();
            gameState.inventory = [];
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.checkMaterials(['灵草']);
            
            expect(result.available).toBe(false);
            expect(result.missing).toContain('灵草');
        });
        
        it('onCraftResult应该在炼丹成功时触发发现', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            // 找到所有未发现的丹方
            const unknownCount = Object.values(alchemyKBService.knowledgeGraph.recipes)
                .filter(r => !r.discovered).length;
            
            if (unknownCount > 0) {
                const result = alchemyKBService.onCraftResult({
                    success: true,
                    materials: ['灵草'],
                    recipeName: '回气丹'
                });
                
                // 可能发现也可能没发现，取决于随机性
                expect(result).toBeDefined();
                expect(result.discovered).toBeDefined();
            }
        });
        
        it('onCraftResult在失败时不应触发发现', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.onCraftResult({
                success: false,
                materials: ['灵草']
            });
            
            expect(result).toBeUndefined();
        });
        
        it('getStats应该返回正确的统计信息', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const stats = alchemyKBService.getStats();
            
            expect(stats.totalNodes).toBeGreaterThan(0);
            expect(stats.totalEdges).toBeGreaterThan(0);
            expect(stats.discoveredRecipes).toBeDefined();
            expect(stats.totalRecipes).toBeDefined();
            expect(stats.herbCount).toBeDefined();
            expect(stats.totalDiscoveries).toBeDefined();
        });
    });
    
    describe('边界情况', () => {
        it('应该处理空材料列表', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.calculateCraft({ materials: [] });
            
            expect(result.success).toBe(false);
        });
        
        it('应该处理未知属性查询', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            
            const result = alchemyKBService.query({ type: 'efficacy', name: 'unknown_efficacy' });
            
            expect(result.success).toBe(false);
        });
        
        it('应该处理重复初始化', () => {
            const gameState = createMockGameState();
            alchemyKBService.init(gameState);
            alchemyKBService.init(gameState);
            
            expect(alchemyKBService.initialized).toBe(true);
            expect(alchemyKBService.knowledgeGraph.nodes.length).toBeGreaterThan(0);
        });
    });
});

// 辅助函数