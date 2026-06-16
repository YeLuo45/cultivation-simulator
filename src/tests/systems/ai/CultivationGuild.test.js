/**
 * CultivationGuild.test.js - 修真公会系统测试
 * V554 Iteration 17/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGuild } from '../../../systems/ai/CultivationGuild.js';

describe('CultivationGuild', () => {
    let system;
    beforeEach(() => { system = new CultivationGuild(); });

    describe('openGuild', () => {
        it('should open guild', () => {
            const { guild } = system.openGuild({ founderId: 'f1', name: 'Jade Merchants' });
            expect(guild.founderId).toBe('f1');
            expect(guild.name).toBe('Jade Merchants');
        });

        it('should default type to merchant', () => {
            const { guild } = system.openGuild({});
            expect(guild.type).toBe('merchant');
        });

        it('should default name to Unnamed Guild', () => {
            const { guild } = system.openGuild({});
            expect(guild.name).toBe('Unnamed Guild');
        });

        it('should default influence to baseInfluence (20)', () => {
            const { guild } = system.openGuild({});
            expect(guild.influence).toBe(20);
        });

        it('should default level to 1', () => {
            const { guild } = system.openGuild({});
            expect(guild.level).toBe(1);
        });

        it('should default status to forming', () => {
            const { guild } = system.openGuild({});
            expect(guild.status).toBe('forming');
        });

        it('should start with empty members', () => {
            const { guild } = system.openGuild({});
            expect(guild.members).toEqual([]);
        });

        it('should auto-generate guildId', () => {
            const { guild } = system.openGuild({});
            expect(guild.guildId).toBeTruthy();
            expect(typeof guild.guildId).toBe('string');
        });

        it('should respect provided guildId', () => {
            const { guild } = system.openGuild({ guildId: 'myGuild' });
            expect(guild.guildId).toBe('myGuild');
        });

        it('should support thief type', () => {
            const { guild } = system.openGuild({ type: 'thief' });
            expect(guild.type).toBe('thief');
        });

        it('should support adventurer type', () => {
            const { guild } = system.openGuild({ type: 'adventurer' });
            expect(guild.type).toBe('adventurer');
        });

        it('should support provided influence', () => {
            const { guild } = system.openGuild({ influence: 100 });
            expect(guild.influence).toBe(100);
        });

        it('should support provided members', () => {
            const { guild } = system.openGuild({ members: ['m1', 'm2'] });
            expect(guild.members).toEqual(['m1', 'm2']);
        });

        it('should trigger guildOpened hook', () => {
            let called = false;
            system.registerHook('guildOpened', () => { called = true; });
            system.openGuild({});
            expect(called).toBe(true);
        });

        it('should return success', () => {
            const result = system.openGuild({});
            expect(result.success).toBe(true);
        });
    });

    describe('getGuild', () => {
        it('should return guild', () => {
            const { guild } = system.openGuild({});
            expect(system.getGuild(guild.guildId)).not.toBeNull();
            expect(system.getGuild(guild.guildId).guildId).toBe(guild.guildId);
        });
        it('should return null for missing', () => {
            expect(system.getGuild('ghost')).toBeNull();
        });
    });

    describe('listGuilds', () => {
        it('should list all', () => {
            system.openGuild({});
            system.openGuild({});
            expect(system.listGuilds().length).toBe(2);
        });

        it('should return empty when no guilds', () => {
            expect(system.listGuilds().length).toBe(0);
        });
    });

    describe('listByFounder', () => {
        it('should filter', () => {
            system.openGuild({ founderId: 'f1' });
            system.openGuild({ founderId: 'f2' });
            expect(system.listByFounder('f1').length).toBe(1);
        });

        it('should return empty for unknown founder', () => {
            system.openGuild({ founderId: 'f1' });
            expect(system.listByFounder('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter active only', () => {
            const { guild: g1 } = system.openGuild({});
            const { guild: g2 } = system.openGuild({});
            system.increaseInfluence(g1.guildId, 40);  // 20 + 40 = 60, becomes active
            const active = system.listActive();
            expect(active.length).toBe(1);
            expect(active[0].guildId).toBe(g1.guildId);
            expect(g2.status).toBe('forming');
        });

        it('should include dominant guilds', () => {
            const { guild } = system.openGuild({});
            system.dominantGuild(guild.guildId);
            const active = system.listActive();
            expect(active.length).toBe(1);
            expect(active[0].status).toBe('dominant');
        });
    });

    describe('addMember', () => {
        it('should add member', () => {
            const { guild } = system.openGuild({});
            system.addMember(guild.guildId, 'm1');
            expect(guild.members).toContain('m1');
        });

        it('should support multiple members', () => {
            const { guild } = system.openGuild({});
            system.addMember(guild.guildId, 'm1');
            system.addMember(guild.guildId, 'm2');
            expect(guild.members.length).toBe(2);
        });

        it('should reject missing guild', () => {
            const result = system.addMember('ghost', 'm1');
            expect(result.error).toBe('GUILD_NOT_FOUND');
        });

        it('should trigger memberAdded hook', () => {
            const { guild } = system.openGuild({});
            let called = false;
            system.registerHook('memberAdded', () => { called = true; });
            system.addMember(guild.guildId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('increaseInfluence', () => {
        it('should increase influence by default 5', () => {
            const { guild } = system.openGuild({});
            system.increaseInfluence(guild.guildId);
            expect(guild.influence).toBe(25);
        });

        it('should increase custom amount', () => {
            const { guild } = system.openGuild({});
            system.increaseInfluence(guild.guildId, 50);
            expect(guild.influence).toBe(70);
        });

        it('should accumulate influence', () => {
            const { guild } = system.openGuild({});
            system.increaseInfluence(guild.guildId, 10);
            system.increaseInfluence(guild.guildId, 20);
            expect(guild.influence).toBe(50);
        });

        it('should promote to active when influence >= 50', () => {
            const { guild } = system.openGuild({});
            system.increaseInfluence(guild.guildId, 30);
            expect(guild.status).toBe('active');
        });

        it('should not promote if already dominant', () => {
            const { guild } = system.openGuild({});
            system.dominantGuild(guild.guildId);
            const prev = guild.status;
            system.increaseInfluence(guild.guildId, 30);
            expect(guild.status).toBe(prev);
        });

        it('should reject missing', () => {
            const result = system.increaseInfluence('ghost', 10);
            expect(result.error).toBe('GUILD_NOT_FOUND');
        });

        it('should trigger influenceIncreased hook', () => {
            const { guild } = system.openGuild({});
            let called = false;
            system.registerHook('influenceIncreased', () => { called = true; });
            system.increaseInfluence(guild.guildId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGuild', () => {
        it('should level up', () => {
            const { guild } = system.openGuild({});
            system.levelUpGuild(guild.guildId);
            expect(guild.level).toBe(2);
        });

        it('should accumulate level', () => {
            const { guild } = system.openGuild({});
            system.levelUpGuild(guild.guildId);
            system.levelUpGuild(guild.guildId);
            system.levelUpGuild(guild.guildId);
            expect(guild.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpGuild('ghost');
            expect(result.error).toBe('GUILD_NOT_FOUND');
        });

        it('should trigger guildLeveledUp hook', () => {
            const { guild } = system.openGuild({});
            let called = false;
            system.registerHook('guildLeveledUp', () => { called = true; });
            system.levelUpGuild(guild.guildId);
            expect(called).toBe(true);
        });
    });

    describe('dominantGuild', () => {
        it('should make guild dominant', () => {
            const { guild } = system.openGuild({});
            system.dominantGuild(guild.guildId);
            expect(guild.status).toBe('dominant');
        });

        it('should reject missing', () => {
            const result = system.dominantGuild('ghost');
            expect(result.error).toBe('GUILD_NOT_FOUND');
        });

        it('should trigger guildDominant hook', () => {
            const { guild } = system.openGuild({});
            let called = false;
            system.registerHook('guildDominant', () => { called = true; });
            system.dominantGuild(guild.guildId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGuildPower', () => {
        it('should calculate basic', () => {
            const { guild } = system.openGuild({});
            // level=1, influence=20, members=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateGuildPower(guild.guildId)).toBe(140);
        });

        it('should include level', () => {
            const { guild } = system.openGuild({});
            system.levelUpGuild(guild.guildId);
            system.levelUpGuild(guild.guildId);
            // level=3, influence=20, members=0 -> 3*100 + 20*2 + 0*30 = 340
            expect(system.calculateGuildPower(guild.guildId)).toBe(340);
        });

        it('should include influence', () => {
            const { guild } = system.openGuild({});
            system.increaseInfluence(guild.guildId, 30);
            // level=1, influence=50, members=0 -> 1*100 + 50*2 + 0*30 = 200
            expect(system.calculateGuildPower(guild.guildId)).toBe(200);
        });

        it('should include members', () => {
            const { guild } = system.openGuild({});
            system.addMember(guild.guildId, 'm1');
            system.addMember(guild.guildId, 'm2');
            // level=1, influence=20, members=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateGuildPower(guild.guildId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGuildPower('ghost')).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.openGuild({ type: 'merchant' });
            system.openGuild({ type: 'thief' });
            system.openGuild({ type: 'adventurer' });
            expect(system.listByType('merchant').length).toBe(1);
            expect(system.listByType('thief').length).toBe(1);
            expect(system.listByType('adventurer').length).toBe(1);
        });
    });

    describe('listDominant', () => {
        it('should filter dominant only', () => {
            const { guild: g1 } = system.openGuild({});
            const { guild: g2 } = system.openGuild({});
            system.dominantGuild(g1.guildId);
            const dominant = system.listDominant();
            expect(dominant.length).toBe(1);
            expect(dominant[0].guildId).toBe(g1.guildId);
            expect(g2.status).toBe('forming');
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

        it('should execute default getGuild', () => {
            const result = system.executeTool('getGuild', { guildId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('guildOpened', () => count++);
            unregister();
            system.openGuild({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('guildOpened', () => { throw new Error('x'); });
            expect(() => system.openGuild({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGuilds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGuilds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openGuild({});
            const json = system.toJSON();
            expect(json.guilds.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openGuild({});
            const json = system.toJSON();
            const newSys = new CultivationGuild();
            newSys.fromJSON(json);
            expect(newSys.guilds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.guildCount).toBe(0);
        });
    });
});
