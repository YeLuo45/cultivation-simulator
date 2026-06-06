/**
 * CultivationFounder.test.js - 修真祖师测试
 * V666 Iteration 19/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFounder } from '../../../systems/ai/CultivationFounder.js';

describe('CultivationFounder', () => {
    let system;
    beforeEach(() => { system = new CultivationFounder(); });

    describe('recruitFounder', () => {
        it('should recruit a founder', () => {
            const { founder } = system.recruitFounder({ sectId: 's1', name: 'Founder Zhang', type: 'ancient' });
            expect(founder.sectId).toBe('s1');
            expect(founder.name).toBe('Founder Zhang');
            expect(founder.type).toBe('ancient');
            expect(founder.status).toBe('novice');
            expect(founder.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { founder } = system.recruitFounder({});
            expect(founder.name).toBe('Unnamed Founder');
            expect(founder.type).toBe('original');
            expect(founder.legacy).toBe(20);
            expect(founder.techniques).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { founder } = system.recruitFounder({});
            expect(founder.founderId).toBeTruthy();
            expect(typeof founder.founderId).toBe('string');
        });

        it('should use provided founderId', () => {
            const { founder } = system.recruitFounder({ founderId: 'custom-founder-1' });
            expect(founder.founderId).toBe('custom-founder-1');
        });

        it('should trigger founderRecruited hook', () => {
            let called = false;
            system.registerHook('founderRecruited', () => { called = true; });
            system.recruitFounder({});
            expect(called).toBe(true);
        });

        it('should increment totalFounders stat', () => {
            expect(system.stats.totalFounders).toBe(0);
            system.recruitFounder({});
            expect(system.stats.totalFounders).toBe(1);
            system.recruitFounder({});
            expect(system.stats.totalFounders).toBe(2);
        });

        it('should accept legendary type', () => {
            const { founder } = system.recruitFounder({ type: 'legendary' });
            expect(founder.type).toBe('legendary');
        });

        it('should accept ancient type', () => {
            const { founder } = system.recruitFounder({ type: 'ancient' });
            expect(founder.type).toBe('ancient');
        });

        it('should accept original type', () => {
            const { founder } = system.recruitFounder({ type: 'original' });
            expect(founder.type).toBe('original');
        });

        it('should accept provided techniques', () => {
            const { founder } = system.recruitFounder({ techniques: ['sword-art', 'qi-control'] });
            expect(founder.techniques.length).toBe(2);
            expect(founder.techniques[0]).toBe('sword-art');
        });
    });

    describe('getFounder', () => {
        it('should return a founder', () => {
            const { founder } = system.recruitFounder({});
            expect(system.getFounder(founder.founderId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getFounder('ghost')).toBeNull();
        });
        it('should return a copy, not a reference', () => {
            const { founder } = system.recruitFounder({});
            const got = system.getFounder(founder.founderId);
            got.name = 'Modified';
            expect(founder.name).toBe('Unnamed Founder');
        });
    });

    describe('listFounders', () => {
        it('should list all', () => {
            system.recruitFounder({});
            system.recruitFounder({});
            expect(system.listFounders().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listFounders().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.recruitFounder({ sectId: 's1' });
            system.recruitFounder({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitFounder({ sectId: 's1' });
            expect(system.listBySect('ghost')).toEqual([]);
        });

        it('should return multiple in same sect', () => {
            system.recruitFounder({ sectId: 's1' });
            system.recruitFounder({ sectId: 's1' });
            system.recruitFounder({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { founder: f1 } = system.recruitFounder({});
            system.recruitFounder({});
            system.legendFounder(f1.founderId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitFounder({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should return all legendary founders', () => {
            const { founder: f1 } = system.recruitFounder({});
            const { founder: f2 } = system.recruitFounder({});
            system.legendFounder(f1.founderId);
            system.legendFounder(f2.founderId);
            expect(system.listLegendary().length).toBe(2);
        });
    });

    describe('addTechnique', () => {
        it('should add technique', () => {
            const { founder } = system.recruitFounder({});
            system.addTechnique(founder.founderId, 'flying-sword');
            expect(founder.techniques.length).toBe(1);
            expect(founder.techniques[0]).toBe('flying-sword');
        });

        it('should reject missing', () => {
            const result = system.addTechnique('ghost', 'x');
            expect(result.error).toBe('FOUNDER_NOT_FOUND');
        });

        it('should trigger techniqueAdded hook', () => {
            const { founder } = system.recruitFounder({});
            let called = false;
            system.registerHook('techniqueAdded', () => { called = true; });
            system.addTechnique(founder.founderId, 'sword-art');
            expect(called).toBe(true);
        });

        it('should add multiple techniques', () => {
            const { founder } = system.recruitFounder({});
            system.addTechnique(founder.founderId, 't1');
            system.addTechnique(founder.founderId, 't2');
            system.addTechnique(founder.founderId, 't3');
            expect(founder.techniques.length).toBe(3);
        });
    });

    describe('strengthenLegacy', () => {
        it('should strengthen legacy', () => {
            const { founder } = system.recruitFounder({});
            system.strengthenLegacy(founder.founderId, 10);
            expect(founder.legacy).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { founder } = system.recruitFounder({});
            system.strengthenLegacy(founder.founderId);
            expect(founder.legacy).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.strengthenLegacy('ghost', 5);
            expect(result.error).toBe('FOUNDER_NOT_FOUND');
        });

        it('should trigger legacyStrengthened hook', () => {
            const { founder } = system.recruitFounder({});
            let called = false;
            system.registerHook('legacyStrengthened', () => { called = true; });
            system.strengthenLegacy(founder.founderId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFounder', () => {
        it('should level up', () => {
            const { founder } = system.recruitFounder({});
            system.levelUpFounder(founder.founderId);
            expect(founder.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { founder } = system.recruitFounder({});
            system.levelUpFounder(founder.founderId);
            system.levelUpFounder(founder.founderId);
            system.levelUpFounder(founder.founderId);
            expect(founder.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpFounder('ghost');
            expect(result.error).toBe('FOUNDER_NOT_FOUND');
        });

        it('should trigger founderLeveledUp hook', () => {
            const { founder } = system.recruitFounder({});
            let called = false;
            system.registerHook('founderLeveledUp', () => { called = true; });
            system.levelUpFounder(founder.founderId);
            expect(called).toBe(true);
        });
    });

    describe('legendFounder', () => {
        it('should set status to legendary', () => {
            const { founder } = system.recruitFounder({});
            system.legendFounder(founder.founderId);
            expect(founder.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendFounder('ghost');
            expect(result.error).toBe('FOUNDER_NOT_FOUND');
        });

        it('should trigger founderLegendized hook', () => {
            const { founder } = system.recruitFounder({});
            let called = false;
            system.registerHook('founderLegendized', () => { called = true; });
            system.legendFounder(founder.founderId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFounderValue', () => {
        it('should calculate value', () => {
            const { founder } = system.recruitFounder({});
            system.addTechnique(founder.founderId, 't1');
            // level=1, legacy=20 (default baseLegacy), techniques=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateFounderValue(founder.founderId)).toBe(170);
        });

        it('should reflect level and legacy changes', () => {
            const { founder } = system.recruitFounder({});
            system.levelUpFounder(founder.founderId);
            system.strengthenLegacy(founder.founderId, 10);
            // level=2, legacy=30, techniques=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateFounderValue(founder.founderId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFounderValue('ghost')).toBe(0);
        });

        it('should reflect multiple techniques', () => {
            const { founder } = system.recruitFounder({});
            system.addTechnique(founder.founderId, 't1');
            system.addTechnique(founder.founderId, 't2');
            // level=1, legacy=20, techniques=2
            // 1*100 + 20*2 + 2*30 = 100 + 40 + 60 = 200
            expect(system.calculateFounderValue(founder.founderId)).toBe(200);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getFounder', () => {
            const result = system.executeTool('getFounder', { founderId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitFounder', () => {
            const result = system.executeTool('recruitFounder', { name: 'ToolFounder' });
            expect(result.success).toBe(true);
            expect(result.result.founder.name).toBe('ToolFounder');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('founderRecruited', () => count++);
            unregister();
            system.recruitFounder({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('founderRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitFounder({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFounders = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalFounders = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitFounder({});
            const json = system.toJSON();
            expect(json.founders.length).toBe(1);
            expect(json.stats.totalFounders).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitFounder({});
            const json = system.toJSON();
            const newSys = new CultivationFounder();
            newSys.fromJSON(json);
            expect(newSys.founders.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.founderCount).toBe(0);
            expect(stats.totalFounders).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });

    describe('Config', () => {
        it('should use default config', () => {
            expect(system.config.maxFounders).toBe(5);
            expect(system.config.baseLegacy).toBe(20);
        });
        it('should accept custom config', () => {
            const custom = new CultivationFounder({ maxFounders: 50, baseLegacy: 100 });
            expect(custom.config.maxFounders).toBe(50);
            expect(custom.config.baseLegacy).toBe(100);
        });
    });
});
