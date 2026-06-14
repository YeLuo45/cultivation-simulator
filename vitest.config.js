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
      include: ['src/systems/intel/InformantNetwork.js', 'src/systems/intel/RumorCollector.js', 'src/systems/intel/SpyGrid.js', 'src/systems/intel/PatrolRoutePlanner.js', 'src/systems/intel/SignalJammer.js', 'src/systems/intel/PatternRecognizer.js', 'src/systems/intel/ThreatAssessor.js', 'src/systems/intel/NetworkMapper.js', 'src/systems/intel/FactionInfluenceCalculator.js', 'src/systems/intel/ResourceEstimator.js', 'src/systems/intel/CipherEncoder.js', 'src/systems/intel/MessageRelay.js', 'src/systems/intel/SecureChannel.js', 'src/systems/intel/DeadDrop.js', 'src/systems/intel/CourierScheduler.js', 'src/systems/intel/MoleHunter.js', 'src/systems/intel/SurveillanceManager.js', 'src/systems/intel/CounterEspionage.js', 'src/systems/intel/HoneypotManager.js', 'src/systems/intel/Disinformation.js', 'src/systems/intel/OutpostRegistry.js', 'src/systems/intel/AgentRoster.js', 'src/systems/intel/MissionControl.js', 'src/systems/intel/ReconnaissanceSquad.js', 'src/systems/intel/BorderWatcher.js', 'src/systems/intel/IntelligenceBriefing.js', 'src/systems/intel/FieldCommander.js', 'src/systems/intel/IntelArchive.js', 'src/systems/intel/StrategicPlanner.js', 'src/systems/intel/IntelligenceOrchestrator.js'],
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