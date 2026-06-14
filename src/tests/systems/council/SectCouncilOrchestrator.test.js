import { describe, it, expect, beforeEach } from 'vitest';
import { SectCouncilOrchestrator, COUNCIL_MODES } from '../../../systems/council/SectCouncilOrchestrator.js';

describe('SectCouncilOrchestrator', () => {
    let o;
    beforeEach(() => { o = new SectCouncilOrchestrator(); });
    it('initializes with 29 engines', () => { expect(Object.keys(o.engines).length).toBe(29); });
    it('orchestrate returns state', () => {
        o.engines.sectProposalCollector.submit('m1', 't');
        o.engines.sectMemberRegistry.register('m1', 'A', 'master');
        const s = o.orchestrate('sect1');
        expect(s).not.toBeNull();
    });
    it('orchestrate increments stats', () => {
        o.orchestrate('sect1');
        expect(o.stats.totalOrchestrated).toBe(1);
    });
    it('adapt returns valid mode', () => { expect(COUNCIL_MODES).toContain(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, legitimacy: 0.5 })); });
    it('adapt idle for high health', () => { expect(o.adapt({ health: 0.9, activity: 0.9, stability: 0.9, legitimacy: 0.9 })).toBe('idle'); });
    it('adapt bootstrap for low activity', () => { expect(o.adapt({ health: 0.3, activity: 0.1, stability: 0.5, legitimacy: 0.5 })).toBe('bootstrap'); });
    it('adapt deliberating for low stability', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.2, legitimacy: 0.5 })).toBe('deliberating'); });
    it('adapt executing for low legitimacy', () => {
        o.engines.powerBalanceMonitor.updateRole('master', 1000, 1);
        expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, legitimacy: 0.5 })).toBe('executing');
    });
    it('adapt voting for default', () => { expect(o.adapt({ health: 0.5, activity: 0.5, stability: 0.5, legitimacy: 1.0 })).toBe('voting'); });
    it('orchestrateAndAdapt returns both', () => {
        const r = o.orchestrateAndAdapt('sect1');
        expect(r.state).toBeDefined();
        expect(COUNCIL_MODES).toContain(r.mode);
    });
    it('snapshot stored', () => { o.orchestrate('sect1'); expect(o.getSnapshot('sect1')).not.toBeNull(); });
    it('getSnapshot for unknown returns null', () => { expect(o.getSnapshot('ghost')).toBeNull(); });
    it('listSnapshots', () => { o.orchestrate('sect1'); o.orchestrate('sect2'); expect(o.listSnapshots().length).toBe(2); });
    it('snapshot has 8 dimensions', () => { expect(Object.keys(o.orchestrate('sect1').snapshot).length).toBe(8); });
    it('health is bounded', () => {
        for (let i = 0; i < 50; i++) o.engines.sectProposalCollector.submit('m1', `t${i}`);
        const s = o.orchestrate('sect1');
        expect(s.health).toBeLessThanOrEqual(1);
    });
    it('resetAll clears all engines', () => {
        o.engines.sectProposalCollector.submit('m1', 't');
        o.orchestrate('sect1');
        o.resetAll();
        expect(o.engines.sectProposalCollector.proposals.size).toBe(0);
    });
    it('uses all 29 engines', () => {
        o.engines.sectProposalCollector.submit('m1', 't');
        o.engines.ballotBox.open('p1');
        o.engines.conflictResolver.open('dispute', ['s1', 's2']);
        const s = o.orchestrate('sect1');
        expect(s.snapshot.dim1).toBe(1);
    });
    it('exposes COUNCIL_MODES', () => { expect(COUNCIL_MODES).toContain('idle'); });
});
