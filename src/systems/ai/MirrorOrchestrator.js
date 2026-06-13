/**
 * MirrorOrchestrator.js - 灵犀镜总编排器
 * V977 P-20260614-030 FINAL Iteration 30/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (generic-agent orchestrator + cross-engine):
 * - 整合 29 个 engines 提供的 player state
 * - 输出综合 coaching orchestrator state
 * - 5 维度 + master metric (0.4·density + 0.3·coherence + 0.3·resonance)
 * - Adapt 决策
 */

import { PlayerBehaviorCollector } from './PlayerBehaviorCollector.js';
import { SessionEventStream } from './SessionEventStream.js';
import { ActionHistoryAggregator } from './ActionHistoryAggregator.js';
import { PerformanceMetricsTracker } from './PerformanceMetricsTracker.js';
import { TimeOnTaskAnalyzer } from './TimeOnTaskAnalyzer.js';
import { StuckPointDetector } from './StuckPointDetector.js';
import { FailurePatternDetector } from './FailurePatternDetector.js';
import { ResourceBottleneckDetector } from './ResourceBottleneckDetector.js';
import { ProgressVelocityTracker } from './ProgressVelocityTracker.js';
import { EngagementDecayDetector } from './EngagementDecayDetector.js';
import { PlayerSkillProfile } from './PlayerSkillProfile.js';
import { PlayerLearningStyle } from './PlayerLearningStyle.js';
import { PlayerPreferenceGraph } from './PlayerPreferenceGraph.js';
import { PlayerMotivationMap } from './PlayerMotivationMap.js';
import { PlayerFrustrationGauge } from './PlayerFrustrationGauge.js';
import { AdaptiveDifficultyTuner } from './AdaptiveDifficultyTuner.js';
import { PersonalizedQuestGenerator } from './PersonalizedQuestGenerator.js';
import { DynamicHintProvider } from './DynamicHintProvider.js';
import { ResourceBalancer } from './ResourceBalancer.js';
import { TutorialTrigger } from './TutorialTrigger.js';
import { MirrorCoachEngine } from './MirrorCoachEngine.js';
import { GoalRecommender } from './GoalRecommender.js';
import { FailureRecoveryGuide } from './FailureRecoveryGuide.js';
import { MotivationBooster } from './MotivationBooster.js';
import { ReflectionPrompt } from './ReflectionPrompt.js';
import { RecommendationTracker } from './RecommendationTracker.js';
import { EffectivenessAnalyzer } from './EffectivenessAnalyzer.js';
import { LoopOptimizer } from './LoopOptimizer.js';
import { PolicyLearner } from './PolicyLearner.js';

export const ADAPT_MODES = ['bootstrap', 'balance', 'activate', 'maintain'];

export class MirrorOrchestrator {
    constructor(config = {}) {
        this.engines = {
            playerBehaviorCollector: new PlayerBehaviorCollector(),
            sessionEventStream: new SessionEventStream(),
            actionHistoryAggregator: new ActionHistoryAggregator(),
            performanceMetricsTracker: new PerformanceMetricsTracker(),
            timeOnTaskAnalyzer: new TimeOnTaskAnalyzer(),
            stuckPointDetector: new StuckPointDetector(),
            failurePatternDetector: new FailurePatternDetector(),
            resourceBottleneckDetector: new ResourceBottleneckDetector(),
            progressVelocityTracker: new ProgressVelocityTracker(),
            engagementDecayDetector: new EngagementDecayDetector(),
            playerSkillProfile: new PlayerSkillProfile(),
            playerLearningStyle: new PlayerLearningStyle(),
            playerPreferenceGraph: new PlayerPreferenceGraph(),
            playerMotivationMap: new PlayerMotivationMap(),
            playerFrustrationGauge: new PlayerFrustrationGauge(),
            adaptiveDifficultyTuner: new AdaptiveDifficultyTuner(),
            personalizedQuestGenerator: new PersonalizedQuestGenerator(),
            dynamicHintProvider: new DynamicHintProvider(),
            resourceBalancer: new ResourceBalancer(),
            tutorialTrigger: new TutorialTrigger(),
            mirrorCoachEngine: new MirrorCoachEngine(),
            goalRecommender: new GoalRecommender(),
            failureRecoveryGuide: new FailureRecoveryGuide(),
            motivationBooster: new MotivationBooster(),
            reflectionPrompt: new ReflectionPrompt(),
            recommendationTracker: new RecommendationTracker(),
            effectivenessAnalyzer: new EffectivenessAnalyzer(),
            loopOptimizer: new LoopOptimizer(),
            policyLearner: new PolicyLearner(),
        };
        this.snapshots = new Map();
        this.stats = { totalOrchestrated: 0 };
    }

    orchestrate(playerId) {
        const dim1 = this.engines.playerBehaviorCollector.events.size;
        const dim2 = this.engines.sessionEventStream.sessions.size;
        const dim3 = this.engines.performanceMetricsTracker.samples.size;
        const dim4 = this.engines.stuckPointDetector.stuckRecords.size;
        const dim5 = this.engines.failurePatternDetector.patterns.size;
        const dim6 = this.engines.resourceBottleneckDetector.bottlenecks.size;
        const dim7 = this.engines.engagementDecayDetector.interventions.size;
        const dim8 = this.engines.playerFrustrationGauge.levels.get(playerId) || 0;
        const snapshot = { dim1, dim2, dim3, dim4, dim5, dim6, dim7, dim8 };
        const values = Object.values(snapshot);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
        const density = mean / 100;
        const coherence = Math.max(0, 1 - stdDev / 100);
        const resonance = (dim1 * 0.05 + dim2 * 0.05 + dim3 * 0.1 + dim4 * 0.2 + dim5 * 0.2 + dim6 * 0.15 + dim7 * 0.15 + dim8 * 0.1) / 100;
        const mastery = density * 0.4 + coherence * 0.3 + resonance * 0.3;
        const state = {
            playerId,
            snapshot,
            density: Math.min(1, density),
            coherence: Math.min(1, coherence),
            resonance: Math.min(1, resonance),
            mastery: Math.min(1, mastery),
            ts: Date.now(),
        };
        this.snapshots.set(playerId, state);
        this.stats.totalOrchestrated++;
        return state;
    }

    adapt(state) {
        if (state.mastery < 0.3) return 'bootstrap';
        if (state.coherence < 0.4) return 'balance';
        if (state.density < 0.5) return 'activate';
        return 'maintain';
    }

    orchestrateAndAdapt(playerId) {
        const state = this.orchestrate(playerId);
        return { state, mode: this.adapt(state) };
    }

    listSnapshots() { return [...this.snapshots.values()]; }
    getSnapshot(playerId) { return this.snapshots.get(playerId) || null; }

    resetAll() {
        for (const engine of Object.values(this.engines)) {
            if (typeof engine.reset === 'function') engine.reset();
        }
        this.snapshots.clear();
        this.stats = { totalOrchestrated: 0 };
    }
}
