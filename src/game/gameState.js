/**
 * Save The Kitten - Centralized Game State Machine
 * Coordinates board state, action modes (Move / Block / Capture), threat recalculations, and level progression.
 */

import { Board } from '../engine/board.js';
import { isSquareAttacked, getAttackersForSquare, getAllAttackedSquares } from '../engine/attacks.js';
import { getSafeKittenMoves, getKittenAdjacentSquares, validateKittenMove, isKittenSafe } from '../engine/safety.js';
import { getAllBlockingSquares, simulateBlock } from '../engine/blocking.js';
import { getAdjacentAttackers, getCapturableAttackers, canKittenCapture, simulateCapture } from '../engine/capture.js';
import { LevelLoader } from './levelLoader.js';
import { progression } from './progression.js';

export const GAME_MODES = Object.freeze({
    MOVE: 'MOVE',
    BLOCK: 'BLOCK',
    CAPTURE: 'CAPTURE'
});

export class GameState {
    constructor() {
        this.board = new Board();
        this.currentLevelIndex = progression.getCurrentLevel();
        this.currentLevelData = null;
        this.activeMode = GAME_MODES.MOVE;
        this.blocksRemaining = 1;
        this.isLevelComplete = false;
        this.lastAction = null;
        this.failureExplanation = null;
        this.attemptCount = 0;

        this.safeMoves = [];
        this.blockingSquares = [];
        this.capturableAttackers = [];
        this.initialAttackers = [];

        this.listeners = new Set();

        this.initLevel(this.currentLevelIndex);
    }

    /**
     * Subscribe to game state changes
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.add(callback);
        callback(this.getStateSummary());
        return () => this.listeners.delete(callback);
    }

    /**
     * Notifies all subscribers of state changes
     * @param {string} eventType
     * @param {Object} extraData
     */
    notify(eventType = 'STATE_CHANGED', extraData = {}) {
        const summary = this.getStateSummary();
        summary.eventType = eventType;
        summary.extra = extraData;
        for (const listener of this.listeners) {
            listener(summary);
        }
    }

    /**
     * Initializes a level by index
     * @param {number} levelIndex
     */
    initLevel(levelIndex) {
        const total = LevelLoader.getLevelCount();
        if (levelIndex < 0 || levelIndex >= total) {
            levelIndex = 0;
        }

        this.currentLevelIndex = levelIndex;
        progression.setCurrentLevel(levelIndex);

        const { levelData, validation } = LevelLoader.loadLevelByIndex(levelIndex);
        this.currentLevelData = levelData;

        this.board.clear();
        this.isLevelComplete = false;
        this.lastAction = null;
        this.failureExplanation = null;
        this.attemptCount = 0;

        // Place Kitten
        this.board.setKitten(levelData.kitten.position);

        // Place Attackers
        for (const attacker of levelData.attackers) {
            this.board.addAttacker(attacker);
        }

        // Configure Blocks
        this.blocksRemaining = levelData.blocksAvailable !== undefined
            ? levelData.blocksAvailable
            : (levelData.blocksAllowed ? 1 : 0);

        this.safeMoves = validation.safeMoves;
        this.blockingSquares = validation.blockingSolutions;
        this.capturableAttackers = validation.capturableAttackers;
        this.initialAttackers = validation.initialAttackers;

        // Default mode: MOVE
        this.activeMode = GAME_MODES.MOVE;

        this.notify('LEVEL_LOADED');
    }

    /**
     * Resets the current level to start state
     */
    resetLevel() {
        this.initLevel(this.currentLevelIndex);
    }

    /**
     * Advances to the next level
     */
    nextLevel() {
        const total = LevelLoader.getLevelCount();
        if (this.currentLevelIndex < total - 1) {
            this.initLevel(this.currentLevelIndex + 1);
        }
    }

    /**
     * Returns to the previous level
     */
    prevLevel() {
        if (this.currentLevelIndex > 0) {
            this.initLevel(this.currentLevelIndex - 1);
        }
    }

    /**
     * Switches player defensive mode
     * @param {string} mode - 'MOVE' | 'BLOCK' | 'CAPTURE'
     */
    setMode(mode) {
        const summary = this.getStateSummary();

        if (mode === GAME_MODES.BLOCK && !summary.canBlock) {
            this.notify('BLOCK_UNAVAILABLE', {
                message: '🧱 Blocking is not available for this attack (e.g. jumping Knight, King, or no blocks left).'
            });
            return;
        }

        if (mode === GAME_MODES.CAPTURE && !summary.canCapture) {
            this.notify('CAPTURE_UNAVAILABLE', {
                message: '⚔️ Capture is not available (no adjacent unsupported attackers).'
            });
            return;
        }

        this.activeMode = mode;
        this.failureExplanation = null;
        this.notify('MODE_CHANGED', { mode });
    }

    /**
     * Handles square click on the board
     * @param {string} coord
     */
    handleSquareClick(coord) {
        if (this.isLevelComplete) return;

        const normalizedCoord = coord.toLowerCase();

        if (this.activeMode === GAME_MODES.MOVE) {
            this.handleMoveAttempt(normalizedCoord);
        } else if (this.activeMode === GAME_MODES.BLOCK) {
            this.handleBlockAttempt(normalizedCoord);
        } else if (this.activeMode === GAME_MODES.CAPTURE) {
            this.handleCaptureAttempt(normalizedCoord);
        }
    }

    /**
     * Executes or validates Kitten movement
     * @param {string} destCoord
     */
    handleMoveAttempt(destCoord) {
        this.attemptCount++;
        const kittenPos = this.board.getKitten();
        const attackers = this.board.getAllAttackers();
        const validation = validateKittenMove(destCoord, kittenPos, attackers, this.board);

        if (!validation.valid) {
            this.failureExplanation = validation.message;
            this.notify('UNSAFE_MOVE_ATTEMPTED', {
                destCoord,
                message: validation.message,
                code: validation.code
            });
            return;
        }

        // Safe move
        const oldPos = kittenPos;
        this.board.setKitten(destCoord);
        this.lastAction = { type: 'MOVE', from: oldPos, to: destCoord };
        this.isLevelComplete = true;
        this.failureExplanation = null;

        progression.markLevelCompleted(this.currentLevelIndex);

        this.notify('MOVE_EXECUTED', { from: oldPos, to: destCoord });
        this.notify('LEVEL_COMPLETED', {
            message: '🎉 SAFE! You escaped the attack!',
            actionType: 'MOVE'
        });
    }

    /**
     * Executes or validates block placement
     * @param {string} blockCoord
     */
    handleBlockAttempt(blockCoord) {
        this.attemptCount++;
        if (this.blocksRemaining <= 0) {
            this.notify('NO_BLOCKS_LEFT', { message: 'No blocks remaining.' });
            return;
        }

        if (this.board.isOccupied(blockCoord)) {
            this.failureExplanation = '❌ Square is already occupied! Choose an empty square.';
            this.notify('INVALID_BLOCK_PLACEMENT', { message: this.failureExplanation });
            return;
        }

        const kittenPos = this.board.getKitten();
        const attackers = this.board.getAllAttackers();

        // Place brick temporarily
        this.board.addBrick(blockCoord);

        // Recalculate if Kitten is safe
        const safe = isKittenSafe(kittenPos, attackers, this.board);

        if (safe) {
            this.blocksRemaining--;
            this.isLevelComplete = true;
            this.lastAction = { type: 'BLOCK', at: blockCoord };
            this.failureExplanation = null;

            progression.markLevelCompleted(this.currentLevelIndex);

            this.notify('BLOCK_PLACED', { coord: blockCoord });
            this.notify('LEVEL_COMPLETED', {
                message: '✅ ATTACK BLOCKED! The Kitten is safe!',
                actionType: 'BLOCK'
            });
        } else {
            // Remove ineffective block and allow retry
            this.board.removeBrick(blockCoord);
            this.failureExplanation = '❌ The attack is still active. Try another position.';
            this.notify('BLOCK_FAILED', {
                coord: blockCoord,
                message: this.failureExplanation
            });
        }
    }

    /**
     * Executes or validates capturing an adjacent attacker
     * @param {string} targetCoord
     */
    handleCaptureAttempt(targetCoord) {
        this.attemptCount++;
        const kittenPos = this.board.getKitten();
        const attackers = this.board.getAllAttackers();
        const target = this.board.getAttacker(targetCoord);

        if (!target) {
            this.failureExplanation = '❌ No enemy piece on that square. Click an adjacent attacker to capture.';
            this.notify('INVALID_CAPTURE_TARGET', { message: this.failureExplanation });
            return;
        }

        const validation = canKittenCapture(target, kittenPos, attackers, this.board);

        if (!validation.valid) {
            this.failureExplanation = validation.message;
            this.notify('UNSAFE_CAPTURE_ATTEMPTED', {
                target,
                message: validation.message,
                code: validation.code
            });
            return;
        }

        // Valid Capture
        const oldKittenPos = kittenPos;
        this.board.removeAttacker(targetCoord);
        this.board.setKitten(targetCoord);

        const remainingAttackers = this.board.getAllAttackers();
        const safe = isKittenSafe(targetCoord, remainingAttackers, this.board);

        if (safe) {
            this.isLevelComplete = true;
            this.lastAction = { type: 'CAPTURE', from: oldKittenPos, to: targetCoord, target };
            this.failureExplanation = null;

            progression.markLevelCompleted(this.currentLevelIndex);

            this.notify('CAPTURE_EXECUTED', { from: oldKittenPos, to: targetCoord, target });
            this.notify('LEVEL_COMPLETED', {
                message: `⚔️ ATTACKER CAPTURED! The ${target.type} was defeated!`,
                actionType: 'CAPTURE'
            });
        } else {
            // Rollback if unsafe
            this.board.setKitten(oldKittenPos);
            this.board.addAttacker(target);
            this.failureExplanation = '❌ Capture leaves Kitten under attack by remaining enemies!';
            this.notify('CAPTURE_FAILED', { message: this.failureExplanation });
        }
    }

    /**
     * Contextual hint for current level
     * @returns {string}
     */
    getHint() {
        return this.currentLevelData?.hint || 'Look at the threat lines and choose a safe square, block, or capture an unsupported attacker.';
    }

    /**
     * Snapshot summary of game state for UI rendering
     */
    getStateSummary() {
        const kittenPos = this.board.getKitten();
        const attackers = this.board.getAllAttackers();
        const allAttackedSquares = Array.from(getAllAttackedSquares(attackers, this.board));
        const adjacentSquares = getKittenAdjacentSquares(kittenPos, this.board);
        const currentAttackers = getAttackersForSquare(kittenPos, attackers, this.board);

        const safeMoves = getSafeKittenMoves(kittenPos, attackers, this.board);
        const capturableAttackers = getCapturableAttackers(kittenPos, attackers, this.board);
        const adjacentAttackers = getAdjacentAttackers(kittenPos, attackers, this.board);

        const canMove = safeMoves.length > 0;
        const canBlock = this.blocksRemaining > 0 && this.blockingSquares.length > 0;
        const canCapture = capturableAttackers.length > 0;

        return {
            levelIndex: this.currentLevelIndex,
            totalLevels: LevelLoader.getLevelCount(),
            levelData: this.currentLevelData,
            board: this.board,
            kittenPosition: kittenPos,
            attackers,
            currentAttackers,
            adjacentAttackers,
            allAttackedSquares,
            adjacentSquares,
            safeMoves,
            blockingSquares: this.blockingSquares,
            capturableAttackers,
            activeMode: this.activeMode,
            blocksRemaining: this.blocksRemaining,
            canMove,
            canBlock,
            canCapture,
            isLevelComplete: this.isLevelComplete,
            lastAction: this.lastAction,
            failureExplanation: this.failureExplanation,
            attemptCount: this.attemptCount,
            completedLevels: progression.getCompletedLevels()
        };
    }
}

export const Game = GameState;
