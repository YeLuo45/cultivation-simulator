/**
 * AlchemyOrchestrator.js - 炼药编排器
 * V1067 P-20260614-257 FINAL Round 40 Iter 30/30 Direction C 仙道炼药坊
 *
 * 整合 29 个 engines 提供的 alchemy state
 */
import { RecipeRegistry } from './RecipeRegistry.js';
import { IngredientCatalog } from './IngredientCatalog.js';
import { ReagentScanner } from './ReagentScanner.js';
import { FurnaceManager } from './FurnaceManager.js';
import { CrucibleForge } from './CrucibleForge.js';
import { RefiningEngine } from './RefiningEngine.js';
import { HeatController } from './HeatController.js';
import { DistillationApparatus } from './DistillationApparatus.js';
import { EssenceExtractor } from './EssenceExtractor.js';
import { FluxBalancer } from './FluxBalancer.js';
import { EfficacyMapper } from './EfficacyMapper.js';
import { ToxicityAnalyzer } from './ToxicityAnalyzer.js';
import { SynergyDetector } from './SynergyDetector.js';
import { AntidoteMixer } from './AntidoteMixer.js';
import { MeridianActivator } from './MeridianActivator.js';
import { PillStorage } from './PillStorage.js';
import { QualityGrader } from './QualityGrader.js';
import { ExpirationTracker } from './ExpirationTracker.js';
import { PillPrescription } from './PillPrescription.js';
import { BatchProducer } from './BatchProducer.js';
import { PillSchool } from './PillSchool.js';
import { MasteryTracker } from './MasteryTracker.js';
import { SecretRecipeVault } from './SecretRecipeVault.js';
import { ApprenticeMatcher } from './ApprenticeMatcher.js';
import { HerbGarden } from './HerbGarden.js';
import { PotionPotency } from './PotionPotency.js';
import { PillAuctioneer } from './PillAuctioneer.js';
import { CraftingLedger } from './CraftingLedger.js';
import { PillMarketplace } from './PillMarketplace.js';

export const ALCHEMY_MODES = ['idle', 'harvesting', 'refining', 'crafting', 'selling', 'researching'];

export class AlchemyOrchestrator {
    constructor(config = {}) {
        this.engines = {
            recipeRegistry: new RecipeRegistry(),
            ingredientCatalog: new IngredientCatalog(),
            reagentScanner: new ReagentScanner(),
            furnaceManager: new FurnaceManager(),
            crucibleForge: new CrucibleForge(),
            refiningEngine: new RefiningEngine(),
            heatController: new HeatController(),
            distillationApparatus: new DistillationApparatus(),
            essenceExtractor: new EssenceExtractor(),
            fluxBalancer: new FluxBalancer(),
            efficacyMapper: new EfficacyMapper(),
            toxicityAnalyzer: new ToxicityAnalyzer(),
            synergyDetector: new SynergyDetector(),
            antidoteMixer: new AntidoteMixer(),
            meridianActivator: new MeridianActivator(),
            pillStorage: new PillStorage(),
            qualityGrader: new QualityGrader(),
            expirationTracker: new ExpirationTracker(),
            pillPrescription: new PillPrescription(),
            batchProducer: new BatchProducer(),
            pillSchool: new PillSchool(),
            masteryTracker: new MasteryTracker(),
            secretRecipeVault: new SecretRecipeVault(),
            apprenticeMatcher: new ApprenticeMatcher(),
            herbGarden: new HerbGarden(),
            potionPotency: new PotionPotency(),
            pillAuctioneer: new PillAuctioneer(),
            craftingLedger: new CraftingLedger(),
            pillMarketplace: new PillMarketplace(),
        };
        this.snapshots = new Map();
        this.stats = { totalOrchestrated: 0 };
    }

    orchestrate(alchemistId) {
        const d1 = this.engines.recipeRegistry.recipes.size;
        const d2 = this.engines.ingredientCatalog.ingredients.size;
        const d3 = this.engines.furnaceManager.furnaces.size;
        const d4 = this.engines.refiningEngine.refines.size;
        const d5 = this.engines.synergyDetector.detections.size;
        const d6 = this.engines.pillStorage.storage.size;
        const d7 = this.engines.batchProducer.batches.size;
        const d8 = this.engines.herbGarden.plots.size;
        const snapshot = { d1, d2, d3, d4, d5, d6, d7, d8 };
        const values = Object.values(snapshot);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
        const activity = Math.min(1, mean / 20);
        const stability = Math.max(0, 1 - stdDev / 50);
        const mastery = this.engines.masteryTracker.isMaster(alchemistId) ? 1.0 : 0.5;
        const health = activity * 0.4 + stability * 0.3 + mastery * 0.3;
        const state = {
            alchemistId,
            snapshot,
            activity: Math.min(1, activity),
            stability: Math.min(1, stability),
            mastery,
            health: Math.min(1, health),
            ts: Date.now(),
        };
        this.snapshots.set(alchemistId, state);
        this.stats.totalOrchestrated++;
        return state;
    }

    adapt(state) {
        if (state.health >= 0.8) return 'idle';
        if (state.activity < 0.2) return 'harvesting';
        if (state.mastery < 0.5) return 'researching';
        if (state.stability < 0.4) return 'crafting';
        return 'selling';
    }

    orchestrateAndAdapt(alchemistId) {
        const state = this.orchestrate(alchemistId);
        return { state, mode: this.adapt(state) };
    }

    listSnapshots() { return [...this.snapshots.values()]; }
    getSnapshot(alchemistId) { return this.snapshots.get(alchemistId) || null; }

    resetAll() {
        for (const engine of Object.values(this.engines)) {
            if (typeof engine.reset === 'function') engine.reset();
        }
        this.snapshots.clear();
        this.stats = { totalOrchestrated: 0 };
    }
}
