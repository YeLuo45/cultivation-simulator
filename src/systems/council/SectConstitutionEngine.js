/**
 * SectConstitutionEngine.js - 宗法引擎
 * V1005 P-20260614-165 Round 38 Iter 28/30
 */
export const CONSTITUTION_SECTIONS = ['preamble', 'role', 'voting', 'succession', 'discipline', 'treasury', 'expansion'];
export const AMENDMENT_TYPES = ['add', 'modify', 'remove', 'repeal'];

export class SectConstitutionEngine {
    constructor(config = {}) {
        this.config = { ...config };
        this.sections = new Map();   // section -> { content, version, amendments }
        this.amendments = [];        // [{ section, type, old, new, ts, proposer }]
        this.hooks = new Map();
        this.stats = { totalAmendments: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    setSection(section, content) {
        if (!CONSTITUTION_SECTIONS.includes(section)) return false;
        this.sections.set(section, { content, version: 1, amendments: [] });
        return true;
    }
    getSection(section) { return this.sections.get(section) || null; }
    hasSection(section) { return this.sections.has(section); }
    listSections() { return [...this.sections.entries()].map(([k, v]) => ({ section: k, ...v })); }

    amend(section, type, newContent, proposer = 'unknown') {
        if (!this.sections.has(section)) return false;
        if (!AMENDMENT_TYPES.includes(type)) return false;
        const sec = this.sections.get(section);
        const old = sec.content;
        let updated;
        if (type === 'add') updated = (old || '') + '\n' + newContent;
        else if (type === 'modify') updated = newContent;
        else if (type === 'remove') updated = (old || '').replace(newContent, '');
        else if (type === 'repeal') updated = '';
        const amendment = { section, type, old, new: updated, proposer, ts: Date.now() };
        sec.content = updated;
        sec.version++;
        sec.amendments.push(amendment);
        this.amendments.push(amendment);
        this.stats.totalAmendments++;
        this._emit('amended', amendment);
        return amendment;
    }

    versionOf(section) { return this.sections.get(section)?.version || 0; }
    amendmentsFor(section) { return [...(this.sections.get(section)?.amendments || [])]; }
    amendmentCount(section) { return this.sections.get(section)?.amendments.length || 0; }

    contains(section, query) {
        const sec = this.sections.get(section);
        if (!sec) return false;
        return (sec.content || '').includes(query);
    }
    wordCount(section) {
        const sec = this.sections.get(section);
        if (!sec) return 0;
        return (sec.content || '').split(/\s+/).filter(Boolean).length;
    }
    completeness() {
        return CONSTITUTION_SECTIONS.filter(s => this.hasSection(s)).length / CONSTITUTION_SECTIONS.length;
    }
    isComplete() { return this.completeness() === 1; }
    missingSections() { return CONSTITUTION_SECTIONS.filter(s => !this.hasSection(s)); }

    fullText() {
        return CONSTITUTION_SECTIONS
            .filter(s => this.hasSection(s))
            .map(s => `[${s}]\n${this.sections.get(s).content}`)
            .join('\n\n');
    }
    recentAmendments(n = 5) { return [...this.amendments].slice(-n).reverse(); }
    report() {
        return {
            totalSections: this.sections.size,
            completeness: this.completeness(),
            isComplete: this.isComplete(),
            totalAmendments: this.stats.totalAmendments,
            missing: this.missingSections(),
        };
    }
    reset() { this.sections.clear(); this.amendments = []; this.stats = { totalAmendments: 0 }; }
}
