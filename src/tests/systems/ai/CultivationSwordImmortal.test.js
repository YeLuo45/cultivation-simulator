/**
 * CultivationSwordImmortal.test.js - 修真剑仙测试
 * V634 Iteration 17/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSwordImmortal } from '../../../systems/ai/CultivationSwordImmortal.js';

describe('CultivationSwordImmortal', () => {
    let system;
    beforeEach(() => { system = new CultivationSwordImmortal(); });

    describe('recruitSwordImmortal', () => {
        it('should create', () => {
            const { swordImmortal } = system.recruitSwordImmortal({ name: 'Azure Sword' });
            expect(swordImmortal.name).toBe('Azure Sword');
        });

        it('should set default type', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            expect(swordImmortal.type).toBe('celestial');
        });

        it('should set default status to novice', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            expect(swordImmortal.status).toBe('novice');
        });

        it('should trigger swordImmortalRecruited hook', () => {
            let called = false;
            system.registerHook('swordImmortalRecruited', () => { called = true; });
            system.recruitSwordImmortal({});
            expect(called).toBe(true);
        });
    });

    describe('getSwordImmortal', () => {
        it('should return', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            expect(system.getSwordImmortal(swordImmortal.immortalId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSwordImmortal('ghost')).toBeNull(); });
    });

    describe('listSwordImmortals', () => {
        it('should list all', () => {
            system.recruitSwordImmortal({});
            expect(system.listSwordImmortals().length).toBe(1);
        });
        it('should return empty initially', () => {
            expect(system.listSwordImmortals().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitSwordImmortal({ masterId: 'm1' });
            system.recruitSwordImmortal({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter by celestial', () => {
            system.recruitSwordImmortal({ type: 'celestial' });
            system.recruitSwordImmortal({ type: 'phantom' });
            expect(system.listByType('celestial').length).toBe(1);
        });

        it('should filter by phantom', () => {
            system.recruitSwordImmortal({ type: 'celestial' });
            system.recruitSwordImmortal({ type: 'phantom' });
            expect(system.listByType('phantom').length).toBe(1);
        });

        it('should filter by soul', () => {
            system.recruitSwordImmortal({ type: 'soul' });
            system.recruitSwordImmortal({ type: 'celestial' });
            expect(system.listByType('soul').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should return empty when none', () => {
            system.recruitSwordImmortal({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should filter legendary status', () => {
            const { swordImmortal: si1 } = system.recruitSwordImmortal({});
            const { swordImmortal: si2 } = system.recruitSwordImmortal({});
            system.legendSwordImmortal(si2.immortalId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('listByImmortality', () => {
        it('should filter', () => {
            system.recruitSwordImmortal({ immortality: 20 });
            system.recruitSwordImmortal({ immortality: 200 });
            expect(system.listByImmortality(100).length).toBe(1);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.recruitSwordImmortal({});
            system.recruitSwordImmortal({});
            expect(system.listTop(2).length).toBe(2);
        });
    });

    describe('addSwordArt', () => {
        it('should add', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            system.addSwordArt(swordImmortal.immortalId, 'celestial-slash');
            expect(swordImmortal.swordArts.length).toBe(1);
        });

        it('should add multiple arts', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            system.addSwordArt(swordImmortal.immortalId, 'celestial-slash');
            system.addSwordArt(swordImmortal.immortalId, 'phantom-strike');
            expect(swordImmortal.swordArts.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSwordArt('ghost', 'celestial-slash');
            expect(result.error).toBe('SWORDIMMORTAL_NOT_FOUND');
        });

        it('should trigger swordArtAdded hook', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            let called = false;
            system.registerHook('swordArtAdded', () => { called = true; });
            system.addSwordArt(swordImmortal.immortalId, 'celestial-slash');
            expect(called).toBe(true);
        });
    });

    describe('deepenImmortality', () => {
        it('should deepen with default amount', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            system.deepenImmortality(swordImmortal.immortalId);
            expect(swordImmortal.immortality).toBe(25);
        });

        it('should deepen with custom amount', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            system.deepenImmortality(swordImmortal.immortalId, 30);
            expect(swordImmortal.immortality).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.deepenImmortality('ghost', 5);
            expect(result.error).toBe('SWORDIMMORTAL_NOT_FOUND');
        });

        it('should trigger immortalityDeepened hook', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            let called = false;
            system.registerHook('immortalityDeepened', () => { called = true; });
            system.deepenImmortality(swordImmortal.immortalId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSwordImmortal', () => {
        it('should level up', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            system.levelUpSwordImmortal(swordImmortal.immortalId);
            expect(swordImmortal.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            system.levelUpSwordImmortal(swordImmortal.immortalId);
            system.levelUpSwordImmortal(swordImmortal.immortalId);
            system.levelUpSwordImmortal(swordImmortal.immortalId);
            expect(swordImmortal.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpSwordImmortal('ghost');
            expect(result.error).toBe('SWORDIMMORTAL_NOT_FOUND');
        });

        it('should trigger swordImmortalLeveledUp hook', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            let called = false;
            system.registerHook('swordImmortalLeveledUp', () => { called = true; });
            system.levelUpSwordImmortal(swordImmortal.immortalId);
            expect(called).toBe(true);
        });
    });

    describe('legendSwordImmortal', () => {
        it('should legend', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            system.legendSwordImmortal(swordImmortal.immortalId);
            expect(swordImmortal.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSwordImmortal('ghost');
            expect(result.error).toBe('SWORDIMMORTAL_NOT_FOUND');
        });

        it('should trigger swordImmortalLegendized hook', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            let called = false;
            system.registerHook('swordImmortalLegendized', () => { called = true; });
            system.legendSwordImmortal(swordImmortal.immortalId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSwordImmortalValue', () => {
        it('should calculate default', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            // level=1, immortality=20, swordArts=[] => 100 + 40 + 0 = 140
            expect(system.calculateSwordImmortalValue(swordImmortal.immortalId)).toBe(140);
        });

        it('should calculate with level and arts', () => {
            const { swordImmortal } = system.recruitSwordImmortal({});
            system.levelUpSwordImmortal(swordImmortal.immortalId);
            system.addSwordArt(swordImmortal.immortalId, 'celestial-slash');
            system.addSwordArt(swordImmortal.immortalId, 'phantom-strike');
            // level=2, immortality=20, swordArts.length=2 => 200 + 40 + 60 = 300
            expect(system.calculateSwordImmortalValue(swordImmortal.immortalId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSwordImmortalValue('ghost')).toBe(0);
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

        it('should execute default getSwordImmortal', () => {
            const result = system.executeTool('getSwordImmortal', { immortalId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('swordImmortalRecruited', () => count++);
            unregister();
            system.recruitSwordImmortal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('swordImmortalRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSwordImmortal({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSwordImmortals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSwordImmortals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSwordImmortal({});
            const json = system.toJSON();
            expect(json.swordimmortals.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSwordImmortal({});
            const json = system.toJSON();
            const newSys = new CultivationSwordImmortal();
            newSys.fromJSON(json);
            expect(newSys.swordimmortals.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.swordImmortalCount).toBe(0);
        });
    });
});
