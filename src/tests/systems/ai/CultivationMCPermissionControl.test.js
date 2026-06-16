/**
 * CultivationMCPermissionControl.test.js - 三档鉴权系统测试
 * V865 Iteration 7/30 Round 35 - Direction F
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionControl, PERMISSION_LEVELS, PERMISSION_NAMES, DEFAULT_ROLES } from '../../../systems/ai/CultivationMCPermissionControl.js';

describe('CultivationMCPermissionControl', () => {
    let pc;
    beforeEach(() => { pc = new PermissionControl(); });

    describe('constructor', () => {
        it('should load default roles', () => {
            expect(pc.listRoles()).toContain('guest');
            expect(pc.listRoles()).toContain('admin');
            expect(pc.listRoles()).toContain('owner');
        });

        it('should accept custom expiration', () => {
            const p = new PermissionControl({ defaultExpirationMs: 5000 });
            expect(p.config.defaultExpirationMs).toBe(5000);
        });
    });

    describe('defineRole', () => {
        it('should define a custom role', () => {
            const r = pc.defineRole('elder', ['read', 'write', 'elder']);
            expect(r.success).toBe(true);
            expect(pc.listRoles()).toContain('elder');
        });

        it('should auto-create parent roles', () => {
            pc.defineRole('cultivator', ['read'], ['nonexistent']);
            expect(pc.roleDefinitions.has('nonexistent')).toBe(true);
        });
    });

    describe('assignRole / revokeRole', () => {
        it('should assign role to new caller', () => {
            const r = pc.assignRole('c1', 'player');
            expect(r.success).toBe(true);
            expect(r.permissions).toContain('read');
            expect(r.permissions).toContain('write');
        });

        it('should not duplicate role assignment', () => {
            pc.assignRole('c1', 'player');
            pc.assignRole('c1', 'player');
            const caller = pc.getCaller('c1');
            expect(caller.roles.filter(r => r === 'player').length).toBe(1);
        });

        it('should inherit parent role permissions', () => {
            pc.assignRole('c1', 'admin');
            const caller = pc.getCaller('c1');
            expect(caller.permissions).toContain('read');
            expect(caller.permissions).toContain('write');
            expect(caller.permissions).toContain('admin');
        });

        it('should assign owner role with wildcard', () => {
            pc.assignRole('c1', 'owner');
            const caller = pc.getCaller('c1');
            expect(caller.permissions).toContain('*');
        });

        it('should accept metadata', () => {
            pc.assignRole('c1', 'player', { name: '李青云' });
            const caller = pc.getCaller('c1');
            expect(caller.metadata.name).toBe('李青云');
        });

        it('should revoke role', () => {
            pc.assignRole('c1', 'admin');
            const r = pc.revokeRole('c1', 'admin');
            expect(r.success).toBe(true);
            const caller = pc.getCaller('c1');
            expect(caller.roles).not.toContain('admin');
        });

        it('should reject revoke for unknown caller', () => {
            const r = pc.revokeRole('c_unknown', 'admin');
            expect(r.success).toBe(false);
        });
    });

    describe('grantDirectPermission / revokeDirectPermission', () => {
        it('should grant direct permission', () => {
            const r = pc.grantDirectPermission('c1', 'special');
            expect(r.success).toBe(true);
        });

        it('should not duplicate direct permission', () => {
            pc.grantDirectPermission('c1', 'special');
            pc.grantDirectPermission('c1', 'special');
            const caller = pc.getCaller('c1');
            expect(caller.permissions.filter(p => p === 'special').length).toBe(1);
        });

        it('should revoke direct permission', () => {
            pc.grantDirectPermission('c1', 'special');
            const r = pc.revokeDirectPermission('c1', 'special');
            expect(r.success).toBe(true);
            const caller = pc.getCaller('c1');
            expect(caller.permissions).not.toContain('special');
        });
    });

    describe('issueToken', () => {
        it('should issue token to caller with permissions', () => {
            pc.assignRole('c1', 'admin');
            const r = pc.issueToken('c1');
            expect(r.success).toBe(true);
            expect(r.tokenId).toBeDefined();
            expect(r.permissions).toContain('admin');
        });

        it('should reject token for unknown caller', () => {
            const r = pc.issueToken('c_unknown');
            expect(r.success).toBe(false);
        });

        it('should reject when too many tokens', () => {
            pc.assignRole('c1', 'admin');
            for (let i = 0; i < 10; i++) pc.issueToken('c1', { durationMs: 600_000 });
            const r = pc.issueToken('c1');
            expect(r.success).toBe(false);
        });

        it('should accept custom duration', () => {
            pc.assignRole('c1', 'admin');
            const r = pc.issueToken('c1', { durationMs: 5000 });
            const token = pc.tokens.get(r.tokenId);
            expect(token.expiresAt - Date.now()).toBeLessThanOrEqual(5000);
        });
    });

    describe('check', () => {
        it('should allow sufficient permission', () => {
            pc.assignRole('c1', 'admin');
            const r = pc.check('c1', 'admin');
            expect(r.allowed).toBe(true);
        });

        it('should deny insufficient permission', () => {
            pc.assignRole('c1', 'player');
            const r = pc.check('c1', 'admin');
            expect(r.allowed).toBe(false);
        });

        it('should deny unknown caller', () => {
            const r = pc.check('c_unknown', 'read');
            expect(r.allowed).toBe(false);
            expect(r.reason).toBe('CALLER_NOT_FOUND');
        });

        it('should allow wildcard owner', () => {
            pc.assignRole('c1', 'owner');
            const r = pc.check('c1', 'anything');
            expect(r.allowed).toBe(true);
        });
    });

    describe('checkToken', () => {
        it('should allow valid token with permission', () => {
            pc.assignRole('c1', 'admin');
            const { tokenId } = pc.issueToken('c1');
            const r = pc.checkToken(tokenId, 'admin');
            expect(r.allowed).toBe(true);
            expect(r.callerId).toBe('c1');
        });

        it('should reject unknown token', () => {
            const r = pc.checkToken('unknown', 'admin');
            expect(r.allowed).toBe(false);
        });

        it('should reject revoked token', () => {
            pc.assignRole('c1', 'admin');
            const { tokenId } = pc.issueToken('c1');
            pc.revokeToken(tokenId);
            const r = pc.checkToken(tokenId, 'admin');
            expect(r.allowed).toBe(false);
            expect(r.reason).toBe('TOKEN_REVOKED');
        });

        it('should reject expired token', () => {
            pc.assignRole('c1', 'admin');
            const { tokenId } = pc.issueToken('c1', { durationMs: 1 });
            setTimeout(() => {
                const r = pc.checkToken(tokenId, 'admin');
                expect(r.allowed).toBe(false);
            }, 10);
        });

        it('should count token uses', () => {
            pc.assignRole('c1', 'admin');
            const { tokenId } = pc.issueToken('c1');
            pc.checkToken(tokenId, 'admin');
            pc.checkToken(tokenId, 'admin');
            const token = pc.tokens.get(tokenId);
            expect(token.useCount).toBe(2);
        });
    });

    describe('revokeToken / revokeAllTokensForCaller', () => {
        it('should revoke specific token', () => {
            pc.assignRole('c1', 'admin');
            const { tokenId } = pc.issueToken('c1');
            const r = pc.revokeToken(tokenId);
            expect(r.success).toBe(true);
        });

        it('should reject revoke for unknown token', () => {
            const r = pc.revokeToken('unknown');
            expect(r.success).toBe(false);
        });

        it('should revoke all tokens for caller', () => {
            pc.assignRole('c1', 'admin');
            pc.issueToken('c1');
            pc.issueToken('c1');
            const r = pc.revokeAllTokensForCaller('c1');
            expect(r.revoked).toBe(2);
        });
    });

    describe('list / get', () => {
        it('should list callers', () => {
            pc.assignRole('c1', 'player');
            pc.assignRole('c2', 'admin');
            expect(pc.listCallers()).toEqual(expect.arrayContaining(['c1', 'c2']));
        });

        it('should get caller info', () => {
            pc.assignRole('c1', 'admin');
            const c = pc.getCaller('c1');
            expect(c.roles).toContain('admin');
        });

        it('should return null for unknown caller', () => {
            expect(pc.getCaller('unknown')).toBe(null);
        });

        it('should list tokens filtered by caller', () => {
            pc.assignRole('c1', 'admin');
            pc.issueToken('c1');
            const tokens = pc.listTokens('c1');
            expect(tokens.length).toBe(1);
        });

        it('should list all tokens when no filter', () => {
            pc.assignRole('c1', 'admin');
            pc.assignRole('c2', 'admin');
            pc.issueToken('c1');
            pc.issueToken('c2');
            expect(pc.listTokens().length).toBe(2);
        });
    });

    describe('audit log & stats', () => {
        it('should audit check calls', () => {
            pc.assignRole('c1', 'player');
            pc.check('c1', 'admin');
            pc.check('c1', 'read');
            const log = pc.getAuditLog();
            expect(log.length).toBe(2);
        });

        it('should bound audit log', () => {
            for (let i = 0; i < 1100; i++) pc._audit('c1', 'read', true, 'OK');
            expect(pc.auditLog.length).toBeLessThanOrEqual(1000);
        });

        it('should clear audit log', () => {
            pc._audit('c1', 'read', true, 'OK');
            pc.clearAuditLog();
            expect(pc.auditLog.length).toBe(0);
        });

        it('should report stats', () => {
            pc.assignRole('c1', 'admin');
            pc.issueToken('c1');
            pc.check('c1', 'admin');
            const s = pc.getStats();
            expect(s.callerCount).toBe(1);
            expect(s.tokenCount).toBe(1);
            expect(s.allowed).toBe(1);
        });
    });

    describe('serialization', () => {
        it('should serialize', () => {
            pc.assignRole('c1', 'admin');
            const j = pc.toJSON();
            expect(j.callers).toBeDefined();
            expect(j.roles).toBeDefined();
        });

        it('should restore', () => {
            pc.assignRole('c1', 'admin');
            const j = pc.toJSON();
            const p2 = new PermissionControl();
            const r = p2.fromJSON(j);
            expect(r.success).toBe(true);
            expect(p2.listCallers()).toContain('c1');
        });
    });

    describe('module exports', () => {
        it('should export PERMISSION_LEVELS', () => {
            expect(PERMISSION_LEVELS.READ).toBe(1);
            expect(PERMISSION_LEVELS.WRITE).toBe(2);
            expect(PERMISSION_LEVELS.ADMIN).toBe(3);
        });

        it('should export PERMISSION_NAMES', () => {
            expect(PERMISSION_NAMES[1]).toBe('read');
            expect(PERMISSION_NAMES[3]).toBe('admin');
        });

        it('should export DEFAULT_ROLES', () => {
            expect(DEFAULT_ROLES.player.permissions).toContain('write');
            expect(DEFAULT_ROLES.admin.inherits).toContain('moderator');
        });
    });
});
