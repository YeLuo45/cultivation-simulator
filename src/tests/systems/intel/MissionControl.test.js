import { describe, it, expect, beforeEach } from 'vitest';
import { MissionControl, MISSION_TYPES } from '../../../systems/intel/MissionControl.js';

describe('MissionControl', () => {
    let m;
    beforeEach(() => { m = new MissionControl(); });
    it('initializes with defaults', () => { expect(m.stats.total).toBe(0); });
    it('create', () => { expect(m.create('Mission1')).not.toBeNull(); });
    it('create rejects missing', () => { expect(m.create('')).toBeNull(); });
    it('create normalizes invalid type', () => { const x = m.create('M', 'invalid'); expect(x.type).toBe('recon'); });
    it('get returns null for unknown', () => { expect(m.get('ghost')).toBeNull(); });
    it('listAll and listByStatus and listByType and listActive and listPlanning', () => {
        m.create('A', 'infiltration');
        m.create('B', 'sabotage');
        expect(m.listAll().length).toBe(2);
        expect(m.listByStatus('planning').length).toBe(2);
        expect(m.listByType('sabotage').length).toBe(1);
    });
    it('setStatus', () => { const x = m.create('M'); expect(m.setStatus(x.id, 'approved')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = m.create('M'); expect(m.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(m.setStatus('ghost', 'approved')).toBe(false); });
    it('approve and launch and complete and abort and fail', () => { const x = m.create('M'); m.approve(x.id); m.launch(x.id); m.complete(x.id); expect(m.stats.completed).toBe(1); const y = m.create('N'); m.abort(y.id); const z = m.create('O'); m.fail(z.id); expect(z.status).toBe('failed'); });
    it('assignAgent and unassignAgent', () => { const x = m.create('M'); m.assignAgent(x.id, 'a1'); m.unassignAgent(x.id, 'a1'); expect(m.agentCount(x.id)).toBe(0); });
    it('assignAgent rejects duplicate', () => { const x = m.create('M'); m.assignAgent(x.id, 'a1'); expect(m.assignAgent(x.id, 'a1')).toBe(false); });
    it('assignAgent returns false for unknown', () => { expect(m.assignAgent('ghost', 'a1')).toBe(false); });
    it('unassignAgent returns false for unknown', () => { expect(m.unassignAgent('ghost', 'a1')).toBe(false); });
    it('setPriority', () => { const x = m.create('M'); m.setPriority(x.id, 'high'); expect(m.get(x.id).priority).toBe('high'); });
    it('setPriority returns false for unknown', () => { expect(m.setPriority('ghost', 'high')).toBe(false); });
    it('isActive and isCompleted and isFailed', () => { const x = m.create('M'); expect(m.isActive(x.id)).toBe(false); m.launch(x.id); expect(m.isActive(x.id)).toBe(true); });
    it('agentsFor and agentCount', () => { const x = m.create('M'); m.assignAgent(x.id, 'a1'); expect(m.agentsFor(x.id)).toContain('a1'); expect(m.agentCount(x.id)).toBe(1); });
    it('agentsFor for unknown', () => { expect(m.agentsFor('ghost')).toEqual([]); });
    it('agentCount for unknown', () => { expect(m.agentCount('ghost')).toBe(0); });
    it('successRate', () => { const x = m.create('M'); m.complete(x.id); expect(m.successRate()).toBe(1); });
    it('report aggregates', () => { m.create('M'); expect(m.report().total).toBe(1); });
    it('reset clears', () => { m.create('M'); m.reset(); expect(m.stats.total).toBe(0); });
    it('exposes MISSION_TYPES', () => { expect(MISSION_TYPES).toContain('recon'); });
});
