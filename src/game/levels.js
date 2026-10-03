/**
 * Kitten Attack & Block Puzzle Game - Level Definitions
 * 20 Data-driven progressive educational levels teaching Move, Block, and Capture (Supported vs Unsupported).
 */

import { PIECE_TYPES } from '../engine/pieces.js';

export const LEVELS = [
    // =========================================================================
    // STAGE 1: SINGLE PIECE INTRODUCTIONS (Levels 1 - 5)
    // =========================================================================
    {
        id: 1,
        title: 'Level 1: The Soldier\'s Ambush',
        subtitle: 'Learn Pawn Diagonal Attacks & Movement',
        concept: 'Pawn attacks the two diagonal forward squares.',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'd5', direction: 'down' }
        ],
        blocksAvailable: 0,
        blocksAllowed: false,
        hint: '💡 The Pawn at d5 attacks diagonally down into e4 and c4. Move the Kitten to a safe square like e5, d4, or e3!'
    },
    {
        id: 2,
        title: 'Level 2: The Camel\'s Beam',
        subtitle: 'Learn Bishop Diagonal Line Attacks & Blocking',
        concept: 'Bishop attacks along long diagonals. Can be blocked with a Brick!',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'b1' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 The Bishop at b1 fires diagonally through c2, d3, and e4. Move away or place a Brick along the diagonal (c2 or d3) to block it!'
    },
    {
        id: 3,
        title: 'Level 3: The Horse\'s Leap',
        subtitle: 'Learn Knight L-Shaped Jumping Attacks',
        concept: 'Knights jump over obstacles and cannot be blocked!',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'knight-1', type: PIECE_TYPES.KNIGHT, position: 'c5' }
        ],
        blocksAvailable: 0,
        blocksAllowed: false,
        hint: '💡 Knight attacks jump in an L-shape and CANNOT be blocked! You must move the Kitten to a safe adjacent square.'
    },
    {
        id: 4,
        title: 'Level 4: The Elephant\'s Highway',
        subtitle: 'Learn Rook Straight Line Attacks & Blocking',
        concept: 'Rooks attack horizontally and vertically along files and ranks.',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'rook-1', type: PIECE_TYPES.ROOK, position: 'e8' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 The Rook attacks straight down the e-file. Block the attack by placing a Brick on e5, e6, or e7, or step aside to d4 or f4!'
    },
    {
        id: 5,
        title: 'Level 5: The Queen\'s Scepter',
        subtitle: 'Learn Queen Combined Attacks',
        concept: 'The Queen combines straight and diagonal lines of attack.',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'queen-1', type: PIECE_TYPES.QUEEN, position: 'b7' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 The Queen attacks along the diagonal into e4. Block with a Brick at c6 or d5, or escape to a safe square!'
    },

    // =========================================================================
    // STAGE 2: ADJACENT CAPTURE & DUAL ATTACKERS (Levels 6 - 10)
    // =========================================================================
    {
        id: 6,
        title: 'Level 6: Strike the Lone Soldier',
        subtitle: 'Learn Adjacent Unsupported Capture',
        concept: 'The Kitten can capture an adjacent attacking piece if no other piece protects it!',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'c5', direction: 'down' }
        ],
        blocksAvailable: 0,
        blocksAllowed: false,
        hint: '💡 The Pawn at c5 is right next to the Kitten and nothing protects it! Capture it directly with [ CAPTURE ], or move to safety.'
    },
    {
        id: 7,
        title: 'Level 7: Twin Soldiers',
        subtitle: 'Two Pawns Attack Simultaneously',
        concept: 'Multiple attackers create overlapping danger zones.',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'c5', direction: 'down' },
            { id: 'pawn-2', type: PIECE_TYPES.PAWN, position: 'e5', direction: 'down' }
        ],
        blocksAvailable: 0,
        blocksAllowed: false,
        hint: '💡 Both Pawns attack d4. You can capture either unsupported Pawn, or step to a safe square like d5 or d3!'
    },
    {
        id: 8,
        title: 'Level 8: Crossfire of Bishops',
        subtitle: 'Two Diagonal Lasers',
        concept: 'Blocking one bishop may still leave you open to another.',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'b1' },
            { id: 'bishop-2', type: PIECE_TYPES.BISHOP, position: 'b7' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 Two diagonal lines cross on e4. Stepping horizontally/vertically (e.g. e5 or d4) escapes both diagonal crosshairs!'
    },
    {
        id: 9,
        title: 'Level 9: Dual Rook Crossroad',
        subtitle: 'Rank and File Pin',
        concept: 'Rooks coordinate horizontal and vertical lines.',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'rook-1', type: PIECE_TYPES.ROOK, position: 'd8' },
            { id: 'rook-2', type: PIECE_TYPES.ROOK, position: 'a4' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 Both the d-file and 4th rank are under fire! Stepping diagonally to c3, c5, e3, or e5 safely avoids both rooks!'
    },
    {
        id: 10,
        title: 'Level 10: The Two Kings',
        subtitle: 'Trapped Between Two Kings',
        concept: 'Kings control all 8 adjacent squares. Unsupported Kings can be captured!',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'king-1', type: PIECE_TYPES.KING, position: 'd5' },
            { id: 'king-2', type: PIECE_TYPES.KING, position: 'c3' }
        ],
        blocksAvailable: 0,
        blocksAllowed: false,
        hint: '💡 King 1 at d5 is unsupported! You can capture King 1 at d5, or step to safety on e3.'
    },

    // =========================================================================
    // STAGE 3: SUPPORTED PIECES & MIXED COMBINATIONS (Levels 11 - 15)
    // =========================================================================
    {
        id: 11,
        title: 'Level 11: The Guarded Soldier',
        subtitle: 'Protected Attackers Cannot Be Captured!',
        concept: 'If an adjacent attacker is protected by another piece, capture is forbidden!',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'a7' },
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'c5', direction: 'down' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 The Pawn at c5 is adjacent, but Bishop at a7 PROTECTS it! Capture is disabled. Step to e5/c3 or block the Bishop at b6!'
    },
    {
        id: 12,
        title: 'Level 12: Bishop & Knight Duet',
        subtitle: 'Mixed Diagonal & Jumping Threats',
        concept: 'Combine reasoning for blockable and unblockable attackers.',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'b1' },
            { id: 'knight-1', type: PIECE_TYPES.KNIGHT, position: 'd6' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 The Knight cannot be blocked, but the Bishop can. You can step to a square safe from both (e.g. e5 or d3)!'
    },
    {
        id: 13,
        title: 'Level 13: Elephant & Soldier Pinch',
        subtitle: 'Rook & Pawn Coordination',
        concept: 'Look for blind spots in combined threats.',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'rook-1', type: PIECE_TYPES.ROOK, position: 'a4' },
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'f5', direction: 'down' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 The Rook fires along row 4. The Pawn attacks e4 and g4. Blocking the Rook at c4, capturing the Pawn, or stepping to e5/e3 solves the puzzle!'
    },
    {
        id: 14,
        title: 'Level 14: Queen & Knight Ambush',
        subtitle: 'Royal Assault',
        concept: 'Queen covers lines while Knight covers jump angles.',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'queen-1', type: PIECE_TYPES.QUEEN, position: 'd8' },
            { id: 'knight-1', type: PIECE_TYPES.KNIGHT, position: 'b3' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 Block the Queen\'s line at d5/d6/d7 or slip away to an unattacked square like c5 or e3!'
    },
    {
        id: 15,
        title: 'Level 15: The Triad Ambush',
        subtitle: 'Pawn, Knight, and Bishop Coordinate',
        concept: 'Multi-angle threat analysis with support recognition.',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'd5', direction: 'down' },
            { id: 'knight-1', type: PIECE_TYPES.KNIGHT, position: 'c5' },
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'h7' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 Multiple threats converge on e4! Look carefully at adjacent squares: e5, d3, f3, e3!'
    },

    // =========================================================================
    // STAGE 4: ADVANCED TACTICAL CHALLENGES (Levels 16 - 20)
    // =========================================================================
    {
        id: 16,
        title: 'Level 16: The 4-Piece Siege',
        subtitle: 'Rook, Bishop, Knight, and Pawn',
        concept: 'Complex threat network.',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'rook-1', type: PIECE_TYPES.ROOK, position: 'd8' },
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'g7' },
            { id: 'knight-1', type: PIECE_TYPES.KNIGHT, position: 'e6' },
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'c5', direction: 'down' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 Heavy crossfire! Trace each threat line and find the single safe sanctuary square (e.g. c4 or e3).'
    },
    {
        id: 17,
        title: 'Level 17: The 6-Piece Gauntlet',
        subtitle: 'Hexagonal Assault Network',
        concept: 'Filtering multi-piece coverage.',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'rook-1', type: PIECE_TYPES.ROOK, position: 'd8' },
            { id: 'rook-2', type: PIECE_TYPES.ROOK, position: 'a4' },
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'a7' },
            { id: 'knight-1', type: PIECE_TYPES.KNIGHT, position: 'f5' },
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'c5', direction: 'down' },
            { id: 'king-1', type: PIECE_TYPES.KING, position: 'f2' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 6 pieces cover the board. Step diagonally to c3 or e3 to find safety!'
    },
    {
        id: 18,
        title: 'Level 18: The 8-Piece Fortress',
        subtitle: 'Octo-Threat Matrix',
        concept: 'Deep threat decomposition.',
        kitten: { position: 'e4' },
        attackers: [
            { id: 'queen-1', type: PIECE_TYPES.QUEEN, position: 'e8' },
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'b7' },
            { id: 'knight-1', type: PIECE_TYPES.KNIGHT, position: 'c5' },
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'd5', direction: 'down' },
            { id: 'rook-1', type: PIECE_TYPES.ROOK, position: 'h8' },
            { id: 'bishop-2', type: PIECE_TYPES.BISHOP, position: 'g8' },
            { id: 'knight-2', type: PIECE_TYPES.KNIGHT, position: 'g7' },
            { id: 'pawn-2', type: PIECE_TYPES.PAWN, position: 'a6', direction: 'down' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 An 8-piece fortress! Look at the lateral unattacked squares (d4 or f4) to slip past the defense!'
    },
    {
        id: 19,
        title: 'Level 19: The 12-Piece Royal Ambush',
        subtitle: 'Intense 12-Attacker Crossfire',
        concept: 'Master-level spatial defense.',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'queen-1', type: PIECE_TYPES.QUEEN, position: 'd8' },
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'a7' },
            { id: 'rook-1', type: PIECE_TYPES.ROOK, position: 'a5' },
            { id: 'rook-2', type: PIECE_TYPES.ROOK, position: 'h3' },
            { id: 'knight-1', type: PIECE_TYPES.KNIGHT, position: 'b6' },
            { id: 'knight-2', type: PIECE_TYPES.KNIGHT, position: 'f6' },
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'c6', direction: 'down' },
            { id: 'pawn-2', type: PIECE_TYPES.PAWN, position: 'e6', direction: 'down' },
            { id: 'pawn-3', type: PIECE_TYPES.PAWN, position: 'g3', direction: 'down' },
            { id: 'bishop-2', type: PIECE_TYPES.BISHOP, position: 'h8' },
            { id: 'king-1', type: PIECE_TYPES.KING, position: 'a1' },
            { id: 'king-2', type: PIECE_TYPES.KING, position: 'h1' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 12 pieces surround the Kitten. Step diagonally down to c3 to survive!'
    },
    {
        id: 20,
        title: 'Level 20: The Grand 16-Piece Masterpiece',
        subtitle: '16 Attackers Converge!',
        concept: 'The ultimate test of attack and defensive analysis.',
        kitten: { position: 'd4' },
        attackers: [
            { id: 'rook-1', type: PIECE_TYPES.ROOK, position: 'd8' },
            { id: 'pawn-1', type: PIECE_TYPES.PAWN, position: 'c5', direction: 'down' },
            { id: 'knight-1', type: PIECE_TYPES.KNIGHT, position: 'b5' },
            { id: 'bishop-1', type: PIECE_TYPES.BISHOP, position: 'a7' },
            { id: 'rook-2', type: PIECE_TYPES.ROOK, position: 'a6' },
            { id: 'rook-3', type: PIECE_TYPES.ROOK, position: 'h6' },
            { id: 'rook-4', type: PIECE_TYPES.ROOK, position: 'a2' },
            { id: 'bishop-2', type: PIECE_TYPES.BISHOP, position: 'g8' },
            { id: 'bishop-3', type: PIECE_TYPES.BISHOP, position: 'b8' },
            { id: 'bishop-4', type: PIECE_TYPES.BISHOP, position: 'g1' },
            { id: 'knight-2', type: PIECE_TYPES.KNIGHT, position: 'b3' },
            { id: 'knight-3', type: PIECE_TYPES.KNIGHT, position: 'g7' },
            { id: 'knight-4', type: PIECE_TYPES.KNIGHT, position: 'f7' },
            { id: 'pawn-2', type: PIECE_TYPES.PAWN, position: 'c6', direction: 'down' },
            { id: 'king-1', type: PIECE_TYPES.KING, position: 'a1' },
            { id: 'king-2', type: PIECE_TYPES.KING, position: 'h1' }
        ],
        blocksAvailable: 1,
        blocksAllowed: true,
        hint: '💡 16 pieces surround the Kitten! Find the single hidden safe escape square (e4) to triumph over the grand master challenge!'
    }
];
