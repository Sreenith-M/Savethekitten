/**
 * Save The Kitten - Progression & Settings Persistence (localStorage)
 * Uses versioned key 'save-the-kitten:v1' and handles corrupt data gracefully.
 */

const STORAGE_KEY = 'save-the-kitten:v1';

const DEFAULT_STATE = {
    version: 1,
    currentLevelIndex: 0,
    completedLevels: [],
    soundEnabled: true,
    reducedMotion: false,
    theme: 'dark'
};

export class ProgressionManager {
    constructor() {
        this.state = this.loadState();
    }

    /**
     * Loads state from localStorage with safe fallback
     * @returns {Object}
     */
    loadState() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return { ...DEFAULT_STATE };
        }

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { ...DEFAULT_STATE };

            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') {
                return { ...DEFAULT_STATE };
            }

            return {
                version: 1,
                currentLevelIndex: typeof parsed.currentLevelIndex === 'number' ? parsed.currentLevelIndex : 0,
                completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
                soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
                reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : false,
                theme: parsed.theme || 'dark'
            };
        } catch (err) {
            console.warn('Failed to parse localStorage progression. Falling back to defaults.', err);
            return { ...DEFAULT_STATE };
        }
    }

    /**
     * Saves current state to localStorage safely
     */
    saveState() {
        if (typeof window === 'undefined' || !window.localStorage) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (err) {
            console.warn('Failed to save progression to localStorage.', err);
        }
    }

    /**
     * Marks a level as completed
     * @param {number} levelIndex
     */
    markLevelCompleted(levelIndex) {
        if (!this.state.completedLevels.includes(levelIndex)) {
            this.state.completedLevels.push(levelIndex);
            this.saveState();
        }
    }

    /**
     * Checks if a level is completed
     * @param {number} levelIndex
     * @returns {boolean}
     */
    isLevelCompleted(levelIndex) {
        return this.state.completedLevels.includes(levelIndex);
    }

    /**
     * Checks if a level is unlocked (completed or immediately follows the highest completed level)
     * @param {number} levelIndex
     * @returns {boolean}
     */
    isLevelUnlocked(levelIndex) {
        if (levelIndex === 0) return true;
        return this.state.completedLevels.includes(levelIndex) ||
               this.state.completedLevels.includes(levelIndex - 1);
    }

    /**
     * Sets the active level index
     * @param {number} index
     */
    setCurrentLevel(index) {
        this.state.currentLevelIndex = index;
        this.saveState();
    }

    /**
     * Gets current level index
     * @returns {number}
     */
    getCurrentLevel() {
        return this.state.currentLevelIndex;
    }

    /**
     * Gets list of all completed levels
     * @returns {number[]}
     */
    getCompletedLevels() {
        return [...this.state.completedLevels];
    }

    /**
     * Sets sound enabled preference
     * @param {boolean} enabled
     */
    setSound(enabled) {
        this.state.soundEnabled = Boolean(enabled);
        this.saveState();
    }

    /**
     * Gets sound preference
     * @returns {boolean}
     */
    getSound() {
        return this.state.soundEnabled;
    }

    /**
     * Clears all saved progress
     */
    resetAllProgress() {
        this.state = { ...DEFAULT_STATE };
        this.saveState();
    }
}

export const progression = new ProgressionManager();
