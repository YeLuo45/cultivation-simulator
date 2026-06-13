/**
 * MirrorCoachEngine.js - 镜面教练引擎
 * V968 P-20260614-021 Iteration 21/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (chatdev multi-agent coach):
 * - 整合所有 player data layer 的输入
 * - 输出综合 coaching 建议
 * - 维护 per-player coaching 风格
 * - 提供 actionable advice
 */

export const COACHING_STYLES = ['supportive', 'analytical', 'challenging', 'gentle'];
export const COACHING_TRIGGERS = ['stuck', 'failing', 'excelling', 'bored', 'level_up', 'milestone'];

export class MirrorCoachEngine {
    constructor(config = {}) {
        this.config = { ...config };
        this.sessions = new Map();         // playerId -> { messages, advice, style }
        this.advice = new Map();           // playerId -> [{ advice, ts, context }]
        this.hooks = new Map();
        this.stats = { totalAdvice: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _initPlayer(playerId) {
        if (!this.sessions.has(playerId)) {
            this.sessions.set(playerId, { messages: [], style: 'supportive' });
        }
        if (!this.advice.has(playerId)) this.advice.set(playerId, []);
    }

    setStyle(playerId, style) {
        if (!COACHING_STYLES.includes(style)) return false;
        this._initPlayer(playerId);
        this.sessions.get(playerId).style = style;
        return true;
    }

    getStyle(playerId) {
        return this.sessions.get(playerId)?.style || 'supportive';
    }

    provideAdvice(playerId, trigger, context = {}) {
        if (!COACHING_TRIGGERS.includes(trigger)) return null;
        this._initPlayer(playerId);
        const session = this.sessions.get(playerId);
        const advice = this._generateAdvice(trigger, context, session.style);
        const entry = { advice, trigger, ts: Date.now(), context, style: session.style };
        this.advice.get(playerId).push(entry);
        if (this.advice.get(playerId).length > 100) this.advice.get(playerId).shift();
        this.stats.totalAdvice++;
        this._emit('adviceProvided', { playerId, entry });
        return entry;
    }

    _generateAdvice(trigger, context, style) {
        const map = {
            stuck: { supportive: '慢慢来，这种卡点很正常。', analytical: '分析一下卡点原因，资源/操作/策略？', challenging: '你真的试过所有方法了吗？', gentle: '休息一下再回来会更有效哦。' },
            failing: { supportive: '失败是成功之母，加油！', analytical: '失败率偏高，建议调整策略。', challenging: '不要怕失败，怕的是不总结。', gentle: '换个心情，下次会更好。' },
            excelling: { supportive: '你太棒了！', analytical: '当前胜率优秀，可适当提升难度。', challenging: '继续突破！', gentle: '保持节奏就很好。' },
            bored: { supportive: '试试新内容吧！', analytical: '可能需要新的挑战。', challenging: '别停下！', gentle: '做点别的事再回来。' },
            level_up: { supportive: '恭喜升级！', analytical: '境界提升，解锁新功能。', challenging: '别满足于此！', gentle: '慢慢享受新境界。' },
            milestone: { supportive: '里程碑达成！', analytical: '已记录里程碑数据。', challenging: '下一个目标更高！', gentle: '感谢你的努力。' },
        };
        return (map[trigger] && map[trigger][style]) || '继续努力！';
    }

    listAdvice(playerId) {
        return [...(this.advice.get(playerId) || [])];
    }

    recentAdvice(playerId, count = 5) {
        const all = this.listAdvice(playerId);
        return all.slice(-count);
    }

    isActionable(advice) {
        return advice && (advice.includes('建议') || advice.includes('试试') || advice.includes('调整'));
    }

    record(playerId, advice, accepted) {
        this._initPlayer(playerId);
        const entry = { advice, accepted, ts: Date.now() };
        this.advice.get(playerId).push(entry);
        return entry;
    }

    acceptanceRate(playerId) {
        const list = this.listAdvice(playerId).filter(a => a.accepted !== undefined);
        if (list.length === 0) return 0;
        return list.filter(a => a.accepted).length / list.length;
    }

    report(playerId) {
        return {
            playerId,
            style: this.getStyle(playerId),
            totalAdvice: this.advice.get(playerId)?.length || 0,
            acceptanceRate: this.acceptanceRate(playerId),
        };
    }

    reset() {
        this.sessions.clear();
        this.advice.clear();
        this.stats = { totalAdvice: 0 };
    }
}
