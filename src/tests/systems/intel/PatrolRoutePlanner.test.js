import { describe, it, expect, beforeEach } from 'vitest';
import { PatrolRoutePlanner, ROUTE_PRIORITY } from '../../../systems/intel/PatrolRoutePlanner.js';

describe('PatrolRoutePlanner', () => {
    let p;
    beforeEach(() => { p = new PatrolRoutePlanner(); });
    it('initializes with defaults', () => { expect(p.stats.total).toBe(0); });
    it('create', () => { expect(p.create('Route 1', ['A', 'B'])).not.toBeNull(); });
    it('create rejects missing', () => { expect(p.create('', ['A'])).toBeNull(); });
    it('create rejects non-array', () => { expect(p.create('A', 'not array')).not.toBeNull(); });
    it('create normalizes invalid priority', () => { const x = p.create('R', ['A'], 'invalid'); expect(x.priority).toBe('normal'); });
    it('get returns null for unknown', () => { expect(p.get('ghost')).toBeNull(); });
    it('listAll and listByStatus and listByPriority and listActive', () => {
        p.create('R1', ['A']);
        p.create('R2', ['A', 'B'], 'high');
        expect(p.listAll().length).toBe(2);
        expect(p.listByStatus('planned').length).toBe(2);
        expect(p.listByPriority('high').length).toBe(1);
    });
    it('setStatus', () => { const x = p.create('R'); expect(p.setStatus(x.id, 'active')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = p.create('R'); expect(p.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(p.setStatus('ghost', 'active')).toBe(false); });
    it('activate and pause and complete and fail', () => { const x = p.create('R'); p.activate(x.id); p.pause(x.id); p.complete(x.id); expect(p.complete(x.id)).toBe(false); p.fail(x.id); expect(p.get(x.id).status).toBe('failed'); });
    it('setPriority', () => { const x = p.create('R'); expect(p.setPriority(x.id, 'critical')).toBe(true); });
    it('setPriority rejects invalid', () => { const x = p.create('R'); expect(p.setPriority(x.id, 'invalid')).toBe(false); });
    it('setPriority returns false for unknown', () => { expect(p.setPriority('ghost', 'high')).toBe(false); });
    it('addWaypoint', () => { const x = p.create('R', ['A']); expect(p.addWaypoint(x.id, 'B')).toBe(true); });
    it('addWaypoint returns false for unknown', () => { expect(p.addWaypoint('ghost', 'A')).toBe(false); });
    it('removeWaypoint', () => { const x = p.create('R', ['A', 'B']); expect(p.removeWaypoint(x.id, 0)).toBe(true); });
    it('removeWaypoint rejects invalid index', () => { const x = p.create('R', ['A']); expect(p.removeWaypoint(x.id, 99)).toBe(false); });
    it('removeWaypoint returns false for unknown', () => { expect(p.removeWaypoint('ghost', 0)).toBe(false); });
    it('waypointCount and distanceOf', () => { const x = p.create('R', ['A', 'B', 'C']); expect(p.waypointCount(x.id)).toBe(3); expect(p.distanceOf(x.id)).toBe(30); });
    it('isActive', () => { const x = p.create('R'); p.activate(x.id); expect(p.isActive(x.id)).toBe(true); });
    it('isActive for unknown', () => { expect(p.isActive('ghost')).toBe(false); });
    it('report aggregates', () => { p.create('R'); expect(p.report().total).toBe(1); });
    it('reset clears', () => { p.create('R'); p.reset(); expect(p.stats.total).toBe(0); });
    it('exposes ROUTE_PRIORITY', () => { expect(ROUTE_PRIORITY).toContain('high'); });
});
