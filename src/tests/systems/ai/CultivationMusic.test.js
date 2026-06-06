/**
 * CultivationMusic.test.js - 修真乐测试
 * V559 Iteration 2/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMusic } from '../../../systems/ai/CultivationMusic.js';

describe('CultivationMusic', () => {
    let system;
    beforeEach(() => { system = new CultivationMusic(); });

    describe('composeMusic', () => {
        it('should compose', () => {
            const { music } = system.composeMusic({ composerId: 'c1', name: 'Azure Dawn', type: 'ancient' });
            expect(music.composerId).toBe('c1');
            expect(music.name).toBe('Azure Dawn');
            expect(music.type).toBe('ancient');
        });

        it('should trigger musicComposed hook', () => {
            let called = false;
            system.registerHook('musicComposed', () => { called = true; });
            system.composeMusic({});
            expect(called).toBe(true);
        });

        it('should set default status to composing', () => {
            const { music } = system.composeMusic({});
            expect(music.status).toBe('composing');
        });

        it('should set default melody to baseMelody', () => {
            const { music } = system.composeMusic({});
            expect(music.melody).toBe(20);
        });
    });

    describe('getMusic', () => {
        it('should return', () => {
            const { music } = system.composeMusic({});
            expect(system.getMusic(music.musicId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMusic('ghost')).toBeNull(); });
    });

    describe('listMusic', () => {
        it('should list all', () => {
            system.composeMusic({});
            system.composeMusic({});
            expect(system.listMusic().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listMusic().length).toBe(0);
        });
    });

    describe('listByComposer', () => {
        it('should filter', () => {
            system.composeMusic({ composerId: 'c1' });
            system.composeMusic({ composerId: 'c2' });
            expect(system.listByComposer('c1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { music } = system.composeMusic({});
            system.legendMusic(music.musicId);
            system.composeMusic({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.composeMusic({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addInstrument', () => {
        it('should add instrument', () => {
            const { music } = system.composeMusic({});
            system.addInstrument(music.musicId, 'guzheng');
            expect(music.instruments.length).toBe(1);
            expect(music.instruments[0]).toBe('guzheng');
        });

        it('should add multiple instruments', () => {
            const { music } = system.composeMusic({});
            system.addInstrument(music.musicId, 'guzheng');
            system.addInstrument(music.musicId, 'xiao');
            expect(music.instruments.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addInstrument('ghost', 'guzheng');
            expect(result.error).toBe('MUSIC_NOT_FOUND');
        });

        it('should trigger instrumentAdded hook', () => {
            const { music } = system.composeMusic({});
            let called = false;
            system.registerHook('instrumentAdded', () => { called = true; });
            system.addInstrument(music.musicId, 'guzheng');
            expect(called).toBe(true);
        });
    });

    describe('increaseMelody', () => {
        it('should increase melody by default', () => {
            const { music } = system.composeMusic({});
            system.increaseMelody(music.musicId);
            expect(music.melody).toBe(25);
        });

        it('should increase melody by amount', () => {
            const { music } = system.composeMusic({});
            system.increaseMelody(music.musicId, 10);
            expect(music.melody).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.increaseMelody('ghost', 10);
            expect(result.error).toBe('MUSIC_NOT_FOUND');
        });

        it('should trigger melodyIncreased hook', () => {
            const { music } = system.composeMusic({});
            let called = false;
            system.registerHook('melodyIncreased', () => { called = true; });
            system.increaseMelody(music.musicId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMusic', () => {
        it('should level up', () => {
            const { music } = system.composeMusic({});
            system.levelUpMusic(music.musicId);
            expect(music.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpMusic('ghost');
            expect(result.error).toBe('MUSIC_NOT_FOUND');
        });
    });

    describe('legendMusic', () => {
        it('should mark as legendary', () => {
            const { music } = system.composeMusic({});
            system.legendMusic(music.musicId);
            expect(music.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMusic('ghost');
            expect(result.error).toBe('MUSIC_NOT_FOUND');
        });

        it('should trigger musicLegendized hook', () => {
            const { music } = system.composeMusic({});
            let called = false;
            system.registerHook('musicLegendized', () => { called = true; });
            system.legendMusic(music.musicId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMusicValue', () => {
        it('should calculate', () => {
            const { music } = system.composeMusic({});
            // level=1, melody=20, instruments=0: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateMusicValue(music.musicId)).toBe(140);
        });

        it('should calculate with instruments', () => {
            const { music } = system.composeMusic({});
            system.addInstrument(music.musicId, 'guzheng');
            system.addInstrument(music.musicId, 'xiao');
            // level=1, melody=20, instruments=2: 100 + 40 + 60 = 200
            expect(system.calculateMusicValue(music.musicId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMusicValue('ghost')).toBe(0);
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

        it('should execute default getMusic', () => {
            const result = system.executeTool('getMusic', { musicId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('musicComposed', () => count++);
            unregister();
            system.composeMusic({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('musicComposed', () => { throw new Error('x'); });
            expect(() => system.composeMusic({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMusic = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMusic = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.composeMusic({});
            const json = system.toJSON();
            expect(json.musics.length).toBe(1);
        });
        it('should deserialize', () => {
            system.composeMusic({});
            const json = system.toJSON();
            const newSys = new CultivationMusic();
            newSys.fromJSON(json);
            expect(newSys.musics.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.musicCount).toBe(0);
        });
    });
});
