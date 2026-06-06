/**
 * CultivationEra.test.js - 修真纪元系统测试
 * V579 Iteration 2/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEra } from '../../../systems/ai/CultivationEra.js';

describe('CultivationEra', () => {
    let system;
    beforeEach(() => { system = new CultivationEra(); });

    describe('openEra', () => {
        it('should open an era with defaults', () => {
            const { era } = system.openEra({ chroniclerId: 'ch1', name: 'Mythic Dawn' });
            expect(era.chroniclerId).toBe('ch1');
            expect(era.name).toBe('Mythic Dawn');
            expect(era.type).toBe('mythic');
            expect(era.duration).toBe(20);
            expect(era.events).toEqual([]);
            expect(era.level).toBe(1);
            expect(era.status).toBe('dawning');
        });

        it('should open an era with custom values', () => {
            const { era } = system.openEra({
                chroniclerId: 'ch2',
                name: 'Ancient Times',
                type: 'ancient',
                duration: 50,
                events: ['event1', 'event2']
            });
            expect(era.type).toBe('ancient');
            expect(era.duration).toBe(50);
            expect(era.events.length).toBe(2);
        });

        it('should generate an eraId when not provided', () => {
            const { era } = system.openEra({ chroniclerId: 'ch1' });
            expect(era.eraId).toBeTruthy();
            expect(typeof era.eraId).toBe('string');
        });

        it('should use provided eraId', () => {
            const { era } = system.openEra({ eraId: 'custom_era_1', chroniclerId: 'ch1' });
            expect(era.eraId).toBe('custom_era_1');
        });

        it('should trigger eraOpened hook', () => {
            let called = false;
            system.registerHook('eraOpened', () => { called = true; });
            system.openEra({});
            expect(called).toBe(true);
        });

        it('should increment totalEras', () => {
            system.openEra({});
            system.openEra({});
            expect(system.stats.totalEras).toBe(2);
        });
    });

    describe('getEra', () => {
        it('should return the era', () => {
            const { era } = system.openEra({ chroniclerId: 'ch1' });
            const fetched = system.getEra(era.eraId);
            expect(fetched).not.toBeNull();
            expect(fetched.eraId).toBe(era.eraId);
        });

        it('should return null for missing era', () => {
            expect(system.getEra('ghost_era')).toBeNull();
        });
    });

    describe('listEras', () => {
        it('should list all eras', () => {
            system.openEra({});
            system.openEra({});
            expect(system.listEras().length).toBe(2);
        });

        it('should return empty list when no eras', () => {
            expect(system.listEras().length).toBe(0);
        });
    });

    describe('listByChronicler', () => {
        it('should filter by chronicler', () => {
            system.openEra({ chroniclerId: 'ch1' });
            system.openEra({ chroniclerId: 'ch2' });
            system.openEra({ chroniclerId: 'ch1' });
            expect(system.listByChronicler('ch1').length).toBe(2);
            expect(system.listByChronicler('ch2').length).toBe(1);
        });

        it('should return empty when chronicler not found', () => {
            system.openEra({ chroniclerId: 'ch1' });
            expect(system.listByChronicler('unknown').length).toBe(0);
        });
    });

    describe('listEnding', () => {
        it('should list ending eras', () => {
            const { era: e1 } = system.openEra({});
            const { era: e2 } = system.openEra({});
            system.endEra(e1.eraId);
            const ending = system.listEnding();
            expect(ending.length).toBe(1);
            expect(ending[0].eraId).toBe(e1.eraId);
        });

        it('should return empty when no ending eras', () => {
            system.openEra({});
            expect(system.listEnding().length).toBe(0);
        });
    });

    describe('addEvent', () => {
        it('should add an event to era', () => {
            const { era } = system.openEra({});
            system.addEvent(era.eraId, 'cataclysm');
            const fetched = system.getEra(era.eraId);
            expect(fetched.events.length).toBe(1);
            expect(fetched.events[0]).toBe('cataclysm');
        });

        it('should reject missing era', () => {
            const result = system.addEvent('ghost', 'event');
            expect(result.error).toBe('ERA_NOT_FOUND');
        });

        it('should trigger eventAdded hook', () => {
            const { era } = system.openEra({});
            let called = false;
            system.registerHook('eventAdded', () => { called = true; });
            system.addEvent(era.eraId, 'event');
            expect(called).toBe(true);
        });
    });

    describe('increaseDuration', () => {
        it('should increase duration by default amount', () => {
            const { era } = system.openEra({});
            system.increaseDuration(era.eraId);
            expect(system.getEra(era.eraId).duration).toBe(25);
        });

        it('should increase duration by custom amount', () => {
            const { era } = system.openEra({});
            system.increaseDuration(era.eraId, 30);
            expect(system.getEra(era.eraId).duration).toBe(50);
        });

        it('should reject missing era', () => {
            const result = system.increaseDuration('ghost', 10);
            expect(result.error).toBe('ERA_NOT_FOUND');
        });

        it('should trigger durationIncreased hook', () => {
            const { era } = system.openEra({});
            let called = false;
            system.registerHook('durationIncreased', () => { called = true; });
            system.increaseDuration(era.eraId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEra', () => {
        it('should level up era', () => {
            const { era } = system.openEra({});
            system.levelUpEra(era.eraId);
            expect(system.getEra(era.eraId).level).toBe(2);
        });

        it('should allow multiple level ups', () => {
            const { era } = system.openEra({});
            system.levelUpEra(era.eraId);
            system.levelUpEra(era.eraId);
            system.levelUpEra(era.eraId);
            expect(system.getEra(era.eraId).level).toBe(4);
        });

        it('should reject missing era', () => {
            const result = system.levelUpEra('ghost');
            expect(result.error).toBe('ERA_NOT_FOUND');
        });

        it('should trigger eraLeveledUp hook', () => {
            const { era } = system.openEra({});
            let called = false;
            system.registerHook('eraLeveledUp', () => { called = true; });
            system.levelUpEra(era.eraId);
            expect(called).toBe(true);
        });
    });

    describe('endEra', () => {
        it('should set era status to ending', () => {
            const { era } = system.openEra({});
            system.endEra(era.eraId);
            expect(system.getEra(era.eraId).status).toBe('ending');
        });

        it('should reject missing era', () => {
            const result = system.endEra('ghost');
            expect(result.error).toBe('ERA_NOT_FOUND');
        });

        it('should trigger eraEnded hook', () => {
            const { era } = system.openEra({});
            let called = false;
            system.registerHook('eraEnded', () => { called = true; });
            system.endEra(era.eraId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEraValue', () => {
        it('should calculate era value', () => {
            const { era } = system.openEra({});
            // level=1, duration=20, events=0
            // 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateEraValue(era.eraId)).toBe(140);
        });

        it('should calculate with events and level', () => {
            const { era } = system.openEra({});
            system.addEvent(era.eraId, 'e1');
            system.addEvent(era.eraId, 'e2');
            system.levelUpEra(era.eraId);
            // level=2, duration=20, events=2
            // 2*100 + 20*2 + 2*30 = 200 + 40 + 60 = 300
            expect(system.calculateEraValue(era.eraId)).toBe(300);
        });

        it('should return 0 for missing era', () => {
            expect(system.calculateEraValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default openEra and getEra tools', () => {
            const openResult = system.executeTool('openEra', { chroniclerId: 'ch1' });
            expect(openResult.success).toBe(true);
            const eraId = openResult.result.era.eraId;
            const getResult = system.executeTool('getEra', { eraId });
            expect(getResult.result.eraId).toBe(eraId);
        });

        it('should execute tool with no context', () => {
            system.registerTool('noctx', (ctx) => ctx);
            const result = system.executeTool('noctx');
            expect(result.result).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('eraOpened', () => count++);
            unregister();
            system.openEra({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('eraOpened', () => { throw new Error('x'); });
            expect(() => system.openEra({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient eras', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when totalEras >= 5', () => {
            system.stats.totalEras = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalEras = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openEra({});
            const json = system.toJSON();
            expect(json.eras.length).toBe(1);
        });

        it('should deserialize', () => {
            system.openEra({});
            const json = system.toJSON();
            const newSys = new CultivationEra();
            newSys.fromJSON(json);
            expect(newSys.eras.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with eraCount', () => {
            const stats = system.getStats();
            expect(stats.eraCount).toBe(0);
            system.openEra({});
            expect(system.getStats().eraCount).toBe(1);
        });
    });
});
