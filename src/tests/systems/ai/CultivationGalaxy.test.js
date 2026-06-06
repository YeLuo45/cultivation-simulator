/**
 * CultivationGalaxy.test.js - 修真星系系统测试
 * V594 Iteration 17/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGalaxy } from '../../../systems/ai/CultivationGalaxy.js';

describe('CultivationGalaxy', () => {
    let system;
    beforeEach(() => { system = new CultivationGalaxy(); });

    describe('createGalaxy', () => {
        it('should create a galaxy', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'Andromeda', type: 'spiral' });
            expect(galaxy.sageId).toBe('s1');
            expect(galaxy.name).toBe('Andromeda');
            expect(galaxy.type).toBe('spiral');
            expect(galaxy.energy).toBe(100);
            expect(galaxy.stars).toEqual([]);
            expect(galaxy.level).toBe(1);
            expect(galaxy.status).toBe('forming');
        });

        it('should use default type when missing', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'Mystic' });
            expect(galaxy.type).toBe('spiral');
        });

        it('should accept elliptical type', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'Ellie', type: 'elliptical' });
            expect(galaxy.type).toBe('elliptical');
        });

        it('should accept irregular type', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'Irrie', type: 'irregular' });
            expect(galaxy.type).toBe('irregular');
        });

        it('should accept custom energy and stars', () => {
            const stars = [{ starId: 'st1', name: 'Polaris' }];
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'Custom', energy: 250, stars });
            expect(galaxy.energy).toBe(250);
            expect(galaxy.stars.length).toBe(1);
        });

        it('should reject when max reached', () => {
            system.config.maxGalaxies = 1;
            system.createGalaxy({ sageId: 's1', name: 'A' });
            const result = system.createGalaxy({ sageId: 's1', name: 'B' });
            expect(result.error).toBe('MAX_GALAXIES_REACHED');
        });

        it('should trigger galaxyCreated hook', () => {
            let called = false;
            system.registerHook('galaxyCreated', () => { called = true; });
            system.createGalaxy({ sageId: 's1', name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('getGalaxy', () => {
        it('should return galaxy', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'X' });
            expect(system.getGalaxy(galaxy.galaxyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGalaxy('ghost')).toBeNull(); });
    });

    describe('listGalaxies', () => {
        it('should list all', () => {
            system.createGalaxy({ sageId: 's1', name: 'A' });
            system.createGalaxy({ sageId: 's2', name: 'B' });
            expect(system.listGalaxies().length).toBe(2);
        });
        it('should be empty initially', () => {
            expect(system.listGalaxies().length).toBe(0);
        });
    });

    describe('listBySage', () => {
        it('should filter by sage', () => {
            system.createGalaxy({ sageId: 's1', name: 'A' });
            system.createGalaxy({ sageId: 's2', name: 'B' });
            system.createGalaxy({ sageId: 's1', name: 'C' });
            expect(system.listBySage('s1').length).toBe(2);
            expect(system.listBySage('s2').length).toBe(1);
            expect(system.listBySage('s3').length).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should return stable/eternal galaxies', () => {
            const { galaxy: g1 } = system.createGalaxy({ sageId: 's1', name: 'A' });
            const { galaxy: g2 } = system.createGalaxy({ sageId: 's2', name: 'B' });
            const { galaxy: g3 } = system.createGalaxy({ sageId: 's3', name: 'C' });
            g1.status = 'stable';
            g3.status = 'eternal';
            const stable = system.listStable();
            expect(stable.length).toBe(2);
        });
    });

    describe('addStar', () => {
        it('should add star', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            const result = system.addStar(galaxy.galaxyId, { starId: 'st1', name: 'Polaris' });
            expect(result.success).toBe(true);
            expect(galaxy.stars.length).toBe(1);
            expect(galaxy.stars[0].name).toBe('Polaris');
        });

        it('should add multiple stars', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            system.addStar(galaxy.galaxyId, { name: 'Sirius' });
            system.addStar(galaxy.galaxyId, { name: 'Vega' });
            expect(galaxy.stars.length).toBe(2);
        });

        it('should reject missing galaxy', () => {
            const result = system.addStar('ghost', { name: 'X' });
            expect(result.error).toBe('GALAXY_NOT_FOUND');
        });

        it('should trigger starAdded hook', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            let captured = null;
            system.registerHook('starAdded', (data) => { captured = data; });
            system.addStar(galaxy.galaxyId, { name: 'Rigel' });
            expect(captured.star.name).toBe('Rigel');
            expect(captured.galaxyId).toBe(galaxy.galaxyId);
        });
    });

    describe('increaseEnergy', () => {
        it('should increase energy by default', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            system.increaseEnergy(galaxy.galaxyId);
            expect(galaxy.energy).toBe(105);
        });

        it('should increase energy by custom amount', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            system.increaseEnergy(galaxy.galaxyId, 50);
            expect(galaxy.energy).toBe(150);
        });

        it('should reject missing galaxy', () => {
            const result = system.increaseEnergy('ghost', 5);
            expect(result.error).toBe('GALAXY_NOT_FOUND');
        });

        it('should trigger energyIncreased hook', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            let captured = null;
            system.registerHook('energyIncreased', (data) => { captured = data; });
            system.increaseEnergy(galaxy.galaxyId, 25);
            expect(captured.newEnergy).toBe(125);
        });
    });

    describe('levelUpGalaxy', () => {
        it('should level up', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            system.levelUpGalaxy(galaxy.galaxyId);
            expect(galaxy.level).toBe(2);
            system.levelUpGalaxy(galaxy.galaxyId);
            expect(galaxy.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpGalaxy('ghost');
            expect(result.error).toBe('GALAXY_NOT_FOUND');
        });

        it('should trigger galaxyLeveledUp hook', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            let called = false;
            system.registerHook('galaxyLeveledUp', () => { called = true; });
            system.levelUpGalaxy(galaxy.galaxyId);
            expect(called).toBe(true);
        });
    });

    describe('eternalizeGalaxy', () => {
        it('should set status to eternal', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            system.eternalizeGalaxy(galaxy.galaxyId);
            expect(galaxy.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternalizeGalaxy('ghost');
            expect(result.error).toBe('GALAXY_NOT_FOUND');
        });

        it('should trigger galaxyEternalized hook', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            let called = false;
            system.registerHook('galaxyEternalized', () => { called = true; });
            system.eternalizeGalaxy(galaxy.galaxyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGalaxyValue', () => {
        it('should calculate value', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            system.addStar(galaxy.galaxyId, { name: 's1' });
            system.addStar(galaxy.galaxyId, { name: 's2' });
            // level=1*100 + energy=100*2 + stars=2*30 = 100 + 200 + 60 = 360
            expect(system.calculateGalaxyValue(galaxy.galaxyId)).toBe(360);
        });

        it('should scale with level', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            system.levelUpGalaxy(galaxy.galaxyId);
            // level=2*100 + 100*2 + 0 = 400
            expect(system.calculateGalaxyValue(galaxy.galaxyId)).toBe(400);
        });

        it('should scale with energy', () => {
            const { galaxy } = system.createGalaxy({ sageId: 's1', name: 'A' });
            system.increaseEnergy(galaxy.galaxyId, 50);
            // 1*100 + 150*2 + 0 = 400
            expect(system.calculateGalaxyValue(galaxy.galaxyId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGalaxyValue('ghost')).toBe(0);
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

        it('should execute default getGalaxy', () => {
            const result = system.executeTool('getGalaxy', { galaxyId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default createGalaxy', () => {
            const result = system.executeTool('createGalaxy', { sageId: 's1', name: 'Tool' });
            expect(result.success).toBe(true);
            expect(result.result.galaxy.name).toBe('Tool');
        });

        it('should handle null context in tool', () => {
            system.registerTool('nullctx', (ctx) => ctx);
            const result = system.executeTool('nullctx', null);
            expect(result.success).toBe(true);
            expect(result.result).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('galaxyCreated', () => count++);
            unregister();
            system.createGalaxy({ sageId: 's1', name: 'X' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('galaxyCreated', () => { throw new Error('x'); });
            expect(() => system.createGalaxy({ sageId: 's1', name: 'X' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGalaxies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxGalaxies).toBe(35);
        });
        it('should not double evolve', () => {
            system.stats.totalGalaxies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createGalaxy({ sageId: 's1', name: 'A' });
            const json = system.toJSON();
            expect(json.galaxies.length).toBe(1);
            expect(json.stats.totalGalaxies).toBe(1);
        });
        it('should deserialize', () => {
            system.createGalaxy({ sageId: 's1', name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationGalaxy();
            newSys.fromJSON(json);
            expect(newSys.galaxies.size).toBe(1);
            expect(newSys.listBySage('s1').length).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.createGalaxy({ sageId: 's1', name: 'A' });
            system.createGalaxy({ sageId: 's2', name: 'B' });
            const stats = system.getStats();
            expect(stats.galaxyCount).toBe(2);
            expect(stats.totalGalaxies).toBe(2);
        });
    });
});
