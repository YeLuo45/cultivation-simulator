/**
 * SectCouncilOrchestrator.js - 议会编排器
 * V1007 P-20260614-167 FINAL Round 38 Iter 30/30 Direction A 仙道议事厅
 *
 * 整合 29 个 engines 提供的 sect politics state，输出综合 council orchestrator state
 */
import { SectProposalCollector } from './SectProposalCollector.js';
import { SectMemberRegistry } from './SectMemberRegistry.js';
import { VotingPowerCalculator } from './VotingPowerCalculator.js';
import { SectRoleHierarchy } from './SectRoleHierarchy.js';
import { SectTermTracker } from './SectTermTracker.js';
import { BallotBox } from './BallotBox.js';
import { VoteWeightingEngine } from './VoteWeightingEngine.js';
import { QuorumCalculator } from './QuorumCalculator.js';
import { VotingResultAggregator } from './VotingResultAggregator.js';
import { VoteValidator } from './VoteValidator.js';
import { ProposalStateMachine } from './ProposalStateMachine.js';
import { CouncilSession } from './CouncilSession.js';
import { ResolutionExecutor } from './ResolutionExecutor.js';
import { DecreesAnnouncer } from './DecreesAnnouncer.js';
import { DecisionLogger } from './DecisionLogger.js';
import { PowerBalanceMonitor } from './PowerBalanceMonitor.js';
import { ReputationEngine } from './ReputationEngine.js';
import { ContributionTracker } from './ContributionTracker.js';
import { FactionDynamics } from './FactionDynamics.js';
import { SeniorityRanker } from './SeniorityRanker.js';
import { DiplomacyMesh } from './DiplomacyMesh.js';
import { TreatyEngine } from './TreatyEngine.js';
import { AllianceFormation } from './AllianceFormation.js';
import { ConflictResolver } from './ConflictResolver.js';
import { CulturalExchange } from './CulturalExchange.js';
import { PoliticalTrendPredictor } from './PoliticalTrendPredictor.js';
import { PolicyLearner } from './PolicyLearner.js';
import { SectConstitutionEngine } from './SectConstitutionEngine.js';
import { SectHistoryArchive } from './SectHistoryArchive.js';

export const COUNCIL_MODES = ['bootstrap', 'deliberating', 'voting', 'executing', 'idle'];

export class SectCouncilOrchestrator {
    constructor(config = {}) {
        this.engines = {
            sectProposalCollector: new SectProposalCollector(),
            sectMemberRegistry: new SectMemberRegistry(),
            votingPowerCalculator: new VotingPowerCalculator(),
            sectRoleHierarchy: new SectRoleHierarchy(),
            sectTermTracker: new SectTermTracker(),
            ballotBox: new BallotBox(),
            voteWeightingEngine: new VoteWeightingEngine(),
            quorumCalculator: new QuorumCalculator(),
            votingResultAggregator: new VotingResultAggregator(),
            voteValidator: new VoteValidator(),
            proposalStateMachine: new ProposalStateMachine(),
            councilSession: new CouncilSession(),
            resolutionExecutor: new ResolutionExecutor(),
            decreesAnnouncer: new DecreesAnnouncer(),
            decisionLogger: new DecisionLogger(),
            powerBalanceMonitor: new PowerBalanceMonitor(),
            reputationEngine: new ReputationEngine(),
            contributionTracker: new ContributionTracker(),
            factionDynamics: new FactionDynamics(),
            seniorityRanker: new SeniorityRanker(),
            diplomacyMesh: new DiplomacyMesh(),
            treatyEngine: new TreatyEngine(),
            allianceFormation: new AllianceFormation(),
            conflictResolver: new ConflictResolver(),
            culturalExchange: new CulturalExchange(),
            politicalTrendPredictor: new PoliticalTrendPredictor(),
            policyLearner: new PolicyLearner(),
            sectConstitutionEngine: new SectConstitutionEngine(),
            sectHistoryArchive: new SectHistoryArchive(),
        };
        this.snapshots = new Map();
        this.stats = { totalOrchestrated: 0 };
    }

    orchestrate(sectId) {
        const dim1 = this.engines.sectProposalCollector.proposals.size;
        const dim2 = this.engines.sectMemberRegistry.members.size;
        const dim3 = this.engines.ballotBox.ballots.size;
        const dim4 = this.engines.proposalStateMachine.state.size;
        const dim5 = this.engines.councilSession.sessions.size;
        const dim6 = this.engines.resolutionExecutor.executions.size;
        const dim7 = this.engines.treatyEngine.treaties.size;
        const dim8 = this.engines.conflictResolver.conflicts.size;
        const snapshot = { dim1, dim2, dim3, dim4, dim5, dim6, dim7, dim8 };
        const values = Object.values(snapshot);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
        const activity = Math.min(1, mean / 20);
        const stability = Math.max(0, 1 - stdDev / 50);
        const legitimacy = this.engines.powerBalanceMonitor.isBalanced() ? 1.0 : 0.5;
        const health = activity * 0.4 + stability * 0.3 + legitimacy * 0.3;
        const state = {
            sectId,
            snapshot,
            activity: Math.min(1, activity),
            stability: Math.min(1, stability),
            legitimacy,
            health: Math.min(1, health),
            ts: Date.now(),
        };
        this.snapshots.set(sectId, state);
        this.stats.totalOrchestrated++;
        return state;
    }

    adapt(state) {
        if (state.health >= 0.8) return 'idle';
        if (state.activity < 0.2) return 'bootstrap';
        if (state.stability < 0.4) return 'deliberating';
        if (state.legitimacy < 0.6) return 'executing';
        return 'voting';
    }

    orchestrateAndAdapt(sectId) {
        const state = this.orchestrate(sectId);
        return { state, mode: this.adapt(state) };
    }

    listSnapshots() { return [...this.snapshots.values()]; }
    getSnapshot(sectId) { return this.snapshots.get(sectId) || null; }

    resetAll() {
        for (const engine of Object.values(this.engines)) {
            if (typeof engine.reset === 'function') engine.reset();
        }
        this.snapshots.clear();
        this.stats = { totalOrchestrated: 0 };
    }
}
