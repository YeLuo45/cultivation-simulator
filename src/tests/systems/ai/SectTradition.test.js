/**
 * SectTradition.test.js - 宗门传统测试
 * V487 Iteration 4/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectTradition } from '../../../systems/ai/SectTradition.js';

describe('SectTradition', () => {
    let system;
    beforeEach(() => { system = new SectTradition(); });

    describe('preserveTradition', () => {
        it('should preserve', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'Festival', type: 'annual' });
            expect(tradition.sectId).toBe('s1');
            expect(tradition.name).toBe('Festival');
        });

        it('should default type to annual', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            expect(tradition.type).toBe('annual');
        });

        it('should default participants with baseParticipants', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            expect(tradition.participants.length).toBe(1);
        });

        it('should trigger traditionPreserved hook', () => {
            let called = false;
            system.registerHook('traditionPreserved', () => { called = true; });
            system.preserveTradition({ sectId: 's1', name: 'F' });
            expect(called).toBe(true);
        });
    });

    describe('getTradition', () => {
        it('should return', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            expect(system.getTradition(tradition.traditionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTradition('ghost')).toBeNull(); });
    });

    describe('listTraditions', () => {
        it('should list all', () => {
            system.preserveTradition({ sectId: 's1', name: 'F' });
            expect(system.listTraditions().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.preserveTradition({ sectId: 's1', name: 'F1' });
            system.preserveTradition({ sectId: 's2', name: 'F2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.preserveTradition({ sectId: 's1', name: 'F1', type: 'annual' });
            system.preserveTradition({ sectId: 's1', name: 'F2', type: 'sacred' });
            expect(system.listByType('sacred').length).toBe(1);
        });
    });

    describe('addParticipant', () => {
        it('should add', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            system.addParticipant(tradition.traditionId, 'member1');
            expect(tradition.participants.length).toBe(2);
            expect(tradition.participants).toContain('member1');
        });

        it('should reject missing', () => {
            const result = system.addParticipant('ghost', 'member1');
            expect(result.error).toBe('TRADITION_NOT_FOUND');
        });

        it('should trigger participantAdded hook', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            let called = false;
            system.registerHook('participantAdded', () => { called = true; });
            system.addParticipant(tradition.traditionId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('giveGift', () => {
        it('should add gift', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            system.giveGift(tradition.traditionId, 'sword');
            expect(tradition.gifts.length).toBe(1);
            expect(tradition.gifts).toContain('sword');
        });

        it('should reject missing', () => {
            const result = system.giveGift('ghost', 'sword');
            expect(result.error).toBe('TRADITION_NOT_FOUND');
        });

        it('should trigger giftGiven hook', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            let called = false;
            system.registerHook('giftGiven', () => { called = true; });
            system.giveGift(tradition.traditionId, 'sword');
            expect(called).toBe(true);
        });
    });

    describe('markRare', () => {
        it('should mark as rare', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            system.markRare(tradition.traditionId);
            expect(tradition.status).toBe('rare');
        });

        it('should reject missing', () => {
            const result = system.markRare('ghost');
            expect(result.error).toBe('TRADITION_NOT_FOUND');
        });

        it('should trigger traditionRare hook', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            let called = false;
            system.registerHook('traditionRare', () => { called = true; });
            system.markRare(tradition.traditionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTraditionValue', () => {
        it('should calculate', () => {
            const { tradition } = system.preserveTradition({ sectId: 's1', name: 'F' });
            system.addParticipant(tradition.traditionId, 'm1');
            system.addParticipant(tradition.traditionId, 'm2');
            system.giveGift(tradition.traditionId, 'g1');
            // 3 participants * 5 + 1 gift * 10 = 25
            expect(system.calculateTraditionValue(tradition.traditionId)).toBe(25);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTraditionValue('ghost')).toBe(0);
        });
    });

    describe('listRare', () => {
        it('should filter rare', () => {
            const { tradition: t1 } = system.preserveTradition({ sectId: 's1', name: 'F1' });
            const { tradition: t2 } = system.preserveTradition({ sectId: 's1', name: 'F2' });
            system.markRare(t1.traditionId);
            expect(system.listRare().length).toBe(1);
            expect(system.listRare()[0].traditionId).toBe(t1.traditionId);
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

        it('should execute default getTradition', () => {
            const result = system.executeTool('getTradition', { traditionId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('traditionPreserved', () => count++);
            unregister();
            system.preserveTradition({ sectId: 's1', name: 'F' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('traditionPreserved', () => { throw new Error('x'); });
            expect(() => system.preserveTradition({ sectId: 's1', name: 'F' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTraditions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTraditions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.preserveTradition({ sectId: 's1', name: 'F' });
            const json = system.toJSON();
            expect(json.traditions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.preserveTradition({ sectId: 's1', name: 'F' });
            const json = system.toJSON();
            const newSys = new SectTradition();
            newSys.fromJSON(json);
            expect(newSys.traditions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.traditionCount).toBe(0);
        });
    });
});
