/**
 * SectPromotion.test.js - 宗门晋升系统测试
 * V491 Iteration 8/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectPromotion } from '../../../systems/ai/SectPromotion.js';

describe('SectPromotion', () => {
    let system;
    beforeEach(() => { system = new SectPromotion(); });

    describe('proposePromotion', () => {
        it('should propose', () => {
            const { promotion } = system.proposePromotion({ sectId: 's1', member: 'm1' });
            expect(promotion.sectId).toBe('s1');
            expect(promotion.member).toBe('m1');
        });

        it('should default status to pending', () => {
            const { promotion } = system.proposePromotion({});
            expect(promotion.status).toBe('pending');
        });

        it('should use baseMerit by default', () => {
            const { promotion } = system.proposePromotion({});
            expect(promotion.merit).toBe(10);
        });

        it('should trigger promotionProposed hook', () => {
            let called = false;
            system.registerHook('promotionProposed', () => { called = true; });
            system.proposePromotion({});
            expect(called).toBe(true);
        });
    });

    describe('getPromotion', () => {
        it('should return', () => {
            const { promotion } = system.proposePromotion({});
            expect(system.getPromotion(promotion.promotionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPromotion('ghost')).toBeNull(); });
    });

    describe('listPromotions', () => {
        it('should list all', () => {
            system.proposePromotion({});
            expect(system.listPromotions().length).toBe(1);
        });
        it('should return empty when none', () => {
            expect(system.listPromotions().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.proposePromotion({ sectId: 's1' });
            system.proposePromotion({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty for missing sect', () => {
            system.proposePromotion({ sectId: 's1' });
            expect(system.listBySect('ghost').length).toBe(0);
        });
    });

    describe('listApproved', () => {
        it('should filter approved', () => {
            const { promotion: p1 } = system.proposePromotion({});
            const { promotion: p2 } = system.proposePromotion({});
            system.approvePromotion(p1.promotionId);
            expect(system.listApproved().length).toBe(1);
            expect(p2.status).toBe('pending');
        });

        it('should return empty when no approved', () => {
            system.proposePromotion({});
            expect(system.listApproved().length).toBe(0);
        });
    });

    describe('addMerit', () => {
        it('should add merit with default amount', () => {
            const { promotion } = system.proposePromotion({});
            system.addMerit(promotion.promotionId);
            expect(promotion.merit).toBe(20);
        });

        it('should add merit with custom amount', () => {
            const { promotion } = system.proposePromotion({});
            system.addMerit(promotion.promotionId, 25);
            expect(promotion.merit).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.addMerit('ghost', 10);
            expect(result.error).toBe('PROMOTION_NOT_FOUND');
        });

        it('should trigger meritAdded hook', () => {
            const { promotion } = system.proposePromotion({});
            let called = false;
            system.registerHook('meritAdded', () => { called = true; });
            system.addMerit(promotion.promotionId, 10);
            expect(called).toBe(true);
        });
    });

    describe('approvePromotion', () => {
        it('should approve', () => {
            const { promotion } = system.proposePromotion({});
            system.approvePromotion(promotion.promotionId);
            expect(promotion.status).toBe('approved');
        });

        it('should reject missing', () => {
            const result = system.approvePromotion('ghost');
            expect(result.error).toBe('PROMOTION_NOT_FOUND');
        });

        it('should trigger promotionApproved hook', () => {
            const { promotion } = system.proposePromotion({});
            let called = false;
            system.registerHook('promotionApproved', () => { called = true; });
            system.approvePromotion(promotion.promotionId);
            expect(called).toBe(true);
        });
    });

    describe('rejectPromotion', () => {
        it('should reject', () => {
            const { promotion } = system.proposePromotion({});
            system.rejectPromotion(promotion.promotionId);
            expect(promotion.status).toBe('rejected');
        });

        it('should reject missing', () => {
            const result = system.rejectPromotion('ghost');
            expect(result.error).toBe('PROMOTION_NOT_FOUND');
        });

        it('should trigger promotionRejected hook', () => {
            const { promotion } = system.proposePromotion({});
            let called = false;
            system.registerHook('promotionRejected', () => { called = true; });
            system.rejectPromotion(promotion.promotionId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePromotionScore', () => {
        it('should calculate', () => {
            const { promotion } = system.proposePromotion({ toRank: 'elder' });
            // merit (10 default) * 10 + toRank.length (5) = 100 + 5 = 105
            expect(system.calculatePromotionScore(promotion.promotionId)).toBe(105);
        });

        it('should reflect added merit', () => {
            const { promotion } = system.proposePromotion({ toRank: 'ab' });
            system.addMerit(promotion.promotionId, 5);
            // merit (15) * 10 + toRank.length (2) = 150 + 2 = 152
            expect(system.calculatePromotionScore(promotion.promotionId)).toBe(152);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePromotionScore('ghost')).toBe(0);
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

        it('should execute default getPromotion', () => {
            const result = system.executeTool('getPromotion', { promotionId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('promotionProposed', () => count++);
            unregister();
            system.proposePromotion({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('promotionProposed', () => { throw new Error('x'); });
            expect(() => system.proposePromotion({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPromotions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPromotions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.proposePromotion({});
            const json = system.toJSON();
            expect(json.promotions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.proposePromotion({});
            const json = system.toJSON();
            const newSys = new SectPromotion();
            newSys.fromJSON(json);
            expect(newSys.promotions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.promotionCount).toBe(0);
        });
    });
});
