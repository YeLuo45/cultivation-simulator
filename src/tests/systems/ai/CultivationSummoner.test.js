/**
 * CultivationSummoner.test.js - 修真召唤师系统测试
 * V604 Iteration 7/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSummoner } from '../../../systems/ai/CultivationSummoner.js';

describe('CultivationSummoner', () => {
    let system;
    beforeEach(() => { system = new CultivationSummoner(); });

    describe('recruitSummoner', () => {
        it('should recruit with given fields', () => {
            const { summoner } = system.recruitSummoner({ mentorId: 'm1', name: 'Beast Caller', type: 'beast' });
            expect(summoner.mentorId).toBe('m1');
            expect(summoner.name).toBe('Beast Caller');
            expect(summoner.type).toBe('beast');
        });

        it('should default type to beast and resonance to 20', () => {
            const { summoner } = system.recruitSummoner({ mentorId: 'm1' });
            expect(summoner.type).toBe('beast');
            expect(summoner.resonance).toBe(20);
            expect(summoner.level).toBe(1);
            expect(summoner.status).toBe('novice');
            expect(summoner.summons).toEqual([]);
        });

        it('should generate a summonerId when not provided', () => {
            const { summoner } = system.recruitSummoner({});
            expect(summoner.summonerId).toBeTruthy();
            expect(typeof summoner.summonerId).toBe('string');
        });

        it('should respect explicit summonerId', () => {
            const { summoner } = system.recruitSummoner({ summonerId: 'sum_explicit' });
            expect(summoner.summonerId).toBe('sum_explicit');
        });

        it('should trigger summonerRecruited hook', () => {
            let called = false;
            system.registerHook('summonerRecruited', () => { called = true; });
            system.recruitSummoner({});
            expect(called).toBe(true);
        });

        it('should accept spirit and elemental types', () => {
            const { summoner: a } = system.recruitSummoner({ type: 'spirit' });
            const { summoner: b } = system.recruitSummoner({ type: 'elemental' });
            expect(a.type).toBe('spirit');
            expect(b.type).toBe('elemental');
        });
    });

    describe('getSummoner', () => {
        it('should return summoner copy', () => {
            const { summoner } = system.recruitSummoner({});
            const found = system.getSummoner(summoner.summonerId);
            expect(found).not.toBeNull();
            expect(found.summonerId).toBe(summoner.summonerId);
        });
        it('should return null for missing', () => { expect(system.getSummoner('ghost')).toBeNull(); });
    });

    describe('listSummoners', () => {
        it('should list all summoners', () => {
            system.recruitSummoner({});
            system.recruitSummoner({});
            system.recruitSummoner({});
            expect(system.listSummoners().length).toBe(3);
        });

        it('should return empty array when none', () => {
            expect(system.listSummoners()).toEqual([]);
        });
    });

    describe('listByMentor', () => {
        it('should filter by mentor', () => {
            system.recruitSummoner({ mentorId: 'm1' });
            system.recruitSummoner({ mentorId: 'm2' });
            system.recruitSummoner({ mentorId: 'm1' });
            expect(system.listByMentor('m1').length).toBe(2);
            expect(system.listByMentor('m2').length).toBe(1);
            expect(system.listByMentor('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary summoners', () => {
            const { summoner: a } = system.recruitSummoner({});
            const { summoner: b } = system.recruitSummoner({});
            system.legendSummoner(a.summonerId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].summonerId).toBe(a.summonerId);
            expect(b.status).toBe('novice');
        });
    });

    describe('addSummon', () => {
        it('should add a summon to summoner', () => {
            const { summoner } = system.recruitSummoner({});
            const result = system.addSummon(summoner.summonerId, 'spirit_fox');
            expect(result.success).toBe(true);
            expect(summoner.summons).toContain('spirit_fox');
        });

        it('should add multiple summons', () => {
            const { summoner } = system.recruitSummoner({});
            system.addSummon(summoner.summonerId, 'wolf');
            system.addSummon(summoner.summonerId, 'tiger');
            expect(summoner.summons.length).toBe(2);
        });

        it('should reject missing summoner', () => {
            const result = system.addSummon('ghost', 'x');
            expect(result.error).toBe('SUMMONER_NOT_FOUND');
        });

        it('should trigger summonAdded hook', () => {
            const { summoner } = system.recruitSummoner({});
            let called = false;
            system.registerHook('summonAdded', () => { called = true; });
            system.addSummon(summoner.summonerId, 'phoenix');
            expect(called).toBe(true);
        });
    });

    describe('amplifyResonance', () => {
        it('should amplify by default 5', () => {
            const { summoner } = system.recruitSummoner({});
            system.amplifyResonance(summoner.summonerId);
            expect(summoner.resonance).toBe(25);
        });

        it('should amplify by custom amount', () => {
            const { summoner } = system.recruitSummoner({});
            system.amplifyResonance(summoner.summonerId, 30);
            expect(summoner.resonance).toBe(50);
        });

        it('should reject missing summoner', () => {
            const result = system.amplifyResonance('ghost', 10);
            expect(result.error).toBe('SUMMONER_NOT_FOUND');
        });

        it('should trigger resonanceAmplified hook', () => {
            const { summoner } = system.recruitSummoner({});
            let called = false;
            system.registerHook('resonanceAmplified', () => { called = true; });
            system.amplifyResonance(summoner.summonerId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSummoner', () => {
        it('should increase level by 1', () => {
            const { summoner } = system.recruitSummoner({});
            system.levelUpSummoner(summoner.summonerId);
            expect(summoner.level).toBe(2);
        });

        it('should increase level multiple times', () => {
            const { summoner } = system.recruitSummoner({});
            system.levelUpSummoner(summoner.summonerId);
            system.levelUpSummoner(summoner.summonerId);
            system.levelUpSummoner(summoner.summonerId);
            expect(summoner.level).toBe(4);
        });

        it('should reject missing summoner', () => {
            const result = system.levelUpSummoner('ghost');
            expect(result.error).toBe('SUMMONER_NOT_FOUND');
        });

        it('should trigger summonerLeveledUp hook', () => {
            const { summoner } = system.recruitSummoner({});
            let called = false;
            system.registerHook('summonerLeveledUp', () => { called = true; });
            system.levelUpSummoner(summoner.summonerId);
            expect(called).toBe(true);
        });
    });

    describe('legendSummoner', () => {
        it('should set status to legendary', () => {
            const { summoner } = system.recruitSummoner({});
            system.legendSummoner(summoner.summonerId);
            expect(summoner.status).toBe('legendary');
        });

        it('should reject missing summoner', () => {
            const result = system.legendSummoner('ghost');
            expect(result.error).toBe('SUMMONER_NOT_FOUND');
        });

        it('should trigger summonerLegendized hook', () => {
            const { summoner } = system.recruitSummoner({});
            let called = false;
            system.registerHook('summonerLegendized', () => { called = true; });
            system.legendSummoner(summoner.summonerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSummonerValue', () => {
        it('should calculate value with default stats', () => {
            const { summoner } = system.recruitSummoner({});
            // level=1 * 100 + resonance=20 * 2 + summons=0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateSummonerValue(summoner.summonerId)).toBe(140);
        });

        it('should calculate value with summons and leveled up', () => {
            const { summoner } = system.recruitSummoner({});
            system.levelUpSummoner(summoner.summonerId);
            system.levelUpSummoner(summoner.summonerId);
            system.addSummon(summoner.summonerId, 'spirit_fox');
            system.addSummon(summoner.summonerId, 'meteor');
            // level=3 * 100 + resonance=20 * 2 + summons=2 * 30 = 300 + 40 + 60 = 400
            expect(system.calculateSummonerValue(summoner.summonerId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSummonerValue('ghost')).toBe(0);
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

        it('should execute default getSummoner tool', () => {
            const { summoner } = system.recruitSummoner({});
            const result = system.executeTool('getSummoner', { summonerId: summoner.summonerId });
            expect(result.success).toBe(true);
            expect(result.result.summonerId).toBe(summoner.summonerId);
        });

        it('should execute default recruitSummoner tool', () => {
            const result = system.executeTool('recruitSummoner', { mentorId: 'm1', name: 'X', type: 'spirit' });
            expect(result.success).toBe(true);
            expect(result.result.summoner.mentorId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('summonerRecruited', () => count++);
            unregister();
            system.recruitSummoner({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('summonerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSummoner({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient summoners', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalSummoners = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxSummoners).toBe(70);
        });
        it('should not double evolve', () => {
            system.stats.totalSummoners = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitSummoner({});
            system.recruitSummoner({});
            const json = system.toJSON();
            expect(json.summoners.length).toBe(2);
            expect(json.stats.totalSummoners).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitSummoner({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationSummoner();
            newSys.fromJSON(json);
            expect(newSys.summoners.size).toBe(1);
            expect(newSys.stats.totalSummoners).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitSummoner({});
            const stats = system.getStats();
            expect(stats.summonerCount).toBe(1);
            expect(stats.totalSummoners).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
