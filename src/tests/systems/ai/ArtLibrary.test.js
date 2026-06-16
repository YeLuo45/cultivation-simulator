/**
 * ArtLibrary.test.js - 功法典籍馆测试
 * V399 Iteration 6/15 Round 13 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ArtLibrary } from '../../../systems/ai/ArtLibrary.js';

describe('ArtLibrary', () => {
    let system;
    beforeEach(() => { system = new ArtLibrary(); });

    describe('addBook', () => {
        it('should add', () => {
            const { book } = system.addBook({ title: 'B1' });
            expect(book.title).toBe('B1');
        });

        it('should trigger bookAdded hook', () => {
            let called = false;
            system.registerHook('bookAdded', () => { called = true; });
            system.addBook({});
            expect(called).toBe(true);
        });
    });

    describe('getBook', () => {
        it('should return', () => {
            const { book } = system.addBook({});
            expect(system.getBook(book.bookId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBook('ghost')).toBeNull(); });
    });

    describe('listBooks', () => {
        it('should list all', () => {
            system.addBook({});
            expect(system.listBooks().length).toBe(1);
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            system.addBook({ element: 'fire' });
            system.addBook({ element: 'water' });
            expect(system.listByElement('fire').length).toBe(1);
        });
    });

    describe('listByGrade', () => {
        it('should filter', () => {
            system.addBook({ grade: 'common' });
            system.addBook({ grade: 'rare' });
            expect(system.listByGrade('rare').length).toBe(1);
        });
    });

    describe('createCollection', () => {
        it('should create', () => {
            const { collection } = system.createCollection({ name: 'C1' });
            expect(collection.name).toBe('C1');
        });

        it('should trigger collectionCreated hook', () => {
            let called = false;
            system.registerHook('collectionCreated', () => { called = true; });
            system.createCollection({});
            expect(called).toBe(true);
        });
    });

    describe('getCollection', () => {
        it('should return', () => {
            const { collection } = system.createCollection({});
            expect(system.getCollection(collection.collectionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCollection('ghost')).toBeNull(); });
    });

    describe('listCollections', () => {
        it('should list all', () => {
            system.createCollection({});
            expect(system.listCollections().length).toBe(1);
        });
    });

    describe('addToCollection', () => {
        it('should add', () => {
            const { collection } = system.createCollection({});
            const { book } = system.addBook({});
            system.addToCollection(collection.collectionId, book.bookId);
            expect(collection.bookIds).toContain(book.bookId);
        });

        it('should reject missing collection', () => {
            const { book } = system.addBook({});
            const result = system.addToCollection('ghost', book.bookId);
            expect(result.error).toBe('COLLECTION_NOT_FOUND');
        });

        it('should reject missing book', () => {
            const { collection } = system.createCollection({});
            const result = system.addToCollection(collection.collectionId, 'ghost');
            expect(result.error).toBe('BOOK_NOT_FOUND');
        });

        it('should not duplicate', () => {
            const { collection } = system.createCollection({});
            const { book } = system.addBook({});
            system.addToCollection(collection.collectionId, book.bookId);
            system.addToCollection(collection.collectionId, book.bookId);
            expect(collection.bookIds.length).toBe(1);
        });

        it('should trigger bookAddedToCollection hook', () => {
            const { collection } = system.createCollection({});
            const { book } = system.addBook({});
            let called = false;
            system.registerHook('bookAddedToCollection', () => { called = true; });
            system.addToCollection(collection.collectionId, book.bookId);
            expect(called).toBe(true);
        });
    });

    describe('findBooksByArt', () => {
        it('should find', () => {
            system.addBook({ artId: 'a1' });
            system.addBook({ artId: 'a2' });
            expect(system.findBooksByArt('a1').length).toBe(1);
        });
    });

    describe('findRareBooks', () => {
        it('should find', () => {
            system.addBook({ grade: 'common' });
            system.addBook({ grade: 'rare' });
            expect(system.findRareBooks().length).toBe(1);
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

        it('should execute default getBook', () => {
            const result = system.executeTool('getBook', { bookId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bookAdded', () => count++);
            unregister();
            system.addBook({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bookAdded', () => { throw new Error('x'); });
            expect(() => system.addBook({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBooks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBooks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addBook({});
            const json = system.toJSON();
            expect(json.books.length).toBe(1);
        });
        it('should deserialize', () => {
            system.addBook({});
            const json = system.toJSON();
            const newSys = new ArtLibrary();
            newSys.fromJSON(json);
            expect(newSys.books.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bookCount).toBe(0);
        });
    });
});