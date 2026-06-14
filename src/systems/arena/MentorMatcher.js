/**
 * MentorMatcher.js - 师徒匹配器
 * V1035 P-20260614-195 Round 39 Iter 28/30
 */
export const MENTOR_STATUS = ['available', 'mentoring', 'busy', 'retired'];
export const RELATIONSHIP_STATUS = ['pending', 'active', 'completed', 'failed'];

export class MentorMatcher {
    constructor(config = {}) {
        this.config = { ...config };
        this.mentors = new Map();   // mentorId -> { id, name, specialty, level, status, students }
        this.relationships = new Map();  // relId -> { mentor, student, status, startedAt, endedAt, rating }
        this.byMentor = new Map();
        this.byStudent = new Map();
        this.hooks = new Map();
        this.stats = { totalMentors: 0, totalRelationships: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `mnt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    registerMentor(id, name, specialty, level = 1) {
        if (!id || !name) return null;
        this.mentors.set(id, { id, name, specialty, level, status: 'available', students: new Set() });
        this.stats.totalMentors++;
        return this.mentors.get(id);
    }
    get(id) { return this.mentors.get(id) || null; }
    listAll() { return [...this.mentors.values()]; }
    listBySpecialty(sp) { return this.listAll().filter(m => m.specialty === sp); }
    listByStatus(st) { return this.listAll().filter(m => m.status === st); }
    listAvailable() { return this.listByStatus('available'); }
    setStatus(id, status) {
        const m = this.mentors.get(id);
        if (!m) return false;
        if (!MENTOR_STATUS.includes(status)) return false;
        m.status = status;
        return true;
    }
    setSpecialty(id, specialty) {
        const m = this.mentors.get(id);
        if (!m) return false;
        m.specialty = specialty;
        return true;
    }
    findMentor(specialty, level = null) {
        let candidates = this.listAvailable();
        if (specialty) candidates = candidates.filter(m => m.specialty === specialty);
        if (level !== null) candidates = candidates.filter(m => m.level >= level);
        return candidates[0] || null;
    }
    findBest(specialty, level) {
        const list = this.findMentor(specialty, level);
        if (!list) return null;
        return this.listBySpecialty(specialty).filter(m => m.status === 'available').sort((a, b) => b.level - a.level)[0] || null;
    }

    match(mentorId, studentId) {
        const m = this.mentors.get(mentorId);
        if (!m) return null;
        if (m.status !== 'available') return null;
        const id = this._newId();
        const r = { id, mentor: mentorId, student: studentId, status: 'pending', startedAt: null, endedAt: null, rating: 0 };
        this.relationships.set(id, r);
        if (!this.byMentor.has(mentorId)) this.byMentor.set(mentorId, []);
        this.byMentor.get(mentorId).push(id);
        if (!this.byStudent.has(studentId)) this.byStudent.set(studentId, []);
        this.byStudent.get(studentId).push(id);
        this.stats.totalRelationships++;
        return r;
    }
    accept(relId) {
        const r = this.relationships.get(relId);
        if (!r) return false;
        if (r.status !== 'pending') return false;
        r.status = 'active';
        r.startedAt = Date.now();
        this.mentors.get(r.mentor).status = 'mentoring';
        this.mentors.get(r.mentor).students.add(r.student);
        return true;
    }
    end(relId, rating = 0) {
        const r = this.relationships.get(relId);
        if (!r) return false;
        r.status = 'completed';
        r.endedAt = Date.now();
        r.rating = rating;
        const m = this.mentors.get(r.mentor);
        if (m) {
            m.students.delete(r.student);
            if (m.students.size === 0) m.status = 'available';
        }
        return true;
    }
    fail(relId) {
        const r = this.relationships.get(relId);
        if (!r) return false;
        r.status = 'failed';
        r.endedAt = Date.now();
        return true;
    }
    forMentor(mentorId) { return (this.byMentor.get(mentorId) || []).map(id => this.relationships.get(id)).filter(Boolean); }
    forStudent(studentId) { return (this.byStudent.get(studentId) || []).map(id => this.relationships.get(id)).filter(Boolean); }
    studentCount(mentorId) { return this.mentors.get(mentorId)?.students.size || 0; }
    isMentoring(mentorId) { return this.mentors.get(mentorId)?.status === 'mentoring'; }
    activeFor(studentId) { return this.forStudent(studentId).filter(r => r.status === 'active'); }
    report() { return { totalMentors: this.stats.totalMentors, totalRelationships: this.stats.totalRelationships }; }
    reset() { this.mentors.clear(); this.relationships.clear(); this.byMentor.clear(); this.byStudent.clear(); this.stats = { totalMentors: 0, totalRelationships: 0 }; }
}
