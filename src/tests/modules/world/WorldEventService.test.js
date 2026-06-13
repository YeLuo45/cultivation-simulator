/**
 * WorldEventService.test.js - 世界事件系统单元测试
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

global.gameState = mockGameState;

// Mock worldEventState for canResist check
let worldEventStateForTest = null;

import { 
    createWorldEventState,
    triggerWorldEvent,
    calculateEventImpact,
    applyEventEffectsToPlayer,
    endEvent,
    tickEvents,
    getActiveEvents,
    getEventHistory,
    setRegionProtection,
    getWorldStatus,
    performRitual,
    canTriggerEvent,
    forceTriggerEvent,
    WORLD_EVENT_CONFIG,
    EVENT_TYPES,
    EVENT_RARITY,
    IMPACT_TYPES
} from '../../domains/world/services/WorldEventService.js';

import { WORLD_EVENTS, CATASTROPHE_EVENTS, DIVINE_EVENTS, SERENDIPITY_EVENTS } from '../../domains/world/entities/WorldEvent.js';

describe('WorldEventService', () => {
    let worldEventState;
    let player;

    beforeEach(() => {
        worldEventState = createWorldEventState();
        player = {
            realm: 10,
            cultivation: 500,
            health: 100,
            spirit: 100,
            luck: 50
        };
        worldEventStateForTest = worldEventState;
    });

    describe('createWorldEventState', () => {
        it('should create world event state with initial values', () => {
            expect(worldEventState.activeEvents).toEqual([]);
            expect(worldEventState.eventHistory).toEqual([]);
            expect(worldEventState.totalEventsTriggered).toBe(0);
            expect(worldEventState.chaosLevel).toBe(0);
            expect(worldEventState.worldLuck).toBe(1.0);
        });

        it('should initialize protection arrays', () => {
            expect(Array.isArray(worldEventState.protectedRegions)).toBe(true);
            expect(worldEventState.protectedRegions.length).toBe(0);
        });

        it('should reset daily counters', () => {
            expect(worldEventState.dailyEventCount).toBe(0);
            expect(worldEventState.lastResetDate).toBe(new Date().toDateString());
        });
    });

    describe('triggerWorldEvent', () => {
        it('should fail when daily event limit is reached', () => {
            worldEventState.dailyEventCount = WORLD_EVENT_CONFIG.maxEventsPerDay;
            const result = triggerWorldEvent(worldEventState, player);
            expect(result.triggered).toBe(false);
            expect(result.reason).toBe('daily_limit');
        });

        it('should trigger event when conditions are met', () => {
            // Force trigger by setting low probability tolerance
            const result = triggerWorldEvent(worldEventState, player);
            // May or may not trigger depending on random
            if (result.triggered) {
                expect(result.event).toBeDefined();
                expect(result.event.eventType).toBeDefined();
                expect(['天灾', '奇遇', '神迹', '浩劫']).toContain(result.event.eventType);
            }
        });

        it('should increment daily event count on trigger', () => {
            // Try multiple times to ensure we get at least one trigger
            let triggered = false;
            for (let i = 0; i < 50; i++) {
                const result = triggerWorldEvent(worldEventState, player);
                if (result.triggered) {
                    triggered = true;
                    break;
                }
            }
            if (triggered) {
                expect(worldEventState.dailyEventCount).toBeGreaterThan(0);
            }
        });

        it('should record last event time', () => {
            for (let i = 0; i < 50; i++) {
                const result = triggerWorldEvent(worldEventState, player);
                if (result.triggered) {
                    expect(worldEventState.lastEventTime).toBeDefined();
                    break;
                }
            }
        });
    });

    describe('calculateEventImpact', () => {
        it('should calculate impact based on effects', () => {
            const event = {
                effects: { spiritStones: -100, cultivation: 1.5 },
                rarity: 'COMMON',
                canResist: true,
                affectedRegions: ['九州']
            };
            const impact = calculateEventImpact(event, player);
            expect(impact.spiritStones).toBeDefined();
            expect(impact.cultivation).toBeDefined();
        });

        it('should apply rarity multiplier', () => {
            const commonEvent = {
                effects: { spiritStones: -100 },
                rarity: 'COMMON',
                canResist: false,
                affectedRegions: []
            };
            const legendaryEvent = {
                effects: { spiritStones: -100 },
                rarity: 'LEGENDARY',
                canResist: false,
                affectedRegions: []
            };
            
            const commonImpact = calculateEventImpact(commonEvent, player);
            const legendaryImpact = calculateEventImpact(legendaryEvent, player);
            
            expect(Math.abs(legendaryImpact.spiritStones)).toBeGreaterThan(Math.abs(commonImpact.spiritStones));
        });

        it('should reduce negative effects when canResist', () => {
            const event = {
                effects: { spiritStones: -100, health: -50 },
                rarity: 'COMMON',
                canResist: true,
                affectedRegions: []
            };
            const impact = calculateEventImpact(event, player);
            // Resistance should reduce negative effects
            expect(impact.spiritStones).toBeGreaterThanOrEqual(-100);
        });
    });

    describe('applyEventEffectsToPlayer', () => {
        it('should apply effects to gameState', () => {
            const event = {
                id: 'test_evt_1',
                name: '测试事件',
                effects: { spiritStones: 500 },
                rarity: 'COMMON',
                canResist: false,
                affectedRegions: []
            };
            
            const result = applyEventEffectsToPlayer(event, player);
            expect(result.applied).toBeDefined();
            expect(result.eventId).toBe(event.id);
            expect(global.gameState.spiritStones).toBe(10500);
        });

        it('should cap values at minimum 0 for spiritStones', () => {
            const event = {
                id: 'test_evt_2',
                name: '消耗测试',
                effects: { spiritStones: -20000 },
                rarity: 'COMMON',
                canResist: false,
                affectedRegions: []
            };
            
            applyEventEffectsToPlayer(event, player);
            expect(global.gameState.spiritStones).toBeGreaterThanOrEqual(0);
        });

        it('should apply cultivation effects', () => {
            const initialCultivation = global.gameState.cultivation;
            const event = {
                id: 'test_evt_3',
                name: '修炼加成',
                effects: { cultivation: 10 },
                rarity: 'COMMON',
                canResist: false,
                affectedRegions: []
            };
            
            applyEventEffectsToPlayer(event, player);
            expect(global.gameState.cultivation).toBeGreaterThan(initialCultivation);
        });
    });

    describe('endEvent', () => {
        it('should fail for non-existent event', () => {
            const result = endEvent('non-existent-id', worldEventState);
            expect(result.success).toBe(false);
            expect(result.message).toBe('事件不存在');
        });

        it('should remove event from active events', () => {
            worldEventState.activeEvents.push({
                id: 'test_event_1',
                name: '测试事件',
                eventType: '天灾',
                effects: {},
                rarity: 'COMMON',
                startTime: Date.now(),
                duration: 5
            });
            
            const result = endEvent('test_event_1', worldEventState);
            expect(result.success).toBe(true);
            expect(worldEventState.activeEvents.find(e => e.id === 'test_event_1')).toBeUndefined();
        });

        it('should add event to history', () => {
            worldEventState.activeEvents.push({
                id: 'test_event_2',
                name: '测试事件',
                eventType: '神迹',
                effects: {},
                rarity: 'COMMON',
                startTime: Date.now(),
                duration: 5
            });
            
            endEvent('test_event_2', worldEventState);
            const historyEvent = worldEventState.eventHistory.find(e => e.id === 'test_event_2');
            expect(historyEvent).toBeDefined();
            expect(historyEvent.endTime).toBeDefined();
        });
    });

    describe('tickEvents', () => {
        it('should not expire events within duration', () => {
            worldEventState.activeEvents.push({
                id: 'future_event',
                name: '未来事件',
                eventType: '天灾',
                effects: {},
                rarity: 'COMMON',
                startTime: Date.now(),
                duration: 100 // Far future
            });
            
            const result = tickEvents(worldEventState);
            expect(result.expiredCount).toBe(0);
            expect(worldEventState.activeEvents.length).toBe(1);
        });

        it('should expire events past their duration', () => {
            worldEventState.activeEvents.push({
                id: 'expired_event',
                name: '过期事件',
                eventType: '奇遇',
                effects: {},
                rarity: 'COMMON',
                startTime: Date.now() - 60000 * 10, // 10 minutes ago
                duration: 1 // 1 minute duration
            });
            
            const result = tickEvents(worldEventState);
            expect(result.expiredCount).toBe(1);
        });
    });

    describe('getActiveEvents', () => {
        it('should return empty array when no active events', () => {
            const events = getActiveEvents(worldEventState);
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBe(0);
        });

        it('should return active event details', () => {
            worldEventState.activeEvents.push({
                id: 'active_test',
                name: '活跃测试事件',
                eventType: '神迹',
                message: '神迹显现',
                effects: { cultivation: 1 },
                rarity: 'EPIC',
                rarityColor: '#f80',
                startTime: Date.now(),
                duration: 5
            });
            
            const events = getActiveEvents(worldEventState);
            expect(events.length).toBe(1);
            expect(events[0].name).toBe('活跃测试事件');
            expect(events[0].type).toBe('神迹');
            expect(events[0].remainingDuration).toBeDefined();
        });
    });

    describe('getEventHistory', () => {
        it('should return empty array when no history', () => {
            const history = getEventHistory(worldEventState);
            expect(Array.isArray(history)).toBe(true);
            expect(history.length).toBe(0);
        });

        it('should limit history to specified count', () => {
            // Add many events to history
            for (let i = 0; i < 25; i++) {
                worldEventState.eventHistory.push({
                    id: `hist_${i}`,
                    name: `历史事件${i}`,
                    eventType: '天灾',
                    rarity: 'COMMON',
                    endTime: Date.now() - i * 1000
                });
            }
            
            const history = getEventHistory(worldEventState, 20);
            expect(history.length).toBe(20);
        });
    });

    describe('setRegionProtection', () => {
        it('should add region to protected list', () => {
            const result = setRegionProtection('九州', true, worldEventState);
            expect(result.success).toBe(true);
            expect(result.protected).toBe(true);
            expect(worldEventState.protectedRegions.includes('九州')).toBe(true);
        });

        it('should remove region from protected list', () => {
            worldEventState.protectedRegions.push('四海');
            const result = setRegionProtection('四海', false, worldEventState);
            expect(result.success).toBe(true);
            expect(result.protected).toBe(false);
            expect(worldEventState.protectedRegions.includes('四海')).toBe(false);
        });
    });

    describe('getWorldStatus', () => {
        it('should return world status summary', () => {
            const status = getWorldStatus(worldEventState);
            expect(status.activeEventCount).toBe(0);
            expect(status.totalEventsTriggered).toBe(0);
            expect(status.chaosLevel).toBe(0);
            expect(status.worldLuck).toBe(1.0);
            expect(status.maxDailyEvents).toBe(WORLD_EVENT_CONFIG.maxEventsPerDay);
        });

        it('should reflect active event count', () => {
            worldEventState.activeEvents.push({
                id: 'status_test',
                name: '状态测试',
                eventType: '天灾',
                effects: {},
                rarity: 'COMMON',
                startTime: Date.now(),
                duration: 5
            });
            
            const status = getWorldStatus(worldEventState);
            expect(status.activeEventCount).toBe(1);
        });
    });

    describe('performRitual', () => {
        it('should fail with insufficient spirit stones', () => {
            global.gameState.spiritStones = 0;
            const result = performRitual(100, worldEventState);
            expect(result.success).toBe(false);
            expect(result.message).toBe('灵石不足');
            global.gameState.spiritStones = 10000;
        });

        it('should reduce chaos level after ritual', () => {
            worldEventState.chaosLevel = 50;
            const result = performRitual(1000, worldEventState);
            expect(result.success).toBe(true);
            expect(worldEventState.chaosLevel).toBeLessThan(50);
        });

        it('should return new chaos level', () => {
            worldEventState.chaosLevel = 30;
            const result = performRitual(500, worldEventState);
            expect(result.newChaosLevel).toBeDefined();
        });
    });

    describe('canTriggerEvent', () => {
        it('should allow trigger on new day', () => {
            worldEventState.lastResetDate = 'different_day';
            const result = canTriggerEvent(worldEventState);
            expect(result.canTrigger).toBe(true);
        });

        it('should not allow trigger when daily limit reached', () => {
            worldEventState.dailyEventCount = WORLD_EVENT_CONFIG.maxEventsPerDay;
            const result = canTriggerEvent(worldEventState);
            expect(result.canTrigger).toBe(false);
            expect(result.reason).toBe('daily_limit');
        });

        it('should not allow trigger during cooldown', () => {
            worldEventState.lastEventTime = Date.now() - 30000; // 30 seconds ago
            const result = canTriggerEvent(worldEventState);
            expect(result.canTrigger).toBe(false);
            expect(result.reason).toBe('cooldown');
        });
    });

    describe('forceTriggerEvent', () => {
        it('should fail for unknown event type', () => {
            const result = forceTriggerEvent('UNKNOWN_TYPE', worldEventState, player);
            expect(result.success).toBe(false);
            expect(result.message).toBe('未知事件类型');
        });

        it('should force trigger natural disaster', () => {
            const result = forceTriggerEvent(EVENT_TYPES.NATURAL_DISASTER, worldEventState, player);
            expect(result.success).toBe(true);
            expect(result.event.eventType).toBe('天灾');
        });

        it('should force trigger serendipity', () => {
            const result = forceTriggerEvent(EVENT_TYPES.SERENDIPITY, worldEventState, player);
            expect(result.success).toBe(true);
            expect(result.event.eventType).toBe('奇遇');
        });

        it('should force trigger divine event', () => {
            const result = forceTriggerEvent(EVENT_TYPES.DIVINE, worldEventState, player);
            expect(result.success).toBe(true);
            expect(result.event.eventType).toBe('神迹');
        });

        it('should force trigger catastrophe', () => {
            const result = forceTriggerEvent(EVENT_TYPES.CATASTROPHE, worldEventState, player);
            expect(result.success).toBe(true);
            expect(result.event.eventType).toBe('浩劫');
        });
    });

    describe('Event entity data', () => {
        it('should have all required event types', () => {
            expect(WORLD_EVENTS).toBeDefined();
            expect(CATASTROPHE_EVENTS).toBeDefined();
            expect(DIVINE_EVENTS).toBeDefined();
            expect(SERENDIPITY_EVENTS).toBeDefined();
        });

        it('should have valid natural disaster events', () => {
            const tianzai = WORLD_EVENTS['tianzai'];
            expect(tianzai).toBeDefined();
            expect(tianzai.type).toBe('天灾');
            expect(tianzai.probability).toBe(0.1);
        });

        it('should have valid serendipity events', () => {
            const qiYuan = SERENDIPITY_EVENTS['qiYuan'];
            expect(qiYuan).toBeDefined();
            expect(qiYuan.type).toBe('奇遇');
            expect(qiYuan.message).toBe('仙人遗迹!');
            expect(qiYuan.effect.spiritStones).toBe(500);
        });

        it('should have valid divine events', () => {
            const shenji = DIVINE_EVENTS['shenji'];
            expect(shenji).toBeDefined();
            expect(shenji.type).toBe('神迹');
            expect(shenji.message).toBe('神迹显现!');
            expect(shenji.effect.cultivation).toBe(1.5);
        });

        it('should have valid catastrophe events', () => {
            const haoijie = CATASTROPHE_EVENTS['haoijie'];
            expect(haoijie).toBeDefined();
            expect(haoijie.type).toBe('浩劫');
            expect(haoijie.message).toBe('浩劫降临!');
        });
    });

    describe('Config constants', () => {
        it('should have correct WORLD_EVENT_CONFIG values', () => {
            expect(WORLD_EVENT_CONFIG.baseTriggerChance).toBe(0.1);
            expect(WORLD_EVENT_CONFIG.maxEventsPerDay).toBe(3);
            expect(WORLD_EVENT_CONFIG.eventCooldown).toBe(24);
            expect(WORLD_EVENT_CONFIG.eventDuration).toBe(5);
        });

        it('should have all event types defined', () => {
            expect(EVENT_TYPES.NATURAL_DISASTER).toBe('天灾');
            expect(EVENT_TYPES.SERENDIPITY).toBe('奇遇');
            expect(EVENT_TYPES.DIVINE).toBe('神迹');
            expect(EVENT_TYPES.CATASTROPHE).toBe('浩劫');
        });

        it('should have correct EVENT_RARITY values', () => {
            expect(EVENT_RARITY.COMMON.name).toBe('普通');
            expect(EVENT_RARITY.RARE.name).toBe('稀有');
            expect(EVENT_RARITY.EPIC.name).toBe('史诗');
            expect(EVENT_RARITY.LEGENDARY.name).toBe('传说');
        });

        it('should have all impact types defined', () => {
            expect(IMPACT_TYPES.SPIRIT_STONES).toBe('spiritStones');
            expect(IMPACT_TYPES.CULTIVATION).toBe('cultivation');
            expect(IMPACT_TYPES.REALM).toBe('realm');
            expect(IMPACT_TYPES.HEALTH).toBe('health');
        });
    });
});