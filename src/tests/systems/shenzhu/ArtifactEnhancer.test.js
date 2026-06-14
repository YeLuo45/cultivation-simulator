import { describe, it, expect, beforeEach } from 'vitest';
import { ArtifactEnhancer, ENHANCEMENT_LEVELS } from '../../../systems/shenzhu/ArtifactEnhancer.js';

describe('ArtifactEnhancer', () => {
    let e;
    beforeEach(() => { e = new ArtifactEnhancer(); });
    it('initializes with defaults', () => { expect(e.stats.total).toBe(0); });
    it('startEnhancement', () => { expect(e.startEnhancement('art1')).not.toBeNull(); });
    it('startEnhancement rejects missing', () => { expect(e.startEnhancement('')).toBeNull(); });
    it('startEnhancement normalizes levels', () => { const x = e.startEnhancement('art1', 'invalid', 'invalid'); expect(x.level).toBe('+0'); expect(x.targetLevel).toBe('+1'); });
    it('get returns null for unknown', () => { expect(e.get('ghost')).toBeNull(); });
    it('listAll and listByArtifact and listByStatus and listActive and listSucceeded', () => {
        e.startEnhancement('art1');
        e.startEnhancement('art1', '+1', '+2');
        expect(e.listAll().length).toBe(2);
        expect(e.listByArtifact('art1').length).toBe(2);
        expect(e.listByStatus('in_progress').length).toBe(2);
    });
    it('attempt', () => { const x = e.startEnhancement('art1'); e.attempt(x.id); expect(e.attemptsOf(x.id)).toBe(1); });
    it('attempt rejects non-in-progress', () => { const x = e.startEnhancement('art1'); e.succeed(x.id); expect(e.attempt(x.id)).toBe(false); });
    it('attempt returns false for unknown', () => { expect(e.attempt('ghost')).toBe(false); });
    it('succeed and fail and destroy', () => { const x = e.startEnhancement('art1'); e.succeed(x.id); expect(e.isSucceeded(x.id)).toBe(true); const y = e.startEnhancement('art1'); e.fail(y.id); const z = e.startEnhancement('art1'); e.destroy(z.id); expect(e.isDestroyed(z.id)).toBe(true); });
    it('isActive and isSucceeded and isDestroyed and isFailed', () => { const x = e.startEnhancement('art1'); expect(e.isActive(x.id)).toBe(true); });
    it('isActive for unknown', () => { expect(e.isActive('ghost')).toBe(false); });
    it('levelOf and targetLevelOf and attemptsOf and successRateOf for unknown', () => { expect(e.levelOf('ghost')).toBeNull(); expect(e.targetLevelOf('ghost')).toBeNull(); expect(e.attemptsOf('ghost')).toBe(0); expect(e.successRateOf('ghost')).toBe(0); });
    it('artifactCount', () => { e.startEnhancement('art1'); expect(e.artifactCount('art1')).toBe(1); });
    it('artifactCount for unknown', () => { expect(e.artifactCount('ghost')).toBe(0); });
    it('successRate', () => { const x = e.startEnhancement('art1'); e.succeed(x.id); expect(e.successRate()).toBe(1); });
    it('bestLevel', () => { const x = e.startEnhancement('art1', '+0', '+5'); e.succeed(x.id); expect(e.bestLevel('art1').level).toBe('+5'); });
    it('bestLevel null for no succeeded', () => { e.startEnhancement('art1'); expect(e.bestLevel('art1')).toBeNull(); });
    it('report aggregates', () => { e.startEnhancement('art1'); expect(e.report().total).toBe(1); });
    it('reset clears', () => { e.startEnhancement('art1'); e.reset(); expect(e.stats.total).toBe(0); });
    it('exposes ENHANCEMENT_LEVELS', () => { expect(ENHANCEMENT_LEVELS).toContain('+0'); });
});
