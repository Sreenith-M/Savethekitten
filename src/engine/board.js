/**
 * Kitten Attack & Block Puzzle Game - Board Module
 * Handles 8x8 coordinate conversions, boundary checks, entity tracking (Kitten, Attackers, Bricks).
 * Completely decoupled from DOM and UI.
 */

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];
export const BOARD_SIZE = 8;

/**
 * Converts column (0-7) and row (0-7) indices to algebraic coordinate (e.g., 'e4')
 * @param {number} col - 0 to 7 (a to h)
 * @param {number} row - 0 to 7 (1 to 8)
 * @returns {string|null} Coordinate string or null if out of bounds
 */
export function posToCoord(col, row) {
    if (!isValidPos(col, row)) return null;
    return `${FILES[col]}${RANKS[row]}`;
}

/**
 * Converts algebraic coordinate (e.g., 'e4') to { col, row } indices
 * @param {string} coord
 * @returns {{col: number, row: number}|null}
 */
export function coordToPos(coord) {
    if (!coord || typeof coord !== 'string' || coord.length !== 2) return null;
    const lower = coord.toLowerCase();
    const col = FILES.indexOf(lower[0]);
    const row = RANKS.indexOf(lower[1]);
    if (col === -1 || row === -1) return null;
    return { col, row };
}

/**
 * Checks if col and row indices are within the 8x8 board boundaries
 * @param {number} col
 * @param {number} row
 * @returns {boolean}
 */
export function isValidPos(col, row) {
    return Number.isInteger(col) && Number.isInteger(row) && col >= 0 && col < BOARD_SIZE && row >= 0 && row < BOARD_SIZE;
}

/**
 * Validates whether a coordinate string is a valid square on the board
 * @param {string} coord
 * @returns {boolean}
 */
export function isValidCoord(coord) {
    return coordToPos(coord) !== null;
}

/**
 * Returns all 64 coordinates on an 8x8 chessboard
 * @returns {string[]}
 */
export function getAllCoordinates() {
    const coords = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            coords.push(`${FILES[c]}${RANKS[r]}`);
        }
    }
    return coords;
}

export const generateAllCoords = getAllCoordinates;

/**
 * Board Class representing the 8x8 state
 */
export class Board {
    constructor() {
        /** @type {string|null} Kitten position */
        this.kittenPosition = null;
        /** @type {Map<string, Object>} Attackers indexed by coordinate */
        this.attackers = new Map();
        /** @type {Set<string>} Bricks/blocks placed on the board */
        this.bricks = new Set();
    }

    /**
     * Clears all entities and bricks
     */
    clear() {
        this.kittenPosition = null;
        this.attackers.clear();
        this.bricks.clear();
    }

    /**
     * Sets the Kitten's position
     * @param {string} coord
     */
    setKitten(coord) {
        if (!isValidCoord(coord)) {
            throw new Error(`Invalid coordinate for Kitten: ${coord}`);
        }
        this.kittenPosition = coord.toLowerCase();
    }

    /**
     * Gets the Kitten's position
     * @returns {string|null}
     */
    getKitten() {
        return this.kittenPosition;
    }

    /**
     * Places an attacker on the board
     * @param {Object} attacker - { id, type, position, direction }
     */
    addAttacker(attacker) {
        if (!attacker || !attacker.position || !isValidCoord(attacker.position)) {
            throw new Error(`Invalid attacker position: ${attacker?.position}`);
        }
        const normalized = attacker.position.toLowerCase();
        this.attackers.set(normalized, {
            ...attacker,
            position: normalized,
            direction: attacker.direction || 'down'
        });
    }

    /**
     * Retrieves attacker at coordinate
     * @param {string} coord
     * @returns {Object|null}
     */
    getAttacker(coord) {
        if (!coord) return null;
        return this.attackers.get(coord.toLowerCase()) || null;
    }

    /**
     * Retrieves all attackers on the board
     * @returns {Object[]}
     */
    getAllAttackers() {
        return Array.from(this.attackers.values());
    }

    /**
     * Removes an attacker from the board at coordinate
     * @param {string} coord
     * @returns {boolean} True if removed
     */
    removeAttacker(coord) {
        if (!coord) return false;
        return this.attackers.delete(coord.toLowerCase());
    }

    /**
     * Adds a brick obstacle to the board
     * @param {string} coord
     * @returns {boolean}
     */
    addBrick(coord) {
        if (!isValidCoord(coord)) return false;
        const normalized = coord.toLowerCase();
        if (this.isOccupied(normalized)) return false;
        this.bricks.add(normalized);
        return true;
    }

    /**
     * Removes a brick obstacle
     * @param {string} coord
     * @returns {boolean}
     */
    removeBrick(coord) {
        if (!coord) return false;
        return this.bricks.delete(coord.toLowerCase());
    }

    /**
     * Checks if a brick exists at the coordinate
     * @param {string} coord
     * @returns {boolean}
     */
    hasBrick(coord) {
        if (!coord) return false;
        return this.bricks.has(coord.toLowerCase());
    }

    /**
     * Checks if a square is occupied (by Kitten, attacker, or brick)
     * @param {string} coord
     * @returns {boolean}
     */
    isOccupied(coord) {
        if (!coord) return false;
        const normalized = coord.toLowerCase();
        return (
            this.kittenPosition === normalized ||
            this.attackers.has(normalized) ||
            this.bricks.has(normalized)
        );
    }

    /**
     * Clones the board deeply
     * @returns {Board}
     */
    clone() {
        const copy = new Board();
        copy.kittenPosition = this.kittenPosition;
        for (const [coord, attacker] of this.attackers.entries()) {
            copy.attackers.set(coord, { ...attacker });
        }
        for (const brick of this.bricks) {
            copy.bricks.add(brick);
        }
        return copy;
    }
}
