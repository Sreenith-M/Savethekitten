/**
 * Save The Kitten - Controls & Navigation UI
 * Manages top navigation, level selection dropdown & modal, audio toggle, reset, and hints.
 */

import { LevelLoader } from '../game/levelLoader.js';
import { progression } from '../game/progression.js';
import { sounds } from './audio.js';

export class Controls {
    /**
     * @param {HTMLElement} topContainer
     * @param {HTMLElement} bottomContainer
     * @param {Object} game
     * @param {Object} feedbackUI
     */
    constructor(topContainer, bottomContainer, game, feedbackUI) {
        this.topContainer = topContainer;
        this.bottomContainer = bottomContainer;
        this.game = game;
        this.feedbackUI = feedbackUI;

        this.initDOM();
    }

    initDOM() {
        const levels = LevelLoader.getAllLevels();

        // Top Toolbar
        this.topContainer.innerHTML = `
            <div class="top-nav-bar">
                <div class="game-branding">
                    <span class="brand-emoji">🐱</span>
                    <div class="brand-titles">
                        <h1 class="brand-title">Save The Kitten</h1>
                        <span class="brand-tag">Tactical Defensive Puzzle</span>
                    </div>
                </div>

                <div class="top-actions">
                    <div class="level-select-wrapper">
                        <label for="levelSelect" class="sr-only">Select Level</label>
                        <select id="levelSelect" class="level-dropdown" aria-label="Choose puzzle level">
                            ${levels.map((lvl, idx) => `
                                <option value="${idx}">
                                    Level ${lvl.id}: ${lvl.title.replace(/^Level \d+:\s*/, '')}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <button class="btn btn-icon" id="btnLevelModal" title="Level Map & Progression" aria-label="Level Select Map">
                        🗺️ <span class="btn-label">Levels</span>
                    </button>
                    <button class="btn btn-icon" id="btnHelpGuide" title="Rules & Piece Attacks" aria-label="Rules and Guide">
                        📖 <span class="btn-label">Rules</span>
                    </button>
                    <button class="btn btn-icon" id="btnSoundToggle" title="Toggle Sound" aria-label="Toggle Sound">
                        ${progression.getSound() ? '🔊' : '🔇'} <span class="btn-label">${progression.getSound() ? 'Sound' : 'Muted'}</span>
                    </button>
                </div>
            </div>
        `;

        // Bottom Toolbar
        this.bottomContainer.innerHTML = `
            <div class="controls-toolbar">
                <div class="primary-controls">
                    <button class="btn btn-secondary" id="btnPrevLevel" title="Previous Level">
                        ◀ Prev
                    </button>
                    <button class="btn btn-secondary" id="btnResetLevel" title="Reset Current Level">
                        🔄 Reset
                    </button>
                    <button class="btn btn-accent" id="btnHint" title="Get a Tactical Hint">
                        💡 Hint
                    </button>
                    <button class="btn btn-primary" id="btnNextLevel" title="Next Level">
                        Next ▶
                    </button>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Dropdown
        const levelSelect = this.topContainer.querySelector('#levelSelect');
        levelSelect.addEventListener('change', (e) => {
            const index = parseInt(e.target.value, 10);
            this.game.initLevel(index);
        });

        // Level Map Modal
        this.topContainer.querySelector('#btnLevelModal').addEventListener('click', () => {
            this.feedbackUI.showLevelSelectModal();
        });

        // Rules Guide
        this.topContainer.querySelector('#btnHelpGuide').addEventListener('click', () => {
            this.feedbackUI.showGuide();
        });

        // Sound Toggle
        const btnSound = this.topContainer.querySelector('#btnSoundToggle');
        btnSound.addEventListener('click', () => {
            const enabled = sounds.toggleSound();
            progression.setSound(enabled);
            btnSound.innerHTML = enabled ? '🔊 <span class="btn-label">Sound</span>' : '🔇 <span class="btn-label">Muted</span>';
            btnSound.classList.toggle('muted', !enabled);
        });

        // Prev Level
        this.bottomContainer.querySelector('#btnPrevLevel').addEventListener('click', () => {
            this.game.prevLevel();
        });

        // Next Level
        this.bottomContainer.querySelector('#btnNextLevel').addEventListener('click', () => {
            this.game.nextLevel();
        });

        // Reset Level
        this.bottomContainer.querySelector('#btnResetLevel').addEventListener('click', () => {
            this.game.resetLevel();
            this.feedbackUI.showToast('🔄', 'Level Reset', 'Puzzle reset to starting position.');
        });

        // Hint Button
        this.bottomContainer.querySelector('#btnHint').addEventListener('click', () => {
            const hint = this.game.getHint();
            this.feedbackUI.showToast('💡', 'Tactical Hint', hint, 4500);
        });
    }

    render(summary) {
        const { levelIndex, totalLevels, completedLevels } = summary;

        const levelSelect = this.topContainer.querySelector('#levelSelect');
        if (levelSelect) {
            // Update dropdown options with completed checkmarks
            const options = levelSelect.querySelectorAll('option');
            options.forEach((opt, idx) => {
                const isCompleted = completedLevels.includes(idx);
                const lvl = LevelLoader.getAllLevels()[idx];
                const check = isCompleted ? '✓ ' : '';
                opt.textContent = `${check}Level ${lvl.id}: ${lvl.title.replace(/^Level \d+:\s*/, '')}`;
            });

            if (levelSelect.value !== String(levelIndex)) {
                levelSelect.value = String(levelIndex);
            }
        }

        const btnPrev = this.bottomContainer.querySelector('#btnPrevLevel');
        const btnNext = this.bottomContainer.querySelector('#btnNextLevel');
        if (btnPrev) btnPrev.disabled = levelIndex === 0;
        if (btnNext) btnNext.disabled = levelIndex === totalLevels - 1;
    }
}

export const ControlsUI = Controls;
