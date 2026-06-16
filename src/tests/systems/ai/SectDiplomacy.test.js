/**
 * SectDiplomacy.test.js - 宗门外交测试
 * V437 Iteration 14/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectDiplomacy } from '../../../systems/ai/SectDiplomacy.js';

describe('SectDiplomacy', () => {
    let system;
    beforeEach(() => { system = new SectDiplomacy(); });

    describe('establishRelation', () => {
        it('should establish', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            expect(relation.sect1).toBe('s1');
            expect(relation.sect2).toBe('s2');
        });

        it('should trigger relationEstablished hook', () => {
            let called = false;
            system.registerHook('relationEstablished', () => { called = true; });
            system.establishRelation({ sect1: 's1', sect2: 's2' });
            expect(called).toBe(true);
        });
    });

    describe('getRelation', () => {
        it('should return', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            expect(system.getRelation(relation.relationId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRelation('ghost')).toBeNull(); });
    });

    describe('listRelations', () => {
        it('should list all', () => {
            system.establishRelation({ sect1: 's1', sect2: 's2' });
            expect(system.listRelations().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect1', () => {
            system.establishRelation({ sect1: 's1', sect2: 's2' });
            system.establishRelation({ sect1: 's2', sect2: 's3' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should filter by sect2', () => {
            system.establishRelation({ sect1: 's1', sect2: 's2' });
            system.establishRelation({ sect1: 's3', sect2: 's4' });
            expect(system.listBySect('s2').length).toBe(1);
        });
    });

    describe('listAllied', () => {
        it('should filter allied', () => {
            system.establishRelation({ sect1: 's1', sect2: 's2', status: 'allied' });
            system.establishRelation({ sect1: 's3', sect2: 's4', status: 'neutral' });
            expect(system.listAllied().length).toBe(1);
        });
    });

    describe('listHostile', () => {
        it('should filter hostile', () => {
            system.establishRelation({ sect1: 's1', sect2: 's2', status: 'hostile' });
            system.establishRelation({ sect1: 's3', sect2: 's4', status: 'neutral' });
            expect(system.listHostile().length).toBe(1);
        });
    });

    describe('increaseTrust', () => {
        it('should increase trustLevel', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            system.increaseTrust(relation.relationId, 10);
            expect(relation.trustLevel).toBe(60);
        });

        it('should reject missing', () => {
            const result = system.increaseTrust('ghost', 10);
            expect(result.error).toBe('RELATION_NOT_FOUND');
        });

        it('should trigger trustIncreased hook', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            let called = false;
            system.registerHook('trustIncreased', () => { called = true; });
            system.increaseTrust(relation.relationId, 10);
            expect(called).toBe(true);
        });
    });

    describe('signTreaty', () => {
        it('should add to treatiesList', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            system.signTreaty(relation.relationId, 'non-aggression');
            expect(relation.treatiesList.length).toBe(1);
            expect(relation.treatiesList[0]).toBe('non-aggression');
        });

        it('should update treaties count', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            system.signTreaty(relation.relationId, 'peace');
            expect(relation.treaties).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.signTreaty('ghost', 'peace');
            expect(result.error).toBe('RELATION_NOT_FOUND');
        });

        it('should trigger treatySigned hook', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            let called = false;
            system.registerHook('treatySigned', () => { called = true; });
            system.signTreaty(relation.relationId, 'alliance');
            expect(called).toBe(true);
        });
    });

    describe('increaseTrade', () => {
        it('should increase trade', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            system.increaseTrade(relation.relationId, 25);
            expect(relation.trade).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseTrade('ghost', 10);
            expect(result.error).toBe('RELATION_NOT_FOUND');
        });
    });

    describe('declareHostility', () => {
        it('should set status to hostile', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            system.declareHostility(relation.relationId);
            expect(relation.status).toBe('hostile');
        });

        it('should reject missing', () => {
            const result = system.declareHostility('ghost');
            expect(result.error).toBe('RELATION_NOT_FOUND');
        });

        it('should trigger hostilityDeclared hook', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2' });
            let called = false;
            system.registerHook('hostilityDeclared', () => { called = true; });
            system.declareHostility(relation.relationId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDiplomacyScore', () => {
        it('should calculate', () => {
            const { relation } = system.establishRelation({ sect1: 's1', sect2: 's2', trade: 30, treatiesList: ['peace'] });
            // trustLevel(50) * 2 + trade(30) + treaties(1) * 50 = 100 + 30 + 50 = 180
            expect(system.calculateDiplomacyScore(relation.relationId)).toBe(180);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDiplomacyScore('ghost')).toBe(0);
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

        it('should execute default getRelation', () => {
            const result = system.executeTool('getRelation', { relationId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('relationEstablished', () => count++);
            unregister();
            system.establishRelation({ sect1: 's1', sect2: 's2' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('relationEstablished', () => { throw new Error('x'); });
            expect(() => system.establishRelation({ sect1: 's1', sect2: 's2' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRelations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRelations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.establishRelation({ sect1: 's1', sect2: 's2' });
            const json = system.toJSON();
            expect(json.relations.length).toBe(1);
        });
        it('should deserialize', () => {
            system.establishRelation({ sect1: 's1', sect2: 's2' });
            const json = system.toJSON();
            const newSys = new SectDiplomacy();
            newSys.fromJSON(json);
            expect(newSys.relations.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.relationCount).toBe(0);
        });
    });
});
