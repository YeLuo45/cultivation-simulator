/**
 * JadePolishing.test.js - 玉石抛光系统测试
 * V517 Iteration 19/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JadePolishing } from '../../../systems/ai/JadePolishing.js';

describe('JadePolishing', () => {
    let system;
    beforeEach(() => { system = new JadePolishing(); });

    describe('startPolishing', () => {
        it('should start with defaults', () => {
            const { jade } = system.startPolishing({});
            expect(jade.polisherId).toBe('unknown_polisher');
            expect(jade.name).toBe('unnamed_jade');
            expect(jade.type).toBe('imperial');
            expect(jade.luster).toBe(20);
            expect(jade.grits).toEqual([]);
            expect(jade.polish).toBe(0);
            expect(jade.status).toBe('rough');
        });

        it('should start with custom data', () => {
            const { jade } = system.startPolishing({
                polisherId: 'p1',
                name: 'SkyJade',
                type: 'celestial',
                luster: 80,
                grits: ['fine'],
                polish: 20,
                status: 'smooth'
            });
            expect(jade.polisherId).toBe('p1');
            expect(jade.name).toBe('SkyJade');
            expect(jade.type).toBe('celestial');
            expect(jade.luster).toBe(80);
            expect(jade.grits).toEqual(['fine']);
            expect(jade.polish).toBe(20);
            expect(jade.status).toBe('smooth');
        });

        it('should increment totalJades', () => {
            system.startPolishing({});
            system.startPolishing({});
            expect(system.stats.totalJades).toBe(2);
        });

        it('should trigger polishingStarted hook', () => {
            let called = false;
            system.registerHook('polishingStarted', () => { called = true; });
            system.startPolishing({});
            expect(called).toBe(true);
        });
    });

    describe('getJade', () => {
        it('should return jade', () => {
            const { jade } = system.startPolishing({});
            const got = system.getJade(jade.jadeId);
            expect(got).not.toBeNull();
            expect(got.jadeId).toBe(jade.jadeId);
        });
        it('should return null for missing', () => { expect(system.getJade('ghost')).toBeNull(); });
    });

    describe('listJades', () => {
        it('should list all', () => {
            system.startPolishing({});
            system.startPolishing({});
            system.startPolishing({});
            expect(system.listJades().length).toBe(3);
        });

        it('should return empty list when no jades', () => {
            expect(system.listJades().length).toBe(0);
        });
    });

    describe('listByPolisher', () => {
        it('should filter by polisher', () => {
            system.startPolishing({ polisherId: 'p1' });
            system.startPolishing({ polisherId: 'p1' });
            system.startPolishing({ polisherId: 'p2' });
            expect(system.listByPolisher('p1').length).toBe(2);
            expect(system.listByPolisher('p2').length).toBe(1);
            expect(system.listByPolisher('p3').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should list only mastered jades', () => {
            const { jade: j1 } = system.startPolishing({});
            const { jade: j2 } = system.startPolishing({});
            system.masterJade(j1.jadeId);
            expect(system.listMastered().length).toBe(1);
            expect(system.listMastered()[0].jadeId).toBe(j1.jadeId);
        });

        it('should return empty when none mastered', () => {
            system.startPolishing({});
            system.startPolishing({});
            expect(system.listMastered().length).toBe(0);
        });
    });

    describe('addGrit', () => {
        it('should add grit', () => {
            const { jade } = system.startPolishing({});
            system.addGrit(jade.jadeId, 'coarse');
            expect(jade.grits).toContain('coarse');
            expect(jade.grits.length).toBe(1);
        });

        it('should add multiple grits', () => {
            const { jade } = system.startPolishing({});
            system.addGrit(jade.jadeId, 'coarse');
            system.addGrit(jade.jadeId, 'fine');
            expect(jade.grits).toEqual(['coarse', 'fine']);
        });

        it('should set status to smooth when 5+ grits', () => {
            const { jade } = system.startPolishing({});
            system.addGrit(jade.jadeId, 'a');
            system.addGrit(jade.jadeId, 'b');
            system.addGrit(jade.jadeId, 'c');
            system.addGrit(jade.jadeId, 'd');
            expect(jade.status).toBe('rough');
            system.addGrit(jade.jadeId, 'e');
            expect(jade.status).toBe('smooth');
        });

        it('should reject missing', () => {
            const result = system.addGrit('ghost', 'coarse');
            expect(result.error).toBe('JADE_NOT_FOUND');
        });

        it('should trigger gritAdded hook', () => {
            const { jade } = system.startPolishing({});
            let called = false;
            system.registerHook('gritAdded', () => { called = true; });
            system.addGrit(jade.jadeId, 'coarse');
            expect(called).toBe(true);
        });
    });

    describe('increaseLuster', () => {
        it('should increase by default amount', () => {
            const { jade } = system.startPolishing({});
            system.increaseLuster(jade.jadeId);
            expect(jade.luster).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { jade } = system.startPolishing({});
            system.increaseLuster(jade.jadeId, 30);
            expect(jade.luster).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.increaseLuster('ghost', 5);
            expect(result.error).toBe('JADE_NOT_FOUND');
        });

        it('should trigger lusterIncreased hook', () => {
            const { jade } = system.startPolishing({});
            let called = false;
            system.registerHook('lusterIncreased', () => { called = true; });
            system.increaseLuster(jade.jadeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('polishJade', () => {
        it('should polish by default amount', () => {
            const { jade } = system.startPolishing({});
            system.polishJade(jade.jadeId);
            expect(jade.polish).toBe(5);
        });

        it('should polish by custom amount', () => {
            const { jade } = system.startPolishing({});
            system.polishJade(jade.jadeId, 25);
            expect(jade.polish).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.polishJade('ghost', 5);
            expect(result.error).toBe('JADE_NOT_FOUND');
        });

        it('should trigger jadePolished hook', () => {
            const { jade } = system.startPolishing({});
            let called = false;
            system.registerHook('jadePolished', () => { called = true; });
            system.polishJade(jade.jadeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('masterJade', () => {
        it('should set status to mastered', () => {
            const { jade } = system.startPolishing({});
            system.masterJade(jade.jadeId);
            expect(jade.status).toBe('mastered');
        });

        it('should reject missing', () => {
            const result = system.masterJade('ghost');
            expect(result.error).toBe('JADE_NOT_FOUND');
        });

        it('should trigger jadeMastered hook', () => {
            const { jade } = system.startPolishing({});
            let called = false;
            system.registerHook('jadeMastered', () => { called = true; });
            system.masterJade(jade.jadeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateJadeValue', () => {
        it('should calculate default value', () => {
            const { jade } = system.startPolishing({});
            // luster=20 * 2 + polish=0 + 0 * 15 = 40
            expect(system.calculateJadeValue(jade.jadeId)).toBe(40);
        });

        it('should add 15 per grit', () => {
            const { jade } = system.startPolishing({});
            system.addGrit(jade.jadeId, 'coarse');
            system.addGrit(jade.jadeId, 'fine');
            // 40 + 0 + 2*15 = 70
            expect(system.calculateJadeValue(jade.jadeId)).toBe(70);
        });

        it('should reflect polish in formula', () => {
            const { jade } = system.startPolishing({});
            system.polishJade(jade.jadeId, 20);
            // 40 + 20 + 0 = 60
            expect(system.calculateJadeValue(jade.jadeId)).toBe(60);
        });

        it('should reflect luster in formula', () => {
            const { jade } = system.startPolishing({ luster: 50 });
            // 50 * 2 + 0 + 0 = 100
            expect(system.calculateJadeValue(jade.jadeId)).toBe(100);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateJadeValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getJade', () => {
            const result = system.executeTool('getJade', { jadeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('polishingStarted', () => count++);
            unregister();
            system.startPolishing({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('polishingStarted', () => { throw new Error('x'); });
            expect(() => system.startPolishing({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalJades = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalJades = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startPolishing({});
            const json = system.toJSON();
            expect(json.jades.length).toBe(1);
            expect(json.stats.totalJades).toBe(1);
        });
        it('should deserialize', () => {
            system.startPolishing({ name: 'a' });
            const json = system.toJSON();
            const newSys = new JadePolishing();
            newSys.fromJSON(json);
            expect(newSys.jades.size).toBe(1);
            expect(newSys.stats.totalJades).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.jadeCount).toBe(0);
            expect(stats.totalJades).toBe(0);
            system.startPolishing({});
            expect(system.getStats().jadeCount).toBe(1);
        });
    });
});
