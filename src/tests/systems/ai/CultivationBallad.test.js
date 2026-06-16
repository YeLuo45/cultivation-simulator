/**
 * CultivationBallad.test.js - 修真歌谣测试
 * V779 Iteration 12/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBallad } from '../../../systems/ai/CultivationBallad.js';

describe('CultivationBallad', () => {
    let system;
    beforeEach(() => { system = new CultivationBallad(); });

    describe('recruitBallad', () => {
        it('should recruit', () => {
            const { ballad } = system.recruitBallad({ masterId: 'm1', name: 'Wind Song', type: 'folk' });
            expect(ballad.masterId).toBe('m1');
            expect(ballad.name).toBe('Wind Song');
            expect(ballad.type).toBe('folk');
        });

        it('should trigger balladRecruited hook', () => {
            let called = false;
            system.registerHook('balladRecruited', () => { called = true; });
            system.recruitBallad({});
            expect(called).toBe(true);
        });

        it('should set default status to novice', () => {
            const { ballad } = system.recruitBallad({});
            expect(ballad.status).toBe('novice');
        });

        it('should set default tune to baseTune', () => {
            const { ballad } = system.recruitBallad({});
            expect(ballad.tune).toBe(20);
        });
    });

    describe('getBallad', () => {
        it('should return', () => {
            const { ballad } = system.recruitBallad({});
            expect(system.getBallad(ballad.balladId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBallad('ghost')).toBeNull(); });
    });

    describe('listBallads', () => {
        it('should list all', () => {
            system.recruitBallad({});
            system.recruitBallad({});
            expect(system.listBallads().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listBallads().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitBallad({ masterId: 'm1' });
            system.recruitBallad({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { ballad } = system.recruitBallad({});
            system.legendBallad(ballad.balladId);
            system.recruitBallad({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitBallad({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addVerse', () => {
        it('should add verse', () => {
            const { ballad } = system.recruitBallad({});
            system.addVerse(ballad.balladId, 'Verse 1');
            expect(ballad.verses.length).toBe(1);
            expect(ballad.verses[0]).toBe('Verse 1');
        });

        it('should add multiple verses', () => {
            const { ballad } = system.recruitBallad({});
            system.addVerse(ballad.balladId, 'V1');
            system.addVerse(ballad.balladId, 'V2');
            expect(ballad.verses.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addVerse('ghost', 'verse');
            expect(result.error).toBe('BALLAD_NOT_FOUND');
        });

        it('should trigger verseAdded hook', () => {
            const { ballad } = system.recruitBallad({});
            let called = false;
            system.registerHook('verseAdded', () => { called = true; });
            system.addVerse(ballad.balladId, 'verse');
            expect(called).toBe(true);
        });
    });

    describe('raiseTune', () => {
        it('should raise tune by default', () => {
            const { ballad } = system.recruitBallad({});
            system.raiseTune(ballad.balladId);
            expect(ballad.tune).toBe(25);
        });

        it('should raise tune by amount', () => {
            const { ballad } = system.recruitBallad({});
            system.raiseTune(ballad.balladId, 10);
            expect(ballad.tune).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseTune('ghost', 10);
            expect(result.error).toBe('BALLAD_NOT_FOUND');
        });

        it('should trigger tuneRaised hook', () => {
            const { ballad } = system.recruitBallad({});
            let called = false;
            system.registerHook('tuneRaised', () => { called = true; });
            system.raiseTune(ballad.balladId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBallad', () => {
        it('should level up', () => {
            const { ballad } = system.recruitBallad({});
            system.levelUpBallad(ballad.balladId);
            expect(ballad.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpBallad('ghost');
            expect(result.error).toBe('BALLAD_NOT_FOUND');
        });
    });

    describe('legendBallad', () => {
        it('should mark as legendary', () => {
            const { ballad } = system.recruitBallad({});
            system.legendBallad(ballad.balladId);
            expect(ballad.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBallad('ghost');
            expect(result.error).toBe('BALLAD_NOT_FOUND');
        });

        it('should trigger balladLegendized hook', () => {
            const { ballad } = system.recruitBallad({});
            let called = false;
            system.registerHook('balladLegendized', () => { called = true; });
            system.legendBallad(ballad.balladId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBalladValue', () => {
        it('should calculate', () => {
            const { ballad } = system.recruitBallad({});
            // level=1, tune=20, verses=0: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateBalladValue(ballad.balladId)).toBe(140);
        });

        it('should calculate with verses', () => {
            const { ballad } = system.recruitBallad({});
            system.addVerse(ballad.balladId, 'V1');
            system.addVerse(ballad.balladId, 'V2');
            // level=1, tune=20, verses=2: 100 + 40 + 60 = 200
            expect(system.calculateBalladValue(ballad.balladId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBalladValue('ghost')).toBe(0);
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

        it('should execute default getBallad', () => {
            const result = system.executeTool('getBallad', { balladId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('balladRecruited', () => count++);
            unregister();
            system.recruitBallad({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('balladRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBallad({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBallads = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBallads = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBallad({});
            const json = system.toJSON();
            expect(json.ballads.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBallad({});
            const json = system.toJSON();
            const newSys = new CultivationBallad();
            newSys.fromJSON(json);
            expect(newSys.ballads.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.balladCount).toBe(0);
        });
    });
});
