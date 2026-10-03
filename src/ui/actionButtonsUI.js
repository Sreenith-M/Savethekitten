/**
 * Kitten Attack & Block Puzzle Game - Action Buttons UI
 * Three-Action Defensive Toolbar: [ MOVE ], [ BLOCK ], and [ CAPTURE ].
 */

import { GAME_MODES } from '../game/game.js';

export class ActionButtonsUI {
    /**
     * @param {HTMLElement} container
     * @param {Object} game
     */
    constructor(container, game) {
        this.container = container;
        this.game = game;
        this.initDOM();
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="actions-panel">
                <div class="mode-buttons-group three-actions">
                    <button class="btn-action-mode btn-mode-move active" id="btnModeMove">
                        <span class="btn-icon">👟</span>
                        <span class="btn-text">MOVE</span>
                        <span class="btn-badge" id="moveSafeCountBadge">0 Safe</span>
                    </button>
                    <button class="btn-action-mode btn-mode-block" id="btnModeBlock">
                        <span class="btn-icon">🧱</span>
                        <span class="btn-text">BLOCK</span>
                        <span class="btn-badge" id="blockCountBadge">1 Left</span>
                    </button>
                    <button class="btn-action-mode btn-mode-capture" id="btnModeCapture">
                        <span class="btn-icon">⚔️</span>
                        <span class="btn-text">CAPTURE</span>
                        <span class="btn-badge" id="captureCountBadge">0 Target</span>
                    </button>
                </div>
                <div class="action-mode-description" id="actionDescription">
                    Click a green square to move the Kitten to safety.
                </div>
            </div>
        `;

        const btnMove = this.container.querySelector('#btnModeMove');
        const btnBlock = this.container.querySelector('#btnModeBlock');
        const btnCapture = this.container.querySelector('#btnModeCapture');

        btnMove.addEventListener('click', () => {
            this.game.setMode(GAME_MODES.MOVE);
        });

        btnBlock.addEventListener('click', () => {
            this.game.setMode(GAME_MODES.BLOCK);
        });

        btnCapture.addEventListener('click', () => {
            this.game.setMode(GAME_MODES.CAPTURE);
        });
    }

    /**
     * Updates button states based on game summary
     * @param {Object} summary
     */
    render(summary) {
        const {
            activeMode,
            safeMoves,
            capturableAttackers,
            blocksRemaining,
            canMove,
            canBlock,
            canCapture,
            isLevelComplete
        } = summary;

        const btnMove = this.container.querySelector('#btnModeMove');
        const btnBlock = this.container.querySelector('#btnModeBlock');
        const btnCapture = this.container.querySelector('#btnModeCapture');
        const moveBadge = this.container.querySelector('#moveSafeCountBadge');
        const blockBadge = this.container.querySelector('#blockCountBadge');
        const captureBadge = this.container.querySelector('#captureCountBadge');
        const descEl = this.container.querySelector('#actionDescription');

        // Update counts
        moveBadge.textContent = `${safeMoves.length} Safe`;
        blockBadge.textContent = `${blocksRemaining} Left`;
        captureBadge.textContent = `${capturableAttackers.length} Target`;

        // Mode toggles
        btnMove.classList.toggle('active', activeMode === GAME_MODES.MOVE);
        btnBlock.classList.toggle('active', activeMode === GAME_MODES.BLOCK);
        btnCapture.classList.toggle('active', activeMode === GAME_MODES.CAPTURE);

        // Move button state
        btnMove.classList.toggle('disabled', !canMove);
        btnMove.title = canMove ? 'Move Kitten to a safe adjacent square.' : 'No safe adjacent squares available.';

        // Block button state
        btnBlock.classList.toggle('disabled', !canBlock);
        btnBlock.title = canBlock ? 'Place a brick along a line of attack to block it.' : 'Blocking is unavailable for this attack.';

        // Capture button state
        btnCapture.classList.toggle('disabled', !canCapture);
        btnCapture.title = canCapture ? 'Capture an adjacent unsupported enemy piece.' : 'No adjacent unsupported attackers to capture.';

        // Dynamic mode descriptions
        if (isLevelComplete) {
            descEl.textContent = '🎉 Level Solved! Kitten is completely safe!';
        } else if (activeMode === GAME_MODES.MOVE) {
            descEl.innerHTML = `🟢 <strong>MOVE MODE:</strong> Click a <span class="highlight-green">green square</span> to escape to safety!`;
        } else if (activeMode === GAME_MODES.BLOCK) {
            descEl.innerHTML = `🧱 <strong>BLOCK MODE:</strong> Click an empty square to place a block along the line of fire.`;
        } else if (activeMode === GAME_MODES.CAPTURE) {
            descEl.innerHTML = `⚔️ <strong>CAPTURE MODE:</strong> Click an adjacent <span class="highlight-crimson">unsupported enemy</span> to capture it!`;
        }
    }
}
