# Walkthrough - Strict Validation & Advanced Interaction (Refined)

## Overview
Implemented strict "All-or-Nothing" validation, improved interactions (Move, Drag-to-Remove, Swap), and refined selection behavior for better usability.

## Changes

### 1. Strict Validation
- **Logic**: When an equation is filled, checks if **ALL** input cells match the answer key.
- **Outcome**:
    - If **ALL** are correct: Entire equation turns Green.
    - If **ANY** is wrong (even if some parts are correct): **ALL** input cells in that equation turn Red.

### 2. Interactions
- **Selection Behavior**:
    - **Click Empty Cell**: Selects as **Target** (Blue Ring). Ready to receive a number.
    - **Click Filled Cell**: Selects as **Source** (Purple Ring + Pulse). Ready to be moved.
    - **Place Number**: Placing a number (from pool or move) **clears the selection** immediately.
- **Move Numbers**:
    - Select a filled cell (Purple).
    - Click an empty cell (Blue target).
    - Number moves; selection clears.
- **Swap/Replace**:
    - Place a number onto an occupied cell.
    - Existing number returns to Pool. New number takes its place.
- **Drag-to-Remove**:
    - Drag a number to the Number Pool area to remove it.

## Verification
- **Scenario A**: Click empty cell -> Blue Ring. Place `2` -> `2` placed, Selection clears (No ring).
- **Scenario B**: Click `2` (Filled) -> Purple Ring (Movable). Click empty cell -> `2` moves there, Selection clears.
- **Scenario C**: Click `2` (Filled). Click another Filled cell -> Selection switches to the new cell (Purple).
