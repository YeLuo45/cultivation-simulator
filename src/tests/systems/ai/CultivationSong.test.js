/**
 * CultivationSong.test.js - 修真歌测试
 * V778 Iteration 11/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSong } from '../../../systems/ai/CultivationSong.js';

describe('CultivationSong', () => {
    let system;
    beforeEach(() => { system = new CultivationSong(); });

    describe('recruitSong', () => {
        it('should recruit', () => {
            const { song } = system.recruitSong({ masterId: 'm1', name: 'River Chant', type: 'folk' });
            expect(song.masterId).toBe('m1');
            expect(song.name).toBe('River Chant');
            expect(song.type).toBe('folk');
        });

        it('should trigger songRecruited hook', () => {
            let called = false;
            system.registerHook('songRecruited', () => { called = true; });
            system.recruitSong({});
            expect(called).toBe(true);
        });

        it('should set default status to novice', () => {
            const { song } = system.recruitSong({});
            expect(song.status).toBe('novice');
        });

        it('should set default melody to baseMelody', () => {
            const { song } = system.recruitSong({});
            expect(song.melody).toBe(20);
        });
    });

    describe('getSong', () => {
        it('should return', () => {
            const { song } = system.recruitSong({});
            expect(system.getSong(song.songId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSong('ghost')).toBeNull(); });
    });

    describe('listSongs', () => {
        it('should list all', () => {
            system.recruitSong({});
            system.recruitSong({});
            expect(system.listSongs().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listSongs().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitSong({ masterId: 'm1' });
            system.recruitSong({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { song } = system.recruitSong({});
            system.legendSong(song.songId);
            system.recruitSong({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitSong({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addRefrain', () => {
        it('should add refrain', () => {
            const { song } = system.recruitSong({});
            system.addRefrain(song.songId, 'ohhhh');
            expect(song.refrains.length).toBe(1);
            expect(song.refrains[0]).toBe('ohhhh');
        });

        it('should add multiple refrains', () => {
            const { song } = system.recruitSong({});
            system.addRefrain(song.songId, 'first');
            system.addRefrain(song.songId, 'second');
            expect(song.refrains.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addRefrain('ghost', 'ohhhh');
            expect(result.error).toBe('SONG_NOT_FOUND');
        });

        it('should trigger refrainAdded hook', () => {
            const { song } = system.recruitSong({});
            let called = false;
            system.registerHook('refrainAdded', () => { called = true; });
            system.addRefrain(song.songId, 'ohhhh');
            expect(called).toBe(true);
        });
    });

    describe('raiseMelody', () => {
        it('should raise melody by default', () => {
            const { song } = system.recruitSong({});
            system.raiseMelody(song.songId);
            expect(song.melody).toBe(25);
        });

        it('should raise melody by amount', () => {
            const { song } = system.recruitSong({});
            system.raiseMelody(song.songId, 10);
            expect(song.melody).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseMelody('ghost', 10);
            expect(result.error).toBe('SONG_NOT_FOUND');
        });

        it('should trigger melodyRaised hook', () => {
            const { song } = system.recruitSong({});
            let called = false;
            system.registerHook('melodyRaised', () => { called = true; });
            system.raiseMelody(song.songId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSong', () => {
        it('should level up', () => {
            const { song } = system.recruitSong({});
            system.levelUpSong(song.songId);
            expect(song.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSong('ghost');
            expect(result.error).toBe('SONG_NOT_FOUND');
        });
    });

    describe('legendSong', () => {
        it('should mark as legendary', () => {
            const { song } = system.recruitSong({});
            system.legendSong(song.songId);
            expect(song.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSong('ghost');
            expect(result.error).toBe('SONG_NOT_FOUND');
        });

        it('should trigger songLegendized hook', () => {
            const { song } = system.recruitSong({});
            let called = false;
            system.registerHook('songLegendized', () => { called = true; });
            system.legendSong(song.songId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSongValue', () => {
        it('should calculate', () => {
            const { song } = system.recruitSong({});
            // level=1, melody=20, refrains=0: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateSongValue(song.songId)).toBe(140);
        });

        it('should calculate with refrains', () => {
            const { song } = system.recruitSong({});
            system.addRefrain(song.songId, 'first');
            system.addRefrain(song.songId, 'second');
            // level=1, melody=20, refrains=2: 100 + 40 + 60 = 200
            expect(system.calculateSongValue(song.songId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSongValue('ghost')).toBe(0);
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

        it('should execute default getSong', () => {
            const result = system.executeTool('getSong', { songId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('songRecruited', () => count++);
            unregister();
            system.recruitSong({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('songRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSong({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSongs = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSongs = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSong({});
            const json = system.toJSON();
            expect(json.songs.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSong({});
            const json = system.toJSON();
            const newSys = new CultivationSong();
            newSys.fromJSON(json);
            expect(newSys.songs.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.songCount).toBe(0);
        });
    });
});
