/**
 * ShadowArts.test.js - 影术测试
 * V430 Iteration 7/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ShadowArts } from '../../../systems/ai/ShadowArts.js';

describe('ShadowArts', () => {
    let system;
    beforeEach(() => { system = new ShadowArts(); });

    describe('summonShadow', () => {
        it('should summon', () => {
            const { shadow } = system.summonShadow({ wielderId: 'w1' });
            expect(shadow.wielderId).toBe('w1');
        });

        it('should default form to wraith', () => {
            const { shadow } = system.summonShadow({});
            expect(shadow.form).toBe('wraith');
        });

        it('should trigger shadowSummoned hook', () => {
            let called = false;
            system.registerHook('shadowSummoned', () => { called = true; });
            system.summonShadow({});
            expect(called).toBe(true);
        });
    });

    describe('getShadow', () => {
        it('should return', () => {
            const { shadow } = system.summonShadow({});
            expect(system.getShadow(shadow.shadowId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getShadow('ghost')).toBeNull(); });
    });

    describe('listShadows', () => {
        it('should list all', () => {
            system.summonShadow({});
            expect(system.listShadows().length).toBe(1);
        });

        it('should return empty when none', () => {
            expect(system.listShadows().length).toBe(0);
        });
    });

    describe('listByWielder', () => {
        it('should filter', () => {
            system.summonShadow({ wielderId: 'w1' });
            system.summonShadow({ wielderId: 'w2' });
            expect(system.listByWielder('w1').length).toBe(1);
        });
    });

    describe('listByForm', () => {
        it('should filter', () => {
            system.summonShadow({ form: 'specter' });
            system.summonShadow({ form: 'shade' });
            expect(system.listByForm('specter').length).toBe(1);
        });
    });

    describe('channelDarkness', () => {
        it('should channel', () => {
            const { shadow } = system.summonShadow({});
            system.channelDarkness(shadow.shadowId, 10);
            expect(shadow.darkness).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.channelDarkness('ghost', 5);
            expect(result.error).toBe('SHADOW_NOT_FOUND');
        });

        it('should trigger darknessChanneled hook', () => {
            const { shadow } = system.summonShadow({});
            let called = false;
            system.registerHook('darknessChanneled', () => { called = true; });
            system.channelDarkness(shadow.shadowId, 5);
            expect(called).toBe(true);
        });
    });

    describe('performStealth', () => {
        it('should set status to active', () => {
            const { shadow } = system.summonShadow({});
            system.performStealth(shadow.shadowId);
            expect(shadow.status).toBe('active');
        });

        it('should increase stealth', () => {
            const { shadow } = system.summonShadow({});
            system.performStealth(shadow.shadowId);
            expect(shadow.stealth).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.performStealth('ghost');
            expect(result.error).toBe('SHADOW_NOT_FOUND');
        });

        it('should trigger stealthPerformed hook', () => {
            const { shadow } = system.summonShadow({});
            let called = false;
            system.registerHook('stealthPerformed', () => { called = true; });
            system.performStealth(shadow.shadowId);
            expect(called).toBe(true);
        });
    });

    describe('attackWithShadow', () => {
        it('should attack', () => {
            const { shadow } = system.summonShadow({});
            system.attackWithShadow(shadow.shadowId);
            expect(shadow.attacks).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.attackWithShadow('ghost');
            expect(result.error).toBe('SHADOW_NOT_FOUND');
        });

        it('should trigger shadowAttacked hook', () => {
            const { shadow } = system.summonShadow({});
            let called = false;
            system.registerHook('shadowAttacked', () => { called = true; });
            system.attackWithShadow(shadow.shadowId);
            expect(called).toBe(true);
        });
    });

    describe('dismissShadow', () => {
        it('should dismiss', () => {
            const { shadow } = system.summonShadow({});
            shadow.status = 'active';
            system.dismissShadow(shadow.shadowId);
            expect(shadow.status).toBe('passive');
        });

        it('should reject missing', () => {
            const result = system.dismissShadow('ghost');
            expect(result.error).toBe('SHADOW_NOT_FOUND');
        });
    });

    describe('calculateShadowPower', () => {
        it('should calculate', () => {
            const { shadow } = system.summonShadow({});
            // darkness=20, stealth=30, attacks=0 => 20 * 1.3 + 0 = 26
            expect(system.calculateShadowPower(shadow.shadowId)).toBe(26);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateShadowPower('ghost')).toBe(0);
        });
    });

    describe('listCorporeal', () => {
        it('should filter corporeal', () => {
            const { shadow } = system.summonShadow({});
            shadow.status = 'corporeal';
            expect(system.listCorporeal().length).toBe(1);
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

        it('should execute default getShadow', () => {
            const result = system.executeTool('getShadow', { shadowId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('shadowSummoned', () => count++);
            unregister();
            system.summonShadow({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('shadowSummoned', () => { throw new Error('x'); });
            expect(() => system.summonShadow({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalShadows = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalShadows = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.summonShadow({});
            const json = system.toJSON();
            expect(json.shadows.length).toBe(1);
        });
        it('should deserialize', () => {
            system.summonShadow({});
            const json = system.toJSON();
            const newSys = new ShadowArts();
            newSys.fromJSON(json);
            expect(newSys.shadows.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.shadowCount).toBe(0);
        });
    });
});
