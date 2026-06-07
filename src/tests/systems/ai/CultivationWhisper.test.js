/**
 * CultivationWhisper.test.js - 修真低语系统测试
 * V773 Iteration 6/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWhisper } from '../../../systems/ai/CultivationWhisper.js';

describe('CultivationWhisper', () => {
    let system;
    beforeEach(() => { system = new CultivationWhisper(); });

    describe('recruitWhisper', () => {
        it('should recruit with given fields', () => {
            const { whisper } = system.recruitWhisper({ masterId: 'm1', name: 'Soft Whisper', type: 'gentle' });
            expect(whisper.masterId).toBe('m1');
            expect(whisper.name).toBe('Soft Whisper');
            expect(whisper.type).toBe('gentle');
        });

        it('should default type to gentle and softness to 20', () => {
            const { whisper } = system.recruitWhisper({ masterId: 'm1' });
            expect(whisper.type).toBe('gentle');
            expect(whisper.softness).toBe(20);
            expect(whisper.level).toBe(1);
            expect(whisper.status).toBe('novice');
            expect(whisper.secrets).toEqual([]);
        });

        it('should generate a whisperId when not provided', () => {
            const { whisper } = system.recruitWhisper({});
            expect(whisper.whisperId).toBeTruthy();
            expect(typeof whisper.whisperId).toBe('string');
        });

        it('should accept provided whisperId', () => {
            const { whisper } = system.recruitWhisper({ whisperId: 'custom-id-123' });
            expect(whisper.whisperId).toBe('custom-id-123');
        });

        it('should increment totalWhispers stat', () => {
            system.recruitWhisper({});
            system.recruitWhisper({});
            expect(system.stats.totalWhispers).toBe(2);
        });

        it('should trigger whisperRecruited hook', () => {
            let called = false;
            system.registerHook('whisperRecruited', () => { called = true; });
            system.recruitWhisper({});
            expect(called).toBe(true);
        });
    });

    describe('getWhisper', () => {
        it('should return whisper copy', () => {
            const { whisper } = system.recruitWhisper({});
            const found = system.getWhisper(whisper.whisperId);
            expect(found).not.toBeNull();
            expect(found.whisperId).toBe(whisper.whisperId);
        });
        it('should return null for missing', () => { expect(system.getWhisper('ghost')).toBeNull(); });
    });

    describe('listWhispers', () => {
        it('should list all whispers', () => {
            system.recruitWhisper({});
            system.recruitWhisper({});
            system.recruitWhisper({});
            expect(system.listWhispers().length).toBe(3);
        });

        it('should return empty list when no whispers', () => {
            expect(system.listWhispers().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitWhisper({ masterId: 'm1' });
            system.recruitWhisper({ masterId: 'm2' });
            system.recruitWhisper({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary whispers', () => {
            const { whisper: a } = system.recruitWhisper({});
            const { whisper: b } = system.recruitWhisper({});
            system.legendWhisper(a.whisperId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].whisperId).toBe(a.whisperId);
            expect(b.status).toBe('novice');
        });

        it('should return empty list when no legendary', () => {
            system.recruitWhisper({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addSecret', () => {
        it('should add a secret to whisper', () => {
            const { whisper } = system.recruitWhisper({});
            const result = system.addSecret(whisper.whisperId, 'dao_insight');
            expect(result.success).toBe(true);
            expect(whisper.secrets).toContain('dao_insight');
        });

        it('should add multiple secrets', () => {
            const { whisper } = system.recruitWhisper({});
            system.addSecret(whisper.whisperId, 'truth_1');
            system.addSecret(whisper.whisperId, 'truth_2');
            expect(whisper.secrets.length).toBe(2);
        });

        it('should reject missing whisper', () => {
            const result = system.addSecret('ghost', 'truth');
            expect(result.error).toBe('WHISPER_NOT_FOUND');
        });

        it('should trigger secretAdded hook', () => {
            const { whisper } = system.recruitWhisper({});
            let called = false;
            system.registerHook('secretAdded', () => { called = true; });
            system.addSecret(whisper.whisperId, 'truth');
            expect(called).toBe(true);
        });
    });

    describe('raiseSoftness', () => {
        it('should raise softness by default 5', () => {
            const { whisper } = system.recruitWhisper({});
            system.raiseSoftness(whisper.whisperId);
            expect(whisper.softness).toBe(25);
        });

        it('should raise softness by custom amount', () => {
            const { whisper } = system.recruitWhisper({});
            system.raiseSoftness(whisper.whisperId, 30);
            expect(whisper.softness).toBe(50);
        });

        it('should reject missing whisper', () => {
            const result = system.raiseSoftness('ghost', 10);
            expect(result.error).toBe('WHISPER_NOT_FOUND');
        });

        it('should trigger softnessRaised hook', () => {
            const { whisper } = system.recruitWhisper({});
            let called = false;
            system.registerHook('softnessRaised', () => { called = true; });
            system.raiseSoftness(whisper.whisperId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWhisper', () => {
        it('should increase level by 1', () => {
            const { whisper } = system.recruitWhisper({});
            system.levelUpWhisper(whisper.whisperId);
            expect(whisper.level).toBe(2);
        });

        it('should increase level multiple times', () => {
            const { whisper } = system.recruitWhisper({});
            system.levelUpWhisper(whisper.whisperId);
            system.levelUpWhisper(whisper.whisperId);
            system.levelUpWhisper(whisper.whisperId);
            expect(whisper.level).toBe(4);
        });

        it('should reject missing whisper', () => {
            const result = system.levelUpWhisper('ghost');
            expect(result.error).toBe('WHISPER_NOT_FOUND');
        });

        it('should trigger whisperLeveledUp hook', () => {
            const { whisper } = system.recruitWhisper({});
            let called = false;
            system.registerHook('whisperLeveledUp', () => { called = true; });
            system.levelUpWhisper(whisper.whisperId);
            expect(called).toBe(true);
        });
    });

    describe('legendWhisper', () => {
        it('should set status to legendary', () => {
            const { whisper } = system.recruitWhisper({});
            system.legendWhisper(whisper.whisperId);
            expect(whisper.status).toBe('legendary');
        });

        it('should reject missing whisper', () => {
            const result = system.legendWhisper('ghost');
            expect(result.error).toBe('WHISPER_NOT_FOUND');
        });

        it('should trigger whisperLegendized hook', () => {
            const { whisper } = system.recruitWhisper({});
            let called = false;
            system.registerHook('whisperLegendized', () => { called = true; });
            system.legendWhisper(whisper.whisperId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWhisperValue', () => {
        it('should calculate value with default stats', () => {
            const { whisper } = system.recruitWhisper({});
            // level=1 * 100 + softness=20 * 2 + secrets=0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateWhisperValue(whisper.whisperId)).toBe(140);
        });

        it('should calculate value with secrets and leveled up', () => {
            const { whisper } = system.recruitWhisper({});
            system.levelUpWhisper(whisper.whisperId);
            system.levelUpWhisper(whisper.whisperId);
            system.addSecret(whisper.whisperId, 'truth_1');
            system.addSecret(whisper.whisperId, 'truth_2');
            // level=3 * 100 + softness=20 * 2 + secrets=2 * 30 = 300 + 40 + 60 = 400
            expect(system.calculateWhisperValue(whisper.whisperId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWhisperValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register and list tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute custom tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });

        it('should execute default getWhisper tool', () => {
            const { whisper } = system.recruitWhisper({});
            const result = system.executeTool('getWhisper', { whisperId: whisper.whisperId });
            expect(result.success).toBe(true);
            expect(result.result.whisperId).toBe(whisper.whisperId);
        });

        it('should execute default recruitWhisper tool', () => {
            const result = system.executeTool('recruitWhisper', { masterId: 'm1', name: 'X', type: 'sharp' });
            expect(result.success).toBe(true);
            expect(result.result.whisper.masterId).toBe('m1');
        });

        it('should handle null context', () => {
            system.registerTool('ctxTest', (ctx) => ctx);
            const result = system.executeTool('ctxTest');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('whisperRecruited', () => count++);
            unregister();
            system.recruitWhisper({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('whisperRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitWhisper({})).not.toThrow();
        });

        it('should handle unregister for missing event', () => {
            const unregister = system.registerHook('nonexistent', () => {});
            unregister();
            expect(true).toBe(true);
        });

        it('should handle double unregister', () => {
            let count = 0;
            const unregister = system.registerHook('whisperRecruited', () => count++);
            unregister();
            unregister();
            system.recruitWhisper({});
            expect(count).toBe(0);
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient whispers', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalWhispers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxWhispers).toBe(40);
        });
        it('should not double evolve', () => {
            system.stats.totalWhispers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitWhisper({});
            system.recruitWhisper({});
            const json = system.toJSON();
            expect(json.whispers.length).toBe(2);
            expect(json.stats.totalWhispers).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitWhisper({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationWhisper();
            newSys.fromJSON(json);
            expect(newSys.whispers.size).toBe(1);
            expect(newSys.stats.totalWhispers).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitWhisper({});
            const stats = system.getStats();
            expect(stats.whisperCount).toBe(1);
            expect(stats.totalWhispers).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });

    describe('Constructor', () => {
        it('should accept custom config', () => {
            const custom = new CultivationWhisper({ maxWhispers: 50, baseSoftness: 30 });
            expect(custom.config.maxWhispers).toBe(50);
            expect(custom.config.baseSoftness).toBe(30);
        });
    });
});
