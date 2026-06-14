import { describe, it, expect, beforeEach } from 'vitest';
import { AlchemyOrchestrator, ALCHEMY_MODES } from '../../../systems/alchemy/AlchemyOrchestrator.js';

describe('AlchemyOrchestrator', () => {
    let o;
    beforeEach(() => { o = new AlchemyOrchestrator(); });
    it('initializes with 29 engines', () => { expect(Object.keys(o.engines).length).toBe(29); });
    it('orchestrate returns state', () => { const s = o.orchestrate('a1'); expect(s).not.toBeNull(); });
    it('orchestrate increments stats', () => { o.orchestrate('a1'); expect(o.stats.totalOrchestrated).toBe(1); });
    it('adapt returns valid mode', () => { expect(ALCHEMY_MODES).toContain(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, mastery: 0.5 })); });
    it('adapt idle for high health', () => { expect(o.adapt({ health: 0.9, activity: 0.9, stability: 0.9, mastery: 0.9 })).toBe('idle'); });
    it('adapt harvesting for low activity', () => { expect(o.adapt({ health: 0.3, activity: 0.1, stability: 0.5, mastery: 0.5 })).toBe('harvesting'); });
    it('adapt researching for low mastery', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, mastery: 0.3 })).toBe('researching'); });
    it('adapt crafting for low stability', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.2, mastery: 0.5 })).toBe('crafting'); });
    it('adapt selling for default', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, mastery: 0.8 })).toBe('selling'); });
    it('orchestrateAndAdapt returns both', () => { const r = o.orchestrateAndAdapt('a1'); expect(r.state).toBeDefined(); expect(ALCHEMY_MODES).toContain(r.mode); });
    it('snapshot stored', () => { o.orchestrate('a1'); expect(o.getSnapshot('a1')).not.toBeNull(); });
    it('getSnapshot for unknown returns null', () => { expect(o.getSnapshot('ghost')).toBeNull(); });
    it('listSnapshots', () => { o.orchestrate('a1'); o.orchestrate('a2'); expect(o.listSnapshots().length).toBe(2); });
    it('snapshot has 8 dimensions', () => { expect(Object.keys(o.orchestrate('a1').snapshot).length).toBe(8); });
    it('health is bounded', () => {
        for (let i = 0; i < 30; i++) o.engines.recipeRegistry.addRecipe(`r${i}`, 'healing', []);
        const s = o.orchestrate('a1');
        expect(s.health).toBeLessThanOrEqual(1);
    });
    it('uses all 29 engines', () => {
        o.engines.recipeRegistry.addRecipe('r', 'healing', []);
        o.engines.refiningEngine.start('r', []);
        o.engines.pillStorage.add('Pill', 'heal', 'common');
        o.engines.batchProducer.plan('r', 10);
        const s = o.orchestrate('a1');
        expect(s.snapshot.d1).toBe(1);
    });
    it('resetAll clears all engines', () => {
        o.engines.recipeRegistry.addRecipe('r', 'healing', []);
        o.orchestrate('a1');
        o.resetAll();
        expect(o.engines.recipeRegistry.recipes.size).toBe(0);
    });
    it('exposes ALCHEMY_MODES', () => { expect(ALCHEMY_MODES).toContain('idle'); });
});
