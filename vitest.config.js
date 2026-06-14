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
      include: ['src/systems/arena/MatchMaker.js', 'src/systems/arena/BracketBuilder.js', 'src/systems/arena/OpponentScouter.js', 'src/systems/arena/ArenaSelector.js', 'src/systems/arena/SchedulePlanner.js', 'src/systems/arena/CombatEngine.js', 'src/systems/arena/DamageCalculator.js', 'src/systems/arena/DefenseResolver.js', 'src/systems/arena/StatusEffectManager.js', 'src/systems/arena/ComboChainTracker.js', 'src/systems/arena/TechniqueLibrary.js', 'src/systems/arena/StanceManager.js', 'src/systems/arena/FormSequence.js', 'src/systems/arena/ElementalAffinity.js', 'src/systems/arena/QiFlowController.js', 'src/systems/arena/WeaponForge.js', 'src/systems/arena/ArmorSetManager.js', 'src/systems/arena/AccessorySlotter.js', 'src/systems/arena/SetBonusCalculator.js', 'src/systems/arena/EnhancementSorter.js', 'src/systems/arena/TournamentDirector.js', 'src/systems/arena/RankingLadder.js', 'src/systems/arena/SeasonManager.js', 'src/systems/arena/TitleAwarder.js', 'src/systems/arena/RecordBook.js', 'src/systems/arena/CultivationMilestone.js', 'src/systems/arena/BreakthroughCatalyst.js', 'src/systems/arena/MentorMatcher.js', 'src/systems/arena/ProgressDiary.js', 'src/systems/arena/ArenaOrchestrator.js'],
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