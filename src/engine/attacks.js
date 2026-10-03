/**
 * Kitten Attack & Block Puzzle Game - Attack Engine
 * Calculates squares controlled/attacked by each opponent piece type on the 8x8 board.
 */

import { coordToPos, posToCoord, isValidPos } from './board.js';
import { PIECE_TYPES } from './pieces.js';

const ORTHOGONAL_DIRECTIONS = [
    { dx: 0, dy: 1 },   // Up
    { dx: 0, dy: -1 },  // Down
    { dx: -1, dy: 0 },  // Left
    { dx: 1, dy: 0 }    // Right
];

const DIAGONAL_DIRECTIONS = [
    { dx: 1, dy: 1 },   // Up-Right
    { dx: -1, dy: 1 },  // Up-Left
    { dx: 1, dy: -1 },  // Down-Right
    { dx: -1, dy: -1 }  // Down-Left
];

const ALL_EIGHT_DIRECTIONS = [
    ...ORTHOGONAL_DIRECTIONS,
    ...DIAGONAL_DIRECTIONS
];

const KNIGHT_OFFSETS = [
    { dx: 1, dy: 2 },
    { dx: 2, dy: 1 },
    { dx: 2, dy: -1 },
    { dx: 1, dy: -2 },
    { dx: -1, dy: -2 },
    { dx: -2, dy: -1 },
    { dx: -2, dy: 1 },
    { dx: -1, dy: 2 }
];

/**
 * Computes sliding ray attacks (for Bishop, Rook, Queen)
 * Stops at board boundaries, bricks, or intervening pieces.
 */
function getSlidingAttacks(attacker, board, directions) {
    const attacks = [];
    const origin = coordToPos(attacker.position);
    if (!origin) return attacks;

    for (const dir of directions) {
        let col = origin.col + dir.dx;
        let row = origin.row + dir.dy;

        while (isValidPos(col, row)) {
            const coord = posToCoord(col, row);
            attacks.push(coord);

            // If square contains a brick or piece (other than Kitten), the attack ray stops here
            if (board.hasBrick(coord) || (board.getAttacker(coord) && coord !== attacker.position)) {
                break;
            }

            col += dir.dx;
            row += dir.dy;
        }
    }

    return attacks;
}

/**
 * Computes Pawn diagonal forward attacks
 */
function getPawnAttacks(pawn, board) {
    const attacks = [];
    const origin = coordToPos(pawn.position);
    if (!origin) return attacks;

    const direction = pawn.direction || 'down';
    const dy = direction === 'down' ? -1 : 1;

    // Two diagonal forward squares
    const diagonalOffsets = [-1, 1];
    for (const dx of diagonalOffsets) {
        const col = origin.col + dx;
        const row = origin.row + dy;
        if (isValidPos(col, row)) {
            attacks.push(posToCoord(col, row));
        }
    }

    return attacks;
}

/**
 * Computes Knight L-shaped attacks
 */
function getKnightAttacks(knight, board) {
    const attacks = [];
    const origin = coordToPos(knight.position);
    if (!origin) return attacks;

    for (const offset of KNIGHT_OFFSETS) {
        const col = origin.col + offset.dx;
        const row = origin.row + offset.dy;
        if (isValidPos(col, row)) {
            attacks.push(posToCoord(col, row));
        }
    }

    return attacks;
}

/**
 * Computes King 8-square adjacent attacks
 */
function getKingAttacks(king, board) {
    const attacks = [];
    const origin = coordToPos(king.position);
    if (!origin) return attacks;

    for (const dir of ALL_EIGHT_DIRECTIONS) {
        const col = origin.col + dir.dx;
        const row = origin.row + dir.dy;
        if (isValidPos(col, row)) {
            attacks.push(posToCoord(col, row));
        }
    }

    return attacks;
}

/**
 * Returns all squares attacked by a single piece
 * @param {Object} attacker - { type, position, direction }
 * @param {Object} board - Board instance
 * @returns {string[]} Array of attacked coordinate strings
 */
export function getAttackedSquares(attacker, board) {
    if (!attacker || !attacker.position || !board) return [];

    const type = attacker.type.toLowerCase();

    switch (type) {
        case PIECE_TYPES.PAWN:
            return getPawnAttacks(attacker, board);
        case PIECE_TYPES.BISHOP:
            return getSlidingAttacks(attacker, board, DIAGONAL_DIRECTIONS);
        case PIECE_TYPES.KNIGHT:
            return getKnightAttacks(attacker, board);
        case PIECE_TYPES.ROOK:
            return getSlidingAttacks(attacker, board, ORTHOGONAL_DIRECTIONS);
        case PIECE_TYPES.QUEEN:
            return getSlidingAttacks(attacker, board, ALL_EIGHT_DIRECTIONS);
        case PIECE_TYPES.KING:
            return getKingAttacks(attacker, board);
        default:
            return [];
    }
}

/**
 * Returns a Set of all squares attacked by all attackers on the board
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {Set<string>}
 */
export function getAllAttackedSquares(attackers, board) {
    const attackSet = new Set();
    if (!attackers || !Array.isArray(attackers) || !board) return attackSet;

    for (const attacker of attackers) {
        const squares = getAttackedSquares(attacker, board);
        for (const sq of squares) {
            attackSet.add(sq);
        }
    }

    return attackSet;
}

/**
 * Checks if a specific square is under attack by any attacker
 * @param {string} square
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {boolean}
 */
export function isSquareAttacked(square, attackers, board) {
    if (!square) return false;
    const allAttacks = getAllAttackedSquares(attackers, board);
    return allAttacks.has(square.toLowerCase());
}

/**
 * Finds which attackers are attacking a specific square
 * @param {string} square
 * @param {Object[]} attackers
 * @param {Object} board
 * @returns {Object[]}
 */
export function getAttackersForSquare(square, attackers, board) {
    if (!square || !attackers || !board) return [];
    const normalized = square.toLowerCase();
    return attackers.filter(attacker => {
        const attacked = getAttackedSquares(attacker, board);
        return attacked.includes(normalized);
    });
}
