/**
 * SectDoctrine.test.js - 宗门教义测试
 * V484 Iteration 1/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectDoctrine } from '../../../systems/ai/SectDoctrine.js';

describe('SectDoctrine', () => {
    let system;
    beforeEach(() => { system = new SectDoctrine(); });

    describe('revealDoctrine', () => {
        it('should reveal', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'Sword Dao' });
            expect(doctrine.sectId).toBe('s1');
            expect(doctrine.name).toBe('Sword Dao');
        });

        it('should set defaults', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'Fire' });
            expect(doctrine.type).toBe('core');
            expect(doctrine.status).toBe('revealed');
            expect(doctrine.followers).toBe(0);
            expect(doctrine.principles.length).toBeGreaterThan(0);
        });

        it('should trigger doctrineRevealed hook', () => {
            let called = false;
            system.registerHook('doctrineRevealed', () => { called = true; });
            system.revealDoctrine({ sectId: 's1', name: 'Water' });
            expect(called).toBe(true);
        });
    });

    describe('getDoctrine', () => {
        it('should return', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'A' });
            expect(system.getDoctrine(doctrine.doctrineId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDoctrine('ghost')).toBeNull(); });
    });

    describe('listDoctrines', () => {
        it('should list all', () => {
            system.revealDoctrine({ sectId: 's1', name: 'A' });
            system.revealDoctrine({ sectId: 's2', name: 'B' });
            expect(system.listDoctrines().length).toBe(2);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.revealDoctrine({ sectId: 's1', name: 'A' });
            system.revealDoctrine({ sectId: 's2', name: 'B' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter by core', () => {
            system.revealDoctrine({ sectId: 's1', name: 'A', type: 'core' });
            system.revealDoctrine({ sectId: 's1', name: 'B', type: 'sacred' });
            expect(system.listByType('core').length).toBe(1);
        });

        it('should filter by secret', () => {
            system.revealDoctrine({ sectId: 's1', name: 'A', type: 'secret' });
            system.revealDoctrine({ sectId: 's1', name: 'B', type: 'sacred' });
            expect(system.listByType('secret').length).toBe(1);
        });
    });

    describe('addPrinciple', () => {
        it('should add principle', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'A' });
            const initialCount = doctrine.principles.length;
            system.addPrinciple(doctrine.doctrineId, '勇往直前');
            expect(doctrine.principles.length).toBe(initialCount + 1);
            expect(doctrine.principles).toContain('勇往直前');
        });

        it('should reject missing', () => {
            const result = system.addPrinciple('ghost', 'p');
            expect(result.error).toBe('DOCTRINE_NOT_FOUND');
        });

        it('should trigger principleAdded hook', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'A' });
            let called = false;
            system.registerHook('principleAdded', () => { called = true; });
            system.addPrinciple(doctrine.doctrineId, 'test');
            expect(called).toBe(true);
        });
    });

    describe('gainFollower', () => {
        it('should increment followers', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'A' });
            system.gainFollower(doctrine.doctrineId, 'member1');
            expect(doctrine.followers).toBe(1);
        });

        it('should increment multiple times', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'A' });
            system.gainFollower(doctrine.doctrineId, 'm1');
            system.gainFollower(doctrine.doctrineId, 'm2');
            system.gainFollower(doctrine.doctrineId, 'm3');
            expect(doctrine.followers).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.gainFollower('ghost', 'm1');
            expect(result.error).toBe('DOCTRINE_NOT_FOUND');
        });

        it('should trigger followerGained hook', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'A' });
            let called = false;
            system.registerHook('followerGained', () => { called = true; });
            system.gainFollower(doctrine.doctrineId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('sealDoctrine', () => {
        it('should seal', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'A' });
            system.sealDoctrine(doctrine.doctrineId);
            expect(doctrine.status).toBe('sealed');
        });

        it('should reject missing', () => {
            const result = system.sealDoctrine('ghost');
            expect(result.error).toBe('DOCTRINE_NOT_FOUND');
        });

        it('should trigger doctrineSealed hook', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'A' });
            let called = false;
            system.registerHook('doctrineSealed', () => { called = true; });
            system.sealDoctrine(doctrine.doctrineId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDoctrinePower', () => {
        it('should calculate', () => {
            const { doctrine } = system.revealDoctrine({ sectId: 's1', name: 'A', principles: ['p1', 'p2'] });
            doctrine.followers = 5;
            // 2 principles * 10 + 5 followers * 5 = 20 + 25 = 45
            expect(system.calculateDoctrinePower(doctrine.doctrineId)).toBe(45);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDoctrinePower('ghost')).toBe(0);
        });
    });

    describe('listSealed', () => {
        it('should filter sealed', () => {
            const { doctrine: d1 } = system.revealDoctrine({ sectId: 's1', name: 'A' });
            system.revealDoctrine({ sectId: 's1', name: 'B' });
            system.sealDoctrine(d1.doctrineId);
            expect(system.listSealed().length).toBe(1);
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

        it('should execute default getDoctrine', () => {
            const result = system.executeTool('getDoctrine', { doctrineId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default revealDoctrine tool', () => {
            const result = system.executeTool('revealDoctrine', { sectId: 's1', name: 'X' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('doctrineRevealed', () => count++);
            unregister();
            system.revealDoctrine({ sectId: 's1', name: 'A' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('doctrineRevealed', () => { throw new Error('x'); });
            expect(() => system.revealDoctrine({ sectId: 's1', name: 'A' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDoctrines = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDoctrines = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.revealDoctrine({ sectId: 's1', name: 'A' });
            const json = system.toJSON();
            expect(json.doctrines.length).toBe(1);
        });
        it('should deserialize', () => {
            system.revealDoctrine({ sectId: 's1', name: 'A' });
            const json = system.toJSON();
            const newSys = new SectDoctrine();
            newSys.fromJSON(json);
            expect(newSys.doctrines.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.doctrineCount).toBe(0);
        });
    });
});
