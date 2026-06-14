import { describe, it, expect, beforeEach } from 'vitest';
import { IntelligenceOrchestrator, INTEL_MODES } from '../../../systems/intel/IntelligenceOrchestrator.js';

describe('IntelligenceOrchestrator', () => {
    let o;
    beforeEach(() => { o = new IntelligenceOrchestrator(); });
    it('initializes with 29 engines', () => { expect(Object.keys(o.engines).length).toBe(29); });
    it('orchestrate returns state', () => { const s = o.orchestrate('d1'); expect(s).not.toBeNull(); });
    it('orchestrate increments stats', () => { o.orchestrate('d1'); expect(o.stats.totalOrchestrated).toBe(1); });
    it('adapt returns valid mode', () => { expect(INTEL_MODES).toContain(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, trust: 0.5 })); });
    it('adapt idle for high health', () => { expect(o.adapt({ health: 0.9, activity: 0.9, stability: 0.9, trust: 0.9 })).toBe('idle'); });
    it('adapt gathering for low activity', () => { expect(o.adapt({ health: 0.3, activity: 0.1, stability: 0.5, trust: 0.5 })).toBe('gathering'); });
    it('adapt recovering for low trust', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, trust: 0.3 })).toBe('recovering'); });
    it('adapt analyzing for low stability', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.2, trust: 0.7 })).toBe('analyzing'); });
    it('adapt acting for default', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, trust: 0.8 })).toBe('acting'); });
    it('orchestrateAndAdapt returns both', () => { const r = o.orchestrateAndAdapt('d1'); expect(r.state).toBeDefined(); expect(INTEL_MODES).toContain(r.mode); });
    it('snapshot stored', () => { o.orchestrate('d1'); expect(o.getSnapshot('d1')).not.toBeNull(); });
    it('getSnapshot for unknown returns null', () => { expect(o.getSnapshot('ghost')).toBeNull(); });
    it('listSnapshots', () => { o.orchestrate('d1'); o.orchestrate('d2'); expect(o.listSnapshots().length).toBe(2); });
    it('snapshot has 8 dimensions', () => { expect(Object.keys(o.orchestrate('d1').snapshot).length).toBe(8); });
    it('health is bounded', () => {
        for (let i = 0; i < 30; i++) o.engines.informantNetwork.recruit(`i${i}`, 'Beijing');
        const s = o.orchestrate('d1');
        expect(s.health).toBeLessThanOrEqual(1);
    });
    it('uses all 29 engines', () => {
        o.engines.informantNetwork.recruit('a', 'Beijing');
        o.engines.threatAssessor.assess('military', 50);
        o.engines.missionControl.create('m1', 'recon');
        const s = o.orchestrate('d1');
        expect(s.snapshot.d1).toBe(1);
    });
    it('resetAll clears all engines', () => {
        o.engines.informantNetwork.recruit('a', 'Beijing');
        o.orchestrate('d1');
        o.resetAll();
        expect(o.engines.informantNetwork.informants.size).toBe(0);
    });
    it('exposes INTEL_MODES', () => { expect(INTEL_MODES).toContain('idle'); });
});
