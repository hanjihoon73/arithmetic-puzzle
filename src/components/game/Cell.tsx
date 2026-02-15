'use client';

import { Cell as CellType } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

interface CellProps {
    cell: CellType;
    index: number;
}

export default function Cell({ cell, index }: CellProps) {
    const { placeNumber, status, selectedCell, selectCell } = useGameStore();

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (status !== 'playing') return;

        const dataString = e.dataTransfer.getData('application/json');
        if (dataString) {
            try {
                const data = JSON.parse(dataString);
                const { value, source } = data;

                if (source === 'pool') {
                    placeNumber(cell.r, cell.c, value);
                } else if (source && typeof source.r === 'number' && typeof source.c === 'number') {
                    // It's a move
                    // Avoid moving needed if we're same cell
                    if (source.r === cell.r && source.c === cell.c) return;

                    // We need moveNumber from store. 
                    // Since I added it to store in previous step, I can destructure it.
                    // But I need to add it to destructuring here.
                    // To do that safely without assuming it's there in this variable scope yet, 
                    // I'll grab store state directly or assume destructuring update in this file.
                    // Actually, I need to update the import/destructuring at top of component too.
                    useGameStore.getState().moveNumber(source.r, source.c, cell.r, cell.c, value);
                }
            } catch (err) {
                console.error("Failed to parse drag data", err);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const baseClasses = "w-full aspect-square flex items-center justify-center text-lg sm:text-2xl font-bold rounded-lg transition-colors border-2";

    if (cell.type === 'empty') {
        return <div className="w-full aspect-square" />; // Invisible spacer
    }

    if (cell.type === 'operator') {
        return (
            <div className={cn(baseClasses, "bg-transparent border-none text-zinc-500 dark:text-zinc-400")}>
                {cell.value}
            </div>
        );
    }

    if (cell.type === 'fixed') {
        return (
            <div className={cn(baseClasses, "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100")}>
                {cell.value}
            </div>
        );
    }

    // Input cell
    const isFilled = cell.value !== undefined;
    const isCorrect = cell.isCorrect;
    const isWrong = cell.isWrong;

    const isSelected = selectedCell?.r === cell.r && selectedCell?.c === cell.c;

    const handleDragStart = (e: React.DragEvent, val: number) => {
        const data = JSON.stringify({ value: val, source: { r: cell.r, c: cell.c } });
        e.dataTransfer.setData('application/json', data);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <motion.div
            className={cn(
                baseClasses,
                "cursor-pointer",
                isFilled ? "bg-white dark:bg-zinc-900" : "bg-zinc-100 dark:bg-zinc-800",
                isCorrect && "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-400",
                isWrong && "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-400",
                !isFilled && !isCorrect && !isWrong && "border-zinc-300 dark:border-zinc-700 border-dashed",
                isSelected && "ring-4 ring-blue-500 border-blue-500 z-10"
            )}
            onClick={() => {
                if (!isCorrect && !isWrong) {
                    selectCell(cell.r, cell.c);
                }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            draggable={isFilled && status === 'playing'}
            onDragStart={(e) => {
                if (isFilled && typeof cell.value === 'number') {
                    // Cast to unknown then DragEvent to satisfy TS if needed, logic matches
                    handleDragStart(e as unknown as React.DragEvent, cell.value);
                }
            }}
            animate={isFilled ? { scale: [0.8, 1] } : {}}
            whileHover={isFilled ? { scale: 1.05 } : {}}
            whileTap={isFilled ? { scale: 0.95 } : {}}
        >
            {cell.value}
        </motion.div>
    );
}
