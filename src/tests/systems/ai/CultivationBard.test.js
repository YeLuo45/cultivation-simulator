/**
 * CultivationBard.test.js - 修真诗人测试
 * V614 Iteration 17/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBard } from '../../../systems/ai/CultivationBard.js';

describe('CultivationBard', () => {
    let system;
    beforeEach(() => { system = new CultivationBard(); });

    describe('recruitBard', () => {
        it('should recruit', () => {
            const { bard } = system.recruitBard({ mentorId: 'm1', name: 'Li Bai' });
            expect(bard.name).toBe('Li Bai');
            expect(bard.mentorId).toBe('m1');
            expect(bard.status).toBe('novice');
            expect(bard.level).toBe(1);
            expect(bard.charisma).toBe(20);
        });

        it('should use default type', () => {
            const { bard } = system.recruitBard({});
            expect(bard.type).toBe('epic');
        });

        it('should accept custom type', () => {
            const { bard } = system.recruitBard({ type: 'romantic' });
            expect(bard.type).toBe('romantic');
        });

        it('should trigger bardRecruited hook', () => {
            let called = false;
            system.registerHook('bardRecruited', () => { called = true; });
            system.recruitBard({});
            expect(called).toBe(true);
        });
    });

    describe('getBard', () => {
        it('should return', () => {
            const { bard } = system.recruitBard({});
            expect(system.getBard(bard.bardId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBard('ghost')).toBeNull(); });
    });

    describe('listBards', () => {
        it('should list all', () => {
            system.recruitBard({});
            system.recruitBard({});
            expect(system.listBards().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listBards().length).toBe(0);
        });
    });

    describe('listByMentor', () => {
        it('should filter by mentor', () => {
            system.recruitBard({ mentorId: 'm1' });
            system.recruitBard({ mentorId: 'm2' });
            system.recruitBard({ mentorId: 'm1' });
            expect(system.listByMentor('m1').length).toBe(2);
        });
        it('should return empty for unknown', () => {
            system.recruitBard({});
            expect(system.listByMentor('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { bard: b1 } = system.recruitBard({});
            const { bard: b2 } = system.recruitBard({});
            system.legendBard(b1.bardId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addSong', () => {
        it('should add song', () => {
            const { bard } = system.recruitBard({});
            system.addSong(bard.bardId, 'Ode to the Moon');
            expect(bard.songs.length).toBe(1);
        });

        it('should reject missing bard', () => {
            const result = system.addSong('ghost', 'song');
            expect(result.error).toBe('BARD_NOT_FOUND');
        });

        it('should trigger songAdded hook', () => {
            const { bard } = system.recruitBard({});
            let called = false;
            system.registerHook('songAdded', () => { called = true; });
            system.addSong(bard.bardId, 'Ballad');
            expect(called).toBe(true);
        });
    });

    describe('increaseCharisma', () => {
        it('should increase with default amount', () => {
            const { bard } = system.recruitBard({});
            system.increaseCharisma(bard.bardId);
            expect(bard.charisma).toBe(25);
        });

        it('should increase with custom amount', () => {
            const { bard } = system.recruitBard({});
            system.increaseCharisma(bard.bardId, 15);
            expect(bard.charisma).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.increaseCharisma('ghost');
            expect(result.error).toBe('BARD_NOT_FOUND');
        });

        it('should trigger charismaIncreased hook', () => {
            const { bard } = system.recruitBard({});
            let called = false;
            system.registerHook('charismaIncreased', () => { called = true; });
            system.increaseCharisma(bard.bardId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBard', () => {
        it('should level up', () => {
            const { bard } = system.recruitBard({});
            system.levelUpBard(bard.bardId);
            expect(bard.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { bard } = system.recruitBard({});
            system.levelUpBard(bard.bardId);
            system.levelUpBard(bard.bardId);
            system.levelUpBard(bard.bardId);
            expect(bard.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpBard('ghost');
            expect(result.error).toBe('BARD_NOT_FOUND');
        });

        it('should trigger bardLeveledUp hook', () => {
            const { bard } = system.recruitBard({});
            let called = false;
            system.registerHook('bardLeveledUp', () => { called = true; });
            system.levelUpBard(bard.bardId);
            expect(called).toBe(true);
        });
    });

    describe('legendBard', () => {
        it('should set status to legendary', () => {
            const { bard } = system.recruitBard({});
            system.legendBard(bard.bardId);
            expect(bard.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBard('ghost');
            expect(result.error).toBe('BARD_NOT_FOUND');
        });

        it('should trigger bardLegendized hook', () => {
            const { bard } = system.recruitBard({});
            let called = false;
            system.registerHook('bardLegendized', () => { called = true; });
            system.legendBard(bard.bardId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBardValue', () => {
        it('should calculate', () => {
            const { bard } = system.recruitBard({});
            system.levelUpBard(bard.bardId);
            system.increaseCharisma(bard.bardId, 10);
            system.addSong(bard.bardId, 'song1');
            // level=2, charisma=30, songs=1: 2*100 + 30*2 + 1*30 = 200+60+30 = 290
            expect(system.calculateBardValue(bard.bardId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBardValue('ghost')).toBe(0);
        });

        it('should calculate with multiple songs', () => {
            const { bard } = system.recruitBard({});
            system.addSong(bard.bardId, 's1');
            system.addSong(bard.bardId, 's2');
            system.addSong(bard.bardId, 's3');
            // level=1, charisma=20, songs=3: 100+40+90 = 230
            expect(system.calculateBardValue(bard.bardId)).toBe(230);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitBard({ type: 'epic' });
            system.recruitBard({ type: 'folk' });
            system.recruitBard({ type: 'romantic' });
            expect(system.listByType('folk').length).toBe(1);
        });
    });

    describe('listVeteran', () => {
        it('should list veteran and legendary', () => {
            const { bard: b1 } = system.recruitBard({});
            const { bard: b2 } = system.recruitBard({});
            b1.status = 'veteran';
            system.legendBard(b2.bardId);
            expect(system.listVeteran().length).toBe(2);
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

        it('should execute default getBard tool', () => {
            const { bard } = system.recruitBard({});
            const result = system.executeTool('getBard', { bardId: bard.bardId });
            expect(result.result.name).toBe('Unnamed Bard');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bardRecruited', () => count++);
            unregister();
            system.recruitBard({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bardRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBard({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBards = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBards = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBard({});
            const json = system.toJSON();
            expect(json.bards.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBard({ name: 'Du Fu' });
            const json = system.toJSON();
            const newSys = new CultivationBard();
            newSys.fromJSON(json);
            expect(newSys.bards.size).toBe(1);
            expect(newSys.getStats().totalBards).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bardCount).toBe(0);
            expect(stats.totalBards).toBe(0);
        });

        it('should reflect counts after recruit', () => {
            system.recruitBard({});
            const stats = system.getStats();
            expect(stats.bardCount).toBe(1);
        });
    });
});
