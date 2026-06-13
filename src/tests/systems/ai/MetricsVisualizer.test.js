/**
 * MetricsVisualizer.test.js - 指标可视化工具测试
 * V292 Iteration 7/9
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsVisualizer } from '../../../systems/ai/MetricsVisualizer.js';

describe('MetricsVisualizer', () => {
    let visualizer, mockDashboard;

    beforeEach(() => {
        mockDashboard = {
            getNPCMetrics: (npcId) => ({
                npcId,
                evolutionLevel: 3,
                totalInteractions: 15,
                adaptationScore: 0.75,
                skillCount: 4,
                meshConnections: 2
            }),
            experienceTracker: {
                getRecords: (npcId) => Array(10).fill(null).map((_, i) => ({
                    outcome: { satisfaction: 0.5 + (i % 3) * 0.15 }
                }))
            }
        };
        visualizer = new MetricsVisualizer(mockDashboard);
    });

    it('should generate radar chart data', () => {
        const radarData = visualizer.generateRadarChartData('npc1');
        expect(radarData.labels).toContain('修为');
        expect(radarData.datasets).toHaveLength(1);
        expect(radarData.datasets[0].data).toHaveLength(5);
    });

    it('should generate progress bar data', () => {
        const progressData = visualizer.generateProgressBarData('npc1');
        expect(Array.isArray(progressData)).toBe(true);
        expect(progressData.length).toBe(4);
        expect(progressData[0]).toHaveProperty('label');
        expect(progressData[0]).toHaveProperty('current');
        expect(progressData[0]).toHaveProperty('max');
    });

    it('should generate trend line data', () => {
        const trendData = visualizer.generateTrendLineData('npc1', 'satisfaction');
        expect(Array.isArray(trendData)).toBe(true);
    });

    it('should generate multi-NPC comparison', () => {
        const comparison = visualizer.generateMultiNPCComparison(['npc1', 'npc2']);
        expect(comparison).toHaveLength(2);
        expect(comparison[0]).toHaveProperty('npcId');
        expect(comparison[0]).toHaveProperty('metrics');
        expect(comparison[0]).toHaveProperty('radarData');
    });

    it('should handle empty dashboard', () => {
        const emptyDash = new MetricsVisualizer({});
        const radarData = emptyDash.generateRadarChartData('empty');
        expect(radarData.datasets[0].data).toHaveLength(5);
    });

    it('should handle missing metrics', () => {
        const noMetricsDash = new MetricsVisualizer({
            getNPCMetrics: () => ({ npcId: 'no_metrics' })
        });
        const radarData = noMetricsDash.generateRadarChartData('no_metrics');
        expect(radarData.datasets[0].label).toBe('no_metrics');
    });

    it('should generate radar with zero values', () => {
        const zeroDash = new MetricsVisualizer({
            getNPCMetrics: () => ({
                npcId: 'zero',
                evolutionLevel: 0,
                skillCount: 0,
                meshConnections: 0,
                adaptationScore: 0,
                totalInteractions: 0
            })
        });
        const radarData = zeroDash.generateRadarChartData('zero');
        expect(radarData.datasets[0].data.every(v => v <= 0)).toBe(true);
    });

    it('should generate progress bars with labels', () => {
        const progressData = visualizer.generateProgressBarData('test_npc');
        const labels = progressData.map(p => p.label);
        expect(labels).toContain('进化等级');
        expect(labels).toContain('技能数量');
        expect(labels).toContain('连接数');
        expect(labels).toContain('适应度');
    });

    it('should scale radar data correctly', () => {
        const radarData = visualizer.generateRadarChartData('scale_npc');
        const data = radarData.datasets[0].data;
        expect(data[0]).toBeLessThanOrEqual(100); // evolution level * 10
        expect(data[1]).toBeLessThanOrEqual(160); // skill count * 8
        expect(data[2]).toBeLessThanOrEqual(30); // connections * 15
    });

    it('should handle trend with no records', () => {
        const noRecordsDash = new MetricsVisualizer({
            experienceTracker: { getRecords: () => [] }
        });
        const trendData = noRecordsDash.generateTrendLineData('no_records', 'satisfaction');
        expect(Array.isArray(trendData)).toBe(true);
    });

    it('should generate comparison with single NPC', () => {
        const comparison = visualizer.generateMultiNPCComparison(['single_npc']);
        expect(comparison).toHaveLength(1);
    });

    it('should generate comparison with three NPCs', () => {
        const comparison = visualizer.generateMultiNPCComparison(['npc1', 'npc2', 'npc3']);
        expect(comparison).toHaveLength(3);
    });

    it('should handle null records in trend', () => {
        const nullRecordsDash = new MetricsVisualizer({
            experienceTracker: { getRecords: () => [null, null] }
        });
        const trendData = nullRecordsDash.generateTrendLineData('null_trend', 'satisfaction');
        expect(Array.isArray(trendData)).toBe(true);
    });

    it('should return valid progress bar structure', () => {
        const progressData = visualizer.generateProgressBarData('struct_npc');
        progressData.forEach(p => {
            expect(typeof p.label).toBe('string');
            expect(typeof p.current).toBe('number');
            expect(typeof p.max).toBe('number');
            expect(p.max).toBeGreaterThan(0);
        });
    });

    it('should work with high values', () => {
        const highDash = new MetricsVisualizer({
            getNPCMetrics: () => ({
                npcId: 'high',
                evolutionLevel: 10,
                skillCount: 50,
                meshConnections: 20,
                adaptationScore: 1,
                totalInteractions: 1000
            })
        });
        const radarData = highDash.generateRadarChartData('high');
        expect(radarData.datasets[0].data[0]).toBe(100);
    });

    it('should limit trend data to last 20', () => {
        const longDash = new MetricsVisualizer({
            experienceTracker: { getRecords: () => Array(50).fill(null).map(() => ({ outcome: { satisfaction: 0.5 } })) }
        });
        const trendData = longDash.generateTrendLineData('long_npc', 'satisfaction');
        expect(trendData.length).toBeLessThanOrEqual(20);
    });

    it('should handle undefined metrics fields', () => {
        const partialDash = new MetricsVisualizer({
            getNPCMetrics: () => ({ npcId: 'partial' })
        });
        const radarData = partialDash.generateRadarChartData('partial');
        expect(radarData.datasets[0].data).toHaveLength(5);
    });

    it('should generate comparison with radar data', () => {
        const comparison = visualizer.generateMultiNPCComparison(['comp_npc']);
        expect(comparison[0].radarData).toHaveProperty('labels');
        expect(comparison[0].radarData).toHaveProperty('datasets');
    });
});