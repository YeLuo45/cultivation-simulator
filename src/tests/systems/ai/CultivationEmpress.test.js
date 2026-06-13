/**
 * CultivationEmpress.test.js - 修真皇后系统测试
 * V731 Iteration 24/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEmpress } from '../../../systems/ai/CultivationEmpress.js';

describe('CultivationEmpress', () => {
    let system;
    beforeEach(() => { system = new CultivationEmpress(); });

    describe('recruitEmpress', () => {
        it('should recruit an empress', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'Divine Empress', type: 'divine' });
            expect(empress.empireId).toBe('e1');
            expect(empress.name).toBe('Divine Empress');
            expect(empress.type).toBe('divine');
        });

        it('should default type to divine', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            expect(empress.type).toBe('divine');
        });

        it('should default dignity to baseDignity', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            expect(empress.dignity).toBe(20);
        });

        it('should start with novice status and level 1', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            expect(empress.status).toBe('novice');
            expect(empress.level).toBe(1);
        });

        it('should start with empty gifts', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            expect(empress.gifts).toEqual([]);
        });

        it('should support custom dignity and gifts', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E', dignity: 99, gifts: ['sword'] });
            expect(empress.dignity).toBe(99);
            expect(empress.gifts).toEqual(['sword']);
        });

        it('should support righteous type', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E', type: 'righteous' });
            expect(empress.type).toBe('righteous');
        });

        it('should support elegant type', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E', type: 'elegant' });
            expect(empress.type).toBe('elegant');
        });

        it('should trigger empressRecruited hook', () => {
            let called = false;
            system.registerHook('empressRecruited', () => { called = true; });
            system.recruitEmpress({ empireId: 'e1', name: 'E' });
            expect(called).toBe(true);
        });

        it('should accept custom empressId', () => {
            const { empress } = system.recruitEmpress({ empressId: 'custom-id', empireId: 'e1', name: 'E' });
            expect(empress.empressId).toBe('custom-id');
        });
    });

    describe('getEmpress', () => {
        it('should return empress', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            const found = system.getEmpress(empress.empressId);
            expect(found).not.toBeNull();
            expect(found.empressId).toBe(empress.empressId);
        });

        it('should return null for missing', () => {
            expect(system.getEmpress('ghost')).toBeNull();
        });
    });

    describe('listEmpresses', () => {
        it('should list all', () => {
            system.recruitEmpress({ empireId: 'e1', name: 'A' });
            system.recruitEmpress({ empireId: 'e2', name: 'B' });
            expect(system.listEmpresses().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listEmpresses()).toEqual([]);
        });
    });

    describe('listByEmpire', () => {
        it('should filter by empire', () => {
            system.recruitEmpress({ empireId: 'e1', name: 'A' });
            system.recruitEmpress({ empireId: 'e2', name: 'B' });
            system.recruitEmpress({ empireId: 'e1', name: 'C' });
            expect(system.listByEmpire('e1').length).toBe(2);
        });

        it('should return empty for unknown empire', () => {
            system.recruitEmpress({ empireId: 'e1', name: 'A' });
            expect(system.listByEmpire('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { empress: a } = system.recruitEmpress({ empireId: 'e1', name: 'A' });
            system.recruitEmpress({ empireId: 'e1', name: 'B' });
            system.legendEmpress(a.empressId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitEmpress({ empireId: 'e1', name: 'A' });
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addGift', () => {
        it('should add gift', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            system.addGift(empress.empressId, 'jade-pendant');
            expect(empress.gifts).toContain('jade-pendant');
        });

        it('should add multiple gifts', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            system.addGift(empress.empressId, 'g1');
            system.addGift(empress.empressId, 'g2');
            expect(empress.gifts.length).toBe(2);
        });

        it('should reject missing empress', () => {
            const result = system.addGift('ghost', 'gift');
            expect(result.error).toBe('EMPRESS_NOT_FOUND');
        });

        it('should trigger giftAdded hook', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            let called = false;
            system.registerHook('giftAdded', () => { called = true; });
            system.addGift(empress.empressId, 'gift1');
            expect(called).toBe(true);
        });
    });

    describe('raiseDignity', () => {
        it('should raise by default 5', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            system.raiseDignity(empress.empressId);
            expect(empress.dignity).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            system.raiseDignity(empress.empressId, 50);
            expect(empress.dignity).toBe(70);
        });

        it('should reject missing empress', () => {
            const result = system.raiseDignity('ghost', 10);
            expect(result.error).toBe('EMPRESS_NOT_FOUND');
        });

        it('should trigger dignityRaised hook', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            let called = false;
            system.registerHook('dignityRaised', () => { called = true; });
            system.raiseDignity(empress.empressId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEmpress', () => {
        it('should increment level', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            system.levelUpEmpress(empress.empressId);
            expect(empress.level).toBe(2);
        });

        it('should increment level multiple times', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            system.levelUpEmpress(empress.empressId);
            system.levelUpEmpress(empress.empressId);
            system.levelUpEmpress(empress.empressId);
            expect(empress.level).toBe(4);
        });

        it('should reject missing empress', () => {
            const result = system.levelUpEmpress('ghost');
            expect(result.error).toBe('EMPRESS_NOT_FOUND');
        });

        it('should trigger empressLeveledUp hook', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            let called = false;
            system.registerHook('empressLeveledUp', () => { called = true; });
            system.levelUpEmpress(empress.empressId);
            expect(called).toBe(true);
        });
    });

    describe('legendEmpress', () => {
        it('should set status to legendary', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            system.legendEmpress(empress.empressId);
            expect(empress.status).toBe('legendary');
        });

        it('should reject missing empress', () => {
            const result = system.legendEmpress('ghost');
            expect(result.error).toBe('EMPRESS_NOT_FOUND');
        });

        it('should trigger empressLegendized hook', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            let called = false;
            system.registerHook('empressLegendized', () => { called = true; });
            system.legendEmpress(empress.empressId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEmpressValue', () => {
        it('should calculate base value', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            // level=1 * 100 + dignity=20 * 2 + gifts=0 * 30 = 140
            expect(system.calculateEmpressValue(empress.empressId)).toBe(140);
        });

        it('should account for level and gifts', () => {
            const { empress } = system.recruitEmpress({ empireId: 'e1', name: 'E' });
            system.levelUpEmpress(empress.empressId); // 2
            system.levelUpEmpress(empress.empressId); // 3
            system.addGift(empress.empressId, 'g1');
            system.addGift(empress.empressId, 'g2');
            system.raiseDignity(empress.empressId, 10); // 30
            // level=3 * 100 + dignity=30 * 2 + gifts=2 * 30 = 300+60+60=420
            expect(system.calculateEmpressValue(empress.empressId)).toBe(420);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEmpressValue('ghost')).toBe(0);
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

        it('should execute default getEmpress', () => {
            const result = system.executeTool('getEmpress', { empressId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('empressRecruited', () => count++);
            unregister();
            system.recruitEmpress({ empireId: 'e1', name: 'E' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('empressRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitEmpress({ empireId: 'e1', name: 'E' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEmpresses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEmpresses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitEmpress({ empireId: 'e1', name: 'E' });
            const json = system.toJSON();
            expect(json.empresses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitEmpress({ empireId: 'e1', name: 'E' });
            const json = system.toJSON();
            const newSys = new CultivationEmpress();
            newSys.fromJSON(json);
            expect(newSys.empresses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.empressCount).toBe(0);
        });
    });
});
