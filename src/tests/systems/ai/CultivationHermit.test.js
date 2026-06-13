/**
 * CultivationHermit.test.js - 修真隐士测试
 * V653 Iteration 6/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHermit } from '../../../systems/ai/CultivationHermit.js';

describe('CultivationHermit', () => {
    let system;
    beforeEach(() => { system = new CultivationHermit(); });

    describe('recruitHermit', () => {
        it('should recruit', () => {
            const { hermit } = system.recruitHermit({ hostId: 'h1', name: 'Wei', type: 'mountain' });
            expect(hermit.hostId).toBe('h1');
            expect(hermit.name).toBe('Wei');
            expect(hermit.type).toBe('mountain');
            expect(hermit.solitude).toBe(20);
            expect(hermit.level).toBe(1);
            expect(hermit.status).toBe('novice');
            expect(hermit.mantras).toEqual([]);
        });

        it('should generate id when missing', () => {
            const { hermit } = system.recruitHermit({});
            expect(hermit.hermitId).toMatch(/^hmt_/);
        });

        it('should trigger hermitRecruited hook', () => {
            let called = false;
            system.registerHook('hermitRecruited', () => { called = true; });
            system.recruitHermit({});
            expect(called).toBe(true);
        });
    });

    describe('getHermit', () => {
        it('should return hermit', () => {
            const { hermit } = system.recruitHermit({});
            expect(system.getHermit(hermit.hermitId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHermit('ghost')).toBeNull(); });
    });

    describe('listHermits', () => {
        it('should list all', () => {
            system.recruitHermit({});
            system.recruitHermit({});
            expect(system.listHermits().length).toBe(2);
        });
    });

    describe('listByHermit', () => {
        it('should filter by hostId', () => {
            system.recruitHermit({ hostId: 'h1' });
            system.recruitHermit({ hostId: 'h2' });
            expect(system.listByHermit('h1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { hermit } = system.recruitHermit({});
            system.legendHermit(hermit.hermitId);
            system.recruitHermit({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addMantra', () => {
        it('should add mantra', () => {
            const { hermit } = system.recruitHermit({});
            system.addMantra(hermit.hermitId, 'Om Mani Padme Hum');
            expect(hermit.mantras).toContain('Om Mani Padme Hum');
            expect(hermit.mantras.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addMantra('ghost', 'Mantra of Light');
            expect(result.error).toBe('HERMIT_NOT_FOUND');
        });

        it('should trigger mantraAdded hook', () => {
            const { hermit } = system.recruitHermit({});
            let called = false;
            system.registerHook('mantraAdded', () => { called = true; });
            system.addMantra(hermit.hermitId, 'Heart Sutra');
            expect(called).toBe(true);
        });
    });

    describe('deepenSolitude', () => {
        it('should deepen with amount', () => {
            const { hermit } = system.recruitHermit({});
            system.deepenSolitude(hermit.hermitId, 10);
            expect(hermit.solitude).toBe(30);
        });

        it('should deepen with default', () => {
            const { hermit } = system.recruitHermit({});
            system.deepenSolitude(hermit.hermitId);
            expect(hermit.solitude).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenSolitude('ghost', 10);
            expect(result.error).toBe('HERMIT_NOT_FOUND');
        });

        it('should trigger solitudeDeepened hook', () => {
            const { hermit } = system.recruitHermit({});
            let called = false;
            system.registerHook('solitudeDeepened', () => { called = true; });
            system.deepenSolitude(hermit.hermitId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHermit', () => {
        it('should level up', () => {
            const { hermit } = system.recruitHermit({});
            system.levelUpHermit(hermit.hermitId);
            expect(hermit.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { hermit } = system.recruitHermit({});
            for (let i = 0; i < 4; i++) system.levelUpHermit(hermit.hermitId);
            expect(hermit.level).toBe(5);
            expect(hermit.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpHermit('ghost');
            expect(result.error).toBe('HERMIT_NOT_FOUND');
        });

        it('should trigger hermitLeveledUp hook', () => {
            const { hermit } = system.recruitHermit({});
            let called = false;
            system.registerHook('hermitLeveledUp', () => { called = true; });
            system.levelUpHermit(hermit.hermitId);
            expect(called).toBe(true);
        });
    });

    describe('legendHermit', () => {
        it('should legendize', () => {
            const { hermit } = system.recruitHermit({});
            system.legendHermit(hermit.hermitId);
            expect(hermit.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHermit('ghost');
            expect(result.error).toBe('HERMIT_NOT_FOUND');
        });

        it('should trigger hermitLegendized hook', () => {
            const { hermit } = system.recruitHermit({});
            let called = false;
            system.registerHook('hermitLegendized', () => { called = true; });
            system.legendHermit(hermit.hermitId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHermitValue', () => {
        it('should calculate', () => {
            const { hermit } = system.recruitHermit({});
            system.levelUpHermit(hermit.hermitId);
            system.deepenSolitude(hermit.hermitId, 5);
            system.addMantra(hermit.hermitId, 'Lotus Sutra');
            // level=2, solitude=25, mantras.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateHermitValue(hermit.hermitId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHermitValue('ghost')).toBe(0);
        });
    });

    describe('listVeterans', () => {
        it('should filter veterans', () => {
            const { hermit } = system.recruitHermit({});
            for (let i = 0; i < 4; i++) system.levelUpHermit(hermit.hermitId);
            system.recruitHermit({});
            expect(system.listVeterans().length).toBe(1);
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

        it('should execute default getHermit', () => {
            const result = system.executeTool('getHermit', { hermitId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('hermitRecruited', () => count++);
            unregister();
            system.recruitHermit({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('hermitRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHermit({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHermits = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHermits = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHermit({});
            const json = system.toJSON();
            expect(json.hermits.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHermit({});
            const json = system.toJSON();
            const newSys = new CultivationHermit();
            newSys.fromJSON(json);
            expect(newSys.hermits.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.hermitCount).toBe(0);
        });
    });
});
