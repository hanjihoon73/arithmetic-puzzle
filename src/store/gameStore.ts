import { create } from 'zustand';
import { Cell, GameStatus, Level } from '@/types';
import { validatePlacement, checkWinCondition, getHint, getSmartFill } from '@/lib/gameLogic';

interface GameState {
    level: Level | null;
    grid: Cell[];
    pool: number[];
    lives: number;
    status: GameStatus;
    history: Cell[][]; // Simple history stack for undo (optional)
    selectedCell: { r: number, c: number } | null;
    selectedNumberIndex: number | null; // Use index to distinguish identical numbers in pool
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
        });
    },

    placeNumber: (row, col, value) => {
        const { grid, lives, pool, status } = get();
        if (status !== 'playing') return;

        const cellIndex = grid.findIndex((c) => c.r === row && c.c === col);
        if (cellIndex === -1) return;

        const cell = grid[cellIndex];
        const isCorrect = validatePlacement(cell, value);

        if (isCorrect) {
            // Create new grid with updated cell
            const newGrid = [...grid];
            newGrid[cellIndex] = { ...cell, value: value, isCorrect: true };

            // Remove used value from pool
            const poolIndex = pool.indexOf(value);
            const newPool = [...pool];
            if (poolIndex > -1) newPool.splice(poolIndex, 1);

            // Check win condition
            const won = checkWinCondition(newGrid);

            set({
                grid: newGrid,
                pool: newPool,
                status: won ? 'won' : 'playing',
            });
        } else {
            // Wrong answer logic
            // 1. Place it temporarily as 'wrong'
            const newGrid = [...grid];
            newGrid[cellIndex] = { ...cell, value: value, isWrong: true };

            // 2. Remove from pool temporarily
            const poolIndex = pool.indexOf(value);
            const newPool = [...pool];
            if (poolIndex > -1) newPool.splice(poolIndex, 1);

            set({
                lives: Math.max(0, lives - 1),
                status: lives - 1 <= 0 ? 'lost' : 'playing',
                grid: newGrid,
                pool: newPool,
                selectedCell: null,
                selectedNumberIndex: null
            });

            // 3. Revert after delay (Bounce back effect)
            setTimeout(() => {
                const { grid: currentGrid, pool: currentPool, status: currentStatus } = get();

                // If game ended, maybe don't revert or doesn't matter, but let's keep consistent
                // Find the cell again
                const currentCellIndex = currentGrid.findIndex((c) => c.r === row && c.c === col);
                if (currentCellIndex === -1) return;

                const currentCell = currentGrid[currentCellIndex];

                // Only revert if it's currently holding the wrong value we placed
                if (currentCell.value === value && currentCell.isWrong) {
                    const revertedGrid = [...currentGrid];
                    revertedGrid[currentCellIndex] = { ...cell, value: undefined, isWrong: undefined, isCorrect: undefined };

                    const revertedPool = [...currentPool, value];

                    set({
                        grid: revertedGrid,
                        pool: revertedPool
                    });
                }
            }, 500);
        }
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
            newGrid[cellIndex] = { ...cell, value: undefined, isCorrect: undefined };

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

        // Validate placement
        const isCorrect = validatePlacement(targetCell, value);

        if (isCorrect) {
            const newGrid = [...grid];

            // Clear source
            const sourceIndex = newGrid.findIndex((c) => c.r === fromR && c.c === fromC);
            if (sourceIndex > -1) {
                newGrid[sourceIndex] = { ...newGrid[sourceIndex], value: undefined, isCorrect: undefined };
            }

            // Set target
            newGrid[targetIndex] = { ...targetCell, value: value, isCorrect: true };

            const won = checkWinCondition(newGrid);

            set({
                grid: newGrid,
                status: won ? 'won' : 'playing',
                selectedCell: null,
                selectedNumberIndex: null
            });
        } else {
            // Moving to wrong spot: return to pool? or just stay?
            // Requirement: "Wrong -> return to pool".
            // If we move from A to B and B is wrong, A is cleared? 
            // Logic: If I drag from A to B, and B is wrong, the number should return to POOL, and A should be cleared.

            const { lives, pool } = get();
            // Clear source (it flies away)
            const newGrid = [...grid];
            const sourceIndex = newGrid.findIndex((c) => c.r === fromR && c.c === fromC);
            if (sourceIndex > -1) {
                newGrid[sourceIndex] = { ...newGrid[sourceIndex], value: undefined, isCorrect: undefined };
            }

            // Add back to pool
            const newPool = [...pool, value];

            set({
                grid: newGrid,
                pool: newPool,
                lives: Math.max(0, lives - 1),
                status: lives - 1 <= 0 ? 'lost' : 'playing'
            });
        }
    },

    restartLevel: () => {
        const { level } = get();
        if (level) {
            get().initializeLevel(level);
        }
    },

    selectCell: (r, c) => {
        const { status, selectedNumberIndex, pool, placeNumber } = get();
        if (status !== 'playing') return;

        // If a number is already selected, place it here
        if (selectedNumberIndex !== null) {
            const value = pool[selectedNumberIndex];
            placeNumber(r, c, value);
            // placeNumber clears selection
        } else {
            // Otherwise select/deselect this cell
            const { selectedCell } = get();
            if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
                set({ selectedCell: null }); // Toggle off
            } else {
                set({ selectedCell: { r, c } });
            }
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
