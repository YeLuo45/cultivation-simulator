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
      include: ['src/systems/alchemy/RecipeRegistry.js', 'src/systems/alchemy/IngredientCatalog.js', 'src/systems/alchemy/ReagentScanner.js', 'src/systems/alchemy/FurnaceManager.js', 'src/systems/alchemy/CrucibleForge.js', 'src/systems/alchemy/RefiningEngine.js', 'src/systems/alchemy/HeatController.js', 'src/systems/alchemy/DistillationApparatus.js', 'src/systems/alchemy/EssenceExtractor.js', 'src/systems/alchemy/FluxBalancer.js', 'src/systems/alchemy/EfficacyMapper.js', 'src/systems/alchemy/ToxicityAnalyzer.js', 'src/systems/alchemy/SynergyDetector.js', 'src/systems/alchemy/AntidoteMixer.js', 'src/systems/alchemy/MeridianActivator.js', 'src/systems/alchemy/PillStorage.js', 'src/systems/alchemy/QualityGrader.js', 'src/systems/alchemy/ExpirationTracker.js', 'src/systems/alchemy/PillPrescription.js', 'src/systems/alchemy/BatchProducer.js', 'src/systems/alchemy/PillSchool.js', 'src/systems/alchemy/MasteryTracker.js', 'src/systems/alchemy/SecretRecipeVault.js', 'src/systems/alchemy/ApprenticeMatcher.js', 'src/systems/alchemy/HerbGarden.js', 'src/systems/alchemy/PotionPotency.js', 'src/systems/alchemy/PillAuctioneer.js', 'src/systems/alchemy/CraftingLedger.js', 'src/systems/alchemy/PillMarketplace.js', 'src/systems/alchemy/AlchemyOrchestrator.js'],
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