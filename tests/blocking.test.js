/**
 * Save The Kitten - Blocking Engine Unit Tests
 */

import { describe, it, assert, assertEqual, assertArrayEqualsIgnoreOrder } from './testHelper.js';
import { Board } from '../src/engine/board.js';
import { PIECE_TYPES } from '../src/engine/pieces.js';
import { getCheckLine, getBlockingSquares, canBlockAttack, simulateBlock } from '../src/engine/blocking.js';
import { GameState, GAME_MODES } from '../src/game/gameState.js';

describe('Blocking Engine Tests (Line attacks vs Unblockable attacks)', () => {
    it('Rook: attack line can be blocked by placing a brick', () => {
        const board = new Board();
        // Rook at e8, Kitten at e4
        const rook = { type: PIECE_TYPES.ROOK, position: 'e8' };
        board.setKitten('e4');
        board.addAttacker(rook);

        assert(canBlockAttack(rook, 'e4', board));
        assertArrayEqualsIgnoreOrder(getBlockingSquares(rook, 'e4', board), ['e5', 'e6', 'e7']);

        // Placing brick at e6 resolves attack
        const sim = simulateBlock('e6', [rook], 'e4', board);
        assertEqual(sim.solvesAttack, true);
    });

    it('Bishop: diagonal attack can be blocked', () => {
        const board = new Board();
        // Bishop at b1, Kitten at e4 (line: c2, d3)
        const bishop = { type: PIECE_TYPES.BISHOP, position: 'b1' };
        board.setKitten('e4');
        board.addAttacker(bishop);

        assert(canBlockAttack(bishop, 'e4', board));
        assertArrayEqualsIgnoreOrder(getBlockingSquares(bishop, 'e4', board), ['c2', 'd3']);
    });

    it('Knight and King attacks CANNOT be blocked', () => {
        const board = new Board();
        const knight = { type: PIECE_TYPES.KNIGHT, position: 'c5' };
        const king = { type: PIECE_TYPES.KING, position: 'd5' };
        board.setKitten('e4');
        board.addAttacker(knight);
        board.addAttacker(king);

        assertEqual(canBlockAttack(knight, 'e4', board), false);
        assertEqual(canBlockAttack(king, 'e4', board), false);
        assertEqual(getBlockingSquares(knight, 'e4', board).length, 0);
        assertEqual(getBlockingSquares(king, 'e4', board).length, 0);
    });

    it('Multiple attackers: block only succeeds if all active attacks are resolved', () => {
        const board = new Board();
        // Kitten at e4 attacked by Rook at e8 AND Knight at c5
        const rook = { type: PIECE_TYPES.ROOK, position: 'e8' };
        const knight = { type: PIECE_TYPES.KNIGHT, position: 'c5' };
        board.setKitten('e4');
        board.addAttacker(rook);
        board.addAttacker(knight);

        // Blocking e6 stops Rook, but Knight still attacks e4!
        const sim = simulateBlock('e6', [rook, knight], 'e4', board);
        assertEqual(sim.solvesAttack, false);
        assertEqual(sim.remainingAttackers.length, 1);
        assertEqual(sim.remainingAttackers[0].type, PIECE_TYPES.KNIGHT);
    });

    it('Block retry: player can freely try squares without hints and retry on failure', () => {
        const game = new GameState();
        game.initLevel(1); // Level 2: Bishop at b1, Kitten at e4 (Line is c2, d3)

        game.setMode(GAME_MODES.BLOCK);

        // Try placing block on wrong square (a3)
        game.handleSquareClick('a3');
        assertEqual(game.isLevelComplete, false);
        assertEqual(game.board.hasBrick('a3'), false); // Removed!
        assert(game.failureExplanation.includes('attack is still active'));

        // Try another wrong square (f3)
        game.handleSquareClick('f3');
        assertEqual(game.isLevelComplete, false);
        assertEqual(game.board.hasBrick('f3'), false); // Removed!

        // Now place on correct square (d3)
        game.handleSquareClick('d3');
        assertEqual(game.isLevelComplete, true);
        assertEqual(game.board.hasBrick('d3'), true); // Placed!
    });
});
