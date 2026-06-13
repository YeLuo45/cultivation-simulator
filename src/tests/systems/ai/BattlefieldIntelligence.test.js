/**
 * BattlefieldIntelligence.test.js - 战场情报系统测试
 * V315 Iteration 3/9 Round 4 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BattlefieldIntelligence } from '../../../systems/ai/BattlefieldIntelligence.js';

describe('BattlefieldIntelligence', () => {
    let system;
    beforeEach(() => { system = new BattlefieldIntelligence(); });

    describe('registerEnemy', () => {
        it('should register enemy', () => {
            const { enemy } = system.registerEnemy({ name: 'E1' });
            expect(enemy.name).toBe('E1');
        });
        it('should default level to 1', () => {
            const { enemy } = system.registerEnemy({});
            expect(enemy.level).toBe(1);
        });
        it('should generate id', () => {
            const { enemy } = system.registerEnemy({});
            expect(enemy.enemyId).toBeDefined();
        });
    });

    describe('getEnemy', () => {
        it('should return enemy', () => {
            const { enemy } = system.registerEnemy({});
            expect(system.getEnemy(enemy.enemyId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getEnemy('ghost')).toBeNull();
        });
    });

    describe('Threat Management', () => {
        it('should add threat', () => {
            const { threat } = system.addThreat({});
            expect(threat.threatId).toBeDefined();
        });

        it('should default level to 1', () => {
            const { threat } = system.addThreat({});
            expect(threat.level).toBe(1);
        });

        it('should get threat', () => {
            const { threat } = system.addThreat({});
            expect(system.getThreat(threat.threatId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getThreat('ghost')).toBeNull();
        });

        it('should list threats', () => {
            system.addThreat({});
            expect(system.listThreats().length).toBe(1);
        });

        it('should clear threat', () => {
            const { threat } = system.addThreat({});
            const result = system.clearThreat(threat.threatId);
            expect(result.success).toBe(true);
        });

        it('should reject clearing missing', () => {
            const result = system.clearThreat('ghost');
            expect(result.error).toBe('THREAT_NOT_FOUND');
        });

        it('should trigger threatAdded hook', () => {
            let called = false;
            system.registerHook('threatAdded', () => { called = true; });
            system.addThreat({});
            expect(called).toBe(true);
        });

        it('should trigger threatCleared hook', () => {
            const { threat } = system.addThreat({});
            let called = false;
            system.registerHook('threatCleared', () => { called = true; });
            system.clearThreat(threat.threatId);
            expect(called).toBe(true);
        });
    });

    describe('scanArea', () => {
        it('should scan empty', () => {
            const result = system.scanArea(0, 0, 100);
            expect(result.found.length).toBe(0);
        });

        it('should find nearby enemies', () => {
            system.registerEnemy({ x: 5, y: 5 });
            system.registerEnemy({ x: 200, y: 200 });
            const result = system.scanArea(0, 0, 50);
            expect(result.found.length).toBe(1);
        });

        it('should record scan', () => {
            system.scanArea(0, 0, 100);
            expect(system.scans.length).toBe(1);
        });

        it('should increment totalScans', () => {
            system.scanArea(0, 0, 100);
            expect(system.stats.totalScans).toBe(1);
        });

        it('should trigger areaScanned hook', () => {
            let called = false;
            system.registerHook('areaScanned', () => { called = true; });
            system.scanArea(0, 0, 100);
            expect(called).toBe(true);
        });
    });

    describe('Intel Management', () => {
        it('should record intel', () => {
            const { intel } = system.recordIntel({ content: 'X' });
            expect(intel.content).toBe('X');
        });

        it('should default reliability to 0.5', () => {
            const { intel } = system.recordIntel({});
            expect(intel.reliability).toBe(0.5);
        });

        it('should get intel', () => {
            const { intel } = system.recordIntel({});
            expect(system.getIntel(intel.id)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getIntel('ghost')).toBeNull();
        });

        it('should list intel', () => {
            system.recordIntel({});
            expect(system.listIntel().length).toBe(1);
        });

        it('should increment totalIntel', () => {
            system.recordIntel({});
            expect(system.stats.totalIntel).toBe(1);
        });

        it('should trigger intelRecorded hook', () => {
            let called = false;
            system.registerHook('intelRecorded', () => { called = true; });
            system.recordIntel({});
            expect(called).toBe(true);
        });
    });

    describe('applyIntelAging', () => {
        it('should age intel', () => {
            const { intel } = system.recordIntel({});
            const before = intel.age;
            system.applyIntelAging();
            expect(intel.age).toBeGreaterThan(before);
        });

        it('should trigger intelAged hook', () => {
            let called = false;
            system.registerHook('intelAged', () => { called = true; });
            system.applyIntelAging();
            expect(called).toBe(true);
        });

        it('should decrease reliability', () => {
            const { intel } = system.recordIntel({});
            const before = intel.reliability;
            system.applyIntelAging();
            expect(intel.reliability).toBeLessThan(before);
        });
    });

    describe('getRecentScans', () => {
        it('should return recent', () => {
            for (let i = 0; i < 5; i++) system.scanArea(0, 0, 100);
            expect(system.getRecentScans(3).length).toBe(3);
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

        it('should execute default scanArea', () => {
            const result = system.executeTool('scanArea', { cx: 0, cy: 0, radius: 100 });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('threatAdded', () => count++);
            unregister();
            system.addThreat({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('threatAdded', () => { throw new Error('x'); });
            expect(() => system.addThreat({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalScans = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalScans = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addThreat({});
            const json = system.toJSON();
            expect(json.threats.length).toBe(1);
        });
        it('should deserialize', () => {
            system.addThreat({});
            const json = system.toJSON();
            const newSys = new BattlefieldIntelligence();
            newSys.fromJSON(json);
            expect(newSys.threats.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.threatCount).toBe(0);
        });
    });
});