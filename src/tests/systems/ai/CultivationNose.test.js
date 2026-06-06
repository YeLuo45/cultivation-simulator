/**
 * CultivationNose.test.js - 道鼻系统测试
 * V523 Iteration 5/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationNose } from '../../../systems/ai/CultivationNose.js';

describe('CultivationNose', () => {
    let system;
    beforeEach(() => { system = new CultivationNose(); });

    describe('openNose', () => {
        it('should open nose', () => {
            const { nose } = system.openNose({ cultivatorId: 'c1', name: 'Heavenly Nose' });
            expect(nose.cultivatorId).toBe('c1');
            expect(nose.name).toBe('Heavenly Nose');
        });

        it('should default to open status', () => {
            const { nose } = system.openNose({});
            expect(nose.status).toBe('open');
        });

        it('should default type to heavenly', () => {
            const { nose } = system.openNose({});
            expect(nose.type).toBe('heavenly');
        });

        it('should default acuity to baseAcuity', () => {
            const { nose } = system.openNose({});
            expect(nose.acuity).toBe(20);
        });

        it('should start at level 1', () => {
            const { nose } = system.openNose({});
            expect(nose.level).toBe(1);
        });

        it('should start with empty aromas', () => {
            const { nose } = system.openNose({});
            expect(nose.aromas).toEqual([]);
        });

        it('should trigger noseOpened hook', () => {
            let called = false;
            system.registerHook('noseOpened', () => { called = true; });
            system.openNose({});
            expect(called).toBe(true);
        });

        it('should use custom noseId when provided', () => {
            const { nose } = system.openNose({ noseId: 'custom_id' });
            expect(nose.noseId).toBe('custom_id');
        });

        it('should support demonic type', () => {
            const { nose } = system.openNose({ type: 'demonic' });
            expect(nose.type).toBe('demonic');
        });

        it('should support spirit type', () => {
            const { nose } = system.openNose({ type: 'spirit' });
            expect(nose.type).toBe('spirit');
        });
    });

    describe('getNose', () => {
        it('should return', () => {
            const { nose } = system.openNose({});
            expect(system.getNose(nose.noseId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getNose('ghost')).toBeNull(); });
    });

    describe('listNoses', () => {
        it('should list all', () => {
            system.openNose({});
            system.openNose({});
            expect(system.listNoses().length).toBe(2);
        });

        it('should return empty when no noses', () => {
            expect(system.listNoses().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.openNose({ cultivatorId: 'c1' });
            system.openNose({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });

        it('should return empty for unknown cultivator', () => {
            system.openNose({ cultivatorId: 'c1' });
            expect(system.listByCultivator('unknown').length).toBe(0);
        });
    });

    describe('listAwakened', () => {
        it('should filter awakened only', () => {
            const { nose: n1 } = system.openNose({});
            const { nose: n2 } = system.openNose({});
            system.awakenNose(n1.noseId);
            const awakened = system.listAwakened();
            expect(awakened.length).toBe(1);
            expect(awakened[0].noseId).toBe(n1.noseId);
            expect(n2.status).toBe('open');
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.openNose({ type: 'heavenly' });
            system.openNose({ type: 'demonic' });
            system.openNose({ type: 'spirit' });
            expect(system.listByType('heavenly').length).toBe(1);
            expect(system.listByType('demonic').length).toBe(1);
            expect(system.listByType('spirit').length).toBe(1);
        });
    });

    describe('addAroma', () => {
        it('should add aroma', () => {
            const { nose } = system.openNose({});
            system.addAroma(nose.noseId, 'sandalwood');
            expect(nose.aromas).toContain('sandalwood');
        });

        it('should reject missing', () => {
            const result = system.addAroma('ghost', 'jasmine');
            expect(result.error).toBe('NOSE_NOT_FOUND');
        });

        it('should trigger aromaAdded hook', () => {
            const { nose } = system.openNose({});
            let called = false;
            system.registerHook('aromaAdded', () => { called = true; });
            system.addAroma(nose.noseId, 'rose');
            expect(called).toBe(true);
        });

        it('should append multiple aromas', () => {
            const { nose } = system.openNose({});
            system.addAroma(nose.noseId, 'a');
            system.addAroma(nose.noseId, 'b');
            system.addAroma(nose.noseId, 'c');
            expect(nose.aromas.length).toBe(3);
        });
    });

    describe('increaseAcuity', () => {
        it('should increase acuity by default', () => {
            const { nose } = system.openNose({});
            system.increaseAcuity(nose.noseId);
            expect(nose.acuity).toBe(25);
        });

        it('should increase acuity by custom amount', () => {
            const { nose } = system.openNose({});
            system.increaseAcuity(nose.noseId, 50);
            expect(nose.acuity).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.increaseAcuity('ghost');
            expect(result.error).toBe('NOSE_NOT_FOUND');
        });

        it('should trigger acuityIncreased hook', () => {
            const { nose } = system.openNose({});
            let called = false;
            system.registerHook('acuityIncreased', () => { called = true; });
            system.increaseAcuity(nose.noseId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpNose', () => {
        it('should level up', () => {
            const { nose } = system.openNose({});
            system.levelUpNose(nose.noseId);
            expect(nose.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpNose('ghost');
            expect(result.error).toBe('NOSE_NOT_FOUND');
        });

        it('should trigger noseLeveledUp hook', () => {
            const { nose } = system.openNose({});
            let called = false;
            system.registerHook('noseLeveledUp', () => { called = true; });
            system.levelUpNose(nose.noseId);
            expect(called).toBe(true);
        });
    });

    describe('awakenNose', () => {
        it('should awaken nose', () => {
            const { nose } = system.openNose({});
            system.awakenNose(nose.noseId);
            expect(nose.status).toBe('awakened');
        });

        it('should reject missing', () => {
            const result = system.awakenNose('ghost');
            expect(result.error).toBe('NOSE_NOT_FOUND');
        });

        it('should trigger noseAwakened hook', () => {
            const { nose } = system.openNose({});
            let called = false;
            system.registerHook('noseAwakened', () => { called = true; });
            system.awakenNose(nose.noseId);
            expect(called).toBe(true);
        });
    });

    describe('calculateNosePower', () => {
        it('should calculate', () => {
            const { nose } = system.openNose({});
            // level=1, acuity=20, aromas=0 -> 1*50 + 20 + 0 = 70
            expect(system.calculateNosePower(nose.noseId)).toBe(70);
        });

        it('should include aromas in power', () => {
            const { nose } = system.openNose({});
            system.addAroma(nose.noseId, 'a1');
            system.addAroma(nose.noseId, 'a2');
            // level=1, acuity=20, aromas=2 -> 1*50 + 20 + 2*15 = 100
            expect(system.calculateNosePower(nose.noseId)).toBe(100);
        });

        it('should scale with level', () => {
            const { nose } = system.openNose({});
            system.levelUpNose(nose.noseId);
            system.levelUpNose(nose.noseId);
            // level=3, acuity=20, aromas=0 -> 3*50 + 20 + 0 = 170
            expect(system.calculateNosePower(nose.noseId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateNosePower('ghost')).toBe(0);
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

        it('should execute default getNose', () => {
            const result = system.executeTool('getNose', { noseId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default openNose', () => {
            const result = system.executeTool('openNose', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });

        it('should handle null context via || fallback', () => {
            system.registerTool('nullctx', (ctx) => ctx);
            const result = system.executeTool('nullctx', null);
            expect(result.success).toBe(true);
            expect(result.result).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('noseOpened', () => count++);
            unregister();
            system.openNose({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('noseOpened', () => { throw new Error('x'); });
            expect(() => system.openNose({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalNoses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalNoses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openNose({});
            const json = system.toJSON();
            expect(json.noses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openNose({});
            const json = system.toJSON();
            const newSys = new CultivationNose();
            newSys.fromJSON(json);
            expect(newSys.noses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.noseCount).toBe(0);
        });
    });
});
