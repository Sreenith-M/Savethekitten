/**
 * Save The Kitten - Feedback, Modals & Status UI
 * Handles threat status displays, educational feedback toasts, victory celebrations,
 * final game completion screen, level select map, and rules guide.
 */

import { sounds } from './audio.js';
import { PIECE_METADATA } from '../engine/pieces.js';
import { LevelLoader } from '../game/levelLoader.js';
import { progression } from '../game/progression.js';
import { AnimationController } from './animations.js';

export class Feedback {
    /**
     * @param {HTMLElement} container
     * @param {Object} game
     */
    constructor(container, game) {
        this.container = container;
        this.game = game;
        this.toastTimer = null;
        this.initDOM();
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="status-panel-card" id="statusPanelCard">
                <div class="status-top-row">
                    <span class="threat-status-badge badge-under-attack" id="threatStatusBadge">⚠️ UNDER ATTACK</span>
                    <span class="level-progress-badge" id="levelProgressBadge">Level 1 / 20</span>
                </div>
                <div class="status-content">
                    <h2 class="level-title" id="levelTitle">The Soldier's Ambush</h2>
                    <p class="level-subtitle" id="levelSubtitle">Pawn attacks diagonal squares.</p>
                </div>
                <div class="threat-details-box" id="threatDetailsBox">
                    <span class="threat-icon">⚔️</span>
                    <span class="threat-text" id="threatText">Kitten is targeted by: Pawn at d5</span>
                </div>
                <div class="educational-tip-box" id="educationalTipBox">
                    <span class="tip-icon">💡</span>
                    <span class="tip-text" id="tipText">Move to a safe adjacent square, block, or capture!</span>
                </div>
            </div>

            <!-- Floating Feedback Toast -->
            <div class="feedback-toast hidden" id="feedbackToast">
                <div class="toast-icon" id="toastIcon">❌</div>
                <div class="toast-body">
                    <div class="toast-title" id="toastTitle">Unsafe Move!</div>
                    <div class="toast-msg" id="toastMsg">That square is still under attack.</div>
                </div>
            </div>

            <!-- Level Victory Celebration Modal -->
            <div class="modal-backdrop hidden" id="victoryModal">
                <div class="modal-window victory-window" id="victoryWindow">
                    <div class="victory-stars">
                        <span>⭐</span>
                        <span class="star-big">🌟</span>
                        <span>⭐</span>
                    </div>
                    <h2 class="victory-heading" id="victoryHeading">🎉 SAFE!</h2>
                    <p class="victory-sub" id="victorySub">You successfully escaped the attack!</p>
                    <div class="concept-recap-box">
                        <span class="concept-tag" id="conceptTag">Tactical Concept</span>
                        <p class="concept-desc" id="conceptDesc">Pawn attacks diagonally.</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="btnReplay">🔄 Replay</button>
                        <button class="btn btn-primary" id="btnNextModal">Next Level ➔</button>
                    </div>
                </div>
            </div>

            <!-- Final Grand Game Completion Modal -->
            <div class="modal-backdrop hidden" id="finalCompletionModal">
                <div class="modal-window completion-window">
                    <div class="victory-stars">
                        <span>🏆</span>
                        <span class="star-big">🐱</span>
                        <span>🏆</span>
                    </div>
                    <h2 class="victory-heading" style="color: #F59E0B;">🎉 YOU SAVED THE KITTEN!</h2>
                    <p class="victory-sub">You have mastered movement, blocking, and capture across all 20 tactical puzzles!</p>
                    <div class="concept-recap-box">
                        <span class="concept-tag">Grand Master Defender</span>
                        <p class="concept-desc">From single pawns to 16-attacker gauntlets, you kept the Kitten safe through all challenges!</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="btnFinalLevelMap">🗺️ Level Select</button>
                        <button class="btn btn-primary" id="btnPlayAgain">🔄 Play Again</button>
                    </div>
                </div>
            </div>

            <!-- Level Selection Map Modal -->
            <div class="modal-backdrop hidden" id="levelMapModal">
                <div class="modal-window level-map-window">
                    <div class="guide-top">
                        <h2>🗺️ Level Selection Map</h2>
                        <button class="btn-close" id="btnCloseLevelMap">✕</button>
                    </div>
                    <div class="level-grid-container" id="levelGridContainer"></div>
                </div>
            </div>

            <!-- Rules & Guide Modal -->
            <div class="modal-backdrop hidden" id="guideModal">
                <div class="modal-window guide-window">
                    <div class="guide-top">
                        <h2>📖 How to Play & Piece Attacks</h2>
                        <button class="btn-close" id="btnCloseGuide">✕</button>
                    </div>
                    <div class="guide-scroll">
                        <div class="guide-item">
                            <h3>🛡️ 3 Defensive Actions</h3>
                            <p><strong>👟 MOVE:</strong> Step 1 square into any safe adjacent cell.<br>
                            <strong>🧱 BLOCK:</strong> Place a brick along an attack ray to interrupt it. Reason out where to place the brick independently!<br>
                            <strong>⚔️ CAPTURE:</strong> Attack an adjacent enemy if it is <em>unsupported</em> by other pieces!</p>
                        </div>
                        <div class="guide-item">
                            <h3>⚔️ Support & Capture Rule</h3>
                            <p>An adjacent attacker can only be captured if <strong>NO other enemy piece protects its square</strong>. If an attacker is guarded (e.g. Pawn guarded by Bishop), capture is forbidden!</p>
                        </div>
                        <div class="guide-item">
                            <h3>♟️ Pawn / Soldier</h3>
                            <p>Attacks the 2 diagonal forward squares in its movement direction. (Cannot be blocked).</p>
                        </div>
                        <div class="guide-item">
                            <h3>♝ Bishop / Camel</h3>
                            <p>Attacks diagonally along clear straight lines. <strong>Can be blocked with a Brick!</strong></p>
                        </div>
                        <div class="guide-item">
                            <h3>♞ Knight / Horse</h3>
                            <p>Attacks in an "L" shape and jumps over obstacles. <strong>Cannot be blocked! You must move or capture.</strong></p>
                        </div>
                        <div class="guide-item">
                            <h3>♜ Rook / Elephant</h3>
                            <p>Attacks horizontally and vertically along ranks and files. <strong>Can be blocked with a Brick!</strong></p>
                        </div>
                        <div class="guide-item">
                            <h3>♛ Queen</h3>
                            <p>Combines straight and diagonal lines. <strong>Can be blocked with a Brick!</strong></p>
                        </div>
                        <div class="guide-item">
                            <h3>♚ King</h3>
                            <p>Attacks all 8 adjacent surrounding squares. (Can be captured if unsupported!).</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" id="btnGotIt">Got It, Let's Play!</button>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const btnNext = this.container.querySelector('#btnNextModal');
        const btnReplay = this.container.querySelector('#btnReplay');
        const guideModal = this.container.querySelector('#guideModal');
        const btnCloseGuide = this.container.querySelector('#btnCloseGuide');
        const btnGotIt = this.container.querySelector('#btnGotIt');
        const levelMapModal = this.container.querySelector('#levelMapModal');
        const btnCloseLevelMap = this.container.querySelector('#btnCloseLevelMap');
        const btnFinalLevelMap = this.container.querySelector('#btnFinalLevelMap');
        const btnPlayAgain = this.container.querySelector('#btnPlayAgain');

        btnNext.addEventListener('click', () => {
            this.hideVictoryModal();
            this.game.nextLevel();
        });

        btnReplay.addEventListener('click', () => {
            this.hideVictoryModal();
            this.game.resetLevel();
        });

        const closeGuide = () => guideModal.classList.add('hidden');
        btnCloseGuide.addEventListener('click', closeGuide);
        btnGotIt.addEventListener('click', closeGuide);

        btnCloseLevelMap.addEventListener('click', () => {
            levelMapModal.classList.add('hidden');
        });

        btnFinalLevelMap.addEventListener('click', () => {
            this.container.querySelector('#finalCompletionModal').classList.add('hidden');
            this.showLevelSelectModal();
        });

        btnPlayAgain.addEventListener('click', () => {
            this.container.querySelector('#finalCompletionModal').classList.add('hidden');
            this.game.initLevel(0);
        });
    }

    showGuide() {
        this.container.querySelector('#guideModal').classList.remove('hidden');
    }

    showLevelSelectModal() {
        const modal = this.container.querySelector('#levelMapModal');
        const grid = this.container.querySelector('#levelGridContainer');
        grid.innerHTML = '';

        const levels = LevelLoader.getAllLevels();
        const completed = progression.getCompletedLevels();

        levels.forEach((lvl, idx) => {
            const isCompleted = completed.includes(idx);
            const isUnlocked = progression.isLevelUnlocked(idx);
            const isCurrent = this.game.currentLevelIndex === idx;

            const card = document.createElement('button');
            card.className = `level-select-card ${isCompleted ? 'completed' : ''} ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;
            card.disabled = !isUnlocked;

            card.innerHTML = `
                <div class="card-level-num">Level ${lvl.id}</div>
                <div class="card-level-title">${lvl.title.replace(/^Level \d+:\s*/, '')}</div>
                <div class="card-level-status">${isCompleted ? '✓ Completed' : (isUnlocked ? '▶ Play' : '🔒 Locked')}</div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    modal.classList.add('hidden');
                    this.game.initLevel(idx);
                });
            }

            grid.appendChild(card);
        });

        modal.classList.remove('hidden');
    }

    showToast(icon, title, message, duration = 3500) {
        const toast = this.container.querySelector('#feedbackToast');
        this.container.querySelector('#toastIcon').textContent = icon;
        this.container.querySelector('#toastTitle').textContent = title;
        this.container.querySelector('#toastMsg').textContent = message;

        toast.classList.remove('hidden');
        toast.classList.remove('toast-exit');
        toast.classList.add('toast-enter');

        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, duration);
    }

    showVictoryModal(title, sub, concept) {
        sounds.playVictory();
        const modal = this.container.querySelector('#victoryModal');
        const windowEl = this.container.querySelector('#victoryWindow');
        this.container.querySelector('#victoryHeading').textContent = title || '🎉 SAFE!';
        this.container.querySelector('#victorySub').textContent = sub || 'Kitten successfully escaped!';
        this.container.querySelector('#conceptTag').textContent = concept || 'Puzzle Solved';
        this.container.querySelector('#conceptDesc').textContent = this.game.currentLevelData?.concept || 'Excellent defensive response!';

        modal.classList.remove('hidden');
        AnimationController.spawnVictoryBurst(windowEl);
    }

    hideVictoryModal() {
        this.container.querySelector('#victoryModal').classList.add('hidden');
    }

    showFinalCompletionModal() {
        sounds.playVictory();
        const modal = this.container.querySelector('#finalCompletionModal');
        modal.classList.remove('hidden');
    }

    render(summary) {
        const { levelIndex, totalLevels, levelData, currentAttackers, isLevelComplete } = summary;

        this.container.querySelector('#levelProgressBadge').textContent = `Level ${levelIndex + 1} / ${totalLevels}`;

        const statusBadge = this.container.querySelector('#threatStatusBadge');
        if (isLevelComplete) {
            statusBadge.className = 'threat-status-badge badge-safe';
            statusBadge.textContent = '🎉 SAFE!';
        } else {
            statusBadge.className = 'threat-status-badge badge-under-attack';
            statusBadge.textContent = '⚠️ UNDER ATTACK';
        }

        if (levelData) {
            this.container.querySelector('#levelTitle').textContent = levelData.title;
            this.container.querySelector('#levelSubtitle').textContent = levelData.subtitle;
            this.container.querySelector('#tipText').textContent = levelData.hint;
        }

        // Threat details breakdown
        const threatTextEl = this.container.querySelector('#threatText');
        if (isLevelComplete) {
            threatTextEl.textContent = 'All threats successfully neutralized!';
        } else if (currentAttackers.length > 0) {
            const attackerDescriptions = currentAttackers.map(a => {
                const meta = PIECE_METADATA[a.type] || { emoji: '', name: a.type };
                return `${meta.emoji} ${meta.name.split('/')[0].trim()} at ${a.position.toUpperCase()}`;
            }).join(', ');
            threatTextEl.textContent = `Targeted by: ${attackerDescriptions}`;
        } else {
            threatTextEl.textContent = 'No active threats.';
        }

        if (isLevelComplete) {
            if (levelIndex === totalLevels - 1) {
                // Final level solved!
                setTimeout(() => this.showFinalCompletionModal(), 300);
            } else {
                this.showVictoryModal(
                    '🎉 SAFE!',
                    'You resolved the attack cleanly!',
                    levelData?.concept
                );
            }
        }
    }
}

export const MessagesUI = Feedback;
