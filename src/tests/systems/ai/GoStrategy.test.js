/**
 * GoStrategy.test.js - 棋道测试
 * V427 Iteration 4/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GoStrategy } from '../../../systems/ai/GoStrategy.js';

describe('GoStrategy', () => {
    let system;
    beforeEach(() => { system = new GoStrategy(); });

    describe('startGame', () => {
        it('should start', () => {
            const { game } = system.startGame({ player1: 'p1', player2: 'p2' });
            expect(game.player1).toBe('p1');
            expect(game.player2).toBe('p2');
        });

        it('should default boardSize', () => {
            const { game } = system.startGame({});
            expect(game.boardSize).toBe(19);
        });

        it('should trigger gameStarted hook', () => {
            let called = false;
            system.registerHook('gameStarted', () => { called = true; });
            system.startGame({});
            expect(called).toBe(true);
        });
    });

    describe('getGame', () => {
        it('should return', () => {
            const { game } = system.startGame({});
            expect(system.getGame(game.gameId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGame('ghost')).toBeNull(); });
    });

    describe('listGames', () => {
        it('should list all', () => {
            system.startGame({});
            expect(system.listGames().length).toBe(1);
        });
    });

    describe('listByPlayer', () => {
        it('should filter by player1', () => {
            system.startGame({ player1: 'p1', player2: 'p2' });
            system.startGame({ player1: 'p3', player2: 'p4' });
            expect(system.listByPlayer('p1').length).toBe(1);
        });

        it('should filter by player2', () => {
            system.startGame({ player1: 'p1', player2: 'p2' });
            system.startGame({ player1: 'p3', player2: 'p4' });
            expect(system.listByPlayer('p2').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter', () => {
            const { game } = system.startGame({});
            game.status = 'finished';
            system.startGame({});
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('listFinished', () => {
        it('should filter', () => {
            const { game } = system.startGame({});
            system.finishGame(game.gameId, 'p1');
            system.startGame({});
            expect(system.listFinished().length).toBe(1);
        });
    });

    describe('placeStone', () => {
        it('should place black', () => {
            const { game } = system.startGame({});
            system.placeStone(game.gameId, 'black', { x: 1, y: 1 });
            expect(game.blackStones).toBe(1);
        });

        it('should place white', () => {
            const { game } = system.startGame({});
            system.placeStone(game.gameId, 'white', { x: 2, y: 2 });
            expect(game.whiteStones).toBe(1);
        });

        it('should record position', () => {
            const { game } = system.startGame({});
            system.placeStone(game.gameId, 'black', { x: 3, y: 3 });
            expect(game.position.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.placeStone('ghost', 'black', { x: 1, y: 1 });
            expect(result.error).toBe('GAME_NOT_FOUND');
        });

        it('should reject finished game', () => {
            const { game } = system.startGame({});
            system.finishGame(game.gameId, 'p1');
            const result = system.placeStone(game.gameId, 'black', { x: 1, y: 1 });
            expect(result.error).toBe('GAME_OVER');
        });

        it('should reject invalid color', () => {
            const { game } = system.startGame({});
            const result = system.placeStone(game.gameId, 'red', { x: 1, y: 1 });
            expect(result.error).toBe('INVALID_COLOR');
        });

        it('should trigger stonePlaced hook', () => {
            const { game } = system.startGame({});
            let called = false;
            system.registerHook('stonePlaced', () => { called = true; });
            system.placeStone(game.gameId, 'black', { x: 1, y: 1 });
            expect(called).toBe(true);
        });
    });

    describe('employStrategy', () => {
        it('should employ', () => {
            const { game } = system.startGame({});
            system.employStrategy(game.gameId, 'aggressive');
            expect(game.strategy).toBe('aggressive');
        });

        it('should reject missing', () => {
            const result = system.employStrategy('ghost', 'aggressive');
            expect(result.error).toBe('GAME_NOT_FOUND');
        });

        it('should trigger strategyEmployed hook', () => {
            const { game } = system.startGame({});
            let called = false;
            system.registerHook('strategyEmployed', () => { called = true; });
            system.employStrategy(game.gameId, 'defensive');
            expect(called).toBe(true);
        });
    });

    describe('finishGame', () => {
        it('should finish', () => {
            const { game } = system.startGame({});
            system.finishGame(game.gameId, 'p1');
            expect(game.status).toBe('finished');
            expect(game.winner).toBe('p1');
        });

        it('should reject missing', () => {
            const result = system.finishGame('ghost', 'p1');
            expect(result.error).toBe('GAME_NOT_FOUND');
        });

        it('should trigger gameFinished hook', () => {
            const { game } = system.startGame({});
            let called = false;
            system.registerHook('gameFinished', () => { called = true; });
            system.finishGame(game.gameId, 'p1');
            expect(called).toBe(true);
        });
    });

    describe('calculateBoardStrength', () => {
        it('should calculate', () => {
            const { game } = system.startGame({});
            system.placeStone(game.gameId, 'black', { x: 1, y: 1 });
            system.placeStone(game.gameId, 'black', { x: 2, y: 2 });
            system.placeStone(game.gameId, 'white', { x: 3, y: 3 });
            const strength = system.calculateBoardStrength(game.gameId);
            expect(strength).toBe(2 * 2 + 1 + 3);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBoardStrength('ghost')).toBe(0);
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

        it('should execute default getGame', () => {
            const result = system.executeTool('getGame', { gameId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('gameStarted', () => count++);
            unregister();
            system.startGame({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('gameStarted', () => { throw new Error('x'); });
            expect(() => system.startGame({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGames = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGames = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startGame({});
            const json = system.toJSON();
            expect(json.games.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startGame({});
            const json = system.toJSON();
            const newSys = new GoStrategy();
            newSys.fromJSON(json);
            expect(newSys.games.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.gameCount).toBe(0);
        });
    });
});
