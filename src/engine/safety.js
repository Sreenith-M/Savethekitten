/**
 * Kitten Attack & Block Puzzle Game - Safety Engine
 * Calculates Kitten's adjacent squares, safe escape destinations, and threat evaluations.
 */

import { coordToPos, posToCoord, isValidPos } from './board.js';
import { getAllAttackedSquares, isSquareAttacked, getAttackersForSquare } from './attacks.js';

const ADJACENT_DIRECTIONS = [
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 }
];

/**
 * Returns all valid squares adjacent to the Kitten (up to 8, or fewer at corners/edges)
 * @param {string} kittenPosition
 * @param {Object} board
 * @returns {string[]}
 */
export function getKittenAdjacentSquares(kittenPosition, board) {
    if (!kittenPosition || !board) return [];

    const pos = coordToPos(kittenPosition);
    if (!pos) return [];

    const squares = [];
    for (const dir of ADJACENT_DIRECTIONS) {
        const col = pos.col + dir.dx;
        const row = pos.row + dir.dy;
        if (isValidPos(col, row)) {
            squares.push(posToCoord(col, row));
        }
    }

    return squares;
}

/**
 * Checks if the Kitten at its current position is completely safe from all attacks
 * @param {string} kittenPosition
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {boolean} True if Kitten is not attacked
 */
export function isKittenSafe(kittenPosition, attackers, board) {
    if (!kittenPosition || !board) return true;
    return !isSquareAttacked(kittenPosition, attackers, board);
}

/**
 * Calculates all genuine safe adjacent squares the Kitten can move to.
 * 
 * Rules:
 * 1. Must be adjacent to Kitten.
 * 2. Must not be occupied by a brick or attacker.
 * 3. Must not be attacked by ANY opponent.
 * 
 * @param {string} kittenPosition
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {string[]} Array of safe coordinate strings
 */
export function getSafeKittenMoves(kittenPosition, attackers, board) {
    if (!kittenPosition || !board) return [];

    const adjacentSquares = getKittenAdjacentSquares(kittenPosition, board);
    const attackedSquares = getAllAttackedSquares(attackers, board);
    const safeMoves = [];

    for (const sq of adjacentSquares) {
        // Cannot step onto brick or attacker
        if (board.hasBrick(sq) || board.getAttacker(sq)) {
            continue;
        }

        // Cannot step onto a square attacked by any opponent
        if (!attackedSquares.has(sq)) {
            safeMoves.push(sq);
        }
    }

    return safeMoves;
}

/**
 * Validates a proposed move for the Kitten and provides educational feedback
 * @param {string} destCoord
 * @param {string} kittenPosition
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {{ valid: boolean, code: string, message: string, attackers: Object[] }}
 */
export function validateKittenMove(destCoord, kittenPosition, attackers, board) {
    if (!destCoord || !kittenPosition || !board) {
        return { valid: false, code: 'INVALID_INPUT', message: 'Invalid move input.', attackers: [] };
    }

    const normalizedDest = destCoord.toLowerCase();
    const adjacent = getKittenAdjacentSquares(kittenPosition, board);

    if (!adjacent.includes(normalizedDest)) {
        return {
            valid: false,
            code: 'NOT_ADJACENT',
            message: 'The Kitten can only take 1 step to an adjacent square.',
            attackers: []
        };
    }

    if (board.hasBrick(normalizedDest)) {
        return {
            valid: false,
            code: 'BLOCKED_BY_BRICK',
            message: 'That square is blocked by a brick!',
            attackers: []
        };
    }

    if (board.getAttacker(normalizedDest)) {
        return {
            valid: false,
            code: 'OCCUPIED_BY_ATTACKER',
            message: 'An opponent piece is on that square!',
            attackers: []
        };
    }

    const attackingPieces = getAttackersForSquare(normalizedDest, attackers, board);
    if (attackingPieces.length > 0) {
        const pieceNames = attackingPieces.map(p => `${p.type}`).join(' and ');
        return {
            valid: false,
            code: 'UNSAFE_SQUARE',
            message: `❌ Unsafe move! The ${pieceNames} still attacks ${destCoord.toUpperCase()}.`,
            attackers: attackingPieces
        };
    }

    return {
        valid: true,
        code: 'SAFE_MOVE',
        message: 'Move is safe!',
        attackers: []
    };
}
