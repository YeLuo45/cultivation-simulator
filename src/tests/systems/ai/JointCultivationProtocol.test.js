/**
 * JointCultivationProtocol.test.js - 双修协议引擎测试
 * V306 Iteration 3/9 - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JointCultivationProtocol } from '../../../systems/ai/JointCultivationProtocol.js';

describe('JointCultivationProtocol', () => {
    let system;

    beforeEach(() => {
        system = new JointCultivationProtocol();
    });

    describe('Participant Management', () => {
        it('should register participant', () => {
            const { participant } = system.registerParticipant({ name: 'A' });
            expect(participant.name).toBe('A');
        });

        it('should default spiritualRoot to balanced', () => {
            const { participant } = system.registerParticipant({});
            expect(participant.spiritualRoot).toBe('balanced');
        });

        it('should get participant', () => {
            const { participant } = system.registerParticipant({ name: 'A' });
            expect(system.getParticipant(participant.id)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getParticipant('ghost')).toBeNull();
        });
    });

    describe('Technique Management', () => {
        it('should register technique', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            expect(technique.name).toBe('T');
        });

        it('should get technique', () => {
            const { technique } = system.registerTechnique({ name: 'T' });
            expect(system.getTechnique(technique.id)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getTechnique('ghost')).toBeNull();
        });
    });

    describe('calculateSynergy', () => {
        it('should compute synergy', () => {
            const { participant: a } = system.registerParticipant({ spiritualRoot: 'fire' });
            const { participant: b } = system.registerParticipant({ spiritualRoot: 'fire' });
            const result = system.calculateSynergy(a.id, b.id);
            expect(result.success).toBe(true);
            expect(result.synergy).toBeGreaterThan(0.2);
        });

        it('should reject missing participant', () => {
            const { participant: a } = system.registerParticipant({});
            const result = system.calculateSynergy(a.id, 'ghost');
            expect(result.error).toBe('PARTICIPANT_NOT_FOUND');
        });

        it('should reward matching root', () => {
            const { participant: a } = system.registerParticipant({ spiritualRoot: 'fire' });
            const { participant: b1 } = system.registerParticipant({ spiritualRoot: 'fire' });
            const { participant: b2 } = system.registerParticipant({ spiritualRoot: 'water' });
            const r1 = system.calculateSynergy(a.id, b1.id);
            const r2 = system.calculateSynergy(a.id, b2.id);
            expect(r1.synergy).toBeGreaterThan(r2.synergy);
        });

        it('should reward matching affinity', () => {
            const { participant: a } = system.registerParticipant({ affinity: ['sword', 'wind'] });
            const { participant: b } = system.registerParticipant({ affinity: ['sword', 'wind'] });
            const result = system.calculateSynergy(a.id, b.id);
            expect(result.synergy).toBeGreaterThan(0.3);
        });

        it('should clamp to 1', () => {
            const { participant: a } = system.registerParticipant({ spiritualRoot: 'fire', affinity: ['x', 'y', 'z', 'w'], daoHeart: 1, harmony: 1 });
            const { participant: b } = system.registerParticipant({ spiritualRoot: 'fire', affinity: ['x', 'y', 'z', 'w'], daoHeart: 1, harmony: 1 });
            const result = system.calculateSynergy(a.id, b.id);
            expect(result.synergy).toBeLessThanOrEqual(1);
        });
    });

    describe('startSession', () => {
        it('should start session', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({ qiCost: 50 });
            const result = system.startSession(a.id, b.id, technique.id);
            expect(result.success).toBe(true);
        });

        it('should reject too many sessions', () => {
            system.config.maxConcurrentSessions = 1;
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({ qiCost: 50 });
            system.startSession(a.id, b.id, technique.id);
            const { participant: c } = system.registerParticipant({ qiPool: 1000 });
            const { participant: d } = system.registerParticipant({ qiPool: 1000 });
            const result = system.startSession(c.id, d.id, technique.id);
            expect(result.error).toBe('TOO_MANY_SESSIONS');
        });

        it('should reject missing participant', () => {
            const { participant: a } = system.registerParticipant({});
            const { technique } = system.registerTechnique({});
            const result = system.startSession(a.id, 'ghost', technique.id);
            expect(result.error).toBe('PARTICIPANT_NOT_FOUND');
        });

        it('should reject missing technique', () => {
            const { participant: a } = system.registerParticipant({});
            const { participant: b } = system.registerParticipant({});
            const result = system.startSession(a.id, b.id, 'ghost');
            expect(result.error).toBe('TECHNIQUE_NOT_FOUND');
        });

        it('should reject low synergy', () => {
            const sys = new JointCultivationProtocol({ baseSynergyBonus: 0 });
            const { participant: a } = sys.registerParticipant({});
            const { participant: b } = sys.registerParticipant({});
            const { technique } = sys.registerTechnique({ minSynergy: 0.5 });
            const result = sys.startSession(a.id, b.id, technique.id);
            expect(result.error).toBe('SYNERGY_TOO_LOW');
        });

        it('should reject insufficient qi A', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 10 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({ qiCost: 50 });
            const result = system.startSession(a.id, b.id, technique.id);
            expect(result.error).toBe('INSUFFICIENT_QI_A');
        });

        it('should reject insufficient qi B', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 10 });
            const { technique } = system.registerTechnique({ qiCost: 50 });
            const result = system.startSession(a.id, b.id, technique.id);
            expect(result.error).toBe('INSUFFICIENT_QI_B');
        });

        it('should trigger sessionStarted hook', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            let called = false;
            system.registerHook('sessionStarted', () => { called = true; });
            system.startSession(a.id, b.id, technique.id);
            expect(called).toBe(true);
        });
    });

    describe('getSession', () => {
        it('should return session', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            expect(system.getSession(session.sessionId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getSession('ghost')).toBeNull();
        });
    });

    describe('listActiveSessions', () => {
        it('should list active', () => {
            expect(system.listActiveSessions().length).toBe(0);
        });

        it('should include active ones', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            system.startSession(a.id, b.id, technique.id);
            expect(system.listActiveSessions().length).toBe(1);
        });
    });

    describe('exchangeEnergy', () => {
        it('should exchange', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            const result = system.exchangeEnergy(session.sessionId, 100);
            expect(result.success).toBe(true);
        });

        it('should reject missing session', () => {
            const result = system.exchangeEnergy('ghost', 100);
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should reject inactive session', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            session.status = 'completed';
            const result = system.exchangeEnergy(session.sessionId, 100);
            expect(result.error).toBe('SESSION_INACTIVE');
        });

        it('should increment totalEnergyExchanged', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            system.exchangeEnergy(session.sessionId, 100);
            expect(system.stats.totalEnergyExchanged).toBe(100);
        });

        it('should trigger energyExchanged hook', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            let called = false;
            system.registerHook('energyExchanged', () => { called = true; });
            system.exchangeEnergy(session.sessionId, 100);
            expect(called).toBe(true);
        });
    });

    describe('advanceSession', () => {
        it('should advance', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            const result = system.advanceSession(session.sessionId, 10);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.advanceSession('ghost', 10);
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should complete on 100%', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            system.advanceSession(session.sessionId, 1000);
            expect(session.status).toBe('completed');
        });
    });

    describe('failSession', () => {
        it('should fail', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            const result = system.failSession(session.sessionId, 'dispute');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.failSession('ghost');
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            session.status = 'completed';
            const result = system.failSession(session.sessionId);
            expect(result.error).toBe('SESSION_INACTIVE');
        });

        it('should increment totalFailed', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            system.failSession(session.sessionId);
            expect(system.stats.totalFailed).toBe(1);
        });

        it('should trigger sessionFailed hook', () => {
            const { participant: a } = system.registerParticipant({ qiPool: 1000 });
            const { participant: b } = system.registerParticipant({ qiPool: 1000 });
            const { technique } = system.registerTechnique({});
            const { session } = system.startSession(a.id, b.id, technique.id);
            let called = false;
            system.registerHook('sessionFailed', () => { called = true; });
            system.failSession(session.sessionId);
            expect(called).toBe(true);
        });
    });

    describe('Mesh Network', () => {
        it('should add node', () => {
            const result = system.addMeshNode('n1');
            expect(result.success).toBe(true);
        });

        it('should connect nodes', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.connectMeshNodes('a', 'b');
            expect(result.success).toBe(true);
        });

        it('should reject missing nodes', () => {
            const result = system.connectMeshNodes('ghost', 'ghost2');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should transfer qi', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            system.connectMeshNodes('a', 'b');
            const result = system.transferQi('a', 'b', 10);
            expect(result.transferred).toBe(10);
        });

        it('should reject disconnected transfer', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.transferQi('a', 'b', 10);
            expect(result.error).toBe('NOT_CONNECTED');
        });

        it('should reject missing source', () => {
            const result = system.transferQi('ghost', 'b', 10);
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should reject insufficient qi', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            system.connectMeshNodes('a', 'b');
            const result = system.transferQi('a', 'b', 1000);
            expect(result.error).toBe('INSUFFICIENT_QI');
        });

        it('should trigger qiTransferred hook', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            system.connectMeshNodes('a', 'b');
            let called = false;
            system.registerHook('qiTransferred', () => { called = true; });
            system.transferQi('a', 'b', 10);
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

        it('should execute default calculateSynergy', () => {
            const { participant: a } = system.registerParticipant({});
            const { participant: b } = system.registerParticipant({});
            const result = system.executeTool('calculateSynergy', { participantA: a.id, participantB: b.id });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sessionStarted', () => count++);
            unregister();
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sessionStarted', () => { throw new Error('x'); });
            expect(() => system.registerParticipant({ qiPool: 1000 })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalCompleted = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalCompleted = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerParticipant({ name: 'A' });
            const json = system.toJSON();
            expect(json.participants.length).toBe(1);
        });

        it('should deserialize', () => {
            system.registerParticipant({ name: 'A' });
            const json = system.toJSON();
            const newSys = new JointCultivationProtocol();
            newSys.fromJSON(json);
            expect(newSys.participants.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.participantCount).toBe(0);
        });
    });
});