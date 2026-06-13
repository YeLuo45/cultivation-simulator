/**
 * CultivationBridge.test.js - 修真桥系统测试
 * V748 Iteration 11/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBridge } from '../../../systems/ai/CultivationBridge.js';

describe('CultivationBridge', () => {
    let system;
    beforeEach(() => { system = new CultivationBridge(); });

    describe('recruitBridge', () => {
        it('should recruit bridge', () => {
            const { bridge } = system.recruitBridge({ masterId: 'm1', name: 'Celestial Bridge', type: 'divine' });
            expect(bridge.masterId).toBe('m1');
            expect(bridge.name).toBe('Celestial Bridge');
            expect(bridge.type).toBe('divine');
        });

        it('should default type to stone', () => {
            const { bridge } = system.recruitBridge({});
            expect(bridge.type).toBe('stone');
        });

        it('should default name to Unnamed Bridge', () => {
            const { bridge } = system.recruitBridge({});
            expect(bridge.name).toBe('Unnamed Bridge');
        });

        it('should default strength to baseStrength', () => {
            const { bridge } = system.recruitBridge({});
            expect(bridge.strength).toBe(20);
        });

        it('should start at level 1', () => {
            const { bridge } = system.recruitBridge({});
            expect(bridge.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { bridge } = system.recruitBridge({});
            expect(bridge.status).toBe('novice');
        });

        it('should start with empty arches', () => {
            const { bridge } = system.recruitBridge({});
            expect(bridge.arches).toEqual([]);
        });

        it('should generate bridgeId', () => {
            const { bridge } = system.recruitBridge({});
            expect(bridge.bridgeId).toBeDefined();
            expect(typeof bridge.bridgeId).toBe('string');
        });

        it('should accept custom bridgeId', () => {
            const { bridge } = system.recruitBridge({ bridgeId: 'my-bridge' });
            expect(bridge.bridgeId).toBe('my-bridge');
        });

        it('should support all types', () => {
            const { bridge: b1 } = system.recruitBridge({ type: 'stone' });
            const { bridge: b2 } = system.recruitBridge({ type: 'wood' });
            const { bridge: b3 } = system.recruitBridge({ type: 'divine' });
            expect(b1.type).toBe('stone');
            expect(b2.type).toBe('wood');
            expect(b3.type).toBe('divine');
        });

        it('should trigger bridgeRecruited hook', () => {
            let called = false;
            system.registerHook('bridgeRecruited', () => { called = true; });
            system.recruitBridge({});
            expect(called).toBe(true);
        });
    });

    describe('getBridge', () => {
        it('should return bridge', () => {
            const { bridge } = system.recruitBridge({});
            expect(system.getBridge(bridge.bridgeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBridge('ghost')).toBeNull(); });
    });

    describe('listBridges', () => {
        it('should list all', () => {
            system.recruitBridge({});
            system.recruitBridge({});
            expect(system.listBridges().length).toBe(2);
        });

        it('should return empty when no bridges', () => {
            expect(system.listBridges().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitBridge({ masterId: 'm1' });
            system.recruitBridge({ masterId: 'm2' });
            system.recruitBridge({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitBridge({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { bridge: b1 } = system.recruitBridge({});
            const { bridge: b2 } = system.recruitBridge({});
            system.legendBridge(b1.bridgeId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].bridgeId).toBe(b1.bridgeId);
        });

        it('should return empty when none legendary', () => {
            system.recruitBridge({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addArch', () => {
        it('should add arch', () => {
            const { bridge } = system.recruitBridge({});
            system.addArch(bridge.bridgeId, 'rainbow-arch');
            expect(bridge.arches).toContain('rainbow-arch');
            expect(bridge.arches.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addArch('ghost', 'arch');
            expect(result.error).toBe('BRIDGE_NOT_FOUND');
        });

        it('should trigger archAdded hook', () => {
            const { bridge } = system.recruitBridge({});
            let called = false;
            system.registerHook('archAdded', () => { called = true; });
            system.addArch(bridge.bridgeId, 'arch');
            expect(called).toBe(true);
        });

        it('should add multiple arches', () => {
            const { bridge } = system.recruitBridge({});
            system.addArch(bridge.bridgeId, 'arch1');
            system.addArch(bridge.bridgeId, 'arch2');
            expect(bridge.arches.length).toBe(2);
        });
    });

    describe('raiseStrength', () => {
        it('should raise strength', () => {
            const { bridge } = system.recruitBridge({});
            system.raiseStrength(bridge.bridgeId, 10);
            expect(bridge.strength).toBe(30);
        });

        it('should default amount to 5', () => {
            const { bridge } = system.recruitBridge({});
            system.raiseStrength(bridge.bridgeId);
            expect(bridge.strength).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseStrength('ghost', 10);
            expect(result.error).toBe('BRIDGE_NOT_FOUND');
        });

        it('should trigger strengthRaised hook', () => {
            const { bridge } = system.recruitBridge({});
            let called = false;
            system.registerHook('strengthRaised', () => { called = true; });
            system.raiseStrength(bridge.bridgeId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBridge', () => {
        it('should level up', () => {
            const { bridge } = system.recruitBridge({});
            system.levelUpBridge(bridge.bridgeId);
            expect(bridge.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpBridge('ghost');
            expect(result.error).toBe('BRIDGE_NOT_FOUND');
        });

        it('should trigger bridgeLeveledUp hook', () => {
            const { bridge } = system.recruitBridge({});
            let called = false;
            system.registerHook('bridgeLeveledUp', () => { called = true; });
            system.levelUpBridge(bridge.bridgeId);
            expect(called).toBe(true);
        });
    });

    describe('legendBridge', () => {
        it('should set status to legendary', () => {
            const { bridge } = system.recruitBridge({});
            system.legendBridge(bridge.bridgeId);
            expect(bridge.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBridge('ghost');
            expect(result.error).toBe('BRIDGE_NOT_FOUND');
        });

        it('should trigger bridgeLegendized hook', () => {
            const { bridge } = system.recruitBridge({});
            let called = false;
            system.registerHook('bridgeLegendized', () => { called = true; });
            system.legendBridge(bridge.bridgeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBridgeValue', () => {
        it('should calculate for default bridge', () => {
            const { bridge } = system.recruitBridge({});
            // level 1 * 100 + strength 20 * 2 + 0 arches * 30 = 100 + 40 + 0 = 140
            expect(system.calculateBridgeValue(bridge.bridgeId)).toBe(140);
        });

        it('should incorporate level, strength, and arches', () => {
            const { bridge } = system.recruitBridge({});
            system.levelUpBridge(bridge.bridgeId); // level 2
            system.raiseStrength(bridge.bridgeId, 10); // strength 30
            system.addArch(bridge.bridgeId, 'arch1'); // 1 arch
            system.addArch(bridge.bridgeId, 'arch2'); // 2 arches
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateBridgeValue(bridge.bridgeId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBridgeValue('ghost')).toBe(0);
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

        it('should execute default getBridge', () => {
            const result = system.executeTool('getBridge', { bridgeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bridgeRecruited', () => count++);
            unregister();
            system.recruitBridge({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bridgeRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBridge({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBridges = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBridges = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBridge({});
            const json = system.toJSON();
            expect(json.bridges.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBridge({});
            const json = system.toJSON();
            const newSys = new CultivationBridge();
            newSys.fromJSON(json);
            expect(newSys.bridges.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bridgeCount).toBe(0);
        });
    });
});
