/**
 * HerbDiscoveryService Test Suite
 * V229 Direction Q续: 丹药丹方知识图谱 - 药材探索
 */

import { herbDiscoveryService } from '../../../../domains/inventory/services/HerbDiscoveryService.js';

describe('HerbDiscoveryService', () => {
    let mockGameState;
    
    beforeEach(() => {
        // 创建模拟游戏状态
        mockGameState = {
            days: 1,
            spiritRoot: {
                type: 'wood',
                attributes: {
                    metal: 10,
                    wood: 20,
                    water: 10,
                    fire: 5,
                    earth: 15
                }
            },
            herbDiscovery: {
                discoveredHerbs: ['灵芝', '虫草'],
                herbKnowledge: { metal: 5, wood: 10, water: 3, fire: 2, earth: 7 },
                totalExplorations: 10,
                successfulDiscoveries: 6,
                regionVisits: { '山林': 5, '湖泊': 3 },
                seasonHarvests: { '春': 2, '夏': 1 }
            }
        };
        
        // 重置服务状态
        herbDiscoveryService.initialized = false;
        herbDiscoveryService.discoveredHerbs = new Set();
        herbDiscoveryService.herbKnowledge = { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 };
        herbDiscoveryService.exploreCooldown = 0;
        
        // 初始化服务
        herbDiscoveryService.init(mockGameState);
    });
    
    afterEach(() => {
        herbDiscoveryService.initialized = false;
    });
    
    describe('init()', () => {
        test('should initialize with gameState', () => {
            expect(herbDiscoveryService.initialized).toBe(true);
            expect(herbDiscoveryService.gameState).toBe(mockGameState);
        });
        
        test('should load discovered herbs from gameState', () => {
            expect(herbDiscoveryService.discoveredHerbs.has('灵芝')).toBe(true);
            expect(herbDiscoveryService.discoveredHerbs.has('虫草')).toBe(true);
        });
        
        test('should load herb knowledge from gameState', () => {
            expect(herbDiscoveryService.herbKnowledge.wood).toBe(10);
            expect(herbDiscoveryService.herbKnowledge.metal).toBe(5);
        });
        
        test('should create default herbDiscovery state if not exists', () => {
            const newState = { days: 1 };
            herbDiscoveryService.init(newState);
            expect(newState.herbDiscovery).toBeDefined();
            expect(newState.herbDiscovery.discoveredHerbs).toEqual([]);
        });
    });
    
    describe('getCurrentSeason()', () => {
        test('should return spring for days 1-91', () => {
            mockGameState.days = 1;
            expect(herbDiscoveryService.getCurrentSeason()).toBe('春');
            
            mockGameState.days = 90;
            expect(herbDiscoveryService.getCurrentSeason()).toBe('春');
        });
        
        test('should return summer for days 92-182', () => {
            mockGameState.days = 100;
            expect(herbDiscoveryService.getCurrentSeason()).toBe('夏');
        });
        
        test('should return autumn for days 183-273', () => {
            mockGameState.days = 200;
            expect(herbDiscoveryService.getCurrentSeason()).toBe('秋');
        });
        
        test('should return winter for days 274-364', () => {
            mockGameState.days = 300;
            expect(herbDiscoveryService.getCurrentSeason()).toBe('冬');
        });
        
        test('should cycle back to spring after 365 days', () => {
            mockGameState.days = 370;
            expect(herbDiscoveryService.getCurrentSeason()).toBe('春');
        });
    });
    
    describe('calculateDiscoveryChance()', () => {
        test('should return base chance for common rarity', () => {
            const chance = herbDiscoveryService.calculateDiscoveryChance('common', 0);
            expect(chance).toBe(0.8);
        });
        
        test('should return base chance for uncommon rarity', () => {
            const chance = herbDiscoveryService.calculateDiscoveryChance('uncommon', 0);
            expect(chance).toBe(0.5);
        });
        
        test('should return base chance for rare rarity', () => {
            const chance = herbDiscoveryService.calculateDiscoveryChance('rare', 0);
            expect(chance).toBe(0.25);
        });
        
        test('should return base chance for legendary rarity', () => {
            const chance = herbDiscoveryService.calculateDiscoveryChance('legendary', 0);
            expect(chance).toBe(0.1);
        });
        
        test('should apply element bonus multiplier', () => {
            const chanceWithoutBonus = herbDiscoveryService.calculateDiscoveryChance('common', 0);
            const chanceWithBonus = herbDiscoveryService.calculateDiscoveryChance('common', 10);
            expect(chanceWithBonus).toBeGreaterThan(chanceWithoutBonus);
        });
        
        test('should cap chance at 0.95', () => {
            const chance = herbDiscoveryService.calculateDiscoveryChance('common', 100);
            expect(chance).toBeLessThanOrEqual(0.95);
        });
    });
    
    describe('calculateSynergy()', () => {
        test('should find synergy for matching herbs', () => {
            const synergies = herbDiscoveryService.calculateSynergy(['灵芝', '虫草']);
            expect(synergies.length).toBeGreaterThan(0);
            expect(synergies[0].effect).toBe('延年益寿');
        });
        
        test('should return empty for non-matching herbs', () => {
            const synergies = herbDiscoveryService.calculateSynergy(['甘草', '黄芪']);
            expect(synergies.length).toBe(0);
        });
        
        test('should sort synergies by efficiency descending', () => {
            const synergies = herbDiscoveryService.calculateSynergy(['灵芝', '虫草', '人参叶', '枸杞子']);
            expect(synergies.length).toBeGreaterThan(1);
            expect(synergies[0].efficiency).toBeGreaterThanOrEqual(synergies[1].efficiency);
        });
        
        test('should handle herbs not in synergy database', () => {
            const synergies = herbDiscoveryService.calculateSynergy(['甘草', '雪莲']);
            expect(Array.isArray(synergies)).toBe(true);
        });
    });
    
    describe('exploreRegion()', () => {
        test('should return error if not initialized', () => {
            herbDiscoveryService.initialized = false;
            const result = herbDiscoveryService.exploreRegion({ region: '山林' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('未初始化');
        });
        
        test('should return error for invalid region', () => {
            const result = herbDiscoveryService.exploreRegion({ region: '无效地域' });
            expect(result.success).toBe(false);
            expect(result.validRegions).toBeDefined();
            expect(result.validRegions).toContain('平原');
            expect(result.validRegions).toContain('山林');
            expect(result.validRegions).toContain('湖泊');
            expect(result.validRegions).toContain('沙漠');
            expect(result.validRegions).toContain('雪山');
            expect(result.validRegions).toContain('秘境');
        });
        
        test('should return exploration result for valid region', () => {
            const result = herbDiscoveryService.exploreRegion({ region: '山林' });
            expect(result.region).toBe('山林');
            expect(result.season).toBeDefined();
            expect(result.discoveryChance).toBeDefined();
        });
        
        test('should track exploration statistics', () => {
            herbDiscoveryService.exploreRegion({ region: '湖泊' });
            expect(mockGameState.herbDiscovery.totalExplorations).toBe(11);
            expect(mockGameState.herbDiscovery.regionVisits['湖泊']).toBe(4);
        });
        
        test('should handle cooldown mechanism', () => {
            // 第一次探索
            const result1 = herbDiscoveryService.exploreRegion({ region: '平原' });
            expect(result1.success !== undefined).toBe(true);
            
            // 立即第二次探索应该在冷却中
            herbDiscoveryService.exploreCooldown = Date.now() + 5000;
            const result2 = herbDiscoveryService.exploreRegion({ region: '平原' });
            expect(result2.success).toBe(false);
            expect(result2.error).toContain('冷却');
        });
        
        test('should include season info in result', () => {
            const result = herbDiscoveryService.exploreRegion({ region: '雪山' });
            expect(result.season).toBeDefined();
            expect(['春', '夏', '秋', '冬']).toContain(result.season);
        });
    });
    
    describe('querySeasonalHerbs()', () => {
        test('should return error if not initialized', () => {
            herbDiscoveryService.initialized = false;
            const result = herbDiscoveryService.querySeasonalHerbs({});
            expect(result.success).toBe(false);
        });
        
        test('should return current season herbs when no season specified', () => {
            const result = herbDiscoveryService.querySeasonalHerbs({});
            expect(result.success).toBe(true);
            expect(result.season).toBeDefined();
            expect(result.availableHerbs).toBeDefined();
            expect(Array.isArray(result.availableHerbs)).toBe(true);
        });
        
        test('should return herbs for specified season', () => {
            const result = herbDiscoveryService.querySeasonalHerbs({ season: '冬' });
            expect(result.success).toBe(true);
            expect(result.season).toBe('冬');
            expect(result.spawnRate).toBeDefined();
            expect(result.description).toBeDefined();
        });
        
        test('should return error for invalid season', () => {
            const result = herbDiscoveryService.querySeasonalHerbs({ season: '无效季节' });
            expect(result.success).toBe(false);
        });
        
        test('should include rarity counts', () => {
            const result = herbDiscoveryService.querySeasonalHerbs({ season: '春' });
            expect(result.rarityCounts).toBeDefined();
            expect(typeof result.rarityCounts.common).toBe('number');
            expect(typeof result.rarityCounts.uncommon).toBe('number');
        });
        
        test('should include bonus herbs', () => {
            const result = herbDiscoveryService.querySeasonalHerbs({ season: '秋' });
            expect(result.bonusHerbs).toBeDefined();
            expect(Array.isArray(result.bonusHerbs)).toBe(true);
        });
    });
    
    describe('listDiscoveredHerbs()', () => {
        test('should return error if not initialized', () => {
            herbDiscoveryService.initialized = false;
            const result = herbDiscoveryService.listDiscoveredHerbs({});
            expect(result.success).toBe(false);
        });
        
        test('should return all discovered herbs', () => {
            const result = herbDiscoveryService.listDiscoveredHerbs({});
            expect(result.success).toBe(true);
            expect(result.totalCount).toBe(2);
            expect(result.herbs).toContain('灵芝');
            expect(result.herbs).toContain('虫草');
        });
        
        test('should filter by rarity', () => {
            herbDiscoveryService.discoveredHerbs.add('甘草');
            const result = herbDiscoveryService.listDiscoveredHerbs({ rarity: 'common' });
            expect(result.success).toBe(true);
            expect(result.herbs).toContain('甘草');
        });
        
        test('should filter by name', () => {
            const result = herbDiscoveryService.listDiscoveredHerbs({ filter: '灵' });
            expect(result.success).toBe(true);
            expect(result.herbs.every(h => h.includes('灵'))).toBe(true);
        });
        
        test('should include statistics', () => {
            const result = herbDiscoveryService.listDiscoveredHerbs({});
            expect(result.stats).toBeDefined();
            expect(result.stats.totalExplorations).toBe(10);
            expect(result.stats.successfulDiscoveries).toBe(6);
            expect(result.stats.discoveryRate).toBe('60.0%');
        });
        
        test('should include classified herbs', () => {
            const result = herbDiscoveryService.listDiscoveredHerbs({});
            expect(result.classified).toBeDefined();
            expect(result.classified.common).toBeDefined();
            expect(result.classified.uncommon).toBeDefined();
            expect(result.classified.rare).toBeDefined();
            expect(result.classified.legendary).toBeDefined();
        });
    });
    
    describe('classifyHerbsByRarity()', () => {
        test('should return error if not initialized', () => {
            herbDiscoveryService.initialized = false;
            const result = herbDiscoveryService.classifyHerbsByRarity({});
            expect(result.success).toBe(false);
        });
        
        test('should return classification for specific herb', () => {
            const result = herbDiscoveryService.classifyHerbsByRarity({ herb: '灵芝' });
            expect(result.success).toBe(true);
            expect(result.herb).toBe('灵芝');
            expect(result.rarity).toBeDefined();
            expect(result.rarityName).toBeDefined();
            expect(result.color).toBeDefined();
            expect(result.discoveryChance).toBeDefined();
            expect(result.masteryBonus).toBeDefined();
        });
        
        test('should return error for unknown herb', () => {
            const result = herbDiscoveryService.classifyHerbsByRarity({ herb: '不存在的药材' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('不存在的药材');
        });
        
        test('should return full classification when no herb specified', () => {
            const result = herbDiscoveryService.classifyHerbsByRarity({});
            expect(result.success).toBe(true);
            expect(result.classification).toBeDefined();
            expect(result.classification.common).toBeDefined();
            expect(result.classification.uncommon).toBeDefined();
            expect(result.classification.rare).toBeDefined();
            expect(result.classification.legendary).toBeDefined();
            expect(result.totalHerbs).toBeGreaterThan(0);
        });
        
        test('should include regions for specific herb', () => {
            const result = herbDiscoveryService.classifyHerbsByRarity({ herb: '雪莲' });
            expect(result.success).toBe(true);
            expect(result.regions).toBeDefined();
            expect(Array.isArray(result.regions)).toBe(true);
            expect(result.regions.length).toBeGreaterThan(0);
        });
    });
    
    describe('analyzeSynergy()', () => {
        test('should return error if not initialized', () => {
            herbDiscoveryService.initialized = false;
            const result = herbDiscoveryService.analyzeSynergy({ herbs: ['灵芝', '虫草'] });
            expect(result.success).toBe(false);
        });
        
        test('should return error for less than 2 herbs', () => {
            const result = herbDiscoveryService.analyzeSynergy({ herbs: ['灵芝'] });
            expect(result.success).toBe(false);
            expect(result.error).toContain('至少2种');
        });
        
        test('should return error for non-array input', () => {
            const result = herbDiscoveryService.analyzeSynergy({ herbs: '灵芝' });
            expect(result.success).toBe(false);
        });
        
        test('should find synergies for matching herbs', () => {
            const result = herbDiscoveryService.analyzeSynergy({ herbs: ['灵芝', '虫草'] });
            expect(result.success).toBe(true);
            expect(result.synergies.length).toBeGreaterThan(0);
            expect(result.hasSynergy).toBe(true);
            expect(result.totalEfficiency).toBeGreaterThan(0);
        });
        
        test('should track discovered vs missing count', () => {
            const result = herbDiscoveryService.analyzeSynergy({ herbs: ['灵芝', '虫草', '天麻'] });
            expect(result.success).toBe(true);
            expect(result.discoveredCount).toBe(2);
            expect(result.missingCount).toBe(1);
        });
        
        test('should suggest possible combos', () => {
            const result = herbDiscoveryService.analyzeSynergy({ herbs: ['灵芝'] });
            expect(result.success).toBe(true);
            expect(result.possibleCombos).toBeDefined();
            expect(Array.isArray(result.possibleCombos)).toBe(true);
        });
        
        test('should return empty synergies for non-matching herbs', () => {
            const result = herbDiscoveryService.analyzeSynergy({ herbs: ['甘草', '黄芪'] });
            expect(result.success).toBe(true);
            expect(result.synergies.length).toBe(0);
            expect(result.hasSynergy).toBe(false);
        });
    });
    
    describe('gainHerbKnowledge()', () => {
        test('should return error if not initialized', () => {
            herbDiscoveryService.initialized = false;
            const result = herbDiscoveryService.gainHerbKnowledge({ element: 'wood', amount: 1 });
            expect(result.success).toBe(false);
        });
        
        test('should return error for invalid element', () => {
            const result = herbDiscoveryService.gainHerbKnowledge({ element: 'invalid', amount: 1 });
            expect(result.success).toBe(false);
            expect(result.validElements).toBeDefined();
        });
        
        test('should increase knowledge for specific element', () => {
            const oldLevel = herbDiscoveryService.herbKnowledge.wood;
            const result = herbDiscoveryService.gainHerbKnowledge({ element: 'wood', amount: 5 });
            expect(result.success).toBe(true);
            expect(result.newLevel).toBe(oldLevel + 5);
            expect(result.knowledgeGain).toBe(5);
        });
        
        test('should detect level up', () => {
            herbDiscoveryService.herbKnowledge.wood = 9;
            const result = herbDiscoveryService.gainHerbKnowledge({ element: 'wood', amount: 2 });
            expect(result.success).toBe(true);
            expect(result.levelUp).toBe(true);
        });
        
        test('should return all knowledge when no element specified', () => {
            const result = herbDiscoveryService.gainHerbKnowledge({});
            expect(result.success).toBe(true);
            expect(result.herbKnowledge).toBeDefined();
            expect(result.totalKnowledge).toBeDefined();
            expect(result.overallBonus).toBeDefined();
            expect(result.levelSummary).toBeDefined();
        });
        
        test('should include element descriptions', () => {
            const result = herbDiscoveryService.gainHerbKnowledge({});
            expect(result.elementDescriptions).toBeDefined();
            expect(result.elementDescriptions.metal).toContain('金');
            expect(result.elementDescriptions.wood).toContain('木');
        });
        
        test('should save knowledge to gameState', () => {
            herbDiscoveryService.gainHerbKnowledge({ element: 'fire', amount: 3 });
            expect(mockGameState.herbDiscovery.herbKnowledge.fire).toBe(3);
        });
        
        test('should use default amount of 1', () => {
            const oldLevel = herbDiscoveryService.herbKnowledge.water;
            herbDiscoveryService.gainHerbKnowledge({ element: 'water' });
            expect(herbDiscoveryService.herbKnowledge.water).toBe(oldLevel + 1);
        });
    });
    
    describe('getStatus()', () => {
        test('should return service status', () => {
            const status = herbDiscoveryService.getStatus();
            expect(status.initialized).toBe(true);
            expect(status.discoveredCount).toBe(2);
            expect(status.totalKnowledge).toBeDefined();
            expect(typeof status.totalKnowledge).toBe('number');
        });
        
        test('should include cooldown info', () => {
            const status = herbDiscoveryService.getStatus();
            expect(status.cooldownActive).toBeDefined();
            expect(typeof status.cooldownActive).toBe('boolean');
            expect(status.cooldownRemaining).toBeDefined();
        });
        
        test('should include current season', () => {
            const status = herbDiscoveryService.getStatus();
            expect(status.currentSeason).toBeDefined();
            expect(['春', '夏', '秋', '冬']).toContain(status.currentSeason);
        });
        
        test('should include exploration stats', () => {
            const status = herbDiscoveryService.getStatus();
            expect(status.stats).toBeDefined();
            expect(status.stats.totalExplorations).toBe(10);
            expect(status.stats.successfulDiscoveries).toBe(6);
        });
    });
    
    describe('regionHerbs database', () => {
        test('should have all required regions', () => {
            const regions = Object.keys(herbDiscoveryService.regionHerbs);
            expect(regions).toContain('平原');
            expect(regions).toContain('山林');
            expect(regions).toContain('湖泊');
            expect(regions).toContain('沙漠');
            expect(regions).toContain('雪山');
            expect(regions).toContain('秘境');
        });
        
        test('each region should have common herbs', () => {
            for (const region of Object.keys(herbDiscoveryService.regionHerbs)) {
                expect(herbDiscoveryService.regionHerbs[region].common.length).toBeGreaterThan(0);
            }
        });
        
        test('each region should have rarity levels', () => {
            const rarityLevels = ['common', 'uncommon', 'rare', 'legendary'];
            for (const region of Object.keys(herbDiscoveryService.regionHerbs)) {
                for (const rarity of rarityLevels) {
                    expect(herbDiscoveryService.regionHerbs[region][rarity]).toBeDefined();
                }
            }
        });
    });
    
    describe('seasonalHerbs database', () => {
        test('should have all four seasons', () => {
            const seasons = Object.keys(herbDiscoveryService.seasonalHerbs);
            expect(seasons).toContain('春');
            expect(seasons).toContain('夏');
            expect(seasons).toContain('秋');
            expect(seasons).toContain('冬');
        });
        
        test('each season should have available herbs and bonus herbs', () => {
            for (const season of Object.keys(herbDiscoveryService.seasonalHerbs)) {
                expect(herbDiscoveryService.seasonalHerbs[season].available).toBeDefined();
                expect(Array.isArray(herbDiscoveryService.seasonalHerbs[season].available)).toBe(true);
                expect(herbDiscoveryService.seasonalHerbs[season].bonus).toBeDefined();
                expect(Array.isArray(herbDiscoveryService.seasonalHerbs[season].bonus)).toBe(true);
                expect(herbDiscoveryService.seasonalHerbs[season].spawnRate).toBeDefined();
            }
        });
    });
    
    describe('rarityLevels', () => {
        test('should have all four rarity levels', () => {
            const levels = Object.keys(herbDiscoveryService.rarityLevels);
            expect(levels).toContain('common');
            expect(levels).toContain('uncommon');
            expect(levels).toContain('rare');
            expect(levels).toContain('legendary');
        });
        
        test('each rarity should have name, color, discoveryChance, masteryBonus', () => {
            for (const rarity of Object.keys(herbDiscoveryService.rarityLevels)) {
                const level = herbDiscoveryService.rarityLevels[rarity];
                expect(level.name).toBeDefined();
                expect(level.color).toBeDefined();
                expect(level.discoveryChance).toBeDefined();
                expect(level.masteryBonus).toBeDefined();
            }
        });
        
        test('common should have highest discovery chance', () => {
            expect(herbDiscoveryService.rarityLevels.common.discoveryChance).toBeGreaterThan(
                herbDiscoveryService.rarityLevels.uncommon.discoveryChance
            );
            expect(herbDiscoveryService.rarityLevels.uncommon.discoveryChance).toBeGreaterThan(
                herbDiscoveryService.rarityLevels.rare.discoveryChance
            );
            expect(herbDiscoveryService.rarityLevels.rare.discoveryChance).toBeGreaterThan(
                herbDiscoveryService.rarityLevels.legendary.discoveryChance
            );
        });
    });
    
    describe('herbSynergies', () => {
        test('should have valid synergy effects', () => {
            for (const [combo, effect] of Object.entries(herbDiscoveryService.herbSynergies)) {
                expect(effect.result).toBeDefined();
                expect(effect.efficiency).toBeDefined();
                expect(typeof effect.efficiency).toBe('number');
                expect(effect.efficiency).toBeGreaterThan(0);
            }
        });
        
        test('combo format should be herb1+herb2', () => {
            for (const combo of Object.keys(herbDiscoveryService.herbSynergies)) {
                expect(combo).toMatch(/^[^+]+\+[^+]+$/);
            }
        });
    });
    
    describe('edge cases', () => {
        test('should handle empty gameState', () => {
            const emptyState = {};
            herbDiscoveryService.init(emptyState);
            expect(herbDiscoveryService.initialized).toBe(true);
            expect(emptyState.herbDiscovery).toBeDefined();
        });
        
        test('should handle missing spiritRoot attributes', () => {
            mockGameState.spiritRoot = { type: 'wood' };
            const result = herbDiscoveryService.exploreRegion({ region: '平原', useMastery: true });
            expect(result.success !== undefined).toBe(true);
        });
        
        test('should handle missing herbDiscovery in gameState', () => {
            delete mockGameState.herbDiscovery;
            herbDiscoveryService.init(mockGameState);
            expect(mockGameState.herbDiscovery).toBeDefined();
        });
    });
});

// ===== Run tests =====
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    // Jest or Vitest environment
    module.exports = {};
}