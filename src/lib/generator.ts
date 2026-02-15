import { Cell, Level, CellType } from '@/types';

// Constants
const COLS = 13;
const ROWS = 20;

type Grid = (Cell | null)[][];
type Direction = 'horizontal' | 'vertical';

interface Equation {
    formula: string; // e.g., "3+5=8"
    startR: number;
    startC: number;
    direction: Direction;
}

// Helpers
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Difficulty Settings
const DIFFICULTY_CONFIG = {
    easy: { maxNum: 10, operators: ['+', '-'], complexity: 1 },
    medium: { maxNum: 20, operators: ['+', '-', '*'], complexity: 2 },
    hard: { maxNum: 50, operators: ['+', '-', '*', '/'], complexity: 2 },
};

interface EquationData {
    operands: number[];
    operators: string[];
    result: number;
    fullString: string; // spacing for visualization if needed
}

// Helper: Generate a valid equation
const generateEquation = (difficulty: 'easy' | 'medium' | 'hard'): EquationData => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const numOperators = difficulty === 'easy' ? 1 : 2; // Simple for now

    // Only allow division if result is integer
    // Strategy: For division, pick result and divisor first, then multiply?
    // Or just reject invalid ones. Rejection sampling is easier for small numbers.

    let attempts = 0;
    while (attempts < 100) {
        attempts++;
        const operators: string[] = [];
        const operands: number[] = [];

        for (let i = 0; i < numOperators; i++) {
            const op = config.operators[Math.floor(Math.random() * config.operators.length)];
            operators.push(op);
        }

        // Generate operands
        // Logic: A op B = C
        // Careful with division: A / B. B should not be 0. A should be divisible by B.

        for (let i = 0; i <= numOperators; i++) {
            operands.push(getRandomInt(1, config.maxNum));
        }

        // Calculate result safe (left-to-right default JS, but need strict order?)
        // Let's stick to strict left-to-right for simplicity or standard PEMDAS?
        // JS eval uses PEMDAS.
        // Let's construct string
        let formula = `${operands[0]}`;
        for (let i = 0; i < numOperators; i++) {
            formula += ` ${operators[i]} ${operands[i + 1]}`;
        }

        try {
            // Unsafe eval? In generator it's fine as we control inputs.
            // But better to write a simple parser or use Function
            // eslint-disable-next-line
            const res = new Function(`return ${formula}`)();

            // Check validity
            if (Number.isInteger(res) && res >= 0 && res <= (config.maxNum * 2)) {
                // Additional Check: Intermediate steps for division/subtraction?
                // For now just final result.
                return {
                    operands,
                    operators,
                    result: res,
                    fullString: `${formula} = ${res}` // Spacing matters for parsing later?
                };
            }
        } catch (e) {
            continue;
        }
    }
    // Fallback
    return { operands: [1, 1], operators: ['+'], result: 2, fullString: "1 + 1 = 2" };
};

// Helper: Check if placement is valid
const canPlace = (grid: Grid, eq: Equation, components: (string | number)[]): boolean => {
    let r = eq.startR;
    let c = eq.startC;
    const dr = eq.direction === 'vertical' ? 1 : 0;
    const dc = eq.direction === 'horizontal' ? 1 : 0;

    for (let i = 0; i < components.length; i++) {
        // 1. Boundary Check
        if (r >= ROWS || c >= COLS || r < 0 || c < 0) return false;

        const cell = grid[r][c];
        const val = components[i].toString();

        // 2. Overlap Check
        if (cell !== null) {
            // Must match exactly for intersection
            if (cell.value !== val) return false;
        }

        // 3. Adjacency Check (The tricky part)
        // We must ensure we don't touch other existing cells improperly.
        // Rule: 
        // - In the flow direction (prev, next), neighbors are fine (it's our equation).
        // - In the cross direction (sides), neighbors must be EMPTY, UNLESS it's an intersection point.
        // - If it is an intersection point (cell !== null), we already checked value match.
        // - If it's a new placement (cell === null), side neighbors MUST be empty.

        // Side checks
        const side1R = r + dc; // Swap dr/dc for cross direction
        const side1C = c + dr;
        const side2R = r - dc;
        const side2C = c - dr;

        if (cell === null) {
            // If putting a new tile, sides must be empty
            if (isValid(side1R, side1C) && grid[side1R][side1C] !== null) return false;
            if (isValid(side2R, side2C) && grid[side2R][side2C] !== null) return false;
        }

        // Start/End checks (Before first and after last)
        if (i === 0) {
            const prevR = r - dr;
            const prevC = c - dc;
            if (isValid(prevR, prevC) && grid[prevR][prevC] !== null) return false;
        }
        if (i === components.length - 1) {
            const nextR = r + dr;
            const nextC = c + dc;
            if (isValid(nextR, nextC) && grid[nextR][nextC] !== null) return false;
        }

        r += dr;
        c += dc;
    }
    return true;
};

// Helper: Boundary check
const isValid = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

// Helper: Place on grid
const placeOnGrid = (grid: Grid, eq: Equation, components: (string | number)[]) => {
    let r = eq.startR;
    let c = eq.startC;
    const dr = eq.direction === 'vertical' ? 1 : 0;
    const dc = eq.direction === 'horizontal' ? 1 : 0;

    components.forEach((val) => {
        // Determine type
        let type: CellType = 'input'; // Default, will refine later
        if (['+', '-', '*', '/', '='].includes(val.toString())) type = 'operator';
        else type = 'fixed'; // Initially fixed, later we hide some

        grid[r][c] = {
            r, c,
            type, // Temporary type
            value: val.toString(), // Answer/Value
            answer: typeof val === 'number' ? val : undefined
        };
        r += dr;
        c += dc;
    });
};

export const generateLevel = (id: number, difficulty: 'easy' | 'medium' | 'hard'): Level => {
    // 1. Initialize Empty Grid
    // Use 2D array for logic
    const grid2D: (Cell | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    // 2. Place First Equation
    // Try to center it roughly
    let placedCount = 0;
    const maxEquations = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;

    const firstEqData = generateEquation(difficulty);
    // Parse to components
    // generateEquation returns numbers and strings. We need an array of them.
    // Reconstruct components flat
    const components: (string | number)[] = [];
    components.push(firstEqData.operands[0]);
    for (let i = 0; i < firstEqData.operators.length; i++) {
        components.push(firstEqData.operators[i]);
        components.push(firstEqData.operands[i + 1]);
    }
    components.push('=');
    components.push(firstEqData.result);

    // Randomize first placement
    // Try center-ish
    const dir: Direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    const len = components.length;
    let startR = getRandomInt(4, ROWS - 4 - (dir === 'vertical' ? len : 0));
    let startC = getRandomInt(2, COLS - 2 - (dir === 'horizontal' ? len : 0));

    // Safe bounds enforcement for first placement
    if (dir === 'horizontal') startC = Math.min(startC, COLS - len);
    if (dir === 'vertical') startR = Math.min(startR, ROWS - len);

    placeOnGrid(grid2D, { formula: firstEqData.fullString, startR, startC, direction: dir }, components);
    placedCount++;

    // 3. Place Subsequent Equations (Crossword Style)
    // Retry loop
    let failures = 0;
    while (placedCount < maxEquations && failures < 100) {
        // Find all non-null cells to potentially cross
        const candidates: { r: number, c: number, val: string }[] = [];
        grid2D.forEach(row => row.forEach(cell => {
            if (cell && cell.type === 'input' && typeof cell.answer === 'number') { // Only cross on numbers
                candidates.push({ r: cell.r, c: cell.c, val: cell.value!.toString() });
            }
        }));

        if (candidates.length === 0) break;

        // Pick a random candidate
        const crossCell = candidates[Math.floor(Math.random() * candidates.length)];
        const crossVal = parseInt(crossCell.val);

        // Generate a new equation that CONTAINS this value
        const newEqData = generateEquation(difficulty);
        // We need to force one of the operands or result to match crossVal
        // This is hard with random generation. 
        // Strategy: Generate random equation. Check if it contains crossVal.
        // If not, maybe swap one operand with crossVal? 
        // Simple approach: Generate until we get one that has the number? (Inefficient)
        // Better: Force one operand to be crossVal.

        // Let's modify generateEquation to accept a "seed" or "mustContain"? 
        // Or just override one of the operands.
        const setOperands = [...newEqData.operands];
        // Randomly replace one operand or result?
        // Result is derived. We can't easily force result without recalculating.
        // We can force one operand.
        const replaceIdx = getRandomInt(0, setOperands.length - 1);
        setOperands[replaceIdx] = crossVal;

        // Re-calculate result
        let newFormula = `${setOperands[0]}`;
        for (let i = 0; i < newEqData.operators.length; i++) {
            newFormula += ` ${newEqData.operators[i]} ${setOperands[i + 1]}`;
        }

        let newRes;
        try {
            // eslint-disable-next-line
            newRes = new Function(`return ${newFormula}`)();
        } catch { failures++; continue; }

        if (!Number.isInteger(newRes) || newRes < 0 || newRes > DIFFICULTY_CONFIG[difficulty].maxNum * 2) {
            failures++;
            continue;
        }

        // New components
        const newComps: (string | number)[] = [];
        newComps.push(setOperands[0]);
        for (let i = 0; i < newEqData.operators.length; i++) {
            newComps.push(newEqData.operators[i]);
            newComps.push(setOperands[i + 1]);
        }
        newComps.push('=');
        newComps.push(newRes);

        // Determine where crossVal is in the new equation components
        const crossIdxInEq = newComps.findIndex(c => c === crossVal || c.toString() === crossVal.toString());
        if (crossIdxInEq === -1) { failures++; continue; }

        // Determine placement
        // If candidate flow was Horizontal, we must go Vertical.
        // We need to inspect neighbors of candidate to deduce flow?
        // Or just check if neighbors exist left/right -> Horizontal. Top/bottom -> Vertical.
        let existingDir: Direction = 'horizontal'; // Default
        if (isValid(crossCell.r, crossCell.c - 1) && grid2D[crossCell.r][crossCell.c - 1]) existingDir = 'horizontal';
        else if (isValid(crossCell.r, crossCell.c + 1) && grid2D[crossCell.r][crossCell.c + 1]) existingDir = 'horizontal';
        else if (isValid(crossCell.r - 1, crossCell.c) && grid2D[crossCell.r - 1][crossCell.c]) existingDir = 'vertical';
        else if (isValid(crossCell.r + 1, crossCell.c) && grid2D[crossCell.r + 1][crossCell.c]) existingDir = 'vertical';

        const newDir: Direction = existingDir === 'horizontal' ? 'vertical' : 'horizontal';

        // Calculate start position based on intersection index
        // If newDir Vertical: startR = crossR - idx; startC = crossC
        // If newDir Horizontal: startR = crossR; startC = crossC - idx
        let tryR = crossCell.r;
        let tryC = crossCell.c;

        if (newDir === 'vertical') {
            tryR = crossCell.r - crossIdxInEq;
        } else {
            tryC = crossCell.c - crossIdxInEq;
        }

        const eqObj: Equation = {
            formula: newFormula + " = " + newRes,
            startR: tryR,
            startC: tryC,
            direction: newDir
        };

        if (canPlace(grid2D, eqObj, newComps)) {
            placeOnGrid(grid2D, eqObj, newComps);
            placedCount++;
            failures = 0; // Reset failures on success
        } else {
            failures++;
        }
    }

    // 4. Conversion to Flat Grid & Hiding Logic
    const finalGrid: Cell[] = [];
    const pool: number[] = [];

    // Flatten
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid2D[r][c];
            if (cell) {
                // Determine hiding
                // Hide if it's a number (input/answer type)
                // Random chance based on difficulty
                const hideChance = difficulty === 'easy' ? 0.4 : difficulty === 'medium' ? 0.5 : 0.6;
                if (typeof cell.answer === 'number' && Math.random() < hideChance) {
                    // Hide it
                    pool.push(cell.answer);
                    finalGrid.push({
                        ...cell,
                        type: 'input',
                        value: undefined, // Hidden
                    });
                } else {
                    // Show it (Fixed)
                    // If it was 'input' type (number) but shown, make it 'fixed'
                    // Operators are already fixed? Wait, placeOnGrid sets operators as 'operator' and numbers as 'input'
                    // If we show a number, change type to 'fixed'
                    if (cell.type === 'input') {
                        finalGrid.push({ ...cell, type: 'fixed', value: cell.answer });
                    } else {
                        finalGrid.push(cell); // Operator
                    }
                }
            } else {
                // Empty cell
                finalGrid.push({ r, c, type: 'empty' });
            }
        }
    }

    return {
        id,
        difficulty,
        boardSize: { rows: ROWS, cols: COLS },
        grid: finalGrid,
        pool: pool.sort((a, b) => a - b), // Sorted pool
        initialLives: 3
    };
};
