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

    initializeLevel: (level: Level) => void;
    placeNumber: (row: number, col: number, value: number) => void;
    moveNumber: (fromR: number, fromC: number, toR: number, toC: number, value: number) => void;
    removeNumber: (row: number, col: number) => void;
    useHint: () => void;
    useSmartFill: () => void;
    undo: () => void; // Optional
    restartLevel: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    level: null,
    grid: [],
    pool: [],
    lives: 3,
    status: 'playing',
    history: [],

    initializeLevel: (level) => {
        set({
            level,
            grid: JSON.parse(JSON.stringify(level.grid)), // Deep copy
            pool: [...level.pool],
            lives: level.initialLives || 3,
            status: 'playing',
            history: [],
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
            set({
                lives: Math.max(0, lives - 1),
                status: lives - 1 <= 0 ? 'lost' : 'playing',
            });
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
                pool: [...pool, value]
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
    }
}));
