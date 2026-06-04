/**
 * SoulLinkNetwork.test.js - 神魂连接网络测试
 * V310 Iteration 7/9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SoulLinkNetwork } from '../../../systems/ai/SoulLinkNetwork.js';

describe('SoulLinkNetwork', () => {
    let system;

    beforeEach(() => { system = new SoulLinkNetwork(); });

    describe('addNode', () => {
        it('should add node', () => {
            const { node } = system.addNode({ ownerId: 'c1' });
            expect(node.ownerId).toBe('c1');
        });

        it('should default soulType to normal', () => {
            const { node } = system.addNode({});
            expect(node.soulType).toBe('normal');
        });

        it('should generate id', () => {
            const { node } = system.addNode({});
            expect(node.nodeId).toBeDefined();
        });
    });

    describe('getNode', () => {
        it('should return node', () => {
            const { node } = system.addNode({});
            expect(system.getNode(node.nodeId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getNode('ghost')).toBeNull();
        });
    });

    describe('listNodes', () => {
        it('should list all', () => {
            system.addNode({});
            system.addNode({});
            expect(system.listNodes().length).toBe(2);
        });
    });

    describe('createLink', () => {
        it('should create link', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            const result = system.createLink(a.nodeId, b.nodeId);
            expect(result.success).toBe(true);
        });

        it('should reject missing node', () => {
            const { node: a } = system.addNode({});
            const result = system.createLink(a.nodeId, 'ghost');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should add links to both nodes', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            system.createLink(a.nodeId, b.nodeId);
            expect(a.links.size).toBe(1);
            expect(b.links.size).toBe(1);
        });

        it('should increment totalLinks', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            system.createLink(a.nodeId, b.nodeId);
            expect(system.stats.totalLinks).toBe(1);
        });

        it('should trigger linkCreated hook', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            let called = false;
            system.registerHook('linkCreated', () => { called = true; });
            system.createLink(a.nodeId, b.nodeId);
            expect(called).toBe(true);
        });
    });

    describe('severLink', () => {
        it('should sever', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            const { link } = system.createLink(a.nodeId, b.nodeId);
            const result = system.severLink(link.linkId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.severLink('ghost');
            expect(result.error).toBe('LINK_NOT_FOUND');
        });

        it('should remove from both nodes', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            const { link } = system.createLink(a.nodeId, b.nodeId);
            system.severLink(link.linkId);
            expect(a.links.size).toBe(0);
            expect(b.links.size).toBe(0);
        });
    });

    describe('setResonance', () => {
        it('should set resonance', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            const result = system.setResonance(a.nodeId, b.nodeId, 0.8);
            expect(result.success).toBe(true);
        });

        it('should trigger resonanceChanged hook', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            let called = false;
            system.registerHook('resonanceChanged', () => { called = true; });
            system.setResonance(a.nodeId, b.nodeId, 0.5);
            expect(called).toBe(true);
        });
    });

    describe('getResonance', () => {
        it('should return resonance', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            system.setResonance(a.nodeId, b.nodeId, 0.5);
            expect(system.getResonance(a.nodeId, b.nodeId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getResonance('x', 'y')).toBeNull();
        });

        it('should be symmetric', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            system.setResonance(a.nodeId, b.nodeId, 0.5);
            expect(system.getResonance(b.nodeId, a.nodeId)).not.toBeNull();
        });
    });

    describe('applyResonanceDecay', () => {
        it('should decay all', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            system.setResonance(a.nodeId, b.nodeId, 1.0);
            system.applyResonanceDecay();
            expect(system.getResonance(a.nodeId, b.nodeId).level).toBeLessThan(1.0);
        });

        it('should trigger resonanceDecayed hook', () => {
            let called = false;
            system.registerHook('resonanceDecayed', () => { called = true; });
            system.applyResonanceDecay();
            expect(called).toBe(true);
        });
    });

    describe('broadcast', () => {
        it('should broadcast', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            system.createLink(a.nodeId, b.nodeId);
            const result = system.broadcast(a.nodeId, 'hello', 1);
            expect(result.success).toBe(true);
        });

        it('should reject missing source', () => {
            const result = system.broadcast('ghost', 'hello');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should reach linked nodes', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            const { node: c } = system.addNode({});
            system.createLink(a.nodeId, b.nodeId);
            system.createLink(b.nodeId, c.nodeId);
            const result = system.broadcast(a.nodeId, 'hello', 2);
            expect(result.broadcast.received.length).toBeGreaterThan(0);
        });

        it('should trigger broadcastSent hook', () => {
            const { node: a } = system.addNode({});
            let called = false;
            system.registerHook('broadcastSent', () => { called = true; });
            system.broadcast(a.nodeId, 'hello');
            expect(called).toBe(true);
        });
    });

    describe('getNetworkOverview', () => {
        it('should return overview', () => {
            const overview = system.getNetworkOverview();
            expect(overview.nodeCount).toBe(0);
        });

        it('should track all', () => {
            system.addNode({});
            const overview = system.getNetworkOverview();
            expect(overview.nodeCount).toBe(1);
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

        it('should execute default getNode', () => {
            const result = system.executeTool('getNode', { nodeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('linkCreated', () => count++);
            unregister();
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('linkCreated', () => { throw new Error('x'); });
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            expect(() => system.createLink(a.nodeId, b.nodeId)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalLinks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalLinks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addNode({});
            const json = system.toJSON();
            expect(json.nodes.length).toBe(1);
        });

        it('should deserialize', () => {
            system.addNode({});
            const json = system.toJSON();
            const newSys = new SoulLinkNetwork();
            newSys.fromJSON(json);
            expect(newSys.nodes.size).toBe(1);
        });

        it('should preserve link sets', () => {
            const { node: a } = system.addNode({});
            const { node: b } = system.addNode({});
            system.createLink(a.nodeId, b.nodeId);
            const json = system.toJSON();
            const newSys = new SoulLinkNetwork();
            newSys.fromJSON(json);
            expect(newSys.nodes.get(a.nodeId).links.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.nodeCount).toBe(0);
        });
    });
});