/**
 * CultivationBrewer.test.js - 修真酿造系统测试
 * V709 Iteration 2/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBrewer } from '../../../systems/ai/CultivationBrewer.js';

describe('CultivationBrewer', () => {
    let system;
    beforeEach(() => { system = new CultivationBrewer(); });

    describe('recruitBrewer', () => {
        it('should recruit', () => {
            const { brewer } = system.recruitBrewer({ masterId: 'm1', name: 'Duke of Spirits' });
            expect(brewer.name).toBe('Duke of Spirits');
            expect(brewer.masterId).toBe('m1');
            expect(brewer.status).toBe('novice');
            expect(brewer.level).toBe(1);
            expect(brewer.brewing).toBe(20);
        });

        it('should use default type', () => {
            const { brewer } = system.recruitBrewer({});
            expect(brewer.type).toBe('wine');
        });

        it('should accept custom type', () => {
            const { brewer } = system.recruitBrewer({ type: 'elixir' });
            expect(brewer.type).toBe('elixir');
        });

        it('should accept custom id', () => {
            const { brewer } = system.recruitBrewer({ brewerId: 'custom_brw_1' });
            expect(brewer.brewerId).toBe('custom_brw_1');
        });

        it('should trigger brewerRecruited hook', () => {
            let called = false;
            system.registerHook('brewerRecruited', () => { called = true; });
            system.recruitBrewer({});
            expect(called).toBe(true);
        });
    });

    describe('getBrewer', () => {
        it('should return', () => {
            const { brewer } = system.recruitBrewer({});
            expect(system.getBrewer(brewer.brewerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBrewer('ghost')).toBeNull(); });
    });

    describe('listBrewers', () => {
        it('should list all', () => {
            system.recruitBrewer({});
            system.recruitBrewer({});
            expect(system.listBrewers().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listBrewers().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitBrewer({ masterId: 'm1' });
            system.recruitBrewer({ masterId: 'm2' });
            system.recruitBrewer({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
        it('should return empty for unknown', () => {
            system.recruitBrewer({});
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { brewer: b1 } = system.recruitBrewer({});
            const { brewer: b2 } = system.recruitBrewer({});
            system.legendBrewer(b1.brewerId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addBrew', () => {
        it('should add brew', () => {
            const { brewer } = system.recruitBrewer({});
            system.addBrew(brewer.brewerId, { name: 'Jade Nectar', potency: 5 });
            expect(brewer.brews.length).toBe(1);
        });

        it('should reject missing brewer', () => {
            const result = system.addBrew('ghost', { name: 'x' });
            expect(result.error).toBe('BREWER_NOT_FOUND');
        });

        it('should trigger brewAdded hook', () => {
            const { brewer } = system.recruitBrewer({});
            let called = false;
            system.registerHook('brewAdded', () => { called = true; });
            system.addBrew(brewer.brewerId, { name: 'Elixir' });
            expect(called).toBe(true);
        });
    });

    describe('raiseBrewing', () => {
        it('should raise with default amount', () => {
            const { brewer } = system.recruitBrewer({});
            system.raiseBrewing(brewer.brewerId);
            expect(brewer.brewing).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { brewer } = system.recruitBrewer({});
            system.raiseBrewing(brewer.brewerId, 15);
            expect(brewer.brewing).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.raiseBrewing('ghost');
            expect(result.error).toBe('BREWER_NOT_FOUND');
        });

        it('should trigger brewingRaised hook', () => {
            const { brewer } = system.recruitBrewer({});
            let called = false;
            system.registerHook('brewingRaised', () => { called = true; });
            system.raiseBrewing(brewer.brewerId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBrewer', () => {
        it('should level up', () => {
            const { brewer } = system.recruitBrewer({});
            system.levelUpBrewer(brewer.brewerId);
            expect(brewer.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { brewer } = system.recruitBrewer({});
            system.levelUpBrewer(brewer.brewerId);
            system.levelUpBrewer(brewer.brewerId);
            system.levelUpBrewer(brewer.brewerId);
            expect(brewer.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpBrewer('ghost');
            expect(result.error).toBe('BREWER_NOT_FOUND');
        });

        it('should trigger brewerLeveledUp hook', () => {
            const { brewer } = system.recruitBrewer({});
            let called = false;
            system.registerHook('brewerLeveledUp', () => { called = true; });
            system.levelUpBrewer(brewer.brewerId);
            expect(called).toBe(true);
        });
    });

    describe('legendBrewer', () => {
        it('should set status to legendary', () => {
            const { brewer } = system.recruitBrewer({});
            system.legendBrewer(brewer.brewerId);
            expect(brewer.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBrewer('ghost');
            expect(result.error).toBe('BREWER_NOT_FOUND');
        });

        it('should trigger brewerLegendized hook', () => {
            const { brewer } = system.recruitBrewer({});
            let called = false;
            system.registerHook('brewerLegendized', () => { called = true; });
            system.legendBrewer(brewer.brewerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBrewerValue', () => {
        it('should calculate', () => {
            const { brewer } = system.recruitBrewer({});
            system.levelUpBrewer(brewer.brewerId);
            system.raiseBrewing(brewer.brewerId, 10);
            system.addBrew(brewer.brewerId, { name: 'Brew1' });
            // level=2, brewing=30, brews=1: 2*100 + 30*2 + 1*30 = 200+60+30 = 290
            expect(system.calculateBrewerValue(brewer.brewerId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBrewerValue('ghost')).toBe(0);
        });

        it('should calculate with multiple brews', () => {
            const { brewer } = system.recruitBrewer({});
            system.addBrew(brewer.brewerId, { name: 'b1' });
            system.addBrew(brewer.brewerId, { name: 'b2' });
            system.addBrew(brewer.brewerId, { name: 'b3' });
            // level=1, brewing=20, brews=3: 100+40+90 = 230
            expect(system.calculateBrewerValue(brewer.brewerId)).toBe(230);
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

        it('should execute default getBrewer tool', () => {
            const { brewer } = system.recruitBrewer({ name: 'TestBrewer' });
            const result = system.executeTool('getBrewer', { brewerId: brewer.brewerId });
            expect(result.result.name).toBe('TestBrewer');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('brewerRecruited', () => count++);
            unregister();
            system.recruitBrewer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('brewerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBrewer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBrewers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBrewers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBrewer({});
            const json = system.toJSON();
            expect(json.brewers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBrewer({ name: 'Master Brewer' });
            const json = system.toJSON();
            const newSys = new CultivationBrewer();
            newSys.fromJSON(json);
            expect(newSys.brewers.size).toBe(1);
            expect(newSys.getStats().totalBrewers).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.brewerCount).toBe(0);
            expect(stats.totalBrewers).toBe(0);
        });
    });
});
