/**
 * CultivationChant.test.js - 修真吟唱测试
 * V775 Iteration 8/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationChant } from '../../../systems/ai/CultivationChant.js';

describe('CultivationChant', () => {
    let system;
    beforeEach(() => { system = new CultivationChant(); });

    describe('recruitChant', () => {
        it('should recruit', () => {
            const { chant } = system.recruitChant({ masterId: 'm1', name: 'Sky Chant' });
            expect(chant.name).toBe('Sky Chant');
            expect(chant.masterId).toBe('m1');
            expect(chant.status).toBe('novice');
            expect(chant.level).toBe(1);
            expect(chant.cadence).toBe(20);
        });

        it('should use default type', () => {
            const { chant } = system.recruitChant({});
            expect(chant.type).toBe('warrior');
        });

        it('should accept custom type', () => {
            const { chant } = system.recruitChant({ type: 'healer' });
            expect(chant.type).toBe('healer');
        });

        it('should trigger chantRecruited hook', () => {
            let called = false;
            system.registerHook('chantRecruited', () => { called = true; });
            system.recruitChant({});
            expect(called).toBe(true);
        });
    });

    describe('getChant', () => {
        it('should return', () => {
            const { chant } = system.recruitChant({});
            expect(system.getChant(chant.chantId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getChant('ghost')).toBeNull(); });
    });

    describe('listChants', () => {
        it('should list all', () => {
            system.recruitChant({});
            system.recruitChant({});
            expect(system.listChants().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listChants().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitChant({ masterId: 'm1' });
            system.recruitChant({ masterId: 'm2' });
            system.recruitChant({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
        it('should return empty for unknown', () => {
            system.recruitChant({});
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { chant: c1 } = system.recruitChant({});
            const { chant: c2 } = system.recruitChant({});
            system.legendChant(c1.chantId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addVerse', () => {
        it('should add verse', () => {
            const { chant } = system.recruitChant({});
            system.addVerse(chant.chantId, 'Verse of the Wind');
            expect(chant.verses.length).toBe(1);
        });

        it('should reject missing chant', () => {
            const result = system.addVerse('ghost', 'verse');
            expect(result.error).toBe('CHANT_NOT_FOUND');
        });

        it('should trigger verseAdded hook', () => {
            const { chant } = system.recruitChant({});
            let called = false;
            system.registerHook('verseAdded', () => { called = true; });
            system.addVerse(chant.chantId, 'Ballad');
            expect(called).toBe(true);
        });
    });

    describe('raiseCadence', () => {
        it('should raise with default amount', () => {
            const { chant } = system.recruitChant({});
            system.raiseCadence(chant.chantId);
            expect(chant.cadence).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { chant } = system.recruitChant({});
            system.raiseCadence(chant.chantId, 15);
            expect(chant.cadence).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.raiseCadence('ghost');
            expect(result.error).toBe('CHANT_NOT_FOUND');
        });

        it('should trigger cadenceRaised hook', () => {
            const { chant } = system.recruitChant({});
            let called = false;
            system.registerHook('cadenceRaised', () => { called = true; });
            system.raiseCadence(chant.chantId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpChant', () => {
        it('should level up', () => {
            const { chant } = system.recruitChant({});
            system.levelUpChant(chant.chantId);
            expect(chant.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { chant } = system.recruitChant({});
            system.levelUpChant(chant.chantId);
            system.levelUpChant(chant.chantId);
            system.levelUpChant(chant.chantId);
            expect(chant.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpChant('ghost');
            expect(result.error).toBe('CHANT_NOT_FOUND');
        });

        it('should trigger chantLeveledUp hook', () => {
            const { chant } = system.recruitChant({});
            let called = false;
            system.registerHook('chantLeveledUp', () => { called = true; });
            system.levelUpChant(chant.chantId);
            expect(called).toBe(true);
        });
    });

    describe('legendChant', () => {
        it('should set status to legendary', () => {
            const { chant } = system.recruitChant({});
            system.legendChant(chant.chantId);
            expect(chant.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendChant('ghost');
            expect(result.error).toBe('CHANT_NOT_FOUND');
        });

        it('should trigger chantLegendized hook', () => {
            const { chant } = system.recruitChant({});
            let called = false;
            system.registerHook('chantLegendized', () => { called = true; });
            system.legendChant(chant.chantId);
            expect(called).toBe(true);
        });
    });

    describe('calculateChantValue', () => {
        it('should calculate', () => {
            const { chant } = system.recruitChant({});
            system.levelUpChant(chant.chantId);
            system.raiseCadence(chant.chantId, 10);
            system.addVerse(chant.chantId, 'verse1');
            // level=2, cadence=30, verses=1: 2*100 + 30*2 + 1*30 = 200+60+30 = 290
            expect(system.calculateChantValue(chant.chantId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateChantValue('ghost')).toBe(0);
        });

        it('should calculate with multiple verses', () => {
            const { chant } = system.recruitChant({});
            system.addVerse(chant.chantId, 'v1');
            system.addVerse(chant.chantId, 'v2');
            system.addVerse(chant.chantId, 'v3');
            // level=1, cadence=20, verses=3: 100+40+90 = 230
            expect(system.calculateChantValue(chant.chantId)).toBe(230);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitChant({ type: 'warrior' });
            system.recruitChant({ type: 'healer' });
            system.recruitChant({ type: 'sage' });
            expect(system.listByType('healer').length).toBe(1);
        });
    });

    describe('listVeteran', () => {
        it('should list veteran and legendary', () => {
            const { chant: c1 } = system.recruitChant({});
            const { chant: c2 } = system.recruitChant({});
            c1.status = 'veteran';
            system.legendChant(c2.chantId);
            expect(system.listVeteran().length).toBe(2);
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

        it('should execute default getChant tool', () => {
            const { chant } = system.recruitChant({});
            const result = system.executeTool('getChant', { chantId: chant.chantId });
            expect(result.result.name).toBe('Unnamed Chant');
        });

        it('should handle undefined context', () => {
            system.registerTool('noop', () => 'done');
            const result = system.executeTool('noop');
            expect(result.result).toBe('done');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('chantRecruited', () => count++);
            unregister();
            system.recruitChant({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('chantRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitChant({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalChants = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalChants = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitChant({});
            const json = system.toJSON();
            expect(json.chants.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitChant({ name: 'Earth Chant' });
            const json = system.toJSON();
            const newSys = new CultivationChant();
            newSys.fromJSON(json);
            expect(newSys.chants.size).toBe(1);
            expect(newSys.getStats().totalChants).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.chantCount).toBe(0);
            expect(stats.totalChants).toBe(0);
        });

        it('should reflect counts after recruit', () => {
            system.recruitChant({});
            const stats = system.getStats();
            expect(stats.chantCount).toBe(1);
        });
    });
});
