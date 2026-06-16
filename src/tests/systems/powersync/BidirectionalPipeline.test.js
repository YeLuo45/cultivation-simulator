/**
 * BidirectionalPipeline.test.js - 双向同步管道测试
 * V1163 Round 44 Iter 6/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { BidirectionalPipeline, PIPELINE_DIRECTIONS, CHECKPOINT_STATES } from '../../../systems/powersync/BidirectionalPipeline.js';

describe('BidirectionalPipeline', () => {
    let pipe;
    beforeEach(() => { pipe = new BidirectionalPipeline({ maxBuffer: 50 }); });

    describe('exports', () => {
        it('should export PIPELINE_DIRECTIONS', () => {
            expect(PIPELINE_DIRECTIONS).toContain('upload');
            expect(PIPELINE_DIRECTIONS).toContain('download');
        });
        it('should export CHECKPOINT_STATES', () => {
            expect(CHECKPOINT_STATES).toContain('open');
            expect(CHECKPOINT_STATES).toContain('committed');
            expect(CHECKPOINT_STATES).toContain('restored');
        });
    });

    describe('constructor', () => {
        it('should initialize empty', () => {
            expect(pipe.uploadBuf.length).toBe(0);
            expect(pipe.downloadBuf.length).toBe(0);
            expect(pipe.checkpoints.size).toBe(0);
        });
        it('should accept custom maxBuffer', () => {
            const p = new BidirectionalPipeline({ maxBuffer: 5 });
            expect(p.config.maxBuffer).toBe(5);
        });
    });

    describe('upload', () => {
        it('should add to upload buffer', () => {
            const e = pipe.upload({ data: 'x' });
            expect(e.payload.data).toBe('x');
            expect(pipe.uploadBuf.length).toBe(1);
        });
        it('should reject null payload', () => {
            expect(pipe.upload(null)).toBeNull();
        });
        it('should reject undefined payload', () => {
            expect(pipe.upload(undefined)).toBeNull();
        });
        it('should reject when buffer full', () => {
            const small = new BidirectionalPipeline({ maxBuffer: 1 });
            small.upload({ a: 1 });
            const r = small.upload({ a: 2 });
            expect(r).toBeNull();
        });
        it('should increment uploaded stat', () => {
            pipe.upload({ a: 1 });
            pipe.upload({ a: 2 });
            expect(pipe.stats.uploaded).toBe(2);
        });
        it('should handle multiple payloads in order', () => {
            pipe.upload({ id: 1 });
            pipe.upload({ id: 2 });
            expect(pipe.uploadBuf[0].payload.id).toBe(1);
            expect(pipe.uploadBuf[1].payload.id).toBe(2);
        });
    });

    describe('download', () => {
        it('should return empty array when nothing queued', () => {
            expect(pipe.download()).toEqual([]);
        });
        it('should drain queued items', () => {
            pipe.enqueueDownload({ a: 1 });
            pipe.enqueueDownload({ a: 2 });
            const batch = pipe.download();
            expect(batch.length).toBe(2);
        });
        it('should track downloaded count', () => {
            pipe.enqueueDownload({ a: 1 });
            pipe.download();
            expect(pipe.stats.downloaded).toBe(1);
        });
        it('should clear buffer after download', () => {
            pipe.enqueueDownload({ a: 1 });
            pipe.download();
            expect(pipe.downloadBuf.length).toBe(0);
        });
        it('enqueueDownload rejects null', () => {
            expect(pipe.enqueueDownload(null)).toBeNull();
        });
        it('enqueueDownload tracks in buffer', () => {
            const e = pipe.enqueueDownload({ a: 1 });
            expect(pipe.downloadBuf.length).toBe(1);
        });
    });

    describe('checkpoint', () => {
        it('should create a checkpoint', () => {
            const cp = pipe.checkpoint('test');
            expect(cp.label).toBe('test');
            expect(cp.state).toBe('open');
        });
        it('should record upload buffer cursor at checkpoint time', () => {
            pipe.upload({ a: 1 });
            pipe.upload({ a: 2 });
            const cp = pipe.checkpoint();
            expect(cp.cursor).toBe(2);
        });
        it('should commit a checkpoint', () => {
            const cp = pipe.checkpoint();
            expect(pipe.commitCheckpoint(cp.id)).toBe(true);
            expect(pipe.getCheckpoint(cp.id).state).toBe('committed');
        });
        it('should return false for unknown commit', () => {
            expect(pipe.commitCheckpoint('fake_id')).toBe(false);
        });
    });

    describe('resume', () => {
        it('should restore upload buffer to checkpoint', () => {
            pipe.upload({ id: 1 });
            pipe.upload({ id: 2 });
            const cp = pipe.checkpoint();
            pipe.upload({ id: 3 });
            pipe.upload({ id: 4 });
            // before resume, buffer has 4
            pipe.resume(cp.id);
            // after resume, cursor=2, so [0,2) is dropped, [2,4) keeps as new buffer
            expect(pipe.uploadBuf.length).toBe(2);
        });
        it('should mark checkpoint as restored', () => {
            const cp = pipe.checkpoint();
            pipe.resume(cp.id);
            expect(pipe.getCheckpoint(cp.id).state).toBe('restored');
        });
        it('should return null for unknown checkpoint', () => {
            expect(pipe.resume('fake_id')).toBeNull();
        });
        it('should return null when already restored', () => {
            const cp = pipe.checkpoint();
            pipe.resume(cp.id);
            expect(pipe.resume(cp.id)).toBeNull();
        });
        it('should accept checkpoint object', () => {
            pipe.upload({ id: 1 });
            const cp = pipe.checkpoint();
            pipe.upload({ id: 2 });
            pipe.resume(cp);
            expect(pipe.uploadBuf.length).toBe(1);
        });
    });

    describe('queries', () => {
        it('listCheckpoints should return sorted', async () => {
            const cp1 = pipe.checkpoint('a');
            await new Promise(r => setTimeout(r, 5));
            const cp2 = pipe.checkpoint('b');
            const list = pipe.listCheckpoints();
            expect(list.length).toBe(2);
            expect(list[0].ts).toBeLessThanOrEqual(list[1].ts);
        });
        it('listUpload returns buffer copy', () => {
            pipe.upload({ a: 1 });
            const list = pipe.listUpload();
            expect(list.length).toBe(1);
        });
        it('listDownload returns buffer copy', () => {
            pipe.enqueueDownload({ a: 1 });
            const list = pipe.listDownload();
            expect(list.length).toBe(1);
        });
    });

    describe('stats', () => {
        it('getStats includes uploaded/downloaded/checkpoints', () => {
            pipe.upload({ a: 1 });
            pipe.enqueueDownload({ b: 1 });
            pipe.download();
            pipe.checkpoint();
            const s = pipe.getStats();
            expect(s.uploaded).toBe(1);
            expect(s.downloaded).toBe(1);
            expect(s.checkpoints).toBe(1);
        });
    });

    describe('hooks', () => {
        it('should emit uploaded', () => {
            let fired = false;
            pipe.registerHook('uploaded', () => { fired = true; });
            pipe.upload({ a: 1 });
            expect(fired).toBe(true);
        });
        it('should emit checkpoint', () => {
            let captured = null;
            pipe.registerHook('checkpoint', (p) => { captured = p; });
            pipe.checkpoint('test');
            expect(captured.label).toBe('test');
        });
        it('should emit resumed', () => {
            let fired = false;
            pipe.registerHook('resumed', () => { fired = true; });
            const cp = pipe.checkpoint();
            pipe.resume(cp.id);
            expect(fired).toBe(true);
        });
        it('should handle hook errors silently', () => {
            pipe.registerHook('uploaded', () => { throw new Error('boom'); });
            expect(() => pipe.upload({ a: 1 })).not.toThrow();
        });
    });
});
