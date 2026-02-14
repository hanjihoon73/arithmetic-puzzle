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
