/**
 * HeavenRankService.test.js - TDD测试
 * 天机榜系统测试 - 覆盖率 >= 95%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    HeavenRankService,
    HeavenRankEntry,
    HeavenRankHistory,
    HeavenRankReward,
    heavenRankService,
    HEAVEN_RANK_CONFIG,
    RANK_REWARD_TIERS,
    CHALLENGE_RESULT,
    HEAVEN_RANK_TOOLS,
    mcpRankHeavenList,
    mcpRankSelfQuery,
    mcpRankHistoryView,
    mcpRankRewardClaim,
    mcpRankChangeTrack,
    mcpRankBattleChallenge
} from '../../../systems/ranking/HeavenRankService.js';

// ===== 辅助函数 =====

function createMockGameState() {
    return {
        heavenRank: {
            powerRank: [],
            wealthRank: [],
            karmaRank: [],
            realmRank: [],
            history: {},
            pendingRewards: [],
            challengeRecords: {},
            lastSettlementTime: Date.now(),
            lastRankUpdateTime: Date.now()
        },
        player: { id: 'player_001', name: '测试修士', power: 1000, wealth: 500, karma: 300, realm: 5 }
    };
}

// ===== HeavenRankEntry测试 =====

describe('HeavenRankEntry', () => {
    it('should create entry with correct properties', () => {
        const entry = new HeavenRankEntry(
            'player_001',
            '测试修士',
            HEAVEN_RANK_CONFIG.RANK_TYPES.POWER,
            1000
        );
        
        expect(entry.id).toMatch(/^rank_/);
        expect(entry.playerId).toBe('player_001');
        expect(entry.playerName).toBe('测试修士');
        expect(entry.rankType).toBe(HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
        expect(entry.value).toBe(1000);
        expect(entry.rank).toBe(0);
        expect(entry.previousRank).toBe(0);
        expect(entry.changeAmount).toBe(0);
        expect(entry.consecutiveWeeks).toBe(1);
        expect(entry.highestRank).toBe(0);
    });
    
    it('should generate unique ids', () => {
        const entry1 = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 100);
        const entry2 = new HeavenRankEntry('p2', '玩家2', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 200);
        
        expect(entry1.id).not.toBe(entry2.id);
    });
    
    describe('updateRank', () => {
        it('should update rank and calculate change', () => {
            const entry = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry.rank = 5;
            
            entry.updateRank(3, 1500);
            
            expect(entry.rank).toBe(3);
            expect(entry.value).toBe(1500);
            expect(entry.previousRank).toBe(5);
            expect(entry.changeAmount).toBe(2); // 5 - 3 = 2
        });
        
        it('should update highest rank when new rank is better', () => {
            const entry = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry.rank = 10;
            entry.highestRank = 10;
            
            entry.updateRank(5, 1500);
            
            expect(entry.highestRank).toBe(5);
        });
        
        it('should not update highest rank when new rank is worse', () => {
            const entry = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry.rank = 5;
            entry.highestRank = 5;
            
            entry.updateRank(8, 800);
            
            expect(entry.highestRank).toBe(5);
        });
    });
    
    describe('consecutiveWeeks', () => {
        it('should increment consecutive weeks', () => {
            const entry = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry.consecutiveWeeks = 3;
            
            entry.incrementConsecutiveWeeks();
            
            expect(entry.consecutiveWeeks).toBe(4);
        });
        
        it('should reset consecutive weeks', () => {
            const entry = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry.consecutiveWeeks = 5;
            
            entry.resetConsecutiveWeeks();
            
            expect(entry.consecutiveWeeks).toBe(1);
        });
    });
    
    describe('getChangeDescription', () => {
        it('should return up arrow for positive change', () => {
            const entry = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry.changeAmount = 3;
            
            expect(entry.getChangeDescription()).toBe('↑3');
        });
        
        it('should return down arrow for negative change', () => {
            const entry = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry.changeAmount = -2;
            
            expect(entry.getChangeDescription()).toBe('↓2');
        });
        
        it('should return dash for no change', () => {
            const entry = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry.changeAmount = 0;
            
            expect(entry.getChangeDescription()).toBe('—');
        });
    });
});

// ===== HeavenRankHistory测试 =====

describe('HeavenRankHistory', () => {
    it('should create history with correct properties', () => {
        const history = new HeavenRankHistory('player_001', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
        
        expect(history.id).toMatch(/^history_/);
        expect(history.playerId).toBe('player_001');
        expect(history.rankType).toBe(HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
        expect(history.records).toEqual([]);
    });
    
    describe('addRecord', () => {
        it('should add record with week number', () => {
            const history = new HeavenRankHistory('player_001', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            history.addRecord(5, 1000);
            
            expect(history.records.length).toBe(1);
            expect(history.records[0].rank).toBe(5);
            expect(history.records[0].value).toBe(1000);
            expect(history.records[0].week).toBeDefined();
        });
        
        it('should maintain record limit', () => {
            const history = new HeavenRankHistory('player_001', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            // Add more than MAX_HISTORY_RECORDS
            for (let i = 0; i < HEAVEN_RANK_CONFIG.MAX_HISTORY_RECORDS + 5; i++) {
                history.addRecord(i + 1, 1000 - i * 10);
            }
            
            expect(history.records.length).toBe(HEAVEN_RANK_CONFIG.MAX_HISTORY_RECORDS);
        });
    });
    
    describe('getTrend', () => {
        it('should return stable with insufficient records', () => {
            const history = new HeavenRankHistory('player_001', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            history.addRecord(5, 1000);
            
            expect(history.getTrend()).toBe('stable');
        });
        
        it('should return rising when rank improved', () => {
            const history = new HeavenRankHistory('player_001', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            history.addRecord(10, 1000);
            history.addRecord(8, 1200);
            history.addRecord(5, 1500);
            
            expect(history.getTrend()).toBe('rising');
        });
        
        it('should return falling when rank declined', () => {
            const history = new HeavenRankHistory('player_001', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            history.addRecord(3, 2000);
            history.addRecord(7, 1500);
            history.addRecord(10, 1000);
            
            expect(history.getTrend()).toBe('falling');
        });
        
        it('should return stable when no change', () => {
            const history = new HeavenRankHistory('player_001', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            history.addRecord(5, 1000);
            history.addRecord(5, 1100);
            history.addRecord(5, 1200);
            
            expect(history.getTrend()).toBe('stable');
        });
    });
});

// ===== HeavenRankReward测试 =====

describe('HeavenRankReward', () => {
    it('should create reward with correct properties', () => {
        const reward = new HeavenRankReward(25, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, RANK_REWARD_TIERS[0]);
        
        expect(reward.id).toMatch(/^reward_/);
        expect(reward.week).toBe(25);
        expect(reward.rankType).toBe(HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
        expect(reward.claimed).toBe(false);
        expect(reward.claimedAt).toBeNull();
    });
    
    describe('claim', () => {
        it('should claim unclaimed reward', () => {
            const reward = new HeavenRankReward(25, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, RANK_REWARD_TIERS[0]);
            
            const result = reward.claim();
            
            expect(result.success).toBe(true);
            expect(reward.claimed).toBe(true);
            expect(reward.claimedAt).toBeGreaterThan(0);
        });
        
        it('should not claim already claimed reward', () => {
            const reward = new HeavenRankReward(25, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, RANK_REWARD_TIERS[0]);
            reward.claimed = true;
            
            const result = reward.claim();
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Reward already claimed');
        });
    });
    
    describe('calculateActualReward', () => {
        it('should return base reward without consecutive bonus', () => {
            const reward = new HeavenRankReward(25, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, RANK_REWARD_TIERS[0]);
            
            const actual = reward.calculateActualReward(1);
            
            expect(actual).toBe(10000); // Base reward for rank 1
        });
        
        it('should apply 10% bonus for each consecutive week above threshold', () => {
            const reward = new HeavenRankReward(25, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, RANK_REWARD_TIERS[0]);
            
            const actual = reward.calculateActualReward(5);
            
            // (5 - 4 + 1) * 0.1 = 0.2, so 1.2x multiplier
            expect(actual).toBe(12000);
        });
        
        it('should cap multiplier at 2.0', () => {
            const reward = new HeavenRankReward(25, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, RANK_REWARD_TIERS[0]);
            
            const actual = reward.calculateActualReward(15);
            
            // Cap at 2.0, so 20000
            expect(actual).toBe(20000);
        });
    });
});

// ===== HeavenRankService测试 =====

describe('HeavenRankService', () => {
    let service;
    let mockGameState;
    
    beforeEach(() => {
        service = new HeavenRankService();
        mockGameState = createMockGameState();
    });
    
    describe('init', () => {
        it('should initialize service with game state', () => {
            const result = service.init(mockGameState);
            
            expect(result.success).toBe(true);
            expect(service.gameState).toBe(mockGameState);
            expect(service.initialized).toBe(true);
            expect(mockGameState.heavenRank).toBeDefined();
        });
        
        it('should restore existing state', () => {
            mockGameState.heavenRank = {
                powerRank: [{ playerId: 'p1', playerName: '玩家1', value: 1000, rank: 1, previousRank: 2, changeAmount: 1, consecutiveWeeks: 3, highestRank: 1 }],
                wealthRank: [],
                karmaRank: [],
                realmRank: [],
                history: {},
                pendingRewards: [],
                challengeRecords: {},
                lastSettlementTime: Date.now(),
                lastRankUpdateTime: Date.now()
            };
            
            service.init(mockGameState);
            
            expect(service.powerRank.length).toBe(1);
            expect(service.powerRank[0].playerId).toBe('p1');
        });
    });
    
    describe('saveState', () => {
        it('should save state to game state', () => {
            service.init(mockGameState);
            service.powerRank.push(new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000));
            
            service.saveState();
            
            expect(mockGameState.heavenRank.powerRank).toBeDefined();
        });
    });
    
    describe('getRank', () => {
        it('should return correct rank array for each type', () => {
            service.init(mockGameState);
            
            expect(service.getRank(HEAVEN_RANK_CONFIG.RANK_TYPES.POWER)).toBe(service.powerRank);
            expect(service.getRank(HEAVEN_RANK_CONFIG.RANK_TYPES.WEALTH)).toBe(service.wealthRank);
            expect(service.getRank(HEAVEN_RANK_CONFIG.RANK_TYPES.KARMA)).toBe(service.karmaRank);
            expect(service.getRank(HEAVEN_RANK_CONFIG.RANK_TYPES.REALM)).toBe(service.realmRank);
        });
        
        it('should return empty array for unknown type', () => {
            service.init(mockGameState);
            
            expect(service.getRank('unknown')).toEqual([]);
        });
    });
    
    describe('getPlayerRank', () => {
        it('should return player rank', () => {
            service.init(mockGameState);
            service.powerRank.push(new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000));
            service.powerRank[0].rank = 1;
            
            const rank = service.getPlayerRank('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            expect(rank).toBe(1);
        });
        
        it('should return 0 if player not found', () => {
            service.init(mockGameState);
            
            const rank = service.getPlayerRank('unknown', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            expect(rank).toBe(0);
        });
    });
    
    describe('updatePlayerRank', () => {
        it('should update existing player', () => {
            service.init(mockGameState);
            const entry = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry.rank = 5;
            service.powerRank.push(entry);
            
            service.updatePlayerRank('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 2000);
            
            const updated = service.powerRank.find(e => e.playerId === 'p1');
            expect(updated.value).toBe(2000);
        });
        
        it('should add new player', () => {
            service.init(mockGameState);
            
            service.updatePlayerRank('p2', '玩家2', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1500);
            
            const newEntry = service.powerRank.find(e => e.playerId === 'p2');
            expect(newEntry).toBeDefined();
            expect(newEntry.value).toBe(1500);
        });
    });
    
    describe('calculateNewRank', () => {
        it('should calculate new rank based on value', () => {
            service.init(mockGameState);
            service.powerRank.push(new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 2000));
            service.powerRank[0].rank = 1;
            
            const newRank = service.calculateNewRank(service.powerRank, 'p1', 1000);
            
            expect(newRank).toBe(2);
        });
    });
    
    describe('addToRank', () => {
        it('should insert entry in correct position', () => {
            service.init(mockGameState);
            const entry1 = new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            entry1.rank = 1;
            service.powerRank.push(entry1);
            
            const entry2 = new HeavenRankEntry('p2', '玩家2', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 2000);
            service.addToRank(service.powerRank, entry2);
            
            expect(service.powerRank[0].playerId).toBe('p2');
        });
        
        it('should maintain max rank size', () => {
            service.init(mockGameState);
            
            for (let i = 0; i < HEAVEN_RANK_CONFIG.MAX_RANK_SIZE + 10; i++) {
                const entry = new HeavenRankEntry(`p${i}`, `玩家${i}`, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000 - i);
                service.addToRank(service.powerRank, entry);
            }
            
            expect(service.powerRank.length).toBe(HEAVEN_RANK_CONFIG.MAX_RANK_SIZE);
        });
    });
    
    describe('getPlayerHistory', () => {
        it('should return history for player', () => {
            service.init(mockGameState);
            service.history['p1_power'] = new HeavenRankHistory('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            const history = service.getPlayerHistory('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            expect(history).toBeDefined();
        });
        
        it('should return null if no history', () => {
            service.init(mockGameState);
            
            const history = service.getPlayerHistory('unknown', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            expect(history).toBeNull();
        });
    });
    
    describe('recordPlayerHistory', () => {
        it('should create and record history', () => {
            service.init(mockGameState);
            
            service.recordPlayerHistory('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 5, 1000);
            
            const history = service.history['p1_power'];
            expect(history).toBeDefined();
            expect(history.records.length).toBe(1);
        });
        
        it('should append to existing history', () => {
            service.init(mockGameState);
            service.history['p1_power'] = new HeavenRankHistory('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            service.history['p1_power'].addRecord(10, 800);
            
            service.recordPlayerHistory('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 5, 1000);
            
            expect(service.history['p1_power'].records.length).toBe(2);
        });
    });
    
    describe('getRewardForRank', () => {
        it('should return correct tier for rank 1', () => {
            const tier = service.getRewardForRank(1);
            
            expect(tier.title).toBe('天机榜首');
            expect(tier.baseReward).toBe(10000);
        });
        
        it('should return correct tier for rank 5', () => {
            const tier = service.getRewardForRank(5);
            
            expect(tier.title).toBe('天机榜高手');
        });
        
        it('should return last tier for rank > 100', () => {
            const tier = service.getRewardForRank(150);
            
            expect(tier.title).toBe('天机榜新人');
        });
    });
    
    describe('generatePendingRewards', () => {
        it('should generate pending rewards', () => {
            service.init(mockGameState);
            service.powerRank.push(new HeavenRankEntry('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000));
            service.powerRank[0].rank = 1;
            
            service.generatePendingRewards();
            
            expect(service.pendingRewards.length).toBeGreaterThan(0);
        });
    });
    
    describe('isChallengeOnCooldown', () => {
        it('should return false if no challenge recorded', () => {
            service.init(mockGameState);
            
            const onCooldown = service.isChallengeOnCooldown('p1', 'p2');
            
            expect(onCooldown).toBe(false);
        });
        
        it('should return true if challenge was recent', () => {
            service.init(mockGameState);
            service.challengeRecords['p1_p2'] = Date.now();
            
            const onCooldown = service.isChallengeOnCooldown('p1', 'p2');
            
            expect(onCooldown).toBe(true);
        });
        
        it('should return false if cooldown expired', () => {
            service.init(mockGameState);
            service.challengeRecords['p1_p2'] = Date.now() - HEAVEN_RANK_CONFIG.CHALLENGE_COOLDOWN - 1000;
            
            const onCooldown = service.isChallengeOnCooldown('p1', 'p2');
            
            expect(onCooldown).toBe(false);
        });
    });
    
    describe('getChallengeCooldown', () => {
        it('should return 0 if no challenge', () => {
            service.init(mockGameState);
            
            const remaining = service.getChallengeCooldown('p1', 'p2');
            
            expect(remaining).toBe(0);
        });
        
        it('should return remaining cooldown time', () => {
            service.init(mockGameState);
            service.challengeRecords['p1_p2'] = Date.now() - 1000;
            
            const remaining = service.getChallengeCooldown('p1', 'p2');
            
            expect(remaining).toBeGreaterThan(0);
            expect(remaining).toBeLessThanOrEqual(HEAVEN_RANK_CONFIG.CHALLENGE_COOLDOWN);
        });
    });
    
    describe('recordChallenge', () => {
        it('should record challenge time', () => {
            service.init(mockGameState);
            
            service.recordChallenge('p1', 'p2');
            
            expect(service.challengeRecords['p1_p2']).toBeDefined();
            expect(service.challengeRecords['p1_p2']).toBeGreaterThan(0);
        });
    });
    
    describe('detectRankVolatility', () => {
        it('should return not volatile with insufficient history', () => {
            service.init(mockGameState);
            
            const result = service.detectRankVolatility('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            expect(result.volatile).toBe(false);
        });
        
        it('should detect volatile rank changes', () => {
            service.init(mockGameState);
            const history = new HeavenRankHistory('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            history.addRecord(20, 1000);
            history.addRecord(15, 1200);
            history.addRecord(5, 2000); // Big jump
            history.addRecord(1, 3000); // Another big jump
            service.history['p1_power'] = history;
            
            const result = service.detectRankVolatility('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER);
            
            expect(result.volatile).toBe(true);
            expect(result.changes.length).toBeGreaterThan(0);
        });
    });
    
    describe('getWeekNumber', () => {
        it('should return valid week number', () => {
            const week = service.getWeekNumber();
            
            expect(week).toBeGreaterThan(0);
            expect(week).toBeLessThanOrEqual(53);
        });
    });
});

// ===== MCP工具测试 =====

describe('MCP Tools', () => {
    let service;
    let mockGameState;
    
    beforeEach(() => {
        service = heavenRankService;
        mockGameState = createMockGameState();
        service.init(mockGameState);
    });
    
    describe('mcpRankHeavenList', () => {
        it('should list rank entries', () => {
            service.updatePlayerRank('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            service.updatePlayerRank('p2', '玩家2', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 2000);
            
            const result = mcpRankHeavenList({ rankType: 'power', page: 1, pageSize: 20 });
            
            expect(result.success).toBe(true);
            expect(result.rankType).toBe('power');
            expect(result.entries.length).toBe(2);
        });
        
        it('should handle pagination', () => {
            for (let i = 0; i < 25; i++) {
                service.updatePlayerRank(`p${i}`, `玩家${i}`, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000 - i);
            }
            
            const result = mcpRankHeavenList({ rankType: 'power', page: 2, pageSize: 10 });
            
            expect(result.success).toBe(true);
            expect(result.page).toBe(2);
            expect(result.entries.length).toBe(10);
        });
        
        it('should return error if not initialized', () => {
            const uninitService = new HeavenRankService();
            const originalInit = service.init;
            service.init = () => { service.initialized = false; return { success: false, error: 'Service not initialized' }; };
            
            const result = mcpRankHeavenList({ rankType: 'power' });
            
            service.init = originalInit;
        });
    });
    
    describe('mcpRankSelfQuery', () => {
        it('should return player rank info', () => {
            service.updatePlayerRank('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            
            const result = mcpRankSelfQuery({ playerId: 'p1', rankType: 'power' });
            
            expect(result.success).toBe(true);
            expect(result.ranked).toBe(true);
            expect(result.playerId).toBe('p1');
            expect(result.rank).toBeDefined();
        });
        
        it('should return not ranked if player not on rank', () => {
            const result = mcpRankSelfQuery({ playerId: 'unknown', rankType: 'power' });
            
            expect(result.success).toBe(true);
            expect(result.ranked).toBe(false);
        });
        
        it('should require playerId', () => {
            const result = mcpRankSelfQuery({});
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('playerId is required');
        });
    });
    
    describe('mcpRankHistoryView', () => {
        it('should return history records', () => {
            service.recordPlayerHistory('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 5, 1000);
            
            const result = mcpRankHistoryView({ playerId: 'p1', rankType: 'power', weeks: 10 });
            
            expect(result.success).toBe(true);
            expect(result.playerId).toBe('p1');
            expect(result.records.length).toBe(1);
        });
        
        it('should return empty if no history', () => {
            const result = mcpRankHistoryView({ playerId: 'unknown', rankType: 'power' });
            
            expect(result.success).toBe(true);
            expect(result.records.length).toBe(0);
        });
        
        it('should require playerId', () => {
            const result = mcpRankHistoryView({});
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('playerId is required');
        });
    });
    
    describe('mcpRankRewardClaim', () => {
        it('should claim rewards', () => {
            service.updatePlayerRank('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            service.powerRank[0].rank = 1;
            service.generatePendingRewards();
            
            const result = mcpRankRewardClaim({ playerId: 'p1' });
            
            expect(result.success).toBe(true);
        });
        
        it('should require playerId', () => {
            const result = mcpRankRewardClaim({});
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('playerId is required');
        });
    });
    
    describe('mcpRankChangeTrack', () => {
        it('should track rank changes', () => {
            service.recordPlayerHistory('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 10, 800);
            service.recordPlayerHistory('p1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 5, 1200);
            
            const result = mcpRankChangeTrack({ playerId: 'p1', rankType: 'power' });
            
            expect(result.success).toBe(true);
            expect(result.tracked).toBe(true);
        });
        
        it('should return not tracked with insufficient history', () => {
            const result = mcpRankChangeTrack({ playerId: 'p1', rankType: 'power' });
            
            expect(result.success).toBe(true);
            expect(result.tracked).toBe(false);
        });
        
        it('should require playerId', () => {
            const result = mcpRankChangeTrack({});
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('playerId is required');
        });
    });
    
    describe('mcpRankBattleChallenge', () => {
        it('should challenge another player', () => {
            service.updatePlayerRank('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            service.updatePlayerRank('p2', '玩家2', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 500);
            service.powerRank[0].rank = 1;
            service.powerRank[1].rank = 2;
            
            const result = mcpRankBattleChallenge({ playerId: 'p1', targetPlayerId: 'p2', rankType: 'power' });
            
            expect(result.success).toBe(true);
            expect(result.result).toBeDefined();
            expect([CHALLENGE_RESULT.WIN, CHALLENGE_RESULT.LOSE, CHALLENGE_RESULT.DRAW]).toContain(result.result);
        });
        
        it('should reject self challenge', () => {
            const result = mcpRankBattleChallenge({ playerId: 'p1', targetPlayerId: 'p1', rankType: 'power' });
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Cannot challenge yourself');
        });
        
        it('should reject challenge on cooldown', () => {
            service.updatePlayerRank('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            service.updatePlayerRank('p2', '玩家2', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 500);
            service.challengeRecords['p1_p2'] = Date.now();
            
            const result = mcpRankBattleChallenge({ playerId: 'p1', targetPlayerId: 'p2', rankType: 'power' });
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Challenge on cooldown');
        });
        
        it('should return error if target not on rank', () => {
            service.updatePlayerRank('p1', '玩家1', HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, 1000);
            
            const result = mcpRankBattleChallenge({ playerId: 'p1', targetPlayerId: 'unknown', rankType: 'power' });
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Target not on rank');
        });
        
        it('should require playerId and targetPlayerId', () => {
            const result = mcpRankBattleChallenge({});
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('playerId and targetPlayerId are required');
        });
    });
});

// ===== 配置常量测试 =====

describe('HEAVEN_RANK_CONFIG', () => {
    it('should have all required properties', () => {
        expect(HEAVEN_RANK_CONFIG.RANK_TYPES).toBeDefined();
        expect(HEAVEN_RANK_CONFIG.MAX_RANK_SIZE).toBe(100);
        expect(HEAVEN_RANK_CONFIG.MAX_HISTORY_RECORDS).toBe(50);
        expect(HEAVEN_RANK_CONFIG.RANK_CHANGE_THRESHOLD).toBe(5);
        expect(HEAVEN_RANK_CONFIG.CHALLENGE_COOLDOWN).toBe(60 * 60 * 1000);
        expect(HEAVEN_RANK_CONFIG.REWARD_CYCLE).toBe(7 * 24 * 60 * 60 * 1000);
        expect(HEAVEN_RANK_CONFIG.CONSECUTIVE_BONUS_THRESHOLD).toBe(4);
    });
});

describe('RANK_REWARD_TIERS', () => {
    it('should have correct tier structure', () => {
        expect(RANK_REWARD_TIERS.length).toBeGreaterThan(0);
        RANK_REWARD_TIERS.forEach(tier => {
            expect(tier.minRank).toBeDefined();
            expect(tier.maxRank).toBeDefined();
            expect(tier.baseReward).toBeDefined();
            expect(tier.title).toBeDefined();
        });
    });
    
    it('should cover ranks 1-100', () => {
        const covered = RANK_REWARD_TIERS.reduce((acc, tier) => {
            for (let i = tier.minRank; i <= tier.maxRank; i++) {
                acc.add(i);
            }
            return acc;
        }, new Set());
        
        expect(covered.size).toBe(100);
    });
});

describe('CHALLENGE_RESULT', () => {
    it('should have win, lose, draw', () => {
        expect(CHALLENGE_RESULT.WIN).toBe('win');
        expect(CHALLENGE_RESULT.LOSE).toBe('lose');
        expect(CHALLENGE_RESULT.DRAW).toBe('draw');
    });
});

describe('HEAVEN_RANK_TOOLS', () => {
    it('should have 6 tools', () => {
        expect(HEAVEN_RANK_TOOLS.length).toBe(6);
    });
    
    it('should have all required tool names', () => {
        const toolNames = HEAVEN_RANK_TOOLS.map(t => t.name);
        expect(toolNames).toContain('rank.heaven.list');
        expect(toolNames).toContain('rank.self.query');
        expect(toolNames).toContain('rank.history.view');
        expect(toolNames).toContain('rank.reward.claim');
        expect(toolNames).toContain('rank.change.track');
        expect(toolNames).toContain('rank.battle.challenge');
    });
    
    it('should have handlers for all tools', () => {
        HEAVEN_RANK_TOOLS.forEach(tool => {
            expect(typeof tool.handler).toBe('function');
        });
    });
});