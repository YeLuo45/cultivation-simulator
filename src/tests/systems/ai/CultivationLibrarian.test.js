/**
 * CultivationLibrarian.test.js - 修真图书系统测试
 * V712 Iteration 5/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLibrarian } from '../../../systems/ai/CultivationLibrarian.js';

describe('CultivationLibrarian', () => {
    let system;
    beforeEach(() => { system = new CultivationLibrarian(); });

    describe('recruitLibrarian', () => {
        it('should recruit', () => {
            const { librarian } = system.recruitLibrarian({ masterId: 'm1', name: 'Keeper of Tomes' });
            expect(librarian.name).toBe('Keeper of Tomes');
            expect(librarian.masterId).toBe('m1');
            expect(librarian.status).toBe('novice');
            expect(librarian.level).toBe(1);
            expect(librarian.knowledge).toBe(20);
        });

        it('should use default type', () => {
            const { librarian } = system.recruitLibrarian({});
            expect(librarian.type).toBe('ancient');
        });

        it('should accept custom type', () => {
            const { librarian } = system.recruitLibrarian({ type: 'divine' });
            expect(librarian.type).toBe('divine');
        });

        it('should accept sacred type', () => {
            const { librarian } = system.recruitLibrarian({ type: 'sacred' });
            expect(librarian.type).toBe('sacred');
        });

        it('should accept custom id', () => {
            const { librarian } = system.recruitLibrarian({ librarianId: 'custom_lbr_1' });
            expect(librarian.librarianId).toBe('custom_lbr_1');
        });

        it('should trigger librarianRecruited hook', () => {
            let called = false;
            system.registerHook('librarianRecruited', () => { called = true; });
            system.recruitLibrarian({});
            expect(called).toBe(true);
        });
    });

    describe('getLibrarian', () => {
        it('should return', () => {
            const { librarian } = system.recruitLibrarian({});
            expect(system.getLibrarian(librarian.librarianId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLibrarian('ghost')).toBeNull(); });
    });

    describe('listLibrarians', () => {
        it('should list all', () => {
            system.recruitLibrarian({});
            system.recruitLibrarian({});
            expect(system.listLibrarians().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listLibrarians().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitLibrarian({ masterId: 'm1' });
            system.recruitLibrarian({ masterId: 'm2' });
            system.recruitLibrarian({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
        it('should return empty for unknown', () => {
            system.recruitLibrarian({});
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { librarian: b1 } = system.recruitLibrarian({});
            const { librarian: b2 } = system.recruitLibrarian({});
            system.legendLibrarian(b1.brewerId || b1.librarianId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitLibrarian({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addScroll', () => {
        it('should add scroll', () => {
            const { librarian } = system.recruitLibrarian({});
            system.addScroll(librarian.librarianId, { name: 'Jade Scroll', tier: 5 });
            expect(librarian.scrolls.length).toBe(1);
        });

        it('should add multiple scrolls', () => {
            const { librarian } = system.recruitLibrarian({});
            system.addScroll(librarian.librarianId, { name: 's1' });
            system.addScroll(librarian.librarianId, { name: 's2' });
            system.addScroll(librarian.librarianId, { name: 's3' });
            expect(librarian.scrolls.length).toBe(3);
        });

        it('should reject missing librarian', () => {
            const result = system.addScroll('ghost', { name: 'x' });
            expect(result.error).toBe('LIBRARIAN_NOT_FOUND');
        });

        it('should trigger scrollAdded hook', () => {
            const { librarian } = system.recruitLibrarian({});
            let called = false;
            system.registerHook('scrollAdded', () => { called = true; });
            system.addScroll(librarian.librarianId, { name: 'Sacred Tome' });
            expect(called).toBe(true);
        });
    });

    describe('raiseKnowledge', () => {
        it('should raise with default amount', () => {
            const { librarian } = system.recruitLibrarian({});
            system.raiseKnowledge(librarian.librarianId);
            expect(librarian.knowledge).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { librarian } = system.recruitLibrarian({});
            system.raiseKnowledge(librarian.librarianId, 15);
            expect(librarian.knowledge).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.raiseKnowledge('ghost');
            expect(result.error).toBe('LIBRARIAN_NOT_FOUND');
        });

        it('should trigger knowledgeRaised hook', () => {
            const { librarian } = system.recruitLibrarian({});
            let called = false;
            system.registerHook('knowledgeRaised', () => { called = true; });
            system.raiseKnowledge(librarian.librarianId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpLibrarian', () => {
        it('should level up', () => {
            const { librarian } = system.recruitLibrarian({});
            system.levelUpLibrarian(librarian.librarianId);
            expect(librarian.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { librarian } = system.recruitLibrarian({});
            system.levelUpLibrarian(librarian.librarianId);
            system.levelUpLibrarian(librarian.librarianId);
            system.levelUpLibrarian(librarian.librarianId);
            expect(librarian.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpLibrarian('ghost');
            expect(result.error).toBe('LIBRARIAN_NOT_FOUND');
        });

        it('should trigger librarianLeveledUp hook', () => {
            const { librarian } = system.recruitLibrarian({});
            let called = false;
            system.registerHook('librarianLeveledUp', () => { called = true; });
            system.levelUpLibrarian(librarian.librarianId);
            expect(called).toBe(true);
        });
    });

    describe('legendLibrarian', () => {
        it('should set status to legendary', () => {
            const { librarian } = system.recruitLibrarian({});
            system.legendLibrarian(librarian.librarianId);
            expect(librarian.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendLibrarian('ghost');
            expect(result.error).toBe('LIBRARIAN_NOT_FOUND');
        });

        it('should trigger librarianLegendized hook', () => {
            const { librarian } = system.recruitLibrarian({});
            let called = false;
            system.registerHook('librarianLegendized', () => { called = true; });
            system.legendLibrarian(librarian.librarianId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLibrarianValue', () => {
        it('should calculate', () => {
            const { librarian } = system.recruitLibrarian({});
            system.levelUpLibrarian(librarian.librarianId);
            system.raiseKnowledge(librarian.librarianId, 10);
            system.addScroll(librarian.librarianId, { name: 'Scroll1' });
            // level=2, knowledge=30, scrolls=1: 2*100 + 30*2 + 1*30 = 200+60+30 = 290
            expect(system.calculateLibrarianValue(librarian.librarianId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLibrarianValue('ghost')).toBe(0);
        });

        it('should calculate with multiple scrolls', () => {
            const { librarian } = system.recruitLibrarian({});
            system.addScroll(librarian.librarianId, { name: 's1' });
            system.addScroll(librarian.librarianId, { name: 's2' });
            system.addScroll(librarian.librarianId, { name: 's3' });
            // level=1, knowledge=20, scrolls=3: 100+40+90 = 230
            expect(system.calculateLibrarianValue(librarian.librarianId)).toBe(230);
        });

        it('should calculate base value', () => {
            const { librarian } = system.recruitLibrarian({});
            // level=1, knowledge=20, scrolls=0: 100+40+0 = 140
            expect(system.calculateLibrarianValue(librarian.librarianId)).toBe(140);
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

        it('should execute default getLibrarian tool', () => {
            const { librarian } = system.recruitLibrarian({ name: 'TestLibrarian' });
            const result = system.executeTool('getLibrarian', { librarianId: librarian.librarianId });
            expect(result.result.name).toBe('TestLibrarian');
        });

        it('should execute default recruitLibrarian tool', () => {
            const result = system.executeTool('recruitLibrarian', { name: 'ToolRecruited' });
            expect(result.success).toBe(true);
            expect(result.result.librarian.name).toBe('ToolRecruited');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('librarianRecruited', () => count++);
            unregister();
            system.recruitLibrarian({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('librarianRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitLibrarian({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLibrarians = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLibrarians = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitLibrarian({});
            const json = system.toJSON();
            expect(json.librarians.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitLibrarian({ name: 'Master Librarian' });
            const json = system.toJSON();
            const newSys = new CultivationLibrarian();
            newSys.fromJSON(json);
            expect(newSys.librarians.size).toBe(1);
            expect(newSys.getStats().totalLibrarians).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.librarianCount).toBe(0);
            expect(stats.totalLibrarians).toBe(0);
        });
    });
});
