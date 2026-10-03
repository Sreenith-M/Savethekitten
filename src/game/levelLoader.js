/**
 * Save The Kitten - Level Loader Module
 * Loads and validates puzzle levels from the data-driven level repository.
 */

import { LEVELS } from './levels.js';
import { validateLevel } from '../engine/validation.js';

export class LevelLoader {
    /**
     * Retrieves total level count
     * @returns {number}
     */
    static getLevelCount() {
        return LEVELS.length;
    }

    /**
     * Gets all levels
     * @returns {Object[]}
     */
    static getAllLevels() {
        return LEVELS;
    }

    /**
     * Loads and validates a level by index
     * @param {number} index
     * @returns {{ levelData: Object, validation: Object }}
     */
    static loadLevelByIndex(index) {
        if (index < 0 || index >= LEVELS.length) {
            index = 0;
        }

        const levelData = LEVELS[index];
        const validation = validateLevel(levelData);

        if (!validation.valid) {
            console.error(`Level ${levelData.id} validation errors:`, validation.errors);
        }

        return {
            levelData,
            validation
        };
    }
}
