'use client';

import { useGameStore } from '@/store/gameStore';
import { Heart, Coins, Settings, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
    const { level, lives, devMode, toggleDevMode } = useGameStore();

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
                        {devMode ? (
                            <span className="text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                                INF
                            </span>
                        ) : (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Heart
                                    key={i}
                                    size={20}
                                    fill={i < lives ? "currentColor" : "none"}
                                    className={cn(i >= lives && "text-zinc-300 dark:text-zinc-700")}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Dev Mode Toggle */}
                    <button
                        onClick={toggleDevMode}
                        className={cn(
                            "p-2 rounded-full transition-colors",
                            devMode
                                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                        title="Toggle Dev Mode"
                    >
                        <Bug size={20} />
                    </button>

                    {/* Debug: Force Next Level (Hidden in production ideally) */}
                    {devMode && (
                        <button
                            onClick={() => {
                                // We need access to handleNextLevel from Header?
                                // Header doesn't have it. It's in Page.
                                // We might need to move handleNextLevel to store or pass it down.
                                // For now, let's just use console or modify Page to expose it.
                                // Actually, Header is inside Home. But Header is a separate component.
                                // Let's add a 'cheatNextLevel' to store for simplicity?
                                // Or just let user play level 1 quickly.
                                // Level 1 is easy.
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"
                        >
                            {/* Icon? */}
                        </button>
                    )}

                    {/* Settings Button */}
                    <button className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
