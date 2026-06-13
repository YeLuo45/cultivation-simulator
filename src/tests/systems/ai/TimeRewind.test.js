/**
 * TimeRewind.test.js - 时光回溯系统测试
 * V356 Iteration 8/9 Round 8 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TimeRewind } from '../../../systems/ai/TimeRewind.js';

describe('TimeRewind', () => {
    let system;
    beforeEach(() => { system = new TimeRewind(); });

    describe('registerCultivator', () => {
        it('should register', () => {
            const { cultivator } = system.registerCultivator({ name: 'C1' });
            expect(cultivator.name).toBe('C1');
        });
    });

    describe('getCultivator', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getCultivator(cultivator.cultivatorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCultivator('ghost')).toBeNull(); });
    });

    describe('capture', () => {
        it('should capture', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.capture(cultivator.cultivatorId, { level: 1 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.capture('ghost', {});
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger snapshotCaptured hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('snapshotCaptured', () => { called = true; });
            system.capture(cultivator.cultivatorId, {});
            expect(called).toBe(true);
        });

        it('should cleanup oldest when max exceeded', () => {
            const sys = new TimeRewind({ maxSnapshots: 1 });
            const { cultivator } = sys.registerCultivator({});
            sys.capture(cultivator.cultivatorId, {});
            const { snapshot: s2 } = sys.capture(cultivator.cultivatorId, {});
            expect(sys.listSnapshots().length).toBe(1);
            expect(sys.listSnapshots()[0].snapshotId).toBe(s2.snapshotId);
        });
    });

    describe('rewind', () => {
        it('should rewind', () => {
            const { cultivator } = system.registerCultivator({});
            const { snapshot } = system.capture(cultivator.cultivatorId, { level: 5 });
            const result = system.rewind(snapshot.snapshotId);
            expect(result.state.level).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.rewind('ghost');
            expect(result.error).toBe('SNAPSHOT_NOT_FOUND');
        });

        it('should trigger timeRewound hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { snapshot } = system.capture(cultivator.cultivatorId, {});
            let called = false;
            system.registerHook('timeRewound', () => { called = true; });
            system.rewind(snapshot.snapshotId);
            expect(called).toBe(true);
        });
    });

    describe('getSnapshot', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            const { snapshot } = system.capture(cultivator.cultivatorId, {});
            expect(system.getSnapshot(snapshot.snapshotId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSnapshot('ghost')).toBeNull(); });
    });

    describe('listSnapshots', () => {
        it('should list all', () => {
            const { cultivator } = system.registerCultivator({});
            system.capture(cultivator.cultivatorId, {});
            expect(system.listSnapshots().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.capture(c1.cultivatorId, {});
            system.capture(c2.cultivatorId, {});
            expect(system.listByCultivator(c1.cultivatorId).length).toBe(1);
        });
    });

    describe('compareSnapshots', () => {
        it('should return diff', () => {
            const { cultivator } = system.registerCultivator({});
            const { snapshot: s1 } = system.capture(cultivator.cultivatorId, { level: 1 });
            const { snapshot: s2 } = system.capture(cultivator.cultivatorId, { level: 2 });
            const diff = system.compareSnapshots(s1.snapshotId, s2.snapshotId);
            expect(diff.level).toBeDefined();
        });

        it('should return null for missing', () => {
            expect(system.compareSnapshots('a', 'b')).toBeNull();
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getSnapshot', () => {
            const result = system.executeTool('getSnapshot', { snapshotId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('snapshotCaptured', () => count++);
            unregister();
            const { cultivator } = system.registerCultivator({});
            system.capture(cultivator.cultivatorId, {});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('snapshotCaptured', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.capture(cultivator.cultivatorId, {})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSnapshots = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSnapshots = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            const { cultivator } = system.registerCultivator({});
            system.capture(cultivator.cultivatorId, {});
            const json = system.toJSON();
            expect(json.snapshots.length).toBe(1);
        });
        it('should deserialize', () => {
            const { cultivator } = system.registerCultivator({});
            system.capture(cultivator.cultivatorId, {});
            const json = system.toJSON();
            const newSys = new TimeRewind();
            newSys.fromJSON(json);
            expect(newSys.snapshots.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.snapshotCount).toBe(0);
        });
    });
});