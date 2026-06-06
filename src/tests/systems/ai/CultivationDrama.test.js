/**
 * CultivationDrama.test.js - 修真戏测试
 * V558 Iteration 1/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDrama } from '../../../systems/ai/CultivationDrama.js';

describe('CultivationDrama', () => {
    let system;
    beforeEach(() => { system = new CultivationDrama(); });

    describe('stageDrama', () => {
        it('should create', () => {
            const { drama } = system.stageDrama({ directorId: 'd1', name: 'Azure Tears', type: 'tragedy' });
            expect(drama.directorId).toBe('d1');
            expect(drama.name).toBe('Azure Tears');
            expect(drama.type).toBe('tragedy');
        });

        it('should set default status to staged', () => {
            const { drama } = system.stageDrama({});
            expect(drama.status).toBe('staged');
        });

        it('should use baseDrama as default drama', () => {
            const { drama } = system.stageDrama({});
            expect(drama.drama).toBe(20);
        });

        it('should start at level 1', () => {
            const { drama } = system.stageDrama({});
            expect(drama.level).toBe(1);
        });

        it('should trigger dramaStaged hook', () => {
            let called = false;
            system.registerHook('dramaStaged', () => { called = true; });
            system.stageDrama({});
            expect(called).toBe(true);
        });
    });

    describe('getDrama', () => {
        it('should return', () => {
            const { drama } = system.stageDrama({});
            expect(system.getDrama(drama.dramaId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDrama('ghost')).toBeNull(); });
    });

    describe('listDramas', () => {
        it('should list all', () => {
            system.stageDrama({});
            system.stageDrama({});
            expect(system.listDramas().length).toBe(2);
        });

        it('should return empty array when no dramas', () => {
            expect(system.listDramas().length).toBe(0);
        });
    });

    describe('listByDirector', () => {
        it('should filter', () => {
            system.stageDrama({ directorId: 'd1' });
            system.stageDrama({ directorId: 'd2' });
            expect(system.listByDirector('d1').length).toBe(1);
        });

        it('should return empty for unknown director', () => {
            system.stageDrama({ directorId: 'd1' });
            expect(system.listByDirector('ghost').length).toBe(0);
        });
    });

    describe('listMasterpiece', () => {
        it('should filter masterpiece dramas', () => {
            const { drama: d1 } = system.stageDrama({ directorId: 'd1' });
            system.stageDrama({ directorId: 'd2' });
            system.masterDrama(d1.dramaId);
            expect(system.listMasterpiece().length).toBe(1);
        });

        it('should return empty when none are masterpiece', () => {
            system.stageDrama({});
            expect(system.listMasterpiece().length).toBe(0);
        });
    });

    describe('addScene', () => {
        it('should add scene', () => {
            const { drama } = system.stageDrama({});
            system.addScene(drama.dramaId, { id: 's1', name: 'Opening Act' });
            expect(drama.scenes.length).toBe(1);
            expect(drama.scenes[0].name).toBe('Opening Act');
        });

        it('should reject missing', () => {
            const result = system.addScene('ghost', { id: 's1' });
            expect(result.error).toBe('DRAMA_NOT_FOUND');
        });

        it('should trigger sceneAdded hook', () => {
            const { drama } = system.stageDrama({});
            let called = false;
            system.registerHook('sceneAdded', () => { called = true; });
            system.addScene(drama.dramaId, { id: 's1' });
            expect(called).toBe(true);
        });
    });

    describe('increaseDrama', () => {
        it('should increase', () => {
            const { drama } = system.stageDrama({});
            system.increaseDrama(drama.dramaId, 15);
            expect(drama.drama).toBe(35);
        });

        it('should use default amount of 5', () => {
            const { drama } = system.stageDrama({});
            system.increaseDrama(drama.dramaId);
            expect(drama.drama).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseDrama('ghost', 10);
            expect(result.error).toBe('DRAMA_NOT_FOUND');
        });

        it('should trigger dramaIncreased hook', () => {
            const { drama } = system.stageDrama({});
            let called = false;
            system.registerHook('dramaIncreased', () => { called = true; });
            system.increaseDrama(drama.dramaId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDrama', () => {
        it('should level up', () => {
            const { drama } = system.stageDrama({});
            system.levelUpDrama(drama.dramaId);
            expect(drama.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { drama } = system.stageDrama({});
            system.levelUpDrama(drama.dramaId);
            system.levelUpDrama(drama.dramaId);
            system.levelUpDrama(drama.dramaId);
            expect(drama.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpDrama('ghost');
            expect(result.error).toBe('DRAMA_NOT_FOUND');
        });

        it('should trigger dramaLeveledUp hook', () => {
            const { drama } = system.stageDrama({});
            let called = false;
            system.registerHook('dramaLeveledUp', () => { called = true; });
            system.levelUpDrama(drama.dramaId);
            expect(called).toBe(true);
        });
    });

    describe('masterDrama', () => {
        it('should master', () => {
            const { drama } = system.stageDrama({});
            system.masterDrama(drama.dramaId);
            expect(drama.status).toBe('masterpiece');
        });

        it('should reject missing', () => {
            const result = system.masterDrama('ghost');
            expect(result.error).toBe('DRAMA_NOT_FOUND');
        });

        it('should trigger dramaMastered hook', () => {
            const { drama } = system.stageDrama({});
            let called = false;
            system.registerHook('dramaMastered', () => { called = true; });
            system.masterDrama(drama.dramaId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDramaValue', () => {
        it('should calculate', () => {
            const { drama } = system.stageDrama({});
            // level=1, drama=20, scenes=[] => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateDramaValue(drama.dramaId)).toBe(140);
        });

        it('should include scenes in calculation', () => {
            const { drama } = system.stageDrama({});
            system.addScene(drama.dramaId, { id: 's1' });
            system.addScene(drama.dramaId, { id: 's2' });
            // level=1, drama=20, scenes=2 => 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateDramaValue(drama.dramaId)).toBe(200);
        });

        it('should include level in calculation', () => {
            const { drama } = system.stageDrama({});
            system.levelUpDrama(drama.dramaId);
            system.levelUpDrama(drama.dramaId);
            // level=3, drama=20, scenes=[] => 3*100 + 20*2 + 0*30 = 340
            expect(system.calculateDramaValue(drama.dramaId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDramaValue('ghost')).toBe(0);
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

        it('should execute default getDrama', () => {
            const result = system.executeTool('getDrama', { dramaId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dramaStaged', () => count++);
            unregister();
            system.stageDrama({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dramaStaged', () => { throw new Error('x'); });
            expect(() => system.stageDrama({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDramas = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDramas = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.stageDrama({});
            const json = system.toJSON();
            expect(json.dramas.length).toBe(1);
        });
        it('should deserialize', () => {
            system.stageDrama({});
            const json = system.toJSON();
            const newSys = new CultivationDrama();
            newSys.fromJSON(json);
            expect(newSys.dramas.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dramaCount).toBe(0);
        });

        it('should reflect drama count after staging', () => {
            system.stageDrama({});
            const stats = system.getStats();
            expect(stats.dramaCount).toBe(1);
        });
    });
});
