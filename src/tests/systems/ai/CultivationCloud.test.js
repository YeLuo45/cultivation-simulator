/**
 * CultivationCloud.test.js - 修真云测试
 * V806 Iteration 9/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCloud } from '../../../systems/ai/CultivationCloud.js';

describe('CultivationCloud', () => {
    let system;
    beforeEach(() => { system = new CultivationCloud(); });

    describe('recruitCloud', () => {
        it('should recruit with default values', () => {
            const { cloud } = system.recruitCloud({ name: 'Cloud One' });
            expect(cloud.name).toBe('Cloud One');
            expect(cloud.type).toBe('cumulus');
            expect(cloud.volume).toBe(20);
            expect(cloud.level).toBe(1);
            expect(cloud.status).toBe('novice');
        });

        it('should support different types', () => {
            const { cloud: c1 } = system.recruitCloud({ type: 'stratus' });
            const { cloud: c2 } = system.recruitCloud({ type: 'celestial' });
            expect(c1.type).toBe('stratus');
            expect(c2.type).toBe('celestial');
        });

        it('should default to cumulus for invalid type', () => {
            const { cloud } = system.recruitCloud({ type: 'lava' });
            expect(cloud.type).toBe('cumulus');
        });

        it('should support master assignment', () => {
            const { cloud } = system.recruitCloud({ masterId: 'master_x' });
            expect(cloud.masterId).toBe('master_x');
        });

        it('should reject when max reached', () => {
            const sys = new CultivationCloud({ maxClouds: 2 });
            sys.recruitCloud({});
            sys.recruitCloud({});
            const result = sys.recruitCloud({});
            expect(result.error).toBe('MAX_CLOUDS_REACHED');
        });

        it('should trigger cloudRecruited hook', () => {
            let called = false;
            system.registerHook('cloudRecruited', () => { called = true; });
            system.recruitCloud({});
            expect(called).toBe(true);
        });
    });

    describe('getCloud', () => {
        it('should return cloud', () => {
            const { cloud } = system.recruitCloud({});
            expect(system.getCloud(cloud.cloudId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getCloud('ghost')).toBeNull();
        });
    });

    describe('listClouds', () => {
        it('should list all', () => {
            system.recruitCloud({});
            system.recruitCloud({});
            expect(system.listClouds().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listClouds()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitCloud({ masterId: 'm1' });
            system.recruitCloud({ masterId: 'm1' });
            system.recruitCloud({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { cloud } = system.recruitCloud({});
            system.legendCloud(cloud.cloudId);
            system.recruitCloud({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addShape', () => {
        it('should add a shape', () => {
            const { cloud } = system.recruitCloud({});
            const result = system.addShape(cloud.cloudId, { form: 'tower' });
            expect(result.success).toBe(true);
            expect(cloud.shapes.length).toBe(1);
        });

        it('should support multiple shapes', () => {
            const { cloud } = system.recruitCloud({});
            system.addShape(cloud.cloudId, { form: 'tower' });
            system.addShape(cloud.cloudId, { form: 'pillar' });
            expect(cloud.shapes.length).toBe(2);
        });

        it('should reject missing cloud', () => {
            const result = system.addShape('ghost', {});
            expect(result.error).toBe('CLOUD_NOT_FOUND');
        });

        it('should trigger shapeAdded hook', () => {
            const { cloud } = system.recruitCloud({});
            let called = false;
            system.registerHook('shapeAdded', () => { called = true; });
            system.addShape(cloud.cloudId, {});
            expect(called).toBe(true);
        });
    });

    describe('raiseVolume', () => {
        it('should raise volume by default amount', () => {
            const { cloud } = system.recruitCloud({});
            system.raiseVolume(cloud.cloudId);
            expect(cloud.volume).toBe(25);
        });

        it('should accept custom amount', () => {
            const { cloud } = system.recruitCloud({});
            system.raiseVolume(cloud.cloudId, 15);
            expect(cloud.volume).toBe(35);
        });

        it('should reject missing cloud', () => {
            const result = system.raiseVolume('ghost');
            expect(result.error).toBe('CLOUD_NOT_FOUND');
        });

        it('should trigger volumeRaised hook', () => {
            const { cloud } = system.recruitCloud({});
            let called = false;
            system.registerHook('volumeRaised', () => { called = true; });
            system.raiseVolume(cloud.cloudId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCloud', () => {
        it('should increment level', () => {
            const { cloud } = system.recruitCloud({});
            system.levelUpCloud(cloud.cloudId);
            expect(cloud.level).toBe(2);
        });

        it('should set veteran at level 10', () => {
            const { cloud } = system.recruitCloud({});
            for (let i = 0; i < 9; i++) system.levelUpCloud(cloud.cloudId);
            expect(cloud.status).toBe('veteran');
        });

        it('should reject missing cloud', () => {
            const result = system.levelUpCloud('ghost');
            expect(result.error).toBe('CLOUD_NOT_FOUND');
        });
    });

    describe('legendCloud', () => {
        it('should set legendary', () => {
            const { cloud } = system.recruitCloud({});
            system.legendCloud(cloud.cloudId);
            expect(cloud.status).toBe('legendary');
        });

        it('should reject missing cloud', () => {
            const result = system.legendCloud('ghost');
            expect(result.error).toBe('CLOUD_NOT_FOUND');
        });

        it('should trigger cloudLegendized hook', () => {
            const { cloud } = system.recruitCloud({});
            let called = false;
            system.registerHook('cloudLegendized', () => { called = true; });
            system.legendCloud(cloud.cloudId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCloudValue', () => {
        it('should calculate value', () => {
            const { cloud } = system.recruitCloud({});
            system.addShape(cloud.cloudId, {});
            const value = system.calculateCloudValue(cloud.cloudId);
            // level 1 * 100 + volume 20 * 2 + 1 shape * 30 = 100 + 40 + 30 = 170
            expect(value).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCloudValue('ghost')).toBe(0);
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

        it('should execute default getCloud', () => {
            const result = system.executeTool('getCloud', { cloudId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cloudRecruited', () => count++);
            unregister();
            system.recruitCloud({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cloudRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCloud({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient recruits', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.recruitCloud({});
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.recruitCloud({});
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCloud({});
            const json = system.toJSON();
            expect(json.clouds.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitCloud({});
            const json = system.toJSON();
            const newSys = new CultivationCloud();
            newSys.fromJSON(json);
            expect(newSys.clouds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with counts', () => {
            const { cloud } = system.recruitCloud({});
            system.legendCloud(cloud.cloudId);
            const stats = system.getStats();
            expect(stats.cloudCount).toBe(1);
            expect(stats.legendaryCount).toBe(1);
            expect(stats.totalRecruited).toBe(1);
        });
    });
});
