/**
 * CultivationMCPSchema.test.js - ToolSchema 自动生成器测试
 * V861 Iteration 3/30 Round 35 - Direction F
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    SchemaRegistry, ParamSpec, ToolDescriptor,
    inferTypeFromValue, parseHandlerSignature, generateSchemaFromExamples,
    SCHEMA_TYPES, VALIDATION_RULES,
} from '../../../systems/ai/CultivationMCPSchema.js';

describe('CultivationMCPSchema', () => {
    describe('inferTypeFromValue', () => {
        it('should infer null', () => { expect(inferTypeFromValue(null).type).toBe('null'); });
        it('should infer integer', () => { expect(inferTypeFromValue(42).type).toBe('integer'); });
        it('should infer number (non-integer)', () => { expect(inferTypeFromValue(3.14).type).toBe('number'); });
        it('should infer string', () => { expect(inferTypeFromValue('hi').type).toBe('string'); });
        it('should infer boolean', () => { expect(inferTypeFromValue(true).type).toBe('boolean'); });
        it('should infer array of uniform type', () => {
            const r = inferTypeFromValue([1, 2, 3]);
            expect(r.type).toBe('array');
            expect(r.items.type).toBe('integer');
        });
        it('should infer empty array as string items', () => {
            const r = inferTypeFromValue([]);
            expect(r.type).toBe('array');
            expect(r.items.type).toBe('string');
        });
        it('should infer array of non-uniform type', () => {
            const r = inferTypeFromValue([1, 'x']);
            expect(r.type).toBe('array');
        });
        it('should infer object recursively', () => {
            const r = inferTypeFromValue({ a: 1, b: 'x' });
            expect(r.type).toBe('object');
            expect(r.properties.a.type).toBe('integer');
            expect(r.properties.b.type).toBe('string');
        });
    });

    describe('parseHandlerSignature', () => {
        it('should parse regular function', () => {
            function foo(a, b) { return a + b; }
            const sig = parseHandlerSignature(foo);
            expect(sig.params).toEqual(['a', 'b']);
            expect(sig.isAsync).toBe(false);
        });

        it('should parse arrow function', () => {
            const foo = (a, b) => a + b;
            const sig = parseHandlerSignature(foo);
            expect(sig.params).toEqual(['a', 'b']);
        });

        it('should parse async function', () => {
            async function foo(a) { return a; }
            const sig = parseHandlerSignature(foo);
            expect(sig.isAsync).toBe(true);
            expect(sig.params).toEqual(['a']);
        });

        it('should return error for non-function', () => {
            const sig = parseHandlerSignature('not a function');
            expect(sig.error).toBe('NOT_A_FUNCTION');
        });

        it('should handle destructured parameter', () => {
            const foo = ({ a, b }) => a + b;
            const sig = parseHandlerSignature(foo);
            expect(sig.params.length).toBeGreaterThan(0);
        });

        it('should handle zero params', () => {
            const foo = () => 1;
            const sig = parseHandlerSignature(foo);
            expect(sig.params).toEqual([]);
        });
    });

    describe('generateSchemaFromExamples', () => {
        it('should generate from single example', () => {
            const s = generateSchemaFromExamples('foo', [{ params: { name: 'alice', age: 30 } }]);
            expect(s.name).toBe('foo');
            expect(s.inputSchema.properties.name.type).toBe('string');
            expect(s.inputSchema.properties.age.type).toBe('integer');
        });

        it('should handle empty examples', () => {
            const s = generateSchemaFromExamples('foo', []);
            expect(s.name).toBe('foo');
        });

        it('should treat example as direct params object', () => {
            const s = generateSchemaFromExamples('foo', [{ x: 1 }]);
            expect(s.inputSchema.properties.x.type).toBe('integer');
        });
    });

    describe('ParamSpec', () => {
        it('should convert to JSON schema', () => {
            const p = new ParamSpec({ type: 'string', name: 'name', required: true, maxLength: 50, minLength: 1, pattern: '^[a-z]+$' });
            const s = p.toJSONSchema();
            expect(s.type).toBe('string');
            expect(s.maxLength).toBe(50);
            expect(s.minLength).toBe(1);
            expect(s.pattern).toBe('^[a-z]+$');
        });

        it('should include items for array', () => {
            const p = new ParamSpec({ type: 'array', items: { type: 'string' } });
            const s = p.toJSONSchema();
            expect(s.items.type).toBe('string');
        });

        it('should include properties for object', () => {
            const p = new ParamSpec({ type: 'object', properties: { x: new ParamSpec({ type: 'number' }) } });
            const s = p.toJSONSchema();
            expect(s.properties.x.type).toBe('number');
        });
    });

    describe('ToolDescriptor', () => {
        it('should build JSON schema with required array', () => {
            const td = new ToolDescriptor({
                name: 'test',
                parameters: [
                    new ParamSpec({ type: 'string', name: 'a', required: true }),
                    new ParamSpec({ type: 'number', name: 'b' }),
                ],
            });
            const s = td.toJSONSchema();
            expect(s.inputSchema.required).toEqual(['a']);
            expect(s.inputSchema.properties.a.type).toBe('string');
            expect(s.inputSchema.properties.b.type).toBe('number');
        });
    });

    describe('SchemaRegistry', () => {
        let reg;
        beforeEach(() => { reg = new SchemaRegistry(); });

        it('should register a schema', () => {
            const r = reg.register('foo', { description: 'foo tool', parameters: [] });
            expect(r.success).toBe(true);
            expect(reg.count()).toBe(1);
        });

        it('should unregister a schema', () => {
            reg.register('foo', { description: 'f' });
            expect(reg.unregister('foo').success).toBe(true);
            expect(reg.count()).toBe(0);
        });

        it('should generate from handler', () => {
            function add(a, b) { return a + b; }
            const r = reg.generateFromHandler('add', add, { description: 'Add numbers' });
            expect(r.success).toBe(true);
            expect(r.schema.inputSchema.properties.a).toBeDefined();
        });

        it('should generate from examples', () => {
            const r = reg.generateFromExamples('foo', [{ params: { x: 1, y: 'hello' } }]);
            expect(r.success).toBe(true);
        });

        it('should list schemas', () => {
            reg.register('a', { description: 'a' });
            reg.register('b', { description: 'b' });
            expect(reg.list()).toEqual(['a', 'b']);
        });

        it('should filter by category', () => {
            reg.register('a', { description: 'a', category: 'combat' });
            reg.register('b', { description: 'b', category: 'trade' });
            expect(reg.listByCategory('combat')).toEqual(['a']);
        });

        it('should validate correct params', () => {
            reg.register('test', {
                parameters: [
                    new ParamSpec({ type: 'string', name: 'name', required: true }),
                ],
            });
            const r = reg.validateParams('test', { name: 'alice' });
            expect(r.valid).toBe(true);
        });

        it('should reject missing required', () => {
            reg.register('test', {
                parameters: [new ParamSpec({ type: 'string', name: 'name', required: true })],
            });
            const r = reg.validateParams('test', {});
            expect(r.valid).toBe(false);
            expect(r.error).toBe('MISSING_REQUIRED');
        });

        it('should reject non-object params', () => {
            reg.register('test', { parameters: [] });
            const r = reg.validateParams('test', null);
            expect(r.valid).toBe(false);
        });

        it('should reject unknown schema', () => {
            const r = reg.validateParams('unknown', {});
            expect(r.valid).toBe(false);
            expect(r.error).toBe('SCHEMA_NOT_FOUND');
        });

        it('should reject wrong string type', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'string', name: 'x' })] });
            const r = reg.validateParams('test', { x: 123 });
            expect(r.valid).toBe(false);
            expect(r.error).toBe('TYPE_MISMATCH');
        });

        it('should reject wrong number type', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'number', name: 'x' })] });
            const r = reg.validateParams('test', { x: '1' });
            expect(r.valid).toBe(false);
        });

        it('should reject wrong integer type', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'integer', name: 'x' })] });
            const r = reg.validateParams('test', { x: 1.5 });
            expect(r.valid).toBe(false);
        });

        it('should reject wrong boolean type', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'boolean', name: 'x' })] });
            const r = reg.validateParams('test', { x: 'true' });
            expect(r.valid).toBe(false);
        });

        it('should reject wrong object type', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'object', name: 'x' })] });
            const r = reg.validateParams('test', { x: 'oops' });
            expect(r.valid).toBe(false);
        });

        it('should reject wrong array type', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'array', name: 'x' })] });
            const r = reg.validateParams('test', { x: {} });
            expect(r.valid).toBe(false);
        });

        it('should reject too long string', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'string', name: 'x', maxLength: 5 })] });
            const r = reg.validateParams('test', { x: 'abcdef' });
            expect(r.valid).toBe(false);
            expect(r.error).toBe('TOO_LONG');
        });

        it('should reject too short string', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'string', name: 'x', minLength: 3 })] });
            const r = reg.validateParams('test', { x: 'ab' });
            expect(r.valid).toBe(false);
        });

        it('should reject too small number', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'number', name: 'x', minimum: 10 })] });
            const r = reg.validateParams('test', { x: 5 });
            expect(r.valid).toBe(false);
        });

        it('should reject too large number', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'number', name: 'x', maximum: 10 })] });
            const r = reg.validateParams('test', { x: 20 });
            expect(r.valid).toBe(false);
        });

        it('should reject enum violation', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'string', name: 'x', enum: ['a', 'b'] })] });
            const r = reg.validateParams('test', { x: 'c' });
            expect(r.valid).toBe(false);
            expect(r.error).toBe('ENUM_VIOLATION');
        });

        it('should reject pattern violation', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'string', name: 'x', pattern: '^[0-9]+$' })] });
            const r = reg.validateParams('test', { x: 'abc' });
            expect(r.valid).toBe(false);
            expect(r.error).toBe('PATTERN_MISMATCH');
        });

        it('should allow enum match', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'string', name: 'x', enum: ['a', 'b'] })] });
            const r = reg.validateParams('test', { x: 'a' });
            expect(r.valid).toBe(true);
        });

        it('should allow pattern match', () => {
            reg.register('test', { parameters: [new ParamSpec({ type: 'string', name: 'x', pattern: '^[0-9]+$' })] });
            const r = reg.validateParams('test', { x: '123' });
            expect(r.valid).toBe(true);
        });

        it('should export all', () => {
            reg.register('a', { description: 'A' });
            reg.register('b', { description: 'B' });
            const all = reg.exportAll();
            expect(Object.keys(all).length).toBe(2);
        });

        it('should export OpenAI format', () => {
            reg.register('test', { description: 'Test', parameters: [] });
            const tools = reg.exportOpenAIFormat();
            expect(tools[0].type).toBe('function');
            expect(tools[0].function.name).toBe('test');
        });

        it('should export Anthropic format', () => {
            reg.register('test', { description: 'Test', parameters: [] });
            const tools = reg.exportAnthropicFormat();
            expect(tools[0].name).toBe('test');
            expect(tools[0].input_schema).toBeDefined();
        });

        it('should serialize and restore', () => {
            reg.register('test', { description: 'Test', parameters: [new ParamSpec({ type: 'string', name: 'x' })] });
            const json = reg.toJSON();
            const r2 = new SchemaRegistry();
            const r = r2.fromJSON(json);
            expect(r.success).toBe(true);
            expect(r2.count()).toBe(1);
        });

        it('should report stats', () => {
            reg.register('a', { description: 'A' });
            reg.validateParams('a', {});
            const stats = reg.getStats();
            expect(stats.schemaCount).toBe(1);
            expect(stats.validations).toBe(1);
        });
    });

    describe('module exports', () => {
        it('should export SCHEMA_TYPES', () => {
            expect(SCHEMA_TYPES.STRING).toBe('string');
            expect(SCHEMA_TYPES.NUMBER).toBe('number');
        });

        it('should export VALIDATION_RULES', () => {
            expect(VALIDATION_RULES.maxDepth).toBe(5);
        });
    });
});
