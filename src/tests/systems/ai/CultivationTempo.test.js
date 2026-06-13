/**
 * CultivationTempo.test.js - 修真节拍系统测试
 * V786 Iteration 19/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTempo } from '../../../systems/ai/CultivationTempo.js';

describe('CultivationTempo', () => {
    let system;
    beforeEach(() => { system = new CultivationTempo(); });

    describe('recruitTempo', () => {
        it('should recruit with defaults', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            expect(tempo.masterId).toBe('m1');
            expect(tempo.level).toBe(1);
            expect(tempo.status).toBe('novice');
            expect(tempo.speed).toBe(20);
            expect(tempo.pulses).toEqual([]);
            expect(tempo.type).toBe('fast');
            expect(tempo.name).toBe('Unnamed Tempo');
        });

        it('should accept custom fields', () => {
            const { tempo } = system.recruitTempo({
                masterId: 'm2',
                name: 'Lightning Step',
                type: 'sacred',
                speed: 50,
                pulses: ['p1', 'p2']
            });
            expect(tempo.name).toBe('Lightning Step');
            expect(tempo.type).toBe('sacred');
            expect(tempo.speed).toBe(50);
            expect(tempo.pulses.length).toBe(2);
        });

        it('should support slow type', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm3', type: 'slow' });
            expect(tempo.type).toBe('slow');
        });

        it('should trigger tempoRecruited hook', () => {
            let called = false;
            system.registerHook('tempoRecruited', () => { called = true; });
            system.recruitTempo({ masterId: 'm1' });
            expect(called).toBe(true);
        });

        it('should generate unique tempoIds', () => {
            const a = system.recruitTempo({ masterId: 'm1' });
            const b = system.recruitTempo({ masterId: 'm1' });
            expect(a.tempo.tempoId).not.toBe(b.tempo.tempoId);
        });
    });

    describe('getTempo', () => {
        it('should return a copy', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            const fetched = system.getTempo(tempo.tempoId);
            expect(fetched).not.toBeNull();
            expect(fetched.tempoId).toBe(tempo.tempoId);
            fetched.name = 'mutated';
            expect(tempo.name).not.toBe('mutated');
        });
        it('should return null for missing', () => {
            expect(system.getTempo('ghost')).toBeNull();
        });
    });

    describe('listTempos', () => {
        it('should list all', () => {
            system.recruitTempo({ masterId: 'm1' });
            system.recruitTempo({ masterId: 'm2' });
            expect(system.listTempos().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listTempos().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitTempo({ masterId: 'm1' });
            system.recruitTempo({ masterId: 'm1' });
            system.recruitTempo({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            expect(system.listByMaster('nobody').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter only legendary', () => {
            const { tempo: a } = system.recruitTempo({ masterId: 'm1' });
            const { tempo: b } = system.recruitTempo({ masterId: 'm1' });
            system.legendTempo(b.tempoId);
            const result = system.listLegendary();
            expect(result.length).toBe(1);
            expect(result[0].tempoId).toBe(b.tempoId);
        });
        it('should return empty when none legendary', () => {
            system.recruitTempo({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPulse', () => {
        it('should add pulse to tempo', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            system.addPulse(tempo.tempoId, 'pulse-1');
            expect(tempo.pulses).toContain('pulse-1');
        });

        it('should reject missing tempo', () => {
            const result = system.addPulse('ghost', 'x');
            expect(result.success).toBe(false);
            expect(result.error).toBe('TEMPO_NOT_FOUND');
        });

        it('should trigger pulseAdded hook', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            let received = null;
            system.registerHook('pulseAdded', (d) => { received = d; });
            system.addPulse(tempo.tempoId, 'p-x');
            expect(received).not.toBeNull();
            expect(received.pulse).toBe('p-x');
        });

        it('should accumulate multiple pulses', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            system.addPulse(tempo.tempoId, 'a');
            system.addPulse(tempo.tempoId, 'b');
            system.addPulse(tempo.tempoId, 'c');
            expect(tempo.pulses.length).toBe(3);
        });
    });

    describe('raiseSpeed', () => {
        it('should raise with default amount', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            system.raiseSpeed(tempo.tempoId);
            expect(tempo.speed).toBe(25);
        });
        it('should raise with custom amount', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            system.raiseSpeed(tempo.tempoId, 15);
            expect(tempo.speed).toBe(35);
        });
        it('should reject missing tempo', () => {
            const result = system.raiseSpeed('ghost', 5);
            expect(result.error).toBe('TEMPO_NOT_FOUND');
        });
        it('should trigger speedRaised hook', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            let received = null;
            system.registerHook('speedRaised', (d) => { received = d; });
            system.raiseSpeed(tempo.tempoId, 7);
            expect(received.newSpeed).toBe(27);
        });
    });

    describe('levelUpTempo', () => {
        it('should increment level', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            system.levelUpTempo(tempo.tempoId);
            expect(tempo.level).toBe(2);
            system.levelUpTempo(tempo.tempoId);
            expect(tempo.level).toBe(3);
        });
        it('should reject missing tempo', () => {
            const result = system.levelUpTempo('ghost');
            expect(result.error).toBe('TEMPO_NOT_FOUND');
        });
        it('should trigger tempoLeveledUp hook', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            let received = null;
            system.registerHook('tempoLeveledUp', (d) => { received = d; });
            system.levelUpTempo(tempo.tempoId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendTempo', () => {
        it('should set status to legendary', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            system.legendTempo(tempo.tempoId);
            expect(tempo.status).toBe('legendary');
        });
        it('should reject missing tempo', () => {
            const result = system.legendTempo('ghost');
            expect(result.error).toBe('TEMPO_NOT_FOUND');
        });
        it('should trigger tempoLegendized hook', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1' });
            let called = false;
            system.registerHook('tempoLegendized', () => { called = true; });
            system.legendTempo(tempo.tempoId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTempoValue', () => {
        it('should calculate: level*100 + speed*2 + pulses*30', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1', speed: 30 });
            system.addPulse(tempo.tempoId, 'p1');
            system.addPulse(tempo.tempoId, 'p2');
            system.levelUpTempo(tempo.tempoId);
            // level=2, speed=30, pulses=2 -> 200 + 60 + 60 = 320
            expect(system.calculateTempoValue(tempo.tempoId)).toBe(320);
        });
        it('should return 0 for missing', () => {
            expect(system.calculateTempoValue('ghost')).toBe(0);
        });
        it('should calculate with zero pulses', () => {
            const { tempo } = system.recruitTempo({ masterId: 'm1', speed: 10 });
            // level=1, speed=10, pulses=0 -> 100 + 20 + 0 = 120
            expect(system.calculateTempoValue(tempo.tempoId)).toBe(120);
        });
    });

    describe('Tool System', () => {
        it('should register a custom tool', () => {
            system.registerTool('custom', () => 'ok');
            expect(system.listTools()).toContain('custom');
        });
        it('should execute a custom tool', () => {
            system.registerTool('echo', (ctx) => ctx.value);
            const result = system.executeTool('echo', { value: 99 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(99);
        });
        it('should reject missing tool', () => {
            const result = system.executeTool('nope', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });
        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });
        it('should execute default getTempo tool', () => {
            const result = system.executeTool('getTempo', { tempoId: 'ghost' });
            expect(result.success).toBe(true);
            expect(result.result).toBeNull();
        });
        it('should execute default recruitTempo tool', () => {
            const result = system.executeTool('recruitTempo', { masterId: 'mx', name: 'A', type: 'sacred' });
            expect(result.success).toBe(true);
            expect(result.result.tempo.type).toBe('sacred');
        });
        it('should handle null context gracefully', () => {
            const result = system.executeTool('recruitTempo', null);
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const off = system.registerHook('tempoRecruited', () => count++);
            off();
            system.recruitTempo({ masterId: 'm1' });
            expect(count).toBe(0);
        });
        it('should swallow handler errors', () => {
            system.registerHook('tempoRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTempo({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient tempos', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalTempos = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double-evolve', () => {
            system.stats.totalTempos = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitTempo({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.tempos.length).toBe(1);
            expect(json.stats.totalTempos).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitTempo({ masterId: 'm1' });
            const json = system.toJSON();
            const fresh = new CultivationTempo();
            fresh.fromJSON(json);
            expect(fresh.tempos.size).toBe(1);
            expect(fresh.stats.totalTempos).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitTempo({ masterId: 'm1' });
            const stats = system.getStats();
            expect(stats.tempoCount).toBe(1);
            expect(stats.totalTempos).toBe(1);
        });
    });
});
