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
      include: ['src/systems/fulu/PaperMill.js', 'src/systems/fulu/InkRefinery.js', 'src/systems/fulu/BrushSmith.js', 'src/systems/fulu/SymbolDesigner.js', 'src/systems/fulu/SealTemplate.js', 'src/systems/fulu/TalismanRegistry.js', 'src/systems/fulu/TalismanDrawer.js', 'src/systems/fulu/TalismanActivator.js', 'src/systems/fulu/TalismanCrafter.js', 'src/systems/fulu/TalismanCaster.js', 'src/systems/fulu/SealDesigner.js', 'src/systems/fulu/SealApplier.js', 'src/systems/fulu/SealBreaker.js', 'src/systems/fulu/SealInspector.js', 'src/systems/fulu/SealVault.js', 'src/systems/fulu/SpellBook.js', 'src/systems/fulu/ChantComposer.js', 'src/systems/fulu/RhymeAnalyzer.js', 'src/systems/fulu/WordCensor.js', 'src/systems/fulu/ManaScribe.js', 'src/systems/fulu/TalismanArray.js', 'src/systems/fulu/ArrayPlacer.js', 'src/systems/fulu/ArrayActivator.js', 'src/systems/fulu/ArrayTester.js', 'src/systems/fulu/ArrayArchivist.js', 'src/systems/fulu/TalismanCatalog.js', 'src/systems/fulu/TalismanSorter.js', 'src/systems/fulu/TalismanLibrarian.js', 'src/systems/fulu/TalismanAuctioneer.js', 'src/systems/fulu/TalismanOrchestrator.js'],
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