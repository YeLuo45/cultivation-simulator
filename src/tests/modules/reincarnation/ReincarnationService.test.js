/**
 * ReincarnationService TDD Tests
 * Direction M: 悟道境轮回系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReincarnationService } from '../../../domains/reincarnation/services/ReincarnationService.js';
import {
    MEMORY_LAYERS,
    CRYSTAL_QUALITY,
    INSIGHT_SOURCES,
    RemembranceCrystal,
    CultivationInsight
} from '../../../domains/reincarnation/entities/Reincarnation.js';

describe('ReincarnationService - Direction M: 悟道境轮回系统', () => {
    let service;
    let mockGameState;

    beforeEach(() => {
        service = new ReincarnationService();
        mockGameState = {
            realm: 2,
            stage: 1,
            cultivationProgress: 50,
            reincarnation: {
                times: 1,
                karmaGood: 200,
                karmaBad: 50,
                bonuses: [],
                insights: [],
                crystals: []
            },
            cultivation: {
                skills: [
                    { id: 'skill1', name: '火球术', level: 3, permanent: true },
                    { id: 'skill2', name: '水盾术', level: 2, retainable: true }
                ]
            },
            achievementState: {
                completedAchievements: ['achievement1'],
                unlockedBadges: ['badge1']
            }
        };
        service.init(mockGameState);
    });

    describe('Basic Operations', () => {
        it('should initialize correctly', () => {
            expect(service.reincarnation).toBeDefined();
            expect(service.crystals).toEqual([]);
            expect(service.insights).toEqual([]);
        });

        it('should get stats correctly', () => {
            const stats = service.getStats();
            expect(stats.times).toBe(1);
            expect(stats.netKarma).toBe(150);
        });
    });

    describe('reincarnation.crystal.create', () => {
        it('should create a crystal with default quality', () => {
            const result = service.mcpCrystalCreate({}, mockGameState);
            
            expect(result.success).toBe(true);
            expect(result.crystal).toBeDefined();
            expect(result.crystal.quality).toBe('良品'); // realm=2, karma=150
            expect(service.crystals.length).toBe(1);
        });

        it('should create a crystal with specified quality', () => {
            const result = service.mcpCrystalCreate({ quality: '珍品' }, mockGameState);
            
            expect(result.success).toBe(true);
            expect(result.crystal.quality).toBe('珍品');
        });

        it('should preserve attributes in crystal', () => {
            const result = service.mcpCrystalCreate({}, mockGameState);
            
            expect(result.crystal.preservedAttributes).toBeDefined();
            expect(result.crystal.preservedAttributes.cultivationBase).toBe(2);
        });

        it('should determine crystal quality based on realm and karma', () => {
            // 凡品: realm < 2 or karma < 100
            mockGameState.realm = 1;
            let result = service.mcpCrystalCreate({}, mockGameState);
            expect(result.crystal.quality).toBe('凡品');

            // 良品: realm >= 2 and karma >= 100
            mockGameState.realm = 2;
            result = service.mcpCrystalCreate({}, mockGameState);
            expect(result.crystal.quality).toBe('良品');

            // 珍品: realm >= 3 and karma >= 300
            mockGameState.realm = 3;
            mockGameState.reincarnation.karmaGood = 400;
            result = service.mcpCrystalCreate({}, mockGameState);
            expect(result.crystal.quality).toBe('珍品');

            // 上品: realm >= 4 and karma >= 600
            mockGameState.realm = 4;
            mockGameState.reincarnation.karmaGood = 700;
            result = service.mcpCrystalCreate({}, mockGameState);
            expect(result.crystal.quality).toBe('上品');

            // 极品: realm >= 5 and karma >= 1000
            mockGameState.realm = 5;
            mockGameState.reincarnation.karmaGood = 1100;
            result = service.mcpCrystalCreate({}, mockGameState);
            expect(result.crystal.quality).toBe('极品');
        });
    });

    describe('reincarnation.crystal.list', () => {
        it('should list all crystals', () => {
            service.mcpCrystalCreate({}, mockGameState);
            service.mcpCrystalCreate({ quality: '珍品' }, mockGameState);
            
            const result = service.mcpCrystalList();
            
            expect(result.success).toBe(true);
            expect(result.total).toBe(2);
            expect(result.available).toBe(2);
            expect(result.used).toBe(0);
            expect(result.crystals).toHaveLength(2);
        });

        it('should track used crystals', () => {
            service.mcpCrystalCreate({}, mockGameState);
            const crystalId = service.crystals[0].id;
            service.mcpCrystalApply({ crystalId }, mockGameState);
            
            const result = service.mcpCrystalList();
            
            expect(result.total).toBe(1);
            expect(result.available).toBe(0);
            expect(result.used).toBe(1);
        });
    });

    describe('reincarnation.crystal.apply', () => {
        it('should apply a crystal and restore attributes', () => {
            service.mcpCrystalCreate({}, mockGameState);
            const crystalId = service.crystals[0].id;
            
            const result = service.mcpCrystalApply({ crystalId }, mockGameState);
            
            expect(result.success).toBe(true);
            expect(result.restored).toBeDefined();
        });

        it('should fail if crystalId is missing', () => {
            const result = service.mcpCrystalApply({}, mockGameState);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('缺少 crystalId 参数');
        });

        it('should fail if crystal does not exist', () => {
            const result = service.mcpCrystalApply({ crystalId: 'nonexistent' }, mockGameState);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('结晶不存在');
        });

        it('should fail if crystal already used', () => {
            service.mcpCrystalCreate({}, mockGameState);
            const crystalId = service.crystals[0].id;
            service.mcpCrystalApply({ crystalId }, mockGameState);
            
            const result = service.mcpCrystalApply({ crystalId }, mockGameState);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('结晶已被使用');
        });
    });

    describe('reincarnation.insight.awaken', () => {
        it('should create an insight with breakthrough type', () => {
            const result = service.mcpInsightAwaken({ type: 'breakthrough', desc: '突破化神' }, mockGameState);
            
            expect(result.success).toBe(true);
            expect(result.insight).toBeDefined();
            expect(result.insight.type).toBe('breakthrough');
            expect(result.karmaBonus).toBe(50);
        });

        it('should create an insight with serendipity type', () => {
            const result = service.mcpInsightAwaken({ type: 'serendipity' }, mockGameState);
            
            expect(result.success).toBe(true);
            expect(result.karmaBonus).toBe(40);
        });

        it('should record karma on insight awakening', () => {
            const initialKarma = service.reincarnation.karmaGood;
            service.mcpInsightAwaken({ type: 'alchemy' }, mockGameState);
            
            expect(service.reincarnation.karmaGood).toBe(initialKarma + 30);
        });

        it('should sync insights to gameState', () => {
            service.mcpInsightAwaken({ type: 'meditation' }, mockGameState);
            
            expect(mockGameState.reincarnation.insights).toHaveLength(1);
        });
    });

    describe('reincarnation.insight.list', () => {
        it('should list all insights', () => {
            service.mcpInsightAwaken({ type: 'breakthrough' }, mockGameState);
            service.mcpInsightAwaken({ type: 'serendipity' }, mockGameState);
            
            const result = service.mcpInsightList();
            
            expect(result.success).toBe(true);
            expect(result.total).toBe(2);
            expect(result.insights).toHaveLength(2);
        });
    });

    describe('reincarnation.cycle.status', () => {
        it('should return complete cycle status', () => {
            service.mcpInsightAwaken({ type: 'breakthrough' }, mockGameState);
            service.mcpCrystalCreate({}, mockGameState);
            
            const result = service.mcpCycleStatus(mockGameState);
            
            expect(result.success).toBe(true);
            expect(result.stats).toBeDefined();
            expect(result.stats.crystalsTotal).toBe(1);
            expect(result.stats.insightsTotal).toBe(1);
            expect(result.memoryLayers).toBeDefined();
            expect(result.reincarnationRealm).toBeDefined();
            expect(result.memoryRetentionRate).toBeDefined();
        });

        it('should show correct memory layer retention', () => {
            const result = service.mcpCycleStatus(mockGameState);
            
            expect(result.memoryLayers.L0_META.retained).toBe(true);
            expect(result.memoryLayers.L1_INDEX.retained).toBe(true);
            expect(result.memoryLayers.L4_SESSION.retained).toBe(false);
        });
    });

    describe('Memory Layer System', () => {
        it('should calculate reincarnation realm correctly', () => {
            expect(service.calculateReincarnationRealm(0)).toBe('凡胎');
            expect(service.calculateReincarnationRealm(1)).toBe('炼气');
            expect(service.calculateReincarnationRealm(5)).toBe('化神');
            expect(service.calculateReincarnationRealm(6)).toBe('飞升');
            expect(service.calculateReincarnationRealm(10)).toBe('彼岸');
        });

        it('should calculate memory retention rate', () => {
            const retention0 = service.calculateMemoryRetention(0);
            expect(retention0).toBe(0.5);
            
            const retention5 = service.calculateMemoryRetention(5);
            expect(retention5).toBe(0.75);
            
            // Should not exceed 0.95
            const retention100 = service.calculateMemoryRetention(100);
            expect(retention100).toBe(0.95);
        });

        it('should track L0 meta memory correctly', () => {
            const result = service.mcpCycleStatus(mockGameState);
            
            expect(result.memoryLayers.L0_META.data.reincarnationTimes).toBe(1);
        });
    });

    describe('Helper Methods', () => {
        it('should collect retainable skills', () => {
            const skills = service.collectRetainableSkills(mockGameState);
            
            expect(skills).toHaveLength(2);
            expect(skills[0].name).toBe('火球术');
        });

        it('should calculate insight effect correctly', () => {
            const breakthroughEffect = service.calculateInsightEffect('breakthrough', mockGameState);
            expect(breakthroughEffect.cultivationSpeed).toBe(0.1);
            
            const combatEffect = service.calculateInsightEffect('combat', mockGameState);
            expect(combatEffect.attack).toBe(0.05);
        });
    });
});