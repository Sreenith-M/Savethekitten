/**
 * Save The Kitten - Main Application Entry Point
 * Wires the game engine, state machine, UI modules, audio cues, and event listeners.
 */

import '../style.css';
import { GameState } from './game/gameState.js';
import { BoardRenderer } from './ui/boardRenderer.js';
import { ActionButtonsUI } from './ui/actionButtonsUI.js';
import { Feedback } from './ui/feedback.js';
import { Controls } from './ui/controls.js';
import { sounds } from './ui/audio.js';

document.addEventListener('DOMContentLoaded', () => {
    const topBarContainer = document.getElementById('topBarContainer');
    const boardContainer = document.getElementById('boardContainer');
    const actionButtonsContainer = document.getElementById('actionButtonsContainer');
    const statusContainer = document.getElementById('statusContainer');
    const controlsContainer = document.getElementById('controlsContainer');

    if (!boardContainer || !statusContainer || !controlsContainer || !actionButtonsContainer) {
        console.error('Save The Kitten: Required DOM containers not found.');
        return;
    }

    // Initialize Centralized Game State Machine
    const game = new GameState();

    // Initialize UI Modules
    const boardRenderer = new BoardRenderer(boardContainer, game);
    const actionButtonsUI = new ActionButtonsUI(actionButtonsContainer, game);
    const feedbackUI = new Feedback(statusContainer, game);
    const controls = new Controls(topBarContainer, controlsContainer, game, feedbackUI);

    // Subscribe UI renders to State Machine Changes
    game.subscribe((summary) => {
        boardRenderer.render(summary);
        actionButtonsUI.render(summary);
        feedbackUI.render(summary);
        controls.render(summary);

        switch (summary.eventType) {
            case 'LEVEL_LOADED':
                sounds.playAttackAlert();
                break;

            case 'MODE_CHANGED':
                sounds.playSelect();
                break;

            case 'MOVE_EXECUTED':
                sounds.playMove();
                break;

            case 'BLOCK_PLACED':
                sounds.playBlock();
                break;

            case 'BLOCK_FAILED':
                sounds.playError();
                feedbackUI.showToast(
                    '🧱',
                    'Block Ineffective!',
                    summary.extra?.message || '❌ The attack is still active. Try another position.'
                );
                break;

            case 'CAPTURE_EXECUTED':
                sounds.playCapture();
                break;

            case 'UNSAFE_CAPTURE_ATTEMPTED':
                sounds.playError();
                feedbackUI.showToast(
                    '⚔️',
                    'Cannot Capture!',
                    summary.extra?.message || 'Target piece is protected by another enemy.'
                );
                break;

            case 'CAPTURE_FAILED':
                sounds.playError();
                feedbackUI.showToast(
                    '❌',
                    'Capture Failed',
                    summary.extra?.message || 'Capture leaves Kitten under attack.'
                );
                break;

            case 'UNSAFE_MOVE_ATTEMPTED':
                sounds.playError();
                feedbackUI.showToast(
                    '❌',
                    'Unsafe Square!',
                    summary.extra?.message || 'That square is still under attack.'
                );
                break;

            case 'BLOCK_UNAVAILABLE':
                sounds.playError();
                feedbackUI.showToast(
                    '🚫',
                    'Cannot Block',
                    summary.extra?.message || 'Blocking is not possible for this attack.'
                );
                break;

            case 'CAPTURE_UNAVAILABLE':
                sounds.playError();
                feedbackUI.showToast(
                    '🚫',
                    'Cannot Capture',
                    summary.extra?.message || 'No adjacent unsupported attackers.'
                );
                break;

            case 'LEVEL_COMPLETED':
                sounds.playVictory();
                break;
        }
    });

    console.log('🐱 Save The Kitten initialized successfully! 🛡️⚔️');
});
