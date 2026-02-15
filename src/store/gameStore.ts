import { create } from 'zustand';
import { Cell, GameStatus, Level } from '@/types';
import { validatePlacement, checkWinCondition, getHint, getSmartFill, detectCompletedEquations, getFilledEquations } from '@/lib/gameLogic';

interface GameState {
    level: Level | null;
    grid: Cell[];
    pool: number[];
    lives: number;
    status: GameStatus;
    history: Cell[][]; // Simple history stack for undo (optional)
    selectedCell: { r: number, c: number } | null;
    selectedNumberIndex: number | null; // Use index to distinguish identical numbers in pool
    solvedEquations: number[][]; // List of indices of cells in solved equations
    devMode: boolean; // Dev mode for infinite lives
    initializeLevel: (level: Level) => void;
    placeNumber: (row: number, col: number, value: number) => void;
    moveNumber: (fromR: number, fromC: number, toR: number, toC: number, value: number) => void;
    removeNumber: (row: number, col: number) => void;
    useHint: () => void;
    useSmartFill: () => void;
    undo: () => void; // Optional
    restartLevel: () => void;
    selectCell: (r: number, c: number) => void;
    selectNumber: (index: number, value: number) => void;
    clearSelection: () => void;
    toggleDevMode: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    level: null,
    grid: [],
    pool: [],
    lives: 3,
    status: 'playing',
    history: [],
    selectedCell: null,
    selectedNumberIndex: null,
    solvedEquations: [],
    devMode: false,

    initializeLevel: (level) => {
        set({
            level,
            grid: JSON.parse(JSON.stringify(level.grid)), // Deep copy
            pool: [...level.pool],
            lives: level.initialLives || 3,
            status: 'playing',
            history: [],
            selectedCell: null,
            selectedNumberIndex: null,
            solvedEquations: [], // Reset solved
        });
    },

    toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),

    placeNumber: (row, col, value) => {
        const { grid, lives, pool, status, devMode } = get();
        if (status !== 'playing') return;

        const cellIndex = grid.findIndex((c) => c.r === row && c.c === col);
        if (cellIndex === -1) return;

        const cell = grid[cellIndex];

        const newPool = [...pool];

        // If cell already has a value, return it to the pool (Swap effect)
        if (cell.type === 'input' && cell.value !== undefined) {
            newPool.push(cell.value as number);
        }

        // Remove the new value from pool
        const poolIndex = newPool.indexOf(value);
        if (poolIndex > -1) newPool.splice(poolIndex, 1);

        // 1. Always place the number first (without validation status)
        const newGrid = [...grid];
        newGrid[cellIndex] = { ...cell, value: value, isCorrect: undefined, isWrong: undefined };

        // 2. Check if this completes any equations
        const { level } = get();
        if (!level) return;

        // Check for filled equations involving this cell
        const filledEquationIndices = getFilledEquations(newGrid, level.boardSize.rows, level.boardSize.cols, row, col);

        let newLives = lives;
        let newStatus: GameStatus = status; // Start with current status
        let equationsValidated = false;

        if (filledEquationIndices.length > 0) {
            equationsValidated = true;
            filledEquationIndices.forEach((indices: number[]) => {
                // Check if ALL input cells in this equation are correct
                const allCorrect = indices.every((idx: number) => {
                    const c = newGrid[idx];
                    if (c.type === 'input') {
                        // Check if value matches answer
                        // Note: c.value is what we just placed or existing.
                        return c.value === c.answer;
                    }
                    return true; // Fixed/Operator cells are always "correct" structure-wise
                });

                // Apply status based on all-or-nothing
                indices.forEach((idx: number) => {
                    const c = newGrid[idx];
                    if (c.type === 'input' && c.value !== undefined) {
                        if (allCorrect) {
                            newGrid[idx] = { ...c, isCorrect: true, isWrong: undefined };
                        } else {
                            // If equation is invalid, mark ALL inputs as wrong
                            newGrid[idx] = { ...c, isCorrect: undefined, isWrong: true };
                        }
                    }
                });
            });

            // Check if ANY cell in the filled equations is wrong (which means the whole equation failed)
            const hasError = filledEquationIndices.some((indices: number[]) =>
                indices.some((idx: number) => newGrid[idx].isWrong)
            );

            if (hasError && !devMode) { // Only reduce lives if NOT in devMode
                newLives = Math.max(0, lives - 1);
                newStatus = newLives <= 0 ? 'lost' : 'playing';
            }
        }

        const won = checkWinCondition(newGrid);
        const solvedEquations = detectCompletedEquations(newGrid, level.boardSize.rows, level.boardSize.cols);

        set({
            grid: newGrid,
            pool: newPool,
            lives: newLives,
            status: newStatus === 'playing' && won ? 'won' : newStatus,
            solvedEquations,
            selectedCell: null, // Clear selection after placement
            selectedNumberIndex: null
        });

        // Bounce back effect REMOVED as per user request (Step 349).
        // Wrong answers stay in the grid with isWrong=true status.
    },

    removeNumber: (row, col) => {
        // Only if we allow removing placed numbers (might not be needed if drag & drop handles swap)
        const { grid, pool, status } = get();
        if (status !== 'playing') return;

        const cellIndex = grid.findIndex((c) => c.r === row && c.c === col);
        if (cellIndex === -1) return;

        const cell = grid[cellIndex];
        if (cell.type === 'input' && cell.value !== undefined) {
            const newGrid = [...grid];
            const value = cell.value as number;
            newGrid[cellIndex] = { ...cell, value: undefined, isCorrect: undefined, isWrong: undefined };

            set({
                grid: newGrid,
                pool: [...pool, value],
                selectedCell: null, // Clear selection
                selectedNumberIndex: null
            });
        }
    },

    useHint: () => {
        const { grid, pool, status } = get();
        if (status !== 'playing') return;

        const hintCell = getHint(grid);
        if (hintCell && hintCell.answer !== undefined) {
            // Same logic as placeNumber but guaranteed correct
            get().placeNumber(hintCell.r, hintCell.c, hintCell.answer);
            // Deduct hint resource if we had one
        }
    },

    useSmartFill: () => {
        const { grid, status } = get();
        if (status !== 'playing') return;

        const smartCell = getSmartFill(grid);
        if (smartCell && smartCell.answer !== undefined) {
            get().placeNumber(smartCell.r, smartCell.c, smartCell.answer);
            // Deduct smart fill resource if we had one
        }
    },

    undo: () => {
        // Implement undo logic if history is tracked
    },

    moveNumber: (fromR: number, fromC: number, toR: number, toC: number, value: number) => {
        const { grid, status } = get();
        if (status !== 'playing') return;

        // Validate target
        const targetIndex = grid.findIndex((c) => c.r === toR && c.c === toC);
        if (targetIndex === -1) return;
        const targetCell = grid[targetIndex];

        // For move, we just place it. Validation happens in placeNumber?
        // No, placeNumber logic is complex (lifecycle).
        // Reuse placeNumber logic? 
        // We need to clear source first, THEN place in target.
        // But placeNumber might fail/penalize.
        // Let's manually do it to ensure cleanliness.

        // 1. Clear source
        const newGrid = [...grid];
        const sourceIndex = newGrid.findIndex((c) => c.r === fromR && c.c === fromC);
        if (sourceIndex > -1) {
            newGrid[sourceIndex] = { ...newGrid[sourceIndex], value: undefined, isCorrect: undefined, isWrong: undefined };
        }

        set({ grid: newGrid }); // temporary update to clear source? 
        // Actually, we can just call removeNumber then placeNumber?
        // removeNumber puts it back in pool. placeNumber takes from pool.
        // That works! And handles all validation logic reuse.

        // EXCEPT: removeNumber puts it at the END of pool?
        // And placeNumber takes it from pool.
        // If we have multiple same numbers, it might take a different one? 
        // Value determines identity in pool (number[]).
        // So it's fine.

        get().removeNumber(fromR, fromC);
        get().placeNumber(toR, toC, value);
    },

    restartLevel: () => {
        const { level } = get();
        if (level) {
            get().initializeLevel(level);
        }
    },

    selectCell: (r, c) => {
        const { status, selectedNumberIndex, pool, placeNumber, selectedCell, moveNumber, grid } = get();
        if (status !== 'playing') return;

        // 1. If we have a number selected from pool -> Place it
        if (selectedNumberIndex !== null) {
            const value = pool[selectedNumberIndex];
            placeNumber(r, c, value);
            // placeNumber clears selection
            return;
        }

        // 2. If we have a cell selected (Source)
        if (selectedCell) {
            // Check if we clicked the SAME cell -> Deselect
            if (selectedCell.r === r && selectedCell.c === c) {
                set({ selectedCell: null });
                return;
            }

            // Check if we clicked a DIFFERENT cell (Target)
            // If target is empty, we MOVE
            const targetCell = grid.find(cell => cell.r === r && cell.c === c);
            if (targetCell && targetCell.type === 'input' && targetCell.value === undefined) {
                // Find visible value of source cell
                const sourceCell = grid.find(cell => cell.r === selectedCell.r && cell.c === selectedCell.c);
                if (sourceCell && sourceCell.value !== undefined) {
                    moveNumber(selectedCell.r, selectedCell.c, r, c, sourceCell.value as number);
                    // moveNumber (via placeNumber) clears selection
                    return;
                }
            }

            // If target is NOT empty, we switch selection to new cell
            // (Unless it's fixed? User can select fixed cells? No, Cell.tsx prevents onClick for fixed/correct usually)
            // Assuming Cell.tsx allows click.
            set({ selectedCell: { r, c } });
        } else {
            // 3. No selection -> Select this cell
            set({ selectedCell: { r, c } });
        }
    },

    selectNumber: (index, value) => {
        const { status, selectedCell, placeNumber } = get();
        if (status !== 'playing') return;

        // If a cell is already selected, place this number there
        if (selectedCell) {
            placeNumber(selectedCell.r, selectedCell.c, value);
            // placeNumber clears selection
        } else {
            // Otherwise select/deselect this number
            const { selectedNumberIndex } = get();
            if (selectedNumberIndex === index) {
                set({ selectedNumberIndex: null }); // Toggle off
            } else {
                set({ selectedNumberIndex: index });
            }
        }
    },

    clearSelection: () => {
        set({ selectedCell: null, selectedNumberIndex: null });
    }
}));
