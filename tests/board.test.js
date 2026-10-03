/**
 * Save The Kitten - Board Engine Unit Tests
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from './testHelper.js';
import {
    coordToPos,
    posToCoord,
    isValidCoord,
    isValidPos,
    generateAllCoords,
    Board
} from '../src/engine/board.js';
import { PIECE_TYPES } from '../src/engine/pieces.js';

describe('Board Engine Tests (8x8 Chessboard Grid)', () => {
    it('converts coordinates and positions', () => {
        assertDeepEqual(coordToPos('a1'), { col: 0, row: 0 });
        assertDeepEqual(coordToPos('h8'), { col: 7, row: 7 });
        assertDeepEqual(coordToPos('e4'), { col: 4, row: 3 });

        assertEqual(posToCoord(0, 0), 'a1');
        assertEqual(posToCoord(7, 7), 'h8');
        assertEqual(posToCoord(4, 3), 'e4');
    });

    it('validates positions and generates 64 coordinates', () => {
        assertEqual(isValidPos(0, 0), true);
        assertEqual(isValidPos(7, 7), true);
        assertEqual(isValidPos(-1, 0), false);
        assertEqual(isValidPos(0, 8), false);

        assertEqual(isValidCoord('a1'), true);
        assertEqual(isValidCoord('h8'), true);
        assertEqual(isValidCoord('z9'), false);
        assertEqual(isValidCoord(''), false);

        const allCoords = generateAllCoords();
        assertEqual(allCoords.length, 64);
        assert(allCoords.includes('a1'));
        assert(allCoords.includes('h8'));
    });

    it('tracks Kitten, Attackers, and Bricks with deep cloning', () => {
        const board = new Board();
        board.setKitten('e4');
        assertEqual(board.getKitten(), 'e4');

        const attacker = {
            id: 'pawn-1',
            type: PIECE_TYPES.PAWN,
            position: 'd5',
            direction: 'down'
        };
        board.addAttacker(attacker);
        assertDeepEqual(board.getAttacker('d5'), attacker);
        assertEqual(board.getAllAttackers().length, 1);

        assertEqual(board.isOccupied('e4'), true);
        assertEqual(board.isOccupied('d5'), true);
        assertEqual(board.isOccupied('a1'), false);

        board.addBrick('c4');
        assertEqual(board.hasBrick('c4'), true);
        assertEqual(board.isOccupied('c4'), true);

        // Test deep clone
        const clone = board.clone();
        assertEqual(clone.getKitten(), 'e4');
        assertEqual(clone.hasBrick('c4'), true);
        assertEqual(clone.getAllAttackers().length, 1);

        // Modify clone should not affect original
        clone.setKitten('a1');
        clone.removeBrick('c4');
        assertEqual(board.getKitten(), 'e4');
        assertEqual(board.hasBrick('c4'), true);
    });
});
