import { Level, Cell } from '@/types';

const GRID_SIZE = 5;

const createEmptyGrid = (rows: number, cols: number): Cell[] => {
    const grid: Cell[] = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            grid.push({ r, c, type: 'empty' });
        }
    }
    return grid;
};

const getLevel1Grid = (): Cell[] => {
    const grid = createEmptyGrid(GRID_SIZE, GRID_SIZE);

    const levelCells: Cell[] = [
        // Row 0: 2 + 3 = 5
        { r: 0, c: 0, type: 'input', answer: 2 },
        { r: 0, c: 1, type: 'operator', value: '+' },
        { r: 0, c: 2, type: 'input', answer: 3 },
        { r: 0, c: 3, type: 'operator', value: '=' },
        { r: 0, c: 4, type: 'fixed', value: 5 },

        // Col 2: 3 x 2 = 6 (intersecting at (0,2))
        // (0,2) is already defined as input 3
        { r: 1, c: 2, type: 'operator', value: 'x' },
        { r: 2, c: 2, type: 'input', answer: 2 },
        { r: 3, c: 2, type: 'operator', value: '=' },
        { r: 4, c: 2, type: 'fixed', value: 6 },
    ];

    levelCells.forEach(cell => {
        const index = grid.findIndex(g => g.r === cell.r && g.c === cell.c);
        if (index !== -1) {
            grid[index] = cell;
        }
    });

    return grid;
};

export const LEVEL_1: Level = {
    id: 1,
    difficulty: 'Easy',
    boardSize: { rows: GRID_SIZE, cols: GRID_SIZE },
    initialLives: 3,
    grid: getLevel1Grid(),
    pool: [2, 2, 3], // Matches inputs: 2, 3, 2
};

export const LEVELS: Record<number, Level> = {
    1: LEVEL_1,
};
