/**
 * CultivationImmortal.test.js - 修真仙人测试
 * V669 Iteration 22/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationImmortal } from '../../../systems/ai/CultivationImmortal.js';

describe('CultivationImmortal', () => {
    let system;
    beforeEach(() => { system = new CultivationImmortal(); });

    describe('recruitImmortal', () => {
        it('should create', () => {
            const { immortal } = system.recruitImmortal({ name: 'Heavenly Sage' });
            expect(immortal.name).toBe('Heavenly Sage');
        });

        it('should set default type to celestial', () => {
            const { immortal } = system.recruitImmortal({});
            expect(immortal.type).toBe('celestial');
        });

        it('should set default status to novice', () => {
            const { immortal } = system.recruitImmortal({});
            expect(immortal.status).toBe('novice');
        });

        it('should trigger immortalRecruited hook', () => {
            let called = false;
            system.registerHook('immortalRecruited', () => { called = true; });
            system.recruitImmortal({});
            expect(called).toBe(true);
        });
    });

    describe('getImmortal', () => {
        it('should return', () => {
            const { immortal } = system.recruitImmortal({});
            expect(system.getImmortal(immortal.immortalId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getImmortal('ghost')).toBeNull(); });
    });

    describe('listImmortals', () => {
        it('should list all', () => {
            system.recruitImmortal({});
            expect(system.listImmortals().length).toBe(1);
        });
        it('should return empty initially', () => {
            expect(system.listImmortals().length).toBe(0);
        });
    });

    describe('listByElder', () => {
        it('should filter by elderId', () => {
            system.recruitImmortal({ elderId: 'e1' });
            system.recruitImmortal({ elderId: 'e2' });
            expect(system.listByElder('e1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter by celestial', () => {
            system.recruitImmortal({ type: 'celestial' });
            system.recruitImmortal({ type: 'earthly' });
            expect(system.listByType('celestial').length).toBe(1);
        });

        it('should filter by earthly', () => {
            system.recruitImmortal({ type: 'celestial' });
            system.recruitImmortal({ type: 'earthly' });
            expect(system.listByType('earthly').length).toBe(1);
        });

        it('should filter by divine', () => {
            system.recruitImmortal({ type: 'divine' });
            system.recruitImmortal({ type: 'celestial' });
            expect(system.listByType('divine').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should return empty when none', () => {
            system.recruitImmortal({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should filter legendary status', () => {
            const { immortal: i1 } = system.recruitImmortal({});
            const { immortal: i2 } = system.recruitImmortal({});
            system.legendImmortal(i2.immortalId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('listByImmortality', () => {
        it('should filter by min immortality', () => {
            system.recruitImmortal({ immortality: 20 });
            system.recruitImmortal({ immortality: 200 });
            expect(system.listByImmortality(100).length).toBe(1);
        });
    });

    describe('listTop', () => {
        it('should return top immortals', () => {
            system.recruitImmortal({});
            system.recruitImmortal({});
            expect(system.listTop(2).length).toBe(2);
        });
    });

    describe('addSpell', () => {
        it('should add a spell', () => {
            const { immortal } = system.recruitImmortal({});
            system.addSpell(immortal.immortalId, 'celestial-bolt');
            expect(immortal.spells.length).toBe(1);
        });

        it('should add multiple spells', () => {
            const { immortal } = system.recruitImmortal({});
            system.addSpell(immortal.immortalId, 'celestial-bolt');
            system.addSpell(immortal.immortalId, 'earth-shake');
            expect(immortal.spells.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSpell('ghost', 'celestial-bolt');
            expect(result.error).toBe('IMMORTAL_NOT_FOUND');
        });

        it('should trigger spellAdded hook', () => {
            const { immortal } = system.recruitImmortal({});
            let called = false;
            system.registerHook('spellAdded', () => { called = true; });
            system.addSpell(immortal.immortalId, 'celestial-bolt');
            expect(called).toBe(true);
        });
    });

    describe('deepenImmortality', () => {
        it('should deepen with default amount', () => {
            const { immortal } = system.recruitImmortal({});
            system.deepenImmortality(immortal.immortalId);
            expect(immortal.immortality).toBe(25);
        });

        it('should deepen with custom amount', () => {
            const { immortal } = system.recruitImmortal({});
            system.deepenImmortality(immortal.immortalId, 30);
            expect(immortal.immortality).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.deepenImmortality('ghost', 5);
            expect(result.error).toBe('IMMORTAL_NOT_FOUND');
        });

        it('should trigger immortalityDeepened hook', () => {
            const { immortal } = system.recruitImmortal({});
            let called = false;
            system.registerHook('immortalityDeepened', () => { called = true; });
            system.deepenImmortality(immortal.immortalId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpImmortal', () => {
        it('should level up', () => {
            const { immortal } = system.recruitImmortal({});
            system.levelUpImmortal(immortal.immortalId);
            expect(immortal.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { immortal } = system.recruitImmortal({});
            system.levelUpImmortal(immortal.immortalId);
            system.levelUpImmortal(immortal.immortalId);
            system.levelUpImmortal(immortal.immortalId);
            expect(immortal.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpImmortal('ghost');
            expect(result.error).toBe('IMMORTAL_NOT_FOUND');
        });

        it('should trigger immortalLeveledUp hook', () => {
            const { immortal } = system.recruitImmortal({});
            let called = false;
            system.registerHook('immortalLeveledUp', () => { called = true; });
            system.levelUpImmortal(immortal.immortalId);
            expect(called).toBe(true);
        });
    });

    describe('legendImmortal', () => {
        it('should legend', () => {
            const { immortal } = system.recruitImmortal({});
            system.legendImmortal(immortal.immortalId);
            expect(immortal.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendImmortal('ghost');
            expect(result.error).toBe('IMMORTAL_NOT_FOUND');
        });

        it('should trigger immortalLegendized hook', () => {
            const { immortal } = system.recruitImmortal({});
            let called = false;
            system.registerHook('immortalLegendized', () => { called = true; });
            system.legendImmortal(immortal.immortalId);
            expect(called).toBe(true);
        });
    });

    describe('calculateImmortalValue', () => {
        it('should calculate default', () => {
            const { immortal } = system.recruitImmortal({});
            // level=1, immortality=20, spells=[] => 100 + 40 + 0 = 140
            expect(system.calculateImmortalValue(immortal.immortalId)).toBe(140);
        });

        it('should calculate with level and spells', () => {
            const { immortal } = system.recruitImmortal({});
            system.levelUpImmortal(immortal.immortalId);
            system.addSpell(immortal.immortalId, 'celestial-bolt');
            system.addSpell(immortal.immortalId, 'earth-shake');
            // level=2, immortality=20, spells.length=2 => 200 + 40 + 60 = 300
            expect(system.calculateImmortalValue(immortal.immortalId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateImmortalValue('ghost')).toBe(0);
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

        it('should execute default getImmortal', () => {
            const result = system.executeTool('getImmortal', { immortalId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('immortalRecruited', () => count++);
            unregister();
            system.recruitImmortal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('immortalRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitImmortal({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalImmortals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalImmortals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitImmortal({});
            const json = system.toJSON();
            expect(json.immortals.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitImmortal({});
            const json = system.toJSON();
            const newSys = new CultivationImmortal();
            newSys.fromJSON(json);
            expect(newSys.immortals.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.immortalCount).toBe(0);
        });
    });
});
