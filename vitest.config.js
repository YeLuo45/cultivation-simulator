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
      include: ['src/systems/shenzhu/RootProfiler.js', 'src/systems/shenzhu/AwakeningTracker.js', 'src/systems/shenzhu/InnateAbility.js', 'src/systems/shenzhu/SpiritualVein.js', 'src/systems/shenzhu/RealmFoundation.js', 'src/systems/shenzhu/TechniqueRegistry.js', 'src/systems/shenzhu/CultivationManual.js', 'src/systems/shenzhu/CultivationSimulator.js', 'src/systems/shenzhu/BreakthroughCatalyst.js', 'src/systems/shenzhu/TribulationManager.js', 'src/systems/shenzhu/SpiritBeastRegistry.js', 'src/systems/shenzhu/BeastTamer.js', 'src/systems/shenzhu/BeastBond.js', 'src/systems/shenzhu/BeastEvolution.js', 'src/systems/shenzhu/BeastArena.js', 'src/systems/shenzhu/ArtifactForge.js', 'src/systems/shenzhu/ArtifactRefinery.js', 'src/systems/shenzhu/ArtifactEnhancer.js', 'src/systems/shenzhu/ArtifactSorter.js', 'src/systems/shenzhu/ArtifactVault.js', 'src/systems/shenzhu/FormationRegistry.js', 'src/systems/shenzhu/FormationBuilder.js', 'src/systems/shenzhu/FormationMaster.js', 'src/systems/shenzhu/FormationTrapper.js', 'src/systems/shenzhu/FormationBreaker.js', 'src/systems/shenzhu/SkillArchive.js', 'src/systems/shenzhu/CultivationDiary.js', 'src/systems/shenzhu/HeavenEarthLedger.js', 'src/systems/shenzhu/DestinyTracker.js', 'src/systems/shenzhu/SkillOrchestrator.js'],
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