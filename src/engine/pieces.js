/**
 * Kitten Attack & Block Puzzle Game - Pieces Module
 * Defines piece types, metadata, and attack characteristics.
 */

export const PIECE_TYPES = Object.freeze({
    KITTEN: 'kitten',
    PAWN: 'pawn',
    BISHOP: 'bishop',
    KNIGHT: 'knight',
    ROOK: 'rook',
    QUEEN: 'queen',
    KING: 'king'
});

export const PIECE_METADATA = Object.freeze({
    [PIECE_TYPES.KITTEN]: {
        name: 'Kitten',
        emoji: '🐱',
        canBeBlocked: false,
        description: 'The player hero! Can take one step into any safe adjacent square.'
    },
    [PIECE_TYPES.PAWN]: {
        name: 'Pawn / Soldier',
        emoji: '♟️',
        canBeBlocked: false,
        description: 'Attacks the two forward diagonal squares.'
    },
    [PIECE_TYPES.BISHOP]: {
        name: 'Bishop / Camel',
        emoji: '♝',
        canBeBlocked: true,
        description: 'Attacks diagonally along clear lines. Can be blocked by a brick.'
    },
    [PIECE_TYPES.KNIGHT]: {
        name: 'Knight / Horse',
        emoji: '♞',
        canBeBlocked: false,
        description: 'Attacks in an L-shape and jumps over obstacles. Cannot be blocked!'
    },
    [PIECE_TYPES.ROOK]: {
        name: 'Rook / Elephant',
        emoji: '♜',
        canBeBlocked: true,
        description: 'Attacks horizontally and vertically along straight lines. Can be blocked by a brick.'
    },
    [PIECE_TYPES.QUEEN]: {
        name: 'Queen',
        emoji: '♛',
        canBeBlocked: true,
        description: 'Attacks in all 8 directions (straight and diagonal). Can be blocked along ray lines.'
    },
    [PIECE_TYPES.KING]: {
        name: 'King',
        emoji: '♚',
        canBeBlocked: false,
        description: 'Attacks the 8 adjacent squares around it. Cannot be blocked.'
    }
});
