/**
 * CultivationBlock.test.js - 修真格挡系统测试
 * V735 Iteration 28/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBlock } from '../../../systems/ai/CultivationBlock.js';

describe('CultivationBlock', () => {
    let system;
    beforeEach(() => { system = new CultivationBlock(); });

    describe('recruitBlock', () => {
        it('should recruit a block', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'Iron Wall', type: 'wall' });
            expect(block.masterId).toBe('m1');
            expect(block.name).toBe('Iron Wall');
            expect(block.type).toBe('wall');
        });

        it('should default type to shield', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            expect(block.type).toBe('shield');
        });

        it('should default resistance to baseResistance', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            expect(block.resistance).toBe(20);
        });

        it('should start with novice status and level 1', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            expect(block.status).toBe('novice');
            expect(block.level).toBe(1);
        });

        it('should start with empty guards', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            expect(block.guards).toEqual([]);
        });

        it('should support custom resistance and guards', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B', resistance: 99, guards: ['g1'] });
            expect(block.resistance).toBe(99);
            expect(block.guards).toEqual(['g1']);
        });

        it('should support divine type', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B', type: 'divine' });
            expect(block.type).toBe('divine');
        });

        it('should trigger blockRecruited hook', () => {
            let called = false;
            system.registerHook('blockRecruited', () => { called = true; });
            system.recruitBlock({ masterId: 'm1', name: 'B' });
            expect(called).toBe(true);
        });

        it('should increment totalBlocks stat', () => {
            system.recruitBlock({ masterId: 'm1', name: 'A' });
            system.recruitBlock({ masterId: 'm2', name: 'B' });
            expect(system.stats.totalBlocks).toBe(2);
        });
    });

    describe('getBlock', () => {
        it('should return block', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            const found = system.getBlock(block.blockId);
            expect(found).not.toBeNull();
            expect(found.blockId).toBe(block.blockId);
        });

        it('should return null for missing', () => {
            expect(system.getBlock('ghost')).toBeNull();
        });
    });

    describe('listBlocks', () => {
        it('should list all', () => {
            system.recruitBlock({ masterId: 'm1', name: 'A' });
            system.recruitBlock({ masterId: 'm2', name: 'B' });
            expect(system.listBlocks().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listBlocks()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitBlock({ masterId: 'm1', name: 'A' });
            system.recruitBlock({ masterId: 'm2', name: 'B' });
            system.recruitBlock({ masterId: 'm1', name: 'C' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitBlock({ masterId: 'm1', name: 'A' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { block: a } = system.recruitBlock({ masterId: 'm1', name: 'A' });
            system.recruitBlock({ masterId: 'm1', name: 'B' });
            system.legendBlock(a.blockId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitBlock({ masterId: 'm1', name: 'A' });
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addGuard', () => {
        it('should add guard', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            system.addGuard(block.blockId, 'warrior1');
            expect(block.guards).toContain('warrior1');
        });

        it('should add multiple guards', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            system.addGuard(block.blockId, 'g1');
            system.addGuard(block.blockId, 'g2');
            expect(block.guards.length).toBe(2);
        });

        it('should reject missing block', () => {
            const result = system.addGuard('ghost', 'warrior');
            expect(result.error).toBe('BLOCK_NOT_FOUND');
        });

        it('should trigger guardAdded hook', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            let called = false;
            system.registerHook('guardAdded', () => { called = true; });
            system.addGuard(block.blockId, 'g1');
            expect(called).toBe(true);
        });
    });

    describe('raiseResistance', () => {
        it('should raise by default 5', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            system.raiseResistance(block.blockId);
            expect(block.resistance).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            system.raiseResistance(block.blockId, 50);
            expect(block.resistance).toBe(70);
        });

        it('should reject missing block', () => {
            const result = system.raiseResistance('ghost', 10);
            expect(result.error).toBe('BLOCK_NOT_FOUND');
        });

        it('should trigger resistanceRaised hook', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            let called = false;
            system.registerHook('resistanceRaised', () => { called = true; });
            system.raiseResistance(block.blockId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBlock', () => {
        it('should increment level', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            system.levelUpBlock(block.blockId);
            expect(block.level).toBe(2);
        });

        it('should increment level multiple times', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            system.levelUpBlock(block.blockId);
            system.levelUpBlock(block.blockId);
            system.levelUpBlock(block.blockId);
            expect(block.level).toBe(4);
        });

        it('should reject missing block', () => {
            const result = system.levelUpBlock('ghost');
            expect(result.error).toBe('BLOCK_NOT_FOUND');
        });
    });

    describe('legendBlock', () => {
        it('should set status to legendary', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            system.legendBlock(block.blockId);
            expect(block.status).toBe('legendary');
        });

        it('should reject missing block', () => {
            const result = system.legendBlock('ghost');
            expect(result.error).toBe('BLOCK_NOT_FOUND');
        });

        it('should trigger blockLegendized hook', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            let called = false;
            system.registerHook('blockLegendized', () => { called = true; });
            system.legendBlock(block.blockId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBlockValue', () => {
        it('should calculate base value', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            // level=1 * 100 + resistance=20 * 2 + guards=0 * 30 = 140
            expect(system.calculateBlockValue(block.blockId)).toBe(140);
        });

        it('should account for level and guards', () => {
            const { block } = system.recruitBlock({ masterId: 'm1', name: 'B' });
            system.levelUpBlock(block.blockId); // 2
            system.levelUpBlock(block.blockId); // 3
            system.addGuard(block.blockId, 'g1');
            system.addGuard(block.blockId, 'g2');
            system.raiseResistance(block.blockId, 10); // 30
            // level=3 * 100 + resistance=30 * 2 + guards=2 * 30 = 300+60+60=420
            expect(system.calculateBlockValue(block.blockId)).toBe(420);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBlockValue('ghost')).toBe(0);
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

        it('should execute default getBlock', () => {
            const result = system.executeTool('getBlock', { blockId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('blockRecruited', () => count++);
            unregister();
            system.recruitBlock({ masterId: 'm1', name: 'B' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('blockRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBlock({ masterId: 'm1', name: 'B' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBlocks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBlocks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBlock({ masterId: 'm1', name: 'B' });
            const json = system.toJSON();
            expect(json.blocks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBlock({ masterId: 'm1', name: 'B' });
            const json = system.toJSON();
            const newSys = new CultivationBlock();
            newSys.fromJSON(json);
            expect(newSys.blocks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.blockCount).toBe(0);
        });
    });
});
