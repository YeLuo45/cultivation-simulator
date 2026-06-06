/**
 * CultivationSpell.test.js - 道咒系统测试
 * V532 Iteration 14/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSpell } from '../../../systems/ai/CultivationSpell.js';

describe('CultivationSpell', () => {
    let system;
    beforeEach(() => { system = new CultivationSpell(); });

    describe('chantSpell', () => {
        it('should chant spell', () => {
            const { spell } = system.chantSpell({ cultivatorId: 'c1', name: 'Fire Lotus' });
            expect(spell.cultivatorId).toBe('c1');
            expect(spell.name).toBe('Fire Lotus');
        });

        it('should default to memorized status', () => {
            const { spell } = system.chantSpell({});
            expect(spell.status).toBe('memorized');
        });

        it('should default type to fire', () => {
            const { spell } = system.chantSpell({});
            expect(spell.type).toBe('fire');
        });

        it('should default potency to basePotency', () => {
            const { spell } = system.chantSpell({});
            expect(spell.potency).toBe(20);
        });

        it('should start at level 1', () => {
            const { spell } = system.chantSpell({});
            expect(spell.level).toBe(1);
        });

        it('should start with empty words', () => {
            const { spell } = system.chantSpell({});
            expect(spell.words).toEqual([]);
        });

        it('should generate spellId', () => {
            const { spell } = system.chantSpell({});
            expect(spell.spellId).toBeDefined();
            expect(typeof spell.spellId).toBe('string');
        });

        it('should accept custom spellId', () => {
            const { spell } = system.chantSpell({ spellId: 'my-spell' });
            expect(spell.spellId).toBe('my-spell');
        });

        it('should trigger spellChanted hook', () => {
            let called = false;
            system.registerHook('spellChanted', () => { called = true; });
            system.chantSpell({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { spell: s1 } = system.chantSpell({ type: 'fire' });
            const { spell: s2 } = system.chantSpell({ type: 'water' });
            const { spell: s3 } = system.chantSpell({ type: 'thunder' });
            expect(s1.type).toBe('fire');
            expect(s2.type).toBe('water');
            expect(s3.type).toBe('thunder');
        });
    });

    describe('getSpell', () => {
        it('should return spell', () => {
            const { spell } = system.chantSpell({});
            expect(system.getSpell(spell.spellId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSpell('ghost')).toBeNull(); });
    });

    describe('listSpells', () => {
        it('should list all', () => {
            system.chantSpell({});
            system.chantSpell({});
            expect(system.listSpells().length).toBe(2);
        });

        it('should return empty when no spells', () => {
            expect(system.listSpells().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.chantSpell({ cultivatorId: 'c1' });
            system.chantSpell({ cultivatorId: 'c2' });
            system.chantSpell({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c1').length).toBe(2);
        });

        it('should return empty for unknown cultivator', () => {
            system.chantSpell({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listManifested', () => {
        it('should filter manifested only', () => {
            const { spell: s1 } = system.chantSpell({});
            const { spell: s2 } = system.chantSpell({});
            system.manifestSpell(s1.spellId);
            const manifested = system.listManifested();
            expect(manifested.length).toBe(1);
            expect(manifested[0].spellId).toBe(s1.spellId);
            expect(s2.status).toBe('memorized');
        });

        it('should return empty when none manifested', () => {
            system.chantSpell({});
            expect(system.listManifested().length).toBe(0);
        });
    });

    describe('addWord', () => {
        it('should add word', () => {
            const { spell } = system.chantSpell({});
            system.addWord(spell.spellId, 'ignis');
            expect(spell.words).toContain('ignis');
        });

        it('should accumulate words', () => {
            const { spell } = system.chantSpell({});
            system.addWord(spell.spellId, 'w1');
            system.addWord(spell.spellId, 'w2');
            system.addWord(spell.spellId, 'w3');
            expect(spell.words.length).toBe(3);
        });

        it('should reject missing spell', () => {
            const result = system.addWord('ghost', 'w');
            expect(result.error).toBe('SPELL_NOT_FOUND');
        });

        it('should trigger wordAdded hook', () => {
            const { spell } = system.chantSpell({});
            let called = false;
            system.registerHook('wordAdded', () => { called = true; });
            system.addWord(spell.spellId, 'w');
            expect(called).toBe(true);
        });
    });

    describe('increasePotency', () => {
        it('should increase potency by default', () => {
            const { spell } = system.chantSpell({});
            system.increasePotency(spell.spellId);
            expect(spell.potency).toBe(25);
        });

        it('should increase potency by custom amount', () => {
            const { spell } = system.chantSpell({});
            system.increasePotency(spell.spellId, 100);
            expect(spell.potency).toBe(120);
        });

        it('should reject missing spell', () => {
            const result = system.increasePotency('ghost');
            expect(result.error).toBe('SPELL_NOT_FOUND');
        });

        it('should trigger potencyIncreased hook', () => {
            const { spell } = system.chantSpell({});
            let called = false;
            system.registerHook('potencyIncreased', () => { called = true; });
            system.increasePotency(spell.spellId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSpell', () => {
        it('should level up', () => {
            const { spell } = system.chantSpell({});
            system.levelUpSpell(spell.spellId);
            expect(spell.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { spell } = system.chantSpell({});
            system.levelUpSpell(spell.spellId);
            system.levelUpSpell(spell.spellId);
            system.levelUpSpell(spell.spellId);
            expect(spell.level).toBe(4);
        });

        it('should reject missing spell', () => {
            const result = system.levelUpSpell('ghost');
            expect(result.error).toBe('SPELL_NOT_FOUND');
        });

        it('should trigger spellLeveledUp hook', () => {
            const { spell } = system.chantSpell({});
            let called = false;
            system.registerHook('spellLeveledUp', () => { called = true; });
            system.levelUpSpell(spell.spellId);
            expect(called).toBe(true);
        });
    });

    describe('manifestSpell', () => {
        it('should manifest spell', () => {
            const { spell } = system.chantSpell({});
            system.manifestSpell(spell.spellId);
            expect(spell.status).toBe('manifested');
        });

        it('should reject missing spell', () => {
            const result = system.manifestSpell('ghost');
            expect(result.error).toBe('SPELL_NOT_FOUND');
        });

        it('should trigger spellManifested hook', () => {
            const { spell } = system.chantSpell({});
            let called = false;
            system.registerHook('spellManifested', () => { called = true; });
            system.manifestSpell(spell.spellId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSpellPower', () => {
        it('should calculate base power', () => {
            const { spell } = system.chantSpell({});
            // level=1, potency=20, words=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateSpellPower(spell.spellId)).toBe(140);
        });

        it('should include words in power', () => {
            const { spell } = system.chantSpell({});
            system.addWord(spell.spellId, 'w1');
            system.addWord(spell.spellId, 'w2');
            // level=1, potency=20, words=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateSpellPower(spell.spellId)).toBe(200);
        });

        it('should scale with level', () => {
            const { spell } = system.chantSpell({});
            system.levelUpSpell(spell.spellId);
            system.levelUpSpell(spell.spellId);
            // level=3, potency=20, words=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateSpellPower(spell.spellId)).toBe(340);
        });

        it('should scale with potency', () => {
            const { spell } = system.chantSpell({});
            system.increasePotency(spell.spellId, 100);
            // level=1, potency=120, words=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateSpellPower(spell.spellId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSpellPower('ghost')).toBe(0);
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

        it('should execute default getSpell', () => {
            const result = system.executeTool('getSpell', { spellId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default chantSpell', () => {
            const result = system.executeTool('chantSpell', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('spellChanted', () => count++);
            unregister();
            system.chantSpell({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('spellChanted', () => { throw new Error('x'); });
            expect(() => system.chantSpell({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSpells = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSpells = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.chantSpell({});
            const json = system.toJSON();
            expect(json.spells.length).toBe(1);
        });
        it('should deserialize', () => {
            system.chantSpell({});
            const json = system.toJSON();
            const newSys = new CultivationSpell();
            newSys.fromJSON(json);
            expect(newSys.spells.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.spellCount).toBe(0);
        });
    });
});
