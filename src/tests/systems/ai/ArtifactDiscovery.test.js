/**
 * ArtifactDiscovery.test.js - 法宝发现系统测试
 * V333 Iteration 3/9 Round 6 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ArtifactDiscovery } from '../../../systems/ai/ArtifactDiscovery.js';

describe('ArtifactDiscovery', () => {
    let system;
    beforeEach(() => { system = new ArtifactDiscovery(); });

    describe('discoverArtifact', () => {
        it('should discover', () => {
            const { artifact } = system.discoverArtifact({});
            expect(artifact).toBeDefined();
        });

        it('should have a typeId', () => {
            const { artifact } = system.discoverArtifact({});
            expect(artifact.typeId).toBeDefined();
        });

        it('should start unidentified', () => {
            const { artifact } = system.discoverArtifact({});
            expect(artifact.identified).toBe(false);
        });

        it('should trigger artifactDiscovered hook', () => {
            let called = false;
            system.registerHook('artifactDiscovered', () => { called = true; });
            system.discoverArtifact({});
            expect(called).toBe(true);
        });

        it('should increment totalArtifacts', () => {
            system.discoverArtifact({});
            expect(system.stats.totalArtifacts).toBe(1);
        });
    });

    describe('getArtifact', () => {
        it('should return', () => {
            const { artifact } = system.discoverArtifact({});
            expect(system.getArtifact(artifact.artifactId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getArtifact('ghost')).toBeNull(); });
    });

    describe('listArtifacts', () => {
        it('should list all', () => {
            system.discoverArtifact({});
            expect(system.listArtifacts().length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.artifacts.set('a1', { artifactId: 'a1', typeId: 'sword' });
            system.artifacts.set('a2', { artifactId: 'a2', typeId: 'staff' });
            expect(system.listByType('sword').length).toBe(1);
        });
    });

    describe('identifyArtifact', () => {
        it('should identify', () => {
            const { artifact } = system.discoverArtifact({});
            const result = system.identifyArtifact(artifact.artifactId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.identifyArtifact('ghost');
            expect(result.error).toBe('ARTIFACT_NOT_FOUND');
        });

        it('should reject already identified', () => {
            const { artifact } = system.discoverArtifact({});
            system.identifyArtifact(artifact.artifactId);
            const result = system.identifyArtifact(artifact.artifactId);
            expect(result.error).toBe('ALREADY_IDENTIFIED');
        });

        it('should set identified', () => {
            const { artifact } = system.discoverArtifact({});
            system.identifyArtifact(artifact.artifactId);
            expect(artifact.identified).toBe(true);
        });

        it('should increment totalIdentified', () => {
            const { artifact } = system.discoverArtifact({});
            system.identifyArtifact(artifact.artifactId);
            expect(system.stats.totalIdentified).toBe(1);
        });

        it('should trigger artifactIdentified hook', () => {
            const { artifact } = system.discoverArtifact({});
            let called = false;
            system.registerHook('artifactIdentified', () => { called = true; });
            system.identifyArtifact(artifact.artifactId);
            expect(called).toBe(true);
        });
    });

    describe('discardArtifact', () => {
        it('should discard', () => {
            const { artifact } = system.discoverArtifact({});
            const result = system.discardArtifact(artifact.artifactId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.discardArtifact('ghost');
            expect(result.error).toBe('ARTIFACT_NOT_FOUND');
        });

        it('should trigger artifactDiscarded hook', () => {
            const { artifact } = system.discoverArtifact({});
            let called = false;
            system.registerHook('artifactDiscarded', () => { called = true; });
            system.discardArtifact(artifact.artifactId);
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

        it('should execute default getArtifact', () => {
            const result = system.executeTool('getArtifact', { artifactId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('artifactDiscovered', () => count++);
            unregister();
            system.discoverArtifact({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('artifactDiscovered', () => { throw new Error('x'); });
            expect(() => system.discoverArtifact({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalArtifacts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalArtifacts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.discoverArtifact({});
            const json = system.toJSON();
            expect(json.artifacts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.discoverArtifact({});
            const json = system.toJSON();
            const newSys = new ArtifactDiscovery();
            newSys.fromJSON(json);
            expect(newSys.artifacts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.artifactCount).toBe(0);
        });
    });
});