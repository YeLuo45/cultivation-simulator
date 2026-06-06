/**
 * SectCultureDashboard.test.js - 宗门文化仪表盘测试
 * V498 Iteration 15/15 FINAL Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectCultureDashboard } from '../../../systems/ai/SectCultureDashboard.js';

describe('SectCultureDashboard', () => {
    let system;
    beforeEach(() => { system = new SectCultureDashboard(); });

    describe('registerCulture', () => {
        it('should register', () => {
            const { culture } = system.registerCulture({ name: 'Sky Culture' });
            expect(culture.name).toBe('Sky Culture');
        });

        it('should set initial metrics', () => {
            const { culture } = system.registerCulture({});
            expect(system.getMetrics(culture.cultureId)).not.toBeNull();
        });

        it('should trigger cultureRegistered hook', () => {
            let called = false;
            system.registerHook('cultureRegistered', () => { called = true; });
            system.registerCulture({});
            expect(called).toBe(true);
        });
    });

    describe('getCulture', () => {
        it('should return', () => {
            const { culture } = system.registerCulture({});
            expect(system.getCulture(culture.cultureId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCulture('ghost')).toBeNull(); });
    });

    describe('listCultures', () => {
        it('should list all', () => {
            system.registerCulture({});
            expect(system.listCultures().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.registerCulture({ sectId: 's1' });
            system.registerCulture({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByStatus', () => {
        it('should filter', () => {
            system.registerCulture({});
            expect(system.listByStatus('thriving').length).toBe(1);
        });
    });

    describe('listByPhilosophy', () => {
        it('should filter', () => {
            system.registerCulture({ philosophy: 'yin' });
            system.registerCulture({ philosophy: 'yang' });
            expect(system.listByPhilosophy('yin').length).toBe(1);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { culture } = system.registerCulture({});
            const result = system.setMetrics(culture.cultureId, { harmony: 90 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { culture } = system.registerCulture({});
            expect(system.getMetrics(culture.cultureId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshCulture', () => {
        it('should refresh', () => {
            const { culture } = system.registerCulture({});
            const result = system.refreshCulture(culture.cultureId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshCulture('ghost');
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger cultureRefreshed hook', () => {
            const { culture } = system.registerCulture({});
            let called = false;
            system.registerHook('cultureRefreshed', () => { called = true; });
            system.refreshCulture(culture.cultureId);
            expect(called).toBe(true);
        });
    });

    describe('gainWisdom', () => {
        it('should gain', () => {
            const { culture } = system.registerCulture({});
            system.gainWisdom(culture.cultureId, 20);
            expect(culture.wisdom).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.gainWisdom('ghost', 5);
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger wisdomGained hook', () => {
            const { culture } = system.registerCulture({});
            let called = false;
            system.registerHook('wisdomGained', () => { called = true; });
            system.gainWisdom(culture.cultureId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addTradition', () => {
        it('should add', () => {
            const { culture } = system.registerCulture({});
            system.addTradition(culture.cultureId, 'Spring Festival');
            expect(culture.traditions.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addTradition('ghost', 'test');
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger traditionAdded hook', () => {
            const { culture } = system.registerCulture({});
            let called = false;
            system.registerHook('traditionAdded', () => { called = true; });
            system.addTradition(culture.cultureId, 'test');
            expect(called).toBe(true);
        });
    });

    describe('convertPhilosophy', () => {
        it('should convert', () => {
            const { culture } = system.registerCulture({});
            system.convertPhilosophy(culture.cultureId, 'yin');
            expect(culture.philosophy).toBe('yin');
        });

        it('should reject missing', () => {
            const result = system.convertPhilosophy('ghost', 'yang');
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger philosophyConverted hook', () => {
            const { culture } = system.registerCulture({});
            let called = false;
            system.registerHook('philosophyConverted', () => { called = true; });
            system.convertPhilosophy(culture.cultureId, 'yang');
            expect(called).toBe(true);
        });
    });

    describe('recruitDisciple', () => {
        it('should recruit', () => {
            const { culture } = system.registerCulture({});
            system.recruitDisciple(culture.cultureId, 3);
            expect(system.getMetrics(culture.cultureId).disciples).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.recruitDisciple('ghost', 1);
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger discipleRecruited hook', () => {
            const { culture } = system.registerCulture({});
            let called = false;
            system.registerHook('discipleRecruited', () => { called = true; });
            system.recruitDisciple(culture.cultureId, 1);
            expect(called).toBe(true);
        });
    });

    describe('calculateCulturalPower', () => {
        it('should calculate', () => {
            const { culture } = system.registerCulture({});
            system.addTradition(culture.cultureId, 'T1');
            system.addTradition(culture.cultureId, 'T2');
            expect(system.calculateCulturalPower(culture.cultureId)).toBe(100 + 20);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCulturalPower('ghost')).toBe(0);
        });
    });

    describe('archiveCulture', () => {
        it('should archive', () => {
            const { culture } = system.registerCulture({});
            system.archiveCulture(culture.cultureId);
            expect(culture.status).toBe('archived');
        });

        it('should reject missing', () => {
            const result = system.archiveCulture('ghost');
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger cultureArchived hook', () => {
            const { culture } = system.registerCulture({});
            let called = false;
            system.registerHook('cultureArchived', () => { called = true; });
            system.archiveCulture(culture.cultureId);
            expect(called).toBe(true);
        });
    });

    describe('deleteCulture', () => {
        it('should delete', () => {
            const { culture } = system.registerCulture({});
            const result = system.deleteCulture(culture.cultureId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteCulture('ghost');
            expect(result.error).toBe('CULTURE_NOT_FOUND');
        });

        it('should trigger cultureDeleted hook', () => {
            const { culture } = system.registerCulture({});
            let called = false;
            system.registerHook('cultureDeleted', () => { called = true; });
            system.deleteCulture(culture.cultureId);
            expect(called).toBe(true);
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

        it('should execute default getCulture', () => {
            const result = system.executeTool('getCulture', { cultureId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cultureRegistered', () => count++);
            unregister();
            system.registerCulture({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cultureRegistered', () => { throw new Error('x'); });
            expect(() => system.registerCulture({})).not.toThrow();
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
            system.registerCulture({});
            const json = system.toJSON();
            expect(json.cultures.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerCulture({});
            const json = system.toJSON();
            const newSys = new SectCultureDashboard();
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