'use client';

import { useGameStore } from '@/store/gameStore';
import { Heart, Coins, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
    const { level, lives } = useGameStore();

    if (!level) return null;

    return (
        <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">

                {/* Level Info */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {level.id}
                    </div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Level {level.id}</span>
                </div>

                {/* Status Icons */}
                <div className="flex items-center gap-4">
                    {/* Coins (Mocked for now) */}
                    <div className="flex items-center gap-1 text-amber-500">
                        <Coins size={20} fill="currentColor" />
                        <span className="font-medium">120</span>
                    </div>

                    {/* Lives */}
                    <div className="flex items-center gap-1 text-red-500">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Heart
                                key={i}
                                size={20}
                                fill={i < lives ? "currentColor" : "none"}
                                className={cn(i >= lives && "text-zinc-300 dark:text-zinc-700")}
                            />
                        ))}
                    </div>
                </div>

                {/* Settings Button */}
                <button className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
}
