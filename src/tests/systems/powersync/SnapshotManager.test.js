/**
 * SnapshotManager.test.js - 快照管理测试
 * V1164 Round 44 Iter 7/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SnapshotManager, SNAPSHOT_KINDS } from '../../../systems/powersync/SnapshotManager.js';

describe('SnapshotManager', () => {
    let sm;
    beforeEach(() => { sm = new SnapshotManager(); });

    describe('exports', () => {
        it('should export SNAPSHOT_KINDS', () => {
            expect(SNAPSHOT_KINDS).toContain('full');
            expect(SNAPSHOT_KINDS).toContain('incremental');
            expect(SNAPSHOT_KINDS).toContain('delta');
        });
    });

    describe('constructor', () => {
        it('should initialize empty', () => {
            expect(sm.snapshots.size).toBe(0);
            expect(sm.applied.length).toBe(0);
        });
        it('should accept custom maxSnapshots', () => {
            const s = new SnapshotManager({ maxSnapshots: 5 });
            expect(s.config.maxSnapshots).toBe(5);
        });
    });

    describe('createSnapshot', () => {
        it('should create a full snapshot', () => {
            const s = sm.createSnapshot({ players: 10 }, 'init');
            expect(s.label).toBe('init');
            expect(s.kind).toBe('full');
            expect(sm.snapshots.size).toBe(1);
        });
        it('should deep-clone data', () => {
            const data = { players: 10 };
            const s = sm.createSnapshot(data, 'init');
            data.players = 99;
            expect(s.data.players).toBe(10);
        });
        it('should default kind to full', () => {
            const s = sm.createSnapshot({}, 'x', 'bogus');
            expect(s.kind).toBe('full');
        });
        it('should accept incremental kind', () => {
            const s = sm.createSnapshot({}, 'x', 'incremental');
            expect(s.kind).toBe('incremental');
        });
        it('should auto-generate label', () => {
            const s = sm.createSnapshot({});
            expect(s.label).toBeTruthy();
        });
        it('should track created count', () => {
            sm.createSnapshot({});
            sm.createSnapshot({});
            expect(sm.stats.created).toBe(2);
        });
        it('should drop oldest non-applied when at capacity', async () => {
            const small = new SnapshotManager({ maxSnapshots: 2 });
            small.createSnapshot({ v: 1 });
            await new Promise(r => setTimeout(r, 5));
            small.createSnapshot({ v: 2 });
            await new Promise(r => setTimeout(r, 5));
            small.createSnapshot({ v: 3 });
            expect(small.snapshots.size).toBe(2);
        });
    });

    describe('applySnapshot', () => {
        it('should mark as applied', () => {
            const s = sm.createSnapshot({}, 'a');
            expect(sm.applySnapshot(s.id)).toBe(true);
            expect(sm.applied).toContain(s.id);
        });
        it('should be idempotent', () => {
            const s = sm.createSnapshot({}, 'a');
            sm.applySnapshot(s.id);
            sm.applySnapshot(s.id);
            expect(sm.applied.length).toBe(1);
        });
        it('should return false for unknown id', () => {
            expect(sm.applySnapshot('fake_id')).toBe(false);
        });
    });

    describe('restore', () => {
        it('should restore by id', () => {
            const s = sm.createSnapshot({ value: 1 }, 'a');
            const r = sm.restore(s.id);
            expect(r.id).toBe(s.id);
        });
        it('should find latest snapshot at or before ts', async () => {
            const a = sm.createSnapshot({ v: 1 }, 'a');
            await new Promise(r => setTimeout(r, 10));
            const b = sm.createSnapshot({ v: 2 }, 'b');
            await new Promise(r => setTimeout(r, 10));
            const r = sm.restore(b.ts);
            expect(r.id).toBe(b.id);
        });
        it('should return null for unknown id', () => {
            expect(sm.restore('fake_id')).toBeNull();
        });
        it('should return null for ts before any snapshot', () => {
            sm.createSnapshot({}, 'a');
            expect(sm.restore(0)).toBeNull();
        });
    });

    describe('queries', () => {
        it('listSnapshots should be sorted by ts desc', async () => {
            const a = sm.createSnapshot({}, 'a');
            await new Promise(r => setTimeout(r, 5));
            const b = sm.createSnapshot({}, 'b');
            const list = sm.listSnapshots();
            expect(list[0].id).toBe(b.id);
            expect(list[1].id).toBe(a.id);
        });
        it('getLatest should return most recent', async () => {
            sm.createSnapshot({ v: 1 });
            await new Promise(r => setTimeout(r, 5));
            const b = sm.createSnapshot({ v: 2 });
            expect(sm.getLatest().id).toBe(b.id);
        });
        it('getLatest should return null when empty', () => {
            expect(sm.getLatest()).toBeNull();
        });
        it('get should return by id', () => {
            const s = sm.createSnapshot({});
            expect(sm.get(s.id).id).toBe(s.id);
        });
        it('get should return null for unknown', () => {
            expect(sm.get('fake')).toBeNull();
        });
        it('listApplied returns applied ids', () => {
            const s = sm.createSnapshot({});
            sm.applySnapshot(s.id);
            expect(sm.listApplied().length).toBe(1);
        });
        it('remove deletes by id', () => {
            const s = sm.createSnapshot({});
            expect(sm.remove(s.id)).toBe(true);
            expect(sm.snapshots.size).toBe(0);
        });
        it('clear empties everything', () => {
            sm.createSnapshot({});
            sm.clear();
            expect(sm.snapshots.size).toBe(0);
            expect(sm.applied.length).toBe(0);
        });
    });

    describe('stats', () => {
        it('getStats tracks all', () => {
            const s = sm.createSnapshot({});
            sm.applySnapshot(s.id);
            const r = sm.getStats();
            expect(r.created).toBe(1);
            expect(r.applied).toBe(1);
        });
    });

    describe('hooks', () => {
        it('should emit created', () => {
            let fired = false;
            sm.registerHook('created', () => { fired = true; });
            sm.createSnapshot({});
            expect(fired).toBe(true);
        });
        it('should emit applied', () => {
            let captured = null;
            sm.registerHook('applied', (p) => { captured = p; });
            const s = sm.createSnapshot({});
            sm.applySnapshot(s.id);
            expect(captured.id).toBe(s.id);
        });
        it('should emit restored', () => {
            let fired = false;
            sm.registerHook('restored', () => { fired = true; });
            const s = sm.createSnapshot({});
            sm.restore(s.id);
            expect(fired).toBe(true);
        });
        it('should handle hook errors silently', () => {
            sm.registerHook('created', () => { throw new Error('boom'); });
            expect(() => sm.createSnapshot({})).not.toThrow();
        });
    });
});
