/**
 * SectCeremony.test.js - 宗门仪式测试
 * V469 Iteration 1/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectCeremony } from '../../../systems/ai/SectCeremony.js';

describe('SectCeremony', () => {
    let system;
    beforeEach(() => { system = new SectCeremony(); });

    describe('scheduleCeremony', () => {
        it('should schedule', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'Initiation' });
            expect(ceremony.sectId).toBe('s1');
            expect(ceremony.status).toBe('planned');
        });

        it('should default type to initiation', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            expect(ceremony.type).toBe('initiation');
        });

        it('should trigger ceremonyScheduled hook', () => {
            let called = false;
            system.registerHook('ceremonyScheduled', () => { called = true; });
            system.scheduleCeremony({ sectId: 's1', name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('getCeremony', () => {
        it('should return', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            expect(system.getCeremony(ceremony.ceremonyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCeremony('ghost')).toBeNull(); });
    });

    describe('listCeremonies', () => {
        it('should list all', () => {
            system.scheduleCeremony({ sectId: 's1', name: 'X' });
            expect(system.listCeremonies().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.scheduleCeremony({ sectId: 's1', name: 'X' });
            system.scheduleCeremony({ sectId: 's2', name: 'Y' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.scheduleCeremony({ sectId: 's1', name: 'X', type: 'initiation' });
            system.scheduleCeremony({ sectId: 's1', name: 'Y', type: 'harvest' });
            expect(system.listByType('harvest').length).toBe(1);
        });
    });

    describe('addParticipant', () => {
        it('should add', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            system.addParticipant(ceremony.ceremonyId, 'member1');
            expect(ceremony.participants.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addParticipant('ghost', 'm1');
            expect(result.error).toBe('CEREMONY_NOT_FOUND');
        });

        it('should trigger participantAdded hook', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            let called = false;
            system.registerHook('participantAdded', () => { called = true; });
            system.addParticipant(ceremony.ceremonyId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('addOffering', () => {
        it('should add', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            system.addOffering(ceremony.ceremonyId, 'incense');
            expect(ceremony.offerings.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addOffering('ghost', 'i');
            expect(result.error).toBe('CEREMONY_NOT_FOUND');
        });

        it('should trigger offeringAdded hook', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            let called = false;
            system.registerHook('offeringAdded', () => { called = true; });
            system.addOffering(ceremony.ceremonyId, 'i');
            expect(called).toBe(true);
        });
    });

    describe('executeCeremony', () => {
        it('should execute', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            system.executeCeremony(ceremony.ceremonyId);
            expect(ceremony.status).toBe('in-progress');
        });

        it('should reject missing', () => {
            const result = system.executeCeremony('ghost');
            expect(result.error).toBe('CEREMONY_NOT_FOUND');
        });

        it('should trigger ceremonyExecuted hook', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            let called = false;
            system.registerHook('ceremonyExecuted', () => { called = true; });
            system.executeCeremony(ceremony.ceremonyId);
            expect(called).toBe(true);
        });
    });

    describe('completeCeremony', () => {
        it('should complete', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            system.completeCeremony(ceremony.ceremonyId);
            expect(ceremony.status).toBe('completed');
        });

        it('should reject missing', () => {
            const result = system.completeCeremony('ghost');
            expect(result.error).toBe('CEREMONY_NOT_FOUND');
        });

        it('should trigger ceremonyCompleted hook', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            let called = false;
            system.registerHook('ceremonyCompleted', () => { called = true; });
            system.completeCeremony(ceremony.ceremonyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCeremonyPower', () => {
        it('should calculate', () => {
            const { ceremony } = system.scheduleCeremony({ sectId: 's1', name: 'X' });
            system.addParticipant(ceremony.ceremonyId, 'm1');
            system.addParticipant(ceremony.ceremonyId, 'm2');
            system.addOffering(ceremony.ceremonyId, 'i1');
            // 2 participants * 10 + 1 offering * 5 = 25
            expect(system.calculateCeremonyPower(ceremony.ceremonyId)).toBe(25);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCeremonyPower('ghost')).toBe(0);
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

        it('should execute default getCeremony', () => {
            const result = system.executeTool('getCeremony', { ceremonyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ceremonyScheduled', () => count++);
            unregister();
            system.scheduleCeremony({ sectId: 's1', name: 'X' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('ceremonyScheduled', () => { throw new Error('x'); });
            expect(() => system.scheduleCeremony({ sectId: 's1', name: 'X' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCeremonies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCeremonies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.scheduleCeremony({ sectId: 's1', name: 'X' });
            const json = system.toJSON();
            expect(json.ceremonies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.scheduleCeremony({ sectId: 's1', name: 'X' });
            const json = system.toJSON();
            const newSys = new SectCeremony();
            newSys.fromJSON(json);
            expect(newSys.ceremonies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.ceremonyCount).toBe(0);
        });
    });
});
