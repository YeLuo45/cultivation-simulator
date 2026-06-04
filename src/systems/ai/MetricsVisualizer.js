/**
 * MetricsVisualizer.js - 指标可视化工具
 * V292 Iteration 7/9 - NPC Evolution Metrics Dashboard
 * 
 * 来源: claude-code dashboard design
 */

export class MetricsVisualizer {
    constructor(evolutionMetricsDashboard) {
        this.dashboard = evolutionMetricsDashboard;
    }

    generateRadarChartData(npcId) {
        const metrics = (this.dashboard && typeof this.dashboard.getNPCMetrics === 'function')
            ? this.dashboard.getNPCMetrics(npcId) : { npcId, evolutionLevel: 0, skillCount: 0, meshConnections: 0, adaptationScore: 0, totalInteractions: 0 };
        
        return {
            labels: ['修为', '技能', '人脉', '适应度', '活跃度'],
            datasets: [{
                label: npcId,
                data: [
                    (metrics.evolutionLevel != null ? metrics.evolutionLevel : 0) * 10,
                    (metrics.skillCount != null ? metrics.skillCount : 0) * 8,
                    (metrics.meshConnections != null ? metrics.meshConnections : 0) * 15,
                    (metrics.adaptationScore != null ? metrics.adaptationScore : 0) * 10,
                    Math.min((metrics.totalInteractions != null ? metrics.totalInteractions : 0), 100)
                ]
            }]
        };
    }

    generateProgressBarData(npcId) {
        const metrics = this.dashboard.getNPCMetrics(npcId);
        
        return [
            { label: '进化等级', current: metrics.evolutionLevel || 1, max: 10 },
            { label: '技能数量', current: metrics.skillCount || 0, max: 20 },
            { label: '连接数', current: metrics.meshConnections || 0, max: 10 },
            { label: '适应度', current: Math.round((metrics.adaptationScore || 0) * 100), max: 100 }
        ];
    }

    generateTrendLineData(npcId, metricType) {
        const records = this.dashboard.experienceTracker?.getRecords(npcId) || [];
        
        return records.slice(-20).map((r, i) => ({
            x: i,
            y: (r && r.outcome) ? r.outcome.satisfaction : 0.5
        }));
    }

    generateMultiNPCComparison(npcIds) {
        return npcIds.map(id => ({
            npcId: id,
            metrics: this.dashboard.getNPCMetrics(id),
            radarData: this.generateRadarChartData(id)
        }));
    }
}