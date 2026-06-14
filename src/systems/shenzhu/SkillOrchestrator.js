/**
 * SkillOrchestrator.js - 灵枢编排器
 * V1127 P-20260614-820 FINAL Round 42 Iter 30/30 Direction F 仙道灵枢阁 (ruflo)
 */
import { RootProfiler } from './RootProfiler.js';
import { AwakeningTracker } from './AwakeningTracker.js';
import { InnateAbility } from './InnateAbility.js';
import { SpiritualVein } from './SpiritualVein.js';
import { RealmFoundation } from './RealmFoundation.js';
import { TechniqueRegistry } from './TechniqueRegistry.js';
import { CultivationManual } from './CultivationManual.js';
import { CultivationSimulator } from './CultivationSimulator.js';
import { BreakthroughCatalyst } from './BreakthroughCatalyst.js';
import { TribulationManager } from './TribulationManager.js';
import { SpiritBeastRegistry } from './SpiritBeastRegistry.js';
import { BeastTamer } from './BeastTamer.js';
import { BeastBond } from './BeastBond.js';
import { BeastEvolution } from './BeastEvolution.js';
import { BeastArena } from './BeastArena.js';
import { ArtifactForge } from './ArtifactForge.js';
import { ArtifactRefinery } from './ArtifactRefinery.js';
import { ArtifactEnhancer } from './ArtifactEnhancer.js';
import { ArtifactSorter } from './ArtifactSorter.js';
import { ArtifactVault } from './ArtifactVault.js';
import { FormationRegistry } from './FormationRegistry.js';
import { FormationBuilder } from './FormationBuilder.js';
import { FormationMaster } from './FormationMaster.js';
import { FormationTrapper } from './FormationTrapper.js';
import { FormationBreaker } from './FormationBreaker.js';
import { SkillArchive } from './SkillArchive.js';
import { CultivationDiary } from './CultivationDiary.js';
import { HeavenEarthLedger } from './HeavenEarthLedger.js';
import { DestinyTracker } from './DestinyTracker.js';

export const SKILL_MODES = ['idle', 'awakening', 'cultivating', 'taming', 'forging', 'forming', 'transcending'];

export class SkillOrchestrator {
    constructor(config = {}) {
        this.engines = {
            rootProfiler: new RootProfiler(),
            awakeningTracker: new AwakeningTracker(),
            innateAbility: new InnateAbility(),
            spiritualVein: new SpiritualVein(),
            realmFoundation: new RealmFoundation(),
            techniqueRegistry: new TechniqueRegistry(),
            cultivationManual: new CultivationManual(),
            cultivationSimulator: new CultivationSimulator(),
            breakthroughCatalyst: new BreakthroughCatalyst(),
            tribulationManager: new TribulationManager(),
            spiritBeastRegistry: new SpiritBeastRegistry(),
            beastTamer: new BeastTamer(),
            beastBond: new BeastBond(),
            beastEvolution: new BeastEvolution(),
            beastArena: new BeastArena(),
            artifactForge: new ArtifactForge(),
            artifactRefinery: new ArtifactRefinery(),
            artifactEnhancer: new ArtifactEnhancer(),
            artifactSorter: new ArtifactSorter(),
            artifactVault: new ArtifactVault(),
            formationRegistry: new FormationRegistry(),
            formationBuilder: new FormationBuilder(),
            formationMaster: new FormationMaster(),
            formationTrapper: new FormationTrapper(),
            formationBreaker: new FormationBreaker(),
            skillArchive: new SkillArchive(),
            cultivationDiary: new CultivationDiary(),
            heavenEarthLedger: new HeavenEarthLedger(),
            destinyTracker: new DestinyTracker(),
        };
        this.snapshots = new Map();
        this.stats = { totalOrchestrated: 0 };
    }

    orchestrate(cultivatorId) {
        const d1 = this.engines.rootProfiler.roots.size;
        const d2 = this.engines.techniqueRegistry.techniques.size;
        const d3 = this.engines.spiritBeastRegistry.beasts.size;
        const d4 = this.engines.artifactForge.artifacts.size;
        const d5 = this.engines.formationRegistry.formations.size;
        const d6 = this.engines.skillArchive.entries.size;
        const d7 = this.engines.cultivationDiary.entries.size;
        const d8 = this.engines.destinyTracker.destinies.size;
        const snapshot = { d1, d2, d3, d4, d5, d6, d7, d8 };
        const values = Object.values(snapshot);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
        const activity = Math.min(1, mean / 20);
        const stability = Math.max(0, 1 - stdDev / 50);
        const karma = this.engines.heavenEarthLedger.balanceFor(cultivatorId) > 0 ? 0.8 : 0.5;
        const health = activity * 0.4 + stability * 0.3 + karma * 0.3;
        const state = {
            cultivatorId,
            snapshot,
            activity: Math.min(1, activity),
            stability: Math.min(1, stability),
            karma,
            health: Math.min(1, health),
            ts: Date.now(),
        };
        this.snapshots.set(cultivatorId, state);
        this.stats.totalOrchestrated++;
        return state;
    }

    adapt(state) {
        if (state.health >= 0.8) return 'idle';
        if (state.activity < 0.2) return 'awakening';
        if (state.karma < 0.6) return 'transcending';
        if (state.stability < 0.4) return 'cultivating';
        if (state.snapshot.d3 > state.snapshot.d4) return 'taming';
        if (state.snapshot.d4 > state.snapshot.d5) return 'forging';
        return 'forming';
    }

    orchestrateAndAdapt(cultivatorId) {
        const state = this.orchestrate(cultivatorId);
        return { state, mode: this.adapt(state) };
    }

    listSnapshots() { return [...this.snapshots.values()]; }
    getSnapshot(cultivatorId) { return this.snapshots.get(cultivatorId) || null; }

    resetAll() {
        for (const engine of Object.values(this.engines)) {
            if (typeof engine.reset === 'function') engine.reset();
        }
        this.snapshots.clear();
        this.stats = { totalOrchestrated: 0 };
    }
}
