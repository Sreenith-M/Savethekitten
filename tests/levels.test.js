/**
 * Save The Kitten - Levels & Puzzle Validation Tests
 */

import { describe, it, assert, assertEqual } from './testHelper.js';
import { validateLevel } from '../src/engine/validation.js';
import { LEVELS } from '../src/game/levels.js';
import { GameState, GAME_MODES } from '../src/game/gameState.js';

describe('Levels & Puzzle Integrity Tests', () => {
    it('validates that ALL 20 levels start under attack and have valid solutions', () => {
        for (const level of LEVELS) {
            const validation = validateLevel(level);
            assert(
                validation.valid,
                `Level ${level.id} (${level.title}) failed validation: ${validation.errors.join(', ')}`
            );
            assert(
                validation.initialAttackers.length > 0,
                `Level ${level.id} must have initial attackers targeting Kitten`
            );
            const totalSolutions = validation.safeMoves.length + validation.blockingSolutions.length + validation.capturableAttackers.length;
            assert(
                totalSolutions > 0,
                `Level ${level.id} must have at least 1 valid defensive solution. Got: ${totalSolutions}`
            );
        }
    });

    it('plays Level 1 (Pawn): starts under attack -> moves to safe square -> solves puzzle', () => {
        const game = new GameState();
        game.initLevel(0); // Level 1 (Pawn at d5, Kitten at e4)

        const summary1 = game.getStateSummary();
        assertEqual(summary1.isLevelComplete, false);
        assertEqual(summary1.currentAttackers.length, 1);
        assertEqual(summary1.activeMode, GAME_MODES.MOVE);

        // e5 is a valid safe move
        assert(summary1.safeMoves.includes('e5'));

        // Execute move to e5
        game.handleSquareClick('e5');
        const summary2 = game.getStateSummary();
        assertEqual(summary2.isLevelComplete, true);
        assertEqual(summary2.kittenPosition, 'e5');
    });

    it('plays Level 2 (Bishop): blocks diagonal attack with a brick', () => {
        const game = new GameState();
        game.initLevel(1); // Level 2 (Bishop at b1, Kitten at e4)

        const summary1 = game.getStateSummary();
        assertEqual(summary1.canBlock, true);

        // Switch to BLOCK mode
        game.setMode(GAME_MODES.BLOCK);
        assertEqual(game.activeMode, GAME_MODES.BLOCK);

        // Place brick at d3
        game.handleSquareClick('d3');
        const summary2 = game.getStateSummary();
        assertEqual(summary2.isLevelComplete, true);
        assertEqual(summary2.board.hasBrick('d3'), true);
    });

    it('plays Level 3 (Knight): blocks are unavailable -> escapes with move', () => {
        const game = new GameState();
        game.initLevel(2); // Level 3 (Knight at c5, Kitten at e4)

        const summary1 = game.getStateSummary();
        assertEqual(summary1.canBlock, false);

        // Move to safe square (e5)
        game.handleSquareClick('e5');
        const summary2 = game.getStateSummary();
        assertEqual(summary2.isLevelComplete, true);
    });

    it('plays Level 4 (Rook): blocks straight attack with a brick', () => {
        const game = new GameState();
        game.initLevel(3); // Level 4 (Rook at e8, Kitten at e4)

        const summary = game.getStateSummary();
        assertEqual(summary.canBlock, true);
        assert(summary.blockingSquares.includes('e6'));

        game.setMode(GAME_MODES.BLOCK);
        game.handleSquareClick('e6');
        const result = game.getStateSummary();
        assertEqual(result.isLevelComplete, true);
        assertEqual(result.board.hasBrick('e6'), true);
    });

    it('plays Level 5 (Queen): handles multi-direction threat', () => {
        const game = new GameState();
        game.initLevel(4); // Level 5 (Queen at b7, Kitten at e4)

        const summary = game.getStateSummary();
        assertEqual(summary.canBlock, true);
        assert(summary.blockingSquares.includes('c6'));

        // Safe move test (e5 is safe from b7 Queen)
        assert(summary.safeMoves.includes('e5'));
        game.handleSquareClick('e5');
        assertEqual(game.getStateSummary().isLevelComplete, true);
    });

    it('plays Level 20 (Grand 16-Piece Gauntlet): successfully finds safe escape amongst 16 pieces', () => {
        const game = new GameState();
        game.initLevel(19); // Level 20 (16 attackers)

        const summary = game.getStateSummary();
        assertEqual(summary.attackers.length, 16);
        assertEqual(summary.isLevelComplete, false);
        assert(summary.safeMoves.length > 0, 'Level 20 must have at least one safe move');

        const safeTarget = summary.safeMoves[0];
        game.handleSquareClick(safeTarget);
        const result = game.getStateSummary();
        assertEqual(result.isLevelComplete, true);
        assertEqual(result.kittenPosition, safeTarget);
    });

    it('rejects unsafe move attempts with educational feedback', () => {
        const game = new GameState();
        game.initLevel(0); // Level 1 (Pawn at d5 attacks e4)

        // Trying to move to d5 (occupied by Pawn):
        game.handleSquareClick('d5');
        assertEqual(game.isLevelComplete, false);
        assert(game.failureExplanation !== null);

        // In Level 2 (Bishop at b1 attacks e4, f5):
        game.initLevel(1);
        // Try moving to f5 which is along the Bishop's attack line:
        game.handleSquareClick('f5');
        assertEqual(game.isLevelComplete, false);
        assert(game.failureExplanation.toLowerCase().includes('bishop'));
    });

    it('supports level reset, prevLevel, and nextLevel navigation', () => {
        const game = new GameState();
        game.initLevel(0);
        assertEqual(game.currentLevelIndex, 0);

        game.nextLevel();
        assertEqual(game.currentLevelIndex, 1);

        game.prevLevel();
        assertEqual(game.currentLevelIndex, 0);

        // Play and solve
        game.handleSquareClick('e5');
        assertEqual(game.isLevelComplete, true);

        // Reset
        game.resetLevel();
        assertEqual(game.isLevelComplete, false);
        assertEqual(game.getStateSummary().kittenPosition, 'e4');
    });
});
