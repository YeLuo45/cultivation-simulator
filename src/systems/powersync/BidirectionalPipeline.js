/**
 * BidirectionalPipeline.js - 双向同步管道
 * V1163 Round 44 Iter 6/30 Direction A PowerSync Federation (thunderbolt)
 * 灵感: thunderbolt PowerSync upload/download tracks + checkpoint recovery
 */

export const PIPELINE_DIRECTIONS = ['upload', 'download'];
export const CHECKPOINT_STATES = ['open', 'committed', 'restored'];

export class BidirectionalPipeline {
    constructor(config = {}) {
        this.config = { maxBuffer: 2048, checkpointTtl: 300000, ...config };
        this.uploadBuf = [];          // outbound payloads
        this.downloadBuf = [];        // inbound payloads
        this.checkpoints = new Map(); // cpId -> { id, label, state, ts, cursor }
        this.hooks = new Map();
        this.stats = { uploaded: 0, downloaded: 0, checkpoints: 0, restored: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }
    _newId() { return `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    upload(payload) {
        if (payload === undefined || payload === null) return null;
        if (this.uploadBuf.length >= this.config.maxBuffer) {
            this._emit('dropped', { direction: 'upload', reason: 'full' });
            return null;
        }
        const entry = { id: this._newId(), payload, ts: Date.now() };
        this.uploadBuf.push(entry);
        this.stats.uploaded++;
        this._emit('uploaded', entry);
        return entry;
    }

    download() {
        if (this.downloadBuf.length === 0) return [];
        const batch = this.downloadBuf.splice(0, this.config.maxBuffer);
        this.stats.downloaded += batch.length;
        this._emit('downloaded', batch);
        return batch;
    }

    enqueueDownload(payload) {
        if (payload === undefined || payload === null) return null;
        if (this.downloadBuf.length >= this.config.maxBuffer) {
            this._emit('dropped', { direction: 'download', reason: 'full' });
            return null;
        }
        const entry = { id: this._newId(), payload, ts: Date.now() };
        this.downloadBuf.push(entry);
        return entry;
    }

    checkpoint(label = null) {
        const id = this._newId();
        const cp = {
            id,
            label: label || `cp_${this.checkpoints.size}`,
            state: 'open',
            ts: Date.now(),
            cursor: this.uploadBuf.length, // resume from this position
        };
        this.checkpoints.set(id, cp);
        this.stats.checkpoints++;
        this._emit('checkpoint', cp);
        return cp;
    }

    commitCheckpoint(id) {
        const cp = this.checkpoints.get(id);
        if (!cp) return false;
        cp.state = 'committed';
        return true;
    }

    resume(fromCheckpoint) {
        const cp = typeof fromCheckpoint === 'string'
            ? this.checkpoints.get(fromCheckpoint)
            : fromCheckpoint;
        if (!cp) return null;
        if (cp.state === 'restored') return null;
        // trim upload buffer to checkpoint cursor
        if (cp.cursor !== undefined && cp.cursor <= this.uploadBuf.length) {
            this.uploadBuf = this.uploadBuf.slice(cp.cursor);
        }
        cp.state = 'restored';
        this.stats.restored++;
        this._emit('resumed', cp);
        return cp;
    }

    getCheckpoint(id) { return this.checkpoints.get(id) || null; }
    listCheckpoints() {
        return Array.from(this.checkpoints.values()).sort((a, b) => a.ts - b.ts);
    }

    listUpload() { return this.uploadBuf.slice(); }
    listDownload() { return this.downloadBuf.slice(); }

    getStats() {
        return {
            ...this.stats,
            uploadSize: this.uploadBuf.length,
            downloadSize: this.downloadBuf.length,
            checkpointCount: this.checkpoints.size,
        };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.BidirectionalPipeline = BidirectionalPipeline;
    globalThis.PIPELINE_DIRECTIONS = PIPELINE_DIRECTIONS;
    globalThis.CHECKPOINT_STATES = CHECKPOINT_STATES;
}
