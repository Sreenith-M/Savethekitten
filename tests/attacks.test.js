/**
 * Save The Kitten - Attacks Engine Unit Tests
 */

import { describe, it, assertEqual, assertArrayEqualsIgnoreOrder } from './testHelper.js';
import { Board } from '../src/engine/board.js';
import { PIECE_TYPES } from '../src/engine/pieces.js';
import {
    getAttackedSquares,
    getAllAttackedSquares,
    isSquareAttacked,
    getAttackersForSquare
} from '../src/engine/attacks.js';

describe('Attacks Engine Tests (Chess-like threat patterns)', () => {
    it('Pawn: attacks two forward diagonal squares based on direction', () => {
        const board = new Board();
        // Pawn at d5 attacking down -> attacks c4 and e4
        const pawnDown = { type: PIECE_TYPES.PAWN, position: 'd5', direction: 'down' };
        const attacksDown = getAttackedSquares(pawnDown, board);
        assertArrayEqualsIgnoreOrder(attacksDown, ['c4', 'e4']);

        // Pawn at d4 attacking up -> attacks c5 and e5
        const pawnUp = { type: PIECE_TYPES.PAWN, position: 'd4', direction: 'up' };
        const attacksUp = getAttackedSquares(pawnUp, board);
        assertArrayEqualsIgnoreOrder(attacksUp, ['c5', 'e5']);
    });

    it('Bishop: attacks along diagonal lines and is stopped by obstacles', () => {
        const board = new Board();
        // Bishop at c1 on open board
        const bishop = { type: PIECE_TYPES.BISHOP, position: 'c1' };
        const attacksOpen = getAttackedSquares(bishop, board);
        // c1 diagonals: b2, a3, d2, e3, f4, g5, h6
        assertArrayEqualsIgnoreOrder(attacksOpen, ['b2', 'a3', 'd2', 'e3', 'f4', 'g5', 'h6']);

        // Add a brick on e3 to block the ray
        board.addBrick('e3');
        const attacksBlocked = getAttackedSquares(bishop, board);
        // Ray should hit e3 and stop (f4, g5, h6 are now protected/unattacked!)
        assertArrayEqualsIgnoreOrder(attacksBlocked, ['b2', 'a3', 'd2', 'e3']);
    });

    it('Knight: attacks L-shaped squares and jumps over obstacles', () => {
        const board = new Board();
        // Knight at e4 (center) -> 8 L-shaped targets
        const knight = { type: PIECE_TYPES.KNIGHT, position: 'e4' };
        const attacks = getAttackedSquares(knight, board);
        const expected = ['f6', 'd6', 'g5', 'c5', 'g3', 'c3', 'f2', 'd2'];
        assertArrayEqualsIgnoreOrder(attacks, expected);

        // Surrounding squares with bricks does not stop Knight (Knight jumps!)
        board.addBrick('e5');
        board.addBrick('f5');
        const attacksAfterBricks = getAttackedSquares(knight, board);
        assertArrayEqualsIgnoreOrder(attacksAfterBricks, expected);
    });

    it('Rook: attacks horizontal and vertical lines and is stopped by obstacles', () => {
        const board = new Board();
        // Rook at a1 on open board -> all of file a and rank 1
        const rook = { type: PIECE_TYPES.ROOK, position: 'a1' };
        const attacks = getAttackedSquares(rook, board);
        const expected = [
            'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8',
            'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
        ];
        assertArrayEqualsIgnoreOrder(attacks, expected);

        // Block with a brick on a3
        board.addBrick('a3');
        const attacksBlocked = getAttackedSquares(rook, board);
        const expectedBlocked = [
            'a2', 'a3',
            'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
        ];
        assertArrayEqualsIgnoreOrder(attacksBlocked, expectedBlocked);
    });

    it('Queen: combines horizontal, vertical, and diagonal lines', () => {
        const board = new Board();
        const queen = { type: PIECE_TYPES.QUEEN, position: 'd4' };
        const attacks = getAttackedSquares(queen, board);
        // Total squares for queen at d4: 7 horizontal + 7 vertical + 13 diagonal = 27
        assertEqual(attacks.length, 27);
    });

    it('King: attacks all 8 surrounding squares', () => {
        const board = new Board();
        const kingCenter = { type: PIECE_TYPES.KING, position: 'e4' };
        const attacksCenter = getAttackedSquares(kingCenter, board);
        assertArrayEqualsIgnoreOrder(attacksCenter, ['d5', 'e5', 'f5', 'd4', 'f4', 'd3', 'e3', 'f3']);

        // Corner king (a1)
        const kingCorner = { type: PIECE_TYPES.KING, position: 'a1' };
        const attacksCorner = getAttackedSquares(kingCorner, board);
        assertArrayEqualsIgnoreOrder(attacksCorner, ['a2', 'b2', 'b1']);
    });

    it('getAllAttackedSquares computes union of multiple attackers', () => {
        const board = new Board();
        const pawn = { id: 'p1', type: PIECE_TYPES.PAWN, position: 'd5', direction: 'down' };
        const knight = { id: 'k1', type: PIECE_TYPES.KNIGHT, position: 'c5' };

        const union = getAllAttackedSquares([pawn, knight], board);
        // Pawn attacks c4, e4. Knight at c5 attacks e4, b7, d7, a6, e6, a4, e4, b3, d3.
        assertEqual(union.has('e4'), true);
        assertEqual(union.has('c4'), true);
        assertEqual(union.has('b3'), true);
        assertEqual(union.has('h8'), false);

        assertEqual(isSquareAttacked('e4', [pawn, knight], board), true);
        assertEqual(isSquareAttacked('h8', [pawn, knight], board), false);

        const attackersForE4 = getAttackersForSquare('e4', [pawn, knight], board);
        assertEqual(attackersForE4.length, 2);
    });
});
