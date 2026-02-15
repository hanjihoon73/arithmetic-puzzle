'use client';

import { useGameStore } from '@/store/gameStore';
import { useEffect } from 'react';
import Cell from './Cell';

export default function Board() {
    const { grid, level } = useGameStore();

    if (!level) return null;

    return (
        <div
            className="grid gap-2 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 w-full max-w-md"
            style={{
                gridTemplateColumns: `repeat(${level.boardSize.cols}, minmax(0, 1fr))`
            }}
        >
            {grid.map((cell, index) => (
                <Cell key={`${cell.r}-${cell.c}`} cell={cell} index={index} />
            ))}
        </div>
    );
}
