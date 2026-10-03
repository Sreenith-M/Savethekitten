/**
 * Save The Kitten - Safety & Safe Moves Unit Tests
 */

import { describe, it, assert, assertEqual, assertArrayEqualsIgnoreOrder } from './testHelper.js';
import { Board } from '../src/engine/board.js';
import { PIECE_TYPES } from '../src/engine/pieces.js';
import {
    getKittenAdjacentSquares,
    getSafeKittenMoves,
    isKittenSafe,
    validateKittenMove
} from '../src/engine/safety.js';

describe('Kitten Safety & Safe Move Calculation Tests', () => {
    it('calculates adjacent squares on center, edge, and corner', () => {
        const board = new Board();

        // Center e4 -> 8 adjacent squares
        const center = getKittenAdjacentSquares('e4', board);
        assertArrayEqualsIgnoreOrder(center, ['d5', 'e5', 'f5', 'd4', 'f4', 'd3', 'e3', 'f3']);

        // Corner a1 -> 3 adjacent squares
        const corner = getKittenAdjacentSquares('a1', board);
        assertArrayEqualsIgnoreOrder(corner, ['a2', 'b2', 'b1']);

        // Edge a4 -> 5 adjacent squares
        const edge = getKittenAdjacentSquares('a4', board);
        assertArrayEqualsIgnoreOrder(edge, ['a5', 'b5', 'b4', 'b3', 'a3']);
    });

    it('identifies safe moves when attacked by Pawn', () => {
        const board = new Board();
        // Kitten at e4, Pawn at d5 attacking down into e4 and c4
        const pawn = { id: 'p1', type: PIECE_TYPES.PAWN, position: 'd5', direction: 'down' };
        board.setKitten('e4');
        board.addAttacker(pawn);

        // e4 is attacked
        assertEqual(isKittenSafe('e4', [pawn], board), false);

        // Safe adjacent moves: d5 is occupied by pawn, e4 is current position.
        // Adjacent: d5 (occupied), e5 (safe), f5 (safe), d4 (safe), f4 (safe), d3 (safe), e3 (safe), f3 (safe).
        const safeMoves = getSafeKittenMoves('e4', [pawn], board);
        assertArrayEqualsIgnoreOrder(safeMoves, ['e5', 'f5', 'd4', 'f4', 'd3', 'e3', 'f3']);
    });

    it('filters out unsafe squares under crossfire of multiple attackers', () => {
        const board = new Board();
        // Kitten at e4
        // Rook at e8 (attacks entire e-file: e5, e4, e3)
        // Bishop at b1 (attacks diagonal: d3, e4, f5)
        const rook = { id: 'r1', type: PIECE_TYPES.ROOK, position: 'e8' };
        const bishop = { id: 'b1', type: PIECE_TYPES.BISHOP, position: 'b1' };
        board.setKitten('e4');
        board.addAttacker(rook);
        board.addAttacker(bishop);

        const safeMoves = getSafeKittenMoves('e4', [rook, bishop], board);
        // Unsafe adjacent: e5 (rook), e3 (rook), d3 (bishop), f5 (bishop).
        // Safe adjacent: d5, d4, f4, f3.
        assertArrayEqualsIgnoreOrder(safeMoves, ['d5', 'd4', 'f4', 'f3']);
    });

    it('validateKittenMove returns educational feedback for unsafe moves', () => {
        const board = new Board();
        const rook = { id: 'r1', type: PIECE_TYPES.ROOK, position: 'e8' };
        board.setKitten('e4');
        board.addAttacker(rook);

        // Try to move to e5 (attacked by Rook)
        const checkUnsafe = validateKittenMove('e5', 'e4', [rook], board);
        assertEqual(checkUnsafe.valid, false);
        assertEqual(checkUnsafe.code, 'UNSAFE_SQUARE');
        assert(checkUnsafe.message.includes('rook'));

        // Try safe move to d4
        const checkSafe = validateKittenMove('d4', 'e4', [rook], board);
        assertEqual(checkSafe.valid, true);
        assertEqual(checkSafe.code, 'SAFE_MOVE');
    });
});
