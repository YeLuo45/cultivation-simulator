/**
 * ElixirDistilling.test.js - 灵液蒸馏测试
 * V504 Iteration 6/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElixirDistilling } from '../../../systems/ai/ElixirDistilling.js';

describe('ElixirDistilling', () => {
    let system;
    beforeEach(() => { system = new ElixirDistilling(); });

    describe('distillElixir', () => {
        it('should distill', () => {
            const { elixir } = system.distillElixir({ name: 'Spring Dew', type: 'water' });
            expect(elixir.name).toBe('Spring Dew');
        });

        it('should use defaults', () => {
            const { elixir } = system.distillElixir({});
            expect(elixir.type).toBe('water');
            expect(elixir.purity).toBe(30);
            expect(elixir.status).toBe('brewing');
        });

        it('should trigger elixirDistilled hook', () => {
            let called = false;
            system.registerHook('elixirDistilled', () => { called = true; });
            system.distillElixir({});
            expect(called).toBe(true);
        });
    });

    describe('getElixir', () => {
        it('should return', () => {
            const { elixir } = system.distillElixir({});
            expect(system.getElixir(elixir.elixirId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getElixir('ghost')).toBeNull(); });
    });

    describe('listElixirs', () => {
        it('should list all', () => {
            system.distillElixir({});
            system.distillElixir({});
            expect(system.listElixirs().length).toBe(2);
        });
    });

    describe('listByDistiller', () => {
        it('should filter', () => {
            system.distillElixir({ distillerId: 'alchemist_a' });
            system.distillElixir({ distillerId: 'alchemist_b' });
            expect(system.listByDistiller('alchemist_a').length).toBe(1);
        });
    });

    describe('listPreserved', () => {
        it('should filter preserved', () => {
            const { elixir: e1 } = system.distillElixir({});
            const { elixir: e2 } = system.distillElixir({});
            system.preserveElixir(e1.elixirId);
            expect(system.listPreserved().length).toBe(1);
            expect(system.listPreserved()[0].elixirId).toBe(e1.elixirId);
        });
    });

    describe('addHerb', () => {
        it('should add herb', () => {
            const { elixir } = system.distillElixir({});
            system.addHerb(elixir.elixirId, 'ginseng');
            expect(elixir.herbs).toContain('ginseng');
        });

        it('should reject missing elixir', () => {
            const result = system.addHerb('ghost', 'ginseng');
            expect(result.error).toBe('ELIXIR_NOT_FOUND');
        });

        it('should trigger herbAdded hook', () => {
            const { elixir } = system.distillElixir({});
            let called = false;
            system.registerHook('herbAdded', () => { called = true; });
            system.addHerb(elixir.elixirId, 'ginseng');
            expect(called).toBe(true);
        });
    });

    describe('purifyElixir', () => {
        it('should purify', () => {
            const { elixir } = system.distillElixir({});
            system.purifyElixir(elixir.elixirId, 10);
            expect(elixir.purity).toBe(40);
        });

        it('should cap at 100', () => {
            const { elixir } = system.distillElixir({});
            system.purifyElixir(elixir.elixirId, 200);
            expect(elixir.purity).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.purifyElixir('ghost');
            expect(result.error).toBe('ELIXIR_NOT_FOUND');
        });

        it('should trigger elixirPurified hook', () => {
            const { elixir } = system.distillElixir({});
            let called = false;
            system.registerHook('elixirPurified', () => { called = true; });
            system.purifyElixir(elixir.elixirId);
            expect(called).toBe(true);
        });
    });

    describe('preserveElixir', () => {
        it('should preserve', () => {
            const { elixir } = system.distillElixir({});
            system.preserveElixir(elixir.elixirId);
            expect(elixir.status).toBe('preserved');
        });

        it('should reject missing', () => {
            const result = system.preserveElixir('ghost');
            expect(result.error).toBe('ELIXIR_NOT_FOUND');
        });

        it('should trigger elixirPreserved hook', () => {
            const { elixir } = system.distillElixir({});
            let called = false;
            system.registerHook('elixirPreserved', () => { called = true; });
            system.preserveElixir(elixir.elixirId);
            expect(called).toBe(true);
        });
    });

    describe('calculateElixirQuality', () => {
        it('should calculate with no herbs', () => {
            const { elixir } = system.distillElixir({});
            // purity 30 * 10 + 0 herbs * 3 = 300
            expect(system.calculateElixirQuality(elixir.elixirId)).toBe(300);
        });

        it('should calculate with herbs', () => {
            const { elixir } = system.distillElixir({});
            system.addHerb(elixir.elixirId, 'ginseng');
            system.addHerb(elixir.elixirId, 'lingzhi');
            // purity 30 * 10 + 2 herbs * 3 = 306
            expect(system.calculateElixirQuality(elixir.elixirId)).toBe(306);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateElixirQuality('ghost')).toBe(0);
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

        it('should execute default getElixir', () => {
            const result = system.executeTool('getElixir', { elixirId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('elixirDistilled', () => count++);
            unregister();
            system.distillElixir({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('elixirDistilled', () => { throw new Error('x'); });
            expect(() => system.distillElixir({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalElixirs = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalElixirs = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.distillElixir({});
            const json = system.toJSON();
            expect(json.elixirs.length).toBe(1);
        });
        it('should deserialize', () => {
            system.distillElixir({});
            const json = system.toJSON();
            const newSys = new ElixirDistilling();
            newSys.fromJSON(json);
            expect(newSys.elixirs.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.elixirCount).toBe(0);
        });
    });
});
