/**
 * CultivationMCPSchema.js - 修真 MCP ToolSchema 自动生成器
 * V861 P-20260613-002 Iteration 3/30 Round 35 - Direction F: ToolSchema
 *
 * 通过函数签名反射自动生成 JSON Schema 工具描述
 * - 核心 API: generateSchema / registerSchema / validateParams / introspect
 * - 数据结构: { name, description, parameters, handler, permission, schema, examples }
 * - 配置: SCHEMA_TYPES, VALIDATION_RULES
 */

export const SCHEMA_TYPES = {
    STRING: 'string',
    NUMBER: 'number',
    INTEGER: 'integer',
    BOOLEAN: 'boolean',
    OBJECT: 'object',
    ARRAY: 'array',
    NULL: 'null',
};

export const VALIDATION_RULES = {
    maxDepth: 5,
    maxStringLength: 10000,
    maxArrayLength: 1000,
    maxProperties: 100,
    allowAdditionalProperties: true,
};

/**
 * ParamSpec - 参数规格描述
 */
export class ParamSpec {
    constructor({ name, type, description = '', required = false, default: def = undefined, enum: enumValues, items, properties, minimum: min, maximum: max, minLength, maxLength, pattern } = {}) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.required = required;
        this.default = def;
        if (enumValues) this.enum = enumValues;
        if (items) this.items = items;
        if (properties) this.properties = properties;
        if (min !== undefined) this.minimum = min;
        if (max !== undefined) this.maximum = max;
        if (minLength !== undefined) this.minLength = minLength;
        if (maxLength !== undefined) this.maxLength = maxLength;
        if (pattern) this.pattern = pattern;
    }

    toJSONSchema() {
        const schema = { type: this.type };
        if (this.description) schema.description = this.description;
        if (this.enum) schema.enum = this.enum;
        if (this.items) schema.items = this.items.toJSONSchema ? this.items.toJSONSchema() : this.items;
        if (this.properties) {
            schema.properties = {};
            for (const [k, v] of Object.entries(this.properties)) {
                schema.properties[k] = v.toJSONSchema ? v.toJSONSchema() : v;
            }
        }
        if (this.minimum !== undefined) schema.minimum = this.minimum;
        if (this.maximum !== undefined) schema.maximum = this.maximum;
        if (this.minLength !== undefined) schema.minLength = this.minLength;
        if (this.maxLength !== undefined) schema.maxLength = this.maxLength;
        if (this.pattern) schema.pattern = this.pattern;
        return schema;
    }
}

/**
 * ToolDescriptor - 工具描述符
 */
export class ToolDescriptor {
    constructor({ name, description, parameters = [], examples = [], permission = 'read', category = 'general' } = {}) {
        this.name = name;
        this.description = description;
        this.parameters = parameters;
        this.examples = examples;
        this.permission = permission;
        this.category = category;
    }

    toJSONSchema() {
        const properties = {};
        const required = [];
        for (const p of this.parameters) {
            properties[p.name] = { ...p.toJSONSchema(), description: p.description };
            if (p.default === undefined) properties[p.name].default = p.default;
            if (p.required) required.push(p.name);
        }
        return {
            name: this.name,
            description: this.description,
            inputSchema: {
                type: 'object',
                properties,
                required,
                additionalProperties: VALIDATION_RULES.allowAdditionalProperties,
            },
            examples: this.examples,
            permission: this.permission,
            category: this.category,
        };
    }
}

/**
 * inferTypeFromValue - 根据示例值推断 JSON Schema 类型
 */
export function inferTypeFromValue(value) {
    if (value === null) return { type: SCHEMA_TYPES.NULL };
    if (Array.isArray(value)) {
        const itemTypes = value.length > 0 ? value.slice(0, 3).map(inferTypeFromValue) : [{ type: SCHEMA_TYPES.STRING }];
        const firstType = itemTypes[0].type;
        const uniform = itemTypes.every(t => t.type === firstType);
        return { type: SCHEMA_TYPES.ARRAY, items: uniform ? { type: firstType } : { type: SCHEMA_TYPES.STRING } };
    }
    if (typeof value === 'number') {
        return Number.isInteger(value) ? { type: SCHEMA_TYPES.INTEGER } : { type: SCHEMA_TYPES.NUMBER };
    }
    if (typeof value === 'boolean') return { type: SCHEMA_TYPES.BOOLEAN };
    if (typeof value === 'string') return { type: SCHEMA_TYPES.STRING };
    if (typeof value === 'object') {
        const properties = {};
        for (const [k, v] of Object.entries(value)) properties[k] = inferTypeFromValue(v);
        return { type: SCHEMA_TYPES.OBJECT, properties };
    }
    return { type: SCHEMA_TYPES.STRING };
}

/**
 * parseHandlerSignature - 解析 handler 函数签名
 * 支持的格式：
 *   function foo(a, b) {}
 *   const foo = (a, b) => {}
 *   async function foo({a, b}) {}
 */
export function parseHandlerSignature(handler) {
    if (typeof handler !== 'function') {
        return { params: [], isAsync: false, error: 'NOT_A_FUNCTION' };
    }
    const src = handler.toString();
    const isAsync = /async\s+/.test(src);
    const arrowMatch = src.match(/^(?:async\s+)?\(?([^)=]*)\)?\s*=>/);
    const funcMatch = src.match(/^(?:async\s+)?function\s*(?:\w+)?\s*\(([^)]*)\)/);
    const paramStr = arrowMatch ? arrowMatch[1] : (funcMatch ? funcMatch[1] : '');
    const params = paramStr.split(',').map(s => s.trim()).filter(s => s.length > 0).map(s => s.replace(/[{}=]/g, '').trim());
    return { params, isAsync, raw: src };
}

/**
 * generateSchemaFromExamples - 通过示例生成 schema
 */
export function generateSchemaFromExamples(name, examples) {
    if (!Array.isArray(examples) || examples.length === 0) {
        return new ToolDescriptor({ name, parameters: [] }).toJSONSchema();
    }
    const sample = examples[0].params || examples[0];
    const properties = {};
    for (const [k, v] of Object.entries(sample)) {
        const inferred = inferTypeFromValue(v);
        properties[k] = { ...inferred, description: `Parameter ${k}` };
    }
    return {
        name,
        description: `Auto-generated schema for ${name}`,
        inputSchema: {
            type: 'object',
            properties,
            required: Object.keys(sample),
            additionalProperties: VALIDATION_RULES.allowAdditionalProperties,
        },
        examples: examples.map(e => e.params || e),
        permission: 'read',
        category: 'auto',
    };
}

/**
 * SchemaRegistry - ToolSchema 注册表
 */
export class SchemaRegistry {
    constructor() {
        /** @type {Map<string, ToolDescriptor>} */
        this.descriptors = new Map();
        this.stats = { schemasGenerated: 0, validations: 0, validationFailures: 0 };
    }

    register(name, descriptor) {
        let td = descriptor;
        if (!(td instanceof ToolDescriptor)) {
            td = new ToolDescriptor({ name, ...descriptor });
        }
        this.descriptors.set(name, td);
        this.stats.schemasGenerated++;
        return { success: true };
    }

    unregister(name) { return { success: this.descriptors.delete(name) }; }
    get(name) { return this.descriptors.get(name) || null; }
    list() { return Array.from(this.descriptors.keys()); }
    listByCategory(cat) {
        return Array.from(this.descriptors.values()).filter(d => d.category === cat).map(d => d.name);
    }
    count() { return this.descriptors.size; }

    generateFromHandler(name, handler, options = {}) {
        const sig = parseHandlerSignature(handler);
        if (sig.error) return { success: false, error: sig.error };
        const parameters = sig.params.map(p => new ParamSpec({ type: SCHEMA_TYPES.STRING, name: p, description: `Parameter ${p}`, required: false }));
        const td = new ToolDescriptor({
            name,
            description: options.description || `Handler for ${name}`,
            parameters,
            permission: options.permission || 'read',
            category: options.category || 'auto',
        });
        this.descriptors.set(name, td);
        this.stats.schemasGenerated++;
        return { success: true, schema: td.toJSONSchema() };
    }

    generateFromExamples(name, examples) {
        const schema = generateSchemaFromExamples(name, examples);
        const td = new ToolDescriptor({
            name,
            description: schema.description,
            parameters: Object.entries(schema.inputSchema.properties).map(([k, v]) => new ParamSpec({ name: k, type: v.type, description: v.description })),
            examples: schema.examples,
            permission: schema.permission,
            category: schema.category,
        });
        this.descriptors.set(name, td);
        this.stats.schemasGenerated++;
        return { success: true, schema: td.toJSONSchema() };
    }

    validateParams(name, params) {
        this.stats.validations++;
        const td = this.descriptors.get(name);
        if (!td) return { valid: false, error: 'SCHEMA_NOT_FOUND' };
        if (typeof params !== 'object' || params === null) {
            this.stats.validationFailures++;
            return { valid: false, error: 'PARAMS_NOT_OBJECT' };
        }
        for (const p of td.parameters) {
            if (p.required && params[p.name] === undefined) {
                this.stats.validationFailures++;
                return { valid: false, error: 'MISSING_REQUIRED', param: p.name };
            }
            if (params[p.name] !== undefined) {
                const v = params[p.name];
                if (p.type === SCHEMA_TYPES.STRING && typeof v !== 'string') {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TYPE_MISMATCH', param: p.name, expected: 'string', actual: typeof v };
                }
                if (p.type === SCHEMA_TYPES.NUMBER && typeof v !== 'number') {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TYPE_MISMATCH', param: p.name, expected: 'number', actual: typeof v };
                }
                if (p.type === SCHEMA_TYPES.INTEGER && (typeof v !== 'number' || !Number.isInteger(v))) {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TYPE_MISMATCH', param: p.name, expected: 'integer', actual: typeof v };
                }
                if (p.type === SCHEMA_TYPES.BOOLEAN && typeof v !== 'boolean') {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TYPE_MISMATCH', param: p.name, expected: 'boolean', actual: typeof v };
                }
                if (p.type === SCHEMA_TYPES.OBJECT && (typeof v !== 'object' || Array.isArray(v))) {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TYPE_MISMATCH', param: p.name, expected: 'object', actual: typeof v };
                }
                if (p.type === SCHEMA_TYPES.ARRAY && !Array.isArray(v)) {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TYPE_MISMATCH', param: p.name, expected: 'array', actual: typeof v };
                }
                if (typeof v === 'string' && p.maxLength !== undefined && v.length > p.maxLength) {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TOO_LONG', param: p.name, maxLength: p.maxLength };
                }
                if (typeof v === 'string' && p.minLength !== undefined && v.length < p.minLength) {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TOO_SHORT', param: p.name, minLength: p.minLength };
                }
                if (typeof v === 'number' && p.minimum !== undefined && v < p.minimum) {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TOO_SMALL', param: p.name, minimum: p.minimum };
                }
                if (typeof v === 'number' && p.maximum !== undefined && v > p.maximum) {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'TOO_LARGE', param: p.name, maximum: p.maximum };
                }
                if (p.enum && !p.enum.includes(v)) {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'ENUM_VIOLATION', param: p.name, allowed: p.enum };
                }
                if (p.pattern && typeof v === 'string' && !new RegExp(p.pattern).test(v)) {
                    this.stats.validationFailures++;
                    return { valid: false, error: 'PATTERN_MISMATCH', param: p.name, pattern: p.pattern };
                }
            }
        }
        return { valid: true };
    }

    exportAll() {
        const all = {};
        for (const [name, td] of this.descriptors) {
            all[name] = td.toJSONSchema();
        }
        return all;
    }

    exportOpenAIFormat() {
        const tools = [];
        for (const td of this.descriptors.values()) {
            const schema = td.toJSONSchema();
            tools.push({
                type: 'function',
                function: {
                    name: td.name,
                    description: schema.description,
                    parameters: schema.inputSchema,
                },
            });
        }
        return tools;
    }

    exportAnthropicFormat() {
        const tools = [];
        for (const td of this.descriptors.values()) {
            const schema = td.toJSONSchema();
            tools.push({
                name: td.name,
                description: schema.description,
                input_schema: schema.inputSchema,
            });
        }
        return tools;
    }

    getStats() {
        return { ...this.stats, schemaCount: this.descriptors.size };
    }

    toJSON() {
        const data = {};
        for (const [name, td] of this.descriptors) {
            data[name] = {
                description: td.description,
                parameters: td.parameters.map(p => ({ name: p.name, type: p.type, description: p.description, required: p.required, default: p.default, enum: p.enum, minimum: p.minimum, maximum: p.maximum, minLength: p.minLength, maxLength: p.maxLength, pattern: p.pattern })),
                examples: td.examples,
                permission: td.permission,
                category: td.category,
            };
        }
        return data;
    }

    fromJSON(data) {
        for (const [name, d] of Object.entries(data)) {
            const parameters = (d.parameters || []).map(p => new ParamSpec(p));
            const td = new ToolDescriptor({ name, ...d, parameters });
            this.descriptors.set(name, td);
        }
        return { success: true, count: this.descriptors.size };
    }
}

export default SchemaRegistry;
