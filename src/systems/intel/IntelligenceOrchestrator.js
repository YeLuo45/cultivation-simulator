/**
 * IntelligenceOrchestrator.js - 情报编排器
 * V1097 P-20260614-424 FINAL Round 41 Iter 30/30 Direction D 仙道情报司
 */
import { InformantNetwork } from './InformantNetwork.js';
import { RumorCollector } from './RumorCollector.js';
import { SpyGrid } from './SpyGrid.js';
import { PatrolRoutePlanner } from './PatrolRoutePlanner.js';
import { SignalJammer } from './SignalJammer.js';
import { PatternRecognizer } from './PatternRecognizer.js';
import { ThreatAssessor } from './ThreatAssessor.js';
import { NetworkMapper } from './NetworkMapper.js';
import { FactionInfluenceCalculator } from './FactionInfluenceCalculator.js';
import { ResourceEstimator } from './ResourceEstimator.js';
import { CipherEncoder } from './CipherEncoder.js';
import { MessageRelay } from './MessageRelay.js';
import { SecureChannel } from './SecureChannel.js';
import { DeadDrop } from './DeadDrop.js';
import { CourierScheduler } from './CourierScheduler.js';
import { MoleHunter } from './MoleHunter.js';
import { SurveillanceManager } from './SurveillanceManager.js';
import { CounterEspionage } from './CounterEspionage.js';
import { HoneypotManager } from './HoneypotManager.js';
import { Disinformation } from './Disinformation.js';
import { OutpostRegistry } from './OutpostRegistry.js';
import { AgentRoster } from './AgentRoster.js';
import { MissionControl } from './MissionControl.js';
import { ReconnaissanceSquad } from './ReconnaissanceSquad.js';
import { BorderWatcher } from './BorderWatcher.js';
import { IntelligenceBriefing } from './IntelligenceBriefing.js';
import { FieldCommander } from './FieldCommander.js';
import { IntelArchive } from './IntelArchive.js';
import { StrategicPlanner } from './StrategicPlanner.js';

export const INTEL_MODES = ['idle', 'gathering', 'analyzing', 'acting', 'recovering'];

export class IntelligenceOrchestrator {
    constructor(config = {}) {
        this.engines = {
            informantNetwork: new InformantNetwork(),
            rumorCollector: new RumorCollector(),
            spyGrid: new SpyGrid(),
            patrolRoutePlanner: new PatrolRoutePlanner(),
            signalJammer: new SignalJammer(),
            patternRecognizer: new PatternRecognizer(),
            threatAssessor: new ThreatAssessor(),
            networkMapper: new NetworkMapper(),
            factionInfluenceCalculator: new FactionInfluenceCalculator(),
            resourceEstimator: new ResourceEstimator(),
            cipherEncoder: new CipherEncoder(),
            messageRelay: new MessageRelay(),
            secureChannel: new SecureChannel(),
            deadDrop: new DeadDrop(),
            courierScheduler: new CourierScheduler(),
            moleHunter: new MoleHunter(),
            surveillanceManager: new SurveillanceManager(),
            counterEspionage: new CounterEspionage(),
            honeypotManager: new HoneypotManager(),
            disinformation: new Disinformation(),
            outpostRegistry: new OutpostRegistry(),
            agentRoster: new AgentRoster(),
            missionControl: new MissionControl(),
            reconnaissanceSquad: new ReconnaissanceSquad(),
            borderWatcher: new BorderWatcher(),
            intelligenceBriefing: new IntelligenceBriefing(),
            fieldCommander: new FieldCommander(),
            intelArchive: new IntelArchive(),
            strategicPlanner: new StrategicPlanner(),
        };
        this.snapshots = new Map();
        this.stats = { totalOrchestrated: 0 };
    }

    orchestrate(directorId) {
        const d1 = this.engines.informantNetwork.informants.size;
        const d2 = this.engines.threatAssessor.assessments.size;
        const d3 = this.engines.networkMapper.nodes.size;
        const d4 = this.engines.messageRelay.messages.size;
        const d5 = this.engines.moleHunter.suspects.size;
        const d6 = this.engines.outpostRegistry.outposts.size;
        const d7 = this.engines.missionControl.missions.size;
        const d8 = this.engines.intelArchive.entries.size;
        const snapshot = { d1, d2, d3, d4, d5, d6, d7, d8 };
        const values = Object.values(snapshot);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
        const activity = Math.min(1, mean / 20);
        const stability = Math.max(0, 1 - stdDev / 50);
        const trust = this.engines.moleHunter.stats.confirmed === 0 ? 0.8 : 0.5;
        const health = activity * 0.4 + stability * 0.3 + trust * 0.3;
        const state = {
            directorId,
            snapshot,
            activity: Math.min(1, activity),
            stability: Math.min(1, stability),
            trust,
            health: Math.min(1, health),
            ts: Date.now(),
        };
        this.snapshots.set(directorId, state);
        this.stats.totalOrchestrated++;
        return state;
    }

    adapt(state) {
        if (state.health >= 0.8) return 'idle';
        if (state.activity < 0.2) return 'gathering';
        if (state.trust < 0.6) return 'recovering';
        if (state.stability < 0.4) return 'analyzing';
        return 'acting';
    }

    orchestrateAndAdapt(directorId) {
        const state = this.orchestrate(directorId);
        return { state, mode: this.adapt(state) };
    }

    listSnapshots() { return [...this.snapshots.values()]; }
    getSnapshot(directorId) { return this.snapshots.get(directorId) || null; }

    resetAll() {
        for (const engine of Object.values(this.engines)) {
            if (typeof engine.reset === 'function') engine.reset();
        }
        this.snapshots.clear();
        this.stats = { totalOrchestrated: 0 };
    }
}
