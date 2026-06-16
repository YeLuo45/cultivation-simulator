/**
 * SectDashboard.test.js - 宗门仪表盘测试
 * V483 Iteration 15/15 FINAL Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectDashboard } from '../../../systems/ai/SectDashboard.js';

describe('SectDashboard', () => {
    let system;
    beforeEach(() => { system = new SectDashboard(); });

    describe('registerSect', () => {
        it('should register', () => {
            const { sect } = system.registerSect({ name: 'Sky Sect' });
            expect(sect.name).toBe('Sky Sect');
        });

        it('should set initial metrics', () => {
            const { sect } = system.registerSect({});
            expect(system.getMetrics(sect.sectId)).not.toBeNull();
        });

        it('should trigger sectRegistered hook', () => {
            let called = false;
            system.registerHook('sectRegistered', () => { called = true; });
            system.registerSect({});
            expect(called).toBe(true);
        });
    });

    describe('getSect', () => {
        it('should return', () => {
            const { sect } = system.registerSect({});
            expect(system.getSect(sect.sectId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSect('ghost')).toBeNull(); });
    });

    describe('listSects', () => {
        it('should list all', () => {
            system.registerSect({});
            expect(system.listSects().length).toBe(1);
        });
    });

    describe('listByStatus', () => {
        it('should filter', () => {
            system.registerSect({});
            expect(system.listByStatus('active').length).toBe(1);
        });
    });

    describe('listByFame', () => {
        it('should filter', () => {
            system.registerSect({});
            system.registerSect({ fame: 500 });
            expect(system.listByFame(200).length).toBe(1);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.registerSect({ name: 'S1' });
            system.registerSect({ name: 'S2' });
            expect(system.listTop(2).length).toBe(2);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { sect } = system.registerSect({});
            const result = system.setMetrics(sect.sectId, { cohesion: 90 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('SECT_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { sect } = system.registerSect({});
            expect(system.getMetrics(sect.sectId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshSect', () => {
        it('should refresh', () => {
            const { sect } = system.registerSect({});
            const result = system.refreshSect(sect.sectId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshSect('ghost');
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should trigger sectRefreshed hook', () => {
            const { sect } = system.registerSect({});
            let called = false;
            system.registerHook('sectRefreshed', () => { called = true; });
            system.refreshSect(sect.sectId);
            expect(called).toBe(true);
        });
    });

    describe('recruitDisciple', () => {
        it('should recruit', () => {
            const { sect } = system.registerSect({});
            system.recruitDisciple(sect.sectId, 5);
            expect(sect.disciples).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.recruitDisciple('ghost', 1);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should trigger discipleRecruited hook', () => {
            const { sect } = system.registerSect({});
            let called = false;
            system.registerHook('discipleRecruited', () => { called = true; });
            system.recruitDisciple(sect.sectId, 1);
            expect(called).toBe(true);
        });
    });

    describe('trainDisciple', () => {
        it('should train', () => {
            const { sect } = system.registerSect({});
            system.trainDisciple(sect.sectId, 10);
            expect(sect.strength).toBe(110);
        });

        it('should reject missing', () => {
            const result = system.trainDisciple('ghost', 5);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should trigger discipleTrained hook', () => {
            const { sect } = system.registerSect({});
            let called = false;
            system.registerHook('discipleTrained', () => { called = true; });
            system.trainDisciple(sect.sectId, 5);
            expect(called).toBe(true);
        });
    });

    describe('gatherResources', () => {
        it('should gather', () => {
            const { sect } = system.registerSect({});
            system.gatherResources(sect.sectId, 500);
            expect(sect.resources).toBe(1500);
        });

        it('should reject missing', () => {
            const result = system.gatherResources('ghost', 100);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should trigger resourcesGathered hook', () => {
            const { sect } = system.registerSect({});
            let called = false;
            system.registerHook('resourcesGathered', () => { called = true; });
            system.gatherResources(sect.sectId, 100);
            expect(called).toBe(true);
        });
    });

    describe('spendResources', () => {
        it('should spend', () => {
            const { sect } = system.registerSect({});
            system.spendResources(sect.sectId, 200);
            expect(sect.resources).toBe(800);
        });

        it('should reject missing', () => {
            const result = system.spendResources('ghost', 50);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should reject insufficient', () => {
            const { sect } = system.registerSect({});
            const result = system.spendResources(sect.sectId, 99999);
            expect(result.error).toBe('INSUFFICIENT_RESOURCES');
        });

        it('should trigger resourcesSpent hook', () => {
            const { sect } = system.registerSect({});
            let called = false;
            system.registerHook('resourcesSpent', () => { called = true; });
            system.spendResources(sect.sectId, 50);
            expect(called).toBe(true);
        });
    });

    describe('promoteStrength', () => {
        it('should promote', () => {
            const { sect } = system.registerSect({});
            system.promoteStrength(sect.sectId, 50);
            expect(sect.strength).toBe(150);
        });

        it('should reject missing', () => {
            const result = system.promoteStrength('ghost', 10);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should trigger strengthPromoted hook', () => {
            const { sect } = system.registerSect({});
            let called = false;
            system.registerHook('strengthPromoted', () => { called = true; });
            system.promoteStrength(sect.sectId, 10);
            expect(called).toBe(true);
        });
    });

    describe('disbandSect', () => {
        it('should disband', () => {
            const { sect } = system.registerSect({});
            system.disbandSect(sect.sectId);
            expect(sect.status).toBe('disbanded');
        });

        it('should reject missing', () => {
            const result = system.disbandSect('ghost');
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should trigger sectDisbanded hook', () => {
            const { sect } = system.registerSect({});
            let called = false;
            system.registerHook('sectDisbanded', () => { called = true; });
            system.disbandSect(sect.sectId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSectPower', () => {
        it('should calculate', () => {
            const { sect } = system.registerSect({});
            expect(system.calculateSectPower(sect.sectId)).toBe(100 + 20 + 10);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSectPower('ghost')).toBe(0);
        });
    });

    describe('deleteSect', () => {
        it('should delete', () => {
            const { sect } = system.registerSect({});
            const result = system.deleteSect(sect.sectId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteSect('ghost');
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should trigger sectDeleted hook', () => {
            const { sect } = system.registerSect({});
            let called = false;
            system.registerHook('sectDeleted', () => { called = true; });
            system.deleteSect(sect.sectId);
            expect(called).toBe(true);
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

        it('should execute default getSect', () => {
            const result = system.executeTool('getSect', { sectId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sectRegistered', () => count++);
            unregister();
            system.registerSect({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sectRegistered', () => { throw new Error('x'); });
            expect(() => system.registerSect({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSects = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSects = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerSect({});
            const json = system.toJSON();
            expect(json.sects.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerSect({});
            const json = system.toJSON();
            const newSys = new SectDashboard();
            newSys.fromJSON(json);
            expect(newSys.sects.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sectCount).toBe(0);
        });
    });
});