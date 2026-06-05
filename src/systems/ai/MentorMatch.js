/**
 * MentorMatch.js - 师徒匹配系统
 * V345 Iteration 6/9 Round 7
 */
export class MentorMatch {
    constructor(config = {}) {
        this.config = { maxMatches: config.maxMatches || 50, ...config };
        this.mentors = new Map();
        this.students = new Map();
        this.matches = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMatches: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMentor', (ctx) => this.getMentor(ctx.mentorId));
        this.registerTool('listMentors', () => Array.from(this.mentors.values()).map(m => ({...m})));
    }

    registerMentor(data) {
        const id = data.id || `mn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mentor = { mentorId: id, name: data.name || 'Mentor', specialty: data.specialty || 'general', level: data.level || 10, students: [], maxStudents: data.maxStudents || 3 };
        this.mentors.set(id, mentor);
        return { success: true, mentor };
    }

    getMentor(id) { return this.mentors.get(id) ? { ...this.mentors.get(id) } : null; }
    listMentors() { return Array.from(this.mentors.values()).map(m => ({ ...m })); }
    listMentorsBySpecialty(specialty) { return Array.from(this.mentors.values()).filter(m => m.specialty === specialty).map(m => ({ ...m })); }

    registerStudent(data) {
        const id = data.id || `st_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const student = { studentId: id, name: data.name || 'Student', interest: data.interest || 'general', level: data.level || 1, mentorId: null };
        this.students.set(id, student);
        return { success: true, student };
    }

    getStudent(id) { return this.students.get(id) ? { ...this.students.get(id) } : null; }
    listStudents() { return Array.from(this.students.values()).map(s => ({ ...s })); }

    findMatch(studentId) {
        const student = this.students.get(studentId);
        if (!student) return { success: false, error: 'STUDENT_NOT_FOUND' };
        const candidates = Array.from(this.mentors.values()).filter(m => m.specialty === student.interest && m.students.length < m.maxStudents);
        if (candidates.length === 0) return { success: false, error: 'NO_MATCH_AVAILABLE' };
        candidates.sort((a, b) => Math.abs(b.level - student.level * 5) - Math.abs(a.level - student.level * 5));
        return { success: true, mentor: { ...candidates[0] } };
    }

    createMatch(mentorId, studentId) {
        const mentor = this.mentors.get(mentorId);
        const student = this.students.get(studentId);
        if (!mentor) return { success: false, error: 'MENTOR_NOT_FOUND' };
        if (!student) return { success: false, error: 'STUDENT_NOT_FOUND' };
        if (mentor.students.length >= mentor.maxStudents) return { success: false, error: 'MENTOR_FULL' };
        const id = `mt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const match = { matchId: id, mentorId, studentId, status: 'active', createdAt: Date.now() };
        this.matches.set(id, match);
        mentor.students.push(studentId);
        student.mentorId = mentorId;
        this.stats.totalMatches++;
        this._triggerHook('matchCreated', { matchId: id });
        return { success: true, match };
    }

    getMatch(id) { return this.matches.get(id) ? { ...this.matches.get(id) } : null; }
    listMatches() { return Array.from(this.matches.values()).map(m => ({ ...m })); }

    endMatch(matchId) {
        const match = this.matches.get(matchId);
        if (!match) return { success: false, error: 'MATCH_NOT_FOUND' };
        match.status = 'ended';
        match.endedAt = Date.now();
        const mentor = this.mentors.get(match.mentorId);
        if (mentor) mentor.students = mentor.students.filter(s => s !== match.studentId);
        const student = this.students.get(match.studentId);
        if (student) student.mentorId = null;
        this._triggerHook('matchEnded', { matchId });
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
        if (this.stats.totalMatches < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMatches += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mentors: Array.from(this.mentors.entries()), students: Array.from(this.students.entries()), matches: Array.from(this.matches.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mentors) this.mentors = new Map(data.mentors);
        if (data.students) this.students = new Map(data.students);
        if (data.matches) this.matches = new Map(data.matches);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mentorCount: this.mentors.size, studentCount: this.students.size }; }
}