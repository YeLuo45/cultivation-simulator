/**
 * PaintingCultivation.test.js - 画道系统测试
 * V425 Iteration 2/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PaintingCultivation } from '../../../systems/ai/PaintingCultivation.js';

describe('PaintingCultivation', () => {
    let system;
    beforeEach(() => { system = new PaintingCultivation(); });

    describe('createPainting', () => {
        it('should create', () => {
            const { painting } = system.createPainting({ name: 'Mountain Mist', type: 'landscape', cultivatorId: 'c1' });
            expect(painting.name).toBe('Mountain Mist');
            expect(painting.type).toBe('landscape');
        });

        it('should default type and brushwork', () => {
            const { painting } = system.createPainting({});
            expect(painting.type).toBe('landscape');
            expect(painting.brushwork).toBe(20);
        });

        it('should trigger paintingCreated hook', () => {
            let called = false;
            system.registerHook('paintingCreated', () => { called = true; });
            system.createPainting({});
            expect(called).toBe(true);
        });
    });

    describe('getPainting', () => {
        it('should return', () => {
            const { painting } = system.createPainting({});
            expect(system.getPainting(painting.paintingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPainting('ghost')).toBeNull(); });
    });

    describe('listPaintings', () => {
        it('should list all', () => {
            system.createPainting({});
            system.createPainting({});
            expect(system.listPaintings().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listPaintings().length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.createPainting({ type: 'landscape' });
            system.createPainting({ type: 'figure' });
            expect(system.listByType('landscape').length).toBe(1);
        });

        it('should handle abstract type', () => {
            system.createPainting({ type: 'abstract' });
            expect(system.listByType('abstract').length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.createPainting({ cultivatorId: 'c1' });
            system.createPainting({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('refinePainting', () => {
        it('should refine', () => {
            const { painting } = system.createPainting({});
            system.refinePainting(painting.paintingId, 10);
            expect(painting.brushwork).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.refinePainting('ghost', 10);
            expect(result.error).toBe('PAINTING_NOT_FOUND');
        });

        it('should trigger paintingRefined hook', () => {
            const { painting } = system.createPainting({});
            let called = false;
            system.registerHook('paintingRefined', () => { called = true; });
            system.refinePainting(painting.paintingId, 5);
            expect(called).toBe(true);
        });
    });

    describe('paintPainting', () => {
        it('should paint', () => {
            const { painting } = system.createPainting({});
            system.paintPainting(painting.paintingId, '#ff0000');
            expect(painting.color).toBe('#ff0000');
        });

        it('should reject missing', () => {
            const result = system.paintPainting('ghost', '#ff0000');
            expect(result.error).toBe('PAINTING_NOT_FOUND');
        });

        it('should trigger paintApplied hook', () => {
            const { painting } = system.createPainting({});
            let called = false;
            system.registerHook('paintApplied', () => { called = true; });
            system.paintPainting(painting.paintingId, '#00ff00');
            expect(called).toBe(true);
        });
    });

    describe('completePainting', () => {
        it('should complete', () => {
            const { painting } = system.createPainting({});
            system.completePainting(painting.paintingId);
            expect(painting.status).toBe('completed');
        });

        it('should reject missing', () => {
            const result = system.completePainting('ghost');
            expect(result.error).toBe('PAINTING_NOT_FOUND');
        });

        it('should trigger paintingCompleted hook', () => {
            const { painting } = system.createPainting({});
            let called = false;
            system.registerHook('paintingCompleted', () => { called = true; });
            system.completePainting(painting.paintingId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDaoInsight', () => {
        it('should calculate', () => {
            const { painting } = system.createPainting({ brushwork: 20, color: '#000000', dao: 'dao1' });
            // 20 * (1 + 7/10) + 4 = 20 * 1.7 + 4 = 34 + 4 = 38
            expect(system.calculateDaoInsight(painting.paintingId)).toBeCloseTo(38, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDaoInsight('ghost')).toBe(0);
        });

        it('should incorporate dao length', () => {
            const { painting } = system.createPainting({ brushwork: 10, color: '#', dao: 'waterdao' });
            // 10 * (1 + 1/10) + 8 = 11 + 8 = 19
            expect(system.calculateDaoInsight(painting.paintingId)).toBeCloseTo(19, 5);
        });
    });

    describe('listByStatus', () => {
        it('should filter completed', () => {
            const { painting } = system.createPainting({});
            system.completePainting(painting.paintingId);
            expect(system.listByStatus('completed').length).toBe(1);
        });
    });

    describe('listCompleted', () => {
        it('should filter', () => {
            const { painting } = system.createPainting({});
            system.completePainting(painting.paintingId);
            system.createPainting({});
            expect(system.listCompleted().length).toBe(1);
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

        it('should execute default getPainting', () => {
            const result = system.executeTool('getPainting', { paintingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('paintingCreated', () => count++);
            unregister();
            system.createPainting({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('paintingCreated', () => { throw new Error('x'); });
            expect(() => system.createPainting({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPaintings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPaintings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createPainting({});
            const json = system.toJSON();
            expect(json.paintings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createPainting({});
            const json = system.toJSON();
            const newSys = new PaintingCultivation();
            newSys.fromJSON(json);
            expect(newSys.paintings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.paintingCount).toBe(0);
        });
    });
});
