'use client';

import { useGameStore } from '@/store/gameStore';
import { RotateCcw, Lightbulb, Zap } from 'lucide-react';

export default function GameControls() {
    const { useHint, useSmartFill, undo, status } = useGameStore();
    const disabled = status !== 'playing';

    return (
        <div className="flex gap-4 mt-6">
            {/* Undo Button - functionality not fully implemented in store yet but button exists */}
            {/* <button
        onClick={undo}
        disabled={disabled}
        className="flex flex-col items-center gap-1 text-zinc-600 dark:text-zinc-400 disabled:opacity-50"
      >
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
          <RotateCcw size={24} />
        </div>
        <span className="text-xs font-medium">Undo</span>
      </button> */}

            <button
                onClick={useHint}
                disabled={disabled}
                className="flex flex-col items-center gap-1 text-amber-600 dark:text-amber-400 disabled:opacity-50 active:scale-95 transition-transform"
            >
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Lightbulb size={24} />
                </div>
                <span className="text-xs font-medium">Hint</span>
            </button>

            <button
                onClick={useSmartFill}
                disabled={disabled}
                className="flex flex-col items-center gap-1 text-purple-600 dark:text-purple-400 disabled:opacity-50 active:scale-95 transition-transform"
            >
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Zap size={24} />
                </div>
                <span className="text-xs font-medium">Smart Fill</span>
            </button>
        </div>
    );
}
