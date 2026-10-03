# 🐱 Save The Kitten

[![Deploy to GitHub Pages](https://github.com/Sreenith-M/Savethekitten/actions/workflows/deploy.yml/badge.svg)](https://github.com/Sreenith-M/Savethekitten/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Tool: Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF.svg)](https://vitejs.dev/)
[![Testing: Vitest](https://img.shields.io/badge/Tested%20with-Vitest-729B1B.svg)](https://vitest.dev/)

> **A single-player educational defensive puzzle game** where the **Kitten** starts every level **⚠️ UNDER ATTACK** by static opponent pieces and must respond by either **MOVING** to a safe adjacent square, **BLOCKING** the line of attack with a protective brick (`🧱`), or **CAPTURING** an adjacent unsupported enemy piece (`⚔️`).

🌐 **Live Demo on GitHub Pages**: [https://sreenith-m.github.io/Savethekitten/](https://sreenith-m.github.io/Savethekitten/)

---

## 🎯 About The Game

**Save The Kitten** is NOT a traditional chess game. There are no turns, no checkmate, no castling, no en passant, no piece promotion, no opponent AI, and no conventional chess scoring.

Instead, the game borrows chess-inspired attack geometries to create an intuitive spatial reasoning puzzle. Every level poses one question:

> **"The Kitten is under attack. Where can I go, can I block the attack, or can I capture the attacker?"**

---

## 🛡️ Three Defensive Actions

The player responds to threats using one of three dedicated defensive actions:

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│       [ 👟 MOVE ]         [ 🧱 BLOCK ]      [ ⚔️ CAPTURE ]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

1. **`[ 👟 MOVE ]`**:
   * Step 1 square into any of the up-to-8 surrounding adjacent squares.
   * Safe destinations are highlighted with **pulsing green dots**. Unsafe squares under opponent attack are strictly filtered out.
2. **`[ 🧱 BLOCK ]`**:
   * Place a protective brick barrier along a straight or diagonal line of fire to interrupt sliding attackers (Rook, Bishop, Queen).
   * **Intuitive UX Rule**: Blocking solutions are **NEVER highlighted** or revealed on the board. The player must reason out where the block belongs. If an ineffective block is placed, it is removed and the player can retry immediately.
3. **`[ ⚔️ CAPTURE ]`**:
   * Directly attack and remove an adjacent enemy piece, but **ONLY if it is unsupported** (not protected by any other enemy piece).

---

## ♟️ Opponent Attack Patterns & Defensive Matrix

| Attacker | Attack Pattern | Blockable with 🧱? | Capturable? | Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **♟️ Pawn / Soldier** | Attacks 2 forward diagonal squares (configurable direction) | ❌ No | ✅ If adjacent & unsupported | Step away or Capture if adjacent & unsupported. |
| **♝ Bishop / Camel** | Clear diagonal rays | ✅ **Yes** | ✅ If adjacent & unsupported | Place a block on the diagonal ray, Move, or Capture. |
| **♞ Knight / Horse** | L-shaped hops over obstacles | ❌ No | ✅ If adjacent & unsupported | **Unblockable!** Step to a safe square or Capture. |
| **♜ Rook / Elephant** | Clear horizontal & vertical ranks/files | ✅ **Yes** | ✅ If adjacent & unsupported | Place a block along the file/rank, Move, or Capture. |
| **♛ Queen** | Horizontal, vertical, and diagonal rays | ✅ **Yes** | ✅ If adjacent & unsupported | Place a block along the attack ray, Move, or Capture. |
| **♚ King** | All 8 adjacent surrounding squares | ❌ No | ✅ If adjacent & unsupported | Step away from King's danger zone or Capture if unsupported! |

---

## ⚔️ Support & Protection Logic

> **Rule: Adjacent + Attacker + Unsupported = Capturable**
> **Rule: Adjacent + Attacker + Protected = NOT Capturable**

* A piece is **supported / protected** if another active opponent piece attacks its square.
* **Self-Exclusion**: A piece never counts as supporting itself.
* **Example**: If a Pawn at `c5` is guarded by a Bishop at `a7`, the Kitten cannot capture the Pawn because doing so would leave the Kitten in the Bishop's line of fire. The player must Move or Block instead.

---

## 🏆 Level Progression (20 Curated Puzzles)

The game features 20 progressive data-driven levels verified by automated solvability checkers:

* **Stage 1 (Levels 1–5): Single Piece Introductions**
  * Level 1: *The Soldier's Ambush* (1× Pawn)
  * Level 2: *The Camel's Beam* (1× Bishop)
  * Level 3: *The Horse's Leap* (1× Knight)
  * Level 4: *The Elephant's Highway* (1× Rook)
  * Level 5: *The Queen's Scepter* (1× Queen)
* **Stage 2 (Levels 6–10): Adjacent Capture & Dual Attackers**
  * Level 6: *Strike the Lone Soldier* (Adjacent unsupported Pawn capture)
  * Level 7: *Twin Soldiers* (2× Pawns)
  * Level 8: *Crossfire of Bishops* (2× Bishops)
  * Level 9: *Dual Rook Crossroad* (2× Rooks)
  * Level 10: *The Two Kings* (2× Kings, unsupported capture)
* **Stage 3 (Levels 11–15): Supported Attackers & Mixed Combinations**
  * Level 11: *The Guarded Soldier* (Pawn protected by Bishop -> Capture forbidden!)
  * Level 12: *Bishop & Knight Duet* (Bishop + Knight)
  * Level 13: *Elephant & Soldier Pinch* (Rook + Pawn)
  * Level 14: *Queen & Knight Ambush* (Queen + Knight)
  * Level 15: *The Triad Ambush* (Pawn + Knight + Bishop)
* **Stage 4 (Levels 16–20): Advanced Tactical Gauntlets**
  * Level 16: *The 4-Piece Siege* (4 Attackers)
  * Level 17: *The 6-Piece Gauntlet* (6 Attackers)
  * Level 18: *The 8-Piece Fortress* (8 Attackers)
  * Level 19: *The 12-Piece Royal Ambush* (12 Attackers)
  * Level 20: *The Grand 16-Piece Masterpiece* (16 Opponent Pieces!)

---

## 🏗️ Architecture

The codebase enforces a strict separation of concerns:

```text
Savethekitten/
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # Automated GitHub Pages CI/CD workflow
│
├── public/
│   └── assets/                     # Clean SVG vector graphics (Kitten, Pieces, Brick)
│
├── src/
│   ├── engine/                     # 🧠 PURE DEFENSIVE ENGINE (Zero DOM dependencies)
│   │   ├── board.js                # 8x8 Coordinates, bounds, state & deep clone
│   │   ├── pieces.js               # Piece types, emojis & blockability matrix
│   │   ├── attacks.js              # Attack ray generator & multi-attacker union
│   │   ├── safety.js               # Safe adjacent moves & move validation
│   │   ├── blocking.js             # Attack line ray-casting & block simulation
│   │   ├── capture.js              # Support calculation & capture validation
│   │   └── validation.js           # Level validator (verifies initial attack & solvability)
│   │
│   ├── game/                       # 🎮 CENTRALIZED GAME STATE & PROGRESSION
│   │   ├── gameState.js            # State machine (Move/Block/Capture), event emitter
│   │   ├── levels.js               # 20 Data-driven progressive puzzle levels
│   │   ├── levelLoader.js          # Level loader and integrity verifier
│   │   └── progression.js          # Versioned localStorage manager (save-the-kitten:v1)
│   │
│   ├── ui/                         # 🎨 USER INTERFACE & ASSETS
│   │   ├── boardRenderer.js        # 8x8 Chessboard renderer (No block hints!)
│   │   ├── actionButtonsUI.js      # [ MOVE ], [ BLOCK ], and [ CAPTURE ] toolbar
│   │   ├── controls.js             # Top nav, level dropdown & modal, sound toggle
│   │   ├── feedback.js             # Threat status card, victory & completion modals
│   │   ├── audio.js                # Synthesized Web Audio API sound generator
│   │   └── animations.js           # Particle bursts & prefers-reduced-motion handler
│   │
│   ├── main.js                     # Application entry point
│   └── style.css                   # Glassmorphic dark theme, threat rays, responsive layout
│
├── tests/                          # 🧪 AUTOMATED UNIT & INTEGRATION TESTS
│   ├── board.test.js               # Coordinates, grid bounds, entity tracking
│   ├── attacks.test.js             # Attack patterns for all 6 piece types
│   ├── safety.test.js              # Safe move filtering & crossfire logic
│   ├── blocking.test.js            # Line blocking availability & retry logic
│   ├── capture.test.js             # Adjacent detection, support exclusion & King cases
│   └── levels.test.js              # 20-level solvability and gameplay simulation
│
├── index.html                      # Semantic HTML5 entry point
├── package.json                    # Project metadata, Vite & Vitest scripts
├── vite.config.js                  # Vite configuration with GitHub Pages base path
├── .gitignore                      # Git ignore rules
└── README.md                       # Documentation
```

---

## 💻 Technology Stack

* **Core**: Vanilla JavaScript (ES Modules), HTML5 Semantic Elements
* **Styling**: Vanilla CSS3 (Custom Properties, Glassmorphism, CSS Grid, Flexbox)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Testing Framework**: [Vitest](https://vitest.dev/)
* **Audio**: Native Web Audio API (zero external sound dependencies)
* **Storage**: LocalStorage (`save-the-kitten:v1`)

---

## 🚀 Local Development & Testing

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher)
* `npm`

### 1. Clone & Install
```bash
git clone https://github.com/Sreenith-M/Savethekitten.git
cd Savethekitten
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
```bash
npm test
```
Runs the full Vitest suite covering board coordinates, attack patterns, safety engine, blocking engine, support/capture logic, and all 20 levels.

### 4. Build for Production
```bash
npm run build
```
Generates the optimized static production bundle in `dist/`.

### 5. Preview Production Build
```bash
npm run preview
```
Previews the production build locally under `/Savethekitten/`.

---

## 🚢 GitHub Pages Deployment

The repository is configured for automatic continuous deployment using **GitHub Actions**.

### Deployment Setup on GitHub:
1. Navigate to your repository on GitHub: `https://github.com/Sreenith-M/Savethekitten`
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Push your changes to the `main` branch.
5. GitHub Actions will run tests, build the site, and publish the bundle to:
   **[https://sreenith-m.github.io/Savethekitten/](https://sreenith-m.github.io/Savethekitten/)**

---

## ♿ Accessibility & Responsiveness

* **Screen Readers & Semantics**: Uses semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`), ARIA attributes (`role="grid"`, `aria-label`, `aria-live`).
* **Keyboard Navigation**: Full keyboard accessibility via `Tab`, `Enter`, and `Space`.
* **Reduced Motion**: Automatically honors `prefers-reduced-motion: reduce` by disabling particle bursts, pulsing lights, and badge wobbles.
* **Non-Color Reliance**: Information is communicated via text badges, icons, and shapes in addition to color.
* **Responsive Design**: Fluid square grid layout adapting seamlessly across desktop widescreen, laptop, iPad/tablet, and mobile touchscreens.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
