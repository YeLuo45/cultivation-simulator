import { describe, it, expect, beforeEach } from 'vitest';
import { SkillOrchestrator, SKILL_MODES } from '../../../systems/shenzhu/SkillOrchestrator.js';

describe('SkillOrchestrator', () => {
    let o;
    beforeEach(() => { o = new SkillOrchestrator(); });
    it('initializes with 29 engines', () => { expect(Object.keys(o.engines).length).toBe(29); });
    it('orchestrate returns state', () => { const s = o.orchestrate('c1'); expect(s).not.toBeNull(); });
    it('orchestrate increments stats', () => { o.orchestrate('c1'); expect(o.stats.totalOrchestrated).toBe(1); });
    it('adapt returns valid mode', () => { expect(SKILL_MODES).toContain(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, karma: 0.5 })); });
    it('adapt idle for high health', () => { expect(o.adapt({ health: 0.9, activity: 0.9, stability: 0.9, karma: 0.9 })).toBe('idle'); });
    it('adapt awakening for low activity', () => { expect(o.adapt({ health: 0.3, activity: 0.1, stability: 0.5, karma: 0.5 })).toBe('awakening'); });
    it('adapt transcending for low karma', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, karma: 0.3 })).toBe('transcending'); });
    it('adapt cultivating for low stability', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.2, karma: 0.7 })).toBe('cultivating'); });
    it('adapt taming for default with more beasts', () => {
        o.engines.spiritBeastRegistry.register('b1', 'dragon');
        o.engines.artifactForge.forge('a1', 'sword');
        expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, karma: 0.8, snapshot: { d3: 1, d4: 0 } })).toBe('taming');
    });
    it('orchestrateAndAdapt returns both', () => { const r = o.orchestrateAndAdapt('c1'); expect(r.state).toBeDefined(); expect(SKILL_MODES).toContain(r.mode); });
    it('snapshot stored', () => { o.orchestrate('c1'); expect(o.getSnapshot('c1')).not.toBeNull(); });
    it('getSnapshot for unknown returns null', () => { expect(o.getSnapshot('ghost')).toBeNull(); });
    it('listSnapshots', () => { o.orchestrate('c1'); o.orchestrate('c2'); expect(o.listSnapshots().length).toBe(2); });
    it('snapshot has 8 dimensions', () => { expect(Object.keys(o.orchestrate('c1').snapshot).length).toBe(8); });
    it('health is bounded', () => {
        for (let i = 0; i < 30; i++) o.engines.rootProfiler.profile(`c${i}`, 'fire');
        const s = o.orchestrate('c1');
        expect(s.health).toBeLessThanOrEqual(1);
    });
    it('uses all 29 engines', () => {
        o.engines.rootProfiler.profile('a', 'fire');
        o.engines.techniqueRegistry.register('A', 'fire');
        o.engines.spiritBeastRegistry.register('B', 'dragon');
        const s = o.orchestrate('c1');
        expect(s.snapshot.d1).toBe(1);
    });
    it('resetAll clears all engines', () => {
        o.engines.rootProfiler.profile('a', 'fire');
        o.orchestrate('c1');
        o.resetAll();
        expect(o.engines.rootProfiler.roots.size).toBe(0);
    });
    it('exposes SKILL_MODES', () => { expect(SKILL_MODES).toContain('idle'); });
});
