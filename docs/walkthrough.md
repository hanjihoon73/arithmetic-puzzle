# Walkthrough - Dev Mode

## Overview
Added a "Dev Mode" to facilitate easier testing. This mode prevents life loss when incorrect answers are submitted.

## Changes

### 1. Game Store (`src/store/gameStore.ts`)
- **State**: Added `devMode` (boolean).
- **Action**: Added `toggleDevMode`.
- **Logic**: Updated `placeNumber` to skip the life deduction step (`lives - 1`) when `devMode` is `true`. The visual feedback (Red/Green) remains active.

### 2. Header UI (`src/components/game/Header.tsx`)
- Added a **Bug Icon** button next to the Settings icon.
- **Functionality**: Toggles Dev Mode on/off.
- **Visuals**:
    - **Active**: Button turns Red. Lives display changes to a red "INF" badge.
    - **Inactive**: Button is gray. Lives display shows standard hearts.

## Verification
- **Scenario A**: Click Bug Icon -> Dev Mode ON.
    - Submit wrong answer -> Equation marks red, but hearts remain unchanged (INF).
- **Scenario B**: Click Bug Icon -> Dev Mode OFF.
    - Submit wrong answer -> Hearts decrease.
