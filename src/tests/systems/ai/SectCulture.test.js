/**
 * SectCulture.test.js - 宗门文化测试
 * V486 Iteration 3/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectCulture } from '../../../systems/ai/SectCulture.js';

describe('SectCulture', () => {
    let system;
    beforeEach(() => { system = new SectCulture(); });

    describe('cultivateCulture', () => {
        it('should cultivate', () => {
            const { culture } = system.cultivateCulture({ sectId: 's1', name: 'Azure Sky', type: 'scholarly' });
            expect(culture.sectId).toBe('s1');
            expect(culture.name).toBe('Azure Sky');
            expect(culture.type).toBe('scholarly');
        });

        it('should default to scholarly', () => {
            const { culture } = system.cultivateCulture({ sectId: 's1', name: 'X' });
            expect(culture.type).toBe('scholarly');
        });

        it('should start with growing status', () => {
            const { culture } = system.cultivateCulture({ sectId: 's1', name: 'X' });
            expect(culture.status).toBe('growing');
        });

        it('should trigger cultureCultivated hook', () => {
            let called = false;
            system.registerHook('cultureCultivated', () => { called = true; });
            system.cultivateCulture({});
            expect(called).toBe(true);
        });
    });

    describe('getCulture', () => {
        it('should return', () => {
            const { culture } = system.cultivateCulture({});
            expect(system.getCulture(culture.cultureId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCulture('ghost')).toBeNull(); });
    });

    describe('listCultures', () => {
        it('should list all', () => {
            system.cultivateCulture({});
            system.cultivateCulture({});
            expect(system.listCultures().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listCultures().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.cultivateCulture({ sectId: 's1' });
            system.cultivateCulture({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.cultivateCulture({ type: 'martial' });
            system.cultivateCulture({ type: 'scholarly' });
            system.cultivateCulture({ type: 'martial' });
            expect(system.listByType('martial').length).toBe(2);
        });
    });

    describe('addCustom', () => {
        it('should add custom', () => {
            const { culture } = system.cultivateCulture({});
            system.addCustom(culture.cultureId, 'bow on greeting');
            expect(culture.customs).toContain('bow on greeting');
        });

        it('should reject missing culture', () => {
            const result = system.addCustom('ghost', 'x');
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger customAdded hook', () => {
            const { culture } = system.cultivateCulture({});
            let called = false;
            system.registerHook('customAdded', () => { called = true; });
            system.addCustom(culture.cultureId, 'incense');
            expect(called).toBe(true);
        });

        it('should set status to flourishing at 10 customs', () => {
            const { culture } = system.cultivateCulture({});
            for (let i = 0; i < 10; i++) system.addCustom(culture.cultureId, `c${i}`);
            expect(culture.status).toBe('flourishing');
        });
    });

    describe('recruitMember', () => {
        it('should recruit member', () => {
            const { culture } = system.cultivateCulture({});
            system.recruitMember(culture.cultureId, 'Li Wei');
            expect(culture.members).toBe(1);
        });

        it('should reject missing culture', () => {
            const result = system.recruitMember('ghost', 'x');
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger memberRecruited hook', () => {
            const { culture } = system.cultivateCulture({});
            let called = false;
            system.registerHook('memberRecruited', () => { called = true; });
            system.recruitMember(culture.cultureId, 'Li Wei');
            expect(called).toBe(true);
        });

        it('should accumulate members', () => {
            const { culture } = system.cultivateCulture({});
            system.recruitMember(culture.cultureId, 'a');
            system.recruitMember(culture.cultureId, 'b');
            system.recruitMember(culture.cultureId, 'c');
            expect(culture.members).toBe(3);
        });
    });

    describe('legendaryStatus', () => {
        it('should set to legendary', () => {
            const { culture } = system.cultivateCulture({});
            system.legendaryStatus(culture.cultureId);
            expect(culture.status).toBe('legendary');
        });

        it('should reject missing culture', () => {
            const result = system.legendaryStatus('ghost');
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger cultureLegendary hook', () => {
            const { culture } = system.cultivateCulture({});
            let called = false;
            system.registerHook('cultureLegendary', () => { called = true; });
            system.legendaryStatus(culture.cultureId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCulturalValue', () => {
        it('should calculate', () => {
            const { culture } = system.cultivateCulture({});
            system.addCustom(culture.cultureId, 'a');
            system.addCustom(culture.cultureId, 'b');
            system.recruitMember(culture.cultureId, 'x');
            system.recruitMember(culture.cultureId, 'y');
            system.recruitMember(culture.cultureId, 'z');
            // customs.length(2) * 10 + members(3) * 3 = 20 + 9 = 29
            expect(system.calculateCulturalValue(culture.cultureId)).toBe(29);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCulturalValue('ghost')).toBe(0);
        });

        it('should handle zero customs and members', () => {
            const { culture } = system.cultivateCulture({});
            expect(system.calculateCulturalValue(culture.cultureId)).toBe(0);
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

        it('should execute default getCulture tool', () => {
            const result = system.executeTool('getCulture', { cultureId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cultureCultivated', () => count++);
            unregister();
            system.cultivateCulture({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cultureCultivated', () => { throw new Error('x'); });
            expect(() => system.cultivateCulture({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCultures = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCultures = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.cultivateCulture({});
            const json = system.toJSON();
            expect(json.cultures.length).toBe(1);
        });
        it('should deserialize', () => {
            system.cultivateCulture({});
            const json = system.toJSON();
            const newSys = new SectCulture();
            newSys.fromJSON(json);
            expect(newSys.cultures.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultureCount).toBe(0);
        });
    });
});
