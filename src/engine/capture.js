/**
 * Kitten Attack & Block Puzzle Game - Capture Engine
 * Manages adjacent enemy detection, support/protection calculation, and capture validation.
 */

import { getKittenAdjacentSquares, isKittenSafe } from './safety.js';
import { getAttackersForSquare, isSquareAttacked } from './attacks.js';

/**
 * Finds all attackers immediately adjacent to the Kitten
 * @param {string} kittenPosition
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {Object[]} Array of adjacent attacker objects
 */
export function getAdjacentAttackers(kittenPosition, attackers, board) {
    if (!kittenPosition || !attackers || !board) return [];

    const adjacentCoords = getKittenAdjacentSquares(kittenPosition, board);
    return attackers.filter(a => adjacentCoords.includes(a.position.toLowerCase()));
}

/**
 * Determines which other attackers protect/support a target piece
 * (i.e. another opponent piece attacks the target piece's square).
 *
 * NOTE: Excludes the target piece itself from supporting itself.
 *
 * @param {Object} targetPiece - The attacker being inspected for support
 * @param {Object[]} attackers - All attackers on the board
 * @param {Object} board - The board instance
 * @returns {Object[]} Array of supporting attacker objects
 */
export function getSupportingAttackers(targetPiece, attackers, board) {
    if (!targetPiece || !targetPiece.position || !attackers || !board) return [];

    const targetPos = targetPiece.position.toLowerCase();

    // Filter out the target piece itself
    const otherAttackers = attackers.filter(a => {
        if (targetPiece.id && a.id) {
            return a.id !== targetPiece.id;
        }
        return a.position.toLowerCase() !== targetPos;
    });

    return getAttackersForSquare(targetPos, otherAttackers, board);
}

/**
 * Checks whether an attacking piece is protected/supported by another attacker
 * @param {Object} targetPiece
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {boolean} True if supported by another piece
 */
export function isPieceSupported(targetPiece, attackers, board) {
    const supporters = getSupportingAttackers(targetPiece, attackers, board);
    return supporters.length > 0;
}

/**
 * Validates if the Kitten can safely capture a specific target piece.
 *
 * Requirements:
 * 1. Target must be adjacent to the Kitten.
 * 2. Target must NOT be supported by any other attacker.
 * 3. After capture (Kitten replaces target, target is removed), Kitten must be safe from any remaining attackers.
 *
 * @param {Object} targetPiece
 * @param {string} kittenPosition
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {{ valid: boolean, code: string, message: string, supporters?: Object[] }}
 */
export function canKittenCapture(targetPiece, kittenPosition, attackers, board) {
    if (!targetPiece || !kittenPosition || !board) {
        return { valid: false, code: 'INVALID_INPUT', message: 'Invalid capture target.' };
    }

    const targetPos = targetPiece.position.toLowerCase();
    const adjacentCoords = getKittenAdjacentSquares(kittenPosition, board);

    // 1. Must be adjacent
    if (!adjacentCoords.includes(targetPos)) {
        return {
            valid: false,
            code: 'NOT_ADJACENT',
            message: 'Target attacker is not adjacent to Kitten.'
        };
    }

    // 2. Must not be supported/protected
    const supporters = getSupportingAttackers(targetPiece, attackers, board);
    if (supporters.length > 0) {
        const supporterNames = supporters.map(s => s.type).join(', ');
        return {
            valid: false,
            code: 'TARGET_SUPPORTED',
            message: `❌ Cannot capture! Target is protected by ${supporterNames}.`,
            supporters
        };
    }

    // 3. Simulate capture and test Kitten safety at destination
    const sim = simulateCapture(targetPiece, kittenPosition, attackers, board);
    if (!sim.isSafe) {
        return {
            valid: false,
            code: 'UNSAFE_AFTER_CAPTURE',
            message: `❌ Capture leaves Kitten under attack by remaining enemies!`
        };
    }

    return {
        valid: true,
        code: 'VALID_CAPTURE',
        message: 'Kitten can safely capture this attacker!'
    };
}

/**
 * Returns all adjacent attackers that the Kitten can legally capture
 * @param {string} kittenPosition
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {Object[]} Array of capturable attacker objects
 */
export function getCapturableAttackers(kittenPosition, attackers, board) {
    const adjacent = getAdjacentAttackers(kittenPosition, attackers, board);
    return adjacent.filter(target => {
        const validation = canKittenCapture(target, kittenPosition, attackers, board);
        return validation.valid;
    });
}

/**
 * Simulates executing a capture on a target attacker and calculates resulting safety
 * @param {Object} targetPiece
 * @param {string} kittenPosition
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {{ nextBoard: Object, remainingAttackers: Object[], isSafe: boolean }}
 */
export function simulateCapture(targetPiece, kittenPosition, attackers, board) {
    const nextBoard = board.clone();
    const targetPos = targetPiece.position.toLowerCase();

    // Remove target from board
    nextBoard.removeAttacker(targetPos);

    // Place Kitten at target square
    nextBoard.setKitten(targetPos);

    // Remaining attackers
    const remainingAttackers = attackers.filter(a => {
        if (targetPiece.id && a.id) {
            return a.id !== targetPiece.id;
        }
        return a.position.toLowerCase() !== targetPos;
    });

    const isSafe = isKittenSafe(targetPos, remainingAttackers, nextBoard);

    return {
        nextBoard,
        remainingAttackers,
        isSafe
    };
}
