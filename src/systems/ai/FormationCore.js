/**
 * FormationCore.js - 阵法核心管理系统
 * V313 Iteration 1/9 Round 4 - Battle Formation Core
 *
 * 融合6大设计系统:
 * - generic-agent: 阵法自进化 (formations gain levels)
 * - chatdev: 阵法角色协调 (positioning)
 * - nanobot: 阵法节点mesh
 * - claude-code: 阵法分析工具
 * - thunderbolt: 阵法持久化
 * - ruflo: 阵法Hook事件
 */

export class FormationCore {
    constructor(config = {}) {
        this.config = {
            maxFormationPositions: config.maxFormationPositions || 9,
            maxFormationsPerUser: config.maxFormationsPerUser || 50,
            basePowerBonus: config.basePowerBonus || 0.1,
            ...config
        };
        this.formations = new Map();
        this.formationTypes = new Map();
        this.positions = new Map();
        this.assignments = new Map();
        this.meshNodes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFormations: 0, totalAssignments: 0, evolutionCount: 0 };
        this._registerDefaultTypes();
        this._registerDefaultTools();
    }

    _registerDefaultTypes() {
        const types = [
            { typeId: 'three_talent', name: 'Three Talent Formation', positions: 3, element: 'neutral' },
            { typeId: 'four_symbols', name: 'Four Symbols Formation', positions: 4, element: 'earth' },
            { typeId: 'five_elements', name: 'Five Elements Formation', positions: 5, element: 'wood' },
            { typeId: 'bagua', name: 'Bagua Formation', positions: 8, element: 'metal' },
            { typeId: 'nine_palaces', name: 'Nine Palaces Formation', positions: 9, element: 'water' },
            { typeId: 'ten_thousand', name: 'Ten Thousand Formation', positions: 10, element: 'fire' }
        ];
        for (const t of types) this.formationTypes.set(t.typeId, t);
    }

    _registerDefaultTools() {
        this.registerTool('getFormation', (ctx) => this.getFormation(ctx.formationId));
        this.registerTool('listFormations', () => Array.from(this.formations.values()).map(f => ({...f})));
        this.registerTool('analyzeFormation', (ctx) => this.analyzeFormation(ctx.formationId));
    }

    createFormation(data) {
        const id = data.id || `for_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const typeId = data.typeId || 'three_talent';
        const type = this.formationTypes.get(typeId);
        if (!type) return { success: false, error: 'TYPE_NOT_FOUND' };
        const formation = {
            formationId: id, name: data.name || 'Unnamed Formation',
            typeId, ownerId: data.ownerId, level: 0, exp: 0, power: type.positions * this.config.basePowerBonus,
            positionMap: this._generatePositionMap(type.positions),
            createdAt: Date.now()
        };
        this.formations.set(id, formation);
        this.stats.totalFormations++;
        this._triggerHook('formationCreated', { formationId: id, typeId });
        return { success: true, formation };
    }

    _generatePositionMap(count) {
        const map = [];
        for (let i = 0; i < count; i++) {
            map.push({ positionId: `pos_${i}`, index: i, occupant: null, role: this._getRoleForIndex(i) });
        }
        return map;
    }

    _getRoleForIndex(i) {
        const roles = ['leader', 'flanker', 'flanker', 'support', 'support', 'reserve', 'reserve', 'reserve', 'reserve'];
        return roles[i] || 'reserve';
    }

    getFormation(id) { const f = this.formations.get(id); return f ? { ...f } : null; }
    listFormations() { return Array.from(this.formations.values()).map(f => ({ ...f })); }

    assignMember(formationId, positionIndex, memberId) {
        const formation = this.formations.get(formationId);
        if (!formation) return { success: false, error: 'FORMATION_NOT_FOUND' };
        if (positionIndex < 0 || positionIndex >= formation.positionMap.length) {
            return { success: false, error: 'INVALID_POSITION' };
        }
        const position = formation.positionMap[positionIndex];
        if (position.occupant && position.occupant !== memberId) {
            const prevOccupant = position.occupant;
            if (this.assignments.has(prevOccupant)) {
                const remaining = this.assignments.get(prevOccupant).filter(fid => fid !== formationId);
                if (remaining.length === 0) this.assignments.delete(prevOccupant);
                else this.assignments.set(prevOccupant, remaining);
            }
        }
        position.occupant = memberId;
        if (!this.assignments.has(memberId)) this.assignments.set(memberId, []);
        if (!this.assignments.get(memberId).includes(formationId)) {
            this.assignments.get(memberId).push(formationId);
        }
        this.stats.totalAssignments++;
        this._triggerHook('memberAssigned', { formationId, positionIndex, memberId });
        return { success: true, position: { ...position } };
    }

    unassignMember(formationId, positionIndex) {
        const formation = this.formations.get(formationId);
        if (!formation) return { success: false, error: 'FORMATION_NOT_FOUND' };
        if (positionIndex < 0 || positionIndex >= formation.positionMap.length) {
            return { success: false, error: 'INVALID_POSITION' };
        }
        const position = formation.positionMap[positionIndex];
        const memberId = position.occupant;
        position.occupant = null;
        if (memberId && this.assignments.has(memberId)) {
            const remaining = this.assignments.get(memberId).filter(fid => fid !== formationId);
            if (remaining.length === 0) this.assignments.delete(memberId);
            else this.assignments.set(memberId, remaining);
        }
        this._triggerHook('memberUnassigned', { formationId, positionIndex, memberId });
        return { success: true };
    }

    getMemberFormations(memberId) {
        return this.assignments.get(memberId) || [];
    }

    analyzeFormation(formationId) {
        const formation = this.formations.get(formationId);
        if (!formation) return { success: false, error: 'FORMATION_NOT_FOUND' };
        const filled = formation.positionMap.filter(p => p.occupant).length;
        const total = formation.positionMap.length;
        const completeness = filled / total;
        return {
            success: true,
            analysis: {
                formationId, filled, total, completeness,
                effectivePower: formation.power * completeness,
                leader: formation.positionMap[0]?.occupant || null,
                leadersPresent: !!formation.positionMap[0]?.occupant
            }
        };
    }

    addExp(formationId, amount) {
        const formation = this.formations.get(formationId);
        if (!formation) return { success: false, error: 'FORMATION_NOT_FOUND' };
        formation.exp += amount;
        const required = this._expRequired(formation.level);
        if (formation.exp >= required) {
            formation.level++;
            formation.exp -= required;
            formation.power *= 1.1;
            this._triggerHook('formationLeveledUp', { formationId, newLevel: formation.level });
        }
        this._triggerHook('expGained', { formationId, amount });
        return { success: true, formation: { ...formation } };
    }

    _expRequired(level) {
        return Math.floor(100 * Math.pow(1.5, level));
    }

    deleteFormation(formationId) {
        if (!this.formations.has(formationId)) return { success: false, error: 'FORMATION_NOT_FOUND' };
        const formation = this.formations.get(formationId);
        for (const pos of formation.positionMap) {
            if (pos.occupant && this.assignments.has(pos.occupant)) {
                const remaining = this.assignments.get(pos.occupant).filter(fid => fid !== formationId);
                if (remaining.length === 0) this.assignments.delete(pos.occupant);
                else this.assignments.set(pos.occupant, remaining);
            }
        }
        this.formations.delete(formationId);
        this._triggerHook('formationDeleted', { formationId });
        return { success: true };
    }

    addMeshNode(nodeId) {
        const node = { nodeId, power: 1, connections: new Set() };
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }

    connectMeshNodes(a, b) {
        const na = this.meshNodes.get(a);
        const nb = this.meshNodes.get(b);
        if (!na || !nb) return { success: false, error: 'NODE_NOT_FOUND' };
        na.connections.add(b);
        nb.connections.add(a);
        return { success: true };
    }

    registerTool(name, handler) { this.tools.set(name, { name, handler }); }
    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try { return { success: true, result: tool.handler(context || {}) }; }
        catch (e) { return { success: false, error: e.message }; }
    }
    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalFormations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.basePowerBonus = Math.min(0.5, this.config.basePowerBonus + 0.05);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            formations: Array.from(this.formations.entries()),
            formationTypes: Array.from(this.formationTypes.entries()),
            assignments: Array.from(this.assignments.entries()),
            meshNodes: Array.from(this.meshNodes.entries()),
            stats: this.stats, config: this.config
        };
    }

    fromJSON(data) {
        if (data.formations) this.formations = new Map(data.formations);
        if (data.formationTypes) this.formationTypes = new Map(data.formationTypes);
        if (data.assignments) this.assignments = new Map(data.assignments);
        if (data.meshNodes) {
            this.meshNodes = new Map(data.meshNodes.map(([k, v]) => [k, { ...v, connections: new Set(v.connections || []) }]));
        }
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return { ...this.stats, formationCount: this.formations.size, typeCount: this.formationTypes.size };
    }
}