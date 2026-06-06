/**
 * CultivationData.test.js - 修真数据测试
 * V576 Iteration 19/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationData } from '../../../systems/ai/CultivationData.js';

describe('CultivationData', () => {
    let system;
    beforeEach(() => { system = new CultivationData(); });

    describe('collectData', () => {
        it('should create', () => {
            const { record } = system.collectData({ curatorId: 'c1', name: 'Spotted Cultivation Pattern' });
            expect(record.curatorId).toBe('c1');
            expect(record.name).toBe('Spotted Cultivation Pattern');
        });

        it('should default type to training', () => {
            const { record } = system.collectData({ name: 'A' });
            expect(record.type).toBe('training');
        });

        it('should default status to raw', () => {
            const { record } = system.collectData({ name: 'A' });
            expect(record.status).toBe('raw');
        });

        it('should default integrity', () => {
            const { record } = system.collectData({ name: 'A' });
            expect(record.integrity).toBe(50);
        });

        it('should support observation type', () => {
            const { record } = system.collectData({ name: 'A', type: 'observation' });
            expect(record.type).toBe('observation');
        });

        it('should support secret type', () => {
            const { record } = system.collectData({ name: 'A', type: 'secret' });
            expect(record.type).toBe('secret');
        });

        it('should trigger dataCollected hook', () => {
            let called = false;
            system.registerHook('dataCollected', () => { called = true; });
            system.collectData({ name: 'A' });
            expect(called).toBe(true);
        });
    });

    describe('getData', () => {
        it('should return', () => {
            const { record } = system.collectData({ name: 'A' });
            expect(system.getData(record.dataId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getData('ghost')).toBeNull(); });
    });

    describe('listData', () => {
        it('should list all', () => {
            system.collectData({ name: 'A' });
            system.collectData({ name: 'B' });
            expect(system.listData().length).toBe(2);
        });
    });

    describe('listByCurator', () => {
        it('should filter', () => {
            system.collectData({ curatorId: 'c1', name: 'A' });
            system.collectData({ curatorId: 'c2', name: 'B' });
            expect(system.listByCurator('c1').length).toBe(1);
        });
    });

    describe('listClassified', () => {
        it('should filter classified only', () => {
            const { record: r1 } = system.collectData({ name: 'A' });
            const { record: r2 } = system.collectData({ name: 'B' });
            system.classifyData(r2.dataId);
            const classified = system.listClassified();
            expect(classified.length).toBe(1);
            expect(classified[0].dataId).toBe(r2.dataId);
        });
    });

    describe('addRecord', () => {
        it('should add a record', () => {
            const { record } = system.collectData({ name: 'A' });
            const result = system.addRecord(record.dataId, { type: 'observation', value: 'X' });
            expect(result.success).toBe(true);
            expect(system.getData(record.dataId).records.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addRecord('ghost', { type: 'x' });
            expect(result.error).toBe('DATA_NOT_FOUND');
        });

        it('should trigger recordAdded hook', () => {
            const { record } = system.collectData({ name: 'A' });
            let called = false;
            system.registerHook('recordAdded', () => { called = true; });
            system.addRecord(record.dataId, { type: 'x' });
            expect(called).toBe(true);
        });
    });

    describe('increaseIntegrity', () => {
        it('should increase', () => {
            const { record } = system.collectData({ name: 'A' });
            system.increaseIntegrity(record.dataId, 10);
            expect(system.getData(record.dataId).integrity).toBe(60);
        });

        it('should default amount to 5', () => {
            const { record } = system.collectData({ name: 'A' });
            system.increaseIntegrity(record.dataId);
            expect(system.getData(record.dataId).integrity).toBe(55);
        });

        it('should reject missing', () => {
            const result = system.increaseIntegrity('ghost', 5);
            expect(result.error).toBe('DATA_NOT_FOUND');
        });

        it('should trigger integrityIncreased hook', () => {
            const { record } = system.collectData({ name: 'A' });
            let called = false;
            system.registerHook('integrityIncreased', () => { called = true; });
            system.increaseIntegrity(record.dataId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpData', () => {
        it('should level up', () => {
            const { record } = system.collectData({ name: 'A' });
            system.levelUpData(record.dataId);
            expect(system.getData(record.dataId).level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpData('ghost');
            expect(result.error).toBe('DATA_NOT_FOUND');
        });

        it('should trigger dataLeveledUp hook', () => {
            const { record } = system.collectData({ name: 'A' });
            let called = false;
            system.registerHook('dataLeveledUp', () => { called = true; });
            system.levelUpData(record.dataId);
            expect(called).toBe(true);
        });
    });

    describe('classifyData', () => {
        it('should classify', () => {
            const { record } = system.collectData({ name: 'A' });
            system.classifyData(record.dataId);
            expect(system.getData(record.dataId).status).toBe('classified');
        });

        it('should reject missing', () => {
            const result = system.classifyData('ghost');
            expect(result.error).toBe('DATA_NOT_FOUND');
        });

        it('should trigger dataClassified hook', () => {
            const { record } = system.collectData({ name: 'A' });
            let called = false;
            system.registerHook('dataClassified', () => { called = true; });
            system.classifyData(record.dataId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDataValue', () => {
        it('should calculate', () => {
            const { record } = system.collectData({ name: 'A' });
            // level 1 * 100 + integrity 50 * 2 + 0 records * 30 = 100 + 100 = 200
            expect(system.calculateDataValue(record.dataId)).toBe(200);
        });

        it('should factor in records and level', () => {
            const { record } = system.collectData({ name: 'A' });
            system.addRecord(record.dataId, { type: 'r1' });
            system.addRecord(record.dataId, { type: 'r2' });
            system.levelUpData(record.dataId);
            // level 2 * 100 + integrity 50 * 2 + 2 records * 30 = 200 + 100 + 60 = 360
            expect(system.calculateDataValue(record.dataId)).toBe(360);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDataValue('ghost')).toBe(0);
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

        it('should execute default getData', () => {
            const result = system.executeTool('getData', { dataId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default collectData', () => {
            const result = system.executeTool('collectData', { name: 'A' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dataCollected', () => count++);
            unregister();
            system.collectData({ name: 'A' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dataCollected', () => { throw new Error('x'); });
            expect(() => system.collectData({ name: 'A' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalData = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalData = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.collectData({ name: 'A' });
            const json = system.toJSON();
            expect(json.data.length).toBe(1);
        });
        it('should deserialize', () => {
            system.collectData({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationData();
            newSys.fromJSON(json);
            expect(newSys.data.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dataCount).toBe(0);
        });
    });
});
