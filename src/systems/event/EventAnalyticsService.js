/**
 * EventAnalyticsService.js - 事件分析系统
 * Direction O续: 仙界事件总线 - 事件历史分析
 * 
 * 核心功能:
 * 1. EVENT_HISTORY - 事件历史存储和索引
 * 2. ANALYTICS - 事件统计分析 (统计/趋势/热点)
 * 3. PATTERN_DETECTION - 事件模式检测 (异常/预测)
 * 
 * 6个MCP工具:
 * - event.analytics.stats - 获取事件统计
 * - event.analytics.trend - 获取事件趋势
 * - event.analytics.pattern - 检测事件模式
 * - event.analytics.anomaly - 检测异常事件
 * - event.history.query - 查询历史事件
 * - event.analytics.forecast - 预测未来事件
 */

import { realmEventBus } from './RealmEventBus.js';

// ===== 配置常量 =====

const ANALYTICS_CONFIG = {
    maxHistoryLength: 1000,
    maxIndexedEvents: 2000,
    trendWindowSize: 100,      // 趋势分析窗口大小
    anomalyThreshold: 2.0,     // 异常检测标准差倍数
    forecastHorizonHours: 24,   // 预测时间范围
    minSampleSize: 10          // 最小样本量
};

const EVENT_TYPE_CATEGORIES = {
    PLAYER: 'player',
    NPC: 'npc',
    REALM: 'realm',
    SECT: 'sect',
    TREASURE: 'treasure',
    SYSTEM: 'system',
    COMBAT: 'combat',
    CULTIVATION: 'cultivation'
};

// ===== 事件索引结构 =====

/**
 * EventIndex - 事件索引类
 * 用于快速查询和统计
 */
class EventIndex {
    constructor() {
        this.byType = new Map();        // eventType -> Event[]
        this.bySource = new Map();      // source -> Event[]
        this.byTime = new Map();        // timeBucket -> Event[] (5-minute buckets)
        this.typeCounts = new Map();    // eventType -> count
        this.sourceCounts = new Map();   // source -> count
        this.hourlyCounts = new Map();   // hour timestamp -> count
    }
    
    /**
     * 索引事件
     */
    index(event) {
        // By type
        if (!this.byType.has(event.type)) {
            this.byType.set(event.type, []);
        }
        this.byType.get(event.type).push(event);
        
        // By source
        if (!this.bySource.has(event.source)) {
            this.bySource.set(event.source, []);
        }
        this.bySource.get(event.source).push(event);
        
        // By time bucket (5-minute intervals)
        const timeBucket = Math.floor(event.timestamp / (5 * 60 * 1000)) * (5 * 60 * 1000);
        if (!this.byTime.has(timeBucket)) {
            this.byTime.set(timeBucket, []);
        }
        this.byTime.get(timeBucket).push(event);
        
        // Counts
        this.typeCounts.set(event.type, (this.typeCounts.get(event.type) || 0) + 1);
        this.sourceCounts.set(event.source, (this.sourceCounts.get(event.source) || 0) + 1);
        
        // Hourly counts
        const hourBucket = Math.floor(event.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
        this.hourlyCounts.set(hourBucket, (this.hourlyCounts.get(hourBucket) || 0) + 1);
    }
    
    /**
     * 清除索引
     */
    clear() {
        this.byType.clear();
        this.bySource.clear();
        this.byTime.clear();
        this.typeCounts.clear();
        this.sourceCounts.clear();
        this.hourlyCounts.clear();
    }
}

// ===== 事件分析服务 =====

/**
 * EventAnalyticsService - 事件分析服务
 * 提供事件历史存储、统计、趋势、模式检测等功能
 */
class EventAnalyticsService {
    constructor() {
        this.eventIndex = new EventIndex();
        this.isInitialized = false;
        this.listeners = [];
    }
    
    /**
     * 初始化服务
     */
    init(gameState) {
        if (this.isInitialized) {
            return { success: false, error: 'Already initialized' };
        }
        
        // 订阅事件总线以自动索引事件
        this.subscribeToEventBus();
        
        // 重建索引
        this.rebuildIndex();
        
        this.isInitialized = true;
        console.log('[EventAnalyticsService] Initialized successfully');
        
        return { success: true };
    }
    
    /**
     * 订阅事件总线
     */
    subscribeToEventBus() {
        // 订阅所有事件以建立索引
        this.eventBusSubscription = realmEventBus.subscribe('*', (event) => {
            this.indexEvent(event);
        }, { 
            subscriberId: 'event-analytics',
            priority: 'low'
        });
    }
    
    /**
     * 索引事件
     */
    indexEvent(event) {
        this.eventIndex.index(event);
    }
    
    /**
     * 重建索引
     */
    rebuildIndex() {
        this.eventIndex.clear();
        const history = realmEventBus.history({ limit: ANALYTICS_CONFIG.maxIndexedEvents });
        for (const event of history) {
            this.eventIndex.index(event);
        }
    }
    
    /**
     * 获取事件统计
     */
    getStats(options = {}) {
        const { eventType = null, source = null, timeRange = null } = options;
        
        let events = realmEventBus.history({ 
            eventType, 
            source, 
            since: timeRange?.since || 0,
            limit: ANALYTICS_CONFIG.maxHistoryLength 
        });
        
        // 按类型分组统计
        const typeStats = {};
        const sourceStats = {};
        const priorityStats = { high: 0, medium: 0, low: 0 };
        let totalEvents = events.length;
        
        for (const event of events) {
            // Type stats
            if (!typeStats[event.type]) {
                typeStats[event.type] = { count: 0, percentage: 0 };
            }
            typeStats[event.type].count++;
            
            // Source stats
            if (!sourceStats[event.source]) {
                sourceStats[event.source] = { count: 0, percentage: 0 };
            }
            sourceStats[event.source].count++;
            
            // Priority stats
            if (priorityStats[event.priority] !== undefined) {
                priorityStats[event.priority]++;
            }
        }
        
        // 计算百分比
        for (const type in typeStats) {
            typeStats[type].percentage = totalEvents > 0 
                ? Math.round((typeStats[type].count / totalEvents) * 10000) / 100 
                : 0;
        }
        for (const src in sourceStats) {
            sourceStats[src].percentage = totalEvents > 0 
                ? Math.round((sourceStats[src].count / totalEvents) * 10000) / 100 
                : 0;
        }
        
        // 获取热点事件类型
        const topTypes = Object.entries(typeStats)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([type, stats]) => ({ type, count: stats.count, percentage: stats.percentage }));
        
        // 获取最活跃的来源
        const topSources = Object.entries(sourceStats)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([source, stats]) => ({ source, count: stats.count, percentage: stats.percentage }));
        
        return {
            totalEvents,
            typeStats,
            sourceStats,
            priorityStats,
            topTypes,
            topSources,
            timeRange: timeRange ? {
                since: timeRange.since,
                until: timeRange.until || Date.now()
            } : null
        };
    }
    
    /**
     * 获取事件趋势
     */
    getTrend(options = {}) {
        const { 
            windowSize = ANALYTICS_CONFIG.trendWindowSize,
            eventType = null,
            granularity = 'hour' // 'hour', 'day', 'minute'
        } = options;
        
        const now = Date.now();
        const intervals = [];
        
        // 确定时间间隔
        let intervalMs;
        switch (granularity) {
            case 'minute':
                intervalMs = 60 * 1000;
                break;
            case 'day':
                intervalMs = 24 * 60 * 60 * 1000;
                break;
            case 'hour':
            default:
                intervalMs = 60 * 60 * 1000;
        }
        
        // 生成时间窗口
        const numWindows = Math.min(windowSize, 100);
        for (let i = numWindows - 1; i >= 0; i--) {
            const start = Math.floor((now - i * intervalMs) / intervalMs) * intervalMs;
            const end = start + intervalMs;
            intervals.push({ start, end, count: 0, types: {} });
        }
        
        // 统计每个窗口的事件数
        const history = realmEventBus.history({ 
            eventType,
            since: intervals[0].start - intervalMs,
            limit: ANALYTICS_CONFIG.maxHistoryLength 
        });
        
        for (const event of history) {
            const bucketIndex = intervals.findIndex(i => 
                event.timestamp >= i.start && event.timestamp < i.end
            );
            if (bucketIndex >= 0) {
                intervals[bucketIndex].count++;
                
                // 按类型统计
                if (!intervals[bucketIndex].types[event.type]) {
                    intervals[bucketIndex].types[event.type] = 0;
                }
                intervals[bucketIndex].types[event.type]++;
            }
        }
        
        // 计算趋势指标
        const counts = intervals.map(i => i.count);
        const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length || 0;
        
        // 计算移动平均
        const movingAvg = [];
        for (let i = 0; i < counts.length; i++) {
            const window = counts.slice(Math.max(0, i - 4), i + 1);
            movingAvg.push(window.reduce((a, b) => a + b, 0) / window.length);
        }
        
        // 确定趋势方向
        let trendDirection = 'stable';
        if (counts.length >= 3) {
            const recentAvg = (counts[counts.length - 1] + counts[counts.length - 2]) / 2;
            const olderAvg = (counts[0] + counts[1]) / 2;
            const change = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
            
            if (change > 0.15) {
                trendDirection = 'increasing';
            } else if (change < -0.15) {
                trendDirection = 'decreasing';
            }
        }
        
        return {
            granularity,
            windowSize: numWindows,
            intervals,
            averageCount: Math.round(avgCount * 100) / 100,
            movingAverage: movingAvg.map(v => Math.round(v * 100) / 100),
            trendDirection,
            peakTime: {
                ...intervals.reduce((max, i) => i.count > max.count ? i : max, intervals[0]),
                hour: intervals.reduce((max, i) => i.count > max.count ? i : max, intervals[0]).start
            },
            eventTypeFilter: eventType
        };
    }
    
    /**
     * 检测事件模式
     */
    detectPattern(options = {}) {
        const { 
            sequenceLength = 5,
            minOccurrences = 2,
            eventType = null 
        } = options;
        
        const history = realmEventBus.history({ 
            eventType,
            limit: ANALYTICS_CONFIG.maxHistoryLength 
        });
        
        // 提取事件序列
        const eventSequence = history.map(e => e.type);
        
        // 寻找重复模式
        const patterns = new Map();
        
        for (let len = 2; len <= sequenceLength; len++) {
            for (let i = 0; i <= eventSequence.length - len; i++) {
                const pattern = eventSequence.slice(i, i + len).join('->');
                
                if (!patterns.has(pattern)) {
                    patterns.set(pattern, { 
                        sequence: eventSequence.slice(i, i + len),
                        count: 0,
                        positions: []
                    });
                }
                
                patterns.get(pattern).count++;
                patterns.get(pattern).positions.push(i);
            }
        }
        
        // 过滤出有意义的模式 (出现次数 >= minOccurrences)
        const significantPatterns = [];
        for (const [pattern, data] of patterns) {
            if (data.count >= minOccurrences) {
                significantPatterns.push({
                    pattern,
                    sequence: data.sequence,
                    occurrences: data.count,
                    positions: data.positions,
                    confidence: Math.min(data.count / 10, 1.0)
                });
            }
        }
        
        // 按出现次数排序
        significantPatterns.sort((a, b) => b.occurrences - a.occurrences);
        
        // 返回前10个模式
        return {
            totalPatternsFound: significantPatterns.length,
            patterns: significantPatterns.slice(0, 10),
            sequenceLength,
            minOccurrences,
            eventTypeFilter: eventType
        };
    }
    
    /**
     * 检测异常事件
     */
    detectAnomaly(options = {}) {
        const { 
            threshold = ANALYTICS_CONFIG.anomalyThreshold,
            windowSize = 50,
            source = null
        } = options;
        
        // 获取最近的事件
        const history = realmEventBus.history({ 
            source,
            limit: ANALYTICS_CONFIG.maxHistoryLength 
        });
        
        if (history.length < ANALYTICS_CONFIG.minSampleSize) {
            return {
                success: false,
                error: 'Insufficient data for anomaly detection',
                minRequired: ANALYTICS_CONFIG.minSampleSize,
                currentCount: history.length
            };
        }
        
        // 分析每个时间窗口的异常
        const anomalies = [];
        const hourlyStats = [];
        
        // 计算每小时统计
        const hourBuckets = new Map();
        for (const event of history) {
            const hour = Math.floor(event.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
            if (!hourBuckets.has(hour)) {
                hourBuckets.set(hour, { count: 0, types: new Set() });
            }
            hourBuckets.get(hour).count++;
            hourBuckets.get(hour).types.add(event.type);
        }
        
        // 转换为数组并排序
        const sortedHours = Array.from(hourBuckets.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([hour, data]) => ({
                hour,
                count: data.count,
                uniqueTypes: data.types.size
            }));
        
        // 计算统计指标
        const counts = sortedHours.map(h => h.count);
        const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
        const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
        const stdDev = Math.sqrt(variance);
        
        // 检测异常时间点
        for (const hourData of sortedHours) {
            const zScore = stdDev > 0 ? (hourData.count - mean) / stdDev : 0;
            
            if (Math.abs(zScore) > threshold) {
                anomalies.push({
                    hour: hourData.hour,
                    count: hourData.count,
                    zScore: Math.round(zScore * 100) / 100,
                    severity: Math.abs(zScore) > threshold * 2 ? 'high' : 'medium',
                    uniqueTypes: hourData.uniqueTypes
                });
            }
        }
        
        // 检测稀有事件类型
        const typeCounts = new Map();
        for (const event of history) {
            typeCounts.set(event.type, (typeCounts.get(event.type) || 0) + 1);
        }
        
        const avgTypeFreq = history.length / typeCounts.size;
        const rareTypes = [];
        
        for (const [type, count] of typeCounts) {
            if (count <= avgTypeFreq * 0.2) {
                rareTypes.push({ type, count, rarity: 'rare' });
            }
        }
        
        return {
            success: true,
            anomalies,
            rareEventTypes: rareTypes,
            statistics: {
                mean: Math.round(mean * 100) / 100,
                stdDev: Math.round(stdDev * 100) / 100,
                threshold: threshold,
                totalHoursAnalyzed: sortedHours.length,
                totalEventsAnalyzed: history.length
            }
        };
    }
    
    /**
     * 查询历史事件
     */
    queryHistory(options = {}) {
        const {
            eventType = null,
            source = null,
            since = null,
            until = null,
            priority = null,
            dataFilter = null,
            limit = 100,
            offset = 0
        } = options;
        
        let events = realmEventBus.history({
            eventType,
            source,
            since: since || 0,
            limit: ANALYTICS_CONFIG.maxHistoryLength
        });
        
        // 应用额外过滤
        if (until) {
            events = events.filter(e => e.timestamp <= until);
        }
        
        if (priority) {
            events = events.filter(e => e.priority === priority);
        }
        
        if (dataFilter) {
            events = events.filter(e => {
                if (typeof dataFilter === 'object') {
                    for (const key in dataFilter) {
                        if (e.data[key] !== dataFilter[key]) {
                            return false;
                        }
                    }
                }
                return true;
            });
        }
        
        // 排序 (默认按时间倒序)
        events.sort((a, b) => b.timestamp - a.timestamp);
        
        // 分页
        const totalCount = events.length;
        const paginatedEvents = events.slice(offset, offset + limit);
        
        return {
            success: true,
            totalCount,
            offset,
            limit,
            hasMore: offset + limit < totalCount,
            events: paginatedEvents.map(e => ({
                id: e.id,
                type: e.type,
                source: e.source,
                target: e.target,
                timestamp: e.timestamp,
                priority: e.priority,
                cascadeLevel: e.cascadeLevel,
                data: e.data
            }))
        };
    }
    
    /**
     * 预测未来事件
     */
    forecast(options = {}) {
        const {
            horizonHours = ANALYTICS_CONFIG.forecastHorizonHours,
            eventType = null
        } = options;
        
        // 获取历史数据
        const history = realmEventBus.history({ 
            eventType,
            limit: ANALYTICS_CONFIG.maxHistoryLength 
        });
        
        if (history.length < ANALYTICS_CONFIG.minSampleSize) {
            return {
                success: false,
                error: 'Insufficient data for forecasting',
                minRequired: ANALYTICS_CONFIG.minSampleSize,
                currentCount: history.length
            };
        }
        
        // 分析事件频率
        const hourCounts = new Map();
        let totalEvents = 0;
        
        for (const event of history) {
            const hour = Math.floor(event.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
            totalEvents++;
        }
        
        // 计算平均每小时事件数
        const avgEventsPerHour = totalEvents / (history.length > 0 ? 
            (history.length / (60 * 60 * 1000)) : 1);
        
        // 分析周期性
        const sortedHours = Array.from(hourCounts.keys()).sort();
        let periodicity = 'none';
        
        if (sortedHours.length >= 4) {
            const intervals = [];
            for (let i = 1; i < sortedHours.length; i++) {
                intervals.push(sortedHours[i] - sortedHours[i - 1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            
            if (avgInterval > 20 * 60 * 60 * 1000) { // > 20 hours
                periodicity = 'daily';
            } else if (avgInterval > 3 * 60 * 60 * 1000) { // > 3 hours
                periodicity = 'hourly';
            }
        }
        
        // 分析最常见的事件类型
        const typeCounts = new Map();
        for (const event of history) {
            typeCounts.set(event.type, (typeCounts.get(event.type) || 0) + 1);
        }
        
        const topTypes = Array.from(typeCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => ({
                type,
                probability: Math.round((count / totalEvents) * 10000) / 100,
                expectedCount: Math.round((count / totalEvents) * (horizonHours * avgEventsPerHour))
            }));
        
        // 生成未来预测
        const now = Date.now();
        const futureSlots = [];
        
        for (let i = 1; i <= horizonHours; i++) {
            const slotTime = now + (i * 60 * 60 * 1000);
            const hourBucket = Math.floor(slotTime / (60 * 60 * 1000)) * (60 * 60 * 1000);
            
            // 使用历史平均作为预测
            const predictedCount = Math.round(avgEventsPerHour * 100) / 100;
            
            futureSlots.push({
                hour: i,
                timestamp: slotTime,
                predictedEvents: predictedCount,
                confidence: totalEvents > 50 ? 'high' : 'medium'
            });
        }
        
        return {
            success: true,
            horizonHours,
            periodicity,
            avgEventsPerHour: Math.round(avgEventsPerHour * 100) / 100,
            totalHistoricalEvents: totalEvents,
            topPredictedTypes: topTypes,
            forecastSlots: futureSlots,
            confidence: totalEvents > 100 ? 'high' : totalEvents > 30 ? 'medium' : 'low',
            basedOnEvents: history.length
        };
    }
    
    /**
     * 获取服务状态
     */
    getStatus() {
        const busStats = realmEventBus.getStats();
        
        return {
            isInitialized: this.isInitialized,
            totalIndexedEvents: busStats.totalEvents,
            isSubscribedToEventBus: !!this.eventBusSubscription,
            config: ANALYTICS_CONFIG
        };
    }
    
    /**
     * 重置服务
     */
    reset() {
        this.eventIndex.clear();
        this.rebuildIndex();
        return { success: true };
    }
}

// ===== MCP工具实现 =====

const eventAnalyticsService = new EventAnalyticsService();

/**
 * event.analytics.stats - 获取事件统计
 */
function mcpAnalyticsStats(params = {}) {
    const { eventType, source, timeRange } = params;
    
    try {
        const stats = eventAnalyticsService.getStats({ eventType, source, timeRange });
        return {
            success: true,
            ...stats
        };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * event.analytics.trend - 获取事件趋势
 */
function mcpAnalyticsTrend(params = {}) {
    const { windowSize, eventType, granularity } = params;
    
    try {
        const trend = eventAnalyticsService.getTrend({ windowSize, eventType, granularity });
        return {
            success: true,
            ...trend
        };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * event.analytics.pattern - 检测事件模式
 */
function mcpAnalyticsPattern(params = {}) {
    const { sequenceLength, minOccurrences, eventType } = params;
    
    try {
        const pattern = eventAnalyticsService.detectPattern({ 
            sequenceLength: sequenceLength || 5,
            minOccurrences: minOccurrences || 2,
            eventType 
        });
        return {
            success: true,
            ...pattern
        };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * event.analytics.anomaly - 检测异常事件
 */
function mcpAnalyticsAnomaly(params = {}) {
    const { threshold, windowSize, source } = params;
    
    try {
        const anomaly = eventAnalyticsService.detectAnomaly({ 
            threshold: threshold || ANALYTICS_CONFIG.anomalyThreshold,
            windowSize: windowSize || 50,
            source
        });
        return {
            success: true,
            ...anomaly
        };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * event.history.query - 查询历史事件
 */
function mcpHistoryQuery(params = {}) {
    const { 
        eventType, 
        source, 
        since, 
        until, 
        priority, 
        dataFilter,
        limit,
        offset 
    } = params;
    
    try {
        const result = eventAnalyticsService.queryHistory({
            eventType,
            source,
            since,
            until,
            priority,
            dataFilter,
            limit: limit || 100,
            offset: offset || 0
        });
        return result;
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * event.analytics.forecast - 预测未来事件
 */
function mcpAnalyticsForecast(params = {}) {
    const { horizonHours, eventType } = params;
    
    try {
        const forecast = eventAnalyticsService.forecast({ 
            horizonHours: horizonHours || ANALYTICS_CONFIG.forecastHorizonHours,
            eventType 
        });
        return {
            success: true,
            ...forecast
        };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// ===== MCP工具定义 =====

const EVENT_ANALYTICS_TOOLS = {
    'event.analytics.stats': {
        name: 'event.analytics.stats',
        description: 'Get event statistics including counts by type, source, and priority',
        inputSchema: {
            type: 'object',
            properties: {
                eventType: { type: 'string', description: 'Filter by event type' },
                source: { type: 'string', description: 'Filter by source' },
                timeRange: {
                    type: 'object',
                    description: 'Time range filter',
                    properties: {
                        since: { type: 'number', description: 'Start timestamp' },
                        until: { type: 'number', description: 'End timestamp' }
                    }
                }
            }
        }
    },
    'event.analytics.trend': {
        name: 'event.analytics.trend',
        description: 'Get event trends over time with moving averages',
        inputSchema: {
            type: 'object',
            properties: {
                windowSize: { type: 'number', description: 'Number of time windows (default: 100)' },
                eventType: { type: 'string', description: 'Filter by event type' },
                granularity: { 
                    type: 'string', 
                    enum: ['minute', 'hour', 'day'],
                    description: 'Time granularity (default: hour)' 
                }
            }
        }
    },
    'event.analytics.pattern': {
        name: 'event.analytics.pattern',
        description: 'Detect recurring event patterns and sequences',
        inputSchema: {
            type: 'object',
            properties: {
                sequenceLength: { type: 'number', description: 'Max sequence length to detect (default: 5)' },
                minOccurrences: { type: 'number', description: 'Minimum occurrences (default: 2)' },
                eventType: { type: 'string', description: 'Filter by event type' }
            }
        }
    },
    'event.analytics.anomaly': {
        name: 'event.analytics.anomaly',
        description: 'Detect anomalous events using statistical analysis',
        inputSchema: {
            type: 'object',
            properties: {
                threshold: { type: 'number', description: 'Z-score threshold for anomaly (default: 2.0)' },
                windowSize: { type: 'number', description: 'Window size for analysis (default: 50)' },
                source: { type: 'string', description: 'Filter by source' }
            }
        }
    },
    'event.history.query': {
        name: 'event.history.query',
        description: 'Query historical events with filtering and pagination',
        inputSchema: {
            type: 'object',
            properties: {
                eventType: { type: 'string', description: 'Filter by event type' },
                source: { type: 'string', description: 'Filter by source' },
                since: { type: 'number', description: 'Start timestamp' },
                until: { type: 'number', description: 'End timestamp' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                dataFilter: { type: 'object', description: 'Filter by event data' },
                limit: { type: 'number', description: 'Max results (default: 100)' },
                offset: { type: 'number', description: 'Offset for pagination (default: 0)' }
            }
        }
    },
    'event.analytics.forecast': {
        name: 'event.analytics.forecast',
        description: 'Predict future events based on historical patterns',
        inputSchema: {
            type: 'object',
            properties: {
                horizonHours: { type: 'number', description: 'Forecast horizon in hours (default: 24)' },
                eventType: { type: 'string', description: 'Filter by event type' }
            }
        }
    }
};

// ===== 导出 =====

export {
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
};

export default eventAnalyticsService;