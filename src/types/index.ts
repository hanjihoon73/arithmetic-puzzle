export type CellType = 'input' | 'fixed' | 'operator' | 'empty';

export interface Cell {
    r: number;
    c: number;
    type: CellType;
    value?: string | number; // Displayed value for fixed/operator, or current input
    answer?: number; // Correct answer for input cells
    isCorrect?: boolean; // Validation state
    isWrong?: boolean; // Validation state
}

export interface Level {
    id: number;
    difficulty: string;
    boardSize: {
        rows: number;
        cols: number;
    };
    grid: Cell[];
    pool: number[];
    initialLives?: number;
}

export type GameStatus = 'playing' | 'won' | 'lost';
