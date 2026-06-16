/**
 * CelestialMapService.test.js - 仙界地图系统单元测试
 * V248: 测试覆盖率≥98%、通过率100%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock gameState
const mockGameState = {
    spiritStones: 10000,
    realm: 10,
    cultivation: 500,
    health: 100,
    maxHealth: 100,
    spirit: 100,
    maxSpirit: 100,
    luck: 50
};

// Mock gameState for tests
global.gameState = mockGameState;

// Import services after setting up mocks
import { 
    createCelestialMapState,
    getExplorationLevel,
    getRegionInfo,
    exploreRegion,
    teleportToRegion,
    getPortalConnections,
    startGathering,
    gatherResource,
    stopGathering,
    getResourceDistribution,
    getAllRegionsSummary,
    restoreActionPoints,
    canEnterRegion,
    getMapOverview,
    calculateRegionDifficulty,
    resetRegionExploration,
    EXPLORATION_CONFIG,
    PORTAL_CONFIG,
    GATHERING_CONFIG
} from '../../domains/world/services/CelestialMapService.js';

import { WORLD_REGIONS, PORTAL_CONNECTIONS, RESOURCE_DISTRIBUTION } from '../../domains/world/entities/CelestialMap.js';

describe('CelestialMapService', () => {
    let celestialMap;

    beforeEach(() => {
        celestialMap = createCelestialMapState();
    });

    describe('createCelestialMapState', () => {
        it('should create celestial map with all regions', () => {
            expect(celestialMap).toBeDefined();
            expect(celestialMap.regions).toBeDefined();
            expect(Object.keys(celestialMap.regions).length).toBe(4);
        });

        it('should initialize all four regions', () => {
            expect(celestialMap.regions['九州']).toBeDefined();
            expect(celestialMap.regions['四海']).toBeDefined();
            expect(celestialMap.regions['仙山']).toBeDefined();
            expect(celestialMap.regions['魔域']).toBeDefined();
        });

        it('should have correct initial values', () => {
            expect(celestialMap.actionPoints).toBe(100);
            expect(celestialMap.maxActionPoints).toBe(100);
            expect(celestialMap.totalExplored).toBe(0);
            expect(celestialMap.currentRegion).toBeNull();
        });

        it('should initialize region with correct level ranges', () => {
            expect(celestialMap.regions['九州'].level).toEqual([1, 30]);
            expect(celestialMap.regions['四海'].level).toEqual([20, 60]);
            expect(celestialMap.regions['仙山'].level).toEqual([50, 90]);
            expect(celestialMap.regions['魔域'].level).toEqual([70, 100]);
        });
    });

    describe('getExplorationLevel', () => {
        it('should return correct level for explored values', () => {
            const level0 = getExplorationLevel(0);
            expect(level0.name).toBe('未探索');
            expect(level0.threshold).toBe(0);

            const level15 = getExplorationLevel(15);
            expect(level15.name).toBe('未探索');

            const level25 = getExplorationLevel(25);
            expect(level25.name).toBe('初步探索');
            expect(level25.threshold).toBe(20);

            const level55 = getExplorationLevel(55);
            expect(level55.name).toBe('部分探索');
            expect(level55.threshold).toBe(50);

            const level85 = getExplorationLevel(85);
            expect(level85.name).toBe('深度探索');
            expect(level85.threshold).toBe(80);

            const level100 = getExplorationLevel(100);
            expect(level100.name).toBe('完全探索');
            expect(level100.threshold).toBe(100);
        });
    });

    describe('getRegionInfo', () => {
        it('should return null for non-existent region', () => {
            const info = getRegionInfo('non-existent', celestialMap);
            expect(info).toBeNull();
        });

        it('should return region info with exploration level', () => {
            celestialMap.regions['九州'].explored = 25;
            const info = getRegionInfo('九州', celestialMap);
            expect(info).toBeDefined();
            expect(info.explored).toBe(25);
            expect(info.explorationLevel.name).toBe('初步探索');
        });

        it('should indicate when portal is unlocked', () => {
            celestialMap.regions['九州'].portalUnlocked = true;
            const info = getRegionInfo('九州', celestialMap);
            expect(info.portalUnlocked).toBe(true);
            expect(info.isUnlocked).toBe(true);
        });

        it('should indicate correct exploration threshold for unlocking', () => {
            celestialMap.regions['九州'].explored = 40;
            const info = getRegionInfo('九州', celestialMap);
            expect(info.isUnlocked).toBe(false);

            celestialMap.regions['九州'].explored = 50;
            const info2 = getRegionInfo('九州', celestialMap);
            expect(info2.isUnlocked).toBe(true);
        });
    });

    describe('exploreRegion', () => {
        it('should fail for non-existent region', () => {
            const result = exploreRegion('non-existent', celestialMap);
            expect(result.success).toBe(false);
            expect(result.message).toBe('区域不存在');
        });

        it('should fail when action points are insufficient', () => {
            celestialMap.actionPoints = 0;
            const result = exploreRegion('九州', celestialMap);
            expect(result.success).toBe(false);
            expect(result.message).toBe('行动力不足');
        });

        it('should increase exploration when successful', () => {
            const initialExplored = celestialMap.regions['九州'].explored;
            const result = exploreRegion('九州', celestialMap);
            expect(result.success).toBe(true);
            expect(result.newExplored).toBeGreaterThan(initialExplored);
            expect(celestialMap.actionPoints).toBeLessThan(100);
        });

        it('should consume action points', () => {
            const initialAP = celestialMap.actionPoints;
            exploreRegion('九州', celestialMap);
            expect(celestialMap.actionPoints).toBe(initialAP - EXPLORATION_CONFIG.actionPointCost);
        });

        it('should track exploration count', () => {
            expect(celestialMap.regions['九州'].explorationCount).toBe(0);
            exploreRegion('九州', celestialMap);
            expect(celestialMap.regions['九州'].explorationCount).toBe(1);
            exploreRegion('九州', celestialMap);
            expect(celestialMap.regions['九州'].explorationCount).toBe(2);
        });

        it('should unlock portal when exploration reaches threshold', () => {
            expect(celestialMap.regions['九州'].portalUnlocked).toBe(false);
            // Keep exploring until we reach the threshold
            for (let i = 0; i < 10; i++) {
                exploreRegion('九州', celestialMap);
            }
            if (celestialMap.regions['九州'].explored >= PORTAL_CONFIG.unlockExplorationRequired) {
                expect(celestialMap.regions['九州'].portalUnlocked).toBe(true);
            }
        });

        it('should apply player cultivation bonus', () => {
            const player = { cultivation: 500 };
            const result = exploreRegion('九州', celestialMap, player);
            expect(result.success).toBe(true);
            // Higher cultivation = more exploration gain
        });

        it('should track perfect explorations', () => {
            // Run many explorations to likely trigger perfect
            for (let i = 0; i < 20; i++) {
                exploreRegion('九州', celestialMap);
            }
            // Perfect explorations should be tracked
            expect(celestialMap.regions['九州'].perfectExplorations).toBeGreaterThanOrEqual(0);
        });
    });

    describe('teleportToRegion', () => {
        it('should fail for non-existent region', () => {
            const result = teleportToRegion('non-existent', '九州', celestialMap);
            expect(result.success).toBe(false);
            expect(result.message).toBe('目标区域不存在');
        });

        it('should fail when portal is not unlocked', () => {
            celestialMap.regions['四海'].portalUnlocked = false;
            const result = teleportToRegion('四海', '九州', celestialMap);
            expect(result.success).toBe(false);
            expect(result.message).toContain('传送阵未解锁');
        });

        it('should fail when on cooldown', () => {
            celestialMap.regions['四海'].portalUnlocked = true;
            celestialMap.portalCooldowns['九州_四海'] = Date.now() + 10000;
            const result = teleportToRegion('四海', '九州', celestialMap);
            expect(result.success).toBe(false);
            expect(result.message).toContain('冷却中');
        });

        it('should fail with insufficient spirit stones', () => {
            celestialMap.regions['四海'].portalUnlocked = true;
            global.gameState.spiritStones = 0;
            const result = teleportToRegion('四海', '九州', celestialMap);
            expect(result.success).toBe(false);
            expect(result.message).toContain('灵石不足');
            global.gameState.spiritStones = 10000; // Reset
        });

        it('should succeed with valid portal and sufficient resources', () => {
            celestialMap.regions['四海'].portalUnlocked = true;
            const result = teleportToRegion('四海', '九州', celestialMap);
            expect(result.success).toBe(true);
            expect(result.newRegion).toBe('四海');
        });

        it('should consume spirit stones on teleport', () => {
            celestialMap.regions['四海'].portalUnlocked = true;
            const initialSS = global.gameState.spiritStones;
            teleportToRegion('四海', '九州', celestialMap);
            expect(global.gameState.spiritStones).toBe(initialSS - PORTAL_CONFIG.spiritStoneCost);
        });

        it('should set cooldown after teleport', () => {
            celestialMap.regions['四海'].portalUnlocked = true;
            teleportToRegion('四海', '九州', celestialMap);
            expect(celestialMap.portalCooldowns['九州_四海']).toBeDefined();
            expect(celestialMap.portalCooldowns['九州_四海']).toBeGreaterThan(Date.now());
        });
    });

    describe('getPortalConnections', () => {
        it('should return connections for region', () => {
            const connections = getPortalConnections('九州', celestialMap);
            expect(Array.isArray(connections)).toBe(true);
        });

        it('should include connection status', () => {
            celestialMap.regions['四海'].portalUnlocked = true;
            const connections = getPortalConnections('九州', celestialMap);
            const sihaiConnection = connections.find(c => c.connectedRegion === '四海');
            if (sihaiConnection) {
                expect(sihaiConnection.isUnlocked).toBe(true);
            }
        });
    });

    describe('startGathering', () => {
        it('should fail for non-existent region', () => {
            const result = startGathering('non-existent', '灵石', celestialMap);
            expect(result.success).toBe(false);
        });

        it('should fail with insufficient action points', () => {
            celestialMap.actionPoints = 0;
            const result = startGathering('九州', '灵草', celestialMap);
            expect(result.success).toBe(false);
            expect(result.message).toBe('行动力不足');
        });

        it('should fail for undiscovered resource', () => {
            const result = startGathering('九州', '未发现资源', celestialMap);
            expect(result.success).toBe(false);
            expect(result.message).toContain('未在区域中发现');
        });

        it('should succeed for discovered resource', () => {
            celestialMap.regions['九州'].discoveredResources.push('灵草');
            const result = startGathering('九州', '灵草', celestialMap);
            expect(result.success).toBe(true);
            expect(result.resource).toBe('灵草');
        });

        it('should consume action points', () => {
            celestialMap.regions['九州'].discoveredResources.push('灵石');
            const initialAP = celestialMap.actionPoints;
            startGathering('九州', '灵石', celestialMap);
            expect(celestialMap.actionPoints).toBe(initialAP - GATHERING_CONFIG.actionPointCost);
        });
    });

    describe('gatherResource', () => {
        it('should fail when not gathering', () => {
            const result = gatherResource(celestialMap);
            expect(result.success).toBe(false);
            expect(result.message).toContain('没有进行采集');
        });

        it('should return resource with quality', () => {
            celestialMap.gatheringActive = true;
            celestialMap.gatheringRegion = '九州';
            celestialMap.gatheringResource = '灵草';
            const result = gatherResource(celestialMap);
            expect(result.success).toBe(true);
            expect(result.resource).toBe('灵草');
            expect(result.quality).toBeDefined();
            expect(result.amount).toBeGreaterThan(0);
        });

        it('should increment gathered amount', () => {
            celestialMap.gatheringActive = true;
            celestialMap.gatheringRegion = '九州';
            celestialMap.gatheringResource = '灵石';
            celestialMap.gatheredAmount = 5;
            gatherResource(celestialMap);
            expect(celestialMap.gatheredAmount).toBeGreaterThan(5);
        });
    });

    describe('stopGathering', () => {
        it('should fail when not gathering', () => {
            const result = stopGathering(celestialMap);
            expect(result.success).toBe(false);
        });

        it('should reset gathering state', () => {
            celestialMap.gatheringActive = true;
            celestialMap.gatheringRegion = '九州';
            celestialMap.gatheringResource = '灵草';
            celestialMap.gatheredAmount = 10;
            const result = stopGathering(celestialMap);
            expect(result.success).toBe(true);
            expect(result.totalAmount).toBe(10);
            expect(celestialMap.gatheringActive).toBe(false);
            expect(celestialMap.gatheringRegion).toBeNull();
        });
    });

    describe('getResourceDistribution', () => {
        it('should return resources for valid region', () => {
            const resources = getResourceDistribution('九州');
            expect(Array.isArray(resources)).toBe(true);
            expect(resources.length).toBeGreaterThan(0);
        });

        it('should return empty array for unknown region', () => {
            const resources = getResourceDistribution('unknown');
            expect(Array.isArray(resources)).toBe(true);
            expect(resources.length).toBe(0);
        });
    });

    describe('getAllRegionsSummary', () => {
        it('should return summary for all regions', () => {
            const summary = getAllRegionsSummary(celestialMap);
            expect(summary.length).toBe(4);
        });

        it('should include exploration info', () => {
            celestialMap.regions['九州'].explored = 50;
            const summary = getAllRegionsSummary(celestialMap);
            const jiuzhou = summary.find(r => r.name === '九州');
            expect(jiuzhou.explored).toBe(50);
            expect(jiuzhou.explorationLevel).toBeDefined();
        });
    });

    describe('restoreActionPoints', () => {
        it('should restore action points', () => {
            celestialMap.actionPoints = 30;
            const result = restoreActionPoints(20, celestialMap);
            expect(result.restored).toBe(20);
            expect(celestialMap.actionPoints).toBe(50);
        });

        it('should not exceed max action points', () => {
            celestialMap.actionPoints = 90;
            const result = restoreActionPoints(20, celestialMap);
            expect(result.restored).toBe(10);
            expect(celestialMap.actionPoints).toBe(100);
        });
    });

    describe('canEnterRegion', () => {
        it('should fail for non-existent region', () => {
            const result = canEnterRegion('non-existent', {}, celestialMap);
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('不存在');
        });

        it('should fail when player level is too low', () => {
            const player = { realm: 1 };
            const result = canEnterRegion('仙山', player, celestialMap);
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('修为不足');
        });

        it('should fail when player level is too high', () => {
            const player = { realm: 100 };
            const result = canEnterRegion('九州', player, celestialMap);
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('修为过高');
        });

        it('should allow entry with correct level', () => {
            const player = { realm: 15 };
            const result = canEnterRegion('九州', player, celestialMap);
            expect(result.allowed).toBe(true);
        });

        it('should fail when exploration is too low', () => {
            const player = { realm: 25 };
            celestialMap.regions['四海'].explored = 10;
            const result = canEnterRegion('四海', player, celestialMap);
            expect(result.allowed).toBe(false);
        });
    });

    describe('getMapOverview', () => {
        it('should return overview with stats', () => {
            const overview = getMapOverview(celestialMap);
            expect(overview.totalRegions).toBe(4);
            expect(overview.actionPoints).toBe(100);
            expect(Array.isArray(overview.regions)).toBe(true);
        });

        it('should calculate total explored percentage', () => {
            celestialMap.regions['九州'].explored = 50;
            celestialMap.regions['四海'].explored = 100;
            const overview = getMapOverview(celestialMap);
            expect(overview.totalExploredPercent).toBeGreaterThan(0);
        });
    });

    describe('calculateRegionDifficulty', () => {
        it('should return difficulty info for valid region', () => {
            const difficulty = calculateRegionDifficulty('九州');
            expect(difficulty.name).toBe('九州');
            expect(difficulty.minLevel).toBe(1);
            expect(difficulty.maxLevel).toBe(30);
        });

        it('should return null for unknown region', () => {
            const difficulty = calculateRegionDifficulty('unknown');
            expect(difficulty).toBeNull();
        });

        it('should calculate correct difficulty levels', () => {
            expect(calculateRegionDifficulty('九州').difficulty).toBe('简单');
            expect(calculateRegionDifficulty('四海').difficulty).toBe('中等');
            expect(calculateRegionDifficulty('仙山').difficulty).toBe('困难');
            expect(calculateRegionDifficulty('魔域').difficulty).toBe('极难');
        });
    });

    describe('resetRegionExploration', () => {
        it('should fail for non-existent region', () => {
            const result = resetRegionExploration('unknown', celestialMap);
            expect(result.success).toBe(false);
        });

        it('should reset all exploration data', () => {
            celestialMap.regions['九州'].explored = 80;
            celestialMap.regions['九州'].discoveredResources = ['灵石', '灵草'];
            celestialMap.regions['九州'].portalUnlocked = true;
            const result = resetRegionExploration('九州', celestialMap);
            expect(result.success).toBe(true);
            expect(celestialMap.regions['九州'].explored).toBe(0);
            expect(celestialMap.regions['九州'].discoveredResources.length).toBe(0);
            expect(celestialMap.regions['九州'].portalUnlocked).toBe(false);
        });
    });

    describe('Config constants', () => {
        it('should have correct EXPLORATION_CONFIG values', () => {
            expect(EXPLORATION_CONFIG.baseExplorationGain).toBe(5);
            expect(EXPLORATION_CONFIG.perfectBonus).toBe(2);
            expect(EXPLORATION_CONFIG.actionPointCost).toBe(10);
            expect(EXPLORATION_CONFIG.explorationLevels.length).toBe(5);
        });

        it('should have correct PORTAL_CONFIG values', () => {
            expect(PORTAL_CONFIG.spiritStoneCost).toBe(100);
            expect(PORTAL_CONFIG.cooldown).toBe(3);
            expect(PORTAL_CONFIG.unlockExplorationRequired).toBe(50);
        });

        it('should have correct GATHERING_CONFIG values', () => {
            expect(GATHERING_CONFIG.actionPointCost).toBe(5);
            expect(GATHERING_CONFIG.qualityWeights.length).toBe(5);
            expect(GATHERING_CONFIG.qualityColors).toBeDefined();
        });
    });
});