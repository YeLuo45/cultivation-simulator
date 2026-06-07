/**
 * CultivationDawn.test.js - 修真黎明系统测试
 * V815 Iteration 18/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDawn } from '../../../systems/ai/CultivationDawn.js';

describe('CultivationDawn', () => {
    let system;
    beforeEach(() => { system = new CultivationDawn(); });

    describe('recruitDawn', () => {
        it('should recruit a dawn with masterId and name', () => {
            const { dawn } = system.recruitDawn({ masterId: 'm1', name: 'First Light' });
            expect(dawn.masterId).toBe('m1');
            expect(dawn.name).toBe('First Light');
        });

        it('should default name to Unnamed Dawn', () => {
            const { dawn } = system.recruitDawn({});
            expect(dawn.name).toBe('Unnamed Dawn');
        });

        it('should default type to early', () => {
            const { dawn } = system.recruitDawn({});
            expect(dawn.type).toBe('early');
        });

        it('should accept late type', () => {
            const { dawn } = system.recruitDawn({ type: 'late' });
            expect(dawn.type).toBe('late');
        });

        it('should accept divine type', () => {
            const { dawn } = system.recruitDawn({ type: 'divine' });
            expect(dawn.type).toBe('divine');
        });

        it('should default light to baseLight (20)', () => {
            const { dawn } = system.recruitDawn({});
            expect(dawn.light).toBe(20);
        });

        it('should default visions to empty array', () => {
            const { dawn } = system.recruitDawn({});
            expect(dawn.visions).toEqual([]);
        });

        it('should initialize level to 1', () => {
            const { dawn } = system.recruitDawn({});
            expect(dawn.level).toBe(1);
        });

        it('should initialize status to novice', () => {
            const { dawn } = system.recruitDawn({});
            expect(dawn.status).toBe('novice');
        });

        it('should set createdAt timestamp', () => {
            const { dawn } = system.recruitDawn({});
            expect(typeof dawn.createdAt).toBe('number');
        });

        it('should generate unique dawnId when not provided', () => {
            const { dawn: d1 } = system.recruitDawn({});
            const { dawn: d2 } = system.recruitDawn({});
            expect(d1.dawnId).not.toBe(d2.dawnId);
        });

        it('should respect provided dawnId', () => {
            const { dawn } = system.recruitDawn({ dawnId: 'custom-dawn-1' });
            expect(dawn.dawnId).toBe('custom-dawn-1');
        });

        it('should accept custom light value', () => {
            const { dawn } = system.recruitDawn({ light: 100 });
            expect(dawn.light).toBe(100);
        });

        it('should accept custom visions array', () => {
            const { dawn } = system.recruitDawn({ visions: ['v1', 'v2'] });
            expect(dawn.visions).toEqual(['v1', 'v2']);
        });

        it('should increment totalDawns stat', () => {
            system.recruitDawn({});
            system.recruitDawn({});
            expect(system.stats.totalDawns).toBe(2);
        });

        it('should trigger dawnRecruited hook', () => {
            let called = false;
            system.registerHook('dawnRecruited', () => { called = true; });
            system.recruitDawn({});
            expect(called).toBe(true);
        });
    });

    describe('getDawn', () => {
        it('should return the dawn when found', () => {
            const { dawn } = system.recruitDawn({ name: 'Alpha' });
            const fetched = system.getDawn(dawn.dawnId);
            expect(fetched).not.toBeNull();
            expect(fetched.name).toBe('Alpha');
        });

        it('should return a copy of the dawn', () => {
            const { dawn } = system.recruitDawn({});
            const fetched = system.getDawn(dawn.dawnId);
            expect(fetched).not.toBe(dawn);
        });

        it('should return null for missing dawn', () => {
            expect(system.getDawn('ghost')).toBeNull();
        });
    });

    describe('listDawns', () => {
        it('should return empty array initially', () => {
            expect(system.listDawns()).toEqual([]);
        });

        it('should list all recruited dawns', () => {
            system.recruitDawn({});
            system.recruitDawn({});
            system.recruitDawn({});
            expect(system.listDawns().length).toBe(3);
        });

        it('should return copies of the dawns', () => {
            const { dawn } = system.recruitDawn({});
            const list = system.listDawns();
            expect(list[0]).not.toBe(dawn);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitDawn({ masterId: 'm1' });
            system.recruitDawn({ masterId: 'm2' });
            system.recruitDawn({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitDawn({ masterId: 'm1' });
            expect(system.listByMaster('unknown')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should return empty when no legendary dawns', () => {
            system.recruitDawn({});
            expect(system.listLegendary()).toEqual([]);
        });

        it('should list all legendary status dawns', () => {
            const { dawn: d1 } = system.recruitDawn({});
            system.recruitDawn({});
            const { dawn: d3 } = system.recruitDawn({});
            system.legendDawn(d1.dawnId);
            system.legendDawn(d3.dawnId);
            expect(system.listLegendary().length).toBe(2);
        });

        it('should not include novice or veteran dawns', () => {
            const { dawn: d1 } = system.recruitDawn({});
            const { dawn: d2 } = system.recruitDawn({});
            system.legendDawn(d1.dawnId);
            // d2 stays as novice
            const list = system.listLegendary();
            expect(list.length).toBe(1);
            expect(list[0].dawnId).toBe(d1.dawnId);
        });
    });

    describe('addVision', () => {
        it('should add a vision to the dawn', () => {
            const { dawn } = system.recruitDawn({});
            system.addVision(dawn.dawnId, 'sunrise-vision');
            expect(dawn.visions).toContain('sunrise-vision');
        });

        it('should append multiple visions', () => {
            const { dawn } = system.recruitDawn({});
            system.addVision(dawn.dawnId, 'v1');
            system.addVision(dawn.dawnId, 'v2');
            expect(dawn.visions.length).toBe(2);
            expect(dawn.visions).toEqual(['v1', 'v2']);
        });

        it('should return error for missing dawn', () => {
            const result = system.addVision('ghost', 'vision');
            expect(result.success).toBe(false);
            expect(result.error).toBe('DAWN_NOT_FOUND');
        });

        it('should trigger visionAdded hook', () => {
            const { dawn } = system.recruitDawn({});
            let payload = null;
            system.registerHook('visionAdded', (d) => { payload = d; });
            system.addVision(dawn.dawnId, 'epiphany');
            expect(payload).not.toBeNull();
            expect(payload.vision).toBe('epiphany');
            expect(payload.dawnId).toBe(dawn.dawnId);
        });
    });

    describe('raiseLight', () => {
        it('should raise light by default 5', () => {
            const { dawn } = system.recruitDawn({});
            system.raiseLight(dawn.dawnId);
            expect(dawn.light).toBe(25);
        });

        it('should raise light by custom amount', () => {
            const { dawn } = system.recruitDawn({});
            system.raiseLight(dawn.dawnId, 30);
            expect(dawn.light).toBe(50);
        });

        it('should accumulate raises', () => {
            const { dawn } = system.recruitDawn({});
            system.raiseLight(dawn.dawnId, 10);
            system.raiseLight(dawn.dawnId, 5);
            expect(dawn.light).toBe(35);
        });

        it('should return error for missing dawn', () => {
            const result = system.raiseLight('ghost', 10);
            expect(result.success).toBe(false);
            expect(result.error).toBe('DAWN_NOT_FOUND');
        });

        it('should trigger lightRaised hook', () => {
            const { dawn } = system.recruitDawn({});
            let payload = null;
            system.registerHook('lightRaised', (d) => { payload = d; });
            system.raiseLight(dawn.dawnId, 15);
            expect(payload).not.toBeNull();
            expect(payload.dawnId).toBe(dawn.dawnId);
            expect(payload.newLight).toBe(35);
        });
    });

    describe('levelUpDawn', () => {
        it('should level up the dawn', () => {
            const { dawn } = system.recruitDawn({});
            system.levelUpDawn(dawn.dawnId);
            expect(dawn.level).toBe(2);
        });

        it('should accumulate levels', () => {
            const { dawn } = system.recruitDawn({});
            system.levelUpDawn(dawn.dawnId);
            system.levelUpDawn(dawn.dawnId);
            system.levelUpDawn(dawn.dawnId);
            expect(dawn.level).toBe(4);
        });

        it('should return error for missing dawn', () => {
            const result = system.levelUpDawn('ghost');
            expect(result.success).toBe(false);
            expect(result.error).toBe('DAWN_NOT_FOUND');
        });

        it('should trigger dawnLeveledUp hook', () => {
            const { dawn } = system.recruitDawn({});
            let payload = null;
            system.registerHook('dawnLeveledUp', (d) => { payload = d; });
            system.levelUpDawn(dawn.dawnId);
            expect(payload).not.toBeNull();
            expect(payload.newLevel).toBe(2);
        });
    });

    describe('legendDawn', () => {
        it('should set status to legendary', () => {
            const { dawn } = system.recruitDawn({});
            system.legendDawn(dawn.dawnId);
            expect(dawn.status).toBe('legendary');
        });

        it('should return error for missing dawn', () => {
            const result = system.legendDawn('ghost');
            expect(result.success).toBe(false);
            expect(result.error).toBe('DAWN_NOT_FOUND');
        });

        it('should trigger dawnLegendized hook', () => {
            const { dawn } = system.recruitDawn({});
            let called = false;
            system.registerHook('dawnLegendized', () => { called = true; });
            system.legendDawn(dawn.dawnId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDawnValue', () => {
        it('should calculate using formula: level*100 + light*2 + visions*30', () => {
            const { dawn } = system.recruitDawn({});
            system.levelUpDawn(dawn.dawnId); // level 2 => 200
            system.addVision(dawn.dawnId, 'a');
            system.addVision(dawn.dawnId, 'b'); // visions 2 => 60
            // light stays at 20 => 40
            // total = 200 + 40 + 60 = 300
            expect(system.calculateDawnValue(dawn.dawnId)).toBe(300);
        });

        it('should calculate with raised light', () => {
            const { dawn } = system.recruitDawn({});
            system.raiseLight(dawn.dawnId, 30); // light 50 => 100
            // level 1 => 100, visions 0 => 0, total = 200
            expect(system.calculateDawnValue(dawn.dawnId)).toBe(200);
        });

        it('should return 0 for missing dawn', () => {
            expect(system.calculateDawnValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register a tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute a tool and return result', () => {
            system.registerTool('test', (ctx) => ctx.value * 2);
            const result = system.executeTool('test', { value: 21 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should return error for missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should catch tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });

        it('should execute default getDawn tool', () => {
            const result = system.executeTool('getDawn', { dawnId: 'ghost' });
            expect(result.success).toBe(true);
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregistering handlers', () => {
            let count = 0;
            const unregister = system.registerHook('dawnRecruited', () => count++);
            unregister();
            system.recruitDawn({});
            expect(count).toBe(0);
        });

        it('should silently swallow hook errors', () => {
            system.registerHook('dawnRecruited', () => { throw new Error('hook-error'); });
            expect(() => system.recruitDawn({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient dawns', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when threshold met', () => {
            system.stats.totalDawns = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxDawns).toBe(40); // 20 + 20
        });

        it('should not evolve twice', () => {
            system.stats.totalDawns = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitDawn({ name: 'Test' });
            const json = system.toJSON();
            expect(json.dawns.length).toBe(1);
            expect(json.stats.totalDawns).toBe(1);
            expect(json.config.maxDawns).toBe(20);
        });

        it('should deserialize from JSON', () => {
            system.recruitDawn({ name: 'Test' });
            const json = system.toJSON();
            const newSys = new CultivationDawn();
            newSys.fromJSON(json);
            expect(newSys.dawns.size).toBe(1);
            expect(newSys.stats.totalDawns).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with dawnCount', () => {
            system.recruitDawn({});
            system.recruitDawn({});
            const stats = system.getStats();
            expect(stats.dawnCount).toBe(2);
            expect(stats.totalDawns).toBe(2);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
