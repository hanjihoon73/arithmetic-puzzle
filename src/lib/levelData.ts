import { Level } from '@/types';

export const LEVEL_1: Level = {
    id: 1,
    difficulty: 'Easy',
    boardSize: { rows: 5, cols: 5 },
    initialLives: 3,
    pool: [1, 2, 5],
    grid: [
        // R0: 2 + 3 = 5
        { r: 0, c: 0, type: 'input', answer: 2 },
        { r: 0, c: 1, type: 'operator', value: '+' },
        { r: 0, c: 2, type: 'fixed', value: 3 },
        { r: 0, c: 3, type: 'operator', value: '=' },
        { r: 0, c: 4, type: 'input', answer: 5 },

        // R1: + (0,4) - 1 = 4
        { r: 1, c: 0, type: 'empty' }, { r: 1, c: 1, type: 'empty' }, { r: 1, c: 2, type: 'empty' }, { r: 1, c: 3, type: 'empty' }, { r: 1, c: 4, type: 'operator', value: '-' },

        // R2: 1 (0,4)
        { r: 2, c: 0, type: 'empty' }, { r: 2, c: 1, type: 'empty' }, { r: 2, c: 2, type: 'empty' }, { r: 2, c: 3, type: 'empty' }, { r: 2, c: 4, type: 'input', answer: 1 },

        // R3: =
        { r: 3, c: 0, type: 'empty' }, { r: 3, c: 1, type: 'empty' }, { r: 3, c: 2, type: 'empty' }, { r: 3, c: 3, type: 'empty' }, { r: 3, c: 4, type: 'operator', value: '=' },

        // R4: 4
        { r: 4, c: 0, type: 'empty' }, { r: 4, c: 1, type: 'empty' }, { r: 4, c: 2, type: 'empty' }, { r: 4, c: 3, type: 'empty' }, { r: 4, c: 4, type: 'fixed', value: 4 },
    ],
};

export const LEVEL_2: Level = {
    id: 2,
    difficulty: 'Medium',
    boardSize: { rows: 5, cols: 6 },
    initialLives: 3,
    pool: [4, 12, 6, 5, 3, 7],
    grid: [
        // R0: 4 x 3 = 12
        { r: 0, c: 0, type: 'input', answer: 4 }, { r: 0, c: 1, type: 'operator', value: 'x' }, { r: 0, c: 2, type: 'fixed', value: 3 }, { r: 0, c: 3, type: 'operator', value: '=' }, { r: 0, c: 4, type: 'input', answer: 12 }, { r: 0, c: 5, type: 'empty' },

        // R1: +       -
        { r: 1, c: 0, type: 'operator', value: '+' }, { r: 1, c: 1, type: 'empty' }, { r: 1, c: 2, type: 'empty' }, { r: 1, c: 3, type: 'empty' }, { r: 1, c: 4, type: 'operator', value: '-' }, { r: 1, c: 5, type: 'empty' },

        // R2: 6       5
        { r: 2, c: 0, type: 'input', answer: 6 }, { r: 2, c: 1, type: 'empty' }, { r: 2, c: 2, type: 'empty' }, { r: 2, c: 3, type: 'empty' }, { r: 2, c: 4, type: 'input', answer: 5 }, { r: 2, c: 5, type: 'empty' },

        // R3: =       =
        { r: 3, c: 0, type: 'operator', value: '=' }, { r: 3, c: 1, type: 'empty' }, { r: 3, c: 2, type: 'empty' }, { r: 3, c: 3, type: 'empty' }, { r: 3, c: 4, type: 'operator', value: '=' }, { r: 3, c: 5, type: 'empty' },

        // R4: 10 - 3 = 7
        { r: 4, c: 0, type: 'fixed', value: 10 }, { r: 4, c: 1, type: 'operator', value: '-' }, { r: 4, c: 2, type: 'input', answer: 3 }, { r: 4, c: 3, type: 'operator', value: '=' }, { r: 4, c: 4, type: 'input', answer: 7 }, { r: 4, c: 5, type: 'empty' },
    ],
};

export const LEVEL_3: Level = {
    id: 3,
    difficulty: 'Hard',
    boardSize: { rows: 5, cols: 5 },
    initialLives: 3,
    pool: [15, 5, 17, 4, 12, 20],
    grid: [
        // R0: 15 / 3 = 5
        { r: 0, c: 0, type: 'input', answer: 15 }, { r: 0, c: 1, type: 'operator', value: '/' }, { r: 0, c: 2, type: 'fixed', value: 3 }, { r: 0, c: 3, type: 'operator', value: '=' }, { r: 0, c: 4, type: 'input', answer: 5 },

        // R1: +       x
        { r: 1, c: 0, type: 'operator', value: '+' }, { r: 1, c: 1, type: 'empty' }, { r: 1, c: 2, type: 'empty' }, { r: 1, c: 3, type: 'empty' }, { r: 1, c: 4, type: 'operator', value: 'x' },

        // R2: 17      4
        { r: 2, c: 0, type: 'input', answer: 17 }, { r: 2, c: 1, type: 'empty' }, { r: 2, c: 2, type: 'empty' }, { r: 2, c: 3, type: 'empty' }, { r: 2, c: 4, type: 'input', answer: 4 },

        // R3: =       =
        { r: 3, c: 0, type: 'operator', value: '=' }, { r: 3, c: 1, type: 'empty' }, { r: 3, c: 2, type: 'empty' }, { r: 3, c: 3, type: 'empty' }, { r: 3, c: 4, type: 'operator', value: '=' },

        // R4: 32 - 12 = 20
        { r: 4, c: 0, type: 'fixed', value: 32 }, { r: 4, c: 1, type: 'operator', value: '-' }, { r: 4, c: 2, type: 'input', answer: 12 }, { r: 4, c: 3, type: 'operator', value: '=' }, { r: 4, c: 4, type: 'input', answer: 20 },
    ],
};


export const LEVELS: Record<number, Level> = {
    1: LEVEL_1,
    2: LEVEL_2,
    3: LEVEL_3,
};
