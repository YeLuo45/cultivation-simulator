/**
 * CultivationDomain.test.js - 修真领域系统测试
 * V585 Iteration 8/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDomain } from '../../../systems/ai/CultivationDomain.js';

describe('CultivationDomain', () => {
    let system;
    beforeEach(() => { system = new CultivationDomain(); });

    describe('openDomain', () => {
        it('should open a domain', () => {
            const { domain } = system.openDomain({ masterId: 'm1', name: 'Sky Realm', type: 'celestial' });
            expect(domain.masterId).toBe('m1');
            expect(domain.name).toBe('Sky Realm');
            expect(domain.type).toBe('celestial');
            expect(domain.power).toBe(20);
            expect(domain.rules).toEqual([]);
            expect(domain.level).toBe(1);
            expect(domain.status).toBe('forming');
        });

        it('should use default type when missing', () => {
            const { domain } = system.openDomain({ masterId: 'm1', name: 'D' });
            expect(domain.type).toBe('neutral');
        });

        it('should reject when max reached', () => {
            system.config.maxDomains = 1;
            system.openDomain({});
            const result = system.openDomain({});
            expect(result.error).toBe('MAX_DOMAINS_REACHED');
        });

        it('should trigger domainOpened hook', () => {
            let called = false;
            system.registerHook('domainOpened', () => { called = true; });
            system.openDomain({});
            expect(called).toBe(true);
        });
    });

    describe('getDomain', () => {
        it('should return domain', () => {
            const { domain } = system.openDomain({});
            expect(system.getDomain(domain.domainId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDomain('ghost')).toBeNull(); });
    });

    describe('listDomains', () => {
        it('should list all', () => {
            system.openDomain({});
            system.openDomain({});
            expect(system.listDomains().length).toBe(2);
        });
        it('should be empty initially', () => {
            expect(system.listDomains().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.openDomain({ masterId: 'm1' });
            system.openDomain({ masterId: 'm2' });
            system.openDomain({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should return stable/eternal domains', () => {
            const { domain: d1 } = system.openDomain({});
            const { domain: d2 } = system.openDomain({});
            const { domain: d3 } = system.openDomain({});
            d1.status = 'stable';
            d3.status = 'eternal';
            const stable = system.listStable();
            expect(stable.length).toBe(2);
        });
    });

    describe('addRule', () => {
        it('should add rule', () => {
            const { domain } = system.openDomain({});
            const result = system.addRule(domain.domainId, 'no_mortals');
            expect(result.success).toBe(true);
            expect(domain.rules).toContain('no_mortals');
        });
        it('should add multiple rules', () => {
            const { domain } = system.openDomain({});
            system.addRule(domain.domainId, 'rule1');
            system.addRule(domain.domainId, 'rule2');
            expect(domain.rules.length).toBe(2);
        });
        it('should reject missing domain', () => {
            const result = system.addRule('ghost', 'rule');
            expect(result.error).toBe('DOMAIN_NOT_FOUND');
        });
        it('should trigger ruleAdded hook', () => {
            const { domain } = system.openDomain({});
            let captured = null;
            system.registerHook('ruleAdded', (data) => { captured = data; });
            system.addRule(domain.domainId, 'r1');
            expect(captured.rule).toBe('r1');
            expect(captured.domainId).toBe(domain.domainId);
        });
    });

    describe('increasePower', () => {
        it('should increase power by default', () => {
            const { domain } = system.openDomain({});
            system.increasePower(domain.domainId);
            expect(domain.power).toBe(25);
        });
        it('should increase power by custom amount', () => {
            const { domain } = system.openDomain({});
            system.increasePower(domain.domainId, 50);
            expect(domain.power).toBe(70);
        });
        it('should promote to stable when threshold reached', () => {
            const { domain } = system.openDomain({});
            system.increasePower(domain.domainId, 100);
            expect(domain.status).toBe('stable');
        });
        it('should reject missing domain', () => {
            const result = system.increasePower('ghost', 5);
            expect(result.error).toBe('DOMAIN_NOT_FOUND');
        });
        it('should trigger powerIncreased hook', () => {
            const { domain } = system.openDomain({});
            let captured = null;
            system.registerHook('powerIncreased', (data) => { captured = data; });
            system.increasePower(domain.domainId, 10);
            expect(captured.newPower).toBe(30);
        });
    });

    describe('levelUpDomain', () => {
        it('should level up', () => {
            const { domain } = system.openDomain({});
            system.levelUpDomain(domain.domainId);
            expect(domain.level).toBe(2);
            system.levelUpDomain(domain.domainId);
            expect(domain.level).toBe(3);
        });
        it('should reject missing', () => {
            const result = system.levelUpDomain('ghost');
            expect(result.error).toBe('DOMAIN_NOT_FOUND');
        });
    });

    describe('eternizeDomain', () => {
        it('should set status to eternal', () => {
            const { domain } = system.openDomain({});
            system.eternizeDomain(domain.domainId);
            expect(domain.status).toBe('eternal');
        });
        it('should reject missing', () => {
            const result = system.eternizeDomain('ghost');
            expect(result.error).toBe('DOMAIN_NOT_FOUND');
        });
        it('should trigger domainEternalized hook', () => {
            const { domain } = system.openDomain({});
            let called = false;
            system.registerHook('domainEternalized', () => { called = true; });
            system.eternizeDomain(domain.domainId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDomainValue', () => {
        it('should calculate value', () => {
            const { domain } = system.openDomain({});
            system.addRule(domain.domainId, 'r1');
            system.addRule(domain.domainId, 'r2');
            // level=1 *100 + power=20 *2 + rules=2 *30 = 100 + 40 + 60 = 200
            expect(system.calculateDomainValue(domain.domainId)).toBe(200);
        });
        it('should scale with level', () => {
            const { domain } = system.openDomain({});
            system.levelUpDomain(domain.domainId);
            // level=2*100 + 20*2 + 0 = 240
            expect(system.calculateDomainValue(domain.domainId)).toBe(240);
        });
        it('should scale with power', () => {
            const { domain } = system.openDomain({});
            system.increasePower(domain.domainId, 10);
            // 1*100 + 30*2 + 0 = 160
            expect(system.calculateDomainValue(domain.domainId)).toBe(160);
        });
        it('should return 0 for missing', () => {
            expect(system.calculateDomainValue('ghost')).toBe(0);
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

        it('should execute default getDomain', () => {
            const result = system.executeTool('getDomain', { domainId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('domainOpened', () => count++);
            unregister();
            system.openDomain({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('domainOpened', () => { throw new Error('x'); });
            expect(() => system.openDomain({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDomains = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxDomains).toBe(50);
        });
        it('should not double evolve', () => {
            system.stats.totalDomains = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openDomain({});
            const json = system.toJSON();
            expect(json.domains.length).toBe(1);
            expect(json.stats.totalDomains).toBe(1);
        });
        it('should deserialize', () => {
            system.openDomain({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationDomain();
            newSys.fromJSON(json);
            expect(newSys.domains.size).toBe(1);
            expect(newSys.listByMaster('m1').length).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.openDomain({});
            system.openDomain({});
            const stats = system.getStats();
            expect(stats.domainCount).toBe(2);
            expect(stats.totalDomains).toBe(2);
        });
    });
});
