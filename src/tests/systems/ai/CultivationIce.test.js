/**
 * CultivationIce.test.js - 修真冰测试
 * V799 Iteration 2/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationIce } from '../../../systems/ai/CultivationIce.js';

describe('CultivationIce', () => {
    let system;
    beforeEach(() => { system = new CultivationIce(); });

    describe('recruitIce', () => {
        it('should create an ice', () => {
            const { ice } = system.recruitIce({ name: 'Bingpo' });
            expect(ice.name).toBe('Bingpo');
        });

        it('should default type to glacial', () => {
            const { ice } = system.recruitIce({});
            expect(ice.type).toBe('glacial');
        });

        it('should default cold to baseCold (20)', () => {
            const { ice } = system.recruitIce({});
            expect(ice.cold).toBe(20);
        });

        it('should default status to novice', () => {
            const { ice } = system.recruitIce({});
            expect(ice.status).toBe('novice');
        });

        it('should default masterId to unknown', () => {
            const { ice } = system.recruitIce({});
            expect(ice.masterId).toBe('unknown');
        });

        it('should default shards to empty array', () => {
            const { ice } = system.recruitIce({});
            expect(ice.shards).toEqual([]);
        });

        it('should default level to 1', () => {
            const { ice } = system.recruitIce({});
            expect(ice.level).toBe(1);
        });

        it('should trigger iceRecruited hook', () => {
            let called = false;
            system.registerHook('iceRecruited', () => { called = true; });
            system.recruitIce({});
            expect(called).toBe(true);
        });

        it('should increment totalIces stat', () => {
            system.recruitIce({});
            expect(system.stats.totalIces).toBe(1);
        });

        it('should accept custom data including shards', () => {
            const { ice } = system.recruitIce({ name: 'X', type: 'eternal', cold: 50, shards: ['a', 'b'], level: 5, status: 'veteran' });
            expect(ice.type).toBe('eternal');
            expect(ice.cold).toBe(50);
            expect(ice.shards.length).toBe(2);
            expect(ice.level).toBe(5);
            expect(ice.status).toBe('veteran');
        });
    });

    describe('getIce', () => {
        it('should return ice by id', () => {
            const { ice } = system.recruitIce({});
            expect(system.getIce(ice.iceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getIce('ghost')).toBeNull(); });
        it('should return a copy, not the original reference', () => {
            const { ice } = system.recruitIce({});
            const fetched = system.getIce(ice.iceId);
            fetched.name = 'Modified';
            expect(ice.name).toBe('Unnamed Ice');
        });
    });

    describe('listIces', () => {
        it('should list all ices', () => {
            system.recruitIce({});
            system.recruitIce({});
            expect(system.listIces().length).toBe(2);
        });
        it('should return empty list when no ices', () => {
            expect(system.listIces().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitIce({ masterId: 'm1' });
            system.recruitIce({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when master not found', () => {
            system.recruitIce({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitIce({ type: 'glacial' });
            system.recruitIce({ type: 'eternal' });
            expect(system.listByType('eternal').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary ices', () => {
            system.recruitIce({});
            const { ice } = system.recruitIce({});
            system.legendIce(ice.iceId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none are legendary', () => {
            system.recruitIce({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addShard', () => {
        it('should add a shard to the array', () => {
            const { ice } = system.recruitIce({});
            system.addShard(ice.iceId, 'frost-shard');
            expect(ice.shards.length).toBe(1);
            expect(ice.shards[0]).toBe('frost-shard');
        });

        it('should add multiple shards', () => {
            const { ice } = system.recruitIce({});
            system.addShard(ice.iceId, 'a');
            system.addShard(ice.iceId, 'b');
            expect(ice.shards.length).toBe(2);
        });

        it('should reject missing ice', () => {
            const result = system.addShard('ghost', 'shard');
            expect(result.error).toBe('ICE_NOT_FOUND');
        });

        it('should trigger shardAdded hook', () => {
            const { ice } = system.recruitIce({});
            let called = false;
            system.registerHook('shardAdded', () => { called = true; });
            system.addShard(ice.iceId, 'ice-shard');
            expect(called).toBe(true);
        });
    });

    describe('raiseCold', () => {
        it('should raise cold by default 5', () => {
            const { ice } = system.recruitIce({});
            system.raiseCold(ice.iceId);
            expect(ice.cold).toBe(25);
        });

        it('should raise cold by custom amount', () => {
            const { ice } = system.recruitIce({});
            system.raiseCold(ice.iceId, 10);
            expect(ice.cold).toBe(30);
        });

        it('should reject missing ice', () => {
            const result = system.raiseCold('ghost', 5);
            expect(result.error).toBe('ICE_NOT_FOUND');
        });

        it('should trigger coldRaised hook', () => {
            const { ice } = system.recruitIce({});
            let called = false;
            system.registerHook('coldRaised', () => { called = true; });
            system.raiseCold(ice.iceId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpIce', () => {
        it('should increment level', () => {
            const { ice } = system.recruitIce({});
            system.levelUpIce(ice.iceId);
            expect(ice.level).toBe(2);
        });

        it('should increment level multiple times', () => {
            const { ice } = system.recruitIce({});
            system.levelUpIce(ice.iceId);
            system.levelUpIce(ice.iceId);
            system.levelUpIce(ice.iceId);
            expect(ice.level).toBe(4);
        });

        it('should reject missing ice', () => {
            const result = system.levelUpIce('ghost');
            expect(result.error).toBe('ICE_NOT_FOUND');
        });

        it('should trigger iceLeveledUp hook', () => {
            const { ice } = system.recruitIce({});
            let called = false;
            system.registerHook('iceLeveledUp', () => { called = true; });
            system.levelUpIce(ice.iceId);
            expect(called).toBe(true);
        });
    });

    describe('legendIce', () => {
        it('should set status to legendary', () => {
            const { ice } = system.recruitIce({});
            system.legendIce(ice.iceId);
            expect(ice.status).toBe('legendary');
        });

        it('should reject missing ice', () => {
            const result = system.legendIce('ghost');
            expect(result.error).toBe('ICE_NOT_FOUND');
        });

        it('should trigger iceLegendized hook', () => {
            const { ice } = system.recruitIce({});
            let called = false;
            system.registerHook('iceLegendized', () => { called = true; });
            system.legendIce(ice.iceId);
            expect(called).toBe(true);
        });
    });

    describe('trainIce', () => {
        it('should set status to veteran', () => {
            const { ice } = system.recruitIce({});
            system.trainIce(ice.iceId);
            expect(ice.status).toBe('veteran');
        });

        it('should reject missing ice', () => {
            const result = system.trainIce('ghost');
            expect(result.error).toBe('ICE_NOT_FOUND');
        });

        it('should trigger iceTrained hook', () => {
            const { ice } = system.recruitIce({});
            let called = false;
            system.registerHook('iceTrained', () => { called = true; });
            system.trainIce(ice.iceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateIceValue', () => {
        it('should calculate value: level*100 + cold*2 + shards.length*30', () => {
            const { ice } = system.recruitIce({});
            ice.level = 2;
            ice.cold = 30;
            ice.shards = ['a', 'b'];
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateIceValue(ice.iceId)).toBe(320);
        });

        it('should return 0 for missing ice', () => {
            expect(system.calculateIceValue('ghost')).toBe(0);
        });

        it('should calculate correctly with default values', () => {
            const { ice } = system.recruitIce({});
            // 1*100 + 20*2 + 0*30 = 100 + 40 + 0 = 140
            expect(system.calculateIceValue(ice.iceId)).toBe(140);
        });

        it('should calculate correctly with shards', () => {
            const { ice } = system.recruitIce({});
            system.addShard(ice.iceId, 's1');
            system.addShard(ice.iceId, 's2');
            system.addShard(ice.iceId, 's3');
            // 1*100 + 20*2 + 3*30 = 100 + 40 + 90 = 230
            expect(system.calculateIceValue(ice.iceId)).toBe(230);
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

        it('should execute default getIce tool', () => {
            const result = system.executeTool('getIce', { iceId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('iceRecruited', () => count++);
            unregister();
            system.recruitIce({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('iceRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitIce({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient ices', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalIces >= 5', () => {
            system.stats.totalIces = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalIces = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitIce({});
            const json = system.toJSON();
            expect(json.ices.length).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitIce({});
            const json = system.toJSON();
            const newSys = new CultivationIce();
            newSys.fromJSON(json);
            expect(newSys.ices.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with iceCount', () => {
            const stats = system.getStats();
            expect(stats.iceCount).toBe(0);
        });

        it('should reflect iceCount after recruitment', () => {
            system.recruitIce({});
            system.recruitIce({});
            expect(system.getStats().iceCount).toBe(2);
        });
    });
});
