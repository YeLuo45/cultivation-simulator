/**
 * SectEducation.test.js - 宗门教育系统测试
 * V489 Iteration 6/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectEducation } from '../../../systems/ai/SectEducation.js';

describe('SectEducation', () => {
    let system;
    beforeEach(() => { system = new SectEducation(); });

    describe('openCourse', () => {
        it('should open course', () => {
            const { course } = system.openCourse({ sectId: 's1', name: 'Sword 101' });
            expect(course.sectId).toBe('s1');
            expect(course.name).toBe('Sword 101');
        });

        it('should default name to Unnamed Course', () => {
            const { course } = system.openCourse({});
            expect(course.name).toBe('Unnamed Course');
        });

        it('should default type to technique', () => {
            const { course } = system.openCourse({});
            expect(course.type).toBe('technique');
        });

        it('should default duration from baseDuration', () => {
            const { course } = system.openCourse({});
            expect(course.duration).toBe(7);
        });

        it('should initialize students to empty array', () => {
            const { course } = system.openCourse({});
            expect(course.students).toEqual([]);
        });

        it('should set status to in-progress', () => {
            const { course } = system.openCourse({});
            expect(course.status).toBe('in-progress');
        });

        it('should trigger courseOpened hook', () => {
            let called = false;
            system.registerHook('courseOpened', () => { called = true; });
            system.openCourse({});
            expect(called).toBe(true);
        });

        it('should accept custom courseId', () => {
            const { course } = system.openCourse({ courseId: 'crs_custom_1' });
            expect(course.courseId).toBe('crs_custom_1');
        });

        it('should accept custom type', () => {
            const { course } = system.openCourse({ type: 'dharma' });
            expect(course.type).toBe('dharma');
        });
    });

    describe('getCourse', () => {
        it('should return course', () => {
            const { course } = system.openCourse({});
            expect(system.getCourse(course.courseId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getCourse('ghost')).toBeNull();
        });
    });

    describe('listCourses', () => {
        it('should list all', () => {
            system.openCourse({});
            system.openCourse({});
            expect(system.listCourses().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listCourses().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.openCourse({ sectId: 's1' });
            system.openCourse({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty for unknown sect', () => {
            system.openCourse({});
            expect(system.listBySect('ghost').length).toBe(0);
        });
    });

    describe('listInProgress', () => {
        it('should filter in-progress', () => {
            const { course } = system.openCourse({});
            system.openCourse({});
            system.graduateCourse(course.courseId);
            expect(system.listInProgress().length).toBe(1);
        });

        it('should return all when none graduated', () => {
            system.openCourse({});
            system.openCourse({});
            expect(system.listInProgress().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listInProgress().length).toBe(0);
        });
    });

    describe('addStudent', () => {
        it('should add student', () => {
            const { course } = system.openCourse({});
            system.addStudent(course.courseId, 'stu_1');
            expect(course.students).toContain('stu_1');
        });

        it('should add multiple students', () => {
            const { course } = system.openCourse({});
            system.addStudent(course.courseId, 'stu_1');
            system.addStudent(course.courseId, 'stu_2');
            expect(course.students.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addStudent('ghost', 'stu_1');
            expect(result.error).toBe('COURSE_NOT_FOUND');
        });

        it('should trigger studentAdded hook', () => {
            const { course } = system.openCourse({});
            let called = false;
            system.registerHook('studentAdded', () => { called = true; });
            system.addStudent(course.courseId, 'stu_1');
            expect(called).toBe(true);
        });
    });

    describe('extendDuration', () => {
        it('should increase duration', () => {
            const { course } = system.openCourse({});
            system.extendDuration(course.courseId, 14);
            expect(course.duration).toBe(21);
        });

        it('should use default amount of 7', () => {
            const { course } = system.openCourse({});
            system.extendDuration(course.courseId);
            expect(course.duration).toBe(14);
        });

        it('should reject missing', () => {
            const result = system.extendDuration('ghost', 7);
            expect(result.error).toBe('COURSE_NOT_FOUND');
        });

        it('should trigger durationExtended hook', () => {
            const { course } = system.openCourse({});
            let called = false;
            system.registerHook('durationExtended', () => { called = true; });
            system.extendDuration(course.courseId, 7);
            expect(called).toBe(true);
        });
    });

    describe('graduateCourse', () => {
        it('should set status to graduated', () => {
            const { course } = system.openCourse({});
            system.graduateCourse(course.courseId);
            expect(course.status).toBe('graduated');
        });

        it('should reject missing', () => {
            const result = system.graduateCourse('ghost');
            expect(result.error).toBe('COURSE_NOT_FOUND');
        });

        it('should trigger courseGraduated hook', () => {
            const { course } = system.openCourse({});
            let called = false;
            system.registerHook('courseGraduated', () => { called = true; });
            system.graduateCourse(course.courseId);
            expect(called).toBe(true);
        });
    });

    describe('failCourse', () => {
        it('should set status to failed', () => {
            const { course } = system.openCourse({});
            system.failCourse(course.courseId);
            expect(course.status).toBe('failed');
        });

        it('should reject missing', () => {
            const result = system.failCourse('ghost');
            expect(result.error).toBe('COURSE_NOT_FOUND');
        });

        it('should trigger courseFailed hook', () => {
            const { course } = system.openCourse({});
            let called = false;
            system.registerHook('courseFailed', () => { called = true; });
            system.failCourse(course.courseId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEducationPower', () => {
        it('should calculate', () => {
            const { course } = system.openCourse({});
            system.addStudent(course.courseId, 's1');
            system.addStudent(course.courseId, 's2');
            // 2 students * 5 + 7 duration = 17
            expect(system.calculateEducationPower(course.courseId)).toBe(17);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEducationPower('ghost')).toBe(0);
        });

        it('should factor in extended duration', () => {
            const { course } = system.openCourse({});
            system.extendDuration(course.courseId, 21);
            // 0 students * 5 + 28 duration = 28
            expect(system.calculateEducationPower(course.courseId)).toBe(28);
        });

        it('should return 7 for empty course', () => {
            const { course } = system.openCourse({});
            // 0 students * 5 + 7 duration = 7
            expect(system.calculateEducationPower(course.courseId)).toBe(7);
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

        it('should execute default getCourse', () => {
            const result = system.executeTool('getCourse', { courseId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('courseOpened', () => count++);
            unregister();
            system.openCourse({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('courseOpened', () => { throw new Error('x'); });
            expect(() => system.openCourse({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalCourses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalCourses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openCourse({});
            const json = system.toJSON();
            expect(json.courses.length).toBe(1);
        });

        it('should deserialize', () => {
            system.openCourse({});
            const json = system.toJSON();
            const newSys = new SectEducation();
            newSys.fromJSON(json);
            expect(newSys.courses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.courseCount).toBe(0);
        });
    });
});
