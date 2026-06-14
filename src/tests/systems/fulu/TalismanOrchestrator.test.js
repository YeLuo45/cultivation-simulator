import { describe, it, expect, beforeEach } from 'vitest';
import { TalismanOrchestrator, FULU_MODES } from '../../../systems/fulu/TalismanOrchestrator.js';

describe('TalismanOrchestrator', () => {
    let o;
    beforeEach(() => { o = new TalismanOrchestrator(); });
    it('initializes with 29 engines', () => { expect(Object.keys(o.engines).length).toBe(29); });
    it('orchestrate returns state', () => { const s = o.orchestrate('m1'); expect(s).not.toBeNull(); });
    it('orchestrate increments stats', () => { o.orchestrate('m1'); expect(o.stats.totalOrchestrated).toBe(1); });
    it('adapt returns valid mode', () => { expect(FULU_MODES).toContain(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, prosperity: 0.5 })); });
    it('adapt idle for high health', () => { expect(o.adapt({ health: 0.9, activity: 0.9, stability: 0.9, prosperity: 0.9 })).toBe('idle'); });
    it('adapt forging for low activity', () => { expect(o.adapt({ health: 0.3, activity: 0.1, stability: 0.5, prosperity: 0.5 })).toBe('forging'); });
    it('adapt binding for low seals', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, prosperity: 0.7, snapshot: { d3: 1 } })).toBe('binding'); });
    it('adapt drawing for low stability', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.2, prosperity: 0.7 })).toBe('drawing'); });
    it('orchestrateAndAdapt returns both', () => { const r = o.orchestrateAndAdapt('m1'); expect(r.state).toBeDefined(); expect(FULU_MODES).toContain(r.mode); });
    it('snapshot stored', () => { o.orchestrate('m1'); expect(o.getSnapshot('m1')).not.toBeNull(); });
    it('getSnapshot for unknown returns null', () => { expect(o.getSnapshot('ghost')).toBeNull(); });
    it('listSnapshots', () => { o.orchestrate('m1'); o.orchestrate('m2'); expect(o.listSnapshots().length).toBe(2); });
    it('snapshot has 8 dimensions', () => { expect(Object.keys(o.orchestrate('m1').snapshot).length).toBe(8); });
    it('health is bounded', () => {
        for (let i = 0; i < 30; i++) o.engines.paperMill.produce(`p${i}`, 30, 30);
        const s = o.orchestrate('m1');
        expect(s.health).toBeLessThanOrEqual(1);
    });
    it('uses all 29 engines', () => {
        o.engines.paperMill.produce('a', 30, 30);
        o.engines.talismanRegistry.register('A', 'attack');
        o.engines.spellBook.addSpell('S', 'fire');
        const s = o.orchestrate('m1');
        expect(s.snapshot.d1).toBe(1);
        expect(s.snapshot.d2).toBe(1);
    });
    it('resetAll clears all engines', () => {
        o.engines.paperMill.produce('a', 30, 30);
        o.orchestrate('m1');
        o.resetAll();
        expect(o.engines.paperMill.papers.size).toBe(0);
    });
    it('exposes FULU_MODES', () => { expect(FULU_MODES).toContain('idle'); });
});
