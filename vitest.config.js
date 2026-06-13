import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/systems/ai/PlayerBehaviorCollector.js', 'src/systems/ai/SessionEventStream.js', 'src/systems/ai/ActionHistoryAggregator.js', 'src/systems/ai/PerformanceMetricsTracker.js', 'src/systems/ai/TimeOnTaskAnalyzer.js', 'src/systems/ai/StuckPointDetector.js', 'src/systems/ai/FailurePatternDetector.js', 'src/systems/ai/ResourceBottleneckDetector.js', 'src/systems/ai/ProgressVelocityTracker.js', 'src/systems/ai/EngagementDecayDetector.js', 'src/systems/ai/PlayerSkillProfile.js', 'src/systems/ai/PlayerLearningStyle.js', 'src/systems/ai/PlayerPreferenceGraph.js', 'src/systems/ai/PlayerMotivationMap.js', 'src/systems/ai/PlayerFrustrationGauge.js', 'src/systems/ai/AdaptiveDifficultyTuner.js', 'src/systems/ai/PersonalizedQuestGenerator.js', 'src/systems/ai/DynamicHintProvider.js', 'src/systems/ai/ResourceBalancer.js', 'src/systems/ai/TutorialTrigger.js', 'src/systems/ai/MirrorCoachEngine.js', 'src/systems/ai/GoalRecommender.js', 'src/systems/ai/MotivationBooster.js', 'src/systems/ai/ReflectionPrompt.js', 'src/systems/ai/RecommendationTracker.js', 'src/systems/ai/EffectivenessAnalyzer.js', 'src/systems/ai/LoopOptimizer.js', 'src/systems/ai/PolicyLearner.js'],
      exclude: [],
      thresholds: {
        statements: 99,
        branches: 90,
        functions: 99,
        lines: 99
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});