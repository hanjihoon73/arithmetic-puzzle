'use client';

import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function NumberPool() {
    const { pool, status } = useGameStore();

    const handleDragStart = (e: React.DragEvent, value: number) => {
        if (status !== 'playing') {
            e.preventDefault();
            return;
        }
        const data = JSON.stringify({ value, source: 'pool' });
        e.dataTransfer.setData('application/json', data);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-full max-w-md p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 mt-4">
            <h3 className="text-sm font-medium text-zinc-500 mb-2">Number Pool</h3>
            <div className="flex flex-wrap gap-2 justify-center min-h-[4rem]">
                {pool.map((value, index) => (
                    <motion.div
                        key={`${value}-${index}`}
                        draggable={status === 'playing'}
                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, value)}
                        className={cn(
                            "w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg shadow-sm border-2 cursor-grab active:cursor-grabbing",
                            "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-300",
                            status !== 'playing' && "opacity-50 cursor-not-allowed"
                        )}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        layout
                    >
                        {value}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
