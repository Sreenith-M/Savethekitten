/**
 * Save The Kitten - Capture & Support Engine Unit Tests
 */

import { describe, it, assert, assertEqual } from './testHelper.js';
import { Board } from '../src/engine/board.js';
import { PIECE_TYPES } from '../src/engine/pieces.js';
import {
    getAdjacentAttackers,
    getSupportingAttackers,
    isPieceSupported,
    canKittenCapture,
    getCapturableAttackers,
    simulateCapture
} from '../src/engine/capture.js';
import { GameState, GAME_MODES } from '../src/game/gameState.js';

describe('Capture & Support Engine Tests (Adjacent unsupported capture)', () => {
    it('identifies adjacent attackers vs far-away attackers', () => {
        const board = new Board();
        board.setKitten('e4');

        const pawn = { id: 'p1', type: PIECE_TYPES.PAWN, position: 'd5', direction: 'down' };
        const rook = { id: 'r1', type: PIECE_TYPES.ROOK, position: 'e8' };
        board.addAttacker(pawn);
        board.addAttacker(rook);

        const adjacent = getAdjacentAttackers('e4', [pawn, rook], board);
        assertEqual(adjacent.length, 1);
        assertEqual(adjacent[0].id, 'p1');
    });

    it('calculates support correctly and NEVER counts the target as supporting itself', () => {
        const board = new Board();
        board.setKitten('d4');

        const pawn = { id: 'p1', type: PIECE_TYPES.PAWN, position: 'c5', direction: 'down' };
        board.addAttacker(pawn);

        // Lone pawn: cannot support itself
        const supporters1 = getSupportingAttackers(pawn, [pawn], board);
        assertEqual(supporters1.length, 0);
        assertEqual(isPieceSupported(pawn, [pawn], board), false);

        // Add Bishop at a7 that attacks c5
        const bishop = { id: 'b1', type: PIECE_TYPES.BISHOP, position: 'a7' };
        board.addAttacker(bishop);

        const supporters2 = getSupportingAttackers(pawn, [pawn, bishop], board);
        assertEqual(supporters2.length, 1);
        assertEqual(supporters2[0].id, 'b1');
        assertEqual(isPieceSupported(pawn, [pawn, bishop], board), true);
    });

    it('permits capture for unsupported adjacent attacker', () => {
        const board = new Board();
        board.setKitten('d4');

        const pawn = { id: 'p1', type: PIECE_TYPES.PAWN, position: 'c5', direction: 'down' };
        board.addAttacker(pawn);

        const validation = canKittenCapture(pawn, 'd4', [pawn], board);
        assertEqual(validation.valid, true);
        assertEqual(validation.code, 'VALID_CAPTURE');

        const capturables = getCapturableAttackers('d4', [pawn], board);
        assertEqual(capturables.length, 1);
    });

    it('forbids capture when attacker is protected by another piece', () => {
        const board = new Board();
        board.setKitten('d4');

        const pawn = { id: 'p1', type: PIECE_TYPES.PAWN, position: 'c5', direction: 'down' };
        const bishop = { id: 'b1', type: PIECE_TYPES.BISHOP, position: 'a7' };
        board.addAttacker(pawn);
        board.addAttacker(bishop);

        const validation = canKittenCapture(pawn, 'd4', [pawn, bishop], board);
        assertEqual(validation.valid, false);
        assertEqual(validation.code, 'TARGET_SUPPORTED');
        assert(validation.message.includes('protected'));

        const capturables = getCapturableAttackers('d4', [pawn, bishop], board);
        assertEqual(capturables.length, 0);
    });

    it('forbids capture if capture would leave Kitten under attack by remaining enemies', () => {
        const board = new Board();
        board.setKitten('e4');

        const pawn = { id: 'p1', type: PIECE_TYPES.PAWN, position: 'e5', direction: 'down' };
        const rook = { id: 'r1', type: PIECE_TYPES.ROOK, position: 'a5' };
        board.addAttacker(pawn);
        board.addAttacker(rook);

        const validation = canKittenCapture(pawn, 'e4', [pawn, rook], board);
        assertEqual(validation.valid, false);
    });

    it('King attacker edge case: unsupported King can be captured, protected King cannot', () => {
        const board = new Board();
        board.setKitten('d4');

        const king = { id: 'k1', type: PIECE_TYPES.KING, position: 'd5' };
        board.addAttacker(king);

        // Unsupported King:
        const validation1 = canKittenCapture(king, 'd4', [king], board);
        assertEqual(validation1.valid, true);

        // Guarded King by Rook at h5:
        const rook = { id: 'r1', type: PIECE_TYPES.ROOK, position: 'h5' };
        board.addAttacker(rook);

        const validation2 = canKittenCapture(king, 'd4', [king, rook], board);
        assertEqual(validation2.valid, false);
        assertEqual(validation2.code, 'TARGET_SUPPORTED');
    });

    it('Game integration: executes capture in Level 6 and solves puzzle', () => {
        const game = new GameState();
        game.initLevel(5); // Level 6: Lone Pawn at c5, Kitten at d4

        const summary1 = game.getStateSummary();
        assertEqual(summary1.canCapture, true);
        assertEqual(summary1.capturableAttackers.length, 1);

        game.setMode(GAME_MODES.CAPTURE);
        game.handleSquareClick('c5');

        const summary2 = game.getStateSummary();
        assertEqual(summary2.isLevelComplete, true);
        assertEqual(summary2.kittenPosition, 'c5');
        assertEqual(summary2.board.getAttacker('c5'), null);
        assertEqual(summary2.lastAction.type, 'CAPTURE');
    });

    it('Game integration: prevents capture in Level 11 when attacker is guarded', () => {
        const game = new GameState();
        game.initLevel(10); // Level 11: Bishop at a7 guards Pawn at c5

        const summary1 = game.getStateSummary();
        assertEqual(summary1.canCapture, false);

        // Try forced capture on c5
        game.handleCaptureAttempt('c5');
        assertEqual(game.isLevelComplete, false);
        assert(game.failureExplanation.includes('protected'));
    });
});
