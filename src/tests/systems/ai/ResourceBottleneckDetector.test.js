/**
 * ResourceBottleneckDetector.test.js - 资源瓶颈检测器测试
 * V955 P-20260614-008 Iteration 8/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceBottleneckDetector, RESOURCE_TYPES } from '../../../systems/ai/ResourceBottleneckDetector.js';

describe('ResourceBottleneckDetector', () => {
    let d;
    beforeEach(() => { d = new ResourceBottleneckDetector(); });

    it('initializes with defaults', () => {
        expect(d.flows.size).toBe(0);
        expect(d.config.bottleneckRatio).toBe(1.2);
    });

    it('records a flow', () => {
        const f = d.recordFlow('p1', 'qi', 100, 'in');
        expect(f).not.toBeNull();
        expect(d.stats.totalFlows).toBe(1);
    });

    it('rejects invalid input', () => {
        expect(d.recordFlow('', 'qi', 100, 'in')).toBeNull();
        expect(d.recordFlow('p1', 'invalid', 100, 'in')).toBeNull();
        expect(d.recordFlow('p1', 'qi', -1, 'in')).toBeNull();
        expect(d.recordFlow('p1', 'qi', 100, 'invalid')).toBeNull();
    });

    it('detects bottleneck when out > in*ratio', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 200, 'out');
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 250, 'out');
        const bn = d.getBottleneck('bnk_p1_qi');
        expect(bn).not.toBeNull();
        expect(d.stats.totalBottlenecks).toBe(1);
    });

    it('no bottleneck when balanced', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 100, 'out');
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 100, 'out');
        expect(d.stats.totalBottlenecks).toBe(0);
    });

    it('isCritical when balance low', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 150, 'out');
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 200, 'out');
        const bn = d.getBottleneck('bnk_p1_qi');
        expect(bn).not.toBeNull();
        expect(bn.isCritical).toBe(true);
    });

    it('netBalance sums in-out', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 30, 'out');
        expect(d.netBalance('p1', 'qi')).toBe(70);
    });

    it('netBalance for unknown returns 0', () => {
        expect(d.netBalance('ghost', 'qi')).toBe(0);
    });

    it('predictExhaustion returns null for stable', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 100, 'in');
        expect(d.predictExhaustion('p1', 'qi')).toBeNull();
    });

    it('predictExhaustion calculates cycles', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 80, 'out');
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 80, 'out');
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 80, 'out');
        const pred = d.predictExhaustion('p1', 'qi');
        expect(pred).not.toBeNull();
        expect(pred.cyclesToZero).toBeGreaterThan(0);
    });

    it('criticalResources lists critical bottlenecks', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 150, 'out');
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 200, 'out');
        expect(d.criticalResources('p1')).toContain('qi');
    });

    it('listBottlenecks filters by player', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 200, 'out');
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 200, 'out');
        d.recordFlow('p2', 'qi', 100, 'in');
        d.recordFlow('p2', 'qi', 200, 'out');
        d.recordFlow('p2', 'qi', 100, 'in');
        d.recordFlow('p2', 'qi', 200, 'out');
        expect(d.listBottlenecks('p1').length).toBe(1);
    });

    it('getBottleneck returns null for unknown', () => {
        expect(d.getBottleneck('ghost')).toBeNull();
    });

    it('report aggregates per resource', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'lingshi', 50, 'in');
        const r = d.report('p1');
        expect(r.balances.qi.in).toBe(100);
        expect(r.balances.lingshi.in).toBe(50);
    });

    it('reset clears', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.reset();
        expect(d.flows.size).toBe(0);
    });

    it('caps records at maxRecords', () => {
        const d2 = new ResourceBottleneckDetector({ maxRecords: 3 });
        for (let i = 0; i < 5; i++) d2.recordFlow('p1', 'qi', 10, 'in');
        expect([...d2.playerFlows.get('p1').values()][0].length).toBe(3);
    });

    it('exposes RESOURCE_TYPES', () => {
        expect(RESOURCE_TYPES).toContain('qi');
    });

    it('covers all public methods', () => {
        d.recordFlow('p1', 'qi', 100, 'in');
        d.recordFlow('p1', 'qi', 50, 'out');
        d.getBottleneck('ghost');
        d.listBottlenecks();
        d.netBalance('p1', 'qi');
        d.predictExhaustion('p1', 'qi');
        d.criticalResources('p1');
        d.report('p1');
        d.reset();
        const d2 = new ResourceBottleneckDetector();
        let called = false;
        d2.registerHook('flowRecorded', () => { called = true; });
        d2.recordFlow('p1', 'qi', 10, 'in');
        expect(called).toBe(true);
    });
});
