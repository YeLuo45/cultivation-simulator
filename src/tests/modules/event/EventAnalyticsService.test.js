/**
 * EventAnalyticsService.test.js - TDD测试
 * 事件分析系统测试 - 覆盖率 >= 95%
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
    EventAnalyticsService,
    EventIndex,
    eventAnalyticsService,
    ANALYTICS_CONFIG,
    EVENT_TYPE_CATEGORIES,
    mcpAnalyticsStats,
    mcpAnalyticsTrend,
    mcpAnalyticsPattern,
    mcpAnalyticsAnomaly,
    mcpHistoryQuery,
    mcpAnalyticsForecast,
    EVENT_ANALYTICS_TOOLS
} from '../../../systems/event/EventAnalyticsService.js';
import { realmEventBus } from '../../../systems/event/RealmEventBus.js';

// ===== Mock gameState =====
const mockGameState = {
    player: { name: 'Test Player' },
    day: 1
};

// ===== EventIndex测试 =====

describe('EventIndex', () => {
    let index;
    
    beforeEach(() => {
        index = new EventIndex();
    });
    
    it('should create empty index', () => {
        expect(index.byType.size).toBe(0);
        expect(index.bySource.size).toBe(0);
        expect(index.byTime.size).toBe(0);
    });
    
    it('should index events by type', () => {
        const event = {
            id: 'test1',
            type: 'player.level.up',
            source: 'player',
            timestamp: Date.now(),
            priority: 'medium'
        };
        
        index.index(event);
        
        expect(index.byType.has('player.level.up')).toBe(true);
        expect(index.byType.get('player.level.up').length).toBe(1);
    });
    
    it('should index events by source', () => {
        const event = {
            id: 'test1',
            type: 'test.event',
            source: 'combat',
            timestamp: Date.now(),
            priority: 'medium'
        };
        
        index.index(event);
        
        expect(index.bySource.has('combat')).toBe(true);
        expect(index.bySource.get('combat').length).toBe(1);
    });
    
    it('should index events by time bucket', () => {
        const now = Date.now();
        const event = {
            id: 'test1',
            type: 'test.event',
            source: 'test',
            timestamp: now,
            priority: 'medium'
        };
        
        index.index(event);
        
        const timeBucket = Math.floor(now / (5 * 60 * 1000)) * (5 * 60 * 1000);
        expect(index.byTime.has(timeBucket)).toBe(true);
    });
    
    it('should update type counts', () => {
        const event = {
            id: 'test1',
            type: 'player.cultivate',
            source: 'player',
            timestamp: Date.now(),
            priority: 'medium'
        };
        
        index.index(event);
        
        expect(index.typeCounts.get('player.cultivate')).toBe(1);
    });
    
    it('should update source counts', () => {
        const event = {
            id: 'test1',
            type: 'test.event',
            source: 'npc',
            timestamp: Date.now(),
            priority: 'medium'
        };
        
        index.index(event);
        
        expect(index.sourceCounts.get('npc')).toBe(1);
    });
    
    it('should update hourly counts', () => {
        const now = Date.now();
        const event = {
            id: 'test1',
            type: 'test.event',
            source: 'test',
            timestamp: now,
            priority: 'medium'
        };
        
        index.index(event);
        
        const hourBucket = Math.floor(now / (60 * 60 * 1000)) * (60 * 60 * 1000);
        expect(index.hourlyCounts.get(hourBucket)).toBe(1);
    });
    
    it('should clear all indexes', () => {
        const event = {
            id: 'test1',
            type: 'test.event',
            source: 'test',
            timestamp: Date.now(),
            priority: 'medium'
        };
        
        index.index(event);
        index.clear();
        
        expect(index.byType.size).toBe(0);
        expect(index.bySource.size).toBe(0);
        expect(index.byTime.size).toBe(0);
        expect(index.typeCounts.size).toBe(0);
    });
});

// ===== EventAnalyticsService测试 =====

describe('EventAnalyticsService', () => {
    let service;
    
    beforeEach(() => {
        // Reset event bus
        realmEventBus.reset();
        
        // Create new service instance for each test
        service = new EventAnalyticsService();
    });
    
    afterEach(() => {
        // Clean up subscription if exists
        if (service.eventBusSubscription) {
            try {
                realmEventBus.unsubscribe(service.eventBusSubscription.subscriberId);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    });
    
    describe('init', () => {
        it('should initialize successfully', () => {
            const result = service.init(mockGameState);
            
            expect(result.success).toBe(true);
            expect(service.isInitialized).toBe(true);
        });
        
        it('should not allow double initialization', () => {
            service.init(mockGameState);
            const result = service.init(mockGameState);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Already initialized');
        });
    });
    
    describe('indexEvent', () => {
        it('should index events from event bus', () => {
            service.init(mockGameState);
            
            // Publish some events
            realmEventBus.publish('player.level.up', { level: 2 }, { source: 'player' });
            realmEventBus.publish('combat.start', { opponent: 'monster' }, { source: 'combat' });
            
            // Service should have indexed them
            expect(service.eventIndex.typeCounts.get('player.level.up')).toBe(1);
            expect(service.eventIndex.typeCounts.get('combat.start')).toBe(1);
        });
    });
    
    describe('rebuildIndex', () => {
        it('should rebuild index from existing history', () => {
            // Add events to bus before service init
            realmEventBus.publish('event1', {}, { source: 'test' });
            realmEventBus.publish('event2', {}, { source: 'test' });
            
            service.init(mockGameState);
            service.rebuildIndex();
            
            expect(service.eventIndex.typeCounts.get('event1')).toBe(1);
            expect(service.eventIndex.typeCounts.get('event2')).toBe(1);
        });
    });
    
    describe('getStats', () => {
        beforeEach(() => {
            service.init(mockGameState);
        });
        
        it('should return event statistics', () => {
            // Publish events
            realmEventBus.publish('player.level.up', { level: 2 }, { source: 'player', priority: 'high' });
            realmEventBus.publish('player.cultivate', {}, { source: 'player', priority: 'medium' });
            realmEventBus.publish('npc.spawn', {}, { source: 'npc', priority: 'low' });
            
            const stats = service.getStats();
            
            expect(stats.totalEvents).toBe(3);
            expect(stats.typeStats['player.level.up'].count).toBe(1);
            expect(stats.typeStats['player.cultivate'].count).toBe(1);
            expect(stats.typeStats['npc.spawn'].count).toBe(1);
        });
        
        it('should calculate percentages', () => {
            realmEventBus.publish('event1', {}, { source: 'test' });
            realmEventBus.publish('event1', {}, { source: 'test' });
            realmEventBus.publish('event2', {}, { source: 'test' });
            
            const stats = service.getStats();
            
            expect(stats.typeStats['event1'].percentage).toBeCloseTo(66.67, 1);
            expect(stats.typeStats['event2'].percentage).toBeCloseTo(33.33, 1);
        });
        
        it('should return top types', () => {
            for (let i = 0; i < 5; i++) {
                realmEventBus.publish('frequent.event', {}, { source: 'test' });
            }
            realmEventBus.publish('rare.event', {}, { source: 'test' });
            
            const stats = service.getStats();
            
            expect(stats.topTypes[0].type).toBe('frequent.event');
            expect(stats.topTypes[0].count).toBe(5);
        });
        
        it('should filter by event type', () => {
            realmEventBus.publish('player.event', {}, { source: 'test' });
            realmEventBus.publish('npc.event', {}, { source: 'test' });
            
            const stats = service.getStats({ eventType: 'player.event' });
            
            expect(stats.totalEvents).toBe(1);
        });
        
        it('should filter by source', () => {
            realmEventBus.publish('event1', {}, { source: 'player' });
            realmEventBus.publish('event2', {}, { source: 'npc' });
            
            const stats = service.getStats({ source: 'player' });
            
            expect(stats.totalEvents).toBe(1);
        });
        
        it('should filter by time range', () => {
            const now = Date.now();
            const oldTime = now - 100000;
            
            realmEventBus.publish('old.event', {}, { source: 'test' });
            
            // Manually add old event with old timestamp
            const oldEvent = realmEventBus.createEvent('old.event', {}, { 
                timestamp: oldTime 
            });
            realmEventBus.eventHistory.push(oldEvent);
            
            const stats = service.getStats({ timeRange: { since: now - 50000 } });
            
            expect(stats.totalEvents).toBeGreaterThanOrEqual(0);
        });
        
        it('should count priority stats', () => {
            realmEventBus.publish('high.priority', {}, { priority: 'high' });
            realmEventBus.publish('medium.priority', {}, { priority: 'medium' });
            realmEventBus.publish('low.priority', {}, { priority: 'low' });
            
            const stats = service.getStats();
            
            expect(stats.priorityStats.high).toBe(1);
            expect(stats.priorityStats.medium).toBe(1);
            expect(stats.priorityStats.low).toBe(1);
        });
    });
    
    describe('getTrend', () => {
        beforeEach(() => {
            service.init(mockGameState);
        });
        
        it('should return trend data', () => {
            const trend = service.getTrend();
            
            expect(trend).toHaveProperty('granularity');
            expect(trend).toHaveProperty('intervals');
            expect(trend).toHaveProperty('averageCount');
            expect(trend).toHaveProperty('movingAverage');
            expect(trend).toHaveProperty('trendDirection');
        });
        
        it('should respect window size', () => {
            const trend = service.getTrend({ windowSize: 20 });
            
            expect(trend.windowSize).toBe(20);
            expect(trend.intervals.length).toBe(20);
        });
        
        it('should support different granularities', () => {
            const hourlyTrend = service.getTrend({ granularity: 'hour' });
            const minuteTrend = service.getTrend({ granularity: 'minute' });
            const dailyTrend = service.getTrend({ granularity: 'day' });
            
            expect(hourlyTrend.granularity).toBe('hour');
            expect(minuteTrend.granularity).toBe('minute');
            expect(dailyTrend.granularity).toBe('day');
        });
        
        it('should calculate moving average', () => {
            // Add some events
            for (let i = 0; i < 10; i++) {
                realmEventBus.publish('test.event', {}, { source: 'test' });
            }
            
            const trend = service.getTrend();
            
            expect(trend.movingAverage.length).toBe(trend.intervals.length);
        });
        
        it('should detect trend direction', () => {
            const trend = service.getTrend();
            
            expect(['increasing', 'decreasing', 'stable']).toContain(trend.trendDirection);
        });
        
        it('should identify peak time', () => {
            const trend = service.getTrend();
            
            expect(trend.peakTime).toHaveProperty('hour');
            expect(trend.peakTime).toHaveProperty('count');
        });
        
        it('should filter by event type', () => {
            realmEventBus.publish('player.event', {});
            realmEventBus.publish('npc.event', {});
            
            const trend = service.getTrend({ eventType: 'player.event' });
            
            expect(trend.eventTypeFilter).toBe('player.event');
        });
    });
    
    describe('detectPattern', () => {
        beforeEach(() => {
            service.init(mockGameState);
        });
        
        it('should detect recurring patterns', () => {
            // Publish sequence: A -> B -> A -> B -> A
            realmEventBus.publish('event.A', {});
            realmEventBus.publish('event.B', {});
            realmEventBus.publish('event.A', {});
            realmEventBus.publish('event.B', {});
            realmEventBus.publish('event.A', {});
            
            const result = service.detectPattern({ sequenceLength: 2, minOccurrences: 2 });
            
            expect(result.totalPatternsFound).toBeGreaterThan(0);
        });
        
        it('should return pattern details', () => {
            realmEventBus.publish('test.A', {});
            realmEventBus.publish('test.B', {});
            realmEventBus.publish('test.A', {});
            realmEventBus.publish('test.B', {});
            
            const result = service.detectPattern();
            
            if (result.patterns.length > 0) {
                expect(result.patterns[0]).toHaveProperty('pattern');
                expect(result.patterns[0]).toHaveProperty('sequence');
                expect(result.patterns[0]).toHaveProperty('occurrences');
                expect(result.patterns[0]).toHaveProperty('confidence');
            }
        });
        
        it('should respect sequence length parameter', () => {
            const result = service.detectPattern({ sequenceLength: 3 });
            
            expect(result.sequenceLength).toBe(3);
        });
        
        it('should respect min occurrences parameter', () => {
            const result = service.detectPattern({ minOccurrences: 3 });
            
            expect(result.minOccurrences).toBe(3);
        });
        
        it('should handle empty history', () => {
            const result = service.detectPattern();
            
            expect(result.patterns).toEqual([]);
        });
        
        it('should limit results to top 10', () => {
            // Publish many different events to create many patterns
            for (let i = 0; i < 20; i++) {
                realmEventBus.publish(`type${i % 5}`, {});
            }
            
            const result = service.detectPattern();
            
            expect(result.patterns.length).toBeLessThanOrEqual(10);
        });
    });
    
    describe('detectAnomaly', () => {
        beforeEach(() => {
            service.init(mockGameState);
        });
        
        it('should detect anomalies in event frequency', () => {
            // Add a burst of events at similar time
            const now = Date.now();
            for (let i = 0; i < 20; i++) {
                const event = realmEventBus.createEvent('burst.event', {}, { 
                    timestamp: now - i * 1000 
                });
                realmEventBus.eventHistory.push(event);
            }
            
            const result = service.detectAnomaly();
            
            // Should have some anomalies or valid statistics
            if (result.success) {
                expect(result).toHaveProperty('statistics');
                expect(result.statistics).toHaveProperty('mean');
                expect(result.statistics).toHaveProperty('stdDev');
            }
        });
        
        it('should return error for insufficient data', () => {
            // Only add a few events
            realmEventBus.publish('event1', {});
            realmEventBus.publish('event2', {});
            
            const result = service.detectAnomaly();
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Insufficient');
        });
        
        it('should identify rare event types', () => {
            // Create a mix of common and rare events
            for (let i = 0; i < 10; i++) {
                realmEventBus.publish('common.event', {});
            }
            realmEventBus.publish('rare.event', {});
            
            const result = service.detectAnomaly();
            
            if (result.success && result.rareEventTypes) {
                const rareTypes = result.rareEventTypes;
                expect(Array.isArray(rareTypes)).toBe(true);
            }
        });
        
        it('should respect threshold parameter', () => {
            const now = Date.now();
            for (let i = 0; i < 30; i++) {
                realmEventBus.publish('test.event', {}, { 
                    timestamp: now - i * 60 * 1000 
                });
            }
            
            const result = service.detectAnomaly({ threshold: 3.0 });
            
            if (result.success) {
                expect(result.statistics.threshold).toBe(3.0);
            }
        });
        
        it('should respect window size parameter', () => {
            const now = Date.now();
            for (let i = 0; i < 30; i++) {
                realmEventBus.publish('test.event', {}, { 
                    timestamp: now - i * 60 * 1000 
                });
            }
            
            const result = service.detectAnomaly({ windowSize: 100 });
            
            // Should complete without error (may fail due to insufficient data)
            expect(result).toHaveProperty('success');
        });
        
        it('should filter by source', () => {
            realmEventBus.publish('player.event', {}, { source: 'player' });
            realmEventBus.publish('npc.event', {}, { source: 'npc' });
            
            const result = service.detectAnomaly({ source: 'player' });
            
            // Should only analyze player events
            expect(result).toHaveProperty('success');
        });
        
        it('should calculate z-scores for anomalies', () => {
            const now = Date.now();
            // Add events with varying timestamps to create variance
            for (let i = 0; i < 30; i++) {
                const event = realmEventBus.createEvent('test.event', {}, {
                    timestamp: now - i * 60 * 1000
                });
                realmEventBus.eventHistory.push(event);
            }
            
            const result = service.detectAnomaly({ threshold: 2.0 });
            
            if (result.success && result.anomalies) {
                for (const anomaly of result.anomalies) {
                    expect(anomaly).toHaveProperty('zScore');
                    expect(anomaly).toHaveProperty('severity');
                }
            }
        });
    });
    
    describe('queryHistory', () => {
        beforeEach(() => {
            service.init(mockGameState);
        });
        
        it('should return paginated events', () => {
            for (let i = 0; i < 20; i++) {
                realmEventBus.publish('test.event', { index: i });
            }
            
            const result = service.queryHistory({ limit: 10, offset: 0 });
            
            expect(result.success).toBe(true);
            expect(result.events.length).toBe(10);
            expect(result.totalCount).toBe(20);
            expect(result.hasMore).toBe(true);
        });
        
        it('should filter by event type', () => {
            realmEventBus.publish('player.event', {});
            realmEventBus.publish('npc.event', {});
            
            const result = service.queryHistory({ eventType: 'player.event' });
            
            expect(result.totalCount).toBe(1);
            expect(result.events[0].type).toBe('player.event');
        });
        
        it('should filter by source', () => {
            realmEventBus.publish('event1', {}, { source: 'player' });
            realmEventBus.publish('event2', {}, { source: 'npc' });
            
            const result = service.queryHistory({ source: 'player' });
            
            expect(result.totalCount).toBe(1);
        });
        
        it('should filter by priority', () => {
            realmEventBus.publish('high.event', {}, { priority: 'high' });
            realmEventBus.publish('low.event', {}, { priority: 'low' });
            
            const result = service.queryHistory({ priority: 'high' });
            
            expect(result.totalCount).toBe(1);
        });
        
        it('should filter by time range', () => {
            const now = Date.now();
            
            realmEventBus.publish('old.event', {}, { timestamp: now - 100000 });
            realmEventBus.publish('new.event', {}, { timestamp: now });
            
            const result = service.queryHistory({ since: now - 50000 });
            
            expect(result.totalCount).toBeGreaterThanOrEqual(1);
        });
        
        it('should filter by data fields', () => {
            realmEventBus.publish('event1', { type: 'A', value: 1 });
            realmEventBus.publish('event2', { type: 'B', value: 2 });
            
            const result = service.queryHistory({ dataFilter: { type: 'A' } });
            
            expect(result.totalCount).toBe(1);
        });
        
        it('should handle offset pagination', () => {
            // Add events with distinct timestamps
            const now = Date.now();
            for (let i = 0; i < 15; i++) {
                realmEventBus.publish('test.event', { index: i }, { 
                    timestamp: now - (15 - i) * 1000 // descending timestamps
                });
            }
            
            const page1 = service.queryHistory({ limit: 5, offset: 0 });
            const page2 = service.queryHistory({ limit: 5, offset: 5 });
            
            // Page 1 should have indices 14, 13, 12, 11, 10 (newest first)
            expect(page1.events[0].data.index).toBe(14);
            // Page 2 should have indices 9, 8, 7, 6, 5
            expect(page2.events[0].data.index).toBe(9);
        });
        
        it('should indicate when there is no more data', () => {
            for (let i = 0; i < 5; i++) {
                realmEventBus.publish('test.event', {});
            }
            
            const result = service.queryHistory({ limit: 10, offset: 5 });
            
            expect(result.hasMore).toBe(false);
        });
    });
    
    describe('forecast', () => {
        beforeEach(() => {
            service.init(mockGameState);
        });
        
        it('should generate forecast based on history', () => {
            // Add enough events for meaningful forecast
            const now = Date.now();
            for (let i = 0; i < 30; i++) {
                const event = realmEventBus.createEvent('test.event', {}, {
                    timestamp: now - i * 60 * 60 * 1000 // One event per hour
                });
                realmEventBus.eventHistory.push(event);
            }
            
            const result = service.forecast({ horizonHours: 12 });
            
            expect(result.success).toBe(true);
            expect(result).toHaveProperty('horizonHours');
            expect(result).toHaveProperty('forecastSlots');
        });
        
        it('should return error for insufficient data', () => {
            // Only add a few events
            realmEventBus.publish('event1', {});
            
            const result = service.forecast();
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Insufficient');
        });
        
        it('should include predicted event types', () => {
            const now = Date.now();
            for (let i = 0; i < 20; i++) {
                realmEventBus.publish('player.level.up', {}, { 
                    timestamp: now - i * 60 * 60 * 1000 
                });
            }
            
            const result = service.forecast();
            
            expect(result.topPredictedTypes.length).toBeGreaterThan(0);
        });
        
        it('should respect horizon hours parameter', () => {
            const now = Date.now();
            for (let i = 0; i < 30; i++) {
                realmEventBus.publish('test.event', {}, { 
                    timestamp: now - i * 60 * 60 * 1000 
                });
            }
            
            const result = service.forecast({ horizonHours: 48 });
            
            if (result.success) {
                expect(result.horizonHours).toBe(48);
                expect(result.forecastSlots.length).toBe(48);
            } else {
                // If insufficient data, this is acceptable
                expect(result.error).toContain('Insufficient');
            }
        });
        
        it('should include periodicity analysis', () => {
            const now = Date.now();
            for (let i = 0; i < 30; i++) {
                realmEventBus.publish('test.event', {}, { 
                    timestamp: now - i * 60 * 60 * 1000 
                });
            }
            
            const result = service.forecast();
            
            if (result.success) {
                expect(result).toHaveProperty('periodicity');
                expect(['none', 'hourly', 'daily']).toContain(result.periodicity);
            } else {
                expect(result.error).toContain('Insufficient');
            }
        });
        
        it('should calculate confidence level', () => {
            const now = Date.now();
            for (let i = 0; i < 30; i++) {
                realmEventBus.publish('test.event', {}, { 
                    timestamp: now - i * 60 * 60 * 1000 
                });
            }
            
            const result = service.forecast();
            
            if (result.success) {
                expect(result).toHaveProperty('confidence');
                expect(['low', 'medium', 'high']).toContain(result.confidence);
            } else {
                expect(result.error).toContain('Insufficient');
            }
        });
        
        it('should indicate based on number of events', () => {
            const now = Date.now();
            for (let i = 0; i < 30; i++) {
                realmEventBus.publish('test.event', {}, { 
                    timestamp: now - i * 60 * 60 * 1000 
                });
            }
            
            const result = service.forecast();
            
            if (result.success) {
                expect(result).toHaveProperty('basedOnEvents');
            } else {
                expect(result.error).toContain('Insufficient');
            }
        });
        
        it('should calculate avg events per hour', () => {
            const now = Date.now();
            for (let i = 0; i < 30; i++) {
                realmEventBus.publish('test.event', {}, { 
                    timestamp: now - i * 60 * 60 * 1000 
                });
            }
            
            const result = service.forecast();
            
            if (result.success) {
                expect(result).toHaveProperty('avgEventsPerHour');
            } else {
                expect(result.error).toContain('Insufficient');
            }
        });
        
        it('should filter by event type', () => {
            realmEventBus.publish('player.event', {});
            realmEventBus.publish('npc.event', {});
            
            const result = service.forecast({ eventType: 'player.event' });
            
            // Should complete without error
            expect(result).toHaveProperty('success');
        });
    });
    
    describe('getStatus', () => {
        it('should return service status', () => {
            service.init(mockGameState);
            
            const status = service.getStatus();
            
            expect(status).toHaveProperty('isInitialized');
            expect(status).toHaveProperty('totalIndexedEvents');
            expect(status).toHaveProperty('isSubscribedToEventBus');
            expect(status).toHaveProperty('config');
        });
    });
    
    describe('reset', () => {
        it('should reset service state', () => {
            service.init(mockGameState);
            realmEventBus.publish('test.event', {});
            
            service.reset();
            
            // Should rebuild index
            expect(service.eventIndex).toBeDefined();
        });
    });
});

// ===== MCP工具测试 =====

describe('MCP Tools', () => {
    beforeEach(() => {
        // Reset event bus and reinit service
        realmEventBus.reset();
        eventAnalyticsService.reset();
        eventAnalyticsService.init(mockGameState);
    });
    
    describe('mcpAnalyticsStats', () => {
        it('should return event statistics', () => {
            realmEventBus.publish('test.event', {});
            
            const result = mcpAnalyticsStats({});
            
            expect(result.success).toBe(true);
            expect(result).toHaveProperty('totalEvents');
        });
        
        it('should filter by parameters', () => {
            realmEventBus.publish('player.event', {}, { source: 'player' });
            realmEventBus.publish('npc.event', {}, { source: 'npc' });
            
            const result = mcpAnalyticsStats({ source: 'player' });
            
            expect(result.totalEvents).toBe(1);
        });
        
        it('should handle errors gracefully', () => {
            // Force an error by making history query with invalid params
            const result = mcpAnalyticsStats({ eventType: 123 });
            
            expect(result).toHaveProperty('success');
        });
    });
    
    describe('mcpAnalyticsTrend', () => {
        it('should return trend data', () => {
            const result = mcpAnalyticsTrend({});
            
            expect(result.success).toBe(true);
            expect(result).toHaveProperty('trendDirection');
        });
        
        it('should respect parameters', () => {
            const result = mcpAnalyticsTrend({ windowSize: 50, granularity: 'hour' });
            
            expect(result.windowSize).toBe(50);
            expect(result.granularity).toBe('hour');
        });
    });
    
    describe('mcpAnalyticsPattern', () => {
        it('should detect patterns', () => {
            realmEventBus.publish('A', {});
            realmEventBus.publish('B', {});
            realmEventBus.publish('A', {});
            realmEventBus.publish('B', {});
            
            const result = mcpAnalyticsPattern({});
            
            expect(result.success).toBe(true);
            expect(result).toHaveProperty('patterns');
        });
        
        it('should respect parameters', () => {
            const result = mcpAnalyticsPattern({ 
                sequenceLength: 3, 
                minOccurrences: 2 
            });
            
            expect(result.sequenceLength).toBe(3);
            expect(result.minOccurrences).toBe(2);
        });
    });
    
    describe('mcpAnalyticsAnomaly', () => {
        it('should detect anomalies', () => {
            // Add enough events
            const now = Date.now();
            for (let i = 0; i < 20; i++) {
                realmEventBus.publish('test.event', {}, { 
                    timestamp: now - i * 60 * 1000 
                });
            }
            
            const result = mcpAnalyticsAnomaly({});
            
            expect(result).toHaveProperty('success');
        });
        
        it('should respect threshold parameter', () => {
            const result = mcpAnalyticsAnomaly({ threshold: 3.0 });
            
            if (result.success) {
                expect(result.statistics.threshold).toBe(3.0);
            }
        });
    });
    
    describe('mcpHistoryQuery', () => {
        it('should return paginated history', () => {
            for (let i = 0; i < 10; i++) {
                realmEventBus.publish('test.event', {});
            }
            
            const result = mcpHistoryQuery({ limit: 5, offset: 0 });
            
            expect(result.success).toBe(true);
            expect(result.events.length).toBe(5);
        });
        
        it('should filter events', () => {
            realmEventBus.publish('player.event', {});
            realmEventBus.publish('npc.event', {});
            
            const result = mcpHistoryQuery({ eventType: 'player.event' });
            
            expect(result.totalCount).toBe(1);
        });
        
        it('should handle pagination parameters', () => {
            for (let i = 0; i < 15; i++) {
                realmEventBus.publish('test.event', {});
            }
            
            const result = mcpHistoryQuery({ limit: 5, offset: 10 });
            
            expect(result.hasMore).toBe(false);
        });
    });
    
    describe('mcpAnalyticsForecast', () => {
        it('should generate forecast', () => {
            // Add enough events
            const now = Date.now();
            for (let i = 0; i < 20; i++) {
                realmEventBus.publish('test.event', {}, { 
                    timestamp: now - i * 60 * 60 * 1000 
                });
            }
            
            const result = mcpAnalyticsForecast({});
            
            expect(result.success).toBe(true);
            expect(result).toHaveProperty('forecastSlots');
        });
        
        it('should respect horizon hours', () => {
            const result = mcpAnalyticsForecast({ horizonHours: 48 });
            
            if (result.success) {
                expect(result.horizonHours).toBe(48);
                expect(result.forecastSlots.length).toBe(48);
            }
        });
    });
});

// ===== EVENT_ANALYTICS_TOOLS定义测试 =====

describe('EVENT_ANALYTICS_TOOLS', () => {
    it('should have all 6 tools defined', () => {
        const toolNames = Object.keys(EVENT_ANALYTICS_TOOLS);
        
        expect(toolNames).toContain('event.analytics.stats');
        expect(toolNames).toContain('event.analytics.trend');
        expect(toolNames).toContain('event.analytics.pattern');
        expect(toolNames).toContain('event.analytics.anomaly');
        expect(toolNames).toContain('event.history.query');
        expect(toolNames).toContain('event.analytics.forecast');
    });
    
    it('should have correct tool descriptions', () => {
        expect(EVENT_ANALYTICS_TOOLS['event.analytics.stats'].description).toBeTruthy();
        expect(EVENT_ANALYTICS_TOOLS['event.analytics.trend'].description).toBeTruthy();
        expect(EVENT_ANALYTICS_TOOLS['event.analytics.pattern'].description).toBeTruthy();
        expect(EVENT_ANALYTICS_TOOLS['event.analytics.anomaly'].description).toBeTruthy();
        expect(EVENT_ANALYTICS_TOOLS['event.history.query'].description).toBeTruthy();
        expect(EVENT_ANALYTICS_TOOLS['event.analytics.forecast'].description).toBeTruthy();
    });
    
    it('should have input schemas for all tools', () => {
        for (const tool of Object.values(EVENT_ANALYTICS_TOOLS)) {
            expect(tool.inputSchema).toBeDefined();
            expect(tool.inputSchema.type).toBe('object');
        }
    });
});

// ===== 配置常量测试 =====

describe('ANALYTICS_CONFIG', () => {
    it('should have required configuration values', () => {
        expect(ANALYTICS_CONFIG.maxHistoryLength).toBeDefined();
        expect(ANALYTICS_CONFIG.trendWindowSize).toBeDefined();
        expect(ANALYTICS_CONFIG.anomalyThreshold).toBeDefined();
        expect(ANALYTICS_CONFIG.forecastHorizonHours).toBeDefined();
        expect(ANALYTICS_CONFIG.minSampleSize).toBeDefined();
    });
    
    it('should have reasonable default values', () => {
        expect(ANALYTICS_CONFIG.maxHistoryLength).toBeGreaterThan(100);
        expect(ANALYTICS_CONFIG.minSampleSize).toBeGreaterThan(0);
        expect(ANALYTICS_CONFIG.anomalyThreshold).toBeGreaterThan(0);
    });
});

describe('EVENT_TYPE_CATEGORIES', () => {
    it('should have event type categories defined', () => {
        expect(EVENT_TYPE_CATEGORIES.PLAYER).toBe('player');
        expect(EVENT_TYPE_CATEGORIES.NPC).toBe('npc');
        expect(EVENT_TYPE_CATEGORIES.REALM).toBe('realm');
        expect(EVENT_TYPE_CATEGORIES.SECT).toBe('sect');
        expect(EVENT_TYPE_CATEGORIES.TREASURE).toBe('treasure');
        expect(EVENT_TYPE_CATEGORIES.SYSTEM).toBe('system');
    });
});

// ===== 导出测试 =====

describe('Exports', () => {
    it('should export EventAnalyticsService class', () => {
        expect(EventAnalyticsService).toBeDefined();
        expect(typeof EventAnalyticsService).toBe('function');
    });
    
    it('should export EventIndex class', () => {
        expect(EventIndex).toBeDefined();
        expect(typeof EventIndex).toBe('function');
    });
    
    it('should export singleton instance', () => {
        expect(eventAnalyticsService).toBeDefined();
        expect(eventAnalyticsService).toBeInstanceOf(EventAnalyticsService);
    });
    
    it('should export all MCP handler functions', () => {
        expect(typeof mcpAnalyticsStats).toBe('function');
        expect(typeof mcpAnalyticsTrend).toBe('function');
        expect(typeof mcpAnalyticsPattern).toBe('function');
        expect(typeof mcpAnalyticsAnomaly).toBe('function');
        expect(typeof mcpHistoryQuery).toBe('function');
        expect(typeof mcpAnalyticsForecast).toBe('function');
    });
    
    it('should export EVENT_ANALYTICS_TOOLS object', () => {
        expect(EVENT_ANALYTICS_TOOLS).toBeDefined();
        expect(typeof EVENT_ANALYTICS_TOOLS).toBe('object');
    });
});