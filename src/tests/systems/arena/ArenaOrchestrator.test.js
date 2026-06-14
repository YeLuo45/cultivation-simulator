import { describe, it, expect, beforeEach } from 'vitest';
import { ArenaOrchestrator, ARENA_MODES } from '../../../systems/arena/ArenaOrchestrator.js';

describe('ArenaOrchestrator', () => {
    let o;
    beforeEach(() => { o = new ArenaOrchestrator(); });
    it('initializes with 29 engines', () => { expect(Object.keys(o.engines).length).toBe(29); });
    it('orchestrate returns state', () => { const s = o.orchestrate('p1'); expect(s).not.toBeNull(); });
    it('orchestrate increments stats', () => { o.orchestrate('p1'); expect(o.stats.totalOrchestrated).toBe(1); });
    it('adapt returns valid mode', () => { expect(ARENA_MODES).toContain(o.adapt({ health: 0.5, readiness: 0.5, stability: 0.5, skillLevel: 0.5 })); });
    it('adapt idle for high health', () => { expect(o.adapt({ health: 0.9, readiness: 0.9, stability: 0.9, skillLevel: 0.9 })).toBe('idle'); });
    it('adapt scouting for low readiness', () => { expect(o.adapt({ health: 0.3, readiness: 0.1, stability: 0.5, skillLevel: 0.5 })).toBe('scouting'); });
    it('adapt training for low skill', () => { expect(o.adapt({ health: 0.5, readiness: 0.5, stability: 0.5, skillLevel: 0.3 })).toBe('training'); });
    it('adapt tournament for low stability', () => { expect(o.adapt({ health: 0.5, readiness: 0.5, stability: 0.2, skillLevel: 0.5 })).toBe('tournament'); });
    it('adapt active_battle for default', () => { expect(o.adapt({ health: 0.5, readiness: 0.5, stability: 0.5, skillLevel: 0.8 })).toBe('active_battle'); });
    it('orchestrateAndAdapt returns both', () => { const r = o.orchestrateAndAdapt('p1'); expect(r.state).toBeDefined(); expect(ARENA_MODES).toContain(r.mode); });
    it('snapshot stored', () => { o.orchestrate('p1'); expect(o.getSnapshot('p1')).not.toBeNull(); });
    it('getSnapshot for unknown returns null', () => { expect(o.getSnapshot('ghost')).toBeNull(); });
    it('listSnapshots', () => { o.orchestrate('p1'); o.orchestrate('p2'); expect(o.listSnapshots().length).toBe(2); });
    it('snapshot has 8 dimensions', () => { expect(Object.keys(o.orchestrate('p1').snapshot).length).toBe(8); });
    it('health is bounded', () => {
        for (let i = 0; i < 30; i++) o.engines.matchMaker.registerPlayer(`p${i}`, 1500);
        const s = o.orchestrate('p1');
        expect(s.health).toBeLessThanOrEqual(1);
    });
    it('uses all 29 engines', () => {
        o.engines.matchMaker.registerPlayer('a', 1500);
        o.engines.combatEngine.startFight('a', 'b');
        o.engines.tournamentDirector.create('T', 'single_elim');
        const s = o.orchestrate('p1');
        expect(s.snapshot.d1).toBe(1);
    });
    it('resetAll clears all engines', () => {
        o.engines.matchMaker.registerPlayer('a', 1500);
        o.orchestrate('p1');
        o.resetAll();
        expect(o.engines.matchMaker.players.size).toBe(0);
    });
    it('exposes ARENA_MODES', () => { expect(ARENA_MODES).toContain('idle'); });
});
