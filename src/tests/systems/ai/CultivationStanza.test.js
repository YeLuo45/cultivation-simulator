/**
 * CultivationStanza.test.js - 修真段系统测试
 * V781 Iteration 14/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationStanza } from '../../../systems/ai/CultivationStanza.js';

describe('CultivationStanza', () => {
    let system;
    beforeEach(() => { system = new CultivationStanza(); });

    describe('recruitStanza', () => {
        it('should recruit a stanza', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1', name: 'Heaven Verse', type: 'quatrain' });
            expect(stanza.masterId).toBe('m1');
            expect(stanza.name).toBe('Heaven Verse');
            expect(stanza.type).toBe('quatrain');
        });

        it('should set defaults for missing fields', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            expect(stanza.name).toBe('Unnamed Stanza');
            expect(stanza.type).toBe('quatrain');
            expect(stanza.depth).toBe(20);
            expect(stanza.lines).toEqual([]);
            expect(stanza.level).toBe(1);
            expect(stanza.status).toBe('novice');
        });

        it('should support sestet and octave types', () => {
            const { stanza: s1 } = system.recruitStanza({ masterId: 'm1', type: 'sestet' });
            const { stanza: s2 } = system.recruitStanza({ masterId: 'm1', type: 'octave' });
            expect(s1.type).toBe('sestet');
            expect(s2.type).toBe('octave');
        });

        it('should increment totalStanzas', () => {
            system.recruitStanza({ masterId: 'm1' });
            expect(system.stats.totalStanzas).toBe(1);
        });

        it('should trigger stanzaRecruited hook', () => {
            let called = false;
            system.registerHook('stanzaRecruited', () => { called = true; });
            system.recruitStanza({ masterId: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('getStanza', () => {
        it('should return the stanza', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            const fetched = system.getStanza(stanza.stanzaId);
            expect(fetched).not.toBeNull();
            expect(fetched.stanzaId).toBe(stanza.stanzaId);
        });

        it('should return a copy (not reference)', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            const fetched = system.getStanza(stanza.stanzaId);
            fetched.name = 'Changed';
            expect(system.getStanza(stanza.stanzaId).name).toBe('Unnamed Stanza');
        });

        it('should return null for missing', () => {
            expect(system.getStanza('ghost')).toBeNull();
        });
    });

    describe('listStanzas', () => {
        it('should list all stanzas', () => {
            system.recruitStanza({ masterId: 'm1' });
            system.recruitStanza({ masterId: 'm2' });
            expect(system.listStanzas().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listStanzas()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitStanza({ masterId: 'm1' });
            system.recruitStanza({ masterId: 'm2' });
            system.recruitStanza({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitStanza({ masterId: 'm1' });
            expect(system.listByMaster('unknown')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter by legendary status', () => {
            const { stanza: s1 } = system.recruitStanza({ masterId: 'm1' });
            system.recruitStanza({ masterId: 'm1' });
            system.legendStanza(s1.stanzaId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitStanza({ masterId: 'm1' });
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addLine', () => {
        it('should add a line', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            system.addLine(stanza.stanzaId, 'First line of verse');
            expect(stanza.lines.length).toBe(1);
            expect(stanza.lines[0]).toBe('First line of verse');
        });

        it('should add multiple lines', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            system.addLine(stanza.stanzaId, 'Line A');
            system.addLine(stanza.stanzaId, 'Line B');
            expect(stanza.lines.length).toBe(2);
        });

        it('should reject missing stanza', () => {
            const result = system.addLine('ghost', 'line');
            expect(result.error).toBe('STANZA_NOT_FOUND');
        });

        it('should trigger lineAdded hook', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            let received = null;
            system.registerHook('lineAdded', (data) => { received = data; });
            system.addLine(stanza.stanzaId, 'Test line');
            expect(received).not.toBeNull();
            expect(received.newLine).toBe('Test line');
            expect(received.totalLines).toBe(1);
        });
    });

    describe('raiseDepth', () => {
        it('should raise depth by default 5', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            system.raiseDepth(stanza.stanzaId);
            expect(stanza.depth).toBe(25);
        });

        it('should raise depth by custom amount', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            system.raiseDepth(stanza.stanzaId, 10);
            expect(stanza.depth).toBe(30);
        });

        it('should reject missing stanza', () => {
            const result = system.raiseDepth('ghost', 5);
            expect(result.error).toBe('STANZA_NOT_FOUND');
        });

        it('should trigger depthRaised hook', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            let received = null;
            system.registerHook('depthRaised', (data) => { received = data; });
            system.raiseDepth(stanza.stanzaId, 7);
            expect(received).not.toBeNull();
            expect(received.newDepth).toBe(27);
        });
    });

    describe('levelUpStanza', () => {
        it('should level up', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            system.levelUpStanza(stanza.stanzaId);
            expect(stanza.level).toBe(2);
        });

        it('should reject missing stanza', () => {
            const result = system.levelUpStanza('ghost');
            expect(result.error).toBe('STANZA_NOT_FOUND');
        });

        it('should trigger stanzaLeveledUp hook', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            let called = false;
            system.registerHook('stanzaLeveledUp', () => { called = true; });
            system.levelUpStanza(stanza.stanzaId);
            expect(called).toBe(true);
        });
    });

    describe('legendStanza', () => {
        it('should set status to legendary', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            system.legendStanza(stanza.stanzaId);
            expect(stanza.status).toBe('legendary');
        });

        it('should reject missing stanza', () => {
            const result = system.legendStanza('ghost');
            expect(result.error).toBe('STANZA_NOT_FOUND');
        });

        it('should trigger stanzaLegendized hook', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            let called = false;
            system.registerHook('stanzaLegendized', () => { called = true; });
            system.legendStanza(stanza.stanzaId);
            expect(called).toBe(true);
        });
    });

    describe('calculateStanzaValue', () => {
        it('should calculate value as level*100 + depth*2 + lines*30', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            // level=1, depth=20, lines=[] => 100 + 40 + 0 = 140
            expect(system.calculateStanzaValue(stanza.stanzaId)).toBe(140);
        });

        it('should include lines in calculation', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            system.addLine(stanza.stanzaId, 'A');
            system.addLine(stanza.stanzaId, 'B');
            // level=1, depth=20, lines=2 => 100 + 40 + 60 = 200
            expect(system.calculateStanzaValue(stanza.stanzaId)).toBe(200);
        });

        it('should reflect level and depth changes', () => {
            const { stanza } = system.recruitStanza({ masterId: 'm1' });
            system.levelUpStanza(stanza.stanzaId);
            system.raiseDepth(stanza.stanzaId, 10);
            // level=2, depth=30, lines=0 => 200 + 60 + 0 = 260
            expect(system.calculateStanzaValue(stanza.stanzaId)).toBe(260);
        });

        it('should return 0 for missing stanza', () => {
            expect(system.calculateStanzaValue('ghost')).toBe(0);
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

        it('should execute default recruitStanza tool', () => {
            const result = system.executeTool('recruitStanza', { masterId: 'm1', name: 'Tool Verse' });
            expect(result.success).toBe(true);
            expect(result.result.stanza.name).toBe('Tool Verse');
        });

        it('should execute default getStanza tool', () => {
            const result = system.executeTool('getStanza', { stanzaId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('stanzaRecruited', () => count++);
            unregister();
            system.recruitStanza({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('stanzaRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitStanza({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalStanzas = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalStanzas = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitStanza({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.stanzas.length).toBe(1);
            expect(json.stats.totalStanzas).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitStanza({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationStanza();
            newSys.fromJSON(json);
            expect(newSys.stanzas.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.stanzaCount).toBe(0);
            expect(stats.totalStanzas).toBe(0);
        });
    });
});
