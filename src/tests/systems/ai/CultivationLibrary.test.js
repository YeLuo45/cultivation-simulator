/**
 * CultivationLibrary.test.js - 修真图书馆系统测试
 * V716 Iteration 9/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLibrary } from '../../../systems/ai/CultivationLibrary.js';

describe('CultivationLibrary', () => {
    let system;
    beforeEach(() => { system = new CultivationLibrary(); });

    describe('recruitLibrary', () => {
        it('should recruit', () => {
            const { library } = system.recruitLibrary({ masterId: 'm1', name: 'Grand Library of Tomes' });
            expect(library.name).toBe('Grand Library of Tomes');
            expect(library.masterId).toBe('m1');
            expect(library.status).toBe('novice');
            expect(library.level).toBe(1);
            expect(library.archives).toBe(20);
        });

        it('should use default type', () => {
            const { library } = system.recruitLibrary({});
            expect(library.type).toBe('ancient');
        });

        it('should accept grand type', () => {
            const { library } = system.recruitLibrary({ type: 'grand' });
            expect(library.type).toBe('grand');
        });

        it('should accept sacred type', () => {
            const { library } = system.recruitLibrary({ type: 'sacred' });
            expect(library.type).toBe('sacred');
        });

        it('should accept custom id', () => {
            const { library } = system.recruitLibrary({ libraryId: 'custom_lib_1' });
            expect(library.libraryId).toBe('custom_lib_1');
        });

        it('should trigger libraryRecruited hook', () => {
            let called = false;
            system.registerHook('libraryRecruited', () => { called = true; });
            system.recruitLibrary({});
            expect(called).toBe(true);
        });
    });

    describe('getLibrary', () => {
        it('should return', () => {
            const { library } = system.recruitLibrary({});
            expect(system.getLibrary(library.libraryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLibrary('ghost')).toBeNull(); });
    });

    describe('listLibraries', () => {
        it('should list all', () => {
            system.recruitLibrary({});
            system.recruitLibrary({});
            expect(system.listLibraries().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listLibraries().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitLibrary({ masterId: 'm1' });
            system.recruitLibrary({ masterId: 'm2' });
            system.recruitLibrary({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
        it('should return empty for unknown', () => {
            system.recruitLibrary({});
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { library: l1 } = system.recruitLibrary({});
            const { library: l2 } = system.recruitLibrary({});
            system.legendLibrary(l1.libraryId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitLibrary({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTome', () => {
        it('should add tome', () => {
            const { library } = system.recruitLibrary({});
            system.addTome(library.libraryId, { name: 'Jade Tome', tier: 5 });
            expect(library.tomes.length).toBe(1);
        });

        it('should add multiple tomes', () => {
            const { library } = system.recruitLibrary({});
            system.addTome(library.libraryId, { name: 't1' });
            system.addTome(library.libraryId, { name: 't2' });
            system.addTome(library.libraryId, { name: 't3' });
            expect(library.tomes.length).toBe(3);
        });

        it('should reject missing library', () => {
            const result = system.addTome('ghost', { name: 'x' });
            expect(result.error).toBe('LIBRARY_NOT_FOUND');
        });

        it('should trigger tomeAdded hook', () => {
            const { library } = system.recruitLibrary({});
            let called = false;
            system.registerHook('tomeAdded', () => { called = true; });
            system.addTome(library.libraryId, { name: 'Sacred Tome' });
            expect(called).toBe(true);
        });
    });

    describe('raiseArchives', () => {
        it('should raise with default amount', () => {
            const { library } = system.recruitLibrary({});
            system.raiseArchives(library.libraryId);
            expect(library.archives).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { library } = system.recruitLibrary({});
            system.raiseArchives(library.libraryId, 15);
            expect(library.archives).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.raiseArchives('ghost');
            expect(result.error).toBe('LIBRARY_NOT_FOUND');
        });

        it('should trigger archivesRaised hook', () => {
            const { library } = system.recruitLibrary({});
            let called = false;
            system.registerHook('archivesRaised', () => { called = true; });
            system.raiseArchives(library.libraryId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpLibrary', () => {
        it('should level up', () => {
            const { library } = system.recruitLibrary({});
            system.levelUpLibrary(library.libraryId);
            expect(library.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { library } = system.recruitLibrary({});
            system.levelUpLibrary(library.libraryId);
            system.levelUpLibrary(library.libraryId);
            system.levelUpLibrary(library.libraryId);
            expect(library.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpLibrary('ghost');
            expect(result.error).toBe('LIBRARY_NOT_FOUND');
        });

        it('should trigger libraryLeveledUp hook', () => {
            const { library } = system.recruitLibrary({});
            let called = false;
            system.registerHook('libraryLeveledUp', () => { called = true; });
            system.levelUpLibrary(library.libraryId);
            expect(called).toBe(true);
        });
    });

    describe('legendLibrary', () => {
        it('should set status to legendary', () => {
            const { library } = system.recruitLibrary({});
            system.legendLibrary(library.libraryId);
            expect(library.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendLibrary('ghost');
            expect(result.error).toBe('LIBRARY_NOT_FOUND');
        });

        it('should trigger libraryLegendized hook', () => {
            const { library } = system.recruitLibrary({});
            let called = false;
            system.registerHook('libraryLegendized', () => { called = true; });
            system.legendLibrary(library.libraryId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLibraryValue', () => {
        it('should calculate', () => {
            const { library } = system.recruitLibrary({});
            system.levelUpLibrary(library.libraryId);
            system.raiseArchives(library.libraryId, 10);
            system.addTome(library.libraryId, { name: 'Tome1' });
            // level=2, archives=30, tomes=1: 2*100 + 30*2 + 1*30 = 200+60+30 = 290
            expect(system.calculateLibraryValue(library.libraryId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLibraryValue('ghost')).toBe(0);
        });

        it('should calculate with multiple tomes', () => {
            const { library } = system.recruitLibrary({});
            system.addTome(library.libraryId, { name: 't1' });
            system.addTome(library.libraryId, { name: 't2' });
            system.addTome(library.libraryId, { name: 't3' });
            // level=1, archives=20, tomes=3: 100+40+90 = 230
            expect(system.calculateLibraryValue(library.libraryId)).toBe(230);
        });

        it('should calculate base value', () => {
            const { library } = system.recruitLibrary({});
            // level=1, archives=20, tomes=0: 100+40+0 = 140
            expect(system.calculateLibraryValue(library.libraryId)).toBe(140);
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

        it('should execute default getLibrary tool', () => {
            const { library } = system.recruitLibrary({ name: 'TestLibrary' });
            const result = system.executeTool('getLibrary', { libraryId: library.libraryId });
            expect(result.result.name).toBe('TestLibrary');
        });

        it('should execute default recruitLibrary tool', () => {
            const result = system.executeTool('recruitLibrary', { name: 'ToolRecruited' });
            expect(result.success).toBe(true);
            expect(result.result.library.name).toBe('ToolRecruited');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('libraryRecruited', () => count++);
            unregister();
            system.recruitLibrary({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('libraryRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitLibrary({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLibraries = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLibraries = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitLibrary({});
            const json = system.toJSON();
            expect(json.libraries.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitLibrary({ name: 'Master Library' });
            const json = system.toJSON();
            const newSys = new CultivationLibrary();
            newSys.fromJSON(json);
            expect(newSys.libraries.size).toBe(1);
            expect(newSys.getStats().totalLibraries).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.libraryCount).toBe(0);
            expect(stats.totalLibraries).toBe(0);
        });
    });
});
