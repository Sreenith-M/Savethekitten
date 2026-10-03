/**
 * Save The Kitten - Board Renderer
 * Renders the 8x8 chessboard, threat rays, safe move indicators, capturable enemy badges, and placed bricks.
 *
 * CRITICAL UX RULE: In BLOCK mode, blocking solution squares are NEVER highlighted.
 */

import { FILES, RANKS, BOARD_SIZE, coordToPos } from '../engine/board.js';
import { PIECE_TYPES, PIECE_METADATA } from '../engine/pieces.js';
import { GAME_MODES } from '../game/gameState.js';
import { getCheckLine } from '../engine/blocking.js';

export class BoardRenderer {
    /**
     * @param {HTMLElement} container
     * @param {Object} game
     */
    constructor(container, game) {
        this.container = container;
        this.game = game;
        this.squareElements = new Map();
        this.initDOM();
    }

    initDOM() {
        this.container.innerHTML = '';
        this.container.className = 'chess-board-wrapper';

        const boardGrid = document.createElement('div');
        boardGrid.className = 'chess-board-grid';
        boardGrid.id = 'chessBoardGrid';
        boardGrid.setAttribute('role', 'grid');
        boardGrid.setAttribute('aria-label', '8 by 8 puzzle board');

        // Standard rank 8 (top) to rank 1 (bottom)
        for (let r = BOARD_SIZE - 1; r >= 0; r--) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const coord = `${FILES[c]}${RANKS[r]}`;
                const isLight = (r + c) % 2 !== 0;

                const square = document.createElement('div');
                square.className = `board-square ${isLight ? 'square-light' : 'square-dark'}`;
                square.dataset.coord = coord;
                square.id = `square-${coord}`;
                square.setAttribute('role', 'button');
                square.setAttribute('aria-label', `Square ${coord}`);
                square.setAttribute('tabindex', '0');

                // Coordinate label
                const label = document.createElement('span');
                label.className = 'square-coord-label';
                if (c === 0 && r === 0) label.textContent = 'a1';
                else if (c === 0) label.textContent = RANKS[r];
                else if (r === 0) label.textContent = FILES[c];
                if (label.textContent) square.appendChild(label);

                // Inner content
                const content = document.createElement('div');
                content.className = 'square-content';
                square.appendChild(content);

                // Click listener
                square.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.game.handleSquareClick(coord);
                });

                // Keyboard support
                square.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.game.handleSquareClick(coord);
                    }
                });

                boardGrid.appendChild(square);
                this.squareElements.set(coord, square);
            }
        }

        this.container.appendChild(boardGrid);
    }

    /**
     * Renders complete board state
     * @param {Object} summary
     */
    render(summary) {
        const {
            board,
            kittenPosition,
            attackers,
            currentAttackers,
            adjacentSquares,
            safeMoves,
            capturableAttackers,
            activeMode,
            isLevelComplete,
            lastAction
        } = summary;

        // Threat lines
        const threatLineSquares = new Set();
        for (const attacker of currentAttackers) {
            const line = getCheckLine(attacker, kittenPosition);
            for (const sq of line) {
                threatLineSquares.add(sq);
            }
        }

        const capturablePositions = new Set(capturableAttackers.map(a => a.position.toLowerCase()));

        for (const [coord, squareEl] of this.squareElements.entries()) {
            const contentEl = squareEl.querySelector('.square-content');
            contentEl.innerHTML = '';

            const pos = coordToPos(coord);
            const isLight = (pos.row + pos.col) % 2 !== 0;
            squareEl.className = `board-square ${isLight ? 'square-light' : 'square-dark'}`;

            // 1. Placed Brick
            if (board.hasBrick(coord)) {
                squareEl.classList.add('has-brick');
                const brickImg = document.createElement('img');
                brickImg.src = 'assets/brick.svg';
                brickImg.className = 'piece-icon brick-icon';
                brickImg.alt = 'Brick Block';
                contentEl.appendChild(brickImg);
            }

            // 2. Attacker Piece
            const attacker = board.getAttacker(coord);
            if (attacker) {
                squareEl.classList.add('has-attacker', `attacker-${attacker.type}`);
                const attackerEl = this.createAttackerElement(attacker);
                contentEl.appendChild(attackerEl);
            }

            // 3. Kitten Piece
            if (kittenPosition === coord) {
                squareEl.classList.add('has-kitten');
                if (!isLevelComplete && currentAttackers.length > 0) {
                    squareEl.classList.add('kitten-under-attack');
                } else if (isLevelComplete) {
                    squareEl.classList.add('kitten-safe-celebrate');
                }

                const kittenEl = this.createKittenElement();
                contentEl.appendChild(kittenEl);
            }

            // 4. Visual Threat Lines (Line of Fire)
            if (!isLevelComplete && threatLineSquares.has(coord) && !board.hasBrick(coord)) {
                squareEl.classList.add('highlight-threat-ray');
            }

            // 5. Mode-Specific Highlights
            if (!isLevelComplete) {
                if (activeMode === GAME_MODES.MOVE && adjacentSquares.includes(coord)) {
                    if (safeMoves.includes(coord)) {
                        squareEl.classList.add('highlight-safe-move');
                        const dot = document.createElement('div');
                        dot.className = 'safe-move-dot';
                        contentEl.appendChild(dot);
                    } else {
                        squareEl.classList.add('highlight-attacked-move');
                    }
                } else if (activeMode === GAME_MODES.CAPTURE) {
                    if (capturablePositions.has(coord)) {
                        squareEl.classList.add('highlight-capturable-target');
                        const swordBadge = document.createElement('div');
                        swordBadge.className = 'capture-target-badge';
                        swordBadge.textContent = '⚔️';
                        contentEl.appendChild(swordBadge);
                    }
                }
                // NOTE: In BLOCK mode, we intentionally NEVER add highlights or markers.
            }

            // 6. Last Action Highlight
            if (lastAction) {
                if ((lastAction.from === coord || lastAction.to === coord) ||
                    (lastAction.at === coord)) {
                    squareEl.classList.add('highlight-last-action');
                }
            }
        }
    }

    createKittenElement() {
        const el = document.createElement('div');
        el.className = 'entity-avatar-holder kitten-avatar-holder';

        const img = document.createElement('img');
        img.src = 'assets/kitten.svg';
        img.className = 'piece-img';
        img.alt = 'Kitten';

        const badge = document.createElement('div');
        badge.className = 'piece-badge badge-kitten';
        badge.textContent = '🐱 Kitten';

        el.appendChild(img);
        el.appendChild(badge);
        return el;
    }

    createAttackerElement(attacker) {
        const el = document.createElement('div');
        el.className = `entity-avatar-holder attacker-avatar-holder type-${attacker.type}`;

        const img = document.createElement('img');
        img.src = `assets/${attacker.type}.svg`;
        img.className = 'piece-img';
        img.alt = attacker.type;

        const meta = PIECE_METADATA[attacker.type] || { emoji: '♟️', name: attacker.type };
        const badge = document.createElement('div');
        badge.className = 'piece-badge badge-attacker';
        badge.textContent = `${meta.emoji} ${meta.name.split('/')[0].trim()}`;

        el.appendChild(img);
        el.appendChild(badge);
        return el;
    }
}

export const BoardUI = BoardRenderer;
