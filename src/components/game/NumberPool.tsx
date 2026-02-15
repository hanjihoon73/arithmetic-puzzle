'use client';

import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function NumberPool() {
    const { pool, status, selectedNumberIndex, selectNumber, removeNumber } = useGameStore();

    const handleDragStart = (e: React.DragEvent, value: number) => {
        if (status !== 'playing') {
            e.preventDefault();
            return;
        }
        const data = JSON.stringify({ value, source: 'pool' });
        e.dataTransfer.setData('application/json', data);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.source && typeof data.source === 'object' && 'r' in data.source && 'c' in data.source) {
                // Dropped from grid -> Remove it
                removeNumber(data.source.r, data.source.c);
            }
        } catch (err) {
            console.error("Failed to parse drop data", err);
        }
    };

    return (
        <div
            className="w-full max-w-md p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 mt-4 transition-colors duration-200"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <h3 className="text-sm font-medium text-zinc-500 mb-2">Number Pool</h3>
            <div className="flex flex-wrap gap-2 justify-center min-h-[4rem]">
                {pool.map((value, index) => {
                    const isSelected = selectedNumberIndex === index;
                    return (
                        <motion.div
                            key={`${value}-${index}`}
                            draggable={status === 'playing'}
                            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, value)}
                            onClick={() => selectNumber(index, value)}
                            className={cn(
                                "w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg shadow-sm border-2 cursor-grab active:cursor-grabbing",
                                "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-300",
                                status !== 'playing' && "opacity-50 cursor-not-allowed",
                                isSelected && "ring-4 ring-blue-500 border-blue-500 z-10 scale-110"
                            )}
                            initial={{ scale: 0 }}
                            animate={{ scale: isSelected ? 1.1 : 1 }}
                            exit={{ scale: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            layout
                        >
                            {value}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
