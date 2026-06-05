/**
 * MentorMatch.test.js - 师徒匹配系统测试
 * V345 Iteration 6/9 Round 7 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MentorMatch } from '../../../systems/ai/MentorMatch.js';

describe('MentorMatch', () => {
    let system;
    beforeEach(() => { system = new MentorMatch(); });

    describe('registerMentor', () => {
        it('should register', () => {
            const { mentor } = system.registerMentor({ name: 'M1' });
            expect(mentor.name).toBe('M1');
        });

        it('should default specialty to general', () => {
            const { mentor } = system.registerMentor({});
            expect(mentor.specialty).toBe('general');
        });
    });

    describe('getMentor', () => {
        it('should return', () => {
            const { mentor } = system.registerMentor({});
            expect(system.getMentor(mentor.mentorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMentor('ghost')).toBeNull(); });
    });

    describe('listMentors', () => {
        it('should list all', () => {
            system.registerMentor({});
            expect(system.listMentors().length).toBe(1);
        });
    });

    describe('listMentorsBySpecialty', () => {
        it('should filter', () => {
            system.registerMentor({ specialty: 'sword' });
            system.registerMentor({ specialty: 'alchemy' });
            expect(system.listMentorsBySpecialty('sword').length).toBe(1);
        });
    });

    describe('registerStudent', () => {
        it('should register', () => {
            const { student } = system.registerStudent({ name: 'S1' });
            expect(student.name).toBe('S1');
        });
    });

    describe('getStudent', () => {
        it('should return', () => {
            const { student } = system.registerStudent({});
            expect(system.getStudent(student.studentId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStudent('ghost')).toBeNull(); });
    });

    describe('listStudents', () => {
        it('should list all', () => {
            system.registerStudent({});
            expect(system.listStudents().length).toBe(1);
        });
    });

    describe('findMatch', () => {
        it('should find', () => {
            const { mentor } = system.registerMentor({ specialty: 'sword' });
            const { student } = system.registerStudent({ interest: 'sword' });
            const result = system.findMatch(student.studentId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.findMatch('ghost');
            expect(result.error).toBe('STUDENT_NOT_FOUND');
        });

        it('should return NO_MATCH if no compatible', () => {
            const { student } = system.registerStudent({ interest: 'sword' });
            const result = system.findMatch(student.studentId);
            expect(result.error).toBe('NO_MATCH_AVAILABLE');
        });
    });

    describe('createMatch', () => {
        it('should create', () => {
            const { mentor } = system.registerMentor({});
            const { student } = system.registerStudent({});
            const result = system.createMatch(mentor.mentorId, student.studentId);
            expect(result.success).toBe(true);
        });

        it('should reject missing mentor', () => {
            const { student } = system.registerStudent({});
            const result = system.createMatch('ghost', student.studentId);
            expect(result.error).toBe('MENTOR_NOT_FOUND');
        });

        it('should reject missing student', () => {
            const { mentor } = system.registerMentor({});
            const result = system.createMatch(mentor.mentorId, 'ghost');
            expect(result.error).toBe('STUDENT_NOT_FOUND');
        });

        it('should reject full mentor', () => {
            const { mentor } = system.registerMentor({ maxStudents: 1 });
            const { student: s1 } = system.registerStudent({});
            const { student: s2 } = system.registerStudent({});
            system.createMatch(mentor.mentorId, s1.studentId);
            const result = system.createMatch(mentor.mentorId, s2.studentId);
            expect(result.error).toBe('MENTOR_FULL');
        });

        it('should trigger matchCreated hook', () => {
            const { mentor } = system.registerMentor({});
            const { student } = system.registerStudent({});
            let called = false;
            system.registerHook('matchCreated', () => { called = true; });
            system.createMatch(mentor.mentorId, student.studentId);
            expect(called).toBe(true);
        });
    });

    describe('getMatch', () => {
        it('should return', () => {
            const { mentor } = system.registerMentor({});
            const { student } = system.registerStudent({});
            const { match } = system.createMatch(mentor.mentorId, student.studentId);
            expect(system.getMatch(match.matchId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMatch('ghost')).toBeNull(); });
    });

    describe('listMatches', () => {
        it('should list all', () => {
            const { mentor } = system.registerMentor({});
            const { student } = system.registerStudent({});
            system.createMatch(mentor.mentorId, student.studentId);
            expect(system.listMatches().length).toBe(1);
        });
    });

    describe('endMatch', () => {
        it('should end', () => {
            const { mentor } = system.registerMentor({});
            const { student } = system.registerStudent({});
            const { match } = system.createMatch(mentor.mentorId, student.studentId);
            const result = system.endMatch(match.matchId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.endMatch('ghost');
            expect(result.error).toBe('MATCH_NOT_FOUND');
        });

        it('should trigger matchEnded hook', () => {
            const { mentor } = system.registerMentor({});
            const { student } = system.registerStudent({});
            const { match } = system.createMatch(mentor.mentorId, student.studentId);
            let called = false;
            system.registerHook('matchEnded', () => { called = true; });
            system.endMatch(match.matchId);
            expect(called).toBe(true);
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

        it('should execute default getMentor', () => {
            const result = system.executeTool('getMentor', { mentorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('matchCreated', () => count++);
            unregister();
            const { mentor } = system.registerMentor({});
            const { student } = system.registerStudent({});
            system.createMatch(mentor.mentorId, student.studentId);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('matchCreated', () => { throw new Error('x'); });
            const { mentor } = system.registerMentor({});
            const { student } = system.registerStudent({});
            expect(() => system.createMatch(mentor.mentorId, student.studentId)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMatches = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMatches = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerMentor({});
            const json = system.toJSON();
            expect(json.mentors.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerMentor({});
            const json = system.toJSON();
            const newSys = new MentorMatch();
            newSys.fromJSON(json);
            expect(newSys.mentors.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mentorCount).toBe(0);
        });
    });
});