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
      include: ['src/systems/fulu/PaperMill.js', 'src/systems/fulu/InkRefinery.js', 'src/systems/fulu/BrushSmith.js', 'src/systems/fulu/SymbolDesigner.js', 'src/systems/fulu/SealTemplate.js', 'src/systems/fulu/TalismanRegistry.js', 'src/systems/fulu/TalismanDrawer.js', 'src/systems/fulu/TalismanActivator.js', 'src/systems/fulu/TalismanCrafter.js', 'src/systems/fulu/TalismanCaster.js', 'src/systems/fulu/SealDesigner.js', 'src/systems/fulu/SealApplier.js', 'src/systems/fulu/SealBreaker.js', 'src/systems/fulu/SealInspector.js', 'src/systems/fulu/SealVault.js', 'src/systems/fulu/SpellBook.js', 'src/systems/fulu/ChantComposer.js', 'src/systems/fulu/RhymeAnalyzer.js', 'src/systems/fulu/WordCensor.js', 'src/systems/fulu/ManaScribe.js', 'src/systems/fulu/TalismanArray.js', 'src/systems/fulu/ArrayPlacer.js', 'src/systems/fulu/ArrayActivator.js', 'src/systems/fulu/ArrayTester.js', 'src/systems/fulu/ArrayArchivist.js', 'src/systems/fulu/TalismanCatalog.js', 'src/systems/fulu/TalismanSorter.js', 'src/systems/fulu/TalismanLibrarian.js', 'src/systems/fulu/TalismanAuctioneer.js', 'src/systems/fulu/TalismanOrchestrator.js', 'src/systems/powersync/DeltaSyncCore.js', 'src/systems/powersync/ChangeLog.js', 'src/systems/powersync/VectorClock.js', 'src/systems/powersync/ConflictResolver.js', 'src/systems/powersync/SyncQueue.js', 'src/systems/powersync/BidirectionalPipeline.js', 'src/systems/powersync/SnapshotManager.js', 'src/systems/powersync/ReplicationLog.js', 'src/systems/powersync/DeviceRegistry.js', 'src/systems/powersync/SyncGateway.js', 'src/systems/powersync/ChannelAdapter.js', 'src/systems/powersync/SyncDispatcher.js', 'src/systems/powersync/EventAggregator.js', 'src/systems/powersync/OfflineBuffer.js', 'src/systems/powersync/ConnectivityMonitor.js', 'src/systems/powersync/HookRegistry.js', 'src/systems/powersync/MiddlewarePipeline.js', 'src/systems/powersync/CronScheduler.js', 'src/systems/powersync/AuditLog.js', 'src/systems/powersync/DeadLetterQueue.js', 'src/systems/powersync/SyncCoordinator.js', 'src/systems/powersync/ConflictAdvisor.js', 'src/systems/powersync/SyncNegotiator.js', 'src/systems/powersync/RoleAwareRouter.js', 'src/systems/powersync/SyncLearner.js', 'src/systems/powersync/ConflictReflector.js', 'src/systems/powersync/EvolverEngine.js', 'src/systems/powersync/SelfHealer.js', 'src/systems/powersync/FederationMaster.js', 'src/systems/powersync/MasteryMetric.js'],
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