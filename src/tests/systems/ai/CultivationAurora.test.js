/**
 * CultivationAurora.test.js - 修真极光系统测试
 * V812 Iteration 15/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAurora } from '../../../systems/ai/CultivationAurora.js';

describe('CultivationAurora', () => {
    let system;
    beforeEach(() => { system = new CultivationAurora(); });

    describe('recruitAurora', () => {
        it('should recruit', () => {
            const { aurora } = system.recruitAurora({ masterId: 'm1', name: 'Borealis' });
            expect(aurora.masterId).toBe('m1');
            expect(aurora.name).toBe('Borealis');
        });

        it('should default type to polar', () => {
            const { aurora } = system.recruitAurora({});
            expect(aurora.type).toBe('polar');
        });

        it('should default radiance to baseRadiance', () => {
            const { aurora } = system.recruitAurora({});
            expect(aurora.radiance).toBe(20);
        });

        it('should set status to novice', () => {
            const { aurora } = system.recruitAurora({});
            expect(aurora.status).toBe('novice');
        });

        it('should increment stats', () => {
            system.recruitAurora({});
            expect(system.stats.totalAuroras).toBe(1);
        });

        it('should trigger auroraRecruited hook', () => {
            let called = false;
            system.registerHook('auroraRecruited', () => { called = true; });
            system.recruitAurora({});
            expect(called).toBe(true);
        });
    });

    describe('getAurora', () => {
        it('should return aurora', () => {
            const { aurora } = system.recruitAurora({});
            expect(system.getAurora(aurora.auroraId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAurora('ghost')).toBeNull(); });
    });

    describe('listAuroras', () => {
        it('should list all', () => {
            system.recruitAurora({});
            system.recruitAurora({});
            expect(system.listAuroras().length).toBe(2);
        });
        it('should return empty list', () => {
            expect(system.listAuroras().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitAurora({ masterId: 'm1' });
            system.recruitAurora({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            system.recruitAurora({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { aurora } = system.recruitAurora({});
            system.legendAurora(aurora.auroraId);
            system.recruitAurora({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addColor', () => {
        it('should add color', () => {
            const { aurora } = system.recruitAurora({});
            const result = system.addColor(aurora.auroraId, 'green');
            expect(result.success).toBe(true);
            expect(aurora.colors).toContain('green');
        });

        it('should reject missing aurora', () => {
            const result = system.addColor('ghost', 'green');
            expect(result.error).toBe('AURORA_NOT_FOUND');
        });

        it('should trigger colorAdded hook', () => {
            const { aurora } = system.recruitAurora({});
            let called = false;
            system.registerHook('colorAdded', () => { called = true; });
            system.addColor(aurora.auroraId, 'green');
            expect(called).toBe(true);
        });
    });

    describe('raiseRadiance', () => {
        it('should raise by default 5', () => {
            const { aurora } = system.recruitAurora({});
            system.raiseRadiance(aurora.auroraId);
            expect(aurora.radiance).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { aurora } = system.recruitAurora({});
            system.raiseRadiance(aurora.auroraId, 10);
            expect(aurora.radiance).toBe(30);
        });

        it('should reject missing aurora', () => {
            const result = system.raiseRadiance('ghost', 5);
            expect(result.error).toBe('AURORA_NOT_FOUND');
        });

        it('should trigger radianceRaised hook', () => {
            const { aurora } = system.recruitAurora({});
            let called = false;
            system.registerHook('radianceRaised', () => { called = true; });
            system.raiseRadiance(aurora.auroraId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAurora', () => {
        it('should level up', () => {
            const { aurora } = system.recruitAurora({});
            system.levelUpAurora(aurora.auroraId);
            expect(aurora.level).toBe(2);
        });

        it('should reject missing aurora', () => {
            const result = system.levelUpAurora('ghost');
            expect(result.error).toBe('AURORA_NOT_FOUND');
        });

        it('should trigger auroraLeveledUp hook', () => {
            const { aurora } = system.recruitAurora({});
            let called = false;
            system.registerHook('auroraLeveledUp', () => { called = true; });
            system.levelUpAurora(aurora.auroraId);
            expect(called).toBe(true);
        });
    });

    describe('legendAurora', () => {
        it('should set status to legendary', () => {
            const { aurora } = system.recruitAurora({});
            system.legendAurora(aurora.auroraId);
            expect(aurora.status).toBe('legendary');
        });

        it('should reject missing aurora', () => {
            const result = system.legendAurora('ghost');
            expect(result.error).toBe('AURORA_NOT_FOUND');
        });

        it('should trigger auroraLegendized hook', () => {
            const { aurora } = system.recruitAurora({});
            let called = false;
            system.registerHook('auroraLegendized', () => { called = true; });
            system.legendAurora(aurora.auroraId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAuroraValue', () => {
        it('should calculate value', () => {
            const { aurora } = system.recruitAurora({});
            system.levelUpAurora(aurora.auroraId); // level 2
            system.addColor(aurora.auroraId, 'green');
            system.addColor(aurora.auroraId, 'violet');
            // level=2, radiance=20, colors=2 -> 2*100 + 20*2 + 2*30 = 200+40+60 = 300
            expect(system.calculateAuroraValue(aurora.auroraId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAuroraValue('ghost')).toBe(0);
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

        it('should execute default getAurora', () => {
            const result = system.executeTool('getAurora', { auroraId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('auroraRecruited', () => count++);
            unregister();
            system.recruitAurora({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('auroraRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAurora({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAuroras = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAuroras = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAurora({});
            const json = system.toJSON();
            expect(json.auroras.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAurora({});
            const json = system.toJSON();
            const newSys = new CultivationAurora();
            newSys.fromJSON(json);
            expect(newSys.auroras.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.auroraCount).toBe(0);
        });
    });
});
