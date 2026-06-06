/**
 * CultivationAeromancer.test.js - 修真风系师测试
 * V632 Iteration 15/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAeromancer } from '../../../systems/ai/CultivationAeromancer.js';

describe('CultivationAeromancer', () => {
    let system;
    beforeEach(() => { system = new CultivationAeromancer(); });

    describe('recruitAeromancer', () => {
        it('should recruit', () => {
            const { aeromancer } = system.recruitAeromancer({ name: 'Aero1' });
            expect(aeromancer.name).toBe('Aero1');
        });

        it('should default type to breeze', () => {
            const { aeromancer } = system.recruitAeromancer({});
            expect(aeromancer.type).toBe('breeze');
        });

        it('should default air to baseAir', () => {
            const { aeromancer } = system.recruitAeromancer({});
            expect(aeromancer.air).toBe(20);
        });

        it('should default status to novice', () => {
            const { aeromancer } = system.recruitAeromancer({});
            expect(aeromancer.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { aeromancer } = system.recruitAeromancer({});
            expect(aeromancer.level).toBe(1);
        });

        it('should default gales to []', () => {
            const { aeromancer } = system.recruitAeromancer({});
            expect(aeromancer.gales).toEqual([]);
        });

        it('should preserve mentorId', () => {
            const { aeromancer } = system.recruitAeromancer({ mentorId: 'm1' });
            expect(aeromancer.mentorId).toBe('m1');
        });

        it('should increment stats', () => {
            system.recruitAeromancer({});
            expect(system.stats.totalAeromancers).toBe(1);
        });

        it('should trigger aeromancerRecruited hook', () => {
            let called = false;
            system.registerHook('aeromancerRecruited', () => { called = true; });
            system.recruitAeromancer({});
            expect(called).toBe(true);
        });
    });

    describe('getAeromancer', () => {
        it('should return', () => {
            const { aeromancer } = system.recruitAeromancer({});
            expect(system.getAeromancer(aeromancer.aeromancerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAeromancer('ghost')).toBeNull(); });
    });

    describe('listAeromancers', () => {
        it('should list all', () => {
            system.recruitAeromancer({});
            system.recruitAeromancer({});
            expect(system.listAeromancers().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listAeromancers().length).toBe(0);
        });
    });

    describe('listByMentor', () => {
        it('should filter', () => {
            system.recruitAeromancer({ mentorId: 'm1' });
            system.recruitAeromancer({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(1);
        });

        it('should return empty for unknown mentor', () => {
            system.recruitAeromancer({ mentorId: 'm1' });
            expect(system.listByMentor('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { aeromancer: a1 } = system.recruitAeromancer({});
            const { aeromancer: a2 } = system.recruitAeromancer({});
            a2.status = 'legendary';
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none', () => {
            system.recruitAeromancer({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addGale', () => {
        it('should add a gale', () => {
            const { aeromancer } = system.recruitAeromancer({});
            const result = system.addGale(aeromancer.aeromancerId, 'Zephyr');
            expect(result.success).toBe(true);
            expect(aeromancer.gales.length).toBe(1);
        });

        it('should accept string gale name', () => {
            const { aeromancer } = system.recruitAeromancer({});
            system.addGale(aeromancer.aeromancerId, 'GaleForce');
            expect(aeromancer.gales[0].name).toBe('GaleForce');
        });

        it('should accept object gale', () => {
            const { aeromancer } = system.recruitAeromancer({});
            system.addGale(aeromancer.aeromancerId, { name: 'Storm' });
            expect(aeromancer.gales[0].name).toBe('Storm');
        });

        it('should reject missing', () => {
            const result = system.addGale('ghost', 'Zephyr');
            expect(result.error).toBe('AEROMANCER_NOT_FOUND');
        });

        it('should trigger galeAdded hook', () => {
            const { aeromancer } = system.recruitAeromancer({});
            let called = false;
            system.registerHook('galeAdded', () => { called = true; });
            system.addGale(aeromancer.aeromancerId, 'Zephyr');
            expect(called).toBe(true);
        });
    });

    describe('deepenAir', () => {
        it('should deepen air with default amount', () => {
            const { aeromancer } = system.recruitAeromancer({});
            system.deepenAir(aeromancer.aeromancerId);
            expect(aeromancer.air).toBe(25);
        });

        it('should deepen air with custom amount', () => {
            const { aeromancer } = system.recruitAeromancer({});
            system.deepenAir(aeromancer.aeromancerId, 10);
            expect(aeromancer.air).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.deepenAir('ghost', 5);
            expect(result.error).toBe('AEROMANCER_NOT_FOUND');
        });

        it('should trigger airDeepened hook', () => {
            const { aeromancer } = system.recruitAeromancer({});
            let called = false;
            system.registerHook('airDeepened', () => { called = true; });
            system.deepenAir(aeromancer.aeromancerId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAeromancer', () => {
        it('should level up', () => {
            const { aeromancer } = system.recruitAeromancer({});
            system.levelUpAeromancer(aeromancer.aeromancerId);
            expect(aeromancer.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpAeromancer('ghost');
            expect(result.error).toBe('AEROMANCER_NOT_FOUND');
        });
    });

    describe('legendAeromancer', () => {
        it('should set status to legendary', () => {
            const { aeromancer } = system.recruitAeromancer({});
            system.legendAeromancer(aeromancer.aeromancerId);
            expect(aeromancer.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendAeromancer('ghost');
            expect(result.error).toBe('AEROMANCER_NOT_FOUND');
        });

        it('should trigger aeromancerLegendized hook', () => {
            const { aeromancer } = system.recruitAeromancer({});
            let called = false;
            system.registerHook('aeromancerLegendized', () => { called = true; });
            system.legendAeromancer(aeromancer.aeromancerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAeromancerValue', () => {
        it('should calculate base value', () => {
            const { aeromancer } = system.recruitAeromancer({});
            // level 1 * 100 + air 20 * 2 + 0 gales * 30 = 140
            expect(system.calculateAeromancerValue(aeromancer.aeromancerId)).toBe(140);
        });

        it('should include gale bonus', () => {
            const { aeromancer } = system.recruitAeromancer({});
            system.addGale(aeromancer.aeromancerId, 'Zephyr');
            system.addGale(aeromancer.aeromancerId, 'Gale');
            // level 1 * 100 + air 20 * 2 + 2 * 30 = 200
            expect(system.calculateAeromancerValue(aeromancer.aeromancerId)).toBe(200);
        });

        it('should include level bonus', () => {
            const { aeromancer } = system.recruitAeromancer({});
            system.levelUpAeromancer(aeromancer.aeromancerId);
            // level 2 * 100 + air 20 * 2 + 0 * 30 = 240
            expect(system.calculateAeromancerValue(aeromancer.aeromancerId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAeromancerValue('ghost')).toBe(0);
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

        it('should execute default getAeromancer', () => {
            const result = system.executeTool('getAeromancer', { aeromancerId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('aeromancerRecruited', () => count++);
            unregister();
            system.recruitAeromancer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('aeromancerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAeromancer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAeromancers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAeromancers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAeromancer({});
            const json = system.toJSON();
            expect(json.aeromancers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAeromancer({});
            const json = system.toJSON();
            const newSys = new CultivationAeromancer();
            newSys.fromJSON(json);
            expect(newSys.aeromancers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.aeromancerCount).toBe(0);
        });

        it('should reflect recruitment', () => {
            system.recruitAeromancer({});
            const stats = system.getStats();
            expect(stats.aeromancerCount).toBe(1);
        });
    });
});
