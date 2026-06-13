/**
 * CultivationPatriarch.test.js - 修真族长系统测试
 * V665 Iteration 18/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPatriarch } from '../../../systems/ai/CultivationPatriarch.js';

describe('CultivationPatriarch', () => {
    let system;
    beforeEach(() => { system = new CultivationPatriarch(); });

    describe('recruitPatriarch', () => {
        it('should recruit with clanId and name', () => {
            const { patriarch } = system.recruitPatriarch({ clanId: 'c1', name: 'Elder of the Jade Mountain' });
            expect(patriarch.clanId).toBe('c1');
            expect(patriarch.name).toBe('Elder of the Jade Mountain');
        });

        it('should default to founder type', () => {
            const { patriarch } = system.recruitPatriarch({});
            expect(patriarch.type).toBe('founder');
        });

        it('should accept type founder', () => {
            const { patriarch } = system.recruitPatriarch({ type: 'founder' });
            expect(patriarch.type).toBe('founder');
        });

        it('should accept type leader', () => {
            const { patriarch } = system.recruitPatriarch({ type: 'leader' });
            expect(patriarch.type).toBe('leader');
        });

        it('should accept type elder', () => {
            const { patriarch } = system.recruitPatriarch({ type: 'elder' });
            expect(patriarch.type).toBe('elder');
        });

        it('should default authority to baseAuthority', () => {
            const { patriarch } = system.recruitPatriarch({});
            expect(patriarch.authority).toBe(20);
        });

        it('should accept explicit authority', () => {
            const { patriarch } = system.recruitPatriarch({ authority: 100 });
            expect(patriarch.authority).toBe(100);
        });

        it('should accept authority=0', () => {
            const { patriarch } = system.recruitPatriarch({ authority: 0 });
            expect(patriarch.authority).toBe(0);
        });

        it('should default edicts to empty array', () => {
            const { patriarch } = system.recruitPatriarch({});
            expect(patriarch.edicts).toEqual([]);
        });

        it('should clone edicts array', () => {
            const orig = ['edict-a'];
            const { patriarch } = system.recruitPatriarch({ edicts: orig });
            orig.push('edict-b');
            expect(patriarch.edicts.length).toBe(1);
        });

        it('should start at level 1', () => {
            const { patriarch } = system.recruitPatriarch({});
            expect(patriarch.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { patriarch } = system.recruitPatriarch({});
            expect(patriarch.status).toBe('novice');
        });

        it('should generate patriarchId', () => {
            const { patriarch } = system.recruitPatriarch({});
            expect(patriarch.patriarchId).toBeDefined();
            expect(typeof patriarch.patriarchId).toBe('string');
        });

        it('should accept custom patriarchId', () => {
            const { patriarch } = system.recruitPatriarch({ patriarchId: 'my-patriarch' });
            expect(patriarch.patriarchId).toBe('my-patriarch');
        });

        it('should trigger patriarchRecruited hook', () => {
            let called = false;
            system.registerHook('patriarchRecruited', () => { called = true; });
            system.recruitPatriarch({});
            expect(called).toBe(true);
        });

        it('should set createdAt timestamp', () => {
            const { patriarch } = system.recruitPatriarch({});
            expect(patriarch.createdAt).toBeDefined();
            expect(typeof patriarch.createdAt).toBe('number');
        });

        it('should increment totalPatriarchs stat', () => {
            system.recruitPatriarch({});
            system.recruitPatriarch({});
            expect(system.stats.totalPatriarchs).toBe(2);
        });
    });

    describe('getPatriarch', () => {
        it('should return patriarch', () => {
            const { patriarch } = system.recruitPatriarch({});
            expect(system.getPatriarch(patriarch.patriarchId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getPatriarch('ghost')).toBeNull();
        });
        it('should return a copy', () => {
            const { patriarch } = system.recruitPatriarch({ name: 'Original' });
            const fetched = system.getPatriarch(patriarch.patriarchId);
            fetched.name = 'Mutated';
            expect(system.getPatriarch(patriarch.patriarchId).name).toBe('Original');
        });
    });

    describe('listPatriarchs', () => {
        it('should list all', () => {
            system.recruitPatriarch({});
            system.recruitPatriarch({});
            expect(system.listPatriarchs().length).toBe(2);
        });
        it('should return empty when no patriarchs', () => {
            expect(system.listPatriarchs().length).toBe(0);
        });
    });

    describe('listByClan', () => {
        it('should filter by clan', () => {
            system.recruitPatriarch({ clanId: 'c1' });
            system.recruitPatriarch({ clanId: 'c2' });
            system.recruitPatriarch({ clanId: 'c1' });
            expect(system.listByClan('c1').length).toBe(2);
        });
        it('should return empty for unknown clan', () => {
            system.recruitPatriarch({ clanId: 'c1' });
            expect(system.listByClan('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { patriarch: p1 } = system.recruitPatriarch({});
            const { patriarch: p2 } = system.recruitPatriarch({});
            system.legendPatriarch(p1.patriarchId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].patriarchId).toBe(p1.patriarchId);
            expect(p2.status).toBe('novice');
        });
        it('should return empty when none legendary', () => {
            system.recruitPatriarch({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addEdict', () => {
        it('should add edict', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.addEdict(patriarch.patriarchId, 'No cultivation past sunset');
            expect(patriarch.edicts).toContain('No cultivation past sunset');
        });

        it('should accumulate edicts', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.addEdict(patriarch.patriarchId, 'edict-1');
            system.addEdict(patriarch.patriarchId, 'edict-2');
            system.addEdict(patriarch.patriarchId, 'edict-3');
            expect(patriarch.edicts.length).toBe(3);
        });

        it('should reject missing patriarch', () => {
            const result = system.addEdict('ghost', 'edict');
            expect(result.error).toBe('PATRIARCH_NOT_FOUND');
        });

        it('should trigger edictAdded hook', () => {
            const { patriarch } = system.recruitPatriarch({});
            let received = null;
            system.registerHook('edictAdded', (d) => { received = d; });
            system.addEdict(patriarch.patriarchId, 'sacred-law');
            expect(received.edict).toBe('sacred-law');
        });
    });

    describe('buildAuthority', () => {
        it('should build authority by default', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.buildAuthority(patriarch.patriarchId);
            expect(patriarch.authority).toBe(25);
        });

        it('should build authority by custom amount', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.buildAuthority(patriarch.patriarchId, 100);
            expect(patriarch.authority).toBe(120);
        });

        it('should reject missing patriarch', () => {
            const result = system.buildAuthority('ghost', 5);
            expect(result.error).toBe('PATRIARCH_NOT_FOUND');
        });

        it('should trigger authorityBuilt hook', () => {
            const { patriarch } = system.recruitPatriarch({});
            let received = null;
            system.registerHook('authorityBuilt', (d) => { received = d; });
            system.buildAuthority(patriarch.patriarchId, 10);
            expect(received.newAuthority).toBe(30);
        });
    });

    describe('levelUpPatriarch', () => {
        it('should level up', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.levelUpPatriarch(patriarch.patriarchId);
            expect(patriarch.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.levelUpPatriarch(patriarch.patriarchId);
            system.levelUpPatriarch(patriarch.patriarchId);
            system.levelUpPatriarch(patriarch.patriarchId);
            expect(patriarch.level).toBe(4);
        });

        it('should reject missing patriarch', () => {
            const result = system.levelUpPatriarch('ghost');
            expect(result.error).toBe('PATRIARCH_NOT_FOUND');
        });

        it('should trigger patriarchLeveledUp hook', () => {
            const { patriarch } = system.recruitPatriarch({});
            let received = null;
            system.registerHook('patriarchLeveledUp', (d) => { received = d; });
            system.levelUpPatriarch(patriarch.patriarchId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendPatriarch', () => {
        it('should mark legendary', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.legendPatriarch(patriarch.patriarchId);
            expect(patriarch.status).toBe('legendary');
        });

        it('should reject missing patriarch', () => {
            const result = system.legendPatriarch('ghost');
            expect(result.error).toBe('PATRIARCH_NOT_FOUND');
        });

        it('should trigger patriarchLegendized hook', () => {
            const { patriarch } = system.recruitPatriarch({});
            let called = false;
            system.registerHook('patriarchLegendized', () => { called = true; });
            system.legendPatriarch(patriarch.patriarchId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePatriarchValue', () => {
        it('should calculate base value', () => {
            const { patriarch } = system.recruitPatriarch({});
            // level=1, authority=20, edicts=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculatePatriarchValue(patriarch.patriarchId)).toBe(140);
        });

        it('should include edicts in value', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.addEdict(patriarch.patriarchId, 'edict-1');
            system.addEdict(patriarch.patriarchId, 'edict-2');
            // level=1, authority=20, edicts=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculatePatriarchValue(patriarch.patriarchId)).toBe(200);
        });

        it('should scale with level', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.levelUpPatriarch(patriarch.patriarchId);
            system.levelUpPatriarch(patriarch.patriarchId);
            // level=3, authority=20, edicts=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculatePatriarchValue(patriarch.patriarchId)).toBe(340);
        });

        it('should scale with authority', () => {
            const { patriarch } = system.recruitPatriarch({});
            system.buildAuthority(patriarch.patriarchId, 100);
            // level=1, authority=120, edicts=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculatePatriarchValue(patriarch.patriarchId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePatriarchValue('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
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

        it('should execute default getPatriarch tool', () => {
            const result = system.executeTool('getPatriarch', { patriarchId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitPatriarch tool', () => {
            const result = system.executeTool('recruitPatriarch', { clanId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('patriarchRecruited', () => count++);
            unregister();
            system.recruitPatriarch({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('patriarchRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPatriarch({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPatriarchs = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPatriarchs = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPatriarch({});
            const json = system.toJSON();
            expect(json.patriarchs.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPatriarch({});
            const json = system.toJSON();
            const newSys = new CultivationPatriarch();
            newSys.fromJSON(json);
            expect(newSys.patriarchs.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.patriarchCount).toBe(0);
        });
    });
});
