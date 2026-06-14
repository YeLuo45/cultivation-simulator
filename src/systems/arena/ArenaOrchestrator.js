/**
 * ArenaOrchestrator.js - 演武场编排器
 * V1037 P-20260614-197 FINAL Round 39 Iter 30/30 Direction B 仙道演武场
 *
 * 整合 29 个 engines 提供的 combat/tournament state，输出综合 arena orchestrator state
 */
import { MatchMaker } from './MatchMaker.js';
import { BracketBuilder } from './BracketBuilder.js';
import { OpponentScouter } from './OpponentScouter.js';
import { ArenaSelector } from './ArenaSelector.js';
import { SchedulePlanner } from './SchedulePlanner.js';
import { CombatEngine } from './CombatEngine.js';
import { DamageCalculator } from './DamageCalculator.js';
import { DefenseResolver } from './DefenseResolver.js';
import { StatusEffectManager } from './StatusEffectManager.js';
import { ComboChainTracker } from './ComboChainTracker.js';
import { TechniqueLibrary } from './TechniqueLibrary.js';
import { StanceManager } from './StanceManager.js';
import { FormSequence } from './FormSequence.js';
import { ElementalAffinity } from './ElementalAffinity.js';
import { QiFlowController } from './QiFlowController.js';
import { WeaponForge } from './WeaponForge.js';
import { ArmorSetManager } from './ArmorSetManager.js';
import { AccessorySlotter } from './AccessorySlotter.js';
import { SetBonusCalculator } from './SetBonusCalculator.js';
import { EnhancementSorter } from './EnhancementSorter.js';
import { TournamentDirector } from './TournamentDirector.js';
import { RankingLadder } from './RankingLadder.js';
import { SeasonManager } from './SeasonManager.js';
import { TitleAwarder } from './TitleAwarder.js';
import { RecordBook } from './RecordBook.js';
import { CultivationMilestone } from './CultivationMilestone.js';
import { BreakthroughCatalyst } from './BreakthroughCatalyst.js';
import { MentorMatcher } from './MentorMatcher.js';
import { ProgressDiary } from './ProgressDiary.js';

export const ARENA_MODES = ['idle', 'scouting', 'training', 'active_battle', 'tournament'];

export class ArenaOrchestrator {
    constructor(config = {}) {
        this.engines = {
            matchMaker: new MatchMaker(),
            bracketBuilder: new BracketBuilder(),
            opponentScouter: new OpponentScouter(),
            arenaSelector: new ArenaSelector(),
            schedulePlanner: new SchedulePlanner(),
            combatEngine: new CombatEngine(),
            damageCalculator: new DamageCalculator(),
            defenseResolver: new DefenseResolver(),
            statusEffectManager: new StatusEffectManager(),
            comboChainTracker: new ComboChainTracker(),
            techniqueLibrary: new TechniqueLibrary(),
            stanceManager: new StanceManager(),
            formSequence: new FormSequence(),
            elementalAffinity: new ElementalAffinity(),
            qiFlowController: new QiFlowController(),
            weaponForge: new WeaponForge(),
            armorSetManager: new ArmorSetManager(),
            accessorySlotter: new AccessorySlotter(),
            setBonusCalculator: new SetBonusCalculator(),
            enhancementSorter: new EnhancementSorter(),
            tournamentDirector: new TournamentDirector(),
            rankingLadder: new RankingLadder(),
            seasonManager: new SeasonManager(),
            titleAwarder: new TitleAwarder(),
            recordBook: new RecordBook(),
            cultivationMilestone: new CultivationMilestone(),
            breakthroughCatalyst: new BreakthroughCatalyst(),
            mentorMatcher: new MentorMatcher(),
            progressDiary: new ProgressDiary(),
        };
        this.snapshots = new Map();
        this.stats = { totalOrchestrated: 0 };
    }

    orchestrate(playerId) {
        const d1 = this.engines.matchMaker.players.size;
        const d2 = this.engines.bracketBuilder.brackets.size;
        const d3 = this.engines.combatEngine.fights.size;
        const d4 = this.engines.techniqueLibrary.techniques.size;
        const d5 = this.engines.weaponForge.weapons.size;
        const d6 = this.engines.tournamentDirector.tournaments.size;
        const d7 = this.engines.rankingLadder.entries.size;
        const d8 = this.engines.cultivationMilestone.progress.size;
        const snapshot = { d1, d2, d3, d4, d5, d6, d7, d8 };
        const values = Object.values(snapshot);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
        const readiness = Math.min(1, mean / 20);
        const stability = Math.max(0, 1 - stdDev / 50);
        const skillLevel = this.engines.cultivationMilestone.canBreakthrough(playerId) ? 1.0 : 0.5;
        const health = readiness * 0.4 + stability * 0.3 + skillLevel * 0.3;
        const state = {
            playerId,
            snapshot,
            readiness: Math.min(1, readiness),
            stability: Math.min(1, stability),
            skillLevel,
            health: Math.min(1, health),
            ts: Date.now(),
        };
        this.snapshots.set(playerId, state);
        this.stats.totalOrchestrated++;
        return state;
    }

    adapt(state) {
        if (state.health >= 0.8) return 'idle';
        if (state.readiness < 0.2) return 'scouting';
        if (state.stability < 0.4) return 'tournament';
        if (state.skillLevel < 0.5) return 'training';
        return 'active_battle';
    }

    orchestrateAndAdapt(playerId) {
        const state = this.orchestrate(playerId);
        return { state, mode: this.adapt(state) };
    }
    listSnapshots() { return [...this.snapshots.values()]; }
    getSnapshot(playerId) { return this.snapshots.get(playerId) || null; }

    resetAll() {
        for (const engine of Object.values(this.engines)) {
            if (typeof engine.reset === 'function') engine.reset();
        }
        this.snapshots.clear();
        this.stats = { totalOrchestrated: 0 };
    }
}
