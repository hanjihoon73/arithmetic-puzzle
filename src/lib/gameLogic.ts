import { Cell, Level } from '@/types';

export const validatePlacement = (cell: Cell, value: number): boolean => {
    return cell.type === 'input' && cell.answer === value;
};

export const checkWinCondition = (grid: Cell[]): boolean => {
    return grid.every((cell) => {
        if (cell.type !== 'input') return true;
        return cell.value === cell.answer; // Assuming 'value' stores the current input for input cells
    });
};

export const getHint = (grid: Cell[]): Cell | null => {
    const emptyInputCells = grid.filter(
        (cell) => cell.type === 'input' && cell.value === undefined
    );

    if (emptyInputCells.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * emptyInputCells.length);
    return emptyInputCells[randomIndex];
};

export const getSmartFill = (grid: Cell[]): Cell | null => {
    const emptyInputCells = grid.filter(
        (cell) => cell.type === 'input' && cell.value === undefined
    );

    if (emptyInputCells.length === 0) return null;

    // Find the cell with the largest answer value
    return emptyInputCells.reduce((prev, current) => {
        return (prev.answer || 0) > (current.answer || 0) ? prev : current;
    });
};

export const detectCompletedEquations = (grid: Cell[], rows: number, cols: number): number[][] => {
    const solvedGroups: number[][] = [];

    // Helper to get cell at r, c
    const getCell = (r: number, c: number) => grid.find(cell => cell.r === r && cell.c === c);

    // Check a sequence of 5 cells
    const checkSequence = (cells: (Cell | undefined)[]) => {
        if (cells.some(c => !c || c.type === 'empty')) return false;

        // Pattern: Num, Op, Num, =, Num
        // Or: Num, =, Num, Op, Num ? No, strict format "A op B = C" requested.
        // Index: 0(Num), 1(Op), 2(Num), 3(=), 4(Num)

        const [c0, c1, c2, c3, c4] = cells as Cell[];

        // Check types
        const isNum = (c: Cell) => c.type === 'input' || c.type === 'fixed';
        const isOp = (c: Cell) => c.type === 'operator' && ['+', '-', 'x', '/'].includes(c.value as string);
        const isEq = (c: Cell) => c.type === 'operator' && c.value === '=';

        if (!isNum(c0) || !isOp(c1) || !isNum(c2) || !isEq(c3) || !isNum(c4)) return false;

        // Check if inputs are filled and correct
        const isFilledCorrectly = (c: Cell) => {
            if (c.type === 'fixed') return true;
            return c.type === 'input' && c.isCorrect === true;
        };

        if (!isFilledCorrectly(c0) || !isFilledCorrectly(c2) || !isFilledCorrectly(c4)) return false;

        return true;
    };

    // Horizontal scan
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= cols - 5; c++) {
            const sequence: (Cell | undefined)[] = [];
            const indices: number[] = [];
            for (let k = 0; k < 5; k++) {
                const cell = getCell(r, c + k);
                sequence.push(cell);
                // We need the index in the grid array for highlighting
                const idx = grid.findIndex(g => g.r === r && g.c === c + k);
                indices.push(idx);
            }

            if (checkSequence(sequence)) {
                solvedGroups.push(indices);
            }
        }
    }

    // Vertical scan
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r <= rows - 5; r++) {
            const sequence: (Cell | undefined)[] = [];
            const indices: number[] = [];
            for (let k = 0; k < 5; k++) {
                const cell = getCell(r + k, c);
                sequence.push(cell);
                const idx = grid.findIndex(g => g.r === r + k && g.c === c);
                indices.push(idx);
            }

            if (checkSequence(sequence)) {
                solvedGroups.push(indices);
            }
        }
    }

    return solvedGroups;
};

// Returns list of equation groups (indices) that pass through (row, col) and are fully filled
export const getFilledEquations = (grid: Cell[], rows: number, cols: number, targetR: number, targetC: number): number[][] => {
    const filledGroups: number[][] = [];
    const getCell = (r: number, c: number) => grid.find(cell => cell.r === r && cell.c === c);
    const getIndex = (r: number, c: number) => grid.findIndex(cell => cell.r === r && cell.c === c);

    // Helper to check a sequence
    const checkSequenceAndGetIndices = (rStart: number, cStart: number, dr: number, dc: number): number[] | null => {
        const indices: number[] = [];
        const cells: Cell[] = [];

        for (let k = 0; k < 5; k++) {
            const r = rStart + k * dr;
            const c = cStart + k * dc;
            const cell = getCell(r, c);
            const idx = getIndex(r, c);
            if (!cell || cell.type === 'empty') return null;
            cells.push(cell);
            indices.push(idx);
        }

        // Check pattern: Num Op Num = Num
        // Strict check on types
        const [c0, c1, c2, c3, c4] = cells;
        const isNum = (c: Cell) => c.type === 'input' || c.type === 'fixed';
        const isOp = (c: Cell) => c.type === 'operator'; // allow any operator for now, strictly speaking we expect +,-,x,/ and =
        // The structure is fixed by levelData, so we can assume valid structure if types match
        // But for "Filled", we just care if inputs have values.

        // Check if it passes through target (optimization)
        if (!indices.includes(getIndex(targetR, targetC))) return null;

        // Check if inputs are filled
        const isFilled = (c: Cell) => {
            if (c.type === 'fixed') return true;
            return c.type === 'input' && c.value !== undefined;
        };

        if (isFilled(c0) && isFilled(c2) && isFilled(c4)) {
            return indices;
        }

        return null;
    };

    // Scan Horizontal
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= cols - 5; c++) {
            const indices = checkSequenceAndGetIndices(r, c, 0, 1);
            if (indices) filledGroups.push(indices);
        }
    }

    // Scan Vertical
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r <= rows - 5; r++) {
            const indices = checkSequenceAndGetIndices(r, c, 1, 0);
            if (indices) filledGroups.push(indices);
        }
    }

    return filledGroups;
};
