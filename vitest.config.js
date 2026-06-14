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
      include: ['src/systems/council/SectProposalCollector.js', 'src/systems/council/SectMemberRegistry.js', 'src/systems/council/VotingPowerCalculator.js', 'src/systems/council/SectRoleHierarchy.js', 'src/systems/council/SectTermTracker.js', 'src/systems/council/BallotBox.js', 'src/systems/council/VoteWeightingEngine.js', 'src/systems/council/QuorumCalculator.js', 'src/systems/council/VotingResultAggregator.js', 'src/systems/council/VoteValidator.js', 'src/systems/council/ProposalStateMachine.js', 'src/systems/council/CouncilSession.js', 'src/systems/council/ResolutionExecutor.js', 'src/systems/council/DecreesAnnouncer.js', 'src/systems/council/DecisionLogger.js', 'src/systems/council/PowerBalanceMonitor.js', 'src/systems/council/ReputationEngine.js', 'src/systems/council/ContributionTracker.js', 'src/systems/council/FactionDynamics.js', 'src/systems/council/SeniorityRanker.js', 'src/systems/council/DiplomacyMesh.js', 'src/systems/council/TreatyEngine.js', 'src/systems/council/AllianceFormation.js', 'src/systems/council/ConflictResolver.js', 'src/systems/council/CulturalExchange.js', 'src/systems/council/PoliticalTrendPredictor.js', 'src/systems/council/PolicyLearner.js', 'src/systems/council/SectConstitutionEngine.js', 'src/systems/council/SectHistoryArchive.js', 'src/systems/council/SectCouncilOrchestrator.js'],
      exclude: [],
      thresholds: {
        statements: 99,
        branches: 80,
        functions: 85,
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