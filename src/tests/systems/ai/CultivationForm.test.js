/**
 * CultivationForm.test.js - 修真招式测试
 * V694 Iteration 17/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationForm } from '../../../systems/ai/CultivationForm.js';

describe('CultivationForm', () => {
    let system;
    beforeEach(() => { system = new CultivationForm(); });

    describe('recruitForm', () => {
        it('should recruit', () => {
            const { form } = system.recruitForm({ masterId: 'm1', name: 'sword-dance' });
            expect(form.masterId).toBe('m1');
            expect(form.name).toBe('sword-dance');
        });

        it('should default type to offense', () => {
            const { form } = system.recruitForm({});
            expect(form.type).toBe('offense');
        });

        it('should default status to novice', () => {
            const { form } = system.recruitForm({});
            expect(form.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { form } = system.recruitForm({});
            expect(form.level).toBe(1);
        });

        it('should default flow to baseFlow', () => {
            const { form } = system.recruitForm({});
            expect(form.flow).toBe(20);
        });

        it('should default strikes to []', () => {
            const { form } = system.recruitForm({});
            expect(form.strikes).toEqual([]);
        });

        it('should trigger formRecruited hook', () => {
            let called = false;
            system.registerHook('formRecruited', () => { called = true; });
            system.recruitForm({});
            expect(called).toBe(true);
        });
    });

    describe('getForm', () => {
        it('should return form', () => {
            const { form } = system.recruitForm({});
            expect(system.getForm(form.formId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getForm('ghost')).toBeNull(); });
    });

    describe('listForms', () => {
        it('should list all', () => {
            system.recruitForm({});
            system.recruitForm({});
            expect(system.listForms().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listForms().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitForm({ masterId: 'm1' });
            system.recruitForm({ masterId: 'm2' });
            system.recruitForm({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitForm({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { form: f1 } = system.recruitForm({});
            const { form: f2 } = system.recruitForm({});
            system.legendForm(f1.formId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitForm({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addStrike', () => {
        it('should add strike', () => {
            const { form } = system.recruitForm({});
            system.addStrike(form.formId, 'thrust');
            expect(form.strikes.length).toBe(1);
            expect(form.strikes[0]).toBe('thrust');
        });

        it('should reject missing form', () => {
            const result = system.addStrike('ghost', 'thrust');
            expect(result.error).toBe('FORM_NOT_FOUND');
        });

        it('should trigger strikeAdded hook', () => {
            const { form } = system.recruitForm({});
            let called = false;
            system.registerHook('strikeAdded', () => { called = true; });
            system.addStrike(form.formId, 'slash');
            expect(called).toBe(true);
        });
    });

    describe('smoothFlow', () => {
        it('should smooth flow with default', () => {
            const { form } = system.recruitForm({});
            system.smoothFlow(form.formId);
            expect(form.flow).toBe(25);
        });

        it('should smooth flow with custom amount', () => {
            const { form } = system.recruitForm({});
            system.smoothFlow(form.formId, 10);
            expect(form.flow).toBe(30);
        });

        it('should reject missing form', () => {
            const result = system.smoothFlow('ghost', 5);
            expect(result.error).toBe('FORM_NOT_FOUND');
        });

        it('should trigger flowSmoothed hook', () => {
            const { form } = system.recruitForm({});
            let called = false;
            system.registerHook('flowSmoothed', () => { called = true; });
            system.smoothFlow(form.formId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpForm', () => {
        it('should level up', () => {
            const { form } = system.recruitForm({});
            system.levelUpForm(form.formId);
            expect(form.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpForm('ghost');
            expect(result.error).toBe('FORM_NOT_FOUND');
        });

        it('should trigger formLeveledUp hook', () => {
            const { form } = system.recruitForm({});
            let called = false;
            system.registerHook('formLeveledUp', () => { called = true; });
            system.levelUpForm(form.formId);
            expect(called).toBe(true);
        });
    });

    describe('legendForm', () => {
        it('should legendize', () => {
            const { form } = system.recruitForm({});
            system.legendForm(form.formId);
            expect(form.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendForm('ghost');
            expect(result.error).toBe('FORM_NOT_FOUND');
        });

        it('should trigger formLegendized hook', () => {
            const { form } = system.recruitForm({});
            let called = false;
            system.registerHook('formLegendized', () => { called = true; });
            system.legendForm(form.formId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFormValue', () => {
        it('should calculate base value', () => {
            const { form } = system.recruitForm({});
            // level 1 * 100 + flow 20 * 2 + 0 strikes * 30 = 100 + 40 + 0 = 140
            expect(system.calculateFormValue(form.formId)).toBe(140);
        });

        it('should include strikes', () => {
            const { form } = system.recruitForm({});
            system.addStrike(form.formId, 'a');
            system.addStrike(form.formId, 'b');
            // 100 + 40 + 60 = 200
            expect(system.calculateFormValue(form.formId)).toBe(200);
        });

        it('should include level', () => {
            const { form } = system.recruitForm({});
            system.levelUpForm(form.formId);
            system.levelUpForm(form.formId);
            // 300 + 40 + 0 = 340
            expect(system.calculateFormValue(form.formId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFormValue('ghost')).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty for no veterans', () => {
            system.recruitForm({});
            expect(system.listVeteran().length).toBe(0);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getForm tool', () => {
            const result = system.executeTool('getForm', { formId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('formRecruited', () => count++);
            unregister();
            system.recruitForm({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('formRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitForm({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve with sufficient forms', () => {
            system.stats.totalForms = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalForms = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize toJSON', () => {
            system.recruitForm({});
            const json = system.toJSON();
            expect(json.forms.length).toBe(1);
        });

        it('should deserialize fromJSON', () => {
            system.recruitForm({});
            const json = system.toJSON();
            const newSys = new CultivationForm();
            newSys.fromJSON(json);
            expect(newSys.forms.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with formCount', () => {
            const stats = system.getStats();
            expect(stats.formCount).toBe(0);
        });

        it('should reflect recruited count', () => {
            system.recruitForm({});
            system.recruitForm({});
            const stats = system.getStats();
            expect(stats.formCount).toBe(2);
        });
    });
});
