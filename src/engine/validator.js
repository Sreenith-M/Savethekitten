/**
 * Kitten Attack & Block Puzzle Game - Level Validator
 * Ensures puzzle integrity: Kitten starts under attack and at least one valid defensive solution exists (Move, Block, or Capture).
 */

import { Board, isValidCoord } from './board.js';
import { isSquareAttacked, getAttackersForSquare } from './attacks.js';
import { getSafeKittenMoves } from './safety.js';
import { getAllBlockingSquares, simulateBlock } from './blocking.js';
import { getCapturableAttackers } from './capture.js';

/**
 * Validates a level configuration
 * @param {Object} levelConfig
 * @returns {{
 *   valid: boolean,
 *   errors: string[],
 *   safeMoves: string[],
 *   blockingSolutions: string[],
 *   capturableAttackers: Object[],
 *   initialAttackers: Object[]
 * }}
 */
export function validateLevel(levelConfig) {
    const errors = [];

    if (!levelConfig) {
        return {
            valid: false,
            errors: ['Level configuration is undefined.'],
            safeMoves: [],
            blockingSolutions: [],
            capturableAttackers: [],
            initialAttackers: []
        };
    }

    if (!levelConfig.kitten || !levelConfig.kitten.position || !isValidCoord(levelConfig.kitten.position)) {
        errors.push(`Invalid or missing Kitten position: ${levelConfig.kitten?.position}`);
    }

    if (!levelConfig.attackers || !Array.isArray(levelConfig.attackers) || levelConfig.attackers.length === 0) {
        errors.push('Level must contain at least one attacker.');
    }

    if (errors.length > 0) {
        return {
            valid: false,
            errors,
            safeMoves: [],
            blockingSolutions: [],
            capturableAttackers: [],
            initialAttackers: []
        };
    }

    const board = new Board();
    board.setKitten(levelConfig.kitten.position);

    const occupiedCoords = new Set([levelConfig.kitten.position.toLowerCase()]);

    for (const attacker of levelConfig.attackers) {
        if (!isValidCoord(attacker.position)) {
            errors.push(`Invalid attacker coordinate: ${attacker.position} (${attacker.type})`);
            continue;
        }

        const normalized = attacker.position.toLowerCase();
        if (occupiedCoords.has(normalized)) {
            errors.push(`Duplicate coordinate occupancy at: ${attacker.position}`);
        }
        occupiedCoords.add(normalized);
        board.addAttacker(attacker);
    }

    if (errors.length > 0) {
        return {
            valid: false,
            errors,
            safeMoves: [],
            blockingSolutions: [],
            capturableAttackers: [],
            initialAttackers: []
        };
    }

    // 1. Kitten MUST start under attack!
    const kittenPos = levelConfig.kitten.position.toLowerCase();
    const initialAttackers = getAttackersForSquare(kittenPos, levelConfig.attackers, board);

    if (initialAttackers.length === 0) {
        errors.push(`Kitten at ${kittenPos.toUpperCase()} is NOT initially under attack! Every level must start under attack.`);
    }

    // 2. Calculate safe moves
    const safeMoves = getSafeKittenMoves(kittenPos, levelConfig.attackers, board);

    // 3. Calculate blocking solutions (if blocks are allowed)
    const blockingSolutions = [];
    const blocksAllowed = levelConfig.blocksAllowed !== false && (levelConfig.blocksAvailable || 1) > 0;

    if (blocksAllowed) {
        const potentialBlocks = getAllBlockingSquares(levelConfig.attackers, kittenPos, board);
        for (const blockSq of potentialBlocks) {
            const sim = simulateBlock(blockSq, levelConfig.attackers, kittenPos, board);
            if (sim.solvesAttack) {
                blockingSolutions.push(blockSq);
            }
        }
    }

    // 4. Calculate capturable attackers (adjacent unsupported attackers)
    const capturableAttackers = getCapturableAttackers(kittenPos, levelConfig.attackers, board);

    // 5. Verify at least one valid solution exists (Move, Block, or Capture)
    const totalSolutions = safeMoves.length + blockingSolutions.length + capturableAttackers.length;
    if (totalSolutions === 0) {
        errors.push(`Impossible puzzle! Kitten at ${kittenPos.toUpperCase()} has 0 safe moves, 0 blocking solutions, and 0 capturable attackers.`);
    }

    return {
        valid: errors.length === 0,
        errors,
        safeMoves,
        blockingSolutions,
        capturableAttackers,
        initialAttackers
    };
}
