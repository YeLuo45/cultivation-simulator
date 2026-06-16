/**
 * SectEducation.js - 宗门教育系统
 * V489 Iteration 6/15 Round 19 - Sect Education System
 *
 * 融合6大设计系统:
 * - generic-agent: 宗门课程循环
 * - chatdev: 宗门教学协调
 * - nanobot: 宗门教育mesh
 * - claude-code: 宗门教育工具
 * - thunderbolt: 宗门教育持久化
 * - ruflo: 宗门教育Hook
 */

export class SectEducation {
    constructor(config = {}) {
        this.config = { maxCourses: config.maxCourses || 100, baseDuration: config.baseDuration || 7, ...config };
        this.courses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCourses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCourse', (ctx) => this.getCourse(ctx.courseId));
        this.registerTool('openCourse', (ctx) => this.openCourse(ctx));
    }

    openCourse(data) {
        const id = data.courseId || data.id || `crs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const course = {
            courseId: id,
            sectId: data.sectId,
            name: data.name || 'Unnamed Course',
            type: data.type || 'technique',
            duration: data.duration || this.config.baseDuration,
            students: Array.isArray(data.students) ? [...data.students] : [],
            status: 'in-progress',
            createdAt: Date.now()
        };
        this.courses.set(id, course);
        this.stats.totalCourses++;
        this._triggerHook('courseOpened', { courseId: id });
        return { success: true, course };
    }

    getCourse(id) { return this.courses.get(id) ? { ...this.courses.get(id) } : null; }
    listCourses() { return Array.from(this.courses.values()).map(c => ({ ...c })); }
    listBySect(sectId) { return Array.from(this.courses.values()).filter(c => c.sectId === sectId).map(c => ({ ...c })); }
    listInProgress() { return Array.from(this.courses.values()).filter(c => c.status === 'in-progress').map(c => ({ ...c })); }

    addStudent(courseId, student) {
        const course = this.courses.get(courseId);
        if (!course) return { success: false, error: 'COURSE_NOT_FOUND' };
        course.students.push(student);
        this._triggerHook('studentAdded', { courseId, student });
        return { success: true };
    }

    extendDuration(courseId, amount = 7) {
        const course = this.courses.get(courseId);
        if (!course) return { success: false, error: 'COURSE_NOT_FOUND' };
        course.duration += amount;
        this._triggerHook('durationExtended', { courseId, newDuration: course.duration });
        return { success: true };
    }

    graduateCourse(courseId) {
        const course = this.courses.get(courseId);
        if (!course) return { success: false, error: 'COURSE_NOT_FOUND' };
        course.status = 'graduated';
        this._triggerHook('courseGraduated', { courseId });
        return { success: true };
    }

    failCourse(courseId) {
        const course = this.courses.get(courseId);
        if (!course) return { success: false, error: 'COURSE_NOT_FOUND' };
        course.status = 'failed';
        this._triggerHook('courseFailed', { courseId });
        return { success: true };
    }

    calculateEducationPower(courseId) {
        const course = this.courses.get(courseId);
        if (!course) return 0;
        return course.students.length * 5 + course.duration;
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
        if (this.stats.totalCourses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCourses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { courses: Array.from(this.courses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.courses) this.courses = new Map(data.courses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, courseCount: this.courses.size }; }
}
