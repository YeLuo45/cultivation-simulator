/**
 * WarService.js - 万界战争系统
 * V234 Direction V: 万界战争系统
 * 
 * 本模块为RealmWarfareService的DDD合规包装器
 * 提供标准化的MCP工具接口:
 * - war.declare(worldId, reason) - 宣战某个世界
 * - war.mobilize(armySize) - 动员军队（消耗资源）
 * - war.battle() - 发起战斗（计算战果）
 * - war.result() - 获取战争结果（伤亡、战利品）
 * - war.query(worldId) - 查询世界战争状态
 */

export {
    createRealmWarfareService as createWarService,
    getRealmWarfareService as getWarService,
    REALM_WARFARE_CONFIG,
    UNIT_COUNTER_TABLE,
    WAR_STATES,
    createWarRecord,
    createArmyUnit
} from '../../combat/services/RealmWarfareService.js';