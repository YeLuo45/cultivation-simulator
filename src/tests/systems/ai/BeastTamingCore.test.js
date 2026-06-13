/**
 * BeastTamingCore.test.js - 灵兽驯化核心测试
 * V324 Iteration 3/9 Round 5 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BeastTamingCore } from '../../../systems/ai/BeastTamingCore.js';

describe('BeastTamingCore', () => {
    let system;
    beforeEach(() => { system = new BeastTamingCore(); });

    describe('Default Beast Types', () => {
        it('should have default types', () => { expect(system.beastTypes.size).toBe(5); });
        it('should contain spirit_fox', () => { expect(system.getBeastType('spirit_fox')).not.toBeNull(); });
    });

    describe('getBeastType', () => {
        it('should return', () => { expect(system.getBeastType('spirit_fox')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getBeastType('ghost')).toBeNull(); });
    });

    describe('listBeastTypes', () => {
        it('should list all', () => { expect(system.listBeastTypes().length).toBe(5); });
    });

    describe('registerTamer', () => {
        it('should register', () => {
            const { tamer } = system.registerTamer({ name: 'T1' });
            expect(tamer.name).toBe('T1');
        });

        it('should default skill to 1', () => {
            const { tamer } = system.registerTamer({});
            expect(tamer.skill).toBe(1);
        });
    });

    describe('getTamer', () => {
        it('should return', () => {
            const { tamer } = system.registerTamer({});
            expect(system.getTamer(tamer.tamerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTamer('ghost')).toBeNull(); });
    });

    describe('listTamers', () => {
        it('should list all', () => {
            system.registerTamer({});
            expect(system.listTamers().length).toBe(1);
        });
    });

    describe('startTaming', () => {
        it('should start', () => {
            const { tamer } = system.registerTamer({});
            const result = system.startTaming(tamer.tamerId, 'spirit_fox');
            expect(result.success).toBe(true);
        });

        it('should reject missing tamer', () => {
            const result = system.startTaming('ghost', 'spirit_fox');
            expect(result.error).toBe('TAMER_NOT_FOUND');
        });

        it('should reject missing beast type', () => {
            const { tamer } = system.registerTamer({});
            const result = system.startTaming(tamer.tamerId, 'ghost');
            expect(result.error).toBe('BEAST_TYPE_NOT_FOUND');
        });

        it('should increment totalSessions', () => {
            const { tamer } = system.registerTamer({});
            system.startTaming(tamer.tamerId, 'spirit_fox');
            expect(system.stats.totalSessions).toBe(1);
        });

        it('should trigger tamingStarted hook', () => {
            const { tamer } = system.registerTamer({});
            let called = false;
            system.registerHook('tamingStarted', () => { called = true; });
            system.startTaming(tamer.tamerId, 'spirit_fox');
            expect(called).toBe(true);
        });
    });

    describe('advanceTaming', () => {
        it('should advance', () => {
            const { tamer } = system.registerTamer({});
            const { session } = system.startTaming(tamer.tamerId, 'spirit_fox');
            const result = system.advanceTaming(session.sessionId, 10);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.advanceTaming('ghost', 10);
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { tamer } = system.registerTamer({});
            const { session } = system.startTaming(tamer.tamerId, 'spirit_fox');
            session.status = 'completed';
            const result = system.advanceTaming(session.sessionId, 10);
            expect(result.error).toBe('SESSION_INACTIVE');
        });
    });

    describe('completeTaming', () => {
        it('should attempt complete', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0; // Force success
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            const result = sys.completeTaming(session.sessionId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.completeTaming('ghost');
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { tamer } = system.registerTamer({});
            const { session } = system.startTaming(tamer.tamerId, 'spirit_fox');
            session.status = 'completed';
            const result = system.completeTaming(session.sessionId);
            expect(result.error).toBe('SESSION_INACTIVE');
        });

        it('should create beast on success', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0;
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            sys.completeTaming(session.sessionId);
            expect(sys.beasts.size).toBe(1);
        });

        it('should increment totalTamed on success', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0;
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            sys.completeTaming(session.sessionId);
            expect(sys.stats.totalTamed).toBe(1);
        });

        it('should trigger tamingCompleted hook on success', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0;
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            let called = false;
            sys.registerHook('tamingCompleted', () => { called = true; });
            sys.completeTaming(session.sessionId);
            expect(called).toBe(true);
        });

        it('should trigger tamingFailed hook on failure', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = -10; // Force failure
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            let called = false;
            sys.registerHook('tamingFailed', () => { called = true; });
            sys.completeTaming(session.sessionId);
            expect(called).toBe(true);
        });
    });

    describe('getBeast', () => {
        it('should return', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0;
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            const { beast } = sys.completeTaming(session.sessionId);
            expect(sys.getBeast(beast.beastId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getBeast('ghost')).toBeNull(); });
    });

    describe('listBeasts', () => {
        it('should list all', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0;
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            sys.completeTaming(session.sessionId);
            expect(sys.listBeasts().length).toBe(1);
        });
    });

    describe('listBeastsByTamer', () => {
        it('should filter by tamer', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0;
            const { tamer: t1 } = sys.registerTamer({});
            const { tamer: t2 } = sys.registerTamer({});
            const { session: s1 } = sys.startTaming(t1.tamerId, 'spirit_fox');
            const { session: s2 } = sys.startTaming(t2.tamerId, 'spirit_fox');
            sys.completeTaming(s1.sessionId);
            sys.completeTaming(s2.sessionId);
            expect(sys.listBeastsByTamer(t1.tamerId).length).toBe(1);
        });
    });

    describe('feedBeast', () => {
        it('should feed', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0;
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            const { beast } = sys.completeTaming(session.sessionId);
            const result = sys.feedBeast(beast.beastId, 10);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.feedBeast('ghost', 10);
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should increase loyalty', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0;
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            const { beast } = sys.completeTaming(session.sessionId);
            const before = beast.loyalty;
            sys.feedBeast(beast.beastId, 100);
            expect(beast.loyalty).toBeGreaterThan(before);
        });

        it('should trigger beastFed hook', () => {
            const sys = new BeastTamingCore();
            sys.config.baseTameRate = 1.0;
            const { tamer } = sys.registerTamer({});
            const { session } = sys.startTaming(tamer.tamerId, 'spirit_fox');
            const { beast } = sys.completeTaming(session.sessionId);
            let called = false;
            sys.registerHook('beastFed', () => { called = true; });
            sys.feedBeast(beast.beastId, 10);
            expect(called).toBe(true);
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

        it('should execute default getBeast', () => {
            const result = system.executeTool('getBeast', { beastId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default getBeastType', () => {
            const result = system.executeTool('getBeastType', { typeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tamingStarted', () => count++);
            unregister();
            const { tamer } = system.registerTamer({});
            system.startTaming(tamer.tamerId, 'spirit_fox');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tamingStarted', () => { throw new Error('x'); });
            const { tamer } = system.registerTamer({});
            expect(() => system.startTaming(tamer.tamerId, 'spirit_fox')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSessions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSessions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerTamer({});
            const json = system.toJSON();
            expect(json.tamers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerTamer({});
            const json = system.toJSON();
            const newSys = new BeastTamingCore();
            newSys.fromJSON(json);
            expect(newSys.tamers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.typeCount).toBe(5);
        });
    });
});