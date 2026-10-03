/**
 * Kitten Attack & Block Puzzle Game - Blocking Engine
 * Calculates line-of-attack intermediate squares, blocking availability, and simulates block resolution.
 */

import { coordToPos, posToCoord } from './board.js';
import { PIECE_TYPES } from './pieces.js';
import { getAttackedSquares, isSquareAttacked, getAttackersForSquare } from './attacks.js';
import { isKittenSafe } from './safety.js';

/**
 * Computes intermediate squares strictly between an attacker and the Kitten (excluding endpoints)
 * Only sliding pieces (Bishop, Rook, Queen) have a line of attack that can be physically blocked.
 * 
 * @param {Object} attacker
 * @param {string} kittenPosition
 * @returns {string[]} Array of coordinates along the line
 */
export function getCheckLine(attacker, kittenPosition) {
    if (!attacker || !attacker.position || !kittenPosition) return [];

    const type = attacker.type.toLowerCase();
    // Knights jump; Pawns and Kings are adjacent - none have blockable lines
    if (type === PIECE_TYPES.KNIGHT || type === PIECE_TYPES.PAWN || type === PIECE_TYPES.KING) {
        return [];
    }

    const p1 = coordToPos(attacker.position);
    const p2 = coordToPos(kittenPosition);
    if (!p1 || !p2) return [];

    const dCol = p2.col - p1.col;
    const dRow = p2.row - p1.row;

    // Check if on straight line or diagonal
    const isOrthogonal = (dCol === 0 && dRow !== 0) || (dCol !== 0 && dRow === 0);
    const isDiagonal = Math.abs(dCol) === Math.abs(dRow) && dCol !== 0;

    if (!isOrthogonal && !isDiagonal) return [];
    if (type === PIECE_TYPES.ROOK && !isOrthogonal) return [];
    if (type === PIECE_TYPES.BISHOP && !isDiagonal) return [];

    const stepCol = dCol === 0 ? 0 : dCol / Math.abs(dCol);
    const stepRow = dRow === 0 ? 0 : dRow / Math.abs(dRow);

    const line = [];
    let curCol = p1.col + stepCol;
    let curRow = p1.row + stepRow;

    while (curCol !== p2.col || curRow !== p2.row) {
        line.push(posToCoord(curCol, curRow));
        curCol += stepCol;
        curRow += stepRow;
    }

    return line;
}

/**
 * Checks if a specific attacker attacking the Kitten can be blocked
 * @param {Object} attacker
 * @param {string} kittenPosition
 * @param {Object} board
 * @returns {boolean}
 */
export function canBlockAttack(attacker, kittenPosition, board) {
    if (!attacker || !kittenPosition || !board) return false;
    const blockingSquares = getBlockingSquares(attacker, kittenPosition, board);
    return blockingSquares.length > 0;
}

/**
 * Returns all valid squares where a brick can be placed to intercept a sliding attack on the Kitten
 * @param {Object} attacker
 * @param {string} kittenPosition
 * @param {Object} board
 * @returns {string[]} Array of empty coordinates on the check line
 */
export function getBlockingSquares(attacker, kittenPosition, board) {
    if (!attacker || !kittenPosition || !board) return [];

    // Check if this attacker is currently attacking Kitten
    const attacked = getAttackedSquares(attacker, board);
    if (!attacked.includes(kittenPosition.toLowerCase())) {
        return [];
    }

    const line = getCheckLine(attacker, kittenPosition);
    // Filter to only unoccupied squares on the board
    return line.filter(coord => !board.isOccupied(coord));
}

/**
 * Returns all possible blocking squares for all active attackers currently targeting the Kitten
 * @param {Object[]} attackers
 * @param {string} kittenPosition
 * @param {Object} board
 * @returns {string[]} Array of unique coordinate strings
 */
export function getAllBlockingSquares(attackers, kittenPosition, board) {
    const blockingSet = new Set();
    if (!attackers || !kittenPosition || !board) return [];

    for (const attacker of attackers) {
        const squares = getBlockingSquares(attacker, kittenPosition, board);
        for (const sq of squares) {
            blockingSet.add(sq);
        }
    }

    return Array.from(blockingSet);
}

/**
 * Simulates placing a block at `blockCoord` and verifies if the Kitten becomes safe
 * @param {string} blockCoord
 * @param {Object[]} attackers
 * @param {string} kittenPosition
 * @param {Object} board
 * @returns {{ solvesAttack: boolean, remainingAttackers: Object[] }}
 */
export function simulateBlock(blockCoord, attackers, kittenPosition, board) {
    const simBoard = board.clone();
    simBoard.addBrick(blockCoord);

    const safe = isKittenSafe(kittenPosition, attackers, simBoard);
    const remainingAttackers = getAttackersForSquare(kittenPosition, attackers, simBoard);

    return {
        solvesAttack: safe,
        remainingAttackers
    };
}
