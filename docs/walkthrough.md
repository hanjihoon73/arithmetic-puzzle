# Walkthrough - Tap & Place Implementation

## Overview
Implemented the "Tap & Place" interaction to improve mobile accessibility. This allows users to tap a cell and then a number (or vice versa) to place it. Additionally, implemented visual feedback for incorrect placements.

## Changes

### 1. Game Store (`src/store/gameStore.ts`)
- Added `selectedCell` and `selectedNumberIndex` to state.
- Implemented `selectCell` and `selectNumber` actions.
- **Updated `placeNumber`**: Now handles incorrect answers by temporarily placing the number (marked with `isWrong`) for 0.5s before returning it to the pool. This provides clear feedback ("Bounce back" effect).

### 2. Cell Component (`src/components/game/Cell.tsx`)
- Added `onClick` handler to trigger `selectCell`.
- Added visual styling for selected state (blue ring).
- Added visual styling for `isWrong` state (red background/border).

### 3. Number Pool Component (`src/components/game/NumberPool.tsx`)
- Added `onClick` handler to trigger `selectNumber`.
- Added visual styling for selected state.

## Verification
- **Scenario A**: Click empty cell -> Click CORRECT number -> Number placed permanently.
- **Scenario B**: Click empty cell -> Click WRONG number -> Number appears (Red) -> Disappears -> Returns to pool. Life decreases.
- **Scenario C**: Drag & Drop WRONG number -> Same feedback as above.
