/**
 * CultivationShrine.test.js - 修真祠庙测试
 * V715 Iteration 8/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationShrine } from '../../../systems/ai/CultivationShrine.js';

describe('CultivationShrine', () => {
    let system;
    beforeEach(() => { system = new CultivationShrine(); });

    describe('recruitShrine', () => {
        it('should recruit', () => {
            const { shrine } = system.recruitShrine({ masterId: 'm1', name: 'shrine1' });
            expect(shrine.masterId).toBe('m1');
            expect(shrine.name).toBe('shrine1');
        });

        it('should default name and worship', () => {
            const { shrine } = system.recruitShrine({});
            expect(shrine.name).toBe('unnamed-shrine');
            expect(shrine.worship).toBe(20);
            expect(shrine.type).toBe('ancestor');
            expect(shrine.status).toBe('novice');
            expect(shrine.level).toBe(1);
        });

        it('should accept custom worship', () => {
            const { shrine } = system.recruitShrine({ worship: 100 });
            expect(shrine.worship).toBe(100);
        });

        it('should accept relics at creation', () => {
            const { shrine } = system.recruitShrine({ relics: [{ name: 'r1' }] });
            expect(shrine.relics.length).toBe(1);
        });

        it('should trigger shrineRecruited hook', () => {
            let called = false;
            system.registerHook('shrineRecruited', () => { called = true; });
            system.recruitShrine({});
            expect(called).toBe(true);
        });
    });

    describe('getShrine', () => {
        it('should return', () => {
            const { shrine } = system.recruitShrine({});
            expect(system.getShrine(shrine.shrineId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getShrine('ghost')).toBeNull(); });
    });

    describe('listShrines', () => {
        it('should list all', () => {
            system.recruitShrine({});
            expect(system.listShrines().length).toBe(1);
        });

        it('should return empty list initially', () => {
            expect(system.listShrines().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitShrine({ masterId: 'm1' });
            system.recruitShrine({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitShrine({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { shrine: s1 } = system.recruitShrine({});
            system.recruitShrine({});
            system.legendShrine(s1.shrineId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitShrine({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addRelic', () => {
        it('should add relic', () => {
            const { shrine } = system.recruitShrine({});
            const result = system.addRelic(shrine.shrineId, { name: 'relic1' });
            expect(result.success).toBe(true);
            expect(shrine.relics.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addRelic('ghost', { name: 'relic1' });
            expect(result.error).toBe('SHRINE_NOT_FOUND');
        });

        it('should trigger relicAdded hook', () => {
            const { shrine } = system.recruitShrine({});
            let called = false;
            system.registerHook('relicAdded', () => { called = true; });
            system.addRelic(shrine.shrineId, { name: 'r' });
            expect(called).toBe(true);
        });
    });

    describe('raiseWorship', () => {
        it('should raise default amount', () => {
            const { shrine } = system.recruitShrine({});
            system.raiseWorship(shrine.shrineId);
            expect(shrine.worship).toBe(25);
        });

        it('should raise custom amount', () => {
            const { shrine } = system.recruitShrine({});
            system.raiseWorship(shrine.shrineId, 50);
            expect(shrine.worship).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.raiseWorship('ghost', 10);
            expect(result.error).toBe('SHRINE_NOT_FOUND');
        });

        it('should trigger worshipRaised hook', () => {
            const { shrine } = system.recruitShrine({});
            let called = false;
            system.registerHook('worshipRaised', () => { called = true; });
            system.raiseWorship(shrine.shrineId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpShrine', () => {
        it('should level up', () => {
            const { shrine } = system.recruitShrine({});
            system.levelUpShrine(shrine.shrineId);
            expect(shrine.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpShrine('ghost');
            expect(result.error).toBe('SHRINE_NOT_FOUND');
        });

        it('should trigger shrineLeveledUp hook', () => {
            const { shrine } = system.recruitShrine({});
            let called = false;
            system.registerHook('shrineLeveledUp', () => { called = true; });
            system.levelUpShrine(shrine.shrineId);
            expect(called).toBe(true);
        });
    });

    describe('legendShrine', () => {
        it('should legendize', () => {
            const { shrine } = system.recruitShrine({});
            system.legendShrine(shrine.shrineId);
            expect(shrine.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendShrine('ghost');
            expect(result.error).toBe('SHRINE_NOT_FOUND');
        });

        it('should trigger shrineLegendized hook', () => {
            const { shrine } = system.recruitShrine({});
            let called = false;
            system.registerHook('shrineLegendized', () => { called = true; });
            system.legendShrine(shrine.shrineId);
            expect(called).toBe(true);
        });
    });

    describe('calculateShrineValue', () => {
        it('should calculate', () => {
            const { shrine } = system.recruitShrine({ worship: 50, relics: [{ name: 'r1' }, { name: 'r2' }] });
            system.levelUpShrine(shrine.shrineId);
            const value = system.calculateShrineValue(shrine.shrineId);
            expect(value).toBe(2 * 100 + 50 * 2 + 2 * 30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateShrineValue('ghost')).toBe(0);
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

        it('should execute default getShrine', () => {
            const result = system.executeTool('getShrine', { shrineId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context', () => {
            system.registerTool('noctx', () => 'ok');
            const result = system.executeTool('noctx');
            expect(result.result).toBe('ok');
        });

        it('should execute default recruitShrine', () => {
            const result = system.executeTool('recruitShrine', { masterId: 'm1' });
            expect(result.result.shrine.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('shrineRecruited', () => count++);
            unregister();
            system.recruitShrine({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('shrineRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitShrine({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalShrines = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalShrines = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitShrine({});
            const json = system.toJSON();
            expect(json.shrines.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitShrine({});
            const json = system.toJSON();
            const newSys = new CultivationShrine();
            newSys.fromJSON(json);
            expect(newSys.shrines.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.shrineCount).toBe(0);
        });
    });
});
