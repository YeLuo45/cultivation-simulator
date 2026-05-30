/**
 * ReincarnationBookService TDD Tests
 * V226: Direction M续 - 轮回簿天道记录系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReincarnationBookService } from '../../../domains/reincarnation/services/ReincarnationBookService.js';

describe('ReincarnationBookService - V226: 轮回簿天道记录', () => {
    let service;
    let mockGameState;

    beforeEach(() => {
        service = new ReincarnationBookService();
        mockGameState = {
            days: 100,
            realm: 3,
            stage: 1,
            gameVersion: 'V226',
            player: {
                name: '测试修士'
            },
            reincarnation: {
                times: 2,
                karmaGood: 300,
                karmaBad: 50,
                bonuses: [],
                pastLives: [
                    {
                        time: Date.now() - 86400000,
                        times: 1,
                        causeOfDeath: '寿元耗尽',
                        realmAtDeath: 3,
                        ageAtDeath: 150,
                        karmaBalance: 100
                    }
                ]
            },
            reincarnationBook: null
        };
        service.init(mockGameState);
    });

    describe('Initialization', () => {
        it('should initialize correctly', () => {
            expect(service.gameState).toBeDefined();
            expect(service.karmaRecords).toEqual([]);
            expect(service.tiandaoRecords).toEqual([]);
            expect(service.blessings).toEqual([]);
        });

        it('should create reincarnationBook in gameState if not exists', () => {
            expect(mockGameState.reincarnationBook).toBeDefined();
            expect(mockGameState.reincarnationBook.karmaRecords).toEqual([]);
            expect(mockGameState.reincarnationBook.tiandaoRecords).toEqual([]);
            expect(mockGameState.reincarnationBook.tiandaoMerit).toBe(0);
        });

        it('should sync pastLives to reincarnationHistory', () => {
            expect(mockGameState.reincarnationBook.reincarnationHistory).toHaveLength(1);
        });
    });

    describe('getBookStats', () => {
        it('should return correct book statistics', () => {
            const stats = service.getBookStats();
            
            expect(stats.reincarnationTimes).toBe(2);
            expect(stats.netKarma).toBe(250);
            expect(stats.karmaGood).toBe(300);
            expect(stats.karmaBad).toBe(50);
            expect(stats.pastLivesCount).toBe(1);
        });

        it('should return zeros when no data', () => {
            const emptyState = { reincarnation: {}, reincarnationBook: {} };
            service.init(emptyState);
            
            const stats = service.getBookStats();
            expect(stats.totalKarmaRecords).toBe(0);
            expect(stats.totalTiandaoRecords).toBe(0);
            expect(stats.tiandaoMerit).toBe(0);
        });
    });

    describe('reincarnation.book.list', () => {
        it('should list all reincarnation history', () => {
            const result = service.mcpBookList();
            
            expect(result.success).toBe(true);
            expect(result.total).toBe(1);
            expect(result.records).toHaveLength(1);
            expect(result.records[0].realmName).toBe('元婴');  // realmAtDeath: 3 -> 元婴
        });

        it('should support pagination', () => {
            mockGameState.reincarnation.pastLives.push({
                time: Date.now(),
                times: 2,
                causeOfDeath: '渡劫失败',
                realmAtDeath: 3,
                ageAtDeath: 200,
                karmaBalance: 150
            });
            
            const result = service.mcpBookList({ limit: 1, offset: 0 });
            
            expect(result.total).toBe(2);
            expect(result.pageSize).toBe(1);
            expect(result.records).toHaveLength(1);
        });

        it('should filter by karma balance', () => {
            mockGameState.reincarnation.pastLives.push({
                time: Date.now(),
                times: 2,
                causeOfDeath: '渡劫失败',
                realmAtDeath: 3,
                ageAtDeath: 200,
                karmaBalance: -50
            });
            
            const goodResult = service.mcpBookList({ filter: 'good' });
            expect(goodResult.total).toBe(1);
            
            const badResult = service.mcpBookList({ filter: 'bad' });
            expect(badResult.total).toBe(1);
        });

        it('should include karma evaluation and realm name', () => {
            const result = service.mcpBookList();
            
            expect(result.records[0].karmaEvaluation).toBeDefined();
            expect(result.records[0].ageDesc).toContain('150');
        });
    });

    describe('reincarnation.karma.record', () => {
        it('should record good karma', () => {
            const result = service.mcpKarmaRecord({
                type: 'rescue',
                action: 'good',
                amount: 10,
                description: '救助了一只灵兽'
            });
            
            expect(result.success).toBe(true);
            expect(result.record.type).toBe('rescue');
            expect(result.record.action).toBe('good');
            expect(result.record.amount).toBe(10);
            expect(result.karmaChange).toBe(10);
            expect(result.currentKarma.net).toBe(260);
        });

        it('should record bad karma', () => {
            const result = service.mcpKarmaRecord({
                type: 'kill',
                action: 'bad',
                amount: 5
            });
            
            expect(result.success).toBe(true);
            expect(result.record.action).toBe('bad');
            expect(result.karmaChange).toBe(-5);
            expect(result.currentKarma.net).toBe(245);
        });

        it('should fail without required parameters', () => {
            const result1 = service.mcpKarmaRecord({ type: 'rescue' });
            expect(result1.success).toBe(false);
            expect(result1.reason).toContain('type');
            
            const result2 = service.mcpKarmaRecord({ action: 'good' });
            expect(result2.success).toBe(false);
        });

        it('should use default description if not provided', () => {
            const result = service.mcpKarmaRecord({
                type: 'charity',
                action: 'good',
                amount: 5
            });
            
            expect(result.record.description).toBe('施舍助人');
        });

        it('should sync records to gameState', () => {
            service.mcpKarmaRecord({
                type: 'medicine',
                action: 'good',
                amount: 20
            });
            
            expect(mockGameState.reincarnationBook.karmaRecords).toHaveLength(1);
            expect(mockGameState.reincarnation.karmaGood).toBe(320);
        });
    });

    describe('reincarnation.karma.query', () => {
        it('should return complete karma status', () => {
            const result = service.mcpKarmaQuery();
            
            expect(result.success).toBe(true);
            expect(result.karma).toBeDefined();
            expect(result.karma.good).toBe(300);
            expect(result.karma.bad).toBe(50);
            expect(result.karma.net).toBe(250);
            expect(result.karma.level).toBe('A');
            expect(result.karma.evaluation).toBe('小有功德');
        });

        it('should include recent records', () => {
            service.mcpKarmaRecord({ type: 'rescue', action: 'good', amount: 10 });
            
            const result = service.mcpKarmaQuery();
            
            expect(result.recentRecords).toHaveLength(1);
            expect(result.recentRecords[0].type).toBe('rescue');
        });

        it('should include impact calculations', () => {
            const result = service.mcpKarmaQuery();
            
            expect(result.impact).toBeDefined();
            expect(result.impact.reincarnationBonus).toBeDefined();
            expect(result.impact.tribulationModifier).toBeDefined();
            expect(result.impact.serendipityChance).toBeDefined();
        });

        it('should calculate karma level correctly', () => {
            mockGameState.reincarnation.karmaGood = 1500;
            mockGameState.reincarnation.karmaBad = 0;
            
            const result = service.mcpKarmaQuery();
            
            expect(result.karma.level).toBe('SS');
            expect(result.karma.evaluation).toBe('功德圆满');
        });

        it('should handle negative karma', () => {
            mockGameState.reincarnation.karmaGood = 0;
            mockGameState.reincarnation.karmaBad = 1000;
            
            const result = service.mcpKarmaQuery();
            
            expect(result.karma.level).toBe('D');
            expect(result.karma.evaluation).toBe('恶贯满盈');
            expect(result.impact.tribulationModifier).toBeGreaterThan(0);
        });
    });

    describe('reincarnation.tiandao.record', () => {
        it('should record tiandao event', () => {
            const result = service.mcpTiandaoRecord({
                eventType: 'breakthrough',
                merit: 50,
                description: '突破到化神境界'
            });
            
            expect(result.success).toBe(true);
            expect(result.record.eventType).toBe('breakthrough');
            expect(result.record.merit).toBe(50);
            expect(result.totalMerit).toBe(50);
        });

        it('should fail without eventType', () => {
            const result = service.mcpTiandaoRecord({ merit: 10 });
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('eventType');
        });

        it('should sync records to gameState', () => {
            service.mcpTiandaoRecord({
                eventType: 'fly',
                merit: 100
            });
            
            expect(mockGameState.reincarnationBook.tiandaoRecords).toHaveLength(1);
            expect(mockGameState.reincarnationBook.tiandaoMerit).toBe(100);
        });

        it('should use default description for known event types', () => {
            const result = service.mcpTiandaoRecord({
                eventType: 'tribulation',
                merit: 30
            });
            
            expect(result.record.description).toBe('渡劫成功');
        });
    });

    describe('reincarnation.tiandao.bless', () => {
        it('should grant blessing when merit is sufficient', () => {
            mockGameState.reincarnationBook.tiandaoMerit = 200;
            
            const result = service.mcpTiandaoBless({ level: 'S' });
            
            expect(result.success).toBe(true);
            expect(result.blessing.level).toBe('S');
            expect(result.blessing.effects).toContain('福缘深厚');
        });

        it('should fail when merit is insufficient', () => {
            mockGameState.reincarnationBook.tiandaoMerit = 10;
            
            const result = service.mcpTiandaoBless({ level: 'A' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('功德不足');
            expect(result.requiredMerit).toBe(100);
        });

        it('should auto-determine blessing level based on merit', () => {
            mockGameState.reincarnationBook.tiandaoMerit = 150;
            
            const result = service.mcpTiandaoBless();
            
            expect(result.success).toBe(true);
            expect(result.blessing.level).toBe('A');
        });

        it('should deduct merit after blessing', () => {
            mockGameState.reincarnationBook.tiandaoMerit = 100;
            
            service.mcpTiandaoBless({ level: 'A' });
            
            expect(mockGameState.reincarnationBook.tiandaoMerit).toBe(0);
        });

        it('should include blessing in records', () => {
            mockGameState.reincarnationBook.tiandaoMerit = 500;
            
            service.mcpTiandaoBless({ level: 'SS' });
            
            expect(mockGameState.reincarnationBook.blessings).toHaveLength(1);
        });

        it('should have different blessing levels with different effects', () => {
            mockGameState.reincarnationBook.tiandaoMerit = 1000;
            
            const result = service.mcpTiandaoBless({ level: 'SSS' });
            
            expect(result.success).toBe(true);
            expect(result.blessing.effects).toContain('天选之资');
            expect(result.blessing.effects).toContain('悟性+50%');
        });
    });

    describe('reincarnation.history.export', () => {
        it('should export as JSON by default', () => {
            const result = service.mcpHistoryExport();
            
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data.meta).toBeDefined();
            expect(result.data.summary).toBeDefined();
            expect(result.data.reincarnationHistory).toHaveLength(1);
        });

        it('should include karma records when includeDetails is true', () => {
            service.mcpKarmaRecord({ type: 'rescue', action: 'good', amount: 10 });
            
            const result = service.mcpHistoryExport({ includeDetails: true });
            
            expect(result.data.karmaRecords).toHaveLength(1);
        });

        it('should not include karma records when includeDetails is false', () => {
            service.mcpKarmaRecord({ type: 'rescue', action: 'good', amount: 10 });
            
            const result = service.mcpHistoryExport({ includeDetails: false });
            
            expect(result.data.karmaRecords).toHaveLength(0);
        });

        it('should export as text format', () => {
            const result = service.mcpHistoryExport({ format: 'text' });
            
            expect(result.success).toBe(true);
            expect(result.data).toContain('轮回簿天道记录');
            expect(result.data).toContain('转世统计');
        });

        it('should include correct metadata', () => {
            const result = service.mcpHistoryExport();
            
            expect(result.data.meta.gameVersion).toBe('V226');
            expect(result.data.meta.playerName).toBe('测试修士');
            expect(result.data.meta.exportTime).toBeDefined();
        });

        it('should return error for unsupported format', () => {
            const result = service.mcpHistoryExport({ format: 'xml' });
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('不支持的格式');
        });

        it('should calculate data size', () => {
            const result = service.mcpHistoryExport();
            
            expect(result.dataSize).toBeGreaterThan(0);
        });
    });

    describe('Helper Methods', () => {
        it('should get correct realm names', () => {
            expect(service.getRealmName(0)).toBe('炼气');
            expect(service.getRealmName(1)).toBe('筑基');
            expect(service.getRealmName(5)).toBe('飞升');
            expect(service.getRealmName(99)).toBe('未知');
        });

        it('should evaluate karma balance correctly', () => {
            expect(service.evaluateKarma(500)).toBe('大善');
            expect(service.evaluateKarma(100)).toBe('善');
            expect(service.evaluateKarma(0)).toBe('平');
            expect(service.evaluateKarma(-100)).toBe('恶');
            expect(service.evaluateKarma(-500)).toBe('大恶');
        });

        it('should evaluate overall karma correctly', () => {
            expect(service.evaluateOverallKarma(1000)).toBe('功德圆满');
            expect(service.evaluateOverallKarma(500)).toBe('功德深厚');
            expect(service.evaluateOverallKarma(100)).toBe('小有功德');
            expect(service.evaluateOverallKarma(-500)).toBe('罪孽深重');
        });

        it('should calculate karma bonus correctly', () => {
            expect(service.calculateKarmaBonus(1000).value).toBe(0.3);
            expect(service.calculateKarmaBonus(500).value).toBe(0.2);
            expect(service.calculateKarmaBonus(100).value).toBe(0.1);
            expect(service.calculateKarmaBonus(0).value).toBe(0);
        });

        it('should calculate tribulation modifier correctly', () => {
            expect(service.calculateTribulationModifier(1000)).toBe(-0.3);
            expect(service.calculateTribulationModifier(500)).toBe(-0.2);
            expect(service.calculateTribulationModifier(-500)).toBe(0.5);
        });

        it('should calculate serendipity chance correctly', () => {
            expect(service.calculateSerendipityChance(500)).toBe(0.1);
            expect(service.calculateSerendipityChance(100)).toBe(0.05);
            expect(service.calculateSerendipityChance(0)).toBe(0);
        });

        it('should determine blessing level correctly', () => {
            expect(service.determineBlessLevel(1000)).toBe('SSS');
            expect(service.determineBlessLevel(500)).toBe('SS');
            expect(service.determineBlessLevel(200)).toBe('S');
            expect(service.determineBlessLevel(100)).toBe('A');
            expect(service.determineBlessLevel(50)).toBe('B');
            expect(service.determineBlessLevel(0)).toBe('C');
        });

        it('should generate valid text report', () => {
            const exportResult = service.mcpHistoryExport({ format: 'text' });
            
            expect(exportResult.data).toContain('========== 轮回簿天道记录 ==========');
            expect(exportResult.data).toContain('---------- 转世统计 ----------');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty gameState', () => {
            const emptyService = new ReincarnationBookService();
            emptyService.init({});
            
            const result = emptyService.mcpBookList();
            
            expect(result.success).toBe(true);
            expect(result.records).toEqual([]);
        });

        it('should handle missing reincarnation data', () => {
            const partialState = { days: 1 };
            service.init(partialState);
            
            const result = service.mcpKarmaQuery();
            
            expect(result.success).toBe(true);
            expect(result.karma.net).toBe(0);
        });

        it('should handle negative amount in karma.record', () => {
            const result = service.mcpKarmaRecord({
                type: 'harm',
                action: 'bad',
                amount: -10
            });
            
            // amount should be converted to positive, then negated for bad karma
            expect(result.success).toBe(true);
            expect(result.record.amount).toBe(-10);
        });
    });
});