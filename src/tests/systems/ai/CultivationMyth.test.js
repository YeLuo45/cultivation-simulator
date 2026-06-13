/**
 * CultivationMyth.test.js - 修真神话系统测试
 * V572 Iteration 15/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMyth } from '../../../systems/ai/CultivationMyth.js';

describe('CultivationMyth', () => {
    let system;
    beforeEach(() => { system = new CultivationMyth(); });

    describe('recordMyth', () => {
        it('should record a myth', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'Pangu', type: 'creation' });
            expect(myth.keeperId).toBe('k1');
            expect(myth.name).toBe('Pangu');
            expect(myth.type).toBe('creation');
        });

        it('should use baseMythos by default', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'Nuwa' });
            expect(myth.mythos).toBe(20);
        });

        it('should use custom mythos', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X', mythos: 99 });
            expect(myth.mythos).toBe(99);
        });

        it('should default gods to empty array', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            expect(myth.gods).toEqual([]);
        });

        it('should default type to creation', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            expect(myth.type).toBe('creation');
        });

        it('should default status to hidden', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            expect(myth.status).toBe('hidden');
        });

        it('should default level to 1', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            expect(myth.level).toBe(1);
        });

        it('should increment totalMyths stats', () => {
            system.recordMyth({ keeperId: 'k1', name: 'X' });
            expect(system.stats.totalMyths).toBe(1);
        });

        it('should trigger mythRecorded hook', () => {
            let called = false;
            system.registerHook('mythRecorded', () => { called = true; });
            system.recordMyth({ keeperId: 'k1', name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('getMyth', () => {
        it('should return myth', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            expect(system.getMyth(myth.mythId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMyth('ghost')).toBeNull(); });
        it('should return a copy not the reference', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            const result = system.getMyth(myth.mythId);
            result.name = 'mutated';
            expect(system.myths.get(myth.mythId).name).toBe('X');
        });
    });

    describe('listMyths', () => {
        it('should list all', () => {
            system.recordMyth({ keeperId: 'k1', name: 'A' });
            system.recordMyth({ keeperId: 'k2', name: 'B' });
            expect(system.listMyths().length).toBe(2);
        });
        it('should return empty array initially', () => {
            expect(system.listMyths()).toEqual([]);
        });
    });

    describe('listByKeeper', () => {
        it('should filter by keeper', () => {
            system.recordMyth({ keeperId: 'k1', name: 'A' });
            system.recordMyth({ keeperId: 'k2', name: 'B' });
            system.recordMyth({ keeperId: 'k1', name: 'C' });
            expect(system.listByKeeper('k1').length).toBe(2);
        });
        it('should return empty for unknown keeper', () => {
            system.recordMyth({ keeperId: 'k1', name: 'A' });
            expect(system.listByKeeper('unknown')).toEqual([]);
        });
    });

    describe('listEternal', () => {
        it('should filter eternal myths', () => {
            const { myth: a } = system.recordMyth({ keeperId: 'k1', name: 'A' });
            const { myth: b } = system.recordMyth({ keeperId: 'k1', name: 'B' });
            system.eternizeMyth(a.mythId);
            const eternal = system.listEternal();
            expect(eternal.length).toBe(1);
            expect(eternal[0].name).toBe('A');
        });
        it('should return empty when none eternal', () => {
            system.recordMyth({ keeperId: 'k1', name: 'A' });
            expect(system.listEternal()).toEqual([]);
        });
    });

    describe('addGod', () => {
        it('should add a god', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            system.addGod(myth.mythId, 'Jade Emperor');
            expect(myth.gods).toContain('Jade Emperor');
        });
        it('should reject missing myth', () => {
            const result = system.addGod('ghost', 'X');
            expect(result.error).toBe('MYTH_NOT_FOUND');
        });
        it('should trigger godAdded hook', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            let called = false;
            system.registerHook('godAdded', () => { called = true; });
            system.addGod(myth.mythId, 'X');
            expect(called).toBe(true);
        });
    });

    describe('deepenMythos', () => {
        it('should deepen mythos by default', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            system.deepenMythos(myth.mythId);
            expect(myth.mythos).toBe(25);
        });
        it('should deepen by custom amount', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            system.deepenMythos(myth.mythId, 50);
            expect(myth.mythos).toBe(70);
        });
        it('should reject missing myth', () => {
            const result = system.deepenMythos('ghost', 10);
            expect(result.error).toBe('MYTH_NOT_FOUND');
        });
        it('should trigger mythosDeepened hook', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            let called = false;
            system.registerHook('mythosDeepened', () => { called = true; });
            system.deepenMythos(myth.mythId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMyth', () => {
        it('should level up', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            system.levelUpMyth(myth.mythId);
            expect(myth.level).toBe(2);
        });
        it('should reject missing', () => {
            const result = system.levelUpMyth('ghost');
            expect(result.error).toBe('MYTH_NOT_FOUND');
        });
        it('should trigger mythLeveledUp hook', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            let called = false;
            system.registerHook('mythLeveledUp', () => { called = true; });
            system.levelUpMyth(myth.mythId);
            expect(called).toBe(true);
        });
    });

    describe('eternizeMyth', () => {
        it('should set status to eternal', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            system.eternizeMyth(myth.mythId);
            expect(myth.status).toBe('eternal');
        });
        it('should reject missing', () => {
            const result = system.eternizeMyth('ghost');
            expect(result.error).toBe('MYTH_NOT_FOUND');
        });
        it('should trigger mythEternalized hook', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            let called = false;
            system.registerHook('mythEternalized', () => { called = true; });
            system.eternizeMyth(myth.mythId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMythValue', () => {
        it('should calculate value', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            system.addGod(myth.mythId, 'G1');
            system.addGod(myth.mythId, 'G2');
            // level=1, mythos=20, gods.length=2 => 100 + 40 + 60 = 200
            expect(system.calculateMythValue(myth.mythId)).toBe(200);
        });
        it('should return 0 for missing', () => {
            expect(system.calculateMythValue('ghost')).toBe(0);
        });
        it('should scale with level', () => {
            const { myth } = system.recordMyth({ keeperId: 'k1', name: 'X' });
            system.levelUpMyth(myth.mythId);
            system.levelUpMyth(myth.mythId);
            // level=3, mythos=20, gods=0 => 300 + 40 + 0 = 340
            expect(system.calculateMythValue(myth.mythId)).toBe(340);
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
        it('should execute default recordMyth tool', () => {
            const result = system.executeTool('recordMyth', { keeperId: 'k1', name: 'X' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mythRecorded', () => count++);
            unregister();
            system.recordMyth({ keeperId: 'k1', name: 'X' });
            expect(count).toBe(0);
        });
        it('should handle errors silently', () => {
            system.registerHook('mythRecorded', () => { throw new Error('x'); });
            expect(() => system.recordMyth({ keeperId: 'k1', name: 'X' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMyths = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMyths = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recordMyth({ keeperId: 'k1', name: 'X' });
            const json = system.toJSON();
            expect(json.myths.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recordMyth({ keeperId: 'k1', name: 'X' });
            const json = system.toJSON();
            const newSys = new CultivationMyth();
            newSys.fromJSON(json);
            expect(newSys.myths.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mythCount).toBe(0);
            expect(stats.totalMyths).toBe(0);
        });
    });

    describe('config', () => {
        it('should accept custom config', () => {
            const s = new CultivationMyth({ maxMyths: 50, baseMythos: 100 });
            expect(s.config.maxMyths).toBe(50);
            expect(s.config.baseMythos).toBe(100);
        });
    });
});
