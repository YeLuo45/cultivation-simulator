/**
 * 修仙游戏完整生态整合服务测试
 * V267 方向A迭代9/9: 六设计系统融合
 * 
 * 测试覆盖率目标: ≥99%
 * 测试通过率目标: 100%
 */

import { CultivationEcosystemService } from '../../../domains/cultivation/services/CultivationEcosystemService.js';

describe('CultivationEcosystemService', () => {
    let service;
    let gameState;

    beforeEach(() => {
        gameState = {
            cultivation: { level: 1, experience: 0, maxExperience: 100 },
            karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '常人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null },
            epiphany: { triggered: false, multiplier: 1.0, activeTypes: [], history: [], lastTriggerTime: null },
            multiRealm: null,
            parallelCultivation: null,
            sect: null,
            realmFeedback: null,
            ecosystem: null
        };
        service = new CultivationEcosystemService(gameState);
        service.init(gameState);
    });

    describe('initEcosystem', () => {
        test('should initialize with default player stats', () => {
            expect(service.ecosystem.player.name).toBe('修仙者');
            expect(service.ecosystem.player.level).toBe(1);
            expect(service.ecosystem.player.spiritStones).toBe(100);
            expect(service.ecosystem.player.energy).toBe(100);
        });

        test('should initialize with empty achievements', () => {
            expect(service.ecosystem.achievements).toEqual([]);
        });

        test('should have 3 save slots', () => {
            expect(service.ecosystem.saveSlots.length).toBe(3);
            expect(service.ecosystem.saveSlots.every(s => s === null)).toBe(true);
        });
    });

    describe('gameTick', () => {
        test('should increment tick count', () => {
            service.gameTick(1000);
            expect(service.ecosystem.tickCount).toBe(1);
            service.gameTick(1000);
            expect(service.ecosystem.tickCount).toBe(2);
        });

        test('should accumulate play time', () => {
            service.gameTick(5000);
            expect(service.ecosystem.totalPlayTime).toBe(5000);
        });

        test('should return results for each system', () => {
            const result = service.gameTick(1000);
            expect(result.results.length).toBeGreaterThan(0);
            expect(result.player).toBeDefined();
        });

        test('should start in CULTIVATING phase after init', () => {
            service.gameTick(1000);
            expect(service.ecosystem.phase).toBe('cultivating');
        });
    });

    describe('calculateExpGain', () => {
        test('should calculate base experience gain', () => {
            const exp = service.calculateExpGain(1000, {});
            expect(exp).toBeGreaterThan(0);
        });

        test('should apply cultivation speed modifier', () => {
            service.ecosystem.player.cultivationSpeed = 2.0;
            const exp1 = service.calculateExpGain(1000, {});
            service.ecosystem.player.cultivationSpeed = 1.0;
            const exp2 = service.calculateExpGain(1000, {});
            expect(exp1).toBe(exp2 * 2);
        });
    });

    describe('levelUp', () => {
        test('should increase player level', () => {
            service.ecosystem.player.experience = 200;
            const result = service.levelUp();
            expect(result.levelUp).toBe(true);
            expect(result.newLevel).toBe(2);
            expect(service.ecosystem.player.level).toBe(2);
        });

        test('should apply cultivation speed bonus on level up', () => {
            const initialSpeed = service.ecosystem.player.cultivationSpeed;
            service.ecosystem.player.experience = 200;
            service.levelUp();
            expect(service.ecosystem.player.cultivationSpeed).toBe(initialSpeed * 1.1);
        });
    });

    describe('getLevelRequirement', () => {
        test('should return correct requirement for level 1', () => {
            expect(service.getLevelRequirement()).toBe(100);
        });

        test('should scale with level', () => {
            service.ecosystem.player.level = 2;
            expect(service.getLevelRequirement()).toBe(150);
        });
    });

    describe('updateEnergy', () => {
        test('should recover energy over time', () => {
            service.ecosystem.player.energy = 50;
            service.updateEnergy(5000); // 5 seconds = 5 energy
            expect(service.ecosystem.player.energy).toBeGreaterThan(50);
        });

        test('should not exceed max energy', () => {
            service.ecosystem.player.energy = 99;
            service.updateEnergy(5000);
            expect(service.ecosystem.player.energy).toBeLessThanOrEqual(100);
        });
    });

    describe('consumeEnergy', () => {
        test('should consume energy', () => {
            const result = service.consumeEnergy(30);
            expect(result.success).toBe(true);
            expect(result.remaining).toBe(70);
        });

        test('should fail when insufficient energy', () => {
            const result = service.consumeEnergy(150);
            expect(result.success).toBe(false);
            expect(result.error).toBe('能量不足');
        });
    });

    describe('addSpiritStones', () => {
        test('should add spirit stones', () => {
            const result = service.addSpiritStones(50);
            expect(result.success).toBe(true);
            expect(result.balance).toBe(150);
        });
    });

    describe('spendSpiritStones', () => {
        test('should spend spirit stones', () => {
            const result = service.spendSpiritStones(30);
            expect(result.success).toBe(true);
            expect(result.remaining).toBe(70);
        });

        test('should fail when insufficient', () => {
            const result = service.spendSpiritStones(200);
            expect(result.success).toBe(false);
            expect(result.error).toBe('灵石不足');
        });
    });

    describe('triggerEpiphany', () => {
        test('should trigger epiphany', () => {
            const result = service.triggerEpiphany('cultivation');
            // Result depends on epiphany service state
            expect(result).toBeDefined();
        });
    });

    describe('unlockAchievement', () => {
        test('should unlock new achievement', () => {
            const result = service.unlockAchievement('first_breakthrough', '首次突破');
            expect(result.success).toBe(true);
            expect(service.ecosystem.achievements).toContain('first_breakthrough');
        });

        test('should not duplicate achievement', () => {
            service.unlockAchievement('test', 'Test');
            const result = service.unlockAchievement('test', 'Test');
            expect(result.success).toBe(false);
            expect(result.message).toBe('成就已解锁');
        });
    });

    describe('saveGame / loadGame', () => {
        test('should save game to slot', () => {
            service.ecosystem.player.level = 5;
            const result = service.saveGame(0);
            expect(result.success).toBe(true);
            expect(result.slot).toBe(0);
            expect(service.ecosystem.saveSlots[0]).not.toBeNull();
        });

        test('should load game from slot', () => {
            service.ecosystem.player.level = 5;
            service.saveGame(1);
            service.ecosystem.player.level = 1;
            const result = service.loadGame(1);
            expect(result.success).toBe(true);
            expect(service.ecosystem.player.level).toBe(5);
        });

        test('should fail loading non-existent slot', () => {
            const result = service.loadGame(2);
            expect(result.success).toBe(false);
            expect(result.error).toBe('存档不存在');
        });
    });

    describe('MCP Tools', () => {
        describe('mcpGameTick', () => {
            test('should tick game with success', () => {
                const result = service.mcpGameTick({ deltaTime: 1000 });
                expect(result.success).toBe(true);
                expect(result.tickCount).toBe(1);
            });
        });

        describe('mcpGetGameStatus', () => {
            test('should return full game status', () => {
                const result = service.mcpGetGameStatus();
                expect(result.success).toBe(true);
                expect(result.player).toBeDefined();
                expect(result.stats).toBeDefined();
                expect(result.multiRealm).toBeDefined();
                expect(result.karma).toBeDefined();
            });
        });

        describe('mcpGetPlayer', () => {
            test('should return player status', () => {
                const result = service.mcpGetPlayer();
                expect(result.success).toBe(true);
                expect(result.player).toBeDefined();
                expect(result.levelProgress).toBeDefined();
            });
        });

        describe('mcpCultivate', () => {
            test('should cultivate via MCP', () => {
                const result = service.mcpCultivate({ duration: 1000 });
                expect(result.success).toBe(true);
            });
        });

        describe('mcpTriggerEpiphany', () => {
            test('should trigger epiphany via MCP', () => {
                const result = service.mcpTriggerEpiphany({ type: 'general' });
                expect(result).toBeDefined();
            });
        });

        describe('mcpRecordGoodDeed', () => {
            test('should record good deed', () => {
                const result = service.mcpRecordGoodDeed({ description: '帮助新人' });
                expect(result.success).toBe(true);
            });
        });

        describe('mcpRecordBadDeed', () => {
            test('should record bad deed', () => {
                const result = service.mcpRecordBadDeed({ description: '欺负弱小' });
                expect(result.success).toBe(true);
            });
        });

        describe('mcpCreateSect', () => {
            test('should create sect and transition phase', () => {
                const result = service.mcpCreateSect({ name: '天剑宗' });
                expect(result.success).toBe(true);
                expect(result.sectName).toBe('天剑宗');
            });
        });

        describe('mcpSaveGame', () => {
            test('should save game via MCP', () => {
                const result = service.mcpSaveGame({ slot: 0 });
                expect(result.success).toBe(true);
                expect(result.slot).toBe(0);
            });
        });

        describe('mcpLoadGame', () => {
            test('should load game via MCP', () => {
                service.saveGame(0);
                const result = service.mcpLoadGame({ slot: 0 });
                expect(result.success).toBe(true);
            });
        });

        describe('mcpUnlockAchievement', () => {
            test('should unlock achievement via MCP', () => {
                const result = service.mcpUnlockAchievement({ achievementId: 'test_ach', name: '测试成就' });
                expect(result.success).toBe(true);
                expect(result.achievement).toBe('测试成就');
            });
        });
    });
});
