/**
 * TalismanOrchestrator.js - 符箓编排器
 * V1157 FINAL Round 43 Iter 30/30 Direction A 仙道符箓阁 (claude-code) 2nd cycle
 */
import { PaperMill } from './PaperMill.js';
import { InkRefinery } from './InkRefinery.js';
import { BrushSmith } from './BrushSmith.js';
import { SymbolDesigner } from './SymbolDesigner.js';
import { SealTemplate } from './SealTemplate.js';
import { TalismanRegistry } from './TalismanRegistry.js';
import { TalismanDrawer } from './TalismanDrawer.js';
import { TalismanActivator } from './TalismanActivator.js';
import { TalismanCrafter } from './TalismanCrafter.js';
import { TalismanCaster } from './TalismanCaster.js';
import { SealDesigner } from './SealDesigner.js';
import { SealApplier } from './SealApplier.js';
import { SealBreaker } from './SealBreaker.js';
import { SealInspector } from './SealInspector.js';
import { SealVault } from './SealVault.js';
import { SpellBook } from './SpellBook.js';
import { ChantComposer } from './ChantComposer.js';
import { RhymeAnalyzer } from './RhymeAnalyzer.js';
import { WordCensor } from './WordCensor.js';
import { ManaScribe } from './ManaScribe.js';
import { TalismanArray } from './TalismanArray.js';
import { ArrayPlacer } from './ArrayPlacer.js';
import { ArrayActivator } from './ArrayActivator.js';
import { ArrayTester } from './ArrayTester.js';
import { ArrayArchivist } from './ArrayArchivist.js';
import { TalismanCatalog } from './TalismanCatalog.js';
import { TalismanSorter } from './TalismanSorter.js';
import { TalismanLibrarian } from './TalismanLibrarian.js';
import { TalismanAuctioneer } from './TalismanAuctioneer.js';

export const FULU_MODES = ['idle', 'forging', 'drawing', 'casting', 'binding', 'archiving', 'auctioning'];

export class TalismanOrchestrator {
    constructor(config = {}) {
        this.engines = {
            paperMill: new PaperMill(),
            inkRefinery: new InkRefinery(),
            brushSmith: new BrushSmith(),
            symbolDesigner: new SymbolDesigner(),
            sealTemplate: new SealTemplate(),
            talismanRegistry: new TalismanRegistry(),
            talismanDrawer: new TalismanDrawer(),
            talismanActivator: new TalismanActivator(),
            talismanCrafter: new TalismanCrafter(),
            talismanCaster: new TalismanCaster(),
            sealDesigner: new SealDesigner(),
            sealApplier: new SealApplier(),
            sealBreaker: new SealBreaker(),
            sealInspector: new SealInspector(),
            sealVault: new SealVault(),
            spellBook: new SpellBook(),
            chantComposer: new ChantComposer(),
            rhymeAnalyzer: new RhymeAnalyzer(),
            wordCensor: new WordCensor(),
            manaScribe: new ManaScribe(),
            talismanArray: new TalismanArray(),
            arrayPlacer: new ArrayPlacer(),
            arrayActivator: new ArrayActivator(),
            arrayTester: new ArrayTester(),
            arrayArchivist: new ArrayArchivist(),
            talismanCatalog: new TalismanCatalog(),
            talismanSorter: new TalismanSorter(),
            talismanLibrarian: new TalismanLibrarian(),
            talismanAuctioneer: new TalismanAuctioneer(),
        };
        this.snapshots = new Map();
        this.stats = { totalOrchestrated: 0 };
    }

    orchestrate(masterId) {
        const d1 = this.engines.paperMill.papers.size;
        const d2 = this.engines.talismanRegistry.talismans.size;
        const d3 = this.engines.sealDesigner.designs.size;
        const d4 = this.engines.spellBook.spells.size;
        const d5 = this.engines.talismanArray.arrays.size;
        const d6 = this.engines.talismanCatalog.entries.size;
        const d7 = this.engines.talismanLibrarian.librarians.size;
        const d8 = this.engines.talismanAuctioneer.auctions.size;
        const snapshot = { d1, d2, d3, d4, d5, d6, d7, d8 };
        const values = Object.values(snapshot);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
        const activity = Math.min(1, mean / 20);
        const stability = Math.max(0, 1 - stdDev / 50);
        const prosperity = d6 > 0 ? Math.min(1, d6 / 10) : 0.5;
        const health = activity * 0.4 + stability * 0.3 + prosperity * 0.3;
        const state = {
            masterId,
            snapshot,
            activity: Math.min(1, activity),
            stability: Math.min(1, stability),
            prosperity,
            health: Math.min(1, health),
            ts: Date.now(),
        };
        this.snapshots.set(masterId, state);
        this.stats.totalOrchestrated++;
        return state;
    }

    adapt(state) {
        if (state.health >= 0.8) return 'idle';
        if (state.activity < 0.2) return 'forging';
        if (state.stability < 0.4) return 'drawing';
        const snapshot = state.snapshot || {};
        if ((snapshot.d3 || 0) < 5) return 'binding';
        if ((snapshot.d4 || 0) < 3) return 'casting';
        if ((snapshot.d5 || 0) < 2) return 'archiving';
        return 'auctioning';
    }

    orchestrateAndAdapt(masterId) {
        const state = this.orchestrate(masterId);
        return { state, mode: this.adapt(state) };
    }

    listSnapshots() { return [...this.snapshots.values()]; }
    getSnapshot(masterId) { return this.snapshots.get(masterId) || null; }

    resetAll() {
        for (const engine of Object.values(this.engines)) {
            if (typeof engine.reset === 'function') engine.reset();
        }
        this.snapshots.clear();
        this.stats = { totalOrchestrated: 0 };
    }
}
