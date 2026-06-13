/**
 * CultivationSpring.test.js - 修真泉系统测试
 * V692 Iteration 15/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSpring } from '../../../systems/ai/CultivationSpring.js';

describe('CultivationSpring', () => {
    let system;
    beforeEach(() => { system = new CultivationSpring(); });

    describe('recruitSpring', () => {
        it('should create', () => {
            const { spring } = system.recruitSpring({ masterId: 'm1', name: 'heavenly-pool' });
            expect(spring.masterId).toBe('m1');
            expect(spring.name).toBe('heavenly-pool');
        });

        it('should default to spirit type', () => {
            const { spring } = system.recruitSpring({});
            expect(spring.type).toBe('spirit');
        });

        it('should default to basePurity', () => {
            const { spring } = system.recruitSpring({});
            expect(spring.purity).toBe(20);
        });

        it('should default to novice status', () => {
            const { spring } = system.recruitSpring({});
            expect(spring.status).toBe('novice');
        });

        it('should default to level 1', () => {
            const { spring } = system.recruitSpring({});
            expect(spring.level).toBe(1);
        });

        it('should accept heavenly type', () => {
            const { spring } = system.recruitSpring({ type: 'heavenly' });
            expect(spring.type).toBe('heavenly');
        });

        it('should trigger springRecruited hook', () => {
            let called = false;
            system.registerHook('springRecruited', () => { called = true; });
            system.recruitSpring({});
            expect(called).toBe(true);
        });
    });

    describe('getSpring', () => {
        it('should return', () => {
            const { spring } = system.recruitSpring({});
            expect(system.getSpring(spring.springId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSpring('ghost')).toBeNull(); });
    });

    describe('listSprings', () => {
        it('should list all', () => {
            system.recruitSpring({});
            expect(system.listSprings().length).toBe(1);
        });
        it('should return empty when no springs', () => {
            expect(system.listSprings().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSpring({ masterId: 'm1' });
            system.recruitSpring({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { spring: a } = system.recruitSpring({});
            const { spring: b } = system.recruitSpring({});
            system.legendSpring(b.springId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].springId).toBe(b.springId);
        });

        it('should return empty when none', () => {
            system.recruitSpring({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addStream', () => {
        it('should add stream', () => {
            const { spring } = system.recruitSpring({});
            system.addStream(spring.springId, 'water-flow');
            expect(spring.streams.length).toBe(1);
            expect(spring.streams[0]).toBe('water-flow');
        });

        it('should reject missing', () => {
            const result = system.addStream('ghost', 'flow');
            expect(result.error).toBe('SPRING_NOT_FOUND');
        });

        it('should trigger streamAdded hook', () => {
            const { spring } = system.recruitSpring({});
            let called = false;
            system.registerHook('streamAdded', () => { called = true; });
            system.addStream(spring.springId, 'flow');
            expect(called).toBe(true);
        });
    });

    describe('raisePurity', () => {
        it('should raise purity by default 5', () => {
            const { spring } = system.recruitSpring({});
            system.raisePurity(spring.springId);
            expect(spring.purity).toBe(25);
        });

        it('should raise purity by custom amount', () => {
            const { spring } = system.recruitSpring({});
            system.raisePurity(spring.springId, 30);
            expect(spring.purity).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raisePurity('ghost', 5);
            expect(result.error).toBe('SPRING_NOT_FOUND');
        });

        it('should trigger purityRaised hook', () => {
            const { spring } = system.recruitSpring({});
            let called = false;
            system.registerHook('purityRaised', () => { called = true; });
            system.raisePurity(spring.springId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSpring', () => {
        it('should level up', () => {
            const { spring } = system.recruitSpring({});
            system.levelUpSpring(spring.springId);
            expect(spring.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSpring('ghost');
            expect(result.error).toBe('SPRING_NOT_FOUND');
        });

        it('should trigger springLeveledUp hook', () => {
            const { spring } = system.recruitSpring({});
            let called = false;
            system.registerHook('springLeveledUp', () => { called = true; });
            system.levelUpSpring(spring.springId);
            expect(called).toBe(true);
        });
    });

    describe('legendSpring', () => {
        it('should set legendary', () => {
            const { spring } = system.recruitSpring({});
            system.legendSpring(spring.springId);
            expect(spring.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSpring('ghost');
            expect(result.error).toBe('SPRING_NOT_FOUND');
        });

        it('should trigger springLegendized hook', () => {
            const { spring } = system.recruitSpring({});
            let called = false;
            system.registerHook('springLegendized', () => { called = true; });
            system.legendSpring(spring.springId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSpringValue', () => {
        it('should calculate for default spring', () => {
            const { spring } = system.recruitSpring({});
            // level=1, purity=20, streams=0: 1*100 + 20*2 + 0 = 140
            expect(system.calculateSpringValue(spring.springId)).toBe(140);
        });

        it('should account for streams', () => {
            const { spring } = system.recruitSpring({});
            system.addStream(spring.springId, 'flow1');
            system.addStream(spring.springId, 'flow2');
            // level=1, purity=20, streams=2: 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateSpringValue(spring.springId)).toBe(200);
        });

        it('should account for level', () => {
            const { spring } = system.recruitSpring({});
            system.levelUpSpring(spring.springId);
            system.levelUpSpring(spring.springId);
            // level=3, purity=20, streams=0: 3*100 + 20*2 + 0 = 340
            expect(system.calculateSpringValue(spring.springId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSpringValue('ghost')).toBe(0);
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

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getSpring', () => {
            const result = system.executeTool('getSpring', { springId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('springRecruited', () => count++);
            unregister();
            system.recruitSpring({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('springRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSpring({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSprings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSprings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSpring({});
            const json = system.toJSON();
            expect(json.springs.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSpring({});
            const json = system.toJSON();
            const newSys = new CultivationSpring();
            newSys.fromJSON(json);
            expect(newSys.springs.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.springCount).toBe(0);
        });
    });
});
